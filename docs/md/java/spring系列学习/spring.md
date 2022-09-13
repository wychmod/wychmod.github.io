# 1. spring有关
[toc]
## spring 家族
**spring 现在代表一个家族**
### spring framework
**用于构建企业级应用的轻量级一站式解决方案。**
- 设计理念
    - 选择无处不在（例如数据库可以选择JDBC或者ORM）
    - 海纳百川的精神
    - 保持向后兼容性
    - 专注API设计
    - 追求严苛的代码质量

![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCE9f514c1e67ebad854889b6271fa237e5)

### spring boot
- 快速构建基于 Spring的应用程序
    - 快、很快、非常快
    - 进可开箱即用,退可按需改动
    - 提供各种非功能特性（使得可以专注于业务）
    - 不用生成代码,没有XML配置
    - Spring data、 Spring mvc、 SpringWebflux

### spring cloud
- 简化分布式系统的开发
    - 配置管理
    - 服务注册与发现
    - 熔断
    - 服务追踪

### spring 技术趋势
- 语言版本在升级
- 异步编程模式的崛起
- 一些过时技术，过时模板的淘汰

springboot 和 springcloud不断的受到关注。最佳实践固化到框架当中。

### 第一个spring程序
```java
package wychmod.spring.hello.hellospring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class HelloSpringApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloSpringApplication.class, args);
	}

	@RequestMapping("/hello")
	public String hello(){
		return "hello world";
	}
}

```
> 可以通过mvn clean package来进行打包，然后通过java -jar hello-spring-0.0.1-SNAPSHOT.jar来启动服务

## Spring Bean
### Bean的含义
**在 Spring 中，构成应用程序主干并由Spring IoC容器管理的对象称为beans。bean是一个由Spring IoC容器实例化、组装和管理的对象。**
1. Spring 容器会自动完成@bean对象的实例化。
2. bean是对象，数量不限，即可以为多个。
3. 应用程序由一个个bean构建。
- Spring帮助我们通过两种方式管理bean，一种是注册Bean，另一种是装配Bean。完成管理动作的方式有如下三种：
    1. 使用自动配置。@Component注解及其衍生注解@RestController、@Controller、@Service和@Repository等都是组件注册注解。使用组件注册注解告诉Spring，我是一个bean，你要来管理我，然后使用@AutoWired注解去装配Bean；也可以使用由javax.annotation.Resource提供@Resource去装配Bean。所谓装配，就是管理各个对象之间的协作关系。
    2. 使用JavaConfig。使用@Configuration告诉Spring，IoC容器要怎么配置，即怎么去注册bean，怎么去处理bean之间的关系（装配）。
    3. 使用XML配置。标签就是告诉spring怎么获取这个bean，各种就是手动的配置bean之间的关系。

## IOC是怎么来的
- 1.1 多数据源情况下，不同的数据源需要不同的Dao层，如果硬编码的话，需要不断修改项目代码，且随着场景的不断增加，重复代码越来越多，不利于项目的维护
- 1.2 使用工厂模式，将对象的具体创建过程进行封装，对外暴露一个获取对象的接口，调用者通过工厂获取对象，从而实现创建对象与业务逻辑之间的解耦
- 1.3 为了解决工厂中获取对象时的硬编码和实现多数据源情况下不同对象的创建，引入配置文件，通过解析配置文件来实现定制化创建对应的对象
- 1.4 通常情况下只需要创建一个对象即可，为了避免多次重复创建不同的对象，引入缓存机制
- 2.1 没有IOC之前，程序员需要手动硬编码一个对象，使得业务逻辑强依赖于对象的创建；而有了IOC之后，通过引入工厂模式，使得创建对象与业务逻辑的解耦，对象的创建不再是硬编码，而是弱依赖于工厂。这种对对象控制权的转换就称之为控制反转（IOC）。IOC的实现方式之一就是通过配置化来实现依赖的查找和加载，即依赖查找（DL）。


## SpringFramework概述
### spring概述
- 任何类型的部署平台：无论是操作系统，还是 Web 容器（ Tomcat 等）都是可以部署基于 SpringFramework 的应用
- 企业应用程序：包含 JavaSE 和 JavaEE 在内，它被称为一站式解决方案
- 编程和配置模型：基于框架编程，以及基于框架进行功能和组件的配置
- 基础架构支持：SpringFramework 不含任何业务功能，它只是一个底层的应用抽象支撑
- 脚手架：使用它可以更快速的构建应用
- IOC & AOP：SpringFramework 的两大核心特性：Inverse of Control 控制反转、Aspect Oriented Programming 面向切面编程
- 第三方整合：SpringFramework 可以很方便的整合进其他的第三方技术（如持久层框架 MyBatis / Hibernate ，表现层框架 Struts2 ，权限校验框架 Shiro 等）
- 容器：SpringFramework 的底层有一个管理对象和组件的容器，由它来支撑基于 SpringFramework 构建的应用的运行

