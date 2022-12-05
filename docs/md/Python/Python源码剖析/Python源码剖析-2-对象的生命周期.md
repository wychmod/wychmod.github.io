> 以下讨论以一个足够简单的类型 _float_ 为例，对应的 _C_ 实体是 _PyFloat_Type_ 。

## C API

_Python_ 是用 _C_ 写成的，对外提供了 _C API_ ，让用户可以从 _C_ 环境中与其交互。 _Python_ 内部也大量使用这些 _API_ ，为了更好研读源码，先系统了解 _API_ 组成结构很有必要。 _C API_ 分为两类： **泛型 API** 以及 **特型 API** 。

### 泛型 API

**泛型 API** 与类型无关，属于 **抽象对象层** ( _Abstract Object Layer_ )，简称 _AOL_ 。 这类 API 参数是 _PyObject_* ，可处理任意类型的对象， _API_ 内部根据对象类型区别处理。

以对象打印函数为例：

```c
int
PyObject_Print(PyObject *op, FILE *fp, int flags)
```

接口第一个参数为待打印对象，可以是任意类型的对象，因此参数类型是 _PyObject_* 。 _Python_ 内部一般都是通过 _PyObject_* 引用对象，以达到泛型化的目的。

对于任意类型的对象，均可调用 _PyObject_Print_ 将其打印出来：

```c
// 打印浮点对象
PyObject *fo = PyFloatObject_FromDouble(3.14);
PyObject_Print(fo, stdout, 0);

// 打印整数对象
PyObject *lo = PyFloatObject_FromLong(100);
PyObject_Print(lo, stdout, 0);
```

_PyObject_Print_ 接口内部根据对象类型，决定如何输出对象。

### 特型 API

**特型 API** 与类型相关，属于 **具体对象层** ( _Concrete Object Layer_ )，简称 _COL_ 。 这类 _API_ 只能作用于某种类型的对象，例如浮点对象 _PyFloatObject_ 。 _Python_ 内部为每一种内置对象提供了这样一组 _API_ ，举例如下：

```c
PyObject *
PyFloat_FromDouble(double fval)
```

_PyFloat_FromDouble_ 创建一个浮点对象，并将它初始化为给定值 _fval_ 。

## 对象的创建

我们知道对象的 **元数据** 保存在对应的 **类型对象** 中，元数据当然也包括 **对象如何创建** 的信息。 因此，有理由相信 **实例对象** 由 **类型对象** 创建。

不管创建对象的流程如何，最终的关键步骤都是 **分配内存** 。 _Python_ 对 **内建对象** 是无所不知的，因此可以提供 _C API_ ，直接分配内存并执行初始化。 以 _PyFloat_FromDouble_ 为例，在接口内部为 _PyFloatObject_ 结构体分配内存，并初始化相关字段即可。

对于用户自定义的类型 _class Dog(object)_ ， _Python_ 就无法事先提供 _PyDog_New_ 这样的 _C API_ 了。 这种情况下，就只能通过 _Dog_ 所对应的类型对象创建实例对象了。 至于需要分配多少内存，如何进行初始化，答案就需要在 **类型对象** 中找了。

总结起来，_Python_ 内部一般通过这两种方法创建对象：

-   通过 _C API_ ，例如 _PyFloat_FromDouble_ ，多用于内建类型；
-   通过类型对象，例如 _Dog_ ，多用于自定义类型；

通过类型对象创建实例对象，是一个更通用的流程，同时支持内置类型和自定义类型。 以创建浮点对象为例，我们还可以通过浮点类型 _PyFloat_Type_ 来创建：

```python
>>> pi = float('3.14')
>>> pi
3.14
```

例子中我们通过调用类型对象 _float_ ，实例化了一个浮点实例 _pi_ ，对象居然还可以调用！在 _Python_ 中，可以被调用的对象就是 **可调用对象** 。

问题来了，可调用对象被调用时，执行什么函数呢？ 由于类型对象保存着实例对象的元信息， _float_ 类型对象的类型是 _type_ ，因此秘密应该就隐藏在 _type_ 中。

再次考察 _PyType_Type_ ，我们找到了 _tp_call_ 字段，这是一个函数指针：

```c
PyTypeObject PyType_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "type",                                     /* tp_name */
    sizeof(PyHeapTypeObject),                   /* tp_basicsize */
    sizeof(PyMemberDef),                        /* tp_itemsize */

    // ...
    (ternaryfunc)type_call,                     /* tp_call */

    // ...
};
```

当实例对象被调用时，便执行 _tp_call_ 字段保存的处理函数。

因此， _float(‘3.14’)_ 在 _C_ 层面等价于：

```c
PyFloat_Type.ob_type.tp_call(&PyFloat_Type, args, kwargs)
```

即：

```c
PyType_Type.tp_call(&PyFloat_Type, args, kwargs)
```

最终执行， type_call 函数：

```c
type_call(&PyFloat_Type, args, kwargs)
```

调用参数通过 _args_ 和 _kwargs_ 两个对象传递，先不展开，留到函数机制中详细介绍。

