# Django 高级Advaced

## 一、静态文件 static

Static files (CSS, JavaScript, Images)

网站所需要加载 css或者js和图片 我们统称为静态资源(静态文件)  Django提供'django.contrib.staticfiles'进行管理

#### (1) 配置静态文件

确定'django.contrib.staticfiles在INSTALL_APPS中

##### settings.py

```python
STATIC_URL = '/static/'
```

静态资源目录结构：

```python
project/
	App/
    static/
    	img/
        css/
        js/
    templates/
    ...
```

#### 实例：

test_static.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    {% load static %}
    <link rel="stylesheet" href="{% static 'css/link.css' %}">
    <style>
        img{
            width: 400px;
        }
    </style>
</head>
<body>
<h2>测试静态资源文件的加载</h2>
<h4>图片的加载</h4>
<h5>硬链接</h5>
<img src="/static/img/timg.jpg" alt="">
<h4>css样式</h4>
<div class="circle"></div>
</body>
</html>
```

static/css/link.css

```css
.circle{
            width: 200px;
            height: 200px;
            border-radius: 100px;
            box-shadow: 20px 10px 10px 10px #000;
}
```

**注意：**

默认的配置代码只能将static静态资源目录放进App中 方可使用 如果static静态资源目录 存放在项目跟下 则加载失败

#### (2) 手动配置 

在settingss.py添加如下代码

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'App/static')]
```

当前的static静态资源目录在App下或者project下 都可以进行正常加载



## 二、中间件

#### 中间件的应用场景

由于中间件工作在视图函数执行之前/执行后 适合所有的请求/一部分请求做批量处理

##### 1.IP限制

可以阻止一宿不友好IP地址的请求(禁用掉)

##### 2.URL访问过滤

比如 在没有登录的状态下 访问需要登录的路由地址 则重定向到l

ogin的路由地址 进行访问（这样的好处 防止你写多个login_required的装饰器了）

##### 3. 缓存

在访问的路由地址 是设置过缓存的 你可以判断当前是否存在缓存  如果存在 则直接进行响应

**概述：**

一个轻量级 底层的插件 可以介入Django的请求和响应

**本质：**

一个Python类

#### 方法：

##### 1. __init__ 不需要传参数 服务器响应第一个请求的时候自动调用 用于确定是否启用中间件

##### 2.process_request(self,reques) 

在执行视图函数之前进行调用(分配URL匹配视图之前) 每个请求都会调用 返回None或者HttpResponse对象

##### 3.process_view(self,request,view_func,view_args,view_kwargs)  

调用视图之前执行 每个请求都会调用 返回None或者HttpResponse对象

##### 4.process_template_response(self,request,response) 

在视图函数刚好执行完进行调用 每个请求都会调用 返回None或者HttpResponse

##### 5.process_response(self,request,response) 

所有响应返回浏览器直接进行调用 每个请求都会调用 返回HttpResponse对象

##### 6.process_exception(self,reques,exception)

当视图函数抛出异常时进行调用 返回HttpResponse对象

#### 自定义中间件

##### (1) 创建中间件目录

```python
project/
	App/
    middleware/
    	App/
        	mymiddle.py
```

##### (2) 在mymiddle.py文件中添加如下代码

```python
from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import HttpResponse,redirect

# 定义自己的中间件
class MyMiddle(MiddlewareMixin):
    def process_request(self,req):
        # print('请求的方法',req.method)
        # print('获取get参数',req.GET)
        # print('请求的路径',req.path)
        # 限制IP访问
        # if req.META['REMOTE_ADDR'] == '127.0.0.1':
        #     return HttpResponse('抱歉 由于之前可能存在非法访问 您不能访问该网址')
        pass

    def process_exception(self,req,exception):
        print(exception)
        return redirect('/')
```

#### (3) 将自定义中间件配置到settings.py中

```python
MIDDLEWARE = [
      ...
    # 添加自定义中间件
    'middleware.App.mymiddle.MyMiddle',
]
```



##  三、分页 

#### paginator

##### (1) 创建对象

格式：paginator(列表,整数)

返回值：返回分页对象

##### (2) 属性

count 对象总数

num_pages 页面总数

page_range	页码数据的列表

##### (5) 方法

page(num) 获得page对象 如果提供的页码不存在 跑invalidPage异常