### 为什么使用SpringFramework
- IOC：组件之间的解耦（咱上一章已经体会到了）
- AOP：切面编程可以将应用业务做统一或特定的功能增强，能实现应用业务与增强逻辑的解耦
- 容器与事件：管理应用中使用的组件Bean、托管Bean的生命周期、事件与监听器的驱动机制
- Web、事务控制、测试、与其他技术的整合

### SpringFramework包含的模块【熟悉，面试题】
- beans、core、context、expression 【核心包】
- aop 【切面编程】
- jdbc 【整合 jdbc 】
- orm 【整合 ORM 框架】
- tx 【事务控制】
- web 【 Web 层技术】
- test 【整合测试】

## IOC基础-依赖查找和依赖注入
### IOC-DL依赖查找
**byName,byType**
#### byName
```java
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.2.8.RELEASE</version>
</dependency>

quickstart-byname.xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="person" class="com.linkedbear.basic_dl.a_quickstart_byname.bean.Person"></bean>
</beans>

public class QuickstartByNameApplication {
    public static void main(String[] args) throws Exception {
        BeanFactory factory = new ClassPathXmlApplicationContext("basic_dl/quickstart-byname.xml");
        Person person= (Person)factory.getBean("person");
        System.out.println(person);
    }
}
```
读取配置文件，需要一个载体来加载它，这里咱选用 ClassPathXmlApplicationContext 来加载。加载完成后咱直接使用 BeanFactory 接口来接收（多态思想）。下一步就可以从 BeanFactory 中获取 person 了，由于咱在配置文件中声明了 id ，故这里就可以直接把 id 传入，BeanFactory 就可以给我们返回 Person 对象。
#### 根据类型查找-byType
```java
<bean class="com.linkedbear.spring.basic_dl.b_bytype.bean.Person"></bean>

public static void main(String[] args) throws Exception {
    BeanFactory factory = new ClassPathXmlApplicationContext("basic_dl/quickstart-bytype.xml");
    Person person = factory.getBean(Person.class);
    System.out.println(person);

    DemoDao demoDao = factory.getBean(DemoDao.class);
    System.out.println(demoDao.findAll());
}
```

#### 批量依赖查找ofType
**实现了传入一个接口 / 抽象类，返回容器中所有的实现类 / 子类**。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="demoMySQLDao" class="com.linkedbear.spring.basic_dl.c_oftype.dao.impl.DemoMySQLDao"/>
    <bean id="demoOracleDao" class="com.linkedbear.spring.basic_dl.c_oftype.dao.impl.DemoOracleDao"/>
    <bean id="demoPostgreDao" class="com.linkedbear.spring.basic_dl.c_oftype.dao.impl.DemoPostgresDao"/>
</beans>
```
![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCE83ed6008007d0ace08fa520bbf8da469)
```java
public class OfTypeApplication {
    
    public static void main(String[] args) throws Exception {
        // 将 BeanFactory 接口换为 ApplicationContext
        ApplicationContext ctx = new ClassPathXmlApplicationContext("basic_dl/quickstart-oftype.xml");
        Map<String, DemoDao> beans = ctx.getBeansOfType(DemoDao.class);
        beans.forEach((beanName, bean) -> {
            System.out.println(beanName + " : " + bean.toString());
        });
    }
}
```
#### 依赖查找withAnnotation
**IOC 容器除了可以根据一个父类 / 接口来找实现类，还可以根据类上标注的注解来查找对应的 Bean**。

![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCE36102583c00aef966043a48db735c320)
```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Color {

}

public class WithAnnoApplication {
    
