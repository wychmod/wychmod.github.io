# MySQL 数据库

> **原文归档**：[`archive/old-mysql-notes/`](../../archive/old-mysql-notes/)
> 包含：MySQL 性能优化 4 篇 + MySQL 是怎样使用/运行的（共 280KB）+ 手写数据库

---

## 一、MySQL 性能优化

> 📚 完整笔记见归档目录

### 1.1 架构优化

> 📚 [MySQL性能优化-架构.md](../../archive/old-mysql-notes/MySQL性能优化-架构.md)（16KB）

- 主从复制（一主多从）
- 读写分离（应用层路由 / 中间件 MyCat / ProxySQL）
- 分库分表（垂直 / 水平）
- 冷热数据分离

### 1.2 索引优化

> 📚 [MySQL性能优化-索引.md](../../archive/old-mysql-notes/MySQL性能优化-索引.md)（10KB）

**索引类型**：
- B+ 树索引（默认）
- 哈希索引（Memory 引擎）
- 全文索引（FULLTEXT）
- 空间索引（SPATIAL）

**索引设计原则**：
- 高区分度列优先（count(distinct) / count(*) 接近）
- 短列优先（int > varchar(50) > text）
- 最左前缀匹配
- 避免过度索引（影响写入）

**索引失效场景**：
- 函数 / 表达式计算
- 类型转换
- 前导模糊查询（LIKE '%xxx'）
- 不满足最左前缀
- OR 条件一侧无索引

### 1.3 事务优化

> 📚 [MySQL性能优化-事务.md](../../archive/old-mysql-notes/MySQL性能优化-事务.md)（16KB）

**ACID**：
- A：原子性（要么全成要么全败）
- C：一致性（数据约束保持）
- I：隔离性（并发互不干扰）
- D：持久性（落盘后不丢）

**隔离级别**（从低到高）：
- 读未提交（脏读）
- 读已提交（不可重复读）
- **可重复读**（MySQL 默认，幻读）
- 串行化（无并发）

**MVCC** 多版本并发控制：
- 每行记录有隐藏列：trx_id + roll_pointer
- Read View 决定可见性
- 解决读-写冲突，**不加锁实现非阻塞读**

### 1.4 总结

> 📚 [MySQL性能优化-总结.md](../../archive/old-mysql-notes/MySQL性能优化-总结.md)（9KB）

**优化清单**：
1. 表结构设计（范式 vs 反范式）
2. 索引优化（最左前缀 / 覆盖索引）
3. SQL 优化（EXPLAIN 分析）
4. 配置优化（innodb_buffer_pool_size）
5. 架构优化（分库分表 / 读写分离）
6. 硬件优化（SSD / 内存）

## 二、MySQL 是怎样运行的

> 📚 [MySQL是怎样运行的.md](../../archive/old-mysql-notes/MySQL是怎样运行的.md)（130KB，已归档）

**MySQL 整体架构**：

```
客户端 → 连接器 → 查询缓存（8.0 移除）→ 分析器 → 优化器 → 执行器 → 存储引擎
                                                                  ↓
                                                            InnoDB / MyISAM
```

**InnoDB 核心组件**：
- 缓冲池 Buffer Pool（**核心**）
- Redo Log（重做日志，crash-safe）
- Undo Log（回滚日志，MVCC）
- Binlog（归档日志，主从复制）
- Change Buffer（二级索引写入优化）
- Adaptive Hash Index（自适应哈希）

**SQL 执行流程**：
1. 连接器：建立连接 + 鉴权
2. 分析器：词法 + 语法分析 → 解析树
3. 优化器：选择最优执行计划（索引、JOIN 顺序）
4. 执行器：调用存储引擎接口
5. 存储引擎：操作磁盘数据

**事务日志两阶段提交**：
- 写入 Redo Log（prepare）
- 写入 Binlog
- 提交 Redo Log（commit）
- 保证 Redo Log 和 Binlog 一致性

## 三、MySQL 是怎样使用的

> 📚 [MySQL是怎样使用的.md](../../archive/old-mysql-notes/MySQL是怎样使用的.md)（118KB，已归档）

实战操作：建表 / CRUD / 索引使用 / 事务 / 锁 / 性能调优 / 主从复制配置 / 备份恢复等。

## 四、手写数据库

> 📚 [手写数据库.md](../../archive/old-mysql-notes/手写数据库.md)（472B 极简，已归档）

通过手写一个简化版数据库（KV 存储 + SQL 解析）理解底层原理。

---

## 五、2026 年 MySQL 生态

| 维度 | 主流 |
|---|---|
| MySQL 版本 | 8.0+ LTS（8.4 长期支持） |
| 引擎 | InnoDB 唯一主流 |
| 高可用 | MHA / MGR（Group Replication） / Orchestrator |
| 代理 | ProxySQL / MaxScale / DBProxy |
| 分库分表 | ShardingSphere / Apache Doris / TiDB |
| 云托管 | 阿里云 RDS / 腾讯云 CynosDB / AWS Aurora |
| OLAP | ClickHouse / Doris / StarRocks |
| 同步 | Canal / Debezium（CDC） |
| 监控 | Prometheus + mysqld_exporter + Grafana |

> ⚠️ **过时警示**：2018 年的笔记里"读写分离 + 分库分表"是金科玉律，2026 年这些仍是基础但已不是全部。新趋势：**HTAP**（TiDB / Doris）、**Serverless DB**（Aurora Serverless）、**云原生数据库**（PolarDB）。

---

## 📚 完整资料

- [`archive/old-mysql-notes/`](../../archive/old-mysql-notes/) — 7 个 MySQL 笔记完整归档
