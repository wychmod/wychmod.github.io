# Pydantic 数据验证库详解

## 1. Pydantic 简介

### 1.1 什么是 Pydantic？

Pydantic 是一个基于 Python 类型注解的数据验证和设置管理库。它在运行时强制执行类型提示，并在数据无效时提供友好的错误提示。

### 1.2 核心特点

| 特点 | 说明 |
|------|------|
| **类型安全** | 基于 Python 类型注解，提供编译时和运行时类型检查 |
| **数据验证** | 自动验证数据类型、格式、约束条件 |
| **高性能** | 底层使用 Rust 编写（Pydantic V2），性能极高 |
| **易用性** | API 简洁直观，学习成本低 |
| **JSON Schema** | 自动生成 JSON Schema，便于 API 文档生成 |
| **IDE 支持** | 完美支持 IDE 类型提示和自动补全 |
| **数据转换** | 自动进行数据类型转换和解析 |

### 1.3 主要应用场景

```mermaid
graph LR
    A[Pydantic] --> B[FastAPI 框架]
    A --> C[配置管理]
    A --> D[数据验证]
    A --> E[API 开发]
    A --> F[数据序列化]
    A --> G[ORM 模型]
```

- **Web 开发**：FastAPI、Django Ninja 等框架的核心组件
- **配置管理**：验证和管理应用配置
- **数据管道**：ETL 过程中的数据验证
- **API 开发**：请求/响应数据验证
- **CLI 工具**：命令行参数验证
- **微服务**：服务间数据交互验证

### 1.4 版本说明

- **Pydantic V1**：纯 Python 实现，广泛使用
- **Pydantic V2**：底层使用 Rust（pydantic-core），性能提升 5-50 倍

本文档主要介绍 **Pydantic V2**（当前主流版本）。

## 2. 安装与快速开始

### 2.1 安装

```bash
# 使用 pip 安装
pip install pydantic

# 使用 uv 安装（推荐）
uv pip install pydantic

# 安装邮箱验证支持
pip install pydantic[email]

# 安装完整功能
pip install pydantic[all]
```

### 2.2 快速开始

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    age: int | None = None

# 创建实例
user = User(id=1, name="张三", email="zhangsan@example.com")

print(user)
# User(id=1, name='张三', email='zhangsan@example.com', age=None)

print(user.model_dump())
# {'id': 1, 'name': '张三', 'email': 'zhangsan@example.com', 'age': None}

print(user.model_dump_json())
# '{"id":1,"name":"张三","email":"zhangsan@example.com","age":null}'
```

### 2.3 自动类型转换

```python
from pydantic import BaseModel

class Product(BaseModel):
    name: str
    price: float
    quantity: int

# 自动类型转换
product = Product(name="商品", price="99.99", quantity="10")
print(product)
# Product(name='商品', price=99.99, quantity=10)

print(type(product.price))   # <class 'float'>
print(type(product.quantity)) # <class 'int'>
```

## 3. 模型定义

### 3.1 基础模型

```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Article(BaseModel):
    """文章模型"""
    title: str                    # 必填字段
    content: str                  # 必填字段
    author: str                   # 必填字段
    tags: List[str] = []          # 默认值为空列表
    published: bool = False       # 默认值为 False
    views: int = 0                # 默认值为 0
    created_at: datetime = None   # 可选字段
    updated_at: Optional[datetime] = None  # 可选字段

# 使用示例
article = Article(
    title="Pydantic 入门",
    content="这是一篇关于 Pydantic 的文章",
    author="张三",
    tags=["Python", "Pydantic"]
)
```

### 3.2 嵌套模型

```python
from pydantic import BaseModel
from typing import List

class Address(BaseModel):
    """地址模型"""
    province: str
    city: str
    street: str
    zipcode: str

class Company(BaseModel):
    """公司模型"""
    name: str
    address: Address

