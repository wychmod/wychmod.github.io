/* =========================================================
   Site Map - 全站地图 / Knowledge Index 页面交互 (P003)
   依据: docs/_meta/ui-redesign/pages/03-site-map.md
   作用域: body[data-page="md/Index.md"]
   注意: Docsify 通过 innerHTML 插入内容, Markdown 内的 <script> 不会执行,
        因此必须放在外部 JS 文件, 由 index.html 加载.
   ========================================================= */
(function () {
  'use strict';

  var DOMAINS = '.sm-domain';
  var QUICK_ITEMS = '.sm-quick-item';
  var TOC_BTN = '.sm-toc-toggle';
  var OFFSET = 160;
  var lastWasMobile = window.innerWidth <= 1024;

  function $(sel) { return document.querySelectorAll(sel); }

  function applyDomainState() {
    // 桌面与移动端均默认折叠：桌面呈现参考图中的“摘要目录行”，
    // 点击展开真实文档链接；只有从 <=1024 跨越到 >1024 时收起，
    // 避免 resize 抹掉用户在桌面上的展开选择。
    var isDesktop = window.innerWidth > 1024;
    if (isDesktop && lastWasMobile) {
      closeAllDomains();
    } else if (!isDesktop) {
      closeAllDomains();
    }
    lastWasMobile = !isDesktop;
  }

  function openAllDomains() {
    $(DOMAINS).forEach(function (d) { d.setAttribute('open', ''); });
  }

  function closeAllDomains() {
    $(DOMAINS).forEach(function (d) { d.removeAttribute('open'); });
  }

  function allOpen() {
    return Array.from($(DOMAINS)).every(function (d) { return d.hasAttribute('open'); });
  }

  function updateTocButton() {
    var btn = document.querySelector(TOC_BTN);
    if (!btn) return;
    var open = allOpen();
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('span').textContent = open ? '收起目录' : '打开目录';
  }

  function initTocButton() {
    var btn = document.querySelector(TOC_BTN);
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', function () {
      if (allOpen()) closeAllDomains();
      else openAllDomains();
      updateTocButton();
    });
  }

  function updateCurrentAnchor() {
    var domains = $(DOMAINS);
    var currentId = '';
    for (var i = domains.length - 1; i >= 0; i--) {
      var rect = domains[i].getBoundingClientRect();
      if (rect.top <= OFFSET) {
        currentId = domains[i].id;
        break;
      }
    }
    $(QUICK_ITEMS).forEach(function (item) {
      var href = item.getAttribute('href');
      item.classList.toggle('is-current', href === '#' + currentId);
    });
  }

  function smoothScrollForQuickNav() {
    $(QUICK_ITEMS).forEach(function (item) {
      if (item.dataset.scrollBound) return;
      item.dataset.scrollBound = 'true';
      item.addEventListener('click', function (e) {
        var href = item.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
        if (window.innerWidth <= 1024) {
          target.setAttribute('open', '');
          updateTocButton();
        }
      });
    });
  }

  function init() {
    applyDomainState();
    initTocButton();
    updateTocButton();
    updateCurrentAnchor();
    smoothScrollForQuickNav();
    bindSummaryToggle();
  }

  // 桌面端：点击摘要行展开/收起该领域（原生 details 已支持键盘操作）
  function bindSummaryToggle() {
    $(DOMAINS).forEach(function (d) {
      if (d.dataset.toggleBound) return;
      d.dataset.toggleBound = 'true';
      d.addEventListener('toggle', updateTocButton);
    });
  }

  function tryInit() {
    // 兼容首页嵌入版（README.md）与独立全站地图页（md/Index.md）：
    // 只要当前页面存在 .sm-page 就初始化，避免 #sm-d01 等锚点被 Docsify hash 路由拦截成 404。
    if (!document.querySelector('.sm-page')) return;
    init();
  }

  // Docsify 渲染完成后初始化
  if (window.$docsify && window.$docsify.plugins) {
    window.$docsify.plugins.push(function (hook, vm) {
      hook.doneEach(function () {
        tryInit();
      });
    });
  }

  // 兜底: DOMContentLoaded 后再次尝试
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  window.addEventListener('scroll', updateCurrentAnchor, { passive: true });
  window.addEventListener('resize', function () {
    applyDomainState();
    updateTocButton();
    updateCurrentAnchor();
  });
})();
