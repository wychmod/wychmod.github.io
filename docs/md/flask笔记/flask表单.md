# Flask表单

## 一、flask原生表单

native_form.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h2>原生表单</h2>
<form action="{{ url_for('native.do_form',_external=True) }}" method="post">
    <p>用户名: <input type="text" name="username"></p>
    <p>密码：<input type="password" name="userpass"></p>
    <p><input type="submit" value="submit"></p>
</form>
</body>
</html>
```

native_form.py蓝本文件

```python
from flask import Blueprint,render_template,request

native = Blueprint('native',__name__)

@native.route('/form/')
def form1():
    print(request.args.get('username'))
    print(request.args.get('userpass'))
    return render_template('native_form.html')

# 处理表单
@native.route('/do_form/',methods=['POST'])
def do_form():
    print(request.form)
    return 'username:{} userpass:{}'.format(request.form.get('username'),request.form.get('userpass'))
```

**将俩个视图函数合并为一个**

```python
# get 和 post请求都能够被接收
@native.route('/form/',methods=["GET","POST"])
def form():
    if request.method == 'POST':
        return 'username:{} userpass:{}'.format(request.form.get('username'), request.form.get('userpass'))
    return render_template('native_form.html')
```



## 二、flask-wtf扩展库

**说明：**

是一个用于表单处理的扩展库 提供了 csrf，表单校验等功能 使用非常方便

**安装：**
pip install flask-wtf



## 三、常见字段类型和验证器

#### (1) 常见字段类型

| 字段类型          | 字段说明    |
| ------------- | ------- |
| StringFIeld   | 普通文本字段  |
| SubmitField   | 提交按钮    |
| PasswordFIeld | 密码框     |
| HiddenField   | 隐藏域     |
| TextAreaField | 多行文本域   |
| DateFIeld     | 日期字段    |
| DateTimeField | 日期和时间字段 |
| IntegerField  | 整形字段    |
| FloatField    | 浮点型字段   |
| BooleanField  | 布尔类型字段  |
| RadioFIeld    | 单选      |
| SelectField   | 下拉      |
| FIleField     | 文件上传    |

#### (2) 验证器

| 验证器          | 说明           |
| ------------ | ------------ |
| DateRequired | 必填           |
| Email        | 邮箱           |
| IPAddress    | ip地址         |
| Length       | 长度           |
| NumberRange  | 值范围          |
| EqualTo      | 验证俩个字段的值是否相同 |
| URL          | url地址        |
| Regexp       | 正则验证         |

#### 注册表单实例

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h2>使用flask_wtf创建的表单</h2>
{% macro show_err(field) %}
    {% for err in field.errors %}
            <span style="color: red">{{ err }}</span>
    {% endfor %}
{% endmacro %}
<form action="" method="post">
    {{ form.csrf_token }}
    <p>{{ form.username.label }} {{ form.username() }} {{ show_err(form.username) }}</p>
    <p>{{ form.userpass.label }} {{ form.userpass() }} {{ show_err(form.userpass) }}</p>
    <p>{{ form.confirm.label }} {{ form.confirm() }} {{ show_err(form.confirm) }}</p>
    <p>{{ form.submit() }}</p>
</form>
</body>
</html>
```

#### 视图函数

```python
from flask import Blueprint,render_template,request
from flask_wtf import FlaskForm
from wtforms import StringField,PasswordField,SubmitField
from wtforms.validators import DataRequired,Length,EqualTo

wtf = Blueprint('wtf',__name__)

# 创建一个注册表单类
class Register(FlaskForm):
    # username name名称  用户名 是显示在label内的用户名称 多个验证器的列表
    username = StringField('用户名',validators=[DataRequired('用户名不能为空'),Length(min=6,max=12,message='用户名在6~12位之间')])
    userpass = PasswordField('密码',validators=[DataRequired('密码不能为空'),Length(min=6,max=12,message='密码在6~12位之间')])
    confirm = PasswordField('确认密码',validators=[DataRequired('确认密码不能为空'),EqualTo('userpass',message='密码和确认密码不一致')])
    submit = SubmitField('注册')

@wtf.route('/register/',methods=['GET','POST'])
def register():
    # 实例化表单类
    form = Register()
    # 如果csrf和表单数据都验证通过了 则为 真
    if form.validate_on_submit():
        # 获取表单数据的俩种方式
        print(request.form)
        print(form.username.data)
        print(form.userpass.data)
        return '数据正确'
    return render_template('flaskwtf_form.html',form=form)
```

#### 使用flask_bootstrap 快速渲染表单

**实例**

```html
{% extends 'common/base.html' %}
{% block title %}
    注册
{% endblock %}
{% from 'bootstrap/wtf.html' import quick_form %}
{% block page_content %}
    <h2>使用bootstrap快速渲染表单</h2>
    {{ quick_form(form) }}
{% endblock %}
```

