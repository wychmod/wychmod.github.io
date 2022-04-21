## django上线部署

**安装**

1. sudo apt install python3-pip

2. sudo apt install virtualenv

3. sudo apt install nginx

4. sudo apt install mysql-server

5. 创建虚拟环境

   在项目目录下执行 /home/xlg/axf

   virtualenv venv

6. 启动虚拟环境

   source venv/bin/activate

7. 安装django

   pip3 install django==1.11.4

8. 安装pymysql

   pip3 install pymysql

9. 安装uwsgi

   pip3 install uwsgi

10. 上传项目

11. 在项目中创建uconfig.ini的文件 代码在下方

12. 更改setting.py文件中的 STATIC_ROOT

 STATIC_ROOT = os.path.join(BASE_DIR, 'collectstatic')

11. 执行命令

   python3 manage.py collectstatic

12. 更改nginx的default文件代码在下方

13. 更改nginx的nginx.conf文件(403没权限)

14. 重启nginx 

   **服务启动**

   1. sudo service nginx start
   2. sudo service nginx stop
   3. sudo service nginx restart

15. 回到虚拟环境目录启动 uwsgi

   uwsgi uconfig

16. 关闭uwsgi

   uwsgi —stop uconfig.ini

17. 如果关闭不掉杀死进程

   ps -ef | grep uwsgi

   Sudo kill 进程号


项目目录为 /home/xlg/axf/

添加uconfig.ini文件

```python
[uwsgi]

# 外部访问地址，可以指定多种协议，现在用http便于调试，之后用socket  #
socket = 0.0.0.0:8000 # uwsgi的监听端口

# 指向项目目录
chdir =  /home/xlg/axf/

# flask启动程序文件
wsgi-file = axf/wsgi.py


plugins = python# 这行一定要加上，不然请求时会出现-- unavailable modifier requested: 0 --错误提示

# 处理器数
processes = 1n

# 线程数
threads = 2
```

### 问题描述:

django admin没有样式 
admin管理页面找不到base.css,dashboard.css文件

### 解决办法:

#### 方法一

在settings文件中设置STATIC_ROOT目录,该目录不能在STATICFILES_DIRS中. 
然后,执行命令

```python
python manage.py collectstatic
```

执行后,django会将STATICFILES_DIRS下的所有文件以及admin所需要用到的js,css,image文件全都放到STATIC_ROOT目录下.

例如, 像下面这样写:

```python
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'collectstatic')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static'), ]
```

简单描述一下这几个变量的意思 
STATIC_URL: 当访问什么样的网址时, 按照访问静态文件的方式去查找文件. 
STATICFILES_DIRS: 当访问静态文件是, 会在每个app中的static目录中查找, 然后再从STATICFILES_DIRS设置的路径列表中逐一查找. 
STATIC_ROOT: 当执行`python manage.py collectstatic`时, 收集的静态文件放在该目录下. 

##### 更多可参考: [http://python.usyiyi.cn/translate/django_182/ref/settings.html](http://python.usyiyi.cn/translate/django_182/ref/settings.html)

**此刻axf下就会多出一个collectstatic的静态资源文件目录**

/etc/nginx/sites-available/default

default代码更改为

```python
server{
listen  80; # 服务器监听端口
        server_name 192.168.1.132; # 这里写你的域名或者公网IP
        location / {
                uwsgi_pass      127.0.0.1:8000; # 转发端口，需要和uwsgi配置当中的监听端口一致
               	include uwsgi_params; # 导入uwsgi配置
                uwsgi_param UWSGI_PYTHON /home/xlg/axf/venv; #Python解释器所在的路径（这里为虚拟环境）
		 		uwsgi_param UWSGI_CHDIR  /home/xlg/axf/;# 自己创建的目录 项目根目录
        } 
	location /static{
		alias /home/xlg/axf/collectstatic/;
	}
}
```

#### 访问可能会出现403没有权限的问题

**解决办法**

找到nginx.conf文件的位置

将第一行的代码进行修改

```python
#user www-data; 
user root;
或者将 www-data更改权限
```

**此刻就可以访问了**



