# Redis Stream 消息队列教程

## 1、Redis Stream 简介

Redis Stream 是 Redis 5.0 引入的一种新数据结构，专门用于实现消息队列功能。它比传统的 List、Pub/Sub 方案更强大，提供了消息持久化、消费者组、消息确认等企业级特性。

### 1.1、Redis Stream 与其他消息队列对比

| 特性 | Redis Stream | Kafka | RabbitMQ |
|------|--------------|-------|----------|
| 持久化 | 支持 | 支持 | 支持 |
| 消费者组 | 支持 | 支持 | 支持 |
| 消息确认 | 支持 | 支持 | 支持 |
| 消息回溯 | 支持 | 支持 | 不支持 |
| 吞吐量 | 高 | 极高 | 高 |
| 部署复杂度 | 低 | 高 | 中 |

### 1.2、Redis Stream 核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    Redis Stream                          │
├─────────────────────────────────────────────────────────┤
│  Stream ID: 1699999999999-0                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Field1: Value1                                   │    │
│  │ Field2: Value2                                   │    │
│  └─────────────────────────────────────────────────┘    │
│                          ↓                               │
│  Stream ID: 1699999999999-1                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Field1: Value1                                   │    │
│  │ Field2: Value2                                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

- **Stream**：消息流，类似于 Kafka 的 Topic
- **Message Entry**：消息条目，包含多个字段
- **Message ID**：唯一标识每条消息，格式为 `timestamp-sequenceNumber`
- **Consumer Group**：消费者组，实现多消费者负载均衡
- **Consumer**：消费者，属于某个消费者组

## 2、基础命令

### 2.1、添加消息 XADD

```bash
# 语法: XADD key ID field value [field value ...]
# 使用自动生成 ID
XADD mystream * field1 value1 field2 value2

# 指定 ID（必须大于当前最大 ID）
XADD mystream 1699999999999-0 field1 value1

# 带星号的 ID 由 Redis 自动生成
XADD mystream $ field1 value1  # $ 表示使用当前最大 ID + 1
```

### 2.2、读取消息 XREAD

```bash
# 从头读取消息
XREAD STREAMS mystream 0

# 从特定 ID 开始读取
XREAD STREAMS mystream 1699999999999-0

# 读取最新消息（阻塞方式）
XREAD BLOCK 0 STREAMS mystream $

# 读取多条消息
XREAD COUNT 10 STREAMS mystream 0
```

**XREAD 参数说明：**
- `BLOCK milliseconds`：阻塞等待时间，0 表示无限等待
- `COUNT n`：最多读取消息数量
- `STREAMS key [key ...]`：要读取的 Stream 键
- `ID [ID ...]`：起始 ID，$ 表示最新消息

### 2.3、查看长度 XLEN

```bash
XLEN mystream
```

### 2.4、查看消息 XRANGE

```bash
# 查看所有消息
XRANGE mystream - +

# 查看指定范围的消息
XRANGE mystream 1699999999999-0 1699999999999-100

# 反向查看
XREVRANGE mystream + -
```

## 3、消费者组（Consumer Group）

消费者组是 Redis Stream 的核心功能，实现多消费者负载均衡和消息确认。

### 3.1、创建消费者组 XGROUP CREATE

```bash
# 语法: XGROUP CREATE key groupname id-or$
# id-or$ 指定从哪里开始消费，$ 表示只消费新消息，0 表示消费所有历史消息
XGROUP CREATE mystream mygroup $

# 从头开始消费历史消息
XGROUP CREATE mystream mygroup 0
```

### 3.2、读取消息 XREADGROUP

```bash
# 语法: XREADGROUP GROUP groupname consumername STREAMS key ID
# ID 可以是 >（获取新消息）或具体消息ID

# 从消费者组读取新消息
XREADGROUP GROUP mygroup consumer1 STREAMS mystream ">"

# 获取_pending列表中的消息（未确认的）
XREADGROUP GROUP mygroup consumer1 STREAMS mystream "0"
```

**参数说明：**
- `GROUP groupname consumername`：指定消费者组和消费者名称
- `>`：只获取从未分配给任何消费者的新消息
- `0`：获取_pending列表中的消息（之前读取但未确认的）

### 3.3、确认消息 XACK

```bash
# 语法: XACK key groupname ID [ID ...]
# 确认一条消息
XACK mystream mygroup 1699999999999-0

# 确认多条消息
XACK mystream mygroup 1699999999999-0 1699999999999-1
```

### 3.4、查看消费者组信息 XINFO

```bash
# 查看 Stream 信息
XINFO STREAM mystream FULL

# 查看消费者组列表
XINFO GROUPS mystream

# 查看消费者列表
XINFO CONSUMERS mystream mygroup
```

### 3.5、删除消费者 XGROUP DELCONSUMER

```bash
XGROUP DELCONSUMER mystream mygroup consumer1
```

### 3.6、删除消费者组 XGROUP DESTROY

