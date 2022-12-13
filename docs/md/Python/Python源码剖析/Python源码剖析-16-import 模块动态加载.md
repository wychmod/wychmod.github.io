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

至此，_Python_ 模块动态加载的秘密已经浮出水面了。在字节码层面，_IMPORT_NAME_ 负责加载模块， **模块名** 由操作数指定，其他参数来源于 **运行栈** 。虽然 _IMPORT_NAME_ 指令还没来得及研究，成就感也是满满的呢！