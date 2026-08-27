# Spring 生态

> 预计阅读：约 28 分钟（正文约 8763 字）
> 阅读建议：按 Core -> MVC -> Boot -> 事务 -> Cloud -> Security -> 手写源码 -> 项目落地的顺序阅读；SSM 与 Spring Boot + Vue 部署内容已从 Java 基础迁入本文。

---

## 一、核心概述

Spring 是 Java 生态事实标准的**企业级应用框架**，从单个 IoC 容器发展为覆盖 Web、数据访问、安全、微服务、观测的全家桶：

| 组件 | 用途 |
|---|---|
| **Spring Framework** | 核心：IoC 容器 + AOP + 事务 |
| **Spring Boot** | 快速启动，约定大于配置，自动装配 |
| **Spring MVC** | Web 框架（RESTful / 模板渲染） |
| **Spring Data** | 数据访问（JPA / Redis / Mongo） |
| **Spring Security** | 认证授权 |
| **Spring Cloud** | 微服务套件（注册发现 / 网关 / 配置 / 熔断） |
| **Spring AI** | LLM 应用框架（ChatClient / Tool Calling / RAG） |

## 二、Spring Core：IoC / DI / AOP

- **IoC（控制反转）**：对象的创建与生命周期交给容器管理，业务代码只声明依赖；
- **DI（依赖注入）**：实现 IoC 的方式，构造器注入（推荐）/ Setter 注入 / 字段注入（`@Autowired`）；
- **AOP（面向切面）**：横切逻辑（日志、事务、权限）与业务解耦；底层 JDK 动态代理（基于接口）或 CGLIB（子类继承）；
- **Bean 生命周期**：实例化 → 属性填充 → 初始化（`@PostConstruct` / `InitializingBean`）→ 使用 → 销毁；
- **循环依赖**：三级缓存（singletonObjects / earlySingletonObjects / singletonFactories）支撑构造器注入无法解决的早期引用暴露。

### 2.1 容器体系：BeanFactory 与 ApplicationContext

| 对比维度 | BeanFactory | ApplicationContext |
|---|---|---|
| 定位 | IoC 容器最顶层接口，只定义获取 Bean 的基本功能规范 | 高级容器，最终默认实现为 DefaultListableBeanFactory |
| 加载时机 | 延迟加载，getBean 时才创建 Bean | 初始化时即全部加载 |
| 扩展服务 | 无 | AOP 集成、事件发布（ApplicationEventPublisher）、国际化（MessageSource）、资源访问（ResourcePatternResolver）、Environment 抽象 |

> 二者的区别是高频面试题：BeanFactory 只管「拿 Bean」，ApplicationContext 在此之上补齐了企业级服务。

### 2.2 Bean 作用域与线程安全

| 作用域 | 行为 |
|---|---|
| singleton（默认） | 容器创建前先查缓存，保证全容器唯一实例 |
| prototype | 每次 getBean 都新建实例 |
| Web 环境扩展 | request / session / application / websocket |

- 实际开发绝大多数 Bean 是单例，无需配置 scope；
- **Bean 是否线程安全（面试题）**：Bean 本质是用户自己写的类，Spring 只负责创建与持有实例，不保证线程安全；无状态 Bean 天然安全，有状态单例 Bean 需自行保证并发安全。

### 2.3 Bean 注册与实例化扩展：@Import / FactoryBean / BFPP / BPP

- **@Import**：导入没有 `@Component` 注解的类；`ImportSelector` / Registrar 编程式决定注册哪些 Bean（自动装配的底层机制）；
- **FactoryBean**：实现 `FactoryBean<T>` 的 Bean 是工厂 Bean，getBean 拿到的是 `getObject()` 返回的产品对象（`SqlSessionFactoryBean` 即此机制）；与 BeanFactory 的区别是经典面试题，也是 Spring 整合第三方的常用入口；
- 两个容器级扩展点：

| 扩展点 | 时机 | 作用 |
|---|---|---|
| BeanFactoryPostProcessor | Bean 注册后、实例化前 | 修改 BeanDefinition（容器级扩展） |
| BeanPostProcessor | 实例化后（初始化回调前后） | 修改或替换 Bean 对象，是 AOP 生成代理的切入点 |

