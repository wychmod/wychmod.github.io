# Kubernetes 编排

> **原文归档**：[archive/old-k8s-notes/](../archive/old-k8s-notes/)
> 包含：7 个文件（K8s 介绍 / 集群搭建 / Pod / 控制器 / Service / 实战 / 存储与安全）

## 一、核心主题概述

Kubernetes（K8s）是 Google 开源的容器编排系统，2014 年 9 月发布首个版本，2015 年 7 月发布正式版本。它源于 Google 内部 Borg 系统，本质是一组服务器集群，通过在每台节点上运行特定组件来管理容器化应用，实现资源管理的自动化。

应用部署方式经历了三个阶段：

- **传统部署**：直接部署在物理机，简单但资源边界不清，程序间易相互影响。
- **虚拟化部署**：一台物理机运行多个虚拟机，环境隔离但增加了操作系统开销。
- **容器化部署**：共享操作系统，容器拥有独立的文件系统、CPU、内存和进程空间，可跨云服务商和 Linux 发行版部署。

容器化带来了便利，但也产生了容器编排问题：容器故障如何自动替补、访问量变大如何横向扩展等。主流编排工具包括 Docker Swarm、Apache Mesos + Marathon、Kubernetes。

K8s 提供的核心能力：

- **自我修复**：容器崩溃后约 1 秒内启动新容器。
- **弹性伸缩**：自动调整运行中的容器数量。
- **服务发现**：服务自动找到所依赖的服务。
- **负载均衡**：多容器实例间自动分发请求。
- **版本回退**：有问题时立即回退到原版本。
- **存储编排**：根据容器需求自动创建存储卷。

> 💡 补充：K8s 的核心思想是**声明式**。用户通过 YAML 描述期望状态，K8s 负责将实际状态收敛到期望状态。生产环境推荐使用 `kubectl apply -f` 进行声明式对象配置。

---

## 二、Kubernetes 架构

### 2.1 控制平面组件（Control Plane）

| 组件 | 作用 |
|---|---|
| **kube-apiserver** | 集群操作的唯一入口，提供认证、授权、API 注册和发现。 |
| **etcd** | 集群状态的分布式 KV 存储，保存所有资源对象信息。 |
| **kube-scheduler** | 负责 Pod 调度，按策略将 Pod 分配到合适的 Node。 |
| **kube-controller-manager** | 维护集群状态，处理 Deployment、Node 等控制器逻辑。 |
| **cloud-controller-manager** | 与云厂商集成，管理负载均衡、存储等云资源。 |

### 2.2 工作节点组件（Node）

| 组件 | 作用 |
|---|---|
| **kubelet** | 节点上的 Pod 管理器，维护容器生命周期。 |
| **kube-proxy** | 网络代理，维护 Service 的网络规则和负载均衡。 |
| **容器运行时** | 负责容器的实际运行，如 containerd、CRI-O。 |

### 2.3 组件调用示例

以部署 Nginx 为例：

1. 用户通过 `kubectl` 向 kube-apiserver 提交请求。
2. apiserver 将 Pod 信息写入 etcd。
3. scheduler 从 etcd 读取 Node 信息，按算法选择目标节点，回写 apiserver。
4. controller-manager 协调创建 Pod。
5. 目标 Node 的 kubelet 通知容器运行时启动 Nginx 容器。
6. kube-proxy 为 Service 生成访问规则，外部可通过 Service IP 访问 Pod。

### 2.4 核心概念

- **Master**：控制节点，负责集群管控，至少一个。
- **Node**：工作负载节点，运行实际容器。
- **Pod**：K8s 最小控制单元，一个 Pod 可包含一个或多个容器。
- **Controller**：控制器，管理 Pod 的创建、停止、伸缩。
- **Service**：Pod 对外服务的统一入口，维护同类 Pod。
- **Label**：标签，用于对 Pod 等资源进行分类和选择。
- **Namespace**：命名空间，用于隔离 Pod 运行环境。

