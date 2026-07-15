# generator应用
## 基本用法

我们知道，函数体包含 _yield_ 关键字的函数不是一个普通函数。这种函数叫做 **生成器** ( _generator_ )，一般用于循环处理结构，应用得当可以极大优化内存使用效率。例如，设计一个函数，打开文件并将每一行转成大写并返回：

```python
def read_file_upper(path):
    lines = []
    with open(path) as f:
        for line in f:
            lines.append(line.upper())
    return lines
```

这个版本的函数，在内部创建了一个 _list_ 对象，用于保存转换结果。_for_ 循环则遍历文件每一行，将其转成大写并追加到列表中。这样一来，文件中的每一行均需要保存在列表中，如果文件很大，内存开销可想而知。

我们可以借助 _yield_ 关键字，将 _read_file_upper_ 函数改成生成器版本。函数主体逻辑没有任何变化，只是将每行数据的处理结果通过 _yield_ 逐个返回，而不是收集到 _list_ 对象后再返还。

```python
def iter_file_upper(path):
    with open(path) as f:
        for line in f:
            yield line.upper()
```

如果现在有一个文本文件 _data.txt_ ，里面包含以下内容：

```python
hello, world
life is short, use python
my wechat id is: coding-fan
bye
```

用 _iter_file_upper_ 生成器，我们可以这样对它进行处理：

```python
>>> for line in iter_file_upper('text.txt'):
...     print(line.strip())
HELLO, WORLD
LIFE IS SHORT, USE PYTHON
MY WECHAT ID IS: CODING-FAN
BYE
```

_iter_file_upper_ 生成器用法与 _read_file_upper_ 函数大致相同，但它不会一次性拿住文件所有数据行，而是逐行处理、逐个返回，这样便将内存使用量降到最低。

## 行为观察

那么，生成器为什么会有这样的奇效呢？我们接着观察：

```python
>>> g = iter_file_upper('text.txt')
>>> g
<generator object iter_file_upper at 0x103becd68>
```

我们调用 _iter_file_upper_ 后，得到一个生成器对象，而不是文件处理结果，这时 _iter_file_upper_ 还未开始执行。

当我们调用 _next_ 函数从生成器接收下一个数据时，_iter_file_upper_ 开始执行并在 _yield_ 处停下来，并把第一行的处理结果返回给我们：

```python
>>> next(g)
'HELLO, WORLD\n'
```

这时，生成器处于暂停状态，没有我们的指令，它不会接着处理第二行数据。

当我们再次执行 _next_ 函数时，生成器再次恢复执行，处理下一行数据并在 _yield_ 处再次暂停：

```python
>>> next(g)
'LIFE IS SHORT, USE PYTHON\n'
```

生成器记住了自己的执行进度，每次调用 _next_ 函数，它总是处理并生产下一个数据，完全不用我们瞎操心：

```python
>>> next(g)
'MY WECHAT ID IS: CODING-FAN\n'
>>> next(g)
'BYE\n'
```

当 _iter_file_upper_ 代码逻辑执行完毕，它将给 _next_ 抛一个异常，以此通知调用者它已经结束了：

```python
>>> next(g)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```

因此，我们可以简单认为 _for-in_ 循环在 _Python_ 虚拟机内部是这样实现的：

-   不断调用 _next_ 函数让生成器产出数据；
-   直到生成器抛出 _StopIteration_ 异常；

## 任务上下文

在经典的线程模型中，每个线程有一个独立的执行流，只能执行一个任务。如果一个程序需要同时处理多个任务，可以借助 **多进程** 或者 **多线程** 技术。假设一个站点需要同时服务多个客户端连接，可以为每个连接创建一个独立的线程进行处理。

不管线程还是进程，切换时都会带来巨大的开销：用户态/内核态切换、执行上下文保存和恢复、CPU缓存刷新等等。因此，用线程或进程来驱动小任务的执行，显然不是一个理想的选择。

那么，除了线程和进程，还有其他解决方案吗？开始讨论之前，我们先来总结实现多任务执行系统的关键之处。

一个程序想要同时处理多个任务，必须提供一种能够记录任务执行进度的机制。在经典线程模型中，这个机制由 _CPU_ 提供：

![](../../youdaonote-images/Pasted%20image%2020221217130715.png)

