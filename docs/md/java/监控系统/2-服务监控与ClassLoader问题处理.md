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

