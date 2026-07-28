# 全站 UI 视觉统一：设计与开发总任务书

> 文档状态：实施前规范，V1.0
>
> 参考图：P002 首页基线使用 `../assets/homepage-design-reference-v1.png`；其余页面使用 `references/image-01.png`、`references/image-03.png` 至 `references/image-26.png`
>
> 提示词来源：[`../UI_IMAGE_GENERATION_PROMPTS_FINAL.md`](../UI_IMAGE_GENERATION_PROMPTS_FINAL.md)
>
> 首页权威规范：[`../HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md`](../HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md)
>
> 重要边界：本目录是任务设计，不代表页面已经实施。现有首页设计冻结，不在本任务中修改。

---

## 0. 本目录总控入口

这份 `README.md` 是本次 UI 计划的目录型总任务书。真正负责开发节奏、依赖顺序、实施门禁、验收证据和跨页面风险控制的总控文档是：

- [`PROJECT_DEVELOPMENT_PLAN.md`](./PROJECT_DEVELOPMENT_PLAN.md) — 全站 UI 视觉统一项目开发总控文档
- [`DESIGN_REVIEW_AUDIT.md`](./DESIGN_REVIEW_AUDIT.md) — 26 张参考图与 26 份页面规格二次 Review 报告

给其他无视觉大模型派发任务时，推荐最小上下文包：

1. `docs/_meta/HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md`
2. `docs/_meta/ui-redesign/PROJECT_DEVELOPMENT_PLAN.md`
3. 当前页面的 `docs/_meta/ui-redesign/pages/xx-*.md`
4. 当前页面相关源码

不要只给参考图，也不要一次性让实现模型自由处理全部页面。

---

## 1. 任务目的

把 26 张生成图转化为一套可审查、可逐页实施、可验证功能不回归的工程任务。视觉方向继承当前首页的“研究者的数字书房”：暖石墨封面表达知识结构与工程实践，灰纸白内页表达阅读、研究、写作和持续修订。页面现代化来自信息秩序、精确网格、真实状态与可用交互；人文感来自作者、来源、修订和判断，不来自仿旧摆件或虚构故事。

本任务优先调整样式、布局和语义结构。只有在现有 DOM 无法满足可访问性或响应式时，才允许最小范围修改 HTML；现有函数、ID、存储键、路由和输出语义必须保留。

## 2. 非目标与冻结项

- 不修改现有首页 `_coverpage.md`、`README.md` 首页视觉区、`homepage-v2.css` 或 `homepage-v2.js`。
- P002 使用 `../assets/homepage-design-reference-v1.png` 作为首页视觉回归基线，不形成首页改造任务；首页本阶段先不改造。
- `image-11` 与 `image-08` 内容重复，只记录生成资产事实，不形成第二套侧边栏实现。
- 不迁移 React、Vue、Vite，不升级 Docsify 或插件。
- 不复制新的搜索、终端、评论、分页、Markdown 渲染或工具业务逻辑。
- 不修改 `docs/md/archive/` 下的任何文件。
- 不把参考图中的虚构日期、统计、履历、引用、路径或命令输出写进生产页面。

## 3. 统一设计规格

### 3.1 Purpose Statement

为需要查资料、理解技术关系、使用本地工具或了解作者经历的访问者，建立一套安静、精确、可重复使用的数字研究界面。每个页面首先完成任务，其次才表达风格。

### 3.2 Aesthetic Direction

唯一方向是 **Editorial / magazine，研究者的数字书房**。关键词：技术刊物、工程图谱、编目、索引、修订、书页留白、可验证状态。禁止企业 SaaS、黑客秀、Notion 克隆、玻璃拟态、复古咖啡馆和大面积装饰卡片。

### 3.3 Color Palette

| 语义 | Token | 色值 | 用途 |
|---|---|---|---|
| 暖石墨 | `--studio-ink-950` | `#0D100E` | 导航、工具工作台、终端 |
| 深墨 | `--studio-ink-900` | `#131713` | 深色次级层 |
| 灰纸白 | `--studio-paper-100` | `#E9E5DC` | 内容背景 |
| 浅纸白 | `--studio-paper-50` | `#F2EEE5` | 输入、局部工作面 |
| 墨色正文 | `--studio-text` | `#20211D` | 正文 |
| 次级文字 | `--studio-text-muted` | `#66685F` | 元信息、说明 |
| 信号绿 | `--studio-green` | `#24D18F` | 主 CTA、成功、在线、焦点 |
| 旧金 | `--studio-gold` | `#C8A96B` | 编号、选中导航、编辑标记 |
| 危险 | 页面语义色 | `#B64B45` 附近 | 错误，不作品牌色 |

