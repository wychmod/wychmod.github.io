<div class="home-dashboard">
  <section class="home-band home-band-plain">
    <div class="home-section-head">
      <h1>让学习路线持续推进。</h1>
      <p>把后端、云原生、AI Agent、测试、工具链这些分散知识收敛到一个可检索、可导航、可执行的个人技术工作区。</p>
    </div>
    <div class="home-feature-grid home-feature-grid-3">
      <a class="notion-card sky" href="/md/java/Java学习路线/Java基本功.md">
        <span class="card-index">01</span>
        <h3>后端路线</h3>
        <p>Java、Spring、JVM、MySQL、Redis 与分布式系统的主线知识。</p>
      </a>
      <a class="notion-card mint" href="/md/agent/agent五种设计模式.md">
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

### 📚 后端开发

<details>
<summary><b>🔥 Java 技术栈</b></summary>

- **基础与框架**
  - [Java基本功](/md/java/Java学习路线/Java基本功.md) | [Java集合框架](/md/java/Java学习路线/Java集合框架.md)
  - [IOC和AOP](/md/java/spring系列学习/IOC和AOP.md) | [MVC模式](/md/java/Java学习路线/MVC模式.md) | [Servlet](/md/java/Java学习路线/Servlet.md)

- **Spring 源码解析**
  - [300行手写简易Spring](/md/spring源码/1-300行手写简易Spring.md)
  - [手写完整功能Spring](/md/spring源码/2-手写完整功能Spring.md)
  - [Spring源码解析](/md/spring源码/3-Spring源码解析.md)
  - [Spring事务传播原理](/md/spring源码/4-Spring事务传播原理及数据库事务操作原理.md)

- **Spring 生态**
  - [SpringBoot实战和原理](/md/java/springboot/SpringBoot实战和原理.md)
  - [SpringCloud微服务](/md/java/springcloud/SpringCloud.md)
  - [SSM整合学习](/md/java/spring系列学习/ssm整合学习-Spring.md)

- **JVM 调优**
  - [JVM实战-加载链接初始化](/md/JVM/JVM实战-1-加载链接初始化.md)
  - [JVM实战-JMM](/md/JVM/JVM实战-2-JMM.md)
  - [JVM实战-GC](/md/JVM/JVM实战-3-GC.md)
  - [JVM实战-调优](/md/JVM/JVM实战-4-调优.md)

- **项目实战**
  - [手写RPC框架](/md/java/手写RPC/1-RPC架构设计.md)
  - [抽奖系统实战](/md/java/抽奖系统/Lottery%20抽奖系统-大厂规范.md)
</details>

<details>
<summary><b>🐍 Python 技术栈</b></summary>

- **Python 高级编程**
  - [一切皆对象](/md/Python/Python高级/1.一切皆对象.md) | [魔法函数](/md/Python/Python高级/2.魔法函数.md) | [类和对象](/md/Python/Python高级/3.类和对象.md)
  - [迭代器和生成器](/md/Python/Python高级/8.迭代器和生成器.md)
  - [多线程、多进程和线程池](/md/Python/Python高级/10.多线程、多进程和线程池编程.md)
  - [协程和异步io](/md/Python/Python高级/11.协程和异步io.md) | [asyncio并发编程](/md/Python/Python高级/12.asyncio并发编程.md)

- **Python 源码剖析**
  - [对象模型](/md/Python/Python源码剖析/Python源码剖析-1-对象模型.md) | [对象的生命周期](/md/Python/Python源码剖析/Python源码剖析-2-对象的生命周期.md)
  - [内建对象系列](/md/Python/Python源码剖析/Python源码剖析-7-内建对象list.md)
  - [虚拟机的字节码](/md/Python/Python源码剖析/Python源码剖析-12-虚拟机的字节码.md)
  - [GIL全局锁](/md/Python/Python源码剖析/Python源码剖析-15-GIL全局锁.md)
  - [设计协程库](/md/Python/Python源码剖析/Python源码剖析-30-造轮子：设计协程库.md)
  - [垃圾回收机制](/md/Python/Python源码剖析/Python源码剖析-34-垃圾回收机制.md)

- **Web 框架**
  - [Django全栈开发](/md/Django笔记/Djangoday1整体跑通.md) | [Django REST Framework](/md/Django笔记/django-rest-framework开发笔记.md)
  - [Flask快速开发](/md/flask笔记/flask模型.md) | [Flask上线部署](/md/flask笔记/flask上线部署.md)
</details>

<details>
<summary><b>🐹 Go 语言</b></summary>

- [Go语言上手-基础语言](/md/go/Go语言上手-基础语言.md)
- [Go语言上手-工程实践](/md/go/Go语言上手-工程实践.md)
- [Go语言上手-编码规范和性能调优](/md/go/Go语言上手-编码规范和性能调优.md)
- [GORM与database](/md/go/GORM与database.md)
</details>

### 💾 数据存储与中间件

<details>
<summary><b>MySQL 数据库</b></summary>

- [MySQL性能优化-架构](/md/mysql/MySQL性能优化-架构.md)
- [MySQL性能优化-索引](/md/mysql/MySQL性能优化-索引.md)
- [MySQL性能优化-事务](/md/mysql/MySQL性能优化-事务.md)
- [MySQL是怎样使用的](/md/mysql/MySQL是怎样使用的.md) | [MySQL是怎样运行的](/md/mysql/MySQL是怎样运行的.md)
</details>

<details>
<summary><b>Redis 缓存</b></summary>

