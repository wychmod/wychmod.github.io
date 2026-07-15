#!/usr/bin/env node
/**
 * 批量修正主线文档中指向归档目录的相对路径。
 * 把 ../../archive/ 替换为 ../archive/（因为主线文档在 docs/md/XX-分类/ 下，归档在 docs/md/archive/）。
 * 用法：node scripts/fix-archive-links.js
 */

const fs = require('fs');
const path = require('path');

const MD_ROOT = path.resolve(__dirname, '..', 'docs', 'md');
const EXCLUDE_DIRS = ['archive', '.obsidian'];

function walkMd(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry)) continue;
      walkMd(full, files);
    } else if (entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  const files = walkMd(MD_ROOT);
  let fixedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    let text = fs.readFileSync(file, 'utf-8');
    const original = text;

    // 修正归档目录路径：../../archive/ -> ../archive/
    text = text.replace(/\.\.\/\.\.\/archive\//g, '../archive/');

    if (text !== original) {
      fs.writeFileSync(file, text, 'utf-8');
      fixedFiles++;
      const count = (original.match(/\.\.\/\.\.\/archive\//g) || []).length;
      totalReplacements += count;
      console.log(`已修正：${path.relative(MD_ROOT, file)}（${count} 处）`);
    }
  }

  console.log(`\n共修正 ${fixedFiles} 个文件，${totalReplacements} 处路径。`);
}

main();
