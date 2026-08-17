
# SOURCE MAP / 归档来源地图

> `WYCHMOD / ARCHIVE / SOURCE MAP`
> 索引维护：按本文件修改记录与 Git 历史，不使用设计图伪时间。

> **这是什么**：归档来源地图。记录每份原始学习底稿保留在哪里、迁移到了哪篇主线文档、为什么保留、如何只读查看。
> **这不是什么**：不是主线文档，不是推荐阅读入口。当前推荐阅读入口是 [9 大分类主线文档](../Index.md)。
> **最重要规则**：除本索引外，`docs/md/archive/` 下的归档原文件**保持原貌**——错别字、过时技术、早期截图、课程笔记、PDF、docx、txt 都是证据，**一律不修改、不重命名、不删除、不自动格式化**。所有改正写入主线新文档，重大订正登记到 [CORRECTIONS.md](../../_meta/CORRECTIONS.md)。

> ⚠️ **只读边界**：归档原文件是作者学习轨迹的原始痕迹。发现的错别字、过时信息、风格不统一、英文拼写错误、重复内容**全部保留**。要修订，请改主线文档，不要触碰归档原文。

---

## 一、快速入口

- [全站地图](../Index.md) - 9 大分类主线文档总览
- [重构规范](../../_meta/REFACTOR_GUIDELINES.md) - 合并 / 归档工作规范
- [重构方案](../../_meta/REFACTOR_PLAN.md) - 目录映射与执行步骤
- [订正台账](../../_meta/CORRECTIONS.md) - 历次改正记录
- [归档规模统计脚本](../../../scripts/count-archive.js) - 只读统计工具

---

## 二、归档来源映射

> 每个归档子目录都对应一个主线新文档或一次合并操作。
>
> **统计口径**：归档子目录 37 个（`docs/md/archive/` 下实际目录）；来源映射 40 条，覆盖全部 35 个 `old-*` 归档目录。`notes-个人写作/` 与 `youdaonote-images/` 为个人写作与共享图片资源，不对应单一主线文档，见「三、归档目录结构」。

### 2.1 第一阶段：结构化迁移

> 2026-07-14 ~ 2026-07-15 的结构化合并，每条映射的来源文件数与备注均来自原索引与 [订正台账](../../_meta/CORRECTIONS.md)。

