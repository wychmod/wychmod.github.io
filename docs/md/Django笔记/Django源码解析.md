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
（4）通过self.handle_template()函数得到生成Django项目的模板文件所在目录。