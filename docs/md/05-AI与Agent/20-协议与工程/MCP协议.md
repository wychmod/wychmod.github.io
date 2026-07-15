# MCP 协议

> **原文归档**：[archive/old-agent-notes/agent系统知识/](../../archive/old-agent-notes/agent系统知识/)
> 包含：1 篇完整教程（原文提到的 2 个参考 PDF 在归档中未找到，仅保留文字教程）

## 一、核心主题概述

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 于 2024 年 11 月发布的开放标准，用于规范 AI 应用与外部工具、数据源、提示词之间的上下文交换方式。

它既不是一个深度学习框架，也不是某种模型能力，而是位于应用与能力之间的**协议层**。可以把它比作 AI 世界的 USB-C：只要 MCP Server 与 MCP Client 都遵循同一套接口定义，任何工具、数据库或 API 都能以统一方式接入 LLM。

MCP 的核心能力：

| 能力 | 说明 |
|------|------|
| Tools（工具） | 暴露可调用的函数/服务 |
| Resources（资源） | 暴露可读的文件、数据库、API 数据 |
| Prompts（提示词） | 暴露可复用的提示模板 |

主要特点：标准化、开放性、灵活、可扩展。

## 二、为什么需要 MCP

在没有 MCP 之前，把外部能力接入 LLM 通常会遇到以下问题：

1. **重复开发**：每个工具都要单独写调用代码。
2. **接口不统一**：不同服务的参数、认证、返回格式各异。
3. **集成成本高**：每新增一个工具就要改一遍主应用。
4. **维护困难**：工具数量一多，版本、权限、错误处理容易失控。

MCP 把这些问题收敛到协议层，统一了三个关键流程：

| 流程 | 传统方式 | MCP 方式 |
|------|----------|----------|
| 工具发现 | 读文档、手写 schema | `tools/list` 返回标准描述 |
| 工具调用 | 每个接口单独封装 HTTP | `tools/call` 统一入口 |
| 上下文管理 | 应用自己拼历史、传上下文 | 协议层定义上下文传递方式 |

> 💡 补充：MCP 与 Function Calling 不是替代关系。Function Calling 是模型能力，MCP 是应用层协议；MCP 可以完全基于 Function Calling 实现，也可以用 prompt 解析方式驱动。

## 三、MCP 架构

MCP 由 Host、Client、Server 三个核心角色组成：

```
┌─────────────────────────────────────────────────────────────┐
│                         Host（主机）                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  LLM / AI 应用（如 Claude、ChatGPT、自定义 Agent）       │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│              ┌───────────┴───────────┐                       │
│              │      Client 1         │                       │
│              │  ┌─────────────────┐  │                       │
│              │  │  MCP Client     │  │  管理连接、路由消息、协议转换  │
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
       │ Tools/      │          │ Tools/      │
       │ Resources/  │          │ Resources/  │
       │ Prompts     │          │ Prompts     │
       └─────────────┘          └─────────────┘
```

各角色职责：

| 角色 | 职责 |
|------|------|
| Host | 运行 LLM 或 AI 应用的进程，管理整体会话生命周期 |
| Client | 与 Server 建立连接、路由消息、做协议转换；每个 Server 对应一个 Client |
| Server | 提供具体能力实现，处理请求并返回标准化响应；可设计成有状态或无状态 |

一次典型交互：Host 发起工具调用请求 → Client 转发 JSON-RPC → Server 执行工具逻辑 → 查询数据源 → 沿原路返回结果。

## 四、消息格式与生命周期

### 4.1 消息格式

MCP 所有消息都基于 **JSON-RPC 2.0**，主要分为请求、响应、通知、批处理四类。

**请求：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "maps_weather", "arguments": { "city": "北京" } }
}
```

**成功响应：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{ "type": "text", "text": "...天气数据..." }],
    "isError": false
  }
}
```

**错误响应：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": { "code": -32600, "message": "Invalid Request", "data": {} }
}
```

**通知（无需响应）：**
```json
{ "jsonrpc": "2.0", "method": "notifications/initialized" }
```

常用方法：

| 方法 | 方向 | 作用 |
|------|------|------|
| `initialize` | Client → Server | 协商协议版本与能力 |
| `notifications/initialized` | Client → Server | 通知初始化完成 |
| `tools/list` | Client → Server | 获取可用工具 |
| `tools/call` | Client → Server | 调用指定工具 |
| `resources/list` | Client → Server | 获取资源列表 |
| `resources/read` | Client → Server | 读取资源内容 |
| `prompts/list` | Client → Server | 获取提示词模板 |
| `prompts/get` | Client → Server | 获取指定提示词 |

### 4.2 生命周期

MCP 会话生命周期分为三个阶段：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  初始化阶段  │───▶│  操作阶段   │───▶│  关闭阶段   │
│  - 能力协商  │    │  - 工具调用  │    │  - 连接终止  │
│  - 版本确认  │    │  - 资源访问  │    │  - 资源释放  │
│  - 准备就绪  │    │  - 消息交换  │    │  - 会话清除  │
└─────────────┘    └─────────────┘    └─────────────┘
```