| 主线新文档 | 归档目录 | 来源文件数 | 归档时间 | 备注 |
|---|---|---|---|---|
| [`md/08-过时技术/00-爬虫技术.md`](../08-过时技术/00-爬虫技术.md) | <a id="old-crawler-notes"></a>[`old-crawler-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-crawler-notes) | 2 | 2026-07-14 | 首篇重构示范 |
| [`md/08-过时技术/10-Electron桌面开发.md`](../08-过时技术/10-Electron桌面开发.md) | <a id="old-electron-notes"></a>[`old-electron-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-electron-notes) | 1 | 2026-07-14 | 1 篇实操笔记 + 7 张图 |
| [`md/08-过时技术/20-Hadoop-Spark大数据.md`](../08-过时技术/20-Hadoop-Spark大数据.md) | <a id="old-hadoop-spark-notes"></a>[`old-hadoop-spark-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-hadoop-spark-notes) | 16 | 2026-07-14 | 含 1 docx(跳过) + 10 note + 5 图 |
| [`md/08-过时技术/30-NLP与聊天机器人.md`](../08-过时技术/30-NLP与聊天机器人.md) | <a id="old-nlp-notes"></a>[`old-nlp-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-nlp-notes) | 1 docx + 1 md + 74 图 | 2026-07-14 | docx 11MB 用 pandoc 转 md + 74 图 |
| [`md/07-求职/00-面试方法论.md`](../07-求职/00-面试方法论.md) | <a id="old-interview-notes"></a>[`old-interview-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-interview-notes) | 6 文件（5 md + 1 pdf） | 2026-07-14 | 4 篇主线 + 5 原文件 + 1 pdf |
| [`md/04-前端/00-React基础与状态管理.md`](../04-前端/00-React基础与状态管理.md) | <a id="old-react-notes"></a>[`old-react-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-react-notes) | 7 文件（4 md + 3 PDF） | 2026-07-14 | React16 + Redux + js 函数式 |
| [`md/04-前端/10-Taro多端开发.md`](../04-前端/10-Taro多端开发.md) | <a id="old-taro-notes"></a>[`old-taro-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-taro-notes) | 6 md | 2026-07-14 | Taro 6 篇合并 |
| [`md/04-前端/20-Vue与小程序.md`](../04-前端/20-Vue与小程序.md) | <a id="old-vue-miniapp-notes"></a>[`old-vue-miniapp-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-vue-miniapp-notes) | 2 md | 2026-07-14 | Vue3 + 微信小程序 |
| [`md/06-软件工程/00-系统设计与设计模式.md`](../06-软件工程/00-系统设计与设计模式.md) | <a id="old-system-design-notes"></a>[`old-system-design-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-system-design-notes) | 11 文件（1 md + 10 PDF） | 2026-07-14 | 设计模式 242KB + 10 系统设计 PDF |
| [`md/06-软件工程/10-软件测试.md`](../06-软件工程/10-软件测试.md) | <a id="old-testing-notes"></a>[`old-testing-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-testing-notes) | 11 文件（8 md + 1 csv + 1 doc） | 2026-07-14 | 测试基础+jacoco+chrome 插件 |
| [`md/06-软件工程/20-软实力.md`](../06-软件工程/20-软实力.md) | <a id="old-soft-skills-notes"></a>[`old-soft-skills-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-soft-skills-notes) | 1 md | 2026-07-14 | 软实力精进 957B |
| [`md/05-AI与Agent/00-AI编程三件套方法论.md`](../05-AI与Agent/00-AI编程三件套方法论.md) | `old-agent-notes/agent开发知识/` | 3 md | 2026-07-15 | SDD + Harness + Loop |
| [`md/05-AI与Agent/10-Agent设计模式与多Agent.md`](../05-AI与Agent/10-Agent设计模式与多Agent.md) | `old-agent-notes/agent系统知识/` | 2 md | 2026-07-15 | 5 种设计模式 + 多 Agent 协作 |
| [`md/05-AI与Agent/20-协议与工程/MCP协议.md`](../05-AI与Agent/20-协议与工程/MCP协议.md) | `old-agent-notes/agent系统知识/` | 1 md + 2 pdf | 2026-07-15 | MCP 完整教程 |
| [`md/05-AI与Agent/20-协议与工程/A2A协议.md`](../05-AI与Agent/20-协议与工程/A2A协议.md) | `old-agent-notes/agent系统知识/` | 1 md | 2026-07-15 | A2A 学习笔记 |
| [`md/05-AI与Agent/20-协议与工程/DDD领域驱动.md`](../05-AI与Agent/20-协议与工程/DDD领域驱动.md) | `old-agent-notes/agent系统知识/` | 1 md | 2026-07-15 | DDD 架构 |
| [`md/05-AI与Agent/30-参考架构/manus架构设计.md`](../05-AI与Agent/30-参考架构/manus架构设计.md) | `old-agent-notes/agent系统知识/` | 1 md | 2026-07-15 | manus 架构 |
| [`md/05-AI与Agent/30-参考架构/Alembic数据库迁移.md`](../05-AI与Agent/30-参考架构/Alembic数据库迁移.md) | `old-agent-notes/agent系统知识/` | 1 md | 2026-07-15 | Alembic 迁移 |
| [`md/09-开发工具/00-Git版本控制.md`](../09-开发工具/00-Git版本控制.md) | <a id="old-git-notes"></a>[`old-git-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-git-notes) | 2 md + 1 xmind | 2026-07-15 | Git 命令 + Learn Git Branching |
| [`md/09-开发工具/10-工具箱与资源.md`](../09-开发工具/10-工具箱与资源.md) | <a id="old-tools-notes"></a>[`old-tools-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-tools-notes) + <a id="old-css-notes"></a>[`old-css-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-css-notes) | 2 md | 2026-07-15 | 工具集 README + CSS 便捷代码 |

### 2.2 第二阶段：主线深化归档

> 主线深化阶段归档的目录。来源文件数为 Markdown 文件数，由 `scripts/count-archive.js` 实时统计；归档时间为 Git 首提交日期（均为 2026-07-15）。本节为本次 UI 一致性梳理补录，使来源地图完整覆盖全部 `old-*` 归档目录——迁移目标已与对应主线文档核对一致。

