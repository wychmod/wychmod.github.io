**函数** ，作为计算机程序中 **抽象执行流程** 的基本单位，在 **功能分解** 、 **代码复用** 等方面发挥着至关重要的作用。_Python_ 中的函数，相信你一定不会陌生：

```python
>>> pi = 3.14
>>> def circle_area(r):
...     return pi * r ** 2
...
>>> circle_area(2)
12.56
```

这段代码将圆面积计算功能组织成一个函数 _circle_area_ ，圆半径 _r_ 以参数形式作为输入，函数负责计算面积，并将结果作为返回值输出。这样一来，任何需要计算圆面积的地方，只需要调用 _circle_area_ 即可，达到了功能分解以及代码复用的目的。

我们知道 _Python_ 中一切都是对象，函数也是一种对象。那么，作为一等对象的函数，到底长什么模样，有什么特殊行为呢？_Python_ 代码又是如何一步步变身为函数对象的呢？洞悉函数秘密后，可以实现哪些有趣的功能呢？带着这些疑问，我们开始探索函数对象。

# 函数对象如何产生
## 函数对象长啥样

首先，借助内建函数 _dir_ 观察函数对象，发现了不少新属性：

```python
>>> dir(circle_area)
['__annotations__', '__call__', '__class__', '__closure__', '__code__', '__defaults__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__get__', '__getattribute__', '__globals__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__kwdefaults__', '__le__', '__lt__', '__module__', '__name__', '__ne__', '__new__', '__qualname__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__']
```

通过名字，我们可以猜测出某些字段的功能。 ___code___ 应该是一个 **代码对象** ，里面保存着函数的 **字节码** 。从字节码中，我们可以清晰地读懂函数的执行逻辑，跟 _Python_ 语句表达的意思一模一样：

```python
>>> circle_area.__code__
<code object circle_area at 0x10d52d270, file "<stdin>", line 1>
>>> import dis
>>> dis.dis(circle_area.__code__)
  2           0 LOAD_GLOBAL              0 (pi)
              2 LOAD_FAST                0 (r)
              4 LOAD_CONST               1 (2)
              6 BINARY_POWER
              8 BINARY_MULTIPLY
             10 RETURN_VALUE
```

又如， ___globals___ 顾名思义应该是函数的全局名字空间，全局变量 _pi_ 的藏身之地。

```python
>>> circle_area.__globals__
{'__name__': '__main__', '__doc__': None, '__package__': None, '__loader__': <class '_frozen_importlib.BuiltinImporter'>, '__spec__': None, '__annotations__': {}, '__builtins__': <module 'builtins' (built-in)>, 'pi': 3.14, 'circle_area': <function circle_area at 0x10d573950>, 'dis': <module 'dis' from '/usr/local/Cellar/python/3.7.2_2/Frameworks/Python.framework/Versions/3.7/lib/python3.7/dis.py'>}
```

确实如此， _pi_ 的出现证实了我们的猜测。由于 _pi_ 是在 ___main___ 模块中定义的，保存在模块的属性空间内。那么， ___globals___ 到底是模块属性空间本身，还是它的一个拷贝呢？我们接着观察：

```python
>>> circle_area.__globals__ is sys.modules['__main__'].__dict__
True
```

注意到， _sys.modules_ 保存着 _Python_ 当前所有已导入的模块对象，包括 ___main___ 模块。我们取出 ___main___ 模块的属性空间 ___dict___ 与函数全局名字空间对比，发现他们是同一个 _dict_ 对象。原来函数全局名字空间和模块属性空间就是这样紧密绑定在一起的！

此外，我们还可以找到函数名以及所属模块名这两个字段：

```python
>>> circle_area.__name__
'circle_area'
>>> circle_area.__module__
'__main__'
```

函数对象关键属性整理如下：

![](../../youdaonote-images/Pasted%20image%2020221213205649.png)

![](../../youdaonote-images/Pasted%20image%2020221213205701.png)

