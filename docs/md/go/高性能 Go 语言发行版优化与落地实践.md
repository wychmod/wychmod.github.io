
# Golang的垃圾回收机制
> Golang中使用的是改进过的追踪垃圾回收方法——无分代、不整理、并发的三色标记法。

## 三个特性
- 不整理：对象整理优势是解决内存碎片问题以及“允许”使用顺序内存分配器。但 Go 运行时的分配算法基于tcmalloc，基本上没有碎片问题。 并且顺序内存分配器在多线程的场景下并不适用。Go 使用的是基于tcmalloc的现代内存分配算法，对象整理不会带来实质性的性能提升。
- 无分代：分代GC的优势来自于分代假设（大多数对象生命周期很短），但是Go语言编译器会进行逃逸分析，大部分存活时间短的对象都直接分配在栈上了，不需要垃圾回收来参与，所以分代不会带来直接优势。
- 并发：Go 的垃圾回收器与用户代码并发执行，使得 STW（Stop The World，程序暂停） 的时间与对象的代际、对象的 size 没有关系。Go 团队更关注于如何更好地让 GC 与用户代码并发执行（使用适当的 CPU 来执行垃圾回收），而非减少停顿时间这一单一目标上。

## 三色标记法
三色标记法属于增量式GC算法，回收器首先将所有的对象着色成白色，然后从GC Root出发，逐步把所有“可达”的对象变成灰色再到黑色，最终所有的白色对象即是“不可达”对象。

- 初始时所有对象都是白色对象
- 从GC Root对象出发，扫描所有可达对象并标记为灰色，放入待处理队列
- 从队列取出一个灰色对象并标记为黑色，将其引用对象标记为灰色放入队列
- 重复上一步骤，直到灰色对象队列为空
- 此时所有剩下的白色对象就是垃圾对象


优点：
- 不需要暂停整个程序进行垃圾回收

缺点：
- 如果程序垃圾对象的产生速度大于垃圾对象的回收速度时，可能导致程序中的垃圾对象越来越多而无法及时收集
- 线程切换和上下文转换的消耗会使得垃圾回收的总体成本上升，从而降低系统吞吐量

