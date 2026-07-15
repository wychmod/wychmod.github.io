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
public class MyAgent {  
    // 加载时启动  
    public static void premain(String args,  
                               Instrumentation instrumentation) {  
        System.out.println("premain");
        }
    }
```

### MANIFEST.MF ⽂件

构建好的javaagent.jar/MANIFEST.MF⽂件示例：
![](../../youdaonote-images/Pasted%20image%2020240613114856.png)

### 启动⽅式
javaagent jar包不能直接启动，只能附着于其它JVM进⾏程启动。附着⽅式是添加jvm启动参数。如：
```java
java -javaagent:<agent包> -jar <运行时包>
```

## 附着启动(agentmain)

如果想要在应⽤运⾏之后去监听它，⽽⼜不去重启它，就可以采⽤另⼀种⽅式附着启动。其相关属性通过以表来⽐对：

![](../../youdaonote-images/Pasted%20image%2020240613115123.png)

### 启动类与方法

```java
public class MyAgent {
	public static void agentmain(String args, Instrumentation instrumentatio
		System.out.println("hello agentmain");
	}
}
```

###  MANIFEST.MF ⽂件

![](../../youdaonote-images/Pasted%20image%2020240613115330.png)

### 启动方式

其必须通过jvm/lib/tools.jar 中的API注⼊⾄⽬标应⽤:

```java
public class AttachStart {  
    public static void main(String[] args) throws Exception {  
        // 获取jvm进程列表  
        List<VirtualMachineDescriptor> list = VirtualMachine.list();  
        for (int i = 0; i < list.size(); i++) {  
            System.out.println(String.format("[%s] %s", i, list.get(i).displayName()));  
        }  
        System.out.println("输入数字指定要attach的进程");  
  
        // 选择jvm进程  
        BufferedReader read = new BufferedReader(new InputStreamReader(System.in));  
        String line = read.readLine();  
        int i = Integer.parseInt(line);  
        // 附着agent  
        VirtualMachine virtualMachine = VirtualMachine.attach(list.get(i));  
        virtualMachine.loadAgent("/Users/tommy/temp/coderead-cbtu/javaagent/target/javaagent-1.0-SNAPSHOT.jar","111");  
        virtualMachine.detach();  
        System.out.println("加载成功");  
    }  
}


