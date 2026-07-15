# Unicode是什么

计算机存储的基本单位是 **八位字节** ，由 _8_ 个比特位组成，简称 **字节** 。由于英文只由 _26_ 个字母加若干符号组成，因此英文字符可以直接用 **字节** 来保存。其他诸如中日韩等语言，由于字符众多，则不得不用多个字节来编码。

随着计算机技术的传播，非拉丁文字符编码技术蓬勃发展，但存在两个比较大的局限性：

-   **不支持多语言** ，例如中文的编码方案不能表示日文；
-   **没有统一标准** ，例如中文有 _GB2312_ ，_GBK_ 、 _GB18030_ 等多种编码标准；

由于编码方式不统一，开发人员经常需要在不同编码间来回转化，错误频出。为了彻底解决这些问题， _统一码联盟_ 提出了 _Unicode_ 标准。_Unicode_ 对世界上大部分文字系统进行整理、编码，让计算机可以用统一的方式处理文本。_Unicode_ 目前已经收录了超过 _13_ 万个字符，天然地支持多语言。使用 _Unicode_ ，即可彻底跟编码问题说拜拜！

# Python中的Unicode

_Python_ 在 _3_ 之后，_str_ 对象内部改用 _Unicode_ 表示，因而被源码称为 _Unicode_ 对象。这么做好处是显然易见的，程序核心逻辑统一用 _Unicode_ ，只需在输入、输入层进行编码、解码，可最大程度避免各种编码问题：

![](../../youdaonote-images/Pasted%20image%2020221209163030.png)

由于 _Unicode_ 收录字符已经超过 _13_ 万个，每个字符至少需要 _4_ 个字节来保存。这意味着巨大的内存开销，显然是不可接受的。英文字符用 _ASCII_ 表示仅需 _1_ 个字节，而用 _Unicode_ 表示内存开销却增加 _4_ 倍！

_Python_ 作者们肯定不允许这样的事情发生，不信我们先来观察下( _getsizeof_ 获取对象内存大小)：

```python
>>> import sys
# 英文字符还是1字节
>>> sys.getsizeof('ab') - sys.getsizeof('a')
1
# 中文字符需要2字节
>>> sys.getsizeof('中国') - sys.getsizeof('中')
2
# Emoji表情需要4字节
>>> sys.getsizeof('??') - sys.getsizeof('?')
4
```

-   每个 _ASCII_ 英文字符，占用 _1_ 字节；
-   每个中文字符，占用 _2_ 字节；
-   _Emoji_ 表情，占用 _4_ 字节；

由此可见，_Python_ 内部对 _Unicode_ 进行优化：根据文本内容，选择底层存储单元。至于这种黑科技是怎么实现的，我们只能到源码中寻找答案了。与 _str_ 对象实现相关源码如下：

-   _Include/unicodeobject.h_
-   _Objects/unicodectype.c_

在 _Include/unicodeobject.h_ 头文件中，我们发现 _str_ 对象底层存储根据文本字符 _Unicode_ 码位范围分成几类：

-   _PyUnicode_1BYTE_KIND_ ，所有字符码位均在 _U+0000_ 到 _U+00FF_ 之间；
-   _PyUnicode_2BYTE_KIND_ ，所有字符码位均在 _U+0000_ 到 _U+FFFF_ 之间，且至少一个大于 U+00FF；
-   PyUnicode_4BYTE_KIND ，所有字符码位均在 _U+0000_ 到 _U+10FFFF_ 之间，且至少一个大于 U+FFFF；

```c
enum PyUnicode_Kind {
/* String contains only wstr byte characters.  This is only possible
   when the string was created with a legacy API and _PyUnicode_Ready()
   has not been called yet.  */
    PyUnicode_WCHAR_KIND = 0,
/* Return values of the PyUnicode_KIND() macro: */
    PyUnicode_1BYTE_KIND = 1,
    PyUnicode_2BYTE_KIND = 2,
    PyUnicode_4BYTE_KIND = 4
};
```

如果文本字符码位均在 _U+0000_ 到 _U+00FF_ 之间，单个字符只需 _1_ 字节来表示；而码位在 _U+0000_ 到 _U+FFFF_ 之间的文本，单个字符则需要 2 字节才能表示；以此类推。这样一来，根据文本码位范围，便可为字符选用尽量小的存储单元，以最大限度节约内存。

```c
typedef uint32_t Py_UCS4;
typedef uint16_t Py_UCS2;
typedef uint8_t Py_UCS1;
```

**文本类型**

**字符存储单元**

**字符存储单元大小（字节）**

![](../../youdaonote-images/Pasted%20image%2020221209163429.png)

_Unicode_ 内部存储结构因文本类型而异，因此类型 _kind_ 必须作为 _Unicode_ 对象公共字段保存。_Python_ 内部定义了若干个 **标志位** ，作为 _Unicode_ 公共字段，_kind_ 便是其中之一：

