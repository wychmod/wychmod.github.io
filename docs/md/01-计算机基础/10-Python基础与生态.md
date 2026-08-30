# Python 基础与生态

> 预计阅读：约 40 分钟（正文约 12689 字）
> 阅读建议：建议分两次阅读：先看概览、结论和关键表格，再按需翻文末原文归档。

## 一、核心主题概述

本归档覆盖 Python 从语言基础到工程落地的完整知识栈：语言核心、面向对象与高级特性、并发编程、源码与底层、工具生态、数据科学。Django 与 Flask 已拆为独立主线教程，本文仅保留 Web 生态入口。核心资料集中在 [Python高级](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-python-notes/Python%E9%AB%98%E7%BA%A7)、[Python源码剖析](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-python-notes/Python%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90)、[Python高效](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-python-notes/Python%E9%AB%98%E6%95%88)、[Django 笔记](/md/archive/README?id=old-django-notes)、[Flask 笔记](/md/archive/README?id=old-flask-notes) 五个目录。

> 💡 补充：源码剖析系列以 CPython 实现为线索；Web 框架系列以项目实战为主，已迁入 [Django 框架教程](./12-Django框架教程.md) 与 [Flask 框架教程](./14-Flask框架教程.md)。

## 二、Python 语言核心

### 2.1 一切皆对象

Python 中函数、类、类型、模块本身都是对象。

```python
>>> type(1) is int
True
>>> type(int) is type
True
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
squares = [x*x for x in range(10) if x % 2 == 0]
mapping = {k: v for k, v in zip(keys, values)}
unique = {x for x in items}
a, b = b, a
first, *rest = [1, 2, 3, 4]
for idx, val in enumerate(items, start=1): pass
value = counts.get(key, 0)
with open('data.txt', encoding='utf-8') as f:
    content = f.read()
```

标准库容器与算法选型：

| 需求 | 选择 |
|---|---|
| FIFO / 头部操作 | `collections.deque`（两端 O(1)；`list` 头部增删 O(N)） |
| 缺省键 / 计数 | `defaultdict` / `Counter` |
| 有序序列查找 | `bisect` 二分（对数级） |
| 优先队列 / TopN | `heapq` 最小堆 |

### 2.5 方法重写与方法重载

重写（overriding）发生在子类重新定义父类方法；重载依赖静态类型按参数个数/类型绑定版本，Python 动态类型不支持：同名方法后定义覆盖前定义。

### 2.6 命名规范

项目用大写驼峰，模块/包用小写下划线，类/异常用大写驼峰，常量全大写下划线，函数/变量小写下划线。详见 [Effective Python](../archive/old-python-notes/Python书籍阅读/Effective%20Python：编写高质量Python代码的90个有效方法.md)。

## 三、Python 高级特性

### 3.1 魔法函数与自定义序列

通过实现 dunder methods，自定义类可支持 Python 内置语法。

```python
import numbers
class Group:
    def __init__(self, name, staffs):
        self.name, self.staffs = name, list(staffs)
    def __len__(self): return len(self.staffs)
    def __iter__(self): return iter(self.staffs)
    def __getitem__(self, item):
        if isinstance(item, slice):
            return type(self)(self.name, self.staffs[item])
        return type(self)(self.name, [self.staffs[item]])
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

类变量 vs 实例属性：实例赋值会“遮蔽”类变量（`a.aa = 100` 仅新建实例属性），可变类变量被所有实例共享是经典坑；`__dict__`/`dir()` 可自省对象属性。

### 3.3 静态方法、类方法与描述符

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

描述符实现 `__get__`/`__set__`/`__delete__`；`property` 是其语法糖。查找顺序：数据描述符 > 实例属性 > 非数据描述符/类属性 > `__getattr__`。

对象创建机制：`__new__` 在对象生成前调用、控制创建过程，必须返回实例，否则 `__init__` 不会执行；`__init__` 仅初始化已创建对象。派生 `tuple` 等不可变类型只能重载 `__new__` 修改实例化行为；单例模式即在 `__new__` 中判断并复用类属性保存的唯一实例。

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

> 💡 补充：理解元类有助于阅读 Django ORM、SQLAlchemy 源码，详见 [Python源码剖析-26-metaclass](../archive/old-python-notes/Python源码剖析/Python源码剖析-26-metaclass元类编程.md)。

### 3.5 多继承、MRO 与 Mixin

Python 支持多继承，属性查找顺序由 C3 线性化拓扑排序决定并保存于 `__mro__`：子类先于父类、按基类定义顺序；顺序矛盾时抛 `TypeError: Cannot create a consistent MRO`。

Mixin 是常用多继承模式：功能单一、不与基类强耦合、可与任意基类组合；DRF ViewSet 即靠多继承 Mixin 组合能力。

### 3.6 迭代器、生成器与 `yield from`

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

生成器进阶：`send()` 向生成器传值并唤醒（须先 `send(None)` 预激），`close()`/`throw()` 控制生成器；`yield from` 建立调用方与子生成器双向通道并自动处理 `StopIteration`；Python 3.5 起 `async`/`await` 原生协程（`await` ≈ `yield from`）。

### 3.7 上下文管理器

```python
import contextlib
@contextlib.contextmanager
def managed_resource(name):
    print(f"acquire {name}")
    yield {"name": name}
    print(f"release {name}")
