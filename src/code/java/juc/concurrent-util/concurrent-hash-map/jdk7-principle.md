---
order: 5
title: JDK7原理
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# JDK7原理

ConcurrentHashMap 对锁粒度进行了优化，**分段锁技术**，将整张表分成了多个数组（Segment），每个数组又是一个类似 HashMap 数组的结构。允许多个修改操作并发进行，Segment 是一种可重入锁，继承 ReentrantLock，并发时锁住的是每个 Segment，其他 Segment 还是可以操作的，这样不同 Segment 之间就可以实现并发，大大提高效率。

底层结构： **Segment 数组 + HashEntry 数组 + 链表**（数组 + 链表是 HashMap 的结构）

-  优点：如果多个线程访问不同的 segment，实际是没有冲突的，这与 JDK8 中是类似的 
-  缺点：Segments 数组默认大小为16，这个容量初始化指定后就不能改变了，并且不是懒惰初始化
   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ConcurrentHashMap%201.7%E5%BA%95%E5%B1%82%E7%BB%93%E6%9E%84.png)