    public static void main(String[] args) throws Exception {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("basic_dl/quickstart-withanno.xml");
        Map<String, Object> beans = ctx.getBeansWithAnnotation(Color.class);
        beans.forEach((beanName, bean) -> {
            System.out.println(beanName + " : " + bean.toString());
        });
    }
}
```
#### 获取IOC容器中的所有Bean
**getBeanDefinitionNames**获取的就是所有 Bean 的 id
```java
public class BeannamesApplication {
    public static void main(String[] args) {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("basic_dl/quickstart-withanno.xml");
        String[] beanNames = ctx.getBeanDefinitionNames();
        // 利用jdk8的Stream快速编写打印方法
        Stream.of(beanNames).forEach(System.out::println);
    }
}
```

#### 依赖查找的高级使用——延迟查找
在 xml 中咱只注册 Cat ，这样 IOC 容器中就只有 Cat ，没有 Dog 。
```java
// 手动实现
public class ImmediatlyLookupApplication {
    
    public static void main(String[] args) throws Exception {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("basic_dl/quickstart-lazylookup.xml");
        Cat cat = ctx.getBean(Cat.class);
        System.out.println(cat);
        
        Dog dog;
        try {
            dog = ctx.getBean(Dog.class);
        } catch (NoSuchBeanDefinitionException e) {
            // 找不到Dog时手动创建
        	dog = new Dog();
        }
        System.out.println(dog);
    }

}

// 改良 获取之前检查 只能传bean id
Dog dog = ctx.containsBean("dog") ? (Dog) ctx.getBean("dog") : new Dog();

// 改良-延迟查找 
// 如果使用这种方式，运行 main 方法后发现并没有报错，只有调用 dogProvider 的 getObject，会报错
ObjectProvider<Dog> dogProvider = ctx.getBeanProvider(Dog.class);

// getIfAvailable ，它可以在找不到 Bean 时返回 null 而不抛出异常
Dog dog = dogProvider.getIfAvailable();
if (dog == null) {
    dog = new Dog();
}

// ObjectProvider在jdk8的升级
Dog dog = dogProvider.getIfAvailable(() -> new Dog());
Dog dog = dogProvider.getIfAvailable(Dog::new);
dogProvider.ifAvailable(dog -> System.out.println(dog)); // 或者使用方法引用
```

#### BeanFactory与ApplicationContext
**官方文档**
> org.springframework.beans 和 org.springframework.context 包是 SpringFramework 的 IOC 容器的基础。BeanFactory 接口提供了一种高级配置机制，能够管理任何类型的对象。ApplicationContext 是 BeanFactory 的子接口。它增加了：
> - 与 SpringFramework 的 AOP 功能轻松集成
> - 消息资源处理（用于国际化）
> - 事件发布
> - 应用层特定的上下文，例如 Web 应用程序中使用的 WebApplicationContext
>
> 你应该使用 ApplicationContext ，除非能有充分的理由解释不需要的原因。一般情况下，我们推荐将 GenericApplicationContext 及其子类 AnnotationConfigApplicationContext 作为自定义引导的常见实现。这些实现类是用于所有常见目的的 SpringFramework 核心容器的主要入口点：加载配置文件，触发类路径扫描，编程式注册 Bean 定义和带注解的类，以及（从5.0版本开始）注册功能性 Bean 的定义。

BeanFactory 接口提供了一个**抽象的配置和对象的管理机制**，ApplicationContext 是 BeanFactory 的子接口，它简化了与 AOP 的整合、消息机制、事件机制，以及对 Web 环境的扩展（ WebApplicationContext 等），BeanFactory 是没有这些扩展的。

==ApplicationContext主要扩展了以下内容==：
- AOP 的支持（ AnnotationAwareAspectJAutoProxyCreator 作用于 Bean 的初始化之后 ）
- 配置元信息（ BeanDefinition 、Environment 、注解等 ）
- 资源管理（ Resource 抽象 ）
- 事件驱动机制（ ApplicationEvent 、ApplicationListener ）
- 消息与国际化（ LocaleResolver ）
- Environment 抽象（ SpringFramework 3.1 以后）

### 依赖注入

```xml
<bean id="person" class="com.linkedbear.spring.basic_di.a_quickstart_set.bean.Person">
    <property name="name" value="test-person-byset"/>
    <property name="age" value="18"/>
</bean>

<bean id="cat" class="com.linkedbear.spring.basic_di.a_quickstart_set.bean.Cat">
    <property name="name" value="test-cat"/>
    <!-- ref引用上面的person对象 -->
    <property name="master" ref="person"/>
