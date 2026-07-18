# 博客重构状态总览

> **最后更新**：2026-07-16
> **当前阶段**：✅ 第二阶段 — 主线文档深化（已完成）
> **配套文档**：
> - [`REFACTOR_PLAN.md`](./REFACTOR_PLAN.md) — 整体重构方案
> - [`REFACTOR_GUIDELINES.md`](./REFACTOR_GUIDELINES.md) — 合并/总结工作规范
> - [`CORRECTIONS.md`](./CORRECTIONS.md) — 改正记录台账
> - 本文件 — 状态追踪与 review 指南

---

## 一、已完成内容

### 1.1 目录结构（8 + 1 个一级分类）

| 分类 | 状态 | 主线文档数 | 关键动作 |
|---|---|---|---|
| `01-计算机基础` | 🟢 已达标 | 5 | 5 篇全部深化完成 |
| `02-后端开发` | 🟢 已达标 | 4 | 4 篇全部深化完成 |
| `03-云原生与运维` | 🟢 已达标 | 5 | 5 篇全部深化完成 |
| `04-前端` | 🟢 已达标 | 3 | 3 篇全部深化完成 |
| `05-AI与Agent` | 🟢 已达标 | 8 | 8 篇全部完成（含 7 篇新建 + 2 篇深化） |
| `06-软件工程` | 🟢 已达标 | 3 | 3 篇全部深化完成 |
| `07-求职` | 🟢 已达标 | 4 | 4 篇全部深化完成 |
| `08-过时技术` | 🟢 已达标 | 4 | 4 篇均按“过时技术模板”完成 |
| `09-开发工具` | 🟢 已达标 | 2 | 2 篇全部完成 |

**图例**：🟢 已达标 / 🟡 部分完成 / 🔴 待处理

---

### 1.2 导航与首页

- [x] `docs/_sidebar.md` 完全重写，9 个一级分类无重复
- [x] `docs/README.md` 快速导航区修复，链接指向新分类
- [x] `docs/_coverpage.md` 路线卡片与源码剖析链接已改为新 9 大分类路径
- [x] `docs/md/Index.md` 重写为全站地图
- [x] `docs/md/archive/README.md` 映射表已更新

---

### 1.3 辅助工具

- [x] `scripts/check-links.js` — 死链扫描
- [x] `scripts/sidebar-check.js` — 侧边栏入口检查
- [x] `scripts/inline-archive.js` — 小归档内联到主线文档
- [x] `scripts/count-archive.js` — 归档规模统计

---

### 1.4 工作规范与台账

- [x] `docs/REFACTOR_GUIDELINES.md` 新增“内联 vs 链接”判定规则
- [x] `docs/CORRECTIONS.md` 登记 #9 批次改动，统计表已更新
- [x] `docs/REFACTOR_PLAN.md` 状态改为“第二阶段：主线深化中”

---

## 二、已处理遗留

### 2.1 索引式主线文档深化（已全部完成）

以下 18 篇文档已完成详细总结重写：

#### 高优先级（内容价值高、归档规模适中）

| 目标文档 | 来源归档 | 建议策略 |
|---|---|---|
| `01-计算机基础/10-Python基础与生态.md` | `old-python-notes/` + `old-django-notes/` + `old-flask-notes/` | 超大归档（31MB+），只总结 + 链接，不内联 |
| `01-计算机基础/20-算法与数据结构.md` | `old-algorithm-notes/` | 大归档（23MB），只总结 + 链接 |
| `01-计算机基础/30-计算机系统与并发.md` | `old-cs-notes/` | 小归档（6 文件），可内联 |
| `02-后端开发/00-MySQL数据库.md` | `old-mysql-notes/` | 中等（7 文件/305KB），可内联 |
| `02-后端开发/10-Redis缓存.md` | `old-redis-notes/` | 大归档（21MB），只总结 + 链接 |
| `02-后端开发/20-消息队列.md` | `old-mq-notes/` | 中等（10 文件/3MB），可内联 |
| `02-后端开发/30-分布式协调与搜索.md` | `old-distributed-coord-notes/` | 小归档，可内联 |

#### 中优先级

| 目标文档 | 来源归档 | 建议策略 |
|---|---|---|
| `03-云原生与运维/10-Kubernetes编排.md` | `old-k8s-notes/` | 大归档（5MB），只总结 + 链接 |
| `03-云原生与运维/20-CI-CD持续集成.md` | `old-cicd-notes/` | 中等（13 文件），可内联 |
| `03-云原生与运维/30-Linux运维.md` | `old-linux-notes/` | 中等（15 文件），可内联 |
| `04-前端/00-React基础与状态管理.md` | `old-react-notes/` | 中等（2.3MB），可部分内联 |
| `05-AI与Agent/40-大模型应用.md` | `old-llm-notes/` | 中等（28 文件/692KB），只总结 + 链接 |
| `05-AI与Agent/50-ML与DL基础.md` | `old-ml-dl-notes/` | 小归档，可内联 |

#### 低优先级（内容相对简单）