## 函数对象如何创建

我们已经初步看清 **函数** 对象的模样，它和 **代码** 对象关系密切，**全局名字空间** 就是它所在 **模块** 对象的 **属性空间**。那么，_Python_ 又是如何完成从代码到函数对象的转变的呢？想了解这其中的秘密，还是得从字节码入手。

现在我们要想方设法搞到定义函数的字节码，先将函数代码作为文本保存起来：

```python
>>> text = '''
... pi = 3.14
... def circle_area(r):
...     return pi * r ** 2
... '''
```

然后，调用 compile 函数编译函数代码，得到一个 **代码** 对象：

```python
>>> code = compile(text, 'test', 'exec')
```

根据 **虚拟机** 部分的学习，我们知道 **作用域** 与 **代码** 对象之间的一一对应的关系。定义函数的这段代码虽然简短，里面却包含了两个不同的 **作用域** ：一个是模块级别的 **全局作用域** ，一个函数内部的 **局部作用域** ：

![](../../youdaonote-images/Pasted%20image%2020221214113359.png)

那么，为啥 _compile_ 函数只返回一个代码对象呢？因为局部代码对象作为一个 **常量** ，藏身于全局代码对象中。而 _compile_ 函数则只需返回全局代码对象：

```python
>>> code.co_names
('pi', 'circle_area')
>>> code.co_consts
(3.14, <code object circle_area at 0x10e179420, file "test", line 3>, 'circle_area', None)

>>> code.co_consts[1]
<code object circle_area at 0x10e179420, file "test", line 3>
>>> code.co_consts[1].co_names
('pi',)
>>> code.co_consts[1].co_consts
(None, 2)
```

![](../../youdaonote-images/Pasted%20image%2020221214113641.png)

函数对象诞生的秘密就藏在 _MAKE_FUNCTION_ 指令中。

开始深入源码研究 _MAKE_FUNCTION_ 指令前，我们先推演一遍虚拟机执行这段字节码的全过程。假设 _circle_area_ 在 ___main___ 模块中定义，全局代码对象则作为模块代码执行，以模块 **属性空间** 为 **全局名字空间** 和 **局部名字空间** 。前两行字节码与函数创建无关，在将 _3.14_ 作为 _pi_ 值保存到 **局部名字空间** ，它也是模块的 **属性空间** ：

![](../../youdaonote-images/Pasted%20image%2020221214114034.png)

接下来两行字节码将两个常量加载到栈顶，为创建函数做最后的准备：

![](../../youdaonote-images/Pasted%20image%2020221214114423.png)

这两个常量是创建函数最重要的参数，一个指定函数的 **代码** 对象，一个指定 **函数名** 。 _MAKE_FUNCTION_ 字节码从栈顶取出这两个参数，完成 **函数** 对象的创建，并将其放置于栈顶。此外，函数对象继承了当前 **帧** 对象的 **全局名字空间** 。因此， _circle_area_ 不管在何处调用，其全局名字空间一定是就是它所在模块 ( ___main___ ) 的 **属性空间** 。

![](../../youdaonote-images/Pasted%20image%2020221214115312.png)

紧接着的 _STORE_NAME_ 指令我们已经非常熟悉了，它将创建好的函数对象从栈顶弹出，并保存到局部名字空间。

![](../../youdaonote-images/Pasted%20image%2020221214115400.png)

注意到，这个 **局部名字空间** 正好是模块对象的 **属性空间** ！如果函数是在模块 _demo_ 中定义，则可以这样引用：

```python
>>> import demo
>>> demo.circle_area(2)
```

至此，函数诞生的整个历程我们已经尽在掌握，可以腾出手来研究 _MAKE_FUNCTION_ 这个字节码了。

## MAKE_FUNCTION

经过 **虚拟机** 部分学习，我们对研究字节码的套路早已了然于胸。虚拟机处理字节码的逻辑位于 _Python/ceval.c_ ：

