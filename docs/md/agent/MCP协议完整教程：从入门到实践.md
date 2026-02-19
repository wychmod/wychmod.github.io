# MCP协议完整教程：从入门到实践

## 目录

- [一、MCP 协议概述](#一mcp-协议概述)
- [二、为什么需要 MCP 协议](#二为什么需要-mcp-协议)
- [三、MCP 架构详解](#三mcp-架构详解)
- [四、MCP 请求与响应消息格式](#四mcp-请求与响应消息格式)
- [五、MCP 生命周期与工作流程](#五mcp-生命周期与工作流程)
- [六、MCP 传输机制](#六mcp-传输机制)
- [七、MCP 与 Tool Calls 的关系](#七mcp-与-tool-calls-的关系)
- [八、实际应用示例](#八实际应用示例)
- [九、MCP 开发实践](#九mcp-开发实践)
- [十、常见问题与解决方案](#十常见问题与解决方案)
- [十一、参考资源](#十一参考资源)

---

## 一、MCP 协议概述

### 1.1 什么是 MCP？

**MCP（Model Context Protocol，模型上下文协议）** 是由 Anthropic 于 2024 年 11 月 25 日发布的开放协议标准。它定义了应用程序和 AI 模型之间交换上下文信息的方式，使开发者能够以一致的方式将各种数据源、工具和功能连接到 AI 模型。

> **注意**：MCP 不是一个框架，也不是技术的突破，而是一个中间协议层。

### 1.2 MCP 的核心定位

类比现实生活中的 **USB-C** 接口：
- USB-C 可以让不同的设备使用相同的接口进行连接（键鼠、音响、打印机、显示器等）
- MCP 的目标是创建一个通用的标准，使 AI 应用程序的开发和集成变得更加简单和统一

### 1.3 MCP 协议的特点

| 特点 | 描述 |
|------|------|
| **标准化** | 提供统一的通信格式和接口规范 |
| **开放性** | 开源协议，任何开发者都可以实现 |
| **灵活性** | 支持多种传输机制和使用场景 |
| **可扩展** | 支持工具、资源、提示词等多种能力 |

---

## 二、为什么需要 MCP 协议

### 2.1 传统工具调用的痛点

在没有 MCP 之前，开发者面临以下问题：

1. **重复开发**：每个工具的调用方式都需要单独实现
2. **接口不统一**：不同服务的 API 格式各异
3. **集成成本高**：每次接入新工具都需要大量适配工作
4. **维护困难**：多个工具的管理和维护成本随数量增长

### 2.2 MCP 简化的流程

MCP 协议主要简化了以下流程：

#### ① 工具发现与描述
```
传统方式：阅读 API 文档 → 理解接口参数 → 编写调用代码
MCP 方式：通过 tools/list 获取标准化的工具描述
```

#### ② 工具调用
```
传统方式：每个工具单独实现 HTTP 调用
MCP 方式：统一的 tools/call 接口，仅需传递不同参数
```

#### ③ 上下文管理
```
传统方式：自行管理对话历史和上下文
MCP 方式：协议层提供标准化的上下文传递机制
```

### 2.3 具体场景对比

**场景**：让 LLM 查询未来一周北京的天气情况，需要两个工具：
- 获取特定地点和日期的天气信息（`get_weather`）
- 获取当前时间（`get_current_time`）

**传统方式**：
```python
# 需要预先编写每个工具的调用逻辑
def get_weather(location, date):
    # 实现天气 API 调用
    pass

def get_current_time():
    # 实现时间 API 调用
    pass

# 在 LLM 需要时分别触发
```

**MCP 方式**：
```python
# 只需配置好 MCP Servers
# 通过统一的方式进行调用
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "maps_weather",
    "arguments": {
      "city": "北京"
    }
  }
}
```

---

## 三、MCP 架构详解

### 3.1 核心组件

MCP 架构由三个核心组件构成：

```
┌─────────────────────────────────────────────────────────────┐
│                         Host（主机）                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  LLM / AI 应用（如 Claude、ChatGPT 等）                │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│              ┌───────────┴───────────┐                       │
│              │      Client 1         │                       │
│              │  ┌─────────────────┐  │                       │
│              │  │  MCP Client     │  │                       │
│              │  │  - 管理连接      │  │                       │
│              │  │  - 消息路由      │  │                       │
│              │  │  - 协议转换      │  │                       │
│              │  └─────────────────┘  │                       │
│              └───────────┬───────────┘                       │
│                          │                                   │
│              ┌───────────┴───────────┐                       │
│              │      Client 2         │                       │
│              │  ┌─────────────────┐  │                       │
│              │  │  MCP Client     │  │                       │
│              │  └─────────────────┘  │                       │
│              └───────────┬───────────┘                       │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Server 1   │          │  Server 2   │
       │ ┌─────────┐ │          │ ┌─────────┐ │
       │ │ Tools   │ │          │ │ Tools   │ │
       │ │Resources│ │          │ │Resources│ │
       │ │ Prompts │ │          │ │ Prompts │ │
       │ └─────────┘ │          │ └─────────┘ │
       └─────────────┘          └─────────────┘
```

### 3.2 各组件职责

#### Host（主机）
- 运行 AI 模型或应用程序的进程
- 协调多个 Client 与 Server 的交互
- 管理整体会话生命周期

#### Client（客户端）
- 与 Server 建立和维护连接
- 处理消息的路由和协议转换
- 管理请求-响应的匹配
- 每个 Server 对应一个 Client

#### Server（服务端）
- 提供具体的能力实现（工具、资源、提示词）
- 处理来自 Client 的请求
- 返回标准化的响应
- 可以是无状态或有状态服务

### 3.3 交互流程

```
┌──────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Host │────▶│ Client │────▶│ Server │────▶│ 数据源 │
│      │◀────│        │◀────│        │◀────│        │
└──────┘     └────────┘     └────────┘     └────────┘
   │              │              │              │
   │  1. 请求    │  2. 转发    │  3. 执行    │  4. 查询
   │  工具调用   │  JSON-RPC   │  工具逻辑   │  数据库/API
   │             │             │             │
   │  8. 返回    │  7. 返回    │  6. 返回    │  5. 返回
   │  结果       │  响应       │  结果       │  数据
```

---

## 四、MCP 请求与响应消息格式

### 4.1 消息编码规范

MCP 客户端和服务器之间的所有消息必须遵循 **JSON-RPC 2.0** 规范。

### 4.2 四类消息类型

#### ① 请求（Requests）

从 Client 发送到 Server，或从 Server 发送到 Client，用于启动操作。

```json
{
  "jsonrpc": "2.0",
  "id": "string | number",
  "method": "string",
  "params": {
    "key": "value"
  }
}
```

**关键规则**：
- 必须包含字符串或整数 ID
- ID 不得为 null
- ID 在同一会话中不得重复使用

#### ② 响应（Responses）

对请求的回复，包含操作的结果或错误。

```json
{
  "jsonrpc": "2.0",
  "id": "string | number",
  "result": {
    // 成功时的结果数据
  }
}
```

或错误响应：

```json
{
  "jsonrpc": "2.0",
  "id": "string | number",
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": {}
  }
}
```

**关键规则**：
- 必须包含与请求相同的 ID
- 必须设置 `result` 或 `error` 中的一个，不能同时设置
- 错误代码必须是整数

#### ③ 通知（Notifications）

单向消息，不需要响应。

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

**特点**：
- 没有 `id` 字段
- 不需要等待响应
- 用于状态通知、心跳等场景

#### ④ 批处理（Batch）

多个请求或通知的组合（可选支持）。

```json
[
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  },
  {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "resources/list"
  }
]
```

### 4.3 常用方法列表

| 方法 | 方向 | 描述 |
|------|------|------|
| `initialize` | Client → Server | 初始化连接，协商能力 |
| `notifications/initialized` | Client → Server | 初始化完成通知 |
| `tools/list` | Client → Server | 获取可用工具列表 |
| `tools/call` | Client → Server | 调用指定工具 |
| `resources/list` | Client → Server | 获取可用资源列表 |
| `resources/read` | Client → Server | 读取指定资源 |
| `prompts/list` | Client → Server | 获取可用提示词模板 |
| `prompts/get` | Client → Server | 获取指定提示词 |

---

## 五、MCP 生命周期与工作流程

### 5.1 生命周期阶段

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  初始化阶段  │───▶│  操作阶段   │───▶│  关闭阶段   │
│             │    │             │    │             │
│ - 能力协商   │    │ - 工具调用   │    │ - 连接终止   │
│ - 版本确认   │    │ - 资源访问   │    │ - 资源释放   │
│ - 准备就绪   │    │ - 消息交换   │    │ - 会话清除   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 5.2 初始化阶段详解

#### 步骤 1：客户端发送初始化请求

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {}
    },
    "clientInfo": {
      "name": "ExampleClient",
      "version": "1.0.0"
    }
  }
}
```

#### 步骤 2：服务端响应能力信息

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "logging": {},
      "prompts": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      },
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "ExampleServer",
      "version": "1.0.0"
    }
  }
}
```

#### 步骤 3：客户端发送初始化完成通知

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

### 5.3 操作阶段详解

初始化完成后，进入正常的消息交换阶段：

```
┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │
│         │── 1. tools/list ──▶│         │
│         │◀─ 2. 工具列表响应 ─│         │
│         │                    │         │
│         │── 3. tools/call ──▶│         │
│         │◀─ 4. 工具执行结果 ─│         │
│         │                    │         │
│         │── 5. resources/read▶│        │
│         │◀─ 6. 资源内容响应 ─│         │
└─────────┘                    └─────────┘
```

### 5.4 关闭阶段

MCP 协议没有定义专门的关闭消息，而是使用底层传输机制指示连接终止：

- **stdio 方式**：关闭 stdin/stdout 管道
- **HTTP 方式**：关闭 HTTP 连接或 SSE 流
- **优雅关闭**：释放资源、清除会话状态

### 5.5 完整时序图

```
Client                          Server
  │                               │
  │────── initialize ────────────▶│
  │◀───── initialize response ───│
  │                               │
  │────── notifications/initialized▶
  │                               │
  │         [初始化完成]           │
  │                               │
  │────── tools/list ────────────▶│
  │◀───── tools list response ───│
  │                               │
  │────── tools/call ────────────▶│
  │◀───── tool result ───────────│
  │                               │
  │         [持续交互...]          │
  │                               │
  │────── [连接终止] ────────────▶│
  │                               │
```

---

## 六、MCP 传输机制

MCP 定义了两种标准的客户端-服务器通信传输机制：

### 6.1 标准输入输出（stdio）

基于操作系统提供的标准输入和标准输出机制实现。

#### 适用场景
- 本地小工具集成
- 处理个人隐私数据
- 快速功能 Demo
- 命令行工具

#### 工作流程

```
┌─────────────────┐         ┌─────────────────┐
│  Client Process │         │  Server Process │
│                 │         │                 │
│  ┌───────────┐  │  stdin  │  ┌───────────┐  │
│  │  stdout   │──┼────────▶│  │  stdin    │  │
│  └───────────┘  │         │  └───────────┘  │
│                 │         │                 │
│  ┌───────────┐  │  stdout │  ┌───────────┐  │
│  │  stdin    │◀─┼─────────│  │  stdout   │  │
│  └───────────┘  │         │  └───────────┘  │
│                 │         │                 │
│  ┌───────────┐  │ stderr  │  ┌───────────┐  │
│  │  stderr   │◀─┼─────────│  │  stderr   │  │
│  │  (日志)    │  │ (可选)   │  │  (日志)    │  │
│  └───────────┘  │         │  └───────────┘  │
└─────────────────┘         └─────────────────┘
```

#### 启动流程

```bash
# 1. Client 启动 Server 子进程
server_process = subprocess.Popen(
    ["mcp-server-executable"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# 2. 通过 stdin 发送初始化请求
server_process.stdin.write(json.dumps(init_request))

# 3. 从 stdout 读取响应
response = server_process.stdout.readline()

# 4. 关闭时终止子进程
server_process.terminate()
```

### 6.2 可流式 HTTP（Streamable HTTP）

基于 HTTP 协议的流式传输协议，允许数据以流的形式在客户端和服务器之间传输。

#### 适用场景
- 生产环境
- 分布式系统
- 无状态服务架构
- 云端 API 服务

#### 工作流程

```
┌──────────────────────────────────────────────────────────────┐
│                         HTTP 传输流程                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Client                              Server                  │
│    │                                    │                    │
│    │──── POST /initialize ─────────────▶│                    │
│    │    Headers:                        │                    │
│    │    Content-Type: application/json  │                    │
│    │                                    │                    │
│    │◀─── 200 OK ────────────────────────│                    │
│    │    Headers:                        │                    │
│    │    Mcp-Session-Id: 1868a90c...     │                    │
│    │    Content-Type: application/json  │                    │
│    │                                    │                    │
│    │──── POST /notifications/initialized▶                   │
│    │    Mcp-Session-Id: 1868a90c...     │                    │
│    │                                    │                    │
│    │◀─── 202 Accepted ──────────────────│                    │
│    │                                    │                    │
│    │         [初始化完成]                │                    │
│    │                                    │                    │
│    │──── POST /rpc ────────────────────▶│                    │
│    │    Mcp-Session-Id: 1868a90c...     │                    │
│    │    Body: tools/list request        │                    │
│    │                                    │                    │
│    │◀─── 200 OK + response ─────────────│ (单次请求响应)      │
│    │                                    │                    │
│    │──── GET /sse ─────────────────────▶│                    │
│    │    Mcp-Session-Id: 1868a90c...     │                    │
│    │                                    │                    │
│    │◀─── SSE stream ────────────────────│ (服务器推送流)      │
│    │    event: message                   │                    │
│    │    data: {...}                      │                    │
│    │                                    │                    │
└──────────────────────────────────────────────────────────────┘
```

#### 关键特性

1. **Session ID**：初始化响应头中携带 `mcp-session-id`，用于标识会话
2. **双向通信**：
   - Client → Server：POST 请求
   - Server → Client：SSE（Server-Sent Events）流
3. **流式传输**：支持持续的数据推送（如 LLM 流式输出）
4. **无状态/有状态**：根据服务端实现，可以是无状态或有状态服务

#### 请求示例

```bash
# 初始化请求
curl -X POST https://mcp.example.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "TestClient", "version": "1.0.0"}
    }
  }'

# 工具调用请求
curl -X POST https://mcp.example.com/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: 1868a90c-1234-5678-9abc-def012345678" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "maps_weather",
      "arguments": {"city": "北京"}
    }
  }'
```

### 6.3 传输机制对比

| 特性 | stdio | Streamable HTTP |
|------|-------|-----------------|
| 适用场景 | 本地工具 | 云端服务 |
| 安全性 | 进程内通信，更安全 | 需要 HTTPS |
| 性能 | 低延迟 | 网络延迟 |
| 扩展性 | 单机 | 分布式 |
| 部署复杂度 | 简单 | 需要服务器 |
| 状态管理 | 有状态（进程） | 可选有/无状态 |

---

## 七、MCP 与 Tool Calls 的关系

### 7.1 概念澄清

**MCP 和 Tool Calls 是完全不同层面的东西，是两条并行的赛道**：

| 维度 | MCP | Tool Calls |
|------|-----|------------|
| **本质** | 协议标准 | 模型接口特性 |
| **层级** | 应用层协议 | 模型能力 |
| **范围** | 定义通信规范 | 定义调用方式 |
| **关系** | 可以基于 Tool Calls 实现 | 可以被 MCP 使用 |

### 7.2 层次关系

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层（Application）                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  AI 应用（Claude、ChatGPT、自定义应用）                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐   │
│  │              MCP 协议层（Protocol）                      │   │
│  │  - 定义消息格式（JSON-RPC 2.0）                          │   │
│  │  - 定义生命周期（初始化、操作、关闭）                      │   │
│  │  - 定义传输机制（stdio、HTTP）                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐   │
│  │              模型接口层（Model Interface）               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Tool Calls  │  │   Prompt    │  │    其他     │    │   │
│  │  │  (OpenAI)   │  │  (Claude)   │  │             │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐   │
│  │              模型层（LLM）                               │   │
│  │  GPT-4 / Claude / Llama / 其他模型                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 使用方式

MCP 可以在其协议之上，通过不同方式与模型交互：

#### 方式 1：基于 Tool Calls
```python
# 使用 OpenAI 风格的 Tool Calls
response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=mcp_tools_list,  # 从 MCP Server 获取的工具列表
    tool_choice="auto"
)

# 当模型决定调用工具时
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    # 通过 MCP Client 调用对应工具
    result = mcp_client.call_tool(
        tool_call.function.name,
        json.loads(tool_call.function.arguments)
    )
```

#### 方式 2：基于 Prompt（Claude 官方示例）
```python
# 将工具描述作为 Prompt 的一部分
system_prompt = f"""
你可以使用以下工具：
{mcp_tools_description}

当需要使用工具时，请以如下格式输出：
<tool_call>
<name>工具名称</name>
<arguments>{{"参数名": "参数值"}}</arguments>
</tool_call>
"""

# 解析 LLM 输出，提取工具调用
# 通过 MCP Client 执行工具调用
```

### 7.4 关键结论

1. **不互为前提**：MCP 不依赖 Tool Calls，Tool Calls 也不依赖 MCP
2. **各取所需**：开发者可以根据场景选择合适的组合
3. **MCP 是协议层**：规定了上下文与请求的结构化传递方式
4. **Tool Calls 是能力层**：某些大模型提供的特有接口特性

---

## 八、实际应用示例

### 8.1 高德 MCP 服务示例

#### 获取工具列表

**请求**：
```bash
curl -X POST "https://mcp.amap.com/mcp?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

**响应**：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "maps_direction_bicycling",
        "description": "骑行路径规划用于规划骑行通勤方案，规划时会考虑天桥、单行线、封路等情况。最大支持 500km 的骑行路线规划",
        "inputSchema": {
          "type": "object",
          "properties": {
            "origin": {
              "type": "string",
              "description": "出发点经纬度，坐标格式为：经度，纬度"
            },
            "destination": {
              "type": "string",
              "description": "目的地经纬度，坐标格式为：经度，纬度"
            }
          },
          "required": ["origin", "destination"]
        }
      },
      {
        "name": "maps_weather",
        "description": "获取指定城市的天气信息",
        "inputSchema": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string",
              "description": "城市名称"
            }
          },
          "required": ["city"]
        }
      }
    ]
  }
}
```

#### 调用天气查询工具

**请求**：
```bash
curl -X POST "https://mcp.amap.com/mcp?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "maps_weather",
      "arguments": {
        "city": "广州"
      }
    }
  }'
```

**响应**：
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"city\":\"广州市\",\"forecasts\":[...]}"
      }
    ],
    "isError": false
  }
}
```

### 8.2 完整交互流程示例

```python
import requests
import json

class MCPClient:
    def __init__(self, server_url, api_key=None):
        self.server_url = server_url
        self.api_key = api_key
        self.session_id = None
    
    def initialize(self):
        """初始化连接"""
        response = requests.post(
            f"{self.server_url}?key={self.api_key}",
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "MyClient", "version": "1.0.0"}
                }
            }
        )
        data = response.json()
        self.session_id = response.headers.get("Mcp-Session-Id")
        return data
    
    def list_tools(self):
        """获取工具列表"""
        response = requests.post(
            f"{self.server_url}?key={self.api_key}",
            headers={"Mcp-Session-Id": self.session_id} if self.session_id else {},
            json={
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/list",
                "params": {}
            }
        )
        return response.json()
    
    def call_tool(self, tool_name, arguments):
        """调用工具"""
        response = requests.post(
            f"{self.server_url}?key={self.api_key}",
            headers={"Mcp-Session-Id": self.session_id} if self.session_id else {},
            json={
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {
                    "name": tool_name,
                    "arguments": arguments
                }
            }
        )
        return response.json()

# 使用示例
client = MCPClient("https://mcp.amap.com/mcp", api_key="your_key")

# 1. 初始化
init_result = client.initialize()
print("初始化结果:", init_result)

# 2. 获取工具列表
tools = client.list_tools()
print("可用工具:", tools)

# 3. 调用天气工具
weather = client.call_tool("maps_weather", {"city": "北京"})
print("天气信息:", weather)
```

---

## 九、MCP 开发实践

### 9.1 开发 MCP Server（Python）

使用官方 MCP Python SDK：

```bash
pip install mcp
```

#### 简单示例

```python
from mcp.server import Server
from mcp.types import TextContent
import asyncio

# 创建 MCP Server
app = Server("my-mcp-server")

@app.list_tools()
async def list_tools():
    """定义可用工具"""
    return [
        {
            "name": "calculate",
            "description": "执行数学计算",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式，如 '1 + 2 * 3'"
                    }
                },
                "required": ["expression"]
            }
        }
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    """处理工具调用"""
    if name == "calculate":
        expression = arguments.get("expression", "")
        try:
            result = eval(expression)  # 注意：生产环境需要安全检查
            return [TextContent(type="text", text=str(result))]
        except Exception as e:
            return [TextContent(type="text", text=f"错误: {str(e)}")]
    
    raise ValueError(f"未知工具: {name}")

