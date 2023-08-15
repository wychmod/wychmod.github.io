# 1. GC的基础知识

## 1.1 什么是垃圾

> C语言申请内存：malloc free
>
> C++： new delete
>
> c/C++ 手动回收内存
>
> Java: new ？
>
> 自动内存回收，编程上简单，系统不容易出错，手动释放内存，容易出两种类型的问题：
>
> 1. 忘记回收
> 2. 多次回收

没有任何引用指向的一个对象或者多个对象（循环引用）

## 1.2 如何定位垃圾

### 1.2.1 引用计数（ReferenceCount）

### 1.2.2 根可达算法(RootSearching)

> 根可达算法（Root Reachable Algorithm）是一种用于图中节点可达性判断的算法。该算法通过判断从根节点出发，是否可以到达目标节点来确定节点的可达性。

![](../youdaonote-images/Pasted%20image%2020230813232206.png)

## 1.3 常见的垃圾回收算法

### 1.3.1 标记清除(mark sweep)
- 标记
找出内存中需要回收的对象，并且把它们标记出来(需要扫描两遍，第一遍找出不可回收的，第二遍找到可以回收的)
![](../youdaonote-images/Pasted%20image%2020230813232659.png)
- 清除
清除掉被标记需要回收的对象，释放出对应的内存空间
![](../youdaonote-images/Pasted%20image%2020230813232710.png)
- 缺点
位置不连续 产生碎片 效率偏低（两遍扫描）

> 适合存活对象较多的情况
### 1.3.2 拷贝算法 (copying)
![](../youdaonote-images/Pasted%20image%2020230813233110.png)

> 没有碎片，浪费空间，移动对象，需要调整对象引用，适合活跃对象较少的情况。
### 1.3.3 标记压缩(mark compact)

标记过程仍然与"标记-清除"算法一样，但是后续步骤不是直接对可回收对象进行清理，而是让所有存活的对象都向一端移动，然后直接清理掉端边界以外的内存。

> 其实上述过程相对"复制算法"来讲，少了一个"保留区"

![](../youdaonote-images/Pasted%20image%2020230813233441.png)

让所有存活的对象都向一端移动，清理掉边界意外的内存。

![](../youdaonote-images/Pasted%20image%2020230813233453.png)

## 1.4 JVM分代算法

- Young区：复制算法(对象在被分配之后，可能生命周期比较短，Young区复制效率比较高)
- Old区：标记清除或标记整理(Old区对象存活时间比较长，复制来复制去没必要，不如做个标记再清理)(g1使用copy)

## 1.5 JVM内存分代模型（用于分代垃圾回收算法）

### 1.5.1 部分垃圾回收器使用的模型

   > 除Epsilon ZGC Shenandoah之外的GC都是使用逻辑分代模型
   >
   > G1是逻辑分代，物理不分代
   >
   > 除此之外不仅逻辑分代，而且物理分代

### 1.5.2 堆内存逻辑分区
![](../youdaonote-images/Pasted%20image%2020230813235001.png)

![](../youdaonote-images/Pasted%20image%2020230813235848.png)
![](../youdaonote-images/Pasted%20image%2020230813235925.png)
1. 新生代（刚new出来）
	1. Eden + 2个suvivor区 (两个suvivor是为了方便复制，这样没有空间碎片，如果只有一个就会产生空间碎片)
	2. 栈上放不下，进入伊甸区
	3. YGC回收之后，大多数的对象会被回收，活着的进入s1
	4. 再次YGC，活着的对象eden + s1 -> s2
	5. 再次YGC，eden + s2 -> s1
	6. 年龄足够 -> 老年代 （15 CMS 6）
	7. s区装不下 -> 老年代 (分配担保：YGC期间 survivor区空间不够了 空间担保直接进入老年代)
2. 老年代（也叫old 也叫tenured终身代）
	1. 顽固分子
	2. 老年代满了FGC Full GC
3. GC Tuning (Generation)
	1. 尽量减少FGC
	2. MinorGC = YGC
	3. MajorGC = FGC
4. 栈上分配(栈上分配比堆上分配快)
	-  线程私有小对象
	-  无逃逸
	- 支持标量替换
	- 无需调整
5. 线程本地分配TLAB （Thread Local Allocation Buffer） – 占用eden，默认1% 
	- 多线程的时候不用竞争eden就可以申请空间，提高效率
	- 小对象
	-  无需调整
![](../youdaonote-images/Pasted%20image%2020230814001929.png)
## 1.6 对象何时进入老年代

- 超过 XX:MaxTenuringThreshold 指定次数（YGC） – Parallel Scavenge 15
	- CMS 6
	-  G1 15
- 动态年龄
	- s1 - > s2超过50%
	- 把年龄最大的放入O
![](../youdaonote-images/Pasted%20image%2020230814001406.png)

## 1.7 常见的垃圾回收器

![](../youdaonote-images/Pasted%20image%2020230814002122.png)

