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

CPU为了提高指令执行效率，会在一条指令执行过程中（比如去内存读数据（慢100倍）），去同时执行另一条指令，前提是，两条指令没有依赖关系。

读指令的同时可以同时执行不影响的其他指令，而写的同时可以进行**合并写**

> 个数时依赖cpu模型的，intel的cpu在同一时刻只能拿到4个。 每次写入四个及四个以下的效率高于一次性写八个，写八个会卡住。

乱序执行的证明：
**如果两个线程正常运行，就不会出现x=0，y=0的情况，但是指令重排就会出现x=0，y=0**
```java
public class T04_Disorder {  
    private static int x = 0, y = 0;  
    private static int a = 0, b =0;  
  
    public static void main(String[] args) throws InterruptedException {  
        int i = 0;  
        for(;;) {  
            i++;  
            x = 0; y = 0;  
            a = 0; b = 0;  
            Thread one = new Thread(new Runnable() {  
                public void run() {  
                    //由于线程one先启动，下面这句话让它等一等线程two. 读着可根据自己电脑的实际性能适当调整等待时间.  
                    //shortWait(100000);                    
                    a = 1;  
                    x = b;                }            });  
  
            Thread other = new Thread(new Runnable() {  
                public void run() {  
                    b = 1;  
                    y = a;                }            });  
            one.start();other.start();  
            one.join();other.join();  
            String result = "第" + i + "次 (" + x + "," + y + "）";  
            if(x == 0 && y == 0) {  
                System.err.println(result);  
                break;  
            } else {  
                //System.out.println(result);  
            }  
        }    }}

```

> as if serial 不管如何重排序，单线程执行结果不会改变
## 1.4 java并发内存模型

![](../youdaonote-images/Pasted%20image%2020230809232225.png)

## 1.5 如何保证特定情况下不乱序

- 硬件级别内存屏障 X86

> sfence：store| 在sfence指令前的写操作当必须在sfence指令后的写操作前完成。 
> lfence：load | 在lfence指令前的读操作当必须在lfence指令后的读操作前完成。 
> mfence：modify/mix | 在mfence指令前的读写操作当必须在mfence指令后的读写操作前完成。

> 原子指令，如x86上的”lock …” 指令是一个Full Barrier，执行时会锁住内存子系统来确保执行顺序，甚至跨多个CPU。Software Locks通常使用了内存屏障或原子指令来实现变量可见性和保持程序顺序

- JVM级别如何规范（JSR133）

> LoadLoad屏障： 对于这样的语句Load1; LoadLoad; Load2，
> 
> 在Load2及后续读取操作要读取的数据被访问前，保证Load1要读取的数据被读取完毕。
> 
> StoreStore屏障：
> 
> 对于这样的语句Store1; StoreStore; Store2，  
> ​  
> 在Store2及后续写入操作执行前，保证Store1的写入操作对其它处理器可见。
> 
> LoadStore屏障：
> 
> 对于这样的语句Load1; LoadStore; Store2，  
> ​  
> 在Store2及后续写入操作被刷出前，保证Load1要读取的数据被读取完毕。
> 
> StoreLoad屏障： 对于这样的语句Store1; StoreLoad; Load2，
> 
> 在Load2及后续所有读取操作执行前，保证Store1的写入对所有处理器可见。

- volatile的实现细节

1. 字节码层面 ACC_VOLATILE 只是加了一个标记
    
2. JVM层面 volatile内存区的读写 都加屏障
    
    > StoreStoreBarrier
    > 
    > volatile 写操作
    > 
    > StoreLoadBarrier
    
    > LoadLoadBarrier
    > 
    > volatile 读操作
    > 
    > LoadStoreBarrier
    
3. OS和硬件层面 [https://blog.csdn.net/qq_26222859/article/details/52235930](https://blog.csdn.net/qq_26222859/article/details/52235930) 
	hsdis - HotSpot Dis Assembler windows lock 指令实现 | MESI实现
    

- synchronized实现细节

1. 字节码层面 ACC_SYNCHRONIZED monitorenter monitorexit
    
2. JVM层面 C C++ 调用了操作系统提供的同步机制
    
3. OS和硬件层面 X86 : lock cmpxchg(比较并交换指令) /  [https](https://blog.csdn.net/21aspnet/article/details/88571740)[://blog.csdn.net/21aspnet/article/details/](https://blog.csdn.net/21aspnet/article/details/88571740)[88571740](https://blog.csdn.net/21aspnet/article/details/88571740)

# 2. 对象内存布局

1. 请解释一下对象的创建过程？
2. 对象在内存中的存储布局？
3. 对象头具体包括什么？
4. 对象怎么定位？
5. 对象怎么分配？
6. Object o = new Object在内存中占用多少字节？

## 2.1 对象的创建过程？
1. class loading
2. class linking (verification, preparation, resolution)
3. class initializing
4. 申请对象内存
5. 成员变量赋默认值
6. 调用构造方法\<init\>
	1. 成员变量顺序赋初始值
	2. 执行构造方法语句

## 2.2 对象在内存中的存储布局
![](../youdaonote-images/Pasted%20image%2020230810002531.png)
- 普通对象
	1. 对象头：markword 8
	2. ClassPointer指针：-XX:+UseCompressedClassPointers 为4字节 不开启为8字节
	3. 实例数据
	    1. 引用类型：-XX:+UseCompressedOops 为4字节 不开启为8字节 Oops Ordinary Object Pointers
	4. Padding对齐，8的倍数
    
- 数组对象
	1. 对象头：markword 8
	2. ClassPointer指针同上
	3. 数组长度：4字节
	4. 数组数据
	5. 对齐 8的倍数

- 验证
```java
import java.lang.instrument.Instrumentation;

public class ObjectSizeAgent {
    private static Instrumentation inst;

    public static void premain(String agentArgs, Instrumentation _inst) {
        inst = _inst;
    }

    public static long sizeOf(Object o) {
        return inst.getObjectSize(o);
    }
}

public class T03_SizeOfAnObject {
       public static void main(String[] args) {
           System.out.println(ObjectSizeAgent.sizeOf(new Object()));
           System.out.println(ObjectSizeAgent.sizeOf(new int[] {}));
           System.out.println(ObjectSizeAgent.sizeOf(new P()));
       }
   // -XX:+UseCompressedClassPointers 压缩class指针 8->4
   // -XX:+UseCompressedOops 压缩引用指针 8->4
       private static class P {
                           //8 _markword
                           //4 _oop指针
           int id;         //4
           String name;    //4 <- 8
           int age;        //4
   
           byte b1;        //1
           byte b2;        //1
   
           Object o;       //4 <- 8
           byte b3;        //1
   
       }
   }
```

##