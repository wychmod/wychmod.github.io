# Docker 容器化

> **原文归档**：[`archive/old-docker-notes/`](../../archive/old-docker-notes/)
> 包含：docker.md（30KB）、Centos7 安装 Docker.md（5KB）

---

## 一、Docker 是什么

- 容器化引擎，基于 Linux cgroup / namespace
- 把应用 + 依赖打包成**镜像**（image），运行时启动**容器**（container）
- 类比：镜像 = 类，容器 = 实例

## 二、核心概念

| 概念 | 解释 |
|---|---|
| **镜像 (Image)** | 只读模板，包含应用 + 运行时 + 库 + 配置 |
| **容器 (Container)** | 镜像的运行实例 |
| **Dockerfile** | 构建镜像的脚本 |
| **Registry** | 镜像仓库（Docker Hub / 阿里云 ACR / 自建 Harbor） |
| **Volume** | 数据卷，绕过容器文件系统 |
| **Network** | 容器间网络（bridge / host / overlay） |

## 三、常用命令速查

### 3.1 镜像操作

```bash
docker pull nginx:latest            # 拉镜像
docker images                       # 列出本地镜像
docker rmi <image-id>               # 删镜像
docker tag nginx:latest mynginx:v1  # 打 tag
docker build -t myapp:v1 .          # 构建镜像
docker push myregistry.com/myapp:v1  # 推镜像
```

### 3.2 容器操作

```bash
docker run -d -p 80:80 --name web nginx:latest  # 后台运行
docker ps                                       # 列出运行中容器
docker ps -a                                    # 列出所有容器
docker stop <container-id>                      # 停止
docker start <container-id>                     # 启动
docker rm <container-id>                        # 删除
docker logs -f <container-id>                   # 看日志
docker exec -it <container-id> bash             # 进容器
```

### 3.3 网络 & 数据卷

```bash
docker network create mynet                     # 建网络
docker network connect mynet <container>        # 加入网络
docker run -v /host/path:/container/path ...    # 挂载数据卷
```

## 四、Dockerfile 模板

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 五、Docker Compose

> 💡 适合本地开发 + 单机多容器场景

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
volumes:
  redis-data:
```

```bash
docker compose up -d       # 启动
docker compose down        # 停止
docker compose logs -f web # 看日志
```

## 六、CentOS 7 安装 Docker

> 📚 完整步骤见 [Centos7安装Docker.md](../../archive/old-docker-notes/Centos7安装Docker.md)（5KB，已归档）

```bash
# 卸载旧版本
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-engine

# 安装依赖
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加阿里云镜像源（国内推荐）
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动
sudo systemctl start docker
sudo systemctl enable docker

# 验证
docker --version
docker run hello-world
```

## 七、生产最佳实践

- **多阶段构建**：减小镜像体积
- **.dockerignore**：排除不必要文件
- **不要用 latest tag**：固定版本号
- **非 root 用户运行**：`USER node`
- **健康检查**：`HEALTHCHECK`
- **资源限制**：`--memory --cpus`
- **日志驱动**：用 json-file 或 syslog，不要存容器内

---

## 📚 完整资料

- [`archive/old-docker-notes/docker.md`](../../archive/old-docker-notes/docker.md) — 30KB 完整内容
- [`archive/old-docker-notes/Centos7安装Docker.md`](../../archive/old-docker-notes/Centos7安装Docker.md) — 5KB
