# JVM 运行机制

> 预计阅读：约 14 分钟（正文约 4278 字）
> 阅读建议：先按一到四章建立运行模型，再读 GC、调优和 javaagent 监控实践；线上排查优先看第六章。

---

## 一、先建立全局图

> 📚 完整 JVM 原始笔记见 [`archive/old-jvm-notes`](/md/archive/README?id=old-jvm-notes)

JVM 是 Java 程序从源码走向机器执行的中间层。它屏蔽操作系统差异，负责加载 `.class` 字节码、管理运行时内存、执行字节码、回收对象，并提供监控、诊断、调优接口。

从浅到深看 JVM，可以按这条线走：

1. 源码如何变成 `.class`
2. `.class` 什么时候被加载，如何验证、准备、解析和初始化
3. 方法调用、对象分配、线程执行分别落在哪些运行时区域
4. 对象如何从新生代到老年代，垃圾如何被定位和回收
5. 线上出现慢、卡、频繁 Full GC、OOM 时如何排查

JDK、JRE、JVM 的边界：

| 名称 | 作用 | 面向对象 |
|---|---|---|
| JDK | 编译器、运行环境、工具链的完整开发包 | 开发者 |
| JRE | 运行 Java 程序所需的环境 | 使用者 |
| JVM | 执行字节码、管理内存和运行时行为 | Java 程序 |

---

## 二、从源码到字节码

Java 源码先由 `javac` 编译成 `.class` 文件，`.class` 是 JVM 能识别的二进制格式，不直接等于某个操作系统的机器码。

典型执行链路：

```text
.java 源码
  -> javac 编译
  -> .class 字节码
  -> ClassLoader 加载
  -> 运行时数据区
  -> 解释器 / JIT 编译器执行
  -> CPU 指令
```

字节码的价值在于跨平台：同一份 `.class` 文件，只要目标机器上有兼容 JVM，就可以运行。

`.class` 文件核心结构：

| 区域 | 作用 |
|---|---|
| 魔数与版本 | 标识这是 Class 文件，以及编译目标版本 |
| 常量池 | 存放字面量、类名、方法名、字段名、符号引用 |
| 访问标志 | 描述 public、final、interface 等修饰 |
| 类索引 | 当前类、父类、接口关系 |
| 字段表 | 成员变量描述 |
| 方法表 | 方法签名与 Code 属性 |
| 属性表 | 注解、泛型、调试信息等扩展信息 |

查看字节码常用命令：

```bash
javac Hello.java
javap -v Hello.class
```

字节码执行不是简单的“纯解释”。HotSpot 默认使用解释器 + JIT 的混合模式：

- `-Xmixed`：默认模式，启动阶段解释执行，热点代码触发 JIT 编译为机器码。
- `-Xint`：纯解释执行，启动简单但长期运行慢。
- `-Xcomp`：尽量编译执行，启动阶段成本高。
- 热点探测基于方法调用计数和循环回边计数，达到阈值后触发即时编译。

---

## 三、类加载机制

类的生命周期：

```text
加载 -> 验证 -> 准备 -> 解析 -> 初始化 -> 使用 -> 卸载
```

### 3.1 加载

加载阶段完成三件事：

- 通过类的全限定名获取二进制字节流。
- 将字节流转成方法区里的运行时数据结构。
- 在堆中生成一个 `java.lang.Class` 对象，作为访问类元数据的入口。

常见类加载器：

| 类加载器 | 负责范围 |
|---|---|
| Bootstrap ClassLoader | Java 核心类库 |
| Platform ClassLoader | Java 9+ 平台类库，替代旧 Extension ClassLoader |
| AppClassLoader | 应用 classpath 下的类 |
| 自定义 ClassLoader | 插件化、隔离加载、热部署等场景 |

### 3.2 双亲委派

双亲委派的流程是：类加载请求先交给父加载器，父加载器无法加载时，子加载器才尝试加载。

它解决两个问题：

- 安全：避免应用自定义 `java.lang.String` 这类核心类。
- 去重：同一个类尽量由同一个加载器加载，减少重复定义。

会打破双亲委派的场景：

