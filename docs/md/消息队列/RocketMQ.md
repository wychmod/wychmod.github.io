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

## Broker是把自己的信息注册到哪个NameServer上去？

- 每个Broker启动都得向所有的NameServer进行注册

## 系统如何从NameServer获取Broker信息？
- 系统主动去NameServer拉取Broker信息的。

## 如果Broker挂了，NameServer是怎么感知到的？

- 靠的是Broker跟NameServer之间的心跳机制，Broker会每隔30s给所有的NameServer发送心跳，告诉每个NameServer自己目前还活着。
- 每次NameServer收到一个Broker的心跳，就可以更新一下他的最近一次心跳的时间
- NameServer会每隔10s运行一个任务，去检查一下各个Broker的最近一次心跳时间，如果某个Broker超过120s都没发送心跳了，那么就认为这个Broker已经挂掉了。
![](../youdaonote-images/Pasted%20image%2020231009134834.png)

## Broker是如何跟NameServer进行通信的？

- 在RocketMQ的实现中，采用的是**TCP长连接**进行通信。
- **Broker会跟每个NameServer都建立一个TCP长连接，然后定时通过TCP长连接发送心跳请求过去**
![](../youdaonote-images/Pasted%20image%2020231009145851.png)


# Broker的主从架构原理是什么？

## MQ如果要存储海量消息应该怎么做?

发送消息到MQ的系统会把消息分散发送给多台不同的机器，假设一共有1万条消息，分散发送给10台机器，可能每台机器就是接收到1000条消息，如下图：

![](../youdaonote-images/Pasted%20image%2020231009132909.png)

每台机器上部署的RocketMQ进程一般称之为Broker，每个Broker都会收到不同的消息，然后就会把这批消息存储在自己本地的磁盘文件里。

## 高可用保障：万一Broker宕机了怎么办？

RocketMQ的解决思路是**Broker主从架构以及多副本策略**。

Master Broker收到消息之后会同步给Slave Broker，这样Slave Broker上就能有一模一样的一份副本数据。

## Master Broker是如何将消息同步给Slave Broker的？

- RocketMQ的Master-Slave模式采取的是Slave Broker不停的发送请求到Master Broker去拉取消息。
- 是RocketMQ自身的Master-Slave模式采取的是**Pull模式**拉取消息。

## RocketMQ 实现读写分离了吗？

**有可能从Master Broker获取消息，也有可能从Slave Broker获取消息**
- Master Broker在返回消息给消费者系统的时候，会根据当时Master Broker的负载情况和Slave Broker的同步情况，向消费者系统建议下一次拉取消息的时候是从Master Broker拉取还是从Slave Broker拉取。
![](../youdaonote-images/Pasted%20image%2020231009140829.png)
> 在写入消息的时候，通常来说肯定是选择Master Broker去写入的， **有可能从Master Broker获取消息，也有可能从Slave Broker获取消息**

## 如果Slave Broke挂掉了有什么影响？

**有一点影响，但是影响不太大**

因为消息写入全部是发送到Master Broker的，然后消息获取也可以走Master Broker。

只不过少了Slave Broker，会导致所有读写压力都集中在Master Broker上。

## 如果Master Broker挂掉了该怎么办？
Slave Broker也是跟Master Broker一样有一份数据在的，只不过Slave Broker上的数据可能有部分没来得及从Master Broker同步。

此时RocketMQ不可以实现直接自动将Slave Broker切换为Master Broker

在RocketMQ 4.5版本之前，都是用Slave Broker同步数据，尽量保证数据不丢失，但是一旦Master故障了，Slave是没法自动切换成Master的。

所以在这种情况下，如果Master Broker宕机了，这时就得手动做一些运维操作，把Slave Broker重新修改一些配置，重启机器给调整为Master Broker，这是有点麻烦的，而且会导致中间一段时间不可用。

> 这种Master-Slave模式**不是彻底的高可用模式，他没法实现自动把Slave切换为Master**

## 基于Dledger实现RocketMQ高可用自动切换

