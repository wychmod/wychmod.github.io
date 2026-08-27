# Java 基础

> 预计阅读：约 24 分钟（正文约 7666 字）
> 阅读建议：先读 Java 语言基础，再把工程项目入口当作索引浏览；需要运行时原理转到 JVM，企业开发转到 Spring 生态。

---

> 拆分说明：原“Java 与 JVM”已经拆为三条主线，本文件保留旧路径以兼容历史链接，正文只聚焦 Java 基础。

## 一、Java 基础

> 📚 完整 Java 原始笔记见 [`archive/old-java-notes`](/md/archive/README?id=old-java-notes)；JVM 与 Spring 已拆到独立主线。

### 1.1 核心概念

这一篇只承载 Java 语言基础和 Java 工程入口。JVM 运行机制、GC、调优已经拆到 [JVM 运行机制](/md/01-计算机基础/05-JVM运行机制.md)，Spring / SSM / Spring Boot 内容统一放到 [Spring 生态](/md/01-计算机基础/50-Spring生态.md)。

- **JDK / JRE**：JDK 是开发工具包，包含编译器、运行环境和诊断工具；JRE 是运行 Java 程序的环境。
- **源码与字节码**：`.java` 源码经 `javac` 编译为 `.class` 字节码，再交给 JVM 执行。
- **跨平台**：Java 的跨平台来自“编译成统一字节码 + 不同平台 JVM 负责执行”。
- **面向对象**：Java 以类和对象组织代码，封装状态、暴露行为，再通过继承和多态扩展。
- **标准库**：常用能力集中在 `java.lang`、`java.util`、`java.io`、`java.nio`、`java.time`、`java.util.concurrent`。

**8 种基本数据类型与包装类**：

| 类型 | 位数 | 包装类 |
|---|---|---|
| byte / short / int / long | 8 / 16 / 32 / 64 | Byte / Short / Integer / Long |
| float / double | 32 / 64 | Float / Double |
| char | 16 | Character |
| boolean | - | Boolean |

- 基本类型存储成本低、访问直接；对象通过引用访问。
- 集合只能存引用类型，故需装箱：自动装箱 = `包装类.valueOf()`，拆箱 = `xxxValue()`。

**值传递 vs 引用传递**：

- Java **只有值传递**：基本类型复制值本身；对象传递的是“引用的拷贝”。
- 修改对象内容对调用方可见；替换引用指向新对象对调用方不可见。

**String 不可变与字符串常量池**：

- String 一经创建不可修改，“改变”只是改引用指向。
- 字面量走常量池复用；`new String` 在堆中新建对象，`==` 与 `equals` 的差异由此产生。
- StringBuilder 是可变字符序列；StringBuffer 是线程安全前身，效率更低；编译器会把 `+` 拼接优化为 StringBuilder。

**泛型与通配符**：

- 泛型把类型参数化，编译期检查以减少 ClassCastException。
- `? extends Number` 设上限偏读，`? super Integer` 设下限偏写。
- Java 7 起可省略钻石操作符中的重复类型。

**反射与注解（框架两大基石）**：

- 反射：运行时构造对象、读写属性、调用方法；获取 Class 三种方式：`类名.class` / `对象.getClass()` / `Class.forName`。
- `setAccessible(true)` 可突破私有访问限制。
- 注解：嵌入字节码的元数据；核心元注解 `@Retention`（SOURCE / CLASS / RUNTIME）与 `@Target`，运行期注解可通过反射读取。

### 1.2 三大特性

- **封装**：private + getter/setter
- **继承**：extends + super
- **多态**：父类引用指向子类对象

**接口 vs 抽象类**：

| 对比 | 抽象类 | 接口 |
|---|---|---|
| 定位 | 模板设计 | 行为规范 |
| 成员 | 可含成员变量与非抽象方法 | 方法默认 public abstract，变量默认 public static final |
| 继承 | 类单继承 | 类可多实现、接口可多继承 |
| Java 8+ | - | 支持 default / static 方法 |

**方法重写 vs 方法重载**：

| 对比 | 重载 Overload | 重写 Override |
|---|---|---|
| 范围 | 同类中方法名同、参数不同 | 子类重定义父类方法 |
| 绑定 | 编译期 | 运行期（多态的实现方式） |
| 限制 | - | 签名相同、访问权限不能缩小 |

- 重写建议加 `@Override`