```c
        TARGET(MAKE_FUNCTION) {
            PyObject *qualname = POP();
            PyObject *codeobj = POP();
            PyFunctionObject *func = (PyFunctionObject *)
                PyFunction_NewWithQualName(codeobj, f->f_globals, qualname);

            Py_DECREF(codeobj);
            Py_DECREF(qualname);
            if (func == NULL) {
                goto error;
            }

            if (oparg & 0x08) {
                assert(PyTuple_CheckExact(TOP()));
                func ->func_closure = POP();
            }
            if (oparg & 0x04) {
                assert(PyDict_CheckExact(TOP()));
                func->func_annotations = POP();
            }
            if (oparg & 0x02) {
                assert(PyDict_CheckExact(TOP()));
                func->func_kwdefaults = POP();
            }
            if (oparg & 0x01) {
                assert(PyTuple_CheckExact(TOP()));
                func->func_defaults = POP();
            }

            PUSH((PyObject *)func);
            DISPATCH();
        }
```

1.  第 _2-3_ 行，从栈顶弹出关键参数；
2.  第 _4-5_ 行，调用 _PyFunction_NewWithQualName_ 创建 **函数** 对象， **全局名字空间** 来源于当前 **帧** 对象；
3.  第 _13-16_ 行，如果函数为 **闭包函数** ，从栈顶取 **闭包变量** ；
4.  第 _17-20_ 行，如果函数包含注解，从栈顶取注解；
5.  第 _21-28_ 行，如果函数参数由默认值，从栈顶取默认值，分为普通默认值以及非关键字默认值两种；

_PyFunction_NewWithQualName_ 函数在 _Objects/funcobject.c_ 源文件中实现，主要参数有 3 个：

-   _code_，**代码对象**；
-   _globals_， **全局名字空间**；
-   _qualname_，**函数名**；

_PyFunction_NewWithQualName_ 函数则实例化 **函数** 对象 ( _PyFunctionObject_ )，并根据参数初始化相关字段。

当然了，我们也可以用 _Python_ 语言模拟这个过程。根据 **对象模型** 中规则，调用 **类型** 对象即可创建 **实例** 对象。只是 Python 并没有暴露 **函数类型** 对象，好在它不难找：

```python
>>> def a():
...     pass
... 
>>> function = a.__class__
>>> function
<class 'function'>
```

我们随便定义了一个函数，然后通过 ___class___ 找到它的 **类型** 对象，即 **函数类型** 对象。

然后，我们准备函数的 **代码** 对象：

```python
>>> text = '''
... def circle_area(r):
...     return pi * r ** 2
... '''
>>> code = compile(text, 'test', 'exec')
>>> func_code = code.co_consts[0]
>>> func_code
<code object circle_area at 0x10e029150, file "test", line 2>
```

由此一来，函数三要素便已俱备，调用 **函数类型** 对象即可完成临门一脚：

```python
>>> circle_area = function(func_code, globals(), 'circle_area')
>>> circle_area
<function circle_area at 0x10e070620>
```

至此，我们得到了梦寐以求的 **函数** 对象，而且是以一种全新的方式！

但是，我们把全局变量 _pi_ 忘在脑后了，没有它函数跑不起来：

```python
>>> circle_area(2)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "test", line 3, in circle_area
NameError: name 'pi' is not defined
```

这难不倒我们，加上便是：

```python
>>> pi = 3.14
>>> circle_area(2)
12.56
```

不仅如此，我们还可以为函数加上参数默认值：

```python
>>> circle_area.__defaults__ = (1,)
```

由此一来，如果调用 _circle_area_ 函数时未指定参数，则默认以 _1_ 为参数。

```python
>>> circle_area()
3.14
>>> circle_area(3)
28.26
>>> circle_area(1)
3.14
```

