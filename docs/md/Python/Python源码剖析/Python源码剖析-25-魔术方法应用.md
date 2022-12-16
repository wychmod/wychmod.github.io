魔术方法是什么呢？顾名思义，魔术方法是一种特殊的方法，可以让自定义类具有某种魔法。魔术方法名开头结尾都包含两个下划线，例如 ___init___ 方法，负责对实例对象进行初始化。

下表将常用的魔术方法分门别类，你或多或少可能已有所了解：

![](../../youdaonote-images/Pasted%20image%2020221216212808.png)

合理应用魔术方法，让自定义类更具 _Python_ 格调，更好地践行 _Python_ 数据抽象以及设计哲学，是每个 Python 工程师必备的编程技巧。接下来，我们一起来考察几个典型的案例，以此抛砖引玉。

## 运算符重载

运算符，诸如加减乘除 ( `+-*/` )，处理逻辑由 ___add___ 等数值操作魔术方法控制。以加法运算符 `+` 为例，表达式 `a + b` 在 _Python_ 内部是这样求值的：

1.  如果 _a_ 定义了魔术方法 ___add___ ，则调用 _a.__add__(b)_ 进行求值；
2.  如果 _b_ 定义了魔术方法 ___radd___ ，则调用 _b.__radd__(a)_ 进行求值；

因此，只需要提供相关魔术方法，非数值型对象也可以支持算术运算符。

举个例子， _str_ 对象以加法进行对象拼接，以乘法进行对象重复，而除法却没有定义：

```python
>>> 'hello' + ' ' + 'world'
'hello world'
>>> 'abc' * 10
'abcabcabcabcabcabcabcabcabcabc'
>>> 'hello world' / ' '
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: unsupported operand type(s) for /: 'str' and 'str'
```

字符串切分是一个比较常见的操作，若能借助除法操作符来进行则方便许多。实现这个目标并不难，我们只需为 _str_ 编写一个派生类，并实现魔术方法 ___truediv___ 即可：

```python
class SmartString(str):

    def __truediv__(self, other):
        return self.split(other)
```

在 _Python_ 内部，除法操作 `/` 由 ___truediv___ 魔术方法处理。请注意，在老版本 Python 中，除法操作符由 ___div___ 魔术方法处理，名字略有差异。

就这么几行代码，我们的字符串类便支持通过除法操作进行字符串切分了：

```python
>>> s = SmartString('hello world')
>>> s / ' '
['hello', 'world']
```

## 数值型运算

结构稍微复杂一些的类型，也可以通过实现数值型魔术函数，让它具备数值类型的行为，支持常见的算术操作。

举个简单的例子，我们可以实现一个类来表示向量，_x_、 _y_ 属性分别存储向量的坐标：

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __add__(self, other):
        return Vector(x=self.x+other.x, y=self.y+other.y)
    def __sub__(self, other):
        return Vector(x=self.x-other.x, y=self.y-other.y)
    def __mul__(self, scale):
        return Vector(x=self.x*scale, y=self.y*scale)
    def __truediv__(self, scale):
        return Vector(x=self.x/scale, y=self.y/scale)
    def __repr__(self):
        return 'Vector(x={}, y={})'.format(self.x, self.y)
