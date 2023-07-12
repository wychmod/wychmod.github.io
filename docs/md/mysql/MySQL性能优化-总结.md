# 1. 优化思路

![](../youdaonote-images/Pasted%20image%2020230711230646.png)

# 2. 连接——配置优化

客户端连接到服务端，有可能是服务端连接数不够导致应用程序获取不到连接。

可以从两个方面来解决连接数不够的问题:
1. 从服务端来说，我们可以增加服务端的可用连接数
	1. 增加可用连接数，修改max_connections的大小
	2. 及时释放不活动连接，交互武和非交豆式的客广蹦的默以超的时 间都是28800 秒，8 小时，我们可以把这个值调小。
2. 从客户端来说，可以减少从服务端获取的连接数。如果我们想要不是每一次执行SQL都创建一个新的连接。**引入连接池，实现连接的重用**。阿里的Druid、Hikari。
	连接池并不是越大越好，只要维护一定数量大小的连接池，其他的客户端排队等待获取连接就可以了。有的时候连接池越大，效率反而越低。

每一个连接，服务端都需要创建一个线程去处理它。连接数越多，服务端创建的线程数就会越多。CPU的核数是有限的，频繁的上下文切换会造成比较大的性能开销。

> 建议是机器核数乘以2加1

# 3. 缓存——架构优化

## 3.1 缓存

可以把数据放到内存缓存起来，比如使用 Redis 。

## 3.2 集群，主从复制

集群的话必然会面临一个问题，就是不同的节点之问数据一致性的问题。如果同时 读写多台数据库节点，怎么让所有的节点数据保持一致?

这个时候我们需要用到复制技术 (repli cation )，被复制的节点称为ma st er ，复制 的节点称为slave。slave 本身也可以作为其他节点的数据来源，这个叫做级联复制。

MySQL的主从复制是怎么实现的呢？

MySQL所有更新语句都会记录到Server层的binlog。有了这个binlog,从服务器会不断获取主服务器的binlog文件，然后解析里面的SQL语句，在从服务器上面执丸行一遍，保持主从的数据一致。

![](../youdaonote-images/Pasted%20image%2020230711233358.png)

这里面涉及到三个线程，连接到master 获取binlog，并且解析binlog写入中继日志，这个线程叫做I/O线程。
Master节点上有一个log dump线程，是用来发送binlog给slave的。
从库的SQL线程，是用来读取relay log,把数据写入到数据库的。

![](../youdaonote-images/Pasted%20image%2020230711234245.png)

## 3.3 分库分表

分库分表总体上可以分为两类:
1. 垂直分库，减少并发压力。
2. 水平分表，解决存储瓶颈。

垂直分库的做法，把一个数据库按照业务拆分成不同的数据库:

![](../youdaonote-images/Pasted%20image%2020230712003151.png)

水平分库分表的做法，把单张表的数据按照一定的规则分布到多个数据库。

![](../youdaonote-images/Pasted%20image%2020230712003216.png)

# 4优化器一一SQL语句分析与优化

把SQL执行情况记录下来，用到服务端的慢查询日志。

## 4.1 慢查询日志slomquery 1og
### 4. 1. 1 打开慢日志开关

因为开启慢查询日志是有代价的（跟binlog、optimizer--trace一样），所以它默认是关闭的

还有一个参数，控制执行超过多长时间的SQL才记录到慢日志，默认是10秒。如果改成0秒的话就是记录所有的SQL。

```sql
show variables like 'slow query%'

show variables like '%long_query%';
```

修改配置文件my.cnf

### 4. 1. 2 慢日志分析

1、日志内容

```linux
less /var/lib/mysql/localhost-slow.log
```

2 . mysqldumpslow

MySQL提供了mysqldumpslow的工具，在MySQL的bin目录下。
```sql
mysqldumpslow --help

# 查询用时最多的10条慢SQL:
mysqldumpslow -s t -t 10 -g 'select'/var/lib/mysql/localhost-slow.log
```

> 有的时候查询慢，不一定是SQL语句的问题，也有可能是服务器状态的问题。

### 4. 1. 3 其他系统命令

show processlist 运行线程
```sql
show full processlist;
# 效果一样
select * from information schema.processlist;
```
显示用户运行线程。可以根据id 号kill线程。

show status 服多器运行状态

```sql
SHOW GLOBAL STATUS;

SHOW GLOBAL STATUS LIKE'com_select'; - 査看select 次数
```

