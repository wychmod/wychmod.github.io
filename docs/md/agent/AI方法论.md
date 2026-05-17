
# 架构师和工程团队

>  不了解技术细节，就没法给出精确的任务描述。技术能力是你当好“架构师”的前提。

AI时代哪些是AI该做的，哪些是架构师该做的：
- 第一层，必须你做的。产品边界、架构决策、技术取舍、跨模块一致性。拿 Hify 来说：做不做 RAG 知识库？用微服务还是模块化单体？线程池参数设多少？这些决策只有你能做。Claude Code 可以给你方案对比（后面第 04 讲你会看到这个过程），但拍板的必须是你。

- 第二层，AI 做你验收的。业务代码、接口开发、前端页面、测试用例、文档。这是工作量的大头。有一个硬标准：任何一行代码你都要能说清楚它在干什么。说不清楚，就不能用。

- 第三层，AI 全权处理的。格式化、样板代码、简单重构、启动脚本、Makefile。扫一眼没问题就行。

认知框架：你是架构师，Claude Code 是你的工程团队。你的工作重心从写代码变成做决策。

三步检查法：拿到 AI 输出后，先查意图、再查质量、最后查边界。意图错了后面白查，这个顺序不能反。

在 AI 辅助开发里，SDD 通常指 Spec-Driven Development，规格驱动开发；TDD 指 Test-Driven Development，测试驱动开发。

简单说：

SDD 先把“要做什么、为什么、边界是什么”写清楚，再让 AI/人实现。适合0-1
TDD 先把“什么结果才算正确”写成测试，再让 AI/人实现。适合1-2/3

> SDD 解决“AI 到底该做什么”的问题，TDD 解决“AI 做得对不对”的问题。
   最好的 AI 开发流程不是 SDD 或 TDD 单独使用，而是用 SDD 收敛需求，用 TDD 锁住行为。


# 如何从零开发一个应用

## 1. 搞清楚业界标杆在做什么

> 帮我梳理  Dify（https://dify.ai）这个产品的核心功能模块，按类别分组，每个模块用一两句话说明它做什么。


**原则是：AI 给的信息不能直接信，你要验证。**

## 2. 功能取舍

功能全景有了，接下来是最关键的一步：做哪些、不做哪些。

> 我要基于 Dify 做一个简化版的 AI Agent 平台，叫 Hify。约束条件：一个人开发，面向团队内部 20-50 人使用，本地部署。请从刚才梳理的功能列表中，帮我判断哪些是必须做的核心功能，哪些可以砍掉，给出每个的理由。


“三问裁剪法”。
- 第一问：没有它产品还成立吗？区分核心和边缘。模型管理、Agent 配置、对话引擎、工具集成、管理控制台，这五个砍掉任何一个产品都不成立。知识库和工作流砍掉产品能用但价值大打折扣，降级做。可视化拖拽、多租户、插件市场、计费，砍掉不影响核心链路。
- 第二问：做到什么程度够用？核心功能不做满。模型管理只做 CRUD + 连通性测试。Agent 配置只做选模型、绑工具、设提示词。对话引擎只做流式  +  多轮。知识库只支持 TXT +  固定分块。工作流只支持 JSON 配置。管理控制台能用就行不追求精美。
- 第三问：能不能一句话说清楚？Hify：一个可本地部署的 AI Agent 开发平台，支持多模型管理、Agent 配置、知识库 RAG、简版工作流、对话交互和 MCP 工具接入，面向团队内部小规模使用。

按照 MoSCoW 分层：

|层级|含义|你应该怎么做|
|---|---|---|
|**Must 必须做**|没有它产品不成立|MVP 第一版必须有|
|**Should 应该做**|重要，但可以简化|第一版做轻量版，或第二版做|
|**Could 可选做**|有价值但不紧急|有余力再做|
|**Cut 先砍掉**|对当前约束不划算|不进入 MVP|

## 3. 技术选型

