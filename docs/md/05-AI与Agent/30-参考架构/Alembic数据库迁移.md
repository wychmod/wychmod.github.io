# Alembic 数据库迁移

> **原文归档**：[archive/old-agent-notes/agent系统知识/Alembic数据库迁移完整教程.md](../../archive/old-agent-notes/agent系统知识/Alembic数据库迁移完整教程.md)

## 一、核心主题概述

Alembic 是 SQLAlchemy 官方出品的数据库迁移工具，用版本化、可回滚的方式管理数据库 schema 变更。它把“改表结构”变成可追溯、可协作、可自动化的代码脚本，解决开发/测试/生产环境之间手动同步数据库结构的问题。

核心价值：版本管理、团队协作、环境同步、安全回滚、CI/CD 自动化。

## 二、Alembic 基础

### 2.1 安装

```bash
pip install alembic sqlalchemy
pip install psycopg2-binary   # PostgreSQL
pip install pymysql           # MySQL
```

### 2.2 初始化

```bash
alembic init alembic
```

生成目录：

```
alembic/
├── versions/        # 迁移脚本
├── env.py           # 环境配置
├── script.py.mako   # 脚本模板
└── README
alembic.ini          # 主配置
```

### 2.3 配置 `alembic.ini`

```ini
sqlalchemy.url = postgresql://user:pass@localhost:5432/dbname
# sqlalchemy.url = mysql+pymysql://user:pass@localhost:3306/dbname
# sqlalchemy.url = sqlite:///./test.db
```

### 2.4 配置 `env.py`

```python
from sqlalchemy import engine_from_config, pool
from alembic import context
from your_app.models import Base

config = context.config
target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 2.5 核心概念

- **Migration**：迁移脚本文件
- **Revision**：迁移唯一版本 ID
- **Upgrade / Downgrade**：应用 / 回滚迁移
- **Head**：最新版本；**Base**：初始状态

## 三、迁移命令实战

### 3.1 创建迁移

```bash
alembic revision -m "create users table"                    # 空白迁移
alembic revision --autogenerate -m "add email to users"     # 自动检测模型变化
alembic revision -m "add index" --head=ae1027a6acf          # 指定父版本
```

### 3.2 应用迁移

```bash
alembic upgrade head          # 升级到最新
alembic upgrade 1a2b3c4d5e6f  # 升级到指定版本
alembic upgrade +2            # 相对升级 2 个版本
alembic upgrade head --sql    # 只生成 SQL，不执行
```

### 3.3 回滚迁移

```bash
alembic downgrade -1          # 回退 1 个版本
alembic downgrade base        # 回退到初始状态
alembic downgrade 1a2b3c4d5e6f
```

### 3.4 查看状态

```bash
alembic current               # 当前数据库版本
alembic history               # 完整迁移历史
alembic history -r base:head
alembic heads                 # 查看所有 head
alembic show 1a2b3c4d5e6f     # 迁移详情
```

### 3.5 标记与合并

```bash
alembic stamp head            # 不执行 SQL，仅标记版本
alembic merge heads -m "merge all heads"  # 合并分支
```

## 四、与 SQLAlchemy 集成

### 4.1 典型模型

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    author = relationship("User", back_populates="posts")
```

### 4.2 自动生成的迁移脚本结构

```python
"""add phone column to users

Revision ID: 1a2b3c4d5e6f
Revises:
Create Date: 2025-02-15 10:30:45.123456
"""
from alembic import op
import sqlalchemy as sa

revision = '1a2b3c4d5e6f'
down_revision = None

def upgrade():
    op.add_column('users', sa.Column('phone', sa.String(length=20), nullable=True))

def downgrade():
    op.drop_column('users', 'phone')
```

### 4.3 数据迁移 + 原生 SQL

```python
from sqlalchemy.sql import table, column

def upgrade():
    op.add_column('users', sa.Column('full_name', sa.String(100)))
    users = table('users', column('username', sa.String), column('full_name', sa.String))
    op.execute(users.update().values(full_name=users.c.username))
    op.alter_column('users', 'full_name', nullable=False)

def downgrade():
    op.drop_column('users', 'full_name')
```

```python
# 执行原生 SQL，例如创建触发器
def upgrade():
    op.execute("CREATE TRIGGER update_user_modtime BEFORE UPDATE ON users ...")

def downgrade():
    op.execute("DROP TRIGGER IF EXISTS update_user_modtime ON users")
```

## 五、2026 年现状

截至 2026 年，Alembic 仍是 Python 生态中与 SQLAlchemy 配合最主流的关系型数据库迁移方案，已完全适配 SQLAlchemy 2.0。

推荐实践：

- 新项目和 SQLAlchemy 2.0 一起使用，模型写法升级为新风格
- `--autogenerate` 生成迁移后务必人工 review
- 数据库 URL 等敏感配置通过环境变量注入 `env.py`，不要写死在 `alembic.ini`
- 异步项目可用 `async` 模板初始化，或在 `env.py` 中配置 `async_engine_from_config`

```python
# SQLAlchemy 2.0 风格
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

主流框架集成：FastAPI 配合 `asyncpg`/`aiomysql` + SQLAlchemy 2.0；Flask 仍常用 `Flask-Migrate`（底层 Alembic）。

## 六、常见坑与补充

### 坑 1：`--autogenerate` 未检测出变化

通常是 `env.py` 没导入所有模型或 `target_metadata` 未设置。

```python
from your_app.models import Base
import your_app.models   # 触发所有模型注册
target_metadata = Base.metadata
```

### 坑 2：SQLite 不支持 DROP COLUMN / ALTER COLUMN

使用批量操作模式：

```python
def upgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('new_column', sa.String(50)))
        batch_op.drop_column('old_column')
        batch_op.alter_column('username', type_=sa.String(100))
```

### 坑 3：多 head 冲突

```bash
alembic merge heads -m "merge conflicting heads"
alembic upgrade head
```

### 坑 4：外键约束导致变更失败

先删除外键，改完再重建：

```python
def upgrade():
    op.drop_constraint('fk_posts_user_id', 'posts', type_='foreignkey')
    op.alter_column('users', 'id', type_=sa.BigInteger())
    op.alter_column('posts', 'user_id', type_=sa.BigInteger())
    op.create_foreign_key('fk_posts_user_id', 'posts', 'users', ['user_id'], ['id'])
```

### 坑 5：大表迁移锁表

生产环境尽量使用在线 DDL，例如 MySQL 的 `ALGORITHM=INPLACE, LOCK=NONE` 或 PostgreSQL 的 `NOT VALID` + `VALIDATE CONSTRAINT`。

> 💡 补充：不要把已合并部署的迁移文件当业务代码反复修改。需要修正时，应创建新的迁移脚本，而不是改旧脚本。

> 💡 补充：迁移脚本要提交到版本控制，并在 PR 里 review。部署前用 `alembic upgrade head --sql` 预览将要执行的 SQL。

> 💡 补充：如果数据库已存在但首次接入 Alembic，不要直接 `upgrade head`，否则会尝试创建已存在的表。应先用 `alembic stamp head` 标记当前版本。

---

## 📚 完整资料
- [Alembic数据库迁移完整教程.md](../../archive/old-agent-notes/agent系统知识/Alembic数据库迁移完整教程.md)
