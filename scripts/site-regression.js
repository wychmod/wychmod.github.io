#!/usr/bin/env node
/**
 * site-regression.js — 全站回归验收
 *
 * 用途
 *   站点级改动（index.html / shell / 页面层 CSS / 核心 JS）交付前的统一自检，
 *   把「横向溢出、运行时异常、资源失败、功能不回归、对比度、无障碍」一次性跑完。
 *   与 typography-check.js（文章排版细节）、screenshot-mobile.js（截图留档）互补。
 *
 * 前置
 *   1. 启动本地预览（两种都可，注意必须是**目录形式**的地址）：
 *        npx docsify-cli serve docs --port 3000
 *        或  cd docs && python -m http.server 3000
 *   2. 安装 Playwright（项目 node_modules 内已有）
 *
 * 用法
 *   node scripts/site-regression.js
 *   SITE_BASE=http://127.0.0.1:8788/ node scripts/site-regression.js
 *   node scripts/site-regression.js --no-viewports   # 跳过 8 档视口扫描，只跑功能断言
 *
 * 退出码
 *   0 = 全部通过；1 = 存在 FAIL（可直接用于 CI 门禁）
 *
 * 已知「非缺陷」噪声（脚本已主动过滤，不要误当回归）
 *   · md/**\/_sidebar.md 404 —— docsify 多级侧栏的固有探测机制
 *   · fonts.gstatic.com —— docsify 主题自带的 Roboto Mono，国内不可达
 *   · note.youdao.com —— 正文内嵌的失效外链图床（部分文档已在正文内自行声明）
 *   · api.github.com 403 —— GitHub 未认证限流 60 次/小时/IP，站点已显式降级
 *   注意：这些噪声多数以「资源加载失败」形式上报，而 Chromium 的对应 console
 *   文本不含 URL，故 instrument() 必须从 console.location() 补回地址才能过滤。
 *
 * 刻意不判定的项（避免把设计决策当成缺陷）
 *   · --studio-gold 装饰层：金色序号 / 引号 / 当前项标记，是设计签名，非缺陷
 *   · --studio-paper-line 作分隔符文字色（"/" "·"）：纯装饰标点，不承载信息
 *   · 工具页 .ts-skip-link：跳转链接常态视觉隐藏（left:-9999px），聚焦时归位且
 *     为深底浅字；屏外测得的 1.18:1 是探针假象，非缺陷
 *
 * 已知且已评估、不修的一项
 *   · md/**\/_sidebar.md 404 —— docsify 自下而上逐级探测侧栏的固有代价。
 *     实测 _renderSidebar 的降级链要求「请求失败」才回退到上一级，
 *     因此**补空文件会让侧栏被清空且停止回退，反而废掉导航**；
 *     唯一可行的拦截点是劫持 router.getFile，侵入实现、升级即碎。
 *     该 404 仅在首次进入某目录时产生且不阻塞渲染，故保留。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = (process.env.SITE_BASE || 'http://localhost:3000/').replace(/\/?$/, '/');
const SKIP_VIEWPORTS = process.argv.includes('--no-viewports');
const DOCS_DIR = path.resolve(__dirname, '..', 'docs');

/* ---------- 页面清单 ----------
   allow404: 该路径本身就是用来触发 docsify notFoundPage 的, 文档 404 属预期
   noise:    本页特有的预期噪声正则（与其自身 not-found 路径绑定） */
const PAGES = [
  { name: '首页', path: '#/', sweep: true },
  { name: '文章页(Java)', path: '#/md/01-计算机基础/00-Java与JVM', sweep: true },
  { name: '文章页(mermaid)', path: '#/md/05-AI与Agent/10-Agent设计模式与多Agent', sweep: true },
  { name: '文章页(大写栅栏)', path: '#/md/05-AI与Agent/50-ML与DL基础', sweep: true },
  { name: '全站地图', path: '#/md/Index', sweep: true },
  { name: '关于页', path: 'me.html', sweep: true },
  { name: '简历页', path: 'resume.html', sweep: true },
  { name: '工具集', path: 'tools/index.html', sweep: true },
  { name: '简历生成器', path: 'tools/resume-builder.html' },
  { name: '404 页', path: '#/this-page-does-not-exist', allow404: true, noise: [/this-page-does-not-exist/] }
];

