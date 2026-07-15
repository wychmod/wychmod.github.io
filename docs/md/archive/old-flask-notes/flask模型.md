# Flask 模型 Model

## 一、使用ORM模型

#### (1) 数据库中创建数据库

create database test_flask character set utf8;

#### (2) 安装pymysql

pip install pymysql

#### (3) 安装flask-sqlalchemy

pip install flask-sqlalchemy

#### (4) 配置数据库

**配置mysql**

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@127.0.0.1:3306/test_flask'

**配置sqlite**

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+os.path.join(os.getcwd(),'test_flask.sqlite')

#### (5) 设置自动提交

```python
# 设置自动提交
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
```

#### (6) 实例化SQLALCHEMY

```python
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)
```

**实例**

```python
from flask import Flask
from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@127.0.0.1:3306/test_flask'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
manager = Manager(app)

if __name__ == '__main__':
    manager.run()
```



## 二、设计模型

#### (1) 常见字段类型

| 类型名          | python类型          | 说明    |
| ------------ | ----------------- | ----- |
| Integer      | int               | 整形    |
| SmallInteger | int               | 小整形   |
| BigInteger   | int               | 长整型   |
| Float        | float             | 浮点型   |
| String       | string            | 字符串   |
| Text         | string            | 长文本   |
| Boolean      | bool              | 布尔值   |
| Date         | datetime.date     | 日期    |
| Time         | datetime.time     | 时间    |
| DateTime     | datetime.datetime | 日期和时间 |
| Enum         | String            | 字符串   |

#### (2) 可选约束条件

| 选项          | 说明           |
| ----------- | ------------ |
| primary_key | 主键索引 默认False |
| unique      | 唯一索引 默认False |
| index       | 常规索引 默认False |
| nullable    | 是否为空 默认True  |
| default     | 默认值          |



## 三、创建模型

**对应关系**

一个模型类 ====》   数据库中的一张表

一个属性     ====》 表中的一个字段

**实例：**

#### (1) 创建 user模型

```python
from flask import Flask
from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@127.0.0.1:3306/test_flask'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
manager = Manager(app)

# 创建user模型(也就是user表) 默认是当前类名
class User(db.Model):
    __tablename__ = 'user' #起表名
    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(12),index=True)
    age = db.Column(db.Integer,default=18)
    sex = db.Column(db.Boolean,default=True)
    hobby = db.Column(db.String(40),default='爱好')
```

#### (2) 创建表

```python
@app.route('/create_table/')
def create_table():
    db.create_all()
    return 'create_table'
```

#### (3) 删除表

```python
@app.route('/drop_table/')
def drop_table():
    db.drop_all()
    return 'drop_table'
```



## 四、数据的增删改查

#### (1) 添加数据

```python
@app.route('/insert_one/')
def insert_one():
    try:
        u = User(username='lucky',age=18,sex=True,hobby='赚钱')
        db.session.add(u)
        # 事物提交
        db.session.commit()
    except:
        # 出现异常进行事物回滚
        db.session.rollback()
    return '添加一条数据'
```

**sqlalchemy**

是开启了事物  所有要进行数据的提交或者回滚 

#### (2) 添加多条

```python
# 添加多条数据
@app.route('/insert_many/')
def insert_many():
    try:
        u1 = User(username='夏利刚', age=20, hobby='上课')
        u2 = User(username='张三',age=22,sex=False,hobby='爱学习')
        db.session.add_all([u1,u2])
        db.session.commit()
    except:
        db.session.rollback()
    return '添加多条'
```

#### (3) 查询一条数据

```python
@app.route('/find_one/')
def find_one():
    # 查询id为1的数据
    obj = User.query.get(1)
    # print(obj)
    print(obj.id)
    print(obj.username)
    print(obj.sex)
    print(obj.age)
    print(obj.hobby)
    return '查询一条数据'
```

#### (4) 数据的修改

```python
# 数据的修改
@app.route('/update/')
def update():
    u = User.query.get(1)
    u.username = 'lucky_boy'
    u.sex = False
    u.hobby = '学习and看美女'
    db.session.add(u)
    db.session.commit()
    return '数据的修改'
```

