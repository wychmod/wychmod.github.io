[toc]

# 性能监控

## 使用show profile查询剖析工具，可以指定具体的type
- all：显示所有性能信息    show profile all for query n

- block io：显示块io操作的次数   show  profile block io for query n

- context switches：显示上下文切换次数，被动和主动   show profile context switches for query n

- cpu：显示用户cpu时间、系统cpu时间    show profile cpu for query n

- IPC：显示发送和接受的消息数量    show profile ipc for query n

- page faults：显示页错误数量    show profile page faults for query n

- source：显示源码中的函数名称与位置    show profile source for query n

- swaps：显示swap的次数    show profile swaps for query n
```sql
# 此工具默认是禁用的，可以通过服务器变量在会话级别动态的修改
set profiling = 1;

# 当设置完成之后，在服务器上执行的所有语句，都会测量其耗费的时间和其他一些查询执行状态变更相关的数据。
select * from tuser;

# 在mysql的命令行模式下只能显示两位小数的时间，可以使用如下命令查看具体的执行时间
show profiles;

# 执行如下命令可以查看详细的每个步骤的时间：
show profile for query 1;
```
