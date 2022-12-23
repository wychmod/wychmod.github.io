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

![](../../youdaonote-images/Pasted%20image%2020221205191602.png)

至于具体对象，视其大小是否固定，需要包含头部 _PyObject_ 或 _PyVarObject_ 。 为此，头文件准备了两个宏定义，方便其他对象使用：

```c
#define PyObject_HEAD          PyObject ob_base;
#define PyObject_VAR_HEAD      PyVarObject ob_base;
```

例如，对于大小固定的 **浮点对象** ，只需在 _PyObject_ 头部基础上， 用一个 **双精度浮点数** _double_ 加以实现：

```c
typedef struct {
    PyObject_HEAD

    double ob_fval;
} PyFloatObject;
```

![](../../youdaonote-images/Pasted%20image%2020221205191627.png)

而对于大小不固定的 **列表对象** ，则需要在 _PyVarObject_ 头部基础上， 用一个动态数组加以实现，数组存储列表包含的对象，即 _PyObject_ 指针：

```c
typedef struct {
    PyObject_VAR_HEAD

    PyObject **ob_item;
    Py_ssize_t allocated;
} PyListObject;
```

![图片描述](http://img1.sycdn.imooc.com/5eb9092600013a1e10680535.png)

如图， _PyListObject_ 底层由一个数组实现，关键字段是以下 _3_ 个：

-   _ob_item_ ，指向 **动态数组** 的指针，数组保存元素对象指针；
-   _allocated_ ，动态数组总长度，即列表当前的 **容量** ；
-   _ob_size_ ，当前元素个数，即列表当前的 **长度** ；

列表容量不足时， _Python_ 会自动扩容，具体做法在讲解 _list_ 源码时再详细介绍。

最后，介绍两个用于初始化对象头部的宏定义。 其中，_PyObject_HEAD_INIT_ 一般用于 **定长对象** ，将引用计数 _ob_refcnt_ 设置为 _1_ 并将对象类型 _ob_type_ 设置成给定类型：

```c
#define PyObject_HEAD_INIT(type)        \
    { _PyObject_EXTRA_INIT              \
    1, type },
```

_PyVarObject_HEAD_INIT_ 在 _PyObject_HEAD_INIT_ 基础上进一步设置 **长度字段** _ob_size_ ，一般用于 **变长对象** ：

```c
#define PyVarObject_HEAD_INIT(type, size)       \
    { PyObject_HEAD_INIT(type) size },
```

## PyTypeObject，类型的基石

在 _PyObject_ 结构体，我们看到了 _Python_ 中所有对象共有的信息。 对于内存中的任一个对象，不管是何类型，它刚开始几个字段肯定符合我们的预期： **引用计数** 、 **类型指针** 以及变长对象特有的 **元素个数** 。

随着研究不断深入，我们发现有一些棘手的问题没法回答：

-   不同类型的对象所需内存空间不同，创建对象时从哪得知内存信息呢？
-   对于给定对象，怎么判断它支持什么操作呢？

对于我们初步解读过的 _PyFloatObject_ 和 _PyListObject_ ，并不包括这些信息。 事实上，这些作为对象的 **元信息** ，应该由一个独立实体保存，与对象所属 **类型** 密切相关。

注意到， _PyObject_ 中包含一个指针 _ob_type_ ，指向一个 **类型对象** ，秘密就藏在这里。类型对象 _PyTypeObject_ 也在 _Include/object.h_ 中定义，字段较多，只讨论关键部分：

```c
typedef struct _typeobject {
    PyObject_VAR_HEAD
    const char *tp_name; /* For printing, in format "<module>.<name>" */
    Py_ssize_t tp_basicsize, tp_itemsize; /* For allocation */

    /* Methods to implement standard operations */
    destructor tp_dealloc;
    printfunc tp_print;

    getattrfunc tp_getattr;
    setattrfunc tp_setattr;

    // ...
    /* Attribute descriptor and subclassing stuff */
    struct _typeobject *tp_base;

    // ......
} PyTypeObject;
```

可见 **类型对象** _PyTypeObject_ 是一个 **变长对象** ，包含变长对象头部。 专有字段有：

-   **类型名称** ，即 _tp_name_ 字段；
-   类型的继承信息，例如 _tp_base_ 字段指向基类对象；
-   创建实例对象时所需的 **内存信息** ，即 _tp_basicsize_ 和 _tp_itemsize_ 字段；
-   该类型支持的相关 **操作信息** ，即 _tp_print_ 、 _tp_getattr_ 等函数指针；

_PyTypeObject_ 就是 **类型对象** 在 _Python_ 中的表现形式，对应着面向对象中“**类**”的概念。 _PyTypeObject_ 保存着对象的 **元信息** ，描述对象的 **类型** 。

接下来，以 **浮点** 为例，考察 **类型对象** 和 **实例对象** 在内存中的形态和关系：

```python
>>> float
<class 'float'>
>>> pi = 3.14
>>> e = 2.71
>>> type(pi) is float
True
```

_float_ 为浮点类型对象，系统中只有唯一一个，保存了所有浮点实例对象的元信息。 而浮点实例对象就有很多了，圆周率 _pi_ 是一个，自然对数 _e_ 是另一个，当然还有其他。

代码中各个对象在内存的形式如下图所示：

![](../../youdaonote-images/Pasted%20image%2020221205193700.png)

其中，两个浮点 **实例对象** 都是 _PyFloatObject_ 结构体， 除了公共头部字段 _ob_refcnt_ 和 _ob_type_ ，专有字段 _ob_fval_ 保存了对应的数值。 浮点 **类型对象** 是一个 _PyTypeObject_ 结构体， 保存了类型名、内存分配信息以及浮点相关操作。 实例对象 _ob_type_ 字段指向类型对象， _Python_ 据此判断对象类型， 进而获悉关于对象的元信息，如操作方法等。 再次提一遍，_float_ 、 _pi_ 以及 _e_ 等变量只是一个指向实际对象的指针。

由于浮点 **类型对象** 全局唯一，在 _C_ 语言层面作为一个全局变量静态定义即可，_Python_ 的确就这么做。 浮点类型对象就藏身于 _Object/floatobject.c_ 中， _PyFloat_Type_ 是也：

```c
PyTypeObject PyFloat_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "float",
    sizeof(PyFloatObject),
    0,
    (destructor)float_dealloc,                  /* tp_dealloc */

    // ...
    (reprfunc)float_repr,                       /* tp_repr */

    // ...
};
```

其中，第 _2_ 行初始化 _ob_refcnt_ 、 _ob_type_ 以及 _ob_size_ 三个字段； 第 3 行将 _tp_name_ 字段初始化成类型名称 _float_ ；再往下是各种操作的函数指针。

注意到 _ob_type_ 指针指向 _PyType_Type_ ，这也是一个静态定义的全局变量。 由此可见，代表“ **类型的类型** ” 即 _type_ 的那个对象应该就是 _PyType_Type_ 了。

## PyType_Type，类型的类型

我们初步考察了 _float_ 类型对象，知道它在 _C_ 语言层面是 _PyFloat_Type_ 全局静态变量。 类型是一种对象，它也有自己的类型，也就是 _Python_ 中的 _type_ ：

```python
>>> float.__class__
<class 'type'>
```

自定义类型也是如此：

```python
>>> class Foo(object):
...     pass
...
>>> Foo.__class__
<class 'type'>
```

那么， _type_ 在 _C_ 语言层面又长啥样呢？

围观 _PyFloat_Type_ 时，我们通过 _ob_type_ 字段揪住了 _PyType_Type_ 。 的确，它就是 _type_ 的肉身。 _PyType_Type_ 在 _Object/typeobject.c_ 中定义：

```c
PyTypeObject PyType_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "type",                                     /* tp_name */
    sizeof(PyHeapTypeObject),                   /* tp_basicsize */
    sizeof(PyMemberDef),                        /* tp_itemsize */
    (destructor)type_dealloc,                   /* tp_dealloc */

    // ...
    (reprfunc)type_repr,                        /* tp_repr */

    // ...
};
```

内建类型和自定义类对应的 _PyTypeObject_ 对象都是这个通过 _PyType_Type_ 创建的。 _PyType_Type_ 在 _Python_ 的类型机制中是一个至关重要的对象，它是所有类型的类型，称为 **元类型** ( _meta class_ )。 借助元类型，你可以实现很多神奇的高级操作。

注意到， _PyType_Type_ 将自己的 _ob_type_ 字段设置成它自己(第 _2_ 行)，这跟我们在 _Python_ 中看到的行为是吻合的：

```python
>>> type.__class__
<class 'type'>
>>> type.__class__ is type
True
```

至此，元类型 type 在对象体系里的位置非常清晰了：

![](../../youdaonote-images/Pasted%20image%2020221205201129.png)

## PyBaseObject_Type，类型之基

_object_ 是另一个特殊的类型，它是所有类型的基类。 那么，怎么找到它背后的实体呢？ 理论上，通过 _PyFloat_Type_ 中 _tp_base_ 字段顺藤摸瓜即可。

然而，我们发现这个字段在并没有初始化：

```c
0,                                          /* tp_base */
```

这又是什么鬼？

接着查找代码中 _PyFloat_Type_ 出现的地方，我们在 _Object/object.c_ 发现了蛛丝马迹：

```c
if (PyType_Ready(&PyFloat_Type) < 0)
    Py_FatalError("Can't initialize float type");
```

敢情 _PyFloat_Type_ 静态定义后还是个半成品呀！ _PyType_Ready_ 对它做进一步加工，将 _PyFloat_Type_ 中 _tp_base_ 字段初始化成 _PyBaseObject_Type_ ：

```c
int
PyType_Ready(PyTypeObject *type)
{
    // ...

    base = type->tp_base;
    if (base == NULL && type != &PyBaseObject_Type) {
        base = type->tp_base = &PyBaseObject_Type;
        Py_INCREF(base);
    }

    // ...
}
```

_PyBaseObject_Type_ 就是 _object_ 背后的实体，先一睹其真容：

```c
PyTypeObject PyBaseObject_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "object",                                   /* tp_name */
    sizeof(PyObject),                           /* tp_basicsize */
    0,                                          /* tp_itemsize */
    object_dealloc,                             /* tp_dealloc */

    // ...
    object_repr,                                /* tp_repr */
};
```

注意到， _ob_type_ 字段指向 _PyType_Type_ 跟 _object_ 在 _Python_ 中的行为时相吻合的：

```python
>>> object.__class__
<class 'type'>
```

又注意到 _PyType_Ready_ 函数初始化 _PyBaseObject_Type_ 时，不设置 _tp_base_ 字段。 因为继承链必须有一个终点，不然对象沿着继承链进行属性查找时便陷入死循环。

```python
>>> print(object.__base__)
None
```

至此，我们完全弄清了 _Python_ 对象体系中的所有实体以及关系，得到一幅完整的图画：

![](../../youdaonote-images/Pasted%20image%2020221205202725.png)

> print 会调用type类的中的print  实现了多态