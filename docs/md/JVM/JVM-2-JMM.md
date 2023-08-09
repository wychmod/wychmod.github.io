# 1. 存储器的硬件层面
## 1.1 存储器的层次结构

![](../youdaonote-images/Pasted%20image%2020230809223501.png)
![](../youdaonote-images/Pasted%20image%2020230809223542.png)

## 1.2 硬件层数据一致性

> 缓存一致性问题。在多处理器系统中，每个处理器有自己的高速缓存，而他们又共享同一块内存（下文成主存，main memory 主要内存），当多个处理器运算都涉及到同一块内存区域的时候，就有可能发生缓存不一致的现象。

为了解决这一问题，需要各个处理器运行时都遵循一些协议，在运行时需要通过这些协议保证数据的一致性。比如MSI、MESI(intel)、MOSI、Synapse、Firely、DragonProtocol等。

![](../youdaonote-images/Pasted%20image%2020230809224110.png)