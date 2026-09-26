#!/usr/bin/env node
/**
 * build-prism-bundle.js — 生成 Prism 语法组件合并包
 *
 * 背景
 *   index.html 原先逐个 <script> 加载 16 个 Prism 语法组件(+ 1 个别名文件),
 *   串行 16 次请求。合并为单文件后请求数降为 1, 且不改变注册语义。
 *
 * 用法
 *   node scripts/build-prism-bundle.js
 *
 * 输出
 *   docs/assets/js/prism-langs.bundle.js
 *
 * 约束
 *   1. 合并顺序必须与 index.html 原加载顺序一致 —— Prism 组件之间存在隐式
 *      依赖(如 jsx 依赖 javascript、别名文件必须在组件之后), 顺序错了会静默失效。
 *   2. 组件文件之间以 ";" + 换行 分隔, 避免个别文件缺尾分号导致语法粘连。
 *   3. 合并包由本脚本生成, 不要手工编辑 prism-langs.bundle.js。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const JS_DIR = path.resolve(__dirname, '..', 'docs', 'assets', 'js');
const OUT_NAME = 'prism-langs.bundle.js';

/* 顺序 = 原 index.html 加载顺序, 勿随意调整 */
const ORDER = [
  'prism-bash.js',
  'prism-java.min.js',
  'prism-python.min.js',
  'prism-sql.min.js',
  'prism-yaml.min.js',
  'prism-json.min.js',
  'prism-c.min.js',
  'prism-go.min.js',
  'prism-jsx.min.js',
  'prism-properties.min.js',
  'prism-lua.min.js',
  'prism-powershell.min.js',
  'prism-ini.min.js',
  'prism-docker.min.js',
  'prism-nginx.min.js',
  'prism-vim.min.js',
  'prism-aliases.js'
];

function main() {
  const missing = ORDER.filter((f) => !fs.existsSync(path.join(JS_DIR, f)));
  if (missing.length) {
    console.error('缺少源文件: ' + missing.join(', '));
    process.exit(1);
  }

  const banner = [
    '/*!',
    ' * prism-langs.bundle.js — Prism 语法组件合并包 (自动生成, 请勿手改)',
    ' * 生成脚本: scripts/build-prism-bundle.js',
    ' * 合并顺序即注册顺序, 改动后必须重跑生成脚本。',
    ' * 覆盖语言: ' + ORDER.filter((f) => f !== 'prism-aliases.js').map((f) => f.replace(/^prism-/, '').replace(/\.min\.js$|\.js$/, '')).join('/'),
    ' *           + prism-aliases.js 提供的别名层(大小写变体与近似映射)。',
    ' */',
    ''
  ].join('\n');

  const body = ORDER.map((f) => {
    const src = fs.readFileSync(path.join(JS_DIR, f), 'utf8').trim();
    return '/* ===== ' + f + ' ===== */\n' + src;
  }).join('\n;\n');

  const out = banner + body + '\n';
  const outPath = path.join(JS_DIR, OUT_NAME);
  fs.writeFileSync(outPath, out, 'utf8');

  const parts = ORDER.map((f) => fs.statSync(path.join(JS_DIR, f)).size);
  const srcTotal = parts.reduce((a, b) => a + b, 0);
  console.log('已生成 ' + path.relative(path.resolve(__dirname, '..'), outPath));
  console.log('  源文件 ' + ORDER.length + ' 个, 合计 ' + (srcTotal / 1024).toFixed(1) + ' KB');
  console.log('  输出 ' + (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1) + ' KB (请求数 16 → 1)');
}

main();
