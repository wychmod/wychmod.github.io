# javaagent基本原理

## 关于JVMTI （jvm tool interface）

JVMTI是⽤来开发和监控JVM所使⽤的程序接⼝，可以探查JVM内部状态，并控制JVM应⽤程序的执⾏。可实现的功能包括但不限于：调试、监控、线程分析、覆盖率分析⼯具等。需要注意的是，并⾮所有的JVM实现都⽀持JVMTI。

JVMTI是双通道接⼝(two-way interface)。JVMTI的客户端，或称为代理(agent)，可以监听感兴趣的事件。JVMTI提供了很多函数，以便来查询或控制应⽤程序。

JVMTI代理与⽬标JVM运⾏在同⼀个进程中，通过JVMTI进⾏通信，最⼤化控制能⼒，最⼩化通信成本。典型场景下，JVMTI代理会被实现的⾮常紧凑，其他的进程会与JVMTI代理进⾏通信，进⽽实现控制JVM应⽤程序的⽬标。
## JVMTI的功能

从⼤的⽅⾯来说，JVMTI 提供了可⽤于 debug 和profiler 的接⼝；同时，在 Java 5/6 中，虚拟机接⼝也增加了监听（Monitoring），线程分析（Thread analysis）以及覆盖率分析（Coverage Analysis）等功能。从⼩的⽅⾯来说包含了虚拟机中线程、内存、堆、栈、类、⽅法、变量，事件、定时器处理等等诸多功能。通过这些接⼝，开发⼈员不仅可以调试在该虚拟机上运⾏的 Java 程序，还能查看它们运⾏的状态，设置回调函数，控制某些环境变量，从⽽优化程序性能。

> 参考⽂档：
>https://blog.caoxudong.info/blog/2017/12/07/jvmti_reference
>https://docs.oracle.com/javase/8/docs/platform/jvmti/jvmti.html

![](../../youdaonote-images/Pasted%20image%2020240613112926.png)

> JDI代表Java调试接口（Java Debug Interface）。它是Java平台调试架构（JPDA）的一部分，允许开发人员在Java应用程序中构建调试工具。JDI提供了一组API，使得开发人员可以控制程序的执行，检查程序状态，以及在运行时修改程序行为。

> JDWP，全称Java Debug Wire Protocol，是Java平台调试架构（JPDA）的一部分，用于定义调试器（Debugger）和被调试应用（Debuggee）之间的通信协议。
> JDWP规定了调试信息的传输格式，例如请求、回复和事件。它并不关心信息的具体传输方式，可以通过套接字（socket）或共享内存等方式进行。

javaagent是java1.5之后引入的特性，基于JVMTIS实现，支持JVMTI部分功能。主要应用场景是对类加载进行拦截修改，和对已加载的类进行重定义。此外还支持获取已加载的类，以及实例内存占用计算等。

## javaagent启动

javaagent的表现形式是⼀个监听JAR包，⽤于监听⽬标应⽤，它有两种启动⽅式分别是：
1. 加载启动：即跟着监听⽬标应⽤⼀起启动，通过设置⽬标应⽤的jvm参数-javaagent:,即可加载javaagent监听jar包。
2. 附着启动：在⽬标应⽤的运⾏过程中去加载agent包，借助jvm tools⼯具包可将agent包注⼊到⽬标应⽤中。

## 加载启动(premain)

加载启动项⽬的agent jar包与运⾏时JAR包有什么区别，通过下表可以看出：

![](../../youdaonote-images/Pasted%20image%2020240613114549.png)

通过⼀个示例 让我们更好的去理解javaagent属性。

### 启动类
```java

```

# javaagent核⼼应⽤

# javaagent实践