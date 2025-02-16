# 监控Server方法
## 需求说明
采集指定包或类下所有⽅法的执⾏性能，并打印出⽇志。

## 采集范围

基于通配符匹配采集范围，并通过javaagent参数传递配置信息

## 确定采集⽬标

采集⽬标即找出哪些是需要监控的⽅法 。这⾥采取的办法是通过参数配置来实现采集的⽬标。通过通配符正则匹配的⽅式配置需要采集类。⽅法采集范围是当前类所有的public⽅法.

## 实现流程

```java
public class ServiceAgent  implements ClassFileTransformer {  
    private String range;  
  
    public ServiceAgent(String range) {  
        this.range = range;  
    }  
  
    @Override  
    public byte[] transform(ClassLoader loader, String className,  
                            Class<?> classBeingRedefined,  
                            ProtectionDomain protectionDomain,  
                            byte[] classfileBuffer) throws IllegalClassFormatException {  
        if (!"coderead/agent1/UserServiceImpl".equals(className)) {  
             return null;  
        }  
        // 类池  
        try {  
            ClassPool pool=new ClassPool();  
            pool.appendSystemPath();  
            CtClass ctClass = pool.get("coderead.agent1.UserServiceImpl");  
            CtMethod ctMethod = ctClass.getDeclaredMethods("findUser")[0];  
  
            // 1.拷贝新方法  
            CtMethod newMethod = CtNewMethod.copy(ctMethod, ctClass, null);  
            // 2.修改新方法的名字  
            newMethod.setName(newMethod.getName()+"$agent");  
            // 3.把新方法添加到类中  
            ctClass.addMethod(newMethod);  
  
            ctMethod.setBody("{    long begin = System.currentTimeMillis();\n" +  
                    "            try {\n" +  
                    "                findUser$agent($$);\n" +  
                    "            } finally {\n" +  
                    "                long end = System.currentTimeMillis();\n" +  
                    "                System.out.println(end - begin);\n" +  
                    "            } }");  
           /* ctMethod.addLocalVariable("begin",CtClass.longType);  
            ctMethod.insertBefore("  begin = System.currentTimeMillis();");            ctMethod.insertAfter("  long end = System.currentTimeMillis();\n" +                    "        System.out.println(end-begin);");*/            byte[] bytes = ctClass.toBytecode();  
            Files.write(new File("/Users/tommy/temp/coderead-cbtu/agent1/target/server$proxy.class").toPath(),bytes);  
            return bytes;  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
  
        return null;  
    }  
}
```


# ⼆、监控MyBatis SQL执⾏

## 需求说明

获取MyBatis中SQL的执⾏性能，并打印出其中的SQL语句。

## 确定插桩⽬标

![](../../youdaonote-images/Pasted%20image%2020240618115601.png)

## 实现流程

```java
public class MyBatisAgent implements ClassFileTransformer {  
    @Override  
    public byte[] transform(ClassLoader loader, String className,  
                            Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {  
        if (!"org/apache/ibatis/executor/BaseExecutor".equals(className)) {  
            return null;  
        }  
  
        try {  
            ClassPool pool = new ClassPool();  
            pool.appendSystemPath();  
            pool.appendClassPath(new LoaderClassPath(loader));  
            CtClass ctClass = pool.get("org.apache.ibatis.executor.BaseExecutor");  
            // 查询  
            CtMethod ctMethod = ctClass.getDeclaredMethods("query")[1];  
            ctMethod.addLocalVariable("info", pool.get(SqlInfo.class.getName()));  
            ctMethod.insertBefore("info=coderead.agent1.MyBatisAgent.begin($args);");  
            ctMethod.insertAfter("coderead.agent1.MyBatisAgent.end(info);");  
            System.out.println("插桩成功："+ctClass.getName());  
            return ctClass.toBytecode();  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
        return null;  
    }  
  
  
    // 执行时间  获取SQL  
    // begin方法  
    // end方法  
        // query()  begin   end  
    public static SqlInfo begin(Object[] args) {  
        SqlInfo sqlInfo = new SqlInfo();  
        sqlInfo.beginTime=System.currentTimeMillis();  
        BoundSql arg = (BoundSql) args[5];  
        sqlInfo.sql=arg.getSql();  
        return sqlInfo;  
    }  
  
    public static void end(SqlInfo info) {  
        info.useTime=System.currentTimeMillis()-info.beginTime;  
        System.out.println(info);  
    }  
    public static class SqlInfo {  
        public long beginTime;  
        public long useTime;  
        public String sql;  
  
        @Override  
        public String toString() {  
            return "SqlInfo{" +  
                    "beginTime=" + new Date(beginTime) +  
                    ", useTime=" + useTime +  
                    ", sql='" + sql + '\'' +  
                    '}';  
        }  
    }  
  
  
}
```


## 相关问题

监控实现之后直接在Idea中启动Spring Boot启动，其业务逻辑可正常执⾏，脱离IDEA启动会报
找不到类的错误。这与插桩的ClassLoader 有关。下⾯就重点探讨⼀下。


# 三、ClassLoader问题处理

## ClassLoader 基本概念

类加载器（class loader）用来加载 Java 类到 Java 虚拟机中。一般来说，Java 虚拟机使用 Java 类的方式如下：Java 源程序（.java 文件）在经过 Java 编译器编译之后就被转换成 Java 字节代码（.class 文件）。类加载器负责读取 Java 字节代码，并转换成java.lang.Class 类的一个实例。每个这样的实例用来表示一个 Java 类。通过此实例的newInstance() 方法就可以创建出该类的一个对象。实际的情况可能更加复杂，比如Java 字节代码可能是通过工具动态生成的，也可能是通过网络下载的。

