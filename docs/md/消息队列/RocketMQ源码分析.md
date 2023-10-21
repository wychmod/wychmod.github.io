# 1. RocketMQ源码

## 1.1 源码目录介绍
- **broker**：顾名思义，这个里面存放的就是RocketMQ的Broker相关的代码，这里的代码可以用来启动Broker进程
- **client**：顾名思义，这个里面就是RocketMQ的Producer、Consumer这些客户端的代码，生产消息、消费消息的代码都在里面
- **common**：这里放的是一些公共的代码
- **dev**：这里放的是开发相关的一些信息
- **distribution**：这里放的就是用来部署RocketMQ的一些东西，比如bin目录 ，conf目录，等等
- **example**：这里放的是RocketMQ的一些例子
- **filter**：这里放的是RocketMQ的一些过滤器的东西
- **logappender和logging**：这里放的是RocketMQ的日志打印相关的东西
- **namesvr**：这里放的就是NameServer的源码
- **openmessaging**：这是开放消息标准，这个可以先忽略
- **remoting**：这个很重要，这里放的是RocketMQ的远程网络通信模块的代码，基于netty实现的
- **srvutil**：这里放的是一些工具类
- **store**：这个也很重要，这里放的是消息在Broker上进行存储相关的一些源码
- **style、test、tools**：这里放的是checkstyle代码检查的东西，一些测试相关的类，还有就是tools里放的一些命令行监控工具类

## 1.2 Intellij IDEA中启动NameServer


![](笔记引用/在Intellij%20IDEA中启动NameServer.pdf)

## 1.3 在Intellij IDEA中启动Broker

![](笔记引用/在Intellij%20IDEA中启动Broker.pdf)

## 1.4 可视化rocketmq-dashboard

https://github.com/apache/rocketmq-dashboard

## 1.5 源码分析-NameServer的启动

### 1.5.1 NameServer脚本的启动

首先看启动脚本 mqnamesrv 
```shell
# 在最后调用
sh ${ROCKETMQ_HOME}/bin/runserver.sh org.apache.rocketmq.namesrv.NamesrvStartup $@
```

然后看最后命令行中调用runserver.sh
```shell
JAVA_OPT="${JAVA_OPT} -server -Xms4g -Xmx4g -Xmn2g -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"JAVA_OPT="${JAVA_OPT} -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSInitiatingOccupancyFraction=70 -XX:+CMSParallelRemarkEnabled -XX:SoftRefLRUPolicyMSPerMB=0 -XX:+CMSClassUnloadingEnabled -XX:SurvivorRatio=8  -XX:-UseParNewGC"JAVA_OPT="${JAVA_OPT} -verbose:gc -Xloggc:${GC_LOG_DIR}/rmq_srv_gc_%p_%t.log -XX:+PrintGCDetails"  
JAVA_OPT="${JAVA_OPT} -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=30m"JAVA_OPT="${JAVA_OPT} -XX:-OmitStackTraceInFastThrow"JAVA_OPT="${JAVA_OPT} -XX:-UseLargePages"JAVA_OPT="${JAVA_OPT} -Djava.ext.dirs=${JAVA_HOME}/jre/lib/ext:${BASE_DIR}/lib"  
#JAVA_OPT="${JAVA_OPT} -Xdebug -Xrunjdwp:transport=dt_socket,address=9555,server=y,suspend=n"  
JAVA_OPT="${JAVA_OPT} ${JAVA_OPT_EXT}"  
JAVA_OPT="${JAVA_OPT} -cp ${CLASSPATH}"  
  
$JAVA ${JAVA_OPT} $@
```

大致可以简化成：

java -server -Xms4g -Xmx4g -Xmn2g org.apache.rocketmq.namesrv.NamesrvStartup

本质就是基于java命令启动了一个JVM进程，执行NamesrvStartup类中的main()方法，完成NameServer启动的全部流程和逻辑，同时启动NameServer这个JVM进程的时候，有一大堆的默认JVM参数，你当然可以在这里修改这些JVM参数，甚至进行优化。

![](../youdaonote-images/Pasted%20image%2020231017232635.png)

### 1.5.2 NameServer启动时解析配置信息和Netty服务器启动

#### 1.5.2.1 NamesrvController组件
- NameServer中的核心组件 用来接受网络请求  
```java
public static void main(String[] args) {  
    main0(args);  
}  
  
public static NamesrvController main0(String[] args) {  
  
    try {  
        // NameServer中的核心组件 用来接受网络请求  
        NamesrvController controller = createNamesrvController(args);  
        start(controller);  
        String tip = "The Name Server boot success. serializeType=" + RemotingCommand.getSerializeTypeConfigInThisServer();  
        log.info(tip);  
        System.out.printf("%s%n", tip);  
        return controller;  
    } catch (Throwable e) {  
        e.printStackTrace();  
        System.exit(-1);  
    }  
  
    return null;  
}
```

![](../youdaonote-images/Pasted%20image%2020231018140716.png)
- 创建 NamesrvController 的源码

```java
public static NamesrvController createNamesrvController(String[] args) throws IOException, JoranException {  
    // 解析Commandline命令行参数，不重要  

	// 初始化nameserver配置和netty配置，以及设置端口
    final NamesrvConfig namesrvConfig = new NamesrvConfig();  
    final NettyServerConfig nettyServerConfig = new NettyServerConfig();  
    nettyServerConfig.setListenPort(9876);  
    ...
}
```

![](../youdaonote-images/Pasted%20image%2020231018141530.png)

- NamesrvConfig和NettyServerConfig两个核心类的内容
```java
public class NamesrvConfig {  
    private static final InternalLogger log = InternalLoggerFactory.getLogger(LoggerName.NAMESRV_LOGGER_NAME);  
  
    // 获取RocketMQ的home目录，获取环境变量中的ROCKETMQ_HOME_ENV  
    private String rocketmqHome = System.getProperty(MixAll.ROCKETMQ_HOME_PROPERTY, System.getenv(MixAll.ROCKETMQ_HOME_ENV));  
    // NameServer存放kv配置属性的路径  
    private String kvConfigPath = System.getProperty("user.home") + File.separator + "namesrv" + File.separator + "kvConfig.json";  
    // NameServer自己的配置存储路径  
    private String configStorePath = System.getProperty("user.home") + File.separator + "namesrv" + File.separator + "namesrv.properties";  
    // 生产环境的名称，他是默认的center  
    private String productEnvName = "center";  
    // 是否启动了clusterTest测试集群，默认是false  
    private boolean clusterTest = false;  
    // 是否支持有序消息，默认就是false,不支持的  
    private boolean orderMessageEnable = false;
}

public class NettyServerConfig implements Cloneable {  
    // NettyServer默认的监听端口号，是8888，在代码里设置成9876了  
    private int listenPort = 8888;  
    // Netty工作线程的数量，默认是8  
    private int serverWorkerThreads = 8;  
    // Netty的public线程池的线程数量，默认是0  
    private int serverCallbackExecutorThreads = 0;  
    // 这是Netty的IO线程池的线程数量，默认是3，这里的线程是负责解析网路请求的  
    // 他这里的线程解析完网铬请求之后，就会把请求转发给wok线程来处理  
    private int serverSelectorThreads = 3;  
    // brokeri端的参数  
    // broker端在基于netty构建网络服务器的时候，会使用下面两个参数  
    private int serverOnewaySemaphoreValue = 256;  
    private int serverAsyncSemaphoreValue = 64;  
    // 如果一个网路连接空闲超过120s,就会被关闭  
    private int serverChannelMaxIdleTimeSeconds = 120;  
  
    // socket send buffer缓冲区以及receive buffer缓冲区的大小  
    private int serverSocketSndBufSize = NettySystemConfig.socketSndbufSize;  
    private int serverSocketRcvBufSize = NettySystemConfig.socketRcvbufSize;  
    // ByteBuffer是否开启缓存，默认是开启的  
    private boolean serverPooledByteBufAllocatorEnable = true;  
  
    // 是否启动epoll I0模型，默认是不开启的  
    private boolean useEpollNativeSelector = false;
    }
```

- NameServer的核心配置如何进行解析
```java
// 这段代码意思就是说，如果你用mgnamesrv启动的时候，带上了“-c这个选项  
// 那么“-c”这个选型意思就是带上一个配置文件的地址  
// 接着他就可以读取那个配置文件里的内容了  
if (commandLine.hasOption('c')) {  
    String file = commandLine.getOptionValue('c');  
    if (file != null) {  
        // 基于输入流从配置文件里读取了配置  
        // 读取的配置会放入一个Properties里去  
        InputStream in = new BufferedInputStream(new FileInputStream(file));  
        properties = new Properties();  
        properties.load(in);  
        // 基于工具类，把读取到的配置都放入到两个核心配置类里去了  
        MixAll.properties2Object(properties, namesrvConfig);  
        MixAll.properties2Object(properties, nettyServerConfig);  
  
        namesrvConfig.setConfigStorePath(file);  
  
        System.out.printf("load config properties file OK, %s%n", file);  
        in.close();  
    }  
}
```

