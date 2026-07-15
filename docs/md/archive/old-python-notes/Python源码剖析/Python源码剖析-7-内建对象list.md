# list操作解析
## 基本用法

我们先来回顾一下 _list_ 对象的基本操作：

```python
# 新建一个列表
>>> l = [1, 2, 3]
>>> l
[1, 2, 3]

# 向尾部追加元素，列表对象视情况自动扩容
>>> l.append(4)
>>> l
[1, 2, 3, 4]

# 从尾部弹出元素，列表对象视情况自动缩容
>>> l.pop()
4
>>> l
[1, 2, 3]

# 向头部插入元素，该操作需要挪动后面的元素，谨慎使用！
>>> l.insert(0, 4)
>>> l
[4, 1, 2, 3]

# 从头部弹出元素，该操作需要挪动后面的元素，谨慎使用！
>>> l.pop(0)
4
>>> l
[1, 2, 3]

# 查找元素第一次出现位置的下标
>>> l.index(2)
1

# 用一个可迭代对象扩展列表——元素逐一追加到尾部
>>> l.extend([1, 2])
>>> l
[1, 2, 3, 1, 2]

# 计算元素出现的个数
>>> l.count(1)
2
>>> l.count(3)
1

# 将列表反转
>>> l.reverse()
>>> l
[2, 1, 3, 2, 1]

# 将列表清空
>>> l.clear()
>>> l
[]
```

一个合格的 _Python_ 开发工程师，除了必须熟练掌握 _list_ 对象的基本操作，还需要对每个操作的 **实现原理** 及对应的 **时间复杂度** 、 **空间复杂度** 有准确的认识。列表操作总体比较简单，但有个操作特别容易被误用：

-   _insert_ 方法向头部追加元素时需要挪动整个列表，时间复杂度是 O(n)O(n) ，性能极差，需谨慎使用；
-   _append_ 方法向尾部追加元素时，无需挪动任何元素，时间复杂度 O(1)O(1) ；
-   _pop_ 方法从头部弹出元素时也需要挪动整个列表，时间复杂度是 O(n)O(n) ，同样需谨慎使用；
-   _pop_ 方法从尾部弹出元素时，无需挪动任何元素，时间复杂度是 O(1)O(1)

由此可见，对列表头部和尾部进行操作，性能有天壤之别。后续我们将一起探索 _list_ 对象内部结构，从中寻找造成这种现象的原因。此外， _list_ 对象还可根据元素个数 **自动扩缩容** 。

## 内部结构

_list_ 对象在 _Python_ 内部，由 _PyListObject_ 结构体表示，定义于头文件 _Include/listobject.h_ 中：

```c
typedef struct {
    PyObject_VAR_HEAD
    /* Vector of pointers to list elements.  list[0] is ob_item[0], etc. */
    PyObject **ob_item;

    /* ob_item contains space for 'allocated' elements.  The number
     * currently in use is ob_size.
     * Invariants:
     *     0 <= ob_size <= allocated
     *     len(list) == ob_size
     *     ob_item == NULL implies ob_size == allocated == 0
     * list.sort() temporarily sets allocated to -1 to detect mutations.
     *
     * Items must normally not be NULL, except during construction when
     * the list is not yet visible outside the function that builds it.
     */
    Py_ssize_t allocated;
} PyListObject;
```

毫无疑问， _list_ 对象是一种 **变长对象** ，因此包含变长对象公共头部。除了公共头部， _list_ 内部维护了一个动态数组，而数组则依次保存元素对象的指针：

-   _**ob_item**_ ，指向动态数组的指针，动态数组保存元素对象的指针；
-   _**allocated**_ ，动态数组长度，即列表 **容量** ；
-   _**ob_size**_ ，动态数组当前保存元素个数，即列表 **长度** 。

![](../../youdaonote-images/Pasted%20image%2020221210120532.png)

## 尾部操作

在列表对象尾部增删元素，可快速完成，无须挪动其他元素。

