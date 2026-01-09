# 🤖 AI智能助手使用指南

## 📝 功能介绍

wychmod技术知识库现已集成AI智能助手，为您提供：

- **💬 智能问答**：回答各类技术问题，提供专业的技术指导
- **📚 文档推荐**：根据您的问题智能推荐相关文档
- **🎯 精准定位**：快速找到您需要的技术资料
- **🔍 智能搜索**：本地文档智能检索功能

## 🚀 快速开始

### 1. 打开命令行终端

三种方式任选其一：
- 点击页面右下角的 `►_` 按钮
- 按下快捷键 `Ctrl+K`（Mac: `Cmd+K`）
- 按下快捷键 `Esc`（关闭终端）

### 2. 配置AI功能

首次使用需要配置API密钥和URL：

#### 方法一：在终端中配置

```bash
# 设置API Key
aiconfig apikey YOUR_API_KEY

# 设置API URL（例如OpenAI的API）
aiconfig apiurl https://api.openai.com/v1/chat/completions

# 查看配置状态
aiconfig
```

#### 方法二：在浏览器控制台配置

按 `F12` 打开浏览器控制台，执行：

```javascript
localStorage.setItem('AI_API_KEY', 'your-api-key');
localStorage.setItem('AI_API_URL', 'your-api-url');
localStorage.setItem('AI_MODEL', 'gpt-5.2'); // 可选，默认gpt-4
```

### 3. 开始使用

配置完成后，刷新页面即可使用AI问答功能！

## 💡 使用示例

### AI技术问答

```bash
# 询问技术问题
ai Spring Bean的生命周期是什么？

# 多个问题
ai 如何优化MySQL查询性能？

# Python相关
ai Python协程和线程有什么区别？

# 架构设计
ai 微服务架构的优缺点是什么？

# JVM调优
ai JVM垃圾回收器如何选择？
```

### 智能文档搜索

```bash
# 搜索Spring相关文档
aisearch Spring

# 搜索Redis文档
aisearch Redis

# 搜索Python源码
aisearch Python源码
```

### 查看配置状态

```bash
# 查看AI配置
aiconfig

# 查看是否配置API Key和URL
```

## 🎯 AI功能特点

### 1. 智能理解

AI助手能够理解您的技术问题，并提供：
- 简洁专业的技术解答（200字以内）
- 最相关的文档推荐（最多3个）
- 推荐理由说明

### 2. 知识覆盖

AI助手熟悉知识库中的所有技术领域：

- **Java技术栈**：Spring、SpringBoot、SpringCloud、JVM调优、手写RPC
- **Python技术栈**：Django、Flask、Python源码剖析、异步编程、协程
- **前端开发**：React、Vue、Taro小程序
- **数据存储**：MySQL、Redis、消息队列、Elasticsearch、Zookeeper
- **云原生**：Docker、Kubernetes、CI/CD
- **人工智能**：机器学习、深度学习、AI Agent
- **计算机基础**：算法、操作系统、计算机网络、多线程并发

### 3. 响应示例

当您提问后，AI会返回类似如下格式的回答：

```
🤖 AI助手回答：

Spring Bean的生命周期包括以下阶段：
1. 实例化（Instantiation）
2. 属性赋值（Populate Properties）
3. 初始化（Initialization）
4. 使用（In Use）
5. 销毁（Destruction）

📚 推荐文档：

1. 3-Spring源码解析
   深入分析Spring Bean的创建和生命周期管理
   使用命令打开: cat /md/spring源码/3-Spring源码解析.md

2. IOC和AOP
   理解Spring的核心概念和Bean管理
   使用命令打开: cat /md/java/spring系列学习/IOC和AOP.md
```

### 4. 文档打开

AI推荐文档后，您可以直接使用 `cat` 命令打开：

```bash
# 打开推荐的文档
cat /md/spring源码/3-Spring源码解析.md
```

## 🔧 高级功能

### 命令别名

```bash
# ai命令的别名
ask 你的问题

# 等同于
ai 你的问题
```

### Tab自动补全

在终端中输入命令时，按 `Tab` 键可以自动补全命令名称。

### 历史命令

- 按 `↑` 键：查看上一条命令
- 按 `↓` 键：查看下一条命令
- 输入 `history`：查看所有历史命令

### 清屏操作

```bash
# 清空终端屏幕
clear

# 或使用快捷键
Ctrl+L
```

## ❓ 常见问题

> 🔧 **遇到问题？** 请查看 [AI功能故障排查指南](AI-TROUBLESHOOTING.md) 获取详细的解决方案。

### Q: 提示“AI功能未配置”怎么办？

**A:** 需要先配置API Key和API URL，参考上面的"配置AI功能"章节。

### Q: 支持哪些AI模型？

**A:** 默认使用OpenAI的GPT-4模型，您也可以配置其他兼容OpenAI API的模型：

```bash
aiconfig model gpt-3.5-turbo
```

### Q: API调用失败怎么办？

**A:** 请检查：
1. API Key是否正确
2. API URL是否可访问
3. 网络连接是否正常
4. API额度是否充足

### Q: 提示"API返回的不是JSON格式"怎么办？

**A:** 这通常表明API URL配置错误：

1. **检查URL格式**：
   - ✅ 正确：`https://api.openai.com/v1/chat/completions`
   - ❌ 错误：`https://openai.com` （这是网页地址）
   - ❌ 错误：`https://api.openai.com` （缺少端点路径）

2. **常见API端点**：
   - OpenAI：`https://api.openai.com/v1/chat/completions`
   - Azure OpenAI：`https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2023-05-15`
   - 其他服务商：请参考其API文档

3. **重新配置**：
   ```bash
   aiconfig apiurl https://api.openai.com/v1/chat/completions
   ```

### Q: AI推荐的文档不存在怎么办？

**A:** 可以使用本地搜索功能：

```bash
# 本地文档搜索
aisearch 关键词

# 传统搜索
find 关键词
```

### Q: 如何获取API Key？

**A:** 
1. OpenAI：访问 https://platform.openai.com/api-keys
2. 其他提供商：访问对应的API平台申请

### Q: API调用会产生费用吗？

**A:** 是的，调用OpenAI等服务商的API会产生费用，具体费用请参考服务商的定价页面。

## 🌟 使用技巧

### 1. 提问技巧

- ✅ **具体明确**："Spring Bean的生命周期是什么？"
- ❌ **过于宽泛**："告诉我所有关于Spring的知识"

### 2. 关键词使用

在问题中包含关键技术词汇，有助于AI更准确地理解和推荐：
- "Spring AOP原理"
- "Redis持久化机制"
- "Python GIL锁"

### 3. 结合其他命令

AI问答可以与其他终端命令配合使用：

```bash
# 先用AI获取建议
ai 如何学习JVM调优？

# 然后查看相关目录
cd JVM

# 列出所有文档
ls

# 打开具体文档
cat JVM实战-4-调优
```

### 4. 保存配置

API配置保存在浏览器的localStorage中，只需配置一次即可长期使用。

## 📞 反馈与建议

如果您在使用过程中遇到问题或有改进建议，欢迎：
- 提交Issue到GitHub仓库
- 或在评论区留言

## 🔄 更新日志

### v1.0 (2025-01-09)
- ✨ 首次发布AI智能助手功能
- 🎯 支持技术问答和文档推荐
- 🔍 本地智能搜索功能
- ⚙️ 灵活的配置管理

---

**享受AI驱动的学习体验！** 🚀
