#!/usr/bin/env node
// 智能修正所有主线文档中指向归档目录的相对路径，使其正确指向 docs/md/archive/。

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.resolve(__dirname, '..', 'docs');
const ARCHIVE_BASE = path.join(DOCS_ROOT, 'md', 'archive');
const MD_ROOT = path.join(DOCS_ROOT, 'md');

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
  let total = 0;

  for (const file of files) {
    const fromDir = path.dirname(file);
    let relToArchive = path.relative(fromDir, ARCHIVE_BASE).replace(/\\/g, '/');
    if (!relToArchive.endsWith('/')) relToArchive += '/';
    if (!relToArchive.startsWith('.')) relToArchive = './' + relToArchive;

    let text = fs.readFileSync(file, 'utf-8');
    const orig = text;

    // Replace any ../.../archive/ prefix with the correct relative path
    text = text.replace(/(?:\.\.\/)+archive\//g, (match) => {
      total++;
      return relToArchive;
    });

    if (text !== orig) {
      fs.writeFileSync(file, text, 'utf-8');
      fixedFiles++;
      console.log(`已修正：${path.relative(process.cwd(), file)} -> ${relToArchive}`);
    }
  }

  console.log(`\n共修正 ${fixedFiles} 个文件，${total} 处路径。`);
}

main();
