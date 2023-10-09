## MQ如果要存储海量消息应该怎么做?

发送消息到MQ的系统会把消息分散发送给多台不同的机器，假设一共有1万条消息，分散发送给10台机器，可能每台机器就是接收到1000条消息，如下图：

![](../youdaonote-images/Pasted%20image%2020231009132909.png)

每台机器上部署的RocketMQ进程一般称之为Broker，每个Broker都会收到不同的消息，然后就会把这批消息存储在自己本地的磁盘文件里。



## 高可用保障：万一Broker宕机了怎么办？

RocketMQ的解决思路是**Broker主从架构以及多副本策略**。

Master Broker收到消息之后会同步给Slave Broker，这样Slave Broker上就能有一模一样的一份副本数据。


# RocketMQ NameServer设计原理
## 数据路由：怎么知道访问哪个Broker？

有一个NameServer的概念，他也是独立部署在几台机器上的，然后所有的Broker都会把自己注册到NameServer上去。

![](../youdaonote-images/Pasted%20image%2020231009133443.png)

- 如果他要发送消息到Broker，会找NameServer去获取路由信息，就是集群里有哪些Broker等信息。
- 如果系统要从Broker获取消息，也会找NameServer获取路由信息，去找到对应的Broker获取消息。

![](../youdaonote-images/Pasted%20image%2020231009133726.png)

## NameServer到底可以部署几台机器？

- NameServer是可以集群化部署的,为了**保证高可用性**

NameServer一定会多机器部署，实现一个集群，起到高可用的效果，保证任何一台机器宕机，其他机器上的NameServer可以继续对外提供服务！

