_GIL_ 作为 _Python_ 虚拟机最大的局限性，对 _Python_ 程序运行性能影响深刻。因此，_Python_ 工程师必须明白虚拟机引入 _GIL_ 的前因后果，避免多线程程序被 _Python_ 虚拟机戴上金箍圈，进而产生不可预料的性能问题。

由于 _GIL_ 的存在不可避免，只有想方设法绕过 _GIL_ 的限制才能最大限度地提升 _Python_ 程序的多核执行能力。

## GIL 由来

我们先思考一个问题：我们在前面介绍的 _list_ 、 _dict_ 等内建对象是 **线程安全** 的吗？

在 _Python_ 层面，_list_ 、_dict_ 等内建对象是线程安全的，这是最基本的常识。研究 _list_、_dict_ 等内建对象源码时，我们并没有看到任何 **互斥锁** 的痕迹，这多少有点令人意外。以 _list_ 对象 _append_ 方法为例，主要步骤如下：

```c
static int
app1(PyListObject *self, PyObject *v)
{
    Py_ssize_t n = PyList_GET_SIZE(self);

    assert (v != NULL);
    if (n == PY_SSIZE_T_MAX) {
        PyErr_SetString(PyExc_OverflowError,
            "cannot add more objects to list");
        return -1;
    }

    if (list_resize(self, n+1) < 0)
        return -1;

    Py_INCREF(v);
    PyList_SET_ITEM(self, n, v);
    return 0;
}
```

1.  调用 _list_resize_ 将列表长度扩大 _1_ (第 _13-14_ 行)；
2.  将被追加元素设置到末尾位置 (第 _16-17_ 行)；

由此可见，_append_ 方法不是一个 **原子操作** 。假设线程 _A_ 调用 _append_ 方法，执行长度扩容后便发生 **线程调度** ；系统唤醒线程 _B_ 开始执行 _l[-1]_ 语句访问 list 末尾元素，会怎样呢？由于 _list_ 长度已经扩容但追加元素尚未设置，线程 B 将得到一个非法对象！

![](../../youdaonote-images/Pasted%20image%2020221212201030.png)

这种有多线程并发操作导致的 **竞争条件** ，一般通过互斥锁加以解决。我们可以为每个 _list_ 对象分配一个互斥锁，当一个 _list_ 操作开始执行前，先获取锁；执行完毕后，再释放锁。进入 **对象锁** 后，竞争条件便消除了。

```c
static int
some_op(PyListObject *self, ...)
{
    // acquire lock
    lock(self);

    // process operation
    // ...
    
    // release lock
    unlock(self);
}
```

可我们在源码中并没有发现，这又是为什么呢？莫非 _Python_ 采用了其他什么野路子？

的确如此。_Python_ 虚拟机维护了一个 **全局锁** ，这就是众所周知的 _GIL_。_Python_ 线程想在虚拟机中执行字节码，必须取得全局锁。这样一来，不管任何时刻，只有一个线程在虚拟机中运行。那么，虚拟机如何交替执行不同线程呢？

_Python_ 线程调度实现方式参考了操作系统进程调度中 **时间片** 的思路，只不过将时间片换成 **字节码** 。当一个线程取得 _GIL_ 全局锁并开始执行字节码时，对已执行字节码进行计数。当执行字节码达到一定数量 (比如 100 条) 时，线程主动释放 _GIL_ 全局锁并唤醒其他线程。其他等待 _GIL_ 全局锁的线程取得锁后，将得到虚拟机控制权并开始执行。因此，虚拟机就像一颗软件 _CPU_ ，_Python_ 线程交替在虚拟机上执行：

