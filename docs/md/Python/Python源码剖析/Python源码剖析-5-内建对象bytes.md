不少编程语言中的 **字符串** 都是由 **字符数组** (或称为 **字节序列** )来表示， _C_ 语言就是这样。

```python
char msg[] = "Hello, world!";
```

由于一个字节最多只能表示 _256_ 种字符，用来表示英文字符绰绰有余，想覆盖非英文字符便捉襟见肘了。为了表示众多的非英文字符(比如汉字)，计算机先驱们发明了 **多字节编码** ——通过多个字节来表示一个字符。由于原始字节序列不维护编码信息，操作不慎便导致各种乱码现象。

_Python_ 提供的解决方案是 _Unicode_ _字符串_ ( _str_ )对象， _Unicode_ 可以表示各种字符，无需关心编码。然而存储或者网络通讯时，字符串对象不可避免要 **序列化** 成字节序列。为此， _Python_ 额外提供了字节序列对象—— _bytes_ 。

![](../../youdaonote-images/Pasted%20image%2020221209112019.png)

如上图， _str_ 对象统一表示一个 **字符串** ，不需要关心编码；计算机通过 **字节序列** 与存储介质和网络介质打交道，字节序列由 _bytes_ 对象表示；存储或传输 _str_ 对象时，需要将其 **序列化** 成字节序列，序列化过程也是 **编码** 的过程。

# 对象结构

_bytes_ 对象用于表示由若干字节组成的 **字节序列** 以及相关的 **操作** ，并不关心字节序列的 **含义** 。因此， _bytes_ 应该是一种 **变长对象** ，内部由 _C_ 数组实现。 _Include/bytesobject.h_ 头文件中的定义印证了我们的猜测：

```c
typedef struct {
    PyObject_VAR_HEAD
    Py_hash_t ob_shash;
    char ob_sval[1];

    /* Invariants:
     *     ob_sval contains space for 'ob_size+1' elements.
     *     ob_sval[ob_size] == 0.
     *     ob_shash is the hash of the string or -1 if not computed yet.
     */
} PyBytesObject;
```

![](../../youdaonote-images/Pasted%20image%2020221209112137.png)
  
字节序列对象 _PyBytesObject_ 中，确实藏着一个字符数组 _ob_sval_ 。注意到 _ob_sval_ 数组长度定义为 _1_ ，这是 _C_ 语言中定义 **变长数组** 的技巧。这个技巧在前面章节( _int 对象，永不溢出的整数_ )中介绍过，这里不再赘述。源码注释表明， _Python_ 为待存储的字节序列额外分配一个字节，用于在末尾处保存 `\0` ，以便兼容 _C_ 字符串。

此外，我们还留意到另一个字段 _ob_shash_ ，它用于保存字节序列的 **哈希值** 。 _Python_ 对象哈希值应用范围很广，比如 _dict_ 字典对象依赖对象哈希值进行存储。由于计算 _bytes_ 对象哈希值需要遍历其内部的字符数组，开销相对较大。因此， _Python_ 选择将哈希值保存起来，以空间换时间，避免重复计算。

最后，以几个典型例子结束 _bytes_ 对象结构介绍，以此加深理解：

![](../../youdaonote-images/Pasted%20image%2020221209112453.png)

由此可见，就算空 _bytes_ 对象( `b''` )也是要占用内存空间的，至少变长对象 **公共头部** 是少不了的。

```python
>>> sys.getsizeof(b'')
33
```

_bytes_ 对象占用的内存空间可分为以下个部分进行计算：

-   变长对象公共头部 _24_ 字节，_ob_refcnt_ 、 _ob_type_ 、 _ob_size_ 每个字段各占用 _8_ 字节；
-   哈希值 _ob_shash_ 占用 _8_ 字节；
-   字节序列本身，假设是 _n_ 字节；
-   额外 _1_ 字节用于存储末尾处的 `\0` ；

因此， _bytes_ 对象空间计算公式为 24+8+n+124+8+n+1，即 33+n33+n，其中 n 为字节序列长度。

## 对象行为

现在，我们开始考察 _bytes_ 对象的 **行为** 。由于对象的行为由对象的 **类型** 决定，因而我们需要到 _bytes_ 类型对象中寻找答案。在 _Objects/bytesobject.c_ 源码文件中，我们找到 _bytes_ **类型对象** 的定义：

```c
PyTypeObject PyBytes_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "bytes",
    PyBytesObject_SIZE,
    sizeof(char),
    // ...
    &bytes_as_number,                           /* tp_as_number */
    &bytes_as_sequence,                         /* tp_as_sequence */
    &bytes_as_mapping,                          /* tp_as_mapping */
    (hashfunc)bytes_hash,                       /* tp_hash */
    // ...
};
```

