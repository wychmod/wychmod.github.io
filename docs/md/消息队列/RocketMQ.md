# 1. RocketMQ NameServer设计原理
## 1. 数据路由：怎么知道访问哪个Broker？

有一个NameServer的概念，他也是独立部署在几台机器上的，然后所有的Broker都会把自己注册到NameServer上去。

![](../youdaonote-images/Pasted%20image%2020231009133443.png)

- 如果他要发送消息到Broker，会找NameServer去获取路由信息，就是集群里有哪些Broker等信息。
- 如果系统要从Broker获取消息，也会找NameServer获取路由信息，去找到对应的Broker获取消息。

![](../youdaonote-images/Pasted%20image%2020231009133726.png)

## 2. NameServer到底可以部署几台机器？

- NameServer是可以集群化部署的,为了**保证高可用性**

NameServer一定会多机器部署，实现一个集群，起到高可用的效果，保证任何一台机器宕机，其他机器上的NameServer可以继续对外提供服务！

## 3. Broker是把自己的信息注册到哪个NameServer上去？

- 每个Broker启动都得向所有的NameServer进行注册

## 4. 系统如何从NameServer获取Broker信息？
- 系统主动去NameServer拉取Broker信息的。

## 5. 如果Broker挂了，NameServer是怎么感知到的？

- 靠的是Broker跟NameServer之间的心跳机制，Broker会每隔30s给所有的NameServer发送心跳，告诉每个NameServer自己目前还活着。
- 每次NameServer收到一个Broker的心跳，就可以更新一下他的最近一次心跳的时间
- NameServer会每隔10s运行一个任务，去检查一下各个Broker的最近一次心跳时间，如果某个Broker超过120s都没发送心跳了，那么就认为这个Broker已经挂掉了。
![](../youdaonote-images/Pasted%20image%2020231009134834.png)

## 6. Broker是如何跟NameServer进行通信的？

- 在RocketMQ的实现中，采用的是**TCP长连接**进行通信。
- **Broker会跟每个NameServer都建立一个TCP长连接，然后定时通过TCP长连接发送心跳请求过去**
![](../youdaonote-images/Pasted%20image%2020231009145851.png)


# 2. Broker的主从架构原理是什么？

## 1. MQ如果要存储海量消息应该怎么做?

发送消息到MQ的系统会把消息分散发送给多台不同的机器，假设一共有1万条消息，分散发送给10台机器，可能每台机器就是接收到1000条消息，如下图：

![](../youdaonote-images/Pasted%20image%2020231009132909.png)

每台机器上部署的RocketMQ进程一般称之为Broker，每个Broker都会收到不同的消息，然后就会把这批消息存储在自己本地的磁盘文件里。

## 2. 高可用保障：万一Broker宕机了怎么办？

RocketMQ的解决思路是**Broker主从架构以及多副本策略**。

Master Broker收到消息之后会同步给Slave Broker，这样Slave Broker上就能有一模一样的一份副本数据。

## 3. Master Broker是如何将消息同步给Slave Broker的？

- RocketMQ的Master-Slave模式采取的是Slave Broker不停的发送请求到Master Broker去拉取消息。
- 是RocketMQ自身的Master-Slave模式采取的是**Pull模式**拉取消息。

## 4. RocketMQ 实现读写分离了吗？

**有可能从Master Broker获取消息，也有可能从Slave Broker获取消息**
- Master Broker在返回消息给消费者系统的时候，会根据当时Master Broker的负载情况和Slave Broker的同步情况，向消费者系统建议下一次拉取消息的时候是从Master Broker拉取还是从Slave Broker拉取。
![](../youdaonote-images/Pasted%20image%2020231009140829.png)
> 在写入消息的时候，通常来说肯定是选择Master Broker去写入的， **有可能从Master Broker获取消息，也有可能从Slave Broker获取消息**

## 5. 如果Slave Broke挂掉了有什么影响？

**有一点影响，但是影响不太大**

因为消息写入全部是发送到Master Broker的，然后消息获取也可以走Master Broker。

只不过少了Slave Broker，会导致所有读写压力都集中在Master Broker上。

## 6. 如果Master Broker挂掉了该怎么办？
Slave Broker也是跟Master Broker一样有一份数据在的，只不过Slave Broker上的数据可能有部分没来得及从Master Broker同步。

此时RocketMQ不可以实现直接自动将Slave Broker切换为Master Broker