class Employee(BaseModel):
    """员工模型"""
    name: str
    age: int
    company: Company
    addresses: List[Address]  # 地址列表

# 使用示例
employee = Employee(
    name="李四",
    age=30,
    company={
        "name": "科技公司",
        "address": {
            "province": "广东省",
            "city": "深圳市",
            "street": "科技园",
            "zipcode": "518000"
        }
    },
    addresses=[
        {
            "province": "广东省",
            "city": "深圳市",
            "street": "南山区",
            "zipcode": "518000"
        }
    ]
)

print(employee.company.address.city)  # 深圳市
```

### 3.3 模型继承

```python
from pydantic import BaseModel
from datetime import datetime

class BaseEntity(BaseModel):
    """基础实体"""
    id: int
    created_at: datetime
    updated_at: datetime

class User(BaseEntity):
    """用户模型"""
    username: str
    email: str
    is_active: bool = True

class Post(BaseEntity):
    """文章模型"""
    title: str
    content: str
    author_id: int

# 使用示例
user = User(
    id=1,
    username="zhangsan",
    email="zhangsan@example.com",
    created_at=datetime.now(),
    updated_at=datetime.now()
)
```

## 4. 字段类型与验证

### 4.1 基础类型

```python
from pydantic import BaseModel
from typing import List, Dict, Set, Tuple, Optional
from datetime import datetime, date, time
from decimal import Decimal
from uuid import UUID

class DataTypes(BaseModel):
    # 基础类型
    string_field: str
    integer_field: int
    float_field: float
    boolean_field: bool
    
    # 日期时间类型
    datetime_field: datetime
    date_field: date
    time_field: time
    
    # 高精度数值
    decimal_field: Decimal
    
    # UUID
    uuid_field: UUID
    
    # 集合类型
    list_field: List[str]
    dict_field: Dict[str, int]
    set_field: Set[int]
    tuple_field: Tuple[str, int, float]
    
    # 可选类型
    optional_field: Optional[str] = None
    nullable_field: str | None = None
```

### 4.2 Field 字段配置

```python
from pydantic import BaseModel, Field
from typing import List

class User(BaseModel):
    # 字段约束
    username: str = Field(
        min_length=3,
        max_length=20,
        pattern=r'^[a-zA-Z0-9_]+$',
        description="用户名，3-20个字符，只能包含字母、数字、下划线"
    )
    
    age: int = Field(
        gt=0,           # 大于 0
        lt=150,         # 小于 150
        description="年龄"
    )
    
    email: str = Field(
        pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$',
        description="邮箱地址"
    )
    
    score: float = Field(
        ge=0.0,         # 大于等于 0
        le=100.0,       # 小于等于 100
        description="分数"
    )
    
    tags: List[str] = Field(
        default=[],
        max_length=5,
        description="标签列表，最多5个"
    )
    
    # 字段别名
    user_id: int = Field(alias="id")
    
    # 示例值
    bio: str = Field(
        default="",
        examples=["这是一段个人简介"]
    )

# 使用示例
user = User(
    username="zhangsan123",
    age=25,
    email="zhangsan@example.com",
    score=95.5,
    id=1001  # 使用别名
)

print(user.user_id)  # 1001
```

### 4.3 常用约束

| 约束 | 适用类型 | 说明 |
|------|---------|------|
| `gt` | 数值 | 大于（Greater Than） |
| `ge` | 数值 | 大于等于（Greater or Equal） |
| `lt` | 数值 | 小于（Less Than） |
| `le` | 数值 | 小于等于（Less or Equal） |
| `multiple_of` | 数值 | 必须是某个数的倍数 |
| `min_length` | 字符串/列表 | 最小长度 |
| `max_length` | 字符串/列表 | 最大长度 |
| `pattern` | 字符串 | 正则表达式匹配 |
| `strict` | 所有类型 | 严格模式，不进行类型转换 |

### 4.4 内置验证器

```python
from pydantic import BaseModel, EmailStr, HttpUrl, IPvAnyAddress, FilePath
from datetime import datetime

