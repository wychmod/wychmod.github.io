# Redis 缓存

> 预计阅读：约 32 分钟（正文约 10224 字）
> 阅读建议：建议分两次阅读：先看概览、结论和关键表格，再按需翻文末原文归档。

## 一、核心主题概述

Redis（Remote Dictionary Server）是基于内存的键值型 NoSQL 数据库，诞生于 2009 年。它以丰富的数据结构、极高的读写性能、完善的持久化与集群方案，成为互联网缓存与实时数据存储的事实标准之一。

从归档的 10 份笔记来看，内容覆盖基础命令与客户端、实战案例（缓存问题/分布式锁/秒杀/GEO/BitMap/Feed 流等）、底层原理、主从/哨兵/Cluster 高可用、多级缓存与 Canal 同步，以及键值设计、BigKey、Pipeline、慢查询等最佳实践。

整体架构通常按“浏览器缓存 → CDN → Nginx/OpenResty 本地缓存 → Redis → JVM 本地缓存 → DB”多级展开，Redis 处于核心共享缓存层。

**Redis 为什么快**：核心命令始终单线程执行（4.0 起异步 unlink，6.0 起仅网络 IO 多线程）。快在四点：纯内存操作；瓶颈在网络而非 CPU；单线程避免上下文切换与锁竞争；基于 epoll 的 IO 多路复用并发处理海量连接。

> 💡 补充：归档笔记里使用的 Redis 版本多为 6.2.x，部分命令/配置在 7.x 中已有调整，但核心机制不变。

## 二、Redis 数据类型与应用

### 2.1 通用命令

```bash
KEYS pattern        # 生产环境慎用
EXISTS key
DEL key
EXPIRE key seconds
TTL key
SELECT index
```

### 2.2 String

字符串最大 512 MB，内部可能是 int、embstr（<44 字节）或 raw 编码。

底层不用 C 字符串，而是自建 SDS（简单动态字符串）：len 字段 O(1) 取长度、二进制安全、支持动态扩容——新串 < 1M 时预分配 2 倍空间，> 1M 时多分配 1M。

```bash
SET key value EX 60
GET key
INCR counter
INCRBY counter 5
SET lock:order:1 1 NX EX 10  # SETNX 不接受 EX 参数，加锁须用 SET ... NX EX
MGET k1 k2 k3
```

典型应用：缓存对象 JSON、计数器、分布式锁、全局唯一 ID。

### 2.3 Hash

适合存储对象字段，底层在数据量小时使用 ListPack（7.0 前为 ZipList），大时转 Dict。

ZipList 的 entry 以 1 或 5 字节 previous_entry_length 记录前一节点长度，连续插入/删除 250~253 字节的 entry 会引发连锁更新（级联空间扩展）——这正是 7.0 用 ListPack 替代 ZipList 的动机。

Dict 含 ht[0]/ht[1] 双哈希表：LoadFactor >= 1（无 bgsave 等子进程时）或 > 5 触发扩容，< 0.1 收缩；扩容/收缩走渐进式 rehash——访问时逐步迁移，新增只写 ht[1]，其余操作两表并查，ht[0] 只减不增。

```bash
HSET user:1 name jack age 21
HGET user:1 name
HGETALL user:1
HINCRBY user:1 coins 10
```

典型应用：用户信息、购物车、Session 属性。

### 2.4 List

双向链表（3.2 后由 QuickList 实现），支持两端操作。

```bash
LPUSH queue msg1
RPUSH queue msg2
LPOP queue
BLPOP queue 5
LRANGE queue 0 -1
```

典型应用：消息队列、最新 N 条记录、时间线。

### 2.5 Set

无序唯一集合，底层整数集合或 Dict。

```bash
SADD tag:redis user1 user2
SISMEMBER tag:redis user1
SINTER tag:redis tag:mysql
SUNION tag:redis tag:mysql
```

典型应用：标签、共同好友、抽奖池、点赞去重。

### 2.6 Sorted Set

按 score 排序，底层 SkipList + Dict（或 ZipList）。

跳表是多层指针的有序链表，层数取 1~32 的随机数；按 score 排序，相同 score 按 ele 字典序。增删改查效率与红黑树相当但实现更简单——“为什么用跳表不用红黑树”是高频追问。

```bash
ZADD rank 100 user1 95 user2
ZRANGE rank 0 9 WITHSCORES
ZREVRANGE rank 0 4
ZINCRBY rank 10 user1
ZREVRANGEBYSCORE timeline 999999999 0 LIMIT 0 10
```

