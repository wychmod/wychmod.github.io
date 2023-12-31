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
	Leader和Follower初始连接时能容忍的最多心跳数（tickTime的数量）
3. syncLimit = 5：LF同步通信时限
	Leader和Follower之间通信时间如果超过syncLimit * tickTime，Leader认为Follwer死掉，从服务器列表中删除Follwer。
4. dataDir：保存Zookeeper中的数据(默认tmp目录会被定期删除)
5. clientPort = 2181：客户端连接端口，通常不做修改。

# 3. 集群操作

## 3.1 集群操作

### 3.1.1 集群安装

1. 大部分步骤和单机安装一样。
2. 在/opt/module/zookeeper-3.5.7/zkData 目录下创建一个 myid 的文件。
3. 配置zoo.cfg文件
```bash
server.2=hadoop102:2888:3888
server.3=hadoop103:2888:3888
server.4=hadoop104:2888:3888
```
server.A=B:C:D。

**A 是一个数字，表示这个是第几号服务器**；集群模式下配置一个文件 myid，这个文件在 dataDir 目录下，这个文件里面有一个数据就是 A 的值，Zookeeper 启动时读取此文件，拿到里面的数据与 zoo.cfg 里面的配置信息比较从而判断到底是哪个 server。
**B 是这个服务器的地址**；
**C 是这个服务器 Follower 与集群中的 Leader 服务器交换信息的端口**；
D 是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的Leader，而这个端口就是用来执行选举时服务器相互通信的端口。
4. 集群启动
```bash
# 三台机子都启动
./zkServer.sh start
./zkServer.sh start
./zkServer.sh start
```

## 3.2 选举机制

### 3.2.1 第一次选举

![](../youdaonote-images/Pasted%20image%2020231005122422.png)

- **SID**：**服务器ID**。用来唯一标识一台ZooKeeper集群中的机器，每台机器不能重复，**和myid一致**。
- **ZXID**：事务ID。**ZXID是一个事务ID，用来标识一次服务器状态的变更**。在某一时刻，集群中的每台机器的ZXID值不一定完全一致，这和ZooKeeper服务器对于客户端“更新请求”的处理逻辑有关。
- **Epoch**：**每个Leader任期的代号**。没有Leader时同一轮投票过程中的逻辑时钟值是相同的。每投完一次票这个数据就会增加.

1. 服务器1启动，发起一次选举。服务器1投自己一票。此时服务器1票数一票，不够半数以上(3票)，选举无法完成，服务器1状态保持为LOOKING;
2. 服务器2启动，再发起一次选举。服务器1和2分别投自己一票并交换选票信息：此时服务器1发现服务器2的myid比自己目前投票推举的（服务器1）大，更改选票为推举服务器2。此时服务器1票数0票，服务器2票数2票，没有半数以上结果，选举无法完成，服务器1,2状态保持LOOKING
3. 服务器3启动，发起一次选举。此时服务器1和2都会更改选票为服务器3。此次投票结果：服务器1为0票，服务器2为0票，服务器3为3票。此时服务器3的票数已经超过半数，服务器3当选Leader。服务器1,2更改状态为FOLLOWING,服务器3更改状态为LEADING;
4. 服务器4启动，发起一次选举。此时服务器1,2,3已经不是LOOKING状态，不会更改选票信息。交换选票信息结果：服务器3为3票，服务器4为1票。此时服务器4服从多数，更改选票信息为服务器3，并更改状态为FOLLOWING:
5. 服务器5同4。


### 3.2.2 非第一次选举
![](../youdaonote-images/Pasted%20image%2020231005140132.png)

1. 当ZooKeeper集群中的一台服务器出现以下两种情况之一时，就会开始进入Leader选举：
	- 服务器初始化启动。
	- 服务器运行期间无法和Leader保持连接。
