# Django 框架教程

> 预计阅读：约 32 分钟（正文约 10000 字）
> 阅读建议：先跑通项目、路由、模板、模型、Admin 与认证，再按需阅读 DRF、缓存、异步任务、部署和源码机制。

## 一、核心概述

Django 是 batteries-included 风格的 Python Web 框架。它把路由、视图、模板、ORM、Admin、认证、Session、缓存、邮件、安全防护和管理命令放在同一套工程体系里，适合后台系统、内容管理系统、企业业务系统和需要稳定约束的 API 服务。

本文从 [old-django-notes](/md/archive/README?id=old-django-notes) 拆出独立教程，按“项目启动 → 请求响应 → 模板 → ORM → 认证与 Admin → 工程能力 → DRF → 部署 → 源码理解”重组。旧归档中的 xadmin、旧版正则 URL、Django 1.8/2.1 兼容补丁等内容只保留为历史提示，新项目以官方稳定版 Django 6.1 文档口径为准。

> 💡 补充：Django 官方 stable 文档当前指向 6.1；如果维护老项目，应先确认项目真实版本，再查对应版本文档，不要把新版本写法直接迁入旧代码。

## 二、项目初始化与目录结构

### 2.1 创建项目与应用

归档里的 day1 笔记强调先跑通整体流程：创建项目、创建 app、注册应用、配置数据库、执行迁移、启动服务。现代项目仍然遵循这个主线。

```bash
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install "Django>=6.1,<6.2"

django-admin startproject config .
python manage.py startapp users
python manage.py migrate
python manage.py runserver
```

常见目录可以组织为：

```text
project/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── users/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   └── views.py
├── templates/
├── static/
├── media/
└── manage.py
```

### 2.2 注册应用与基础配置

```python
# config/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "users",
]

LANGUAGE_CODE = "zh-hans"
TIME_ZONE = "Asia/Shanghai"
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
```

如果把业务 app 放到 `apps/` 目录，旧归档做法是在 `settings.py` 中追加 `sys.path`。现代项目更推荐让目录成为标准 Python package，或使用明确的 import 路径，避免隐式修改路径导致部署环境和本地环境不一致。

## 三、URL、视图、请求与响应

### 3.1 URLConf 与 path

旧笔记中有大量 `url(r'^...')` 写法，这是 Django 旧版本 API。新项目优先使用 `path()` 和 `re_path()`，只有确实需要正则时再用 `re_path()`。

```python
# users/urls.py
from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:pk>/", views.detail, name="detail"),
]
```

```python
# config/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 3.2 视图本质

视图本质是接收 `HttpRequest` 并返回 `HttpResponse` 的可调用对象。归档里的“无参路由、带参数路由、多个路由指向一个视图、JsonResponse、redirect/reverse”都属于这一层。

```python
# users/views.py
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .models import UserProfile


def index(request):
    users = UserProfile.objects.order_by("-id")[:20]
    return render(request, "users/index.html", {"users": users})


def detail(request, pk):
    user = get_object_or_404(UserProfile, pk=pk)
    return JsonResponse({"id": user.id, "nickname": user.nickname})


def go_detail(request, pk):
    return redirect(reverse("users:detail", args=[pk]))
```

| 能力 | Django 写法 | 说明 |
|---|---|---|
| 返回文本/HTML | `HttpResponse` / `render` | 页面型接口常用 |
| 返回 JSON | `JsonResponse` | API 或局部交互常用 |
| 404 查询 | `get_object_or_404` | 查询不到直接返回 404 |
| 重定向 | `redirect` | 支持 URL、视图名、模型对象 |
| 反向解析 | `reverse` / `{% url %}` | 避免硬编码 URL |

### 3.3 请求数据与 Cookie/Session

```python
def search(request):
    keyword = request.GET.get("q", "")
    page = int(request.GET.get("page", "1"))
    return JsonResponse({"q": keyword, "page": page})


def login_state(request):
    request.session["uid"] = 1
    request.session.set_expiry(60 * 60 * 24)
    response = JsonResponse({"ok": True})
    response.set_cookie("visited", "1", max_age=3600, httponly=True)
    return response
```

Session 默认存储在数据库表中，也可以切到缓存、文件或 Redis。归档里把 Redis Session 作为常见优化点；实际使用时要同时考虑过期策略、序列化格式、密钥轮换和水平扩展。

## 四、模板系统

### 4.1 渲染、变量和标签

Django 模板负责把视图数据渲染成 HTML。归档覆盖了变量、`if`、`for`、`empty`、注释、include、extends、过滤器、消息展示和 CSRF。

```html
<!-- templates/users/index.html -->
{% extends "base.html" %}

