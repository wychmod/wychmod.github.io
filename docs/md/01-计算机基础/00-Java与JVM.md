# Java 与 JVM

> **原文归档**：[`archive/old-java-notes/`](../../archive/old-java-notes/) + [`archive/old-jvm-notes/`](../../archive/old-jvm-notes/) + [`archive/old-spring-notes/`](../../archive/old-spring-notes/)
> 包含：60+ 文件（Java 基础 / Spring 全家桶 / JVM / 手写 RPC / 短链 / 抽奖 / 监控 / Netty / 自动化测试）

---

## 一、Java 基础

> 📚 完整 Java 笔记见 [`archive/old-java-notes/`](../../archive/old-java-notes/)

### 1.1 核心概念

- **JVM**：Java 虚拟机，跨平台基础
- **JDK / JRE**：开发工具包 / 运行环境
- **字节码**：`.class` 文件，JVM 解释执行
- **类加载器**：Bootstrap / Extension / AppClassLoader
- **双亲委派**：类加载的安全机制

### 1.2 三大特性

- **封装**：private + getter/setter
- **继承**：extends + super
- **多态**：父类引用指向子类对象

### 1.3 核心包

- `java.lang`：基础（String / Object / Math）
- `java.util`：集合（List / Set / Map）
- `java.io / nio`：IO / NIO
- `java.util.concurrent`：并发（JUC）
- `java.net`：网络
- `java.time`：日期时间（Java 8+）

### 1.4 集合框架

| 类型 | 实现类 | 特点 |
|---|---|---|
| **List** | ArrayList / LinkedList | 有序可重复 |
| **Set** | HashSet / TreeSet | 去重 |
| **Map** | HashMap / TreeMap / ConcurrentHashMap | KV |
| **Queue** | LinkedList / PriorityQueue | 队列 |

### 1.5 多线程

- **Thread / Runnable / Callable**
- **synchronized / Lock / ReentrantLock**
- **volatile / ThreadLocal**
- **线程池**：core / max / queue / keepAlive

## 二、JVM 调优

> 📚 [JVM实战 1-4](../../archive/old-jvm-notes/)（4 篇，30KB+）

### 2.1 内存模型

```
┌─────────────────────────┐
│  堆（Heap）             │ ← new 出来的对象
│  ├─ Young（新生代）      │
│  │  ├─ Eden（80%）      │
│  │  └─ Survivor（20%）  │
│  └─ Old（老年代）        │
├─────────────────────────┤
│  方法区（Metaspace）    │ ← 类元数据
│  虚拟机栈              │ ← 方法调用
│  本地方法栈            │
│  程序计数器             │
└─────────────────────────┘
```

### 2.2 GC 算法

| 算法 | 思路 | 适用 |
|---|---|---|
| **标记-清除** | 标记存活对象，清除其余 | 老年代（CMS） |
| **复制** | 内存分两块，存活复制到另一块 | 年轻代（Serial / ParNew） |
| **标记-整理** | 标记存活，移到一端 | 老年代（Parallel Old） |
| **分代收集** | 不同代用不同算法 | HotSpot 默认 |

### 2.3 垃圾收集器

- **Serial / ParNew**：年轻代
- **CMS**：老年代（已淘汰）
- **G1**（默认）：分 Region，可预测停顿
- **ZGC / Shenandoah**：超低延迟（毫秒级）

### 2.4 调优参数

```bash
-Xms512m          # 初始堆
-Xmx2g             # 最大堆
-Xmn1g             # 年轻代
-XX:MetaspaceSize=256m
-XX:+UseG1GC       # 使用 G1
-XX:MaxGCPauseMillis=200
```

## 三、Spring 生态

### 3.1 Spring Core

- **IoC（控制反转）**：对象由容器管理
- **DI（依赖注入）**：构造器 / Setter / 字段注入
- **AOP（面向切面）**：JDK 动态代理 / CGLIB

### 3.2 Spring 全家桶

| 组件 | 用途 |
|---|---|
| **Spring Boot** | 快速启动，约定大于配置 |
| **Spring MVC** | Web 框架 |
| **Spring Data** | 数据访问（JPA / Redis / Mongo） |
| **Spring Security** | 认证授权 |
| **Spring Cloud** | 微服务套件（Eureka / Gateway / Config） |

### 3.3 Spring Boot 自动装配

```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

- `@EnableAutoConfiguration` 读取 `META-INF/spring.factories`
- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`

### 3.4 Spring Cloud 核心

- **服务注册发现**：Eureka / Nacos / Consul
- **配置中心**：Spring Cloud Config / Nacos
- **API 网关**：Spring Cloud Gateway / Zuul
- **熔断降级**：Sentinel / Resilience4j
- **负载均衡**：Ribbon / LoadBalancer

## 四、实战项目

> 📚 完整实战笔记见 [`archive/old-java-notes/`](../../archive/old-java-notes/)

- **手写 RPC**：Netty + 动态代理
- **手写 Spring**：IoC + AOP 实现
- **抽奖系统**：DDD 架构 + 高并发设计
- **短链系统**：Hash + Base62 + 分库分表
- **监控**：javaagent 字节码插桩
- **自动化测试平台**：JMeter 集成 + 性能压测

## 五、SSM 整合

- Spring + Spring MVC + MyBatis
- 配置文件：`web.xml` / `applicationContext.xml` / `spring-mvc.xml` / `mybatis-config.xml`
- Maven 依赖管理
- 分层：Controller / Service / DAO / Mapper

## 六、2026 年 Java 生态

| 维度 | 主流 |
|---|---|
| Java 版本 | 17 LTS（21 也可） |
| 框架 | Spring Boot 3.x + Spring Cloud 2024 |
| 构建 | Maven / Gradle |
| 测试 | JUnit 5 + Mockito + Testcontainers |
| 云原生 | Spring Boot 3 + GraalVM Native Image |
| 微服务 | Spring Cloud / Spring Cloud Alibaba |
| 性能 | GraalVM / OpenJDK Loom（虚拟线程） |

---

## 📚 完整资料

- [`archive/old-java-notes/`](../../archive/old-java-notes/) — Java 完整笔记归档
- [`archive/old-jvm-notes/`](../../archive/old-jvm-notes/) — JVM 笔记归档
- [`archive/old-spring-notes/`](../../archive/old-spring-notes/) — Spring 笔记归档