#### 自定义表单验证器

```python
from wtforms.validators import ValidationError
class Registr(FlaskForm):
    ...
	#自定义表单验证器 验证用户输入的用户名是否唯一性
    def validate_username(self,field):
        # 用户名的标签
        # print(field)
        # 获取用户名标签的value值
        # print(field.data)
        if field.data == 'lucky':
            raise ValidationError('该用户名已存在 请重新输入')
```



#### (3) 完整使用 字段和验证器实例

```python
from flask import Blueprint,render_template,request
from flask_wtf import FlaskForm
from wtforms import StringField,PasswordField,SubmitField,HiddenField,TextAreaField,DateField,DateTimeField,IntegerField,FloatField,BooleanField,RadioField,SelectField,FileField
from wtforms.validators import DataRequired,Length,EqualTo,ValidationError,Email,IPAddress,NumberRange,URL,Regexp

all_wtf = Blueprint('all_wtf',__name__)

# 验证所有的字段和验证器的文件
class Register(FlaskForm):
    username = StringField('用户名',validators=[DataRequired('用户名不能为空'),Length(min=6,max=12,message='用户名在6~12位之间')])
    userpass = PasswordField('密码',validators=[DataRequired('密码不能为空'),Length(min=6,max=12,message='密码在6~12位之间')])
    confirm = PasswordField('确认密码',validators=[DataRequired('确认密码不能为空'),EqualTo('userpass',message='密码和确认密码不一致')])

    uid = HiddenField()
    info = TextAreaField('个人信息',render_kw={'style':"resize:none;",'placeholder':'个人信息'})
    date =  DateField('日期')
    datetime = DateTimeField('日期和时间',format = '%Y/%m/%d %H:%M:%S')
    age = IntegerField('年龄')
    money = FloatField('钱')
    agree = BooleanField('是否同意以上条款',render_kw={'checked':True})
    sex = RadioField('性别',choices=[('1','男'),('0','女')])
    address = SelectField('地址',choices=[('1001','北京'),('1002','上海')])
    photo = FileField('选择头像')
    email = StringField('邮箱',validators=[Email(message='请输入正确的邮箱')])
    ip = StringField('IP地址',validators=[IPAddress(message='请输入正确的IP地址')])
    age = IntegerField('年龄',validators=[NumberRange(min=6,max=99,message='请输入正确的年龄')])
    url = StringField('url',validators=[URL(message='请输入正确的url地址')])
    phone = StringField('手机号码',validators=[Regexp('^1[3-8][0-9]{9}$',message='请输入正确的手机号码')])
    submit = SubmitField('注册')
```



## 四、flash 消息的显示

**说明：**

当用户发生请求以后 用户的状态发生了改变   需要给出提示信息  

**导入：**

from flask import flash,get_flashed_messages

**实例：**

```python
@form.route('/form/',methods=['GET','POST'])
def Form():
    f = TestForm()
    if f.validate_on_submit():
        flash('恭喜你 数据正确 提交成功')
        # print(get_flashed_messages())
        pass
    return render_template('test_form.html',form=f)
```

**模板中使用**

```html
{% extends 'common/base.html' %}
{% from 'bootstrap/wtf.html' import quick_form %}
{% block page_content %}
    <h2>flask-wtf表单</h2>
    {% for error in get_flashed_messages() %}
        <div class="alert alert-success alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
            {{ error }}
        </div>
    {% endfor %}

    {{ quick_form(form) }}
{% endblock %}
```

**注意：**

如果每个模板中都有消息要进行展示的时候 将展示消息的代码 放入 base模板中  这样的划 不论谁继承 都会有显示消息的代码



## 五、flask-moment 负责本地时间的格式化展示

**安装：**

pip install flask-moment

**说明:**

专门负责本地时间显示的扩展库 使用起来非常的方便

**使用：**

```python
# 测试flask-moment使用的视图函数
@form.route('/moment/')
def moment():
    time = datetime.utcnow()+timedelta(seconds=-300)
    return render_template('test_moment.html',time=time)
```

模板文件

```html
{% extends 'common/base.html' %}
{% block page_content %}
    <h2>显示格式化时间的模块 flask-moment的使用</h2>
    <h3>{{ moment(time).format('L') }}</h3>
    <h3>{{ moment(time).format('LL') }}</h3>
    <h3>{{ moment(time).format('LLL') }}</h3>
    <h3>{{ moment(time).format('LLLL') }}</h3>
    <h3>自定义时间的展示</h3>
    <h3>{{ moment(time).format('YYYY-MM-DD') }}</h3>
    <h3>{{ moment(time).fromNow() }}</h3>
{% endblock %}
{% block scripts %}
    {{ super() }}
    {{ moment.include_moment() }}
    {{ moment.locale('zh-CN') }}
{% endblock %}
```



> http://momentjs.com/docs/#/displaying/