### 1.3 异常处理

- **Throwable** 分 **Error**（不应捕获的严重错误）与 **Exception**；Exception 再分**检查异常**（编译器强制处理）与**非检查异常**（RuntimeException）

```
Throwable
├─ Error               ← 不应捕获
└─ Exception
   ├─ 检查异常          ← 编译器强制处理
   └─ RuntimeException ← 非检查异常
```

- **try-catch-finally / throw / throws**：捕获与声明抛出
- **自定义异常**：继承 RuntimeException

### 1.4 核心包

- `java.lang`：基础（String / Object / Math）
- `java.util`：集合（List / Set / Map）
- `java.io / nio`：IO / NIO
- `java.util.concurrent`：并发（JUC）
- `java.net`：网络
- `java.time`：日期时间（Java 8+）

**序列化（java.io）**：

- 实现 `Serializable`（纯标识接口）才能序列化，否则抛 NotSerializableException
- `transient` 修饰的变量序列化时被忽略（反序列化后为默认值）
- 类可自定义 `writeObject` / `readObject` 控制序列化内容 -> ArrayList 只序列化实际元素的原理

### 1.5 集合框架

| 类型 | 实现类 | 特点 |
|---|---|---|
| **List** | ArrayList / LinkedList | 有序可重复 |
| **Set** | HashSet / TreeSet | 去重 |
| **Map** | HashMap / TreeMap / ConcurrentHashMap | KV |
| **Queue** | LinkedList / PriorityQueue | 队列 |

**底层数据结构与扩容**：

| 实现类 | 底层结构 | 要点 |
|---|---|---|
| ArrayList | Object[] 动态数组 | 默认容量 10，满时扩容 1.5 倍；实现 RandomAccess |
| LinkedList | 双向链表 | 增删快、随机访问慢 |
| HashSet | 底层就是 HashMap | - |
| TreeSet / TreeMap | 红黑树 | 有序 |
| LinkedHashSet / LinkedHashMap | 额外维护双向链表 | 保持插入 / 访问顺序 |

**equals 与 hashCode 契约**：

- equals 相等则 hashCode 必相等；hashCode 相等对象不一定 equals 相等
- 重写 equals 必须同时重写 hashCode，否则 HashSet / HashMap 中"相等"对象会重复
- HashSet 判重流程 = 先比 hashCode 再调 equals

**HashMap 底层原理（JDK8）**：数组 + 链表 + 红黑树

| 参数 | 值 | 说明 |
|---|---|---|
| 默认容量 | 16 | 容量恒为 2 的幂（位运算等价取模且更快） |
| 负载因子 | 0.75 | 超阈值容量翻倍 |
| 树化条件 | 链表长度 > 8 且数组长度 ≥ 64 | 否则先扩容 |
| 定位桶 | (n-1)&hash | 扰动函数处理后 |
| null | 允许 null 键值 | - |

- 并发问题：JDK7 并发扩容会形成环形链表死循环；1.8 已修但多线程仍可能丢数据 -> 应用 ConcurrentHashMap

**集合线程安全与 ConcurrentHashMap 演进**：

- ArrayList / HashMap 等常用集合均线程不安全；Hashtable 全表 synchronized 已淘汰
- ConcurrentHashMap：JDK1.7 用 Segment 分段锁（ReentrantLock）；1.8 改为 CAS + synchronized 只锁桶首节点
- 读多写少用 CopyOnWriteArrayList；另有 ConcurrentLinkedQueue / BlockingQueue

**fail-fast 与 fail-safe**：

- fail-fast：迭代器遍历时校验 modCount，遍历期间被结构性修改（含单线程）即抛 ConcurrentModificationException
- fail-safe：容器遍历的是拷贝、不抛异常
- 遍历中安全删除用 `iterator.remove()` 或 Stream filter

**Comparable vs Comparator**：

| 对比 | Comparable | Comparator |
|---|---|---|
| 所在包 | java.lang | java.util |
| 用途 | 自然排序（compareTo） | 定制排序（compare） |
| 场景 | 类自身定义排序 | 同一对象多种排序规则 |
| 用法 | 实现接口 | `Collections.sort(list, comparator)` 或 TreeMap 构造器 |

### 1.6 多线程基础

- **Thread / Runnable / Callable**
- **synchronized / Lock / ReentrantLock**
- **volatile / ThreadLocal**
- **线程池**：core / max / queue / keepAlive