class Contact(BaseModel):
    # 邮箱验证（需要安装 pydantic[email]）
    email: EmailStr
    
    # URL 验证
    website: HttpUrl
    
    # IP 地址验证
    ip_address: IPvAnyAddress
    
    # 文件路径验证
    # config_file: FilePath  # 验证文件必须存在

# 使用示例
contact = Contact(
    email="example@domain.com",
    website="https://www.example.com",
    ip_address="192.168.1.1"
)
```

## 5. 自定义验证器

### 5.1 字段验证器（Field Validator）

```python
from pydantic import BaseModel, field_validator, ValidationError

class Password(BaseModel):
    password: str
    confirm_password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        """密码必须包含大小写字母和数字"""
        if len(value) < 8:
            raise ValueError('密码长度不能小于8位')
        if not any(c.isupper() for c in value):
            raise ValueError('密码必须包含大写字母')
        if not any(c.islower() for c in value):
            raise ValueError('密码必须包含小写字母')
        if not any(c.isdigit() for c in value):
            raise ValueError('密码必须包含数字')
        return value

# 验证失败示例
try:
    pwd = Password(password="weak", confirm_password="weak")
except ValidationError as e:
    print(e)
```

### 5.2 模型验证器（Model Validator）

```python
from pydantic import BaseModel, model_validator

class UserRegistration(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: str
    
    @model_validator(mode='after')
    def check_passwords_match(self):
        """验证两次密码输入是否一致"""
        if self.password != self.confirm_password:
            raise ValueError('两次密码输入不一致')
        return self

# 使用示例
try:
    user = UserRegistration(
        username="zhangsan",
        password="Password123",
        confirm_password="Password456",
        email="zhangsan@example.com"
    )
except ValidationError as e:
    print(e)
```

### 5.3 根验证器（Root Validator）

```python
from pydantic import BaseModel, model_validator
from typing import Any, Dict

class DateRange(BaseModel):
    start_date: str
    end_date: str
    
    @model_validator(mode='before')
    @classmethod
    def validate_date_range(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        """验证日期范围"""
        start = values.get('start_date')
        end = values.get('end_date')
        
        if start and end and start > end:
            raise ValueError('开始日期不能晚于结束日期')
        
        return values

# 使用示例
date_range = DateRange(
    start_date="2024-01-01",
    end_date="2024-12-31"
)
```

## 6. 模型配置

### 6.1 ConfigDict 配置

```python
from pydantic import BaseModel, ConfigDict, Field

class User(BaseModel):
    model_config = ConfigDict(
        # 允许额外字段
        extra='allow',  # 'allow' | 'ignore' | 'forbid'
        
        # 字段别名生成器
        alias_generator=lambda field_name: field_name.upper(),
        
        # 严格模式
        strict=False,
        
        # 验证赋值
        validate_assignment=True,
        
        # 填充默认值
        use_enum_values=True,
        
        # JSON schema 额外配置
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "name": "张三",
                    "email": "zhangsan@example.com"
                }
            ]
        }
    )
    
    id: int
    name: str
    email: str

# 使用示例
user = User(id=1, name="张三", email="zhangsan@example.com", age=25)
print(user.model_dump())  # 包含 age 字段（extra='allow'）
```

### 6.2 常用配置项

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `extra` | `'ignore'` | 处理额外字段：`'allow'`、`'ignore'`、`'forbid'` |
| `strict` | `False` | 严格模式，不进行类型转换 |
| `validate_assignment` | `False` | 赋值时验证 |
| `validate_default` | `False` | 验证默认值 |
| `frozen` | `False` | 模型不可变 |
| `populate_by_name` | `False` | 允许使用字段名和别名 |
| `str_strip_whitespace` | `False` | 自动去除字符串首尾空格 |
| `str_to_lower` | `False` | 字符串自动转小写 |
| `str_to_upper` | `False` | 字符串自动转大写 |

### 6.3 不可变模型

```python
from pydantic import BaseModel, ConfigDict

