>  _float_ 作为 _Python_ 中最简单的对象之一，“麻雀虽小，五脏俱全”， 拥有对象的全部必要属性。

# 内部结构

_float_ 实例对象在 _Include/floatobject.h_ 中定义，结构很简单：

```c
typedef struct {
    PyObject_HEAD
    double ob_fval;
} PyFloatObject;
```

除了定长对象共用的头部，只有一个额外的字段 _ob_fval_ ，存储对象所承载的浮点值。

![](../../youdaonote-images/Pasted%20image%2020221206201613.png)

与实例对象不同， _float_ 类型对象 **全局唯一** ，因此可以作为 **全局变量** 定义。 在 _C_ 文件 _Objects/floatobject.c_ 中，我们找到了代表 _float_ 类型对象的全局变量 _PyFloat_Type_ ：

```c
PyTypeObject PyFloat_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "float",
    sizeof(PyFloatObject),
    0,
    (destructor)float_dealloc,                  /* tp_dealloc */
    0,                                          /* tp_print */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_reserved */
    (reprfunc)float_repr,                       /* tp_repr */
    &float_as_number,                           /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    (hashfunc)float_hash,                       /* tp_hash */
    0,                                          /* tp_call */
    (reprfunc)float_repr,                       /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Py_TPFLAGS_DEFAULT | Py_TPFLAGS_BASETYPE,   /* tp_flags */
    float_new__doc__,                           /* tp_doc */
    0,                                          /* tp_traverse */
    0,                                          /* tp_clear */
    float_richcompare,                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    float_methods,                              /* tp_methods */
    0,                                          /* tp_members */
    float_getset,                               /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    float_new,                                  /* tp_new */
};
```

_PyFloat_Type_ 中保存了很多关于浮点对象的 **元信息** ，关键字段包括：

-   _tp_name_ 字段保存类型名称，常量 _float_ ；
-   _tp_dealloc_ 、 _tp_init_ 、 _tp_alloc_ 和 _tp_new_ 字段是对象创建销毁相关函数；
-   _tp_repr_ 字段是生成语法字符串表示形式的函数；
-   _tp_str_ 字段是生成普通字符串表示形式的函数；
-   _tp_as_number_ 字段是数值操作集；
-   _tp_hash_ 字段是哈希值生成函数；

_PyFloat_Type_ 很重要，作为浮点 **类型对象** ，它决定了浮点 **实例对象** 的 **生死和行为** 。 

# 对象的创建

在 [Python源码剖析-2-对象的生命周期](Python源码剖析-2-对象的生命周期.md) 中，我们初步了解到创建实例对象的一般过程。

调用类型对象 _float_ 创建实例对象，_Python_ 执行的是 _type_ 类型对象中的 _tp_call_ 函数。 _tp_call_ 函数进而调用 _float_ 类型对象的 _tp_new_ 函数创建实例对象， 再调用 _tp_init_ 函数对其进行初始化：

![](../../youdaonote-images/Pasted%20image%2020221206202153.png)

注意到， _float_ 类型对象 _PyFloat_Type_ 中 _tp_init_ 函数指针为空。 这是因为 _float_ 是一种很简单的对象，初始化操作只需要一个赋值语句，在 _tp_new_ 中完成即可。

除了通用的流程， _Python_ 为内置对象实现了对象创建 _API_ ，简化调用，提高效率：

```c
PyObject *
PyFloat_FromDouble(double fval);

PyObject *
PyFloat_FromString(PyObject *v);
```

-   _PyFloat_FromDouble_ 函数通过浮点值创建浮点对象；
-   _PyFloat_FromString_ 函数通过字符串对象创建浮点对象；

以 _PyFloat_FromDouble_ 为例，特化的对象创建流程如下：

```c
PyObject *
PyFloat_FromDouble(double fval)
{
    PyFloatObject *op = free_list;
    if (op != NULL) {
        free_list = (PyFloatObject *) Py_TYPE(op);
        numfree--;
    } else {
        op = (PyFloatObject*) PyObject_MALLOC(sizeof(PyFloatObject));
        if (!op)
            return PyErr_NoMemory();
    }
    /* Inline PyObject_New */
    (void)PyObject_INIT(op, &PyFloat_Type);
    op->ob_fval = fval;
    return (PyObject *) op;
}
```

1.  为对象 **分配内存空间** ，优先使用空闲对象缓存池 (第 _4-12_ 行)；
2.  初始化 **对象类型** 字段 _ob_type_ 以及 **引用计数** 字段 _ob_refcnt_ (第 _14_ 行)；
3.  将 _ob_fval_ 字段初始化为指定 **浮点值** (第 _15_ 行)；