**JMM 可见性与有序性（入门）**：

- 根源是 CPU 多级缓存与指令重排（as-if-serial 只保证单线程结果不变）
- volatile 两大作用 = 线程可见性 + 禁止指令重排（JVM 层读写两侧加内存屏障）
- 深入内存屏障、运行时数据区与对象布局见 [JVM 运行机制](/md/01-计算机基础/05-JVM运行机制.md)
- synchronized 底层则是 monitorenter / monitorexit + lock cmpxchg

**双检锁（DCL）单例必须加 volatile**：

```java
private static volatile Singleton instance;

public static Singleton getInstance() {
    if (instance == null) {              // 第一次检查
        synchronized (Singleton.class) {
            if (instance == null)        // 第二次检查
                instance = new Singleton();
        }
    }
    return instance;
}
```

- 防止 `new` 的指令重排让其他线程拿到只赋了默认值的半初始化对象

### 1.7 Java 8 函数式

- 只有一个抽象方法的接口即**函数式接口**（`@FunctionalInterface`）
- 内置四大核心函数式接口：Consumer / Supplier / Function / Predicate
- **Stream 声明式处理集合**：
  - 中间操作惰性求值：filter / map / sorted / distinct / limit
  - 终端操作：forEach / count / collect
  - 流只能消费一次

## 二、Java 工程与项目实践

> 📚 完整 Java 项目笔记见 [`archive/old-java-notes`](/md/archive/README?id=old-java-notes)；Spring/SSM 与 Spring Boot + Vue 项目部署已迁入 [Spring 生态](/md/01-计算机基础/50-Spring生态.md)。

- **手写 RPC**：Netty + 动态代理
- **Netty**：高性能网络通信框架（RPC 底层）
- **统一消息系统**：MQ 削峰 + 多渠道下发
- **抽奖系统**：DDD 架构 + 高并发设计
- **短链系统**：Hash + Base62 + 分库分表
- **JVM 插桩监控**：见 [JVM 运行机制](/md/01-计算机基础/05-JVM运行机制.md)
- **自动化测试平台**：JMeter 集成 + 性能压测

### 2.1 手写 RPC

**四大角色与调用流程**：

- 角色 = 服务提供者 + 注册中心 + 服务消费者 + 监控中心（监控中心可增减，前三者必需）
- 链路：提供者注册服务列表 -> 消费者订阅 -> 注册中心推送变更 -> 负载均衡选址 -> 消费者动态代理将接口名 / 方法名 / 参数类型列表 / 参数列表序列化成字节流发送 -> 提供者解码反序列化 -> 执行并编码返回 -> 消费者解码处理

**关键机制**：

- **注册发现**：必须"主动通知 + 心跳检测"，防止断网 / 宕机 / 崩溃后注册中心残留无效服务列表
- **协议与序列化**：分布式下 RPC 性能要求极高，协议实现越简单越好（可基于 HTTP / TCP / UDP 或自定义协议）；序列化选高效框架：FastJson / Kryo / Hessian / Protobuf
- **线程模型**：IO 线程负责事件轮询、编解码、传输（Dubbo 用 Netty 的 Boss/Worker 线程池即 IO 线程，Reactor 模型）；涉及复杂计算或数据库访问必须切到业务线程，以免阻塞 IO 线程；Dubbo 提供 5 种可配置线程分发策略

**四种调用方式**：

| 方式 | 机制 |
|---|---|
| Sync 同步 | 框架内部本质是异步转同步（如 Dubbo），须设超时时间 |
| Future 异步 | 结果被缓存，主动 get 时才阻塞 |
| Callback 回调 | 实现 success / fail 两方法，结果到达时回调 |
| Oneway 单向 | 不关心返回 |

**动态代理技术选型**：

| 技术 | 特点 |
|---|---|
| JDK 代理 | 必须实现接口（生成类继承 Proxy），反射调用性能低 |
| Cglib | 基于 ASM 生成子类（被代理类不能 final），FastClass 索引直调性能更高 |
| Javassist / ASM | 直接操作字节码、性能高于反射 |
| Byte Buddy | API 最友好 |

- 代理类生成速度与字节码大小直接影响 RPC 整体性能

**负载均衡四算法**：

- 轮询（不考虑节点实际负载）；加权轮询（按权重分流量，可按实时负载调整）；最少连接数；一致性 Hash（Hash 环上顺时针找最近节点，节点上下线不会引起对象大规模迁移）

