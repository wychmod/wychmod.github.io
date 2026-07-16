# CI-CD 持续集成

> **原文归档**：[archive/old-cicd-notes/](../archive/old-cicd-notes/)
> 包含：13 个文件（CI/CD / Jenkins / Docker / K8s 部署 / GitHub Actions）

## 一、核心主题概述

本文件汇总了 CI/CD（持续集成 / 持续交付 / 持续部署）从代码提交到生产环境发布的完整链路，涵盖以下核心主题：

- **CI/CD 基础概念**：什么是 CI、CD（持续交付与持续部署），以及典型的端到端流水线架构。
- **Jenkins 流水线**：在 CentOS 环境下安装 Docker、Portainer、Jenkins，配置 Node.js 构建环境、Git 凭证、Docker 镜像构建与推送，以及通过 `kubectl` 远程部署到 Kubernetes。
- **Docker 与镜像构建**：Docker 安装、Dockerfile 编写、`docker build` / `docker push`、私有镜像库（Nexus3）搭建与认证。
- **Kubernetes 部署**：K8s 集群搭建、Deployment / Pod / Service / Ingress 等核心资源、DNS 服务发现、ConfigMap 与 Secret 的配置管理。
- **灰度发布与滚动更新**：基于 ingress-nginx 的 Canary 灰度发布（Cookie / Header / 权重），以及 K8s 默认的 RollingUpdate 与 Recreate 策略。
- **探针与可用性**：LivenessProbe、ReadinessProbe、StartupProbe 三种探针及 Exec / TCP / HTTP 探测方式。
- **GitHub Actions**：工作流、任务、步骤、Action 概念与典型 YAML 配置。
- **实战训练**：一个前后端分离项目从 Jenkins 构建、镜像推送到 K8s 部署与数据库初始化的完整案例。

## 二、CI/CD 基础概念

**CI（Continuous Integration，持续集成）**：从代码仓库拉取代码后，执行预置的构建脚本（编译、压缩、测试等），生成**制品**（Artifact）并推送至**制品库**。常用工具包括 GitLab CI、GitHub Actions、Jenkins 等。CI 只负责构建，不参与部署。

**CD 有两层含义**：
- **持续交付（Continuous Delivery）**：将制品部署到测试环境或交付给客户提前验证。
- **持续部署（Continuous Deployment）**：将制品自动部署到生产环境。

**典型端到端架构**：
1. 开发者将代码提交到 Git 仓库。
2. 通过 WebHook 或手动触发 Jenkins 构建。
3. Jenkins 执行构建脚本，编译成功后打包为 Docker 镜像并推送到私有镜像库。
4. 使用 `kubectl` 向远程 K8s 集群发送镜像版本更新指令。
5. K8s 集群从镜像库拉取新镜像，按滚动升级策略完成零停机发布。

> 💡 补充：CI 与 CD 可以共用同一平台（如 Jenkins、GitLab CI），也可以拆分（CI 用 GitHub Actions，CD 用 Argo CD 做 GitOps）。

## 三、Jenkins 流水线

### 3.1 环境准备

在 CentOS 上通常需要依次安装：
- **Docker**：`yum install -y yum-utils device-mapper-persistent-data lvm2`，添加阿里云 Docker CE 源后安装并启动。
- **Portainer**（可选）：通过 Docker 运行可视化容器管理界面。
- **Jenkins**：基于 Java，先安装 OpenJDK，再导入 Jenkins yum 源安装；默认端口 8080 / 50000；首次启动需从 `/var/lib/jenkins/secrets/initialAdminPassword` 获取解锁密码，并替换插件源为清华大学镜像加速。

### 3.2 Jenkins 与 Docker 权限

Jenkins 默认以 `jenkins` 用户执行 Shell，若该用户没有 Docker 权限，会出现 Unix Socket 访问失败。解决方式：

```shell
sudo groupadd docker
sudo gpasswd -a jenkins docker
newgrp docker
systemctl restart jenkins
```

### 3.3 Node.js 与 Git 凭证

- 安装 Jenkins 的 `NodeJS` 插件，在 **Global Tool Configuration** 中配置 Node 版本，并在任务 **构建环境** 中勾选 `Provide Node & npm bin/ folder to PATH`。
- 对于私有 Git 仓库，使用 `ssh-keygen` 生成密钥对，将公钥配置到 Gitee/GitHub，私钥以 `SSH Username with private key` 凭证形式配置到 Jenkins。

### 3.4 Jenkinsfile 示例

```groovy
pipeline {
    agent any
    environment {
        IMAGE_TAG = sh(script: 'date +%Y%m%d%H%M%S', returnStdout: true).trim()
        REGISTRY = '172.16.81.7:8082'
    }
    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'gitee-ssh-key', url: 'git@gitee.com:xxx/demo.git'
            }
        }
        stage('Build') {
            steps {
                sh 'npm install --registry=https://registry.npmmirror.com'
                sh 'npm run build'
            }
        }
        stage('Docker Build & Push') {
            steps {
                sh """
                    docker build -t ${REGISTRY}/frontend-app:${IMAGE_TAG} .
                    docker login -u ${DOCKER_LOGIN_USERNAME} -p ${DOCKER_LOGIN_PASSWORD} ${REGISTRY}
                    docker push ${REGISTRY}/frontend-app:${IMAGE_TAG}
                """
            }
        }
        stage('Deploy to K8s') {
            steps {
                sh """
                    kubectl --kubeconfig=k8s-config.yaml set image deployment/demo-frontend \
                      demo-frontend=${REGISTRY}/frontend-app:${IMAGE_TAG}
                """
            }
        }
    }
}
```

> 💡 补充：镜像 Tag 推荐使用时间戳或 Git commit SHA，避免覆盖 latest 导致回滚困难。

## 四、Docker 与镜像构建

### 4.1 Docker 安装

```shell
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install -y docker-ce
systemctl start docker
systemctl enable docker
```

配置阿里云镜像加速器可编辑 `/etc/docker/daemon.json`。

### 4.2 Dockerfile 示例

```dockerfile
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```

构建命令：

```shell
docker build -t myapp:v1 .
```

### 4.3 私有镜像库（Nexus3）

- Nexus3 是常用的私有制品库，支持 `proxy`（缓存外网）、`hosted`（私有推送）、`group`（组合）三种仓库类型。
- 创建 Docker hosted 仓库时，配置 HTTP 端口（如 8082），并在 **Realms** 中启用 `Docker Bearer Token Realm`。
- 客户端需要在 `/etc/docker/daemon.json` 的 `insecure-registries` 中添加镜像库地址，然后执行 `docker login`。
- 推送到私有库时，镜像 Tag 必须以镜像库地址开头，例如 `172.16.81.7:8082/frontend-app:20210117162137`。

```shell
# 给已有镜像打标签并推送
docker tag bd695e3e4317 172.16.81.7:8082/local/jenkins
docker push 172.16.81.7:8082/local/jenkins
```

> 💡 补充：生产环境建议启用 HTTPS 或使用 Harbor，并配置镜像签名与漏洞扫描。

## 五、Kubernetes 部署

### 5.1 核心资源

- **Pod**：K8s 最小可调度单元，可包含一个或多个容器，共享网络与存储；Pod IP 会漂移，不直接对外暴露。
- **Deployment**：无状态工作负载，负责维护 Pod 副本数、版本升级、扩缩容。
- **Service**：为 Pod 提供稳定的访问入口，解决 Pod IP 漂移问题；常见类型包括 `ClusterIP`、`NodePort`、`LoadBalancer`。
- **Ingress**：基于 HTTP/HTTPS 的七层负载均衡，可按路径、域名、Header/Cookie 转发流量；常用实现为 ingress-nginx。

### 5.2 部署与访问第一个应用

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: front-v1
spec:
  selector:
    matchLabels:
      app: nginx-v1
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx-v1
    spec:
      containers:
      - name: nginx
        image: registry.cn-hangzhou.aliyuncs.com/janlay/k8s_test:v1
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: front-service-v1
spec:
  selector:
    app: nginx-v1
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: NodePort
```

执行 `kubectl apply -f ./v1.yaml` 后，通过 `kubectl get svc` 查看 NodePort 端口，再用 `Master节点IP:端口` 访问。

### 5.3 Ingress 示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-demo
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - http:
      paths:
      - path: /wss
        pathType: Prefix
        backend:
          service:
            name: front-service-v1
            port:
              number: 80
```

### 5.4 DNS 服务发现

K8s 通过 **CoreDNS** 为 Service 提供内部域名。同命名空间下直接访问 `http://ServiceName:Port`；跨命名空间使用 `ServiceName.Namespace.svc.cluster.local`。

```shell
kubectl -n kube-system get all -l k8s-app=kube-dns -o wide
```

### 5.5 ConfigMap 与 Secret

**ConfigMap**：存放非敏感配置（环境变量、配置文件），支持命令行、YAML、文件、目录四种创建方式；可通过 `env` / `envFrom` 注入环境变量，或通过 `volumeMounts` 挂载为文件。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config
data:
  MYSQL_HOST: '192.168.1.172'
  MYSQL_PORT: '3306'
```

**Secret**：存放敏感信息（密码、Token、镜像库认证），常见类型：
- `Opaque`：通用 base64 编码键值对。
- `kubernetes.io/dockerconfigjson`：私有 Docker 镜像库认证，用于 `imagePullSecrets`。

```shell
kubectl create secret generic db-cred \
  --from-literal=username=admin \
  --from-literal=password=secret

kubectl create secret docker-registry private-registry \
  --docker-username=admin --docker-password=xxx \
  --docker-email=admin@example.com --docker-server=172.16.81.7:8082
```

> 💡 补充：Secret 仅做 base64 编码，并非加密；生产环境应启用 K8s etcd 加密或集成外部密钥管理系统（如 Vault、AWS KMS）。

## 六、灰度发布与滚动更新

### 6.1 灰度发布（Canary）

灰度发布（金丝雀发布）先让少量用户访问新版本，观察稳定后再逐步切流。ingress-nginx 通过 `canary` 相关注解实现：

- `nginx.ingress.kubernetes.io/canary: "true"`：开启灰度。
- `nginx.ingress.kubernetes.io/canary-by-cookie: key`：按 Cookie 切分。
- `nginx.ingress.kubernetes.io/canary-by-header: key` / `canary-by-header-value: value`：按 Header 切分。
- `nginx.ingress.kubernetes.io/canary-weight: "50"`：按权重百分比切分。

优先级：**canary-by-header > canary-by-cookie > canary-weight**。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-demo-canary
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "users_from_Beijing"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: front-service-v2
            port:
              number: 80
```

### 6.2 滚动更新

