# 1. JVM调优第一步，了解JVM常用命令行参数

- JVM的命令行参数参考：[https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html)
    
- HotSpot参数分类
    
    > 标准： - 开头，所有的HotSpot都支持
    > 
    > 非标准：-X 开头，特定版本HotSpot支持特定命令
    > 
    > 不稳定：-XX 开头，下个版本可能取消
    
    java -version
    
    java -X

```java
// 内存溢出的程序
import java.util.List;
import java.util.LinkedList;

public class HelloGC {
  public static void main(String[] args) {
    System.out.println("HelloGC!");
    List list = new LinkedList();
    for(;;) {
      byte[] b = new byte[1024*1024];
      list.add(b);
    }
  }
}
```

1. 区分概念：内存泄漏memory leak，内存溢出out of memory
	1. 内存泄漏：有一块无人占用的内存
	2. 内存溢出：不断产生对象
2. java -XX:+PrintCommandLineFlags HelloGC(主要用于获取和打印当前正在运行的 Java 程序的命令行参数和标志。)
3. java -Xmn10M(新生代大小) -Xms40M(最小堆大小) -Xmx60M（最大堆大小，一般设为和最小一样，防止弹性浪费系统资源） -XX:+PrintCommandLineFlags -XX:+PrintGC HelloGC 
	PrintGCDetails PrintGCTimeStamps PrintGCCauses (打印GC详细，打印GC原因)
4. java -XX:+UseConcMarkSweepGC -XX:+PrintCommandLineFlags HelloGC
    cms垃圾回收器，命令会比较频繁
5. java -XX:+PrintFlagsInitial 默认参数值
6. java -XX:+PrintFlagsFinal 最终参数值
7. java -XX:+PrintFlagsFinal | grep xxx 找到对应的参数
8. java -XX:+PrintFlagsFinal -version |grep GC

![](../youdaonote-images/Pasted%20image%2020230817094842.png)
# 2.PS GC日志详解

> 每种垃圾回收器的日志格式是不同的！

PS日志格式

![](../youdaonote-images/Pasted%20image%2020230815154917.png)

times: user(用户态) sys（内核态） real（实际耗时）

**一旦产生内存溢出，会把整个堆给你heap dump出来**
heap dump部分格式如下：
![](../youdaonote-images/Pasted%20image%2020230815162335.png)

```java
eden space 5632K, 94% used [0x00000000ff980000,0x00000000ffeb3e28,0x00000000fff00000)
                            后面的内存地址指的是，起始地址，使用空间结束地址，整体空间结束地址
```

> total = eden + 1个survivor


# 3.调优前的基础概念：
1. 吞吐量：用户代码时间 /（用户代码执行时间 + 垃圾回收时间）
2. 响应时间：STW越短，响应时间越好

所谓调优，首先确定，追求啥？吞吐量优先，还是响应时间优先？还是在满足一定的响应时间的情况下，要求达到多大的吞吐量...

问题：

科学计算，吞吐量。数据挖掘，thrput。吞吐量优先的一般：（PS + PO）

响应时间：网站 GUI API （1.8 G1）

# 4. 什么是调优？
1. 根据需求进行JVM规划和预调优
2. 优化运行JVM运行环境（慢，卡顿）
3. 解决JVM运行过程中出现的各种问题(OOM)

## 4.1 调优，从规划开始
### 4.1.1 调优步骤

* 调优，从业务场景开始，没有业务场景的调优都是耍流氓
* 无监控（压力测试，能看到结果），不调优
* 步骤：
  1. 熟悉业务场景（没有最好的垃圾回收器，只有最合适的垃圾回收器）
		1. 响应时间、停顿时间 [CMS G1 ZGC] （需要给用户作响应）
		2. 吞吐量 = 用户时间 /( 用户时间 + GC时间) [PS]
  2. 选择回收器组合
  3. 计算内存需求（经验值 1.5G 16G）内存小回收快也可以接受，所以不是越大越好
  4. 选定CPU（越高越好）
  5. 设定年代大小、升级年龄
  6. 设定日志参数
     1. -Xloggc:/opt/xxx/logs/xxx-xxx-gc-%t.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCCause
     2. 或者每天产生一个日志文件
  7. 观察日志情况
