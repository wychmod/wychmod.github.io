/* =========================================================
   Article Nav - 文章页左侧「领域模块」折叠交互 (P011)
   依据: docs/_meta/ui-redesign/pages/01-mainline-article.md (权威)
   职责:
     1. 把 Docsify 侧边栏 9 个一级领域 (li > p + ul) 转为可展开/收起模块:
        领域编号 01-09 + 领域编码色圆点(--kg-0..8) + 折叠 chevron
     2. 含当前文章的领域自动展开; 用户手动展开/收起状态在会话内记忆
     3. 点击文章链接跳转沿用 Docsify 原生 <a>, 不拦截路由
   不做: 不改 Docsify 路由/搜索/终端; 不新建第二套侧栏数据源;
        数据真相仍是 _sidebar.md 渲染出的 .sidebar-nav DOM
   加载: 必须在 docsify.min.js 之前加载(以便注册插件, 同 homepage-v2.js)
   幂等: Docsify 每次路由都会重渲侧栏 DOM, doneEach 内重复执行安全
   ========================================================= */
(function () {
  'use strict';

  /* 用户手动展开/收起状态 (会话内记忆, 键为领域名; 含当前文章的领域始终强制展开) */
  var openState = {};

  function domainLabel(p) {
    var strong = p.querySelector('strong');
    return (strong ? strong.textContent : p.textContent).trim();
  }

  function setOpen(li, p, open) {
    li.classList.toggle('an-open', open);
    p.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* 把顶级 li (领域) 转为折叠模块; 每个领域 li 结构: p(领域名) + ul(子组/文章) */
  function transformDomains() {
    if (!document.body.classList.contains('is-article')) return;
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    var lis = nav.querySelectorAll(':scope > ul > li');
    var idx = 0;
    lis.forEach(function (li) {
      var p = li.querySelector(':scope > p');
      var ul = li.querySelector(':scope > ul');
      if (!p || !ul) return; /* 纯链接顶级条目(如有)保持原样 */

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

      /* 展开状态: 含当前文章(.active)的领域强制展开, 其余按用户记忆, 默认收起 */
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

  /* 事件委托: 绑定一次, 对每次路由重渲的新 DOM 均生效 */
  if (!window.__articleNavBound) {
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

  /* 注册 Docsify 插件 (必须在 docsify.min.js 运行前) */
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = window.$docsify.plugins || [];
  window.$docsify.plugins.push(function (hook) {
    hook.doneEach(transformDomains);
  });
})();