### 2.4 AOP 拦截器链执行机制

- 通知模型为 `Map<Method, List<Advice>>`；
- 核心是 `MethodInterceptor.invoke()` 与 `MethodInvocation.proceed()`：`proceed()` 递归串联整个拦截器链；
- 前置通知先 before 再 proceed，后置通知先 proceed 再 after，链走完才执行目标方法。

```java
// 拦截器骨架
Object invoke(MethodInvocation invocation) throws Throwable {
    before();                               // 前置通知
    Object result = invocation.proceed();   // 递归进入下一层拦截器，链尾执行目标方法
    after();                                // 后置通知
    return result;
}
```

### 2.5 循环依赖：三级缓存为什么是三级

| 缓存 | 存放 |
|---|---|
| 一级 singletonObjects | 成品对象 |
| 二级 earlySingletonObjects | 半成品（未填充属性）对象 |
| 三级 singletonFactories | 工厂（代理）对象 |

- 第三级主要为解决 **AOP 场景**的循环依赖；
- 若把代理对象的创建提前，二级缓存即可——但那违背 Spring「先初始化普通 Bean 再处理代理」的设计原则；
- 「为什么不是二级缓存」是三级缓存的标准面试追问。

## 三、Spring MVC

| 组件 | 职责 |
|---|---|
| DispatcherServlet | 前端控制器，统一接收请求 |
| HandlerMapping | URL → Method 映射，定位处理器 |
| HandlerAdapter | 完成动态参数适配并调用方法 |
| ViewResolver | 视图解析渲染 |

MVC 共九大组件，上表三者为核心。

### 3.1 工作流程

- **启动初始化**：创建 WebApplicationContext → 加载 Controller → 注册 `@RequestMapping` 映射；
- **单次请求**：前端控制器统一接收 → 路径匹配方法 → 执行 → `@ResponseBody` 直接写回。

```text
请求 → DispatcherServlet → HandlerMapping → HandlerAdapter(调方法) → ViewResolver 渲染 / @ResponseBody 写回
```

### 3.2 常用注解与参数绑定

- `@RestController` = `@Controller` + `@ResponseBody`；映射用 `@GetMapping` 等；`@Validated` 做参数校验；

| 参数注解 | 接收内容 |
|---|---|
| @RequestParam | url / 表单参数 |
| @RequestBody | JSON 请求体 |
| @PathVariable | RESTful 路径参数（`{id}`） |

- 参数多于 1 个时以 JSON 为主，故 @RequestBody 最常用。

### 3.3 拦截器 Interceptor 与 Filter

- Interceptor 属 SpringMVC，仅拦截控制器方法；核心原理是 AOP，可在方法前后增强并阻断执行；
- Filter 属 Servlet 技术，拦截所有访问；
- 二者对比是面试经典题。

### 3.4 全局异常处理：@RestControllerAdvice + @ExceptionHandler

- 控制器抛异常后终止原方法，转入通知类统一处理，返回统一 Result / 异常编码；
- `@RestControllerAdvice` 自带 `@ResponseBody` 与 `@Component`；
- 可按异常类型定义多个处理方法（自定义业务异常体系）；生产接口标配。

```java
@RestControllerAdvice  // 自带 @ResponseBody 与 @Component
public class GlobalExceptionHandler {
    @ExceptionHandler(BizException.class)  // 可按异常类型定义多个处理方法
    public Result handle(BizException e) { /* 返回统一 Result / 异常编码 */ }
}
```

## 四、Spring Boot

### 4.1 自动装配

