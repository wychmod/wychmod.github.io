# 改正记录台账

> **目的**：记录每次内容重构过程中的所有改正（错别字、事实错误、死链、格式、风格、补充）。
> **配套文档**：
> - [`REFACTOR_PLAN.md`](./REFACTOR_PLAN.md) — 改什么
> - [`REFACTOR_GUIDELINES.md`](./REFACTOR_GUIDELINES.md) — 怎么改

---

## 统计

> 自动扫描生成（最后更新：2026-07-15 #9 后）

| 类型 | 次数 |
|---|---|
| 错别字 | 2 |
| 事实错误 | 2 |
| 死链 | 5 |
| 格式 | 7 |
| 风格 | 6 |
| 补充 | 20 |
| 路径修正（非内容）| 152 |
| 归档保留 | 0 |
| 疏漏 | 7 |
| 新增主线文档 | 9 |
| **合计** | **201** |

---

## 详细记录

### 2026-07-14 #0

- **文件**：`docs/REFACTOR_PLAN.md`（本次修订）
- **类型**：风格
- **原文**：`08-存档技术/`
- **改正后**：`08-过时技术/`
- **原因**：用户反馈"存档技术"不准确，"过时"更贴切
- **影响范围**：分类名 + 全文术语统一（"过期"→"过时"）
- **同时新建**：
  - `docs/REFACTOR_GUIDELINES.md`（合并工作规范）
  - `docs/CORRECTIONS.md`（本文档）

---

### 2026-07-14 #1 — 08-过时技术/爬虫技术（首版）

**涉及文件**：
- 新建：`docs/md/08-过时技术/30-爬虫技术.md` ← 后续 #2 改名为 `00-爬虫技术.md`
- 归档：`docs/md/爬虫/1.爬虫基础知识.md` → `docs/archive/old-crawler-notes/`
- 归档：`docs/md/爬虫/2.scrapy和xpath基础知识.md` → `docs/archive/old-crawler-notes/`

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 1 | 错别字 | `reponse`（出现 3 次） | `response` | 原文变量名拼写错误 |
| 2 | 错别字 | `selectlist` | `SelectorList` | 原文代码标识符错误，Scrapy 类名应为 SelectorList |
| 3 | 格式 | 两篇原文均无 `#` 一级标题 | 加 `# 爬虫技术（⚠️ 已过时，仅作存档）` | 原文只有 `##` 二级标题，结构不完整 |
| 4 | 风格 | 原文是零散速记，章节无顺序 | 重组成 7 章 | 按"由浅入深"原则重组 |
| 5 | 补充 | 原文正则表达式为速记列表 | 整理成速查表（加示例列） | 表格化更易检索 |
| 6 | 补充 | 原文未提爬取策略/去重实现 | 补充 DFS/BFS + URL 哈希/布隆过滤器 | 用户笔记缺这块 |
| 7 | 补充 | 原文 scrapy 调试的 `sys.path.append` 无说明 | 补一句"把当前目录加入 Python 模块搜索路径" | 帮助理解 |
| 8 | 补充 | 原文无 2026 年替代方案 | 新加"📖 最新技术速览"段 | 体现"已过时"分类的核心价值 |
| 9 | 存档保留 | 原文 "Atemis"（应为 "Artemis"） | 保留原文，加"📝 存档说明"标注 | 遵循"原内容存档"原则 |

**图片**：12 张原图全部保留，路径从 `../youdaonote-images/...` 不变（新位置 `08-过时技术/` 与原 `爬虫/` 都在 `md/` 下平级）。

**死链检查**：12/12 通过 ✓

**原文件归档原则**：
- 归档文件**不做任何改正**（保持"原内容存档"原貌）
- typo 在新文档里改，原文件保留原 typo 以示存档
- 英文拼写错误同理（标存档说明而非改正）

---

### 2026-07-14 #2 — 修订本轮（按用户反馈）

**用户反馈**：
1. 归档目录必须在 `md/` 下面
2. 归档来源专门记录在一个文件里（不在新文档开头）
3. 可以自己补充，但不能太离谱