```java
// 下面这段代码，其实就是说，你的mgnamesrv如果带了"-p"的选项  
// 那么他的意思就是print,让你打印出来你的NameServer的所有的配置信息  
if (commandLine.hasOption('p')) {  
    InternalLogger console = InternalLoggerFactory.getLogger(LoggerName.NAMESRV_CONSOLE_NAME);  
    MixAll.printObjectProperties(console, namesrvConfig);  
    MixAll.printObjectProperties(console, nettyServerConfig);  
    System.exit(0);  
}  
  
// 把在mqnamesrve命令行中带上的配置选项，都读取出来，然后覆盖到NamesrvConfig里去  
MixAll.properties2Object(ServerUtil.commandLine2Properties(commandLine), namesrvConfig);  
  
// 如果你的ROCKETMQ_HOME发现是空的  
// 那么就会输出一个异常日志，说让你设置一下ROCKETMQ HOME这个环境变量  
if (null == namesrvConfig.getRocketmqHome()) {  
    System.out.printf("Please set the %s variable in your environment to match the location of the RocketMQ installation%n", MixAll.ROCKETMQ_HOME_ENV);  
    System.exit(-2);  
}  
  
// 日志配置文件  
LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();  
JoranConfigurator configurator = new JoranConfigurator();  
configurator.setContext(lc);  
lc.reset();  
configurator.doConfigure(namesrvConfig.getRocketmqHome() + "/conf/logback_namesrv.xml");  
  
// 日志里打印一下配置信息  
log = InternalLoggerFactory.getLogger(LoggerName.NAMESRV_LOGGER_NAME);  
  
MixAll.printObjectProperties(log, namesrvConfig);  
MixAll.printObjectProperties(log, nettyServerConfig);
```

![](../youdaonote-images/Pasted%20image%2020231018144230.png)
- NamesrvController组件的创建

```java
final NamesrvController controller = new NamesrvController(namesrvConfig, nettyServerConfig);  
  
// remember all configs to prevent discard  
controller.getConfiguration().registerConfig(properties);
```

![](../youdaonote-images/Pasted%20image%2020231018151807.png)

- NamesrvController构造函数（基本只有赋值功能）

```java
public NamesrvController(NamesrvConfig namesrvConfig, NettyServerConfig nettyServerConfig) {  
    this.namesrvConfig = namesrvConfig;  
    this.nettyServerConfig = nettyServerConfig;  
    this.kvConfigManager = new KVConfigManager(this);  
    this.routeInfoManager = new RouteInfoManager();  
    this.brokerHousekeepingService = new BrokerHousekeepingService(this);  
    this.configuration = new Configuration(  
        log,  
        this.namesrvConfig, this.nettyServerConfig  
    );  
    this.configuration.setStorePathFromConfig(this.namesrvConfig, "configStorePath");  
}
```

- NamesrvController组件的启动，在main函数里start被调用
```java
public static NamesrvController start(final NamesrvController controller) throws Exception {  
  
    if (null == controller) {  
        throw new IllegalArgumentException("NamesrvController is null");  
    }  

	// controller初始化 会初始化netty
    boolean initResult = controller.initialize();  
    if (!initResult) {  
        controller.shutdown();  
        System.exit(-3);  
    }
}
```

- initialize方法初始化Netty
```java
public boolean initialize() {  
  
    this.kvConfigManager.load();  

	// 构造Netty远程服务器
    this.remotingServer = new NettyRemotingServer(this.nettyServerConfig, this.brokerHousekeepingService);
}
```

![](../youdaonote-images/Pasted%20image%2020231018152638.png)

- NettyRemotingServer构造函数
```java
public NettyRemotingServer(final NettyServerConfig nettyServerConfig,  
    final ChannelEventListener channelEventListener) {  
    super(nettyServerConfig.getServerOnewaySemaphoreValue(), nettyServerConfig.getServerAsyncSemaphoreValue());  
    // Netty核心类代表启动了一个Netty  
    this.serverBootstrap = new ServerBootstrap();
}
```
> NettyRemotingServer是一个RocketMQ自己开发的网络服务器组件，但是其实底层就是基于Netty的原始API实现的一个ServerBootstrap。

![](../youdaonote-images/Pasted%20image%2020231018152923.png)

- NamesrvController初始化完整分析
```java
public boolean initialize() {  
    // 加载kv配置  
    this.kvConfigManager.load();  
  
    // 初始化Netty服务器  
    this.remotingServer = new NettyRemotingServer(this.nettyServerConfig, this.brokerHousekeepingService);  
  
    // Netty服务器工作线程池  
    this.remotingExecutor =  
        Executors.newFixedThreadPool(nettyServerConfig.getServerWorkerThreads(), new ThreadFactoryImpl("RemotingExecutorThread_"));  
  
    // 把工作线程池给Netty服务器  
    this.registerProcessor();  
  
    // 启动后台线程，执行定时任务  
    // scanNotActiveBroker 定时扫描那些Broke没发送心跳，判断是否挂了  
    this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
        @Override  
        public void run() {  
            NamesrvController.this.routeInfoManager.scanNotActiveBroker();  
        }  
    }, 5, 10, TimeUnit.SECONDS);  
  
    // 启动后台线程，执行定时任务  
    // 定时打印kv配置信息，不重要  
    this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
        @Override  
        public void run() {  
            NamesrvController.this.kvConfigManager.printAllPeriodically();  
        }  
    }, 1, 10, TimeUnit.MINUTES);  
  
    // filewatch相关，不重要的。  
    if (TlsSystemConfig.tlsMode != TlsMode.DISABLED) {  
        // Register a listener to reload SslContext  
        try {  
            fileWatchService = new FileWatchService(  
                new String[] {  
                    TlsSystemConfig.tlsServerCertPath,  
                    TlsSystemConfig.tlsServerKeyPath,  
                    TlsSystemConfig.tlsServerTrustCertPath  
                },  
                new FileWatchService.Listener() {  
                    boolean certChanged, keyChanged = false;  
                    @Override  
                    public void onChanged(String path) {  
                        if (path.equals(TlsSystemConfig.tlsServerTrustCertPath)) {  
                            log.info("The trust certificate changed, reload the ssl context");  
                            reloadServerSslContext();  
                        }  
                        if (path.equals(TlsSystemConfig.tlsServerCertPath)) {  
                            certChanged = true;  
                        }  
                        if (path.equals(TlsSystemConfig.tlsServerKeyPath)) {  
                            keyChanged = true;  
                        }  
                        if (certChanged && keyChanged) {  
                            log.info("The certificate and private key changed, reload the ssl context");  
                            certChanged = keyChanged = false;  
                            reloadServerSslContext();  
                        }  
                    }                    private void reloadServerSslContext() {  
                        ((NettyRemotingServer) remotingServer).loadSslContext();  
                    }  
                });  
        } catch (Exception e) {  
            log.warn("FileWatchService created error, can't load the certificate dynamically");  
        }  
    }  
    return true;  
}
```

- NamesrvController组件的启动全流程分析
	- 先initialize
	- 然后注册关闭钩子函数，在关闭时释放网络资源线程资源
	- 然后启动Netty服务器

```java
public static NamesrvController start(final NamesrvController controller) throws Exception {  
  
    if (null == controller) {  
        throw new IllegalArgumentException("NamesrvController is null");  
    }  
  
    boolean initResult = controller.initialize();  
    if (!initResult) {  
        controller.shutdown();  
        System.exit(-3);  
    }  
  
    Runtime.getRuntime().addShutdownHook(new ShutdownHookThread(log, new Callable<Void>() {  
        @Override  
        public Void call() throws Exception {  
            controller.shutdown();  
            return null;  
        }  
    }));  
  
    controller.start();  
  
    return controller;  
}
```

- NamesrvController的start和remotingServer的start
```java
public void start() throws Exception {  
    this.remotingServer.start();  
  
    if (this.fileWatchService != null) {  
        this.fileWatchService.start();  
    }  
}
```

```java
// 核心就是基于Netty的API去配置和启动一个Netty网络服务器
ServerBootstrap childHandler =  
	// 基于Server Bootstrap的group方法对各种网络进行配置
	// 比如看是不是epoll 不是就用nio
    this.serverBootstrap.group(this.eventLoopGroupBoss, this.eventLoopGroupSelector)  
        .channel(useEpoll() ? EpollServerSocketChannel.class : NioServerSocketChannel.class)  
        .option(ChannelOption.SO_BACKLOG, 1024)  
        .option(ChannelOption.SO_REUSEADDR, true)  
        .option(ChannelOption.SO_KEEPALIVE, false)  
        .childOption(ChannelOption.TCP_NODELAY, true)  
        .childOption(ChannelOption.SO_SNDBUF, nettyServerConfig.getServerSocketSndBufSize())  
        .childOption(ChannelOption.SO_RCVBUF, nettyServerConfig.getServerSocketRcvBufSize())  
        // 设置了Netty服务器要监听的端口号，默认就是9876
        .localAddress(new InetSocketAddress(this.nettyServerConfig.getListenPort()))
        // 下面设置了一大堆网络请求处理器
        // 只要Ntty服务器收到一个请求，那么就会依次使用下面的处理器来处理请求
        // 比如说handShakeHandler可能就是负责连接握手
        // NettyDecoder是负责编码解码的，IdleStateHandler是负责连接空闲管理的
        // connectionManageHandler是负责网路连接管理的
        // serverHandler是负责最关键的网络请求的处理的
        .childHandler(new ChannelInitializer<SocketChannel>() {  
            @Override  
            public void initChannel(SocketChannel ch) throws Exception {  
                ch.pipeline()  
                    .addLast(defaultEventExecutorGroup, HANDSHAKE_HANDLER_NAME, handshakeHandler)  
                    .addLast(defaultEventExecutorGroup,  
                        encoder,  
                        new NettyDecoder(),  
                        new IdleStateHandler(0, 0, nettyServerConfig.getServerChannelMaxIdleTimeSeconds()),  
                        connectionManageHandler,  
                        serverHandler  
                    );  
            }  
        });  
  
  
try {
	// 启动Netty服务器
    ChannelFuture sync = this.serverBootstrap.bind().sync();  
    InetSocketAddress addr = (InetSocketAddress) sync.channel().localAddress();  
    this.port = addr.getPort();  
} catch (InterruptedException e1) {  
    ...
}  
  
```

