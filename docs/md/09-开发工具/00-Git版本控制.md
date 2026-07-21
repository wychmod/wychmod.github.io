# Git 版本控制

> **原文归档**：[archive/old-git-notes/](../archive/old-git-notes/)
> 包含：2 篇笔记 + 1 个 xmind 思维导图

## 一、核心主题概述

Git 是目前最主流的**分布式版本控制工具**，用于对代码进行有效管理、支持多人协作开发，并完整保留项目的历史变更记录。

与 SVN 这类中心式版本控制工具不同，Git 的每个本地仓库都保存完整的项目历史，不依赖单一服务器。常见的 Git 代码托管平台包括：

- **GitHub**：全球最大代码托管平台，公开仓库免费，私有仓库收费。
- **码云（Gitee）**：国内平台，免费支持私有仓库。
- **其他平台**：如淘宝代码等。

版本号通常采用 `xx.yy.zz` 三段式：

- `xx`：大版本号，软件发生本质变化时递增。
- `yy`：小版本号，添加或完善功能时递增。
- `zz`：bug 版本号，修复 bug 或优化用户体验时递增。

> 💡 补充：2026 年现状下，GitHub 已广泛支持免费私有仓库，且国内访问有时需要借助代理或镜像；Git 已成为软件开发的事实标准，几乎所有 IDE 和 CI/CD 工具都内置支持。

## 二、Git 基础命令

### 2.1 获取仓库

- `git clone <url>`：将远程 Git 仓库克隆到本地。

### 2.2 查看状态

- `git status`：查看当前工作区和暂存区的状态。

### 2.3 添加变更

- `git add <file>`：将文件变更添加到暂存区。
- `git add -A`：添加所有变更文件。

### 2.4 提交变更

- `git commit -m "描述信息"`：将暂存区的内容提交到本地仓库，并添加提交说明。

### 2.5 推送与拉取

- `git push origin master`：将本地 master 分支推送到远程仓库。
- `git pull`：从远程仓库拉取最新代码并合并到当前分支。

### 2.6 查看历史

- `git log`：查看提交修改历史。

### 2.7 其他常用操作

- `.git` 目录：Git 的所有记录和配置都存储于此。
- `.gitignore` 文件：定义忽略规则，防止不想提交的文件进入版本控制（例如 PyCharm 生成的 `.idea` 目录）。

> 💡 补充：在 PyCharm 等 IDE 中，文件颜色有直观含义：未追踪（暗红色）、已 add（绿色）、已 commit（正常颜色）、已修改（蓝色）。

## 三、分支与合并

### 3.1 分支基础

分支在 Git 中非常轻量，本质上只是指向某个提交记录的指针。常用分支命令：

- `git branch <BRANCH_NAME>`：创建新分支。
- `git branch -a`：显示所有分支。
- `git checkout <BRANCH_NAME>`：切换分支。
- `git checkout -b <BRANCH_NAME>`：创建并切换到新分支。

不同分支之间的数据默认是隔离的，便于按逻辑拆分工作。

### 3.2 合并分支

- `git merge <BRANCH_NAME>`：将指定分支合并到当前分支。

Merge 会产生一个特殊的提交记录，具有两个父节点，表示“把两个父节点及其所有祖先都包含进来”。

### 3.3 Rebase

- `git rebase`：取出一系列提交记录并“复制”到另一个位置逐个放下。

Rebase 的优势是能创造更线性的提交历史，使代码库的提交记录看起来更加清晰。注意 rebase 会改写历史，应避免在已推送到远程的公共分支上频繁使用。

### 3.4 相对引用

为避免记忆完整的提交哈希值，Git 提供相对引用：

- `^`：向上移动 1 个提交记录。
- `~<num>`：向上移动多个提交记录，例如 `~3`。

示例：

```bash
git checkout master^        # 切换到 master 的父节点
git checkout HEAD~4         # 一次后退四步
git branch -f bugFix HEAD~2 # 将 bugFix 分支强制移动到 HEAD 前两步
```

### 3.5 分离 HEAD

HEAD 是对当前检出记录的符号引用，通常指向分支名。分离 HEAD 状态下，HEAD 可以直接指向某个具体的提交记录（通过 hash 值），而不指向分支。

## 四、协作流程

### 4.1 基本协作循环

1. 本地修改代码。
2. `git add` 将变更加入暂存区。
3. `git commit` 提交到本地仓库，并写好提交日志。
4. `git push` 将本地提交推送到远程仓库。
5. `git pull` 从远程拉取他人更新。

### 4.2 Fetch 与 Pull 的区别

