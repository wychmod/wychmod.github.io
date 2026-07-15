# Day5  Django

## 一、Django-cache 缓存

**概述：**

对于中等流量的网站 尽可能的减少开销是非常有必要的

缓存的好处：

1. 减轻服务器的压力
2. 提供良好的用户体验

#### 缓存的方式

#### (1) 缓存在数据库中

**配置settings.py中**

添加如下代码：

```python
# 添加缓存配置
CACHES = {
    'default':{
        'BACKEND':'django.core.cache.backends.db.DatabaseCache',
        'LOCATION':'my_cache_table',
        'OPTIONS':{
            'MAX_ENTRIES':'10',# 缓存数据的最大条数 超出则自动清除
        },
        'KEY_PREFIX':'cache', # 缓存前缀
    }
}
```

**生成缓存所需要的缓存表**

python manage.py createcachetable [table_name]

python manage.py createcachetable my_cache_table

#### 缓存的使用：

cache_page装饰器的参数：

+ time 秒 过期的时间
+ cache缓存配置 默认为default
+ key_prefix 缓存的前缀

**实例：**

```python
from django.views.decorators.cache import cache_page

# 缓存的使用
@cache_page(10)
def test_filter(req):
    print('你能看到我几次')
    u = User.objects.all()
    return render(req,'show_data.html',{'u':u})
```

#### (2) 缓存在内存中

**配置settings.py**

```python
# 配置缓存在内存中
CACHES = {
    'default':{
        'BACKEND':'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

#### (3) 缓存在文件中

```python
CACHES = {
    'default':{
        'BACKEND':'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION':r'C:\Users\xlg\Desktop\cache',
    }
}
```

#### (4) 缓存在redis中

**安装第三方扩展库：**

pip install django-redis

**配置:**

```python
# 缓存在redis中
CACHES = {
    'default':{
        'BACKEND':'django_redis.cache.RedisCache',
        'LOCATION':'redis://127.0.0.1:6379/1'
    }
}
```

#### (5) 自定义缓存

**缓存操作：**

##### 设置

cache.set(key,value,expires)

##### 获取

cache.get(key)

##### 删除

cache.delete(key)

##### 清空

cache.clear()

**实例：**

```python
from django.core.cache import cache
from django.template import loader
# 手动设置缓存
def manual_set_cache(req):
    data = cache.get('user')
    if data:
        print('走缓存了')
        res = data
    else:
        u = User.objects.all()
        tem = loader.get_template('show_data.html')
        res = tem.render({'u':u})
        cache.set('user',res,60)
    # return render(req, 'show_data.html', {'u': u})
    return HttpResponse(res)
