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

哇，我们在运行时让 _Dog_ 类拥有 _yelp2_ 这个新能力，_Python_ 果然很动态！这个例子帮我们理解 _Python_ 的运行行为，但这种写法不是一个好习惯，在实际项目中尽量少用吧。