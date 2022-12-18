由于内存分配回收工作已被 _Python_ 接管，内存泄露问题排查起来相对来说也比较晦涩。正常情况下，**引用计数** 机制确保对象没有引用时释放，而 **标记清除** 则解决了 **循环引用** 的问题，理论上不存在内存泄露的可能性。

那么，_Python_ 程序内存泄露问题一般是如何造成的呢？程序员的失误是其中的主要原因，最常见的是下面两点：

-   **容器泄露** ，使用容器对象存储数据，但数据只进不出，没有清理机制，容器便慢慢变大，最后撑爆内存；
-   **__del__魔术方法误用**，如果对象实现了 ___del___ 魔术方法，_Python_ 就无法用标记清除法解决循环引用问题，这必然带来内存泄露风险；

既然内存泄露无法完全避免，当 _Python_ 程序发生内存泄漏时，又该如何排查呢？

本节，我们将以一个简单的案例，详细讲解预防、排查、解决 _Python_ 内存泄露问题的 **方法论** 。

工欲善其事，必先利其器。在这个过程中，我们将利用一些趁手的工具（例如 _objgraph_ 等）。只有选择正确工具，掌握工具正确使用姿势，才能做到事半功倍。

## 问题服务

我们以一个存在内存泄露问题的 _API_ 服务 ( _service.py_ ) 作为例子，演示定位内存泄露问题的步骤：

```python
import uvicorn

from fastapi import FastAPI
from faker import Faker

from pyconsole import start_console_server

faker = Faker()
cache = {}

app = FastAPI()

async def fetch_user_from_database(user_id):
    return {
        'user_id': faker.sha256() if user_id == 'random' else user_id,
        'name': faker.name(),
        'email': faker.email(),
        'address': faker.address(),
        'desc': faker.text(),
    }

async def get_user(user_id):
    data = cache.get(user_id)
    if data is not None:
        return data

    data = await fetch_user_from_database(user_id)
    cache[data['user_id']] = data

    return data

@app.get('/users/{user_id}')
async def retrieve_user(user_id):
    return await get_user(user_id)

if __name__ == '__main__':
    start_console_server()
    uvicorn.run(app)
```

