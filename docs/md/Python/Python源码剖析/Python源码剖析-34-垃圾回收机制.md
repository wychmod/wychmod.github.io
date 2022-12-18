_Python_ 内部采用 **引用计数法** ，为每个对象维护引用次数，并据此回收不再需要的垃圾对象。由于引用计数法存在重大缺陷，循环引用时有内存泄露风险，因此 _Python_ 还采用 **标记清除法** 来回收存在循环引用的垃圾对象。此外，为了提高垃圾回收( _GC_ )效率，_Python_ 还引入了 **分代回收机制** 。

## 对象跟踪

将程序内部对象跟踪起来，是实现垃圾回收的第一步。那么，是不是程序创建的所有对象都需要跟踪呢？

一个对象是否需要跟踪，取决于它会不会形成循环引用。按照引用特征，_Python_ 对象可以分为两类：

-   **内向型对象** ，例如 _int_ 、_float_ 、 _str_ 等，这类对象不会引用其他对象，因此无法形成循环引用，无须跟踪；
-   **外向型对象** ，例如 _tuple_ 、 _list_ 、 _dict_ 等容器对象，以及函数、类实例等复杂对象，这类对象一般都会引用其他对象，存在形成循环引用的风险，因此是垃圾回收算法关注的重点；

这是一个典型的例子，橘红色外向型对象存在循环引用的可能性，需要跟踪；而绿色内向型对象在引用关系图中只能作为叶子节点存在，无法形成任何环状，因此无需跟踪：

![](../../youdaonote-images/Pasted%20image%2020221218203141.png)

_Python_ 为外向型对象分配内存时，调用位于 _Modules/gcmodule.c_ 源文件的 __PyObject_GC_Alloc_ 函数。该函数在对象头部之前预留了一些内存空间，以便垃圾回收模块用 **链表** 将它们跟踪起来。预留的内存空间是一个 __gc_head_ 结构体，它定义于 _Include/objimpl.h_ 头文件：

```c
typedef union _gc_head {
    struct {
        union _gc_head *gc_next;
        union _gc_head *gc_prev;
        Py_ssize_t gc_refs;
    } gc;
    long double dummy;  /* force worst-case alignment */
    // malloc returns memory block aligned for any built-in types and
    // long double is the largest standard C type.
    // On amd64 linux, long double requires 16 byte alignment.
    // See bpo-27987 for more discussion.
} PyGC_Head;
```

-   _gc_next_ ，链表后向指针，指向后一个被跟踪的对象；
-   _gc_prev_ ，链表前向指针，指向前一个被跟踪的对象；
-   _gc_refs_ ，对象引用计数副本，在标记清除算法中使用；
-   _dummy_ ，内存对齐用，以 64 位系统为例，确保 _gc_head 结构体大小是 16 字节的整数倍，结构体地址以 16 字节为单位对齐；

以 _list_ 对象为例，__PyObject_GC_Alloc_ 函数在 _PyListObject_ 结构体基础上加上 __gc_head_ 结构体来申请内存，但只返回 _PyListObject_ 的地址作为对象地址，而不是整块内存的首地址：

![](../../youdaonote-images/Pasted%20image%2020221218203339.png)

就这样，借助 _gc_next_ 和 _gc_prev_ 指针，_Python_ 将需要跟踪的对象一个接一个组织成 **双向链表** ：

![](../../youdaonote-images/Pasted%20image%2020221218203457.png)

这个链表也被称为 **可收集** ( _collectable_ )对象链表，_Python_ 将从这个链表中收集并回收垃圾对象。

## 分代回收机制

_Python_ 程序启动后，内部可能会创建大量对象。如果每次执行标记清除法时，都需要遍历所有对象，多半会影响程序性能。为此，_Python_ 引入分代回收机制——将对象分为若干“**代**”( _generation_ )，每次只处理某个代中的对象，因此 _GC_ 卡顿时间更短。

那么，按什么标准划分对象呢？是否随机将一个对象划分到某个代即可呢？答案是否定的。实际上，对象分代里头也是有不少学问的，好的划分标准可显著提升垃圾回收的效率。

考察对象的生命周期，可以发现一个显著特征：一个对象存活的时间越长，它下一刻被释放的概率就越低。我们应该也有这样的亲身体会：经常在程序中创建一些临时对象，用完即刻释放；而定义为全局变量的对象则极少释放。

