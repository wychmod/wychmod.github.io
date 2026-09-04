(function () {
  'use strict';

  var shell = window.WYCHMOD_SHELL = window.WYCHMOD_SHELL || {};
  var state = shell.homeMotion = shell.homeMotion || {};

  var SCROLL_SELECTOR = '[data-motion~="fade-up"]';

  /* 直接点亮全部滚动浮现元素(降级路径 / 路由往返重播禁止时使用) */
  function revealAll() {
    var items = document.querySelectorAll(SCROLL_SELECTOR);
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 页脚统计数字滚动计数: 以 updateHomeFooterStats 写入的真实计算值为目标 */
  function countUp(el) {
    var target = parseInt(el.dataset.statValue, 10);
    if (!isFinite(target) || target < 0) return;
    var duration = 800;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* armed 时先把统计归零, 计数动画在页脚进入视口后启动 */
  function armFooterStats() {
    ['domains', 'docs'].forEach(function (key) {
      var el = document.querySelector('#home-footer [data-stat="' + key + '"]');
      if (el && el.dataset.statValue) el.textContent = '0';
    });
  }

  function observeFooterStats() {
    var stats = document.querySelector('.home-footer-stats');
    if (!stats || stats.dataset.countBound === 'true') return;
    stats.dataset.countBound = 'true';
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        countUp(document.querySelector('#home-footer [data-stat="domains"]'));
        countUp(document.querySelector('#home-footer [data-stat="docs"]'));
      });
    }, { threshold: 0 });
    io.observe(stats);
  }

  function init() {
    var body = document.body;
    /* 幂等门禁: 仅首页执行; 路由往返(已播过)不重新入场 */
    if (!body.classList.contains('is-home')) return;

    if (window.__homeMotionPlayed) {
      body.classList.remove('home-motion-armed');
      revealAll();
      return;
    }
    window.__homeMotionPlayed = true;

    body.classList.add('home-motion-armed');
    armFooterStats();

    /* 两帧后触发封面入场, 保证隐藏态先完成一次绘制 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        body.classList.add('home-motion-in');
      });
    });

    /* 无 IntersectionObserver 环境: 全部直接点亮, 不隐藏内容 */
    if (!('IntersectionObserver' in window)) { revealAll(); return; }

    observeFooterStats();

    var io = new IntersectionObserver(function (entries) {
      /* 同一批进入视口的元素依次错开 70ms, 形成自然 stagger */
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        if (i > 0) entry.target.style.setProperty('--motion-delay', (i * 70) + 'ms');
        entry.target.classList.add('is-visible');
        i++;
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll(SCROLL_SELECTOR).forEach(function (el) {
      if (el.dataset.motionBound === 'true') return;
      el.dataset.motionBound = 'true';
      io.observe(el);
    });
  }

  state.init = init;
})();
