#  多种虚拟环境的安装
[toc]
## 一、virtualenv

**优点：**

1. 使不同应用开发环境独立
2. 环境升级不影响其他应用，也不会影响全局的python环境
3. 可以防止系统中出现包管理混乱和版本的冲突

**安装：**

pip install virtualenv

**创建环境：**

virtualenv xxx (文件夹名称)

**进入环境：**

cd scripts；

activate.bat

**退出环境：**

deactivate.bat

## 二、virtualenvwrapper/ -win

**安装：**

pip install virtualenvwrapper-win

**创建环境：**

mkvirtualenv xxx(文件名)

**退出环境：**

deactivate

**查看当前虚拟环境：**

workon

**切换虚拟环境：**

workon xxx 
