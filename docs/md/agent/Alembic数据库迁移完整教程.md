# Alembic数据库迁移完整教程

## 一、Alembic 基本概念和用途介绍

### 1.1 什么是 Alembic？

Alembic 是一个轻量级的数据库迁移工具，专为 SQLAlchemy 设计。它允许开发者以版本控制的方式管理数据库模式的变更，确保数据库结构的演进过程可追溯、可回滚。

### 1.2 为什么需要 Alembic？

在实际项目开发中，数据库结构会随着业务需求不断变化：
- **版本管理**：记录每次数据库结构变更，便于追踪历史
- **团队协作**：多人开发时保持数据库结构一致性
- **环境同步**：开发、测试、生产环境的数据库结构同步
- **安全回滚**：出现问题时可以快速回退到之前的版本
- **自动化部署**：结合 CI/CD 实现数据库变更的自动化

### 1.3 核心概念

- **Migration（迁移）**：数据库结构变更的脚本文件
- **Revision（版本）**：每个迁移都有唯一的版本标识
- **Upgrade（升级）**：应用迁移，更新数据库结构
- **Downgrade（降级）**：回滚迁移，恢复到之前的状态
- **Head**：最新的迁移版本
- **Base**：初始状态，没有任何迁移

## 二、Alembic 的安装和初始化配置

### 2.1 安装 Alembic

```bash
# 使用 pip 安装
pip install alembic

# 如果使用 SQLAlchemy，建议一起安装
pip install sqlalchemy alembic

# 针对特定数据库安装驱动（以 PostgreSQL 为例）
pip install psycopg2-binary

# 针对 MySQL
pip install pymysql

# 完整安装示例
pip install alembic sqlalchemy psycopg2-binary
```

### 2.2 初始化 Alembic

在项目根目录执行初始化命令：

```bash
# 初始化 Alembic，创建迁移环境
alembic init alembic

# 或者指定自定义目录名
alembic init migrations
```

初始化后会生成以下目录结构：

```
your_project/
├── alembic/
│   ├── versions/           # 存放迁移脚本
│   ├── env.py             # 环境配置文件
│   ├── script.py.mako     # 迁移脚本模板
│   └── README
├── alembic.ini            # Alembic 配置文件
└── your_app/
    └── models.py          # SQLAlchemy 模型文件
```

### 2.3 配置 alembic.ini

编辑 `alembic.ini` 文件，配置数据库连接：

```ini
# 找到 sqlalchemy.url 配置项
# PostgreSQL 示例
sqlalchemy.url = postgresql://username:password@localhost:5432/dbname

# MySQL 示例
sqlalchemy.url = mysql+pymysql://username:password@localhost:3306/dbname

# SQLite 示例
sqlalchemy.url = sqlite:///./test.db
```

### 2.4 配置 env.py

编辑 `alembic/env.py` 文件，关联 SQLAlchemy 模型：

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# 导入你的 SQLAlchemy Base 和模型
from your_app.models import Base  # 修改为你的实际路径

# this is the Alembic Config object
config = context.config

# 设置 target_metadata
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """离线模式运行迁移"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """在线模式运行迁移"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 2.5 准备 SQLAlchemy 模型

创建 `your_app/models.py`：

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
    content = Column(String(5000))
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    author = relationship("User", back_populates="posts")
```

## 三、Alembic 常用命令详解

### 3.1 alembic init - 初始化迁移环境

```bash
# 基本用法
alembic init alembic

# 使用模板初始化
alembic init --template generic alembic
```

**参数说明**：
- `alembic`：迁移文件夹名称
- `--template`：指定模板类型（generic、async、multidb 等）

### 3.2 alembic revision - 创建迁移脚本

```bash
# 手动创建空白迁移
alembic revision -m "create users table"

# 自动检测模型变化并创建迁移（推荐）
alembic revision --autogenerate -m "add email column to users"

