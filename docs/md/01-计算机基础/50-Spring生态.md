# Spring 生态

> **原文归档**：[`archive/old-spring-notes/`](/md/archive/README?id=old-spring-notes)（手写 Spring / 源码解析 / 事务传播）+ [`archive/old-java-notes/`](/md/archive/README?id=old-java-notes)（spring系列学习 / springboot / springcloud / AIcloud 项目）
>
> 从「Java 与 JVM」的 Spring 概览小节扩展为独立主线，沉淀 Spring 全家桶知识并索引全部归档资料。

---

## 一、核心概述

Spring 是 Java 生态事实标准的**企业级应用框架**，从单个 IoC 容器发展为覆盖 Web、数据访问、安全、微服务、观测的全家桶：

| 组件 | 用途 |
|---|---|
| **Spring Framework** | 核心：IoC 容器 + AOP + 事务 |
| **Spring Boot** | 快速启动，约定大于配置，自动装配 |
| **Spring MVC** | Web 框架（RESTful / 模板渲染） |
| **Spring Data** | 数据访问（JPA / Redis / Mongo） |
| **Spring Security** | 认证授权 |
| **Spring Cloud** | 微服务套件（注册发现 / 网关 / 配置 / 熔断） |
| **Spring AI** | LLM 应用框架（ChatClient / Tool Calling / RAG） |

## 二、Spring Core：IoC / DI / AOP

- **IoC（控制反转）**：对象的创建与生命周期交给容器管理，业务代码只声明依赖；
- **DI（依赖注入）**：实现 IoC 的方式，构造器注入（推荐）/ Setter 注入 / 字段注入（`@Autowired`）；
- **AOP（面向切面）**：横切逻辑（日志、事务、权限）与业务解耦；底层 JDK 动态代理（基于接口）或 CGLIB（子类继承）；
- **Bean 生命周期**：实例化 -> 属性填充 -> 初始化（`@PostConstruct` / `InitializingBean`）-> 使用 -> 销毁；
- **循环依赖**：三级缓存（singletonObjects / earlySingletonObjects / singletonFactories）支撑构造器注入无法解决的早期引用暴露。

## 三、Spring Boot

### 3.1 自动装配

```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`；
- `@EnableAutoConfiguration` 读取 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Boot 3.x；2.x 用 `spring.factories`）；
- 条件装配注解：`@ConditionalOnClass` / `@ConditionalOnMissingBean` / `@ConditionalOnProperty`。

### 3.2 Actuator 生产监控

Actuator 是 Spring Boot 的**生产级监控与管理模块**：加 `spring-boot-starter-actuator` 依赖即自动暴露一组 HTTP/JMX 端点，不写监控代码就能观测运行中应用的内部状态。

**核心端点**：

| 端点 | 作用 |
|---|---|
| `/actuator/health` | 健康状态，聚合所有 HealthIndicator（DB/Redis/磁盘/MQ）；K8s 探针与负载均衡摘流的标准依据 |
| `/actuator/metrics` | 运行指标：JVM 内存/GC、HTTP QPS 与耗时、连接池等，可按 tag 钻取 |
| `/actuator/info` | 应用版本、构建时间、Git 提交 |
| `/actuator/env` | 全部环境属性来源与覆盖顺序（含敏感信息，慎暴露） |
| `/actuator/beans` / `mappings` | 容器 Bean、URL 路由映射 |
| `/actuator/threaddump` / `heapdump` | 线程栈 / 下载堆转储（OOM 排查） |
| `/actuator/loggers` | 查看并**动态修改**日志级别（不重启） |
| `/actuator/prometheus` | Prometheus 抓取格式输出全部指标 |

**暴露控制与安全**（默认仅 Web 暴露 health）：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
        exclude: env,beans
  endpoint:
    health:
      show-details: when-authorized