</bean>
```
```java
public class QuickstartInjectBySetXmlApplication {
    public static void main(String[] args) throws Exception {
        BeanFactory beanFactory = new ClassPathXmlApplicationContext("basic_di/inject-set.xml");
        Person person = beanFactory.getBean(Person.class);
        System.out.println(person);
        
        Cat cat = beanFactory.getBean(Cat.class);
        System.out.println(cat);
    }
}
```
### 两种 IOC 的实现方式-依赖查找与依赖注入
**IOC 的两种实现方式是依赖注入 DI 和依赖查找 DL**。
依赖查找获取了类的实例，如果这个类不需要使用内部的属性的话，到这一步已经可以了。
依赖注入是为了给类的实例对象的字段赋值，因为描述一个实体除了方法还有字段。DI和DL都是IoC在创建和管理实例的一个过程的两个方面。
**依赖注入和依赖查找本质都是通过反射来实现的**
- 作用目标不同
    - 依赖注入的作用目标通常是类成员
    - 依赖查找的作用目标可以是方法体内，也可以是方法体外
- 实现方式不同
    - 依赖注入通常借助一个上下文被动的接收
    - 依赖查找通常主动使用上下文搜索

## IOC基础-注解驱动IOC与组件扫描
### 1. 注解驱动IOC的依赖查找
```java
public class AnnotationConfigApplicationContext {
    public static void main(String[] args) {
        ApplicationContext ctx = new org.springframework.context.annotation.AnnotationConfigApplicationContext(QuickstartConfiguration.class);
        Person person = ctx.getBean(Person.class);
        System.out.println(person);
    }

}

// 一个配置类就可以类似的理解为一个 xml 。
@Configuration
public class QuickstartConfiguration {

    @Bean(name = "aaa")
    public Person person() {
        return new Person();
    }
}
```
### 2. 注解驱动IOC的依赖注入
```java
@Bean
public Person person() {
    Person person = new Person();
    person.setName("person");
    person.setAge(123);
    return person;
}

@Bean
public Cat cat() {
    Cat cat = new Cat();
    cat.setName("test-cat-anno");
    // 直接拿上面的person()方法作为返回值即可，相当于ref
    cat.setMaster(person());
    return cat;
}
```

### 组件注册与组件扫描
上面声明的方式，如果需要注册的组件特别多，那编写这些 @Bean 无疑是超多工作量，于是 SpringFramework 中给咱整了几个注解出来，可以帮咱快速注册需要的组件，这些注解被成为**模式注解 ( stereotype annotation )**。

#### 一切组件注册的根源：@Component
**在类上标注 @Component 注解，即代表该类会被注册到 IOC 容器中作为一个 Bean 。**
```java
@Component
public class Person {
    
}
// 相当于
<bean class="com.linkedbear.spring.basic_dl.a_quickstart_byname.bean.Person"/>

// 如果想指定 Bean 的名称，可以直接在 @Component 中声明 value 属性即可：
@Component("aaa")
public class Person { }

// 如果不指定 Bean 的名称，它的默认规则是 “类名的首字母小写”
```
#### 组件扫描@ComponentScan
只声明了组件，咱在写配置类时如果还是只写 @Configuration 注解，随后启动 IOC 容器，那它是感知不到有 @Component 存在的，一定会报 NoSuchBeanDefinitionException 。
```java
// 如果不指定扫描路径，则默认扫描本类所在包及子包下的所有 @Component 组件。
@Configuration
@ComponentScan("com.linkedbear.spring.annotation.c_scan.bean")
public class ComponentScanConfiguration {
    
}

// 不写 @ComponentScan ，也是可以做到组件扫描的
ApplicationContext ctx = new AnnotationConfigApplicationContext("com.linkedbear.spring.annotation.c_scan.bean");

// xml中启用组件扫描
<context:component-scan base-package="com.linkedbear.spring.annotation.c_scan.bean"/>
<!-- 注意标签是package，不是packages，代表一个标签只能声明一个根包 -->
```
#### 组件注册的@Controller 、@Service 、@Repository
SpringFramework 为了迎合咱在进行 Web 开发时的三层架构，它额外提供了三个注解：@Controller 、@Service 、@Repository ，分别代表表现层、业务层、持久层。这三个注解的作用与 @Component 完全一致，其实它们的底层也就是 @Component

### 注解驱动与xml驱动互通
#### xml引入注解
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd 
        http://www.springframework.org/schema/context 
        https://www.springframework.org/schema/context/spring-context.xsd">

    <!-- 开启注解配置 -->
    <context:annotation-config />
    <bean class="com.linkedbear.spring.annotation.d_importxml.config.AnnotationConfigConfiguration"/>
</beans>
```
#### 注解引入xml
```java
@Configuration
@ImportResource("classpath:annotation/beans.xml")
public class ImportXmlAnnotationConfiguration {
    
}
```

