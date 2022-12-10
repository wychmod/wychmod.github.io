_Python_ 中的 _dict_ 对象是一种 **关联式容器** 对象，用于保存由 **键** ( _key_ )到 **值** ( _value_ )的映射关系。借助关联式容器，程序可快速定位到与指定 **键** 相关联的 **值** 。_dict_ 对象在 _Python_ 程序中使用频率非常高，如果应用不当将严重影响程序的执行效率。

## 基本用法

我们用一个 _dict_ 对象来保存培训班学员的成绩，先创建一个空对象：

```python
>>> scores = {}
>>> scores
{}
```

那么，一个什么都不放的 _dict_ 对象需要占用多少内存呢？根据前面章节，我们知道对象头部字段是必不可少的。可我们很惊讶地发现，一个空的 dict 对象居然要占用 _240_ 字节的内存！

```python
>>> import sys
>>> sys.getsizeof(scores)
240
```

这是为什么呢？后续我们将从 _dict_ 内部的哈希表中寻找答案。现在我们接着回顾 _dict_ 的基本用法。

现在将 _jim_ 的成绩保存保存到 _dict_ 对象中：

```python
>>> scores['jim'] = 70
>>> scores
{'jim': 70}
>>> sys.getsizeof(scores)
240
```

数据插入后，我们发现 _dict_ 对象内存使用量保存不变。看来， _dict_ 对象也有一种类似 _list_ 对象的 **预分配机制** 。

现在，接着存入 _lily_ 、_lucy_ 以及 _tom_ 的成绩。我们发现， _dict_ 还没达到扩容条件，内存大小保存不变：

```python
>>> scores['lily'] = 75
>>> scores['lucy'] = 80
>>> scores['tom'] = 90
>>> scores['alice'] = 95
>>> scores
{'jim': 70, 'lily': 75, 'lucy': 80, 'tom': 90, 'alice': 95}
>>> sys.getsizeof(scores)
240
```

借助 _dict_ 对象，我们可以快速检索出某位学员的成绩。例如，获取 tom 的成绩：

```python
>>> scores['tom']
90
```

”快速“不是一个精确的形容词，到底多快呢？这里先给出答案，由于 _dict_ 对象底层由哈希表实现， 查找操作平均时间复杂度是 O(1)O(1) 。当然了，在哈希不均匀的情况下，最坏时间复杂度是 O(n)O(n) ，但一般情况下很难发生。

当然了，如果有某位学员(例如 _lily_)转学了，可通过 _pop_ 方法将其剔除：

```python
>>> scores.pop('lily')
75
>>> scores
{'jim': 70, 'lucy': 80, 'tom': 90, 'alice': 95}
```

哈希表结构决定了 _dict_ 的删除操作也很快，平均时间复杂度也是 O(1)O(1) 。实际上， _dict_ 插入、删除、查找的平均时间复杂度都是 ，O(1)O(1)最坏时间复杂度是 O(n)O(n) 。因此，哈希函数的选择就至关重要，一个好的哈希函数应该将键尽可能 **均匀** 地映射到哈希空间中，最大限度地避免 **哈希冲突** 。

## 执行效率

我们知道 _dict_ 对象搜索操作时间复杂度为 O(1)O(1)，远远好于 _list_ 对象的 O(n)O(n) 。这意味着什么了？为得到一个更准确、直观的感受，我们编写一个测试程序，分别测试不同规模 _dict_ 、 _list_ 对象完成 _1000_ 次搜索所需的时间：

