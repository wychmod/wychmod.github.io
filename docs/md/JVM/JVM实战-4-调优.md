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
8. jstat -gc 打印gc信息，动态观察gc情况 / 阅读GC日志发现频繁GC / arthas观察 / jconsole/jvisualVM/ Jprofiler（最好用）
   jstat -gc 4655 500 : 每个500个毫秒打印GC的情况
   如果面试官问你是怎么定位OOM问题的？如果你回答用图形界面（错误）
   1：已经上线的系统不用图形界面用什么？（cmdline arthas）
   2：图形界面到底用在什么地方？测试！测试的时候进行监控！（压测观察）
9. jmap - histo 4655 | head -20，查找有多少对象产生 (在线定位可以影响性能但不大)
10. jmap -dump:format=b,file=xxx pid ：生成内存导出文件 (这个影响很大一般不用)

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
* heapdump + jhat分析
* jad反编译
   动态代理生成类的问题定位
   第三方的类（观察代码）
   版本问题（确定自己最新提交的版本是不是被使用）
* redefine 热替换
   目前有些限制条件：只能改方法实现（方法已经运行完成），不能改方法名， 不能改属性
   m() -> mm()
* sc  - search class
* watch  - watch method
* 没有包含的功能：jmap