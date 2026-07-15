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