---

## 三、Pod 详解

### 3.1 Pod 是什么

Pod 是 K8s 的最小调度单位，是一组共享网络和存储的容器集合：

- 一个 Pod 可包含一个或多个容器。
- Pod 内容器通过 `localhost` 通信。
- 每个 Pod 有一个 Pause（根）容器，用于评估 Pod 健康状态并提供 Pod IP。
- Pod 之间通过虚拟二层网络通信，常用网络插件有 Flannel、Calico、Cilium。

### 3.2 Pod 基本 YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  namespace: dev
  labels:
    app: web
spec:
  containers:
  - name: nginx
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

### 3.3 镜像拉取策略

`imagePullPolicy` 支持三种策略：

- **Always**：总是从远程仓库拉取。
- **IfNotPresent**：本地有则使用本地，没有则远程拉取。
- **Never**：只使用本地镜像，没有则报错。

> 💡 补充：默认策略与镜像 tag 有关。tag 为具体版本号时默认 `IfNotPresent`；tag 为 `latest` 时默认 `Always`。

### 3.4 启动命令与环境变量

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-command
  namespace: dev
spec:
  containers:
  - name: busybox
    image: busybox:1.30
    command: ["/bin/sh", "-c", "while true; do echo $(date +%T); sleep 3; done"]
    env:
    - name: username
      value: admin
```

`command` 和 `args` 会覆盖 Dockerfile 中的 `ENTRYPOINT`：

- 两者都不写：使用 Dockerfile 默认配置。
- 只写 command：忽略 Dockerfile 默认配置，执行 command。
- 只写 args：执行 Dockerfile 的 ENTRYPOINT，并传入 args。
- 两者都写：忽略 Dockerfile 配置，执行 command 并追加 args。

### 3.5 资源配额

```yaml
resources:
  requests:
    cpu: "1"
    memory: "10Mi"
  limits:
    cpu: "2"
    memory: "10Gi"
```

- **requests**：容器启动所需的最小资源，资源不足时 Pod 无法调度。
- **limits**：容器运行时的最大资源，超过 limits 会被终止并重启。

### 3.6 Pod 生命周期与相位

Pod 生命周期包括：创建、运行初始化容器、运行主容器、终止。

Pod 的五种**相位（Phase）**：

- **Pending**：已创建但尚未调度完成或仍在下载镜像。
- **Running**：已调度到节点，所有容器已创建完成。
- **Succeeded**：所有容器成功终止且不会重启。
- **Failed**：所有容器终止，至少一个容器终止失败。
- **Unknown**：apiserver 无法正常获取 Pod 状态，通常由网络通信失败导致。

### 3.7 初始化容器

Init Container 在主容器启动前运行，特点：

- 必须运行完成直至结束。
- 按定义顺序串行执行，前一个成功后下一个才能运行。
- 常用于准备主容器依赖的环境或等待外部服务就绪。

```yaml
spec:
  initContainers:
  - name: wait-mysql
    image: busybox:1.30
    command: ['sh', '-c', 'until ping 192.168.1.10 -c 1; do echo waiting; sleep 2; done']
  containers:
  - name: nginx
    image: nginx:1.17.1
```

### 3.8 生命周期钩子

K8s 提供两个钩子函数：

- **postStart**：容器启动后立即执行，失败会按重启策略重启容器。
- **preStop**：容器终止前执行，完成后容器才成功终止，会阻塞删除操作。

支持 Exec、TCPSocket、HTTPGet 三种方式。

### 3.9 容器探测

两种探针：

- **livenessProbe**：存活性探针，探测失败则重启容器。
- **readinessProbe**：就绪性探针，探测失败则不转发流量。

三种探测方式：

- **Exec**：在容器内执行命令，退出码为 0 则认为正常。
- **TCPSocket**：尝试访问指定端口，能建立连接则正常。
- **HTTPGet**：访问容器内 URL，返回状态码 200-399 则正常。

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 30
  timeoutSeconds: 5
  periodSeconds: 10
  failureThreshold: 3
```