```python
import random
import time

# 随机数生成器
randint = lambda: random.randint(-2**30+1, 2**30-1)

def count_targets(items, targets):
    '''
    计算目标对象出现个数
        items: 待搜索容器
        targets: 待搜索目标元素列表
    '''

    found = 0

    for target in targets:
        if target in items:
            found += 1

    return found

def generate_random_dict(n):
    '''
    生成随机数字典
    '''

    dict_items = {}
    while len(dict_items) < n:
        dict_items[randint()] = True

    return dict_items

def generate_random_list(n):
    '''
    生成随机数列表
    '''

    return [
        randint()
        for _ in range(0, n)
    ]

def test_for_scale(scale, targets):
    '''
    执行一个样例
        scale: 测试容器规模
        targets: 待搜索元素列表
    '''

    # 生成指定规模的随机数容器
    dict_items = generate_random_dict(scale)
    list_items = generate_random_list(scale)

    # 测试dict搜索所需时间
    start_ts = time.time()
    count_targets(dict_items, targets)
    dict_time = time.time() - start_ts

    # 测试list搜索所需时间
    start_ts = time.time()
    count_targets(list_items, targets)
    list_time = time.time() - start_ts

    # 打印结果
    print('Scale:', scale)
    print('Dict:', dict_time)
    print('List:', list_time)
    print()

def main():
    # 每次测试搜索1000次
    # 生成1000个随机数作为搜索目标
    targets = generate_random_list(1000)

    # 以不同规模运行测试函数
    for scale in [1000, 10000, 100000, 1000000]:
        test_for_scale(scale, targets)

if __name__ == '__main__':
    main()
```

测试程序代码逻辑并不复杂，请结合注释阅读理解，这里不再赘述。测试程序执行后，输出内容大致如下：

```python
Scale: 1000
Dict: 0.00012683868408203125
List: 0.03683590888977051

Scale: 10000
Dict: 0.00017213821411132812
List: 0.3484950065612793

Scale: 100000
Dict: 0.00021696090698242188
List: 3.6795387268066406

Scale: 1000000
Dict: 0.0003829002380371094
List: 48.04447102546692
```

我们将测试结果制作表格， _dict_ 和 _list_ 的表现一目了然：

![](../../youdaonote-images/Pasted%20image%2020221210170504.png)

从表格中，我们看到：当容器规模增长 _1000_ 倍， _dict_ 搜索时间几乎保持不变，但 _list_ 搜索时间增长了差不多 _1000_ 倍。当规模达到 _10_ 万时，_1000_ 次 _list_ 搜索花了接近一分钟时间，而 _dict_ 只需 382 微秒！_dict_ 对象完成一次搜索只需 _0.382_ 微秒，也就是说一秒钟可以完成 _200_ 多万次搜索！

_dict_ 对象到底用了什么黑科技呢？接下来，我们一起从它的内部结构中寻找答案。

## 内部结构

由于关联式容器使用场景非常广泛，几乎所有现代编程语言都提供某种关联式容器，而且特别关注键的 **搜索效率** 。例如， _C++_ 标准模板库中的 _map_ 就是一种关联式容器，内部基于 **红黑树** 实现。红黑树是一种 **平衡** 二叉树，能够提供良好的操作效率，插入、删除、搜索等关键操作的时间复杂度均为 O(log_2 n)O(log2​n) 。

_Python_ 虚拟机的运行重度依赖 _dict_ 对象，包括 **名字空间** 以及 **对象属性空间** 等概念底层都是由 _dict_ 对象实现的。因此， _Python_ 对 _dict_ 对象的效率要求更为苛刻。那么，操作效率优于 O(log_2n)O(log2​n) 的数据结构有哪些呢？好吧，你可能已经猜到了， _Python_ 中的 _dict_ 对象就是基于 **散列表** 实现的。

现在，是时候揭开 dict 对象神秘的面纱了。 _dict_ 对象在 _Python_ 内部由结构体 _PyDictObject_ 表示， _PyDictObject_ 在头文件 _Include/dictobject.h_ 中定义：

```c
typedef struct {
    PyObject_HEAD

    /* Number of items in the dictionary */
    Py_ssize_t ma_used;

    /* Dictionary version: globally unique, value change each time
       the dictionary is modified */
    uint64_t ma_version_tag;

    PyDictKeysObject *ma_keys;

    /* If ma_values is NULL, the table is "combined": keys and values
       are stored in ma_keys.

       If ma_values is not NULL, the table is splitted:
       keys are stored in ma_keys and values are stored in ma_values */
    PyObject **ma_values;
} PyDictObject;
```