- `git fetch`：从远程仓库下载本地缺失的提交记录，并更新远程分支指针（如 `o/master`），但**不会**修改本地分支或工作区文件，可理解为纯下载操作。
- `git pull`：先执行 `git fetch`，再执行 `git merge`，即将远程更新抓取并合并到本地分支。

> 💡 补充：`git fetch` 通常通过互联网使用 http:// 或 git:// 协议与远程仓库通信。对于现代项目，更多使用 HTTPS 或 SSH 协议。

## 五、Learn Git Branching 练习

`Learn Git Branching` 是一款可视化 Git 学习工具，核心练习点包括：

### 5.1 Git Commit

提交记录保存的是目录下所有文件的快照，并与上一个版本对比打包差异，同时保留历史记录。大多数提交记录都有父节点，形成提交树。

### 5.2 Git Branch

分支轻量，创建再多分支也不会造成明显存储或内存开销。按逻辑分解工作到不同分支，比维护臃肿的单分支更简单。

### 5.3 Git Merge

合并两个分支时产生双父节点的特殊提交记录。

### 5.4 Git Rebase

通过复制提交记录到新的基底位置，获得线性提交历史。

### 5.5 撤销变更

- `git reset HEAD~1`：向上回滚一个记录，改写历史。适合未推送的本地提交。
- `git revert HEAD`：创建一个新的提交来覆盖原来的更改，适合需要与他人分享撤销操作的场景。

### 5.6 整理提交记录

- `git cherry-pick <提交号>...`：将指定的提交复制到当前位置（HEAD）之下。
- `git rebase -i master~x`：交互式 rebase，以对话框/列表形式选择保留、删除、合并或调整提交顺序。

> 💡 补充：这些命令在 `Learn Git Branching` 中以可视化方式呈现，建议新手通过该工具建立对 HEAD、分支、merge、rebase 等概念的直觉。

## 六、2026 年现状

截至 2026 年，Git 仍是软件开发中不可替代的版本控制工具，主要现状如下：

1. **默认分支名称变化**：许多平台已默认使用 `main` 代替 `master`，但大量旧仓库仍保留 `master`。
2. **GitHub 免费私有仓库**：GitHub 已取消免费私有仓库的限制，个人和小团队普遍使用。
3. **身份验证方式**：密码验证已被淘汰，推荐使用 SSH 密钥或个人访问令牌（PAT）。
4. **签名提交（GPG/SSH）**：越来越多企业和开源项目要求对提交进行签名，以保证提交者身份可信。
5. **大文件管理**：Git LFS（Large File Storage）已成为游戏开发、设计协作等场景的标配。
6. **CI/CD 集成**：GitHub Actions、GitLab CI 等工具与 Git 工作流深度集成，push、merge、tag 等事件可直接触发自动化流水线。
7. ** trunk-based 与 Git Flow**：现代项目更倾向于 trunk-based 或简化版 Git Flow，feature branch、pull request/merge request 仍是主流协作方式。
8. **AI 辅助工具**：Copilot、Codeium 等 AI 编程助手常与 Git 工作流结合，自动补全提交信息、生成 PR 描述等。

> 💡 补充：虽然原文中部分示例仍使用 `master`，但在新创建仓库时建议统一使用 `main`，或在团队中明确约定默认分支名称。

## 七、常见坑与补充

1. **未配置用户信息就 commit**：Git 会报错并要求设置 `user.name` 和 `user.email`。建议全局配置：

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **误提交不应上传的文件**：如 `.idea`、编译产物、依赖目录（`node_modules`、`vendor` 等）应在 `.gitignore` 中声明。

3. **在公共分支上 rebase**：rebase 会改写提交历史，若他人已基于这些提交工作，则会造成混乱。建议仅在个人未推送的分支上使用 rebase。

4. **merge 冲突**：多人修改同一文件同一位置时会产生冲突，需要手动编辑并再次 `add` + `commit`。

5. **`git pull` 的隐式 merge**：`pull` 默认会执行 merge，可能产生不必要的合并提交。可以使用 `git pull --rebase` 来保持线性历史。

6. **忘记写提交信息**：`git commit` 未加 `-m` 会进入编辑器模式，需要保存并退出才能提交。

7. **远程分支与本地分支不同步**：经常 `git fetch` 查看远程状态，避免长期不同步导致 push 失败。

8. **依赖 IDE 但不懂命令**：IDE 的 Git 界面很方便，但理解底层命令有助于排查问题。

> 💡 补充：原文中提到的 `git merge commit` 写法不太规范，实际应为 `git merge <branch-name>`，表示将某分支合并到当前分支。建议以分支名作为 merge 参数，而非直接写 commit。

