# 1. 算法基础
**Zookeeper 是如何保证数据一致性的？**
## 1.1 拜占庭将军问题

拜占庭将军问题是一个协议问题，拜占庭帝国军队的将军们必须全体一致的决定是否攻击某一支敌军。问题是这些将军在地理上是分隔开来的，并且将军中存在叛徒。叛徒可以任意行动以达到以下目标：**欺骗某些将军采取进攻行动；促成一个不是所有将军都同意的决定，如当将军们不希望进攻时促成进攻行动；或者迷惑某些将军，使他们无法做出决定**。如果叛徒达到了这目的之一，则任何攻击行动的结果都是注定要失败的，只有完全达成致的努力才能获得胜利。

## 1.2 Paxos算法
**Paxos算法**：一种基于消息传递且具有高度容错特性的一致性算法。

**Paxos算法解决的问题**：就是如何快速正确的在一个分布式系统中对某个数据值达成一致，并且保证不论发生任何异常，都不会破坏整个系统的一致性。

**Paxos算法描述**：
- 在一个Paxos系统中，首先将所有节点划分为Proposer（提议者），Acceptor（接受者），和Learner（学习者）。（注意：每个节点都可以身兼数职）。
- 一个完整的Paxos算法流程分为三个阶段：
	- Prepare准备阶段
		- Proposer向多个Acceptor发出Propose请求Promise（承诺）
		- Acceptor针对收到的Propose请求进行Promise（承诺）
	- Accept接受阶段
		- Proposer收到多数Acceptor承诺的Promise后，向Acceptor发出Propose请求
		- Acceptor针对收到的Propose请求进行Accept处理
	- Learn学习阶段：Proposer将形成的决议发送给所有Learners

**Paxos算法流程**:
![](../youdaonote-images/Pasted%20image%2020231005172809.png)

1. Prepare: Proposer生成全局唯一且递增的Proposal ID，向所有Acceptor发送Propose请求，这里无需携带提案内容，只携带Proposal ID即可
2. Promise: Acceptor收到Propose请求后，做出“两个承诺，一个应答”。
	1. 不再接受Proposal ID小于等于（注意：这里是<= ）当前请求的Propose请求。
	2. 不再接受Proposal ID小于（注意：这里是< ）当前请求的Accept请求。
	3. 不违背以前做出的承诺下，回复已经Accept过的提案中Proposal ID最大的那个提案的Value和Proposal ID，没有则返回空值。
3. Propose: Proposer收到多数Acceptor的Promise应答后，从应答中选择Proposal ID最大的提案的Value，作为本次要发起的提案。如果所有应答的提案Value均为空值，则可以自己随意决定提案Value。然后携带当前Proposal ID，向所有Acceptor发送Propose请求。
4. Accept: Acceptor收到Propose请求后，在不违背自己之前做出的承诺下，接受并持久化当前Proposal ID和提案Value。
5. Learn: Proposer收到多数Acceptor的Accept后，决议形成，将形成的决议发送给所有Learner。

**情况1**
- 有A1, A2, A3, A4, A5 5位议员，就税率问题进行决议。
![](../youdaonote-images/Pasted%20image%2020231005173329.png)

- A1发起1号Proposal的Propose，等待Promise承诺；
- A2-A5回应Promise；
- A1在收到两份回复时就会发起税率10%的Proposal；
- A2-A5回应Accept；
- 通过Proposal，税率10%。

**情况2**

- 现在我们假设在A1提出提案的同时, A5决定将税率定为20%
![](../youdaonote-images/Pasted%20image%2020231005173730.png)

- A1，A5同时发起Propose（序号分别为1，2）
- A2承诺A1，A4承诺A5，A3行为成为关键
- 情况1：A3先收到A1消息，承诺A1。
	- A1发起Proposal（1，10%），A2，A3接受。
	- 之后A3又收到A5消息，回复A1：（1，10%），并承诺A5。
	- A5发起Proposal（2，20%），A3，A4接受。之后A1，A5同时广播决议。
- 情况2：A3先收到A1消息，承诺A1。之后立刻收到A5消息，承诺A5。
	- A1发起Proposal（1，10%），无足够响应，A1重新Propose （序号3），A3再次承诺A1。
	- A5发起Proposal（2，20%），无足够相应。 A5重新Propose （序号4），A3再次承诺A5。
	- ......

> 造成这种情况的原因是系统中有一个以上的 Proposer，多个 Proposers 相互争夺 Acceptor，造成迟迟无法达成一致的情况。**针对这种情况，一种改进的 Paxos 法被提出：从系统中选出一个节点作为 Leader，只有 Leader 能够发起提案。** 这样，一次Paxos 流程中只有一个Proposer，不会出现活锁的情况


## 1.3 ZAB 协议

### 1.3.1 什么是 ZAB 算法

Zab 借鉴了 Paxos 算法，是特别为 Zookeeper 设计的支持崩溃恢复的原子广播协议。基于该协议，Zookeeper 设计为只有一台客户端（Leader）负责处理外部的写事务请求，然后Leader 客户端将数据同步到其他 Follower 节点。即 Zookeeper 只有一个 Leader 可以发起提案。

### 1.3.2 Zab 协议内容

Zab 协议包括两种基本的模式：消息广播、崩溃恢复。

1. **消息广播**
![](../youdaonote-images/Pasted%20image%2020231005182417.png)

