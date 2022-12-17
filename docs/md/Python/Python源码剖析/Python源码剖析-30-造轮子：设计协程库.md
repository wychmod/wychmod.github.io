经过前面章节学习，我们知道生成器可以通过 _yield_ 将执行权还给调用者。这时生成器会记住自己的执行进度，重新调度后将恢复执行。利用这个特性，我们可以实现用户态 **协程** 。但具体如何实施呢？

本节，我们将在 _Python_ 交互式终端上探索协程库的设计思路，最终形成一个精简的协程库，代码量仅 _100_ 来行！麻雀虽小，五脏俱全！借此即可彻底掌握 **协程运行原理** 和 **协程库设计精髓** ，玩转协程式应用开发。

## 事件循环建模

简而言之，我们需要实现一个 **事件循环** ( _Event Loop_ )，它内部有一个 **可执行** ( _Runnable_ ) 协程队列：

![](../../youdaonote-images/Pasted%20image%2020221217194851.png)

事件循环是一个永久循环，每次循环时它先调度可执行队列里的每个协程 —— 即从队列中取出一个可执行协程，然后调用 _send_ 方法驱动它执行：

![](../../youdaonote-images/Pasted%20image%2020221217194932.png)

协程执行的结果可分为两种不同情况。其一，协程没有遇到 _IO_ 操作，一把梭哈到底并最后退出。这时， _send_ 方法抛 _StopIteration_ 异常通知调用者：

![](../../youdaonote-images/Pasted%20image%2020221217194946.png)

其二，协程需要进行 _IO_ 操作，这时它应该通过 _yield_ 让出执行权，并将 _IO_ 操作上下文提交给事件循环。_IO_ 操作由事件循环负责执行，操作上下文必须记录协程信息：

![](../../youdaonote-images/Pasted%20image%2020221217195019.png)

可执行队列处理完毕后，得到成一个个 _IO_ 操作上下文，事件循环负责将它们注册到 _epoll_ ，以便订阅 _IO_ 事件：

![](../../youdaonote-images/Pasted%20image%2020221217195054.png)

接着，事件循环通过 _epoll_ 等待 _IO_ 事件到达。当某个 _IO_ 操作就绪时，事件循环将把对应协程重新放入可执行队列。假设协程 _3_ 等待的 _IO_ 操作已经就绪，_epoll_ 将返回对应 _IO_ 事件，执行 _IO_ 处理函数并将协程放回可执行队列重新调度：

![](../../youdaonote-images/Pasted%20image%2020221217195219.png)

事件循环处理完所有 _epoll_ 事件后，将进入下一次循环。这时，又开始处理可执行队列，周而复始。

## epoll

由于事件循环需要同时关注多个 _IO_ 操作，因此需要采用 **IO 多路复用** 技术。那么，什么是 _IO_ 多路复用呢？它又是如何使用的呢？_epoll_ 是 _Linux_ 下的 _IO_ 多路复用技术，很有代表性。我们便以 _epoll_ 为例，简单探讨一下。

服务器应用一般需要通过 **套接字** ( _socket_ ) 监听某个端口，等待客户端连接。这个函数用于创建一个监听套接字：

```python
from socket import socket, AF_INET, SOCK_STREAM, SOL_SOCKET, SO_REUSEADDR

def create_listen_socket(bind_addr='0.0.0.0', bind_port=55555, backlogs=102400):
    # 创建套接字
    sock = socket(AF_INET, SOCK_STREAM)
    # 设置地址复用选项
    sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    # 绑定监听地址和端口
    sock.bind((bind_addr, bind_port))
    # 开始监听
    sock.listen(backlogs)
    
    return sock
```

我们以默认参数创建一个监听套接字，并调用 _accept_ 方法接受客户端连接：

```python
>>> s = create_listen_socket()
>>> s.accept()
```

_accept_ 调用将 **阻塞** ，直到有客户端连接上来才会返回。现在，我们通过 _telnet_ 命令模拟客户端连接：

