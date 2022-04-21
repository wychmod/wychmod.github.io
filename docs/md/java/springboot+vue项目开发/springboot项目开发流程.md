# springboot项目开发流程
[toc]
## 创建springboot项目
### 搭建springboot项目
- 两种方法
    - 官网创建 start.spring.io
    - idea创建
![image](../../youdaonote-images/B2B80DF6E2554FD1B2A0FB15717920D9.png)
![image](../../youdaonote-images/93B6AB0E4C6A4851BC8335FF9F2E9C5B.png)
![image](../../youdaonote-images/15F95E2D66514347BBB94BFC90B32682.png)
![image](../../youdaonote-images/5D40009182AC4A6F84D9FEC34367FD0F.png)
- Spring Boot不需要配置容器,是因为使用了嵌入式容器,默认使用 tomcat启动,就认端口8080。当然,用传统的方式,打成wa包,放入单独的 tomcat是可以的。
- pringboot项目使用main函数启动,一般放在 Xxxapplication类里,需要加@ Spring Bootapplication注解
- Maven Wrapper可以不需要提前下载好 Maven,由它去下载 Maven

### 项目初始配置
#### 编码配置
**统一utf-8**
![image](../../youdaonote-images/1F6B4170494742EFB708E59E141CFB96.png)
![image](../../youdaonote-images/58DCF38B400A440BA0BE17C1239BA3BF.png)
#### JDK配置
![image](../../youdaonote-images/26621582F9324238925DF1E143A2243A.png)
![image](../../youdaonote-images/7CBBBC63CB644778BCBF75710E1A3C2C.png)
#### Maven配置
maven配置 一般自带的就行
#### Git配置
**vcs里面启动git**

![image](../../youdaonote-images/3C29534B9D354684A1E839F9A4B071C3.png)
![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCE7b9dad8a0ba9b431d14e3f6fdf7b5ff9)
![image](../../youdaonote-images/AAC0E5B943A34D37BA4666F25F079D4D.png)
##### 关联远程仓库
**配置mac sshkey**
```bash
# 1 检查ssh key 是否存在
ls -al ~/.ssh
Lists the files in your .ssh directory, if they exist
# 2 如果key不存，生成key
ssh-keygen -t rsa -C "your_email@example.com"
# 3 将共有key(id_rsa.pub)复制到远程GitHub里，同是可以给你的key起一个名字
```
**github进行ssh链接并且创建仓库执行第二个命令**

![image](../../youdaonote-images/17F7B36B53974FBB86CFFD2CC4976ACA.png)
#### 启动日志优化
##### logback日志样式修改
**在resources文件夹下添加logback-spring.xml文件**

```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 修改一下路径 mac要用.\log反斜杠-->
    <property name="PATH" value="./log"></property>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
<!--            <Pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %highlight(%-5level) %blue(%-50logger{50}:%-4line) %thread %green(%-18X{LOG_ID}) %msg%n</Pattern>-->
            <Pattern>%d{ss.SSS} %highlight(%-5level) %blue(%-30logger{30}:%-4line) %thread %green(%-18X{LOG_ID}) %msg%n</Pattern>
        </encoder>
    </appender>

    <appender name="TRACE_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${PATH}/trace.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <FileNamePattern>${PATH}/trace.%d{yyyy-MM-dd}.%i.log</FileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>10MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <layout>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level %-50logger{50}:%-4line %green(%-18X{LOG_ID}) %msg%n</pattern>
        </layout>
    </appender>

    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${PATH}/error.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <FileNamePattern>${PATH}/error.%d{yyyy-MM-dd}.%i.log</FileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>10MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <layout>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level %-50logger{50}:%-4line %green(%-18X{LOG_ID}) %msg%n</pattern>
        </layout>
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <root level="ERROR">
        <appender-ref ref="ERROR_FILE" />
    </root>

    <root level="TRACE">
        <appender-ref ref="TRACE_FILE" />
    </root>

    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>

```
> 记得在gitignore里面忽略.log文件夹
##### 增加启动成功日志
```java
package com.jiawa.wiki;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;


@SpringBootApplication
public class WikiApplication {

    private static final Logger LOG = LoggerFactory.getLogger(WikiApplication.class);

    public static void main(String[] args) {

        SpringApplication app = new SpringApplication(WikiApplication.class);
        Environment env = app.run(args).getEnvironment();
        LOG.info("启动成功！！");
        LOG.info("地址: \thttp://127.0.0.1:{}", env.getProperty("server.port"));
    }

}

```
```java
# application.properties文件
server.port=8080
```
##### 修改启动图案
http://patorjk.com/software/taag/#p=display&f=3D-ASCII&t=tots-and%0A
**在resources文件夹下添加banner.txt文件**

