# AI 功能故障排查指南

> 系统路径：WYCHMOD / AI ASSISTANT / TROUBLESHOOTING
> 文档类型：故障排查手册
> 适用范围：终端 AI 命令与本地文档搜索
> 最后更新：2026-07-28

本手册按"先快速自检，再分类排查"的顺序列出 AI 助手常见错误。每个故障块统一给出可能原因、验证命令、恢复步骤和仍失败时的替代方案。

相关文档：[AI 助手使用指南](AI-ASSISTANT-GUIDE.md) · [AI 更新说明](AI-UPDATE-SUMMARY.md)

---

## 一、先做 3 个快速检查

排查任何 AI 错误前，先完成这三步，能解决大部分常见问题。

### 1. 检查配置是否完整

```bash
aiconfig
```

预期看到：API Key 已配置、API URL 已配置、Model 显示模型名称。任一项为"未配置"请见第二节。

### 2. 测试本地搜索

```bash
aisearch Spring
```

如果本地搜索正常但 AI 不可用，问题在 API 配置或网络，不影响其他终端命令。详见第八节。

### 3. 查看浏览器控制台

按 `F12` 打开开发者工具，查看 Console 标签的红色错误信息，并对照下文相应小节处理。Network 标签可以查看 API 请求的实际状态码和响应。

---

## 二、配置未完成

**错误信息**：`❌ AI功能未配置。请设置API Key和API URL。`

**可能原因**

- 未执行过 `aiconfig apikey` / `aiconfig apiurl`
- `localStorage` 被清除（浏览器隐私模式、清缓存、手动 `removeItem`）

**验证命令**

```bash
aiconfig
```

或直接读取存储：

```javascript
console.log('API Key:', localStorage.getItem('AI_API_KEY'));
console.log('API URL:', localStorage.getItem('AI_API_URL'));
console.log('Model:', localStorage.getItem('AI_MODEL'));
```

**恢复步骤**

```bash
aiconfig apikey YOUR_API_KEY
aiconfig apiurl https://api.openai.com/v1/chat/completions
aiconfig model gpt-4o-mini   # 可选，覆盖默认 gpt-5.2
```

或在控制台直接写入：

```javascript
localStorage.setItem('AI_API_KEY', 'your-api-key');
localStorage.setItem('AI_API_URL', 'https://api.openai.com/v1/chat/completions');
localStorage.setItem('AI_MODEL', 'your-model-name'); // 可选
```

刷新页面后生效。

**仍失败时**

如果配置后刷新仍提示未配置，检查浏览器是否禁用了 `localStorage`（隐私模式下不可用），或换一个浏览器再试。

---

## 三、API URL 不是 JSON / 返回 HTML

**错误信息**：`API返回的不是JSON格式，可能是HTML页面。请检查API URL是否正确。`

**可能原因**

- API URL 指向了网页（如 `https://openai.com`），而非 API 端点
- URL 缺少端点路径（如只写到 `https://api.openai.com`）
- 服务商返回了登录页或错误页（HTML 而不是 JSON）

**验证命令**

```bash
aiconfig
```

或在浏览器中直接打开你的 API URL：若看到 HTML 网页内容，说明 URL 错误；正确的 API URL 在没有 Key 的情况下应返回 401 而不是网页。

**恢复步骤**

| 类型 | 示例 |
|---|---|
| ✅ 正确 | `https://api.openai.com/v1/chat/completions` |
| ❌ 错误 | `https://openai.com`（网站地址） |
| ❌ 错误 | `https://api.openai.com`（缺少端点路径） |
| ❌ 错误 | `https://chatgpt.com`（ChatGPT 网页版地址） |

```bash
aiconfig apiurl https://api.openai.com/v1/chat/completions
```

其他兼容 OpenAI 协议的服务商，端点路径通常是 `/v1/chat/completions`，具体以其文档为准。

**仍失败时**

如果服务商使用自定义路径（如 Azure OpenAI），请按其文档拼装 URL：

```
https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2023-05-15
```

---

## 四、401 Unauthorized / 403 Forbidden

**错误信息**：`HTTP 401` 或 `HTTP 403`

**可能原因**

- API Key 不正确或被截断（复制时漏字符、含空格）
- API Key 已过期或被吊销
- 账户余额不足或未开通该模型调用权限
- 使用了服务商 A 的 Key 调用服务商 B 的 API

**验证命令**

```bash
aiconfig
aiconfig apikey YOUR_NEW_API_KEY
```

**恢复步骤**

1. 到服务商平台重新生成或确认 API Key
2. 重新执行 `aiconfig apikey` 写入完整 Key
3. 确认账户有可用额度和对应模型权限

**仍失败时**

