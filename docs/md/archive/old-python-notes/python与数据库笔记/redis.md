# NoSQL  Redis

**安装：**

直接 放到硬盘中就可以

**ubuntu**

sudp apt-get install redis

**更改配置文件**

redis.windows.conf

455行 maxheap 1024000000  设置最大数据堆的大小

**设置密码**

387行 requirepass 123456

**端口号 **

6379



## 一、启动服务

**打开终端**

cd redis的目录

C:\redis64-2.8.2101>redis-server.exe redis.windows.conf

**再打开一个终端**

cd redis的目录 cd C:\redis64-2.8.2101

输入 redis-cli

输入 auth '密码'

**redis 为16个数据库  从0~15**



## 二、redis的数据类型

1. 字符串 string
2. 列表 list
3. 集合 set
4. 有序集合 zset
5. 哈希 hash

**redis命令**

http://redis.cn/commands.html

## 三、string类型

#### (1) 设置键值

set key value

#### (2) 设置键值及过期时间 单位为秒

setex key seconds value

#### (3) 查看过期时间

ttl key

#### (4) 只有当 key不存在时 设置key value

setnx key value

#### (5) 设置多个键值

mset key value [key value...]

#### (6) 获取值

get key

#### (7) 获取多个

mget key1 key2...

#### (8) 返回key字符串中的子字符串

getrange key start end

>  getrange name 0 2

#### (9) 设置新的值 返回旧的值

getset key value

### 运算

#### (1) 将 key 的值+1

incr key

#### (2) 将key的值 -1

decr key 

#### (3) 将key的值对应添加整数

incrby key num

#### (4) 将key的值对应减整数

decrby key num

#### 其它

#### (1) 追加值

append key value

#### (2) 获取值的长度

strlen key

## 四、key的操作

#### (1) 查找所有 符合给定模式pattern的key

keys * 返回所有的key

keys \*e\* 返回所有包含e的key

keys a*  返回以a开头的所有的key

**支持的正则表达式**

h?llo

h*llo 只有前面是h 后面是llo就可以

h[ea]llo 第二位是e或者a的key都返回

h[a-z]llo 第二位只要是字母就匹配出来

#### (2) 判断key是否存在

exists key

#### (3) 判断key所对应值的类型

type key

#### (4) 删除key 及对应的值

del key1 ....

#### (5) 设置key的过期时间 以秒为单位

expire key seconds

#### (6) 以毫秒返回过期时间

pttl key

#### (7) 移除key 的过期时间

persist  key

#### (8) 删除所有的key

flushdb 删除当前数据库中的所有的key

flushall 是删除所有数据库中的key

#### (9) 修改key的名称

rename key newname

#### (10) 将key 移动到其它数据库中

move key 数据库名

#### (11) 返回一个随机的key

randomkey

## 五、hash

可以理解为一个字典

keyname = {key:value}

#### (1) 设置单个值

hset key field value

#### (2) 设置多个值

hmset key field value ....

#### (3) 获取一个属性的值

hget key field

#### (4) 获取多个属性的值

hmget key field ...

#### (5) 为哈希中的字段添加整数值

hincrby key field increment

#### (6) 只有字段不存在的时候 设置hash字段的值

hsetnx key field value

#### (7) 获取所有字段和值

hgetall key

#### (8) 获取所有字段

hkeys key

#### (9) 获取所有的值

hvals key

#### (10) 返回数据的个数

hlen key

#### 其它

#### (1) 判断属性是否存在

hexists key field

#### (2) 删除字段和值

hdel key field

## 六、列表list

【a,b,c,d】

#### (1)  在头部插入

lpush key value....

#### (2) 在尾部插入

rpush key vaule ...

#### (3) 在一个元素的前后插入新元素

linsert key before|after value value

#### (4) 设置指定索引元素的值

lset key index value

**注意：**

index 索引从0开始

**注意：**

索引值是可以为负数 如果是-1 则代表最后一个元素

#### (5) 移除并返回列表的第一个元素

lpop key

#### (6) 移除并返回列表的最后一个元素

rpop key

#### (7) 返回存储在 key的列表中 指定范围元素

lrange key start end 

**返回所有**

lrange mlist 0 -1

#### (8) 返回存储在列表中的长度

llen key

#### (9) 返回列表中索引所对应的值

lindex key index

**注意：**

索引可以为负数  代表倒数第几个

#### (10) 裁剪列表 生成一个新的子集

ltrim key start end



##  七、集合 set

**概述：**

集合是无序集合  元素类型为 string类型 元素具有唯一性 不重复

{‘a','b'}

#### (1) 添加元素

sadd key member1 member2

#### (2) 获取元素

smembers key

#### (3) 返回元素个数

scard key

#### (4) 移除并返回集合中的一个随机元素

spop key

#### (5) 返回集合中一个或多个随机数

srandmember key num

#### (6) 移除 集合中一个或多个元素

srem  key  member1 member2

#### (7) 求集合的交集

inter key1 key2

#### (8) 求集合的差集

sdiff key1 key2

#### (9) 求集合的合集

sunion key1 key2

#### (10) 判断某个元素是否在当前集合中

sismember key member



## 八、有序集合 zse

**概述：**

1. 有序集合元素类型为字符串 元素具有唯一性  不重复
2. 每个元素都会 关联一个 double类型的score （表示权重）  score可以重复

#### (1) 添加

zadd key score member ...

#### (2) 获取

zrange key start end

#### (3) 有序集合中 对指定成员 的score权重上 增量 increment

zincrby key increment member

#### (4) 返回元素个数

zcard key

#### (5) 返回有序集合中 score 在 min 和 max 之间的元素个数 

zcard key  min  max

#### (6) 返回有序集合中 元素对应的score权重值

zscore key member

#### (7) 当前集合中的所有值和权重

zrange key 0 -1 withsores



**注意：**

当我们没有选择库的时候 默认都在 0库

使用select 库值 进行库的切换



## 九、python操作redis

**安装**

pip install redis

import redis

**连接方式**

redis提供了两种连接方式

1. StrictReids 实现了大部分的官方命令
2. Redis 是StrictRedis的子类 用于向后兼容旧的redis的版本

**官方推荐使用**

StrictRedis

**连接实例**

```python
import redis
r = redis.Redis(host='127.0.0.1',password='123456',port=6379,db=0,decode_responses=True)
r = redis.StrictRedis(host='127.0.0.1',password='123456',decode_responses=True)
print(r)
```

**连接池 connection pool**

**对于建立redis 的链接进行统一管理 减少链接和释放的开销**

**完整实例**

```python
import redis
# r = redis.Redis(host='127.0.0.1',password='123456',port=6379,db=0,decode_responses=True)
# r = redis.StrictRedis(host='127.0.0.1',password='123456',decode_responses=True)
# print(r)
# 建立链接池
pool = redis.ConnectionPool(host='127.0.0.1',password='123456',port=6379,decode_responses=True)
# 链接我们的连接池
r = redis.Redis(connection_pool=pool)

# print(r.get('name'))
# print(r.get('age'))

print(r.set('name','夏利刚'))
print(r.get('name'))

# python操作redis中 对数据库操作的额方法  都是终端的命令！！ 回去实操一遍！
```

