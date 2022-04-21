# Java集合框架
[toc]
## 集合概述
### Java 集合概览
**从下图可以看出，在Java中除了以==Map==结尾的类之外， 其他类都实现了 Collection 接⼝。并且,以Map结尾的类都实现了 Map 接⼝。**
![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCE0650d2da06527512c245e9bd2a6e99b9)

### List，Set，Map三者的区别
- List (对付顺序的好帮⼿)： 存储的元素是有序的、可重复的。
- Set (注重独⼀⽆⼆的性质): 存储的元素是⽆序的、不可重复的。
- Map (⽤ Key 来搜索的专家):使⽤键值对（kye-value）存储，类似于数学上的函数 y=f(x)，“x”代表 key，"y"代表 value，Key 是⽆序的、不可重复的，value是⽆序的、可重复的，每个键最多映射到⼀个值。

### 集合框架底层数据结构总结
#### Collection 接⼝下⾯的集合
**list**
- Arraylist：Object[] 数组
- Vector：Object[] 数组
- LinkedList：双向链表(JDK1.6 之前为循环链表，JDK1.7 取消了循环)

**Set**
- HashSet （⽆序，唯⼀）:基于 HashMap 实现的，底层采⽤ HashMap 来保存元素
- LinkedHashSet：LinkedHashSet 是HashSet的⼦类，并且其内部是通过LinkedHashMap 来实现的。有点类似于我们之前说的LinkedHashMap其内部是基于HashMap 实现⼀样，不过还是有⼀点点区别的
- TreeSet （有序，唯⼀）：红⿊树(⾃平衡的排序⼆叉树)

#### Map 接⼝下⾯的集合
- HashMap ： JDK1.8 之前 HashMap 由数组+链表组成的，数组是HashMap 的主体，链表则是主要为了解决哈希冲突⽽存在的（“拉链法”解决冲突）。JDK1.8以后在解决哈希冲突时有了较⼤的变化，当链表⻓度⼤于阈值（默认为8）（将链表转换成红⿊树前会判断，如果当前数组的⻓度⼩于 64，那么会选择先进⾏数组扩容，⽽不是转换为红⿊树）时，将链表转化为红⿊树，以减少搜索时间
- LinkedHashMap ： LinkedHashMap 继承⾃ HashMap，所以它的底层仍然是基于拉链式散列结构即由数组和链表或红⿊树组成。另外，LinkedHashMap在上⾯结构的基础上，增加了⼀条双向链表，使得上⾯的结构可以保持键值对的插⼊顺序。同时通过链表进⾏相应的操作，实现了访问顺序相关逻辑。
- Hashtable ： 数组+链表组成的，数组是 HashMap的主体，链表则是主要为了解决哈希冲突⽽存在的
- TreeMap ： 红⿊树（⾃平衡的排序⼆叉树）

## 如何选择集合？
主要根据集合的特点来选⽤，⽐如我们需要**根据键值**获取到元素值时就⽤ Map 接⼝下的集合，需要排序时选择 TreeMap,不需要排序时就选择HashMap,需要保证线程安全就选⽤ConcurrentHashMap 。

当我们**只需要存放元素值**时，就选择实现Collection接⼝的集合，需要保证元素**唯⼀**时选择实现Set接⼝的集合⽐如TreeSet或HashSet，不需要就选择实现List接⼝的⽐如 ArrayList或LinkedList，然后再根据实现这些接⼝的集合的特点来选⽤。

## 为什么要使用集合？
当我们需要保存⼀组类型相同的数据的时候，我们应该是⽤⼀个容器来保存，这个容器就是数组，但是，使⽤数组存储对象具有⼀定的弊端，因为我们在实际开发中，存储的数据的类型是多种多样的，于是，就出现了“集合”，集合同样也是⽤来存储多个数据的。

数组的缺点是⼀旦声明之后，⻓度就不可变了；同时，声明数组时的数据类型也决定了该数组存储的数据的类型；⽽且，数组存储的数据是有序的、可重复的，特点单⼀。但是集合提⾼了数据存储的灵活性，**Java集合不仅可以⽤来存储不同类型不同数量的对象，还可以保具有映射关系的数据**。

**我们知道数组和集合都用于存放一组数据，但数组的容量是固定大小的，而集合的容量是动态可变的；对于可存放的数据类型，数组既可以存放基本数据类型又可以存放引用数据类型，而集合只能存放引用数据类型，基本数据类型需要转换为对应的包装类才能存放到集合当中**。

### 集合应用场景
- **无法预测存储数据的数量**：由于数组容量是固定大小，因此使用集合存储动态数量的数据更为合适；
- **同时存储具有一对一关系的数据**
- **数据去重**：使用数组实现需要遍历，效率低，而Set集合本身就具有不能重复的特性；
- **需要数据的增删**：使用数组实现增删操作需要遍历、移动数组中元素，如果操作频繁会导致效率降低。

## List集合
### 概念和特性
List是Collection的一个子接口，它有两个主要实现类，分别为ArrayList（动态数组）和LinkedList（链表）。

### ArrayList 实现类
ArrayList 可以理解为动态数组，它的容量可以**动态增长**。当添加元素时，如果发现容量已满，会自动扩容为原始大小的** 1.5 **倍。

#### 构造方法
```java
// 无参构造实例化，初始容量为10
List arrayList1 = new ArrayList();
// 实例化一个初始容量为20的空列表
List arrayList2 = new ArrayList(20);
// 实例化一个集合元素为 arrayList2 的列表（由于 arrayList2 为空列表，因此其实例化的对象也为空列表）
List arrayList3 = new ArrayList(arrayList2);
```

#### 常用成员方法
- void add(E e)：将指定的元素追加到此列表的末尾；

- void add(int index, E element)：将指定的元素插入此列表中的指定位置；

- E remove(int index)：删除此列表中指定位置的元素；

- boolean remove(Object o)：如果存在指定元素，则从该列表中删除第一次出现的该元素；

- void clear()：从此列表中删除所有元素；

- E set(int index, E element)：用指定的元素替换此列表中指定位置的元素；

- E get(int index)：返回此列表中指定位置的元素；

- boolean contains(Object o)：如果此列表包含指定的元素，则返回 true，否则返回 false；

- int size()：返回该列表中元素的数量；