### 4.1.2 预调优案例

- 儒猿案例1: 有个计算系统，每次YGC后会有200mb的垃圾，同时垃圾很快就可以回收，但是s区只有100mb会直接进入old区，多次后出发FULLGC，实际上可以通过调优，扩大s区的内存，让他进去s区，然后通过YGC回收。

```java
-Xms3072M -Xmx3072M -Xmn2048M -Xss1M -XX:PermSize=256M -XX:MaxPermSize=256M -
XX:SurvivorRatio=8 -XX:MaxTenuringThreshold=5 -XX:PretenureSizeThreshold=1M -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFaction=92 -XX:+UseCMSCompactAtFullCollection -XX:CMSFullGCsBeforeCompaction=0
```

>Full GC优化的前提是Minor GC的优化，Minor GC的优化的前提是合理分配内存空间，合理分配内存空间的前提是对系统运行期间的内存使用模型进行预估。 

> 其实对很多普通的Java系统而言，只要对系统运行期间的内存使用模型做好预估，然后分配好合理的内存空间，尽量让Minor GC之后的存活对象留在Survivor里不要去老年代，然后其余的GC参数不做太多优化，系统性能基本上就不会太差。

* 案例1：垂直电商，最高每日百万订单，处理订单系统需要什么样的服务器配置？

  > 这个问题比较业余，因为很多不同的服务器配置都能支撑(1.5G 16G)
  >
  > 1小时360000集中时间段， 100个订单/秒，（找一小时内的高峰期，1000订单/秒）
  >
  > 经验值，
  >
  > 非要计算：一个订单产生需要多少内存？512K * 1000 500M内存
  >
  > 专业一点儿问法：要求响应时间100ms
  >
  > 压测！
  
* 案例2：12306遭遇春节大规模抢票应该如何支撑？

  > 12306应该是中国并发量最大的秒杀网站：
  >
  > 号称并发量100W最高
  >
  > CDN -> LVS -> NGINX -> 业务系统 -> 每台机器1W并发（10K问题） 100台机器
  >
  > 普通电商订单 -> 下单 ->订单系统（IO）减库存 ->等待用户付款
  >
  > 12306的一种可能的模型： 下单 -> 减库存 和 订单(redis kafka) 同时异步进行 ->等付款
  >
  > 减库存最后还会把压力压到一台服务器
  >
  > 可以做分布式本地库存 + 单独服务器做库存均衡
  >
  > 大流量的处理方法：分而治之
  
* 怎么得到一个事务会消耗多少内存？

  > 1. 弄台机器，看能承受多少TPS(Transactions Per Second)？是不是达到目标？扩容或调优，让它达到
  >
  > 2. 用压测来确定

## 4.2 优化环境

1. 有一个50万PV的资料类网站（从磁盘提取文档到内存）原服务器32位，1.5G的堆，用户反馈网站比较缓慢，因此公司决定升级，新的服务器为64位，16G的堆内存，结果用户反馈卡顿十分严重，反而比以前效率更低了
	1. 为什么原网站慢?
	      很多用户浏览数据，很多数据load到内存，内存不足，频繁GC，STW长，响应时间变慢
	2. 为什么会更卡顿？
	      内存越大，FGC时间越长
	3. 咋办？
	      PS -> PN + CMS 或者 G1
2. 系统CPU经常100%，如何调优？(面试高频)
	CPU100%那么一定有线程在占用系统资源，
   1. 找出哪个进程cpu高（top）
   2. 该进程中的哪个线程cpu高（top -Hp）
   3. 导出该线程的堆栈 (jstack)
   4. 查找哪个方法（栈帧）消耗时间 (jstack)
   5. 工作线程占比高 | 垃圾回收线程占比高
