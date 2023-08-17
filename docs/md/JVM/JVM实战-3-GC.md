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
	6. 年龄足够 -> 老年代 （回收15次 进入老年代 CMS 是回收6次）
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
- 大对象直接进入老年代-XX:PretenureSizeThreshold
![](../youdaonote-images/Pasted%20image%2020230814001406.png)

- 什么情况下Minor GC之前会提前触发Full GC，什么情况下会直接触发Minor GC?
在新生代 的要进入老年代的对象大小超过了老年代可以承载的，同时没有空间担保或者空间担保平均每次的大于了老年代剩余的，就会出发FULLGC。

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
    > 当碎片过多的时候，一次full gc可能会有好几小时。
    
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
- 介绍：G1是一种服务端应用使用的垃圾收集器，目标是用在多核、大内存的机器上，它在大多数情况下可以实现指定的GC暂停时间，同时还能保持较高的吞吐量
- 使用G1收集器时，Java堆的内存布局与就与其他收集器有很大差别，它将整个Java堆划分为多个大小相等的独立区域（Region），虽然还保留有新生代和老年代的概念，但新生代和老年代不再是物理隔离的了，它们都是一部分Region（不需要连续）的集合。
- 每个Region大小都是一样的，可以是1M到32M之间的数值，但是必须保证是2的n次幂
- 如果对象太大，一个Region放不下[超过Region大小的50%]，那么就会直接放到H中
- 设置Region大小：-XX:G1HeapRegionSize=M
- Garbage-Frist，其实就是优先回收垃圾最多的Region区域
- 每个区域的年龄不是固定的，可能这次是年轻代，进行一次YGC就会变成老年代。
```java
（1）分代收集（仍然保留了分代的概念） 
（2）空间整合（整体上属于“标记-整理”算法，不会导致空间碎片） 
（3）可预测的停顿（比CMS更先进的地方在于能让使用者明确指定一个长度为M毫秒的时间片段内，消耗在垃圾收集上的时间不得超过N毫秒）
```
![](../youdaonote-images/Pasted%20image%2020230816152142.png)

**工作过程可以分为如下几步**:
1. 初始标记（Initial Marking） 标记以下GC Roots能够关联的对象，并且修改TAMS的值，需要暂停用户线程
2. 并发标记（Concurrent Marking） 从GC Roots进行可达性分析，找出存活的对象，与用户线程并发 执行
3. 最终标记（Final Marking） 修正在并发标记阶段因为用户程序的并发执行导致变动的数据，需 暂停用户线程
4. 筛选回收（Live Data Counting and Evacuation） 对各个Region的回收价值和成本进行排序，根据 用户所期望的GC停顿时间制定回收计划

![](../youdaonote-images/Pasted%20image%2020230816152418.png)

- **GC什么时候触发**？
	- YGC
		- Eden空间不足
		- 多线程并行执行
	- FGC
		- Old空间不足
		- System.gc()
- **G1如果产生FGC，你该怎么办**？
	1. 扩内存
	2. 提高cpu性能，回收的快，业务逻辑产生对象的速度固定，垃圾回收越快，内存空间越大
	3. 降低mixedGC触发的阈值，让mixedGC提早发生（默认是45%）YGC不行时，占用堆空间超过45%，就会启动，mixedGC相当于cms。


- **YoungGC 的工作流程**
YGC 的工作流程很简单：APP线程跑，然后就进行青年代Region的回收，把需要回收的YoungRegion，放入YoungCSet中，在YGC阶段就进行对年轻代CSet中的Region进行回收。因为大部分都是垃圾，且用了复制回收算法，基本只需要较短时间的STW就能完全回收了。



### 1.7.7 G1基本概念：card table
1. Card Table
	1. 由于做YGC时，需要扫描整个OLD区(看是否有引用)，效率非常低，所以JVM设计了CardTable， 如果一个OLD区CardTable中有对象指向Y区，就将它设为Dirty，下次扫描时，只需要扫描Dirty Card 在结构上，Card Table用BitMap来实现
2. CSet = Collection Set
	- 收集集合(CSet)代表每次GC暂停时回收的一系列目标分区。在任意一次收集暂停中，CSet所有分区都会被释放，内部存活的对象都会被转移到分配的空闲分区中。
	- 混合收集会通过启发式算法，在老年代候选回收分区中，筛选出回收收益最高的分区添加到CSet中。