- 在RocketMQ 4.5之后，这种情况得到了改变，因为RocketMQ支持了一种新的机制，叫做Dledger
- 把Dledger融入RocketMQ之后，就可以让一个Master Broker对应多个Slave Broker，也就是说一份数据可以有多份副本，比如一个Master Broker对应两个Slave Broker。
- 此时一旦Master Broker宕机了，就可以在多个副本，也就是多个Slave中，通过Dledger技术和Raft协议算法进行leader选举，直接将一个Slave Broker选举为新的Master Broker，然后这个新的Master Broker就可以对外提供服务了。

![](../youdaonote-images/Pasted%20image%2020231009143944.png)

# MQ的核心数据模型：Topic到底是什么？

**MQ中的核心数据模型，Topic**。

Topic就是主题，**数据集合**的意思。

Topic其实就是一个数据集合的意思，不同类型的数据你得放不同的Topic里去。

## Topic作为一个数据集合是怎么在Broker集群里存储的？

我们可以在创建Topic的时候指定让他里面的数据分散存储在多台Broker机器上，比如一个Topic里有1000万条数据，此时有2台Broker，那么就可以让每台Broker上都放500万条数据。

- 每个Broke在进行定时的心跳汇报给NameServer的时候，都会告诉NameServer自己当前的数据情况，比如有哪些Topic的哪些数据在自己这里，这些信息都是属于路由信息的一部分。


## 生产者系统是如何将消息发送给Broker的？

1. 可以跟NameServer建立一个TCP长连接，然后定时从他那里拉取到最新的路由信息，包括集群里有哪些Broker，集群里有哪些Topic，每个Topic都存储在哪些Broker上。

2. 然后生产者系统自然就可以通过路由信息找到自己要投递消息的Topic分布在哪几台Broker上，此时可以根据负载均衡算法，从里面选择一台Broke机器出来，比如round robine轮询算法，或者是hash算法，都可以。

3. 选择一台Broker之后，就可以跟那个Broker也建立一个TCP长连接，然后通过长连接向Broker发送消息即可。

4. Broker收到消息之后就会存储在自己本地磁盘里去。

![](../youdaonote-images/Pasted%20image%2020231009151730.png)

## 消费者是如何从Broker上拉取消息的？

消费者系统其实跟生产者系统原理是类似的，他们也会跟NameServer建立长连接，然后拉取路由信息，接着找到自己要获取消息的Topic在哪几台Broker上，就可以跟Broker建立长连接，从里面拉取消息了。

![](../youdaonote-images/Pasted%20image%2020231009152028.png)

# 部署一个小规模 RocketMQ 集群
- Broker是最负载最高的，未来要承载高并发写入和海量数据存储，所以把最高配置的机器都会留给他
- NameServer是核心的路由服务，一般就是承载Broker注册和心跳、系统的路由表拉取等请求，负载其实很低，因此不需要特别高的机器配置，部署三台也可以实现高可用的效果了。

## 快速部署RocketMQ

```shell 
# 构建Dledger
git clone https://github.com/openmessaging/openmessaging-storage-dledger.git
cd openmessaging-storage-dledger
mvn clean install -DskipTests

# 构建RocketMQ
git clone https://github.com/apache/rocketmq.git
cd rocketmq
git checkout -b store_with_dledger origin/store_with_dledger
mvn -Prelease-all -DskipTests clean install -U

cd distribution/target/apache-rocketmq

# 在这个目录中，需要编辑三个文件，一个是bin/runserver.sh，一个是bin/runbroker.sh，另外一个是bin/tools.sh

# 在里面找到如下三行，然后将第二行和第三行都删了，同时将第一行的值修改为你自己的JDK的主目录

[ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=$HOME/jdk/java
[ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=/usr/java
[ ! -e "$JAVA_HOME/bin/java" ] && error_exit "Please set the JAVA_HOME variable in your environment, We need java(x64)!"

# 注：如果要查看你的JDK装哪儿了，可以用命令：/usr/libexec/java_home -V，修改为你的Java主目录即可

sh bin/dledger/fast-try.sh start


```