3. 系统内存飙高，如何查找问题？（面试高频）
   1. 导出堆内存 (jmap)
   2. 分析 (jhat jvisualvm mat jprofiler ... )
4. 如何监控JVM
   1. jstat jvisualvm jprofiler arthas top...

## 4.2.1 一个案例

```java
package com.mashibing.jvm.gc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
* 从数据库中读取信用数据，套用模型，并把结果进行记录和传输
*/

public class T15_FullGC_Problem01 {

   private static class CardInfo {
	   BigDecimal price = new BigDecimal(0.0);
	   String name = "张三";
	   int age = 5;
	   Date birthdate = new Date();

	   public void m() {}
   }

   private static ScheduledThreadPoolExecutor executor = new ScheduledThreadPoolExecutor(50,
		   new ThreadPoolExecutor.DiscardOldestPolicy());

   public static void main(String[] args) throws Exception {
	   executor.setMaximumPoolSize(50);

	   for (;;){
		   modelFit();
		   Thread.sleep(100);
	   }
   }

   private static void modelFit(){
	   List<CardInfo> taskList = getAllCardInfo();
	   taskList.forEach(info -> {
		   // do something
		   executor.scheduleWithFixedDelay(() -> {
			   //do sth with info
			   info.m();

		   }, 2, 3, TimeUnit.SECONDS);
	   });
   }

   private static List<CardInfo> getAllCardInfo(){
	   List<CardInfo> taskList = new ArrayList<>();

	   for (int i = 0; i < 100; i++) {
		   CardInfo ci = new CardInfo();
		   taskList.add(ci);
	   }

	   return taskList;
   }
}
   
```

1. java -Xms200M -Xmx200M -XX:+PrintGC com.mashibing.jvm.gc.T15_FullGC_Problem01
2. 一般是运维团队首先受到报警信息（CPU Memory）
3. top命令观察到问题：内存不断增长 CPU占用率居高不下
4. top -Hp xxx 观察进程中的线程，哪个线程CPU和内存占比高
5. jps定位具体java进程
   jstack 定位线程状况，重点关注：WAITING BLOCKED
   eg.
   waiting on <0x0000000088ca3310> (a java.lang.Object)
   假如有一个进程中100个线程，很多线程都在waiting on \<xx\> ，一定要找到是哪个线程持有这把锁
   怎么找？搜索jstack dump的信息，找\<xx\> ，看哪个线程持有这把锁RUNNABLE
6. 为什么阿里规范里规定，线程的名称（尤其是线程池）都要写有意义的名称
   怎么样自定义线程池里的线程名称？（自定义ThreadFactory）
7. jinfo pid 把进程中的详细信息列出来，作用不大。
8. jstat -gc Pid 打印gc信息，动态观察gc情况，观察eden的增长情况 / 阅读GC日志发现频繁GC / arthas观察 / jconsole/jvisualVM/ Jprofiler（最好用）
   jstat -gc 4655 500 : 每个500个毫秒打印GC的情况
	S0C：这是From Survivor区的大小
	S1C：这是To Survivor区的大小
	S0U：这是From Survivor区当前使用的内存大小
	S1U：这是To Survivor区当前使用的内存大小
	EC：这是Eden区的大小
	EU：这是Eden区当前使用的内存大小
	OC：这是老年代的大小
	OU：这是老年代当前使用的内存大小
	MC：这是方法区（永久代、元数据区）的大小
	MU：这是方法区（永久代、元数据区）的当前使用的内存大小
	YGC：这是系统运行迄今为止的Young GC次数
	YGCT：这是Young GC的耗时
	FGC：这是系统运行迄今为止的Full GC次数
	FGCT：这是Full GC的耗时
	GCT：这是所有GC的总耗时

jstat -gc PID 1000 10
每隔1秒钟更新出来最新的一行jstat统计信息，一共执行10次jstat统计

   如果面试官问你是怎么定位OOM问题的？如果你回答用图形界面（错误）
   1：已经上线的系统不用图形界面用什么？（cmdline arthas）
   2：图形界面到底用在什么地方？测试！测试的时候进行监控！（压测观察）