class ImmutableUser(BaseModel):
    model_config = ConfigDict(frozen=True)
    
    id: int
    name: str

user = ImmutableUser(id=1, name="张三")

# 尝试修改会报错
try:
    user.name = "李四"
except Exception as e:
    print(f"错误: {e}")  # 错误: "ImmutableUser" is frozen and does not support item assignment
```

## 7. 数据序列化与反序列化

### 7.1 模型导出

```python
from pydantic import BaseModel
from typing import List

class User(BaseModel):
    id: int
    name: str
    email: str
    tags: List[str] = []

user = User(id=1, name="张三", email="zhangsan@example.com", tags=["VIP"])

# 导出为字典
print(user.model_dump())
# {'id': 1, 'name': '张三', 'email': 'zhangsan@example.com', 'tags': ['VIP']}

# 导出为 JSON 字符串
print(user.model_dump_json())
# '{"id":1,"name":"张三","email":"zhangsan@example.com","tags":["VIP"]}'

# 排除某些字段
print(user.model_dump(exclude={'email'}))
# {'id': 1, 'name': '张三', 'tags': ['VIP']}

# 只包含某些字段
print(user.model_dump(include={'id', 'name'}))
# {'id': 1, 'name': '张三'}

# 排除未设置的字段
print(user.model_dump(exclude_unset=True))
# {'id': 1, 'name': '张三', 'email': 'zhangsan@example.com', 'tags': ['VIP']}
```

### 7.2 从字典/JSON 创建模型

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str

# 从字典创建
user_dict = {"id": 1, "name": "张三", "email": "zhangsan@example.com"}
user = User(**user_dict)

# 从 JSON 创建
json_str = '{"id": 1, "name": "张三", "email": "zhangsan@example.com"}'
user = User.model_validate_json(json_str)

# 从对象创建
class UserDTO:
    def __init__(self):
        self.id = 1
        self.name = "张三"
        self.email = "zhangsan@example.com"

dto = UserDTO()
user = User.model_validate(dto)
```

### 7.3 自定义序列化

```python
from pydantic import BaseModel, field_serializer
from datetime import datetime

class Event(BaseModel):
    name: str
    timestamp: datetime
    
    @field_serializer('timestamp')
    def serialize_timestamp(self, value: datetime, _info):
        """自定义时间戳序列化"""
        return value.strftime('%Y-%m-%d %H:%M:%S')

event = Event(name="会议", timestamp=datetime.now())
print(event.model_dump())
# {'name': '会议', 'timestamp': '2024-01-01 12:00:00'}
```

## 8. JSON Schema 生成

### 8.1 生成 JSON Schema

```python
from pydantic import BaseModel, Field
import json

class Product(BaseModel):
    """商品模型"""
    id: int = Field(description="商品ID")
    name: str = Field(description="商品名称")
    price: float = Field(gt=0, description="商品价格")
    description: str = Field(default="", description="商品描述")

# 生成 JSON Schema
schema = Product.model_json_schema()
print(json.dumps(schema, indent=2, ensure_ascii=False))
```

输出：

```json
{
  "description": "商品模型",
  "properties": {
    "id": {
      "description": "商品ID",
      "title": "Id",
      "type": "integer"
    },
    "name": {
      "description": "商品名称",
      "title": "Name",
      "type": "string"
    },
    "price": {
      "description": "商品价格",
      "exclusiveMinimum": 0,
      "title": "Price",
      "type": "number"
    },
    "description": {
      "default": "",
      "description": "商品描述",
      "title": "Description",
      "type": "string"
    }
  },
  "required": ["id", "name", "price"],
  "title": "Product",
  "type": "object"
}
```

## 9. 高级特性

### 9.1 泛型模型

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar('T')

class Page(BaseModel, Generic[T]):
    """分页模型"""
    items: List[T]
    total: int
    page: int
    size: int

