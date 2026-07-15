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
