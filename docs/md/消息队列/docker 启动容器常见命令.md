# kafka

```Shell
docker pull wurstmeister/zookeeper

docker run -d --restart=always --log-driver json-file --log-opt max-size=100m --log-opt max-file=2 --name zookeeper -p 2181:2181 -v /etc/localtime:/etc/localtime wurstmeister/zookeeper

docker pull wurstmeister/kafka

docker run -d --restart=always --log-driver json-file --log-opt max-size=100m --log-opt max-file=2 --name kafka -p 9092:9092 -e KAFKA_BROKER_ID=0 -e KAFKA_ZOOKEEPER_CONNECT=host.docker.internal:2181/kafka -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://host.docker.internal:9092 -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 -v /etc/localtime:/etc/localtime wurstmeister/kafka

```