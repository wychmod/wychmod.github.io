#!/usr/bin/env node
// 修正 AI 与开发工具文档中过深的归档相对路径：../../../archive/ -> ../../archive/

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  path.resolve(__dirname, '..', 'docs', 'md', '05-AI与Agent'),
  path.resolve(__dirname, '..', 'docs', 'md', '09-开发工具')
];

function walkMd(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkMd(full, files);
    } else if (entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  let fixedFiles = 0;
  let total = 0;
  for (const dir of TARGET_DIRS) {
    for (const file of walkMd(dir)) {
      let text = fs.readFileSync(file, 'utf-8');
      const orig = text;
      text = text.replace(/\.\.\/\.\.\/\.\.\/archive\//g, '../../archive/');
      if (text !== orig) {
        fs.writeFileSync(file, text, 'utf-8');
        fixedFiles++;
        total += (orig.match(/\.\.\/\.\.\/\.\.\/archive\//g) || []).length;
        console.log(`已修正：${path.relative(process.cwd(), file)}`);
      }
    }
  }
  console.log(`\n共修正 ${fixedFiles} 个文件，${total} 处路径。`);
}

main();
