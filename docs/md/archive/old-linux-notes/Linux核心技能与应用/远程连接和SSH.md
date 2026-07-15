# 远程连接和SSH

> ## FTP协议
- 其他常见的网络协议有FTP
- 是英语 File Transfer Protococol的简称,表示“文件传输协议"
- 站长常用FTP把文件(如网站的源代码)传输到网站服务器上
> ## Shell协议
- 它类似于DOS下的 command(“命令”)和后来的cmd.exe
- 它接收用户命令,然后调用相应的应用程序
- Linux下有Bash等Shell程序
- 在计算机科学中,shell俗称"売"
- 用来区别于“核”( kernel),一个是外壳,一个是核心
- 是指“提供用户使用界面”的软件(命令解析器)
> ## RSA算法
- RSA加密算法是一种非对称加密算法。
- 对极大整数做因数分解的难度决定了RSA算法的可靠性。
- 世界上还没有任何可靠的攻击RSA算法的方式。只要其钥匙的长度足够长，用RSA加密的信息实际上是不能被解破的。
> ## 服务器安装ssh
- 安装SSH: yum install openssh- server
- 启动SSH: systemctl start(或 restart) sshd
- 设置开机运行SSH: systemctl enable sshd
> ## SSH 安装/ config 配置以及免密码登录
[SSH 安装/ config 配置以及免密码登录](https://blog.csdn.net/weixin_33688840/article/details/93568825)