- SPI：接口在核心库，实现类在应用 classpath，需要线程上下文类加载器。
- Tomcat：不同 Web 应用需要隔离同名类。
- OSGi / 插件系统：同一类库多版本共存。
- javaagent：需要在目标应用加载类时插桩。

### 3.3 链接与初始化

链接分三步：

| 阶段 | 作用 |
|---|---|
| 验证 | 确认字节码格式、语义、类型安全 |
| 准备 | 给静态变量分配内存并设置零值 |
| 解析 | 把符号引用转成直接引用 |

初始化阶段才会执行 `<clinit>`，也就是静态变量显式赋值和静态代码块。

主动触发初始化的典型情况：

- `new` 创建对象。
- 读写静态字段。
- 调用静态方法。
- 反射访问类。
- 初始化子类前先初始化父类。
- 运行主类的 `main` 方法。

被动引用通常不触发初始化，例如通过子类引用父类静态字段、定义对象数组、引用编译期常量。

---

## 四、运行时数据区与对象内存

JVM 运行时数据区可以按线程私有和线程共享拆开看。

| 区域 | 线程关系 | 作用 |
|---|---|---|
| 程序计数器 | 私有 | 记录下一条 JVM 指令地址 |
| 虚拟机栈 | 私有 | 方法调用栈，每个方法对应一个栈帧 |
| 本地方法栈 | 私有 | Native 方法调用 |
| 堆 | 共享 | 存放对象实例和数组 |
| 方法区 / 元空间 | 共享 | 类元数据、常量池、方法信息 |
| 直接内存 | JVM 外 | NIO 等场景使用，不受堆大小直接限制 |

栈帧包含：

- 局部变量表。
- 操作数栈。
- 动态链接。
- 方法返回地址。

对象创建过程：

```text
类加载检查
  -> 分配内存
  -> 成员变量赋默认值
  -> 设置对象头
  -> 执行 <init>
  -> 引用指向对象
```

普通对象内存布局：

| 区域 | 内容 |
|---|---|
| Mark Word | 哈希、GC 年龄、锁标志等运行时信息 |
| Class Pointer | 指向类元数据 |
| 实例数据 | 对象字段 |
| 对齐填充 | 保证对象大小按 8 字节对齐 |

`new Object()` 在开启压缩指针的 HotSpot 中通常占 16 字节：Mark Word 8B + Class Pointer 4B + 对齐填充 4B。

JDK 8 起永久代被元空间替代：

- 永久代在堆内，容易因为类元数据过多触发 `OutOfMemoryError: PermGen space`。
- 元空间使用本地内存，默认按需增长，但仍应通过 `-XX:MaxMetaspaceSize` 设置上限。

JMM 与 JVM 内存区域不是同一个概念。JMM 讨论线程间可见性、有序性和原子性；运行时数据区讨论 JVM 如何组织方法调用、对象和类元数据。

---

## 五、垃圾回收

GC 要解决两个问题：什么对象是垃圾，以及如何回收。

### 5.1 如何判断垃圾

引用计数法简单但无法处理循环引用。HotSpot 主要使用可达性分析：从 GC Roots 出发，无法被到达的对象就是可回收对象。

常见 GC Roots：

- 虚拟机栈中的引用。
- 方法区中静态字段引用的对象。
- 方法区中常量引用的对象。
- 本地方法栈 JNI 引用。
- 被同步锁持有的对象。

### 5.2 常见回收算法

| 算法 | 思路 | 适用特点 |
|---|---|---|
| 标记清除 | 标记垃圾后直接清理 | 简单，但会产生碎片 |
| 复制算法 | 活对象复制到另一块区域 | 适合存活率低的新生代 |
| 标记整理 | 标记后把活对象向一端移动 | 适合老年代，减少碎片 |
| 分代收集 | 按对象生命周期分区使用不同算法 | HotSpot 长期主流思路 |

对象进入老年代的常见路径：

- 年龄达到阈值。
- 大对象直接进入老年代。
- Survivor 空间放不下。
- 动态年龄判断后提前晋升。

### 5.3 常见收集器

| 收集器 | 特点 |
|---|---|
| Serial / Serial Old | 单线程，适合客户端或小堆 |
| Parallel / Parallel Old | 吞吐量优先，适合批处理 |
| CMS | 低停顿老年代收集器，已退出主流 |
| G1 | Region 化、可预测停顿，常见服务器默认选择 |
| ZGC / Shenandoah | 更低停顿，适合大堆和低延迟场景 |