初始化时序：Client 发送 `initialize` → Server 返回能力信息 → Client 发送 `notifications/initialized` 完成握手 → 进入正常交互（如 `tools/list`、`tools/call`）。

初始化请求与响应示例：
```json
// Client 发送
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": { "roots": { "listChanged": true }, "sampling": {} },
    "clientInfo": { "name": "ExampleClient", "version": "1.0.0" }
  }
}

// Server 响应
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "logging": {},
      "prompts": { "listChanged": true },
      "resources": { "subscribe": true, "listChanged": true },
      "tools": { "listChanged": true }
    },
    "serverInfo": { "name": "ExampleServer", "version": "1.0.0" }
  }
}
```

> 💡 补充：协议关闭没有专门的 MCP 消息，通常依赖底层传输：stdio 关闭 stdin/stdout 管道，HTTP 关闭连接或 SSE 流。

## 五、传输机制

MCP 定义了两种标准传输：stdio 与 Streamable HTTP。

### 5.1 stdio（标准输入输出）

适合本地工具、命令行脚本、隐私数据处理。

```
┌─────────────────┐         ┌─────────────────┐
│  Client Process │         │  Server Process │
│  ┌───────────┐  │  stdin  │  ┌───────────┐  │
│  │  stdout   │──┼────────▶│  │  stdin    │  │
│  └───────────┘  │         │  └───────────┘  │
│  ┌───────────┐  │ stdout  │  ┌───────────┐  │
│  │  stdin    │◀─┼─────────│  │  stdout   │  │
│  └───────────┘  │         │  └───────────┘  │
│  ┌───────────┐  │ stderr  │  ┌───────────┐  │
│  │  stderr   │◀─┼─────────│  │  stderr   │  │
│  │  (日志)    │  │ (可选)   │  │  (日志)    │  │
│  └───────────┘  │         │  └───────────┘  │
└─────────────────┘         └─────────────────┘
```

Python 启动示例：
```python
server_process = subprocess.Popen(
    ["mcp-server-executable"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE
)
server_process.stdin.write(json.dumps(init_request))
response = server_process.stdout.readline()
server_process.terminate()
```

### 5.2 Streamable HTTP

适合生产环境、分布式部署、云端 API。

```
Client                              Server
  │                                    │
  │──── POST /initialize ─────────────▶│
  │◀─── 200 OK + Mcp-Session-Id ───────│
  │                                    │
  │──── POST /notifications/initialized▶
  │◀─── 202 Accepted ──────────────────│
  │                                    │
  │──── POST /rpc (tools/list) ───────▶│
  │◀─── 200 OK + response ─────────────│
  │                                    │
  │──── GET /sse ─────────────────────▶│
  │◀─── SSE stream (server push) ──────│
```

关键特性：
- 初始化响应头返回 `Mcp-Session-Id`，后续请求携带该 ID 维持会话。
- 客户端到服务端用 POST，服务端到客户端用 SSE 流。
- 支持流式输出，可做成无状态或有状态服务。

### 5.3 传输机制对比

| 特性 | stdio | Streamable HTTP |
|------|-------|-----------------|
| 适用场景 | 本地工具、隐私数据 | 云端服务、分布式系统 |
| 安全性 | 进程内通信，更安全 | 需要 HTTPS |
| 性能 | 低延迟 | 受网络延迟影响 |
| 扩展性 | 单机 | 可水平扩展 |
| 部署复杂度 | 简单 | 需要服务器 |
| 状态管理 | 有状态（进程） | 可选有/无状态 |

## 六、开发实践

### 6.1 实现 MCP Server（Python）

官方 SDK 安装：
```bash
pip install mcp
```

