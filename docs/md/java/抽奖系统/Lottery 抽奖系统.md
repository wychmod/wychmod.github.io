# 项目信息

## 涉及技术和系统架构
-   技术：JDK 1.8、SpringBoot、Mybatis、Dubbo、MQ、Redis、Mysql、ELK、分库分表、Otter、vue、微信公众号、Docker
-   架构：DDD 领域驱动设计、充血模型、设计模式
-   规范：分支提交规范、代码编写规范

![](../../youdaonote-images/Pasted%20image%2020221021222633.png)

## 分布式设计
1.  Lottery：分布式部署的抽奖服务系统，提供抽奖业务领域功能，以分布式部署的方式提供 RPC 服务。
2.  Lottery-API：网关API服务，提供；H5 页面抽奖、公众号开发回复消息抽奖。
3.  Lottery-Front：C端用户系统，vue H5 lucky-canvas 大转盘抽奖界面，讲解 vue 工程创建、引入模块、开发接口、跨域访问和功能实现
4.  Lottery-ERP：B端运营系统，满足运营人员对于活动的查询、配置、修改、审核等操作。
5.  DB-Router：分库分表路由组件，开发一个基于 HashMap 核心设计原理，使用哈希散列+扰动函数的方式，把数据散列到多个库表中的组件，并验证使用。
6.  Lottery-Test：测试验证系统，用于测试验证RPC服务、系统功能调用的测试系统。