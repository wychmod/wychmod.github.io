## 场景

假设我们有一些工作函数，用来对数据进行不同的处理：

```python
def work_bar(data):
    pass

def work_foo(data):
    pass
```

如果我们想在函数调用前后输出日志，该怎么办？

## 古典工艺

最直接的做法，是在函数调用前后加上打日志的语句：

```python
logging.info('begin call work_bar')
work_bar(1)
logging.info('call work_bar done')
```

试想，如果程序中有多处 _work_bar_ 函数调用会怎样呢？想想就怕！

## 函数封装

古典工艺比较原始，每次函数调用都要写一遍 _logging_ ，引入太多代码冗余。我们知道，函数是程序逻辑封装和代码复用的基本单位。借助函数，我们可以把 _logging_ 与函数调用作为一个整体封装起来复用，以此消除冗余：

```python
def smart_work_bar(data):
    logging.info('begin call: work_bar')
    work_bar(data)
    logging.info('call doen: work_bar')
```

这样一来，我们只需调用 _smart_work_bar_ 即可：

```python
smart_work_bar(some_data)

# others...

smart_work_bar(another_data)
```

## 通用闭包

函数封装方案看上去已经很科学了，但美中存在不足。举个例子，当 _work_foo_ 调用前后也需要打日志时，我们还需要再实现一个新函数 _smart_work_foo_ ，尽管它的功能与 _smart_work_bar_ 并无二致！

我们观察发现， _smart_work_bar_ 与 _smart_work_foo_ 这两个函数的不同之处只是内部调用的函数不同。利用先前学到的 **闭包** 知识，我们实现 _log_call_ 函数，将被调用函数参数化：

```python
def log_call(func):
    def proxy(*args, **kwargs):
        logging.info('begin call: {name}'.format(name=func.__name__))
        result = func(*args, **kwargs)
        logging.info('call done: {name}'.format(name=func.__name__))
        return result
    return proxy
```

_log_call_ 函数接收一个函数对象 _func_ 作为参数，这是被代理函数；然后返回一个代理函数，即 _proxy_ 函数。当代理函数 _proxy_ 被调用时，先输出日志，然后调用被代理函数 _func_ ，调用完毕后再输出日志，最后返回调用结果。 这样一来，不就达到通用化的目的了吗？——对于任意被代理函数 _func_ ， _log_call_ 均可轻松应对。

```python
smart_work_bar = log_call(work_bar)
smart_work_foo = log_call(work_foo)

smart_work_bar(some_data)
smart_work_foo(some_data)

# others...

smart_work_bar(another_data)
smart_work_foo(another_data)
```

第 _1_ 行中， _log_call_ 接收参数 _work_bar_ ，返回一个代理函数 _proxy_ ，并赋给 _smart_work_bar_ 。 第 4 行中，调用 _smart_work_bar_ ，也就是代理函数 _proxy_ ；代理函数先输出日志，然后调用 _func_ 也就是 _work_bar_ ；最后再输出日志。 注意到，代理函数中， _func_ 与传进去的 _work_bar_ 对象紧紧关联在一起了，这就是 **闭包** 。

顺便提一下，可以覆盖被代理函数名，毕竟以 _smart__ 为前缀取新名字还是显得有些累赘：

```python
work_bar = log_call(work_bar)
work_foo = log_call(work_foo)

work_bar(some_data)
work_foo(some_data)
```

## 语法糖

先回顾下面这段代码：

```python
def work_bar(data):
    pass
work_bar = log_call(work_bar)


def work_foo(data):
    pass
work_foo = log_call(work_foo)
```

虽然代码没有什么冗余了，但是看是去还是不够直观。这时候，语法糖来了！

```python
@log_call
def work_bar(data):
    pass
```

请注意，开始 **划重点啦** ！你可以这样认为： _@log_call_ 这行代码的作用只是告诉 _Python_ 编译器，在函数定义后面插入代码 _work_bar = log_call(work_bar)_ ，仅此而已。不信？我们拿字节码说话！

