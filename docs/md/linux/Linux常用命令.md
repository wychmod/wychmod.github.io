# linux常用命令

## 一、linux文件系统结构

   ~~~
   sudo apt-get install tree
   tree --help  #查看帮助
   tree -L 1  #显示文件目录
   ~~~

   ~~~
root@ubuntu16 /# tree -L 1
.           #系统根目录
├── bin     #存放常见的命令
├── boot    #系统启动文件和核心文件都在这个目录
├── cdrom   #光驱
├── dev     #存放设备文件，包括硬盘、光驱、键盘、鼠标等
├── etc     #系统配置文件都在这个目录下
├── home    #普通用户的家目录
├── lib     #系统链接库
├── lib64   #64位的链接库
├── lost+found   #系统自动生成的，如果文件系统出错，会在目录下产生文件，记录错误
├── media        #系统自动挂载的光驱、usb等
├── mnt          #mount简写 挂载其他文件系统
├── opt          #可在此安装第三方软件 
├── proc         #系统进程的信息、系统状态信息
├── root         #超管的目录
├── run          #进程运行数据
├── sbin         #管理员的命令，普通用户无法使用
├── srv          #服务信息
├── sys          #系统相关
├── tmp          #临时目录，所有用户都具有读写权限
├── usr          #unix software resource  用户的软件安装到这个目录
|    ├── bin     #应用程序的可执行文件
|    ├── sbin    #用户或超管的标准命令
|    ├── local   #管理员安装的应用程序目录
|    └── share   #共享文件目录
└── var          #存放不断扩充的文件。比如数据库文件、日志文件
     ├── log     #日志目录，各种应用的日志
     └── run     # /run的软连接
   ~~~


## 二、常见命令

1. ls

   列出目录下的文件或子目录

   ~~~shell
   ls [参数]    #中括号表示可选
   ls  -l    #以列表方式显示文件的详细信息
   ls  -a   #显示隐藏文件，隐藏文件的文件名以.开头
   ls  -al  #

   ls --help #查看命令参数
   ~~~
   ~~~shell
   drwxr-xr-x  2 python python     4096 3月  28 11:20 Templates
   drwxr-xr-x  2 python python     4096 3月  28 11:20 Videos
   ~~~


   第一部分：表示文件类型  d代表目录，-代表普通文件，l代表软连接
   第2部分，2-10列代表文件的权限：rwxr-xr-x.
   第3部分：数字代表文件的链接数
   第四部分：root代表文件的所有者
   第5部分：root表示文件属于哪个用户组
   第6部分：数字的表示文件大小，以字节为单位
   第7部分：时间，表示文件的修改时间
   第8部分：文件名
   ~~~

   ~~~shell
   #文件权限
   drwxr-xr-x.  2 root root 4096 Nov 20 07:36 tmp
   r：read  可读
   w：write 可写
   x：excute  可执行
   -：表示无权限

   权限：
       2-4位   ower  文件的所有者    
       5-7位   group：用户组
       8-10位  other：其他用户

   ~~~

2. ll

   ~~~
   以列表方式显示，其实是ls -l的别名
   白色代表普通文件
   绿色代表可执行文件
   蓝色代表目录
   ~~~

3. man命令

   ~~~shell 
   #命令的帮助文档
   sudo apt-get  install man
   #用法：
      man  命令名
   常用的快捷键
   空格 f     下翻页
   b          上翻页
   shift + g   到文件末尾
   g         文件开头
   q         退出
   上下箭头   前翻和后翻
   回车键     后翻
   home      回到开始
   ~~~

4. history命令

   查看你敲过的命令

