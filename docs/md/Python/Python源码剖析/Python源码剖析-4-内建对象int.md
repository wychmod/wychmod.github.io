# Int 整数对象
## 整数溢出

下面这个 _C_ 程序 ( _test.c_ ) 运行后输出什么？是 _1000000000000_ (一万亿) 吗？

```c
#include <stdio.h>

int main(int argc, char *argv[])
{
    int value = 1000000;
    printf("%d\n", value * value);

    return 0;
}
```

可能有不少人觉得这没啥好问的，一百万乘以一百万不就是一万亿吗？但现实却不是如此。

在计算机中，由于变量类型存储空间固定，它能表示的数值范围也是有限的。以 _int_ 为例，该类型长度为 _32_ 位，能表示的整数范围为 _-2147483648_ 至 _2147483647_ 。一万亿显然超出该范围，换句话讲程序发生了 **整数溢出** 。因此，运行 _test.c_ ，程序这样输出也就不奇怪了：

```c
$ gcc -o test test.c
$ ./test
-727379968
```

不仅是 _C_ 语言，很多编程语言都存在整数溢出的问题，数据库中的整数类型也是。由于整数溢出现象的存在，程序员需要结合业务场景，谨慎选择数据类型。一旦选择不慎或者代码考虑不周，便会导致严重 _BUG_ 。

## int 对象的行为

与其他语言相比， _Python_ 中的整数永远不会有溢出的现象。一百万乘以一百万， _Python_ 可以轻易算出来：

```c
>>> 1000000 * 1000000
1000000000000
```

_Python_ 甚至可以计算十的一百次方，这在其他语言是不可想象的。

计算结果如此庞大，就算用 _64_ 位整数，也难以表示。但 _Python_ 中的整数对象却可以轻松应付，完全不需要任何特殊处理。

在源码中，我们将领略到 _C_ 语言 **实现大整数的艺术** 。

## int 对象的设计

_int_ 对象在 _Include/longobject.h_ 头文件中定义：

```c
typedef struct _longobject PyLongObject; /* Revealed in longintrepr.h */
```

我们顺着注释找到了 _Include/longintrepr.h_ ，实现 _int_ 对象的结构体真正藏身之处：

```c
struct _longobject {
    PyObject_VAR_HEAD
    digit ob_digit[1];
};
```

这个结构我们并不陌生，说明 _int_ 对象是一个变长对象。除了变长对象都具有的公共头部，还有一个 _digit_ 数组，整数值应该就存储在这个数组里面。 _digit_ 又是什么呢？同样在 _Include/longintrepr.h_ 头文件，我们找到它的定义：

```c
#if PYLONG_BITS_IN_DIGIT == 30
typedef uint32_t digit;
// ...
#elif PYLONG_BITS_IN_DIGIT == 15
typedef unsigned short digit;
// ...
#endif
```

看上去 _digit_ 就是一个 _C_ 语言整数，至此我们知晓 _int_ 对象是通过整数数组来实现大整数的。一个 _C_ 整数类型不够就两个嘛，两个不够那就 _n_ 个！至于整数数组用什么整数类型来实现， _Python_ 提供了两个版本，一个是 _32_ 位的 _uint32_t_ ，一个是 _16_ 位的 _unsigned short_ ，编译 _Python_ 解析器时可以通过宏定义指定选用的版本。

_Python_ 作者为什么要这样设计呢？这主要是出于内存方面的考量：对于范围不大的整数，用 _16_ 位整数表示即可，用 _32_ 位就有点浪费。本人却觉得由于整数对象公共头部已经占了 _24_ 字节，省这 _2_ 个字节其实意义不大。

![](../../youdaonote-images/Pasted%20image%2020221206225407.png)

由此可见，选用 _16_ 位整数数组时， _int_ 对象内存增长的粒度更小，有些情况下可以节省 _2_ 个字节。但是这 _2_ 字节相比 _24_ 字节的变长对象公共头部显得微不足道，因此 _Python_ 默认选用 _32_ 位整数数组也就不奇怪了。

![](../../youdaonote-images/Pasted%20image%2020221206225459.png)

如上图，对于比较大的整数， _Python_ 将其拆成若干部分，保存在 _ob_digit_ 数组中。然而我们注意到在结构体定义中， _ob_digit_ 数组长度却固定为 _1_ ，这是为什么呢？由于 _C_ 语言中数组长度不是类型信息，我们可以根据实际需要为 _ob_digit_ 数组分配足够的内存，并将其当成长度为 _n_ 的数组操作。这也是 _C_ 语言中一个常用的编程技巧。