```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`；
- `@EnableAutoConfiguration` 读取 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`（Boot 3.x；2.x 用 `spring.factories`）；
- 条件装配注解：`@ConditionalOnClass` / `@ConditionalOnMissingBean` / `@ConditionalOnProperty`。

**自定义 starter 开发套路**（与自动装配构成闭环）：

- autoconfigure 模块开发 `@Bean` + `@ConditionalOn*` 自动配置类，经 `spring.factories`（2.x）/ `AutoConfiguration.imports`（3.x）挂载；
- starter 模块只做依赖聚合；
- `configuration-processor` 生成配置提示；
- `spring.autoconfigure.exclude` 禁用指定自动配置。

### 4.2 Actuator 生产监控

Actuator 是 Spring Boot 的**生产级监控与管理模块**：加 `spring-boot-starter-actuator` 依赖即自动暴露一组 HTTP/JMX 端点，不写监控代码就能观测运行中应用的内部状态。

**核心端点**：

| 端点 | 作用 |
|---|---|
| `/actuator/health` | 健康状态，聚合所有 HealthIndicator（DB/Redis/磁盘/MQ）；K8s 探针与负载均衡摘流的标准依据 |
| `/actuator/metrics` | 运行指标：JVM 内存/GC、HTTP QPS 与耗时、连接池等，可按 tag 钻取 |
| `/actuator/info` | 应用版本、构建时间、Git 提交 |
| `/actuator/env` | 全部环境属性来源与覆盖顺序（含敏感信息，慎暴露） |
| `/actuator/beans` / `mappings` | 容器 Bean、URL 路由映射 |
| `/actuator/threaddump` / `heapdump` | 线程栈 / 下载堆转储（OOM 排查） |
| `/actuator/loggers` | 查看并**动态修改**日志级别（不重启） |
| `/actuator/prometheus` | Prometheus 抓取格式输出全部指标 |

**暴露控制与安全**（默认仅 Web 暴露 health）：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
        exclude: env,beans
  endpoint:
    health:
      show-details: when-authorized
```

- 生产环境禁 `include: "*"`，至少排除 `env`、`heapdump`（泄敏风险）；
- 配合 Spring Security 认证，或独立 `management.port` + 内网隔离；
- K8s：`management.endpoint.health.probes.enabled=true` 生成 `/health/liveness` 与 `/health/readiness`。

**扩展**：自定义 `HealthIndicator` 把下游依赖纳入健康聚合；Micrometer `MeterRegistry` 打业务指标；`@Endpoint` 自定义端点。

> 💡 补充：Actuator 是微服务可观测性的事实标准底座--`/health` 供探针、`/prometheus` 供抓取、`/loggers` 供线上动态排障，配套 Grafana 即可搭建零侵入监控大盘。

### 4.3 起步依赖与 parent

| 机制 | 内容 | 解决的问题 |
|---|---|---|
| parent | `spring-boot-starter-parent` 继承 `spring-boot-dependencies`，经 dependencyManagement 统一管理几百个依赖版本（锁版本号而非引入依赖） | 依赖冲突 |
| starter | 技术依赖固定组合（`spring-boot-starter-web` 一个顶多个），命名 `spring-boot-starter-*` | 依赖配置多 |

- 二者合起来是「约定大于配置」的落地基础；
- Maven 侧一句话：compile / test / provided / runtime 决定依赖在编译/测试/运行阶段的可见性与是否打入包（junit=test、lombok/servlet-api=provided）；依赖传递与可选/排除依赖、聚合（管构建）与继承（管依赖复用）属 Maven 主题，见「09-开发工具」主线。

### 4.4 配置文件与加载优先级

- 格式优先级：**properties > yml > yaml**；
- 位置共 4 级，叠加覆盖（高 → 低）：`file:config/` > `file:` > `classpath:config/` > `classpath:`；
- 命令行临时属性优先于配置文件（外部配置共 14 种来源）；
- `spring.config.name` / `spring.config.location` 自定义配置文件名与位置。

**日志使用与配置**：

- 默认 **SLF4J + Logback**，类上加 `@Slf4j` 即可打日志；
- `logging.level.root` / 具体包名 / 日志组控制级别；
- `logging.file.name` 落盘，配套 rollingpolicy 滚动策略。

### 4.5 多环境 Profile

- yaml 用 `---` 分块 + `spring.config.activate.on-profile`，或多文件 `application-{env}.yml` + `spring.profiles.active` 激活；
- Boot 2.4+ 用 `spring.profiles.group` 替代 include；
- 与 Maven profile 联动：配置文件里写 `@profile.active@` 占位符。

### 4.6 配置绑定：@ConfigurationProperties

| 读配置方式 | 特点 |
|---|---|
| `@Value` | 单值，不支持宽松绑定 |
| `Environment` | 直接读取环境属性 |
| `@ConfigurationProperties(prefix)` | 批量绑定到对象 |