2. 当一台机器进入Leader选举流程时，当前集群也可能会处于以下两种状态：
	- 集群中本来就已经存在一个Leader。
		对于第一种已经存在Leader的情况，机器试图去选举Leader时，会被告知当前服务器的Leader信息，对于该机器来说，仅仅需要和Leader机器建立连接，并进行状态同步即可。
	- 集群中确实不存在Leader。
		假设ZooKeeper由5台服务器组成，SID分别为1、2、3、4、5，ZXID分别为8、8、8、7、7，并且此时SID为3的服务器是Leader。某一时刻，3和5服务器出现故障，因此开始进行Leader选举。
		SID为1、2、4的机器投票情况： （1，8，1） （1，8，2） （1，7，4） (EPOCH，ZXID，SID)

**选举Leader规则： ①EPOCH大的直接胜出 ②EPOCH相同，事务id大的胜出 ③事务id相同，服务器id大的胜出**

## 3.3 启动停止脚本

```bash
#!/bin/bash
case $1 in
"start"){
for i in hadoop102 hadoop103 hadoop104
do
 echo ---------- zookeeper $i 启动 ------------
ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh 
start"
done
};;
"stop"){
for i in hadoop102 hadoop103 hadoop104
do
 echo ---------- zookeeper $i 停止 ------------ 
ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh 
stop"
done
};;
"status"){
for i in hadoop102 hadoop103 hadoop104
do
 echo ---------- zookeeper $i 状态 ------------ 
ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh 
status"
done
};;
esac


chmod u+x zk.sh
zk.sh start
zk.sh stop
```

## 3.4 客户端命令操作
```bash
# 启动客户端
./zkCli.sh -server hadoop102:2181

# 显示所有操作命令
help

# 查看当前znode中包含内容
ls /

# 查看当前节点详细数据
ls -s /

ctime = Thu Jan 01 08:00:00 CST 1970
mZxid = 0x0
mtime = Thu Jan 01 08:00:00 CST 1970
pZxid = 0x0
cversion = -1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 0
numChildren = 1
```

1. czxid：创建节点的事务 zxid
2. ctime：znode 被创建的毫秒数（从 1970 年开始）
3. mzxid：znode 最后更新的事务 zxid
4. mtime：znode 最后修改的毫秒数（从 1970 年开始）
5. pZxid：znode 最后更新的子节点 zxid
6. cversion：znode 子节点变化号，znode 子节点修改次数
7. dataversion：znode 数据变化号
8. aclVersion：znode 访问控制列表的变化号
9. ephemeralOwner：如果是临时节点，这个是 znode 拥有者的 session id。如果不是临时节点则是 0。
10. dataLength：znode 的数据长度
11. numChildren：znode 子节点数量

## 3.5 节点类型（持久/短暂/有序号/无序号）

- 持久（Persistent）：客户端和服务器端断开连接后，创建的节点不删除
- 短暂（Ephemeral）：客户端和服务器端断开连接后，创建的节点自己删除
- 有序号: 创建znode时设置顺序标识，znode名称后会附加一个值，顺序号是一个单调递增的计数器，由父节点维护。
> 注意：在分布式系统中，顺序号可以被用于为所有的事件进行全局排序，这样客户端可以通过顺序号推断事件的顺序

```bash
# 创建两个普通节点（永久节点 + 不带序号）

create /sanguo "diaochan"
create /sanguo/shuguo "liubei"

# 获得节点的值
get -s /sanguo

# 创建带序号的节点（永久节点 + 带序号）
create -s /sanguo/weiguo/zhangliao "zhangliao"
Created /sanguo/weiguo/zhangliao0000000000

# 创建短暂节点（短暂节点 + 不带序号 or 带序号）
# 创建短暂的不带序号的节点
create -e /sanguo/wuguo "zhouyu"

# 创建短暂的带序号的节点
create -e -s /sanguo/wuguo "zhouyu"

```

