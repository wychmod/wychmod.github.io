
# 1.什么是数据库的事务

```sql
select version();
show variables like '%engine%';
show global variables like "tx_isolation";
```

## 1.1 事务的定义

事务是数据库管理系统(DBMS) 执行过程中的一个逻辑单位，由一个有限的数据库操作序列构成。

1. 所谓的逻辑单位，意味着它是数据库最小的工作单元，是不可以再分的。
2. 它可能包含了一个或者一系列的DML语句，包括 insert delete update.

## 1.2 哪些存储引擎支持事务

除了做集群的NDB 之外，只有Inn oDB支持事务，这个也是它成为默认的存储引擎
的 一个重要原因。

## 1.3 事务的四大特性

- 原子性: 要么都成功要么都失败
	实现： 通过undo log 来实现的，它记录了数据修改之前的值(逻 辑日志)，一旦发生异常，就可以用undo 10g 来实现回滚操作。
- 隔离性：很多个的事务，对表或者行的并发操作，应该是透明的，互相不干扰的。
	实现：
	1. 对于普通的select使用快照(snapshot read),底层使用Multi version currency control(mvcc)来实现.
	2. 加锁的select,底层使用记录锁，或者间隙锁，临键锁。
- 持久性: 
	实现：redolog和doublewritebuffer (双写缓冲)来实现的，先写到内存的buffer pool 里面，同时记录redo log，如果在刷盘之前 出现要特，在理高后說阿以续现redo1oo12各，一入到裝理，(保近数据的父性。
- 一致性： 数 据 库 的完整性约束没有被破坏 ，事务执行的前后都是合法的数据状态。