> r在代码对象的另一个名字列表co_varnames中，图的空间有限，没有画出来。co_names和co_varnames是有区别的，co_varnames中的是局部变量和闭包变量。这两类变量都是作为数组保存在栈帧对象中的，比较特殊。co_names中的是全局变量和内建变量，需要搜索全局名字空间和内建名字空间。

# 函数调用与虚拟机软件栈

我们将 circle_area 定义在 _geometry_ 模块中，文件名为 _geometry.py_ ：

```python
pi = 3.14

def circle_area(r):
    return pi * r ** 2

def cylinder_volume(r, h):
    return circle_area(r) * h
```

注意到，模块中还有另一个函数 _cylinder_volume_ 用于计算圆柱体体积，参数 _r_ 是底面圆的半径，参数 _h_ 是圆柱体高度。 _cylinder_volume_ 先调用 _circle_area_ 计算底面面积，再乘以高度得到圆柱体积。

进入 _geometry.py_ 所在目录，并启动 _Python_ 终端，将 _geometry.py_ 模块导入，即可调用相关函数：

```python
>>> from geometry import circle_area, cylinder_volume
>>> circle_area(1.5)
7.065
```

如果你不想进入 _geometry.py_ 所在目录，也可以将其路径加入到 _sys.path_ ，这个方法我们在模块机制中介绍过：

```python
>>> import sys
>>> sys.path.append('/some/path')
```

开始讨论函数调用流程之前，我们先来看看从 _geometry_ 模块导入相关函数后虚拟机内部的状态：

![](../../youdaonote-images/Pasted%20image%2020221214160804.png)

-   ___main___ 模块是 _Python_ 启动后的执行入口，每个 _Python_ 程序均从 ___main___ 开始执行；
-   _geometry_ 是我们导入的模块，它有一个 ___dict___ 属性，指向模块属性空间；
-   _geometry_ 初始化后，属性空间里有一个浮点属性 _pi_ 以及两个函数对象， _circle_area_ 和 _cylinder_colume_ ；
-   两个函数的 **全局名字空间** 与模块对象的 **属性空间** 是同一个 _dict_ 对象；
-   两个函数都有一个 **代码对象** ，保存函数 **字节码** 以及 **名字** 、 **常量** 等静态上下文信息；
-   往下阅读前请务必理解该状态图，有疑问请复习虚拟机模块机制以及函数创建等章节，以加深理解；

每个 _Python_ 程序都有一个 ___main___ 模块，以及与 ___main___ 模块对应的 **栈帧** 对象。___main___ 模块是 _Python_ 程序的入口，而与其对应的栈帧对象则是整个程序调用栈的起点。

当我们在交互式终端输入语句时，也是类似的。 _Python_ 先将代码编译成代码对象，再创建一个 **栈帧** 对象执行该代码对象。以 `circle_area(1.5)` 为例，编译可得到这样的字节码：

```python
  1           0 LOAD_NAME                0 (circle_area)
              2 LOAD_CONST               0 (1.5)
              4 CALL_FUNCTION            1
              6 PRINT_EXPR
              8 LOAD_CONST               1 (None)
             10 RETURN_VALUE
```

随后，_Python_ 创建栈帧对象作为执行环境，准备执行编译后的代码对象：

![](../../youdaonote-images/Pasted%20image%2020221214161223.png)

注意到，栈帧对象全局名字空间、局部名字空间均指向 ___main___ 模块的属性空间。 `circle_area(1.5)` 的语句中，有些我们已经非常熟悉了。第一条字节码，将名为 _circle_area_ 的对象，加载到栈顶，这是我们导入的函数。第二条字节码，将常量 _1.5_ 加载到栈顶，这是准备传递给函数的变量。执行这两个字节码后，虚拟机状态变为：

![](../../youdaonote-images/Pasted%20image%2020221214161709.png)

接着是 _CALL_FUNCTION_ 字节码，顾名思义，我们知道正式它完成了调动函数的使命。_CALL_FUNCTION_ 字节码的处理逻辑同样位于 Python/ceval.c 这个文件，有兴趣的童鞋可以阅读一下源码，这里用通俗的语言结合图示讲解这个字节码的作用。

