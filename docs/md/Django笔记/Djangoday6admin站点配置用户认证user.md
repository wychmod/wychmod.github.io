# day6 admin站点配置与用户认证user的使用
[toc]
## 一、Admin站点配置

网站分为前后台：

前台是所有人浏览访问（是否登录所查看的前台都是一样的）

后台：

一个网站可能存在不同权限的后台

不同权限的后台分配不同的账户进行功能的管理

#### (1) 配置admin应用

在settings.py 文件中的 INSTALL_APPS中 **'django.contrib.admin'**,默认是添加好的

#### (2) 创建管理员用户

**命令：**

python manage.py createsuperuser

按照提示依次输入：

+ 用户名
+ 邮箱
+ 密码
+ 确认密码

数据存储在数据库中的auth_user表中

#### (3) 登录后台

路由地址：

`http://127.0.0.1/admin/`

输入刚才命令所创建的用户名和密码

#### (4) 汉化

修改settings.py文件

**实例：**

```python
LANGUAGE_CODE = 'zh-Hans'
TIME_ZONE = 'Asia/Shanghai'
```

#### (5) 修改admin.py 配置后台表的显示

**实例：**

```python
from django.contrib import admin
from App.models import Grade,Students,User

# Register your models here.
admin.site.register(User)
admin.site.register(Grade)
admin.site.register(Students)
```

###### **刷新后台页面：**

会出现你注册的模型表

#### (6) 配置后台数据的展示

**实例：**

```python
from django.contrib import admin
from App.models import Grade,Students,User


# 配置grade
class GradeAdmin(admin.ModelAdmin):
    # 配置显示哪些字段
    list_display = ['pk','gname','gnum','ggirlnum','gboynum']
    # 搜索某个字段
    search_fields = ['gname']
    # 过滤字段
    list_filter = ['gname']
    # 分页
    list_per_page = 3
    # 属性添加的先后顺序
    # fields = ['gnum','ggirlnum','gboynum','gname']
    fieldsets = [
        ('第一组',{'fields':['gname']}),
        ('第二组',{'fields':['gnum','ggirlnum','gboynum']})
    ]
# Register your models here.
admin.site.register(Grade,GradeAdmin)
admin.site.register(Students)
```

**注意：**

字段属性fields和fieldsets 不可同时存在

#### (7) 配置students模型

**实例：**

```python
# 配置students模型
class StudentsAdmin(admin.ModelAdmin):
    # 性别显示男女
    def set_sex(self):
        if self.ssex:
            return '男'
        else:
            return '女'
    # 设置在页面上显示的名称
    set_sex.short_description = "性别"
    # 显示哪些字段
    list_display = ['pk','sname',set_sex,'sage','sgrade']
    # 执行动作框的位置的改变
    actions_on_top = True
    actions_on_bottom = False

# Register your models here.
admin.site.register(Students,StudentsAdmin)
```

#### (8) 配置关联对象 在添加班级的时候 添加学生数据

**实例：**

```python
from django.contrib import admin
from App.models import Grade,Students,User
# TabularInline 横着显示添加学生的布局
# StackedInline 竖着显示添加学生的布局
class StudentsInfo(admin.StackedInline):
    model = Students # 对应的模型
    extra = 2 # 添加学生的个数

# 配置grade
class GradeAdmin(admin.ModelAdmin):
    inlines = [StudentsInfo]
    ...
```

#### (9) 使用装饰器完成注册

```python
from django.contrib import admin
from App.models import Grade,Students,User
# TabularInline 横着显示添加学生的布局
# StackedInline 竖着显示添加学生的布局
class StudentsInfo(admin.StackedInline):
    model = Students # 对应的模型
    extra = 2 # 添加学生的个数

# 配置grade
@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    ...
 
# 配置students模型
@admin.register(Students)
class StudentsAdmin(admin.ModelAdmin):
    ...

# Register your models here.
# admin.site.register(User)
# admin.site.register(Grade,GradeAdmin)
# admin.site.register(Students,StudentsAdmin)
```



## 二、用户认证User

User是auth模块中维护用户信息的关系模式 在数据中该表名称被定义为 auth_user

#### (1) 该模型的定义为：

```mysql
Create Table: CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

#### (2) 使用：

**导入：**

```python
from django.contrib.auth.models import User
```

django中的用户模型 内部带有很多属性和方法  可以直接使用

1. ##### is_staff  bool值

   决定用户是否可以访问 admin（后台）默认False

2. ##### is_active  bool值

   用户是否活跃 默认True  一般在删除用户的时候 并不是直接进行删除  而是将用户的is_active设置为False

3. ##### is_authenticated bool值

    用户是否通过验证(登录)

4. ##### make_password(password) 

   给密码进行hash加密

5. ##### check_password(password) bool值

   检验密码是否正确

6. ##### set_password(password)

   修改密码

7. ##### authenticate()  bool值

   认证用户名和密码是否正确


### 使用auth_user实现完成登录注册功能

#### (1) 注册

**实例：**

```python
from django.contrib import messages
from django.contrib.auth.models import User # 导入User模型
from django.shortcuts import render,HttpResponse,redirect,reverse


