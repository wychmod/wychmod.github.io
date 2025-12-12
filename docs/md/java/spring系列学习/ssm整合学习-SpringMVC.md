# ssm整合学习-SpringMVC

## 一、SpringMVC简介

### 1 SpringMVC概述

#### 问题导入

SpringMVC框架有什么优点？

#### 1.1 SpringMVC概述

1. SpringMVC是一种基于Java实现MVC模型的轻量级Web框架
2. 优点
   1. 使用简单，开发便捷（相比于Servlet）
   2. 灵活性强

![image-20210804185234370.png](../../youdaonote-images/WEBRESOURCEe8d37ea79cc619f10c4ae14c46f14234.png)
### 2 入门案例【重点】

#### 问题导入

在Controller中如何定义访问路径，如何响应数据？

#### 2.1 实现步骤

```
1 创建web工程（Maven结构）
2 设置tomcat服务器，加载web工程(tomcat插件）
3 导入坐标（SpringMVC+Servlet）
4 定义处理请求的功能类（UserController）
5 编写SpringMVC配置类，加载处理请求的Bean。
6 加载SpringMVC配置，并设置SpringMVC请求拦截的路径
```

#### 2.2 代码实现
##### 【第一步】创建web工程（Maven结构）

##### 【第二步】设置tomcat服务器，加载web工程(tomcat插件）

```xml 
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.tomcat.maven</groupId>
            <artifactId>tomcat7-maven-plugin</artifactId>
            <version>2.1</version>
            <configuration>
                <port>80</port>
                <path>/</path>
            </configuration>
        </plugin>
    </plugins>
</build>
```

##### 【第三步】导入坐标（SpringMVC+Servlet）

```xml
<dependencies>
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>3.1.0</version>
        <scope>provided</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.2.10.RELEASE</version>
    </dependency>
</dependencies>
```

**注意事项：**

1. 课程版本基于Spring主版本5.2.10.RELEASE制作
2. 导入spring-webmvc坐标自动依赖spring相关坐标

##### 【第四步】定义处理请求的功能类（UserController）

```java
//定义表现层控制器bean
@Controller
public class UserController {
    //设置映射路径为/save，即外部访问路径
    @RequestMapping("/save")
    //设置当前操作返回结果为指定json数据（本质上是一个字符串信息）
    @ResponseBody
    public String save(){
        System.out.println("user save ...");
        return "{'info':'springmvc'}";
    }
}
```

**==注意事项：==**

对于SpringMVC而言，Controller方法返回值默认表示要跳转的页面，没有对应的页面就会报错。如果不想跳转页面而是响应数据，那么就需要在方法上使用@ResponseBody注解。

##### 【第五步】编写SpringMVC配置类，加载处理请求的Bean。

```java
//springmvc配置类，本质上还是一个spring配置类
@Configuration
@ComponentScan("com.itheima.controller")
public class SpringMvcConfig {
}
```

##### 【第六步】加载SpringMVC配置，并设置SpringMVC请求拦截的路径

```java
//web容器配置类
public class ServletContainersInitConfig extends AbstractDispatcherServletInitializer {
    //加载springmvc配置类，产生springmvc容器（本质还是spring容器）
    protected WebApplicationContext createServletApplicationContext() {
        //初始化WebApplicationContext对象
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        //加载指定配置类
        ctx.register(SpringMvcConfig.class);
        return ctx;
    }

    //设置由springmvc控制器处理的请求映射路径
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    //加载spring配置类
    protected WebApplicationContext createRootApplicationContext() {
        return null;
    }
}
```
#### 2.4 案例注解和类解析

##### 2.4.1 @Controller注解

- 名称：@Controller
- 类型：类注解
- 位置：SpringMVC控制器类定义上方
- 作用：设定SpringMVC的核心控制器bean
- 范例

```java
@Controller
public class UserController {
}
```

##### 2.4.2 @RequestMapping注解

- 名称：@RequestMapping
- 类型：方法注解
- 位置：SpringMVC控制器方法定义上方
- 作用：设置当前控制器方法请求访问路径
- 范例

```java
@RequestMapping("/save")
public void save(){
    System.out.println("user save ...");
}
```

> 注意：其实@RequestMapping注解还可以写到类上面，笔记后面会介绍到。

##### 2.4.3 @ResponseBody注解

- 名称：@ResponseBody
- 类型：方法注解
- 位置：SpringMVC控制器方法定义上方
- 作用：设置当前控制器方法响应内容为当前返回值，无需解析
- 范例

```java
@RequestMapping("/save")
@ResponseBody
public String save(){
    System.out.println("user save ...");
    return "{'info':'springmvc'}";
}
```

##### 2.4.4 AbstractDispatcherServletInitializer类

- AbstractDispatcherServletInitializer类是SpringMVC提供的快速初始化Web3.0容器的抽象类

- AbstractDispatcherServletInitializer提供三个接口方法供用户实现

  - createServletApplicationContext()方法，创建Servlet容器时，加载SpringMVC对应的bean并放入WebApplicationContext对象范围中，而WebApplicationContext的作用范围为ServletContext范围，即整个web容器范围。

  ```java
  //加载springmvc配置类，产生springmvc容器（本质还是spring容器）
  protected WebApplicationContext createServletApplicationContext() {
      AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
      ctx.register(SpringMvcConfig.class);
      return ctx;
  }
  ```

  - getServletMappings()方法，设定SpringMVC对应的请求映射路径，设置为/表示拦截所有请求，任意请求都将转入到SpringMVC进行处理。

  ```java
  //设置由springmvc控制器处理的请求映射路径
  protected String[] getServletMappings() {
      return new String[]{"/"};
  }
  ```

  - createRootApplicationContext()方法，如果创建Servlet容器时需要加载非SpringMVC对应的bean，使用当前方法进行，使用方式同createServletApplicationContext()

  ```java
  //加载spring配置类
  protected WebApplicationContext createRootApplicationContext() {
      return null;
  }
  ```

#### 2.5 入门程序开发总结(1+N)

- 一次性工作
  - 创建工程，设置服务器，加载工程
  - 导入坐标
  - 创建web容器启动类，加载SpringMVC配置，并设置SpringMVC请求拦截路径
  - SpringMVC核心配置类（设置配置类，扫描controller包，加载Controller控制器bean）
- 多次工作
  - 定义处理请求的控制器类
  - 定义处理请求的控制器方法，并配置映射路径（@RequestMapping）与返回json数据（@ResponseBody）

### 3 入门案例工作流程分析【理解】

#### 3.1 启动服务器初始化过程

1. 服务器启动，执行ServletContainersInitConfig类，初始化web容器
2. 执行createServletApplicationContext方法，创建了WebApplicationContext对象
3. 加载SpringMvcConfig配置类
4. 执行@ComponentScan加载对应的bean
5. 加载UserController，每个@RequestMapping的名称对应一个具体的方法
6. 执行getServletMappings方法，定义所有的请求都通过SpringMVC
![image-20210804193122709.png](../../youdaonote-images/WEBRESOURCE4ae244ad3fe3cf78455cde0ce9483d44.png)

#### 3.2 单次请求过程