### 3.10 重启策略

- **Always**：容器失效时自动重启，默认值。
- **OnFailure**：容器终止且退出码不为 0 时重启。
- **Never**：不重启。

> 💡 补充：首次重启立即进行，后续重启延迟依次为 10s、20s、40s、80s、160s、300s，最大延迟 300s。

### 3.11 Pod 调度

K8s 提供四大类调度方式：

1. **自动调度**：由 scheduler 按算法自动分配。
2. **定向调度**：`nodeName`、`nodeSelector`。
3. **亲和性调度**：`NodeAffinity`、`PodAffinity`、`PodAntiAffinity`。
4. **污点与容忍**：`Taints`、`Tolerations`。

**nodeName**：强制将 Pod 调度到指定节点，跳过 scheduler。

```yaml
spec:
  nodeName: node1
```

**nodeSelector**：将 Pod 调度到带有指定标签的节点。

```yaml
spec:
  nodeSelector:
    nodeenv: pro
```

**NodeAffinity**：

- `requiredDuringSchedulingIgnoredDuringExecution`：硬限制，必须满足。
- `preferredDuringSchedulingIgnoredDuringExecution`：软限制，优先满足。

**PodAffinity / PodAntiAffinity**：以已运行的 Pod 为参照，决定新 Pod 是否与其在同一拓扑域（如同一 Node）。

**污点（Taints）**：

格式为 `key=value:effect`，effect 有三种：

- **PreferNoSchedule**：尽量避免调度，除非无其他节点。
- **NoSchedule**：不会调度新 Pod，不影响已存在 Pod。
- **NoExecute**：不会调度新 Pod，并驱逐已存在 Pod。

```bash
kubectl taint nodes node1 key=value:NoSchedule
kubectl taint nodes node1 key:NoSchedule-
```

**容忍（Tolerations）**：Pod 通过容忍忽略节点的污点。

```yaml
spec:
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoExecute"
```

> 💡 补充：使用 kubeadm 搭建的集群默认会给 master 节点添加污点，因此普通 Pod 不会调度到 master 节点。

---

## 四、控制器与调度

### 4.1 Pod 控制器概述

Pod 控制器是管理 Pod 的中间层，确保 Pod 资源符合期望状态。常见控制器：

| 控制器 | 用途 |
|---|---|
| **ReplicaSet** | 保证副本数量，支持扩缩容和镜像升级。 |
| **Deployment** | 通过 ReplicaSet 管理 Pod，支持滚动升级、回滚、金丝雀发布。 |
| **HorizontalPodAutoscaler** | 根据负载自动水平伸缩 Pod 数量。 |
| **DaemonSet** | 每个（或指定）节点运行一个副本，适合日志、监控。 |
| **Job** | 执行一次性任务，完成后退出。 |
| **CronJob** | 周期性执行任务。 |
| **StatefulSet** | 管理有状态应用，如数据库。 |

### 4.2 ReplicaSet

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: pc-replicaset
  namespace: dev
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-pod
  template:
    metadata:
      labels:
        app: nginx-pod
    spec:
      containers:
      - name: nginx
        image: nginx:1.17.1
```

```bash
kubectl create -f pc-replicaset.yaml
kubectl get rs -n dev
kubectl scale rs pc-replicaset --replicas=5 -n dev
kubectl set image rs pc-replicaset nginx=nginx:1.17.2 -n dev
kubectl delete rs pc-replicaset -n dev
```

### 4.3 Deployment

Deployment 不直接管理 Pod，而是通过管理 ReplicaSet 间接管理 Pod。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deploy
  namespace: dev
spec:
  replicas: 3
  revisionHistoryLimit: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
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
        ports:
        - containerPort: 80
```

