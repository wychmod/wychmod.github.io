# 1.JVM运行原理
![](../youdaonote-images/Pasted%20image%2020230807150844.png)
![](../youdaonote-images/Pasted%20image%2020230807231506.png)
![](../youdaonote-images/Pasted%20image%2020230808105518.png)

## 1.1 JVM与class文件格式
- jvm是一种规范
	- java virtual machine specifications
	- https://docs.oracle.com/en/java/javase/13/
	- https://docs.oracle.com/javase/specs/index.html
- 虚构出来的一台计算机
	- 字节码指令集（汇编语言）
	- 内存管理：栈 堆 方法区等
- JVM跟java无关
![](../youdaonote-images/Pasted%20image%2020230808105703.png)

## 1.2 常见JVM实现

![](../youdaonote-images/Pasted%20image%2020230808122657.png)

## 1.3 编译器干了什么
![](../youdaonote-images/Pasted%20image%2020230807171222.png)

## 1.4 JDK JRE JVM

![](../youdaonote-images/Pasted%20image%2020230807150952.png)

## 1.5 类文件（class 文件）

### 1.5.1 16进制class文件
```java
cafe babe 0000 0034 003f 0a00 0a00 2b08 002c 0900 0d00 2d06 4059 0000 0000 0000 0900 0d00 2e09 002f 0030 0800 310a 0032 0033 0700 340a 000d 0035 0900 0d00 3607 0037 0100 046e 616d 6501 0012 4c6a 6176 612f 6c61 6e67 2f53 7472 696e 673b 0100 0361 6765 0100 0149 0100 0673 616c 6172 7901 0001 4401 000d 436f 6e73 7461 6e74 ......
```

![](../youdaonote-images/Pasted%20image%2020230808125123.png)
### 1.5.2 The ClassFile Structure

```java
ClassFile {

u4 magic;

u2 minor_version;

u2 major_version;

u2 constant_pool_count;

cp_info constant_pool[constant_pool_count-1];

u2 access_flags;

u2 this_class;

u2 super_class;

u2 interfaces_count;

u2 interfaces[interfaces_count];

u2 fields_count;

field_info fields[fields_count];

u2 methods_count;

method_info methods[methods_count];

u2 attributes_count;

attribute_info attributes[attributes_count];

}
```

![](../youdaonote-images/马士兵教育%20java1.8类文件格式第一版.png)
### 1.5.3 分析classfile结构

- u4: cafebabe 
	magic: magic项提供标识类文件格式的magic数字
- u2+u2:0000+0034，34等于10进制的52，表示JDK8
	minor_version
	major_version
- u2:003f=63(10进制)
	constant_pool_count: constant_pool_count项的值等于constant_pool表的表项数加1。
	表示常量池中的数量是62
- cp_info constant_pool[constant_pool_count-1]
	常量池主要存储两方面内容：字面量(Literal)和符号引用(Symbolic References)

> 字面量:文本字符串，final修饰等 
> 符号引用：类和接口的全限定名、字段名称和描述符、方法名称和描述符

### 1.5.4 反编译验证

JVM相对class文件来说可以理解为是操作系统；class文件相对JVM来说可以理解为是汇编语言或者机器语言。

> 编译指令：javap -v -p Person.class
> 或者使用IDEA的插件 View -> Show Bytecode With Jclasslib

![](../youdaonote-images/Pasted%20image%2020230808130629.png)

![](../youdaonote-images/Pasted%20image%2020230807172352.png)

![](../youdaonote-images/Pasted%20image%2020230807172427.png)

![](../youdaonote-images/Pasted%20image%2020230807172441.png)


# 2.类加载机制

![](../youdaonote-images/Pasted%20image%2020230807172801.png)

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
### 2.2.1 验证阶段

根据Java虚拟机规范，来校验你加载进来的“.class”文件中的内容，是否符合指定的规范。

假如说，你的“.class”文件被人篡改了，里面的字节码压根儿不符合规范，那么JVM是没法去执行这个字节码的。

![](../youdaonote-images/Pasted%20image%2020230807232258.png)

### 2.2.2 准备阶段

### 2.2.1 验证阶段

## 2.3 类加载器

![](../youdaonote-images/Pasted%20image%2020230808164904.png)

```java
public class T002_ClassLoaderLevel {  
    public static void main(String[] args) {  
        System.out.println(String.class.getClassLoader());  
        System.out.println(sun.awt.HKSCS.class.getClassLoader());  
        System.out.println(sun.net.spi.nameservice.dns.DNSNameService.class.getClassLoader());  
        System.out.println(T002_ClassLoaderLevel.class.getClassLoader());  
  
        System.out.println(sun.net.spi.nameservice.dns.DNSNameService.class.getClassLoader().getClass().getClassLoader());  
        System.out.println(T002_ClassLoaderLevel.class.getClassLoader().getClass().getClassLoader());  
  
        System.out.println(new T006_MSBClassLoader().getParent());  
        System.out.println(ClassLoader.getSystemClassLoader());  
    }  
}

null
null
sun.misc.Launcher$ExtClassLoader@7d4991ad
sun.misc.Launcher$AppClassLoader@18b4aac2
null
null
sun.misc.Launcher$AppClassLoader@18b4aac2
sun.misc.Launcher$AppClassLoader@18b4aac2
```

> 通过getclass获取Bootstrap级别的classLoader会显示Null 因为是c++实现的。

### 2.3.1 双亲委派


- 父加载器
	- 父加载器不是“类加载器的加载器”！！！！！也不是“类加载器的父类加载器” 只是一种逻辑上的关系
- 双亲委派是一个孩子向父亲方向（看父亲是否有目标加载类的缓存），然后父亲向孩子方向的双亲委派过程（当父亲都没有时，父亲向孩子查找当前孩子是否具有加载目标类的职责）
	- 当加载不成会抛出notfountclassload
- 思考：为什么要搞双亲委派
	- java.lang.String类由自定义类加载器加载行不行？
	- 为了安全起见，防止使用自定义类加载器，加载修改过有风险的核心类，如果父加载过就不会再加载。同时也是提高了效率，父加载过子不用重复加载。

![](../youdaonote-images/Pasted%20image%2020230808170700.png)

### 2.3.2 类加载器范围

**来自Launcher源码**
-  sun.boot.class.path
	- Bootstrap ClassLoader加载路径
- java.ext.dirs
	- ExtensionClassLoader加载路径
- java.class.path
	- AppClassLoader加载路径


### 2.3.1 双亲委派

### 2.3.1 双亲委派