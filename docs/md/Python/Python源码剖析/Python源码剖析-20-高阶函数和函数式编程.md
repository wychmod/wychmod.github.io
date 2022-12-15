_Python_ 函数是以对象的形式实现的，属于 **一等对象** ( _first-class object_ )。根据编程语言理论，一等对象必须满足以下条件：

-   可在运行时创建；
-   能赋值给变量或者某种数据结构；
-   能作为参数传递给函数；
-   能作为函数执行结果返回；

_Python_ 函数同时满足这几个条件，因而也被称为 **一等函数** 。 **高阶函数** 则是指那些以函数为参数，或者将函数作为结果返回的函数。对高阶函数稍加利用，便能玩出很多花样来。本节从一些典型的案例入手，讲解 _Python_ 函数高级用法。合理应用函数式编程技巧，不仅能让代码更加简洁优雅，还能提高开发效率和程序质量。

函数式编程技巧最适合用在数据处理场景，接下来以成绩单计算为例，展开讲解。原始数据如下：

```python
scores = [
    {
        'name': '小雪',
        'chinese': 90,
        'math': 75,
        'english': 85,
    },
    {
        'name': '小明',
        'chinese': 70,
        'math': 95,
        'english': 80,
    },
    {
        'name': '小丽',
        'chinese': 85,
        'math': 85,
        'english': 90,
    },
    {
        'name': '小宇',
        'chinese': 85,
        'math': 95,
        'english': 90,
    },
    {
        'name': '小刚',
        'chinese': 65,
        'math': 70,
        'english': 55,
    },
    {
        'name': '小新',
        'chinese': 85,
        'math': 85,
        'english': 80,
    },
]
```

## sorted

排序是我们再熟悉不过的场景，如果待排序元素可以直接比较，调用 _sorted_ 函数即可：

```python
>>> numbers = [2, 8, 6, 9, 7, 0, 1, 7, 0, 3]
>>> sorted(numbers)
[0, 0, 1, 2, 3, 6, 7, 7, 8, 9]
```

对比较复杂的数据进行排序，则需要一些额外的工作。假如语文老师想对语文成绩进行排序，改如何进行呢？

_sorted_ 支持指定一个自定义排序函数 _key_ ，该函数以列表元素为参数，返回一个值决定该元素的次序。由于我们需要根据语文成绩对元素进行排序，因此需要实现一个函数将语文成绩提取出来作为比较基准：

```python
def by_chinese(item):
    return item['chinese']
```

现在只需要将 by_chinese 函数作为 key 参数传给 sorted 即可实现语文成绩排序：

```python
>>> for item in sorted(scores, key=by_chinese):
...     print(item['name'], item['chinese'])
...
小刚 65
小明 70
小丽 85
小宇 85
小新 85
小雪 90
```

自定义排序函数还可以控制升降序，如果需要按分数从高到底依次排序，可以返回成绩的负数作为排序基准：

```python
def by_chinese_desc(item):
    return -item['chinese']
```

```python
>>> for item in sorted(scores, key=by_chinese_desc):
...     print(item['name'], item['chinese'])
...
小雪 90
小丽 85
小宇 85
小新 85
小明 70
小刚 65
```

当然了，通过 _sorted_ 函数 _reverse_ 参数控制升降序，是一个更好的编程习惯，逻辑更清晰：

```python
>>> for item in sorted(scores, key=by_chinese, reverse=True):
...     print(item['name'], item['chinese'])
...
小雪 90
小丽 85
小宇 85
小新 85
小明 70
小刚 65
```

## lambda

像 _by_chinese_ 这样直接返回结果的极简函数，其实没有必要大动干戈，用 **匿名函数** 定义即可。_Python_ 中的 _lambda_ 关键字用于定义匿名函数，匿名函数只需给出参数列表以及一个表达式作为函数返回值：

![](../../youdaonote-images/Pasted%20image%2020221215120500.png)

这样一来，_by_chinese_ 这个自定义排序函数，可以这样来定义：

```python
by_chinese = lambda item: item['chinese']
```

相应地，我们实现语文成绩排序的代码编程这样子：

```python
>>> for item in sorted(scores, key=lambda item: item['chinese']):
...     print(item['name'], item['chinese'])
...
小刚 65
小明 70
小丽 85
小宇 85
小新 85
小雪 90
```

数学老师来了，也只需要改动一点点，就能实现数学成绩排序了：

```python
>>> for item in sorted(scores, key=lambda item: item['math']):
...     print(item['name'], item['math'])
...
小刚 70
小雪 75
小丽 85
小新 85
小明 95
小宇 95
```

函数式编程语言一般都会提供 _map_ 、 _filter_ 以及 _reduce_ 这 3 个高阶函数，再复杂的数据统计处理任务都可以转换成这些算子的组合。因此，不少大数据平台，例如 _Hadoop_ 等，都以 map 、 reduce 为基础算子。_Python_ 内部也自带了这几个高阶函数，我们分别来看：

## map

_map_ 函数接受 **转换函数** 以及一个 **可迭代对象** 作为参数，返回另一个生成器，其元素是输入元素的转换结果：