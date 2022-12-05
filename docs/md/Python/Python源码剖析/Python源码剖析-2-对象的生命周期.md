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