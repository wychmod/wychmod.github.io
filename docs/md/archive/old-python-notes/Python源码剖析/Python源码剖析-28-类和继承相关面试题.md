_Python_ 提供了完整的面向对象编程能力，将面向对象编程思想带到实际项目，可极大提高开发效率。因此，面向对象编程也是 _Python_ 面试中必问的重要话题。

想要在 _Python_ 项目中应用面向对象编程技术，除了掌握基本的理论概念外，还要理解 _Python_ 对象模型、 类机制、继承与属性查找的关系、描述符以及元类等诸多知识。这些都是面试中经常考察的关键知识点。

**如何理解面向对象编程中的方法重写( overriding )和重载( overloading )？**

请结合 Python 或其他编程语言进行说明。

**方法重写** ( _overriding_ )是指在子类中重新实现已在父类中定义的方法。

在面向对象编程语言中，子类可以继承父类中的方法，而无须重新编写相同的方法。但有时子类并不想原封不动地继承父类所有功能，想对父类中的某些方法进行修改，这就需要采用方法重写特性。方法重写不能发生在同一个类中，只能发生在子类中。

这是一个最简单的方法重写实例：

```python
class Dog:
    
    def eat(self):
        print('yummy!')
    
    def yelp(self):
        print('woof!')

class Sleuth(Dog):
    
    def yelp(self):
        print('WOOF! WOOF! WOOF!')
```

_Dog_ 是一个普通狗类，实现了 _eat_ 和 _yelp_ 方法。猎犬 _Sleuth_ 继承于 _Dog_ 类，因此继承了父类的 _eat_ 方法。注意到，我们对 _yelp_ 方法进行 **重写** ，以连续三个大写的 _WOOF_ 突出猎犬铿锵有力的吠声。

这样一来，_Sleuth_ 类继承了 _Dog_ 中的 _eat_ 方法，但自己的 _yelp_ 方法覆盖了 _Dog_ 中的相关定义：

```python
>>> sleuth = Sleuth()
>>> sleuth.eat()
yummy!
>>> sleuth.yelp()
WOOF! WOOF! WOOF!
```

**重载** ( _overloading_ )既可发生在同一个类的方法之间，一般称作方法重载；亦可发生在普通函数间，一般称作函数重载。这个特性允许开发人员定义名字相同，但输入参数不同的类方法或者普通函数，即同名方法/函数的不同版本。

当程序调用重载方法或函数时，编译器将根据 **参数个数** 及 **参数类型** ，自动绑定正确的版本。由于方法/函数绑定时涉及类型检查，因此一般只有静态类型编程语言才支持重载特性。

_Python_ 是一种动态类型编程语言，不支持方法重载，我们举一个简单的 _C++_ 程序作为例子：

```python
#include <iostream>

using namespace std;
  
void print(int i) {
    cout << " Here is int " << i << endl;
}

void print(double  f) {
    cout << " Here is float " << f << endl;
}

void print(char const *c) {
    cout << " Here is char* " << c << endl;
}

int main() {
    print(10);
    print(10.10);
    print("ten");
    return 0;
}
```

程序定义了 _print_ 函数，分为 _3_ 个不同版本，分别以整型、双精度浮点以及常字符串为参数。_main_ 函数中调用 _print_ 函数时，编译器将根据参数类型，自动选择正确的 _print_ 函数版本。以 _print(10)_ 为例，由于参数 _10_ 是一个整数，编译器可以据此推导出 _void print(int i)_ 版本。

**Python 支持多继承吗？试说明多继承场景下实例对象类属性查找顺序？**

_Python_ 支持多继承，只需将基类按顺序逐一声明即可：

```python
class Child(Base1, Base2):
    pass
```

当子类实例对象查找某个类属性时，先在子类 _Child_ 中查找，再按定义顺序到基类中逐个中查找。如果基类也继承于其他类的基类，_Python_ 将沿着继承链逐级回溯，最终来到 _object_ 。

