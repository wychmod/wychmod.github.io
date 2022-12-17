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