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

由于内部数组扩容时，需要将列表元素从旧数组拷贝到新数组，时间复杂度为 O(n)O(n) ，开销较大，需要尽量避免。为此， _Python_ 在为内部数组扩容时，会预留一定裕量，一般是 1/81/8 左右。假设为长度为 _1000_ 的列表对象扩容， _Python_ 会预留大约 _125_ 个空闲位置，分配一个长度 _1125_ 的新数组。

由于扩容操作的存在， _append_ 方法最坏情况下时间复杂度为 O(n)O(n) 。由于扩容操作不会频繁发生，将扩容操作时的元素拷贝开销平摊到多个 _append_ 操作中，平均时间复杂度还是 O(1)O(1) 。