---

# 以下为原内容存档

## git命令笔记.md
# GIT

### 版本控制

1. 软件都会有一个版本号
   - xx.yy.zz
     - xx 大版本号，只有在我们软件发生了本质上的变化，
     - yy  小版本号，添加完善功能
     - zz  bug版本号，完善用户体验，修复bug
2. 需要对代码进行一个有效的管理
3. 可以多人同时开发一个项目
4. 常见版本控制
   - svn 
     - 版本控制工具
     - 中心式版本控制工具
   - git
     - 版本控制工具
     - 分布式版本工具
5. 常用Git代码托管平台
   - GitHub
     - 全球最大的代码托管平台
     - 各种程序，各种语言的代码
     - 比较干净的社区
     - 免费，公开
     - 收费，私有
   - 码云
     - 免费，私有
   - 淘宝代码





### Git基本使用

1. 依托于GitHub使用
   - 注册一个GitHub账号，注意就是需要在邮箱中激活一下
2. 获取Git仓库
   - git clone xxx
     - 将xxx中对应的git仓库进行检索下载
3. 使用PyCharm打开Git仓库
   - 在界面多了Version Control 这个模块
   - 在右击上也多了 Git这样一个菜单
4. 创建文件的时候，会提示是否添加到Git中
   - 如果文件是要上传的，需要其它人看的，你就添加到版本控制中
   - 如果文件就是自己用的，就没有必要上传了，也就没有必要添加到版本控制中
5. 写的代码基本都是需要添加版本控制中的，.idea 文件夹中的所有文件都是不需要上传的（这个PyCharm根据电脑相关信息生成的），每台电脑都是不一样的
6. 默认情况下，没有添加到Git中的文件是  暗红色
7. 添加到Git中，文件会变成绿色
8. 文件commit会回归正常颜色 
9. 当文件发生修改的时候，会变成蓝色的



### Git管理的代码结构

1. .git git的所有记录，配置都存储在.git中
2. .gitignore 忽略规则，不想提交的文件可以添加忽略规则中



### Git指令

1. git clone
2. git status
   - 查看git状态
3. git add 
   - 添加文件变更追踪
   - git add -A 
     - 添加所有变更文件
4. git commit
   - git commit -m "xxx"
     - 提交到本地仓库，并且添加xxx描述
5. git push
   - git push origin master
   - 默认是master主分支
   - 推送的时候，推送到原始的主分支上
6. git pull
   - 更新代码，拉取代码
7. 分支 branch
   - git branch  BRANCH_NAME 创建一个分支
   - git branch -a 显示所有分支
8. 切换分支
   - git checkout BRANCH_NAME
     - 切换分支
9. 分支中的数据是隔离开的
10. git log
    - 查看提交修改历史的
11. git merge 
    - git merge BRANCH_NAME
      - 合并一个分支





### 文件提交

1. 先add
2. 再commit
   - 需要检查提交
   - 添加提交日志
3. 将代码推送到远端





### 代码交互

1. 都是仓库和仓库的交互
2. 将代码提交到本地仓库
3. 再使用动作，将代码推送到远端
4. 从远端使用pull更新代码



### 快捷键

1. alt + enter 万能键，可以提示辅助你修复错误






## learn-git-branching.md
# learn-git-branching
## Git Commit
Git 仓库中的提交记录保存的是你的目录下所有文件的快照，就像是把整个目录复制，然后再粘贴一样，但比复制粘贴优雅许多！

Git 希望提交记录尽可能地轻量，因此在你每次进行提交时，它并不会盲目地复制整个目录。条件允许的情况下，它会将当前版本与仓库中的上一个版本进行对比，并把所有的差异打包到一起作为一个提交记录。

Git 还保存了提交的历史记录。这也是为什么大多数提交记录的上面都有父节点的原因 —— 我们会在图示中用箭头来表示这种关系。对于项目组的成员来说，维护提交历史对大家都有好处。

## Git Branch
> Git 的分支也非常轻量。它们只是简单地指向某个提交纪录 —— 仅此而已。

这是因为即使创建再多分的支也不会造成储存或内存上的开销，并且按逻辑分解工作到不同的分支要比维护那些特别臃肿的分支简单多了。

```git
git branch xxx
git checkout xxx
== 
git checkout -b xxx
```

