# 类对象如何产生

## 类对象行为


```python
>>> class Dog:
...     def yelp(self):
...         print('woof')
...
>>> Dog
<class '__main__.Dog'>
>>> dog = Dog()
>>> dog.yelp()
woof
```

根据 **对象模型** 部分学到的知识，我们可以得到这样的关系图：

![](../../youdaonote-images/Pasted%20image%2020221215232655.png)

```python
>>> type(dog) is Dog
True
>>> type(Dog) is type
True
>>> issubclass(Dog, object)
True
```

我们接着观察 _Dog_ 类的行为，发现它支持属性设置。例如，我们设置 _legs_ 属性，表示狗都有 _4_ 条腿：

```python
>>> Dog.legs = 4
>>> Dog.legs
4
```

由此，我们可以大胆推测，每个自定义类对象都有一个 **属性空间** ，背后同样是由 _dict_ 对象实现的。

我们还注意到类对象中的属性，可以被实例对象访问到。在 **继承与属性查找** 一节，我们将深入研究这个现象：

```python
>>> dog = Dog()
>>> dog.legs
4
```

那么，类方法是不是也保存在类属性空间中呢？我们知道，通过 ___dict___ 即可获取一个对象的属性空间：

```python
>>> Dog.__dict__.keys()
dict_keys(['__module__', 'yelp', '__dict__', '__weakref__', '__doc__', 'legs'])
```

除了几个内置属性，我们找到了 legs 这是我们刚刚设置的属性；还找到了 _yelp_ ，它应该就是类的方法了：

```python
>>> Dog.__dict__['yelp']
<function Dog.yelp at 0x10f8336a8>
>>> Dog.yelp
<function Dog.yelp at 0x10f8336a8>
```

这是否意味着，可以将新方法作为属性设置到类对象身上，让它具有某些新行为呢？事不宜迟，我们来试试：

```python
>>> def yelp2(self):
...     print('surprise')
...
>>> Dog.yelp2 = yelp2
>>> dog.yelp2()
surprise
```

我们在运行时让 _Dog_ 类拥有 _yelp2_ 这个新能力，_Python_ 很动态。这个例子帮我们理解 _Python_ 的运行行为，但这种写法不是一个好习惯，在实际项目中尽量少用吧。

![](../../youdaonote-images/Pasted%20image%2020221215235043.png)

至此，我们得到了 _Dog_ 这个类对象的大致轮廓，它有一个属性空间，由 _dict_ 对象实现， _yelp_ 方法便位于其中。

## 底层表现形式

_Dog_ 类是一种自定义类对象，因此它底层应该是一个 _PyTypeObject_ 。_PyTypeObject_ 是每个类型对象在虚拟机底层的表现形式，它中源码中位于 _Objects/typeobject.c_ 文件。这个结构体前面章节已有所涉猎，多少还有些印象吧？

进入 _Objects_ 目录，我们的目光还被 _Objects/classobject.c_ 这个文件吸引住了，这不就是 **类对象** 吗？历史上，_Python_ 自定义类和内建类型是分开实现的，也因此造成鸿沟。后来 _Python_ 完成了类型统一，不管自定义的还是内建的，具有 _PyTypeObject_ 实现，_Objects/classobject.c_ 中的大部分功能也因之废弃。

由于篇幅的关系，这里不打算展开太多源码细节，同样以最通俗易懂的结构图进行介绍：

![](../../youdaonote-images/Pasted%20image%2020221215235747.png)

结构图省略了很多字段，但不会影响学习理解，重点注意这几个字段：

-   _tp_name_ ，_Dog_ 类对象名字，即类名；
-   _tp_call_ ，_Dog_ 类被调用时执行的函数指针，用于创建 _Dog_ 实例对象 ，如 `dog = Dog()` ；
-   _tp_dict_ ，该字段指向一个 _dict_ 对象，_dict_ 存储 _Dog_ 类对象的属性空间；

对源码比较感兴趣的同学，可以深入 _Objects/typeobject.c_ 以及 _Objects/classobject.c_ ，研究体会。