```python
$ telnet 127.0.0.1 55555
```

当客户端连上来后，_accept_ 调用就返回了，返回值是一个元组。元组包含一个与客户端通讯的套接字，以及客户端的地址端口对信息：

```python
>>> s.accept()
(<socket.socket fd=4, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=0, laddr=('127.0.0.1', 55555), raddr=('127.0.0.1', 41990)>, ('127.0.0.1', 41990))
```

如果程序还需要处理另一个监听套接字，事情就尴尬了。假设我们在 _s_ 上等待客户端连接，这时 _accept_ 将阻塞；就算 _s2_ 套接字上来了新连接，也无法提前返回：

```python
>>> s2 = create_listen_socket(bind_port=44444)
>>> s.accept()
```

这该怎么办呢？我们先把套接字设置成 **非阻塞** 状态，_accept_ 就不会一直阻塞了：

```python
>>> s.setblocking(False)
>>> s.accept()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/home/fasion/opt/python3.8.5/lib/python3.8/socket.py", line 292, in accept
    fd, addr = self._accept()
BlockingIOError: [Errno 11] Resource temporarily unavailable
```

由于 _s_ 套接字上没有新连接，_accept_ 将抛出 _BlockingIOError_ 异常，以此告知调用者。这时，我们就可以抽出身来处理 _s2_ 了。如果 _s2_ 也没有新连接了，我们又再次检查 _s_ 。

```python
>>> s2.accept()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/home/fasion/opt/python3.8.5/lib/python3.8/socket.py", line 292, in accept
    fd, addr = self._accept()
BlockingIOError: [Errno 11] Resource temporarily unavailable
>>> s.accept()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/home/fasion/opt/python3.8.5/lib/python3.8/socket.py", line 292, in accept
    fd, addr = self._accept()
BlockingIOError: [Errno 11] Resource temporarily unavailable
```

最终，我们将在 _s_ 和 _s2_ 间来回 **轮询** ，但轮询很浪费 _CPU_ 资源！特别是套接字很多时，更是如此！如果能让内核同时关注多个套接字，当它们中有新连接达到时再通知我们就好了 —— 这就是 _epoll_ 擅长的事。

当监听套接字上有新连接时，它会产生 **读事件** 。因此，我们可以创建一个 _epoll_ 描述符，并将 _s_ 和 _s2_ 注册进去，订阅 **读事件** ( _EPOLLIN_ )：

```python
>>> import select
>>> ep = select.epoll()
>>> ep.register(s.fileno(), select.EPOLLIN)
>>> ep.register(s2.fileno(), select.EPOLLIN)
```

接着，我们调用 _poll_ 方法，等待我们感兴趣的事件：

```python
>>> events = ep.poll()
```

_poll_ 将一直阻塞，直到 _s_ 或 _s2_ 上有新连接达到。试着连一下 _s2_ ：

```python
$ telnet 127.0.0.1 44444
```

_poll_ 立马停止阻塞，并向我们返回了一个事件列表，列表项是一个由 **文件描述符** 和 **事件掩码** 组成的元组：

```python
>>> events
[(6, 1)]
>>> for fileno, event in events:
...     print(fileno, event)
...
6 1
```

这个信息告诉我们，哪个套接字上有什么事件发生。如此一来，程序可以精准处理套接字，无须傻傻 **轮询** 。这就是 _epoll_ 的强大能力，它让高效处理大规模套接字成为可能。

## 调度第一个协程

开始研究有 _IO_ 操作的协程之前，我们先拿一个纯计算协程练练手。这是一个只做加法运算的协程：

```python
def add(a, b):
    if False:
        yield
    return a + b
```

_if_ 语句永远不会执行，它只是为了引入 _yield_ 语句，让 _Python_ 将 _add_ 编译成生成器。

现在我们创建一个新协程，并调用 _send_ 方法把它调度起来：

