### 字节码

透过字节码，我们可以洞悉 _Python_ 执行语句的全部秘密。因此，我们从研究 _import_ 语句字节码入手，逐步深入研究模块的加载过程。

### import

以最基本的 _import_ 语句为例：

```python
import demo
```

借助 _dis_ 模块，我们将这个语句反编译，得到以下字节码：

```python
  1           0 LOAD_CONST               0 (0)
              2 LOAD_CONST               1 (None)
              4 IMPORT_NAME              0 (demo)
              6 STORE_NAME               0 (demo)
              8 LOAD_CONST               1 (None)
             10 RETURN_VALUE
```

我们重点关注前 _4_ 条字节码，看它们在 _Python_ 虚拟机中是如何执行的：

![](../../youdaonote-images/Pasted%20image%2020221213111646.png)

1.  前 _2_ 条字节码执行完毕后，_0_ 以及 _None_ 这两个常量被加载到栈中；
2.  顾名思义，_IMPORT_NAME_ 指令负责加载模块，模块名由操作数指定，其他参数从栈上取；模块加载完毕后，模块对象便保存在栈顶；
3.  最后，_STORE_NAME_ 指令从栈顶取出模块对象并保存到局部名字空间中；

至此，_Python_ 模块动态加载的秘密已经浮出水面了。在字节码层面，_IMPORT_NAME_ 负责加载模块， **模块名** 由操作数指定，其他参数来源于 **运行栈** 。

### import as

开始研究 _IMPORT_NAME_ 指令实现细节前，一鼓作气将其他几种 import 语句变体拿下。先研究 _impot as_ 语句：

```python
import demo as d
```

同样用 dis 对语句进行反编译，我们得到以下字节码：

```python
  1           0 LOAD_CONST               0 (0)
              2 LOAD_CONST               1 (None)
              4 IMPORT_NAME              0 (demo)
              6 STORE_NAME               1 (d)
              8 LOAD_CONST               1 (None)
             10 RETURN_VALUE
```

这段字节码跟前一段几乎一模一样，区别只是 _STORE_NAME_ 指令，它用换个名字来保存被加载模块：

![](../../youdaonote-images/Pasted%20image%2020221213120756.png)

因此，这个 _import_ 语句变体其实等价于：

```python
import demo
d = demo
del demo
```

### from import

现在再接再厉，拿下 _from import_ 语句：

```python
from demo import value
```

同样用 _dis_ 对语句进行反编译，我们得到以下字节码：

```python
  1           0 LOAD_CONST               0 (0)
              2 LOAD_CONST               1 (('value',))
              4 IMPORT_NAME              0 (demo)
              6 IMPORT_FROM              1 (value)
              8 STORE_NAME               1 (value)
             10 POP_TOP
             12 LOAD_CONST               2 (None)
             14 RETURN_VALUE
```

我们看到一个新面孔—— _IMPORT_FROM_ 指令。该指令从栈顶模块中取出指定名字，并保存于栈顶。

![](../../youdaonote-images/Pasted%20image%2020221213120940.png)
注意到，_value_ 以 **元组** 的形式保存于栈顶，_IMPORT_NAME_ 指令如果发现 _value_ 为 _demo_ 模块的子模块，将同时加载 _value_ 子模块。此外，_IMPORT_FROM_ 与 _STORE_NAME_ 这两个指令相互配合，从模块中取出给定名字并保存。如果 _from import_ 语句一次性导入多个名字，字节码将包含多个由 _IMPORT_FROM_ 和 _STORE_NAME_ 组成的指令对：

```python
from demo import value, data
```

```python
  1           0 LOAD_CONST               0 (0)
              2 LOAD_CONST               1 (('value', 'data'))
              4 IMPORT_NAME              0 (demo)
              6 IMPORT_FROM              1 (value)
              8 STORE_NAME               1 (value)
             10 IMPORT_FROM              2 (data)
             12 STORE_NAME               2 (data)
             14 POP_TOP
             16 LOAD_CONST               2 (None)
             18 RETURN_VALUE
```