```

-   ___add___ 魔术方法，实现向量加法；
-   ___sub___ 魔术方法，实现向量减法；
-   ___mul___ 魔术方法，实现向量数乘；
-   ___truediv___ 魔术方法，实现向量数除；
-   ___repr___ 魔术方法，实现向量表示；

这样一来，我们就可以通过常用算术运算符进行向量运算：

```python
>>> v1 = Vector(1, 2)
>>> v2 = Vector(3, 4)
>>> v1 + v2
Vector(x=4, y=6)
>>> v1 * 3
Vector(x=3, y=6)
>>> v1 / 2
Vector(x=0.5, y=1.0)
```

将自定义类与 _Python_ 的运行哲学相融合，还可带来一些额外的收益 —— 充分发挥 _Python_ 的强大执行能力。

举个例子，我们可以借助现成的 _sum_ 内建函数对多个向量进行求和，完全不需要任何额外的代码：

```python
>>> v1 = Vector(1, 2)
>>> v2 = Vector(3, 4)
>>> v3 = Vector(10, 2)
>>> sum((v1, v2, v3), Vector(0, 0))
Vector(x=14, y=8)
```

看，_Python_ 语言的表达能力就是这样强大！只需对 _Python_ 设计哲学以及相关运行时约定稍有了解，即可将这一切发挥得淋漓尽致！

## 属性描述符

上一小节，我们考察了属性描述符，知道它控制着属性查找的行为。属性描述符分为两种：

-   **非数据描述符** ：只实现了 ___get___ 方法；
-   **数据描述符** ：至少实现了 ___set___ 或者 ___delete___ 方法；

我们对非数据描述符已经有所了解：函数对象就是其中最典型的一个，它包含着类方法 _self_ 参数绑定的全部秘密。然而，我们对数据描述符却一无所知！别急，我们将通过一个典型的例子，将这部分知识补齐。

对于对象 _o_ ，其类型对象为 _t_ 。如果 _t_ 包含数据描述符属性 _a_ ，那么属性设置操作 `o.a = x` 被 _a.__set___ 方法接管；同理，属性删除操作 `del o.a` 则被 _a.__delete___ 方法接管。

如果对象 _o_ 属性空间也存在属性 _a_ ，到底以谁为准呢？简而言之，_Python_ 将照以下优先级逐一确定：

1.  **数据描述符**：如果类型对象 (含父类) 定义了同名数据描述符属性，属性操作将被其接管；
2.  **对象属性**：除了①，属性操作默认在属性空间中完成；
3.  **非数据描述符**：属性访问时，如果①②均不成功，而类型对象 (含父类) 定义了同名非数据描述符，属性访问将被其接管；

因此，数据描述符优先级最高，对象属性空间次之，非数据描述符最低。下图是一个典型的例子：

![](../../youdaonote-images/Pasted%20image%2020221216221955.png)
-   对于属性 _a_ ，由于类型对象 _t_ 属性空间定义了数据描述符，将屏蔽实例对象 _o_ 属性空间中的定义；
-   对于属性 _b_ ，由于类型对象 _t_ 属性空间定义的只是非数据描述符，仍以实例对象 _o_ 属性空间定义的为准；
-   对于属性 _c_ ，由于实例对象 _o_ 属性空间未定义，属性访问将以类型对象 _t_ 属性空间定义的非数据描述符为准；
-   对于属性 _c_ ，由于类型对象 _t_ 属性空间定义的只是非数据描述符，属性设置、删除仍以实例对象 _o_ 属性空间为准；

那么，数据描述符到底有什么用处呢？最典型的场景是利用它来实现针对属性操作的统一验证。

假设我们有一个用户类 _User_ ，其中 _email_ 属性表示用户邮箱地址：

```python
class User:

    def __init__(self, name, email):
        self.name = name
        self.email = email
```

检查用户邮箱地址合法性对应用逻辑非常重要，这样的赋值不应该被允许：

```python
user = User('jim', 'not an email')
```

我们可以在赋值前利用正则表达式对邮箱进行检查：

```python
import re

class User:

    EMAIL_MOD = re.compile('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$')

    def __init__(self, name, email):
        self.name = name

        if not self.EMAIL_MOD.match(email):
            raise Exception('{} is not a valid email'.format(email))

        self.email = email
```

但这种实现方式无法处理一般化的属性设置，漏网之鱼难以避免：

```python
user.email = 'not an email'
```

我们可以在属性设置前加上检查逻辑，但难免会有错漏，代码也略显累赘：

```python
if not self.EMAIL_MOD.match(value):
    raise Exception('{} is not a valid email'.format(value))
