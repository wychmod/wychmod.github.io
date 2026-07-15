# 并发和Goroutine

## Goroutine
- go语言的go关键字跑的就是协程，我们称为goroutine。

简单用法
```go
import (
	"fmt"
	"time"
)

func hello(i int) {
	println("hello goroutine : " + fmt.Sprint(i))
}

func HelloGoRoutine() {
	for i := 0; i < 5; i++ {
		go func(j int) {
			hello(j)
		}(i)
	}
	time.Sleep(time.Second)
}
```
## 并发的通信
> 并发程序之间的通信，一般都是通过共享内存的形式实现通信，临界区一般需要加锁保护。

![image.png](https://note.youdao.com/yws/res/e/WEBRESOURCEc8f552d92f942bad686457ae7ccfda0e)

> 而go语言采取的是通过通信来实现共享内存，这个过程是反过来的，但用起来更为直观。

## Channel
![image.png](https://note.youdao.com/yws/res/e/WEBRESOURCE01dd279f583e62d09b957b72332c87be)

通过内置函数 make 可以得到两种类型的 channel 。

> channel是类似于引用的一个类型，如果直接通过var声明定义是没法初始化得到内部内存的，故记得通过make创建channel。还有就是记得不用的时候关闭。

简单使用
```go
func main() {
	var src chan int
	src = make(chan int)//不带缓冲
	dest := make(chan int, 3)//带缓冲
	go func() {
		defer close(src)
		for i := 0; i < 10; i++ {
			src <- i//生产
		}
	}()
	go func() {
		defer close(dest)
		for i := range src {//消费者1
			dest <- i * i
		}
	}()
	for i := range dest {//消费者2
		println(i)
	}
}

```
> **使用带缓冲channel的好处**
在一个生产者消费者模型中，生产者的生产效率远高于消费者，那么可以使用带缓冲的channel，防止生产者因为等待消费者消费过程而产生阻塞。反之对消费者来说也是受用的。

## 并发安全
### 互斥锁
> go语言并没有对加锁机制的弃用，标准库里面仍然有sync.Mutex。
```go
package main

import (
	"fmt"
	"sync"
	"time"
)
var(
	x int
	mut sync.Mutex
)
func AddWithLock() {
	mut.Lock()
	for i:=0;i<2000;i++ {
		x++
	}
	mut.Unlock()
}

func AddWithoutLock()  {
	for i:=0;i<2000;i++ {
		x++
	}
}

func main() {
	//开五个协程的锁版本，再打印最终结果
	for i := 0; i < 5; i++ {
		go AddWithoutLock()
	}
	//等待上面的协程执行结束
	time.Sleep(time.Second)
	fmt.Println(x)

	//有锁版本
	x = 0
	for i:=0;i<5;i++{
		go AddWithLock()
	}
	time.Sleep(time.Second)
	fmt.Println(x)
}


```
### 计数信号量
> WaitGroup 是一个计数信号量，可以用来记录并维护运行的 goroutine。如果 WaitGroup的值大于 0，Wait 方法就会阻塞
```go
package main

import (
	"fmt"
	"sync"
)

func hello(){
	fmt.Println("hello")
}
func main() {
	var wg sync.WaitGroup
	wg.Add(5)
	for i := 0; i < 5; i++ {
		go func() {
			defer wg.Done()
			hello()
		}()
	}
	wg.Wait()
}


```

# 依赖管理
- Go依赖管理的演进：

```
flowchart LR
    GOPATH --> GoVendor --> GoModule
```
## GOPATH
go语言有一个内置的全局环境变量GOPATH，指定了GOPATH文件夹后，他会在这个文件夹内创建以下三个文件夹：
|——bin：项目编译的二进制文件
|——pkg：项目编译的中间产物，加速编译
|——src：项目源码
项目直接依赖src下的代码，go get命令下载的软件包都会在src目录下。

## GOPATH弊端
![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCEbd27c51c9d17109c30da911c56e3dfe5)
当我们对某个依赖进行升级后，则项目A依赖的版本可能无法实现兼容，这就是GOPATH无法解决的多版本控制问题。

## Go Vendor
为了解决多版本控制问题，go又增加了Go Vendor的方式来管理依赖。
使用govendor init 在项目根目录会生成vendor文件夹，其中存放了当前项目依赖的副本。在Vendor机制下，如果当前项目存在Vendor目录，会优先使用该目录下的依赖，如果依赖不存在，会从GOPATH中寻找；这样解决了更新GOPATH依赖源码后之前的版本不兼容的问题。

## Go Vendor弊端
![image.png](https://note.youdao.com/yws/res/f/WEBRESOURCEb95c5e0218f5f9de9dd6683d8709caef)
弊端很明显，无法解决依赖的依赖。
同样还是无法解决依赖的冲突。
归根到底vendor不能很清晰的标识依赖的版本概念。

## Go Module （最终解决方案
- 通过 go.mod 管理依赖包版本。
- 通过 go get/mod 工具管理依赖包。
最终目标：定义版本规则和管理项目的依赖关系。

### 依赖管理三要素
1. 配置文件，描述依赖 （对应go.mod）
2. 中心仓库管理依赖库 （GoProxy）
3. 本地工具 go get/mod

![image.png](https://note.youdao.com/yws/res/6/WEBRESOURCEff8c5e54deb189b574133228f0820686)

> gopath和govendor都是源码副本方式依赖，没有版本规则概念，而gomod为了放方便管理则定义了版本规则。

对于语义化版本有如下规则：

- MAJOR：表示是不兼容的 API，所以即使是同一个库，MAJOR 版本不同也会被认为是不同的模块。
- MINOR：通常是新增函数或功能，向后（向下）兼容。
- PATCH：修复 bug。
- 版本号后面添加 //indirect 表示间接依赖。

## 中心仓库管理依赖库
### 依赖的分发
![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCE797d86ab348184782dfbfab685d2d8c2)
如果直接向代码托管平台进行依赖的请求，很快会发现有以下这些问题：

- 无法保证构建的稳定性（可能代码仓库的所有者更改删除了包版本
- 无法保证可用性
- 增加了平台压力

为了很好的解决以上依赖分发的问题，go采用Proxy进行代理分发。
![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCE9b02a9584642f685b344d03c06e920d7)
Go Proxy 是一个服务站点，它会缓源站中的软件内容，缓存的软件版本不会改变，并且在源站软件删除之后依然可用。

![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCE9f1075ec34a477056e324b4a6d015de7)

### 本地工具
> go get命令
![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCE9b32ac24735a7b76fa9bc45d82f2ab00)
> go mod命令
![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE5690074ce319d13bba5ee845f5b5a73a)

# 测试
## 为什么要测试？
测试是避免事故发生的最后一道关口！
![image.png](https://note.youdao.com/yws/res/e/WEBRESOURCEd5d4461fb99cee595d5193c26b694f7e)

## 测试类型
![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCE8cce7e9ea6ec094be6a2c5fe7a43e96c)
- 回归测试：是指修改了旧代码后，重新测试以确认修改没有引入新的错误或导致其他代码产生错误。
- 集成测试：集成测试的目的是在集成这些不同的软件模块时揭示它们之间交互中的缺陷。
- 单元测试：单元测试测试开发阶段，开发者对单独的函数、模块做功能验证。
> 层级从上至下，测试成本逐渐减低，而测试覆盖率确逐步上升，所以单元测试的覆盖率一定程度上决定这代码的质量。

## 单元测试
### go单测的规则
![image.png](https://note.youdao.com/yws/res/e/WEBRESOURCE6e4332545384dfb445566ab29f3d7f4e)![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCEdfe57c70754e1ef8761762e583e6f8bc)

### go单测实例
```go
package main

import "testing"

func TestManyGo(t *testing.T) {
	HelloGoRoutine()
}

package main

import "testing"

func TestManyGo(t *testing.T) {
	HelloGoRoutine()
}

```
### 衡量单元测试的标准
![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCE657e99cc8589642dc2832865a4548d10)

### 代码覆盖率
![image.png](https://note.youdao.com/yws/res/b/WEBRESOURCEf7a4a70c1feadf235ddec820c48995bb)

## 打桩测试
![image.png](https://note.youdao.com/yws/res/e/WEBRESOURCEb7ec406d2cc6799c18a07073e135fcbe)
- 稳定：稳定是指相互隔离，能在任何时间，任何环境，运行测试。
- 幂等：幂等是指每一次测试运行都应该产生与之前一样的结果。

如果在有外部依赖的情况下进行单测，换一个测试环境，那么这个外部依赖信息可能会发生变化，比如需要打开某个文件，如果你把这个给别人测试，那么在他本地的文件路径肯定就不一致。这就完全没法符合稳定和幂等两个条件。

所谓打桩就是通过你指定的行为来对原本的行为替换，到计算机语言里面来讲就是通过你定义的桩函数把原本的函数进行替换，这就是打桩。

- 隔离：将测试任务从产品项目中分离出来，使之能够独立编译、链接，并独立运行。


- 补齐：用桩来代替未实现的代码，例如，函数A调用了函数B，而函数B由其他程序员编写，且未实现，那么，可以用桩来代替函数B，使函数A能够运行并测试。


- 控制：控制是指在测试时，人为设定相关代码的行为，使之符合测试需求。

> go语言的打桩实现原理：在运行时通过通过 Go 的 unsafe 包，将内存中函数的地址替换为运行时函数的地址。 将待打桩函数或方法的实现跳转到。

![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCEd75b5daada7b1d2aa063320f1790110d)

## 基准测试（Benchmark）
很多时候我们需要清楚代码的运行效率，这个时候，我们就需要对代码进行基准测试了。
基准测试需要遵循以下语法规定：

1. go语言中的基准测试也是基于单元测试，所以还是需要遵循 *_test.go 的命名规则。
2. 用于基准测试的函数名必须以Benchmark开头。
3. 函数的入参需要是 *testing.B 。

```go
package benchmark

import (
	"github.com/bytedance/gopkg/lang/fastrand"
	"math/rand"
)

var ServerIndex [10]int

func InitServerIndex() {
	for i := 0; i < 10; i++ {
		ServerIndex[i] = i+100
	}
}

func Select() int {
	return ServerIndex[rand.Intn(10)]
}

func FastSelect() int {
	return ServerIndex[fastrand.Intn(10)]
}

package benchmark

import (
	"testing"
)

func BenchmarkSelect(b *testing.B) {
	InitServerIndex()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		Select()
	}
}
func BenchmarkSelectParallel(b *testing.B) {
	InitServerIndex()
	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			Select()
		}
	})
}
func BenchmarkFastSelectParallel(b *testing.B) {
	InitServerIndex()
	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			FastSelect()
		}
	})
}
```
> 我们对Benchmark的代码进行以下讲解：
> 1. 对一个测试用例的默认测试时间是 1 秒，当测试用例函数返回时还不到 1 秒，那么 testing.B 中的 N 值将按 1、2、5、10、20、50……递增，并以递增后的值重新进行用例函数测试。
> 2. Resttimer重置计时器，我们在reset之前做了init或其他的准备操作，这些操作不应该作为基准测试的范围。
> 3. runparallel是多协程并发测试。
![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCE16ce8930b9ee8c2060a233427da887d7)

多线程的测试反而效率更慢了。

主要原因是rand为了保证全局的随机性和并发安全，持有了一把全局锁。

**fastrand主要的实现思路是牺牲了一定的数列一致性，在大多数场景是适用的，同学在后面遇到随机的场景可以尝试用一下。**

# 项目实战
## 需求描述
- [x]  展示话题（标题，文字描述）和回帖列表
- [x] 暂不考虑前端页面实现，仅实现一个本地的web服务
- [x] 话题和回帖数据用文件存储
![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCE327c7199e08780cbd276e0457fb67d79)
![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCE835d79bc823a203ba3a78cf684c0df55)
![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE77b4b3b61faac8cd5a74988ba33f88ba)
