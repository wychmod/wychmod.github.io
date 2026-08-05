/* =========================================================
   wychmod 个人主页 & 简历页 - 共享交互
   - 导航滚动状态 / 移动端折叠
   - 锚点平滑滚动 / active nav
   - 滚动进入动画
   - 技术栈进度条
   - GitHub 贡献图 & 统计（诚实降级）
   - Markdown 项目描述渲染
   - 联系表单(mailto 兜底)
   ========================================================= */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

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
    const updateToggle = () => {
      const isOpen = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '✕' : '☰';
    };

    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      updateToggle();
    });

    links.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        links.classList.remove('open');
        updateToggle();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        updateToggle();
        toggle.focus();
      }
    });

    updateToggle();
  }

  /* ---------- 打印按钮（事件委托） ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-print]');
    if (btn) {
      e.preventDefault();
      window.print();
    }
  });

  /* ---------- 滚动进入动画 ---------- */
  const revealTargets = document.querySelectorAll(
    '.personal-section, .personal-stack-card, .personal-project, .personal-contact-card, ' +
      '.personal-timeline-item, .personal-focus-item, .resume-section, .resume-entry, .resume-skill'
  );

  if (revealTargets.length) {
    revealTargets.forEach((el) => el.classList.add('me-reveal'));

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
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
      revealTargets.forEach((el) => io.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add('me-in'));
    }
  }

  /* ---------- 技术栈进度条进入动画 ---------- */
  const techBars = document.querySelectorAll('.personal-tech-bar i, .me-tech-bar i');
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

  /* ---------- GitHub 贡献图 & 统计 ---------- */
  const githubUser = 'wychmod';
  const stats = document.getElementById('me-github-stats');
  const heatmap = document.getElementById('me-github-heatmap');
  const langChart = document.getElementById('me-github-languages');

  const honestFallback = () => {
    if (stats) {
      stats.innerHTML = `
        <div class="personal-github-fallback" style="grid-column: 1 / -1;">
          GitHub 实时数据暂时不可用。<br>
          你可以访问 <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">github.com/${githubUser}</a> 查看最新公开记录。
        </div>
      `;
    }
    if (heatmap) {
      heatmap.innerHTML = `
        <div class="personal-github-fallback">
          GitHub 贡献图暂不可用（网络或 API 限流）。<br>
          实时贡献图请见
          <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">github.com/${githubUser}</a>。
        </div>
      `;
    }
  };

  const refreshBtn = document.querySelector('[data-refresh-heatmap]');
  const heatmapImg = document.querySelector('.personal-github-img-wrap > img.personal-github-img, .me-github-img-wrap > img.me-github-img');

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

  if (heatmap) {
    const bust = (url) => {
      const sep = url.includes('?') ? '&' : '?';
      return url + sep + '_ts=' + Date.now();
    };

    const candidates = [
      bust(`https://ghchart.rshah.org/${githubUser}`),
      bust(`https://github.com/users/${githubUser}/contributions?type=svg`),
      bust(`https://streak-stats.demolab.com/?user=${githubUser}&theme=dark`),
    ];

    let candidateIdx = 0;
    const img = new Image();
    img.alt = `${githubUser} GitHub 贡献图(最近一年)`;
    img.className = 'personal-github-img';
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
      if (img.naturalWidth > 0 && img.naturalWidth < 100) {
        tryNext();
        return;
      }
      heatmap.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'personal-github-img-wrap';
      wrap.appendChild(img);

      const reload = document.createElement('button');
      reload.type = 'button';
      reload.className = 'personal-heatmap-reload';
      reload.title = '刷新贡献图(强制绕过缓存)';
      reload.textContent = '↻';
      reload.addEventListener('click', () => {
        candidateIdx = 0;
        candidates[0] = bust(`https://ghchart.rshah.org/${githubUser}`);
        candidates[1] = bust(
          `https://github.com/users/${githubUser}/contributions?type=svg`
        );
        candidates[2] = bust(
          `https://streak-stats.demolab.com/?user=${githubUser}&theme=dark`
        );
        heatmap.innerHTML =
          '<div class="personal-github-fallback">加载中...</div>';
        tryNext();
      });
      wrap.appendChild(reload);
      heatmap.appendChild(wrap);
    };

    img.onerror = () => {
      tryNext();
    };

    function showHeatmapFallback() {
      heatmap.innerHTML = `
        <div class="personal-github-fallback">
          GitHub 贡献图暂不可用（可能所有图床都不稳定或被墙）。<br />
          实时贡献图请见
          <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">github.com/${githubUser}</a>。
        </div>
      `;
    }

    tryNext();
  }

  if (stats) {
    fetch(`https://api.github.com/users/${githubUser}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        stats.innerHTML = `
          <div class="personal-github-stat"><b>${data.public_repos || 0}</b><span>PUBLIC REPOS</span></div>
          <div class="personal-github-stat"><b>${data.followers || 0}</b><span>FOLLOWERS</span></div>
          <div class="personal-github-stat"><b>${data.following || 0}</b><span>FOLLOWING</span></div>
          <div class="personal-github-stat"><b>${new Date(data.created_at).getFullYear()}</b><span>JOINED</span></div>
        `;
      })
      .catch((e) => {
        console.warn('[me-page] GitHub user API failed:', e);
        honestFallback();
      });
  }

  if (langChart) {
    fetch(
      `https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`
    )
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
        const colors = [
          '#24D18F',
          '#C8A96B',
          '#58B7C7',
          '#E6663E',
          '#66685F',
          '#20211D',
        ];
        langChart.innerHTML = `
          <div style="display:grid; grid-template-columns:repeat(${top.length}, 1fr); gap:8px; margin-top:8px;">
            ${top
              .map(([lang, count], i) => {
                const pct = total ? Math.round((count / total) * 100) : 0;
                return `
                  <div style="text-align:center;">
                    <div style="font-family: var(--studio-font-mono); font-size: 18px; color: ${
                      colors[i] || '#24D18F'
                    }; font-weight: 700;">${pct}%</div>
                    <div style="font-family: var(--studio-font-mono); font-size: 11px; color: var(--studio-on-dark-muted); margin-top: 2px;">${lang}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      })
      .catch(() => {
        langChart.innerHTML = '';
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
            el.classList.add('personal-project-desc-md');
          }
        });
      })
      .catch((e) => {
        console.warn('[me-page] marked.js failed:', e);
        mdBlocks.forEach((el) => {
          el.classList.add('personal-project-desc-md');
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
      const mailtoUrl = `mailto:wychmod@foxmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      showFormHint(
        form,
        '正在唤起邮件客户端…如未自动打开，请直接发邮件到 wychmod@foxmail.com',
        'ok'
      );
      window.location.href = mailtoUrl;

      setTimeout(() => {
        form.reset();
      }, 600);
    });
  }

  function showFormHint(form, text, level) {
    const hint = form.querySelector('.personal-form-hint');
    if (!hint) return;
    hint.textContent = text;
    hint.style.color =
      level === 'warn'
        ? '#E6663E'
        : level === 'ok'
        ? '#24D18F'
        : 'rgba(242, 239, 231, 0.7)';
  }

  /* ---------- 平滑滚动(锚点) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }
      }
    });
  });

  /* ---------- 锚点高亮 ---------- */
  const sections = document.querySelectorAll('section[id]');
  if (sections.length && 'IntersectionObserver' in window) {
    const navLinks = document.querySelectorAll('.me-nav-link, .personal-note-index a, .resume-toc a');
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
            navLinks.forEach((l) => l.classList.remove('active', 'is-active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach((s) => secIO.observe(s));
  }
})();