如上图，程序内存空间分为代码、数据、堆以及栈等多个段，_CPU_ 中的 _CS_ 寄存器指向代码段，_SS_ 寄存器指向栈段。当程序任务(线程)执行时，_IP_ 寄存器指向代码段中当前正被执行的指令，_BP_ 寄存器指向当前栈帧，_SP_ 寄存器则指向栈顶。

有了 _IP_ 寄存器，_CPU_ 可以取出需要执行的下一条指令；有了 _BP_ 寄存器，当函数调用结束时，_CPU_ 可以回到调用者继续执行。因此，_CPU_ 寄存器与内存地址空间一起构成了任务执行上下文，记录着任务执行进度。当任务切换时，操作系统先将 _CPU_ 当前寄存器保存到内存，然后恢复待执行任务的寄存器。

至此，我们已经受到一些启发：生成器不是可以记住自己的执行进度吗？那么，是不是可以用生成器来实现任务执行流？由于生成器在用户态运行，切换成本比线程或进程小很多，是组织微型任务的理想手段。

现在，我们用生成器来写一个玩具协程，以此体会协程的运行机制：

```python
def co_process(data):
    print('task with data {} started'.format(data))
    
    yield
    print('step one for data {} finished'.format(data))
    
    yield
    print('step two for data {} finished'.format(data))
    
    yield
    print('step there for data {} finished'.format(data))
```

协程 _co_process_ 用于处理数据 _data_ ，处理分为 _3_ 步，每一步间可能发生任务切换，即通过 _yield_ 让出执行权。

接着，我们创建 _3_ 个协程，用于处理 _3_ 个不同的数据：

```python
>>> t1 = co_process('a')
>>> t2 = co_process('b')
>>> t3 = co_process('c')
```

至此，协程已经完成初始化，但暂未开始执行。我们需要调用 _next_ 函数，将他们逐个激活：

```python
>>> next(t1)
task with data a started
>>> next(t2)
task with data b started
>>> next(t3)
task with data c started
```

协程激活后开始执行，开始输出提示信息，直到遇到第一个 _yield_ 语句。_yield_ 将让出协程的执行权，执行权又回到我们手中。在实际项目中，协程一般在等待 _IO_ 时，才会通过 _yield_ 语句让出执行权。

注意到，在这个例子中，我们扮演着调度器的角色，手中掌握着协程调度权——让第一个协程任务往下执行两步：

```python
>>> next(t1)
step one for data a finished
>>> next(t1)
step two for data a finished
```

再让第二三个协程交替执行两步：

```python
>>> next(t2)
step one for data b finished
>>> next(t3)
step one for data c finished
>>> next(t2)
step two for data b finished
>>> next(t3)
```

请注意，在实际项目中，一般由 **事件循环** 充当调度器的角色，而不是通过我们的双手。在《手把手教你设计协程库》一节，我们将一起探讨实现事件循环的思路。

我们接着调度协程任务，当某个协程执行完毕，它将通过 _next_ 函数抛出 _StopIteration_ 异常，以此通知我们：

```python
>>> next(t1)
step there for data a finished
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
>>> next(t3)
step there for data c finished
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
>>> next(t2)
step there for data b finished
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```

虽然这只是一个玩具程序，几乎没有任何实际用途。然而，正是这个玩具，帮我们解开实现协程的全部秘密！

# 字节码解读 generator 运行机制

## 生成器的创建

我们对上节中的 _co_process_ 生成器略加修改后作为研究对象，继续深入字节码，力求洞察生成器执行的原理：

```python
def co_process(arg):
    print('task with argument {} started'.format(arg))
    
    data = yield 1
    print('step one finished， got {} from caller'.format(data))
    
    data = yield 2
    print('step two finished， got {} from caller'.format(data))
    
    data = yield 3
    print('step three finished， got {} from caller'.format(data))
```

_co_process_ 是一个特殊的函数对象，它被调用后并不会立刻执行函数体，而是得到一个生成器对象：

```python
>>> co_process
<function co_process at 0x109768f80>
>>> genco = co_process('foo')
>>> genco
<generator object co_process at 0x109629450>
>>> genco.__class__
<class 'generator'>
```

在函数机制部分，我们知道函数调用由 _CALL_FUNCTION_ 字节码负责：

```python
>>> import dis
>>> dis.dis(compile("co_process('foo')", '', 'exec'))
  1           0 LOAD_NAME                0 (co_process)
              2 LOAD_CONST               0 ('foo')
              4 CALL_FUNCTION            1
              6 POP_TOP
              8 LOAD_CONST               1 (None)
             10 RETURN_VALUE
```

