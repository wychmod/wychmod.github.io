# day9 日志

## Log简介

logging模块是Python内置的标准模块，主要用于输出运行日志，可以设置输出日志的等级、日志保存路径、日志文件回滚等；相比print，具备如下优点：

通过log的分析，可以方便用户了解系统或软件、应用的运行情况；如果你的应用log足够丰富，也可以分析以往用户的操作行为、类型喜好、地域分布或其他更多信息；如果一个应用的log同时也分了多个级别，那么可以很轻易地分析得到该应用的健康状况，及时发现问题并快速定位、解决问题，补救损失。

## Log的用途

不管是使用何种编程语言，日志输出几乎无处不再。总结起来，日志大致有以下几种用途：

- 问题追踪：通过日志不仅仅包括我们程序的一些bug，也可以在安装配置时，通过日志可以发现问题。
- 状态监控：通过实时分析日志，可以监控系统的运行状态，做到早发现问题、早处理问题。
- 安全审计：审计主要体现在安全上，通过对日志进行分析，可以发现是否存在非授权的操作

## Log等级

- DEBUG最详细的日志信息，典型应用场景是 问题诊断
- INFO信息详细程度仅次于DEBUG，通常只记录关键节点信息，用于确认一切都是按照我们预期的那样进行工作
- WARNING当某些不期望的事情发生时记录的信息（如，磁盘可用空间较低），但是此时应用程序还是正常运行的
- ERROR由于一个更严重的问题导致某些功能不能正常运行时记录的信息 如IO操作失败或者连接问题
- CRITICAL当发生严重错误，导致应用程序不能继续运行时记录的信息

> 日志记录级别

​    logging模块的重点在于生成和处理日志消息。每条消息由一些文本和指示其严重性的相关级别组成。级别包含符号名称和数字值。  

| 级别       | 值    | 描述      |
| -------- | ---- | ------- |
| CRITICAL | 50   | 关键错误/消息 |
| ERROR    | 40   | 错误      |
| WARNING  | 30   | 警告消息    |
| INFO     | 20   | 通知消息    |
| DEBUG    | 10   | 调试      |
| NOTSET   | 0    | 无级别     |

## Log模块的四大组件

- Loggers

    提供应用程序代码直接使用的接口

- Handlers

    用于将日志记录发送到指定的目的位置

    > 内置处理器

    ​    logging模块提供了一些处理器，可以通过各种方式处理日志消息。使用addHandler()方法将这些处理器添加给Logger对象。另外还可以为每个处理器配置它自己的筛选和级别。

    ​    **handlers.DatagramHandler(host，port):**发送日志消息给位于制定host和port上的UDP服务器。

    ​      **handlers.FileHandler(filename):**将日志消息写入文件filename。

    ​      **handlers.HTTPHandler(host, url):**使用HTTP的GET或POST方法将日志消息上传到一台HTTP 服务器。

    ​      **handlers.RotatingFileHandler(filename):**将日志消息写入文件filename。如果文件的大小超出maxBytes制定的值，那么它将被备份为filename1。


- Filters

    提供更细粒度的日志过滤功能，用于决定哪些日志记录将会被输出（其它的日志记录将会被忽略）

- Formatters

    用于控制日志信息的最终输出格式

> 记录器

​    记录器负责管理日志消息的默认行为，包括日志记录级别、输出目标位置、消息格式以及其它基本细节。

| 关键字参数    | 描述                    |
| -------- | --------------------- |
| filename | 将日志消息附加到指定文件名的文件      |
| filemode | 指定用于打开文件模式            |
| format   | 用于生成日志消息的格式字符串        |
| datefmt  | 用于输出日期和时间的格式字符串       |
| level    | 设置记录器的级别              |
| stream   | 提供打开的文件，用于把日志消息发送到文件。 |

> format 日志消息格式

