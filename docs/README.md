<div class="home-binding">
  <span class="home-binding-tag">卷一 / VOL.01</span>
  <span class="home-binding-title">FIELD NOTES / 近期写作与研究</span>
  <span class="home-binding-rule" aria-hidden="true"></span>
  <span class="home-binding-chapter">01 CHAPTER</span>
</div>

<section class="home-section" id="recently-updated">
  <div class="home-section-head">
    <span class="home-section-eyebrow">FIELD NOTES · 01</span>
    <h2 class="home-section-title">最近更新</h2>
  </div>
  <div class="home-recent-list">
    <a class="home-recent-row" href="#/md/02-后端开发/00-MySQL数据库">
      <span class="home-recent-num">01</span>
      <div class="home-recent-main">
        <h3 class="home-recent-title">MySQL 数据库</h3>
        <p class="home-recent-excerpt">整合 7 份笔记，覆盖从使用、运行到优化的完整链；含 InnoDB 索引、MVCC、锁与 8.0+ 主从新语法。</p>
      </div>
      <div class="home-recent-meta">
        <span class="home-recent-cat">后端开发</span>
        <span class="home-recent-date">2026-07-22</span>
      </div>
    </a>
    <a class="home-recent-row" href="#/md/03-云原生与运维/10-Kubernetes编排">
      <span class="home-recent-num">02</span>
      <div class="home-recent-main">
        <h3 class="home-recent-title">Kubernetes 编排</h3>
        <p class="home-recent-excerpt">源自 Google Borg 的容器编排系统，覆盖 Pod、控制器、Service、存储与安全全链，版本参考 1.33+。</p>
      </div>
      <div class="home-recent-meta">
        <span class="home-recent-cat">云原生运维</span>
        <span class="home-recent-date">2026-07-22</span>
      </div>
    </a>
    <a class="home-recent-row" href="#/md/01-计算机基础/40-Go语言">
      <span class="home-recent-num">03</span>
      <div class="home-recent-main">
        <h3 class="home-recent-title">Go 语言</h3>
        <p class="home-recent-excerpt">静态类型系统级语言，以 goroutine + channel 的 CSP 并发模型为核心；版本建议 1.23+。</p>
      </div>
      <div class="home-recent-meta">
        <span class="home-recent-cat">计算机基础</span>
        <span class="home-recent-date">2026-07-22</span>
      </div>
    </a>
  </div>
</section>

<section class="home-section" id="desk-side">
  <div class="home-section-head">
    <span class="home-section-eyebrow">MARGINALIA</span>
    <h2 class="home-section-title">书桌边 · 页边批注</h2>
  </div>
  <div class="home-desk">
    <div class="home-marginalia">
      <div class="home-marginalia-list">
        <div class="home-marginalia-item">
          <p class="home-marginalia-quote">客户端与服务端通信默认采用同步长连接，服务端为每个连接创建线程，断开后缓存到线程池供新连接复用。</p>
          <p class="home-marginalia-source">摘自 <a href="#/md/02-后端开发/00-MySQL数据库">MySQL 数据库 · 架构与执行流程</a></p>
        </div>
        <div class="home-marginalia-item">
          <p class="home-marginalia-quote">容器崩溃后约 1 秒内启动新容器；访问量变大时横向扩展，由编排系统自动管理容器化应用。</p>
          <p class="home-marginalia-source">摘自 <a href="#/md/03-云原生与运维/10-Kubernetes编排">Kubernetes 编排 · 核心能力</a></p>
        </div>
        <div class="home-marginalia-item">
          <p class="home-marginalia-quote">通过通信来共享内存——以 goroutine + channel 实现 CSP 并发模型，是 Go 的默认范式。</p>
          <p class="home-marginalia-source">摘自 <a href="#/md/01-计算机基础/40-Go语言">Go 语言 · 核心概述</a></p>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="home-note">
  <div class="home-note-mark" aria-hidden="true">W</div>
  <p class="home-note-text">这里整理技术笔记、代码实验与持续订正记录。<br>内容会随着新的阅读与实践继续修订。</p>
  <p class="home-note-sig">- wychmod</p>
</div>

<section class="home-index" id="knowledge-index">
  <div class="home-index-head">
    <span class="home-section-eyebrow">KNOWLEDGE INDEX</span>
    <h2 class="home-section-title">知识索引</h2>
  </div>

### 💻 计算机基础

<details>
<summary><b>编程语言 + 算法 + 系统</b></summary>

- [Java 与 JVM](/md/01-计算机基础/00-Java与JVM.md) - Java 基础 / Spring 全家桶 / JVM 调优
- [Python 基础与生态](/md/01-计算机基础/10-Python基础与生态.md) - 高级 + 源码 + Django + Flask
- [算法与数据结构](/md/01-计算机基础/20-算法与数据结构.md) - 动态规划 + 排序 + 9章算法 + 左神
- [计算机系统与并发](/md/01-计算机基础/30-计算机系统与并发.md) - OS / 网络 / TCP / HTTP / 多线程
- [Go 语言](/md/01-计算机基础/40-Go语言.md) - 基础 + 工程 + GORM + 高性能

</details>

### 💾 后端开发

<details>
<summary><b>数据库 + 缓存 + MQ + 分布式</b></summary>