1. 发送请求localhost/save
2. web容器发现所有请求都经过SpringMVC，将请求交给SpringMVC处理
3. 解析请求路径/save
4. 由/save匹配执行对应的方法save(）
5. 执行save()
6. 检测到有@ResponseBody直接将save()方法的返回值作为响应求体返回给请求方

![image-20210804193327981.png](../../youdaonote-images/WEBRESOURCE37a7b9d9b88861b243cd9ba69681b747.png)

### 4 Controller加载控制

#### 问题导入

因为功能不同，如何避免Spring错误的加载到SpringMVC的bean？

#### 4.1 Controller加载控制与业务bean加载控制

- SpringMVC相关bean（表现层bean）

- Spring控制的bean

  1. 业务bean（Service）

  2. 功能bean（DataSource等）

- SpringMVC相关bean加载控制
  1. SpringMVC加载的bean对应的包均在com.itheima.controller包内
- Spring相关bean加载控制
  1. 方式一：Spring加载的bean设定扫描范围为com.itheima，排除掉controller包内的bean
  2. 方式二：Spring加载的bean设定扫描范围为精准范围，例如service包、dao包等
  3. 方式三：不区分Spring与SpringMVC的环境，加载到同一个环境中

#### 4.2 方式一代码实现

- 名称：@ComponentScan
- 类型：类注解
- 范例

```java
@Configuration
@ComponentScan(value = "com.itheima",
               excludeFilters = @ComponentScan.Filter(
                   type = FilterType.ANNOTATION,
                   classes = Controller.class
               )
              )
public class SpringConfig {
}
```

- 属性
  1. excludeFilters：排除扫描路径中加载的bean，需要指定类别（type）与具体项（classes）
  2. includeFilters：加载指定的bean，需要指定类别（type）与具体项（classes）

#### 4.3 Bean的加载格式

```java
public class ServletContainersInitConfig extends AbstractDispatcherServletInitializer { 
    protected WebApplicationContext createServletApplicationContext() { 
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(SpringMvcConfig.class);
        return ctx;  
    }   
    protected WebApplicationContext createRootApplicationContext() {  
        AnnotationConfigWebApplicationContext ctx = new AnnotationConfigWebApplicationContext();      
        ctx.register(SpringConfig.class);        
        return ctx;  
    }   
    protected String[] getServletMappings() { 
        return new String[]{"/"}; 
    }
}
```

**简化格式**

```java
public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer{
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class}
    };
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }
}
```


### 5 PostMan【掌握】

#### 5.1 PostMan介绍

- Postman是一款功能强大的网页调试与发送网页HTTP请求的Chrome插件。<img src="assets/image-20210804194708518.png" alt="image-20210804194708518" style="zoom:25%;" />
- 作用：常用于进行接口测试
- 特征
  - 简单
  - 实用
  - 美观
  - 大方

## 二、请求与响应

### 1 请求映射路径【重点】

#### 问题导入

@RequestMapping注解注解可以写在哪？有什么作用？

#### 1.1 @RequestMapping注解

- 名称：@RequestMapping
- 类型：==方法注解  类注解==
- 位置：SpringMVC控制器方法定义上方
- 作用：设置当前控制器方法请求访问路径，如果设置在类上统一设置当前控制器方法请求访问路径前缀
- 范例

```java
@Controller
//类上方配置的请求映射与方法上面配置的请求映射连接在一起，形成完整的请求映射路径
@RequestMapping("/user")
public class UserController {
    //请求路径映射
    @RequestMapping("/save") //此时save方法的访问路径是：/user/save
    @ResponseBody
    public String save(){
        System.out.println("user save ...");
        return "{'module':'user save'}";
    }
}
```



### 2 请求参数

#### 2.1 发送普通类型参数【重点】

##### 问题导入

如何解决POST请求中文乱码问题？

##### 2.1.1 请求方式

- GET请求
- POST请求

##### 2.1.2 GET请求传递普通参数

- 普通参数：url地址传参，地址参数名与形参变量名相同，定义形参即可接收参数

![image-20210805102858905.png](../../youdaonote-images/WEBRESOURCE07772f360b7898da1e223fda169e0b11.png)

```java
//普通参数：请求参数与形参名称对应即可完成参数传递
@RequestMapping("/commonParam")
@ResponseBody
public String commonParam(String name ,int age){
    System.out.println("普通参数传递 name ==> "+name);
    System.out.println("普通参数传递 age ==> "+age);
    return "{'module':'common param'}";
}
```

- 问题：如果同学们传递的参数是中文试试，你们会发现接收到的参数出现了中文乱码问题。
- 原因：tomcat 8.5版本之后GET请求就不再出现中文乱码问题，但是我们使用的是tomcat7插件，所以会出现GET请求中文乱码问题。
- 解决：在pom.xml添加tomcat7插件处配置UTF-8字符集，解决GET请求中文乱码问题。

```xml
<build>
    <plugins>
      <plugin>
        <groupId>org.apache.tomcat.maven</groupId>
        <artifactId>tomcat7-maven-plugin</artifactId>
        <version>2.1</version>
        <configuration>
          <port>80</port><!--tomcat端口号-->
          <path>/</path> <!--虚拟目录-->
          <uriEncoding>UTF-8</uriEncoding><!--访问路径编解码字符集-->
        </configuration>
      </plugin>
    </plugins>
  </build>
```
##### 2.1.3 POST请求传递普通参数

- 普通参数：form表单post请求传参，表单参数名与形参变量名相同，定义形参即可接收参数
![image-20210805103041922.png](../../youdaonote-images/WEBRESOURCEb0ae6819338f37b2ae7432042db435ee.png)



```java
//普通参数：请求参数与形参名称对应即可完成参数传递
@RequestMapping("/commonParam")
@ResponseBody
public String commonParam(String name ,int age){
    System.out.println("普通参数传递 name ==> "+name);
    System.out.println("普通参数传递 age ==> "+age);
    return "{'module':'common param'}";
}
```

问题：我们发现，POST请求传递的参数如果包含中文那么就会出现中文乱码问题，说明我们之前配置的tomcat插件uri路径编解码字符集无法解决POST请求中文乱码问题。那么如何解决呢？

##### 2.1.4 POST请求中文乱码处理

> 在加载SpringMVC配置的配置类中指定字符过滤器。

```java
public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class[0];
    }

    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }

    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    //乱码处理
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        return new Filter[]{filter};
    }
}
```

#### 2.2 五种类型参数传递

##### 问题导入

当请求参数名与形参变量名不同，该如何接收请求参数？

##### 2.2.1 五种类型参数介绍

- 普通参数
- POJO类型参数
- 嵌套POJO类型参数
- 数组类型参数
- 集合类型参数

##### 2.2.2 普通参数【重点】

- 普通参数：当请求参数名与形参变量名不同，使用@RequestParam绑定参数关系

```java
//普通参数：请求参数名与形参名不同时，使用@RequestParam注解关联请求参数名称与形参名称之间的关系
@RequestMapping("/commonParamDifferentName")
@ResponseBody
public String commonParamDifferentName(@RequestParam("name") String userName , int age){
    System.out.println("普通参数传递 userName ==> "+userName);
    System.out.println("普通参数传递 age ==> "+age);
    return "{'module':'common param different name'}";
}
```

- 名称：@RequestParam
- 类型：形参注解
- 位置：SpringMVC控制器方法形参定义前面
- 作用：绑定请求参数与处理器方法形参间的关系
- 参数：
  - required：是否为必传参数
  - defaultValue：参数默认值

##### 2.2.3 POJO类型参数【重点】

- POJO参数：请求参数名与形参对象属性名相同，定义POJO类型形参即可接收参数
![image-20210805105056731.png](../../youdaonote-images/WEBRESOURCE4bb3d54ee31c85b3149d89777536ca8e.png)

```java
public class User {
    private String name;
    private int age;
    //同学们自己添加getter/setter/toString()方法
}
```

```java
//POJO参数：请求参数与形参对象中的属性对应即可完成参数传递
@RequestMapping("/pojoParam")
@ResponseBody
public String pojoParam(User user){
    System.out.println("pojo参数传递 user ==> "+user);
    return "{'module':'pojo param'}";
}
```

**==注意事项：请求参数key的名称要和POJO中属性的名称一致，否则无法封装。==**

##### 2.2.4 嵌套POJO类型参数

- POJO对象中包含POJO对象

```java
public class User {
    private String name;
    private int age;
    private Address address;
    //同学们自己添加getter/setter/toString()方法
}
public class Address {
    private String province;
    private String city;
    private Address address;
}
```

- 嵌套POJO参数：请求参数名与形参对象属性名相同，按照对象层次结构关系即可接收嵌套POJO属性参数

![image-20210805105505625.png](../../youdaonote-images/WEBRESOURCEdbd60cbbaf8ec9490c1ddd116fe31f44.png)

```java
//嵌套POJO参数：嵌套属性按照层次结构设定名称即可完成参数传递
@RequestMapping("/pojoContainPojoParam")
@ResponseBody
public String pojoContainPojoParam(User user){
    System.out.println("pojo嵌套pojo参数传递 user ==> "+user);
    return "{'module':'pojo contain pojo param'}";
}
```

**==注意事项：请求参数key的名称要和POJO中属性的名称一致，否则无法封装。==**

##### 2.2.5 数组类型参数

- 数组参数：请求参数名与形参对象属性名相同且请求参数为多个，定义数组类型即可接收参数

![image-20210805105825688.png](../../youdaonote-images/WEBRESOURCEaf39a75a699bc60c32716d169cdc8792.png)

```java
//数组参数：同名请求参数可以直接映射到对应名称的形参数组对象中
@RequestMapping("/arrayParam")
@ResponseBody
public String arrayParam(String[] likes){
    System.out.println("数组参数传递 likes ==> "+ Arrays.toString(likes));
    return "{'module':'array param'}";
}
```

##### 2.2.6 集合类型参数

- 集合保存普通参数：请求参数名与形参集合对象名相同且请求参数为多个，@RequestParam绑定参数关系

![image-20210805105957957.png](../../youdaonote-images/WEBRESOURCE334ce852b51d8014e6b276196bd7a2e7.png)
```java
//集合参数：同名请求参数可以使用@RequestParam注解映射到对应名称的集合对象中作为数据
@RequestMapping("/listParam")
@ResponseBody
public String listParam(@RequestParam List<String> likes){
    System.out.println("集合参数传递 likes ==> "+ likes);
    return "{'module':'list param'}";
}
```


#### 2.3 json数据参数传递

##### 问题导入

问题：@EnableWebMvc注解和@ResponseBody注解有什么用？

##### 2.3.1 json数据参数介绍

- json普通数组（["","","",...]）
- json对象（{key:value,key:value,...}）
- json对象数组（[{key:value,...},{key:value,...}]）

##### 2.3.2 传递json普通数组

###### 2.3.2.1 代码演示

1. 添加json数据转换相关坐标

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.0</version>
</dependency>
```

2. 设置发送json数据（请求body中添加json数据）

![image-20210805110937684.png](../../youdaonote-images/WEBRESOURCE5df7df1c6e04d85c68c09c55384da097.png)

3. 开启自动转换json数据的支持

```java
@Configuration
@ComponentScan("com.itheima.controller")
//开启json数据类型自动转换
@EnableWebMvc
public class SpringMvcConfig {
}
```

**注意事项：**

@EnableWebMvc注解功能强大，该注解整合了多个功能，此处仅使用其中一部分功能，即json数据进行自动类型转换

4. 在Controller中编写方法接收json参数

```java
//集合参数：json格式
//1.开启json数据格式的自动转换，在配置类中开启@EnableWebMvc
//2.使用@RequestBody注解将外部传递的json数组数据映射到形参的集合对象中作为数据
@RequestMapping("/listParamForJson")
@ResponseBody
public String listParamForJson(@RequestBody List<String> likes){
    System.out.println("list common(json)参数传递 list ==> "+likes);
    return "{'module':'list common for json param'}";
}
```
###### 2.3.2.2 @EnableWebMvc注解介绍

- 名称：@EnableWebMvc
- 类型：==配置类注解==
- 位置：SpringMVC配置类定义上方
- 作用：开启SpringMVC多项辅助功能
- 范例：

```java
@Configuration
@ComponentScan("com.itheima.controller")
@EnableWebMvc
public class SpringMvcConfig {
}
```

###### 2.3.2.3 @RequestBody注解介绍

- 名称：@RequestBody
- 类型：==形参注解==
- 位置：SpringMVC控制器方法形参定义前面
- 作用：将请求中请求体所包含的数据传递给请求参数，此注解一个处理器方法只能使用一次
- 范例：

```java
@RequestMapping("/listParamForJson")
@ResponseBody
public String listParamForJson(@RequestBody List<String> likes){
    System.out.println("list common(json)参数传递 list ==> "+likes);
    return "{'module':'list common for json param'}";
} 
```

##### 2.3.3 传递json对象

- POJO参数：json数据与形参对象属性名相同，定义POJO类型形参即可接收参数

![image-20210805111544701.png](../../youdaonote-images/WEBRESOURCE0dcdc7bc3e0e6bc91368cd68ec4403e1.png)

```java
//POJO参数：json格式
//1.开启json数据格式的自动转换，在配置类中开启@EnableWebMvc
//2.使用@RequestBody注解将外部传递的json数据映射到形参的实体类对象中，要求属性名称一一对应
@RequestMapping("/pojoParamForJson")
@ResponseBody
public String pojoParamForJson(@RequestBody User user){
    System.out.println("pojo(json)参数传递 user ==> "+user);
    return "{'module':'pojo for json param'}";
}
```

##### 2.3.4 传递json对象数组

- POJO集合参数：json数组数据与集合泛型属性名相同，定义List类型形参即可接收参数

![image-20210805111626095.png](../../youdaonote-images/WEBRESOURCEd385fdb03660306c6473ddd6d8dab44c.png)

```java
//集合参数：json格式
//1.开启json数据格式的自动转换，在配置类中开启@EnableWebMvc
//2.使用@RequestBody注解将外部传递的json数组数据映射到形参的保存实体类对象的集合对象中，要求属性名称一一对应
@RequestMapping("/listPojoParamForJson")
@ResponseBody
public String listPojoParamForJson(@RequestBody List<User> list){
    System.out.println("list pojo(json)参数传递 list ==> "+list);
    return "{'module':'list pojo for json param'}";
}
```

##### 2.3.5 @RequestBody与@RequestParam区别

- 区别
  @RequestParam用于接收url地址传参，表单传参【application/x-www-form-urlencoded】
  @RequestBody用于接收json数据【application/json】
- 应用
  后期开发中，发送json格式数据为主，@RequestBody应用较广
  如果发送非json格式数据，选用@RequestParam接收请求参数



### 3 日期类型参数传递【重点】

#### 问题导入

@DateTimeFormat注解的作用是什么？

#### 3.1 代码演示

- 日期类型数据基于系统不同格式也不尽相同
  2088-08-18
  2088/08/18
  08/18/2088
- 接收形参时，根据不同的日期格式设置不同的接收方式

![image-20210805113333189.png](../../youdaonote-images/WEBRESOURCEa5e6e78f3e8abdb971e2abb9555e413b.png)

```java
//日期参数 http://localhost:80/dataParam?date=2088/08/08&date1=2088-08-18&date2=2088/08/28 8:08:08
//使用@DateTimeFormat注解设置日期类型数据格式，默认格式yyyy/MM/dd
@RequestMapping("/dataParam")
@ResponseBody
public String dataParam(Date date,
                  @DateTimeFormat(pattern="yyyy-MM-dd") Date date1,
                  @DateTimeFormat(pattern="yyyy/MM/dd HH:mm:ss") Date date2){
    System.out.println("参数传递 date ==> "+date);
    System.out.println("参数传递 date1(yyyy-MM-dd) ==> "+date1);
    System.out.println("参数传递 date2(yyyy/MM/dd HH:mm:ss) ==> "+date2);
    return "{'module':'data param'}";
}
```

#### 3.2 @DateTimeFormat注解介绍

- 名称：@DateTimeFormat
- 类型：==形参注解==
- 位置：SpringMVC控制器方法形参前面
- 作用：设定日期时间型数据格式

- 属性：pattern：指定日期时间格式字符串

#### 3.3 工作原理

- 其内部依赖Converter接口

```java
public interface Converter<S, T> {
    @Nullable
    T convert(S var1);
}
```

- 请求参数年龄数据（String→Integer）
- json数据转对象（json → POJO）
- 日期格式转换（String → Date）

#### 3.4 注意事项

传递日期类型参数必须在配置类上使用@EnableWebMvc注解。其功能之一：根据类型匹配对应的类型转换器。

### 4 响应

#### 问题导入

如何响应json数据？

#### 4.1响应页面【了解】

```java
@Controller
public class UserController {

    //响应页面/跳转页面
    //返回值为String类型，设置返回值为页面名称，即可实现页面跳转
    @RequestMapping("/toJumpPage")
    public String toJumpPage(){
        System.out.println("跳转页面");
        return "page.jsp";
    }
}
```

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <h2>Hello Spring MVC!</h2>
    </body>
</html>
```

#### 4.2 文本数据【了解】

```java
//响应文本数据
//返回值为String类型，设置返回值为任意字符串信息，即可实现返回指定字符串信息，需要依赖@ResponseBody注解
@RequestMapping("/toText")
@ResponseBody
public String toText(){
    System.out.println("返回纯文本数据");
    return "response text";
}
```

#### 4.3 json数据【重点】

```java
//响应POJO对象
//返回值为实体类对象，设置返回值为实体类类型，即可实现返回对应对象的json数据，需要依赖@ResponseBody注解和@EnableWebMvc注解
@RequestMapping("/toJsonPOJO")
@ResponseBody
public User toJsonPOJO(){
    System.out.println("返回json对象数据");
    User user = new User();
    user.setName("itcast");
    user.setAge(15);
    return user;
}
```

```java
//响应POJO集合对象
//返回值为集合对象，设置返回值为集合类型，即可实现返回对应集合的json数组数据，需要依赖@ResponseBody注解和@EnableWebMvc注解
@RequestMapping("/toJsonList")
@ResponseBody
public List<User> toJsonList(){
    System.out.println("返回json集合数据");
    User user1 = new User();
    user1.setName("传智播客");
    user1.setAge(15);

    User user2 = new User();
    user2.setName("黑马程序员");
    user2.setAge(12);

    List<User> userList = new ArrayList<User>();
    userList.add(user1);
    userList.add(user2);

    return userList;
}
```

**==注意：需要添加jackson-databind依赖以及在SpringMvcConfig配置类上添加@EnableWebMvc注解==**

## 三、REST风格

### 1 REST简介

#### 问题导入

Rest风格使用了几种请求方式定义访问行为？

#### 1.1 REST介绍

- REST（Representational State Transfer），表现形式状态转换
  - 传统风格资源描述形式
    	http://localhost/user/getById?id=1
    	http://localhost/user/saveUser
  - REST风格描述形式
    	http://localhost/user/1
    	http://localhost/user
- 优点：
  - 隐藏资源的访问行为，无法通过地址得知对资源是何种操作
  - 书写简化

#### 1.2 RESTful介绍

- 按照REST风格访问资源时使用==行为动作==区分对资源进行了何种操作
  http://localhost/users		查询全部用户信息	（查询）
  http://localhost/users/1		查询指定用户信息（查询）
  http://localhost/users		添加用户信息（新增/保存）
  http://localhost/users		修改用户信息（修改/更新）
  http://localhost/users/1		删除用户信息（删除）
- 根据REST风格对资源进行访问称为RESTful

#### 1.3 注意事项

- 上述行为是约定方式，约定不是规范，可以打破，所以称REST风格，而不是REST规范
- 描述模块的名称通常使用复数，也就是加s的格式描述，表示此类资源，而非单个资源，例如：users、books、accounts……

### 2 RESTful入门案例

#### 问题导入

Rest风格如何通过路径传递参数？

#### 2.1 快速入门

> 做法：在Controller中定义方法时设定"http请求动作(请求方式)"和"设定请求参数（路径变量）"

```java
@Controller
public class UserController {

    //设置当前请求方法为POST，表示REST风格中的添加操作
    @RequestMapping(value = "/users",method = RequestMethod.POST)
    @ResponseBody
    public String save(){
        System.out.println("user save...");
        return "{'module':'user save'}";
    }

    //设置当前请求方法为DELETE，表示REST风格中的删除操作
    //@PathVariable注解用于设置路径变量（路径参数），要求路径上设置对应的占位符，并且占位符名称与方法形参名称相同
    @RequestMapping(value = "/users/{id}",method = RequestMethod.DELETE)
    @ResponseBody
    public String delete(@PathVariable Integer id){
        System.out.println("user delete..." + id);
        return "{'module':'user delete'}";
    }

    //设置当前请求方法为PUT，表示REST风格中的修改操作
    @RequestMapping(value = "/users",method = RequestMethod.PUT)
    @ResponseBody
    public String update(@RequestBody User user){
        System.out.println("user update..."+user);
        return "{'module':'user update'}";
    }

    //设置当前请求方法为GET，表示REST风格中的查询操作
    //@PathVariable注解用于设置路径变量（路径参数），要求路径上设置对应的占位符，并且占位符名称与方法形参名称相同
    @RequestMapping(value = "/users/{id}" ,method = RequestMethod.GET)
    @ResponseBody
    public String getById(@PathVariable Integer id){
        System.out.println("user getById..."+id);
        return "{'module':'user getById'}";
    }

    //设置当前请求方法为GET，表示REST风格中的查询操作
    @RequestMapping(value = "/users",method = RequestMethod.GET)
    @ResponseBody
    public String getAll(){
        System.out.println("user getAll...");
        return "{'module':'user getAll'}";
    }
}
```

#### 2.2 @PathVariable介绍

- 名称：@PathVariable
- 类型：形参注解
- 位置：SpringMVC控制器方法形参定义前面
- 作用：绑定路径参数与处理器方法形参间的关系，要求路径参数名与形参名一一对应

![image-20210805120253164.png](../../youdaonote-images/WEBRESOURCE1e8e4e5d953d902767d994599c66dc28.png)

#### 2.3 @RequestBody、@RequestParam、@PathVariable区别和应用

- 区别
  @RequestParam用于接收url地址传参或表单传参
  @RequestBody用于接收json数据
  @PathVariable用于接收路径参数，使用{参数名称}描述路径参数
- 应用
  后期开发中，发送请求参数超过1个时，以json格式为主，@RequestBody应用较广
  如果发送非json格式数据，选用@RequestParam接收请求参数
  采用RESTful进行开发，当参数数量较少时，例如1个，可以采用@PathVariable接收请求路径变量，通常用于传递id值



### 3 REST快速开发【重点】

#### 3.1 代码中的问题

![image-20210805132351738.png](../../youdaonote-images/WEBRESOURCE63f728c61b9bdeed4ced0ba92428aadb.png)

> 以上截图中的代码和我们之前写的UserController中的方法类似，其中图中两个方法都有三处是有问题的，可以进行优化。存在的问题如下：

问题1：每个方法的@RequestMapping注解中都定义了访问路径/books，重复性太高。

问题2：每个方法的@RequestMapping注解中都要使用method属性定义请求方式，重复性太高。

问题3：每个方法响应json都需要加上@ResponseBody注解，重复性太高。

#### 3.2 Rest快速开发

> 解决以上三个问题

解决问题1：在Controller类上使用@RequestMapping定义共同的访问路径。

```java
@Controller
@RequestMapping("/books")
public class BookController {
    
    @RequestMapping(method = RequestMethod.POST)
    public String save(@RequestBody Book book){
        System.out.println("book save..." + book);
        return "{'module':'book save'}";
    }
    @RequestMapping(value = "/{id}" ,method = RequestMethod.DELETE)
    public String delete(@PathVariable Integer id){
        System.out.println("book delete..." + id);
        return "{'module':'book delete'}";
    }
    @RequestMapping(method = RequestMethod.PUT)
    public String update(@RequestBody Book book){
        System.out.println("book update..."+book);
        return "{'module':'book update'}";
    }
    @RequestMapping(value = "/{id}" ,method = RequestMethod.GET)
    public String getById(@PathVariable Integer id){
        System.out.println("book getById..."+id);
        return "{'module':'book getById'}";
    }

    @RequestMapping(method = RequestMethod.GET)
    public String getAll(){
        System.out.println("book getAll...");
        return "{'module':'book getAll'}";
    }
}
```

解决问题2：使用@GetMapping  @PostMapping  @PutMapping  @DeleteMapping代替@RequestMapping(method=RequestMethod.XXX)

```java
@Controller   
@RequestMapping("/books")
public class BookController {

//    @RequestMapping( method = RequestMethod.POST)
    @PostMapping//使用@PostMapping简化Post请求方法对应的映射配置
    public String save(@RequestBody Book book){
        System.out.println("book save..." + book);
        return "{'module':'book save'}";
    }

//    @RequestMapping(value = "/{id}" ,method = RequestMethod.DELETE)
    @DeleteMapping("/{id}")  //使用@DeleteMapping简化DELETE请求方法对应的映射配置
    public String delete(@PathVariable Integer id){
        System.out.println("book delete..." + id);
        return "{'module':'book delete'}";
    }

//    @RequestMapping(method = RequestMethod.PUT)
    @PutMapping   //使用@PutMapping简化Put请求方法对应的映射配置
    public String update(@RequestBody Book book){
        System.out.println("book update..."+book);
        return "{'module':'book update'}";
    }

//    @RequestMapping(value = "/{id}" ,method = RequestMethod.GET)
    @GetMapping("/{id}")    //使用@GetMapping简化GET请求方法对应的映射配置
    public String getById(@PathVariable Integer id){
        System.out.println("book getById..."+id);
        return "{'module':'book getById'}";
    }

//    @RequestMapping(method = RequestMethod.GET)
    @GetMapping      //使用@GetMapping简化GET请求方法对应的映射配置
    public String getAll(){
        System.out.println("book getAll...");
        return "{'module':'book getAll'}";
    }
}
```

- 名称：@GetMapping  @PostMapping  @PutMapping  @DeleteMapping
- 类型：方法注解
- 位置：基于SpringMVC的RESTful开发控制器方法定义上方
- 作用：设置当前控制器方法请求访问路径与请求动作，每种对应一个请求动作，例如@GetMapping对应GET请求
- 属性：
  value（默认）：请求访问路径



解决问题3：在Controller类上使用@RestController注解，等同于@Controller与@ResponseBody两个注解组合功能

```java
@RestController     //使用@RestController注解替换@Controller与@ResponseBody注解，简化书写
@RequestMapping("/books")
public class BookController {
    //方法省略了没写
}
```

- 名称：@RestController
- 类型：类注解
- 位置：基于SpringMVC的RESTful开发控制器类定义上方
- 作用：设置当前控制器类为RESTful风格，等同于@Controller与@ResponseBody两个注解组合功能

### 4案例：基于RESTful页面数据交互

#### 4.1 案例效果和环境准备

##### 4.1.1 案例效果

![image-20210805140535262.png](../../youdaonote-images/WEBRESOURCEabc76f8cae4783adb5d2e1728320c002.png)

##### 4.1.2 环境准备

```java
//POJO实体类
public class Book {
    private Integer id;
    private String type;
    private String name;
    private String description;
    //同学们自己重写getter、setter、toString()方法...
}

//SpringMVC容器初始化类
public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class[0];
    }

    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }

    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
    //乱码处理
    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding("UTF-8");
        return new Filter[]{filter};
    }
}

//SpringMVC配置类
@Configuration
@ComponentScan({"com.itheima.controller","com.itheima.config"})
@EnableWebMvc
public class SpringMvcConfig {
}
```

#### 4.2 代码实现

##### 4.2.1 制作SpringMVC控制器，并通过PostMan测试接口功能

```java
@RestController
@RequestMapping("/books")
public class BookController {

    @PostMapping
    public String save(@RequestBody Book book){
        System.out.println("book save ==> "+ book);
        return "{'module':'book save success'}";
    }

    @GetMapping
    public List<Book> getAll(){
        System.out.println("book getAll is running ...");
        List<Book> bookList = new ArrayList<Book>();

        Book book1 = new Book();
        book1.setType("计算机");
        book1.setName("SpringMVC入门教程");
        book1.setDescription("小试牛刀");
        bookList.add(book1);

        Book book2 = new Book();
        book2.setType("计算机");
        book2.setName("SpringMVC实战教程");
        book2.setDescription("一代宗师");
        bookList.add(book2);

        Book book3 = new Book();
        book3.setType("计算机丛书");
        book3.setName("SpringMVC实战教程进阶");
        book3.setDescription("一代宗师呕心创作");
        bookList.add(book3);

        return bookList;
    }
}
```

![image-20210805140307371.png](../../youdaonote-images/WEBRESOURCE8534f1c316dd0f4a7c47b575a0600802.png)
##### 4.2.2 设置对静态资源的访问放行

```java
@Configuration
public class SpringMvcSupport extends WebMvcConfigurationSupport {
    //设置静态资源访问过滤，当前类需要设置为配置类，并被扫描加载
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        //当访问/pages/????时候，从/pages目录下查找内容
        registry.addResourceHandler("/pages/**")
            .addResourceLocations("/pages/");
        registry.addResourceHandler("/js/**")
            .addResourceLocations("/js/");        		
        registry.addResourceHandler("/css/**")
            .addResourceLocations("/css/");       
        registry.addResourceHandler("/plugins/**")
            .addResourceLocations("/plugins/");
    }
}
```

##### 4.2.3 前端页面通过异步提交访问后台控制器

```javascript
//添加
saveBook () {
    axios.post("/books",this.formData).then((res)=>{

    });
},
//主页列表查询
getAll() {
    axios.get("/books").then((res)=>{
        this.dataList = res.data;
    });
},
```

## 四、SSM整合【重点】

### 1 SSM整合配置

#### 问题导入

请描述“SSM整合流程”中各个配置类的作用？

#### 1.1 SSM整合流程

1. 创建工程
2. SSM整合
   - Spring
     - SpringConfig
   - MyBatis
     - MybatisConfig
     - JdbcConfig
     - jdbc.properties
   - SpringMVC
     - ServletConfig
     - SpringMvcConfig
3. 功能模块
   - 表与实体类
   - dao（接口+自动代理）
   - service（接口+实现类）
     - 业务层接口测试（整合JUnit）
   - controller
     - 表现层接口测试（PostMan）

#### 1.2 SSM整合配置

##### 1.2.1 创建工程，添加依赖和插件

![image-20210805164125741.png](../../youdaonote-images/WEBRESOURCE0b0b326ebf298341a08966e672c51819.png)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.2.10.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>5.2.10.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-test</artifactId>
        <version>5.2.10.RELEASE</version>
    </dependency>

    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.6</version>
    </dependency>

    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis-spring</artifactId>
        <version>1.3.0</version>
    </dependency>

    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.47</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid</artifactId>
        <version>1.1.16</version>
    </dependency>

    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.12</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>3.1.0</version>
        <scope>provided</scope>
    </dependency>

    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.9.0</version>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.tomcat.maven</groupId>
            <artifactId>tomcat7-maven-plugin</artifactId>
            <version>2.1</version>
            <configuration>
                <port>80</port>
                <path>/</path>
            </configuration>
        </plugin>
    </plugins>
</build>
```

##### 1.2.2 Spring整合Mybatis

- 创建数据库和表

```sql
-- 创建ssm_db数据库
CREATE DATABASE IF NOT EXISTS ssm_db CHARACTER SET utf8;

-- 使用ssm_db数据库
USE ssm_db;

-- 创建tbl_book表
CREATE TABLE tbl_book(
    id INT PRIMARY KEY AUTO_INCREMENT, -- 图书编号
    TYPE VARCHAR(100), -- 图书类型
    NAME VARCHAR(100), -- 图书名称
    description VARCHAR(100) -- 图书描述
);
-- 添加初始化数据
INSERT INTO tbl_book VALUES(NULL,'计算机理论','Spring实战 第5版','Spring入门经典教材，深入理解Spring原理技术内幕');
INSERT INTO tbl_book VALUES(NULL,'计算机理论','Spring 5核心原理与30个类手写实战','十年沉淀之作,手写Spring精华思想');
INSERT INTO tbl_book VALUES(NULL,'计算机理论','Spring 5设计模式','深入Spring源码剖析,Spring源码蕴含的10大设计模式');
INSERT INTO tbl_book VALUES(NULL,'市场营销','直播就该这么做:主播高效沟通实战指南','李子柒、李佳琦、薇娅成长为网红的秘密都在书中');
INSERT INTO tbl_book VALUES(NULL,'市场营销','直播销讲实战一本通','和秋叶一起学系列网络营销书籍');
INSERT INTO tbl_book VALUES(NULL,'市场营销','直播带货:淘宝、天猫直播从新手到高手','一本教你如何玩转直播的书,10堂课轻松实现带货月入3W+');
```

- jdbc.properties属性文件

```properties
jdbc.driver=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/ssm_db
jdbc.username=root
jdbc.password=root
```
- JdbcConfig配置类
```java
public class JdbcConfig {
    @Value("${jdbc.driver}")
    private String driver;
    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String username;
    @Value("${jdbc.password}")
    private String password;
	//配置连接池
    @Bean
    public DataSource dataSource(){
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName(driver);
        dataSource.setUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }
	//Spring事务管理需要的平台事务管理器对象
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource){
        DataSourceTransactionManager ds = new DataSourceTransactionManager();
        ds.setDataSource(dataSource);
        return ds;
    }
}
```

- MybatisConfig配置类

```java
public class MyBatisConfig {
    @Bean
    public SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource){
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setTypeAliasesPackage("com.itheima.domain");
        return factoryBean;
    }

    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer(){
        MapperScannerConfigurer msc = new MapperScannerConfigurer();
        msc.setBasePackage("com.itheima.dao");
        return msc;
    }
}
```

- SpringConfig配置类

```java
@Configuration
@ComponentScan({"com.itheima.service"})
@PropertySource("classpath:jdbc.properties")
@Import({JdbcConfig.class,MyBatisConfig.class})
@EnableTransactionManagement //开启Spring事务管理
public class SpringConfig {
}
```

##### 1.2.3 Spring整合SpringMVC

- SpringMvcConfig配置类

```java
@Configuration
@ComponentScan("com.itheima.controller")
@EnableWebMvc
public class SpringMvcConfig {
}
```

- ServletConfig配置类，加载SpringMvcConfig和SpringConfig配置类

```java
public class ServletConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }

    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }

    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
}
```

### 2 功能模块开发

#### 2.1 数据层开发(BookDao)

- Book实体类

```java
public class Book {
    private Integer id;
    private String type;
    private String name;
    private String description;
    //同学们自己添加getter、setter、toString()方法
}
```
- BookDao接口
```java
public interface BookDao {

