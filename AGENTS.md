# AGENTS.md — 项目协作指南

> 本文件是 AI 协作 harness，指导任何 AI 助手正确维护本项目。
> 配套文件：`CLAUDE.md`（指向本文件的索引，适配不同 AI 工具命名约定）

---

## 1. 项目概述

基于 Docsify 的个人技术知识库（wychmod.github.io），包含 9 大分类、40+ 篇主线文档、归档原始笔记、在线工具箱。部署在 GitHub Pages。

---

## 2. 目录结构

```
wychmod.github.io/
├── AGENTS.md                    ← 本文件（AI 协作指南）
├── CLAUDE.md                    ← 同上（适配 Claude）
├── DESIGN.md                    ← 旧版 Notion 风格历史参考（不再作为首页决策依据）
├── README.md                    ← 仓库级说明
├── docs/                        ← Docsify 站点根目录
│   ├── index.html               ← 站点入口（Docsify 配置 + 壳层装配）
│   ├── _sidebar.md              ← 侧边栏导航（必须与主线文档同步）
│   ├── _navbar.md               ← 顶部导航栏
│   ├── _coverpage.md            ← 封面页
│   ├── _404.md                  ← 404 状态页
│   ├── README.md                ← 首页（快速导航 + 项目维护链接）
│   ├── md/                      ← 主线文档（9 大分类）
│   │   ├── 01-计算机基础/       ← Java/Python/算法/系统/Go
│   │   ├── 02-后端开发/         ← MySQL/Redis/MQ/分布式
│   │   ├── 03-云原生与运维/     ← Docker/K8s/CI-CD/Linux/云原生
│   │   ├── 04-前端/             ← React/Taro/Vue
│   │   ├── 05-AI与Agent/        ← AI方法论/Agent/协议/架构/LLM/ML
│   │   │   ├── 20-协议与工程/   ← MCP/A2A/DDD
│   │   │   └── 30-参考架构/     ← manus/Alembic
│   │   ├── 06-软件工程/         ← 设计模式/测试/软实力
│   │   ├── 07-求职/             ← 面试方法论/Java/Python/实习
│   │   ├── 08-过时技术/         ← 爬虫/Electron/Hadoop/NLP（存档）
│   │   ├── 09-开发工具/         ← Git/工具箱
│   │   ├── Index.md             ← 全站地图
│   │   └── archive/             ← 归档原始笔记（不可修改）
│   │       └── README.md        ← 归档来源映射表
│   ├── _meta/                   ← 项目管理文档
│   │   ├── HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md ← 首页视觉系统、实现规范与 AI Harness（权威）
│   │   ├── UI_REFACTOR_OVERVIEW.md      ← UI 重构概览与关键决策
│   │   ├── UI_IMAGE_GENERATION_PROMPTS.md / UI_IMAGE_GENERATION_PROMPTS_FINAL.md ← 视觉生成提示词
│   │   ├── REFACTOR_GUIDELINES.md       ← 写作规范
│   │   ├── REFACTOR_STATUS.md           ← 重构状态
│   │   ├── REFACTOR_PLAN.md             ← 重构方案
│   │   ├── CORRECTIONS.md               ← 改正台账
│   │   ├── ui-redesign/                 ← UI 改版详细规范与页面级文档
│   │   └── assets/                      ← 首页设计参考图等元资产
│   ├── tools/                   ← 在线工具箱（独立 HTML）
│   └── assets/                  ← CSS/JS/图片资源
│       ├── css/
│       │   ├── compat/
│       │   │   └── modern-theme.css ← 全站遗留主题兼容层
│       │   ├── pages/
│       │   │   ├── home.css         ← 首页页面层
│       │   │   ├── article.css      ← 文章页页面层
│       │   │   └── site-map.css     ← 全站地图页面层
│       │   ├── modern-theme.css     ← 全站遗留主题
│       │   ├── studio-tokens.css    ← 新视觉系统令牌
│       │   ├── shell.css            ← 壳层入口装配
│       │   ├── tokens.css           ← 令牌入口装配
│       │   ├── homepage-v2.css      ← 首页 V2 旧样式（遗留）
│       │   ├── article-reading.css  ← 文章页阅读系统
│       │   ├── tool-studio.css      ← 工具页共享外壳
│       │   └── ...
│       ├── js/
│       │   ├── bootstrap.js         ← 壳层 bootstrap / Docsify hooks
│       │   ├── features/
│       │   │   ├── terminal.js      ← 终端功能层
│       │   │   └── terminal-a11y.js ← 终端可访问性层
│       │   ├── pages/
│       │   │   ├── home.js          ← 首页交互
│       │   │   ├── article.js       ← 文章页交互
│       │   │   └── site-map.js      ← 全站地图交互
│       │   ├── homepage-v2.js       ← 首页交互旧实现（遗留）
│       │   ├── ai-assistant.js      ← 终端 AI 助手
│       │   └── ...
│       └── img/
└── scripts/                     ← 辅助脚本
    ├── check-links.js           ← 死链扫描
    ├── sidebar-check.js         ← 侧边栏入口检查
    ├── count-archive.js         ← 归档规模统计
    ├── inline-archive.js        ← 小归档内联
    ├── screenshot-mobile.js     ← 多视口移动端截图（Playwright）
    ├── typography-check.js      ← 文章页排版精修验收（Playwright）
    └── archive/                 ← 已完成使命的一次性迁移脚本存档
```

