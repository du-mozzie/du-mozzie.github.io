---
order: 3
title: 构造方法
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 构造方法

-  无参构造， 散列表结构延迟初始化，默认的数组大小是 16： 

```java
public ConcurrentHashMap() {
}
```

-  有参构造： 

```java
public ConcurrentHashMap(int initialCapacity) {
    // 指定容量初始化
    if (initialCapacity < 0) throw new IllegalArgumentException();
    int cap = ((initialCapacity >= (MAXIMUM_CAPACITY >>> 1)) ?
               MAXIMUM_CAPACITY :
               // 假如传入的参数是 16，16 + 8 + 1 ，最后得到 32
               // 传入 12， 12 + 6 + 1 = 19，最后得到 32，尽可能的大，与 HashMap不一样
               tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1));
    // sizeCtl > 0，当目前 table 未初始化时，sizeCtl 表示初始化容量
    this.sizeCtl = cap;
}
private static final int tableSizeFor(int c) {
    int n = c - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

HashMap 部分详解了该函数，核心思想就是**把最高位是 1 的位以及右边的位全部置 1**，结果加 1 后就是 2 的 n 次幂 

-  多个参数构造方法： 

```java
public ConcurrentHashMap(int initialCapacity, float loadFactor, int concurrencyLevel) {
    if (!(loadFactor > 0.0f) || initialCapacity < 0 || concurrencyLevel <= 0)
        throw new IllegalArgumentException();
    // 初始容量小于并发级别
    if (initialCapacity < concurrencyLevel)  
        // 把并发级别赋值给初始容量
        initialCapacity = concurrencyLevel; 
	// loadFactor 默认是 0.75
    long size = (long)(1.0 + (long)initialCapacity / loadFactor);
    int cap = (size >= (long)MAXIMUM_CAPACITY) ?
        MAXIMUM_CAPACITY : tableSizeFor((int)size);
    // sizeCtl > 0，当目前 table 未初始化时，sizeCtl 表示初始化容量
    this.sizeCtl = cap;
}
```

-  集合构造方法： 

```java
public ConcurrentHashMap(Map<? extends K, ? extends V\> m) {
    this.sizeCtl = DEFAULT_CAPACITY;	// 默认16
    putAll(m);
}
public void putAll(Map<? extends K, ? extends V\> m) {
    // 尝试触发扩容
    tryPresize(m.size());
    for (Entry<? extends K, ? extends V\> e : m.entrySet())
        putVal(e.getKey(), e.getValue(), false);
}
private final void tryPresize(int size) {
    // 扩容为大于 2 倍的最小的 2 的 n 次幂
    int c = (size >= (MAXIMUM_CAPACITY >>> 1)) ? MAXIMUM_CAPACITY :
    	tableSizeFor(size + (size >>> 1) + 1);
    int sc;
    while ((sc = sizeCtl) >= 0) {
        Node\<K,V\>[] tab = table; int n;
        // 数组还未初始化，【一般是调用集合构造方法才会成立，put 后调用该方法都是不成立的】
        if (tab == null || (n = tab.length) == 0) {
            n = (sc > c) ? sc : c;
            if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
                try {
                    if (table == tab) {
                        Node\<K,V\>[] nt = (Node\<K,V\>[])new Node<?,?>[n];
                        table = nt;
                        sc = n - (n >>> 2);// 扩容阈值：n - 1/4 n
                    }
                } finally {
                    sizeCtl = sc;	// 扩容阈值赋值给sizeCtl
                }
            }
        }
        // 未达到扩容阈值或者数组长度已经大于最大长度
        else if (c <= sc || n >= MAXIMUM_CAPACITY)
            break;
        // 与 addCount 逻辑相同
        else if (tab == table) {
           
        }
    }
}
```
