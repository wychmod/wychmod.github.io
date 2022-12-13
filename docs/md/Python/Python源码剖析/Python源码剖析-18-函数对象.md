**函数** ，作为计算机程序中 **抽象执行流程** 的基本单位，在 **功能分解** 、 **代码复用** 等方面发挥着至关重要的作用。_Python_ 中的函数，相信你一定不会陌生：

```python
>>> pi = 3.14
>>> def circle_area(r):
...     return pi * r ** 2
...
>>> circle_area(2)
12.56
```

这段代码将圆面积计算功能组织成一个函数 _circle_area_ ，圆半径 _r_ 以参数形式作为输入，函数负责计算面积，并将结果作为返回值输出。这样一来，任何需要计算圆面积的地方，只需要调用 _circle_area_ 即可，达到了功能分解以及代码复用的目的。

我们知道 _Python_ 中一切都是对象，函数也是一种对象。那么，作为一等对象的函数，到底长什么模样，有什么特殊行为呢？_Python_ 代码又是如何一步步变身为函数对象的呢？洞悉函数秘密后，可以实现哪些有趣的功能呢？带着这些疑问，我们开始探索函数对象。

## 函数对象长啥样

首先，借助内建函数 _dir_ 观察函数对象，发现了不少新属性：

```python
>>> dir(circle_area)
['__annotations__', '__call__', '__class__', '__closure__', '__code__', '__defaults__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__get__', '__getattribute__', '__globals__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__kwdefaults__', '__le__', '__lt__', '__module__', '__name__', '__ne__', '__new__', '__qualname__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__']
```

通过名字，我们可以猜测出某些字段的功能。 ___code___ 应该是一个 **代码对象** ，里面保存着函数的 **字节码** 。从字节码中，我们可以清晰地读懂函数的执行逻辑，跟 _Python_ 语句表达的意思一模一样：

```python
>>> circle_area.__code__
<code object circle_area at 0x10d52d270, file "<stdin>", line 1>
>>> import dis
>>> dis.dis(circle_area.__code__)
  2           0 LOAD_GLOBAL              0 (pi)
              2 LOAD_FAST                0 (r)
              4 LOAD_CONST               1 (2)
              6 BINARY_POWER
              8 BINARY_MULTIPLY
             10 RETURN_VALUE
```

又如， ___globals___ 顾名思义应该是函数的全局名字空间，全局变量 _pi_ 的藏身之地。

```python
>>> circle_area.__globals__
{'__name__': '__main__', '__doc__': None, '__package__': None, '__loader__': <class '_frozen_importlib.BuiltinImporter'>, '__spec__': None, '__annotations__': {}, '__builtins__': <module 'builtins' (built-in)>, 'pi': 3.14, 'circle_area': <function circle_area at 0x10d573950>, 'dis': <module 'dis' from '/usr/local/Cellar/python/3.7.2_2/Frameworks/Python.framework/Versions/3.7/lib/python3.7/dis.py'>}
```

确实如此， _pi_ 的出现证实了我们的猜测。由于 _pi_ 是在 ___main___ 模块中定义的，保存在模块的属性空间内。那么， ___globals___ 到底是模块属性空间本身，还是它的一个拷贝呢？我们接着观察：

```python
>>> circle_area.__globals__ is sys.modules['__main__'].__dict__
True
```

注意到， _sys.modules_ 保存着 _Python_ 当前所有已导入的模块对象，包括 ___main___ 模块。我们取出 ___main___ 模块的属性空间 ___dict___ 与函数全局名字空间对比，发现他们是同一个 _dict_ 对象。原来函数全局名字空间和模块属性空间就是这样紧密绑定在一起的！

此外，我们还可以找到函数名以及所属模块名这两个字段：

```python
>>> circle_area.__name__
'circle_area'
>>> circle_area.__module__
'__main__'
```

函数对象关键属性整理如下：