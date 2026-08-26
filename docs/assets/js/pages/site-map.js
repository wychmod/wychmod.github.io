(function () {
  'use strict';

  var shell = window.WYCHMOD_SHELL = window.WYCHMOD_SHELL || {};
  var state = shell.siteMap = shell.siteMap || {};

  var DOMAINS = '.sm-domain';
  var QUICK_ITEMS = '.sm-quick-item';
  var TOC_BTN = '.sm-toc-toggle';
  var OFFSET = 160;
  var lastWasMobile = window.innerWidth <= 1024;

  function $(sel) {
    return document.querySelectorAll(sel);
  }

  function applyDomainState() {
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
    var span = btn.querySelector('span');
    if (span) span.textContent = open ? '收起目录' : '打开目录';
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
      if (item.dataset.scrollBound === 'true') return;
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

  function bindSummaryToggle() {
    $(DOMAINS).forEach(function (d) {
      if (d.dataset.toggleBound) return;
      d.dataset.toggleBound = 'true';
      d.addEventListener('toggle', updateTocButton);
    });
  }

  function init() {
    if (!document.querySelector('.sm-page')) return;
    applyDomainState();
    initTocButton();
    updateTocButton();
    updateCurrentAnchor();
    smoothScrollForQuickNav();
    bindSummaryToggle();
    if (!window.__wychmodSiteMapGlobalBound) {
      window.__wychmodSiteMapGlobalBound = true;
      window.addEventListener('scroll', updateCurrentAnchor, { passive: true });
      window.addEventListener('resize', function () {
        applyDomainState();
        updateTocButton();
        updateCurrentAnchor();
      });
    }
  }

  state.init = init;
})();