## 大整数布局

整数分为 **正数** 、 **负数** 和 **零** ， _Python_ 规定不同整数在 _int_ 对象中的存储方式，要点可以总结为 _3_ 条：

-   整数 **绝对值** 根据实际情况分为若干部分，保存于 _ob_digit_ 数组中；
-   _ob_digit_ **数组长度** 保存于 _ob_size_ 字段，对于 **负整数** 的情况，_ob_size_ 为负；
-   整数 **零** 以 _ob_size_ 等于 _0_ 来表示，_ob_digit_ 数组为空；

接下来，我们以 _5_ 个典型的例子详细介绍这几条规则：

![](../../youdaonote-images/Pasted%20image%2020221206230210.png)

1.  对于整数 _0_ ， _ob_size_ 字段等于 _0_ ， _ob_digit_ 数组为空，无需分配。
2.  对于整数 _10_ ，其绝对值保存于 _ob_digit_ 数组中，数组长度为 _1_ ， _ob_size_ 字段等于 _1_ 。
3.  对于整数 _-10_ ，其绝对值同样保存于 _ob_digit_ 数组中，但由于 _-10_ 为负数， _ob_size_ 字段等于 _-1_ 。
4.  对于整数 _1073741824_ ( _2_ 的 _30_ 次方)，由于 _Python_ 只使用 _32_ 整数的后 _30_ 位，需要另一个整数才能存储，整数数组长度为 _2_ 。绝对值这样计算：2^{30}*1+2^0*0=1073741824230∗1+20∗0=1073741824。
5.  对于整数 _-4294967297_ (负的 _2_ 的 _32_ 次方加 _1_ )，同样要长度为 _2_ 的 _ob_digit_ 数组，但 _ob_size_ 字段为负。绝对值这样计算：2^{30}*4+2^0*1=4294967297230∗4+20∗1=4294967297。

至于为什么 _Python_ 只用 _ob_digit_ 数组整数的后 _30_ 位，其实跟加法进位有关。如果全部 _32_ 位都用来保存绝对值，那么为了保证加法不溢出 (产生进位)，需要先强制转换成 _64_ 位类型后在进行计算。但牺牲最高 _1_ 位后，加法运算便不用担心进位溢出了。那么，为什么 _Python_ 牺牲最高 _2_ 位呢？我猜这是为了和 _16_ 位整数方案统一起来：如果选用 _16_ 位整数作为数组， _Python_ 则只使用其中 _15_ 位。

## 小整数静态对象池

通过前面章节的学习，我们知道整数对象是 **不可变对象** ，整数运算结果是以 **新对象** 返回的：

```python
>>> a = 1
>>> id(a)
4408209536
>>> a += 1
>>> id(a)
4408209568
```

_Python_ 这样的设计带来一个性能缺陷，程序运行时势必有大量对象创建销毁。创建对象需要分配内存，对象销毁需要将内存回收，严重影响性能。编写一个循环 _100_ 次的循环，便需要创建 _100_ 个 _int_ 对象：

```python
for i in range(100):
    pass
```

这显然是难以接受的。 _Python_ 的解决方案是：预先将常用的整数对象创建好，以备后用，这就是 **小整数对象池** 。小整数对象池在 _Objects/longobject.c_ 中实现，关键代码如下：

```c
#ifndef NSMALLPOSINTS
#define NSMALLPOSINTS           257
#endif
#ifndef NSMALLNEGINTS
#define NSMALLNEGINTS           5
#endif

static PyLongObject small_ints[NSMALLNEGINTS + NSMALLPOSINTS];
```

-   _NSMALLPOSINTS_ 宏规定了对象池 **正数个数** (从 _0_ 开始，包括 _0_ )，默认 _257_ 个；
-   _NSMALLNEGINTS_ 宏规定了对象池 **负数个数** ，默认 _5_ 个；
-   _small_ints_ 是一个整数对象数组，保存预先创建好的小整数对象；

以默认配置为例， _Python_ 启动后静态创建一个包含 _262_ 个元素的整数数组并依次初始化为 _-5_ 到 _-1_ 这 _5_ 个负数、零以及 _1_ 到 _256_ 这 _256_ 个正数。 **小整数对象池** 结构如下：

![](../../youdaonote-images/Pasted%20image%2020221206232303.png)

