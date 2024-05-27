---
order: 8
title: 集合
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# 集合

集合简单理解就是一个长度可以改变，可以保持任意数据类型的动态数组。

集合本身是数据结果的基本概念之一，我们这里说的集合是 Java 语言对这种数据结果的具体实现。

Java 中的集合不是由一个类来完成的，而是由一组接口和类构成了一个框架体系。大致可分为 3 层，最上层是一组接口，继而是接口的实现类。

为什么要使用集合框架？

1、数组的长度是固定

2、数组无法同时存储多个不同的数据类型

### 1、接口

Collection：集合框架最基础的接口，最顶层的接口。

List：Collection 的子接口，存储有序、不唯一（元素可重复）的对象，最常用的接口。

Set：Collection 的子接口，存储无序、唯一（元素不可重复）的对象。

Map：独立于 Collection 的另外一个接口，最顶层的接口，存储一组键值对象，提供键到值的映射。

Iterator：输出集合元素的接口，一般适用于无序集合，从前往后输出。

ListIterator：Iterator 子接口，可以双向输出集合中的元素。

Enumeration：传统的输出接口，已经被 Iterator 取代。

SortedSet：Set 的子接口，可以对集合中的元素进行排序。

SortedMap：Map 的子接口，可以对集合中的元素进行排序。

Queue：队列接口。

Map.Entry：Map 的内部接口，描述 Map 中存储的一组键值对元素。

### 2、Collection 接口

Collection 是集合框架中最基础的父接口，可以存储一组无序，不唯一的对象。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201855157.png)

Collection 接口可以存储一组无序，不唯一（可重复）的对象，一般不直接使用该接口，也不能被实例化，只是用来**提供规范**。

Collection 是 Iterable 接口的子接口。

| int size()                        | 获取集合长度                           |
| --------------------------------- | -------------------------------------- |
| boolean isEmpty()                 | 判断集合是否为空                       |
| boolean contains(Object o)        | 判断集合中是否存在某个对象             |
| Iterator iterator()               | 实例化 Iterator 接口，遍历集合         |
| Object[] toArray()                | 将集合转换为一个 Object 数组           |
| T[] toArray(T[] a)                | 将集合转换为一个指定数据类型的数组     |
| boolean add(E e)                  | 向集合中添加元素                       |
| boolean remove(Object o)          | 从集合中删除元素                       |
| boolean containsAll(Collection c) | 判断集合中是否存在另一个集合的所有元素 |
| boolean addAll(Collection c)      | 向集合中添加某个集合的所有元素         |
| boolean removeAll(Collection c)   | 从集合中删除某个集合的所有元素         |
| void clear()                      | 清除集合中的所有元素                   |
| boolean equals(Collection c)      | 判断两个集合是否相等                   |
| int hashCode()                    | 返回集合的哈希值                       |

### 3、Collection 子接口

- List：存放有序、不唯一的元素
- Set：存放无序、唯一的元素
- Queue：队列接口

### 4、List 接口

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201912934.png)

List 常用的扩展方法：

| 方法                                    | 含义                                         |
| --------------------------------------- | -------------------------------------------- |
| T get(int index)                        | 通过下标返回集合中对应位置的元素             |
| T set(int index,T element)              | 在集合中的指定位置存入对象                   |
| int indexOf(Object o)                   | 从前向后查找某个对象在集合中的位置           |
| int lastIndexOf(Object o)               | 从后向前查找某个对象在集合中的位置           |
| ListIterator listIterator()             | 实例化 ListIterator 接口，用来遍历 List 集合 |
| List subList(int fromIndex,int toIndex) | 通过下标截取 List 集合                       |

### 5、List 接口的实现类

#### 1、ArrayList

ArrayList 是开发中使用频率最高的 List 实现类，实现了长度可变的数组，在内存中分配连续空间，所以读取快，增删慢。

