# day4 模型 Model

## 一、ORM

使用ORM模型：

随着项目越来越大 采用原生SQL 就会出现大量的SQL语句 那么就会出现如下问题：

1. SQL语句重复使用率不高 越复杂的SQL语句代码就越多 SQL就越长  会出现很多相近的SQL语句
2. 很多SQL语句都是在业务逻辑中拼接出来的 如果数据库需要发生更改 那么就需要更改这些逻辑 就会漏掉对某些SQL语句的更改
3. 写SQL语句时 容易忽略web安全问题  造成隐患

ORM 中文叫做对象关系映射 通过ORM可以像操作类一样去操作数据库 而不用在写原生的SQL语句 通过把表映射成类 把字段作为属性 ORM在执行对象操作时 最终还是会转换成原生SQL语句 去操作数据库

ORM的优点：

1. 易用性 使用ORM做数据库的开发 减少SQL语句重复概率 写出的语句更加直观易懂清晰
2. 设计灵活  可以轻易写出比较复杂的SQL语句
3. 可移植性 底层封装了主流数据的实现  切换数据库方便



## 二、配置数据库

settings.py 77行 将默认的sqlite更改为 MySQL数据库 更改代码如下

**实例：**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'testdjango',
        'USER':'root',
        'PASSWORD':'123456',
        'HOST':'127.0.0.1',
        'PORT':3306,
    }
}
```

配置project中的init.py文件 添加操作数据库的第三方模块

```python
import pymysql
pymysql.install_as_MySQLdb()
```



## 三、模型字段和可选条件

#### (1) 字段和类型

| 字段名称          | 字段说明                                   | 参数                                       |
| ------------- | -------------------------------------- | ---------------------------------------- |
| AutoField     | 一个根据实际ID自动增长的Integer Field 通常不指定(默认存在) |                                          |
| CharField     | varchar类型字段                            | max_length 存储值的最大长度                      |
| TextField     | lonetext长文本                            |                                          |
| IntegerField  | int类型字段 存储整形                           |                                          |
| DecimalField  | 存储浮点型 小数更加精准                           | max_digits=None 位数长度 decimal_places=None 小数的位数 |
| FloatField    | 存储浮点型                                  |                                          |
| BooleField    | 存储boolean值 True/False                  |                                          |
| NullBoolField | 存储null/True/False                      |                                          |
| DateField     | date字段                                 | auto_now=False 如果对数据进行修改则会自动保存修改数据的时间 auto_now_add=False 会自动添加第一次保存数据的时间（俩个参数不能同时使用） |
| TimeField     | time字段                                 | 参数同上                                     |
| DateTimeField | datetime字段                             | 参数同上                                     |

#### (2) 字段选项

| 可选参数        | 参数说明                       |
| ----------- | -------------------------- |
| null        | 默认不为null 设置为True字段值可以为null |
| blank       | 如果设置为True 则当前字段可以为空（没有任何值） |
| db_column   | 设置字段名称 不设置默认为属性名           |
| db_index    | 常规索引                       |
| unique      | 唯一索引                       |
| primary_key | 主键索引                       |
| default     | 默认值                        |



## 四、定义模型

#### (1) 模型、属性、表之间的关联

一个模型类 对应数据库中的一张表 一个属性对应表中的一个字段 属性的参数为字段的可选项

#### (2) 创建测试模型

models.py

```python
from django.db import models

# Create your models here.
class Test(models.Model):
    char = models.CharField(max_length=20,db_index=True,default='默认值')
    text = models.TextField(null=True,blank=True)
    integer = models.IntegerField(db_column='inte')
    deci = models.DecimalField(max_digits=5,decimal_places=2)
    float = models.FloatField()
    bool = models.BooleanField()
    null = models.NullBooleanField()
    date = models.DateField(auto_now=True)
    time = models.TimeField(auto_now=True)
    datetime = models.DateTimeField(auto_now_add=True)