##### (6) 异常

+ InvalidPage 无效的页码  当传递一个不存在的页码时
+ PageNotAnInter 当向page传递一个不是整数的时候抛出
+ EmptyPage  当向page传递一个有效值 但是该页面没有数据时抛出

#### page对象

##### (1) 创建对象

通过 paginator对象的page方法 返回page对象

##### (2) 属性

1. object_list 当前页面上的所有数据
2. number 当前的页码值
3. paginator 当前page对象关联的paginator对象

##### (3) 方法

1. has_next 判断是否有下一页 如果有 返回 True
2. has_previous 判断是否有上一页 如果有 返回True
3. has_other_pages 判断是否有上一页或者下一页 如果有 返回True
4. next_page_number 返回下一页的页码 如果下一页的页码不存在 则抛出InvalidPage异常
5. provious_page_number 返回上一页的页码 如果上一页不存在 则抛出InvalidPage异常

**实例：**

模板主要代码：

```html
<!--迭代获取当前页码数据-->
{% for row in page.object_list %}
        <tr>
            <td>{{ row.id }}</td>
            <td>{{ row.username }}</td>
            <td>{{ row.sex }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.info }}</td>
        </tr>
{% endfor %}
<!--分页-->
<nav aria-label="Page navigation">
  <ul class="pagination">
    <li {% if not page.has_previous %}class="disabled" {% endif %}>
      <a {% if page.has_previous %}href="{% url 'App:show_page'%}?page={{ page.previous_page_number  }}"{% endif %} aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
      {% for p in page.paginator.page_range %}
          <li {% if p == page.number %}class="active"{% endif %}><a
                  href="{% url 'App:show_page' %}?page={{ p }}">{{ p }}</a></li>
      {% endfor %}
      <li {% if not page.has_next %}class="disabled"{% endif %}>
          <a {% if page.has_next %}href="{% url 'App:show_page' %}?page={{ page.next_page_number }}"{% endif %}
             aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
          </a>
      </li>
  </ul>
</nav>
```

views.py

```python
# 分页
def show_page(req):
    # 获取所有数据
    allUser = User.objects.all()
    # 返回pag对象
    pag = Paginator(allUser,5)
    # 获取最大页面总数
    max_page = pag.num_pages
    try:
        nowpage = int(req.GET.get('page',1))
        # 判断当前传递页码值是否超出最大值
        # if nowpage >= max_page:
        #     nowpage = 1
        page = pag.page(nowpage)
    except:
        page = pag.page(1)
    return render(req,'main/show_page.html',{'page':page})
```

路由地址

```python
url(r'^show_page/$',main.show_page,name='show_page'),
```

模板全部代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        table{
            border-collapse: collapse;
            margin:auto;
        }
        td,th{
            width: 200px;
            height: 40px;
            text-align: center;
            border:1px solid aqua;
        }
    </style>
    {% load bootstrap3 %}
    {% bootstrap_css %}
    <script src="{% bootstrap_jquery_url %}"></script>
    {% bootstrap_javascript %}
</head>
<body>
<h2>分页</h2>
<table>
    <tr>
        <th>id</th>
        <th>用户名</th>
        <th>性别</th>
        <th>年龄</th>
        <th>个人简介</th>
    </tr>
    {% for row in page.object_list %}
        <tr>
            <td>{{ row.id }}</td>
            <td>{{ row.username }}</td>
            <td>{{ row.sex }}</td>
            <td>{{ row.age }}</td>
            <td>{{ row.info }}</td>
        </tr>
    {% endfor %}
</table>
<nav aria-label="Page navigation">
  <ul class="pagination">
    <li {% if not page.has_previous %}class="disabled" {% endif %}>
      <a {% if page.has_previous %}href="{% url 'App:show_page'%}?page={{ page.previous_page_number  }}"{% endif %} aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
      {% for p in page.paginator.page_range %}
          <li {% if p == page.number %}class="active"{% endif %}><a
                  href="{% url 'App:show_page' %}?page={{ p }}">{{ p }}</a></li>
      {% endfor %}
      <li {% if not page.has_next %}class="disabled"{% endif %}>
          <a {% if page.has_next %}href="{% url 'App:show_page' %}?page={{ page.next_page_number }}"{% endif %}
             aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
          </a>
      </li>
  </ul>