```java
public class Test {
    public static void main(String[] args) {
        ArrayList list = new ArrayList();
        list.add("Hello");
        list.add("World");
        list.add("JavaSE");
        list.add("JavaME");
        list.add("JavaEE");
        System.out.println("list:"+list);
        System.out.println("list长度:"+list.size());
        System.out.println("list是否包含Java:"+list.contains("Java"));
        for (int i = 0; i < list.size(); i++) {
            System.out.println(list.get(i));
        }
        Iterator iterator = list.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
        list.remove("Hello");
        list.remove(0);
        System.out.println("******************");
        System.out.println(list);
        list.add(1,"Spring");
        System.out.println(list);
        list.add(1,"Spring Boot");
        System.out.println(list);
        list.set(1,"Spring Cloud");
        System.out.println(list);
        System.out.println("*************");
        System.out.println(list.indexOf("Spring"));
        System.out.println(list.subList(1,3));
    }
}
```

ArrayList：基于数组的实现，非线程安全，效率高，所有的方法都没有 synchronized 修饰。

#### 2、Vector

线程安全，效率低，实现线程安全直接通过 synchronized 修饰方法来完成。

#### 3、Stack

Vector 的子类，实现了**栈**的数据结构，（后进先出）

- push：入栈方法
- peek：取出栈顶元素，将栈顶复制一份取出，取完之后栈内的数据不变。
- pop：取出栈顶元素，直接取出栈顶元素，取完之后栈内的数据减一。

#### 4、LikedList

实现了先进先出的队列，采用链表的形式存储。

ArrayList 和 LikedList 的区别：内存中存储的形式不同，ArrayList 采用的数组的方式，LinkedList 采用的是链表的形式。

数组在内存中存储空间是连续的，读取快，增删慢。

因为数组在内存中是连续的，所以取数据可以通过寻址公式很快求出目标元素的内存地址，因为内存是连续的，所以新增或者删除元素，必然需要移动数据，而且**数组长度越长，需要移动的元素越多，操作就越慢。**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201926917.png)

链表在内存中存储空间是不连续的，读取慢，增删快。链表在内存中是不连续的，没有固定的公式可以使用，要读取只能从第一位开始一直遍历到目标元素，数据规模越大，操作越慢。

增删快，因为只需要重新设置目标元素前后两个节点的后置指针即可，与数据规模无关。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201934948.png)

```java
public class Test {
    public static void main(String[] args) {
        LinkedList linkedList = new LinkedList();
        linkedList.add("Hello");
        linkedList.add("World");
        linkedList.add("Java");
        System.out.println(linkedList);
        linkedList.offer("JavaSE");
        System.out.println(linkedList);
        linkedList.push("JavaME");
        System.out.println(linkedList);
        linkedList.addFirst("First");
        System.out.println(linkedList);
        linkedList.addLast("Last");
        System.out.println(linkedList);
        System.out.println(linkedList.peek());
        System.out.println(linkedList.peekFirst());
        System.out.println(linkedList.peekLast());
        System.out.println(linkedList.pop());
        System.out.println(linkedList);
    }
}
```

**LinkedList 和 Stack 都有 pop 方法，有什么区别和相同点？**

pop 方法都是取出集合中的第一个元素，但是两者的顺序是相反的，Stack 是“后进先出”，所以 pop 取出的是最后一个元素，LinkedList 是“先进先出”，所以 pop 取出的是第一个元素。

#### 5、Queue

LinkedList 实现了 Deque 接口，而 Deque 接口是 Queue 的子接口，Queue 就是队列，底层实现了队列的数据结构。

实际开发中，不能直接实例化 Queue 对象。

Queue 的实现类是 AbstractQueue，它是一个抽象类，不能直接实例化，开发中需要实现它的子类 PriorityQueue。

Queue 中添加的数据必须是有顺序的。

