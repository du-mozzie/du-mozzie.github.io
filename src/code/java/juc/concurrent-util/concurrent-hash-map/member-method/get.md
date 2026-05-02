---
order: 4
title: 获取方法
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 获取方法

ConcurrentHashMap 使用 get()  方法获取指定 key 的数据

-  get()：获取指定数据的方法 

```java
public V get(Object key) {
    Node\<K,V\>[] tab; Node\<K,V\> e, p; int n, eh; K ek;
    // 扰动运算，获取 key 的哈希值
    int h = spread(key.hashCode());
    // 判断当前哈希表的数组是否初始化
    if ((tab = table) != null && (n = tab.length) > 0 &&
        // 如果 table 已经初始化，进行【哈希寻址】，映射到数组对应索引处，获取该索引处的头节点
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // 对比头结点 hash 与查询 key 的 hash 是否一致
        if ((eh = e.hash) == h) {
            // 进行值的判断，如果成功就说明当前节点就是要查询的节点，直接返回
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        // 当前槽位的【哈希值小于0】说明是红黑树节点或者是正在扩容的 fwd 节点
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        // 当前桶位是【链表】，循环遍历查找
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

-  ForwardingNode#find：转移节点的查找方法 

```java
Node\<K,V\> find(int h, Object k) {
    // 获取新表的引用
    outer: for (Node\<K,V\>[] tab = nextTable;;)  {
        // e 表示在扩容而创建新表使用寻址算法得到的桶位头结点，n 表示为扩容而创建的新表的长度
        Node\<K,V\> e; int n;
 
        if (k == null || tab == null || (n = tab.length) == 0 ||
            // 在新表中重新定位 hash 对应的头结点，表示在 oldTable 中对应的桶位在迁移之前就是 null
            (e = tabAt(tab, (n - 1) & h)) == null)
            return null;

        for (;;) {
            int eh; K ek;
            // 【哈希相同值也相同】，表示新表当前命中桶位中的数据，即为查询想要数据
            if ((eh = e.hash) == h && ((ek = e.key) == k || (ek != null && k.equals(ek))))
                return e;

            // eh < 0 说明当前新表中该索引的头节点是 TreeBin 类型，或者是 FWD 类型
            if (eh < 0) {
                // 在并发很大的情况下新扩容的表还没完成可能【再次扩容】，在此方法处再次拿到 FWD 类型
                if (e instanceof ForwardingNode) {
                    // 继续获取新的 fwd 指向的新数组的地址，递归了
                    tab = ((ForwardingNode\<K,V\>)e).nextTable;
                    continue outer;
                }
                else
                    // 说明此桶位为 TreeBin 节点，使用TreeBin.find 查找红黑树中相应节点。
                    return e.find(h, k);
            }

            // 逻辑到这说明当前桶位是链表，将当前元素指向链表的下一个元素，判断当前元素的下一个位置是否为空
            if ((e = e.next) == null)
                // 条件成立说明迭代到链表末尾，【未找到对应的数据，返回 null】
                return null;
        }
    }
}
```

