---
order: 1
title: 数据访存
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 数据访存

-  tabAt()：获取数组某个槽位的**头节点**，类似于数组中的直接寻址 arr[i] 

```java
// i 是数组索引
static final \<K,V\> Node\<K,V\> tabAt(Node\<K,V\>[] tab, int i) {
    // (i << ASHIFT) + ABASE == ABASE + i * 4 （一个 int 占 4 个字节），这就相当于寻址，替代了乘法
    return (Node\<K,V\>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
}
```

-  casTabAt()：指定数组索引位置修改原值为指定的值 

```java
static final \<K,V\> boolean casTabAt(Node\<K,V\>[] tab, int i, Node\<K,V\> c, Node\<K,V\> v) {
    return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
}
```

-  setTabAt()：指定数组索引位置设置值 

```java
static final \<K,V\> void setTabAt(Node\<K,V\>[] tab, int i, Node\<K,V\> v) {
    U.putObjectVolatile(tab, ((long)i << ASHIFT) + ABASE, v);
}
```

