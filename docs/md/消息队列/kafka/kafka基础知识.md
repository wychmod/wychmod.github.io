# 1. Kafka 概述

## 1.1 定义
- **Kafka传统定义**：Kafka是一个分布式的基于发布/订阅模式的消息队列（Message Queue），主要应用于大数据实时处理领域。
- **Kafka最新定义** ： Kafka是 一个开源的 分 布式事件流平台 （Event Streaming Platform），被数千家公司用于高性能数据管道、流分析、数据集成和关键任务应用。

> 在大数据场景主要采用 Kafka 作为消息队列。在 JavaEE 开发中主要采用 ActiveMQ、RabbitMQ、RocketMQ。

## 1.2 传统消息队列的应用场景
- 消息队列的应用场景——缓冲/消峰
	- 缓冲/消峰：有助于控制和优化数据流经过系统的速度，解决生产消息和消费消息的处理速度不一致的情况。
- 消息队列的应用场景——解耦
	- 解耦：允许你独立的扩展或修改两边的处理过程，只要确保它们遵守同样的接口约束。
![](../../youdaonote-images/Pasted%20image%2020231003120330.png)

![](../../youdaonote-images/Pasted%20image%2020231003120345.png)

## 1.3 消息队列的两种方式

1. 点对点模式
	- 消费者主动拉取数据，消息收到后清除消息
2. 发布/订阅模式
	- 可以有多个topic主题（浏览、点赞、收藏、评论等）
	- 消费者消费数据之后，不删除数据
	- 每个消费者相互独立，都可以消费到数据

![](../../youdaonote-images/Pasted%20image%2020231003120542.png)

![](../../youdaonote-images/Pasted%20image%2020231003120557.png)

## 1.4 Kafka 基础架构

1. 为方便扩展，并提高吞吐量，一个topic分为多个partition
2. 配合分区的设计，提出消费者组的概念，组内每个消费者并行消费
3. 为提高可用性，为每个partition增加若干副本，类似NameNode HA
4. ZK中记录谁是leader,Kafka2.8.0以后也可以配置不采用ZK

**相关名词解释**：

（1）Producer：消息生产者，就是向 Kafka broker 发消息的客户端。

（2）Consumer：消息消费者，向 Kafka broker 取消息的客户端。

（3）Consumer Group（CG）：消费者组，由多个 consumer 组成。消费者组内每个消费者负责消费不同分区的数据，一个分区只能由一个组内消费者消费；消费者组之间互不影响。所有的消费者都属于某个消费者组，即消费者组是逻辑上的一个订阅者。

（4）Broker：一台 Kafka 服务器就是一个 broker。一个集群由多个 broker 组成。一个broker 可以容纳多个 topic。

（5）Topic：可以理解为一个队列，生产者和消费者面向的都是一个 topic。

（6）Partition：为了实现扩展性，一个非常大的 topic 可以分布到多个 broker（即服务器）上，一个 topic 可以分为多个 partition，每个 partition 是一个有序的队列。

（7）Replica：副本。一个 topic 的每个分区都有若干个副本，一个 Leader 和若干个Follower。

（8）Leader：每个分区多个副本的“主”，生产者发送数据的对象，以及消费者消费数据的对象都是 Leader。

（9）Follower：每个分区多个副本中的“从”，实时从 Leader 中同步数据，保持和Leader 数据的同步。Leader 发生故障时，某个 Follower 会成为新的 Leader。

