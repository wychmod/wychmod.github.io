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
	1. Eden + 2个suvivor区 
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

## 1.6 对象何时进入老年代

- 超过 XX:MaxTenuringThreshold 指定次数（YGC） – Parallel Scavenge 15
	- CMS 6
	-  G1 15
- 动态年龄
	- s1 - > s2超过50%
	- 把年龄最大的放入O
![](../youdaonote-images/Pasted%20image%2020230814001406.png)