假设列表元素 _l_ 内部数组长度为 _5_ ，以及保存 _3_ 个元素，分别是： _1_ 、 _2_ 、 _3_ 。当我们调用 _append_ 方法向尾部追加元素时，由于内部数组还有未用满，只需将新元素保存于数组下一可用位置并更新 _ob_size_ 字段：

![](../../youdaonote-images/Pasted%20image%2020221210120541.png)

因此，大多数情况下， _append_ 方法性能都足够好，时间复杂度是 O(1)。

## 动态扩容

如果 _list_ 对象内部数组已用满，再添加元素时则需要进行扩容。 _append_ 等方法在操作时都会对内部数组进行检查，如需扩容则调用 _list_resize_ 函数。在 _list_resize_ 函数， _Python_ 重新分配一个长度更大的数组并替换旧数组。为避免频繁扩容， _Python_ 每次都会为内部数组预留一定的裕量。

假设列表元素 _l_ 保存 _3_ 个元素，内部数组长度为 _3_ ，已满。当我们调用 _append_ 方法向列表尾部追加元素时，需要对内部数组进行扩容。扩容步骤如下：

![](../../youdaonote-images/Pasted%20image%2020221210121136.png)

1.  分配一个更大的数组，假设长度为 _6_ ，预留一定裕量避免频繁扩容；
2.  将列表元素从旧数组逐一转移到新数组；
3.  以新数组替换旧数组，并更新 _allocated_ 字段；
4.  回收旧数组。

由于内部数组扩容时，需要将列表元素从旧数组拷贝到新数组，时间复杂度为 O(n) ，开销较大，需要尽量避免。为此， _Python_ 在为内部数组扩容时，会预留一定裕量，一般是 1/81/8 左右。假设为长度为 _1000_ 的列表对象扩容， _Python_ 会预留大约 _125_ 个空闲位置，分配一个长度 _1125_ 的新数组。

由于扩容操作的存在， _append_ 方法最坏情况下时间复杂度为 O(n)。由于扩容操作不会频繁发生，将扩容操作时的元素拷贝开销平摊到多个 _append_ 操作中，平均时间复杂度还是 O(1)。

## 头部操作

与尾部相比，由于在列表头部增删元素需要挪动其他列表元素，性能有天地之别。

假设列表元素 _l_ 内部数组长度为 _5_ ，以及保存 _3_ 个元素，分别是： _1_ 、 _2_ 、 _3_ 。当我们调用 _insert_ 方法向头部插入元素时，需要先将当前所有元素往后挪一位，以便为新元素腾出一个空闲位置：

![](../../youdaonote-images/Pasted%20image%2020221210125718.png)

然后， _insert_ 方法将新元素存入挪出来的空闲位置，更新新 _ob_size_ 字段，便完成了插入操作：

![](../../youdaonote-images/Pasted%20image%2020221210125728.png)

因此， _insert_ 在头部插入元素的时间复杂度是 O(n)O(n) ，必须谨慎使用，尽量避免。调用 _pop_ 方法从头部弹出元素，性能也是很差，时间复杂度同样是 O(n)O(n)。笔者见过有人将 _list_ 对象当成一个 **队列** 来用，真想把他抓起来打一顿：

```python
q = []

# enqueue
q.append(job)

# dequeue
job = q.pop(0)
```

这个队列实现，出队操作需要将整个队列挪动一遍，性能很差。如果队列规模很大，这将成为拖垮程序的关键因素。如果队列规模很小，这种写法虽说问题不大，但也不建议——你最好不要在代码中埋一颗不知什么时候会爆炸的雷。

如果你需要频繁操作列表头部，可以考虑使用标准库里的 _deque_ ，这是一种 **双端队列** 结构。 _deque_ 头部和尾部操作性能都很优秀，时间复杂度都是 O(1)O(1) 。如果你需要一个 **先进先出** ( _FIFO_ )队列，可以这么写：

```python
from collections import deque

q = deque()

# enqueue
q.append(job)

# dequeue
q.popleft()
```

## 浅拷贝

调用 _list_ 对象 _copy_ 方法，可将列表拷贝一份，生成一个全新的列表：

