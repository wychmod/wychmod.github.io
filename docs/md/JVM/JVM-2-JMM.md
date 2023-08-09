# 1. 存储器的硬件层面
## 1.1 存储器的层次结构

![](../youdaonote-images/Pasted%20image%2020230809223501.png)
![](../youdaonote-images/Pasted%20image%2020230809223542.png)

## 1.2 硬件层数据一致性

> 缓存一致性问题。在多处理器系统中，每个处理器有自己的高速缓存，而他们又共享同一块内存（下文成主存，main memory 主要内存），当多个处理器运算都涉及到同一块内存区域的时候，就有可能发生缓存不一致的现象。

为了解决这一问题，需要各个处理器运行时都遵循一些协议，在运行时需要通过这些协议保证数据的一致性。比如MSI、MESI(intel)、MOSI、Synapse、Firely、DragonProtocol等。

![](../youdaonote-images/Pasted%20image%2020230809224110.png)

**现代CPU的数据一致性实现 = 缓存锁(MESI ...) + 总线锁**

> MESI协议：`CPU`中每个缓存行（`caceh line`)使用4种状态进行标记（使用额外的两位(`bit`)表示):
> 1. **M: 被修改（Modified)**
> 2. **E: 独享的（Exclusive)**
> 3. **S: 共享的（Shared)**
> 4. **I: 无效的（Invalid）**
> 在多核系统中，每个核心都会有自己的缓存共享主存总线，每个相应的`CPU`会发出读写请求，而缓存的目的是为了减少`CPU`读写共享主存的次数。
> 一个缓存除在`Invalid`状态外都可以满足cpu的读请求，一个`Invalid`的缓存行必须从主存中读取（变成`S`或者 `E`状态）来满足该`CPU`的读请求。
> 


