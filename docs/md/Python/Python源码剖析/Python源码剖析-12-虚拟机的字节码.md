## Python程序执行过程

你也许听过这样的说法： _Python_ 是一种解释性语言。这意味着 _Python_ 程序不用编译，只需要用一个解释器来执行。事实真的是这样吗？

虽然从行为上看 _Python_ 更像 _Shell_ 脚本这样的解释性语言，但实际上 _Python_ 程序执行原理本质上跟 _Java_ 或者 _C#_ 一样，都可以归纳为 **虚拟机** 和 **字节码** 。 _Python_ 执行程序分为两步：先将程序代码编译成字节码，然后启动虚拟机执行字节码：

![](../../youdaonote-images/Pasted%20image%2020221212102629.png)

虽然 _python_ 命令也叫做 _Python_ **解释器** ( _Interpreter_ )，但跟其他脚本语言解释器有本质区别。实际上， _Python_ 解释器包含 **编译器** 以及 **虚拟机** 两部分。当 _Python_ 解释器启动后，主要执行以下两个步骤：

1.  **编译器** 将 _.py_ 文件中的 _Python_ 源码编译成 **字节码** ；
2.  **虚拟机** 逐行执行编译器生成的 **字节码** ；

因此， _.py_ 文件中的 _Python_ 语句并没有直接转换成机器指令，而是转换成 _Python_ **字节码** 。

## 字节码

好了，我们知道 _Python_ 程序的 **编译结果** 是字节码，里面应该藏着不少 _Python_ 运行的秘密。因此，不管是为了更深入理解 _Python_ 虚拟机运行机制，还是为了调优 _Python_ 程序运行效率，字节码都是绕不过去的一关。那么， _Python_ 字节码到底长啥样呢？我们如何才能获得一个 _Python_ 程序的字节码呢？

为了回答以上问题，我们需要深入 _Python_ 解释器源码，研究 _Python_ **编译器** 。但出于几方面考虑，我不打算深入介绍 _Python_ 编译器：

① _Python_ 编译器工作原理与其他任何语言类似，市面上任何一本编译原理均有介绍；

② 编译原理是计算机基础学科，不是 _Python_ 特有的，不在本专栏的篇幅内；

③ 能够影响 _Python_ 编译过程的手段非常有限，研究 _Python_ 编译器对开发工作帮助不大。因此，我们只需要知道 _Python_ 解释器背后有一个编译器负责将源码编译成字节码即可， **字节码以及虚拟机才是我们重点研究的对象** 。

那我们还怎么研究字节码呀？别急， _Python_ 提供了一个内置函数 _compile_ 用于即时编译源码。我们只需将待编译源码作为参数调用 _compile_ 函数，即可获得源码的编译结果。

## 源码编译

接下来，我们调用 _compile_ 函数编译一个例子程序，以此演示该函数的用法：

```python
PI = 3.14

def circle_area(r):
    return PI * r ** 2

class Dog(object):
  
    def __init__(self, name):
        self.name = name
  
    def yelp(self):
        print('woof, i am', self.name)
```

假设这段源码保存于 _[demo.py](http://demo.py/)_ 文件，开始编译之前需要将源码从文件中读取出来：

```python
>>> text = open('demo.py').read()
>>> print(text)
PI = 3.14

def circle_area(r):
    return PI * r ** 2

class Dog(object):

    def __init__(self, name):
        self.name = name

    def yelp(self):
        print('woof, i am', self.name)
```

接着，调用 _compile_ 函数编译源码：

```python
>>> result = compile(text, 'demo.py', 'exec')
```

_compile_ 函数必填的参数有 _3_ 个：

-   _source_ ，待编译 **源码** ；
-   _filename_ ，源码所在 **文件名** ；
-   _mode_ ， **编译模式** ， _exec_ 表示将源码当做一个模块来编译；

顺便提一下， _compile_ 函数有 _3_ 中不同的 **编译模式** 可供选择：

-   _exec_ ，用于编译模块源码；
-   _single_ ，用于编译一个单独的 _Python_ 语句(交互式下)；
-   _eval_ ，用于编译一个 _eval_ 表达式；

_compile_ 详细用法请参考 _Python_ 文档，运行 _help_ 内建函数可快速查看：

```python
>>> help(compile)
```

## PyCodeObject

我们接着看源码编译结果到底是个什么东西：

```python
>>> result
<code object <module> at 0x103d21150, file "demo.py", line 1>
>>> result.__class__
<class 'code'>
```

看上去我们得到了一个 **代码对象** ，代码对象有什么特别的呢？接着顺势扒开 _Include/code.h_ 看一看，我们找到了代表代码对象的 _C_ 结构体 _PyCodeObject_ 。 _PyCodeObject_ 定义如下：

```c
/* Bytecode object */
typedef struct {
    PyObject_HEAD
    int co_argcount;            /* #arguments, except *args */
    int co_kwonlyargcount;      /* #keyword only arguments */
    int co_nlocals;             /* #local variables */
    int co_stacksize;           /* #entries needed for evaluation stack */
    int co_flags;               /* CO_..., see below */
    int co_firstlineno;         /* first source line number */
    PyObject *co_code;          /* instruction opcodes */
    PyObject *co_consts;        /* list (constants used) */
    PyObject *co_names;         /* list of strings (names used) */
    PyObject *co_varnames;      /* tuple of strings (local variable names) */
    PyObject *co_freevars;      /* tuple of strings (free variable names) */
    PyObject *co_cellvars;      /* tuple of strings (cell variable names) */
    /* The rest aren't used in either hash or comparisons, except for co_name,
       used in both. This is done to preserve the name and line number
       for tracebacks and debuggers; otherwise, constant de-duplication
       would collapse identical functions/lambdas defined on different lines.
    */
    Py_ssize_t *co_cell2arg;    /* Maps cell vars which are arguments. */
    PyObject *co_filename;      /* unicode (where it was loaded from) */
    PyObject *co_name;          /* unicode (name, for reference) */
    PyObject *co_lnotab;        /* string (encoding addr<->lineno mapping) See
                                   Objects/lnotab_notes.txt for details. */
    void *co_zombieframe;       /* for optimization only (see frameobject.c) */
    PyObject *co_weakreflist;   /* to support weakrefs to code objects */
    /* Scratch space for extra data relating to the code object.
       Type is a void* to keep the format private in codeobject.c to force
       people to go through the proper APIs. */
    void *co_extra;
} PyCodeObject;
```

代码对象 _PyCodeObject_ 用于存储编译结果，包括**字节码** 以及代码涉及的 **常量 名字** 等等。关键字段包括：

![](../../youdaonote-images/Pasted%20image%2020221212103103.png)