```java
package com.du.demo5;

import java.util.PriorityQueue;

public class Test {
    public static void main(String[] args) {
        PriorityQueue queue = new PriorityQueue();
//        queue.add(1);
//        queue.add(2);
//        queue.add(3);
//        queue.add("a");
//        queue.add("b");
//        queue.add("c");

        queue.add(new A(1));
        queue.add(new A(2));
        System.out.println(queue);
    }
}

class A implements Comparable{

    private int num;

    public A(int num) {
        this.num = num;
    }

    @Override
    public int compareTo(Object o) {
        A a = (A)o;
        if(this.num > a.num){
            return 1;
        }else if(this.num == a.num){
            return 0;
        }else{
            return -1;
        }
    }

    @Override
    public String toString() {
        return "A{" +
                "num=" + num +
                '}';
    }
}
```

Queue 默认给元素进行升序排列，即自然排序。

### 6、Java 集合框架

- List（有序不唯一）
- Set
- Map

List Set：存储的是单个数据，List 可以存储重复的数据，Set 数据不能重复

Map：存储的是一组数据

### 7、Set

跟 List 一样，Set 是 Collection 的子接口，Set 集合是以散列的形式存储数据，所以元素是没有顺序的，可以存储一组无序且唯一的数据。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201957265.png)

Set 常用实现类：

- HashSet
- LinkedHashSet
- TreeSet

#### 1、HashSet

HashSet 是开发中经常使用的一个实现类，存储一组无序且唯一的对象。

无序：元素的存储顺序和遍历顺序不一致。

```java
public class Test {
    public static void main(String[] args) {
        HashSet set = new HashSet();
        set.add("Hello");
        set.add("World");
        set.add("Java");
        set.add("Hello");
        Iterator iterator = set.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
        set.remove("World");
        System.out.println("****************");
        iterator = set.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
    }
}
```

#### 2、LinkedHashSet

LinkedHasSet 是 Set 的另外一个实现类，可以存储一组有序且唯一的元素.

有序：元素的存储顺序和遍历顺序一致。

```java
public class Test {
    public static void main(String[] args) {
        LinkedHashSet linkedHashSet = new LinkedHashSet();
        linkedHashSet.add("Hello");
        linkedHashSet.add("World");
        linkedHashSet.add("Java");
        linkedHashSet.add("Hello");
        System.out.println("LinkedHashSet的长度是"+linkedHashSet.size());
        System.out.println("遍历LinkedHashSet");
        Iterator iterator = linkedHashSet.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
        linkedHashSet.remove("Java");
        System.out.println(linkedHashSet.contains("Java"));
    }
}
```

##### 1、equals 和 == 的区别？

所有类中的 equals 都是继承自 Object 类，Object 类中原生的 eqauls 方法就是在通过 == 进行判断

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202017530.png)

但是每个类都可以对 equals 方法进行重写，覆盖掉之前使用 == 进行判断的逻辑，改用新的逻辑进行判断是否相等。

LinkedHashSet 如何判断两个对象是否相等？

首先会判断两个对象的 hashCode 是否相等

> 什么是 hashCode？

将对象的内部信息（内存地址、属性值等），通过某种特定规则转换成一个散列值，就是该对象的 hashCode。

- 两个不同对象的 hashCode 值可能相等。
- hashCode 不相等的两个对象一定不是同一个对象。

集合在判断两个对象是否相等的时候：

1、会先比较他们的 hashCode，如果 hashCode 不相等，则认为不是同一个对象，可以添加。

2、如果 hashCode 值相等，还不能认为两个对象是相等的，需要通过 equals 进行进一步的判断，equals 相等，则两个对象相等，否则两个对象不相等。

```java
public class Test {
    
    public static void main(String[] args) {
        LinkedHashSet set = new LinkedHashSet();
        Data data1 = new Data(1);
        set.add(data1);
        Data data2 = new Data(1);
        set.add(data2);
        //是一个对象
        System.out.println(data1.equals(data2));
        //不是一个对象
        System.out.println(set);
    }
    
}

class Data {
    private int num;

    public Data(int num) {
        this.num = num;
    }

    @Override
    public String toString() {
        return "Data{" +
            "num=" + num +
            '}';
    }

    //hashcode
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        //instanceof 判断对象是否属于某个类
        if(obj instanceof Data){
            Data data = (Data) obj;
            if(this.num == data.num){
                return true;
            }
        }
        return false;
    }

    @Override
    public int hashCode() {
        return 1;
    }
}
```

