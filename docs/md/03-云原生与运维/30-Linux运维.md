# Linux 运维

> **原文归档**：[archive/old-linux-notes/](../archive/old-linux-notes/)
> 包含：12+ 文件（常用命令 / 核心技能 / Shell / Vim / 服务器管理）

## 一、核心主题概述

Linux 运维围绕"**文件系统、用户权限、进程网络、脚本自动化、服务管理、安全加固**"六大主线展开。本笔记汇总了从 CentOS/Ubuntu 基础安装、文件与目录操作、用户与权限管理，到进程监控、Shell 编程、Vim 编辑、systemd 服务管理、SSH 远程连接、防火墙与 SELinux 的完整链路。无论你是管理单台虚拟机，还是维护 Kubernetes 节点，这些命令和原理都是日常排障和自动化的基础。

## 二、Linux 常用命令

### 2.1 文件系统结构

Linux 采用单根目录 `/`，关键目录含义如下：

| 目录 | 作用 |
|------|------|
| `/bin` / `/usr/bin` | 普通用户可执行命令 |
| `/sbin` / `/usr/sbin` | 管理员命令 |
| `/etc` | 系统配置文件 |
| `/home` | 普通用户家目录 |
| `/root` | root 用户家目录 |
| `/var` | 日志、数据库等可变数据 |
| `/tmp` | 临时目录，所有用户可读写 |
| `/proc` | 进程与内核状态信息 |
| `/usr/local` | 管理员手动安装的软件 |

```bash
# 查看目录树
tree -L 1 /
```

### 2.2 文件与目录操作

```bash
ls -la              # 列出详情，含隐藏文件
ll                  # ls -l 的别名
pwd                 # 当前路径
cd ~                # 回到家目录
cd -                # 回到来源目录
mkdir -p a/b/c      # 递归创建目录
rm -rf dir          # 强制递归删除（慎用）
cp -r src/ dst/     # 递归复制
mv old new          # 重命名/移动
touch file.txt      # 创建空文件或更新时间戳
```

### 2.3 文本查看与搜索

```bash
cat file.txt                # 一次性显示
head -n 20 file.txt         # 前 20 行
tail -n 20 -f app.log       # 实时追踪日志
less file.txt               # 分页查看，支持前后翻页
find / -name "*.log"        # 按文件名查找
find /var -size +10M        # 查找大于 10M 的文件
find /tmp -mtime -3         # 3 天内修改的文件
```

### 2.4 文本三剑客

```bash
# grep：按模式过滤
grep "ERROR" app.log
grep -in "error" app.log    # 忽略大小写并显示行号
grep -r "pattern" dir/      # 递归搜索
grep -E "^202[0-9]" file    # 扩展正则

# awk：按列处理
awk '{print $1}' access.log
awk -F ':' '{print $1}' /etc/passwd
awk '{sum+=$1} END {print sum}' nums.txt

# sed：流编辑
sed 's/old/new/g' file.txt  # 全局替换
sed -i 's/foo/bar/g' file   # 直接修改文件
sed -n '10,20p' file        # 只显示 10-20 行
```

### 2.5 排序与统计

```bash
sort file.txt               # 升序排序
sort -n -t ':' -k 3 file    # 按第 3 列数值排序
sort -r file.txt            # 倒序
uniq file.txt               # 去重（仅相邻行）
uniq -c file.txt            # 统计重复次数
wc -l file.txt              # 统计行数
wc -w file.txt              # 统计单词数
```

> 💡 补充：`find` 遍历实际磁盘，`locate` 查文件数据库（需 `updatedb` 更新），日常搜索小文件用 `grep -r`，大目录先用 `locate` 定位。

## 三、文件与权限

### 3.1 权限位解析

```
-rwxr-xr--  1 user group 4096 file
 ↑  ↑  ↑
 |  |  └── others (r=4)
 |  └───── group (r+x=5)
 └────── owner (rwx=7)
```

权限数值：
- `r` = 4，`w` = 2，`x` = 1
- `7` = rwx，`6` = rw-，`5` = r-x，`4` = r--

### 3.2 修改权限与所有者

```bash
chmod 755 file              # rwxr-xr-x
chmod u+x script.sh         # 给所有者加执行权限
chmod -R 755 dir/           # 递归修改
chown user:group file       # 修改所有者和组
chown -R www:www /var/www   # 递归修改
chgrp devops file           # 修改所属组
```

### 3.3 特殊权限与属性

```bash
chmod u+s binary            # SUID
chmod g+s dir               # SGID
chmod +t dir                # Sticky bit
chattr +i file              # 设置为不可变（root 也无法修改）
chattr -i file              # 取消不可变
lsattr file                 # 查看扩展属性
```

### 3.4 链接

```bash
ln file hardlink            # 硬链接：共享 inode，不能跨文件系统，不能对目录
ln -s file symlink          # 软链接：类似快捷方式，可跨文件系统，可对目录
```

> 💡 补充：生产环境中删除日志或数据文件前，先用 `lsof +L1` 检查是否有进程仍持有被删除文件的句柄，避免磁盘空间不释放。

## 四、进程与网络

### 4.1 进程监控

```bash
ps aux                      # 当前进程快照
ps -ef                      # 全格式显示所有进程
ps -u username              # 某用户的进程
ps aux --sort -%cpu | head  # 按 CPU 使用率排序
top                         # 实时进程监控
htop                        # 更友好的 top（需安装）
```

### 4.2 进程控制

```bash
kill PID                    # 正常终止进程
kill -9 PID                 # 强制终止
killall process_name        # 按名称结束进程
pkill -f pattern            # 按匹配模式结束进程
```

### 4.3 前后台与定时任务

```bash
command &                   # 后台运行
nohup command &             # 脱离终端运行
Ctrl + Z                    # 暂停并放入后台
bg                          # 让后台暂停的任务继续运行
fg %1                       # 将编号 1 的任务切回前台
jobs                        # 查看后台任务

# at：一次性延时任务
at 22:10 12/10/26
at> /path/to/script.sh
at> <EOT>

# crontab：周期性任务
crontab -e                  # 编辑定时任务
crontab -l                  # 查看定时任务
# 每分钟执行一次
*/1 * * * * /usr/local/bin/check.sh > /dev/null 2>&1
```

### 4.4 网络诊断

```bash
ping host
curl -I https://example.com
wget -c url                 # 断点续传下载
ss -tlnp                    # 查看监听端口（替代 netstat）
netstat -tlnp               # 查看监听端口
ip addr                     # 查看网卡与 IP
ip route                    # 查看路由表
tracert host                # 路由追踪
```

### 4.5 文件传输

```bash
scp file user@host:/path/   # 基于 SSH 的安全拷贝
scp -P 2222 file user@host:/path/  # 指定端口
rsync -avz src/ user@host:/backup/ # 增量同步
rsync -avz --delete src/ dst/      # 同步删除
sftp user@host              # 交互式安全 FTP
```

> 💡 补充：现代系统优先使用 `ss` 代替 `netstat`，使用 `ip` 代替 `ifconfig`；CentOS 8/RHEL 8+ 已默认不安装 net-tools。

## 五、Shell 脚本

### 5.1 基础语法

```bash
#!/bin/bash
set -e                      # 遇错退出
set -u                      # 使用未定义变量时报错

NAME="wychmod"
echo "Hello, $NAME"
echo "Hello, ${NAME}"       # 推荐带花括号，避免歧义

# 读取输入
read -p "Enter your name: " name

# 数学运算
let "a=5"
let "b=2"
let "c=a+b"
echo $((a + b))

# 条件判断
if [ -f "/etc/passwd" ]; then
    echo "exists"
else
    echo "missing"
fi

# 循环
for i in {1..5}; do
    echo "iter $i"
done

for file in *.sh; do
    echo "$file"
done

# 函数
greet() {
    echo "Hello, $1"
}
greet "world"
```

### 5.2 数组与局部变量

```bash
array=('value0' 'value1' 'value2')
echo "${array[2]}"
echo "${array[*]}"

func() {
    local var="local"
    echo "$var"
}
```

### 5.3 实战：部署脚本

```bash
#!/bin/bash
set -e

APP_NAME="myapp"
VERSION="${1:-latest}"
DOCKER_IMAGE="myregistry.com/$APP_NAME:$VERSION"
K8S_DEPLOYMENT="web-deploy"

# 构建并推送镜像
docker build -t "$DOCKER_IMAGE" .
docker push "$DOCKER_IMAGE"

# K8s 滚动更新
kubectl set image deployment/"$K8S_DEPLOYMENT" \
    web="$DOCKER_IMAGE"

# 等待完成
kubectl rollout status deployment/"$K8S_DEPLOYMENT"
```

> 💡 补充：写 Shell 脚本时，变量尽量加双引号（如 `"$VAR"`），避免路径含空格时解析异常；关键步骤前用 `set -euo pipefail` 提高健壮性。

## 六、Vim 与文本处理

### 6.1 Vim 模式

- **普通模式（Normal）**：默认模式，用于移动、删除、复制
- **插入模式（Insert）**：按 `i` 进入，编辑文本
- **命令模式（Command）**：按 `:` 进入，保存、退出、替换
- **可视模式（Visual）**：按 `v` / `V` / `Ctrl+v` 进入，用于块选

### 6.2 常用命令

```vim
i               # 进入插入模式
Esc             # 返回普通模式
:w              # 保存
:q              # 退出
:wq 或 :x       # 保存并退出
:q!             # 强制退出不保存

0               # 行首
$               # 行末
gg              # 文件开头
G               # 文件末尾
:wq             # 保存退出

dd              # 删除整行
yy              # 复制整行
p               # 粘贴到下一行
u               # 撤销
Ctrl+r          # 重做

/pattern        # 向后搜索
?pattern        # 向前搜索
n               # 下一个匹配
N               # 上一个匹配
:%s/old/new/g   # 全局替换
```

### 6.3 分屏与外部命令

```vim
:sp file        # 水平分屏
:vsp file       # 垂直分屏
Ctrl+w w        # 切换窗口
Ctrl+w q        # 关闭当前窗口
:!command       # 不退出 Vim 执行外部命令
:set nu         # 显示行号
:set nonu       # 隐藏行号
:syntax on      # 语法高亮
```

> 💡 补充：Vim 配置可写入 `~/.vimrc`，常用配置包括 `set nu`、`set tabstop=4`、`set expandtab`、`set mouse=a`；新手可通过 `vimtutor` 30 分钟快速入门。

## 七、服务管理与部署

### 7.1 systemd 服务管理

```bash
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx        # 不中断服务重载配置
systemctl status nginx
systemctl enable nginx        # 开机自启
systemctl disable nginx       # 取消开机自启
systemctl list-units --type=service --state=running
journalctl -u nginx -f        # 实时查看服务日志
journalctl -u nginx --since "1 hour ago"
```

### 7.2 软件包管理

```bash
# CentOS / RHEL / Rocky / AlmaLinux
yum update
yum install nginx
yum remove nginx
yum search nginx
rpm -ivh package.rpm

# Ubuntu / Debian
apt update
apt upgrade
apt install nginx
apt remove nginx
apt search nginx
dpkg -i package.deb
```

### 7.3 防火墙

```bash
# firewalld（CentOS/RHEL）
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
firewall-cmd --list-all

# ufw（Ubuntu）
ufw allow 80/tcp
ufw allow from 192.168.1.0/24 to any port 22
ufw enable
ufw status verbose

# iptables
iptables -L -n -v
```

### 7.4 SSH 与密钥认证

```bash
# 生成密钥对
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id user@host

# SSH 配置文件 ~/.ssh/config
Host myserver
    HostName 192.168.1.100
    User wychmod
    Port 22
    IdentityFile ~/.ssh/id_ed25519

# 连接
ssh myserver
```

### 7.5 SELinux