那么，什么情况下函数调用会返回生成器呢？顺着 _CALL_FUNCTION_ 字节码处理逻辑，不难找到答案。

_CALL_FUNCTION_ 字节码在 _Python/ceval.c_ 中处理，它主要是调用 _call_function_ 函数完成工作。_call_function_ 函数根据被调用对象类型区别处理，可分为 **类方法** 、 **函数对象** ， **普通可调用对象** 等等。

在这个例子中，被调用对象是函数对象。因此，_call_function_ 函数调用位于 _Objects/call.c_ 中的 __PyFunction_FastCallKeywords_ 函数，而它则进一步调用位于 _Python/ceval.c_ 的 __PyEval_EvalCodeWithName_ 函数。

__PyEval_EvalCodeWithName_ 函数先为目标函数 _co_process_ 创建 **栈帧** 对象 _f_，然后检查代码对象标识。若代码对象带有 _CO_GENERATOR_ 、_CO_COROUTINE_ 或 _CO_ASYNC_GENERATOR_ 标识，便创建生成器并返回：

```c
    /* Handle generator/coroutine/asynchronous generator */
    if (co->co_flags & (CO_GENERATOR | CO_COROUTINE | CO_ASYNC_GENERATOR)) {
        PyObject *gen;
        PyObject *coro_wrapper = tstate->coroutine_wrapper;
        int is_coro = co->co_flags & CO_COROUTINE;
        
        // 省略

        /* Create a new generator that owns the ready to run frame
         * and return that as the value. */
        if (is_coro) {
            gen = PyCoro_New(f, name, qualname);
        } else if (co->co_flags & CO_ASYNC_GENERATOR) {
            gen = PyAsyncGen_New(f, name, qualname);
        } else {
            gen = PyGen_NewWithQualName(f, name, qualname);
        }
        if (gen == NULL) {
            return NULL;
        }
        
        // 省略

        return gen;
    }
```

代码对象标识 _co_flags_ 在编译时由语法规则确定，通过 _co_process_ ，我们可以找到其代码对象标识：

```python
>>> co_process.__code__.co_flags
99
```

_CO_GENERATOR_ 宏定义于 _Include/code.h_ 头文件，它的值是 _0x20_ ，_co_process_ 代码对象确实带有该标识：

```python
>>> co_process.__code__.co_flags & 0x20
32
```

注意到，用于保存 _co_process_ 函数执行上下文的栈帧对象 _f_ ，作为一个重要字段保存于生成器对象 _gen_ 中：

![](../../youdaonote-images/Pasted%20image%2020221217163055.png)

至此，生成器对象的创建过程已经浮出水面。与普通函数一样，当 _co_process_ 被调用时，_Python_ 将为其创建栈帧对象，用于维护函数执行上下文 —— **代码对象** 、 **全局名字空间** 、 **局部名字空间** 以及 **运行栈** 都在其中。

与普通函数不同的是，_co_process_ 代码对象带有生成器标识。_Python_ 不会立即执行代码对象，栈帧对象也不会被接入调用链，因此 _f_back_ 字段是空的。相反，_Python_ 创建了一个生成器对象，并将其作为函数调用结果返回。

生成器对象底层由 _PyGenObject_ 结构体表示，定义于 _Include/genobject.h_ 头文件中。生成器类型对象同样由 _PyTypeObject_ 结构体表示，全局只有一个，以全局变量的形式定义于 _Objects/genobject.c_ 中，也就是 _PyGen_Type_ 。

_PyGenObject_ 结构体中的字段也很好理解，顾名即可思义，这也体现了变量名的作用：

-   _ob_refcnt_ ，**引用计数** ，这是任何对象都包含的公共字段；
-   _ob_type_ ，**对象类型** ，指向其类型对象，这也是任何对象都包含的公共字段；
-   _gi_frame_ ，生成器执行时所需的 **栈帧对象** ，用于保存执行上下文信息；
-   _gi_running_ ，标识生成器是否运行中；
-   _gi_code_ ，**代码对象** ；
-   _gi_weakreflist_ ，弱引用相关，不深入讨论；
-   _gi_name_ ，生成器名；
-   _gi_qualname_ ，同上；
-   _gi_exec_state_ ，生成器执行状态；

最后，可以在 _Python_ 中访问生成器对象 _genco_ ，进一步印证我们在源码中得到的结论：