#### (5) 数据的删除

```python
# 数据的删除
@app.route('/delete/')
def delete():
    u = User.query.get(3)
    db.session.delete(u)
    db.session.commit()
    return '删除一条数据'
```



## 五、定义一个增删改的base类

```python
# 封装一个增删改的类 简化我们当前的操作
class DB:
    # 添加一条数据的方法
    def save(self):
        try:
            db.session.add(self)
            db.session.commit()
        except:
            db.session.rollback()
    
    # 添加多条的方法
    @staticmethod
    def save_all(*args):
        try:
            db.session.add_all(args)
            db.session.commit()
        except:
            db.session.rollback()
    # 定义删除的方法
    def delete(self):
        try:
            db.session.delete(self)
            db.session.commit()
        except:
            db.session.rollback()
class User(db.Model,DB):
    ...
```

**使用**

insert_one

```python
@app.route('/insert_one/')
def insert_one():
    u = User(username='lucky',age=18,sex=False)
    # db.session.add(u)
    # db.session.commit()
    u.save()
    return '添加数据'
```

insert_many

```python
@app.route('/insert_many/')
def insert_many():
    first_name_list = ['张','王','向','史','周','吴','郑']
    last_name_list = ['号','呵','利','胜','声','伟','凯','玲']
    first_name1 = first_name_list[random.randrange(len(first_name_list))]
    first_name2 = first_name_list[random.randrange(len(first_name_list))]
    last_name1 = last_name_list[random.randrange(len(last_name_list))]
    last_name2 = last_name_list[random.randrange(len(last_name_list))]
    u1 = User(username=first_name1+last_name1,age=random.randrange(40),sex=random.randint(0,1))
    u2 = User(username=first_name2+last_name2,age=random.randrange(40),sex=random.randint(0,1))
    # db.session.add_all([u1,u2])
    # db.session.commit()
    # 使用自定义的静态方法进行添加多条数据
    User.save_all(u1,u2)
    return '添加多条数据'
```

update

```python
@app.route('/update/')
def update():
    u = User.query.get(17)
    u.username = 'lucky'
    # db.session.add(u)
    # db.session.commit()
    u.save()
    return '修改'
```

delete

```python
@app.route('/delete/')
def delete():
    u = User.query.get(17)
    # db.session.delete(u)
    # db.session.commit()
    u.delete()
    return '删除'
```



## 六、数据库操作

**查询集**

查询数据的集合

**分类：**

1. 原始查询集

   使用类名.query得到的就是原始查询集 

2. 数据查询集

   通过过滤器方法   过滤原始数据 或者其它查询集  得到的查询集



### **过滤**

特点：链式调用

#### (1) all 得到所有的数据查询集

以列表形式返回所有对象

```python
data = User.query.all()
```

#### (2) filter 过滤器

可以使用: `> < >= <= == !=`

类名.query.filter([过滤条件]) 如果没有过滤条件  则查询所有

```python
# 查询性别为True的数据
data = User.query.filter(User.sex==True)
# 查询年龄大于18的数据
data = User.query.filter(User.age>18)
# 查询年龄大于18 并且性别为True的数据
data = User.query.filter(User.age>18,User.sex==True)
# 不添加条件的查询(查询所有)
data = User.query.filter()
```

#### (3) filter_by() 单条件查询

filter_by(属性名=值...)  没有条件 则查询所有

```python
# 查询性别为True的 并且age为27的数据
data = User.query.filter_by(sex=True,age=27)
data = User.query.filter_by()
print(data)
```

#### (4) offset(num) 偏移数据量

```python
# 偏移10条数据 从第11条开始取
data = User.query.offset(10)
```

#### (5) limit(num) 取出num条数据

```
data = User.query.limit(5)
```

#### (6) offset 和 limit的组合使用

跳过几条 取几条

```python
data = User.query.offset(5).limit(5)
```

**实现分页**

```python
nowPage = int(request.args.get('page',1))
limit = 5
offset = (nowPage-1)*limit
data = User.query.offset(offset).limit(limit)
```

#### (7) order_by 排序

1. 默认为升序
2. -类名.属性名 降序

