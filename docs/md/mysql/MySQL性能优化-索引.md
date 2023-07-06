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

# 2. 索引存储模型推演
## 2.1 二分查找

可以考虑用有序数组作为索引的数据结构。有序数组的等值查询和比较查询效率非常高，但是更新数据的时候会出现 一个问题，可能要挪动大量的数据 (改变index)，所以只适合存储静态的数据。

为了支持频繁的修改，比如插入数据，我们需要采用链表。链表的话，如果是单链表，它的查找效率还是不够高。

## 2.2 二叉查找树(BSTBinarySearch Tree)

**高效查找的链表**

在子树所有的节点都小于父节点，右子树所有的节点都大于父节点。投脱到平圃以后，就是一个有序的线性表。二叉查找树既能够实现快速查找，又能够实现快速插入。

最坏情况是查找效率变成On，变成斜树。

![](../youdaonote-images/Pasted%20image%2020230706213610.png)



## 2.3 平衡二叉树 (AVL Tree)(左旋、右旋)

平衡二叉树的定义:左右子树;深度差绝对值不能超过1。通过左旋右旋保持平衡。

![](../youdaonote-images/Pasted%20image%2020230706214148.png)

### 2.3.1 AVL树用于存储索引数据
**可能会出现如下问题**：
当我们用树的结构来存储索引的时候，访问一个节点就要跟磁盘之间发生一次IO操作。InnoDB操作磁盘的最小的单位是一页（或者叫一个磁盘块），大小是16K。一个树的节点必须设计成16K的大小，不然就会出现读不够的情况。

如果只是键值+数据+引用是非常小的，如果一个单元只存一个信息，就需要很多次IO操作。

**为了解决这个问题**：

1. 让每个节点存储更多的数据
2. 节点上的关键字的数量越多，我们的指针数也越多，也就是意味着可以有更多的分叉。
分叉越多，树的深度越少，io次数越少。

## 2.4 多路平衡査找村(BTree)(分裂、合井)

跟AVL树一样，B树在枝节点和叶子节点存储键值、数据地址、节点引用。

特点:分叉数 (路数)永远比关键字数多1。

节点的分裂和合并，其实就是lnnoDB页的分裂和合并。所以不在频繁更新的列上建立索引。

如果索引键值有序，写满一页接着开辟一个新的页。如果索引键值无序，存储过程造成大量磁盘碎片，带来频繁的page 分裂和合并。

![](../youdaonote-images/Pasted%20image%2020230706222807.png)

![](../youdaonote-images/Pasted%20image%2020230706222925.png)

![](../youdaonote-images/Pasted%20image%2020230706222940.png)

![](../youdaonote-images/Pasted%20image%2020230706222949.png)



## 2.5 B+树(加强版多路平衡查找树)

![image\_1cacafpso19vpkik1j5rtrd17cm3a.png-158.1kB](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/4/9/16a01bd2a6c7a65f\~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp "image_1cacafpso19vpkik1j5rtrd17cm3a.png-158.1kB")

特点：