> Hify 是一个 AI Agent 开发平台，一个人开发，本地部署，目标 20-50 人使用。帮我对比以下技术方案的优劣：1) Spring Boot + Vue 2) Go + React 3) Python FastAPI + React。重点考虑开发效率、生态成熟度、AI 领域 SDK 支持、运维复杂度。

提前想清楚怎么跑

> Hify 是一个 AI Agent 平台，Docker Compose 本地部署，目标 20-50 人同时在线，主要压力在对话接口（流式 SSE）。帮我估算 QPS、建议缓存策略、列出需要提前考虑的运维事项。

claude.md
```md
## 项目概述

Hify 是一个简版的 AI Agent 开发平台（参考 Dify），可本地部署，
面向团队内部小规模使用（20-50 人同时在线）。

### 做什么
- 多模型提供商管理（OpenAI、Claude、Gemini、Ollama）
- Agent 创建与配置（选模型、绑工具、设系统提示词）
- 对话引擎（流式响应、多轮对话、上下文管理）
- 知识库 + RAG（一期只支持 TXT 文档，固定长度分块）
- 简版工作流（JSON 配置，线性 + 条件分支，不做可视化拖拽）
- MCP 工具接入（Agent 可通过 MCP 协议调用外部工具）
- 管理控制台（模型管理、Agent 配置、对话界面）

### 不做什么
- 不做可视化工作流拖拽编排
- 不做多租户 / 权限体系
- 不做插件市场、计费系统
- 不做文本生成应用、WebApp 发布、嵌入组件
- 不做标注与微调

### 技术栈
后端：Spring Boot 3.x + MyBatis-Plus + MySQL 8.x + Redis 7.x
前端：Vue 3 + TypeScript + Vite + Element Plus
容器化：Docker + Docker Compose

### 部署与运维预期
- Docker Compose 本地一键部署，JVM 内存设上限（-Xmx512m）
- 目标：20-50 人同时在线，峰值 3-5 QPS，瓶颈在 LLM 长连接
- 缓存：Redis Cache-Aside（配置信息 + 会话上下文）
- 监控：起步 Actuator + 日志，后期 Prometheus + Grafana
```

## 4. 应用架构
一个 Spring Boot 应用，内部怎么组织？

> Hify 是一个 Spring Boot 单体应用，功能包括模型提供商管理、Agent 配置、对话引擎、知识库 RAG、简版工作流、MCP 工具接入。一个人开发，一期 50 人使用，但后续可能要扩到几千人。代码内部怎么组织？给我方案对比。

在推荐方案后，需要不断追问，确保最合适的

>一个人维护六七个微服务，每个要独立部署、独立配置、独立监控，精力消耗会不会太大？

> 基于  Hify  的功能，帮我梳理这些模块之间的依赖关系。谁依赖谁？有没有循环依赖的风险？


## 5. 代码组织规范

>Hify 是模块化单体，用 Spring Boot + MyBatis-Plus。帮我定义代码组织规范，覆盖：每个模块内部的分层结构、每一层的职责边界、跨模块调用的规则。要求具体到 AI 能直接执行，不要模糊的描述。


```
Controller 只做两件事：参数校验和调用 Service。不写业务逻辑、不做数据查询、不处理事务。为什么要这么严格？因为 Claude Code 特别喜欢在 Controller 里“顺手”加逻辑，它觉得方便，但你后面测试、重构、拆分全部受影响。

Service 处理所有业务逻辑，包括事务管理、数据校验、业务规则。Service 之间可以互相调用，但只能调接口（interface），不能直接 new 实现类。

Mapper 只做数据库操作。不要在 Mapper 的 XML 里写业务逻辑（比如复杂的条件判断），那是 Service 的事。

Entity 和数据库表一一对应。DTO 是给接口用的请求 / 响应对象。Entity 和 DTO 之间要做转换，不要把 Entity 直接返回给前端——Entity 里可能有敏感字段（API Key），DTO 可以控制暴露哪些字段。
```

