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

