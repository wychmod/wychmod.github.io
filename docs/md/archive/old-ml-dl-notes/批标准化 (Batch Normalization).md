# 批标准化 (Batch Normalization)

## 为什么要批标准化
**Batch Normalization, 批标准化**, 和普通的数据标准化类似, 是将分散的数据统一的一种做法, 也是优化神经网络的一种方法. 在之前 Normalization 的简介视频中我们一提到, 具有统一规格的数据, 能让机器学习更容易学习到数据之中的规律.

![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCE602e0c879c40323bf88485a54d1e71dc)

如图假设wx1是0.1 wx2是2，如果在tanh激活函数下wx2直接就是接近1的状态了，激活函数已经处在了饱和状态，也就是说x无论在怎么扩大，tanh的输出值也都是1，神经网络在初始阶段就已经对比较大的x不敏感了。在输入层发生这样的情况时，我们可以对之前的数据做**normalization 预处理**，而在隐藏层也会发生这样的事情，在隐藏层就需要**batch normalization**来处理了。

Batch normalization 的 batch 是批数据, 把数据分成小批小批进行 随机梯度下降. 而且在每批数据进行前向传递的时候, 对每一层都进行 normalization 的处理。

Batch normalization 也可以被看做一个层面. 在一层层的添加神经网络的时候, 我们先有数据 X, 再添加全连接层, 全连接层的计算结果会经过 激励函数 成为下一层的输入, 接着重复之前的操作. **Batch Normalization (BN) 就被添加在每一个全连接和激励函数之间**.

![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCEd92ae96fb7460a6f5be049b2b2e0abf9)

![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCE95dfd9c5e7a644c2e3df9aef4ae2fd37)
之前说过, 计算结果在进入激励函数前的值很重要, 如果我们不单单看一个值, 我们可以说, 计算结果值的分布对于激励函数很重要. 对于数据值大多分布在这个区间的数据, 才能进行更有效的传递. 对比这两个在激活之前的值的分布. 上者没有进行 normalization, 下者进行了 normalization, 这样当然是下者能够更有效地利用 tanh 进行非线性化的过程.

没有 normalize 的数据 使用 tanh 激活以后, 激活值大部分都分布到了饱和阶段, 也就是大部分的激活值不是-1, 就是1, 而 normalize 以后, 大部分的激活值在每个分布区间都还有存在. 再将这个激活后的分布传递到下一层神经网络进行后续计算, 每个区间都有分布的这一种对于神经网络就会更加有价值.

![image.png](https://note.youdao.com/yws/res/f/WEBRESOURCEcf5dd37853550cf05882bf76e7c6154f)

![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCEf5c9f6138dc43d9ba848dfc54f14f630)

Batch normalization 不仅仅 normalize 了一下数据, 他还进行了反 normalize 的手续。这三步就是我们在刚刚一直说的 normalization 工序, 但是公式的后面还有一个反向操作, 将 normalize 后的数据再扩展和平移. 原来这是为了让神经网络自己去学着使用和修改这个扩展参数 gamma, 和 平移参数 β, 这样神经网络就能自己慢慢琢磨出前面的 normalization 操作到底有没有起到优化的作用, 如果没有起到作用, 我就使用 gamma 和 belt 来抵消一些 normalization 的操作.

![image.png](https://note.youdao.com/yws/res/b/WEBRESOURCEb41f15e7cc1021d37f87eec8ca5d6cdb)

## keras里的batch_normalization