# Java 与 JVM

> **原文归档**：[`archive/old-java-notes/`](/md/archive/README?id=old-java-notes) + [`archive/old-jvm-notes/`](/md/archive/README?id=old-jvm-notes) + [`archive/old-spring-notes/`](/md/archive/README?id=old-spring-notes)
> 包含：60+ 文件（Java 基础 / Spring 全家桶 / JVM / 手写 RPC / Netty / 统一消息系统 / 短链 / 抽奖 / 监控 / 自动化测试 / 前后端分离部署）

---

## 一、Java 基础

> 📚 完整 Java 笔记见 [`archive/old-java-notes/`](/md/archive/README?id=old-java-notes)

### 1.1 核心概念

- **JVM**：Java 虚拟机，跨平台基础
- **JDK / JRE**：开发工具包 / 运行环境
- **字节码**：`.class` 文件；JVM 默认以**解释器 + JIT 混合模式**执行（详见下）
- **类加载器**：Bootstrap / Platform（Java 9+ 原 Extension）/ AppClassLoader
- **双亲委派**：类加载的安全机制

**解释器 + JIT 混合执行模式**：

- JVM 默认混合模式（`-Xmixed`）：启动阶段解释执行，热点代码触发 JIT 编译为机器码
- 热点探测：方法调用计数 / 循环回边计数，超过阈值（`-XX:CompileThreshold` 默认 10000）触发编译
- `-Xint` 纯解释：启动快、执行慢；`-Xcomp` 纯编译：相反

**8 种基本数据类型与包装类**：

| 类型 | 位数 | 包装类 |
|---|---|---|
| byte / short / int / long | 8 / 16 / 32 / 64 | Byte / Short / Integer / Long |
| float / double | 32 / 64 | Float / Double |
| char | 16 | Character |
| boolean | - | Boolean |

- 基本类型存栈上、高效；对象存堆
- 集合只能存引用类型，故需装箱：自动装箱 = `包装类.valueOf()`，拆箱 = `xxxValue()`

**值传递 vs 引用传递**：

- Java **只有值传递**：基本类型复制值本身；对象传递的是"引用的拷贝"（传共享对象）
- 修改对象内容对调用方可见；替换引用（指向新对象）对调用方不可见

**String 不可变与字符串常量池**：

- String 一经创建不可修改，"改变"只是改引用指向
- 字面量走常量池复用；`new String` 在堆中新建对象 -> `==` 与 `equals` 差异的根源
- StringBuilder 可变字符序列；StringBuffer 是其线程安全前身（效率低）；编译器会把 `+` 拼接优化为 StringBuilder

**泛型与通配符**：

- 泛型把类型参数化，编译期检查以消除 ClassCastException
- `? extends Number` 设上限（只读）；Java 7 起可省略钻石操作符

**反射与注解（框架两大基石）**：

- 反射：运行时构造对象 / 读写属性 / 调用方法；获取 Class 三种方式：`类名.class` / `对象.getClass()` / `Class.forName`
- `setAccessible(true)` 可突破私有
- 注解：可嵌入字节码的元数据；核心元注解 `@Retention`（SOURCE / CLASS / RUNTIME）与 `@Target`，通过反射读取 -> Spring 等框架的实现基础

**类加载全过程**：加载 -> 验证 -> 准备 -> 解析 -> 初始化 -> 使用 -> 卸载

- 准备阶段静态变量赋零值（`static final` 常量经 ConstantValue 在此阶段即赋指定值）；初始化才执行 `<clinit>` 赋真实值
- 触发初始化（主动引用）：`new` / 读写静态成员 / 反射 / 初始化子类先初始化父类 / 主类
- 被动引用不触发：引用父类静态字段、定义对象数组、引用 `static final` 常量

**双亲委派的目的与打破**：

- 目的 = 安全（自定义类加载器无法篡改 `java.lang.String` 等核心类）+ 避免重复加载
- 打破方式 = 重写 `loadClass()`；历史场景：JDK1.2 前的自定义加载器、ThreadContextClassLoader（SPI 基础类调实现类）、OSGi / Tomcat 热部署（同一类库多版本隔离）

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