---

## 2.1 文件归位约定

为了保持仓库根目录干净、AI 和协作者能快速定位文件，遵循以下归位规则：

| 文件类型 | 正确位置 | 反例（不应出现） |
|---|---|---|
| 辅助脚本 / 检查脚本 | `scripts/` | 根目录下的 `screenshot-mobile.js` |
| 项目/重构/设计说明 | `docs/_meta/` | 根目录下的 `overview.md` |
| 站点级样式 / 脚本 | `docs/assets/css/` / `docs/assets/js/` | 根目录或工具页外部 |
| 运行时产物 | 已加入 `.gitignore`，不入库 | `node_modules/`、`output/`、`test-results/` |
| 工具页专属逻辑 | 各 `docs/tools/*.html` 内联或 `tool-studio.css` | 回填到工具页自身或对应 `pages/`、`features/`、`shell.css`，不再新增到 `modern-theme.css` |
| AI 临时脚本（一次性诊断/截图/验证） | 命名 `scripts/_tmp-*.js`，**用完即删**，不入库、不留本地 | 任务结束后仍残留的 `_tmp-*.js` |

新增文件前先判断：它属于脚本、元文档、站点资产、工具页还是运行时产物，然后放到对应目录。

AI 为自检创建的中间产物脚本（截图、诊断、冒烟验证等）属于会话临时文件：验证完成后必须**当场删除**，不得留在工作区。若某脚本有长期复用价值（如验收回归），应转正为正式命名脚本并登记到「检查脚本」一节，而不是以 `_tmp-` 形式堆积。

---

## 3. 文档分类体系

### 编号规则

- 一级分类：`{01-09}-{分类名}/`
- 主线文档：`{00/10/20/30/40/50}-{主题名}.md`（步长 10，便于插入）
- 子目录（如需要）：`{编号}-{子分类名}/{主题名}.md`

### 当前分类与文件

| 分类 | 文件 |
|---|---|
| 01-计算机基础 | 00-Java与JVM / 10-Python基础与生态 / 20-算法与数据结构 / 30-计算机系统与并发 / 40-Go语言 |
| 02-后端开发 | 00-MySQL数据库 / 10-Redis缓存 / 20-消息队列 / 30-分布式协调与搜索 |
| 03-云原生与运维 | 00-Docker容器化 / 10-Kubernetes编排 / 20-CI-CD持续集成 / 30-Linux运维 / 40-云原生架构 |
| 04-前端 | 00-React基础与状态管理 / 10-Taro多端开发 / 20-Vue与小程序 |
| 05-AI与Agent | 00-AI编程三件套方法论 / 10-Agent设计模式与多Agent / 20-协议与工程/{MCP,A2A,DDD} / 30-参考架构/{manus,Alembic} / 40-大模型应用 / 50-ML与DL基础 / 60-AI前端设计工程化 |
| 06-软件工程 | 00-系统设计与设计模式 / 10-软件测试 / 20-软实力 |
| 07-求职 | 00-面试方法论 / 10-Java面试核心速查 / 20-Python面试 / 30-实习与校招 |
| 08-过时技术 | 00-爬虫技术 / 10-Electron桌面开发 / 20-Hadoop-Spark大数据 / 30-NLP与聊天机器人 |
| 09-开发工具 | 00-Git版本控制 / 10-工具箱与资源 |

