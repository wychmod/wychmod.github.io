# Java 面试核心速查

> **正文 70KB+ 完整版**：[`archive/old-interview-notes/Java面试汇总.md`](../archive/old-interview-notes/Java面试汇总.md)
>
> 本文档只列**高频核心 30 题 + 关键点速查**，完整问答见归档。

---

## 一、Java 基础（高频 8 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | Java SPI 是什么？ | 基于接口的扩展机制（如 JDBC Driver） |
| 2 | fail-fast vs fail-safe？ | 前者修改立即抛异常，后者用副本（CopyOnWriteArrayList） |
| 3 | collection vs iterable？ | collection 继承 iterable，可迭代 + 通用集合方法 |
| 4 | 函数式编程特点？ | 无副作用、引用透明、声明式、并行安全 |
| 5 | Java 8 关键特性？ | lambda / Stream / Optional / 默认方法 / 新日期 API |
| 6 | Java 11+ 重要变化？ | String 加强、HttpClient、`var` 关键字 |
| 7 | `==` vs `equals()`？ | 前者比地址，后者比内容（需重写 hashCode） |
| 8 | final / finally / finalize？ | 不可变 / 异常清理 / 已废弃（GC 前回调） |

---

## 二、JVM（高频 6 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | 一个空对象占多少内存？ | 16 字节（markword 8 + class pointer 4 + padding 4） |
| 2 | 什么是伪共享？ | 缓存行 64 字节，多线程变量在同一行互相失效 |
| 3 | JVM 怎么执行字节码？ | 类加载 → 运行时数据区 → 执行引擎（JIT） |
| 4 | 四种引用类型？ | 强/软/弱/虚，强度递减、回收阈值递减 |
| 5 | G1 vs CMS？ | G1 是分区+并发标记+可预测停顿；CMS 是标记清除老年代 |
| 6 | 调优思路？ | 先 dump 内存 / 看 GC 日志 / 调整堆比例 / 排查内存泄漏 |

---

## 三、Java 并发（JUC 高频 5 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | volatile 关键字？ | 保证可见性 + 禁止重排序，不保证原子性 |
| 2 | synchronized 锁升级？ | 无锁 → 偏向锁 → 轻量级锁 → 重量级锁 |
| 3 | AQS 原理？ | state + CLH 队列 + CAS，ReentrantLock / CountDownLatch 基础 |
| 4 | ThreadLocal 内存泄漏？ | 用完必须 remove()，key 是弱引用但 value 是强引用 |
| 5 | 线程池 7 个参数？ | core/maxPoolSize/queue/keepAlive/unit/threadFactory/rejectedHandler |

---

## 四、Spring / Spring Boot（高频 5 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | Spring Boot 自动装配？ | `@EnableAutoConfiguration` + `META-INF/spring.factories` |
| 2 | Spring AOP 实现？ | JDK 动态代理（接口）/ CGLIB（类） |
| 3 | Spring 解决循环依赖？ | 三级缓存（singletonObjects/early/earlyFactories） |
| 4 | `@Transactional` 失效场景？ | 自调用 / 非 public / 异常被 catch / 传播行为不对 |
| 5 | Spring, MVC, Boot, Cloud 关系？ | Spring 是基础 → MVC 是 Web 层 → Boot 是快速启动 → Cloud 是微服务套件 |

---

## 五、设计模式（高频 3 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | Spring 用了哪些模式？ | 工厂（BeanFactory）/ 代理（AOP）/ 单例（Bean）/ 模板（JdbcTemplate） |
| 2 | 工厂 vs 抽象工厂？ | 工厂创建单一产品，抽象工厂创建产品族 |
| 3 | 观察者模式 vs 发布订阅？ | 前者直接依赖，后者通过中间层解耦 |

---

## 六、Redis（高频 5 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | Redis 底层数据结构？ | SDS / 跳跃表 / 字典 / 压缩列表 |
| 2 | 雪崩 vs 穿透 vs 击穿？ | 雪崩=大量 key 同时过期；穿透=查询不存在 key；击穿=单个热点 key 过期 |
| 3 | 雪崩解决方案？ | 过期时间随机化 + 熔断降级 + 集群 |
| 4 | Redis 为什么快？ | 内存 + 单线程 + IO 多路复用 + 简单数据结构 |
| 5 | Redis 集群方案？ | Codis / Twemproxy / Redis Cluster（官方） |

---

## 七、MySQL（高频 4 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | 索引底层？ | InnoDB B+ 树，叶子节点存数据 |
| 2 | 聚簇 vs 非聚簇？ | 聚簇叶子存整行数据，非聚簇存主键 |
| 3 | 索引失效场景？ | 函数 / 类型转换 / 前导模糊查询 / 不符合最左前缀 |
| 4 | 事务隔离级别？ | 读未提交 / 读已提交 / 可重复读（MySQL 默认）/ 串行化 |

---

## 八、MyBatis（高频 2 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | MyBatis 执行流程？ | 读配置 → SqlSessionFactory → SqlSession → 执行 SQL → 映射结果 |
| 2 | `#{}` vs `${}`？ | 前者预编译防 SQL 注入，后者直接拼字符串 |

---

## 📚 完整问答

- 70KB 完整问答（含每个题目的详细解释）见：[`archive/old-interview-notes/Java面试汇总.md`](../archive/old-interview-notes/Java面试汇总.md)
- 涵盖主题：自我介绍、HR 问题、Spring、Mybatis、Redis、MySQL、Java 基础、JVM、JUC、设计模式、抽奖系统、Linux、MQ、人工智能、设计模式
