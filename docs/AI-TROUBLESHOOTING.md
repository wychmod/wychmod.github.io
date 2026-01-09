# 🔧 AI功能故障排查指南

## 常见错误及解决方案

### 1. ❌ "API返回的不是JSON格式，可能是HTML页面"

**原因**：API URL配置错误，指向了网页而不是API端点

**解决方案**：

#### 检查URL格式
```bash
# 查看当前配置
aiconfig

# 正确的URL格式示例：
# OpenAI官方API
aiconfig apiurl https://api.openai.com/v1/chat/completions

# Azure OpenAI
aiconfig apiurl https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT/chat/completions?api-version=2023-05-15

# 其他兼容OpenAI的API服务商
aiconfig apiurl https://your-api-provider.com/v1/chat/completions
```

#### 常见错误URL
❌ `https://openai.com` - 这是网站地址，不是API  
❌ `https://api.openai.com` - 缺少具体端点路径  
❌ `https://chatgpt.com` - ChatGPT网页版地址  

#### 验证方法
1. 在浏览器中打开你的API URL
2. 如果看到网页内容（HTML），说明URL错误
3. 正确的API URL会返回认证错误（需要API Key）

---

### 2. 🔑 "401 Unauthorized" 或 "403 Forbidden"

**原因**：API Key无效或没有权限

**解决方案**：

```bash
# 检查API Key配置
aiconfig

# 重新设置API Key
aiconfig apikey YOUR_NEW_API_KEY
```

**检查事项**：
- ✅ API Key是否完整复制（注意空格）
- ✅ API Key是否已激活
- ✅ API Key是否已过期
- ✅ 账户是否有可用额度
- ✅ API Key是否有调用权限

**获取API Key**：
- OpenAI: https://platform.openai.com/api-keys
- 其他服务商：查看对应平台文档

---

### 3. 🌐 "Failed to fetch" 或网络错误

**原因**：网络连接问题或CORS限制

**解决方案**：

#### A. 检查网络连接
```bash
# 在浏览器控制台（F12）测试
fetch('https://api.openai.com/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
```

#### B. 检查防火墙/代理
- 确认是否被公司防火墙阻止
- 检查浏览器是否使用了代理
- 尝试关闭VPN后重试

#### C. CORS问题
由于浏览器安全限制，某些API可能无法直接从网页调用。解决方案：
1. 使用支持CORS的API服务商
2. 使用代理服务转发请求
3. 部署后端服务处理API调用

---

### 4. ⚠️ "429 Too Many Requests"

**原因**：API调用频率超限

**解决方案**：
- 稍等几分钟后重试
- 检查API服务商的速率限制
- 升级API套餐以获得更高配额

---

### 5. 🔧 "500/502/503 Server Error"

**原因**：API服务商服务器错误

**解决方案**：
- 稍后重试（通常是临时问题）
- 检查服务商状态页面
- 尝试切换到备用API端点

---

### 6. 📝 "AI功能未配置"

**原因**：没有设置API Key或API URL

**解决方案**：

#### 方法1：命令行配置
```bash
aiconfig apikey YOUR_API_KEY
aiconfig apiurl https://api.openai.com/v1/chat/completions
```

#### 方法2：浏览器控制台配置
按F12打开控制台，执行：
```javascript
localStorage.setItem('AI_API_KEY', 'your-api-key');
localStorage.setItem('AI_API_URL', 'https://api.openai.com/v1/chat/completions');
```

刷新页面后生效。

---

### 7. 💰 费用相关问题

**Q: API调用会产生费用吗？**  
A: 是的，大多数AI API服务都会按使用量收费。

**Q: 如何控制费用？**  
A: 
- 设置API服务商账户的使用限额
- 监控API调用次数
- 选择性价比高的模型（如gpt-3.5-turbo）

**Q: 费用大概是多少？**  
A: 以OpenAI为例（2025年参考价格）：
- GPT-4: $0.03/1K tokens (输入) + $0.06/1K tokens (输出)
- GPT-3.5-turbo: $0.0005/1K tokens (输入) + $0.0015/1K tokens (输出)
- 每次问答约消耗500-2000 tokens

---

## 🔍 诊断步骤

### 步骤1：检查配置
```bash
# 在终端执行
aiconfig
```

应该看到：
- ✅ API Key: 已配置
- ✅ API URL: 已配置且格式正确
- ✅ Model: 显示模型名称

### 步骤2：测试本地搜索
```bash
# 测试不需要API的功能
aisearch Spring
```

如果本地搜索正常，说明基础功能OK。

### 步骤3：测试AI问答
```bash
# 尝试简单问题
ai 测试
```

观察错误信息，根据上述方案解决。

### 步骤4：查看浏览器控制台
按F12打开开发者工具，查看Console标签：
- 红色错误信息会显示详细的技术错误
- Network标签可以看到API请求详情

---

## 🛠️ 高级故障排查

### 使用curl测试API
在命令行中测试API是否可用：

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

如果curl能正常返回，说明API本身没问题，可能是浏览器相关配置问题。

### 检查localStorage
在浏览器控制台查看存储的配置：

```javascript
console.log('API Key:', localStorage.getItem('AI_API_KEY'));
console.log('API URL:', localStorage.getItem('AI_API_URL'));
console.log('Model:', localStorage.getItem('AI_MODEL'));
```

### 清除配置重新设置
```javascript
localStorage.removeItem('AI_API_KEY');
localStorage.removeItem('AI_API_URL');
localStorage.removeItem('AI_MODEL');
```

然后刷新页面，重新配置。

---

## 📞 仍然无法解决？

### 收集以下信息：
1. 完整的错误信息（截图或复制文本）
2. 浏览器控制台的错误日志
3. API服务商名称
4. 使用的模型名称
5. 已尝试的解决方案

### 提交Issue：
访问：https://github.com/wychmod/wychmod.github.io/issues

### 临时替代方案：
如果AI功能暂时无法使用，可以使用：
```bash
# 本地文档搜索
aisearch 关键词

# 传统搜索
find 关键词

# 浏览目录
ls
cd 目录名
```

---

## ✅ 成功配置检查清单

- [ ] API Key已设置且格式正确
- [ ] API URL是完整的API端点地址
- [ ] 网络连接正常
- [ ] 浏览器控制台无错误
- [ ] 能成功执行`aiconfig`查看配置
- [ ] 本地搜索`aisearch`功能正常
- [ ] AI问答`ai`功能返回正确结果

---

**更新时间**: 2025-01-09  
**版本**: v1.0