# 创建依赖特定版本的迁移
alembic revision -m "add index" --head=ae1027a6acf
```

**参数说明**：
- `-m, --message`：迁移描述信息（必填）
- `--autogenerate`：自动检测模型变化
- `--head`：指定父版本
- `--splice`：创建分支迁移

**生成的迁移文件示例**：

```python
"""create users table

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2025-02-15 10:30:45.123456

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """升级数据库结构"""
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )

def downgrade() -> None:
    """回滚数据库结构"""
    op.drop_table('users')
```

### 3.3 alembic upgrade - 升级数据库

```bash
# 升级到最新版本
alembic upgrade head

# 升级到指定版本
alembic upgrade 1a2b3c4d5e6f

# 相对升级（升级 2 个版本）
alembic upgrade +2

# 升级并显示 SQL 语句（不实际执行）
alembic upgrade head --sql

# 离线模式生成 SQL 脚本
alembic upgrade head --sql > upgrade.sql
```

**参数说明**：
- `head`：最新版本
- `版本号`：升级到指定版本
- `+N`：相对当前版本升级 N 个版本
- `--sql`：仅生成 SQL，不执行
- `--tag`：添加标签

### 3.4 alembic downgrade - 降级数据库

```bash
# 降级到上一个版本
alembic downgrade -1

# 降级到指定版本
alembic downgrade 1a2b3c4d5e6f

# 降级到初始状态
alembic downgrade base

# 相对降级（降级 2 个版本）
alembic downgrade -2

# 生成降级 SQL（不执行）
alembic downgrade -1 --sql
```

### 3.5 alembic current - 查看当前版本

```bash
# 显示当前数据库版本
alembic current

# 显示详细信息
alembic current -v
```

### 3.6 alembic history - 查看迁移历史

```bash
# 显示所有迁移历史
alembic history

# 显示详细信息
alembic history -v

# 显示指定范围的历史
alembic history -r 1a2b:3c4d

# 显示从 base 到 head 的历史
alembic history -r base:head
```

输出示例：
```
3c4d5e6f7g8h -> 9i0j1k2l3m4n (head), add post table
1a2b3c4d5e6f -> 3c4d5e6f7g8h, add email column
<base> -> 1a2b3c4d5e6f, create users table
```

### 3.7 alembic heads - 查看最新版本

```bash
# 显示所有 head 版本
alembic heads

# 显示详细信息
alembic heads -v
```

### 3.8 alembic show - 显示迁移详情

```bash
# 显示指定版本的详细信息
alembic show 1a2b3c4d5e6f

# 显示当前版本详情
alembic show current
```

### 3.9 alembic stamp - 标记版本（不执行迁移）

```bash
# 将数据库标记为指定版本（不运行迁移脚本）
alembic stamp head

# 标记为指定版本
alembic stamp 1a2b3c4d5e6f

# 用于修复版本不一致问题
alembic stamp --purge  # 清除所有版本记录
alembic stamp head     # 重新标记
```

### 3.10 alembic branches - 查看分支

```bash
# 显示所有分支
alembic branches

# 显示详细分支信息
alembic branches -v
```

### 3.11 alembic merge - 合并分支

```bash
# 合并两个分支
alembic merge -m "merge branches" 1a2b 3c4d

# 合并所有 heads
alembic merge heads -m "merge all heads"
```

## 四、实际使用场景示例

### 4.1 场景一：初始化项目数据库

```bash
# 1. 初始化 Alembic
alembic init alembic

# 2. 配置数据库连接（编辑 alembic.ini）

# 3. 创建初始迁移
alembic revision --autogenerate -m "initial migration"

# 4. 应用迁移
alembic upgrade head

# 5. 验证当前版本
alembic current
```

### 4.2 场景二：添加新字段

假设需要给 User 表添加 `phone` 字段：

**步骤 1**：修改模型文件

```python
# models.py
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))  # 新增字段
    created_at = Column(DateTime, default=datetime.utcnow)
```

**步骤 2**：生成迁移脚本

```bash
alembic revision --autogenerate -m "add phone column to users"
```

**步骤 3**：检查生成的迁移文件

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('phone', sa.String(length=20), nullable=True))

def downgrade() -> None:
    op.drop_column('users', 'phone')
```

**步骤 4**：应用迁移

```bash
alembic upgrade head
```

### 4.3 场景三：修改字段属性

将 `username` 字段长度从 50 改为 100：

**手动创建迁移**：

```bash
alembic revision -m "increase username length"
```

**编辑迁移文件**：

```python
def upgrade() -> None:
    op.alter_column('users', 'username',
                   existing_type=sa.String(length=50),
                   type_=sa.String(length=100),
                   existing_nullable=False)

def downgrade() -> None:
    op.alter_column('users', 'username',
                   existing_type=sa.String(length=100),
                   type_=sa.String(length=50),
                   existing_nullable=False)
```

**应用迁移**：

```bash
alembic upgrade head
```

### 4.4 场景四：创建索引

```bash
# 创建迁移
alembic revision -m "add index on email"
```

**编辑迁移文件**：

```python
def upgrade() -> None:
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade() -> None:
    op.drop_index('idx_users_email', table_name='users')
```

### 4.5 场景五：数据迁移

有时需要在结构变更时同时迁移数据：

```python
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

def upgrade() -> None:
    # 1. 添加新字段
    op.add_column('users', sa.Column('full_name', sa.String(100)))
    
    # 2. 迁移数据（将 username 复制到 full_name）
    users_table = table('users',
        column('username', sa.String),
        column('full_name', sa.String)
    )
    
    op.execute(
        users_table.update().values(full_name=users_table.c.username)
    )
    
    # 3. 设置字段为非空
    op.alter_column('users', 'full_name', nullable=False)

def downgrade() -> None:
    op.drop_column('users', 'full_name')
```

### 4.6 场景六：多数据库支持

**配置多数据库**：

```python
# env.py
from alembic import context

def run_migrations_online():
    # 主数据库
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
    )
    
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_table='alembic_version_main'  # 指定版本表名
        )
        
        with context.begin_transaction():
            context.run_migrations()
```

### 4.7 场景七：生产环境部署

```bash
# 1. 在开发环境创建并测试迁移
alembic revision --autogenerate -m "add feature X"
alembic upgrade head

# 2. 提交迁移文件到版本控制
git add alembic/versions/
git commit -m "Add database migration for feature X"
git push

# 3. 在生产环境拉取代码
git pull

# 4. 查看待执行的迁移
alembic history
alembic current

# 5. 生成 SQL 预览（可选）
alembic upgrade head --sql > migration.sql

# 6. 执行迁移
alembic upgrade head

# 7. 验证
alembic current
```

## 五、常见问题及解决方案

### 5.1 问题：autogenerate 未检测到模型变化

**原因**：
- `env.py` 中未正确导入模型
- `target_metadata` 配置错误
- 模型未继承正确的 Base

**解决方案**：

```python
# env.py
# 确保导入所有模型
from your_app.models import Base
from your_app.models import User, Post  # 显式导入所有模型

# 设置 target_metadata
target_metadata = Base.metadata

# 或者使用模块导入
import your_app.models  # 确保所有模型被加载
target_metadata = Base.metadata
```

### 5.2 问题：迁移版本冲突

**错误信息**：
```
Multiple head revisions are present
```

**解决方案**：

```bash
# 方法 1：合并分支
alembic merge heads -m "merge conflicting heads"
alembic upgrade head

# 方法 2：手动指定版本
alembic upgrade 1a2b3c4d5e6f
alembic upgrade 3c4d5e6f7g8h
```

### 5.3 问题：数据库版本表不存在

**错误信息**：
```
Table 'alembic_version' doesn't exist
```

**解决方案**：

```bash
# 方法 1：标记当前版本（如果数据库已存在）
alembic stamp head

# 方法 2：从头开始（如果是新数据库）
alembic upgrade head
```

### 5.4 问题：生产数据库与开发环境不一致

**场景**：生产数据库已手动修改，与迁移脚本不一致

**解决方案**：

```bash
# 1. 查看当前版本
alembic current

# 2. 查看历史
alembic history

# 3. 标记为正确的版本（不执行迁移）
alembic stamp 1a2b3c4d5e6f

# 4. 或者创建修正迁移
alembic revision -m "fix production inconsistency"
# 手动编辑迁移文件，使其与实际状态一致
alembic upgrade head
```

### 5.5 问题：回滚失败

**错误信息**：
```
Can't locate revision identified by 'xxxxx'
```

**解决方案**：

```bash
# 1. 查看历史确认版本号
alembic history

# 2. 使用相对版本回滚
alembic downgrade -1

# 3. 或使用 base 回到初始状态
alembic downgrade base
```

### 5.6 问题：autogenerate 检测到不想要的变化

**场景**：autogenerate 检测到索引、约束等不需要的变化

**解决方案**：

```python
# env.py
def run_migrations_online():
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,  # 比较字段类型
        compare_server_default=True,  # 比较默认值
        # 忽略特定对象
        include_object=lambda obj, name, type_, reflected, compare_to: \
            False if type_ == "index" and name.startswith('_') else True
    )
```

### 5.7 问题：SQLite 不支持某些操作

**场景**：SQLite 不支持 DROP COLUMN、ALTER COLUMN 等操作

**解决方案**：

使用批量操作模式：

```python
def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('new_column', sa.String(50)))
        batch_op.drop_column('old_column')
        batch_op.alter_column('username', type_=sa.String(100))
```

### 5.8 问题：外键约束导致迁移失败

**解决方案**：

```python
def upgrade() -> None:
    # 1. 先删除外键约束
    op.drop_constraint('fk_posts_user_id', 'posts', type_='foreignkey')
    
    # 2. 执行变更
    op.alter_column('users', 'id', type_=sa.BigInteger())
    op.alter_column('posts', 'user_id', type_=sa.BigInteger())
    
    # 3. 重新创建外键约束
    op.create_foreign_key('fk_posts_user_id', 'posts', 'users', 
                         ['user_id'], ['id'])

def downgrade() -> None:
    op.drop_constraint('fk_posts_user_id', 'posts', type_='foreignkey')
    op.alter_column('posts', 'user_id', type_=sa.Integer())
    op.alter_column('users', 'id', type_=sa.Integer())
    op.create_foreign_key('fk_posts_user_id', 'posts', 'users', 
                         ['user_id'], ['id'])
```

### 5.9 问题：如何在迁移中执行原生 SQL

**解决方案**：

```python
from alembic import op

def upgrade() -> None:
    # 执行原生 SQL
    op.execute("""
        CREATE OR REPLACE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.modified_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    op.execute("""
        CREATE TRIGGER update_user_modtime
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    """)