## git merge
 > git merge。在 Git 中合并两个分支时会产生一个特殊的提交记录，它有两个父节点。翻译成自然语言相当于：“我要把这两个父节点本身及它们所有的祖先都包含进来。”
 
 ```bash
 git checkout -b bugfix
 git commit
 git checkout master
 git merge commit

 ```
 ![image.png](https://note.youdao.com/yws/res/3/WEBRESOURCE1b133973f12004598eb7566437f444f3)
 
 ## Git Rebase
 第二种合并分支的方法是 git rebase。Rebase 实际上就是取出一系列的提交记录，“复制”它们，然后在另外一个地方逐个的放下去。

Rebase 的优势就是可以创造更线性的提交历史，这听上去有些难以理解。如果只允许使用 Rebase 的话，代码库的提交历史将会变得异常清晰。

> 我们想要把 bugFix 分支里的工作直接移到 master 分支上。移动以后会使得两个分支的功能看起来像是按顺序开发，但实际上它们是并行开发的。

![image.png](https://note.youdao.com/yws/res/1/WEBRESOURCEf33d1f13bad20809ba0e7db1c100ca61)

## 分离head
HEAD 是一个对当前检出记录的符号引用 —— 也就是指向你正在其基础上进行工作的提交记录。

HEAD 总是指向当前分支上最近一次提交记录。大多数修改提交树的 Git 命令都是从改变 HEAD 的指向开始的。

HEAD 通常情况下是指向分支名的（如 bugFix）。在你提交时，改变了 bugFix 的状态，这一变化通过 HEAD 变得可见。
> head 可以根据hash值指向一个具体的提交，可以不指向分支。

## 相对引用
通过指定提交记录哈希值的方式在 Git 中移动不太方便。在实际应用时，并没有像本程序中这么漂亮的可视化提交树供你参考，所以你就不得不用 git log 来查查看提交记录的哈希值。

Git 对哈希的处理很智能。你只需要提供能够唯一标识提交记录的前几个字符即可。因此我可以仅输入fed2 而不是上面的一长串字符。

通过哈希值指定提交记录很不方便，所以 Git 引入了相对引用。

使用相对引用的话，你就可以从一个易于记忆的地方（比如 bugFix 分支或 HEAD）开始计算。
- 使用 ^ 向上移动 1 个提交记录
- 使用 ~<num> 向上移动多个提交记录，如 ~3

```python
# 切换到 master 的父节点
git checkout master^

# 一次后退四步
git checkout HEAD~4

# 将bugFix分支强制移动到HEAD前两步
git branch -f bugFix HEAD~2
```

## 撤销变更
在 Git 里撤销变更的方法很多。和提交一样，撤销变更由底层部分（暂存区的独立文件或者片段）和上层部分（变更到底是通过哪种方式被撤销的）组成。我们这个应用主要关注的是后者。

主要有两种方法用来撤销变更 —— 一是 git reset，还有就是 git revert。

**git reset 通过把分支记录回退几个提交记录来实现撤销改动。你可以将这想象成“改写历史”。git reset 向上移动分支，原来指向的提交记录就跟从来没有提交过一样。**
```python
# 向上回滚一个记录
git reset HEAD~1

# 新建一个新的提交，覆盖原来的更改
git revert HEAD
```

**为了撤销更改并分享给别人，我们需要使用 git revert**

![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE2f36b83add120f65181b21abbf6a02da)

新提交记录 C2' 引入了更改 —— 这些更改刚好是用来撤销 C2 这个提交的。也就是说 C2' 的状态与 C1 是相同的。

revert 之后就可以把你的更改推送到远程仓库与别人分享啦。

## 整理提交记录
### Git Cherry-pick
- git cherry-pick <提交号>...
- 如果你想将一些提交复制到当前所在的位置（HEAD）下面的话， Cherry-pick 是最直接的方式了。
```python
# Git 就将被它们抓过来放到当前分支下了。
git cherry-pick C2 C4
```
![image.png](https://note.youdao.com/yws/res/a/WEBRESOURCE806a57e3ed449322fb18458b0dffabca)

## 交互式的 rebase
- git rebase -i master~x
- 可以出现对话框ui方便你对之前的提交进行操作，选择保留或改变顺序

## Git Fetch
- 从远程仓库获取数据
- 从远程仓库下载本地仓库中缺失的提交记录
- 更新远程分支指针(如 o/master)
- git fetch 并不会改变你本地仓库的状态。它不会更新你的 master 分支，也不会修改你磁盘上的文件。
- 可以将 git fetch 的理解为单纯的下载操作。

> git fetch 通常通过互联网（使用 http:// 或 git:// 协议) 与远程仓库通信。

## Git Pull
- 先抓取更新再合并到本地分支这个流程很常用,git pull
- git pull = git fetch + git merge

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-07-22 | 审查 | 全面审查，核心内容完备（Git 命令正确、2026 现状描述准确、存档区保留原貌） |
