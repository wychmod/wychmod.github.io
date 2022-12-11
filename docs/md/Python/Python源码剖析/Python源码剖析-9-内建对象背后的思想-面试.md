## list

### _**list**_ **对象常用操作有哪些？时间复杂度分别是多少？**

![](../../youdaonote-images/Pasted%20image%2020221211114813.png)

### _**list**_ **为什么可以做到容量自适应？什么时机需要扩容、缩容？**

_list_ 对象底层由动态数组实现，对象头部保存数组 **容量** 以及当前已用 **长度** 。

当我们往列表添加新数据时，长度会不断增长。当长度达到容量后， _Python_ 会对底层数组进行扩容，分配一个更大的数组，并将元素从旧数组中拷贝过去。为避免频繁扩容，_Python_ 每次扩容时都额外分配至少 1/8 的空闲空间。

当我们从列表中删除元素时，动态数组慢慢出现很多空闲空间。这时 _Python_ 对底层数组进行缩容，以降低内存开销。

### **通过** _**copy**_ **方法复制** _**list**_ **，修改新列表会影响旧列表吗？**

_list_ 对象 _copy_ 方法实现了浅拷贝，只拷贝列表本身，不拷贝列表中存储的元素对象。

```python
>>> users = [{'name': 'jim', 'age': 27}, {'name': 'paul', 'age': 25}]
>>> users2 = users.copy()
```

![](../../youdaonote-images/Pasted%20image%2020221211114958.png)

这样一来，新旧列表中的元素是同一个。对新列表中的元素进行修改，必然在旧列表中可见：

```python
>>> users2[0]['age'] += 1
>>>
>>> users2
[{'name': 'jim', 'age': 28}, {'name': 'paul', 'age': 25}]
>>> users
[{'name': 'jim', 'age': 28}, {'name': 'paul', 'age': 25}]
```

如果 **浅拷贝** 不是你想要的行为，可以通过 _copy_ 模块中的 _deepcopy_ 函数进行 **深拷贝** ：

```python
>>> from copy import deepcopy
>>> users = [{'name': 'jim', 'age': 27}, {'name': 'paul', 'age': 25}]
>>> users2 = deepcopy(users)
```

与浅拷贝不同，深拷贝不仅负责列表对象，还递归复制列表中存储的每个元素对象：

![](../../youdaonote-images/Pasted%20image%2020221211115031.png)

### **Python** **中有“栈”容器吗？如何快速得到一个栈？**

_list_ 列表对象是一种 **动态数组** 式容器，类似 _C++_ 中的 _vector_ 。 _list_ 对象具有优秀的尾部操作效率，不管是向尾部追加还是从尾部删除，时间复杂度都是 O(1)O(1) 。因此，我们可以将 _list_ 对象当做一个栈来使用：

```python
# 新建一个列表对象作为栈
>>> stack = []

# 依次压入元素
>>> stack.append(1)
>>> stack.append(2)
>>> stack.append(3)

# 栈底元素
>>> stack[0]

# 栈顶元素
>>> stack[-1]

# 栈长度
>>> len(stack)

# 弹出元素
# 注意到，3最后压入，但最早弹出
>>> stack.pop()
3
>>> stack.pop()
2
```

## deque

### **频繁从** _**list**_ **头部删除元素会导致什么问题？如何解决？**

由于在 _list_ 头部增删元素需要挪动其后所有元素，时间复杂度是 O(N)O(N)，效率堪忧。因此，我们需要极力避免这类操作。如果实际场景无法避免头部操作，可以考虑用 _collections_ 模块中的 _deque_ 双端队列。顾名思义， _deque_ 也是一种线性容器，头尾两端操作效率都很高，时间复杂度是 O(1)O(1)。

```python
>>> from collections import deque
>>> q = deque()

# 依次入队
>>> q.append(1)
>>> q.append(2)
>>> q.append(3)

# 队列长度
>>> len(q)
3
# 队头元素
>>> q[0]
1
# 队尾元素
>>> q[-1]
3

# 依次出队
# 注意到，出队顺序与入队顺序一致
>>> q.popleft()
1
>>> q.popleft()
2
```

## dict

### **dict** **对象常用操作有哪些？时间复杂度分别是多少？**