    //@Insert("insert into tbl_book values(null,#{type},#{name},#{description})")
    @Insert("insert into tbl_book (type,name,description) values(#{type},#{name},#{description})")
    public int save(Book book);  //返回值表示影响的行数

    @Update("update tbl_book set type = #{type}, name = #{name}, description = #{description} where id = #{id}")
    public int update(Book book);

    @Delete("delete from tbl_book where id = #{id}")
    public int delete(Integer id);

    @Select("select * from tbl_book where id = #{id}")
    public Book getById(Integer id);

    @Select("select * from tbl_book")
    public List<Book> getAll();
}
```

#### 2.2 业务层开发(BookService/BookServiceImpl)

- BookService接口

```java
@Transactional //表示所有方法进行事务管理
public interface BookService {

    /**
     * 保存
     * @param book
     * @return
     */
    public boolean save(Book book);

    /**
     * 修改
     * @param book
     * @return
     */
    public boolean update(Book book);

    /**
     * 按id删除
     * @param id
     * @return
     */
    public boolean delete(Integer id);

    /**
     * 按id查询
     * @param id
     * @return
     */
    public Book getById(Integer id);

    /**
     * 查询全部
     * @return
     */
    public List<Book> getAll();
}
```

- BookServiceImpl实现类

```java
@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookDao bookDao;

    public boolean save(Book book) {
        bookDao.save(book);
        return true;
    }

    public boolean update(Book book) {
        bookDao.update(book);
        return true;
    }

    public boolean delete(Integer id) {
        bookDao.delete(id);
        return true;
    }

    public Book getById(Integer id) {
        return bookDao.getById(id);
    }

    public List<Book> getAll() {
        return bookDao.getAll();
    }
}
```

#### 2.3 表现层开发(BookController)

```java
@RestController
@RequestMapping("/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @PostMapping
    public boolean save(@RequestBody Book book) {
        return bookService.save(book);
    }

    @PutMapping
    public boolean update(@RequestBody Book book) {
        return bookService.update(book);
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Integer id) {
        return bookService.delete(id);
    }

    @GetMapping("/{id}")
    public Book getById(@PathVariable Integer id) {
        return bookService.getById(id);
    }

    @GetMapping
    public List<Book> getAll() {
        return bookService.getAll();
    }
}
```

### 3 接口测试

#### 3.1 Spring整合Junit测试业务层方法

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringConfig.class)
public class BookServiceTest {

    @Autowired
    private BookService bookService;

    @Test
    public void testGetById(){
        Book book = bookService.getById(1);
        System.out.println(book);
    }

    @Test
    public void testGetAll(){
        List<Book> all = bookService.getAll();
        System.out.println(all);
    }
}
```

