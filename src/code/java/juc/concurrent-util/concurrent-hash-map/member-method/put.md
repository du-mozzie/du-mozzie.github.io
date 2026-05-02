---
order: 2
title: 添加方法
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 添加方法

```java
public V put(K key, V value) {
    // 第三个参数 onlyIfAbsent 为 false 表示哈希表中存在相同的 key 时【用当前数据覆盖旧数据】
    return putVal(key, value, false);
}
```

-  putVal() 

```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // 【ConcurrentHashMap 不能存放 null 值】
    if (key == null || value == null) throw new NullPointerException();
    // 扰动运算，高低位都参与寻址运算
    int hash = spread(key.hashCode());
    // 表示当前 k-v 封装成 node 后插入到指定桶位后，在桶位中的所属链表的下标位置
    int binCount = 0;
    // tab 引用当前 map 的数组 table，开始自旋
    for (Node\<K,V\>[] tab = table;;) {
        // f 表示桶位的头节点，n 表示哈希表数组的长度
        // i 表示 key 通过寻址计算后得到的桶位下标，fh 表示桶位头结点的 hash 值
        Node\<K,V\> f; int n, i, fh;
        
        // 【CASE1】：表示当前 map 中的 table 尚未初始化
        if (tab == null || (n = tab.length) == 0)
            //【延迟初始化】
            tab = initTable();
        
        // 【CASE2】：i 表示 key 使用【寻址算法】得到 key 对应数组的下标位置，tabAt 获取指定桶位的头结点f
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // 对应的数组为 null 说明没有哈希冲突，直接新建节点添加到表中
            if (casTabAt(tab, i, null, new Node\<K,V\>(hash, key, value, null)))
                break;
        }
        // 【CASE3】：逻辑说明数组已经被初始化，并且当前 key 对应的位置不为 null
        // 条件成立表示当前桶位的头结点为 FWD 结点，表示目前 map 正处于扩容过程中
        else if ((fh = f.hash) == MOVED)
            // 当前线程【需要去帮助哈希表完成扩容】
            tab = helpTransfer(tab, f);
        
        // 【CASE4】：哈希表没有在扩容，当前桶位可能是链表也可能是红黑树
        else {
            // 当插入 key 存在时，会将旧值赋值给 oldVal 返回
            V oldVal = null;
            // 【锁住当前 key 寻址的桶位的头节点】
            synchronized (f) {
                // 这里重新获取一下桶的头节点有没有被修改，因为可能被其他线程修改过，这里是线程安全的获取
                if (tabAt(tab, i) == f) {
                    // 【头节点的哈希值大于 0 说明当前桶位是普通的链表节点】
                    if (fh >= 0) {
                        // 当前的插入操作没出现重复的 key，追加到链表的末尾，binCount表示链表长度 -1
                        // 插入的key与链表中的某个元素的 key 一致，变成替换操作，binCount 表示第几个节点冲突
                        binCount = 1;
                        // 迭代循环当前桶位的链表，e 是每次循环处理节点，e 初始是头节点
                        for (Node\<K,V\> e = f;; ++binCount) {
                            // 当前循环节点 key
                            K ek;
                            // key 的哈希值与当前节点的哈希一致，并且 key 的值也相同
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                // 把当前节点的 value 赋值给 oldVal
                                oldVal = e.val;
                                // 允许覆盖
                                if (!onlyIfAbsent)
                                    // 新数据覆盖旧数据
                                    e.val = value;
                                // 跳出循环
                                break;
                            }
                            Node\<K,V\> pred = e;
                            // 如果下一个节点为空，把数据封装成节点插入链表尾部，【binCount 代表长度 - 1】
                            if ((e = e.next) == null) {
                                pred.next = new Node\<K,V\>(hash, key,
                                                          value, null);
                                break;
                            }
                        }
                    }
                    // 当前桶位头节点是红黑树
                    else if (f instanceof TreeBin) {
                        Node\<K,V\> p;
                        binCount = 2;
                        if ((p = ((TreeBin\<K,V\>)f).putTreeVal(hash, key,
                                                              value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            
            // 条件成立说明当前是链表或者红黑树
            if (binCount != 0) {
                // 如果 binCount >= 8 表示处理的桶位一定是链表，说明长度是 9
                if (binCount >= TREEIFY_THRESHOLD)
                    // 树化
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    // 统计当前 table 一共有多少数据，判断是否达到扩容阈值标准，触发扩容
    // binCount = 0 表示当前桶位为 null，node 可以直接放入，2 表示当前桶位已经是红黑树
    addCount(1L, binCount);
    return null;
}
```