这也是 _IMPORT_FROM_ 指令不将模块对象从栈顶弹出的原因——只有所有需要导入的名字均导入完毕，模块对象才可从栈顶弹出，这个使命正是由紧接着的 _POP_TOP_ 指令完成！

综上所述，_from import_ 语句实际上等价于：

```python
import demo
value = demo.value
del demo
```

### from import as

_from import as_ 语句与 _from import_ 语句的关系，跟 _import as_ 语句与 _import_ 语句的关系一样。这两种语句的差别只在 _STORE_NAME_ 字节码的操作数上，而操作数直接决定了被导入对象以什么名字在局部名字空间中保存。_from import as_ 语句示例以及对应的字节码分别如下，相信轻易即可看懂，就不再赘述了：

```python
from demo import value as v
```

```python
  1           0 LOAD_CONST               0 (0)
              2 LOAD_CONST               1 (('value',))
              4 IMPORT_NAME              0 (demo)
              6 IMPORT_FROM              1 (value)
              8 STORE_NAME               2 (v)
             10 POP_TOP
             12 LOAD_CONST               2 (None)
             14 RETURN_VALUE
```

## 模块加载流程

现在回过头来看 _Python_ 虚拟机是如何执行 _IMPORT_NAME_ 指令的，从中便可洞悉 _Python_ **模块动态加载机制** 。

_IMPORT_NAME_ 字节码指令在 _Include/opcode.h_ 头文件中定义，其后紧挨着 _IMPORT_FROM_ 指令：

```c
#define IMPORT_NAME             108
#define IMPORT_FROM             109
```

_Python_ 虚拟机实现位于 _Python/ceval.c_ 源文件中，_IMPORT_NAME_ 指令的处理逻辑也在其中(第 _2595_ 行)：

```c
        TARGET(IMPORT_NAME) {
            PyObject *name = GETITEM(names, oparg);
            PyObject *fromlist = POP();
            PyObject *level = TOP();
            PyObject *res;
            res = import_name(f, name, fromlist, level);
            Py_DECREF(level);
            Py_DECREF(fromlist);
            SET_TOP(res);
            if (res == NULL)
                goto error;
            DISPATCH();
        }
```

1.  第 _2_ 行，根据字节码 **操作数** 取出待加载 **模块名** ；
2.  第 _3_ 行，从栈顶弹出 _fromlist_ 参数，参数是一个元组，列举了需要加载的潜在 **子模块** ；
3.  第 _4_ 行，从栈顶弹出 _level_ 参数；
4.  第 _6_ 行，调用 _import_name_ 函数完成模块加载工作；
5.  第 _7-9_ 行，释放参数并将加载到的 **模块对象** 保存到栈顶；

_import_name_ 函数则调用位于 _Python/import.c_ 的 _PyImport_ImportModuleLevelObject_ 函数，接口如下：

```c
PyObject *
PyImport_ImportModuleLevelObject(PyObject *name, PyObject *globals,
                                 PyObject *locals, PyObject *fromlist,
                                 int level);
```

函数大部分参数我们已经很熟悉了，但 _globals_ 和 _locals_ 这两个名字空间有什么作用呢？_Python_ 导入模块时可以使用相对路径，这时需要根据 _import_ 语句所在模块计算绝对路径，而模块名则保存在 _globals_ 名字空间中：

```python
from .a.b import c
```

我不打算事无巨细地介绍 _Python/import.c_ 中的源码，毕竟超过 _2000_ 行的代码量需要相当的篇幅才能讲解清楚。接下来，我力求以最简洁的 _Python_ 语言，描述清楚模块的加载流程。鼓励学有余力的童鞋，到源码中探究一番。

解析得到绝对模块名后，_Python_ 便开始查找并加载模块。那么，如果模块已经加载过了，_Python_ 如何处理呢呢？说来也简单，_Python_ 内部用一个 _dict_ 对象记录所有已经加载的模块，这个 _dict_ 位于 _sys_ 模块中：

```python
>>> import sys
>>> for name, module in sys.modules.items():
...     print(name)
... 
sys
builtins
# ...
```