#### 开发Hello World接口
**首先项目分层**
![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE47c655195e0b4b5eb6db5bb97e47519a)
```java
package com.jiawa.wiki.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController //返回字符串
//@Controller 返回页面
//@RequestMapping("/demo") //访问公共前缀
public class TestController {

    @RequestMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}

```
##### @ResponseBody注解
**返回json数据或字符串，在RestController内部**

##### restful风格接口
**@RequestMapping("/hello") 支持增删改查，其他的就是把request换成get post put delete**
@RequestMapping(value = "/hello", method = RequestMethod.GET)
@GetMapping...


##### 重构application位置
![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE6762dba7c625fa2c49a10ac8aa6f5f8a)
**在application文件加入这个注解@ComponentScan("com.jiawa")**
```java
//@ComponentScan({"com.wychmod", "com.test"})
@ComponentScan("com.wychmod")
```

> 这个注解默认是扫描当前目录下，这个注解也默认在启动项@SpringBootApplication之中 

#### 使用HTTP Client测试接口（Ide自带）
![image](../../youdaonote-images/C1BEE530804C4D7C97AF11D552D0BF24.png)
```java
GET http://localhost:8080/hello
#Accept: application/json

> {%
client.test("test-hello", function() {
  client.log("测试/hello接口");
  client.log(response.body);
  client.log(JSON.stringify(response.body)); // 虽然idea没有提示JSON，但是可以用
  client.assert(response.status === 200, "返回码不是200");
  client.assert(response.body === "hello world", "结果验证失败");
});
%}

###
POST http://localhost:8080/hello/post
Content-Type: application/x-www-form-urlencoded

name=TEST

###

GET http://localhost:8080/hello
Accept: application/json

###

```
#### IDE配置删除不引用代码
![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCEe20e6e9e0c21f8b14d3c4122060772cd)

#### 配置文件介绍
##### 默认支持的配置文件
**https://toyaml.com/index.html**yaml和properties相互转换
Springboot会自动识别下面这组配置文件application.properties/yml config/application.properties/yml

如果是 Springcloud,还会自动识别下面这组配置文件:
bootstrap.properties/yml
config/bootstrap properties/yml
![image](../../youdaonote-images/6F31E6EB0002443FBD792CA253091FC4.png)

> bootstrap一般用于动态配置,线上可以实时修改实时生效的配置,一般可配合上 nacos使用

##### 自定义配置项
```
application.properties
server.port=8880

test.hello=Hello

.java
@Value("${test.hello:TEST}")
private String testHello;
```
> ${test.hello:TEST} 冒号后面是默认配置值

#### 集成热部署
```
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
        </dependency>

```
![image](../../youdaonote-images/A02D2428043C4605BE399F108AC0E13B.png)


### 后端架构完善与接口开发
#### IDEA数据库插件配置
![image](../../youdaonote-images/EE7EAEACD94646558530402497D723A4.png)
#### Mybatis
pom.xml
```
<!-- 集成mybatis-->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.1.3</version>
        </dependency>
        <!-- 集成mysql连接 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.22</version>
        </dependency>
```
配置文件
```
# 增加数据库连接
spring.datasource.url=jdbc:mysql://localhost:3306/wiki?characterEncoding=UTF8&autoReconnect=true&serverTimezone=Asia/Shanghai&allowMultiQueries=true
spring.datasource.username=wiki
spring.datasource.password=penghan123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# 配置mybatis所有Mapper.xml所在的路径
mybatis.mapper-locations=classpath:/mapper/**/*.xml
```

#### 持久层Mapper层
**也是广为人知的Dao层，也就是持久层。因为后续要用官方代码生成器，代码是xxxMapper**

