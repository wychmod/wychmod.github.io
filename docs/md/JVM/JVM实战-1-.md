# 1.JVM运行原理
![](../youdaonote-images/Pasted%20image%2020230807150844.png)
![](../youdaonote-images/Pasted%20image%2020230807231506.png)

# 2.类加载机制
## 2.1 JVM在什么情况下会加载一个类？

一个类从加载到使用，一般会经历下面的这个过程：

**加载 -> 验证 -> 准备 -> 解析 -> 初始化 -> 使用 -> 卸载**

![](../youdaonote-images/Pasted%20image%2020230807173041.png)

啥时候会从“.class”字节码文件中加载这个类到JVM内存里来?

是在**你的代码中用到这个类的时候**。

比如下面这个类：

![](../youdaonote-images/Pasted%20image%2020230807231945.png)

这个时候就会触发JVM通过类加载器，从“ReplicaManager.class”字节码文件中加载对应的类到内存里来使用，这样代码才能跑起来。

![](../youdaonote-images/Pasted%20image%2020230807232040.png)

## 2.2 验证、准备和初始化的过程
#