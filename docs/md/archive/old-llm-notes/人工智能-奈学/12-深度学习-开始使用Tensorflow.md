# 人工智能-深度学习-开始使用Tensorflow-12

## 基本分类(初学者快速入门)
```
"""
构建一个普通的两层神经网络对minist手写数字集进行训练
这次只是对流程的概述，具体细节会逐步展开
"""
# In[]
import tensorflow as tf
mnist = tf.keras.datasets.mnist

# 数据位置，自己运行时候需要重新设置自己的路径
root_dir = ''
data_name = 'mnist.npz'
data_path = root_dir + data_name

# 如果没有数据路径参数，直接从网上下载，有时候会下载比较慢
is_down = True
if is_down:
  (x_train, y_train),(x_test, y_test) = mnist.load_data()
else:
  (x_train, y_train),(x_test, y_test) = mnist.load_data(data_path)

# In[]
# 查看数据shape
print(x_train.shape, x_test.shape)
print(y_train.shape, y_test.shape)

# In[]
# 对图像数据归一化处理
x_train, x_test = x_train / 255.0, x_test / 255.0

# In[]
# 建立神经网络模型
# Flatten()是把28*28的二维数据转为一维向量
# dropout 控制过拟合的方式 Dense 多少个神经元进行全连接
# 第二个dense是因为十个数字所以最后是十个神经元，用softmax一个判断概率的激活函数
model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(),
  tf.keras.layers.Dense(512, activation=tf.nn.relu),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10, activation=tf.nn.softmax)
])

# In[]
# 设置神经网络训练参数，对于优化方法，初学者可以直接选择adam，
# 它是自适应的，可以直接使用缺省参数，大多数情况下，优化效果都很好。
"""
如果你的 targets 是 one-hot 编码，用 categorical_crossentropy
　　one-hot 编码：[0, 0, 1], [1, 0, 0], [0, 1, 0]
 
如果你的 tagets 是 数字编码 ，用 sparse_categorical_crossentropy
　　数字编码：2, 0, 1
"""
# In[]
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])


# In[]
# 进行训练， batch_size=32是缺省值，当然也可以自己设置，verbose = 1，缺省值，控制进度输出，可以取0，1，2
# 一个epoch表示所有训练样本训练完一次， 一个epoch训练次数 = 训练样本总数/batch_size 
model.fit(x_train, y_train, verbose=2, epochs=10, batch_size=100)


# 训练完后，用测试数据进行评估
score = model.evaluate(x_test, y_test)
print(score)

```

