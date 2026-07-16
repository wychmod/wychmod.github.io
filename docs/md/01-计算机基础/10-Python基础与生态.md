# Python 基础与生态

> **原文归档**：[archive/old-python-notes/](../archive/old-python-notes/) + [archive/old-django-notes/](../archive/old-django-notes/) + [archive/old-flask-notes/](../archive/old-flask-notes/)
> 包含：90+ 文件（Python 高级/高效/源码 + Django + Flask + 数据分析 + 工具生态）

---

## 一、核心主题概述

本归档覆盖 Python 从语言基础到工程落地的完整知识栈：语言核心、面向对象与高级特性、并发编程、源码与底层、Django/Flask Web 开发、工具生态、数据科学。核心资料集中在 [Python高级](../archive/old-python-notes/Python高级/)、[Python源码剖析](../archive/old-python-notes/Python源码剖析/)、[Django 笔记](../archive/old-django-notes/)、[Flask 笔记](../archive/old-flask-notes/) 四个目录。

---

## 二、Python 语言核心

### 2.1 一切皆对象

Python 中函数、类、类型、模块本身都是对象。

```python
>>> type(1)
<class 'int'>
>>> type(int)
<class 'type'>
>>> int.__bases__
(<class 'object'>,)
```

`type` 是创建类的类（元类），`object` 是最顶层基类。

### 2.2 变量、可变性与比较

变量是指向对象的引用。`==` 比较值，`is` 比较身份；小整数和短字符串会被缓存。

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)       # [1, 2, 3, 4]
print(a is b)  # True
```

### 2.3 内置类型速览

| 类型 | 可变性 | 场景 |
|---|---|---|
| `int/float/complex/bool` | 不可变 | 数值运算 |
| `str/bytes/tuple/frozenset` | 不可变 | 键、常量 |
| `list/dict/set/bytearray` | 可变 | 容器、缓存、去重 |

### 2.4 常用 Python 惯用法

```python
squares = [x * x for x in range(10) if x % 2 == 0]
mapping = {k: v for k, v in zip(keys, values)}
unique = {x for x in items}

a, b = b, a
first, *rest = [1, 2, 3, 4]

for idx, val in enumerate(items, start=1):
    pass

value = counts.get(key, 0)

with open('data.txt', encoding='utf-8') as f:
    content = f.read()
```

> 💡 补充：[Effective Python 笔记](../archive/old-python-notes/Python书籍阅读/Effective%20Python：编写高质量Python代码的90个有效方法.md) 强调优先使用 f-string、推导式、生成器表达式与 namedtuple。

---

## 三、Python 高级特性

### 3.1 魔法函数与自定义序列

通过实现 dunder methods，自定义类可支持 Python 内置语法。

```python
import numbers

class Group:
    def __init__(self, name, company, staffs):
        self.name, self.company, self.staffs = name, company, list(staffs)

    def __len__(self):      return len(self.staffs)
    def __iter__(self):     return iter(self.staffs)
    def __contains__(self, item): return item in self.staffs

    def __getitem__(self, item):
        cls = type(self)
        if isinstance(item, slice):
            return cls(self.name, self.company, self.staffs[item])
        elif isinstance(item, numbers.Integral):
            return cls(self.name, self.company, [self.staffs[item]])
```

常用：`__str__`/`__repr__`、`__len__`/`__getitem__`、`__iter__`/`__next__`、`__enter__`/`__exit__`、`__call__`。

### 3.2 鸭子类型与抽象基类

Python 强调行为而非类型。强制子类实现方法可使用 `abc.ABCMeta`。

```python
import abc

class CacheBase(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def get(self, key): pass
    @abc.abstractmethod
    def set(self, key, value): pass
```

> 💡 补充：多继承场景更推荐 Mixin 模式，参考 [DRF 笔记](../archive/old-django-notes/django-rest-framework开发笔记.md)。

### 3.3 静态方法、类方法、描述符

```python
class Date:
    def __init__(self, y, m, d):
        self.y, self.m, self.d = y, m, d

    @staticmethod
    def valid_str(s):
        y, m, d = map(int, s.split("-"))
        return 0 < y and 1 <= m <= 12 and 1 <= d <= 31

    @classmethod
    def from_string(cls, s):
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)
```

描述符实现 `__get__`/`__set__`/`__delete__`；`property` 是其语法糖。属性查找顺序：数据描述符 > 实例属性 > 非数据描述符/类属性 > `__getattr__`。

### 3.4 元类

元类用于创建类，典型用途是 ORM 字段映射。

```python
class ModelMetaClass(type):
    def __new__(cls, name, bases, attrs):
        if name == "BaseModel":
            return super().__new__(cls, name, bases, attrs)
        attrs["fields"] = {k: v for k, v in attrs.items() if isinstance(v, Field)}
        return super().__new__(cls, name, bases, attrs)
```

> 💡 补充：理解元类有助于阅读 Django ORM、SQLAlchemy 源码。

### 3.5 迭代器与生成器

```python
def fib(n):
    a, b = 1, 1
    while n:
        yield b
        a, b = b, a + b
        n -= 1

for value in fib(10):
    print(value)
