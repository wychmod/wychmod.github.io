# python服务器端面试

## 面试流程介绍
### 学生重基础,社招重项目
- 一面问基础
- 二面问项目
- 三面问设计

### web请求的流程
![image](https://note.youdao.com/yws/res/11955/998F0BF9F0AD4A28AB451A24A4456DEE)


## Python语言基础考察点
### 猴子补丁（Monkey Patch)
1. 在运行时替换方法、属性等
2. 在不修改第三方代码的情况下增加原来不支持的功能
3. 在运行时为内存中的对象增加patch而不是在磁盘的源代码中增加

- 很多代码用到了import json， 但是后来发现ujson的性能更高， 这个时候可以用import ujson as json， 但是要每个文件都去修改， 显然很麻烦， 这里就可以用到猴子补丁
```python
import json
import ujson

def monkey_patch_json():
json.__name__ = 'ujson'
json.dumps = ujson.dumps
json.loads = ujson.loads
# json.dump = ujson.dump
# json.load = ujson.load

monkey_patch_json()
```

### 列表推导式[]变()会变成生成器推导式

### Python2和Python3区别
- print成为函数
- 编码问题，Python3不再有 Unicode对象,默认str就是unicode。
- 除法变化，Python3除号返回浮点数。
- 高级解包操作。a,b,*rest= range(10)
![image](https://note.youdao.com/yws/res/12037/32816018F1BC4B7EBFC02D99F0B51C6B)
- 限定关键字参数
- 一切返回迭代器 range,zip,map
- yield from链接子生成器
- asyncio内置库, async/ await原生协程支持异步编程
![image](https://note.youdao.com/yws/res/12046/A730820C75584D5CB4BE00E0138C0D85)

### Python的可变/不可变对象
![image](https://note.youdao.com/yws/res/12052/77926AFFF1F24D7BBA0F25892A05D4F5)

### Python可变参数作为默认参数
**默认参数只计算一次**
```python
>>> def f(l=[1]):
... l.append(1)
... print(l)
...
>>> f()
[1, 1]
>>> f()
[1, 1, 1]
```

### Python *args, **kwargs
- 用来处理可变参数
- *args被打包成 tuple
- **kwargs被打包成dict

### GIL的影响
**限制了程序的多核执行**
- 同一个时间只能有一个线程执行字节码
- CPU密集程序难以利用多核优势
- IO期间会释放GIL,对IO密集程序影响不大

### 什么是单元测试Unit Testing
- 针对程序模块进行正确性检验
- 一个函数，一个类进行验证
- 自底向上保证程序正确性

## Python算法与数据结构考察点
### 你使用过哪些常用内置算法和数据结构
- sorted
- dict/list/set/tuple
![image](https://note.youdao.com/yws/res/12086/5A391DB004BE4A9EBD0B28FA6812D65A)
![image](https://note.youdao.com/yws/res/12088/AF776FC7128C45CD816A65A20CC961ED)

### Python dict底层结构
**Python dict底层结构**
- 为了支持快速査找使用了哈希表作为底层结构
- 哈希表平均查找时间复杂度O(1)
- Cpython解释器使用二次探査解决哈希冲突问题

### Python list/ tuple区别
- list vs tuple都是线性结构,支持下标访问
- list是可变对象,tupe保存的引用不可变
- list没法作为字典的key, tuple可以(可变对象不可hash)

### 可以用orderdict实现lru最近最少使用缓存替换原则
![image](https://note.youdao.com/yws/res/12103/2BE4DC7DEAF545D0ABD09CC72130A3F1)

### 算法常考点
![image](https://note.youdao.com/yws/res/12106/7F7ECBAF486B4C45A331E2287452037D)

### 常用排序算法的时间复杂度
![image](https://note.youdao.com/yws/res/12111/301F3AB8CC0247E2A85C09D200D4EB2D)

## 编程范式考察点
### 设计模式：创建型模式Python应用面试题
#### 工厂模式( Factory):解决对象创建问题
**在设计模式中主要用于抽象对象的创建过程，让用户可以指定自己想要的对象而不必关心对象的实例化过程。**
- 解决对象创建问题
- 解耦对象的创建和使用
- 包括工厂方法和抽象工厂
```python
class Mercedes(object):
"""梅赛德斯
"""
def __repr__(self):
return "Mercedes-Benz"

class BMW(object):
"""宝马
"""
def __repr__(self):
return "BMW"

class SimpleCarFactory(object):
"""简单工厂
"""
@staticmethod
def product_car(name):
if name == 'mb':
return Mercedes()
elif name == 'bmw':
return BMW()

c1 = SimpleCarFactory.product_car('mb')
c2 = SimpleCarFactory.product_car('bmw')
```
#### 构造模式( Builder):控制复杂对象的创建
- 用来控制复杂对象的构造
- 创建和表示分离。比如你要买电脑,工厂模式直接给你需要的电脑
- 旦是构造模式允许你自己定义电脑的配置,组装完成后给你
#### 原型模式( Prototype):通过原型的克隆创建新的实例
- 通过克隆原型来创建新的实例
- 可以使用相同的原型,通过修改部分属性来创建新的示例
- 用途:对于一些创建实例开销比较高的地方可以用原型模式
#### 单例(Borg/ Singleton):一个类只能创建同一个对象
**单例模式的实现有多种方式**
- 单例模式:一个类创建出来的对象都是同一个
- Python的模块其实就是单例的,只会导入一次
- 使用共享同一个实例的方式来创建单例模式

---
**1.使用模块**
```python
class Singleton(object):
def foo(self):
pass
singleton = Singleton()

from singleton.mysingleton import singleton
```
**2. 使用装饰器**
```python
def singleton(cls):
# 单下划线的作用是这个变量只能在当前模块里访问,仅仅是一种提示作用
# 创建一个字典用来保存类的实例对象
_instance = {}

def _singleton(*args, **kwargs):
# 先判断这个类有没有对象
if cls not in _instance:
_instance[cls] = cls(*args, **kwargs) # 创建一个对象,并保存到字典当中
# 将实例对象返回
return _instance[cls]

return _singleton


@singleton
class A(object):
a = 1

def __init__(self, x=0):
self.x = x
print('这是A的类的初始化方法')


a1 = A(2)
a2 = A(3)
print(id(a1), id(a2))
```
**3. 使用类**
```python
class Singleton(object):
def __new__(cls,*args,**kwargs):
# 利用反射,看看这个类有没有_instance属性
if not hasattr(cls, '_instance'):
_instance = super().__new__(cls)
cls._instance = _instance
return cls._instance


class MyClass(Singleton):
pass

c1 = MyClass()
c2 = MyClass()
assert c1 is c2
```
缺点： 在多线程执行的过程中，如果执行的够快是没问题的，但是如果有阻塞，就会出错，形不成单例，这个时候就要加锁。在获取对象属性_instance的时候加锁,如果已经有人在获取对象了,其他的人如果要获取这个对象,就要等一哈.因为前面的那个人,可能在第一次创建对象。
#### 对象池模式(Pool):预先分配同一类型的一组实例
#### 惰性计算模式( Lazy Evaluation):延迟计算( python的 property)

### 设计模式：结构型模式Python应用面试题
### 设计模式：行为型模式Python应用面试题
### Python 函数式编程常考题
## 操作系统考察点
## 网络编程考察点
## 数据库考察点
### Mysql索引优化常考面试题
**为什么需要索引?**
- 索引是数据表中一个或者多个列进行排序的数据结构
- 索引能够大幅提升检索速度
- 创建、更新索引本身也会耗费空间和时间
![image](https://note.youdao.com/yws/res/12411/D4FFA4A7C7DA4DF1B0CD6D76B0548CDC)
**什么是B-Tree?**
- 多路平衡查找树(每个节点最多m(m>=2)个孩子称为m阶或者度)
- 叶节点具有相同的深度
- 节点中的数据key从左到右是递增的
![image](https://note.youdao.com/yws/res/12417/A6E278333FFA4F27BEBCDEEB50F4E723)

**B+树是B-Tree的变形**
- Mysql实际使用的B+ Treef作为索引的数据结构
- 只在叶子节点带有指向记录的指针(为什么?可以增加树的度)
- 叶子结点通过指针相连。为什么?实现范围查询
![image](https://note.youdao.com/yws/res/12426/B42F4F93539F40909AFB050659902A65)

**建表的时候需要根据查询需求来创建索引**
- 经常用作查询条件的字段 WHERE条件
- 经常用作表连接的字段
- 经常出现在 order by, group by之后的字段

**索引什么时候失效**
- 模糊匹配、类型隐转、最左匹配

**什么是聚集索引？什么是非聚集索引?**
- 聚集还是非聚集指的是B+Tree叶节点存的是指针还是数据记录
- MYISAM索引和数据分离,使用的是非聚集索引
- INNODB数据文件就是索引文件,主键索引就是聚集索引