```bash
sestatus                    # 查看 SELinux 状态
getenforce                  # 查看当前模式
setenforce 0                # 临时关闭（Permissive）
setenforce 1                # 临时开启（Enforcing）
semanage fcontext -a -t httpd_sys_content_t "/web(/.*)?"
restorecon -Rv /web
```

> 💡 补充：生产环境不建议永久关闭 SELinux，可通过 `semanage` 配置正确的上下文规则；遇到"权限拒绝"但文件权限正常时，优先检查 `audit2why` / `audit2allow` 给出的 SELinux 告警。

## 八、2026 年 Linux 运维趋势

1. **eBPF 可观测性**：通过 `bpftrace`、`bcc`、`Pixie` 实现内核级无侵入监控，替代传统 `strace`/`tcpdump` 的部分场景。
2. **systemd 一统化**：`systemd-networkd`、`systemd-resolved`、`systemd-homed` 逐步替代传统网络与用户管理工具。
3. **不可变基础设施**：容器镜像、OSTree、Fedora CoreOS / Flatcar 成为云端节点交付标准。
4. **容器运行时多元化**：Docker 之外，Podman（rootless）、containerd、cri-o 在 Kubernetes 场景更常见。
5. **GitOps 与 IaC**：Ansible、Terraform、Pulumi 管理配置与基础设施，变更可追溯、可回滚。
6. **云原生可观测栈**：Prometheus + Grafana + Loki + Tempo 替代 ELK，成为日志-指标-追踪三支柱。
7. **安全左移**：SBOM（软件物料清单）、镜像漏洞扫描（Trivy、Grype）、最小化基础镜像（Distroless、Alpine、Wolfi）。
8. **AI 辅助运维**：LLM 用于日志解析、Runbook 生成、故障根因分析，但关键操作仍需人工确认与审计。

## 九、常见坑与补充

> 💡 补充：`rm -rf /` 这类命令极其危险，建议在 `.bashrc` 中为 `rm` 设置别名 `alias rm='rm -i'`，或养成使用 `trash-cli` 的习惯。

> 💡 补充：不要随意给生产目录 `chmod 777`，应遵循最小权限原则；Web 目录通常给 `755` 目录、`644` 文件，必要时通过 ACL（`setfacl`）做细粒度授权。

> 💡 补充：修改 `/etc/sudoers` 时务必使用 `visudo`，避免语法错误导致所有用户无法提权。

> 💡 补充：`kill -9` 会强制终止进程且不触发优雅关闭，数据库、消息队列等应先尝试 `kill -15`（SIGTERM）。

> 💡 补充：定时任务中尽量使用绝对路径，并将输出重定向到日志文件，否则可能因环境变量缺失或垃圾邮件（cron mail）导致异常被忽略。

> 💡 补充：使用 `tar` 归档时，建议同时压缩以节省空间：`tar -zcvf backup.tar.gz dir/`（gzip）或 `tar -jcvf backup.tar.bz2 dir/`（bzip2）。

> 💡 补充：docx 格式的服务器与 MySQL 安装资料见 [linux安装服务器和mysql.docx](../archive/old-linux-notes/linux安装服务器和mysql.docx)。

---

# 以下为原内容存档

## Linux常用命令.md

# linux常用命令

## 一、linux文件系统结构

   ~~~
   sudo apt-get install tree
   tree --help  #查看帮助
   tree -L 1  #显示文件目录
   ~~~

   ~~~
root@ubuntu16 /# tree -L 1
.           #系统根目录
├── bin     #存放常见的命令
├── boot    #系统启动文件和核心文件都在这个目录
├── cdrom   #光驱
├── dev     #存放设备文件，包括硬盘、光驱、键盘、鼠标等
├── etc     #系统配置文件都在这个目录下
├── home    #普通用户的家目录
├── lib     #系统链接库
├── lib64   #64位的链接库
├── lost+found   #系统自动生成的，如果文件系统出错，会在目录下产生文件，记录错误
├── media        #系统自动挂载的光驱、usb等
├── mnt          #mount简写 挂载其他文件系统
├── opt          #可在此安装第三方软件 
├── proc         #系统进程的信息、系统状态信息
├── root         #超管的目录
├── run          #进程运行数据
├── sbin         #管理员的命令，普通用户无法使用
├── srv          #服务信息
├── sys          #系统相关
├── tmp          #临时目录，所有用户都具有读写权限
├── usr          #unix software resource  用户的软件安装到这个目录
|    ├── bin     #应用程序的可执行文件
|    ├── sbin    #用户或超管的标准命令
|    ├── local   #管理员安装的应用程序目录
|    └── share   #共享文件目录
└── var          #存放不断扩充的文件。比如数据库文件、日志文件
     ├── log     #日志目录，各种应用的日志
     └── run     # /run的软连接
   ~~~


## 二、常见命令

1. ls

   列出目录下的文件或子目录

   ~~~shell
   ls [参数]    #中括号表示可选
   ls  -l    #以列表方式显示文件的详细信息
   ls  -a   #显示隐藏文件，隐藏文件的文件名以.开头
   ls  -al  #

   ls --help #查看命令参数
   ~~~
   ~~~shell
   drwxr-xr-x  2 python python     4096 3月  28 11:20 Templates
   drwxr-xr-x  2 python python     4096 3月  28 11:20 Videos
   ~~~


   第一部分：表示文件类型  d代表目录，-代表普通文件，l代表软连接
   第2部分，2-10列代表文件的权限：rwxr-xr-x.
   第3部分：数字代表文件的链接数
   第四部分：root代表文件的所有者
   第5部分：root表示文件属于哪个用户组
   第6部分：数字的表示文件大小，以字节为单位
   第7部分：时间，表示文件的修改时间
   第8部分：文件名
   ~~~

   ~~~shell
   #文件权限
   drwxr-xr-x.  2 root root 4096 Nov 20 07:36 tmp
   r：read  可读
   w：write 可写
   x：excute  可执行
   -：表示无权限

   权限：
       2-4位   ower  文件的所有者    
       5-7位   group：用户组
       8-10位  other：其他用户

   ~~~

2. ll

   ~~~
   以列表方式显示，其实是ls -l的别名
   白色代表普通文件
   绿色代表可执行文件
   蓝色代表目录
   ~~~

3. man命令

   ~~~shell 
   #命令的帮助文档
   sudo apt-get  install man
   #用法：
      man  命令名
   常用的快捷键
   空格 f     下翻页
   b          上翻页
   shift + g   到文件末尾
   g         文件开头
   q         退出
   上下箭头   前翻和后翻
   回车键     后翻
   home      回到开始
   ~~~

4. history命令

   查看你敲过的命令

5. 硬链接和软连接

   文件都有文件名与数据，这在 Linux 上被分成两个部分：用户数据 (user data) 与元数据 (metadata)。用户数据，即文件数据块 (data block)，数据块是记录文件真实内容的地方；而元数据则是文件的附加属性，如文件大小、创建时间、所有者等信息。在 Linux 中，元数据中的 inode 号（inode 是文件元数据的一部分但其并不包含文件名，inode 号即索引节点号）才是文件的唯一标识而非文件名。文件名仅是为了方便人们的记忆和使用，系统或程序通过 inode 号寻找正确的文件数据块。

   为解决文件的共享使用，Linux 系统引入了两种链接：硬链接 (hard link) 与软链接（又称符号链接，即 soft link 或 symbolic link）。链接为 Linux 系统解决了文件的共享使用，还带来了隐藏文件路径、增加权限安全及节省存储等好处。

   -   一个 inode 号对应多个文件名，则称这些文件为**硬链接**

   ~~~
   link 源文件名 新文件名 
   ln 源文件名 新文件名 

   stat 文件名 #查看文件信息
   ls -i  #查看目录下文件的硬链接数
   python@ubuntu:/csl$ ls -la
   total 4
   913923 lrwxrwxrwx. 1 root root    5 Mar 18 16:20 2.txt -> 1.txt
   913926 -rw-r--r--. 2 root root    0 Mar 18 19:58 31.txt
   913926 -rw-r--r--. 2 root root    0 Mar 18 19:58 32.txt
   913925 -rwxr-xr-x. 1 root root    0 Mar 18 17:29 5.txt
   913924 drwxr-xr-x. 2 root root 4096 Mar 18 17:29 test

   # 硬链接的特点：
      1.只能对已存在的文件进行创建；
      2.不能交叉文件系统进行硬链接的创建；
      3.不能对目录进行创建，只可对文件创建；
      4.删除一个硬链接文件并不影响其他有相同inode 号的文件。

   ~~~


   -   软连接	

软链接与硬链接不同，若文件用户数据块中存放的内容是另一文件的路径名的指向，则该文件就是软连接。软链接就是一个普通文件，只是数据块内容有点特殊。软链接类似快捷方式

~~~~
ln -s 源文件 目标文件。
   
软连接的特点：
   软链接有自己的文件属性及权限等；
   可对不存在的文件或目录创建软链接；
   软链接可交叉文件系统；
   软链接可对文件或目录创建；
   创建软链接时，链接计数 i_nlink 不会增加；
   删除软链接并不影响被指向的文件，但若被指向的原文件被删除，则相关软连接被称为死链接
~~~~


   ​

## 三、目录管理

1. 绝对路径和相对路径

   linux的目录和windows不同，不区分盘符，只有一个根目录，根目录用/表示。

   - 绝对路径：从根目录到当前文件（目录）的路径，比如：/home/python
   - 相对路径：以当前目录为基准，表示上级目录或子目录
     - 用 . 表示当前目录，一般执行shell脚本可以用 . 1.sh或者 ./1.sh
     - 用..表示上级目录 
   - linux目录分隔符只能用正斜线（/）表示
   - 用 ~ 表示用户主目录，用 - 表示来源目录（你从哪个目录切换到当前目录的）

2. 目录切换

   ~~~
   cd 目录名  #切换目录
    .  #当前目录
    ..  #代表上级目录
    /   #代表根目录
    ~   #用户家目录  root用户的家目录/root   普通用户的家目录/home/用户名
    cd /etc/yum.repos.d
    cd / #切换到根目录
    cd -  #切换到来源目录
    cd ~ #返回用户的家目录
    
    pwd #显示当前的目录名
   ~~~

3. 提示信息

   ~~~
   [root@localhost ~]# cd /
   [root@localhost /]$
   root代表用户名
   localhost 主机名
   ~ 用户的家目录
   /  根目录
   # 表示超级管理员在操作
   $ 普通用户在操作
   ~~~

4. 创建目录   

   ~~~
   sudo mkdir  目录名
   sudo mkdir -p  目录名    #递归创建目录
   sudo mkdir -p  h1801/1/2
   sudo mkdir -p  1/{2,3}/{4,5,6} #
   ~~~

5. 删除目录  rmdir

   ~~~
   sudo rmdir [option]  目录名    #删除的时候目录必须为空
   sudo rmdir -p  目录名   #递归删除空目录
   sudo rmdir -p 1/2/3 #1,2,3目录都必须不能有文件
   ~~~
   ​

## 四、文件操作

1. 文件创建  

   ~~~
   sudo touch  文件名 [文件名2] [文件名3]....   #创建多个空文件,如果文件存在，自动忽略，不会覆盖
   echo 'hello world'  > 1.txt   #可以将显示内容输出到文件，但会覆盖原来的内容，文件不存在则创建
   echo '世界，你好'    >> 1.txt  #将显示内容追加到文件末尾，文件不存在则创建
   # >  >> 输出重定向
   ~~~

2. 文件移动

   ~~~
   sudo mv 源文件   目标文件   #销毁原件
   sudo mv  1.txt  ./lpl/  #将1.txt移动到字目录lpl下，文件名不变
   sudo mv  1.txt  2.txt   #如果在同一个目录就是文件重命名  将1.txt重命名为2.txt
   ~~~

