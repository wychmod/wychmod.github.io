## flaskday2

## 一、重定向 redirect

**作用：**

可以直接通过浏览器跳转到另外一个地址(视图函数直接的跳转)

**导入：**

from flask import redirect,url_for

+ redirect 通过给定参数路由地址 进行跳转
+ url_for 通过视图函数名称 反向构造出路由地址

**redirect的使用**
**实例**

```python
# 使用redirect
@app.route('/redirect/')
def my_redirect():
#     去首页 无参路由
    return redirect('/')
#     带一个参数的路由地址的重定向
    return redirect('/arg/lucky/')
#      带多个参数的路由地址的重定向
    return redirect('/args/lucky/18/')
```

**url_for的使用**

**实例**

```python
# 使用url_for 的视图函数
@app.route('/url_for/')
def my_urlfor():
    # 构造首页路由
    print(url_for('index'))  # /
    # 给url_for 一个带参的视图函数 但是没给参数  会报错werkzeug.routing.BuildError: Could not build url for endpoint 'arg'. Did you forget to specify values ['name']?
    print(url_for('arg'))
    # 带一个参数  给参数
    print(url_for('arg',name='lucky')) #/arg/lucky/
    # 带多个参数的视图函数
    # werkzeug.routing.BuildError: Could not build url for endpoint 'args'. Did you forget to specify values ['age', 'name']?
    print(url_for('args'))
    # 带参数
    print(url_for('args',name='lucky',age=18)) #/args/lucky/18/
    return 'url_for'
```

**redirect和url_for的组合使用**

**实例**

```python
# redirect 和 url_for的组合使用
@app.route('/ru/')
def ru():
    # 去首页
    return redirect(url_for('index'))
    # 去一个参数的路由地址
    return redirect(url_for('arg',name='lucky'))
    # 去多个参数的路由地址
    return redirect(url_for('args',name='lucky',age=18))
```

## 二、abort（终止）

**导入**

from flask import abort

**类似python中的raise**

上方的代码正常执行 下面的代码不在执行

raise 抛出的错误名称

abort抛出的http状态码

**实例**

```python
@app.route('/test_abort/')
def test_abort():
    print('abort上方')
    abort(500)
    print('abort下方')
    return '测试abort的视图函数'
```



## 三、捕获错误

**实例**

```python
# 捕获状态所对应的错误
# 参数 err 是当前捕获状态码的错误信息
@app.errorhandler(500)
def server_error(err):
    print(err)
    return '你报500的错误了！！！'

@app.errorhandler(404)
def page_not_founde(err):
    print('404了！')
    return '404'
```



## 四、请求 request

**作用：**

获取请求报文中 传递的数据

**概述：**

浏览器发送到服务器的所有报文被flask接收以后 会创建出request请求对象  request被用于视图函数中 用来获取请求的数据

**导入：**

from flask import request

**request常用属性**

1. url  完整的请求 url
2. base_url 去掉get传参的url
3. host_url 只有主机IP和端口号的url地址
4. host  主机和端口
5. path 路由地址
6. method 请求的方法
7. remote_addr 获取客户端请求的ip地址
8. args  获取get传参的参数
9. form 存储form表单传递过来的数据
10. files 获取文件上传
11. headers 获取请求头信息
12. cookies 获取请求的cookie
13. json 获取请求过来的json数据

**实例**

```python
# 请求对象 request的使用
# http://127.0.0.1:5000/request/?name=lucky&age=18#name
@app.route('/request/')
def r():
    print(request.url)
    print(request.base_url)
    print(request.host_url)
    print(request.host)
    print(request.path)
    print(request.method)
    print(request.remote_addr)
    print(request.args['name'])
    print(request.args['age'])
    print(request.args.get('name'))
    print(request.args.get('age'))
    print(request.headers.get('User-Agent'))
    return 'request请求对象'
```



## 五、响应 response

**(1)**  直接响应字符串数据

**实例**

```python
@app.route('/')
def index():
    # 只相应内容
    return 'index'
    # 响应内容和状态码
    return 'index',404
```

(2) 通过make_response来构造响应

from flask import make_response

**实例**

```python
@app.route('/')
def index():
    # 手动构造响应
    res = make_response('响应内容')
    # 响应内容和状态码
    res = make_response('响应内容',404)
    return res
```



## 六、current_app

**导入**

from flask import current_app

**概述**

current_app 是当前app对象的一个代理对象 用于获取实际的app对象和app上的配置信息

**实例**

```python
# current_app的使用
@app.route('/test_current_app/')
def test_current_app():
    print(current_app.config['SECRET_KEY'])
    return 'test_current_app'
```



## 七、会话控制 cookie 的使用

**概述**

会话控制 用来保持用户的状态  

**原因：**

http协议 是无状态协议 每一次连接都是一个新的会话

**cookie值的存储**

cookie存储在客户端的浏览器一般会限制存储cookie的个数为 20个  并且单个cookie保存值的大小不能超过4kb

存储在浏览器上为明文存储  所有不安全

#### (1) 设置cookie

response.set_cookie(key,value,max_age=None,expires=None,path='/')

**实例**