# 运行 Server（stdio 模式）
if __name__ == "__main__":
    asyncio.run(app.run_stdio_async())
```

### 9.2 开发 MCP Client

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio

async def main():
    # 配置 Server 参数
    server_params = StdioServerParameters(
        command="python",
        args=["my_mcp_server.py"],
        env=None
    )
    
    # 建立连接
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 初始化
            await session.initialize()
            
            # 获取工具列表
            tools = await session.list_tools()
            print("可用工具:", tools)
            
            # 调用工具
            result = await session.call_tool(
                "calculate",
                {"expression": "1 + 2 * 3"}
            )
            print("计算结果:", result)

if __name__ == "__main__":
    asyncio.run(main())
```

### 9.3 与 LLM 集成

```python
from openai import OpenAI
import json

client = OpenAI()

async def chat_with_tools(user_message, mcp_session):
    # 1. 获取 MCP 工具列表
    mcp_tools = await mcp_session.list_tools()
    
    # 2. 转换为 OpenAI Tool 格式
    openai_tools = [
        {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema
            }
        }
        for tool in mcp_tools.tools
    ]
    
    # 3. 发送给 LLM
    messages = [{"role": "user", "content": user_message}]
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        tools=openai_tools,
        tool_choice="auto"
    )
    
    message = response.choices[0].message
    
    # 4. 处理工具调用
    if message.tool_calls:
        for tool_call in message.tool_calls:
            # 通过 MCP 调用工具
            result = await mcp_session.call_tool(
                tool_call.function.name,
                json.loads(tool_call.function.arguments)
            )
            
            # 将结果返回给 LLM
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })
        
        # 5. 获取最终回复
        final_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        return final_response.choices[0].message.content
    
    return message.content
```

