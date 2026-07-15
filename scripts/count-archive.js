#!/usr/bin/env node
/**
 * 统计归档目录下的 Markdown 文件数和总大小，辅助"内联 vs 链接"判定。
 * 用法：node scripts/count-archive.js <archive-dir>
 */

const fs = require('fs');
const path = require('path');

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

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.log('用法：node scripts/count-archive.js <archive-dir>');
    process.exit(1);
  }
  if (!fs.existsSync(dir)) {
    console.error(`目录不存在：${dir}`);
    process.exit(1);
  }

  const files = collectMdFiles(dir).sort();
  const totalSize = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);

  console.log(`归档目录：${dir}`);
  console.log(`Markdown 文件数：${files.length}`);
  console.log(`总大小：${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`建议：${files.length <= 5 && totalSize < 500 * 1024 ? '可内联到主线文档' : '只放链接，不内联'}`);
  console.log('\n文件列表：');
  for (const f of files) {
    console.log(`  - ${path.relative(dir, f)} (${(fs.statSync(f).size / 1024).toFixed(1)} KB)`);
  }
}

main();