def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS update_user_modtime ON users")
    op.execute("DROP FUNCTION IF EXISTS update_modified_column()")
```

### 5.10 问题：如何处理大表迁移

**场景**：生产环境大表添加字段可能导致长时间锁表

**解决方案**：

```python
# PostgreSQL 示例
def upgrade() -> None:
    # 使用 NOT VALID 快速添加约束，不锁表
    op.execute("""
        ALTER TABLE large_table 
        ADD COLUMN new_column VARCHAR(100) DEFAULT 'default_value' NOT NULL
    """)
    
    # 在后台验证约束
    op.execute("""
        ALTER TABLE large_table 
        VALIDATE CONSTRAINT constraint_name
    """)

# MySQL 示例
def upgrade() -> None:
    # 使用 ALGORITHM=INPLACE 避免表重建
    op.execute("""
        ALTER TABLE large_table 
        ADD COLUMN new_column VARCHAR(100) DEFAULT 'default_value',
        ALGORITHM=INPLACE, LOCK=NONE
    """)
```

## 六、最佳实践建议

### 6.1 版本控制

- ✅ 始终将迁移文件提交到版本控制系统
- ✅ 迁移文件一旦合并到主分支，不要修改
- ✅ 使用有意义的迁移消息
- ❌ 不要删除已应用的迁移文件

### 6.2 团队协作

- ✅ 定期同步迁移文件（git pull）
- ✅ 解决冲突时使用 `alembic merge`
- ✅ 在 PR 中包含迁移文件
- ✅ Code Review 时仔细检查迁移逻辑

### 6.3 生产部署

- ✅ 在部署前测试迁移的 upgrade 和 downgrade
- ✅ 大表迁移前备份数据
- ✅ 使用 `--sql` 参数预览 SQL
- ✅ 在低峰期执行大规模迁移
- ✅ 准备回滚方案

### 6.4 性能优化

- ✅ 批量操作数据时使用原生 SQL
- ✅ 大表添加索引时使用并发创建（PostgreSQL）
- ✅ 避免在迁移中进行复杂查询
- ✅ 考虑使用在线 DDL 工具（如 pt-online-schema-change）

### 6.5 安全性

- ✅ 敏感配置使用环境变量
- ✅ 生产环境限制 Alembic 执行权限
- ✅ 迁移前验证数据完整性
- ✅ 记录迁移日志

## 七、高级技巧

### 7.1 自定义迁移脚本模板

编辑 `alembic/script.py.mako`：

```python
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
Author: ${author}
"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}