## 1.6 源码分析-Broker的启动流程

### 1.6.1 BrokerController的创建
- main方法调用start Controller
```java
public static void main(String[] args) {  
    start(createBrokerController(args));  
}
```

- BrokerController的创建createBrokerController方法

```java
public static BrokerController createBrokerController(String[] args) {  
    // 设置配置参数  
    // ...  
  
    try {  
        // 读取命令行参数 并配置  
        // ...  
  
        // broker的配置、netty服务器的配置、netty客户端的配置  
        final BrokerConfig brokerConfig = new BrokerConfig();  
        final NettyServerConfig nettyServerConfig = new NettyServerConfig();  
        final NettyClientConfig nettyClientConfig = new NettyClientConfig();  
  
        // Netty是否设置TLS机制，类似于HTTPs的加密机制  
        nettyClientConfig.setUseTLS(Boolean.parseBoolean(System.getProperty(TLS_ENABLE,  
            String.valueOf(TlsSystemConfig.tlsMode == TlsMode.ENFORCING))));  
        // 设置Netty服务器监听端口号  
        nettyServerConfig.setListenPort(10911);  
        // broker用来存储消息的一些配置信息  
        final MessageStoreConfig messageStoreConfig = new MessageStoreConfig();  
  
        // 如果当前这个broker是slavel的话，那么这里就要设置一个特殊的参数  
        if (BrokerRole.SLAVE == messageStoreConfig.getBrokerRole()) {  
            int ratio = messageStoreConfig.getAccessMessageInMemoryMaxRatio() - 10;  
            messageStoreConfig.setAccessMessageInMemoryMaxRatio(ratio);  
        }  
  
        // 读取 -c 配置文件  
        if (commandLine.hasOption('c')) {  
            String file = commandLine.getOptionValue('c');  
            if (file != null) {  
                configFile = file;  
                InputStream in = new BufferedInputStream(new FileInputStream(file));  
                properties = new Properties();  
                properties.load(in);  
  
                properties2SystemEnv(properties);  
                MixAll.properties2Object(properties, brokerConfig);  
                MixAll.properties2Object(properties, nettyServerConfig);  
                MixAll.properties2Object(properties, nettyClientConfig);  
                MixAll.properties2Object(properties, messageStoreConfig);  
  
                BrokerPathConfigHelper.setBrokerConfigPath(file);  
                in.close();  
            }  
        }  
        // 把命令行中的配置信息填充到brokerConfig  
        MixAll.properties2Object(ServerUtil.commandLine2Properties(commandLine), brokerConfig);  
  
        // 检查有没有ROCKETMQ_HOME  
        if (null == brokerConfig.getRocketmqHome()) {  
            System.out.printf("Please set the %s variable in your environment to match the location of the RocketMQ installation", MixAll.ROCKETMQ_HOME_ENV);  
            System.exit(-2);  
        }  
  
        // 读取namesrvAddr的地址，分号是因为有可能有多个。  
        String namesrvAddr = brokerConfig.getNamesrvAddr();  
        if (null != namesrvAddr) {  
            try {  
                String[] addrArray = namesrvAddr.split(";");  
                for (String addr : addrArray) {  
                    RemotingUtil.string2SocketAddress(addr);  
                }  
            } catch (Exception e) {  
                System.out.printf(  
                    "The Name Server Address[%s] illegal, please set it as follows, \"127.0.0.1:9876;192.168.0.1:9876\"%n",  
                    namesrvAddr);  
                System.exit(-3);  
            }  
        }  
        // 判断一下broker的角色  
        switch (messageStoreConfig.getBrokerRole()) {  
            case ASYNC_MASTER:  
            case SYNC_MASTER:  
                brokerConfig.setBrokerId(MixAll.MASTER_ID);  
                break;  
            case SLAVE:  
                if (brokerConfig.getBrokerId() <= 0) {  
                    System.out.printf("Slave's brokerId must be > 0");  
                    System.exit(-3);  
                }  
  
                break;  
            default:  
                break;  
        }  
  
        // 判断是否基于DLeger技术来管理主从同步和commitlog 如果是的话，就把brokerid设置为-1  
        if (messageStoreConfig.isEnableDLegerCommitLog()) {  
            brokerConfig.setBrokerId(-1);  
        }  
  
        // 设置HA监听端口号  
        messageStoreConfig.setHaListenPort(nettyServerConfig.getListenPort() + 1);  
        // 打印log日志  
        LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();  
        JoranConfigurator configurator = new JoranConfigurator();  
        configurator.setContext(lc);  
        lc.reset();  
        configurator.doConfigure(brokerConfig.getRocketmqHome() + "/conf/logback_broker.xml");  
  
        // 如果有 -p 那就打印所有配置类  
        if (commandLine.hasOption('p')) {  
            InternalLogger console = InternalLoggerFactory.getLogger(LoggerName.BROKER_CONSOLE_NAME);  
            MixAll.printObjectProperties(console, brokerConfig);  
            MixAll.printObjectProperties(console, nettyServerConfig);  
            MixAll.printObjectProperties(console, nettyClientConfig);  
            MixAll.printObjectProperties(console, messageStoreConfig);  
            System.exit(0);  
            // 如果有 -m 那就打印所有配置类  
        } else if (commandLine.hasOption('m')) {  
            InternalLogger console = InternalLoggerFactory.getLogger(LoggerName.BROKER_CONSOLE_NAME);  
            MixAll.printObjectProperties(console, brokerConfig, true);  
            MixAll.printObjectProperties(console, nettyServerConfig, true);  
            MixAll.printObjectProperties(console, nettyClientConfig, true);  
            MixAll.printObjectProperties(console, messageStoreConfig, true);  
            System.exit(0);  
        }  
  
        log = InternalLoggerFactory.getLogger(LoggerName.BROKER_LOGGER_NAME);  
        MixAll.printObjectProperties(log, brokerConfig);  
        MixAll.printObjectProperties(log, nettyServerConfig);  
        MixAll.printObjectProperties(log, nettyClientConfig);  
        MixAll.printObjectProperties(log, messageStoreConfig);  
  
        // 创建了一个核心的BrokerController组件  
        final BrokerController controller = new BrokerController(  
            brokerConfig,  
            nettyServerConfig,  
            nettyClientConfig,  
            messageStoreConfig);  
        // remember all configs to prevent discard  
        controller.getConfiguration().registerConfig(properties);  
  
        // BrokerController初始化  
        boolean initResult = controller.initialize();  
        if (!initResult) {  
            controller.shutdown();  
            System.exit(-3);  
        }  
  
        // 注册了一个JVM的关闭钩子  
        // 退出的时候，其实就会执行里面的回调函数，  
        // 本质也是释放一堆资源  
        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {  
            private volatile boolean hasShutdown = false;  
            private AtomicInteger shutdownTimes = new AtomicInteger(0);  
  
            @Override  
            public void run() {  
                synchronized (this) {  
                    log.info("Shutdown hook was invoked, {}", this.shutdownTimes.incrementAndGet());  
                    if (!this.hasShutdown) {  
                        this.hasShutdown = true;  
                        long beginTime = System.currentTimeMillis();  
                        controller.shutdown();  
                        long consumingTimeTotal = System.currentTimeMillis() - beginTime;  
                        log.info("Shutdown hook over, consuming total time(ms): {}", consumingTimeTotal);  
                    }  
                }            }        }, "ShutdownHook"));  
        // 返回创建和初始化好的BrokerController  
        return controller;  
    } catch (Throwable e) {  
        e.printStackTrace();  
        System.exit(-1);  
    }  
  
    return null;  
}
```

> Broker既是服务端也是客户端，服务端是接收消息，客户端是给NameServer发送消息。
![](../youdaonote-images/Pasted%20image%2020231018182900.png)