## JDBC相关内容
### 配置单数据源
#### Spring Boot 的配置演示
![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCE802a43b819598f20a4bc428a1a8bced5)
- 引⼊对应数据库驱动——H2（不用手动）
- 引⼊ JDBC 依赖——spring-boot-starter-jdbc（不用手动）
- 获取 DataSource Bean，打印信息
- 也可通过 /acturator/beans 查看 Bean
![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCEcb9adea358ab859f0881190afe99b2f7)
![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCEefebeee88e9da187866bc7c2133a6112)

#### 手动配置所需的Bean
- 数据源相关
    - DataSource（根据选择的连接池实现决定）
- 事务相关（可选）
    - PlatformTransactionManager（DataSourceTransactionManager） - TransactionTemplate
- 操作相关（可选）
    - JdbcTemplate

![image.png](https://note.youdao.com/yws/res/8/WEBRESOURCE4e02d088fe887d509b7be7fffe777aa8)

#### 手动到自动的过程中Spring Boot 做了哪些配置
- DataSourceAutoConfiguration 
    - 配置 DataSource
- DataSourceTransactionManagerAutoConfiguration 
    - 配置 DataSourceTransactionManager
- JdbcTemplateAutoConfiguration 
    - 配置 JdbcTemplate

> 如果没有手动配置时才会进⾏配置
**在自动装配的过程中需要将相关属性写在配置文件中**
```
management.endpoints.web.exposure.include=*
spring.output.ansi.enabled=ALWAYS

spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.hikari.maximumPoolSize=5
spring.datasource.hikari.minimumIdle=5
spring.datasource.hikari.idleTimeout=600000
spring.datasource.hikari.connectionTimeout=30000
spring.datasource.hikari.maxLifetime=1800000
```

### 配置多数据源
- 不同数据源的配置要分开
- 关注每次使⽤的数据源
    - 有多个DataSource时系统如何判断
    - 对应的设施（事务、ORM等）如何选择DataSource

#### Spring Boot中的多数据源配置
1. **⼿⼯配置两组 DataSource 及相关内容**
2. 与Spring Boot协同⼯作（⼆选⼀）
    1. 配置@Primary类型的Bean
    2. 排除Spring Boot的⾃动配置

> 下面为排除自动配置的做法
```java
// 配置文件
foo.datasource.url=jdbc:h2:mem:foo
foo.datasource.username=sa
foo.datasource.password=

bar.datasource.url=jdbc:h2:mem:bar
bar.datasource.username=sa
bar.datasource.password=

// 手动配置
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class,
        DataSourceTransactionManagerAutoConfiguration.class,
        JdbcTemplateAutoConfiguration.class})
@Slf4j
public class MultiDataSourceDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultiDataSourceDemoApplication.class, args);
    }

    @Bean
    @ConfigurationProperties("foo.datasource")
    public DataSourceProperties fooDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource fooDataSource() {
        DataSourceProperties dataSourceProperties = fooDataSourceProperties();
        log.info("foo datasource: {}", dataSourceProperties.getUrl());
        return dataSourceProperties.initializeDataSourceBuilder().build();
    }

    @Bean
    @Resource
    public PlatformTransactionManager fooTxManager(DataSource fooDataSource) {
        return new DataSourceTransactionManager(fooDataSource);
    }

    @Bean
    @ConfigurationProperties("bar.datasource")
    public DataSourceProperties barDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource barDataSource() {
        DataSourceProperties dataSourceProperties = barDataSourceProperties();
        log.info("bar datasource: {}", dataSourceProperties.getUrl());
        return dataSourceProperties.initializeDataSourceBuilder().build();
    }

    @Bean
    @Resource
    public PlatformTransactionManager barTxManager(DataSource barDataSource) {
        return new DataSourceTransactionManager(barDataSource);
    }
}
```

### 好⽤的连接池- HikariCP
![image.png](https://note.youdao.com/yws/res/6/WEBRESOURCE76857bb85b301d6af9e9a317c35dc326)
#### 为什么快
1. 字节码级别优化（很多⽅法通过 JavaAssist ⽣成）
2. ⼤量⼩改进
    • ⽤ FastStatementList 代替 ArrayList
    • ⽆锁集合 ConcurrentBag
    • 代理类的优化（⽐如，⽤ invokestatic 代替了 invokevirtual）
    
#### 如何进行配置
**Spring Boot 2.x**
• 默认使⽤ HikariCP
• 配置 spring.datasource.hikari.* 配置
```java
spring.datasource.hikari.maximumPoolSize=5
spring.datasource.hikari.minimumIdle=5
spring.datasource.hikari.idleTimeout=600000
spring.datasource.hikari.connectionTimeout=30000
spring.datasource.hikari.maxLifetime=1800000
```
**Spring Boot 1.x**
• 默认使⽤ Tomcat 连接池，需要移除 tomcat-jdbc 依赖
• spring.datasource.type=com.zaxxer.hikari.HikariDataSource

### 好⽤的连接池- Alibaba Druid
**“Druid连接池是阿⾥巴巴开源的数据库连接池项⽬。Druid连接池为监控⽽⽣，内置强⼤的监控功能，监控特性不影响性能。功能强⼤，防SQL注⼊，内置Logging能诊断Hack应⽤⾏为。”**
- 经过阿⾥巴巴各⼤系统的考验，值得信赖
- 实⽤的功能
    • 详细的监控（真的是全⾯）
    • ExceptionSorter，针对主流数据库的返回码都有⽀持
    • SQL 防注⼊
    • 内置加密配置
    • 众多扩展点，⽅便进⾏定制

#### 数据源配置
```java
spring.output.ansi.enabled=ALWAYS

spring.datasource.url=jdbc:h2:mem:foo
spring.datasource.username=sa
spring.datasource.password=n/z7PyA5cvcXvs8px8FVmBVpaRyNsvJb3X7YfS38DJrIg25EbZaZGvH4aHcnc97Om0islpCAPc3MqsGvsrxVJw==

spring.datasource.druid.initial-size=5
spring.datasource.druid.max-active=5
spring.datasource.druid.min-idle=5
spring.datasource.druid.filters=conn,config,stat,slf4j

spring.datasource.druid.connection-properties=config.decrypt=true;config.decrypt.key=${public-key}
spring.datasource.druid.filter.config.enabled=true

spring.datasource.druid.test-on-borrow=true
spring.datasource.druid.test-on-return=true
spring.datasource.druid.test-while-idle=true

<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-jdbc</artifactId>
	<exclusions>
		<exclusion>
			<artifactId>HikariCP</artifactId>
			<groupId>com.zaxxer</groupId>
		</exclusion>
	</exclusions>
</dependency>
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>druid-spring-boot-starter</artifactId>
	<version>1.1.10</version>
</dependency>
package geektime.spring.data.druiddemo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@SpringBootApplication
@Slf4j
public class DruidDemoApplication implements CommandLineRunner {
	@Autowired
	private DataSource dataSource;
	@Autowired
	private JdbcTemplate jdbcTemplate;

	public static void main(String[] args) {
		SpringApplication.run(DruidDemoApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		log.info(dataSource.toString());
	}
}


```
- Filter 配置
    • spring.datasource.druid.filters=stat,config,wall,log4j （全部使⽤默认值）
- 密码加密
    • spring.datasource.password=<加密密码> 
    • spring.datasource.druid.filter.config.enabled=true
    • spring.datasource.druid.connection-properties=config.decrypt=true;config.decrypt.key=<public-key>
- SQL 防注⼊
    • spring.datasource.druid.filter.wall.enabled=true
    • spring.datasource.druid.filter.wall.db-type=h2
    • spring.datasource.druid.filter.wall.config.delete-allow=false
    • spring.datasource.druid.filter.wall.config.drop-table-allow=false

#### Druid Filter
• ⽤于定制连接池操作的各种环节
• 可以继承 FilterEventAdapter 以便⽅便地实现 Filter
• 修改 META-INF/druid-filter.properties 增加 Filter 配置
```java
@Slf4j
public class ConnectionLogFilter extends FilterEventAdapter {

    @Override
    public void connection_connectBefore(FilterChain chain, Properties info) {
        log.info("BEFORE CONNECTION!");
    }

    @Override
    public void connection_connectAfter(ConnectionProxy connection) {
        log.info("AFTER CONNECTION!");
    }
}

```
![image.png](https://note.youdao.com/yws/res/6/WEBRESOURCE883b7c2cbebd90c67251a1172cbaa8c6)
![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCE0891bbd04a4b27e142e221b072cbc0b2)
