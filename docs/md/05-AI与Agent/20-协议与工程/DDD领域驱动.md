# DDD 领域驱动设计

> 预计阅读：约 43 分钟（正文约 13686 字）
> 阅读建议：建议分两次阅读：先看概览、结论和关键表格，再按需翻文末原文归档。

## 一、核心主题概述

领域驱动设计（Domain-Driven Design，DDD）是一套应对复杂业务系统的软件设计思想。它的核心目标是把业务逻辑从传统的“三层架构”中抽离出来，集中到独立的**领域层**，让代码结构、业务语言和团队沟通保持一致。

传统三层架构的问题在于：Controller 接收请求后，几乎所有逻辑都堆在 Service 层，`UserService`、`OrderService` 很快变成几千行的“大杂烩”；类只是数据库表的映射，缺乏行为，领域知识被稀释在 SQL 和 if/else 中。DDD 通过**四层架构**、**统一语言**和**限界上下文**，把复杂业务拆成高内聚、低耦合的模块。

### 1.1 传统三层架构的困境

| 问题 | 具体表现 |
|------|----------|
| Service 层成为“大杂烩” | 所有业务逻辑都塞进 Service 层，`UserService.py`、`OrderService.py` 膨胀到几千行，各种业务操作混杂 |
| 职责不清晰 | 用户相关功能分散在 `UserService`、`OrderService`、`AgentService` 中，代码重复、逻辑混乱，难以精准定位和移动功能模块 |
| 团队协作困难 | 多人开发时对同一模块的理解不一致，A 开发的代码 B 来维护时难以理解 |
| 缺乏领域建模 | 直接把数据库表结构映射为类，类只是数据容器，缺少行为和业务规则，“动作”全由 Service 代劳 |

> 💡 补充：DDD 不是“必须四层”的教条。它的本质是“用业务模型驱动代码组织”，分层只是最常见的落地形式。

## 二、DDD 核心概念

| 概念 | 英文 | 定义 | 示例 |
|------|------|------|------|
| **领域** | Domain | 业务所在的问题空间 | 电商、物流、Agent 任务调度 |
| **统一语言** | Ubiquitous Language | 业务与开发共同使用的术语 | “任务”、“计费”、“聚合根” |
| **限界上下文** | Bounded Context | 独立模型和语言的边界 | 订单上下文、库存上下文 |
| **实体** | Entity | 有唯一标识、有状态和行为的对象 | `Task`、`User` |
| **值对象** | Value Object | 无唯一标识，由属性值决定相等性 | `Money`、`Address` |
| **领域服务** | Domain Service | 不适合放在单一实体中的业务逻辑 | `BillingService` |
| **聚合根** | Aggregate Root | 保证一致性的实体集合入口 | `Order` 包含 `OrderItem` |
| **仓储** | Repository | 领域对象的持久化接口 | `ITaskRepository` |
| **领域事件** | Domain Event | 领域内发生的、需要通知别处的变化 | `TaskStarted` |
| **用例** | Use Case | 用户与系统交互的完整过程 | “启动一个新任务” |

> 💡 补充：实体和值对象的区别是关键设计决策。如果一个对象需要“生命周期内被追踪”，选实体；如果只看“值是否相等”，选值对象。

## 三、分层架构

### 3.1 四层架构图

```
┌─────────────────────────────────────┐
│   用户接口层 (Interface Layer)      │
│   Controller、WebSocket、CLI        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   应用层 (Application Layer)        │
│   用例编排、事务协调、无业务规则     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ ★ 领域层 (Domain Layer) - 核心！   │
│   实体、值对象、领域服务、仓储接口   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   基础设施层 (Infrastructure Layer) │
│   数据库、ORM、外部 API、缓存        │
└─────────────────────────────────────┘
```

依赖方向：上层依赖下层，领域层不依赖任何框架。

### 3.2 餐厅比喻

- **顾客点餐** → 用户接口层（发起请求）
- **服务员传单** → 应用层（协调流程）
- **大厨做菜** → 领域层（核心业务规则）
- **厨房设备** → 基础设施层（数据库、外部服务）

### 3.3 各层职责