</nav>
</body>
</html>
```



## 四、上传图片

##### 表单配置：

1. form表单需要更改method为post
2. 更改enctype的值为 `multipart/form-data`

##### 存储路径配置:

1. 在static静态资源目录下创建upload文件夹

2. 配置settings.py文件 添加如下代码

   ```python
   MDEIA_ROOT = os.path.join(BASE_DIR,'static/upload')
   ```

##### 上传文件所需要的属性和方法：

##### 方法：

1. myFile.read() 从文件中读取整个上传的数据 适用于小文件
2. myFile.chunks() 按块返回文件 通过for循环中进行迭代 可以将大文件按照块写入服务器中
3. myFile.multiple_chunks() 根据文件是否超过2.5M返回bool值的True和False 以此推断使用read还是chunks方法进行文件上传的读取操作

##### 属性：

1. myFile.name 获取文件上传的文件名称
2. myFile.size 获取上传文件的大小 单位是字节

**文件上传的简单实例：**

form表单：

```python
<form action="{% url 'App:upload' %}" method="post" enctype="multipart/form-data">
    {% csrf_token %}
    <p>选择文件：<input type="file" name="file"></p>
    <p><input type="submit" value="上传"></p>
</form>
```

视图函数：

```python
# 导入配置
from django.conf import settings
import os
# 文件上传视图函数
def upload(req):
    # 获取上传过来的文件 其中file为表单中的name属性值
    file = req.FILES.get('file')
    if req.method == 'POST' and file:
        filename = file.name
        size = file.size
        filePath = os.path.join(settings.MDEIA_ROOT,filename)
        with open(filePath,'wb') as f:
            # 判断是否大于2.5M 使用块写入还是全部写入
            if file.multiple_chunks():
                for chunk in file.chunks():
                    f.write(chunk)
            else:
                f.write(file.read())
        return HttpResponse('文件上传')
    return render(req,'main/upload.html')
```

#### 完整的文件上传

**实例：**

##### settings.py添加如下代码

```python
# 文件上传目录
MDEIA_ROOT = os.path.join(BASE_DIR,'static/upload')
ALLOWED_SUFFIX = ['jpg','jpeg','png','gif']
```

##### 视图函数代码：

```python
# 导入配置
from django.conf import settings
import os,random,string
from django.contrib import messages
from PIL import Image


# 处理文件上传允许后缀的方法
def allowed_suffix(filename):
    # 获取后缀
    suffix = filename[filename.rfind('.') + 1:]
    if suffix in settings.ALLOWED_SUFFIX:
        return True
    return False


# 生成随机图片名称方法
def random_name(filename,length=32):
    # 获取后缀
    suffix = os.path.splitext(filename)[1]
    Str = string.ascii_letters+string.digits
    return ''.join(random.choice(Str) for i in range(length))+suffix


# 图片缩放处理
def img_zoom(path,prefix = 's_',width=200,height=200):
    # 处理路径拆分 获取文件名称和路径
    imgTup = os.path.split(path)
    # 拼凑成新文件存储名称
    newPath = os.path.join(imgTup[0], prefix + imgTup[1])
    img = Image.open(path)
    # 重新设计尺寸
    img.thumbnail((width,height))
    # 保存图片
    img.save(newPath)


# 完整文件的上传
def upload(req):
    # 获取上传过来的文件 其中file为表单中的name属性值
    file = req.FILES.get('file')
    if req.method == 'POST' and file:
        # 获取上传文件名称
        filename = file.name
        # 判断文件是否允许上传的方法
        if not allowed_suffix(filename):
            messages.error(req,'该文件不允许上传')
            return redirect(reverse('App:upload'))
        # 处理名字的方法
        filename = random_name(filename)
        size = file.size
        # 拼凑一个完整的文件上传路径
        filePath = os.path.join(settings.MDEIA_ROOT,filename)
        with open(filePath,'wb') as f:
            # 判断是否大于2.5M 使用块写入还是全部写入
            if file.multiple_chunks():
                for chunk in file.chunks():
                    f.write(chunk)
            else:
                f.write(file.read())
        # 处理图片缩放的方法
        img_zoom(filePath)
        messages.success(req, '文件上传成功')
        return redirect(reverse('App:upload'))
    return render(req,'main/upload.html')