```

**注意：**

blank=True只能使用在字符串类型的字段上

#### (3) 元选项

在模型类中定义个Meta类

```python
class Test:
    ....
    class Meta:
        db_table = '表名称'
```

#### (4) 创建表

生成迁移文件

python manage.py makemigrations

执行迁移文件

python manage.py migrate



## 五、测试数据库

##### (1) 进入到python的shell中进行测试

python manage.py shell

##### (2) 添加数据

```python
# 给模型添加数据
def add_data(req):
    # 方式1
    t = Test()
    t.char = '张三'
    t.text = 'text'
    t.integer = 10
    t.deci = 1.2
    t.float = 2
    t.bool = True
    t.null = None
    t.save()
    # 方式2
    t = Test(char='李四',integer=20,deci=2,float=2,bool=False,null=False)
    t.save()
    return HttpResponse('添加模型数据')
```

#### (3) 查询数据

```python
# 查询数据
def show_data(req):
    data = Test.objects.get(pk=1) # = id=1 pk=primary_key
    print(data)
    print(data.char)
    print(data.integer)
    return HttpResponse('查询数据')
```

#### (4) 修改数据

```python
# 修改数据
def update_data(req):
    t = Test.objects.get(pk=1)
    t.char = '王五'
    t.save()
    return HttpResponse('修改数据')
```

#### (5) 删除数据

```python
# 删除数据
def del_data(req):
    Test.objects.get(pk=1).delete()
    return HttpResponse('删除数据')
```

#### (6) 添加数据的几种办法（总结）

1. 类名.objects.create(关键字='xxx')

2. obj = 类名()

   obj.属性= 值

   obj.save()

3. 防止数据重复的办法

   类名.objects.get_or_create(关键字='xxx')

## 六、模型成员

类属性 objects

##### (1) objects

objects是Manager类的一个对象 作用是与数据库进行交互

当定义模型的时候 没有指定模型管理器  则Django会默认为当前的模型类创建一个名为objects的模型管理器

##### (2) 自定义模型管理器

**实例：**

```python
class Test(modes.Model):
    ...
    # 制定自己的模型管理器名称
    testobj = models.Manager()
#使用
# 使用自定义的模型管理器
def myself_manager(req):
    # 报错 默认的objects已经不存在
    t = Test.objects.get(pk=2)
    t = Test.testobj.get(pk=2)
    return HttpResponse('自定义模型管理器')
```

##### (3) 自定义模型管理器Manager类

模型管理器是Django模型与数据库进行交互的一个接口  一个模型类可以有多个模型管理器

**作用：**

1. 像模型管理类中添加额外的方法
2. 修改模型管理器返回的原始查询集
3. 重写get_queryset() 方法

**实例：**

models.py

```python
class UserManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(isDelete=False)

# 创建用户模型
class User(models.Model):
    username = models.CharField(max_length=12,default='xxx')
    sex = models.BooleanField(default=True)
    age = models.IntegerField(default=18)
    info = models.CharField(max_length=80,default='个人信息')
    icon = models.CharField(max_length=70,default='default.jpg')
    isDelete = models.BooleanField(default=False)
    createTime = models.DateTimeField(auto_now_add=True)
    # 自定义模型管理器的名称
    userobj = models.Manager()
    # 这个模型管理器是去除掉被删除用户后的数据
    objects = UserManager()
```

**test_model.py中使用**

```python
# 获取某条数据
def show(req):
    # 重写了get_queryset()方法的模型管理器  将IsDelete=True的数据过滤掉
    u = User.objects.all()
    return render(req,'show_data.html',{'u':u})
```

#### (4) 创建对象

**目的：**

像数据库中添加数据

##### 1) 在模型类中添加方法

**实例**

```python
# 创建用户模型
class User(models.Model):
	...
  # 一个创建用户对象的类方法
  @classmethod
  def addUser(cls,username,sex=True,age=18,info='个人信息',icon='default.jpg',isDelete=False):
      return cls(username=username,sex=sex,age=age,info=info,icon=icon,isDelete=isDelete)
