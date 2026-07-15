# DDD 领域驱动设计

> **原文归档**：[archive/old-agent-notes/agent系统知识/领域驱动设计DDD架构初识与落地.md](../../archive/old-agent-notes/agent系统知识/领域驱动设计DDD架构初识与落地.md)

## 一、核心主题概述

领域驱动设计（Domain-Driven Design，DDD）是一套应对复杂业务系统的软件设计思想。它的核心目标是把业务逻辑从传统的“三层架构”中抽离出来，集中到独立的**领域层**，让代码结构、业务语言和团队沟通保持一致。

传统三层架构的问题在于：Controller 接收请求后，几乎所有逻辑都堆在 Service 层，`UserService`、`OrderService` 很快变成几千行的“大杂烩”；类只是数据库表的映射，缺乏行为，领域知识被稀释在 SQL 和 if/else 中。DDD 通过**四层架构**、**统一语言**和**限界上下文**，把复杂业务拆成高内聚、低耦合的模块。

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

---

## 📚 完整资料
- [领域驱动设计DDD架构初识与落地.md](../../archive/old-agent-notes/agent系统知识/领域驱动设计DDD架构初识与落地.md)