## 3.6 监听器原理
1. 监听原理详解 
	1. 首先要有一个main()线程
	2. 在main线程中创建Zookeeper客户端，这时就会创建两个线程，一个负责网络连接通信（connet），一个负责监听（listener）。
	3. 通过connect线程将注册的监听事件发送给Zookeeper。
	4. 在Zookeeper的注册监听器列表中将注册的监听事件添加到列表中。
	5. Zookeeper监听到有数据或路径变化，就会将这个消息发送给listener线程。
	6. listener线程内部调用了process()方法。

2. 常见的监听
	1. 监听节点数据变化 get path [watch]
	2. 监听子节点增减变化 ls path [watch]

![](../youdaonote-images/Pasted%20image%2020231005145901.png)

```bash
# 节点的值变化监听
get -w /sanguo

# 节点的子节点变化监听（路径变化）
ls -w /sanguo
```

> 注册一次，生效一次。想多次生效，就需要多次注册。

## 3.7 节点删除

```bash
delete /sanguo/jin

deleteall /sanguo/shuguo

stat /sanguo
```


## 3.8 客户端API操作

### 3.8.1 IDEA环境

```xml
<dependency>  
    <groupId>junit</groupId>  
    <artifactId>junit</artifactId>  
    <version>RELEASE</version>  
</dependency>  
  
<dependency>  
    <groupId>org.apache.logging.log4j</groupId>  
    <artifactId>log4j-core</artifactId>  
    <version>2.8.2</version>  
</dependency>  
  
<dependency>  
    <groupId>org.apache.zookeeper</groupId>  
    <artifactId>zookeeper</artifactId>  
    <version>3.5.7</version>  
</dependency>
```

log4j.properties
```properties
log4j.rootLogger=INFO, stdout  log4j.appender.stdout=org.apache.log4j.ConsoleAppender  log4j.appender.stdout.layout=org.apache.log4j.PatternLayout  log4j.appender.stdout.layout.ConversionPattern=%d %p [%c] - %m%n  log4j.appender.logfile=org.apache.log4j.FileAppender  log4j.appender.logfile.File=target/spring.log  log4j.appender.logfile.layout=org.apache.log4j.PatternLayout  log4j.appender.logfile.layout.ConversionPattern=%d %p [%c] - %m%n
```

### 3.8.2 创建客户端

```java
// 注意：逗号左右不能有空格  
    private String connectString = "hadoop102:2181,hadoop103:2181,hadoop104:2181";  
    private int sessionTimeout = 2000;  
    private ZooKeeper zkClient;  
  
    @Before  
    public void init() throws IOException {  
  
        zkClient = new ZooKeeper(connectString, sessionTimeout, new Watcher() {  
            @Override  
            public void process(WatchedEvent watchedEvent) {  
  
//                System.out.println("-------------------------------");  
//                List<String> children = null;  
//                try {  
//                    children = zkClient.getChildren("/", true);  
//  
//                    for (String child : children) {  
//                        System.out.println(child);  
//                    }  
//  
//                    System.out.println("-------------------------------");  
//                } catch (KeeperException e) {  
//                    e.printStackTrace();  
//                } catch (InterruptedException e) {  
//                    e.printStackTrace();  
//                }  
            }  
        });  
    }  

	// 创建子节点
    @Test  
    public void create() throws KeeperException, InterruptedException {  
        String nodeCreated = zkClient.create("/atguigu", "ss.avi".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);  
    }  
	// 获取子节点并监听变化
    @Test  
    public void getChildren() throws KeeperException, InterruptedException {  
        List<String> children = zkClient.getChildren("/", true);  
  
        for (String child : children) {  
            System.out.println(child);  
        }  
  
        // 延时  
        Thread.sleep(Long.MAX_VALUE);  
    }  

	// 判断Znode是否存在
    @Test  
    public void exist() throws KeeperException, InterruptedException {  
  
        Stat stat = zkClient.exists("/atguigu", false);  
  
        System.out.println(stat==null? "not exist " : "exist");  
    }
```