{% block content %}
  <h1>用户列表</h1>
  <ul>
    {% for user in users %}
      <li>
        <a href="{% url 'users:detail' user.id %}">{{ user.nickname|default:user.username }}</a>
      </li>
    {% empty %}
      <li>暂无用户</li>
    {% endfor %}
  </ul>
{% endblock %}
```

### 4.2 模板继承与 include

```html
<!-- templates/base.html -->
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>{% block title %}Django Demo{% endblock %}</title>
</head>
<body>
  {% include "partials/nav.html" %}
  <main>{% block content %}{% endblock %}</main>
</body>
</html>
```

`extends` 解决页面骨架复用，`include` 解决局部片段复用。模板层不应堆业务查询逻辑，复杂判断应提前在视图、服务层或模型方法中准备好。

### 4.3 表单与 CSRF

```html
<form method="post" enctype="multipart/form-data">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">提交</button>
</form>
```

归档里多次强调 CSRF：POST 表单必须带 `csrf_token`。如果是 API 接口，要明确认证机制与 CSRF 策略，不能简单关闭中间件后遗忘安全边界。

## 五、模型与 ORM

### 5.1 模型定义

```python
from django.conf import settings
from django.db import models


class Grade(models.Model):
    name = models.CharField(max_length=40, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "班级"
        verbose_name_plural = "班级"

    def __str__(self):
        return self.name


class Student(models.Model):
    name = models.CharField(max_length=40, db_index=True)
    age = models.PositiveSmallIntegerField(default=18)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name="students")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
```

归档中的字段类型、字段选项、Meta 元选项、自定义 Manager、一对多/多对多关系，都可以归到模型设计。关键是把“表结构”“业务含义”“删除策略”“查询路径”一起考虑。

| 关系 | 字段 | 常见场景 |
|---|---|---|
| 一对多 | `ForeignKey` | 学生属于班级、订单属于用户 |
| 一对一 | `OneToOneField` | 用户扩展资料、唯一配置 |
| 多对多 | `ManyToManyField` | 用户角色、课程标签 |

### 5.2 迁移与数据库

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
```

`makemigrations` 生成模型变更记录，`migrate` 把迁移应用到数据库。旧笔记里直接进入 shell 做 `save()`、`delete()` 的练习仍然有效，但生产环境不要手工改数据库绕过迁移。

### 5.3 查询集与过滤

```python
from django.db.models import Count, Q

Student.objects.all()
Student.objects.filter(age__gte=18, name__contains="张")
Student.objects.exclude(grade__name="测试班")
Student.objects.order_by("-id")
Student.objects.values("id", "name", "grade__name")
Student.objects.filter(Q(name__icontains="li") | Q(age__lt=18))
Grade.objects.annotate(student_count=Count("students"))
```

QuerySet 是惰性对象。链式调用先构造 SQL，真正迭代、切片、取值、序列化时才查询数据库。常见性能优化：

| 问题 | 方案 |
|---|---|
| 外键 N+1 查询 | `select_related()` |
| 多对多 N+1 查询 | `prefetch_related()` |
| 只读少量字段 | `only()` / `values()` |
| 批量插入 | `bulk_create()` |
| 复杂条件 | `Q` 对象 |
| 字段间比较 | `F` 对象 |

> 💡 补充：归档中“Django 源码解析”提到 ORM 会把模型查询翻译为 SQL。理解 QuerySet 惰性、SQL 编译和数据库连接层，有助于定位慢查询和隐式 N+1。

## 六、Admin、认证与自定义用户

### 6.1 Admin 站点

归档 day6 详细记录了后台注册、列表字段、过滤、搜索、分页和关联对象内联编辑。Admin 适合内部管理，不应被当成面向公众用户的产品页面。

```python
from django.contrib import admin

from .models import Grade, Student


class StudentInline(admin.TabularInline):
    model = Student
    extra = 0


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    inlines = [StudentInline]


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "age", "grade")
    list_filter = ("grade",)
    search_fields = ("name",)
```

### 6.2 内置认证

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render


def login_view(request):
    if request.method == "POST":
        user = authenticate(
            request,
            username=request.POST.get("username"),
            password=request.POST.get("password"),
        )
        if user is not None:
            login(request, user)
            return redirect("users:index")
    return render(request, "users/login.html")


@login_required(login_url="/login/")
def profile(request):
    return render(request, "users/profile.html")


def logout_view(request):
    logout(request)
    return redirect("users:index")