```

**使用**

```python
# 创建对象进行数据的添加的测试
def test_adddata_method(req):
    User.addUser('妖姬',age=20,info='妖姬的简介').save()
    return HttpResponse('测试像数据库中添加数据的方法')
```

##### 2) 给模型管理器添加方法

**实例:**

```python
class UserManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(isDelete=False)
    # 添加一个添加数据的方法
    def addUser(self,username, sex = True, age = 18, info = '个人信息', icon = 'default.jpg', isDelete = False):
        # self.model 就是代表当前调用它的模型类
        # return self.model(username=username, sex=sex, age=age, info=info, icon=icon, isDelete=isDelete)
        return User(username=username, sex=sex, age=age, info=info, icon=icon, isDelete=isDelete)
```

**使用:**

```python
# 创建对象进行数据的添加的测试
def test_adddata_method(req):
    User.objects.addUser('盘古',age=1000,info='盘古可以打野').save()
    return HttpResponse('测试像数据库中添加数据的方法')
```



## 七、模型查询

**概述:**

1. 查询集表示从数据库拿到的对象的集合
2. 查询集可以有多个过滤器
3. 过滤器就是一个函数 根据所给的参数 限制返回的查询集
4. 从SQL的角度来说  过滤器就是SQL语句的where条件

**使用原生SQL查询**

**实例：**

```python
# 使用原生SQL语句进行查询
def yssql(req):
    obj = User.userobj.raw('select * from app_user')
    # 通过索引取出前5条  节约内存
    obj = User.userobj.raw('select * from app_user')[:5]
    return render(req,'show_data.html',{'u':obj})
```

#### (1) all() 返回查询集中的所有数据

**格式：**

类名.objects.all()

**实例**

```python
# 测试过滤器的使用
def test_filter(req):
    # 查询所有
    u = User.userobj.all()
    
    return render(req,'show_data.html',{'u':u})
```

**分页实例**

```python
def test_filter(req):
    # 分页实例
    try:
        page = int(req.GET.get('page',1))
    except:
        page = 1
    u = User.userobj.all()[(page-1)*5:page*5]
    return render(req,'show_data.html',{'u':u})
```

#### (2) filter() 将符合条件的数据进行返回

**格式：**

类名.objects.filter(属性=值)

**实例：**

```python
# 年龄大于18
    u = User.objects.filter(age__gt=18)
    # 性别为True
    u = User.objects.filter(sex=True)
    # 年龄大于18 并且性别为True的
    u = User.objects.filter(age__gt=18,sex=True)
    u = User.objects.filter(age__gt=18).filter(sex=True)