5. 硬链接和软连接

   文件都有文件名与数据，这在 Linux 上被分成两个部分：用户数据 (user data) 与元数据 (metadata)。用户数据，即文件数据块 (data block)，数据块是记录文件真实内容的地方；而元数据则是文件的附加属性，如文件大小、创建时间、所有者等信息。在 Linux 中，元数据中的 inode 号（inode 是文件元数据的一部分但其并不包含文件名，inode 号即索引节点号）才是文件的唯一标识而非文件名。文件名仅是为了方便人们的记忆和使用，系统或程序通过 inode 号寻找正确的文件数据块。

   为解决文件的共享使用，Linux 系统引入了两种链接：硬链接 (hard link) 与软链接（又称符号链接，即 soft link 或 symbolic link）。链接为 Linux 系统解决了文件的共享使用，还带来了隐藏文件路径、增加权限安全及节省存储等好处。

   -   一个 inode 号对应多个文件名，则称这些文件为**硬链接**

   ~~~
   link 源文件名 新文件名 
   ln 源文件名 新文件名 

   stat 文件名 #查看文件信息
   ls -i  #查看目录下文件的硬链接数
   python@ubuntu:/csl$ ls -la
   total 4
   913923 lrwxrwxrwx. 1 root root    5 Mar 18 16:20 2.txt -> 1.txt
   913926 -rw-r--r--. 2 root root    0 Mar 18 19:58 31.txt
   913926 -rw-r--r--. 2 root root    0 Mar 18 19:58 32.txt
   913925 -rwxr-xr-x. 1 root root    0 Mar 18 17:29 5.txt
   913924 drwxr-xr-x. 2 root root 4096 Mar 18 17:29 test

   # 硬链接的特点：
      1.只能对已存在的文件进行创建；
      2.不能交叉文件系统进行硬链接的创建；
      3.不能对目录进行创建，只可对文件创建；
      4.删除一个硬链接文件并不影响其他有相同inode 号的文件。

   ~~~


   -   软连接	

软链接与硬链接不同，若文件用户数据块中存放的内容是另一文件的路径名的指向，则该文件就是软连接。软链接就是一个普通文件，只是数据块内容有点特殊。软链接类似快捷方式

~~~~
ln -s 源文件 目标文件。
   
软连接的特点：
   软链接有自己的文件属性及权限等；
   可对不存在的文件或目录创建软链接；
   软链接可交叉文件系统；
   软链接可对文件或目录创建；
   创建软链接时，链接计数 i_nlink 不会增加；
   删除软链接并不影响被指向的文件，但若被指向的原文件被删除，则相关软连接被称为死链接
~~~~


   ​

## 三、目录管理

1. 绝对路径和相对路径

   linux的目录和windows不同，不区分盘符，只有一个根目录，根目录用/表示。

   - 绝对路径：从根目录到当前文件（目录）的路径，比如：/home/python
   - 相对路径：以当前目录为基准，表示上级目录或子目录
     - 用 . 表示当前目录，一般执行shell脚本可以用 . 1.sh或者 ./1.sh
     - 用..表示上级目录 
   - linux目录分隔符只能用正斜线（/）表示
   - 用 ~ 表示用户主目录，用 - 表示来源目录（你从哪个目录切换到当前目录的）

2. 目录切换

   ~~~
   cd 目录名  #切换目录
    .  #当前目录
    ..  #代表上级目录
    /   #代表根目录
    ~   #用户家目录  root用户的家目录/root   普通用户的家目录/home/用户名
    cd /etc/yum.repos.d
    cd / #切换到根目录
    cd -  #切换到来源目录
    cd ~ #返回用户的家目录
    
    pwd #显示当前的目录名
   ~~~

3. 提示信息

   ~~~
   [root@localhost ~]# cd /
   [root@localhost /]$
   root代表用户名
   localhost 主机名
   ~ 用户的家目录
   /  根目录
   # 表示超级管理员在操作
   $ 普通用户在操作
   ~~~

4. 创建目录   

   ~~~
   sudo mkdir  目录名
   sudo mkdir -p  目录名    #递归创建目录
   sudo mkdir -p  h1801/1/2
   sudo mkdir -p  1/{2,3}/{4,5,6} #
   ~~~

