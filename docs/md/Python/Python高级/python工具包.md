# python 工具包
[toc]
## glob.glob
**返回所有匹配的文件路径列表。它只有一个参数pathname，定义了文件路径匹配规则，这里可以是绝对路径，也可以是相对路径。下面是使用glob.glob的例子：**
```
import glob

#获取指定目录下的所有图片
print (glob.glob(r"/home/qiaoyunhao/*/*.png"),"\n")#加上r让字符串不转义

#获取上级目录的所有.py文件
print (glob.glob(r'../*.py')) #相对路径
```
## subprocess
**subprocess 模块允许我们启动一个新进程，并连接到它们的输入/输出/错误管道，从而获取返回值。**
```
import subprocess
def runcmd(command):
    ret = subprocess.run(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8",timeout=1)
    if ret.returncode == 0:
        print("success:",ret)
    else:
        print("error:",ret)


runcmd(["dir","/b"])#序列参数
runcmd("exit 1")#字符串参数
```
run 方法调用方式返回 CompletedProcess 实例，和直接 Popen 差不多，实现是一样的，实际也是调用 Popen，与 Popen 构造函数大致相同

## 生成requirements.txt
```
# 安装
pip install pipreqs
# 在当前目录生成
pipreqs . --encoding=utf8 --force
```