- Object[] toArray()：以正确的顺序（从第一个元素到最后一个元素）返回一个包含此列表中所有元素的数组。

```java
import java.util.ArrayList;
import java.util.List;

public class ArrayListDemo2 {
    public static void main(String[] args) {
        // 实例化一个空列表
        List<String> arrayList = new ArrayList<>();
        // 将字符串元素 Hello 追加到此列表的末尾
        arrayList.add("Hello");
        // 将字符串元素 World 追加到此列表的末尾
        arrayList.add("World");
        // 打印列表
        System.out.println(arrayList);
        // 将字符串元素 Java 插入到此列表中的索引为 1 的位置
        arrayList.add(1, "Java");
        // 打印列表
        System.out.println(arrayList);
    }
}
```

### LinkedList 实现类
LinkedList 是一个以双向链表实现的List。和ArrayList一样，也按照索引位置排序，但它的元素是双向连接的，因此**顺序访问的效率非常高，而随机访问的效率比较低**。

#### 构造方法
- LinkedList()：构造一个空列表；
- LinkedList(Collection<? extends E> c)：构造一个包含指定集合元素的列表，其顺序由集合的迭代器返回。

#### 常用成员方法
- void add(E e)：将指定的元素追加到此列表的末尾；
- void add(int index, E element)：将指定的元素插入此列表中的指定位置；
- void addFirst(E e)：将指定的元素插入此列表的开头；
- vod addLast(E e)：将指定的元素添加到此列表的结尾；
- E remove(int index)：删除此列表中指定位置的元素；
boolean remove(Object o)：如果存在指定元素，则从该列表中删除第一次出现的该元素；
- void clear()：从此列表中删除所有元素；
- E set(int index, E element)：用指定的元素替换此列表中指定位置的元素；
- E get(int index)：返回此列表中指定位置的元素；
- E getFirst()：返回此列表的第一个元素；
- E getLast()：返回此列表的最后一个元素；
- boolean contains(Object o)：如果此列表包含指定的元素，则返回 true，否则返回 false；
- int size()：返回该列表中元素的数量；
- Object[] toArray()：以正确的顺序（从第一个元素到最后一个元素）返回一个包含此列表中所有元素的数组。

## Set 集合
### 概念和特性
Set是元素无序并且不可以重复的集合，我们称之为集。Set是Collection的一个子接口，它的主要实现类有：HashSet、TreeSet、LinkedHashSet、EnumSet等，下面我们将详细介绍最常用的HashSet实现类。

### HashSet 实现类
HashSet类依赖于哈希表（实际上是HashMap实例，下面将会介绍）。HashSet中的元素是**无序的、散列的**。

### 构造方法
- HashSet()：构造一个新的空集；默认的初始容量为 16（最常用），负载系数为 0.75；
- HashSet(int initialCapacity)：构造一个新的空集； 具有指定的初始容量，负载系数为 0.75；
- HashSet(int initialCapacity, float loadFactor)：构造一个新的空集； 支持的 HashMap 实例具有指定的初始容量和指定的负载系数；
- HashSet(Collection<? extends E> c)：构造一个新集合，其中包含指定集合中的元素。

### 常用成员方法
- boolean add(E e)：如果指定的元素尚不存在，则将其添加到该集合中；
- boolean contains(Object o)：如果此集合包含指定的元素，则返回 true，否则返回 false；
- boolean isEmpty()：如果此集合不包含任何元素，则返回 true，否则返回 false；
- Iterator<E> iterator()：返回此集合中元素的迭代器；
- boolean remove(Object o)：从该集合中删除指定的元素（如果存在）；
- int size()：返回此集合中的元素数量。

```java
import java.util.HashSet;
import java.util.Set;

public class HashSetDemo1 {
    public static void main(String[] args) {
        // 实例化一个新的空集
        Set<String> hashSet = new HashSet<String>();
        // 向 hashSet 集中依次添加元素：Python、Java、PHP、TypeScript、Python
        hashSet.add("Python");
        hashSet.add("Java");
        hashSet.add("PHP");
        hashSet.add("TypeScript");
        hashSet.add("Python");
        // 打印 hashSet 的内容
        System.out.println("hashSet中的内容为：" + hashSet);
    }
}

import java.util.HashSet;
import java.util.Set;

public class HashSetDemo2 {
    public static void main(String[] args) {
        // 实例化一个新的空集
        Set<String> hashSet = new HashSet<>();
        // 向 hashSet 集中依次添加元素：Python、Java
        hashSet.add("Python");
        hashSet.add("Java");
        // 打印 hashSet 的内容
        System.out.println(hashSet);
        // 删除 hashSet 中的 Python 元素
        hashSet.remove("Python");
        // 打印 hashSet 的内容
        System.out.println("删除 Python 元素后，hashSet中的内容为：" + hashSet);
    }
}
```

### 查询元素
我们知道了ArrayList 通过 get方法来查询元素，但HashSet没有提供类似的get方法来查询元素。

这里我们介绍一个迭代器（Iterator）接口，所有的Collection都实现了Iterator接口，它可以以统一的方式对各种集合元素进行遍历。我们来看下Iterator接口的常用方法：

- hasNaxt() 方法检测集合中是否还有下一个元素；
- next()方法返回集合中的下一个元素；
- iterator()：返回此集合中元素的迭代器。

```
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class HashSetDemo3 {
    public static void main(String[] args) {
        // 实例化一个新的空集
        Set<String> hashSet = new HashSet<String>();
        // 向 hashSet 集中依次添加元素：Python、Java、PHP
        hashSet.add("Python");
        hashSet.add("Java");
        hashSet.add("PHP");
        // 打印 hashSet 的内容
        System.out.println(hashSet);

        // 获取 hashSet 中元素的迭代器
        Iterator<String> iterator = hashSet.iterator();
        System.out.println("迭代器的遍历结果为：");
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
    }
}
```

## Map 集合
### 概念和特性
我们已经知道Map是以键值对（key-value）的形式存储的对象之间的映射，key-value是以java.util.Map.Entry类型的对象实例存在。

### HashMap 实现类
HashMap是java.util.Map接口最常用的一个实现类，前面所学的HashSet底层就是通过HashMap来实现的，HashMap允许使用null键和null值。