5. 删除目录  rmdir

   ~~~
   sudo rmdir [option]  目录名    #删除的时候目录必须为空
   sudo rmdir -p  目录名   #递归删除空目录
   sudo rmdir -p 1/2/3 #1,2,3目录都必须不能有文件
   ~~~
   ​

## 四、文件操作

1. 文件创建  

   ~~~
   sudo touch  文件名 [文件名2] [文件名3]....   #创建多个空文件,如果文件存在，自动忽略，不会覆盖
   echo 'hello world'  > 1.txt   #可以将显示内容输出到文件，但会覆盖原来的内容，文件不存在则创建
   echo '世界，你好'    >> 1.txt  #将显示内容追加到文件末尾，文件不存在则创建
   # >  >> 输出重定向
   ~~~

2. 文件移动

   ~~~
   sudo mv 源文件   目标文件   #销毁原件
   sudo mv  1.txt  ./lpl/  #将1.txt移动到字目录lpl下，文件名不变
   sudo mv  1.txt  2.txt   #如果在同一个目录就是文件重命名  将1.txt重命名为2.txt
   ~~~

3. 文件拷贝

   ~~~
   sudo cp 源文件   目标文件
   sudo cp -r  源目录   目标目录   #递归拷贝目录
   ~~~

4. 文件删除

   ~~~
   sudo rm  文件名  
   sudo rm -i 文件名  #删除前逐一确认
   sudo rm  -f  文件名   #删除文件不带提示
   sudo rm -rf  目录名   #递归删除目录
   ~~~

