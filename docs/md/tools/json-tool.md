# 🛠️ JSON 处理工具

<div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d1f0c 100%); border: 2px solid #d4af37; border-radius: 12px; padding: 30px; margin: 20px 0; box-shadow: 0 0 40px rgba(212, 175, 55, 0.3); text-align: center;">
  <h2 style="color: #f4d03f; margin: 0 0 10px 0;">⚡ 智能 JSON 处理工具</h2>
  <p style="color: #c5c5c5; font-size: 16px; margin: 0 0 20px 0;">高效、专业的JSON数据处理解决方案</p>
  <a href="../../tools/json-tool.html" target="_blank" style="display: inline-block; background: #000000; color: #f4d03f; padding: 20px 50px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 22px; box-shadow: 0 0 0 3px #d4af37, 0 8px 25px rgba(212, 175, 55, 0.6); transition: all 0.3s; border: none; letter-spacing: 2px;">
    🚀 打开工具
  </a>
  <p style="color: #b8b8b8; margin: 15px 0 0 0; font-size: 14px;">💡 点击按钮在新窗口打开工具，已预置丰富的测试示例</p>
</div>

## 🎯 功能特性

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">
  <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px;">
    <h3 style="color: #f4d03f; margin-top: 0;">✨ 格式化美化</h3>
    <p style="color: #c5c5c5; margin-bottom: 0;">智能美化JSON结构，提供清晰的缩进和层次显示</p>
  </div>
  <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px;">
    <h3 style="color: #f4d03f; margin-top: 0;">🗜️ 压缩优化</h3>
    <p style="color: #c5c5c5; margin-bottom: 0;">移除多余空格、换行符，生成紧凑的JSON字符串</p>
  </div>
  <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px;">
    <h3 style="color: #f4d03f; margin-top: 0;">🔐 转义处理</h3>
    <p style="color: #c5c5c5; margin-bottom: 0;">自动处理特殊字符，便于在字符串中安全嵌套</p>
  </div>
  <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px;">
    <h3 style="color: #f4d03f; margin-top: 0;">🔓 去转义</h3>
    <p style="color: #c5c5c5; margin-bottom: 0;">将转义字符还原为原始内容形式</p>
  </div>
  <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px;">
    <h3 style="color: #f4d03f; margin-top: 0;">🀄 Unicode转换</h3>
    <p style="color: #c5c5c5; margin-bottom: 0;">支持中文与Unicode编码互相转换</p>
  </div>
  <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px;">
    <h3 style="color: #f4d03f; margin-top: 0;">🔗 URL参数转换</h3>
    <p style="color: #c5c5c5; margin-bottom: 0;">将JSON对象转换为URL查询参数格式</p>
  </div>
</div>

## 📖 使用说明

### 🎯 测试示例说明

页面默认加载了一个<strong style="color: #f4d03f;">功能完整的JSON测试示例</strong>，包含以下数据类型：

<div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 15px; margin: 15px 0; border-radius: 4px;">

- 📝 **基本字符串** - 平台名称、版本号、描述等
- 📅 **日期时间** - 发布日期字段
- 📦 **嵌套对象** - author、config、modules等多层嵌套结构
- 📊 **数组** - features、tags、tips 等列表数据
- 🔢 **各种数值** - 整数、浮点数、科学计数法、负数
- ✅ **布尔值** - true/false 值
- ⚪ **空值** - null、空数组、空对象
- 🀄 **中文字符** - 测试Unicode转换功能
- 🔐 **特殊字符** - 引号、反斜杠、换行符、制表符
- 🏛️ **深层嵌套** - 4层嵌套结构测试

</div>

<strong style="color: #f4d03f;">👉 推荐操作流程：</strong>

1. 页面加载后，输入框中已有格式化好的JSON数据
2. 点击 **"压缩"** 按钮，查看紧凑格式的JSON
3. 点击 **"转义"** 按钮，看看如何在代码中安全嵌套
4. 点击 **"中文→Unicode"** 按钮，中文将转为\uxxxx编码
5. 点击 **"Unicode→中文"** 按钮，还原为中文字符
6. 点击 **"转GET参数"** 按钮，看看URL参数格式

### 基础功能

1. **格式化** - 将压缩的JSON数据转换为易读的格式，自动添加缩进和换行
2. **压缩** - 移除JSON中的所有空格和换行符，减小数据体积
3. **转义** - 将JSON转换为转义字符串，可以安全地嵌入到其他字符串中
4. **去转义** - 将转义的JSON字符串还原为正常的JSON格式

### 高级功能

5. **Unicode→中文** - 将JSON中的Unicode编码（如`\u4e2d\u6587`）转换为对应的中文字符
6. **中文→Unicode** - 将JSON中的中文字符转换为Unicode编码格式
7. **转GET参数** - 将JSON对象转换为URL查询参数格式（支持嵌套对象和数组）

### 快捷操作

- 工具会实时验证输入的JSON格式是否正确
- 处理完成后会显示统计信息（字符数、行数、处理时间）
- 点击"复制结果"可以快速复制处理后的内容到剪贴板

## 💡 使用技巧

1. **批量处理** - 可以将多个JSON对象放在数组中一起处理
2. **格式转换** - 先压缩再转义，可以得到适合在代码中使用的JSON字符串
3. **调试接口** - 将接口返回的压缩JSON格式化后更容易查看数据结构
4. **国际化处理** - 使用Unicode转换功能处理多语言JSON配置文件

## 🔧 技术特点

- ✅ **纯前端实现** - 所有处理都在浏览器本地完成，数据不会上传到服务器
- ✅ **实时验证** - 输入时自动检测JSON格式，提供即时反馈
- ✅ **性能优化** - 采用高效算法，支持大型JSON数据处理
- ✅ **用户友好** - 简洁直观的界面设计，操作流畅便捷

## 📞 反馈与建议

如果你在使用过程中遇到问题，或有新的功能建议，欢迎通过以下方式联系：

- 📧 提交Issue: [GitHub Issues](https://github.com/wychmod/wychmod.github.io/issues)
- 💬 参与讨论: [GitHub Discussions](https://github.com/wychmod/wychmod.github.io/discussions)

---

<div style="text-align: center; margin: 40px 0; padding: 20px; background: rgba(212, 175, 55, 0.1); border-radius: 8px;">
  <p style="color: #f4d03f; font-size: 18px; font-weight: 600; margin-bottom: 10px;">🚀 更多开发工具即将上线</p>
  <p style="color: #c5c5c5; margin: 0;">我们正在开发更多实用的开发者工具，包括：Base64编解码、时间戳转换、正则表达式测试、Markdown编辑器等</p>
</div>