user.email = 'not an email'
```

借助 ___setattr___ 魔术函数，我们可以对属性设置进行特殊处理：

```python
import re

class User:

    EMAIL_MOD = re.compile('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$')

    def __init__(self, name, email):
        self.name = name
        self.email = email

    def __setattr__(self, name, value):
        if name == 'email':
            if not self.EMAIL_MOD.match(value):
                raise Exception('{} is not a valid email'.format(value))
            super(User, self).__setattr__(name, value)
            return

        super(User, self).__setattr__(name, value)
```

由于所有属性设置都会被 ___setattr___ 接管，因此我们先判断属性名 _name_ ，仅对 _email_ 属性进行前置检查。检查如果通过，则通过 _super_ 调用父类的 ___setattr___ 完成属性设置。

这样一来，所有对 _email_ 属性的赋值，都会进行合法性检查：

```python
>>> user.email = 'not an email'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 9, in __setattr__
Exception: not an email is not a valid email
```

美中不足的是，不仅 _email_ 属性，其他所有属性设置都会被 ___setattr___ 接管！如果还需要检查其他属性，势必又要在 ___setattr___ 中新增 _if_ 判断。大量代码杂糅在一起，显然不够优雅。

铺垫了一大圈，杀手锏上场了！我们可以为 _email_ 属性实现一个数据描述符：

```python
class EmailField:

    EMAIL_MOD = re.compile('^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w{2,3}$')

    def __init__(self, attrname):
        self.attrname = attrname

    def __get__(self, instance, owner):
        return getattr(instance, self.attrname)

    def __set__(self, instance, value):
        if not self.EMAIL_MOD.match(value):
            raise Exception('{} is not a valid email'.format(value))

        setattr(instance, self.attrname, value)

    def __delete__(self, instance):
        raise Exception('can not delete email')
```

邮箱仍然需要保存在实例对象属性空间中，但属性名不能用 _email_ 了，可以是 __email_ 或者其他。为此，这个例子将底层属性名作为自定义参数 _attrname_ 保存在描述符中。

我们接着考察这个描述符几个关键魔术方法的实现：

-   ___get___ 方法：参数 _instance_ 代表实例对象，_owner_ 代表描述符所在的类对象，方法直接从实例对象中取出底层属性并返回；
-   ___set___ 方法：参数 _instance_ 代表实例对象，_value_ 表示新属性值，方法先检查属性值是否是一个合法邮箱，在调用 setattr 函数将其作为底层属性保存在实例对象中；
-   ___delete___ 方法，直接抛异常，禁止删除邮箱；

借助 _EmailField_ 描述符，我们的 _User_ 类可以这样定义：

```python
class User:

    email = EmailField(attrname='_email')

    def __init__(self, name, email):
        self.name = name
        self.email = email

    def __repr__(self):
        return "User(name='{}', email='{}')".format(self.name, self.email)
```

注意到，我们选择 __email_ 作为底层属性。接着，我们创建一个 _User_ 实例对象 _user_ ：

```python
>>> user
User(name='fasionchan', email='admin@fasionchan.com')
>>> user.email
'admin@fasionchan.com'
```

当我们更新 _email_ 属性时，非法邮箱将无法通过：

```python
>>> user.email = 'not an email'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 9, in __set__
Exception: not an email is not a valid email
```

当然了，我们已经无法将邮箱删除了，如预期的那样：

```python
>>> del user.email
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 12, in __delete__
Exception: can not delete email
```

回过头来看一下实例对象 user 的属性空间，注意到邮箱地址是以 __email_ 属性保存的：

```python
>>> user.__dict__
{'name': 'fasionchan', '_email': 'admin@fasionchan.com'}
```

顺便提一下，在这个例子中 ___get___ 函数 _instance_ 参数为 _user_ 实例对象，而 _owner_ 参数为 _User_ 类对象。

有了数据描述符协议，我们还可以设计出更加巧妙的数据模式，不少数据库 _ORM_ 框架也是这样实现的。

## 上下文管理器

程序有时需要向系统申请一些资源，使用后必须释放，否则将导致资源泄露。

文件是一个典型的例子：当进程向操作系统申请打开一个文件时，操作系统将分配一个文件描述符 (或者叫做文件句柄)；通过文件描述符，进程可以对文件进行读写操作；当所有操作完成后，进程必须将文件关闭，以便释放文件描述符：

```python
f = open('some_file')