至于为什么选择静态缓存从 _-5_ 到 _256_ 之间的小整数，主要是出于某种 **权衡** ：这个范围内的整数使用 **频率很高** ，而缓存这些小整数的 **内存开销相对可控** 。很多程序开发场景都没有固定的正确答案，需要根据实际情况平衡利弊。

学习小整数对象池后，如果面试中再被问到 _Python_ 整数的这个行为，你也就不会一脸懵逼了：

```python
>>> a = 1 + 0
>>> b = 1 * 1
>>> id(a), id(b)
(4408209536, 4408209536)

>>> c = 1000 + 0
>>> d = 1000 * 1
>>> id(c), id(d)
(4410298224, 4410298160)
```

-   **场景一** 由于 _1 + 0_ 计算结果为 _1_ ，在小整数范围内， _Python_ 直接从静态对象池中取出整数 _1_ ； _1 * 1_ 也是同理。名字 _a_ 和 _b_ 其实都跟同一个对象绑定，即小整数对象池中的整数 _1_ ，因而 _id_ 相同。
-   **场景二** _1000 + 0_ 和 _1000 * 1_ 计算结果都是 _1000_ ，但由于 _1000_ 不在小整数范围内， _Python_ 分别创建对象并范围，因此 _c_ 和 _d_ 对象 _id_ 不同也就不奇怪了。

## 总结

与主流编程语言相比， _Python_ 中的整数 **永远不会溢出** ，应用起来非常省心。 _Python_ 的整数对象是 **变长对象** ，能够按需串联多个 _C_ 整数类型，实现大整数表示。整数对象关键字段包括 **底层整数数组** _ob_digit_ 以及 **数组长度** _ob_size_ 。整数数值按照以下规则保存：

-   整数 **绝对值** 拆分成多个部分，存放于 **底层整数数组** _ob_digit_ ；
-   底层数组长度保存在 _ob_size_ 字段，如果整数为负， _ob_size_ 也为负；
-   对于整数 _0_ ，底层数组为空， _ob_size_ 字段为 _0_ ；

由于整数对象是 **不可变对象** ，任何整数运算结果都以新对象返回，而对象创建销毁开销却不小。为了优化整数对象的性能， _Python_ 在启动时将使用 **频率较高** 的小整数预先创建好，这就是 **小整数缓存池** 。默认情况下，小整数缓存池缓存从 _-5_ 到 _256_ 之间的整数。

# int 源码解析

_Python_ 整数对象通过串联多个 _C_ 整数类型，实现大整数的表示。整数对象内部包含一个 _C_ 整数数组，数组长度与对象表示的数值大小相关，因此整数对象也是 **变长对象** 。

![](../../youdaonote-images/Pasted%20image%2020221208114552.png)

-   _ob_digit_ 为 _C_ 整数数组，用于存储被保存整数的 **绝对值** ；
-   _ob_size_ 为 **变长对象** 关键字段，维护数组长度以及被保存整数的 **符号** ；

![](../../youdaonote-images/Pasted%20image%2020221208114713.png)

用整数数组实现大整数的思路其实平白无奇，难点在于大整数 **数学运算** 的实现，这是也比较考验编程功底的地方。

## 数学运算概述

根据我们在 **对象模型** 中学到的知识，对象的行为由对象的 **类型** 决定。因此，整数对象数学运算的秘密藏在整数类型对象中。我们在 _Objects/longobject.c_ 中找到整数类型对象( _PyLong_Type_ )，其定义如下所示：

```c
PyTypeObject PyLong_Type = {
    PyVarObject_HEAD_INIT(&PyType_Type, 0)
    "int",                                      /* tp_name */
    offsetof(PyLongObject, ob_digit),           /* tp_basicsize */
    sizeof(digit),                              /* tp_itemsize */
    long_dealloc,                               /* tp_dealloc */

    //...

    &long_as_number,                            /* tp_as_number */

    //...

    long_new,                                   /* tp_new */
    PyObject_Del,                               /* tp_free */
};
```

类型对象中， _tp_as_number_ 是一个关键字段。该字段指向一个 _PyNumberMethods_ 结构体，结构体保存了各种数学运算的 **函数指针** 。我们顺藤摸瓜，很快便找到整数对象所有数学运算的处理函数：

