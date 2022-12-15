## 真题讲解

**1. Python 中有几个名字空间，分别是什么？Python 变量以什么顺序进行查找？**

_Python_ 总共有 _4_ 个名字空间：

-   **局部名字空间** ( _locals_ )
-   **闭包名字空间** ( _closures_ )
-   **全局名字空间** ( _globals_ )
-   **内建名字空间** ( _builtin_ )

_Python_ 查找变量时，依次检查 **局部** 、 **闭包** 、 **全局** 、 **内建** 这几个名字空间，直到变量被找到为止。更多详情，请参考虚拟机部分 **作用域** 与 **名字空间** 以及函数机制部分 **函数调用** 相关章节。

**2. 如何在一个函数内部修改全局变量？**

在函数内部用 _global_ 关键字将变量声明为全局，然后再进行修改：

```python
>>> a = 1
>>> def func():
...     global a
...     a = 2
...
>>> print(a)
1
>>> func()
>>> print(a)
2
```

**3. 不使用 def 关键字的话，还有什么办法可以创建函数对象？**

根据 _Python_ 对象模型，实例对象可以通过调用类型对象来创建。而函数类型对象，理论上可以通过函数对象找到：

```python
>>> def a():
...     pass
...
>>> function = a.__class__
>>> function
<class 'function'>
```

实际上，_Python_ 将函数类型对象暴露在 _types_ 模块中，可通过模块属性 _FunctionType_ 访问到：

```python
>>> from types import FunctionType
>>> FunctionType is function
True
```

函数对象包含以下要素，只要将这些要素备齐，即可调用函数类型对象创建新函数：

-   _code_ ，代码对象；
-   _globals_ ，全局名字空间；
-   _name_ ，函数名；
-   _argdefs_ ，默认参数值；
-   _closure_ ，闭包变量；

我们定义一个函数用于试验，它设置全局变量 _value_ ：

```python
>>> def set_global_value(v):
...     global value
...     value = v
...
```

一开始全局名字空间并没有变量 _value_ ，经过 _set_global_value_ 函数设置后便可找到：

```python
>>> value
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'value' is not defined
>>> set_global_value(10)
>>> value
10
>>> set_global_value(20)
>>> value
20
```

接下来，我们借助函数类型对象，创建一个与 _set_global_value_ 类似的新函数 _sgv_ ，只不过全局名字空间与我们指定的字典对象 _g_ 绑定：

```python
>>> g = {}
>>> sgv = FunctionType(set_global_value.__code__, g, 'sgv')
```

这样一来，调用 _sgv_ 函数设置的全局变量，将保存在指定的全局名字空间，即字典 _g_ 中：

```python
>>> g
{}
>>> sgv(10)
>>> g
{'value': 10}
>>> sgv(20)
>>> g
{'value': 20}
```

这个例子纯粹为了演示如何通过函数类型对象创建新函数，虽不具备实际项目用途，但对理解函数运行机制很有帮助。

**4. 请介绍装饰器的运行原理，并说说你对 @xxxx 这种写法的理解？**

装饰器用于包装函数对象，以达到修改函数行为的目的。

装饰器是可调用对象，一般是函数，它接收被装饰函数 _wrapped_ 作为参数，并返回包装后的函数。开发装饰器时，一般在装饰器内部定义一个嵌套函数 _proxy_ 作为代理，_proxy_ 通过闭包变量可以引用被包装函数 _wrapped_ 。

```python
def decorator(wrapped):
    def proxy(*args, **kargs):
        # 在这里调用被装饰函数wrapped
        # 调用前后可以做一些额外的事情，
        # 达到修改 wrapped 函数行为的目的

    return proxy
```

嵌套函数 _proxy_ 是实现装饰器的关键，它调用 _wrapped_ 函数完成工作，调用前后可以做一些影响 _wrapped_ 行为的事情。最后，_proxy_ 函数作为包装结果返回给调用者。

而 _@xxxx_ 只是一个简单的语法糖，表示用 _xxxx_ 装饰器修改被包装函数，与直接调用 _xxxx_ 没什么区别。

```python
@xxxx
def foo():
    pass
def foo():
    pass

foo = xxxx(foo)
```

因此，上面这两种不同的写法是等价的。在字节码层面，我们可以证实这一点：

```python
>>> import dis
>>> text = '''
... @xxxx
... def foo():
...     pass
... '''
>>> dis.dis(compile(text, '', 'exec'))
  2           0 LOAD_NAME                0 (xxxx)
              2 LOAD_CONST               0 (<code object foo at 0x101037ed0, file "", line 2>)
              4 LOAD_CONST               1 ('foo')
              6 MAKE_FUNCTION            0
              8 CALL_FUNCTION            1
             10 STORE_NAME               1 (foo)
             12 LOAD_CONST               2 (None)
             14 RETURN_VALUE

Disassembly of <code object foo at 0x101037ed0, file "", line 2>:
  4           0 LOAD_CONST               0 (None)
              2 RETURN_VALUE
```

偏移量为 _6_ 的字节码 _MAKE_FUNCTION_ 完成 _foo_ 函数创建，而偏移量为 _8_ 的字节码 _CALL_FUNCTION_ 则调用了 _xxxx_ 装饰器函数对 _foo_ 函数进行装饰。

虽然 _@xxxx_ 语法与直接调用装饰器实际效果是一样的，但代码更为简洁，逻辑也更为清晰。

