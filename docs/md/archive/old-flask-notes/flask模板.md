# 模板 Template

**模板引擎**

**说明：**

模板文件是按照特定规则 书写的一个负责展示 效果的html文件 模板引擎就是提供 特定规则的解释 和 特定规则的工具

**模板引擎的语法**

jinja2

## 一、模板的使用

**(1) 工作目录**

```python
project/
	templates/ 	模板目录
    manage.py
```

#### (2) 渲染模板的方法

1. #### 渲染一段简短的html代码

   render_template_string

2. #### 渲染模板文件

   render_template()

**实例**

```python
from flask import Flask,render_template,render_template_string
from flask_script import Manager

app = Flask(__name__)
manager = Manager(app)

@app.route('/')
def index():
    # print(render_template('index.html'))
    # return render_template('index.html')
    return render_template_string('<h2 style="color:red;">首页</h2>')

if __name__ == '__main__':
    manager.run()
```

#### (3) 变量

概述：

变量就是试图函数 像模板文件传递的数据

变量名称：要遵循标识符的命名规则

**语法：**

{{ 变量名称 }}

**注意：**

如果在模板中使用了 不存在的变量 则插入空白字符(啥都没有)

**实例**

试图函数向模板传递数据

manage.py

```python
from flask import Flask,render_template,render_template_string
from flask_script import Manager

app = Flask(__name__)
manager = Manager(app)

@app.route('/')
def index():
    # 像模板传递数据
    return render_template('index.html',name='lucky',age=18,sex='男')
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>首页</title>
</head>
<body>
<h2>首页</h2>
<ul>
    <li><h4>我叫：{{ name }}</h4></li>
    <li><h4>我今年：{{ age }}</h4></li>
    <li><h4>性别：{{ sex }}</h4></li>
    <li><h4>不存在的变量：{{ xxx }}</h4></li>
</ul>
</body>
</html>
```



## 二、标签

**语法:**

{% 标签名 %}

**作用：**

1. 在输出中创建文本
2. 控制逻辑和循环

#### (1) for 循环

**实例**

```python
{#{% for foo in range(10) %}#}
{% for foo in name %}
    <li>{{ foo }}</li>
{% endfor %}
</ul>
```

**迭代字典**

```python
{% for k,v in Dict.items() %}
    <h4>{{ k }}====>{{ v }}</h4>
{% endfor %}
```

**配合else使用**

```python
{% for k,v in Dict.items() %}
    <h4>{{ k }}====>{{ v }}</h4>
    {% else %}
    <h4>你能不能看到我输出</h4>
{% endfor %}
```

**注意：**

只有 当迭代的变量 不存在 才执行else 和diango一样的

#### 获取迭代状态的变量

| 变量名         | 说明           |
| ----------- | ------------ |
| loop.index  | 获取当前的索引 从1开始 |
| loop.index0 | 获取当前的索引从1开始  |
| loop.first  | 是否为第一次迭代     |
| loop.last   | 是否为最后一次迭代    |
| loop.length | 迭代的长度        |

**注意：**

break和continue关键字 不能再这里使用

#### (2) if

**使用：**

if的条件 都可以正常使用 

```python
> < >= <= == != in not in not and or
```

**主体结构**

```python
{% if ... %}
	...
{% elif ... %}
	...
{% else %}
	...
{% endif %}
```

**实例**

```python
{% if age<=18 %}
    <h4>花一样的年纪</h4>
{% elif age<=30 %}
    <h4>花该开放的年纪了</h4>
{% else %}
    <h4>花该枯萎了</h4>
{% endif %}
```



## 三、注释标签

**作用：**

1. 代码调试
2. 解释说明

**多行注释**

**格式**

```python
{# 注释内容 #}
```



## 四、文件包含 include

include语句可以将一个文件 导入到另外一个文件中 类似import

include 会将 导入文件的内部所有代码 都类似于粘贴到你include导入的位置  所以 用什么代码 就写什么代码  不要存在多于的代码

**实例**

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        body{
            padding:0;
            margin:0;
        }
        header,footer{
            width:100%;
            height:100px;
        }
        header{
            background-color: orange;
        }
        footer{
            position: absolute;
            bottom:0;
            background: yellow;
        }
        div{
            width:100%;
            height:400px;
        }
    </style>
</head>
<body>
{% include 'common/header.html' %}
<div id="con">
    <h3>内容部分</h3>
