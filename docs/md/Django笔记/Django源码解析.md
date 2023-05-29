## Django命令原理解析

1. 通过find_commands()函数会返回Django支持的所有命令列表
2. 在load_command_class()函数中输入一个包路径和命令名，该函数会返回在具体命令文件中定义的Command对象
3. 通过解析命令行参数进行验证和提取，判断出当前是哪个方法，然后通过load_command_class()获得command对象。