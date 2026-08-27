# Maven 与构建工具

> 预计阅读：约 5 分钟（正文约 1371 字）
> 阅读建议：建议先通读标题和小节，表格与代码可按需跳读，文末原文归档适合查漏补缺。

## 一、核心概述

Maven 是 Java 生态主流的项目构建与依赖管理工具。本文沉淀的核心知识点是 **Maven Wrapper（mvnw）**：Apache Maven 官方提供的辅助脚本，让项目自带"获取正确版本 Maven"的能力，使用者无需预先安装 Maven。

## 二、Maven Wrapper

### 2.1 是什么

Maven Wrapper 是一组随项目提交的脚本，代替系统全局安装的 `mvn` 命令。它在项目里加入三个文件：

| 文件 | 作用 |
|---|---|
| `mvnw` | Linux/macOS 用的 shell 脚本 |
| `mvnw.cmd` | Windows 用的批处理脚本 |
| `.mvn/wrapper/maven-wrapper.properties` | 声明该项目需要的 Maven 版本与下载地址 |

### 2.2 工作机制

任何人 clone 项目后，直接运行 `./mvnw`（Windows 上是 `mvnw.cmd`），脚本会：

1. 读取 `.mvn/wrapper/maven-wrapper.properties` 里声明的 Maven 版本；
2. 若本机没有该版本，自动下载并解压到本地 Maven 发行版目录；
3. 用这个指定版本的 Maven 执行后续命令。

即 `mvnw.cmd clean install` 等价于"先确保指定版本的 Maven 存在，再用它执行 clean install"。

### 2.3 解决什么问题

| 对比维度 | 没有 Wrapper | 有 Wrapper |
|---|---|---|
| 版本一致性 | 每人自己装 Maven，版本可能各不相同 | 所有人用项目锁定的同一版本 |
| 新人上手 | 要先配置环境 | clone 下来直接 `./mvnw` 就能构建 |
| CI 服务器 | 要单独维护 Maven 版本 | CI 也用 `mvnw`，与本地完全一致 |
| 版本升级 | 通知所有人改本机 | 改 properties 文件提交即可，全组生效 |

### 2.4 常用命令

```bash
# 给项目添加（或升级）Wrapper —— 需要本机已有任意版本的 Maven
mvn wrapper:wrapper

# 指定 Maven 版本
mvn wrapper:wrapper -Dmaven=3.9.11

# 只生成脚本、不生成 jar 的精简模式（3.2.0+ 默认）
mvn wrapper:wrapper -Dtype=only-script

# Windows 上构建项目，无需安装 Maven
mvnw.cmd clean install

# Linux/macOS
./mvnw clean install
```

## 三、与 Gradle Wrapper 的关系

Gradle 项目里的 `gradlew` 是完全相同的思想：把"构建工具的版本"也纳入项目自身的版本管理。Maven Wrapper 是 Maven 生态对 Gradle Wrapper 的对标实现。

## 四、常见坑与最佳实践

- **先有鸡问题**：`mvn wrapper:wrapper` 本身需要本机已装任意版本的 Maven 才能执行；之后团队其他成员就不再需要安装了。
- **Wrapper 文件必须提交到版本库**：`mvnw`、`mvnw.cmd`、`.mvn/` 目录漏提交会导致他人无法使用。
- **升级 Maven 版本**：改 `.mvn/wrapper/maven-wrapper.properties`，或重新执行 `mvn wrapper:wrapper -Dmaven=<版本>`。
- **供应链安全**：对下载来源有要求的场景，可用 `-DdistributionSha256Sum` / `-DwrapperSha256Sum` 校验发行版与 wrapper jar 的完整性。
- **CI 一致性**：CI 流水线也应调用 `mvnw` 而非裸 `mvn`，保证与本地构建同版本。

---


## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-22 | 新增 | 建立文档，沉淀 Maven Wrapper 机制、文件构成、对比价值与常用命令 |
| 2026-08-26 | 重构 | 统一前置阅读时间/建议，原文归档移至文末 |