_Python_ 加载模块前，先检查 _sys.modules_ ；如果发现目标模块已经加载过，则直接将其返回。因此，一个模块不管被多少 _import_ 语句导入，第一次加载后便不再重复加载了。

想要加载被导入模块，_Python_ 需要找到模块代码的具体位置，这便是 _Python_ **模块搜索** 过程。_Python_ 在内部维护了一个模块搜索路径的列表，同样位于 _sys_ 模块内：

```python
>>> import sys
>>> for path in sys.path:
...     print(repr(path))
... 
''
'/Users/fasion/opt/pythons/python3/lib/python37.zip'
'/Users/fasion/opt/pythons/python3/lib/python3.7'
'/Users/fasion/opt/pythons/python3/lib/python3.7/lib-dynload'
'/usr/local/Cellar/python/3.7.3/Frameworks/Python.framework/Versions/3.7/lib/python3.7'
'/Users/fasion/opt/pythons/python3/lib/python3.7/site-packages'
```

_Python_ 遍历每个路径，直到发现目标模块。如果遍历完所有路径还是没找到目标模块，_Python_ 便只好抛异常了。目标模块代码找到后，_Python_ 对代码进行编译，生成 _PyCodeObject_ 。如果存在 _pyc_ 文件，则可以省略编译过程，直接从 _pyc_ 文件中加载 _PyCodeObject_ 。以导入 _demo_ 模块为例：

```python
# 读取模块代码
text = read('demo.py')

# 编译模块代码
code = compile(text, 'demo.py', 'exec')
```

至此，_Python_ 得到了代表模块逻辑的 **代码** 对象 _PyCodeObject_ 。接着，_Python_ 创建一个全新的 **模块** 对象。模块对象在 _Python_ 内部由 _PyModuleObject_ 结构体表示，位于 _Objects/moduleobject.c_ 。 **模块** 对象也是内建对象中的一种，有兴趣的童鞋参照 **内建对象** 部分的思路研究源码，在此不再展开。

由于需要直接创建 **模块对象** 的场景极少，_Python_ 没有将 **模块类型** 暴露出来，这跟其他内置对象类型略有差别：

```python
>>> int
<class 'int'>
>>> module
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'module' is not defined
```

根据 **对象模型** 部分学到的知识，还有另一条路可以找到 **模块类型** 对象——通过已存在的 **模块** 对象顺藤摸瓜！由于每个 _Python_ 程序都包含一个 ___main___ 模块，这就是最合适的媒介了：

```python
>>> import __main__
>>> __main__
<module '__main__' (built-in)>
```

**模块类型** 对象便位于 **模块** 对象的 _ob_type_ 字段，通过 ___class___ 属性即可获取：

```python
>>> module = __main__.__class__
>>> module
<class 'module'>
```

_Python_ 内部便是通过 **模块类型** 对象创建实例对象的，只需提供 **模块名** 以及 **模块文档信息** ：

```python
>>> demo = module('demo', 'A test module')
>>> help(demo)
>>> dir(demo)
['__doc__', '__loader__', '__name__', '__package__', '__spec__']
>>> demo.__doc__
'A test module'
```

至此，我们得到一个全新的 **模块** 对象，尽管这个模块对象还是个空架子。根据前面章节的内容，我们知道 **模块** 的 **属性空间** 由一个 _dict_ 对象实现，这个 _dict_ 可通过 ___dict___ 属性找到：

```python
>>> demo.__dict__
{'__name__': 'demo', '__doc__': 'A test module', '__package__': None, '__loader__': None, '__spec__': None}
>>> demo.a
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: module 'demo' has no attribute 'a'
>>> demo.__dict__['a'] = 1
>>> demo.a
1
```

接着，_Python_ 执行模块代码对象，完成模块初始化：

```python
>>> exec(code, demo.__dict__, demo.__dict__)
```

注意到，模块 **属性空间** 作为 **全局名字空间** 以及 **局部名字空间** 传给了 _exec_ 函数。

假设 _demo.py_ 只包含一行代码，请大家自行脑补字节码在 _Python_ 虚拟机执行的步骤以及结果：

```python
value = 1
```