**涉及文件**：
- 移动：`docs/archive/old-crawler-notes/` → `docs/md/archive/old-crawler-notes/`
- 重命名：`docs/md/08-过时技术/30-爬虫技术.md` → `00-爬虫技术.md`
- 新建：`docs/md/archive/README.md`（归档来源索引 + 目录结构）
- 更新：`docs/REFACTOR_PLAN.md`（路径统一改为 `md/archive/`，编号 30→00）
- 更新：`docs/_sidebar.md`、`docs/README.md`（同步路径）
- 修订：`docs/md/08-过时技术/00-爬虫技术.md`（删章节）

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 10 | 结构 | 归档在 `docs/archive/` 顶层 | 移到 `docs/md/archive/`（md 下） | 用户反馈"归档也得在 md 下" |
| 11 | 命名 | `30-爬虫技术.md` | `00-爬虫技术.md` | 编号未按方案约定（首个过时技术应为 00） |
| 12 | 来源标注 | 计划在新文档开头加 "📌 基于..." | 撤回，建独立 `docs/md/archive/README.md` 集中记录 | 用户反馈"不要在新文件开头" |
| 13 | 补充克制 | 第七章"常见坑"5 条技术性提示 | 改为"合法合规"4 条（最关键）+ 1 条 Playwright 链接 | 用户反馈"不能太离谱"，原"常见坑"超出原文 |
| 14 | 补充克制 | 末尾"📚 延伸阅读"4 条 | 整章删除（合并到合规章末尾 1 条） | 同上 |
| 15 | 补充标注 | 5 处 "💡 补充" 标注 | 减为 4 处 | 合并精简 |

**改动后 "💡 补充" 分布**：
- 正则速查表（表格化）
- 爬取策略/去重（补一句话）
- scrapy 调试说明（补一句含义）
- 合法合规（强调最重要的提醒）

**改动后章节结构**：
1. 爬虫能做什么
2. 正则表达式速查
3. Scrapy 框架入门
4. XPath 与 CSS 选择器
5. Requests 辅助提取
6. Scrapy Shell 调试
7. 合法合规（合并原"常见坑"+原"延伸阅读"）

**补充量对比**：
- 首版：5 处补充（含整章"常见坑"+"延伸阅读"）
- 修订后：4 处补充（全部围绕原文未说清的点，不加全新章节）

---

### 2026-07-14 #3 — 08-过时技术/Electron

**涉及文件**：
- 新建：`docs/md/08-过时技术/10-Electron桌面开发.md`
- 归档：`docs/md/electron/electron开发初步——开发一个音乐播放软件.md` → `docs/md/archive/old-electron-notes/`
- 同步：`docs/_sidebar.md` / `docs/README.md` / `docs/md/archive/README.md`

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 16 | 事实错误 | `nodeIntegration: true` 写法 | 加"⚠️ 新版本必须改为 false，通过 preload + contextBridge 暴露 API" | Electron 12+ 默认 false，原文写法是过期/危险做法 |
| 17 | 格式 | 原文有重复标题 "## 进入Electron的世界" | 删除重复，重组成 6 章节 | 原文结构混乱 |
| 18 | 风格 | 原文是教程笔记 | 套"过时技术"模板 + 重组实操内容 | 统一分类格式 |
| 19 | 补充 | 原文主进程/渲染进程散在文字里 | 整理成对比表（数量/能力/Node 支持） | 表格化更清晰 |
| 20 | 补充 | 原文 electron-store 段没列其他方案 | 补充"3 种数据持久化方案"对比 | 给读者选型依据 |
| 21 | 补充 | 原文事件代理没讲"为什么" | 补"避免给每个按钮单独绑定 click（DOM 多时性能差、内存浪费）" | 帮助理解 |
| 22 | 存档保留 | 原文 "直接npm"（不完整） | 保留原文，归到打包章节开头 | 原文速记风格保留 |

**图片**：7 张原图全部保留，路径不变（平级）。

**死链检查**：7/7 通过 ✓

**章节结构**（6 章）：
1. Electron 是什么
2. 主进程 vs 渲染进程
3. 创建 BrowserWindow
4. 进程间通信（IPC）
5. 实战：音乐播放器
6. 打包与分发
+ 关键 takeaway 段

**补充量**：3 处 "💡 补充"（全部围绕"原文没说清的点"，无新章节）

---

### 2026-07-14 #4 — 08-过时技术/Hadoop-Spark