##### 2、 ==：判断的是栈内存中的值。

`引用类型的数据`：栈内存中存储的是地址，所以此时 == 判断的是引用地址。

`基本数据类型`：栈内存中存储的是具体的数值。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202040892.png)

栈中存储的是变量

Data data;

int num;

引用类型具体的对象（属性）存储在堆中的，再**将堆中对象的内存地址赋值给栈中的变量** data，data 中存储的就是地址。

基本数据类型不需要用到堆内存，变量在栈中，变量的值直接存储在变量中。

### 8、TreeSet

LinkedHashSet 和 TreeSet 都是存储一组**有序且唯一**的数据，但是这里的两个有序是有区别的。

LinkedHashSet 的有序是指元素的**存储顺序和遍历顺序**是一致的。

如：6,3,4,5,1,2–>6,3,4,5,1,2

TreeSet 的有序是指集合内部会**自动对所有的元素**按照升序进行排列，无论存入的顺序是什么，遍历的时候一定按照生序输出。

```java
public class Test {
    public static void main(String[] args) {
        TreeSet treeSet = new TreeSet();
        //        treeSet.add(1);
        //        treeSet.add(3);
        //        treeSet.add(6);
        //        treeSet.add(2);
        //        treeSet.add(5);
        //        treeSet.add(4);
        //        treeSet.add(1);
        treeSet.add("b11");
        treeSet.add("e22");
        treeSet.add("a33");
        treeSet.add("c44");
        treeSet.add("d55");
        System.out.println("treeSet的长度是"+treeSet.size());
        System.out.println("treeSet遍历");
        Iterator iterator = treeSet.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
    }
}
```

```java
public class Test {
    public static void main(String[] args) {
        TreeSet treeSet = new TreeSet();
        treeSet.add(new Data(1));
        treeSet.add(new Data(3));
        treeSet.add(new Data(6));
        treeSet.add(new Data(2));
        treeSet.add(new Data(5));
        treeSet.add(new Data(4));
        treeSet.add(new Data(1));
        System.out.println("treeSet的长度"+treeSet.size());
        System.out.println("treeSet遍历");
        Iterator iterator = treeSet.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
    }
}

class Data implements Comparable{
    private int num;

    public Data(int num) {
        this.num = num;
    }

    /**
     * A.compareTo(B)
     * 返回值：
     * 1 表示A大于B
     * 0 表示A等于B
     * -1 表示A小于B
     * @param o
     * @return
     */
    @Override
    public int compareTo(Object o) {
        if(o instanceof Data){
            Data data = (Data) o;
            if(this.num < data.num){
                return 1;
            }else if(this.num == data.num){
                return 0;
            }else{
                return -1;
            }
        }
        return 0;
    }

    @Override
    public String toString() {
        return "Data{" +
            "num=" + num +
            '}';
    }
}
```

### 9、Map

key-value，数据字典

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202112687.png)

List、Set 接口都是 Collection 的子接口，Map 接口是与 Collection 完全独立的另外一个体系。

List & Set VS Map

List & Set & Collection 只能操作单个元素，Map 可以操作一对元素，因为 Map 存储结构是 key - value 映射。

Map 接口定义时使用了泛型，并且定义两个泛型 K 和 V，K 表示 key，规定键元素的数据类型，V 表示 value，规定值元素的数据类型。

| 方法                                | 描述                                        |
| ----------------------------------- | ------------------------------------------- |
| int size()                          | 获取集合长度                                |
| boolean isEmpty()                   | 判断集合是否为空                            |
| boolean containsKey(Object key)     | 判断集合中是否存在某个 key                  |
| boolean containsValue(Object value) | 判断集合中是否存在某个 value                |
| V get(Object key)                   | 取出集合中 key 对应的 value                 |
| V put(K key,V value)                | 向集合中存入一组 key-value 的元素           |
| V remove(Object key)                | 删除集合中 key 对应的 value                 |
| void putAll(Map map)                | 向集合中添加另外一个 Map                    |
| void clear()                        | 清除集合中所有的元素                        |
| Set keySet()                        | 取出集合中所有的 key，返回一个 Set          |
| Collection values()                 | 取出集合中所有的 value，返回一个 Collection |
| Set<Map.Entry<K,V>> entrySet()      | 将 Map 以 Set 的形式输出                    |
| int hashCode()                      | 获取集合的散列值                            |
| boolean equals(Object o)            | 比较两个集合是否相等                        |