## 3.9 客户端向服务端写数据流程

**写流程之写入请求直接发送给Leader节点**
![](../youdaonote-images/Pasted%20image%2020231005153413.png)

**写流程之写入请求发送给follower节点**
![](../youdaonote-images/Pasted%20image%2020231005153438.png)

# 4. 服务器动态上下线监听案例

## 4.1 需求
某分布式系统中，主节点可以有多台，可以动态上下线，任意一台客户端都能实时感知到主节点服务器的上下线。

![](../youdaonote-images/Pasted%20image%2020231005153558.png)

## 4.2 具体实现

服务端代码：
```java
public class DistributeServer {  
  
    private String connectString = "hadoop102:2181,hadoop103:2181,hadoop104:2181";  
    private int sessionTimeout = 2000;  
    private ZooKeeper zk;  
  
    public static void main(String[] args) throws IOException, KeeperException, InterruptedException {  
  
        DistributeServer server = new DistributeServer();  
        // 1 获取zk连接  
        server.getConnect();  
  
        // 2 注册服务器到zk集群  
        server.regist(args[0]);  
  
  
        // 3 启动业务逻辑（睡觉）  
        server.business();  
  
    }  
  
    private void business() throws InterruptedException {  
        Thread.sleep(Long.MAX_VALUE);  
    }  
  
    private void regist(String hostname) throws KeeperException, InterruptedException {  
        String create = zk.create("/servers/"+hostname, hostname.getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);  
  
        System.out.println(hostname +" is online") ;  
    }  
  
    private void getConnect() throws IOException {  
  
        zk = new ZooKeeper(connectString, sessionTimeout, new Watcher() {  
            @Override  
            public void process(WatchedEvent watchedEvent) {  
  
            }        });  
    }  
}
```

客户端代码：
```java
public class DistributeClient {  
  
    private String connectString = "hadoop102:2181,hadoop103:2181,hadoop104:2181";  
    private int sessionTimeout = 2000;  
    private ZooKeeper zk;  
  
    public static void main(String[] args) throws IOException, KeeperException, InterruptedException {  
        DistributeClient client = new DistributeClient();  
  
        // 1 获取zk连接  
        client.getConnect();  
  
        // 2 监听/servers下面子节点的增加和删除  
        client.getServerList();  
  
        // 3 业务逻辑（睡觉）  
        client.business();  
  
    }  
  
    private void business() throws InterruptedException {  
        Thread.sleep(Long.MAX_VALUE);  
    }  
  
    private void getServerList() throws KeeperException, InterruptedException {  
        List<String> children = zk.getChildren("/servers", true);  
  
        ArrayList<String> servers = new ArrayList<>();  
  
        for (String child : children) {  
  
            byte[] data = zk.getData("/servers/" + child, false, null);  
  
            servers.add(new String(data));  
        }  
  
        // 打印  
        System.out.println(servers);  
    }  
  
    private void getConnect() throws IOException {  
        zk = new ZooKeeper(connectString, sessionTimeout, new Watcher() {  
            @Override  
            public void process(WatchedEvent watchedEvent) {  
  
                try {  
                    getServerList();  
                } catch (KeeperException e) {  
                    e.printStackTrace();  
                } catch (InterruptedException e) {  
                    e.printStackTrace();  
                }  
            }        });  
    }  
}
```

# 5. ZooKeeper 分布式锁案例

![](../youdaonote-images/Pasted%20image%2020231005154936.png)

## 5.1 原生Zookeeper实现分布式锁