```c
static PyNumberMethods long_as_number = {
    (binaryfunc)long_add,       /*nb_add*/
    (binaryfunc)long_sub,       /*nb_subtract*/
    (binaryfunc)long_mul,       /*nb_multiply*/
    long_mod,                   /*nb_remainder*/
    long_divmod,                /*nb_divmod*/
    long_pow,                   /*nb_power*/
    (unaryfunc)long_neg,        /*nb_negative*/
    (unaryfunc)long_long,       /*tp_positive*/
    (unaryfunc)long_abs,        /*tp_absolute*/
    (inquiry)long_bool,         /*tp_bool*/
    (unaryfunc)long_invert,     /*nb_invert*/
    long_lshift,                /*nb_lshift*/
    (binaryfunc)long_rshift,    /*nb_rshift*/
    long_and,                   /*nb_and*/
    long_xor,                   /*nb_xor*/
    long_or,                    /*nb_or*/
    long_long,                  /*nb_int*/
    // ...
};
```

至此，我们明确了整数对象支持的全部 **数学运算** ，以及对应的 **处理函数** (下表仅列举常用部分)：

![](../../youdaonote-images/Pasted%20image%2020221208114830.png)

**整数对象** 、 **整数类型对象** 以及 **整数数学运算处理函数** 之间的关系：

![](../../youdaonote-images/Pasted%20image%2020221208115932.png)

## 加法

如何为一个由数组表示的大整数实现加法？问题答案得在 _long_add_ 函数中找，该函数是整数对象 **加法处理函数** 。我们再接再厉，扒开 _long_add_ 函数看个究竟(同样位于 _Objects/longobject.c_ )：

```c
static PyObject *
long_add(PyLongObject *a, PyLongObject *b)
{
    PyLongObject *z;

    CHECK_BINOP(a, b);

    if (Py_ABS(Py_SIZE(a)) <= 1 && Py_ABS(Py_SIZE(b)) <= 1) {
        return PyLong_FromLong(MEDIUM_VALUE(a) + MEDIUM_VALUE(b));
    }
    if (Py_SIZE(a) < 0) {
        if (Py_SIZE(b) < 0) {
            z = x_add(a, b);
            if (z != NULL) {
                assert(Py_REFCNT(z) == 1);
                Py_SIZE(z) = -(Py_SIZE(z));
            }
        }
        else
            z = x_sub(b, a);
    }
    else {
        if (Py_SIZE(b) < 0)
            z = x_sub(a, b);
        else
            z = x_add(a, b);
    }
    return (PyObject *)z;
}
```

_long_add_ 函数并不长，调用其他辅助函数完成加法运算，主体逻辑如下：

-   第 _4_ 行，定义变量 _z_ 用于临时保存计算结果；
-   第 _8-10_ 行，如果两个对象数组长度均不超过 _1_ ， 用 _MEDIUM_VALUE_ 宏将其转化成 _C_ 整数进行运算即可；
-   第 13-17 行，如果两个整数均为 **负数** ，调用 _x_add_ 计算两者绝对值之和，再将结果符号设置为负( _16_ 行处)；
-   第 _20_ 行，如果 _a_ 为负数， _b_ 为正数，调用 _x_sub_ 计算 _b_ 和 _a_ 的绝对值之差即为最终结果；
-   第 _24_ 行，如果 _a_ 为正数， _b_ 为负数，调用 _x_sub_ 计算 _a_ 和 _b_ 的绝对值之差即为最终结果；
-   第 26 行，如果两个整数均为正数，调用 _x_add_ 计算两个绝对值之和即为最终结果；

最后 _4_ 个步骤看起来很复杂，也有点令人费解。别担心，这只是初中数学的基本知识：

![](../../youdaonote-images/Pasted%20image%2020221208120446.png)

因此， _long_add_ 函数将整数加法转换成 **绝对值加法** ( _x_add_ )以及 **绝对值** 减法( _x_sub_ )：

-   _x_add(a, b)_ ，计算两者绝对值之和，即 _|a|+|b|_ ；
-   _x_sub(a, b)_ ，计算两者绝对值之差，即 _|a|-|b|_ ；

![](../../youdaonote-images/Pasted%20image%2020221208120504.png)

由于绝对值加、减法不用考虑符号对计算结果的影响，实现更为简单，这是 _Python_ 将整数运算转化成绝对值运算的缘由。

整数数值越大，整数对象底层数组越长，运算开销也就越大。好在运算处理函数均以快速通道对小整数运算进行优化，将额外开销降到最低。

以 _long_add_ 为例， _8-10_ 行便是一个快速通道：如果参与运算的整数对象底层数组长度均不超过 _1_ ，直接将整数对象转化成 _C_ 整数类型进行运算，性能损耗极小。满足这个条件的整数范围在 _-1073741823~1073741823_ 之间，足以覆盖程序运行时的绝大部分运算场景。