_CALL_FUNCTION_ 先创建一个新栈帧对象，作为 _circle_name_ 函数的执行环境。新栈帧对象通过 _f_back_ 指针，指向前一个栈帧对象，形成一个调用链。栈帧对象从函数对象取得 **代码** 对象，以及执行函数时的全局名字空间：

![](../../youdaonote-images/Pasted%20image%2020221214162302.png)

此外，注意到执行函数的栈帧对象 _f_locals_ 字段为空，而不是跟 _f_globals_ 一样执行一个 _dict_ 对象。由于函数有多少局部变量是固定的，代码编译时就能确定。因此，没有必要用字典来实现局部名字空间，只需把局部变量依次编号，保存在栈底即可 ( _r=1.5_ 处)。这样一来，通过编号即可快速存取局部变量，效率比字典更高。于此对应，有一个特殊的字节码 LOAD_FAST 用于加载局部变量，以操作数的编号为操作数。

_circle_area_ 的字节码我们已经很熟悉了，便不再赘述了，请动手在栈帧上推演一番。最后， _RETURN_VALUE_ 字节码将结算结果返回给调用者，执行权现在交回调用者的 _CALL_FUNCTION_ 字节码。_CALL_FUNCTION_ 先将结果保存到栈顶并着手回收 _circle_area_ 函数的栈帧对象。

![](../../youdaonote-images/Pasted%20image%2020221214162503.png)

嵌套调用也是类似的，以 `cylinder_volume(1.5, 2)` 为例：

```python
>>> cylinder_volume(1.5, 2)
14.13
```

Python 交互式终端同样先对这个语句进行编译，得到这样的字节码：

```python
  1           0 LOAD_NAME                0 (cylinder_volume)
              2 LOAD_CONST               0 (1.5)
              4 LOAD_CONST               1 (2)
              6 CALL_FUNCTION            2
              8 PRINT_EXPR
             10 LOAD_CONST               2 (None)
             12 RETURN_VALUE
```

然后， _Python_ 虚拟机以 ___main___ 栈帧对象为环境，执行这段字节码。当虚拟机执行到 _CALL_FUNCTION_ 这个字节码时，创建新栈帧对象，准备执行函数调用。初始新栈帧对象时，函数参数来源于当前栈顶，而全局名字空间与代码对象来源于被调用函数对象。新栈帧对象初始化完毕，虚拟机便跳到新栈帧，开始执行 _cylinder_volume_ 的字节码。_cylinder_volume_ 字节码中也有 _CALL_FUNCTION_ 指令，调用 _circle_area_ 函数。虚拟机依样画葫芦，为 _circle_area_ 准备栈帧，并开始执行 _circle_area_ 的字节码：

![](../../youdaonote-images/Pasted%20image%2020221214162651.png)

这样一来，随着函数调用的深入，栈帧链逐渐伸长；随着函数执行完毕并返回，栈帧链逐渐收缩。维护栈帧链条的关键是栈帧对象的 _f_back_ 指针，它总是指向上个一栈帧对象，也就是调用者的栈帧，如上图红色箭头。我们在调试程序时，可以查看完整的堆栈信息，也是 _f_back_ 指针的功劳。

正常情况下，函数调用层数不会太深，但递归调用就说不定了。我们来看一个典型的递归例子，斐波那契数列计算：

```python
def fibonacci(n):
    if n == 0:
        return 0
    if n == 1:
        return 1

    return fibonacci(n-1) + fibonacci(n-2
```

以 _fibonacci(5)_ 为例，需要递归调用 _fibonacii(4)_ ，而 _fibonacii(4)_ 需要调用 _fibonacci(3)_ ，以此类推。递归调用一直向下延伸，直到 _fibonacci(1)_ 。因此，调用链最长时是这样子的：