#### 3.2 postman测试表现层接口

- 测试保存图书

![image-20210805165801606.png](../../youdaonote-images/WEBRESOURCEcbcb3415725ff4e8f7dd4a0355909b2e.png)


## 二、表现层数据封装【重点】

### 问题导入

目前我们表现层响应给客户端的数据有哪几种？

### 1 表现层响应数据的问题

问题：我们表现层增删改方法返回true或者false表示是否成功，getById()方法返回一个json对象，getAll()方法返回一个json对象数组，这里就出现了三种格式的响应结果，极其不利于前端解析。

![image-20210805170157483.png](../../youdaonote-images/WEBRESOURCEe851d95af741cd133c19f9d6b3495029.png)

解决：我们需要统一响应结果的格式

### 2 定义Result类封装响应结果

#### 2.1 Result类封装响应结果

```java
public class Result {
    //描述统一格式中的数据
    private Object data;
    //描述统一格式中的编码，用于区分操作，可以简化配置0或1表示成功失败
    private Integer code;
    //描述统一格式中的消息，可选属性
    private String msg;

    public Result() {
    }
    public Result(Integer code,Object data) {
        this.data = data;
        this.code = code;
    }
    public Result(Integer code, Object data, String msg) {
        this.data = data;
        this.code = code;
        this.msg = msg;
    }
     //同学们自己添加getter、setter、toString()方法
}
```

