---
order: 3
title: Collections
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# Collections

Collections类是用来操作集合的工具类，提供了集合转换成线程安全的方法：

```java
 public static \<T\> Collection\<T\> synchronizedCollection(Collection\<T\> c) {
     return new SynchronizedCollection\<\>(c);
 }
public static \<K,V\> Map\<K,V\> synchronizedMap(Map\<K,V\> m) {
    return new SynchronizedMap\<\>(m);
}
```

源码：底层也是对方法进行加锁

```java
public boolean add(E e) {
    synchronized (mutex) {return c.add(e);}
}
```
