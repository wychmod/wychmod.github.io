# Java 面试核心速查

> **原文归档**：[archive/old-interview-notes/Java面试汇总.md](../archive/old-interview-notes/Java面试汇总.md)
> 包含：163KB 完整 Java 面试汇总

## 一、核心主题概述

本速查围绕后端 Java 面试的八大高频主题整理，适合面试前快速复盘：

- Java 基础与集合框架
- JVM 与垃圾回收
- 并发与多线程（JUC）
- Spring / Spring Boot / Spring MVC
- MySQL、Redis、消息队列
- 设计模式
- 场景题与系统设计

> 共 67 道高频题，答案均为“抓重点”式，详细推导请查看归档原文。

---

## 二、Java 基础

| # | 问题 | 关键答案 |
|---|------|---------|
| 1 | `String`、`StringBuilder`、`StringBuffer` 区别 | `String` 不可变、线程安全；`StringBuilder` 可变、非线程安全、最快；`StringBuffer` 可变、方法均 `synchronized`、线程安全但性能略低。 |
| 2 | 为什么 `100 == 100` 为 true，`1000 == 1000` 为 false | `Integer.valueOf()` 对 `-128~127` 使用缓存，超出范围则 `new Integer()`，享元模式。 |
| 3 | `new String("hello")` 创建几个对象 | 常量池无 `"hello"` 时创建 2 个（常量池字面量 + 堆实例）；有则只创建堆实例。 |
| 4 | 为什么重写 `equals` 必须重写 `hashCode` | 散列集合先比较 `hashCode` 再比较 `equals`；不重写会导致“逻辑相等但哈希不同”，破坏 `HashMap`/`HashSet` 契约。 |
| 5 | 深拷贝与浅拷贝 | 浅拷贝只复制对象本身，内部引用对象共享地址；深拷贝递归复制引用对象（`Cloneable`、序列化、JSON 工具）。 |
| 6 | 强/软/弱/虚引用 | 强引用：不回收；软引用：内存不足前回收；弱引用：下次 GC 回收；虚引用：回收前收到通知，用于清理资源。 |
| 7 | `ArrayList`、`LinkedList`、`Vector` 区别 | `ArrayList` 动态数组，查询 O(1)、扩容 1.5 倍；`LinkedList` 双向链表，插入删除快；`Vector` 线程安全但性能差，扩容 2 倍。 |
| 8 | `HashMap` 与 `Hashtable` 区别 | `HashMap` 线程不安全、允许 null key/value；`Hashtable` 方法全 `synchronized`、不允许 null。 |
| 9 | `HashMap` 底层实现（JDK 1.8） | 数组 + 链表/红黑树；链表长度 ≥ 8 且数组长度 ≥ 64 转红黑树，节点 ≤ 6 退化链表。 |
| 10 | `HashMap` 为什么线程不安全 | JDK 1.7 头插法扩容导致死循环；所有版本存在多线程数据覆盖问题。 |
| 11 | `ConcurrentHashMap` 为什么不允许 null key/value | 多线程下 `get(key)` 返回 `null` 无法区分是“无该 key”还是“value 为 null”，产生歧义。 |
| 12 | 负载因子为什么默认 0.75 | 空间与时间的折中：太低浪费空间，太高冲突多、性能下降。 |
| 13 | 反射是什么，使用场景 | 运行时检查/操作类、字段、方法；用于框架、AOP、序列化、动态代理；注意性能与安全。 |
| 14 | Java 8 新特性 | Lambda、函数式接口、`Stream`、`Optional`、方法引用、新日期 API、接口默认方法。 |
| 15 | 受检异常与非受检异常 | `Error` 和 `RuntimeException` 是非受检异常；其他 `Exception` 是受检异常，必须捕获或声明。 |

> 💡 补充：日常写业务代码优先用 `HashMap`，高并发读多写少用 `ConcurrentHashMap`，不要自己手写线程安全 Map。

---

## 三、JVM

