# mac 安装redis
[toc]
## 使用Homebrew安装Redis
```
brew install redis
```
## 出现安装不成功的包时需要先安装依赖包
```
brew install xx@xx
```

## 启动redis
```
brew services start redis

redis-server
```

## config文件位置
```
/opt/homebrew/etc/redis.conf
```