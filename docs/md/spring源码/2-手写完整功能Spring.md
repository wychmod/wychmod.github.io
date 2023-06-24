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
4. 初始化I0C容器，并且实例化对象 -> BeanWrapper
5. 完成DI注入

### DI注入时循环依赖如何解决：
A { B b } （A 初始化的时候B还不存在，不能依赖注入）
B { A a } （B 初始化的时候A已经存在，可以依赖注入，再循环一次，把A的B给注入。）
用两个缓存，循环两次
1. 把第一次读取结果为空的BeanDefinition存到第一个缓存中
2. 等第一次循环之后，第二次循环再检查第一次的缓存，再进行赋值