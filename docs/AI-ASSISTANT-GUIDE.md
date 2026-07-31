# AI 智能助手使用指南

> 系统路径：WYCHMOD / AI ASSISTANT / GUIDE
> 文档类型：使用指南
> 适用范围：终端 AI 命令与本地文档搜索
> 最后更新：2026-07-28

本指南说明 wychmod 技术知识库终端中 AI 智能助手的能力边界、配置方式与使用流程。AI 助手真实能力来自现有终端命令和 `docs/assets/js/ai-assistant.js`，本指南不新增功能，只解释和校正现有能力。

相关文档：[AI 故障排查指南](AI-TROUBLESHOOTING.md) · [AI 更新说明](AI-UPDATE-SUMMARY.md)

---

## 一、为什么增加这个能力

wychmod 技术知识库包含 9 大领域、40+ 篇主线文档。在阅读时遇到概念疑问或需要快速定位资料，传统做法是先 `find` 再 `cat`。AI 助手把"提问—理解—推荐—打开"压缩到一条终端命令里：

- 用自然语言提问，不需要预先知道文档名。
- AI 返回简短解答和最多 3 个推荐文档。
- 推荐文档可以用 `cat` 命令直接打开。

未配置 API 时，本地搜索 `aisearch` 仍然可用，离线也能找到文档。

---

## 二、使用前先知道

| 项 | 说明 |
|---|---|
| API Key 存储位置 | 浏览器 `localStorage` 的 `AI_API_KEY` 字段，仅保存在本机 |
| 问题发送到哪里 | 你配置的 API 服务商（OpenAI 兼容的 chat completions 端点） |
| 未配置时是否可用 | `ai` / `ask` 不可用；`aisearch` 与 `find` 仍可正常使用 |
| 默认模型 | `ai-assistant.js` 内置默认 `gpt-5.2`，可用 `AI_MODEL` 覆盖 |
| 答案长度 | 控制在 200 字以内 |
| 推荐文档数量 | 最多 3 个，且必须真实存在于知识库 |

> ⚠️ API Key 仅保存在本机浏览器，不会上传到本站服务器。但公共设备上的浏览器存储仍有泄露风险，使用后请清除配置。

---

## 三、快速开始

### 3.1 打开终端

任选一种方式：

- 点击页面右下角的 `►_` 按钮
- 按下 `Ctrl+K`（Mac: `Cmd+K`）
- 终端打开后，按 `Esc` 关闭

### 3.2 配置 API Key

```bash
aiconfig apikey YOUR_API_KEY
```

`YOUR_API_KEY` 替换为你在服务商平台申请的真实 Key。

### 3.3 配置 API URL

```bash
aiconfig apiurl https://api.openai.com/v1/chat/completions
```

> 💡 补充：上面的 OpenAI 地址仅为示例。任何兼容 OpenAI Chat Completions 协议的服务商都可以使用，具体端点请以服务商当前文档为准。

### 3.4 配置模型（可选）

```bash
aiconfig model gpt-4o-mini
```

不配置时使用 `ai-assistant.js` 中的默认模型 `gpt-5.2`。模型名必须是你的 API 服务商实际支持的模型标识。

### 3.5 验证配置

```bash
aiconfig
```

输出会显示 API Key、API URL、Model 三项状态。三项都"已配置"即代表可以开始使用 `ai` 命令。

也可以在浏览器控制台直接查看：

```javascript
console.log(localStorage.getItem('AI_API_KEY'));
console.log(localStorage.getItem('AI_API_URL'));
console.log(localStorage.getItem('AI_MODEL'));
```

---

## 四、命令参考

### AI 与配置命令