在RocketMQ 4.5版本之前，都是用Slave Broker同步数据，尽量保证数据不丢失，但是一旦Master故障了，Slave是没法自动切换成Master的。

所以在这种情况下，如果Master Broker宕机了，这时就得手动做一些运维操作，把Slave Broker重新修改一些配置，重启机器给调整为Master Broker，这是有点麻烦的，而且会导致中间一段时间不可用。

> 这种Master-Slave模式**不是彻底的高可用模式，他没法实现自动把Slave切换为Master**

## 7. 基于Dledger实现RocketMQ高可用自动切换

- 在RocketMQ 4.5之后，这种情况得到了改变，因为RocketMQ支持了一种新的机制，叫做Dledger
- 把Dledger融入RocketMQ之后，就可以让一个Master Broker对应多个Slave Broker，也就是说一份数据可以有多份副本，比如一个Master Broker对应两个Slave Broker。
- 此时一旦Master Broker宕机了，就可以在多个副本，也就是多个Slave中，通过Dledger技术和Raft协议算法进行leader选举，直接将一个Slave Broker选举为新的Master Broker，然后这个新的Master Broker就可以对外提供服务了。

![](../youdaonote-images/Pasted%20image%2020231009143944.png)

# 3. MQ的核心数据模型：Topic到底是什么？

**MQ中的核心数据模型，Topic**。

Topic就是主题，**数据集合**的意思。

Topic其实就是一个数据集合的意思，不同类型的数据你得放不同的Topic里去。

## 1. Topic作为一个数据集合是怎么在Broker集群里存储的？

我们可以在创建Topic的时候指定让他里面的数据分散存储在多台Broker机器上，比如一个Topic里有1000万条数据，此时有2台Broker，那么就可以让每台Broker上都放500万条数据。

- 每个Broke在进行定时的心跳汇报给NameServer的时候，都会告诉NameServer自己当前的数据情况，比如有哪些Topic的哪些数据在自己这里，这些信息都是属于路由信息的一部分。


## 2. 生产者系统是如何将消息发送给Broker的？

1. 可以跟NameServer建立一个TCP长连接，然后定时从他那里拉取到最新的路由信息，包括集群里有哪些Broker，集群里有哪些Topic，每个Topic都存储在哪些Broker上。

2. 然后生产者系统自然就可以通过路由信息找到自己要投递消息的Topic分布在哪几台Broker上，此时可以根据负载均衡算法，从里面选择一台Broke机器出来，比如round robine轮询算法，或者是hash算法，都可以。

3. 选择一台Broker之后，就可以跟那个Broker也建立一个TCP长连接，然后通过长连接向Broker发送消息即可。

4. Broker收到消息之后就会存储在自己本地磁盘里去。

![](../youdaonote-images/Pasted%20image%2020231009151730.png)

## 3. 消费者是如何从Broker上拉取消息的？

消费者系统其实跟生产者系统原理是类似的，他们也会跟NameServer建立长连接，然后拉取路由信息，接着找到自己要获取消息的Topic在哪几台Broker上，就可以跟Broker建立长连接，从里面拉取消息了。

![](../youdaonote-images/Pasted%20image%2020231009152028.png)

# 4. 部署一个小规模 RocketMQ 集群
- Broker是最负载最高的，未来要承载高并发写入和海量数据存储，所以把最高配置的机器都会留给他
- NameServer是核心的路由服务，一般就是承载Broker注册和心跳、系统的路由表拉取等请求，负载其实很低，因此不需要特别高的机器配置，部署三台也可以实现高可用的效果了。

## 快速部署RocketMQ

![](部署一个小规模的%20RocketMQ%20集群.pdf)

# 5. 如何对RocketMQ集群进行可视化的监控和管理？

## 1. RocketMQ的大优势：可视化的管理界面

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

# 6. 进行OS内核参数和JVM参数的调整

## 1. 压测前的准备工作

1. 对他部署的机器的OS内核参数进行一定的调整（也就是linux操作系统的一些内核参数）
	- 因为OS内核参数很多默认值未必适合生产环境的系统运行，有些参数的值需要调整大一些，才能让中间件发挥出来性能
![](../youdaonote-images/Pasted%20image%2020231009203738.png)

2. JVM的各种参数，比如内存区域的大小分配，垃圾回收器以及对应的行为参数，GC日志存放地址，OOM自动导出内存快照的配置

