# Flask 框架教程

> 预计阅读：约 28 分钟（正文约 8500 字）
> 阅读建议：先理解最小应用、请求响应、模板和蓝图，再进入表单、SQLAlchemy、上传、邮件、并发与部署。

## 一、核心概述

Flask 是轻量级 WSGI Web 应用框架。它把核心保持得很薄：路由、请求响应、模板渲染、上下文、Session、错误处理和 CLI；数据库、表单、登录、迁移、邮件、缓存等能力通常由扩展库组合完成。

本文从 [old-flask-notes](/md/archive/README?id=old-flask-notes) 拆出独立教程，按“最小应用 → 视图与请求响应 → 模板 → 表单 → 蓝图 → ORM → 文件上传与邮件 → gevent/async → 部署”重组。旧归档中的 Flask-Script、Flask-Uploads、flask-bootstrap 等写法保留为历史提示，新项目以官方稳定版 Flask 3.1.x 文档口径为准。

> 💡 补充：Flask 依赖 Werkzeug、Jinja 和 Click。遇到路由、模板或 CLI 的细节问题时，除了 Flask 文档，也要查对应 Pallets 子项目文档。

## 二、最小应用与项目结构

### 2.1 Hello Flask

归档里的第一步是跑通最小应用：创建 `Flask(__name__)`，用 `@app.route()` 注册路由，启动开发服务器。

```bash
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install "Flask>=3.1,<3.2"
```

```python
from flask import Flask

app = Flask(__name__)


@app.route("/")
def index():
    return "Hello Flask"
```

开发启动优先使用 CLI：

```bash
flask --app app run --debug
```

旧笔记里的 `app.run(debug=True, port=5000)` 本地学习仍可用，但真实项目更推荐使用 Flask CLI 和应用工厂，便于测试、配置和部署。

### 2.2 应用工厂结构

```text
flask_demo/
├── pyproject.toml
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models.py
│   ├── views.py
│   ├── templates/
│   └── static/
└── tests/
```

```python
# app/__init__.py
from flask import Flask


def create_app(config_object="app.config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    from .views import web_bp

    app.register_blueprint(web_bp)
    return app
```

应用工厂让“创建 app”和“注册扩展/蓝图/配置”集中在一个入口，测试环境可以创建不同配置的 app。

## 三、路由、视图、请求与响应

### 3.1 路由参数

旧归档按无参、一个参数、多个参数、参数类型逐步讲路由。Flask 的路由由 Werkzeug 提供，常见转换器包括 `string`、`int`、`float`、`path`、`uuid`。

```python
from flask import Blueprint, jsonify

web_bp = Blueprint("web", __name__)


@web_bp.route("/")
def index():
    return "index"


@web_bp.route("/users/<int:user_id>")
def user_detail(user_id):
    return jsonify({"id": user_id})


@web_bp.route("/files/<path:filename>")
def file_detail(filename):
    return jsonify({"filename": filename})
```

### 3.2 请求对象

```python
from flask import request


@web_bp.route("/search")
def search():
    return jsonify(
        {
            "q": request.args.get("q", ""),
            "method": request.method,
            "ip": request.remote_addr,
        }
    )


@web_bp.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "")
    return jsonify({"username": username})
```

| 数据来源 | Flask API |
|---|---|
| 查询字符串 | `request.args` |
| 表单 | `request.form` |
| JSON | `request.get_json()` / `request.json` |
| 文件 | `request.files` |
| 请求头 | `request.headers` |
| Cookie | `request.cookies` |

### 3.3 响应、重定向和错误

```python
from flask import abort, make_response, redirect, render_template, url_for


@web_bp.route("/old-home")
def old_home():
    return redirect(url_for("web.index"))


@web_bp.route("/download-token")
def download_token():
    response = make_response(jsonify({"ok": True}))
    response.set_cookie("download", "1", max_age=300, httponly=True)
    return response


@web_bp.route("/forbidden")
def forbidden():
    abort(403)


@web_bp.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404
```

`url_for()` 根据 endpoint 反向生成 URL。蓝图中的 endpoint 通常形如 `web.index`，比硬编码路径更容易维护。

## 四、上下文、Cookie、Session 与 Flash

### 4.1 应用上下文与请求上下文

归档里单独记录了 `current_app` 和 `g`。Flask 的上下文让视图、模板、扩展能在不显式传 app/request 的情况下访问当前请求状态。