## 组织结构

Java 中的类加载器⼤致可以分成两类，⼀类是系统提供的，另外⼀类则是由 Java 应⽤开发⼈员编写的。系统提供的类加载器主要有下⾯三个：

1. 引导类加载器（Bootstrap）：它⽤来加载 Java 的核⼼库，是⽤原⽣代码来实现的，并不继承⾃ java.lang.ClassLoader。负责加载 Java 核心库。核心库是 Java 程序运行的基础，包括了 Java 语言的基础类和接口，例如 `java.lang.Object` 和 `java.io` 包等。
2. 扩展类加载器（ExtClassLoader）：它⽤来加载 Java 的扩展库。Java 虚拟机的实现会提供⼀个扩展库⽬录。该类加载器在此⽬录⾥⾯查找并加载 Java 类。
3. 系统类加载器（AppClassLoader）：它根据 Java 应⽤的类路径（CLASSPATH）来加载Java 类。⼀般来说，Java 应⽤的类都是由它来完成加载的。可以通过ClassLoader.getSystemClassLoader()来获取它。

![](../../youdaonote-images/Pasted%20image%2020240618120523.png)

# 常⽤架构的ClassLoader结构

## IDEA运⾏时JAR

![](../../youdaonote-images/Pasted%20image%2020240618120710.png)

## Spring Boot 运⾏时JAR

![](../../youdaonote-images/Pasted%20image%2020240618120727.png)

# Tomcat
打破了双亲委派，可以先访问下面的包
// tomcat 中可行，在Spring boot中不可行,下面为tomcat类加载器结构  
// tomcat打破了双亲委派，可以先找自己的类，找不到再去父类加载器中找  
// 这个时候mybatis和agent都加载在WebappClassLoader，便能互相调用正确  
addURL.invoke(urlClassLoader, new URL(path));

![](../../youdaonote-images/Pasted%20image%2020240618120744.png)


## 解决方案
通过添加资源到类加载器可以解决tomcat
通过反射可以解决springboot
```java
public class MyBatisAgent3 implements ClassFileTransformer {

    @Override
    public byte[] transform(ClassLoader loader, String className,
                            Class<?> classBeingRedefined,
                            ProtectionDomain protectionDomain,
                            byte[] classfileBuffer) {
        if (!"org/apache/ibatis/executor/BaseExecutor".equals(className)) {
            return null;
        }

        try {
            // tomcat 中可行，在Spring boot中不可行
            appendToLoader(loader);
        } catch (Exception e) {
            System.err.println("jar 注入失败");
            e.printStackTrace();
            return null;
        }

        try {
            ClassPool pool = new ClassPool();
            pool.appendSystemPath();
            pool.appendClassPath(new LoaderClassPath(loader));
            CtClass ctClass = pool.get("org.apache.ibatis.executor.BaseExecutor");
            // 查询
            CtMethod ctMethod = ctClass.getDeclaredMethods("query")[1];
            ctMethod.addLocalVariable("info", pool.get(SqlInfo.class.getName()));
            ctMethod.insertBefore("info=coderead.agent1.MyBatisAgent3.begin($args);");
            ctMethod.insertAfter("coderead.agent1.MyBatisAgent3.end(info);");
            System.out.println("插桩成功：" + ctClass.getName());
            return ctClass.toBytecode();
        } catch (NotFoundException | CannotCompileException | IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 该Java函数appendToLoader的主要功能是动态地向给定的ClassLoader（类加载器）中添加一个URL，
     * 以便该加载器能够从这个新指定的URL路径中加载额外的类或资源。
     */
    private void appendToLoader(ClassLoader loader) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException, MalformedURLException {
        URLClassLoader urlClassLoader = (URLClassLoader) loader;
        Method addURL = URLClassLoader.class.getDeclaredMethod("addURL", URL.class);
        addURL.setAccessible(true);
        String path = MyBatisAgent3.class.getResource("").getPath();
        path = path.substring(0, path.indexOf("!/"));
        addURL.invoke(urlClassLoader, new URL(path));
    }

    public static SqlInfo begin(Object[] params) {
        SqlInfo info = new SqlInfo();
        info.beginTime = System.currentTimeMillis();
        BoundSqlAdapter adapter = new BoundSqlAdapter(params[5]);
        info.sql = adapter.getSql();
        return info;
    }

    public static void end(SqlInfo info) {
        info.useTime = System.currentTimeMillis() - info.beginTime;
        System.out.println(info);
    }

    public static class SqlInfo {
        public long beginTime;
        public long useTime;
        public String sql;

        @Override
        public String toString() {
            return "SqlInfo{" +
                    "beginTime=" + new Date(beginTime) +
                    ", useTime=" + useTime +
                    ", sql='" + sql + '\'' +
                    '}';
        }
    }

    public static class BoundSqlAdapter {
        Object target;
        private static Method getSql;
        private static Class aClass;

        private synchronized static void init(Class cls) {
            try {
                aClass = cls;
                getSql = cls.getDeclaredMethod("getSql");
                getSql.setAccessible(true);
            } catch (NoSuchMethodException e) {
                throw new RuntimeException(e);
            }

        }

        public BoundSqlAdapter(Object target) {
            this.target = target;
            if (aClass == null) {
                init(target.getClass());
            }
            this.target = target;
        }

        public String getSql() {
            try {
                return (String) getSql.invoke(target);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }
}

```