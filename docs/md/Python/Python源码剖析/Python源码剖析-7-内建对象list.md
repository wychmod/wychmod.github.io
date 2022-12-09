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

由此可见，对列表头部和尾部进行操作，性能有天壤之别。后续我们将一起探索 _list_ 对象内部结构，从中寻找造成这种现象的原因。此外， _list_ 对象还可根据元素个数 **自动扩缩容** ，其中秘密也将一一揭晓。

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