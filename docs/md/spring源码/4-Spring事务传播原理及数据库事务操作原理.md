> Spring事务管理基于AOP实现，主要作用是统一封装非功能性需求。

## 事务的基本原理

在配置文件中开启注解驱动，在相关的类和方法上通过注解@Transactional标识。
Spring 在启动的时候会解析生成相关的Bean，这时候会查看拥有相关注解的类和方法，并且为这些类和方法生成代理，根据@Transactional的相关参数进行相关配置注入，这样就在代理中为我们把相关的事务处理掉了（开启正常提交事务、异常回滚事务）。

真正的数据库层的事务提交和回滚是通过binlog或者redo log实现的。

![](../youdaonote-images/Pasted%20image%2020230630201006.png)

![](../youdaonote-images/Pasted%20image%2020230630201104.png)


## 手写ORM框架

1. 支持读写分离
2. 支持分库分表
3. 支持单表操作不需要写任何SQL
4. 支持自定义SQL
5. 支持高度扩展

QueryRule, 查询条件构造器

List<?> select(QueryRule queryRule)

int delete(T entity)
int update(T entity)
int insert(T entity)