| 对象 | 所属上下文 | 用途 |
|---|---|---|
| `request` | 请求上下文 | 当前请求数据 |
| `session` | 请求上下文 | 客户端签名 Session |
| `current_app` | 应用上下文 | 当前应用对象代理 |
| `g` | 应用上下文 | 单次请求内临时数据 |

```python
from flask import current_app, g


@web_bp.before_app_request
def load_request_meta():
    g.request_id = request.headers.get("X-Request-ID", "")


@web_bp.route("/config-name")
def config_name():
    return current_app.config["ENV_NAME"]
```

`g` 只在一次请求内有效，不能当跨请求缓存。

### 4.2 Cookie 与 Session

```python
from flask import session

app.config["SECRET_KEY"] = "dev-only"


@web_bp.route("/session/set")
def set_session():
    session["uid"] = 1
    return jsonify({"ok": True})


@web_bp.route("/session/get")
def get_session():
    return jsonify({"uid": session.get("uid")})
```

Flask 默认 Session 是客户端签名 Cookie，不是服务端数据库 Session。它能防篡改，但内容对客户端可见，不应存敏感数据。生产环境必须用强随机 `SECRET_KEY`，并通过环境变量注入。

### 4.3 Flash 消息

```python
from flask import flash


@web_bp.route("/profile/save", methods=["POST"])
def save_profile():
    flash("保存成功", "success")
    return redirect(url_for("web.index"))
```

模板中读取：

```html
{% with messages = get_flashed_messages(with_categories=true) %}
  {% for category, message in messages %}
    <p class="flash flash-{{ category }}">{{ message }}</p>
  {% endfor %}
{% endwith %}
```

Flash 适合表单提交后的短提示，不适合承载业务状态。

## 五、模板系统

### 5.1 render_template 与变量

Flask 使用 Jinja 模板。归档里的模板笔记覆盖变量、for、if、注释、include、macro、extends、静态资源、过滤器和错误页。

```python
@web_bp.route("/users")
def users():
    return render_template(
        "users.html",
        users=[{"name": "lucky", "age": 18}, {"name": "tom", "age": 20}],
    )
```

```html
{% extends "base.html" %}

{% block content %}
  <ul>
    {% for user in users %}
      <li>{{ loop.index }}. {{ user.name }} - {{ user.age }}</li>
    {% else %}
      <li>暂无用户</li>
    {% endfor %}
  </ul>
{% endblock %}
```

### 5.2 include、macro 与继承

```html
<!-- templates/macros/forms.html -->
{% macro input(name, label) %}
  <label>
    {{ label }}
    <input name="{{ name }}">
  </label>
{% endmacro %}
```

```html
{% from "macros/forms.html" import input %}
{{ input("username", "用户名") }}
```

宏适合复用小段 HTML，继承适合复用页面骨架，include 适合复用导航、页脚、提示等片段。

### 5.3 静态资源和自定义过滤器

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/app.css') }}">
```

```python
@web_bp.app_template_filter("ellipsis")
def ellipsis(value, length=20):
    value = str(value)
    return value if len(value) <= length else value[:length] + "..."
```

模板过滤器只做展示转换，不应访问数据库或处理重业务逻辑。

## 六、表单与校验

### 6.1 原生表单

```html
<form method="post">
  <input name="username">
  <input name="password" type="password">
  <button type="submit">登录</button>
</form>
```

```python
@web_bp.route("/login", methods=["GET", "POST"])
def login_page():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        if not username:
            flash("请输入用户名", "error")
        else:
            return redirect(url_for("web.index"))
    return render_template("login.html")
```

### 6.2 Flask-WTF

归档中的 Flask-WTF 笔记按字段类型、验证器、注册表单、自定义验证器组织。现代项目仍可使用 WTForms/Flask-WTF 做服务端表单校验。

```python
from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField, SubmitField
from wtforms.validators import DataRequired, Length


class LoginForm(FlaskForm):
    username = StringField("用户名", validators=[DataRequired(), Length(min=3, max=30)])
    password = PasswordField("密码", validators=[DataRequired(), Length(min=8)])
    submit = SubmitField("登录")
```

```python
@web_bp.route("/wtf-login", methods=["GET", "POST"])
def wtf_login():
    form = LoginForm()
    if form.validate_on_submit():
        return redirect(url_for("web.index"))
    return render_template("wtf_login.html", form=form)