3. 文件拷贝

   ~~~
   sudo cp 源文件   目标文件
   sudo cp -r  源目录   目标目录   #递归拷贝目录
   ~~~

4. 文件删除

   ~~~
   sudo rm  文件名  
   sudo rm -i 文件名  #删除前逐一确认
   sudo rm  -f  文件名   #删除文件不带提示
   sudo rm -rf  目录名   #递归删除目录
   ~~~

5. 文件查看

   ~~~shell
   cat  文件名       #输出文件内容，从前往后输出，
   tac   文件名      #cat的反写，从后往前输出
   head -n N  文件名   #显示文件的前几行，可以指定查看的行数，默认显示10行
   tail -n N 文件名   #显示文件的最后几行，可以指定查看的行数
   tail -f  cat 文件名   #实时显示文件内容
   watch -d -n 秒杀 cat 文件名  #实时显示文件内容 有高亮
   sudo vi  文件名   
   more  文件名       #从前往后查看，可以翻屏 ,不能往前翻  回车一行行查看，空格翻屏  q退出
   less  文件名       #和more类似，可以前翻页，g首页 G尾页，b前翻页，空格和f后翻页，q退出
   stat  文件名       #查看文件详细信息

   stat 2.txt
     File: `2.txt'
     Size: 146       	Blocks: 8          IO Block: 4096   regular file
   Device: fd00h/64768d	Inode: 913936      Links: 1
   Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
   Access: 2017-11-21 00:44:49.108999194 -0500
   Modify: 2017-11-21 00:44:43.773000078 -0500
   Change: 2017-11-21 00:44:43.775000065 -0500

   ~~~

6. 文件查找

   - find

   ~~~
   # find 用于在系统内搜索指定文件
   用法：
      find [路径] [参数]
        -name  按文件名查找
        -mtime +/-n  #-n表示n天以内修改的文件，+n表示修改超过n天的文件
        -user   #按文件属主查找
        -size [+/-]n[c/k/M/G] #查找文件长度为n块，+表示大于，-表示小于；c是字节 
        -perm 权限数值    #按照文件权限进行查找
        
   find /  -name  "文件名"  		 #从根目录查找指定文件名的文件
   find /csl/sh1702 -name "2.txt"  #查找指定目录先的文件
   find /tools -mtime -3           #查找tools目录下修改时间是3天以内的文
   find /tools  -size 12c 		   #查找长度为12字节的文件
   find /var ‐perm 0642 ‐size +10k ‐size ‐100k ‐name '*.log' #在/var目录下，查找10-100k

   grep  hello  2.txt  #查找文件内容

   ls -al | grep 1.php    # |管道操作，将ls -al操作结果传递给grep，grep 在查找结果搜索指定文件名
    
    which 命令名   #查找命令
    whereis  文件名     #只能搜索命令、源文件、二进制文件
   ~~~
   - grep

   ~~~
   #grep 用于搜索文件内容
   用法：
      grep [options] 'pattern' filename
        -i  不区分大小写
        -r  递归查找子目录
        -l  列出文件内容符合指定的范本样式的文件名称。
        -n  显示行号
        -w  只匹配单词，不是匹配单词一部分
        -E 按正则表达式搜索
        --include '*.py'  #仅搜索py文件
        --exclude '*.py'  #不搜索py文件
      
      #只在目录中所有的.php和.html文件中递归搜索字符"echo"
      grep "Root" -w -n -i /etc/passwd

   ~~~

7. 文件内容统计（wc）

   ~~~
   用法：
      wc [options] [文件列表]
         -l  统计有多少行
         -w  统计有多少单词
    $ wc -l  /etc/passwd  #统计passwd有多少用户
   ~~~

   ​

8. awk

   awk就是把文件逐行的读入，以空格为默认分隔符将每行切片，切开的部分再进行各种分析处理。

   ~~~
   语法：awk '{pattern + action}' {filenames}
   cat /etc/passwd |awk  -F ':'  '{print $1}'   #$1显示第一列  -F 指定分割符为':'
   ~~~

   ​

9. sort

   sort将文件/文本的每一行作为一个单位，相互比较，比较原则是从首字符向后，依次按[ASCII](http://zh.wikipedia.org/zh/ASCII)码值进行比较，最后将他们按升序输出。

   ~~~
   sort(选项)(参数)
   选项：
      -u忽略相同行
      -k 按指定列排序
      -n 按数值排序
      -t 分割符
      -r 逆序
    #指定passwd文件按第三列 的数值比较，列之间的分隔符为：
    cat /etc/passwd | sort -n -t ':' -k 3  
   ~~~

   ​

## 五. 文件权限

   1.文件权限修改

   ```
   -rwxr-xr-x.  1 root root   24 Nov 21 20:26 1.sh
   -rw-r--r-x.  1 root root    0 Nov 20 07:37 1.txt
   -rw-r--r--.  1 root root    0 Nov 20 07:37 2.txt

   #1.数字表示
   r  4 100   读
   w  2 010   写
   x  1 001   执行
   -  0       没有权限
   rwx   7 可读可写可执行
   rwxrw-r-- 764  文件拥有者可读可写可执行  文件所属的组可读可写  其他人可读

   #2.符号表示
   u  表示文件的拥有者 
   g  文件所属的组
   o  其他人
   a  所有的人  all

   u+/-/=  u=rwx  g+x  o-r
   + 表示增加权限
   -  削减权限
   =  赋权限
   chmod o-x 32.txt   #削减其他用户的可执行权限
   chmod a=rwx 32.txt  #给所有人赋可读可写可执行权限
   chmod o+x,g+w 32.txt
   chmod o=x 32.txt
   ```

   - chmod 

         ~~~
        用法：
            chmod  权限  文件名/目录
            chmod  -R  权限  目录  递归修改目录及其子目录的所有文件的权限

         #数字表示
         chmod 641  1.sh  
         
         #符号表示
         chmod a=rwx 1.sh
         chmod g-w 1.sh
         chmod -R  o+w tmp   #递归修改tmp及其子目录中所有文件的权限
         ~~~


2. chown(change owner) 修改文件的所有者

    ~~~
    要求：所有者必须在/etc/passwd文件中

         chown 用户名  文件名/目录名 
         chown 用户名:组名  文件名/目录名
         chown :组名  文件名/目录名
         chown -R 用户名  文件名/目录名
         
         chown csl 1.sh
         chown csl:csl 1.sh  #修改用户和所属组
    ~~~

3.  修改用户组 chgrp(change group )


         chgrp 组名  文件名/目录名
         chgrp -R 组名  文件名/目录名
         chgrp -R csl tmp  #递归修改tmp及其子目录下文件所属组  

4. lsattr/chattr 修改和查看文件只读属性

    lsattr  文件名   查看文件的只读属性,使用ls无法查看
    chattr +/-i 文件名  给文件增加或去除只读属性
    chattr +/-a 文件名  只能追加数据，不能修改或删除
    lsattr 3.py  #3.py有只读属性
    ----i--------e- 3.py

    chattr -i 3.py  #去掉只读属性
    chattr +i 3.py  #添加只读属性

 ## 六.  用户管理
   1. 用户和组

       - 一个用户必须有一个主组
       - 一个用户可以有多个组
       - 一个组可以有多个用户
       - 用户账户的信息存放在/etc/passwd文件中；用户的密码存放到/etc/shadow，该文件只有root可以修改；组账户信息存放到/etc/group中

   2. useradd 添加一个用户

       ~~~
       用法：
          useradd [-gud] 用户名  
            -g 指定主组名或组id
            -u 指定用户的id
            -m 自动建立用户主目录
            -d 指定用户的家目录
            -s 指定用户登录后使用shell，默认是/bin/bash
          #创建一个用户没有指定组，则默认创建一个和用户名一样的组，作为用户的主组

       所有的用户都在/etc/passwd文件中
       luoming:x:501:501::/home/luoming:/bin/bash
       用户名  密码 用户id  用户所属组的id  用户的家目录   shell
                     uid     gid
       #Ubuntu 特别提供了一个adduser 命令以交互模式创建用户，
       adduser csl
       ~~~

​

3. 删除用户 userdel

~~~
userdel -r 用户名  删除用户同时删除家目录（家目录要和用户名一致才能删除）
#如果用户登录了无法删除，应该先切换用户，然后kill -9 用户进程号，然后在删除
~~~
4. 修改用户信息  usermod

       usermod [option]  用户名
            -u  用户id
            -g  主组id
            -G  附属组名称
            -a  将用户添加到附属组，必须与-G配合使用
            -d  用户的家目录
            -l  用户登录名
          sudo usermod -u 1001 -g 999 -l lkz  liwenkai
          sudo usermod -a -G csl python  #将用户python添加到附属组csl中
          sudo usermod -l newusername  oldusername #修改用户名

5.  修改用户密码

    用法：
        passwd [-lu] 用户名
           -l 锁定账户密码
           -u 解锁账户密码
     root 可以修改其他用户的密码
     普通用户只能修改自己的密码

6. su和sudo

​    Ubuntu默认禁止使用root账户，在系统安装的时候，创建的第一个用户作为管理员（属于sudo组），其权限要低于root，但比普通用户高，普通用户只能处理自己创建的东西，管理员可以安装软件、修改日期、删除用户等。在Ubuntu中一般看到提示符是$，当执行需要root权限操作的时候需要提升权限，我们可以使用sudo暂时提升用户权限

   我们也可以使用sudo切换用户身份，可以切换到root或管理员，完成工作后再切换回来

```shell
用法：
   sudo  命令  #需要输入用户自己的密码
   
用法：   
   su    用户名  #需要输入目标用户的密码
root切换到普通用户不用输入密码
普通用户切换，必须输入密码
因为Ubuntu默认提供root密码，不能直接由su切换到root，可以先使用sudo来获取root权限
$ sudo su root  #临时切换到root

#启用root账户
$ sudo password root #根据提示为root输入密码
```

7.其他命令

- id  查看用户的id和组信息
- groups查看用户的组
- whoami 查看当前的用户是谁 

 ## 七.  组管理

     #添加一个组
     groupadd 组名
          
        1702:x:1001:
        组名 密码  gid
     groupdel  组名  #删除组
     groupmod  -n 新组名  旧组名
     groups 显示用户的组
     
     #所有的组信息都在/etc/group文件中记录

## Linux基础知识和命令.md

# Linux基础知识和命令

> ## 基本知识
- ### 切换管理员用户
-  用sudo su命令
- 命令行提示符变成[root@VM_0_14_centos ~]#
- 退出root身份,可以用Ctrl+D的组合键,或者用exit命令
- hostname 能够知道机器名称
- whoami 能知道当前用户
- ### 查找命令，补全命令
- Linux的开发者们早就为我们准备了对策:用Tab键来补全命令
- Tab键可以补全命令,也可以补全文件名、路径名:按两次Tab键
- ### 命令的历史记录
- 向上键:按时间顺序向前查找用过的命令,每按一次就前进一个命令
- 向下键:接时间顺序向后査找用过的命令,每按一次就前进一个命令
- Ctr+R:用于查找使用过的命令
- ### history命令
- history是英语“历史,历史记录”的意思
- history命令用于列出之前使用过的所有命令
- 可以用!编号这样的格式来重新运行 history输出中对应编号的命令
```
  298  2020-02-20 12:12:45 date
  299  2020-02-20 12:14:31 c
  300  2020-02-20 12:16:18 ls -a
  301  2020-02-20 12:31:32 history
