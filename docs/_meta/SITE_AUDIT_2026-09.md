# 全站巡检报告

> 巡检对象：wychmod.github.io（Docsify 多页面站点）
> 巡检方式：静态代码审查 + Playwright 真机渲染（Chromium，6 种视口 × 9 个页面）
> 巡检时间：2026-09-26
> 巡检视口：360 / 390 / 768 / 1280 / 1920 / 2560，另补测 830–1600 中间档

> **修复进度（2026-09-26 更新）**：P0 全部 3 项、P1 全部 5 项**已修复并通过 18/18 回归验证**。
> 另修复巡检中漏报的 2 个真实缺陷（触屏复制按钮隐形、resume/me 移动端横向溢出 94px）。
> 详见下文各条目的「✅ 已修复」标注与文末「修复记录」。
> **P2 / P3 尚未处理。**
> ⚠️ 唯一需用户线下执行的事项：Gitalk 代理部署（见 `GITALK_PROXY_SETUP.md`）。

---

## 结论速览

| 等级 | 数量 | 说明 | 状态 |
|---|---|---|---|
| 🔴 P0 阻断 | 3 | CDN 403 导致两个插件全站静默失效；密钥明文入库 | ✅ 已修复 |
| 🟠 P1 严重 | 5 | 前台可感知的功能/交互/可访问性缺陷 | ✅ 已修复 |
| 🟡 P2 一般 | 9 | 样式一致性、响应式、健壮性问题 | ⬜ 待处理 |
| 🔵 P3 优化 | 10 | 性能、代码结构、可维护性 | ⬜ 待处理 |

**本次修复摘要**：`docsify-copy-code` 与 `docsify-mermaid` 从 npmmirror 加载返回 **403** 已通过本地化解决（实测恢复：9 个 mermaid 块全部渲染出 SVG、复制按钮覆盖 5/5 代码块）；Gitalk 明文密钥已移出源码并配套 Cloudflare Worker 代理；移动端抽屉焦点逃逸、按钮对比度、页脚统计等问题全部修复。


---

## 一、功能缺陷（Bug / 异常逻辑）

### 🔴 P0-1　代码复制按钮全站失效　✅ 已修复

- **位置**：`docs/index.html:234`
- **现象**：`https://registry.npmmirror.com/docsify-copy-code/3.0.0/files/dist/docsify-copy-code.min.js` 返回 **HTTP 403**。实测文章页 `pre` 元素 14 个，`.docsify-copy-code-button` **0 个**。`$docsify.copyCode` 配置项（`index.html:148-152`）形同虚设。
- **影响**：技术笔记站的核心体验之一（复制代码）完全不可用。
- **修复**：插件本地 vendored 到 `docs/assets/js/docsify-copy-code.min.js`（3.9KB，取自 jsdelivr），`index.html` 改本地引用。实测复制按钮已覆盖 5/5 代码块，点击可写入剪贴板。
- **附带修复**：触屏设备无 hover，插件靠 `pre:hover` 显形会导致按钮 `opacity:0` 却仍可点击（隐形陷阱）—— 已在 `article-reading.css` 补 `@media (hover:none),(pointer:coarse)` 常驻显示。

### 🔴 P0-2　Mermaid 流程图全站未渲染　✅ 已修复

- **位置**：`docs/index.html:228`
- **现象**：`docsify-mermaid/2.0.1` 同样返回 **403**。实测含 mermaid 的文章页有 9 个 `<code class="lang-mermaid">` 块，渲染出的 `<svg>` 为 **0 个**，页面上只显示原始 `flowchart TD ...` 文本。
- **影响**：AI/Agent 类文档（`05-AI与Agent/`）大量依赖流程图，当前全部退化为纯文本，可读性严重下降。
- **修复**：插件本地化到 `docs/assets/js/docsify-mermaid.min.js`。实测 9 个块全部渲染出 SVG，无残留 `pre`。
- **附带修复（重要）**：原先 mermaid **本体**走 `<script type="module">`（异步），而插件是普通同步 script，`doneEach` 中直接 `mermaid.run()` 存在加载竞态。已改为 `window.__mermaidReady = import(...)` Promise，插件 `doneEach` 等待该 Promise 后再渲染。
- **附带修复**：`startOnLoad` 由 `true` 改 `false`，避免与插件重复渲染；原写在 `$docsify.mermaid` 的 Notion editorial 主题变量**实际无人读取**（该键非插件约定），已迁移到真正的 `mermaid.initialize()`。
- **澄清**：`mermaid` **本体**在 npmmirror 一直是可用的（76 字节重定向入口 + 330KB chunk 均返回 200），坏的只有插件本身。

### 🔴 P0-3　`gitalk clientSecret` 明文提交到仓库　✅ 已修复（需用户线下完成代理部署）

- **位置**：`docs/index.html:100`
- **现象**：`clientSecret: '94793d5bac0c884a8798ea941f7c5bc9fb004720'` 明文写在**公开的 GitHub Pages 仓库**中。实测页面亦产生 `401 https://api.github.com/user`。
- **影响**：任何人均可在 JS 源码中读取该密钥，可被用于伪造应用身份、消耗配额。
- **修复**：
  - `index.html` 移除明文 secret，改为 `GITALK_PROXY = { apiBase, tokenUrl }` 占位；留空时 `gitalkConfig = null`，`bootstrap.js` 静默跳过评论渲染（无控制台报错）。
  - 新增 Cloudflare Worker 代理 `docs/_meta/gitalk-proxy-worker.js` 与部署指南 `docs/_meta/GITALK_PROXY_SETUP.md`。
  - **关键技术点**：Gitalk 有**两处**使用 secret（① 换 token；② 匿名读评论时作为 query 参数直连 `api.github.com`），自带的 `proxy` 配置**只管①**。因此额外 patch 了 `gitalk.min.js` 一处，使其 `baseURL` 读 `window.GITALK_API_BASE`（未设置时回落官方地址，行为不变，无侵入）。
- **⚠️ 待用户执行**：轮换 GitHub OAuth secret（旧值在 Git 历史中仍然存在，必须作废）→ 部署 Worker → 回填两处地址。在完成前评论区不显示（静默降级）。


### 🟠 P1-1　移动端抽屉关闭后，Tab 键焦点落在屏幕外　✅ 已修复

- **位置**：`docs/assets/js/pages/article.js:97-105`（`closeDrawer`）、`docs/assets/css/article-reading.css:379-400`
- **现象**：移动端（≤1024px）侧栏通过 `transform: translateX(-335px)` 移出屏幕，但**未设置 `inert`、`aria-hidden`、`visibility: hidden`、`display: none`**。实测在 390px 视口连按 14 次 Tab，**14 次全部落在屏外**的侧栏链接上（`left=-295, right=-17`）。侧栏 80 个链接中 9 个仍可聚焦。
- **影响**：键盘 / 屏幕阅读器用户 Tab 后"焦点消失"，完全无法操作正文。WCAG 2.4.3（焦点顺序）、2.4.7（焦点可见）明确违规。
- **修复**：`bootstrap.js` 新增 `syncSidebarInert()`，在「文章页 + 移动端 + 收起态」给 `.sidebar` 加 `inert` + `aria-hidden="true"`，其余场景移除。实测收起态 14 次 Tab **屏外 0 次**，展开态与桌面端均可正常聚焦（未误加）。
- **实现注意**：抽屉开合只反映在 `body` 自身 class 上，故单独用一个只监听 `body` 属性的 MutationObserver；**不可**用 `subtree + attributeFilter:['class']`，否则会被 `is-visible` 之类高频 class 变更打爆，反成性能回退。

### 🟠 P1-2　无索引文档页产生 2 个 404 请求　⬜ 未处理（低优先）

- **位置**：`docs/index.html:111`（`loadSidebar: true`）
- **现象**：访问 `#/md/01-计算机基础/00-Java与JVM` 时，浏览器额外请求 `md/01-计算机基础/_sidebar.md` 与 `md/_sidebar.md`，两者均 **404**。（注意：`10-项目实战/02-FlowHub/` 目录有 `_sidebar.md`，故不报 404 —— 属正常多级侧边栏机制。）
- **影响**：轻微。每次导航多 2 个失败请求，污染控制台、浪费 RTT。
- **建议**：可接受，但建议在各分类目录补一个空 `_sidebar.md`（或配置 `alias`）以消除噪音。

### 🟠 P1-3　首页页脚统计数字首屏显示为 0　✅ 已修复

- **位置**：`docs/assets/js/pages/home-motion.js:32-53, 68`
- **现象**：`armFooterStats()` 在页面加载时立即把 `domains`/`docs` 清成 `'0'`，真实值要等页脚滚入视口后 `countUp()` 才写入。
- **影响**：首屏数据展示错误（实测 `domains="0"` 而真实值 11），可信度受损。
- **修复**：① 增加「页脚已在视口内则不归零」判断；② 把「无 `IntersectionObserver` 时降级返回」**提到归零之前** —— 原来先归零再降级返回，数字没有任何回调能恢复，会**永久停在 0**。实测滚动到页脚后正确显示 11/77，降级路径下亦保持真实值。