| 格式             | 描述                |
| -------------- | ----------------- |
| %(name)s       | 记录器的名称            |
| %(levelno)s    | 数字形式的日志记录级别       |
| %(levelname)s  | 日志记录级别的文本名称       |
| %(filename)s   | 执行日志记录调用的源文件的文件名称 |
| %(pathname)s   | 执行日志记录调用的源文件的路径名称 |
| %(funcName)s   | 执行日志记录调用的函数名称     |
| %(module)s     | 执行日志记录调用的模块名称     |
| %(lineno)s     | 执行日志记录调用的行号       |
| %(created)s    | 执行日志记录的时间         |
| %(asctime)s    | 日期和时间             |
| %(msecs)s      | 毫秒部分              |
| %(thread)d     | 线程ID              |
| %(threadName)s | 线程名称              |
| %(process)d    | 进程ID              |
| %(message)s    | 记录的消息             |



## logging

#### 简单使用

把`print()`替换为`logging`是第3种方式，和`assert`比，`logging`不会抛出错误，而且可以输出到文件：

```python
import logging

s = '0'
n = int(s)
logging.info('n = %d' % n)
print(10 / n)
```

`logging.info()`就可以输出一段文本。运行，发现除了`ZeroDivisionError`，没有任何信息。怎么回事？

别急，在`import logging`之后添加一行配置再试试：

```python
import logging
logging.basicConfig(level=logging.INFO)
```

看到输出了：

```python
$ python err.py
INFO:root:n = 0
Traceback (most recent call last):
  File "err.py", line 8, in <module>
    print(10 / n)
ZeroDivisionError: division by zero
```

这就是`logging`的好处，它允许你指定记录信息的级别，有`debug`，`info`，`warning`，`error`等几个级别，当我们指定`level=INFO`时，`logging.debug`就不起作用了。同理，指定`level=WARNING`后，`debug`和`info`就不起作用了。这样一来，你可以放心地输出不同级别的信息，也不用删除，最后统一控制输出哪个级别的信息。

`logging`的另一个好处是通过简单的配置，一条语句可以同时输出到不同的地方，比如console和文件。

#### logging进阶使用

##### (1) 配置logging基本的设置，然后在控制台输出日志

##### 日志等级：使用范围

FATAL：致命错误
CRITICAL：特别糟糕的事情，如内存耗尽、磁盘空间为空，一般很少使用
ERROR：发生错误时，如IO操作失败或者连接问题
WARNING：发生很重要的事件，但是并不是错误时，如用户登录密码错误
INFO：处理请求或者状态变化等日常事务
DEBUG：调试过程中使用DEBUG等级，如算法中每个循环的中间状态

```python
import logging
logging.basicConfig(level = logging.INFO,format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("Start print log")
logger.debug("Do something")
logger.warning("Something maybe fail.")
logger.info("Finish")
```

运行时，控制台输出，

```
2016-10-09 19:11:19,434 - __main__ - INFO - Start print log
2016-10-09 19:11:19,434 - __main__ - WARNING - Something maybe fail.
2016-10-09 19:11:19,434 - __main__ - INFO - Finish
```

logging中可以选择很多消息级别，如debug、info、warning、error以及critical。通过赋予logger或者handler不同的级别，开发者就可以只输出错误信息到特定的记录文件，或者在调试时只记录调试信息。

例如，我们将logger的级别改为DEBUG，再观察一下输出结果，

```python
logging.basicConfig(level = logging.DEBUG,format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
```

控制台输出，可以发现，输出了debug的信息。

```
2016-10-09 19:12:08,289 - __main__ - INFO - Start print log
2016-10-09 19:12:08,289 - __main__ - DEBUG - Do something
2016-10-09 19:12:08,289 - __main__ - WARNING - Something maybe fail.
2016-10-09 19:12:08,289 - __main__ - INFO - Finish
```

##### logging.basicConfig函数各参数：

filename：指定日志文件名；

filemode：和file函数意义相同，指定日志文件的打开模式，'w'或者'a'；

format：指定输出的格式和内容，format可以输出很多有用的信息

