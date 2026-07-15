# Redis 缓存

> **原文归档**：[`archive/old-redis-notes/`](../../archive/old-redis-notes/)
> 包含：8 篇 Redis 笔记（最大 158KB）+ 3 安装指南

---

## 一、Redis 基础

### 1.1 入门

> 📚 [1-Redis入门.md](../../archive/old-redis-notes/1-Redis入门.md)（30KB，已归档）

**Redis 是什么**：
- 基于内存的**键值存储**
- 支持多种数据结构（String / List / Hash / Set / ZSet / Stream / Bitmap / HyperLogLog）
- 单线程 + IO 多路复用
- 持久化（RDB + AOF）
- 主从 + 哨兵 + Cluster

**为什么快**：
- 内存操作（vs 磁盘）
- 单线程（无锁 / 无上下文切换）
- IO 多路复用（epoll）
- 简单高效的数据结构

### 1.2 实战

> 📚 [2-Redis实战.md](../../archive/old-redis-notes/2-Redis实战.md)（**158KB** 完整版，已归档）

涵盖：基本命令、Pipeline、事务、Lua 脚本、发布订阅、Stream、客户端选型等。

### 1.3 原理

> 📚 [3-原理篇.md](../../archive/old-redis-notes/3-原理篇.md)（56KB，已归档）

**底层数据结构**：
- SDS（简单动态字符串）
- 链表
- 字典（哈希表）
- 跳跃表（ZSet）
- 整数集合（intset）
- 压缩列表（ziplist）
- quicklist（3.2+）
- listpack（7.0+）

**内存管理**：
- 多种编码（embstr / int / raw / hashtable / ziplist / skiplist）
- 内存回收（引用计数 + 定期扫描）
- 内存碎片整理（activedefrag）

### 1.4 Stream 消息队列

> 📚 [4-RedisStream消息队列.md](../../archive/old-redis-notes/4-RedisStream消息队列.md)（17KB，已归档）

**Stream**（5.0+）= Redis 内置消息队列：
- Consumer Group
- ACK 机制
- Pending List
- 替代简易 Kafka 场景

## 二、Redis 高级

### 2.1 多级缓存

> 📚 [Redis高级-多级缓存.md](../../archive/old-redis-notes/Redis高级-多级缓存.md)（48KB，已归档）

**典型架构**：
```
浏览器缓存 → CDN → Nginx → 应用本地缓存（Caffeine）→ Redis → DB
```

**缓存策略**：
- Cache-Aside（旁路缓存，最常用）
- Read-Through
- Write-Through
- Write-Behind

**缓存三大问题**：

| 问题 | 场景 | 解决 |
|---|---|---|
| **雪崩** | 大量 key 同时过期 | 过期时间随机化 + 熔断 + 集群 |
| **穿透** | 查询不存在 key | 布隆过滤器 + 缓存空值 |
| **击穿** | 单个热点 key 过期 | 互斥锁 + 永不过期 + 提前回填 |

### 2.2 分布式缓存

> 📚 [Redis高级-分布式缓存.md](../../archive/old-redis-notes/Redis高级-分布式缓存.md)（24KB，已归档）

**主从复制**：
- 全量同步（replication id + offset）
- 增量同步（repl_backlog）
- 命令传播

**哨兵模式（Sentinel）**：
- 自动故障检测
- 主从自动切换
- 客户端连接

**Cluster 集群**：
- 16384 个 slot
- 数据分片
- 节点间通信（Gossip）

### 2.3 最佳实践

> 📚 [Redis高级-最佳实践.md](../../archive/old-redis-notes/Redis高级-最佳实践.md)（30KB，已归档）

- **键设计**：业务前缀:模块:ID（`user:profile:1001`）
- **大 Key**：避免 > 10KB，单个 Hash < 1000 字段
- **慢查询**：`slowlog get` / `slowlog len`
- **内存淘汰**：`maxmemory-policy allkeys-lru`
- **pipeline**：减少 RTT
- **Lua 脚本**：原子操作

## 三、安装

- [安装Redis集群.md](../../archive/old-redis-notes/安装Redis集群.md)（14KB）— Cluster 部署
- [安装OpenResty.md](../../archive/old-redis-notes/安装OpenResty.md)（5KB）— Redis 旁路缓存
- [安装Canal.md](../../archive/old-redis-notes/安装Canal.md)（3KB）— MySQL → Redis 同步

## 四、2026 年 Redis 生态

| 维度 | 主流 |
|---|---|
| Redis 版本 | 7.x（7.4 LTS） |
| 客户端 | Lettuce（Java） / redis-py / go-redis |
| 集群 | Redis Cluster / Codis / Redis Sentinel |
| 云托管 | 阿里云 Tair / AWS ElastiCache / 腾讯云 CRS |
| 替代 | KeyDB / Dragonfly（更高性能） |
| 持久化 | AOF + RDB 混合模式 |

---

## 📚 完整资料

- [`archive/old-redis-notes/`](../../archive/old-redis-notes/) — Redis 完整笔记归档
