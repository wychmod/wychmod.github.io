# 一维卷积神经网络Conv1D
[toc]
## 一维卷积的定义
一维卷积的输入是一个向量和一个**卷积核**，输出也是一个向量。
![image.png](https://note.youdao.com/yws/res/3/WEBRESOURCE2e37ccb42a63ed0c9c09a02f8dae44e3)
注意相乘的顺序是**相反**的，这是卷积的定义决定的。

输出长度是7，卷积核长度是3，输出的长度是7-3+1 = 5。

也就是说这里的卷积操作若输入长度是m，卷积核长度是n，则输出长度是m-n+1。

这样的卷积就叫窄卷积。

等宽卷积就是在输入两边各填充(n-1)/2，最终输出长度是m+(n-1)/2*2-n+1 = m。

填充元素可以是0，也可以和边缘一样，也可以是镜像。
![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCEf316064b7b55b04b9bfeb501ab11d54c)

## Keras中的Conv1D
```Python
keras.layers.Conv1D(filters, kernel_size, strides=1, padding='valid', data_format='channels_last', dilation_rate=1, activation=None, use_bias=True, kernel_initializer='glorot_uniform', bias_initializer='zeros', kernel_regularizer=None, bias_regularizer=None, activity_regularizer=None, kernel_constraint=None, bias_constraint=None)

```
**1D 卷积层** (例如时序卷积)。
该层创建了一个卷积核，该卷积核以 单个空间（或时间）维上的层输入进行卷积， 以生成输出张量。 如果 use_bias 为 True， 则会创建一个偏置向量并将其添加到输出中。 最后，如果 activation 不是 None，它也会应用于输出。

当使用该层作为模型第一层时，需要提供 input_shape 参数（整数元组或 None），例如， (10, 128) 表示 10 个 128 维的向量组成的向量序列， (None, 128) 表示 128 维的向量组成的变长序列。

### 参数
- filters: 整数，输出空间的维度 （即卷积中滤波器的输出数量）。
- kernel_size: 一个整数，或者单个整数表示的元组或列表， 指明 1D 卷积窗口的长度。
- strides: 一个整数，或者单个整数表示的元组或列表， 指明卷积的步长。 指定任何 stride 值 != 1 与指定 dilation_rate 值 != 1 两者不兼容。
- padding: “valid”, “causal” 或 “same” 之一 (大小写敏感) “valid” 表示「不填充」。 “same” 表示填充输入以使输出具有与原始输入相同的长度。 “causal” 表示因果（膨胀）卷积， 例如，output[t] 不依赖于 input[t+1:]， 在模型不应违反时间顺序的时间数据建模时非常有用。
- data_format: 字符串, “channels_last” (默认) 或 “channels_first” 之一。输入的各个维度顺序。 “channels_last” 对应输入尺寸为 (batch, steps, channels) (Keras 中时序数据的默认格式) 而 “channels_first” 对应输入尺寸为 (batch, channels, steps)。
dilation_rate: 一个整数，或者单个整数表示的元组或列表，指定用于膨胀卷积的膨胀率。 当前，指定任何 dilation_rate 值 != 1 与指定 stride 值 != 1 两者不兼容。
- activation: 要使用的激活函数。 如未指定，则不使用激活函数 (即线性激活： a(x) = x)。
- use_bias: 布尔值，该层是否使用偏置向量。
- kernel_initializer: kernel 权值矩阵的初始化器 。
- bias_initializer: 偏置向量的初始化器 。
- kernel_regularizer: 运用到 kernel 权值矩阵的正则化函数。
- bias_regularizer: 运用到偏置向量的正则化函数。
- activity_regularizer: 运用到层输出（它的激活值）的正则化函数 。
- kernel_constraint: 运用到 kernel 权值矩阵的约束函数。
- bias_constraint: 运用到偏置向量的约束函数。

### 输入尺寸
3D 张量 ，尺寸为 (batch_size, steps, input_dim)

### 输出尺寸
3D 张量，尺寸为 (batch_size, new_steps, filters)。 由于填充或窗口按步长滑动，steps 值可能已更改

### 输入输出尺寸的理解
一般在2D卷积中，输入尺寸很直观，为 (samples, rows, cols, channels)，即为样本数，行数、列数和通道数四维信息，但是若以此推断，在Conv1D总两维信息就足够，中间却夹杂了一个steps,那这个steps如何去理解呢？
理解steps参数，我们应该跳出图像的思维，1D卷积通常施用在时序数据中，在时序数据的输入中:
- batch_size: 输入的样本数
- steps: 时间维度，个人认为可以理解成量化后的时间长度，也就是多少个时刻
- input_dim: 每个时刻的特征数量