for line in f:
    process(line)

f.close()
```

然而，当我们在操作文件时，程序可能会抛出异常，打破正常的执行逻辑。如上述例子，如果 _process_ 函数抛出异常，_f.close()_ 这个语句便永远不会执行了。这时，文件描述符泄露也就无法避免了。

因此，我们需要通过 _try finally_ 结构，确保 _f.close()_ 不受异常影响，一定执行：

```python
f = open('some_file')

try:
    for line in f:
        process(line)
finally:
    f.close()
```

_try finally_ 结构的引入，完美地解决了问题。美中不足的是，代码结构看上去不够优雅，特别是当代码层级较深时。

这时，我们可以借助 _with_ 关键字，做进一步完善：

```python
with open('some_file') as f:
    for line in f:
        process(f)
```

这个例子充分利用文件对象作为 **上下文管理器** ( _Context Manager_ ) 的特性：当程序离开 _with_ 代码块时，将自动关闭文件，不管是正常执行完毕还是抛异常。

上下文管理器一般与 _with_ 关键字搭配使用，可精确控制资源的分配与回收。上下文管理器需要提供两个魔术方法：

-   ___enter___ ，程序在进入 _with_ 代码块前执行，一般用来分配资源，返回值将赋值给 _as_ 关键字指定的变量；
-   ___exit___ ，程序离开 _with_ 代码块后执行，一般用来回收资源；

一个类只要实现了 ___enter___ 和 ___exit___ 魔术方法，便是一个合法的上下文管理器。借此，我们可以优雅地实现一些有意思的功能。举个例子，实现一个计时器，用于跟踪代码执行时间：

```python
import time

class CodeTimer:
    def __init__(self, name):
        self.name = name
    def __enter__(self):
        self.enter_time = time.time()
        print('code timer started, name={}'.format(self.name))
        return self
    def __exit__(self, type, value, traceback):
        print('code timer stop, name={}, expired={}'.format(
            self.name,
            time.time()-self.enter_time,
        ))
```

_CodeTimer_ 类很好理解，它只有两个关键方法：

-   ___enter___ ，记录当前时间并输出启动提示；
-   ___exit___ ，以当前时间减去启动时间计算代码执行时长并输出到屏幕；

好了，现在可以用 CodeTimer 来追踪代码执行时间：

```python
>>> with CodeTimer('example-1'):
...     print('code block starting')
...     time.sleep(1)
...     print('code block ending')
...
code timer started, name=example-1
code block starting
code block ending
code timer stop, name=example-1, expired=1.0018329620361328
```

请留意程序输出内容，这表明 ___enter___ 在代码块开始执行前便执行，而 ___exit___ 在代码块执行完毕后才执行。

接着，我们把 _0_ 作为除数，让代码块抛异常。尽管如此， _CodeTimer_ 还是成功输出代码块执行耗时：

```python
>>> with CodeTimer('example-1'):
...     time.sleep(1)
...     1 / 0
...     time.sleep(1)
...
code timer started, name=example-1
code timer stop, name=example-1, expired=1.0011489391326904
Traceback (most recent call last):
  File "<stdin>", line 3, in <module>
ZeroDivisionError: division by zero
```

通过上下文管理器协议，我们将代码执行计时的细节封装在 _CodeTimer_ 内部。这不仅增强了程序的健壮性，还提高了代码的复用能力，一举多得。