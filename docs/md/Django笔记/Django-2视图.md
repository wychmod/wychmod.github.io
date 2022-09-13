# Django-2 视图函数
[toc]
## 一、视图的概念

#### (1) 视图的作用

接收用户的请求 并响应给用户

#### (2) 视图的本质

python函数

#### (3) 视图的响应

1. 网页
   + 重定向
   + 错误模板
   + 404 NOT_FOUND
   + 500 SERVER_ERROR
   + 400 BAD_REQUEST
2. json数据



## 二、url的配置

路由：

处理url地址与视图函数之间的程序 称之为路由

#### (1) 配置

指定根级的url（浏览器已经定制好了）

```python
ROOT_URLCONF = 'day35views.urls''
```

#### (2) urlpatterns列表

装有所有路由地址的列表

url参数：

+ regexp 正则
+ view 视图函数名
+ name 给当前的url起名字(url反向解析的时候使用)

##### url中正则的参数使用

+ r 转义特殊字符 必须存在
+ ^ 以...开头 完全匹配中使用必须存在
+ $ 以...结尾  完全匹配中使用  必须存在

**注意：**

^和$ 是限制访问的路由为完全匹配  而不是访问的字符串中包含我们的路由地址

#### 实例

##### 路由地址

```python
url(r'test/',main.test),
```

访问:

+ http://127.0.0.1:8000/test/
+ http://127.0.0.1:8000/xxtest/
+ http://127.0.0.1:8000/test/xx
+ http://127.0.0.1:8000/xxtest/xx

访问路由地址为包含关系  也就是访问的地址字符串中包含我们的路由地址即可  不严谨

##### 路由地址

```python
url(r'^test/',main.test),
```

访问:

- http://127.0.0.1:8000/test/
- http://127.0.0.1:8000/test/xx

##### 路由地址

```python
url(r'test/$',main.test),
```

访问:

- http://127.0.0.1:8000/test/
- http://127.0.0.1:8000/xxtest/

##### 路由地址 建议使用

```python
url(r'^test/$',main.test),
```

访问:

- http://127.0.0.1:8000/test/

#### (3) 不带参数路由地址

```python
from django.conf.urls import url
from App.views import *
urlpatterns = [
    url(r'test/$',main.test),
]

def test(req):
    return HttpResponse('test')
```

#### (4) 带一个参数的视图函数

参数为一个数值

**实例**

```python
url(r'^arg/(\d)/$',main.arg),
url(r'^arg/([0-9])/$',main.arg),

# 带一个参数的视图函数
def arg(req,arg1):
    return HttpResponse('arg1参数值为:'+arg1)
```

**访问：**

http:127.0.0.1:800/arg1/1/

#### (5) 传递多个参数的视图函数

```python
url(r'^args/(\d)/(\d)/$',main.args),
url(r'^args/(\d)_(\d)/$',main.args),

# 带多个参数的视图函数
def args(req,arg1,arg2):
    return HttpResponse('arg1参数值为：{} arg2参数值为：{}'.format(arg1,arg2))
```

**访问:**

+ http://127.0.0.1:8000/args/1/2/
+ http://127.0.0.1:8000/args/1_2/

#### (6) 一个视图函数可以有多个路由地址

和flask一样 一个视图函数 可以有多个路由地址



## 三、请求对象 request

#### (1) request对象

每个视图函数 都必须有一个形参 接收Django传递过来的用户请求对象  request 也就是在浏览器请求的时候给视图函数的数据

#### (2) 概述

服务器接收到用户请求以后 会创建出request请求对象 视图的第一个参数就是request对象

#### (3) 属性

1. path 请求的路径

2. method 请求的方式

3. GET 获取get传参

   + 获取某一个参数

     request.GET.get(key)

   + 当get传参的key名发生重复时

     request.GET.getlist(key)

4. POST 获取POST的请求参数

5. FILES 获取文件上传

6. COOKIES 获取请求过来的cookie数据

7. sessino 获取session数据

