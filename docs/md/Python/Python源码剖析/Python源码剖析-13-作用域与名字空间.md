
```python
PI = 3.14

def circle_area(r):
    return PI * r ** 2

class Dog(object):
  
    def __init__(self, name):
        self.name = name
  
    def yelp(self):
        print('woof, i am', self.name)
```

以这个程序为例，代码中出现的每个变量的作用域分别是什么？程序中总共涉及几个名字空间？ _Python_ 以怎样的顺序查找一个变量呢？为了解答这些问题，需要对 _Python_ 变量的作用域以及名字空间有准确的认识。

## 名字绑定

### 赋值

在 _Python_ 中，变量只是一个与实际对象绑定起来的名字，变量定义本质上就是建立名字与对象的约束关系。因此，赋值语句本质上就是建立这样的约束关系，将右边的对象与左边的名字绑定在一起：

```python
a = 1
```

我经常在面试中问：除了赋值语句，还有哪些语句可以完成名字绑定？能准确回答的候选人寥寥无几。实际上，除了赋值语句外， _Python_ 中还有好几类语句均与名字绑定相关，我们接着一一介绍。

### 模块导入

我们导入模块时，也会在当前上下文创建一个名字，并与被导入对象绑定：

```python
import xxx
from xxx import yyy
```

### 函数、类定义

我们定义函数 / 类时，本质上是创建了一个函数 / 类对象，然后将其与函数 / 类名绑定：

```python
def circle_area(r):
    return PI * r ** 2

class Dog(object):
    pass
```

### as 关键字

除此此外， `as` 关键字也可以在当前上下文建立名字约束关系：

```python
import xxx as yyy
from xxx import yyy as zzz

with open('/some/file') as f:
    pass

try:
    # do something
except SomeError as e:
    # handle error
```

以上这几类语句均可在当前上下文建立名字约束，有着与赋值语句类似的行为，因此可以看作是 **广义的赋值语句** 。

## 作用域

现在问题来了，一个名字引入后，它的可见范围有多大呢？

我们以一个面试真题开始讨论：以下例子中 _3_ 个 _print_ 语句分别输出什么？

```python
a = 1

def f1():
    print(a)

def f2():
    a = 2
    print(a)

print(a)
```

例子中，第 1 行引入的名字 _a_ 对整个模块都可见，第 4 行和第 10 行均可访问到它，因此这两个地方输出 `1` ；而第 7 行引入的名字 _a_ 却只有函数 _f2_ 内部可以访问到，第 8 行优先访问内部定义的 _a_ ，因此这里将输出 `2` 。

由此可见，在不同的代码区域引入的名字，其影响范围是不一样的。第 _1_ 行定义的 _a_ 可以影响到 `f1` ，而 `f2` 中定义的 `a` 却不能。再者，一个名字可能在多个代码区域中定义，但最终只能使用其中一个。

一个名字能够施加影响的程序正文区域，便是该名字的 **作用域** 。在 `Python` 中，一个名字在程序中某个区域能否起作用，是由名字引入的位置决定的，而不是运行时动态决定的。因此， `Python` 具有 **静态作用域** ，也称为 **词法作用域** 。那么，程序的作用域是如何划分的呢？

`Python` 在编译时，根据语法规则将代码划分为不同的 **代码块** ，每个代码块形成一个 **作用域** 。首先，整个 `.py` 文件构成最顶层的作用域，这就是 **全局作用域** ，也称为 **模块作用域** ；其次，当代码遇到 **函数定义** ，函数体成为当前作用域的 **子作用域** ；再次，当代码遇到 **类定义** ，类定义体成为当前作用域的子作用域。

一个名字在某个作用域引入后，它的影响范围就被限制在该作用域内。其中，全局作用域对所有直接或间接内嵌于其中的子作用域可见；函数作用域对其直接子作用域可见，并且可以传递。

按照这个划分方式，真题中的代码总共有 3 个作用域： `A` 为最外层作用域，即全局作用域； `f1` 函数体形成作用域 `B` ，是 `A` 的子作用域； `f2` 函数体又形成作用域 `C` ，也是 `A` 的子作用域。

![](../../youdaonote-images/Pasted%20image%2020221212120807.png)

作用域 `A` 定义的变量 `a` 对于对 `A` 及其子作用域 `B` 、 `C` 可见，因此 `f1` 也可以访问到。理论上， `f2` 也可以访问到 `A` 中的 `a` ，只不过其作用域 `C` 也定义了一个 `a` ，优先访问本作用域内的。 `C` 作用域内定义的任何名字，对 `A` 和 `B` 均不可见。

_A_ _B_ _C_ 三个作用域嵌套关系如左下所示，访问关系如右下所示：

![](../../youdaonote-images/Pasted%20image%2020221212120814.png)

箭头表示访问关系，例如作用域 _B_ 中的语句可以访问到作用域 _A_ 中的名字，反过来则不行。

### 闭包作用域

这个例子借助闭包实现提示信息定制功能：

```python
pi = 3.14

def circle_area_printer(hint):

    def print_circle_area(r):
        print(hint, pi * r ** 2)

    return print_circle_area

circle_area_en = circle_area_printer('Circle Area:')
circle_area_zh = circle_area_printer('圆面积：')

circle_area_en(2)
circle_area_zh(3)
```

根据前面介绍的规则，我们对代码进行作用域划分，结果如下：

![](../../youdaonote-images/Pasted%20image%2020221212131233.png)

![](../../youdaonote-images/Pasted%20image%2020221212131236.png)\

毫无疑问， _B_ _C_ 均在全局作用域 _A_ 内，因此都可以访问到 _A_ 中的名字。由于 _B_ 是函数作用域，对其子作用域 _C_ 可见。因此， _hint_ 属于 `B` 作用域，而位于 _C_ 作用域的语句可以访问它，也就不奇怪了。

### 类作用域

我们接着以一个简单的类为例，考察类作用域：

```python
slogan = 'life is short, use python.'

class Dog(object):

    group = ''

    def __init__(self, name):
        self.name = name
        
    def yelp(self):
        print('woof,', slogan)
        
    def yelp_name(self):
        print('woof, i am', self.name)
        
    def yelp_group(self):
        print('woof, my group is', group)
```

根据前面介绍的规则，我们对代码进行作用域划分，结果如下：