-   _interned_ ，是否为 _interned_ 机制维护， _internel_ 机制在本节后半部分介绍；
-   _kind_ ，类型，用于区分字符底层存储单元大小；
-   _compact_ ，内存分配方式，对象与文本缓冲区是否分离，本文不涉及分离模式；
-   _ascii_ ，文本是否均为纯 _ASCII_ ；

_Objects/unicodectype.c_ 源文件中的 _PyUnicode_New_ 函数，根据文本字符数 _size_ 以及最大字符 _maxchar_ 初始化 _Unicode_ 对象。该函数根据 _maxchar_ 为 _Unicode_ 对象选择最紧凑的字符存储单元以及底层结构体：

![](../../youdaonote-images/Pasted%20image%2020221209163829.png)

# PyASCIIObject

如果 _str_ 对象保存的文本均为 _ASCII_ ，即 maxchar<128maxchar<128，则底层由 _PyASCIIObject_ 结构存储：

```c
/* ASCII-only strings created through PyUnicode_New use the PyASCIIObject
   structure. state.ascii and state.compact are set, and the data
   immediately follow the structure. utf8_length and wstr_length can be found
   in the length field; the utf8 pointer is equal to the data pointer. */
typedef struct {
    PyObject_HEAD
    Py_ssize_t length;          /* Number of code points in the string */
    Py_hash_t hash;             /* Hash value; -1 if not set */
    struct {
        unsigned int interned:2;
        unsigned int kind:3;
        unsigned int compact:1;
        unsigned int ascii:1;
        unsigned int ready:1;
        unsigned int :24;
    } state;
    wchar_t *wstr;              /* wchar_t representation (null-terminated) */
} PyASCIIObject;
```

_PyASCIIObject_ 结构体也是其他 _Unicode_ 底层存储结构体的基础，所有字段均为 _Unicode_ 公共字段：

-   _ob_refcnt_ ，引用计数；
-   _ob_type_ ，对象类型；
-   _length_ ，文本长度；
-   _hash_ ，文本哈希值；
-   _state_ ，_Unicode_ 对象标志位，包括 _internel_ 、 _kind_ 、 _ascii_ 、 _compact_ 等；
-   _wstr_ ，略；

![](../../youdaonote-images/Pasted%20image%2020221209164004.png)

注意到，_state_ 字段后有一个 _4_ 字节的空洞，这是结构体字段 **内存对齐** 造成的现象。在 _64_ 位机器下，指针大小为 _8_ 字节，为优化内存访问效率，_wstr_ 必须以 _8_ 字节对齐；而 _state_ 字段大小只是 _4_ 字节，便留下 _4_ 字节的空洞。_PyASCIIObject_ 结构体大小在 _64_ 位机器下为 _48_ 字节，在 32 位机器下为 _24_ 字节。

_ASCII_ 文本则紧接着位于 _PyASCIIObject_ 结构体后面，以字符串对象 _‘abc’_ 以及空字符串对象 _‘’_ 为例：

![](../../youdaonote-images/Pasted%20image%2020221209164251.png)

注意到，与 _bytes_ 对象一样，_Python_ 也在 _ASCII_ 文本末尾，额外添加一个 _\0_ 字符，以兼容 _C_ 字符串。

如此一来，以 _Unicode_ 表示的 _ASCII_ 文本，额外内存开销仅为 _PyASCIIObject_ 结构体加上末尾的 _\0_ 字节而已。_PyASCIIObject_ 结构体在 64 位机器下，大小为 _48_ 字节。因此，长度为 n 的纯 _ASCII_ 字符串对象，需要消耗 n+48+1，即 n+49 字节的内存空间。

```python
>>> sys.getsizeof('')
49
>>> sys.getsizeof('abc')
52
>>> sys.getsizeof('a' * 10000)
10049
```

# PyCompactUnicodeObject

如果文本不全是 _ASCII_ ，Unicode 对象底层便由 _PyCompactUnicodeObject_ 结构体保存：

```c
/* Non-ASCII strings allocated through PyUnicode_New use the
   PyCompactUnicodeObject structure. state.compact is set, and the data
   immediately follow the structure. */
typedef struct {
    PyASCIIObject _base;
    Py_ssize_t utf8_length;     /* Number of bytes in utf8, excluding the
                                 * terminating \0. */
    char *utf8;                 /* UTF-8 representation (null-terminated) */
    Py_ssize_t wstr_length;     /* Number of code points in wstr, possible
                                 * surrogates count as two code points. */
} PyCompactUnicodeObject;
```

_PyCompactUnicodeObject_ 在 _PyASCIIObject_ 基础上，增加 _3_ 个字段：

-   _utf8_length_ ，文本 _UTF8_ 编码长度；
-   _utf8_ ，文本 _UTF8_ 编码形式，缓存以避免重复编码运算；
-   wstr_length ，略；

![](../../youdaonote-images/Pasted%20image%2020221209165041.png)

由于 ASCII 本身是合法的 UTF8 ，无须保存 UTF8 编码形式，这也是 ASCII 文本底层由 PyASCIIObject 保存的原因。在 _64_ 位机器，_PyCompactUnicodeObject_ 结构体大小为 _72_ 字节；在 _32_ 位机器则是 _36_ 字节。