8. META 包含了http请求的所有header头信息

   **展示:**

   ```python
       values = req.META.items()
       print(values)
       html = []
       for k,v in values:
           html.append('<tr><td>{}</td><td>{}</td></tr>'.format(k,v))
       return HttpResponse('<table>%s</table>'%html)
   ```

   **常用的key值**

   + REMOTE_ADDR 客户端IP地址
   + HTTP_USER_AGENT 浏览器和系统信息的字符串
   + HTTP_REFERER 获取上一个跳转过来的链接地址

**实例：**

```python
# 测试请求对象 request
def test_request(req):
    print(req.path)
    print(req.method)
    print(req.GET)
    print(req.GET.get('name'))
    print(req.GET.getlist('name')[0])
    print(req.GET.getlist('name')[1])
    print(req.META)
    values = req.META.items()
    print(values)
    html = []
    for k,v in values:
        html.append('<tr><td>{}</td><td>{}</td></tr>'.format(k,v))
    return HttpResponse('<table>%s</table>'%html)
    print(req.META.get('REMOTE_ADDR'))
    print(req.META.get('HTTP_USER_AGENT'))
    print(req.META.get('HTTP_REFERER'))
    return HttpResponse('测试请求对象request的属性的使用')
```

#### (4) 方法

1. get_full_path() 获取完整的请求（不包括域名和端口）
2. get_host() 获取主机和端口
3. is_ajax() 判断是否为ajax

## 四、HttpResponse 响应

**概述：**

给浏览器进行响应

request对象是由Django创建的 HttpResponse 对象是由程序员创建的

#### (1) 响应的方法 

HttpResponse()

**特点：**

不调用模板 直接进行内容的响应

**实例：**

```python
def test(req):
    return HttpResponse('test')
```

**属性：**

res = HtttpResponse()

1. res.content  设置/获取内容

2. res.status_code 设置/获取状态码

3. _ontent_type_for_repr 指定输出MIME的类型

   MIME类型：在把结果传送到浏览器上的时候 浏览器必须启动应用程序来处理这个文档

**实例：**

```python
# 测试HttpResponse
def test_response(req):
    res = HttpResponse()
    res.content = 'test_response'
    res.status_code = 404
    print(res._content_type_for_repr)
    return res
```

**方法**

1. HttpResponse()  实例化出HttpResponse对象
2. write(con) 写内容
3. set_cookie() 设置cookie
4. delete_cookie() 删除cookie



## 五、重定向 redirect 和 reverse

#### (1) redirect使用

1. HttpResponseRedirect
2. redirect （推荐使用 上面的简写）

**导入：**

```python
from django.shortcuts import HttpResponseRedirect,redirect
```

**redirect使用实例**

```python
def test_redirect(req):
    # 首页 无参
    return redirect('/')
    return HttpResponseRedirect('/')
    # 一个参数
    return redirect('/arg/1/')
    return HttpResponseRedirect('/arg/1/')
    # 俩个参数
    return redirect('/args/1/2/')
    return HttpResponseRedirect('/args/1/2/')
```

#### (2) reverse 动态生成路由地址

**导入：**

```python
from django.urls import reverse
```

配置：

1. 给项目project下的urls的include方法添加namespace参数
2. 给url路由地址的方法 添加name属性

**配置实例：**

```python
url(r'^', include('App.urls',namespace='App')),
url(r'^$',main.index,name='index'),
url(r'^arg/([0-9])/$',main.arg,name='arg'),
url(r'^args/(\d)/(\d)/$',main.args,name='args'),
```

**使用实例：**

```python
def test_reverse(req):
    url = reverse('App:index')
    url = reverse('App:arg',args=[1])
    url = reverse('App:args',args=[1,2])
    return HttpResponse(url)
```

**关键字传参：**

回顾正则中的使用

```python
import re
pattern = re.compile('(?P<arg1>\d)_(?P<arg2>\d)')
res = pattern.search('1_2')
print(res.group())
print(res.group(0))
print(res.group(1))
print(res.group(2))
print(res.group('arg1'))
print(res.group('arg2'))
```