```

`yield from` 委托子生成器；生成器表达式比列表推导更省内存。

### 3.6 上下文管理器

```python
import contextlib

@contextlib.contextmanager
def managed_resource(name):
    print(f"acquire {name}")
    yield {"name": name}
    print(f"release {name}")
```

---

## 四、Python 源码与底层

### 4.1 对象模型

CPython 中对象由 `PyObject` 表示，核心字段是引用计数 `ob_refcnt` 和类型指针 `ob_type`。`PyType_Type` 是 `type`，`PyBaseObject_Type` 是 `object`。

### 4.2 内建对象实现要点

- `float`：定长对象，内部 `double`。
- `int`：变长对象，支持任意精度。
- `str`：不可变序列，缓存哈希值。
- `list`：动态数组，翻倍扩容。
- `dict`：哈希表，由索引数组和键值对数组组成，平均 O(1)。

### 4.3 GIL

CPython 的 GIL 保证同一时刻只有一个线程执行字节码，多线程无法并行利用多核。

| 场景 | 推荐方案 |
|---|---|
| IO 密集型 | 多线程 / 协程 |
| CPU 密集型 | 多进程 |
| 高并发网络 | `asyncio` / `aiohttp` |

```python
from concurrent.futures import ProcessPoolExecutor

# CPU 密集型：多进程更快
with ProcessPoolExecutor(4) as ex:
    list(ex.map(cpu_task, nums))
```

### 4.4 垃圾回收

1. **引用计数**：对象引用归零立即回收。
2. **标记-清除**：处理循环引用。
3. **分代回收**：0/1/2 三代，降低 GC 频率。

```python
import gc
gc.collect()
```

> 💡 补充：循环引用常见于容器相互引用，必要时使用 `weakref` 打破。

### 4.5 内存池与内存泄露

CPython 通过 `pymalloc` 管理小内存。排查内存泄露可用 `tracemalloc`、`objgraph`。

---

## 五、Web 框架：Django

### 5.1 项目结构与启动

```bash
django-admin startproject mysite
cd mysite
django-admin startapp app01
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

```python
INSTALLED_APPS = ['django.contrib.admin', 'rest_framework', 'app01']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'testdjango',
        'USER': 'root', 'PASSWORD': '123456',
        'HOST': '127.0.0.1', 'PORT': 3306,
    }
}
```

### 5.2 路由与视图

```python
# app01/urls.py
from django.urls import path
from . import views

app_name = 'app01'
urlpatterns = [
    path('', views.index, name='index'),
    path('user/<int:pk>/', views.user_detail, name='user_detail'),
]

# app01/views.py
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import User

def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    return JsonResponse({"id": user.id, "name": user.name})
```

### 5.3 ORM 与模型关系

```python
from django.db import models

class Grade(models.Model):
    name = models.CharField(max_length=20)

class Student(models.Model):
    name = models.CharField(max_length=20)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='students')

Student.objects.filter(grade__name='python').select_related('grade').values('name', 'grade__name')
```

常用查询：`filter`、`exclude`、`get`、比较查找（`__gt`/`__range`/`__contains`）、聚合（`Avg/Sum/Count`）、Q/F 对象。

### 5.4 Django REST framework

```python
from rest_framework import serializers, viewsets
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# urls.py
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'users', UserViewSet)
urlpatterns = router.urls
```

> 💡 补充：DRF 中常用 `get_serializer_class` 按 action 切序列化器，`get_permissions` 控权限，`filter_backends` 做过滤/搜索/排序。

### 5.5 认证、会话与部署

- `Cookie` / `Session`：默认数据库存储，可切 Redis / 缓存。
- `JWT`：`djangorestframework-simplejwt` 推荐用于无状态认证。
- 部署：Nginx + uWSGI / Gunicorn + Django。

---

## 六、Web 框架：Flask

### 6.1 最小应用与路由

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello Flask'

@app.route('/users/<int:user_id>')
def user_detail(user_id):
    return jsonify({"id": user_id})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 6.2 请求与响应

```python
from flask import request, redirect, url_for

@app.route('/search')
def search():
    return jsonify({"q": request.args.get('q', '')})

@app.route('/login', methods=['POST'])
def login():
    return redirect(url_for('index'))
```

### 6.3 SQLAlchemy

```python
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/test_flask'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), index=True)
    age = db.Column(db.Integer, default=18)

@app.route('/add')
def add_user():
    db.session.add(User(username='lucky'))
    db.session.commit()
    return 'added'
```

### 6.4 蓝图与部署

```python
from flask import Blueprint
user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.route('/login')
def login():
    return 'login'

# app.py
from user import user_bp
app.register_blueprint(user_bp)
```

生产环境使用 uWSGI / Gunicorn + Nginx。

```ini
[uwsgi]
socket = 0.0.0.0:8000
chdir = /home/xlg/test
wsgi-file = manage.py
callable = app
processes = 4
threads = 2
```

> 💡 补充：Flask 适合中小型服务或微服务；大型单体项目建议使用 Django 或 FastAPI。

---

## 七、工具生态与工程化

### 7.1 UV