```bash
kubectl create -f web-deploy.yaml
kubectl get deploy -n dev
kubectl scale deploy web-deploy --replicas=5 -n dev
kubectl set image deploy web-deploy nginx=nginx:1.26 -n dev
kubectl rollout status deploy web-deploy -n dev
kubectl rollout history deploy web-deploy -n dev
kubectl rollout undo deploy web-deploy --to-revision=1 -n dev
```

### 4.4 滚动更新与金丝雀发布

Deployment 支持两种更新策略：

- **Recreate**：先删除所有旧 Pod，再创建新 Pod。
- **RollingUpdate**：边创建新 Pod 边删除旧 Pod，可配置 `maxSurge` 和 `maxUnavailable`。

金丝雀发布示例：

```bash
kubectl set image deploy web-deploy nginx=nginx:1.27 -n dev
kubectl rollout pause deploy web-deploy -n dev
# 观察新版本 Pod 稳定性
kubectl rollout resume deploy web-deploy -n dev
```

### 4.5 Horizontal Pod Autoscaler

HPA 根据 CPU 或自定义指标自动调整 Pod 数量。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
  namespace: dev
spec:
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-deploy
```

```bash
kubectl create -f web-hpa.yaml
kubectl get hpa -n dev -w
```

> 💡 补充：HPA 依赖 metrics-server。新版 K8s 中建议使用 `autoscaling/v2` API，支持更多指标类型。

### 4.6 DaemonSet

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: pc-daemonset
  namespace: dev
spec:
  selector:
    matchLabels:
      app: nginx-pod
  template:
    metadata:
      labels:
        app: nginx-pod
    spec:
      containers:
      - name: nginx
        image: nginx:1.17.1
```

### 4.7 Job 与 CronJob

**Job**：执行一次性任务。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pc-job
  namespace: dev
spec:
  completions: 6
  parallelism: 3
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: counter
        image: busybox:1.30
        command: ["/bin/sh", "-c", "for i in 9 8 7 6 5 4 3 2 1; do echo $i; sleep 2; done"]
```

**CronJob**：周期性执行任务。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: pc-cronjob
  namespace: dev
spec:
  schedule: "*/1 * * * *"
  concurrencyPolicy: Allow
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
          - name: counter
            image: busybox:1.30
            command: ["/bin/sh", "-c", "echo hello"]
```

### 4.8 StatefulSet

StatefulSet 用于管理有状态应用，特点：

- 稳定的网络标识（Pod 名有序且固定）。
- 稳定的持久化存储（通过 volumeClaimTemplates）。
- 有序部署、有序扩展、有序删除。

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
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

---

## 五、Service 与网络

### 5.1 Service 的作用

Pod IP 会随重建而变化，且仅在集群内可见。Service 将一组同类 Pod 聚合，提供稳定访问入口，实现服务发现和负载均衡。

kube-proxy 负责将 Service 信息转换为访问规则，支持三种模式：

- **userspace**：效率较低，已不常用。
- **iptables**：直接通过 iptables 规则转发，效率较高但 LB 策略不够灵活。
- **ipvs**：性能更高，支持更多负载均衡算法，需安装 ipvs 内核模块。

### 5.2 Service 类型

| 类型 | 用途 |
|---|---|
| **ClusterIP** | 默认值，分配集群内部虚拟 IP，仅集群内访问。 |
| **NodePort** | 将 Service 端口映射到 Node 端口（30000-32767），外部可访问。 |
| **LoadBalancer** | 使用外部负载均衡器分发流量，需云环境支持。 |
| **ExternalName** | 将外部服务通过 CNAME 引入集群内部。 |

### 5.3 ClusterIP

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
  namespace: dev
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
```

### 5.4 Headless Service

将 `clusterIP: None`，不分配 Cluster IP，只能通过域名访问，常用于 StatefulSet。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-headless
  namespace: dev
spec:
  clusterIP: None
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
```

### 5.5 NodePort

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
  namespace: dev