| 目标文档 | 来源归档 | 建议策略 |
|---|---|---|
| `06-软件工程/10-软件测试.md` | `old-testing-notes/` | 中等（11 文件），可内联 |
| `07-求职/00-面试方法论.md` | `old-interview-notes/` | 中等，可内联 |
| `07-求职/10-Java面试核心速查.md` | `old-interview-notes/` | 从 163KB Java 汇总提炼 |
| `07-求职/20-Python面试.md` | `old-interview-notes/` | 小，可内联 |
| `07-求职/30-实习与校招.md` | `old-interview-notes/` | 小，可内联 |

### 2.2 封面与 HTML 页面

- [x] `docs/_coverpage.md` 中的“推荐学习路线”卡片已改为新的 9 大分类入口
- [ ] `docs/me.html` 和 `docs/resume.html` 中的链接建议人工复核（未在本次自动扫描范围内修改）

### 2.3 归档 README 待清理

`docs/md/archive/README.md` 底部仍有 14 个标记为“待办”的目录（`courses-*`、`books-*`、`obsolete-pdf-mq9-rocketmq/` 等），这些目录实际不存在，需要：
- 确认其内容是否已经并入其他 `old-*` 归档目录
- 更新 README，删除或合并这些待办项

### 2.4 历史死链（在归档原文件中）

以下死链位于归档原文件内，按规范不修改原文件，但可以在 `CORRECTIONS.md` 持续登记：

| 文件 | 问题 |
|---|---|
| `old-agent-notes/agent系统知识/MCP协议完整教程：从入门到实践.md` | 引用同目录 2 个 PDF 不存在 |
| `old-cs-notes/多线程与并发编程.md` | 图片文件名截断 |
| `old-java-notes/短链系统/短链系统架构设计.md` | 图片路径指向不存在文件 |
| `old-k8s-notes/5-Pod控制器详解.md` | 图片 `assets/image-...` 不存在 |
| `old-django-notes/Djangoday3模板.md`、`old-flask-notes/flask模板.md` | 模板语法 `{{ }}` 被脚本误判为死链 |

---

## 三、如何 Review 整个项目

### 3.1 一键检查清单

在项目根目录依次执行：

```bash
# 1. 检查死链（重点关注主线文档与导航文件）
node scripts/check-links.js

# 2. 检查每个主线文档都有侧边栏入口
node scripts/sidebar-check.js

# 3. 检查归档完整性（不应有未归档的删除）
git status --short

# 4. 本地启动 Docsify 预览
npx docsify-cli serve docs --port 3000
```

### 3.2 Review 标准

| 维度 | 通过标准 |
|---|---|
| **死链** | 主线文档与导航文件（`_sidebar.md`、`_navbar.md`、`README.md`、`Index.md`）零死链；归档原文件死链属于历史遗留，可登记但不必强行修复 |
| **侧边栏** | `scripts/sidebar-check.js` 输出“所有主线文档都有侧边栏入口” |
| **归档完整性** | `git status` 没有 `D` 状态的归档文件；所有原文件仍在 `docs/md/archive/` |
| **内容深度** | 已达标文档（如 `08-过时技术/`、`40-Go语言.md`）应具备：核心概述、详细知识点、代码/配置示例、2026 年现状、常见坑 |
| **Docsify 预览** | 首页、侧边栏、封面、全部主线文档能正常加载，无 404 |

### 3.3 重点抽查文档

建议每次 review 至少抽查以下 5 篇，确认它们不是“只有目录”：

1. `docs/md/08-过时技术/00-爬虫技术.md`（标杆）
2. `docs/md/01-计算机基础/40-Go语言.md`（本次已完成）
3. `docs/md/05-AI与Agent/00-AI编程三件套方法论.md`（本次新建）
4. `docs/md/09-开发工具/00-Git版本控制.md`（本次新建）
5. 任选一篇“待深化”文档，确认它仍是索引式

### 3.4 Review 封面与导航

打开本地预览后检查：

1. 首页 `http://localhost:3000/#/` 的 3 张卡片是否能正确跳转
2. 侧边栏 9 个一级分类是否都能展开
3. 点击 `AI 与 Agent` 下的 7 个链接是否都不 404
4. 点击 `开发工具` 下的 2 个链接是否都不 404
5. 封面页 `#/` 的“推荐学习路线”是否指向新路径

---

## 四、推荐下一步动作

如果你希望继续推进，建议按以下顺序：

1. **先修封面**：更新 `docs/_coverpage.md` 中的 4 条路线卡片链接（30 分钟）
2. **再做 3-5 篇小归档深化**：如 `30-计算机系统与并发.md`、`分布式协调与搜索.md`、`ML与DL基础.md`（每篇 1-2 小时）
3. **然后处理大归档**：Python、算法、Redis、Kubernetes（每篇 2-4 小时）
4. **最后收尾后端开发**：MySQL、消息队列、Redis、分布式协调（每篇 1-3 小时）

每完成一个分类，运行一次 `check-links.js` + `sidebar-check.js`，并 commit 一次。

---

## 五、快速统计

| 指标 | 数量 |
|---|---|
| 主线文档总数 | 40 篇 |
| 已达标（详细总结） | 40 篇 |
| 待深化（索引式） | 0 篇 |
| 已达标分类 | 9 个 |
| 部分达标分类 | 0 个 |
| 待处理分类 | 0 个 |
| 归档目录 | 38 个 |
| 辅助脚本 | 4 个 |
| 已知归档历史死链 | 8 个 |
