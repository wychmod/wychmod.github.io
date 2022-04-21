#### (1) 安装 

##### 安装ssh

新版本安装位 apt/apt-get

老版本为 apt-get

安装以后 ifconfig查看当前的ip地址

如果网络不在同一个ip段  将网络模式设置为桥接



1. 在要安装项目的目录创建虚拟环境

   virtualenv venv

2. source activate # 开启虚拟开发环境模式

3. pip3 install uwsgi # 安装uwsgi

#### (2) 配置

uwsgi配置文件支持很多格式，我采用.ini格式，命名为uconfig.ini具体内容如下：

socket指出了一个套接字，相当于为外界留出一个uwsgi服务器的接口。

```python
[uwsgi]

# 外部访问地址，可以指定多种协议，现在用http便于调试，之后用socket  #
socket = 0.0.0.0:8000 # uwsgi的监听端口

# 指向项目目录
chdir =  /home/xlg/test/

# flask启动程序文件
wsgi-file = manage.py

# flask在manage.py文件中的app名
callable =app

plugins = python# 这行一定要加上，不然请求时会出现-- unavailable modifier requested: 0 --错误提示

# 处理器数
processes = 1

# 线程数
threads = 2
```

socket和http的差别。从概念上来说，socket本身不是协议而是一种具体的TCP/IP实现方式，而HTTP是一种协议且基于TCP/IP。具体到这个配置这里来，如果我只配了socket = 127.0.0.1:5051的话，通过浏览器或者其他HTTP手段是无法成功访问的。而在uwsgi这边的日志里会提示请求包的长度超过了最大固定长度。另一方面，如果配置的是http = 127.0.0.1:5051的话，那么就可以直接通过一般的http手段来访问到目标。但这会引起nginx无法正常工作。正确的做法应该是，如果有nginx在uwsgi之前作为代理的话应该配socket，而如果想让请求直接甩给uwsgi的话那么就要配http

pythonpath指出了项目的目录，module指出了项目启动脚本的名字而紧接着的wsgi-file指出了真正的脚本的文件名。callable指出的是具体执行.run方法的那个实体的名字，一般而言都是app=Flask(__name__)的所以这里是app。processes和threads指出了启动uwsgi服务器之后，服务器会打开几个并行的进程，每个进程会开几条线程来等待处理请求，显然这个数字应该合理，太小会使得处理性能不好而太大则会给服务器本身带来太大负担。daemonize项的出现表示把uwsgi服务器作为后台进程启动，项的值指向一个文件表明后台中的所有输出都重定向到这个日志中去。

```
daemonize = /home/wyz/flask/server.log
```

#### (3) 安装 nginx

#### Nginx：`sudo apt-get install nginx`

[Nginx](http://tengine.taobao.org/book/)是轻量级、性能强、占用资源少，能很好的处理高并发的反向代理软件。Ubuntu 上配置 Nginx 也是很简单，不要去改动默认的 nginx.conf 只需要将`/etc/nginx/sites-available/default`文件替换掉就可以了。 
新建一个 default 文件:

```python
server{
listen  80; # 服务器监听端口
        server_name 192.168.100.136; # 这里写你的域名或者公网IP
        location / {
                uwsgi_pass      127.0.0.1:8000; # 转发端口，需要和uwsgi配置当中的监听端口一致
               	include uwsgi_params; # 导入uwsgi配置
                #uwsgi_param UWSGI_PYTHON /home/自己创建的目录/venv; # Python解释器所在的路径（这里为虚拟环境）
                uwsgi_param UWSGI_PYTHON /usr/bin/python3;  
		 		uwsgi_param UWSGI_CHDIR  /home/xlg/test/;# # 自己创建的目录 项目根目录
                uwsgi_param UWSGI_SCRIPT manage:app; # 指定启动程序
            	#比如你测试用test.py文件，文件中app = Flask(name)，那么这里就填 test：app
        }
}
```

**服务启动**

1. sudo service nginx start
2. sudo service nginx stop
3. sudo service nginx restart

**安装MySQL数据库**

##### sudo apt-get install mysql-server

指定配置文件，后台运行 uwsgi， 这时再刷新一下之前打开的页面，就可以看到应用正常运行了。

`uwsgi uconfig.ini `

##### 访问地址

192.168.100.136





#### 日志分类

[Nginx](http://www.jbxue.com/server/nginx/)日志主要分为两种：访问日志和错误日志。日志开关在Nginx配置文件（/etc/nginx/nginx.conf）中设置，两种日志都可以选择性关闭，默认都是打开的。

access_log /var/log/nginx/access.log;

error_log /var/log/nginx/error.log;