---

## 4. 导航维护规则

**每次新增或修改文档后，必须检查并同步以下文件：**

| 文件 | 何时更新 | 怎么更新 |
|---|---|---|
| `docs/_sidebar.md` | 每次新增文档 | 在对应分类下添加链接条目 |
| `docs/README.md` 知识索引折叠区 | 每次新增文档 | 在对应 `<details>` 折叠区添加链接 |
| `docs/README.md` 首页「近期写作与研究」 | 每次主线文档新增或内容更新后 | 按真实修改记录取最近 3 篇，更新标题、摘要、分类、日期与链接 |
| `docs/md/Index.md` | 每次新增文档 | 在对应分类下添加链接 + 一句话描述 |
| `docs/_coverpage.md` | 仅新增一级分类时 | 添加路线卡片 |
| `docs/_navbar.md` | 仅新增重要入口时 | 添加顶部链接 |
| `docs/md/archive/README.md` | 仅新增归档时 | 在映射表添加行 |

### 侧边栏格式示例

```markdown
- 💻 **计算机基础**
  
  - **编程语言**
    - [Java 与 JVM](/md/01-计算机基础/00-Java与JVM.md)
```

### 关键原则

- 侧边栏/README/Index 是**结构化文档**，修改时**完全重写对应 section**，不要追加导致重复
- 链接路径统一用 `/md/...` 绝对路径（Docsify 路由）
- 每个分类用 `---` 分隔

---

## 5. 新增笔记流程（AI 笔记引导机制）

**当用户发来新学习内容时，AI 自动执行以下流程：**

### Step 1: 分类路由

根据内容主题，查下表确定目标文件：

| 关键词 | 目标文件 |
|---|---|
| Java/Spring/JVM/MyBatis/Netty | `docs/md/01-计算机基础/00-Java与JVM.md` |
| Python/Django/Flask/异步 | `docs/md/01-计算机基础/10-Python基础与生态.md` |
| 算法/数据结构/LeetCode/排序 | `docs/md/01-计算机基础/20-算法与数据结构.md` |
| OS/网络/TCP/HTTP/多线程/并发 | `docs/md/01-计算机基础/30-计算机系统与并发.md` |
| Go/Gin/GORM | `docs/md/01-计算机基础/40-Go语言.md` |
| MySQL/SQL/InnoDB/索引 | `docs/md/02-后端开发/00-MySQL数据库.md` |
| Redis/缓存/穿透/雪崩 | `docs/md/02-后端开发/10-Redis缓存.md` |
| MQ/Kafka/RabbitMQ/RocketMQ | `docs/md/02-后端开发/20-消息队列.md` |
| Zookeeper/ES/Elasticsearch | `docs/md/02-后端开发/30-分布式协调与搜索.md` |
| Docker/容器/Compose | `docs/md/03-云原生与运维/00-Docker容器化.md` |
| K8s/Kubernetes/Pod/Service | `docs/md/03-云原生与运维/10-Kubernetes编排.md` |
| CI/CD/Jenkins/GitHub Actions | `docs/md/03-云原生与运维/20-CI-CD持续集成.md` |
| Linux/Shell/命令 | `docs/md/03-云原生与运维/30-Linux运维.md` |
| 云原生/微服务/12因素 | `docs/md/03-云原生与运维/40-云原生架构.md` |
| React/Redux/Hooks | `docs/md/04-前端/00-React基础与状态管理.md` |
| Taro/跨端 | `docs/md/04-前端/10-Taro多端开发.md` |
| Vue/微信小程序 | `docs/md/04-前端/20-Vue与小程序.md` |
| AI编程/SDD/Harness/Loop | `docs/md/05-AI与Agent/00-AI编程三件套方法论.md` |
| Agent设计/多Agent/ReAct | `docs/md/05-AI与Agent/10-Agent设计模式与多Agent.md` |
| MCP/Model Context Protocol | `docs/md/05-AI与Agent/20-协议与工程/MCP协议.md` |
| A2A/Agent-to-Agent | `docs/md/05-AI与Agent/20-协议与工程/A2A协议.md` |
| DDD/领域驱动 | `docs/md/05-AI与Agent/20-协议与工程/DDD领域驱动.md` |
| LLM/GPT/Embedding/RAG | `docs/md/05-AI与Agent/40-大模型应用.md` |
| ML/DL/深度学习/神经网络 | `docs/md/05-AI与Agent/50-ML与DL基础.md` |
| AI前端设计/前端设计工程化/UI设计工程化 | `docs/md/05-AI与Agent/60-AI前端设计工程化.md` |
| 设计模式/系统设计/架构 | `docs/md/06-软件工程/00-系统设计与设计模式.md` |
| 测试/QA/自动化测试 | `docs/md/06-软件工程/10-软件测试.md` |
| 面试/求职/简历 | `docs/md/07-求职/` 对应文件 |
| Git/开发工具/效率 | `docs/md/09-开发工具/` 对应文件 |