### 🟠 P1-4　`.nav-cta` 主按钮文字色被旧主题覆盖　✅ 已修复

- **位置**：`docs/assets/css/homepage-v2.css:266` vs `docs/assets/css/modern-theme.css:228`
- **现象**：实测 `.nav-cta` 最终 `color: rgb(95,93,87)`（= `#5f5d57`，`--slate`），而 CSS 里写的期望值是 `#0d100e`。原因是 `.app-nav a`(0,1,1) 特异性高于 `.nav-cta`(0,1,0)，两者都是 `!important` 时前者取胜。
- **影响**：绿色底上的灰字对比度仅 **3.32:1**，低于 WCAG AA 4.5:1；视觉上按钮显得"脏"。
- **修复**：提升为 `.app-nav .nav-cta` (0,2,0)，常态对比度 **9.65:1**。
- **顺带发现**：hover 态同样是 **3.20:1**（`--studio-green-dark` 底 + `--studio-on-dark` 字）—— 此前因常态色就被覆盖，hover 规则同样没机会生效，问题被掩盖。已改为反色方案（`--studio-ink-900` 底 + `--studio-green` 字）= **9.13:1**，零新增色值，并给出更明确的悬停反馈。


### 🟠 P1-5　`gitalk clientSecret` 明文提交到仓库

- **位置**：`docs/index.html:100`
- **现象**：`clientSecret: '94793d5bac0c884a8798ea941f7c5bc9fb004720'` 明文写在**公开的 GitHub Pages 仓库**中。实测页面亦产生 `401 https://api.github.com/user`。
- **影响**：任何人均可在 JS 源码中读取该密钥。GitHub OAuth App 的 client secret 泄露意味着可被用于伪造应用身份、消耗配额。
- **建议**：Gitalk 前端本就不应持有 secret（其官方推荐用代理）。**立即在 GitHub 后台重置该 secret**，并改为通过无服务代理（如 Cloudflare Worker / Vercel Function）中转；或直接改用更现代的评论方案。

---

## 二、样式设计评估（布局 / 配色 / 间距 / 字体 / 响应式）

### 🟡 P2-1　断点体系碎片化：全站 36 种断点

- **现象**：统计到 **36 个不同断点值**：`20 22 24 54 170 280 360 390 420 460 479 480 540 580 620 720 760 767 768 780 820 860 900 960 980 1010 1023 1024 1025 1100 1120 1200 1279 1280 1400 1440`。仅 `1024` 附近就挤了 `1010 / 1023 / 1024 / 1025` 四个。
- **影响**：维护成本高、易出现"改一处漏三处"的适配空洞；`767` 与 `768`、`1024` 与 `1025` 并存说明缺乏统一栅格。
- **建议**：收敛为 4–5 档令牌化断点：`480 / 768 / 1024 / 1280 / 1600`，写进 `studio-tokens.css` 统一引用。

### 🟡 P2-2　首页各区块内容边缘不对齐

- **现象**（实测 1920px 视口）：
  - `.home-note` / `.home-recent`：`l=160, w=1600`（受 `--studio-content-max: 1680px` 约束）
  - `.home-index .sm-page`：`l=40, w=1840`（`.sm-page` 的 `max-width: 1440px` 被覆盖失效）
  - `.home-binding`：全出血 `l=0, w=1920`
  - `.cover-main`：居中 `l=120, w=1680`
- **影响**：同一页面内正文出现 **40px / 120px / 160px 三种左缘**，宽屏下"内容栏参差不齐"，破坏版心秩序感。
- **建议**：首页统一采用单一容器宽度（建议 1680px + 40px gutter），`.home-index` 内的 `.sm-page` 显式重置为 `max-width: none`（当前 `homepage-v2.css` 未针对 `.home-index .sm-page` 做覆盖，属遗漏）。

### 🟡 P2-3　首页封面宽度上限硬编码，与令牌体系脱节

- **位置**：`docs/assets/css/homepage-v2.css:18`
- **现象**：`body.is-home { --studio-content-max: 1680px; }` 在 `body` 作用域**重定义令牌**，而 `studio-tokens.css:83` 的声明是 `1920px`。
- **影响**：令牌被局部劫持后，凡在 `body.is-home` 树内引用 `--studio-content-max` 的组件行为都会改变，形成"隐式耦合"；`.home-index` 因用了 `var()` 但被后来的 `width:100%` 影响，宽度规则互相打架。
- **建议**：改为独立语义变量（如 `--home-content-max`），或在设计文档中明确此覆盖为有意设计并加注解释。

### 🟡 P2-4　多处文字对比度不达 WCAG AA

实测不达标项（正文标准 4.5:1）：

| 位置 | 对比度 | 说明 |
|---|---|---|
| `.home-footer-copy`（首页页脚版权） | **2.91:1** | `#5f5d57` on `#0d100e`，深底上灰字过暗 |
| `.nav-cta`（进入知识库按钮） | **3.32:1** | 见 P1-4 |
| `.home-footer-contact-*`（页脚邮箱） | **3.63:1** | `#0b6bcb` on `#0d100e` |
| `.home-section-more`（查看全部 →） | **4.20:1** | `#0b6bcb` on `#e9e5dc` |
| `.sm-quick-name`（索引快捷项） | **4.20:1** | 同上 |
| 文章页 TOC 链接 | **4.45:1** | `#6d4aff` on `#f2eee5`，仅差 0.05 |
| `.me-btn-primary`（查看完整简历） | **3.20:1** | `#f2efe7` on `#159867` |
| 工具集 `.ti-tool-row__open` / `__priv` | 2.92 / 3.47:1 | — |

- **影响**：低视力用户阅读困难；也是 SEO/Lighthouse 可访问性扣分项。
- **建议**：
  - 深色底上的次要文本把 `#5f5d57` 提亮到 ≥ `#8a8d84`（≈4.5:1）。
  - 蓝色链接 `#0b6bcb` 在深底上用更亮的 `#4a9eff`，在浅底上加深到 `#0a5aa8`。
  - 缺失：`--notion-link-blue` 属于 `modern-theme.css` 遗留变量（`modern-theme.css:15`），却在新的首页/索引区生效，说明**遗留 token 仍在泄漏**，应统一到 `studio-tokens` 体系。

### 🟡 P2-5　字体字族声明与实际加载不一致

- **现象**：`studio-tokens.css:50-52` 声明 `"Source Han Serif SC"`、`"IBM Plex Mono"` 等字体，但站点**未加载任何 webfont**（无 `fonts.googleapis.com` 之外的字体引入），实际全部回退到 `SimSun` / `Consolas`。
- **影响**：设计稿意图（衬线标题 + 等宽正文）无法达成；不同操作系统渲染差异大（Windows 上是 SimSun，macOS 上是 Songti）。
- **建议**：明确决策——要么引入 `Noto Serif SC` / `JetBrains Mono` 子集（建议 `font-display: swap` + 仅引必要字重），要么把令牌改为务实的系统字体栈，避免"声明了一套用不上的字体"。

### 🟡 P2-6　文章页移动端正文可用宽度被压缩

- **现象**（实测 390px 视口）：`p` 元素宽度 323px，但父级 `blockquote` 宽 362px、`article.markdown-section` 宽 390px（`padding: 24px 14px`）。
- **影响**：正文段落两侧留白不对称，且 323px 在 390px 屏幕上偏窄，中文每行约 20 字，阅读节奏偏碎。
- **建议**：核对 `article-reading.css` 中针对 `p` 的 `max-width: 633.34px` 与父级 padding 的叠加关系；移动端建议让 `p` 撑满 `article` 内容盒（≈362px）。

### 🟡 P2-7　`transition: all` 影响渲染性能

- **现象**：`me-page.css` 中 **11 处** 使用 `transition: all 150ms`（行 125/168/200/444/560/766/851/1029/1107/1197/1385…）。
- **影响**：`all` 会监听所有可动画属性（含 `width`/`height`/`box-shadow`），触发不必要的重排与合成层，移动端易掉帧。
- **建议**：显式列出属性，如 `transition: background-color 150ms var(--studio-ease), transform 150ms var(--studio-ease)`。

### 🟡 P2-8　`100vh` 在移动端浏览器会导致内容跳动

- **现象**：`homepage-v2.css:16,83`、`article-reading.css:385,406,939,1582`、`modern-theme.css:1054,1187,1495` 共 9 处使用 `calc(100vh - Npx)`。
- **影响**：移动端浏览器地址栏收起/展开时 `vh` 会变化，导致布局跳动；`dvh`/`svh` 是更稳的选择。
- **建议**：移动端断点内改用 `100dvh`，或用 `min-height: 100svh` 兜底。