#### 构造方法
- HashMap()：构造一个新的空映射；默认的初始容量为 16（最常用），负载系数为 0.75；

- HashMap(int initialCapacity)：构造一个新的空映射； 具有指定的初始容量，负载系数为 0.75；

- HashMap(int initialCapacity, float loadFactor)：构造一个新的空映射； 支持的 HashMap 实例具有指定的初始容量和指定的负载系数；

#### 常用成员方法
- void clear()：从该映射中删除所有映射；
Set<Map, Entry<K, V>> entrySet：返回此映射中包含的映射的集合；
- V get(Object key)：返回指定键映射到的值，如果该映射不包含键的映射，则返回 null；
- Set<K> keySet：返回此映射中包含的键的结合；
- V put(K key, V value)：将指定值与此映射中指定键关联；
- V remove(Object key)：如果存在，则从此映射中删除指定键的映射。
- Collection<V> values：返回此映射中包含的集合。

```
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

public class HashMapDemo1 {

    public static void main(String[] args) {
        Map<String, String> map = new HashMap<>();
        // 添加数据
        map.put("English", "英语");
        map.put("Chinese", "汉语");
        map.put("Java", "咖啡");
        // 打印 map
        System.out.println(map);
        // 删除 key 为 Java 的数据
        map.remove("Chinese");
        System.out.println("删除键为Chinese的映射后，map内容为：");
        // 打印 map
        System.out.println(map);
        // 修改元素：
        map.put("Java", "一种编程语言");
        System.out.println("修改键为Java的值后，Java=" + map.get("Java"));
        // 遍历map
        System.out.println("通过遍历entrySet方法得到 key-value 映射：");
        Set<Entry<String, String>> entries = map.entrySet();
        for (Entry<String, String> entry: entries) {
            System.out.println(entry.getKey() + " - " + entry.getValue());
        }
        // 查找集合中键为 English 对应的值
        Set<String> keySet = map.keySet();
        for (String key: keySet) {
            if (key.equals("English")) {
                System.out.println("English 键对应的值为：" + map.get(key));
                break;
            }
        }
    }
}
```

## Iterator 迭代器
### 迭代器 Iterator 是什么？
```java
public interface Iterator<E> {
    //集合中是否还有元素
    boolean hasNext();
    //获得集合中的下⼀个元素
    E next();
     ......
}
```

Iterator 对象称为迭代器（设计模式的⼀种），迭代器可以对集合进⾏遍历，但每⼀个集合内部的数据结构可能是不尽相同的，所以每⼀个集合存和取都很可能是不⼀样的，虽然我们可以⼈为地在每⼀个类中定义 hasNext()和next()⽅法，但这样做会让整个集合体系过于臃肿。于是就有了迭代器。

迭代器是将这样的⽅法抽取出接⼝，然后在每个类的内部，定义⾃⼰迭代⽅式，这样做就规定了整个集合体系的遍历⽅式都是hasNext()和next()⽅法，使⽤者不⽤管怎么实现的，会⽤即可。**迭代器的定义为：提供⼀种⽅法访问⼀个容器对象中各个元素，⽽⼜不需要暴露该对象的内部细节**。

### 迭代器 Iterator 有啥⽤？
Iterator 主要是⽤来遍历集合⽤的，它的特点是更加安全，因为它可以确保，在当前遍历的集合元素被更改的时候，就会抛出 ConcurrentModificationException 异常。

#### 迭代器 Iterator 如何使用
```java
Map<Integer, String> map = new HashMap();
map.put(1, "Java");
map.put(2, "C++");
map.put(3, "PHP");
Iterator<Map.Entry<Integer, Stringef iterator =
map.entrySet().iterator();
while (iterator.hasNext()) {
    Map.Entry<Integer, String> entry = iterator.next();
    System.out.println(entry.getKey() + entry.getValue());
}
```

## 有哪些集合是线程不安全的？怎么解决呢？
我们常⽤的 Arraylist, LinkedList,Hashmap,HashSet,TreeSet ,TreeMap,PriorityQueue 都不是线程安全的。

解决办法很简单，可以使⽤线程安全的集合来代替。
如果你要使⽤线程安全的集合的话， java.util.concurrent 包中提供了很多并发容器供你使⽤：
1.  ConcurrentHashMap : 可以看作是线程安全的 HashMap
2.  CopyOnWriteArrayList :可以看作是线程安全的 ArrayList ，在读多写少的场合性能⾮常好，远远好于 Vector .
3.  ConcurrentLinkedQueue:⾼效的并发队列，使⽤链表实现。可以看做⼀个线程安全的LinkedList ，这是⼀个⾮阻塞队列。
4.  BlockingQueue : 这是⼀个接⼝，JDK 内部通过链表、数组等⽅式实现了这个接⼝。表示阻塞队列，⾮常适合⽤于作为数据共享的通道。
5.  ConcurrentSkipListMap :跳表的实现。这是⼀个 Map ，使⽤跳表的数据结构进⾏快速查找。

## Collection ⼦接⼝之 List
### Arraylist 和 Vector 的区别?
1. ArrayList 是 List 的主要实现类，底层使⽤ Object[ ]存储，适⽤于频繁的查找⼯作，线程不安全；
2. Vector 是 List 的古⽼实现类，底层使⽤ Object[ ]存储，线程安全的。

### Arraylist 与 LinkedList 区别?
1. 是否保证线程安全：两者都是不同步的，不保证线程安全。
2. 底层数据结构：Arraylist 底层使⽤的是 Object 数组；LinkedList 底层使⽤的是双向链表
3. 插入和删除是否受位置影响：arraylist采用数组存储，所以插入删除的时间复杂度受元素位置印象。 LinkedList采⽤链表存储，所以对于 add(E e) ⽅法的插⼊，删除元素时间复杂度不受元素位置的影响，近似O(1)，如果是要在指定位置i插⼊和删除元素的话（ (add(int index, E element)）时间复杂度近似为o(n))因为需要先移动到指定位置再插⼊。
4. 是否支持快速随机访问：Link不支持，Array支持。
5. 内存空间占用：ArrayList 的空 间浪费主要体现在在 list 列表的结尾会预留⼀定的容量空间，⽽LinkedList的空间花费则体现在它的每⼀个元素都需要消耗⽐ArrayList更多的空间（因为要存放直接后继和直接前驱以及数据）。

