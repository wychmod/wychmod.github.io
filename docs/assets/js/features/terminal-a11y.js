
(function() {
  'use strict';
  if (window.__p009TerminalA11yBound) return;
  window.__p009TerminalA11yBound = true;

  var win = document.getElementById('terminal-window');
  var trigger = document.getElementById('terminal-trigger');
  var input = document.getElementById('terminal-input');
  var closeBtn = document.querySelector('#terminal-controls .terminal-control-btn.close');
  if (!win || !trigger) return;

  /* 打开前焦点: 在 IIFE 打开终端前(capture 阶段)记录当前焦点, 供关闭后恢复 (规范 §9.2/§10.4) */
  var pendingOpenFocus = null;
  var lastFocus = null;

  function isOpen() { return win.classList.contains('active'); }

  /* capture 阶段: 点击触发器 / [data-open-terminal] 前, 记录当前焦点 */
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#terminal-trigger') || t.closest('[data-open-terminal]')) {
      pendingOpenFocus = document.activeElement;
    }
  }, true);

  /* capture 阶段: Ctrl/Cmd+K 前, 记录当前焦点 */
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      pendingOpenFocus = document.activeElement;
    }
  }, true);

  /* 监听 #terminal-window 的 class 变化, 同步 aria-expanded 并管理焦点恢复
     (不拦截/不重写 IIFE 的 openTerminal/closeTerminal) */
  new MutationObserver(function() {
    var open = isOpen();
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      lastFocus = pendingOpenFocus || null;
      pendingOpenFocus = null;
      /* 输入框聚焦由 IIFE openTerminal 完成, 此处不重复 */
    } else {
      var target = lastFocus || trigger;
      setTimeout(function() {
        try { target.focus(); } catch (e) {}
      }, 0);
      lastFocus = null;
    }
  }).observe(win, { attributes: true, attributeFilter: ['class'] });

  /* 触发器键盘激活: Enter/Space -> 复用现有 click (IIFE 绑定 toggleTerminal) */
  trigger.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      trigger.click();
    }
  });

  /* 关闭按钮键盘激活: Enter/Space -> 复用现有 click (IIFE 绑定 closeTerminal) */
  if (closeBtn) {
    closeBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        closeBtn.click();
      }
    });
  }

  /* Focus trap: 终端打开时 Tab 在窗口内循环 (规范 §9.2: Tab 不跑到遮罩后页面)
     注意: IIFE 在 #terminal-input 上绑定 Tab=自动补全并 preventDefault;
     当焦点在输入框时不介入, 让 IIFE 完成 Tab 补全; 仅处理 close 等其它可聚焦元素的循环 */
  function focusables() {
    var nodes = win.querySelectorAll('input, button, a[href], [tabindex="0"]');
    return Array.prototype.slice.call(nodes).filter(function(n) {
      return n.offsetParent !== null || n === document.activeElement;
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    if (document.activeElement === input) return;  /* IIFE 处理 Tab 补全 */
    var f = focusables();
    if (f.length < 2) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      try { last.focus(); } catch (er) {}
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      try { first.focus(); } catch (er) {}
    }
  });
})();