其中，宏 _PyObject_INIT_ 在头文件 _Include/objimpl.h_ 中定义：

```c
#define PyObject_INIT(op, typeobj) \
    ( Py_TYPE(op) = (typeobj), _Py_NewReference((PyObject *)(op)), (op) )
```

宏 __Py_NewReference_ 将对象引用计数初始化为 _1_ ，在 _Include/Object.h_ 中定义：

```c
#define _Py_NewReference(op) (                          \
    _Py_INC_TPALLOCS(op) _Py_COUNT_ALLOCS_COMMA         \
    _Py_INC_REFTOTAL  _Py_REF_DEBUG_COMMA               \
    Py_REFCNT(op) = 1)
```

# 对象的销毁

当对象不再需要时， _Python_ 通过 _Py_DECREF_ 或者 _Py_XDECREF_ 宏减少引用计数； 当引用计数降为 _0_ 时， _Python_ 通过 __Py_Dealloc_ 宏回收对象。

__Py_Dealloc_ 宏调用类型对象 _PyFloat_Type_ 中的 _tp_dealloc_ 函数指针：

```c
#define _Py_Dealloc(op) (                               \
    _Py_INC_TPFREES(op) _Py_COUNT_ALLOCS_COMMA          \
    (*Py_TYPE(op)->tp_dealloc)((PyObject *)(op)))
```

因此，实际调用的函数是 _float_dealloc_ (代码在下一小节 **空闲对象缓存池** 中解析)：

```c
static void
float_dealloc(PyFloatObject *op)
{
    if (PyFloat_CheckExact(op)) {
        if (numfree >= PyFloat_MAXFREELIST)  {
            PyObject_FREE(op);
            return;
        }
        numfree++;
        Py_TYPE(op) = (struct _typeobject *)free_list;
        free_list = op;
    }
    else
        Py_TYPE(op)->tp_free((PyObject *)op);
}
```

总结起来，对象从创建到销毁整个生命周期所涉及的 **关键函数、宏及调用关系** 如下：

![](../../youdaonote-images/Pasted%20image%2020221206203929.png)

# 空闲对象缓存池

浮点运算背后涉及 **大量临时对象创建以及销毁** ，以计算圆周率为例：

```c
>>> area = pi * r ** 2
```

这个语句首先计算半径 _r_ 的平方，中间结果由一个临时对象来保存，假设是 _t_ ； 然后计算圆周率 _pi_ 与 _t_ 的乘积，得到最终结果并赋值给变量 _area_ ； 最后，销毁临时对象 _t_ 。 这么简单的语句，背后居然都隐藏着一个临时对象的创建以及销毁操作！

创建对象时需要分配内存，销毁对象时又需要回收内存。 **大量临时对象创建销毁** ，意味着 **大量内存分配回收操作** ，这显然是是不可接受的。

因此 _Python_ 在浮点对象销毁后，并不急于回收内存，而是将对象放入一个 **空闲链表** 。 后续需要创建浮点对象时，先到空闲链表中取，省去分配内存的开销。

浮点对象的空闲链表同样在 _Objects/floatobject.c_ 中定义：

```c
#ifndef PyFloat_MAXFREELIST
#define PyFloat_MAXFREELIST    100
#endif
static int numfree = 0;
static PyFloatObject *free_list = NULL;
```

-   _free_list_ 变量，指向空闲链表 **头节点** 的指针；
-   _numfree_ 变量，维护空闲链表 **当前长度** ；
-   _PyFloat_MAXFREELIST_ 宏，限制空闲链表的 **最大长度** ，避免占用过多内存；

为了保持简洁， _Python_ 把 _ob_type_ 字段当作 _next_ 指针来用，将空闲对象串成链表：

![](../../youdaonote-images/Pasted%20image%2020221206204346.png)

由此一来，需要创建浮点对象时，可以从链表中取出空闲对象，省去申请内存的开销！ 以 _PyFloat_FromDouble_ 为例：

```c
PyFloatObject *op = free_list;
if (op != NULL) {
    free_list = (PyFloatObject *) Py_TYPE(op);
    numfree--;
} else {
    op = (PyFloatObject*) PyObject_MALLOC(sizeof(PyFloatObject));
    // ...
}
```

1.  检查 _free_list_ 是否为空(第 _2_ 行)；
2.  如果 _free_list_ 非空，取出头节点备用， 并将 _numfree_ 减一(第 _3-4_ 行)；
3.  如果 _free_list_ 为空，则调用 _PyObject_MALLOC_ 分配内存(第 _6_ 行)；

如果对 C 语言链表操作不熟悉，可以结合以下图示加以理解：

![](../../youdaonote-images/Pasted%20image%2020221206204435.png)