```

#### (3) exclude() 和filter相反  将符合条件的数据过滤掉

**格式：**

类名.objects.exclude(属性=值)

**实例：**

```python
# 返回性别为False数据
u = User.objects.exclude(sex=True)
```

#### (4) order_by() 排序

默认升序

**降序**

order_by('-id')

**实例：**

```python
# 按照年龄升序
u = User.objects.order_by('age')
# 按照年龄降序
u = User.objects.order_by('-age')
return render(req,'show_data.html',{'u':u})
```

#### (5) reverse() 反转

对 order_by 的反转

**实例：**

```python
# 反转
u = User.objects.order_by('id').reverse()
u = User.objects.order_by('-id').reverse()
```

#### (6) values() 返回一个列表 每条数据都是一个字典

**格式：**

类名.objects.values()

**实例：**

```
u = User.objects.values()
# 返回field字段的值
u = User.objects.values('username','age','sex')
```

#### (7) value_list() 得到一个元组格式的数据 只有值

**格式：**

类名.objects.value_list()

**实例：**

```
u = User.objects.values_list()
```

#### 返回一个对象(一条数据)

#### (1) get() 返回一个对象

**注意：**

1. 当匹配的数据存在 则返回对象
2. 如果给定的数据匹配失败 则抛出异常
3. 如果给定的条件匹配出了多条数据 则抛出异常MultipleObjectsReturned 

**实例：**

```python
u = User.objects.get(pk=1) # 成功 只匹配到一条数据
u = User.objects.get(pk=50) #失败 数据不存在 
u = User.objects.get(sex=True) # 匹配失败 匹配到了多条数据
```

#### (2) count() 返回统计数据条数

**格式：**

类名.objects.count()

**实例：**

```python
u = User.objects.count()
u = User.objects.filter(sex=True).count()
```

#### (3) first() 取出第一条数据

**格式：**

类名.objects.first()

**实例：**

```python
u = User.objects.first()
```

#### (4) last() 获取最后一条数据

**格式：**

类名.objects.last()

**实例：**

```python
u = User.objects.last()
```

#### (5) exists() 判断数据是否存在 返回bool值

**格式：**

类名.objects.filter(条件).exists()

**实例：**

```
u = User.objects.filter(age=1000).exists()
```

### 比较运算符

##### (1) 完全匹配运算符

1. __exact()
2. __iexact()

**实例：**

```python
u = User.objects.filter(username__exact='ABC')
u = User.objects.filter(username__iexact='ABC')
u = User.objects.filter(username='ABC')
```

#### (2) __contains 包含（模糊查询） 大小写敏感

**格式：**

类名.objects.filter(属性__contains=值)

**实例：**

```python
u = User.objects.filter(username__contains='abc')
u = User.objects.filter(username__contains='Abc')
```

#### (3) startswith 和 endwith 以...开头  以...结尾(区分大小写)

**格式：**

类名.objects.filter(属性__startswiths=值)

类名.objects.filter(属性__endswiths=值)

**实例：**

```python
u = User.objects.filter(username__startswith='a')
u = User.objects.filter(username__startswith='A')
u = User.objects.filter(username__endswith='三')
```

#### (4) istartswith 和 iendswith  以...开头  以...结尾(不区分大小写)

**格式：**

类名.objects.filter(属性__istartswiths=值)

类名.objects.filter(属性__iendswiths=值)

**实例：**

```python
u = User.objects.filter(username__istartswith='A')
u = User.objects.filter(username__iendswith='三')
```

#### (5) null 数据的查询

**格式：**

类名.objects.filter(属性__isnull=bool值)

**实例：**

```python
# 查询为空的数据
u = User.objects.filter(username__isnull=True)
u = User.objects.filter(username=None)
# 查询不为空的数据
u = User.objects.filter(username__isnull=False)
u = User.objects.exclude(username__isnull=True)
```

#### (6) in 在...里

**格式：**

类名.objects.filter(属性__in=[值1...])

**实例：**

```python
# 查询年龄在 18 20 30 40 里的数据
u = User.objects.filter(age__in=[18,20,30,40])
# 查询年龄不在 18 20 30 40 里的数据
u = User.objects.exclude(age__in=[18,20,30,40])
# 如果id为主键 则查询结果一样
u = User.objects.filter(id__in=[2,3,4,5])
u = User.objects.filter(pk__in=[2,3,4,5])
```

#### (7) range 值的范围

**格式：**

类名.objects.filter(属性__range=[start,end])

**实例：**

```python
u = User.objects.filter(age__range=[10,40])
# 10-40以外的数据
u = User.objects.exclude(age__range=[10,40])
```

#### (8) 比较运算符

1. __gt 大于
2. __gte大于等于
3. __le小于
4. __lte 小于等于

**实例：**

```python
u = User.objects.filter(pk__gt=5)
u = User.objects.filter(pk__gte=5)
u = User.objects.filter(pk__lt=5)
u = User.objects.filter(pk__lte=5)
```

#### (9) extra 给字段起别名

SQL：select userame as xxx from 表名

**格式：**

类名.objects.all().extra(select={'别名':字段...})

**实例：**

```python
# 将username起别名为xxx
u = User.objects.all().extra(select={'xxx':'username'})
# 获取数据
print(u[0].username)
print(u[0].xxx)
```

**获取SQL语句**

```python
sql = User.objects.all().extra(select={'xxx':'username'}).query.__str__()	
```

**结果为：**

```python
SELECT (username) AS xxx, App_user.id, App_user.username, App_user.sex, App_user.age, App_user.`info,App_user.icon,App_user.isDelete,App_user.createTimeFROMApp_user`
```

##### 其中发现username查询了俩变:

如果想去掉原来的username的查询 则可以使用 defer来执行

**实例**

```python
sql = User.objects.all().extra(select={'xxx':'username'}).defer('username').query.__str__()
```

**结果为**

```python
SELECT (username) AS `xxx`, `App_user`.`id`, `App_user`.`sex`, `App_user`.`age`, `App_user`.`info`, `App_user`.`icon`,
`App_user`.`isDelete`, `App_user`.`createTime` FROM `App_user`
```

### 聚合函数

**导入：**

```python
from django.db.models import Avg,Max,Min,Sum,Count
```

#### (1) Avg 平均数

**实例：**

```python
avg = User.objects.aggregate(Avg('age'))
print(avg)
```

#### (2) MAX 最大值

**实例：**

```python
max = User.objects.aggregate(Max('age'))
print(max)
```

#### (3) Min 最小值

**实例**

```python
min = User.objects.aggregate(Min('age'))
print(min)
```

#### (4) Sum  求和

**实例：**

```python
sum = User.objects.aggregate(Sum('age'))
print(sum)
```

### Q对象与F对象

**概述：**

Q对象作为or 也就是或查询

F对象 是进行表中俩列数据值的比较

**导入：**

```
from django.db.models import Q,F
```

##### Q对象实例：

```python
# 查询年龄为20 或者sex为True的数据
u = User.objects.filter(Q(age=20)|Q(sex=True))
u = User.objects.filter(Q(age=20))
# 如果条件就一个 则没有或一说
```

##### F对象实例

将id大于age的对象进行返回

```python
u = User.objects.filter(id__gte=F('age'))
```



## 八、数据的修改

##### 修改的方式俩种：

1. save
2. update

**区别：**

save 适用于对单条数据的修改

update 使用与对多条数据的修改

**实例：**

##### save修改：

```python
u = User.objects.get(pk=1)
u.username = 'lucky_boy'
u.save()
```

##### update修改:

```python
# 将id为 5 6 7的性别都改为False
u = User.objects.filter(pk__in = [5,6,7])
u.update(sex=False)
```

## 九、模型对应关系

对应关系分为:

1. 1:1 1对1
2. 1:N 1对多
3. M:N 多对多

#### 1对1和1对多共同存在的属性

on_delete:

1. models.CASCADE  默认值 当主表数据被删除  则从表默认跟随删除
2. models.PROTECT 保护模式 一旦主表数据删除 从表数据保留(从表数据不会随着主表的删除而删除)
3. models.SET_NULL 置空模式 当主表数据被删除 则从表关联外键字段的值 设置为Null 前提是该外键字段要设置null 为True

#### (1) 一对一实例

#### A 创建模型：

用户模型 User

身份证模型 IdCard

**实例：**

```python
# 创建用户模型
class User(models.Model):
    username = models.CharField(max_length=12,default='xxx',null=True)
    sex = models.BooleanField(default=True)
    age = models.IntegerField(default=18)
    info = models.CharField(max_length=80,default='个人信息')
    icon = models.CharField(max_length=70,default='default.jpg')
    isDelete = models.BooleanField(default=False)
    createTime = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.username
    
    