spec:
  type: NodePort
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30002
```

### 5.6 Ingress

Ingress 是 7 层负载均衡器，通过规则将外部 HTTP/HTTPS 请求转发到不同的 Service。需要部署 Ingress Controller（如 NGINX Ingress Controller）。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: dev
spec:
  rules:
  - host: nginx.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

> 💡 补充：NodePort 会占用大量节点端口，LoadBalancer 需要为每个 Service 配置一个负载均衡器。Ingress 只需一个入口即可暴露多个服务，是生产环境推荐方案。

---

## 六、存储与配置

### 6.1 Volume 概述

Volume 是 Pod 中可被多个容器访问的共享目录，用于实现容器间数据共享和数据持久化。

常见 Volume 类型：

- **EmptyDir**：Pod 生命周期内的临时目录，Pod 销毁则数据丢失。
- **HostPath**：挂载宿主机目录，Pod 销毁数据仍存在，但 Pod 迁移后数据不跟随。
- **NFS**：网络文件系统，数据持久化且可跨节点共享。
- **PV / PVC**：持久化卷和持久卷声明，屏蔽底层存储细节。
- **ConfigMap / Secret**：配置和敏感信息存储。

### 6.2 EmptyDir

```yaml
spec:
  containers:
  - name: nginx
    image: nginx:1.17.1
    volumeMounts:
    - name: logs-volume
      mountPath: /var/log/nginx
  - name: busybox
    image: busybox:1.30
    command: ["/bin/sh", "-c", "tail -f /logs/access.log"]
    volumeMounts:
    - name: logs-volume
      mountPath: /logs
  volumes:
  - name: logs-volume
    emptyDir: {}
```

### 6.3 HostPath

```yaml
volumes:
- name: logs-volume
  hostPath:
    path: /root/logs
    type: DirectoryOrCreate
```

### 6.4 PV 与 PVC

PV（Persistent Volume）是持久化卷的抽象，由管理员创建；PVC（Persistent Volume Claim）是用户对存储需求的声明。

PV 关键参数：

- **capacity**：存储容量。
- **accessModes**：RWO、ROX、RWX。
- **persistentVolumeReclaimPolicy**：Retain、Delete（Recycle 已在 K8s 1.32 移除）。
- **storageClassName**：存储类别。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv1
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: /root/data/pv1
    server: 192.168.1.100
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc1
  namespace: dev
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
```

```yaml
spec:
  containers:
  - name: busybox
    image: busybox:1.30
    volumeMounts:
    - name: volume
      mountPath: /root/
  volumes:
  - name: volume
    persistentVolumeClaim:
      claimName: pvc1
```

### 6.5 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: dev
data:
  database.properties: |
    host=mysql
    port=3306
```

```bash
kubectl create configmap app-config --from-literal=key=value -n dev
```

### 6.6 Secret

Secret 用于存储敏感信息，数据以 base64 编码存储。

```bash
echo -n 'admin' | base64
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: dev
type: Opaque
data:
  username: YWRtaW4=
  password: MTIzNDU2