9. jmap - histo 4655 | head -20，查找有多少对象产生 (在线定位可以影响性能但不大)
10. jmap -head Pid 会打印出来堆内存相关的一些参数设置，然后就是当前堆内存里的一些基本各个区域的情况
11. jmap -dump:format=b,file=xxx pid ：生成内存导出文件 (这个影响很大一般不用)

    线上系统，内存特别大，jmap执行期间会对进程产生很大影响，甚至卡顿（电商不适合）
    1：设定了参数HeapDump，OOM的时候会自动产生堆转储文件
    2：<font color='red'>很多服务器备份（高可用），停掉这台服务器对其他服务器不影响</font>
    3：在线定位(一般小点儿公司用不到)
11. java -Xms20M -Xmx20M -XX:+UseParallelGC -XX:+HeapDumpOnOutOfMemoryError com.mashibing.jvm.gc.T15_FullGC_Problem01 (内存溢出时生成heap dump)
12. 使用MAT / jhat /jvisualvm 进行dump文件分析
     https://www.cnblogs.com/baihuitestsoftware/articles/6406271.html 
    jhat -J-mx512M xxx.dump
    http://192.168.17.11:7000
    拉到最后：找到对应链接
    可以使用OQL查找特定问题对象
13. 找到代码的问题

### 4.2.2 jconsole远程连接

jdk自带的，比较直观，java有一个标准的访问远程服务器的这样的协议JMX

1. 程序启动加入参数：

```shell
java -Djava.rmi.server.hostname=192.168.17.11 -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=11111 -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false XXX
```

2. 如果遭遇 Local host name unknown：XXX的错误，修改/etc/hosts文件，把XXX加入进去

```java
   192.168.17.11 basic localhost localhost.localdomain localhost4 localhost4.localdomain4
   ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
```

3. 关闭linux防火墙（实战中应该打开对应端口）

```shell
service iptables stop
chkconfig iptables off #永久关闭
```

4. windows上打开 jconsole远程连接 192.168.17.11:11111
> 现在也用的比较少。

### 4.2.3 jvisualvm远程连接

https://www.cnblogs.com/liugh/p/7620336.html （简单做法）

![](../youdaonote-images/Pasted%20image%2020230815173746.png)

### 4.2.4 jprofiler (收费)

### 4.2.5 arthas在线排查工具

* 为什么需要在线排查？
   在生产上我们经常会碰到一些不好排查的问题，例如线程安全问题，用最简单的threaddump或者heapdump不好查到问题原因。为了排查这些问题，有时我们会临时加一些日志，比如在一些关键的函数里打印出入参，然后重新打包发布，如果打了日志还是没找到问题，继续加日志，重新打包发布。对于上线流程复杂而且审核比较严的公司，从改代码到上线需要层层的流转，会大大影响问题排查的进度。 
* jvm观察jvm信息
* thread定位线程问题
* dashboard 观察系统情况
* heapdump导出堆内存信息 + jhat分析
* jad反编译
   动态代理生成类的问题定位
   第三方的类（观察代码）
   版本问题（确定自己最新提交的版本是不是被使用）
* redefine 热替换
   目前有些限制条件：只能改方法实现（方法已经运行完成），不能改方法名， 不能改属性
   m() -> mm()
* sc  - search class
* watch  - watch method 观察方法执行结果
* 没有包含的功能：jmap

## 4.3 案例汇总

OOM产生的原因多种多样，有些程序未必产生OOM，不断FGC(CPU飙高，但内存回收特别少) （上面案例）

1. 硬件升级系统反而卡顿的问题（见上）

2. 线程池不当运用产生OOM问题（见上）
   不断的往List里加对象（实在太LOW）

3. smile jira问题
   实际系统不断重启
   解决问题 加内存 + 更换垃圾回收器 G1
   真正问题在哪儿？不知道