因此，根据对象存活时间，对它们进行划分就是一个不错的选择。对象存活时间越长，它们被释放的概率越低，可以适当降低回收频率；相反，对象存活时间越短，它们被释放的概率越高，可以适当提高回收频率。

![](../../youdaonote-images/Pasted%20image%2020221218203958.png)

_Python_ 内部根据对象存活时间，将对象分为 _3_ 代(见 _Include/internal/mem.h_ )：

```
#define NUM_GENERATIONS 3
```

每个代都由一个 _gc_generation_ 结构体来维护，它同样定义于 _Include/internal/mem.h_ 头文件：

```c
struct gc_generation {
    PyGC_Head head;
    int threshold; /* collection threshold */
    int count; /* count of allocations or collections of younger
                  generations */
};
```

-   _head_ ，可收集对象链表头部，代中的对象通过该链表维护；
-   _threshold_ ，仅当 _count_ 超过本阀值时，_Python_ 垃圾回收操作才会扫描本代对象；
-   _count_ ，计数器，不同代统计项目不一样；

_Python_ 虚拟机运行时状态由 _Include/internal/pystate.h_ 中的 _pyruntimestate_ 结构体表示，它内部有一个 __gc_runtime_state_ ( _Include/internal/mem.h_ )结构体，保存 _GC_ 状态信息，包括 _3_ 个对象代。这 _3_ 个代，在 _GC_ 模块( _Modules/gcmodule.c_ ) __PyGC_Initialize_ 函数中初始化：

```c
    struct gc_generation generations[NUM_GENERATIONS] = {
        /* PyGC_Head,                                 threshold,      count */
        {{{_GEN_HEAD(0), _GEN_HEAD(0), 0}},           700,            0},
        {{{_GEN_HEAD(1), _GEN_HEAD(1), 0}},           10,             0},
        {{{_GEN_HEAD(2), _GEN_HEAD(2), 0}},           10,             0},
    };
```

为方便讨论，我们将这 _3_ 个代分别称为：**初生代**、**中生代** 以及 **老生代**。当这 _3_ 个代初始化完毕后，对应的 _gc_generation_ 数组大概是这样的：

![](../../youdaonote-images/Pasted%20image%2020221218210803.png)

每个 _gc_generation_ 结构体链表头节点都指向自己，换句话说每个可收集对象链表一开始都是空的；计数器字段 _count_ 都被初始化为 _0_ ；而阀值字段 _threshold_ 则有各自的策略。这些策略如何理解呢？

_Python_ 调用 __PyObject_GC_Alloc_ 为需要跟踪的对象分配内存时，该函数将初生代 _count_ 计数器加一，随后对象将接入初生代对象链表；当 _Python_ 调用 _PyObject_GC_Del_ 释放垃圾对象内存时，该函数将初生代 _count_ 计数器减一；__PyObject_GC_Alloc_ 自增 _count_ 后如果超过阀值( _700_ )，将调用 _collect_generations_ 执行一次垃圾回收( _GC_ )。

_collect_generations_ 函数从老生代开始，逐个遍历每个生代，找出需要执行回收操作( _count>threshold_ )的最老生代。随后调用 _collect_with_callback_ 函数开始回收该生代，而该函数最终调用 _collect_ 函数。

_collect_ 函数处理某个生代时，先将比它年轻的生代计数器 count 重置为 _0_ ；然后将它们的对象链表移除，与自己的拼接在一起后执行 _GC_ 算法(本文后半部分介绍)；最后，将下一个生代计数器加一。

-   系统每新增 _701_ 个需要 _GC_ 的对象，_Python_ 就执行一次 _GC_ 操作；
-   每次 _GC_ 操作需要处理的生代可能是不同的，由 _count_ 和 _threshold_ 共同决定；
-   某个生代需要执行 _GC_ ( _count>threshold_ )，在它前面的所有年轻生代也同时执行 _GC_ ；
-   对多个代执行 _GC_ ，_Python_ 将它们的对象链表拼接在一起，一次性处理；
-   _GC_ 执行完毕后，_count_ 清零，而后一个生代 _count_ 加一；

下面是一个简单的例子：初生代触发 _GC_ 操作，_Python_ 执行 _collect_generations_ 函数。它找出了达到阀值的最老生代是中生代，因此调用 _collection_with_callback(1)_ ，_1_ 是中生代在数组中的下标。