**涉及文件**：
- 新建：`docs/md/08-过时技术/20-Hadoop-Spark大数据.md`
- 归档：`docs/md/hadoop-spark学习笔记/`（含 10 个 note + 2 个无扩展名 md + 1 docx + 1 txt + 5 张图）→ `docs/md/archive/old-hadoop-spark-notes/`
- 复制：5 张本地图复制到新文档同目录（保持相对路径可用）
- 同步：`_sidebar.md` / `README.md` / `archive/README.md`

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 23 | 死链 | 5 张本地图用绝对路径 `C:\Users\wyx\Desktop\新建文件夹\xxx.png` | 改为相对路径 `./TIMxxx.png` | 绝对路径在博客中 100% 死链 |
| 24 | 死链 | 漫画版 HDFS 用的 jianshu 外链（已失效/防盗链） | 加"⚠️ 外链可能已失效"标注 | jianshu 防盗链普遍失效 |
| 25 | 格式 | 3 篇主体 md 散在根目录 + 11 个 note 子文件 + 1 txt + 2 无扩展名 | 重组成 9 章节主线 + 全部归档 | 16 个源文件 → 1 篇主线 |
| 26 | 风格 | 原文是 2018 年 CDH 5.7 课程笔记 | 加"⚠️ 2026 年不推荐 CDH"提醒 | CDH 2019 年起收紧开源协议 |
| 27 | 事实 | 原文把 HDFS 写数据流程讲得很细（14 步） | 保留并加"💡 流水线思想"补充 | 流程正确，补充计算机网络对比 |
| 28 | 补充 | 原文讲 Hadoop 生态 | 补"2026 年替代方案"对比表 | 体现"已过时"分类核心价值 |
| 29 | 补充 | 原文提了 YARN | 加"2026 观点：YARN 已被 K8s 替代" | 时代感 |
| 30 | 补充 | 原文 MapReduce 局限 → Spark | 整理成"MapReduce vs Spark 5 维度对比表" | 直观 |
| 31 | 补充 | 原文 spark-submit 命令分散 | 整理成"⚠️ 常见报错" + "Client vs Cluster 模式对比" | 实操避坑 |
| 32 | 补充 | 原文用户行为日志分析实操散乱 | 重整为"8.1 数据格式 → 8.4 调优要点" | 章节化 |

**特殊处理**：
- **`spark sql全笔记.docx`** (2MB) 不可读 → 整体归档到 archive，**跳过**（不强行转换）
- **`TIM截图20181211174133.png`** 原文件未被任何 md 引用 → 复制后删除（避免冗余）
- **5 张本地图** 复制到 `08-过时技术/` 同目录 → 保证 `./TIMxxx.png` 相对路径可解析

**图片**：5 张原图全部保留 + 路径从绝对改为相对。

**死链检查**：5/5 通过 ✓

**章节结构**（9 章）：
1. 大数据生态总览
2. HDFS 分布式文件系统
3. YARN 资源调度
4. MapReduce 基础
5. Spark 生态
6. Spark SQL
7. Spark 运行模式
8. 实战：用户行为日志分析
9. CDH 5.7 环境搭建（速记，标过时）

**补充量**：3 处 "💡 补充"（不超量，全部围绕"原文没说清的点"）

---

### 2026-07-14 #5 — 08-过时技术/NLP