- BrokerController的构造函数
```java
this.brokerConfig = brokerConfig;  
this.nettyServerConfig = nettyServerConfig;  
this.nettyClientConfig = nettyClientConfig;  
this.messageStoreConfig = messageStoreConfig;  
// 管理consumer消费offset  
this.consumerOffsetManager = new ConsumerOffsetManager(this);  
// topic配置管理  
this.topicConfigManager = new TopicConfigManager(this);  
// 处理consumer发送拉取消息的请求  
this.pullMessageProcessor = new PullMessageProcessor(this);  
this.pullRequestHoldService = new PullRequestHoldService(this);

// 用来实现某些功能的后台线程池的队列  
// 不同的后台线程和处理请求的线程放在不同的线程池里去执行  
// 有些Broker接收请求，会用到上面的一些组件来处理，实际上是自己的后台线程去执行的  
this.sendThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getSendThreadPoolQueueCapacity());  
this.pullThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getPullThreadPoolQueueCapacity());  
this.replyThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getReplyThreadPoolQueueCapacity());  
this.queryThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getQueryThreadPoolQueueCapacity());  
this.clientManagerThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getClientManagerThreadPoolQueueCapacity());  
this.consumerManagerThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getConsumerManagerThreadPoolQueueCapacity());  
this.heartbeatThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getHeartbeatThreadPoolQueueCapacity());  
this.endTransactionThreadPoolQueue = new LinkedBlockingQueue<Runnable>(this.brokerConfig.getEndTransactionPoolQueueCapacity());

// 下面这些同样也是Broker的一些功能性组件  
// 比如StatsManager就是metric统计组件，就是对Broker内进行统计的  
// 还有比如BrokerFastFailure-一看就是用于处理Broker故障的组件  
this.brokerStatsManager = new BrokerStatsManager(this.brokerConfig.getBrokerClusterName());  
this.setStoreHost(new InetSocketAddress(this.getBrokerConfig().getBrokerIP1(), this.getNettyServerConfig().getListenPort()));  
  
this.brokerFastFailure = new BrokerFastFailure(this);  
this.configuration = new Configuration(  
    log,  
    BrokerPathConfigHelper.getBrokerConfigPath(),  
    this.brokerConfig, this.nettyServerConfig, this.nettyClientConfig, this.messageStoreConfig  
);
```

> Broker在初始化的时候，内部会有一大堆的组件需要初始化，就是构造函数中显示的那些

![](../youdaonote-images/Pasted%20image%2020231018185742.png)

### 1.6.2 BrokerController的初始化

**Broker作为一个JVM进程启动之后，是BrokerStartup这个启动组件，负责初始化核心配置组件，然后启动了BrokerController这个管控组件。然后在BrokerController管控组件中，包含了一大堆的核心功能组件和后台线程池组件。**

```java
public boolean initialize() throws CloneNotSupportedException {  
    // 加载Topic的配置、Consumer的消费offset、Consumeri订阅组、过滤器  
    // 如果都加载成功,那么result必然是True  
    boolean result = this.topicConfigManager.load();  
    result = result && this.consumerOffsetManager.load();  
    result = result && this.subscriptionGroupManager.load();  
    result = result && this.consumerFilterManager.load();  
  
    // 加载成功触发  
    if (result) {  
        try {  
            // 创建了消息存储的管理组件，管理磁盘上的  
            this.messageStore =  
                new DefaultMessageStore(this.messageStoreConfig, this.brokerStatsManager, this.messageArrivingListener,  
                    this.brokerConfig);  
            // 如果启用了dleger技术进行主从同步以及管理commitlog  
            // 初始化一些dleger相关组件  
            if (messageStoreConfig.isEnableDLegerCommitLog()) {  
                DLedgerRoleChangeHandler roleChangeHandler = new DLedgerRoleChangeHandler(this, (DefaultMessageStore) messageStore);  
                ((DLedgerCommitLog)((DefaultMessageStore) messageStore).getCommitLog()).getdLedgerServer().getdLedgerLeaderElector().addRoleChangeHandler(roleChangeHandler);  
            }  
            // Broker的统计组件  
            this.brokerStats = new BrokerStats((DefaultMessageStore) this.messageStore);  
            //load plugin  
            MessageStorePluginContext context = new MessageStorePluginContext(messageStoreConfig, brokerStatsManager, messageArrivingListener, brokerConfig);  
            this.messageStore = MessageStoreFactory.build(context, this.messageStore);  
            this.messageStore.getDispatcherList().addFirst(new CommitLogDispatcherCalcBitMap(this.brokerConfig, this.consumerFilterManager));  
        } catch (IOException e) {  
            result = false;  
            log.error("Failed to initialize", e);  
        }  
    }  
    result = result && this.messageStore.load();  
  
    if (result) {  
        // Broker的Netty服务器初始化，Broker也要接受请求。  
        this.remotingServer = new NettyRemotingServer(this.nettyServerConfig, this.clientHousekeepingService);  
        NettyServerConfig fastConfig = (NettyServerConfig) this.nettyServerConfig.clone();  
        fastConfig.setListenPort(nettyServerConfig.getListenPort() - 2);  
        this.fastRemotingServer = new NettyRemotingServer(fastConfig, this.clientHousekeepingService);  
  
        // 初始化一些线程池、有的是处理请求的、有的是后台运行的线程池  
        // sendMessageExecutor 处理发送消息的线程池  
        this.sendMessageExecutor = new BrokerFixedThreadPoolExecutor(  
            this.brokerConfig.getSendMessageThreadPoolNums(),  
            this.brokerConfig.getSendMessageThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.sendThreadPoolQueue,  
            new ThreadFactoryImpl("SendMessageThread_"));  
  
        // 处理consumer拉取消息的线程池  
        this.pullMessageExecutor = new BrokerFixedThreadPoolExecutor(  
            this.brokerConfig.getPullMessageThreadPoolNums(),  
            this.brokerConfig.getPullMessageThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.pullThreadPoolQueue,  
            new ThreadFactoryImpl("PullMessageThread_"));  
  
        // 回复消息的线程池  
        this.replyMessageExecutor = new BrokerFixedThreadPoolExecutor(  
            this.brokerConfig.getProcessReplyMessageThreadPoolNums(),  
            this.brokerConfig.getProcessReplyMessageThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.replyThreadPoolQueue,  
            new ThreadFactoryImpl("ProcessReplyMessageThread_"));  
  
        // 查询消息的线程池  
        this.queryMessageExecutor = new BrokerFixedThreadPoolExecutor(  
            this.brokerConfig.getQueryMessageThreadPoolNums(),  
            this.brokerConfig.getQueryMessageThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.queryThreadPoolQueue,  
            new ThreadFactoryImpl("QueryMessageThread_"));  
  
        // 管理Broker一些命令的线程池  
        this.adminBrokerExecutor =  
            Executors.newFixedThreadPool(this.brokerConfig.getAdminBrokerThreadPoolNums(), new ThreadFactoryImpl(  
                "AdminBrokerThread_"));  
  
        // 管理客户端的线程池  
        this.clientManageExecutor = new ThreadPoolExecutor(  
            this.brokerConfig.getClientManageThreadPoolNums(),  
            this.brokerConfig.getClientManageThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.clientManagerThreadPoolQueue,  
            new ThreadFactoryImpl("ClientManageThread_"));  
  
        // 后台线程池、负责给nameserver发送心跳的  
        this.heartbeatExecutor = new BrokerFixedThreadPoolExecutor(  
            this.brokerConfig.getHeartbeatThreadPoolNums(),  
            this.brokerConfig.getHeartbeatThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.heartbeatThreadPoolQueue,  
            new ThreadFactoryImpl("HeartbeatThread_", true));  
  
        // 结束事务的线程池，跟事务消息有关  
        this.endTransactionExecutor = new BrokerFixedThreadPoolExecutor(  
            this.brokerConfig.getEndTransactionThreadPoolNums(),  
            this.brokerConfig.getEndTransactionThreadPoolNums(),  
            1000 * 60,  
            TimeUnit.MILLISECONDS,  
            this.endTransactionThreadPoolQueue,  
            new ThreadFactoryImpl("EndTransactionThread_"));  
  
        // 管理consumer的线程池  
        this.consumerManageExecutor =  
            Executors.newFixedThreadPool(this.brokerConfig.getConsumerManageThreadPoolNums(), new ThreadFactoryImpl(  
                "ConsumerManageThread_"));  
  
        this.registerProcessor();  
  
        // 定时调度一些后台线程  
        final long initialDelay = UtilAll.computeNextMorningTimeMillis() - System.currentTimeMillis();  
        final long period = 1000 * 60 * 60 * 24;  
  
        // 定时进行broker统计的任务  
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
            @Override  
            public void run() {  
                try {  
                    BrokerController.this.getBrokerStats().record();  
                } catch (Throwable e) {  
                    log.error("schedule record error.", e);  
                }  
            }        }, initialDelay, period, TimeUnit.MILLISECONDS);  
  
        // 定时进行consumer消费的offset持久化到磁盘的任务  
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
            @Override  
            public void run() {  
                try {  
                    BrokerController.this.consumerOffsetManager.persist();  
                } catch (Throwable e) {  
                    log.error("schedule persist consumerOffset error.", e);  
                }  
            }        }, 1000 * 10, this.brokerConfig.getFlushConsumerOffsetInterval(), TimeUnit.MILLISECONDS);  
  
        // 定时对consumer filter过滤器进行持久化的任务  
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
            @Override  
            public void run() {  
                try {  
                    BrokerController.this.consumerFilterManager.persist();  
                } catch (Throwable e) {  
                    log.error("schedule persist consumer filter error.", e);  
                }  
            }        }, 1000 * 10, 1000 * 10, TimeUnit.MILLISECONDS);  
  
        // 定时进行broker保护任务  
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
            @Override  
            public void run() {  
                try {  
                    BrokerController.this.protectBroker();  
                } catch (Throwable e) {  
                    log.error("protectBroker error.", e);  
                }  
            }        }, 3, 3, TimeUnit.MINUTES);  
  
        // 定时打印watermark 水位的任务  
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
            @Override  
            public void run() {  
                try {  
                    BrokerController.this.printWaterMark();  
                } catch (Throwable e) {  
                    log.error("printWaterMark error.", e);  
                }  
            }        }, 10, 1, TimeUnit.SECONDS);  
  
        // 定时进行落后commitlog分发的任务  
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
            @Override  
            public void run() {  
                try {  
                    log.info("dispatch behind commit log {} bytes", BrokerController.this.getMessageStore().dispatchBehindBytes());  
                } catch (Throwable e) {  
                    log.error("schedule dispatchBehindBytes error.", e);  
                }  
            }        }, 1000 * 10, 1000 * 60, TimeUnit.MILLISECONDS);  
  
        // 设置nameserver地址列表，可以支持不通过配置的方式来写入地址，可以发送请求获取  
        if (this.brokerConfig.getNamesrvAddr() != null) {  
            this.brokerOuterAPI.updateNameServerAddressList(this.brokerConfig.getNamesrvAddr());  
            log.info("Set user specified name server address: {}", this.brokerConfig.getNamesrvAddr());  
        } else if (this.brokerConfig.isFetchNamesrvAddrByAddressServer()) {  
            this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
                @Override  
                public void run() {  
                    try {  
                        BrokerController.this.brokerOuterAPI.fetchNameServerAddr();  
                    } catch (Throwable e) {  
                        log.error("ScheduledTask fetchNameServerAddr exception", e);  
                    }  
                }            }, 1000 * 10, 1000 * 60 * 2, TimeUnit.MILLISECONDS);  
        }  
  
        // 如果你开启了d1eger技术，那么其实在下面你会发现会有一些操作  
        if (!messageStoreConfig.isEnableDLegerCommitLog()) {  
            if (BrokerRole.SLAVE == this.messageStoreConfig.getBrokerRole()) {  
                if (this.messageStoreConfig.getHaMasterAddress() != null && this.messageStoreConfig.getHaMasterAddress().length() >= 6) {  
                    this.messageStore.updateHaMasterAddress(this.messageStoreConfig.getHaMasterAddress());  
                    this.updateMasterHAServerAddrPeriodically = false;  
                } else {  
                    this.updateMasterHAServerAddrPeriodically = true;  
                }  
            } else {  
                this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
                    @Override  
                    public void run() {  
                        try {  
                            BrokerController.this.printMasterAndSlaveDiff();  
                        } catch (Throwable e) {  
                            log.error("schedule printMasterAndSlaveDiff error.", e);  
                        }  
                    }                }, 1000 * 10, 1000 * 60, TimeUnit.MILLISECONDS);  
            }  
        }  
        // 与文件有关的处理  
        if (TlsSystemConfig.tlsMode != TlsMode.DISABLED) {  
            // Register a listener to reload SslContext  
            try {  
                fileWatchService = new FileWatchService(  
                    new String[] {  
                        TlsSystemConfig.tlsServerCertPath,  
                        TlsSystemConfig.tlsServerKeyPath,  
                        TlsSystemConfig.tlsServerTrustCertPath  
                    },  
                    new FileWatchService.Listener() {  
                        boolean certChanged, keyChanged = false;  
  
                        @Override  
                        public void onChanged(String path) {  
                            if (path.equals(TlsSystemConfig.tlsServerTrustCertPath)) {  
                                log.info("The trust certificate changed, reload the ssl context");  
                                reloadServerSslContext();  
                            }  
                            if (path.equals(TlsSystemConfig.tlsServerCertPath)) {  
                                certChanged = true;  
                            }  
                            if (path.equals(TlsSystemConfig.tlsServerKeyPath)) {  
                                keyChanged = true;  
                            }  
                            if (certChanged && keyChanged) {  
                                log.info("The certificate and private key changed, reload the ssl context");  
                                certChanged = keyChanged = false;  
                                reloadServerSslContext();  
                            }  
                        }  
                        private void reloadServerSslContext() {  
                            ((NettyRemotingServer) remotingServer).loadSslContext();  
                            ((NettyRemotingServer) fastRemotingServer).loadSslContext();  
                        }  
                    });  
            } catch (Exception e) {  
                log.warn("FileWatchService created error, can't load the certificate dynamically");  
            }  
        }        // 初始化事务相关内容、初始化ACL权限控制和RPC钩子  
        initialTransaction();  
        initialAcl();  
        initialRpcHooks();  
    }  
    return result;  
}
```

