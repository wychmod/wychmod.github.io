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