### 🟡 P2-9　`.home-note` 移动端规则冗余

- **位置**：`homepage-v2.css:1965-1980`
- **现象**：`.home-note-text` 在同一媒体查询内被声明两次（`grid-column` 与 `font-size` 分开写），`max-width: none` 与桌面端 `max-width: min(calc(...))` 形成显式对消。实测移动端该区块**内部无溢出**（`scrollWidth == clientWidth`），故此前疑似溢出为测量时机误报，非真实缺陷。
- **影响**：可读性差，属"能跑但难维护"。
- **建议**：合并同选择器规则，桌面端公式改为容器查询或更简单的 `width: min(100%, var(--home-content-max))`。

---

## 三、性能

### 🔵 P3-1　首屏 37 个 `<script>`，全部同步阻塞

- **现象**：`index.html` 共 **37 个 `<script>`**，其中 **34 个外部同步脚本**，`defer`/`async` 使用数为 **0**。
- **影响**：单个 HTML 页 136 个网络请求；DCL 实测 717ms，但外部 CDN（`npmmirror` 字体 CSS 592ms、百度统计 652ms）串行阻塞首屏。
- **建议**：
  - 非关键脚本（`gitalk` 147KB、`zoom-image`、`md5`）加 `defer`。
  - Prism 语言组件（13 个文件）合并为一个 `prism-langs.min.js`，减少请求数。
  - 把 `prism-aliases.js` 之前的所有 Prism 组件改为在 `docsify` 渲染完成后按需加载。

### 🔵 P3-2　首页加载 283KB CSS，其中 95KB 完全用不到

- **现象**：首页实际加载 `gitalk(24KB) + studio-tokens(3KB) + modern-theme(61KB) + homepage-v2(68KB) + home-motion(8KB) + article-reading(95KB) + site-map(24KB) = 283KB`。
  - 其中 **`article-reading.css` 95KB，含 0 个 `.home-` 选择器** —— 首页完全用不到，却通过 `pages/article.css` 无条件加载。
- **影响**：首页首屏 CSS 体积可减少 **≈33%**。
- **建议**：`index.html` 中按路由懒加载 page 级 CSS（tokens + shell 常驻，`article.css` / `site-map.css` 仅在对应路由注入），或用一个轻量 JS 在 `doneEach` 里动态 `link` 注入。

### 🔵 P3-3　`cache-control: no-cache` 全站削弱缓存

- **位置**：`docs/index.html:114-116`
- **现象**：`requestHeaders: { 'cache-control': 'no-cache' }` 强制所有文档请求绕过缓存。
- **影响**：每次导航都重新验证，移动端弱网下体感明显；由于文档是 Markdown，本可由 ETag 处理。
- **建议**：移除该配置，或改为仅对开发环境生效。

### 🔵 P3-4　`MutationObserver` 监听整个 `body` 子树

- **位置**：`docs/assets/js/bootstrap.js:216-221`
- **现象**：`observe(document.body, { childList: true, subtree: true })`，且回调里每次都执行 `bindCoverSearchBridge / bindTerminalTriggers / syncGitalkWidth / cleanSidebarLabels`。
- **影响**：docsify 渲染大量 DOM 时回调被高频触发，4 个函数内部虽做了幂等判断，但 `querySelectorAll` 的遍历开销仍在。
- **建议**：改为监听 `#main` 或指定容器；用 `requestAnimationFrame` / 防抖包裹回调。

### 🔵 P3-5　`syncGitalkWidth` 强制同步读写，触发强制重排

- **位置**：`docs/assets/js/bootstrap.js:77-82, 116`
- **现象**：`gitalk.style.width = 'min(100%, ' + Math.max(main.clientWidth, 320) + 'px)'` 在 DOM 变更回调中直接读取 `main.clientWidth`（强制重排）后立即写入样式。
- **建议**：改用纯 CSS `width: min(100%, ...)`；若必须 JS，用 `ResizeObserver` 替代显式读取。

---

## 四、代码结构

### 🔵 P3-6　两处已死代码未清理

- **`docs/assets/js/article-nav.js`** —— 未被 `index.html` 或任何页面引用。
- **`docs/assets/js/homepage-v2.js`** —— 未被引用（功能已迁至 `pages/home.js`）。
- **影响**：仓库噪音，易误导后续维护者。
- **建议**：确认无动态引用后删除。

### 🔵 P3-7　`!important` 总量 2328 处，形成覆盖层叠死结

| 文件 | `!important` | 行数 |
|---|---|---|
| `article-reading.css` | **1083** | 2636 |
| `modern-theme.css` | **804** | 2483 |
| `homepage-v2.css` | 313 | 2020 |
| `site-map.css` | 97 | 1021 |
| `me-page.css` | 11 | 2023 |
| `tool-studio.css` | 4 | 570 |

- **现象**：`article-reading.css` 平均每 2.4 行一个 `!important`；`homepage-v2.css` 开头的注释自承"覆盖 modern-theme.css 残留 !important 时本文件亦用 !important（Phase A 允许，Phase B 清理）"。
- **影响**：任何一个新样式都需要先猜测对方用了多少 `!important`；**P1-4 的按钮变色问题正是这套机制的直接产物**。
- **建议**：立项一次"去 `!important` 化"重构：先冻结 `modern-theme.css`，用 CSS Cascade Layers（`@layer reset, legacy, base, components, pages`）把遗留层压到最低优先级，之后新样式不再需要 `!important`。

### 🔵 P3-8　CSS `@import` 链过深

- **现象**：`index.html` → `pages/home.css` → `homepage-v2.css` + `home-motion.css`；`shell.css` → `compat/modern-theme.css` → `modern-theme.css`（3 层）。合计 7 个 `@import`，其中 `compat/modern-theme.css` 是仅含一行转发的纯中间层。
- **影响**：`@import` 会串行阻塞 CSS 解析，且 DevTools 中资源溯源困难。
- **建议**：构建期用轻量打包（如 `postcss-import`）内联，或在 `index.html` 直接平铺 `<link>`。`compat/` 这层若无兼容用途可删。

### 🔵 P3-9　`studio-tokens.css` 有未使用令牌

- **现象**：`--studio-hairline` 定义了但全站 0 处引用。
- **建议**：删除或实际启用。

### 🔵 P3-10　工具页各行其是

- **现象**：`tools/*.html` 12 个工具页共 16 个 `<style>`、24 个 `<script>` 块，均为内联。虽有 `tool-studio.css` 共享外壳，但各页仍重复内联大量结构。
- **影响**：修改公共样式需逐页同步。
- **建议**：抽取重复的 CSS/JS 到 `assets/css/tool-studio.css` 与共享 JS，工具页仅保留业务逻辑。

---

## 五、亮点（值得保留）

- **降级路径设计完善**：`home-motion.js` 在无 `IntersectionObserver` 时 `revealAll()`，`prefers-reduced-motion` 有通配兜底（`studio-tokens.css:87-95`），路由往返不重播动画（`window.__homeMotionPlayed`）——动效层考虑很周全。
- **无障碍基础扎实**：终端有完整 `role="dialog"` / `aria-modal` / focus-trap / 焦点恢复（`terminal-a11y.js`），侧栏 `aria-expanded` 同步到位，`focus-visible` 覆盖良好（`article-reading.css` 12 处）。
- **首页搜索链路实测可用**：封面搜索提交后正确跳到 `#/README`、激活侧栏搜索并返回 126 条结果，`home-search-active` 状态机与 Esc 退出都正常。
- **Prism 集成正确**：35 种语言已注册，`sh→bash`、`react→jsx` 别名生效（`prism-aliases.js`）；且注释明确说明"禁止再加载独立 prism.js 核心"的原因（`index.html:197-199`），避免了常见坑。
- **图集漏洞被提前预防**：`home-motion.css:147-149` 与 `:176-180` 已针对窄屏色斑溢出做了 `overflow: clip` + 断点隐藏。

---

## 六、修复记录（2026-09-26）

### 6.1 改动文件清单