```

> 💡 补充：生产环境建议使用 external secrets operator 或云厂商 KMS 集成，避免将 base64 编码的密钥直接提交到 Git 仓库。

---

## 七、安全与认证

### 7.1 访问控制流程

任何请求访问 apiserver 都要经过三个阶段：

1. **Authentication（认证）**：确认客户端身份。
2. **Authorization（授权）**：判断是否有权限执行操作。
3. **Admission Control（准入控制）**：进行更精细的访问控制。

### 7.2 认证方式

- **HTTP Base 认证**：用户名 + 密码，Base64 编码。
- **HTTP Token 认证**：通过 Token 识别用户。
- **HTTPS 证书认证**：基于 CA 根证书签名的双向数字证书认证，安全性最高。

K8s 中的两类账号：

- **User Account**：外部服务管理的用户账号。
- **Service Account**：K8s 管理的账号，用于 Pod 内进程访问 K8s API。

### 7.3 RBAC 授权

RBAC（Role-Based Access Control）涉及四个资源对象：

- **Role**：命名空间级别的角色，定义一组权限。
- **ClusterRole**：集群级别的角色。
- **RoleBinding**：将 Role 绑定到 User、Group 或 ServiceAccount。
- **ClusterRoleBinding**：将 ClusterRole 绑定到集群范围的对象。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: dev
subjects:
- kind: User
  name: devman
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### 7.4 准入控制

常用准入控制器：

- **ResourceQuota**：限制命名空间资源使用。
- **LimitRanger**：对 Pod 进行资源限制。
- **NamespaceLifecycle**：管理命名空间生命周期。
- **DefaultStorageClass**：为 PVC 匹配默认 StorageClass。
- **PodSecurity**：控制 Pod 安全策略（PodSecurityPolicy 已在 K8s 1.25 移除，由 Pod Security Standards 替代）。

### 7.5 Dashboard

Kubernetes Dashboard 是基于 Web 的 UI，可部署应用、监控状态、管理资源。

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v3.0.0/aio/deploy/recommended.yaml
kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
kubectl create clusterrolebinding dashboard-admin-rb --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
kubectl create token dashboard-admin -n kubernetes-dashboard
```

> 💡 补充：Dashboard 默认使用最小权限部署。生产环境应通过 RBAC 授予最小必要权限，避免使用 cluster-admin。

---

## 八、实战部署

### 8.1 集群搭建方式

常用搭建方式：

- **kubeadm**：官方推荐，快速搭建。
- **minikube**：本地单节点开发环境。
- **k3s**：轻量级，适合边缘场景。
- **kind**：Docker in Docker，适合 CI/CD 测试。
- **公有云托管**：EKS、AKS、GKE、阿里云 ACK、腾讯云 TKE。

### 8.2 基础 kubectl 命令

```bash
# 查看节点
kubectl get nodes

# 查看所有 Pod
kubectl get pods -A

# 查看指定命名空间
kubectl get pods -n dev

# 查看详情
kubectl describe pod <pod-name> -n dev

# 查看日志
kubectl logs <pod-name> -n dev
kubectl logs -f <pod-name> -c <container-name> -n dev

# 进入容器
kubectl exec -it <pod-name> -n dev -- /bin/sh

# 创建/删除资源
kubectl apply -f app.yaml
kubectl delete -f app.yaml

# 扩缩容
kubectl scale deploy <deploy-name> --replicas=3 -n dev

# 查看资源说明
kubectl explain pod.spec.containers
```

### 8.3 部署一个 Web 应用

```bash
kubectl create namespace dev
kubectl create deployment web --image=nginx:1.25 -n dev --replicas=3
kubectl expose deployment web --port=80 --type=NodePort -n dev
kubectl get pods,svc -n dev
```

### 8.4 滚动升级与回滚

```bash
kubectl set image deployment/web web=nginx:1.26 -n dev
kubectl rollout status deployment/web -n dev
kubectl rollout history deployment/web -n dev
kubectl rollout undo deployment/web -n dev
```

### 8.5 Namespace 与 Label

```bash
kubectl create ns dev
kubectl label pod nginx-pod version=1.0 -n dev
kubectl label pod nginx-pod version=2.0 --overwrite -n dev
kubectl get pods -n dev -l version=2.0 --show-labels
```

---

## 九、2026 年 K8s 生态

截至 2026 年，Kubernetes 已成为云原生基础设施的事实标准，生态持续演进：

