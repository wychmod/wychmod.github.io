# CLAUDE.md — 项目协作指南

> 本文件是 AI 协作 harness，指导 Claude 正确维护本项目。
> 配套文件：`AGENTS.md`（内容相同，适配通用 AI 工具）

---

## 1. 项目概述

基于 Docsify 的个人技术知识库（wychmod.github.io），包含 9 大分类、40+ 篇主线文档、归档原始笔记、在线工具箱。部署在 GitHub Pages。

---

## 2. 目录结构

```
wychmod.github.io/
├── AGENTS.md                    ← AI 协作指南（通用）
├── CLAUDE.md                    ← 本文件（适配 Claude）
├── docs/                        ← Docsify 站点根目录
│   ├── index.html               ← 站点入口（Docsify 配置 + 终端系统）
│   ├── _sidebar.md              ← 侧边栏导航（必须与主线文档同步）
│   ├── _navbar.md               ← 顶部导航栏
│   ├── _coverpage.md            ← 封面页
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
│   │   ├── REFACTOR_GUIDELINES.md  ← 写作规范
│   │   ├── REFACTOR_STATUS.md      ← 重构状态
│   │   ├── REFACTOR_PLAN.md        ← 重构方案
│   │   └── CORRECTIONS.md          ← 改正台账
│   ├── tools/                   ← 在线工具箱（独立 HTML）
│   └── assets/                  ← CSS/JS/图片资源
└── scripts/                     ← 辅助脚本
    ├── check-links.js           ← 死链扫描
    ├── sidebar-check.js         ← 侧边栏入口检查
    ├── count-archive.js         ← 归档规模统计
    └── inline-archive.js        ← 小归档内联
```

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
| 05-AI与Agent | 00-AI编程三件套方法论 / 10-Agent设计模式与多Agent / 20-协议与工程/{MCP,A2A,DDD} / 30-参考架构/{manus,Alembic} / 40-大模型应用 / 50-ML与DL基础 |
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
| `docs/README.md` | 每次新增文档 | 在对应 `<details>` 折叠区添加链接 |
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

代码示例（如有）

> 💡 补充：{如果是 AI 补充的背景知识，标注此标记}
```

### Step 4: 同步导航

更新 `_sidebar.md` + `README.md` + `Index.md`（仅新建文档时需要）。

### Step 5: 追加修改记录

在目标文档末尾的「修改记录」表格中追加一行。

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
4. **改必有据**：改动进 `CORRECTIONS.md` + 文末修改记录
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

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| YYYY-MM-DD | 审查 | 全面审查通过，无订正 |
```

---

## 7. 订正记录规范

每篇主线文档末尾维护「修改记录」表格：

| 类型 | 含义 |
|---|---|
| 审查 | 全面审查通过 |
| 订正 | 修正了错误/过时内容 |
| 新增 | 补充了新章节/知识点 |
| 重构 | 大幅重组了结构 |

重大改动同时登记到 `docs/_meta/CORRECTIONS.md`。

---

## 8. 检查脚本

```bash
# 死链扫描（主线文档 + 导航文件）
node scripts/check-links.js

# 侧边栏入口完整性
node scripts/sidebar-check.js

# 归档规模统计
node scripts/count-archive.js

# 本地预览
npx docsify-cli serve docs --port 3000
```

---

## 9. 禁止事项

- **禁止修改** `docs/md/archive/` 下的任何归档原文件
- **禁止删除**任何文件（用归档代替删除）
- **禁止**在侧边栏/README 中追加导致重复条目（应重写对应 section）
- **禁止**编造用户没学过的内容、统计数据、工具推荐
- **禁止**修改 `docs/index.html` 中的 Docsify 核心配置（除非明确要求）
- **禁止**改动 `docs/tools/` 下的工具页面（除非明确要求）