// 运行时启动  
public static void agentmain(String args,  
                             Instrumentation instrumentation) {  
    System.out.println("agentmain");  
}
```

在上述应⽤中⾸先获取本机所有jvm进程，然后当⽤户选择指定进程后附着相对应的agent.jar
包。

### 两种启动⽅式的区别
两种启动⽅式区别在于加载时机，premain⽅式启动可以在类加载前进⾏启动，进⽽可以完整的修改类。agentmain是在系统运⾏中启动，其只能修改类的部分逻辑，监控上是有限制的。其它的API应⽤都是⼀样的。
# javaagent核⼼应⽤

## 类加载拦截
addTransformer 添加类加载拦截器，可重定义加载的类。
```java
public static void premain(String args,  
                           Instrumentation instrumentation) {  
    System.out.println("premain");  
    HelloWorld helloWorld = new HelloWorld();  
    // 添加类加载过滤器  
    instrumentation.addTransformer(new ClassFileTransformer() {  
        @Override  
        public byte[] transform(ClassLoader loader, String className,  
                                Class<?> classBeingRedefined,  
                                ProtectionDomain protectionDomain,  
                                byte[] classfileBuffer) throws IllegalClassFormatException {  
  
            if (!"coderead/agent/HelloWorld".equals(className)) {  
                return null;  
            }  
  
            // javassist  
            try {  
                ClassPool pool=new ClassPool();  
                pool.appendSystemPath();  
                CtClass ctClass = pool.get("coderead.agent.HelloWorld");  
                CtMethod ctMethod = ctClass.getDeclaredMethod("hello");  
                ctMethod.insertBefore("System.out.println(\"插入前置逻辑\");");  
                return ctClass.toBytecode();  
            } catch (NotFoundException | CannotCompileException | IOException e) {  
                e.printStackTrace();  
            }  
            return null;  
        }  
    },true);
```

## 类重新加载

retransformClasses 重新触发类的加载，类加载后⽆法被addTransformer 拦截，该⽅法可重新触发拦截，进⾏进⼆次加载类。注意加载的类是有限制的，仅可对运⾏指令码进⾏修改：不可修改类结构如继承、接⼝、类符、变更属性、变更⽅法等。可以新增private static/final 的方法； 必须添加 Can-Retransform-Classes=true 该⽅法执⾏才有效，且addTransformer⽅法的canRetransform参数也为true。

```java
// 重新走过滤器  
try {  
    instrumentation.retransformClasses(HelloWorld.class);  
} catch (UnmodifiableClassException e) {  
    e.printStackTrace();  
}
```

## 类重定义
redefineClasses 重新定义类。该⽅法会触发retransformClasses 类似的逻辑。

```java
try {  
    ClassPool pool=new ClassPool();  
    pool.appendSystemPath();  
    CtClass ctClass = pool.get("coderead.agent.HelloWorld");  
    CtMethod ctMethod = ctClass.getDeclaredMethod("hello");  
    ctMethod.insertAfter("System.out.println(\"插入后置逻辑\");");  
    instrumentation.redefineClasses(new ClassDefinition(HelloWorld.class,ctClass.toBytecode()));  
} catch (NotFoundException | CannotCompileException | IOException | UnmodifiableClassException | ClassNotFoundException e) {  
    e.printStackTrace();  
}
```

## 获取所有类

getAllLoadedClasses
## 获取已实例化的类

getlnitiatedClasses

## 计算对象大小

getObjectSize


# javaagent实践

## 方法执行性能统计

基于premain机制监控指定方法的执行性能，并打印出日志。

## 仿arthas⼯具

仿照arthas实现一个JVM工具，支持查找指定JWM进程中的类，并反编译查看类。

![](../../youdaonote-images/Pasted%20image%2020240613165849.png)

## 实现功能

1.查找类
2.反编译类
3.临时监控方法性能

```java
public interface ToolService  extends Remote {  
  
    //  查找类  
    String findClassName(String name) throws RemoteException;  
    //  反编译类  
    String jadClass(String className) throws RemoteException;  
}

public class ToolServiceImpl extends UnicastRemoteObject implements ToolService {  
    public ToolServiceImpl() throws RemoteException {  
    }  
  
    @Override  
    public String findClassName(String name) throws RemoteException {  
        return Arrays.stream(Agent.instrumentation.getAllLoadedClasses())  
                .filter(s -> s.getName().toUpperCase().contains(name.toUpperCase()))  
                .limit(20)  
                .map(Class::getName)  
                .collect(Collectors.joining("\r\n"));  
    }  
  
    @Override  
    public String jadClass(String className) throws RemoteException {  
        try {  
            return Jad.decompiler(className);  
        } catch (Exception e) {  
            e.printStackTrace();  
            return e.getMessage();  
        }  
    }}


public class Agent {  
  public static Instrumentation instrumentation;  
    public static void agentmain(String args, Instrumentation instrumentation) {  
                // 启动远程服务  
        Agent.instrumentation=instrumentation;  
        try {  
            startRmiService(Integer.parseInt(args));  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
    }  
    private static void startRmiService(int port) throws RemoteException, AlreadyBoundException, MalformedURLException {  
        ToolServiceImpl userService =new ToolServiceImpl();  
        LocateRegistry.createRegistry(port);  
        Naming.bind("rmi://localhost:"+port+"/ToolService", userService);  
        System.out.println("rmi 已启动："+port);  
    }  
  
}

public class Bootstrap {  
  
    static int port = 7766;  
    private final ToolService toolService;  
  
    public Bootstrap() throws RemoteException, NotBoundException, MalformedURLException {  
        // 加载远程服务  
        toolService = (ToolService) Naming.lookup("rmi://localhost:" + port + "/ToolService");  
    }  
  
    public static void main(String[] args) throws Exception {  
        // 获取jvm进程列表  
        List<VirtualMachineDescriptor> list = VirtualMachine.list();  
        for (int i = 0; i < list.size(); i++) {  
            System.out.println(String.format("[%s] %s", i, list.get(i).displayName()));  
        }  
        // 选择jvm进程  
        BufferedReader read = new BufferedReader(new InputStreamReader(System.in));  
        String line = read.readLine();  
        int i = Integer.parseInt(line);  
        // 附着agent  
        VirtualMachine virtualMachine = VirtualMachine.attach(list.get(i));  
        virtualMachine.loadAgent("/Users/tommy/temp/coderead-cbtu/javaagent/target/javaagent-1.0-SNAPSHOT.jar", String.valueOf(port));  
        virtualMachine.detach();  
        System.out.println("加载成功");  
  
        Bootstrap bootstrap = new Bootstrap();  
        while (true) {  
            line = read.readLine().trim();  
            if (line.equals("exit")) {  
                break;  
            }  
            try {  
                bootstrap.runCommand(line);  
            } catch (RemoteException e) {  
                e.printStackTrace();  
            }  
        }    }  
    private void runCommand(String cmdAndParams) throws RemoteException {  
        String[] s = cmdAndParams.split(" ");  
        String cmd = s[0];  
        String result;  
        if (cmd.equals("sc")) {  
            result = toolService.findClassName(s[1]);  
        } else if (cmd.equals("jad")) {  
            result = toolService.jadClass(s[1]);  
        } else {  
            System.err.println("不支持的命令:" + cmdAndParams);  
            return;  
        }  
        System.out.println(result);  
    }  
  
}

public class Jad {  
    static Loader loader = new Loader() {  
        @Override  
        public byte[] load(String internalName) throws LoaderException {  
            InputStream is = loadClass(internalName);  
            if (is == null) {  
                return null;  
            } else {  
                try (InputStream in = is; ByteArrayOutputStream out = new ByteArrayOutputStream()) {  
                    byte[] buffer = new byte[1024];  
                    int read = in.read(buffer);  
  
                    while (read > 0) {  
                        out.write(buffer, 0, read);  
                        read = in.read(buffer);  
                    }  
  
                    return out.toByteArray();  
                } catch (IOException e) {  
                    throw new LoaderException(e);  
                }  
            }        }  
        @Override  
        public boolean canLoad(String internalName) {  
            return loadClass(internalName) != null;  
        }  
  
        private InputStream loadClass(String internalName) {  
            InputStream is = this.getClass().getResourceAsStream("/" + internalName.replaceAll("\\.", "/") + ".class");  
            if (is == null && Agent.instrumentation != null) {  
                for (Class allLoadedClass : Agent.instrumentation.getAllLoadedClasses()) {  
                    if (allLoadedClass.getName().equals(internalName)) {  
                        is = allLoadedClass.getResourceAsStream("/" + internalName.replaceAll("\\.", "/") + ".class");  
                        break;  
                    }  
                }            }            return is;  
        }  
    };  
  
  
    static Printer printer = new Printer() {  
        protected static final String TAB = "  ";  
        protected static final String NEWLINE = "\n";  
  
        protected int indentationCount = 0;  
        protected StringBuilder sb = new StringBuilder();  
  
        @Override  
        public String toString() {  
            return sb.toString();  
        }  
  
        @Override  
        public void start(int maxLineNumber, int majorVersion, int minorVersion) {  
        }  
        @Override  
        public void end() {  
        }  
        @Override  
        public void printText(String text) {  
            sb.append(text);  
        }  
  
        @Override  
        public void printNumericConstant(String constant) {  
            sb.append(constant);  
        }  
  
        @Override  
        public void printStringConstant(String constant, String ownerInternalName) {  
            sb.append(constant);  
        }  
  
        @Override  
        public void printKeyword(String keyword) {  
            sb.append(keyword);  
        }  
  
        @Override  
        public void printDeclaration(int type, String internalTypeName, String name, String descriptor) {  
            sb.append(name);  
        }  
  
        @Override  
        public void printReference(int type, String internalTypeName, String name, String descriptor, String ownerInternalName) {  
            sb.append(name);  
        }  
  
        @Override  
        public void indent() {  
            this.indentationCount++;  
        }  
  
        @Override  
        public void unindent() {  
            this.indentationCount--;  
        }  
  
        @Override  
        public void startLine(int lineNumber) {  
            for (int i = 0; i < indentationCount; i++) sb.append(TAB);  
        }  
  
        @Override  
        public void endLine() {  
            sb.append(NEWLINE);  
        }  
  
        @Override  
        public void extraLine(int count) {  
            while (count-- > 0) sb.append(NEWLINE);  
        }  
  
        @Override  
        public void startMarker(int type) {  
        }  
        @Override  
        public void endMarker(int type) {  
        }    };  
  
    public static String decompiler(String className) throws Exception {  
	    // 将编译后的类文件（.class）转换回Java源代码的类
        ClassFileToJavaSourceDecompiler decompiler = new ClassFileToJavaSourceDecompiler();  
        decompiler.decompile(loader, printer, className);  
        String source = printer.toString();  
        return source;  
    }  
}
```