### Step 2: 判断更新 or 新建

- **现有文档已覆盖该主题** → 在对应章节末尾追加新小节
- **全新主题（现有文档无法容纳）** → 在对应分类下新建 `{下一编号}-{主题名}.md`
- **跨多个分类** → 拆分为多段，分别追加到对应文档

### Step 3: 写入内容

按以下模板格式组织：

```markdown
### X.Y 新知识点标题

核心概念用 1-3 句话说清楚。

| 对比维度 | A | B |
|---|---|---|
| ... | ... | ... |

```代码示例（如有）```

> 💡 补充：{如果是 AI 补充的背景知识，标注此标记}
```

### Step 4: 同步导航与首页最近更新

- 更新 `_sidebar.md` + `README.md` 知识索引折叠区 + `Index.md`（仅新建文档时需要）。
- 若新增或更新了主线文档，同步 `docs/README.md` 首页的「近期写作与研究」模块：按真实修改记录取最近 3 篇，更新标题、摘要、分类、日期与链接。

### Step 5: 追加修改记录

在目标文档末尾的「最新修改记录」表格中追加一行，并把被替换下来的旧条目同步移入 `docs/_meta/CHANGELOG_HISTORY.md` 对应文档的历史表格（见第 7 节）。

### Step 6: 归档原始资料（如有）

如果用户提供了原始文档/笔记文件：
1. 将原文件放入 `docs/md/archive/{来源类型}-{名称}/`
2. 更新 `docs/md/archive/README.md` 映射表
3. 原文件**不做任何修改**

---

## 6. 文档写作规范

核心规则（详见 `docs/_meta/REFACTOR_GUIDELINES.md`）：

1. **忠于原文**：保留作者原意，不替作者发言
2. **简单易懂**：短句优先，一段一个观点
3. **错误必改**：错别字、死链、事实错误必须修正
4. **改必有据**：改动进 `CORRECTIONS.md` + 文末「最新修改记录」
5. **不丢失内容**：归档原文件 100% 保留
6. **补充必标**：AI 补充的内容标 `> 💡 补充：...`
7. **过时必标**：过时信息加 `⚠️ 已过时` + 替代方案

### 文档结构模板

```markdown
# 标题

> **原文归档**：[archive/old-xxx/](../archive/old-xxx/)

---

## 一、核心概述
## 二、详细知识点
## 三、代码/配置示例
## 四、2026 年现状（如适用）
## 五、常见坑与最佳实践

---

## 📚 完整资料
- [archive/old-xxx/](../archive/old-xxx/) — 原始笔记归档

---

## 最新修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| YYYY-MM-DD | 审查 | 全面审查通过，无订正 |
```