| 文件 | 改动 |
|---|---|
| `docs/index.html` | 移除明文 secret，改 `GITALK_PROXY` 占位；两插件改本地引用；mermaid 改动态 import + 就绪 Promise；主题变量迁入 `initialize()` |
| `docs/assets/js/docsify-copy-code.min.js` | **新增**（本地 vendored v3.0.0） |
| `docs/assets/js/docsify-mermaid.min.js` | **新增**（本地 vendored v2.0.1，并 patch `doneEach` 等待 mermaid 就绪） |
| `docs/assets/js/gitalk.min.js` | patch 1 处：`baseURL` 读 `window.GITALK_API_BASE` |
| `docs/assets/js/bootstrap.js` | 新增 `syncSidebarInert()`；`renderGitalk` 支持未配置时静默跳过 |
| `docs/assets/js/pages/home-motion.js` | 页脚统计归零增加视口判断；降级路径前置 |
| `docs/assets/css/article-reading.css` | 补触屏复制按钮可见性 |
| `docs/assets/css/homepage-v2.css` | `.nav-cta` 提升特异性 + hover 改反色 |
| `docs/assets/css/me-page.css` | 导航与联系卡片响应式收紧；新增 ≤360px 断点 |
| `docs/assets/js/me-page.js` | GitHub 语言统计网格改 `minmax(0,1fr)` + 换行约束 |
| `docs/_meta/gitalk-proxy-worker.js` | **新增** Cloudflare Worker 代理 |
| `docs/_meta/GITALK_PROXY_SETUP.md` | **新增** 部署指南 |

### 6.2 巡检中漏报、修复过程中暴露的 2 个真实缺陷

这两项**不在原报告清单内**，是实施修复时通过多视口实测新发现的：

**（1）触屏设备复制按钮"隐形但可点"**

插件靠 `pre:hover .docsify-copy-code-button { opacity:1 }` 显形。触屏设备无 hover 能力，实测 390px 触屏模拟下按钮 `opacity=0`、尺寸 59×28 —— **看不见却仍能点中**，属典型的隐形陷阱。
修复：`article-reading.css` 补 `@media (hover: none), (pointer: coarse) { opacity: 1 }` 常驻显示；桌面端 hover 显形行为保持不变（已回归验证）。

**（2）`resume.html` / `me.html` 移动端横向溢出 94px**

实测 390px 视口下 `resume.html` 溢出 **94px**（360px 下 124px），根因是 `.me-nav-right { flex-shrink: 0 }` + `.me-nav-inner { gap: 32px }` 在窄屏把导航撑破容器，且移动端断点只收紧了 padding 未收紧 gap。
修复后 320–1280px 全档 **0px 溢出**：
- ≤1023px：`gap` 收紧至 16px，`.me-nav-right` 允许收缩
- ≤767px：隐藏文字型 CTA（导航由汉堡菜单承载）
- ≤360px：隐藏品牌文字（只留 W 标记）、GitHub 语言统计改 2 列自适应
（此问题与本次 P0/P1 改动无关，属既有缺陷，`git status` 可证 `me-page.css` 此前未被触碰。）

### 6.3 回归验证结果（18/18 通过）

| 断言 | 结果 |
|---|---|
| npmmirror CDN 403 已消除 | ✅ 0 个 |
| gitalk 401 已消除 | ✅ 0 个 |
| 无 JS 运行时异常 / 无意外网络失败 | ✅ |
| mermaid 全部渲染 | ✅ 9 个 SVG，无残留 `pre` |
| 复制按钮覆盖全部代码块 | ✅ 5/5 |
| 复制按钮可点击且写入剪贴板 | ✅ |
| 收起态侧栏 `inert` / Tab 无屏外焦点 | ✅ 14 次 Tab，屏外 0 次 |
| 展开态可正常聚焦 / 桌面端未误加 `inert` | ✅ |
| `.nav-cta` 常态对比度 | ✅ 9.65:1 |
| `.nav-cta` hover 对比度 | ✅ 9.13:1 |
| 页脚统计到达真实值 | ✅ 11/77 |
| 源码中无明文密钥 | ✅ |
| 未配置代理时静默降级 | ✅ 无报错 |
| 首页搜索 / 动效无回归 | ✅ 126 条结果 / 17 个动效元素 |
| 全站 7 个页面移动端无横向溢出、无 JS 异常 | ✅ |

### 6.4 唯一待用户线下执行的事项

Gitalk 评论区目前**不显示**（静默降级，不影响其他功能）。需按 `docs/_meta/GITALK_PROXY_SETUP.md`：

1. **轮换** GitHub OAuth App 的 client secret（旧值在 Git 历史中仍存在，必须作废）
2. 部署 Cloudflare Worker 并写入密钥
3. 回填 `docs/index.html` 中 `GITALK_PROXY` 的两处地址

---

## 七、修复收尾（第二轮：P2 / P3）

### 7.1 第一轮（P0 / P1，2026-09-26）

1. ~~P0-1 / P0-2：本地化 `docsify-copy-code` 与 `docsify-mermaid`~~ ✅
2. ~~P0-3：撤下 Gitalk `clientSecret` 并配套代理方案~~ ✅（代理待用户部署）
3. ~~P1-1：移动端抽屉加 `inert`~~ ✅
4. ~~P1-4：修复 `.nav-cta` 文字色与对比度（含 hover 态）~~ ✅
5. ~~P1-3：修正页脚统计首屏显示 0~~ ✅

### 7.2 第二轮（P2 / P3）逐项结果

| 项 | 结果 | 落地方式 |
|---|---|---|
| P2-1 断点碎片化 | ✅ 部分修复 | 归一 `768` / `1024` 两个分界（原 `max-width:1023` 与 `min-width:1025` 在**恰好 1024px** 两边都不命中，形成规则死区；768px 处桌面/移动规则同时命中）。同时修正 `me-page.css` 把 1024/768 当桌面侧、与文章页抽屉边界相反的问题。**「收敛为 5 档」未做**，理由见 7.4 |
| P2-2 首页版心不对齐 | ✅ 已修复 | 移除 `body.is-home .home-index--sitemap { max-width: none }`。1920px 下首页二级区块内容左缘由 `0/40/120/160` 四种统一为 **160**（`<1920` 时统一为 40） |
| P2-3 令牌被 `body.is-home` 劫持 | ✅ 已修复 | 新增独立语义变量 `--home-content-max: 1680px`，`homepage-v2.css`（13 处）与 `site-map.css` 内嵌站点地图（1 处）改用；`--studio-content-max: 1920px` 恢复全站语义 |
| P2-4 文字对比度 | ✅ 已修复 | 见 6.1 与 P1-4；深底次要文本、浅底链接、工具集标签、`.me-btn-primary` 全部 ≥ 4.5:1 |
| P2-5 字体声明与实际不符 | ✅ 已修复（改为务实系统栈） | 实测全站**唯一** webfont 是 docsify 主题经 `fonts.gstatic.com` 引入的 Roboto Mono（国内访问不可靠）。故：`--studio-font-mono` 改为系统等宽栈且**不再包含 Roboto Mono**；`pre` 显式指定等宽栈（原先复制按钮继承 `pre` 的 `Monaco, courier`，Windows 下会退到 courier）；`studio-tokens.css` 补三平台落点说明。**未引入 webfont**，理由见 7.4 |
| P2-6 移动端正文过窄 | ⚠️ 误报，无需修复 | 实测 390px 下直属于 `.markdown-section` 的 `p` 均为 **362px**（= 内容盒满宽）。报告中的 323px 是 **blockquote 内**的段落，其父 `blockquote` 有 `padding: 18px`，326 ≈ 363−36，属正确行为 |
| P2-7 `transition: all` | ✅ 已修复 | `me-page.css` 11 处改为显式属性列表，零 `transition: all` 残留 |
| P2-8 `100vh` 移动端跳动 | ✅ 已修复 | 布局容器、搜索面板、终端窗口、resume 工具页共 10 处补 `100dvh` 兜底（保留 `vh` 作旧浏览器回退） |
| P2-9 `.home-note` 规则冗余 | ✅ 已修复 | 同一媒体查询内重复的 `.home-note-text` 合并为一条；补注 `max-width: none` 的用意（解除桌面 `min()` 公式，390px 下由 310 → 358px） |
| P3-1 脚本同步阻塞 | ✅ 已修复 | 全部 24 个外部脚本改 `defer`（并行下载、按序执行，仍早于 docsify 的 DOMContentLoaded 初始化）；16 个 Prism 组件合并为 `prism-langs.bundle.js`；百度统计推迟到 `load` 之后注入。**首页请求数 136 → 115** |
| P3-2 首页 CSS 瘦身 | ⚠️ 评估后不采用 | 见 7.4 |
| P3-3 `cache-control: no-cache` | ✅ 已修复 | 该配置已从 `$docsify` 移除（`index.html` 注释保留原因说明） |
| P3-4 MutationObserver 范围过宽 | ✅ 已修复 | 子树回调改为 `requestAnimationFrame` 合并，每帧最多执行一次；`body` 属性监听仍只盯 `class` |
| P3-5 `syncGitalkWidth` 强制重排 | ✅ 已修复 | 删除该函数，Gitalk 容器改为注入 `#main` 尾部 —— 宽度自动跟随正文列，**无需任何 JS 读取 `clientWidth`**，也不需要在 CSS 里复刻 `#main` 在各断点下的 `max-width`（实测各页面类型差值 0px） |
| P3-6 死代码 | ✅ 已修复 | 删除 `article-nav.js`、`homepage-v2.js`、未使用的 `--studio-hairline` 令牌，并更新 4 处过时注释 |
| P3-7 `!important` 层叠死结 | ⏳ 立项重构 | 2328 处 `!important` 属架构级改造（Cascade Layers），非本次范围；报告保留建议 |
| P3-8 `@import` 链过深 | ✅ 已修复 | 删除 `tokens.css` / `shell.css` / `compat/modern-theme.css` / `pages/{home,article,site-map}.css` 共 6 个纯转发层，改由 `index.html` 直接 `<link>` 6 个真实文件，**层叠顺序逐位保持不变**（实测样式表加载顺序与改动前一致）。样式请求 14 → 8 |
| P3-9 未使用令牌 | ✅ 已修复 | 见 P3-6 |
| P3-10 工具页各行其是 | ⏳ 未做 | 12 个工具页共 16 `<style>` / 24 `<script>` 内联块，抽取公共结构属独立重构任务 |

