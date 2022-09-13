[toc]
![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCE3c3e8090461ef82b5bcca39c199fd1bd)
## database/sql
database/sql是Go语言提供的一个用来访问面向行的数据库的包，提供了非常轻量级的通用接口来访问各种不同的底层关系型数据库。

database/sql是一个通用的接口，其与底层的数据库不是绑定的，你可以轻松地切换你的底层数据库而无需更改你的Go程序。这同时意味着database/sql中不可能包含了针对每一种数据库的驱动，具体需要使用某个数据库时，你还需要使用相应的驱动的包。
```go
import (
        "database/sql"
        _ "github.com/go-sql-driver/mysql"
)    

func init() {
        sql.Register("mysql", &MySQLDriver{})
}

```
> 注意我们将driver导入为匿名包，代码中我们是不能直接使用其中的内容的，但是其中的init()函数会被执行，init()函数内容如下，可以看到其中将mysql的driver注册到了database/sql中。

## 访问数据库
```go
func main() {
        db, err := sql.Open("mysql",
                "user:password@tcp(127.0.0.1:3306)/hello")
        if err != nil {
                log.Fatal(err)
        }
        defer db.Close()
}
```
> 注意这里的Open()有些违反直觉，其并没有创建任何连接，第一个真正的连接直到被使用时才创建，如果你想要立马检查你对数据库连接是否可用，可以使用Ping()函数
```go
err = db.Ping()
if err != nil {
        // do something here
}
```
> 最后一点关于sql.DB的提醒就是，最佳编程范式是仅程序中仅创建和关闭一次，将其视为一个长期存活的对象，不要反复调用Open()和Close()。

## 查询操作
```go
var (
        id int
        name string
)
rows, err := db.Query("select id, name from users where id = ?", 1)
if err != nil {
        log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
        err := rows.Scan(&id, &name)
        if err != nil {
                log.Fatal(err)
        }
        log.Println(id, name)
}
err = rows.Err()
if err != nil {
        log.Fatal(err)
}
```
> 只有一点值得额外注意，如果你循环执行了多次查询，不要在循环中使用defer rows.Close()，因为defer到函数退出时才会执行，这样会占用很多系统资源，应该在循环尾部显式调用rows.Close()。
```go
stmt, err := db.Prepare("select id, name from users where id = ?")
if err != nil {
        log.Fatal(err)
}
defer stmt.Close()
rows, err := stmt.Query(1)
if err != nil {
        log.Fatal(err)
}
defer rows.Close()
for rows.Next() {
        // ...
}
if err = rows.Err(); err != nil {
        log.Fatal(err)
}

// 简单查询
var name string
err = db.QueryRow("select name from users where id = ?", 1).Scan(&name)
if err != nil {
        log.Fatal(err)
}
fmt.Println(name)

```