# 注册
def register(req):
    if req.method == 'POST':
        try:
            username = req.POST.get('username')
            userpass = req.POST.get('userpass')
            email = req.POST.get('email')
            # 将用户数据进行保存
            user = User.objects.create_user(username,email,userpass)
            user.save()
            messages.success(req,'注册成功！')
            return redirect(reverse('App:login'))
        except:
            messages.error(req,'注册失败')
    return render(req,'user/register.html')
```

#### (2) 认证用户

导入authenticate模块  进行用户数据的认证

##### 导入：

```python
from django.contrib.auth import authenticate # 导入用户认证的模块
```

**使用：**

```python
def Login(req):
    if req.method == 'POST':
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        u = authenticate(username=username,password=userpass)
        print(u)
    return render(req,'user/login.html')
```

如果认证成功 则返回u对象  认证失败则为 None

#### (3) 登录

**实例：**

```python
from django.contrib.auth import authenticate,login,logout # 导入用户认证的模块

# 登录
def Login(req):
    if req.method == 'POST':
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        u = authenticate(username=username,password=userpass)
        # 验证当前用户是否认证通过(是否输入正确的用户名和密码)
        if u:
            # 判断该用户是否为激活状态
            if u.is_active:
                login(req,u)
                messages.success(req,'登录成功！')
                return redirect(reverse('App:index'))
            messages.error(req, '该用户已被注销')
            return redirect(reverse('App:login'))
        messages.error(req,'请输入正确的用户名或密码')
        return redirect(reverse('App:login'))
    return render(req,'user/login.html')
```

**模板中判断用户是否登录：**

**实例：**

```html
<div>
    {% if request.user.is_authenticated %}
        <span>欢迎：{{ request.user.username }}</span>
    {% else %}
        <span>登录 | 注册</span>
    {% endif %}
</div>
```



#### (4) 视图函数中判断是否登录

**实例：**

```python
# 视图函数中判断是否登录
def is_login(req):
    # 返回布尔值
    # print(req.user.is_authenticated())
    if req.user.is_authenticated():
        print(req.user.username)
        print(req.user.is_active)
    return HttpResponse("视图函数中判断是否登录")
```



#### (5) 修改密码

**实例：**

```python
# 修改密码
def update_password(req):
    username = 'lucky_boy'
    userpass = '123456'
    u = authenticate(username=username, password=userpass)
    if u:
        u.set_password('123123')
        u.save()
        return HttpResponse('密码修改成功')
    return HttpResponse('修改密码')
```



#### (6) 退出登录

```python
from django.contrib.auth import authenticate,login,logout # 导入用户认证的模块
# 退出登录
def Logout(req):
    logout(req)
    return redirect(reverse('App:index'))
```



#### (7) 限制路由的访问（只允许登录的用户进行访问）

装饰器login_required 会通过session key 来检测当前用户是否登录 如果没有登录 则会被重定向到 login_url的位置 进行登录 如果没有指定login_url 则会去settings.py文件中查找LOGIN_URL的地址 在进行重定向

**导入：**

```python
from django.contrib.auth.decorators import login_required # 必须登录才能进行访问
```

**实例：**

```python
# 测试 只有登录才能进行访问的视图函数
# @login_required(login_url='/login/')
@login_required
def test_visit(req):
    return HttpResponse('必须登录才能访问')
```

**要求：**

当检测到没有登录 重定向到到登录  当完成登录 则跳转回上次访问失败的url地址

**解决的办法：**

1. 存储在session中
2. 表单隐藏域中
3. 通过传参拼凑get传参

**存储在session中实例：**

```python
# 登录
def Login(req):
    # 判断当前是否有get 有则存储在session中
    url = req.GET.get('next')
    if url:
        req.session['next'] = url
    if req.method == 'POST':
        username = req.POST.get('username')
        userpass = req.POST.get('userpass')
        u = authenticate(username=username,password=userpass)
        # 验证当前用户是否认证通过(是否输入正确的用户名和密码)
        if u:
            # 判断该用户是否为激活状态
            if u.is_active:
                login(req,u)
                messages.success(req,'登录成功！')
                return redirect(req.session.get('next',reverse('App:index')))
            messages.error(req, '该用户已被注销')
            return redirect(reverse('App:login'))
        messages.error(req,'请输入正确的用户名或密码')
        return redirect(reverse('App:login'))
    return render(req,'user/login.html')
```



## 三、自定义用户表

给auth_user 添加字段 phone 和 icon

**models.py**

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    phone = models.CharField(max_length=11)
    icon = models.CharField(max_length=70,default='default.jpg')
```

**在settings.py中设置**

```python
AUTH_USER_MODEL = 'App.User'
```

将数据库和模型迁移文件删除 重新执行迁移操作

**添加自定义用户认证**

通过查询用户名和手机号码都可以进行登录

在App下新建一个auth.py文件

##### auth.py代码如下

```python
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import User

class MyBackend(ModelBackend):
    def authenticate(self, username=None, password=None, **kwargs):
        user = User.objects.filter(Q(username=username)|Q(phone=username)).first()
        if user:
            if user.check_password(password):
                return user
        return False
```

##### 在settings.py下添加如下代码：

**指定验证方法为我们自定义的authenticate方法**

```python
AUTHENTICATION_BACKENDS = ('App.auth.MyBackend',)
```

##### 视图代码将导入模型改为

> from App.models import User



