类属性查找顺序决定程序的行为，不可不察，特别是在复杂多继承场景下。实际上，_Python_ 类属性查找顺序是一个特殊的拓扑排序。这个拓扑排序首先是深度优先的，其次需要确保多继承基类按照定义的顺序查找。

接下来，我们构造一个多继承关系网，考察决定属性查找顺序的重要因素，例子如下：

```python
class A: pass

class B: pass

class C(A): pass

class D(C): pass

class E(B, A): pass

class F(D, E): pass
```

例子涉及各个类的继承关系图如下：

![](../../youdaonote-images/Pasted%20image%2020221217114436.png)

子类总比父类先被搜索，因此必须满足以下关系，拓扑排序即可胜任：

-   _F_ 先于 _D_ ；
-   _F_ 先于 _E_ ；
-   _D_ 先于 _C_ ；
-   _C_ 先于 _A_ ；
-   _A_ 先于 _object_ ；
-   _E_ 先于 _A_ ；
-   _E_ 先于 _B_ ；
-   _B_ 先于 _object_ ；

而根据多继承基类列表顺序，必须保证：

-   _B_ 先于 _A_ ；
-   _D_ 先于 _E_ ；

因此，_F_ 最先被搜索，接着是 _D_ ，然后按照深度优先的原则来到 _C_ ；由于 _B_ 先于 _A_ ，不能接着搜索 _A_ ；这时只能先搜索 _E_ 分支，然后是 _B_ ，再到 _A_ ；_A_ 和 _B_ 皆搜索过后才能搜索 _object_ 。因此，完整的搜索顺序是这样的：

```python
F -> D -> C -> E -> B -> A -> object
```

_Python_ 完成类对象初始化后，通过 _C3_ 算法计算类属性搜索顺序，并将其保存在 ___mro___ 属性中。我们可以据此确认推理结果：

```python
>>> F.__mro__
(<class '__main__.F'>, <class '__main__.D'>, <class '__main__.C'>, <class '__main__.E'>, <class '__main__.B'>, <class '__main__.A'>, <class 'object'>)
```

如果规则前后矛盾，_Python_ 将抛 _TypeError_ 异常。这是一个典型的例子：

```python
class A: pass

class B: pass

class C(A, B): pass

class D(B, A): pass

class F(C, D): pass
```

对于 _F_ 类，基类 _C_ 要求 _A_ 先于 _B_ 被搜索，而基类 _D_ 要求 _B_ 先于 _A_ 被搜索，前后矛盾：

```python
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: Cannot create a consistent method resolution
order (MRO) for bases A, B
```

由于多继承存在一定的歧义性，实际项目开发一般不鼓励复杂的多继承关系。如果多继承不可避免，则需要严谨确认类属性搜索顺序。最好查看 ___mro___ 属性确认顺序符合预期，切勿想当然。

**试设计装饰器 mystaticmethod ，实现与 staticmethod 相同的功能**

根据属性描述符原理，我们需要实现一个装饰器，将函数对象改造成一个特殊的 **非数据描述符** 。当实例对象访问对应属性时，描述符 ___get___ 方法将被调用，它只需将函数对象原样返回即可：

```python
class mystaticmethod:
    
    def __init__(self, func):
        self.func = func
        
    def __get__(self, instance, owner):
        return self.func
```

这样一来，静态函数可以这样来写，以在 _Foo_ 类实现静态方法 _add_ 为例：

```python
class Foo:
    
    @mystaticmethod
    def add(a, b):
        return a + b
    
    def add2(a, b):
        return a + b
```

接着，我们创建一个实例对象 _foo_ ，并通过实例对象访问 _add_ 属性。我们得到的是原始的 _add_ 函数对象，而不是一个 _bound method_ 对象：

```python
>>> foo = Foo()
>>> foo.add
<function Foo.add at 0x1092189d8>
>>> foo.add(1, 2)
3
```