| 层级 | 职责 | 应该做 | 不应该做 |
|------|------|--------|----------|
| 用户接口层 | 接收/响应用户请求 | 参数校验、序列化 | 写业务逻辑 |
| 应用层 | 编排用例流程 | 调用仓储、触发领域行为 | 做业务规则判断 |
| 领域层 | 表达业务知识和规则 | 实体行为、值对象、领域服务 | 依赖框架或数据库 |
| 基础设施层 | 技术实现 | ORM、HTTP 客户端、消息队列 | 侵入领域模型 |

### 3.4 DDD 与三层架构对比

| 对比项 | 三层架构 | DDD 四层架构 |
|--------|----------|-------------|
| **业务逻辑位置** | Service 层 | 领域层（实体、值对象、领域服务） |
| **职责划分** | 模糊，Service 成为大杂烩 | 清晰，各层职责明确 |
| **领域建模** | 缺失，类只是数据容器 | 核心，实体包含行为和规则 |
| **测试性** | 依赖数据库等基础设施 | 领域层可独立测试 |
| **扩展性** | 困难，修改影响面大 | 容易，改动隔离在对应层 |
| **团队协作** | 容易冲突 | 各层独立开发 |
| **适用场景** | 简单 CRUD 应用 | 复杂业务系统 |

### 3.5 从三层到 DDD 的迁移

```
三层架构                    DDD 四层架构
Controller  ────────────>  Interface Layer (几乎不变)
                          +
Service     ────────────>  Application Layer (编排协调)
  (所有逻辑)               +
                           Domain Layer (核心业务逻辑)

Repository  ────────────>  Infrastructure Layer (仓储实现)
```

迁移的关键动作：把原 Service 中的业务规则下沉到领域层的实体与领域服务，Service 只保留流程编排。

## 四、落地实践

### 4.1 用户接口层示例

```python
from fastapi import APIRouter
from application.task_service import TaskService

router = APIRouter()

@router.post("/tasks")
async def create_task(user_id: int, goal: str):
    # 只负责接收请求，转发给应用层
    return await TaskService.start_new_task(user_id, goal)
```

### 4.2 应用层示例

```python
class TaskService:
    """应用层服务 - 负责协调"""

    @staticmethod
    async def start_new_task(user_id: int, goal: str):
        user_repo = UserRepository()
        user = await user_repo.get_by_id(user_id)

        task = Task.create(user=user, goal=goal)
        task.start()

        task_repo = TaskRepository()
        await task_repo.save(task)

        return task
```

### 4.3 领域层示例

#### 实体

```python
class Task:
    def __init__(self, task_id: int, user: User, goal: str):
        self.task_id = task_id
        self.user = user
        self.goal = goal
        self.status = TaskStatus.CREATED
        self.created_at = datetime.now()

    @classmethod
    def create(cls, user: User, goal: str):
        if not user.can_create_task():
            raise PermissionError("用户无权创建任务")
        return cls(task_id=generate_id(), user=user, goal=goal)

    def start(self):
        if self.status != TaskStatus.CREATED:
            raise ValueError("只有已创建的任务才能启动")
        self.status = TaskStatus.RUNNING
        self.started_at = datetime.now()
```

#### 值对象

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: float
    currency: str = "CNY"

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("货币类型不同，无法相加")
        return Money(self.amount + other.amount, self.currency)
```

#### 领域服务

```python
class BillingService:
    @staticmethod
    def calculate_task_cost(task: Task, duration: timedelta) -> Money:
        base_cost = 10.0
        if task.priority == Priority.HIGH:
            base_cost *= 1.5

        hours = duration.total_seconds() / 3600
        total = base_cost * hours

        if task.user.is_vip:
            total *= 0.8

        return Money(total, "CNY")
```

#### 仓储接口

```python
from abc import ABC, abstractmethod

class ITaskRepository(ABC):
    @abstractmethod
    async def get_by_id(self, task_id: int) -> Task:
        pass

    @abstractmethod
    async def save(self, task: Task) -> None:
        pass
```

### 4.4 基础设施层示例

```python
class SQLAlchemyTaskRepository(ITaskRepository):
    def __init__(self, session: Session):
        self.session = session

    async def get_by_id(self, task_id: int) -> Task:
        task_orm = self.session.query(TaskORM).filter_by(id=task_id).first()
        return self._to_domain(task_orm)

    async def save(self, task: Task) -> None:
        task_orm = self._to_orm(task)
        self.session.add(task_orm)
        self.session.commit()
