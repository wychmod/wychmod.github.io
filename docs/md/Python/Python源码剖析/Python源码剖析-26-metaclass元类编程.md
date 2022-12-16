在 _Python_ 类型系统中，**元类** ( _metaclass_ )占据着至关重要的位置。它提供了制造新类型的能力，为程序设计带来更多可能性。不少功能强大的开发框架，内部实现离不开元类的强力加持。

## \_\_new\_\_ 魔术方法

我们先考察 ___new___ 魔术方法，它负责为类创建实例对象。什么？实例对象不是由 ___init___ 魔术方法创建吗？为了拨开心中的迷雾，我们先将这两者的区别和联系搞清楚。

当我们调用类 _C_ 创建实例对象时，_Python_ 调用 _C.__new___ 魔法函数完成对象创建：

```
instance = C.__new__()
```

如果 _C_ 类并没有定义 ___new___ 方法，_Python_ 将使用父类的 ___new___ 方法。如果父类也没有实现该方法，_Python_ 将逐层上溯，直到终极父类 _object_ ，而 _object_ 提供了通用的 ___new___ 版本进行兜底。

将实例对象 _instance_ 返回给调用者之前，_C.__new___ 调用 _instance.__init___ 魔术方法对实例对象进行初始化：

```
instance.__init__()
```

-   ___new___ ，负责为创建实例对象(分配内存)；
-   ___init___ ，负责对实例对象进行初始化；

由于 ___init___ 魔术方法执行时，实例对象 _self_ 已经创建好了，因此无法对创建过程施加影响。另一方面，___new___ 魔术方法刚执行时，实例对象还未诞生，因此它不可能以实例方法的形式存在，只能以类方法的形式存在。

那么，有什么场景需要应用 ___new___ 魔术方法呢？——最典型的例子是：**单例模式** 的实现。

举个例子，假设我们有一个计数器类 _Counter_ 用于统计应用访问量：

```python
class Counter:

    def __init__(self):
        self.value = 0
        self.lock = Lock()

    def inc(self):
        with self.lock:
            self.value += 1
```

在程序很多地方都会调用计数器的 _inc_ 方法，对计数器进行自增：

```python
counter = Counter()
counter.inc()
```

由于计数器全局只需一个，我们希望把它做成单例。换句话讲，不管我们调用 _Counter_ 多少次，它都返回全局唯一的一个 _Counter_ 实例：

```python
>>> Counter() is Counter()
```

因此，当 _Counter_ 创建第一个实例后，我们需要将它记录起来；后续再调用 _Counter_ ，直接将其返回。结合 ___new___ 和 ___init___ 这两种魔术方法的运行机制，我们知道应该在 ___new___ 方法中做文章：

```python
class Counter:

    instance = None

    def __new__(cls, *args, **kwargs):
        if cls.instance is None:
            cls.instance = super().__new__(cls, *args, **kwargs)

        return cls.instance

    def __init__(self):
        self.value = 0
        self.lock = Lock()

    def inc(self):
        with self.lock:
            self.value += 1
```

我们引入类属性 _instance_ ，用于记录唯一的实例对象。在 ___new___ 方法中，我们先检查 _instance_ 属性：如果发现它尚未创建，则调用父类 ___new___ 方法进行创建；否则，直接将实例返回。

如果存在多个线程并发调用 _Counter_ 创建实例对象的情况，将产生 **竞争态** 。举个例子，假设两个线程同时检查了 _instance_ 属性，发现实例对象尚未创建，然后分头创建实例对象。

解决竞争态的手段也很简单，只需为 ___new___ 函数也加上一把锁，就像 _inc_ 方法一样：

```python
class Counter:

    lock = Lock()
    instance = None

    def __new__(cls, *args, **kwargs):
        with cls.lock:
            if cls.instance is None:
                cls.instance = super().__new__(cls, *args, **kwargs)

            return cls.instance

    def __init__(self):
        self.value = 0

    def inc(self):
        with self.lock:
            self.value += 1
```

注意到，例子将锁从实例属性，调整成类属性。这样一来，一把锁即可同时保护类方法( ___new___ )和实例方法( _inc_ )。

## metaclass

在 _Python_ 对象模型中，类型对象的类型是一个特殊的类型对象，称为 **元类** ( _metaclass_ )。元类可以看作一个类型工厂，可以制造新的类型对象。

_type_ 对象我们已经非常熟悉，它是 _Python_ 内置的元类，提供了制造新类型的最基本能力。我们编写自定义类时，正是它在背后默默工作。

元类引入了一种强大的魔力，但它的 **抽象性** 却令许多人为之却步。为此，我准备了一个非常典型的例子，力求将元类的原理一次性讲透。为尽量降低阅读难度，我对例子作了最大程度的简化。

假设我们正在设计了一个用于实现插件的基类，它提供了 _serve_forever_ 方法，具备根据指定时间间隔，循环执行 _process_ 处理函数的基础能力：

```python
import time

class BasePlugin:
    
    def __init__(self, interval):
        self.interval = interval
        
    def serve_forever(self):
        while True:
            self.process()
            time.sleep(self.interval)
```

当 _Python_ 执行这段代码时，最终调用 _type_ 对象完成 _BasePlugin_ 类对象的创建，伪代码大致是这样的：

```python
attrs = {
    '__init__': <function>,
    'serve_forever': <function>,
}

BasePlugin = type(name='BasePlugin', bases=(object,), attrs=attrs)
```

实际插件作为 _BasePlugin_ 的子类来组织，子类从基类继承了 _serve_forever_ 的能力，并在 _process_ 方法中实现具体处理逻辑：