5. 文件查看

   ~~~shell
   cat  文件名       #输出文件内容，从前往后输出，
   tac   文件名      #cat的反写，从后往前输出
   head -n N  文件名   #显示文件的前几行，可以指定查看的行数，默认显示10行
   tail -n N 文件名   #显示文件的最后几行，可以指定查看的行数
   tail -f  cat 文件名   #实时显示文件内容
   watch -d -n 秒杀 cat 文件名  #实时显示文件内容 有高亮
   sudo vi  文件名   
   more  文件名       #从前往后查看，可以翻屏 ,不能往前翻  回车一行行查看，空格翻屏  q退出
   less  文件名       #和more类似，可以前翻页，g首页 G尾页，b前翻页，空格和f后翻页，q退出
   stat  文件名       #查看文件详细信息

   stat 2.txt
     File: `2.txt'
     Size: 146       	Blocks: 8          IO Block: 4096   regular file
   Device: fd00h/64768d	Inode: 913936      Links: 1
   Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
   Access: 2017-11-21 00:44:49.108999194 -0500
   Modify: 2017-11-21 00:44:43.773000078 -0500
   Change: 2017-11-21 00:44:43.775000065 -0500

   ~~~

6. 文件查找

   - find

   ~~~
   # find 用于在系统内搜索指定文件
   用法：
      find [路径] [参数]
        -name  按文件名查找
        -mtime +/-n  #-n表示n天以内修改的文件，+n表示修改超过n天的文件
        -user   #按文件属主查找
        -size [+/-]n[c/k/M/G] #查找文件长度为n块，+表示大于，-表示小于；c是字节 
        -perm 权限数值    #按照文件权限进行查找
        
   find /  -name  "文件名"  		 #从根目录查找指定文件名的文件
   find /csl/sh1702 -name "2.txt"  #查找指定目录先的文件
   find /tools -mtime -3           #查找tools目录下修改时间是3天以内的文
   find /tools  -size 12c 		   #查找长度为12字节的文件
   find /var ‐perm 0642 ‐size +10k ‐size ‐100k ‐name '*.log' #在/var目录下，查找10-100k

   grep  hello  2.txt  #查找文件内容

   ls -al | grep 1.php    # |管道操作，将ls -al操作结果传递给grep，grep 在查找结果搜索指定文件名
    
    which 命令名   #查找命令
    whereis  文件名     #只能搜索命令、源文件、二进制文件
   ~~~
   - grep

   ~~~
   #grep 用于搜索文件内容
   用法：
      grep [options] 'pattern' filename
        -i  不区分大小写
        -r  递归查找子目录
        -l  列出文件内容符合指定的范本样式的文件名称。
        -n  显示行号
        -w  只匹配单词，不是匹配单词一部分
        -E 按正则表达式搜索
        --include '*.py'  #仅搜索py文件
        --exclude '*.py'  #不搜索py文件
      
      #只在目录中所有的.php和.html文件中递归搜索字符"echo"
      grep "Root" -w -n -i /etc/passwd

   ~~~

7. 文件内容统计（wc）

   ~~~
   用法：
      wc [options] [文件列表]
         -l  统计有多少行
         -w  统计有多少单词
    $ wc -l  /etc/passwd  #统计passwd有多少用户
   ~~~

   ​

8. awk

   awk就是把文件逐行的读入，以空格为默认分隔符将每行切片，切开的部分再进行各种分析处理。

   ~~~
   语法：awk '{pattern + action}' {filenames}
   cat /etc/passwd |awk  -F ':'  '{print $1}'   #$1显示第一列  -F 指定分割符为':'
   ~~~

   ​

9. sort

   sort将文件/文本的每一行作为一个单位，相互比较，比较原则是从首字符向后，依次按[ASCII](http://zh.wikipedia.org/zh/ASCII)码值进行比较，最后将他们按升序输出。

   ~~~
   sort(选项)(参数)
   选项：
      -u忽略相同行
      -k 按指定列排序
      -n 按数值排序
      -t 分割符
      -r 逆序
    #指定passwd文件按第三列 的数值比较，列之间的分隔符为：
    cat /etc/passwd | sort -n -t ':' -k 3  
   ~~~

   ​

## 五. 文件权限

   1.文件权限修改

   ```
   -rwxr-xr-x.  1 root root   24 Nov 21 20:26 1.sh
   -rw-r--r-x.  1 root root    0 Nov 20 07:37 1.txt
   -rw-r--r--.  1 root root    0 Nov 20 07:37 2.txt

   #1.数字表示
   r  4 100   读
   w  2 010   写
   x  1 001   执行
   -  0       没有权限
   rwx   7 可读可写可执行
   rwxrw-r-- 764  文件拥有者可读可写可执行  文件所属的组可读可写  其他人可读

   #2.符号表示
   u  表示文件的拥有者 
   g  文件所属的组
   o  其他人
   a  所有的人  all

   u+/-/=  u=rwx  g+x  o-r
   + 表示增加权限
   -  削减权限
   =  赋权限
   chmod o-x 32.txt   #削减其他用户的可执行权限
   chmod a=rwx 32.txt  #给所有人赋可读可写可执行权限
   chmod o+x,g+w 32.txt
   chmod o=x 32.txt
   ```

   - chmod 

         ~~~
        用法：
            chmod  权限  文件名/目录
            chmod  -R  权限  目录  递归修改目录及其子目录的所有文件的权限

         #数字表示
         chmod 641  1.sh  
         
         #符号表示
         chmod a=rwx 1.sh
         chmod g-w 1.sh
         chmod -R  o+w tmp   #递归修改tmp及其子目录中所有文件的权限
         ~~~


2. chown(change owner) 修改文件的所有者

    ~~~
    要求：所有者必须在/etc/passwd文件中

         chown 用户名  文件名/目录名 
         chown 用户名:组名  文件名/目录名
         chown :组名  文件名/目录名
         chown -R 用户名  文件名/目录名
         
         chown csl 1.sh
         chown csl:csl 1.sh  #修改用户和所属组
    ~~~

3.  修改用户组 chgrp(change group )


         chgrp 组名  文件名/目录名
         chgrp -R 组名  文件名/目录名
         chgrp -R csl tmp  #递归修改tmp及其子目录下文件所属组  

4. lsattr/chattr 修改和查看文件只读属性

    lsattr  文件名   查看文件的只读属性,使用ls无法查看
    chattr +/-i 文件名  给文件增加或去除只读属性
    chattr +/-a 文件名  只能追加数据，不能修改或删除
    lsattr 3.py  #3.py有只读属性
    ----i--------e- 3.py

    chattr -i 3.py  #去掉只读属性
    chattr +i 3.py  #添加只读属性

 ## 六.  用户管理
   1. 用户和组

       - 一个用户必须有一个主组
       - 一个用户可以有多个组
       - 一个组可以有多个用户
       - 用户账户的信息存放在/etc/passwd文件中；用户的密码存放到/etc/shadow，该文件只有root可以修改；组账户信息存放到/etc/group中

   2. useradd 添加一个用户

       ~~~
       用法：
          useradd [-gud] 用户名  
            -g 指定主组名或组id
            -u 指定用户的id
            -m 自动建立用户主目录
            -d 指定用户的家目录
            -s 指定用户登录后使用shell，默认是/bin/bash
          #创建一个用户没有指定组，则默认创建一个和用户名一样的组，作为用户的主组

       所有的用户都在/etc/passwd文件中
       luoming:x:501:501::/home/luoming:/bin/bash
       用户名  密码 用户id  用户所属组的id  用户的家目录   shell
                     uid     gid
       #Ubuntu 特别提供了一个adduser 命令以交互模式创建用户，
       adduser csl
       ~~~

​

3. 删除用户 userdel

~~~
userdel -r 用户名  删除用户同时删除家目录（家目录要和用户名一致才能删除）
#如果用户登录了无法删除，应该先切换用户，然后kill -9 用户进程号，然后在删除
~~~
4. 修改用户信息  usermod

       usermod [option]  用户名
            -u  用户id
            -g  主组id
            -G  附属组名称
            -a  将用户添加到附属组，必须与-G配合使用
            -d  用户的家目录
            -l  用户登录名
          sudo usermod -u 1001 -g 999 -l lkz  liwenkai
          sudo usermod -a -G csl python  #将用户python添加到附属组csl中
          sudo usermod -l newusername  oldusername #修改用户名

5.  修改用户密码

    用法：
        passwd [-lu] 用户名
           -l 锁定账户密码
           -u 解锁账户密码
     root 可以修改其他用户的密码
     普通用户只能修改自己的密码

6. su和sudo

​    Ubuntu默认禁止使用root账户，在系统安装的时候，创建的第一个用户作为管理员（属于sudo组），其权限要低于root，但比普通用户高，普通用户只能处理自己创建的东西，管理员可以安装软件、修改日期、删除用户等。在Ubuntu中一般看到提示符是$，当执行需要root权限操作的时候需要提升权限，我们可以使用sudo暂时提升用户权限

   我们也可以使用sudo切换用户身份，可以切换到root或管理员，完成工作后再切换回来

```shell
用法：
   sudo  命令  #需要输入用户自己的密码
   
用法：   
   su    用户名  #需要输入目标用户的密码
root切换到普通用户不用输入密码
普通用户切换，必须输入密码
因为Ubuntu默认提供root密码，不能直接由su切换到root，可以先使用sudo来获取root权限
$ sudo su root  #临时切换到root

#启用root账户
$ sudo password root #根据提示为root输入密码
```

7.其他命令

- id  查看用户的id和组信息
- groups查看用户的组
- whoami 查看当前的用户是谁 

 ## 七.  组管理

     #添加一个组
     groupadd 组名
          
        1702:x:1001:
        组名 密码  gid
     groupdel  组名  #删除组
     groupmod  -n 新组名  旧组名
     groups 显示用户的组
     
     #所有的组信息都在/etc/group文件中记录