### 补充知识：RandomAccess接口
```java
publicinterfaceRandomAccess{
    
}
```
查看源码我们发现实际上 RandomAccess 接⼝中什么都没有定义。所以，在我看来RandomAccess接⼝不过是⼀个标识罢了。标识什么？ 标识实现这个接⼝的类具有随机访问功能。

在 binarySearch（) ⽅法中，它要判断传⼊的 list 是否RamdomAccess 的实例，如果是，调⽤indexedBinarySearch()⽅法，如果不是，那么调⽤iteratorBinarySearch() ⽅法

```java
public static <T> int binarySearch(List<? extends Comparable<? super Tef list, T key) {
    if (list instanceof RandomAccess || list.size()
    <BINARYSEARCH_THRESHOLD)
        return Collections.indexedBinarySearch(list, key);
    else
        return Collections.iteratorBinarySearch(list, key);
 }
```
ArrayList 实现了RandomAccess接⼝，⽽LinkedList没有实现。为什么呢？我觉得还是和底层数据结构有关！ArrayList底层是数组，⽽LinkedList底层是链表。数组天然⽀持随机访问，时间复杂度为O(1)，所以称为快速随机访问。链表需要遍历到特定位置才能访问特定位置的元素，时间复杂度为 O(n)，所以不⽀持快速随机访问。

## Collection ⼦接⼝之 Set
### comparable 和 Comparator 的区别
- comparable 接⼝实际上是出⾃ java.lang 包 它有⼀个 compareTo(Object obj) ⽅法⽤来排序
- comparator 接⼝实际上是出⾃ java.util 包它有⼀个 compare(Object obj1, Object obj2) ⽅法⽤来排序

⼀般我们需要对⼀个集合使⽤⾃定义排序时，我们就要重写compareTo() ⽅法或compare()⽅法，当我们需要对某⼀个集合实现两种排序⽅式，⽐如⼀个song对象中的歌名和歌⼿名分别采⽤⼀种排序⽅法的话，我们可以重写compareTo()⽅法和使⽤⾃制的Comparator⽅法或者以两个Comparator来实现歌名排序和歌星名排序，第⼆种代表我们只能使⽤两个参数版的Collections.sort()。

### Comparator 定制排序（比较器）
```java
ArrayList<Integer> arrayList = new ArrayList<Integer>();
arrayList.add(-1);
arrayList.add(3);
arrayList.add(3);
System.out.println("原始数组:");
System.out.println(arrayList);
// void reverse(List list)：反转
Collections.reverse(arrayList);
System.out.println("Collections.reverse(arrayList):");
System.out.println(arrayList);
// void sort(List list),按⾃然排序的升序排序
Collections.sort(arrayList);
System.out.println("Collections.sort(arrayList):");
System.out.println(arrayList);
// 定制排序的⽤法
Collections.sort(arrayList, new Comparator<Integer>() {
    @Override
    public int compare(Integer o1, Integer o2) {
        return o2.compareTo(o1);
    }
 });
System.out.println("定制排序后：");
System.out.println(arrayList);

原始数组:
[-1, 3, 3, -5, 7, 4, -9, -7]
Collections.reverse(arrayList):
[-7, -9, 4, 7, -5, 3, 3, -1]
Collections.sort(arrayList):
[-9, -7, -5, -1, 3, 3, 4, 7]
定制排序后：
[7, 4, 3, 3, -1, -5, -7, -9]
```
### 重写 compareTo ⽅法实现按年龄来排序
```java
// person对象没有实现Comparable接⼝，所以必须实现，这样才不会出错，才可以使treemap中的数据按顺序排列
// 前⾯⼀个例⼦的String类已经默认实现了Comparable接⼝，详细可以查看String类的API⽂档，另外其他
// 像Integer类等都已经实现了Comparable接⼝，所以不需要另外实现了
public class Person implements Comparable<Person> {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        super();
        this.name = name;
        this.age = age;
     }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
    
    /**
    * T重写compareTo⽅法实现按年龄来排序
    */
    @Override
    public int compareTo(Person o) {
        if (this.age > o.getAge()) {
            return 1;
        }
        if (this.age < o.getAge()) {
        return -1;
        }
        return 0;
    }
}

public static void main(String[] args) {
    TreeMap<Person, String> pdata = new TreeMap<Person, String>();
    pdata.put(new Person("张三", 30), "zhangsan");
    pdata.put(new Person("李四", 20), "lisi");
    pdata.put(new Person("王五", 10), "wangwu");
    pdata.put(new Person("⼩红", 5), "xiaohong");
    // 得到key的值的同时得到key所对应的值
    Set<Person> keys = pdata.keySet();
    for (Person key : keys) {
    System.out.println(key.getAge() + "-" + key.getName());
    }
}

5-⼩红
10-王五
20-李四
30-张三
```

### ⽆序性和不可重复性的含义是什么
1. 什么是⽆序性？⽆序性不等于随机性，⽆序性是指存储的数据在底层数组中并⾮按照数组索引的顺序添加 ，⽽是根据数据的哈希值决定的。
2. 什么是不可重复性？不可重复性是指添加的元素按照equals()判断时 ，返回 false，需要同时重写 equals()⽅法和 HashCode()⽅法。

### ⽐较 HashSet、LinkedHashSet 和 TreeSet 三者的异同
HashSet 是 Set 接⼝的主要实现类 ，HashSet 的底层是 HashMap，线程不安全的，可以存储 null值；

LinkedHashSet 是 HashSet 的⼦类，能够按照添加的顺序遍历；

TreeSet 底层使⽤红⿊树，能够按照添加元素的顺序进⾏遍历，排序的⽅式有⾃然排序和定制排序。

