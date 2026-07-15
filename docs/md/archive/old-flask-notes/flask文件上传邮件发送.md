## Day5 文件上传 邮件发送

## 一、原生文件上传

模板代码

```html
{% extends 'common/base.html' %}
{% block page_content %}
    <h2>文件上传</h2>
    <form action="" method="post" enctype="multipart/form-data">
        <p>选择头像：<input type="file" name="photo"></p>
        <p><input type="submit" value="上传"></p>
    </form>
{% endblock %}
```

#### (1) 最简单的上传

无任何过滤条件

**实例**

```python
"""
这是一个原生文件上传的蓝本文件
"""
from flask import Blueprint,render_template,request
import os

uo = Blueprint('uo',__name__)

# 文件上传的视图函数
# (1) 最简单的上传 无需任何过滤
@uo.route('/upload1/',methods=['GET','POST'])
def upload1():
    # 获取上传过来的文件
    # print(request.files.get('photo'))
    if request.method == 'POST':
        file = request.files.get('photo')
        # 获取当前上传文件的名称
        print(file.filename)
        # 保存上传的文件
        # file.save(file.filename)
        #  指定保存路径
        # 保存在当前 目录下的static/upload/文件名.jpg
        file.save(os.path.join(os.path.join(os.getcwd(),'static/upload'),file.filename))
    return render_template('upload1.html')
```

#### (2) 添加过滤条件的上传 

模板代码

```html
{% extends 'common/base.html' %}
{% block page_content %}
    <h2>文件上传</h2>
    {% for error in get_flashed_messages() %}
        <div class="alert alert-success alert-dismissible" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
            {{ error }}
        </div>
    {% endfor %}
    {% if filename %}
        <img src="{{ url_for('static',filename='upload/'+filename,_external=True) }}" alt="" width="200">
    {% endif %}
    <form action="" method="post" enctype="multipart/form-data">
        <p>选择头像：<input type="file" name="photo"></p>
        <p><input type="submit" value="上传"></p>
    </form>
{% endblock %}
```

**实例**

```python
"""
文件上传第二个版本 进阶
"""
from flask import Blueprint,render_template,request,flash
import os
app = Flask(__name__)
app.config['SECRET_KEY'] = '12sxasdhhx'
# 设置上传文件大小  这个参数名称时固定的
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*64
bootstrap = Bootstrap(app)
manager = Manager(app)
# 上传路径
UPLOAD_FOLDER = os.path.join(os.getcwd(),'static/upload')
# 允许后缀
ALLOWED_SUFFIX = ['.jpg','.jpeg','.gif','.png']
"""
上传图片需要的过滤条件
1. 文件大小需要限制
2. 文件类型需要限制
3. 保存文件位置设置配置参数
4. 将上传的文件的后缀获取到 生成一个随机的文件名称
5. 将文件进行保存
6. 在模板中进行展示
"""
def random_name(suffix,length=64):
    import string,random
    '''
    返回指定长度的随机图片名
    :param suffix: 图片后缀
    :param length: 图片名称的长度
    :return: 返回图片名称
    '''
    newStr = string.ascii_letters+string.digits
    return ''.join(random.choices(newStr,k=length))+suffix
@ut.route('/upload2/',methods=['GET','POST'])
def upload2():
    newName = None
    if request.method == 'POST' and request.files.get('photo'):
        # 获取到上传文件
        file = request.files.get('photo')
        # 获取到图片名称
        suffix = os.path.splitext(file.filename)[-1]
        if suffix not in ALLOWED_SUFFIX:
            flash('该类型文件不允许上传！')
        else:
            newName = random_name(suffix)
            path = os.path.join(UPLOAD_FOLDER,newName)
            file.save(path)
            flash('文件上传成功！')
    return render_template('upload1.html',filename=newName)

if __name__ == '__main__':
    manager.run()
```

#### (3) 添加生成缩略图片的代码

**安装：**

pip install pillow

**使用:**