4. tomcat http-header-size过大问题（Hector） 这个参数设置过大，每一个http链接就占很大内存。

5. lambda表达式导致方法区溢出问题(MethodArea / Perm Metaspace)
   LambdaGC.java     -XX:MaxMetaspaceSize=9M -XX:+PrintGCDetails
   lambda会产生内部类。

   ```java
   "C:\Program Files\Java\jdk1.8.0_181\bin\java.exe" -XX:MaxMetaspaceSize=9M -XX:+PrintGCDetails "-javaagent:C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2019.1\lib\idea_rt.jar=49316:C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2019.1\bin" -Dfile.encoding=UTF-8 -classpath "C:\Program Files\Java\jdk1.8.0_181\jre\lib\charsets.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\deploy.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\access-bridge-64.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\cldrdata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\dnsns.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jaccess.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jfxrt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\localedata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\nashorn.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunec.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunjce_provider.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunmscapi.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunpkcs11.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\zipfs.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\javaws.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jce.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfr.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfxswt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jsse.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\management-agent.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\plugin.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\resources.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\rt.jar;C:\work\ijprojects\JVM\out\production\JVM;C:\work\ijprojects\ObjectSize\out\artifacts\ObjectSize_jar\ObjectSize.jar" com.mashibing.jvm.gc.LambdaGC
   [GC (Metadata GC Threshold) [PSYoungGen: 11341K->1880K(38400K)] 11341K->1888K(125952K), 0.0022190 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
   [Full GC (Metadata GC Threshold) [PSYoungGen: 1880K->0K(38400K)] [ParOldGen: 8K->1777K(35328K)] 1888K->1777K(73728K), [Metaspace: 8164K->8164K(1056768K)], 0.0100681 secs] [Times: user=0.02 sys=0.00, real=0.01 secs] 
   [GC (Last ditch collection) [PSYoungGen: 0K->0K(38400K)] 1777K->1777K(73728K), 0.0005698 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
   [Full GC (Last ditch collection) [PSYoungGen: 0K->0K(38400K)] [ParOldGen: 1777K->1629K(67584K)] 1777K->1629K(105984K), [Metaspace: 8164K->8156K(1056768K)], 0.0124299 secs] [Times: user=0.06 sys=0.00, real=0.01 secs] 
   java.lang.reflect.InvocationTargetException
   	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
   	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
   	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
   	at java.lang.reflect.Method.invoke(Method.java:498)
   	at sun.instrument.InstrumentationImpl.loadClassAndStartAgent(InstrumentationImpl.java:388)
   	at sun.instrument.InstrumentationImpl.loadClassAndCallAgentmain(InstrumentationImpl.java:411)
   Caused by: java.lang.OutOfMemoryError: Compressed class space
   	at sun.misc.Unsafe.defineClass(Native Method)
   	at sun.reflect.ClassDefiner.defineClass(ClassDefiner.java:63)
   	at sun.reflect.MethodAccessorGenerator$1.run(MethodAccessorGenerator.java:399)
   	at sun.reflect.MethodAccessorGenerator$1.run(MethodAccessorGenerator.java:394)
   	at java.security.AccessController.doPrivileged(Native Method)
   	at sun.reflect.MethodAccessorGenerator.generate(MethodAccessorGenerator.java:393)
   	at sun.reflect.MethodAccessorGenerator.generateSerializationConstructor(MethodAccessorGenerator.java:112)
   	at sun.reflect.ReflectionFactory.generateConstructor(ReflectionFactory.java:398)
   	at sun.reflect.ReflectionFactory.newConstructorForSerialization(ReflectionFactory.java:360)
   	at java.io.ObjectStreamClass.getSerializableConstructor(ObjectStreamClass.java:1574)
   	at java.io.ObjectStreamClass.access$1500(ObjectStreamClass.java:79)
   	at java.io.ObjectStreamClass$3.run(ObjectStreamClass.java:519)
   	at java.io.ObjectStreamClass$3.run(ObjectStreamClass.java:494)
   	at java.security.AccessController.doPrivileged(Native Method)
   	at java.io.ObjectStreamClass.<init>(ObjectStreamClass.java:494)
   	at java.io.ObjectStreamClass.lookup(ObjectStreamClass.java:391)
   	at java.io.ObjectOutputStream.writeObject0(ObjectOutputStream.java:1134)
   	at java.io.ObjectOutputStream.defaultWriteFields(ObjectOutputStream.java:1548)
   	at java.io.ObjectOutputStream.writeSerialData(ObjectOutputStream.java:1509)
   	at java.io.ObjectOutputStream.writeOrdinaryObject(ObjectOutputStream.java:1432)
   	at java.io.ObjectOutputStream.writeObject0(ObjectOutputStream.java:1178)
   	at java.io.ObjectOutputStream.writeObject(ObjectOutputStream.java:348)
   	at javax.management.remote.rmi.RMIConnectorServer.encodeJRMPStub(RMIConnectorServer.java:727)
   	at javax.management.remote.rmi.RMIConnectorServer.encodeStub(RMIConnectorServer.java:719)
   	at javax.management.remote.rmi.RMIConnectorServer.encodeStubInAddress(RMIConnectorServer.java:690)
   	at javax.management.remote.rmi.RMIConnectorServer.start(RMIConnectorServer.java:439)
   	at sun.management.jmxremote.ConnectorBootstrap.startLocalConnectorServer(ConnectorBootstrap.java:550)
   	at sun.management.Agent.startLocalManagementAgent(Agent.java:137)
   
   ```