| # | 问题 | 关键答案 |
|---|------|---------|
| 16 | JVM 内存布局 | 程序计数器、虚拟机栈、本地方法栈（线程私有）；堆（新生代 Eden/Survivor、老年代）、方法区/元空间（线程共享）。 |
| 17 | 一个空对象占多大内存 | 64 位压缩指针下：MarkWord 8B + ClassPointer 4B + 对齐填充 4B = 16B。 |
| 18 | 类加载过程 | 加载 → 验证 → 准备（默认初始化） → 解析（符号引用转直接引用） → 初始化（静态变量赋值、静态代码块）。 |
| 19 | 双亲委派模型 | 类加载器先委托父加载器加载，父加载器无法加载才自己加载；避免重复加载、保证核心 API 安全。 |
| 20 | 元空间与永久代区别 | JDK 8 前 HotSpot 用永久代实现方法区，固定大小易 OOM；JDK 8 后改为元空间，使用本地内存，动态扩展。 |
| 21 | 如何判断对象是否存活 | 引用计数法（循环引用问题）；可达性分析（GC Roots：栈引用、静态属性、常量、JNI 引用）。 |
| 22 | 常见垃圾回收算法 | 标记-清除（碎片）、复制（Young 区）、标记-整理（Old 区）、分代收集。 |
| 23 | 常见垃圾回收器 | Serial/Serial Old、ParNew、Parallel Scavenge/Parallel Old（JDK 8 默认）、CMS、G1（JDK 9+ 默认）、ZGC（JDK 15 正式可用，非默认）。 |
| 24 | 类加载器有哪些 | 启动类加载器、扩展类加载器、系统/应用类加载器、用户自定义类加载器。 |

> 💡 补充：线上排查 JVM 问题三板斧：`jps` 定位进程 → `jstat` 看 GC → `jstack`/`jmap` 看线程与内存。

---

## 四、并发编程

| # | 问题 | 关键答案 |
|---|------|---------|
| 25 | `synchronized` 与 `Lock` 区别 | `synchronized` 隐式获取释放、JVM 层实现、可重入；`Lock` 显式控制、可中断/超时/公平、支持读写锁、性能在高并发下更优。 |
| 26 | `synchronized` 锁升级过程 | 无锁 → 偏向锁 → 轻量级锁（CAS 自旋） → 重量级锁；JDK 6 引入，减少 mutex 开销。 |
| 27 | `volatile` 作用与原理 | 保证可见性、禁止指令重排；底层通过内存屏障（读/写屏障）实现，适用于一写多读场景。 |
| 28 | 什么是 CAS，ABA 问题如何解决 | CAS：比较并交换，乐观锁实现；ABA 问题用 `AtomicStampedReference` 或 `AtomicMarkableReference` 加版本号/标记解决。 |
| 29 | AQS 是什么 | `AbstractQueuedSynchronizer`，JUC 核心抽象类，维护 `state` 和 CLH 队列，是 `ReentrantLock`、`Semaphore`、`CountDownLatch` 等的基础。 |
| 30 | `ThreadLocal` 为什么会造成内存泄漏 | `ThreadLocalMap` 的 Entry 以 `ThreadLocal` 弱引用为 key，key 被 GC 后 value 仍被强引用，无法回收；建议 `static final` 或在 `finally` 中 `remove()`。 |
| 31 | 线程池 7 大参数 | `corePoolSize`、`maximumPoolSize`、`keepAliveTime`、`TimeUnit`、`workQueue`、`ThreadFactory`、`RejectedExecutionHandler`。 |
| 32 | 线程池运行流程 | 核心线程满 → 入队 → 队列满 → 扩容到最大线程 → 仍满则执行拒绝策略。 |
| 33 | 线程池拒绝策略 | AbortPolicy（抛异常）、CallerRunsPolicy（调用者执行）、DiscardPolicy（静默丢弃）、DiscardOldestPolicy（丢弃最老任务）。 |
| 34 | `ConcurrentHashMap` 如何保证线程安全 | JDK 1.7 分段锁 Segment；JDK 1.8 CAS + `synchronized` 锁头节点，粒度更小，扩容多线程协作。 |
| 35 | 死锁四个条件与解决 | 互斥、占有并等待、不可抢占、循环等待；解决：按统一顺序加锁、设置超时、死锁检测与恢复。 |
| 36 | `wait` 与 `sleep` 区别 | `wait` 释放锁和 CPU，必须持有对象锁；`sleep` 只释放 CPU，不释放锁。 |
| 37 | 保证线程安全的手段 | 互斥锁（`synchronized`/`Lock`）、线程安全容器（`ConcurrentHashMap` 等）、无状态设计、`ThreadLocal`、原子类。 |

> 💡 补充：阿里规约要求线程池必须手动通过 `ThreadPoolExecutor` 创建，禁止使用 `Executors` 的便捷方法（有 OOM 风险）。

---

## 五、Spring 生态

