互联网的基础是网络通讯，应用对网络请求的处理能力非常关键。

## C10K问题

在互联网尚未普及的早期，一台服务器同时在线_100_ 个用户已经算是非常大型的应用了，工程上没有什么挑战。

随着 _Web 2.0_ 时代的到来，用户群体承几何倍数增长，服务器需要更强的并发处理能力才能承载海量的用户。这时，著名的 _C10K_ 问题诞生了——如何让单台服务器同时支撑 _1_ 万个客户端连接？

最初的服务器应用编程模型，是基于进程/线程的：当一个新的客户端连接上来，服务器就分配一个进程或线程，来处理这个新连接。这意味着，想要解决 _C10K_ 问题，操作系统需要同时运行 _1_ 万个进程或线程。

进程和线程是操作系统中，开销最大的资源之一。每个新连接都新开进程/线程，将造成极大的资源浪费。况且，受硬件资源制约，系统同一时间能运行的进程/线程数存在上限。

换句话讲，在进程/线程模型中，每台服务器能处理的客户端连接数是非常有限的。为支持海量的业务，只能通过堆服务器这种简单粗暴的方式来实现。但这样的人海战术，既不稳定，也不经济。

为了在单个进程/线程中同时处理多个网络连接，_select_ 、 _poll_ 、_epoll_ 等 **IO多路复用** 技术应运而生。在 IO 多路复用模型，进程/线程不再阻塞在某个连接上，而是同时监控多个连接，只处理那些有新数据达到的活跃连接。

## 为什么需要协程

单纯的 IO 多路复用编程模型，不像阻塞式编程模型那样直观，这为工程项目带来诸多不便。最典型的像 _JavaScript_ 中的回调式编程模型，程序中各种 _callback_ 函数满天飞，这不是一种直观的思维方式。

为实现阻塞式那样直观的编程模型，协程(用户态线程)的概念被提出来。协程在进程/线程基础之上，实现多个执行上下文。由 _epoll_ 等IO多路复用技术实现的事件循环，则负责驱动协程的调度、执行。

协程可以看做是IO多路复用技术更高层次的封装。虽然与原始IO多路复用相比有一定的性能开销，但与进程/线程模型相比却非常突出。协程占用资源比进程/线程少，而且切换成本比较低。因此，协程在高并发应用领域潜力无限。

然而，协程独特的运行机制，让初学者吃了不少亏，错漏百出。

接下来，我们通过若干简单例子，探索协程应用之道，从中体会协程的作用，并揭示高并发应用设计、部署中存在的常见误区。由于 _asyncio_ 是 _Python_ 协程发展的主要趋势，例子便以 _asyncio_ 为讲解对象。

## 第一个协程应用

协程应用由事件循环驱动，套接字必须是非阻塞模式，否则会阻塞事件循环。因此，一旦使用协程，就要跟很多类库说拜拜。以 _MySQL_ 数据库操作为例，如果我们使用 _asyncio_ ，就要用 _aiomysql_ 包来连数据库。

而想要开发 _Web_ 应用，则可以用 _aiohttp_ 包，它可以通过 _pip_ 命令安装：

```bash
$ pip install aiohttp
```

这个例子实现一个完整 _Web_ 服务器，虽然它只有返回当前时间的功能：

```python
from aiohttp import web
from datetime import datetime

async def handle(request):
    return web.Response(text=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

app = web.Application()
app.add_routes([
    web.get('/', handle),
])

if __name__ == '__main__':
    web.run_app(app)
```

1.  第 _4_ 行，实现处理函数，获取当前时间并返回；
2.  第 _7_ 行，创建应用对象，并将处理函数注册到路由中；
3.  第 _13_ 行，将 _Web_ 应用跑起来，默认端口是 _8080_ ；

当一个新的请求到达时，_aiohttp_ 将创建一个新协程来处理该请求，它将负责执行对应的处理函数。因此，处理函数必须是合法的协程函数，以 _async_ 关键字开头。

将程序跑起来后，我们就可以通过它获悉当前时间。在命令行中，可以用 _curl_ 命令来发起请求：

