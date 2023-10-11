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

![](部署一个小规模的%20RocketMQ%20集群.pdf)

# 如何对RocketMQ集群进行可视化的监控和管理？

## RocketMQ的大优势：可视化的管理界面

```shell
git clone https://github.com/apache/rocketmq-externals.git

cd rocketmq-externals/rocketmq-console

mvn package -DskipTests

# 在启动的时候设置好NameServer的地址，如果有多个地址可以用分号隔开，接着就会看到工作台启动了
java -jar rocketmq-console-ng-1.0.1.jar --server.port=8080 --rocketmq.config.namesrvAddr=127.0.0.1:9876
```

![](../youdaonote-images/Pasted%20image%2020231009202219.png)

可以看见每台机器的生产消息TPS和消费消息TPS，还有消息总数。
这是非常重要的，通过这个TPS统计，就是每秒写入或者被消费的消息数量，就可以看出RocketMQ集群的TPS和并发访问量。

# 进行OS内核参数和JVM参数的调整

## 压测前的准备工作

1. 对他部署的机器的OS内核参数进行一定的调整（也就是linux操作系统的一些内核参数）
	- 因为OS内核参数很多默认值未必适合生产环境的系统运行，有些参数的值需要调整大一些，才能让中间件发挥出来性能
![](../youdaonote-images/Pasted%20image%2020231009203738.png)

2. JVM的各种参数，比如内存区域的大小分配，垃圾回收器以及对应的行为参数，GC日志存放地址，OOM自动导出内存快照的配置

![](../youdaonote-images/Pasted%20image%2020231009204038.png)
3. 中间件系统自己本身的一些核心参数的设置。比如你的机器配置很高，是24核CPU，结果你的中间件系统默认就开启了4个工作线程去处理请求。相当于24核CPU里很多都是空闲状态，是没有任何事情可以干的。

## 对RocketMQ集群进行OS内核参数的调整

1. “vm.overcommit_memory”这个参数有三个值可以选择，0、1、2。
	1. 如果值是0的话，在你的中间件系统申请内存的时候，os内核会检查可用内存是否足够，如果足够的话就分配内存给你，如果感觉剩余内存不是太够了，干脆就拒绝你的申请，导致你申请内存失败，进而导致中间件系统异常出错。
	2. 一般需要将这个参数的值调整为1，意思是把所有可用的物理内存都允许分配给你，只要有内存就给你来用，这样可以避免申请内存失败的问题。
	3. echo 'vm.overcommit_memory=1' >> /etc/sysctl.conf。
2. vm.max_map_count 这个参数的值会影响中间件系统可以开启的线程的数量
	1. 他的默认值是65536，但是这个值有时候是不够的，建议可以把这个参数调大10倍，比如655360这样的值，保证中间件可以开启足够多的线程。
	2. echo 'vm.max_map_count=655360' >> /etc/sysctl.conf。
3. vm.swappiness 这个参数是用来控制进程的swap行为的，这个简单来说就是os会把一部分磁盘空间作为swap区域，然后如果有的进程现在可能不是太活跃，就会被操作系统把进程调整为睡眠状态，把进程中的数据放入磁盘上的swap区域，然后让这个进程把原来占用的内存空间腾出来，交给其他活跃运行的进程来使用。
	1. 如果这个参数的值设置为0，意思就是尽量别把任何一个进程放到磁盘swap区域去，尽量大家都用物理内存。
	2. 如果这个参数的值是100，那么意思就是尽量把一些进程给放到磁盘swap区域去，内存腾出来给活跃的进程使用。
	3. 默认这个参数的值是60，有点偏高了，可能会导致我们的中间件运行不活跃的时候被迫腾出内存空间然后放磁盘swap区域去。
	4. 因此通常在生产环境建议把这个参数调整小一些，比如设置为10，尽量用物理内存，别放磁盘swap区域去。
	5. echo 'vm.swappiness=10' >> /etc/sysctl.conf。
4. ulimit 这个是用来控制linux上的最大文件链接数的，默认值可能是1024，一般肯定是不够的，因为你在大量频繁的读写磁盘文件的时候，或者是进行网络通信的时候，都会跟这个参数有关系
	1. 对于一个中间件系统而言肯定是不能使用默认值的，如果你采用默认值，很可能在线上会出现如下错误：error: too many openfiles。
	2. echo 'ulimit -n 1000000' >> /etc/profile。

## 对JVM参数进行调整

“-server -Xms8g -Xmx8g -Xmn4g -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:G1ReservePercent=25 -XX:InitiatingHeapOccupancyPercent=30 -XX:SoftRefLRUPolicyMSPerMB=0 -verbose:gc -Xloggc:/dev/shm/mq_gc_%p.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCApplicationStoppedTime -XX:+PrintAdaptiveSizePolicy -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=30m -XX:-OmitStackTraceInFastThrow -XX:+AlwaysPreTouch -XX:MaxDirectMemorySize=15g -XX:-UseLargePages -XX:-UseBiasedLocking”

- -Xms8g -Xmx8g -Xmn4g：这个就是很关键的一块参数了，也是重点需要调整的，就是默认的堆大小是8g内存，新生代是4g内存，但是我们的高配物理机是48g内存的
- -XX:+UseG1GC -XX:G1HeapRegionSize=16m：这几个参数也是至关重要的，这是选用了G1垃圾回收器来做分代回收，对新生代和老年代都是用G1来回收
	这里把G1的region大小设置为了16m，这个因为机器内存比较多，所以region大小可以调大一些给到16m，不然用2m的region，会导致region数量过多的
