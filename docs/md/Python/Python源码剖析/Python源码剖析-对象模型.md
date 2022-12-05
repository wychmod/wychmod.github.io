## 一切皆对象

在 _Python_ 世界， **基本类型也是对象** ，与通常意义的“对象”形成一个有机统一。 换句话讲， _Python_ 不再区别对待基本类型和对象，所有基本类型内部均由对象实现。 一个整数是一个对象，一个字符串也是一个对象。

 _Python_ 中的 **类型也是一种对象** ，称为 **类型对象** 。 整数类型是一个对象，字符串类型是一个对象，程序中通过 _class_ 关键字定义的类也是一个对象。

通过整数类型 **实例化** 可以得到一个整数对象，称为 **实例对象** ：

```python
>>> int('1024')
1024
```

![](../../youdaonote-images/Pasted%20image%2020221205163448.png)

## 类型、对象体系

_a_ 是一个整数对象( **实例对象** )，其类型是整数类型( **类型对象** )：
```python
>>> a = 1
>>> type(a)
<class 'int'>
>>> isinstance(a, int)
True

>>> type(int)
<class 'type'>
```

可以看到，整数类型的类型还是一种类型，即 **类型的类型** 。 只是这个类型比较特殊，它的实例对象还是类型对象。

_Python_ 中还有一个特殊类型 _object_ ，所有其他类型均继承于 _object_ ，换句话讲 _object_ 是所有类型的基类：

```python
>>> issubclass(int, object)
True
```

![](../../youdaonote-images/Pasted%20image%2020221205163824.png)

![](../../youdaonote-images/Pasted%20image%2020221205163936.png)

现在不可避免需要讨论 _type_ 以及 _object_ 这两个特殊的类型。

理论上， _object_ 是所有类型的 **基类** ，本质上是一种类型，因此其类型必然是 _type_ 。 而 _type_ 是所有类型的类型，本质上也是一种类型，因此其类型必须是它自己！

```python
>>> type(object)
<class 'type'>
>>> type(object) is type
True

>>> type(type)
<class 'type'>
>>> type(type) is type
True
```

另外，由于 _object_ 是所有类型的 **基类** ，理论上也是 _type_ 的基类( ___base___ 属性)：

```python
>>> issubclass(type, object)
True
>>> type.__base__
<class 'object'>
```

但是 _object_ 自身便不能有基类了。为什么呢？ 对于存在继承关系的类，成员属性和成员方法查找需要回溯继承链，不断查找基类。 因此，继承链必须有一个终点，不然就死循环了。

![](../../youdaonote-images/Pasted%20image%2020221205164114.png)

## 变量只是名字

在 _Python_ 中，一切皆对象，整数也是如此， **变量只是一个与对象关联的名字** ：

![](../../youdaonote-images/Pasted%20image%2020221205164435.png)

而变量赋值，只是将当前对象与另一个名字进行关联，背后的对象是同一个：

![](../../youdaonote-images/Pasted%20image%2020221205164442.png)

因此，在 _Python_ 内部，变量只是一个名字，保存指向实际对象的指针，进而与其绑定。 变量赋值只拷贝指针，并不拷贝指针背后的对象。在C语言中是如下的：

![](../../youdaonote-images/Pasted%20image%2020221205164527.png)

## 可变对象 与 不可变对象

**可变对象** 在对象创建后，其值可以进行修改； 而 **不可变对象** 在对象创建后的整个生命周期，其值都不可修改。

在 _Python_ 中，整数类型是不可变类型， 整数对象是不可变对象。 修改整数对象时， _Python_ 将以新数值创建一个新对象，变量名与新对象进行绑定； 旧对象如无其他引用，将被释放。

![](../../youdaonote-images/Pasted%20image%2020221205164646.png)

> 每次修改整数对象都要创建新对象、回收旧对象，效率不是很低吗？ 确实是。 后续章节将从源码角度来解答： _Python_ 如何通过 **小整数池** 等手段进行优化。

可变对象是指创建后可以修改的对象，典型的例子是 **列表** ( _list_ )：
```python
>>> l = [1, 2]
>>> l
[1, 2]
>>> id(l)
4385900424

>>> l.append(3)
>>> l
[1, 2, 3]
>>> id(l)
4385900424
```