信号绿只能表达动作和状态；旧金只能表达编目与层级。禁止紫色主视觉、蓝紫渐变、发光描边和纯黑/纯白大面积拼接。

### 3.4 Typography

- 展示与章节标题：`Source Han Serif SC`、`Noto Serif SC`、`Songti SC`、SimSun、serif。
- 正文与控件：`Source Han Sans SC`、`Noto Sans SC`、`Microsoft YaHei`、sans-serif。
- 命令、日期、路径、状态、代码：`IBM Plex Mono`、`JetBrains Mono`、Consolas、monospace。
- 字距为 `0`。正文最小 `15px`，辅助文字不得低于 `12px`。
- 桌面 H1 通常 `36–48px`；工具工作台 H1 控制在 `32–40px`；移动端 H1 `28–34px`。

### 3.5 Layout Strategy

- 全站固定导航约 `60px`，内容最大宽度 `1440px`，桌面左右 gutter `40px`。
- 文章页采用左侧 Docsify 导航、中部正文、右侧页内目录的阅读布局；现有插件不具备的“页边批注”不得伪造。
- 工具页采用“标题/状态带 + 主工作区 + 解释区”的结构；工作区可以有边框，页面章节不得全部卡片化。
- 桌面优先双栏或三栏；移动端转换为单栏、Tabs、抽屉或底部操作条，不缩小桌面稿。
- 圆角仅 `3px` 或 `6px`，边线 `1px`。阴影只用于终端、移动抽屉和明确浮层。

### 3.6 Human-Centered Rules

- 所有作者经历、统计、项目成果、日期和修订必须来自现有页面或真实文档。
- 工具说明回答“为什么保留这个工具”“结果如何判断”，避免营销式功能口号。
- 错误信息必须指出位置、原因和恢复动作；空状态必须给出下一步。
- 不用虚构便签、书目、手写体、印章、咖啡杯或纸张污渍制造人文感。

## 4. 共享技术契约

### 4.1 Docsify 文章与系统页面

必须保留：hash 路由、`loadSidebar`、Docsify Search、分页、代码复制、Prism、Mermaid、TOC、Gitalk、阅读进度、返回顶部、编辑此页、页脚和阅读历史。首页继续应用 Gitalk/页脚/编辑链接例外。

`Ctrl/Cmd + K` 只属于现有 `#terminal-window`；`Esc` 关闭终端；首页搜索沿用 `form#cover-search` 桥接侧栏搜索。任何页面视觉任务不得重新绑定冲突快捷键。

### 4.2 工具页

每个 `docs/tools/*.html` 是独立静态 HTML。实施时保留现有 `id`、全局函数名、内联事件入口和本地处理承诺。可把 Emoji 按钮替换为 Lucide，但必须保留可见文本、`title`/Tooltip 和 `aria-label`。

### 4.3 个人页

`me.html` 和 `resume.html` 共用 `me-page.css`、`me-page.js`。必须保留移动导航、平滑锚点、滚动高亮、渐进显示、GitHub 数据降级、Markdown 片段渲染、邮件表单校验、`mailto:` 兜底和打印行为。

## 5. 图片与页面映射