## 创建步骤

那么，_Python_ 类代码时如何一步步转换成类对象的呢？同样，我们从字节码入手，一起窥探这其中的秘密。

首先，我们将 _Dog_ 类的代码作为字符串保存起来，并调用 _compile_ 函数进行编译，得到一个代码对象：

```python
>>> text = '''
... class Dog:
...     def yelp(self):
...         print('woof')
... '''
>>> code = compile(text, '', 'exec')
```

这个代码对象里头应该就保持着创建类对象的密码！迫不及待想要揭晓答案，那就字节码反编译一下吧：

```python
>>> import dis
>>> dis.dis(code)
  2           0 LOAD_BUILD_CLASS
              2 LOAD_CONST               0 (<code object Dog at 0x10110f8a0, file "", line 2>)
              4 LOAD_CONST               1 ('Dog')
              6 MAKE_FUNCTION            0
              8 LOAD_CONST               1 ('Dog')
             10 CALL_FUNCTION            2
             12 STORE_NAME               0 (Dog)
             14 LOAD_CONST               2 (None)
             16 RETURN_VALUE

Disassembly of <code object Dog at 0x10110f8a0, file "", line 2>:
  2           0 LOAD_NAME                0 (__name__)
              2 STORE_NAME               1 (__module__)
              4 LOAD_CONST               0 ('Dog')
              6 STORE_NAME               2 (__qualname__)

  3           8 LOAD_CONST               1 (<code object yelp at 0x10110f390, file "", line 3>)
             10 LOAD_CONST               2 ('Dog.yelp')
             12 MAKE_FUNCTION            0
             14 STORE_NAME               3 (yelp)
             16 LOAD_CONST               3 (None)
             18 RETURN_VALUE

Disassembly of <code object yelp at 0x10110f390, file "", line 3>:
  4           0 LOAD_GLOBAL              0 (print)
              2 LOAD_CONST               1 ('woof')
              4 CALL_FUNCTION            1
              6 POP_TOP
              8 LOAD_CONST               0 (None)
             10 RETURN_VALUE
```

里头大部分字节码我们都认识，但是连起来看却一脸懵逼……这不打紧，至少我们已经发现了某些蛛丝马迹。看到字节码 _LOAD_BUILD_CLASS_ 没？顾名思义，它应该就是构建类对象的关键所在。

开始窥探 _LOAD_BUILD_CLASS_ 字节码之前，先继续考察代表 _Dog_ 类的代码对象。由于我们将 _exec_ 参数传递给 _compile_ 函数，将代码代码作为模块进行编译，因此代码对象 _code_ 对应着模块级别代码块。

我们发现，_code_ 里面还藏有子代码对象，子代码对象作为常量存在于 _code_ 常量表中。而子代码对象中藏在另一个代码对象，同样以常量的形式存在：

```python
>>> code.co_consts
(<code object Dog at 0x10110f8a0, file "", line 2>, 'Dog', None)
>>> code.co_consts[0].co_consts
('Dog', <code object yelp at 0x10110f390, file "", line 3>, 'Dog.yelp', None)
```

从这三个代码对象的字节码来看，_code_ 对应着模块代码，也就是最外层代码块；_code.co_consts[0]_ 则对应着 _Dog_ 类代码块；而 _code.co_consts[0].co_consts[1]_ 则对应着 yelp 函数代码块。三者关系如下图：

![](../../youdaonote-images/Pasted%20image%2020221216002537.png)

代码对象作为源码编译的结果，与源码在层级上一一对应，堪称完美。那么，这些毫无生命力的代码对象，又是如何一步步变身为活生生的类对象的呢？我们得深入字节码中寻找答案。

接下来，我们一起来推演，虚拟机逐条执行模块字节码之后，发生了什么神奇的事情！当模块代码执行时，虚拟机内部有一个 **栈帧** 对象，维护着代码对象运行时时的上下文信息，全局和局部名字空间均指向模块属性空间。

![](../../youdaonote-images/Pasted%20image%2020221216002837.png)