**服务元数据三要素**：

- 服务名称（接口完整类名）+ 版本号 + 服务分组，三者唯一确定一个服务提供者
- 地址 / 端口 / 注册中心地址在工程级统一配置、不进注解
- 消费者注解需配置注册中心地址与类型、负载均衡、序列化类型、超时、同步 / 异步 / 单向、代理方式；服务名称从注册中心获取、无需配置

### 2.2 Netty

**为什么需要 Netty（JDK NIO 痛点）**：

- 原生 NIO 类库繁杂；断连重连、网络闪断、半包读写等可靠性补齐工作量大
- JDK NIO 臭名昭著的 epoll 空轮询 bug 可致 CPU 100% 且未根治
- Netty 修复所有已知 NIO bug、综合性能最优；Dubbo、Hadoop Avro 等主流 RPC 均以其作底层通信

> 📚 五种 IO 模型与 epoll 详解见 [计算机系统与并发](/md/01-计算机基础/30-计算机系统与并发.md)

**Reactor 三种线程模型**：

| 模型 | 结构 | 评价 |
|---|---|---|
| 单线程模型 | 所有 IO 一个线程 | 无法利用多核、可靠性差，基本不用 |
| 多线程模型 | 1 个 acceptor 线程接连接 + IO 线程池读写编解码 | - |
| 主从 Reactor | mainReactor 只负责接连接，subReactor 负责读写（1+M+N 线程模式） | Nginx / Memcached / Netty 均采用；subReactor 数通常等于 CPU 核数 |

**核心组件模型**：

- **BossGroup / WorkerGroup**：对应主从 Reactor 的 mainReactor / subReactor
- **NioEventLoop**：内含 Selector，循环执行 select -> processSelectedKeys -> runAllTasks 三步；一个 EventLoop 可服务多个 Channel
- **ChannelHandler** 为业务处理器；**ChannelPipeline** 为保存 Handler 与 Context 的双向链表，且与 Channel 互相引用
- **ByteBuf**：性能优于 NIO ByteBuffer

**异步模型与启动配置要点**：

- 所有 IO 操作异步：通过 ChannelFuture 注册监听器，在操作成功 / 失败时回调
- ServerBootstrap 配置区分：`option()` 给 ServerSocketChannel（如 SO_BACKLOG）、`childOption()` 给 SocketChannel（如 SO_KEEPALIVE）；`handler()` / `childHandler()` 分别对应 Boss 与 Worker

### 2.3 统一消息系统（Austin）

**架构与数据流**：

- 实时消息：业务方直调 austin-api 接入
- 定时 / 非实时消息：austin-admin -> austin-web -> austin-cron 到点调 austin-api
- api 只做参数校验即写 MQ；austin-handler 消费并完成拼装、去重、限流、渠道模板格式化后分发下发

**关键机制**：

- **MQ 削峰解耦**：接入层与处理层之间用 MQ 异步化，扛瞬时高并发，避免外部通道（如短信 API 慢）拖垮业务方甚至雪崩
- **多渠道适配**：handler 多通道下发（短信 / 邮件 / 钉钉 / 企业微信 / 飞书 / 微信服务号 / 微信小程序），屏蔽第三方接口差异，对业务方提供统一 API
- **消息数据旁路闭环**：发送日志与状态另写一条 MQ，旁路分流至 austin-stream（实时计算送达率、耗时等监控指标）与 austin-data-house（离线归档供报表分析），形成"发-看-查"的完整消息生命周期管理

### 2.4 抽奖系统

**DDD 四层架构与模块分离**：

- application（组合编排）/ domain（领域服务 + 充血模型）/ infrastructure（仓储 + 依赖反转）/ interfaces 四层职责划分
- 引入 RPC 后为避免循环依赖：应用层不再向领域层定义接口、仓储定义从领域层剥离、RPC 接口独立成 Jar 供外部调用

**两种概率算法与斐波那契散列**：

- **总体概率算法**：奖品抽空后剩余概率按比例均分（随机数与阶梯区间循环比对 O(n)）
- **单项概率算法**：概率固定、散列数组直接索引 O(1)、抽中已空奖品记未中奖（运营控成本常用）
- 策略模式统一封装；斐波那契散列（黄金分割 0x61c88647，ThreadLocal 同款）保证散列均匀减少碰撞