#### 第一个数据库查询开发
![image](../../youdaonote-images/309B859FA8024D0CBD6492832DD8D26C.png)
```java
TestMapper.xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.jiawa.wiki.mapper.TestMapper" >

    <select id="list" resultType="com.jiawa.wiki.domain.Test">
        select `id` from `test`
    </select>

</mapper>

Test.java
package com.jiawa.wiki.domain;

public class Test {
    private Integer id;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}

TestMapper.java
package com.jiawa.wiki.mapper;

import com.jiawa.wiki.domain.Test;

import java.util.List;

public interface TestMapper {
    public List<Test> list();
}


TestService.java
package com.jiawa.wiki.service;

import com.jiawa.wiki.domain.Test;
import com.jiawa.wiki.mapper.TestMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class TestService {

    @Resource
    private TestMapper testMapper;

    public List<Test> list() {
        return testMapper.list();
    }
}

TestController

    @Resource
    private TestService testService;

    @GetMapping("/test/list")
    public List<Test> list() {
        return testService.list();
    }
    
WikiApplication.java
@MapperScan("com.jiawa.wiki.mapper")
```

#### 集成mybatis官方代码生成器
**mybatis-generator是官方提供的逆向工程工具，以针对数据库表自动生成MyBatis执行所需要的代码，是一个非常人性的自动化工具。**
```xml
pom.xml
<plugin>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator-maven-plugin</artifactId>
    <version>1.4.0</version>
    <configuration>
        <configurationFile>src/main/resources/generator/generator-config.xml</configurationFile>
        <overwrite>true</overwrite>
        <verbose>true</verbose>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.22</version>
        </dependency>
    </dependencies>
</plugin>

/resources/generator/generator-config.xml

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>
    <context id="Mysql" targetRuntime="MyBatis3" defaultModelType="flat">

        <!-- 自动检查关键字，为关键字增加反引号 -->
        <property name="autoDelimitKeywords" value="true"/>
        <property name="beginningDelimiter" value="`"/>
        <property name="endingDelimiter" value="`"/>

        <!--覆盖生成XML文件-->
        <plugin type="org.mybatis.generator.plugins.UnmergeableXmlMappersPlugin" />
        <!-- 生成的实体类添加toString()方法 -->
        <plugin type="org.mybatis.generator.plugins.ToStringPlugin"/>

        <!-- 不生成注释 -->
        <commentGenerator>
            <property name="suppressAllComments" value="true"/>
        </commentGenerator>

        <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/wiki?serverTimezone=Asia/Shanghai"
                        userId="wiki"
                        password="penghan123">
        </jdbcConnection>

        <!-- domain类的位置 -->
        <javaModelGenerator targetProject="src\main\java"
                            targetPackage="com.jiawa.wiki.domain"/>

        <!-- mapper xml的位置 -->
        <sqlMapGenerator targetProject="src\main\resources"
                         targetPackage="mapper"/>

        <!-- mapper类的位置 -->
        <javaClientGenerator targetProject="src\main\java"
                             targetPackage="com.jiawa.wiki.mapper"
                             type="XMLMAPPER"/>

        <!--<table tableName="demo" domainObjectName="Demo"/>-->
        <!--<table tableName="ebook"/>-->
        <!--<table tableName="category"/>-->
        <!--<table tableName="doc"/>-->
        <!--<table tableName="content"/>-->
        <!--<table tableName="user"/>-->
        <table tableName="ebook_snapshot"/>
    </context>
</generatorConfiguration>


```
![image](../../youdaonote-images/C886C848075245E7A65A3B0C9FE7CE7C.png)

#### 代码生成器如何使用
```java
package com.jiawa.wiki.service;

import com.jiawa.wiki.domain.Demo;
import com.jiawa.wiki.mapper.DemoMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

@Service
public class DemoService {

    @Resource
    private DemoMapper demoMapper;

    public List<Demo> list() {
        return demoMapper.selectByExample(null);
    }
}


@RestController
@RequestMapping("/demo")
public class DemoController {


    @Resource
    private DemoService demoService;


    @GetMapping("/list")
    public List<Demo> list() {
        return demoService.list();
    }
}

```

#### 公共返回类
```java
package com.jiawa.wiki.resp;

public class CommonResp<T> {