```bash
XGROUP DESTROY mystream mygroup
```

## 4、消息Pending机制

当消费者读取消息但未确认时，消息会进入 Pending 列表，防止消息丢失。

### 4.1、查看Pending列表 XPENDING

```bash
# 查看消费者组的pending消息
XPENDING mystream mygroup

# 带详细信息
XPENDING mystream mygroup + - 10

# 查看某个消费者的pending消息
XPENDING mystream mygroup consumer1
```

### 4.2、消息claim（转移）

当消费者崩溃时，可以将其 pending 消息转移给其他消费者。

```bash
# 语法: XCLAIM key group consumer min-idle-time ID [ID ...]
# 将超过30秒未被确认的消息转移给新消费者
XCLAIM mystream mygroup consumer2 30000 1699999999999-0
```

### 4.3、消息转移后的确认

```bash
# claim 后需要重新 ack
XCLAIM mystream mygroup consumer2 30000 1699999999999-0
XACK mystream mygroup 1699999999999-0
```

## 5、监控与管理命令

### 5.1、删除消息 XDEL

```bash
XDEL mystream 1699999999999-0
```

### 5.2、裁剪消息 XTRIM

```bash
# 将 Stream 裁剪到指定长度
XTRIM mystream MAXLEN 1000

# 使用 ~= 表示近似裁剪（更高效）
XTRIM mystream MAXLEN ~= 1000
```

### 5.3、监控命令 MONITOR

```bash
# 实时监控 Redis 操作（调试用）
MONITOR
```

## 6、Java 代码示例

### 6.1、引入依赖

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>4.3.1</version>
</dependency>
```

### 6.2、生产者代码

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.StreamEntryID;

public class StreamProducer {

    public static void main(String[] args) {
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            // 添加消息
            StreamEntryID id = jedis.xadd("mystream", StreamEntryID.NEW_ENTRY,
                Map.of("field1", "value1", "field2", "value2"));

            System.out.println("消息ID: " + id);

            // 批量添加消息
            Map<String, Map<String, String>> messages = new HashMap<>();
            for (int i = 0; i < 10; i++) {
                messages.put(String.valueOf(i),
                    Map.of("field", "value" + i));
            }

            StreamEntryID[] ids = jedis.xadd("mystream", messages);
            System.out.println("批量添加消息数量: " + ids.length);
        }
    }
}
```

### 6.3、消费者代码

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.StreamEntryID;
import redis.clients.jedis.StreamEntry;
import redis.clients.jedis.params.XReadGroupParams;
import redis.clients.jedis.resps.StreamPendingEntry;

import java.util.List;
import java.util.Map;

public class StreamConsumer {

    public static void main(String[] args) {
        String streamKey = "mystream";
        String groupName = "mygroup";
        String consumerName = "consumer1";

        try (Jedis jedis = new Jedis("localhost", 6379)) {
            // 创建消费者组（如果不存在）
            try {
                jedis.xgroupCreate(streamKey, groupName, StreamEntryID.LAST_ENTRY, true);
            } catch (JedisException e) {
                // 消费者组已存在，忽略异常
            }

            // 持续消费消息
            while (true) {
                // 读取新消息
                XReadGroupParams params = XReadGroupParams.xReadGroupParams()
                    .count(10)
                    .block(Duration.ofSeconds(1));

                List<Map.Entry<String, List<StreamEntry>>> results =
                    jedis.xreadGroup(groupName, consumerName, params,
                        new StreamEntryID(StreamEntryID.UNRECEIVED_ENTRY), streamKey);

                if (results != null && !results.isEmpty()) {
                    for (Map.Entry<String, List<StreamEntry>> entry : results) {
                        String key = entry.getKey();
                        List<StreamEntry> messages = entry.getValue();

                        for (StreamEntry message : messages) {
                            System.out.println("收到消息 - ID: " + message.getID());
                            System.out.println("内容: " + message.getFields());

                            // 模拟处理
                            processMessage(message.getFields());

                            // 确认消息
                            jedis.xack(streamKey, groupName, message.getID());
                        }
                    }
                }
            }
        }
    }