| 主线新文档 | 归档目录 | 来源文件数 | 归档时间 | 备注 |
|---|---|---|---|---|
| [`md/01-计算机基础/00-Java与JVM.md`](../01-计算机基础/00-Java与JVM.md) | <a id="old-java-notes"></a>[`old-java-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-java-notes) | 48 md | 2026-07-15 | Java 基础笔记 |
| [`md/01-计算机基础/00-Java与JVM.md`](../01-计算机基础/00-Java与JVM.md) | <a id="old-jvm-notes"></a>[`old-jvm-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-jvm-notes) | 5 md | 2026-07-15 | JVM 调优笔记 |
| [`md/01-计算机基础/00-Java与JVM.md`](../01-计算机基础/00-Java与JVM.md) | <a id="old-spring-notes"></a>[`old-spring-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-spring-notes) | 4 md | 2026-07-15 | Spring 生态笔记（并入 Java 与 JVM） |
| [`md/01-计算机基础/10-Python基础与生态.md`](../01-计算机基础/10-Python基础与生态.md) | <a id="old-python-notes"></a>[`old-python-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-python-notes) | 69 md | 2026-07-15 | Python 基础与生态笔记 |
| [`md/01-计算机基础/10-Python基础与生态.md`](../01-计算机基础/10-Python基础与生态.md) | <a id="old-django-notes"></a>[`old-django-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-django-notes) | 14 md | 2026-07-15 | Django 笔记（并入 Python 生态） |
| [`md/01-计算机基础/10-Python基础与生态.md`](../01-计算机基础/10-Python基础与生态.md) | <a id="old-flask-notes"></a>[`old-flask-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-flask-notes) | 8 md | 2026-07-15 | Flask 笔记（并入 Python 生态） |
| [`md/01-计算机基础/20-算法与数据结构.md`](../01-计算机基础/20-算法与数据结构.md) | <a id="old-algorithm-notes"></a>[`old-algorithm-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-algorithm-notes) | 6 md | 2026-07-15 | 算法与数据结构笔记 |
| [`md/01-计算机基础/30-计算机系统与并发.md`](../01-计算机基础/30-计算机系统与并发.md) | <a id="old-cs-notes"></a>[`old-cs-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-cs-notes) | 6 md | 2026-07-15 | 计算机系统与并发笔记 |
| [`md/01-计算机基础/40-Go语言.md`](../01-计算机基础/40-Go语言.md) | <a id="old-go-notes"></a>[`old-go-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-go-notes) | 5 md | 2026-07-15 | Go 语言笔记 |
| [`md/02-后端开发/00-MySQL数据库.md`](../02-后端开发/00-MySQL数据库.md) | <a id="old-mysql-notes"></a>[`old-mysql-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-mysql-notes) | 7 md | 2026-07-15 | MySQL 数据库笔记 |
| [`md/02-后端开发/10-Redis缓存.md`](../02-后端开发/10-Redis缓存.md) | <a id="old-redis-notes"></a>[`old-redis-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-redis-notes) | 10 md | 2026-07-15 | Redis 缓存笔记 |
| [`md/02-后端开发/20-消息队列.md`](../02-后端开发/20-消息队列.md) | <a id="old-mq-notes"></a>[`old-mq-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-mq-notes) | 6 md | 2026-07-15 | 消息队列笔记 |
| [`md/02-后端开发/30-分布式协调与搜索.md`](../02-后端开发/30-分布式协调与搜索.md) | <a id="old-distributed-coord-notes"></a>[`old-distributed-coord-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-distributed-coord-notes) | 5 md | 2026-07-15 | 分布式协调与搜索笔记 |
| [`md/03-云原生与运维/00-Docker容器化.md`](../03-云原生与运维/00-Docker容器化.md) | <a id="old-docker-notes"></a>[`old-docker-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-docker-notes) | 2 md | 2026-07-15 | Docker 容器化笔记 |
| [`md/03-云原生与运维/10-Kubernetes编排.md`](../03-云原生与运维/10-Kubernetes编排.md) | <a id="old-k8s-notes"></a>[`old-k8s-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-k8s-notes) | 7 md | 2026-07-15 | Kubernetes 编排笔记 |
| [`md/03-云原生与运维/20-CI-CD持续集成.md`](../03-云原生与运维/20-CI-CD持续集成.md) | <a id="old-cicd-notes"></a>[`old-cicd-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-cicd-notes) | 13 md | 2026-07-15 | CI/CD 持续集成笔记 |
| [`md/03-云原生与运维/30-Linux运维.md`](../03-云原生与运维/30-Linux运维.md) | <a id="old-linux-notes"></a>[`old-linux-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-linux-notes) | 12 md | 2026-07-15 | Linux 运维笔记 |
| [`md/03-云原生与运维/40-云原生架构.md`](../03-云原生与运维/40-云原生架构.md) | <a id="old-cloud-native-notes"></a>[`old-cloud-native-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-cloud-native-notes) | 1 md | 2026-07-15 | 云原生架构笔记 |
| [`md/05-AI与Agent/40-大模型应用.md`](../05-AI与Agent/40-大模型应用.md) | <a id="old-llm-notes"></a>[`old-llm-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-llm-notes) | 28 md | 2026-07-15 | 大模型应用笔记 |
| [`md/05-AI与Agent/50-ML与DL基础.md`](../05-AI与Agent/50-ML与DL基础.md) | <a id="old-ml-dl-notes"></a>[`old-ml-dl-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-ml-dl-notes) | 6 md | 2026-07-15 | ML/DL 基础笔记 |