我们对类型对象的内部结构已经非常熟悉了， _tp_as_xxxx_ 系列结构体决定了对象支持的各种 **操作** 。举个例子， _bytes_as_number_ 结构体中保存着 **数值运算** 处理函数的指针。 _bytes_ 对象居然支持数据操作，没搞错吧？我们看到， _bytes_as_number_ 结构体中只定义了一个操作—— **模运算** ( _%_ )：

```c
static PyNumberMethods bytes_as_number = {
    0,              /*nb_add*/
    0,              /*nb_subtract*/
    0,              /*nb_multiply*/
    bytes_mod,      /*nb_remainder*/
}
```

```c
static PyObject *
bytes_mod(PyObject *self, PyObject *arg)
{
    if (!PyBytes_Check(self)) {
        Py_RETURN_NOTIMPLEMENTED;
    }
    return _PyBytes_FormatEx(PyBytes_AS_STRING(self), PyBytes_GET_SIZE(self),
                             arg, 0);
}
```

由此可见， _bytes_ 对象只是借用 _%_ 运算符实现字符串格式化，谈不上支持数值运算，虚惊一场：

```python
>>> b'msg: a=%d b=%d' % (1, 2)
b'msg: a=1 b=2'
```

## 序列型操作

众所周知， _bytes_ 是 **序列型对象** ，序列型操作才是研究重点。我们在 _bytes_as_sequence_ 结构体中找到相关定义：

```c
static PySequenceMethods bytes_as_sequence = {
    (lenfunc)bytes_length, /*sq_length*/
    (binaryfunc)bytes_concat, /*sq_concat*/
    (ssizeargfunc)bytes_repeat, /*sq_repeat*/
    (ssizeargfunc)bytes_item, /*sq_item*/
    0,                  /*sq_slice*/
    0,                  /*sq_ass_item*/
    0,                  /*sq_ass_slice*/
    (objobjproc)bytes_contains /*sq_contains*/
};
```

由此可见， _bytes_ 支持的 **序列型操作** 包括以下 _5_ 个：

-   _sq_length_ ，查询序列长度；
-   _sq_concat_ ，将两个序列合并为一个；
-   _sq_repeat_ ，将序列重复多次；
-   _sq_item_ ，取出给定下标序列元素；
-   _sq_contains_，包含关系判断；

### 长度

最简单的序列型操作是 **长度查询** ，直接返回 _ob_size_ 字段即可：

```c
static Py_ssize_t
bytes_length(PyBytesObject *a)
{
    return Py_SIZE(a);
}
```

### 合并

```python
>>> b'abc' + b'cba'
b'abccba'
```

合并操作将两个 _bytes_ 对象拼接成一个，由 _bytes_concat_ 函数处理：

```c
static PyObject *
bytes_concat(PyObject *a, PyObject *b)
{
    Py_buffer va, vb;
    PyObject *result = NULL;

    va.len = -1;
    vb.len = -1;
    if (PyObject_GetBuffer(a, &va, PyBUF_SIMPLE) != 0 ||
        PyObject_GetBuffer(b, &vb, PyBUF_SIMPLE) != 0) {
        PyErr_Format(PyExc_TypeError, "can't concat %.100s to %.100s",
                     Py_TYPE(b)->tp_name, Py_TYPE(a)->tp_name);
        goto done;
    }

    /* Optimize end cases */
    if (va.len == 0 && PyBytes_CheckExact(b)) {
        result = b;
        Py_INCREF(result);
        goto done;
    }
    if (vb.len == 0 && PyBytes_CheckExact(a)) {
        result = a;
        Py_INCREF(result);
        goto done;
    }

    if (va.len > PY_SSIZE_T_MAX - vb.len) {
        PyErr_NoMemory();
        goto done;
    }

    result = PyBytes_FromStringAndSize(NULL, va.len + vb.len);
    if (result != NULL) {
        memcpy(PyBytes_AS_STRING(result), va.buf, va.len);
        memcpy(PyBytes_AS_STRING(result) + va.len, vb.buf, vb.len);
    }

  done:
    if (va.len != -1)
        PyBuffer_Release(&va);
    if (vb.len != -1)
        PyBuffer_Release(&vb);
    return result;
}
```

1.  第 _4-5_ 行，定义局部变量 _va_ 、 _vb_ 用于维护缓冲区， _result_ 用于保存合并结果；
2.  第 _7-14_ 行，从待合并对象中获取字节序列所在缓冲区；
3.  第 _17-21_ 行，如果第一个对象长度为 _0_ ，第二个对象就是结果；
4.  第 _22-26_ 行，反之第二个对象长度为 _0_ ，第一个对象就是结果；
5.  第 _28-31_ 行，长度超过限制则报错，其实判断条件这样写更直观：_va.len + vb.len > PY_SSIZE_T_MAX_ ；
6.  第 _33_ 行，新建 _bytes_ 对象用于保存合并结果，长度为待合并对象长度之和；
7.  第 _34-37_ 行，将字节序列从待合并对象拷贝到结果对象；
8.  第 _39-44_ 行，返回结果。

