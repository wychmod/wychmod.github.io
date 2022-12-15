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