---

## 三、归档目录结构

> 完整目录树（37 个子目录）。长路径可在代码块内横向滚动；本树为索引对实际结构的记录，不修改任何归档原文件。

```
md/archive/
├── README.md                                ← 本文件（索引，唯一可修改）
├── old-crawler-notes/                       ← 爬虫（过时）
│   ├── 1.爬虫基础知识.md
│   └── 2.scrapy和xpath基础知识.md
├── old-electron-notes/                      ← Electron（过时）
│   └── electron开发初步--开发一个音乐播放软件.md
├── old-hadoop-spark-notes/                  ← Hadoop/Spark（过时）
│   ├── Hadoop_spark学习.md
│   ├── hdfs框架解释
│   ├── 漫画解释hdfs文件读取.md
│   ├── flink_bean运行
│   ├── 伪分布式框架搭建.txt
│   ├── spark sql全笔记.docx           ← 不可读，保留原文件
│   ├── TIM图片20181211174528.png
│   ├── TIM截图20181211174228.png
│   ├── TIM截图20181211202824.png
│   ├── TIM截图20181211203728.png
│   ├── TIM截图20181211205126.png
│   └── note/
│       ├── 1, 2, 3, 4, 5, 6, 7, 9, 10.外部数据源
│       └── 9.主要的运行代码和调优方法
├── old-nlp-notes/                        ← NLP（过时）
│   ├── 聊天机器人.docx                 ← 原文件 11MB 完整保留
│   ├── 聊天机器人.md                   ← pandoc 转出，含 74 张图引用
│   └── media/                          ← 74 张原图完整保留
│       └── image1.png ~ image74.png
├── old-interview-notes/                  ← 面试求职
│   ├── Java面试汇总.md                 ← 163KB 完整保留
│   ├── python面试.md                   ← 33KB
│   ├── python服务器端面试.md           ← 8KB
│   ├── 实习面试准备.md                  ← 38KB
│   ├── 校招投递.md                      ← 403B
│   └── 春招 实习笔试.pdf                ← 259KB 原文件保留
├── old-react-notes/                     ← React（含 PDF）
│   ├── React基础（技术胖）/
│   │   ├── React16基础.md
│   │   ├── Redux入门.md
│   │   ├── Redux2.md
│   │   ├── React Hooks.pdf
│   │   ├── React Router.pdf
│   │   └── React服务端渲染框架Next.js.pdf
│   └── js防抖、节流和柯里化和reduce.md
├── old-taro-notes/                      ← Taro
│   ├── React-taro基本知识.md
│   ├── React-taro环境搭建.md
│   ├── taro-技术选型.md
│   ├── taro-自带方法.md
│   ├── Taro-设计思想及架构.md           ← 53KB
│   └── taro小程序展示富文本.md
├── old-vue-miniapp-notes/               ← Vue + 小程序
│   ├── Vue3+Vue-CLI项目搭建.md
│   └── 微信小程序开发（七月）.md
├── youdaonote-images/                   ← 共享图片（被多个归档目录引用，不对应单一主线）
├── notes-个人写作/                          ← 个人写作笔记（不对应单一主线）
├── old-agent-notes/                      ← AI Agent 笔记（开发+系统知识）
├── old-algorithm-notes/                  ← 算法与数据结构
├── old-cicd-notes/                       ← CI/CD 持续集成
├── old-cloud-native-notes/               ← 云原生架构
├── old-cs-notes/                         ← 计算机系统与并发
├── old-css-notes/                        ← CSS 便捷代码
├── old-distributed-coord-notes/          ← 分布式协调与搜索
├── old-django-notes/                     ← Django 笔记
├── old-docker-notes/                     ← Docker 容器化
├── old-flask-notes/                      ← Flask 笔记
├── old-git-notes/                        ← Git 版本控制
├── old-go-notes/                         ← Go 语言
├── old-java-notes/                       ← Java 基础
├── old-jvm-notes/                        ← JVM 调优
├── old-k8s-notes/                        ← Kubernetes
├── old-linux-notes/                      ← Linux 运维
├── old-llm-notes/                        ← 大模型应用
├── old-ml-dl-notes/                      ← ML/DL 基础
├── old-mq-notes/                         ← 消息队列
├── old-mysql-notes/                      ← MySQL 数据库
├── old-python-notes/                     ← Python 基础与生态
├── old-redis-notes/                      ← Redis 缓存
├── old-soft-skills-notes/                ← 软实力
├── old-spring-notes/                     ← Spring 生态
├── old-system-design-notes/              ← 系统设计与设计模式
├── old-testing-notes/                    ← 软件测试
└── old-tools-notes/                      ← 工具箱与资源
```

