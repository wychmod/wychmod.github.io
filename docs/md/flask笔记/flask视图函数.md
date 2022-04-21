# Flask

## 一、flask入门

**WEB工作原理**

1. C/S  客户端/服务器端
2. B/S  浏览器/服务器端

#### Flask有俩大核心 

1. werkzeug

   实现路由 调试 和web服务的网关接口

2. jinjia2 

   实现了模板

**简介：**

flask 是一个python微型框架  只提供了一个强健的核心  其它功能都需要通过第三方扩展库来实现

**安装**

pip install flask

**完整启动的代码**

```python
from flask import Flask
app = Flask(__name__)

# 路由  别人访问你的地址  http://www.baidu.com/a/b
@app.route('/')
def index():
    print('访问到我了')
    # 响应
    return '访问到我了'

# 判断只能在主文件中文件flask项目
if __name__ == '__main__':
    # 运行flask
    app.run()
```

**启动地址**

> http://127.0.0.1:5000
>
> [http://127.0.0.1:5000](http://127.0.0.1:5000)/

#### run启动参数

| 参数       | 说明                                  |
| -------- | ----------------------------------- |
|          | 是否开启调试模式 默认为false 开启会自动加载代码 和显示错误信息 |
| threaded | 是否开启多线程 默认是不开启的                     |
| port     | 端口号 默认5000                          |
| host     | 主机 默认127.0.0.1                      |

**完整的启动**

> app.run(host='0.0.0.0',port='5001',debug=True,threaded=True)

##### 正常本地调试使用的时候 只需要开启debug就可以 如果发生端口冲突 则开启port

> app.run(debug=True)



## 二、视图函数

#### (1) 无参路由（没有参数的路由地址）

**实例**

```python
@app.route('/')
def index():
    # 响应
    return '访问到我了'
```

#### (2) 带一个参数的路由

**格式**

/路由名称/<参数名>/

**实例**

```python
@app.route('/welcome/<name>/')
def welcome(name):
    return 'welcome {}'.format(name)
```

**访问**

> http://127.0.0.1/5000/lucky/

#### (3) 带多个参数的路由

```python
@app.route('/info/<name>/<age>/')
@app.route('/info/<name>_<age>/')
def info(name,age):
    return '我叫：{} 我今年：{}岁了'.format(name,age)
```

**访问:**

> http://127.0.0.1/5000/lucky/18/
>
> http://127.0.0.1/5000/lucky_18/

#### (4) 限制路由参数的访问类型

通过 path、string、int、float进行限制

**实例**

```python
@app.route('/welcome/<arg>/')
@app.route('/welcome/<string:arg>/')  值的类型为字符串 默认就是string
@app.route('/welcome/<int:arg>/')  值的类型必须为整形
@app.route('/welcome/<float:arg>/') 值的类型必须为浮点型
@app.route('/welcome/<path:arg>/') 值的类型因为字符串 只是/分隔符 不再认为是分隔符 而是值的一部分
def welcome(arg):
    print(type(arg))
    return 'welcome {}'.format(arg)
```




**注意：**

1. 一个视图函数 是可以有多个路由名称
2. 路由结尾的/建议加上 否则会多一次重定向  如果在定义的时候路由结尾没有/ 那么在访问的 时候  路由就不能有 / 否则 404
3. 参数值的类型默认都为 字符串！！！
4. 一个视图函数可以有多个路由地址