```

### 3.8 装饰器与闭包

```python
import functools, time
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} cost {time.time()-start:.3f}s")
        return result
    return wrapper
```

### 3.9 网络与异步 IO

```python
import asyncio
async def main():
    await asyncio.sleep(1)
    print("done")
asyncio.run(main())
```

`asyncio` 基于事件循环 + 协程实现高并发 IO；阻塞调用应交给 `run_in_executor`。

> 💡 补充：协程与生成器实现细节见 [Python源码剖析-29-生成器](../archive/old-python-notes/Python源码剖析/Python源码剖析-29-生成器%20generator.md) 与 [Python源码剖析-31-asyncio](../archive/old-python-notes/Python源码剖析/Python源码剖析-31-工程实践：用%20asyncio%20协程构建高并发应用.md)。

## 四、Python 源码与底层

### 4.1 对象模型

CPython 中对象由 `PyObject` 表示，核心字段是引用计数 `ob_refcnt` 和类型指针 `ob_type`。`PyType_Type` 即 `type`，`PyBaseObject_Type` 即 `object`。

### 4.2 内建对象实现要点

- `float`：定长对象，内部 `double`。
- `int`：变长对象，支持任意精度。
- `str`：不可变序列，缓存哈希值。
- `list`：动态数组，按约 1/8 裕量渐进扩容。
- `dict`：哈希表，由索引数组和键值对数组组成，平均 O(1)；键必须可哈希（`list`/`dict` 不可作键，自定义对象默认按 id 取哈希），3.7 起保证按插入顺序迭代；哈希冲突用开放地址法，装载因子达 2/3 即翻倍扩容（表长恒为 2^n，最小 8）。

### 4.3 虚拟机、字节码与作用域

CPython 将源码编译为字节码，由基于栈的虚拟机解释执行。`dis` 模块可查看字节码；函数调用通过 `PyFrameObject` 栈帧维护局部变量、作用域链与执行位置。import 时按 `sys.path` 搜索并执行模块代码。

作用域遵循 LEGB：名字按 Local -> Enclosing -> Global -> Built-in 查找；Python 为静态（词法）作用域，函数内赋值即视为局部名，修改外层需 `global`/`nonlocal`；名字空间由 dict 实现。编译产物（代码对象）会序列化为 `__pycache__` 下的 `.pyc` 缓存，再次导入直接加载免编译；源码变更后 pyc 失效重编译。

### 4.4 GIL

CPython 的 GIL 保证同一时刻只有一个线程执行字节码，多线程无法并行利用多核。Python 3.13 起提供实验性自由线程模式（PEP 703，`--disable-gil` 构建），可在多核 CPU 密集型场景下获得真正的并行能力，但生态兼容性仍在推进中。

GIL 按字节码行数/时间片切换，遇 IO 操作主动释放——这是“IO 密集多线程有效、CPU 密集无效”的底层机制。

| 场景 | 推荐方案 |
|---|---|
| IO 密集型 | 多线程 / 协程 |
| CPU 密集型 | 多进程 |
| 高并发网络 | `asyncio` / `aiohttp` |

```python
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor(4) as ex:
    list(ex.map(cpu_task, nums))