const VIEWPORTS = [320, 360, 390, 768, 1024, 1280, 1600, 2560];

/* 对比度目标。
   hover: true → 先悬停再取值: 悬停态同样受 WCAG AA 约束, 而本站历史上多次出现
   「常态已修、悬停态仍漏」的情况（如 .home-section-more:hover 曾为 2.92:1）。
   渐变/纹理背景不可判定时由探针内部跳过, 不计 FAIL。 */
const CONTRAST_TARGETS = [
  { page: '首页', sel: '.home-footer-copy' },
  { page: '首页', sel: '.home-footer-contact-text' },
  { page: '首页', sel: '.home-footer-star' },
  { page: '首页', sel: '.home-section-more' },
  { page: '首页', sel: '.home-section-more', hover: true },
  { page: '首页', sel: '.nav-cta' },
  { page: '全站地图', sel: '.sm-quick-name' },
  { page: '全站地图', sel: '.sm-path-current' },
  { page: '关于页', sel: '.me-btn-primary' },
  { page: '简历页', sel: '.me-btn.me-btn-primary' },
  { page: '文章页(Java)', sel: '.toc-nav .page_toc > div:not(.active) > a > span' },
  { page: '工具集', sel: '.ti-tool-row__open' },
  { page: '工具集', sel: '.ti-tool-row__priv' },
  { page: '工具集', sel: '.ts-foot__link', hover: true },
  { page: '简历生成器', sel: '.is-placeholder' }
];

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  const tag = ok ? '[PASS] ' : '[FAIL] ';
  console.log(tag + name + (detail ? '  — ' + detail : ''));
}

/* ---------- 已知噪声 ----------
   注意参数 s 可能是「裸 URL」，也可能是「URL + 状态文本」拼成的串（两种拼法都存在），
   所以既要按域名匹配，也要能把状态码一起看上。 */
const noiseRules = [
  /_sidebar\.md/,          // docsify 多级侧栏的固有向上探测，404 是机制本身
  /fonts\.gstatic\.com/,   // docsify 主题自带的 Roboto Mono，国内不可达
  /note\.youdao\.com/,     // 正文内嵌的失效图床
  /hm\.baidu\.com/         // 百度统计，本地预览常被网络策略拦
];
/* api.github.com：REST 未认证配额 60 次/小时/IP，me.html 每次加载消耗 2 次，打满即 403。
   这是外部配额而非站点缺陷 —— 站点已对该失败做显式降级
   （静态快照图 + personal-github-fallback 文案，实测页面无任何原始报错）。
   因此「403」与「网络层失败」都算噪声；但 404/500 说明端点或代码真的坏了，仍要报出来。 */
const API_GH = /api\.github\.com/;
const isNoise = (s) =>
  noiseRules.some((re) => re.test(s)) ||
  (API_GH.test(s) && (/403/.test(s) || /^FAILED /.test(s)));

/* 在页面内收集控制台错误与失败请求。
   extraNoise: 本页特有的预期噪声（如 404 测试页自身的 not-found 请求） */