- 宽松绑定兼容四种命名风格，但前缀必须是 kebab-case；
- `@EnableConfigurationProperties` 注册绑定类；
- `@Validated` + JSR303 校验配置合法性；
- 与 `@Value` 的区别是高频面试题。

### 4.7 内嵌容器与可执行 jar

- 内嵌 Tomcat 由 starter-web 传递引入，以普通 Bean 运行在容器中；
- 可替换为 jetty / undertow；
- 打包为 fat jar，直接 `java -jar` 运行。

### 4.8 启动流程与事件机制

- **构造阶段**：推断应用类型，加载 Initializer / Listener；
- **run() 阶段**依次：`prepareEnvironment` → `createApplicationContext` → `prepareContext` → `refreshContext` → `callRunners`（回调 ApplicationRunner / CommandLineRunner）；
- 全程通过事件机制暴露扩展点；经典面试题。

### 4.9 缓存与定时任务

**缓存注解**：

- `@EnableCaching` 开启；
- `@Cacheable(value, key)` 命中直接返回，配套 `@CachePut` / `@CacheEvict`；
- CacheManager 可切换实现（Redis / jetcache 等）。

**定时任务**：

- `@EnableScheduling` + `@Scheduled(cron)` 即可，可配线程池；
- Quartz 把 JobDetail / Trigger 注册为 Bean。

### 4.10 数据访问整合：MyBatis / MyBatis-Plus / 连接池

**Spring 整合 MyBatis 机制**：

- `SqlSessionFactoryBean` 封装 SqlSessionFactory 环境纳入容器；
- `MapperScannerConfigurer`（Boot 下 `@MapperScan`）扫描 Dao 接口生成代理对象存入 IoC，业务层直接注入 Mapper。

**`#{}` 与 `${}` 占位符**：

| 占位符 | 机制 | 注入风险 |
|---|---|---|
| `#{}` | 替换为 `?`，走 PreparedStatement 预编译 | 防注入 |
| `${}` | 字符串拼接，走 Statement | 有注入风险 |

- 开发一律 `#{}`；表名、order by 列名等无法预编译的场景才用 `${}`，且须白名单校验。

**动态 SQL 与注解 / XML 选型**：

- 动态 SQL：if、where、choose（when / otherwise）、trim（set）、foreach，按条件拼接 SQL；
- 官方结论：注解完成简单功能（`@Select` / `@Insert` / `@Update` / `@Delete`），配置文件完成复杂功能--动态 SQL 用注解需 SQL 构建器，可读性差。

**MyBatis-Plus**：

- 定位「只做增强不做改变」：Mapper 继承 `BaseMapper<T>`、Service 继承 `IService<T>` / `ServiceImpl<M, T>`，即得全套免 SQL 的 CRUD；
- 分页必须注册 `MybatisPlusInterceptor` + `PaginationInnerInterceptor` 拦截器 Bean 并用 Page 对象，否则分页完全不生效（经典坑）。

**MP 企业特性**：

| 特性 | 注解 | 作用 |
|---|---|---|
| 逻辑删除 | `@TableLogic` | 将删除转为 update 状态字段，数据保留 |
| 乐观锁 | `@Version` | version 字段 CAS 式更新（秒杀并发） |
| 主键策略 | `@TableId` | 雪花 ASSIGN_ID / 自增，可 global-config 全局配置 |

**连接池选型：HikariCP vs Druid**：

| | HikariCP | Druid |
|---|---|---|
| 定位 | 以快著称 | 为监控而生 |
| 要点 | Boot 2.x 起默认；字节码优化、无锁 ConcurrentBag | 监控页、wall 防 SQL 注入、密码加密 |

## 五、Spring 事务

- **声明式事务**：`@Transactional` 基于 AOP 代理，同类内部方法调用不经过代理会导致事务失效（经典坑）；
- **传播行为**（重点，详见归档《Spring事务传播原理》）：
  - `REQUIRED`（默认）：有则加入，无则新建；
  - `REQUIRES_NEW`：挂起当前事务，独立新事务；
  - `NESTED`：嵌套事务（保存点回滚）；
  - `SUPPORTS` / `NOT_SUPPORTED` / `MANDATORY` / `NEVER`；
