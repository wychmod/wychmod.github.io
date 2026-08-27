# 自动化测试平台：JMeter 与嵌入式引擎

> **上一章**：[项目与用例管理](02-项目与用例管理.md)
> **当前代码库**：`D:\idea\cloud-meter`
> **本章目标**：先认识 JMeter 测试计划，再理解为什么平台要把 JMeter 嵌入 Java 服务。
> **当前进度**：覆盖归档中的 JMeter 基础、命令行思路，以及当前代码已经完成的 JMeter 资源加载和引擎初始化。

---

## 一、JMeter 在平台里扮演什么角色

JMeter 是性能测试执行器。它可以模拟多个线程发送 HTTP、JDBC、TCP 等请求，并记录每次采样的响应时间、响应码、错误和吞吐信息。

JMeter 工作在协议层，不是浏览器：

- 它可以发送 HTTP 请求。
- 它不会像浏览器一样渲染页面。
- 它不会执行页面中的 JavaScript 来完成 UI 操作。

所以本系列的当前实现重点是压力测试，不把 JMeter 当成 Selenium 的替代品。

## 二、一个 JMeter 测试计划由什么组成

无论是 GUI 创建，还是 Java 代码动态创建，最后都可以理解为一棵测试计划树：

```text
Test Plan
└── Thread Group
    ├── Controller
    ├── Sampler（HTTP 请求）
    ├── Config Element（请求参数、Header 等）
    ├── Assertion（断言）
    ├── Post Processor
    └── Listener（结果监听）
```

| 组件 | 初学者理解 |
|---|---|
| Test Plan | 整个测试脚本的根节点 |
| Thread Group | 虚拟用户数量、启动速度和循环方式 |
| Sampler | 真正发出请求的节点 |
| Controller | 控制多个请求如何组织和循环 |
| Config Element | 为请求提供公共配置 |
| Assertion | 判断响应是否符合预期 |
| Listener | 接收和展示结果 |

线程组最常用的参数是线程数、Ramp-Up、循环次数、延迟和持续时间。比如 20 个线程、Ramp-Up 2 秒，表示大约在 2 秒内逐步启动 20 个虚拟用户。

## 三、命令行方式为什么不适合直接做成平台

归档中使用过这样的命令：

```bash
jmeter -n \
  -t /path/to/test.jmx \
  -l /path/to/result.jtl \
  -e \
  -o /path/to/report
```

参数含义：

| 参数 | 含义 |
|---|---|
| `-n` | 非 GUI 模式 |
| `-t` | JMX 测试脚本路径 |
| `-l` | JTL 结果文件路径 |
| `-e` | 执行结束后生成 HTML 报告 |
| `-o` | HTML 报告目录 |

直接执行命令当然可以工作，但平台化时会遇到几个问题：

- Java 服务要拼接不同操作系统的命令和路径。
- 进程的标准输出、错误输出和退出码需要额外管理。
- JMX、JTL、HTML 报告的生命周期分散在操作系统进程中。
- 实时结果不容易直接进入平台自己的消息和报告链路。

因此归档笔记提出过 `Runtime.exec` 方案，随后选择进一步研究 JMeter Java API。这里的结论不是“外部进程永远不能用”，而是当前项目希望把引擎和结果监听纳入 Java 代码控制。

## 四、当前项目把 JMeter 资源放在哪里

`cloud-engine` 的 `src/main/resources/jmeter` 下已经放入 JMeter 运行资源，目录包含：

```text
jmeter/
├── bin/
│   ├── jmeter.properties
│   ├── jmeter.bat
│   ├── report-template/
│   └── ...
├── test.jmx
└── backups/
```

这样做的意图是让 Java 应用通过类路径找到 JMeter，而不是要求每台机器手工安装一份 JMeter。当前资源目录已经存在，真正执行时仍要关注：

- 资源是否能从打包后的 classpath 解出到可访问的文件路径。
- Windows、Linux 和 JAR 包内路径的差异。
- 多个压测任务同时运行时，JMeter 全局属性和临时文件是否互相影响。
- 运行资源和 JMeter 版本是否保持一致。

