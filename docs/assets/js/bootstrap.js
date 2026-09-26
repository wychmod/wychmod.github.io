(function () {
  'use strict';

  var shell = window.WYCHMOD_SHELL = window.WYCHMOD_SHELL || {};
  if (window.__wychmodBootstrapBound) return;
  window.__wychmodBootstrapBound = true;

  function normalizeRoutePath(p) {
    if (!p) return '';
    p = String(p).replace(/^#/, '');
    if (p.indexOf('?') !== -1) p = p.slice(0, p.indexOf('?'));
    if (p.indexOf('#') !== -1) p = p.slice(0, p.indexOf('#'));
    p = p.replace(/\/$/, '');
    return p;
  }

  function isHomeRoute(vm) {
    var p = normalizeRoutePath((vm && vm.route && vm.route.path) || window.location.hash || '');
    return p === '/' || p === '/README' || p === '';
  }

  function setRouteState(vm) {
    var file = (vm && vm.route && vm.route.file) || 'README.md';
    var home = isHomeRoute(vm);
    document.body.dataset.page = file;
    document.body.classList.toggle('is-home', home);
    document.body.classList.toggle('is-article', !home);
    if (!home) document.body.classList.remove('home-search-active');
    syncSidebarInert();
  }

  function syncCoverPlaceholder() {
    var input = document.getElementById('cover-search-input');
    if (!input) return;
    input.placeholder = window.innerWidth < 420 ? '搜索技术笔记...' : '搜索文档、框架、源码与工具';
  }

  /* 侧栏 inert 同步: 移动端抽屉收起时侧栏以 transform 移出视口,
     但内部链接仍可被 Tab 聚焦(焦点跑到屏幕外, WCAG 2.4.3/2.4.7 违规)。
     此处按「是否可见」给侧栏加 inert / aria-hidden, 使屏外内容不可聚焦。
     注意: 抽屉展开态与桌面折叠态都不得加 inert(否则正常导航失效)。 */
  function syncSidebarInert() {
    var sb = document.querySelector('.sidebar');
    if (!sb) return;
    var isArticle = document.body.classList.contains('is-article');
    var closed = document.body.classList.contains('close');
    var isMobile = window.innerWidth <= 1024;
    /* 首页侧栏 display:none 已不可聚焦; 仅文章页 + 收起态需要 inert */
    var shouldInert = isArticle && isMobile && closed;
    if (shouldInert) {
      if (!sb.hasAttribute('inert')) sb.setAttribute('inert', '');
      sb.setAttribute('aria-hidden', 'true');
    } else {
      if (sb.hasAttribute('inert')) sb.removeAttribute('inert');
      sb.removeAttribute('aria-hidden');
    }
  }

  function bindCoverSearchBridge() {
    var form = document.getElementById('cover-search');
    var input = document.getElementById('cover-search-input');
    if (!form || !input) return;
    syncCoverPlaceholder();
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      if (!query) return;

      if (window.location.hash === '#/' || window.location.hash === '') {
        window.location.hash = '#/README';
      }

      setTimeout(function () {
        var docsifySearch = document.querySelector('.search input');
        if (!docsifySearch) return;
        docsifySearch.focus();
        docsifySearch.value = query;
        docsifySearch.dispatchEvent(new Event('input', { bubbles: true }));
      }, 260);
    });
  }

  function bindTerminalTriggers() {
    var triggers = document.querySelectorAll('[data-open-terminal]');
    triggers.forEach(function (el) {
      if (el.dataset.bound === 'true') return;
      el.dataset.bound = 'true';
      el.addEventListener('click', function (event) {
        event.preventDefault();
        var trigger = document.getElementById('terminal-trigger');
        if (trigger) trigger.click();
      });
    });
  }

  function cleanSidebarLabels() {
    var labels = document.querySelectorAll('.sidebar-nav p, .sidebar-nav a');
    labels.forEach(function (label) {
      if (label.dataset.iconCleaned === 'true') return;
      label.dataset.iconCleaned = 'true';
      label.childNodes.forEach(function (node) {
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.nodeValue = node.nodeValue
          .replace(/^:octocat:\s*/i, '')
          .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '')
          .replace(/^[\s\uFE0F]*(?:[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])+\uFE0F?\s*/u, '');
      });
    });
  }

  function renderGitalk(vm) {
    var route = (vm && vm.route) || {};
    var p = route.path || '';
    if (p === '/' || p === '/README') return;
    /* 未配置评论代理(如 clientSecret 已外置但代理尚未部署)时静默跳过, 不报错 */
    if (!window.gitalkConfig) return;

    var label = window.md5 ? window.md5(decodeURI(p.split('/').pop() || 'home')) : String(p);
    var domObj = window.Docsify && Docsify.dom;
    var main = domObj && domObj.getNode('#main');
    if (!domObj || !main || !window.Gitalk || !window.gitalkConfig) return;

    Array.prototype.slice.call(document.querySelectorAll('div.gitalk-container')).forEach(function (ele) {
      ele.remove();
    });

    var divEle = domObj.create('div');
    divEle.id = 'gitalk-container-' + label;
    divEle.className = 'gitalk-container';
    /* 注入 #main 内部而非 .content 同级的理由:
       1) 宽度自动跟随正文列 —— 无需读 clientWidth 计算(旧做法强制同步重排),
          也无需在 CSS 里复刻 #main 在各断点/各页面类型下的 max-width(必然漂移);
       2) docsify 换页时重写 #main 内容, 旧容器随之销毁, 不留残留节点。 */
    domObj.appendTo(main, divEle);

    var gitalk = new Gitalk(Object.assign({}, window.gitalkConfig, { id: !label ? 'home' : label }));
    gitalk.render('gitalk-container-' + label);
  }

  function buildFooter(vm) {
    var p = (vm && vm.route && vm.route.path) || '';
    if (p === '/' || p === '/README') return '';
    return [
      '<hr/>',
      '<footer>',
      '<span>© 2024 <a href="https://github.com/wychmod" target="_blank" rel="noopener noreferrer">wychmod</a>. All Rights Reserved.</span>',
      '<span style="float: right;">Powered by <a href="https://docsify.js.org" target="_blank" rel="noopener noreferrer">docsify</a></span>',
      '</footer>'
    ].join('');
  }

  function buildEditLink(vm, html) {
    var p = (vm && vm.route && vm.route.path) || '';
    if (p === '/' || p === '/README') return html;
    var file = (vm && vm.route && vm.route.file) || 'README.md';
    var url = 'https://github.com/wychmod/wychmod.github.io/blob/main/docs/' + file;
    var editHtml = '<p class="edit-page-link"><a href="' + url + '" target="_blank" rel="noopener noreferrer">编辑此页</a></p>';
    return editHtml + '\n\n' + html;
  }

  function runPageInits(vm) {
    if (shell.home && typeof shell.home.init === 'function') shell.home.init(vm);
    if (shell.siteMap && typeof shell.siteMap.init === 'function') shell.siteMap.init(vm);
    if (shell.article && typeof shell.article.init === 'function') shell.article.init(vm);
  }

  function registerPlugins() {
    var routeStatePlugin = function (hook, vm) {
      hook.doneEach(function () {
        setRouteState(vm);
      });
    };

    var shellPlugin = function (hook, vm) {
      hook.beforeEach(function (html) {
        return buildEditLink(vm, html);
      });

      hook.afterEach(function (html) {
        var footer = buildFooter(vm);
        return footer ? html + footer : html;
      });

      hook.doneEach(function () {
        setRouteState(vm);
        bindCoverSearchBridge();
        bindTerminalTriggers();
        cleanSidebarLabels();
        syncSidebarInert();
        runPageInits(vm);
        renderGitalk(vm);
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      });
    };

    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = window.$docsify.plugins || [];
    window.$docsify.plugins.unshift(routeStatePlugin);
    window.$docsify.plugins.push(shellPlugin);
  }

  registerPlugins();
  setRouteState(null);

  function boot() {
    setRouteState(null);
    bindCoverSearchBridge();
    bindTerminalTriggers();
    cleanSidebarLabels();
    syncSidebarInert();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  window.addEventListener('hashchange', function () {
    setTimeout(function () {
      setRouteState(null);
      bindCoverSearchBridge();
      bindTerminalTriggers();
      cleanSidebarLabels();
      syncSidebarInert();
    }, 80);
  });

  window.addEventListener('resize', function () {
    syncCoverPlaceholder();
    syncSidebarInert();
  });

  /* 抽屉开合只反映在 body 自身 class 上(close / drawer-open), 故仅监听 body
     自身属性, 不监听子树 —— 避免任意元素 class 变化(如 is-visible)高频触发 */
  new MutationObserver(function () {
    syncSidebarInert();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* 子树变更: docsify 一次渲染会产生成百条 mutation 记录, 若逐条执行
     bind/clean/inert 会重复做无谓的 querySelectorAll。此处用 rAF 合并到
     每帧最多一次, 行为不变但同步查询次数大幅下降。
     bindCoverSearchBridge / bindTerminalTriggers / cleanSidebarLabels 均以
     dataset 标记幂等, 重复执行无副作用。 */
  var shellPatchScheduled = false;
  function scheduleShellPatch() {
    if (shellPatchScheduled) return;
    shellPatchScheduled = true;
    window.requestAnimationFrame(function () {
      shellPatchScheduled = false;
      bindCoverSearchBridge();
      bindTerminalTriggers();
      cleanSidebarLabels();
      syncSidebarInert();
    });
  }

  new MutationObserver(scheduleShellPatch).observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