![](../youdaonote-images/Pasted%20image%2020231018233921.png)


### 1.6.3 BrokerController的启动

- 执行main里的start()方法（基本没干什么）

```java
public static BrokerController start(BrokerController controller) {  
    try {  
  
        controller.start();  
  
        String tip = "The broker[" + controller.getBrokerConfig().getBrokerName() + ", "  
            + controller.getBrokerAddr() + "] boot success. serializeType=" + RemotingCommand.getSerializeTypeConfigInThisServer();  
  
        if (null != controller.getBrokerConfig().getNamesrvAddr()) {  
            tip += " and name server is " + controller.getBrokerConfig().getNamesrvAddr();  
        }  
  
        log.info(tip);  
        System.out.printf("%s%n", tip);  
        return controller;  
    } catch (Throwable e) {  
        e.printStackTrace();  
        System.exit(-1);  
    }  
  
    return null;  
}
```

- BrokerContorller.start()方法
```java

public void start() throws Exception {  
    // 启动消息存储组件  
    if (this.messageStore != null) {  
        this.messageStore.start();  
    }  
  
    // 启动Netty服务器  
    if (this.remotingServer != null) {  
        this.remotingServer.start();  
    }  
  
    if (this.fastRemotingServer != null) {  
        this.fastRemotingServer.start();  
    }  
  
    // 启动文件相关的服务组件  
    if (this.fileWatchService != null) {  
        this.fileWatchService.start();  
    }  
  
    // BrokerOuterAPI是核心组件，让Broker通过Netty客户端去  
    // 发送请求给别人，比如说Broker发送请求到NS去注册和发心跳  
    if (this.brokerOuterAPI != null) {  
        this.brokerOuterAPI.start();  
    }  
  
    // 下面都是实现功能的核心组件  
    if (this.pullRequestHoldService != null) {  
        this.pullRequestHoldService.start();  
    }  
  
    if (this.clientHousekeepingService != null) {  
        this.clientHousekeepingService.start();  
    }  
  
    if (this.filterServerManager != null) {  
        this.filterServerManager.start();  
    }  
  
    if (!messageStoreConfig.isEnableDLegerCommitLog()) {  
        startProcessorByHa(messageStoreConfig.getBrokerRole());  
        handleSlaveSynchronize(messageStoreConfig.getBrokerRole());  
        this.registerBrokerAll(true, false, true);  
    }  
  
    // 线程池提交了定时任务，让Broker去给ns注册  
    this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
        @Override  
        public void run() {  
            try {  
                BrokerController.this.registerBrokerAll(true, false, brokerConfig.isForceRegister());  
            } catch (Throwable e) {  
                log.error("registerBrokerAll Exception", e);  
            }  
        }    }, 1000 * 10, Math.max(10000, Math.min(brokerConfig.getRegisterNameServerPeriod(), 60000)), TimeUnit.MILLISECONDS);  
  
    // 一些功能组件启动  
    if (this.brokerStatsManager != null) {  
        this.brokerStatsManager.start();  
    }  
  
    if (this.brokerFastFailure != null) {  
        this.brokerFastFailure.start();  
    }  
  
  
}
```

![](../youdaonote-images/Pasted%20image%2020231019010014.png)

**图片大致流程如下**：
1. Broker启动，注册自己到NameServer，所以BrokerOuterAPI这个组件就是做这个功能的。
2. Broker启动之后，网络服务器要接收别人的请求，此时NettyServer这个组件是完成这个功能的。
3. 当Broker接收到网络请求之后，需要有线程池来处理，需要处理各种请求的线程池
4. 处理请求的线程池在处理每个请求的时候，需要各种核心功能组件的协调。比如写入消息到commitlog，写入索引到indexfile和consumer queue文件里去，需要MessageStore之类的组件来配合。
5. 后台定时调度运行的线程。比如定时发送心跳到NameServer。

