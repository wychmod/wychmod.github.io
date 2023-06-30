### Spring核心容器类图

#### 1.BeanFactory
Spring中Bean的创建是典型的工厂模式，这一系列的Bean工厂，即IoC容器，为开发者管理对象之间的依赖关系提供了很多便利和基础服务，在Spring中有许多IoC容器的实现供用户选择，其相互关系如下图所示。

![](../youdaonote-images/Pasted%20image%2020230629162050.png)

其中，BeanFactory作为最顶层的一个接口类，定义了IoC容器的基本功能规范，BeanFactory有三个重要的子类：ListableBeanFactory、HierarchicalBeanFactory和AutowireCapableBeanFactory。但是从类图中我们可以发现最终的默认实现类是DefaultListableBeanFactory，它实现了所有的接口。那么为何要定义这么多层次的接口呢？查阅这些接口的源码和说明发现，每个接口都有它的使用场合，主要是为了区分在Spring内部操作过程中对象的传递和转化，对对象的数据访问所做的限制。例如，ListableBeanFactory接口表示这些Bean可列表化，而HierarchicalBeanFactory表示这些Bean 是有继承关系的，也就是每个 Bean 可能有父 Bean。AutowireCapableBeanFactory 接口定义Bean的自动装配规则。这三个接口共同定义了Bean的集合、Bean之间的关系及Bean行为。

在BeanFactory里只对IoC容器的基本行为做了定义，根本不关心你的Bean是如何定义及怎样加载的。Spring提供了许多IoC容器实现，比如GenericApplicationContext、ClasspathXmlApplicationContext等。
ApplicationContext是Spring提供的一个高级的IoC容器，它除了能够提供IoC容器的基本功能，还为用户提供了以下附加服务。
（1）支持信息源，可以实现国际化（实现MessageSource接口）。
（2）访问资源（实现ResourcePatternResolver接口，后面章节会讲到）。
（3）支持应用事件（实现ApplicationEventPublisher接口）。

#### 2.BeanDefinition
Spring IoC容器管理我们定义的各种Bean对象及其相互关系，Bean对象在Spring实现中是以BeanDefinition来描述的，其继承体系如下图所示。

![](../youdaonote-images/Pasted%20image%2020230629162446.png)

#### 3.BeanDefinitionReader
Bean的解析过程非常复杂，功能被分得很细，因为这里需要被扩展的地方很多，必须保证足够的灵活性，以应对可能的变化。Bean的解析主要就是对Spring配置文件的解析。这个解析过程主要通过BeanDefinitionReader来完成，看看Spring中BeanDefinitionReader的类结构图，如下图所示。

![](../youdaonote-images/Pasted%20image%2020230629162527.png)


## IoC分析

### IoC容器初始化三步曲

![](../youdaonote-images/Pasted%20image%2020230629140751.png)

### 基于XML的定位、加载和注册

IoC容器的初始化包括BeanDefinition的Resource定位、加载和注册三个基本的过程。

![](../youdaonote-images/Pasted%20image%2020230629140846.png)

Application继承图：

![](../youdaonote-images/Pasted%20image%2020230630112350.png)

Spring IoC容器对Bean配置资源的载入是从refresh（）方法开始的。refresh（）方法是一个模板方法，规定了 IoC 容器的启动流程，有些逻辑要交给其子类实现。

refresh（）方法的主要作用是：在创建IoC容器前，如果已经有容器存在，需要把已有的容器销毁和关闭，以保证在refresh（）方法之后使用的是新创建的IoC容器。它类似于对IoC容器的重启，在新创建的容器中对容器进行初始化，对Bean配置资源进行载入。



### 基于XML的IoC运行时序图

![](../youdaonote-images/一步一步手绘Spring%20IoC运行时序图.jpg)

## DI分析

### 依赖注入执行细节

![](../youdaonote-images/Pasted%20image%2020230629165143.png)



### 运行时序图

createBeanInstance() --> 用反射创建了个对象实例-->封装成BeanWrapper

populateBean() -->根据beanName、BeanDefiniton、BeanWrpper找到需要赋值的属性
把需要赋值的属性封装成了一个集合PropertyValues,集合的元素Propertyvalue,Propertyvalue需要赋值的bean,赋值需要调用的方法，要赋什么值。

applyPropertyvalues() --> 循环PropertyValye,挨个调用BeanWrapper的setvalue()方法，用反射调用setter方法完成赋值

![](../youdaonote-images/一步一步手绘Spring%20DI运行时序图.png)


## AOP分析


### 主要流程

![](../youdaonote-images/Pasted%20image%2020230629201523.png)


### 核心功能

AOP就两个最核心的类MethodInterceptor、MethodInvocation
其他的都是起辅助作用

MethodInterceptor有一个方法叫做invoke()
MethodInvocation有一个方法叫做proceed()
proceed()串联起了整个Interceptor调用链

![](../youdaonote-images/Pasted%20image%2020230629225029.png)

### 运行时序图
![](../youdaonote-images/时序图.jpg)


## MVC分析

### SpringMVC请求处理流程

![](../youdaonote-images/Pasted%20image%2020230629225510.png)

### 运行时序图

![](../youdaonote-images/一步一步手绘Spring%20MVC%20运行时序图.png)