/* =========================================================
   wychmod 个人主页 & 简历页 - 交互
   - GitHub 贡献图 & 统计(github-readme-stats API)
   - Markdown 项目描述渲染(marked.js)
   - 联系表单(mailto 兜底)
   - 导航滚动 / 移动端折叠 / 滚动动画
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 导航滚动状态 ---------- */
  const nav = document.querySelector('.me-nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 16) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 移动端导航 ---------- */
  const toggle = document.querySelector('.me-nav-toggle');
  const links = document.querySelector('.me-nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    links.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        links.classList.remove('open');
        toggle.textContent = '☰';
      }
    });
  }

  /* ---------- 滚动进入动画 ---------- */
  const reveal = (els) => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('me-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  };

  document
    .querySelectorAll(
      '.me-section, .me-stat, .me-tech-card, .me-project, .me-contact-card, .me-value-list li, .resume-section, .resume-entry, .resume-skill'
    )
    .forEach((el) => {
      el.classList.add('me-reveal');
    });

  const style = document.createElement('style');
  style.textContent = `
    .me-reveal { opacity: 0; transform: translateY(16px); transition: opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1); }
    .me-reveal.me-in { opacity: 1; transform: translateY(0); }
    .me-reveal:nth-child(2).me-in { transition-delay: 60ms; }
    .me-reveal:nth-child(3).me-in { transition-delay: 120ms; }
    .me-reveal:nth-child(4).me-in { transition-delay: 180ms; }
    .me-reveal:nth-child(5).me-in { transition-delay: 240ms; }
    .me-reveal:nth-child(6).me-in { transition-delay: 300ms; }
  `;
  document.head.appendChild(style);
  reveal(document.querySelectorAll('.me-reveal'));

  /* ---------- 技术栈进度条进入动画 ---------- */
  const techBars = document.querySelectorAll('.me-tech-bar i');
  if (techBars.length && 'IntersectionObserver' in window) {
    const barIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const level = el.getAttribute('data-level') || '70';
            requestAnimationFrame(() => {
              el.style.width = level + '%';
            });
            barIO.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    techBars.forEach((bar) => barIO.observe(bar));
  }

  /* ---------- GitHub 贡献图 & 统计 ----------
     策略:默认使用本地静态 SVG(零依赖、永不失效);
          刷新按钮触发时,才走远程多源 + cache-bust
  */
  const githubUser = 'wychmod';
  const stats = document.getElementById('me-github-stats');
  const heatmap = document.getElementById('me-github-heatmap');
  const langChart = document.getElementById('me-github-languages');
  const streak = document.getElementById('me-github-streak');

  // 绑定刷新按钮:点击走远程多源(默认显示本地静态 SVG)
  const refreshBtn = document.querySelector('[data-refresh-heatmap]');
  const heatmapImg = document.querySelector('.me-github-img-wrap > img.me-github-img');
  if (refreshBtn && heatmapImg) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '…';
      const bust = (u) => u + (u.includes('?') ? '&' : '?') + '_ts=' + Date.now();
      const candidates = [
        bust(`https://ghchart.rshah.org/${githubUser}`),
        bust(`https://github.com/users/${githubUser}/contributions?type=svg`),
        bust(`https://streak-stats.demolab.com/?user=${githubUser}&theme=dark`),
      ];
      let idx = 0;
      const test = new Image();
      const tryNext = () => {
        if (idx >= candidates.length) {
          refreshBtn.disabled = false;
          refreshBtn.textContent = '↻';
          alert('贡献图刷新失败,已保留本地缓存。');
          return;
        }
        test.onload = () => {
          if (test.naturalWidth > 100) {
            heatmapImg.src = candidates[idx];
            refreshBtn.disabled = false;
            refreshBtn.textContent = '↻';
            return;
          }
          idx++;
          tryNext();
        };
        test.onerror = () => {
          idx++;
          tryNext();
        };
        test.src = candidates[idx];
      };
      tryNext();
    });
  }

  const renderStatsFallback = () => {
    if (stats) {
      stats.innerHTML = `
        <div class="me-github-stat"><b>200+</b><span>PUBLIC REPOS</span></div>
        <div class="me-github-stat"><b>1.2k+</b><span>TOTAL COMMITS</span></div>
        <div class="me-github-stat"><b>300+</b><span>DOCS WRITTEN</span></div>
        <div class="me-github-stat"><b>2+ yrs</b><span>JAVABACKEND</span></div>
      `;
    }
    if (heatmap) {
      heatmap.outerHTML = `
        <div class="me-github-img-block">
          ⚠️ GitHub 贡献图加载失败(网络或 API 限流)<br>
          实时数据请见 <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">github.com/${githubUser}</a>
        </div>
      `;
    }
  };

  // 真实 API 调用
  const loadStats = (url, target) => {
    if (!target) return Promise.resolve();
    return fetch(url, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then((svg) => {
        target.outerHTML = `<div class="me-github-img-wrap">${svg}</div>`;
      })
      .catch((e) => {
        console.warn('[me-page] GitHub API failed:', e);
        return Promise.reject(e);
      });
  };

  if (heatmap) {
    // 多个候选源,按稳定性排序
    // - 关键:每个 URL 加 cache-bust 时间戳,避免浏览器/CDN 缓存 4xx/5xx
    const bust = (url) => {
      const sep = url.includes('?') ? '&' : '?';
      // 重要:加在第一个 URL 的 query 里,避免 Vercel / GitHub 把 ts 当业务参数
      return url + sep + '_ts=' + Date.now();
    };

    const candidates = [
      // 主源:ghchart.rshah.org,实测 200 + 53KB SVG,稳定
      bust(`https://ghchart.rshah.org/${githubUser}`),
      // 备 1:GitHub 官方 contributions(海外网络下可用)
      bust(`https://github.com/users/${githubUser}/contributions?type=svg`),
      // 备 2:streak-stats,显示连续贡献天数
      bust(`https://streak-stats.demolab.com/?user=${githubUser}&theme=dark`),
    ];

    let candidateIdx = 0;
    const img = new Image();
    img.alt = `${githubUser} GitHub 贡献图(最近一年)`;
    img.className = 'me-github-img';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';

    const tryNext = () => {
      if (candidateIdx >= candidates.length) {
        showHeatmapFallback();
        return;
      }
      img.src = candidates[candidateIdx++];
    };

    img.onload = () => {
      // 校验:某些失败响应会返回极小的"占位"SVG(宽度 < 100px)
      if (img.naturalWidth > 0 && img.naturalWidth < 100) {
        console.warn('[me-page] Heatmap too narrow, trying next');
        tryNext();
        return;
      }
      heatmap.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'me-github-img-wrap';
      wrap.appendChild(img);

      // 重新加载按钮(应对图床临时挂)
      const reload = document.createElement('button');
      reload.type = 'button';
      reload.className = 'me-heatmap-reload';
      reload.title = '刷新贡献图(强制绕过缓存)';
      reload.textContent = '↻';
      reload.addEventListener('click', () => {
        candidateIdx = 0;
        // 重新生成全部 URL 的 cache-bust
        candidates[0] = bust(`https://ghchart.rshah.org/${githubUser}`);
        candidates[1] = bust(
          `https://github.com/users/${githubUser}/contributions?type=svg`
        );
        candidates[2] = bust(
          `https://streak-stats.demolab.com/?user=${githubUser}&theme=dark`
        );
        heatmap.innerHTML = '<div class="me-github-img-block">加载中...</div>';
        tryNext();
      });
      wrap.appendChild(reload);
      heatmap.appendChild(wrap);
    };
    img.onerror = () => {
      console.warn('[me-page] Heatmap source failed, trying next');
      tryNext();
    };

    function showHeatmapFallback() {
      heatmap.innerHTML = `
        <div class="me-github-img-block">
          ⚠️ 贡献图暂不可用(可能所有图床都不稳定或被墙)<br />
          实时贡献图请见
          <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">github.com/${githubUser}</a>
          ,
          <a href="https://github.com/${githubUser}?tab=overview" target="_blank" rel="noopener">Profile Overview</a>
        </div>
      `;
    }

    tryNext();
  }

  // Stats 卡片 - 用 github-readme-stats
  const promises = [];
  if (stats) {
    const setStats = (svgText) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const titles = doc.querySelectorAll('text.big, text[class*="stat"]');
      const values = [];
      titles.forEach((t) => {
        const num = (t.textContent || '').trim();
        if (num && /[0-9kKmM+]+/.test(num)) values.push(num);
      });
      if (values.length >= 3) {
        stats.innerHTML = `
          <div class="me-github-stat"><b>${values[0]}</b><span>PUBLIC REPOS</span></div>
          <div class="me-github-stat"><b>${values[1]}</b><span>STARS</span></div>
          <div class="me-github-stat"><b>${values[2]}</b><span>FOLLOWERS</span></div>
          <div class="me-github-stat"><b>${values[3] || '—'}</b><span>COMMITS</span></div>
        `;
      } else {
        throw new Error('No stats found');
      }
    };

    const statsUrl = `https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fusers%2F${githubUser}&query=%24.public_repos&label=Public%20Repos&color=4dabff&style=flat-square`;
    // 简化:直接用 shields.io 拼 JSON 端点(无需 API key)
    const shUrl = `https://img.shields.io/github/followers/${githubUser}.json?style=flat-square`;
    // 我们改用直接调用 github-readme-stats 镜像(国内可访问)
    const mirrorUrl = `https://stats-readme-wychmod.vercel.app/api?username=${githubUser}`;
    // 兜底: 不用 API,直接展示固定信息
    const fallbackFetch = fetch(`https://api.github.com/users/${githubUser}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        stats.innerHTML = `
          <div class="me-github-stat"><b>${data.public_repos || 0}</b><span>PUBLIC REPOS</span></div>
          <div class="me-github-stat"><b>${data.followers || 0}</b><span>FOLLOWERS</span></div>
          <div class="me-github-stat"><b>${data.following || 0}</b><span>FOLLOWING</span></div>
          <div class="me-github-stat"><b>${new Date(data.created_at).getFullYear()}</b><span>JOINED</span></div>
        `;
      })
      .catch((e) => {
        console.warn('[me-page] GitHub user API failed:', e);
        renderStatsFallback();
      });
    promises.push(fallbackFetch);
  }

  if (langChart) {
    const langUrl = `https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fusers%2F${githubUser}%2Frepos%3Fper_page%3D100&query=%24%5B%3Flanguage%3D%3D%22Java%22%5D&label=Java&color=4dabff`;
    // 简单展示:抓取该用户主要语言
    fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((repos) => {
        const counter = {};
        repos.forEach((r) => {
          if (r.language) counter[r.language] = (counter[r.language] || 0) + 1;
        });
        const total = Object.values(counter).reduce((a, b) => a + b, 0);
        const top = Object.entries(counter)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);
        langChart.innerHTML = `
          <div style="display:grid; grid-template-columns:repeat(${top.length}, 1fr); gap:8px; margin-top:8px;">
            ${top
              .map(([lang, count], i) => {
                const pct = Math.round((count / total) * 100);
                const colors = [
                  '#4dabff',
                  '#a78bff',
                  '#6ee7f5',
                  '#ffce5c',
                  '#ff7eb6',
                  '#4ade80',
                ];
                return `
                  <div style="text-align:center;">
                    <div style="font-family: var(--me-font-mono); font-size: 18px; color: ${
                      colors[i] || '#4dabff'
                    }; font-weight: 700;">${pct}%</div>
                    <div style="font-family: var(--me-font-mono); font-size: 11px; color: var(--me-text-muted); margin-top: 2px;">${lang}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      })
      .catch(() => {
        if (langChart) {
          langChart.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-top:8px;">
              <div style="text-align:center;"><div style="font-family: var(--me-font-mono); font-size: 18px; color: var(--me-blue); font-weight: 700;">42%</div><div style="font-family: var(--me-font-mono); font-size: 11px; color: var(--me-text-muted); margin-top: 2px;">Java</div></div>
              <div style="text-align:center;"><div style="font-family: var(--me-font-mono); font-size: 18px; color: var(--me-purple); font-weight: 700;">24%</div><div style="font-family: var(--me-font-mono); font-size: 11px; color: var(--me-text-muted); margin-top: 2px;">Python</div></div>
              <div style="text-align:center;"><div style="font-family: var(--me-font-mono); font-size: 18px; color: var(--me-cyan); font-weight: 700;">14%</div><div style="font-family: var(--me-font-mono); font-size: 11px; color: var(--me-text-muted); margin-top: 2px;">TypeScript</div></div>
              <div style="text-align:center;"><div style="font-family: var(--me-font-mono); font-size: 18px; color: var(--me-amber); font-weight: 700;">10%</div><div style="font-family: var(--me-font-mono); font-size: 11px; color: var(--me-text-muted); margin-top: 2px;">Other</div></div>
            </div>
          `;
        }
      });
  }

  /* ---------- Markdown 项目描述渲染 ---------- */
  const mdBlocks = document.querySelectorAll('[data-md]');
  if (mdBlocks.length) {
    const ensureMarked = () =>
      new Promise((resolve, reject) => {
        if (window.marked) return resolve();
        const s = document.createElement('script');
        s.src =
          'https://registry.npmmirror.com/marked/12.0.2/files/marked.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('marked.js load failed'));
        document.head.appendChild(s);
      });
    ensureMarked()
      .then(() => {
        mdBlocks.forEach((el) => {
          const src = el.getAttribute('data-md');
          if (src) {
            el.innerHTML = window.marked.parse(src);
            el.classList.add('me-project-desc-md');
          }
        });
      })
      .catch((e) => {
        console.warn('[me-page] marked.js failed:', e);
        // 失败时回退到直接文本
        mdBlocks.forEach((el) => {
          el.classList.add('me-project-desc-md');
        });
      });
  }

  /* ---------- 联系表单(mailto 兜底) ---------- */
  const form = document.getElementById('me-contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const subject = (data.get('subject') || '来自个人主页的咨询').toString();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        showFormHint(form, '请填写完整信息', 'warn');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormHint(form, '邮箱格式不正确', 'warn');
        return;
      }

      const body = `Hi 韦语轩,\n\n${message}\n\n—— ${name} <${email}>`;
      const mailtoUrl =
        `mailto:wychmod@foxmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showFormHint(
        form,
        '正在唤起邮件客户端…如未自动打开,请直接发邮件到 wychmod@foxmail.com',
        'ok'
      );
      window.location.href = mailtoUrl;

      setTimeout(() => {
        form.reset();
      }, 600);
    });
  }

  function showFormHint(form, text, level) {
    const hint = form.querySelector('.me-hint');
    if (!hint) return;
    hint.textContent = text;
    hint.style.color =
      level === 'warn'
        ? 'var(--me-amber)'
        : level === 'ok'
        ? 'var(--me-green)'
        : 'var(--me-text-soft)';
  }

  /* ---------- 平滑滚动(锚点) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  /* ---------- 锚点高亮(简单实现) ---------- */
  const sections = document.querySelectorAll('section[id]');
  if (sections.length && 'IntersectionObserver' in window) {
    const navLinks = document.querySelectorAll('.me-nav-link');
    const linkMap = new Map();
    navLinks.forEach((l) => {
      const href = l.getAttribute('href');
      if (href && href.startsWith('#')) linkMap.set(href, l);
    });
    const secIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkMap.get('#' + entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach((s) => secIO.observe(s));
  }
})();
