---
order: 3
title: 扩容方法
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 扩容方法

扩容机制：

- 当链表中元素个数超过 8 个，数组的大小还未超过 64 时，此时进行数组的扩容，如果超过则将链表转化成红黑树
- put 数据后调用 addCount() 方法，判断当前哈希表的容量超过阈值 sizeCtl，超过进行扩容
- 增删改线程发现其他线程正在扩容，帮其扩容

常见方法：

-  transfer()：数据转移到新表中，完成扩容 

```java
private final void transfer(Node\<K,V\>[] tab, Node\<K,V\>[] nextTab) {
    // n 表示扩容之前 table 数组的长度
    int n = tab.length, stride;
    // stride 表示分配给线程任务的步长，默认就是 16 
    if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
        stride = MIN_TRANSFER_STRIDE;
    // 如果当前线程为触发本次扩容的线程，需要做一些扩容准备工作，【协助线程不做这一步】
    if (nextTab == null) {
        try {
            // 创建一个容量是之前【二倍的 table 数组】
            Node\<K,V\>[] nt = (Node\<K,V\>[])new Node<?,?>[n << 1];
            nextTab = nt;
        } catch (Throwable ex) {
            sizeCtl = Integer.MAX_VALUE;
            return;
        }
        // 把新表赋值给对象属性 nextTable，方便其他线程获取新表
        nextTable = nextTab;
        // 记录迁移数据整体位置的一个标记，transferIndex 计数从1开始不是 0，所以这里是长度，不是长度-1
        transferIndex = n;
    }
    // 新数组的长度
    int nextn = nextTab.length;
    // 当某个桶位数据处理完毕后，将此桶位设置为 fwd 节点，其它写线程或读线程看到后，可以从中获取到新表
    ForwardingNode\<K,V\> fwd = new ForwardingNode\<K,V\>(nextTab);
    // 推进标记
    boolean advance = true;
    // 完成标记
    boolean finishing = false;
    
    // i 表示分配给当前线程任务，执行到的桶位
    // bound 表示分配给当前线程任务的下界限制，因为是倒序迁移，16 迁移完 迁移 15，15完成去迁移14
    for (int i = 0, bound = 0;;) {
        Node\<K,V\> f; int fh;
        
        // 给当前线程【分配任务区间】
        while (advance) {
            // 分配任务的开始下标，分配任务的结束下标
            int nextIndex, nextBound;
         
            // --i 让当前线程处理下一个索引，true说明当前的迁移任务尚未完成，false说明线程已经完成或者还未分配
            if (--i >= bound || finishing)
                advance = false;
            // 迁移的开始下标，小于0说明没有区间需要迁移了，设置当前线程的 i 变量为 -1 跳出循环
            else if ((nextIndex = transferIndex) <= 0) {
                i = -1;
                advance = false;
            }
            // 逻辑到这说明还有区间需要分配，然后给当前线程分配任务，
            else if (U.compareAndSwapInt(this, TRANSFERINDEX, nextIndex,
                      // 判断区间是否还够一个步长，不够就全部分配
                      nextBound = (nextIndex > stride ? nextIndex - stride : 0))) {
                // 当前线程的结束下标
                bound = nextBound;
                // 当前线程的开始下标，上一个线程结束的下标的下一个索引就是这个线程开始的下标
                i = nextIndex - 1;
                // 任务分配结束，跳出循环执行迁移操作
                advance = false;
            }
        }
        
        // 【分配完成，开始数据迁移操作】
        // 【CASE1】：i < 0 成立表示当前线程未分配到任务，或者任务执行完了
        if (i < 0 || i >= n || i + n >= nextn) {
            int sc;
            // 如果迁移完成
            if (finishing) {
                nextTable = null;	// help GC
                table = nextTab;	// 新表赋值给当前对象
                sizeCtl = (n << 1) - (n >>> 1);// 扩容阈值为 2n - n/2 = 3n/2 = 0.75*(2n)
                return;
            }
            // 当前线程完成了分配的任务区间，可以退出，先把 sizeCtl 赋值给 sc 保留
            if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                // 判断当前线程是不是最后一个线程，不是的话直接 return，
                if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                    return;
                // 所以最后一个线程退出的时候，sizeCtl 的低 16 位为 1
                finishing = advance = true;
                // 【这里表示最后一个线程需要重新检查一遍是否有漏掉的区间】
                i = n;
            }
        }
        
        // 【CASE2】：当前桶位未存放数据，只需要将此处设置为 fwd 节点即可。
        else if ((f = tabAt(tab, i)) == null)
            advance = casTabAt(tab, i, null, fwd);
        // 【CASE3】：说明当前桶位已经迁移过了，当前线程不用再处理了，直接处理下一个桶位即可
        else if ((fh = f.hash) == MOVED)
            advance = true; 
        // 【CASE4】：当前桶位有数据，而且 node 节点不是 fwd 节点，说明这些数据需要迁移
        else {
            // 【锁住头节点】
            synchronized (f) {
                // 二次检查，防止头节点已经被修改了，因为这里才是线程安全的访问
                if (tabAt(tab, i) == f) {
                    // 【迁移数据的逻辑，和 HashMap 相似】
                        
                    // ln 表示低位链表引用
                    // hn 表示高位链表引用
                    Node\<K,V\> ln, hn;
                    // 哈希 > 0 表示当前桶位是链表桶位
                    if (fh >= 0) {
                        // 和 HashMap 的处理方式一致，与老数组长度相与，16 是 10000
                        // 判断对应的 1 的位置上是 0 或 1 分成高低位链表
                        int runBit = fh & n;
                        Node\<K,V\> lastRun = f;
                        // 遍历链表，寻找【逆序看】最长的对应位相同的链表，看下面的图更好的理解
                        for (Node\<K,V\> p = f.next; p != null; p = p.next) {
                            // 将当前节点的哈希 与 n
                            int b = p.hash & n;
                            // 如果当前值与前面节点的值 对应位 不同，则修改 runBit，把 lastRun 指向当前节点
                            if (b != runBit) {
                                runBit = b;
                                lastRun = p;
                            }
                        }
                        // 判断筛选出的链表是低位的还是高位的
                        if (runBit == 0) {
                            ln = lastRun;	// ln 指向该链表
                            hn = null;		// hn 为 null
                        }
                        // 说明 lastRun 引用的链表为高位链表，就让 hn 指向高位链表头节点
                        else {
                            hn = lastRun;
                            ln = null;
                        }
                        // 从头开始遍历所有的链表节点，迭代到 p == lastRun 节点跳出循环
                        for (Node\<K,V\> p = f; p != lastRun; p = p.next) {
                            int ph = p.hash; K pk = p.key; V pv = p.val;
                            if ((ph & n) == 0)
                                // 【头插法】，从右往左看，首先 ln 指向的是上一个节点，
                                // 所以这次新建的节点的 next 指向上一个节点，然后更新 ln 的引用
                                ln = new Node\<K,V\>(ph, pk, pv, ln);
                            else
                                hn = new Node\<K,V\>(ph, pk, pv, hn);
                        }
                        // 高低位链设置到新表中的指定位置
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        // 老表中的该桶位设置为 fwd 节点
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                    // 条件成立：表示当前桶位是 红黑树结点
                    else if (f instanceof TreeBin) {
                        TreeBin\<K,V\> t = (TreeBin\<K,V\>)f;
                        TreeNode\<K,V\> lo = null, loTail = null;
                        TreeNode\<K,V\> hi = null, hiTail = null;
                        int lc = 0, hc = 0;
                        // 迭代 TreeBin 中的双向链表，从头结点至尾节点
                        for (Node\<K,V\> e = t.first; e != null; e = e.next) {
                            // 迭代的当前元素的 hash
                            int h = e.hash;
                            TreeNode\<K,V\> p = new TreeNode\<K,V\>
                                (h, e.key, e.val, null, null);
                            // 条件成立表示当前循环节点属于低位链节点
                            if ((h & n) == 0) {
                                if ((p.prev = loTail) == null)
                                    lo = p;
                                else
                                    //【尾插法】
                                    loTail.next = p;
                                // loTail 指向尾节点
                                loTail = p;
                                ++lc;
                            }
                            else {
                                if ((p.prev = hiTail) == null)
                                    hi = p;
                                else
                                    hiTail.next = p;
                                hiTail = p;
                                ++hc;
                            }
                        }
                        // 拆成的高位低位两个链，【判断是否需要需要转化为链表】，反之保持树化
                        ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                        (hc != 0) ? new TreeBin\<K,V\>(lo) : t;
                        hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                        (lc != 0) ? new TreeBin\<K,V\>(hi) : t;
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                }
            }
        }
    }
}
```

链表处理的 LastRun 机制，**可以减少节点的创建**
![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-ConcurrentHashMap-LastRun机制.png)

-  helpTransfer()：帮助扩容机制 

```java
final Node\<K,V\>[] helpTransfer(Node\<K,V\>[] tab, Node\<K,V\> f) {
    Node\<K,V\>[] nextTab; int sc;
    // 数组不为空，节点是转发节点，获取转发节点指向的新表开始协助主线程扩容
    if (tab != null && (f instanceof ForwardingNode) &&
        (nextTab = ((ForwardingNode\<K,V\>)f).nextTable) != null) {
        // 扩容标识戳
        int rs = resizeStamp(tab.length);
        // 判断数据迁移是否完成，迁移完成会把 新表赋值给 nextTable 属性
        while (nextTab == nextTable && table == tab && (sc = sizeCtl) < 0) {
            if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                sc == rs + MAX_RESIZERS || transferIndex <= 0)
                break;
            // 设置扩容线程数量 + 1
            if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1)) {
                // 协助扩容
                transfer(tab, nextTab);
                break;
            }
        }
        return nextTab;
    }
    return table;
}
```