![](../youdaonote-images/Pasted%20image%2020230816153848.png)

2. RSet（Remember Set ：记忆集合）
	- 每一个Region都会划出一部分内存用来储存**记录其他Region对当前持有Rset Region中Card的引用**，这个记录就叫做Remember Set。
	- G1垃圾回收器，有对STW时间的控制，通过参数 -XX:MaxGCPauseMillis 来设置，而对于整个堆进行一次回收所需要的的实际STW时间可能远远超过这个值，所以G1可以不用扫描整个堆，只要通过扫描RSet来分析垃圾比例最高的Region区，放入CSet（Collection Set ：回收集合）中，进行回收。
	- Rset的储存方状态，会根据对当前区域中引用数量的增加依次递增，分别为：稀疏（hash）->细粒度->粗粒度。
		- 稀疏状态： 一个其他Region引用当前Region 中Card 的集合 被放在一个数组里面，Key：redion地址 Value：card 地址数组
		- 细粒度： 一个Region地址链表，共同维护当前 Region 中所有card 的一个BitMap集合，该card 被引用了就设置对应bit 为1，并且还维护一个 对应Region对当前Region中card 索引数量
		- 粗粒度： 所有region 形成一个 bitMap，如果有region 对当前 Region 有指针指向，就设置其对应的bit 为1

![](../youdaonote-images/Pasted%20image%2020230816211554.png)

![](../youdaonote-images/Pasted%20image%2020230816211119.png)
> 如果有Rset的数据结构退化成了粗粒度的时候，要对Region进行回收的时候，就必须对Region进行全扫描才能正确回收，这样就大大增大了G1垃圾回收器的工作量，降低了效率。

> 其次为了追求效率一般Young代Region不会有RSet，因为维护Rset需要消耗不少性能，而年轻代快速回收的特性，带来了大量的浪费
### 并发标记的算法-1.7.7 三色标记
在标记对象的过程中，对象引用关系正在发生改变。
![](../youdaonote-images/Pasted%20image%2020230816152917.png)

### 漏标问题的解决

**漏标是指，本来是live object，但是由于没有遍历到，被当成garbage回收掉了**
1. 并发标记过程中，Mutator删除了所有从灰色到白色的引用
2. 在remark过程中，黑色指向了白色，如果不对黑色重新扫描，则会漏标，会把白色D对象当做没有新引用指向从而回收掉
**产生漏表的两个条件：**
1. 标记进行时增加了一个黑到白的引用，如果不重新对黑色进行处理，则会漏标
2. 标记进行时删除了灰对象到白对象的引用，那么这个白对象有可能被漏标

**解决方案：**
1. incremental update -- 增量更新，关注引用的增加，把黑色重新标记为灰色，下次重新扫描属性，CMS使用
2. SATB snapshot at the beginning – 关注引用的删除当B->D消失时，要把这个引用推到GC的堆栈，保证D还能被GC扫描到G1使用

**为什么G1用SATB?**
1. incremental update 变成灰色的要重新扫描，效率低
2. 灰色 → 白色 引用消失时，如果没有黑色指向白色引用会被push到堆栈,下次扫描时拿到这个引用，由于有RSet的存在，不需要扫描整个堆去查找指向白色的引用，效率比较高

![](../youdaonote-images/Pasted%20image%2020230816214155.png)

> 由于RSet 的存在，那么每次给对象赋引用的时候，就得做一些额外的操作，在GC中被称为写屏障,这个写屏障不等于内存屏障

> java 10以前是串行FullGC，之后是并行FullGC
### 1.7.8 ZGC (1ms) 
>JDK11新引入的ZGC收集器，不管是物理上还是逻辑上，ZGC中已经不存在新老年代的概念了，会分为一个个page，当进行GC操作时会对page进行压缩，因此没有碎片问题，只能在64位的linux上使用，目前用得还比较少

1. 可以达到10ms以内的停顿时间要求
2. 支持TB级别的内存
3. 堆内存变大后停顿时间还是在10ms以内

![](../youdaonote-images/Pasted%20image%2020230816221619.png)

- 算法：ColoredPointers + LoadBarrier
**ColoredPointers**: 
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