至此，我们通过自己的聪明才智，成功实现了静态方法装饰器。作为对照，_add2_ 未加装饰，它将成为一个普通的类方法。我们通过 _foo_ 实例对象访问 _add2_ 属性时，将得到一个 _bound method_ 对象：

```python
>>> foo.add2
<bound method Foo.add2 of <__main__.Foo object at 0x1092349e8>>
```

**Python 如何实现单例模式？试举例说明。**

通过 _Python_ 对象模型部分学习，我们知道 _Python_ 对象创建和初始化分别由定义于类型对象中的 _tp_new_ 以及 _tp_init_ 函数负责。相应地，在自定义类中，可以通过 ___new___ 和 ___init___ 魔术方法来控制实例对象的实例化。

对于类 _X_ ，当我们调用 `x = X()` 创建实例对象 _x_ 时，_Python_ 内部分为两步进行：

1.  调用 _X.__new___ 为实例对象分配内存，这一步完成实例对象的创建；
2.  调用 _X.__init___ 将实例对象初始化，_1_ 中生成的实例对象作为 _self_ 参数传给 ___init___ 方法；

如果 _X_ 类未实现 ___new___ 方法，_Python_ 将使用其父类的。如果父类也没有实现该方法，_Python_ 最终将调用 _object.tp_new_ 。_object_ 基类型对象是所有类型对象的基类，它提供了一个通用的 _tp_new_ 版本。

当 ___init___ 方法执行时，对象已经完成了创建，因此无法实现全局唯一的约束。但我们可以在 ___new___ 方法中做手脚，先判断对象是否已经创建，如果是直接将其返回，否则调用父类的 ___new___ 方法完成进行创建并保存。示例代码如下：

```python
class SomeClass:
    
    instance = None
    
    def __new__(cls):
        if cls.instance is None:
            cls.instance = super().__new__(cls)
            
        return cls.instance
    
    def __init__(self):
        # do some initialization
        pass
```

例子中，类属性 _instance_ 用于保存 _SomeClass_ 类全局唯一的实例对象。

在 ___new___ 函数中，我们先检查 _instance_ 属性。如果它为 _None_ ，说明实例尚未创建。这时，我们通过 _super_ 调用父类的 ___new___ 方法完成实例对象的创建，并将其保存与 _instance_ 属性中。

当我们再次调用 _SomeClass_ 类创建实例对象时，___new___ 方法也将被调用。但此时，_instance_ 已不再是 _None_ ， ___new___ 直接将其返回，由此避免重复实例化。

这样一来，不管我们调用 _SomeClass_ 多少次，得到的实例对象总是全局唯一的那一个：

```python
>>> instance = SomeClass()
>>> id(instance)
4302595728
>>> instance = SomeClass()
>>> id(instance)
4302595728
```

**如果程序中有成千上万的 User 类实例对象，如何优化内存使用？**

提示 _User_ 只包含属性 _name_ 和 _email_ 以及若干个类方法：

```python
class User:
    
    def __init__(self, name, email):
        self.name = name
        self.email = email
        
    def some_method(self):
        pass
        
    def another_method(self):
        pass

user = User(name='小菜学编程', email='coding-fan@mp.weixin.qq.com')
```

根据我们学到的 _Python_ 类机制知识，_User_ 类对象及其实例对象底层内存布局大致如下：

![](../../youdaonote-images/Pasted%20image%2020221217123507.png)

中间橘色部分是 _User_ 类对象，它是一个 _PyTypeObject_ 结构体，_tp_dict_ 字段指向类属性空间。类属性空间是一个字典对象，里面保存着类属性，类方法 _some_method_ 也位于其中。

而 _User_ 实例对象(如例子中的 _user_ )，如蓝色部分所示，它的结构则简单得多，底层是一个 _PyObject_ 结构体。紧接着 _PyObject_ 的是一个指针，指向实例对象属性空间的字典。实例对象属性空间也是一个字典对象，里面则保存着实例对象的属性 _name_ 和 _email_ 。

