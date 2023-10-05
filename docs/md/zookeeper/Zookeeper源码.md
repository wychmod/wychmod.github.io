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