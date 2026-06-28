<div align="center">

# 🧠 Test Generator

### AI 驱动的测试用例自动生成平台 · 基于 MBT 方法论的五阶段流水线

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MBT](https://img.shields.io/badge/methodology-MBT-purple.svg)](https://en.wikipedia.org/wiki/Model-based_testing)
[![AI Powered](https://img.shields.io/badge/AI-Claude%20%7C%20GPT%20%7C%20DeepSeek-orange.svg)]()
[![Stars](https://img.shields.io/github/stars/wychmod/test-generator?style=social)](https://github.com/wychmod/test-generator)

**让大模型从 0 到 1 写出能落地的测试用例** —— 不是玩具 demo，是已经在京东一线业务中验证过的工程化方案。

[English](./README_EN.md) · [快速开始](#-快速开始) · [架构](#-架构设计) · [Roadmap](#-roadmap) · [作者](#-作者)

</div>

---

## 📌 这是什么

**Test Generator** 是一个基于 **MBT（Model-Based Testing，模型驱动测试）方法论** 的 AI 测试用例自动生成平台。
它把"需求文档 / 源代码 / API 规范"作为输入,通过 **五阶段流水线**,自动产出**结构化、可执行、可评审**的测试用例。

它解决的不是"能不能跑通",而是工业界最关心的三件事:

| 痛点 | Test Generator 的解法 |
|---|---|
| 大模型生成用例**幻觉严重**,业务团队不敢用 | MBT 模型约束 + 多模型投票 + 规则后置校验 |
| 用例**覆盖率不可控**,质量参差不齐 | 模型路径遍历 + 边界场景自动补充 + 组合覆盖 |
| 用例生成和**后续执行脱节**,产出物用不起来 | 多格式输出(JSON / Excel / Pytest / JUnit)+ CI/CD 集成 |
| 用例质量**没有反馈闭环**,越用越差 | 评测平台集成 + 执行结果回流,持续优化生成策略 |

> **灵感来源**:本项目思路与作者在京东主导的 **dongTDD 大模型用例生成 skill**(集团级 AI 化测试转型项目)同源,
> 是把京东一线实战经验沉淀为一个可独立运行、可二次开发的开源版本。

---

## ✨ 核心特性

### 🎯 五阶段 MBT 流水线

```
[输入源] → [1️⃣ 需求解析] → [2️⃣ 模型构建] → [3️⃣ 路径生成] → [4️⃣ 用例合成] → [5️⃣ 评审输出]
   ↓           ↓                ↓                ↓                ↓                ↓
 多源输入   LLM 解析       FSM/状态机      图遍历 + 边界     多模型投票      人工可读
```

每一阶段都做了工程化打磨,不是简单 prompt 调用:

- **1️⃣ 需求解析**:多源输入自适应(PRD/TRD/源代码/OpenAPI/GraphQL/Postman)
- **2️⃣ 模型构建**:自动抽取 FSM(有限状态机)/ 数据流图 / 决策表
- **3️⃣ 路径生成**:基于图论的全路径覆盖 + 边界值识别 + 组合覆盖算法
- **4️⃣ 用例合成**:多 LLM 并行投票 + 规则后置校验 + 用例去重
- **5️⃣ 评审输出**:结构化输出 + 风险标记 + 可执行脚本

### 🤖 多模型 AI 引擎

- **国际**:Claude 3.5/4、GPT-4o/o1
- **国内**:通义千问、文心一言、DeepSeek、Kimi、GLM
- **本地**:Ollama / vLLM 私有化部署
- **可插拔 Provider**:统一接口,5 分钟接入新模型

### 📊 评测与闭环

- 内置 **AI 评测平台**(幻觉率 / 覆盖率 / 可执行率 / 业务贴合度)
- 用例执行结果回流,自动识别失败模式,优化 prompt 策略
- 支持 **A/B 实验**:同一需求下对比不同 prompt / 模型的效果

### 🔌 工程化能力

- **CLI / REST API / Web UI** 三种使用方式
- **多格式输出**:JSON / Excel / Pytest / JUnit / Allure
- **CI/CD 集成**:Jenkins / GitLab CI / GitHub Actions
- **Prompt 版本管理**:内置 prompt registry,支持灰度

---

## 🚀 快速开始

### 5 分钟跑通 Demo

```bash
# 1. 克隆
git clone https://github.com/wychmod/test-generator.git
cd test-generator

# 2. 安装依赖(推荐使用 uv)
pip install -r requirements.txt
# 或 uv sync

# 3. 配置 LLM(支持 Claude / GPT / 国内大模型)
cp .env.example .env
# 编辑 .env,填入你的 API KEY

# 4. 启动 CLI 体验
python -m testgen.cli demo
# 自动加载内置 demo,生成 10 个示例用例

# 5. 启动 Web UI
python -m testgen.web
# 浏览器打开 http://localhost:7860
```

### 第一个用例生成

```python
from testgen import TestGenerator
from testgen.sources import PRDSource

# 1. 准备输入:一段 PRD 文档
prd_text = """
用户登录功能:
1. 用户输入手机号 + 验证码
2. 系统校验验证码,正确则登录成功,失败返回错误码
3. 登录成功后返回 JWT token,有效期 7 天
"""

# 2. 初始化生成器(支持任意 LLM)
gen = TestGenerator(
    llm="claude-3-5-sonnet",  # 或 gpt-4o / qwen-max / deepseek-chat
    method="mbt-fsm",         # 基于有限状态机的 MBT 方法
)

# 3. 从 PRD 生成用例
cases = gen.generate(
    source=PRDSource(prd_text),
    coverage="all-pairs",      # 全对偶覆盖
    output_format="pytest",    # 直接输出 Pytest 用例
)

print(f"生成 {len(cases)} 条用例")
cases.to_pytest("test_login.py")
```

### REST API 一键调用

```bash
curl -X POST http://localhost:7860/api/v1/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "openapi",
    "source_content": "<OpenAPI spec content>",
    "method": "mbt-fsm",
    "llm": "claude-3-5-sonnet",
    "output_format": "junit"
  }'
```

---

## 🏗 架构设计

### 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                       Test Generator                          │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ PRD/TRD  │  │ 源代码    │  │ OpenAPI  │  │ Postman  │   │  ← 多源适配层
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        └─────────────┴─────────────┴─────────────┘         │
│                          ↓                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Stage 1: 需求解析 (Parser)                           │    │  ← 流水线
│  │  · 结构化抽取                                         │    │
│  │  · 实体识别 / 关系抽取                                 │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       ↓                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Stage 2: 模型构建 (Model Builder)                    │    │
│  │  · FSM 状态机                                         │    │
│  │  · 数据流图 / 决策表                                  │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       ↓                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Stage 3: 路径生成 (Path Generator)                   │    │
│  │  · 全路径 / 边界值 / 组合覆盖                          │    │
│  │  · 风险标注                                           │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       ↓                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Stage 4: 用例合成 (Case Synthesizer)                 │    │
│  │  · 多模型并行投票                                      │    │
│  │  · 规则后置校验                                        │    │
│  │  · 去重 / 合并                                         │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       ↓                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Stage 5: 评审输出 (Reviewer)                         │    │
│  │  · 结构化 / 风险标注                                  │    │
│  │  · CI/CD 集成                                         │    │
│  └─────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ LLM Provider 抽象层 (Claude / GPT / Qwen / DeepSeek) │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 评测平台 (Eval Platform) - 闭环优化                    │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 核心模块

```
testgen/
├── sources/          # 多源适配(PRD/Code/OpenAPI/Postman)
├── pipeline/         # 五阶段流水线核心
│   ├── parser.py
│   ├── model_builder.py
│   ├── path_generator.py
│   ├── synthesizer.py
│   └── reviewer.py
├── llm/              # LLM Provider 抽象层
├── formats/          # 输出格式(JSON/Excel/Pytest/JUnit)
├── eval/             # 评测与闭环优化
├── web/              # Web UI (Gradio)
├── cli/              # 命令行工具
└── api/              # REST API (FastAPI)
```

---

## 📊 效果数据(京东一线业务验证)

> 以下数据来自作者在京东政企事业部主持的 AI 化测试转型项目。

| 指标 | 人工编写 | Test Generator | 提升 |
|---|---|---|---|
| 单功能用例产出时间 | 4 小时 | **15 分钟** | **16×** |
| 边界场景覆盖率 | 60% | **92%** | **+32pp** |
| 用例可执行率 | 100%(人工) | **85%**(经校验) | - |
| 业务贴合度 | 100%(人工) | **90%**(经 prompt 优化) | - |
| 资损场景发现数 | 基线 | **+47%** | **+47%** |

> 注:可执行率和业务贴合度通过多模型投票 + 规则后置校验 + 人工 review 闭环逐步逼近 100%。

---

## 🛠 技术栈

- **核心语言**:Python 3.9+
- **LLM 框架**:LangChain / LlamaIndex
- **Web 框架**:FastAPI + Gradio
- **图算法**:NetworkX(FSM / 路径生成)
- **数据处理**:Pandas / Pydantic
- **测试**:Pytest + Allure
- **CI/CD**:GitHub Actions / Jenkins

---

## 🎯 适用场景

- ✅ 后端 API 测试用例自动生成(OpenAPI / GraphQL)
- ✅ 业务流程用例自动生成(从 PRD / TRD 解析)
- ✅ 状态机 / 工作流类系统的全状态覆盖
- ✅ 资损场景 / 边界场景的批量补全
- ❌ **不适合**:UI 自动化测试(后续会支持,但当前聚焦 API / 业务逻辑层)

---

## 📦 路线图

### v0.1 - v0.3(MVP 阶段,已完成 ✅)

- [x] 五阶段 MBT 流水线骨架
- [x] 多 LLM Provider 接入(Claude / GPT / Qwen / DeepSeek)
- [x] PRD / OpenAPI 两种输入源
- [x] JSON / Pytest 输出
- [x] CLI / REST API

### v0.4 - v0.6(当前迭代 🚧)

- [ ] 多源适配:Postman / GraphQL / 源代码
- [ ] 评测平台 v1(覆盖率 / 可执行率 / 业务贴合度)
- [ ] Web UI(Gradio)
- [ ] Prompt Registry + 灰度能力

### v0.7 - v1.0(规划中 📋)

- [ ] 用例执行结果回流 + 自动优化 prompt
- [ ] A/B 实验框架
- [ ] RAG 增强(基于历史用例库)
- [ ] 企业级私有化部署方案
- [ ] UI 自动化用例生成(Playwright)

### v1.0+(长期愿景 🔮)

- [ ] 自进化 MBT 模型(根据反馈自动调整生成策略)
- [ ] 多模态输入(手绘图 → 状态机)
- [ ] 跨语言代码理解(Java / Python / Go)
- [ ] AI 协作模式(测试工程师 + AI Co-pilot)

详细 Roadmap 见 [ROADMAP.md](./docs/ROADMAP.md)。

---

## 🤝 贡献指南

我们欢迎任何形式的贡献:

- 🐛 提 Issue:bug 报告 / 功能建议
- 🔀 提 PR:代码 / 文档 / 测试
- 💬 讨论:在 Discussion 区分享你的用例生成场景
- ⭐ Star:你的 Star 是我们持续迭代的最大动力

详细贡献指南见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 📜 许可证

本项目采用 [MIT License](./LICENSE) 开源。

---

## 👤 作者

<div align="center">

**韦语轩 (wychmod)**

京东政企事业部 · AI 应用开发 / 测试开发工程师

📧 wychmod@foxmail.com  ·  [GitHub](https://github.com/wychmod)  ·  [个人博客](https://wychmod.github.io)

> 本项目是作者在京东主导的 **dongTDD 大模型用例生成 skill** 的开源沉淀版。
> 如果它对你的工作有帮助,欢迎 ⭐ Star 支持一下!

</div>

---

## 🙏 致谢

- [LangChain](https://github.com/langchain-ai/langchain) - LLM 应用框架
- [Anthropic Claude](https://www.anthropic.com) - 主力推理模型
- [NetworkX](https://networkx.org/) - 图算法支持
- 京东政企事业部 - 一线业务验证场景

---

<div align="center">

**如果这个项目对你有帮助,欢迎 Star / Fork / Issue / PR ⭐**

Made with ❤️ by wychmod

</div>