- **容器运行时**：Docker 已逐步退出核心，containerd、CRI-O 成为主流。K8s 1.24+ 已移除 Dockershim。
- **网络插件**：Calico 和 Cilium 占据主流，Cilium 基于 eBPF 提供高性能可观测性和安全策略。
- **服务网格**：Istio、Linkerd、Cilium Service Mesh 提供东西向流量治理、可观测性和零信任安全。
- **GitOps**：Argo CD 和 Flux 成为持续交付的主流方案，声明式配置与版本控制结合。
- **可观测性**：Prometheus + Grafana 用于监控，Loki 用于日志，Jaeger/Tempo 用于链路追踪，OpenTelemetry 成为统一标准。
- **策略与治理**：OPA/Gatekeeper、Kyverno 用于策略即代码。
- **Serverless on K8s**：Knative、OpenFaaS、KEDA 让事件驱动的自动扩缩容更成熟。
- **AI/ML 工作负载**：Kubeflow、Ray on K8s、GPU Operator 使 K8s 成为 AI 训练与推理的重要平台。
- **安全**：Pod Security Standards 替代 PodSecurityPolicy，Supply Chain Security（Sigstore、SLSA）受到重视。

> 💡 补充：虽然原始归档基于 K8s 1.17，但核心概念（Pod、Deployment、Service、RBAC 等）至今仍然适用。学习时建议结合当前稳定版本（1.33+）的官方文档理解 API 版本差异。

---

## 十、常见坑与补充

1. **Pod 删除后自动重建**：由控制器创建的 Pod，删除后会自动重建。需要删除控制器（Deployment、ReplicaSet 等）才能彻底删除 Pod。

2. **Service 无法访问**：检查 selector 是否与 Pod 的 label 匹配；检查 targetPort 是否与容器端口一致；检查 Endpoints 是否生成。

3. **镜像拉取失败**：检查镜像名称、tag、仓库权限；注意 `imagePullPolicy` 和 `latest` 标签的默认策略差异。

4. **Pod 一直处于 Pending**：通常是资源不足（CPU/内存）、调度约束无法满足（nodeSelector/affinity/taints）、PVC 未绑定或镜像拉取中。

5. **权限不足**：检查 RBAC 的 Role/ClusterRole 和 RoleBinding/ClusterRoleBinding 是否正确绑定到用户或 ServiceAccount。

6. **DNS 解析问题**：检查 CoreDNS 是否正常运行；Headless Service 的域名格式为 `<service-name>.<namespace>.svc.cluster.local`。

7. **存储挂载失败**：检查 PV 与 PVC 的 accessModes、storageClassName、容量是否匹配；检查 NFS/CSI 驱动是否可用。

8. **HPA 不生效**：确认 metrics-server 已安装并正常运行；确认 Deployment 已设置 resources.requests。

> 💡 补充：学习 K8s 的核心是掌握对 Pod、Pod 控制器、Service、存储、配置、RBAC 等资源的操作。原始归档的 7 篇笔记对每类资源都有详细展开，遇到具体问题可回查原文。

---

## 📚 完整资料

- [archive/old-k8s-notes/](../archive/old-k8s-notes/)
  - [1-k8s的介绍.md](../archive/old-k8s-notes/1-k8s的介绍.md)
  - [2-k8s集群环境的搭建和资源管理.md](../archive/old-k8s-notes/2-k8s集群环境的搭建和资源管理.md)
  - [3-实战.md](../archive/old-k8s-notes/3-实战.md)
  - [4-Pod详解.md](../archive/old-k8s-notes/4-Pod详解.md)
  - [5-Pod控制器详解.md](../archive/old-k8s-notes/5-Pod控制器详解.md)
  - [6-Service详解.md](../archive/old-k8s-notes/6-Service详解.md)
  - [7-数据存储、安全认证、DashBoard.md](../archive/old-k8s-notes/7-数据存储、安全认证、DashBoard.md)

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-22 | 订正 | 移除已废弃的 `--record` 参数；标注 Recycle 回收策略已移除；PodSecurityPolicy 已移除说明；Dashboard 版本更新为 v3.0.0；K8s 版本参考更新为 1.33+ |
| 2026-07-22 | 审查 | 全面审查，核心概念与 API 版本正确，2026 生态描述完备 |
