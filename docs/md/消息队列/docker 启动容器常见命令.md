# kafka

```Shell
docker pull wurstmeister/zookeeper

docker run -d --restart=always --log-driver json-file --log-opt max-size=100m --log-opt max-file=2  --name zookeeper -p 2181:2181 -v /Users/ahs/home/localtime:/etc/localtime wurstmeister/zookeeper

```