```python
# 设置cookie
@app.route('/set_cookie/')
def set_cookie():
    res = make_response('设置cookie')
    res.set_cookie('name','lucky')
    return res
```

**默认存活时间为浏览会话结束**

意思就是关闭浏览器时 就结束（切记 不是关闭标签页）

#### (2) 获取cookie

**实例**

```python
# 获取cookie
@app.route('/get_cookie/')
def get_cookie():
    val = request.cookies.get('name','值不存在')
    return val
```

#### (3) 删除cookie

**实例**

```python
# 删除 cookie
@app.route('/delete_cookie/')
def delete_cookie():
    res = make_response('删除cookie')
    res.delete_cookie('name')
    return res
```

#### (4) 设置cookie并设置过期时间

**实例**

```python
# 设置cookie并设置过期时间
@app.route('/set_cookie_expires/')
def set_cookie_expires():
    res = make_response('设置cookie并设置过期时间')
    # 设置cookie存活时间为 1分钟
    # res.set_cookie('name','lucky',max_age=60)
    left_time = time.time()+60
    res.set_cookie('name','lucky',expires=left_time)
    return res
```



## 八、会话控制session的使用

服务器需要识别同一个访问者的请求 主要是通过浏览器中的cookie实现的  访问者在第一次访问服务器的时候 会在浏览器的cookie中 存储一个唯一sessionid值  通过这个唯一id值区分不同的访问者的请求

**session基于cookie**

**注意：**

设置session 需要添加 secret_key  秘钥 进行sessionid加密生成的字符串

**设置secret_key的方法**

```python
app.secret_key = 'lucky'
app.config['SECRET_KEY'] = 'lucky'
```

#### 导入

from flask import session

#### (1) 设置session

```python
# 设置session
@app.route('/set_session/')
def set_session():
    session['name'] = 'lucky'
    return '设置session'
```

#### (2) 获取session

```python
# 获取session
@app.route('/get_session/')
def get_session():
    val = session.get('name','没有值')
    return 'session的值为：{}'.format(val)
```

#### (3) 删除session

```python
# 删除session
@app.route('/delete_session/')
def delete_session():
    # 删除某个key的session值
    # session.pop('name')
    # 清除所有session
    session.clear()
    return 'session的key为name的值被删除'
```

#### (4) 设置session并设置过期时间

```python
# 设置session并设置过期时间
@app.route('/set_session_leftime/')
def set_session_leftime():
    # 开启session持久化存储
    session.permanent = True
    # timedelta是一个计算时间差值的模块
    app.permanent_session_lifetime = timedelta(minutes=1)
    session['name'] = 'lucky'
    return '设置session并设置过期时间'
```

**区别:**

1. cookie数据存储在浏览器上  session存储在服务器上
2. cookie 没有session安全
3. session会在一定时间内保存在服务器上  当访问增多 会加大服务器的压力 考虑性能优化 存储在cookie上
4. 个人建议 将登陆等重要的数据 存储在sessino上  其它的建议存储在cookie上



## 九、flask扩展库  flask-script

**概述：**

flask终端运行解析器

**安装：**

pip install flask-script

**使用**

```python
from flask import Flask
from flask_script import Manager

app = Flask(__name__)
manager = Manager(app)
	...
if __name__ == '__main__':
    manager.run()
```

**启动项参数:**

**获取启动项参数：**

> python 文件名.py runserver -?

**完整启动**

python manager.py runserver -h0.0.0.0 -p5001 -d -r

**正常启动**

python manage.py runserver -d -r



## 十、蓝本 blueprint

**概述**

当我们代码越来越复杂的时候  很明显将所有视图函数 放在一个文件中 是不合理的  要按照功能进行视图函数的划分

**使用** user.py

```python
# user.py 就是所有处理用户的视图函数的py文件
# 导入蓝本文件
from flask import Blueprint
user = Blueprint('user',__name__)

@user.route('/login/')
def login():
    return '登录'

@user.route('/logout/')
def logout():
    return '退出登录'
```

manager.py

```python
from flask import Flask
from flask_script import Manager

app = Flask(__name__)
manager = Manager(app)

@app.route('/')
def index():
    return 'index'
# 从user蓝本文件 导入user蓝本对象
from user import user
# 注册蓝本
# app.register_blueprint(user)
app.register_blueprint(user,url_prefix='/user')
if __name__ == '__main__':
    manager.run()
```

**访问**

> http://127.0.0.1:5000/login/
>
> http://127.0.0.1:5000/user/login/

### 注意：

蓝本之间的重定向 需要告诉url_for  是哪个蓝本文件的视图函数名 否则报错

```python
@app.route('/')
def index():
    # index视图 去 user.py蓝本
    # return redirect('/user/login/')
    # 配合 url_for 需要注意 告诉人家 是哪个蓝本文件的视图函数
    return redirect(url_for('user.login'))
```



## 扩展

web框架

其他语言

M  model 模型  操作数据库

V  view  视图   负责展示模板给用户看的

C  controller 控制器  进行逻辑功能与模型和视图的交互

python中

M model 模型   操作数据库

V view  视图   进行逻辑功能与模型和视图的交互

T  templates 模板  负责展示模板给用户看的









