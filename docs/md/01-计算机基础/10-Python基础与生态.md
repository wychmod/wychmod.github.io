# Python 基础与生态

> **原文归档**：[`archive/old-python-notes/`](../../archive/old-python-notes/) + [`archive/old-django-notes/`](../../archive/old-django-notes/) + [`archive/old-flask-notes/`](../../archive/old-flask-notes/)
> 包含：100+ 文件（Python 高级/高效/源码 + Django + Flask + 数据分析 + 书籍阅读）

---

## 一、Python 高级

> 📚 [Python高级 1-12](../../archive/old-python-notes/Python高级/) — 12 章系统讲解

| 章节 | 主题 |
|---|---|
| 1. 一切皆对象 | Python 对象模型 |
| 2. 魔法函数 | `__init__ / __str__ / __repr__` 等 |
| 3. 类和对象 | 封装 / 继承 / 多态 |
| 4. 自定义序列类 | list-like / dict-like |
| 5. 深入 set 和 dict | 哈希表实现 |
| 6. 对象引用、可变性和垃圾回收 | 引用计数 + 标记清除 + 分代 |
| 7. 元类编程 | `type` / `metaclass` |
| 8. 迭代器和生成器 | `iter` / `next` / `yield` |
| 9. socket 编程 | TCP/UDP |
| 10. 多线程、多进程和线程池 | `threading` / `multiprocessing` |
| 11. 协程和异步 io | `asyncio` / `await` |
| 12. asyncio 并发编程 | 实战 |

## 二、Python 高效

> 📚 [Python高效 1-5](../../archive/old-python-notes/Python高效/) — 5 个性能主题

- 字典 / 列表 / 集合 / 元组
- 字符串处理
- 对象迭代 / 反迭代
- 文件 IO 效率
- 类与对象深度问题

## 三、Python 源码剖析

> 📚 [Python源码剖析 1-35](../../archive/old-python-notes/Python源码剖析/) — 35 章完整版（500KB+）

涵盖：
- 对象模型 / 生命周期
- 内建对象（float / int / bytes / str / list / dict）
- 字节码 / GIL / 内存池
- 协程 / 装饰器 / 描述符 / 元类
- 垃圾回收 / 内存泄露

## 四、Python 工具生态

> 📚 [Python 工具笔记](../../archive/old-python-notes/) — 根目录零散工具笔记

- `anaconda`：虚拟环境
- `asyncio`：异步 I/O
- `fastapi`：现代 Web 框架
- `Makefile`：构建自动化
- `Pydantic`：数据验证
- `pytest`：测试框架
- `UV`：新一代 Python 包管理

## 五、Django 框架

> 📚 [Django 笔记 13 篇](../../archive/old-django-notes/) — 系统教程

- MRO（方法解析顺序，C3 线性化）
- 整体跑通（项目结构 + 配置）
- 视图（View / URLconf）
- 模板（DTL）
- 模型（ORM）
- 缓存 / 邮件 / 用户认证
- Admin 站点
- 日志
- 源码解析
- REST framework
- 上线部署

## 六、Flask 框架

> 📚 [Flask 笔记 8 篇](../../archive/old-flask-notes/) — 轻量级教程

- 模型 / 模板 / 表单
- 视图函数
- 重定向 / 蓝图
- 文件上传 / 邮件
- Gevent 异步
- 上线部署

## 七、Python 数据分析

> 📚 [Python 数据分析完整教程](../../archive/old-python-notes/python数据分析/) — 含 NumPy / Pandas / Matplotlib / Seaborn / 实战项目

- **NumPy**：数组运算
- **Pandas**：DataFrame / 数据清洗
- **Matplotlib**：基础绘图
- **Seaborn**：统计图
- **实战项目**：股票市场分析

含 PDF 速查表（NumPy / Pandas / Matplotlib / Seaborn）

## 八、Effective Python 读书笔记

> 📚 [Effective Python 90 个有效方法](../../archive/old-python-notes/Python书籍阅读/) — 2 篇笔记 + 1 PDF

## 九、2026 年 Python 生态

| 维度 | 主流 |
|---|---|
| 版本 | 3.11+（3.12 已发布） |
| Web | **FastAPI**（主流）/ Django / Flask |
| 数据 | Polars（取代 Pandas 部分场景） / Pandas |
| 异步 | asyncio + uvloop / AnyIO |
| 打包 | **uv**（取代 pip / poetry） |
| 类型 | mypy / pyright + Pydantic |
| 测试 | pytest + hypothesis |
| LLM | LangChain / LlamaIndex / Pydantic AI |
| 部署 | Docker / PyInstaller / Nuitka |

---

## 📚 完整资料

- [`archive/old-python-notes/`](../../archive/old-python-notes/) — Python 完整笔记归档
- [`archive/old-django-notes/`](../../archive/old-django-notes/) — Django 完整笔记
- [`archive/old-flask-notes/`](../../archive/old-flask-notes/) — Flask 完整笔记
