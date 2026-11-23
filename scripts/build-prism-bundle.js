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
 *   4. 合并包尾部**必须**带竞态补偿段(TAIL, 见下)。原因放在那段注释里。
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

/**
 * 竞态补偿段（追加在合并包最末尾）——**这段不能删，也不该被"清理"**。
 *
 * 故障形态（2026-11-23 线上实测）
 *   本站脚本全部 defer。docsify.min.js 末尾是
 *     if (readyState === 'complete' || 'interactive') setTimeout(init, 0)
 *   —— 它**不等**后面的 defer 脚本。线上一次实测的时序：
 *
 *     docsify.min.js   608 → 3118ms   ← 执行时 readyState 已是 interactive
 *     prism bundle     608 → 3566ms   ← 比它晚 448ms 才执行
 *
 *   init 的回调正好落在两者之间：docsify 渲染 markdown 时 `Prism.languages.java`
 *   还不存在 → 静默不着色（docsify 对未注册语言不报错）。同一个页面重载 3 次，
 *   实测 1 次正常、2 次未高亮。
 *
 *   ⚠️ 与 index.html 里那条"顺序是硬约束"是**同一个坑的两种形态**：那条管的是
 *   插件注册，这条管的是语法注册。两者都源自"docsify 不等 defer"。
 *
 * 为什么补偿放在这里而不是 index.html
 *   放 index.html 要在 docsify.min.js 之后再插一个 <script>，但那解决不了问题：
 *   defer 脚本按文档顺序执行，补偿脚本会在 prism bundle 之后、却仍可能在 init
 *   回调之前/之后不确定。放在**合并包尾部**则保证一件事：语言注册完的同一个
 *   微任务里就把已渲染的块补上，不依赖任何时序假设。
 *
 * 补偿做什么
 *   对「声明了语言、grammar 已注册」的块，一律基于**纯文本**重绘一次。
 *
 *   ⚠️ 不能用「有没有 token」当「要不要补」的判据。线上实测出现过这种块：
 *   docsify 先按类名猜语言，`lang-java` 猜不出就退回 markup，把
 *   `<Runnable>` 染成 `tag` token——**有 token，但全是错的**。此时若因为
 *   「已经有 token」跳过补偿，就把错误染色留下了。所以判据只能是
 *   「grammar 存在 + 还没重绘过」，重绘输入一律取 textContent（纯文本），
 *   这样无论之前被染成什么样，结果都正确；`Prism.highlight` 对纯文本是
 *   幂等的，重复调用不会套娃。
 *
 *   ⚠️ 也必须自己调 `Prism.highlight(text, grammar, lang)` 而不是
 *   `Prism.highlightElement()`：后者靠类名猜语言，遇到 `lang-java` 形态
 *   会猜不到、退回 markup 语法——这正是上面那个错误染色的来源。
 *
 *   同时打 `data-hl-retry` 标记：保证每个块只重绘一次，避免
 *   MutationObserver 自激（重绘会改 DOM，改 DOM 会再触发观察器）。
 */
const TAIL = `
/* ===== 竞态补偿: docsify 可能早于本包初始化, 已渲染的块需要补一次高亮 ===== */
(function (Prism) {
  if (!Prism || typeof Prism.highlight !== 'function') return;

  var SKIP = ['text', 'mermaid', 'none', 'plaintext', 'md', 'markdown'];

  /** 对每个「grammar 存在、且还没重绘过」的块，用纯文本重绘一次。 */
  function repaint() {
    var blocks = document.querySelectorAll('pre > code');
    for (var i = 0; i < blocks.length; i += 1) {
      var el = blocks[i];
      // 每个块只重绘一次：既防 MutationObserver 自激，也保证幂等。
      if (el.getAttribute('data-hl-retry') === '1') continue;
      var m = /(?:lang|language)-([^\\s]+)/.exec(el.className || '');
      var lang = m ? m[1].toLowerCase() : '';
      // 没声明语言 / 纯文本 / mermaid 容器：本来就不该着色。
      if (!lang || SKIP.indexOf(lang) >= 0) continue;
      var grammar = Prism.languages[lang];
      // 语言没注册：补也白补。
      if (!grammar) continue;

      // 输入一律取纯文本，不读已有的 token 结构：即使 docsify 先染错了
      // （类名为 lang-java 的块被当成 markup），这里也能覆写成正确结果。
      var text = el.textContent;
      if (!text || !text.trim()) continue;
      el.setAttribute('data-hl-retry', '1');
      try {
        var html = Prism.highlight(text, grammar, lang);
        // 只有真的产出 token 才写回：否则会把已有的错误染色换成「无从判断」，
        // 而保持原样至少还能让人看出「这块没配对」。
        if (html.indexOf('class="token') >= 0) el.innerHTML = html;
      } catch (error) {
        // 单块失败不影响其它块；标记已置，不会重试。
      }
    }
  }

  // ① 本包执行时立刻补一次（覆盖「docsify 已经渲染完」的情形）。
  repaint();

  // ② hash 路由切换后补一次（docsify 会在 hashchange 后异步取 markdown 再渲染）。
  window.addEventListener('hashchange', function () { setTimeout(repaint, 0); });

  // ③ 兜住「本包执行时正文还没渲染」的情形。
  //    ⚠️ 观察点必须挂在 document.body 而不是 .markdown-section：本包在
  //    defer 队列里执行时，docsify 可能还没把 .markdown-section 建出来，
  //    挂在它上面会直接装不上观察器（此时 body 一定已存在）。
  //    只观察 4 秒即自行断开，不做常驻观察。
  if (typeof MutationObserver === 'function' && document.body) {
    var observer = new MutationObserver(function () { repaint(); });
    observer.observe(document.body, { childList: true, subtree: true });
    var stop = function () { observer.disconnect(); clearTimeout(timer); };
    var timer = setTimeout(stop, 4000);
    window.addEventListener('hashchange', stop, { once: true });
  }
})(window.Prism);
`;

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

  const out = banner + body + '\n;\n' + TAIL;
  const outPath = path.join(JS_DIR, OUT_NAME);
  fs.writeFileSync(outPath, out, 'utf8');

  const parts = ORDER.map((f) => fs.statSync(path.join(JS_DIR, f)).size);
  const srcTotal = parts.reduce((a, b) => a + b, 0);
  console.log('已生成 ' + path.relative(path.resolve(__dirname, '..'), outPath));
  console.log('  源文件 ' + ORDER.length + ' 个, 合计 ' + (srcTotal / 1024).toFixed(1) + ' KB');
  console.log('  输出 ' + (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1) + ' KB (请求数 16 → 1)');
}

main();