```python
from PIL import Image
@ut.route('/upload2/',methods=['GET','POST'])
def upload2():
    newName = None
    if request.method == 'POST' and request.files.get('photo'):
        ...
         if suffix not in ALLOWED_SUFFIX:
            flash('该类型文件不允许上传！')
        else:
            img = Image.open(path)
            print(img.size)
            # 重新设计尺寸
            img.thumbnail((200,200))
            # 保存
            img.save(path)
            flash('文件上传成功！')
    return render_template('upload1.html',filename=newName)
```



## 二、flask-uploads 文件上传扩展库

**安装：**

pip install flask-uploads

**说明:**

在文件上传时 提供了很大的方便  比如文件过滤和校验

**配置：**

```python
from flask_uploads import UploadSet,configure_uploads,patch_request_class,IMAGES

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*64
app.config['UPLOADED_PHOTOS_DEST'] = os.path.join(os.getcwd(),'static/upload')
bootstrap = Bootstrap(app)
photos = UploadSet('photos',IMAGES)
configure_uploads(app,photos)
```

**使用**

```python
@app.route('/upload_one/',methods=['GET','POST'])
def upload_one():
    img_url = None
    if request.method == 'POST' and 'photo' in request.files:
        # 保存上传的图片 并返回 图片名称
        filename = photos.save(request.files.get('photo'))
        # 通过图片名称 返回图片url地址
        img_url = photos.url(filename)
    return render_template('upload1.html',img_url=img_url)
```

#### 文件上传最终版本

#### 模板文件

```html
{% extends 'common/base.html' %}
{% block title %}
文件上传
{% endblock %}
{% block page_content %}
<h2>文件上传</h2>
    {% from 'bootstrap/wtf.html' import quick_form %}
    {% if img_url %}
        <img src="{{ img_url }}" alt="">
    {% endif %}
    {{ quick_form(form) }}
{% endblock %}
```

#### manage.py

```python
from flask import Flask,render_template,request
from flask_bootstrap import Bootstrap
from flask_script import Manager
from flask_uploads import UploadSet,patch_request_class,configure_uploads,IMAGES
from flask_wtf import FlaskForm
from flask_wtf.file import FileField,FileAllowed,FileRequired
from wtforms import SubmitField
import os
from PIL import Image

app = Flask(__name__)
app.config['SECRET_KEY'] = '12[[asdc'
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*64
app.config['UPLOADED_PHOTOS_DEST'] = os.path.join(os.getcwd(),'static/upload')
bootstrap = Bootstrap(app)
photos = UploadSet('photos',IMAGES)
configure_uploads(app,photos)
patch_request_class(app,size=None)
manager = Manager(app)

# 文件上传类
class Upload(FlaskForm):
    file = FileField('文件上传',validators=[FileAllowed(photos,message='请上传正确的图片类型'),FileRequired(message='文件不能为空！')])
    submit = SubmitField('上传')

def random_name(suffix,length=64):
    import string,random
    '''
    返回指定长度的随机图片名
    :param suffix: 图片后缀
    :param length: 图片名称的长度
    :return: 返回图片名称
    '''
    newStr = string.ascii_letters+string.digits
    return ''.join(random.choices(newStr,k=length))+suffix

@app.route('/upload/',methods=['GET','POST'])
def upload():
    form = Upload()
    img_url = None
    if form.validate_on_submit():
        suffix = os.path.splitext(request.files.get('file').filename)[-1]
        newName = random_name(suffix)
        photos.save(request.files.get('file'),name=newName)
        # img_url = photos.url(newName)
        # 获取图片存储路径
        path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'],newName)
        img = Image.open(path)
        img.thumbnail((200,200))
        img.save(os.path.join(app.config['UPLOADED_PHOTOS_DEST'],'s_'+newName))
        img_url = photos.url('s_'+newName)

    return render_template('upload.html',form=form,img_url=img_url)


if __name__ == '__main__':
    manager.run()
```







