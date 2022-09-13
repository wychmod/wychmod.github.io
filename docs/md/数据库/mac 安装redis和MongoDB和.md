# mac 安装redis
[toc]
## 使用Homebrew安装Redis/MongoDB/activemq/elasticsearch
```
brew install redis
brew install mongodb-community@5.0
brew services start elastic/tap/elasticsearch-full

brew install activemq
```
## 出现安装不成功的包时需要先安装依赖包
```
brew install xx@xx
```

## 启动redis/MongoDB
```
brew services start redis
brew services start mongodb-community@5.0

brew services stop mongodb-community@5.0

brew services start elastic/tap/elasticsearch-full

elasticsearch
redis-server

# 作为后端运行
mongod --config /usr/local/etc/mongod.conf --fork

mongod --config /opt/homebrew/etc/mongod.conf --fork

activemq start
http://localhost:8161/
用户名：admin 密码admin
```

## config文件位置
```
/opt/homebrew/etc/redis.conf
```
## 使用redis/MongoDB
```
redis-cli


mongosh 
或者
mongo

```