```

线程间通信用 `queue.Queue`：线程安全、`get`/`put` 阻塞，是标准生产者-消费者线程通信方案，可避免共享变量加锁。共享全局变量仅适用于多线程；多进程通信需 `multiprocessing.Queue`/`Pipe`/`Manager`，进程池中必须用 `Manager().Queue()`；Windows 下多进程代码须置于 `if __name__ == '__main__'`。

### 4.5 垃圾回收

1. **引用计数**：对象引用归零立即回收。
2. **标记-清除**：处理循环引用。
3. **分代回收**：0/1/2 三代，降低 GC 频率。

```python
import gc, weakref
gc.collect()
```

> 💡 补充：循环引用常见于容器相互引用，必要时使用 `weakref` 打破，详见 [Python源码剖析-33-引用计数](../archive/old-python-notes/Python源码剖析/Python源码剖析-33-引用计数的缺陷与应对.md)。

### 4.6 内存池与内存泄露

CPython 通过 `pymalloc` 按尺寸分类管理小内存。排查内存泄露可用 `tracemalloc`、`objgraph`、`gc` 模块。

声明 `__slots__` 后实例不再有 `__dict__`、禁止动态绑定属性：海量实例场景显著省内存（默认每实例携带一个属性字典，有数百字节开销），代价是失去动态新增属性能力，属标准性能优化手段。

## 五、Web 框架生态入口

Python Web 主线已经从本文拆出独立教程：

| 框架 | 定位 | 主线教程 |
|---|---|---|
| Django | batteries-included，全栈约束强，内置 ORM/Admin/认证/Session/缓存/邮件等能力 | [Django 框架教程](./12-Django框架教程.md) |
| Flask | 轻量 WSGI 框架，核心薄，数据库、表单、登录、迁移、邮件等能力通过扩展组合 | [Flask 框架教程](./14-Flask框架教程.md) |
| FastAPI | 类型驱动的 API 框架，常用于异步接口、OpenAPI 文档和 Pydantic 数据校验 | 见下文工具生态概览 |

Django 适合管理后台、内容系统、企业业务系统和稳定 API 服务；Flask 适合小服务、内部工具、教学项目和需要自由组合扩展的应用；FastAPI 更适合以 JSON API、类型标注和自动文档为核心的后端服务。

> 💡 补充：原 Django/Flask 归档仍保留在文末「完整资料」中；新项目应按当前官方文档版本选择写法，旧笔记中的 Django 1.x/2.x URL API、xadmin、Flask-Script、Flask-Uploads 等内容仅作历史参考。

## 六、工具生态与工程化

### 6.1 虚拟环境与包管理

`venv`、`virtualenv`、`virtualenvwrapper`、`conda` 均可创建隔离环境。UV 由 Rust 编写，统一 Python 版本、虚拟环境与依赖管理。

```bash
uv init myproject
cd myproject
uv python pin 3.13
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
requires-python = ">=3.12"
dependencies = ["requests>=2.31.0", "pydantic>=2.0"]

[project.optional-dependencies]
dev = ["pytest>=7.4", "black>=23.0", "mypy>=1.5"]
```

> 💡 补充：旧项目迁移时保留 `pyproject.toml` 或 `requirements.txt`，删除旧 lock 文件后执行 `uv lock`。

### 6.2 Pydantic

Pydantic V2 基于 Rust 核心，是 FastAPI 底层依赖。

```python
from pydantic import BaseModel, Field, EmailStr
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8)
user = UserCreate(username='lucky', email='a@b.com', password='Hello1234')
print(user.model_dump())
```

能力：`Field` 约束、自定义验证器、序列化、JSON Schema、ORM 集成。

### 6.3 pytest

```bash
pytest -v -s
pytest test_user.py::TestUser::test_login
```

### 6.4 FastAPI

```python
from fastapi import FastAPI, Depends
app = FastAPI()
async def common_params(q: str = "", skip: int = 0, limit: int = 10):
    return {"q": q, "skip": skip, "limit": limit}
@app.get("/items/")
async def list_items(params: dict = Depends(common_params)):
    return params
