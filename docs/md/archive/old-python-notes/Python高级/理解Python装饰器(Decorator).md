# 理解Python装饰器(Decorator)
Python装饰器看起来类似Java中的注解，然鹅和注解并不相同，不过同样能够实现面向切面编程。

想要理解Python中的装饰器，不得不先理解闭包（closure）这一概念。
## 闭包
看看维基百科中的解释：
> 在计算机科学中，闭包（英语：Closure），又称词法闭包（Lexical Closure）或函数闭包（function closures），是引用了自由变量的函数。这个被引用的自由变量将和这个函数一同存在，即使已经离开了创造它的环境也不例外。

官方的解释总是不说人话，but--talk is cheap，show me the code:
```
# print_msg是外围函数
def print_msg():
    msg = "I'm closure"

    # printer是嵌套函数
    def printer():
        print(msg)

    return printer


# 这里获得的就是一个闭包
closure = print_msg()
# 输出 I'm closure
closure()
```
==msg==是一个局部变量，在==print_msg==函数执行之后应该就不会存在了。但是嵌套函数引用了这个变量，将这个局部变量封闭在了嵌套函数中，这样就形成了一个闭包。

结合这个例子再看维基百科的解释，就清晰明了多了。闭包就是引用了自有变量的函数，这个函数保存了执行的上下文，可以脱离原本的作用域独立存在。

下面来看看Python中的装饰器。

## 装饰器
一个普通的装饰器一般是这样：
```
import functools


def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print('call %s():' % func.__name__)
        print('args = {}'.format(*args))
        return func(*args, **kwargs)

    return wrapper
```
这样就定义了一个打印出方法名及其参数的装饰器。

调用之：
```
@log
def test(p):
    print(test.__name__ + " param: " + p)
    
test("I'm a param")
```
输出：
```
call test():
args = I'm a param
test param: I'm a param
```
装饰器在使用时，用了@语法，让人有些困扰。其实，装饰器只是个方法，与下面的调用方式没有区别：
```
def test(p):
    print(test.__name__ + " param: " + p)

wrapper = log(test)
wrapper("I'm a param")
```
@语法只是将函数传入装饰器函数，并无神奇之处。

值得注意的是 @functools.wraps(func) ，这是python提供的装饰器。它能把原函数的元信息拷贝到装饰器里面的 func 函数中。函数的元信息包括docstring、name、参数列表等等。可以尝试去除@functools.wraps(func)，你会发现test.__name__的输出变成了wrapper。

## 带参数的装饰器
装饰器允许传入参数，一个携带了参数的装饰器将有三层函数，如下所示：
```
import functools

def log_with_param(text):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print('call %s():' % func.__name__)
            print('args = {}'.format(*args))
            print('log_param = {}'.format(text))
            return func(*args, **kwargs)

        return wrapper

    return decorator
    
@log_with_param("param")
def test_with_param(p):
    print(test_with_param.__name__)
```
看到这个代码是不是又有些疑问，内层的decorator函数的参数func是怎么传进去的？和上面一般的装饰器不大一样啊。

其实道理是一样的，将其@语法去除，恢复函数调用的形式一看就明白了：
```
# 传入装饰器的参数，并接收返回的decorator函数
decorator = log_with_param("param")
# 传入test_with_param函数
wrapper = decorator(test_with_param)
# 调用装饰器函数
wrapper("I'm a param")
```
输出结果与正常使用装饰器相同：
```
call test_with_param():
args = I'm a param
log_param = param
test_with_param
```
装饰器这一语法体现了Python中函数是第一公民，函数是对象、是变量，可以作为参数、可以是返回值，非常的灵活与强大。