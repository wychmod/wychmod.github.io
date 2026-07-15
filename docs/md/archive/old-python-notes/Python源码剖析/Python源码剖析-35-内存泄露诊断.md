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

![](../../youdaonote-images/Pasted%20image%2020221218221525.png)

随着时间的推移，新请求不断达到，进程内存也在缓缓上升。不管内存上升速度多慢，程序最终必然翻车。建议利用监控系统，对重要服务进程内存进行监控，这样可以第一时间发现内存泄露问题：

![](../../youdaonote-images/Pasted%20image%2020221218221541.png)

回放历史数据，从中可以看出进程内存的长期增长趋势。通过分析长期趋势，甚至能够精准确定内存问题出现的时间点；结合当时变更情况，准确定位问题代码，事半功倍：

![](../../youdaonote-images/Pasted%20image%2020221218221555.png)

如上图，程序虚拟内存大小在某个时间点突然陡增。联系当时相关代码变更，定位问题更有针对性。

## objgraph

_objgraph_ 是一个用于勘察 _Python_ 内部对象的第三方模块，擅长绘制对象引用关系图以及排查内存泄露问题：

-   取出某种类型的所有实例对象 ( _by_type_ )；
-   统计程序中数量最多的对象，并排序 ( _show_most_common_types_ )；
-   绘制对象引用关系图 ( _show_refs_ )；
-   绘制反向引用关系图 ( _show_backrefs_ )；
-   _etc_

开始使用之前，我们先通过 _pip_ 来安装，确保 _service.py_ 服务进程可以导入该模块：

```python
$ pip install objgraph
```

安装完毕后，我们回到 _pyconsole_ 远程终端，在服务进程中导入 _objgraph_ ：

```python
>>> import objgraph
```

现在，我们先调用 _show_most_common_types_ 函数，统计数量最多的对象类型：

```python
>>> objgraph.show_most_common_types()
dict                 16482
method               8189
function             7095
list                 6632
tuple                4797
deque                4670
Event                3112
weakref              2307
AsyncExitStack       1554
RequestResponseCycle 1553
```

我们看到，程序中 _dict_ 对象最多，总过有 _16000_ 多个，_method_ 对象次之。一般而言，存在内存泄露的程序，内部会有大量的某种对象。如果发现某个类的对象特别多，问题就可以缩小到与该类相关的代码逻辑。

由于我们的程序没有定义类，因此这里看到的大部分对象都是内建类型，没有足够特异性。那是不是就无解了呢？

肯定不是的。由于泄露的大量对象一定是保存在某种容器中，因此程序中应该有某个容器对象长度特别长。只要找到这个容器对象，问题也就解决了。那么，如何找到这个关键对象呢？

常用的容器对象无非 _tuple_ 、_list_ 、_dict_ 这几个，我们只需将这几个种类的对象找到即可。_objgraph_ 有一个函数 _by_type_ ，用于获取某个种类的对象，刚好可以派上用场。我们先将程序中所有 _tuple_ 对象找出来：

```python
>>> tuples = objgraph.by_type('tuple')
>>> len(tuples)
4425
```

如此一来，我们可以写一个函数将长度最长的给定类型对象找出来：

```python
def get_max_instance(type_name):
    # 取出所有实例
    instances = objgraph.by_type(type_name)
    if not instances:
        return
    
    # 临时记录最大大小
    maxsize = 0
    max_one = None
    
    # 遍历实例
    for instance in instances:
        size = len(instance)
        if size > maxsize:
            maxsize = size
            max_one = instance
    
    return max_one
```

接着，我们将每种容器中，长度最大的对象找出来：

```python
>>> max_tuple = get_max_instance('tuple')
>>> len(max_tuple)
42
>>> max_list = get_max_instance('list')
>>> len(max_list)
65535
>>> max_dict = get_max_instance('dict')
>>> len(max_dict)
85865
```

最大的 _tuple_ 长度只有 _42_ ，肯定与问题无关；剩下的 _list_ 和 _dict_ ，_dict_ 更大一点，严重怀疑它。先来看看它里面都保存着什么东西：

```python
>>> for k, v in max_dict.items():
...     break
...
>>> k
'956712794f14a1377352f77c844c89fe75c96fb1bf7cd3220e11e31ff8761d67'
>>> v
{'user_id': '956712794f14a1377352f77c844c89fe75c96fb1bf7cd3220e11e31ff8761d67', 'name': 'Luis Lewis', 'email': 'tammyhale@yahoo.com', 'address': '24043 Javier Summit Apt. 283\nEdwardchester, CA 19580', 'desc': 'Trip alone material because doctor. Story play night between entire interview as dog.\nMeasure actually law high. Discussion at project would argue knowledge land direction.'}
```

由于我们的服务程序非常简单，以 _ID_ 为 _key_ ，以用户信息为 _value_ 的字典就只有 _cache_ 了。由此，我们发现了问题的所在，正是 _cache_ 字典长度不断增长，导致服务占用内存越来越多。