**关键字传参实例**

urls.py

```python
# 携带参数的路由地址
url(r'^args/(\w+)/(\d+)/$',main.args,name='args1'),
url(r'^args/(?P<name>\w+)/(?P<age>\d+)/$',main.args,name='args2'),
```

main.py模块

```python
# 测试重定向
def test_redirect(req):
    # 普通传参
    print(reverse('App:args2',args=['zhansgan',18]))
    # 关键字参数
    print(reverse('App:args2',kwargs={'name':'lisi','age':20}))
    return HttpResponse('测试redirect')
```

#### (3) 模板中动态生成url地址

**格式：**

**无参**

{% url 'namespace:name' %}

**普通参数**

{% url 'namespace:name'  arg1 arg2 %}

**关键字参数**

{% url 'namespace:name'  kwarg1=arg1 kwarg2=arg2 %}

**实例：**

**urls.py**

```python
urlpatterns = [
    url(r'^$',main.index,name='index'),
    url(r'^test_redirect/$',main.test_redirect,name='test_redirect'),
    # 携带参数的路由地址
    url(r'^args/(\w+)/(\d+)/$',main.args,name='args1'),
    url(r'^args/(?P<name>\w+)/(?P<age>\d+)/$',main.args,name='args2'),
]
```
##### templates模板

```html
<dl>
    <dt>不动态生成url地址（不带参数）</dt>
    <dd><a href="/" target="_blank">首页</a></dd>
    <dt>动态生成url地址（不带参数）</dt>
    <dd><a href="{% url 'App:index' %}">首页</a></dd>
    <dd>首页：{% url 'App:index' %}
    <dt>不动态生成url地址（带参数）</dt>
    <dd><a href="/args/zhangsan/18/" target="_blank">args</a></dd>
    <dt>动态生成url地址（普通参数）</dt>
    <dd><a href="{% url 'App:args1' 'zhangsan' 18 %}" target="_blank">args</a></dd>
    <dd>args：{% url 'App:args1' 'zhangsan' 18 %}</dd>
    <dt>动态生成url地址（关键字参数）</dt>
    <dd><a href="{% url 'App:args2' name='lisi' age=18 %}" target="_blank">args</a></dd>
    <dd>args：{% url 'App:args2' name='lisi' age=18 %}</dd>
</dl>
```


## 六、子类 JsonResponse

返回json数据  一般用于异步请求（ajax）

**导入JsonResponse**

```python
from django.http import JsonResponse
```

**使用实例：**

```python
# 返回json数据 使用和flask的jsonify一样
def return_json(req):
    json = JsonResponse({'name':'lucky','age':18})
    return json
```



# 会话控制 cookie和session

**概述：**

cookie和session是用来实现维持用户状态的一种方式

cookie机制采取的是客户端保持状态的方案  session机制采取的是服务器端保持状态的方案

**原因：**

http协议是无状态协议 每次请求都是一个新的链接



## 七、COOKIE操作

**概述：**

cookie将数据存储在客户端(也就是浏览器中) 一般一个站点最多存储20个cookie  每个cookie存储值的长度最大4k

存储在客户端的数据为明文存储 不安全

**请求图解：**

客户端 -----》 服务器端

> 设置cookie并进行响应

客户端 《----- 服务器端

> 携带着服务器端响应给客户端的cookie数据进行请求

客户端 -----》 服务器端

**使用：**

#### (1) 设置cookie

Response.set_cookie(

​	key,

​	value,

​	max_age,

​	expires,

​	path,生效的路径

​	domain,生效的域名

​	secure,HTTPS传输时 设置为True

​	httponly,紧http传输	不能使用js获取cookie

)

**实例**

```python
from django.shortcuts import render,HttpResponse

# 设置cookie
def set_cookie(req):
    res = HttpResponse('设置cookie')
    res.set_cookie('name','lucky')
    return res

url(r'^set_cookie/$',test_cookie.set_cookie,name='set_cookie'),
```

**注意：**

默认过期时间为浏览会话结束（关闭浏览器）