广义的装饰器不仅可以用来修改函数，还可以用来修改类 —— 接收被装饰的类作为参数，返回包装后的类作为结果。另外，装饰器也不一定要对函数进行修改。例如 _register_ 装饰器，它将函数注册到某个地方，然后原样返回：

```python
def register(func):
    # 将func注册到某个地方
    # ...

    return func
```

不少 _Web_ 框架正是利用这个特性，优雅地进行实现路由注册。 _flask_ 就是其中一例：

```python
@app.route('/')
def index():
    pass
```

**5. 请设计一个装饰器，在函数执行时间超过指定值时输出日志**

```python
# Case A
# 函数执行超过5秒输出日志
@log_show_call(seconds=5)
def some_func():
    # ...

# Case B
# 默认函数执行超过10秒输出日志
@log_slow_call
def some_func():
    # ...
```

经过《令人叹为观止的装饰器》一节的学习，相信不难写出答案。

前面介绍的方案不是最优版本，我还卖了个关子，现在终于可以揭晓谜底了！答案如下：

```python
def log_slow_call(wrapped=None, seconds=10):
    
    if wrapped is None:
        def another_decorator(wrapped):
            return log_slow_call(wrapped, seconds)
        return another_decorator
    
    def proxy(*args, **kwargs):
        start_time = time.time()
        result = wrapped(*args, **kwargs)
        expired = time.time() - start_time
        if expired > seconds:
            logging.warning('call {} expires {} seconds'.format(wrapped.__name__, expired))
        return result
    
    return proxy
```

先说场景 _B_ ，_Python_ 将调用 _log_slow_call(some_func)_ ，因此 _wrapped_ 参数是 _some_func_ ，_seconds_ 参数是默认值 _10_ 。由于 _wrapped_ 非 _None_ ，_log_slow_call_ 直接返回 _proxy_ 代理函数作为包装结果。

_proxy_ 通过闭包与 _wrapped_ 和 _seconds_ 变量绑定，而 _seconds_ 参数是默认值 _10_ ，因此被包装函数 _some_func_ 执行超过 _10_ 秒就输出日志。

而在场景 _A_ ，当我们调用 _log_slow_call(seconds=5)_ 时，由于被装饰函数没有提供，因此它不是用来装饰函数。相反，它用于生成新装饰器 _another_decorator_ ，新装饰器通过闭包与指定的参数 _seconds=5_ 绑定。

当我们用新装饰器 _another_decorator_ 装饰函数 _some_func_ 时，它再次调用 _log_slow_call_ 生成 _proxy_ 函数。注意到，它调用 _log_slow_call_ 时， 将变量 _wrapped=some_func_ 以及闭包变量 _seconds=5_ 作为参数传进去。

_proxy_ 同样通过闭包与 _wrapped_ 和 _seconds_ 变量绑定，而 _seconds_ 参数是 _5_ ，因此被包装函数 _some_func_ 执行超过 _5_ 秒就输出日志。

除了这两种用法，_log_slow_call_ 还支持另一种用法，留待亲自行推演：

```python
@log_slow_call()
def some_func():
    # ...
```

由此，我们得到一个比前一节更精炼的实现方案。由此可见，对优雅代码的追求是无止境的～

**6. Python 中的闭包变量可以被内部函数修改吗？**

我们通过一个简单的例子，来考察闭包变量的行为：

```python
def counter():
    value = 0

    def get():
        return value

    def inc():
        nonlocal value
        value += 1

    return get, inc
```

_couter_ 函数用闭包实现了自增计数器，返回两个 _get_ 以及 _inc_ 函数，分别用于获取数值以及自增：

```python
>>> get, inc = counter()
>>> get()
0
>>> inc()
>>> get()
1
```

两个内部函数通过闭包访问定义在外层函数 _counter_ 中的 _value_ 变量：

-   _get_ 函数体没有对 _value_ 进行赋值，因此 _value_ 不是局部变量，编译器将其与外层函数的 _value_ 绑定；
-   _inc_ 函数对 _value_ 进行赋值，因此需要通过 _nonlocal_ 将它申明为闭包变量，否则编译器将把它当做局部变量；

因此，通过 _nonlocal_ 关键字，_Python_ 是可以修改闭包变量的。注意到，_nonlocal_ 是 _Python 3_ 才引入的关键字，_Python 2_ 没提供改关键字，也就无法修改闭包变量了。

至于某个变量属于哪个名字空间，由以下规则决定：

-   如果变量被 _global_ 或者 _nonlocal_ 关键字申明，那么它就是 **全局变量** 或者 **闭包变量** ；
-   如果变量在当前名字空间中被赋值，它属于当前名字空间；
-   如果变量在当前名字空间中未被赋值，它属于外层名字空间；

**7. 请描述执行以下程序将输出什么内容？并试着解释其中的原因。**

```python
def add(n, l=[]):
    l.append(n)
    return l

print(add(1))
print(add(2))
print(add(3))
```

程序执行结果如下：

```python
[1]
[1, 2]
[1, 2, 3]
```

这有点令人丈二和尚摸不着头脑，明明默认参数是一个空列表，为什么第 _2_ 、 _3_ 次调用后，列表都比预期中多一些数值呢？这一切得从 _Python_ 函数的运行机制说起 —— _Python_ 函数默认参数是如何实现的？

_Python_ 函数在创建时便完成了默认参数的初始化，并保存在函数对象的 ___defaults___ 字段中：

```python
>>> add.__defaults__[0]
[]
```