| 图 | Prompt | 目标 | 子任务 | 处理结论 |
|---:|---|---|---|---|
| 01 | P001 | 39 篇主线文章统一母版 | [01](pages/01-mainline-article.md) | 可实施，必须适配任意 Markdown |
| 02 | P002 | 当前首页 | [02](pages/02-homepage-regression-reference.md) | 只读回归基线，使用 `../assets/homepage-design-reference-v1.png`，首页先不改造 |
| 03 | P003 | `docs/md/Index.md` | [03](pages/03-site-map.md) | 可实施 |
| 04 | P004 | 3 篇 AI 配套文档 | [04](pages/04-ai-docs.md) | 可实施，内容不合并 |
| 05 | P005 | `docs/README-Terminal.md` | [05](pages/05-terminal-guide.md) | 可实施，不复制终端 |
| 06 | P006 | `docs/md/archive/README.md` | [06](pages/06-archive-index.md) | 只改索引呈现，不改归档 |
| 07 | P007 | Docsify Search 结果态 | [07](pages/07-search-results.md) | 可实施，沿用插件 DOM |
| 08 | P008 | 全局移动侧边栏与顶部导航 | [08](pages/08-mobile-sidebar.md) | 可实施 |
| 09 | P009 | 现有终端弹窗 | [09](pages/09-terminal-modal.md) | 只改视觉和可访问性 |
| 10 | P010 | Docsify 404 状态 | [10](pages/10-not-found.md) | 可实施，保留 hash 路由 |
| 11 | P008 重复 | 与 image-08 相同 | [11](pages/11-duplicate-sidebar-reference.md) | 不单独实施 |
| 12 | P101 | `docs/tools/index.html` | [12](pages/12-tools-index.md) | 可实施 |
| 13 | P102 | `ai-recommend.html` | [13](pages/13-ai-recommend.md) | 可实施 |
| 14 | P103 | `base64-tool.html` | [14](pages/14-base64-tool.md) | 可实施 |
| 15 | P104 | `code-formatter.html` | [15](pages/15-code-formatter.md) | 可实施 |
| 16 | P105 | `color-tool.html` | [16](pages/16-color-tool.md) | 可实施 |
| 17 | P106 | `json-tool.html` | [17](pages/17-json-tool.md) | 可实施 |
| 18 | P107 | `markdown-editor.html` | [18](pages/18-markdown-editor.md) | 可实施 |
| 19 | P108 | `radix-tool.html` | [19](pages/19-radix-tool.md) | 可实施 |
| 20 | P109 | `regex-tool.html` | [20](pages/20-regex-tool.md) | 可实施 |
| 21 | P110 | `resume-builder.html` | [21](pages/21-resume-builder.md) | 可实施，保护草稿 |
| 22 | P111 | `structure-tool.html` | [22](pages/22-structure-tool.md) | 可实施 |
| 23 | P112 | `timestamp-tool.html` | [23](pages/23-timestamp-tool.md) | 可实施 |
| 24 | P113 | `url-tool.html` | [24](pages/24-url-tool.md) | 可实施 |
| 25 | P201 | `docs/me.html` | [25](pages/25-personal-card.md) | 可实施，真实内容优先 |
| 26 | P202 | `docs/resume.html` | [26](pages/26-resume.md) | 可实施，打印优先 |

## 6. 实施顺序

1. 建立全局非首页 token 与作用域，只复用 `studio-tokens.css` 中稳定 token，不改首页值。
2. 完成文章母版、站点地图、AI 文档、终端指南、搜索、侧边栏与 404；每完成一项做文章页回归。
3. 完成终端视觉，单独验证命令、历史、AI 配置和焦点。
4. 先统一工具外壳与工具箱首页，再逐个迁移 12 个工具；每页保持可独立回滚。
5. 最后处理个人名片和简历，因为两页共用 CSS/JS，必须联合回归。
6. P002 首页基线、`image-11` 永远不进入实施队列；首页本阶段先不改造。

## 7. 全局验证矩阵

| 视口 | 必检项 |
|---|---|
| `1440×900` | 导航、最大宽度、主工作区、首屏信息密度 |
| `1280×800` | 三栏降级、按钮不换行错位 |
| `1024×768` | 侧栏与内容关系、无横向滚动 |
| `768×1024` | 平板导航、抽屉、工作区重排 |
| `390×844` | 单栏、底部操作、44px 点击区、长文本换行 |
| `360×800` | 极窄屏无裁切、无 10px 字号补救 |

所有可实施页面至少完成：键盘全流程、触摸流程、空/错/成功状态、刷新后状态、返回导航、控制台无新增 error、主要文本 WCAG AA、`prefers-reduced-motion`、`git diff --check`。

Docsify 相关任务额外运行：

```bash
node scripts/sidebar-check.js
node scripts/check-links.js
```

工具相关任务必须对每个现有函数做至少一条行为测试；个人页必须断网测试 GitHub 降级与邮件兜底；简历和简历制作器必须打印到 PDF 并检查 A4 分页。

## 8. 完成定义

- 26 张图都有唯一文档记录，重复稿与冻结稿不会误进入开发。
- 每个可实施子任务都列出真实源文件、现有功能、允许改动与禁止改动。
- 实施结果与当前首页共享视觉 DNA，但页面结构服从自身任务。
- 所有业务功能、路由、存储键、下载/打印、剪贴板、键盘与错误状态通过验证。
- 没有修改 `docs/md/archive/`，没有新增虚构数据，没有引入第二套搜索或终端。