```

### 6.5 Redis、Makefile 与代码质量

```python
import redis
r = redis.Redis(host='localhost', port=6379, decode_responses=True)
r.set('key', 'value', ex=3600)
print(r.get('key'))
```

Makefile 常用于任务编排：`test`、`lint`、`format`、`clean`；代码质量工具推荐 Ruff（lint + format）、mypy/pyright（类型检查）、isort、black。性能分析与交互调试：先测量后优化，用 `cProfile` + `pstats` 定位热点（勿把外部 IO 与核心代码混测）；`breakpoint()`/`pdb` 做交互调试。

> 💡 补充：Ruff 可替代 black、isort、flake8 组合，统一代码格式与 lint。

### 6.6 logging 日志

5 个日志等级；四大组件 Logger/Handler/Filter/Formatter；`FileHandler`/`StreamHandler`/`RotatingFileHandler` 按目的地输出与滚动；Django 通过 `settings.LOGGING` 配置。

## 七、数据分析与科学计算

归档 [python数据分析](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-python-notes/python%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90) 包含 NumPy、Pandas、Matplotlib/Seaborn 及股票实战项目。

### 7.1 NumPy

```python
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr.shape, arr.dtype)
print(arr + 10)
print(arr @ arr.T)
```

### 7.2 Pandas

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

两大核心结构：`Series` 一维带索引数组，`DataFrame` 二维表格、可由多个 Series 构造（经典面试基础题）。层次化索引 `MultiIndex`：`unstack` 宽表化、`stack` 长表化，`groupby` 聚合结果常为 MultiIndex。

### 7.3 数据清洗、转换与实战

覆盖去重、缺失值处理、数据分箱（Binning）、分组聚合（GroupBy/Aggregation）、apply 预处理、时间序列采样与重采样、数据合并（merge/concat）；股票项目覆盖数据获取、趋势、移动平均、收益率、波动率与风险分析。

透视表：`pd.pivot_table(df, index=, values=, columns=, aggfunc=, fill_value=)` 交叉汇总，是 GroupBy 之外的另一核心聚合形态。

> 💡 补充：Pandas 处理超大规模数据可能遇到性能瓶颈，可考虑 Polars、DuckDB。

## 八、2026 年 Python 生态

| 维度 | 主流选择 |
|---|---|
| 版本 | 3.13+（3.13 引入实验性自由线程），新项目建议 3.13+ |
| Web | FastAPI、Django 6.1（stable）、Flask 3.1.x |
| 数据科学 | Polars、Pandas、NumPy |
| 异步 IO | `asyncio` + `uvloop` / AnyIO |
| 包管理 | UV（推荐）、Poetry、pdm |
| 类型检查 | mypy、pyright、Ruff |
| 数据验证 | Pydantic V2 |
| 测试 | pytest、hypothesis |
| LLM / Agent | LangChain、LlamaIndex、Pydantic AI、MCP |
| 部署 | Docker、Gunicorn、uWSGI、PyInstaller、Nuitka |

## 九、常见坑与补充

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
b = copy.deepcopy(a)
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

**6. `eval` 的安全风险**

`eval`/`exec` 执行动态字符串前需严格校验来源，避免代码注入。详见 [python里的eval是什么](../archive/old-python-notes/Python的语言程序设计/python里的eval是什么.md)。

**7. 类变量遮蔽与共享**

实例赋值会“遮蔽”类变量（`a.aa = 100` 仅新建实例属性）；可变类变量被所有实例共享，是经典坑。`__dict__`/`dir()` 可自省对象属性。

**8. 双下划线不是真私有**

Python 无真正 private，双下划线属性仅触发名称改写（`__attr` -> `_ClassName__attr`），类外仍可访问。

**9. 继承内置 dict/list 的坑**

内置类型由 C 实现，子类重载 `__setitem__` 等魔法函数可能不被内部路径调用；此类需求应继承 `UserDict`。`defaultdict` 靠 `__missing__` 提供默认值。

**10. `+` 与 `+=` 的区别**

`a + b` 返回新对象且要求同类型；`+=` 走 `__iadd__`/`extend` 原地修改、接受任意可迭代对象（`append` 不遍历元素、`extend` 遍历展开）。

**11. float 精度陷阱与 Decimal**

`float` 遵循 IEEE 754，存在表示误差（`0.1 + 0.2` 类问题）；金额等精确计算用 `decimal.Decimal`，以字符串构造、`quantize` 控制舍入。

**12. pickle 反序列化不设防**

pickle 只应在彼此信任的程序间使用，其格式不设防；不可信数据传输应改用 JSON；`copyreg` 可让 pickle 兼容类定义演变。

> 💡 补充：更多源码级细节、面试题与最佳实践请参阅 [Python源码剖析](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-python-notes/Python%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90) 和 [Effective Python](../archive/old-python-notes/Python书籍阅读/Effective%20Python：编写高质量Python代码的90个有效方法.md)。

---


## 📚 完整资料

> **原文归档**：[archive/old-python-notes/](/md/archive/README?id=old-python-notes) + [archive/old-django-notes/](/md/archive/README?id=old-django-notes) + [archive/old-flask-notes/](/md/archive/README?id=old-flask-notes)
> 包含：90+ 文件（Python 高级/高效/源码 + Django + Flask + 数据分析 + 工具生态）

- [archive/old-python-notes/](/md/archive/README?id=old-python-notes) — Python 完整笔记归档
- [Django 框架教程](./12-Django框架教程.md) — 从 old-django-notes 拆出的 Django 独立主线。
- [Flask 框架教程](./14-Flask框架教程.md) — 从 old-flask-notes 拆出的 Flask 独立主线。
- [archive/old-django-notes/](/md/archive/README?id=old-django-notes) — Django 系统教程与 DRF 原始笔记
- [archive/old-flask-notes/](/md/archive/README?id=old-flask-notes) — Flask 轻量教程与部署原始笔记

---

## 最新修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-27 | 重构 | 将 Django 与 Flask Web 框架内容拆分为独立主线教程，本文改为保留 Python 语言、源码、工程化与数据生态总览，并更新 Web 生态版本口径 |

> 📚 完整历史修改记录见 [修改记录归档](/_meta/CHANGELOG_HISTORY.md)。