## 基本分类：对服装图像进行分类
**版本2.5**
```
"""
本指南将训练一个神经网络模型，对运动鞋和衬衫等服装图像进行分类。即使您不理解所有细节也没关系；这只是对完整 TensorFlow 程序的快速概述，详细内容会在您实际操作的同时进行介绍。
本指南使用了 tf.keras，它是 TensorFlow 中用来构建和训练模型的高级 API。
"""
# 引用 TensorFlow and tf.keras
import tensorflow as tf
from tensorflow import keras

# 辅助库
import numpy as np
import matplotlib.pyplot as plt

print(tf.__version__)

# 加载Fashion MNIST数据集
fashion_mnist = keras.datasets.fashion_mnist

# train_images 和 train_labels 数组是训练集，即模型用于学习的数据。
# 测试集、test_images 和 test_labels 数组会被用来对模型进行测试。
(train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()

# 每个图像都会被映射到一个标签。由于数据集不包括类名称，请将它们存储在下方，供稍后绘制图像时使用
class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
               'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']
               
train_images.shape
len(train_labels)
train_labels
test_images.shape

"""
预处理数据
在训练网络之前，必须对数据进行预处理。如果您检查训练集中的第一个图像，您会看到像素值处于 0 到 255 之间：
"""
# 画出第一个数据的图
plt.figure()
plt.imshow(train_images[0])
plt.colorbar()
plt.grid(False)
plt.show()

# 将数据归一化
train_images = train_images / 255.0

test_images = test_images / 255.0

# 图像显示前25个
plt.figure(figsize=(10,10))
for i in range(25):
    plt.subplot(5,5,i+1)
    plt.xticks([])
    plt.yticks([])
    plt.grid(False)
    plt.imshow(train_images[i], cmap=plt.cm.binary)
    plt.xlabel(class_names[train_labels[i]])
plt.show()

# 构建神经网络
# Flatten将图像格式从二维数组（28 x 28 像素）转换成一维数组（28 x 28 = 784 像素）
# Dense 层的序列。它们是密集连接或全连接神经层。第一个 Dense 层有 128 个节点（或神经元）。第二个（也是最后一个）层会返回一个长度为 10 的 logits 数组。每个节点都包含一个得分，用来表示当前图像属于 10 个类中的哪一类。
model = keras.Sequential([
    keras.layers.Flatten(input_shape=(28, 28)),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(10)
])

# 编译模型
# 损失函数 - 用于测量模型在训练期间的准确率。您会希望最小化此函数，以便将模型“引导”到正确的方向上。
# 优化器 - 决定模型如何根据其看到的数据和自身的损失函数进行更新。
# 指标 - 用于监控训练和测试步骤。以下示例使用了准确率，即被正确分类的图像的比率。
model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])
              
# 训练模型
model.fit(train_images, train_labels, epochs=10)

# 评估准确率
test_loss, test_acc = model.evaluate(test_images,  test_labels, verbose=2)

print('\nTest accuracy:', test_acc)

# 进行预测
# 在模型经过训练后，您可以使用它对一些图像进行预测。模型具有线性输出，即 logits。您可以附加一个 softmax 层，将 logits 转换成更容易理解的概率。

probability_model = tf.keras.Sequential([model,tf.keras.layers.Softmax()])
predictions = probability_model.predict(test_images)
predictions[0]

# 显示数组中概率最大的值
np.argmax(predictions[0])

# 检查预测的是否正确
test_labels[0]

# 图形验证预测结果
def plot_image(i, predictions_array, true_label, img):
  predictions_array, true_label, img = predictions_array, true_label[i], img[i]
  plt.grid(False)
  plt.xticks([])
  plt.yticks([])

  plt.imshow(img, cmap=plt.cm.binary)

  predicted_label = np.argmax(predictions_array)
  if predicted_label == true_label:
    color = 'blue'
  else:
    color = 'red'

  plt.xlabel("{} {:2.0f}% ({})".format(class_names[predicted_label],
                                100*np.max(predictions_array),
                                class_names[true_label]),
                                color=color)

def plot_value_array(i, predictions_array, true_label):
  predictions_array, true_label = predictions_array, true_label[i]
  plt.grid(False)
  plt.xticks(range(10))
  plt.yticks([])
  thisplot = plt.bar(range(10), predictions_array, color="#777777")
  plt.ylim([0, 1])
  predicted_label = np.argmax(predictions_array)

  thisplot[predicted_label].set_color('red')
  thisplot[true_label].set_color('blue')
  
 i = 0
plt.figure(figsize=(6,3))
plt.subplot(1,2,1)
plot_image(i, predictions[i], test_labels, test_images)
plt.subplot(1,2,2)
plot_value_array(i, predictions[i],  test_labels)
plt.show()

# 失败例子
i = 12
plt.figure(figsize=(6,3))
plt.subplot(1,2,1)
plot_image(i, predictions[i], test_labels, test_images)
plt.subplot(1,2,2)
plot_value_array(i, predictions[i],  test_labels)
plt.show()

# 预测绘制几张图像
# Plot the first X test images, their predicted labels, and the true labels.
# Color correct predictions in blue and incorrect predictions in red.
num_rows = 5
num_cols = 3
num_images = num_rows*num_cols
plt.figure(figsize=(2*2*num_cols, 2*num_rows))
for i in range(num_images):
  plt.subplot(num_rows, 2*num_cols, 2*i+1)
  plot_image(i, predictions[i], test_labels, test_images)
  plt.subplot(num_rows, 2*num_cols, 2*i+2)
  plot_value_array(i, predictions[i], test_labels)
plt.tight_layout()
plt.show()

# 使用训练好的模型，对单个图像进行预测
# Grab an image from the test dataset.
img = test_images[1]

print(img.shape)
# tf.keras 模型经过了优化，可同时对一个批或一组样本进行预测。因此，即便您只使用一个图像，您也需要将其添加到列表中：
img = (np.expand_dims(img,0))

print(img.shape)

predictions_single = probability_model.predict(img)

print(predictions_single)

np.argmax(predictions_single[0])
```