```python
# 生成器创建后，尚未开始执行
>>> genco.gi_running
False

# 栈帧对象
>>> genco.gi_frame
<frame at 0x110601c90, file '<stdin>', line 1, code co_process>

# 生成器和栈帧的代码对象，均来自 co_process 函数对象
>>> genco.gi_code
<code object co_process at 0x11039c4b0, file "<stdin>", line 1>
>>> genco.gi_frame.f_code
<code object co_process at 0x11039c4b0, file "<stdin>", line 1>
>>> co_process.__code__
<code object co_process at 0x11039c4b0, file "<stdin>", line 1>
```

## 生成器的执行

在前面例子中，_co_process_ 函数被调用后，返回生成器 _genco_ 。这时，函数体尚未开始执行。

```python
>>> genco.gi_frame.f_lasti
-1
```

栈帧对象 _f_lasti_ 字段记录当前字节码执行进度，_-1_ 表示尚未开始执行。

经过前一小节学习，我们知道：借助 _next_ 内建函数或者 _send_ 方法可以启动生成器，并驱动它不断执行。这意味着，生成器执行的秘密可以通过这两个函数找到。

我们先从 _next_ 函数入手，作为内建函数，它定义于 _Python/bltinmodule.c_ 源文件，_C_ 语言函数 _builtin_next_ 是也。_builtin_next_ 函数逻辑非常简单，除了类型检查等样板式代码，最关键的是这一行：

```
res = (*it->ob_type->tp_iternext)(it);
```

这行代码表明，_next_ 函数实际上调用了生成器类型对象的 _tp_iternext_ 函数完成工作。这听上去有些拗口，用 _Python_ 的语言来描述就清晰多了 —— _next(genco)_ 等价于：

```python
>>> genco.__class__.__next__(genco)
task with argument foo started
1
```

还记得 _Python_ **对象模型** 部分内容吗？类型对象决定实例对象的行为，实例对象相关操作函数的指针都保存在类型对象中。生成器作为 _Python_ 对象中的一员，当然也遵守这一法则。

顺着生成器类型对象的肉身 _PyGen_Type_ ( _Objects/genobject.c_ )，很快就可以摸到 _gen_iternext_ 函数。

另一方面， _genco.send_ 也可以启动并驱动生成器的执行，根据 _Objects/genobject.c_ 中的方法定义，它底层调用 __PyGen_Send_ 函数：

```c
static PyMethodDef gen_methods[] = {
    {"send",(PyCFunction)_PyGen_Send, METH_O, send_doc},
    {"throw",(PyCFunction)gen_throw, METH_VARARGS, throw_doc},
    {"close",(PyCFunction)gen_close, METH_NOARGS, close_doc},
    {NULL, NULL}        /* Sentinel */
};
```

不管 _gen_iternext_ 函数还是 __PyGen_Send_ 函数，都是直接调用 _gen_send_ex_ 函数完成工作的：

![](../../youdaonote-images/Pasted%20image%2020221217163714.png)

因此，不管是执行 _next(genco)_ 还是 _genco.send(None)_ ，最终都由 _gen_send_ex_ 函数处理，_next_ 和 _send_ 的等价性也源于此。经过千辛万苦，我们终于找到了理解生成器运行机制的关键所在。

_gen_send_ex_ 函数同样位于 _Objects/genobject.c_ 源文件，函数挺长，但最关键的代码只有两行：

```c
f->f_back = tstate->frame;

// ...

result = PyEval_EvalFrameEx(f, exc);
```

首先，第一行代码将生成器栈帧挂到当前调用链上；然后，第二行代码调用 _PyEval_EvalFrameEx_ 开始执行生成器栈帧；生成器栈帧对象保存着生成器执行上下文，其中 _f_lasti_ 字段跟踪生成器代码对象的执行进度。

![](../../youdaonote-images/Pasted%20image%2020221217165727.png)

_PyEval_EvalFrameEx_ 函数最终调用 __PyEval_EvalFrameDefault_ 函数执行 _frame_ 对象上的代码对象。这个函数我们在虚拟机部分学习过，对它并不陌生。虽然它体量巨大，超过 _3_ 千行代码，逻辑却非常直白 —— 内部由无限 _for_ 循环逐条遍历并处理字节码，每执行完一条字节码就自增 _f_lasti_ 字段。

## 生成器的暂停