用 `curl` 在本机直接测试 Key 是否有效（替换 `YOUR_API_KEY` 与 URL）：

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'
```

如果 `curl` 同样返回 401，问题在 Key 本身或账户，与本站无关。

---

## 五、Failed to fetch / CORS

**错误信息**：`Failed to fetch` 或 `NetworkError`

**可能原因**

- 网络断开或无法访问 API 域名
- 公司防火墙、代理或 VPN 拦截
- 浏览器 CORS 限制：API 服务商未允许从网页直接调用

**验证命令**

在浏览器控制台（F12）执行：

```javascript
fetch('https://api.openai.com/v1/models', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
}).then(r => console.log(r.status)).catch(e => console.error(e));
```

**恢复步骤**

1. 检查网络连接
2. 关闭 VPN 或代理后重试
3. 改用支持 CORS 的 OpenAI 兼容服务商

**仍失败时**

> ⚠️ 由于浏览器同源策略，某些 API 无法从网页直接调用。可行方案：

- 更换支持 CORS 的 API 服务商
- 自建代理服务转发请求（需要后端开发，本站不提供）
- 在本机用 `curl` 验证 API 可用后，仅使用 `aisearch` 进行本地搜索

---

## 六、429 Too Many Requests

**错误信息**：`HTTP 429`

**可能原因**

- 短时间内调用过于频繁，触发服务商速率限制
- 账户配额用尽

**验证命令**

```bash
aiconfig   # 确认配置无误
ai 测试    # 稍后重试
```

**恢复步骤**

1. 等待几分钟后重试
2. 查看服务商控制台的用量和速率限制
3. 必要时升级 API 套餐以获得更高配额

**仍失败时**

临时改用 `aisearch` 查找本地文档，待配额恢复后再使用 `ai`。

---

## 七、5xx 服务器错误

**错误信息**：`HTTP 500`、`HTTP 502` 或 `HTTP 503`

**可能原因**

- API 服务商内部错误，通常是临时故障
- 服务商正在维护

**验证命令**

查看服务商状态页（如 OpenAI 状态页）确认是否有故障公告。

**恢复步骤**

1. 稍后重试（多数 5xx 在几分钟到几十分钟内自愈）
2. 若服务商提供备用端点，可切换 `aiconfig apiurl`
3. 持续失败超过 1 小时时，先使用 `aisearch` 兜底

**仍失败时**

如果 5xx 持续存在且服务商状态页未报告故障，请按第十一节收集信息后提交 Issue，但本站无法修复服务商侧故障。

---

## 八、本地搜索可用但 AI 不可用

**现象**：`aisearch` 能正常返回结果，但 `ai` 命令报错。

**可能原因**

- API 配置缺失或有误（见第二节、第三节）
- 网络或 CORS 阻断 API 请求（见第五节）
- 服务商账户或配额问题（见第四、六节）

**验证命令**

```bash
aisearch Spring    # 本地搜索
aiconfig           # 检查配置
ai 测试            # 测试 AI 调用
```

**恢复步骤**

按"配置未完成 -> API URL 不是 JSON -> 401 / 403 -> Failed to fetch / CORS -> 429 -> 5xx"的顺序对照排查。

**仍失败时**

AI 不可用不影响其他终端命令。可继续使用 `aisearch`、`find`、`cat`、`ls`、`cd` 完成文档查找与打开。

---

## 九、AI 推荐的文档打不开

**现象**：`cat <AI 推荐的路径>` 报错"文件不存在"。

**可能原因**

- AI 返回的文档路径是模型推断结果，可能因理解差异与真实路径不一致
- 知识库结构发生变化后，模型训练数据未同步

**验证命令**

```bash
aisearch 关键词    # 用关键词重新搜索
find 关键词        # 传统搜索
ls                 # 查看当前目录
```

**恢复步骤**

1. 用 `aisearch` 查找真实路径
2. 用 `cat <真实路径>` 打开文档

**仍失败时**

如果某主题始终无法找到，欢迎提交 Issue 补充缺失主题。

---

## 十、清除配置并重新设置

当多次配置仍无法正常工作时，建议先清除全部 AI 相关 `localStorage`，再从头设置。

```javascript
localStorage.removeItem('AI_API_KEY');
localStorage.removeItem('AI_API_URL');
localStorage.removeItem('AI_MODEL');
```

刷新页面后，重新按 [使用指南第三节](AI-ASSISTANT-GUIDE.md) 配置。

> ⚠️ 清除操作不可恢复。请确认你已保存原始 API Key 后再执行。

---

## 十一、提交 Issue 前要收集什么

如果以上十节都无法解决问题，可以提交 Issue 让维护者协助排查。提交前请收集：

| 项目 | 说明 |
|---|---|
| 完整错误信息 | 终端输出或控制台红色文字，可截图或复制文本 |
| 浏览器控制台日志 | F12 -> Console 标签的错误堆栈 |
| API 服务商名称 | OpenAI、Azure OpenAI 或其他兼容服务商 |
| 使用的模型名 | `aiconfig` 输出的 Model 行 |
| 已尝试的排查步骤 | 标注已按本手册哪些小节操作过 |

提交地址：https://github.com/wychmod/wychmod.github.io/issues

> ⚠️ 提交 Issue 时请勿附带真实 API Key。维护者不需要你的 Key 也能排查配置问题。

### 临时替代方案

AI 功能暂时无法使用时，可继续使用：

```bash
aisearch 关键词   # 本地文档搜索
find 关键词       # 传统搜索
ls                # 浏览目录
cd 目录名         # 进入子目录
cat 文档路径      # 打开文档
```

---

## 配置检查清单

| 检查项 | 通过条件 |
|---|---|
| `AI_API_KEY` | 已在 `localStorage` 设置且未过期 |
| `AI_API_URL` | 是完整的 API 端点地址，不是网页 |
| `AI_MODEL` | 已设置或使用默认 `gpt-5.2` |
| 网络 | 浏览器能访问该 API 域名 |
| CORS | 服务商允许从网页直接调用 |
| 费用 | 账户有可用额度，以服务商当前定价为准 |
| `aisearch` | 本地搜索正常返回 |
| `ai 测试` | 终端无报错 |

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2025-01-09 | 新增 | v1.0 首次发布故障排查手册 |
| 2026-07-28 | 重构 | 按全站 UI 视觉统一规范重排结构：每个故障块统一为"原因 / 验证 / 恢复 / 替代"四段；移除 Emoji 标题；增加配置检查清单表 |
| 2026-07-28 | 订正 | 删除硬编码 OpenAI 价格；状态色描述改由文本承担，不依赖颜色单独表达 |
