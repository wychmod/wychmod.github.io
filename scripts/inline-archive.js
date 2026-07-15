#!/usr/bin/env node
/**
 * 将小归档的 Markdown 全文插入主线文档末尾，并自动修正图片相对路径。
 * 用法：node scripts/inline-archive.js <main-doc> <archive-dir>
 * 示例：node scripts/inline-archive.js docs/md/01-计算机基础/40-Go语言.md docs/md/archive/old-go-notes
 */

const fs = require('fs');
const path = require('path');

function usage() {
  console.log('用法：node scripts/inline-archive.js <main-doc> <archive-dir>');
  process.exit(1);
}

function collectMdFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectMdFiles(full));
    } else if (entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function fixImagePaths(text, archiveDir, mainDoc) {
  const archiveDirAbs = path.resolve(archiveDir);
  const mainDocDirAbs = path.resolve(path.dirname(mainDoc));

  // 计算从 mainDoc 目录到 archiveDir 的相对路径
  let relToArchive = path.relative(mainDocDirAbs, archiveDirAbs).replace(/\\/g, '/');
  if (!relToArchive.startsWith('.')) relToArchive = './' + relToArchive;

  // 处理 ![alt](path) 中的相对路径
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    if (/^(https?:|data:)/i.test(url)) return match;
    if (path.isAbsolute(url)) return match;
    // 如果是以 ../youdaonote-images/ 开头的共享图片，统一指向 ../archive/youdaonote-images/
    if (url.includes('youdaonote-images')) {
      return `![${alt}](../archive/youdaonote-images/${path.basename(url)})`;
    }
    // 否则相对于 archiveDir 解析
    const resolved = path.posix.join(relToArchive, url).replace(/\\/g, '/');
    return `![${alt}](${resolved})`;
  });
}

function main() {
  const [mainDoc, archiveDir] = process.argv.slice(2);
  if (!mainDoc || !archiveDir) usage();

  if (!fs.existsSync(mainDoc)) {
    console.error(`主线文档不存在：${mainDoc}`);
    process.exit(1);
  }
  if (!fs.existsSync(archiveDir)) {
    console.error(`归档目录不存在：${archiveDir}`);
    process.exit(1);
  }

  const mdFiles = collectMdFiles(archiveDir).sort();
  const totalSize = mdFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);

  console.log(`归档文件数：${mdFiles.length}`);
  console.log(`归档总大小：${(totalSize / 1024).toFixed(1)} KB`);

  if (mdFiles.length > 5 || totalSize > 500 * 1024) {
    console.log('归档较大，建议只放链接，不内联。');
    process.exit(0);
  }

  let inlineContent = '\n\n---\n\n# 以下为原内容存档\n\n';
  inlineContent += '> 以下内容为原始归档文件的完整保留，仅修正图片相对路径，文字原貌不变。\n\n';

  for (const file of mdFiles) {
    const fileName = path.basename(file);
    const raw = fs.readFileSync(file, 'utf-8');
    const fixed = fixImagePaths(raw, archiveDir, mainDoc);
    inlineContent += `## ${fileName}\n\n${fixed}\n\n`;
  }

  const original = fs.readFileSync(mainDoc, 'utf-8');
  fs.writeFileSync(mainDoc, original + inlineContent, 'utf-8');
  console.log(`已内联到：${mainDoc}`);
}

main();
