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

![](../youdaonote-images/Pasted%20image%2020230714224231.png)

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

![](../youdaonote-images/Pasted%20image%2020230720142005.png)

按照 Spring 框架的设计，用于解决循环依赖需要用到三个缓存，这三个缓存分别存放了`成品对象`、`半成品对象(未填充属性值)`、`代理对象`，分阶段存放对象内容，来解决循环依赖问题。

三级缓存最主要，要解决的循环依赖就是对 AOP 的处理，但如果把 AOP 代理对象的创建提前，那么二级缓存也一样可以解决。但是，这就违背了 Spring 创建对象的原则，Spring 更喜欢把所有的普通 Bean 都初始化完成，在处理代理对象的初始化。

**一级缓存解决循环依赖**

![](../youdaonote-images/Pasted%20image%2020230720142317.png)

- 如果仅以一级缓存解决循环依赖，那么在实现上可以通过在A对象 newInstance 创建且未填充属性后，直接放入缓存中。
- 在`A对象`的属性填充`B对象`时，如果缓存中不能获取到`B对象`，则开始创建`B对象`，同样创建完成后，把`B对象`填充到缓存中去。
- 接下来就开始对`B对象`的属性进行填充，恰好这会可以从缓存中拿到`半成品的A对象`，那么这个时候`B对象`的属性就填充完了。
- 最后返回来继续完成`A对象`的属性填充，把实例化后并填充了属性的`B对象`赋值给A对象的`b属性`，这样就完成了一个循环依赖操作。

```java
private final static Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

private static <T> T getBean(Class<T> beanClass) throws Exception {
    String beanName = beanClass.getSimpleName().toLowerCase();
    if (singletonObjects.containsKey(beanName)) {
        return (T) singletonObjects.get(beanName);
    }
    // 实例化对象入缓存
    Object obj = beanClass.newInstance();
    singletonObjects.put(beanName, obj);
    // 属性填充补全对象
    Field[] fields = obj.getClass().getDeclaredFields();
    for (Field field : fields) {
        field.setAccessible(true);
        Class<?> fieldClass = field.getType();
        String fieldBeanName = fieldClass.getSimpleName().toLowerCase();
        field.set(obj, singletonObjects.containsKey(fieldBeanName) ? singletonObjects.get(fieldBeanName) : getBean(fieldClass));
        field.setAccessible(false);
    }
    return (T) obj;
}
```

> 使用一级缓存存放对象的方式，就是这样简单的实现过程，只要是创建完对象，立马塞到缓存里去。这样就可以在其他对象创建时候获取到属性需要填充的对象了。

![](../youdaonote-images/Pasted%20image%2020230720142903.png)

- 关于循环依赖在我们目前的 Spring 框架中扩展起来也并不会太复杂，主要就是对于创建对象的`提前暴露`，如果是工厂对象则会使用 getEarlyBeanReference 逻辑提前将工厂🏭对象存放到三级缓存中。等到后续获取对象的时候实际拿到的是工厂对象中 getObject，这个才是最终的实际对象。
- 在创建对象的 `AbstractAutowireCapableBeanFactory#doCreateBean` 方法中，提前暴露对象以后，就可以通过接下来的流程，getSingleton 从三个缓存中以此寻找对象，一级、二级如果有则直接取走，如果对象是三级缓存中则会从三级缓存中获取后并删掉工厂对象，把实际对象放到二级缓存中。
- 最后是关于单例的对象的注册操作，这个注册操作就是把真实的实际对象放到一级缓存中，因为此时它已经是一个成品对象了。
- 循环依赖的核心功能实现主要包括 DefaultSingletonBeanRegistry 提供三级缓存：`singletonObjects`、`earlySingletonObjects`、`singletonFactories`，分别存放成品对象、半成品对象和工厂对象。同时包装三个缓存提供方法：getSingleton、registerSingleton、addSingletonFactory，这样使用方就可以分别在不同时间段存放和获取对应的对象了。
```java
public class DefaultSingletonBeanRegistry implements SingletonBeanRegistry {

    // 一级缓存，普通对象
    private Map<String, Object> singletonObjects = new ConcurrentHashMap<>();

    // 二级缓存，提前暴漏对象，没有完全实例化的对象
    protected final Map<String, Object> earlySingletonObjects = new HashMap<String, Object>();

    // 三级缓存，存放代理对象
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<String, ObjectFactory<?>>();

    private final Map<String, DisposableBean> disposableBeans = new LinkedHashMap<>();

    @Override
    public Object getSingleton(String beanName) {
        Object singletonObject = singletonObjects.get(beanName);
        if (null == singletonObject) {
            singletonObject = earlySingletonObjects.get(beanName);
            // 判断二级缓存中是否有对象，这个对象就是代理对象，因为只有代理对象才会放到三级缓存中
            if (null == singletonObject) {
                ObjectFactory<?> singletonFactory = singletonFactories.get(beanName);
                if (singletonFactory != null) {
                    singletonObject = singletonFactory.getObject();
                    // 把三级缓存中的代理对象中的真实对象获取出来，放入二级缓存中
                    earlySingletonObjects.put(beanName, singletonObject);
                    singletonFactories.remove(beanName);
                }
            }
        }
        return singletonObject;
    }

    public void registerSingleton(String beanName, Object singletonObject) {
        singletonObjects.put(beanName, singletonObject);
        earlySingletonObjects.remove(beanName);
        singletonFactories.remove(beanName);
    }

    protected void addSingletonFactory(String beanName, ObjectFactory<?> singletonFactory){
        if (!this.singletonObjects.containsKey(beanName)) {
            this.singletonFactories.put(beanName, singletonFactory);
            this.earlySingletonObjects.remove(beanName);
        }
    }

    public void registerDisposableBean(String beanName, DisposableBean bean) {
        disposableBeans.put(beanName, bean);
    }

}
```

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