- [Redis入门](/md/Redis/1-Redis入门.md) | [Redis实战](/md/Redis/2-Redis实战.md) | [原理篇](/md/Redis/3-原理篇.md)
- [Redis高级-多级缓存](/md/Redis/Redis高级-多级缓存.md)
- [Redis高级-分布式缓存](/md/Redis/Redis高级-分布式缓存.md)
- [Redis高级-最佳实践](/md/Redis/Redis高级-最佳实践.md)
</details>

<details>
<summary><b>消息队列</b></summary>

- [RabbitMQ](/md/消息队列/RabbitMQ.md)
- [RocketMQ设计与原理](/md/消息队列/RocketMQ设计与原理.md) | [RocketMQ源码分析](/md/消息队列/RocketMQ源码分析.md)
</details>

<details>
<summary><b>Elasticsearch</b></summary>

- [elasticsearch分布式搜索引擎](/md/elk/elasticsearch分布式搜索引擎.md)
- [安装elasticsearch](/md/elk/安装elasticsearch.md)
</details>

<details>
<summary><b>Zookeeper</b></summary>

- [Zookeeper基础](/md/zookeeper/Zookeeper基础.md)
- [Zookeeper源码](/md/zookeeper/Zookeeper源码.md)
</details>

### ⚛️ 前端开发

<details>
<summary><b>React 生态</b></summary>

- [React16基础](/md/React/React基础（技术胖）/React16基础.md)
- [Redux入门](/md/React/React基础（技术胖）/Redux入门.md) | [Redux2](/md/React/React基础（技术胖）/Redux2.md)
- [React-taro小程序开发](/md/React-taro/React-taro基本知识.md)
</details>

<details>
<summary><b>Vue 框架</b></summary>

- [Vue3+Vue-CLI项目搭建](/md/vue/Vue3+Vue-CLI项目搭建.md)
</details>

### ☁️ 运维与云原生

<details>
<summary><b>Docker & Kubernetes</b></summary>

- [Docker容器化](/md/docker/docker.md)
- [Kubernetes编排](/md/k8s/1-k8s的介绍.md)
- [CI/CD实践](/md/cicd/1.什么是CI和CD，为什么要学CI和CD.md)
</details>

<details>
<summary><b>Linux 运维</b></summary>

- [Linux常用命令](/md/linux/Linux常用命令.md)
- [Linux基础知识和命令](/md/linux/Linux核心技能与应用/Linux基础知识和命令.md)
- [Shell脚本编程](/md/linux/Linux核心技能与应用/Shell脚本编程.md)
</details>

### 💻 计算机基础

<details>
<summary><b>算法与数据结构</b></summary>

- [算法笔记](/md/算法/lb算法小抄笔记/算法小抄笔记.md)
</details>

<details>
<summary><b>计算机系统</b></summary>

- [操作系统](/md/计算机基础/操作系统.md) | [计算机网络](/md/计算机基础/计算机网络.md) | [计算机组成原理](/md/计算机基础/计算机组成原理.md)
- [深入理解tcp协议](/md/计算机基础/深入理解tcp协议.md) | [HTTP协议详解](/md/计算机基础/HTTP协议详解.md)
- [多线程与并发编程](/md/多线程与高并发/多线程与并发编程.md)
</details>

### 🧠 人工智能

<details>
<summary><b>机器学习与深度学习</b></summary>

- **机器学习基础**
  - [线性代数基础](/md/人工智能/人工智能-奈学/1-线性代数基础.md) | [概率论基础](/md/人工智能/人工智能-奈学/2-概率论基础.md)
  - [机器学习简介](/md/人工智能/人工智能-奈学/3-机器学习简介.md)
  - [线性模型](/md/人工智能/人工智能-奈学/5-线性模型.md) | [决策树](/md/人工智能/人工智能-奈学/6-决策树.md) | [支持向量机](/md/人工智能/人工智能-奈学/9-支持向量机.md)

- **深度学习**
  - [深度学习基本知识](/md/人工智能/人工智能-奈学/11-深度学习-基本知识.md)
  - [Tensorflow与Keras](/md/人工智能/人工智能-奈学/12-深度学习-开始使用Tensorflow.md)
  - [动手学深度学习系列](/md/人工智能/动手学深度学习/动深-1-前言.md)

- **AI Agent**
  - [agent五种设计模式](/md/agent/agent五种设计模式.md)
  - [A2A协议技术学习笔记](/md/agent/A2A协议技术学习笔记.md)
</details>

### 🛠️ 软件工程

<details>
<summary><b>系统设计与测试</b></summary>

- [设计模式](/md/系统设计/设计模式.md)
- [软件测试基础](/md/软件测试/测试基础/软件测试基础知识.md)
</details>

### 🔧 开发工具

<details>
<summary><b>Git 版本控制</b></summary>

- [git命令笔记](/md/git/git命令笔记.md)
- [learn-git-branching](/md/git/learn-git-branching.md)
</details>

### 💼 面试求职

<details>
<summary><b>面试准备</b></summary>

- [Java面试汇总](/md/面试/Java面试汇总.md)
- [Python面试](/md/面试/python面试.md) | [Python服务器端面试](/md/面试/python服务器端面试.md)
- [实习面试准备](/md/面试/实习面试准备.md)
</details>

---

## 🎯 学习路线

### 🚀 后端工程师成长路径

```mermaid
graph TB
    A[Java/Python基础] --> B[框架学习]
    B --> C[数据库与缓存]
    C --> D[分布式与微服务]
    D --> E[源码阅读与调优]
    E --> F[项目实战]
```

### 🎓 学习建议

1. **基础先行**：打牢语言基础，掌握数据结构与算法
2. **框架实践**：Spring、Django/Flask框架实战
3. **源码阅读**：深入理解框架原理，提升技术深度
4. **项目驱动**：通过实战项目巩固知识体系
5. **持续学习**：关注新技术、新趋势，保持技术敏锐度

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