```python
# 创建一个列表
>>> l = [1, [2], 'three']
>>> l
[1, [2], 'three']

# 拷贝形成一个新列表
>>> l2 = l.copy()
>>> l2
[1, [2], 'three']
>>> id(l), id(l2)
(4417331976, 4420505736)

# 修改新列表不影响旧列表
>>> l2[0] = 'one'
>>> l2
['one', [2], 'three']
>>> l
[1, [2], 'three']

# 但是修改新列表中的可变元素，旧列表也跟着变！
>>> l2[1][0] = 'two'
>>> l2
['one', ['two'], 'three']
>>> l
[1, ['two'], 'three']
```

由于 _copy_ 方法只是对列表对象进行 **浅拷贝** ，对新列表可变元素的修改对旧列表可见！

如何理解浅拷贝呢？我们知道，列表对象内部数组保存元素对象的 **指针** ； _copy_ 方法复制内部数组时，拷贝的也是元素对象的指针，而不是将元素对象拷贝一遍。因此，新列表对象与旧列表保存的都是同一组对象：

![](../../youdaonote-images/Pasted%20image%2020221210130017.png)

由此可见，_l_ 和 _l2_ 内嵌的列表对象其实是同一个，一旦对其进行修改，对 _l_ 和 _l2_ 都可见。

_copy_ 方法实现的浅拷贝行为，可能不是你想要的。这时，可以通过 _copy_ 模块里的 _deepcopy_ 函数进行 **深拷贝** ：

```python
# 创建一个列表
>>> l = [1, [2], 'three']
>>> l
[1, [2], 'three']

# 对列表进行深拷贝
>>> from copy import deepcopy
>>> l2 = deepcopy(l)
>>> l2
[1, [2], 'three']

# 修改新列表不会影响旧列表
>>> l2[1][0] = 'two'
>>> l2
[1, ['two'], 'three']
>>> l
[1, [2], 'three']
```

_deepcopy_ 函数将递归复制所有容器对象，确保新旧列表不会包含同一个容器对象。这样一来，代码第 _13_ 行处的修改，便对原列表不可见了。深拷贝的行为跟浅拷贝恰好相反。

**浅拷贝** 和 **深拷贝** 是 _Python_ 面试中频繁考察的概念，必须完全掌握。

## 小结

本节我们一起回顾了 _list_ 对象的典型用法并在此基础上研究其内部结构。 _list_ 对象是一种 **变长对象** ，内部结构除了变长对象 **公共头部** 外，维护着一个 **动态数组** ，用于保存元素对象指针。其中，关键字段包括：

-   _ob_item_ ， **动态数组** 指针，数组保存元素对象指针；
-   _allocated_ ，动态数组长度，即列表 **容量** ；
-   _ob_size_ ，动态数组已保存元素个数，即列表 **长度** 。

_Python_ 内部负责管理 _list_ 对象的容量，在必要时 **自动扩缩容** ，极大降低开发人员的负担。

列表头部操作与尾部操作的性能差距非常大，而 _collections.deque_ 作为替代品可解决列表头部操作的性能问题。列表 _copy_ 方法只实现了 **浅拷贝** ，想要 **深拷贝** 只能借助 _copy.deepcopy_ 函数。

# list源码解析

_list_ 对象是一种 **容量自适应** 的 **线性容器** ，底层由 **动态数组** 实现。动态数组结构决定了 _list_ 对象具有优秀的尾部操作性能，但头部操作性能却很差劲。研发人员只有对底层数据结构有足够的认识，才能最大限度避免问题代码。

现成的动态数组实现很多，除了我们正在研究的 _list_ 对象，_C++_ 中的 vector 也是众所周知。

 ## 容量调整

当我们调用 _append_ 、_pop_ 、_insert_ 等方法时，列表长度随之发生变化。当列表长度超过底层数组容量时，便需要对底层数组进行 **扩容** ；当列表长度远低于底层数组容量时，便需要对底层数组进行 **缩容** 。