最小 Server 示例：
```python
from mcp.server import Server
from mcp.types import TextContent
import asyncio

app = Server("my-mcp-server")

@app.list_tools()
async def list_tools():
    return [{
        "name": "calculate",
        "description": "执行数学计算",
        "inputSchema": {
            "type": "object",
            "properties": {
                "expression": { "type": "string", "description": "数学表达式" }
            },
            "required": ["expression"]
        }
    }]

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "calculate":
        expression = arguments.get("expression", "")
        try:
            result = eval(expression)  # 生产环境请替换为安全求值
            return [TextContent(type="text", text=str(result))]
        except Exception as e:
            return [TextContent(type="text", text=f"错误: {str(e)}")]
    raise ValueError(f"未知工具: {name}")

if __name__ == "__main__":
    asyncio.run(app.run_stdio_async())
```

### 6.2 实现 MCP Client（Python）

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio

async def main():
    server_params = StdioServerParameters(
        command="python", args=["my_mcp_server.py"], env=None
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            result = await session.call_tool("calculate", {"expression": "1 + 2 * 3"})
            print(result)

asyncio.run(main())
```

### 6.3 与 LLM 集成（基于 Tool Calls）

```python
from openai import OpenAI
import json
client = OpenAI()

async def chat_with_tools(user_message, mcp_session):
    mcp_tools = await mcp_session.list_tools()
    openai_tools = [{
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.inputSchema
        }
    } for tool in mcp_tools.tools]

    messages = [{"role": "user", "content": user_message}]
    response = client.chat.completions.create(
        model="gpt-4", messages=messages, tools=openai_tools, tool_choice="auto"
    )
    message = response.choices[0].message
    if message.tool_calls:
        for tool_call in message.tool_calls:
            result = await mcp_session.call_tool(
                tool_call.function.name,
                json.loads(tool_call.function.arguments)
            )
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })
        final = client.chat.completions.create(model="gpt-4", messages=messages)
        return final.choices[0].message.content
    return message.content
```

## 七、2026 年现状

截至 2026 年，MCP 已从 Anthropic 主导的实验性标准成长为 AI 应用集成的事实协议之一：

- **模型侧**：Claude 系列原生支持 MCP；OpenAI、Google 等厂商在 Agent SDK 或 API 中逐步兼容 MCP 能力描述与调用约定。
- **平台侧**：Cursor、Windsurf、Claude Code、Cline、Continue 等 IDE/编辑器均支持通过 MCP 接入自定义工具。
- **Server 生态**：GitHub、Slack、Figma、Notion、PostgreSQL、Stripe、高德地图等厂商或社区提供了大量现成 MCP Server；`awesome-mcp` 和 `mcp/servers` 仓库持续扩张。
- **SDK 成熟度**：官方 Python SDK 与 TypeScript SDK 迭代到稳定版本，社区也涌现出 Go、Java、Rust 等语言实现。
- **标准化进程**：协议版本从 2024-11-05 演进，逐步统一了 Streamable HTTP、OAuth 授权、服务端能力变更通知等细节。

> 💡 补充：2026 年最常见的落地形态仍是 "Host + 多个 MCP Server" 的组合，即一个 Agent 应用同时挂载本地文件系统、数据库、搜索、第三方 API 等多个 Server，通过统一协议完成工具发现与调用。

## 八、常见坑与补充

> 💡 补充：MCP 不保证 Server 一定安全。`eval`、`exec` 或任意 SQL/Shell 工具如果直接暴露，极易被 prompt injection 利用；生产环境必须做权限控制、输入校验和沙箱隔离。

> 💡 补充：初始化阶段必须先完成 `initialize` 再发送普通请求。很多新手会跳过 `notifications/initialized`，导致 Server 拒绝后续调用。

> 💡 补充：stdio 模式下，**stderr 不是传输通道**，仅用于日志输出；真正的 JSON-RPC 消息必须走 stdout，否则 Client 解析会失败。

> 💡 补充：HTTP 模式下，如果没有正确携带 `Mcp-Session-Id`，有状态 Server 会无法识别会话；无状态实现虽然不需要该头，但仍需保证幂等性。

> 💡 补充：工具返回内容统一放在 `result.content` 数组中，每个元素都有 `type` 字段（常见 `text`、`image`、`resource`），不要直接把结果放在 `result` 顶层。

> 💡 补充：常见 JSON-RPC 错误码：-32700 Parse error、-32600 Invalid Request、-32601 Method not found、-32602 Invalid params、-32603 Internal error。熟悉这些码能快速定位问题。

---

## 📚 完整资料
- [MCP协议完整教程：从入门到实践.md](../../archive/old-agent-notes/agent系统知识/MCP协议完整教程：从入门到实践.md)

> ⚠️ 原文中提到的 2 个参考 PDF（`6-2 ...` 和 `6-3 ...`）在归档目录中未找到，已移除链接。