    /**
     * 业务上的成功或失败
     */
    private boolean success = true;

    /**
     * 返回信息
     */
    private String message;

    /**
     * 返回泛型数据，自定义类型
     */
    private T content;

    public boolean getSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getContent() {
        return content;
    }

    public void setContent(T content) {
        this.content = content;
    }

    @Override
    public String toString() {
        final StringBuffer sb = new StringBuffer("ResponseDto{");
        sb.append("success=").append(success);
        sb.append(", message='").append(message).append('\'');
        sb.append(", content=").append(content);
        sb.append('}');
        return sb.toString();
    }
}
```
controller类
```
package com.jiawa.wiki.controller;

import com.jiawa.wiki.req.EbookQueryReq;
import com.jiawa.wiki.req.EbookSaveReq;
import com.jiawa.wiki.resp.CommonResp;
import com.jiawa.wiki.resp.EbookQueryResp;
import com.jiawa.wiki.resp.PageResp;
import com.jiawa.wiki.service.EbookService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;

@RestController
@RequestMapping("/ebook")
public class EbookController {

    @Resource
    private EbookService ebookService;

    @GetMapping("/list")
    public CommonResp list(@Valid EbookQueryReq req) {
        CommonResp<PageResp<EbookQueryResp>> resp = new CommonResp<>();
        PageResp<EbookQueryResp> list = ebookService.list(req);
        resp.setContent(list);
        return resp;
    }

    @PostMapping("/save")
    public CommonResp save(@Valid @RequestBody EbookSaveReq req) {
        CommonResp resp = new CommonResp<>();
        ebookService.save(req);
        return resp;
    }

    @DeleteMapping("/delete/{id}")
    public CommonResp delete(@PathVariable Long id) {
        CommonResp resp = new CommonResp<>();
        ebookService.delete(id);
        return resp;
    }
}

```

#### 封装请求参数和返回参数
##### get参数请求
![image](../../youdaonote-images/3AFFA486CFD44077A9AC8A75E551B80E.png)
![image](../../youdaonote-images/DEBBFF8F6EEF4AAEB3B2EFD619307FCF.png)

##### 封装请求参数
**req是封装的接受请求参数，resp是封装返回的数据格式**
![image](../../youdaonote-images/4551BB0BFE944153ADE4C69525FDE078.png)
> req和resp里面都是domain层里面的模型复制来的，可以控制传入和传出数据

**controller类**
![image](../../youdaonote-images/E26AF6A8AB504B2195F4206506C564CC.png)

**service层：**
![image](../../youdaonote-images/E6F9DCFA3DE84943B90BDF0BE4C646A0.png)
> BeanUtils.copyProperties是将一个类复制给另一个类

#### 制作CopyUtil封装BeanUtils
![image](../../youdaonote-images/3BDAAAE372CB41B199442B4DA73280A5.png)

**因为list对象的复制要写一个循环，所以进行封装。**

![image](../../youdaonote-images/E6956D661DE5431699970A6EB697CD61.png)
```
package com.jiawa.wiki.util;

import org.springframework.beans.BeanUtils;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

public class CopyUtil {

    /**
     * 单体复制
     */
    public static <T> T copy(Object source, Class<T> clazz) {
        if (source == null) {
            return null;
        }
        T obj = null;
        try {
            obj = clazz.newInstance();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        BeanUtils.copyProperties(source, obj);
        return obj;
    }

    /**
     * 列表复制
     */
    public static <T> List<T> copyList(List source, Class<T> clazz) {
        List<T> target = new ArrayList<>();
        if (!CollectionUtils.isEmpty(source)){
            for (Object c: source) {
                T obj = copy(c, clazz);
                target.add(obj);
            }
        }
        return target;
    }
}

```
**演示效果**
```
        // List<EbookResp> respList = new ArrayList<>();
        // for (Ebook ebook : ebookList) {
        //     // EbookResp ebookResp = new EbookResp();
        //     // BeanUtils.copyProperties(ebook, ebookResp);
        //     // 对象复制
        //     EbookResp ebookResp = CopyUtil.copy(ebook, EbookResp.class);
        //
        //     respList.add(ebookResp);
        // }