```

### 4.5 项目结构示例

```
project/
├── interface/
│   └── api/task_controller.py
├── application/
│   ├── services/task_service.py
│   └── dtos/task_dto.py
├── domain/                  # 核心层
│   ├── entities/task.py
│   ├── value_objects/money.py
│   ├── services/billing_service.py
│   ├── repositories/task_repository.py
│   └── events/task_started.py
└── infrastructure/
    ├── repositories/sqlalchemy_task_repo.py
    ├── clients/deepseek_client.py
    └── database.py
```

## 五、2026 年现状

到 2026 年，DDD 已经从“Java/.NET 企业级实践”扩展到更广泛的生态：

1. **AI Agent 系统中的 DDD**：Agent 的“意图识别→任务分解→工具调用→记忆管理”天然适合用领域模型描述。领域事件、聚合根和限界上下文被用来隔离不同 Agent 能力上下文（如规划、执行、反思）。

2. **事件驱动与 CQRS 常态化**：领域事件 + 事件溯源（Event Sourcing）+ CQRS 成为复杂系统的常见组合，Kafka、RabbitMQ、NATS 等消息中间件承担事件总线角色。

3. **类型安全语言推动 DDD 落地**：Rust、Go、TypeScript 等语言的项目越来越愿意用 DDD 组织业务核心，配合依赖注入框架实现干净的领域层。

4. **轻量 DDD 成为主流**：除非是金融、电商、供应链等复杂业务，大多数项目采用“战术 DDD 子集”（实体、值对象、仓储、应用服务），而非完整事件溯源或战略图谱。

5. **大模型辅助建模**：LLM 开始被用来从需求文档中提取领域概念、生成统一语言词汇表，但核心建模决策仍需要领域专家和架构师把关。

> 💡 补充：2026 年的趋势不是“用不用 DDD”，而是“用多重的 DDD”。简单 CRUD 用轻量分层，复杂业务才上聚合根、事件溯源和限界上下文。

## 六、常见坑与补充

| 坑 | 表现 | 解决方式 |
|----|------|----------|
| 贫血模型 | 实体只有字段，所有逻辑在 Service | 把业务规则和状态变更方法放回实体 |
| 过度设计 | 简单 CRUD 硬上四层、事件溯源 | 从简单开始，按需演进 |
| 违反分层 | 领域层直接 import SQLAlchemy | 通过接口隔离，依赖注入 |
| 统一语言停留在文档 | 代码命名和口头用语不一致 | 让业务专家参与命名评审 |
| 仓储接口膨胀 | Repository 里写复杂查询和统计 | 复杂查询可用专门 Query Service 或 CQRS |

> 💡 补充：好的 DDD 架构是演化出来的。先让业务逻辑回归领域层，再逐步引入仓储、事件和限界上下文，比一开始就画完整领域图更有效。

> 💡 补充：DDD 不是银弹。如果团队不熟悉、业务简单、交付周期短，强行引入四层架构反而增加沟通成本。

### 6.1 什么时候用 DDD

**适合的场景**：

- 业务逻辑复杂，规则多变
- 需要长期维护和演进的系统
- 团队规模较大，需要清晰分工
- 领域知识丰富，需要深度建模

**不适合的场景**：

- 简单的 CRUD 应用
- 原型或短期项目
- 团队对 DDD 不熟悉且时间紧张

### 6.2 实施 DDD 的关键步骤

1. **统一语言（Ubiquitous Language）**：与业务专家共同定义术语，代码中使用业务语言命名。
2. **识别限界上下文（Bounded Context）**：将大系统拆分为多个子域，每个上下文有独立的领域模型。
3. **领域建模**：识别实体、值对象，定义聚合根和边界，设计领域服务。
4. **分层实现**：按四层架构组织代码，保持领域层的纯粹性，依赖方向为上层依赖下层。

---

# 以下为原内容存档
> 以下内容为原始归档文件的完整保留，文字原貌不变。

## 领域驱动设计DDD架构初识与落地.md

# 领域驱动设计(DDD)架构初识与落地

> **核心思想**：将复杂的业务逻辑从传统的"三层架构"中解放出来，通过"四层架构"实现清晰的职责分离，让代码更易维护和扩展。

---

## 1. 传统三层架构的困境

### 1.1 三层架构组成

传统的三层架构是大多数Web开发者最早接触的架构模式：

```
用户请求 → Controller层 → Service层 → Repository/DAO层 → Database
```

| 层级 | 职责 | 说明 |
|------|------|------|
| **Controller层** | 服务控制 | 负责接收客户端的HTTP请求 |
| **Service层** | 业务逻辑 | 负责各种计算和业务处理逻辑 |
| **Repository/DAO层** | 数据访问 | 负责与数据库交互，获取数据 |

### 1.2 三层架构的问题

看起来简单清晰，但随着应用规模增长，问题逐渐暴露：

#### 问题1：Service层成为"大杂烩"
- 所有业务逻辑都塞进Service层
- `UserService.py`、`OrderService.py` 等文件会变得臃肿，几千行代码
- 各种业务操作混杂在一起，难以维护

#### 问题2：职责不清晰
- 用户相关功能分散在 `UserService`、`OrderService`、`AgentService` 中
- 代码重复，逻辑混乱
- 难以精准定位和移动功能模块

#### 问题3：团队协作困难
- 多人开发时，不同开发者对同一模块的理解不一致
- A开发的代码，B来维护时难以理解
- 所有"厨师"（开发者）都在"厨房"（Service层）里挤着

#### 问题4：缺乏领域建模
- 直接将数据库表结构映射为类（如User类）
- 类只是数据容器，缺少行为和业务规则
- 所有"动作"都由Service代劳，违背面向对象原则

---

## 2. DDD四层架构：餐厅比喻

### 2.1 核心理念

**领域驱动设计（DDD, Domain Driven Design）** 是一套管理复杂业务系统的设计思想，让开发过程避免陷入混乱，让系统有机组织。

> 💡 **餐厅比喻**：把软件系统想象成一家餐厅
> - 顾客点餐（用户请求）
> - 服务员传递订单（应用层协调）
> - 大厨制作菜品（领域层核心业务）
> - 厨房设施支撑（基础设施层）

### 2.2 四层架构详解

```
┌─────────────────────────────────────┐
│   用户接口层 (Interface Layer)      │
│   FastAPI Controller, WebSocket     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   应用层 (Application Layer)        │
│   协调和编排，不包含业务逻辑         │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│ ★ 领域层 (Domain Layer) - 核心！   │
│   实体、值对象、领域服务、仓储接口   │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   基础设施层 (Infrastructure Layer) │
│   数据库、外部服务、缓存等           │
└─────────────────────────────────────┘
```

---

## 3. 四层架构详细说明

### 3.1 用户接口层 (Interface Layer)

**职责**：处理用户界面交互

**代表**：
- FastAPI 的 Controller
- WebSocket 连接
- Web界面、移动端App界面

**作用**：用户通过这一层进行操作，如下单、获取商品、刷新页面

**示例**：
```python
from fastapi import APIRouter
from application.task_service import TaskService