```python
>>> co = add(1, 2)
>>> co.send(None)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration: 3
```

正如前面提到的那样，协程一把梭哈到底，_StopIteration_ 异常告诉我们它已经执行完毕，结果是 _3_ 。注意到，协程执行结果 (函数返回值) 保存在 _StopIteration_ 的 _value_ 属性：

```python
>>> import sys
>>> e = sys.last_value
>>> e
StopIteration(3)
>>> e.value
3
```

我们还可以写一个函数来调度协程，函数只需调用 _send_ 方法，并在协程执行完毕后输出一些提示：

```python
def schedule_coroutine(co):
    try:
        co.send(None)
    except StopIteration as e:
        print('coroutine {} completed with result {}'.format(co.__name__, e.value))
```

```python
>>> co = add(2, 3)
>>> schedule_coroutine(co)
coroutine add completed with result 5
```

## IO 上下文

如果协程中涉及 _IO_ 操作，则需要在 _IO_ 未就绪时通过 _yield_ 让出执行权。在让出执行权的同时，还需要将 _IO_ 上下文提交给事件循环，由它协助处理。那么，_IO_ 上下文需要包含哪些信息呢？

_IOContext_ 需要保存哪些信息取决于封装程度，但至少要包括协程需要等待的 **文件描述符** 以及感兴趣的 **事件** ：

```python
class IOContext:
    
    def __init__(self, fileno, events):
        self.fileno = fileno
        self.events = events
```

现在我们开始编写一个带 _IO_ 操作的协程，它负责从监听套接字接收新客户端连接：

```python
def accept_client(sock):
    while True:
        try:
            return sock.accept()
        except BlockingIOError:
            pass
        
        yield IOContext(sock.fileno(), select.EPOLLIN)
```

协程主体逻辑是一个循环，它先调用 _accept_ 尝试接收新连接。如果没有连接就绪，_accept_ 会抛 _BlockingIOError_ 异常。 这时，_yield_ 语句让出执行权，并将 _IOContext_ 提交给事件循环。注意到，协程对套接字上的读事件感兴趣。

现在我们创建一个这样的协程，并扮演事件循环，来体会协程调度过程。如果套接字 _s_ 没有就绪连接，_send_ 将收到协程返回的 _IOContext_ ，表明协程期待哪些事件发生：

```python
>>> co = accept_client(s)
>>> context = co.send(None)
>>> context
<__main__.IOContext object at 0x7fcd58e3ef70>
>>> context.fileno
3
>>> context.events
1
```

事件循环接到上下文后，需要将当前协程保存到上下文中，并将需要订阅的事件注册到 _epoll_ ：

```python
>>> context.co = co
>>> ep.register(context.fileno, context.events)
```

接着，事件循环在 _epoll_ 上等待相关事件到达：

```python
>>> ep.poll()
```

_poll_ 将保持阻塞，直到有注册事件出现。因此，用 _telnet_ 命令再次连接 _s_ 套接字，_poll_ 将返回：

```python
>>> ep.poll()
[(3, 1)]
```

根据 _p_oll 返回的文件描述符 _3_ ，我们知道 _context_ 这次 _IO_ 操作已经就绪了。这时，可以接着调度对应的协程：

```python
>>> context.co.send(None)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration: (<socket.socket fd=4, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=0, laddr=('127.0.0.1', 55555), raddr=('127.0.0.1', 51528)>, ('127.0.0.1', 51528))
```

至此，协程 _co_ 成功接收了一个客户端连接，并退出了。

## yield from

现有一个用于计算圆面积的协程，它没有涉及 _IO_ 操作：

```python
import math

def circle_area(r):
    if False:
        yield
    return math.pi * r ** 2
```

创建一个这样的协程来计算半径为 _2_ 的圆的面积，并调用 _send_ 方法来调度它，协程执行完毕后将返回结果：