1. 客户端发起一个写操作请求。
2. Leader服务器将客户端的请求转化为事务Proposal 提案，同时为每个Proposal 分配一个全局的ID，即zxid。
3. Leader服务器为每个Follower服务器分配一个单独的队列，然后将需要广播的 Proposal依次放到队列中去，并且根据FIFO策略进行消息发送。
4. Follower接收到Proposal后，会首先将其以事务日志的方式写入本地磁盘中，写入成功后向Leader反馈一个Ack响应消息。
5. Leader接收到超过半数以上Follower的Ack响应消息后，即认为消息发送成功，可以发送commit消息。
6. Leader向所有Follower广播commit消息，同时自身也会完成事务提交。Follower 接收到commit消息后，会将上一条事务提交。
7. Zookeeper采用Zab协议的核心，就是只要有一台服务器提交了Proposal，就要确保所有的服务器最终都能正确提交Proposal。

> ZAB协议针对事务请求的处理过程类似于一个两阶段提交过程（1）广播事务阶段（2）广播提交操作。

这两阶段提交模型如下，有可能因为Leader宕机带来数据不一致，比如
（ 1 ） Leader发起一个事务Proposal1 后 就 宕 机 ， Follower 都没有Proposal1
（2）Leader收到半数ACK宕机，没来得及向Follower发送Commit

2. **崩溃恢复——异常假设**
一旦Leader服务器出现崩溃或者由于网络原因导致Leader服务器失去了与过半 Follower的联系，那么就会进入**崩溃恢复模式**。

1. 假设两种服务器异常情况：
	1. 假设一个事务在Leader提出之后，Leader挂了。
	2. 一个事务在Leader上提交了，并且过半的Follower都响应Ack了，但是Leader在Commit消息发出之前挂了。
2. Zab协议崩溃恢复要求满足以下两个要求：
	1. 确保已经被Leader提交的提案Proposal，必须最终被所有的Follower服务器提交。 （已经产生的提案，Follower必须执行）
	2. 确保丢弃已经被Leader提出的，但是没有被提交的Proposal。（丢弃胎死腹中的提案）

3. **崩溃恢复——Leader选举**
崩溃恢复主要包括两部分：**Leader选举和数据恢复。**

**Leader选举**：根据上述要求，Zab协议需要保证选举出来的Leader需要满足以下条件：
	1. 新选举出来的Leader不能包含未提交的Proposal。即新Leader必须都是已经提交了Proposal的Follower服务器节点。
	2. 新选举的Leader节点中含有最大的zxid。这样做的好处是可以避免Leader服务器检查Proposal的提交和丢弃工作。
4. **崩溃恢复——数据恢复**
**Zab如何数据同步**：
	1. 完成Leader选举后，在正式开始工作之前（接收事务请求，然后提出新的Proposal），**Leader服务器会首先确认事务日志中的所有的Proposal 是否已经被集群中过半的服务器Commit。**
	2. Leader服务器需要确保所有的Follower服务器能够接收到每一条事务的Proposal，并且能将所有已经提交的事务Proposal应用到内存数据中。**等到Follower将所有尚未同步的事务Proposal都从Leader服务器上同步过，且应用到内存数据中以后，Leader才会把该Follower加入到真正可用的Follower列表中**。

4. **崩溃恢复——异常提案处理**

**Zab数据同步过程中，如何处理需要丢弃的Proposal**？

1. 在Zab的事务编号zxid设计中，zxid是一个64位的数字。其中低32位可以看成一个简单的单增计数器，针对客户端每一个事务请求，Leader在产生新的Proposal事务时，都会对该计数器加1。而高32位则代表了Leader周期的epoch编号。

2. epoch编号可以理解为当前集群所处的年代，或者周期。每次Leader变更之后都会在 epoch的基础上加1，这样旧的Leader崩溃恢复之后，其他Follower也不会听它的了，因为 Follower只服从epoch最高的Leader命令。
3. 每当选举产生一个新的 Leader，就会从这个Leader服务器上取出本地事务日志充最大编号Proposal的zxid，并从zxid中解析得到对应的epoch编号，然后再对其加1，之后该编号就作为新的epoch 值，并将低32位数字归零，由0开始重新生成zxid。
4. Zab协议通过epoch编号来区分Leader变化周期，能够有效避免不同的Leader错误的使用了相同的zxid编号提出了不一样的Proposal的异常情况。

> 基于以上策略，当一个包含了上一个Leader周期中尚未提交过的事务Proposal的服务器启动时，当这台机器加入集群中，以Follower角色连上Leader服务器后，Leader 服务器会根据自己服务器上最后提交的 Proposal来和Follower服务器的Proposal进行比对，比对的结果肯定是Leader要求Follower进行一个回退操作，回退到一个确实已经被集群中过半机器Commit的最新Proposal。


## 1.4 ZooKeeper保证的是CP
1. ZooKeeper不能保证每次服务请求的可用性。
2. 进行Leader选举时集群都是不可用。

# 2. 源码解析

## 2.1 持久化源码

在 org.apache.zookeeper.server.persistence 包下的相关类都是序列化相关的代码。
![](../youdaonote-images/Pasted%20image%2020231005184416.png)

## 2.2 序列化源码
zookeeper-jute 代码是关于 Zookeeper 序列化相关源码
![](../youdaonote-images/Pasted%20image%2020231005184449.png)

## 2.3 ZK服务端初始化源码解析
![](../youdaonote-images/Pasted%20image%2020231005184524.png)

![](../youdaonote-images/Pasted%20image%2020231005184612.png)

![](../youdaonote-images/Pasted%20image%2020231005184623.png)