6. 直接内存溢出问题（少见）
   《深入理解Java虚拟机》P59，使用Unsafe分配直接内存，或者使用NIO的问题

7. 栈溢出问题
   -Xss设定太小

8. 比较一下这两段程序的异同，分析哪一个是更优的写法：第一个写法更优创建o引用更少。

   ```java 
   Object o = null;
   for(int i=0; i<100; i++) {
       o = new Object();
       //业务处理
   }
   ```

   ```java
   for(int i=0; i<100; i++) {
       Object o = new Object();
   }
   ```

9. 重写finalize引发频繁GC
   小米云，HBase同步系统，系统通过nginx访问超时报警，最后排查，C++程序员重写finalize引发频繁GC问题
   为什么C++程序员会重写finalize？（new delete）以为java有c的析构函数
   finalize耗时比较长（200ms）
   
10. 如果有一个系统，内存一直消耗不超过10%，但是观察GC日志，发现FGC总是频繁产生，会是什么引起的？
    System.gc() (有人手写了这个，这个比较Low)

11. Distuptor有个可以设置链的长度，如果过大，然后对象大，消费完不主动释放，会溢出 (来自 死物风情)

12. 用jvm都会溢出，mycat用崩过，1.6.5某个临时版本解析sql子查询算法有问题，9个exists的联合sql就导致生成几百万的对象（来自 死物风情）

13. new 大量线程，会产生 native thread OOM，（low）应该用线程池，
    解决方案：减少堆空间（太TMlow了）,预留更多内存产生native thread
    JVM内存占物理内存比例 50% - 80%

# 5 cms日志详解

执行命令：java -Xms20M -Xmx20M -XX:+PrintGCDetails -XX:+UseConcMarkSweepGC com.mashibing.jvm.gc.T15_FullGC_Problem01

[GC (Allocation Failure) [ParNew: 6144K->640K(6144K), 0.0265885 secs] 6585K->2770K(19840K), 0.0268035 secs] [Times: user=0.02 sys=0.00, real=0.02 secs]

> ParNew：年轻代收集器
> 
> 6144->640：收集前后的对比
> 
> （6144）：整个年轻代容量
> 
> 6585 -> 2770：整个堆的情况
> 
> （19840）：整个堆大小


