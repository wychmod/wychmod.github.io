#!/usr/bin/env node
/**
 * 扫描 docs/ 下所有 Markdown、HTML 和导航文件中的链接，报告死链。
 * 会自动跳过代码块、行内代码和资源文件，并剥离 URL 查询参数。
 * 用法：node scripts/check-links.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.resolve(__dirname, '..', 'docs');
const EXCLUDE_DIRS = ['.obsidian', '.qoder', '.trae', '_media', 'assets', 'youdaonote-images', 'tools'];

const results = {
  ok: [],
  dead: [],
  external: [],
  anchors: []
};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry)) continue;
      walk(full, files);
    } else if (/\.(md|html)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function stripCodeBlocks(text) {
  // Remove fenced code blocks (``` ... ```) and inline code (`...`)
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
}

function resolveLink(rawLink, fromFile) {
  let link;
  try {
    link = decodeURIComponent(rawLink);
  } catch {
    link = rawLink;
  }

  // Docsify hash routes
  if (link.startsWith('#!/') || link.startsWith('#/')) {
    link = link.slice(link.indexOf('/') + 1);
  }

  // Strip query string
  const qIndex = link.indexOf('?');
  if (qIndex !== -1) link = link.slice(0, qIndex);

  // Strip anchor
  const hashIndex = link.indexOf('#');
  if (hashIndex !== -1) {
    results.anchors.push({ link: rawLink, from: path.relative(DOCS_ROOT, fromFile) });
    link = link.slice(0, hashIndex);
  }
  if (!link) return null;

  if (/^(https?:|mailto:|data:|\/\/|tel:)/i.test(link)) return { type: 'external' };

  const fromDir = path.dirname(fromFile);
  let target = path.isAbsolute(link)
    ? path.resolve(DOCS_ROOT, link.slice(1))
    : path.resolve(fromDir, link);

  // Docsify convention: routes like /README or /AI-ASSISTANT-GUIDE map to .md files
  let exists = fs.existsSync(target);
  if (!exists && !path.extname(target)) {
    const withMd = target + '.md';
    if (fs.existsSync(withMd)) {
      target = withMd;
      exists = true;
    }
  }

  return { type: 'internal', target, exists };
}

function extractLinks(text, fromFile) {
  const cleanText = stripCodeBlocks(text);
  const mdRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const htmlRegex = /href=["']([^"']+)["']/g;

  const links = [];
  let m;
  while ((m = mdRegex.exec(cleanText)) !== null) {
    let url = m[2].trim();
    if (url.startsWith('<') && url.endsWith('>')) {
      url = url.slice(1, -1);
    }
    links.push(url);
  }
  while ((m = htmlRegex.exec(cleanText)) !== null) {
    links.push(m[1]);
  }
  return links;
}

function main() {
  const files = walk(DOCS_ROOT);

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(text, file);
    for (const raw of links) {
      if (/\.(png|jpg|jpeg|gif|svg|webp|ico|mp4|mp3)$/i.test(raw)) continue;
      if (raw.startsWith('#') || raw.startsWith('javascript:') || raw.startsWith('tel:') || raw.trim() === '') continue;

      const resolved = resolveLink(raw, file);
      if (!resolved) continue;

      const fromRel = path.relative(DOCS_ROOT, file);
      if (resolved.type === 'external') {
        results.external.push({ link: raw, from: fromRel });
      } else if (resolved.exists) {
        results.ok.push({ link: raw, from: fromRel });
      } else {
        results.dead.push({ link: raw, from: fromRel });
      }
    }
  }

  console.log(`扫描文件数：${files.length}`);
  console.log(`有效内部链接：${results.ok.length}`);
  console.log(`外部链接：${results.external.length}`);
  console.log(`锚点链接：${results.anchors.length}`);
  console.log(`死链：${results.dead.length}`);

  if (results.dead.length) {
    console.log('\n死链列表：');
    for (const d of results.dead) {
      console.log(`  [X] ${d.from} -> ${d.link}`);
    }
    process.exit(1);
  } else {
    console.log('\n✅ 无死链');
  }
}

main();
