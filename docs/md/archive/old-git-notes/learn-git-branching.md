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