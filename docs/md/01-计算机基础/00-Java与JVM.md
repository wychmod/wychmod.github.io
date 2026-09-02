# Java 基础

> 预计阅读：约 20 分钟（正文约 7000 字）
> 阅读建议：先读 Java 语言基础，再读第二章 JUC 并发编程；需要运行时原理转到 JVM，企业开发转到 Spring 生态，分布式唯一 ID 见独立篇章。

---

> 拆分说明：原“Java 与 JVM”已经拆为多条主线，本文件保留旧路径以兼容历史链接，正文只聚焦 Java 基础。

## 一、Java 基础

> 📚 完整 Java 原始笔记见 [`archive/old-java-notes`](/md/archive/README?id=old-java-notes)；JVM 与 Spring 已拆到独立主线。

### 1.1 核心概念

这一篇只承载 Java 语言基础。JVM 运行机制、GC、调优已经拆到 [JVM 运行机制](/md/01-计算机基础/05-JVM运行机制.md)，Spring / SSM / Spring Boot 内容统一放到 [Spring 生态](/md/01-计算机基础/50-Spring生态.md)。

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
- `java.util.concurrent`：并发（JUC），完整讲解见第二章
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

### 1.6 Java 8 函数式

- 只有一个抽象方法的接口即**函数式接口**（`@FunctionalInterface`）
- 内置四大核心函数式接口：Consumer / Supplier / Function / Predicate
- **Stream 声明式处理集合**：
  - 中间操作惰性求值：filter / map / sorted / distinct / limit
  - 终端操作：forEach / count / collect
  - 流只能消费一次

## 二、JUC 并发编程

> JUC（java.util.concurrent）解决三件事：**分工**（任务怎么拆给多线程）、**互斥**（共享资源别抢）、**同步**（线程之间等时机）。
> 本节提炼自归档笔记：[archive/old-cs-notes/多线程与并发编程.md](/md/archive/README?id=old-cs-notes)。

### 2.1 线程基础

**进程 vs 线程**：进程是资源分配的基本单位（一个运行的程序），线程是 CPU 调度的基本单位（程序里的一条执行流）。同一进程内的线程共享堆和方法区，但各自有独立的栈——像同一车间里的多个工人共享设备原料，但每人有自己的操作台。

**创建线程的三种方式**：

| 方式 | 写法 | 优点 | 缺点 |
|---|---|---|---|
| 继承 Thread | 重写 run()，调 start() | 编码最简单 | Java 单继承，没法再继承别的类 |
| 实现 Runnable | 任务交给 Thread 执行 | 任务与线程分离，可复用、可进线程池 | 拿不到执行结果 |
| 实现 Callable | 配合 FutureTask，call() 有返回值 | 能拿结果、可抛异常 | 编码最复杂 |

- Thread 本身实现了 Runnable，其 run() 默认就是调用传入的 `target.run()`。
- 需要返回值时用 Callable + FutureTask，`futureTask.get()` 会阻塞等待结果。

**常用方法**：

| 方法 | 作用 | 要点 |
|---|---|---|
| start() | 启动新线程 | 直接调 run() 只是普通方法调用，不启动新线程 |
| sleep(n) | 睡眠 n 毫秒 | 让出 CPU 但**不释放锁**；可被 interrupt 打断 |
| yield() | 让出 CPU | 回到就绪态，调度器可能仍选中它 |
| join() | 等目标线程结束 | 用于顺序执行：t1.join() 后再继续 |
| interrupt() | 打断线程 | 打断阻塞中的线程：抛 InterruptedException 并**清空**打断标记；打断正常运行的线程：只设置标记，靠 isInterrupted() 自查 |
| setDaemon(true) | 守护线程 | 必须在 start() 前调用；所有用户线程结束后强制结束（GC 线程就是守护线程） |
| setPriority(1-10) | 优先级 | 默认 5，只是给调度器的提示，不可依赖 |

**线程状态（Java 6 态）**：

| 状态 | 含义 | 触发 |
|---|---|---|
| NEW | 已创建未启动 | `new Thread()` 后 |
| RUNNABLE | 可运行（就绪 + 运行中） | start() 后 |
| BLOCKED | 等锁 | 抢 synchronized 失败 |
| WAITING | 无限等待 | wait() / join() / park() |
| TIMED_WAITING | 限期等待 | sleep(n) / wait(n) / join(n) |
| TERMINATED | 已结束 | run() 退出 |