- **失效场景**：非 public 方法、自调用、异常被 catch 吞掉、默认只回滚 `RuntimeException`（`rollbackFor` 指定）；
- **数据库侧**：与 MySQL InnoDB 隔离级别（RR/RC）配合理解，长事务的 undo 膨胀问题见「计算机系统与并发」导出一致性小节。

## 六、Spring Cloud 微服务

- **服务注册发现**：Nacos（国内主流）/ Eureka / Consul；
- **配置中心**：Nacos / Spring Cloud Config；
- **API 网关**：Spring Cloud Gateway（Zuul 已停维）；
- **熔断降级**：Sentinel / Resilience4j（Hystrix 已停维）；
- **负载均衡**：Spring Cloud LoadBalancer（Ribbon 已停维）；
- Spring Cloud Alibaba 系已是国内微服务默认选择，Nacos 单集群同时承担注册中心 + 配置中心（搭建笔记见归档 springcloud 目录）。

### 6.1 注册发现与心跳机制

- 服务启动时注册到注册中心；消费者按服务名拉取实例列表，负载均衡选实例调用；
- 提供者默认 **30s** 发一次心跳，超时未续约被剔除；
- Eureka / Nacos 同遵此模型。

### 6.2 Nacos 分级存储模型

- 三级模型：**服务 service → 集群 cluster → 实例 instance**；
- NacosRule 同集群优先；权重控制流量（权重 0 则永不访问）；namespace 做环境隔离；
- 实例类型：临时实例靠心跳剔除；非临时实例由服务端主动检测、不剔除；
- CAP：Nacos 默认 AP，含非临时实例时转 CP（Eureka 纯 AP）；支持服务列表变更推送。

### 6.3 Nacos 配置中心与热更新

- dataId = `服务名-profile.yaml`；`bootstrap.yaml` 先于 `application.yml` 加载；
- 热更新：`@RefreshScope` 或 `@ConfigurationProperties`；
- 无 profile 的服务名配置跨环境共享；优先级 **nacos 环境 > nacos 共享 > 本地**。

### 6.4 Nacos 集群架构

- 生产至少 **3 节点** + nginx 反向代理统一入口；
- 数据须从内嵌 Derby 换为外置 MySQL（官方推荐主从）；
- `cluster.conf` 声明节点列表，多机部署容灾。

### 6.5 Gateway：路由 / 断言 / 过滤器

- 路由 = id + uri（`lb://服务名` 即负载均衡）+ predicates + filters；
- 断言工厂：Path / Method / Header 等；
- `GatewayFilter` 配置式加工请求头，`GlobalFilter` 写代码做登录校验 / 限流；
- 三类过滤器按 order 合并成链。

### 6.6 OpenFeign 声明式远程调用

```java
@FeignClient("user-service")   // 按服务名声明
public interface UserClient {
    @GetMapping("/user/{id}")
    User getById(@PathVariable("id") Long id);
}
```

- SpringMVC 注解声明接口即得远程调用，替代 RestTemplate 硬编码 URL；
- 优化：换用 HttpClient / OKHttp 连接池。

## 七、Spring Security 与 JWT 认证

### 7.1 认证过滤链（无状态 + JWT 集成）

- `SecurityFilterChain` 配置：禁 csrf / formLogin，`SessionCreationPolicy.STATELESS` 切无状态；
- `permitAll` 配白名单，`anyRequest().authenticated()` 兜底；
- 自定义 `OncePerRequestFilter` 校验 JWT 后写入 `SecurityContextHolder`；
- 密码加密用 `BCryptPasswordEncoder`。

```java
http.csrf(csrf -> csrf.disable())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(a -> a
        .requestMatchers("/login").permitAll()   // 白名单
        .anyRequest().authenticated());
```

### 7.2 JWT 结构与验证原理

- 三段式：**Header.Payload.Signature**；
- payload 含 iss / sub / exp 等 7 个标准声明；
- 验证：服务端用密钥按 header 声明的算法重算签名并比对，同时检查 exp；
- 无状态、免服务端存储，适配微服务横向扩展。

## 八、源码学习线：手写 Spring

归档 `old-spring-notes/` 保留了一条完整的学习路径，值得按序重读：