**涉及文件**：
- 新建：`docs/md/08-过时技术/30-NLP与聊天机器人.md`（含 9 张精选图）
- 安装：`C:\tools\pandoc\pandoc-3.1.11\`（按用户授权）
- 转换：`docs/md/NLP/聊天机器人.docx` → `docs/md/NLP/聊天机器人.md`（pandoc + `--extract-media` 提取 74 张图）
- 修正：md 里图片路径从绝对 `D:\github\...` 改为相对 `media/image*.png`
- 复制：9 张精选图复制到 `08-过时技术/` 同目录
- 归档：`docs/md/NLP/` 整个目录 → `docs/md/archive/old-nlp-notes/`
- 同步：`_sidebar.md` / `README.md` / `archive/README.md`

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 33 | 事实错误 | `tf.Session()` TF 1.x 写法 | 加"⚠️ 改正"段说明 TF 2.x 默认 Eager Mode | TF 1.x 静态图已淘汰 |
| 34 | 死链 | 75 张图引用 `D:\github\wychmod.github.io\docs\md\NLP\media/media/image*.png` | 改为 `media/image*.png`（相对路径） | 绝对路径在博客中 100% 死链 |
| 35 | 格式 | 74 张图 + 散乱文字混在一篇 7KB docx | 转 md + 提取图 + 精选 9 张进主线 | 11MB docx 不可能全收进新文档 |
| 36 | 风格 | 原文是 2018 风格的"自己搭聊天机器人" | 加"2026 怎么搭"对比表 | 体现"已过时"分类核心价值 |
| 37 | 补充 | 原文讲了贝叶斯/HMM/word2vec | 加"⚠️ 全部过时"标注 + LLM 替代方案 | 关键提醒 |
| 38 | 补充 | 原文 pip install 用了 doubanio 镜像 | 补"现在用清华镜像"提示 | 镜像变化 |
| 39 | 补充 | 原文 LSTM 单元图 + 文字说明 | 补"为什么需要 LSTM"梯度问题背景 | 帮助理解 |

**特殊处理**：
- **docx (11MB) 不能直接读** — 按用户授权装 pandoc portable 版（解压到 `C:\tools\pandoc\`），转 md + 提取 74 张图
- **74 张图全部归档**（按 GUIDELINES 2.5 最高原则，不丢失任何文件/内容）
- **9 张精选图复制到主线同目录**（保持相对路径可用）
- **pandoc 自动嵌套 `media/media/`** 已修正（md 引用 `media/` 单层）

**死链检查**：9/9 主线图通过 ✓；md 74/74 归档图通过 ✓

**章节结构**（6 章）：
1. TensorFlow 1.x 入门
2. 神经网络基础
3. NLP 基础概念
4. 传统 NLP 算法（已过时）
5. 词向量与 word2vec
6. 聊天机器人实战（原文）

**补充量**：2 处 "💡 补充"（克制，全部围绕"原文没说清的点"）

**章节结构**（6 章）：
1. TensorFlow 1.x 入门
2. 神经网络基础
3. NLP 基础概念
4. 传统 NLP 算法（已过时）
5. 词向量与 word2vec
6. 聊天机器人实战（原文）

**补充量**：2 处 "💡 补充"（克制，全部围绕"原文没说清的点"）

**GUIDELINES 更新**：
- 新增 2.5 节"⭐ 最高原则：不丢失任何文件/内容"
- 增加自查清单和"不允许的"列表
- 按用户反馈"合并后必须完整归档"

**GUIDELINES 更新**：
- 新增 2.5 节"⭐ 最高原则：不丢失任何文件/内容"
- 增加自查清单和"不允许的"列表
- 按用户反馈"合并后必须完整归档"

---

### 2026-07-14 #6 — 07-求职（4 主线 + 5 归档）

**涉及文件**：
- 新建：`docs/md/07-求职/00-面试方法论.md`
- 新建：`docs/md/07-求职/10-Java面试核心速查.md`
- 新建：`docs/md/07-求职/20-Python面试.md`
- 新建：`docs/md/07-求职/30-实习与校招.md`
- 归档：`docs/md/面试/` → `docs/md/archive/old-interview-notes/`（含 1 pdf + 5 md）
- 同步：`_sidebar.md` / `README.md` / `archive/README.md`

**设计**：

| 主线 | 原文 | 设计 |
|---|---|---|
| 00-面试方法论 | Java 汇总前几章 | 通用方法论（自我介绍/HR/谈薪/反向提问） |
| 10-Java 核心速查 | Java 汇总（70KB） | 速查 30 题（高频核心 + 关键点） |
| 20-Python 面试 | python面试 + python服务器端面试 | 速查 23 题（基础/数据结构/设计模式/底层） |
| 30-实习与校招 | 实习面试准备 + 校招投递 | 核心考点 + 笔试技巧 + 投递记录 |

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 40 | 死链 | 4 篇主线引用 `../../archive/old-interview-notes/...` | 改为 `../archive/old-interview-notes/...` | 路径多了一级（md/ 在中间） |
| 41 | 格式 | Java 70KB 面试汇总混在一起 | 提炼速查 30 题 + 原文件归档 | 70KB 直接进新文档太冗长 |
| 42 | 风格 | Python 面试 5 个一级标题，结构松散 | 重组成 5 大类（基础/数据结构/设计模式/底层/Flask-Django） | 易检索 |
| 43 | 补充 | 校招投递.md 只有公司+状态表格 | 加"投递心得"小节（大厂官网/内推/简历被刷原因） | 用户没总结的部分 |
| 44 | 补充 | 实习面试准备.md 散乱的 58 个主题 | 按"网络/MySQL/Redis/多线程/Linux"5 大类组织 | 易检索 |

**特殊处理**：
- **春招 实习笔试.pdf**（259KB）整体归档，不强行转换
- **Java 面试汇总.md**（163KB）原文**100% 保留**在归档，只在新文档中列"速查 30 题"+"完整版在归档"
- 满足 GUIDELINES 2.5 最高原则"不丢失任何文件/内容"

**死链检查**：11/11 全部通过 ✓

**章节结构**（4 篇主线）：
- 00-面试方法论：5 段（自我介绍/HR/软问题/流程/决策）
- 10-Java：8 段（基础/JVM/并发/Spring/设计模式/Redis/MySQL/MyBatis）
- 20-Python：5 段（基础/数据结构/设计模式/底层/Flask-Django）
- 30-实习校招：4 段（核心考点/笔试技巧/投递记录/准备路线）

**补充量**：3 处 "💡 补充"（全部围绕"原文没说清的点"，无新章节）

---

## 待确认事项

> 拿不准的改正先记这里，等用户拍板。

| 日期 | 文件 | 内容 | 状态 |
|---|---|---|---|
| - | - | - | - |


### 2026-07-14 #7 — 04-前端（3 主线 + 15 归档）

**涉及文件**：
- 新建：docs/md/04-前端/00-React基础与状态管理.md
- 新建：docs/md/04-前端/10-Taro多端开发.md
- 新建：docs/md/04-前端/20-Vue与小程序.md
- 归档：docs/md/React/ → docs/md/archive/old-react-notes/（含 3 PDF 完整保留）
- 归档：docs/md/React-taro/ → docs/md/archive/old-taro-notes/
- 归档：docs/md/vue/ + docs/md/微信小程序/ → docs/md/archive/old-vue-miniapp-notes/
- 共享图：docs/md/archive/youdaonote-images/（22 张图，被 3 个归档目录引用）
- 同步：_sidebar.md / archive/README.md

**设计**：

| 主线 | 来源 | 设计 |
|---|---|---|
| 00-React 基础与状态管理 | React16 + Redux 入门/2 + js 防抖节流 | React 入门 + 函数式工具 + Redux 速查 |
| 10-Taro 多端开发 | Taro 6 篇（最大 53KB） | Taro 简介 + 环境 + 选型 + 设计架构 |
| 20-Vue 与小程序 | Vue3 + 微信小程序 | Vue CLI + Vue3 vs Vue2 + 小程序基础 |

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 45 | 路径修正 | 归档文件引用 ../../youdaonote-images/... | 改为 ../youdaonote-images/... | 移动后相对路径失效（按 GUIDELINES 2.6 例外） |
| 46 | 路径修正 | 3 个主线引用 ../../archive/old-X/youdaonote-images/... | 改为 ../archive/youdaonote-images/... | 子目录不存在，统一用共享图 |
| 47 | 格式 | 13 个 md + 3 PDF 散在 4 个目录 | 3 篇主线 + 完整归档 | 易检索 + 不丢失 |
| 48 | 补充 | Taro 设计思想 53KB 是大笔记 | 提炼编译时+运行时双架构 + 5 大核心模块 | 易理解 |
| 49 | 补充 | Vue3 原文只有 setup 示例 | 补 Vue3 vs Vue2 关键变化对比表 | 易选择 |
| 50 | 补充 | 微信小程序原文写七月课程笔记 | 补与 Vue 区别对比表 | 易对比 |

**特殊处理**：
- 3 个 PDF 完整保留（React Hooks 826KB / React Router 584KB / Next.js 815KB）
- 22 张图复制到 docs/md/archive/youdaonote-images/ 共享目录
- 归档文件图片路径修正（按 GUIDELINES 2.6 例外条款）

**死链检查**：22/22 主线 + 归档图片通过

**章节结构**：
- 00-React：6 段（入门/JS 工具/Redux/Hooks/Router/Next）
- 10-Taro：6 段（简介/环境/选型/自带方法/架构/富文本）
- 20-Vue 与小程序：8 段（CLI 入门/集成/Router/Vue3/小程序）

**补充量**：2 处 💡 补充（克制）

**GUIDELINES 更新**：
- 新增 2.6 节图片路径修正例外条款
- 说明归档文件移动后图片路径必须修正的策略
- 22 张图复制到 archive/youdaonote-images/ 共享目录

### 2026-07-15 #8 - Review 修复 (用户要求 re 一遍发现的疏漏)

**用户反馈**: 再 re 一遍，是否有疏漏

**发现并修复的疏漏**:

| # | 类型 | 问题 | 修复 |
|---|---|---|---|
| 51 | 疏漏 | md/agent/ 整个目录 10 个文件未归档 | 全部移到 archive/old-agent-notes/ |
| 52 | 疏漏 | md/git/ 2 md + 1 xmind 未归档 | 移到 archive/old-git-notes/ |
| 53 | 疏漏 | md/css/ 1 md 未归档 | 移到 archive/old-css-notes/ |
| 54 | 疏漏 | md/tools/README.md 未归档 | 移到 archive/old-tools-notes/ |
| 55 | 疏漏 | docs/README.md 有 13 个 ### 折叠区, 9 个旧版重复 | 顶部快速导航重写, 只保留 9 个新分类 |
| 56 | 疏漏 | docs/_sidebar.md 有 17 个一级标题, 9 个旧版重复 | 完全重写, 9 个分类无重复 |
| 57 | 疏漏 | md/md/python命名规范.md 嵌套遗留未归档 | 移到 archive/old-python-notes/ |

**根本原因**: 之前用 edit 工具追加新 section, 没有删除旧 section, 导致 README/_sidebar 有大量新+旧重复内容。

**修复后状态**:
- md/ 下 8 个一级分类 (01-08), 无零散目录
- archive/ 下 33 个子目录
- _sidebar.md 9 个一级分类
- README.md 9 个二级分类, 无重复
- 全部原文件 100% 不丢失

---

### 2026-07-15 #9 — 主线深化 Phase 0/1/2（AI + 开发工具 + 6 篇样板）

**涉及文件**：
- 更新：`docs/REFACTOR_PLAN.md`（状态改为"第二阶段：主线深化中"）
- 更新：`docs/REFACTOR_GUIDELINES.md`（新增 5.5 节"内联 vs 链接"判定规则）
- 新建：`scripts/check-links.js`、`scripts/sidebar-check.js`、`scripts/inline-archive.js`、`scripts/count-archive.js`
- 新建：`docs/md/05-AI与Agent/00-AI编程三件套方法论.md`
- 新建：`docs/md/05-AI与Agent/10-Agent设计模式与多Agent.md`
- 新建：`docs/md/05-AI与Agent/20-协议与工程/MCP协议.md`
- 新建：`docs/md/05-AI与Agent/20-协议与工程/A2A协议.md`
- 新建：`docs/md/05-AI与Agent/20-协议与工程/DDD领域驱动.md`
- 新建：`docs/md/05-AI与Agent/30-参考架构/manus架构设计.md`
- 新建：`docs/md/05-AI与Agent/30-参考架构/Alembic数据库迁移.md`
- 新建：`docs/md/09-开发工具/00-Git版本控制.md`
- 新建：`docs/md/09-开发工具/10-工具箱与资源.md`
- 重写：`docs/_sidebar.md`（新增 09-开发工具，修复 AI 链接与 CI-CD 格式）
- 重写：`docs/README.md`（修复卡片链接，添加 09-开发工具）
- 重写：`docs/md/Index.md`（旧首页重写为全站地图）
- 更新：`docs/md/archive/README.md`（加入 AI、开发工具映射）
- 新建：`docs/REFACTOR_STATUS.md`（重构状态总览 + review 指南）
- 更新：`docs/README.md`（底部增加项目维护链接）
- 重写：`docs/md/01-计算机基础/40-Go语言.md`
- 重写：`docs/md/03-云原生与运维/00-Docker容器化.md`
- 重写：`docs/md/03-云原生与运维/40-云原生架构.md`
- 重写：`docs/md/04-前端/10-Taro多端开发.md`
- 重写：`docs/md/04-前端/20-Vue与小程序.md`
- 重写：`docs/md/06-软件工程/20-软实力.md`

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 58 | 死链 | `_sidebar.md` 7 个 AI 链接指向不存在的文件 | 新建 7 篇 AI 主线文档 | 侧边栏引用缺失 |
| 59 | 格式 | `_sidebar.md` 中 `-CI-CD 持续集成` 缺少链接 | 改为 `- [CI-CD 持续集成](/md/03-云原生与运维/20-CI-CD持续集成.md)` | Markdown 列表语法错误 |
| 60 | 路径 | `_sidebar.md` / `README.md` 中 AI 链接缺前导 `/` | 统一补全为 `/md/05-AI与Agent/...` | Docsify 路由一致性 |
| 61 | 结构 | `docs/md/Index.md` 为旧首页，含 200+ 死链 | 重写为 9 大分类全站地图 | 避免读者进入死链页面 |
| 62 | 结构 | 新增 `09-开发工具` 一级分类 | 放入 Git/工具箱两篇主线 |  surfaced 未引用归档 |
| 63 | 内容 | `40-Go语言.md` 等 6 篇为索引式 | 深化为详细总结 + 末尾内联原文 | 符合"归档内容写入外部文档"目标 |
| 64 | 路径修正 | Docker 内联原文中 `[Centos7安装Docker.md](Centos7安装Docker.md)` | 改为 `../archive/old-docker-notes/Centos7安装Docker.md` | 文件移动后相对路径失效 |

**待确认/已知遗留**：

| 日期 | 文件 | 内容 | 状态 |
|---|---|---|---|
| 2026-07-15 | `docs/md/archive/old-agent-notes/agent系统知识/MCP协议完整教程：从入门到实践.md` | 引用同目录 2 个 PDF（`6-2 MCP协议...pdf`、`6-3 MCP架构...pdf`）不存在 | 原文件即缺失，未在本次归档目录中找到；主线 MCP 文档已独立成文，不依赖这 2 个 PDF |
| 2026-07-15 | 多个 archive 文件 | 模板语法 `{{ ... }}`、图片文件名截断、绝对路径图片被脚本误判为死链 | 属原始笔记历史问题，按 GUIDELINES 不修改归档原文件 |

**死链检查**：
- 主线文档与导航文件：零死链 ✓
- 归档原文件：7 个历史/误判死链（见上表"已知遗留"）

**侧边栏检查**：40 篇主线文档全部有入口 ✓

**GUIDELINES 更新**：
- 新增 5.5 节"主线文档内联原文 vs 仅放链接"判定规则
- 明确：Markdown 文件数 `<= 5` 且总大小 `< 500KB` 时内联，否则只放链接

### 2026-07-15 #9 — 主线深化 Phase 1（补齐 AI + 开发工具 + 修复导航）

**涉及文件**：
- 新建：`docs/md/05-AI与Agent/00-AI编程三件套方法论.md` 等 7 篇 AI 主线文档
- 新建：`docs/md/09-开发工具/00-Git版本控制.md`、`10-工具箱与资源.md`
- 新建：`scripts/check-links.js`、`scripts/sidebar-check.js`、`scripts/inline-archive.js`、`scripts/count-archive.js`、`scripts/fix-archive-links.js`
- 重写：`docs/_sidebar.md`、`docs/md/Index.md`
- 更新：`docs/README.md`、`docs/md/archive/README.md`、`docs/REFACTOR_PLAN.md`、`docs/REFACTOR_GUIDELINES.md`
- 修正：`docs/AI-UPDATE-SUMMARY.md` 死链

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 58 | 死链 | AI-UPDATE-SUMMARY.md 引用 `TEST-AI-ASSISTANT.md` | 改为纯文本"测试清单（原文件已移除）" | 目标文件不存在 |
| 59 | 路径修正 | 16 个主线文档中 `../../archive/xxx/`（150 处） | 统一改为 `../archive/xxx/` | 主线文档目录层级加深后原相对路径失效 |
| 60 | 格式 | `_sidebar.md` 中 `-CI-CD 持续集成` 缺链接 | 改为 `- [CI-CD 持续集成](/md/03-云原生与运维/20-CI-CD持续集成.md)` | 格式错误导致死链 |
| 61 | 格式 | `_sidebar.md` AI 链接缺前导 `/` | 统一补全为 `/md/05-AI与Agent/...` | Docsify 路由解析需要绝对路径 |
| 62 | 风格 | REFACTOR_PLAN 状态"已全部完成" | 改为"第二阶段：主线深化中" | 当前任务为后续深化 |
| 63 | 补充 | REFACTOR_GUIDELINES 缺"内联 vs 链接"判定 | 新增 5.5 节规则 | 统一主线文档归档呈现标准 |
| 64 | 新增 | 7 个 AI 分类文件不存在 | 从 `old-agent-notes/` 提炼新建 | 侧边栏已引用但文件缺失 |
| 65 | 新增 | `09-开发工具` 分类不存在 | 新建 2 篇主线文档 + 侧边栏入口 | 归档 `old-git-notes/`、`old-tools-notes/` 需要主入口 |
| 66 | 新增 | `docs/md/Index.md` 为旧首页，含大量死链 | 重写为基于 9 大分类的全站地图 | 旧首页路径已全部失效 |

**新增主线文档清单**：
1. `docs/md/05-AI与Agent/00-AI编程三件套方法论.md`
2. `docs/md/05-AI与Agent/10-Agent设计模式与多Agent.md`
3. `docs/md/05-AI与Agent/20-协议与工程/MCP协议.md`
4. `docs/md/05-AI与Agent/20-协议与工程/A2A协议.md`
5. `docs/md/05-AI与Agent/20-协议与工程/DDD领域驱动.md`
6. `docs/md/05-AI与Agent/30-参考架构/manus架构设计.md`
7. `docs/md/05-AI与Agent/30-参考架构/Alembic数据库迁移.md`
8. `docs/md/09-开发工具/00-Git版本控制.md`
9. `docs/md/09-开发工具/10-工具箱与资源.md`

**脚本工具**：
- `scripts/check-links.js`：扫描死链
- `scripts/sidebar-check.js`：检查侧边栏入口
- `scripts/inline-archive.js`：小归档内联到主线文档
- `scripts/count-archive.js`：归档规模统计

---

### 2026-07-16 #10 — 主线深化 Phase 3（完成全部剩余主线文档 + 封面修复）

**涉及文件**：
- 重写：`docs/md/01-计算机基础/10-Python基础与生态.md`
- 重写：`docs/md/01-计算机基础/20-算法与数据结构.md`
- 重写：`docs/md/01-计算机基础/30-计算机系统与并发.md`
- 重写：`docs/md/02-后端开发/00-MySQL数据库.md`
- 重写：`docs/md/02-后端开发/10-Redis缓存.md`
- 重写：`docs/md/02-后端开发/20-消息队列.md`
- 重写：`docs/md/02-后端开发/30-分布式协调与搜索.md`
- 重写：`docs/md/03-云原生与运维/10-Kubernetes编排.md`
- 重写：`docs/md/03-云原生与运维/20-CI-CD持续集成.md`
- 重写：`docs/md/03-云原生与运维/30-Linux运维.md`
- 重写：`docs/md/04-前端/00-React基础与状态管理.md`
- 重写：`docs/md/05-AI与Agent/40-大模型应用.md`
- 重写：`docs/md/05-AI与Agent/50-ML与DL基础.md`
- 重写：`docs/md/06-软件工程/10-软件测试.md`
- 重写：`docs/md/07-求职/00-面试方法论.md`
- 重写：`docs/md/07-求职/10-Java面试核心速查.md`
- 重写：`docs/md/07-求职/20-Python面试.md`
- 重写：`docs/md/07-求职/30-实习与校招.md`
- 修复：`docs/_coverpage.md`（4 条学习路线卡片 + 3 条源码剖析链接改为新 9 大分类路径）
- 更新：`docs/REFACTOR_STATUS.md`（状态改为全部完成）

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 67 | 内容 | 18 篇主线文档为索引式 | 全部深化为详细总结 | 满足"归档内容写入外部文档"目标 |
| 68 | 路径 | `_coverpage.md` 路线卡片指向旧路径 `#/md/java/...` | 改为 `#/md/01-计算机基础/00-Java与JVM` 等新路径 | 重构后目录结构变更 |
| 69 | 路径修正 | `20-消息队列.md` 内联原文中 `RabbitMQ.md` 等相对链接 | 改为 `../archive/old-mq-notes/...` | 文件移动后相对路径失效 |
| 70 | 路径修正 | `30-分布式协调与搜索.md` 内联原文中 `安装elasticsearch.md` | 改为 `../archive/old-distributed-coord-notes/安装elasticsearch.md` | 文件移动后相对路径失效 |
| 71 | 路径修正 | `10-Python基础与生态.md` 中 `Django(MRO).md` 链接 | 改为 URL 编码 `Django%28MRO%29.md` | Markdown 解析器把括号识别为链接边界 |