```python
>>> co = circle_area(2)
>>> co.send(None)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration: 12.566370614359172
```

现在，让我们利用这个协程来计算圆柱体积：

```python
def cylindrical_volume(r, h):
    return circle_area(r) * h
```

这样显然是不行的，因为调用 _circle_area_ 返回的是一个代表协程的生成器，需要调度它才能获得计算结果。不过没关系，我们可以这么写：

```python
def cylindrical_volume(r, h):
    co = circle_area(r)
    while True:
        try:
            yield co.send(None)
        except StopIteration as e:
            floorage = e.value
            return floorage * h
```

这个是一个协程函数，它先创建一个子协程用于计算底面积，然后用一个永久循环驱动子协程执行。

每次循环时，它先调用 _send_ 方法将执行权交给子协程。如果子协程用 _yield_ 语句归还执行权，这里同样用 _yield_ 将执行权交给调用者，_yield_ 值也一并向上传递。如果子协程退出，它将取出子协程执行结果并完成计算。

```python
>>> co = cylindrical_volume(2, 3)
>>> co.send(None)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration: 37.69911184307752
```

![图片描述](http://img1.sycdn.imooc.com/5f4f03760001751517390304.png)

因此，_cylindrical_volume_ 就像一个中间人，在调用者和子协程之间来回传递执行权。函数调用很常见，如果涉及协程的函数调用都需要用样板代码传递执行权，那简直就是一个噩梦！为此，_Python_ 引入 _yield from_ ：

```python
def cylindrical_volume(r, h):
    floorage = yield from circle_area(r)
    return floorage * h
```

例子中 _yield from_ 的作用相当于上一例子中的 _while_ 循环，因此这两个例子是完全等价的。与业务逻辑无关的样板代码消除后，新函数变得简洁纯粹，更加清晰易懂了！

## async await

直接使用生成器实现协程，虽然逻辑上可行，但语义上有点令人摸不着头脑：

```python
>>> co = circle_area(1)
>>> co
<generator object circle_area at 0x10500db50>
```

为突显协程语义，_Python_ 引入了 _async_ 关键字：

```python
async def circle_area(r):
    return math.pi * r ** 2
```

被 _async_ 关键字标识的函数会被编译成异步函数，调用后得到一个 _coroutine_ 对象：

```python
>>> co = circle_area(1)
>>> co
<coroutine object circle_area at 0x1050f7050>
```

_coroutine_ 对象与 _generator_ 对象类似，我们可以调用 _send_ 方法来调度 _coroutine_ 对象：

```python
>>> co.send(None)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration: 3.141592653589793
```

_coroutine_ 对象的语义更加准确，而且我们再也不需要在函数代码中显式编写 _yield_ 语句了，这未免有点画蛇添足。

青出于蓝而胜于蓝，如果 _coroutine_ 没执行完毕便被意外销毁，_Python_ 将输出警告信息：

```python
>>> co = circle_area(2)
>>> del co
__main__:1: RuntimeWarning: coroutine 'circle_area' was never awaited
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
```

此外，_Python_ 还引入了 _await_ 关键字，代替前面提到的 _yield from_ 语句。与 _yield from_ 类似，_await_ 将执行权交给子协程，并等待它退出。如果子协程需要暂时归还执行权，_await_ 同样承担起中间人角色，在调用者与子协程间来回接棒。

```python
async def cylindrical_volume(r, h):
    floorage = await circle_area(r)
    return floorage * h
```

无须多言，_await_ 的语义也比 _yield from_ 准确。另外，_Python_ 还引入了 **可等待对象** ( _awaitable_ )。例子如下：

```python
class Job:
    
    def __await__(self):
        print('step 1')
        yield
        print('step 2')
        yield
        print('step 3')
        return 'coding-fan'
```

可等待对象需要提供 ___await___ 魔术方法，实现成普通生成器即可。然后，_await_ 就可以驱动生成器的执行：

```python
async def do_job(job):
    value = await job
    print('job is done with value {}'.format(value))
```

```python
>>> co = do_job(Job())
>>> co.send(None)
step 1
>>> co.send(None)
step 2
>>> co.send(None)
step 3
job is done with value coding-fan
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```

如果你觉得可等待对象 _Job_ 难以理解，可以将它想象成等价的 _yield from_ 形式，便豁然开朗了：

```python
def do_job(job):
    value = yield from job.__await__()
    print('job is done with value {}'.format(value))
```

_await_ 本无法驱动普通生成器，可等待对象却另辟蹊径，因而它在协程库中有重要作用。

## 终极作品

铺垫了这么东西，终于可以亮出我们的终极作品了：

```python
import select

from collections import deque
from socket import socket, AF_INET, SOCK_STREAM, SOL_SOCKET, SO_REUSEADDR

def create_listen_socket(bind_addr='0.0.0.0', bind_port=55555, backlogs=102400):
    sock = socket(AF_INET, SOCK_STREAM)
    sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    sock.bind((bind_addr, bind_port))
    sock.listen(backlogs)
    return sock

class Future:

    def __init__(self, loop):
        self.loop = loop
        self.done = False
        self.result = None
        self.co = None

    def set_coroutine(self, co):
        self.co = co

    def set_result(self, result):
        self.done = True
        self.result = result

        if self.co:
            self.loop.add_coroutine(self.co)

    def __await__(self):
        if not self.done:
            yield self
        return self.result

class AsyncSocket:

    def __init__(self, sock, loop):
        sock.setblocking(False)

        self.sock = sock
        self.loop = loop

    def fileno(self):
        return self.sock.fileno()

    def create_future_for_events(self, events):
        future = self.loop.create_future()

        def handler(fileno, active_events):
            self.loop.unregister_from_polling(self.fileno())
            future.set_result(active_events)

        self.loop.register_for_polling(self.fileno(), events, handler)

        return future

    async def accept(self):
        while True:
            try:
                sock, addr = self.sock.accept()
                return AsyncSocket(sock=sock, loop=self.loop), addr
            except BlockingIOError:
                future = self.create_future_for_events(select.EPOLLIN)
                await future

    async def recv(self, bufsize):
        while True:
            try:
                return self.sock.recv(bufsize)
            except BlockingIOError:
                future = self.create_future_for_events(select.EPOLLIN)
                await future

    async def send(self, data):
        while True:
            try:
                return self.sock.send(data)
            except BlockingIOError:
                future = self.create_future_for_events(select.EPOLLOUT)
                await future

class EventLoop:

    def __init__(self):
        self.epoll = select.epoll()

        self.runnables = deque()
        self.handlers = {}

    def create_future(self):
        return Future(loop=self)

    def create_listen_socket(self, bind_addr, bind_port, backlogs=102400):
        sock = create_listen_socket(bind_addr, bind_port, backlogs)
        return AsyncSocket(sock=sock, loop=self)

    def register_for_polling(self, fileno, events, handler):
        print('register fileno={} for events {}'.format(fileno, events))
        self.handlers[fileno] = handler
        self.epoll.register(fileno, events)

    def unregister_from_polling(self, fileno):
        print('unregister fileno={}'.format(fileno))
        self.epoll.unregister(fileno)
        self.handlers.pop(fileno)

    def add_coroutine(self, co):
        self.runnables.append(co)

    def run_coroutine(self, co):
        try:
            future = co.send(None)
            future.set_coroutine(co)
        except StopIteration as e:
            print('coroutine {} stopped'.format(co.__name__))

    def schedule_runnable_coroutines(self):
        while self.runnables:
            self.run_coroutine(co=self.runnables.popleft())

    def run_forever(self):
        while True:
            self.schedule_runnable_coroutines()

            events = self.epoll.poll(1)
            for fileno, event in events:
                handler = self.handlers.get(fileno)
                if handler:
                    handler(fileno, events)

class TcpServer:

    def __init__(self, loop, bind_addr='0.0.0.0', bind_port=55555):
        self.loop = loop
        self.listen_sock = self.loop.create_listen_socket(bind_addr=bind_addr, bind_port=bind_port)
        self.loop.add_coroutine(self.serve_forever())

    async def serve_client(self, sock):
        while True:
            data = await sock.recv(1024)
            if not data:
                print('client disconnected')
                break

            await sock.send(data.upper())

    async def serve_forever(self):
        while True:
            sock, (addr, port) = await self.listen_sock.accept()
            print('client connected addr={} port={}'.format(addr, port))

            self.loop.add_coroutine(self.serve_client(sock))

def main():
    loop = EventLoop()
    server = TcpServer(loop=loop)
    loop.run_forever()

if __name__ == '__main__':
    main()
```

这个程序是一个精简的协程库实现，除了用于演示的应用代码 _TcpServer_ ，整个库也就 _100_ 来行代码！

我们模仿常见协程库，引入 _Future_ ，代表一个在未来才能获取到的数据。_Future_ 一般由协程创建，典型的场景是这样的：协程在等待一个 _IO_ 事件，这时它便创建一个 _Future_ 对象，并把执行权归还给事件循环。

例子中的 _Future_ 类，有 _4_ 个重要的属性：

-   _loop_ ，当前事件循环对象；
-   _done_ ，标识目标数据是否就绪；
-   _result_ ，目标数据；
-   _co_ ，关联协程，_Future_ 就绪后，事件循环 _loop_ 将把它放入可执行队列重新调度；

注意到，_Future_ 是一个 **可等待对象** ( _awaitable_ )，它实现了 ___await___ 方法。当数据未就绪时，通过 _yield_ 让出执行权，这时事件循环将协程记录在 _Future_ 中。当数据就绪后，事件循环将协程放回可执行队列重新调度。

协程库还将套接字进行 **异步化** 封装，抽象出 _AsyncSocket_ 类，接口与原生 _socket_ 对象类似。除了保存原生 _socket_ 对象，它还保存事件循环对象，以便通过事件循环订阅 _IO_ 事件。

_create_future_for_events_ 方法创建一个 _Future_ 对象，来等待一个不知何时发生的 _IO_ 事件。创建完 _Future_ 对象后，进一步调用 _loop_ 相关方法，将感兴趣的 _IO_ 事件注册到 _epoll_ 。当相关事件就绪时，事件循环将执行回调函数 _handler_ ，它解除 _epoll_ 注册，并将活跃事件作为目标数据设置到 _Future_ 上 (注意 _set_result_ 将唤醒协程)。

然后是套接字系列操作函数，以 _accept_ 为例，它不断尝试调用原生套接字，而原生套接字已被设为非阻塞。如果套接字已就绪，_accept_ 将直接返回新连接，协程无须等待。

否则，_accept_ 方法抛出 _BlockingIOError_ 异常。这时，协程调用 _create_future_for_events_ 方法创建一个 _Future_ 订阅读事件 ( _EPOLLIN_ )，并等待事件到达。

_recv_ 、_send_ 方法封装也是类似的，不同的是 _send_ 需要订阅 **可写事件** ( _EPOLLOUT_ )。

好了，终于来到协程库了主角事件循环 _EventLoop_ 对象了，它有 _3_ 个重要属性：

-   _epoll_ ，这是一个 _epoll_ 描述符，用于订阅 _IO_ 事件；
-   _runnables_ ，可执行协程队列；
-   _handlers_ ，_IO_ 事件回调处理函数映射表；

_register_for_polling_ 方法注册感兴趣的 _IO_ 事件和处理函数，它以文件描述符为键，将处理函数记录到映射表中，然后调用 _epoll_ 完成事件订阅。_unregister_from_polling_ 方法则刚好相反，用于取消注册。

_add_coroutine_ 将一个可运行的协程加入队列。_run_coroutine_ 则调度一个可执行协程，它调用 _send_ 将执行权交给协程。如果协程执行完毕，它将输出提示；协程需要等待时，会通过 _yield_ 归还执行权并提交 _Future_ 对象，它将协程记录到 _Future_ 上下文。_schedule_runnable_coroutines_ 将可执行协程逐个取出并调度，直到队列为空。

_run_forever_ 是事件循环的主体逻辑，这是一个永久循环。每次循环时，先调度可执行协程；然后通过 _poll_ 等待协程注册的 _IO_ 事件；当有新事件到达时，取出回调函数 _handler_ 函数并调用。

_TcpServer_ 只是一个普通的协程式应用，无须赘述。接下来，我们逐步分析，看看程序启动后都发生什么事情：

1.  创建事件循环 _EventLoop_ 对象，它将创建 _epoll_ 描述符；
2.  创建 _TcpServer_ 对象，它通过事件循环 _loop_ 创建监听套接字，并将 _serve_forever_ 协程放入可执行队列；
3.  事件循环 _loop.run_forever_ 开始执行，它先调度可执行队列；
4.  可执行队列一开始只有一个协程 _TcpServer.serve_forever_ ，它将开始执行 (由 _run_coroutine_ 驱动)；
5.  执行权来到 _TcpServer.serve_forever_ 协程，它调用 _AsyncSocket.accept_ 准备接受一个新连接；
6.  假设原生套接字未就绪，它将抛出 _BlockingIOError_ 异常；
7.  由于 _IO_ 未就绪，协程创建一个 _Future_ 对象，用来等待一个未来的 _IO_ 事件 ( _AsyncSocket.accept_ )；
8.  于此同时，协程调用事件循环 _register_for_polling_ 方法订阅 _IO_ 事件，并注册回调处理函数 _handler_ ；
9.  _future_ 是可以个可等待对象，_await_ _future_ 将执行权交给它的 ___await___ 函数；
10.  由于一开始 _future_ 是未就绪的，这时 _yield_ 将协程执行逐层归还给事件循环，_future_ 对象也被同时上报；
11.  执行权回到事件循环，_run_coroutine_ 收到协程上报的 _future_ 后将协程设置进去，以便 _future_ 就绪后重新调度协程；
12.  可执行队列变空后，事件循环开始调用 _epoll.poll_ 等待协程注册的 _IO_ 事件 ( _serve_forever_ )；
13.  当注册事件到达后，事件循环取出回调处理函数并调用；
14.  _handler_ 先将套接字从 _epoll_ 解除注册，然后调用 _set_result_ 将活跃事件作为目标数据记录到 _future_ 中；
15.  _set_result_ 将协程重新放回可执行队列；
16.  _IO_ 事件处理完毕，进入下一次事件循环；
17.  事件循环再次调度可执行队列，这时 _TcpServer.serve_forever_ 协程再次拿到执行权；
18.  _TcpServer.serve_forever_ 协程从 _yield_ 语句恢复执行，开始返回目标数据，也就是先前设置的活跃事件；
19.  _AsyncSocket.accept_ 内 _await future_ 语句取得活跃事件，然后循环继续；
20.  循环再次调用原生套接字，这时它早已就绪，得到一个新套接字，简单包装后作为结果返回给调用者；
21.  _TcpServer.serve_forever_ 拿到代表新连接的套接字后，创建一个 _serve_client_ 协程并交给事件循环 _loop_ ；
22.  _TcpServer.serve_forever_ 进入下一次循环，调用 _accept_ 准备接受下一个客户端连接；
23.  如果监听套接字未就绪，执行权再次回到事件循环；
24.  事件循环接着调度可执行队列里面的协程，*TcpServer.*_serve_client_ 协程也开始执行了；
25.  _etc_

这看着就像一个精密的机械装置，有条不紊的运行着，环环相扣！