CMS 的典型问题：

- 并发标记会占用用户线程资源。
- 浮动垃圾需要下次 GC 处理。
- 标记清除产生内存碎片。
- Concurrent Mode Failure 会退化为 Serial Old。

G1 的核心概念：

- 把堆划成多个 Region，不再强依赖连续新生代/老年代。
- 通过 Remembered Set 记录跨 Region 引用。
- 按回收收益优先选择垃圾最多的 Region。
- 可用 `-XX:MaxGCPauseMillis` 设置期望停顿目标。

三色标记用于并发标记阶段：白色表示未访问，灰色表示已访问但引用未扫描完，黑色表示已扫描完成。并发过程中需要写屏障或读屏障避免漏标。

---

## 六、调优与排查

调优不是先改参数，而是先明确目标和证据。

常见目标：

- 减少 Full GC 次数。
- 降低单次停顿时间。
- 提高吞吐量。
- 控制内存占用。
- 避免 OOM 和频繁抖动。

排查顺序：

1. `jps` 找 Java 进程。
2. `jstat -gcutil <pid> 1000` 看 GC 频率和各区占用。
3. `jstack <pid>` 看线程阻塞、死锁、线程池耗尽。
4. `jmap -histo <pid>` 或堆转储看对象分布。
5. Arthas 在线定位热点方法、类加载、反编译和调用链。
6. 结合 GC 日志判断是内存泄漏、分配速率过高，还是参数配置不合理。

常见参数模板：

```bash
-Xms2g -Xmx2g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
-Xlog:gc*:file=gc.log:time,uptime,level,tags
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=./heapdump.hprof
```

JDK 8 常见 GC 日志参数：

```bash
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:gc.log
```

JDK 9+ 统一日志改为 `-Xlog`，生产排查时应按实际 JDK 版本选择参数。

调优判断表：

| 现象 | 优先怀疑 |
|---|---|
| Young GC 很频繁 | 分配速率高、新生代过小 |
| Full GC 频繁 | 老年代增长快、晋升过早、元空间压力 |
| 单次停顿长 | 堆过大、收集器不合适、对象存活率高 |
| Metaspace OOM | 动态代理、热部署、类加载器泄漏 |
| CPU 高但 GC 不高 | 线程自旋、锁竞争、业务热点循环 |

---

## 七、javaagent 与监控实践

> 来源：原 Java 基础篇的监控系统实践，底层依赖 JVMTI、Instrumentation、ClassLoader 与字节码增强，归入 JVM 主线更顺。

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

---
## 八、和其他主线文档的边界

- Java 语言基础、集合、异常、函数式与项目入口见 [Java 基础](/md/01-计算机基础/00-Java与JVM.md)。
- 线程模型、锁、JUC、网络 IO 与操作系统原理见 [计算机系统与并发](/md/01-计算机基础/30-计算机系统与并发.md)。
- Spring 的 IoC、AOP、Boot、事务、Cloud 与项目部署见 [Spring 生态](/md/01-计算机基础/50-Spring生态.md)。

---

## 📚 完整资料

> **原文归档**：[`archive/old-jvm-notes`](/md/archive/README?id=old-jvm-notes)
> 来源包括：`JVM-bak.md`、`JVM实战-1-加载链接初始化.md`、`JVM实战-2-JMM.md`、`JVM实战-3-GC.md`、`JVM实战-4-调优.md`。

- [`archive/old-jvm-notes`](/md/archive/README?id=old-jvm-notes) — JVM 原始笔记归档
- [`Java 基础`](/md/01-计算机基础/00-Java与JVM.md) — Java 语言基础与项目入口
- [`Spring 生态`](/md/01-计算机基础/50-Spring生态.md) — Spring / Boot / Cloud 主线

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-26 | 新增 | 从 Java 与 JVM 拆出独立 JVM 主线，参考 old-jvm-notes 老目录按运行原理、类加载、运行时数据区、GC、调优排查由浅入深重组 |
| 2026-08-26 | 重构 | 从 Java 基础迁入 javaagent / JVMTI / Instrumentation 监控实践，放入 JVM 运行机制主线 |