![](../youdaonote-images/Pasted%20image%2020231009204038.png)
3. 中间件系统自己本身的一些核心参数的设置。比如你的机器配置很高，是24核CPU，结果你的中间件系统默认就开启了4个工作线程去处理请求。相当于24核CPU里很多都是空闲状态，是没有任何事情可以干的。

## 2. 对RocketMQ集群进行OS内核参数的调整

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

## 3. 对JVM参数进行调整

“-server -Xms8g -Xmx8g -Xmn4g -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:G1ReservePercent=25 -XX:InitiatingHeapOccupancyPercent=30 -XX:SoftRefLRUPolicyMSPerMB=0 -verbose:gc -Xloggc:/dev/shm/mq_gc_%p.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCApplicationStoppedTime -XX:+PrintAdaptiveSizePolicy -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=30m -XX:-OmitStackTraceInFastThrow -XX:+AlwaysPreTouch -XX:MaxDirectMemorySize=15g -XX:-UseLargePages -XX:-UseBiasedLocking”

- -Xms8g -Xmx8g -Xmn4g：这个就是很关键的一块参数了，也是重点需要调整的，就是默认的堆大小是8g内存，新生代是4g内存，但是我们的高配物理机是48g内存的
- -XX:+UseG1GC -XX:G1HeapRegionSize=16m：这几个参数也是至关重要的，这是选用了G1垃圾回收器来做分代回收，对新生代和老年代都是用G1来回收
	这里把G1的region大小设置为了16m，这个因为机器内存比较多，所以region大小可以调大一些给到16m，不然用2m的region，会导致region数量过多的
- -XX:G1ReservePercent=25：这个参数是说，在G1管理的老年代里预留25%的空闲内存，保证新生代对象晋升到老年代的时候有足够空间，避免老年代内存都满了，新生代有对象要进入老年代没有充足内存了
	默认值是10%，略微偏少，这里RocketMQ给调大了一些
- -XX:InitiatingHeapOccupancyPercent=30：这个参数是说，当堆内存的使用率达到30%之后就会自动启动G1的并发垃圾回收，开始尝试回收一些垃圾对象
	默认值是45%，这里调低了一些，也就是提高了GC的频率，但是避免了垃圾对象过多，一次垃圾回收耗时过长的问题
- -XX:SoftRefLRUPolicyMSPerMB=0：这个参数默认设置为0了，在JVM优化专栏中，救火队队长讲过这个参数引发的案例，其实建议这个参数不要设置为0，避免频繁回收一些软引用的Class对象，这里可以调整为比如1000

## 4. 对RocketMQ核心参数进行调整

- 在下面的目录里有dledger的示例配置文件：rocketmq/distribution/target/apacherocketmq/conf/dledger
- sendMessageThreadPoolNums=16 内部用来发送消息的线程池的线程数量，默认是16
- 数可以根据你的机器的CPU核数进行适当增加，比如机器CPU是24核的，可以增加这个线程数量到24或者30

# 7. 压测为生产集群进行规划

**在RocketMQ的TPS和机器的资源使用率和负载之间取得一个平衡**。

比如RocketMQ集群在机器资源使用率极高的极端情况下可以扛到10万TPS，但是当他仅仅抗下8万TPS的时候，你会发现cpu负载、内存使用率、IO负载和网卡流量，都负载较高，但是可以接受，机器比较安全，不至于宕机。

## 压测情况

1. RocketMQ的TPS和消息延时
2. cpu负载情况 (top、uptime)
3. 内存使用率 (free)
4. JVM GC频率 (jstat)
5. 磁盘IO负载 (top 可以看cpu 里的wa，如果过高说明cpu大部分时间在等待io，io负载过高。)
6. 网卡流量 (sar -n DEV 1 2 通过这个命令就可以看到每秒钟网卡读写数据量。很多时候性能可以，但是网卡不可以。)


# 8. RocketMQ Java具体优化流程

## 1. 消息发送方式
1. 使用同步发送消息方式。
2. 使用异步发送更加优化时间。
3. 也可以发送单向消息，不需要回调。

## 2. 消费模式
1. push消费模式(Broker会主动把消息发送给你的消费者，你的消费者是被动的接收Broker推送给过来的消息，然后进行处理。)
2. pull消费模式(消费者主动拉取过来)

## 3. 通过mysql binlog发送到rocketmq里面来进行数据统计

![](../youdaonote-images/Pasted%20image%2020231009232931.png)