这是一个基于 [fastapi](https://python.fasionchan.com/zh_CN/latest/advanced/restful/fastapi/index.html) 框架编写的 _API_ 服务，它只实现了一个接口：根据用户 _ID_ 获取用户信息。_API_ 服务由 _uvicorn_ 启动，它是一个性能非常优秀的 _ASGI_ 服务器。

为减少数据库访问频率，程序将数据库返回的用户数据，以用户 _ID_ 为索引，缓存在内存中 ( _cache_ 字典)。注意到，演示服务直接使用 [faker](https://python.fasionchan.com/zh_CN/latest/libs/faker.html) 随机生成用户数据，模拟数据库查询，以此消除数据库依赖。

顺便提一下，_faker_ 是一个生成假数据的模块，非常好用。特别是需要测试数据时，完全不用自己绞尽脑汁拼造。

服务还启动了一个远程交互式终端，以便我们可以连上服务进程，并在里面执行一些代码。交互式终端的源码可以在 _github_ 上获得： [pyconsole.py](https://gist.github.com/fasionchan/e3087acd6e61e38ad25af27228a8406e) ，原理超过本节讨论范围不展开介绍。

由于例子代码非常简单，哪里内存泄露我们甚至仅凭肉眼便可看出。尽管如此，我们假装什么都不知道，来研究解决问题的思路：如何观察程序？如何运用工具来获取一些关键信息？如何分析各个线索？如何逐步接近问题的根源？

## 运行服务

由于服务依赖几个第三方包，启动它之前请先用 _pip_ 安装这些依赖包，并且确保安装是成功的：

```bash
$ pip install uvicorn
$ pip install fastapi
$ pip install faker
```

直接执行 _service.py_ 即可启动服务，默认它会监听 _8000_ 端口：

```bash
$ python service.py
INFO:     Started server process [76591]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

服务启动后，即可通过 _8000_ 端口访问用户信息接口，用户 _ID_ 可以随便给：

```bash
$ curl http://127.0.0.1:8000/users/bef76936c7d22e98f3d7b4c7e1aeef524da4ec1b48f871926fee43c5ec071a2d
{"user_id":"bef76936c7d22e98f3d7b4c7e1aeef524da4ec1b48f871926fee43c5ec071a2d","name":"Patricia Johnson","email":"epatton@yahoo.com","address":"837 Jacobs Field\nGregorybury, ND 81050","desc":"Third choice air together expect account war. Seven dog safe significant. Expect exist wrong finish window there raise. Third blue and cover."}
```

服务接口还支持随机查询，随机返回一个用户的信息：

```bash
$ curl http://127.0.0.1:8000/users/random
{"user_id":"d6a55f04bab8ddec83d651bdca77f7215042b792970482213b6da56a119f18a8","name":"Evan Carter","email":"andrea79@garcia.com","address":"109 Miller Lights Apt. 843\nPort Jamie, IN 97570","desc":"Resource green allow him. Build store enough effect alone. Everybody right remember public coach book not.\nConference respond trip girl."}
```

## 远程终端

我们直接执行 _pyconsole.py_ ，以默认端口即可连接正在运行中的 _API_ 服务进程：

```python
$ python pyconsole.py
Python 3.8.5 (default, Aug  5 2020, 18:49:57)
[GCC 5.4.0 20160609] on linux
Type "help", "copyright", "credits" or "license" for more information.
(ConsoleClient)
>>>
```

_pyconsole_ 用法跟 _Python_ 交互式终端一样，但代码执行环境是在被连接的服务进程里面，因此可以看到服务内部的实时状态。我们先通过 _dir_ 内建函数看看远程终端的名字空间都有些啥：

```python
>>> dir()
['__builtins__', '__doc__', '__name__', 'main', 'sys']
>>> main
<module '__main__' from 'service.py'>
>>> dir(main)
['Faker', 'FastAPI', '__annotations__', '__builtins__', '__cached__', '__doc__', '__file__', '__loader__', '__name__', '__package__', '__spec__', 'app', 'cache', 'faker', 'fetch_user_from_database', 'get_user', 'retrieve_user', 'start_console_server', 'uvicorn']
```

_main_ 就是服务的 ___main___ 模块，从中还可以找到 _service.py_ 导入的 _Faker_ 、_FastAPI_ 等，它定义的函数 _retrieve_user_ 、_get_user_ 等，还有作为全局变量存在的 _cache_ 字典。甚至，我们还可以看到 _cache_ 当前缓存了多少用户信息：

```python
>>> len(main.cache)
2
```

由于我们前面通过 _API_ 获取了 _2_ 条用户数据，因此 _cache_ 当前缓存了 _2_ 条数据。当我们再次访问接口获取其他用户数据时，我们会看到 _cache_ 缓存的用户数据会慢慢增加：

```python
>>> len(main.cache)
3
```

_pyconsole_ 是一个很神奇的终端，能够实时查看 _Python_ 进程里面各种数据的状态，在排查问题时非常方便！

## 内存测量

解决内存泄露问题，首先需要确认问题的存在性以及严重程度。程序它占用了多少内存？内存增长速度快吗？

在 _Linux_ 系统，可以执行 _ps_ 命令查看进程信息，从中可以看到内存占用量：

```bash
$ ps aux | grep python | grep service.py
fasion    6467  0.2  0.5 306600 44152 pts/2    Sl+  17:02   0:03 python service.py
```

我们重点关注 _VSZ_ 和 _RSS_ ，这两者是评价进程内存的重要指标，必要时请复习操作系统相关知识力求准确理解。

-   _VSZ_ ，程序虚拟内存空间大小；
-   _RSS_ ，程序占用的物理内存大小；

_ps_ 命令输出告诉我们，服务进程刚启动时，虚拟内存空间大小大概是 _306M_ ，占用物理内存大概 _44M_ 。看上去没问题，但进程内存会不会随着时间推移不断增长呢？

接下来，我们用 [ab](https://network.fasionchan.com/zh_CN/latest/performance/web-pressure-test.html) 命令向服务压大量请求，看看它有什么反应。先压 _1_ 万个请求试试看：

```
ab -n 10000 -c 100 http://127.0.0.1:8000/users/random
```

我们发现程序进程虚拟内存空间增长到 _327M_ ，而物理内存则增长到 _63M_ ，继续压请求发现内存还继续涨：