典型应用：排行榜、Feed 流时间线、延迟队列。

### 2.7 BitMap

基于 String 实现的位数组，月签到只需几十字节。

```bash
SETBIT sign:1:202507 15 1
GETBIT sign:1:202507 15
BITCOUNT sign:1:202507
BITFIELD sign:1:202507 GET u16 0
```

典型应用：签到、在线状态、布隆过滤器替代方案。

### 2.8 HyperLogLog

概率去重，误差 < 0.81%，固定 < 16 KB。

```bash
PFADD uv:20250716 user1 user2 user3
PFCOUNT uv:20250716
```

典型应用：UV 统计、基数估算。

### 2.9 GEO

3.2 加入，6.2 后用 `GEOSEARCH` 替代 `GEORADIUS`。

```bash
GEOADD shops:food 116.397 39.916 shop1
GEOSEARCH shops:food FROMLONLAT 116.4 39.9 BYRADIUS 5 km WITHDIST
```

典型应用：附近的人、附近商户。

### 2.10 Stream

5.0 引入的日志型消息队列，支持 Consumer Group、ACK、Pending List。

早期方案都有缺陷，Stream 因此被引入：List 做队列无 ACK、无法避免消息丢失且只支持单消费者；PubSub 不持久化、断线丢消息、消息堆积有上限。

```bash
XADD orders * userId 1 voucherId 10
XREAD BLOCK 5000 STREAMS orders $
XGROUP CREATE orders g1 $
XREADGROUP GROUP g1 c1 COUNT 1 BLOCK 2000 STREAMS orders >
XACK orders g1 1699999999999-0
XPENDING orders g1
XCLAIM orders g1 c2 60000 1699999999999-0
```

消费者宕机后未 ACK 的消息停留在 Pending 列表：用 XCLAIM 按 min-idle-time 将超时消息转移给其他消费者重新处理并重新 ACK（或 XREADGROUP 传 `"0"` 读 Pending）。

典型应用：异步订单、日志收集、任务分发。

### 2.11 Java 客户端选型

- **Jedis**：直连/连接池，线程不安全，需用 JedisPool。
- **Lettuce**：基于 Netty，线程安全，支持响应式与集群自动感知。
- **Spring Data Redis**：统一 API，常用 `StringRedisTemplate` + JSON 手动序列化。
- **Redisson**：提供分布式锁、Map、Queue、WatchDog 等高级结构。

```yaml
# Spring Boot 3.x 前缀为 spring.data.redis
spring:
  data:
    redis:
      host: 192.168.150.101
      port: 6379
      password: 123321
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
```

> 💡 补充：生产环境推荐 `StringRedisTemplate` 手动 JSON 序列化，避免 JDK 序列化带来的不可读和内存浪费。键名建议 `[业务名]:[数据名]:[id]`，如 `heima:user:1`。

## 三、Redis 持久化

持久化解决宕机后数据恢复问题。两种方案各有侧重，实际常结合使用。

### 3.1 RDB

RDB 是快照文件。触发方式包括 `save`（阻塞）、`bgsave`（fork 子进程）、停机、配置条件。

```properties
save 900 1
save 300 10
save 60 10000

dbfilename dump.rdb
dir ./
rdbcompression yes
```

- 优点：恢复速度快，文件紧凑。
- 缺点：两次快照间可能丢数据；fork 成本随内存增大而增加。

`bgsave` 采用 COW（写时复制）：子进程共享父进程内存页，主进程写时复制该页。

### 3.2 AOF

AOF 记录写命令日志，默认关闭。

```properties
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec   # always / no

auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
no-appendfsync-on-rewrite yes
```

- `always`：最安全，最慢。
- `everysec`：默认，每秒刷盘，兼顾性能与安全。
- `no`：由操作系统决定，性能最好但风险最高。

AOF 重写（`bgrewriteaof`）会将多条命令合并，减少文件体积。

### 3.3 混合持久化（4.0+）

Redis 4.0 起支持 AOF 重写时先写入 RDB 全量，再追加增量 AOF，兼顾恢复速度与数据安全。现代部署建议：纯缓存实例可关闭持久化；关键数据同时开启 RDB + AOF，或在从节点执行 `bgsave` 备份。

## 四、Redis 主从与哨兵

### 4.1 主从复制

