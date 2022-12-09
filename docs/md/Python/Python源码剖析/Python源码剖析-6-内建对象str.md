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