1. 分布式锁实现
```java
public class DistributedLock {  
  
    private final String connectString = "hadoop102:2181,hadoop103:2181,hadoop104:2181";  
    private final int sessionTimeout = 2000;  
    private final ZooKeeper zk;  
  
    private CountDownLatch connectLatch = new CountDownLatch(1);  
    private CountDownLatch waitLatch = new CountDownLatch(1);  
  
    private String waitPath;  
    private String currentMode;  
  
    public DistributedLock() throws IOException, InterruptedException, KeeperException {  
  
        // 获取连接  
        zk = new ZooKeeper(connectString, sessionTimeout, new Watcher() {  
            @Override  
            public void process(WatchedEvent watchedEvent) {  
                // connectLatch  如果连接上zk  可以释放  
                if (watchedEvent.getState() == Event.KeeperState.SyncConnected){  
                    connectLatch.countDown();  
                }  
  
                // waitLatch  需要释放  
                if (watchedEvent.getType()== Event.EventType.NodeDeleted && watchedEvent.getPath().equals(waitPath)){  
                    waitLatch.countDown();  
                }  
            }        });  
  
        // 等待zk正常连接后，往下走程序  
        connectLatch.await();  
  
        // 判断根节点/locks是否存在  
        Stat stat = zk.exists("/locks", false);  
  
        if (stat == null) {  
            // 创建一下根节点  
            zk.create("/locks", "locks".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);  
        }  
    }  
    // 对zk加锁  
    public void zklock() {  
        // 创建对应的临时带序号节点  
        try {  
            currentMode = zk.create("/locks/" + "seq-", null, ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);  
  
            // wait一小会, 让结果更清晰一些  
            Thread.sleep(10);  
  
            // 判断创建的节点是否是最小的序号节点，如果是获取到锁；如果不是，监听他序号前一个节点  
  
            List<String> children = zk.getChildren("/locks", false);  
  
            // 如果children 只有一个值，那就直接获取锁； 如果有多个节点，需要判断，谁最小  
            if (children.size() == 1) {  
                return;  
            } else {  
                Collections.sort(children);  
  
                // 获取节点名称 seq-00000000                String thisNode = currentMode.substring("/locks/".length());  
                // 通过seq-00000000获取该节点在children集合的位置  
                int index = children.indexOf(thisNode);  
  
                // 判断  
                if (index == -1) {  
                    System.out.println("数据异常");  
                } else if (index == 0) {  
                    // 就一个节点，可以获取锁了  
                    return;  
                } else {  
                    // 需要监听  他前一个节点变化  
                    waitPath = "/locks/" + children.get(index - 1);  
                    zk.getData(waitPath,true,new Stat());  
  
                    // 等待监听  
                    waitLatch.await();  
  
                    return;  
                }  
            }  
  
        } catch (KeeperException e) {  
            e.printStackTrace();  
        } catch (InterruptedException e) {  
            e.printStackTrace();  
        }  
  
  
    }  
    // 解锁  
    public void unZkLock() {  
  
        // 删除节点  
        try {  
            zk.delete(this.currentMode,-1);  
        } catch (InterruptedException e) {  
            e.printStackTrace();  
        } catch (KeeperException e) {  
            e.printStackTrace();  
        }  
  
    }  
}
```

2. 分布式锁测试
```java
public class DistributedLockTest {  
  
    public static void main(String[] args) throws InterruptedException, IOException, KeeperException {  
  
       final  DistributedLock lock1 = new DistributedLock();  
  
        final  DistributedLock lock2 = new DistributedLock();  
  
       new Thread(new Runnable() {  
           @Override           public void run() {  
               try {  
                   lock1.zklock();                   System.out.println("线程1 启动，获取到锁");  
                   Thread.sleep(5 * 1000);  
  
                   lock1.unZkLock();                   System.out.println("线程1 释放锁");  
               } catch (InterruptedException e) {  
                   e.printStackTrace();               }           }       }).start();  
  
        new Thread(new Runnable() {  
            @Override            public void run() {  
  
                try {  
                    lock2.zklock();                    System.out.println("线程2 启动，获取到锁");  
                    Thread.sleep(5 * 1000);  
  
                    lock2.unZkLock();                    System.out.println("线程2 释放锁");  
                } catch (InterruptedException e) {  
                    e.printStackTrace();                }            }        }).start();  
  
    }  
}
```