- [MySQL 数据库](/md/02-后端开发/00-MySQL数据库.md) - 性能优化 + InnoDB 架构 + 2026 生态
- [Redis 缓存](/md/02-后端开发/10-Redis缓存.md) - 数据结构 / 高级 / 雪崩穿透击穿
- [消息队列](/md/02-后端开发/20-消息队列.md) - RabbitMQ / RocketMQ / Kafka 对比选型
- [分布式协调与搜索](/md/02-后端开发/30-分布式协调与搜索.md) - Zookeeper + Elasticsearch

</details>

### ☁️ 云原生与运维

<details>
<summary><b>容器 + 编排 + CI/CD + Linux</b></summary>

- [Docker 容器化](/md/03-云原生与运维/00-Docker容器化.md) - 镜像/容器/网络/卷 + Compose
- [Kubernetes 编排](/md/03-云原生与运维/10-Kubernetes编排.md) - Pod/Deployment/Service + 实战
- [CI/CD 持续集成](/md/03-云原生与运维/20-CI-CD持续集成.md) - Jenkins + Actions + 灰度发布
- [Linux 运维](/md/03-云原生与运维/30-Linux运维.md) - 命令速查 + Shell 脚本
- [云原生架构](/md/03-云原生与运维/40-云原生架构.md) - 4 大特征 + 12 因素 + 2026 现状

</details>

### ⚛️ 前端开发

<details>
<summary><b>React / Taro / Vue / 小程序</b></summary>

- [React 基础与状态管理](/md/04-前端/00-React基础与状态管理.md) - React16 + Redux + 函数式工具
- [Taro 多端开发](/md/04-前端/10-Taro多端开发.md) - 一套代码编译 6+ 端
- [Vue 与小程序](/md/04-前端/20-Vue与小程序.md) - Vue3 CLI + 微信小程序

</details>

### 🤖 AI 与 Agent

<details>
<summary><b>Agent + LLM + ML/DL</b></summary>

- [AI 编程三件套](/md/05-AI与Agent/00-AI编程三件套方法论.md) - SDD + Harness + Loop
- [Agent 设计模式与多 Agent](/md/05-AI与Agent/10-Agent设计模式与多Agent.md) - 5 种设计 + 多 Agent
- [MCP 协议](/md/05-AI与Agent/20-协议与工程/MCP协议.md)
- [A2A 协议](/md/05-AI与Agent/20-协议与工程/A2A协议.md)
- [DDD 领域驱动](/md/05-AI与Agent/20-协议与工程/DDD领域驱动.md)
- [manus 架构设计](/md/05-AI与Agent/30-参考架构/manus架构设计.md)
- [Alembic 数据库迁移](/md/05-AI与Agent/30-参考架构/Alembic数据库迁移.md)
- [大模型应用](/md/05-AI与Agent/40-大模型应用.md) - GPT 演进 + Embedding + 奈学 NLP
- [ML 与 DL 基础](/md/05-AI与Agent/50-ML与DL基础.md) - 目标检测 + YOLOv5 + 2026 路径

</details>

### 🛠️ 软件工程

<details>
<summary><b>系统设计 + 测试 + 软实力</b></summary>

- [系统设计与设计模式](/md/06-软件工程/00-系统设计与设计模式.md) - 23 种设计模式 + 10 大系统设计
- [软件测试](/md/06-软件工程/10-软件测试.md) - 测试基础 + JaCoCo + Chrome 插件
- [软实力](/md/06-软件工程/20-软实力.md) - 3 大软实力 + 职场进阶

</details>

### 💼 面试求职

<details>
<summary><b>面试准备</b></summary>

- [面试方法论](/md/07-求职/00-面试方法论.md) - 自我介绍 / HR / 谈薪
- [Java 面试核心速查](/md/07-求职/10-Java面试核心速查.md) - 高频 30 题
- [Python 面试核心速查](/md/07-求职/20-Python面试.md) - 基础 / 数据结构 / 设计模式
- [实习与校招](/md/07-求职/30-实习与校招.md) - 实习面试 + 校招投递

</details>

### ⚠️ 过时技术（存档）

<details>
<summary><b>已被新方案替代（仅作存档）</b></summary>

- [爬虫技术](/md/08-过时技术/00-爬虫技术.md) - 通用爬虫已被 API 替代
- [Electron 桌面开发](/md/08-过时技术/10-Electron桌面开发.md) - Tauri 崛起
- [Hadoop / Spark 大数据](/md/08-过时技术/20-Hadoop-Spark大数据.md) - 云数仓替代
- [NLP 与聊天机器人](/md/08-过时技术/30-NLP与聊天机器人.md) - 传统 NLP 被 LLM 替代

</details>

### 🔧 开发工具

<details>
<summary><b>Git + AI 助手 + 工具箱</b></summary>

- [Git 版本控制](/md/09-开发工具/00-Git版本控制.md) - 命令、分支、协作与练习
- [工具箱与资源](/md/09-开发工具/10-工具箱与资源.md) - 站内工具、CSS 片段与资源索引
- [AI 助手使用指南](/AI-ASSISTANT-GUIDE.md) - 终端式技术助手

</details>

</section>

---

## 📋 项目维护

- [首页视觉与实现规范](/_meta/HOMEPAGE_DESIGN_AND_IMPLEMENTATION) - 首页 V2 设计系统、工程边界、验收清单与 AI Harness
- [重构状态总览](/_meta/REFACTOR_STATUS) - 已完成/待完成内容、review 指南
- [重构方案](/_meta/REFACTOR_PLAN) - 目录结构与映射表
- [合并工作规范](/_meta/REFACTOR_GUIDELINES) - 写作与归档规范
- [改正记录台账](/_meta/CORRECTIONS) - 历次改动与待确认事项

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