</div>
{% include 'common/footer.html' %}
</body>
</html>
```

common/header.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<header>
    我是头部分
</header>
</body>
</html>
```

common/footer.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<footer>
    尾
</footer>
</body>
</html>
```

## 五、macro 宏的使用

**概述**

就类似于 python中的函数

**主体结构：**

```python
{% macro 宏名称([参数...]) %}
	...
{% endmacro %}
{{ 宏名称([参数...]) }}
```

**实例**

```python
{% macro test(name) %}
{#    <h4>你能否看到我</h4>#}
    <h4>{{ name }} 是非常帅气的</h4>
{% endmacro %}
```

#### 宏的导入

1. import  ...

2. from ... import ...

3. 起别名

   from ... import ... as ...

common/my_macro.html

```python
{% macro test(name='xxx',age=18) %}
    <h4>我叫{{ name }} 我今年{{ age }}岁了！</h4>
{% endmacro %}
```

test_macro.html

```python
{% from 'common/my_macro.html' import test %}
{{ test() }}
{% import 'common/my_macro.html' as my_macro %}
{{ my_macro.test('lucky',20) }}
```

**注意：**

1. 宏不可以在定义的上方调用  只能在下方调用
2. 如果宏存在形参 且没有默认值 可以不传实参 
3. 宏调用可以使用关键字参数
4. 如果形参有默认值 不传实参 则值为形参默认值
5. 如果形参有默认值  则要遵循默认值规则



## 六、模板的继承 extends

创建一个所有模板共同需要使用的基础模板  并将基础模板 通过block进行标记  在子模板继承以后 可以找到对应标记的名称 进行或者不进行代码的替换  基础模板中的block(标记) 越多 那么基础模板也就越灵活

**创建一个基础模板**

**实例**

base.html

```html
{% block doc %}
<!DOCTYPE html>
<html lang="en">
{% block html %}
<head>
{% block head %}
    {% block meta %}
        <meta charset="UTF-8">
    {% endblock %}
    <title>{% block title %}Title{% endblock %}</title>
    <style>
    {% block style %}
    {% endblock %}
    </style>
    {% block linkscript %}
    {% endblock %}
{% endblock %}
</head>
<body>
{% block body %}
    body体
{% endblock %}
</body>
{% endblock %}
</html>
{% endblock %}
```

**test_base.html 继承base.html**

```html
{% extends 'common/base.html' %}
{% block title %}
测试基础模板base.html
{% endblock %}
{% block body %}
    <h2>我是test_base.html文件中的主体结构代码</h2>
{% endblock %}
```

#### super变量的使用

super的作用是将父模板被替换掉的内容  再次重新加载回来！

**格式**

{{ super() }}



## 七、flask-bootstrap 扩展库

**安装：**

pip install flask-bootstrap

**使用:**

```python
from flask import Flask,render_template
from flask_script import Manager
from flask_bootstrap import Bootstrap

app = Flask(__name__)
# 实例化 Bootstrap扩展库
app.config['BOOTSTRAP_SERVE_LOCAL'] = True
bootstrap = Bootstrap(app)
manager = Manager(app)
```

**创建自己的bootstrap_base 基础模板**

```html
{% extends 'bootstrap/base.html' %}
{% block title %}
    base
{% endblock %}
{% block navbar %}
    <nav class="navbar navbar-inverse" style="border-radius: 0;">
        <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
                        data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#"><span class="glyphicon glyphicon-signal" aria-hidden="true"></span></a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li class="active"><a href="#">首页 <span class="sr-only">(current)</span></a></li>
                    <li><a href="#">发表博客</a></li>
                </ul>

                <ul class="nav navbar-nav navbar-right">
                    <form class="navbar-form navbar-left">
                        <div class="form-group">
                            <input type="text" class="form-control" placeholder="Search">
                        </div>
                        <button type="submit" class="btn btn-default">Submit</button>
                    </form>
                    <li><a href="#">登录</a></li>
                    <li><a href="#">注册</a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                           aria-expanded="false">个人中心 <span class="caret"></span></a>
                        <ul class="dropdown-menu">
                            <li><a href="#">查看个人信息</a></li>
                            <li><a href="#">修改用户名</a></li>
                            <li><a href="#">修改密码</a></li>
                            <li><a href="#">修改邮箱</a></li>
                            <li><a href="#">查看头像</a></li>
                            <li role="separator" class="divider"></li>
                            <li><a href="#">退出登录</a></li>
                        </ul>
                    </li>
                </ul>
            </div><!-- /.navbar-collapse -->
        </div><!-- /.container-fluid -->
    </nav>
{% endblock %}
{% block content %}
<div class="container">
  {% block page_content %}
      内容部分
  {% endblock %}
</div>
{% endblock %}
```

#### 子模板继承boot_base.html

```html
{% extends 'common/boot_base.html' %}
{% block page_content %}
我是test_bootstrap的内容部分！！！！！
{% endblock %}
```



## 八、错误页面定制

manage.py

```python
@app.errorhandler(404)
def page_not_found(err):
    return render_template('err.html',code=404,info=err)

@app.errorhandler(500)
def server_err(err):
    return render_template('err.html',code=500,info=err)
```

err.hrml

```html
{% extends 'common/boot_base.html' %}
{% block title %}
    {{ code }}
{% endblock %}
{% block page_content %}
    <div class="alert alert-danger" role="alert">{{ info }}</div>
{% endblock %}
```



## 九、视图传递多个参数

#### (1) 使用全局变量g

from flask import g

```python
g.name = 'lucky'
g.age = 18
```

#### (2) 使用 字典方式

```python
@app.route('/test_bootstrap/')
def test_bootstrap():
    Dict = {'name':'lucky','age':18}
    return render_template('test_bootstrap.html',info=Dict)
```

**使用**

```html
    <li>{{ info.name }}</li>
    <li>{{ info.age }}</li>
```

#### (3) 使用不定长参数 

```python
@app.route('/test_bootstrap/')
def test_bootstrap():
    Dict = {'name':'lucky','age':18}
    return render_template('test_bootstrap.html',**Dict)
```

**使用**

```html
<h4>{{ name }}</h4>
<h4>{{ age }}</h4>
```

#### (4) 使用 locals() 方法

```python
@app.route('/test_bootstrap/')
def test_bootstrap():
    name = 'lucky_boy'
    age = 18
    return render_template('test_bootstrap.html',**locals())
```

## 十、加载静态资源

js、css、img 这些统称为静态资源

**目录结构**

```python
project/
	static/
    	img/
        css/
        js/
        upload/
	templates/
    manage.py
```

**使用 **

```python
相对路径获取
<img src="{{ url_for('static',filename='img/1.jpg') }}" alt="">
绝对路径
<img src="{{ url_for('static',filename='img/1.jpg',_external=True) }}" alt="">
```

**作业**

把 js 和  css实现静态资源文件的加载！！！

> <link href='{{ url_for('static',filename='css/index.css') }}'  >



## 十一、过滤器

**概述**

在值输出之前 进行过滤 后在输出 其实就是python中的函数 至少换了一种写法而已

**格式：**

{{ 值|函数名 }}

1. abs 绝对值

2. default 默认值  

   + 只有当前变量不存在 才执行输出默认值

     {{ var|default('默认值') }}

   + 更改参数 boolean bool的False也执行默认值

     {{ var|default('默认值',boolean=True) }}

3. first 取出序列中的第一个值

4. last 取出序列中的最后一个值

5. format  字符串的格式化

   + ```python
     {{ '我叫%s 我今年%d岁了 我的存款为%.2f'|format('lucky',20,123) }}
     ```

6. length  长度

7. join 将序列拼成字符串

   + ```python
     {{ ['a','b','c','d']|join(',') }}
     ```

8. safe 将字符原样输出

9. int 转换成int类型

10. float 转换浮点型

11. list 转换为列表

12. lower 字符转换为小写

13. upper 转换为大写

14. replace 将字符进行替换

15. striptags 去除html标签

16. trim 去除空白字符

#### 自定义过滤器

#### 方式一

通过添加add_template_filter的方式进行添加

**实例：**

```python
# 写一个实现 字符超出5个 显示...
def show_ellipsis(Str,length=5):
    if(len(Str))>length:
        Str = Str[0:length]+'...'
    return Str

app.add_template_filter(show_ellipsis)
```

#### 方式二

添加装饰器

**实例**

```python
@app.template_filter()
def show_ellipsis(Str,length=5):
    if(len(Str))>length:
        Str = Str[0:length]+'...'
    return Str
```