# 9. RocketMQ底层原理和思路

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
	4. **在ConsumeQueue中存储的每条数据不只是消息在CommitLog中的offset偏移量，还包含了消息的长度，以及taghashcode，一条数据是20个字节，每个ConsumeQueue文件保存30万条数据，大概每个文件是5.72MB。**
![](../youdaonote-images/Pasted%20image%2020231011220528.png)
![](../youdaonote-images/Pasted%20image%2020231011220753.png)

3. Broker是基于OS操作系统的**PageCache和顺序写**两个机制，来提升写入CommitLog文件的性能
	1. 每次写入就是在文件末尾追加一条数据，顺序写的性能要比对文件随机写的性能提升很多
	2. 写入CommitLog文件的时候，其实不是直接写入底层的物理磁盘文件的，而是先进入OS的PageCache内存缓存中，然后后续由OS的后台线程选一个时间，异步化的将OS PageCache内存缓冲中的数据刷入底层的磁盘文件。
	3. **采用磁盘文件顺序写+OS PageCache写入+OS异步刷盘的策略，基本上可以让消息写入CommitLog的性能**跟你直接写入内存里是差不多的
![](../youdaonote-images/Pasted%20image%2020231011225023.png)

4. 同步刷盘和异步刷盘各自的优缺点：高吞吐写入+丢失数据风险(在缓存中，突然宕机)，写入吞吐量下降+数据不丢失


## 3. 基于DLedger技术部署的Broker高可用集群，如何进行数据同步

### 3.1 Broker高可用架构原理
如果要让Broker实现高可用，那么必须有一个Broker组，里面有一个是Leader Broker可以写入数据，然后让Leader Broker接收到数据之后，直接把数据同步给其他的Follower Broker
![](../youdaonote-images/Pasted%20image%2020231014150554.png)

## 3.2 基于DLedger技术替换Broker的CommitLog

1. DLedger技术实际上首先他自己就有一个CommitLog机制，你把数据交给他，他会写入CommitLog磁盘文件里去。
2. 如果基于DLedger技术来实现Broker高可用架构，实际上就是用DLedger先替换掉原来Broker自己管理的CommitLog，由DLedger来管理CommitLog
![](../youdaonote-images/Pasted%20image%2020231014150754.png)

### 3.3 DLedger是如何基于Raft协议选举Leader Broker的
**基于Raft协议来进行Leader Broker选举的**
1. 三台Broker机器启动的时候，他们都会投票自己作为Leader，然后把这个投票发送给其他Broker。
2. 所以第一轮选举失败，然后大家会进入随机时间休眠，假如1号3s 2号4s 3号5s
3. 这个时候先苏醒的会投自己，然后把自己的选票发给其他人。
4. 当其他人苏醒时看见自己有收到的选票，就会尊重这个人意见，投这个人。
> **其实只要有（3台机器 / 2） + 1个人投票给某个人，就会选举他当Leader，这个（机器数量 / 2） + 1就是大多数的意思。**

### 3.4 DLedger是如何基于Raft协议进行多副本同步的

**数据同步会分为两个阶段，一个是uncommitted阶段，一个是commited阶段**

1. Leader Broker上的DLedger收到一条数据之后，会标记为uncommitted状态，然后他会通过自己的DLedgerServer组件把这个uncommitted数据发送给Follower Broker的DLedgerServer
2. 接着Follower Broker的DLedgerServer收到uncommitted消息之后，必须返回一个ack给Leader Broker的DLedgerServer，然后如果Leader Broker收到超过半数的Follower Broker返回ack之后，就会将消息标记为committed状态。
3. 然后Leader Broker上的DLedgerServer就会发送commited消息给Follower Broker机器的DLedgerServer，让他们也把消息标记为comitted状态。

![](../youdaonote-images/Pasted%20image%2020231014152836.png)

### 3.5 如果Leader Broker崩溃了怎么办？
如果Leader Broker挂了，此时剩下的两个Follower Broker就会重新发起选举，他们会基于DLedger还是采用Raft协议的算法，去选举出来一个新的Leader Broker继续对外提供服务，而且会对没有完成的数据同步进行一些恢复性的操作，保证数据不会丢失。

如果Leader Broker刚同步到一半挂了，收到一半以上的ack的时候挂了，超过半数的Follower Broker上也是有这个消息的，只不过是uncommitted状态，新选举的Leader Broker可以根据剩余Follower Broker上这个消息的状态去进行数据恢复，比如把消息状态调整为committed。

