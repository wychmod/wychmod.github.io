# 1. GC的基础知识

## 1.1 什么是垃圾

> C语言申请内存：malloc free
>
> C++： new delete
>
> c/C++ 手动回收内存
>
> Java: new ？
>
> 自动内存回收，编程上简单，系统不容易出错，手动释放内存，容易出两种类型的问题：
>
> 1. 忘记回收
> 2. 多次回收

没有任何引用指向的一个对象或者多个对象（循环引用）

## 1.2 如何定位垃圾

### 1.2.1 引用计数（ReferenceCount）

### 1.2.2 根可达算法(RootSearching)

> 根可达算法（Root Reachable Algorithm）是一种用于图中节点可达性判断的算法。该算法通过判断从根节点出发，是否可以到达目标节点来确定节点的可达性。

![](../youdaonote-images/Pasted%20image%2020230813232206.png)

## 1.3 常见的垃圾回收算法

### 1.3.1 标记清除(mark sweep)

### 1.3.2 拷贝算法 (copying)

### 1.3.3 标记压缩(mark compact)