主从集群实现读写分离与数据冗余。核心概念：

- **Replication ID（replid）**：数据集标识，slave 继承 master 的 replid。
- **offset**：复制偏移量，用于判断数据差异。
- **repl_backlog**：环形缓冲区，记录写命令日志，支持增量同步。

同步流程：slave 先请求增量同步；master 发现 replid 不一致则生成 RDB 做全量同步，slave 加载 RDB；期间命令写入 repl_backlog，之后持续增量同步。

```bash
# 从节点配置（5.0+ 用 replicaof，旧版用 slaveof）
replicaof 192.168.150.101 7001
```

优化建议：避免大内存实例频繁全量同步；启用 `repl-diskless-sync yes`；增大 `repl-backlog-size`；过多从节点使用主-从-从链式结构。

### 4.2 Sentinel 哨兵

Sentinel 实现自动故障转移与服务发现。

```ini
port 27001
sentinel monitor mymaster 192.168.150.101 7001 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
```

工作原理：Sentinel 每秒 PING 节点；单个判定为“主观下线”，超过 quorum 则为“客观下线”；随后按断开时间、slave-priority、offset、runid 选出新的 master，并通知其它从节点切换。

Spring Boot 连接 Sentinel 时配置 `spring.redis.sentinel.master/nodes`，并让 Lettuce 客户端设置 `ReadFrom.REPLICA_PREFERRED` 实现读写分离。

> 💡 补充：哨兵模式下客户端必须支持自动感知主从切换；Lettuce 与 Jedis 均提供相应支持，但 Lettuce 在 Spring 生态中更常用。

## 五、Redis Cluster

Cluster 解决海量数据与高并发写的问题，采用去中心化分片架构。

### 5.1 核心机制

Cluster 将 16384 个 hash slot 分配给多个 master（每个 master 可有 slave）；key 的有效部分经 CRC16 `% 16384` 定位 slot，使用 `{tag}` 可让相关 key 落到同一 slot。

```bash
# 创建 3 主 3 从集群
redis-cli --cluster create --cluster-replicas 1 \
  192.168.150.101:7001 192.168.150.101:7002 192.168.150.101:7003 \
  192.168.150.101:8001 192.168.150.101:8002 192.168.150.101:8003
```

### 5.2 关键配置

```ini
cluster-enabled yes
cluster-config-file /tmp/7001/nodes.conf
cluster-node-timeout 5000
cluster-require-full-coverage no   # 允许部分 slot 不可用
```

### 5.3 集群操作

```bash
redis-cli -c -p 7001          # -c 开启自动重定向
cluster nodes
cluster info
cluster failover              # 手动故障转移
cluster failover takeover     # 强制接管
```

### 5.4 集群伸缩

```bash
# 添加节点
redis-cli --cluster add-node 192.168.150.101:7004 192.168.150.101:7001

# 分配插槽
redis-cli --cluster reshard 192.168.150.101:7001
```

> 💡 补充：在 Cluster 中执行 Lua 脚本或事务时，要求所有 key 必须落在同一 slot；跨 slot 操作会失败。批量操作建议客户端按 slot 分组或使用 hash_tag 谨慎处理数据倾斜。

**选型建议**：集群节点间持续互相 Ping 交换插槽与状态信息，节点越多带宽开销越大，应避免大集群--业务庞大时建多个集群。主从/哨兵架构已可达万级 QPS 且具备高可用，能满足需求时尽量不搭建 Cluster。

## 六、缓存问题：雪崩 / 穿透 / 击穿

### 6.1 缓存穿透

请求的数据在缓存和数据库都不存在，导致每次请求都打到数据库。

解决方案：

- **缓存空对象**：将空值写入 Redis，设置较短 TTL。
- **布隆过滤器**：在缓存前加一层概率型存在性判断。
- **参数校验与限流**：拦截非法 ID、负数等。

```java
// 伪代码：缓存空值
if (shop == null) {
    redis.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
    return null;
}
```

### 6.2 缓存雪崩

大量 key 同时失效或 Redis 宕机，流量洪峰到达数据库。

解决方案：

- TTL 加随机值，避免同时过期。
- Redis 集群与高可用部署。
- 接口限流、降级、熔断。
- 多级缓存分担压力。

```java
redis.opsForValue().set(key, value,
    CACHE_TTL + RandomUtil.randomInt(10), TimeUnit.MINUTES);
```

### 6.3 缓存击穿

