## Python中的堆

_Python_ 标准库内置了 **优先队列** 实现，这就是 _heapq_ 模块。我们知道堆是一种完全二叉树，可以保存于数组中；而 _list_ 对象就是一种典型的动态数组结构！因此， _heapq_ 将堆维护于 _list_ 对象中，而不是提供一种新容器对象。相反，_heapq_ 提供了几个关键操作函数，可直接操作 _list_ 对象：

-   _heapify_ ，将 _list_ 对象转化成堆(调整元素顺序以满足堆性质)；
-   _heappush_ ，将新元素压入堆中；
-   _heappop_ ，弹出堆顶元素；
-   _etc_

创建一个列表对象并将其作为一个堆来使用：

```python
heap = []
```

往堆中压入新元素，被压入元素对象必须 **可比较** ，自定义类需要实现 ___lt___ 等比较方法：

```python
heappush(heap, item)
```

_heapq_ 将 _list_ 对象维护成 **最小堆** ，因此 **堆顶** (树的 **根节点** )即为最小值：

```python
smallest = top = heap[0]
```

当然了，我们也可以将最小值从堆中弹出：

```python
item = heappop(heap)
```

## 古典多线程调度

假设我们接到一个需求——设计定时任务执行系统。定时任务由 _JobItem_ 类抽象，_executing_ts_ 是任务执行时间：

```python
class JobItem:
    
    def __init__(self, executing_ts, job):
        self.executing_ts = executing_ts
        self.job = job
        # ...
```

初学者可能会想到最简单的多线程方案。系统需要同时处理多个定时任务，每个任务由一个线程来执行不就好了吗？这就是古典多线程模型，实例代码如下：

```python
import time
from threading import Thread

def job_worker(job_item):
    # 先等待执行时间到达
    time.sleep(job_item.executing_ts - time.time())

    # 实际执行任务
    process(job_item.job)
    
def add_job(job_item):
    # 启动一个线程来执行任务
    Thread(target=job_worker, args=(job_item,)).start()
```

-   _job_worker_ ，工作线程执行函数，线程先睡眠等待执行时间到达( _6_ 行)，然后调用 _process_ 来执行( _8_ 行)；
-   _add_job_ ，添加新定时任务时，启动一个新线程来处理；

这个方案虽然很简洁，但也很鸡肋。一方面，创建、销毁线程的开销很大；另一方面，由于线程需要占用不少资源，而系统能够支持的最大线程数相对有限。假设现在有成千上万的定时任务等待执行，系统能撑得住吗？

## 调度线程引入

采用多线程方案时，需要合理控制工作线程的 **个数** 。我们可以将执行时间已到达的任务放进一个 **就绪任务队列** ，然后启动若干个工作线程来执行就绪任务。新任务执行时间不定，可能有的是一分钟后执行，有的是一天后才执行。那么，问题就转变成——如何判断任务是否就绪？

这时，我们可以用另一个线程—— **调度线程** 来完成这个使命。调度线程不断接收新任务，并在任务到期时将其添加至就绪任务队列。如果我们用另一个队列来保存新任务，那么调度线程便是两个队列间的 **任务搬运工** ：