![](../youdaonote-images/Pasted%20image%2020231014153025.png)

## 4. 消费者是如何从Broker拉取消息回来，进行处理以及ACK的

### 4.1 消费者组

消费者组就是一堆具有相同功能的机器组成的一个群组，例如营销系统有四台机器，他们就可以属于营销消费者组。

不同的系统应该设置不同的消费组，如果不同的消费组订阅了同一个Topic，对Topic里的一条消息，每个消费组都会获取到这条消息。

![](../youdaonote-images/Pasted%20image%2020231014154106.png)


### 4.2 集群模式消费 vs 广播模式消费

- 集群模式(默认): 一个消费组获取到一条消息，只会交给组内的一台机器去处理，不是每台机器都可以获取到这条消息的。
- 广播模式: 对于消费组获取到的一条消息，组内每台机器都可以获取到这条消息。

### 4.3 MessageQueue与消费者的关系
- 会均匀的将MessageQueue分配给消费组的多台机器来消费
- 假设我们的“TopicOrderPaySuccess”有4个MessageQueue，这4个MessageQueue分布在两个Master Broker上，每个Master Broker上有2个MessageQueue。
- 一个Topic的多个MessageQueue会均匀分摊给消费组内的多个机器去消费，这里的一个原则就是，**一个MessageQueue只能被一个消费机器去处理，但是一台消费者机器可以负责多个MessageQueue的消息处理。**

![](../youdaonote-images/Pasted%20image%2020231014162140.png)

### 4.4 Push模式 vs Pull模式

- Push消费模式: 基于这种消费者主动拉取的模式来实现的
	- 在Push模式下会处理完一批消息，立马发起请求拉取下一批消息，消息处理的时效性非常好，看起来就跟Broker一直不停的推送消息到消费机器一样。
	- 请求挂起和长轮询的机制: 没有新的消息，就会让请求线程挂起，默认是挂起15秒，这个过程中每隔一会儿会去检查一下，如果有新消息到达也会主动唤醒挂起的线程，然后把消息给你。

> 一般我们使用RocketMQ的时候，消费模式通常都是基于他的Push模式来做的，因为Pull模式的代码写起来更加的复杂和繁琐，而且Push模式底层本身就是基于消息拉取的方式来做的，只不过时效性更好而已。

### 4.5 Broker是如何将消息读取出来返回给消费机器的？
**本质就是根据你要消费的MessageQueue以及开始消费的位置，去找到对应的ConsumeQueue读取里面对应位置的消息在CommitLog中的物理offset偏移量，然后到CommitLog中根据offset读取消息数据，返回给消费者机器。**

### 4.6 消费者机器如何处理消息、进行ACK以及提交消费进度？

当我们处理完这批消息之后，消费者机器就会提交我们目前的一个消费进度到Broker上去，然后Broker就会存储我们的消费进度

比如我们现在对ConsumeQueue0的消费进度假设就是在offset=1的位置，那么他会记录下来一个ConsumeOffset的东西去标记我们的消费进度，如下图

![](../youdaonote-images/Pasted%20image%2020231014164711.png)

下次消费可以从Broker记录的消费位置开始继续拉取，不用重头开始拉取了。

### 4.7 如果消费组中出现机器宕机或者扩容加机器，会怎么处理

会进行rebalance， 重新给各个消费机器分配他们要处理的MessageQueue。

## 5. 消费者基于什么策略选择Master或Slave拉取数据
### 5.1 ConsumeQueue文件也是基于os cache的读和写的
1. ConsumeQueue会被大量的消费者发送的请求给高并发的读取，会极大的影响到消费者进行消息拉取的性能和消费吞吐量。
2. os自己有一个优化机制，就是读取一个磁盘文件的时候，他会自动把磁盘文件的一些数据缓存到os cache中。
3. **ConsumeQueue文件主要是存放消息的offset，所以每个文件很小，30万条消息的offset就只有5.72MB。**

![](../youdaonote-images/Pasted%20image%2020231014233526.png)
### 5.2 CommitLog是基于os cache+磁盘一起读取的
1. 读取刚刚写入CommitLog的内容，可能还在os cache里，相当于从内存读，性能高。
2. 不在os cache里，只能从磁盘上读。
![](../youdaonote-images/Pasted%20image%2020231014233700.png)


