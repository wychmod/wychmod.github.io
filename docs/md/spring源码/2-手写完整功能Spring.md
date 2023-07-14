## 设计思路

### Spring Bean

凡是可以存放数据的具体数据结构实现，都可以称之为容器。例如：ArrayList、LinkedList、HashSet等，但在 Spring Bean 容器的场景下，我们需要一种可以用于存放和名称索引式的数据结构，所以选择 HashMap 是最合适不过的。

![](../youdaonote-images/Pasted%20image%2020230714093237.png)

![](../youdaonote-images/Pasted%20image%2020230714093825.png)


## 实现IoC和DI的功能

###  基本思路
> Ioc和DI的功能在core和beans模块。

1. ApplicationContext 简单地理解为它就是工厂类, getBean()从Ioc容器中去获取一个实例的方法
2. 在调用Servlet init()方法时，就要初始化ApplicationContext
3. 默认是单例，而且是延时加载（lazy)的，DI是在初始化以后发生的
4. Spring中发生DI由getBean()触发
	1. 调用getBean()创建对象
	2. 立即就会发生DI

![](../youdaonote-images/Pasted%20image%2020230623171938.png)

### Servlet初始化基本流程
1. 调用Servlet init()方法
	- 创建ApplicationContext
2. 读取配置文件(properties、xml、yml) -> BeanDefinitionReader(配置文件保存到了内存中)
3. 扫描相关的类，扫描到的类也变成了BeanDefinition
	- ApplicationContext.getBean()
4. 初始化IOC容器，并且实例化对象 -> BeanWrapper
5. 完成DI注入

### Spring IOC的基本流程

1. 读取配置文件。
2. 解析配置文件，并封装成BeanDefinition。
3. 把BeanDefinition对应的实例放入到容器进行缓存。

### Spring DI的基本流程
1. 循环读取BeanDefinition的缓存信息。
2. 调用getBean()方法创建对象实例。
3. 将创建好的对象实例包装为BeanWrapper对象。
4. 将BeanWrapper对象缓存到IOC容器。
5. 循环IOC容器执行以来注入。

### DI注入时循环依赖如何解决：
A { B b } （A 初始化的时候B还不存在，不能依赖注入）
B { A a } （B 初始化的时候A已经存在，可以依赖注入，再循环一次，把A的B给注入。）
用两个缓存，循环两次
1. 把第一次读取结果为空的BeanDefinition存到第一个缓存中
2. 等第一次循环之后，第二次循环再检查第一次的缓存，再进行赋值

## 实现MVC功能

### MVC九大组件

| 序号 | 组件名                      | 解释                                |
| ---- | --------------------------- | ----------------------------------- |
| 1    | MultipartResolver           | 多文件上传的组件                    |
| 2    | LocaleResolver              | 本地语言环境                        |
| 3    | ThemeResolver               | 主题模板处理器                      |
| 4    | **HandlerMapping**              | 保存Url映射关系                     |
| 5    | **HandlerAdapter**              | 动态参数适配器                      |
| 6    | HandlerExceptionResolver    | 异常拦截器                          |
| 7    | RequestToViewNameTranslator | 视图提取器，从request中获取viewName |
| 8    | **ViewResolvers**               | 视图转换器，模板引擎                |
| 9    | FlashMapManager             | 参数缓存器                          | 

### 实现三个功能
- HandlerMapping: 保存Url映射关系
- HandlerAdapter: 动态参数适配器, 并且调用对应的接口方法
- ViewResolvers : 视图转换器，模板引擎，读取视图，将返回的model里的值对页面进行渲染。

在Spring框架中，ModelAndView是一个组合对象，可以同时包含模型数据和视图信息。它的作用是将处理器方法（Controller方法）处理的数据（模型数据）和对应的视图（View）封装在一起，然后返回给DispatcherServlet，DispatcherServlet再将其传递给ViewResolver进行视图解析和渲染。

![](../youdaonote-images/Pasted%20image%2020230624230026.png)


## 实现AOP功能

底层技术用动态代理来实现:
- 增强：
	- 1. 增加一些新的代码，生成一个新的类
	- 2. 跟目标类实现一个相同的接口
	- 3. 直接继承目标类，覆盖目标类方法
- 解耦

真正调用代码逻辑的时候，直接运行生成的Proxy类的代码(JDK, CGLib)

Advice 通知
handler方法 对应多个通知

Map\<Method, List\<Advice\>\>

### 基本原理

AdvisedSupport: 去解析Aop的配置信息
AopConfig: 保存Aop基本的配置
Advice: 定义了拦截器的方法和属性，用于在目标对象的方法执行前、后或异常时执行相关操作，实现了 AOP 的横切关注点
JdkDynamicAopProxy: 该类是 AOP 框架中使用 JDK 动态代理实现代理的类，它实现了 `InvocationHandler` 接口，可以动态创建代理对象，并在代理对象的方法执行时调用拦截器的相关方法，实现了 AOP 的功能。

![](../youdaonote-images/Pasted%20image%2020230627234735.png)