_Objects/listobject.c_ 源码表明，_append_ 等方法依赖 _list_resize_ 函数调整列表长度，扩容缩容的秘密就藏在这里！_list_resize_ 函数在调整列表长度前，先检查底层数组容量，并在必要时重新分配底层数组。接下来，我们一起来解读 _list_resize_ 函数，该函数同样位于源文件 _Objects/listobject.c_ 中：

```c
static int
list_resize(PyListObject *self, Py_ssize_t newsize)
{
    PyObject **items;
    size_t new_allocated, num_allocated_bytes;
    Py_ssize_t allocated = self->allocated;

    /* Bypass realloc() when a previous overallocation is large enough
       to accommodate the newsize.  If the newsize falls lower than half
       the allocated size, then proceed with the realloc() to shrink the list.
    */
    if (allocated >= newsize && newsize >= (allocated >> 1)) {
        assert(self->ob_item != NULL || newsize == 0);
        Py_SIZE(self) = newsize;
        return 0;
    }

    /* This over-allocates proportional to the list size, making room
     * for additional growth.  The over-allocation is mild, but is
     * enough to give linear-time amortized behavior over a long
     * sequence of appends() in the presence of a poorly-performing
     * system realloc().
     * The growth pattern is:  0, 4, 8, 16, 25, 35, 46, 58, 72, 88, ...
     * Note: new_allocated won't overflow because the largest possible value
     *       is PY_SSIZE_T_MAX * (9 / 8) + 6 which always fits in a size_t.
     */
    new_allocated = (size_t)newsize + (newsize >> 3) + (newsize < 9 ? 3 : 6);
    if (new_allocated > (size_t)PY_SSIZE_T_MAX / sizeof(PyObject *)) {
        PyErr_NoMemory();
        return -1;
    }

    if (newsize == 0)
        new_allocated = 0;
    num_allocated_bytes = new_allocated * sizeof(PyObject *);
    items = (PyObject **)PyMem_Realloc(self->ob_item, num_allocated_bytes);
    if (items == NULL) {
        PyErr_NoMemory();
        return -1;
    }
    self->ob_item = items;
    Py_SIZE(self) = newsize;
    self->allocated = new_allocated;
    return 0;
}
```

在函数开头，有几个局部变量定义，对理解函数逻辑非常关键：

-   _items_ 指针，用于保存新数组；
-   _new_allocated_ ，用于保存新数组容量；
-   _num_allocated_bytes_ ，用于保存新数组内存大小，以字节为单位；
-   _allocated_ ，用于保存旧数组容量。

然后，代码第 _12_ 行，检查新长度与底层数组容量的关系。如果新长度不超过数组容量，且不小于数组容量的一半，则无需调整底层数组，直接更新 _ob_size_ 字段。换句话讲， _list_ 对象扩缩容的条件分别如下：

-   **扩容条件** ，新长度大于底层数组长度；
-   **缩容条件** ，新长度小于底层数组长度的一半；

扩容或缩容条件触发时，_list_resize_ 函数根据新长度计算数组容量并重新分配底层数组（第 _27-44_ 行）：

1.  第 _27_ 行，新容量在长度加上 1/8​ 的裕量，再加上 _3_ 或 _6_ 的裕量；
2.  第 _28-31_ 行，如果新容量超过允许范围，返回错误；
3.  第 _33-34_ 行，如果新长度为 _0_ ，将新容量也设置为 _0_ ，因此空列表底层数组亦为空；
4.  第 _36-40_ 行，调用 _PyMem_Realloc_ 函数重新分配底层数组；
5.  第 _41-44_ 行，更新 _3_ 个关键字段，依次设置为 **新底层数组** 、 **新长度** 以及 **新容量** 。

注意到代码第 27 行，新容量的计算公式有点令人费解。为什么还要加上 _3_ 或者 _6_ 的裕量呢？试想一下，如果新长度小于 _8_ ，那么 1/8​ 的裕量便是 _0_ ！这意味着，当 _list_ 对象长度从 _0_ 开始增长时，需要频繁扩容！