function instrument(page, extraNoise) {
  const noise = (s) => isNoise(s) || (extraNoise || []).some((re) => re.test(s));
  const errors = [];
  const failed = [];
  /* 关键：Chromium 对资源加载失败的 console 文本是固定句式
     "Failed to load resource: the server responded with a status of 404 (File not found)"
     —— 其中**不含资源 URL**。若直接用它做过滤，按 URL 匹配的 isNoise 永远命中不了，
     于是 _sidebar.md / 图床 这类已知噪声会全部误报成 FAIL。
     实测 m.location().url 即失败资源地址，把它拼回文本前缀，过滤才真正生效。 */
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = (m.location() && m.location().url) || '';
    errors.push(url ? url + ' → ' + m.text() : m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  /* 把状态码与 URL 一起交给判定：只给裸 URL 时，形如「403 限流」的规则无从匹配 */
  page.on('response', (r) => {
    if (r.status() < 400) return;
    const s = r.status() + ' ' + r.url();
    if (!noise(s)) failed.push(s);
  });
  page.on('requestfailed', (r) => { if (!noise('FAILED ' + r.url())) failed.push('FAILED ' + r.url()); });
  return { errors: () => errors.filter((e) => !noise(e)), failed: () => failed };
}

/* 页面内通用的「溢出元素」探针（排除自身可滚动的容器） */
const OVERFLOW_PROBE = () => {
  const bad = [];
  const doc = document.documentElement;
  const rootOverflow = doc.scrollWidth - doc.clientWidth;
  if (rootOverflow > 1) {
    const all = document.querySelectorAll('body *');
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const overflows = r.right > doc.clientWidth + 1;
      // 自身或 3 层内祖先可滚动/裁切 → 已受控，不算溢出
      let contained = false;
      let p = el;
      for (let i = 0; i < 3 && p; i++) {
        const pcs = getComputedStyle(p);
        if (['auto', 'scroll', 'hidden', 'clip'].includes(pcs.overflowX)) { contained = true; break; }
        p = p.parentElement;
      }
      if (overflows && !contained) {
        bad.push({ sel: el.className || el.tagName, right: Math.round(r.right), cls: cs.overflowX });
        if (bad.length >= 5) break;
      }
    }
  }
  return { rootOverflow, bad };
};

/* 相对亮度对比度；返回 null 表示无法判定（渐变/透明背景） */
const CONTRAST_PROBE = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return { missing: true };
  const parse = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const cs = getComputedStyle(el);
  const fg = parse(cs.color);
  if (!fg) return { unknown: 'color=' + cs.color };

  // 向上找第一个不透明 background-color；途中遇到渐变图则判定不可测
  let node = el, bg = null, gradient = false;
  while (node && node !== document.documentElement) {
    const ncs = getComputedStyle(node);
    if (ncs.backgroundImage && ncs.backgroundImage !== 'none') gradient = true;
    const c = parse(ncs.backgroundColor);
    if (c && c.a === 1) { bg = c; break; }
    if (c && c.a > 0 && !bg) bg = c;   // 半透明底：先记住，继续往上找
    node = node.parentElement;
  }
  if (!bg || bg.a !== 1 || gradient) return { unknown: gradient ? '上级存在渐变背景' : '无实色背景' };
  const size = parseFloat(cs.fontSize);
  const bold = parseInt(cs.fontWeight, 10) >= 700;
  const large = size >= 24 || (size >= 18.66 && bold);
  return { ratio: ratio(fg, bg), need: large ? 3 : 4.5, size, fg: cs.color, bg: cs.backgroundColor };
};