-  spread()：扰动函数
   将 hashCode 无符号右移 16 位，高 16bit 和低 16bit 做异或，最后与 HASH_BITS 相与变成正数，**与树化节点和转移节点区分**，把高低位都利用起来减少哈希冲突，保证散列的均匀性 

```java
static final int spread(int h) {
    return (h ^ (h >>> 16)) & HASH_BITS; // 0111 1111 1111 1111 1111 1111 1111 1111
}
```

-  initTable()：初始化数组，延迟初始化 

```java
private final Node\<K,V\>[] initTable() {
    // tab 引用 map.table，sc 引用 sizeCtl
    Node\<K,V\>[] tab; int sc;
    // table 尚未初始化，开始自旋
    while ((tab = table) == null || tab.length == 0) {
        // sc < 0 说明 table 正在初始化或者正在扩容，当前线程可以释放 CPU 资源
        if ((sc = sizeCtl) < 0)
            Thread.yield();
        // sizeCtl 设置为 -1，相当于加锁，【设置的是 SIZECTL 位置的数据】，
        // 因为是 sizeCtl 是基本类型，不是引用类型，所以 sc 保存的是数据的副本
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                // 线程安全的逻辑，再进行一次判断
                if ((tab = table) == null || tab.length == 0) {
                    // sc > 0 创建 table 时使用 sc 为指定大小，否则使用 16 默认值
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    // 创建哈希表数组
                    Node\<K,V\>[] nt = (Node\<K,V\>[])new Node<?,?>[n];
                    table = tab = nt;
                    // 扩容阈值，n >>> 2  => 等于 1/4 n ，n - (1/4)n = 3/4 n => 0.75 * n
                    sc = n - (n >>> 2);
                }
            } finally {
                // 解锁，把下一次扩容的阈值赋值给 sizeCtl
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

-  treeifyBin()：树化方法 

```java
private final void treeifyBin(Node\<K,V\>[] tab, int index) {
    Node\<K,V\> b; int n, sc;
    if (tab != null) {
        // 条件成立：【说明当前 table 数组长度未达到 64，此时不进行树化操作，进行扩容操作】
        if ((n = tab.length) < MIN_TREEIFY_CAPACITY)
            // 当前容量的 2 倍
            tryPresize(n << 1);

        // 条件成立：说明当前桶位有数据，且是普通 node 数据。
        else if ((b = tabAt(tab, index)) != null && b.hash >= 0) {
            // 【树化加锁】
            synchronized (b) {
                // 条件成立：表示加锁没问题。
                if (tabAt(tab, index) == b) {
                    TreeNode\<K,V\> hd = null, tl = null;
                    for (Node\<K,V\> e = b; e != null; e = e.next) {
                        TreeNode\<K,V\> p = new TreeNode\<K,V\>(e.hash, e.key, e.val,null, null);
                        if ((p.prev = tl) == null)
                            hd = p;
                        else
                            tl.next = p;
                        tl = p;
                    }
                    setTabAt(tab, index, new TreeBin\<K,V\>(hd));
                }
            }
        }
    }
}
```

-  addCount()：添加计数，**代表哈希表中的数据总量** 

```java
private final void addCount(long x, int check) {
    // 【上面这部分的逻辑就是 LongAdder 的累加逻辑】
    CounterCell[] as; long b, s;
    // 判断累加数组 cells 是否初始化，没有就去累加 base 域，累加失败进入条件内逻辑
    if ((as = counterCells) != null ||
        !U.compareAndSwapLong(this, BASECOUNT, b = baseCount, s = b + x)) {
        CounterCell a; long v; int m;
        // true 未竞争，false 发生竞争
        boolean uncontended = true;
        // 判断 cells 是否被其他线程初始化
        if (as == null || (m = as.length - 1) < 0 ||
            // 前面的条件为 fasle 说明 cells 被其他线程初始化，通过 hash 寻址对应的槽位
            (a = as[ThreadLocalRandom.getProbe() & m]) == null ||
            // 尝试去对应的槽位累加，累加失败进入 fullAddCount 进行重试或者扩容
            !(uncontended = U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))) {
            // 与 Striped64#longAccumulate 方法相同
            fullAddCount(x, uncontended);
            return;
        }
        // 表示当前桶位是 null，或者一个链表节点
        if (check <= 1)	
            return;
    	// 【获取当前散列表元素个数】，这是一个期望值
        s = sumCount();
    }
    
    // 表示一定 【是一个 put 操作调用的 addCount】
    if (check >= 0) {
        Node\<K,V\>[] tab, nt; int n, sc;
        
        // 条件一：true 说明当前 sizeCtl 可能为一个负数表示正在扩容中，或者 sizeCtl 是一个正数，表示扩容阈值
        //        false 表示哈希表的数据的数量没达到扩容条件
        // 然后判断当前 table 数组是否初始化了，当前 table 长度是否小于最大值限制，就可以进行扩容
        while (s >= (long)(sc = sizeCtl) && (tab = table) != null &&
               (n = tab.length) < MAXIMUM_CAPACITY) {
            // 16 -> 32 扩容 标识为：1000 0000 0001 1011，【负数，扩容批次唯一标识戳】
            int rs = resizeStamp(n);
            
            // 表示当前 table，【正在扩容】，sc 高 16 位是扩容标识戳，低 16 位是线程数 + 1
            if (sc < 0) {
                // 条件一：判断扩容标识戳是否一样，fasle 代表一样
                // 勘误两个条件：
                // 条件二是：sc == (rs << 16 ) + 1，true 代表扩容完成，因为低16位是1代表没有线程扩容了
                // 条件三是：sc == (rs << 16) + MAX_RESIZERS，判断是否已经超过最大允许的并发扩容线程数
                // 条件四：判断新表的引用是否是 null，代表扩容完成
                // 条件五：【扩容是从高位到低位转移】，transferIndex < 0 说明没有区间需要扩容了
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                    transferIndex <= 0)
                    break;
                
                // 设置当前线程参与到扩容任务中，将 sc 低 16 位值加 1，表示多一个线程参与扩容
                // 设置失败其他线程或者 transfer 内部修改了 sizeCtl 值
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    //【协助扩容线程】，持有nextTable参数
                    transfer(tab, nt);
            }
            // 逻辑到这说明当前线程是触发扩容的第一个线程，线程数量 + 2
            // 1000 0000 0001 1011 0000 0000 0000 0000 +2 => 1000 0000 0001 1011 0000 0000 0000 0010
            else if (U.compareAndSwapInt(this, SIZECTL, sc,(rs << RESIZE_STAMP_SHIFT) + 2))
                //【触发扩容条件的线程】，不持有 nextTable，初始线程会新建 nextTable
                transfer(tab, null);
            s = sumCount();
        }
    }
}
```

-  resizeStamp()：扩容标识符，**每次扩容都会产生一个，不是每个线程都产生**，16 扩容到 32 产生一个，32 扩容到 64 产生一个 

```java
/**
 * 扩容的标识符
 * 16 -> 32 从16扩容到32
 * numberOfLeadingZeros(16) => 1 0000 => 32 - 5 = 27 => 0000 0000 0001 1011
 * (1 << (RESIZE_STAMP_BITS - 1)) => 1000 0000 0000 0000 => 32768
 * ---------------------------------------------------------------
 * 0000 0000 0001 1011
 * 1000 0000 0000 0000
 * 1000 0000 0001 1011
 * 永远是负数
 */
static final int resizeStamp(int n) {
    // 或运算
    return Integer.numberOfLeadingZeros(n) | (1 << (RESIZE_STAMP_BITS - 1)); // (16 -1 = 15)
}
```