```

表单校验要覆盖必填、长度、格式、业务唯一性和 CSRF。API 项目通常会改用 Pydantic、Marshmallow 或前后端协定的 JSON schema。

## 七、蓝图与模块化

### 7.1 Blueprint

归档中的“蓝本 blueprint”用于把用户相关视图单独放进 `user.py`，再注册到主应用。现代 Flask 项目仍然用蓝图拆分模块。

```python
# app/users/views.py
from flask import Blueprint

user_bp = Blueprint("users", __name__, url_prefix="/users")


@user_bp.route("/login")
def login():
    return "login"
```

```python
# app/__init__.py
from .users.views import user_bp

app.register_blueprint(user_bp)
```

蓝图可以拥有自己的模板、静态文件、URL 前缀、错误处理和请求钩子。大型项目建议按业务域拆蓝图，而不是按“所有 GET/POST/模板”这种技术层拆分。

## 八、SQLAlchemy、模型与迁移

### 8.1 配置 Flask-SQLAlchemy

归档中的模型篇覆盖 MySQL、PyMySQL、Flask-SQLAlchemy、字段类型、约束、CRUD、过滤、排序、分页、逻辑查询和 Flask-Migrate。

```bash
python -m pip install flask-sqlalchemy flask-migrate pymysql
```

```python
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    db.init_app(app)
    migrate.init_app(app, db)
    return app
```

### 8.2 模型定义

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False, index=True)
    age = db.Column(db.Integer, default=18)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f"<User {self.username}>"
```

### 8.3 CRUD 与查询

```python
user = User(username="lucky", age=18)
db.session.add(user)
db.session.commit()

users = User.query.filter(User.age >= 18).order_by(User.id.desc()).all()
first = User.query.filter_by(username="lucky").first()

first.age = 20
db.session.commit()

db.session.delete(first)
db.session.commit()
```

| 查询 | 说明 |
|---|---|
| `filter()` | 使用表达式，支持比较、like、in、and/or |
| `filter_by()` | 等值匹配，适合简单条件 |
| `offset()` / `limit()` | 分页 |
| `order_by()` | 排序 |
| `first()` / `get()` | 获取单条 |
| `count()` | 统计 |

异常时需要 `db.session.rollback()`。不要依赖归档中的自动提交写法，事务边界应该显式可见。

### 8.4 数据迁移

```bash
flask --app app db init
flask --app app db migrate -m "create user"
flask --app app db upgrade
```

`db.create_all()` 适合本地学习，正式项目应使用 Flask-Migrate/Alembic 管理表结构演进。

## 九、文件上传、邮件与扩展

### 9.1 原生文件上传

归档中有“最简单上传”“添加过滤条件”“生成缩略图”“flask-uploads 扩展库”几部分。新项目优先使用 Flask 原生能力加明确校验。

```python
from pathlib import Path
from werkzeug.utils import secure_filename

UPLOAD_DIR = Path("uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@web_bp.route("/upload", methods=["POST"])
def upload():
    file = request.files.get("avatar")
    if not file or not file.filename:
        abort(400)
    if not allowed_file(file.filename):
        abort(400)

    filename = secure_filename(file.filename)
    UPLOAD_DIR.mkdir(exist_ok=True)
    file.save(UPLOAD_DIR / filename)
    return jsonify({"filename": filename})
```

还应配置 `MAX_CONTENT_LENGTH` 限制请求体大小，并校验真实 MIME/图片内容。`Flask-Uploads` 属于旧扩展路线，使用前要确认维护状态。

### 9.2 邮件

```python
from flask_mail import Mail, Message

mail = Mail()


def create_app():
    app = Flask(__name__)
    mail.init_app(app)
    return app


def send_notice(subject, recipients, body):
    message = Message(subject=subject, recipients=recipients, body=body)
    mail.send(message)
```

邮件发送容易阻塞请求，注册激活、验证码和通知邮件应放进后台任务或消息队列。

### 9.3 常见扩展取舍

| 能力 | 常见选择 | 注意 |
|---|---|---|
| ORM | Flask-SQLAlchemy | 事务要显式处理 |
| 迁移 | Flask-Migrate | 底层是 Alembic |
| 表单 | Flask-WTF | 页面表单友好 |
| 登录 | Flask-Login | 只做登录态，不替你做权限系统 |
| 邮件 | Flask-Mail / 其他 SMTP 客户端 | 注意维护状态和异步发送 |
| API 校验 | Marshmallow / Pydantic | 按项目协议选型 |