![](../../youdaonote-images/Pasted%20image%2020221212201539.png)
如图，绿色为当前正在虚拟机中执行的线程；蓝色为等待到虚拟机上执行的线程；黄色为阻塞在 _IO_ 操作上的线程。对于 _Running_ 线程，如果已执行字节码达到一定数量，则自动让出 _GIL_ 并唤醒其他线程，状态变更为 _Ready_ ；如果执行 _IO_ 操作，在执行阻塞型系统调用前先让出 _GIL_ ，状态变更为 _IO Blocked_ 。当 Ready 线程取得 GIL 后，获得虚拟机控制权并开始执行字节码，状态变更为 _Running_ 。 _IO Blocked_ 线程一开始阻塞在系统调用上，当系统调用返回后，状态变更为 _Ready_ ，再次等待 _GIL_ 以便获得虚拟机执行权。

那么，_Python_ 为啥采用 _GIL_ 这么简单粗暴的解决方案，而不是对象锁呢？首先，对象锁方案为每个需要保护的对象分配一个互斥锁，内存开销巨大。其次，频繁的加解锁操作严重影响执行效率，特别是 _dict_ 等对象使用频率很高。

![](../../youdaonote-images/Pasted%20image%2020221212202311.png)

有测试结果表明，引入对象锁获得的多线程 **并行执行** 能力，几乎被加解锁开销完全抵消。而在单线程环境下， _GIL_ 方案优势明显。这样看来，_Python_ 作者们采用 _GIL_ 方案也就理所当然了。

## GIL 影响

在 _GIL_ 的束缚下，_Python_ 虚拟机同一时刻只能执行一个线程。这是否意味着多线程完全无法优化程序性能呢？由于程序运行特征千差万别，这个问题得分情况讨论。开始之前，我们先来了解两种不同的运行特征：

程序在运行时，一般都处于两种状态：

1.  **可执行** 状态，包括 _Running_ 以及 _Ready_ 两种情况，这时竞争处理器资源；
2.  **阻塞** 状态，一般为等待 _IO_ 处理，这时让出处理器资源；

根据程序分别处于 _Running_ 以及 _IO Blocked_ 两种状态的时间占比，可分为两种：

-   **计算密集型** ，程序执行时大部分时间处于 _Running_ 状态；
-   **IO 密集型** ，程序执行时大部分时间处于 _IO Blocked_ 状态；

### IO 密集型

典型 **IO 密集型** 程序时间轴如下，绿色为 _Running_ 状态，黄色为 _IO Blocked_ 状态：

![](../../youdaonote-images/Pasted%20image%2020221212202622.png)

**IO 密集型** 程序受 GIL 影响相对有限，因为线程在等待 IO 处理时可以让出 GIL 以便其他线程拿到虚拟机执行权：

![](../../youdaonote-images/Pasted%20image%2020221212202632.png)

批量下载网页就是一个典型的 **IO 密集型** 场景，大部分时间花在等待服务器响应，请求发起以及网页处理所占的时间非常少。因此，一个多线程网络爬虫程序可以极大缩短程序运行时间。

### 计算密集型

诸如科学计算这样的 **计算密集型** 程序就不一样了，除了开始前读取参数，结束后保存结果，大部分时间都在运算：