| # | 问题 | 关键答案 |
|---|------|---------|
| 38 | Spring Boot 自动装配原理 | `@EnableAutoConfiguration` → `AutoConfigurationImportSelector` → 读取 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Spring Boot 3.x；2.x 为 `spring.factories`）→ 条件装配 `@Conditional`。 |
| 39 | Spring 如何解决循环依赖 | 仅支持 setter/field 注入的循环依赖，通过三级缓存（singletonObjects/earlySingletonObjects/singletonFactories）暴露早期引用；构造器注入无法解决。 |
| 40 | `@Transactional` 事务失效场景 | 非 public 方法、内部调用、异常被 try-catch 吞掉、timeout 过小、数据库引擎不支持事务、未配置对非 RuntimeException 回滚。 |
| 41 | Spring MVC 工作流程 | `DispatcherServlet` → `HandlerMapping` → `HandlerAdapter` → 执行 Handler → `ModelAndView` → `ViewResolver` → 渲染视图返回客户端。 |
| 42 | Spring Bean 作用域 | `singleton`（默认）、`prototype`、`request`、`session`、`global-session`（Spring 5 已移除）。 |
| 43 | Spring Bean 线程安全吗 | 与 Spring 无关，取决于 Bean 是否有状态；无状态单例安全，有状态单例不安全。 |
| 44 | 拦截器与过滤器区别 | 过滤器属于 Servlet 规范，基于回调，先执行；拦截器属于 Spring，基于 AOP/反射，更接近业务。 |
| 45 | Spring 中常用的设计模式 | 工厂模式（`BeanFactory`）、单例模式（容器单例）、代理模式（AOP）、模板方法（`JdbcTemplate`）、观察者模式（事件监听）。 |

> 💡 补充：Spring Boot 简化了配置，但构建 Web 项目仍需 Spring MVC；Spring Cloud 解决分布式问题（注册发现、配置、熔断、网关等）。

---

## 六、MySQL / Redis / MQ

### MySQL

| # | 问题 | 关键答案 |
|---|------|---------|
| 46 | InnoDB 与 MyISAM 区别 | InnoDB 支持事务、行锁、MVCC、外键、崩溃恢复；MyISAM 表锁、不支持事务，适合读多写少。 |
| 47 | 事务 ACID 与隔离级别 | A 原子性、C 一致性、I 隔离性、D 持久性；隔离级别：RU、RC、RR（InnoDB 默认）、Serializable。 |
| 48 | MVCC 原理 | 多版本并发控制，依赖隐藏字段（DB_TRX_ID、DB_ROLL_PTR）、Undo Log、Read View 实现快照读，解决不可重复读和幻读。 |
| 49 | 索引为什么用 B+ 树 | B+ 树非叶子节点只存 key，叶子节点存数据并链表相连；单次 IO 装载更多索引，范围查询和顺序读取效率高。 |
| 50 | 索引失效常见原因 | 不满足最左前缀、对列做函数/运算、隐式类型转换、`is not null`、全表扫描更优、like `%xxx` 前缀模糊。 |
| 51 | 慢查询如何优化 | 开慢查询日志 → `EXPLAIN` 分析执行计划 → 加合适索引 → 优化 SQL → 分库分表/读写分离/缓存。 |

### Redis

| # | 问题 | 关键答案 |
|---|------|---------|
| 52 | Redis 为什么快 | 纯内存操作、单线程避免上下文切换、高效数据结构、IO 多路复用（epoll）、RESP 协议简单。 |
| 53 | Redis 持久化方式 | RDB（快照，恢复快但可能丢数据）、AOF（日志，数据安全但文件大）、混合持久化（RDB + AOF）。 |
| 54 | 缓存穿透/击穿/雪崩 | 穿透：缓存与 DB 都不存在，用布隆过滤器/空值缓存；击穿：热点 key 过期，用互斥锁/逻辑过期；雪崩：大量 key 同时失效，加随机 TTL/集群/限流。 |
| 55 | Redis 分布式锁 | `SET key value NX EX seconds`；防止误删用 Lua 判断 value；生产环境推荐 Redisson。 |
| 56 | Redis 集群模式 | 主从复制、哨兵模式（高可用）、Cluster 模式（分片 + 自动故障转移）。 |

### MQ