    private static void processMessage(Map<String, String> fields) {
        // 业务处理逻辑
        System.out.println("处理消息: " + fields);
    }
}
```

### 6.4、Spring Boot 集成

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Service
public class RedisStreamService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String STREAM_KEY = "order-stream";
    private static final String GROUP_NAME = "order-group";

    /**
     * 发送消息
     */
    public String sendMessage(String userId, String orderInfo) {
        return redisTemplate.opsForStream()
            .add(Record.of(Collections.singletonMap("userId", userId)
                .and("orderInfo", orderInfo))
                .withStreamKey(STREAM_KEY));
    }

    /**
     * 创建消费者组
     */
    public void createGroup() {
        redisTemplate.opsForStream()
            .createGroup(STREAM_KEY, ReadOffset.from("0"));
    }

    /**
     * 读取消息（阻塞）
     */
    public List<MapRecord<String, Object, Object>> readMessage(Duration timeout) {
        return redisTemplate.opsForStream()
            .read(Consumer.from("consumer-1", GROUP_NAME),
                StreamReadOptions.empty().count(10).block(timeout),
                StreamOffset.create(STREAM_KEY, ReadOffset.lastConsumed()));
    }

    /**
     * 确认消息
     */
    public Long acknowledge(String messageId) {
        return redisTemplate.opsForStream()
            .acknowledge(STREAM_KEY, GROUP_NAME, messageId);
    }

    /**
     * 查看Pending信息
     */
    public StreamPendingMessagesSummary pending(String groupName) {
        return redisTemplate.opsForStream()
            .pending(STREAM_KEY, groupName);
    }
}
```

## 7、实际应用场景

### 7.1、异步订单处理

```
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  用户   │───>│  订单服务   │───>│ Redis Stream │───>│  库存服务   │
│  下单   │    │  (生产者)   │    │              │    │  (消费者)   │
└─────────┘    └─────────────┘    └──────────────┘    └─────────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────┐
                                                   │  库存扣减   │
                                                   └─────────────┘
```

### 7.2、日志收集系统

```java
// 日志生产者
public class LogProducer {

    public void log(String level, String message) {
        jedis.xadd("app-logs", StreamEntryID.NEW_ENTRY,
            Map.of("level", level,
                   "message", message,
                   "timestamp", String.valueOf(System.currentTimeMillis())));
    }
}

// 日志消费者
public class LogConsumer {

    public void consume() {
        while (true) {
            List<Map.Entry<String, List<StreamEntry>>> results =
                jedis.xreadGroup("log-group", "consumer-1",
                    XReadGroupParams.xReadGroupParams().count(100).block(Duration.ofSeconds(1)),
                    new StreamEntryID(StreamEntryID.UNRECEIVED_ENTRY), "app-logs");

            if (results != null) {
                for (var entry : results) {
                    for (StreamEntry msg : entry.getValue()) {
                        processLog(msg.getFields());
                        jedis.xack("app-logs", "log-group", msg.getID());
                    }
                }
            }
        }
    }
}
```

### 7.3、分布式任务调度

```java
// 任务分发
public class TaskDispatcher {

    public void dispatchTask(String taskType, String taskData) {
        jedis.xadd("task-stream", StreamEntryID.NEW_ENTRY,
            Map.of("taskType", taskType,
                   "taskData", taskData,
                   "status", "pending"));
    }
}

// 任务执行
public class TaskWorker {

    public void work(String workerId) {
        while (true) {
            List<Map.Entry<String, List<StreamEntry>>> results =
                jedis.xreadGroup("task-group", workerId,
                    XReadGroupParams.xReadGroupParams().count(1).block(Duration.ofSeconds(5)),
                    new StreamEntryID(StreamEntryID.UNRECEIVED_ENTRY), "task-stream");

            if (results != null) {
                for (var entry : results) {
                    for (StreamEntry msg : entry.getValue()) {
                        executeTask(msg.getFields());
                        jedis.xack("task-stream", "task-group", msg.getID());
                    }
                }
            }
        }
    }
}
```

## 8、注意事项与最佳实践

### 8.1、消息ID设计

- 使用自动生成的 ID（`*`）最可靠
- 如果必须手动指定，确保 ID 递增
- 推荐使用时间戳格式：`timestamp-sequenceNumber`

### 8.2、消费者组设计

- 消费者组名在同一 Stream 内必须唯一
- 消费者名在消费者组内必须唯一
- 定期检查并处理 Pending 消息

### 8.3、性能优化

```bash
# 批量读取消息，减少网络往返
XREADGROUP GROUP mygroup consumer1 COUNT 100 STREAMS mystream ">"

# 使用近似裁剪代替精确裁剪
XTRIM mystream MAXLEN ~= 10000

# 避免大 Stream，定期归档历史消息
```

### 8.4、监控指标

```bash
# 监控 Stream 长度
XLEN mystream

# 监控消费者组状态
XINFO GROUPS mystream

# 监控 Pending 消息
XPENDING mystream mygroup
```

## 9、常见问题

### 9.1、消息丢失怎么办？

1. 使用 XACK 确认消息
2. 定期检查 XPENDING
3. 使用 XCLAIM 转移超时消息

### 9.2、消费者挂了怎么办？

1. 消息会保留在 Pending 列表
2. 其他消费者可以通过 `XREADGROUP ... "0"` 读取 Pending 消息
3. 使用 XCLAIM 转移超时未处理的消息

### 9.3、如何保证消息不重复消费？

1. 消费者端实现幂等性
2. 使用唯一消息 ID 或业务 ID 进行去重

### 9.4、消息积压怎么处理？

1. 增加消费者数量
2. 优化消息处理速度
3. 考虑消息分层处理