##### 参数：作用

%(levelno)s：打印日志级别的数值
%(levelname)s：打印日志级别的名称
%(pathname)s：打印当前执行程序的路径，其实就是sys.argv[0]
%(filename)s：打印当前执行程序名
%(funcName)s：打印日志的当前函数
%(lineno)d：打印日志的当前行号
%(asctime)s：打印日志的时间
%(thread)d：打印线程ID
%(threadName)s：打印线程名称
%(process)d：打印进程ID
%(message)s：打印日志信息

#### (2) 将日志写入到文件

设置logging，创建一个FileHandler，并对输出消息的格式进行设置，将其添加到logger，然后将日志写入到指定的文件中

```python
import logging
logger = logging.getLogger(__name__)
logger.setLevel(level = logging.INFO)
handler = logging.FileHandler("log.txt")
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

logger.info("Start print log")
logger.debug("Do something")
logger.warning("Something maybe fail.")
logger.info("Finish")
```

log.txt中日志数据为，

```
2016-10-09 19:01:13,263 - __main__ - INFO - Start print log
2016-10-09 19:01:13,263 - __main__ - WARNING - Something maybe fail.
2016-10-09 19:01:13,263 - __main__ - INFO - Finish
```

**将日志同时输出到屏幕和日志文件**

logger中添加StreamHandler，可以将日志输出到屏幕上

```python
import logging
logger = logging.getLogger(__name__)
logger.setLevel(level = logging.INFO)
handler = logging.FileHandler("log.txt")
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

console = logging.StreamHandler()
console.setLevel(logging.INFO)

logger.addHandler(handler)
logger.addHandler(console)

logger.info("Start print log")
logger.debug("Do something")
logger.warning("Something maybe fail.")
logger.info("Finish")
```

可以在log.txt文件和控制台中看到，

```
2016-10-09 19:20:46,553 - __main__ - INFO - Start print log
2016-10-09 19:20:46,553 - __main__ - WARNING - Something maybe fail.
2016-10-09 19:20:46,553 - __main__ - INFO - Finish
```

 

  #### Django中的配置

 配置setting.py配置文件

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {#日志格式 
       'standard': {
            'format': '%(asctime)s [%(threadName)s:%(thread)d] [%(name)s:%(lineno)d] [%(module)s:%(funcName)s] [%(levelname)s]- %(message)s'}  
    },
    'filters': {#过滤器
    },
    'handlers': {#处理器
        'null': {
            'level': 'DEBUG',
            'class': 'logging.NullHandler',
        },
        'debug': {#输出到文件
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, "log",'debug.log'),#日志输出文件
            'maxBytes':1024*1024*5,#文件大小 
            'backupCount': 5,#备份份数
            'formatter':'standard',#使用哪种formatters日志格式
        },
        'console':{#输出到控制台
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'loggers': {#logging管理器
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False 
        },
        'django.request': {
            'handlers': ['debug'],
            'level': 'ERROR',
            'propagate': True,
        },
    } 
}
```

#####  把所有的debug信息输出到控制台，把error级别错误信息输出到文件。当然要先在django网站创建我设置的日志目录：log，要不然会出错。

解析：

​        1.formatters：配置打印日志格式

​        2.handler：用来定义具体处理日志的方式，可以定义多种，"default"就是默认方式，"console"就是打印到控制台方式。

​        3.loggers:用来配置用那种handlers来处理日志，比如你同时需要输出日志到文件、控制台。

 

​        注意:

​        1.loggers类型为"django"这将处理所有类型日志。

​          2.sourceDns.webdns.views 应用的py文件

**实例：**

```python
import pymysql
logger = logging.getLogger('sourceDns.webdns.views')    #刚才在setting.py中配置的logger

try:
    mysql= pymysql.connect('127.0.0.1','123456','3306', 'david')
except Exception as e:
    logger.error(e)        #直接将错误写入到日志文件