## 6. 外部调用设计（开发中的其他情况）

> Hify 要调用多个外部 LLM API（OpenAI、Claude、Gemini、Ollama），这些调用慢且不稳定。从线程管理、容错、超时、重试四个维度，给出完整的技术方案。


写入claude.md
```
## 架构设计

### 应用架构
模块化单体。一个 Spring Boot 应用，Maven 多模块组织。

模块划分：
- hify-provider：模型提供商管理
- hify-agent：Agent 管理与配置
- hify-chat：对话引擎
- hify-mcp：MCP 工具管理与调用
- hify-workflow：工作流编排与执行
- hify-knowledge：知识库与 RAG
- hify-common：公共模块

依赖原则：单向依赖，不循环。共用逻辑下沉 hify-common。

### 代码组织
每个业务模块统一结构：controller / service / mapper / entity / dto / config

分层规则：
- Controller 只做参数校验和调用 Service，不写业务逻辑
- Service 处理所有业务逻辑，包括事务管理
- 跨模块调用走 Service 接口，不直接引用其他模块的 Mapper 或 Entity
- Entity 不直接返回给前端，用 DTO 做转换

### 外部调用处理
- LLM 调用使用独立线程池，和业务请求隔离
- Resilience4j 熔断，每个提供商独立熔断器
- 同步调用 60s 超时，SSE 流式 120s 超时，连通性测试 10s
- 按异常类型区分重试：网络抖动重试、认证失败不重试、限流退避重试
- 流式响应使用 SseEmitter + 独立线程池，不引入 WebFlux
```

## 7. 部署架构

> Hify 是模块化单体，技术栈 Spring Boot + Vue + MySQL + Redis + pgvector。目标 50 人内部使用，生产环境用 Docker + K8s 部署。帮我设计当前阶段的部署架构：有哪些组件、请求怎么流转、每个组件的职责是什么。


## 8. 性能瓶颈
> 基于 Hify 当前的部署架构（Nginx + Spring Boot + MySQL + Redis + pgvector +  外部 LLM API），帮我分析：这个系统的性能瓶颈可能在哪？按严重程度排序，每个瓶颈给出触发条件和一期是否需要处理。

## 9. 扩展架构

> 如果 Hify 要从 50 人扩展到几千人，当前架构需要怎么演进？帮我设计一个分阶段的扩展路径，每一步的触发条件是什么、改什么、不改什么。


## 10. 数据模型概览

> 基于 Hify 的功能范围（模型管理、Agent、对话、工作流、知识库、MCP 工具），帮我梳理核心数据表和它们之间的关系。只要表名和关系，不展开字段。


![](../youdaonote-images/Pasted%20image%2020260517191601.png)


## 11. 数据库性能规范

> Hify 用 MySQL 8.x + pgvector。帮我定义数据库层面的性能规范，覆盖：索引设计原则、大表预判和应对策略、分页查询注意事项、通用字段约定。要求具体到 AI 建表时能直接执行。


