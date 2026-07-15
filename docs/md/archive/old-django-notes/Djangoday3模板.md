# day3 模板

## 一、概述

模板由俩部分组成

1. HTML代码
2. 逻辑控制代码

**作用：**

快速生成HTML页面

**优点：**

1. 模板的设计实现了业务逻辑与现实内容的分离
2. 视图可以调用任意模板

**模板处理：**

1. 加载
2. 渲染



## 二、模板的渲染

(1) render

**导入：**

from django.shortcuts import render

**参数：**

+ request 请求的对象 *
+ template_name 渲染的模板的名称 *
+ context 字典形式 传递的数据值 *
+ content_type MIME类型
+ status 响应状态码 默认200
+ using 用户加载模板引擎的名称

**实例**

```python
# 测试 render的使用
def test_render(req):
    return render(req,'test_tem/test_render.html',{'username':'lucky','sex':'男','hobby':'make money'})
```

test_render.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<p>我叫：{{ username }}</p>
<p>我的性别是：{{ sex }}</p>
<p>我的爱好是：{{ hobby }}</p>
<h3>test_render</h3>
</body>
</html>
```

#### (2) loader  渲染模板

**导入：**

from django.template import loader

可以获取到完整的渲染后的模板文件的内容

**使用：**

```python
# 测试loader
def test_loader(req):
    # 加载模板文件
    tem = loader.get_template('test_tem/test_render.html')
    res = tem.render({'username':'lucky','sex':'男','hobby':'make money'})
    print(res)
    #return HttpResponse('test_loader')
	return HttpResponsne(res) # 将模板文件的内容响应给浏览器
