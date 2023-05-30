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
- migrationexecutor类会通过apply()方法，遍历migration对象的operations属性来实现对数据库的映射。

## 2. Django内置orm框架

### settings环境变量的读取

1. 该类的初始化方法中，先在全局的配置模块（global_settings模块）中遍历大写的属性及其值并添加到该Settings对象中。这样Settings对象就具备了global_settings模块中的属性，并且其值和global_settings模块中的相同。
2. 之后再导入传入的settings_module模块，按同样的方式设置该Settings对象的属性。如果settings_module模块和global_settings模块中的属性有交叉，则以settings_module模块的为准（因为是后设置的）。接着是一些必须要设置的属性值，比如SECRET_KEY值等。如果不在settings_module模块中设置，即默认为空字符串，则会直接抛出异常。

### ORM框架的底层核心

1. 从父类BaseDatabaseWrapper的源码可以看到，首先初始化__init__()函数中的设置self.connection=None；其次在connect()函数中调用了self.get_connection_params()函数，以获取数据库的连接参数（如MySQL服务地址、端口、账号及密码等）；然后调用get_new_connection()函数获取连接对象并赋给self.connection；最后回到django/db/mysql/base.py中继续学习DatabaseWrapper类。由于在DatabaseWrapper类中并没有connect()函数，因此只有调用connect()函数（在父类中定义的该方法），才能给实例的connection属性赋值，而该值正是MySQLdb.connect()方法返回的数据库连接对象。
2. DatabaseWrapper类中定义的create_cursor()函数，在该函数中得到的cursor对象正是前面得到的数据库连接对象调用cursor()方法得到的结果，只不过其返回的结果对该游标对象进行了封装，得到CursorWrapper对象。这个CursorWrapper对象和mysqlclient中的cursor对象的功能几乎一致，只不过增加了对execute()函数和executemany()函数的异常处理。