**P3-1 / P3-8 的另一半：`_sidebar.md` 404 噪音（P1-2）**

经查为 docsify 多级 `_loadSideAndNav` 的固有机制（自当前路径逐级向上找 `_sidebar.md`），非配置错误。**不能靠补空文件消除** —— 在该分类目录放入 `_sidebar.md` 会让 docsify 改用空侧栏，直接破坏该分类导航。结论：**机制固有，不予修复**，仅在报告留存说明。

### 7.3 第二轮新发现（不在原报告清单内）

**（1）代码栅栏语言名大小写/拼写导致整块代码无高亮**

docsify 按栅栏语言名**区分大小写**查 `Prism.languages`，查不到时静默不着色。实测站内存在 `JAVA`(127) / `XML`(38) / `CMD`(34) / `YAML`(31) / `Java`(19) / `YML`(6) 等大写写法，以及 `pyhon` / `pyhton` / `pythpn` 拼写错误，合计约 **267 个代码块**长期无配色。

修复：`prism-aliases.js` 重写为「修正别名 + 大小写变体 + 近似映射」三层零体积别名层（不新增语法组件），并约定「目标语法不存在或该键已注册则不覆盖」，便于日后补入官方组件。修复后 `Prism.languages` 覆盖由 35 个键升至 **76 个键**，实测大写栅栏（如 `Python`）已正常产出 token。

顺带记录待订正的**内容侧**拼写（别名层已兜底，建议仍改源文件）：

| 文件 | 行 | 栅栏 |
|---|---|---|
| `md/02-后端开发/00-MySQL数据库.md` | 1816 | ` ```scss `（内容为普通 CSS） |
| `md/02-后端开发/20-消息队列.md` | 4010 | ` ```undefined ` |
| `md/archive/old-algorithm-notes/蓝桥杯.md` | 51 | ` ```pyhton ` |
| `md/archive/old-django-notes/Django(MRO).md` | 722 | ` ```pyhon ` |
| `md/archive/old-django-notes/django-rest-framework开发笔记.md` | 654 | ` ```pyhon ` |
| `md/archive/old-python-notes/Python源码剖析/Python源码剖析-23-类对象源码剖析.md` | 334 | ` ```pythpn ` |
| `md/archive/old-mq-notes/docker 启动容器常见命令.md` | 32 | ` ```undefined ` |

**（2）文章内嵌的有道云笔记图片已失效**

`md/09-开发工具/00-Git版本控制.md` 中 4 张图片来自 `note.youdao.com/yws/res/...`，实测 2 张 `400 Bad Request`、2 张被浏览器 ORB 拦截（`ERR_BLOCKED_BY_ORB`）。属外链图床失效，需把图片转存为站内资源后替换链接（内容侧工作，未改动）。

### 7.4 明确不做的事项与理由

**P3-2「按路由懒加载 page 级 CSS」——不采用。**
站点是 Docsify SPA，所有 CSS 只在首次进入时下载一次，之后路由跳转全部命中缓存；而 `article-reading.css` 是**任何一次进入文章页都必需**的样式。改成路由注入后，首次点击「进入知识库」会先出现无样式内容再回填（FOUC/回流），用最常用路径的体验换首页一次性 33% 的 CSS 体积，不划算。真正该做的是 P3-7 的去 `!important` 化（可从根上把 95KB 压到更小），故留待该重构一并处理。

**P2-1「断点收敛为 5 档并令牌化」——不做，改为文档化约定。**
两个硬约束：① CSS **媒体条件里不能写 `var()`**，站点又无构建步骤，所以断点无法真正做成「令牌」，只能成为约定；② 其余断点值（`760/820` = 阅读列几何、`860` = 遗留阅读列、`1100/1120/1200` = 首页栅格台阶、`1279/1280` = TOC 栏临界、`1440/1600` = 版心）都是从各组件几何反推出来的，**归并到 5 档等于重做每个组件的响应式**。已在 `studio-tokens.css` 写入断点约定（新代码一律用 `768 / 1024 / 1279-1280 / 480 / 1600`）与历史成因，作为后续约束。

**P2-5「引入 Noto Serif SC / JetBrains Mono」——不采用，改为系统字体栈。**
本项目已因 CDN 在境内的可用性把多个前端库改为本地 vendored（npmmirror 两次返回 403 即为佐证）；中文字体即使子集化也有数百 KB，且唯一现成的 webfont 来自 `fonts.gstatic.com`。引入 CJK webfont 会同时增加体积与不可用风险，与「衬线标题 + 系统等宽代码」的观感收益不成比例。故明确采用系统字体栈并把三平台落点写进令牌注释。

**P3-7「去 `!important` 化」——本次不做。**
需要先冻结 `modern-theme.css` 并引入 Cascade Layers，属阶段式架构改造；本次已通过提升选择器特异性修掉两个真实受害者（P1-4），改造留作独立立项。

**P3-10「工具页公共结构抽取」——本次不做。**
12 个工具页各自内联样式与脚本，抽取需逐页回归，属独立重构任务；本次已统一 `resume-builder.html` 的 `100dvh` 兜底。

### 7.5 第二轮改动文件清单

| 文件 | 改动 |
|---|---|
| `docs/index.html` | 6 个样式改直连真实文件（删转发层）；24 个外部脚本加 `defer`；16 个 Prism 组件并为 1 个合并包；mermaid 改 `__loadMermaid()` 按需加载；百度统计延后注入；补 CDN `preconnect` |
| `docs/assets/js/bootstrap.js` | 删 `syncGitalkWidth`；Gitalk 容器注入 `#main`；子树 MutationObserver 改 rAF 合并 |
| `docs/assets/js/docsify-mermaid.min.js` | `doneEach` 增加「无 `.mermaid` 容器则直接返回」，不再无脑等待/加载 |
| `docs/assets/js/prism-aliases.js` | 重写为三层别名层（修正别名 / 大小写变体 / 近似映射，共 50+ 条） |
| `docs/assets/js/prism-langs.bundle.js` | **新增**（由 `scripts/build-prism-bundle.js` 生成） |
| `docs/assets/css/studio-tokens.css` | 字体栈改系统字体（含三平台落点说明）；补断点约定文档 |
| `docs/assets/css/article-reading.css` | Gitalk 宽度改 CSS；`pre` 指定系统等宽栈；10 处 `100dvh` 兜底；触屏复制按钮常驻 |
| `docs/assets/css/homepage-v2.css` | 新增 `--home-content-max`；版心对齐；`.home-note` 移动端规则合并；断点归一 |
| `docs/assets/css/site-map.css` | 首页内嵌站点地图恢复版心约束；`.sm-layout` 改用首页版心令牌 |
| `docs/assets/css/modern-theme.css` | 补 `100dvh` 兜底；断点归一 |
| `docs/assets/css/me-page.css` | `transition: all` 全部改显式属性；断点归一；`me-btn-primary` 对比度 |
| `docs/assets/css/pages/home-motion.css` | 断点归一 |
| `docs/tools/resume-builder.html` | `100dvh` 兜底 |
| `docs/assets/css/{tokens,shell}.css`、`compat/modern-theme.css`、`pages/{home,article,site-map}.css` | **删除**（纯 `@import` 转发层） |
| `scripts/build-prism-bundle.js` | **新增**（Prism 合并包生成脚本） |
| `scripts/site-regression.js` | **新增**（全站回归验收脚本） |
| `AGENTS.md` | 更新目录树、检查脚本清单、样式入口约定、强制阅读范围；补本地预览必须用目录形式的提醒 |
| `docs/_meta/HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md` | 更新 `home-motion.css` 挂载方式说明 |

---

## 八、验收基线

本轮全部改动通过 `node scripts/site-regression.js` 复核（需先启动本地预览）：