> 如果读取速度很快，和生产速度同步，那么大概率可以一直从os cache里读。

### 5.3 Master Broker什么时候会让你从Slave Broker拉取数据？
**broker自己是知道机器上当前的整体物理内存有多大的，而且他也知道自己可用的最大空间占里面的比例，他是知道自己的消息最多可以在内存里放多少的！**

他会认为出现这种情况，很可能是因为自己作为master broker负载太高了，导致没法及时的把消息给你，所以你落后的进度比较多。所以你下次去Slave Broker读吧。

**本质是对比你当前没有拉取消息的数量和大小，以及最多可以存放在os cache内存里的消息的大小，如果你没拉取的消息超过了最大能使用的内存的量，那么说明你后续会频繁从磁盘加载数据，此时就让你从slave broker去加载数据了！**

# 10. RocketMQ黑科技

## 1. 如何基于Netty扩展出高性能网络通信架构
1. 专门分配一个Reactor主线程，专门负责跟各种Producer、Consumer之类的建立长连接。
2. 连接建立好之后，大量的长连接均匀的分配给Reactor线程池里的多个线程。每个Reactor线程负责监听一部分连接的请求，，通过多线程并发的监听不同连接的请求，可以有效的提升大量并发请求过来时候的处理能力，可以提升网络框架的并发能力。
3. 对大量并发过来的请求都是基于Worker线程池进行预处理的，当Worker线程池预处理多个请求的时候，Reactor线程还是可以有条不紊的继续监听和接收大量连接的请求是否到达。
4. 最终的读写磁盘文件之类的操作都是交给业务线程池来处理的，当他并发执行多个请求的磁盘读写操作的时候，不影响其他线程池同时接收请求、预处理请求，没任何的影响。

> **使用不同阶段的多线程处理，把粒度缩小，使得每个部分都能处理大量的内容。**


## 2. 基于mmap内存映射实现CommitLog磁盘文件的高性能读写

**传统文件IO操作会经过多次数据拷贝。**

![](../youdaonote-images/Pasted%20image%2020231015135623.png)

1. 建立虚拟地址的映射。
	1. **刚开始你建立映射的时候，并没有任何的数据拷贝操作，其实磁盘文件还是停留在那里**，只不过他把物理上的磁盘文件的一些地址和用户进程私有空间的一些虚拟内存地址进行了一个映射
	2. JDK NIO包下的MappedByteBuffer.map()函数干的事情，底层就是基于mmap技术实现的。
	3. mmap技术在进行文件映射的时候，一般有大小限制，在1.5GB~2GB之间，所以单个CommitLog文件的大小在1GB。
![](../youdaonote-images/Pasted%20image%2020231015135955.png)
2. 基于mmap技术+pagecache技术实现高性能的文件读写
	1. 只有一次数据拷贝的过程，他就是从PageCache里拷贝到磁盘文件里而已！这个就是你使用mmap技术之后，相比于传统磁盘IO的一个性能优化。
	2. PageCache技术在加载数据的时候，还会将你**加载的数据块的临近的其他数据块也一起加载到PageCache里去**。
	3. 读取数据的时候，其实也仅仅发生了一次拷贝，而不是两次拷贝
![](../youdaonote-images/Pasted%20image%2020231015140139.png)
3. **预映射机制 + 文件预热机制**
	1. **内存预映射机制**：Broker会针对磁盘上的各种CommitLog、ConsumeQueue文件预先分配好MappedFile，也就是提前对一些可能接下来要读写的磁盘文件，提前使用MappedByteBuffer执行map()函数完成映射，这样后续读写文件的时候，就可以直接执行了。
	2. **文件预热**：在提前对一些文件完成映射之后，因为映射不会直接将数据加载到内存里来，那么后续在读取尤其是CommitLog、ConsumeQueue的时候，其实有可能会频繁的从磁盘里加载数据到内存中去。**其实在执行完map()函数之后，会进行madvise系统调用，就是提前尽可能多的把磁盘文件加载到内存里去。**

## 11. 消息零丢失方案

## 1. 解决消息丢失的第一个问题：订单系统推送消息丢失

![](../youdaonote-images/Pasted%20image%2020231015221725.png)

在RocketMQ中，有一个非常强悍有力的功能，就是**事务消息的功能**，凭借这个事务级的消息机制，就可以让我们确保订单系统推送给出去的消息一定会成功写入MQ里，绝对不会半路就搞丢了。