### 1.6 多线程

- **Thread / Runnable / Callable**
- **synchronized / Lock / ReentrantLock**
- **volatile / ThreadLocal**
- **线程池**：core / max / queue / keepAlive

**JMM 可见性与有序性**：

- 根源是 CPU 多级缓存与指令重排（as-if-serial 只保证单线程结果不变）
- volatile 两大作用 = 线程可见性 + 禁止指令重排（JVM 层读写两侧加内存屏障）
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

## 二、JVM 调优

> 📚 [JVM实战 1-4](/md/archive/README?id=old-jvm-notes)（4 篇，30KB+）

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

**线程私有 vs 共享**：

- 线程私有（随线程创建销毁）：程序计数器 / 虚拟机栈 / 本地方法栈
- 线程共享：堆 / 方法区（含运行时常量池）
- 每个方法对应一个**栈帧** = 局部变量表 + 操作数栈 + 动态链接 + 返回地址

**对象创建过程与内存布局**：

- 创建 = 类加载链接初始化 -> 申请内存 -> 成员变量赋默认值 -> `<init>` 赋初始值
- 普通对象布局 = markword(8B) + ClassPointer（压缩后 4B）+ 实例数据 + 对齐填充（8 的倍数）；`new Object()` 共 16 字节
- markword 末 2 位是锁标志位、4 位存 GC 年龄 -> 这正是晋升年龄上限 15 的原因

**方法区演进：永久代 -> 元空间**：

- JDK8 起永久代（固定大小、FGC 不清理）被元空间取代
- 类元数据移至本地内存（不设上限则可达物理内存、可被 FGC 清理）
- 字符串常量池自 JDK7 起位于堆中

### 2.2 GC 算法

| 算法 | 思路 | 适用 |
|---|---|---|
| **标记-清除** | 标记存活对象，清除其余 | 老年代（CMS） |
| **复制** | 内存分两块，存活复制到另一块 | 年轻代（Serial / ParNew） |
| **标记-整理** | 标记存活，移到一端 | 老年代（Parallel Old） |
| **分代收集** | 不同代用不同算法 | HotSpot 默认 |

**垃圾判定：引用计数 vs GC Roots 可达性分析**：

- 引用计数实现简单但无法解决循环引用
- HotSpot 用**根可达算法**：从 GC Roots 出发搜索，不可达对象即垃圾 -> 这是所有标记类算法的前提

**对象何时进入老年代（晋升机制）**：

- ① 年龄达 MaxTenuringThreshold（默认 15，CMS 为 6）
- ② 动态年龄判断：Survivor 中同龄对象总大小超一半，该年龄及以上直接晋升
- ③ 大对象超 PretenureSizeThreshold 直接进老年代
- ④ 空间担保：YGC 时 Survivor 装不下直接进老年代
- 另：对象优先**栈上分配**（无逃逸 + 标量替换）或 **TLAB**（Eden 内线程私有缓冲，约 1%）

### 2.3 垃圾收集器

- **Serial / ParNew**：年轻代
- **CMS**：老年代（已淘汰）
- **G1**（默认）：分 Region，可预测停顿
- **ZGC / Shenandoah**：超低延迟（毫秒级）

**CMS 工作流程（四阶段）**：初始标记(STW) -> 并发标记 -> 重新标记(STW) -> 并发清除

**CMS 三大缺陷**：

- **内存碎片**：标记-清除产生；碎满退化为 Serial Old 单线程压缩，STW 可达数小时
- **浮动垃圾**：并发期间新垃圾留待下次
- **并发失败**：预留空间不足，可用 `-XX:CMSInitiatingOccupancyFraction` 调低触发阈值

**三色标记与漏标解决**：

- 并发标记中引用关系变化可致漏标（存活对象被当垃圾回收）
- 漏标需同时满足"黑->白新增引用"与"灰->白引用删除"两条件