**注意事项：**

Result类中的字段并不是固定的，可以根据需要自行增减

#### 2.2 Code类封装响应码

```java
//状态码
public class Code {
    public static final Integer SAVE_OK = 20011;
    public static final Integer DELETE_OK = 20021;
    public static final Integer UPDATE_OK = 20031;
    public static final Integer GET_OK = 20041;

    public static final Integer SAVE_ERR = 20010;
    public static final Integer DELETE_ERR = 20020;
    public static final Integer UPDATE_ERR = 20030;
    public static final Integer GET_ERR = 20040;
}
```

**注意事项：**

Code类的常量设计也不是固定的，可以根据需要自行增减，例如将查询再进行细分为GET_OK，GET_ALL_OK，GET_PAGE_OK

### 3 表现层数据封装返回Result对象

```java
@RestController
@RequestMapping("/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @PostMapping
    public Result save(@RequestBody Book book) {
        boolean flag = bookService.save(book);
        return new Result(flag ? Code.SAVE_OK:Code.SAVE_ERR,flag);
    }

    @PutMapping
    public Result update(@RequestBody Book book) {
        boolean flag = bookService.update(book);
        return new Result(flag ? Code.UPDATE_OK:Code.UPDATE_ERR,flag);
    }

    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Integer id) {
        boolean flag = bookService.delete(id);
        return new Result(flag ? Code.DELETE_OK:Code.DELETE_ERR,flag);
    }

    @GetMapping("/{id}")
    public Result getById(@PathVariable Integer id) {
        Book book = bookService.getById(id);
        Integer code = book != null ? Code.GET_OK : Code.GET_ERR;
        String msg = book != null ? "" : "数据查询失败，请重试！";
        return new Result(code,book,msg);
    }

    @GetMapping
    public Result getAll() {
        List<Book> bookList = bookService.getAll();
        Integer code = bookList != null ? Code.GET_OK : Code.GET_ERR;
        String msg = bookList != null ? "" : "数据查询失败，请重试！";
        return new Result(code,bookList,msg);
    }
}
```