#### (2) 获取cookie

```python
# 获取cookie
def get_cookie(req):
    return HttpResponse(req.COOKIES.get('name','defualt'))
    
url(r'get_cookie/$',test_cookie.get_cookie,name='get_cookie'),
```

#### (3) 删除cookie

```python
# 删除cookie
def del_cookie(req):
    res = HttpResponse('删除cookie')
    res.delete_cookie('name')
    return res
    
url(r'^del_cookie/$',test_cookie.del_cookie,name='del_cookie'),
```

#### (4) 设置cookie并设置过期时间

```python
# 设置cookie并设置过期时间
def set_cookie_lifetime(req):
    res = HttpResponse('设置cookie并设置过期时间')
    # 设置存活时间为 1分钟
    # res.set_cookie('name','lucky_boy',max_age=60)
    res.set_cookie('name','lucky_boy',expires=60)
    return res
        url(r'^set_cookie_lifetime/$',test_cookie.set_cookie_lifetime,name='set_cookie_lifetime'),
```



## 八、SESSION操作

session将数据存储于服务器端 相对于cookie安全 session基于cookie

**存储方式：**

1. cookie将所有数据都存储在客户端 都是明文存储 所以不要存储敏感数据 并且存储有大小的限制
2. session将数据存储在服务器端 客户端使用cookie来存储唯一sessionid值

**注意：**

不同的请求者之间不会共享这个数据 数据与请求者一一对应的

#### (1) 开启session

settings.py

```python
INSTALLED_APPS = [
    'django.contrib.sessions',
]
MIDDLEWARE = [
    'django.contrib.sessions.middleware.SessionMiddleware',
]
```

#### (2) 使用session

启用session后 每一个请求对象都会有session属性

#### (3) 设置session

```python
# 设置session
def set_session(req):
    req.session['name'] = 'lucky'
    return HttpResponse('设置session')
    
url(r'^set_session/$',test_session.set_session,name='set_session'),
```

**注意：**

1. session默认存储在数据库中的django_session表中 所以在配置好django后 执行 python manage.py migrate 来生成session存储所需要的session表 如果不生成 则在使用时报错
2. session默认过期时间为俩周 14天
3. session存储在表中的数据 可以使用base64进行解码查看

#### (4) 获取session

```python
# 获取session
def get_session(req):
    value = req.session.get('name','default')
    return HttpResponse('获取session中name值为：{}'.format(value))

url(r'^get_session/$',test_session.get_session,name='get_session'),
```

#### (5) 删除

4种办法：

1. clear() 清空所有session 但是不会清除表中的这条session存储数据

2. flush() 清空所有 删除表中的数据

3. logout(req) 清空所有 并删除表中的session数据

   ```python
   导入：from django.contrib.auth import logout
   ```

4. del req.session['key'] 删除某一个session

**clear实例**

```python
# 删除session
def del_session(req):
    req.session.clear()
    return HttpResponse('删除session')
```

**flush实例**

```python
# 删除session
def del_session(req):
    # req.session.clear()
    req.session.flush()
    return HttpResponse('删除session')
```

**logout实例**

```python
from django.contrib.auth import logout
# 删除session
def del_session(req):
    logout(req)
    return HttpResponse('删除session')
```

**del 删除某条session数据**

```python
# 删除session
def del_session(req):
    del req.session['name']
    return HttpResponse('删除session')
```

#### (6) 设置session的过期时间

session默认存活时间为俩周

request.session.set_expiry(value)

value值：

+ integer 整数秒
+ 0  当前浏览会话结束时
+ timedelta 
+ None 依赖于全局的失效时间

**实例：**

```python
# 设置session并设置过期时间
def set_session_lifetime(req):
    # req.session.set_expiry(20)
    req.session.set_expiry(0)
    req.session['name'] = '有时间记得好评哦！！'
    return HttpResponse('设置session并设置过期时间')
        url(r'^set_session_lifetime/$',test_session.set_session_lifetime,name='set_session_lifetime'),
```

#### 设置session的存储位置