单个热点 key 过期瞬间，大量并发请求直接访问数据库。

解决方案：

- **互斥锁**：只让一个线程重建缓存，其余等待或重试。

```java
private boolean tryLock(String key) {
    return Boolean.TRUE.equals(
        redis.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS)
    );
}
```

- **逻辑过期**：缓存永不过期，value 中维护逻辑过期时间，过期后异步重建。

```java
@Data
public class RedisData {
    private LocalDateTime expireTime;
    private Object data;
}
```

### 6.4 缓存更新策略

常用策略：Cache-Aside（旁路缓存，最常用）、Read-Through/Write-Through（缓存组件负责读写）、Write-Behind（异步写 DB，最终一致）。

> 💡 补充：推荐“先更新数据库，再删除缓存”，配合短暂 TTL 兜底；极端并发可引入延时双删或 Canal 同步。

## 七、Redis 高级应用

### 7.1 分布式锁

集群部署时每个 Tomcat 有独立 JVM，synchronized 锁对象不跨进程、互斥失效，必须改用多进程可见的分布式锁。

基于 `SET key value NX EX` 实现互斥锁，释放时用 Lua 保证原子性。

```bash
SET lock:order:1 owner:uuid NX EX 30
```

```lua
-- unlock.lua
if (redis.call('GET', KEYS[1]) == ARGV[1]) then
    return redis.call('DEL', KEYS[1])
end
return 0
```

```java
stringRedisTemplate.execute(UNLOCK_SCRIPT,
    Collections.singletonList("lock:order:" + userId),
    ID_PREFIX + Thread.currentThread().getId());
```

### 7.2 Redisson

Redisson 提供可重入锁、看门狗自动续期、红锁（MultiLock）。

```java
Config config = new Config();
config.useSingleServer().setAddress("redis://192.168.150.101:6379").setPassword("pwd");
RedissonClient client = Redisson.create(config);

RLock lock = client.getLock("lock:order:" + userId);
boolean isLock = lock.tryLock(1, 10, TimeUnit.SECONDS);
if (isLock) {
    try { /* 业务 */ } finally { lock.unlock(); }
}
```

- 默认看门狗每 10 秒续期一次，锁默认 30 秒。
- `RedissonRedLock` 用于多主节点场景，提高主从一致性。

### 7.3 秒杀优化

问题背景：并发下“查库存-扣库存”非原子会导致超卖。乐观锁（CAS/版本号）可解决，实战中常用 `stock > 0` 条件更新替代版本号比对，避免高并发下大量扣减失败。

典型流程：

1. 预热库存到 Redis。
2. Lua 脚本原子判断库存、一人一单。
3. 通过 Stream 消息队列异步下单。
4. 消费者确认消息后扣减 DB 库存。

```lua
local voucherId = ARGV[1]
local userId = ARGV[2]
local orderId = ARGV[3]
local stockKey = 'seckill:stock:' .. voucherId
local orderKey = 'seckill:order:' .. voucherId

if tonumber(redis.call('get', stockKey)) <= 0 then return 1 end
if redis.call('sismember', orderKey, userId) == 1 then return 2 end
redis.call('incrby', stockKey, -1)
redis.call('sadd', orderKey, userId)
redis.call('xadd', 'stream.orders', '*', 'userId', userId, 'voucherId', voucherId, 'id', orderId)
return 0
```

### 7.4 多级缓存

架构：浏览器 → CDN → OpenResty/Nginx 本地缓存 → Redis → JVM 本地缓存（Caffeine）→ DB。

两级缓存的取舍：

| 对比维度 | 分布式缓存（Redis） | 本地缓存（Caffeine） |
|---|---|---|
| 容量与可靠性 | 容量大、可靠性高、可集群共享 | 容量有限、可靠性低、无法共享 |
| 访问速度 | 有网络开销 | 直读内存、无网络开销，更快 |

- OpenResty 使用 Lua 查询 Nginx 共享字典、Redis、Tomcat。
- Caffeine 提供 JVM 级高性能本地缓存，支持按容量/时间驱逐。
- 使用 `hash $request_uri` 负载均衡保证同一商品命中同一 Tomcat，提升 JVM 缓存命中率。

```java
@Bean
public Cache<Long, Item> itemCache() {
    return Caffeine.newBuilder()
        .initialCapacity(100)
        .maximumSize(10_000)
        .build();
}
```

### 7.5 缓存同步

