# Kubernetes 编排

> **原文归档**：[`archive/old-k8s-notes/`](../../archive/old-k8s-notes/)
> 包含：6 篇 K8s 笔记（最大 60KB）

---

## 一、K8s 是什么

- Google 开源的**容器编排系统**
- 自动部署、扩缩、滚动升级、故障恢复
- 核心思想：**声明式**（你写期望状态，K8s 帮你达成）

## 二、核心概念

### 2.1 控制面组件

| 组件 | 作用 |
|---|---|
| **kube-apiserver** | API 入口 |
| **etcd** | 集群状态 KV 存储 |
| **kube-scheduler** | Pod 调度 |
| **kube-controller-manager** | 控制器（Deployment/Node/...） |
| **cloud-controller-manager** | 云厂商集成 |

### 2.2 工作节点组件

| 组件 | 作用 |
|---|---|
| **kubelet** | 节点上的 Pod 管理器 |
| **kube-proxy** | 网络代理（Service IP） |
| **容器运行时** | containerd / CRI-O |

### 2.3 工作负载 API

| 资源 | 用途 |
|---|---|
| **Pod** | 最小调度单位（1+ 容器） |
| **Deployment** | 无状态应用（推荐用） |
| **StatefulSet** | 有状态应用（DB/缓存） |
| **DaemonSet** | 节点级服务（日志/metrics） |
| **Job / CronJob** | 一次性 / 定时任务 |
| **Service** | Pod 的稳定访问入口 |
| **Ingress** | 7 层路由（HTTP） |
| **ConfigMap / Secret** | 配置 / 密钥 |

## 三、Pod

> 📚 完整笔记见 [4-Pod详解.md](../../archive/old-k8s-notes/4-Pod详解.md)（60KB，已归档）

### 3.1 Pod 是什么

- 1 个 Pod = 1 组共享网络 + 存储的容器
- Pod 内容器通过 `localhost` 通信
- Pod IP 由网络插件分配（Flannel / Calico / Cilium）

### 3.2 Pod YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: web
spec:
  containers:
  - name: app
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

## 四、Pod 控制器

> 📚 完整笔记见 [5-Pod控制器详解.md](../../archive/old-k8s-notes/5-Pod控制器详解.md)（44KB，已归档）

### 4.1 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deploy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
```

### 4.2 StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    # ...
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## 五、Service

> 📚 完整笔记见 [6-Service详解.md](../../archive/old-k8s-notes/6-Service详解.md)（23KB，已归档）

| 类型 | 用途 |
|---|---|
| **ClusterIP**（默认）| 集群内部访问 |
| **NodePort** | 节点端口暴露（30000-32767） |
| **LoadBalancer** | 云厂商负载均衡 |
| **ExternalName** | CNAME 别名 |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
```

## 六、存储与安全

> 📚 完整笔记见 [7-数据存储、安全认证、DashBoard.md](../../archive/old-k8s-notes/7-数据存储、安全认证、DashBoard.md)（42KB，已归档）

- **PV / PVC**：持久化存储
- **StorageClass**：动态供给
- **RBAC**：基于角色的访问控制
- **ServiceAccount**：Pod 身份
- **NetworkPolicy**：网络隔离

## 七、集群环境搭建

> 📚 完整笔记见 [2-k8s集群环境的搭建和资源管理.md](../../archive/old-k8s-notes/2-k8s集群环境的搭建和资源管理.md)（26KB，已归档）

```bash
# 常用方式
1. kubeadm（官方推荐）
2. minikube（本地开发）
3. k3s（轻量级，边缘场景）
4. kind（Docker in Docker）
5. 公有云托管：EKS / AKS / GKE / 阿里云 ACK / 腾讯云 TKE
```

## 八、实战

> 📚 完整笔记见 [3-实战.md](../../archive/old-k8s-notes/3-实战.md)（20KB，已归档）

### 8.1 部署一个 Web 应用

```bash
kubectl create deployment web --image=nginx:1.25
kubectl expose deployment web --port=80 --type=NodePort
kubectl get pods,svc
```

### 8.2 滚动升级

```bash
kubectl set image deployment/web web=nginx:1.26
kubectl rollout status deployment/web
kubectl rollout undo deployment/web  # 回滚
```

---

## 📚 完整资料

- [`archive/old-k8s-notes/`](../../archive/old-k8s-notes/) — 6 篇 K8s 笔记
  - 1-k8s的介绍.md（6KB）
  - 2-k8s集群环境的搭建和资源管理.md（26KB）
  - 3-实战.md（20KB）
  - 4-Pod详解.md（60KB，最大）
  - 5-Pod控制器详解.md（44KB）
  - 6-Service详解.md（23KB）
  - 7-数据存储、安全认证、DashBoard.md（42KB）