```bash
$ curl http://127.0.0.1:8080/
2020-08-06 15:50:34
```

## 压力测试

研发高并发应用，需要评估应用的处理能力。我们可以在短时间内发起大量的请求，并测算应用的吞吐能力。然而，就算你手再快，一秒钟也只能发起若干个请求呀。怎么办呢？

我们需要借助一些压力测试工具，例如 _Apache_ 工具集中的 _ab_ 。如何安装使用 _ab_ 不在本文的讨论范围，请参考这篇文章： [Web压力测试](https://network.fasionchan.com/zh_CN/latest/performance/web-pressure-test.html) 。

事不宜迟，我们先以 _100_ 为并发数，压 _10000_ 个请求看看结果：

```python
$ ab -n 10000 -c 100 http://127.0.0.1:8080/
This is ApacheBench, Version 2.3 <$Revision: 1706008 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Python/3.8
Server Hostname:        127.0.0.1
Server Port:            8080

Document Path:          /
Document Length:        19 bytes

Concurrency Level:      100
Time taken for tests:   5.972 seconds
Complete requests:      10000
Failed requests:        0
Total transferred:      1700000 bytes
HTML transferred:       190000 bytes
Requests per second:    1674.43 [#/sec] (mean)
Time per request:       59.722 [ms] (mean)
Time per request:       0.597 [ms] (mean, across all concurrent requests)
Transfer rate:          277.98 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    2   1.5      1      15
Processing:    43   58   5.0     57      89
Waiting:       29   47   6.3     47      85
Total:         43   60   4.8     58      90

Percentage of the requests served within a certain time (ms)
  50%     58
  66%     59
  75%     60
  80%     61
  90%     65
  95%     69
  98%     72
  99%     85
 100%     90 (longest request)
```

-   _-n_ 选项，指定总请求数，即总共发多少个请求；
-   -c 选项，指定并发数，即同时发多少个请求；

从 _ab_ 输出的报告中可以获悉，_10000_ 个请求全部成功，总共耗时 _5.972_ 秒，处理速度可以达到 _1674.43_ 个每秒。

现在，我们尝试提高并发数，看处理速度有没有提升：

```
$ ab -n 10000 -c 100 http://127.0.0.1:8080/
```

在 _1000_ 并发数下，_10000_ 个请求在 _5.771_ 秒内完成，处理速度是 _1732.87_ ，略有提升但很不明显。这一点也不意外，例子中的处理逻辑绝大部分都是计算型，虚增并发数几乎没有任何意义。

## 协程擅长做什么

协程擅长处理 _IO_ 型的应用逻辑，举个例子，当某个协程在等待数据库响应时，事件循环将唤醒另一个就绪协程来执行，以此提高吞吐。为降低复杂性，我们通过在程序中睡眠来模拟等待数据库的效果。

```python
import asyncio

from aiohttp import web
from datetime import datetime

async def handle(request):
    # 睡眠一秒钟
    asyncio.sleep(1)
    return web.Response(text=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

app = web.Application()
app.add_routes([
    web.get('/', handle),
])

if __name__ == '__main__':
    web.run_app(app)
```

**并发数**

**请求总数**

**耗时(秒)**

**处理速度(请求/秒)**

100

10000

102.310

97.74

500

10000

22.129

451.89

1000

10000

12.780

782.50

可以看到，随着并发数的增加，处理速度也有明显的提升，趋势接近线性。

## 操作系统因素

当我们以 _10000_ 并发对程序进行压测时，程序不断抛出 _OSError_ 异常：

```python
socket.accept() out of system resource
socket: <asyncio.TransportSocket fd=6, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=6, laddr=('0.0.0.0', 8080)>
Traceback (most recent call last):
  File "/home/fasion/opt/python3.8.5/lib/python3.8/asyncio/selector_events.py", line 162, in _accept_connection
  File "/home/fasion/opt/python3.8.5/lib/python3.8/socket.py", line 292, in accept
OSError: [Errno 24] Too many open files
```

_Linux_ 进程默认可以打开的文件描述符只有 _1024_ 个：

```bash
$ ulimit -n
1024
```

当一个新请求连接达到时，事件循环将调用 _accept_ 系统调用来接收。accept 系统调用将为新连接分配一个套接字( _socket_ )，这将占用一个文件描述符。

由于 _10000_ 并发数远远超过 _1024_ ，程序的文件描述符很快就会被耗尽，这就是它抛异常的根源。要解决程序报错问题，唯一的途径就是将进程文件描述符数调大，用 _ulimit_ 命令即可搞定：

```bash
$ ulimit -n 20000
$ ulimit -n
20000
```

进程 **资源限制** ( _rlimit_ )与 _ulimit_ 命令的用法超出本文的范围，更多介绍请参考这篇文章：[资源限制](https://linux.fasionchan.com/zh_CN/latest/administration/kernel/rlimit.html) 。

进程可打开的文件描述符数，直接制约进程承载的连接数，不可小视。网络应用部署时，如果忘记检查 _rlimit_ 配置，很有可能造成故障。实际上，这类血案并不少见，我早年间也踩过坑。

除了 _rlimit_ ，内核参数，特别是与套接字相关的，在某些场景下也是需要特别注意的。因受篇幅所限，这里就不展开讨论了。

## 阻塞陷阱

协程由事件循环驱动，不能调用阻塞函数，不然将阻塞事件循环。事件循环一旦被阻塞，它便无法调度其他协程，只能等待阻塞函数返回。不信我们将 _sleep_ 函数换成 _time_ 模块中的阻塞版本，看看会发生什么事情？

```python
import time

from aiohttp import web
from datetime import datetime

async def handle(request):
    # 睡眠一秒钟
    time.sleep(1)
    return web.Response(text=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

app = web.Application()
app.add_routes([
    web.get('/', handle),
])

if __name__ == '__main__':
    web.run_app(app)
```

由于我们有预感程序的吞吐将大受影响，压测总请求数降为 _100_ ，并发数也降为从 _1_ 起步：

```
$ ab -n 100 -c 1 http://127.0.0.1:8080/
```

测试结果如下，不管并发数是 _1_ 、 _10_ 还是 _100_ ，压测耗时都是 _100_ 秒左右，处理速度都是 _1_ 个每秒：

**并发数**

**请求总数**

**耗时(秒)**

**处理速度(请求/秒)**

1

100

100.344

1.00

10

100

102.248

0.98

100

100

100.230

1.00

测试结果表明，一旦事件循环被阻塞，程序的并发处理能力将急剧下降。因此，千万不能在协程中调用同步阻塞的类库！

在目前的 _Python_ 的生态，大部分库仍然是同步的。比如 _requests_ ，这是一个很好用的 _http_ 请求库。但很不幸，它是同步的，会阻塞事件循环。因此，协程应用不能使用 _requests_ ，只能使用 _requests-async_ 或 _aiohttp_ 中的替代品。

那么，编写基于 _asyncio_ 的协程应用，如何选择合适的类库呢？下面列举一些常用的替代品：

-   _aiohttp_ ，发起 _http_ 请求或实现 _http_ 服务器；
-   _requests-async_ ，异步版 _requests_ ，用于发起 _http_ 请求；
-   _aiomysql_ ，用于连接 _MySQL_ 数据库；
-   aiokafka ，用于连接 _Kafka_ 消息队列；
-   _aio_pika_ ，用于连接基于 _AMQP_ 协议的消息队列，例如 _RabbitMQ_ ；
-   _etc_

## 总结

经过本节的实战练习，我们对协程的运行机制有了更深刻的认识，要点总结如下：

-   协程擅长 **IO密集型** 场景，对 **计算密集型** 场景几乎没有任何意义；
-   协程中不能调用同步阻塞式类库，否则将阻塞事件循环，性能骤降；
-   进程可打开文件数、内存参数等操作系统因素，也会制约程序的处理能力，必须重视；

协程有自己擅长的领域，也存在一些局限性。运用协程时，还需要注意避免一些误区。不过只要真正理解这些要点，相信协程式应用程序开发，是可以轻松驾驭的。