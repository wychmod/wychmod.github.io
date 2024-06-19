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

通过分析，Http 调⽤实现并没有集中的点，只能针对这些框架⼀个个实现采集插桩，根据通⽤程度先实现URL采集监控。

## URL Http调⽤分析

先看来⼀段基于URL http调⽤代码，是基于输⼊输出流的⽅式，写⼊请求并读取结果。并没有具体的⽅法来控制参数的输⼊，与结果输出。

```java
URL url = new URL("https://www.baidu.com");
URLConnection conn = url.openConnection();
conn.connect();
InputStream input = conn.getInputStream();
byte[] bytes = IOUtils.readFully(input, -1, false);
System.out.println(new String(bytes));
```

为了找到监控点，就必须深⼊URL的内部实现：

![](../../youdaonote-images/Pasted%20image%2020240620005321.png)

URL协议完整交互流程是：
1. 构造URL对象，获取协议处理器(UrlStreamHandler)
2. 处理器打开链连接(openConnection)
3. 获取输出流，写⼊请求数据
4. 获取输⼊流，读取结果
只要在源头去控制 处理器的⽣成，就可以从头⾄尾代理整个URL的处理过程，并获取性能数据。

![](../../youdaonote-images/Pasted%20image%2020240620005408.png)

如何去控制处理器(UrlStreamHandler)对照像呢?有三种⽅式可构建处理器,优先级从⾼⾄低
1. 基于⾃定义的 URLStreamHandlerFactory 获取
2. 基于⾃定义包前缀获取:java.protocol.handler.pkgs
3. 基于默认包前缀获取：sun.net.www.protocol

为了保持统⼀ 在JVM进程中URL Handler只能被设置⼀次，URLStreamHandlerFactory 也只能被设置⼀次，多次设置会出现 "factory already defined" 的异常， 不确定业务⽅，或者第三⽅容器是否有调⽤该⽅法的需求，所以对该⽅法的调⽤存在兼容性的⻛险。这⾥我们可以⽤采⽤第⼆种⽅法的⽅式 来修改改UrlStreamHandler 实例。

通过代理原来的UrlStreamHandler 实例来实现

