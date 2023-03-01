# 自我介绍
面试官，您好。我叫韦语轩。大学期间我主要学习了Java 以及spring 、mybatis等框架。在校期间参加过两个实验室，主要是利用Springboot mybtis redis以及python的Django 技术进行后端的开发，之后做好的项目代表实验室参加比赛，获得了多次的奖。之后在大三进行了实习，在公司担任开发实习，从事前端react和后端的开发，参与了优惠券系统，拉新系统、微信登陆系统的重构与开发。参加了多个第三方库的开发。研究生期间在一边帮导师做横向项目，一边参加了蓝桥杯算法竞赛获得了研究生组国二省一的成绩。积极参加了社团学生会活动。平常喜欢看变成书籍和视频做笔记，博客已经在github上面开源。我一直都非常希望能加入贵公司，我觉得贵公司的文化和技术氛围我都非常喜欢（IBM说自己的导师是IBM出身）。期待与您共事。



# HR反问

## HR

1. 能不能谈谈你作为一个公司老员工对公司的感受?
2. 你有什么建议或者评价给我吗?
3. 接下来我会有一段空档期,有什么值得注意或者建议学习的吗?
4. 这个岗位为什么还在招人?(岗位真实性和价值咨询)
5. 大概什么时候能给我回复呢?(终面的时候,如果面试官没有说的话,可以问一下)
6. 如果通过的话,下一面会在什么时候举行,什么形式?

## 部门领导

1. 公司对新员工的培养机制是什么呢？
2. 在您看来，这个岗位在未来公司发展怎么样呢？
3. 团队现在面临的最大挑战是什么呢？

## 老板/总裁

1. 贵公司的发展目标和方向是什么?
2. 与同行业的竞争者相比,贵公司的核心竞争优势在什么地方?
3. 公司现在面临的最大挑战是什么?

# 简历问答
## 底层CPython的内建对象的底层实现
Python是由C实现的，Python万物皆对象，但实际上在C的层面来看，每一个对象都是pyobject的struct，同时pyobject内部维护着属于这个对象的类型，比如说float，就会有一个structs 是pyfloat_object,同时他会有自己的内部实现方式，比如说int就是大数，他永远不会溢出，因为底层是由一个数组组成的。Python的实现和redis很相似。

## Python虚拟机的基本机制
python的虚拟机被称之为解释器，他和java可以对比，这个解释器包含了一个编译器一个虚拟机，而java是分开的。
pyc文件就是python编译成的代码对象，对应java的.class对象。在知道了这个运行机制的前提下，

# spring
## Spring,Spring MVC,Spring Boot 之间什么关系

- Spring 包含了多个功能模块，其中最重要的是 Spring-Core（主要提供 IoC 依赖注入功能的支持） 模块， Spring 中的其他模块（比如 Spring MVC）的功能实现基本都需要依赖于该模块。
- Spring MVC 是 Spring 中的一个很重要的模块，主要赋予 Spring 快速构建 MVC 架构的 Web 程序的能力。MVC 是模型(Model)、视图(View)、控制器(Controller)的简写，其核心思想是通过将业务逻辑、数据、显示分离来组织代码。
- Spring 旨在简化 J2EE 企业应用程序开发。Spring Boot 旨在简化 Spring 开发（减少配置文件，开箱即用！）。
- Spring Boot 只是简化了配置，如果你需要构建 MVC 架构的 Web 程序，你还是需要使用 Spring MVC 作为 MVC 框架，只是说 Spring Boot 帮你简化了 Spring MVC 的很多配置

![](../youdaonote-images/Pasted%20image%2020230227232027.png)

## 简述Spring MVC

-   Model:系统涉及的数据，也就是 dao 和 bean。
-   View：展示模型中的数据，只是用来展示。
-   Controller：处理用户请求都发送给 ，返回数据给 JSP 并展示给用户。

由jsp -> jsp+servlet -> ssh -> ssm ->Spring MVC 下我们一般把后端项目分为 Service 层（处理业务）、Dao 层（数据库操作）、Entity 层（实体类）、Controller 层(控制层，返回数据给前台页面)。

## SpringMVC工作原理

![](../youdaonote-images/Pasted%20image%2020230227233032.png)

**流程说明（重要）：**

1.  客户端（浏览器）发送请求， `DispatcherServlet`拦截请求。
2.  `DispatcherServlet` 根据请求信息调用 `HandlerMapping` 。`HandlerMapping` 根据 uri 去匹配查找能处理的 `Handler`（也就是我们平常说的 `Controller` 控制器） ，并会将请求涉及到的拦截器和 `Handler` 一起封装。
3.  `DispatcherServlet` 调用 `HandlerAdapter`适配执行 `Handler` 。
4.  `Handler` 完成对用户请求的处理后，会返回一个 `ModelAndView` 对象给`DispatcherServlet`，`ModelAndView` 顾名思义，包含了数据模型以及相应的视图的信息。`Model` 是返回的数据对象，`View` 是个逻辑上的 `View`。
5.  `ViewResolver` 会根据逻辑 `View` 查找实际的 `View`。
6.  `DispaterServlet` 把返回的 `Model` 传给 `View`（视图渲染）。
7.  把 `View` 返回给请求者（浏览器）

# docker

## 什么是容器？

**一句话概括容器：容器就是将软件打包成标准化单元，以用于开发、交付和部署。**

## 什么是docker？

-  Docker 是世界领先的软件容器平台，基于 **Go 语言** 进行开发实现。
- Docker 可以**对进程进行封装隔离，属于操作系统层面的虚拟化技术。** 由于隔离的进程独立于宿主和其它的隔离的进程，因此也称其为容器。


# Python

## __slots__节约内存

如果在一个类中定义了__slots__属性，那么这个类的实例将不会拥有__dict__属性，没有__dict__的实例也就不能添加实例属性了。简单来说，__slots__的作用就是阻止类在实例化时为实例分配__dict__属性，限制该实例能添加的属性。