## 5.2 Curator 框架实现分布式锁案例

1. 原生的 Java API 开发存在的问题
	1. 会话连接是异步的，需要自己去处理。比如使用 CountDownLatch
	2. Watch 需要重复注册，不然就不能生效
	3. 开发的复杂性还是比较高的
	4. 不支持多节点删除和创建。需要自己去递归
2. Curator 是一个专门解决分布式锁的框架，解决了原生 JavaAPI 开发分布式遇到的问题。
	1. 详情请查看官方文档：https://curator.apache.org/index.html
3. 实例操作
```xml
<dependency>  
    <groupId>org.apache.curator</groupId>  
    <artifactId>curator-framework</artifactId>  
    <version>4.3.0</version>  
</dependency>  
<dependency>  
    <groupId>org.apache.curator</groupId>  
    <artifactId>curator-recipes</artifactId>  
    <version>4.3.0</version>  
</dependency>  
<dependency>  
    <groupId>org.apache.curator</groupId>  
    <artifactId>curator-client</artifactId>  
    <version>4.3.0</version>  
</dependency>
```

```java
package com.atguigu.case3;  
  
import org.apache.curator.framework.CuratorFramework;  
import org.apache.curator.framework.CuratorFrameworkFactory;  
import org.apache.curator.framework.recipes.locks.InterProcessMutex;  
import org.apache.curator.retry.ExponentialBackoffRetry;  
  
public class CuratorLockTest {  
  
    public static void main(String[] args) {  
  
        // 创建分布式锁1  
        InterProcessMutex lock1 = new InterProcessMutex(getCuratorFramework(), "/locks");  
  
        // 创建分布式锁2  
        InterProcessMutex lock2 = new InterProcessMutex(getCuratorFramework(), "/locks");  
  
        new Thread(new Runnable() {  
            @Override            public void run() {  
                try {  
                    lock1.acquire();                    System.out.println("线程1 获取到锁");  
  
                    lock1.acquire();                    System.out.println("线程1 再次获取到锁");  
  
                    Thread.sleep(5 * 1000);  
  
                    lock1.release();                    System.out.println("线程1 释放锁");  
  
                    lock1.release();                    System.out.println("线程1  再次释放锁");  
  
                } catch (Exception e) {  
                    e.printStackTrace();                }            }        }).start();  
  
        new Thread(new Runnable() {  
            @Override            public void run() {  
                try {  
                    lock2.acquire();                    System.out.println("线程2 获取到锁");  
  
                    lock2.acquire();                    System.out.println("线程2 再次获取到锁");  
  
                    Thread.sleep(5 * 1000);  
  
                    lock2.release();                    System.out.println("线程2 释放锁");  
  
                    lock2.release();                    System.out.println("线程2  再次释放锁");  
  
                } catch (Exception e) {  
                    e.printStackTrace();                }            }        }).start();  
    }  
  
    private static CuratorFramework getCuratorFramework() {  

		// 重试策略，初试时间 3 秒，重试 3 次
        ExponentialBackoffRetry policy = new ExponentialBackoffRetry(3000, 3);  
  
        CuratorFramework client = CuratorFrameworkFactory.builder().connectString("hadoop102:2181,hadoop103:2181,hadoop104:2181")  
                .connectionTimeoutMs(2000)  
                .sessionTimeoutMs(2000)  
                .retryPolicy(policy).build();  
  
        // 启动客户端  
        client.start();  
  
        System.out.println("zookeeper 启动成功");  
        return client;  
    }  
}
```

# 6. 企业面试题

## 6.1 生产集群安装多少 zk 合适？
安装奇数台。

生产经验：

- 10 台服务器：3 台 zk；

- 20 台服务器：5 台 zk；

- 100 台服务器：11 台 zk；

- 200 台服务器：11 台 zk

服务器台数多：好处，提高可靠性；坏处：提高通信延时