```



## 三、模板中变量

#### 变量

格式：{{ 变量名称 }}

就是视图函数传递给模板的参数 

**如果模板使用的变量不存在 则为空白字符**

##### 模板中使用语法：

1. 属性或或者方法
2. 数字索引

**模板中常用的系统变量**

1. 获取用户

   request.user

2. 获取当前网址的路径

   request.path

3. 获取get传参

   request.GET.urlencode

4. 通过获取的数据重新拼凑成当前的url地址

   <p><a href="{{ request.path }}?{{ request.GET.urlencode }}">url地址</a></p>

## 四、模板中标签

**格式：**

{% 标签名称 %}

**作用：**

1. 在输出中创建文本
2. 控制逻辑和循环

#### (1) if/elif/else/endif

**可用的运算符**

`> < >= <= == != and or not in not in`

**实例：**

```python
{% if grade >= 80 %}
    成绩大于等于80
{% elif grade >= 70 %}
    成绩大于等于70
{% else %}
    成绩小于70
{% endif %}
```

**注意：**

运算符俩侧需要存在空格



#### (2) for标签

**语法格式**

{% for xx in xx %}

​	...

{% endfor %}

**实例**

```python
{% for i in list %} # 正常迭代
{% for i in list reversed %} # 反向迭代
    <li>{{ i }}</li>
{% endfor %}
```

**注意：**

只能针对列表进行反向迭代  不能对字典进行反向迭代

##### 搭配empty的使用（不能搭配else）

**实例**

```python
{% for i in xx reversed %}
        <li>{{ i }}</li>
{% empty %}
        <li>空的</li>
{% endfor %}
```

**注意：**

empty和flask的else使用一样的  只有当迭代的变量不存在时 则执行empty或者else

**迭代字典**

**实例：**

```python
<h3>迭代字典（区别 flask中为items方法 Django中为属性）</h3>
{% for key,value in info.items %}
    <li>{{ key }}===>{{ value }}</li>
{% endfor %}
```

**获取for迭代的状态**

| 变量                  | 描述              |
| ------------------- | --------------- |
| forloop.counter     | 获取迭代的索引从1开始     |
| forloop.counter0    | 获取迭代的索引从0开始     |
| forloop.revcounter  | 获取迭代索引长度 从大到1   |
| forloop.revcounter0 | 获取迭代索引长度从 大 到 0 |
| forloop.first       | 是否为第一次迭代        |
| forloop.last        | 是否为最后一次迭代       |
| forloop.parentloop  | 获取上一层的迭代对象      |

**实例：**

```python
{% for i in list %}
    <li>{{ i }}==>{{ forloop.counter }}====>{{ forloop.counter0 }}====>{{ forloop.revcounter }}====>{{ forloop.revcounter0 }}====={{ forloop.first }}===={{ forloop.last }}</li>
    <ol>
        {% for p in list %}
            <li>{{ forloop.parentloop.counter }}</li>
        {% endfor %}
    </ol>
{% endfor %}
```

**注意：**

1. 模板中的迭代不能使用range  不支持
2. 不能喝else进行搭配   只能和empty搭配使用  使用一样

#### (3) 注释

1. 单行注释

   {# 注释内容 #}

2. 多行注释

   {% comment %}

   ​	...

   {% endcomment %}

#### (4) ifequal 标签

**说明：** 判断俩个值是否相等

**实例**

```python
{% ifequal 1 1 %}
    相等
{% else %}
    不相等
{% endifequal %}
```

#### (5) ifnotequal 标签

**说明：**判断俩个值是否不相等

**实例：**

```python
{% ifnotequal 1 1 %}
    1不等于1
    {% else %}
    1等于1
{% endifnotequal %}
```



## 五、模板的导入标签 include

**语法格式：**

> {% include '路径/模板名称.html' %}

**注意：**

include会将导入模板内的所有代码 copy到你的include的位置

**实例：**

```html
{% include 'common/header.html' %}
<hr>
{% include 'common/footer.html' %}
```



## 六、继承

1. extends 继承父模板

2. block 对父模板代码进行替换

   所有的{% block %} 标签告诉模板引擎 子模板可以重载block内的代码

**作用：**

用于模板的继承 可以减少页面内容的重复定义 实现页面的重用

**实例：**

base.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- 上述3个meta标签*必须*放在最前面，任何其他内容都*必须*跟随其后！ -->
    <title>{% block title %}base{% endblock %}</title>
    {% block css %}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" rel="stylesheet">
    {% endblock %}
</head>
<body>
{% block nav %}
    <nav class="navbar navbar-inverse">
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
                <a class="navbar-brand" href="#">Brand</a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li class="active"><a href="#">Link <span class="sr-only">(current)</span></a></li>
                    <li><a href="#">Link</a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                           aria-expanded="false">Dropdown <span class="caret"></span></a>
                        <ul class="dropdown-menu">
                            <li><a href="#">Action</a></li>
                            <li><a href="#">Another action</a></li>
                            <li><a href="#">Something else here</a></li>
                            <li role="separator" class="divider"></li>
                            <li><a href="#">Separated link</a></li>
                            <li role="separator" class="divider"></li>
                            <li><a href="#">One more separated link</a></li>
                        </ul>
                    </li>
                </ul>
                <form class="navbar-form navbar-left">
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Search">
                    </div>
                    <button type="submit" class="btn btn-default">Submit</button>
                </form>
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="#">Link</a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                           aria-expanded="false">Dropdown <span class="caret"></span></a>
                        <ul class="dropdown-menu">
                            <li><a href="#">Action</a></li>
                            <li><a href="#">Another action</a></li>
                            <li><a href="#">Something else here</a></li>
                            <li role="separator" class="divider"></li>
                            <li><a href="#">Separated link</a></li>
                        </ul>
                    </li>
                </ul>
            </div><!-- /.navbar-collapse -->
        </div><!-- /.container-fluid -->
    </nav>
{% endblock %}
{% block con %}
    <div class="container">
    {% block page_content %}
        <h2>test_base</h2>
    {% endblock %}
    </div>
{% endblock %}
{% block scripts %}
    <!-- jQuery (Bootstrap 的所有 JavaScript 插件都依赖 jQuery，所以必须放在前边) -->
    <script src="https://cdn.jsdelivr.net/npm/jquery@1.12.4/dist/jquery.min.js"></script>
    <!-- 加载 Bootstrap 的所有 JavaScript 插件。你也可以根据需要只加载单个插件。 -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js"></script>
{% endblock %}
</body>
</html>
```

index.html

```html
{% extends 'common/base.html' %}
{% block title %}
    首页
{% endblock %}
{% block page_content %}
    测试首页
{% endblock %}
```