### 10、Map 接口的实现类

- HashMap：存储一组无序，key 不可以重复，value 可以重复的元素。
- Hashtable：存储一组无序，key 不可以重复，value 可以重复的元素。
- TreeMap：存储一组有序，key 不可以重复，value 可以重复的元素，可以按照 key 进行排序。

#### 1、HashMap 的使用

```java
public class Test {
    public static void main(String[] args) {
        HashMap hashMap = new HashMap();
        hashMap.put("h","Hello");
        hashMap.put("w","World");
        hashMap.put("j","Java");
        hashMap.put("s","JavaSE");
        hashMap.put("m","JavaME");
        hashMap.put("e","JavaEE");
        System.out.println(hashMap);
        hashMap.remove("e");
        System.out.println("删除之后"+hashMap);
        hashMap.put("m","Model");
        System.out.println("添加之后"+hashMap);
        if (hashMap.containsKey("a")){
            System.out.println("集合中存在key=a");
        }else{
            System.out.println("集合中不存在key=a");
        }
        if(hashMap.containsValue("Java")){
            System.out.println("集合中存在value=Java");
        }else {
            System.out.println("集合中不存在value=Java");
        }
        Set keys = hashMap.keySet();
        System.out.println("集合中的key");
        Iterator iterator = keys.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
        Collection values = hashMap.values();
        for (Object value : values) {
            System.out.println(value);
        }
        System.out.println("************");
        iterator = keys.iterator();
        while(iterator.hasNext()){
            String key = (String) iterator.next();
            String value = (String) hashMap.get(key);
            System.out.println(key+"-"+value);
        }
    }
}
```

#### 2、Hashtable

Hashtable 用法与 HashMap基本一样，它们的区别是，Hashtable是线程安全的，但是性能较低。HashMap 是非线程安全的，但是性能较高。

HashMap，方法没有用 synchronized 修饰，所以是非线程安全的。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202129108.png)

Hashtable，方法用 synchronized 修饰，所以是线程安全的。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202200414.png)

Hashtable 的使用

```java
public class Test {
    public static void main(String[] args) {
        Hashtable hashtable = new Hashtable();
        hashtable.put("h","Hello");
        hashtable.put("w","World");
        hashtable.put("j","Java");
        hashtable.put("s","JavaSE");
        hashtable.put("m","JavaME");
        hashtable.put("e","JavaEE");
        System.out.println(hashtable);
        hashtable.remove("e");
        System.out.println(hashtable);
        System.out.println(hashtable.containsKey("a"));
        System.out.println(hashtable.containsValue("Java"));
        Set keys = hashtable.keySet();
        System.out.println(keys);
        Collection values = hashtable.values();
        System.out.println(values);
    }
}
```

HashMap 和 Hashtable，保存的书画家都是无序的，Map 的另外一个实现类 TreeMap 主要功能是按照 key 对集合中的元素进行排序。

#### 3、TreeMap

TreeMap 的使用

