# 1. Zookeeper入门

## 1.1 概述

Zookeeper 是一个开源的分布式的，为分布式框架提供协调服务的 Apache 项目。

Zookeeper从设计模式角度来理解：是一个**基于观察者模式设计**的分布式服务管理框架，它负责存储和管理大家都关心的数据，然 后接受观察者的注册，一旦这些数据的状态发生变化，Zookeeper就将负责通知已经在Zookeeper上注册的那些观察者做出相应的反应。

## 1.2 特点

![](../youdaonote-images/Pasted%20image%2020231005000635.png)

1. Zookeeper：一个领导者（Leader），多个跟随者（Follower）组成的集群。
2. 集群中只要有半数以上节点存活，Zookeeper集群就能正常服务。所以Zookeeper适合安装奇数台服务器。
3. 全局数据一致：每个Server保存一份相同的数据副本，Client无论连接到哪个Server，数据都是一致的。
4. 更新请求顺序执行，来自同一个Client的更新请求按其发送顺序依次执行。
5. 数据更新原子性，一次数据更新要么成功，要么失败。
6. 实时性，在一定时间范围内，Client能读到最新数据。

## 1.3 数据结构

ZooKeeper 数据模型的结构与 Unix 文件系统很类似，整体上可以看作是一棵树，每个节点称做一个 ZNode。每一个 ZNode 默认能够存储 1MB 的数据，每个 ZNode 都可以通过其路径唯一标识。

![](../youdaonote-images/Pasted%20image%2020231005000828.png)

## 1.4 应用场景
### 1.4.1 统一命名服务

在分布式环境下，经常需要对应用/服务进行统一命名，便于识别。例如：IP不容易记住，而域名容易记住。

![](../youdaonote-images/Pasted%20image%2020231005001000.png)

### 1.4.2 统一配置/集群管理

1. 分布式环境下，配置文件同步非常常见。
	1. 一般要求一个集群中，所有节点的配置信息是一致的，比如 Kafka 集群。
	2. 对配置文件修改后，希望能够快速同步到各个节点上。
2. 配置管理可交由ZooKeeper实现。
	1. 可将配置信息写入ZooKeeper上的一个Znode。
	2. 各个客户端服务器监听这个Znode。
	3. 一旦Znode中的数据被修改，ZooKeeper将通知各个客户端服务器。

![](../youdaonote-images/Pasted%20image%2020231005001229.png)

### 1.4.3 服务器动态上下线

![](../youdaonote-images/Pasted%20image%2020231005001509.png)

### 1.4.4 软负载均衡

![](../youdaonote-images/Pasted%20image%2020231005001822.png)


## 1.5 下载地址

https://zookeeper.apache.org/

## 2. 本地安装

## 2.1 本地模式安装

1. 安装前准备
	1. 安装 JDK
	2. 拷贝 apache-zookeeper-3.5.7-bin.tar.gz 安装包到 Linux 系统下
	3. 解压到指定目录
```bash
tar -zxvf apache-zookeeper-3.5.7-bin.tar.gz -C /opt/module/
mv apache-zookeeper-3.5.7 zookeeper-3.5.7
```
2. 配置修改
	1. 将/opt/module/zookeeper-3.5.7/conf 这个路径下的 zoo_sample.cfg 修改为 zoo.cfg；
	2. 打开 zoo.cfg 文件，修改 dataDir 路径：
	3. 在/opt/module/zookeeper-3.5.7/这个目录上创建 zkData 文件夹
```bash
dataDir=/opt/module/zookeeper-3.5.7/zkData
mkdir zkData
```
3. 操作 Zookeeper
	1. 启动 Zookeeper
	2. 查看进程是否启动
	3. 查看状态
	4. 启动客户端
	5. 退出客户端：
	6. 停止 Zookeeper
```bash
./zkServer.sh start
jps
./zkServer.sh status
./zkCli.sh
quit
./zkServer.sh stop
```

## 2.2 配置参数解读

Zookeeper中的配置文件zoo.cfg中参数含义解读如下：

1. tickTime = 2000：通信心跳时间，Zookeeper服务器与客户端心跳时间，单位毫秒
2. initLimit = 10：LF初始通信时限