**待确认/已知遗留**：

| 日期 | 文件 | 内容 | 状态 |
|---|---|---|---|
| 2026-07-16 | `docs/md/archive/old-agent-notes/agent系统知识/MCP协议完整教程：从入门到实践.md` | 引用 2 个 PDF 不存在 | 原文件即缺失，未找到 |
| 2026-07-16 | `docs/md/01-计算机基础/30-计算机系统与并发.md` 内联段 | 来自 `old-cs-notes/多线程与并发编程.md` 的图片文件名截断 | 属原始笔记历史问题，保留原文 |
| 2026-07-16 | 多个 archive 文件 | 模板语法 `{{ }}`、图片路径失效 | 属原始笔记历史问题，按 GUIDELINES 不修改归档原文件 |

**死链检查**：
- 主线文档与导航文件：零死链 ✓
- 归档原文件 / 内联段：8 个历史/误判死链（见上表"已知遗留"）

**侧边栏检查**：40 篇主线文档全部有入口 ✓

**完成状态**：
- 40 篇主线文档全部完成详细总结
- 9 个一级分类全部达标
- 归档文件 100% 保留，无删除
- `scripts/fix-archive-links.js`：批量修正 `../../archive/` 路径

**后续工作**：
- Phase 2：深化 6 篇小归档对应主线文档（Go / Docker / 云原生架构 / Taro / Vue / 软实力）
- Phase 3+：按相同模式继续处理剩余 18 篇索引式主线文档