我们知道，生成器可以利用 _yield_ 语句，将执行权归还给调用者。因此，生成器暂停执行的秘密就隐藏在 _yield_ 语句中。我们先来看看 _yield_ 语句编译后，生成什么字节码：

```python
>>> import dis
>>> dis.dis(co_process)
```

可以看到，_co_process_ 每个 _yield_ 语句编译后，都得到这样 _3_ 条字节码指令：

```python
  4          14 LOAD_CONST               2 (1)
             16 YIELD_VALUE
             18 STORE_FAST               1 (data)
```

首先，_LOAD_CONST_ 将需要带给调用者的值 ( _yield_ 右边的表达式值) 加载到运行栈栈顶：

![](../../youdaonote-images/Pasted%20image%2020221217170314.png)

接着，_YIELD_VALUE_ 开始放大招，它先从栈顶弹出 _yield_ 值作为 __PyEval_EvalFrameDefault_ 函数返回值，然后一个 _goto_ 语句跳出 _for_ 循环，干净利落：

```c
        TARGET(YIELD_VALUE) {
            retval = POP();

            if (co->co_flags & CO_ASYNC_GENERATOR) {
                PyObject *w = _PyAsyncGenValueWrapperNew(retval);
                Py_DECREF(retval);
                if (w == NULL) {
                    retval = NULL;
                    goto error;
                }
                retval = w;
            }

            f->f_stacktop = stack_pointer;
            why = WHY_YIELD;
            goto fast_yield;
        }
```

紧接着，__PyEval_EvalFrameDefault_ 函数将当前栈帧 (也就是生成器的栈帧) 从调用链中解开。注意到，_yield_ 值被 __PyEval_EvalFrameDefault_ 函数返回，并最终被 _send_ 方法或 _next_ 函数返回给调用者。

![](../../youdaonote-images/Pasted%20image%2020221217170555.png)

## 生成器的恢复

当我们再次调用 _send_ 方法时，生成器将恢复执行：

```python
>>> genco.send('hello')
step one finished， got hello from caller
2
```

注意到，通过 _send_ 发送的数据作为 _yield_ 语句的值，被生成器获取并保存在局部变量 _data_ ，进而被输出。这一切是如何做到的呢？我们接着分析。

我们知道，_send_ 方法被调用后，_Python_ 先把生成器栈帧对象挂到调用链，并最终调用 _PyEval_EvalFrameEx_ 函数逐条执行字节码。在这个过程中，_send_ 发送的数据会被放在生成器栈顶：

![](../../youdaonote-images/Pasted%20image%2020221217170747.png)

生成器执行进度被保存在 _f_lasti_ 字段，生成器将从下一条字节码指令 _STORE_FAST_ 继续执行。_STORE_FAST_ 指令从栈顶取出 _send_ 发来的数据，并保存到局部变量 _data_ ：

![](../../youdaonote-images/Pasted%20image%2020221217170818.png)

再接着，生成器将按照正常的逻辑，有条不紊地执行，直到遇到下一个 _yield_ 语句或者生成器函数返回。

至此，生成器执行、暂停、恢复的全部秘密皆已揭开！

-   生成器函数编译后代码对象带有 _CO_GENERATOR_ 标识；
-   如果函数代码对象带 _CO_GENERATOR_ 标识，被调用时 _Python_ 将创建生成器对象；
-   生成器创建的同时，_Python_ 还创建一个栈帧对象，用于维护代码对象执行上下文；
-   调用 _next_/_send_ 驱动生成器执行，_Python_ 将生成器栈帧对象接入调用链，开始执行字节码；
-   执行到 _yield_ 语句时，_Python_ 将 _yield_ 右边的值放入栈顶，并结束字节码执行循环，执行权回到上一个栈帧；
-   _yield_ 值最终作为 _next_ 函数或 _send_ 方法的返回值，被调用者取得；
-   再次调用 *next/*_send_ ，_Python_ 重新将生成器栈帧对象接入调用链恢复执行，通过 _send_ 发送的值被放在栈顶；
-   生成器函数重新启动后，从 _YIELD_VALUE_ 后的字节码恢复执行，可从栈顶获得调用者发来的值；
-   代码执行权就这样在调用者和生成器间来回切换，而生成器栈顶被用来传值；

生成器运行机制全面解密后，我们便可以利用这些特性来实现协程。下一节，我们将通过自己的双手，实现一个完整的协程库！这个玩具代码量仅 _100_ 来行，却揭示了协程库的核心机密。