```



## 二、发送邮件

Django官网： www.djangoproject.com

**配置：**

settings.py

```python
# 配置发送邮件
EMAIL_HOST = os.environ.get('MAIL_SERVER','smtp.1000phone.com')
EMAIL_HOST_USER = os.environ.get('MAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('MAIL_PASSWORD')
```

#### (1) 给单人发送邮件示例

```python
# 发送单人邮件
def send_one_mail(req):
    send_mail(
        '帅哥才能收到',
        '亲 单身可聊否',
        os.environ.get('MAIL_USER'),
        ['793390457@qq.com'],
        fail_silently=False,
    )
    return HttpResponse('发送邮件')
```

#### (2) 给多人发送邮件

**示例：**

```python
# 发送多人邮件
def send_many_mail(req):
    from_user = os.environ.get('MAIL_USER')
    message1 = ('邮件1', '邮件1的内容', from_user, ['xxx@qq.com'])
    message2 = ('邮件2', '邮件2的内容', from_user, ['xxx@qq.com'])
    send_mass_mail((message1, message2), fail_silently=False)
    return HttpResponse('给多人发送邮件')
```

### `send_mass_mail()` vs. `send_mail()`[¶](https://docs.djangoproject.com/en/2.1/topics/email/#send-mass-mail-vs-send-mail)

The main difference between [`send_mass_mail()`](https://docs.djangoproject.com/en/2.1/topics/email/#django.core.mail.send_mass_mail) and [`send_mail()`](https://docs.djangoproject.com/en/2.1/topics/email/#django.core.mail.send_mail) is that [`send_mail()`](https://docs.djangoproject.com/en/2.1/topics/email/#django.core.mail.send_mail) opens a connection to the mail server each time it’s executed, while [`send_mass_mail()`](https://docs.djangoproject.com/en/2.1/topics/email/#django.core.mail.send_mass_mail) uses a single connection for all of its messages. This makes [`send_mass_mail()`](https://docs.djangoproject.com/en/2.1/topics/email/#django.core.mail.send_mass_mail) slightly more efficient.

#### (3) 发送HTML内容的邮件

**实例：**

```python
from django.core.mail import EmailMultiAlternatives
# 发送HTML内容的邮件
def sen_html_mail(req):
    subject, from_email, to = 'hello',  os.environ.get('MAIL_USER'),'948807313@qq.com'
    html_content = '<p>This is an <strong>important</strong> message.</p>'
    msg = EmailMultiAlternatives(subject, from_email=from_email, to=[to])
    msg.attach_alternative(html_content, "text/html")
    msg.send()
    return HttpResponse('发送带HTML内容的邮件')
```



## 三、注册激活账户

**步骤：**

1. 创建用户模型
2. 创建模板
3. 接收前台传递过来的数据创建模型对象
4. 密码加密
5. 生成token值
6. 渲染模板发送邮件
7. 邮件激活
8. 改变用户状态

#### (1) 创建user模型

**实例：**

```python
from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=12,db_index=True)
    password_hash = models.CharField(max_length=128)
    age = models.IntegerField(default=18)
    sex = models.BooleanField(default=True)
    email = models.CharField(max_length=50)
    createTime = models.DateTimeField(auto_now_add=True)
    confirm = models.BooleanField(default=False)
    def __str__(self):
        return self.username