```python
class BarPlugin(BasePlugin):

    def process(self):
        print('bar processing')
```

这时，确保子类 _BarPlugin_ 实现了 _process_ 方法就显得格外重要，只有满足这一点才算是一个合法的插件。

```python
class FaultPlugin(BasePlugin):

    def run(self):
        print('xxxx')
```

_FaultPlugin_ 就不是一个合法的插件，它没有实现 _process_ 方法。然而，_Python_ 默认无法发现这一点。

那么，有没有办法让 _Python_ 在创建新类时，自动检查它是否实现了某个方法呢？我们接着探索。

理所当然，_FaultPlugin_ 类是 _type_ 的实例对象，默认也是 _type_ 创建的：

```python
attrs = {
    'run': <function>
}

FaultPlugin = type(name='FaultPlugin', bases=(BasePlugin,), attrs=attrs)
```

但 _type_ 作为一个通用的元类，并不会帮我们检查 _attrs_ 属性空间，确保 _process_ 函数存在。

理论上，只要继承 _type_ 来实现新元类，并在子类中重写 _type_ 的默认行为，便可实现检查 _process_ 函数的目的。那么，有办法为自定义类指定元类吗？答案是肯定的——我们可以在类定义中通过 _metaclass_ 指定。

假设我们实现的新元类名为 _PluginMeta_ ，而 _BasePlugin_ 通过 _metaclass_ 参数指定以它为元类：

```python
class BasePlugin(metaclass=PluginMeta):
    
    def __init__(self, interval):
        self.interval = interval
        
    def serve_forever(self):
        while True:
            self.process()
            time.sleep(self.interval)
```

这意味着，_Python_ 在创建 _BasePlugin_ 类及子类对象时，将调用 _PluginMeta_ ，而不是直接调用 _type_ 了：

```python
attrs = {
    '__init__': <function>,
    'serve_forever': <function>,
}

BasePlugin = PluginMeta(name='BasePlugin', bases=(object,), attrs=attrs)
```

由于实例对象是 ___new___ 魔术方法负责创建的，因此我们需要覆写 _type_ 类的 ___new___ 方法：

```python
class PlulginMeta(type):

    def __new__(cls, name, bases, dct):
        if name != 'BasePlugin' and 'process' not in dct:
            raise TypeError('subclass {} should implement process method'.format(name))
        return super().__new__(cls, name, bases, dct)
```

在子类 ___new___ 方法，我们先检查属性空间字典。如果发现 _process_ 方法不存在，则直接抛出 _TypeError_ 异常。注意到，基类 _BasePlugin_ 没实现 _process_ 是正常的，我们通过类名判断，对它豁免检查。

现在，_Python_ 就像有了火眼金睛一样，能够轻松识别非法插件子类—— _FaultPlugin_ ：

```python
TypeError: subclass FaultPlugin should implement process method
```

1.  _FaultPlugin_ 继承于 _BasePlugin_ ，从中获得元类 _PluginMeta_ ；
2.  当 _Python_ 执行到 _FaultPlugin_ 定义时，调用 _PluginMeta_ 创建 _FaultPlugin_ 类对象；
3.  这时 _PluginMeta.__new___ 开始执行，它检查类属性空间中是否包含 _process_ 函数；
4.  由于 _FaultPlugin_ 未实现 _process_ 函数，_Python_ 将抛出 _TypeError_ 异常，正如代码中写的那样；
5.  正常情况下，_PluginMeta.__new___ 将调用基类版本，即 _type.__new___ 完成插件子类的创建；

现在，我们把所有研究成果整合起来，形成一个完整的例子：

```python
import time

class PlulginMeta(type):

    def __new__(cls, name, bases, dct):
        if name != 'BasePlugin' and 'process' not in dct:
            raise TypeError('subclass {} should implement process method'.format(name))
        return super().__new__(cls, name, bases, dct)

class BasePlugin(metaclass=PlulginMeta):

    def __init__(self, interval):
        self.interval = interval

    def serve_forever(self):
        while True:
            self.process()
            time.sleep(self.interval)

class BarPlugin(BasePlugin):

    def process(self):
        print('bar processing')

bar = BarPlugin(interval=5)

class FooPlugin(BasePlugin):

    def process(self):
        print('foo processing')

foo = FooPlugin(interval=5)

class FaultPlugin(BasePlugin):

    def run(self):
        print('xxxx')

fault = FaultPlugin(interval=5)
```

例子所涉及了 **类** 对象、**实例** 对象以及 **元类** 对象，不同对象间关系可归纳如下：

![](../../youdaonote-images/Pasted%20image%2020221217001949.png)

-   插件基类 _BasePlugin_ ，插件子类 _BarPlugin_ 、 _FooPlugin_ 均为元类 _PluginMeta_ 的实例；
-   元类 _PluginMeta_ 是 _type_ 的子类，同时也是 _type_ 的实例；
-   由于执行 _FaultPlugin_ 定义时抛了异常， _FaultPlugin_ 类实例胎死腹中，它的实例 _fault_ 更无从谈起；
-   建议关系图与 **对象模型** 部分的对照阅读，进一步体会元类 _PluginMeta_ 的位置、角色与作用；

> 自定义类型对象的实例，如果没有指定元类，应该是通过type的tp_call先后调用tp_new和tp_init完成实例的创建和初始化；如果类型对象指定了元类，就意味着是实例的创建是通过所指定元类的tp_call完成tp_new和tp_init函数指针的调用