## 三、异常处理器【理解】

### 问题导入

问题1：项目各个个层级均可能出现异常，异常处理代码书写在哪一层？

### 1 异常介绍

- 程序开发过程中不可避免的会遇到异常现象，我们不能让用户看到这样的页面数据

![image-20210805172011686.png](../../youdaonote-images/WEBRESOURCE8db0a60bfad35fa5242d0baa5426e0b6.png)

- 出现异常现象的常见位置与常见诱因如下：
  - 框架内部抛出的异常：因使用不合规导致
  - 数据层抛出的异常：因外部服务器故障导致（例如：服务器访问超时）
  - 业务层抛出的异常：因业务逻辑书写错误导致（例如：遍历业务书写操作，导致索引异常等）
  - 表现层抛出的异常：因数据收集、校验等规则导致（例如：不匹配的数据类型间导致异常）
  - 工具类抛出的异常：因工具类书写不严谨不够健壮导致（例如：必要释放的连接长期未释放等）

### 2 异常处理器

#### 2.2.1 编写异常处理器

```java
@RestControllerAdvice  //用于标识当前类为REST风格对应的异常处理器
public class ProjectExceptionAdvice {

    //统一处理所有的Exception异常
    @ExceptionHandler(Exception.class)
    public Result doOtherException(Exception ex){
        return new Result(666,null);
    }
}
```