## 十、gevent、async 与部署

### 10.1 gevent

归档里用 gevent 说明协程式并发：猴子补丁、WSGIServer、并发请求示例。Flask 官方文档仍有 gevent 部署说明，但使用时要理解它是 WSGI 服务器层的并发模型。

```python
from gevent.pywsgi import WSGIServer

from app import create_app

app = create_app()
server = WSGIServer(("0.0.0.0", 5000), app)
server.serve_forever()
```

如果视图函数内部有阻塞 IO，gevent 需要对应库可协作或经过 monkey patch。否则并发收益有限。

### 10.2 async/await

Flask 3.x 支持 async 视图，但 Flask 本体仍是 WSGI 框架。async 适合在单个请求内并发等待多个 IO，不会自动把整个服务变成 ASGI 长连接框架。WebSocket 或全异步服务可考虑 Quart、FastAPI、Starlette 等 ASGI 方案。

```python
@web_bp.route("/async-data")
async def async_data():
    return {"ok": True}
```

### 10.3 生产部署

旧笔记使用 uWSGI + Nginx。现代 Flask 自托管也常用 Gunicorn + Nginx。

```bash
python -m pip install gunicorn
gunicorn "app:create_app()" --bind 0.0.0.0:8000 --workers 4
```

上线前检查：

| 项目 | 要点 |
|---|---|
| Debug | 生产关闭 |
| Secret Key | 强随机，环境变量注入 |
| 数据库 | 连接池、迁移、备份 |
| 静态文件 | Nginx/CDN 托管 |
| 文件上传 | 大小、类型、路径、权限 |
| 日志 | stdout 或集中日志 |
| 安全头 | HTTPS、Cookie Secure、Host 校验 |

## 十一、过时写法与常见坑

| 归档内容 | 当前处理 |
|---|---|
| `app.run()` 作为部署入口 | 仅限本地开发，生产用 WSGI server |
| Flask-Script | 已不是新项目默认选择，优先用 Flask CLI |
| Flask-Uploads | 使用前确认维护状态，原生上传能力通常足够 |
| flask-bootstrap | 依赖旧 Bootstrap 生态，新项目按前端栈单独选型 |
| 客户端 Session 存敏感信息 | 禁止，默认 Session 内容客户端可见 |
| 自动提交事务 | 不推荐，显式 `commit/rollback` 更清晰 |
| 把所有视图写在一个文件 | 学习可用，项目应拆蓝图 |
| gevent 解决所有并发问题 | 不成立，阻塞库和部署模型都要配合 |

## 📚 完整资料

> **原文归档**：[archive/old-flask-notes/](/md/archive/README?id=old-flask-notes)

- [flask视图函数](../archive/old-flask-notes/flask视图函数.md) — 最小应用、启动参数和路由参数。
- [flask_redirct_蓝图](../archive/old-flask-notes/flask_redirct_蓝图.md) — redirect、url_for、abort、request、response、current_app、Cookie、Session、蓝图。
- [flask模板](../archive/old-flask-notes/flask模板.md) — Jinja 变量、标签、include、macro、extends、静态资源、过滤器。
- [flask表单](../archive/old-flask-notes/flask表单.md) — 原生表单、Flask-WTF、验证器、Flash、Moment。
- [flask模型](../archive/old-flask-notes/flask模型.md) — Flask-SQLAlchemy、CRUD、查询、迁移、邮件。
- [flask文件上传邮件发送](../archive/old-flask-notes/flask文件上传邮件发送.md) — 原生上传、过滤条件、缩略图和扩展上传。
- [在Flask应用中使用gevent-brifuture](../archive/old-flask-notes/在Flask应用中使用gevent-brifuture.md) — gevent WSGI 并发示例。
- [flask上线部署](../archive/old-flask-notes/flask上线部署.md) — uWSGI、Nginx、MySQL 和部署日志。
- 官方参考：[Flask documentation](https://flask.palletsprojects.com/en/stable/)。

---

## 修改记录

| 日期 | 类型 | 说明 |
|---|---|---|
| 2026-08-27 | 新增 | 从 Python 基础与生态中拆出 Flask 独立主线，参考 old-flask-notes 重组最小应用、请求响应、上下文、模板、表单、蓝图、SQLAlchemy、上传邮件、gevent/async 与部署，并补充 Flask 3.1.x 口径下的过时写法提示 |
