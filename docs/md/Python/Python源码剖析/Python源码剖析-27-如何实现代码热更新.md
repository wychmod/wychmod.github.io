经过 _Python_ 虚拟机、函数机制和类机制的学习，我们对 _Python_ 程序执行过程的动态性已经了如指掌：

-   在运行时，_Python_ 可以动态创建 **函数** 对象；
-   在运行时，_Python_ 可以动态创建 **类** 对象；
-   在运行时，_Python_ 可以修改 **函数** 对象，改变它的行为；
-   在运行时，_Python_ 可以修改 **类** 对象，改变它的行为；
-   在运行时，_Python_ 可以动态编译代码并加入到虚拟机中执行；

借助这些特性，我们可以实现程序运行时动态更新代码，也就是 **代码热更新** ！

## 猴子补丁

**猴子补丁** ( _monkey patch_ )大家应该都听说过，这是一种在运行时添加、修改代码的技术，而无需修改源码。

json 序列化是一个很常见的操作，在 _Python_ 可以这样进行：

```python
import json
json.dumps(some_data)
```

_ujson_ 是另一个 _json_ 序列化实现，由纯 _C_ 语言编写，效率比标准库中的 _json_ 模块更高，用法一样：

```python
import ujson
ujson.dumps(some_data)
```

那么，如果想把整个程序中的 _json_ 操作都换成 _ujson_ ，该怎么办呢？

直接引用 _ujson_ 肯定是不行的，因为程序可能会引用第三方类库，我们肯定不想也不好改动第三方代码。以一个由 _flask_ 框架实现的 _api_ 为例，

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def some_api():
    return jsonify(some_data)
```

jsonify 函数用于响应 _json_ 数据，它调用标准库 _json_ 模块对数据进行 _json_ 序列化，可 _flask_ 并不是我们开发的。

好在，利用 _Python_ 执行过程的动态特性，我们可以在运行时替换 _json_ 模块的相关函数实现。下面，我们编写 _patch_json_ 函数，实现 _dumps_ 和 _loads_ 函数的替换：

```python
import json
import ujson

def patch_json()
    json.dumps = ujson.dumps
    json.loads = ujson.loads

patch_json()
```

这样一来，只要 _patch_json_ 函数成功执行，_json_ 模块中的 _dumps_ 、_loads_ 函数就被换成了 _ujson_ 版本。后续就算从 _json_ 模块导入，最终得到的也是 _ujson_ 版本！

![](../../youdaonote-images/Pasted%20image%2020221217010536.png)

需要特别注意，_json_ 模块属性在 _patch_json_ 调用前就被直接引入，将不受 _patch_json_ 控制：

```python
import json
from json import dumps

patch_json()

# 执行 json 模块原来的版本，而不是 ujson 版本
dumps(some_data)
# 执行 ujson 版本
json.dumps(some_data)
```

![](../../youdaonote-images/Pasted%20image%2020221217010731.png)

因此，许多应用猴子补丁的程序，在开头处便要执行替换逻辑，确保类似的现象不会发生。

猴子补丁的应用范围很广，一般用来特换类库实现或者在单元测试中进行 _mock_ 。诸如 _greenlet_ 采用猴子补丁将阻塞的库函数替换成非阻塞的版本：

```python
import gevent.monkey
gevent.monkey.patch_all()
```

由于猴子补丁可能会影响代码的可读性，应用不当可能导致一些奇怪的问题，因此不能滥用。

## reload

_reload_ 函数相信大部分读者也有所耳闻了，它用于重新加载模块。与 _Python 2_ 时代不同，_reload_ 在最新的 _Python_ 中不再作为内建函数存在了，而被移入标准库 _importlib_ 模块中。

假设我们有一个配置模块 _[config.py](http://config.py/)_ ，以变量形式定义着一些配置项：

```python
wx = 'coding-fan'
title = '小菜学编程'
```

在程序中，我们只需将 _config_ 模块导入，即可访问里面定义的每个配置项：

```python
>>> import config
>>> print(config.title)
小菜学编程
```

现在，我们编辑 _[config.py](http://config.py/)_ 文件，将配置进行调整：

```python
wx = 'fasionchan'
title = 'Python开发工程师'
```

如不做任何处理，程序无法获得调整后的配置，这一点都不意外：

```python
>>> print(config.title)
小菜学编程
```

想要获取最新的配置，我们只能让 _Python_ 重新加载 _config_ 。操作也不复杂，调用 _reload_ 函数即可：

```python
>>> import importlib
>>> importlib.reload(config)
<module 'config' from '/Users/fasion/config.py'>
```

重新加载 _config_ 模块后，我们成功获得最新配置，而程序完全无须重启！

```python
>>> print(config.title)
Python开发工程师
```

借助 _reload_ 函数，我们成功实现了一定程度的 **代码热更新** 能力！

利用操作系统文件事件通知机制，我们还可以让 _Python_ 在代码文件发生变化时自动加载新代码！

有个坏消息，不同操作系统实现文件事件通知机制的方式完全不同，因此需要对主流操作系统进行适配。幸好，已经有先行者为此开发了 _watchdog_ 包。我们只需用 _pip_ 安装 _watchdog_ ，即可站在巨人肩膀上开发。

```python
import importlib
import time
import os.path

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, LoggingEventHandler

