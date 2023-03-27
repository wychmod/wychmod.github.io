## 一、环境安装

```python
  pip insatll pytest

  pytest --version

```

## 二、用例编写

当我们通过 pytest 执行用例时，pytest 会自动递归遍历执行路径下所有的目录，根据 pytest 中默认用例的识别的规则，自动收集测试用例。

### 1、默认的用例识别的规则

- 1、用例文件：所有文件名为 开头 或者 开头的文件会被识别为用例文件。test__test
- 2、用例类：测试文件中每个 Test 开头的类型就是一个测试用例类。
- 3、测试用例：测试类中每个 test 开头的方法就是一条测试用例，测试文件中每个 test 开头的函数也是一条测试用例。
> pytest 兼容 unittest，以 unittest 的用例编写规范写的用例，pytest 都能够识别出来

### 2、函数形式编写用例

```python
# \testcases\test_demo1.py
 
def test_demo():
    assert 100 == 100
```

> 使用命令 就可以执行测试函数，输出结果如下：pytest

### 3、以类的形式编写用例

```python
class TestDome:
 
    def test_demo1(self):
        assert 11 == 11
 
    def test_demo(self):
        assert 22 == 21
```

## 三、执行测试

