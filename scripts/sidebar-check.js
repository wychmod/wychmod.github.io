#!/usr/bin/env node
// 检查 docs/md/**/*.md 是否都在 docs/_sidebar.md 中有入口。
// 用法：node scripts/sidebar-check.js

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.resolve(__dirname, '..', 'docs');
const MD_ROOT = path.join(DOCS_ROOT, 'md');
const SIDEBAR_FILE = path.join(DOCS_ROOT, '_sidebar.md');

const EXCLUDE_DIRS = ['archive', '.obsidian'];
const EXCLUDE_FILES = ['Index.md'];

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
  const sidebarText = fs.readFileSync(SIDEBAR_FILE, 'utf-8');
  const allMd = walkMd(MD_ROOT);

  const missing = [];
  const ok = [];

  for (const full of allMd) {
    const rel = path.relative(MD_ROOT, full).replace(/\\/g, '/');
    const fileName = path.basename(rel);
    if (EXCLUDE_FILES.includes(fileName)) continue;

    // 检查 sidebar 中是否引用了该文件（按相对路径或文件名匹配）
    const patterns = [
      rel,
      rel.replace(/\.md$/, ''),
      fileName,
      fileName.replace(/\.md$/, '')
    ];
    const found = patterns.some(p => sidebarText.includes(p));
    if (found) {
      ok.push(rel);
    } else {
      missing.push(rel);
    }
  }

  console.log(`主线文档总数：${allMd.length}`);
  console.log(`已在侧边栏：${ok.length}`);
  console.log(`缺失入口：${missing.length}`);

  if (missing.length) {
    console.log('\n缺失侧边栏入口的文件：');
    for (const m of missing) {
      console.log(`  [X] ${m}`);
    }
    process.exit(1);
  } else {
    console.log('\n✅ 所有主线文档都有侧边栏入口');
  }
}

main();
