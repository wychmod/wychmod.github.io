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

我们终于得到了字节码，尽管它现在看上去如同天书一般：

```python
>>> result.co_code
b'd\x00Z\x00d\x01d\x02\x84\x00Z\x01G\x00d\x03d\x04\x84\x00d\x04e\x02\x83\x03Z\x03d\x05S\x00'
```

字节码我们现在还无法读懂，放一放。接着研究其他字段，看看名字列表，包含代码对象涉及的所有名字：

```python
>>> result.co_names
('PI', 'circle_area', 'object', 'Dog')
```

常量列表则包括代码对象涉及的所有常量：

```python
>>> result.co_consts
(3.14, <code object circle_area at 0x10356c5d0, file "demo.py", line 3>, 'circle_area', <code object Dog at 0x10356cae0, file "demo.py", line 6>, 'Dog', None)
```

常量列表里还藏着两个代码对象！其中一个对应着 _circle_area_ 函数体，另一个对应着 _Dog_ 类定义体。回想起 _Python_ **作用域** 的划分方式，很自然地联想到： **每个作用域对应着一个代码对象** ！如果这个假设成立， _Dog_ 代码对象的常量列表应该还藏着两个代码对象，分别代表 ***init*** 方法和 _yelp_ 方法的函数体：

![](../../youdaonote-images/Pasted%20image%2020221212104137.png)

进一步研究代表类 _Dog_ 的代码对象，我们发现事实确实如此：

```python
>>> dog_code = result.co_consts[3]
>>> dog_code
<code object Dog at 0x10356cae0, file "demo.py", line 6>
>>> dog_code.co_consts
('Dog', <code object __init__ at 0x10356c420, file "demo.py", line 8>, 'Dog.__init__', <code object yelp at 0x10356c930, file "demo.py", line 11>, 'Dog.yelp', None)
```

因此，我们得到以下结论： _Python_ 源码编译后，每个作用域都对应着一个代码对象，子作用域代码对象位于父作用域代码对象的常量列表里，层级一一对应。

![](../../youdaonote-images/Pasted%20image%2020221212104226.png)

至此，我们对 _Python_ 源码的编译结果—— **代码对象** 以及其中的 **字节码** 有了最基本的认识。虽然代码对象中的很多字段我们还没来得及研究，但不要紧，我们将在 **虚拟机** 、 **函数机制** 、 **类机制** 的学习中一一揭开这些秘密。

## 反编译

字节码是一堆不可读的字节序列，跟二进制机器码一样。我们想读懂机器码，可以将其反汇编。那么，字节码是不是也可以反编译呢？答案是肯定的—— _dis_ 模块就是干这个事的：

```python
>>> import dis
>>> dis.dis(result.co_code)
          0 LOAD_CONST               0 (0)
          2 STORE_NAME               0 (0)
          4 LOAD_CONST               1 (1)
          6 LOAD_CONST               2 (2)
          8 MAKE_FUNCTION            0
         10 STORE_NAME               1 (1)
         12 LOAD_BUILD_CLASS
         14 LOAD_CONST               3 (3)
         16 LOAD_CONST               4 (4)
         18 MAKE_FUNCTION            0
         20 LOAD_CONST               4 (4)
         22 LOAD_NAME                2 (2)
         24 CALL_FUNCTION            3
         26 STORE_NAME               3 (3)
         28 LOAD_CONST               5 (5)
         30 RETURN_VALUE
```

看到没，字节码反编译后的结果多么像汇编语言！其中，第一列是字节码 **偏移量** ，第二列是 **指令** ，第三列是 **操作数** 。以第一条字节码为例， _LOAD_CONST_ 指令将常量加载进栈，常量下标由操作数给出。而下标为 _0_ 的常量是：

```python
>>> result.co_consts[0]
3.14
```

我们成功解开了第一条字节码：将常量 _3.14_ 加载到栈！对其他字节码的解读也是类似的。

由于代码对象保存了常量、名字等上下文信息，因此直接对代码对象进行反编译可以得到更为清晰的结果：

```python
>>> dis.dis(result)
  1           0 LOAD_CONST               0 (3.14)
              2 STORE_NAME               0 (PI)

  3           4 LOAD_CONST               1 (<code object circle_area at 0x10356c5d0, file "demo.py", line 3>)
              6 LOAD_CONST               2 ('circle_area')
              8 MAKE_FUNCTION            0
             10 STORE_NAME               1 (circle_area)

  6          12 LOAD_BUILD_CLASS
             14 LOAD_CONST               3 (<code object Dog at 0x10356cae0, file "demo.py", line 6>)
             16 LOAD_CONST               4 ('Dog')
             18 MAKE_FUNCTION            0
             20 LOAD_CONST               4 ('Dog')
             22 LOAD_NAME                2 (object)
             24 CALL_FUNCTION            3
             26 STORE_NAME               3 (Dog)
             28 LOAD_CONST               5 (None)
             30 RETURN_VALUE
```

注意到，操作数指定的常量或名字的实际值在旁边的括号内列出。另外，字节码以语句为单位进行分组，中间以空行隔开，语句行号在字节码前面给出。 `PI = 3.14` 这个语句编译成以下两条字节码：

```bash
  1           0 LOAD_CONST               0 (3.14)
              2 STORE_NAME               0 (PI)
```

## pyc

如果将 _demo_ 作为模块导入， _Python_ 将在 _[demo.py](http://demo.py/)_ 文件所在目录下生成 _.pyc_ 文件：

```python
>>> import demo
```

```bash
$ ls __pycache__ 
demo.cpython-37.pyc
```

_pyc_ 文件保存经过序列化处理的代码对象 _PyCodeObject_ 。这样一来， _Python_ 后续导入 _demo_ 模块时，直接读取 _pyc_ 文件并反序列化即可得到代码对象，避免了重复编译导致的开销。只有 _[demo.py](http://demo.py/)_ 有新修改(时间戳比 _pyc_ 文件新)， _Python_ 才会重新编译。

因此， _Python_ 中的 _.py_ 文件可以类比 _Java_ 中的 _.java_ 文件，都是源码文件；而 _.pyc_ 文件可以类比 _.class_ 文件，都是编译结果(字节码)。只不过 _Java_ 程序需要先用编译器 _javac_ 命令来编译，再用虚拟机 _java_ 命令来执行；而 _Python_ 解释器把这个两个活都干了，更加智能。

## 小结

_Python_ **程序** 由 **解释器** _python_ 命令执行， _Python_ 解释器中包含一个 **编译器** 和一个 **虚拟机** 。 _Python_ 解释器执行 _Python_ 程序时，分为以下两步：

1.  **编译器** 将 _.py_ 文件中的 _Python_ 源码编译成 **字节码** ；
2.  **虚拟机** 逐行执行编译器生成的 **字节码** ；

_Python_ 源码的编译结果是代码对象 _PyCodeObject_ ，对象中保存了 **字节码** 、 **常量** 以及 **名字** 等信息，代码对象与源码作用域一一对应。 _Python_ 将编译生成的代码对象保存在 _.pyc_ 文件中，以避免不必要的重复编译，提高效率。