claude.md
```
### 部署架构
生产环境：Docker + K8s
- 前端：Nginx 托管静态文件 + API 反向代理（proxy_buffering off）
- 后端：Spring Boot，K8s Deployment（一期单副本）
- 数据库：MySQL 8.x（外部服务）
- 缓存：Redis 7.x（外部服务）
- 向量库：PostgreSQL + pgvector（外部服务）
- 本地开发：java -jar + npm run dev，start.sh 一键启动

### 缓存策略
- Provider/Agent 配置：Redis Cache-Aside，TTL 30min
- 对话上下文：Redis，TTL 2h
- 对话消息、知识库文档：不缓存，走数据库
- LLM 响应：不缓存

### 数据库规范
通用字段：
- 主键 id BIGINT 自增，禁止 UUID
- 时间字段 created_at / updated_at，DATETIME(3)
- 逻辑删除 deleted TINYINT(1)
- 禁止 NULL，空值用空字符串或 0
- 枚举用 VARCHAR(32)，不用 MySQL ENUM

索引规则：
- 命名 idx_{表名}_{字段名}
- 逻辑删除字段必须加进组合索引
- 组合索引等值列在前，范围列在后
- 多对多关联表两个方向都要索引
- 唯一约束用 UNIQUE INDEX，不只在代码层校验
- 禁止在 TEXT/BLOB 字段建索引
- 不建数据库级外键约束，应用层维护

分页规则：
- 默认用游标分页（WHERE id < lastId ORDER BY id DESC LIMIT N）
- OFFSET 分页限制最大 10000 条
- COUNT 只在第一页查，翻页不重复查

大表预判：
- message：增长最快，必须建 (conversation_id, created_at) 索引
- document_chunk：MySQL 只存元数据，向量存 pgvector

pgvector 规范：
- 向量表建在 PostgreSQL，维度固定 1536
- 必须建 HNSW 索引
- 检索必须加 LIMIT，禁止全量排序

### 扩展路径
一期单副本 → 多副本 + 主从分离（500人）
→ MQ 异步 + Qdrant（2000人）→ 微服务拆分 + Redis 集群（几千人）
触发条件驱动，条件不到不动。
```


## 12. 接口规范与行为指令

```
## 接口规范

### 路径
RESTful 风格：/api/v1/{资源复数名}
GET    /api/v1/providers          # 列表（分页）
POST   /api/v1/providers          # 创建
GET    /api/v1/providers/{id}     # 详情
PUT    /api/v1/providers/{id}     # 更新
DELETE /api/v1/providers/{id}     # 删除
POST   /api/v1/providers/{id}/test-connection  # 非 CRUD 操作用动词

### 统一响应
所有接口返回 Result<T>：
{ "code": 200, "message": "success", "data": {...} }

### 分页
请求：page（从 1 开始）、pageSize（默认 20，最大 100）
响应：Result<PageResult<T>>，PageResult 包含 list、total、page、pageSize

### 空值
- 列表字段空时返回 []，不返回 null
- 字符串字段空时返回 ""，不返回 null
- 对象不存在时返回 null

### 错误码
四位数字，按模块分段：
1000-1999 通用 | 2000-2999 Provider | 3000-3999 Agent
4000-4999 Chat | 5000-5999 MCP | 6000-6999 Workflow | 7000-7999 Knowledge


## 行为指令

### 写代码时
- 每个功能用最简单直接的方式实现
- 不引入不必要的设计模式，除非我明确要求
- 不做过度抽象
- 不引入技术栈以外的依赖，需要时先问我
- 所有外部调用必须有超时设置
- 配置项外化到 application.yml，不硬编码

### 改代码时
- 先理解相关模块的设计意图
- 不要为了新功能破坏已有接口契约
- 改完确保已有测试通过

### 不确定时
- 架构选择给我 2-3 个方案对比，我来拍板
- 规范没覆盖的情况，先问我，不要自己编规矩
```


## 13. 整合成一个claude.md

> 我在做一个叫 Hify 的项目，以下是前期做的所有决策。另外请基于阿里巴巴 Java 开发手册，补充编码规范部分。请帮我合并生成一份完整的 CLAUDE.md。要求：结构清晰，从项目概述到行为指令，规范要具体到 AI 能直接执行。

claude.md


# 项目实战
## 1. 后端骨架初始化

1. Maven 多模块骨架（父 pom +  子模块 pom +  目录结构）
2. hify-common 公共基础设施（Result、BizException、全局异常处理、配置类）
3. 业务模块空壳（每个模块的 package 结构和启动验证）
4. 验收，启动项目，确认一切正常

> 按照 CLAUDE.md 中的项目结构和技术栈，创建 Hify 的 Maven 多模块工程骨架。父 pom 声明所有子模块，统一管理 Spring Boot、MyBatis-Plus、Redis 等版本号。子模块之间的依赖关系按 CLAUDE.md 中定义的架构来。只创建 pom 和目录结构，不需要写 Java 代码。


