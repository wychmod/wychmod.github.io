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