```

**手动写**

  ~~~python
  import logging
  logger = logging.getLogger("django") # 为loggers中定义的名称
  logger.info("some info...")
  ~~~

  

**1、关闭Debug模式**

这段时间整个网站运行都没问题。准备要关闭调试模式了，毕竟调试模式响应速度相对有些慢。关闭调试模式可以加快访问速度，而且可以避免敏感的调试信息泄漏。

打开settings.py文件，把DEBUG设置False。接着还需要设置 ALLOWED_HOSTS (被运行的主机)，如果这个设置的话，会提示错误。偷懒的人可以设置为 ALLOWED_HOSTS = ['*',] 。但这种不建议，不够安全。应该根据自己的域名来设置。设置为 ALLOWED_HOSTS = ['xxx.com'] 。相关的设置可以查看[Django Book](http://djangobook.py3k.cn/2.0/chapter12/)中文翻译。

**2、动态设置Debug模式**

为了方便我开发和生产部署，不想每次都手动修改DEBUG这个值,导入socket模块，根据ip地址来设置。判断是否是192开头的IP地址。这个和Django Book里面说的不一样，判断IP地址要好一些。如下设置：

```python
import socket 
if socket.gethostbyname(socket.gethostname())[:3]=='192':    
    DEBUG = TEMPLATE_DEBUG = True
else:    
    DEBUG = TEMPLATE_DEBUG = False 
ALLOWED_HOSTS = ['*'']
```

##### 3、完整的代码

```python
import socket
 
#根据IP地址判断是否是开发环境
if socket.gethostbyname(socket.gethostname())[:3]=='192':
    DEBUG = TEMPLATE_DEBUG = True
else:
    DEBUG = TEMPLATE_DEBUG = False
 
ALLOWED_HOSTS = ['*'] #设置允许访问的主机
 
#管理员邮箱
ADMINS = (
    ('xialigang','793390457@qq.com'),
)
 
#非空链接，却发生404错误，发送通知MANAGERS
SEND_BROKEN_LINK_EMAILS = True
MANAGERS = ADMINS
 
#Email设置
ADMINS = (
    ('admin', '793390457@qq.com'),  # 设置管理员邮箱
)

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.1000phone.com'  # QQ邮箱SMTP服务器
EMAIL_HOST_USER = 'xialigang@1000phone.com'  # 我的邮箱帐号
EMAIL_HOST_PASSWORD = '******'  # 密码
DEFAULT_FROM_EMAIL = SERVER_EMAIL = EMAIL_HOST_USER #设置发件人

#logging日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {#日志格式
       'standard': {
            'format': '%(asctime)s [%(threadName)s:%(thread)d] [%(name)s:%(lineno)d] [%(module)s:%(funcName)s] [%(levelname)s]- %(message)s'}
    },
    'filters': {#过滤器
        'require_debug_false': {
                '()': 'django.utils.log.RequireDebugFalse',
            }
    },
    'handlers': {#处理器
        'null': {
            'level': 'DEBUG',
            'class': 'logging.NullHandler',
        },
        'mail_admins': {#发送邮件通知管理员
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],# 仅当 DEBUG = False 时才发送邮件
            'include_html': True,
        },
        'debug': {#记录到日志文件(需要创建对应的目录，否则会出错)
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, "log",'debug.log'),#日志输出文件
            'maxBytes':1024*1024*5,#文件大小
            'backupCount': 5,#备份份数
            'formatter':'standard',#使用哪种formatters日志格式
        },
        'console':{#输出到控制台
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'loggers': {#logging管理器
        'django': {
            'handlers': ['console','debug'], #控制台输出并写入debug文件
            'level': 'DEBUG',
            'propagate': False
        },
        'django.request': {
            'handlers': ['debug','mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        # 对于不在 ALLOWED_HOSTS 中的请求不发送报错邮件
        'django.security.DisallowedHost': {
            'handlers': ['null'],
            'propagate': False,
        },
    }
}
```

**注意：**

如果发送失败 注意查看debug是否关闭为False

