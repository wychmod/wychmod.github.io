![img](https:////upload-images.jianshu.io/upload_images/4162886-14fd80dfa12be83f?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)



首先看看出场的角色，第一个是client客户端，用来发起读写请求，读取HDFS上的文件或往HDFS中写文件；第二个是Namenode，唯一的一个，会协调所有客户端发起的请求；第三个是DataNode，负责数据存储，跟Namenode不一样，DataNode有很多个，有时候能达到数以千计。

### 写数据流程



![img](https:////upload-images.jianshu.io/upload_images/4162886-c56b35addbbcc941?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)



往HDFS中写数据的流程如下：

第1幅图：我们跟客户端说，你帮我写一个200M的数据吧，客户端说没问题啊，但是...

第2幅图：客户端不知道我们对数据有没有其他的要求啊，问我们是不是忘了什么东西呢？我们想起来我们还是有要求的，第一我们要把数据分成若干块，并且每块的大小是128M，第二，每个数据块应该复制3份。其实这就是我们说的HDFS的文件分块和多副本，如果你不说的话客户端怎么知道到底怎么分，复制多少份呢？

第3幅图：由上面的对话我们发现，如果对于每个文件客户端都要这么问一下，是不是太麻烦了？所以说一个好的客户端应该是，用户就算不说你也要知道有这两个属性：**块的大小**，一个文件应该按照怎样的大小切分（通常是64M或128M）；**复制因子**，每个块应该复制多少份（通常是3份），也就是说如果用户不主动提供这些属性，那么就按照默认的来。

第4幅图：现在客户端已经知道了每个块的大小了，那么把200M的文件分成128M和72M两个块，一个长一个短。

第5幅图：切分后客户端就开始工作了，既然有两个块，那先上传第一个块，于是客户端请求Namenode帮它写一个128M的块，并且要复制3份。

第6幅图：Namenode接受到客户端的请求后，既然需要3个副本，那么就需要找到3个DataNode，Namenode就会想怎么去找到这3个DataNode呢？我该告诉客户端哪些信息呢？于是它就去它管理的DataNode中找一些满足要求的空闲节点。

第7幅图：Namenode找到了3个节点，现在把找到的节点发给客户端，表示：兄弟，你不是要我帮你写数据嘛，我给你找到了这3个合适的DataNode，并且已经按距离远近给你排过序了，第一个是最近的，你把数据给他们让他们帮你写吧。

第8幅图：客户端收到3个DataNode地址后，直接把数据发送到第一个节点(DataNode1)上，然后DataNode1开始把数据写到他的硬盘中。

第9、10、11幅图：DataNode1在接受数据的同时，会把刚刚收到的数据发送到第二个DataNode2上，同理DataNode2也是，接收的同时把数据立马发给DataNode3，到了DataNode3已经是最后一个DataNode了。整个过程跟流水线一样，接收一点就发一点。（个人感觉跟计算机网络中令牌环网的工作原理有些类似）



![img](https:////upload-images.jianshu.io/upload_images/4162886-a0cb23726a3527a0?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)



第12幅图：Namenode是所有DataNode的老大，所以DataNode在存完数据后要跟老大汇报，告诉他说，我第一个块的数据已经写完了。

第13幅图：3个DataNode都报告完成后，好，这样第一个数据块就写完了，下面对第二个块重复这个步骤。

第14幅图：所有的块都写完了之后，客户端关闭跟Namenode的连接。这时Namenode已经存储了文件的元数据，也就是文件被拆成了几块，复制了几份，每块分别存储在哪个DataNode上。

最后一幅图说明了每个角色在写数据过程中的作用:

- Client：切分文件成数据块。
- Namenode：对于每个数据块，找到存储的DataNode地址。
- DataNode：多副本方式存储数据。

### 读数据流程



![img](https:////upload-images.jianshu.io/upload_images/4162886-30f262c9837bbf00?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)



下面看看读文件的流程，同样还是这些角色。

第1幅图：写文件已经搞定了，那么怎么读文件呢？我们先跟客户端说，嘿兄弟！帮我读个文件呗！

第2幅图：客户端跟Namenode发了个请求，把文件名发送给Namenode，表示我想要这个这个文件的信息。

第3幅图：Namenode找了找，然后找到了一个结果，结果包含这个文件被拆成了多少块，每个块存储在哪些DataNode上的信息，并且DataNode同样是按照距离排序的。然后把这个结果发送给客户端，说，嘿兄弟！你要的文件在这些DataNode上，你去找吧。

第4幅图：现在客户端知道了文件的存储情况，所以就一个个去DataNode上访问就好了。

最后提出了一个问题：如果这个过程中DataNode挂了，或者数据在传输中出了问题怎么办？事实上

HDFS对于这些问题都是能够完美解决的。

### 错误处理

下面是出错处理的一些漫画，有不少是计算机网络的思想，英文也不是很难，就不一一详细解释了，这里只列出来。



![img](https:////upload-images.jianshu.io/upload_images/4162886-2b4b237c7522475f?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)





![img](https:////upload-images.jianshu.io/upload_images/4162886-b22cdffaf931c00c?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)





![img](https:////upload-images.jianshu.io/upload_images/4162886-5a9635c54195cb57?imageMogr2/auto-orient/strip%7CimageView2/2/w/1000/format/webp)



其实很多思想跟计算机网络中信息传递的原理很类似，比如，在传送数据的时候怎么保证正确性？引入校验的概念，传数据的同时把校验的结果也一并发过去，接收方接收数据校验后与接收到的校验结果对比就可以确保发送的是正确的数据；至于怎样确认对方收到数据，使用的是ack应答机制，接收方接受到一个数据就发一个ack表示我已经收到了数据了。