注意到，_User_ 类对象全局只有一个，而它的实例对象却可以有无数个。那么，一个实例对象占用多少内存空间呢？我们调用 _sys.getsizeof_ 查看一下：

```python
>>> sys.getsizeof(user)
64
```

不对吧？在内建对象部分，我们学习了字典对象的布局，它动辄 _200_ 多字节呢！实际上，_getsizeof_ 只计算蓝色部分内存，这部分是 _32_ 字节，而 _PyObject_ 之前还有 _32_ 字节用于垃圾回收的隐形开销。

因此，一个 _User_ 实例对象的内存开销是 _64_ 字节加上属性空间字典对象的内存开销。换句话讲，每创建一个 _User_ 实例，_Python_ 都会帮你创建一个字典对象，来保存实例属性。

属性空间字典是一个不小的开销，当前这个场景似乎不需要。因为 _User_ 实例对象属性只有固定的两个，不会出现这样的情况：

```python
>>> user.age = 10
>>> user.age
10
```

联想到函数局部名字空间与这个场景非常类似：参数个数是固定的，因此名字空间由一个静态的数组实现，而不是用字典对象。那么，实例属性是不是也可以采用类似的思路呢？答案是肯定的，_Python_ 实现了 _slot_ 机制：

```python
class User:
    
    __slots__ = ('name', 'email')
    
    def __init__(self, name, email):
        self.name = name
        self.email = email
        
    def some_method(self):
        pass
        
    def another_method(self):
        pass
    
user = User(name='小菜学编程', email='coding-fan@mp.weixin.qq.com')
```

这个新的 _User_ 类通过 ___slots___ 将属性 _name_ 和 _email_ 申明为以 _slot_ 形式实现。采用 _slot_ 机制后，_Python_ 便不会为 _User_ 实例对象分配属性空间字典了，而是将属性作为 _slot_ 依次排列在 _PyObject_ 结构体之后：

```python
>>> user.__dict__
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'User' object has no attribute '__dict__'
```

![](../../youdaonote-images/Pasted%20image%2020221217124317.png)

由此一来，动辄几百字节的字典对象被节省下来，内存使用效率得到有效提升。当然了，天下没有免费的午餐，我们丧失了在运行时新增属性的灵活性：

```python
>>> user.age = 10
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'User' object has no attribute 'age'
```

因此，_slot_ 机制只适用于属性个数固定的场景。

**用 type 元类型创建一个等价的 MyFloat 类**

```python
class MyFloat(float):
    
    def round(self):
        return int(self)
```

根据 _Python_ 对象模型，_type_ 是所有类型对象的类型，调用 _type_ 可以创建新的类型对象。在类机制部分，我们学习了自定义类的创建过程，知道 _type_ 在其中所起的重要作用。

使用 _type_ 创建新类型对象，接口如下：

```python
type(name, bases, dict) -> a new type
```

-   _name_ ，新类型名；
-   _bases_ ，基类列表；
-   _dict_ ，类属性空间；

显而易见，为创建与 _MyFloat_ 完全等价的类对象，_name_ 必须是 _MyFloat_ ；基类是 _float_ 对象，因而 _bases_ 必须是由 _float_ 组成的元组，即 _(float,)_ ；而作为类属性空间 _dict_ 必须包含 _round_ 函数对象。

我们先定义 _round_ 函数以及类属性空间：

```python
>>> def round(self):
...     return int(self)
...
>>> attrs = {'round': round}
```

接着，我们调用 _type_ 元类型对象完成新类对象的创建：

```python
>>> MyFloat = type('MyFloat', (float,), attrs)
>>> MyFloat
<class '__main__.MyFloat'>
```

最后，我们验证新 _MyFloat_ 类的功能，确认它与例子程序完全等价：

```python
>>> pi = MyFloat('3.14')
>>> pi.round()
3
```

_type_ 元类编程提供了在运行时动态创建新类型的强大能力，在框架设计中非常有用。