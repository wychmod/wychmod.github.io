[toc]
# 安装jdk
```
tar -zxvf jdkxxx
```
配置/etc/profile
```bash
export JAVA_HOME=/root/tot/jdk1.8
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar

source /etc/profile
```
# 安装宝塔界面
# 安装mysql nginx
用宝塔界面安装

## 用navicat 连接 服务器mysql
```mysql
use mysql;    ## 选择mysql数据库
select user,host from user;    ## 查看用户访问端口

update user set host = '%' where user = 'root';

select user,host from user;    ## 查看用户访问端口

mysql> FLUSH PRIVILEGES;    ## 刷新服务配置项

mysql> ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root_pwd'; ## 授权root远程登录 后面的root_pwd代表登录密码

```
> 说明：root用户默认的是localhost，说明只允许从本地登录mysql服务。而我们要从远程以root用户连接数据库，就必须修改host的值，改为**’%’**：允许任何ip访问。

在云服务器的安全组里放行3306

确认防火墙是否启动
```bash
[root@centos7 ~]#  firewall-cmd  --zone=public  --add-port=3306/tcp      --permanent
FirewallD is not running

[root@centos7 ~]# systemctl status firewalld 
● firewalld.service - firewalld - dynamic firewall daemon
Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
Active: inactive (dead) #表示防火强未启动
Docs: man:firewalld(1)


[root@centos7 ~]# systemctl start firewalld 

[root@centos7 ~]# systemctl  status  firewalld 
● firewalld.service - firewalld - dynamic firewall daemon
Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
Active: active (running) since Sun 2021-03-07 20:57:40 CST; 9s ago #active (running)表示防火墙已启动
Docs: man:firewalld(1)
Main PID: 29918 (firewalld)
CGroup: /system.slice/firewalld.service
└─29918 /usr/bin/python2 -Es /usr/sbin/firewalld --nofork --nopid

# 放通防火墙
[root@centos7 ~]#  firewall-cmd  --zone=public  --add-port=3306/tcp      --permanent
success

# 重新添加防火墙规则
[root@centos7 ~]# firewall-cmd --permanent --add-port=3305/tcp
success
[root@centos7 ~]# firewall-cmd --reload 
success

```
之后连接即可。

# 部署java
```shell
# 可以手动部署
java -jar -Dspring.profiles.active=prod wiki.jar

# 或者用下面的shell部署
#!/bin/bash
echo "publish----------"

process_id=`ps -ef | grep wiki.jar | grep -v grep |awk '{print $2}'`
if [ $process_id ] ; then
sudo kill -9 $process_id
fi

source /etc/profile
nohup java -jar -Dspring.profiles.active=prod wiki.jar > /dev/null 2>&1 &

echo "end publish"

```

# 配置nginx
在配置修改中 改成 user  root;
之后找到 include /www/server/panel/vhost/nginx/*.conf;
按照下面路径把conf文件配置进去。
## 配置vue
```conf
server{
  listen 80;
  # server_name 172.81.238.110;
  server_name wychmod.cn;

  location / {
    alias /root/tot/wiki/web/;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

}

```
## 配置java后端反向代理
server_name可以用二级域名，在vue访问接口上面填写二级域名
```
NODE_ENV=production
VUE_APP_SERVER=http://wiki.wychmod.cn
VUE_APP_WS_SERVER=ws://wiki.wychmod.cn
```
```
server{
  listen 80;
  # server_name 8.133.184.84;
  server_name wiki.wychmod.cn;

  location / {
    proxy_pass http://localhost:8880;

    # 针对websocket，需要增加下面的配置
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host:$server_port;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # 代理时长设置600秒，默认60秒，websocket超时会自动断开
    proxy_read_timeout 600s;
  }

}

```