### 1.6.4 Broker的注册
- start()方法中的registerBrokerAll()
```java
public synchronized void registerBrokerAll(  
        final boolean checkOrderConfig, boolean oneway, boolean forceRegister) {  
  
    // 进行topic配置  
    TopicConfigSerializeWrapper topicConfigWrapper = this.getTopicConfigManager().buildTopicConfigSerializeWrapper();  
  
    // 处理topic config的一些东西  
    if (!PermName.isWriteable(this.getBrokerConfig().getBrokerPermission())  
        || !PermName.isReadable(this.getBrokerConfig().getBrokerPermission())) {  
        ConcurrentHashMap<String, TopicConfig> topicConfigTable = new ConcurrentHashMap<String, TopicConfig>();  
        for (TopicConfig topicConfig : topicConfigWrapper.getTopicConfigTable().values()) {  
            TopicConfig tmp =  
                new TopicConfig(topicConfig.getTopicName(), topicConfig.getReadQueueNums(), topicConfig.getWriteQueueNums(),  
                    this.brokerConfig.getBrokerPermission());  
            topicConfigTable.put(topicConfig.getTopicName(), tmp);  
        }  
        topicConfigWrapper.setTopicConfigTable(topicConfigTable);  
    }  
  
    // 判断注册的前置条件满足吗，如果满足就调用doRegisterBrokerAll进行注册  
    if (forceRegister || needRegister(this.brokerConfig.getBrokerClusterName(),  
        this.getBrokerAddr(),  
        this.brokerConfig.getBrokerName(),  
        this.brokerConfig.getBrokerId(),  
        this.brokerConfig.getRegisterBrokerTimeoutMills())) {  
        doRegisterBrokerAll(checkOrderConfig, oneway, topicConfigWrapper);  
    }  
}
```
- 真正进行Broker注册的方法doRegisterBrokerAll()
```java
private void doRegisterBrokerAll(  
        boolean checkOrderConfig, boolean oneway,  
    TopicConfigSerializeWrapper topicConfigWrapper) {  
    // 调用了BrokerOuterAPI去发送请求给NameServer  
    // 这里就完成了Broker的注册，然后获取到了注册的结果  
    // 为什么注册结果是个List呢？因为Broker会把自己注册给所有的NameServer!  
    List<RegisterBrokerResult> registerBrokerResultList = this.brokerOuterAPI.registerBrokerAll(  
        this.brokerConfig.getBrokerClusterName(),  
        this.getBrokerAddr(),  
        this.brokerConfig.getBrokerName(),  
        this.brokerConfig.getBrokerId(),  
        this.getHAServerAddr(),  
        topicConfigWrapper,  
        this.filterServerManager.buildNewFilterServerList(),  
        oneway,  
        this.brokerConfig.getRegisterBrokerTimeoutMills(),  
        this.brokerConfig.isCompressedRegister());  
  
    // 如果说注册结果的数量大于0，那么就在这里对注册结果进行处理  
    if (registerBrokerResultList.size() > 0) {  
        RegisterBrokerResult registerBrokerResult = registerBrokerResultList.get(0);  
        if (registerBrokerResult != null) {  
            if (this.updateMasterHAServerAddrPeriodically && registerBrokerResult.getHaServerAddr() != null) {  
                this.messageStore.updateHaMasterAddress(registerBrokerResult.getHaServerAddr());  
            }  
  
            this.slaveSynchronize.setMasterAddr(registerBrokerResult.getMasterAddr());  
  
            if (checkOrderConfig) {  
                this.getTopicConfigManager().updateOrderTopicConfig(registerBrokerResult.getKvTable());  
            }  
        }    }}
```

- brokerOuterAPI.registerBrokerAll()详细解析
```java
public List<RegisterBrokerResult> registerBrokerAll(  
    final String clusterName,  
    final String brokerAddr,  
    final String brokerName,  
    final long brokerId,  
    final String haServerAddr,  
    final TopicConfigSerializeWrapper topicConfigWrapper,  
    final List<String> filterServerList,  
    final boolean oneway,  
    final int timeoutMills,  
    final boolean compressed) {  
  
    // 初始化一个list，用来存放向每个NameServer注册的结果  
    final List<RegisterBrokerResult> registerBrokerResultList = Lists.newArrayList();  
    // 这个list是NameServer的地址列表  
    List<String> nameServerAddressList = this.remotingClient.getNameServerAddressList();  
    if (nameServerAddressList != null && nameServerAddressList.size() > 0) {  
  
        // 下面这个很关键，是在构建注册的网铬请求  
        // 首先他有一个请求头，在请求头里加入了很多的信息，比如broker的id和名称  
        final RegisterBrokerRequestHeader requestHeader = new RegisterBrokerRequestHeader();  
        requestHeader.setBrokerAddr(brokerAddr);  
        requestHeader.setBrokerId(brokerId);  
        requestHeader.setBrokerName(brokerName);  
        requestHeader.setClusterName(clusterName);  
        requestHeader.setHaServerAddr(haServerAddr);  
        requestHeader.setCompressed(compressed);  
  
        // 请求体，请求体包含配置信息。  
        RegisterBrokerBody requestBody = new RegisterBrokerBody();  
        requestBody.setTopicConfigSerializeWrapper(topicConfigWrapper);  
        requestBody.setFilterServerList(filterServerList);  
        final byte[] body = requestBody.encode(compressed);  
        final int bodyCrc32 = UtilAll.crc32(body);  
        requestHeader.setBodyCrc32(bodyCrc32);  
        // CountDownLatch 要求注册完全部的NS才能往下走  
        final CountDownLatch countDownLatch = new CountDownLatch(nameServerAddressList.size());  
        // 遍历nameserver地址列表，每个地址都要发送请求注册  
        for (final String namesrvAddr : nameServerAddressList) {  
            brokerOuterExecutor.execute(new Runnable() {  
                @Override  
                public void run() {  
                    try {  
                        // 真正执行注册  
                        RegisterBrokerResult result = registerBroker(namesrvAddr,oneway, timeoutMills,requestHeader,body);  
                        // 注册结果放到一个list里去  
                        if (result != null) {  
                            registerBrokerResultList.add(result);  
                        }  
  
                        log.info("register broker[{}]to name server {} OK", brokerId, namesrvAddr);  
                    } catch (Exception e) {  
                        log.warn("registerBroker Exception, {}", namesrvAddr, e);  
                    } finally {  
                        // 都注册完了会执行countdown  
                        countDownLatch.countDown();  
                    }  
                }            });  
        }  
  
        // 等待所有的走完  
        try {  
            countDownLatch.await(timeoutMills, TimeUnit.MILLISECONDS);  
        } catch (InterruptedException e) {  
        }    }  
    return registerBrokerResultList;  
}
```

![](../youdaonote-images/Pasted%20image%2020231019170753.png)

- BrokerOuter API是如何发送注册请求
```java
private RegisterBrokerResult registerBroker(  
    final String namesrvAddr,  
    final boolean oneway,  
    final int timeoutMills,  
    final RegisterBrokerRequestHeader requestHeader,  
    final byte[] body  
) throws RemotingCommandException, MQBrokerException, RemotingConnectException, RemotingSendRequestException, RemotingTimeoutException,  
    InterruptedException {  
    // 搞了一个RemotingCommand  
    // 然后把请求头和请求体封装成一个完整请求  
    RemotingCommand request = RemotingCommand.createRequestCommand(RequestCode.REGISTER_BROKER, requestHeader);  
    request.setBody(body);  
  
    // oneway是特殊情况，不用等待注册结果，属于特殊情况  
    if (oneway) {  
        try {  
            this.remotingClient.invokeOneway(namesrvAddr, request, timeoutMills);  
        } catch (RemotingTooMuchRequestException e) {  
            // Ignore  
        }  
        return null;  
    }  
  
    // 真正发送网络请求的逻辑,remotingClient就是NettyClient  
    RemotingCommand response = this.remotingClient.invokeSync(namesrvAddr, request, timeoutMills);  
  
    // 处理网络请求的返回结果，把处理结果封装成了Result  
    assert response != null;  
    switch (response.getCode()) {  
        case ResponseCode.SUCCESS: {  
            RegisterBrokerResponseHeader responseHeader =  
                (RegisterBrokerResponseHeader) response.decodeCommandCustomHeader(RegisterBrokerResponseHeader.class);  
            RegisterBrokerResult result = new RegisterBrokerResult();  
            result.setMasterAddr(responseHeader.getMasterAddr());  
            result.setHaServerAddr(responseHeader.getHaServerAddr());  
            if (response.getBody() != null) {  
                result.setKvTable(KVTable.decode(response.getBody(), KVTable.class));  
            }  
            return result;  
        }  
        default:  
            break;  
    }  
  
    throw new MQBrokerException(response.getCode(), response.getRemark());  
}
```

- NettyClient的网络请求方法

```java
@Override  
public RemotingCommand invokeSync(String addr, final RemotingCommand request, long timeoutMillis)  
    throws InterruptedException, RemotingConnectException, RemotingSendRequestException, RemotingTimeoutException {  
  
    // 下面代码就是获取一个当前时间  
    long beginStartTime = System.currentTimeMillis();  
  
    // 获取了一个channel，就是Broker机器跟NameServert机器之间的一个连接  
    // 连接建立之后，就是用一个Channel来代表这个网络连接  
    final Channel channel = this.getAndCreateChannel(addr);  
    // 如果连接channel没问题，就可以发送消息了  
    if (channel != null && channel.isActive()) {  
        try {  
            doBeforeRpcHooks(addr, request);  
            long costTime = System.currentTimeMillis() - beginStartTime;  
            if (timeoutMillis < costTime) {  
                throw new RemotingTimeoutException("invokeSync call timeout");  
            }  
  
            // 真正发送网络请求出去的地方  
            RemotingCommand response = this.invokeSyncImpl(channel, request, timeoutMillis - costTime);  
            // 发送完请求的处理，不重要  
            doAfterRpcHooks(RemotingHelper.parseChannelRemoteAddr(channel), request, response);  
            return response;  
        }  
}
```

Channel这个概念，表示出了Broker和NameServer之间的一个网络连接的概念，然后通过这个Channel就可以发送实际的网络请求出去。

![](../youdaonote-images/Pasted%20image%2020231020170302.png)

- 如何跟NameServer建立网络连接？
	- this.getAndCreateChannel(addr)实现的（如果没有缓存的话，就创建一个连接）
	- createChannel()