```python
data = User.query.order_by(User.age)
data = User.query.order_by(-User.age)
data = User.query.order_by(User.age.desc())
```

#### (8) first 取出第一条数据(对象)

```
# data = User.query.first()
```

#### (9) get 通过id获取对应的对象  获取不到 返回None

```python
data = User.query.get(5)
```

#### (10) contains 包含关系

```
# 姓名中包含张的数据
data = User.query.filter(User.username.contains('张'))
# 年龄中包含3的数据
data = User.query.filter(User.age.contains(3))
```

#### (11) 模糊查询 like

```
# 包含张的数据
data = User.query.filter(User.username.like('%张%'))
# 张作为开头的数据
data = User.query.filter(User.username.like('张%'))
# 张作为结尾的数据
data = User.query.filter(User.username.like('%张'))
```

#### (12) startswith以...开头  endswith 以...结尾

```python
data = User.query.filter(User.username.startswith('张'))
data = User.query.filter(User.username.endswith('张'))
```

#### (13) 比较运算符

1. `__gt__`
2. `__lt__`
3. `__ge__`
4. `__le__`

```
data = User.query.filter(User.age.__gt__(20))
data = User.query.filter(User.age.__ge__(20))
data = User.query.filter(User.age.__lt__(20))
data = User.query.filter(User.age.__le__(20))
```

#### (14) in_ notin_ 在...范围内  不在...范围内

```
in_的操作
data = User.query.filter(User.age.in_([1,2,18,20]))
data = User.query.filter(~User.age.notin_([1,18,20]))
notin_
data = User.query.filter(~User.age.in_([1,2,18,20]))
data = User.query.filter(User.age.notin_([1,18,20]))
```

#### (15) is null  查询数据为空的

```
data = User.query.filter(User.username==None)
data = User.query.filter(User.username.is_(None))
```

#### (16) 查询不为空的数据

```
data = User.query.filter(User.username!=None)
data = User.query.filter(User.username.isnot(None))
data = User.query.filter(~User.username.is_(None))
```



## 七、数据库的逻辑查询 

from sqlalchemy import and\_,or\_,not_

#### (1) 逻辑与

```
data = User.query.filter(User.username.contains('张'),User.age>=18)
data = User.query.filter(and_(User.username.contains('张'),User.age>=18))
```

#### (2) 逻辑或

```
data = User.query.filter(or_(User.username.contains('张'),User.age>=18))
```

#### (3) 逻辑非

```
data = User.query.filter(not_(User.sex==True))
```

#### (4) count 统计

```
data = User.query.filter(not_(User.sex==True)).count()
```

#### (5) concat 链接

```
data = User.query.filter().order_by(User.id.concat(User.age))
```



## 八、文件迁移

#### (1) 安装

pip install flask-script

pip instal flask-sqlalchemy

pip install flask-migrate

#### (2) 创建迁移对象

```
from flask_migrate import MigrateCommand,Migrate
Migrate(app,db)
manager = Manager(app)
manager.add_command('db',MigrateCommand)
```

#### (3) 创建迁移目录

python manage.py db init

#### (4) 生成迁移文件

python manage.py db migrate

#### (5) 执行迁移文件

python manage.py db upgrade

**注意：**

如果对表的结构发生了改变 那就重新执行以下 4和5的步骤





## 九、发送邮件 flask-mail

**概述：**

是一个邮件发送的扩展库  使用非常方便

**安装:**

pip install flask-mail

**配置临时环境变量：**

#### windows 

set 名 = 值

##### 获取

set 名

#### Linux

export  名=值

##### 获取

echo $名

**实例**

```python
from flask import Flask
from flask_script import Manager
from flask_mail import Mail,Message
import os
app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.1000phone.com'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
mail = Mail(app)
manager = Manager(app)

@app.route('/send_mail/')
def send_mail():
    msg = Message(subject='邮件激活',recipients=['948807313@qq.com'],sender=app.config['MAIL_USERNAME'])
    msg.html = '<h2>我是邮件内容</h2>'
    mail.send(msg)
    return '发送邮件成功'

if __name__ == '__main__':
    manager.run()
```

