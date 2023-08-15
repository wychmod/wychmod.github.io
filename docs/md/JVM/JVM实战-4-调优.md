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

