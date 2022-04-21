# Linux的安装与配置
[toc]
> ## 初相识linux
- 品牌手机与电脑,为其提供服务的服务器基本都是 Linux系统
- Android系统的底层用的是修改过的 Linux内核
- 全球500台最快的超级计算机中,100%采用 Linux系统
- Unix是1969年(就1970年)诞生的
- 操作系统是你的电脑和应用程序之间的连接工具
- Windows, macos和 Linux是最常用的操作系统
> ## linux的不同发行版
- ### GUN
- GNU在英语里是“牛羚”的意思
- GNU是“ GNU is Not Unix"("GNU不是Unix")的递归缩写
- 1984年, Richard Stallman(理査德斯托曼)创立了GNU项目
- GNU项目在当时的首要目的是创立一个类Unix的操作系统
- Unix不是免费的,是商用软件
- ### 自由和免费的有什么区别呢？
- 自由的软件意味着源代码必须公开
- 自由的软件大部分时候是免费的,但也可以复制,修改和出售
- 自由运动的口号是:“团结就是力量
- ### Linux
- 1991年 Linus Torvalds在业余时间编写了一个类Unix的内核
- Linux这个名字可以说是 Linus和Unix的合并
- Linux也可以说是" Linux Is Not Unix"的递归缩写
- ### Linux和GNU项目的联系
- 这两个项目是互补的: Linus其实就是写了一个类Unix的内核
- 1991年,GNU项目已经创建了不少操作系统的外围软件了
- GNU的软件:cp命令,rm命令, Emacs,GCC,GDB,等
> ## 虚拟机安装CentOS
- ### 虚拟技术/虚拟化(Virtual lization)
- 一种通过组合或分区现有的计算机资源(CPU、内存、磁盘空间等)
- 使得这些资源表现为一个或多个操作环境
- 从而提供优于原有资源配置的访问方式的技术
- ### 安装virtualbox
- Virtual Box是一款开源虚拟机软件,免费
- https://www.virtualbox.org
- 可虚拟很多操作系统,如 Windows、 macos、 Linux、 Android
- ### 安装CentOS
- 先下载CentOS
- 之后virtualbox一键安装，创建以后不断地点，或者直接vagrant up
- Centos安装到 Virtual Box后,强烈建议安装 Virtual Box增强功能
- 还要记得设置共享文件夹,以便和宿主机共享文件