import config

class CodeEventHandler(FileSystemEventHandler):

    def on_modified(self, event):
        if event.src_path == config.__file__:
            print('reloading config')
            importlib.reload(config)

def main():
    observer = Observer()
    observer.schedule(CodeEventHandler(), os.path.dirname(config.__file__), True)
    observer.start()

    while True:
        print('title:', config.title)
        time.sleep(5)

if __name__ == '__main__':
    main()
```

这个例子先实现文件事件处理类 _CodeEventHandler_ ，_on_modified_ 方法接收修改事件。如果被修改文件刚好是 _config_ 模块源码文件，我们调用 _importlib.reload_ 重新加载 _config_ 模块。

接着在 _main_ 函数，我们先初始化 _watchdog_ 观测器 _Observer_ ，然后启动它。这样一来，只要被观测路径上发生修改事件，_watchdog_ 将调用 _CodeEventHandler_ 对象的 _on_modified_ 。

注意到，我们不是直接观测 _[config.py](http://config.py/)_ 文件，而是递归观测其所在目录。如果直接观测目标文件，当它被删掉重建，便失去跟踪；相反，观测目标文件所在目录，重新创建的新文件也会得到跟踪。

最后，程序进入主题逻辑，例子用一个周期性输出配置值 _title_ 的循环来充当这个角色。

把这个程序跑起来后，它将不断输出 _config.title_ 的值；当 _[config.py](http://config.py/)_ 被修改后，它将输出 _reloading config_ ，并重新加载 config 模块。

现在，试着修改 _[config.py](http://config.py/)_ 中的 _title_ 变量，程序将自动生效，无须重启：

```python
title: Python开发工程师
reloading config
title: 小菜学编程
```

虽然例子中只涉及到一些简单的变量，但这种机制对诸如 **函数** 以及 **类** 等复杂对象也是支持的。接下来，我们将更进一步，充分认识 _reload_ 机制的局限性，并探索破解局限性的方案。

## reload 局限性

通过 _reload_ 函数重新加载模块，_Python_ 将以原模块对象属性空间为全局/局部名字空间，再次执行模块代码。这种行为将导致一些诡异的现象，我们接着讨论。

首先，旧模块变量不会被删除，除非在新模块代码中显式删除，这很好理解。

假设模块 _[mo.py](http://mo.py/)_ 原来有两个变量 _a_ 和 _b_ ：

```python
a = 1
b = 2
```

模块导入后删掉 _a_ 、修改 _b_ 并新增 _c_ ：

```python
b = 22
c = 3
```

_Python_ 重新加载模块 _mo_ 时，以原模块对象属性空间为局部名字空间，执行新的模块代码。模块代码对 _b_ 和 _c_ 进行赋值，这样变引入的新变量 _c_ ，变量 _a_ 却被遗忘了，继续残留在模块中。关于模块加载以及模块代码执行过程，请参考虚拟机部分相关章节。

不过，就算模块旧变量不删，最多也就是不够严谨而已，对于实现代码更新影响不大。

另一个局限性影响就大了，_reload_ 只会更新模块属性空间，对已暴露到外部的却无能为力。

```python
>>> from mo import b
>>> print(b)
2
```

这段代码将 _b_ 引入到当前局部名字空间，就不受模块 _mo_ 约束了。当我们修改模块并重新加载后，_b_ 保持不变：

```python
>>> importlib.reload(mo)
>>> print(b)
2
```