记忆窍门：BLOCKED 只跟 synchronized 有关；WAITING 与 TIMED_WAITING 的区别就是"带不带时间参数"。

### 2.2 线程安全与 synchronized

**问题的根源**：`i++` 看着是一步，实际是"读 → 改 → 写"三步。两个线程交错执行会互相覆盖——一个自增一个自减各 5000 次，结果不为 0。这就是**竞态条件**：结果取决于线程的执行时序。

```java
static int counter = 0;
static final Object lock = new Object();

// 两个线程各自执行 5000 次：
synchronized (lock) {   // 同一时间只放行一个线程
    counter++;
}
```

**synchronized 三种用法**：

| 写法 | 实际锁的对象 |
|---|---|
| 同步代码块 `synchronized (obj)` | obj 本身 |
| 实例方法 | this |
| 静态方法 | 类名.class（全类唯一） |

**Monitor 原理（通俗版）**：每个 Java 对象都可关联一个 Monitor（监视器），像一间带锁的房间：

- **Owner**：持锁线程，同一时刻只有一个（房间钥匙）
- **EntryList**：抢锁失败的线程在此阻塞（门外排队区）
- **WaitSet**：调 wait() 主动让出锁的线程在此等待（室内等候室）

线程先 CAS 抢 Owner；抢不到进 EntryList 排队；Owner 释放锁后唤醒排队线程重新竞争（非公平）。字节码层面是 monitorenter / monitorexit，编译器保证异常路径也会解锁。

**锁升级（JDK 6 优化，只升不降）**：无锁 → 偏向锁 → 轻量级锁 → 重量级锁

| 级别 | 适用场景 | 做法 |
|---|---|---|
| 偏向锁 | 只有一个线程反复加锁 | Mark Word 记下线程 ID，重入不再同步 |
| 轻量级锁 | 多线程交替加锁、无实际竞争 | 栈帧 Lock Record + CAS，失败先自旋 |
| 重量级锁 | 多线程同时竞争 | 膨胀为 Monitor，抢不到的线程真正阻塞 |

synchronized 是可重入锁：同一线程可再次获取自己持有的锁。

**死锁**：两个线程各持一把锁、又都在等对方的锁，永久卡住。四个必要条件：互斥、不可剥夺、请求保持、循环等待——打破任意一个即可避免（最常用：按固定顺序加锁，或用 tryLock 设超时）。相关概念：活锁（不阻塞但反复重试失败）、饥饿（低优先级线程始终抢不到 CPU）。

### 2.3 线程协作：wait / notify

wait/notify 是对象自带的协作机制：条件不满足就 wait 释放锁进入等待，别的线程把条件准备好后 notify 唤醒。

- 必须**在 synchronized 块内**调用，否则抛 IllegalMonitorStateException——只有持锁人才能操作这把锁的等候室。
- wait() 会**释放锁**；notify / notifyAll 唤醒 WaitSet 中的线程，被唤醒后还要重新竞争锁。
- 判断条件必须用 **while 而不是 if**：被唤醒时条件可能又被改掉了（虚假唤醒），while 会让它重新检查、继续等。

**sleep vs wait**：

| 对比 | sleep | wait |
|---|---|---|
| 所属 | Thread 静态方法 | Object 方法 |
| 锁 | 不释放 | 释放 |
| 前提 | 任意位置可用 | 必须持有该对象锁 |
| 用途 | 单纯暂停自己 | 线程间协作 |

**park / unpark（LockSupport）**：JUC 底层更常用的协作方式，以线程为单位发放"许可"：

- 不依赖 Monitor 对象，任意位置可调
- 可以先 unpark 再 park（许可先攒着），wait 做不到先 notify
- 以线程为单位精确唤醒，notify 是随机唤醒
- 但 park 不释放已持有的锁

### 2.4 JMM 与 volatile

**JMM（Java 内存模型）**：一套抽象规则——所有共享变量存在**主内存**，每个线程有自己的**工作内存**（变量副本），线程不能直接读写主内存。类比：主内存是中央仓库，工作内存是每个工人的随身工具箱，改完不一定马上归还仓库，别人看到的可能就不是最新值。

由此产生三大问题：

