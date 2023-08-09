# 1. 存储器的硬件层面
## 1.1 存储器的层次结构

![](../youdaonote-images/Pasted%20image%2020230809223501.png)
![](../youdaonote-images/Pasted%20image%2020230809223542.png)

## 1.2 硬件层数据一致性

> 缓存一致性问题。在多处理器系统中，每个处理器有自己的高速缓存，而他们又共享同一块内存（下文成主存，main memory 主要内存），当多个处理器运算都涉及到同一块内存区域的时候，就有可能发生缓存不一致的现象。

为了解决这一问题，需要各个处理器运行时都遵循一些协议，在运行时需要通过这些协议保证数据的一致性。比如MSI、MESI(intel)、MOSI、Synapse、Firely、DragonProtocol等。

![](../youdaonote-images/Pasted%20image%2020230809224110.png)

古老CPU是总线锁，总线锁会锁住总线，使得其他CPU甚至不能访问内存中其他的地址，因而效率较低
**现代CPU的数据一致性实现 = 缓存锁(MESI ...) + 总线锁**

**读取缓存以cache line为基本单位，目前64bytes**

> MESI协议：`CPU`中每个缓存行（`caceh line`)使用4种状态进行标记（使用额外的两位(`bit`)表示):
> 1. **M: 被修改（Modified)**
> 2. **E: 独享的（Exclusive)**
> 3. **S: 共享的（Shared)**
> 4. **I: 无效的（Invalid）**
> 在多核系统中，每个核心都会有自己的缓存共享主存总线，每个相应的`CPU`会发出读写请求，而缓存的目的是为了减少`CPU`读写共享主存的次数。
> 
> 一个缓存除在`Invalid`状态外都可以满足cpu的读请求，一个`Invalid`的缓存行必须从主存中读取（变成`S`或者 `E`状态）来满足该`CPU`的读请求。
> 一个写请求只有在该缓存行是M或者E状态时才能被执行，如果缓存行处于`S`状态，必须先将其它缓存中该缓存行变成`Invalid`状态（也既是不允许不同`CPU`同时修改同一缓存行，即使修改该缓存行中不同位置的数据也不允许）。

> 有些无法被缓存的数据,或者跨越多个缓存行的数据,依然必须使用总线锁
### 1.2.1 伪共享问题

**位于同一缓存行的两个不同数据，被两个不同CPU锁定，产生互相影响**

解决方案：
1. 使用对齐填充
2. 使用@contented注解，通过缓存行填充来解决伪共享问题

```java
// 伪共享问题, 效率会特别低
public class T03_CacheLinePadding {
​
    public static volatile long[] arr = new long[2];
​
    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(()->{
            for (long i = 0; i < 10000_0000L; i++) {
                arr[0] = i;
            }
        });
​
        Thread t2 = new Thread(()->{
            for (long i = 0; i < 10000_0000L; i++) {
                arr[1] = i;
            }
        });
​
        final long start = System.nanoTime();
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println((System.nanoTime() - start)/100_0000);
    }
}

// 8*8=64字节，对齐填充可以解决伪共享问题
public class T04_CacheLinePadding {
​
    public static volatile long[] arr = new long[16];
​
    public static void main(String[] args) throws Exception {
        Thread t1 = new Thread(()->{
            for (long i = 0; i < 10000_0000L; i++) {
                arr[0] = i;
            }
        });
​
        Thread t2 = new Thread(()->{
            for (long i = 0; i < 10000_0000L; i++) {
                arr[8] = i;
            }
        });
​
        final long start = System.nanoTime();
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println((System.nanoTime() - start)/100_0000);
    }
}
```

> 使用缓存行的对齐能够提高效率

## 1.3 乱序问题

CPU为了提高指令执行效率，会在一条指令执行过程中（比如去内存读数据（慢100倍）），去同时执行另一条指令，前提是，两条指令没有依赖关系