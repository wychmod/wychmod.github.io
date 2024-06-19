# Http 服务响应监控

## Http服务概述

绝⼤部分情况下，应⽤系统都是通过Http协议对外提供服务，Http服务是整个业务处理开始的地⽅，所以采集这部分数据可以整体了解到业务执⾏情况，这是⾮常关键的数据。

## 设计⽬标

如何设计针对Http服务数据的采集？先来看采集程的设计⽬标：
1. 保证稳定性：系统运⾏时，⼀直都可以采集数据
2. 保证通⽤性：尽可能⽀持更多的Http 服务实现
3. 实现简单：减少开发维护成本

## 插桩采集点

为到达上述⽬标，⾸先得先选择插桩采集点。Http 服务的实现 整体是由Servlet容器提供的，如Tomcat 、Jetty、Netty、⾃定义服务等。

![](../../youdaonote-images/Pasted%20image%2020240620001255.png)

Http 服务实现分为两部分， ⼀种是⽀持Servlet规范的，另⼀种是不⽀持Servlet规范的第三⽅实现，绝⼤部分业务都是基于⼀种实现的，所以不⽀持Servlet规范基本先不考虑。在Servlet规范这边，⼜划分成Mvc框架层、Servlet层、容器层，除了中间Servlet层其它两层的实现都是多样的，为了保证通⽤性在Servlet层插桩是最佳选择。

## Servlet 插桩的实现

### 采集数据：

1. URL路径
2. 客户端IP
3. 请求完整⽤时
4. 请求参数
5. 异常信息