```

**迁移命令：**

python manage.py makemigrations

python manage.py migrate



#### (2) 创建注册模板

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>注册页面</title>
    <style>
        .pg_header {
            position: fixed;
            height: 48px;
            top: 0;
            left: 0;
            right: 0;
            background-color: #2459a2;
            line-height: 48px;
        }

        .pg_header .logo {
            margin: 0 auto;
            float: left;
            width: 200px;
            text-align: center;
            line-height: 48px;
            font-size: 28px;
            color: white;
        }

        .pg_dl {
            left: 400px;
            display: inline-block;
            padding: 0 40px;
            color: white;
        }

        .pg_header .pg_dl:hover {
            background-color: #2459fb;
            cursor: pointer;
        }

        .left {
            margin-top: 20px;
            width: 400px;
            display: inline-block;
            float: left;
        }

        .pg_body {
            margin-top: 50px;
            font-size: 18px;
            display: inline-block;
            width: 200px;
        }

        .pg_body .menu {
            width: 800px;
            padding: 15px;
            float: left;
            font-weight: bold;
        }

        input[type="text"] {
            width: 200px;
            height: 25px;
            border-radius: 6px;
        }

        input[type="password"] {
            width: 200px;
            height: 25px;
            border-radius: 6px;
        }

        input[type="button"] {
            background-color: #555555;
            border: none;
            color: white;
            padding: 12px 29px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 17px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }

        input[type="submit"] {
            background-color: #555555;
            border: none;
            color: white;
            padding: 12px 29px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 17px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }

        .kong {
            margin-top: -54px;
            margin-left: 200px;
            float: left;
            padding: 15px;
        }

        .img {
            width: 50px;
            height: 40px;
        }

        .can {
            width: 1220px;
            height: 40px;
            line-height: 40px;
            margin: 0 auto;
            text-align: center;
            display: inline-block;
        }

        .tian {
            color: red;
            float: right;
            font-size: 12px;
            margin-right: -120px;
            margin-top: -25px;
        }
    </style>
    {% load bootstrap3 %}
    {% bootstrap_css %}
    <script src="{% bootstrap_jquery_url %}"></script>
    {% bootstrap_javascript %}
</head>
<body id="i88" style="margin: 0">
<div class="pg_header">
    <a class="logo">LOGO</a>
    <a href="{% url 'App:login' %}" class="pg_dl" id="i77">登录</a>
    <a href="{% url 'App:register' %}" class="pg_dl" id="i77">注册</a>
</div>
<form name="tijiao" method="POST" onsubmit="return check()" action="{% url 'App:register' %}">
    {% csrf_token %}
    <div class="left"></div>
    <div class="pg_body">
        {% bootstrap_messages %}
        <div class="menu">用户名:</div>
        <div class="kong">
            <input id="text1" type="text" name="username" placeholder="请输入用户名" onblur="check()"><span id="div1" class="tian"
                                                                                                style="margin-top: 4px">*(为必填)</span>
        </div>
        <div class="menu">密码:</div>
        <div class="kong">
            <input id="text2" type="password" name="userpass" onblur="check()">
            <span id="div2" class="tian" style="margin-top: -25px">*(为必填)</span>
        </div>
        <div class="menu">确认密码:</div>
        <div class="kong">
            <input id="text3" type="password" name="01" onblur="check()">
            <span id="div3" class="tian">*(为必填)</span>
        </div>
        <div class="menu">邮箱地址:</div>
        <div class="kong">
            <input id="text4" type="text" name="email" onblur="check()">
            <span id="div4" class="tian">*(为必填)</span>
        </div>
    </div>
    <div class="can">
        <input id="i111" type="submit" name="002" value="注  册">
        <p style="width: 200px;display: inline-block;"></p>
        <input id="i222" type="button" name="004" value="取  消">

    </div>
</form>
<script type="text/javascript">
    //刷新or取消
    document.getElementById('i77').onclick = function () {
        location.reload();
    }
    document.getElementById('i222').onclick = function () {
        location.reload();
    }

    //用户名验证
    function checkname() {
        var div = document.getElementById("div1");
        div.innerHTML = "";
        var name1 = document.tijiao.text1.value;
        if (name1 == "") {
            div.innerHTML = "用户名不能为空！";
            document.tijiao.text1.focus();
            return false;
        }
        if (name1.length < 4 || name1.length > 16) {
            div.innerHTML = "长度4-16个字符";
            document.tijiao.text1.select();
            return false;
        }
        var charname1 = name1.toLowerCase();
        for (var i = 0; i < name1.length; i++) {
            var charname = charname1.charAt(i);
            if (!(charname >= 0 && charname <= 9) && (!(charname >= 'a' && charname <= 'z')) && (charname != '_')) {
                div.innerHTML = "用户名包含非法字符";
                document.form1.text1.select();
                return false;
            }
        }
        return true;
    }

    //密码验证
    function checkpassword() {
        var div = document.getElementById("div2");
        div.innerHTML = "";
        var password = document.tijiao.text2.value;
        if (password == "") {
            div.innerHTML = "密码不能为空";
            document.tijao.text2.focus();
            return false;
        }
        if (password.length < 4 || password.length > 16) {
            div.innerHTML = "密码长度为4-16位";
            document.tijiao.text2.select();
            return false;
        }
        return true;
    }

    function checkrepassword() {
        var div = document.getElementById("div3");
        div.innerHTML = "";
        var password = document.tijiao.text2.value;
        var repass = document.tijiao.text3.value;
        if (repass == "") {
            div.innerHTML = "密码不能为空";
            document.tijiao.text3.focus();
            return false;
        }
        if (password != repass) {
            div.innerHTML = "密码不一致";
            document.tijiao.text3.select();
            return false;
        }
        return true;
    }
    //邮箱验证
    function checkEmail() {
        var div = document.getElementById("div4");
        div.innerHTML = "";
        var email = document.tijiao.text5.value;
        var sw = email.indexOf("@", 0);
        var sw1 = email.indexOf(".", 0);
        var tt = sw1 - sw;
        if (email.length == 0) {
            div.innerHTML = "邮箱不能为空";
            document.tijiao.text5.focus();
            return false;
        }

        if (email.indexOf("@", 0) == -1) {
            div.innerHTML = "必须包含@符号";
            document.tijiao.text5.select();
            return false;
        }

        if (email.indexOf(".", 0) == -1) {
            div.innerHTML = "必须包含.符号";
            document.tijiao.text5.select();
            return false;
        }

        if (tt == 1) {
            div.innerHTML = "@和.不能一起";
            document.tijiao.text5.select();
            return false;
        }

        if (sw > sw1) {
            div.innerHTML = "@符号必须在.之前";
            document.tijiao.text5.select();
            return false;
        }
        else {
            return true;
        }
        return ture;
    }

    function check() {
        if (checkname() && checkpassword() && checkrepassword() && checkEmail()) {
            return true;
        }
        else {
            return false;
        }
    }
</script>
</body>
</html>
```