1. **300 行手写简易 Spring**：最小 IoC 容器（BeanDefinition / 反射创建 / DI）；
2. **手写完整功能 Spring**：补充 AOP、BeanPostProcessor、循环依赖三级缓存；
3. **Spring 源码解析**：对照真实源码（`refresh()` 流程 / `getBean()`）验证手写理解；
4. **事务传播原理**：源码级拆解 `@Transactional` 与数据库事务的协作。

> 💡 补充：手写一遍再读源码，比直接啃源码效率高一个量级--先建立"容器在做什么"的心智模型，再看真实实现如何处理边界。

## 九、从 SSM 到项目落地

> 本节迁入自原 `Java 与 JVM` 文档中的 Spring/SSM/Boot 项目内容，避免 Java 基础篇继续混入框架主线。

### 9.1 SSM 整合

- SSM = Spring + Spring MVC + MyBatis。
- 配置文件：`web.xml` / `applicationContext.xml` / `spring-mvc.xml` / `mybatis-config.xml`。
- Maven 管理依赖，工程分层通常为 Controller / Service / DAO / Mapper。

**Servlet 与 Servlet 容器**：

- Servlet 是处理 HTTP 请求的 API 标准，需要 Tomcat / Jetty / JBoss / Glassfish 等 Servlet 容器承载运行。
- 容器根据 `web.xml` 或注解映射请求到 Servlet。
- 生命周期：init / service / destroy。
- JSP 本质是运行期被编译成 Servlet 的视图技术，HttpServlet 是其高级封装。

### 9.2 Spring Boot + Vue 前后端分离部署

**Nginx 部署 Vue**：

- 静态资源 alias 指向打包目录。
- `try_files $uri $uri/ /index.html` 用于解决 history 路由刷新 404。

**Nginx 反向代理与 WebSocket 代理**：

- 后端接口走独立二级域名，`proxy_pass` 到本地端口。
- WebSocket 需加 `proxy_http_version 1.1`、`Upgrade`、`Connection` 头，并调大 `proxy_read_timeout`，避免长连接被默认 60 秒超时切断。
- Java 侧可用 `nohup java -jar -Dspring.profiles.active=prod app.jar` 后台部署。

**单点登录 token + Redis**：

- 登录后生成 token 存 Redis，便于主动失效登录态。
- 前端携带 token，后端通过 HandlerInterceptor 统一校验。
- 这与无状态 JWT 是两种不同选型：Redis token 强在可控失效，JWT 强在减少中心化状态依赖。

**Long 精度丢失全局处理**：

- 雪花 ID 等 Long 值超出 JS Number 安全整数范围会导致前端精度丢失。
- 可通过 Jackson 全局注册 ToStringSerializer，将 Long 序列化为字符串。

### 9.3 和 Java 基础篇的边界

- Java 基础篇只保留语言、集合、异常、并发入门与 Java 项目入口。
- SSM、Spring Boot、Spring Cloud、事务、Security、项目部署统一在本文维护。
- JVM 的类加载、GC、调优与 javaagent 运行机制见 [JVM 运行机制](/md/01-计算机基础/05-JVM运行机制.md)。

## 十、2026 年 Spring 生态现状

| 维度 | 现状 |
|---|---|
| 主线 | Spring Boot 3.5（生产主力）与 4.x（基线 Java 17+，配 Spring Framework 7）并行 |
| Java | 21 LTS 主流，25 LTS 逐步采用；虚拟线程（Loom）与 WebFlux 并存 |
| 云原生 | GraalVM Native Image / Buildpacks / Spring Boot 3+ AOT 成熟 |
| AI | Spring AI 进入主流视野：ChatClient 抽象、Tool Calling、RAG、多模型适配 |
| 微服务 | Spring Cloud Alibaba 系主导国内；网格化（Istio）分担了部分框架治理职能 |

---

## 📚 完整资料（归档索引）

### old-spring-notes/（源码与原理主线）

- [1-300行手写简易Spring.md](../archive/old-spring-notes/1-300行手写简易Spring.md)
- [2-手写完整功能Spring.md](../archive/old-spring-notes/2-手写完整功能Spring.md)
- [3-Spring源码解析.md](../archive/old-spring-notes/3-Spring源码解析.md)
- [4-Spring事务传播原理及数据库事务操作原理.md](../archive/old-spring-notes/4-Spring事务传播原理及数据库事务操作原理.md)