```java
private Channel getAndCreateChannel(final String addr) throws RemotingConnectException, InterruptedException {  
    if (null == addr) {  
        return getAndCreateNameserverChannel();  
    }  
  
    // 如果没有缓存的话，就创建一个连接  
    ChannelWrapper cw = this.channelTables.get(addr);  
    if (cw != null && cw.isOK()) {  
        return cw.getChannel();  
    }  
  
    return this.createChannel(addr);  
}
```

```java
private Channel createChannel(final String addr) throws InterruptedException {  
    // 如果没有缓存的话，就创建一个连接  
    ChannelWrapper cw = this.channelTables.get(addr);  
    if (cw != null && cw.isOK()) {  
        return cw.getChannel();  
    }  
  
    if (this.lockChannelTables.tryLock(LOCK_TIMEOUT_MILLIS, TimeUnit.MILLISECONDS)) {  
        try {  
            // 下面也是关于获取缓存的  
            boolean createNewConnection;  
            cw = this.channelTables.get(addr);  
            if (cw != null) {  
  
                if (cw.isOK()) {  
                    return cw.getChannel();  
                } else if (!cw.getChannelFuture().isDone()) {  
                    createNewConnection = false;  
                } else {  
                    this.channelTables.remove(addr);  
                    createNewConnection = true;  
                }  
            } else {  
                createNewConnection = true;  
            }  
  
            if (createNewConnection) {  
                // 这里是真正创建连接的地方  
                // 基于Netty的BootStrapi这个类的connect()方法  
                // 就构建出来了一个真正的Channel网铬连接  
                ChannelFuture channelFuture = this.bootstrap.connect(RemotingHelper.string2SocketAddress(addr));  
                log.info("createChannel: begin to connect remote host[{}] asynchronously", addr);  
                cw = new ChannelWrapper(channelFuture);  
                this.channelTables.put(addr, cw);  
            }  
        } catch (Exception e) {  
            log.error("createChannel: create channel exception", e);  
        } finally {  
            this.lockChannelTables.unlock();  
        }  
    } else {  
        log.warn("createChannel: try to lock channel table, but timeout, {}ms", LOCK_TIMEOUT_MILLIS);  
    }  
    // 返回channel  
    if (cw != null) {  
        ChannelFuture channelFuture = cw.getChannelFuture();  
        if (channelFuture.awaitUninterruptibly(this.nettyClientConfig.getConnectTimeoutMillis())) {  
            if (cw.isOK()) {  
                log.info("createChannel: connect remote host[{}] success, {}", addr, channelFuture.toString());  
                return cw.getChannel();  
            } else {  
                log.warn("createChannel: connect remote host[" + addr + "] failed, " + channelFuture.toString(), channelFuture.cause());  
            }  
        } else {  
            log.warn("createChannel: connect remote host[{}] timeout {}ms, {}", addr, this.nettyClientConfig.getConnectTimeoutMillis(),  
                channelFuture.toString());  
        }  
    }  
    return null;  
}
```

- 如何通过Channel网络连接发送请求？
	- this.invokeSyncImpl(channel, request, timeoutMillis - costTime);
```java
public RemotingCommand invokeSyncImpl(final Channel channel, final RemotingCommand request,  
    final long timeoutMillis)  
    throws InterruptedException, RemotingSendRequestException, RemotingTimeoutException {  
    final int opaque = request.getOpaque();  
  
    try {  
        final ResponseFuture responseFuture = new ResponseFuture(channel, opaque, timeoutMillis, null, null);  
        this.responseTable.put(opaque, responseFuture);  
        final SocketAddress addr = channel.remoteAddress();  
        // 基于Netty来开发，核心就是基于Channel把你的请求写出去  
        channel.writeAndFlush(request).addListener(new ChannelFutureListener() {  
            @Override  
            public void operationComplete(ChannelFuture f) throws Exception {  
                if (f.isSuccess()) {  
                    responseFuture.setSendRequestOK(true);  
                    return;  
                } else {  
                    responseFuture.setSendRequestOK(false);  
                }  
  
                responseTable.remove(opaque);  
                responseFuture.setCause(f.cause());  
                responseFuture.putResponse(null);  
                log.warn("send a request command to channel <" + addr + "> failed.");  
            }  
        });  
  
        // 等待响应回来  
        RemotingCommand responseCommand = responseFuture.waitResponse(timeoutMillis);  
        if (null == responseCommand) {  
            if (responseFuture.isSendRequestOK()) {  
                throw new RemotingTimeoutException(RemotingHelper.parseSocketAddressAddr(addr), timeoutMillis,  
                    responseFuture.getCause());  
            } else {  
                throw new RemotingSendRequestException(RemotingHelper.parseSocketAddressAddr(addr), responseFuture.getCause());  
            }  
        }  
        return responseCommand;  
    } finally {  
        this.responseTable.remove(opaque);  
    }  
}
```

### 1.6.5 NameServer处理Broker的注册请求
- 回到NamesrvController的初始化方法中NamesrvController.initialize()

```java
public boolean initialize() {  
    // 加载kv配置  
    this.kvConfigManager.load();  
  
    // 初始化Netty服务器  
    this.remotingServer = new NettyRemotingServer(this.nettyServerConfig, this.brokerHousekeepingService);  
  
    // Netty服务器工作线程池  
    this.remotingExecutor =  
        Executors.newFixedThreadPool(nettyServerConfig.getServerWorkerThreads(), new ThreadFactoryImpl("RemotingExecutorThread_"));  
  
    // 非常核心的是下面这行代码，他有一个注册ProcessorE的过程  
    // 这个Processor.其实就是请求处理器，是NameServer用来处理网络请求的组件  
    this.registerProcessor();
	// ....
}
```

- registerProcessor()方法的源码
```java
private void registerProcessor() {  
    if (namesrvConfig.isClusterTest()) {  
        // 用于处理测试集群  
        this.remotingServer.registerDefaultProcessor(new ClusterTestRequestProcessor(this, namesrvConfig.getProductEnvName()),  
            this.remotingExecutor);  
    } else {  
        // 把NameServer的里默认请求处理组件注册了进去  
        // NettyServer接收到的网路请求，都会由这个组件来处理  
        this.remotingServer.registerDefaultProcessor(new DefaultRequestProcessor(this), this.remotingExecutor);  
    }  
}
```

![](../youdaonote-images/Pasted%20image%2020231021161133.png)

- DefaultRequestProcessor处理Broker注册请求
```java
@Override  
public RemotingCommand processRequest(ChannelHandlerContext ctx,  
    RemotingCommand request) throws RemotingCommandException {  
  
    // 打印调试日志  
    if (ctx != null) {  
        log.debug("receive request, {} {} {}",  
            request.getCode(),  
            RemotingHelper.parseChannelRemoteAddr(ctx.channel()),  
            request);  
    }  
  
  
    // 根据请求类型，有不同的处理过程  
    switch (request.getCode()) {  
        case RequestCode.PUT_KV_CONFIG:  
            return this.putKVConfig(ctx, request);  
        case RequestCode.GET_KV_CONFIG:  
            return this.getKVConfig(ctx, request);  
        case RequestCode.DELETE_KV_CONFIG:  
            return this.deleteKVConfig(ctx, request);  
        case RequestCode.QUERY_DATA_VERSION:  
            return queryBrokerTopicConfig(ctx, request);  
        // 注册Broker的请求  
        case RequestCode.REGISTER_BROKER:  
            Version brokerVersion = MQVersion.value2Version(request.getVersion());  
            if (brokerVersion.ordinal() >= MQVersion.Version.V3_0_11.ordinal()) {  
                return this.registerBrokerWithFilterServer(ctx, request);  
            } else {  
                // 核心注册请求处理的逻辑  
                return this.registerBroker(ctx, request);  
            }
```

- this.registerBroker()
```java
public RemotingCommand registerBroker(ChannelHandlerContext ctx,  
    RemotingCommand request) throws RemotingCommandException {  
    final RemotingCommand response = RemotingCommand.createResponseCommand(RegisterBrokerResponseHeader.class);  
    // 解析注册请求  
    final RegisterBrokerResponseHeader responseHeader = (RegisterBrokerResponseHeader) response.readCustomHeader();  
    final RegisterBrokerRequestHeader requestHeader =  
        (RegisterBrokerRequestHeader) request.decodeCommandCustomHeader(RegisterBrokerRequestHeader.class);  
  
    if (!checksum(ctx, request, requestHeader)) {  
        response.setCode(ResponseCode.SYSTEM_ERROR);  
        response.setRemark("crc32 not match");  
        return response;  
    }  
  
    TopicConfigSerializeWrapper topicConfigWrapper;  
    if (request.getBody() != null) {  
        topicConfigWrapper = TopicConfigSerializeWrapper.decode(request.getBody(), TopicConfigSerializeWrapper.class);  
    } else {  
        topicConfigWrapper = new TopicConfigSerializeWrapper();  
        topicConfigWrapper.getDataVersion().setCounter(new AtomicLong(0));  
        topicConfigWrapper.getDataVersion().setTimestamp(0);  
    }  
  
    // 核心其实在这里，就是调用了RouteInfoManageri这个核心功能组件  
    // RouteInfoManager,顾名思义，就是路由信息管理组件，他是一个功能组件  
    // 调用了这个功能组件的注册Broker的方法  
    RegisterBrokerResult result = this.namesrvController.getRouteInfoManager().registerBroker(  
        requestHeader.getClusterName(),  
        requestHeader.getBrokerAddr(),  
        requestHeader.getBrokerName(),  
        requestHeader.getBrokerId(),  
        requestHeader.getHaServerAddr(),  
        topicConfigWrapper,  
        null,  
        ctx.channel()  
    );  
  
    // 构造返回响应  
    responseHeader.setHaServerAddr(result.getHaServerAddr());  
    responseHeader.setMasterAddr(result.getMasterAddr());  
  
    byte[] jsonValue = this.namesrvController.getKvConfigManager().getKVListByNamespace(NamesrvUtil.NAMESPACE_ORDER_TOPIC_CONFIG);  
    response.setBody(jsonValue);  
    response.setCode(ResponseCode.SUCCESS);  
    response.setRemark(null);  
    return response;  
}
```

