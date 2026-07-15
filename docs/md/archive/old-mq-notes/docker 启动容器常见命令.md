# kafka

```Shell
docker pull wurstmeister/zookeeper

docker run -d --restart=always --log-driver json-file --log-opt max-size=100m --log-opt max-file=2 --name zookeeper -p 2181:2181 -v /etc/localtime:/etc/localtime wurstmeister/zookeeper

docker pull wurstmeister/kafka

docker run -d --restart=always --log-driver json-file --log-opt max-size=100m --log-opt max-file=2 --name kafka -p 9092:9092 -e KAFKA_BROKER_ID=0 -e KAFKA_ZOOKEEPER_CONNECT=host.docker.internal:2181/kafka -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://host.docker.internal:9092 -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 -v /etc/localtime:/etc/localtime wurstmeister/kafka

docker exec -it kafka /bin/bash

cd  /opt/kafka_2.13-2.8.1/bin

# 创建一个新主题（test-kafka)来存储事件
./kafka-topics.sh --create --topic message-kafka --bootstrap-server localhost:9092

# 显示新主题：test-kafka 的分区信息
./kafka-topics.sh --describe --topic message-kafka --bootstrap-server localhost:9092

# 测试生产消息：

./kafka-console-producer.sh --topic message-kafka --bootstrap-server localhost:9092
# 测试消费消息：

./kafka-console-consumer.sh --topic message-kafka --from-beginning --bootstrap-server localhost:9092
```

# RocketMQ

```undefined
mkdir -p /Users/ahs/docker/rocketmq/server/logs && chmod 777 /Users/ahs/docker/rocketmq/server/logs


docker run -d --name rmqnamesrv --restart=always  -p 9876:9876 \
--net=mynet \
--privileged=true \
-e "JAVA_OPT_EXT=-Xms512M -Xmx512M -Xmn128m" \
-v /Users/ahs/docker/rocketmq/server/logs:/home/rocketmq/logs \
foxiswho/rocketmq:latest \
sh mqnamesrv

mkdir -p /Users/ahs/docker/rocketmq/broker/logs
mkdir -p /Users/ahs/docker/rocketmq/broker/store
mkdir -p /Users/ahs/docker/rocketmq/broker/conf

vim /Users/ahs/docker/rocketmq/broker/conf/broker.conf

chmod -R 777 /Users/ahs/docker/rocketmq


docker run -d  --name rmqbroker --restart=always -p 10911:10911 -p 10912:10912 -p 10909:10909 \
--net=mynet \
--privileged=true \
-v /Users/ahs/docker/rocketmq/broker/logs:/home/rocketmq/logs \
-v /Users/ahs/docker/rocketmq/broker/store:/home/rocketmq/store \
-v /Users/ahs/docker/rocketmq/broker/conf:/home/rocketmq/conf \
-e "NAMESRV_ADDR=rmqnamesrv:9876" \
-e "JAVA_OPT_EXT=-Xms512M -Xmx512M -Xmn128m" \
foxiswho/rocketmq:latest \
sh mqbroker -c /home/rocketmq/conf/broker.conf

docker run -d --name rmqconsole -p 8080:8080 \
--net=mynet \
--privileged=true \
-e "JAVA_OPTS=-Drocketmq.namesrv.addr=rmqnamesrv:9876 -Dcom.rocketmq.sendMessageWithVIPChannel=false" \
-t styletang/rocketmq-console-ng


# censed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing pervisitCustBusinessBaseMappermissions and
#  limitations under the License.


# 所属集群名字
brokerClusterName=DefaultCluster

# broker 名字，注意此处不同的配置文件填写的不一样，如果在 broker-a.properties 使用: broker-a,
# 在 broker-b.properties 使用: broker-b
brokerName=broker-a

# 0 表示 Master，> 0 表示 Slave
brokerId=0

# nameServer地址，分号分割
# namesrvAddr=rocketmq-nameserver1:9876;rocketmq-nameserver2:9876

# 启动IP,如果 docker 报 com.alibaba.rocketmq.remoting.exception.RemotingConnectException: connect to <192.168.0.120:10909> failed
# 解决方式1 加上一句 producer.setVipChannelEnabled(false);，解决方式2 brokerIP1 设置宿主机IP，不要使用docker 内部IP
# brokerIP1=192.168.0.253
# brokerIP1=210.210.210.223

# 在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums=4

# 是否允许 Broker 自动创建 Topic，建议线下开启，线上关闭 ！！！这里仔细看是 false，false，false
autoCreateTopicEnable=true

# 是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true

# Broker 对外服务的监听端口
listenPort=10911

# 删除文件时间点，默认凌晨4点
deleteWhen=04

# 文件保留时间，默认48小时
fileReservedTime=120

# commitLog 每个文件的大小默认1G
mapedFileSizeCommitLog=1073741824

# ConsumeQueue 每个文件默认存 30W 条，根据业务情况调整
mapedFileSizeConsumeQueue=300000

# destroyMapedFileIntervalForcibly=120000
# redeleteHangedFileInterval=120000
# 检测物理文件磁盘空间
diskMaxUsedSpaceRatio=88
# 存储路径
# storePathRootDir=/home/ztztdata/rocketmq-all-4.1.0-incubating/store
# commitLog 存储路径
# storePathCommitLog=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/commitlog
# 消费队列存储
# storePathConsumeQueue=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/consumequeue
# 消息索引存储路径
# storePathIndex=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/index
# checkpoint 文件存储路径
# storeCheckpoint=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/checkpoint
# abort 文件存储路径
# abortFile=/home/ztztdata/rocketmq-all-4.1.0-incubating/store/abort
# 限制的消息大小
maxMessageSize=65536

# flushCommitLogLeastPages=4
# flushConsumeQueueLeastPages=2
# flushCommitLogThoroughInterval=10000
# flushConsumeQueueThoroughInterval=60000

# Broker 的角色
# - ASYNC_MASTER 异步复制Master
# - SYNC_MASTER 同步双写Master
# - SLAVE
brokerRole=ASYNC_MASTER

# 刷盘方式
# - ASYNC_FLUSH 异步刷盘
# - SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH

# 发消息线程池数量
# sendMessageThreadPoolNums=128
# 拉消息线程池数量
# pullMessageThreadPoolNums=128
```