**设计模式综合落地**：

- 模板模式编排抽奖流程；简单工厂分发发奖领域；状态模式管理活动状态流转（提审 / 上线等）
- 组合模式 + rule_tree / rule_tree_node / rule_tree_node_line 三表实现量化人群的规则引擎（按性别 / 年龄 / 消费筛选参与资格）

**自研 DBRouter 分库分表组件**：

- `@DBRouter` 注解 + AOP 切面拦截 + ThreadLocal 记录路由结果 + AbstractRoutingDataSource 动态切换数据源 + 仿 HashMap 扰动函数哈希寻址 + Mybatis 拦截器改写表名
- 并扩展编程式事务（水平拆分 user_001 / user_002 场景）

**MQ 解耦发货与补偿**：

- 抽奖后发 Kafka 发货单解耦发货流程；user_strategy_export.mq_state 记录发送状态，失败由 xxl-job 定时任务扫描补偿重发
- 消费端必须幂等，否则重试会导致重复发奖资损

**滑动库存分布式锁防超卖**：

- Redis setNx 加锁但细化粒度：锁 key = 活动ID + 库存占用编号（如 100001_1），避免粗锁导致"有库存却秒杀失败"
- 缓存扣减后发 MQ 异步更新 DB（`UPDATE ... WHERE stock_surplus_count >`）保最终一致；TPS 更高时对库存分片横向扩展

### 2.5 短链系统

**MurmurHash + Base62 + 302 重定向**：

- MurmurHash 非加密、高性能低碰撞（32 位约 43 亿容量），转 62 进制缩短码长，可拼接库表位
- 重定向选 **302 临时重定向**而非 301，才能统计点击数据和支持拉黑

**分库分表：中间件选型与 Sharding-JDBC 核心概念**：

- 选型对比：ShardingSphere / MyCat / TDDL / Vitess / DRDS；代理层 vs 客户端直连差异
- 核心术语：逻辑表 / 真实表 / 数据节点 / 分片键 / 绑定表 / 广播表 / Hint 强制路由、SQL 改写与归并引擎

**C 端解析与 B 端查询路由冲突的多方案**：

- 短链码与账号两个维度查询在分库分表后路由冲突，演进方案：冗余双写 + 分布式事务、单一 Partition Key、免迁移扩容库表设计
- 另含海量数据冷热数据归档处理

**微服务拆分与双 MQ 选型**：

- cloud-account（账号 + 流量包）/ cloud-link（短链）/ cloud-gateway / cloud-shop（商品 + 支付）/ cloud-data / cloud-app（Flink + Kafka 实时计算）
- 业务用 RabbitMQ、大数据流式用 Kafka 的双 MQ 选型理由

**流量包高并发扣减与幂等**：

- traffic_task 任务表用 lock_state（LOCK / FINISH / CANCEL）+ message_id 唯一键实现扣减幂等与锁定回滚
- 配合海量数据下流量包过期 / 每日更新的定时处理方案

**@Async 异步与线程池实践**：

- @EnableAsync + 自定义 ThreadPoolTaskExecutor 处理日志 / 短信等 IO 异步
- 坑点：@Async 方法上标 @Transactional 无效、同类内直接调用不走代理
- IO 密集型核心线程数设为 2 倍 CPU 核数

### 2.6 自动化测试平台

**三大引擎与监控栈架构**：

- 接口自动化引擎、UI 自动化引擎（Selenium4 封装）、压测引擎三大核心模块，SaaS 化免部署
- 可视化监控告警用 InfluxDB + Grafana + Prometheus 时序栈
- 模块划分为 cloud-account / common / data / engine / gateway

**JMeter 核心概念与命令行压测**：

- 线程组三要素：线程数（= 虚拟用户）/ Ramp-Up 启动时长 / 循环次数，另加调度器
- Sampler 采样器、监听器（结果树 / 聚合报告）
- Linux 非 GUI 压测：`jmeter -n -t jmx -l jtl -e -o report`；存在多接口批量压测痛点

**内嵌 StandardJMeterEngine 二次开发**：

- 方案对比：Runtime.exec 调外部进程可维护性差、难平台化 -> 改为 Java 服务内嵌 JMeter 源码
- JMeterUtils.loadJMeterProperties / setJMeterHome 初始化环境；SaveService.loadTree 加载 HashTree
- 支持本地上传 JMX 与在线创建测试计划两种录入