| 问题 | 通俗解释 | 典型现象 |
|---|---|---|
| 原子性 | 一组操作不可分割 | i++ 丢更新 |
| 可见性 | 一个线程的修改别人看不到 | `while(run)` 循环停不下来（JIT 把 run 缓存进工作内存） |
| 有序性 | 代码执行顺序被重排 | DCL 拿到半初始化对象 |

**volatile：保证可见性 + 有序性，不保证原子性**。

- 可见性：写 volatile 变量立即刷回主内存，并让其他线程的缓存行失效（底层 lock 前缀指令 + MESI 缓存一致性协议）。
- 有序性：内存屏障禁止指令重排——写屏障保证屏障前的改动先落盘，读屏障保证屏障后读到最新值。
- 不保证原子性：`volatile int i` 的 i++ 依然会丢更新，要用 Atomic 类或锁。

**happens-before（先发生于）**：判断一个操作的结果对另一个操作是否可见，常用规则：

- 程序次序：单线程内，前面的操作先于后面
- 锁规则：解锁先于后续加同一把锁
- volatile 规则：写先于后续读
- 传递性：A 先于 B、B 先于 C，则 A 先于 C
- 线程启动 / 终止：start() 先于线程内所有操作；线程内操作先于别的线程检测到它终止

**DCL 单例为什么必须加 volatile**：

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

`new` 分三步：分配内存 → 初始化 → 引用赋值。后两步没有数据依赖，可能被重排成"先赋值后初始化"，别的线程就会拿到非 null 但还没初始化完的对象。

### 2.5 CAS 与原子类

**CAS（Compare-And-Swap）**：CPU 级并发原语——比较内存值 V 与预期值 A，相等才改成 B，不等就自旋重试。这是**乐观锁**思想：不加锁，更新时才确认没被改过；synchronized 是悲观锁：先上锁再操作。底层是 `lock cmpxchg` 指令。

**三大缺点**：

1. 自旋重试空转 CPU，高并发下尤其明显
2. 一次只能保证一个变量的原子性，多个变量要用锁
3. **ABA 问题**：值从 A 改到 B 又改回 A，CAS 察觉不到中间过程。用 AtomicStampedReference 加版本号解决——引用和版本号都一致才算成功

**原子类（Atomic 包）**：volatile 保证可见性 + CAS 保证原子性，不加锁也能安全自增：

```java
AtomicInteger i = new AtomicInteger(0);
i.incrementAndGet();   // ++i，返回新值
i.getAndAdd(5);        // 返回旧值，再加 5
```

- AtomicReference：对对象引用做原子 CAS。
- **LongAdder vs AtomicLong**：AtomicLong 是所有线程挤同一个变量自旋；LongAdder 把计数分散到 Cell 数组，各线程各自累加一个槽位，取值时再 sum 汇总。高并发写性能好，但 sum 是近似值——空间换时间。
- Unsafe（sun.misc）：CAS 的底层工具类，方法全是 native，相当于 Java 里的 C 指针，一般不直接使用。

### 2.6 ThreadLocal 与不可变

**ThreadLocal：线程私有变量**。每个 Thread 内部有一张 ThreadLocalMap，key 是 ThreadLocal 实例（弱引用），value 是变量值——同一条线程走到哪都能取，别的线程看不到。典型用途：SimpleDateFormat 线程隔离、数据库连接管理、链路追踪透传。

- **内存泄漏**：map 随线程存活（线程池里线程长期不死），value 是强引用——用完必须 `remove()`。
- 父子线程传值用 InheritableThreadLocal。
- **不可变类天生线程安全**（String、Integer）：没有可变的共享状态；final 字段写入自带写屏障，别的线程不会读到未初始化的值。

### 2.7 线程池

线程池的本质是**线程复用**：避免频繁创建销毁线程，控制并发上限、统一管理。

**ThreadPoolExecutor 7 大参数**：

```java
public ThreadPoolExecutor(int corePoolSize,      // 核心线程数
                          int maximumPoolSize,   // 最大线程数
                          long keepAliveTime,    // 救急线程空闲存活时间
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,  // 任务队列
                          ThreadFactory threadFactory,        // 线程工厂（自定义命名）
                          RejectedExecutionHandler handler)   // 拒绝策略
```

**任务提交流程**（四步记忆：核心 → 队列 → 救急 → 拒绝）：

1. 线程数 < corePoolSize → 建核心线程执行
2. 核心满了 → 任务进队列排队
3. 队列满 → 建救急线程执行新任务
4. 线程数到 maximumPoolSize → 执行拒绝策略