```

认证体系的核心是 `User`、`authenticate()`、`login()`、`logout()`、权限和 Session。密码必须使用 `set_password()` 或表单体系处理，不能明文保存。

### 6.3 自定义用户表

归档里有自定义用户表和手机号/邮箱认证示例。新项目如果需要自定义用户，应该在第一次迁移前确定 `AUTH_USER_MODEL`。

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    mobile = models.CharField(max_length=20, unique=True, null=True, blank=True)

# settings.py
AUTH_USER_MODEL = "users.User"
```

老项目中途更换用户模型成本高，通常需要数据迁移、外键迁移和认证后端调整。

## 七、缓存、邮件、文件上传与中间件

### 7.1 缓存

归档 day5 记录了数据库缓存、内存缓存、文件缓存、Redis 缓存和手动 `cache.set/get/delete/clear`。

```python
from django.core.cache import cache

cache.set("homepage:data", {"count": 10}, timeout=300)
data = cache.get("homepage:data")
cache.delete("homepage:data")
```

缓存适合读多写少或计算昂贵的数据。不要缓存用户私有数据到全局 key；key 需要包含用户、租户、语言、权限等影响结果的维度。

### 7.2 邮件

```python
from django.core.mail import send_mail

send_mail(
    subject="账户激活",
    message="请点击链接激活账户",
    from_email="noreply@example.com",
    recipient_list=["user@example.com"],
    fail_silently=False,
)
```

注册激活、验证码、通知类邮件不要直接阻塞主请求；归档中后续引入 Celery 正是为了解决耗时任务的问题。

### 7.3 文件上传

```python
def upload_avatar(request):
    if request.method == "POST" and request.FILES.get("avatar"):
        avatar = request.FILES["avatar"]
        if avatar.size > 2 * 1024 * 1024:
            return JsonResponse({"error": "file too large"}, status=400)
        # 实际项目应使用存储后端，并校验 MIME、后缀、图片内容和访问权限。
        return JsonResponse({"name": avatar.name})
    return render(request, "users/upload.html")
```

文件上传要同时处理大小、类型、存储路径、访问权限、随机文件名和图片处理。归档中的 Pillow 缩略图思路仍可用，但生产环境建议走对象存储或统一存储后端。

### 7.4 中间件

旧归档记录的中间件钩子包括 `process_request`、`process_view`、`process_template_response`、`process_response`、`process_exception`。现代写法可以使用可调用对象，也可以在需要兼容旧钩子时使用 `MiddlewareMixin`。

```python
class RequestIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get("X-Request-ID", "")
        response = self.get_response(request)
        if request.request_id:
            response["X-Request-ID"] = request.request_id
        return response
```

中间件适合做请求级横切逻辑：登录检查、IP 限制、审计日志、请求 ID、缓存头、安全头等。不要把业务流程塞进中间件。

## 八、Django REST framework

### 8.1 RESTful API 与序列化器

归档中的 DRF 笔记覆盖了模型设计、Serializer、ModelSerializer、APIView、mixins、generics、ViewSet、Router、分页、过滤、搜索、排序、认证、权限、缓存和限流。教程主线可以从 `ModelSerializer + ViewSet + Router` 入手。

```python
from rest_framework import serializers, viewsets

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "age", "grade"]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related("grade").all()
    serializer_class = StudentSerializer
```

```python
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from users.views import StudentViewSet

router = DefaultRouter()
router.register("students", StudentViewSet, basename="student")

urlpatterns = [
    path("api/", include(router.urls)),
]
```

### 8.2 视图层次

| 层次 | 特点 | 适用场景 |
|---|---|---|
| `APIView` | 最接近 Django CBV，手写方法 | 非标准接口 |
| `GenericAPIView + mixins` | 可复用增删改查片段 | 需要局部组合 |
| `generics.*APIView` | 常见 CRUD 快速实现 | 简单资源接口 |
| `ViewSet + Router` | 路由和动作集中 | 标准 REST 资源 |

### 8.3 认证、权限、过滤与限流

```python
from rest_framework.permissions import IsAuthenticated


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["grade"]
    search_fields = ["name"]
    ordering_fields = ["id", "age"]
```

Token/JWT、权限类、搜索过滤、排序分页和限流是 API 项目的基础配置。归档里提到的“复制 Django 内部 six.py”等兼容补丁属于旧版本踩坑，不应在新项目中延续；遇到兼容问题优先升级依赖或固定可兼容版本。

## 九、日志、异步任务与部署

### 9.1 日志

归档 day8 把日志拆成等级、Logger、Handler、Filter、Formatter 和 Django `LOGGING` 配置。生产环境建议至少分离应用日志、错误日志和访问日志。

```python
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
```

### 9.2 Celery

归档高级篇把 Celery 拆成 task、queue、worker、broker 四个核心概念。典型场景是发送邮件、生成报表、图片处理、第三方接口回调重试。