UV 由 Rust 编写，统一 Python 版本、虚拟环境与依赖管理。

```bash
uv init myproject
cd myproject
uv python pin 3.12
uv venv
uv add requests pydantic
uv add --dev pytest black mypy
uv sync
uv run pytest
```

```toml
[project]
name = "myproject"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.31.0", "pydantic>=2.0"]

[project.optional-dependencies]
dev = ["pytest>=7.4", "black>=23.0", "mypy>=1.5"]
```

> 💡 补充：旧项目迁移时保留 `pyproject.toml` 或 `requirements.txt`，删除旧 lock 文件后执行 `uv lock`。

### 7.2 Pydantic

Pydantic V2 基于 Rust 核心，是 FastAPI 底层依赖。

```python
from pydantic import BaseModel, Field, EmailStr, field_validator

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str):
        if not any(c.isupper() for c in v):
            raise ValueError('需要大写字母')
        return v

user = UserCreate(username='lucky', email='a@b.com', password='Hello1234')
print(user.model_dump())
```

能力：`Field` 约束、自定义验证器、序列化、JSON Schema、ORM 集成。

### 7.3 pytest

```bash
pytest -v -s
pytest test_user.py::TestUser::test_login
```

### 7.4 FastAPI

```python
from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

async def common_params(q: str = "", skip: int = 0, limit: int = 10):
    return {"q": q, "skip": skip, "limit": limit}

@app.get("/items/")
async def list_items(params: dict = Depends(common_params)):
    return params

@app.post("/items/")
async def create_item(item: Item):
    return item
```

### 7.5 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 项目 | 大写驼峰 | `MyProject` |
| 模块/包 | 小写下划线 | `my_module` |
| 类/异常 | 大写驼峰 | `ClassName` |
| 常量 | 全大写下划线 | `MAX_COUNT` |
| 函数/变量 | 小写下划线 | `my_function` |

---

## 八、数据分析与科学计算

归档 [python数据分析](../archive/old-python-notes/python数据分析/) 包含 NumPy、Pandas、Matplotlib、Seaborn 及股票实战项目。

### 8.1 NumPy

```python
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr.shape, arr.dtype)
print(arr + 10)
print(arr @ arr.T)
```

### 8.2 Pandas

```python
import pandas as pd

df = pd.DataFrame({
    'name': ['tom', 'jerry', 'spike'],
    'age': [20, 22, 25],
    'score': [85.5, 90.0, 78.5]
})

print(df[df['score'] > 80])
print(df.groupby('age')['score'].mean())
```

### 8.3 Matplotlib / Seaborn

```python
import matplotlib.pyplot as plt
import seaborn as sns

plt.plot([1, 2, 3], [4, 5, 6])
plt.title('Line Chart')
plt.show()

tips = sns.load_dataset('tips')
sns.barplot(x='day', y='total_bill', data=tips)
plt.show()
```

### 8.4 实战项目

股票分析项目覆盖数据获取、历史趋势、移动平均、收益率、波动率与风险分析。

> 💡 补充：Pandas 处理超大规模数据可能遇到性能瓶颈，可考虑 Polars、DuckDB。

---

## 九、2026 年 Python 生态

| 维度 | 主流选择 |
|---|---|
| 版本 | 3.11+，新项目建议 3.12+ |
| Web | FastAPI、Django、Flask |
| 数据科学 | Polars、Pandas |
| 异步 IO | `asyncio` + `uvloop` / AnyIO |
| 包管理 | UV（推荐）、Poetry、pdm |
| 类型检查 | mypy、pyright、Ruff |
| 数据验证 | Pydantic V2 |
| 测试 | pytest、hypothesis |
| LLM / Agent | LangChain、LlamaIndex、Pydantic AI、MCP |
| 部署 | Docker、Gunicorn、uWSGI、PyInstaller、Nuitka |

> 💡 补充：Ruff 可替代 black、isort、flake8 组合，统一代码格式与 lint。

---

## 十、常见坑与补充

**1. 默认参数是可变对象**

```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

**2. 浅拷贝 vs 深拷贝**

```python
import copy
a = [[1], [2]]
b = copy.deepcopy(a)  # 嵌套对象需深拷贝
```

**3. 闭包 late binding**

```python
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2]
```

**4. GIL 不是线程安全免死金牌**

```python
from threading import Lock
with lock:
    counter += 1
```

**5. 用 `isinstance` 而非 `type`**

```python
class Animal: pass
class Dog(Animal): pass
print(isinstance(Dog(), Animal))  # True
```

> 💡 补充：更多源码级细节、面试题与最佳实践请参阅 [Python源码剖析](../archive/old-python-notes/Python源码剖析/) 和 [Effective Python](../archive/old-python-notes/Python书籍阅读/Effective%20Python：编写高质量Python代码的90个有效方法.md)。

---

## 📚 完整资料

- [archive/old-python-notes/](../archive/old-python-notes/) — Python 完整笔记归档
- [archive/old-django-notes/](../archive/old-django-notes/) — Django 系统教程与 DRF 笔记
- [archive/old-flask-notes/](../archive/old-flask-notes/) — Flask 轻量教程与部署笔记