---

## 7. 订正记录规范

每篇主线文档末尾只维护「**最新修改记录**」表格：仅保留最近一次修改日期的条目，完整历史统一归档在 `docs/_meta/CHANGELOG_HISTORY.md`（按分类、按文档分节）。

每次修改后：

1. 新条目写入对应文档的「最新修改记录」，被替换下来的旧条目同步追加到 `CHANGELOG_HISTORY.md` 对应文档的历史表格；
2. 重大改动同时登记到 `docs/_meta/CORRECTIONS.md`。

| 类型 | 含义 |
|---|---|
| 审查 | 全面审查通过 |
| 订正 | 修正了错误/过时内容 |
| 新增 | 补充了新章节/知识点 |
| 重构 | 大幅重组了结构 |

---

## 8. 检查脚本

```bash
# 死链扫描（主线文档 + 导航文件）
node scripts/check-links.js

# 侧边栏入口完整性
node scripts/sidebar-check.js

# 归档规模统计
node scripts/count-archive.js

# 多视口移动端截图（需先启动本地预览）
node scripts/screenshot-mobile.js

# 文章页排版精修验收：样式断言 + 截图（需先启动本地预览 + Playwright）
node scripts/typography-check.js

# 本地预览
npx docsify-cli serve docs --port 3000
```

### 8.1 文档变更验收分级

普通新增或更新文章通常不会影响站点 UI，不需要启动 Docsify 做浏览器自动化、截图或 Playwright 检查。

**普通文章类改动**包括：

- 新增或更新 `docs/md/**/*.md` 主线文档；
- 同步 `docs/_sidebar.md`、`docs/md/Index.md`；
- 按真实修改记录同步 `docs/README.md` 的知识索引和「近期写作与研究」文字内容；
- 追加文末「最新修改记录」，被替换的旧条目移入 `docs/_meta/CHANGELOG_HISTORY.md`。

这类改动默认只需运行：

```bash
node scripts/sidebar-check.js
node scripts/check-links.js
git diff --check
```

只有出现以下情况时，才需要跑 UI 自动化、截图或真实浏览器验收：

- 修改了 `docs/_coverpage.md`；
- 修改了 `docs/index.html`；
- 修改了 `docs/assets/css/` 或 `docs/assets/js/`；
- 修改了 `docs/tools/` 下的工具页面；
- 调整了首页布局、样式、交互、响应式、终端、搜索、头像、图标或数据统计；
- 用户明确要求做 UI 验收；
- 新增内容包含复杂 HTML、内联样式、脚本、iframe、图片密集布局等可能影响渲染的内容。

如果只是文章与导航文字同步，即使涉及 `docs/README.md` 的最近更新条目，也按普通文章类改动处理；注意保持标题和摘要简短，避免明显溢出。

---

## 9. 禁止事项

- **禁止修改** `docs/md/archive/` 下的任何归档原文件
- **禁止删除**任何文件（用归档代替删除）
- **禁止**在侧边栏/README 中追加导致重复条目（应重写对应 section）
- **禁止**编造用户没学过的内容、统计数据、工具推荐
- **禁止**修改 `docs/index.html` 中的 Docsify 核心配置（除非明确要求）
- **禁止**改动 `docs/tools/` 下的工具页面（除非明确要求）
- **禁止**把 AI 临时脚本（`scripts/_tmp-*`）留在仓库中：用完即删；有复用价值的转正为正式脚本，不得长期以 `_tmp-` 形式存在

---

## 10. 首页视觉与实现 Harness

### 10.1 权威规范

首页 V2 及后续视觉演进的单一事实来源是：

`docs/_meta/HOMEPAGE_DESIGN_AND_IMPLEMENTATION.md`

根目录 `DESIGN.md` 是旧版 Notion 风格的历史参考，不再作为首页或全局视觉决策依据。两者冲突时，以首页新规范为准。

### 10.2 强制触发范围

任务涉及以下任一文件或主题时，AI **必须先完整阅读首页规范**，再进行设计或编码：