空闲的救急线程超过 keepAliveTime 会被回收，最终收缩回核心线程数。

**线程数怎么定**：CPU 密集型 = N + 1（N 为核数，多出的 1 防止缺页中断时 CPU 空转）；IO 密集型 = 2N（或按阻塞系数公式）。

**4 种拒绝策略**：

| 策略 | 行为 |
|---|---|
| AbortPolicy（默认） | 抛 RejectedExecutionException |
| CallerRunsPolicy | 谁提交谁自己执行，天然限流 |
| DiscardPolicy | 静默丢弃 |
| DiscardOldestPolicy | 丢掉队列里最老的，再提交当前任务 |

**为什么阿里规约禁用 Executors**：newFixedThreadPool / newSingleThreadExecutor 用无界队列，任务堆积会 OOM；newCachedThreadPool 最大线程数是 Integer.MAX_VALUE，可能创建海量线程 OOM。生产环境用 ThreadPoolExecutor 手动指定参数。

**常用阻塞队列**：ArrayBlockingQueue（有界）、LinkedBlockingQueue（默认无界，读写两把锁）、SynchronousQueue（不存元素，"一手交钱一手交货"）。

**定时任务**：scheduleAtFixedRate 按固定频率触发（上次开始时间 + period，任务耗时超期则结束立即开始下一次）；scheduleWithFixedDelay 是上次结束后间隔 delay 再触发。

**ForkJoin**：分治 + 工作窃取——大任务拆成小任务放进各线程自己的双端队列，空闲线程从别人队列尾部"偷"任务，适合可拆分的 CPU 密集计算。

### 2.8 AQS 与显式锁

**AQS（AbstractQueuedSynchronizer）**：JUC 里几乎所有锁和同步工具的底座，三个关键词：

- **state**：volatile int 表示资源状态（0 = 无锁 / 重入计数 / 剩余许可数），CAS 修改
- **队列**：抢锁失败的线程包装成 Node，排进 FIFO 双向链表并 park 阻塞
- **两种模式**：独占（ReentrantLock）与共享（Semaphore、读锁）

AQS 用模板方法模式把"排队、阻塞、唤醒"打包好，子类只需实现 tryAcquire / tryRelease 等钩子方法。

**ReentrantLock vs synchronized**：

| 特性 | synchronized | ReentrantLock |
|---|---|---|
| 层面 | JVM 内置关键字 | JDK 代码实现（基于 AQS） |
| 释放 | 自动 | 必须 finally 中手动 unlock() |
| 可中断 | 否 | lockInterruptibly() |
| 超时 | 死等 | tryLock(timeout) |
| 公平锁 | 仅非公平 | 可选公平 / 非公平 |
| 条件变量 | 一个 WaitSet | 多个 Condition 精准唤醒 |

- 可重入原理：state 记重入次数，同线程加锁递增、解锁递减，减到 0 才真释放。
- 非公平锁（默认）先直接抢一次锁，吞吐高但可能饥饿；公平锁先检查队列里有没有排得更早的线程。

**读写锁 ReentrantReadWriteLock**：读读共享、读写与写写互斥，适合读多写少。state 高 16 位记读锁、低 16 位记写锁；支持锁降级（持写锁 → 再拿读锁 → 释放写锁），不支持升级。JDK 8 的 StampedLock 进一步支持"乐观读"：不加锁先读，读完后校验版本戳，失败再升级为读锁。

**常用同步器**（都基于 AQS）：

| 工具 | 一句话 | 典型场景 |
|---|---|---|
| CountDownLatch | 倒计时门闩：await 等计数归零，一次性 | 主线程等 N 个子任务全部完成 |
| CyclicBarrier | 循环屏障：N 个线程互相等齐再一起走，可重用 | 分组计算、多轮同步 |
| Semaphore | 信号量：限制同时访问的线程数 | 限流、连接池 |
| Exchanger | 两个线程在同步点交换数据 | 管道、成对交换 |

```java
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        // doTask();
        latch.countDown();      // 完成一个减一
    }).start();
}
latch.await();                  // 等三个都完成再继续
```

### 2.9 并发容器