_dict_ 对象理论上应该是一种变长对象，但 _PyObject_HEAD_ 头部告诉我们， _Python_ 其实把它作为普通对象实现。除了对象公共头部外， _PyDictObject_ 还包括以下几个字段：

-   _ma_used_ ，对象当前所保存的 **键值对个数** ；
-   _ma_version_tag_ ，对象当前 **版本号** ，每次修改时更新；
-   _ma_keys_ ，指向按键对象映射的 **哈希表** 结构；
-   _ma_values_ ， 分离模式下指向由所有 **值对象** 组成的数组。

到目前为止，我们还没找到哈希表的具体结构，但是已经发现了一些蛛丝马迹—— _PyDictKeysObject_ 。现在我们趁热打铁，扒开 _PyDictKeysObject_ 的源码看一看，_Objects/dict-common.h_ 头文件中 __dictkeysobject_ 是也：

```c
struct _dictkeysobject {
    Py_ssize_t dk_refcnt;

    /* Size of the hash table (dk_indices). It must be a power of 2. */
    Py_ssize_t dk_size;

    /* Function to lookup in the hash table (dk_indices):

       - lookdict(): general-purpose, and may return DKIX_ERROR if (and
         only if) a comparison raises an exception.

       - lookdict_unicode(): specialized to Unicode string keys, comparison of
         which can never raise an exception; that function can never return
         DKIX_ERROR.

       - lookdict_unicode_nodummy(): similar to lookdict_unicode() but further
         specialized for Unicode string keys that cannot be the <dummy> value.

       - lookdict_split(): Version of lookdict() for split tables. */
    dict_lookup_func dk_lookup;

    /* Number of usable entries in dk_entries. */
    Py_ssize_t dk_usable;

    /* Number of used entries in dk_entries. */
    Py_ssize_t dk_nentries;

    /* Actual hash table of dk_size entries. It holds indices in dk_entries,
       or DKIX_EMPTY(-1) or DKIX_DUMMY(-2).

       Indices must be: 0 <= indice < USABLE_FRACTION(dk_size).

       The size in bytes of an indice depends on dk_size:

       - 1 byte if dk_size <= 0xff (char*)
       - 2 bytes if dk_size <= 0xffff (int16_t*)
       - 4 bytes if dk_size <= 0xffffffff (int32_t*)
       - 8 bytes otherwise (int64_t*)

       Dynamically sized, SIZEOF_VOID_P is minimum. */
    char dk_indices[];  /* char is required to avoid strict aliasing. */

    /* "PyDictKeyEntry dk_entries[dk_usable];" array follows:
       see the DK_ENTRIES() macro */
};
```

__dictkeysobject_ 结构体包含 dict 对象哈希表实现的所有秘密，结合注释可以解读其中的关键字段：

-   _dk_refcnt_ ，引用计数，跟 **映射视图** 的实现有关，有点类似对象引用计数；
-   _dk_size_ ，哈希表大小，必须是 2^n2n ，这样可将模运算优化成 **按位与** 运算；
-   _dk_lookup_ ， **哈希查找函数** 指针，可根据 _dict_ 当前状态选用最优函数版本；
-   _dk_usable_ ，键值对数组 **可用个数** ；
-   _dk_nentries_ ，键值对数组 **已用个数** ；
-   _dk_indices_ ，哈希表 **起始地址** ，哈希表后紧接着 **键值对数组** _dk_entries_ 。

键值对结构体 _PyDictKeyEntry_ 就非常直白了，除了保存键对象和值对象的指针外，缓存着键对象的哈希值：

```c
typedef struct {
    /* Cached hash code of me_key. */
    Py_hash_t me_hash;
    PyObject *me_key;
    PyObject *me_value; /* This field is only meaningful for combined tables */
} PyDictKeyEntry;
```

-   _me_hash_ ，键对象的 **哈希值** ，避免重复调用 __hash__ 计算哈希值；
-   _me_key_ ，键对象指针；
-   _me_value_ ，值对象指针。

至此， _dict_ 对象内部的哈希表结构已经非常清晰了：