## 2. 发送消息零丢失方案:事务消息的功能
1. 发送half消息(实际消息，状态是half)到MQ去，试探一下MQ是否正常
	1. half消息写入失败了， 就要将业务回滚，比如订单关闭进行退款。
	2. half消息成功之后，订单系统完成自己的任务
2. 如果订单系统的本地事务执行失败了，会给MQ发送一个回滚rollback请求，让他删除half请求。
3. 如果订单系统完成了本地事务，发送请求让MQ对之前的half消息进行commit操作，消息被commit之后，红包系统才可以看到和获取这条消息进行后续处理。
4. 如果发送half消息成功了，但是没收到响应，就会过一段时间，去回调接口看这个消息是要提交还是回滚。比如这时查询订单，发现订单关闭，就需要回滚了。

> 如果没收到half消息，那肯定是失败。如果收到了half消息，任何的失败都会回调接口。然后进行判断是回滚还是提交。

![](../youdaonote-images/Pasted%20image%2020231015222251.png)

![](../youdaonote-images/Pasted%20image%2020231015223048.png)

## 3. 事务消息机制的底层实现原理

1. RocketMQ一旦发现你发送的是一个half消息，他不会把这个half消息的offset写入目标topic的ConsumeQueue里去。他会把这条half消息写入到自己内部的“RMQ_SYS_TRANS_HALF_TOPIC”这个Topic对应的一个ConsumeQueue里去。

![](../youdaonote-images/Pasted%20image%2020231015224947.png)

2. half消息进入到RocketMQ内部的RMQ_SYS_TRANS_HALF_TOPIC的ConsumeQueue文件了，此时就会认为half消息写入成功了，然后就会返回响应给订单系统。
3. 定时任务会去扫描RMQ_SYS_TRANS_HALF_TOPIC中的half消息，如果你超过一定时间还是half消息，他会回调订单系统的接口，让你判断这个half消息是要rollback还是commit。
4. 因为RocketMQ都是顺序把消息写入磁盘文件的，所以在这里如果你执行rollback，他的本质就是用一个OP操作来标记half消息的状态RocketMQ内部有一个OP_TOPIC，此时可以写一条rollback OP记录到这个Topic里，标记某个half消息是rollback了，如下图。
![](../youdaonote-images/Pasted%20image%2020231015225315.png)

> 假设你一直没有执行commit/rollback，RocketMQ会回调订单系统的接口去判断half消息的状态，但是他**最多就是回调15次**，如果15次之后你都没法告知他half消息的状态，就自动把消息标记为rollback。

5. 执行commit操作之后，RocketMQ就会在OP_TOPIC里写入一条记录，标记half消息已经是commit状态了。接着需要把放在RMQ_SYS_TRANS_HALF_TOPIC中的half消息给写入到OrderPaySuccessTopic的ConsumeQueue里去，然后我们的红包系统可以就可以看到这条消息进行消费了，如下图。
![](../youdaonote-images/Pasted%20image%2020231015225529.png)

## 4. 同步发送消息 + 反复多次重试方式的利弊
**kafka是采用同步发送消息 + 反复多次重试方式**。
使用这种方式的弊端有：
1. 订单事务执行成功，结果消息没发送出去，redis es没法回退。
2. 多次重试耗费时间。

> 业内最佳的方案还是用基于RocketMQ的事务消息机制。


## 5. Broker消息零丢失方案：同步刷盘 + Raft协议主从同步

如果一定要确保数据零丢失的话，可以调整MQ的刷盘策略，我们需要调整broker的配置文件，将其中的flushDiskType配置设置为：SYNC_FLUSH，默认他的值是ASYNC_FLUSH，即默认是异步刷盘的。

- Broker的刷盘策略调整为同步刷盘，那么绝对不会因为机器宕机而丢失数据
- 采用了主从架构的Broker集群，那么一条消息写入成功，就意味着多个Broker机器都写入了，此时任何一台机器的磁盘故障，数据也是不会丢失的。
## 6. Consumer消息零丢失方案：手动提交offset + 自动故障转移

1. 在回调函数中处理完所有流程再返回处理完成。
2. 当你某个机器正在处理宕机，会让该集群中的其他机器继续处理没处理过的。

![](../youdaonote-images/Pasted%20image%2020231016004529.png)

![](../youdaonote-images/Pasted%20image%2020231016004519.png)