##### (1) 默认保存在数据的django_session的表中

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
```

#### (2) 存储在内存中

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
```

#### (3) 保存在内存和表中

会先去内存中查找 查找不到则去表中查找

```python
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
```

#### (4) 使用redis进行缓存 

**安装：**

pip install django-redis-sessions

**配置settings.py**

```python
# 配置存储的位置
SESSION_ENGINE = 'redis_sessions.session'
# 主机
SESSION_REDIS_HOST = '127.0.0.1'
# 端口
SESSION_REDIS_PORT = '6379'
# 选择数据库
SESSION_REDIS_DB = '0'
```

#### (5) session的全局配置

```python
SESSION_COOKIE_NAME = 'sessionid' # session存储cookie的时候的名字
SESSION_COOKIE_AGE = 1209600 # 默认存活时间
```

#### (6) session操作常用的方法

```python
 #设置获取删除
 request.session[key] = value
request.session.get(key)
request.session.clear()
request.session.flush()
logout(req)
del request.session[key]

# session的其它操作
req.session.keys()
req.session.values()
req.session.items()
```



#### (7) 使用session实现登录

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *{
            padding:0;
            margin:0;
        }
        nav{
            width: 100%;
            height: 40px;
            background-color: #000;
            line-height: 40px;
        }
        a,span{
            color: #fff;
            text-decoration: none;
            font-size:14px;
        }
        a:hover{
            color: aqua;
        }
        span{
            float: right;
            margin-right: 20px;
        }
        .left{
            float: left;
            margin-left: 20px;
        }
    </style>
</head>
<body>
<nav><span class="left"><a href="{% url 'App:index' %}">首页</a></span><span>
    {% if username %}
        欢迎：{{ username }} | <a href="{% url 'App:logout' %}">退出登录</a>
        {% else %}
         <a href="{% url 'App:login' %}">登录</a> | <a href="">注册</a></span>
    {% endif %}
   </nav>
<h2>首页</h2>
</body>
</html>
```

login.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *{
            padding:0;
            margin:0;
        }
        nav{
            width: 100%;
            height: 40px;
            background-color: #000;
            line-height: 40px;
        }
        a{
            color: #fff;
            text-decoration: none;
            font-size:14px;
        }
        a:hover{
            color: aqua;
        }
        span{
            float: right;
            margin-right: 20px;
        }
        .left{
            float: left;
            margin-left: 20px;
        }
    </style>
</head>
<body>
<nav><span class="left"><a href="{% url 'App:index' %}">首页</a></span><span><a href="{% url 'App:login' %}">登录</a> | <a href="">注册</a></span></nav>
<h2>登录</h2>
<form action="{% url 'App:dologin' %}" method="post">
    <p>用户名：<input type="text" name="username" maxlength="12" minlength="6" placeholder="请输入用户名..."></p>
    <p>密码：<input type="password" name="userpass" maxlength="12" minlength="6" placeholder="请输入密码"></p>
    <p><input type="submit" value="登录"><input type="reset" value="重置"></p>
</form>
</body>
</html>
```

main.py

```python
from django.shortcuts import render,HttpResponse,redirect,reverse

# Create your views here.
def index(req):
    # 获取sessino中的username
    username = req.session.get('name')
    return render(req,'main/index.html',context={'username':username})

#展示登录页面
def login(req):
    return render(req,'main/login.html')

#处理登录功能的
def do_login(req):
    if req.method == 'POST':
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        if username == 'zhangsan' and userpass == '123456':
            req.session['name'] = username
            req.session['uid'] = 1
            return redirect(reverse('App:index'))
    return redirect(reverse('App:login'))

# 退出登录
def logout(req):
    req.session.flush()
    return redirect(reverse('App:index'))
```

urls.py

```python
from django.conf.urls import url
from App.views import *
urlpatterns = [
    #登录功能实现的路由地址
    url(r'^login/$',main.login,name='login'),
    url(r'^dologin/$',main.do_login,name='dologin'),
    url(r'^logout/$',main.logout,name='logout'),
]
```