[root@VM_0_14_centos ~]# !298
date
```
- ### 实用的快捷键
- Ctrl+L用于清理终端的内容,就是清屏的作用。同 clear命令
- Ctrl+D给终端传递EOF( End Of File,文件结東符)
- Shift+PgUp用于向上滚屏,与鼠标的滚轮向上滚屏是一个效果
- Shift+PgDn用于向下滚屏,与鼠标的滚轮向下滚屏是一个效果
- Ctrl+A光标跳到一行命令的开头。Home键有相同的效果
- Ctrl+E光标跳到一行命令的结尾。End键有相同的效果
- Ctrl+U删除所有在光标左侧的命令字符
- Ctrl+K删除所有在光标右侧的命令字符
> ## date命令
- date是“日期”的意思,用于显示当前时间
- CST是 Central Standard Time的缩写,表示“中央标准时间
```
[root@VM_0_14_centos ~]# date
Thu Feb 20 12:03:58 CST 2020
```
> ## ls命令
```
[root@VM_0_14_centos ~]# ls
mysql  Pipfile  py3  whyhu

[root@VM_0_14_centos ~]# ls -a
.              .config               .pip              .ssh
..             .cookiecutter_replay  Pipfile           .tcshrc
.bash_history  .cookiecutters        .pki              .viminfo
.bash_logout   .cshrc                py3               whyhu
.bash_profile  .local                .pycharm_helpers
.bashrc        mysql                 .pydistutils.cfg
.cache         .mysql_history        .python_history

```
> ## 文件和目录组织命令
- ### 普通的文件
- 文本类型的文件(.txt,.doc,.odt,等等)
- 声音文件(wav,mp3,.ogg),还有程序,等这样的文件在 Windows中也有
- ### 特殊的文件
- 其他一些文件是特殊的,因为它们表示一些东西
- 例如,你的光盘驱动器就是这类特殊的文件
- ### linux一切都是文件
- Linux有且只有一个根目录,就是/(斜杠)
- Linux中没有比根目录再高一阶的目录了,没有目录包含根目录
- 根目录就是 Linux最顶层的目录:"万有之源,斜杠青年
- ### Linux的根目录的直属子目录:bin
- bin:是英语 binary的缩写,表示"二进制文件
- (我们知道可执行文件是二进制的)
- bin目录包含了会被所有用户使用的可执行程序
- ### Linux的根目录的直属子目录:home
- home:英语home表示“家"。
- 用户的私人目录在home目录中,我们放置私人的文件类似 Windows中的 Documents文件夹,也叫“我的文档
- Linux中的每个用户都在home目录下有一个私人目录(除了大管家用户root)
- root用户拥有所有权限,比较“任性",跟普通用户不住在一起
- ### Linux的根目录的直属子目录:Iib
- lib:英语 library的缩写,表示“库”
- lib目录包含被程序所调用的库文件,例如.so结尾的文件
- Windows下这样的库文件则是以.d结尾
- ### which命令:获取命令的可执行文件的位置
- Linux下,每一条命令其实对应了一个可执行程序
- 在终端中输入命令,按回车的时候,就是执行了对应的那个程序
- pwd命令对应的pwd程序就是存在于 Linux中的
```
[root@VM_0_14_centos ~]# which pwd
/usr/bin/pwd
```
> ## 浏览和切换目录
- ### ls命令
- -a:显示所有文件和目录,包括隐藏的
- -l:参数使得ls命令列出一个显示文件和目录的详细信息的列表
- -h:以K,M,G的形式显示文件大小
- -t:按文件最近一次修改时间排序
- ### du命令显示目录大小
- -a:显示文件和目录的大小
- -s:只显示总计大小
- -h:以K,M,G的形式显示文件大小
> ## 浏览和创建文件
- ### cat和less命令：显示文件内容
- ### /var/og中有很多日志文件
- /var这个目录通常包含程序的数据
- log是英语“日志”的意思
- log文件通常会记录电脑中发生了什么事
- ### cat命令:ー次性显示文件的所有内容
- cat是 concatenate的缩写,表示“连接/串联
- cat命令可以一次性在终端中显示文件的所有内容
- 用法:只需要在命令后加上想要显示的文件路径即可
- cat -n 可以带上行数
- ### more命令:显示文件内容
- 从前往后查看，可以翻屏 ,不能往前翻  回车一行行查看，空格翻屏  q退出
- ### less命令:分页显示文件内容
- 和more类似，可以前翻页，g首页 G尾页，b前翻页，空格和f后翻页，q退出，回车和下箭头下一行
- = 显示文件中的位置
- /(斜杠):进入搜索模式，在斜杠后面输入你要搜索的文字,按下回车键就会把所有符合的结果都标识出来
- 要在搜索所得结果中跳转,可以按n键(跳到下ー个符合项目)按N键( shift 键+n。跳到上一个符合项目)正则表达式( Regular Expression)也是可以用在搜索内容中
- ### head命令和tail命令:显示文件的开头和结尾
- head用于显示文件的开头几行,tail用于显示文件结尾的几行
- 默认情况下,head/tail会显示文件的头/尾10行
- 可以指定显示的行数,用-n这个参数
- tai命令还可以配合-f参数来实时追踪文件的更新，可以配合-s 每多少秒检查一下
- ### touch命令:创建一个空白文件
- touch命令其实一开始的设计初衷是修改文件的时间戳，让电脑以为文件是在那个时候被修改或创建的
- 如果 touch命令后面跟着的文件名是不存在的文件,它会新建
- 如果创建文件名有空格，可以加引号限定
```
[root@VM_0_14_centos ~]# touch new_file
[root@VM_0_14_centos ~]# ls
mysql  new_file  new_folder  Pipfile  py3  whyhu
```
- ### mkdir命令:创建一个目录
- mkdir命令就是用于创建一个目录的
- mkdir是mk和dir的缩合
- mk是make的缩写,表示“创建dir是 directory的缩写,表示“目录
- 还可以用-p参数来归创建目录结构: mkdir-pone/two/ three
```
[root@VM_0_14_centos ~]# mkdir new_folder
[root@VM_0_14_centos ~]# ls
mysql  new_file  new_folder  Pipfile  py3  whyhu
```

> ## 文件的肤质和移动操作
### cp命令:拷贝文件就目录
- cp是英语copy的缩写,表示“拷贝”
- cp命令不仅可以拷贝单个文件还可以拷贝多个文件,也可以拷贝目录
- 拷贝目录,只要在cp命令之后加上-r或者-R参数，表示递归
### 使用通配符*号(星号)
- cp* txt folder:把当前目录下所有tt文件拷贝到 folder目录中
### mv命令:移动文件
- mv是英语move的缩写,表示“移动”。
- mν命令有两个功能移动文件(或目录)重命名文件(或目录)
### rm命令:删除文件和目录
- -i参数:向用户确认是否删除
- -f参数:慎用,不会询向是否删除,强制删除
- -r参数:递归地删除
> ## 文件的删除和链接
### In命令:创建链接
- In是link的缩写,在英语中表示“链接”
- In命令用于在文件之间创建链接
- 事实上, Linux下有两种链接类型
- **Physical link:物理链接或硬链接**
- **Symbolic link:符号链接或软连接**
### 文件的存储
- 其实每个文件有三部分:文件名,权限和文件内容
- 这里简化地将文件分为两部分:文件名和文件内容
- 每个文件的文件内容被分配到一个标示号码,就是 inode
- 因此每个文件名都绑定到它的文件内容(用 inode标识)
### 创建硬链接
- **硬链接原理：使链接的两个文件共享同样文件内容,就是同样的 inode**
- 一旦文件1和文件2之间有了硬链接，那么你修改文件1或文件2,修改的是相同的一块内容
- 硬链接缺陷:只能创建指向文件的硬链接,不能创建指向目录的
- 通过一些参数的修改,也可以创建指向目录的硬链接，比较复杂
- 软链接可以指向文件或目录。对于目录,一般都是用软链接
- 要创建硬链接,直接用n命令,不加任何参数: In file1 file2
- rm file1来删除file1,对file2也没什么影响对于硬链接来说,删除任意一方的文件共同指向的文件内容并不会从硬盘上被删除
### 创建软链接
- 和Windows的快捷方式一模一样。
- in- s file1file2:创建了file1的软链接file2

> ## 用户和权限
### sudo命令:以root身份运行命令
### Linux下的用户组织
- 在 Linux中,理论上说来,我们可以创建无数个用户
- 但是这些用户是被划分到不同的群组里面的
- 有一个用户,名叫root,是一个很特殊的用户

### useradd命令:添加新用户
- useradd命令,很容易理解其作用,因为完全可以顾名思义
- user是英语“用户”的意思,add是英语添加”的意思
- useradd用于添加用户。用法:命令后接要创建的用户名
```
[root@VM_0_14_centos ~]# useradd wychmod
[root@VM_0_14_centos ~]# ls /home
wychmod
```
### passwd命令:修改密码
- passwd命令可以修改用户的密码
- passwd是 password这个英语单词的缩写,表示“密码”
- 用法类似 useradd,只要在其后加上需要修改密码的那个用户名
```
[root@VM_0_14_centos ~]# passwd wychmod
Changing password for user wychmod.
New password:
Retype new password:
passwd: all authentication tokens updated successfully.
```
### userdel:删除用户
- 可以用 userde命令来删除已创建的账户
- userdel是 delete和user的缩写
- delete是英语“删除”的意思,user是“用户”的意思
- -r home目录下的用户将被删除。

> ## 群组的管理
### groupadd:创建群组
- 用法也很简单,和 useradd命令类似,后接需要创建的群组名
- 如: groupadd friends
- 创建一个名为 friends 的群组, friends是英语“朋友”的意思
### usermod命令:修改用户账户
- usermod是user和 modify的缩写
- user是英语“用户”的意思, modify是“修改”的意思
- usermod命令用于修改用户的账户
- -i:对用户重命名。/home中的用户家目录名不改变,需要手动修改
- -g:修改用户所在群组
- 可以将一个用户添加到多个群组,用-G参数(大写的G)
- usermo -G friends, happy, funny thomas
- -a:追加到某个群组
- usermod-aG good thomas
```

[root@VM_0_14_centos ~]# ls -l /home
total 4
drwx------ 4 wychmod wychmod 4096 Feb 22 00:39 wychmod

[root@VM_0_14_centos ~]# ls -l /home
total 4
drwx------ 4 wychmod friends 4096 Feb 22 00:39 wychmod