## Map接口
### HashMap 和 Hashtable 的区别
1. **线程是否安全**： HashMap 是⾮线程安全的，HashTable 是线程安全的,因为 HashTable 内部的⽅法基本都经过 synchronized 修饰。（如果你要保证线程安全的话就使⽤ConcurrentHashMap吧！）；
2. **效率**：线程不安全的效率更高，**Hashtable已经被淘汰，不要使用**。
3. **对 Null key 和 Null value 的⽀持**： HashMap 可以存储 null 的 key 和 value, HashTable 不允许有 null 键和 null 值，否则会
抛出 NullPointerException。
4. **初始容量⼤⼩和每次扩充容量⼤⼩的不同**：①创建时如果不指定容量初始值，Hashtable 默认的初始⼤⼩为 11，之后每次扩充，容量变为原来的 2n+1。HashMap 默认的初始化⼤⼩为16。之后每次扩充，容量变为原来的 2 倍。②创建时如果给定了容量初始值，那么 Hashtable
会直接使⽤你给定的⼤⼩，⽽ HashMap 会将其扩充为 2 的幂次⽅⼤⼩（HashMap 中的tableSizeFor()⽅法保证，下⾯给出了源代码）。也就是说 HashMap 总是使⽤ 2 的幂作为哈希表的⼤⼩,后⾯会介绍到为什么是 2 的幂次⽅。
5. **底层数据结构**：JDK1.8 以后的 HashMap 在解决哈希冲突时有了较⼤的变化，当链表⻓度⼤于阈值（默认为 8）（将链表转换成红⿊树前会判断，如果当前数组的⻓度⼩于 64，那么会选择先进⾏数组扩容，⽽不是转换为红⿊树）时，将链表转化为红⿊树，以减少搜索时间。Hashtable 没有这样的机制。

### HashMap 中带有初始容量的构造函数：
```java
public HashMap(int initialCapacity, float loadFactor) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal load factor: " + loadFactor);
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
}
public HashMap(int initialCapacity) {
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}
```
下⾯这个⽅法保证了 HashMap 总是使⽤ 2 的幂作为哈希表的⼤⼩。
![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCE8c05074c6361fad3258f9c24d77fd955)

### HashMap和HashSet区别
HashSet 底层就是基于 HashMap 实现的。（HashSet 的源码⾮常⾮常少，因为除了 clone() 、 writeObject() 、 readObject() 是 HashSet ⾃⼰不得不实现之外，其他⽅法都是直接调⽤ HashMap 中的⽅法。
![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCE2d5a7f2f428ee131c579bed0413cba10)