| 容器 | 核心机制 | 适用 |
|---|---|---|
| ConcurrentHashMap | JDK7 分段锁 → JDK8 CAS + synchronized 锁桶首节点 | 高并发 KV |
| CopyOnWriteArrayList | 写时复制：写加锁复制新数组，读完全无锁 | 读多写极少（白名单、监听器列表） |
| ConcurrentSkipListMap | 跳表 + CAS，天然有序 | 并发有序 Map（替代 TreeMap） |
| ConcurrentLinkedQueue | 无锁 CAS 队列 | 非阻塞 FIFO |

- ConcurrentHashMap 1.8 的 size 用 LongAdder 思想分槽计数（近似值）；扩容时写线程可协助搬迁（helpTransfer），迁完的桶放 ForwardingNode，读请求转发到新表。
- Collections.synchronizedXXX 全表一把锁、粒度粗，已被 JUC 容器取代；ConcurrentHashMap 演进细节见 1.5 节。
- CopyOnWriteArrayList 迭代器基于创建时的数组快照（fail-safe，不抛 ConcurrentModificationException），但可能读到旧数据、每次写都复制整个数组。

### 2.10 常见坑与最佳实践

- **单个方法线程安全 ≠ 方法组合线程安全**：Vector 每个方法都安全，但"先 get 后 set"两步之间仍会被插队，需要外层加锁。
- **线程池 + ThreadLocal 忘了 remove 会串数据**：线程被复用，上次的值还在，任务结束必须清理。
- **wait 必须用 while 判断、优先 notifyAll**：防虚假唤醒、防唤醒错线程。
- **子任务异常不会自动抛给主线程**：Callable 通过 Future.get() 拿异常；Runnable 的异常只能在线程内处理，优雅退出用两阶段终止（interrupt + 打断标记 + 后置处理）。
- **优先用 JUC 工具而不是手写 wait/notify**：阻塞队列、CountDownLatch、Semaphore 已覆盖绝大多数协作场景。

## 三、最新 Java 生态

| 维度 | 主流 |
|---|---|
| Java 版本 | Java 21 LTS 是稳态主线；Java 25 已在 2025-09 发布，生产采纳通常随团队节奏推进 |
| 构建 | Maven / Gradle |
| 测试 | JUnit 5 + Mockito + Testcontainers |
| 并发 | JUC、CompletableFuture、虚拟线程（Project Loom） |
| 性能 | OpenJDK / GraalVM / JVM 参数与 GC 日志分析 |
| 企业开发 | Spring 相关内容独立见 [Spring 生态](/md/01-计算机基础/50-Spring生态.md) |

学习顺序建议：先补 Java 语法、集合和异常，再读 JUC 并发编程；需要理解运行时行为时转到 JVM；进入企业开发和微服务时转到 Spring 生态。

---

## 📚 完整资料

> **原文归档**：[`archive/old-java-notes`](/md/archive/README?id=old-java-notes)
> 本篇只归纳 Java 基础、语言特性、集合与并发入门；JVM、Spring 与分布式 ID 已拆分到独立主线。

- [`archive/old-java-notes`](/md/archive/README?id=old-java-notes) — Java 基础、Java 学习路线、Servlet、监控、自动化测试平台等原始笔记
- [`archive/old-cs-notes/多线程与并发编程.md`](/md/archive/README?id=old-cs-notes) — JUC 完整原始笔记（线程 / 锁 / JMM / CAS / 线程池 / AQS / 并发容器），第二章由此提炼
- [`分布式 ID 与雪花算法`](/md/02-后端开发/40-分布式ID与雪花算法.md) — 分布式唯一 ID 原理与 Java 项目落地实战
- [`自动化测试平台`](/md/10-项目实战/01-自动化测试平台/00-架构总览.md) — cloud-meter 当前实现的分篇教程
- [`JVM 运行机制`](/md/01-计算机基础/05-JVM运行机制.md) — 类加载、运行时数据区、GC 与调优
- [`Spring 生态`](/md/01-计算机基础/50-Spring生态.md) — Spring Core / MVC / Boot / 事务 / Cloud / Security / SSM 项目落地

---

## 最新修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-09-02 | 新增 | 基于归档 JUC 笔记补全第二章「JUC 并发编程」：线程基础、synchronized/Monitor、wait-notify、JMM/volatile、CAS/原子类、ThreadLocal、线程池、AQS/同步器、并发容器与常见坑；原 1.6 多线程基础并入第二章 |

> 📚 完整历史修改记录见 [修改记录归档](/_meta/CHANGELOG_HISTORY.md)。
