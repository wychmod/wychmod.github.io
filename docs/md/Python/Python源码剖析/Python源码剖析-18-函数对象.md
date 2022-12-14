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

![](../../youdaonote-images/Pasted%20image%2020221213205649.png)

![](../../youdaonote-images/Pasted%20image%2020221213205701.png)

## 函数对象如何创建

我们已经初步看清 **函数** 对象的模样，它和 **代码** 对象关系密切，**全局名字空间** 就是它所在 **模块** 对象的 **属性空间**。那么，_Python_ 又是如何完成从代码到函数对象的转变的呢？想了解这其中的秘密，还是得从字节码入手。

现在我们要想方设法搞到定义函数的字节码，先将函数代码作为文本保存起来：

```python
>>> text = '''
... pi = 3.14
... def circle_area(r):
...     return pi * r ** 2
... '''
```

然后，调用 compile 函数编译函数代码，得到一个 **代码** 对象：

```python
>>> code = compile(text, 'test', 'exec')
```

根据 **虚拟机** 部分的学习，我们知道 **作用域** 与 **代码** 对象之间的一一对应的关系。定义函数的这段代码虽然简短，里面却包含了两个不同的 **作用域** ：一个是模块级别的 **全局作用域** ，一个函数内部的 **局部作用域** ：

![](../../youdaonote-images/Pasted%20image%2020221214113359.png)

那么，为啥 _compile_ 函数只返回一个代码对象呢？因为局部代码对象作为一个 **常量** ，藏身于全局代码对象中。而 _compile_ 函数则只需返回全局代码对象：

```python
>>> code.co_names
('pi', 'circle_area')
>>> code.co_consts
(3.14, <code object circle_area at 0x10e179420, file "test", line 3>, 'circle_area', None)

>>> code.co_consts[1]
<code object circle_area at 0x10e179420, file "test", line 3>
>>> code.co_consts[1].co_names
('pi',)
>>> code.co_consts[1].co_consts
(None, 2)
```

![](../../youdaonote-images/Pasted%20image%2020221214113641.png)

函数对象诞生的秘密就藏在 _MAKE_FUNCTION_ 指令中。

开始深入源码研究 _MAKE_FUNCTION_ 指令前，我们先推演一遍虚拟机执行这段字节码的全过程。假设 _circle_area_ 在 ___main___ 模块中定义，全局代码对象则作为模块代码执行，以模块 **属性空间** 为 **全局名字空间** 和 **局部名字空间** 。前两行字节码与函数创建无关，在将 _3.14_ 作为 _pi_ 值保存到 **局部名字空间** ，它也是模块的 **属性空间** ：

![](../../youdaonote-images/Pasted%20image%2020221214114034.png)

接下来两行字节码将两个常量加载到栈顶，为创建函数做最后的准备：

![](../../youdaonote-images/Pasted%20image%2020221214114423.png)

这两个常量是创建函数最重要的参数，一个指定函数的 **代码** 对象，一个指定 **函数名** 。 _MAKE_FUNCTION_ 字节码从栈顶取出这两个参数，完成 **函数** 对象的创建，并将其放置于栈顶。此外，函数对象继承了当前 **帧** 对象的 **全局名字空间** 。因此， _circle_area_ 不管在何处调用，其全局名字空间一定是就是它所在模块 ( ___main___ ) 的 **属性空间** 。

