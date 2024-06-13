# javaagent基本原理

## 关于JVMTI （jvm tool interface）

JVMTI是⽤来开发和监控JVM所使⽤的程序接⼝，可以探查JVM内部状态，并控制JVM应⽤程序的执⾏。可实现的功能包括但不限于：调试、监控、线程分析、覆盖率分析⼯具等。需要注意的是，并⾮所有的JVM实现都⽀持JVMTI。

JVMTI是双通道接⼝(two-way interface)。JVMTI的客户端，或称为代理(agent)，可以监听感兴趣的事件。JVMTI提供了很多函数，以便来查询或控制应⽤程序。

JVMTI代理与⽬标JVM运⾏在同⼀个进程中，通过JVMTI进⾏通信，最⼤化控制能⼒，最⼩化通信成本。典型场景下，JVMTI代理会被实现的⾮常紧凑，其他的进程会与JVMTI代理进⾏通信，进⽽实现控制JVM应⽤程序的⽬标。

# javaagent核⼼应⽤

# javaagent实践