def upgrade() -> None:
    ${upgrades if upgrades else "pass"}

def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

### 7.2 环境变量配置

```python
# env.py
import os
from dotenv import load_dotenv

load_dotenv()

# 从环境变量读取数据库 URL
config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL'))
```

### 7.3 多环境配置

```ini
# alembic.ini
[alembic]
script_location = alembic

[dev]
sqlalchemy.url = postgresql://user:pass@localhost/dev_db

[staging]
sqlalchemy.url = postgresql://user:pass@staging-host/staging_db

[production]
sqlalchemy.url = postgresql://user:pass@prod-host/prod_db
```

使用时指定环境：

```bash
alembic -n production upgrade head
```

## 八、总结

Alembic 是 Python 生态中强大的数据库迁移工具，掌握它可以：

- 🎯 **规范化**数据库变更流程
- 🔄 **自动化**数据库版本管理
- 🛡️ **保障**生产环境数据安全
- 🤝 **促进**团队协作效率

建议初学者从简单场景入手，逐步掌握高级功能，并在实际项目中不断实践和总结经验。

## 九、参考资源

- [Alembic 官方文档](https://alembic.sqlalchemy.org/)
- [SQLAlchemy 官方文档](https://www.sqlalchemy.org/)
- [Alembic GitHub 仓库](https://github.com/sqlalchemy/alembic)
- [Flask-Migrate](https://flask-migrate.readthedocs.io/)（Flask 集成）
- [Django Migrations](https://docs.djangoproject.com/en/stable/topics/migrations/)（Django 对比参考）