class User(BaseModel):
    id: int
    name: str

# 使用泛型
user_page = Page[User](
    items=[
        User(id=1, name="张三"),
        User(id=2, name="李四")
    ],
    total=2,
    page=1,
    size=10
)

print(user_page.items[0].name)  # 张三
```

### 9.2 联合类型（Union）

```python
from pydantic import BaseModel, Field
from typing import Union

class Cat(BaseModel):
    type: str = "cat"
    meow: str

class Dog(BaseModel):
    type: str = "dog"
    bark: str

class Zoo(BaseModel):
    animal: Union[Cat, Dog] = Field(discriminator='type')

# 自动识别类型
zoo1 = Zoo(animal={"type": "cat", "meow": "喵喵"})
zoo2 = Zoo(animal={"type": "dog", "bark": "汪汪"})

print(type(zoo1.animal))  # <class '__main__.Cat'>
print(type(zoo2.animal))  # <class '__main__.Dog'>
```

### 9.3 计算字段

```python
from pydantic import BaseModel, computed_field

class Rectangle(BaseModel):
    width: float
    height: float
    
    @computed_field
    @property
    def area(self) -> float:
        """计算面积"""
        return self.width * self.height
    
    @computed_field
    @property
    def perimeter(self) -> float:
        """计算周长"""
        return 2 * (self.width + self.height)

rect = Rectangle(width=10, height=5)
print(rect.area)       # 50.0
print(rect.perimeter)  # 30.0

# 计算字段会包含在序列化中
print(rect.model_dump())
# {'width': 10.0, 'height': 5.0, 'area': 50.0, 'perimeter': 30.0}
```

### 9.4 私有属性

```python
from pydantic import BaseModel, PrivateAttr

class User(BaseModel):
    name: str
    _password: str = PrivateAttr()
    
    def set_password(self, password: str):
        """设置密码"""
        self._password = password
    
    def check_password(self, password: str) -> bool:
        """验证密码"""
        return self._password == password

user = User(name="张三")
user.set_password("secret123")
print(user.check_password("secret123"))  # True

# 私有属性不会被序列化
print(user.model_dump())  # {'name': '张三'}
```

## 10. 性能优化

### 10.1 性能对比

Pydantic V2 vs V1 性能提升：

```python
from pydantic import BaseModel
import time

class User(BaseModel):
    id: int
    name: str
    email: str
    age: int

# 性能测试
def benchmark(iterations: int = 100000):
    start = time.time()
    for i in range(iterations):
        user = User(
            id=i,
            name=f"user_{i}",
            email=f"user_{i}@example.com",
            age=25
        )
    end = time.time()
    print(f"创建 {iterations} 个对象耗时: {end - start:.2f} 秒")

benchmark()
```

### 10.2 性能建议

| 建议 | 说明 |
|------|------|
| **使用 Pydantic V2** | 性能比 V1 快 5-50 倍 |
| **避免过度验证** | 只在必要时使用自定义验证器 |
| **使用 TypedDict** | 对于简单场景，考虑使用 TypedDict |
| **批量验证** | 使用 `model_validate()` 批量验证数据 |
| **缓存 Schema** | 重用生成的 JSON Schema |

## 11. 实际应用场景

### 11.1 FastAPI 集成

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List

app = FastAPI()

class UserCreate(BaseModel):
    """用户创建模型"""
    username: str = Field(min_length=3, max_length=20)
    email: str
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    username: str
    email: str

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """创建用户"""
    # 自动验证请求数据
    # 返回数据自动序列化
    return {
        "id": 1,
        "username": user.username,
        "email": user.email
    }

@app.get("/users/", response_model=List[UserResponse])
async def list_users():
    """获取用户列表"""
    return [
        {"id": 1, "username": "user1", "email": "user1@example.com"},
        {"id": 2, "username": "user2", "email": "user2@example.com"}
    ]
```