![](../youdaonote-images/Pasted%20image%2020231021164423.png)

## 1.7 源码分析-Broker发送定时心跳与故障感知

- Broker中的发送注册请求给NameServer的一个源码入口，其实就是在BrokerController.start()方法
- 在BrokerController启动的时候，他其实并不是仅仅发送一次注册请求，而是启动了一个定时任务，会每隔一段时间就发送一次注册请求。
```java
this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
    @Override  
    public void run() {  
        try {  
            BrokerController.this.registerBrokerAll(true, false, brokerConfig.isForceRegister());  
        } catch (Throwable e) {  
            log.error("registerBrokerAll Exception", e);  
        }  
    }}, 1000 * 10, Math.max(10000, Math.min(brokerConfig.getRegisterNameServerPeriod(), 60000)), TimeUnit.MILLISECONDS);
```

启动了一个定时调度的任务，他默认是每隔30s就会执行一次Broker注册的过程，上面的registerNameServerPeriod是一个配置，他默认的值就是30s一次。

默认情况下，第一次发送注册请求就是在进行注册，后续每隔30s他都会发送一次注册请求，这个注册请求就是心跳了。

![](../youdaonote-images/Pasted%20image%2020231021165234.png)

- NameServer对后续重复发送过来的注册请求（也就是心跳）通过RouteInfoManager()来处理
```java
public RegisterBrokerResult registerBroker(  
    final String clusterName,  
    final String brokerAddr,  
    final String brokerName,  
    final long brokerId,  
    final String haServerAddr,  
    final TopicConfigSerializeWrapper topicConfigWrapper,  
    final List<String> filterServerList,  
    final Channel channel) {  
    RegisterBrokerResult result = new RegisterBrokerResult();  
    try {  
        try {  
            // 这里加写锁，同一时间，只能一个线程执行  
            this.lock.writeLock().lockInterruptibly();  
  
            // 下面这里是根据clusterName获取了一个set集合  
            Set<String> brokerNames = this.clusterAddrTable.get(clusterName);  
            if (null == brokerNames) {  
                brokerNames = new HashSet<String>();  
                this.clusterAddrTable.put(clusterName, brokerNames);  
            }  
            // 直接就把brokerName扔到了这个set集合里去  
            // 这就是在维护一个集群里有哪些broker存在的一个set数据结构  
            // 假如你后续每隔30s发送注册请求作为心跳，这里是没影响的  
            // 因为同样一个brokerName反复发送，这里set集合是自动去重的  
            brokerNames.add(brokerName);  
  
            boolean registerFirst = false;  
  
            // 这里是根据brokerName获取到BrokerData  
            // 他用一个brokerAdderTable作为核心路由数据表  
            // 这里存放了所有的Broker的详细的路由数据  
            BrokerData brokerData = this.brokerAddrTable.get(brokerName);  
  
            // 如果第一次发送注册请求，这里就是null  
            // 那么就会封装一个BrokerData,放入到这个路由数据表里去  
            // 这个就是核心的Broker注册过程,如果后续每隔30s发送注册请求作为心跳，这里是没影响的  
            // 因为明显你重复发送注册请求的时候，这个BrokerData已经存在了  
            if (null == brokerData) {  
                registerFirst = true;  
                brokerData = new BrokerData(clusterName, brokerName, new HashMap<Long, String>());  
                this.brokerAddrTable.put(brokerName, brokerData);  
            }  
            // 下面这里对路由数据做一些处理  
            Map<Long, String> brokerAddrsMap = brokerData.getBrokerAddrs();  
            //Switch slave to master: first remove <1, IP:PORT> in namesrv, then add <0, IP:PORT>  
            //The same IP:PORT must only have one record in brokerAddrTable            Iterator<Entry<Long, String>> it = brokerAddrsMap.entrySet().iterator();  
            while (it.hasNext()) {  
                Entry<Long, String> item = it.next();  
                if (null != brokerAddr && brokerAddr.equals(item.getValue()) && brokerId != item.getKey()) {  
                    it.remove();  
                }  
            }  
            String oldAddr = brokerData.getBrokerAddrs().put(brokerId, brokerAddr);  
            registerFirst = registerFirst || (null == oldAddr);  
  
            if (null != topicConfigWrapper  
                && MixAll.MASTER_ID == brokerId) {  
                if (this.isBrokerTopicConfigChanged(brokerAddr, topicConfigWrapper.getDataVersion())  
                    || registerFirst) {  
                    ConcurrentMap<String, TopicConfig> tcTable =  
                        topicConfigWrapper.getTopicConfigTable();  
                    if (tcTable != null) {  
                        for (Map.Entry<String, TopicConfig> entry : tcTable.entrySet()) {  
                            this.createAndUpdateQueueData(brokerName, entry.getValue());  
                        }  
                    }                }            }  
            // 核心的在这里，这就是每隔30s发送注册请求作为心跳的时候  
            // 每隔3os都会封装一个新的BrokerLiveInfo放入Map  
            // 每隔3Os,最新的BrokerLiveInfo都会覆盖之前上一次的BrokerLiveInfo  
            // BrokerLiveInfo里，就有一个当前时间戳，代表你最近一次心跳的时间  
            BrokerLiveInfo prevBrokerLiveInfo = this.brokerLiveTable.put(brokerAddr,  
                new BrokerLiveInfo(  
                    System.currentTimeMillis(),  
                    topicConfigWrapper.getDataVersion(),  
                    channel,  
                    haServerAddr));  
            if (null == prevBrokerLiveInfo) {  
                log.info("new broker registered, {} HAServer: {}", brokerAddr, haServerAddr);  
            }  
  
            // 暂时不用管
```

![](../youdaonote-images/Pasted%20image%2020231021210502.png)
- 假如故障了，没法处理注册请求作为心跳，那么该如何感知呢。
	- NamesrvController的initialize()方法里有一个RouteInfoManager的定时任务扫描不活跃的线程。
```java
// 启动后台线程，执行定时任务  
// scanNotActiveBroker 定时扫描那些Broke没发送心跳，判断是否挂了  
this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {  
  
    @Override  
    public void run() {  
        NamesrvController.this.routeInfoManager.scanNotActiveBroker();  
    }  
}, 5, 10, TimeUnit.SECONDS);


public void scanNotActiveBroker() {  
    // 遍历brokerLiveTable可以拿到BrokerLiveInfo中的最后一次发送心跳的时间。  
    Iterator<Entry<String, BrokerLiveInfo>> it = this.brokerLiveTable.entrySet().iterator();  
    while (it.hasNext()) {  
        Entry<String, BrokerLiveInfo> next = it.next();  
        long last = next.getValue().getLastUpdateTimestamp();  
        // 如果最后一次时间加上120s发现小于当前时间，说明已经过期了，就要移除了  
        if ((last + BROKER_CHANNEL_EXPIRED_TIME) < System.currentTimeMillis()) {  
            RemotingUtil.closeChannel(next.getValue().getChannel());  
            it.remove();  
            log.warn("The broker channel expired, {} {}ms", next.getKey(), BROKER_CHANNEL_EXPIRED_TIME);  
            // 在这里就会把这个Broker从路由数据表里都别除出去  
            this.onChannelDestroy(next.getKey(), next.getValue().getChannel());  
        }  
    }}
```

## 1.8 源码分析-Producer相关结构
### 1.8.1 如何创建Producer
**创建一个DefaultMQProducer对象实例，在其中传入你所属的Producer分组，然后设置一下NameServer的地址，最后调用他的start()方法，启动这个Producer就可以了。**
```java
DefaultMQProducer producer = new DefaultMQProducer("order_producer_group");

producer.setNamesrvAddr("localhost:9876");

producer.start();
```

>最核心的是调用了这个DefaultMQProducer的start()方法去启动了这个消息生产组件。

### 1.8.2 Producer启动准备好的相关资源
构造Producer的时候，他内部构造了一个真正用于执行消息发送逻辑的组件，就是DefaultMQProducerImpl这个类的实例对象。

Producer发送消息，必然是知道Topic的一些路由数据的，比如Topic有哪些MessageQueue，每个MessageQueue在哪些Broker上。

![](../youdaonote-images/Pasted%20image%2020231021214844.png)

**并不是刚启动就回去拉取Topic消息，因为不知道要往哪个topic发送。所以是第一次发送消息的时候，才会拉取相关topic信息。**
### 1.8.3 Producer如何从NameServer拉取Topic元数据
### 1.8.1 如何创建Producer
### 1.8.1 如何创建Producer
### 1.8.1 如何创建Producer