再退一步，如果服务逻辑非常复杂，无法肉眼看出这个巨大的 _dict_ 是什么东西，又该如何定位问题呢？莫慌，_objgraph_ 可以帮忙找出引用这个 _dict_ 的地方：

```python
>>> chain = objgraph.find_backref_chain(max_dict, objgraph.is_proper_module)
```

_find_backref_chain_ 函数将找出 _max_dict_ 对象的反向引用链，引用链以 _list_ 的形式返回。_is_proper_module_ 告诉它，当回溯遇到模块对象后，停止搜索。_Python_ 模块对象辨识度很高，从模块对象出发，沿着引用链即可发现 _max_dict_ 的来龙去脉。

在这个例子，引用链非常简单，只有区区 _3_ 个节点：

```python
>>> len(chain)
3
>>> chain[-1] is max_dict
True
```

其中，最后一个节点就是我们要定位的 _max_dict_ 字典；第一个节点是 ___main___ 模块。由此，我们可以断定： _max_dict_ 是 ___main___ 模块中的某个属性，而第二个节点就是 ___main___ 模块的属性空间：

![](../../youdaonote-images/Pasted%20image%2020221218222627.png)

如果引用链较长，建议将它画在一个图片上进行分析，更为直观。_objgraph_ 内置生成图片的功能，不过需要先安装 _graphviz_ 以及 _xdot_ 这两个依赖。注意 _graphviz_ 与 _xdot_ 不同，它不是 _Python_ 包，以 _Ubuntu_ 为例用 _apt_ 安装：

```python
$ apt install graphviz
$ pip install xdot
```

依赖安装完毕后，调用 _show_chain_ 函数进行绘图，_filename_ 参数指定图片名字：

```python
>>> objgraph.show_chain(chain, filename='chain.png')
Graph written to /tmp/objgraph-szst76n5.dot (3 nodes)
Image generated as chain.png
```

由于我们通过远程终端在服务进程内部执行代码，因此生成的图片被保存在服务进程工作目录。它大致是这样的：

![](../../youdaonote-images/Pasted%20image%2020221218222925.png)

如果模块对象非常复杂，包含很多字典属性，难以区分。我们就只能逐个遍历对比，才能确定问题属性：

```python
>>> module, attrs = chain[:2]
>>> for name, value in attrs.items():
...     if value is max_dict:
...         print(name)
...         break
...
cache
```

至此，通过种种手段，我们已经百分之百确定 —— 问题字典就是 ___main___ 模块中用于缓存数据的 _cache_ ：

```python
>>> max_dict is main.cache
True
```

## 未雨绸缪

扁鹊曰：长兄于病视神，未有形而除之，故名不出于家。所谓解决患难者强，防患于未然者神。那么，对于内存泄露隐患，是否也能够做到防范于未然呢？答案是肯定的。

首先，针对造成内存泄露的根源，我们在写代码时要时刻牢记以下两点：

-   往容器添加元素时，要考虑退出 (删除) 机制；
-   慎用 ___del___ 魔术方法；

其次，做好程序内存监控。将程序占用内存大小，每种容器对象的最大长度等关键指标提交到监控系统，并绘制趋势图。这样一来，趋势图可以帮我们发现一些潜在的问题，将它解决在爆发前夜。此外，每次服务变更时，勿忘关注内存使用趋势，异常可在第一时间发现。

最后，我们还可以事先在程序中定义一些常用工具函数。一旦程序出现内存泄露问题，我们可以通过远程终端连上服务进程实时诊断，这些工具函数将极大加速问题定位的速度。下面是一个例子：

```python
import objgraph
import random


def show_instance_randomly(type_name):
    # 类型名及图片输出路径
    type_name = str(type_name)
    filename = '/tmp/%s.png' % (type_name,)
    
    # 取出所有实例
    instances = objgraph.by_type(type_name)
    if not instances:
        return
    
    # 随机取出一个实例
    instance = random.choice(instances)
    
    # 画反向引用图
    objgraph.show_backrefs([instance], filename=filename)


def get_max_instance(type_name):
    # 取出所有实例
    instances = objgraph.by_type(type_name)
    if not instances:
        return
    
    # 临时记录最大大小
    maxsize = 0
    max_one = None
    
    # 遍历实例
    for instance in instances:
        size = len(instance)
        if size > maxsize:
            maxsize = size
            max_one = instance
    
    return max_one


def show_max_instance(type_name):
    # 类型名及图片输出路径
    type_name = str(type_name)
    filename = '/tmp/max_%s.png' % (type_name,)
    
    # 找出最大实例
    max_one = get_max_instance(type_name=type_name)
    
    # 反向引用图
    objgraph.show_backrefs([max_one], filename=filename)
```

-   _show_instance_randomly_ ，随机取出一个指定类型对象，生成反向引用图，保存在 _/tmp_ 目录；
-   _get_max_instance_ ，搜索长度最大的指定类型容器对象；
-   _show_max_instance_ ，搜索长度最大的指定类型容器对象，生成反向引用图，保存在 _/tmp_ 目录；