| 收集器 | 漏标方案 | 思路 |
|---|---|---|
| CMS | 增量更新 | 关注新增引用，黑退灰重扫 |
| G1 | SATB 快照 | 关注引用删除；借 RSet 避免全堆扫描 |

### 2.4 调优参数

```bash
-Xms512m          # 初始堆
-Xmx2g             # 最大堆
-Xmn1g             # 年轻代
-XX:MetaspaceSize=256m
-XX:+UseG1GC       # 使用 G1
-XX:MaxGCPauseMillis=200
```

**调优目标与步骤**：

- 吞吐量 = 用户时间 /（用户时间 + GC 时间）：吞吐量优先选 PS + PO（科学计算 / 批处理）；响应时间优先选 CMS / G1（网站 / API）
- 步骤 = 熟悉业务 -> 选回收器组合 -> 压测预估内存 -> 设 GC 日志 -> 观察调整
- 常见手法：调大 Survivor 让 YGC 存活对象不进老年代，以减少 FGC

**线上排查工具链**：

- **CPU 100%**：top -> `top -Hp` 定位线程 -> jstack 导出栈定位方法（区分业务线程与 GC 线程）
- **内存飙高 / OOM**：`jmap -dump`（生产优先 `-XX:+HeapDumpOnOutOfMemoryError`）-> MAT 分析
- **日常观察**：jps / jinfo / `jstat -gc` / arthas（jad 反编译、watch 观测方法）
- **频繁 FGC 常见原因**：大对象 / 一次性加载过多数据、Survivor 过小、Metaspace 满、System.gc()、内存泄漏

## 三、Spring 生态

> 📚 本节为概览，详细内容已独立成篇：[Spring 生态](/md/01-计算机基础/50-Spring生态.md)（Core/Boot/事务/Cloud/源码学习线 + 全量归档索引）

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