```java

public class HttpProxy2 {  
  
    private static String PROTOCOL_HANDLER = "java.protocol.handler.pkgs";  
    private static String HANDLERS_PACKAGE = "coderead.agent1.httpInvoker";  
  
    public static void registerProtocol() {  
        String handlers = System.getProperty(PROTOCOL_HANDLER, "");  
        System.setProperty(PROTOCOL_HANDLER,  
                ((handlers == null || handlers.isEmpty()) ?  
                        HANDLERS_PACKAGE : handlers + "|" + HANDLERS_PACKAGE));  
    }  
  
  
}

// 静态代理
public class ProxyHttpUrlConnection extends HttpURLConnection {  
    HttpURLConnection target;  
    HttpInputStream httpInputStream;  
    HttpOutputStream httpOutputStream;  
  
    /**  
     * Constructor for the HttpURLConnection.     *     * @param u the URL  
     */    public ProxyHttpUrlConnection(HttpURLConnection target, URL u) {  
        super(u);  
        this.target = target;  
  
    }  
  
  
    @Override  
    public void disconnect() {  
        target.disconnect();  
    }  
  
    @Override  
    public boolean usingProxy() {  
        return false;  
    }  
  
    @Override  
    public void connect() throws IOException {  
        long begin = System.currentTimeMillis();  
        target.connect();  
        System.out.println(String.format("url：%s 连接用时：%s 毫秒", getURL().toString(),System.currentTimeMillis() - begin) );  
    }  
  
    @Override  
    public String getHeaderFieldKey(int n) {  
        return target.getHeaderFieldKey(n);  
    }  
  
  
    @Override  
    public void setFixedLengthStreamingMode(int contentLength) {  
        target.setFixedLengthStreamingMode(contentLength);  
    }  
  
    @Override  
    public void setFixedLengthStreamingMode(long contentLength) {  
        target.setFixedLengthStreamingMode(contentLength);  
    }  
  
    @Override  
    public void setChunkedStreamingMode(int chunklen) {  
        target.setChunkedStreamingMode(chunklen);  
    }  
  
    @Override  
    public String getHeaderField(int n) {  
        return target.getHeaderField(n);  
    }  
  
    @Override  
    public void setInstanceFollowRedirects(boolean followRedirects) {  
        target.setInstanceFollowRedirects(followRedirects);  
    }  
  
    @Override  
    public boolean getInstanceFollowRedirects() {  
        return target.getInstanceFollowRedirects();  
    }  
  
    @Override  
    public void setRequestMethod(String method) throws ProtocolException {  
        target.setRequestMethod(method);  
    }  
  
    @Override  
    public String getRequestMethod() {  
        return target.getRequestMethod();  
    }  
  
    @Override  
    public int getResponseCode() throws IOException {  
        return target.getResponseCode();  
    }  
  
    @Override  
    public String getResponseMessage() throws IOException {  
        return target.getResponseMessage();  
    }  
  
    @Override  
    public long getHeaderFieldDate(String name, long Default) {  
        return target.getHeaderFieldDate(name, Default);  
    }  
  
    @Override  
    public Permission getPermission() throws IOException {  
        return target.getPermission();  
    }  
  
    @Override  
    public InputStream getErrorStream() {  
        return target.getErrorStream();  
    }  
  
    @Override  
    public void setConnectTimeout(int timeout) {  
        target.setConnectTimeout(timeout);  
    }  
  
    @Override  
    public int getConnectTimeout() {  
        return target.getConnectTimeout();  
    }  
  
    @Override  
    public void setReadTimeout(int timeout) {  
        target.setReadTimeout(timeout);  
    }  
  
    @Override  
    public int getReadTimeout() {  
        return target.getReadTimeout();  
    }  
  
    @Override  
    public URL getURL() {  
        return target.getURL();  
    }  
  
    @Override  
    public int getContentLength() {  
        return target.getContentLength();  
    }  
  
    @Override  
    public long getContentLengthLong() {  
        return target.getContentLengthLong();  
    }  
  
    @Override  
    public String getContentType() {  
        return target.getContentType();  
    }  
  
    @Override  
    public String getContentEncoding() {  
        return target.getContentEncoding();  
    }  
  
    @Override  
    public long getExpiration() {  
        return target.getExpiration();  
    }  
  
    @Override  
    public long getDate() {  
        return target.getDate();  
    }  
  
    @Override  
    public long getLastModified() {  
        return target.getLastModified();  
    }  
  
    @Override  
    public String getHeaderField(String name) {  
        return target.getHeaderField(name);  
    }  
  
    @Override  
    public Map<String, List<String>> getHeaderFields() {  
        return target.getHeaderFields();  
    }  
  
    @Override  
    public int getHeaderFieldInt(String name, int Default) {  
        return target.getHeaderFieldInt(name, Default);  
    }  
  
    @Override  
    public long getHeaderFieldLong(String name, long Default) {  
        return target.getHeaderFieldLong(name, Default);  
    }  
  
    @Override  
    public Object getContent() throws IOException {  
        return target.getContent();  
    }  
  
    @Override  
    public Object getContent(Class[] classes) throws IOException {  
        return target.getContent(classes);  
    }  
  
    @Override  
    public InputStream getInputStream() throws IOException {  
        return target.getInputStream();  
    }  
  
    @Override  
    public OutputStream getOutputStream() throws IOException {  
        return target.getOutputStream();  
    }  
  
    @Override  
    public String toString() {  
        return target.toString();  
    }  
  
    @Override  
    public void setDoInput(boolean doinput) {  
        target.setDoInput(doinput);  
    }  
  
    @Override  
    public boolean getDoInput() {  
        return target.getDoInput();  
    }  
  
    @Override  
    public void setDoOutput(boolean dooutput) {  
        target.setDoOutput(dooutput);  
    }  
  
    @Override  
    public boolean getDoOutput() {  
        return target.getDoOutput();  
    }  
  
    @Override  
    public void setAllowUserInteraction(boolean allowuserinteraction) {  
        target.setAllowUserInteraction(allowuserinteraction);  
    }  
  
    @Override  
    public boolean getAllowUserInteraction() {  
        return target.getAllowUserInteraction();  
    }  
  
    @Override  
    public void setUseCaches(boolean usecaches) {  
        target.setUseCaches(usecaches);  
    }  
  
    @Override  
    public boolean getUseCaches() {  
        return target.getUseCaches();  
    }  
  
    @Override  
    public void setIfModifiedSince(long ifmodifiedsince) {  
        target.setIfModifiedSince(ifmodifiedsince);  
    }  
  
    @Override  
    public long getIfModifiedSince() {  
        return target.getIfModifiedSince();  
    }  
  
    @Override  
    public boolean getDefaultUseCaches() {  
        return target.getDefaultUseCaches();  
    }  
  
    @Override  
    public void setDefaultUseCaches(boolean defaultusecaches) {  
        target.setDefaultUseCaches(defaultusecaches);  
    }  
  
    @Override  
    public void setRequestProperty(String key, String value) {  
        target.setRequestProperty(key, value);  
    }  
  
    @Override  
    public void addRequestProperty(String key, String value) {  
        target.addRequestProperty(key, value);  
    }  
  
    @Override  
    public String getRequestProperty(String key) {  
        return target.getRequestProperty(key);  
    }  
  
    @Override  
    public Map<String, List<String>> getRequestProperties() {  
        return target.getRequestProperties();  
    }  
  
    class HttpInputStream extends BufferedInputStream {  
        ByteArrayOutputStream copy = new ByteArrayOutputStream();  
  
        public HttpInputStream(InputStream in) {  
            super(in);  
        }  
  
        @Override  
        public synchronized int read(byte[] b, int off, int len) throws IOException {  
            int i = super.read(b, off, len);  
            if (i > 0)  
                copy.write(b, off, i);  
            return i;  
        }  
  
        @Override  
        public synchronized int read() throws IOException {  
            int i = super.read();  
            if (i != -1)  
                copy.write(i);  
            return i;  
        }  
    }  
    public byte[] getInputBytes() {  
        if (httpInputStream != null) {  
            return httpInputStream.copy.toByteArray();  
        }  
        return new byte[]{};  
    }  
  
    public byte[] getOutputBytes() {  
        if (httpOutputStream != null) {  
            return httpOutputStream.copy.toByteArray();  
        }  
        return new byte[]{};  
    }  
  
    class HttpOutputStream extends BufferedOutputStream {  
        ByteArrayOutputStream copy = new ByteArrayOutputStream();  
  
        public HttpOutputStream(OutputStream out) {  
            super(out);  
        }  
  
        @Override  
        public synchronized void write(int b) throws IOException {  
            super.write(b);  
            copy.write(b);  
        }  
  
        @Override  
        public synchronized void write(byte[] b, int off, int len) throws IOException {  
            super.write(b, off, len);  
            copy.write(b, off, len);  
        }  
  
        @Override  
        public synchronized void flush() throws IOException {  
            super.flush();  
        }  
  
    }  
  
}


import coderead.agent1.httpInvoker.ProxyHttpUrlConnection;  
  
  
import java.io.IOException;  
import java.net.HttpURLConnection;  
import java.net.Proxy;  
import java.net.URL;  
import java.net.URLConnection;  
  
public class Handler extends sun.net.www.protocol.http.Handler {  
        @Override  
        protected URLConnection openConnection(URL url, Proxy proxy) throws IOException {  
            HttpURLConnection connection = (HttpURLConnection) super.openConnection(url, proxy);  
            return new ProxyHttpUrlConnection(connection, url);  
        }  
  
        @Override  
        protected URLConnection openConnection(URL url) throws IOException {  
            return openConnection(url, null);  
        }  
    }
```