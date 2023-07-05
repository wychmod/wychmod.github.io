
![](../youdaonote-images/Pasted%20image%2020230703235814.png)

## 1、MySQL语句的执行流程
### 1. 客户端与服务端链接
通信类型：同步/异步 通常是同步
连接方式：长连接/短连接 通常是长连接
协议：TCP/Unix Socket 客户端是TCP 本机是Unix Socket

### 2. 一条查询SQL语句是如何执行的?
![image.png](../youdaonote-images/WEBRESOURCE8dad609ccd37e4f45c7d742c6c5891c0.png)

#### 1. 连接
查看 MySQL 当前有多少个连接:
```sql
show global status like 'Thread%';
```
客户端每产生 一个连接或者一个会话，在服务端就会创建一个线程来处理。反过来如果要杀死会话，就是Kill 线程。服务器并不会立即线程销毁掉，而是把它缓存起来，在另一个新的客户端再进行连接时，把这个缓存的线程分配给该新客户端。

分配线程的话，保持连接肯定会消耗服务端的资源。MySQL 会把那些长时间不活动的 (SLEEP)连接自动断开。

```sql
show global variables like 'wait_timeout'; --非交互式超时时间， 如JDBC 程序 

show global variables like 'interactive_timeout' ; -- 交互式超时时间，如数据库工具
```

默认都为8小时。默认最大连接数是151个，最大可以为100000个。



## 2、理解MySQL的架构与内部模块
## 3、InnoDB存储引擎的磁盘与内存结构