```



## 五、富文本编辑器

**安装：**

pip install django-tinymce

##### 配置：

##### (1) 配置settings.py文件

在INSTALL_APPS下 添加 tinymce

添加默认配置

```python
TINYMCE_DEFAULT_CONFIG = { 'theme': 'advanced', 'width': 600, 'height': 400, }
```

##### (2) 创建模型

**导入:**

> from tinymce.models import HTMLField

**使用：**

```python
class Text(models.Model):
    article = HTMLField()
```

**文件迁移：**

1. python manage.py makemigrations
2. python manage.py migrate

#### (3) 配置前台使用

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    {% load static %}
    <script src="/static/tiny_mce/tiny_mce.js"></script>
    <script>
        tinyMCE.init({
            'mode':'textareas',
            'theme': 'advanced',
            'width': 600,
            'height': 400,
        })
    </script>
</head>
<body>
<h2>富文本编辑器的使用</h2>
<form action="" method="post">
    <textarea name="article" id="" cols="30" rows="10"></textarea>
    <input type="submit" value="提交">
</form>
</body>
</html>
```

#### (4) 配置站点

admin.py文件

```python
from django.contrib import admin
from .models import Text
# Register your models here.
admin.site.register(Text)
```



## 六、celery 异步加载

问题：代码的执行需要时间 有些代码会比较耗时  在代码没处理完之前 用户的浏览器则一直在转 对用户来说用户体验很不好 所以可以将耗时的代码放入celery中去执行 给用户立即的响应 提高用户体验度

### 异步加载

#### (1) celery执行分以下4点

1. 任务 task

   本质是一个Python函数  将耗时的代码封装成一个python函数

2. 队列 queue

   将要执行的任务放入队列里

3. 工人 worker

   负责执行队列中的任务

4. 代理 broker

   负责调度

#### (2) celery的使用方式

1. 将耗时的任务封装成任务task
2. 定时执行任务

#### (3) 安装模块

1. pip install celery
2. pip install celery-with-redis
3. pip install django-celerys

#### (4) 配置settings.py

在INSTALL_APPS下 添加如下代码：

```python
INSTALLED_APPS = [
	...
    'djcelery',
]
```

在settings.py下 添加如下代码

```python
# 配置celery
import djcelery
# 初始化
djcelery.setup_loader()
BROKER_URL = 'redis://:redis密码@127.0.0.1:6379/0'
CELERY_IMPORTS = ('App.task') # 执行的任务的py文件 App就是你的应用名
```

#### (5) 创建task任务

##### 目录结构：

```python
project
	App/
    	task.py
```

##### task.py中代码如下

```python
from celery import task
import time

@task
def my_task():
    print('任务开始执行了')
    time.sleep(5)
    print('任务执行完毕了')
```

#### (6) 迁移 生成celery所需要的数据表

> python manage.py migrate

#### (7) 在project 目录下 创建celery.py

##### 添加celery的核心代码

```python
from __future__ import absolute_import

import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whthas_home.settings')

app = Celery('portal')

app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
```

#### (8) 在工程目录project下的init.py文件中 进行导入

##### 代码如下：

```python
from .celery import app as celery_app
```

#### (9) 在视图函数中使用你要执行的任务的函数

##### 代码如下：

```python
from django.shortcuts import render,HttpResponse
import time
from App.task import my_task
# 测试celery的使用
def test_celery(req):
    # 将当前的任务添加到celery中执行 不会造成代码的阻塞
    my_task.delay()
    return HttpResponse('测试celery的使用')
```

#### (10) 启动redis

1. redis-server windows.conf
2. redis-cli
3. auth '123456'

#### (11) 启动服务

> python manage.py runserver

#### (12) 启动worker

> python manage.py celery worker --loglevel=info

### 定时任务

#### (1) 在settings.py文件内添加如下代码

##### 代码如下:

```python
# 添加定时执行
from datetime import timedelta
CELERYBEAT_SCHEDULE = {
    'schedule-test':{
        'task':'App.task.my_task2',
        'schedule':timedelta(seconds=3),
        'args':(2,)
    }
}
```

#### (2) 启动顺序

1. 启动Django

   python manage.py runserver

2. 启动worker

   python manage.py celery worker --loglevel=info

3. 开启定时任务

   python manage.py celery beat --loglevel=info