_Py_buffer_ 提供了一套操作对象缓冲区的统一接口，屏蔽不同类型对象的内部差异：

![](../../youdaonote-images/Pasted%20image%2020221209114141.png)

_bytes_concat_ 函数逻辑很直白，将两个 _bytes_ 对象的缓冲区拷贝到一起形成新 _bytes_ 对象。 _sq_repeat_ 等其他处理函数也不复杂，因篇幅关系不再单独讲解了。鼓励读者们自行深入源码，弄清他们的来龙去脉，必有收获。

### 数据拷贝的陷阱

考察以下表达式——合并 _3_ 个 _bytes_ 对象：

```python
>>> result = a + b + c
```

这个语句执行时，分成两步进行合并：先将 _a_ 和 _b_ 合并，得到临时结果 _t_ ，再将 _t_ 和 _c_ 合并得到最终结果 _result_ ：

```c
>>> t = a + b
>>> result = t + c
```

_a_ 和 _b_ 的数据需要被拷贝两遍！

![](../../youdaonote-images/Pasted%20image%2020221209114733.png)

而且，待合并的 _bytes_ 对象越多，数据拷贝越严重。考察这两个典型表达式以及相关对象拷贝次数：

![](../../youdaonote-images/Pasted%20image%2020221209114803.png)

由此可见，合并 n 个 _bytes_ 对象，头两个对象需要拷贝 n-1 次，只有最后一个对象不需要重复拷贝。平均下来，每个对象大约要拷贝 n/2n/2 次！知道这个陷阱之后，你还敢写这样的代码吗？

```python
>>> result = b''
>>> for s in segments:
...     result += s
```

好在 _bytes_ 对象提供了一个内建方法 _join_ ，可高效合并多个 _bytes_ 对象：

```python
>>> result = b''.join(segments)
```

_join_ 方法对数据拷贝进行了优化：先遍历待合并对象，计算总长度；然后根据总长度创建目标对象；最后再遍历待合并对象，逐一拷贝数据。这样一来，每个对象均只需拷贝一次，解决了重复拷贝的陷阱。

![](../../youdaonote-images/Pasted%20image%2020221209122647.png)

_join_ 内建方法同样在 _Objects/bytesobject.c_ 文件中实现，_bytes_join_ 是也，这里不再展开介绍了。

## 字符缓冲池

为了优化单字节 _bytes_ 对象(也可称为 **字符对象** )的创建效率， _Python_ 内部维护了一个 **字符缓冲池** ：

```c
static PyBytesObject *characters[UCHAR_MAX + 1];
```

_Python_ 内部创建单字节 _bytes_ 对象时，先检查目标对象是否已在缓冲池中。_PyBytes_FromStringAndSize_ 函数是负责创建 _bytes_ 对象的通用接口，同样位于 _Objects/bytesobject.c_ 中：

```c
PyObject *
PyBytes_FromStringAndSize(const char *str, Py_ssize_t size)
{
    PyBytesObject *op;
    if (size < 0) {
        PyErr_SetString(PyExc_SystemError,
            "Negative size passed to PyBytes_FromStringAndSize");
        return NULL;
    }
    if (size == 1 && str != NULL &&
        (op = characters[*str & UCHAR_MAX]) != NULL)
    {
#ifdef COUNT_ALLOCS
        one_strings++;
#endif
        Py_INCREF(op);
        return (PyObject *)op;
    }

    op = (PyBytesObject *)_PyBytes_FromSize(size, 0);
    if (op == NULL)
        return NULL;
    if (str == NULL)
        return (PyObject *) op;

    memcpy(op->ob_sval, str, size);
    /* share short strings */
    if (size == 1) {
        characters[*str & UCHAR_MAX] = op;
        Py_INCREF(op);
    }
    return (PyObject *) op;
}
```

其中，涉及字符缓冲区维护的关键步骤是：

1.  第 _10-18_ 行，如果目标对象为单字节对象且已在字符缓冲池中，直接返回已缓存对象；
2.  第 _20-26_ 行，创建新 _bytes_ 对象并拷贝字节序列；
3.  第 _28-31_ 行，如果创建的对象为单字节对象，将其放入字符缓冲池；

由此可见，当 _Python_ 程序开始运行时，字符缓冲池是空的。随着单字节 _bytes_ 对象的创建，缓冲池中的对象慢慢多了起来。当缓冲池已缓存 `b'1'` 、`b'2'` 、`b'3'` 、`b'a'` 、`b'b'` 、`b'c'` 这几个字符时，内部结构如下：