        // 列表复制
        List<EbookQueryResp> list = CopyUtil.copyList(ebookList, EbookQueryResp.class);

```

### 解决跨域问题
![image](../../youdaonote-images/8AE732924C134141ACE4466898FE0D0C.png)
```
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedHeaders(CorsConfiguration.ALL)
                .allowedMethods(CorsConfiguration.ALL)
                .allowCredentials(true)
                .maxAge(3600); // 1小时内不需要再预检（发OPTIONS请求）
    }

}

```

### sprintBoot过滤器
**打印接口耗时** package com.jiawa.wiki.filter;
```

 import org.slf4j.Logger;
 import org.slf4j.LoggerFactory;
 import org.springframework.stereotype.Component;

 import javax.servlet.*;
 import javax.servlet.http.HttpServletRequest;
 import java.io.IOException;

 @Component
 public class LogFilter implements Filter {

     private static final Logger LOG = LoggerFactory.getLogger(LogFilter.class);

     @Override
     public void init(FilterConfig filterConfig) throws ServletException {

     }

     @Override
     public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
         // 打印请求信息
         HttpServletRequest request = (HttpServletRequest) servletRequest;
         LOG.info("------------- LogFilter 开始 -------------");
         LOG.info("请求地址: {} {}", request.getRequestURL().toString(), request.getMethod());
         LOG.info("远程地址: {}", request.getRemoteAddr());

         long startTime = System.currentTimeMillis();
         filterChain.doFilter(servletRequest, servletResponse);
         LOG.info("------------- LogFilter 结束 耗时：{} ms -------------", System.currentTimeMillis() - startTime);
     }
 }

```

### sprintBoot拦截器
**跟过滤器的区别是分成了前后两个方法,同时过滤器比拦截器作用范围大，过滤器是作用在tomcat容器上**
 package com.jiawa.wiki.interceptor;
```

 import org.slf4j.Logger;
 import org.slf4j.LoggerFactory;
 import org.springframework.stereotype.Component;
 import org.springframework.web.servlet.HandlerInterceptor;
 import org.springframework.web.servlet.ModelAndView;

 import javax.servlet.http.HttpServletRequest;
 import javax.servlet.http.HttpServletResponse;

 /**
  * 拦截器：Spring框架特有的，常用于登录校验，权限校验，请求日志打印 /login
  */
 @Component
 public class LogInterceptor implements HandlerInterceptor {

     private static final Logger LOG = LoggerFactory.getLogger(LogInterceptor.class);

     @Override
     public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
         // 打印请求信息
         LOG.info("------------- LogInterceptor 开始 -------------");
         LOG.info("请求地址: {} {}", request.getRequestURL().toString(), request.getMethod());
         LOG.info("远程地址: {}", request.getRemoteAddr());

         long startTime = System.currentTimeMillis();
         request.setAttribute("requestStartTime", startTime);
         return true;
     }

     @Override
     public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
         long startTime = (Long) request.getAttribute("requestStartTime");
         LOG.info("------------- LogInterceptor 结束 耗时：{} ms -------------", System.currentTimeMillis() - startTime);
     }
 }

```

**需要进行全局配置**package com.jiawa.wiki.config;
```
import com.jiawa.wiki.interceptor.ActionInterceptor;
import com.jiawa.wiki.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.annotation.Resource;

@Configuration
public class SpringMvcConfig implements WebMvcConfigurer {

    @Resource
    LoginInterceptor loginInterceptor;

    @Resource
    ActionInterceptor actionInterceptor;

    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/test/**",
                        "/redis/**",
                        "/user/login",
                        "/category/all",
                        "/ebook/list",
                        "/doc/all/**",
                        "/doc/vote/**",
                        "/doc/find-content/**",
                        "/ebook-snapshot/**"
                );

        registry.addInterceptor(actionInterceptor)
                .addPathPatterns(
                        "/*/save",
                        "/*/delete/**",
                        "/*/reset-password");
    }
}

```

### SpringbootAOP的使用
**配置AOP，打印接口耗时、请求参数、返回参数,和拦截器过滤器差不多，但是最后执行**
![image](../../youdaonote-images/F03215A168654959AE78E62D01532CC1.png)
#### 增加新的依赖
```
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>

        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.70</version>
        </dependency>

```