```java
[GC (CMS Initial Mark) [1 CMS-initial-mark: 8511K(13696K)] 9866K(19840K), 0.0040321 secs] [Times: user=0.01 sys=0.00, real=0.00 secs] 
	//8511 (13696) : 老年代使用（最大）
	//9866 (19840) : 整个堆使用（最大）
[CMS-concurrent-mark-start]
[CMS-concurrent-mark: 0.018/0.018 secs] [Times: user=0.01 sys=0.00, real=0.02 secs] 
	//这里的时间意义不大，因为是并发执行
[CMS-concurrent-preclean-start]
[CMS-concurrent-preclean: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
	//标记Card为Dirty，也称为Card Marking
[GC (CMS Final Remark) [YG occupancy: 1597 K (6144 K)][Rescan (parallel) , 0.0008396 secs][weak refs processing, 0.0000138 secs][class unloading, 0.0005404 secs][scrub symbol table, 0.0006169 secs][scrub string table, 0.0004903 secs][1 CMS-remark: 8511K(13696K)] 10108K(19840K), 0.0039567 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
	//STW阶段，YG occupancy:年轻代占用及容量
	//[Rescan (parallel)：STW下的存活对象标记
	//weak refs processing: 弱引用处理
	//class unloading: 卸载用不到的class
	//scrub symbol(string) table: 
		//cleaning up symbol and string tables which hold class-level metadata and 
		//internalized string respectively
	//CMS-remark: 8511K(13696K): 阶段过后的老年代占用及容量
	//10108K(19840K): 阶段过后的堆占用及容量

[CMS-concurrent-sweep-start]
[CMS-concurrent-sweep: 0.005/0.005 secs] [Times: user=0.00 sys=0.00, real=0.01 secs] 
	//标记已经完成，进行并发清理
[CMS-concurrent-reset-start]
[CMS-concurrent-reset: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
	//重置内部结构，为下次GC做准备
```

# 6.G1日志详解
```java
[GC pause (G1 Evacuation Pause) (young) (initial-mark), 0.0015790 secs]  
//young -> 年轻代 Evacuation-> 复制存活对象   
//initial-mark 混合回收的阶段，这里是YGC混合老年代回收，看到initial-mark说明mixedGC已经开始
   [Parallel Time: 1.5 ms, GC Workers: 1] //一个GC线程  
      [GC Worker Start (ms):  92635.7]  
      [Ext Root Scanning (ms):  1.1]  
      [Update RS (ms):  0.0]  
         [Processed Buffers:  1]  
      [Scan RS (ms):  0.0]  
      [Code Root Scanning (ms):  0.0]  
      [Object Copy (ms):  0.1]  
      [Termination (ms):  0.0]  
         [Termination Attempts:  1]  
      [GC Worker Other (ms):  0.0]  
      [GC Worker Total (ms):  1.2]  
      [GC Worker End (ms):  92636.9]  
   [Code Root Fixup: 0.0 ms]  
   [Code Root Purge: 0.0 ms]  
   [Clear CT: 0.0 ms]  
   [Other: 0.1 ms]  
      [Choose CSet: 0.0 ms]  
      [Ref Proc: 0.0 ms]  
      [Ref Enq: 0.0 ms]  
      [Redirty Cards: 0.0 ms]  
      [Humongous Register: 0.0 ms]  
      [Humongous Reclaim: 0.0 ms]  
      [Free CSet: 0.0 ms]  
   [Eden: 0.0B(1024.0K)->0.0B(1024.0K) Survivors: 0.0B->0.0B Heap: 18.8M(20.0M)->18.8M(20.0M)]  
   // 三个区从多少收到多少
 [Times: user=0.00 sys=0.00, real=0.00 secs]   
//以下是混合回收其他阶段  
[GC concurrent-root-region-scan-start]  
[GC concurrent-root-region-scan-end, 0.0000078 secs]  
[GC concurrent-mark-start]  
//无法evacuation，进行FGC  
[Full GC (Allocation Failure)  18M->18M(20M), 0.0719656 secs]  
   [Eden: 0.0B(1024.0K)->0.0B(1024.0K) Survivors: 0.0B->0.0B Heap: 18.8M(20.0M)->18.8M(20.0M)], [Metaspace: 38  
76K->3876K(1056768K)] [Times: user=0.07 sys=0.00, real=0.07 secs]  
​
```