## 字节码

对上面这个装饰器版的 _work_bar_ 函数代码进行编译，我们可以得到这样的字节码：

```python
  2           0 LOAD_NAME                0 (log_call)
              2 LOAD_CONST               0 (<code object work_bar at 0x100cf2d20, file "<dis>", line 2>)
              4 LOAD_CONST               1 ('work_bar')
              6 MAKE_FUNCTION            0
              8 CALL_FUNCTION            1
             10 STORE_NAME               1 (work_bar)
             12 LOAD_CONST               2 (None)
             14 RETURN_VALUE
```

经过前面章节的学习，相信你对这些字节码已经非常熟悉了。接着，我们将虚拟机执行字节码的过程推演一番：

![](../../youdaonote-images/Pasted%20image%2020221215162216.png)
1.  第一条字节码将 _log_call_ 函数加载进当前执行栈栈顶；
2.  第二、三条字节码将 _work_bar_ 代码对象和 _work_bar_ 函数名加载到栈顶，为创建 _work_bar_ 函数做好准备；
3.  第四条字节码完成 _work_bar_ 函数创建，该字节码执行完毕后，_work_bar_ 函数便位于栈顶；
4.  第五条字节码则以 _work_bar_ 为参数调用 _log_call_ 函数，并将 _log_call_ 返回的 _proxy_ 函数保存于栈顶；
5.  接下来的 _STORE_NAME_ 从栈顶取出 _proxy_ 函数并保存到当前局部名字空间，它一般也是模块的属性空间；

## 求值装饰器

先来猜猜装饰器 _eval_now_ 有什么作用？

```python
def eval_now(func):
    return func()
```

看上去好奇怪哦，装饰器内部没有定义代理函数，算装饰器吗？

```python
>>> @eval_now
... def foo():
...     return 1
...
>>> print(foo)
1
```

这段代码输出 _1_ ，也就是对函数进行调用求值。 那么，这种写法到底有什么用呢？直接写 _foo = 1_ 不行么？ 在这个简单的例子，这样写当然也是可以的。如果是更复杂的场景，就另当别论了。例如，初始化一个日志对象：

```python
# some other code before...

# log format
formatter = logging.Formatter(
    '[%(asctime)s] %(process)5d %(levelname) 8s - %(message)s',
    '%Y-%m-%d %H:%M:%S',
)

# stdout handler
stdout_handler = logging.StreamHandler(sys.stdout)
stdout_handler.setFormatter(formatter)
stdout_handler.setLevel(logging.DEBUG)

# stderr handler
stderr_handler = logging.StreamHandler(sys.stderr)
stderr_handler.setFormatter(formatter)
stderr_handler.setLevel(logging.ERROR)

# logger object
logger = logging.Logger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(stdout_handler)
logger.addHandler(stderr_handler)

# again some other code after...
```

借助 _eval_now_ 装饰器，我们的 _logger_ 对象还可以这样来写：

```python
# some other code before...

@eval_now
def logger():
    # log format
    formatter = logging.Formatter(
        '[%(asctime)s] %(process)5d %(levelname) 8s - %(message)s',
        '%Y-%m-%d %H:%M:%S',
    )

    # stdout handler
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)
    stdout_handler.setLevel(logging.DEBUG)

    # stderr handler
    stderr_handler = logging.StreamHandler(sys.stderr)
    stderr_handler.setFormatter(formatter)
    stderr_handler.setLevel(logging.ERROR)

    # logger object
    logger = logging.Logger(__name__)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(stdout_handler)
    logger.addHandler(stderr_handler)

    return logger

# again some other code after...
```

两段代码要达到的目的是一样的，但是后者显然更清晰，颇有独立 **代码块** 的风范。 更重要的是，日志对象在函数局部名字空间完成初始化，避免临时变量(如 _formatter_ 等)污染外部的名字空间，特别是全局名字空间。

