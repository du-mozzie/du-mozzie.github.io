---
order: 5
title: 删除方法
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 删除方法

-  remove()：删除指定元素 

```java
public V remove(Object key) {
    return replaceNode(key, null, null);
}
```

-  replaceNode()：替代指定的元素，会协助扩容，**增删改（写）都会协助扩容，查询（读）操作不会**，因为读操作不涉及加锁 

```java
final V replaceNode(Object key, V value, Object cv) {
    // 计算 key 扰动运算后的 hash
    int hash = spread(key.hashCode());
    // 开始自旋
    for (Node\<K,V\>[] tab = table;;) {
        Node\<K,V\> f; int n, i, fh;
        
        // 【CASE1】：table 还未初始化或者哈希寻址的数组索引处为 null，直接结束自旋，返回 null
        if (tab == null || (n = tab.length) == 0 || (f = tabAt(tab, i = (n - 1) & hash)) == null)
            break;
        // 【CASE2】：条件成立说明当前 table 正在扩容，【当前是个写操作，所以当前线程需要协助 table 完成扩容】
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        // 【CASE3】：当前桶位可能是 链表 也可能是 红黑树 
        else {
            // 保留替换之前数据引用
            V oldVal = null;
            // 校验标记
            boolean validated = false;
            // 【加锁当前桶位头结点】，加锁成功之后会进入代码块
            synchronized (f) {
                // 双重检查
                if (tabAt(tab, i) == f) {
                    // 说明当前节点是链表节点
                    if (fh >= 0) {
                        validated = true;
                        //遍历所有的节点
                        for (Node\<K,V\> e = f, pred = null;;) {
                            K ek;
                            // hash 和值都相同，定位到了具体的节点
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                // 当前节点的value
                                V ev = e.val;
                                if (cv == null || cv == ev ||
                                    (ev != null && cv.equals(ev))) {
                                    // 将当前节点的值 赋值给 oldVal 后续返回会用到
                                    oldVal = ev;
                                    if (value != null)		// 条件成立说明是替换操作
                                        e.val = value;	
                                    else if (pred != null)	// 非头节点删除操作，断开链表
                                        pred.next = e.next;	
                                    else
                                        // 说明当前节点即为头结点，将桶位头节点设置为以前头节点的下一个节点
                                        setTabAt(tab, i, e.next);
                                }
                                break;
                            }
                            pred = e;
                            if ((e = e.next) == null)
                                break;
                        }
                    }
                    // 说明是红黑树节点
                    else if (f instanceof TreeBin) {
                        validated = true;
                        TreeBin\<K,V\> t = (TreeBin\<K,V\>)f;
                        TreeNode\<K,V\> r, p;
                        if ((r = t.root) != null &&
                            (p = r.findTreeNode(hash, key, null)) != null) {
                            V pv = p.val;
                            if (cv == null || cv == pv ||
                                (pv != null && cv.equals(pv))) {
                                oldVal = pv;
                                // 条件成立说明替换操作
                                if (value != null)
                                    p.val = value;
                                // 删除操作
                                else if (t.removeTreeNode(p))
                                    setTabAt(tab, i, untreeify(t.first));
                            }
                        }
                    }
                }
            }
            // 其他线程修改过桶位头结点时，当前线程 sync 头结点锁错对象，validated 为 false，会进入下次 for 自旋
            if (validated) {
                if (oldVal != null) {
                    // 替换的值为 null，【说明当前是一次删除操作，更新当前元素个数计数器】
                    if (value == null)
                        addCount(-1L, -1);
                    return oldVal;
                }
                break;
            }
        }
    }
    return null;
}
```

 参考视频：https://space.bilibili.com/457326371/