K8s Deployment 默认使用 `RollingUpdate`：逐个创建新版本 Pod，旧 Pod 进入平滑期后下线，实现零停机。

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
```

- `maxSurge`：升级过程中可超出期望副本数的最大 Pod 数/比例。
- `maxUnavailable`：升级过程中允许不可用的最大 Pod 数/比例。

另一种策略 `Recreate` 会先全部删除旧 Pod 再创建新 Pod，存在发布空窗期，不适用于高可用场景。

常用命令：

```shell
kubectl apply -f ./v2.yaml && kubectl rollout status deployment/front-v2
kubectl rollout pause deployment/front-v2
kubectl rollout resume deployment/front-v2
kubectl rollout undo deployment/front-v2
```

> 💡 补充：滚动更新适合无状态服务；有状态服务（如数据库）建议结合 StatefulSet + 人工审批或蓝绿部署。

## 七、探针与可用性

K8s 提供三种探针，用于在容器启动和运行期间判断健康状态：

| 探针 | 作用阶段 | 失败处理 |
|------|----------|----------|
| **StartupProbe** | 启动时 | 失败则重启容器；运行期间其他探针失效 |
| **LivenessProbe** | 运行时 | 失败则重启容器 |
| **ReadinessProbe** | 运行时 | 失败则将 Pod 从 Service Endpoints 移除，不再接收流量 |

### 探测方式

1. **ExecAction**：在容器内执行命令，返回 0 表示健康。
2. **TCPSocketAction**：尝试连接指定 TCP 端口。
3. **HTTPGetAction**：发送 HTTP GET 请求，2xx/3xx 表示健康。

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: Awesome
  initialDelaySeconds: 3
  periodSeconds: 3
readinessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

### 常用参数

- `initialDelaySeconds`：容器启动后首次探测前的等待时间。
- `periodSeconds`：探测间隔，默认 10 秒。
- `timeoutSeconds`：探测超时时间，默认 1 秒。
- `successThreshold`：失败后连续成功次数才认为恢复健康。
- `failureThreshold`：连续失败次数后触发失败处理。

> 💡 补充：建议为 Web 服务同时配置 LivenessProbe 与 ReadinessProbe，但避免两者探测路径完全相同，以免误杀。

## 八、GitHub Actions

GitHub Actions 是 GitHub 官方的持续集成/交付平台，核心概念：

- **Workflow（工作流）**：一个完整的自动化流程，放在 `.github/workflows/*.yml`。
- **Job（任务）**：一个 Workflow 可包含多个 Job，默认并行执行。
- **Step（步骤）**：每个 Job 由多个 Step 组成，按顺序执行。
- **Action（动作）**：可复用的单元，如 `actions/checkout@v4`、`actions/setup-node@v4`。

### 8.1 基础示例

```yaml
name: hello-github-actions
on:
  push:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: checkout_actions
        uses: actions/checkout@v4
      - name: setup-node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: npm install and build
        run: |
          npm install
          npm run build
      - name: commit push
        run: |
          git config --global user.email xxx@163.com
          git config --global user.name xxxx
          git add .
          git commit -m "update" -a || true
          git push
        env:
          email: xxx@163.com
```

### 8.2 构建 + 推送镜像 + 部署 K8s

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Push to registry
        run: docker push myregistry.com/myapp:${{ github.sha }}
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/web \
            web=myregistry.com/myapp:${{ github.sha }} --kubeconfig=kubeconfig.yaml
```

> 💡 补充：2026 年推荐使用 `actions/checkout@v4` 与 `actions/setup-node@v4`；对于 Docker 登录，请使用 `docker/login-action@v3` 而非在 Shell 中明文写入密码。

## 九、2026 年 CI/CD 趋势

1. **GitOps 成为主流**：以 Argo CD、Flux 为代表，通过 Git 仓库作为唯一事实来源，自动同步 K8s 集群状态。
2. **平台工程（Platform Engineering）**：企业倾向于构建内部开发者平台（IDP），将 CI/CD、环境管理、权限等沉淀为自助服务。
3. **AI 辅助流水线**：智能测试选择、失败日志分析、自动修复建议、代码审查与质量门禁。
4. **供应链安全**：SBOM（软件物料清单）、SLSA 框架、镜像签名（Sigstore/cosine）、依赖漏洞扫描成为标配。
5. **云原生 CI/CD**：Tekton、Dagger 等以容器为执行单元的 pipeline 引擎，便于跨云复用与缓存优化。
6. **镜像瘦身与安全**：多阶段构建、distroless/base 镜像、非 root 用户运行，降低攻击面。
7. **每次 PR 的临时环境**：通过 K8s Namespace 或 Preview Environment 自动创建独立测试环境，加速验收。
8. **可观测性延伸至流水线**：利用 OpenTelemetry 追踪构建、测试、部署全链路，定位慢步骤与瓶颈。
9. **Trunk-based Development + Feature Flag**：缩短分支生命周期，通过功能开关控制新特性上线，降低发布风险。

> 💡 补充：无论工具如何演进，CI/CD 的核心目标始终是“更快、更安全、更可靠地将代码变更交付到用户手中”。

## 十、常见坑与补充

- **坑 1：Jenkins 无法执行 docker 命令**——通常是因为 `jenkins` 用户不在 `docker` 组，或未正确映射 `/var/run/docker.sock`。
- **坑 2：镜像推送失败**——检查镜像 Tag 是否带镜像库前缀，以及 `insecure-registries` 或 HTTPS 证书配置。
- **坑 3：K8s 拉取私有镜像失败**——确认已创建 `docker-registry` 类型的 Secret，并在 Pod 的 `imagePullSecrets` 中引用。
- **坑 4：Pod 启动即 Running 但访问报错**——未配置 ReadinessProbe，导致未初始化完成的 Pod 被加入 Service Endpoints。
- **坑 5：灰度流量不生效**——检查 ingress-nginx 是否已部署，以及注解优先级（Header > Cookie > Weight）。
- **坑 6：滚动更新回滚痛苦**——建议使用 `kubectl rollout undo` 或配合 Helm/Argo CD 管理版本。
- **坑 7：ConfigMap/Secret 更新后应用未生效**——需要滚动重启 Pod 才能重新加载挂载的环境变量或卷。

> 💡 补充：所有归档原文均保留在下方，图片路径已统一修正为 `../youdaonote-images/`，文字保持原貌，方便回溯原始操作细节与截图。

---

# 以下为原内容存档
> 以下内容为原始归档文件的完整保留，仅修正图片相对路径，文字原貌不变。


## 1.什么是CI和CD，为什么要学CI和CD.md

## 什么是 CI/CD
开发人员过多关注构建和部署过程是很浪费时间的。以之前古老的构建部署流程为例子，需要经历以下步骤：

1.  开发人员将源代码，经过编译、压缩等一系列流程打包为**制品**（意思为打包后的成品）
2.  将制品上传到服务器。
3.  在服务器将编译后的文件，手动可用的容器服务内（例如 `Nginx，Tomcat，Apache` 等服务）

![](../youdaonote-images/Pasted%20image%2020230413232120.png)

`CI` 的意思是 `持续构建` 。负责拉取代码库中的代码后，执行用户预置定义好的操作脚本，通过一系列编译操作构建出一个 `制品` ，并将制品推送至到制品库里面。常用工具有 Gitlab CI，Github CI，Jenkins 等。这个环节不参与部署，只负责构建代码，然后保存构建物。构建物被称为 制品，保存制品的地方被称为 “制品库”。

CD 则有2层含义： `持续部署（Continuous Deployment）` 和 `持续交付（Continuous Delivery）` 。 `持续交付` 的概念是：将制品库的制品拿出后，部署在测试环境 / 交付给客户提前测试。 `持续部署` 则是将制品部署在生产环境。可以进行持续部署的工具也有很多： `Ansible` 批量部署， `Docker` 直接推拉镜像等等。当然也包括我们后面要写到的 `Kubernetes` 集群部署。

## CI和CD整体架构

![](../youdaonote-images/Pasted%20image%2020230413233936.png)

1.  你写完了代码，提交到了 `Git` 代码库
2.  随后，代码库配置的 `WebHook` 钩子或人工手动启动了 `Jenkins` 的构建流程
3.  `Jenkins` 启动构建流程。按照你之前配置好的构建脚本，将代码编译成功。
4.  编译成功后，将编译后的文件打包为 `docker` 镜像，并将镜像上传到私有镜像库。
5.  随后，使用 `kubectl` 指定远程的k8s集群，发送镜像版本更新指令
6.  远程的k8s集群接收到指令后，去镜像库拉取新镜像
7.  镜像拉取成功，按照升级策略（滚动升级）进行升级，此时不会停机。
8.  升级完毕。



## 10. Kubernetes DNS 策略：将你的服务连接起来.md

`A服务` 依赖另一个 `B服务` ，而我们常常不知道 `B服务` 的端口和IP，且端口和IP也相对不固定有可能经常更改。

这时候，我们就需要一个神器 —— **服务发现**

## 什么是服务发现

> 服务发现是指使用一个注册中心来记录分布式系统中的全部服务的信息，以便其他服务能够快速的找到这些已注册的服务。

当我们通过域名访问一个网站时，浏览器不会直接访问域名。而是先将域名发送至 `DNS` 服务器，获取到域名对应的IP后，再通过IP去访问真实服务器（如下图）。

![](../youdaonote-images/Pasted%20image%2020230426191112.png)

**我们日常上网，DNS服务器 将域名映射为真实IP的过程，就是一个服务发现的过程**。而我们再也不需要记住每个网站的IP，只需要记住永远不会更改的**域名**即可。

那么在 `Kubernetes` 中，如何做服务发现呢？我们前面写到过， `Pod` 的 `IP` 常常是漂移且不固定的，所以我们要使用 `Service` 这个神器来将它的访问入口固定住。

但是，我们在部署 `Service` 时，也不知道部署后的ip和端口如何。那么在 `Kubernetes` 中，我们可以利用 `DNS` 的机制给每个 `Service` 加一个内部的**域名**，指向其真实的IP。

## Kubernetes CoreDNS

在`Kubernetes`中，对 `Service` 的服务发现，是通过一种叫做 `CoreDNS` 的组件去实现的。

`CoreDNS` 是使用 `Go` 语言实现的一个DNS服务器。当然，它也不只是可以用在 `Kubernetes` 上。也可以用作日常 `DNS` 服务器使用。在 `Kubernetes` 1.11版本后，`CoreDNS` 已经被默认安装进了 `Kubernetes` 内。

我们也通过下面的命令验证下 `CoreDNS` 是否已经安装成功：

```shell
kubectl -n kube-system get all  -l k8s-app=kube-dns -o wide
```

![](../youdaonote-images/Pasted%20image%2020230426191714.png)

## 服务发现规则

在了解了 `CoreDNS` 的背景后，我们开始来验证下服务发现的规则。

首先，我们先进入一个 `Pod` 进行测试。我们先使用 `kubectl get pods` 命令来看下当前运行了哪些 `Pod`： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b6ae6300c4ed4e8593364d53e5cbd2ee~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 接着使用 `kubectl get svc` 看下运行了哪些 `Service` ： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06713e01d43140b99a6407a90e4d2110~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 可以看到，我们自己创建的 `Service` 有2个：`front-service-v1` 和 `front-service-v2` 。稍后我们就使用这两个 `Service` 来测试。

这里我们选择其中一个 `Pod` 进入看下。在这里，我们可以使用 `kubectl exec` 命令进入 `Pod` 内的容器。

```shell
kubectl exec -it front-v1-787bf5c86d-t78x5 -- /bin/sh
```

> kubectl exec 的作用是可以直接在容器内执行Shell脚本。 命令格式：kubectl exec -it [PodName] -- [Command] -i：即使没有连接，也要保持标准输入保持打开状态。一般与 -t 连用。 -t：分配一个伪TTY（终端设备终端窗口），一般与 -i 连用。可以分配给我们一个Shell终端

执行后，我们就进入了容器内部环境。此时，我们可以验证下服务规则。

在 `Kubernetes DNS` 里，服务发现规则有2种：跨 `namespace` 和同 `namespace` 的规则。

> kubernetes namespace（命名空间）是 kubernetes 里比较重要的一个概念。 在启动集群后，kubernetes 会分配一个默认命名空间，叫default。不同的命名空间可以实现资源隔离，服务隔离，甚至权限隔离。

因为我们在之前创建的服务，**都没有指定 `namespace`，所以我们的服务都是在同一个 `namespace` 下（默认space下），适用于同 `namespace` 规则。

在同 `namespace` 下的规则，我们只需要直接访问 **[http://ServiceName:Port** 就可以访问到相应的](https://link.juejin.cn/?target=http%3A%2F%2FServiceName%3APort**%25C2%25A0%25E5%25B0%25B1%25E5%258F%25AF%25E4%25BB%25A5%25E8%25AE%25BF%25E9%2597%25AE%25E5%2588%25B0%25E7%259B%25B8%25E5%25BA%2594%25E7%259A%2584 "http://ServiceName:Port**%C2%A0%E5%B0%B1%E5%8F%AF%E4%BB%A5%E8%AE%BF%E9%97%AE%E5%88%B0%E7%9B%B8%E5%BA%94%E7%9A%84") `Service`。这里使用 `wget -q -O-` 即可将访问内容输出到控制台上：

```shell
wget -q -O- http://front-service-v1
```

> wget 是 Linux 平台中的一个下载文件的工具

如果你没有 `wget` 命令，使用 `curl` 命令替代它也可以：

```shell
curl http://front-service-v1
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb041153a7a941b9b72fa6d39725bd04~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 这里我们可以看到，是可以访问到同级服务的。当然我们上面也写到，还有一种是**跨`namespace`的发现规则**。不过即使是同 `namespace` ，也可以使用**跨namespace的发现规则。**

在 `Kubernetes DNS` 中，跨 `namespace` 的规则略为复杂。格式如下：

```css
[ServiceName].[NameSpace].svc.cluster.local
```

这里的 `ServiceName` 就是我们创建的 `Service` 名称；`NameSpace` 则是命名空间。如果你没有命名空间，则这个值为 `default`。

我们按照这个规则，再来尝试访问下：

```shell
curl http://front-service-v1.default.svc.cluster.local
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/159f730772a140109afab82e091c1822~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 经过验证，可以访问到。

## 11. Kubernetes ConfigMap：统一管理服务环境变量.md

但是在日常开发部署时，我们还会遇到一些环境变量的配置：例如你的数据库地址，负载均衡要转发的服务地址等等信息。这部分内容使用 `Secret` 显然不合适，打包在镜像内耦合又太严重。这里，我们可以借助 `Kubernetes ConfigMap` 来配置这项事情

## 什么是 ConfigMap

`ConfigMap` 是 `Kubernetes` 的一种资源类型，我们可以使用它存放一些环境变量和配置文件。信息存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内，也可以通过环境变量注入。和 `Secret` 类型最大的不同是，存在 `ConfigMap` 内的内容不会加密。

## 创建方式

和 `Secret` 一样， `ConfigMap` 也支持多种创建方式

### 命令行直接创建

第一种是使用命令行直接创建。我们直接使用 `kubectl create configmap [config_name]` 命令创建即可。格式如下：

```shell
kubectl create configmap [config_name] --from-literal=[key]=[value]
```

在这里， `--from-literal` 对应一条信息。如果想创建多个 `key value` 组合，向后重复 `--from-literal=[key]=[value]` 即可。

例如我创建一个 `mysql` 的配置文件，其中包含了服务地址，端口。则可以下面这种格式创建：

```shell
kubectl create configmap mysql-config \
--from-literal=MYSQL_HOST=192.168.1.172 \
--from-literal=MYSQL_PORT=3306
```

> 这里需要注意，configmap 的名称必须是全小写，特殊符号只能包含 '-' 和 '.'。可以用下面的这个正则表达式校验下看看符不符合规则：

> [a-z0-9](https://link.juejin.cn/?target=%255B-a-z0-9%255D*%255Ba-z0-9%255D "%5B-a-z0-9%5D*%5Ba-z0-9%5D")?(.[a-z0-9](https://link.juejin.cn/?target=%255B-a-z0-9%255D*%255Ba-z0-9%255D "%5B-a-z0-9%5D*%5Ba-z0-9%5D")?)*')

创建成功后，我们可以使用 `kubectl get cm` 查看我们创建过的 `configmap`： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/302314d80baa4d3dabff6e7a0e525460~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp)

可以看到，上面的就是我们刚创建的 `ConfigMap`。里面的 `DATA` 为 `2` ，代表有 `2` 条数据存在。我们直接使用 `kubectl describe cm mysql-config` 即可查看下这个 `ConfigMap` 的具体信息： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/695b43d9bdd74108a27be87d2bd848b9~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp)

这里可以看到刚才我们存放的数据，代表该 `configmap` 创建成功。

### 配置清单创建

当然，通过一个命令清单创建的方式也很简单。

我们新建一个文件，名称为 `mysql-config-file.yaml` ，填入以下内容：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config-file
data:
  MYSQL_HOST: '192.168.1.172'
  MYSQL_PORT: 3306
```

> 字符串不要忘记加引号

在这里，相信大部分字段大家已经都非常熟练了。`kind` 的值为 `ConfigMap` ，代表声明一个 `ConfigMap` 类型的资源； `metadata.name` 代表是该 `configmap` 的名称；`data` 是存放数据的地方，数据格式为 `key:value`。

按照惯例，我们保存后使用 `kubectl apply` 命令即可使配置生效：

```shell
kubectl apply -f ./mysql-config-file.yaml
```

生效后，我们直接使用 `kubectl describe cm mysql-config-file` 查看下配置结果 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67c109552ffe4b589a7c964915dfaa21~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 可以看到，要保存创建的内容成功存入。

### 文件创建

第二种方式是将文件加载进去，这种适合挂载配置文件（例如nginx配置文件等等）。这种方式，我们直接使用 `kubectl create configmap` 命令行创建即可。格式如下：

```shell
kubectl create configmap [configname] --from-file=[key]=[file_path]
```

这里每一条 `--from-file` 都代表一个文件。key是文件在 `configmap` 内的 `key`， `file_path` 是文件的路径。

我们创建一个文件，然后将文件内容存入 `configmap` 中。创建一个名为 `env.config` 的文件，输入以下内容：

```javascript
URL: 172.168.81.111
PATH: /root/abcd/efg
```

保存后，我们使用 `kubectl create configmap` 命令将其保存至 `configmap` 内：

```shell
kubectl create configmap env-from-file --from-file=env=./env.config
```

接着，我们直接使用 `kubectl get cm env-from-file -o yaml` 来查看下保存进入的内容 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/07cdcf8dd4a74400b2236557dffd093d~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 这里我们看到， `configmap` 直接将我们整个文件内容都保存了进去。 `env` 则是这个文件的 `key` 值。

### 目录创建

当然，可以将单个文件存入，也可以直接将一个目录下的文件整个存入进去。

目录创建这里和文件创建的命令差不多，其差别只是将 `--from-file` 的值从一个 `key=value`，变成了输入一整个文件夹。

```shell
kubectl create configmap [configname] --from-file=[dir_path]
```

我们创建一个文件夹，下面存放几个文件来测试下。这里我们创建了三个文件，分别是 `env1.config`，`env2.config`，`env3.config` 。内容也和其文件名对应。

```shell
mkdir env && cd ./env
echo 'env1' > env1.config
echo 'env2' > env2.config
echo 'env3' > env3.config
```

这样我们使用创建命令，将内容批量存入到 `configmap` 内：

```shell
kubectl create configmap env-from-dir --from-file=./
```

创建完成后，我们使用 `kubectl get cm env-from-dir -o yaml` 查看下保存进去的文件内容： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4babab7086e44746911d540950ad9b14~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 我们看到，文件夹下的文件内容被批量存放了进去。

## 使用方式

在了解了其创建方式后，我们来看看如何使用 `ConfigMap` 

### 环境变量注入

注入到环境变量是一种比较常见的方式。在这里，我们编辑下 `front-v1` 的 `deployment` 配置文件，来将 `configmap` 注入进环境变量内：

```yaml
env:
- name: MYSQL_HOST
  valueFrom:
    configMapKeyRef:
      name: mysql-config
      key: MYSQL_HOST
```

`configmap` 的环境变量注入，其实和 `Secret` 的环境变量注入方式差别不大，只是字段换成了 `configMapKeyRef` 。`name` 为要选择注入的 `configmap` 名称；`key` 则为 `configmap` 内的其中一个 `key`。

编辑完后，保存并退出。使用 `kubectl apply -f` 命令生效下配置文件，此时旧 Pod 会被杀死重启创建。

```shell
kubectl apply -f ./v1.yaml
```

生效后，在最新的 `Pod`  内使用 `kubectl exec` 命令来看看环境变量注入结果：

```shell
kubectl exec -it [POD_NAME] -- env | grep MYSQL_HOST
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e5a829bfdf649ddb2a1bb3c90ecc8d7~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 此时可以看到，我们的环境变量成功的注入了进去。

---

可是，如果一条一条地注入环境配置，是不是太麻烦了。怎样才能一次性将整个 `ConfigMap` 都注入进去呢？

在这里，我们可以借助 `containers.envFrom` 字段去一次性批量导入我们的 `configmap` ：

```yaml
envFrom:
- configMapRef:
   name: mysql-config
   optional: true
```

> 如果你的configmap中的key含有 "-"，会自动转换为 "_"

这里我们的 `name` 值为已配置好的 `configmap`， `optional` 代表如果没有该 `configmap` ，容器是否能够正常启动。

接着我们编辑下 `front-v1` 的 `deployment` 配置文件，加入这项配置 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf7bbb7bedc3438ea277ebf37ebc3079~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 添加后，保存并生效该 `deployment`，此时 `Pod` 会杀死重建。新 `Pod` 启动后，我们使用 `kubectl exec` 命令看下 `Pod` 内环境变量注入情况：

```yaml
kubectl exec -it [POD_NAME] -- env | grep MYSQL
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba42462afbca46399861708e03d35e07~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 此时我们可以看到，环境变量被批量注入了进去。

### 存储卷挂载

第二种方式是存储卷挂载。这种方式会将 `configmap` 里内容中的每个 `key` 和 `value`，以独立文件方式以外部挂载卷方式挂载进去（ `key` 是文件名，`value` 是文件内容）。这部分的用法和 `Secret` 的用法很像

我们编辑下 `front-v1` 的 `deployment` 配置文件，修改下配置：

**第一步：在 Pod 层面声明一个外部存储卷。 `name` 为存储卷名称；`configMap` 代表存储卷的文件来源为 `configMap` ； `configMap.name` 要填入要加载的 `configMap` 名称。位置如图所示：**

```yaml
volumes:
- name: envfiles
  configMap: 
    name: env-from-dir
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8509f822779545b5a8519c5360594f2a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp)

**第二步：在容器镜像层面配置存储卷。 `name` 的值来源于第一步配置的 `name` 值； `mountPath` 为要挂载的目录；`readonly` 则代表文件是不是只读。位置如图所示：**

```yaml
volumeMounts:
- name: envfiles
  mountPath: /root/
  readOnly: true
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e779ce57c4494f828829e49c6af75dc6~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp)

编辑完后，保存并退出。使用 `kubectl apply -f` 命令生效下配置文件。

```shell
kubectl apply -f ./v1.yaml
```

待 `Pod` 杀死重建后，我们来验证下文件是否已经挂载了进去。这里我们使用 `kubectl exec`命令看下目录是否这个文件：

```shell
kubectl exec -it [POD_NAME] -- ls /root
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21968932d27c4802874d409a97a33580~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 可以看到，三个文件都成功地挂载了进去。

---

但是，这种方式每次挂载都要将整个文件夹挂载进去，我们如何一次只挂载单个文件呢？这里我们可以借助 `volumes.configMap.items[]` 字段来配置多个 `item` 项：

```yaml
volumes:
- name: envfiles
  configMap:
    name: env-from-dir
    items:
    - key: env1.config
      path: env1.config
    - key: env2.config
      path: env2.config
```

这里的 `item` 是个数组，每一项都是一条 `ConfigMap` 里的独立字段。

其中，`key` 是 `ConfigMap` 中的字段名称；`path`则是要挂载的路径（相对于在容器镜像层面配置存储卷配置的 `mountPath` 字段）。填写保存后退出生效

接着我们用 `kubectl exec` 命令验证下挂载结果 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06dd0340a2304f8d917fdb10e8951619~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 结果如我们所愿，只挂载进去我们配置的2个文件。

## 12. 实战训练：部署一个前后端分离项目.md

## 操作步骤

在开始之前，我们需要在 `Kubernetes` 集群内再加一台 `Node` ，起名为 `node2` 。具体流程请参考之前的章节。 `Node2` 的主要用途是用于部署 `MySQL` 使用。

### 1. 项目仓库

先来看下这次项目部署所需要的仓库：[gitee.com/organizatio…](https://link.juejin.cn/?target=https%3A%2F%2Fgitee.com%2Forganizations%2Fjuejin-cicd%2Fprojects "https://gitee.com/organizations/juejin-cicd/projects")。 其中，`k8s-demo-frontend` 是前端项目，`k8s-demo-backend` 是后端项目。

### 2. 构建 & 部署前端应用

第一步我们先部署前端应用，先将前端跑起来。

我们前往 `Jenkins` ，新建一个任务，起名为 `demo-frontend` 。接着配置任务的Git代码源，让 Jenkins 可以拉取代码。因为我们目前是公开项目，所以还不需要配置私有仓库认证。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/317b7946ea3c446391e5f946f5df4136~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

按照之前的方式，勾选 `构建环境`  => `Provide Node & npm bin/ folder to PATH` 选项，给你执行的任务增加 `Nodejs` 运行环境 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/98239e4f76c047a7941c548053c256f1~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

继续添加构建脚本，让 `Jenkins` 构建镜像。找到 `构建` => `添加构建步骤` => `Excute Shell` ，填写以下脚本：

脚本首先使用 `npm run build` 对代码进行编译打包，随后使用 `docker build` 命令构建镜像。最后推送镜像到镜像库内。

```shell
#!/bin/sh -l

time=$(date "+%Y%m%d%H%M%S")
npm install --registry=https://registry.npm.taobao.org
npm run build
docker build -t 172.16.81.7:8082/frontend-app:$time .
docker login -u $DOCKER_LOGIN_USERNAME -p $DOCKER_LOGIN_PASSWORD 172.16.81.7:8082
docker push 172.16.81.7:8082/frontend-app:$time
```

因为推送镜像需要 `docker login` ，我们还需要在 `Jenkins` 端配置下 `docker` 登录信息。配置文件方式如下图，和之前的章节无异。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4753b1c28b324072b667dbcd5fb34809~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 保存后执行，即可生成前端镜像。

---

镜像生成后，我们还需要去k8s集群内部署下这个镜像。

前往集群节点，新建一个文件。叫做 `demo-frontend.yaml` ，输入以下内容。**镜像地址换成刚才 Jenkins 构建后的镜像地址。**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-frontend
spec:
  selector:
    matchLabels:
      app: demo-frontend
  replicas: 1
  template:
    metadata:
      labels:
        app: demo-frontend
    spec:
      imagePullSecrets:
      - name: private-registry
      containers:
      - name: frontend-app
        imagePullPolicy: Always
        image: 172.16.81.7:8082/frontend-app:20210117162137
        ports:
       	- containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: demo-frontend-service
spec:
  selector:
    app: demo-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: NodePort
```

保存后退出，使用 `kubectl apply` 命令部署前端服务。部署完毕后，使用 `kubectl get svc` 命令来获取下服务的端口。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7f81920bb4f4a0583d0e2cbf98143c5~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 可以看到，此时前端已经部署成功了。使用浏览器打开即可看到页面。

### 3. 部署 & 初始化MySQL

我们在开头时，添加了一台全新的 `Node` 节点，这台节点机器用于部署MySQL服务。我们可以给节点加污点，让除了特定的服务，其他服务都不可以部署上去。

这里添加一条污点， `key` 等于 `MySQL` ， `value` 等于 `true` 。

```shell
kubectl taint nodes node2 mysql=true:NoSchedule
```

添加完毕后，我们就可以放心部署 `MySQL` 了。不过在开始部署之前，我们还需要去 `Node2` 节点给 `MySQL` 的数据创建一个文件夹。我们会将本地的文件夹挂载进 `MySQL` 容器内，以方便 `MySQL` 数据可以持久化。

```shell
mkdir /var/lib/mysql && mkdir /var/lib/mysql/data
```

还需要给 `MySQL` 容器添加挂在访问密码。这里我们将密码存入 `secret` 内保存。

```shell
kubectl create secret generic demo-mysql-auth \
--from-literal=password=367734
```

此时我们就可以开始部署MySQL了。新建一个YAML文件，输入以下内容。这里给 `MySQL` 容器添加了污点对应的容忍度，密码也挂载了进去，设置了默认端口 `3306` 。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-mysql
  template:
    metadata:
      labels:
        app: demo-mysql
    spec:
      tolerations:
      - key: "mysql"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
      containers:
      - name: demo-mysql
        image: mysql:5.6
        imagePullPolicy: IfNotPresent
        args:
        - "--ignore-db-dir=lost+found"
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-data
          mountPath: "/var/lib/mysql"
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: demo-mysql-auth
              key: password
      volumes:
      - name: mysql-data
        hostPath: 
          path: /var/lib/mysql
          type: Directory        
---
apiVersion: v1
kind: Service
metadata:
  name: demo-mysql-service
spec:
  type: NodePort
  ports:
  - port: 3306
    protocol: TCP
    targetPort: 3306
  selector:
    app: demo-mysql
```

部署成功后，我们可以使用 `Navicat` 等工具访问数据库了。数据库的 `host` 是 `service` 的地址，用户是 `root` ，密码则是我们挂载进去的密码。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10a0f8f83c30427a8b9058777d55a3c9~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 可以访问数据库后，使用我们的初始化 `sql` 文件，初始化以下数据库和表结构。这里的 `sql` 创建了一个名称为 `demo-backend` 的数据库，数据库内创建了 `user` 表。并加入了4个数据库字段。

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `demo-backend` DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
USE `demo-backend`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(255) NOT NULL COMMENT '姓名',
  `age` int(11) NOT NULL COMMENT '年龄',
  `sex` varchar(255) NOT NULL COMMENT '性别；1男 2女',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
```

`sql` 执行成功后，代表数据库初始化成功。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a376324e6c7e428996336666ea7f737b~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

### 4. 构建 & 部署后端应用

最后一步就是部署后端服务了。首先第一步，也是在 `Jenkins` 端新建项目，具体流程和前端应用一样。构建脚本需要进行修改：

因为这里没有静态资源需要构建，所以直接将源码目录拷贝进容器即可：

```sql
#bin/bash
time=$(date "+%Y%m%d%H%M%S")
npm install --registry=https://registry.npm.taobao.org
docker build -t 172.16.81.7:8082/backend-app:$time .
docker push 172.16.81.7:8082/backend-app:$time
```

执行任务，镜像 `push` 完成代表成功。

镜像准备好后，我们需要在k8s端部署下服务。在部署之前，我们先将数据库相关信息存入 `configmap` ，然后挂载进后端服务：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config
data:
  host: 'demo-mysql-service'  
  port: 3306
  username: 'root'
  database: 'demo-backend'
```

存好后就可以部署后端服务了，以下是配置文件。内容拉取了一个后端服务镜像，并将数据库账号和端口服务地址通过 `configmap` 传入了进去。

**这里的镜像地址要更换 Jenkins 构建出来的镜像地址。**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-backend
spec:
  selector:
    matchLabels:
      app: demo-backend
  replicas: 1
  template:
    metadata:
      labels:
        app: demo-backend
    spec:
      imagePullSecrets:
      - name: private-registry
      containers:
      - name: backend-app
        imagePullPolicy: Always
        image: [镜像地址]
        ports:
       	- containerPort: 7001
        env:
        - name: MYSQL_HOST
          valueFrom:
            configMapKeyRef:
              name: mysql-config
              key: host
        - name: MYSQL_PORT
          valueFrom:
            configMapKeyRef:
              name: mysql-config
              key: port
        - name: MYSQL_USER
          valueFrom:
            configMapKeyRef:
              name: mysql-config
              key: username
        - name: MYSQL_DATABASE
          valueFrom:
            configMapKeyRef:
              name: mysql-config
              key: database
---
apiVersion: v1
kind: Service
metadata:
  name: demo-backend-service
spec:
  selector:
    app: demo-backend
  ports:
  - protocol: TCP
    port: 7001
    targetPort: 7001
  type: NodePort
```

保存后，使用 `kubectl apply` 即可让服务生效。

接着访问下前端界面，功能正常代表部署成功。

### 5. 集成 Jenkins

在前面的服务部署成功后，我们还需要使用 `Jenkins` 直接一键执行构建和部署。

我们在前面部署镜像时，都是在集群内直接操作。可是一般情况下，Jenkins 和 k8s 并不在一台机器上。那我们如何远程操作集群呢？

这里可以使用 `kubectl 的 --kubeconfig`  命令，传入集群的配置文件即可远程操作。只要保证Jenkins和k8s集群网络互通即可。配置文件的路径也很好找，位于集群机器的 `~/.kube/config` 文件。

这样，我们在 `Jenkins` 端添加一个全局配置文件，方便任务使用。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9d4f6c3353748288e094476e68798b0~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

找到 `Manage Jenkins` => `Managed files` 。选择右边的 `Add a new Config` ： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a835680f235d473cad1cf1f06e58cf61~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp) 选择普通配置，给配置文件起好名称，将 `kubernetes` 配置文件内容拷贝进 `Content` 内即可： ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f8f97340fb646af8bb82edd1a866cec~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

随后，我们还需要在 `Jenkins` 机器上安装 `kubectl`，只安装 `kubectl` 即可。

```shell
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
        http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
yum install -y kubectl
```

回到任务编辑界面，找到 `绑定` 一栏，选择我们刚刚配置的配置文件。填写 `target` 一栏，让配置文件输出为文件。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/198380ba0e764af69dfdf38579955799~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

找到命令界面。以前端任务为例，我们在 `docker push` 的命令后，加一条 `kubectl` 执行命令。在这里，直接使用 `kubectl --kubeconfig` 制定配置文件，即可远程操作

```shell
kubectl --kubeconfig=k8s-config.yaml set image deployment/demo-frontend demo-frontend=172.16.81.7:8082/frontend-app:$time
```

> 我们可以使用 `kubectl set image` 命令快速设置镜像地址版本 格式为：kubectl set image deployment/[deployment名称] [容器名称]=[镜像版本]

保存后执行，提示 `deployment.apps/[deployment名称] image updated` 代表更新完毕。

## 2.安装docker、Portainer和jekins.md

## 安装 Docker

>可以使用 `Docker` 将应用打包成一个镜像，交给 `Kubernetes` 去部署在目标服务集群。并且可以将镜像上传到自己的镜像仓库，做好版本分类处理。

在开始安装之前，需要安装 `device-mapper-persistent-data` 和 `lvm2` 两个依赖。

`device-mapper-persistent-data` 是 `Linux` 下的一个存储驱动， `Linux` 上的高级存储技术。 `Lvm` 的作用则是创建逻辑磁盘分区。这里我们使用 `CentOS` 的 `Yum` 包管理器安装两个依赖：

```shell
yum install -y yum-utils device-mapper-persistent-data lvm2
```

依赖安装完毕后，我们将阿里云的 `Docker` 镜像源添加进去。可以加速 `Docker` 的安装。

```shell
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install docker-ce -y
```

安装完毕，我们就可以使用 `systemctl` 启动来启动 `Docker` 了。`systemctl` 是 `Linux` 的进程管理服务命令，他可以帮助我们启动 `docker` 

```shell
systemctl start docker
systemctl enable docker
```

接着执行一下 `docker -v` ，这条命令可以用来查看 `Docker` 安装的版本信息。当然也可以帮助我们查看 `docker` 安装状态。如果正常展示版本信息，代表 `Docker` 已经安装成功。

### 配置阿里云镜像源

登录阿里云官网，打开 [阿里云容器镜像服务](https://link.juejin.cn/?target=https%3A%2F%2Fcr.console.aliyun.com "https://cr.console.aliyun.com")。点击左侧菜单最下面的 `镜像加速器` ，选择 `CentOS` （如下图）。按照官网的提示执行命令，即可更换 `docker` 镜像源地址。

## 安装Portainer

### 1. 创建目录

```
mkdir -p /data/portainer/data /data/portainer/public
```

- 创建一个 portainer 下的 public 文件夹

### 2. 上传汉化包


### 4. 拉取最新的 Portainer

```
[root@CodeGuide portainer]# docker pull portainer/portainer
Using default tag: latest
latest: Pulling from portainer/portainer
94cfa856b2b1: Pull complete 
49d59ee0881a: Pull complete 
a2300fd28637: Pull complete 
Digest: sha256:fb45b43738646048a0a0cc74fcee2865b69efde857e710126084ee5de9be0f3f
Status: Downloaded newer image for portainer/portainer:latest
docker.io/portainer/portainer:latest
```

- docker pull portainer/portainer
- 拉取 portainer

### 5. 安装和启动

```
[root@CodeGuide portainer]# docker run -d --restart=always --name portainer -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v /data/portainer/data:/data -v /data/portainer/public:/public portainer/portainer
a29864c820494afe3e465ce9b58e686851f5c6526532fe52fc4b83c1cc0b705e
```

### 6. 访问 Portainer

- 地址：[http://39.96._._:9000/](#)
- 操作：登录后设置你的用户名和密码，并设置本地Docker即可，设置完成后，如下
![](../youdaonote-images/Pasted%20image%2020230804013007.png)

## 安装 Jenkins

在安装完 `Docker` 后，我们只是拥有了一个可以承载服务的载体。想实现自动化构建，还需要安装另一个构建工具 `Jenkins`。那什么是 `Jenkins` 呢？

`Jenkins` 是一个基于 `Java` 语言开发的持续构建工具平台，主要用于持续、自动的构建/测试你的软件和项目。它可以执行你预先设定好的设置和构建脚本，也可以和 Git 代码库做集成，实现自动触发和定时触发构建。

### 1. 安装 OpenJDK

因为 `Jenkins` 是 `Java` 编写的持续构建平台，所以安装 `Java` 必不可少。

在这里，我们选择安装开源的 `openjdk` 即可。 `openjdk` 是 `SunJDK` 一种**开源实现**。关于`openjdk` 是 `SunJDK` 的具体区别可以看下面的文章了解下。在这我们直接使用 `yum` 包管理器安装 `openjdk` 即可。

```shell
yum install -y java
```

> [www.zhihu.com/question/19…](https://link.juejin.cn/?target=https%3A%2F%2Fwww.zhihu.com%2Fquestion%2F19646618 "https://www.zhihu.com/question/19646618")

### 2. 使用 Yum 安装 Jenkins

由于 `Yum` 源不自带 `Jenkins` 的安装源，于是我们需要自己导入一份 `Jenkins` 安装源进行安装。导入后，使用 `Yum` 命令安装即可。

```shell
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
sudo yum -y install jenkins --nogpgcheck
```

### 3. 启动 Jenkins

`Jenkins` 安装后，会将启动命令注册到系统 `Service` 命令中。所以我们直接使用系统 `service` 命令启动 `Jenkins` 即可。在这里，有三个命令可以使用，分别对应 启动 / 重启 / 停止 三个命令。

在这里，我们直接调用 `service jenkins start` 启动 Jenkins 即可

```shell
systemctl start jenkins
systemctl status jenkins
```

### 4. 给 Jenkins 放行端口

在启动 `Jenkins` 后，此时 `Jenkins` 会开启它的默认端口 `8080` 。但由于防火墙限制，我们需要手动让防火墙放行 `8080` 端口才能对外访问到界面。

这里我们在 `CentOS` 下的 `firewall-cmd` 防火墙添加端口放行规则，添加完后重启防火墙。

```shell
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --zone=public --add-port=50000/tcp --permanent

systemctl reload firewalld
```

服务启动后，访问 `IP:8080` 。如果能够看到以下界面，代表正在启动。 `Jenkins` 第一次的启动时间一般比较长（视服务器性能而看）

### 5. 初始化 Jenkins 配置

#### 5.1 解锁 Jenkins

在 `Jenkins` 启动完成后，会自动跳转至这个界面（下方二图）。这是 `Jenkins` 的解锁界面，你需要输入存放在服务器的初始解锁密码才能进行下一步操作。

`Jenkins` 启动后，会生成一个**初始密码**。该密码在服务器的文件内存放，我们可以进入服务器查看密码内容，将密码填写在 `Jenkins` 的管理员密码输入框内：

```shell
cat /var/lib/jenkins/secrets/initialAdminPassword
```

点击 `继续` 按钮，解锁 Jenkins。

#### 5.2 下载插件

解锁后就来到了插件下载页面，这一步要下载一些 `Jenkins` 的功能插件。

因为 `Jenkins` 插件服务器在国外，所以速度不太理想。我们需要更换为清华大学的 `Jenkins` 插件源后，再安装插件，**所以先不要点安装插件。**

更换方法很简单。进入服务器，将 `/var/lib/jenkins/updates/default.json` 内的插件源地址替换成清华大学的源地址，将 google 替换为 baidu 即可。

```shell
sed -i 's/https:\/\/updates.jenkins.io\/download/http:\/\/mirrors.tuna.tsinghua.edu.cn\/jenkins/g' /var/lib/jenkins/updates/default.json; 

sed -i 's/www.google.com/www.baidu.com/g' /var/lib/jenkins/updates/default.json;
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ec4d971326e4a938596e501dcc92cff~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

接着点击 `安装推荐的插件` 即可。稍等一会插件安装完毕

### 6. 完成安装

插件安装完毕后，接着是注册管理员账号。

### 7. 测试安装

到这里，我们的 Jenkins 算是启动成功了。但是，我们还需要对 `Jenkins` 做一点点简单的配置，才可以让它可以构建 `docker` 镜像。

我们点击 `Jenkins` 首页 -> 左侧导航 -> 新建任务 -> **Freestyle project**

新建完毕后，找到 `构建` 一项，选择 `增加构建步骤`，选择 `执行shell` ，输入以下命令：

```shell
docker -v
docker pull node:latest
```

该命令会去拉取一个 `nodejs` 稳定版的镜像，我们可以来测试 `Docker` 的可用性

保存后，我们点击左侧菜单的**立即构建**， `Jenkins` 就会开始构建。选择左侧历史记录第一项（最新的一项），点击控制台输出，查看构建日志。

执行后，我们发现提示无访问权限。这又是什么情况呢？这里就不得不提到 `Linux` 下的 `Unix Socket`权限问题了

### 8. Unix Socket 权限问题

`docker` 的架构是 `C/S` 架构。在我们使用 `docker` 命令时，其实是命令使用 `socket` 与 `docker` 的守护进程进行通信，才能正常执行 `docker` 命令。

而在 `Linux` 中， `Unix socket` 属于 `root` 用户，因此需要 `root` 权限才能访问。官方是这么解释的：

> Manage Docker as a non-root user The docker daemon binds to a Unix socket instead of a TCP port. By default that Unix socket is owned by the user root and other users can only access it using sudo. The docker daemon always runs as the root user. If you don’t want to use sudo when you use the docker command, create a Unix group called docker and add users to it. When the docker daemon starts, it makes the ownership of the Unix socket read/writable by the docker group.

但是在 `docker` 中， `docker` 提供了一个 `用户组` 的概念。我们可以将执行 `Shell` 的用户添加到名称为 `docker` 的用户组，则可以正常执行 `docker` 命令。

而在 `Jenkins` 中执行的终端用户做 `jenkins` ，所以我们只需要将 `jenkins` 加入到 `docker` 用户组即可：

```shell
sudo groupadd docker          #新增docker用户组
sudo gpasswd -a jenkins docker  #将当前用户添加至docker用户组
newgrp docker                 #更新docker用户组
```

加入后，重启 `Jenkins` ：

```shell
systemctl restart jenkins
```

重启 `Jenkins` 后，再次执行脚本。此时执行成功。



## 3. 使用 Jenkins 构建镜像：将应用打包成镜像.md

## 1. 安装 Nodejs 环境

如果想要安装 `Node` 环境，有以下两个办法：

-   源码编译：这种方式是将 `Node`     源码拉下来后，在服务器端编译完成后才可以使用。时间比较长，流程也略复杂
-   使用 `Jenkins Plugin` 中 `NodeJS` 插件自动配置安装

第二种方式来安装，既方便又省力。

我们打开 `Jenkins` 首页，找到左侧的**系统配置 => 插件管理 => 可选插件**，搜索 `Node` 。选中 `NodeJS` 后，点击左下角的 `直接安装` 开始安装插件
![](../youdaonote-images/Pasted%20image%2020230417223350.png)

![](../youdaonote-images/Pasted%20image%2020230417223404.png) 等待安装完毕后，返回 `Jenkins` 首页。找到 **Global Tool Configuration => NodeJS => 新增NodeJS**

接着回到 `Jenkins` 首页，找到左侧的 `系统配置` ，选择 `全局工具配置`

![](../youdaonote-images/Pasted%20image%2020230417223849.png)

找到下面的 `NodeJS` ，点击 `NodeJS` 安装，选择相应的版本填写信息保存即可。

![](../youdaonote-images/Pasted%20image%2020230417223858.png)

### 如何使用

那我们在任务中如何使用呢？我们只需要在任务的**配置**中，找到**构建环境**，选中 `Provide Node & npm bin/ folder to PATH` ，选择刚才配置好的 `NodeJS` 即可。

![](../youdaonote-images/Pasted%20image%2020230417223907.png)

第一次执行会下载对应的 `Node` 版本，后续不会下载。

### 2.1 生成公钥私钥

首先，我们先来配置公钥和私钥。这是 `Jenkins` 访问 `Git` 私有库的常用认证方式。我们可以使用 `ssh-keygen` 命令即可生成公钥私钥。在本地机器执行生成即可。这里的邮箱可以换成你自己的邮箱：

```shell
ssh-keygen -t rsa -C "545480453@qq.com"
```

执行后，会遇到第一步步骤： `Enter file in which to save the key` 。

这一步是询问你要将公钥私钥文件放在哪里。默认是放在 `~/.ssh/id_rsa` 下，当然也可以选择输入你自己的路径。一路回车即可。

两个文件，xxx 是私钥文件，xxx.pub 是对应的公钥文件。**我们需要在 `Git` 端配置公钥，在 `Jenkins` 端使用私钥与 `Git` 进行身份校验。**

### 2.2 在 Gitee 配置公钥

在 `Gitee` 中，如果你要配置公钥有2种方式：仓库公钥 和 个人公钥。**其中，如果配置了仓库公钥，则该公钥只能对配置的仓库进行访问。如果配置了个人公钥，则账号下所有私有仓库都可以访问。**

### 2.3 在 Jenkins 配置私钥

回到 `Jenkins`。在 `Jenkins` 中，`私钥/密码` 等认证信息都是以 `凭证` 的方式管理的，所以可以做到全局都通用。 我们可以在配置任务时，来添加一个自己的凭证。点击项目的 配置，依次找到 **源码管理 => Git => Repositories **

![](../youdaonote-images/Pasted%20image%2020230417232100.png)

![](../youdaonote-images/Pasted%20image%2020230417232629.png)

这里的 `Repository URL` 则是我们的仓库地址， `SSH` 地址格式为 `git@gitee.com:xxx/xxx.git` 。可以从仓库首页中的 克隆/下载 => SSH 中看到

重点是 **Credentials** 这一项，这里则是我们选择认证凭证的地方。我们可以点击右侧 `添加 => Jenkins` 按钮添加一条新的凭证认证信息。

点击后会打开一个弹窗，这是 `Jenkins` 添加凭证的弹窗。选择类型中的 `SSH Username with private key` 这一项。接着填写信息即可：

-   ID：这条认证凭证在 `Jenkins` 中的名称是什么
-   描述：描述信息
-   Username：用户名（邮箱）
-   Private Key：这里则是我们填写私钥的地方。点击 **Add** 按钮，**将 xxx 私钥文件内所有文件内容全部复制过去（包含开头的 BEGIN OPENSSH PRIVATE KEY 和结尾的 END OPENSSH PRIVATE KEY）**

接着点击添加按钮，保存凭证。

![](../youdaonote-images/Pasted%20image%2020230417232736.png)

## 3. 构建镜像

### 3.1 编写 Dockerfile

#### 什么是 Dockerfile

`Dockerfile`  是一个 `Docker` 镜像的基础描述文件，里面描述了**生成一个镜像所需要的执行步骤**。我们也可以自定义一份 `Dockerfile` 来创建一个自己的镜像。

例如下面的步骤，使用 `Dockerfile` 可描述为：

1.  基于 `nginx:1.15` 镜像做底座。
2.  拷贝本地 `html` 文件夹内的文件，到镜像内 `/etc/nginx/html` 文件夹。
3.  拷贝本地 `conf` 文件夹内的文件，到镜像内 `/etc/nginx/`  文件夹。

```dockerfile
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```

编写完成后，怎么生成镜像呢？我们只需要使用 `docker build` 命令就可以构建一个镜像了：

```dockerfile
docker build -t imagename:version .
```

> -t: 声明要打一个镜像的Tag标签，紧跟着的后面就是标签。标签格式为 镜像名:版本 . ：声明要寻找dockerfile文件的路径，. 代表当前路径下寻找。默认文件名为 Dockerfile。 关于更多 DockerFile 的语法，详细可以看这里 [www.runoob.com/docker/dock…](https://link.juejin.cn/?target=https%3A%2F%2Fwww.runoob.com%2Fdocker%2Fdocker-dockerfile.html "https://www.runoob.com/docker/docker-dockerfile.html")

---

因为我们的镜像只包含一个 `nginx`，所以 `dockerfile` 内容比较简单。我们只需要在代码根目录下新建一个名为 `Dockerfile` 的文件，输入以下内容，并将其提交到代码库即可。

```shell
vi Dockerfile
```

```dockerfile
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
```

```shell
git add ./Dockerfile
git commit -m "chore: add dockerfile"
git push
```

### 3.2 Jenkins 端配置

在代码源和 `DockerFile` 准备就绪后，我们只需在 `Jenkins` 端配置下要执行的 `Shell` 脚本即可。找到项目的配置，依次找到** 构建 => Execute shell**。输入以下脚本：

```shell
#!/bin/sh -l

npm install --registry=https://registry.npm.taobao.org
npm run build
docker build -t jenkins-test .
```

这里脚本很简单，主要是**安装依赖 => 构建文件 => 构建镜像**。填写完毕后保存

## 4. 执行任务

保存后我们去手动触发执行下任务。当未抛出错误时，代表任务执行成功

![](../youdaonote-images/Pasted%20image%2020230417233548.png)



## 4. 将镜像上传至私有镜像库.md

## 什么是镜像库

字面意思，镜像库就是集中存放镜像的一个文件服务。镜像库在 `CI/CD` 中，又称 `制品库` 。构建后的产物称为**制品**，制品则要放到**制品库**做**中转和版本管理**。常用平台有**Nexus，Jfrog，Harbor**或其他对象存储平台。

在这里，我们选用 `Nexus3` 作为自己的镜像库。因为其稳定，性能好，免费，部署方便，且支持类型多，是许多制品库的首选选型。

## 部署 Nexus 服务

在部署 `Nexus` 之前，需要先下载 `Nexus` 的安装包（这里需要另外找个托管服务）

```shell
wget https://dependency-fe.oss-cn-beijing.aliyuncs.com/nexus-3.29.0-02-unix.tar.gz
```

下载完成后，解压安装包

```shell
tar -zxvf ./nexus-3.29.0-02-unix.tar.gz
```

解压后，我们可以看到有2个文件夹。分别是 `nexus-3.29.0-02` 和 `sonatype-work` 。其中，`nexus-3.29.0-02` 是nexus主程序文件夹，`sonatype-work` 则是数据文件。

## 启动 Nexus

我们进入 `nexus-3.29.0-02` 下面的 `bin` 目录，这里就是 `nexus` 的主命令目录。我们在 `bin` 目录下，执行 `./nexus start` 命令即可启动 `nexus` ：

```shell
./nexus start
```

> nexus 还支持停止，重启等命令。可以在 bin 目录下执行 ./nexus help 查看更多命令

由于 `nexus` 默认服务端口是 `8081`，稍后我们还需要给镜像库访问单独开放一个 `8082` 端口。这里将 `8081`，`8082` 端口添加到防火墙放行规则内（没开防火墙则可以略过）：

```shell
firewall-cmd --zone=public --add-port=8081/tcp --permanent
firewall-cmd --zone=public --add-port=8082/tcp --permanent
```

打开浏览器地址栏，访问 `IP:8081` 。启动时间比较长，需要耐心等待。在 `Nexus` 启动后，会进入这个欢迎页面：

![](../youdaonote-images/Pasted%20image%2020230417234351.png)

## 配置 Nexus

进入欢迎页后，点击右上角的登录，会打开登录框。这里需要我们输入 `默认管理员密码` 进行初始化配置。

![](../youdaonote-images/Pasted%20image%2020230417234408.png)

可以在这里找到：

```shell
cat /opt/nexus/sonatype-work/nexus3/admin.password
# 0ee35fa5-d773-432b-8e76-6c10c940ccd9
```

将文件中获取到的密码输入进去，登录用户名是 `admin` 。

接着是修改新密码。修改后，会进入下图这一步。这一步的意思是**是否开启匿名访问**。匿名访问是指：**我们在没有登录的情况下，拉取（推送）制品到制品库，都算匿名访问。**这是个很便捷，也是个危险的行为。

![](../youdaonote-images/Pasted%20image%2020230417234438.png)

## 创建一个 Docker 私服

登录完成后，点击页面头部导航栏的**齿轮**图标，选择左侧菜单中的 `Repositories` ，点击 `Create repository` 。

![](../youdaonote-images/Pasted%20image%2020230417234605.png)

点击后，我们可以看到一个列表，这就是 `Nexus` 所支持的制品库类型。其中有我们要使用的 `Docker` ，也有我们熟悉的 `Npm` 。我们在里面找到 `Docker` ：

![](../youdaonote-images/Pasted%20image%2020230417234927.png)

### 选择制品库的类型

在 `nexus` 中，制品库一般分为以下三种类型：

-   proxy: 此类型制品库原则上**只下载，不允许用户推送**。可以理解为**缓存外网制品的制品库**。例如，我们在拉取 `nginx` 镜像时，如果通过 `proxy` 类型的制品库，则它会去创建时配置好的外网 `docker` 镜像源拉取（有点像 `cnpm` ）到自己的制品库，然后给你。第二次拉取，则不会从外网下载。起到 `内网缓存` 的作用。
-   hosted：此类型制品库和 `proxy` 相反，原则上 `只允许用户推送，不允许缓存`。这里只存放自己的私有镜像或制品。
-   group：此类型制品库可以将以上两种类型的制品库组合起来。组合后只访问 `group` 类型制品库，就都可以访问。

在这里，我们其实不需要**缓存外网镜像**，那么我们只需要 `hosted` 即可。选择 `docker (hosted)`。

我们将启动 `Nexus` 镜像时，配置好的 `Docker` 端口（预留了一个 `8082` 端口）填入 `HTTP` 输入框内。这里可以先允许匿名拉取镜像。

![](../youdaonote-images/Pasted%20image%2020230417235054.png)

### 给镜像库添加访问权限

在我们创建好镜像库后，还需要配置一步访问权限才可以。

找到页面头部导航栏的 `齿轮` 图标，选择左侧菜单中的 `Realms` 。找到右边的 `Docker Bearer Token Realm` ，将其添加到右边的 `Active` 内，保存即可。

![](../youdaonote-images/Pasted%20image%2020230417235152.png)

### 查看获取镜像库地址

找到我们刚刚创建的制品，点击上面的 `copy` ，查看镜像库地址。

![](../youdaonote-images/Pasted%20image%2020230417235215.png)

## 登录制品库

私服建设完成后，如果私服对外访问地址为HTTP的话，还需要在服务器配置一下才可以使用（HTTPS不需要配置）。

找到 `daemon.json` 文件，该文件描述了当前 `docker` 配置的镜像加速地址，和配置过的私服地址。

```shell
vi /etc/docker/daemon.json
```

找到 `insecure-registries` 字段，如果不存在就自己添加一个。值是数组类型，将你的制品库地址填写上去。例如：

```json
{
  "insecure-registries" : [
    "172.16.81.7:8082"
  ],
}
```

> 注意，nexus 显示的镜像库端口为 nexus 服务端口，要替换为自己配置的端口才有效。

保存并退出，重启 Docker

```shell
systemctl restart docker
```

接着使用 `docker login` 命令尝试登录：

```shell
docker login 服务IP:端口
```

如果提示：**Login Succeeded 则代表登录成功**。

## 推送镜像到制品库

在完成镜像库配置后，我们就可以使用 Jenkins 推送自己的镜像到镜像库了。我们找到 Jenkins 任务中设置 Shell 的编辑框，添加一条推送镜像的命令进去：

**注意！**

`docker` 在推送一个镜像时，**镜像的 Tag (名称:版本号) 开头必须带着镜像库的地址，才可以推送到指定的镜像库**。例如 `jenkins-test` 是不能推送到镜像库的。而 `172.16.81.7:8082/jenkins-test` 则可以推送到镜像库。

我们可以重新制作一份带镜像库地址的镜像。找到 Jenkins 的 Shell 编辑框，j将构建的 Shell 脚本修改为以下内容：

```shell
#!/bin/sh -l

npm install --registry=https://registry.npm.taobao.org
npm run build
docker build -t 172.16.81.7:8082/jenkins-test .
docker push 172.16.81.7:8082/jenkins-test
```

这里将**构建的镜像名称加了镜像库的前缀**，推送镜像也是一样，这样才可以将镜像推送到指定镜像库。保存后并重新构建一次。

### 利用凭据给 Shell 注入镜像库用户名密码

没有权限怎么办呢？我们可以使用 `docker login` 在 `shell` 脚本里面登录下。想直接在命令里写入用户名和密码，可以直接加 `-u 用户名 -p 密码` 即可。例如：

```shell
docker login -u "用户名" -p "密码" 172.16.81.7:8082
```

但这样，我们需要在命令里面写死用户名和密码，无论是安全和友好性上，都是不太合适的。这里我们可以借助 Jenkins 的凭据功能，添加一条用户名密码凭据，然后利用 Shell 变量写入在终端内。

找到任务的设置界面 => 构建环境 => 勾选 Use secret text(s) or file(s) => 找到左下角的新增按钮，选择 `Username and password (separated)`

![](../youdaonote-images/Pasted%20image%2020230418000730.png)

打开后，我们可以添加一条凭据。点击凭据字段下面的添加，弹出以下弹窗，在这里填入你的用户名和密码。ID为凭据名称，描述随意。

![](../youdaonote-images/Pasted%20image%2020230418000810.png)

添加后，返回下图模块。在这里选择你刚才添加的凭据，用户名变量可以起名为 `DOCKER_LOGIN_USERNAME` ，密码可以起名为 `DOCKER_LOGIN_PASSWORD` 。

![](../youdaonote-images/Pasted%20image%2020230418000919.png)

接着找到下面的构建，找到 `docker login` 命令，将我们保存的用户名和密码变量填写进去：

```shell
docker login -u $DOCKER_LOGIN_USERNAME -p $DOCKER_LOGIN_PASSWORD 172.16.81.7:8082
```

接着保存并构建，提示权限通过，构建成功

## 如何推送已有的镜像到仓库呢？

上面是推送我们现场编译的镜像，镜像名称都可以一条龙约定好。可是面对 load /pull 进来的镜像，我们如何推送到自己的镜像库呢？

这里可以使用 `docker tag` 命令给已有的镜像打个标签。在打新Tag时可以在Tag头部加入镜像库地址。如下面格式。

```shell
# docker tag <镜像ID>/<镜像名称> 新镜像名称[:版本]
docker tag bd695e3e4317 172.16.81.150:8082/local/jenkins
```

> 查看服务器上的docker镜像列表，可以使用 docker images 查看

这样，就可以重新打一个全新的tag，实现 `重命名` 功能。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2de59d65e6544b1a8be6495fec3709cf~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

接着我们使用 `docker push` 命令就可以进行推送了：

```shell
docker push 172.16.81.150:8082/local/jenkins
```

## 5. 搭建 Kubernetes 集群：持续部署环境起步.md

## 什么是 Kubernetes？

> Kubernetes 是 Google 开源的一个容器编排引擎，它支持自动化部署、大规模可伸缩、应用容器化管理。在生产环境中部署一个应用程序时，通常要部署该应用的多个实例以便对应用请求进行负载均衡。

通俗些讲，可以将 `Kubernetes` 看作是用来是一个部署镜像的平台。可以用来操作多台机器调度部署镜像，大大地降低了运维成本。

**一个形象的比喻：如果你将 `docker` 看作是飞机，那么 `kubernetes` 就是飞机场。在飞机场的加持下，飞机可以根据机场调度选择在合适的时间降落或起飞。**

在 `Kubernetes` 中，可以使用集群来组织服务器的。集群中会存在一个 `Master` 节点，该节点是 `Kubernetes` 集群的控制节点，负责调度集群中其他服务器的资源。其他节点被称为 `Node` ， `Node` 可以是物理机也可以是虚拟机。

## 基础安装

https://mp.weixin.qq.com/s?__biz=MzA5Mjc1MjEwMg==&mid=2452395461&idx=1&sn=970236861faefd9a14f2ec13ce03e780&chksm=87b0644cb0c7ed5a486ac93f49eaf60e6e9d347a1ac86b1f51c72b152306246cc892f746b071&token=1780604434&lang=zh_CN#rd

高版本配置
https://blog.csdn.net/weixin_45387943/article/details/123225090

arm源
https://blog.csdn.net/yinjl123456/article/details/117048702

https://zhuanlan.zhihu.com/p/602626745

## 6. 使用 Kubernetes 部署访问你的第一个应用.md

## 声明一份配置清单

在开始部署前，我们先要声明一份 `配置清单` ，清单的文件格式为 `YAML` 文件格式。在 Kubernetes 中，应用部署完全可以通过 `YAML` 配置清单来进行部署。

新建一个文件夹，名称叫 `deployment`，并在文件夹内创建一份 `yaml` 文件，名称为 `v1`：

```shell
mkdir deployment && cd deployment
vim v1.yaml
```

接着在配置文件中，写入以下内容：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: front-v1
spec:
  selector:
    matchLabels:
      app: nginx-v1
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx-v1
    spec:
      containers:
      - name: nginx
        image: registry.cn-hangzhou.aliyuncs.com/janlay/k8s_test:v1
        ports:
        - containerPort: 80
```

我们关注下 YAML 文件中的 kind 字段。这是在声明 Kubernetes 的资源类型。在这里，我们的 `kind` 值为 `deployment`。那 `deployment` 又是什么呢？

---

### 什么是 Deployment

如果你将 `k8s` 看作是一个大型机场，那么 `deployment` 刚好就是机场内的**停机坪**。

根据飞机的种类进行划分停机坪，不同的停机坪都停着不同类型的飞机。只不过，`deployment` 要比停机坪还要灵活，随时可以根据剩余的空地大小（服务器剩余资源）和塔台的指令，增大/变小停机坪的空间。**这个“增大变小停机坪空间的动作”，在k8s中就是 `deployment` 对它下面所属容器数量的扩容/缩小的操作。**

![](../youdaonote-images/Pasted%20image%2020230419231205.png)

那么这也就代表，**`deployment`是无状态的，也就不会去负责停机坪中每架飞机之间的通信和组织关系**。只需要根据塔台的指令，维护好飞机的更新和进出指令即可。**这个根据指令维护飞机更新和进出的行为，在k8s中就是 `deployment` 对他下面的容器版本更新升级，暂停和恢复更新升级的动作。**

在这里的**容器**，并不等于 Docker 中的容器。它在K8S中被称为 `Pod` 。那么 `Pod` 是什么 ?

---

### 什么是 Pod

Pod 是 K8S 中最小的可调度单元（可操作/可部署单元），它里面可以包含1个或者多个 Docker 容器。在 Pod 内的所有 Docker 容器，都会共享同一个网络、存储卷、端口映射规则。一个 Pod 拥有一个 IP。

但这个 IP 会随着Pod的重启，创建，删除等跟着改变，所以不固定且不完全可靠。这也就是 Pod 的 IP 漂移问题。这个问题我们可以使用下面的 Service 去自动映射

![](../youdaonote-images/Pasted%20image%2020230419231253.png)

我们经常会把 Pod 和 Docker 搞混，这两者的关系就像是豌豆和豌豆荚，Pod 是一个容器组，里面有很多容器，容器组内共享资源。

---

### 分析配置文件构成

那么相信大家对 `deployment` 有大体的概念了。当然，`kind` 字段不只可以声明 `deploymnt` ，还可以声明其他的资源类型。重要的我们在后面的章节中都会写到。

了解了 `deployment` 是啥后，我们来看看配置清单中的字段都代表的是啥。我们将配置分成三段去进行阅读：

最上面的第一段声明了当前资源配置的 API 版本，资源类型和资源名称：

-   API 配置版本： `apps/v1`
-   资源类型：`deployment`
-   资源名称：`deplyment` 的名称叫 `front-v1`

其中，API 配置版本会随着 K8S 版本迭代和资源类型不同有变化。具体可以看下面这个链接：

> 该怎么选择 apiVersion 的值: [matthewpalmer.net/kubernetes-…](https://link.juejin.cn/?target=https%3A%2F%2Fmatthewpalmer.net%2Fkubernetes-app-developer%2Farticles%2Fkubernetes-apiversion-definition-guide.html "https://matthewpalmer.net/kubernetes-app-developer/articles/kubernetes-apiversion-definition-guide.html")


根据规则匹配相应的 `Pod` 进行控制和管理。这里使用 `matchLabels` 字段匹配 `Pod` 的 `label` 值。

-   replicas：要创建的 `Pod` 最大数量。数字类型
-   labels.app：Pod 组的名称
-   spec：组内创建的 Pod 信息
    -   name：Pod 名称
    -   image：以什么镜像创建 Pod。这里是 Docker 镜像地址
    -   ports.containerPort：Pod 内容器映射的端口

## **启动第一个应用**

好了，在我们了解完一份简单的 `deployment` 的配置清单后，我们就可以使用该清单创建我们的第一个应用。

在k8s中，我们使用 `kubectl apply` 来执行一份k8s的配置：

```shell
kubectl apply -f ./v1.yaml
```

其中，`kubectl apply` 代表准备对资源进行配置。 `-f` 等于 `--filename`，后面可以跟随多个配置文件。例如：

```shell
kubectl apply -f ./v1.yaml ./v1-service.yaml ./v1-ingress.yaml
```

当提示下面文字时，代表配置文件执行成功：

![](../youdaonote-images/Pasted%20image%2020230419231607.png)

如果你想看部署完毕后的 `Pod` 运行状态，可以使用 `kubectl get pod` 命令来获取所有 Pod 的信息：

```shell
kubectl get pod
```

你会得到一个表格，这是 你自己在 K8S 中部署的所有的Pod。

其中，name 是Pod的名称；READY 为容器状态，格式为可用容器/所有容器数量；STATUS 为 Pod 的运行状态；RESTARTS 为重启数量；AGE 为 Pod 运行时间；当状态都是 `Running` 时，代表 Pod 运行正常。

![](../youdaonote-images/Pasted%20image%2020230419231657.png)

### 令人费解的无状态

部署成功了，但怎么去访问具体应用呢？

前面我们写到， `deployment` 是无状态的。也就意味着， `deployment` 并不会对 `pod` 进行网络通信和分发。想访问服务，有以下两个办法：

1.  直接访问具体的 `Pod`：这是一个办法，但是 `Pod` 太多了，达不到我们自动调度的效果。且 `Pod` 的 `IP` 在运行时还会经常进行漂移且不固定（后面会讲到）。
2.  使用 `Service`  组织统一的 `Pod` 访问入口。

这里我们选择另一种资源类型 —— `Service` 来进行统一组织 `Pod`  服务访问

## 访问第一个应用

### 什么是 Service

`deployment` 是停机坪，那么 `Service` 则是一块停机坪的统一通信入口。它**负责自动调度和组织deployment中 Pod 的服务访问。由于自动映射 Pod 的IP，同时也解决了 Pod 的IP漂移问题。**

下面这张图就印证了 `Service` 的作用。流量会首先进入 VM（主机），随后进入 Service 中，接着 Service 再去将流量调度给匹配的 Pod 。

![](../youdaonote-images/Pasted%20image%2020230419231916.png)

### Service 的配置

同样的，创建一个 `Service` 也需要一份 `YAML` 配置清单。一份简单的 `Service` 的配置如下：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: front-service-v1
spec:
  selector:
    app: nginx-v1
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: NodePort
```

其中比较熟悉的通用字段就不介绍了。有几个特有的字段需要关注下：

![](../youdaonote-images/Pasted%20image%2020230419232025.png)

在这里，Service的模式我们选择使用 `NodePort` 模式。其他模式可以参考：[www.dockerone.com/article/488…](https://link.juejin.cn/?target=http%3A%2F%2Fwww.dockerone.com%2Farticle%2F4884 "http://www.dockerone.com/article/4884")

### 与 Deployment 配置文件合并

根据YAML语法，我们可以将Service和deployment合并为同一个配置文件。当然，新建一个文件也是可以的。 我们编辑原有的v1.yaml，在文件底部添加 `---` 继续拼接Service的配置：

```shell
vim ./v1.yaml
```

![](../youdaonote-images/Pasted%20image%2020230419232044.png)

编辑保存退出后，使用 `kubectl apply` 命令来更新配置：

```shell
kubectl apply -f ./v1.yaml
```

此时，Service 已经部署完毕。

### 查看 Service 的访问端口

在部署成功 `Service` 后，我们可以使用 `kubectl get svc` 来获取我们已经部署的 `Service` 列表

我们可以使用 `kubectl get svc` 去查看下具体打开的服务端口：

```shell
kubectl get svc
```

执行后，会展示下图。

![](../youdaonote-images/Pasted%20image%2020230419232634.png)

其中， `PORT` 字段代表 `Service` 的访问端口。`:` 前为映射到Pod的端口，31048 为访问端口。 我们访问 `Master节点IP + 端口`，就可以访问到该服务。

## ingress 是什么

在前面，我们部署了 `deployment` 和 `Service`，实现了对服务的访问。但是在实际使用中，我们还会根据请求路径前缀的匹配，权重，甚至根据 `cookie/header` 的值去访问不同的服务。为了达到这种**负载均衡**的效果，我们可以使用 `k8s` 的另一个组件 —— `ingress`

在日常开发中，我们经常会遇到**路径分流**问题。例如当我们访问 `/a` 时，需要返回A服务的页面。访问 `/b`，需要返回服务B的页面。这时候，我们就可以使用 `k8s` 中的 `ingress` 去实现。

![](../youdaonote-images/Pasted%20image%2020230419232740.png)

在这里，我们选择 `ingress-nginx`。 `ingress-nginx` 是基于 `nginx` 的一个 `ingress` 实现。当然也可以实现正则匹配路径，流量转发，基于 `cookie header` 切分流量（灰度发布）。

## 部署 ingress

首先进入 `master` 节点，下载 `ingress`  配置文件：

```shell
wget https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.4/deploy/static/provider/baremetal/deploy.yaml
```

接着编辑下部署文件，将 `ingress` 的 `nodePort` 端口改为 `31234` ，以方便后面访问：

```shell
vim ./deploy.yaml
```

在下图所示位置添加 `nodePort` 字段为 `31234`  ，https为 `31235` 。

![](../youdaonote-images/Pasted%20image%2020230419233022.png)

接着执行命令使 `ingress` 生效：

```shell
kubectl apply -f deploy.yaml
```

接下来会自动拉取 `ingress` 镜像，自动部署 `ingress` 。可以使用 `kubectl` 命令查看部署状态：

```shell
kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --watch
```

如果显示以下信息，则代表部署成功。

![](../youdaonote-images/Pasted%20image%2020230419233032.png)

## 配置 ingress

### 初识配置文件

同样的， `ingress` 服务的配置也是使用 `yaml` 文件进行管理。

我们新建一个 `ingress` 文件夹，将 `ingress` 的配置放在里面：

```shell
mkdir ingress && cd ingress && vim base.yaml
```

拷贝以下内容进去：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-demo
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - http:
      paths: 
       - path: /wss
         pathType: Prefix
         backend:
           service:
             name: front-service-v1
             port:
               number: 80
```

这是一份简单的 `ingress` 配置文件。配置主要分三部分：

#### annotations

`annotations` 是 `ingress` 的主要配置项目，可以用来修改这些配置来修改 `ingress` 的行为。我们可以通过修改这些配置来实现灰度发布，跨域资源，甚至将 `www.abc.com` 重定向到 `abc.com` 。

具体详细配置解释，可以翻阅官网文档：[kubernetes.github.io/ingress-ngi…](https://link.juejin.cn/?target=https%3A%2F%2Fkubernetes.github.io%2Fingress-nginx%2Fuser-guide%2Fnginx-configuration%2Fannotations%2F "https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/")

```yaml
annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
```

#### rules

`rules` 是 `ingress` 配置路径转发规则的地方。 `path` 可以是一个路径字符串，**也可以是一个正则表达式**。 `backend` 则是 `k8s` 的 `service` 服务， `serviceName` 是服务名称， `servicePort` 是服务端口。

当我们去访问 `/wss` 时， `ingress` 就会帮我们调度到 `front-service-v1` 这个 `service` 上面。

```yaml
rules:
  - http:
      paths: 
       - path: /wss
         pathType: Prefix
         backend:
           service:
             name: front-service-v1
             port:
               number: 80
```

---

然后执行命令，使配置项目生效：

```shell
kubectl apply -f ./base.yaml
```

访问 [http://IP:31234](https://link.juejin.cn/?target=http%3A%2F%2F172.16.81.170%3A31234%2F "http://172.16.81.170:31234/")，如果能看到服务页面则代表代表成功：

## 7. Kubernetes 灰度发布与滚动发布：零宕机发布的奥秘.md

## 什么是灰度发布

首先我们来看**灰度发布**。灰度发布是一种发布方式，也叫 `金丝雀发布` 。**起源是矿工在下井之前会先放一只金丝雀到井里，如果金丝雀不叫了，就代表瓦斯浓度高。原因是金丝雀对瓦斯气体很敏感。**这就是金丝雀发布的又来，非常形象地描述了我们的发布行为。

灰度发布的做法是：会在现存旧应用的基础上，启动一个新版应用。但是新版应用并不会直接让用户访问。而是先让测试同学去进行测试。如果没有问题，则可以将真正的用户流量慢慢导入到新版上。在这中间，持续对新版本运行状态做观察，直到慢慢切换过去，**这就是所谓的A/B测试。** 当然，你也可以招募一些 **灰度用户，** 给他们设置独有的灰度标示（Cookie，Header），来让他们可以访问到新版应用。

当然，如果中间切换出现问题，也应该将流量迅速地切换到老应用上。

![](../youdaonote-images/Pasted%20image%2020230419233851.png)

## 实现方案

在上一章节，我们使用 `k8s` 部署了 `ingress` 。这里我们就利用 `ingress annotations` 中的 `canary` 配置项来实现灰度发布逻辑。

### 1. 准备新版本的 Service

在开始准备灰度之前，需要准备一套新环境以备流量切分。切换到 `deployment` 目录，我们新启动一套 `v2` 的环境配置，在这里可以将原先 `v1` 的配置文件，拷贝一份替换为 `v2` 的镜像：

```shell
cd deployment && cp v1.yaml v2.yaml
```

修改 `v2.yaml`，将 `Deployment Name`， `Service Name` 和匹配规则都替换为 `v2` ，并将镜像版本替换为 `v2`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: front-v2
spec:
  selector:
    matchLabels:
      app: nginx-v2
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx-v2
    spec:
      containers:
      - name: nginx
        image: registry.cn-hangzhou.aliyuncs.com/janlay/k8s_test:v2
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: front-service-v2
spec:
  selector:
    app: nginx-v2
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: NodePort
```

接着使用 `kubectl apply` 命令使其配置生效：

```shell
kubectl apply -f ./v2.yaml
```

### 2. 根据不同方案进行切分

#### 根据 Cookie 切分流量

基于 `Cookie` 切分流量。这种实现原理主要根据**用户请求中的 Cookie 是否存在灰度标示 Cookie**去判断是否为灰度用户，再决定是否返回灰度版本服务。

我们新建一个全新的 ingress 配置文件，名称叫 `gary` ：

```shell
cd ./ingress && vim ./gray.yaml
```

输入以下配置：

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nginx-demo-canary
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "users_from_Beijing"
spec:
  rules:
  - http:
      paths: 
       - backend:
          serviceName: front-service-v2
          servicePort: 80
  backend:
     serviceName: front-service-v2
     servicePort: 80
```

我们可以看到，在 `annotations` 这里，有两个关于灰度的配置项。分别是：

-   nginx.ingress.kubernetes.io/canary：可选值为 `true / false` 。代表是否开启灰度功能
-   nginx.ingress.kubernetes.io/canary-by-cookie：灰度发布 `cookie` 的 `key`。当 `key` 值等于 `always` 时，灰度触发生效。等于其他值时，则不会走灰度环境。

保存后，使用 `kubectl apply` 生效配置文件查看效果：

```shell
kubectl apply -f ./gray.yaml
```

执行成功后，可以使用 `kubectl get svc` 命令来获取 `ingress` 的外部端口：

```shell
kubectl -n ingress-nginx get svc
```

> -n: 根据资源名称进行模糊查询

其中，`PORT` 字段是我们可以访问的外部端口。80为 `ingress` 内部端口，31234 为外部端口。 ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab31c3f403854ccdac118e9c3068a15a~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

我们访问 [http://IP:31234/](https://link.juejin.cn/?target=http%3A%2F%2F172.16.81.170%3A31234%2F "http://172.16.81.170:31234/") 可以正常访问到页面：

![](../youdaonote-images/Pasted%20image%2020230419234634.png)

接下来，我们在chrome控制台中手动设置一个 cookie。key为 `users_from_Beijing` ，值为 `always`

![](../youdaonote-images/Pasted%20image%2020230419234753.png)

刷新页面，发现我们访问的是v2。灰度发布环境搭建成功。

#### 基于 Header 切分流量

基于 `Header` 切分流量，这种实现原理主要根据**用户请求中的 header 是否存在灰度标示 header**去判断是否为灰度用户，再决定是否返回灰度版本服务。

当然配置也很简单，只需要修改 `annotations` 配置项即可：

-   nginx.ingress.kubernetes.io/canary-by-header：要灰度 `header` 的 `key` 值
-   nginx.ingress.kubernetes.io/canary-by-header-value: 要灰度 `header` 的 `value` 值

保存后，使用 `kubectl apply` 生效配置文件：

```shell
kubectl apply -f ./gray.yaml
```

如何查看效果呢？我们可以使用 `curl` 命令来加header头去请求访问调用：

```yaml
curl --header 'header的key:header的value' 127.0.0.1:端口值
```

由于我这里配置的灰度 `header` 为 `janlay` ， `value` 为 `isme` ，所以如以下结果：

通过对比发现，当 `janlay` 不是 `isme` 时，灰度失效。验证成功

![](../youdaonote-images/Pasted%20image%2020230419235843.png)

#### 基于权重切分流量

这种实现原理主要是根据用户请求，通过根据灰度百分比决定是否转发到灰度服务环境中

在这里，我们修改 `annotations` 配置项即可：

-   nginx.ingress.kubernetes.io/canary-weight：值是字符串，为 `0-100` 的数字，代表灰度环境命中概率。如果值为 0，则表示不会走灰度。值越大命中概率越大。当值 = `100` 时，代表全走灰度。

保存后，使用 `kubectl apply` 生效配置文件：

```shell
kubectl apply -f ./gray.yaml
```

我们用shell脚本语言写个轮询，循环10次调用服务，看灰度命中概率：

```shell
for ((i=1; i<=10; i++)); do curl 127.0.0.1:端口值;echo; done
```


通过轮询10次发现，其命中概率大概在 `4-6` 次左右。这个命中概率只是相对于单词请求而言，拥有50%的概率。所以批量执行存在误差是正常的。

### 注意事项：优先级

上面的三种灰度方案都了解完后，如果同时配置三种方案，那么他们在 `ingress` 中的优先级是怎样的？ 在官方文档的后面有一个 `Note` 提示，上面明确有写：

> Canary rules are evaluated in order of precedence. Precedence is as follows:  **canary-by-header -> canary-by-cookie -> canary-weight**

`k8s` 会优先去匹配 `header` ，如果未匹配则去匹配 `cookie` ，最后是 `weight`

## 参考链接

-   kubernetes ingress 官方文档：[kubernetes.github.io/ingress-ngi…](https://link.juejin.cn/?target=https%3A%2F%2Fkubernetes.github.io%2Fingress-nginx%2Fuser-guide%2Fnginx-configuration%2Fannotations%2F%23canary "https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#canary")

## 什么是滚动发布

滚动发布，则是我们一般所说的无宕机发布。其发布方式如同名称一样，一次取出一台/多台服务器（看策略配置）进行新版本更新。当取出的服务器新版确保无问题后，接着采用同等方式更新后面的服务器。

## 发布流程和策略

### 就绪状态

第一步，我们准备一组服务器。这组服务器当前服务的版本是 V1。

接下来，我们将会使用滚动策略，将其发布到 V2 版本。

![](../youdaonote-images/Pasted%20image%2020230420100039.png)

### 升级第一个 Pod

第二步开始升级。

首先，会增加一个 V2 版本的 Pod1 上来，**将 V1 版本的 Pod1 下线但不移除。此时，V1版本的 Pod1 将不会接受流量进来，而是进入一个平滑期等待状态（大约几十秒）后才会被杀掉。**

第一个 Pod 升级完毕

![](../youdaonote-images/Pasted%20image%2020230420100109.png)

![](../youdaonote-images/Pasted%20image%2020230420100113.png)

### 升级剩下的 Pod

与上同理，同样是**新增新版本Pod后，将旧版本Pod下线进入平滑期但不删除。等平滑期度过后再删除Pod：**

![](../youdaonote-images/Pasted%20image%2020230420100135.png)

![](../youdaonote-images/Pasted%20image%2020230420100141.png)

## 优缺点

滚动发布作为众多发布类型的一种，必然也存在着一些优点和缺点：

### 优点

1.  不需要停机更新，无感知平滑更新。
2.  版本更新成本小。不需要新旧版本共存

### 缺点

1.  更新时间长：每次只更新一个/多个镜像，需要频繁连续等待服务启动缓冲（详见下方平滑期介绍）
2.  旧版本环境无法得到备份：始终只有一个环境存在
3.  回滚版本异常痛苦：如果滚动发布到一半出了问题，回滚时需要使用同样的滚动策略回滚旧版本。

## Kubernetes 中的滚动发布

在 `Kubernetes` 的 `ReplicaSet` 中，默认就是滚动发布镜像。我们只需要通过简单的配置即可调整滚动发布策略

编辑 `deployment` 文件：

```shell
vim ./v2.yaml
```

在图示的位置添加以下字段：

![](../youdaonote-images/Pasted%20image%2020230423222745.png)

![](../youdaonote-images/Pasted%20image%2020230423222752.png)

编辑结束后，保存文件。

接着使`Kubernetes`生效配置。配置生效后立即继续发布动作，随后监听查看发布状态更改：

```shell
kubectl apply -f ./v2.yaml && kubectl rollout status deployment/front-v2
```

![](../youdaonote-images/Pasted%20image%2020230423223011.png)

我们通过日志可以看到，3个 `replicas` 的更新逻辑逻辑为：**单个逐个地去进行更新 Pod。而不是一次性将旧的Pod 全部杀死后，再启动新的 Pod。**

## 另一种发布模式

既然 `k8s` 的默认发布方式就是滚动发布，那么有没有其他的更新方式？

在 `Kubernetes` 中，有一种发布方式为 `Recreate` 。这种发布方式比较暴力，它会直接把所有旧的 `Pod` 全部杀死。杀死后再批量创建新的 `Pod` 。

我们只需要将 `strategy.type`  改为 `Recreate` 即可：

```shell
vim ./v2.yaml
# type: Recreate
```

接着更新 `deployment` 并查看发布状态：

```shell
kubectl apply -f ./v2.yaml && kubectl rollout status deployment/front-v2
```

![](../youdaonote-images/Pasted%20image%2020230423223304.png)

我们看到， `k8s` 会将所有旧的 `Pod` 杀死，随后再批量启动新的 `Pod` 。

这种发布方式相对滚动发布偏暴力。**且在发布空窗期（杀死旧Pod，新Pod还没创建成功的情况下）服务会不可用。**

## kubectl rollout

`kubectl rollout` 命令可以用来操纵 `deployment` 的资源进行管理。包括对版本的快速回退，暂停/恢复版本更新，根据更新历史回退版本等功能。

例如暂停一个 `deployment` 的发布：

```shell
kubectl rollout pause deployment/名称
```

继续一个 `deployment` 的发布：

```shell
kubectl rollout resume deployment/名称
```

查看一个 `deployment` 的发布状态：

```shell
kubectl rollout status deployment/名称
```

## 8. 服务可用性探针：如何判断你的服务是否可用.md

`kubernetes`  到底是以什么依据，判断我们 `Pod` 启动成功的？

## 什么是健康度检查？

我们在之前的部署知道，当 `Pod` 的状态为 `Running` 时，该 `Pod` 就可以被分配流量（可以访问到）了。**但是，这种检查方式对于一部分Pod来说是不靠谱的。**

有写过后端的同学可能了解，一般一个后端容器启动成功，不一定不代表服务启动成功。在后端容器启动后，部分 MySQL，消息队列，配置文件等其他服务的连接还在初始化，但是容器的外部状态却是启动成功。在这种情况下，直接去访问 Pod 必然会有问题。

那么有没有什么办法可以自己控制流量分配的标准呢？这就要提到我们下面要写到的概念 —— 服务探针

## 什么是服务探针？

探针一词，和古代银针试毒的概念差不多 —— 将银针放入水中，如果银针变黑，则代表有毒；如果没有变黑，则代表正常。

那么在 `kubernetes` 中，探针用来检测 `Pod` 可用情况的。在 `kubernetes` 中，有三种探针可以使用：

### 1. 存活探针 LivenessProbe

第一种是存活探针。存活探针是对运行中的容器检测的。如果想检测你的服务在运行中有没有发生崩溃，服务有没有中途退出或无响应，可以使用这个探针。

如果探针探测到错误， `Kubernetes` 就会杀掉这个 `Pod`；否则就不会进行处理。如果默认没有配置这个探针， `Pod` 不会被杀死。

### 2. 可用探针 ReadinessProbe

第二种是可用探针。作用是用来检测 Pod 是否允许被访问到（是否准备好接受流量）。如果你的服务加载很多数据，或者有其他需求要求在特定情况下不被分配到流量，那么可以用这个探针。

如果探针检测失败，流量就不会分配给该 Pod。在没有配置该探针的情况下，会一直将流量分配给 Pod。**当然，探针检测失败，Pod 不会被杀死。**

### 3. 启动探针 StartupProbe

第三种是启动探针。作用是用来检测 Pod 是否已经启动成功。如果你的服务启动需要一些加载时长（例如初始化日志，等待其他调用的服务启动成功）才代表服务启动成功，则可以用这个探针。

如果探针检测失败，该 Pod 就会被杀死重启。在没有配置该探针的情况下，默认不会杀死 `Pod` 。在启动探针运行时，其他所有的探针检测都会失效。

### 总结

`Kubernetes` 里面内置了三种健康度探针，可以分别在启动时和运行时为我们的 Pod 做检测。下面是一个对比表格：

![](../youdaonote-images/Pasted%20image%2020230423224838.png)

当然，配置的方式也很简单。我们只需要在 `containers.livenessProbe/readinessProbe/StartupProbe` 下配置即可

## 三种方式探测方式

上面我们了解了探针的几种类型。这里就了解下探针的几种探测方式。虽然探针类型的不同，触发的阶段，但是其探测方式都是一样的，检测的 API 也是一样的。有以下三种检测方式：

### **1. ExecAction**

这种方式是通过在 Pod 的容器内执行预定的 Shell 脚本命令。如果执行的命令没有报错退出（返回值为0），代表容器状态健康。否则就是有问题的。

我们以下面为例：这是一个创建 Pod 的配置文件模版。可以看到，里面配置了一个存活探针 LivenessProbe + ExecAction 命令检测。其中，`livenessProbe.exec`  代表去执行一段命令， `command` 则是要执行的探针命令。 `livenessProbe` 代表声明一个存活探针。

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-exec
spec:
  containers:
  - name: liveness
    image: registry.aliyuncs.com/google_containers/busybox
    args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
```

当我们的 Pod 启动成功时，会自动执行下面的这个命令：新建一个 `/tmp/healthy` 文件 => 睡眠 30 秒 => 删除 `/tmp/healthy` 文件 => 睡眠 600 秒。

```shell
touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
```

而我们的探针检测，在第一次探测等待5秒后，会去尝试访问 `/tmp/healthy` 文件来判断检测结果。然而，只有在 `Pod` 运行的前30秒，这个文件才存在。在第30秒后，文件被删除，探针就访问不到这个文件了，于是只好按照失败规则重启 `Pod` 。

我们创建一下这个 `Pod` ，然后来看下效果：

```shell
vim ./liveness-exec.yaml
kubectl apply -f ./liveness-exec.yaml && date && kubectl get pods | grep liveness-exec
```

![](../youdaonote-images/Pasted%20image%2020230424000446.png)

等待30秒后，我们通过 `kubectl describe` 命令看下 Pod 的运行全览状态：

```shell
kubectl describe pods liveness-exec
```

![](../youdaonote-images/Pasted%20image%2020230424000454.png)

可以看到，在运行一段时间后，探针被检测失败，Pod 被迫重启，接着创建了新的 Pod。

### **2. TCPSocketAction**

这种方式是使用 TCP 套接字检测。 Kubernetes 会尝试在 Pod 内与指定的端口进行连接。如果能建立连接（Pod的端口打开了），这个容器就代表是健康的，如果不能，则代表这个 Pod 就是有问题的。

下面这个 Pod 配置文件就是个例子：这里定义了一个可用探针 + 存活探针，检测方式为TCP检测。探针会在容器启动成功5秒后开始检测，每10秒检测一次，每次会尝试访问 Pod 的8080端口。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tcp-socket-action
  labels:
    app: tcp-socket-action
spec:
  containers:
  - name: tcp-socket-action
    image: registry.cn-hangzhou.aliyuncs.com/janlay/goproxy:0.1
    ports:
    - containerPort: 8080
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
```

**

### **3. HTTPGetAction**

这种方式是使用 HTTP GET 请求。Kubernetes 会尝试访问 Pod 内指定的API路径。如果返回200，代表容器就是健康的。如果不能，代表这个 Pod 是有问题的。

这里我们配置了一个存活探针。探针将会在容器启动成功后3秒钟开始进行检测，每隔3秒检测一次。每次都会携带 `httpHeaders` 内填写的请求头，并尝试访问 `8080` 端口下的 `/healthz` 地址。

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-http
spec:
  containers:
  - name: liveness
    image: registry.cn-hangzhou.aliyuncs.com/janlay/liveness
    args:
    - /server
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3
      periodSeconds: 3
```

而容器内 `/healthz` 地址的编写规则是：容器启动 `10` 秒钟内会返回 `200` 请求码。之后统一返回 `500` 状态码

```go
http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
    duration := time.Now().Sub(started)
    if duration.Seconds() > 10 {
        w.WriteHeader(500)
        w.Write([]byte(fmt.Sprintf("error: %v", duration.Seconds())))
    } else {
        w.WriteHeader(200)
        w.Write([]byte("ok"))
    }
})
```

接着我们保存配置文件，等10-20秒钟后并看下结果

```shell
vim ./liveness-http.yaml
kubectl apply -f ./liveness-http.yaml
kubectl describe pods liveness-http # 等10-20秒后在执行
```

可以看到，Pod 启动一段时间后，探针检测到返回值500后，标记检测失败，并回收了 Pod 重新创建。

![](../youdaonote-images/Pasted%20image%2020230424000509.png)

## 控制探针检测的行为

上面的部分都是如何对Pod进行检测，那我们有没有什么参数可以修改检测行为呢？ `Kubenetes` 给我们准备了一些额外的参数帮助我们来定义检测行为：

-   initialDelaySeconds：容器初始化等待多少秒后才会触发探针。默认为0秒。
-   periodSeconds：执行探测的时间间隔。默认10秒，最少1秒。
-   timeoutSeconds：探测超时时间。默认1秒，最少1秒。
-   successThreshold：探测失败后的最小连续成功数量。默认是1。
-   failureThreshold：探测失败后的重试次数。默认是3次，最小是1次。

## 9. Kubernetes Secret：储存你的机密信息.md

## 什么是 Secret

Secret 是 Kubernetes 内的一种资源类型，可以用它来存放一些机密信息（密码，token，密钥等）。信息被存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内。当然也可以存放docker私有镜像库的登录名和密码，用于拉取私有镜像。

![](../youdaonote-images/Pasted%20image%2020230424001152.png)

## Secret 的几种类型

在 k8s中，secret 也有多种类型可以配置

### Opaque 类型

第一种是 `opaque` 类型，这种类型比较常用，一般拿来存放密码，密钥等信息，存储格式为 `base64` 。但是请注意：base64并不是加密格式，依然可以通过decode来解开它。

例如我们创建一组用户名和密码，用户名为 `janlay` 和 `367734wer` 。则可以通过命令 `kubectl create secret generic` 创建：

```shell
kubectl create secret generic default-auth --from-literal=username=janlay \
--from-literal=password=367734qwer
```

在这里， `default-auth` 为 自定义的名称，`--from-literal` 的后面则跟随一组 `key=value`。当然你也可以按照此格式继续向后拼接你要存储的信息。

存储成功后，我们可以通过 `kubectl get secret` 命令来查看你存储过的 `Secret`。在这里可以看到，刚刚创建的密钥组合 `default-auth` 已经展示了出来。

在这里， `NAME` 代表 `Secret` 的名称；`TYPE` 代表 Secret 的类型； `DATA` 是 `Secret` 内存储内容的数量； `AGE` 是创建到现在的时间

![](../youdaonote-images/Pasted%20image%2020230424230349.png)

我们可以通过 `kubectl edit secret` 命令来编辑 `default-auth` 的内容，来看看里面到底存了什么内容：

```shell
kubectl edit secret default-auth
```

> 这里也可以用 kubectl get secret [secret名称] -o yaml 命令，将内容打印到终端上查看。其中 -o yaml 代表输出为 yaml 格式内容，当然也可以输出 json 等格式内容

![](../youdaonote-images/Pasted%20image%2020230424230822.png)

可以看到，data 字段存放了我们存储的信息 `base64` 后的结果。但是这种方式是不安全的，我们可以通过解码base64 来获取真实值：

```shell
echo MzY3NzM0cXdlcg== | base64 -d
```

> 这里可以使用 Linux 自带的 base64 命令进行解码。其中 -d 代表 --decode，解码的意思

那么除了通过命令创建，可不可以通过配置文件创建呢？答案是可以的。我们新建一个文件，名称叫 `admin-auth.yaml` ，输入以下配置：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: admin-auth
stringData:
  username: wss
  password: wss@1234
type: Opaque
```

在这里， `name` 代表 `Secret` 的名称，名称为 `admin-auth`； `type` 代表它的类型，类型为 `Opaque` ； `stringData` 代表存储的内容，格式为 `key:value`。

我们保存后退出，使用 `kubectl apply -f` 命令生效这份配置。接着使用 `kubectl get secret admin-auth -o yaml` 查看下内容：

```shell
kubectl apply -f admin-auth.yaml
kubectl get secret admin-auth -o yaml
```

![](../youdaonote-images/Pasted%20image%2020230426155740.png)

### 私有镜像库认证

第二种是私有镜像库认证类型，这种类型也比较常用，一般在拉取私有库的镜像时使用。

在这里我们依然可以通过命令行进行创建。只不过类型变成了 `docker-registry` ：

```shell
kubectl create secret docker-registry private-registry \
--docker-username=[用户名] \
--docker-password=[密码] \
--docker-email=[邮箱] \
--docker-server=[私有镜像库地址]
```

创建成功后，我们可以使用 `kubectl get secret` 命令查看下我们配置的私有库密钥组：

```shell
kubectl get secret private-registry -o yaml
```

![](../youdaonote-images/Pasted%20image%2020230426161135.png)

可以看到，k8s 自动帮我们填写了一个key，为 `.dockerconfigjson` ；value则是一串 base64 值。我们依然可以使用 `base64 -d` 命令查看下里面到底是啥：

```shell
echo [value] | base64 -d
```

![](../youdaonote-images/Pasted%20image%2020230426161150.png)

通过解码后可以看到， `k8s` 会自动帮我们创建一串 `dockerconfig`  的 `json` 串。在 `k8s` 拉取镜像时，则可以使用这个 `json` 串来用于身份认证。

当然，私有镜像库密钥组也可以通过配置文件创建。编辑文件名为 `private-registry-file.yaml` 文件，并输入以下内容：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: private-registry-file
data:
  .dockerconfigjson: eyJhdXRocyI6eyJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOnsidXNlcm5hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiMzY3NzM0IiwiZW1haWwiOiJqYW5sYXk4ODQxODEzMTdAZ21haWwuY29tIiwiYXV0aCI6IllXUnRhVzQ2TXpZM056TTAifX19
type: kubernetes.io/dockerconfigjson
```

大家可能发现在这里创建镜像库认证时，声明的配置文件更像是一份 `dockerconfig` ，而不只是单纯的镜像库身份认证。

在这里， `data`内的字段必须为 `.dockerconfigjson`，值则是一串 `dockerconfigjson` 的 `base64` 值；`type` 则为 `kubernetes.io/dockerconfigjson` ，意思是声明一份 `dockerconfig` 的配置

保存后退出，使用 `kubectl apply -f` 命令让该配置生效。并使用 `kubectl get secret` 命令查看下我们配置的详情：

```shell
kubectl apply -f ./private-registry-file.yaml
kubectl get secret private-registry-file -o yaml
```

## 使用方法

上面我们写了如何声明一个 Secret。在声明后，我们需要在实际的配置中使用，才有实际意义。在 K8S 中，一共有三种可以使用 Secret 的方式。

### Volume 挂载

第一种是通过存储卷的方式挂载进去。我们可以编辑下 `front-v1` 的 `deployment` 配置文件去配置下。

**第一步：在Pod层面设置一个外部存储卷，存储卷类型为 `secret` 。在 `template.spec` 下填写。这里代表声明了一个外置存储卷，存储卷名称为 `admincert` ，类型为 `secret`；`Secret` 的名称为 `admin-auth` ：**

```yaml
volumes:
- name: admincert
  secret:
    secretName: admin-auth
```

![](../youdaonote-images/Pasted%20image%2020230426161819.png)

**第二步：在容器配置配置存储卷。在`containers.name[]`下填写字段 `volumeMounts` 。这里的 `name` 值和上面的卷名是对应的。 `mountPath` 是要挂载到容器内哪个目录，这里代表挂载到用户目录下；`readonly` 则代表文件是不是只读：**

```yaml
volumeMounts:
- name: admincert
  mountPath: /root
  readOnly: true
```
**第二步：在容器配置配置存储卷。在`containers.name[]`下填写字段 `volumeMounts` 。这里的 `name` 值和上面的卷名是对应的。 `mountPath` 是要挂载到容器内哪个目录，这里代表挂载到用户目录下；`readonly` 则代表文件是不是只读：**

```yaml
volumeMounts:
- name: admincert
  mountPath: /root
  readOnly: true
```

![](../youdaonote-images/Pasted%20image%2020230426162454.png)

编辑完后，保存并退出。使用 `kubectl apply -f` 命令生效下配置文件。

```shell
kubectl apply -f ./v1.yaml
```

此时， `Pod` 会被杀死重新创建。我们可以通过 `kubectl get pods` 来查看现在运行的 `Pod`

![](../youdaonote-images/Pasted%20image%2020230426163616.png)

在运行正常的情况下，我们可以使用 `kubectl exec` 命令在 `Pod` 容器内执行我们要执行的命令。在这里，我们查看下 `Pod` 镜像内的 `/root` 文件夹里面都有啥文件：

> kubectl exec 命令格式：kubectl exec [POD] -- [COMMAND]

```shell
kubectl exec -it [POD_NAME] -- ls /root
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/46178fafbb86496dbfc3751882e1e7df~tplv-k3u1fbpfcp-zoom-in-crop-mark:3326:0:0:0.awebp) 可以看到，分别有2个文件，都是我们在 `secret` 内配置的 `key` 。接着使用 `kubectl exec` 命令，查看下文件内容：

```shell
kubectl exec -it [POD_NAME] -- cat /root/password
kubectl exec -it [POD_NAME] -- cat /root/username
```

![](../youdaonote-images/Pasted%20image%2020230426163704.png)

### 环境变量注入

第二种是将 `Secret` 注入进容器的环境变量。同样需要配置下 `deployment` 文件。找到 `containers` ，下面新加一个 `env` 字段：

其中， `env[].name` 为环境变量的 `key` ， `valueFrom` 为值； `secretKeyRef` 则代表是一个 `Secret` 类型的 `value`。

`secretKeyRef.name`  则是要引用的 `secret` 的名称，`key` 则是 `secret` 中配置的 `key` 值。

```yaml
env:
	- name: USERNAME
  	valueFrom:
  		secretKeyRef:
    		name: admin-auth
      	key: username
	- name: PASSWORD
    valueFrom:
    	secretKeyRef:
      	name: admin-auth
        key: password
```

![](../youdaonote-images/Pasted%20image%2020230426165542.png)

编辑完后，保存并退出。使用 `kubectl apply -f` 命令生效下配置文件。

```shell
kubectl apply -f ./v1.yaml
```

生效后，在最新的 Pod 内使用 `kubectl exec` 命令来看看环境变量注入结果：

```shell
kubectl exec -it [POD_NAME] -- env
```

![](../youdaonote-images/Pasted%20image%2020230426165611.png)

### Docker 私有库认证

第三种是 Docker 私有库类型，这种方法只能用来配置 私有镜像库认证。

首先，我们先尝试不加认证去拉取一个私有库镜像。编辑下 `front-v1` 的 `deployment`，把镜像换成私有库的镜像。保存后使用 `kubectl apply` 生效配置：

```yaml
image: [镜像库地址]/jenkins-test:latest
```

接着使用 `kubectl get pods` 查看下目前pod的状态：

![](../youdaonote-images/Pasted%20image%2020230426185301.png)

可以看到， `front-v1`  的 `Pod` 并无法拉取下来镜像。我们使用 `kubectl describe` 命令查看下该 Pod 的具体状态：

```shell
kubectl describe pods [POD_NAME]
```

找到 `Events` 那一块，可以其中一条 `message` 写着：**unauthorized: access to the requested resource is not authorized（要请求的资源没有认证）。此时不登录，无法拉取私有镜像。**

那怎么办呢？这里我们需要配置下 `deployment` 文件。

找到 `spec` ，下面新加一个 `imagePullSecrets` 字段。该字段代表了在拉取Pod所需要的镜像时，需要的认证信息。其中，`name` 字段为上面我们配置过的私有镜像库认证名。

```yaml
imagePullSecrets:
 - name: private-registry-file
```

![](../youdaonote-images/Pasted%20image%2020230426185630.png)

编辑后保存，使用 `kubectl apply -f` 命令生效配置文件。接着看下 Pod 的运行状态。

## Github action.md

# Github action
## 一、GitHubAction简介

### 1. 什么是GitHubAction

GitHubActions是一个持续集成和持续交付的平台，它可以帮助你通过自动化的构建（包括编译、发布、自动化测试）来验证你的代码，从而尽快地发现集成错误。github于2019年11月后对该功能全面开放，现在所有的github用户可以直接使用该功能。GitHub 提供 Linux、Windows 和 macOS 虚拟机来运行您的工作流程，或者您可以在自己的数据中心或云基础架构中托管自己的自托管运行器。

### 2. Github Action基本概念

- workflow: 一个 workflow 就是一个完整的工作流过程，每个workflow 包含一组 jobs任务。
- job : jobs任务包含一个或多个job ，每个 job包含一系列的 steps 步骤。
- step : 每个 step 步骤可以执行指令或者使用一个 action 动作。
- action : 每个 action 动作就是一个通用的基本单元。

## 二、GitHubActiond的使用

## workflow

在项目库根路径下的.github/workflows目录中创建一个.yml 文件（或者 .yaml）:

```yaml
name: hello-github-actions
# 触发 workflow 的事件
on:
  push:
    # 分支随意
    branches:
      - master
# 一个workflow由执行的一项或多项job
jobs:
  # 一个job任务，任务名为build
  build:
    #运行在最新版ubuntu系统中
    runs-on: ubuntu-latest
    #步骤合集
    steps:
      #新建一个名为checkout_actions的步骤
      - name: checkout_actions
        #使用checkout@v2这个action获取源码
        uses: actions/checkout@v2 
      #使用建一个名为setup-node的步骤
      - name: setup-node
        #使用setup-node@v1这个action
        uses: actions/setup-node@v1
        #指定某个action 可能需要输入的参数
        with:
          node-version: '14'
      - name: npm install and build
        #执行执行某个shell命令或脚本
        run: |
          npm install
          npm run build
      - name: commit push
        #执行执行某个shell命令或脚本
        run: |
          git config --global user.email xxx@163.com
          git config --global user.name xxxx
          git add .
          git commit -m "update" -a
          git push
         # 环境变量
        env:
          email: xxx@163.com
```
