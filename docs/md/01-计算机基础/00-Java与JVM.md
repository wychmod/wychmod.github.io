# Java 基础

> 预计阅读：约 8 分钟（正文约 2600 字）
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

> 📚 完整 Java 项目笔记见 [`archive/old-java-notes`](/md/archive/README?id=old-java-notes)；Spring/SSM 与 Spring Boot + Vue 项目部署已迁入 [Spring 生态](/md/01-计算机基础/50-Spring生态.md)。具体项目教程统一放在 [项目实战](/md/10-项目实战/)。

- **JVM 插桩监控**：见 [JVM 运行机制](/md/01-计算机基础/05-JVM运行机制.md)
- **自动化测试平台**：已拆到 [项目实战 / 自动化测试平台](/md/10-项目实战/01-自动化测试平台/00-架构总览.md)，本篇不再展开项目实现

### 2.2 雪花算法（分布式唯一 ID）

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

- [`archive/old-java-notes`](/md/archive/README?id=old-java-notes) — Java 基础、Java 学习路线、Servlet、监控、自动化测试平台等原始笔记
- [`自动化测试平台`](/md/10-项目实战/01-自动化测试平台/00-架构总览.md) — cloud-meter 当前实现的分篇教程
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
| 2026-08-23 | 新增 | 按分区核对报告（J1/J2/J3）补全：Java 基础 / 集合 / 并发 / JVM 知识点归位扩充（含类加载、双亲委派、混合执行、HashMap、volatile DCL、GC Roots、晋升、CMS、三色标记、调优排查），并补充 Java 工程实践入口、SSM Servlet 与字节码混合模式说明 |
| 2026-08-26 | 重构 | 统一前置阅读时间/建议，原文归档移至文末 |
| 2026-08-26 | 重构 | 按用户反馈拆分 Java / JVM / Spring：本篇聚焦 Java 基础与 Java 项目入口，JVM 调优移入 05-JVM运行机制.md，Spring/SSM/Boot 项目内容迁入 50-Spring生态.md |
| 2026-08-27 | 订正 | 隐藏 3 个未完整实现且不再维护的项目内容，保留归档来源 |
| 2026-08-27 | 订正 | 继续隐藏 2 个不再展示的项目内容，Java 工程实践入口收敛为监控、测试平台与通用算法 |
| 2026-08-28 | 重构 | 自动化测试平台从 Java 工程概览中拆出，迁移到项目实战并按 cloud-meter 当前进度分篇 |
