# CI/CD 持续集成

> **原文归档**：[`archive/old-cicd-notes/`](../../archive/old-cicd-notes/)
> 包含：13 篇 CI/CD 笔记

---

## 一、什么是 CI/CD

> 📚 完整笔记见 [1.什么是CI和CD.md](../../archive/old-cicd-notes/1.什么是CI和CD，为什么要学CI和CD.md)（2KB，已归档）

| 缩写 | 含义 | 目标 |
|---|---|---|
| **CI**（Continuous Integration）| 持续集成 | 每次提交自动构建 + 测试 |
| **CD**（Continuous Delivery）| 持续交付 | 自动化到**预生产** |
| **CD**（Continuous Deployment）| 持续部署 | 自动化到**生产** |

## 二、CI/CD 主流工具

| 工具 | 特点 |
|---|---|
| **Jenkins** | 老牌、插件多、需自维护 |
| **GitLab CI** | 与 GitLab 深度集成 |
| **GitHub Actions** | 与 GitHub 深度集成，YAML 配置 |
| **CircleCI / Travis** | SaaS 模式 |
| **Drone** | 容器化 |
| **Argo CD** | K8s GitOps |

## 三、Jenkins 入门

### 3.1 安装

> 📚 [2.安装docker、Portainer和jekins.md](../../archive/old-cicd-notes/2.安装docker、Portainer和jekins.md)（10KB）

```bash
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### 3.2 构建镜像

> 📚 [3. 使用 Jenkins 构建镜像.md](../../archive/old-cicd-notes/3.%20使用%20Jenkins%20构建镜像：将应用打包成镜像.md)（7KB）

**Jenkinsfile 模板**：

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t myapp:v1 .'
            }
        }
        stage('Push') {
            steps {
                sh 'docker push myregistry.com/myapp:v1'
            }
        }
        stage('Deploy') {
            steps {
                sh 'kubectl set image deployment/web web=myregistry.com/myapp:v1'
            }
        }
    }
}
```

### 3.3 镜像库

> 📚 [4. 将镜像上传至私有镜像库.md](../../archive/old-cicd-notes/4.%20将镜像上传至私有镜像库.md)（10KB）

- Docker Hub（公共）
- 阿里云 ACR
- 腾讯云 TCR
- 自建 Harbor

## 四、K8s 部署实战

### 4.1 部署访问

> 📚 [6. 使用 Kubernetes 部署访问你的第一个应用.md](../../archive/old-cicd-notes/6.%20使用%20Kubernetes%20部署访问你的第一个应用.md)（13KB）

### 4.2 灰度发布 / 滚动发布

> 📚 [7. Kubernetes 灰度发布与滚动发布.md](../../archive/old-cicd-notes/7.%20Kubernetes%20灰度发布与滚动发布：零宕机发布的奥秘.md)（12KB）

**蓝绿部署 vs 灰度发布**：

| 策略 | 流量切换 | 回滚 |
|---|---|---|
| 蓝绿 | 100% 切到新版本 | 秒级切回 |
| 灰度（金丝雀）| 5% / 25% / 50% / 100% | 灰度失败回滚 |
| 滚动 | 逐个 Pod 替换 | 复杂 |

**K8s 滚动更新策略**：

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
```

### 4.3 服务可用性探针

> 📚 [8. 服务可用性探针.md](../../archive/old-cicd-notes/8.%20服务可用性探针：如何判断你的服务是否可用.md)（9KB）

| 探针类型 | 检查内容 | 失败处理 |
|---|---|---|
| **startupProbe** | 启动是否成功 | 失败 → 重启容器 |
| **livenessProbe** | 运行时是否健康 | 失败 → 重启容器 |
| **readinessProbe** | 是否准备好接收流量 | 失败 → 从 Service Endpoints 移除 |

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

### 4.4 密钥管理

> 📚 [9. Kubernetes Secret.md](../../archive/old-cicd-notes/9.%20Kubernetes%20Secret：储存你的机密信息.md)（11KB）

```bash
kubectl create secret generic db-cred \
  --from-literal=username=admin \
  --from-literal=password=secret
```

### 4.5 DNS 策略

> 📚 [10. Kubernetes DNS 策略.md](../../archive/old-cicd-notes/10.%20Kubernetes%20DNS%20策略：将你的服务连接起来.md)（6KB）

- **ClusterFirst**（默认）：集群内 DNS 优先
- **Default**：用节点 DNS
- **None**：自定义 DNS

### 4.6 ConfigMap

> 📚 [11. Kubernetes ConfigMap.md](../../archive/old-cicd-notes/11.%20Kubernetes%20ConfigMap：统一管理服务环境变量.md)（12KB）

```bash
kubectl create configmap app-config --from-file=app.properties
```

## 五、GitHub Actions

> 📚 完整笔记见 [Github action.md](../../archive/old-cicd-notes/Github%20action.md)（2KB）

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Build
      run: docker build -t myapp:${{ github.sha }} .
    - name: Push
      run: docker push myapp:${{ github.sha }}
    - name: Deploy
      run: kubectl set image deployment/web web=myapp:${{ github.sha }}
```

## 六、前后端分离项目实战

> 📚 [12. 实战训练.md](../../archive/old-cicd-notes/12.%20实战训练：部署一个前后端分离项目.md)（13KB）

**典型流水线**：
```
代码 push → GitHub Actions
   ↓
构建前端 (npm run build) → 静态资源 → CDN
   ↓
构建后端 (mvn package) → Docker 镜像 → 镜像库
   ↓
kubectl apply -f k8s/
   ↓
Ingress 路由 → 服务
```

---

## 📚 完整资料

- [`archive/old-cicd-notes/`](../../archive/old-cicd-notes/) — 13 篇 CI/CD 笔记
