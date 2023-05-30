## 1. Django命令原理解析

### 命令通用实现

1. 通过find_commands()函数会返回Django支持的所有命令列表
2. 在load_command_class()函数中输入一个包路径和命令名，该函数会返回在具体命令文件中定义的Command对象
3. 通过解析命令行参数进行验证和提取，判断出当前是哪个方法，然后通过load_command_class()获得command对象。
4. command对象继承TemplateCommand，实现了handle()方法。

### startproject 实现
![](../youdaonote-images/Pasted%20image%2020230529165201.png)
（1）handle()方法校验项目的名称（first_django）是否合法。它的核心是isidentifier()方法。
（2）handle()方法根据target参数刞断是否创建项目。如果target参数为None，则取当前目录加上要创建的项目名称（这里是first_django）创建项目目录。
（3）extensions为元组，使用其默认值即可，即（'.py'，）。
（4）通过self.handle_template()函数得到生成Django项目的模板文件所在目录。查看该目录发现目录下文件结构如下：
![](../youdaonote-images/Pasted%20image%2020230529165759.png)
（5）遍历得到该目录下的所有模板文件，进行渲染并写到最终的位置。

![](../youdaonote-images/Pasted%20image%2020230529165954.png)

这两句代码会调用Django中的模板层引擎执行渲染动作。为了更好地理解这两句代码，我们进行如下测试：

![](../youdaonote-images/Pasted%20image%2020230529170009.png)

### shell 实现
- shell 会通过调用handle()方法中的python()方法或者ipython bpython，来形成一个输入命令行的环境，里面导入一些可以用行django项目的环境变量已经必须初始化加载的环境，等于是加强原生命令行的python。相当于django.setup()

### makemigrations实现
- 会连接一个django_migration表，对表进行查验生成迁移文件。也会对迁移文件进行对比验证。
- 也会根据model模型构建依赖关系

### migrate实现
- 实例化migrationexecutor类，可以进行一致性检测，冲突检测和解析迁移文件。
- 迁移时会根据依赖关系，先迁移依赖模型，再迁移自身。