为了解决这个问题，必须在1/8​ 裕量的基础上额外加上一定的固定裕量。而 _3_ 和 _6_ 这两个特殊数值的选择，使得列表容量按照 _0_、_4_、_8_、 16、_25_、_35_、_46_、_58_、_72_、_88_…… 这样的序列进行扩张。这样一来，当 _list_ 对象长度较小时，容量翻倍扩展，扩容频率得到有效限制。

顺便提一下， _PyMem_Realloc_ 函数是 _Python_ 内部实现的内存管理函数之一，功能与 _C_ 库函数 _realloc_ 类似：

```c
PyAPI_FUNC(void *) PyMem_Realloc(void *ptr, size_t new_size);
```

_PyMem_Realloc_ 函数用于对动态内存进行扩容或者缩容，关键步骤如下：

1.  新申请一块尺寸为 _new_size_ 的内存区域；
2.  将数据从旧内存区域 _ptr_ 拷贝到新内存区域；
3.  释放旧内存区域 _ptr_ ；
4.  返回新内存区域。

![](../../youdaonote-images/Pasted%20image%2020221210163157.png)

**内存管理** 是最考验研发人员编程功底的领域之一，鼓励大家到 _PyMem_Realloc_ 源码（_./Objects/obmalloc.c_）中进一步研究内存管理的技巧。学有余力的童鞋，可模仿着自己实现一个 _realloc_ 函数，假以时日编程内功将突飞猛进！

## 尾部追加

_append_ 方法在 _Python_ 内部由 _C_ 函数 _list_append_ 实现，而 _list_append_ 进一步调用 _app1_ 函数完成元素追加：

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

1.  第 _4_ 行，调用 _PyList_GET_SIZE_ 取出列表长度，即 _ob_size_ 字段；
2.  第 _7-11_ 行，判断列表当前长度，如果已经达到最大限制，则报错；
3.  第 _13-15_ 行，调用 _list_resize_ 更新列表长度，必要时 _list_resize_ 对底层数组进行 **扩容** ；
4.  第 _16_ 行，自增元素对象 **引用计数** (元素对象新增一个来自列表对象的引用)；
5.  第 17 行，将元素对象指针保存到列表最后一个位置，列表新长度为 _n+1_ ，最后一个位置下标为 _n_ 。

我们看到，有了 _list_resize_ 这个辅助函数后， _app1_ 函数的实现就非常直白了。接下来，我们将看到 _insert_、_pop_ 等方法的实现中也用到这个函数，从中可体会到程序逻辑 **划分** 、 **组合** 的巧妙之处。

## 头部插入

_insert_ 方法在 _Python_ 内部由 _C_ 函数 _list_insert_impl_ 实现，而 _list_insert_impl_ 则调用 _ins1_ 函数完成元素插入：

```c
static int
ins1(PyListObject *self, Py_ssize_t where, PyObject *v)
{
    Py_ssize_t i, n = Py_SIZE(self);
    PyObject **items;
    if (v == NULL) {
        PyErr_BadInternalCall();
        return -1;
    }
    if (n == PY_SSIZE_T_MAX) {
        PyErr_SetString(PyExc_OverflowError,
            "cannot add more objects to list");
        return -1;
    }

    if (list_resize(self, n+1) < 0)
        return -1;

    if (where < 0) {
        where += n;
        if (where < 0)
            where = 0;
    }
    if (where > n)
        where = n;
    items = self->ob_item;
    for (i = n; --i >= where; )
        items[i+1] = items[i];
    Py_INCREF(v);
    items[where] = v;
    return 0;
}
```