**自定义压测结果收集**：

- 继承 ResultCollector 重写 sampleOccurred 逐样本收集压测数据
- SamplingStatCalculator 按采样器维度统计样本数 / 平均 / 最大最小耗时
- 可整合 Kafka 实时上报与持久化，云端生成可视化报告

### 2.7 雪花算法（分布式唯一 ID）

- Twitter 开源的分布式唯一 ID 算法，生成 64 位 long：

| 分段 | 位数 | 说明 |
|---|---|---|
| 符号位 | 1 | - |
| 毫秒时间戳 | 41 | 约 69 年不重复 |
| 机器标识 | 10 | 1024 节点 |
| 序列号 | 12 | 单节点每毫秒 4096 个 |

- 趋势递增、不依赖第三方组件；检测到时钟回拨则拒绝生成

## 三、2026 年 Java 生态

| 维度 | 主流 |
|---|---|
| Java 版本 | Java 21 LTS 是稳态主线；Java 25 已在 2025-09 发布，生产采纳通常随团队节奏推进 |
| 构建 | Maven / Gradle |
| 测试 | JUnit 5 + Mockito + Testcontainers |
| 并发 | JUC、CompletableFuture、虚拟线程（Project Loom） |
| 性能 | OpenJDK / GraalVM / JVM 参数与 GC 日志分析 |
| 企业开发 | Spring 相关内容独立见 [Spring 生态](/md/01-计算机基础/50-Spring生态.md) |

学习顺序建议：先补 Java 语法、集合和异常，再读并发入门；需要理解运行时行为时转到 JVM；进入企业开发和微服务时转到 Spring 生态。

---

## 📚 完整资料

> **原文归档**：[`archive/old-java-notes`](/md/archive/README?id=old-java-notes)
> 本篇只归纳 Java 基础、语言特性、集合、并发入门与 Java 项目入口；JVM 与 Spring 已拆分到独立主线。

- [`archive/old-java-notes`](/md/archive/README?id=old-java-notes) — Java 基础、Java 学习路线、Servlet、RPC、Netty、短链、抽奖、监控、自动化测试平台等原始笔记
- [`JVM 运行机制`](/md/01-计算机基础/05-JVM运行机制.md) — 类加载、运行时数据区、GC 与调优
- [`Spring 生态`](/md/01-计算机基础/50-Spring生态.md) — Spring Core / MVC / Boot / 事务 / Cloud / Security / SSM 项目落地

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-22 | 订正 | Extension ClassLoader 更名为 Platform（Java 9+） |
| 2026-07-22 | 订正 | Spring Boot 3.x 自动装配文件路径更新 |
| 2026-07-22 | 订正 | 标注 Zuul/Hystrix/Ribbon 已停维 |
| 2026-07-22 | 订正 | Java 版本现状更新为 21 LTS |
| 2026-07-22 | 审查 | 全面审查，核心内容完备 |
| 2026-08-18 | 订正 | 修复归档目录链接：Docsify 无法渲染目录路由，统一指向归档来源地图或直接 GitHub 目录 |
| 2026-08-18 | 订正 | 将归档来源地图链接从相对路径改为绝对 Docsify 路由 /md/archive/README?id=xxx，避免生成 #/../archive/README 导致 404 |
| 2026-08-23 | 重构 | Spring 生态独立成篇（50-Spring生态.md），本文件第三节改为概览并指向新文档 |
| 2026-08-23 | 新增 | 按分区核对报告（J1/J2/J3）补全：Java 基础 / 集合 / 并发 / JVM 知识点归位扩充（含类加载、双亲委派、混合执行、HashMap、volatile DCL、GC Roots、晋升、CMS、三色标记、调优排查），实战项目扩为 9 个小节（RPC / Netty / 统一消息 / 抽奖 / 短链 / 监控 / 测试平台 / 前后端分离 / 雪花算法），SSM 补 Servlet，字节码表述修正为混合模式 |
| 2026-08-26 | 重构 | 统一前置阅读时间/建议，原文归档移至文末 |
| 2026-08-26 | 重构 | 按用户反馈拆分 Java / JVM / Spring：本篇聚焦 Java 基础与 Java 项目入口，JVM 调优移入 05-JVM运行机制.md，Spring/SSM/Boot 项目内容迁入 50-Spring生态.md |