- 全站 9 类页面 × 8 档视口（320 / 360 / 390 / 768 / 1024 / 1280 / 1600 / 2560）横向溢出 = 0
- 控制台无 JS 运行时异常；无 4xx/5xx 静态资源请求
- 文章页：代码高亮、复制按钮、TOC、终端、mermaid 渲染全部正常
- 首页：版心对齐、页脚统计、搜索桥接、动效降级路径正常
- 无障碍：抽屉 `inert`、`focus-visible`、跳转链接行为不变

---

## 九、第三轮：对比度系统性复检与修复（2026-09-26 续）

第二轮收工时 `site-regression.js` 首跑为 **41 项断言 / 34 PASS / 7 FAIL**。逐项判定后发现：
**6 项是探针自身的缺陷，只有 1 项是站点真缺陷** —— 但顺着这 1 项查下去，牵出了一个被前两轮完全漏掉的系统性对比度问题。

### 9.1 探针缺陷：console 文本不含 URL

- **现象**：文章页、全站地图、404 页一律报 `Failed to load resource: ... 404 (File not found)`，而脚本的噪声过滤是按 URL 匹配 `_sidebar.md` 的，永远命不中。
- **根因**：Chromium 对资源加载失败产出的 console 文本是**固定句式，其中的 URL 位置为空**。实测只有 `console.location().url` 才携带失败资源地址。原实现直接拿 `m.text()` 做判定，等于噪声白名单从未生效。
- **处置**：`instrument()` 改为以 `url + ' → ' + text` 参与判定；并给 404 测试页加 `noise: [/this-page-does-not-exist/]`（它自己触发的 not-found 属预期）。另修正 `response` 处理器只传裸 URL 的问题 —— 形如「403 限流」的规则需要状态码才能匹配。
- **教训**：过滤规则所依赖的字段必须是**实测确认存在**的字段，不能按直觉假设。这与第一轮「必须用目录形式访问」属同一类陷阱。

### 9.2 真缺陷：`!important` × 特异性裁决（同一 bug 类，本轮共查获 4 处）

| 元素 | 实际生效的规则 | 本应生效的规则 | 实测 → 修复后 |
|---|---|---|---|
| `.home-section-more` | `.markdown-section a`(0,1,1) `!important` | `.home-section-more`(0,1,0) `!important` | 4.20:1 → **5.24:1** |
| `.home-footer-star` | `.markdown-section p`(0,1,1) `!important` | `body.is-home .home-footer-star`(0,2,1) 无 `!important` | 2.91:1 → **16.65:1** |
| resume 页主按钮 | `.resume-actions .me-btn-primary`(0,2,0) | `.me-btn-primary`(0,1,0) | 3.20:1 → **5.21:1** |
| 文章页 TOC ×94 处 | `.anchor span`(0,1,1) `!important` | 继承父级 `<a>` 的颜色 | 4.45:1（紫）→ **5.68:1** |

前两处与 P1-4 `.nav-cta` 是**完全相同的失败模式**：双方都带 `!important` 时只由特异性裁决，裸类选择器 (0,1,0) 会输给 (0,1,1)。第三处暴露了另一种常见疏漏 —— 第一轮把基类 `.me-btn-primary` 修好了，却没注意到 `resume.html` 还有一条 (0,2,0) 的页面级覆写压着它。

第四处最隐蔽，值得单独记：docsify 的锚点插件把标题与 TOC 条目的**全文**包进 `<a class="anchor"><span>…</span></a>`。`modern-theme.css` 有一条 `.anchor span { color: var(--notion-primary) !important }`，它作用在 `<span>` 上属**直接声明**，而父级 `<a>` 的颜色只能靠继承传递 —— **继承值不参与特异性比较，任何直接声明都能压过它，无论特异性高低**。正文标题此前已用 `h1..h6 .anchor span` 保护，但 TOC 不在 `.markdown-section` 内，不受该保护，于是 94 处目录条目全部泄漏成紫色。

修复是一条 `body.is-article .toc-nav .page_toc > div > a.anchor > span { color: inherit !important }` —— 用 `inherit` 一次性覆盖常态 / hover / active 三种状态，无需逐态复写。

### 9.3 全站对比度普查

既然这些泄漏都属「个别规则被大面积复用」，逐点打补丁必然继续漏，因此改为**全量普查**：

- **方法**：对每个「带非空直接文本节点」的元素，逐层向上做背景 alpha 合成求出**有效背景**，按字号/字重选 AA 阈值（正文 4.5 / 大字 3.0）；途中遇到 `background-image` 或无法解析的层一律跳过，不误报。
- **范围**：8 类页面 × 2 档视口（390 / 1440），5562 个可判定元素。
- **结果**：首测 **448 项低于 AA**，聚合成 **13 组反复模式** —— 这个数字本身就是结论：问题不在零散元素，而在少数几个令牌与若干条被覆盖的规则。
- **修复后：151 项（↓66%）**，且剩余项**全部落入刻意保留的类别**，无未分类缺陷。

逐组处置：

| 组 | 数量 | 处置 |
|---|---|---|
| `--studio-text-muted` 在三种纸白底 | 182 | **修**（令牌加深） |
| 文章页 TOC 紫色泄漏 | 94 | **修**（`inherit` 覆盖） |
| 链接蓝泄漏（`.home-section-more` / 手记来源链接等） | 10 | **修**（提特异性） |
| `--studio-green-dark` 作纸白底文本 / 悬停色 | 14 条规则 | **修**（全量换 `--studio-green-ink`） |
| 占位符 `#bbb` 在白底（1.92:1） | 2 | **修**（→ `#767676`，浏览器默认占位色） |
| `.me-btn-primary`(resume) / `.home-footer-star` | 4 | **修** |
| `--studio-vermilion` 硬编码 `#b64b45`（4.44:1） | 3 | **修**（补 `-ink` 令牌） |
| `--studio-gold` 装饰层 | 121 | **保留**（见 9.5） |
| `--studio-paper-line` 分隔符 `/` `·` | 26 | **保留**（见 9.5） |
| `ts-skip-link` | 4 | **保留**（见 9.5） |

**影响最大的是 `--studio-text-muted` 这一个令牌**：实测 **732 个元素**落在 `--studio-paper-100` 上，对比度 4.503:1 —— 数值上踩线通过 AA，但**零余量**，任何取整或叠加都会翻到线下；另有 7 个元素落在「5% 墨色叠加态」上只有 4.10:1，**本就不合格**。故把令牌由 `#66685f` 加深为 `#5c5e56`：paper-100 → 5.24:1，paper-50 → 5.68:1，叠加态 → 4.77:1，全部留出余量。

改令牌而非逐处打补丁的依据是一条前置核实：该令牌 871 处使用**全部落在浅色底**（深色底一律走 `--studio-on-dark-muted`），因此加深只会提升对比度，不存在「改暗了反而更差」的反向场景。

### 9.4 顺带完成的令牌收口

- `--studio-green-ink` 此前**已定义却从未被任何 CSS 使用**（只有 `tools/index.html` 的内联样式用到）—— 本轮在 14 条纸白底文本/悬停规则上正式启用，令牌终于名副其实。
- 新增 `--studio-vermilion-ink: #a8423d`（纸白底 5.17:1），收掉 2 处硬编码 `#b64b45`，与既有的 `green-ink` / `rust-ink` / `link-ink` 形成完整惯例。
- 同步更新 6 个被改样式文件的 `?v=` 缓存戳（`20260926b`）；未改动的 `modern-theme.css` / `home-motion.css` 保持原戳不动。

### 9.5 明确保留（设计决策，非缺陷）

- **`--studio-gold` 装饰层 121 处（1.63–1.94:1）**：金色序号、引号「“」、当前项标记是这套视觉的签名，且占剩余项的 79%。若确要改，需新建 `--studio-gold-ink`（约 `#6f5820`，纸白底 5.40:1），但那是**新的设计决策**，应由设计侧定，不在本轮单方面改。
- **`--studio-paper-line` 作分隔符文字色 26 处**：`/`、`·` 不承载任何信息，提亮会破坏层级感。
- **`tools/*` 的 `.ts-skip-link` 4 处（1.18:1）**：跳转链接常态视觉隐藏，聚焦时才显形，属标准做法。

### 9.6 第三轮改动文件清单