```java
public class Test2 {
    public static void main(String[] args) {
        TreeMap treeMap = new TreeMap();
        treeMap.put(new User(3,"Java"),"Java");
        treeMap.put(new User(5,"JavaME"),"JavaME");
        treeMap.put(new User(1,"Hello"),"Hello");
        treeMap.put(new User(6,"JavaEE"),"JavaEE");
        treeMap.put(new User(2,"World"),"World");
        treeMap.put(new User(4,"JavaSE"),"JavaSE");
        System.out.println(treeMap);
        Set set = treeMap.keySet();
        Iterator iterator = set.iterator();
        while(iterator.hasNext()){
            Object key = iterator.next();
            System.out.println(key+"-"+treeMap.get(key));
        }
    }
}

class User implements Comparable{
    private int id;
    private String name;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }

    @Override
    public int compareTo(Object o) {
        if (o instanceof User){
            User user = (User)o;
            if(this.id > user.id){
                return 1;
            }else if(this.id == user.id){
                return 0;
            }else {
                return -1;
            }
        }
        return 0;
    }
}
```

### 11、Collections 工具类

Collection 接口，List 和 Set的父接口。

Collections不是接口，它是一个**工具类**，专门提供了一些对集合的操作，方便开发者去使用，完成相应的业务功能。

Colletions 针对集合的工具类，Collection

Arrays 针对数组的工具类，Array

| name                                                         | 描述                                        |
| ------------------------------------------------------------ | ------------------------------------------- |
| public static sort()                                         | 对集合进行排序                              |
| public static int binarySearch(List list,Object v)           | 查找 v 在 list 中的位置，集合必须是生序排列 |
| public static get(List list,int index)                       | 返回 list 中 index 位置的值                 |
| public static void reverse(List list)                        | 对 list 进行反序输出                        |
| public static void swap(List list,int i,int j)               | 交换集合中指定位置的两个元素                |
| public static void fill(List list,Object obj)                | 将集合中所有元素替换成 obj                  |
| public static Object min(List list)                          | 返回集合中的最小值                          |
| public static Object max(List list)                          | 返回集合中的最大值                          |
| public static boolean replaceAll(List list,Object old,Object new) | 在 list 集合中用 new 替换 old               |
| public static boolean addAll(List list,Object… obj)          | 向集合中添加元素                            |

可变参数，在调用方法的时候，参数可以是任意个数，但是类型必须匹配。

```java
public static void test(int... arg){
}
```

但是下面这种写法，可以传任意类型，任意数量的参数，多态的一种具体表示形式。

```java
public static void test(Object... arg){
}
```

Java 中默认输出对象的格式：对象所属的全类名（全限定类名）带着包名的类名+@+对象的哈希值

断点 breakpoint

JavaScript js 脚本语言

Java 是必须全部编译之后，统一执行，假如有 10 行 Java 代码，必须先对这 10 行代码进行编译，通过之后，再交给 JVM 执行。

JS 逐行执行，执行一行算一行，假如有 10 行 JS 代码，一行一行开始执行，执行到第 5 行报错，那么后续 6-10 就不再执行，但是已经执行的前 5 行结果不变。

Java 更加严谨，JS 更加随意

Java 是强语言类型的，JS 是弱语言类型

```java
public class Test {
    public static void main(String[] args) {
        ArrayList list = new ArrayList();
//        list.add("Hello");
//        list.add("Java");
//        Collections.addAll(list,"Java","JavaME","World");
//        System.out.println("排序之前");
//        System.out.println(list);
        //进行排序-》升序a
//        Collections.sort(list);
//        System.out.println("排序之后");
//        System.out.println(list);
        //查找元素在集合中的下标,二分查找法（集合中的元素必须升序排列）
//        int index = Collections.binarySearch(list,"Java");
//        System.out.println("Java 在 list 中的下标"+index);
//        System.out.println(list);
//        Collections.replaceAll(list,"Java","Collections");
//        System.out.println(list);

        Collections.addAll(
                list,
                new User(1,"张三",30),
                new User(2,"李四",26),
                new User(3,"王五",18)
        );
        Collections.sort(list);
        System.out.println(list);
    }
}

class User implements Comparable{
    private Integer id;
    private String name;
    private Integer age;

    public User(Integer id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

    @Override
    public int compareTo(Object o) {
        if(o instanceof User){
            User user = (User) o;
            if(this.age < user.age){
                return 1;
            }else if(this.age == user.age){
                return 0;
            }else{
                return -1;
            }
        }
        return 0;
    }
}
```

