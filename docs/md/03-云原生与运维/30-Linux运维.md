# Linux 运维

> **原文归档**：[`archive/old-linux-notes/`](../../archive/old-linux-notes/)
> 包含：常用命令 + 核心技能与应用 8 篇 + 1 docx + 3 个零散 md

---

## 一、Linux 常用命令

> 📚 完整命令速查见 [Linux常用命令.md](../../archive/old-linux-notes/Linux常用命令.md)（19KB，已归档）

### 1.1 文件操作

```bash
ls -la                  # 列文件详情
cd /path/to/dir         # 切目录
pwd                     # 当前路径
mkdir -p a/b/c          # 建多级目录
rm -rf dir              # 删目录（慎用）
cp -r src/ dst/         # 复制
mv old new              # 改名/移动
find / -name "*.log"    # 找文件
grep "pattern" file     # 搜内容
```

### 1.2 文本三剑客

```bash
grep "error" log.txt        # 找匹配行
awk '{print $1}' file       # 按列处理
sed 's/old/new/g' file      # 替换
```

### 1.3 系统监控

```bash
top / htop              # 进程监控
free -h                 # 内存
df -h                   # 磁盘
du -sh dir/             # 目录大小
iostat                  # IO 状态
netstat -tlnp           # 端口
ss -tlnp                # 端口（新版）
ps aux                  # 进程
```

### 1.4 网络

```bash
ping host
curl -I https://example.com
wget url
ssh user@host
scp local remote
```

## 二、Linux 基础与进阶

> 📚 完整笔记见 [Linux基础知识和命令.md](../../archive/old-linux-notes/Linux核心技能与应用/Linux基础知识和命令.md)（19KB，已归档）

### 2.1 文件权限

```
-rwxr-xr--  1 user group 4096 file
  ↑  ↑  ↑
  |  |  └── others (r=4)
  |  └───── group (r+x=5)
  └────── owner (rwx=7)
```

**修改权限**：
```bash
chmod 755 file    # rwxr-xr-x
chown user:group file
chmod +x script.sh
```

### 2.2 用户管理

```bash
useradd -m -s /bin/bash username
passwd username
usermod -aG sudo username
userdel -r username
```

### 2.3 软件包管理

```bash
# CentOS / RHEL
yum install nginx
yum update
yum remove nginx

# Ubuntu / Debian
apt update
apt install nginx
apt remove nginx
```

## 三、Shell 脚本编程

> 📚 完整笔记见 [Shell脚本编程.md](../../archive/old-linux-notes/Linux核心技能与应用/Shell脚本编程.md)（9KB，已归档）

### 3.1 基础语法

```bash
#!/bin/bash
# 变量
NAME="wychmod"
echo "Hello, $NAME"

# 条件
if [ -f "/etc/passwd" ]; then
  echo "exists"
else
  echo "missing"
fi

# 循环
for i in {1..5}; do
  echo "iter $i"
done

# 函数
greet() {
  echo "Hello, $1"
}
greet "world"
```

### 3.2 实战：部署脚本

```bash
#!/bin/bash
set -e  # 遇错退出

APP_NAME="myapp"
DOCKER_IMAGE="myregistry.com/$APP_NAME:$1"
K8S_DEPLOYMENT="web-deploy"

# 1. 构建镜像
docker build -t $DOCKER_IMAGE .

# 2. 推送镜像
docker push $DOCKER_IMAGE

# 3. K8s 滚动更新
kubectl set image deployment/$K8S_DEPLOYMENT \
  web=$DOCKER_IMAGE

# 4. 等待完成
kubectl rollout status deployment/$K8S_DEPLOYMENT
```

## 四、Vim 文本编辑

> 📚 [Vim文本编辑与版本控制.md](../../archive/old-linux-notes/Linux核心技能与应用/Vim文本编辑与版本控制.md)（4KB）

### 4.1 模式

- **普通模式**：默认，光标移动
- **插入模式**：`i` 进入，编辑
- **命令模式**：`:` 进入，保存退出

### 4.2 常用命令

```vim
i          # 进入插入模式
Esc        # 回普通模式
:w         # 保存
:q         # 退出
:wq        # 保存退出
:q!        # 强退
dd         # 删整行
yy         # 复制整行
p          # 粘贴
/pattern   # 搜索
n          # 下一个匹配
:%s/old/new/g  # 全局替换
```

## 五、服务管理

> 📚 [管理服务器和服务.md](../../archive/old-linux-notes/Linux核心技能与应用/管理服务器和服务.md)（4KB）

```bash
# systemd（现代）
systemctl start nginx
systemctl stop nginx
systemctl status nginx
systemctl enable nginx
journalctl -u nginx -f    # 看日志

# 老式 init
service nginx start
/etc/init.d/nginx start
```

## 六、网络与安全

> 📚 [网络和安全.md](../../archive/old-linux-notes/Linux核心技能与应用/网络和安全.md)（3KB）

- **防火墙**：`ufw` / `firewalld` / `iptables`
- **SSH 密钥认证**：`ssh-keygen` + `authorized_keys`
- **sudo 配置**：`/etc/sudoers`
- **SELinux / AppArmor**

```bash
# 防火墙（CentOS 7）
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --reload

# SSH 密钥
ssh-keygen -t ed25519
ssh-copy-id user@host
```

## 七、远程连接 SSH

> 📚 [远程连接和SSH.md](../../archive/old-linux-notes/Linux核心技能与应用/远程连接和SSH.md)（1KB）

**SSH 配置** `~/.ssh/config`：
```
Host myserver
  HostName 192.168.1.100
  User wychmod
  Port 22
  IdentityFile ~/.ssh/id_ed25519
```

```bash
ssh myserver
```

## 八、零散资料

> 📚 完整资料见归档目录：
> - [`archive/old-linux-notes/tx服务器信息.md`](../../archive/old-linux-notes/tx服务器信息.md)（85B 占位）
> - [`archive/old-linux-notes/快速创建linux虚拟机.md`](../../archive/old-linux-notes/快速创建linux虚拟机.md)（117B 占位）
> - [`archive/old-linux-notes/百度云资料.md`](../../archive/old-linux-notes/百度云资料.md)（119B 占位）
> - [`archive/old-linux-notes/linux安装服务器和mysql.docx`](../../archive/old-linux-notes/linux安装服务器和mysql.docx)（22KB docx）

## 九、生产建议

- **永远用 sudo**，不要用 root 日常操作
- **关键操作前备份**：`cp file file.bak`
- **生产前先在 staging 测试**
- **监控告警**：Prometheus + Grafana
- **日志收集**：ELK / Loki
- **自动化**：Ansible / Terraform

---

## 📚 完整资料

- [`archive/old-linux-notes/`](../../archive/old-linux-notes/) — 完整 Linux 笔记归档