# GC常用参数

- -Xmn -Xms -Xmx -Xss 年轻代 最小堆 最大堆 栈空间
    
- -XX:+UseTLAB (不建议动) 使用TLAB，默认打开
    
- -XX:+PrintTLAB (不建议动) 打印TLAB的使用情况
    
- -XX:TLABSize (不建议动) 设置TLAB大小
    
- -XX:+DisableExplictGC System.gc()不管用 ，这是FGC，一般线上用
    
- -XX:+PrintGC
    
- -XX:+PrintGCDetails
    
- -XX:+PrintHeapAtGC 打印堆栈情况
    
- -XX:+PrintGCTimeStamps
    
- -XX:+PrintGCApplicationConcurrentTime (低) 打印应用程序时间
    
- -XX:+PrintGCApplicationStoppedTime （低） 打印暂停时长
    
- -XX:+PrintReferenceGC （重要性低） 记录回收了多少种不同引用类型的引用
    
- -verbose:class 类加载详细过程
    
- -XX:+PrintVMOptions
    
- -XX:+PrintFlagsFinal -XX:+PrintFlagsInitial 必须会用,查询参数和ps结合
    
- -Xloggc:opt/log/gc.log
    
- -XX:MaxTenuringThreshold 升代年龄，最大值15
    
- 锁自旋次数 -XX:PreBlockSpin 热点代码检测参数-XX:CompileThreshold 逃逸分析 标量替换 ... 这些不建议设置
    

# Parallel常用参数

- -XX:SurvivorRatio
    
- -XX:PreTenureSizeThreshold 大对象到底多大
    
- -XX:MaxTenuringThreshold
    
- -XX:+ParallelGCThreads 并行收集器的线程数，同样适用于CMS，一般设为和CPU核数相同
    
- -XX:+UseAdaptiveSizePolicy 自动选择各区大小比例
    

### CMS常用参数

- -XX:+UseConcMarkSweepGC
    
- -XX:ParallelCMSThreads CMS线程数量
    
- -XX:CMSInitiatingOccupancyFraction 使用多少比例的老年代后开始CMS收集，默认是68%(近似值)，如果频繁发生SerialOld卡顿，应该调小，（频繁CMS回收）
    
- -XX:+UseCMSCompactAtFullCollection 在FGC时进行压缩
    
- -XX:CMSFullGCsBeforeCompaction 多少次FGC之后进行压缩
    
- -XX:+CMSClassUnloadingEnabled
    
- -XX:CMSInitiatingPermOccupancyFraction 达到什么比例时进行Perm回收 1.8之前才有
    
- GCTimeRatio 设置GC时间占用程序运行时间的百分比
    
- -XX:MaxGCPauseMillis 停顿时间，是一个建议时间，GC会尝试用各种手段达到这个时间，比如减小年轻代
    

# G1常用参数

- -XX:+UseG1GC
    
- -XX:MaxGCPauseMillis stw时间建议值，G1会尝试调整Young区的块数来达到这个值
    
- -XX:GCPauseIntervalMillis ？GC的间隔时间
    
- -XX:+G1HeapRegionSize 分区大小，建议逐渐增大该值，1 2 4 8 16 32。 随着size增加，垃圾的存活时间更长，GC间隔更长，但每次GC的时间也会更长 ZGC做了改进（动态区块大小）
    
- G1NewSizePercent 新生代最小比例，默认为5%
    
- G1MaxNewSizePercent 新生代最大比例，默认为60%
    
- GCTimeRatio GC时间建议比例，G1会根据这个值调整堆空间
    
- ConcGCThreads 线程数量
    
- InitiatingHeapOccupancyPercent 启动G1的堆空间占用比例