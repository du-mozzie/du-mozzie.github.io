---
order: 2
title: 成员属性
date: 2021-05-25
category: Java
tag: Java
timeline: true
article: true
---

# 成员属性

## 变量

-  存储数组： 

```java
transient volatile Node\<K,V\>[] table;
```

-  散列表的长度： 

```java
private static final int MAXIMUM_CAPACITY = 1 << 30;	// 最大长度
private static final int DEFAULT_CAPACITY = 16;			// 默认长度
```

-  并发级别，JDK7 遗留下来，1.8 中不代表并发级别： 

```java
private static final int DEFAULT_CONCURRENCY_LEVEL = 16;
```

-  负载因子，JDK1.8 的 ConcurrentHashMap 中是固定值： 

```java
private static final float LOAD_FACTOR = 0.75f;
```

-  阈值： 

```java
static final int TREEIFY_THRESHOLD = 8;		// 链表树化的阈值
static final int UNTREEIFY_THRESHOLD = 6;	// 红黑树转化为链表的阈值
static final int MIN_TREEIFY_CAPACITY = 64;	// 当数组长度达到64且某个桶位中的链表长度超过8，才会真正树化
```

-  扩容相关： 

```java
private static final int MIN_TRANSFER_STRIDE = 16;	// 线程迁移数据【最小步长】，控制线程迁移任务的最小区间
private static int RESIZE_STAMP_BITS = 16;			// 用来计算扩容时生成的【标识戳】
private static final int MAX_RESIZERS = (1 << (32 - RESIZE_STAMP_BITS)) - 1;// 65535-1并发扩容最多线程数
private static final int RESIZE_STAMP_SHIFT = 32 - RESIZE_STAMP_BITS;		// 扩容时使用
```

-  节点哈希值： 

```java
static final int MOVED     = -1; 			// 表示当前节点是 FWD 节点
static final int TREEBIN   = -2; 			// 表示当前节点已经树化，且当前节点为 TreeBin 对象
static final int RESERVED  = -3; 			// 表示节点时临时节点
static final int HASH_BITS = 0x7fffffff; 	// 正常节点的哈希值的可用的位数
```

-  扩容过程：volatile 修饰保证多线程的可见性 

```java
// 扩容过程中，会将扩容中的新 table 赋值给 nextTable 保持引用，扩容结束之后，这里会被设置为 null
private transient volatile Node\<K,V\>[] nextTable;
// 记录扩容进度，所有线程都要从 0 - transferIndex 中分配区间任务，简单说就是老表转移到哪了，索引从高到低转移
private transient volatile int transferIndex;
```

-  累加统计： 

```java
// LongAdder 中的 baseCount 未发生竞争时或者当前LongAdder处于加锁状态时，增量累到到 baseCount 中
private transient volatile long baseCount;
// LongAdder 中的 cellsBuzy，0 表示当前 LongAdder 对象无锁状态，1 表示当前 LongAdder 对象加锁状态
private transient volatile int cellsBusy;
// LongAdder 中的 cells 数组，
private transient volatile CounterCell[] counterCells;
```

-  控制变量：
   **sizeCtl** < 0： 

-  -1 表示当前 table 正在初始化（有线程在创建 table 数组），当前线程需要自旋等待 
-  其他负数表示当前 map 的 table 数组正在进行扩容，高 16 位表示扩容的标识戳；低 16 位表示 (1 + nThread) 当前参与并发扩容的线程数量 + 1 

sizeCtl = 0，表示创建 table 数组时使用 DEFAULT_CAPACITY 为数组大小
sizeCtl > 0： 

- 如果 table 未初始化，表示初始化大小
- 如果 table 已经初始化，表示下次扩容时的触发条件（阈值，元素个数，不是数组的长度）

```java
private transient volatile int sizeCtl;		// volatile 保持可见性
```

## 内部类

-  Node 节点： 

```java
static class Node\<K,V\> implements Entry\<K,V\> {
    // 节点哈希值
    final int hash;
    final K key;
    volatile V val;
    // 单向链表
    volatile Node\<K,V\> next;
}
```

-  TreeBin 节点： 

```java
 static final class TreeBin\<K,V\> extends Node\<K,V\> {
     // 红黑树根节点
     TreeNode\<K,V\> root;
     // 链表的头节点
     volatile TreeNode\<K,V\> first;
     // 等待者线程
     volatile Thread waiter;

     volatile int lockState;
     // 写锁状态 写锁是独占状态，以散列表来看，真正进入到 TreeBin 中的写线程同一时刻只有一个线程
     static final int WRITER = 1;
     // 等待者状态（写线程在等待），当 TreeBin 中有读线程目前正在读取数据时，写线程无法修改数据
     static final int WAITER = 2;
     // 读锁状态是共享，同一时刻可以有多个线程 同时进入到 TreeBi 对象中获取数据，每一个线程都给 lockState + 4
     static final int READER = 4;
 }
```

-  TreeNode 节点： 

```java
static final class TreeNode\<K,V\> extends Node\<K,V\> {
    TreeNode\<K,V\> parent;  // red-black tree links
    TreeNode\<K,V\> left;
    TreeNode\<K,V\> right;
    TreeNode\<K,V\> prev;   //双向链表
    boolean red;
}
```

-  ForwardingNode 节点：转移节点 

```java
 static final class ForwardingNode\<K,V\> extends Node\<K,V\> {
     // 持有扩容后新的哈希表的引用
     final Node\<K,V\>[] nextTable;
     ForwardingNode(Node\<K,V\>[] tab) {
         // ForwardingNode 节点的 hash 值设为 -1
         super(MOVED, null, null, null);
         this.nextTable = tab;
     }
 }
```

## 代码块

-  变量： 

```java
// 表示sizeCtl属性在 ConcurrentHashMap 中内存偏移地址
private static final long SIZECTL;
// 表示transferIndex属性在 ConcurrentHashMap 中内存偏移地址
private static final long TRANSFERINDEX;
// 表示baseCount属性在 ConcurrentHashMap 中内存偏移地址
private static final long BASECOUNT;
// 表示cellsBusy属性在 ConcurrentHashMap 中内存偏移地址
private static final long CELLSBUSY;
// 表示cellValue属性在 CounterCell 中内存偏移地址
private static final long CELLVALUE;
// 表示数组第一个元素的偏移地址
private static final long ABASE;
// 用位移运算替代乘法
private static final int ASHIFT;
```

-  赋值方法： 

```java
// 表示数组单元所占用空间大小，scale 表示 Node[] 数组中每一个单元所占用空间大小，int 是 4 字节
int scale = U.arrayIndexScale(ak);
// 判断一个数是不是 2 的 n 次幂，比如 8：1000 & 0111 = 0000
if ((scale & (scale - 1)) != 0)
    throw new Error("data type scale not a power of two");

// numberOfLeadingZeros(n)：返回当前数值转换为二进制后，从高位到低位开始统计，看有多少个0连续在一起
// 8 → 1000 numberOfLeadingZeros(8) = 28
// 4 → 100 numberOfLeadingZeros(4) = 29   int 值就是占4个字节
ASHIFT = 31 - Integer.numberOfLeadingZeros(scale);

// ASHIFT = 31 - 29 = 2 ，int 的大小就是 2 的 2 次方，获取次方数
// ABASE + （5 << ASHIFT） 用位移运算替代了乘法，获取 arr[5] 的值
```