router = APIRouter()

@router.post("/tasks")
async def create_task(user_id: int, goal: str):
    # 接口层只负责接收请求，转发给应用层
    return await TaskService.start_new_task(user_id, goal)
```

---

### 3.2 应用层 (Application Layer)

**职责**：协调和编排，充当"服务员"角色

**核心特点**：
- ✅ 处理完整的"用例"（Use Case）
- ✅ 调度协调其他层来完成业务操作
- ❌ **不包含业务逻辑**，只负责指挥

**代码示例**：

```python
# application/task_service.py

class TaskService:
    """应用层服务 - 负责协调"""
    
    @staticmethod
    async def start_new_task(user_id: int, goal: str):
        """启动新任务的用例"""
        
        # 1. 从仓储获取User对象
        user_repo = UserRepository()
        user = await user_repo.get_by_id(user_id)
        
        # 2. 创建Task领域对象
        task = Task.create(user=user, goal=goal)
        
        # 3. 调用Task的领域方法（业务逻辑在领域层）
        task.start()
        
        # 4. 持久化
        task_repo = TaskRepository()
        await task_repo.save(task)
        
        return task
```

**关键点**：
- 只有流程编排，没有业务规则判断
- 知道调用哪些步骤，但不知道如何执行具体业务

---

### 3.3 领域层 (Domain Layer) ⭐ 核心

**职责**：包含所有核心业务逻辑、状态和规则

这是系统中**最有价值、最需要保护**的部分！

#### 3.3.1 实体 (Entities)

有唯一标识的业务对象

```python
# domain/entities/task.py

