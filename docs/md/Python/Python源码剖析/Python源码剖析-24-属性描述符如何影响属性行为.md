我们先通过一个简单的类 _Point_ ，考察对象属性的行为：

```python
class Point:
    z = 0
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def distance(self):
        return math.sqrt(self.x*self.x + self.y*self.y)
```

_Point_ 类用于表示一个二维坐标，例如 _(1, 2)_ ：

```python
>>> p = Point(1, 2)
```

其中， _Point_ 是自定义类对象， _p_ 是 _Point_ 类的实例对象。由于 _X_ 、_Y_ 轴坐标分别作为 _x_ 、_y_ 属性被 ___init___ 函数保存于实例对象属性空间中，因而可以通过对象属性查找访问：

```python
>>> 'x' in p.__dict__
True
>>> p.x
1

>>> 'y' in p.__dict__
>>> p.y
2
```

我们在 _Point_ 类中定义了 _distance_ 方法，用于计算坐标到原点的距离。虽然它并不在 _p_ 实例对象的属性空间中，照样可以被 _p_ 查找到，这又是为什么呢？

```python
>>> 'distance' in p.__dict__
False
>>> p.distance()
2.23606797749979
```

我们定义的 _distance_ 方法，明明有一个参数 _self_ ，但我们调用时却无须传递！实际上，你可能早已知晓，_Python_ 自动将 _p_ 作为 _self_ 参数传给 _distance_ 。那么，_Python_ 又是如何暗度陈仓的呢？

通过观察 _p_ 实例对象 _distance_ 属性，我们找到一些蛛丝马迹：

```python
>>> p.distance
<bound method Point.distance of <__main__.Point object at 0x1077d4160>>
```

我们惊讶地发现，它居然是一个 _bound method_ 对象，而不是我们定义的函数对象！

经过前面章节学习，我们很清楚 _distance_ 方法保存在 _Point_ 类的属性空间，而它只是一个普通的函数对象：

```python
>>> 'distance' in Point.__dict__
True
>>> Point.distance
<function Point.distance at 0x1077b9730>
```

因此，如果我们通过 _Point_ 类来调用 _distance_ 方法，是需要显式传递 _self_ 参数的：

```python
>>> Point.distance(p)
2.23606797749979
```

那么，_distance_ 函数对象是如何完成到 _bound method_ 对象的华丽转身的呢？

## 底层布局

在对象模型部分，我们知道对 **可调用对象** ( _callable_ )进行调用，_Python_ 内部执行其类型对象的 _tp_call_ 函数。

由于 _Point_ 类对象是类型对象，其类型是 _type_ 。因此，当我们调用 _Point_ 类创建实例对象，_Python_ 将执行 _type_ 的 _tp_call_ 函数，_tp_call_ 函数则回过头来调用 _Point_ 类的 _tp_new_ 函数。

我们并没有给 _Point_ 定义 ___new___ 函数，也就是说 _Point_ 类并没有 _tp_new_ 函数。好在 _Point_ 有一个默认基类 _object_ ，而 _object_ 提供了一个兜底的版本：_object.tp_new_ ，它负责为实例对象分配内存。

最后，_type.tp_call_ 将调用 _Point.tp_init_ 函数，也就是我们定义的 ___init___ 函数，对实例对象进行初始化。

![](../../youdaonote-images/Pasted%20image%2020221216211609.png)

当 _Point_ 实例对象完成初始化，实例对象与 Point 类对象在底层的内存布局大致是这样的：

![](../../youdaonote-images/Pasted%20image%2020221216211722.png)

_p_ 实例对象背后有一个 _dict_ 对象，用于维护其属性空间，实例属性 _x_ 、 _y_ 便藏身其中；同样，_Point_ 类对象背后也有一个 _dict_ 对象，用于维护其属性空间，属性 _z_ 以及方法 _distance_ 也藏身其中。

## 字节码

当我们在 _p_ 实例上调用 _distance_ 方法时，由于 _p_ 实例属性空间并没有定义 _distance_ 方法，_Python_ 将到 _Point_ 类的属性空间中查找。如果 _Point_ 类属性空间也没有定义，_Python_ 继续沿着类继承图逐层向上查找。

_Python_ 并没有直接将定义在 _Point_ 类属性空间的 _distance_ 函数对象直接返回，而是对它做了一些手脚。想来这也很合理，如果将 _distance_ 函数对象原样返回的话，我们还要显示传递 _self_ 参数：

```python
p.instance(p)
```

这可真丑陋！那么，_Python_ 为解决这个问题又做了哪些手脚呢？会不会是由一个特殊的字节码完成的呢？

对 _p.distance()_ 这个语句进行反编译，得到以下字节码：

```python
>>> dis.dis(compile('p.distance()', '', 'exec'))
  1           0 LOAD_NAME                0 (p)
              2 LOAD_METHOD              1 (distance)
              4 CALL_METHOD              0
              6 POP_TOP
              8 LOAD_CONST               0 (None)
             10 RETURN_VALUE
```

接着对 _p.distance_ 这个语句进行反编译，得到以下字节码：

```python
>>> dis.dis(compile('p.distance', '', 'exec'))
  1           0 LOAD_NAME                0 (p)
              2 LOAD_ATTR                1 (distance)
              4 POP_TOP
              6 LOAD_CONST               0 (None)
              8 RETURN_VALUE
```