## 带参数装饰器

定义一个装饰器，用于记录慢函数调用：

```python
def log_slow_call(func):
    def proxy(*args, **kwargs):
        start_ts = time.time()
        result = func(*args, **kwargs)
        end_ts = time.time()

        seconds = end_ts - start_ts
        if seconds > 1:
        logging.warn('slow call: {name} in {seconds}s'.format(
            name=func.func_name,
            seconds=seconds,
        ))

        return result

    return proxy
```

第 3 、 5 行分别在函数调用前后采样当前时间，第 7 行计算调用耗时，耗时大于一秒输出一条警告日志。

```python
@log_slow_call
def sleep_seconds(seconds):
    time.sleep(seconds)

sleep_seconds(0.1)  # 没有日志输出

sleep_seconds(2)    # 输出警告日志
```

然而，阈值设置总是要视情况决定，不同的函数可能会设置不同的值。如果阈值有办法参数化就好了：

```python
def log_slow_call(func, threshold=1):
    def proxy(*args, **kwargs):
        start_ts = time.time()
        result = func(*args, **kwargs)
        end_ts = time.time()

        seconds = end_ts - start_ts
        if seconds > threshold:
            logging.warn('slow call: {name} in {seconds}s'.format(
                name=func.func_name,
                seconds=seconds,
            ))

        return result

    return proxy
```

然而， _@xxxx_ 语法糖总是以被装饰函数为参数调用装饰器。换句话讲，我们没机会来传递 _threshold_ 参数。 这可怎么办呢？——只能再用一个闭包来封装 _threshold_ 参数：

```python
def log_slow_call(threshold=1):
    def decorator(func):
        def proxy(*args, **kwargs):
            start_ts = time.time()
            result = func(*args, **kwargs)
            end_ts = time.time()

            seconds = end_ts - start_ts
            if seconds > threshold:
            logging.warn('slow call: {name} in {seconds}s'.format(
                name=func.func_name,
                seconds=seconds,
            ))

            return result

        return proxy

    return decorator


@log_slow_call(threshold=0.5)
def sleep_seconds(seconds):
    time.sleep(seconds)
```

这样一来，调用 _log_slow_call(threshold=0.5)_ 将返回 _decorator_ 函数，该函数拥有闭包变量 _threshold_ ，值为 _0.5_ 。 _decorator_ 再装饰 _sleep_seconds_ 。

如果采用默认阈值，函数调用还是不能省略：

```python
@log_slow_call()
def sleep_seconds(seconds):
    time.sleep(seconds)
```

处女座可能会对第一行这对括号感到不爽，那么你还可以这样来改进：

```python
def log_slow_call(func=None, threshold=1):
    def decorator(func):
        def proxy(*args, **kwargs):
            start_ts = time.time()
            result = func(*args, **kwargs)
            end_ts = time.time()

            seconds = end_ts - start_ts
            if seconds > threshold:
            logging.warn('slow call: {name} in {seconds}s'.format(
                name=func.func_name,
                seconds=seconds,
            ))

            return result

        return proxy

    if func is None:
        return decorator
    else:
        return decorator(func)
```

这种写法兼容两种不同的用法，用法 _A_ 默认阈值(无调用)；用法 _B_ 自定义阈值(有调用)。

```python
# Case A
@log_slow_call
def sleep_seconds(seconds):
    time.sleep(seconds)


# Case B
@log_slow_call(threshold=0.5)
def sleep_seconds(seconds):
    time.sleep(seconds)
```

用法 _A_ 中，发生的事情是 _log_slow_call(sleep_seconds)_ ，也就是 _func_ 参数是非空的，这时直接调 _decorator_ 函数进行包装并返回，因此阈值是默认的。

