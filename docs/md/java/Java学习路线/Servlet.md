# Servlet和JSP

## Servlet 和 Servlet Container
在 JavaEE 的诸多组件中，做 Web 开发一定躲不开的是 Servlet。Servlet 是一套用于处理 HTTP 请求的 API 标准。我们可以基于 Servlet 实现 HTTP 请求的处理。但是 JavaEE 当中只提供了 Servlet 的标准，要真正运行 Servlet，需要使用 Servlet Container。

如果 Servlet 是电器，Servlet Container 就是电源插座。如果你之前接触过 Python 的 WSGI 或者其它语言的 Web 框架，这样的设计就很容易理解。这层抽象让 Servlet 可以跑在任何一个 Container 当中，隔绝了对 Runtime 环境的依赖。

JavaEE 本身没有提供 Servlet Container，比较常用支持 Servlet Container 的 Server 软件有 Apache Tomcat，Glassfish，JBoss，Jetty 等等。

> Servlet 是 Java Web 开发的事实标准，不过也不代表所有 Java Web 框架都一定要使用或者兼容 Servlet。不使用 Servlet 也可以进行 Java Web 开发，例如 Play Framework，就是完全自立门户的一个框架。

## 一个Servlet程序
```java
import javax.servlet.*;
import java.io.IOException;
import java.io.PrintWriter;

public class MyFirstServlet implements Servlet {
    public void init(ServletConfig config) throws ServletException {
        System.out.println("Init");
    }

    public void service(ServletRequest request, ServletResponse response)
            throws ServletException, IOException {
        System.out.println("From service");
        PrintWriter out = response.getWriter();
        out.println("Hello, Java Web.");
    }

    public void destroy() {
        System.out.println("Destroy");
    }

    public String getServletInfo() {
        return null;
    }

    public ServletConfig getServletConfig() {
        return null;
    }
}
```
为了让 Servlet 跑起来，我们需要把它部署到 Tomcat 上。首先在 src 目录隔壁，创建一个 WEB-INF 目录（注意名字一定要正确），然后在里面创建一个 web.xml 文件：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app version="2.4" xmlns="http://java.sun.com/xml/ns/j2ee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/j2ee
http://java.sun.com/xml/ns/j2ee/web-app_2_4.xsd">

    <servlet>
        <servlet-name>MyFirstServletName</servlet-name>
        <servlet-class>com.skyline.MyFirstServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <servlet-name>MyFirstServletName</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>
</web-app>
```
可以看到 web.xml 的作用是告诉 Tomcat，我们想使用哪个 Servlet 来处理对应的请求。Tomcat 通过 web.xml 找到对应的 Servlet 完成请求以及响应过程。

将 IDEA 编译出的产物（默认应该在 out 文件夹中），把 package 结构已经对应的产物拷贝到 WEB-INF 中的 classes 文件夹里，完成之后的目录结构应该是这样的：
```
webapps
  - MyFirstServlet
    - WEB-INF
      - classes
        - com
          - skyline
            - MyFirstServlet.class
      - web.xml
```
![image.png](https://note.youdao.com/yws/res/3/WEBRESOURCEdf4aea1b0f8bc9adaea040ab2baa8f03)

## 一个JSP程序
```java
import javax.servlet.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

public class MyFirstServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws ServletException, IOException {

        response.getWriter().write("<html>");
        response.getWriter().write("<body>");
        response.getWriter().write("<h2>");
        response.getWriter().write(LocalDateTime.now().toString());
        response.getWriter().write("</h2>");
        response.getWriter().write("</body>");
        response.getWriter().write("</html>");
    }
}
```
注意我们使用了 HttpServlet 而不是前一个例子中的 Servlet，它是一个更高级的封装类。

可以看到，直接使用 Servlet 生成网页，不仅代码写起来困难，可维护性也不高。为了把 HTML 这些非逻辑的部分抽离出来，人们引入了 JSP 技术。

JSP，全称 JavaServer Pages。可以把 JSP 理解成一种高度抽象的 Servlet。事实上 JSP 在运行期间会被编译成 Servlet，因此 JSP 和 Servlet 可以认为没有本质上的差异，只不过写起来容易了很多。

前面提到的 Tomcat 不仅支持了 Servlet，也支持了 JSP 技术。下面我们使用 JSP 重写上面的程序。

通过前一个例子我们可以看到，现在工程目录下的 WEB-INF 没有实质上的作用，只是为了拷贝到 Tomcat 的部署目录下。因此如果你嫌麻烦，直接在 Tomcat 部署目录下操作也可以。
在 WEB-INF 隔壁创建一个 date.jsp 文件：
```java
<%@ page import="java.time.LocalDateTime" %>
<html>
<body>
<h2>
<%
out.write(LocalDateTime.now().toString());
%>
</h2>
</body>
</html>
```
![image.png](https://note.youdao.com/yws/res/3/WEBRESOURCE8561eab414d8d2ba2c40fc57399be303)