### 11.2 配置管理

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置"""
    app_name: str = "My App"
    debug: bool = False
    database_url: str
    redis_url: str
    secret_key: str
    
    # JWT 配置
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # 日志配置
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"  # 从 .env 文件加载
        env_file_encoding = 'utf-8'

# 使用配置
settings = Settings()
print(settings.database_url)
```

`.env` 文件：

```env
DATABASE_URL=postgresql://user:pass@localhost/db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
DEBUG=true
```

### 11.3 数据验证与清洗

```python
from pydantic import BaseModel, field_validator, ValidationError
from typing import List
import re

class ContactList(BaseModel):
    """联系人列表"""
    contacts: List[str]
    
    @field_validator('contacts')
    @classmethod
    def validate_emails(cls, emails: List[str]) -> List[str]:
        """验证并清洗邮箱列表"""
        email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        valid_emails = []
        
        for email in emails:
            email = email.strip().lower()
            if re.match(email_pattern, email):
                valid_emails.append(email)
        
        if not valid_emails:
            raise ValueError('至少需要一个有效的邮箱地址')
        
        return valid_emails

# 使用示例
try:
    contacts = ContactList(contacts=[
        "  USER@EXAMPLE.COM  ",
        "invalid-email",
        "user2@example.com"
    ])
    print(contacts.contacts)
    # ['user@example.com', 'user2@example.com']
except ValidationError as e:
    print(e)
```

### 11.4 ORM 模型转换

```python
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# SQLAlchemy 模型
class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50))
    email = Column(String(100))

# Pydantic 模型
class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    email: str

# 转换
engine = create_engine("sqlite:///./test.db")
Session = sessionmaker(bind=engine)
session = Session()

# 从 ORM 对象创建 Pydantic 模型
db_user = session.query(UserDB).first()
if db_user:
    user = User.model_validate(db_user)
    print(user.model_dump())
```

## 12. 错误处理

### 12.1 捕获验证错误

```python
from pydantic import BaseModel, ValidationError, Field

class User(BaseModel):
    id: int = Field(gt=0)
    name: str = Field(min_length=2)
    email: str

try:
    user = User(id=-1, name="A", email="invalid")
except ValidationError as e:
    print("验证失败:")
    for error in e.errors():
        print(f"  字段: {error['loc'][0]}")
        print(f"  错误: {error['msg']}")
        print(f"  类型: {error['type']}")
        print()
```

输出：

```
验证失败:
  字段: id
  错误: Input should be greater than 0
  类型: greater_than

  字段: name
  错误: String should have at least 2 characters
  类型: string_too_short
```

### 12.2 自定义错误消息

```python
from pydantic import BaseModel, Field, field_validator

class User(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    age: int = Field(gt=0, lt=150)
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not value.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return value

try:
    user = User(username="user@123", age=200)
except ValidationError as e:
    print(e.json(indent=2))
```

## 13. Pydantic vs 其他验证库

### 13.1 对比表

| 特性 | Pydantic | Marshmallow | Cerberus | Voluptuous |
|------|----------|-------------|----------|------------|
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **类型提示** | ✅ 完整支持 | ❌ 不支持 | ❌ 不支持 | ❌ 不支持 |
| **IDE 支持** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| **学习曲线** | 低 | 中 | 低 | 中 |
| **数据转换** | ✅ 自动 | ✅ 手动 | ❌ 不支持 | ✅ 手动 |
| **JSON Schema** | ✅ 自动生成 | ✅ 需配置 | ❌ 不支持 | ❌ 不支持 |
| **嵌套验证** | ✅ 原生支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| **社区活跃度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

### 13.2 选择建议

```mermaid
graph TD
    A[选择验证库] --> B{是否需要类型提示?}
    B -->|是| C[Pydantic]
    B -->|否| D{是否需要高性能?}
    D -->|是| C
    D -->|否| E{是否使用 FastAPI?}
    E -->|是| C
    E -->|否| F[Marshmallow/Cerberus]
```

**推荐使用 Pydantic 的场景**：
- 新项目开发
- FastAPI/Django Ninja 等现代框架
- 需要类型提示和 IDE 支持
- 性能要求高的场景
- 需要生成 API 文档

**考虑其他库的场景**：
- 已有 Flask/Django 项目使用 Marshmallow
- 简单的数据验证需求
- 不需要类型提示

## 14. 最佳实践

### 14.1 模型设计原则

```python
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ✅ 好的实践
class UserCreate(BaseModel):
    """用户创建时的输入模型"""
    username: str = Field(min_length=3, max_length=20)
    email: str
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    """用户响应模型（不包含密码）"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    email: str
    created_at: datetime

