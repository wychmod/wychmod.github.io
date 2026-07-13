# Python 面试核心速查

> **正文 16KB+ 完整版**：[`archive/old-interview-notes/python面试.md`](../archive/old-interview-notes/python面试.md) + [`archive/old-interview-notes/python服务器端面试.md`](../archive/old-interview-notes/python服务器端面试.md)

---

## 一、Python 基础（高频 10 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | list append 时间复杂度？ | 均摊 O(1)，触发扩容时 O(n) |
| 2 | 浅拷贝 vs 深拷贝？ | 浅拷贝只复制第一层，深拷贝递归所有层 |
| 3 | dict 底层结构？ | 哈希表（开放寻址解决冲突），平均 O(1) |
| 4 | list vs tuple？ | list 可变，tuple 不可变（可哈希，可作 dict key） |
| 5 | GIL 影响？ | 同一时刻只一个线程执行字节码，CPU 密集型受限于 GIL |
| 6 | 什么是单元测试？ | 针对程序模块最小单位的正确性校验 |
| 7 | *args vs **kwargs？ | 前者 tuple，后者 dict |
| 8 | Python 2 vs 3 主要区别？ | print 函数、Unicode、除法、yield from、async/await |
| 9 | 可变对象作为默认参数？ | 坑：默认参数只初始化一次，会累积状态 |
| 10 | Monkey Patch 是什么？ | 运行时替换模块属性，常用于依赖替换/性能优化 |

---

## 二、数据结构与算法（高频 5 题）

| # | 题目 | 一句话回答 |
|---|---|---|
| 1 | Python dict 哈希冲突？ | CPython 用开放寻址法（不是链表法） |
| 2 | LRU 缓存实现？ | `collections.OrderedDict`（移动到末尾代表最新使用） |
| 3 | 常见排序算法复杂度？ | 冒泡 O(n²) / 快排 O(n log n) / 归并 O(n log n) / 堆排 O(n log n) |
| 4 | Python 堆？ | `heapq` 模块，最小堆 |
| 5 | collections 常用？ | Counter / OrderedDict / defaultdict / deque |

---

## 三、设计模式（高频 5 题）

| # | 题目 | 一句话 |
|---|---|---|
| 1 | 工厂模式 | 隐藏对象创建过程 |
| 2 | 建造者模式 | 分离复杂对象的构建和表示 |
| 3 | 原型模式 | 通过克隆原型创建新对象 |
| 4 | 单例模式 | 全局只有一个实例（如 logging） |
| 5 | 装饰器模式 | Python `@decorator` 语法糖就是典型应用 |

---

## 四、底层（高频 5 题）

| # | 题目 | 一句话 |
|---|---|---|
| 1 | CPython 内存管理？ | 引用计数 + 标记清除 + 分代回收 |
| 2 | 内存池机制？ | 小对象从池分配，减少 malloc/free 开销 |
| 3 | 垃圾回收触发？ | 达到阈值 + 手动 `gc.collect()` |
| 4 | 装饰器原理？ | 闭包 + 语法糖 |
| 5 | 生成器原理？ | `yield` 暂停 + 状态保存 |

---

## 五、Flask / Django（高频 3 题）

| # | 题目 | 一句话 |
|---|---|---|
| 1 | Django MRO？ | C3 线性化算法，super() 按 MRO 顺序调用 |
| 2 | Flask 上下文？ | 应用上下文 + 请求上下文，依赖 LocalStack |
| 3 | Django vs Flask？ | Django 大而全（自带 ORM/Admin），Flask 小而精（自由组合） |

---

## 📚 完整问答

- [`archive/old-interview-notes/python面试.md`](../archive/old-interview-notes/python面试.md) — 16KB 完整题库
- [`archive/old-interview-notes/python服务器端面试.md`](../archive/old-interview-notes/python服务器端面试.md) — 8KB Web 端补充