```
### groups命令:查看用户所在的组
```
[root@VM_0_14_centos ~]# groups wychmod
wychmod : friends
```
### groupdel命令:删除群组
- groupdel happy
### chown命令:改变文件的所有者
- chown thomas file.txt
### chgrp命令:改变文件的群组
- chgrp thomas file. txt
### -R参数:递归设置子目录和子文件
- chown命令的-R参数非常有用 
- 假如想要把用户 thomas的家目录的所有子目录和文件都占为己有
- chown -R oscar: oscar /home/thomas
> ## 文件权限管理
### 权限的原理
- d:英语 directory的缩写,表示“目录”。就是说这是一个目录
- l:英语link的缩写,表示“链接”。就是说这是一个链接
- r:英语read的缩写,表示“读”。就是说可以读这个文件
- w:英语wite的缩写,表示“写”。就是说可以写/修改这个文件
- x:英语 execute的缩写,表示“执行运行"。可以运行这个文件
![image](../../youdaonote-images/8BB56792CE6D4D93B6C137679A50BF7D.png)
### chmod命令：修改文件权限
- chmod命令:修改文件的访问权限
- chmod命令不需要是root用户才能运行只要你是此文件所有者,就可以用 chmod来修改文件的访问权限
- u:user的缩写,是英语“用户”的意思。表示所有者
- g: group的缩写,是英语“群组”的意思。表示群组用户
- o: other的缩写,是英语“其他”的意思。表示其他用户
- chmod u+ rx file文件fie的所有者增加读和运行的权限
- chmod g+rfle文件fil的群组其他用户增加读的权限
- chmod o- r file文件file的其他用户移除读的权限
- chmod配合-R(大写的R)参数可以递归地修改文件访可权限
![image](../../youdaonote-images/675C96F055314A8AB2A3D29ECBC4091B.png) 
> ## Nano文本编辑器和终端配置
**Nano是一个文本编辑器,不是文本处理器** 
- ◆Nano的全称其实是 GNU Nano
### nano快捷键
- Ctrl+G:显示帮助文档
- Ctrl+O:保存文件
- Ctr+K:剪切当前一行
- Ctrl+X:退出
- Ctrl+\:替换
### Nano的参数
- nano file.txt:用nano打开file.txt,如果你对fie.txt有写的权限，不存在的话，会创建一个file.txt
- -m:激活鼠标。如果没有-m参数
- -i:澂活自动缩进的功能。这对于程序员写代码太有用了
- -A:激活智能Home键的功能。通常状况下按下键盘的Home键，光标会立即跳到一行的最开始。
- 可以通过. nanorc来配置Nano
### 创建 .nanorc
- 每一行一句配置语句,配置语句是以set或 unset开头
- set是英语“"放置,设置"的意思,用于激活unset则用于关闭。
- set或 unset后接你要配置的项目
- 例如: set mouse
- set autoindent:激活自动缩进,相当于参数-i的作用
- set smarthome:激活智能Home键
### 通过. bashrc配置终端
- .bashrc就是Bash这个shel程序的配置文件
- .bashrc本身的语法也是Bash的语法,是一种脚本语言
- 在. bashrc文件中,我们可以修改命令行提示符的样式
- 终端的bash也有它的全局配置文件:/etc/bashrc
- 家目录下的. bashrc文件的优先级比系统的/etc/bashrc文件高
### profile 配置文件
- 家目录下,其实还有一个. profile文件
- 而且它也有对应的全局 profile文件,是/etc/profile
- profile是这些需要登录的,非图形界面的终端的配置文件
- 有一点需要记住: profile文件会调用. bashrc
- 我们修改了 bashrc,也就是间接修改了 profile文件
- profile文件会用 profile本身的配置再加上. bashrc的配置
- 可以用 source命令来使改动立即生效
- source bashrc

> ## 软件仓库
### 软件包
- 一个软件包其实是软件的所有文件的压缩包
- 二进制形式的,包含了安装软件的所有指令
- 在 Red Hat一族里,软件包的后缀是.rpm
- **软件包管理包括了依赖关系的管理**
![image](../../youdaonote-images/49CF83C3BF154CD38D6239C38F77BBE3.png)
### 依赖关系
- 通常来说,很少有一个软件可以单独在Lnux上运行
- 一个软件经常需要使用其他程序或者其他程序的片段(称之为库）
- 一个软件依赖其他程序,这就是依赖关系
- 比如说, Linux下类似 Photoshop的软件GIMP
- GIMP的正常运作需要调用图片读取的库(例如读取一个JPG图片)
### 软件仓库
![image](../../youdaonote-images/22BD4D59C7CE491BB83090344265A75B.png)
- 是用户选择软件仓库,因为基本上各个软件仓库中的软件都是一样的
- 一般建议用户选择离自己所在地较近的软件仓库的服务器
### 切换CentOS软件源
- 要编辑的那个包含软件仓库的列表的文件是/etc/yum.repos.d/centos-base repo
- 这个文件是系统文件,只能被root用户修改
```
nano /etc//yum.repos.d/CentOS-Base.repo
``` 
### 包管理工具
- 终端的软件包管理命令一般用yum
- yum是 Centos中的默认包管理器工具,也用于 Red Hat一族
### yum update/ upgrade:更新软件包
### yum install:安装软件包
### yum remove:删除软件包
### 常用的终端的软件包命令
- 本地的rpm软件包,可以用rpm命令来安装
- sudo rpm -i *.rpm用于安装
- sudo rpm -e包名用于卸载

> ## RTFM阅读手册
### man命令,显示使用手册
- man是 manual的缩写,是英语“使用手册”的意思
- 用法很简单,后接你想要显示使用手册的命令,函数,等等
- 此命令用于查看系统中自带的各种参考手册
- sudo yum install - y man-pages

> ## 查找文件
### locate命令，快速查找
- 第一种查找文件的方法可以说是很简单的。用到的命令是 locate
- locate是英语“定位”的意思。
- locate命令是搜索包含关键字的所有文件和目录
- locate命令不会对你实际的整个硬盘进行查找，而是在文件的数据库里査找记录
- 我们可以用 updatedb命令强制系统立即更新文件数据库
### find命令,深入查找
- 与 locate命令不同,find命令不会在文件数据库中查找文件的记录而是遍历你的实际硬盘
- find《何处》《何物》 《做什么》
- 这几个参数中,只有《何物》是必须指定的,也就是要查找什么
- **何处**:指定在哪个目录中查找
- **何物**:也就是要查找什么。我们可以根据文件的名字来查找
- 也可以根据其大小来查找,也可以根据其最近访时间来查找,等等。这个参数是必须的
- **做什么**:用find命令找到我们要的文件后
- find命令只会查找完全符合《何物》的字符串表示的文件
- 如果要査找以 syslog结尾的文件,可以用* syslog
- 如果查找包含 syslog这个关鍵字的文件,可以用*syslog*
```
[root@VM_0_14_centos ~]# find -name 'nano.txt'
./nano.txt
```
- 例如,我们以root身份查找/ar中大小超过10M的文件
- find /var -size +10M
- 可以使用-atime参数。atime是 access和time的缩写
- access是英语“访问,进入”的意思,time是英语“时间”的意思
- find -name "*.txt" -atime -7
### 删除查找到的文件
- 假如我要删除査找到的文件,我可以用-delete参数
- find -name "*jpg" -delete
### 使用命令
- 使用-exec参数,可以后接一个命令,对每个查找到的文件进行操作
- exec是 execute的缩写,是英语“执行”的意思
- 如果你对于没有确认提示不太放心
- 你可以将-exec参数换成-exec参数,用法一样

## Linux进阶知识和命令.md

# Linux进阶知识和命令

> ## 正则表达式和数据操作
### grep命令:筛选数据
- 意思是“全局搜索一个正则表达式,并且打印”
- grep的功能简单说是在文件中査找关键字,并显示关键字所在的行
#### grep的简单用法
- grep命令的最基本用法
- grep text file text
- 代表要搜索的文本,file代表供搜索的文件
```
[root@VM_0_14_centos ~]# grep path /etc/profile
pathmunge () {
    pathmunge /usr/sbin
    pathmunge /usr/local/sbin
    pathmunge /usr/local/sbin after
    pathmunge /usr/sbin after
unset -f pathmunge
```
#### -i参数:忽略大小写
- 默认的情况下,grep命令是区分大小写的
```
[root@VM_0_14_centos ~]# grep path -i /etc/profile
pathmunge () {
    case ":${PATH}:" in
                PATH=$PATH:$1
                PATH=$1:$PATH
# Path manipulation
    pathmunge /usr/sbin
    pathmunge /usr/local/sbin
    pathmunge /usr/local/sbin after
    pathmunge /usr/sbin after
export PATH USER LOGNAME MAIL HOSTNAME HISTSIZE HISTCONTROL
unset -f pathmunge
```
#### -n参数:显示行号
- -n参数的作用很简单,就是显示搜索到的文本所在的行号
- n是英语 number的缩写,表示“数字,编号”
```
[root@VM_0_14_centos ~]# grep -n path /etc/profile
11:pathmunge () {
38:    pathmunge /usr/sbin
39:    pathmunge /usr/local/sbin
41:    pathmunge /usr/local/sbin after
42:    pathmunge /usr/sbin after
75:unset -f pathmunge
```
#### -v参数:只显示文本不在的行
- -v参数的作用就是只显示搜索的文本不在的那些行
```
grep -v path /etc/profile
```
#### -o参数:只匹配
#### -r参数:在所有子目录和子文件中查找
- grep -r "Hello World" folder/
- 在folder目录的所有子目录和子文件中查找 Hello World这个文本
### grep的高级用法:配合正则表达式
- 正则表达式使用单个字符串
- 来描述、匹配一系列符合某个句法规则的符串
![image](../../youdaonote-images/AC321D932E094E8A9D45BEA5C3CCED8C.png)
#### -E参数:使用正则表达式
```
[root@VM_0_14_centos ~]# grep -e ^path /etc/profile
pathmunge () {

[root@VM_0_14_centos ~]# grep -e [Pp]ath /etc/profile
pathmunge () {
# Path manipulation
    pathmunge /usr/sbin
    pathmunge /usr/local/sbin
    pathmunge /usr/local/sbin after
    pathmunge /usr/sbin after
unset -f pathmunge

[root@VM_0_14_centos ~]# grep -e [a-zA-Z] /etc/profile
```
### sort命令:为文件排序
```
sort name.txt
```
#### -o参数:将排序后的内容写入新文件
- o是 output的首字母,表示“输出”
- sort -o name sorted.txt name.txt
- -r参数:倒序排列
- -R参数:随机排序
- -n参数用于对数字进行排序,按从小到大排序
### wc命令:文件的统计
- wc命令还可以用来统计行数,字符数,字节数等
- 行数( newline counts): newline是英语“换行、换行符”的意思
- 单词数( word counts):Word是英语“单词”的意思
- 字节数( byte counts):byte是英语“字节”的意思
```
[root@VM_0_14_centos ~]# wc nano.txt
 1  5 21 nano.txt
```
### uniq命令:删除文件中的重复内容
- uniq命令有点“"呆”,只能将连续的重复行变为一行
- -c参数用于统计重复的行数
- -d参数:只显示重复行的值
### cut命令:剪切文件的一部分内容
- -c参数:根据字符数来剪切
- -d参数:根据分隔符来剪切
- -f参数:表示剪切下用分隔符分隔的哪一块或那几块区域
```
cut -c 2-4 name.txt

[root@VM_0_14_centos note]# cut -d , -f 1 notes.csv
wyx
wychmod. 2222
[root@VM_0_14_centos note]# cut -d , -f 2- notes.csv
 11111, 2222
 333
```
> ## cut命令进阶，输出重定向符号
### 重定向
- 把本来要显示在终端的命令结果,输送到别的地方
- 到文件中或者作为其他命令的输入(命令的链接,或者叫命令管道)
### 管道
- 把两个命令连起来使用,一个命令的输出作为另一个命令的输入
- 管道的英语是 pipeline
### >和>>:重定向到文件
- 最简单的操作就是把命令的输出结果重定向到文件中
- 就不会在终端显示命令运行结果了
### >:重定向到新的文件
- 令>可以将命令的输出结果重定向到你选择的文件中
- 如果此文件不存在,则新建一个文件
- 如果此文件已经存在,那就会把文件内容覆盖掉
```
[root@VM_0_14_centos note]# cut -d , -f 1 notes.csv > students.txt
[root@VM_0_14_centos note]# cat students.txt
wyx
wychmod. 2222
```
### >>:重定向到文件末尾
- >>的作用与>是类似的,不过它不会像>那么危险
- 而是将重定向的内容写入到文件未尾,起到追加的作用
- 如果文件不存在,也会被创建
```
[root@VM_0_14_centos note]# cut -d , -f 1 notes.csv >> students.txt
[root@VM_0_14_centos note]# cat students.txt
wyx
wychmod. 2222
wyx
wychmod. 2222
```
### stdin,stdout,stderr
- 从键盘向终端输入数据、这是标准输入,也就是 stdin
- 标准输出: stdout。指终端输出的信息(不包括错误信息)
- 标准错误输出: stern。指终端输出的错误信息
### “黑洞”文件/dev/null
- Linux中有一个俗称“黑洞”的文件ldev/null
- 此文件具有唯一的属性:它总是空的
### 2>符号
- 标准错误输出的文件描述符是2,所以这里的2表示标准错误输岀
- 如果没有2,单独的>符号就是重定向标准输出(文件描述符为1)
### 2>&1组合符号
- 将标准错误输出重定向到与标准输出相同的地方
### <:从文件中读取
- <符号用于指定命令的输入
### <<:从键盘读取
- <<符号的作用是将键盘的输入重定向为某个命令的输入
```
[root@VM_0_14_centos note]# sort -n << end
> 1
> 2
> 5
> 4
> 6
> end
1
2
4
5
6
```
### “|” 管道符
- 将前者的输出当做后者的输入
``` 
[root@VM_0_14_centos note]# cut -d , -f 1 notes.csv | sort
wychmod. 2222
wyx

[root@VM_0_14_centos ~]# du | sort -nr | head
1275592 .
605188  ./.cache
604860  ./.cache/pipenv
524968  ./.cache/pipenv/http
368072  ./.local
368068  ./.local/share
368064  ./.local/share/virtualenvs
327792  ./.local/share/virtualenvs/whyhu-G00zs1Vk
313612  ./.local/share/virtualenvs/whyhu-G00zs1Vk/lib
313608  ./.local/share/virtualenvs/whyhu-G00zs1Vk/lib/python3.7

[root@VM_0_14_centos ~]# grep log -lr /var/log | cut -d : -f 1 | sort | uniq
/var/log/audit/audit.log
/var/log/audit/audit.log.1
/var/log/audit/audit.log.2
/var/log/audit/audit.log.3
/var/log/audit/audit.log.4
/var/log/btmp
/var/log/btmp-20200201
/var/log/cloud-init.log
/var/log/cron

```
> ## 输入重定向和管道符号
### W命令:都有谁,在做什么?
- 可以帮助我们快速了解系统中目前有哪些用户登录着
- load average 表示一分钟，五分钟，十分钟的负载状态
- TTY:登录的终端名称
- 0意思应该是指本地,就是目前我们所在的这个图形终端
- pts是 pseudo terminal slave的缩写,表示“伪终端从属”
- DLE:用户有多久没活跃了(没运行任何命令)
- JCPU:该终端所有相关的进程使用的CPU(处理器)时间
- PCPU:表示CPU(处理器)执行当前程序所消耗的时间
- WHAT:当下用户正运行的程序
```
[root@VM_0_14_centos ~]# w
 12:36:49 up 129 days, 14:46,  1 user,  load average: 0.00, 0.01, 0.05
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/1    110.183.161.147  12:36    1.00s  0.03s  0.00s w
```
> ## 进程和系统监测
### ps命令和top命令:列出运行的进程
- 简单说来,进程就是加载到内存中运行的程序
- 大多数程序运行时都只在内存中启动一个进程
### ps:进程的静态列表
- pS命令用于显示当前系统中的进程
- ps命令显示的进程列表不会随时间而更新,是静态的
- PID进程号
- a：显示现行终端机下的所有进程，包括其他用户的进程；
- u：显示进程拥有者、状态、资源占用等的详细信息（注意有“-”和无“-”的区别）；
- x：显示没有控制终端的进程。通常与 a 这个参数一起使用，可列出较完整信息；
- -e：显示所有进程；
- -f：完整输出显示进程之间的父子关系；
- -l：较长、较详细的将该 PID 的的信息列出；
- -o：自定义显示的字段；
### ps -ef:列出所有进程
- -ef参数可以使ps命令列出所有用户在所有终端的所有进程
- PPID( parent process ID):PPID是程序的父进程号
### ps -u用户名:列出此用户运行的进程
- ps -u XX #用实际用户替換xx
### ps -aux:通过CPU和内存使用来过滤进程
- ps -aux | less
- 根据CPU使用率来降序排列:ps -aux --sort -pcpu | less
- 根据内存使用率来降序排列 ps -aux --sort -pmem | less
### pstree 命令:以树形结构显示进程
- ps -axjf和 pstree效果比较类似
- 以树形结构显示进程
> ## 操作进程和重启关闭系统
### top命令：实时列出进程
- B:大写的B,加粗某些信息
- f/F:在进程列表中添加或删除某些列
- k:结束某个进程
### glances软件
```
yum install epel* -y
yum install python-pip python-devel -y
yum install glances -y
```
![image](../../youdaonote-images/AB8B22A5C4A044F69D7DCF6EA22F6535.png)
### htop软件
```
yum install epel* -y
yum install -y htop
```
![image](../../youdaonote-images/6FC76E9746E2413B963F697882D3B72C.png)
### kill令:结束一个进程
- 可以同时用ki来结束好几个进程,只要用空格隔开它们的P|D
- 可以用kill -9来立即强制结束进程
- 例如kiIl -9 7291
### killall:结束多个进程
- kill命令就是用于结束全部要结束的进程
- 不同于kill命令, killall命令后接程序名,而不是PID(进程号)
### halt/poweroff命令和reboot命令:停止/关闭和重启系统
- halt和 reboot这两个命令都调用了 Linux的另一个命令
- 这个命令是 shutdown

> ## 管理前后台进程
### &符号和 nohup命令:后台运行进程
- 可以在同一个终端中同时运行好几个命令
- 很简单的一种:在你要运行的命令最后加上&这个符号,这个后台与终端关联的
- find / -name "*log" > output_find 2>&1 &
- nohup命令:使进程与终端分离
```
[root@VM_0_14_centos ~]# mv nano.txt new_folder/ &
[1] 23322
[1]+  Done                    mv -i nano.txt new_folder/
```
### Ctrl+Z:转到后台,并暂停运行
### bg命令:使进程转到后台
- bg是英语 background的缩写,表示“后台”
- bg命令的作用是将命令转入后台运行
- 假如命令已经在后台,并且暂停着
- 那么bg命令会将其状态改为运行
- 不加任何参数,bg命令会默认作用于最近的一个后台进程，也就是刚才被Ctr+Z暂停的top进程
- 如果后面加%1,%2这样的参数
- 则是作用于指定标号的进程
### jobs命令:显示后台进程状态
```
[root@VM_0_14_centos ~]# jobs
[1]-  Stopped                 top
[2]+  Stopped                 top
```
### fg命令:使进程转到前台
- fg是英语 foreground的意思,表示“前台
- fg命令的作用是:使进程转为前台运行
![image](../../youdaonote-images/768307EBCA1045B889D462C089CE7D53.png) 
> ## 任务的定时和延期
### at命令:延时执行一个程序
- 可以用at命令来设定一个程序的执行时间
- 注意:at命令只能让程序执行一次
- 可以使用Ctrl+D组合键,at会显示<EOT>
- at 22:10 12/10/19
- at now +10 minutes
- atq命令:列出正等待执行的at任务
- atrm命令:删除正在等待执行的at任务
```
[root@VM_0_14_centos ~]# at 15:51
at> ls
at> <EOT>
job 1 at Sun Feb 23 15:51:00 2020
```
### sleep命令:休息一会
- 默认地, sleep后面的数值表示秒
- m: minute的缩写,表示“"分钟"
- h:hour的缩写,表示“小时"
- d:day的缩写,表示“天"
### &&和||符号
- &&:&&号前的命令执行成功,オ会执行后面的命令
- ||:||号前的命令执行失败,才会执行后面的命令
### crontab命令:定时执行程序
- at命令,只能执行某个(或某几个)命令一次
- crontab却可以重复执行命
- 例如:每小时,每分钟,每天,每星期,等等
- -l:显示 crontab文件
- -e:修改 crontab文件
- -r:删除 crontab文件
![image](../../youdaonote-images/3D463F833A9841948575B3FE21A3653A.png)
```
[root@VM_0_14_centos ~]# crontab -l
*/1 * * * * /usr/local/qcloud/stargate/admin/start.sh > /dev/null 2>&1 &
0 0 * * * /usr/local/qcloud/YunJing/YDCrontab.sh > /dev/null 2>&1 &
```
 
> ## 文件的解压和压缩
![image](../../youdaonote-images/17FE9E252F6449EBAF73BBC1949330E7.png)
### 打包和压缩
- 打包:是将多个文件变成一个总的文件，这个总的文件我们通常称为 archive
- 压缩:是将一个大文件通过某些压缩算法变成一个小文件
![image](../../youdaonote-images/18B0A7BB45A4488D8FF2D95A8721284E.png)
### tar命令:打包文件
- -cvf:创建一个tar归档
- -c: create的缩写,表示“创建
- -v: verbose的缩写,表示“冗余”。会显示操作的细节
- -f:file的缩写,表示“文件"。指定归档文件
- -tf:显示归档里的内容,并不解开归档
- -rvf:追加文件到归档
- -xvf:解开归档
```
[root@VM_0_14_centos ~]# tar -cvf new_folder.tar new_folder/
new_folder/
new_folder/nano.txt
[root@VM_0_14_centos ~]# tar -tf new_folder.tar
new_folder/
new_folder/nano.txt
```
### gzip和bzip2命令:压缩归档
- .tar.gz:用gzip命令压缩后的文件后缀名
- .tar.bz2:用bzip2命令压缩后的文件后缀名
### gunzip和gunzip2命令:解压
### 用tar命令同时归档和压缩
- -zcvf:归档,然后用gzip来压缩归档
- -jcvf:归档,然后用bz2来压缩归档
- -zxvf -jxvf
### zip/ unzip:压缩/解压zip文件
- -l 可以不解压观看里面内容
- -r 一般zip压缩要加，递归压缩
```
yum install unzip
```

> ## 编译安装软件
![image](../../youdaonote-images/01F62741926F4B7E8D839F65BC716982.png) 
### alien软件
- 有个软件可以将deb安装包和rpm安装包互相转换
- 这个软件是aen(“外星人”的意思)
- yum install alien
- alien -r xxx.deb
### 安装rpm安装包
- rpm -i xxx.rpm
### 安装rar unrar
```
wget http://www.rarlab.com/rar/rarlinux-x64-5.0.0.tar.gz
tar -zxvf rarlinux-x64-5.0.0.tar.gz -C /tmp/
cd /tmp/rar/
make && make install
cp rar_static /usr/local/bin/rar 
cp rar_static /usr/local/bin/unrar

rar a Archive.rar File1 File2 [...]  # 归档
unrar e Archive.rar DestPath     # 解压
```

## Linux的安装与配置.md

# Linux的安装与配置

> ## 初相识linux
- 品牌手机与电脑,为其提供服务的服务器基本都是 Linux系统
- Android系统的底层用的是修改过的 Linux内核
- 全球500台最快的超级计算机中,100%采用 Linux系统
- Unix是1969年(就1970年)诞生的
- 操作系统是你的电脑和应用程序之间的连接工具
- Windows, macos和 Linux是最常用的操作系统
> ## linux的不同发行版
- ### GUN
- GNU在英语里是“牛羚”的意思
- GNU是“ GNU is Not Unix"("GNU不是Unix")的递归缩写
- 1984年, Richard Stallman(理査德斯托曼)创立了GNU项目
- GNU项目在当时的首要目的是创立一个类Unix的操作系统
- Unix不是免费的,是商用软件
- ### 自由和免费的有什么区别呢？
- 自由的软件意味着源代码必须公开
- 自由的软件大部分时候是免费的,但也可以复制,修改和出售
- 自由运动的口号是:“团结就是力量
- ### Linux
- 1991年 Linus Torvalds在业余时间编写了一个类Unix的内核
- Linux这个名字可以说是 Linus和Unix的合并
- Linux也可以说是" Linux Is Not Unix"的递归缩写
- ### Linux和GNU项目的联系
- 这两个项目是互补的: Linus其实就是写了一个类Unix的内核
- 1991年,GNU项目已经创建了不少操作系统的外围软件了
- GNU的软件:cp命令,rm命令, Emacs,GCC,GDB,等
> ## 虚拟机安装CentOS
- ### 虚拟技术/虚拟化(Virtual lization)
- 一种通过组合或分区现有的计算机资源(CPU、内存、磁盘空间等)
- 使得这些资源表现为一个或多个操作环境
- 从而提供优于原有资源配置的访问方式的技术
- ### 安装virtualbox
- Virtual Box是一款开源虚拟机软件,免费
- https://www.virtualbox.org
- 可虚拟很多操作系统,如 Windows、 macos、 Linux、 Android
- ### 安装CentOS
- 先下载CentOS
- 之后virtualbox一键安装，创建以后不断地点，或者直接vagrant up
- Centos安装到 Virtual Box后,强烈建议安装 Virtual Box增强功能
- 还要记得设置共享文件夹,以便和宿主机共享文件

## Shell脚本编程.md

# Shell脚本编程

## 什么是Shell呢?
-  Shell不像C语言,C++,Java等编程语言那么完整
-  但是Shel这门语言可以帮我们完成很多自动化任务
-  例如:保存数据,监测系统的负载,等等
### Shell脚本
- 脚本( Script)是批处理文件的延伸
- 是一种纯文本保存的程序
- 计算机脚本程序是确定的一系列控制计算机进行运算操作动作的组合
### 不同的Shell
- Sh: Bourne Shell 的缩写。可以说是目前所有 Shell E的祖先
- Bash：是Sh的一个进阶版本,比Sh更优秀,linux，macos默认shell
- Zsh:比较新近的一个 Shell,集Bash,Ksh和Tcsh各家之大成,Github上有一个Zsh的轻松配置程序叫作oh-my-zsh
![image](../../youdaonote-images/5DBA2DA1D53F45C3B04A8CEBD0978A29.png)  
### 创建脚本文件
- vim test.sh
- 指定脚本要使用的 Shell
- #!被称作Sha-bang,或者 Shebang
![image](../../youdaonote-images/2A41F8323EE54890A5A0EE7DFC4CF161.png)
### 以调试模式运行
- 调试一个脚本程序bash -x test.sh
- 参数 -x 表示以调试模式运行
### PATH环境变量
- PATH是英语“小路,路;路线,路程;途径”的意思
- PATH是 Linux的一个系统变量
- 这个变量包含了你系统里所有可以被直接执行的程序的路径
## Shell的变量
### 定义变量
```
#!/bin/bash

message='Hello World'
```
### echo:显示内容
- echo在英语中是“回声”的意思
- 如果要插入换行符,那么需要用到 -e 参数
- 为了使“转义字符”发生作用
```
[root@VM_0_14_centos ~]# echo -e "first\nsecond"
first
second
```
### 显示变量
- Bash脚本中,如果要显示一个变量
- 用echo后接变量名还不够
- 须要在变量名前加上美元符号($)
- 单引号忽略$,双引号不忽略$
- 反引号``可以放入命令
```
#!/bin/bash
message='Hello World'
echo $message
```
### read:请求输入
- read是英语“阅读,读取”的意思
- read命令读取到的文本会立即被储存在一个变量里
- read命令一个单词一个单词(单词是用空格分开的)
- 读取你输入的参数,并且把每个参数赋值给对应变量
- -p:显示提示信息
- -n:用-n参数可以限制用户输入的字符串的最大长度(字符数)
- -t:用-t参数可以限定用户的输入时间(以秒为单位
```
1 #!/bin/bash
2 read name
3 echo "Hello $name"

read -p 'Please enter your name:' name
read -p 'Please enter your name:' name -n 5 name
read -p 'Please enter your name:' name -t 5 code
read -p 'Please enter your name:' name -s password
```
### 数学运算
- 在Bash中,所有的变量都是字符串
- Bash本身不会操纵数字,因此它也不会做运算
- let命令可以用于斌值
```
  1 #!/bin/bash
  2
  3 let "a=5"
  4 let "b=2"
  5 let "c=a+b"
```
![image](../../youdaonote-images/C83E104939BE47478EA7223CC48CBD76.png)
### 环境变量
- Shell的环境变量可以被此种Shell的任意脚本程序使用
- 我们有时也把环境变量称为“全局变量”
- 可以用en∨命令来显示你目前所有的环境变量
```
echo "$SHELL"
```
### 参数变量
- 可以这样调用我们的脚本文件
- /variable.sh参数1参数2参数3
- 这些个参数1,参数2,参数3….被称为“参数变量”
- shift命令常被用在循环中,使得参数一个接一个地被处理
![image](../../youdaonote-images/8A0195E10FFF4434860170F8324C4397.png)
![image](../../youdaonote-images/2A90C3FE01C443F091725F5704170A9D.png)
![image](../../youdaonote-images/8AD03BF96FBA4CA187F0168436DFE2F5.png) 
### 数组
- 数组是这样一种变量,它可以包含多个“格子”
- (被称为“数组的元素”),就好像一个表格一样
```
  1 #!/bin/bash
  2
  3 array=('value0' 'value1' 'value2')
  4 echo ${array[2]}
  5 echo ${array[*]}
```
## Shell的条件
### if条件语句的基本格式
- 方括号囗中的条件测试两边必须要空一格
- 不能写成[test],而要写成 [ test ]
![image](../../youdaonote-images/2C411E7FEDE14F69A60FE6123D23C289.png)
![image](../../youdaonote-images/68AA4EE728E34DB5970074C14591511F.png)
### Shell语言中的“等于”
- 在 Shell 语言中,“等于"是用一个等号(=)来表示的
- 这和大多数主流编程语言(例如C语言,Java,C++)不同
- 但Shel中用两个等号来表示“等于”的判断也是可以的
```
  1 #!/bin/bash
  2
  3 name="Enming"
  4
  5 if [ $name = "Enming" ]
  6 then
  7         echo "Hello $name !"
  8 fi
```
![image](../../youdaonote-images/EE782CB551424286A943602E3D8BAB74.png)
![image](../../youdaonote-images/019B8978F4604EB6BA9AFED554F0E061.png)
![image](../../youdaonote-images/337F9606C0A043A1BC0BA7BE6AAEFB44.png)
### 测试字符串
![image](../../youdaonote-images/25B4191D826B40F78061D655C8D91CE1.png)
![image](../../youdaonote-images/296070CE71EF40C1A7F893B45C75E39B.png)
### 测试数字
![image](../../youdaonote-images/6F7F6F6ADF2C4A5E8E42E735423AE987.png)
### 测试文件
![image](../../youdaonote-images/9D0F4364FEB44E0E9494CED20C3BB542.png)
![image](../../youdaonote-images/6336FA7C4555417F95AAB7D794595C9B.png)
### case条件语句 
- ;; 是传统编程中的break
- *）是传统编程中case的else
```
#!/bin/bash

case $1 in
    "Matthew")
        echo "Hello Matthew !"
        ;;
    "Mark")
        echo "Hello Mark !"
        ;;
    "Luke")
        echo "Hello Luke !"
        ;;
    "John")
        echo "Hello John !"
        ;;
    *)
        echo "Sorry, I do not know you."
        ;;
