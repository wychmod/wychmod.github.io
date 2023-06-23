## 实现IoC和DI的功能
### 基本流程
1. 调用Servlet init()方法
2. 读取配置文件
3. 扫描相关的类
4. 初始化I0C容器，并且实例化对象
5. 完成DI注入

###  基本思路
> Ioc和DI的功能在core和beans模块。

1. ApplicationContext 简单地理解为它就是工厂类
getBean()从Ioc容器中去获取一个实例的方法
在调用Servlet init()方法时，就要初始化ApplicationContext
默认是单例，而且是延时加载（工azy)的
DI是在初始化以后发生的
Spring中发生DI由getBean()触发
1、调用getBean()创建对象
2、立即就会发生DI