# 性能优化
![image.png](https://note.youdao.com/yws/res/6/WEBRESOURCE68df82efc0fcb9a3da4a68d4fcf0caf6)

# 自动内存管理
## 基本概念
- 自动内存管理：由程序语言的运行时系统管理动态内存
- 避免手动内存管理，专注于实现业务逻辑
- 保证内存使用的正确性和安全性: double-free problem, use-after-free problem
- 三个任务
    - 为新对象分配空间
    - 找到存活对象
    - 回收死亡对象的内存空间
- 概念
    - Mutator: 业务线程，分配新对象，修改对象指向关系
    - Collector: GC 线程，找到存活对象，回收死亡对象的内存空间
    - ![image.png](https://note.youdao.com/yws/res/8/WEBRESOURCEa63863575887c2aef6c5497140503538)
    - Serial GC: 只有一个 collector
    - ![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE0a7a2686be957240e6d8fb42f60e3e2a)
    - Parallel GC: 并行 GC，支持多个 collectors 同时回收的 GC 算法
    - ![image.png](https://note.youdao.com/yws/res/4/WEBRESOURCEfc22f9969782f1184a04bd57b5a75d84)
    - Concurrent GC: 并发 GC，支持 mutator(s) 和 collector(s) 同时执行的 GC 算法
    - ![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCE15ccbbdec25391b2379c81bda3fc66cc)
    - **Collectors 必须感知对象指向关系的改变！**
    - ![image.png](https://note.youdao.com/yws/res/8/WEBRESOURCE5356ef32b248f4b6fa5f2b2d5e738858)

## 追踪垃圾回收
- Tracing garbage collection: 追踪垃圾回收
    - 被回收的条件：不可达对象
    - 过程
        - 标记根对象 (GC roots): 静态变量、全局变量、常量、线程栈等
        - 标记：找到所有可达对象
        - 清理：回收所有不可达对象占据的内存空间
            - Copying GC: 将存活对象从一块内存空间复制到另外一块内存空间，原先的空间可以直接进行对象分配
            - ![image.png](https://note.youdao.com/yws/res/4/WEBRESOURCE75e80329b09bba3d35dbb4a080a1d544)
            - Mark-sweep GC: 将死亡对象所在内存块标记为可分配，使用 free list 管理可分配的空间
            - ![image.png](https://note.youdao.com/yws/res/6/WEBRESOURCEd15ebcc4683f56d5023ec0f4bae6b916)
            - Mark-compact GC: 将存活对象复制到同一块内存区域的开头
            - ![image.png](https://note.youdao.com/yws/res/4/WEBRESOURCE2c36c0eab9b774a8886bf516999b17e4)


## 分代GC（Generational GC）
分代GC其实就是前面所说的根据对象生命周期不同来制定不同的回收策略，所依赖的最主要特性其实就是大多数动态分配的内存都很快不再使用了，往往都抗不过几轮GC，我们将其称为年轻代，年轻代的数量一般都并不大（因为死的快），所以直接采用Copying collection，回收速度就很快；另外生命周期很长的内存，如果每次都复制那开销就太大了，则采用Mark-sweep GC的方式回收。


## 引用计数
- 每个对象都有一个与之关联的引用数目
- 对象存活的条件：当且仅当引用数大于 0
- 优点
    - 内存管理的操作被**平摊到程序运行中**：指针传递的过程中进行引用计数的增减
    - 不需要了解 runtime 的细节：因为不需要标记 GC roots，因此不需要知道哪里是全局变量、线程栈等
- 缺点
    - 开销大，因为对象可能会被多线程访问，对引用计数的修改需要**原子操作**保证原子性和可见性
    - 无法回收环形数据结构
    - 每个对象都引入额外存储空间存储引用计数
    - 虽然引用计数的操作被平摊到程序运行过程中，但是回收大的数据结构依然可能引发暂停

# Go 内存管理及优化
## Go 内存管理
- TCMalloc: TC is short for thread caching
- 目标：为对象在 heap 上分配内存
- 提前将内存分块
    - 调用系统调用 mmap() 向 OS 申请一大块内存，例如 4 MB
    - 先将内存划分成大块，例如 8 KB，称作 mspan
    - 再将大块继续划分成特定大小的小块，用于对象分配
    - noscan mspan: 分配不包含指针的对象 —— GC 不需要扫描
    - scan mspan: 分配包含指针的对象 —— GC 需要扫描
    - ![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCEc67a58e0d2279530da52c6b81493bfa5)
- 对象分配：根据对象的大小，选择最合适的块返回
- **内存缓存**
    - Go 内存管理构成了多级缓存机制，从 OS 分配得的内存被内存管理回收后，也不会立刻归还给 OS，而是在 Go runtime 内部先缓存起来，从而避免频繁向 OS 申请内存。内存分配的路线图如下。
![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCEc2e291e1cc03d93d486eec3e85243d62)

## Go 内存管理的问题
mspan, mcache 和 mcentral 构成了内存管理的**多级缓存机制**。
- 对象分配是**非常高频**的操作：每秒分配 GB 级别的内存
- 线上 profiling 发现，Go 的内存分配占用很多 CPU
- 小对象分配占大多数
> **优化小对象分配是关键**。

## 字节跳动的优化方案
- **Balanced GC**
- 核心：将 noscan 对象在 per-g allocation buffer (GAB) 上分配，并使用移动对象 GC 管理这部分内存，提高对象分配和回收效率
![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCE498efd151d33dd637a41400a3ff06c4d)
- 每个 g 会附加一个较大的 allocation buffer (例如 1 KB) 用来分配小于 128 B 的 noscan 小对象
- 分配对象时，根据对象大小移动 top 指针并返回，快速完成一次对象分配
- 同原先调用 mallocgc() 进行对象分配的方式相比，balanced GC 缩短了对象分配的路径，减少了对象分配执行的指令数目，降低 CPU 使用

从 Go runtime 内存管理模块的角度看，一个 allocation buffer 其实是一个大对象。本质上 balanced GC 是将多次小对象的分配合并成一次大对象的分配。因此，当 GAB 中哪怕只有一个小对象存活时，Go runtime 也会认为整个大对象（即 GAB）存活。为此，balanced GC 会根据 GC 策略，将 GAB 中存活的对象移动到另外的 GAB 中，从而压缩并清理 GAB 的内存空间，原先的 GAB 空间由于不再有存活对象，可以全部释放，如下图所示。

![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCEe55fbb3ed233879ccf91381a534caf99)

# 编译器和静态分析
- 编译器的结构
![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCEefb5676cfb0bfa088adce448900710a2)
- 静态分析：不执行代码，推导程序的行为，分析程序的性质。
- 控制流：程序的执行流程
- 数据流：数据在控制流上的传递
![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCE23198866a028b328a3046430753be05d)

![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCEb47247c03ea86e8a018c0bf0263db577)

# Go 编译器优化
## 目的
- 用户无感知，重新编译即可获得性能收益
- 通用的优化手段
## 现状
- 采用的优化较少
- 追求编译时间短，因此没有进行复杂的代码分析和优化
## 思路
- 面向后端长期执行的任务
- 用适当增加编译时间换取更高性能的代码

## 函数内联
- 定义：将被调用函数的函数体的副本替换到调用位置上，同时重写代码以反映参数的绑定
- 字节跳动的优化方案
修改了内联策略，让更多函数被内联
增加了其他优化的机会：逃逸分析
## 逃逸分析
- 定义：分析代码中指针的动态作用域，即指针在何处可以被访问
- 优化：未逃逸出当前函数的指针指向的对象可以在栈上分配
- 减少在堆上分配对象，降低 GC 负担。