esac
```

## Shell的循环语句
![image](../../youdaonote-images/ED493171D39E44ABA4C0B37115A8901D.png)
### while 循环的逻辑
![image](../../youdaonote-images/829D58DDD66142A7AA2C26C0FA28AB74.png)
![image](../../youdaonote-images/57B71C96BD814F64B6F52246AD43EDF1.png)
### until循环 
![image](../../youdaonote-images/DCA97DC15A374D57A617CDE1AACCCA62.png)
### for循环
![image](../../youdaonote-images/932D723791E3490093F31DF73469AA72.png)
```
#!/bin/bash

for animal in 'dog' 'cat' 'pig'
do
    echo "Animal being analyzed : $animal"
done
```
```
#!/bin/bash

for file in `ls *.sh`
do
    cp $file $file-copy
done
```

### 更常规的for循环
- 可以借助seq命令,来实现类似主流编程语言中的for循环的语法
- seq是 sequence的缩写,是英语“序列”的意思
```
#!/bin/bash

for i in `seq 1 2 10`
do
    echo $i
done
```

## Shell的函数
### Shell 函数的方式
- 函数名后面跟着的圆括号里不加任何参数
![image](../../youdaonote-images/920777A5B78B497E96CA2CDC389D8F7B.png)
![image](../../youdaonote-images/565907EE0B09468380250BD3A04592D9.png)
```
  1 #!/bin/bash
  2
  3 print_function() {
  4         echo "wychmod"
  5 }
  6
  7 print_function
  8 print_function
