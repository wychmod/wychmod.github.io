在 Flask 应用中使用 gevent



普通的 flask 应用

通常在用 python 开发 Flask web 应用时，使用 Flask 自带的调试模式能够给开发带来极大便利。Flask 自带的调试模式可以让我们在程序改动时自动重新加载我们的应用程序，而且 jinja2 的模板也会随着改动自动刷新。一般用法是：

```python
# app.py
from flask import Flask
app = Flask( __name__ )
@app.route( '/')
def  hello():
    return 'Hello World'
if __name__ == '__main__':
    app.run( debug = True )

```



运行上面这个例子，就可以在本地的 5000 端口运行由 flask 提供的服务器程序。如果我们对这个文件进行修改，那么 flask 的底层框架 werkzuge 检测到文件变动后就会自动重新加载我们的应用程序。

然而 Flask 是单线程运行，如果在某个页面中执行了一些耗时的工作，那么程序就会在这里等待，无法响应其他的请求。也就是说，如果一个路由响应函数中有阻塞代码，那么其他用户无法访问这个 web 服务器，而且自己也打不开其他页面了。

在一个路由中添加阻塞代码，如下所示：

```python
# app.py
from time import sleep
@app.route('/testsleep')
def test_sleep():
    sleep( 10 )
    return'Hi, You wait for about 10 seconds, right?'

```



当打开 /testsleep 页面时，会发现浏览器一直在加载过程中，再去打开 / 页面，发现这个页面也是在加载中。只有等到 /testsleep 页面加载完了，才会去加载 / 页面。

在 flask 中使用 gevent

为了解决一个页面耗时导致所有页面都无法访问的问题。考虑使用 gevent 非阻塞的运行服务器程序。在引入 gevent 前，可以在程序最开始执行的位置引入猴子补丁 gevent.monkey，这能修改 python 默认的 IO 行为，让标准库变成 协作式（cooperative）的 API。注意引入 gevent 后，不能再用原来的方式启动我们的 web 应用了：

```python
# app.py
from gevent import monkey
monkey.patch_all()  # 打上猴子补丁
from flask import flask
...
if __name__ == '__main__':
    from gevent import pywsgi
    app.debug = True
    server = pywsgi.WSGIServer( ('127.0.0.1', 5000 ), app )
    server.serve_forever()

```



这个时候再去打开 /testsleep 页面，还是要等待一些时间才会加载完页面，但是这个时候已经访问 / 页面将会立即加载完毕。

启用调试模式和自动刷新模板

如果在某个页面中的代码有问题，会出现运行时错误，那么访问这个页面只能看到 Internal Server Error 的提示，没有了之前的调试窗口和错误信息。而且在上面的代码中，我已经将 app 的 debug 标志设为了真，然而并没有什么用。为了启用调试模式，方便在开发时看到错误信息，我们需要用到 werkzuge 提供的 DebuggedApplication。

```python
# app.py
if __name__ == '__main__':
    from werkzeug.debug import DebuggedApplication
        dapp = DebuggedApplication( app, evalex= True)
        server = pywsgi.WSGIServer( ( '127.0.0.1', 5000 ), dapp )
        server.serve_forever()

```



重新打开首页，可以看到熟悉的错误信息。

如果你使用了模板，那么你可能已经注意到了，使用 gevent 后修改模板再次访问可能也不会看到页面上有相应的改动。那么你需要在修改 app 的配置，以便模板能够自动刷新，以下两种方式是等效的：

```python
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

```



尝试自动重新加载

使用了 gevent 后，原有的一些功能都需要通过一定的配置之后才可以正常访问。但是有一个功能我们仍然没有解决，那就是修改代码后 web 应用不会自动重新加载了。stackoverflow 和 gist 提到的一种解决方法是使用 werkzeug 提供的 run_with_reloader，可以写出这样的代码：

```javascript
# app.py
...
if __name__ == '__main__':
    ...    
    from werkzeug.serving import run_with_reloader
    server = pywsgi.WSGIServer( ( '127.0.0.1', 5000 ), dapp )
    run_with_reloader( server ).serve_forever()

```



然而如果你这样做了就会发现一点用都没有，甚至连 web 应用都不能正常启动了。

按照这个思路来的还有这段代码提供的 示例，但这个示例是将 run_with_reloader 作为装饰器来使用，以下是该示例的代码：

```javascript
import gevent.wsgi

import werkzeug.serving

@werkzeug.serving.run_with_reloader

def runServer():

    app.debug = True

    ws = gevent.wsgi.WSGIServer(('', 5000), app)

    ws.serve_forever()

```



然而这也没有什么作用。看一下 flask 的源代码可以发现，run_with_reloader 已经不是装饰器了。而且开发者提醒我们不要使用下面的这个函数，这个 api 很明显已经被废弃了，flask 源代码如下：

```javascript
def run_with_reloader(*args, **kwargs):

# People keep using undocumented APIs.  Do not use this function

# please, we do not guarantee that it continues working.

    from werkzeug._reloader import run_with_reloader

    return run_with_reloader(*args, **kwargs)

```



如果使用 gevent 作为 WSGI 的网关服务器，似乎就没法使用自动加载应用的功能了。

实现自动重新加载

没有其他可以借鉴的方法了，好在之前在查看廖雪峰的 Python 教程时，给出了一个自动重新加载应用的示例，主要原理是利用 watchdog 提供的文件监听功能，在创建、修改文件时会触发相应的处理器，这样就可以实现自动重新加载功能。代码可以去廖雪峰的教程中查看。

之后的应用启动时就不能直接使用 python app.py 了。如果将自动加载的代码保存在同级的 monitor.py 文件中，我们需要使用 python monitor.py app.py 启动应用。最终就可以自动热加载我们的 web 应用了。

关于文件改动事件，之前我也写过一个类似的 JS 程序，原理类似，都是当文件改动时自动执行重新构建应用的命令。

相应的说明代码在 github 上可以查看。

