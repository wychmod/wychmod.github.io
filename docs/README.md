<div class="home-dashboard">
  <section class="home-band home-band-plain">
    <div class="home-section-head">
      <h1>让学习路线持续推进。</h1>
      <p>把后端、云原生、AI Agent、测试、工具链这些分散知识收敛到一个可检索、可导航、可执行的个人技术工作区。</p>
    </div>
    <div class="home-feature-grid home-feature-grid-3">
      <a class="notion-card sky" href="#/md/java/Java学习路线/Java基本功">
        <span class="card-index">01</span>
        <h3>后端路线</h3>
        <p>Java、Spring、JVM、MySQL、Redis 与分布式系统的主线知识。</p>
      </a>
      <a class="notion-card mint" href="#/md/agent/agent系统知识/agent五种设计模式">
        <span class="card-index">02</span>
        <h3>AI Agent</h3>
        <p>Agent 设计模式、A2A、MCP、领域架构与智能系统实践。</p>
      </a>
      <a class="notion-card lavender" href="/tools/index.html">
        <span class="card-index">03</span>
        <h3>开发工具</h3>
        <p>JSON、Base64、Regex、Markdown、时间戳、项目结构分析等即用工具。</p>
      </a>
    </div>
  </section>

  <section class="assistant-banner">
    <div>
      <h2>随时唤起技术助手。</h2>
      <p>终端式知识导航支持 <code>help</code>、<code>ls</code>、<code>find</code>、<code>cat</code>、<code>ai</code> 等命令。点击右下角 <code>&gt;_</code> 或按 <code>Ctrl + K</code>，在当前文档库里快速定位路径、主题和推荐内容。</p>
    </div>
    <div class="assistant-terminal" aria-hidden="true">
      <div class="assistant-terminal-bar"><span></span><span></span><span></span><b>wychmod@knowledge-base:~</b></div>
      <pre>$ find Spring
Spring 源码解析
SpringBoot 实战和原理
SpringCloud 微服务

$ ai Redis 缓存一致性</pre>
    </div>
  </section>

  <section class="home-band">
    <div class="home-section-head compact">
      <h2>把文档、工具和路线放在一起。</h2>
      <p>文档、工具、路线、代码片段和评论区使用统一的 Notion 风格组件系统。</p>
    </div>
    <div class="home-feature-grid home-feature-grid-4">
      <div class="notion-card peach">
        <h3>源码级笔记</h3>
        <p>围绕 Spring、JVM、CPython、Redis 内核与架构推演组织长文。</p>
      </div>
      <div class="notion-card rose">
        <h3>云原生实践</h3>
        <p>Docker、Kubernetes、CI/CD、服务探针、配置与灰度发布。</p>
      </div>
      <div class="notion-card yellow">
        <h3>测试与质量</h3>
        <p>测试计划、用例设计、自动化、Chrome 插件与质量工程实践。</p>
      </div>
      <div class="notion-card mint">
        <h3>全栈工具箱</h3>
        <p>高频开发转换、格式化、编辑与分析任务集中到独立工具页。</p>
      </div>
    </div>
  </section>
</div>

## 快速导航

### 💻 计算机基础

<details>
<summary><b>编程语言 + 算法 + 系统</b></summary>

- [Java 与 JVM](/md/01-计算机基础/00-Java与JVM.md) — Java 基础 / Spring 全家桶 / JVM 调优
- [Python 基础与生态](/md/01-计算机基础/10-Python基础与生态.md) — 高级 + 源码 + Django + Flask
- [算法与数据结构](/md/01-计算机基础/20-算法与数据结构.md) — 动态规划 + 排序 + 9章算法 + 左神
- [计算机系统与并发](/md/01-计算机基础/30-计算机系统与并发.md) — OS / 网络 / TCP / HTTP / 多线程
- [Go 语言](/md/01-计算机基础/40-Go语言.md) — 基础 + 工程 + GORM + 高性能

</details>

### 💾 后端开发

<details>
<summary><b>数据库 + 缓存 + MQ + 分布式</b></summary>

- [MySQL 数据库](/md/02-后端开发/00-MySQL数据库.md) — 性能优化 + InnoDB 架构 + 2026 生态
- [Redis 缓存](/md/02-后端开发/10-Redis缓存.md) — 数据结构 / 高级 / 雪崩穿透击穿
- [消息队列](/md/02-后端开发/20-消息队列.md) — RabbitMQ / RocketMQ / Kafka 对比选型
- [分布式协调与搜索](/md/02-后端开发/30-分布式协调与搜索.md) — Zookeeper + Elasticsearch

</details>

### ☁️ 云原生与运维

<details>
<summary><b>容器 + 编排 + CI/CD + Linux</b></summary>