**注意：**

1. 不能再子模板中把block定义在不存在的block的名称 不会被加载
2. 不要再block外部存在任何代码 不会执行
3. 在Django中重用父母版代码为{{ block.super }} flask中为{{ super() }}

#### Django使用bootstrap扩展库

**安装:**
pip install django-bootstrap3

**配置**

在settings.py中INSTALLED_APPS中添加 bootstrap3

**在刚才的base.html中添加如下代码**

```html
{% load bootstrap3 %}
{% bootstrap_css %}
<script type="text/javascript" src="{% bootstrap_jquery_url %}"></script>
{% bootstrap_javascript %}
{% bootstrap_messages %} # flask中的flash消息展示
```



## 七、Django中消息展示 message的使用

**概述：**

在处理完表单 或其他类型的用户输入时 显示一个通知消息（也叫做flash message）message框架就可以方便的实现这个功能

##### 默认消息级别有四种：

1. message.debug
2. message.info
3. message.success
4. message.warning
5. message.error

**分别对应的标签为**

debug info  success warning error

**导入：**

```python
from django.contrib import messages
```

**实例：**

```python
from django.contrib import messages # 导入消息显示模块
# Create your views here.
def index(req):
    messages.error(req,'你好 我是lucky')
    messages.success(req,'你好 我是lucky')
    messages.info(req,'你好 我是lucky')
    messages.warning(req,'你好 我是lucky')
    return render(req,'main/index.html')
```

base.html模板中

```html
{% bootstrap_messages %}
```

**不适用bootstrap渲染message**

**实例：**

```python
from django.contrib import messages # 导入消息显示模块
# Create your views here.
def index(req):
    messages.warning(req,'你好 我是lucky',extra_tags='bg-success text-success')
    return render(req,'main/index.html')
```

base.html模板中

```html
{% if messages %}
        {% for message in messages %}
            <p {% if message.tags %} class="{{ message.tags }}"{% endif %} style="padding: 10px;">{{ message }}</p>
        {% endfor %}
{% endif %}
```

**解析后的标签为**

```html
<p class="bg-success text-success">你好 我是lucky</p>
```

**长期作业：**在讲完Django后 使用Django完成flask的博客功能



## 八、过滤器

**语法格式**：{{ var|过滤器:参数... }}

**作用：** 在结果输出之前进行值的修改

**过滤器：**

1. upper 大写

2. lower 小写

3. capfirst 首字母大写

4. first 获取到第一个字符

5. center 输出指定的长度 并把值居中

6. cut 查找并删除指定字符

7. default 默认值 当值为undefined bool的False时 都会执行

8. default_if_none 如果值为None 则执行默认值

   {{ None|default_if_none:'默认值' }}

9. divisibleby 判断值是否可以被某个值整除

   ```
   {{ 3|divisibleby:3 }}
   ```

10. safe 不转义html标签

11. autoescape 可以解析或者不解析代码

   {% autoescape on/off %}

   ​	on不解析/off解析

   {% endutoescape %}

12. floatformat 保留小数位数 默认保留一位（会四舍五入）

13. length 计算长度

14. random 返回列表的随机项

15. wordcount 统计单词的个数

16. date 格式化时间

17. addlashes 添加转义斜线 对特殊字符进行转义

18. striptags 去除HTML标签




## 九、加减乘除（了解）

##### (1)  加法

{{ value|add:value }}

**实例**

```
{{ 5|add:5 }}
```

##### (2) 减法

{{ value|add:-value }}

```
{{ 5|add:5 }}
```

##### (3) 乘法

{% widthratio 5 1 10 %}

**实例：**

```
{% widthratio 5 1 10 %}
```

5/1*10 = 50

##### (4) 除法

{% widthratio 5 5 1 %}

5/5*1 = 1

**实例**

```
{% widthratio 5 5 1 %}
```



## 十、跨站请求伪造 csrf

**作用：**

用于跨站请求伪造 防止csrf的攻击

**使用：**

在中间件middleware

```python
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
]
```

正常使用：

{% csrf_token %}

**实例：**

```html
<form methd='post'>
	{% csrf_token %}
</form>
```



 