| 命令 | 作用 | 示例 |
|---|---|---|
| `ai <问题>` | 向 AI 提问并获取解答与文档推荐 | `ai Spring Bean 的生命周期是什么？` |
| `ask <问题>` | `ai` 的别名 | `ask JVM 调优技巧` |
| `aiconfig` | 查看 API 配置状态 | `aiconfig` |
| `aiconfig apikey <KEY>` | 设置 API Key | `aiconfig apikey sk-xxxx` |
| `aiconfig apiurl <URL>` | 设置 API URL | `aiconfig apiurl https://api.openai.com/v1/chat/completions` |
| `aiconfig model <NAME>` | 设置模型名 | `aiconfig model gpt-4o-mini` |
| `aisearch <关键词>` | 本地文档搜索（无需 API） | `aisearch Redis` |

### 辅助命令与快捷键

| 命令 / 快捷键 | 作用 |
|---|---|
| `Tab` | 自动补全命令名 |
| `↑` / `↓` | 浏览历史命令 |
| `clear` 或 `Ctrl+L` | 清空终端屏幕 |
| `find <关键词>` | 传统本地搜索 |
| `cat <路径>` | 打开指定文档 |
| `ls` / `cd` / `tree` | 浏览目录结构 |

---

## 五、使用示例

### 5.1 AI 技术问答

```bash
ai Spring Bean 的生命周期是什么？
ai 如何优化 MySQL 查询性能？
ai Python 协程和线程有什么区别？
ai 微服务架构的优缺点是什么？
ai JVM 垃圾回收器如何选择？
```

### 5.2 本地文档搜索

```bash
aisearch Spring
aisearch Redis
aisearch Python源码
```

### 5.3 查看配置状态

```bash
aiconfig
```

### 5.4 典型响应格式

当配置完成且 API 调用成功，终端会输出类似下面的内容：

```
🤖 AI助手回答：

Spring Bean 的生命周期包括以下阶段：
1. 实例化（Instantiation）
2. 属性赋值（Populate Properties）
3. 初始化（Initialization）
4. 使用（In Use）
5. 销毁（Destruction）

📚 推荐文档：

1. 3-Spring源码解析
   深入分析 Spring Bean 的创建和生命周期管理
   使用命令打开: cat /md/spring源码/3-Spring源码解析.md

2. IOC和AOP
   理解 Spring 的核心概念和 Bean 管理
   使用命令打开: cat /md/java/spring系列学习/IOC和AOP.md
```

> 💡 补充：上面的输出格式来自 `ai-assistant.js` 中的 `formatAIResponse`。推荐文档路径是 AI 根据侧边栏解析的文档索引生成的，可能因模型理解差异而与真实路径不一致。如果 `cat` 报错，请改用 `aisearch` 查找实际路径。

---

## 六、推荐文档如何产生

`ai-assistant.js` 在初始化时解析侧边栏（`.sidebar-nav`），构建本地文档索引 `documentIndex`，包含标题、路径、分类、关键词。每次执行 `ai <问题>` 时：

1. 取索引前 50 条作为上下文，连同系统提示词一起发给 API。
2. API 返回 JSON：`{ "answer": "...", "recommendations": [{ "title", "path", "reason" }] }`。
3. 终端用 `formatAIResponse` 把答案分段显示，再列出推荐文档与打开命令。

如果 API 返回的 JSON 无法解析，会退化为只显示答案文本，不推荐任何文档。

### 知识库覆盖领域

- **Java 技术栈**：Spring、SpringBoot、SpringCloud、JVM 调优、手写 RPC
- **Python 技术栈**：Django、Flask、Python 源码剖析、异步编程、协程
- **前端开发**：React、Vue、Taro 小程序
- **数据存储**：MySQL、Redis、消息队列、Elasticsearch、Zookeeper
- **云原生**：Docker、Kubernetes、CI/CD
- **人工智能**：机器学习、深度学习、AI Agent
- **计算机基础**：算法、操作系统、计算机网络、多线程并发

---

## 七、隐私与费用提醒

| 维度 | 说明 |
|---|---|
| API Key | 仅保存在本机 `localStorage`，不上传到本站 |
| 问题内容 | 会发送到你配置的 API 服务商，受服务商隐私协议约束 |
| 本地搜索 | `aisearch` 完全本地执行，不产生任何外部请求 |
| 费用 | 调用外部 API 由服务商按其当前定价计费，本站不收取任何费用 |
| 公共设备 | 使用后请清除 `localStorage` 中的 `AI_API_KEY`、`AI_API_URL`、`AI_MODEL` |

