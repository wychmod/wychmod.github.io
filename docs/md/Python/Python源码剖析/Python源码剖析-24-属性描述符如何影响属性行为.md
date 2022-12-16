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