# 创建身份证模型
class IdCard(models.Model):
    num = models.CharField(max_length=20,db_index=True,null=True)
    name = models.CharField(max_length=10,default='xxx')
    sex = models.BooleanField(default=True)
    birth = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=40,default='我的老家在...')
    # user = models.OneToOneField(User) # 创建一对一的外键 关联User模型 默认主表数据删除 从表会跟随删除
    # user = models.OneToOneField(User,on_delete=models.PROTECT) # 创建一对一的外键 关联User模型 如果主表与从表有关联数据 则删除主表会抛出异常 如果没有则正常删除 如果删除从表关联数据(正常删除)
    user = models.OneToOneField(User, on_delete=models.SET_NULL,null=True) # 需要执行模型的迁移操作...
    def __str__(self):
        return self.num
```

#### B 一对一数据的添加

```python
# 添加用户数据
def addUser(req):
    u = User(username='张三')
    u.save()
    return HttpResponse('添加用户数据')


# 添加1对1的身份证数据
def addInfo(req):
    u = User.objects.last()
    IdCard(num=random.randrange(10000000),name='张三',user=u).save()
    return HttpResponse('给{}添加身份信息'.format(u.username))
```

#### C 一对一数据的查询

通过主表查询从表数据

```python
# 查询数据
def show_data(req):
    u = User.objects.last()
    print(u.idcard.num)
    print(u.idcard.name)
    print(u.idcard.sex)
    print(u.idcard.birth)
    return HttpResponse('查询数据')