### old-java-notes/spring系列学习/（入门与 SSM）

- [spring.md](../archive/old-java-notes/spring系列学习/spring.md) / [IOC和AOP.md](../archive/old-java-notes/spring系列学习/IOC和AOP.md) / [spring-依赖注入.md](../archive/old-java-notes/spring系列学习/spring-依赖注入.md)
- SSM 整合系列：[Spring](../archive/old-java-notes/spring系列学习/ssm整合学习-Spring.md) / [SpringMVC](../archive/old-java-notes/spring系列学习/ssm整合学习-SpringMVC.md) / [SpringBoot](../archive/old-java-notes/spring系列学习/ssm整合学习-SpringBoot.md) / [Mybatis](../archive/old-java-notes/spring系列学习/ssm整合学习-Mybatis.md) / [MybatisPlus](../archive/old-java-notes/spring系列学习/ssm整合学习-MabtisPlus.md) / [Maven](../archive/old-java-notes/spring系列学习/ssm整合学习-Maven.md)

### old-java-notes/springboot/（实战）

- [SpringBoot实战和原理.md](../archive/old-java-notes/springboot/SpringBoot实战和原理.md)
- [Java 后端.md](../archive/old-java-notes/springboot/Java%20后端.md)

### old-java-notes/springcloud/（微服务）

- [SpringCloud.md](../archive/old-java-notes/springcloud/SpringCloud.md)
- [Nacos安装指南.md](../archive/old-java-notes/springcloud/Nacos安装指南.md) / [nacos集群搭建.md](../archive/old-java-notes/springcloud/nacos集群搭建.md)

### old-java-notes/AIcloud项目/（Spring 相关）

- [2.SpringAI中文参考文档.md](../archive/old-java-notes/AIcloud项目/2.SpringAI中文参考文档.md)
- [4.MyBatisPlus学习资料.md](../archive/old-java-notes/AIcloud项目/4.MyBatisPlus学习资料.md)
- [5.JWT学习资料.md](../archive/old-java-notes/AIcloud项目/5.JWT学习资料.md)
- [6.SpringSecurity使用.md](../archive/old-java-notes/AIcloud项目/6.SpringSecurity使用.md)

---


## 📚 完整资料

> **原文归档**：[`archive/old-spring-notes/`](/md/archive/README?id=old-spring-notes)（手写 Spring / 源码解析 / 事务传播）+ [`archive/old-java-notes/`](/md/archive/README?id=old-java-notes)（spring系列学习 / springboot / springcloud / AIcloud 项目）
>
> 从「Java 与 JVM」的 Spring 概览小节扩展为独立主线，沉淀 Spring 全家桶知识并索引全部归档资料。

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-23 | 新增 | 新建文档：从 Java 与 JVM 的 Spring 概览扩展为独立主线；新增 Actuator 生产监控小节；建立全量 Spring 归档索引（old-spring-notes + old-java-notes 四个子目录） |
| 2026-08-23 | 新增 | 依据归档核对补全缺失知识点：新增「三、Spring MVC」「七、Spring Security 与 JWT 认证」两章（后续章节号顺延）；Spring Core 补容器体系、作用域与线程安全、@Import/FactoryBean/BFPP/BPP、AOP 拦截器链、三级缓存原理；Spring Boot 新增起步依赖与 parent、配置文件优先级、Profile、配置绑定、内嵌容器、启动流程、自定义 starter、缓存与定时、日志、数据访问整合（MyBatis / MyBatis-Plus / 连接池）；Spring Cloud 补注册心跳、Nacos 分级模型/配置中心/集群、Gateway、OpenFeign；AIcloud 归档索引补 MyBatisPlus 与 JWT 两篇 |
| 2026-08-26 | 重构 | 统一前置阅读时间/建议，原文归档移至文末 |
| 2026-08-26 | 重构 | 按 Java/JVM 拆分边界迁入 SSM 整合、Servlet 容器与 Spring Boot + Vue 部署内容，Spring 主线聚焦 Core、MVC、Boot、事务、Cloud、Security 与项目落地 |