- `docs/_coverpage.md`
- `docs/README.md` 的首页视觉区
- `docs/index.html` 的 Docsify 配置、壳层 bootstrap、搜索桥接、终端入口
- `docs/assets/css/modern-theme.css` 与 `docs/assets/css/compat/modern-theme.css` 的遗留兼容层
- `docs/assets/css/studio-tokens.css`
- `docs/assets/css/tokens.css`
- `docs/assets/css/shell.css`
- `docs/assets/css/pages/home.css`
- `docs/assets/css/pages/home-motion.css`
- `docs/assets/css/pages/article.css`
- `docs/assets/css/pages/site-map.css`
- `docs/assets/js/bootstrap.js`
- `docs/assets/js/features/terminal.js`
- `docs/assets/js/features/terminal-a11y.js`
- `docs/assets/js/pages/home.js`
- `docs/assets/js/pages/home-motion.js`
- `docs/assets/js/pages/article.js`
- `docs/assets/js/pages/site-map.js`
- `docs/assets/js/homepage-v2.js`（遗留兼容，优先避免继续加料）
- 首页头像、图标、色彩、字体、布局、动效、响应式、文案和统计

### 10.3 编码前门禁

开始写 HTML/CSS/JS 前必须明确输出：

1. Purpose Statement
2. Aesthetic Direction
3. Color Palette
4. Typography
5. Layout Strategy
6. 计划修改的文件
7. 必须保持不回归的行为

默认设计方向固定为 **Editorial / magazine：研究者的数字书房**。深色封面代表知识结构与工程实践，纸白内页代表阅读、研究、写作和持续修订。

### 10.4 实现边界

- 保持 Docsify hash 路由，不迁移 React/Vue/Vite，不在视觉任务中升级 Docsify。
- `_coverpage.md` 承担深色封面；`README.md` 承担纸白内页和完整知识导航。
- 首页终端预览、顶部终端按钮、移动端悬浮按钮必须复用现有 `#terminal-window`，禁止创建第二套命令行系统。
- `Ctrl/Cmd + K` 只用于终端；首页搜索不得占用该快捷键。
- GitHub 头像使用 `https://github.com/wychmod.png?size=160`，必须有固定尺寸、alt 和失败回退。
- 新首页样式必须有 `.is-home` / `.home-v2` 等作用域，禁止用宽泛选择器破坏文章页。
- 动态首页交互在 Docsify `doneEach` 后幂等初始化，不得重复绑定监听器。

### 10.5 真实性门禁

- 9 大领域和所有链接必须与 `_sidebar.md`、`README.md`、`md/Index.md` 一致。
- 最近更新的标题、摘要和日期必须来自真实主线文档及文末「最新修改记录」。
- 文档数、工具数等统计必须通过脚本或 DOM 计算；不能复制设计图中的概念数字。
- 在读书目、阅读进度、研究问题、页边批注和作者手记必须由作者确认或来自真实文档。
- **书桌边 / 页边批注**：每条摘录控制在 **80–110 个汉字**（约 3–4 行），必须摘自真实主线文档并标注来源与更新日期；避免过短导致卡片空旷，也避免过长破坏三栏平衡。
- 无真实来源的字段直接隐藏，禁止用占位假数据填满版面。

### 10.6 验收门禁

首页相关代码或视觉改动完成后必须：

1. 运行 `node scripts/sidebar-check.js`。
2. 运行 `node scripts/check-links.js`，与当前历史死链基线比较，确保没有新增首页死链。
3. 运行 `git diff --check`。
4. 启动本地 Docsify，在 `1440×900`、`1280×800`、`1024×768`、`768×1024`、`390×844`、`360×800` 检查截图。
5. 验证搜索、CTA、9 域链接、终端预览、`Ctrl/Cmd + K`、`Esc`、首页与文章页往返。
6. 检查控制台无新增 error，文本无重叠或溢出，头像和图标成功渲染。
7. 确认未修改 `docs/md/archive/`。

普通新增或更新文章不适用本节 UI 自动化门禁，按「8.1 文档变更验收分级」执行。

任何 token、组件、数据来源或交互契约变化，都必须同步更新首页规范；不得只改代码不改 Harness。