class Task:
    """任务实体"""
    
    def __init__(self, task_id: int, user: User, goal: str):
        self.task_id = task_id  # 唯一标识
        self.user = user
        self.goal = goal
        self.status = TaskStatus.CREATED
        self.created_at = datetime.now()
    
    @classmethod
    def create(cls, user: User, goal: str):
        """工厂方法：创建任务"""
        # 业务规则：检查用户权限
        if not user.can_create_task():
            raise PermissionError("用户无权创建任务")
        
        return cls(
            task_id=generate_id(),
            user=user,
            goal=goal
        )
    
    def start(self):
        """启动任务 - 业务逻辑"""
        if self.status != TaskStatus.CREATED:
            raise ValueError("只有已创建的任务才能启动")
        
        self.status = TaskStatus.RUNNING
        self.started_at = datetime.now()
    
    def complete(self):
        """完成任务"""
        if self.status != TaskStatus.RUNNING:
            raise ValueError("只有运行中的任务才能完成")
        
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now()
```

#### 3.3.2 值对象 (Value Objects)

没有唯一标识，由属性值决定相等性

```python
# domain/value_objects/money.py

from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    """金额值对象 - 不可变"""
    amount: float
    currency: str = "CNY"
    
    def add(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("货币类型不同，无法相加")
        return Money(self.amount + other.amount, self.currency)
    
    def __eq__(self, other):
        return self.amount == other.amount and self.currency == other.currency
```

#### 3.3.3 领域服务 (Domain Services)

业务逻辑不适合放在单一实体中时使用

```python
# domain/services/billing_service.py

class BillingService:
    """计费领域服务"""
    
    @staticmethod
    def calculate_task_cost(task: Task, duration: timedelta) -> Money:
        """计算任务费用 - 复杂业务规则"""
        base_cost = 10.0
        
        # 根据任务类型调整费用
        if task.priority == Priority.HIGH:
            base_cost *= 1.5
        
        # 根据时长计算
        hours = duration.total_seconds() / 3600
        total = base_cost * hours
        
        # VIP用户折扣
        if task.user.is_vip:
            total *= 0.8
        
        return Money(total, "CNY")
```

#### 3.3.4 仓储接口 (Repository Interfaces)

定义如何存储领域对象的**接口**（不是实现）

```python
# domain/repositories/task_repository.py

from abc import ABC, abstractmethod

class ITaskRepository(ABC):
    """任务仓储接口 - 只有定义，没有实现"""
    
    @abstractmethod
    async def get_by_id(self, task_id: int) -> Task:
        """根据ID获取任务"""
        pass
    
    @abstractmethod
    async def save(self, task: Task) -> None:
        """保存任务"""
        pass
    
    @abstractmethod
    async def find_by_user(self, user_id: int) -> List[Task]:
        """查询用户的所有任务"""
        pass
```

**关键特性**：
- ✅ 纯Python代码，不依赖任何框架
- ✅ 可以在任何地方运行和测试
- ✅ 业务逻辑集中，易于理解和维护

---

### 3.4 基础设施层 (Infrastructure Layer)

**职责**：为其他层提供技术支撑

#### 3.4.1 仓储实现 (Repository Implementations)

```python
# infrastructure/repositories/sqlalchemy_task_repository.py

from sqlalchemy.orm import Session
from domain.repositories.task_repository import ITaskRepository

class SQLAlchemyTaskRepository(ITaskRepository):
    """任务仓储的SQLAlchemy实现"""
    
    def __init__(self, session: Session):
        self.session = session
    
    async def get_by_id(self, task_id: int) -> Task:
        """从数据库获取任务"""
        task_orm = self.session.query(TaskORM).filter_by(id=task_id).first()
        if not task_orm:
            raise NotFoundError(f"Task {task_id} not found")
        
        # ORM对象转换为领域对象
        return self._to_domain(task_orm)
    
    async def save(self, task: Task) -> None:
        """保存任务到数据库"""
        task_orm = self._to_orm(task)
        self.session.add(task_orm)
        self.session.commit()
    
    def _to_domain(self, task_orm: TaskORM) -> Task:
        """ORM对象转领域对象"""
        return Task(
            task_id=task_orm.id,
            user=self._get_user(task_orm.user_id),
            goal=task_orm.goal
        )
    
    def _to_orm(self, task: Task) -> TaskORM:
        """领域对象转ORM对象"""
        return TaskORM(
            id=task.task_id,
            user_id=task.user.user_id,
            goal=task.goal,
            status=task.status.value
        )
```

#### 3.4.2 外部服务客户端

```python
# infrastructure/clients/deepseek_client.py

class DeepSeekClient:
    """DeepSeek API客户端"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.deepseek.com"
    
    async def generate_response(self, prompt: str) -> str:
        """调用AI API生成响应"""
        response = await self._post("/v1/chat/completions", {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}]
        })
        return response["choices"][0]["message"]["content"]
```

#### 3.4.3 数据库配置

```python
# infrastructure/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('postgresql://user:pass@localhost/dbname')
SessionLocal = sessionmaker(bind=engine)
```

---

## 4. DDD关键概念总结

| 概念 | 英文 | 定义 | 作用 |
|------|------|------|------|
| **领域驱动设计** | Domain Driven Design | 一套管理复杂业务的设计思想 | 帮助组织代码结构，分离关注点 |
| **领域** | Domain | 业务所在的问题空间 | 指导系统架构和代码组织 |
| **实体** | Entity | 有唯一标识的对象 | 代表具有身份的业务概念（如User、Task） |
| **值对象** | Value Object | 无唯一标识的对象 | 表达业务的特性和度量（如Money、Address） |
| **领域服务** | Domain Service | 跨多个实体的业务逻辑 | 处理不适合在单一实体中的逻辑 |
| **仓储** | Repository | 数据持久化接口 | 隔离业务逻辑与数据存储实现 |
| **用例** | Use Case | 应用场景 | 描述用户与系统交互的完整过程 |
| **聚合根** | Aggregate Root | 实体的集合 | 保证业务规则的一致性边界 |

---

## 5. DDD vs 三层架构对比

| 对比项 | 三层架构 | DDD四层架构 |
|--------|----------|-------------|
| **业务逻辑位置** | Service层 | 领域层（实体、值对象、领域服务） |
| **职责划分** | 模糊，Service成为大杂烩 | 清晰，各层职责明确 |
| **领域建模** | 缺失，类只是数据容器 | 核心，实体包含行为和规则 |
| **测试性** | 依赖数据库等基础设施 | 领域层可独立测试 |
| **扩展性** | 困难，修改影响面大 | 容易，改动隔离在对应层 |
| **团队协作** | 容易冲突 | 各层独立开发 |
| **适用场景** | 简单CRUD应用 | 复杂业务系统 |

---

## 6. DDD实践要点

### 6.1 什么时候使用DDD？

✅ **适合使用DDD的场景**：
- 业务逻辑复杂，规则多变
- 需要长期维护和演进的系统
- 团队规模较大，需要清晰分工
- 领域知识丰富，需要深度建模

❌ **不适合DDD的场景**：
- 简单的CRUD应用
- 原型或短期项目
- 团队对DDD不熟悉且时间紧张

### 6.2 实施DDD的关键步骤

1. **统一语言（Ubiquitous Language）**
   - 与业务专家共同定义术语
   - 代码中使用业务语言命名

2. **识别限界上下文（Bounded Context）**
   - 将大系统拆分为多个子域
   - 每个上下文有独立的领域模型

3. **领域建模**
   - 识别实体、值对象
   - 定义聚合根和边界
   - 设计领域服务

4. **分层实现**
   - 按四层架构组织代码
   - 保持领域层的纯粹性
   - 依赖方向：上层依赖下层

### 6.3 常见陷阱

⚠️ **贫血模型（Anemic Model）**
- 实体只有数据，没有行为
- 所有逻辑都在Service中
- **解决**：将业务逻辑移到实体中

⚠️ **过度设计**
- 简单问题复杂化
- 过早引入抽象
- **解决**：从简单开始，逐步重构

⚠️ **违反分层原则**
- 领域层依赖基础设施层
- 跨层调用
- **解决**：使用依赖注入，接口隔离

---

## 7. 项目结构示例

```
project/
├── interface/                 # 用户接口层
│   ├── api/
│   │   ├── task_controller.py
│   │   └── user_controller.py
│   └── websocket/
│       └── agent_ws.py
│
├── application/               # 应用层
│   ├── services/
│   │   ├── task_service.py    # 任务用例
│   │   └── user_service.py    # 用户用例
│   └── dtos/
│       └── task_dto.py        # 数据传输对象
│
├── domain/                    # 领域层 ⭐
│   ├── entities/
│   │   ├── task.py            # 任务实体
│   │   └── user.py            # 用户实体
│   ├── value_objects/
│   │   └── money.py           # 金额值对象
│   ├── services/
│   │   └── billing_service.py # 计费领域服务
│   ├── repositories/          # 仓储接口
│   │   └── task_repository.py
│   └── events/
│       └── task_started.py    # 领域事件
│
└── infrastructure/            # 基础设施层
    ├── repositories/          # 仓储实现
    │   └── sqlalchemy_task_repo.py
    ├── database.py            # 数据库配置
    ├── clients/
    │   └── deepseek_client.py # 外部服务客户端
    └── cache/
        └── redis_cache.py     # 缓存服务
```

---

## 8. 总结

### 8.1 核心思想

DDD的核心是**将业务逻辑放在领域层**，通过充血模型（实体包含行为）和清晰的分层架构，实现：

- ✅ **高内聚**：相关逻辑聚集在一起
- ✅ **低耦合**：层之间通过接口交互
- ✅ **易测试**：领域层独立可测
- ✅ **易维护**：职责清晰，改动影响小
- ✅ **易扩展**：新功能符合开闭原则

### 8.2 关键要点

1. **领域层是核心**：所有业务规则都在这里
2. **应用层是指挥**：协调流程，不包含业务逻辑
3. **基础设施层是支撑**：技术实现细节
4. **接口层是门面**：用户交互入口

### 8.3 从三层到DDD的迁移

```
三层架构                    DDD四层架构
Controller  ────────────>  Interface Layer (几乎不变)
                          +
Service     ────────────>  Application Layer (编排协调)
  (所有逻辑)               +
                           Domain Layer (核心业务逻辑)
                          
Repository  ────────────>  Infrastructure Layer (仓储实现)
```

---

## 参考资料

- 《领域驱动设计》- Eric Evans
- 《实现领域驱动设计》- Vaughn Vernon
- [DDD架构最佳实践](https://learn.microsoft.com/zh-cn/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)

---

> 💡 **最后的建议**：DDD是一种思想，不是银弹。根据项目复杂度和团队情况灵活应用，从简单开始，逐步演进。记住：**好的架构是演化出来的，不是一开始就设计出来的**。

---


## 📚 完整资料

> **原文归档**：[archive/old-agent-notes/agent系统知识/领域驱动设计DDD架构初识与落地.md](../../archive/old-agent-notes/agent系统知识/领域驱动设计DDD架构初识与落地.md)

- [领域驱动设计DDD架构初识与落地.md](../../archive/old-agent-notes/agent系统知识/领域驱动设计DDD架构初识与落地.md)
- 《领域驱动设计》- Eric Evans
- 《实现领域驱动设计》- Vaughn Vernon
- [DDD 架构最佳实践（Microsoft）](https://learn.microsoft.com/zh-cn/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-22 | 审查 | 全面审查，核心内容完备（四层架构/限界上下文/聚合根/CQRS 等概念不过时，2026 现状表述准确，无需订正） |
| 2026-08-23 | 新增 | 归档原文「领域驱动设计DDD架构初识与落地.md」完整内联；总结补齐：1.1 三层架构困境、3.4 DDD 与三层对比、3.5 三层到 DDD 迁移、6.1 适用场景、6.2 实施关键步骤、用例概念及参考书目 |
| 2026-08-26 | 重构 | 统一前置阅读时间/建议，原文归档移至文末 |