实际上，列表对象内部维护了一个 **动态数组** ，存储元素对象的指针：

![](../../youdaonote-images/Pasted%20image%2020221205164745.png)

## 定长对象 与 变长对象

标准库 _sys_ 模块提供了一个查看对象大小的函数 _getsizeof_ ：

```python
>>> import sys
>>> sys.getsizeof(1)
28

>>> sys.getsizeof(100000000000000000)
32
>>> sys.getsizeof(100000000000000000000000000000000000000000000)
44
```

可见整数对象的大小跟其数值有关，像这样 **大小不固定** 的对象称为 **变长对象** 。

位数固定的整数能够表示的数值范围是有限的，可能导致 **溢出** 。 _Python_ 为解决这个问题，采用类似 _C++_ 中 **大整数类** 的思路实现整数对象—— 串联多个普通 _32_ 位整数，以便支持更大的数值范围。 至于需要多少个 _32_ 位整数，则视具体数值而定，数值不大的一个足矣，避免浪费。

整数对象需要在头部额外存储一些信息，记录对象用了多少个 _32_ 位整数。

字符串对象：

```python
>>> sys.getsizeof('a')
50
>>> sys.getsizeof('abc')
52
```

![](../../youdaonote-images/Pasted%20image%2020221205170650.png)

字符串对象大小比字符串本身大，因为对象同样需要维护一些额外的信息。

**定长对象——浮点数对象 _float_** ：

![](../../youdaonote-images/Pasted%20image%2020221205170812.png)
浮点数背后是由一个 _double_ 实现，就算表示很大的数，浮点数对象的大小也不变。

由于浮点数存储位数是固定的，它能表示的数值范围也是有限的，超出便会抛锚：

```python
>>> 10. ** 1000
Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
OverflowError: (34, 'Result too large')
```

## PyObject，对象的基石

> 由于 _Python_ 是由 _C_ 语言实现的，因此 _Python_ 对象在 _C_ 语言层面应该是一个 **结构体** ，组织对象占用的内存。

在 _Python_ 内部，对象都由 _PyObject_ 结构体表示，对象引用则是指针 _PyObject_ * 。 _PyObject_ 结构体定义于头文件 _object.h_ ，路径为 _Include/object.h_ ，代码如下：

```python
typedef struct _object {
    _PyObject_HEAD_EXTRA
    Py_ssize_t ob_refcnt;
    struct _typeobject *ob_type;
} PyObject;
```

除了 __PyObject_HEAD_EXTRA_ 宏，结构体包含以下两个字段：

-   **引用计数** ( ob_refcnt )
-   **类型指针** ( ob_type )

**引用计数** 很好理解：对象被其他地方引用时加一，引用解除时减一； 当引用计数为零，便可将对象回收，这是最简单的垃圾回收机制。 **类型指针** 指向对象的 **类型对象** ，**类型对象** 描述 **实例对象** 的数据及行为。

回过头来看 __PyObject_HEAD_EXTRA_ 宏的定义，同样在 _Include/object.h_ 头文件内：

```c
#ifdef Py_TRACE_REFS
/* Define pointers to support a doubly-linked list of all live heap objects. */
#define _PyObject_HEAD_EXTRA            \
    struct _object *_ob_next;           \
    struct _object *_ob_prev;

#define _PyObject_EXTRA_INIT 0, 0,

#else
#define _PyObject_HEAD_EXTRA
#define _PyObject_EXTRA_INIT
#endif
```

如果 _Py_TRACE_REFS_ 有定义，宏展开为两个指针，看名字是用来实现 **双向链表** 的：

```c
struct _object *_ob_next;
struct _object *_ob_prev;
```

结合注释，双向链表用于跟踪所有 **活跃堆对象** ，一般不启用，不深入介绍。

对于 **变长对象** ，需要在 _PyObject_ 基础上加入长度信息，这就是 _PyVarObject_ ：

```c
typedef struct {
    PyObject ob_base;
    Py_ssize_t ob_size; /* Number of items in variable part */
} PyVarObject;
```

变长对象比普通对象多一个字段 _ob_size_ ，用于记录元素个数：

![图片描述](http://img1.sycdn.imooc.com/5eb908c40001a82807410317.png)

