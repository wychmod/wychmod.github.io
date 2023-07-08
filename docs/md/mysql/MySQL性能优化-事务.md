
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

