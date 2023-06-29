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