我们发现了一个全新的字节码 _LOAD_METHOD_ ，用于查找并加载对象方法！秘密会不会就在这个字节码上？等等！我们刚提过，通过普通属性查找得到的 _distance_ 方法，也是加工过的：

```python
>>> p.distance
<bound method Point.distance of <__main__.Point object at 0x1077d4160>>
```

这样看来，_LOAD_ATTR_ 字节码也会对返回的属性做手脚，因此答案跟 _LOAD_METHOD_ 字节码应该没有必然联系。虽然白忙活了一场，但我们已经找到了解开秘密的钥匙——只需扒一扒这两个字节码的处理逻辑即可。

我们从 _LOAD_ATTR_ 入手，借助它一步步接近幕后的无名英雄——_Python_ **描述符** ( _descriptor_ )。过程因篇幅关系省略一万字，有兴趣的童鞋请参考该字节码相关处理逻辑，源码位于 _Python/ceval.c_ 文件。

## 描述符

我们发现，函数对象还有不为人知的一面，它同时也是一个描述符。那么，什么是描述符呢？

_Python_ 描述符是一个包含“绑定行为”的对象，对描述符的属性访问受描述符协议定义的方法影响，这样的方法有：

-   ___get__()_ ，影响属性获取；
-   ___set__()_ ，影响属性设置；
-   ___delete__()_ ，影响属性删除；

由于函数对象定义了 ___get__()_ 方法，因此函数对象是一个描述符对象：

```python
>>> def foo():
...     pass
...
>>> hasattr(foo, '__get__')
True
>>> hasattr(Point.distance, '__get__')
True
```

接下来，我们进一步考察描述符是如何影响属性行为的。我们知道，_Python_ 访问对象属性时，默认先在对象的属性空间字典中查找；再到类型对象的属性空间查找。

如果属性可在对象属性空间字典中找到，_Python_ 原样返回，不加修饰。举个例子，我们将 _distance_ 函数对象做为 _distance1_ 属性保存到实例对象 _p_ 的属性空间中：

```python
>>> Point.distance
<function Point.distance at 0x10dace6a8>
>>> p.distance1 = Point.distance
>>> 'distance1' in p.__dict__
True
```

我们访问 _distance1_ 属性，获得了 _distance_ 函数对象，未经任何修饰：

```python
>>> p.distance1
<function Point.distance at 0x10dace6a8>
>>> p.distance1(p)
2.23606797749979
```

如果属性在对象属性空间中找不到，_Python_ 接着在其类型对象属性空间中查找，按照上节介绍的顺序回溯继承图。这时，需要分成两种情况来讨论：

如果在类型对象属性空间中找到的属性不是描述符，_Python_ 原样返回。举个例子，通过 _p_ 访问类属性 _z_ ：

```python
>>> p.z
0
```

如果在类型对象属性空间中找到的属性是描述符，_Python_ 将调用其 ___get___ 方法，将实例对象与它进行绑定。

同样以 _p_ 调用 _distance_ 方法为例，_Python_ 在 _Point_ 类属性空间中找到 _distance_ 函数对象，发现它是一个描述符。接着，_Python_ 调用 _distance_ 函数的 ___get___ 方法，并将 _p_ 作为参数传进去，以此与 _p_ 完成绑定：

```python
>>> Point.distance
<function Point.distance at 0x10087a730>
>>> Point.distance.__get__(p)
<bound method Point.distance of <__main__.Point object at 0x100896630>>
```

这样一来，我们对 _distance_ 进行属性查找得到的是一个 _bound method_ ，它的底层结构如下：

![](../../youdaonote-images/Pasted%20image%2020221216212342.png)

_bound method_ 底层是一个 _PyMethodObject_ 结构体，定义于 _Include/classobject.h_ 头文件中。该结构体除了一些公共头部，只有两个重要字段：

-   _im_func_ ，函数对象；
-   _im_self_ ，绑定的实例对象；

所有迷雾都拨开了，_p_ 实例对象就是这样与 _distance_ 函数对象紧紧地绑定在一起的！

```python
>>> bm = p.distance
>>> bm
<bound method Point.distance of <__main__.Point object at 0x100896630>>

>>> bm.__func__
<function Point.distance at 0x10087a730>
>>> bm.__func__ is Point.distance
True

>>> bm.__self__
<__main__.Point object at 0x100896630>
>>> bm.__self is p
```

当我们调用 _bound method_ 时，_Python_ 将取出 _im_func_ 函数，然后以 _im_self_ 为参数调用它。因此，下面两种不同的调用方式是等价的：

```python
>>> bm()
2.23606797749979
>>> bm.__func__(bm.__self__)
2.23606797749979
```

___get___ 方法只影响属性获取的行为，也就是说它是一种只读行为。而属性还可以被修改和删除，只是可以通过 ___set___ 以及 ___delete___ 施加影响。根据这几个方法，描述符还可进一步分成：

-   非数据描述符，只实现 ___get___ 方法；
-   数据描述符，定义了 ___set___ 或者 ___delete___ 方法；

显然，函数对象是一种非数据描述符。至于数据描述符，因篇幅关系先按下不表，留在魔术方法一节再行展开。