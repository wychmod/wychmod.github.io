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
  }

  function syncCoverPlaceholder() {
    var input = document.getElementById('cover-search-input');
    if (!input) return;
    input.placeholder = window.innerWidth < 420 ? '搜索技术笔记...' : '搜索文档、框架、源码与工具';
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

  function syncGitalkWidth() {
    var main = document.querySelector('#main');
    var gitalk = document.querySelector('.gitalk-container');
    if (!main || !gitalk) return;
    gitalk.style.width = 'min(100%, ' + Math.max(main.clientWidth, 320) + 'px)';
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
    divEle.style = 'width: min(100%, ' + Math.max(main.clientWidth, 320) + 'px); margin: 0 auto 20px;';
    domObj.appendTo(domObj.find('.content'), divEle);

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
        syncGitalkWidth();
        cleanSidebarLabels();
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
    syncGitalkWidth();
    cleanSidebarLabels();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  window.addEventListener('hashchange', function () {
    setTimeout(function () {
      setRouteState(null);
      bindCoverSearchBridge();
      bindTerminalTriggers();
      syncGitalkWidth();
      cleanSidebarLabels();
    }, 80);
  });

  window.addEventListener('resize', function () {
    syncGitalkWidth();
    syncCoverPlaceholder();
  });

  new MutationObserver(function () {
    bindCoverSearchBridge();
    bindTerminalTriggers();
    syncGitalkWidth();
    cleanSidebarLabels();
  }).observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