**使用异常处理器之后的效果**

![image-20210805171924452.png](../../youdaonote-images/WEBRESOURCE6df04a8a1fb30bca7029f7a5c7ca6b33.png)

#### 2.2.2 @RestControllerAdvice注解介绍

- 名称：@RestControllerAdvice

- 类型：==类注解==

- 位置：Rest风格开发的控制器增强类定义上方
- 作用：为Rest风格开发的控制器类做增强
- 说明：此注解自带@ResponseBody注解与@Component注解，具备对应的功能

#### 2.2.3 @ExceptionHandler注解介绍

- 名称：@ExceptionHandler
- 类型：==方法注解==
- 位置：专用于异常处理的控制器方法上方
- 作用：设置指定异常的处理方案，功能等同于控制器方法，出现异常后终止原始控制器执行，并转入当前方法执行
- 说明：此类方法可以根据处理的异常不同，制作多个方法分别处理对应的异常

## 四、项目异常处理方案【理解】

### 问题导入

请说出项目当前异常的分类以及对应类型异常该如何处理？

### 1 项目异常分类

- 业务异常（BusinessException）
  - 规范的用户行为产生的异常
  - 不规范的用户行为操作产生的异常
- 系统异常（SystemException）
  - 项目运行过程中可预计且无法避免的异常
- 其他异常（Exception）
  - 编程人员未预期到的异常

### 2 项目异常处理方案

- 业务异常（BusinessException）
  - ==发送对应消息传递给用户，提醒规范操作==
- 系统异常（SystemException）
  - ==发送固定消息传递给用户，安抚用户==
  - 发送特定消息给运维人员，提醒维护
  - 记录日志
- 其他异常（Exception）
  - ==发送固定消息传递给用户，安抚用户==
  - 发送特定消息给编程人员，提醒维护（纳入预期范围内）
  - 记录日志

### 3 项目异常处理代码实现

#### 3.1 根据异常分类自定义异常类

##### 3.1.1 自定义项目系统级异常

```java
//自定义异常处理器，用于封装异常信息，对异常进行分类
public class SystemException extends RuntimeException{
    private Integer code;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public SystemException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public SystemException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
```

##### 3.1.2 自定义项目业务级异常

```java
//自定义异常处理器，用于封装异常信息，对异常进行分类
public class BusinessException extends RuntimeException{
    private Integer code;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(Integer code,String message,Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
```

#### 3.2 自定义异常编码（持续补充）

```java
public class Code {

	//之前其他状态码省略没写，以下是新补充的状态码，可以根据需要自己补充
    
    public static final Integer SYSTEM_ERR = 50001;
    public static final Integer SYSTEM_TIMEOUT_ERR = 50002;
    public static final Integer SYSTEM_UNKNOW_ERR = 59999;
    public static final Integer BUSINESS_ERR = 60002;
    
}
```

#### 3.3 触发自定义异常

```java
@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookDao bookDao;

	//在getById演示触发异常，其他方法省略没有写进来
    public Book getById(Integer id) {
        //模拟业务异常，包装成自定义异常
        if(id <0){
            throw new BusinessException(Code.BUSINESS_ERR,"请不要使用你的技术挑战我的耐性!");
        }
    }
}
```

#### 3.4 在异常通知类中拦截并处理异常

```java
@RestControllerAdvice //用于标识当前类为REST风格对应的异常处理器
public class ProjectExceptionAdvice {
    //@ExceptionHandler用于设置当前处理器类对应的异常类型
    @ExceptionHandler(SystemException.class)
    public Result doSystemException(SystemException ex){
        //记录日志
        //发送消息给运维
        //发送邮件给开发人员,ex对象发送给开发人员
        return new Result(ex.getCode(),null,ex.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public Result doBusinessException(BusinessException ex){
        return new Result(ex.getCode(),null,ex.getMessage());
    }

    //除了自定义的异常处理器，保留对Exception类型的异常处理，用于处理非预期的异常
    @ExceptionHandler(Exception.class)
    public Result doOtherException(Exception ex){
        //记录日志
        //发送消息给运维
        //发送邮件给开发人员,ex对象发送给开发人员
        return new Result(Code.SYSTEM_UNKNOW_ERR,null,"系统繁忙，请稍后再试！");
    }
}
```

测试：在postman中发送请求访问getById方法，传递参数-1，得到以下结果：

![image-20210805173815730.png](../../youdaonote-images/WEBRESOURCEefe4dffbbd1ab7e50e35c49546222c98.png)



## 五、SSM整合页面开发【重点】

### 1 准备工作

> 为了确保静态资源能够被访问到，需要设置静态资源过滤

```java
@Configuration
public class SpringMvcSupport extends WebMvcConfigurationSupport {
    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/pages/**")
            .addResourceLocations("/pages/");
        registry.addResourceHandler("/css/**")
            .addResourceLocations("/css/");
        registry.addResourceHandler("/js/**")
            .addResourceLocations("/js/");
        registry.addResourceHandler("/plugins/**")
            .addResourceLocations("/plugins/");
    }
}
```

### 2 列表查询功能

- 前端代码

```javascript
//列表
getAll() {
    //发送ajax请求
    axios.get("/books").then((res)=>{
        this.dataList = res.data.data;
    });
}
```

### 3 添加功能

- 前端代码

```javascript
//弹出添加窗口
handleCreate() {
    this.dialogFormVisible = true;
    this.resetForm();
},
//重置表单
resetForm() {
    this.formData = {};
},
//添加
handleAdd () {
    //发送ajax请求
    axios.post("/books",this.formData).then((res)=>{
        console.log(res.data);
        //如果操作成功，关闭弹层，显示数据
        if(res.data.code == 20011){
            this.dialogFormVisible = false;
            this.$message.success("添加成功");
        }else if(res.data.code == 20010){
            this.$message.error("添加失败");
        }else{
            this.$message.error(res.data.msg);
        }
    }).finally(()=>{
        this.getAll();
    });
},
```