## PyUnicode_1BYTE_KIND

如果 128<=maxchar<256128<=maxchar<256，_Unicode_ 对象底层便由 _PyCompactUnicodeObject_ 结构体保存，字符存储单元为 _Py_UCS1_ ，大小为 _1_ 字节。以 _Python![®](http://www.imooc.com/static/moco/v1.0/images/face/36x36/ae.png)_ 为例，字符 _![®](http://www.imooc.com/static/moco/v1.0/images/face/36x36/ae.png)_ 码位为 U+00AE ，满足该条件，内部结构如下：

![](../../youdaonote-images/Pasted%20image%2020221209165520.png)

字符存储单元还是 _1_ 字节，跟 _ASCII_ 文本一样。 因此，_Python![®](http://www.imooc.com/static/moco/v1.0/images/face/36x36/ae.png)_ 对象需要占用 _80_ 字节的内存空间72+1*7+1=72+8=8072+1∗7+1=72+8=80：

```python
>>> sys.getsizeof('Python')
80
```

## PyUnicode_2BYTE_KIND

如果 256<=maxchar<65536256<=maxchar<65536，_Unicode_ 对象底层同样由 _PyCompactUnicodeObject_ 结构体保存，但字符存储单元为 _Py_UCS2_ ，大小为 _2_ 字节。以 _AC米兰_ 为例，常用汉字码位在 _U+0100_ 到 _U+FFFF_ 之间，满足该条件，内部结构如下：

![](../../youdaonote-images/Pasted%20image%2020221209165608.png)

由于现在字符存储单元为 2 字节，故而 _str_ 对象 _AC米兰_ 需要占用 82 字节的内存空间：72+2*4+2=72+10=8272+2∗4+2=72+10=82

```python
>>> sys.getsizeof('AC米兰')
82
```

我们看到，当文本包含中文后，英文字母也只能用 _2_ 字节的存储单元来保存了。

你可能会提出疑问，为什么不采用变长存储单元呢？例如，字母 _1_ 字节，汉字 _2_ 字节？这是因为采用变长存储单元后，就无法在 _O(1)_ 时间内取出文本第 n 个字符了——你只能从头遍历直到遇到第 n 个字符。

## PyUnicode_4BYTE_KIND

如果 65536<=maxchar<42949629665536<=maxchar<429496296，便只能用 _4_ 字节存储单元 _Py_UCS4_ 了。以 _AC米兰?_ 为例：

![](../../youdaonote-images/Pasted%20image%2020221209170121.png)


```python
>>> sys.getsizeof('AC米兰')
96
```

这样一来，给一段英文文本加上表情，内存暴增 4 倍，也就不奇怪了：

```python
>>> text = 'a' * 1000
>>> sys.getsizeof(text)
1049
>>> text += '?'
>>> sys.getsizeof(text)
4080
```

# interned机制

如果 _str_ 对象 _interned_ 标识位为 _1_ ，_Python_ 虚拟机将为其开启 _interned_ 机制。那么，什么是 _interned_ 机制？

先考虑以下场景，如果程序中有大量 _User_ 对象，有什么可优化的地方？

```python
>>> class User:
...
...     def __init__(self, name, age):
...         self.name = name
...         self.age = age
...
>>>
>>> user = User(name='tom', age=20)
>>> user.__dict__
{'name': 'tom', 'age': 20}
```

由于对象的属性由 _dict_ 保存，这意味着每个 _User_ 对象都需要保存 _str_ 对象 _name_ 。换句话讲，_1_ 亿个 _User_ 对象需要重复保存 _1_ 亿个同样的 _str_ 对象，这将浪费多少内存！

由于 _str_ 是不可变对象，因此 _Python_ 内部将有潜在重复可能的字符串都做成 **单例模式** ，这就是 _interned_ 机制。_Python_ 具体做法是在内部维护一个全局 _dict_ 对象，所有开启 _interned_ 机制 _str_ 对象均保存在这里；后续需要用到相关对象的地方，则优先到全局 _dict_ 中取，避免重复创建。

举个例子，虽然 _str_ 对象 _‘abc’_ 由不同的运算产生，但背后却是同一个对象：

```python
>>> a = 'abc'
>>> b = 'ab' + 'c'
>>> id(a), id(b), a is b
(4424345224, 4424345224, True)
```

> 什么时候会启动 interned 机制？
> 有几种情况：①代码中的常量；②单个ASCII(0-127)或拉丁字母(128-256)；③空字符串对象。②和③很好理解，这部分对象使用频率很高，但数量有限，特别适合启用interned。①代码中的常量，数量是有限的，由程序代码在编译时就确定了，启用internel引入内存的开销是可控的。对于从文件或者网络读入的字符串，就不能启用interned了，因为数量是不可控的。程序可能会读入大量的字符串，如果全部都用interned缓存起来，内存迟早被打爆。