- `@EnableAutoConfiguration` 读取 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Spring Boot 3.x；2.x 用 `spring.factories`）
- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`

### 3.4 Spring Cloud 核心

- **服务注册发现**：Eureka / Nacos / Consul
- **配置中心**：Spring Cloud Config / Nacos
- **API 网关**：Spring Cloud Gateway（Zuul 已停维）
- **熔断降级**：Sentinel / Resilience4j（Hystrix 已停维）
- **负载均衡**：Spring Cloud LoadBalancer（Ribbon 已停维）

## 四、实战项目

> 📚 完整实战笔记见 [`archive/old-java-notes/`](/md/archive/README?id=old-java-notes)

- **手写 RPC**：Netty + 动态代理
- **手写 Spring**：IoC + AOP 实现
- **Netty**：高性能网络通信框架（RPC 底层）
- **统一消息系统**：MQ 削峰 + 多渠道下发
- **抽奖系统**：DDD 架构 + 高并发设计
- **短链系统**：Hash + Base62 + 分库分表
- **监控**：javaagent 字节码插桩
- **自动化测试平台**：JMeter 集成 + 性能压测
- **前后端分离部署**：Spring Boot + Vue + Nginx

### 4.1 手写 RPC

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

### 4.2 Netty

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

### 4.3 统一消息系统（Austin）

**架构与数据流**：

- 实时消息：业务方直调 austin-api 接入
- 定时 / 非实时消息：austin-admin -> austin-web -> austin-cron 到点调 austin-api
- api 只做参数校验即写 MQ；austin-handler 消费并完成拼装、去重、限流、渠道模板格式化后分发下发

**关键机制**：

- **MQ 削峰解耦**：接入层与处理层之间用 MQ 异步化，扛瞬时高并发，避免外部通道（如短信 API 慢）拖垮业务方甚至雪崩
- **多渠道适配**：handler 多通道下发（短信 / 邮件 / 钉钉 / 企业微信 / 飞书 / 微信服务号 / 微信小程序），屏蔽第三方接口差异，对业务方提供统一 API
- **消息数据旁路闭环**：发送日志与状态另写一条 MQ，旁路分流至 austin-stream（实时计算送达率、耗时等监控指标）与 austin-data-house（离线归档供报表分析），形成"发-看-查"的完整消息生命周期管理

### 4.4 抽奖系统

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

### 4.5 短链系统

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

### 4.6 监控系统（javaagent 字节码插桩）

**JVMTI 与 javaagent 原理**：

- JVMTI 是开发 / 监控 JVM 的双通道接口，代理与目标 JVM 同进程通信
- JPDA 架构 = JVMTI + JDWP 传输协议 + JDI 高层 API
- javaagent 是 Java 1.5+ 基于 JVMTI 的特性，核心场景为类加载拦截修改与已加载类重定义

**premain 与 agentmain 两种启动方式**：

| 方式 | 启动 | 能力 |
|---|---|---|
| premain | `-javaagent:` 参数随目标应用启动 | 类加载前介入，可完整修改类 |
| agentmain | 借助 tools.jar 的 VirtualMachine.attach 向运行中进程注入 | 免重启，但只能修改部分逻辑、监控有限制 |

- agent jar 不能独立启动，只能附着于其他 JVM

**Instrumentation 核心 API**：

- `addTransformer` 注册 ClassFileTransformer 拦截类加载（配合 javassist 改字节码）
- `retransformClasses` 重新触发已加载类的转换（仅可改方法体指令，不可改继承 / 接口 / 方法签名等结构，需 Can-Retransform-Classes:true）
- `redefineClasses` 整体重定义；`getAllLoadedClasses` / `getObjectSize` 获取已加载类与对象大小
- 实践：方法性能统计、仿 arthas（attach 后经 RMI 暴露查找类 / 反编译能力）

**插桩点选择与 javassist 插桩技巧**：

- 通过 javaagent 参数 + 通配符圈定采集范围（public 方法）
- javassist 核心技巧 = 拷贝原方法改名为 $agent、原方法体内包装计时与前后置逻辑
- MyBatis SQL 监控的插桩点选 org.apache.ibatis.executor.BaseExecutor 的 query 方法，从 BoundSql 反射取 SQL

**插桩的 ClassLoader 隔离问题与解法**：

- 插桩代码运行在目标应用 ClassLoader 中：IDEA 内启动正常、脱离 IDEA 用 Spring Boot fat jar 启动即报找不到类
- Tomcat 的 WebappClassLoader 打破双亲委派（先查自己再委派父加载器），可直接 URLClassLoader.addURL 注入 agent jar
- Spring Boot 的 LaunchedURLClassLoader 需反射调用 addURL 解决

**HTTP 入站 / 出站监控采集点设计**：

- 入站选 javax.servlet.http.HttpServlet.service 插桩最通用（MVC 框架层与容器层实现多样、Servlet 层最稳定），采集 URL / 客户端 IP / 耗时 / 参数 / 异常
- 真实 IP 依次取 x-forwarded-for -> Proxy-Client-IP -> WL-Proxy-Client-IP -> remoteAddr
- 出站 URL 调用无集中点：通过设置 java.protocol.handler.pkgs 包前缀替换 UrlStreamHandler、静态代理包装 HttpURLConnection 实现计时（URLStreamHandlerFactory 全进程只能设置一次、有兼容风险故不采用）

### 4.7 自动化测试平台

**三大引擎与监控栈架构**：

- 接口自动化引擎、UI 自动化引擎（Selenium4 封装）、压测引擎三大核心模块，SaaS 化免部署
- 可视化监控告警用 InfluxDB + Grafana + Prometheus 时序栈
- 模块划分为 cloud-account / common / data / engine / gateway

**JMeter 核心概念与命令行压测**：

- 线程组三要素：线程数（= 虚拟用户）/ Ramp-Up 启动时长 / 循环次数，另加调度器
- Sampler 采样器、监听器（结果树 / 聚合报告）
- Linux 非 GUI 压测：`jmeter -n -t jmx -l jtl -e -o report`；存在多接口批量压测痛点

**内嵌 StandardJMeterEngine 二次开发**：

- 方案对比：Runtime.exec 调外部进程可维护性差、难平台化 -> 改为 SpringBoot 内嵌 JMeter 源码
- JMeterUtils.loadJMeterProperties / setJMeterHome 初始化环境；SaveService.loadTree 加载 HashTree
- 支持本地上传 JMX 与在线创建测试计划两种录入

**自定义压测结果收集**：

- 继承 ResultCollector 重写 sampleOccurred 逐样本收集压测数据
- SamplingStatCalculator 按采样器维度统计样本数 / 平均 / 最大最小耗时
- 可整合 Kafka 实时上报与持久化，云端生成可视化报告

### 4.8 前后端分离部署（Spring Boot + Vue）

**Nginx 部署 Vue**：

- 静态资源 alias 指向打包目录 + `try_files $uri $uri/ /index.html` 解决 history 路由刷新 404 -> Vue 前端上线的通用关键配置

**Nginx 反向代理与 WebSocket 代理**：

- 后端接口走独立二级域名 proxy_pass 到本地端口
- WebSocket 需加 proxy_http_version 1.1 + Upgrade / Connection 头，且 proxy_read_timeout 调大（默认 60s 会自动断开长连接）
- Java 侧用 `nohup java -jar -Dspring.profiles.active=prod` 后台部署

**单点登录 token + Redis**：

- 登录后雪花算法生成 token 存 Redis（登录态可主动失效），前端携带 token，HandlerInterceptor 拦截器统一校验
- 区别于无状态 JWT 的选型思路

**Long 精度丢失全局处理**：

- 雪花 ID 等 Long 值超出 JS Number 安全整数范围导致前端精度丢失
- 通过 Jackson 全局注册 ToStringSerializer 将 Long 序列化为字符串解决

### 4.9 雪花算法（分布式唯一 ID）

- Twitter 开源的分布式唯一 ID 算法，生成 64 位 long：

| 分段 | 位数 | 说明 |
|---|---|---|
| 符号位 | 1 | - |
| 毫秒时间戳 | 41 | 约 69 年不重复 |
| 机器标识 | 10 | 1024 节点 |
| 序列号 | 12 | 单节点每毫秒 4096 个 |

- 趋势递增、不依赖第三方组件；检测到时钟回拨则拒绝生成

## 五、SSM 整合

- Spring + Spring MVC + MyBatis
- 配置文件：`web.xml` / `applicationContext.xml` / `spring-mvc.xml` / `mybatis-config.xml`
- Maven 依赖管理
- 分层：Controller / Service / DAO / Mapper

**Servlet 与 Servlet 容器**：

- Servlet 是处理 HTTP 请求的 API 标准，需 Servlet 容器（Tomcat / Jetty / JBoss / Glassfish）承载运行，容器经 web.xml 的 servlet-mapping 路由请求
- 生命周期：init / service / destroy
- JSP 本质是运行期被编译成 Servlet 的视图技术，HttpServlet 是其高级封装

## 六、2026 年 Java 生态

| 维度 | 主流 |
|---|---|
| Java 版本 | 21 LTS（25 于 2025.09 发布，逐步采用） |
| 框架 | Spring Boot 3.x + Spring Cloud 2024 |
| 构建 | Maven / Gradle |
| 测试 | JUnit 5 + Mockito + Testcontainers |
| 云原生 | Spring Boot 3 + GraalVM Native Image |
| 微服务 | Spring Cloud / Spring Cloud Alibaba |
| 性能 | GraalVM / OpenJDK Loom（虚拟线程） |

---

## 📚 完整资料

- [`archive/old-java-notes/`](/md/archive/README?id=old-java-notes) — Java 完整笔记归档
- [`archive/old-jvm-notes/`](/md/archive/README?id=old-jvm-notes) — JVM 笔记归档
- [`archive/old-spring-notes/`](/md/archive/README?id=old-spring-notes) — Spring 笔记归档

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
