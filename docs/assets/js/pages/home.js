(function () {
  'use strict';

  var shell = window.WYCHMOD_SHELL = window.WYCHMOD_SHELL || {};
  var state = shell.home = shell.home || {};

  function bindHomeSearchKey() {
    var input = document.getElementById('cover-search-input');
    if (!input) return;
    if (document.body.dataset.searchKeyBound === 'true') return;
    document.body.dataset.searchKeyBound = 'true';

    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' && event.key !== 'ForwardSlash') return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      var editable = document.activeElement && document.activeElement.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable) return;
      if (!document.body.classList.contains('is-home')) return;
      event.preventDefault();
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

  function bindScrollLinks() {
    var links = document.querySelectorAll('[data-scroll-to]');
    links.forEach(function (el) {
      if (el.dataset.scrollBound === 'true') return;
      el.dataset.scrollBound = 'true';
      el.addEventListener('click', function (event) {
        var sel = el.getAttribute('data-scroll-to');
        var target = sel ? document.querySelector(sel) : null;
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  var KG_VB_W = 240;
  var KG_VB_H = 180;

  function layoutGraphLinks() {
    var graph = document.querySelector('.home-graph');
    if (!graph) return;
    var svg = graph.querySelector('.home-graph-svg');
    if (!svg || getComputedStyle(svg).display === 'none') return;

    var rect = graph.getBoundingClientRect();
    var width = rect.width;
    var height = rect.height;
    if (!width || !height) return;

    var cx = width / 2;
    var cy = height / 2;
    var centerEl = graph.querySelector('.home-graph-center');
    var centerR = centerEl ? centerEl.offsetWidth / 2 : 0;
    var dotR = 3 * Math.sqrt((KG_VB_W / width) * (KG_VB_H / height));

    var nodes = graph.querySelectorAll('.home-graph-node');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var index = node.getAttribute('data-kg-i');
      var line = svg.querySelector('.kg-line-' + index);
      var dot = svg.querySelector('.kg-dot-' + index);
      if (!line) continue;

      var nodeRect = node.getBoundingClientRect();
      var nx = nodeRect.left - rect.left;
      var ny = nodeRect.top - rect.top;
      var nw = nodeRect.width;
      var nh = nodeRect.height;
      var dx = nx + nw / 2 - cx;
      var dy = ny + nh / 2 - cy;
      var len = Math.sqrt(dx * dx + dy * dy);
      if (!len) continue;

      var txe = dx > 0 ? (nx - cx) / dx : (dx < 0 ? (nx + nw - cx) / dx : -Infinity);
      var tye = dy > 0 ? (ny - cy) / dy : (dy < 0 ? (ny + nh - cy) / dy : -Infinity);
      var t = Math.max(txe, tye);
      if (!isFinite(t) || t <= 0 || t > 1) t = 1;

      var ex = cx + dx * t + (dx > 0 ? 6 : -6);
      var ey = cy + dy * t + (dy > 0 ? 6 : -6);
      var inner = centerR + 2;
      var sx = cx + dx / len * inner;
      var sy = cy + dy / len * inner;

      line.setAttribute('x1', (sx / width * KG_VB_W).toFixed(1));
      line.setAttribute('y1', (sy / height * KG_VB_H).toFixed(1));
      line.setAttribute('x2', (ex / width * KG_VB_W).toFixed(1));
      line.setAttribute('y2', (ey / height * KG_VB_H).toFixed(1));
      if (dot) {
        dot.setAttribute('cx', (ex / width * KG_VB_W).toFixed(1));
        dot.setAttribute('cy', (ey / height * KG_VB_H).toFixed(1));
        dot.setAttribute('r', dotR.toFixed(2));
      }
    }
  }

  function bindGraphResize() {
    if (window.__homeGraphResizeBound) return;
    window.__homeGraphResizeBound = true;
    var timer = null;
    window.addEventListener('resize', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(layoutGraphLinks, 120);
    });
  }

  function updateHomeFooterStats() {
    var footer = document.getElementById('home-footer');
    if (!footer) return;

    var domainsEl = footer.querySelector('[data-stat="domains"]');
    if (domainsEl && domainsEl.dataset.computed !== 'true') {
      var domainBlocks = document.querySelectorAll('.home-index--sitemap .sm-domain');
      domainsEl.textContent = String(domainBlocks.length);
      domainsEl.dataset.computed = 'true';
    }

    var docsEl = footer.querySelector('[data-stat="docs"]');
    if (docsEl && docsEl.dataset.computed !== 'true') {
      var indexLinks = document.querySelectorAll('.home-index--sitemap .sm-domain-links li a[href^="#/md/"]');
      docsEl.textContent = String(indexLinks.length);
      docsEl.dataset.computed = 'true';
    }
  }

  function renderLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
      return true;
    }
    return false;
  }

  function ensureLucideIcons() {
    if (renderLucideIcons()) return;
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

  function init() {
    bindHomeSearchKey();
    bindHomeSearchPanel();
    bindScrollLinks();
    layoutGraphLinks();
    bindGraphResize();
    updateHomeFooterStats();
    ensureLucideIcons();
  }

  state.init = init;
})();