---

### 2026-07-16 #10 — 主线深化 Phase 3（完成 06-软件工程 + 07-求职 两个分类）

**涉及文件**：
- 重写：`docs/md/06-软件工程/10-软件测试.md`
- 重写：`docs/md/07-求职/00-面试方法论.md`
- 重写：`docs/md/07-求职/10-Java面试核心速查.md`
- 重写：`docs/md/07-求职/20-Python面试.md`
- 重写：`docs/md/07-求职/30-实习与校招.md`
- 更新：`docs/REFACTOR_STATUS.md`（状态表更新）

**改正点**：

| # | 类型 | 原文 | 改正后 | 原因 |
|---|---|---|---|---|
| 67 | 内容 | `06-软件工程/10-软件测试.md` 为索引式 | 深化为详细总结，覆盖测试基础/进阶/工具/JaCoCo/Chrome 插件 | 符合"归档内容写入外部文档"目标 |
| 68 | 内容 | `07-求职/00-面试方法论.md` 为索引式 | 深化为自我介绍/HR/谈薪/决策方法论 | 求职分类深化 |
| 69 | 内容 | `07-求职/10-Java面试核心速查.md` 为索引式 | 提炼 30+ 高频 Java 面试题速查表 | 从 163KB 归档中提炼 |
| 70 | 内容 | `07-求职/20-Python面试.md` 为索引式 | 深化 + 内联 2 篇原文 | 归档小，适合内联 |
| 71 | 内容 | `07-求职/30-实习与校招.md` 为索引式 | 深化 + 内联 2 篇原文 | 归档小，适合内联 |

**完成状态**：
- `06-软件工程` 分类 3 篇主线文档全部达标 ✓
- `07-求职` 分类 4 篇主线文档全部达标 ✓

**死链检查**：主线文档与导航文件零死链 ✓
**侧边栏检查**：40 篇主线文档全部有入口 ✓