```
```
#!/bin/bash

print_something () {
    echo Hello $1
}

print_something Matthew
print_something Mark
print_something Luke
print_something John
```
```
#!/bin/bash

lines_in_file () {
    cat $1 | wc -l
}

line_num=$(lines_in_file $1)

echo The file $1 has $line_num lines
```

### 变量作用范围
- 默认来说,一个变量是“全局的”( global)
- 要定义一个局部变量,需要用loca关键字
- local是英语“本地的”的意思
```
#!/bin/bash

local_global () {
    local var1='local 1'
    echo Inside function: var1 is $var1 : var2 is $var2
    var1='changed again'   # 这里的 var1 是函数中定义的局部变量
    var2='2 changed again' # 这里的 var2 是函数外定义的全局变量
}

var1='global 1'
var2='global 2'

echo Before function call: var1 is $var1 : var2 is $var2

local_global

echo After function call: var1 is $var1 : var2 is $var2
```

### 重载命令
- 我们可以用函数来实现命令的重载
- 也就是说把函数的名字取成与我们通常在命令行用的命令相同的名字
- 需要用到 command关键字

## Shell实现图片展示网页
### convert命令
- convert命令可以帮助我们从图片生成缩略图 thumbnail
- convert这个命令是属于 Imagemagick这个软件包
- yum install ImageMagick
- 对于生成缩略图,我们需要用到的参数就是 -thumbnail

## 用Shell做统计练习
```
#!/bin/bash

# Verification of parameter
# 确认参数
if [ -z $1 ]
then
    echo "Please enter the file of dictionary !"
    exit
fi

# Verification of file existence
# 确认文件存在
if [ ! -e $1 ]
then
    echo "Please make sure that the file of dictionary exists !"
    exit
fi

# Definition of function
# 函数定义
statistics () {
  for char in {a..z}
  do
    echo "$char - `grep -io "$char" $1 | wc -l`" | tr /a-z/ /A-Z/ >> tmp.txt
  done
  sort -rn -k 2 -t - tmp.txt
  rm tmp.txt
}

