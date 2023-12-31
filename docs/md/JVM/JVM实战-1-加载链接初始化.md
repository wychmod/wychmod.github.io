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

## 2.2 Loading 加载

### 2.2.1 类加载机制

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

### 2.2.2 双亲委派


- 父加载器
	- 父加载器不是“类加载器的加载器”！！！！！也不是“类加载器的父类加载器” 只是一种逻辑上的关系
- 双亲委派是一个孩子向父亲方向（看父亲是否有目标加载类的缓存），然后父亲向孩子方向的双亲委派过程（当父亲都没有时，父亲向孩子查找当前孩子是否具有加载目标类的职责）
	- 当加载不成会抛出notfountclassload
- 思考：为什么要搞双亲委派
	- java.lang.String类由自定义类加载器加载行不行？
	- 为了安全起见，防止使用自定义类加载器，加载修改过有风险的核心类，如果父加载过就不会再加载。同时也是提高了效率，父加载过子不用重复加载。

![](../youdaonote-images/Pasted%20image%2020230808170700.png)

### 2.2.3 类加载器范围

**来自Launcher源码**
-  sun.boot.class.path
	- Bootstrap ClassLoader加载路径sun.boot.class.path
- java.ext.dirs
	- ExtensionClassLoader加载路径java.ext.dirs
- java.class.path
	- AppClassLoader加载路径java.class.path
```java
public class T003_ClassLoaderScope {  
    public static void main(String[] args) {  
        String pathBoot = System.getProperty("sun.boot.class.path");  
        System.out.println(pathBoot.replaceAll(":", System.lineSeparator()));  
  
        System.out.println("--------------------");  
        String pathExt = System.getProperty("java.ext.dirs");  
        System.out.println(pathExt.replaceAll(":", System.lineSeparator()));  
  
        System.out.println("--------------------");  
        String pathApp = System.getProperty("java.class.path");  
        System.out.println(pathApp.replaceAll(":", System.lineSeparator()));  
    }  
}

/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/resources.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/rt.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/sunrsasign.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/jsse.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/jce.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/charsets.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/jfr.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/classes
--------------------
/Users/ahs/Library/Java/Extensions
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/ext
/Library/Java/Extensions
/Network/Library/Java/Extensions
/System/Library/Java/Extensions
/usr/lib/java
--------------------
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/charsets.jar
/Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home/jre/lib/ext/cldrdata.jar
/Users/ahs/Movies/编程/msb015-jvm/(剪) JVM调优第一版/out/production/JVM
/Applications/IntelliJ IDEA.app/Contents/lib/idea_rt.jar
```

### 2.2.4 自定义类加载器

- 继承ClassLoader 1. extends ClassLoader
- 重写模板方法findClass
	- 调用defineClass 最终把二进制流转换为Class类对象
- 自定义类加载器加载自加密的class
	- 防止反编译
	- 防止篡改

```java
public class T007_MSBClassLoaderWithEncription extends ClassLoader {  
  
    public static int seed = 0B10110110;  
  
    @Override  
    protected Class<?> findClass(String name) throws ClassNotFoundException {  
        File f = new File("c:/test/", name.replace('.', '/').concat(".msbclass"));  
  
        try {  
            FileInputStream fis = new FileInputStream(f);  
            ByteArrayOutputStream baos = new ByteArrayOutputStream();  
            int b = 0;  
  
            while ((b=fis.read()) !=0) {  
                baos.write(b ^ seed);  
            }  
  
            byte[] bytes = baos.toByteArray();  
            baos.close();  
            fis.close();//可以写的更加严谨  
  
            return defineClass(name, bytes, 0, bytes.length);  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
        return super.findClass(name); //throws ClassNotFoundException  
    }  
  
    public static void main(String[] args) throws Exception {  
  
        encFile("com.mashibing.jvm.hello");  
  
        ClassLoader l = new T007_MSBClassLoaderWithEncription();  
        Class clazz = l.loadClass("com.mashibing.jvm.Hello");  
        Hello h = (Hello)clazz.newInstance();  
        h.m();  
  
        System.out.println(l.getClass().getClassLoader());  
        System.out.println(l.getParent());  
    }  
  
    private static void encFile(String name) throws Exception {  
        File f = new File("c:/test/", name.replace('.', '/').concat(".class"));  
        FileInputStream fis = new FileInputStream(f);  
        FileOutputStream fos = new FileOutputStream(new File("c:/test/", name.replaceAll(".", "/").concat(".msbclass")));  
        int b = 0;  
  
        while((b = fis.read()) != -1) {  
            fos.write(b ^ seed);  
        }  
  
        fis.close();  
        fos.close();  
    }  
}
```

