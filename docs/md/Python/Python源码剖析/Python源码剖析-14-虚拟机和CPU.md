**编译器** 依照语法规则对源码进行 **作用域** 划分，并以此为单位编译源码，最终为每个作用域生成一个代码对象。代码对象则保存了 **字节码** ，以及相关 **名字** 、 **常量** 等静态上下文信息。

**编译器** 将源码 **编译** 成代码对象后，便将接力棒传给 **虚拟机** ，由虚拟机负责 **执行** 。

## PyFrameObject

由于代码对象是静态的， _Python_ 虚拟机在执行代码对象时，需要由一个辅助对象来维护执行上下文。那么，这个执行上下文需要包含什么信息呢？我们先根据已经掌握的知识大开脑洞猜测一下：

首先，我们需要一个动态容器，来存储代码对象作用域中的名字，这也就是 **局部名字空间** ( _Locals_ )。同理，上下文信息还需要记录 **全局名字空间** ( _Globals_ )以及 **内建名字空间** ( _Builtins_ )的具体位置，确保相关名字查找顺畅。

其次，虚拟机需要保存当前执行字节码指令的编号，就像 _CPU_ 需要一个寄存器( _IP_ )保存当前执行指令位置一样。

因此，执行上下文理论上至少要包括以下这两方面信息：

-   名字空间
-   当前字节码位置

接下来，我们请出执行上下文的真身—— **栈帧对象** _PyFrameObject_ ，看看我们有没有猜对。 _PyFrameObject_ 在头文件 _Include/frameobject.h_ 中定义：

```c
typedef struct _frame {
    PyObject_VAR_HEAD
    struct _frame *f_back;      /* previous frame, or NULL */
    PyCodeObject *f_code;       /* code segment */
    PyObject *f_builtins;       /* builtin symbol table (PyDictObject) */
    PyObject *f_globals;        /* global symbol table (PyDictObject) */
    PyObject *f_locals;         /* local symbol table (any mapping) */
    PyObject **f_valuestack;    /* points after the last local */
    /* Next free slot in f_valuestack.  Frame creation sets to f_valuestack.
       Frame evaluation usually NULLs it, but a frame that yields sets it
       to the current stack top. */
    PyObject **f_stacktop;
    PyObject *f_trace;          /* Trace function */
    char f_trace_lines;         /* Emit per-line trace events? */
    char f_trace_opcodes;       /* Emit per-opcode trace events? */

    /* Borrowed reference to a generator, or NULL */
    PyObject *f_gen;

    int f_lasti;                /* Last instruction if called */
    /* Call PyFrame_GetLineNumber() instead of reading this field
       directly.  As of 2.3 f_lineno is only valid when tracing is
       active (i.e. when f_trace is set).  At other times we use
       PyCode_Addr2Line to calculate the line from the current
       bytecode index. */
    int f_lineno;               /* Current line number */
    int f_iblock;               /* index in f_blockstack */
    char f_executing;           /* whether the frame is still executing */
    PyTryBlock f_blockstack[CO_MAXBLOCKS]; /* for try and loop blocks */
    PyObject *f_localsplus[1];  /* locals+stack, dynamically sized */
} PyFrameObject;
```

目前我们需要研究的只有以下这些：
![](../../youdaonote-images/Pasted%20image%2020221212182936.png)

我们搞清楚了栈帧对象的结构以及在运行时所起的作用：

![](../../youdaonote-images/Pasted%20image%2020221212182945.png)

其中， _f_code_ 字段保存了当前执行的代码对象，最核心的字节码就在代码对象中。而 _f_lasti_ 字段则保存着上条已执行字节码的编号。虚拟机内部用一个 _C_ 局部变量 _next_instr_ 维护下条字节码的位置，并据此加载下一条待执行的字节码指令，原理跟 _CPU_ 的 **指令指针** 寄存器（ _%rip_ ）一样。

另外，注意到 _f_back_ 字段指向前一个栈帧对象，也就是 **调用者** 的栈帧对象。这样一来，栈帧对象按照 **调用关系** 串成一个 **调用链** ！这不是跟 _x86 CPU_ 栈帧布局如出一辙吗？我们先花点时间回顾一下 _x86 CPU_ 栈帧布局与函数调用之间的关系：

![](../../youdaonote-images/Pasted%20image%2020221212183145.png)