用法 _B_ 中，首先执行的是 _log_slow_call(threshold=0.5)_ ， _func_ 参数为空，直接返回新的装饰器 _decorator_ ，关联闭包变量 _threshold_ ，值为 _0.5_ ； 然后， _decorator_ 再装饰函数 _sleep_seconds_ ，即执行 _decorator(sleep_seconds)_ 。 注意到，此时 _threshold_ 关联的值是 _0.5_ ，由此实现了阈值定制化。

你可能注意到了，这里最好使用关键字参数这种调用方式——使用位置参数会很丑陋：

```python
# Case B-
@log_slow_call(None, 0.5)
def sleep_seconds(seconds):
    time.sleep(seconds)
```

当然了， **函数调用尽量使用关键字参数** 是一种极佳实践，含义清晰，在参数很多的情况下更应如此。


## 智能装饰器

上节介绍的带参数装饰器写法，嵌套层次较多。如果每个类似的装饰器都用这种方法实现，还是比较费劲的，也比较容易出错，脑子可能不够用呢。那么，有没有办法进一步进行优化呢？

假设，我们有一个智能装饰器 _smart_decorator_ ，用来修饰装饰器 _log_slow_call_ ，便使其具备参数化的能力。 这样， _log_slow_call_ 定义将变得更清晰，实现起来也更省事了：

```python
@smart_decorator
def log_slow_call(func, threshold=1):
    def proxy(*args, **kwargs):
        start_ts = time.time()
        result = func(*args, **kwargs)
        end_ts = time.time()

        seconds = end_ts - start_ts
        if seconds > threshold:
        logging.warn('slow call: {name} in {seconds}s'.format(
            name=func.func_name,
            seconds=seconds,
        ))

        return result

    return proxy
```

脑洞开完， _smart_decorator_ 如何实现呢？掌握闭包和装饰器的执行机制，这其实也简单：

```python
def smart_decorator(decorator):

    def decorator_proxy(func=None, **kwargs):
        if func is not None:
            return decorator(func=func, **kwargs)

        def decorator_proxy(func):
            return decorator(func=func, **kwargs)

        return decorator_proxy

    return decorator_proxy
```

_smart_decorator_ 实现了以后，我们的设想就成立了！ 这时， _log_slow_call_ ，就是 _decorator_proxy_ (外层)， 关联的闭包变量 _decorator_ 是本小节最开始定义的 _log_slow_call_ (为了避免歧义，我们将其称为 _real_log_slow_call_ )。由此一来， _log_slow_call_ 支持以下各种用法：

```python
# Case A
@log_slow_call
def sleep_seconds(seconds):
    time.sleep(seconds)
```

用法 _A_ 中，执行的是 _decorator_proxy(sleep_seconds)_ (外层)， _func_ 非空， _kwargs_ 为空； 直接执行 *decorator(func=func, *_kwargs)_ ，即 _real_log_slow_call(sleep_seconds)_ ，结果是关联默认参数的 _proxy_ 。

```python
# Case B
# Same to Case A
@log_slow_call()
def sleep_seconds(seconds):
    time.sleep(seconds)
```

用法 _B_ 中，先执行 _decorator_proxy()_ ， _func_ 及 _kwargs_ 均为空，返回 _decorator_proxy_ 对象(内层)； 再执行 _decorator_proxy(sleep_seconds)_ (内层)；最后执行 _decorator(func, **kwargs)_ ， 等价于 _real_log_slow_call(sleep_seconds)_ ，效果与用法 _A_ 一致。

```python
# Case C
@log_slow_call(threshold=0.5)
def sleep_seconds(seconds):
    time.sleep(seconds)
```

用法 _C_ 中，先执行 _decorator_proxy(threshold=0.5)_ ， _func_ 为空但 _kwargs_ 非空，返回 _decorator_proxy_ 对象(内层)； 再执行 _decorator_proxy(sleep_seconds)_ (内层)；最后执行 _decorator(sleep_seconds, **kwargs)_ ， 等价于 _real_log_slow_call(sleep_seconds, threshold=0.5)_ ，阈值实现自定义！