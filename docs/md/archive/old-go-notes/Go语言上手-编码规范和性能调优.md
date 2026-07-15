# Go语言上手-编码规范和性能调优

## 编码规范
### 注释
- 注释实现过程
- 注释函数的含义（如果函数名本身能概括的则不需要注释）
- 包中声明的每个公共符号：变量常量函数以及结构都要加注释
- 任何不明显也不简短的公共功能必须注释
- 库中所有函数必须注释

> 注释应提供代码未表达出的上下文信息。

### 变量命名
- 简洁
- 缩略词都大写，比如HTTP不要Http
- 变量定义的位置距离使用的地方越远，命名需要越详细，特别是全局变量，有时需要注释

```go
//good 
func (c *Client) send(req *Request, deadline time.Time)
//bad
func (c *Client) send(req *Request, t time.Time)

```
#### 包内
- 函数名应该不携带报名的上下文信息。
> 例如在http包中有个Serve方法和ServeHTTP方法这两个命名，我们应该选择Serve去命名而不是ServeHTTP。因为我们使用的时候会携带包名。类比于C++的命名空间，Java的包名。

#### 包命名
- 只有小写字母组成（不包含下划线等字母
- 简短并包含一定的信息
- 不要和标准库的包冲突，标准库的很多包名喜欢用复数，我们应该避免使用复数形式为包名，比如strings是标准库的一个包名。

### 控制流程
#### 嵌套条件校验链
```go
if a>10 {
    if b>10 {
        if c>10 {
            ...
        }
    }
}

for {
    if !(a>10) {
        break
    }
    if !(b>10) {
        break
    }
    if !(c>10) {
        break
    }
    ...
}
```

### 错误处理
#### error相关的函数
**errors.New()**
```go
return errors.New("需要的错误信息描述")

```
**errors.Is()**
> 用于判断错误断言，不同于简单的==，它能够判断错误链中是否包含它。

**errors.As()**
![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCE3efcdc6a9e3797221efb2f945c582f32)

## 性能调优
### benchmark测试
![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCE1b7032109cadee0b310ff259ca51a48d)

### slice的问题
- 更新slice后持有的底层数组相同。
具体而言：有时我们只是想要底层数组的一小部分，结果因为简单切个片，然后就和他共用了同一片底层数组。go的垃圾回收机制在某种程度上和C++智能指针(引用计数)很相似，如果此时大的数组实际上已经没用了，而有用的只有小数组，而它们是共用同一片底层数组，此时这整个底层数组的空间会得不到释放，因为引用计数不为零！算是意外延长了生命周期。

### 关于string可变与不可变的优化
go语言和Java等等语言都把string设置为了不可变，我觉得这样设置是非常合理的，毕竟字符串在使用过程中，多数情况下都是传递，而且可以利用不可变做很多优化，比如内存池之类的。
#### string不可变的缺陷
一旦string不可变，就意味着，每次得到一个新的字符串就需要申请一片新的内存，那么这样的话，多次字符串拼接的过程中将会有严重的性能损失！

每次 += 右边的值都会引起内存的分配。
```go
s := "aa"
for i:=0;i<size;i++{
    s += "ccc"
}

```
#### 解决方案
- 使用strings.Builder。
- 使用bytes.Builder
```go
var s strings.Builder
for i:=0;i<size;i++{
    s.WriteString("cc")
}
s.String()

var s bytes.Buffer
for i:=0;i<10;i++{
    s.WriteString("cc")
}
s.String()

```
> 第一种解决方案比第二种要快。因为在最后的String()阶段bytes包的处理方式是再进行一次切片处理。而strings包则是直接指针强转。

#### 可变string的优化
即便是使用了 const& 进行字符串的传递，从实践来看，它至少有以下几方面问题：

1. 字符串字面值、字符数组、字符串指针的传递仍要数据拷贝 这三类低级数据类型与string类型不同，传入时，编译器需要做隐式转换，即需要拷贝这些数据生成string临时对象。const string&指向的实际上是这个临时对象。通常字符串字面值较小，性能损耗可以忽略不计；但字符串指针和字符数组某些情况下可能会比较大（比如读取文件的内容），此时会引起频繁的内存分配和数据拷贝，会严重影响程序的性能。
2. substr O(n)复杂度 这是一个特别常用的函数，好在std::string提供了这个函数，美中不足的是其每次都返回一个新生成的子串，很容易引起性能热点。实际上我们本意并不是要改变原字符串，为什么不在原字符串基础上返回呢？

#### 解决方案
- 方案一：SSO优化
SSO，全称为：小字符串优化。
这个优化简单粗暴，就是根据字符串的长度来决定内存的开辟情况。
比如字符串长度如果小于128字节，那么内存就开辟在栈上面，众所周知，栈内存开辟比堆内存开辟的代价小很多！
- 方案二：string_view（C++17引入）
通过提供一个新的类型，这个类型和不可变的字符串的类型类似，它是不可变的，只能看，不然怎么叫view🤭
每次string赋值给它，代价都很小，不是直接拷贝字符串，而是指针的赋值而已。
而且string_view重写了substr，这个方法返回string_view而且你会发现通过它再构建string性能会比string调用substr快很多。
string_view虽然解决了拷贝问题，但是依旧没有解决C++的内存安全问题，string_view内部是原始指针，不会意外延长生命周期，所以要非常注意它所观察的字符串内存是否被释放了，如果被释放string_view将失效，将会产生严重的内存安全问题。

### 空结构体的使用
> 空结构体，不占内存，仅作为占位符，所以可以作为map实现set的理想工具。

![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCE2bb3acca5823bee124e799b61d3d363c)

### atomic包
> 用atomic保护变量的并发安全，用sync.Mutex保护一段代码逻辑的并发安全。
![image.png](https://note.youdao.com/yws/res/f/WEBRESOURCEc970ac673f66da611b9c9af4a0d5422f)
对于非数值变量，可以使用atomic.Value来承载一个空接口。