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