(async () => {
  console.log('站点基址: ' + BASE + '\n');
  const browser = await chromium.launch();

  /* ============ 1. 多视口横向溢出 ============ */
  if (!SKIP_VIEWPORTS) {
    console.log('— 多视口横向溢出 —');
    const sweepPages = PAGES.filter((p) => p.sweep);
    for (const w of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: w <= 768, hasTouch: w <= 768 });
      const page = await ctx.newPage();
      const bad = [];
      for (const p of sweepPages) {
        await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(p.path.startsWith('#/') ? 1500 : 700);
        const r = await page.evaluate(OVERFLOW_PROBE);
        if (r.rootOverflow > 1 || r.bad.length) bad.push(p.name + '(root=' + r.rootOverflow + (r.bad.length ? ', ' + JSON.stringify(r.bad) : '') + ')');
      }
      check(w + 'px 无横向溢出', bad.length === 0, bad.length ? bad.join(' | ') : sweepPages.length + ' 个页面');
      await ctx.close();
    }
  }

  /* ============ 2. 运行时异常与资源失败 ============ */
  console.log('\n— 运行时异常与资源失败 —');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const p of PAGES) {
      const page = await ctx.newPage();
      const ins = instrument(page, p.noise);
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(p.path.startsWith('#/') ? 2200 : 1200);
      const e = ins.errors();
      const f = p.allow404 ? [] : ins.failed();
      check(p.name + (p.allow404 ? ' 无运行时异常' : ' 无异常/失败请求'), e.length === 0 && f.length === 0,
        ((e.length ? 'ERR: ' + e.slice(0, 2).join(' | ') : '') + (f.length ? ' FAILED: ' + f.slice(0, 2).join(' | ') : '')) || 'ok');
      await page.close();
    }
    await ctx.close();
  }

  /* ============ 3. 文章页功能 ============ */
  console.log('\n— 文章页功能 —');
  {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const page = await ctx.newPage();
    const ins = instrument(page);

    await page.goto(BASE + PAGES[1].path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    const art = await page.evaluate(() => {
      const blocks = Array.from(document.querySelectorAll('pre > code'));
      const SKIP = ['text', 'mermaid', 'undefined', 'md', 'markdown', 'plaintext', 'lang-', ''];
      const unhighlighted = [];
      blocks.forEach((el) => {
        const m = /(?:lang|language)-([^\s]+)/.exec(el.className);
        const lang = m ? m[1] : '';
        if (SKIP.includes(lang)) return;
        if (el.textContent.trim().length === 0) return;
        if (el.querySelectorAll('.token').length === 0) unhighlighted.push(lang);
      });
      return {
        codeBlocks: blocks.length,
        copyButtons: document.querySelectorAll('.docsify-copy-code-button').length,
        unhighlighted: Array.from(new Set(unhighlighted)),
        tocLinks: document.querySelectorAll('.toc-nav a').length,
        articleMaxW: getComputedStyle(document.querySelector('article.markdown-section') || document.querySelector('#main')).maxWidth,
        prismKeys: Object.keys((window.Prism && window.Prism.languages) || {}).length
      };
    });
    check('代码块全部高亮', art.unhighlighted.length === 0, art.codeBlocks + ' 块, Prism ' + art.prismKeys + ' 语言' + (art.unhighlighted.length ? ', 未高亮: ' + art.unhighlighted.join(',') : ''));
    check('复制按钮覆盖全部代码块', art.copyButtons === art.codeBlocks, art.copyButtons + '/' + art.codeBlocks);
    check('侧栏 TOC 生成', art.tocLinks > 0, art.tocLinks + ' 条');

    // 终端开合
    await page.click('#terminal-trigger');
    await page.waitForTimeout(400);
    const opened = await page.evaluate(() => {
      const w = document.getElementById('terminal-window');
      const a = document.getElementById('terminal-trigger');
      return { visible: w ? getComputedStyle(w).display !== 'none' : false, expanded: a ? a.getAttribute('aria-expanded') : null, focused: document.activeElement ? document.activeElement.id : null };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const closed = await page.evaluate(() => {
      const w = document.getElementById('terminal-window');
      return { visible: w ? getComputedStyle(w).display !== 'none' : false, focused: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null };
    });
    check('终端可开可关且 aria 同步', opened.visible && opened.expanded === 'true' && !closed.visible,
      'open=' + opened.visible + ' aria=' + opened.expanded + ' focus回=' + closed.focused);

    // mermaid
    // 注意: 固定等待对线上不够 —— mermaid 10.9.3 的 ESM 会拉 15+ 个分包,
    // 线上首访可达数秒。故改为「轮询直到渲染完成或超时」, 避免把慢误报成失败。
    await page.goto(BASE + PAGES[2].path, { waitUntil: 'domcontentloaded' });
    const mmProbe = () => ({
      containers: document.querySelectorAll('.mermaid').length,
      svgs: document.querySelectorAll('svg[id^="mermaid"], .mermaid svg').length,
      leftoverPre: document.querySelectorAll('pre[data-lang="mermaid"]').length
    });
    let mm = await page.evaluate(mmProbe);
    for (let i = 0; i < 30 && !(mm.containers > 0 && mm.svgs === mm.containers); i++) {
      await page.waitForTimeout(1000);
      mm = await page.evaluate(mmProbe);
    }
    check('mermaid 全部渲染', mm.containers > 0 && mm.svgs === mm.containers && mm.leftoverPre === 0,
      mm.svgs + '/' + mm.containers + ' SVG, 残留 pre=' + mm.leftoverPre);

    // mermaid 按需加载：无图表页不应请求 ESM 包（用已确认无 mermaid 容器的大写栅栏页）
    const p2 = await ctx.newPage();
    let esmRequested = false;
    p2.on('request', (r) => { if (/mermaid\.esm\.min\.mjs/.test(r.url())) esmRequested = true; });
    await p2.goto(BASE + PAGES[3].path, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(3000);
    check('无图表页不加载 mermaid 本体', !esmRequested);
    await p2.close();

    const e = ins.errors();
    check('文章页无运行时异常', e.length === 0, e.slice(0, 2).join(' | ') || 'ok');
    await ctx.close();
  }

  /* ============ 3b. 栅栏语言覆盖 ============
     静态扫描全部主线 markdown 的栅栏标记, 与浏览器里 Prism.languages 的注册键比对。
     分三类:
       a) 语言名不像标识符(含中文/标点) —— 一定是写坏的栅栏, 必须修
       b) 语言键未注册且不是刻意纯文本 —— 会静默不着色, 需在 prism-aliases 补一行
       c) 其余 —— 正常
     历史教训: 早先只校验 1 篇文章的 6 个代码块就断言「全部高亮」, 而全站实际
     用到 60+ 种语言标记, 覆盖严重不足; 且不能用「token 数为 0」当判据 ——
     单行 `kubectl get pod` 语法上本就没有可高亮元素, 但那不代表语言不支持。 */
  console.log('\n— 栅栏语言覆盖 —');
  {
    const mdRoot = path.join(DOCS_DIR, 'md');
    const files = [];
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) { if (e.name !== 'archive') walk(p); }   /* archive 只读, 不纳入 */
        else if (e.name.endsWith('.md')) files.push(p);
      }
    })(mdRoot);

    const used = new Map();   /* lang -> 出现次数 */
    const malformed = [];     /* 语言名不像标识符 */
    const FENCE = /^```([^\s`]*)/gm;
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      let m;
      while ((m = FENCE.exec(src))) {
        const lang = m[1];
        if (!lang) continue;                       /* 无语言标记, 合法(纯文本) */
        const rel = path.relative(DOCS_DIR, f).replace(/\\/g, '/');
        if (!/^[A-Za-z][\w+#.-]*$/.test(lang)) { malformed.push(rel + '  ```' + lang); continue; }
        used.set(lang, (used.get(lang) || 0) + 1);
      }
    }
    check('栅栏语言名格式合法', malformed.length === 0,
      malformed.length ? malformed.slice(0, 4).join(' | ') : used.size + ' 种语言标记, ' + files.length + ' 篇文档');

    /* 拿运行时语言表：任一文章页均可 */
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + PAGES[1].path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2600);
    const keys = await page.evaluate(() => Object.keys((window.Prism && window.Prism.languages) || {}));
    await ctx.close();

    /* text 是 Prism 的「纯文本」占位, 本就不该着色 */
    const PLAIN = new Set(['text', 'plain', 'plaintext', 'none', 'markdown', 'md', 'mermaid']);
    const missing = [...used.keys()].filter((l) => !keys.includes(l) && !PLAIN.has(l)).sort();
    check('栅栏语言全部已在 Prism 注册', missing.length === 0,
      missing.length ? '未注册: ' + missing.join(', ') + '（在 prism-aliases.js 补 alias）'
        : used.size + ' 种全部命中, Prism 共 ' + keys.length + ' 键');
  }

  /* ============ 3c. 图片引用健康度（静态） ============
     全站 1700+ 处图片引用, 靠人眼看不出问题, 但两类错法必然导致破图:
       a) 本地相对路径不存在 —— 文件被删/路径写错
       b) URL 畸形（如 `https:////host/...` 四斜杠）—— 浏览器与 curl 都直接失败
     注: 已显式标注「图片源已丢失」的引用属有意保留, 不计入缺失。 */
  console.log('\n— 图片引用健康度 —');
  {
    const mdRoot = path.join(DOCS_DIR, 'md');
    const files = [];
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) { if (e.name !== 'archive') walk(p); }
        else if (e.name.endsWith('.md')) files.push(p);
      }
    })(mdRoot);

    const IMG = /!\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
    /* 有意保留的失效引用: 原图已不可得, 正文已就地标注「图片源已丢失,
       引用按原貌保留」—— 改路径或删引用都会让这条说明失去指代对象, 故放行。 */
    const INTENTIONAL = [/img\\适配器模式-jdk源码解析\.png/];
    const missing = [];
    const malformedUrl = [];
    let total = 0;
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      const rel = path.relative(DOCS_DIR, f).replace(/\\/g, '/');
      let m;
      while ((m = IMG.exec(src))) {
        const raw = m[1];
        total++;
        if (INTENTIONAL.some((re) => re.test(raw))) continue;
        if (/^https?:\/\/\//.test(raw)) { malformedUrl.push(rel + ' → ' + raw.slice(0, 60)); continue; }
        if (/^(https?:\/\/|data:|mailto:|#)/.test(raw)) continue;
        const abs = path.resolve(path.dirname(f), decodeURIComponent(raw.split('#')[0].split('?')[0]));
        if (!fs.existsSync(abs)) missing.push(rel + ' → ' + raw.slice(0, 60));
      }
    }
    check('图片 URL 格式合法', malformedUrl.length === 0,
      malformedUrl.length ? malformedUrl.slice(0, 3).join(' | ') : total + ' 处引用');
    check('本地图片引用均存在', missing.length === 0,
      missing.length ? missing.slice(0, 3).join(' | ') : '全部命中');
  }

  /* ============ 3d. 关键脚本顺序契约（静态） ============
     docsify.min.js 在 readyState=interactive(= defer 脚本执行期间) 会走
     `setTimeout(init, 0)` —— 它不等所有 defer 脚本, 只要事件循环出现空档就用
     当时的 $docsify 初始化。而站内多数插件是**覆盖式**注册:
        window.$docsify.plugins = [fn]                (copy-code / pagination)
        window.$docsify.plugins = (…||[]).concat(fn)   (toc)
     若 docsify.min.js 排在插件之前, 跨域 CDN 稍慢就会造成「资源全部 200、
     插件集体失效」。该故障本地不可复现(硬盘读取毫秒级完成、不留空档),
     只在线上出现 —— 纯靠本地回归无法发现, 故用静态契约守住顺序。 */
  console.log('\n— 关键脚本顺序 —');
  {
    const html = fs.readFileSync(path.join(DOCS_DIR, 'index.html'), 'utf8');
    const srcs = [];
    const RE = /<script[^>]*\sdefer\s+src="([^"]+)"/g;
    let m;
    while ((m = RE.exec(html))) srcs.push(m[1]);

    const idxOf = (frag) => srcs.findIndex((s) => s.includes(frag));
    const iDocsify = idxOf('docsify.min.js');
    const iPrism = idxOf('prism-langs.bundle.js');

    /* 所有会写 $docsify / $docsify.plugins 的脚本 */
    const REGISTRARS = [
      'bootstrap.js', 'terminal.js', 'terminal-a11y.js', 'home.js', 'home-motion.js',
      'article.js', 'site-map.js', 'gitalk.min.js', 'plugins/search.js',
      'docsify-pagination.min.js', 'zoom-image.js', 'docsify-mermaid.min.js',
      'docsify-plugin-toc.min.js', 'docsify-copy-code.min.js'
    ];
    const after = REGISTRARS.filter((f) => { const i = idxOf(f); return i >= 0 && i > iDocsify; });

    check('docsify.min.js 排在全部插件注册者之后', after.length === 0,
      after.length ? '位置错误: ' + after.join(', ') + '（会造成线上插件静默失效）'
        : '共有 ' + (REGISTRARS.length - after.length) + ' 个注册者在其之前');
    check('prism 语法包排在 docsify.min.js 之后（注册到内嵌 Prism）',
      iPrism > iDocsify, 'docsify@' + iDocsify + ', prism@' + iPrism);
  }

  /* ============ 4. 首页功能与版心 ============ */
  console.log('\n— 首页功能与版心 —');
  {
    for (const w of [1440, 1920]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 1000 } });
      const page = await ctx.newPage();
      await page.goto(BASE + PAGES[0].path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3200);
      const r = await page.evaluate(() => {
        const ms = document.querySelector('body.is-home .markdown-section');
        const edges = ms ? Array.from(ms.children)
          .filter((c) => c.getBoundingClientRect().height > 40)
          .map((c) => { const b = c.getBoundingClientRect(); const cs = getComputedStyle(c); return Math.round(b.x + parseFloat(cs.paddingLeft)); }) : [];
        return {
          uniq: Array.from(new Set(edges)).sort((a, b) => a - b),
          search: !!document.querySelector('.search input'),
          motion: document.querySelectorAll('[data-motion]').length
        };
      });
      // 允许 0（全出血装饰带的容器）存在，但正文区块必须只有一条纵轴
      const contentEdges = r.uniq.filter((x) => x > 0);
      check(w + 'px 首页正文版心单轴', contentEdges.length === 1, '内容左缘 ' + JSON.stringify(r.uniq));
      check(w + 'px 首页搜索与动效在挂', r.search && r.motion > 0, 'search=' + r.search + ' motion=' + r.motion);
      await ctx.close();
    }

    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + PAGES[0].path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2600);
    // 页脚统计滚动到位后应为真实值
    await page.evaluate(() => { const el = document.querySelector('#home-footer'); if (el) el.scrollIntoView({ block: 'end' }); });
    await page.waitForTimeout(1800);
    const stats = await page.evaluate(() => Array.from(document.querySelectorAll('#home-footer [data-stat]')).map((e) => e.textContent.trim()));
    check('页脚统计非 0 且已到真实值', stats.length > 0 && stats.every((s) => s !== '0'), '值 = ' + JSON.stringify(stats));

    // 封面搜索 → 侧栏搜索桥接
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const bridged = await page.evaluate(async () => {
      const input = document.getElementById('cover-search-input');
      const form = document.getElementById('cover-search');
      if (!input || !form) return { err: 'no cover search' };
      input.value = 'Redis';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 1200));
      const s = document.querySelector('.search input');
      return { hash: location.hash, sidebarValue: s ? s.value : null, results: document.querySelectorAll('.results-panel li, .results-panel .matching-post').length };
    });
    check('封面搜索桥接到侧栏搜索', !bridged.err && bridged.sidebarValue === 'Redis' && bridged.results > 0,
      'hash=' + bridged.hash + ' 结果=' + bridged.results);
    await ctx.close();
  }

  /* ============ 5. 无障碍 ============ */
  console.log('\n— 无障碍 —');
  {
    // 移动端抽屉收起态：侧栏应 inert，Tab 不应落到屏外
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE + PAGES[1].path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const drawer = await page.evaluate(() => {
      const sb = document.querySelector('.sidebar');
      return { inert: sb ? sb.hasAttribute('inert') : null, ariaHidden: sb ? sb.getAttribute('aria-hidden') : null, bodyClose: document.body.classList.contains('close') };
    });
    check('移动端收起态侧栏 inert + aria-hidden', drawer.bodyClose ? (drawer.inert === true && drawer.ariaHidden === 'true') : true,
      JSON.stringify(drawer));

    const offscreen = await page.evaluate(async () => {
      const focusables = Array.from(document.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])'));
      let outside = 0;
      for (const el of focusables.slice(0, 200)) {
        if (el.closest('[inert]') || el.offsetParent === null) continue;
        el.focus();
        const r = el.getBoundingClientRect();
        if (r.right < 0 || r.left > window.innerWidth) outside++;
      }
      return outside;
    });
    check('Tab 目标不落在视口外', offscreen === 0, '屏外可聚焦元素 ' + offscreen + ' 个');

    // 桌面端不得误加 inert
    const ctx2 = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + PAGES[1].path, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(2600);
    const desktop = await p2.evaluate(() => {
      const sb = document.querySelector('.sidebar');
      return { inert: sb ? sb.hasAttribute('inert') : null, links: document.querySelectorAll('.sidebar a').length };
    });
    check('桌面端侧栏未被误加 inert', desktop.inert === false, '侧栏链接 ' + desktop.links + ' 条');
    await ctx.close(); await ctx2.close();
  }

  /* ============ 5b. 慢网络下的插件初始化（竞态复现） ============
     这是本站唯一「本地必过、线上必挂」的缺陷类别, 必须用限速才能暴露:
     延迟跨域 CDN 脚本, 人为制造事件循环空档, 检验插件是否仍全部生效。
     判据用「插件产物是否存在」(复制按钮 / TOC / 搜索框), 而非 plugins 数组长度
     —— 故障时数组长度同样是满的, 靠长度根本发现不了。 */
  console.log('\n— 慢网络下的插件初始化 —');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    /* 让跨域 CDN 脚本变成瓶颈: 制造出「部分 defer 脚本尚未执行完」的窗口 */
    await page.route('**/plugins/search.js', async (r) => { await new Promise((x) => setTimeout(x, 4000)); r.continue(); });
    await page.route('**/registry.npmmirror.com/**', async (r) => { await new Promise((x) => setTimeout(x, 3000)); r.continue(); });

    await page.goto(BASE + PAGES[1].path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const r = await page.evaluate(() => ({
      copyBtns: document.querySelectorAll('.docsify-copy-code-button').length,
      tocLinks: document.querySelectorAll('.toc-nav a').length,
      searchInput: !!document.querySelector('.search input'),
      codeBlocks: document.querySelectorAll('pre > code').length
    }));
    check('限速下插件仍全部生效（复制 / TOC / 搜索）',
      r.copyBtns > 0 && r.tocLinks > 0 && r.searchInput,
      '复制=' + r.copyBtns + '/' + r.codeBlocks + ' TOC=' + r.tocLinks + ' 搜索=' + r.searchInput +
      (r.copyBtns === 0 ? '  ← docsify.min.js 顺序疑似被改动' : ''));
    await ctx.close();
  }

  /* ============ 6. 对比度 ============ */
  console.log('\n— 对比度 —');
  {
    const byPage = {};
    CONTRAST_TARGETS.forEach((t) => { (byPage[t.page] = byPage[t.page] || []).push(t); });
    for (const name of Object.keys(byPage)) {
      const target = PAGES.find((p) => p.name === name);
      if (!target) continue;
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
      const page = await ctx.newPage();
      await page.goto(BASE + target.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(name === '首页' ? 3000 : 1800);
      for (const t of byPage[name]) {
        const label = name + ' ' + t.sel + (t.hover ? ':hover' : '') + ' 对比度';
        if (t.hover) {
          // 先归零指针, 避免上一条的悬停态串到本条
          await page.mouse.move(0, 0);
          try { await page.hover(t.sel, { timeout: 3000 }); } catch (e) { /* 不可悬停则退化为静态态测量 */ }
          await page.waitForTimeout(360);   // 等 color transition 结束
        }
        const r = await page.evaluate(CONTRAST_PROBE, t.sel);
        if (r.missing) { check(label, false, '元素不存在'); continue; }
        if (r.unknown) { check(label, true, '跳过（' + r.unknown + '）'); continue; }
        check(label, r.ratio >= r.need,
          r.ratio.toFixed(2) + ':1（需 ≥ ' + r.need + '）  fg=' + r.fg + ' bg=' + r.bg);
      }
      await ctx.close();
    }
  }

  await browser.close();

  /* ============ 汇总 ============ */
  const failed = results.filter((r) => !r.ok);
  console.log('\n========================================');
  console.log('断言 ' + results.length + ' 项：' + (results.length - failed.length) + ' PASS / ' + failed.length + ' FAIL');
  if (failed.length) {
    console.log('\n失败清单:');
    failed.forEach((f) => console.log('  · ' + f.name + (f.detail ? '  — ' + f.detail : '')));
  }
  process.exit(failed.length ? 1 : 0);
})();
