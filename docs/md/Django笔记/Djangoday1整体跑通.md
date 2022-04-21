# Django第一天
[toc]
## 一、安装

**命令**

pip install django==1.11.4

**检查是否安装成功**

```python
import django
>>> django.get_version()
'1.11.4'
```

## 二、创建项目

**命令：**

django-admin startproject 项目名称

**创建应用**

django-admin startapp App

## 三、对django进行初始化的配置

##### 设置允许访问主机

```
ALLOWED_HOSTS = ['*']
```

##### INSTALLED_APPS

```python
INSTALLED_APPS = [
  ...
    'App',
]
```

将当前的应用名称添加到里面  查找当前的模板和静态资源文件 否则查找不到

##### 配置模板目录

```
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,'templates')],
        'APP_DIRS': True,
        ....
    }
]
```

##### 配置数据库  默认是sqlite

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

更改成MySQL

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

**注意：**

更改成MySQL以后 还需在init.py文件中 添加如下代码

```python
import pymysql
pymysql.install_as_MySQLdb()
```

## 四、添加视图函数以及配置路由

#### (1) 创建视图函数

在应用App中 创建views package包  并创建main.py

在main.py中写入多个视图函数

**实例**

```python
from django.shortcuts import render,HttpResponse

# Create your views here.
def index(req):
    return HttpResponse('Hello Django')
```

配置项目中的urls.py

```python
from app.views import *

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    # 添加首页路由地址
    url(r'^$',main.index),
]
```

**注意：**

Django1.11.4版本中 路由地址为正则表达式

**运行并访问：**

python manage.py runserver

##### 访问地址

http://127.0.0.1:8000/

设置任何ip都能访问  

python manage.py runserver 0.0.0.0:8000

更改访问端口

pytho manage.py runserver 8001

http://127.0.0.1:8001/

#### (2) 在应用中创建urls.py从项目中的urls.py中分离出来

在应用目录中 创建urls.py 添加如下代码

```python
from django.conf.urls import url
from App.views import *

urlpatterns = [
    # 添加首页路由地址
    url(r'^$', main.index),

]
```

在项目中的urls.py添加如下代码

```python
from django.conf.urls import url,include
from django.contrib import admin
# from App.views import *

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    # 添加首页路由地址
    # url(r'^$',main.index),
    url(r'^',include('App.urls'))
]
```



## 五、模板的配置

创建templates模板目录

App->templates

视图函数

```python
from django.shortcuts import render,HttpResponse

# Create your views here.
def index(req):
    # return HttpResponse('index')
    return render(req,'index.html')
```

模板的代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h2>首页</h2>
</body>
</html>
```

**注意：**

如果加载模板的时候出现问题 查看  install_apps 里是否存在当前应用名称



## 六、指定错误页面

#### (1) 在settings.py文件中 关闭调试模式

DEBUG = False

#### (2) 在templates模板目录中 添加404.html

404.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h2>404 PAGE_NOT_FOUND</h2>
<h3>请求失败的路由地址为：{{ request_path }}</h3>
</body>
</html>
```