class UserUpdate(BaseModel):
    """用户更新模型（所有字段可选）"""
    username: Optional[str] = Field(None, min_length=3, max_length=20)
    email: Optional[str] = None

# ❌ 避免的实践：所有操作使用同一个模型
class User(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    password: str
    created_at: Optional[datetime] = None
```

### 14.2 验证器组织

```python
from pydantic import BaseModel, field_validator, model_validator

class User(BaseModel):
    username: str
    email: str
    password: str
    confirm_password: str
    
    # ✅ 字段级验证器：验证单个字段
    @field_validator('username')
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not value.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return value
    
    # ✅ 模型级验证器：验证多个字段的关系
    @model_validator(mode='after')
    def validate_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError('两次密码输入不一致')
        return self
```

### 14.3 配置复用

```python
from pydantic import BaseModel, ConfigDict

# 定义通用配置
common_config = ConfigDict(
    str_strip_whitespace=True,
    validate_assignment=True,
    extra='forbid'
)

class User(BaseModel):
    model_config = common_config
    
    username: str
    email: str

class Product(BaseModel):
    model_config = common_config
    
    name: str
    price: float
```

### 14.4 错误处理

```python
from pydantic import BaseModel, ValidationError
from typing import Dict, Any

class User(BaseModel):
    username: str
    email: str
    age: int

def create_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """创建用户，统一错误处理"""
    try:
        user = User(**data)
        return {"success": True, "data": user.model_dump()}
    except ValidationError as e:
        return {
            "success": False,
            "errors": [
                {
                    "field": ".".join(str(loc) for loc in error["loc"]),
                    "message": error["msg"]
                }
                for error in e.errors()
            ]
        }

# 使用示例
result = create_user({
    "username": "user123",
    "email": "invalid-email",
    "age": "not-a-number"
})
print(result)
```

## 15. 常见问题与解决方案

### 15.1 日期时间处理

```python
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class Event(BaseModel):
    name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        # 自动转换 ISO 8601 格式字符串
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# 支持多种格式
event1 = Event(name="会议", timestamp="2024-01-01T10:00:00")
event2 = Event(name="会议", timestamp=1704096000)  # Unix 时间戳
event3 = Event(name="会议")  # 使用默认值
```

### 15.2 循环引用

```python
from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    name: str
    posts: List['Post'] = []

class Post(BaseModel):
    title: str
    author: Optional[User] = None

# 更新前向引用
User.model_rebuild()
Post.model_rebuild()

# 使用示例
user = User(
    name="张三",
    posts=[
        {"title": "文章1"},
        {"title": "文章2"}
    ]
)
```

### 15.3 动态模型创建

```python
from pydantic import create_model, Field

# 动态创建模型
DynamicUser = create_model(
    'DynamicUser',
    id=(int, Field(gt=0)),
    name=(str, Field(min_length=2)),
    email=(str, ...),  # 必填字段
    age=(int, 18)      # 默认值为 18
)

user = DynamicUser(id=1, name="张三", email="zhangsan@example.com")
print(user)
```

## 16. 总结

### 16.1 核心优势

✅ **类型安全**：基于 Python 类型注解，提供完整的类型检查  
✅ **高性能**：Pydantic V2 使用 Rust 核心，性能极高  
✅ **易用性**：API 简洁直观，学习成本低  
✅ **丰富的验证**：内置大量验证器，支持自定义  
✅ **生态系统**：FastAPI 等主流框架的核心组件  
✅ **IDE 支持**：完美支持类型提示和自动补全  
✅ **文档生成**：自动生成 JSON Schema 和 API 文档  

### 16.2 适用场景

- **Web API 开发**：FastAPI、Django Ninja
- **配置管理**：应用配置验证和加载
- **数据管道**：ETL、数据清洗和验证
- **CLI 工具**：命令行参数验证
- **微服务**：服务间数据交互验证
- **数据建模**：复杂业务数据建模

### 16.3 学习资源

- **官方文档**：https://docs.pydantic.dev/
- **GitHub 仓库**：https://github.com/pydantic/pydantic
- **性能基准**：https://docs.pydantic.dev/latest/concepts/performance/
- **迁移指南**：https://docs.pydantic.dev/latest/migration/

### 16.4 快速参考

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

class User(BaseModel):
    # 配置
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True
    )
    
    # 字段定义
    id: int = Field(gt=0)
    name: str = Field(min_length=2, max_length=50)
    email: str
    
    # 字段验证器
    @field_validator('name')
    @classmethod
    def validate_name(cls, value: str) -> str:
        return value.strip()
    
    # 模型方法
    def greet(self) -> str:
        return f"Hello, {self.name}!"

# 创建实例
user = User(id=1, name="张三", email="zhangsan@example.com")

# 序列化
user.model_dump()          # 转字典
user.model_dump_json()     # 转 JSON

# 反序列化
User.model_validate(data)       # 从对象
User.model_validate_json(json)  # 从 JSON

# JSON Schema
User.model_json_schema()   # 生成 Schema
```

## 17. 实战示例：构建完整的用户管理系统

```python
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

# 枚举类型
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

# 基础模型
class BaseUser(BaseModel):
    """用户基础模型"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True
    )

# 用户创建模型
class UserCreate(BaseUser):
    """用户注册时的输入"""
    username: str = Field(min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    role: UserRole = UserRole.USER
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not any(c.isupper() for c in value):
            raise ValueError('密码必须包含大写字母')
        if not any(c.islower() for c in value):
            raise ValueError('密码必须包含小写字母')
        if not any(c.isdigit() for c in value):
            raise ValueError('密码必须包含数字')
        return value
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('两次密码输入不一致')
        return v

# 用户响应模型
class UserResponse(BaseUser):
    """API 返回的用户信息（不包含密码）"""
    id: int
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

# 用户更新模型
class UserUpdate(BaseUser):
    """用户更新信息"""
    username: Optional[str] = Field(None, min_length=3, max_length=20)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

# 分页模型
class Pagination(BaseModel):
    """分页信息"""
    page: int = Field(ge=1, default=1)
    size: int = Field(ge=1, le=100, default=20)
    total: int
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size

# 用户列表响应
class UserListResponse(BaseModel):
    """用户列表响应"""
    users: List[UserResponse]
    pagination: Pagination

# 使用示例
if __name__ == "__main__":
    # 创建用户
    user_data = {
        "username": "zhangsan",
        "email": "zhangsan@example.com",
        "password": "Password123",
        "confirm_password": "Password123",
        "role": "user"
    }
    
    user_create = UserCreate(**user_data)
    print("用户创建成功:", user_create.model_dump(exclude={'password', 'confirm_password'}))
    
    # 模拟数据库返回
    user_response = UserResponse(
        id=1,
        username=user_create.username,
        email=user_create.email,
        role=user_create.role,
        is_active=True,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    print("用户信息:", user_response.model_dump_json(indent=2))
```

Pydantic 是现代 Python 开发中不可或缺的数据验证库，掌握它将大大提高开发效率和代码质量！