- loadClass源码分析
![](../youdaonote-images/Pasted%20image%2020230809115232.png)

![](../youdaonote-images/Pasted%20image%2020230809115241.png)

- 模板模式：如果是AppClassLoader首先会执行URLClassLoader的findClass方法
![](../youdaonote-images/Pasted%20image%2020230809115423.png)

### 2.2.5 parent是如何指定的，如何打破双亲委派
1. 继承classLoader以后，用super(parent)指定
2. 双亲委派的打破
    1. 如何打破：重写loadClass（）    
    2. 何时打破过？
        1. JDK1.2之前，自定义ClassLoader都必须重写loadClass()
        2. ThreadContextClassLoader可以实现基础类调用实现类代码，通过thread.setContextClassLoader指定
        3. 热启动，热部署
            1. osgi tomcat 都有自己的模块指定classloader（可以加载同一类库的不同版本，这个行为就打破了双亲委派）(实现：可以在loadClass里不findclass了，直接loadClass)

### 2.2.6 JVM采用解释+编译的混合模式来运行代码
-  解释器
	- bytecode intepreter
-  JIT
	- Just In-Time compiler
- 混合模式
	- 混合使用解释器 + 热点代码编译
	- 起始阶段采用解释执行
	- 热点代码检测
		- 多次被调用的方法（方法计数器：监测方法执行频率）
		- 多次被调用的循环（循环计数器：检测循环执行频率）
		- 进行编译
		- 检测热点代码：-XX:CompileThreshold = 10000
- Xmixed 默认为混合模式
开始解释执行，启动速度较快
对热点代码实行检测和编译
- Xint 使用解释模式，启动很快
执行稍慢
- Xcomp 使用纯编译模式，执行
很快，启动很慢

### 2.2.7 lazyloading(lazyInitializing) 和 2.1 对应
- JVM规范并没有规定何时加载
- 但是严格规定了什么时候必须初始化
	- new getstatic putstatic invokestatic指令，访问final变量除外
	- java.lang.reflect对类进行反射调用时
	- 初始化子类的时候，父类首先初始化
	- 虚拟机启动时，被执行的主类必须初始化
	- 动态语言支持java.lang.invoke.MethodHandle解析的结果为REF_getstatic REF_putstatic REF_invokestatic的方法句柄时，该类必须初始化

## 2.2 验证、准备和解析的过程
### 2.2.1 验证阶段

根据Java虚拟机规范，来校验你加载进来的“.class”文件中的内容，是否符合指定的规范。

假如说，你的“.class”文件被人篡改了，里面的字节码压根儿不符合规范，那么JVM是没法去执行这个字节码的。

![](../youdaonote-images/Pasted%20image%2020230807232258.png)

### 2.2.2 准备阶段
- 静态成员变量赋默认值

### 2.2.3 解析阶段
- 将类、方法、属性等符号引用解析为直接引用 常量池中的各种符号引用解析为指针、偏移量等内存地址的直接引用

## 2.3 初始化阶段(initalizing)

- 调用类初始化代码 \<clinit\>，给静态成员变量赋初始值

## 2.4 new和load的初始化过程

1. load - 默认值 - 初始值

2. new - 申请内存 - 默认值 - 初始值

## 3.先默认值后初始值的造成的单例问题

double check 单例
声明单例时使用了volatile
![](../youdaonote-images/Pasted%20image%2020230809162355.png)
为什么要使用volatile 是因为不使用会指令重排，有可能先astore 再 调用构造函数，如果先astore已经有了引用，如果其他线程走到这个位置，会发现已经有了，但是操作的是默认值，而不是初始值。

volatile的作用
- 线程间可见性
- 防止指令重排序