---

## 十、常见问题与解决方案

### 10.1 MCP 与 Function Calling 有什么区别？

| 问题 | 解答 |
|------|------|
| **区别** | MCP 是协议层，Function Calling 是模型能力层 |
| **关系** | MCP 可以使用 Function Calling 作为底层实现 |
| **选择** | 两者可以结合使用，也可以独立使用 |

### 10.2 如何选择传输机制？

| 场景 | 推荐机制 | 原因 |
|------|----------|------|
| 本地工具 | stdio | 简单、安全、低延迟 |
| 云端服务 | HTTP | 可扩展、分布式、无状态 |
| 个人隐私数据 | stdio | 数据不离开本地 |
| 生产环境 | HTTP | 易于部署、监控、扩展 |

### 10.3 如何处理认证和授权？

```python
# Server 端验证
@app.call_tool()
async def call_tool(name: str, arguments: dict, context: dict):
    # 从 context 获取认证信息
    auth_token = context.get("auth_token")
    
    if not verify_token(auth_token):
        raise PermissionError("无效的认证令牌")
    
    # 执行工具调用
    ...

# Client 端传递
async with ClientSession(read, write, context={
    "auth_token": "your_token"
}) as session:
    ...
```

### 10.4 如何处理错误？

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": {
      "details": "Missing required parameter: city"
    }
  }
}
```

**常见错误码**：
| 错误码 | 含义 |
|--------|------|
| -32700 | Parse error |
| -32600 | Invalid Request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |

### 10.5 如何调试 MCP 服务？

1. **使用日志**：在 Server 端添加详细日志
2. **使用代理工具**：如 Postman、curl 测试 HTTP 接口
3. **使用 MCP Inspector**：官方提供的调试工具
4. **本地测试**：先使用 stdio 模式本地测试

---

## 十一、参考资源

### 官方资源
- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP 规范](https://modelcontextprotocol.io/specification)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### 社区资源
- [Awesome MCP](https://github.com/modelcontextprotocol/awesome-mcp)
- [MCP Servers 列表](https://github.com/modelcontextprotocol/servers)

### 相关文章
- [Introducing the Model Context Protocol - Anthropic](https://www.anthropic.com/news/model-context-protocol)

### 本系列教程
1. [MCP协议简化了哪些流程？为什么需要MCP协议？](./6-2%20MCP协议简化了哪些流程？为什么需要MCP协议？.pdf)
2. [MCP架构全解析：Host、Client与Server的协同机制](./6-3%20MCP架构全解析：Host、Client与Server的协同机制.pdf)
3. **MCP协议完整教程：从入门到实践**（本文档）

---

## 总结

MCP 协议为 AI 应用的开发带来了标准化和统一化的解决方案：

1. **简化集成**：统一的协议降低了工具接入成本
2. **提升效率**：标准化的消息格式和生命周期管理
3. **增强灵活**：支持多种传输机制和使用场景
4. **促进生态**：开放的协议有助于形成工具生态

通过本教程的学习，你应该已经掌握了 MCP 协议的核心概念、架构设计、消息格式、生命周期、传输机制以及实际开发方法。接下来可以：

- 尝试开发自己的 MCP Server
- 集成现有的 MCP 工具到你的 AI 应用
- 探索更多 MCP 生态中的工具和服务

祝你在 MCP 开发之旅中取得成功！