| 文件 | 改动 |
|---|---|
| `docs/assets/css/studio-tokens.css` | `--studio-text-muted` `#66685f`→`#5c5e56`；新增 `--studio-vermilion-ink` |
| `docs/assets/css/homepage-v2.css` | `.home-section-more` 提特异性至 `body.is-home` 并修 hover；`.home-footer-star` 补 `!important`；手记来源链接补 `!important`；绿色悬停色 5 处 |
| `docs/assets/css/article-reading.css` | 新增 TOC `> a.anchor > span { color: inherit }`；链接 hover 与 gitalk hover 换 `green-ink` |
| `docs/assets/css/site-map.css` | `.sm-path-current` `green`→`green-ink`（1.58→5.18）；2 处 hover 换 `green-ink` |
| `docs/assets/css/me-page.css` | **删除** `resume-actions .me-btn-primary` 漏改覆写；3 处 hover 换 `green-ink` |
| `docs/assets/css/tool-studio.css` | `.ts-btn--danger` 去硬编码；`.ts-foot__link:hover` 换 `green-ink` |
| `docs/tools/resume-builder.html` | `.is-placeholder` `#bbb`→`#767676`；`.rb-req` 改用令牌 |
| `docs/index.html` / `docs/tools/*.html` / `me.html` / `resume.html` | 6 个被改样式文件的缓存戳统一为 `?v=20260926b` |
| `scripts/site-regression.js` | console URL 补全；404 页专属噪声；噪声判定重构；**新增悬停态对比度支持**；对比度目标 7→15 项；api.github.com 403 白名单 |
| `AGENTS.md` | 更新回归脚本说明（含「改颜色后务必跑一次，注意悬停态」） |

### 9.7 回归结果

```
断言 49 项：49 PASS / 0 FAIL
```

对比度断言由 7 项扩到 **15 项**，并首次覆盖**悬停态**（`hover: true`：先归零指针 → 悬停 → 等 transition 结束 → 取值）。本站历史上多次出现「常态已修、悬停态漏改」，此前没有任何自动化覆盖。

关于 `api.github.com` 403 的判定：GitHub REST 未认证配额为 **60 次/小时/IP**，`me.html` 每次加载消耗 2 次，反复跑回归即打满。实测该失败**已被站点显式降级**（静态快照图 + `personal-github-fallback` 文案，页面无任何原始报错字样），属外部配额而非缺陷，故加入白名单 —— **但只放行 403**；若变成 404/500（说明端点或代码真的坏了）仍会照常报警。

---

---

## 十、第四轮：把「刻意保留」重新逐项验证（2026-09-27 续）

第三轮把剩余 151 项低对比度全部归入「刻意保留」，但那个判断**做得太快** —— 它建立在「金色 = 装饰」这个未经核实的概括上。本轮逐元素复核，发现其中混着真实信息，并在此之外又查获两类内容缺陷。

### 10.1 金色层不能整体豁免：其中含真实信息

用探针给每个低对比度元素打三个标记（自身文本、是否 `aria-hidden`、父级文本是否等于自身文本），结果：

| 元素 | 性质判定 | 实测 | 处置 |
|---|---|---|---|
| `div.personal-timeline-year`（"2019–2020"、"2024–至今"） | **真实内容**（时间轴年份） | 1.79:1 | **修** |
| `span.personal-note-index-num` / `resume-toc-num` / `resume-chapter-num`（12–13px 序号） | **信息**（定位用编号） | 1.60–1.94:1 | **修** |
| `span.sm-quick-item.is-current .sm-quick-name`（"当前所在分类"） | **导航信息** | 1.71–1.79:1 | **修** |
| `span.sm-domain-num` / `section-no` / `resume-section-no` / `home-note-quote`（22–52px 大字） | 装饰水印（阈值 3:1，但仍不达） | 1.79–1.94:1 | **一并修** |
| `span.ti-group__num` / `rb-section__num`（工具页 12–13px 序号） | **信息** | 1.94:1 | **修** |

**关键认识**：金色在本站从来没被写成「仅装饰」的令牌语义 —— `studio-tokens.css` 里它只有一行色值，没有任何豁免说明。我上一轮把 121 处整体判为「设计签名」是**用自己的概括替代了书面依据**。凡元素本身承载可读文本（年份、编号、当前项指示），就不该按装饰豁免。

新增 `--studio-gold-ink: #6f5820`，沿原色相（h≈41°）压暗，三种实测纸白底上为 **5.40 / 5.86 / 4.82**，`深墨底继续用 --studio-gold`（那里对比充足）。共替换 13 处规则。

顺带修掉一个**隐性令牌缺口**：`site-map.css` 原写 `var(--studio-gold-dark, #a98b52)` —— `--studio-gold-dark` **从未定义**，一直靠兜底值生效。

### 10.2 语言覆盖：我此前的「全部高亮」断言是无效的

第三轮的回归只校验了 **1 篇文章的 6 个代码块**就断言「代码块全部高亮」，而全站实际有 **81 篇文档、1734 处图片引用、60+ 种栅栏语言标记**。这个断言等于没测。

补做全量核对后（并把检查固化进回归），查获：

| 问题 | 数量 | 处置 |
|---|---|---|
| 栅栏标记写坏：```` ```react、 ````（多一个顿号） | 1 | **修** → `react` |
| 栅栏标记写坏：```` ```undefined ````（编辑器产物） | 1 | **修** → `shell` |
| 栅栏语言名是整句中文（`源自Google的GFS论文，论文发表于2003年10月。`） | 1 | **修**（句子移回正文，栅栏留空） |
| `scss` 实为 MySQL 配置文件段 | 1 | **修** → `ini` |
| `vim` 语言键缺失 | 2 块 | **修**（补入官方 `prism-vim.min.js` 组件） |

**方法上的两个教训**：

1. **不能用「token 数为 0」判断高亮失败**。我最初用这个判据，得出「54 个 shell/bash 块未着色」的荒谬结论 —— 实际那些块是 `kubectl get pod` 这类**单行命令，语法上本就没有可高亮元素**。正确判据是「语言键是否存在于 `Prism.languages`」。
2. **`text` 的 14 处不是缺陷**。`text` 是 Prism 的「纯文本」占位符，等同于声明「这段不要着色」，是有意为之（GitHub 同样处理）。

`prism-aliases.js` 的拼写错误兜底（`pyhon`/`pyhton`/`pythpn`）现在只剩归档还在用 —— 主线文档已全部订正，但**归档按项目约定不可修改**，别名兜底继续保留是正确设计。

### 10.3 内容缺陷：7 处畸形 URL 导致必然破图

静态扫描 1734 处图片引用，发现 `md/08-过时技术/20-Hadoop-Spark大数据.md` 有 **7 处 `https:////upload-images.jianshu.io/...`（四斜杠）**。

- `curl` 对该写法直接报协议错误（exit 3），浏览器同样无法加载 —— **必然破图**。
- 修正为双斜杠后实测 **HTTP 200、image/webp、31KB**，即**图片本身是好的，只是 URL 写错了**。
- 全量核验修正后的 8 个 URL：**8/8 返回 200**。

### 10.4 明确保留（本轮已逐元素核实）

- **`--studio-paper-line` 作分隔符文字色 26 处**（`/`、`·`）：不承载任何信息，提亮会破坏层级感。
- **`tools/*` 的 `.ts-skip-link` 4 处**：`left:-9999px` 常态屏外隐藏、聚焦时 `left:0` 归位且为深底浅字 —— **探针量到的 1.18:1 是「屏外元素与祖先合成色」的测量假象**，非缺陷。
- **1 处已标注失效的图片引用**：`img\适配器模式-jdk源码解析.png` 原图确已丢失，但正文**已就地写明「图片源已丢失，引用按原貌保留」**。改路径或删引用都会让这条说明失去指代对象，故保留（回归脚本已加白名单）。

### 10.5 `_sidebar.md` 404：已评估，确认不修

本轮把这条从「机制固有」升级为**有实测依据的结论**：

1. 实测 `_renderSidebar` 的降级链 `qe(..., 最后参数=true)` 要求**请求失败才回退上一级**。
2. 因此**补空文件会让请求「成功」→ 渲染空侧栏 → 停止回退**，`/_sidebar.md` 再也不会被加载，**导航彻底失效**。
3. 唯一可行的拦截点是劫持 `router.getFile`（`getFile` 是 router 的方法，不是 hook），侵入 docsify 内部实现，升级即碎。
4. 实测该 404 仅在**首次进入某目录的页面**时产生，响应体极小且不阻塞渲染。

结论：这是 docsify 多级侧栏的架构固有代价，保留。

### 10.6 回归脚本增强（本轮新增 4 项断言）

| 新增断言 | 作用 |
|---|---|
| 栅栏语言名格式合法 | 拦 ```` ```react、 ````／```` ```undefined ````／整句中文 这类写坏的栅栏 |
| 栅栏语言全部已在 Prism 注册 | 拦「静默不着色」——这是历史上真实发生过、且肉眼极难发现的问题 |
| 图片 URL 格式合法 | 拦 `https:////` 这类畸形 URL |
| 本地图片引用均存在 | 拦文件被删/路径写错导致的破图 |

断言总数 49 → **51**（`--no-viewports` 下 45 项）。

### 10.7 第四轮改动文件清单