![图片描述](http://img1.sycdn.imooc.com/5efbf3670001788d06170138.png)

**计算密集型** 程序受 _GIL_ 影响就大了 —— 在 _GIL_ 约束下，虚拟机只能交替执行不同的线程：

![](../../youdaonote-images/Pasted%20image%2020221212202944.png)

由此可见，_Python_ 线程并不具备多核并行执行能力，不能缩短计算密集型程序的运行时间。

## 如何提升多核执行能力

我们以 **随机数估算 π 值** 这个典型的 **计算密集型** 场景为例，探索 _Python_ 多核执行能力提升之道：

![](../../youdaonote-images/Pasted%20image%2020221212203152.png)

![](../../youdaonote-images/Pasted%20image%2020221212203203.png)

现在，借助 _random_ 模块生成随机数，编写一个试验函数 _sample_，以试验次数 nn 为参数，返回试验次数 nn 以及落在扇形内的次数 in\_sectorsin_sectors：

```python
import random

def sample(n):
    in_sectors = 0
    # 循环试验n次
    for _ in range(n):
        # 随机生成一个点，坐标均在0到1之间
        x, y = random.random(), random.random()
        # 如果该点到原点的距离平方小于1，则在扇形内
        if x*x + y*y < 1:
            in_sectors += 1
    return n, in_sectors
```

根据试验结果，_eval_pi_ 计算 ππ 的近似值：

```python
def eval_pi(n, in_sectors):
    return 4. * in_sectors / n
```

现在，我们以单线程模式执行 _1_ 亿次随机试验，_estimate_pi_ 执行耗时 _4.59_ 秒：

```python
def estimate_pi(n):
    return eval_pi(*sample(n))
```

接下来，我们再以多线程模式执行 _1_ 亿次随机试验，并与单线程模式进行对比。为此我们设计了多线程版的估算函数 _estimate_pi_with_threads_ ，_thread_num_ 参数为线程数：

```python
from queue import Queue
from threading import Thread

def estimate_pi_with_threads(n, thread_num):
    # 用于收集线程执行结果的队列
    queue = Queue()

    # 线程执行函数
    def thread_routine():
        # 将试验次数n分为thread_num份
        # 执行试验并将试验结果放入队列
        queue.put(sample(n // thread_num))

    # 创建执行线程
    threads = [
        Thread(target=thread_routine)
        for _ in range(thread_num)
    ]

    # 启动执行线程
    for thread in threads:
        thread.start()

    # 从任务队列收集试验结果
    total_n, total_in_sectors = 0, 0
    for thread in threads:
        n, in_sectors = queue.get()
        total_n += n
        total_in_sectors += in_sectors

    # 回收线程资源
    for thread in threads:
        thread.join()

    return eval_pi(total_n, total_in_sectors)
```

_estimate_pi_with_threads_ 估算函数执行 _1_ 亿次试验耗时 _4.63_ 秒，多线程对程序没有任何提升。

那么，是否意味着 _Python_ 程序无法充分利用多核 _CPU_ 的执行能力呢？

肯定不是。虽然我们没有办法避免 _GIL_ 的影响，但是我们可以想法设法绕过它，例如采用 **多进程模式** 。在 _Python_ 程序中，每个进程独立运行一个虚拟机。因此，不同 _Python_ 进程可以在多核 _CPU_ 上并行运行，不受 _GIL_ 限制。

最后，我们再以 **多进程模式** 执行 _1_ 亿次随机试验，看执行效率是否如预期有所提升。为此我们设计了多进程版的估算函数 _estimate_pi_with_processes_ ，_process_num_ 参数为子进程数：

```python
from multiprocessing import Process, Queue as ProcessQueue

def estimate_pi_with_processes(n, process_num):
    # 用于收集子进程执行结果的队列
    queue = ProcessQueue()

    # 子进程执行函数
    def process_routine():
        # 将试验次数n分为process_num份
        # 执行试验并将试验结果放入队列
        queue.put(sample(n // process_num))

    # 创建执行进程
    processes = [
        Process(target=process_routine)
        for _ in range(process_num)
    ]

    # 启动执行进程
    for process in processes:
        process.start()

    # 从任务队列收集试验结果
    total_n, total_in_sectors = 0, 0
    for process in processes:
        n, in_sectors = queue.get()
        total_n += n
        total_in_sectors += in_sectors

    # 回收子进程资源
    for process in processes:
        process.join()

    return eval_pi(total_n, total_in_sectors)
```

_estimate_pi_with_processes_ 估算函数执行 _1_ 亿次试验耗时 _2.56_ 秒，几乎比单线程版快了一倍！如果增加子进程数，程序执行速度还可以进一步提升。需要特别注意，超出 _CPU_ 核数的进程数则没有任何意义了。