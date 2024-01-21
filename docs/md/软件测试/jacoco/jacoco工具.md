# 1. Jacoco原理
Jacoco使用插桩的方式来记录覆盖率数据，是通过一个probe探针注入。
插桩模式有两种：
1. on-the-fly模式
> JVM中通过javaagent参数指定特定的jar文.件启动Instrumentation的代埋程序，代埋程序在通过ClassLoader装载一个class前判断是否转换修改class文件，将统计代码插入class,测试覆盖率分析可以在JVM执行测试代码的过程中完成.

2. offline模式
> 在测试之前先对文件进行插桩，生成插桩的class或jar包，测试插过桩的class和jar包，生成覆盖率信息到文件，最后统一处理，生成报告。
3. on-the-fly和offline对比
on-the-fly更方便简单，无需提前插桩，无需考忘classpath设置问题。
存在以下情况不适台使用on-the-fly模式：
- 不支持javaagent
- 无法设置JVM参数
- 字节码需要被转换成其他虚拟机
- 动态修改字节码过程和其他agent冲突
- 无法自定义用户加载类

# 2. Jacoco命令

1. jacoco客户端，收集信息
```java
java -javaagent:jacocoagent.jar=includes=*,output=tcpserver,port=6300,address=localhost,append=true -jar demo-0.0.1.jar
```

2. dump生产exec文件(全量)

```java
java -jar cli-0.8.7.jar dump --address 127.0.0.1 --port 6300 --destfile jacoco-demo.exec
```