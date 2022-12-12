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