```

- 生产环境禁 `include: "*"`，至少排除 `env`、`heapdump`（泄敏风险）；
- 配合 Spring Security 认证，或独立 `management.port` + 内网隔离；
- K8s：`management.endpoint.health.probes.enabled=true` 生成 `/health/liveness` 与 `/health/readiness`。

**扩展**：自定义 `HealthIndicator` 把下游依赖纳入健康聚合；Micrometer `MeterRegistry` 打业务指标；`@Endpoint` 自定义端点。

> 💡 补充：Actuator 是微服务可观测性的事实标准底座--`/health` 供探针、`/prometheus` 供抓取、`/loggers` 供线上动态排障，配套 Grafana 即可搭建零侵入监控大盘。

## 四、Spring 事务

- **声明式事务**：`@Transactional` 基于 AOP 代理，同类内部方法调用不经过代理会导致事务失效（经典坑）；
- **传播行为**（重点，详见归档《Spring事务传播原理》）：
  - `REQUIRED`（默认）：有则加入，无则新建；
  - `REQUIRES_NEW`：挂起当前事务，独立新事务；
  - `NESTED`：嵌套事务（保存点回滚）；
  - `SUPPORTS` / `NOT_SUPPORTED` / `MANDATORY` / `NEVER`；
- **失效场景**：非 public 方法、自调用、异常被 catch 吞掉、默认只回滚 `RuntimeException`（`rollbackFor` 指定）；
- **数据库侧**：与 MySQL InnoDB 隔离级别（RR/RC）配合理解，长事务的 undo 膨胀问题见「计算机系统与并发」导出一致性小节。

## 五、Spring Cloud 微服务

- **服务注册发现**：Nacos（国内主流）/ Eureka / Consul；
- **配置中心**：Nacos / Spring Cloud Config；
- **API 网关**：Spring Cloud Gateway（Zuul 已停维）；
- **熔断降级**：Sentinel / Resilience4j（Hystrix 已停维）；
- **负载均衡**：Spring Cloud LoadBalancer（Ribbon 已停维）；
- Spring Cloud Alibaba 系已是国内微服务默认选择，Nacos 单集群同时承担注册中心 + 配置中心（搭建笔记见归档 springcloud 目录）。

## 六、源码学习线：手写 Spring

归档 `old-spring-notes/` 保留了一条完整的学习路径，值得按序重读：

1. **300 行手写简易 Spring**：最小 IoC 容器（BeanDefinition / 反射创建 / DI）；
2. **手写完整功能 Spring**：补充 AOP、BeanPostProcessor、循环依赖三级缓存；
3. **Spring 源码解析**：对照真实源码（`refresh()` 流程 / `getBean()`）验证手写理解；
4. **事务传播原理**：源码级拆解 `@Transactional` 与数据库事务的协作。

> 💡 补充：手写一遍再读源码，比直接啃源码效率高一个量级--先建立"容器在做什么"的心智模型，再看真实实现如何处理边界。

## 七、2026 年 Spring 生态现状

| 维度 | 现状 |
|---|---|
| 主线 | Spring Boot 3.5（生产主力）与 4.x（基线 Java 17+，配 Spring Framework 7）并行 |
| Java | 21 LTS 主流，25 LTS 逐步采用；虚拟线程（Loom）与 WebFlux 并存 |
| 云原生 | GraalVM Native Image / Buildpacks / Spring Boot 3+ AOT 成熟 |
| AI | Spring AI 进入主流视野：ChatClient 抽象、Tool Calling、RAG、多模型适配 |
| 微服务 | Spring Cloud Alibaba 系主导国内；网格化（Istio）分担了部分框架治理职能 |

---

## 📚 完整资料（归档索引）

### old-spring-notes/（源码与原理主线）

- [1-300行手写简易Spring.md](../archive/old-spring-notes/1-300行手写简易Spring.md)
- [2-手写完整功能Spring.md](../archive/old-spring-notes/2-手写完整功能Spring.md)
- [3-Spring源码解析.md](../archive/old-spring-notes/3-Spring源码解析.md)
- [4-Spring事务传播原理及数据库事务操作原理.md](../archive/old-spring-notes/4-Spring事务传播原理及数据库事务操作原理.md)

### old-java-notes/spring系列学习/（入门与 SSM）

- [spring.md](../archive/old-java-notes/spring系列学习/spring.md) / [IOC和AOP.md](../archive/old-java-notes/spring系列学习/IOC和AOP.md) / [spring-依赖注入.md](../archive/old-java-notes/spring系列学习/spring-依赖注入.md)
- SSM 整合系列：[Spring](../archive/old-java-notes/spring系列学习/ssm整合学习-Spring.md) / [SpringMVC](../archive/old-java-notes/spring系列学习/ssm整合学习-SpringMVC.md) / [SpringBoot](../archive/old-java-notes/spring系列学习/ssm整合学习-SpringBoot.md) / [Mybatis](../archive/old-java-notes/spring系列学习/ssm整合学习-Mybatis.md) / [MybatisPlus](../archive/old-java-notes/spring系列学习/ssm整合学习-MabtisPlus.md) / [Maven](../archive/old-java-notes/spring系列学习/ssm整合学习-Maven.md)

### old-java-notes/springboot/（实战）

- [SpringBoot实战和原理.md](../archive/old-java-notes/springboot/SpringBoot实战和原理.md)
- [Java 后端.md](../archive/old-java-notes/springboot/Java%20后端.md)

### old-java-notes/springcloud/（微服务）

- [SpringCloud.md](../archive/old-java-notes/springcloud/SpringCloud.md)
- [Nacos安装指南.md](../archive/old-java-notes/springcloud/Nacos安装指南.md) / [nacos集群搭建.md](../archive/old-java-notes/springcloud/nacos集群搭建.md)

### old-java-notes/AIcloud项目/（Spring 相关）

- [2.SpringAI中文参考文档.md](../archive/old-java-notes/AIcloud项目/2.SpringAI中文参考文档.md)
- [6.SpringSecurity使用.md](../archive/old-java-notes/AIcloud项目/6.SpringSecurity使用.md)

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-23 | 新增 | 新建文档：从 Java 与 JVM 的 Spring 概览扩展为独立主线；新增 Actuator 生产监控小节；建立全量 Spring 归档索引（old-spring-notes + old-java-notes 四个子目录） |
