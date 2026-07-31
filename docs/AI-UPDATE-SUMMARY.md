# AI 智能问答功能更新说明

> 系统路径：WYCHMOD / AI ASSISTANT / CHANGELOG
> 文档类型：更新说明
> 适用范围：终端 AI 命令与本地文档搜索
> 最后更新：2026-07-28

本说明记录 v1.0 引入 AI 智能问答能力时的变更范围、命令与配置契约、技术实现关系和已知缺口。后续 UI 与文案订正不重复在此处登记，详见文末修改记录。

相关文档：[AI 助手使用指南](AI-ASSISTANT-GUIDE.md) · [AI 故障排查指南](AI-TROUBLESHOOTING.md)

---

## 一、本次更新解决了什么问题

在 v1.0 之前，技术知识库的查找只能依靠目录浏览或 `find` 关键词匹配，遇到自然语言提问时无法直接定位文档。本次更新在终端引入 AI 智能问答，用户可以用自然语言提问，由 AI 返回简短解答和最多 3 个推荐文档，再通过 `cat` 命令打开。

未配置 API 的用户仍可使用 `aisearch` 进行本地搜索，离线场景下也能找到文档。

---

## 二、新增能力

| 能力 | 命令 | 说明 |
|---|---|---|
| AI 技术问答 | `ai <问题>` | 调用用户配置的 OpenAI 兼容 API，返回 200 字以内的解答 |
| 命令别名 | `ask <问题>` | `ai` 的别名，调用同一处理函数 |
| 配置管理 | `aiconfig` | 查看 / 设置 API Key、API URL、Model |
| 本地智能搜索 | `aisearch <关键词>` | 基于侧边栏文档索引的本地检索，无需 API |

文档推荐由 AI 根据侧边栏解析的文档索引生成，最多 3 个，每个推荐附带标题、路径和推荐理由。

---

## 三、真实文件清单

### 新增文件

| 文件 | 作用 |
|---|---|
| `docs/assets/js/ai-assistant.js` | AI 助手核心模块（配置加载、文档索引、API 调用、响应解析、本地搜索） |
| `docs/AI-ASSISTANT-GUIDE.md` | 使用指南 |
| `docs/AI-TROUBLESHOOTING.md` | 故障排查手册 |
| `docs/AI-UPDATE-SUMMARY.md` | 本文件 |

### 修改文件

| 文件 | 变更 |
|---|---|
| `docs/index.html` | 集成 AI 模块，注册 `ai` / `ask` / `aiconfig` / `aisearch` 命令 |
| `docs/_coverpage.md` | 添加 AI 功能说明 |
| `docs/_sidebar.md` | 添加使用指南入口 |

### 历史文件

| 文件 | 状态 |
|---|---|
| `docs/TEST-AI-ASSISTANT.md` | ⚠️ 已过时：v1.0 阶段的功能测试清单，已不在仓库中维护。当前测试以浏览器手动验证为主，见第六节 |

---

## 四、命令与配置契约

### 终端命令

| 命令 | 签名 | 行为 |
|---|---|---|
| `ai` | `ai <问题>` | 调用 `window.AIAssistant.ask`，返回格式化结果 |
| `ask` | `ask <问题>` | `ai` 的别名，调用同一处理函数 |
| `aiconfig` | `aiconfig` | 调用 `window.AIAssistant.getConfigStatus`，显示三项配置状态 |
| `aiconfig` | `aiconfig <key> <value>` | 调用 `window.AIAssistant.setConfig`，写入 `localStorage` |
| `aisearch` | `aisearch <关键词>` | 调用 `window.AIAssistant.search`，本地检索文档索引 |

### 配置键（`localStorage`）

| 键 | 用途 | 默认值 |
|---|---|---|
| `AI_API_KEY` | API 服务商的鉴权 Key | 无 |
| `AI_API_URL` | OpenAI 兼容的 chat completions 端点 | 无 |
| `AI_MODEL` | 调用模型名 | `gpt-5.2`（来自 `ai-assistant.js`） |

### 全局导出

```javascript
window.AIAssistant = {
  init,              // 初始化：加载配置 + 构建文档索引
  ask,               // AI 问答（异步）
  search,            // 本地文档搜索
  format,            // 格式化 AI 响应为终端输出行
  setConfig,         // 设置 apikey / apiurl / model
  getConfigStatus,   // 返回配置状态文本
  getDocumentIndex   // 返回当前文档索引（用于调试）
};
```

### 终端键盘契约

| 快捷键 | 行为 |
|---|---|
| `Ctrl/Cmd + K` | 打开 / 关闭终端 |
| `Esc` | 关闭终端 |
| `Tab` | 命令名自动补全 |
| `↑` / `↓` | 浏览历史命令 |
| `Ctrl + L` | 清屏 |

---

## 五、技术实现关系图

```text
┌─────────────────────────────────────┐
│         用户界面层                    │
│  (命令行终端 + 封面页提示)             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        命令处理层                     │
│  (index.html - 命令解析与执行)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       AI 助手核心层                    │
│  (ai-assistant.js - API 调用与逻辑)   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         数据层                        │
│  (文档索引 + localStorage 配置)        │
└─────────────────────────────────────┘
```