# Use of function
# 函数使用
statistics $1
```

## Vim文本编辑与版本控制.md

# Vim文本编辑与版本控制

## 高级文本编辑器，安装启动Vim
### Vim
- Vi文本编辑器的进阶版
- 是Vi iMproved的缩写,表示“改进了的vi”
### Emacs
- 著名的开源先驱 Richard stallman开发的文本编辑器
- 后来有很多人参与改进 Emacs 
### vimtutor:vim的教程程序
- vim中内嵌了一个教程小程序
- 输入以下命令就可以执行
- vimtutor
### Vim的多种模式
- #### 交互模式
    - 交互模式: Interactive Mode;也称为正常模式( Normal Mode)
    - 这是Vim的默认模式
    - 每次运行Vim程序的时候,就会进入这个模式
    - 在这个模式中,你不能输入文本
    - 它可以让我们在文本间移动,删除一行文本,复制粘贴文本跳转到指定行,销操作,等等
- #### 插入模式
    - 进入这种模式按i
    - 为了退出这种模式,只需要按下Esc键(一般在键盘左上角)
- #### 命令模式
    - 为了进入这个模式,需要首先处于交互模式下
    - 按下冒号键(在一般的键盘上就是按下 Shift键+分号键)
- #### 可视模式
    - 可视模式( Visual Mode)相当于高亮选取文本后的交互/正常模式
    - 配合d键可以实现删除操作
    - v可视模式 V行可视模式 Ctrl+v:块可视模式
## Vim的多种模式和基本操作
- 0:移动到行首
- $:移动到行末
- w:一个单词一个单词地移动
- :W保存文件
- :q退出
- :q!没保存就直接退出
- :wq/:x  保存并退出
## Vim的标准和高级操作
- 交互模式下 x:删除字符 数字+x删除数字个字母
- 交互模式下 d:删除单词，行，等等
- 交互模式下 dd:删除行 数字+dd删除数字个行
- 交互模式下 dw:删除一个单词 数字+dw
- 交互模式下 d0和d$:删除行首或行末
- 交互模式下 yy:复制行到内存中
- 交互模式下 yw:复制一个单词
- 交互模式下 p:粘贴 会复制到光标下一行
- 交互模式下 r + x 会替换光标处为x 
- 交互模式下 u:撤销操作 数字+u
- 交互模式下 ctrl+r:重做 和 u相反
- 交互模式下 g:跳转到指定行
- 命令模式下 set nu 显示行号
- 交互模式下 要跳转到最后一行,按下G(大写的G,Shit+g)
- 交互模式下 要跳转到第一行,按下gg(按两次g键)
### 交互模式下的查找，分屏，合并等等
- /:查找，从光标处向后，？从光标处向前查找
- :s:查找并替换 
- 例如:s/旧字符串/新字符串 可以替换所在行第一个  
- +/g可以替换所在行所有匹配的
- :#,# S/旧字符串/新字符串/g 可以替换某行到某行的字符串
- :%s/旧字符串/新字符串 替换文件中所有的可以匹配的字符串
- :r合并文件 例如 :r 另一个文件名
- :sp横向分屏 如果要打开不同的文件可以在 :sp 之后空一格，再输入要打开的另一个文件
- :vsp垂直分屏
- 分屏模式下的主要快捷键:
- Ctrl+W然后再按Ctrl+w 从一个 viewport移动光标到另一个 viewport
- Ctrl+W 也可以和方向键结合
- Ctrl+“+” 扩大viewport
- Ctrl+W+o 保留当年的窗口关闭其他的
- Ctrl+W+q/:quit/:close 关闭当前的窗口
- :!+command(命令) 在不关闭当前窗口的情况下运行外部命令

## Vim的配置
### 以命令模式激活选项参数
- :set 选项名 / set no选项名
- 可以通过/ect/vimrc 来全局配置 或者在home目录下创建/.vimrc
- syntax:配置语法高亮
- showcmd:显示当前命令
- ignorecase:在查找时忽略大小写
- mouse:鼠标支持 set mouse=a

## Git 和其他版本控制软件
![image](../../youdaonote-images/4E806C6CE5BB4944A925E74ED66B17E8.png)
## 安装和配置Git
[CentOS7中安装Git](https://note.youdao.com/web/#/file/recent/note/wcp1582477242208715/)

## 管理服务器和服务.md

# 管理服务器和服务

## 守护进程和初始化进程服务
### 守护进程/服务
- 守护进程也被称为 service(服务)
- 服务器软件大多都是以守护进程的形式运行的
- 守护进程的名字通常会在最后有一个d,表示 daemon
- 例如systemd,httpd,smbd等等
### Linux操作系统的开机过程
![image](../../youdaonote-images/65FFF5CE77B6429EB52E9EABC933A344.png)
## 用systemd管理系统服务
- systemd并不是一个命令,它包含了一组命令
- systemd是基于事件的
- systemd可以使进程并行启动
[Systemd 入门教程：命令篇](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)
## 安装Apache服务程序
- sudo yum install httpd
- 在 Centos等 Red Hat一族中, Apache程序的名字叫htpd
```
sudo systemctl start httpd # 启动Apache服务
sudo systemctl stop httpd # 停止Apache服务
sudo systemctl restart httpd # 重启Apache服务
sudo systemctl reload httpd # 重启加载Apache服务的配置文件
sudo systemctl status httpd # 查看Apache服务的状态
sudo systemctl enable httpd # 设置开机自动启动Apache服务
sudo systemctl disable httpd # 设置开机不自动启动Apache服务
firewall-cmd --list-all # 查询防火墙
firewall-cmd reload # 重载配置的防火墙策略

[root@VM_0_14_centos gallery]# sudo systemctl start httpd
[root@VM_0_14_centos gallery]# ps -aux | grep httpd
root     20591  1.5  0.2 224052  5004 ?        Rs   00:39   0:00 /usr/sbin/httpd -DFOREGROUND
apache   20592  0.0  0.1 226136  3104 ?        S    00:39   0:00 /usr/sbin/httpd -DFOREGROUND
apache   20593  0.0  0.1 226136  3104 ?        S    00:39   0:00 /usr/sbin/httpd -DFOREGROUND
apache   20594  0.0  0.1 226136  3104 ?        S    00:39   0:00 /usr/sbin/httpd -DFOREGROUND
apache   20595  0.0  0.1 226136  3104 ?        S    00:39   0:00 /usr/sbin/httpd -DFOREGROUND
apache   20596  0.0  0.1 226136  3104 ?        S    00:39   0:00 /usr/sbin/httpd -DFOREGROUND

```
## 配置Apache服务 
![image](../../youdaonote-images/088B40C854A84BD486CA5986A2CA5901.png)
### httpd主配置文件的三种信息类型
![image](../../youdaonote-images/49AF265BAA0A40DBA7961F3A5827A197.png)
### 配置httpd服务的常用参数
![image](../../youdaonote-images/0817AE4E7C79444D9BC9C7B1612CA9A1.png)

## SELINUX安全子系统
- Selinux是 Security- Enhanced linux的缩写
- 表示“安全增强型 Linux
- 美国国家安全局在 Linux开源社区帮助下开发的MAC的安全子系统
![image](../../youdaonote-images/DC5F7114EFF44B45843FFAB3F39EC27E.png)
### MAC
- MAC是 Mandatory Access Control的缩写
- 表示“强制访问控制”
- 指一种由操作系统约束的访问控制
### 防火墙和 Selinux的区别
- 防火墙就像“防盗门”,用于抵御外部的危险
- SELINUX就像“保险柜”,用于保护內部的资源
![image](../../youdaonote-images/B2D68525F62C4535A7D33D9505739B5D.png)
```
[root@VM_0_14_centos ~]# sestatus
SELinux status:                 disabled
```
### semanage命令
- semanage是 Selinux manage的缩写
- 表示“管理 Selinux",用于管理 Selinux的策略
- 命令格式为 semanage[选项][文件]
- yum install policycoreutils-python
![image](../../youdaonote-images/B376838DF8D64B2BA6B757B6C89942E9.png)

## Apache的虚拟主机功能，基于IP地址的配置
![image](../../youdaonote-images/3B2941C92B76492E99876C7D59711EFD.png)
![image](../../youdaonote-images/DDD9DF476EF643918FDBF29A23A9F511.png)
![image](../../youdaonote-images/63D9BCB6F2B6471FB7073118F49BF96A.png)
![image](../../youdaonote-images/CDF6F7699B5742419D54B58855F166E4.png)
![image](../../youdaonote-images/08B6EA14309A49929A62E08802AB4506.png)
![image](../../youdaonote-images/C54CCC9E91A846FDB767A1BAC9A8DA3A.png)
![image](../../youdaonote-images/DE0DA6212C4B43048F1DD6398AC886DB.png)

## 网络和安全.md

# 网络和安全

## 安全的文件传输，轻松同步
### wget:下载文件
- wget可以使我们直接从终端控制台下载文件
- 只需要给出文件的HTTP或FTP地址
- 要继续一个中断的下载,只要在相同的下载命令中加入-C参数
- wget -c xxx
### scp:网间拷贝
- cp是英语copy的缩写,表示"拷贝”
- sp是基于SSH( Secure Shell)的原理来运作的
- SSH会在两台通过网络连接的电脑之间创建一条安全通信的管道
- scp source_file destination_file
- source_file表示源文件,就是被拷贝的文件
- destination_file表示目标文件,就是拷贝产生的文件
- 这两个文件都可以用如下方式来表示user@ip: file name
- user是登录名,ip是域名(google.com)或ip地址(216.58.206.238)
- Scp命令的默认端口号是22,和SSH一样
- 可以修改端口号,用-P参数(p是port的缩写,表示“端口”)
### ftp&sftp:传输文件
- FTP是 File transfer protocol的缩写,表示“文件传输协议”
- ftp -p xxxx
- -p参数,p是 passive的缩节,表示“被动的
- 对于公共的FTP服务器,用户名(Name)一般都填写 anonymous
- anonymous表示“匿名的”
- 密码( Password)你随便输入什么都会被接受
- 进入ftp：可以使用ls 等命令
- put上传文件，get下载文件
```
yum install ftp
```
### sftp:安全加姿的ftp
- ftp命令虽然方便,但是有一个致命缺点:不安全
- 数据不是加密传输的
- sftp是 Secure FTP的缩写。表示“安全的FTP“
- sftp也是基于SSH的,所以登录需要用户名和密码
- sftp的默认端口号是22,和SSH一样
- 可以修改端口号,用-oPort参数
### rsync:同步备份
- rsync命令使我们可以同步两个目录
- 不管这两个目录位于同一台电脑还是不同的电脑(用网络连接)
- rsync -arv Images/ backups/
- 将 Images目录下的所有文件备份到 backups目录下
- --delete 同步删除

## IP地址
### whois:了解有关域名的信息
```
yum install whois
[root@VM_0_14_centos ~]# whois github.com
   Domain Name: GITHUB.COM
   Registry Domain ID: 1264983250_DOMAIN_COM-VRSN
   Registrar WHOIS Server: whois.markmonitor.com
   Registrar URL: http://www.markmonitor.com
   Updated Date: 2019-05-13T13:58:34Z
   Creation Date: 2007-10-09T18:20:50Z
   Registry Expiry Date: 2020-10-09T18:20:50Z

```

## 统计网络
### netstat:网络统计
- netstat -i:网络接口的统计信息
- RX-OK:在此接口接收的包中正确的包数
- TX-OK:表示在此接口发送的包中对应的包数
### gtstat -uta:列出所有开启的连接
- -u:显示UDP连接(u是udp的首字母)
- -t:显示TCP连接(t是tcp的首字母)


## 远程连接和SSH.md

# 远程连接和SSH

> ## FTP协议
- 其他常见的网络协议有FTP
- 是英语 File Transfer Protococol的简称,表示“文件传输协议"
- 站长常用FTP把文件(如网站的源代码)传输到网站服务器上
> ## Shell协议
- 它类似于DOS下的 command(“命令”)和后来的cmd.exe
- 它接收用户命令,然后调用相应的应用程序
- Linux下有Bash等Shell程序
- 在计算机科学中,shell俗称"売"
- 用来区别于“核”( kernel),一个是外壳,一个是核心
- 是指“提供用户使用界面”的软件(命令解析器)
> ## RSA算法
- RSA加密算法是一种非对称加密算法。
- 对极大整数做因数分解的难度决定了RSA算法的可靠性。
- 世界上还没有任何可靠的攻击RSA算法的方式。只要其钥匙的长度足够长，用RSA加密的信息实际上是不能被解破的。
> ## 服务器安装ssh
- 安装SSH: yum install openssh- server
- 启动SSH: systemctl start(或 restart) sshd
- 设置开机运行SSH: systemctl enable sshd
> ## SSH 安装/ config 配置以及免密码登录
[SSH 安装/ config 配置以及免密码登录](https://blog.csdn.net/weixin_33688840/article/details/93568825)

## tx服务器信息.md

面板地址:http://172.81.238.110:8888/3a6bc7a1
用户名:bfd0itdp
密码:8e40fc59

## 快速创建linux虚拟机.md

```
vagrant init ubuntu/trusty64
vagrant up
vagrant ssh
vagrant halt 关机
vagrant destroy 删除虚拟机
```

## 百度云资料.md

# 百度云资料
面板地址:http://120.48.73.227:8888/ad4a0b8b
用户名:uendzywk
密码:7ed89dcd
# 安装宝塔