> 说明：`notes-个人写作/` 为个人写作笔记，未并入特定主线文档；`youdaonote-images/` 为共享图片目录，被 <a id="old-react-notes"></a>[`old-react-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-react-notes)、<a id="old-taro-notes"></a>[`old-taro-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-taro-notes)、<a id="old-vue-miniapp-notes"></a>[`old-vue-miniapp-notes/`](https://github.com/wychmod/wychmod.github.io/tree/main/docs/md/archive/old-vue-miniapp-notes) 等多个归档引用。两者均只读保留，不出现在来源映射表中。

---

## 四、归档原则

### 4.1 原文件改动规则

- ✅ **保留**：错别字、过时信息、个人风格、英文拼写错误、重复内容
- ❌ **不改正**：所有改正在主线新文档中完成
- ❌ **不删除**：原文件即使"过时"也保留，作为知识演化的痕迹
- ❌ **不重命名 / 不移动 / 不自动格式化**：归档原文件保持原貌

### 4.2 何时归档

满足任一即归档：

1. 多份相似内容合并为 1 篇主线文档
2. 内容主题过时被替代（但仍可能有学习价值）
3. 内容已并入更系统的主线文档
4. 课程笔记、书摘等"参考性"内容

### 4.3 不归档的情况

- 主线文档的"参考引用"（用相对链接）
- 图片、PDF 等资源文件
- `.obsidian/` 等 IDE 配置
- `tools/` 等独立子站

---

## 五、如何阅读一条归档记录

1. **先读主线**：打开来源映射表中的"主线新文档"链接，看当前整理后的知识。
2. **再看底稿**：回到对应"归档目录"，理解原始来源、写作时的上下文与时代背景。
3. **发现错误不改原文**：归档原文件保持原貌；在主线文档或 [CORRECTIONS.md](../../_meta/CORRECTIONS.md) 中记录订正。

> ⚠️ **过时信息提示**：归档中包含 2018 年前后的技术栈（如 CDH 5.7、TensorFlow 1.x、Struts2、Electron 旧版 API、Hadoop 生态等），仅作历史背景。当前最佳实践以主线文档"2026 年现状"段落为准；过时条目在主线文档中以 `⚠️ 已过时` 标注并给出替代方案。

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-28 | UI 一致性 | 重构为"归档来源地图"页面：新增面包屑、导语、只读边界、快速入口、阅读指引、过时信息提示；补录第二阶段 20 条主线深化映射（来源文件数由 `count-archive.js` 统计，归档时间取 Git 首提交日期），来源地图完整覆盖全部 35 个 `old-*` 归档目录；保留全部原有映射数据、目录结构与归档原则。除本索引外未修改任何归档原文件。 |
| 2026-08-18 | 订正 | 修复归档目录链接：Docsify 无法渲染目录路由，统一指向归档来源地图或直接 GitHub 目录 |