```

通过从表数据获取主表信息

```python
# 查询数据
def show_data(req):
  idcard = IdCard.objects.last()
  print(idcard.user)
  print(idcard.user.username)
  print(idcard.user.sex)
  print(idcard.user.age)
  print(idcard.user.info)
  return HttpResponse('查询数据')
```

#### D 一对一数据的删除

```python
# 1对1数据的删除
def delete(req):
    # 删除主表数据
    # 默认从表数据也会跟随删除
    User.objects.last().delete()

    # 删除从表数据
    # 主表没有任何变化
    # IdCard.objects.last().delete()
    return HttpResponse('1对1数据的删除')
```



#### (2) 一对多关系



使用Foreignkey创建一对多关系 将需要创建一对多关系的模型的从表上添加Foreignkey

我们的外键存放在从表上 和主表建立对应关系 从表数据随着主表数据的改变而改变

**A 模型实例：**

**班级grade和学生students**

```python
# 班级表
class Grade(models.Model):
    gname = models.CharField(max_length=20,default='python1803')
    gnum = models.IntegerField(default=50)
    ggirlnum = models.IntegerField(default=20)
    gboynum = models.IntegerField(default=30)
    def __str__(self):
        return self.gname

# 学生表
class Students(models.Model):
    sname = models.CharField(max_length=20,default='xxx')
    ssex = models.BooleanField(default=True)
    sage = models.IntegerField(default=18)
    # sgrade = models.ForeignKey(Grade) # 从表跟随主表数据的删除而删除
    # sgrade = models.ForeignKey(Grade,on_delete=models.PROTECT) # 受保护模式 主表和从表有对应数据 则主表数据不让删除 从表正常删除
    sgrade = models.ForeignKey(Grade,on_delete=models.SET_NULL,null=True) # 置空模式
    def __str__(self):
        return self.sname
```

**B 添加班级和学生数据**

**实例：**

```python
# 添加班级
def add_grade(req):
 Grade(gname='python1803',gnum=random.randrange(20,100),ggirlnum=random.randrange(30),gboynum=random.randrange(30)).save()
    return HttpResponse('添加了班级')


# 添加学生
def add_students(req):
    s = Students()
    s.sname = '赵六'
    s.sage = random.randrange(10,50)
    s.ssex = [True,False][random.randint(0,1)]
    s.sgrade = Grade.objects.last()
    s.save()
    return HttpResponse('添加了学生：'+s.sname)
```

**C 查询：**

通过主表查询从表数据:

主表类名.小写从表类名_set.filter()

```python
# 查询班级有哪些学生
def show_grade_students(req):
    g = Grade.objects.last()
    print(g.students_set.all())
    return HttpResponse('通过班级查询学生')