## 基本文体分类-电影评论文本分类
**版本2.5**
```
"""
此笔记本（notebook）使用评论文本将影评分为积极（positive）或消极（nagetive）两类。
这是一个二元（binary）或者二分类问题，一种重要且应用广泛的机器学习问题。

我们将使用来源于网络电影数据库（Internet Movie Database）的 IMDB 数据集（IMDB dataset），
其包含 50,000 条影评文本。从该数据集切割出的25,000条评论用作训练，另外 25,000 条用作测试。
训练集与测试集是平衡的（balanced），意味着它们包含相等数量的积极和消极评论。
"""
import tensorflow as tf
from tensorflow import keras

import numpy as np

print(tf.__version__)

# 下载 IMDB 数据集
# 参数 num_words=10000 保留了训练数据中最常出现的 10,000 个单词。为了保持数据规模的可管理性，低频词将被丢弃。
imdb = keras.datasets.imdb

(train_data, train_labels), (test_data, test_labels) = imdb.load_data(num_words=10000)

print("Training entries: {}, labels: {}".format(len(train_data), len(train_labels)))
print(train_data[0])

# 电影评论可能具有不同的长度。以下代码显示了第一条和第二条评论的中单词数量。由于神经网络的输入必须是统一的长度，我们稍后需要解决这个问题。
len(train_data[0]), len(train_data[1])

# 将整数转换回单词
word_index = imdb.get_word_index()

# 留出前三个索引
word_index = {k:(v+3) for k,v in word_index.items()}
word_index["<PAD>"] = 0
word_index["<START>"] = 1
word_index["<UNK>"] = 2  # unknown
word_index["<UNUSED>"] = 3

# kv互换，原本word_index里面是字母：index的形式
reverse_word_index = dict([(value, key) for (key, value) in word_index.items()])

def decode_review(text):
    return ' '.join([reverse_word_index.get(i, '?') for i in text])

# 使用 decode_review 函数来显示首条评论的文本：
decode_review(train_data[0])

"""
影评——即整数数组必须在输入神经网络之前转换为张量。这种转换可以通过以下两种方式来完成：

1. 将数组转换为表示单词出现与否的由 0 和 1 组成的向量，类似于 one-hot 编码。例如，序列[3, 5]
将转换为一个 10,000 维的向量，该向量除了索引为 3 和 5 的位置是 1 以外，其他都为 0。然后，将其作为
网络的首层——一个可以处理浮点型向量数据的稠密层。不过，这种方法需要大量的内存，
需要一个大小为 num_words * num_reviews 的矩阵。

2. 或者，我们可以填充数组来保证输入数据具有相同的长度，然后创建一个大小为 max_length * num_reviews 的整型张量。
我们可以使用能够处理此形状数据的嵌入层作为网络中的第一层。
"""
train_data = keras.preprocessing.sequence.pad_sequences(train_data,
                                                        value=word_index["<PAD>"],
                                                        padding='post',
                                                        maxlen=256)

test_data = keras.preprocessing.sequence.pad_sequences(test_data,
                                                       value=word_index["<PAD>"],
                                                       padding='post',
                                                       maxlen=256)
                                                       
len(train_data[0]), len(train_data[1])

# 检查一下首条评论（当前已经填充）
print(train_data[0])

# 构建模型
# 输入形状是用于电影评论的词汇数目（10,000 词）
vocab_size = 10000

# 顺序模型，每层的输入和输出是连续的
model = keras.Sequential()
# 嵌入（Embedding）层。该层采用整数编码的词汇表，并查找每个词索引的嵌入向量（embedding vector）。
# 这些向量是通过模型训练学习到的。向量向输出数组增加了一个维度。
model.add(keras.layers.Embedding(vocab_size, 16))
# 变成一维数据
model.add(keras.layers.GlobalAveragePooling1D())
model.add(keras.layers.Dense(16, activation='relu'))
# 使用 Sigmoid 激活函数，其函数值为介于 0 与 1 之间的浮点数，表示概率或置信度。
model.add(keras.layers.Dense(1, activation='sigmoid'))

model.summary()

"""
损失函数与优化器
一个模型需要损失函数和优化器来进行训练。由于这是一个二分类问题且模型输出概率值（一个使用 sigmoid 激活函数的单一单元层），我们将使用 binary_crossentropy 损失函数。

这不是损失函数的唯一选择，例如，您可以选择 mean_squared_error 。但是，一般来说 binary_crossentropy 更适合处理概率——它能够度量概率分布之间的“距离”，或者在我们的示例中，指的是度量 ground-truth 分布与预测值之间的“距离”。

稍后，当我们研究回归问题（例如，预测房价）时，我们将介绍如何使用另一种叫做均方误差的损失函数。
"""
model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])
              
# 创建一个验证集
# 目标是只使用训练数据来开发和调整模型，然后只使用一次测试数据来评估准确率（accuracy）
x_val = train_data[:10000]
partial_x_train = train_data[10000:]

y_val = train_labels[:10000]
partial_y_train = train_labels[10000:]

"""
以 512 个样本的 mini-batch 大小迭代 40 个 epoch 来训练模型。
这是指对 x_train 和 y_train 张量中所有样本的的 40 次迭代。
在训练过程中，监测来自验证集的 10,000 个样本上的损失值（loss）和准确率（accuracy）：
"""
history = model.fit(partial_x_train,
                    partial_y_train,
                    epochs=40,
                    batch_size=512,
                    validation_data=(x_val, y_val),
                    verbose=1)
                    
# 评估性能
results = model.evaluate(test_data,  test_labels, verbose=2)

print(results)

# 创建一个准确率（accuracy）和损失值（loss）随时间变化的图表
# History 对象，该对象包含一个字典，其中包含训练阶段所发生的一切事件
history_dict = history.history
history_dict.keys()

import matplotlib.pyplot as plt

acc = history_dict['accuracy']
val_acc = history_dict['val_accuracy']
loss = history_dict['loss']
val_loss = history_dict['val_loss']

epochs = range(1, len(acc) + 1)

# “bo”代表 "蓝点"
plt.plot(epochs, loss, 'bo', label='Training loss')
# b代表“蓝色实线”
plt.plot(epochs, val_loss, 'b', label='Validation loss')
plt.title('Training and validation loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

plt.show()

plt.clf()   # 清除数字

plt.plot(epochs, acc, 'bo', label='Training acc')
plt.plot(epochs, val_acc, 'b', label='Validation acc')
plt.title('Training and validation accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.show()
```