- [Docker 容器化](/md/03-云原生与运维/00-Docker容器化.md) — 镜像/容器/网络/卷 + Compose
- [Kubernetes 编排](/md/03-云原生与运维/10-Kubernetes编排.md) — Pod/Deployment/Service + 实战
- [CI/CD 持续集成](/md/03-云原生与运维/20-CI-CD持续集成.md) — Jenkins + Actions + 灰度发布
- [Linux 运维](/md/03-云原生与运维/30-Linux运维.md) — 命令速查 + Shell 脚本
- [云原生架构](/md/03-云原生与运维/40-云原生架构.md) — 4 大特征 + 12 因素 + 2026 现状

</details>

### ⚛️ 前端开发

<details>
<summary><b>React / Taro / Vue / 小程序</b></summary>

- [React 基础与状态管理](/md/04-前端/00-React基础与状态管理.md) — React16 + Redux + 函数式工具
- [Taro 多端开发](/md/04-前端/10-Taro多端开发.md) — 一套代码编译 6+ 端
- [Vue 与小程序](/md/04-前端/20-Vue与小程序.md) — Vue3 CLI + 微信小程序

</details>

### 🤖 AI 与 Agent

<details>
<summary><b>Agent + LLM + ML/DL</b></summary>

- [AI 编程三件套](md/05-AI与Agent/00-AI编程三件套方法论.md) — SDD + Harness + Loop
- [Agent 设计模式与多 Agent](md/05-AI与Agent/10-Agent设计模式与多Agent.md) — 5 种设计 + 多 Agent
- [MCP 协议](md/05-AI与Agent/20-协议与工程/MCP协议.md)
- [A2A 协议](md/05-AI与Agent/20-协议与工程/A2A协议.md)
- [DDD 领域驱动](md/05-AI与Agent/20-协议与工程/DDD领域驱动.md)
- [manus 架构设计](md/05-AI与Agent/30-参考架构/manus架构设计.md)
- [Alembic 数据库迁移](md/05-AI与Agent/30-参考架构/Alembic数据库迁移.md)
- [大模型应用](/md/05-AI与Agent/40-大模型应用.md) — GPT 演进 + Embedding + 奈学 NLP
- [ML 与 DL 基础](/md/05-AI与Agent/50-ML与DL基础.md) — 目标检测 + YOLOv5 + 2026 路径

</details>

### 🛠️ 软件工程

<details>
<summary><b>系统设计 + 测试 + 软实力</b></summary>

- [系统设计与设计模式](/md/06-软件工程/00-系统设计与设计模式.md) — 23 种设计模式 + 10 大系统设计
- [软件测试](/md/06-软件工程/10-软件测试.md) — 测试基础 + JaCoCo + Chrome 插件
- [软实力](/md/06-软件工程/20-软实力.md) — 3 大软实力 + 职场进阶

</details>

### 💼 面试求职

<details>
<summary><b>面试准备</b></summary>

- [面试方法论](/md/07-求职/00-面试方法论.md) — 自我介绍 / HR / 谈薪
- [Java 面试核心速查](/md/07-求职/10-Java面试核心速查.md) — 高频 30 题
- [Python 面试核心速查](/md/07-求职/20-Python面试.md) — 基础 / 数据结构 / 设计模式
- [实习与校招](/md/07-求职/30-实习与校招.md) — 实习面试 + 校招投递

</details>

### ⚠️ 过时技术（存档）

<details>
<summary><b>已被新方案替代（仅作存档）</b></summary>

- [爬虫技术](/md/08-过时技术/00-爬虫技术.md) — 通用爬虫已被 API 替代
- [Electron 桌面开发](/md/08-过时技术/10-Electron桌面开发.md) — Tauri 崛起
- [Hadoop / Spark 大数据](/md/08-过时技术/20-Hadoop-Spark大数据.md) — 云数仓替代
- [NLP 与聊天机器人](/md/08-过时技术/30-NLP与聊天机器人.md) — 传统 NLP 被 LLM 替代

</details>

### 🔧 开发工具

<details>
<summary><b>Git + AI 助手</b></summary>

- [AI 助手使用指南](/AI-ASSISTANT-GUIDE.md) — 终端式技术助手
- [Git 版本控制](/archive/old-git-notes/git命令笔记.md) — 归档笔记
- [Learn Git Branching](/archive/old-git-notes/learn-git-branching.md) — 可视化练习

</details>

---

## 💬 联系方式

- **GitHub**: [https://github.com/wychmod](https://github.com/wychmod)
- **项目仓库**: [https://github.com/wychmod/wychmod.github.io](https://github.com/wychmod/wychmod.github.io)

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，欢迎 Star 支持！</p>
  <p>© 2024 wychmod. All rights reserved.</p>
</div>

---