| 文件 | 改动 |
|---|---|
| `docs/assets/css/studio-tokens.css` | 新增 `--studio-gold-ink: #6f5820` |
| `docs/assets/css/me-page.css` | 5 处金色改 `gold-ink`（年份、笔记序号、目录编号、章节号…） |
| `docs/assets/css/site-map.css` | `sm-domain-num` 改 `gold-ink` 并收口未定义的 `--studio-gold-dark`；`sm-quick-item.is-current` 改 `gold-ink` |
| `docs/assets/css/homepage-v2.css` | `home-note-quote` 改 `gold-ink` |
| `docs/tools/index.html` | `ti-group__num` 改 `gold-ink` |
| `docs/tools/resume-builder.html` | `rb-section__num` 改 `gold-ink` |
| `docs/md/04-前端/10-Taro多端开发.md` | ```` ```react、 ```` → ```` ```react ```` |
| `docs/md/08-过时技术/20-Hadoop-Spark大数据.md` | 中文句子移回正文；7 处四斜杠 URL 修正 |
| `docs/md/02-后端开发/20-消息队列.md` | ```` ```undefined ```` → ```` ```shell ```` |
| `docs/md/02-后端开发/00-MySQL数据库.md` | ```` ```scss ```` → ```` ```ini ```` |
| `docs/assets/js/prism-vim.min.js` | **新增**（官方组件，vim 语法） |
| `docs/assets/js/prism-langs.bundle.js` | 重建（17 个源文件，47.7 KB；banner 语言清单改为自动生成） |
| `scripts/build-prism-bundle.js` | ORDER 加入 vim；banner 语言清单改为从 ORDER 推导，避免加组件后注释失真 |
| `scripts/site-regression.js` | 新增语言覆盖 2 项 + 图片健康度 2 项断言；补「已知不修」的依据说明 |
| `docs/index.html` / `me.html` / `resume.html` / `docs/tools/*.html` | 4 个本轮改动的样式文件缓存戳 → `?v=20260927a`（未改动文件保持原戳） |

### 10.8 终态

```
断言 51 项：51 PASS / 0 FAIL          （完整，含 8 档视口）
断言 45 项：45 PASS / 0 FAIL          （--no-viewports）
全站对比度低于 AA：448 → 30（↓93.3%）
  剩余 30 = ts-skip-link 测量假象 4 + 分隔符标点 26（均已逐元素核实，非缺陷）
栅栏语言：37 种全部命中，Prism 88 键
图片引用：1734 处，格式全部合法，本地引用全部存在
```

---

---

## 十一、第四轮上线后发现的关键缺陷：defer 引入的插件初始化竞态

**这是本次巡检中最严重的一个缺陷，也是最难发现的一个** —— 它**本地必过、线上必挂**，我前三轮的本地回归（含 53 项断言）**全部无法发现它**，是推送上线后对线上跑回归才暴露的。

### 11.1 现象

推送上线后对 `https://wychmod.github.io/` 跑回归，出现 **8 个 FAIL**，而本地同一份代码全绿：

```
[FAIL] 代码块全部高亮        — 未高亮: java
[FAIL] 复制按钮覆盖全部代码块  — 0/6
[FAIL] 侧栏 TOC 生成         — 0 条
[FAIL] mermaid 全部渲染      — 0/0 SVG, 残留 pre=9
[FAIL] 首页搜索与动效在挂     — search=false
[FAIL] 封面搜索桥接到侧栏搜索  — 结果=0
```

同时 `_sidebar.md` 的 2 个 404 **照常出现**，说明 docsify 本身在跑。

### 11.2 排查过程中的两次误判（值得记录）

- **第一次误判「只是慢」**：怀疑是线上 CDN 慢、探针取数过早。但把等待时间拉到 **20 秒**后指标**依然是 0** —— 不是慢，是真坏。
- **第二次误判「插件丢了」**：打印 `$docsify.plugins` 内容，`长度=8`，且逐个识别出 `copy-code / pagination / search / toc / mermaid` **全部在数组里**。插件没丢，那问题只可能在**时机**。

### 11.3 根因

`docsify.min.js` 末尾的启动逻辑：

```js
var t = document.readyState;
if ("complete" === t || "interactive" === t) return setTimeout(init, 0);
document.addEventListener("DOMContentLoaded", init);
```

关键在 `setTimeout(init, 0)` —— **它不等所有 defer 脚本**。defer 脚本执行期间 `readyState` 就是 `interactive`，所以 docsify 只等「一个宏任务空档」，一旦出现就用**当时读到的 `$docsify`** 完成初始化。

而本站多数插件是**覆盖式注册**：

```js
window.$docsify.plugins = [fn]                    // copy-code / pagination
window.$docsify.plugins = (…||[]).concat(fn)      // toc
```

文件顺序上 `docsify.min.js`（第 13 个）排在插件（第 15–20 个）**之前**。同步脚本时代这没问题（阻塞执行、不产生空档）；**改成 `defer` 后**，只要某个脚本仍在下载（跨域 CDN 尤其慢），空档就会出现，docsify 便带着**不完整的插件表**启动。

实测时序（注 `plugins` 长度逐个增长，而非一次性就位）：

```
390ms   $docsify 赋值
1570ms  $docsify 赋值 (plugins 初始长度=2)
4945ms  $docsify 赋值 (plugins 初始长度=3)
5057ms  $docsify 赋值 (plugins 初始长度=7)   ← DOMContentLoaded
```

**本地之所以侥幸正常**：文件从磁盘读、毫秒级全部完成，`setTimeout(0)` 的回调还没执行，插件就已注册完毕。**这是典型的"环境把 bug 藏起来了"。**

### 11.4 修复与实证

把 `docsify.min.js` 移到**所有 `$docsify` 注册者之后**、`prism-langs.bundle.js` 之前（后者注册到 docsify 内嵌的 `window.Prism`，必须在它之后）。

为确认诊断而非猜测，用**限速复现**做了对照实验（延迟跨域脚本以制造空档）：

| 场景 | 修复前 | 修复后 |
|---|---|---|
| 不限速 | 复制 6 / TOC 21 / 搜索 true | 复制 6 / TOC 21 / 搜索 true |
| `search.js` 延迟 4s | ❌ **复制 0 / TOC 0 / 搜索 false** | ✅ 全部正常 |
| 全部 assets 延迟 1.5s | 正常 | 正常 |
| 插件延迟 3s + CDN 延迟 5s | ❌ **复制 0 / TOC 0 / 搜索 false** | ✅ 全部正常 |

修复前的失败表现是 `plugins=8` 但**功能全为 0** —— 与线上症状**完全一致**，诊断得到确证。

### 11.5 教训：本地全绿不等于线上正常

这次的核心教训不是「某行代码写错了」，而是**验证方法的盲区**：

- 前三轮我反复用「本地回归全绿」作为交付依据，但**本地磁盘 IO 的速度本身就在掩盖竞态**。
- 缺陷只在「资源加载耗时存在差异」时才显形 —— 而这恰恰是线上线下唯一的系统性差异。
- **纯静态分析也不会发现它**：文件顺序看起来「符合常规」（库在前、插件在后），只有理解了 `setTimeout(init, 0)` 才明白这个顺序是错的。

因此本轮在回归脚本里补了两道专门的防线（见 11.6），并把「本地回归通过」的结论边界写进 AGENTS.md。

### 11.6 回归脚本增强（新增 3 项断言，总数 53 → 56）

| 断言 | 作用 |
|---|---|
| `docsify.min.js` 排在全部插件注册者之后 | 静态契约，直接拦住顺序被改回 |
| prism 语法包排在 `docsify.min.js` 之后 | 防止 Prism 注册到错误实例 |
| **限速下插件仍全部生效** | **用限速复现竞态**——这是唯一能在本地发现该类缺陷的手段 |

第三项刻意用「插件产物是否存在」（复制按钮 / TOC / 搜索框）作判据，**而不是 `plugins` 数组长度** —— 故障时数组长度同样是满的，靠长度根本发现不了。

### 11.7 上线后追加的改动

| 文件 | 改动 |
|---|---|
| `docs/index.html` | 重排脚本顺序：14 个 `$docsify` 注册者 → `docsify.min.js` → `prism-langs.bundle.js`；把顺序约束与成因写进注释 |
| `scripts/site-regression.js` | 新增脚本顺序契约 2 项 + 限速竞态复现 1 项 |
| `AGENTS.md` | 记录「本地回归通过 ≠ 线上正常」，交付前须对线上跑一次 |

### 11.8 终态（本地）

```
断言 56 项：56 PASS / 0 FAIL          （完整，含 8 档视口）
断言 48 项：48 PASS / 0 FAIL          （--no-viewports）
```

---

*注：本报告所有数据来自 Playwright 真机渲染实测（Chromium，本地 `http.server`）。测量时须以**目录形式**访问（`http://127.0.0.1:PORT/`）—— 写成 `/index.html` 会让 docsify 把文档路径解析为 `/index.html/md/...`，全站文档 404，此时量到的"正文宽 412px"等数字全是 404 页的形态，属典型误测陷阱。*