```java
public class HttpCollect implements ClassFileTransformer {  
  
    private static final String TARGET_CLASS = "javax.servlet.http.HttpServlet";  
    private static final String TARGET_METHOD = "service";  
  
    @Override  
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {  
  
        if (!TARGET_CLASS.replaceAll("\\.", "/").equals(className)) {  
            return null;  
        }  
        try {  
           return buildClass(loader);  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
        return null;  
    }  
  
    public byte[] buildClass(ClassLoader loader) throws Exception {  
        ClassPool pool = new ClassPool();  
        pool.insertClassPath(new LoaderClassPath(loader));  
        CtClass ctClass = pool.get(TARGET_CLASS);  
        CtMethod oldMethod = ctClass.getDeclaredMethod(TARGET_METHOD);  
        CtMethod newMethod = CtNewMethod.copy(oldMethod, ctClass, null);  
        oldMethod.setName(oldMethod.getName() + "$agent");  
        //HttpServlet.service()'  
  
        String beginSrc = "Object stat=coderead.agent1.httpServer.HttpCollect.begin($args);";  
        String errorSrc = "coderead.agent1.httpServer.HttpCollect.error(e,stat);";  
        String endSrc = "coderead.agent1.httpServer.HttpCollect.end(stat);";  
        newMethod.setBody(String.format(voidSource, beginSrc, TARGET_METHOD, errorSrc, endSrc));  
        ctClass.addMethod(newMethod);  
        return ctClass.toBytecode();  
    }  
  
    // url,client IP  
    public static HttpInfo begin(Object args[]) {  
        HttpInfo info = new HttpInfo();  
        info.beginTime=System.currentTimeMillis();  
        HttpServletRequestAdapter adapter = new HttpServletRequestAdapter(args[0]);  
        info.url=adapter.getRequestURI();  
        info.clientIp=adapter.getClientIp();  
        return info;  
    }  
  
    public static void end(Object obj) {  
        HttpInfo stat = (HttpInfo) obj;  
        stat.useTime=System.currentTimeMillis() - stat.beginTime;  
        System.out.println(stat);  
    }  
  
    public static void error(Throwable error, Object obj) {  
        HttpInfo stat = (HttpInfo) obj;  
        stat.error=(error.getMessage());  
        System.err.println(stat);  
    }  
  
  
    final static String voidSource = "{\n"  
            + "%s"  
            + "        try {\n"  
            + "            %s$agent($$);\n"  
            + "        } catch (Throwable e) {\n"  
            + "%s"  
            + "            throw e;\n"  
            + "        }finally{\n"  
            + "%s"  
            + "        }\n"  
            + "}\n";  
  
    public static class HttpInfo{  
        public long beginTime;  
        public String url;  
        public String clientIp;  
        public String error;  
        public long useTime;  
        @Override  
        public String toString() {  
            return "HttpInfo{" +  
                    "beginTime=" + beginTime +  
                    ", url='" + url + '\'' +  
                    ", clientIp='" + clientIp + '\'' +  
                    ", error='" + error + '\'' +  
                    ", useTime=" + useTime +  
                    '}';  
        }  
    }  
    private static class HttpServletRequestAdapter {  
        private final Object target;  
        private final Method _getRequestURI;  
        private final Method _getRequestURL;  
        private final Method _getParameterMap;  
        private final Method _getMethod;  
        private final Method _getHeader;  
        private final Method _getRemoteAddr;  
        private final static String targetClassName = "javax.servlet.http.HttpServletRequest";  
  
        public HttpServletRequestAdapter(Object target) {  
            this.target = target;  
            try {  
                Class<?> targetClass = target.getClass().getClassLoader().loadClass(targetClassName);  
                _getRequestURI = targetClass.getMethod("getRequestURI");  
                _getParameterMap = targetClass.getMethod("getParameterMap");  
                _getMethod = targetClass.getMethod("getMethod");  
                _getHeader = targetClass.getMethod("getHeader", String.class);  
                _getRemoteAddr = targetClass.getMethod("getRemoteAddr");  
                _getRequestURL = targetClass.getMethod("getRequestURL");  
            } catch (NoSuchMethodException e) {  
                throw new IllegalArgumentException("error :" + e.getMessage() + ". probable cause the target is not belong javax.servlet.http.HttpServletRequest ");  
            } catch (ClassNotFoundException e) {  
                throw new IllegalArgumentException("error :" + e.getMessage() + ". probable cause the target is not belong javax.servlet.http.HttpServletRequest ");  
            }  
        }  
  
        public String getRequestURI() {  
            try {  
                return (String) _getRequestURI.invoke(target);  
            } catch (Exception e) {  
                throw new RuntimeException(e);  
            }  
        }  
        public String getRequestURL() {  
            try {  
                return _getRequestURL.invoke(target).toString();  
            } catch (Exception e) {  
                throw new RuntimeException(e);  
            }  
        }  
        public Map<String, String[]> getParameterMap() {  
            try {  
                return (Map<String, String[]>) _getParameterMap.invoke(target);  
            } catch (Exception e) {  
                throw new RuntimeException(e);  
            }  
        }  
        public String getMethod() {  
            try {  
                return (String) _getMethod.invoke(target);  
            } catch (Exception e) {  
                throw new RuntimeException(e);  
            }  
        }  
        public String getHeader(String name) {  
            try {  
                return (String) _getHeader.invoke(target, name);  
            } catch (Exception e) {  
                throw new RuntimeException(e);  
            }  
        }  
        public String getRemoteAddr() {  
            try {  
                return (String) _getRemoteAddr.invoke(target);  
            } catch (Exception e) {  
                throw new RuntimeException(e);  
            }  
        }  
        public String getClientIp() {  
            String ip = getHeader("x-forwarded-for");  
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
                ip = getHeader("Proxy-Client-IP");  
            }  
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
                ip = getHeader("WL-Proxy-Client-IP");  
            }  
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
                ip = getRemoteAddr();  
            }  
            return ip;  
        }  
    }}
```

# Http API调⽤监控

前⾯我们讨论的Http响应进⼊到我们的服务，现在我们要研究的刚好反⽽过来，通过Http 调⽤别⼈的服务。业务开发中通过Http 调⽤第三⽅API 很常⻅，线上运⾏时第三⽅API是否稳定？性能是否达标？都会对我们系统造成影响，所以对它的监控就⾮常有必要。

## Http API调⽤⽅式

http api 调⽤有三种⽅式：
1. 基于URL 直接调⽤：
2. 基于⼯具调⽤：
3. 基于第三⽅平台提供的SDK来调⽤：

![](../../youdaonote-images/Pasted%20image%2020240620002839.png)

