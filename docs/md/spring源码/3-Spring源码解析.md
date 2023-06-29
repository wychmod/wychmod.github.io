## IoC分析
### IoC容器初始化三步曲

![](../youdaonote-images/Pasted%20image%2020230629140751.png)

### 基于XML的定位、加载和注册

![](../youdaonote-images/Pasted%20image%2020230629140846.png)



### 运行时序图

![](../youdaonote-images/一步一步手绘Spring%20IoC运行时序图.jpg)

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


## DI分析

### 依赖注入执行细节

![](../youdaonote-images/Pasted%20image%2020230629165143.png)