| # | 问题 | 关键答案 |
|---|------|---------|
| 57 | 消息丢失如何处理 | 生产者：重试/事务消息；Broker：同步刷盘 + 集群复制；消费者：业务处理完再 ack。 |
| 58 | 消息重复消费如何处理 | 业务幂等：数据库唯一索引、状态机去重、记录已消费消息 ID。 |
| 59 | 消息积压如何处理 | 定位消费慢原因；扩容队列和消费者；临时将消息转储到新队列并行消费；修复消费逻辑。 |

> 💡 补充：MySQL 默认 RR 隔离级别下仍可能出现幻读，彻底解决需加 `for update` 间隙锁或提升隔离级别到 Serializable。

---

## 七、设计模式

| # | 问题 | 关键答案 |
|---|------|---------|
| 60 | Spring 中用了哪些设计模式 | 工厂（BeanFactory）、单例（容器 Bean）、代理（AOP/JDK/CGLIB）、模板方法（JdbcTemplate）、观察者（ApplicationEvent）、适配器（HandlerAdapter）、装饰器（事务包装）。 |
| 61 | 单例模式实现方式 | 饿汉式、懒汉式（线程不安全）、DCL + `volatile`、`静态内部类`、`Enum`（最推荐，防反射和序列化破坏）。 |
| 62 | 代理模式分类 | 静态代理、JDK 动态代理（实现接口）、CGLIB 动态代理（继承类）；Spring AOP 默认策略：有接口用 JDK 动态代理，无接口用 CGLIB（Spring Boot 2.x+ 默认统一使用 CGLIB）。 |

> 💡 补充：不要为了用设计模式而过度设计；面试中结合具体项目讲“为什么用、解决了什么问题”更容易得分。

---

## 八、场景题与系统设计

| # | 问题 | 关键答案 |
|---|------|---------|
| 63 | 如何设计一个秒杀系统 | 页面静态化 + CDN；库存预热到 Redis；Redis 原子扣减库存；MQ 异步下单削峰；限流/答题/验证码防刷；数据库分库分表 + 乐观锁防超卖。 |
| 64 | 扫码登录流程 | Web 请求二维码 ID 并轮询；App 扫码后通知服务端变为“待确认”；用户确认后服务端生成正式 Token 返回 Web。 |
| 65 | 订单重复提交/支付 | 前端防抖；后端 token 幂等（一次 token 只能生成一个订单）；订单状态机 + 唯一索引保证支付幂等。 |
| 66 | 100 亿数据找 Top 1000 | 小顶堆 O(N log K)；或分治法：分片求各片 Top K，再汇总求全局 Top K；海量数据考虑 MapReduce。 |
| 67 | 服务器响应慢如何排查 | `top`/`uptime` 看 CPU 负载 → `ps` 定位线程 → 线程 ID 转十六进制 → `jstack` 抓取栈信息 → 分析热点代码/GC/死锁。 |

> 💡 补充：场景题没有标准答案，重点体现“分层解耦、限流降级、异步化、幂等、监控”的分布式系统设计思维。

---

## 九、常见坑与补充

> 💡 补充：`HashMap` 并发环境下不要用 `Collections.synchronizedMap` 简单包装应付高并发，优先用 `ConcurrentHashMap`。

> 💡 补充：`synchronized` 锁的对象一定要是同一个 final 对象，否则锁失效；避免锁字符串常量池对象。

> 💡 补充：Spring 中同类方法相互调用会导致 `@Transactional`、`@Async`、`@Cacheable` 等基于 AOP 的注解失效，因为绕过了代理对象。

> 💡 补充：Redis 做分布式锁必须设置过期时间，并保证“加锁 + 过期”原子性；解锁前判断 value 是否属于自己，避免误删他人锁。

> 💡 补充：MySQL `count(*)`、`count(1)`、`count(id)`、`count(列)` 在 InnoDB 中性能差异不大；但 `count(列)` 会忽略 NULL，语义不同。

> 💡 补充：线上线程池、连接池大小不是越大越好，需结合 CPU 核数、任务类型（IO/计算密集）、RT 目标综合评估。

---

## 📚 完整资料
- [archive/old-interview-notes/Java面试汇总.md](../archive/old-interview-notes/Java面试汇总.md)

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-22 | 订正 | ZGC 非 JDK 15+ 默认 GC（G1 仍是默认）；Spring Boot 自动装配补充 3.x 新机制；Spring AOP 代理默认策略补充 Spring Boot 2.x+ 默认 CGLIB |
| 2026-07-22 | 审查 | 全面审查，其余 64 道题答案正确 |