#### (3) 创建视图函数接收

**实例：**

```python
def register(req):
    if req.method == 'POST':
        # print(req.POST)
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        email = req.POST.get('email')
        u = User(username=username,password_hash=userpass,email=email)
        u.save()
        return HttpResponse('注册成功')
    return render(req,'user/register.html')
```
#### (4)  密码加密

**实例：**

```python
from django.contrib.auth.hashers import check_password,make_password

class User(models.Model):
    password_hash = models.CharField(max_length=128)
    ...
    @property
    def password(self):
        raise AttributeError

    # 生成密码
    @password.setter
    def password(self,password):
        self.password_hash = make_password(password)

    # 检验密码
    def my_check_password(self,password):
        return check_password(password,self.password_hash)
```

#### (5) 生成token

uuid:生成唯一不重复的值

**实例：**

```python
import hashlib, uuid
from django.core.cache import cache # 导入缓存

class User(models.Model):
	...
  # token生成
  def generate_token(self):
      token = uuid.uuid4()
      md5 = hashlib.md5()
      md5.update(str(token).encode('utf-8'))
      token = md5.hexdigest()
      # 设置缓存值
      cache.set(token,self.id,3600)
      return token
```

#### (6) 配置发送邮件代码

**实例：**

模板代码：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>邮件激活</title>
</head>
<body>
<h2>您好：{{ username }}</h2>
<h5>请点击右侧激活链接地址 进行账户最后一步激活的操作 <a href="{{ href }}">激活</a></h5>
</body>
</html>
```

视图函数代码:

```python
# 注册
def register(req):
    if req.method == 'POST':
        ...
		# 获取token
        token = u.generate_token()
        # 发送HTML内容的邮件
        subject, from_email, to = '账户激活', os.environ.get('MAIL_USER'), u.email
        # 渲染模板 获取渲染后的HTML代码
        tem = loader.get_template('email/activate.html')
        href = 'http://'+req.get_host()+reverse('App:active',args=[token])
        html_content = tem.render({'username':u.username,'href':href})
        msg = EmailMultiAlternatives(subject, from_email=from_email, to=[to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
```

**注册视图函数的完整代码：**

```python
from django.shortcuts import render,HttpResponse,reverse,redirect
from App.models import User # 导入user模型类
from django.core.mail import EmailMultiAlternatives
import os
from django.template import loader # 渲染模板
from django.contrib import messages


# 创建注册登录和激活的功能
# 注册
def register(req):
    if req.method == 'POST':
        # print(req.POST)
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        email = req.POST.get('email')
        try:
            u = User(username=username,password=userpass,email=email)
            u.save()
            # 获取token
            token = u.generate_token()
            # 发送HTML内容的邮件
            subject, from_email, to = '账户激活', os.environ.get('MAIL_USER'), u.email
            # 渲染模板 获取渲染后的HTML代码
            tem = loader.get_template('email/activate.html')
            href = 'http://'+req.get_host()+reverse('App:active',args=[token])
            html_content = tem.render({'username':u.username,'href':href})
            msg = EmailMultiAlternatives(subject, from_email=from_email, to=[to])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            messages.success(req,'恭喜 注册成功')
            return redirect(reverse('App:login'))
        except:
            messages.error(req,'账户注册失败 请重新注册')
            return redirect(reverse('App:register'))
    return render(req,'user/register.html')
```

#### (7) 账户激活的操作

##### 模型中的代码:

models.py

```python
class User(models.Model):
    ...
    # 激活账户
    @staticmethod
    def check_token(token):
        id = cache.get(token)
        if not id:
            return False
        u = User.objects.get(pk=id)
        if not u.confirm:
            u.confirm = True
            u.save()
        return True
```

**视图函数：**

```python
# 激活视图函数
def active(req,token):
    if User.check_token(token):
        messages.success(req,'账户激活成功！')
        return redirect(reverse('App:login'))
    else:
        messages.error(req,'账户激活失败！')
        return redirect(reverse('App:register'))
```

#### (8) 注册中验证码的使用

验证码的代码：

```python
from django.shortcuts import HttpResponse


# 验证码
def verifycode(request):
    # 引入绘图模块
    from PIL import Image, ImageDraw, ImageFont
    # 引入随机函数模块
    import random
    # 定义变量，用于画面的背景色、宽、高
    bgcolor = (random.randrange(20, 100), random.randrange(
        20, 100), random.randrange(20, 100))
    width = 100
    height = 50
    # 创建画面对象
    im = Image.new('RGB', (width, height), bgcolor)
    # 创建画笔对象
    draw = ImageDraw.Draw(im)
    # 调用画笔的point()函数绘制噪点
    for i in range(0, 100):
        xy = (random.randrange(0, width), random.randrange(0, height))
        fill = (random.randrange(0, 255), 255, random.randrange(0, 255))
        draw.point(xy, fill=fill)
    # 定义验证码的备选值
    str = '1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
    # 随机选取4个值作为验证码
    rand_str = ''
    for i in range(0, 4):
        rand_str += str[random.randrange(0, len(str))]
    # 构造字体对象
    font = ImageFont.truetype(r'C:\Users\xlg\PycharmProjects\online3qi\day43mailregister/fonts/ADOBEARABIC-BOLDITALIC.OTF', 40)
    # 构造字体颜色
    fontcolor1 = (255, random.randrange(0, 255), random.randrange(0, 255))
    fontcolor2 = (255, random.randrange(0, 255), random.randrange(0, 255))
    fontcolor3 = (255, random.randrange(0, 255), random.randrange(0, 255))
    fontcolor4 = (255, random.randrange(0, 255), random.randrange(0, 255))
    # 绘制4个字
    draw.text((5, 2), rand_str[0], font=font, fill=fontcolor1)
    draw.text((25, 2), rand_str[1], font=font, fill=fontcolor2)
    draw.text((50, 2), rand_str[2], font=font, fill=fontcolor3)
    draw.text((75, 2), rand_str[3], font=font, fill=fontcolor4)
    # 释放画笔
    del draw
    # 存入session，用于做进一步验证
    request.session['verify'] = rand_str
    # 内存文件操作
    import io
    buf = io.BytesIO()
    # 将图片保存在内存中，文件类型为png
    im.save(buf, 'png')
    # 将内存中的图片数据返回给客户端，MIME类型为图片png
    return HttpResponse(buf.getvalue(), 'image/png')
```

路由的配置:

```python
url(r'^verifycode/$',func.verifycode,name='verifycode'),
```

模板中使用:

```html
<input id="text4" type="text" name="verify" onblur="check()" style="width: 100px;">
<span><img src="{% url 'App:verifycode' %}" onclick="this.src='/verifycode/?id='+Math.random();"></span>
```

视图函数中的使用:

```python
def register(req):
    if req.method == 'POST':
        # 第一步先判断验证码  验证码 通过在继续执行以下操作
        verify = req.session.get('verify')
        if req.POST.get('verify').lower() != verify.lower():
            messages.error(req, '请输入正确的验证码')
            return redirect(reverse('App:register'))
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        ...
```