### 核心模块职责

| 模块 | 文件 | 职责 |
|---|---|---|
| AI 助手模块 | `docs/assets/js/ai-assistant.js` | 配置加载、文档索引构建、API 调用、响应解析、本地搜索 |
| 命令集成 | `docs/index.html` | 命令注册、异步调用、结果展示、错误提示 |
| 用户界面 | `docs/_coverpage.md` | 功能说明 |
| 帮助文档 | `docs/AI-ASSISTANT-GUIDE.md` 等 | 使用指南、故障排查、更新说明 |

---

## 六、测试与已知缺口

### 浏览器手动验证范围

| 项 | 验证方式 | 状态 |
|---|---|---|
| AI 问答 | 配置后执行 `ai 测试` | 待复验 |
| 配置管理 | `aiconfig` 显示状态、`aiconfig apikey/apiurl/model` 写入 | 待复验 |
| 本地搜索 | `aisearch Spring` 等返回结果 | 待复验 |
| 文档推荐 | AI 返回 recommendations 字段 | 待复验 |
| 错误处理 | 未配置 / 401 / 429 等场景的提示文案 | 待复验 |
| 命令补全 | `Tab` 补全 `ai` / `aiconfig` / `aisearch` | 待复验 |
| 历史命令 | `↑` / `↓` 浏览 | 待复验 |
| 文档打开 | `cat <推荐路径>` | 待复验 |

> ⚠️ 已过时：v1.0 阶段的 `TEST-AI-ASSISTANT.md` 测试清单已不在仓库中维护。当前没有自动化测试，需在浏览器手动验证。

### 已知缺口

- 未实现多轮对话上下文（每次 `ai` 都是独立请求）
- 未实现向量数据库或语义检索（本地搜索基于关键词匹配）
- 未提供后端代理，API 调用完全在浏览器执行，受 CORS 限制
- 推荐文档路径由模型推断，可能与真实路径不一致

---

## 七、隐私与安全边界

| 维度 | 说明 |
|---|---|
| API Key 存储 | 仅本机 `localStorage`，不上传本站 |
| 问题内容 | 发送到用户配置的 API 服务商，受其隐私协议约束 |
| 本站收集 | 不收集任何用户数据 |
| 公共设备 | 使用后请清除 `AI_API_KEY`、`AI_API_URL`、`AI_MODEL` |
| 代码内硬编码 | `ai-assistant.js` 不含任何真实 API Key |

---

## 八、后续计划

以下条目均为候选方向，未承诺实现时间。是否推进取决于实际使用反馈与维护成本。

### 候选方向（短期）

- 对话历史记录持久化
- 更多 OpenAI 兼容服务商的兼容性验证
- 文档推荐算法优化（路径匹配）
- 调用次数本地统计

### 候选方向（中期）

- 多轮对话上下文
- 推荐文档路径校验与自动纠错
- 响应速度优化
- 用户反馈通道（如对单次回答打分）

### 候选方向（长期）

- 向量数据库 / 语义检索集成
- 离线轻量模型支持
- 自定义提示词模板
- AI 辅助代码生成

> ⚠️ 以上为候选计划（TODO），不是承诺。具体优先级和实现时间待确认。

---

## 九、历史代码统计

下表为 v1.0 发布时（2025-01-09）的历史快照，仅作为当时的规模记录，不作为当前页面视觉大数字。当前真实规模请以仓库实际扫描为准。

| 文件 | 当时行数 | 说明 |
|---|---:|---|
| `docs/assets/js/ai-assistant.js` | 397 | AI 助手核心模块 |
| `docs/index.html` 修改 | +99 | 命令集成与界面更新 |
| `docs/AI-ASSISTANT-GUIDE.md` | 279 | 使用指南文档 |
| `docs/TEST-AI-ASSISTANT.md` | 282 | ⚠️ 已过时：原测试清单，已不在仓库 |
| `docs/_coverpage.md` 修改 | +2 | 封面页更新 |
| `docs/_sidebar.md` 修改 | +1 | 侧边栏更新 |

---

## 十、支持与反馈

| 资源 | 入口 |
|---|---|
| 使用指南 | [AI-ASSISTANT-GUIDE.md](AI-ASSISTANT-GUIDE.md) |
| 故障排查 | [AI-TROUBLESHOOTING.md](AI-TROUBLESHOOTING.md) |
| Issue 反馈 | https://github.com/wychmod/wychmod.github.io/issues |
| 评论区 | 文档底部 Gitalk |

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2025-01-09 | 新增 | v1.0 发布 AI 智能问答功能 |
| 2026-07-28 | 重构 | 按全站 UI 视觉统一规范重排结构：拆分命令与配置契约、补齐已知缺口、移除 Emoji 标题 |
| 2026-07-28 | 订正 | `TEST-AI-ASSISTANT.md` 标记为历史文件（已不在仓库）；状态由"已完成并测试通过"改为"更新说明 / 待复验"；未来规划改为候选方向（TODO） |
| 2026-07-28 | 审查 | 默认模型记录对齐 `ai-assistant.js` 实际值 `gpt-5.2`；价格说明改为以服务商当前定价为准 |