### HashMap 和 TreeMap 区别
**TreeMap 和 HashMap 都继承⾃ AbstractMap ，但是需要注意的是 TreeMap 它还实现了NavigableMap 接⼝和 SortedMap 接⼝。**
![image.png](https://note.youdao.com/yws/res/f/WEBRESOURCE39712ab7f5a3142d69eceee76cfe039f)

实现 NavigableMap 接⼝让 TreeMap 有了对集合内元素的搜索的能⼒。

实现 SortMap 接⼝让 TreeMap 有了对集合中的元素根据键排序的能⼒。默认是按 key 的升序排序，不过我们也可以指定排序的⽐较器。示例代码如下：
```java
// 匿名内部类
public static void main(String[] args) {
    TreeMap<Person, String> treeMap = new TreeMap<>(new Comparator<Person>() {
    @Override
    public int compare(Person person1, Person person2) {
        int num = person1.getAge() - person2.getAge();
        return Integer.compare(num, 0);
        }
    });
    treeMap.put(new Person(3), "person1");
    treeMap.put(new Person(18), "person2");
    treeMap.put(new Person(35), "person3");
    treeMap.put(new Person(16), "person4");
    treeMap.entrySet().stream().forEach(personStringEntry > {
    System.out.println(personStringEntry.getValue());
    });
}
// Lambda 表达式
TreeMap<Person, String> treeMap = new TreeMap<>((person1, person2) > {
    int num = person1.getAge() - person2.getAge();
    return Integer.compare(num, 0);
});
```

## HashSet 如何检查重复
当你把对象加⼊ HashSet 时，HashSet 会先计算对象的 hashcode 值来判断对象加⼊的位置，同时也会与其他加⼊的对象的 hashcode 值作⽐较，如果没有相符的 hashcode，HashSet 会假设对象没有重复出现。但是如果发现有相同 hashcode 值的对象，这时会调⽤ equals() ⽅法来检查 hashcode 相等的对象是否真的相同。如果两者相同，HashSet就不会让加⼊操作成功。

**hashCode()与 equals()的相关规定：**
1. 如果两个对象相等，则 hashcode ⼀定也是相同的
2. 两个对象相等,对两个 equals ⽅法返回 true
3. 两个对象有相同的 hashcode 值，它们也不⼀定是相等的
4. 综上，equals ⽅法被覆盖过，则 hashCode ⽅法也必须被覆盖
5. hashCode()的默认⾏为是对堆上的对象产⽣独特值。如果没有重写 hashCode()，则该class的两个对象⽆论如何都不会相等（即使这两个对象指向相同的数据）。

## HashMap 的底层实现
JDK1.8 之前 HashMap 底层是数组和链表结合在⼀起使⽤也就是链表散列。HashMap 通过 key 的 hashCode 经过扰动函数处理过后得到 hash 值，然后通过 (n - 1) & hash 判断当前元素存放的位置（这⾥的 n 指的是数组的⻓度），如果当前位置存在元素的话，就判该元素与要存⼊的元素的 hash值以及 key 是否相同，如果相同的话，直接覆盖，不相同就通过拉链法解决冲突。

所谓扰动函数指的就是 HashMap 的 hash ⽅法。使⽤ hash ⽅法也就是扰动函数是为了防⽌⼀些实现⽐较差的 hashCode() ⽅法 换句话说使⽤扰动函数之后可以减少碰撞。

![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCE583cf8ef7cd3dcbcc24a730d6b54cff2)
![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCEe8f2548a0a1b112d4548709de00666a0)

**JDK1.8 之后**
![image.png](https://note.youdao.com/yws/res/c/WEBRESOURCE3c6ff0a0d3ca2204c3b1a6ebd9f3d8fc)
> TreeMap、TreeSet 以及 JDK1.8 之后的 HashMap 底层都⽤到了红⿊树。红⿊树就是为了解决⼆叉查找树的缺陷，因为⼆叉查找树在某些情况下会退化成⼀个线性结构。

## HashMap 的⻓度为什么是 2 的幂次⽅
为了能让 HashMap 存取⾼效，尽量较少碰撞，也就是要尽量把数据分配均匀。我们上⾯也讲到了过了，Hash 值的范围值-2147483648 到 2147483647，前后加起来⼤概 40 亿的映射空间，只要哈希函数映射得⽐较均匀松散，⼀般应⽤是很难出现碰撞的。但问题是⼀个 40 亿⻓度的数组，内存是放不下
的。所以这个散列值是不能直接拿来⽤的。⽤之前还要先做对数组的⻓度取模运算，得到的余数才能⽤来要存放的位置也就是对应的数组下标。这个数组下标的计算⽅法是“ (n - 1) & hash ”。（n 代表数组⻓度）。这也就解释了 HashMap 的⻓度为什么是 2 的幂次⽅。

我们⾸先可能会想到采⽤%取余的操作来实现。但是，重点来了：“**取余(%)操作中如果除数是 2 的幂次则等价于与其除数减⼀的与(&)操作（也就是说hash%lengthFGhash&(length-1)的前提是 length 是 2的 n 次⽅；）。**” 并且采⽤⼆进制位操作&，相对于%能够提⾼运算效率，这就解释了 HashMap 的⻓度为什么是 2 的幂次⽅。

## HashMap 多线程操作导致死循环问题
主要原因在于并发下的 Rehash 会造成元素之间会形成⼀个循环链表。不过，jdk 1.8 后解决了这个问题，但是还是不建议在多线程下使⽤ HashMap,因为多线程下使⽤ HashMap 还是会存在其他问题⽐如数据丢失。并发环境下推荐使⽤ ConcurrentHashMap 。

## ConcurrentHashMap 和 Hashtable 的区别
ConcurrentHashMap 和 Hashtable 的区别主要体现在实现线程安全的⽅式上不同。
![image.png](https://note.youdao.com/yws/res/9/WEBRESOURCEfcd422dae85ee72836e020423b3837d9)

![image.png](https://note.youdao.com/yws/res/1/WEBRESOURCE7b0365c90246a9df9ffa51bf71570d41)

![image.png](https://note.youdao.com/yws/res/2/WEBRESOURCE36d4b335781a345924fe107396b946d2)

![image.png](https://note.youdao.com/yws/res/8/WEBRESOURCE19456244ba17c6429d0a9d13382b5308)

![image.png](https://note.youdao.com/yws/res/7/WEBRESOURCEb28730ef24426aa77bd2deac0be4d547)

## ConcurrentHashMap 线程安全的具体实现⽅式/底层具体实现
### JDK1.7（上⾯有示意图）
⾸先将数据分为⼀段⼀段的存储，然后给每⼀段数据配⼀把锁，当⼀个线程占⽤锁访问其中⼀个段数据时，其他段的数据也能被其他线程访问。

**ConcurrentHashMap 是由 Segment 数组结构和 HashEntry 数组结构组成。**

Segment 实现了 ReentrantLock,所以 Segment 是⼀种可重⼊锁，扮演锁的⻆⾊。HashEntry ⽤于存储键值对数据。

### JDK1.8 （上⾯有示意图）
ConcurrentHashMap 取消了 Segment 分段锁，采⽤ CAS 和 synchronized 来保证并发安全。数据结构跟 HashMap1.8 的结构类似，数组+链表/红⿊⼆叉树。Java 8 在链表⻓度超过⼀定阈值（8）时将链表（寻址时间复杂度为 O(N)）转换为红⿊树（寻址时间复杂度为 O(log(N))）

synchronized 只锁定当前链表或红⿊⼆叉树的⾸节点，这样只要 hash 不冲突，就不会产⽣并发，效率⼜提升 N 倍。

## Collections ⼯具类
1. 排序
2. 查找，替换操作
3. 同步控制制(不推荐，需要线程安全的集合类型时请考虑使⽤ JUC 包下的并发集合)

### 排序操作
```java
void reverse(List list)//反转
void shuffle(List list)//随机排序
void sort(List list)//按⾃然排序的升序排序
void sort(List list, Comparator c)//定制排序，由Comparator控制排序逻辑
void swap(List list, int i , int j)//交换两个索引位置的元素
void rotate(List list, int distance)//旋转。当distance为正数时，将list后
distance个元素整体移到前⾯。当distance为负数时，将 list的前distance个元
素整体移到后⾯
```
### 查找，替换操作
```java
int binarySearch(List list, Object key)//对List进⾏⼆分查找，返回索引，注意List必须是有序的
int max(Collection coll)//根据元素的⾃然顺序，返回最⼤的元素。 类⽐int min(Collection coll)
int max(Collection coll, Comparator c)//根据定制排序，返回最⼤元素，排序规则由Comparatator类控制。类⽐int min(Collection coll, Comparator c)
void fill(List list, Object obj)//⽤指定的元素代替指定list中的所有元素。
int frequency(Collection c, Object o)//统计元素出现次数
int indexOfSubList(List list, List target)//统计target在list中第⼀次出现的索引，找不到则返回-1，类⽐int lastIndexOfSubList(List source, list target).
boolean replaceAll(List list, Object oldVal, Object newVal), ⽤新元素替换旧元素
```

### 同步控制
最好不要⽤下⾯这些⽅法，效率⾮常低，需要线程安全的集合类型时请考虑使⽤ JUC 包下的并发集合。

## 其他重要问题
### 什么是快速失败(fail-fast)？
快速失败(fail-fast) 是 Java 集合的⼀种错误检测机制。在使⽤迭代器对集合进⾏遍历的时候，我们在多线程下操作⾮安全失败(fail-safe)的集合类可能就会触发 fail-fast 机制，导致抛出ConcurrentModificationException 异常。 另外，在单线程下，如果在遍历过程中对集合对象的内容进⾏了修改的话也会触发 fail-fast 机制。

举个例⼦：多线程下，如果线程 1 正在对集合进⾏遍历，此时线程 2 对集合进⾏修改（增加、删除、修改），或者线程 1 在遍历过程中对集合进⾏修改，都会导致线程 1 抛出ConcurrentModificationException 异常。

每当迭代器使⽤ hashNext() / next() 遍历下⼀个元素之前，都会检测 modCount 变量是否为expectedModCount值，是的话就返回遍历；否则抛出异常，终⽌遍历。

如果我们在集合被遍历期间对其进⾏修改的话，就会改变 modCount 的值，进⽽导致 modCount 不等于 expectedModCount，进⽽抛出 ConcurrentModificationException 异常。
> 注：通过 Iterator 的⽅法修改集合的话会修改到 expectedModCount 的值，所以不会抛出异常。

![image.png](https://note.youdao.com/yws/res/d/WEBRESOURCE0e5301cf7b5e6e55a519e484387d574d)
![image.png](https://note.youdao.com/yws/res/0/WEBRESOURCEfdc63103ddf2cbd556dea6c5a16a0640)

### 什么是安全失败(fail-safe)呢？
采⽤安全失败机制的集合容器，在遍历时不是直接在集合内容上访问的，⽽是先复制原有集合内容，在拷⻉的集合上进⾏遍历。所以，在遍历过程中对原集合所作的修改并不能被迭代器检测到，故不会抛ConcurrentModificationException 异常。

### Arrays.asList()避坑指南
#### 简介
Arrays.asList() 在平时开发中还是⽐较常⻅的，我们可以使⽤它将⼀个数组转换为⼀个 List 集合。
```java
String[] myArray = { "Apple", "Banana", "Orange" }；
List<String> myList = Arrays.asList(myArray);
//上⾯两个语句等价于下⾯⼀条语句
List<String> myList = Arrays.asList("Apple","Banana","Orange");

// JDK 源码对于这个⽅法的说明：
/**
*返回由指定数组⽀持的固定⼤⼩的列表。此⽅法作为基于数组和基于集合的API之间的桥梁，与Collection.toArray()结合使⽤。返回的List是可序列化并实现RandomAccess接⼝。
*/
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}

```

#### 《阿⾥巴巴 Java 开发⼿册》对其的描述
Arrays.asList() 将数组转换为集合后,底层其实还是数组，《阿⾥巴巴 Java 开发⼿册》对于这个⽅法有如下描述：

![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCE4c043d04a70f836d4996f3ebc8355ab5)

#### 使⽤时的注意事项总结
**传递的数组必须是对象数组，⽽不是基本类型。**
Arrays.asList() 是泛型⽅法，传⼊的对象必须是对象数组。
```java
int[] myArray = { 1, 2, 3 };
List myList = Arrays.asList(myArray);
System.out.println(myList.size());//1
System.out.println(myList.get(0));//数组地址值
System.out.println(myList.get(1));//报错：ArrayIndexOutOfBoundsException
int [] array=(int[]) myList.get(0);
System.out.println(array[0]);//1
```
当传⼊⼀个原⽣数据类型数组时， Arrays.asList() 的真正得到的参数就不是数组中的元素，⽽是数组对象本身！此时 List 的唯⼀元素就是这个数组，这也就解释了上⾯的代码。

我们使⽤包装类型数组就可以解决这个问题。
```java
Integer[] myArray = { 1, 2, 3 };
```
Arrays.asList() ⽅法返回的并不是 java.util.ArrayList ，⽽是 java.util.Arrays 的⼀个内部类,这个内部类并没有实现集合的修改⽅法或者说并没有重写这些⽅法。
```java
// 使⽤集合的修改⽅法: add() 、 remove() 、 clear()会抛出异常。
List myList = Arrays.asList(1, 2, 3);
myList.add(4);//运⾏时报错：UnsupportedOperationException
myList.remove(1);//运⾏时报错：UnsupportedOperationException
myList.clear();//运⾏时报错：UnsupportedOperationException

List myList = Arrays.asList(1, 2, 3);
System.out.println(myList.getClass());//class java.util.Arrays$ArrayList

// java.util.Arrays$ArrayList 的简易源码
private static class ArrayList<E> extends AbstractList<E>
implements RandomAccess, java.io.Serializable
 {
 ...
@Override
public E get(int index) {
 ...
 }
@Override
public E set(int index, E element) {
 ...
 }
@Override
public int indexOf(Object o) {
 ...
 }
@Override
public boolean contains(Object o) {
 ...
 }
@Override
public void forEach(Consumer<? super E> action) {
 ...
 }
@Override
public void replaceAll(UnaryOperator<E> operator) {
 ...
 }
@Override
public void sort(Comparator<? super E> c) {
 ...
 }
 }
 
// java.util.AbstractList 的 remove() ⽅法，这样我们就明⽩为啥会抛出UnsupportedOperationException
public E remove(int index) {
    throw new UnsupportedOperationException();
}
```

## HashMap 的 7 种遍历方式与性能分析
### HashMap 遍历
1. 迭代器（Iterator）方式遍历；
2. For Each 方式遍历；
3. Lambda 表达式遍历（JDK 1.8+）;
4. Streams API 遍历（JDK 1.8+）。

但每种类型下又有不同的实现方式，因此具体的遍历方式又可以分为以下 7 种：
1. 使用迭代器（Iterator）EntrySet 的方式进行遍历；
2. 使用迭代器（Iterator）KeySet 的方式进行遍历；
3. 使用 For Each EntrySet 的方式进行遍历；
4. 使用 For Each KeySet 的方式进行遍历；
5. 使用 Lambda 表达式的方式进行遍历；
6. 使用 Streams API 单线程的方式进行遍历；
7. 使用 Streams API 多线程的方式进行遍历。

### 1.迭代器 EntrySet
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        Iterator<Map.Entry<Integer, String>> iterator = map.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<Integer, String> entry = iterator.next();
            System.out.print(entry.getKey());
            System.out.print(entry.getValue());
        }
    }
}
1 Java 2 JDK 3 Spring Framework 4 MyBatis framework 5 Java中文社群
```
### 2.迭代器 KeySet
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        Iterator<Integer> iterator = map.keySet().iterator();
        while (iterator.hasNext()) {
            Integer key = iterator.next();
            System.out.print(key);
            System.out.print(map.get(key));
        }
    }
}
```
### 3.ForEach EntrySet
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        for (Map.Entry<Integer, String> entry : map.entrySet()) {
            System.out.print(entry.getKey());
            System.out.print(entry.getValue());
        }
    }
}
```

#### 4.ForEach KeySet
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        for (Integer key : map.keySet()) {
            System.out.print(key);
            System.out.print(map.get(key));
        }
    }
}
```

#### 5.Lambda
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        map.forEach((key, value) -> {
            System.out.print(key);
            System.out.print(value);
        });
    }
}
```

#### 6.Streams API 单线程
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        map.entrySet().stream().forEach((entry) -> {
            System.out.print(entry.getKey());
            System.out.print(entry.getValue());
        });
    }
}
```

#### 7.Streams API 多线程
```java
public class HashMapTest {
    public static void main(String[] args) {
        // 创建并赋值 HashMap
        Map<Integer, String> map = new HashMap();
        map.put(1, "Java");
        map.put(2, "JDK");
        map.put(3, "Spring Framework");
        map.put(4, "MyBatis framework");
        map.put(5, "Java中文社群");
        // 遍历
        map.entrySet().parallelStream().forEach((entry) -> {
            System.out.print(entry.getKey());
            System.out.print(entry.getValue());
        });
    }
}
```

#### 性能原理分析
```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//

package com.example;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

public class HashMapTest {
    static Map<Integer, String> map = new HashMap() {
        {
            for(int var1 = 0; var1 < 2; ++var1) {
                this.put(var1, "val:" + var1);
            }

        }
    };

    public HashMapTest() {
    }

    public static void main(String[] var0) {
        entrySet();
        keySet();
        forEachEntrySet();
        forEachKeySet();
        lambda();
        streamApi();
        parallelStreamApi();
    }

    public static void entrySet() {
        Iterator var0 = map.entrySet().iterator();

        while(var0.hasNext()) {
            Entry var1 = (Entry)var0.next();
            System.out.println(var1.getKey());
            System.out.println((String)var1.getValue());
        }

    }

    public static void keySet() {
        Iterator var0 = map.keySet().iterator();

        while(var0.hasNext()) {
            Integer var1 = (Integer)var0.next();
            System.out.println(var1);
            System.out.println((String)map.get(var1));
        }

    }

    public static void forEachEntrySet() {
        Iterator var0 = map.entrySet().iterator();

        while(var0.hasNext()) {
            Entry var1 = (Entry)var0.next();
            System.out.println(var1.getKey());
            System.out.println((String)var1.getValue());
        }

    }

    public static void forEachKeySet() {
        Iterator var0 = map.keySet().iterator();

        while(var0.hasNext()) {
            Integer var1 = (Integer)var0.next();
            System.out.println(var1);
            System.out.println((String)map.get(var1));
        }

    }

    public static void lambda() {
        map.forEach((var0, var1) -> {
            System.out.println(var0);
            System.out.println(var1);
        });
    }

    public static void streamApi() {
        map.entrySet().stream().forEach((var0) -> {
            System.out.println(var0.getKey());
            System.out.println((String)var0.getValue());
        });
    }

    public static void parallelStreamApi() {
        map.entrySet().parallelStream().forEach((var0) -> {
            System.out.println(var0.getKey());
            System.out.println((String)var0.getValue());
        });
    }
}

```
从结果可以看出，除了 Lambda 和 Streams API 之外，通过迭代器循环和 for 循环的遍历的 EntrySet和KeySet 最终生成的代码是一样的，他们都是在循环中创建了一个遍历对象 Entry。

![image.png](https://note.youdao.com/yws/res/5/WEBRESOURCE24511f005f0e3c5b2cff63c267ca95a5)

**所以通过字节码来看，使用 EntrySet 和 KeySet 代码差别不是很大，并不像网上说的那样 KeySet 的性能远不如 EntrySet，因此从性能的角度来说 EntrySet 和 KeySet 几乎是相近的，但从代码的优雅型和可读性来说，还是推荐使用  EntrySet。**

#### 安全性测试
我们把以上遍历划分为四类进行测试：迭代器方式、For 循环方式、Lambda 方式和 Stream 方式，测试代码如下。

##### 1.迭代器方式
```java
Iterator<Map.Entry<Integer, String>> iterator = map.entrySet().iterator();
while (iterator.hasNext()) {
    Map.Entry<Integer, String> entry = iterator.next();
    if (entry.getKey() == 1) {
        // 删除
        System.out.println("del:" + entry.getKey());
        iterator.remove();
    } else {
        System.out.println("show:" + entry.getKey());
    }
}

show:0

del:1

show:2
```
##### 2.For 循环方式
```java
for (Map.Entry<Integer, String> entry : map.entrySet()) {
    if (entry.getKey() == 1) {
        // 删除
        System.out.println("del:" + entry.getKey());
        map.remove(entry.getKey());
    } else {
        System.out.println("show:" + entry.getKey());
    }
}
```
![image.png](https://note.youdao.com/yws/res/8/WEBRESOURCE5af4ddc8556d8a7e8d5eddf72771b498)

##### 3.Lambda 方式
```java
// 错误删除方式
map.forEach((key, value) -> {
    if (key == 1) {
        System.out.println("del:" + key);
        map.remove(key);
    } else {
        System.out.println("show:" + key);
    }
});

// 正确删除方式
// 根据 map 中的 key 去判断删除
map.keySet().removeIf(key -> key == 1);
map.forEach((key, value) -> {
    System.out.println("show:" + key);
});
```
![image.png](https://note.youdao.com/yws/res/e/WEBRESOURCE6702b7b2b7b9d11d3c651053f61352ee)

##### 4.Stream 方式
```java
map.entrySet().stream().forEach((entry) -> {
    if (entry.getKey() == 1) {
        System.out.println("del:" + entry.getKey());
        map.remove(entry.getKey());
    } else {
        System.out.println("show:" + entry.getKey());
    }
});

// Stream 循环的正确方式
map.entrySet().stream().filter(m -> 1 != m.getKey()).forEach((entry) -> {
    if (entry.getKey() == 1) {
        System.out.println("del:" + entry.getKey());
    } else {
        System.out.println("show:" + entry.getKey());
    }
});
```
##### 总结
本文我们讲了 HashMap 4 大类（迭代器、for、lambda、stream）遍历方式，以及具体的 7 种遍历方法，除了 Stream 的并行循环，其他几种遍历方法的性能差别不大，但**从简洁性和优雅性上来看，Lambda 和 Stream 无疑是最适合的遍历方式**。除此之外我们还从「安全性」方面测试了 4 大类遍历结果，**从安全性来讲，我们应该使用迭代器提供的 iterator.remove() 方法来进行删除**，这种方式是安全的在遍历中删除集合的方式，或者使用 Stream 中的 filter 过滤掉要删除的数据再进行循环，也是安全的操作方式。