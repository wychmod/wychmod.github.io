# 1. 索引是什么
## 1.1 索引是什么
数据库索引，是数据库管理系统(DBMS) 中一个排序的数据结构，以协助快速查询、更新数据库表中数据。

### 1.1.1 索引类型

在InnoDB里面，索引类型有三种，普通索引、唯 一索引(主键索引是特殊的唯—索引) 、全文索引。

全文(Ful text):针对比较大的数据，比如我们存放的是消息内容、一篇文章，有几KB的数据的这种情况，如果要解决like 查询在全文匹配的时候效率低的问题，可以创建全文索引。只有文本类型的字段才可以创建全文索引，比如char、varchar、text。

```sql
CREATE TABLE 'fulltext test (
"content' varchar(50) DEFAULT NULL, FULLTEXT KEY content' (content')
);

# 语法:
select *from fulltext test where match(content) against('三体'INNATURALLANGUAGEMODE);
```

# 2.