> ⚠️ 不要在公共电脑上长期保留 API Key。清除方法见 [AI 故障排查指南](AI-TROUBLESHOOTING.md) 第十节。

---

## 八、常见问题

### Q1：提示"AI 功能未配置"怎么办？

需要先配置 API Key 和 API URL，参考第三节"快速开始"。或直接在浏览器控制台执行：

```javascript
localStorage.setItem('AI_API_KEY', 'your-api-key');
localStorage.setItem('AI_API_URL', 'https://api.openai.com/v1/chat/completions');
localStorage.setItem('AI_MODEL', 'your-model-name'); // 可选
```

刷新页面后生效。

### Q2：支持哪些 AI 模型？

`ai-assistant.js` 默认模型为 `gpt-5.2`，可通过 `aiconfig model` 或 `AI_MODEL` 覆盖为任意 OpenAI 兼容服务商支持的模型名：

```bash
aiconfig model gpt-4o-mini
```

模型是否可用取决于你的 API 服务商，本站不绑定单一服务商。

### Q3：API 调用失败怎么办？

请依次检查：

1. API Key 是否正确、是否已激活
2. API URL 是否是完整的端点地址（不是网页地址）
3. 网络是否能访问该 API
4. 账户额度是否充足

详细排查见 [AI 故障排查指南](AI-TROUBLESHOOTING.md)。

### Q4：提示"API 返回的不是 JSON 格式"怎么办？

通常说明 API URL 配置错误，指向了网页而不是 API 端点。

| 类型 | 示例 |
|---|---|
| ✅ 正确 | `https://api.openai.com/v1/chat/completions` |
| ❌ 错误 | `https://openai.com`（网站地址） |
| ❌ 错误 | `https://api.openai.com`（缺少端点路径） |

重新配置：

```bash
aiconfig apiurl https://api.openai.com/v1/chat/completions
```

### Q5：AI 推荐的文档不存在怎么办？

AI 推荐的路径可能因模型理解差异而不准确。改用本地搜索：

```bash
aisearch 关键词
find 关键词
```

### Q6：如何获取 API Key？

到你的 API 服务商平台申请。OpenAI 申请地址：https://platform.openai.com/api-keys 。其他服务商请参考其官方文档。

### Q7：API 调用会产生费用吗？

会。调用外部 API 的费用由服务商按其当前定价收取，本站不收取任何费用。具体价格以服务商当前文档为准，不在此处硬编码。

---

## 九、使用技巧

1. **提问具体明确**：`Spring Bean 的生命周期是什么？` 优于 `告诉我所有关于 Spring 的知识`。
2. **包含关键技术词汇**：`Spring AOP 原理`、`Redis 持久化机制`、`Python GIL 锁`。
3. **结合其他命令**：

```bash
ai 如何学习 JVM 调优？   # 先用 AI 获取建议
cd JVM                   # 进入相关目录
ls                       # 列出所有文档
cat JVM实战-4-调优        # 打开具体文档
```

4. **API 配置持久化**：`localStorage` 中的配置只需设置一次，长期有效，刷新页面不会丢失。

---

## 十、反馈与建议

- 提交 Issue：https://github.com/wychmod/wychmod.github.io/issues
- 在评论区留言
- 或参考 [AI 故障排查指南](AI-TROUBLESHOOTING.md)

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2025-01-09 | 新增 | v1.0 首次发布 AI 智能助手功能 |
| 2026-07-28 | 重构 | 按全站 UI 视觉统一规范重排结构：去除 Emoji 标题、补齐命令参考表、改用项目统一修改记录格式 |
| 2026-07-28 | 订正 | 默认模型由"GPT-4"更正为 `ai-assistant.js` 实际默认值 `gpt-5.2`；价格说明改为以服务商当前定价为准 |
