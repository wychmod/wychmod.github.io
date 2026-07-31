/* =========================================================
   Homepage V2 - 首页交互与路由状态
   依据: docs/_meta/HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md §11.3–11.7
   职责:
     1. 路由状态插件: doneEach 设置 .is-home / .is-article + data-page (unshift 到 plugins[0])
     2. 首页交互插件: doneEach 幂等绑定 搜索/键 / 终端预览桥接 / Lucide 重绘 (push 到末尾)
   不做: 不复制终端系统; 不修改 Docsify 核心配置; 不重写搜索
   加载: 必须在 docsify.min.js 之前加载(以便 push 插件)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 路由状态判定 ---------- */
  function normalizeHashRoute(p) {
    if (p == null) p = '';
    // Docsify route.path 以 / 开头; window.location.hash 以 # 开头
    if (p.charAt(0) === '#') p = p.slice(1);
    // 去掉查询参数
    var q = p.indexOf('?');
    if (q !== -1) p = p.slice(0, q);
    // 去掉尾部斜杠
    p = p.replace(/\/$/, '');
    return p;
  }
  function isHomeRoute(vm) {
    var p = normalizeHashRoute((vm && vm.route && vm.route.path) || window.location.hash || '');
    return p === '/' || p === '/README' || p === '';
  }

  function setRouteState(vm) {
    var file = (vm && vm.route && vm.route.file) || 'README.md';
    var home = isHomeRoute(vm);
    document.body.dataset.page = file;
    document.body.classList.toggle('is-home', home);
    document.body.classList.toggle('is-article', !home);
    if (!home) document.body.classList.remove('home-search-active');
  }

  /* ---------- 首页搜索 ---------- */
  // 保留 form#cover-search 提交桥接(由 index.html 既有 IIFE 处理).
  // 这里仅补充 `/` 键聚焦搜索(规范 §6.4): 输入框/可编辑区域聚焦时不触发.
  function bindHomeSearchKey() {
    var input = document.getElementById('cover-search-input');
    if (!input) return;
    if (document.body.dataset.searchKeyBound === 'true') return;
    document.body.dataset.searchKeyBound = 'true';

    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' && e.key !== 'ForwardSlash') return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      var editable = document.activeElement && document.activeElement.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable) return;
      // 只在首页生效
      if (!document.body.classList.contains('is-home')) return;
      e.preventDefault();
      input.focus();
      if (input.select) input.select();
    });
  }

  function bindHomeSearchPanel() {
    var form = document.getElementById('cover-search');
    var input = document.getElementById('cover-search-input');
    if (!form || !input || form.dataset.panelBound === 'true') return;
    form.dataset.panelBound = 'true';

    form.addEventListener('submit', function () {
      if (!input.value.trim()) return;
      // 与 index.html bridgeCoverSearch 配合: 若仍在首页则展开面板, 否则不加残留 class
      setTimeout(function () {
        if (document.body.classList.contains('is-home')) {
          document.body.classList.add('home-search-active');
        }
      }, 280);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!document.body.classList.contains('home-search-active')) return;
      var terminal = document.getElementById('terminal-window');
      if (terminal && terminal.classList.contains('active')) return;
      document.body.classList.remove('home-search-active');
      input.focus();
    });
  }

  /* ---------- 终端预览桥接(规范 §11.6) ---------- */
  // 顶部 >_ Ctrl K / 首页终端预览 / 移动端悬浮按钮 都打开同一 #terminal-window
  function bindTerminalTriggers() {
    var triggers = document.querySelectorAll('[data-open-terminal]');
    triggers.forEach(function (el) {
      if (el.dataset.bound === 'true') return;
      el.dataset.bound = 'true';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById('terminal-trigger');
        if (t) t.click();
      });
    });
  }

  /* ---------- 锚点滚动(规范 §6.5) ---------- */
  // Docsify 拦截 # 锚点为路由, 故 Hero CTA 用 data-scroll-to 做页内平滑滚动
  function bindScrollLinks() {
    var links = document.querySelectorAll('[data-scroll-to]');
    links.forEach(function (el) {
      if (el.dataset.scrollBound === 'true') return;
      el.dataset.scrollBound = 'true';
      el.addEventListener('click', function (e) {
        var sel = el.getAttribute('data-scroll-to');
        var target = sel ? document.querySelector(sel) : null;
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---------- Lucide 图标重绘(规范 §11.5) ---------- */
  // 0.468.0 UMD: lucide.createIcons({ icons: lucide.icons }) 自动替换 [data-lucide]
  function renderLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons({ icons: window.lucide.icons });
      } catch (e) {
        // 降级: 图标仅辅助, 失败不影响文本可读
      }
    }
  }

  function ensureLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      renderLucideIcons();
      return;
    }
    if (window.__homeLucideLoading) return;
    window.__homeLucideLoading = true;

    var retry = document.createElement('script');
    retry.src = 'https://registry.npmmirror.com/lucide/0.468.0/files/dist/umd/lucide.min.js';
    retry.dataset.homeLucideRetry = 'true';
    retry.onload = function () {
      window.__homeLucideLoading = false;
      renderLucideIcons();
    };
    retry.onerror = function () {
      window.__homeLucideLoading = false;
    };
    document.head.appendChild(retry);
  }

  /* ---------- 路由状态插件(必须先于 Gitalk 执行, 故 unshift) ---------- */
  function routeStatePlugin(hook, vm) {
    hook.doneEach(function () { setRouteState(vm); });
  }

  /* ---------- 首页交互插件(末尾执行) ---------- */
  function homepagePlugin(hook, vm) {
    hook.doneEach(function () {
      setRouteState(vm);          // 兜底确保状态正确
      bindHomeSearchKey();
      bindHomeSearchPanel();
      bindTerminalTriggers();
      bindScrollLinks();
      ensureLucideIcons();
    });
  }

  /* ---------- 注册插件(必须在 docsify.min.js 运行前) ---------- */
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = window.$docsify.plugins || [];
  window.$docsify.plugins.unshift(routeStatePlugin);  // 置首, 先设 .is-home
  window.$docsify.plugins.push(homepagePlugin);       // 置尾, 绑定首页交互

  /* ---------- 首次加载即时设置(减少导航主题闪烁) ---------- */
  function applyInitial() {
    try {
      var home = isHomeRoute(null);
      document.body.classList.toggle('is-home', home);
      document.body.classList.toggle('is-article', !home);
    } catch (e) {}
    ensureLucideIcons();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyInitial);
  } else {
    applyInitial();
  }
  window.addEventListener('hashchange', function () {
    setTimeout(function () {
      var home = isHomeRoute(null);
      document.body.classList.toggle('is-home', home);
      document.body.classList.toggle('is-article', !home);
    }, 0);
  });
})();
