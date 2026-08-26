(function () {
  'use strict';

  var shell = window.WYCHMOD_SHELL = window.WYCHMOD_SHELL || {};
  var state = shell.article = shell.article || {};
  var openState = {};

  function domainLabel(p) {
    var strong = p.querySelector('strong');
    return (strong ? strong.textContent : p.textContent).trim();
  }

  function setOpen(li, p, open) {
    li.classList.toggle('an-open', open);
    p.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function transformDomains() {
    if (!document.body.classList.contains('is-article')) return;
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    var lis = nav.querySelectorAll(':scope > ul > li');
    var idx = 0;
    lis.forEach(function (li) {
      var p = li.querySelector(':scope > p');
      var ul = li.querySelector(':scope > ul');
      if (!p || !ul) return;

      if (!li.classList.contains('an-domain')) {
        li.classList.add('an-domain');
        li.setAttribute('data-domain', String(idx));
        p.classList.add('an-domain-toggle');
        p.setAttribute('role', 'button');
        p.setAttribute('tabindex', '0');
        var strong = p.querySelector('strong');
        if (strong) {
          strong.setAttribute('data-num', ('0' + (idx + 1)).slice(-2));
        }
      }

      var hasActive = !!li.querySelector('.active');
      var open = hasActive || openState[domainLabel(p)] === true;
      setOpen(li, p, open);
      idx++;
    });
  }

  function toggleDomain(p) {
    var li = p.parentElement;
    if (!li || !li.classList.contains('an-domain')) return;
    var open = !li.classList.contains('an-open');
    setOpen(li, p, open);
    openState[domainLabel(p)] = open;
  }

  function bindDomainEvents() {
    if (window.__articleNavBound) return;
    window.__articleNavBound = true;

    document.addEventListener('click', function (e) {
      var p = e.target && e.target.closest ? e.target.closest('p.an-domain-toggle') : null;
      if (p) toggleDomain(p);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var p = e.target && e.target.closest ? e.target.closest('p.an-domain-toggle') : null;
      if (!p) return;
      e.preventDefault();
      toggleDomain(p);
    });
  }

  function bindDrawerA11y() {
    if (window.__p008DrawerBound) return;
    window.__p008DrawerBound = true;

    var MOBILE_MAX = 1024;
    var lastFocus = null;

    function isMobile() { return window.innerWidth <= MOBILE_MAX; }
    function isArticle() { return document.body.classList.contains('is-article'); }
    function drawerOpen() { return isArticle() && isMobile() && !document.body.classList.contains('close'); }
    function terminalActive() {
      var w = document.getElementById('terminal-window');
      return w && w.classList.contains('active');
    }

    function syncToggleAria(open) {
      var t = document.querySelector('.sidebar-toggle');
      if (!t) return;
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.setAttribute('aria-label', open ? '关闭知识目录' : '打开知识目录');
    }

    function closeDrawer() {
      if (!isArticle() || !isMobile()) return;
      document.body.classList.add('close');
      document.body.classList.remove('drawer-open');
      syncToggleAria(false);
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try { lastFocus.focus(); } catch (e) {}
      }
    }

    function openDrawer() {
      if (!isArticle() || !isMobile()) return;
      lastFocus = document.activeElement;
      document.body.classList.remove('close');
      document.body.classList.add('drawer-open');
      syncToggleAria(true);
      setTimeout(function () {
        var input = document.querySelector('.sidebar .search input');
        if (input) { try { input.focus({ preventScroll: false }); } catch (e) {} return; }
        var first = document.querySelector('.sidebar-nav a');
        if (first) { try { first.focus(); } catch (e) {} }
      }, 60);
    }

    function drawerFocusables() {
      var sb = document.querySelector('.sidebar');
      if (!sb) return [];
      var nodes = sb.querySelectorAll('a[href], input, button, [tabindex]:not([tabindex="-1"])');
      return Array.prototype.slice.call(nodes).filter(function (n) {
        return n.offsetParent !== null || n === document.activeElement;
      });
    }

    function initToggleAria() {
      var t = document.querySelector('.sidebar-toggle');
      if (!t) return;
      var sb = document.querySelector('.sidebar');
      if (sb && !sb.id) sb.id = 'sidebar';
      t.setAttribute('aria-controls', 'sidebar');
      if (isMobile()) {
        syncToggleAria(drawerOpen());
      } else {
        var collapsed = document.body.classList.contains('close');
        t.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        t.setAttribute('aria-label', collapsed ? '展开知识目录' : '收起知识目录');
        t.setAttribute('title', collapsed ? '展开知识目录' : '收起知识目录');
      }
    }

    function onRouteChange() {
      if (!isArticle()) return;
      initToggleAria();
      if (isMobile()) {
        document.body.classList.add('close');
        document.body.classList.remove('drawer-open');
        syncToggleAria(false);
      } else {
        document.body.classList.remove('drawer-open');
      }
      setTimeout(function () {
        var active = document.querySelector('.sidebar-nav .active, .sidebar-nav li.active > a');
        if (active && active.scrollIntoView) {
          try { active.scrollIntoView({ block: 'nearest', behavior: 'auto' }); } catch (e) {}
        }
      }, 120);
    }

    document.addEventListener('click', function (e) {
      if (!drawerOpen()) return;
      if (terminalActive()) return;
      var t = e.target;
      if (!t) return;
      if (t.closest && (t.closest('.sidebar') || t.closest('.sidebar-toggle'))) return;
      closeDrawer();
    }, true);

    document.addEventListener('click', function (e) {
      var toggle = e.target && e.target.closest && e.target.closest('.sidebar-toggle');
      if (!toggle || !isArticle() || !isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      if (terminalActive()) return;
      if (drawerOpen()) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }, true);

    document.addEventListener('click', function (e) {
      if (!drawerOpen()) return;
      var a = e.target && e.target.closest && e.target.closest('.sidebar a');
      if (!a) return;
      setTimeout(closeDrawer, 160);
    }, false);

    document.addEventListener('click', function (e) {
      var toggle = e.target && e.target.closest && e.target.closest('.sidebar-toggle');
      if (!toggle || !isArticle() || isMobile()) return;
      setTimeout(function () {
        var collapsed = document.body.classList.contains('close');
        toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        toggle.setAttribute('aria-label', collapsed ? '展开知识目录' : '收起知识目录');
        toggle.setAttribute('title', collapsed ? '展开知识目录' : '收起知识目录');
      }, 0);
    }, false);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (terminalActive()) return;
      if (drawerOpen()) {
        e.preventDefault();
        closeDrawer();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (!drawerOpen()) return;
      var focusables = drawerFocusables();
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        try { last.focus(); } catch (er) {}
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        try { first.focus(); } catch (er) {}
      }
    });

    window.addEventListener('hashchange', function () {
      setTimeout(onRouteChange, 80);
    });

    var lastWasArticle = false;
    function maybeInitArticleRoute() {
      if (!isArticle()) {
        lastWasArticle = false;
        return;
      }
      if (!lastWasArticle) {
        lastWasArticle = true;
        onRouteChange();
        return;
      }
      initToggleAria();
    }

    function boot() {
      maybeInitArticleRoute();
      setTimeout(maybeInitArticleRoute, 120);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }

    new MutationObserver(function () {
      maybeInitArticleRoute();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', function () {
      if (isArticle()) setTimeout(onRouteChange, 80);
    });
  }

  function init() {
    transformDomains();
    bindDomainEvents();
    bindDrawerA11y();
  }

  state.init = init;
})();