1.  第 _4_ 行，调用 _PyList_GET_SIZE_ 取出列表长度，即 _ob_size_ 字段；
2.  第 _10-14_ 行，判断列表当前长度，如果已经达到最大限制，则报错；
3.  第 _16-17_ 行，调用 _list_resize_ 更新列表长度，必要时 _list_resize_ 对底层数组进行 **扩容** ；
4.  第 _19-23_ 行，检查插入位置下标，如果下标为负数，加上 _n_ 将其转换为非负数；
5.  第 _21-22_、_24-25_ 行，检查插入位置下标是否越界，如果越界则设为开头或结尾；
6.  第 _26-28_ 行，将插入位置以后的所有元素逐一往后移一个位置，特别注意 _for_ 循环必须 **从后往前** 迭代；
7.  第 _29_ 行，自增元素对象 **引用计数** (元素对象新增一个来自列表对象的引用)；
8.  第 _30_ 行，将元素对象指针保存到列表指定位置。

_Python_ 序列 **下标很有特色** ，除了支持 _0~n-1_ 这样的惯例外，还支持 **倒数下标** 。倒数下标为负数，从后往前数：最后一个元素为 _-1_ ，倒数第二个为 _-2_ ；以此类推，第一个元素下标为： _-n_ 。

![](../../youdaonote-images/Pasted%20image%2020221210163843.png)

倒数下标非常实用，可以很方便地取出序列最后几个元素，而不用关心序列的长度。 _Python_ 内部处理倒数下标时，自动为其加上长度序列 _n_ ，便转化成普通下标了。

## 弹出元素

_pop_ 方法将指定下标的元素从列表中弹出，下标默认为 _-1_ 。换句话讲，如果未指定下标，_pop_ 弹出最后一个元素：

```python
>>> help(list.pop)
Help on method_descriptor:

pop(self, index=-1, /)
    Remove and return item at index (default last).

    Raises IndexError if list is empty or index is out of range.
```

_pop_ 方法在 _Python_ 内部由 _C_ 函数 _list_pop_impl_ 实现：

```c
static PyObject *
list_pop_impl(PyListObject *self, Py_ssize_t index)
{
    PyObject *v;
    int status;

    if (Py_SIZE(self) == 0) {
        /* Special-case most common failure cause */
        PyErr_SetString(PyExc_IndexError, "pop from empty list");
        return NULL;
    }
    if (index < 0)
        index += Py_SIZE(self);
    if (index < 0 || index >= Py_SIZE(self)) {
        PyErr_SetString(PyExc_IndexError, "pop index out of range");
        return NULL;
    }
    v = self->ob_item[index];
    if (index == Py_SIZE(self) - 1) {
        status = list_resize(self, Py_SIZE(self) - 1);
        if (status >= 0)
            return v; /* and v now owns the reference the list had */
        else
            return NULL;
    }
    Py_INCREF(v);
    status = list_ass_slice(self, index, index+1, (PyObject *)NULL);
    if (status < 0) {
        Py_DECREF(v);
        return NULL;
    }
    return v;
}
```

1.  第 _7-11_ 行，如果列表为空，没有任何元素可弹出，抛出 _IndexError_ 异常；
2.  第 _12-13_ 行，如果给定下标为 **倒数下标** ，先加上列表长度，将其转换成普通下标；
3.  第 _14-16_ 行，检查给定下标是否在合法范围内，超出合法范围同样抛出 _IndexError_ 异常；
4.  第 _18_ 行，从底层数组中取出待弹出元素；
5.  第 _19-25_ 行，如果待弹出元素为列表最后一个，调用 _list_resize_ 快速调整列表长度即可，无需移动其他元素；
6.  第 _26-31_ 行，其他情况下调用 _list_ass_slice_ 函数删除元素，调用前需要通过 _Py_INCREF_ 增加元素引用计数，因为 _list_ass_slice_ 函数内部将释放被删除元素；
7.  第 32 行，将待弹出元素返回。

_list_ass_slice_ 函数其实有两种不同的语义，具体执行哪种语义由函数参数决定，函数接口如下：

```c
/* a[ilow:ihigh] = v if v != NULL.
 * del a[ilow:ihigh] if v == NULL.
 *
 * Special speed gimmick:  when v is NULL and ihigh - ilow <= 8, it's
 * guaranteed the call cannot fail.
 */
static int
list_ass_slice(PyListObject *a, Py_ssize_t ilow, Py_ssize_t ihigh, PyObject *v);
```