- 后台代码改进

```java
@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookDao bookDao;
	//增删改的方法判断了影响的行数是否大于0，而不是固定返回true
    public boolean save(Book book) {
        return bookDao.save(book) > 0;
    }
	//增删改的方法判断了影响的行数是否大于0，而不是固定返回true
    public boolean update(Book book) {
        return bookDao.update(book) > 0;
    }
	//增删改的方法判断了影响的行数是否大于0，而不是固定返回true
    public boolean delete(Integer id) {
        return bookDao.delete(id) > 0;
    }

    public Book getById(Integer id) {
        if(id < 0){
            throw new BusinessException(Code.BUSINESS_ERR,"请不要使用你的技术挑战我的耐性!");
            return bookDao.getById(id);
        }
    }
    public List<Book> getAll() {
        return bookDao.getAll();
    }
}
```

### 4 修改功能

- 显示弹出框查询图书信息

```javascript
//弹出编辑窗口
handleUpdate(row) {
    // console.log(row);   //row.id 查询条件
    //查询数据，根据id查询
    axios.get("/books/"+row.id).then((res)=>{
        // console.log(res.data.data);
        if(res.data.code == 20041){
            //展示弹层，加载数据
            this.formData = res.data.data;
            this.dialogFormVisible4Edit = true;
        }else{
            this.$message.error(res.data.msg);
        }
    });
}
```

- 保存修改后的图书信息

```javascript
//编辑
handleEdit() {
    //发送ajax请求
    axios.put("/books",this.formData).then((res)=>{
        //如果操作成功，关闭弹层，显示数据
        if(res.data.code == 20031){
            this.dialogFormVisible4Edit = false;
            this.$message.success("修改成功");
        }else if(res.data.code == 20030){
            this.$message.error("修改失败");
        }else{
            this.$message.error(res.data.msg);
        }
    }).finally(()=>{
        this.getAll();
    });
}
```

### 5 删除功能

```javascript
// 删除
handleDelete(row) {
    //1.弹出提示框
    this.$confirm("此操作永久删除当前数据，是否继续？","提示",{
        type:'info'
    }).then(()=>{
        //2.做删除业务
        axios.delete("/books/"+row.id).then((res)=>{
            if(res.data.code == 20021){
                this.$message.success("删除成功");
            }else{
                this.$message.error("删除失败");
            }
        }).finally(()=>{
            this.getAll();
        });
    }).catch(()=>{
        //3.取消删除
        this.$message.info("取消删除操作");
    });
}
```

## 六、拦截器【理解】

### 1 拦截器简介

#### 问题导入

问题1：拦截器拦截的对象是谁？

问题2：拦截器和过滤器有什么区别？

#### 1.1 拦截器概念和作用

![image-20210805175445422.png](../../youdaonote-images/WEBRESOURCEa9ac568ee2e5a578445880ff4708f5a1.png)

- 拦截器（Interceptor）是一种动态拦截方法调用的机制，在SpringMVC中动态拦截控制器方法的执行
- 作用：
  1. 在指定的方法调用前后执行预先设定的代码
  2. 阻止原始方法的执行
  3. 总结：增强
- 核心原理：AOP思想

#### 1.2 拦截器和过滤器的区别

- 归属不同：Filter属于Servlet技术，Interceptor属于SpringMVC技术
- 拦截内容不同：Filter对所有访问进行增强，Interceptor仅针对SpringMVC的访问进行增强

![image-20210805175539717.png](../../youdaonote-images/WEBRESOURCE6339570153aefd46b1092ae5715700ee.png)
### 2 入门案例

#### 问题导入

定义拦截器需要实现什么接口？

#### 2.1 拦截器代码实现

##### 【第一步】定义拦截器

> 做法：定义一个类，实现HandlerInterceptor接口即可

```java
@Component //注意当前类必须受Spring容器控制
//定义拦截器类，实现HandlerInterceptor接口
public class ProjectInterceptor implements HandlerInterceptor {
    @Override
    //原始方法调用前执行的内容
    //返回值类型可以拦截控制的执行，true放行，false终止
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle..."+contentType);
        return true;
    }

    @Override
    //原始方法调用后执行的内容
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle...");
    }

    @Override
    //原始方法调用完成后执行的内容
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion...");
    }
}
```

##### 【第二步】配置加载拦截器

```java
@Configuration
public class SpringMvcSupport extends WebMvcConfigurationSupport {
    @Autowired
    private ProjectInterceptor projectInterceptor;

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        //配置拦截器
        registry.addInterceptor(projectInterceptor)
            .addPathPatterns("/books","/books/*");
    }
}
```

使用标准接口WebMvcConfigurer简化开发（注意：侵入式较强）

```java
@Configuration
@ComponentScan({"com.itheima.controller"})
@EnableWebMvc
//实现WebMvcConfigurer接口可以简化开发，但具有一定的侵入性
public class SpringMvcConfig implements WebMvcConfigurer {
    @Autowired
    private ProjectInterceptor projectInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //配置多拦截器
        registry.addInterceptor(projectInterceptor)
            .addPathPatterns("/books","/books/*");
    }
}
```

#### 2.2 拦截器流程分析

![image-20210805180846313.png](../../youdaonote-images/WEBRESOURCE92e69ef85627f279c34bf0df824cea2e.png)

### 3 拦截器参数

#### 问题导入

postHandle()和afterCompletion()方法都是处理器方法执行之后执行，有什么区别？

#### 3.1 前置处理

```java
//原始方法调用前执行的内容
//返回值类型可以拦截控制的执行，true放行，false终止
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    System.out.println("preHandle..."+contentType);
    return true;
}
```

- 参数
  1. request:请求对象
  2. response:响应对象
  3. handler:被调用的处理器对象，本质上是一个方法对象，对反射技术中的Method对象进行了再包装

- 返回值
  返回值为false，被拦截的处理器将不执行。

#### 3.2 后置处理

```java
//原始方法调用后执行的内容
public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
    System.out.println("postHandle...");
}
```

- 参数
  modelAndView：如果处理器执行完成具有返回结果，可以读取到对应数据与页面信息，并进行跳转

> 注意：如果处理器方法出现异常了，该方法不会执行

#### 3.3 完成后处理

```java 
//原始方法调用完成后执行的内容
public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
    System.out.println("afterCompletion...");
}
```

- 参数
  ex:如果处理器执行过程中出现异常对象，可以针对异常情况进行单独处理

> 注意：无论处理器方法内部是否出现异常，该方法都会执行。

### 4 拦截器链配置

#### 问题导入

什么是拦截器链？

#### 4.1 多个拦截器配置

- 定义第二个拦截器

```java
@Component
public class ProjectInterceptor2 implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle...222");
        return false;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        System.out.println("postHandle...222");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        System.out.println("afterCompletion...222");
    }
}
```

- 配置第二个拦截器

```java
@Configuration
@ComponentScan({"com.itheima.controller"})
@EnableWebMvc
//实现WebMvcConfigurer接口可以简化开发，但具有一定的侵入性
public class SpringMvcConfig implements WebMvcConfigurer {
    @Autowired
    private ProjectInterceptor projectInterceptor;
    @Autowired
    private ProjectInterceptor2 projectInterceptor2;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //配置多拦截器
        registry.addInterceptor(projectInterceptor)
            .addPathPatterns("/books","/books/*");
        registry.addInterceptor(projectInterceptor2)
            .addPathPatterns("/books","/books/*");
    }
}
```

#### 4.2 多个连接器工作流程分析

- 当配置多个拦截器时，形成拦截器链
- 拦截器链的运行顺序参照拦截器添加顺序为准
- 当拦截器中出现对原始处理器的拦截，后面的拦截器均终止运行
- 当拦截器运行中断，仅运行配置在前面的拦截器的afterCompletion操作

![image-20210805181537718.png](../../youdaonote-images/WEBRESOURCEafb604d7ed680afeb9c83e87ded5978c.png)