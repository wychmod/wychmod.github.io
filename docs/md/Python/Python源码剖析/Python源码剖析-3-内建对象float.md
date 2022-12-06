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