- **MQ 异步通知**：业务服务改 DB 后发消息，缓存服务更新 Redis。
- **Canal 监听 binlog**：零侵入，MySQL 数据变更后通过 Canal 客户端刷新缓存。

Canal 工作原理：MySQL 主从复制中 master 写 binlog、slave 拷贝至 relay log 并重放；Canal 伪装成 MySQL 的一个 slave 节点，订阅并拉取 binlog 变更，再推送给 Canal 客户端刷新缓存。

Canal 部署要点：MySQL 开启 `log-bin` 与 `server-id`，然后运行 `canal/canal-server` 容器并指定 `canal.instance.master.address`、账号及监听库表。

### 7.6 其他典型场景

- **短信登录/Session 共享**：Hash 存用户信息，token 作 key。
- **共同关注**：`SINTER follows:user1 follows:user2`。
- **Feed 流**：Sorted Set 按时间戳 score 推送，滚动分页。三种模式：拉模式（读扩散）省空间但延迟高；推模式（写扩散）时效快但大 V 写扩散内存压力大；推拉结合--普通用户推，大 V 写发件箱、活跃粉丝推、非活跃粉丝拉。
- **附近商户**：`GEOADD` + `GEOSEARCH ... WITHDIST`。
- **用户签到**：BitMap `SETBIT sign:user:yyyyMM day 1`。
- **UV 统计**：HyperLogLog `PFADD` / `PFCOUNT`。

## 八、Redis 性能优化

### 8.1 键值设计

- key 格式：`业务名:数据名:id`，不超过 44 字节，避免特殊字符。
- 拒绝 BigKey：String value < 10 KB，集合元素 < 1000。
- BigKey 删除：直接 `DEL` 会长时间阻塞主线程；4.0+ 用 `UNLINK` 异步删除，3.0 及以下只能先逐个删除子元素再删 key。
- 大 Hash 拆分为多个小 Hash，如按 `id / 100` 分桶。

```bash
redis-cli --bigkeys
MEMORY USAGE key
```

### 8.2 批处理

使用 Pipeline 或 Mxxx 命令减少 RTT：

```java
Pipeline p = jedis.pipelined();
for (...) p.set("k", "v");
p.sync();
```

集群环境下，客户端需按 slot 分组或使用 hash_tag。

### 8.3 慢查询

```bash
CONFIG SET slowlog-log-slower-than 1000
CONFIG SET slowlog-max-len 1000
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET
```

### 8.4 内存与淘汰

```bash
INFO memory
MEMORY DOCTOR
```

常用淘汰策略：

- `allkeys-lru`：全 key 最近最少使用。
- `volatile-lru`：仅带 TTL 的 key。
- `allkeys-lfu`：按访问频率淘汰。
- `noeviction`：不淘汰，写满后拒绝写入（默认）。

```properties
maxmemory 4gb
maxmemory-policy allkeys-lru
```

### 8.5 服务端配置建议

缓存实例尽量不开启持久化或只开 AOF；预留足够内存应对 fork 与 rewrite；避免与 CPU/磁盘密集型应用混部；合理设置客户端输出缓冲区，防止 BigKey 导致连接断开。

### 8.6 安全

- 必须设置 `requirepass`；使用 `bind`/防火墙限制访问网卡。
- 重命名危险命令，如 `rename-command FLUSHALL ""`。
- 不使用 root 启动 Redis，不使用默认 6379 端口。

## 九、2026 年缓存生态

| 维度 | 主流选择 |
|---|---|
| Redis 版本 | 7.x（7.4 LTS），RESP3 协议逐步普及 |
| 客户端 | Lettuce / Jedis / redis-py / go-redis |
| 集群 | Redis Cluster、Redis Sentinel、Codis（已停维） |
| 云托管 | 阿里云 Tair、AWS ElastiCache、腾讯云 CRS |
| 高性能替代 | KeyDB、Dragonfly、Valkey |
| 持久化 | AOF + RDB 混合持久化 |
| 向量/AI 缓存 | Redis Stack / Redis as Vector DB（按需了解） |

趋势观察：多线程 IO（Redis 6.0+）已成熟但命令执行仍单线程；7.0+ 引入 Functions、ACL 日志、Sharded Pub/Sub；云厂商增强版 Redis（如 Tair）提供持久内存、全球多活等能力。

## 十、常见坑与补充