- -XX:G1ReservePercent=25：这个参数是说，在G1管理的老年代里预留25%的空闲内存，保证新生代对象晋升到老年代的时候有足够空间，避免老年代内存都满了，新生代有对象要进入老年代没有充足内存了
	默认值是10%，略微偏少，这里RocketMQ给调大了一些
- -XX:InitiatingHeapOccupancyPercent=30：这个参数是说，当堆内存的使用率达到30%之后就会自动启动G1的并发垃圾回收，开始尝试回收一些垃圾对象
	默认值是45%，这里调低了一些，也就是提高了GC的频率，但是避免了垃圾对象过多，一次垃圾回收耗时过长的问题
- -XX:SoftRefLRUPolicyMSPerMB=0：这个参数默认设置为0了，在JVM优化专栏中，救火队队长讲过这个参数引发的案例，其实建议这个参数不要设置为0，避免频繁回收一些软引用的Class对象，这里可以调整为比如1000

## 对RocketMQ核心参数进行调整

- 在下面的目录里有dledger的示例配置文件：rocketmq/distribution/target/apacherocketmq/conf/dledger
- sendMessageThreadPoolNums=16 内部用来发送消息的线程池的线程数量，默认是16
- 数可以根据你的机器的CPU核数进行适当增加，比如机器CPU是24核的，可以增加这个线程数量到24或者30

# 压测为生产集群进行规划

**在RocketMQ的TPS和机器的资源使用率和负载之间取得一个平衡**。

比如RocketMQ集群在机器资源使用率极高的极端情况下可以扛到10万TPS，但是当他仅仅抗下8万TPS的时候，你会发现cpu负载、内存使用率、IO负载和网卡流量，都负载较高，但是可以接受，机器比较安全，不至于宕机。

## 压测情况

1. RocketMQ的TPS和消息延时
2. cpu负载情况 (top、uptime)
3. 内存使用率 (free)
4. JVM GC频率 (jstat)
5. 磁盘IO负载 (top 可以看cpu 里的wa，如果过高说明cpu大部分时间在等待io，io负载过高。)
6. 网卡流量 (sar -n DEV 1 2 通过这个命令就可以看到每秒钟网卡读写数据量。很多时候性能可以，但是网卡不可以。)


# RocketMQ Java具体优化流程

## 消息发送方式
1. 使用同步发送消息方式。
2. 使用异步发送更加优化时间。
3. 也可以发送单向消息，不需要回调。

## 消费模式
1. push消费模式(Broker会主动把消息发送给你的消费者，你的消费者是被动的接收Broker推送给过来的消息，然后进行处理。)
2. pull消费模式(消费者主动拉取过来)

## 通过mysql binlog发送到rocketmq里面来进行数据统计

![](../youdaonote-images/Pasted%20image%2020231009232931.png)


# RocketMQ底层原理和思路

## 1. 生产者往Broker集群发送消息的底层原理

### 1.1 Topic、MessageQueue以及Broker之间的关系
1. 在创建Topic的时候需要指定一个很关键的参数，就是MessageQueue。
2. 以在RocketMQ引入了MessageQueue的概念，本质上就是一个数据分片的机制。
3. 假设Topic有1万条数据，Topic有4个MessageQueue，那么每个MessageQueue中2500条数据
4. 很有可能就是在2个Broker上，每个Broker放两个MessageQueue

![](../youdaonote-images/Pasted%20image%2020231011211750.png)

### 1.2 生产者发送消息的时候写入哪个MessageQueue？
![](../youdaonote-images/Pasted%20image%2020231011211918.png)

1. 暂时先认为生产者会均匀的把消息写入各个MessageQueue

### 1.3 如果某个Broker出现故障该怎么办？
![](../youdaonote-images/Pasted%20image%2020231011212141.png)
1. master 挂了，这时正在等待slave切换，按照之前策略就会访问失败。
2. 在Producer中开启一个开关，就是sendLatencyFaultEnable
3. 打开了会有自动容错机制，在某一次访问中发现有500ms延迟，以及访问不到，就会自动回避这个Broker一段时间。

## 2. Broker是如何持久化存储消息的
**Broker数据存储是一个MQ最核心的环节**，他决定了生产者消息写入的吞吐量，决定了消息不能丢失，决定了消费者获取消息的吞吐量

1. CommitLog消息顺序写入机制
	1. 接收到了一条消息，会把这个消息直接写入磁盘上的一个日志文件，叫做CommitLog
	2. 这个CommitLog是很多磁盘文件，每个文件限定最多1GB，写满就会新建
![](../youdaonote-images/Pasted%20image%2020231011215632.png)
2. Topic下的每个MessageQueue都会有一系列的ConsumeQueue文件
	1. 是在Broker的磁盘上，会有这种格式的一系列文件：$HOME/store/consumequeue/{topic}/{queueId}/{fileName}
	2. {topic}指代的就是某个Topic，{queueId}指代的就是某个MessageQueue。
	3. **这个ConsumeQueue文件里，存储的是一条消息对应在CommitLog文件中的offset偏移量。**
![](../youdaonote-images/Pasted%20image%2020231011220528.png)




## 基于DLedger技术部署的Broker高可用集群，如何进行数据同步

## 消费者基于什么策略选择Master或Slave拉取数据

## 消费者是如何从Broker拉取消息回来，进行处理以及ACK的？


## 如果消费者故障了会如何处理？