接着围观 _type_call_ 函数，定义于 _Include/typeobject.c_ ，关键代码如下：

```c
static PyObject *
type_call(PyTypeObject *type, PyObject *args, PyObject *kwds)
{
    PyObject *obj;

    // ...
    obj = type->tp_new(type, args, kwds);
    obj = _Py_CheckFunctionResult((PyObject*)type, obj, NULL);
    if (obj == NULL)
        return NULL;

    // ...
    type = Py_TYPE(obj);
    if (type->tp_init != NULL) {
        int res = type->tp_init(obj, args, kwds);
        if (res < 0) {
            assert(PyErr_Occurred());
            Py_DECREF(obj);
            obj = NULL;
        }
        else {
            assert(!PyErr_Occurred());
        }
    }
    return obj;
}
```

可以看到，关键的步骤有两个：

1.  调用类型对象 _tp_new_ 函数指针 **申请内存** (第 _7_ 行)；
2.  必要时调用类型对象 _tp_init_ 函数指针对对象进行 **初始化** (第 _15_ 行)；

至此，对象的创建过程已经非常清晰了：

![](../../youdaonote-images/Pasted%20image%2020221205225707.png)

总结一下，_float_ 类型对象是 **可调用对象** ，调用 _float_ 即可创建实例对象：

1.  调用 _float_ ， _Python_ 最终执行其类型对象 _type_ 的 _tp_call_ 函数；
2.  _tp_call_ 函数调用 _float_ 的 _tp_new_ 函数为实例对象分配 **内存空间** ；
3.  _tp_call_ 函数必要时进一步调用 _tp_init_ 函数对实例对象进行 **初始化** ；

## 对象的多态性

_Python_ 创建一个对象，比如 _PyFloatObject_ ，会分配内存，并进行初始化。 此后， _Python_ 内部统一通过一个 _PyObject_* 变量来保存和维护这个对象，而不是通过 _PyFloatObject_* 变量。

通过 _PyObject_* 变量保存和维护对象，可以实现更抽象的上层逻辑，而不用关心对象的实际类型和实现细节。 以对象哈希值计算为例，假设有这样一个函数接口：

```c
Py_hash_t
PyObject_Hash(PyObject *v);
```

该函数可以计算任意对象的哈希值，不管对象类型是啥。 例如，计算浮点对象哈希值：

```c
PyObject *fo = PyFloatObject_FromDouble(3.14);
PyObject_Hash(fo);
```

对于其他类型，例如整数对象，也是一样的：

```c
PyObject *lo = PyLongObject_FromLong(100);
PyObject_Hash(lo);
```

然而，对象类型不同，其行为也千差万别，哈希值计算方法便是如此。 _PyObject_Hash_ 函数如何解决这个问题呢？ 到 _Object/object.c_ 中寻找答案：

```c
Py_hash_t
PyObject_Hash(PyObject *v)
{
    PyTypeObject *tp = Py_TYPE(v);
    if (tp->tp_hash != NULL)
        return (*tp->tp_hash)(v);
    /* To keep to the general practice that inheriting
    * solely from object in C code should work without
    * an explicit call to PyType_Ready, we implicitly call
    * PyType_Ready here and then check the tp_hash slot again
    */
    if (tp->tp_dict == NULL) {
        if (PyType_Ready(tp) < 0)
            return -1;
        if (tp->tp_hash != NULL)
            return (*tp->tp_hash)(v);
    }
    /* Otherwise, the object can't be hashed */
    return PyObject_HashNotImplemented(v);
}
```

函数先通过 _ob_type_ 指针找到对象的类型 (第 _4_ 行)； 然后通过类型对象的 _tp_hash_ 函数指针，调用对应的哈希值计算函数 (第 _6_ 行)。 换句话讲， _PyObject_Hash_ 根据对象的类型，调用不同的函数版本。 这不就是 **多态** 吗？

通过 _ob_type_ 字段， _Python_ 在 _C_ 语言层面实现了对象的 **多态** 特性， 思路跟 _C++_ 中的 **虚表指针** 有异曲同工之妙。

## 对象的行为

不同对象的行为不同，比如哈希值计算方法就不同，由类型对象中 _tp_hash_ 字段决定。 除了 _tp_hash_ ，我们看到 _PyTypeObject_ 结构体还定义了很多函数指针，这些指针最终都会指向某个函数，或者为空。 这些函数指针可以看做是 **类型对象** 中定义的 **操作** ，这些操作决定对应 **实例对象** 在运行时的 **行为** 。

尽管如此，不同对象也有一些共性。 举个例子，**整数对象** 和 **浮点对象** 都支持加减乘除等 **数值型操作** ：

```python
>>> 1 + 2
3
>>> 3.14 * 3.14
9.8596
```

**元组对象** _tuple_ 和 **列表对象** _list_ 都支持下标操作：

```python
>>> t = ('apple', 'banana', 'car', 'dog')
>>> t[-1]
'dog'
>>> l = ['alpha', 'beta']
>>> l[-1]
'beta'
```

因此，以对象行为为依据，可以对对象进行分类：