/**
 * AI智能助手模块
 * 提供基于LLM的文档问答和推荐功能
 */
(function() {
  'use strict';
  
  // AI助手配置
  const AIConfig = {
    apiKey: '',
    apiUrl: '',
    model: 'gpt-5.2',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `你是wychmod技术知识库的AI助手。你的任务是帮助用户查找和理解技术文档。

知识库涵盖以下技术领域：
- Java技术栈：Spring、SpringBoot、SpringCloud、JVM调优、手写RPC等
- Python技术栈：Django、Flask、Python源码剖析、异步编程、协程等
- 前端开发：React、Vue、Taro小程序等
- 数据存储：MySQL、Redis、消息队列（RabbitMQ、RocketMQ）、Elasticsearch、Zookeeper
- 云原生：Docker、Kubernetes、CI/CD
- 人工智能：机器学习、深度学习、AI Agent
- 计算机基础：算法、操作系统、计算机网络、多线程并发等

当用户提问时，你需要：
1. 理解用户的技术问题
2. 推荐最相关的文档（最多3个）
3. 给出简洁的技术指导
4. 使用JSON格式返回结果

返回格式示例：
{
  "answer": "简短的技术解答",
  "recommendations": [
    {
      "title": "文档标题",
      "path": "/md/分类/文档.md",
      "reason": "推荐理由"
    }
  ]
}

注意：
- 答案要简洁专业，控制在200字以内
- 推荐的文档必须真实存在于知识库中
- 如果不确定文档是否存在，可以只提供通用建议而不推荐具体文档
- 保持友好和专业的语气`
  };
  
  // 文档索引（从侧边栏解析）
  let documentIndex = [];
  
  /**
   * 初始化AI助手
   */
  function initAIAssistant() {
    // 从环境变量或localStorage读取配置
    loadConfig();
    
    // 构建文档索引
    buildDocumentIndex();
  }
  
  /**
   * 加载配置
   */
  function loadConfig() {
    // 优先从localStorage读取
    const storedApiKey = localStorage.getItem('AI_API_KEY');
    const storedApiUrl = localStorage.getItem('AI_API_URL');
    const storedModel = localStorage.getItem('AI_MODEL');
    
    if (storedApiKey) AIConfig.apiKey = storedApiKey;
    if (storedApiUrl) AIConfig.apiUrl = storedApiUrl;
    if (storedModel) AIConfig.model = storedModel;
    
    // 如果没有配置，尝试从全局变量读取（可在HTML中通过window对象设置）
    if (!AIConfig.apiKey && window.AI_API_KEY) {
      AIConfig.apiKey = window.AI_API_KEY;
    }
    if (!AIConfig.apiUrl && window.AI_API_URL) {
      AIConfig.apiUrl = window.AI_API_URL;
    }
  }
  
  /**
   * 构建文档索引
   */
  function buildDocumentIndex() {
    const sidebar = document.querySelector('.sidebar-nav');
    if (!sidebar) {
      setTimeout(buildDocumentIndex, 1000);
      return;
    }
    
    documentIndex = [];
    
    function parseList(ul, category = '') {
      if (!ul) return;
      
      const items = ul.children;
      for (let i = 0; i < items.length; i++) {
        const li = items[i];
        const link = li.querySelector('a');
        const subList = li.querySelector('ul');
        const paragraph = li.querySelector('p');
        
        if (link && !subList) {
          // 文档节点
          let title = link.textContent.trim();
          title = title.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u27FF]|[\u{1F300}-\u{1F9FF}]/gu, '').trim();
          
          const href = link.getAttribute('href');
          if (title && href) {
            documentIndex.push({
              title: title,
              path: href.replace(/^#/, ''),
              category: category,
              keywords: extractKeywords(title)
            });
          }
        } else if (paragraph || (link && subList)) {
          // 分类节点
          let categoryName = (paragraph || link).textContent.trim();
          categoryName = categoryName.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u27FF]|[\u{1F300}-\u{1F9FF}]/gu, '').trim();
          
          if (subList) {
            parseList(subList, categoryName);
          }
        }
      }
    }
    
    const uls = Array.from(sidebar.children).filter(el => 
      el.tagName && el.tagName.toLowerCase() === 'ul'
    );
    
    if (uls.length > 0) {
      uls.forEach(ul => parseList(ul));
    } else {
      const ul = sidebar.querySelector('ul');
      if (ul) parseList(ul);
    }
  }
  
  /**
   * 提取关键词
   */
  function extractKeywords(text) {
    const keywords = [];
    const patterns = [
      /Spring|Java|Python|Django|Flask|Redis|MySQL|Docker|Kubernetes|React|Vue/gi,
      /JVM|GC|多线程|并发|异步|协程|源码/gi,
      /性能|优化|架构|设计模式|微服务/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        keywords.push(...matches.map(m => m.toLowerCase()));
      }
    });
    
    return [...new Set(keywords)];
  }
  
  /**
   * 检查配置是否完整
   */
  function checkConfig() {
    if (!AIConfig.apiKey || !AIConfig.apiUrl) {
      return {
        success: false,
        message: '❌ AI功能未配置。请设置API Key和API URL。\n\n配置方法：\n1. 在浏览器控制台执行：\n   localStorage.setItem("AI_API_KEY", "your-api-key")\n   localStorage.setItem("AI_API_URL", "your-api-url")\n\n2. 刷新页面后即可使用AI问答功能'
      };
    }
    return { success: true };
  }
  
  /**
   * 调用AI API
   */
  async function callAI(userQuestion) {
    const configCheck = checkConfig();
    if (!configCheck.success) {
      return {
        success: false,
        error: configCheck.message
      };
    }
    
    // 构建文档列表上下文
    const docContext = documentIndex.slice(0, 50).map(doc => 
      `- ${doc.title} (${doc.category}): ${doc.path}`
    ).join('\n');
    
    const enhancedPrompt = AIConfig.systemPrompt + '\n\n可用文档列表（部分）：\n' + docContext;
    
    try {
      const response = await fetch(AIConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIConfig.apiKey}`
        },
        body: JSON.stringify({
          model: AIConfig.model,
          messages: [
            {
              role: 'system',
              content: enhancedPrompt
            },
            {
              role: 'user',
              content: userQuestion
            }
          ],
          max_tokens: AIConfig.maxTokens,
          temperature: AIConfig.temperature
        })
      });
      
      // 检查响应状态
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage += `: ${errorData.error?.message || JSON.stringify(errorData)}`;
          } else {
            const errorText = await response.text();
            // 截取前200个字符避免过长
            errorMessage += `: ${errorText.substring(0, 200)}`;
          }
        } catch (e) {
          errorMessage += ': 无法解析错误响应';
        }
        throw new Error(`API请求失败: ${errorMessage}`);
      }
      
      // 解析响应
      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          throw new Error(`API返回的不是JSON格式，可能是HTML页面。请检查API URL是否正确。\n\n返回内容预览: ${responseText.substring(0, 100)}...`);
        }
        data = await response.json();
      } catch (e) {
        if (e.message.includes('API返回的不是JSON')) {
          throw e;
        }
        throw new Error(`解析API响应失败: ${e.message}`);
      }
      
      // 验证响应结构
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error(`API响应格式错误，缺少必要字段。响应内容: ${JSON.stringify(data).substring(0, 200)}`);
      }
      
      const aiResponse = data.choices[0].message.content;
      
      // 尝试解析JSON响应
      let parsedResponse;
      try {
        // 提取JSON部分（可能包含在```json```代码块中）
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = {
            answer: aiResponse,
            recommendations: []
          };
        }
      } catch (e) {
        parsedResponse = {
          answer: aiResponse,
          recommendations: []
        };
      }
      
      return {
        success: true,
        data: parsedResponse
      };
    } catch (error) {
      console.error('AI API调用失败:', error);
      
      // 生成详细的错误信息
      let errorMessage = `❌ AI调用失败: ${error.message}\n\n`;
      
      // 根据错误类型提供具体建议
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage += '🔴 网络连接失败，请检查：\n';
        errorMessage += '1. 网络连接是否正常\n';
        errorMessage += '2. API URL是否可访问\n';
        errorMessage += '3. 是否被防火墙或代理阻止\n';
        errorMessage += '4. 跨域CORS设置是否正确';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage += '🔑 认证失败，请检查：\n';
        errorMessage += '1. API Key是否正确\n';
        errorMessage += '2. API Key是否已过期\n';
        errorMessage += '3. 账户是否有足够额度';
      } else if (error.message.includes('429')) {
        errorMessage += '⚠️ 请求频率过高，请：\n';
        errorMessage += '1. 稍后再试\n';
        errorMessage += '2. 检查API调用额度';
      } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        errorMessage += '🔧 服务器错误，请：\n';
        errorMessage += '1. 稍后再试\n';
        errorMessage += '2. 检查API服务商状态';
      } else if (error.message.includes('HTML') || error.message.includes('不是JSON')) {
        errorMessage += '📝 API URL配置错误，请检查：\n';
        errorMessage += '1. URL是否指向API端点而不是网页\n';
        errorMessage += '2. 应该是类似 https://api.openai.com/v1/chat/completions 的格式\n';
        errorMessage += '\n当前API URL: ' + AIConfig.apiUrl;
      } else {
        errorMessage += '🔍 请检查：\n';
        errorMessage += '1. API Key: ' + (AIConfig.apiKey ? '✅ 已配置' : '❌ 未配置') + '\n';
        errorMessage += '2. API URL: ' + AIConfig.apiUrl + '\n';
        errorMessage += '3. 网络连接状态';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * 本地文档搜索（作为AI的补充）
   */
  function searchDocuments(query) {
    const queryLower = query.toLowerCase();
    const results = documentIndex.filter(doc => {
      const titleMatch = doc.title.toLowerCase().includes(queryLower);
      const categoryMatch = doc.category.toLowerCase().includes(queryLower);
      const keywordMatch = doc.keywords.some(k => queryLower.includes(k));
      return titleMatch || categoryMatch || keywordMatch;
    });
    
    return results.slice(0, 5);
  }
  
  /**
   * 格式化AI响应为HTML
   */
  function formatAIResponse(response) {
    const lines = [];
    
    if (response.answer) {
      lines.push('<span class="terminal-success">🤖 AI助手回答：</span>');
      lines.push('');
      
      // 分段显示答案
      const paragraphs = response.answer.split('\n').filter(p => p.trim());
      paragraphs.forEach(p => {
        lines.push(`<span class="terminal-info">${escapeHtml(p)}</span>`);
      });
      lines.push('');
    }
    
    if (response.recommendations && response.recommendations.length > 0) {
      lines.push('<span class="terminal-success">📚 推荐文档：</span>');
      lines.push('');
      
      response.recommendations.forEach((rec, index) => {
        lines.push(`<span class="terminal-warning">${index + 1}. ${escapeHtml(rec.title)}</span>`);
        if (rec.reason) {
          lines.push(`   <span class="terminal-info">${escapeHtml(rec.reason)}</span>`);
        }
        lines.push(`   <span class="terminal-command">使用命令打开: cat ${escapeHtml(rec.path)}</span>`);
        lines.push('');
      });
    }
    
    return lines;
  }
  
  /**
   * HTML转义
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * 设置API配置
   */
  function setConfig(key, value) {
    switch(key.toLowerCase()) {
      case 'apikey':
      case 'api_key':
        AIConfig.apiKey = value;
        localStorage.setItem('AI_API_KEY', value);
        return '✅ API Key 已设置';
      case 'apiurl':
      case 'api_url':
        AIConfig.apiUrl = value;
        localStorage.setItem('AI_API_URL', value);
        return '✅ API URL 已设置';
      case 'model':
        AIConfig.model = value;
        localStorage.setItem('AI_MODEL', value);
        return '✅ Model 已设置';
      default:
        return '❌ 未知配置项。可用配置: apikey, apiurl, model';
    }
  }
  
  /**
   * 获取配置状态
   */
  function getConfigStatus() {
    const status = [];
    status.push('<span class="terminal-success">🔧 AI配置状态：</span>');
    status.push('');
    status.push(`<span class="terminal-info">API Key:</span> ${AIConfig.apiKey ? '✅ 已配置' : '❌ 未配置'}`);
    status.push(`<span class="terminal-info">API URL:</span> ${AIConfig.apiUrl ? '✅ 已配置 (' + AIConfig.apiUrl + ')' : '❌ 未配置'}`);
    status.push(`<span class="terminal-info">Model:</span> ${AIConfig.model}`);
    status.push('');
    
    if (!AIConfig.apiKey || !AIConfig.apiUrl) {
      status.push('<span class="terminal-warning">💡 配置方法：</span>');
      status.push('');
      status.push('<span class="terminal-command">aiconfig apikey YOUR_API_KEY</span>');
      status.push('<span class="terminal-command">aiconfig apiurl YOUR_API_URL</span>');
      status.push('');
      status.push('<span class="terminal-info">或在浏览器控制台执行：</span>');
      status.push('<span class="terminal-command">localStorage.setItem("AI_API_KEY", "your-key")</span>');
      status.push('<span class="terminal-command">localStorage.setItem("AI_API_URL", "your-url")</span>');
    }
    
    return status;
  }
  
  // 导出到全局
  window.AIAssistant = {
    init: initAIAssistant,
    ask: callAI,
    search: searchDocuments,
    format: formatAIResponse,
    setConfig: setConfig,
    getConfigStatus: getConfigStatus,
    getDocumentIndex: () => documentIndex
  };
  
  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIAssistant);
  } else {
    initAIAssistant();
  }
})();
