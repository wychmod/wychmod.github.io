# 归档目录索引

> **作用**：记录所有归档文件的**来源映射**（新文档 ← 原始文件）。
> **配套文档**：
> - [`REFACTOR_PLAN.md`](../../REFACTOR_PLAN.md) — 整体重构方案
> - [`REFACTOR_GUIDELINES.md`](../../REFACTOR_GUIDELINES.md) — 合并工作规范
> - [`CORRECTIONS.md`](../../CORRECTIONS.md) — 改正记录台账
>
> **目录规则**：
> - 归档目录在 `docs/md/archive/` 下，**不进侧边栏导航**
> - 子目录命名：`{来源类型}-{来源名称}/`（如 `old-crawler-notes/`、`courses-奈学-ML-DL/`）
> - 原文件**保持原貌**（错别字、风格、过期信息全部保留），所有改正在主线新文档中完成

---

## 归档来源映射

> 每个归档子目录都对应一个主线新文档或一次合并操作。

| 主线新文档 | 归档目录 | 来源文件数 | 归档时间 | 备注 |
|---|---|---|---|---|
| [`md/08-过时技术/00-爬虫技术.md`](../08-过时技术/00-爬虫技术.md) | `old-crawler-notes/` | 2 | 2026-07-14 | 首篇重构示范 |
| [`md/08-过时技术/10-Electron桌面开发.md`](../08-过时技术/10-Electron桌面开发.md) | `old-electron-notes/` | 1 | 2026-07-14 | 1 篇实操笔记 + 7 张图 |
| [`md/08-过时技术/20-Hadoop-Spark大数据.md`](../08-过时技术/20-Hadoop-Spark大数据.md) | `old-hadoop-spark-notes/` | 16 | 2026-07-14 | 含 1 docx(跳过) + 10 note + 5 图 |
| [`md/08-过时技术/30-NLP与聊天机器人.md`](../08-过时技术/30-NLP与聊天机器人.md) | `old-nlp-notes/` | 1 docx + 1 md + 74 图 | 2026-07-14 | docx 11MB 用 pandoc 转 md + 74 图 |

---

## 归档目录结构

```
md/archive/
├── README.md                                ← 本文件
├── old-crawler-notes/                       ← 爬虫（过时）
│   ├── 1.爬虫基础知识.md
│   └── 2.scrapy和xpath基础知识.md
├── old-electron-notes/                      ← Electron（过时）
│   └── electron开发初步——开发一个音乐播放软件.md
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
├── courses-奈学-ML-DL/                      ← 待办
├── courses-九章算法/                        ← 待办
├── courses-左神算法/                        ← 待办
├── courses-技术胖-React/                    ← 待办
├── courses-Linux核心技能/                   ← 待办
├── books-动手学深度学习/                    ← 待办
├── books-Python源码剖析/                    ← 待办
├── books-系统设计PDF/                       ← 待办
├── old-spring-tutorials/                    ← 待办
├── old-flask-tutorials/                     ← 待办
├── old-react-tutorials/                     ← 待办
├── notes-个人写作/                          ← 待办
├── obsolete-pdf-mq9-rocketmq/              ← 待办
├── software-testing-bin/                    ← 待办
└── macos-tools/                             ← 待办
```

---

## 归档原则

### 原文件改动规则

- ✅ **保留**：错别字、过时信息、个人风格、英文拼写错误、重复内容
- ❌ **不改正**：所有改正在主线新文档中完成
- ❌ **不删除**：原文件即使"过时"也保留，作为知识演化的痕迹

### 何时归档

满足任一即归档：

1. 多份相似内容合并为 1 篇主线文档
2. 内容主题过时被替代（但仍可能有学习价值）
3. 内容已并入更系统的主线文档
4. 课程笔记、书摘等"参考性"内容

### 不归档的情况

- 主线文档的"参考引用"（用相对链接）
- 图片、PDF 等资源文件
- `.obsidian/` 等 IDE 配置
- `tools/` 等独立子站