showengine 存储引擎运行信息,包括事务持有的表锁、行锁信息;事务的锁等待情况; 线程信号量等待;文件IO请求;bufferpool统计信息

```sql
show engine innodb status;

-- 开启标准监控和锁监控
set GLOBAL innodb_status_output=ON;
set GLOBAL innodb_status_output_locks=ON:
```

## 4.2 EXPLAIN 执行计划

### 4.2.1 id

- id是查询序列编号，每张表都是单独访问的，一个SELECT就会有一个序号。
- id值不同的时候，先查询id值大的（先大后小）。
- id值相同时，表的查询顺序是从上往下顺序执行。
- 把小表放在前面查询，因为它的中间结果最少。(小表驱动大表的思想)

### 4.2.2 select type 查询类型

- SIMPLE: 简单查询，不包含子查询，不包含关联查询union。
- PRIMARY: 子查询SQL 语句中的 主查询，也就是最外面的那层查询。
- SUBQUERY: 子查询中所有的内层查询都是SUBQUERY类型的。
- DERIVED: 衍生查询，表示在得到最终查询结果之前会用到临时表。
- UNION: 用到了UNION 查询。

### 4.2.3 type 连接类型

所有的连接类型中，上面的最好，越往下越差。

在常用的链接类型中:system >const > eq_ref > ref > range > index > all

除了 all 都能用到索引。

- const： 主键索引或者唯一索引，只能查到一条数据的 SQL。
- system: system是const 的一种特例，只有一行满足条件，对于MyISAM、Memory的表，
只查询到一条记录，也是system 。比如系统库的这张表 (8. 0 的版本中系统表全部变成InnoDB存储引擎了)
- eg_ref: 通常出现在多表的 join 查询，被驱动表通过唯一性素引(UNIQUE或PRIMARY KEY) 进行访问，此时被驱动表的访问方式就是eq_ref.eq_ref是除const 之外最好的访问类型。
- ref: 查询用到了非唯一性索引，或者关联操作只使用了索引的最左前缀。
- range: 索引范围扫描。
- index:Full Index Scan ，查询全部素引中的数据 (比不走索引要快)
- all: 没有索引國者没有用到索引，type就是ALL。代表全表扫描。
- NULL:不用访问表或者素引就能得到结果

> 不 走 素 引 一 定 是 全 表 扫 描 (A L L )

### 4.2.4 possible_key、key 

可能用到的索引和实际用到的索引。如果是NULL就代表没有用到索引。

### 4.2.5 key_len

索引的长度 (使用的 字节数)。跟索引字段的类型、长度有关。

### 4.2.6 rows

MySQL认为扫描多少行才能返回请求的数据，是一个预估值。一般来说行数越少越好。

### 4.2.7 filtered

这个字段表示存储引(擎返回的数据在server 层过滤后，剩下多少满足查询的记录数
量的比例，它是一个百分比。
如果比例很低，说明存储引擎层返回的数据需要经过大量过滤，这个是会消耗性能的，需要关注。

### 4.2.8 ref

使用哪个列或者常数和索引一起从表中筛选数据。

### 4.2.9  Extra

执行计划给出的额外的信息说明。

- using index: 用到了覆盖索引 ，不需要回表。
- using where:使用了where过滤，表示存储引擎返回的记录并不是所有的都满足查询条件，需要在server层进行过滤（跟是否使用索引没有关系)
- Using index condition (索引条件下推)
- using filesort:不能使用素引来排序，用到了额外的排序 。**需要优化**。
- using temporary: 用到了临时表。

> EXPLAIN FORMAT=JSON。可以获得更详细信息。


## 4. 3 SQL 与索引优化

```sql
-大偏移量的limit
select from user innodb limit 900000,10:
-改成先过滤D,再limit
SELECT FROM user innodb WHERE id 900000 LIMIT 10;
```

# 5 存储引擎

## 5.1 存储引擎的选择

不同的业务表选择不同的存储引擎，例如:查询插入操作多的业务表，用MyISAM. 临时数据用Memeroy。常规的并发大更新多的表用InnoDB。

## 5.2 分表或者分区

交易历史表：在年底为下一年度建立12个分区，每个月一个分区
渠道交易表：分成：当日表、当月表、历史表，历史表再做分区。

## 5.3 字段定义

原则:使用可以正确存储数据的最小数据类型。

### 5.3.1 非空

非空字段尽量定义成NOT NULL,提供默认值，或者使用特殊值、空串代替null。
NULL类型的存储、优化、使用都会存在问题。