## 五、逐行读 `StressTestUtil`

当前 JMeter 初始化封装在 `StressTestUtil` 中：

```java
public static String getJmeterHome() {
    return Objects.requireNonNull(
            StressTestUtil.class.getClassLoader().getResource("jmeter")
    ).getPath();
}
```

它通过类加载器找到 `jmeter` 资源目录。找不到时会抛出运行时异常，说明 JMeter 资源是启动执行的必要条件。

接着拼出 `bin` 目录和配置文件：

```java
String jmeterHomeBin = getJmeterHomeBin();
String propertiesPath = jmeterHomeBin
        + File.separator + "jmeter.properties";
```

然后初始化 JMeter：

```java
JMeterUtils.loadJMeterProperties(propertiesPath);
JMeterUtils.setJMeterHome(getJmeterHome());
JMeterUtils.setProperty("sampleresult.default.encoding", "utf-8");
JMeterUtils.initLocale();
```

每一步的意图是：

1. 读取 JMeter 默认属性。
2. 告诉 JMeter 根目录在哪里。
3. 统一采样结果的默认编码，减少响应乱码。
4. 初始化本地化环境。

最后才创建标准引擎：

```java
public static StandardJMeterEngine getJMeterEngine() {
    initJmeterProperties();
    return new StandardJMeterEngine();
}
```

这体现了一个重要顺序：先初始化运行环境，再创建引擎对象。

## 六、JMX 文件加载的完整步骤

归档中的可运行思路是：

```java
JMeterUtils.setJMeterHome(jmeterHome.getPath());
JMeterUtils.loadJMeterProperties(properties.getPath());

FileServer.getFileServer().setBaseForScript(jmxFile);
HashTree tree = SaveService.loadTree(jmxFile);
JMeter.convertSubTree(tree, false);

StandardJMeterEngine engine = new StandardJMeterEngine();
engine.configure(tree);
engine.run();
```

每一步可以翻译成人话：

1. 告诉 JMeter 去哪里找配置和依赖。
2. 告诉文件服务器脚本的相对路径基准。
3. 把 XML 格式的 JMX 读成 `HashTree`。
4. 把树中的组件转换成可执行对象。
5. 把测试计划交给引擎。
6. 启动执行。

当前 `cloud-meter` 已经有 `TestStress` 测试类保留这条实验链路；业务引擎中的 `StressJmxEngine.assembleTestPlan()` 仍为空，所以实验代码和正式执行链路要分开看。

## 七、当前阶段的安全使用方式

在没有把并发任务隔离、临时目录、停止任务和异常处理补齐前，不要把执行接口暴露给不受信任的用户输入。至少要注意：

- 不允许用户任意传入服务器本地路径。
- 上传 JMX 前限制文件大小和类型，并进行内容检查。
- 报告目录不能被用户路径穿越。
- 任务执行应有超时、取消和最大并发限制。
- 不要把请求头、请求体和响应体中的敏感信息无保护地写入日志或报告。

这些是平台真正上线前的工程约束，当前代码还没有全部实现。

## 八、本章复刻检查

- 能解释 Test Plan、Thread Group、Sampler、Assertion 和 Listener 的关系。
- 能读懂 `StressTestUtil` 为什么先加载 properties 再创建引擎。
- 能说出 `Runtime.exec` 与内嵌 JMeter 的工程差异。
- 能写出 JMX 到 `HashTree` 再到 `engine.run()` 的链路。
- 知道当前 `StressJmxEngine` 还没有把这条链路接进正式业务。

---

## 📚 相关代码

- `cloud-meter/cloud-engine/src/main/java/com/wychmod/util/StressTestUtil.java`
- `cloud-meter/cloud-engine/src/main/java/com/wychmod/service/stress/core/StressJmxEngine.java`
- `cloud-meter/cloud-engine/src/test/java/com/wychmod/stress/TestStress.java`
- [下一章：压测引擎与结果采集](04-压测引擎与结果采集.md)

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-28 | 新增 | 依据归档 JMeter 知识和当前 StressTestUtil、JMX 实验代码，补写嵌入式引擎教程 |