```python
# users/tasks.py
from celery import shared_task


@shared_task
def send_welcome_email(user_id):
    return f"sent:{user_id}"

# views.py
send_welcome_email.delay(request.user.id)
```

定时任务需要额外引入 beat 或平台调度器。不要把必须立刻成功的核心事务直接丢进异步任务后忽略失败补偿。

### 9.3 生产部署

旧笔记中的 uWSGI + Nginx 仍是可用路线，但现在也常见 Gunicorn/Uvicorn + Nginx、容器化部署和平台托管。

```bash
python manage.py check --deploy
python manage.py collectstatic
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

上线前至少检查：

| 项目 | 要点 |
|---|---|
| `DEBUG` | 生产必须关闭 |
| `SECRET_KEY` | 从环境变量读取，不入库 |
| `ALLOWED_HOSTS` | 明确域名 |
| 静态文件 | `collectstatic` 后由 Nginx/CDN 托管 |
| 数据库 | 独立账号、最小权限、备份 |
| 日志 | 输出到文件、stdout 或日志系统 |
| 安全 | HTTPS、CSRF、Cookie Secure、Host 校验 |

## 十、源码理解与常见坑

### 10.1 管理命令与 ORM 背后机制

`manage.py` 会设置 `DJANGO_SETTINGS_MODULE`，再把命令交给 Django 管理命令系统。`startproject`、`startapp`、`makemigrations`、`migrate` 都是命令框架中的子命令。

ORM 查询大致经历：模型字段描述 → QuerySet 构造查询树 → SQLCompiler 翻译 SQL → 数据库驱动执行 → 行数据映射回模型对象。理解这条链路，就能解释为什么 QuerySet 惰性、为什么 N+1 会出现、为什么 `values()` 能减少对象构造成本。

### 10.2 过时与迁移注意

| 归档内容 | 当前处理 |
|---|---|
| `url()` 正则路由 | 新项目改用 `path()` / `re_path()` |
| xadmin | 生态活跃度和兼容性不足，新项目优先用 Django Admin 或维护良好的后台方案 |
| Django 1.8/2.1 中文镜像文档 | 仅作历史参考，当前查官方版本文档 |
| 复制 `six.py` 等补丁 | 不推荐，优先升级/降级依赖解决兼容 |
| uWSGI-only 部署 | 可用，但 Gunicorn/容器化也应作为默认候选 |
| 手写 Session 登录 | 学习可用，真实项目优先用 `django.contrib.auth` |

## 📚 完整资料

> **原文归档**：[archive/old-django-notes/](/md/archive/README?id=old-django-notes)

- [Djangoday1整体跑通](../archive/old-django-notes/Djangoday1整体跑通.md) — 项目创建、应用注册、迁移与启动。
- [Django-2视图](../archive/old-django-notes/Django-2视图.md) — URL、请求、响应、重定向、Cookie、Session。
- [Djangoday3模板](../archive/old-django-notes/Djangoday3模板.md) — 模板变量、标签、继承、过滤器与 CSRF。
- [Djangoday4模型](../archive/old-django-notes/Djangoday4模型.md) — ORM、字段、模型、查询与管理器。
- [Djangoday5缓存发送邮件用户登录注册](../archive/old-django-notes/Djangoday5缓存发送邮件用户登录注册.md) — 缓存、邮件、注册激活与验证码。
- [Djangoday6admin站点配置用户认证user](../archive/old-django-notes/Djangoday6admin站点配置用户认证user.md) — Admin、内置 User、自定义用户表。
- [Djangoday7Advaced](../archive/old-django-notes/Djangoday7Advaced.md) — 静态文件、中间件、分页、上传、富文本、Celery。
- [Djangoday8日志](../archive/old-django-notes/Djangoday8日志.md) — Python logging 与 Django 日志配置。
- [django-rest-framework开发笔记](../archive/old-django-notes/django-rest-framework开发笔记.md) — DRF 项目、序列化、视图、认证、权限、过滤。
- [django上线部署](../archive/old-django-notes/django上线部署.md) — uWSGI、Nginx 与上线问题。
- [Django源码解析](../archive/old-django-notes/Django源码解析.md) — 管理命令、ORM 与 SQL 翻译。
- 官方参考：[Django documentation](https://docs.djangoproject.com/en/stable/)。

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-27 | 新增 | 从 Python 基础与生态中拆出 Django 独立主线，参考 old-django-notes 重组项目启动、视图、模板、模型、认证、Admin、DRF、缓存、异步任务、部署与源码理解，并补充 Django 6.1 口径下的过时写法提示 |