-  JDK诞生 Serial追随 提高效率，诞生了PS，为了配合CMS，诞生了PN，CMS是1.4版本后期引入，CMS是里程碑式的GC，它开启了并发回收的过程，但是CMS毛病较多，因此目前没有任何一个JDK版本默认是CMS 并发垃圾回收是因为无法忍受STW

### 1.7.1 Serial 
- 年轻代 串行回收 停顿时间较长

![](../youdaonote-images/Pasted%20image%2020230814002516.png)

### 1.7.2 SerialOld

![](../youdaonote-images/Pasted%20image%2020230814002613.png)

### 1.7.3 PS 
- 年轻代 并行回收

### 1.7.4 ParNew
- 年轻代 配合CMS的并行回收 更注重吞吐
![](../youdaonote-images/Pasted%20image%2020230814002903.png)

### 1.7.5 ParallelOld 
- 是Parallel Scavenge收集器的老年代版本

### 1.7.6 **CMS**
-  ConcurrentMarkSweep 老年代 并发的， 垃圾回收和应用程序同时运行，降低STW的时间(200ms) CMS问题比较多，所以现在没有一个版本默认是CMS，只能手工指定 CMS既然是MarkSweep，就一定会有碎片化的问题，碎片到达一定程度，CMS的老年代分配对象分配不下的时候，使用SerialOld 进行老年代回收 想象一下： 
	PS + PO -> 10g内存 停11s，换垃圾回收器 -> PN + CMS + SerialOld（几个小时 - 几天的STW）
	几十个G的内存，单线程回收 -> G1 + FGC 
	几十个G -> 上T内存的服务器 ZGC 算法：三色标记 + Incremental Update
![](../youdaonote-images/Pasted%20image%2020230814003953.png)
```java
(1)初始标记 CMS initial mark 标记GC Roots直接关联对象，不用Tracing，速度很快 
(2)并发标记 CMS concurrent mark 进行GC Roots Tracing 
(3)重新标记 CMS remark 修改并发标记因用户程序变动的内容 
(4)并发清除 CMS concurrent sweep 清除不可达对象回收空间，同时有新垃圾产生，留着下次清理称为 浮动垃圾
```

> 优点：并发收集、低停顿
> 缺点：产生大量空间碎片、并发阶段会降低吞吐量，还会并发失败，会用Serial old来清理

**concurrent mark阶段的算法**
- 三色标记 + Incremental Update

**CMS的问题**

1. Memory Fragmentation内存碎片
    
    > -XX:+UseCMSCompactAtFullCollection 
    > -XX:CMSFullGCsBeforeCompaction 默认为0 指的是经过多少次FGC才进行压缩
    
2. Floating Garbage 浮动垃圾
    
    > 如果并发收集器无法在年老代填充之前完成回收不可访问的对象，或者如果分配不能满足年老代中的可用空闲空间块，则暂停应用程序，并在所有应用程序线程停止的情况下完成收集
    > 
    > 解决方案：降低触发CMS的阈值
    > 
    > PromotionFailed
    > 
    > 解决方案类似，保持老年代有足够的空间
    > 
    > –XX:CMSInitiatingOccupancyFraction 92% 可以降低这个值，让CMS保持老年代足够的空间

### 1.7.7 G1(10ms) 
- 算法：三色标记 + SATB

### 1.7.8 ZGC (1ms) 
- PK C++ 算法：ColoredPointers + LoadBarrier

### 1.7.9 Shenandoah 
- 算法：ColoredPointers + WriteBarrier

### 1.7.10 Eplison
    
## 1.8 垃圾收集器跟内存大小的关系
1. Serial 几十兆   
2. PS 上百兆 - 几个G   
3. CMS - 20G
4. G1 - 上百G 
5. ZGC - 4T - 16T（JDK13）

> 1.8默认的垃圾回收：PS + ParallelOld

# 2. 常见垃圾回收器组合参数设定：(1.8)

- -XX:+UseSerialGC = Serial New (DefNew) + Serial Old
    - 小型程序。默认情况下不会是这种选项，HotSpot会根据计算及配置和JDK版本自动选择收集器
        
- -XX:+UseParNewGC = ParNew + SerialOld
    
    - 这个组合已经很少用（在某些版本中已经废弃）
        
- -XX:+UseConc(urrent)MarkSweepGC = ParNew + CMS + Serial Old
    
- -XX:+UseParallelGC = Parallel Scavenge + Parallel Old (1.8默认) 【PS + SerialOld】
    
- -XX:+UseParallelOldGC = Parallel Scavenge + Parallel Old
    
- -XX:+UseG1GC = G1
    
- Linux中没找到默认GC的查看方法，而windows中会打印UseParallelGC
    
    - java +XX:+PrintCommandLineFlags -version
        
    - 通过GC的日志来分辨
        
- Linux下1.8版本默认的垃圾回收器到底是什么？
    
    - 1.8.0_181 默认（看不出来）Copy MarkCompact
        
    - 1.8.0_222 默认 PS + PO

## 2.1 JVM调优第一步，了解JVM常用命令行参数

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