1. **缓存与数据库一致性**：Cache-Aside + 删缓存 + 短 TTL 是最稳妥的工程平衡。
2. **BigKey / HotKey**：大 key 阻塞主线程，热 key 打满带宽；通过拆分、本地缓存、读写分离缓解。
3. **主从延迟**：对一致性敏感的业务应读主或等待。
4. **集群限制**：Lua 脚本与事务涉及的 key 必须在同一 slot。
5. **持久化阻塞**：AOF `always` 策略降低写入性能；大内存 fork 可能失败。
6. **内存碎片**：长期运行后 `mem_fragmentation_ratio` 过高，可考虑 `activedefrag`。
7. **连接与序列化**：使用连接池，避免 JDK 序列化，优先 JSON / MessagePack。
8. **过期非实时**：依赖惰性 + 定期删除，高并发下可能读到过期数据。
9. **不要把 Redis 当主数据库**：它最适合缓存、计数、排行榜、会话、分布式锁等场景。

> 💡 补充：归档中“安装 Redis 集群”“安装 OpenResty”“安装 Canal”三篇文档提供了 CentOS 7 下的详细命令与配置，实际部署时请结合当前系统与版本做适配；例如 CentOS 7 已 EOL，建议在 Rocky/AlmaLinux 或容器环境中复刻。

---


## 📚 完整资料

> **原文归档**：[archive/old-redis-notes/](/md/archive/README?id=old-redis-notes)
> 包含：10 个文件（入门 / 实战 / 原理 / Stream / 高级 / 安装部署）

- [1-Redis入门.md](../archive/old-redis-notes/1-Redis入门.md) — 安装、基础命令、Java 客户端
- [2-Redis实战.md](../archive/old-redis-notes/2-Redis实战.md) — 短信登录、商户缓存、秒杀、分布式锁、消息队列、GEO、BitMap、HLL
- [3-原理篇.md](../archive/old-redis-notes/3-原理篇.md) — 底层数据结构、网络模型、RESP、内存回收
- [4-RedisStream消息队列.md](../archive/old-redis-notes/4-RedisStream消息队列.md) — Stream 命令、Consumer Group、Java 示例
- [Redis高级-分布式缓存.md](../archive/old-redis-notes/Redis高级-分布式缓存.md) — 持久化、主从、Sentinel、Cluster
- [Redis高级-多级缓存.md](../archive/old-redis-notes/Redis高级-多级缓存.md) — OpenResty、Caffeine、多级缓存、Canal 同步
- [Redis高级-最佳实践.md](../archive/old-redis-notes/Redis高级-最佳实践.md) — 键值设计、BigKey、Pipeline、慢查询、安全
- [安装Redis集群.md](../archive/old-redis-notes/安装Redis集群.md) — 主从、哨兵、分片集群搭建
- [安装OpenResty.md](../archive/old-redis-notes/安装OpenResty.md) — OpenResty 安装与 Lua 模块加载
- [安装Canal.md](../archive/old-redis-notes/安装Canal.md) — MySQL binlog 与 Canal Docker 部署

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-22 | 订正 | Hash 底层编码补充说明：Redis 7.0 起以 ListPack 替代 ZipList |
| 2026-07-22 | 订正 | Spring Boot 配置前缀更新为 spring.data.redis（Spring Boot 3.x） |
| 2026-07-22 | 订正 | Codis 标注“已停维” |
| 2026-07-22 | 审查 | 全面审查，核心内容完备 |
| 2026-08-18 | 订正 | 修复归档目录链接：Docsify 无法渲染目录路由，统一指向归档来源地图或直接 GitHub 目录 |
| 2026-08-18 | 订正 | 将归档来源地图链接从相对路径改为绝对 Docsify 路由 /md/archive/README?id=xxx，避免生成 #/../archive/README 导致 404 |
| 2026-08-23 | 新增 | 按分区核对报告补齐 14 个缺失点：Redis 为什么快、SDS、Dict 渐进式 rehash、ZipList 连锁更新、跳表选型、List/PubSub 队列缺陷、Stream XCLAIM 转移、JVM 锁失效动机、秒杀超卖与乐观锁、Feed 流推拉结合、分布式/本地缓存对比、Canal 工作原理、BigKey UNLINK 删除、集群代价与主从优先选型 |
| 2026-08-23 | 订正 | 2.2 节 SETNX 示例改为 SET key value NX EX 10（SETNX 不接受 EX 参数） |
| 2026-08-26 | 重构 | 统一前置阅读时间/建议，原文归档移至文末 |