```

通过从表查询主表数据:

```python
# 通过学生查询班级
def show_student_grade(req):
    s = Students.objects.last()
    print(s.sgrade.gname)
    return HttpResponse('通过学生查询所在班级')
```

**D 一对多删除：**

**实例：**

```python
# 删除主表数据
def del_grade(req):
    # 默认情况下 删除主表数据 从表会跟随删除
    Grade.objects.first().delete()
    return HttpResponse('删除班级')


# 删除从表数据
def del_students(req):
    # 删除从表数据 主表没有任何变化
    Students.objects.first().delete()
    return HttpResponse('删除学生')
```



#### (3) 多对多

使用ManyToManyField 创建多对多的模型关系

#### **A 创建 用户和博客模型：**

**实例：**

```python
# 创建用户模型
class User(models.Model):
    username = models.CharField(max_length=12,default='xxx',null=True)
    sex = models.BooleanField(default=True)
    age = models.IntegerField(default=18)
    info = models.CharField(max_length=80,default='个人信息')
    icon = models.CharField(max_length=70,default='default.jpg')
    isDelete = models.BooleanField(default=False)
    createTime = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.username


# 创建多对多模型 博客
class Posts(models.Model):
    title = models.CharField(max_length=20,default='标题')
    article = models.CharField(max_length=100,default='内容')
    createTime = models.DateTimeField(auto_now=True)
    users = models.ManyToManyField(User)
    def __str__(self):
        return self.title
```

#### **B 添加用户和博客数据**

**实例：(正常添加)**

**添加用户：**

```python
# 添加用户数据
def addUser(req):
    u = User(username='张三')
    u.save()
    return HttpResponse('添加用户数据')
```

**添加博客：**

```python
# 添加博客数据
def add_posts(req):
    Posts(title='以后的你感谢现在努力拼搏的自己').save()
    Posts(title='一切都是最好的安排').save()
    Posts(title='登天难求人更难').save()
    Posts(title='黄莲苦没钱更苦').save()
    return HttpResponse('添加博客数据')
```

#### **添加多对多数据 使用add**

**实例：**

> 添加一条多对多数据

```python
# 添加一个多对多数据
def add_one_data(req):
    # 1号用户收藏1号帖子
    u = User.objects.first()
    p = Posts.objects.first()
    p.users.add(u)
    return HttpResponse('添加一条多对多数据')
```

> 添加多条多对多数据

```python
# 添加多条多对多数据
def add_many_data(req):
    # 1号用户和2号用户都收藏了1号博客
    p2 = Posts.objects.get(pk=2)
    u1 = User.objects.get(pk=1)
    u2 = User.objects.get(pk=2)
    p2.users.add(u1,u2)
    return HttpResponse('添加多条多对多数据')
```

#### **C 查询：**

##### 查询用户收藏了哪些博客：

```python
# 查询用户收藏了哪些博客
def show_collection_posts(req):
    u = User.objects.first()
    posts = u.posts_set.all()
    print(posts)
    return HttpResponse('查询用户收藏了哪些博客')
```

##### 查询博客被哪些用户收藏：

```python
# 查询博客被哪些用户收藏
def show_collections_users(req):
    p2 = Posts.objects.get(pk=2)
    users = p2.users.all()
    print(users)
    return HttpResponse('查询博客被哪些用户收藏了')
```

#### D 删除多对多数据（remove）

##### 删除一条

```python
# 删除一条数据
def remove_one(req):
    p1 = Posts.objects.first()
    u1 = User.objects.first()
    p1.users.remove(u1)
    return HttpResponse('删除一条数据')
```

##### 删除多条

```python
# 删除多条
def remove_many(req):
    p2 = Posts.objects.get(pk=2)
    u1 = User.objects.get(pk=5)
    u2 = User.objects.get(pk=6)
    p2.users.remove(u1,u2)
    return HttpResponse('删除多条数据')
```