-   **删除语义** ，如果最后一个参数 _v_ 值为 _NULL_ ，执行删除语义，即：_del a[ilow:ihigh]_ ；
-   **替换语义** ，如果最后一个参数 _v_ 值不为 _NULL_ ，执行替换语义，即 _a[ilow:ihigh] = v_ 。

因此，代码第 _27_ 行中， _list_ass_slice_ 函数执行删除语义，将 _[index, index+1)_ 范围内的元素删除。由于半开半闭区间 _[index, index+1)_ 中只包含 _index_ 一个元素，效果等同于将下标为 _index_ 的元素删除。

执行删除语义时， _list_ass_slice_ 函数将被删元素后面的元素逐一往前移动，以便重新覆盖删除操作所造成的空隙。由此可见，_pop_ 方法弹出元素，时间复杂度跟弹出位置有关：

-   最好时间复杂度 ( **尾部弹出** )，O(1) ；
-   最坏时间复杂度 ( **头部弹出** )，O(n)；
-   平均时间复杂度， O(n/2) ，亦即 O(n) 。

![](../../youdaonote-images/Pasted%20image%2020221210165059.png)

因此，调用 _pop_ 方法弹出非尾部元素时，需要非常谨慎。

## 删除元素

_remove_ 方法将给定元素从列表中删除。与 _pop_ 略微不同，_remove_ 方法直接给定待删除元素，而不是元素下标。_remove_ 方法在 _Python_ 内部由 _C_ 函数 _list_remove_ 实现：

```c
static PyObject *
list_remove(PyListObject *self, PyObject *value)
/*[clinic end generated code: output=f087e1951a5e30d1 input=2dc2ba5bb2fb1f82]*/
{
    Py_ssize_t i;

    for (i = 0; i < Py_SIZE(self); i++) {
        int cmp = PyObject_RichCompareBool(self->ob_item[i], value, Py_EQ);
        if (cmp > 0) {
            if (list_ass_slice(self, i, i+1,
                               (PyObject *)NULL) == 0)
                Py_RETURN_NONE;
            return NULL;
        }
        else if (cmp < 0)
            return NULL;
    }
    PyErr_SetString(PyExc_ValueError, "list.remove(x): x not in list");
    return NULL;
}
```

_list_remove_ 函数先遍历列表中每个元素（第 _7_ 行），检查元素是否为待删除元素 _value_ （第 _8_ 行），以此确定下标。然后， _list_remove_ 函数调用 _list_ass_slice_ 函数进行删除。注意到，如果给定元素不存在， _list_remove_ 将抛出 _ValueError_ 异常。

由此可见，_remove_ 方法在删除前有一个时间复杂度为 O(n)O(n) 的查找过程，性能不甚理想，须谨慎使用。

## 小结

_list_ 对象是一种 **容量自适应** 的 **线性容器** ，底层由 **动态数组** 实现。_Python_ 内部由函数 _list_resize_ 调整列表长度， _list_resize_ 自动为列表进行 **扩容** 或者 **缩容** ：

-   底层数组容量不够时，需要进行 **扩容** ；
-   扩容时， _Python_ 额外分配大约 1/81/8 的容量裕量，以控制扩容频率；
-   底层数组空闲位置超过一半时，需要进行 **缩容** 。

动态数组的特性决定了 _list_ 对象相关操作性能有好有坏，使用时须特别留意：

-   _append_ 向尾部追加元素，时间复杂度为 O(1)O(1) ，放心使用；
-   _insert_ 往列表插入元素，最坏时间复杂度是 O(n)O(n) ，平均时间复杂度也是 O(n)O(n)，须谨慎使用；
-   _pop_ 从列表中弹出元素，最好时间复杂度为 O(1)O(1) ，平均时间复杂度为 O(n)O(n) ，弹出非尾部元素时需谨慎；
-   _remove_ 从列表中删除元素，时间复杂度为 O(n)O(n)，同样须谨慎使用。

> 也有缓存池,里面是pylist_object对象