---
order: 6
title: 线程池
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

## 基本概述

线程池：一个容纳多个线程的容器，容器中的线程可以重复使用，省去了频繁创建和销毁线程对象的操作

线程池作用：

1. 降低资源消耗，减少了创建和销毁线程的次数，每个工作线程都可以被重复利用，可执行多个任务
2. 提高响应速度，当任务到达时，如果有线程可以直接用，不会出现系统僵死
3. 提高线程的可管理性，如果无限制的创建线程，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控

线程池的核心思想：**线程复用**，同一个线程可以被重复使用，来处理多个任务

池化技术 (Pool) ：一种编程技巧，核心思想是资源复用，在请求量大时能优化应用性能，降低系统频繁建连的资源开销

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240809225651241.png)

## 阻塞队列

### 基本介绍

有界队列和无界队列：

-  有界队列：有固定大小的队列，比如设定了固定大小的 LinkedBlockingQueue，又或者大小为 0 
-  无界队列：没有设置固定大小的队列，这些队列可以直接入队，直到溢出（超过 Integer.MAX_VALUE），所以相当于无界 

java.util.concurrent.BlockingQueue 接口有以下阻塞队列的实现：**FIFO 队列**

- ArrayBlockQueue：由数组结构组成的有界阻塞队列
- LinkedBlockingQueue：由链表结构组成的无界（默认大小 Integer.MAX_VALUE）的阻塞队列
- PriorityBlockQueue：支持优先级排序的无界阻塞队列
- DelayedWorkQueue：使用优先级队列实现的延迟无界阻塞队列
- SynchronousQueue：不存储元素的阻塞队列，每一个生产线程会阻塞到有一个 put 的线程放入元素为止
- LinkedTransferQueue：由链表结构组成的无界阻塞队列
- LinkedBlockingDeque：由链表结构组成的**双向**阻塞队列

与普通队列（LinkedList、ArrayList等）的不同点在于阻塞队列中阻塞添加和阻塞删除方法，以及线程安全：

- 阻塞添加 put()：当阻塞队列元素已满时，添加队列元素的线程会被阻塞，直到队列元素不满时才重新唤醒线程执行
- 阻塞删除 take()：在队列元素为空时，删除队列元素的线程将被阻塞，直到队列不为空再执行删除操作（一般会返回被删除的元素)

### 核心方法

| 方法类型         | 抛出异常  | 特殊值   | 阻塞   | 超时               |
| ---------------- | --------- | -------- | ------ | ------------------ |
| 插入（尾）       | add(e)    | offer(e) | put(e) | offer(e,time,unit) |
| 移除（头）       | remove()  | poll()   | take() | poll(time,unit)    |
| 检查（队首元素） | element() | peek()   | 不可用 | 不可用             |

- 抛出异常组： 

- 当阻塞队列满时：在往队列中 add 插入元素会抛出 IIIegalStateException: Queue full
- 当阻塞队列空时：再往队列中 remove 移除元素，会抛出 NoSuchException

- 特殊值组： 

- 插入方法：成功 true，失败 false
- 移除方法：成功返回出队列元素，队列没有就返回 null

- 阻塞组： 

- 当阻塞队列满时，生产者继续往队列里 put 元素，队列会一直阻塞生产线程直到队列有空间 put 数据或响应中断退出
- 当阻塞队列空时，消费者线程试图从队列里 take 元素，队列会一直阻塞消费者线程直到队列中有可用元素

- 超时退出：当阻塞队列满时，队里会阻塞生产者线程一定时间，超过限时后生产者线程会退出

### 链表队列

#### 入队出队

LinkedBlockingQueue 源码：

```java
public class LinkedBlockingQueue\<E\> extends AbstractQueue\<E\>
			implements BlockingQueue\<E\>, java.io.Serializable {
	static class Node\<E\> {
        E item;
        /**
        * 下列三种情况之一
        * - 真正的后继节点
        * - 自己, 发生在出队时
        * - null, 表示是没有后继节点, 是尾节点了
        */
        Node\<E\> next;

        Node(E x) { item = x; }
    }
}
```

入队：**尾插法**

-  初始化链表 `last = head = new Node\<E\>(null)`，**Dummy 节点用来占位**，item 为 null 

```java
public LinkedBlockingQueue(int capacity) {
    // 默认是 Integer.MAX_VALUE
    if (capacity <= 0) throw new IllegalArgumentException();
    this.capacity = capacity;
    last = head = new Node\<E\>(null);
}
```

  当一个节点入队： 

```java
private void enqueue(Node\<E\> node) {
    // 从右向左计算
    last = last.next = node;
}
```

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-LinkedBlockingQueue入队流程.png)

-  再来一个节点入队 `last = last.next = node` 

出队：**出队头节点**，FIFO

-  出队源码： 

```java
private E dequeue() {
    Node\<E\> h = head;
    // 获取临头节点
    Node\<E\> first = h.next;
    // 自己指向自己，help GC
    h.next = h;
    head = first;
    // 出队的元素
    E x = first.item;
    // 【当前节点置为 Dummy 节点】
    first.item = null;
    return x;
}
```

-  `h = head` → `first = h.next`
   ![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-LinkedBlockingQueue出队流程1.png) 
-  `h.next = h` → `head = first`
   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-LinkedBlockingQueue%E5%87%BA%E9%98%9F%E6%B5%81%E7%A8%8B2.png) 

-  `first.item = null`：当前节点置为 Dummy 节点

#### 加锁分析

用了两把锁和 dummy 节点：

- 用一把锁，同一时刻，最多只允许有一个线程（生产者或消费者，二选一）执行
- 用两把锁，同一时刻，可以允许两个线程同时（一个生产者与一个消费者）执行 

- 消费者与消费者线程仍然串行
- 生产者与生产者线程仍然串行

线程安全分析：

-  当节点总数大于 2 时（包括 dummy 节点），**putLock 保证的是 last 节点的线程安全，takeLock 保证的是 head 节点的线程安全**，两把锁保证了入队和出队没有竞争 
-  当节点总数等于 2 时（即一个 dummy 节点，一个正常节点）这时候，仍然是两把锁锁两个对象，不会竞争 
-  当节点总数等于 1 时（就一个 dummy 节点）这时 take 线程会被 notEmpty 条件阻塞，有竞争，会阻塞 

```java
// 用于 put(阻塞) offer(非阻塞)
private final ReentrantLock putLock = new ReentrantLock();
private final Condition notFull = putLock.newCondition();	// 阻塞等待不满，说明已经满了

// 用于 take(阻塞) poll(非阻塞)
private final ReentrantLock takeLock = new ReentrantLock();
private final Condition notEmpty = takeLock.newCondition();	// 阻塞等待不空，说明已经是空的
```

 入队出队：

-  put 操作： 

```java
public void put(E e) throws InterruptedException {
    // 空指针异常
    if (e == null) throw new NullPointerException();
    int c = -1;
    // 把待添加的元素封装为 node 节点
    Node\<E\> node = new Node\<E\>(e);
    // 获取全局生产锁
    final ReentrantLock putLock = this.putLock;
    // count 用来维护元素计数
    final AtomicInteger count = this.count;
    // 获取可打断锁，会抛出异常
    putLock.lockInterruptibly();
    try {
    	// 队列满了等待
        while (count.get() == capacity) {
            // 【等待队列不满时，就可以生产数据】，线程处于 Waiting
            notFull.await();
        }
        // 有空位, 入队且计数加一，尾插法
        enqueue(node);
        // 返回自增前的数字
        c = count.getAndIncrement();
        // put 完队列还有空位, 唤醒其他生产 put 线程，唤醒一个减少竞争
        if (c + 1 < capacity)
            notFull.signal();
    } finally {
        // 解锁
        putLock.unlock();
    }
    // c自增前是0，说明生产了一个元素，唤醒一个 take 线程
    if (c == 0)
        signalNotEmpty();
}
private void signalNotEmpty() {
    final ReentrantLock takeLock = this.takeLock;
    takeLock.lock();
    try {
        // 调用 notEmpty.signal()，而不是 notEmpty.signalAll() 是为了减少竞争，因为只剩下一个元素
        notEmpty.signal();
    } finally {
        takeLock.unlock();
    }
}
```

-  take 操作： 

```java
public E take() throws InterruptedException {
    E x;
    int c = -1;
    // 元素个数
    final AtomicInteger count = this.count;
    // 获取全局消费锁
    final ReentrantLock takeLock = this.takeLock;
    // 可打断锁
    takeLock.lockInterruptibly();
    try {
        // 没有元素可以出队
        while (count.get() == 0) {
            // 【阻塞等待队列不空，就可以消费数据】，线程处于 Waiting
            notEmpty.await();
        }
        // 出队，计数减一，FIFO，出队头节点
        x = dequeue();
        // 返回自减前的数字
        c = count.getAndDecrement();
        // 队列还有元素
        if (c > 1)
            // 唤醒一个消费take线程
            notEmpty.signal();
    } finally {
        takeLock.unlock();
    }
    // c 是消费前的数据，消费前满了，消费一个后还剩一个空位，唤醒生产线程
    if (c == capacity)
        // 调用的是 notFull.signal() 而不是 notFull.signalAll() 是为了减少竞争
        signalNotFull();
    return x;
}
```

#### 性能比较

主要列举 LinkedBlockingQueue 与 ArrayBlockingQueue 的性能比较：

- Linked 支持有界，Array 强制有界
- Linked 实现是链表，Array 实现是数组
- Linked 是懒惰的，而 Array 需要提前初始化 Node 数组
- Linked 每次入队会生成新 Node，而 Array 的 Node 是提前创建好的
- Linked 两把锁，Array 一把锁

### 同步队列

#### 成员属性

SynchronousQueue 是一个不存储元素的 BlockingQueue，**每一个生产者必须阻塞匹配到一个消费者**

成员变量：

-  运行当前程序的平台拥有 CPU 的数量： 

```java
static final int NCPUS = Runtime.getRuntime().availableProcessors()
```

-  指定超时时间后，当前线程最大自旋次数： 

```java
// 只有一个 CPU 时自旋次数为 0，所有程序都是串行执行，多核 CPU 时自旋 32 次是一个经验值
static final int maxTimedSpins = (NCPUS < 2) ? 0 : 32;
```

自旋的原因：线程挂起唤醒需要进行上下文切换，涉及到用户态和内核态的转变，是非常消耗资源的。自旋期间线程会一直检查自己的状态是否被匹配到，如果自旋期间被匹配到，那么直接就返回了，如果自旋次数达到某个指标后，还是会将当前线程挂起 

-  未指定超时时间，当前线程最大自旋次数： 

```java
static final int maxUntimedSpins = maxTimedSpins * 16;	// maxTimedSpins 的 16 倍
```

-  指定超时限制的阈值，小于该值的线程不会被挂起： 

```java
static final long spinForTimeoutThreshold = 1000L;	// 纳秒
```

超时时间设置的小于该值，就会被禁止挂起，阻塞再唤醒的成本太高，不如选择自旋空转 

-  转换器： 

```java
private transient volatile Transferer\<E\> transferer;
abstract static class Transferer\<E\> {
    /**
    * 参数一：可以为 null，null 时表示这个请求是一个 REQUEST 类型的请求，反之是一个 DATA 类型的请求
    * 参数二：如果为 true 表示指定了超时时间，如果为 false 表示不支持超时，会一直阻塞到匹配或者被打断
    * 参数三：超时时间限制，单位是纳秒
    
    * 返回值：返回值如果不为 null 表示匹配成功，DATA 类型的请求返回当前线程 put 的数据
    * 	     如果返回 null，表示请求超时或被中断
    */
    abstract E transfer(E e, boolean timed, long nanos);
}
```

-  构造方法： 

```java
public SynchronousQueue(boolean fair) {
    // fair 默认 false
    // 非公平模式实现的数据结构是栈，公平模式的数据结构是队列
    transferer = fair ? new TransferQueue\<E\>() : new TransferStack\<E\>();
}
```

-  成员方法： 

```java
public boolean offer(E e) {
    if (e == null) throw new NullPointerException();
    return transferer.transfer(e, true, 0) != null;
}
public E poll() {
    return transferer.transfer(null, true, 0);
}
```

#### 非公实现

TransferStack 是非公平的同步队列，因为所有的请求都被压入栈中，栈顶的元素会最先得到匹配，造成栈底的等待线程饥饿

TransferStack 类成员变量：

-  请求类型： 

```java
// 表示 Node 类型为请求类型
static final int REQUEST    = 0;
// 表示 Node类 型为数据类型
static final int DATA       = 1;
// 表示 Node 类型为匹配中类型
// 假设栈顶元素为 REQUEST-NODE，当前请求类型为 DATA，入栈会修改类型为 FULFILLING 【栈顶 & 栈顶之下的一个node】
// 假设栈顶元素为 DATA-NODE，当前请求类型为 REQUEST，入栈会修改类型为 FULFILLING 【栈顶 & 栈顶之下的一个node】
static final int FULFILLING = 2;
```

-  栈顶元素： 

```java
volatile SNode head;
```

 内部类 SNode：

-  成员变量： 

```java
static final class SNode {
    // 指向下一个栈帧
    volatile SNode next; 
    // 与当前 node 匹配的节点
    volatile SNode match;
    // 假设当前node对应的线程自旋期间未被匹配成功，那么node对应的线程需要挂起，
    // 挂起前 waiter 保存对应的线程引用，方便匹配成功后，被唤醒。
    volatile Thread waiter;
    
    // 数据域，不为空表示当前 Node 对应的请求类型为 DATA 类型，反之则表示 Node 为 REQUEST 类型
    Object item; 
    // 表示当前Node的模式 【DATA/REQUEST/FULFILLING】
    int mode;
}
```

-  构造方法： 

```java
SNode(Object item) {
    this.item = item;
}
```

-  设置方法：设置 Node 对象的 next 字段，此处**对 CAS 进行了优化**，提升了 CAS 的效率 

```java
boolean casNext(SNode cmp, SNode val) {
    //【优化：cmp == next】，可以提升一部分性能。 cmp == next 不相等，就没必要走 cas指令。
    return cmp == next && UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
}
```

-  匹配方法： 

```java
boolean tryMatch(SNode s) {
    // 当前 node 尚未与任何节点发生过匹配，CAS 设置 match 字段为 s 节点，表示当前 node 已经被匹配
    if (match == null && UNSAFE.compareAndSwapObject(this, matchOffset, null, s)) {
        // 当前 node 如果自旋结束，会 park 阻塞，阻塞前将 node 对应的 Thread 保留到 waiter 字段
        // 获取当前 node 对应的阻塞线程
        Thread w = waiter;
        // 条件成立说明 node 对应的 Thread 正在阻塞
        if (w != null) {
            waiter = null;
            // 使用 unpark 方式唤醒线程
            LockSupport.unpark(w);
        }
        return true;
    }
    // 匹配成功返回 true
    return match == s;
}
```

-  取消方法： 

```java
// 取消节点的方法
void tryCancel() {
    // match 字段指向自己，表示这个 node 是取消状态，取消状态的 node，最终会被强制移除出栈
    UNSAFE.compareAndSwapObject(this, matchOffset, null, this);
}

boolean isCancelled() {
    return match == this;
}
```

 TransferStack 类成员方法：

-  snode()：填充节点方法 

```java
static SNode snode(SNode s, Object e, SNode next, int mode) {
    // 引用指向空时，snode 方法会创建一个 SNode 对象 
    if (s == null) s = new SNode(e);
    // 填充数据
    s.mode = mode;
    s.next = next;
    return s;
}
```

-  transfer()：核心方法，请求匹配出栈，不匹配阻塞 

```java
E transfer(E e, boolean timed, long nanos) {
	// 包装当前线程的 node
    SNode s = null;
    // 根据元素判断当前的请求类型
    int mode = (e == null) ? REQUEST : DATA;
	// 自旋
    for (;;) {
        // 获取栈顶指针
        SNode h = head;
       // 【CASE1】：当前栈为空或者栈顶 node 模式与当前请求模式一致无法匹配，做入栈操作
        if (h == null || h.mode == mode) {
            // 当前请求是支持超时的，但是 nanos <= 0 说明这个请求不支持 “阻塞等待”
            if (timed && nanos <= 0) { 
                // 栈顶元素是取消状态
                if (h != null && h.isCancelled())
                    // 栈顶出栈，设置新的栈顶
                    casHead(h, h.next);
                else
                    // 表示【匹配失败】
                    return null;
            // 入栈
            } else if (casHead(h, s = snode(s, e, h, mode))) {
                // 等待被匹配的逻辑，正常情况返回匹配的节点；取消情况返回当前节点，就是 s
                SNode m = awaitFulfill(s, timed, nanos);
                // 说明当前 node 是【取消状态】
                if (m == s) { 
                    // 将取消节点出栈
                    clean(s);
                    return null;
                }
                // 执行到这说明【匹配成功】了
                // 栈顶有节点并且 匹配节点还未出栈，需要协助出栈
                if ((h = head) != null && h.next == s)
                    casHead(h, s.next);
                // 当前 node 模式为 REQUEST 类型，返回匹配节点的 m.item 数据域
                // 当前 node 模式为 DATA 类型：返回 node.item 数据域，当前请求提交的数据 e
                return (E) ((mode == REQUEST) ? m.item : s.item);
            }
        // 【CASE2】：逻辑到这说明请求模式不一致，如果栈顶不是 FULFILLING 说明没被其他节点匹配，【当前可以匹配】
        } else if (!isFulfilling(h.mode)) {
            // 头节点是取消节点，match 指向自己，协助出栈
            if (h.isCancelled())
                casHead(h, h.next);
            // 入栈当前请求的节点
            else if (casHead(h, s=snode(s, e, h, FULFILLING|mode))) {
                for (;;) { 
                    // m 是 s 的匹配的节点
                    SNode m = s.next;
                    // m 节点在 awaitFulfill 方法中被中断，clean 了自己
                    if (m == null) {
                        // 清空栈
                        casHead(s, null);
                        s = null;
                        // 返回到外层自旋中
                        break;
                    }
                    // 获取匹配节点的下一个节点
                    SNode mn = m.next;
                    // 尝试匹配，【匹配成功】，则将 fulfilling 和 m 一起出栈，并且唤醒被匹配的节点的线程
                    if (m.tryMatch(s)) {
                        casHead(s, mn);
                        return (E) ((mode == REQUEST) ? m.item : s.item);
                    } else
                        // 匹配失败，出栈 m
                        s.casNext(m, mn);
                }
            }
        // 【CASE3】：栈顶模式为 FULFILLING 模式，表示【栈顶和栈顶下面的节点正在发生匹配】，当前请求需要做协助工作
        } else {
            // h 表示的是 fulfilling 节点，m 表示 fulfilling 匹配的节点
            SNode m = h.next;
            if (m == null)
                // 清空栈
                casHead(h, null);
            else {
                SNode mn = m.next;
                // m 和 h 匹配，唤醒 m 中的线程
                if (m.tryMatch(h))
                    casHead(h, mn);
                else
                    h.casNext(m, mn);
            }
        }
    }
}
```

-  awaitFulfill()：阻塞当前线程等待被匹配，返回匹配的节点，或者被取消的节点 

```java
SNode awaitFulfill(SNode s, boolean timed, long nanos) {
    // 等待的截止时间
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    // 当前线程
    Thread w = Thread.currentThread();
    // 表示当前请求线程在下面的 for(;;) 自旋检查的次数
    int spins = (shouldSpin(s) ? (timed ? maxTimedSpins : maxUntimedSpins) : 0);
    // 自旋检查逻辑：是否匹配、是否超时、是否被中断
    for (;;) {
        // 当前线程收到中断信号，需要设置 node 状态为取消状态
        if (w.isInterrupted())
            s.tryCancel();
        // 获取与当前 s 匹配的节点
        SNode m = s.match;
        if (m != null)
            // 可能是正常的匹配的，也可能是取消的
            return m;
        // 执行了超时限制就判断是否超时
        if (timed) {
            nanos = deadline - System.nanoTime();
            // 【超时了，取消节点】
            if (nanos <= 0L) {
                s.tryCancel();
                continue;
            }
        }
        // 说明当前线程还可以进行自旋检查
        if (spins > 0)
            // 自旋一次 递减 1
            spins = shouldSpin(s) ? (spins - 1) : 0;
        // 说明没有自旋次数了
        else if (s.waiter == null)
            //【把当前 node 对应的 Thread 保存到 node.waiter 字段中，要阻塞了】
            s.waiter = w;
        // 没有超时限制直接阻塞
        else if (!timed)
            LockSupport.park(this);
        // nanos > 1000 纳秒的情况下，才允许挂起当前线程
        else if (nanos > spinForTimeoutThreshold)
            LockSupport.parkNanos(this, nanos);
    }
}
boolean shouldSpin(SNode s) {
    // 获取栈顶
    SNode h = head;
    // 条件一成立说明当前 s 就是栈顶，允许自旋检查
    // 条件二成立说明当前 s 节点自旋检查期间，又来了一个与当前 s 节点匹配的请求，双双出栈后条件会成立
    // 条件三成立前提当前 s 不是栈顶元素，并且当前栈顶正在匹配中，这种状态栈顶下面的元素，都允许自旋检查
    return (h == s || h == null || isFulfilling(h.mode));
}
```

-  clear()：指定节点出栈 

```java
void clean(SNode s) {
    // 清空数据域和关联线程
    s.item = null;
    s.waiter = null;
    
	// 获取取消节点的下一个节点
    SNode past = s.next;
    // 判断后继节点是不是取消节点，是就更新 past
    if (past != null && past.isCancelled())
        past = past.next;

    SNode p;
    // 从栈顶开始向下检查，【将栈顶开始向下的 取消状态 的节点全部清理出去】，直到碰到 past 或者不是取消状态为止
    while ((p = head) != null && p != past && p.isCancelled())
        // 修改的是内存地址对应的值，p 指向该内存地址所以数据一直在变化
        casHead(p, p.next);
	// 说明中间遇到了不是取消状态的节点，继续迭代下去
    while (p != null && p != past) {
        SNode n = p.next;
        if (n != null && n.isCancelled())
            p.casNext(n, n.next);
        else
            p = n;
    }
}
```

#### 公平实现

TransferQueue 是公平的同步队列，采用 FIFO 的队列实现，请求节点与队尾模式不同，需要与队头发生匹配

TransferQueue 类成员变量：

-  指向队列的 dummy 节点： 

```java
transient volatile QNode head;
```

-  指向队列的尾节点： 

```java
transient volatile QNode tail;
```

-  被清理节点的前驱节点： 

```java
transient volatile QNode cleanMe;
```

入队操作是两步完成的，第一步是 t.next = newNode，第二步是 tail = newNode，所以队尾节点出队，是一种非常特殊的情况 

TransferQueue 内部类：

-  QNode： 

```java
static final class QNode {
    // 指向当前节点的下一个节点
    volatile QNode next;
    // 数据域，Node 代表的是 DATA 类型 item 表示数据，否则 Node 代表的 REQUEST 类型，item == null
    volatile Object item;
    // 假设当前 node 对应的线程自旋期间未被匹配成功，那么 node 对应的线程需要挂起，
    // 挂起前 waiter 保存对应的线程引用，方便匹配成功后被唤醒。
    volatile Thread waiter;
    // true 当前 Node 是一个 DATA 类型，false 表示当前 Node 是一个 REQUEST 类型
    final boolean isData;

	// 构建方法
    QNode(Object item, boolean isData) {
        this.item = item;
        this.isData = isData;
    }

    // 尝试取消当前 node，取消状态的 node 的 item 域指向自己
    void tryCancel(Object cmp) {
        UNSAFE.compareAndSwapObject(this, itemOffset, cmp, this);
    }

    // 判断当前 node 是否为取消状态
    boolean isCancelled() {
        return item == this;
    }

    // 判断当前节点是否 “不在” 队列内，当 next 指向自己时，说明节点已经出队。
    boolean isOffList() {
        return next == this;
    }
}
```

 TransferQueue 类成员方法：

-  设置头尾节点： 

```java
void advanceHead(QNode h, QNode nh) {
    // 设置头指针指向新的节点，
    if (h == head && UNSAFE.compareAndSwapObject(this, headOffset, h, nh))
        // 老的头节点出队
        h.next = h;
}
void advanceTail(QNode t, QNode nt) {
    if (tail == t)
        // 更新队尾节点为新的队尾
        UNSAFE.compareAndSwapObject(this, tailOffset, t, nt);
}
```

-  transfer()：核心方法 

```java
E transfer(E e, boolean timed, long nanos) {
    // s 指向当前请求对应的 node
    QNode s = null;
    // 是否是 DATA 类型的请求
    boolean isData = (e != null);
	// 自旋
    for (;;) {
        QNode t = tail;
        QNode h = head;
        if (t == null || h == null)
            continue;
		// head 和 tail 同时指向 dummy 节点，说明是空队列
        // 队尾节点与当前请求类型是一致的情况，说明阻塞队列中都无法匹配，
        if (h == t || t.isData == isData) {
            // 获取队尾 t 的 next 节点
            QNode tn = t.next;
            // 多线程环境中其他线程可能修改尾节点
            if (t != tail)
                continue;
            // 已经有线程入队了，更新 tail
            if (tn != null) {
                advanceTail(t, tn);
                continue;
            }
            // 允许超时，超时时间小于 0，这种方法不支持阻塞等待
            if (timed && nanos <= 0)
                return null;
            // 创建 node 的逻辑
            if (s == null)
                s = new QNode(e, isData);
            // 将 node 添加到队尾
            if (!t.casNext(null, s))
                continue;
			// 更新队尾指针
            advanceTail(t, s);
            
            // 当前节点 等待匹配....
            Object x = awaitFulfill(s, e, timed, nanos);
            
            // 说明【当前 node 状态为 取消状态】，需要做出队逻辑
            if (x == s) {
                clean(t, s);
                return null;
            }
			// 说明当前 node 仍然在队列内，匹配成功，需要做出队逻辑
            if (!s.isOffList()) {
                // t 是当前 s 节点的前驱节点，判断 t 是不是头节点，是就更新 dummy 节点为 s 节点
                advanceHead(t, s);
                // s 节点已经出队，所以需要把它的 item 域设置为它自己，表示它是个取消状态
                if (x != null)
                    s.item = s;
                s.waiter = null;
            }
            return (x != null) ? (E)x : e;
		// 队尾节点与当前请求节点【互补匹配】
        } else {
            // h.next 节点，【请求节点与队尾模式不同，需要与队头发生匹配】，TransferQueue 是一个【公平模式】
            QNode m = h.next;
            // 并发导致其他线程修改了队尾节点，或者已经把 head.next 匹配走了
            if (t != tail || m == null || h != head)
                continue;
			// 获取匹配节点的数据域保存到 x
            Object x = m.item;
            // 判断是否匹配成功
            if (isData == (x != null) ||
                x == m ||
                !m.casItem(x, e)) {
                advanceHead(h, m);
                continue;
            }
			// 【匹配完成】，将头节点出队，让这个新的头结点成为 dummy 节点
            advanceHead(h, m);
            // 唤醒该匹配节点的线程
            LockSupport.unpark(m.waiter);
            return (x != null) ? (E)x : e;
        }
    }
}
```

-  awaitFulfill()：阻塞当前线程等待被匹配 

```java
Object awaitFulfill(QNode s, E e, boolean timed, long nanos) {
    // 表示等待截止时间
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    Thread w = Thread.currentThread();
    // 自选检查的次数
    int spins = ((head.next == s) ? (timed ? maxTimedSpins : maxUntimedSpins) : 0);
    for (;;) {
        // 被打断就取消节点
        if (w.isInterrupted())
            s.tryCancel(e);
        // 获取当前 Node 数据域
        Object x = s.item;
        
        // 当前请求为 DATA 模式时：e 请求带来的数据
        // s.item 修改为 this，说明当前 QNode 对应的线程 取消状态
        // s.item 修改为 null 表示已经有匹配节点了，并且匹配节点拿走了 item 数据

        // 当前请求为 REQUEST 模式时：e == null
        // s.item 修改为 this，说明当前 QNode 对应的线程 取消状态
        // s.item != null 且 item != this  表示当前 REQUEST 类型的 Node 已经匹配到 DATA 了 
        if (x != e)
            return x;
        // 超时检查
        if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                s.tryCancel(e);
                continue;
            }
        }
        // 自旋次数减一
        if (spins > 0)
            --spins;
        // 没有自旋次数了，把当前线程封装进去 waiter
        else if (s.waiter == null)
            s.waiter = w;
        // 阻塞
        else if (!timed)
            LockSupport.park(this);
        else if (nanos > spinForTimeoutThreshold)
            LockSupport.parkNanos(this, nanos);
    }
}
```

## 操作Pool

### 创建方式

#### Executor

存放线程的容器：

```java
private final HashSet\<Worker\> workers = new HashSet\<Worker\>();
```

构造方法：

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue\<Runnable\> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler)
```

参数介绍：

-  corePoolSize：核心线程数，定义了最小可以同时运行的线程数量 
-  maximumPoolSize：最大线程数，当队列中存放的任务达到队列容量时，当前可以同时运行的数量变为最大线程数，创建线程并立即执行最新的任务，与核心线程数之间的差值又叫救急线程数 
-  keepAliveTime：救急线程最大存活时间，当线程池中的线程数量大于 `corePoolSize` 的时候，如果这时没有新的任务提交，核心线程外的线程不会立即销毁，而是会等到 `keepAliveTime` 时间超过销毁 
-  unit：`keepAliveTime` 参数的时间单位 
-  workQueue：阻塞队列，存放被提交但尚未被执行的任务 
-  threadFactory：线程工厂，创建新线程时用到，可以为线程创建时起名字 
-  handler：拒绝策略，线程到达最大线程数仍有新任务时会执行拒绝策略
   RejectedExecutionHandler 下有 4 个实现类： 

-  AbortPolicy：让调用者抛出 RejectedExecutionException 异常，**默认策略**
-  CallerRunsPolicy：让调用者运行的调节机制，将某些任务回退到调用者，从而降低新任务的流量
-  DiscardPolicy：直接丢弃任务，不予任何处理也不抛出异常
-  DiscardOldestPolicy：放弃队列中最早的任务，把当前任务加入队列中尝试再次提交当前任务

补充：其他框架拒绝策略 

- Dubbo：在抛出 RejectedExecutionException 异常前记录日志，并 dump 线程栈信息，方便定位问题
- Netty：创建一个新线程来执行任务
- ActiveMQ：带超时等待（60s）尝试放入队列
- PinPoint：它使用了一个拒绝策略链，会逐一尝试策略链中每种拒绝策略

工作原理：

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-线程池工作原理.png)

1.  创建线程池，这时没有创建线程（**懒惰**），等待提交过来的任务请求，调用 execute 方法才会创建线程 
2.  当调用 execute() 方法添加一个请求任务时，线程池会做如下判断： 

- 如果正在运行的线程数量小于 corePoolSize，那么马上创建线程运行这个任务
- 如果正在运行的线程数量大于或等于 corePoolSize，那么将这个任务放入队列
- 如果这时队列满了且正在运行的线程数量还小于 maximumPoolSize，那么会创建非核心线程**立刻运行这个任务**，对于阻塞队列中的任务不公平。这是因为创建每个 Worker（线程）对象会绑定一个初始任务，启动 Worker 时会优先执行
- 如果队列满了且正在运行的线程数量大于或等于 maximumPoolSize，那么线程池会启动饱和**拒绝策略**来执行

1.  当一个线程完成任务时，会从队列中取下一个任务来执行 
2.  当一个线程空闲超过一定的时间（keepAliveTime）时，线程池会判断：如果当前运行的线程数大于 corePoolSize，那么这个线程就被停掉，所以线程池的所有任务完成后最终会收缩到 corePoolSize 大小 

图片来源：https://space.bilibili.com/457326371/

#### Executors

Executors 提供了四种线程池的创建：newCachedThreadPool、newFixedThreadPool、newSingleThreadExecutor、newScheduledThreadPool

-  newFixedThreadPool：创建一个拥有 n 个线程的线程池 

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads, 0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue\<Runnable\>());
}
```

- 核心线程数 == 最大线程数（没有救急线程被创建），因此也无需超时时间
- LinkedBlockingQueue 是一个单向链表实现的阻塞队列，默认大小为 `Integer.MAX_VALUE`，也就是无界队列，可以放任意数量的任务，在任务比较多的时候会导致 OOM（内存溢出）
- 适用于任务量已知，相对耗时的长期任务

- newCachedThreadPool：创建一个可扩容的线程池 

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
                                  new SynchronousQueue\<Runnable\>());
}
```

-  核心线程数是 0， 最大线程数是 29 个 1，全部都是救急线程（60s 后可以回收），可能会创建大量线程，从而导致 **OOM** 
-  SynchronousQueue 作为阻塞队列，没有容量，对于每一个 take 的线程会阻塞直到有一个 put 的线程放入元素为止（类似一手交钱、一手交货） 
-  适合任务数比较密集，但每个任务执行时间较短的情况 

-  newSingleThreadExecutor：创建一个只有 1 个线程的单线程池 

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue\<Runnable\>()));
}
```

- 保证所有任务按照**指定顺序执行**，线程数固定为 1，任务数多于 1 时会放入无界队列排队，任务执行完毕，这唯一的线程也不会被释放

对比：

-  创建一个单线程串行执行任务，如果任务执行失败而终止那么没有任何补救措施，线程池会新建一个线程，保证池的正常工作 
-  Executors.newSingleThreadExecutor() 线程个数始终为 1，不能修改。FinalizableDelegatedExecutorService 应用的是装饰器模式，只对外暴露了 ExecutorService 接口，因此不能调用 ThreadPoolExecutor 中特有的方法
   原因：父类不能直接调用子类中的方法，需要反射或者创建对象的方式，可以调用子类静态方法 
-  Executors.newFixedThreadPool(1) 初始时为 1，可以修改。对外暴露的是 ThreadPoolExecutor 对象，可以强转后调用 setCorePoolSize 等方法进行修改 

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-newSingleThreadExecutor.png)

#### 开发要求

阿里巴巴 Java 开发手册要求：

-  **线程资源必须通过线程池提供，不允许在应用中自行显式创建线程** 

-  使用线程池的好处是减少在创建和销毁线程上所消耗的时间以及系统资源的开销，解决资源不足的问题
-  如果不使用线程池，有可能造成系统创建大量同类线程而导致消耗完内存或者过度切换的问题

-  线程池不允许使用 Executors 去创建，而是通过 ThreadPoolExecutor 的方式，这样的处理方式更加明确线程池的运行规则，规避资源耗尽的风险
   Executors 返回的线程池对象弊端如下： 

-  FixedThreadPool 和 SingleThreadPool：请求队列长度为 Integer.MAX_VALUE，可能会堆积大量的请求，从而导致 OOM
-  CacheThreadPool 和 ScheduledThreadPool：允许创建线程数量为 Integer.MAX_VALUE，可能会创建大量的线程，导致 OOM

#### 线程核心数创建经验

创建多大容量的线程池合适？

-  一般来说池中**总线程数是核心池线程数量两倍**，确保当核心池有线程停止时，核心池外有线程进入核心池 
-  过小会导致程序不能充分地利用系统资源、容易导致饥饿 
-  过大会导致更多的线程上下文切换，占用更多内存
   上下文切换：当前任务在执行完 CPU 时间片切换到另一个任务之前会先保存自己的状态，以便下次再切换回这个任务时，可以再加载这个任务的状态，任务从保存到再加载的过程就是一次上下文切换 

核心线程数常用公式：

-  **CPU 密集型任务 (N+1)：** 这种任务消耗的是 CPU 资源，可以将核心线程数设置为 N (CPU 核心数) + 1，比 CPU 核心数多出来的一个线程是为了防止线程发生缺页中断，或者其它原因导致的任务暂停而带来的影响。一旦任务暂停，CPU 某个核心就会处于空闲状态，而在这种情况下多出来的一个线程就可以充分利用 CPU 的空闲时间
   CPU 密集型简单理解就是利用 CPU 计算能力的任务比如在内存中对大量数据进行分析 
-  **I/O 密集型任务：** 这种系统 CPU 处于阻塞状态，用大部分的时间来处理 I/O 交互，而线程在处理 I/O 的时间段内不会占用 CPU 来处理，这时就可以将 CPU 交出给其它线程使用，因此在 I/O 密集型任务的应用中，我们可以多配置一些线程，具体的计算方法是 2N 或 CPU 核数/ (1-阻塞系数)，阻塞系数在 0.8~0.9 之间
   IO 密集型就是涉及到网络读取，文件读取此类任务 ，特点是 CPU 计算耗费时间相比于等待 IO 操作完成的时间来说很少，大部分时间都花在了等待 IO 操作完成上 

```plain
线程数 = 核数 * 期望CPU利用率 * 总时间(CPU计算时间 + 等待时间) / CPU计算时间

例如4核CPU计算时间是50%，其他等待时间是50%，期望CPU被100%利用，使用公式
4 * 100% * 100% / 50% = 8
```

**可以使用命令来估算时间**

### 提交方法

ExecutorService 类 API：

| 方法                                                         | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| void execute(Runnable command)                               | 执行任务（Executor 类 API）                                  |
| Future\<?\> submit(Runnable task)                            | 提交任务 task()                                              |
| Future submit(Callable task)                                 | 提交任务 task，用返回值 Future 获得任务执行结果              |
| List\<Future\> invokeAll(Collection<? extends Callable\> tasks) | 提交 tasks 中所有任务                                        |
| List\<Future\> invokeAll(Collection<? extends Callable\> tasks, long timeout, TimeUnit unit) | 提交 tasks 中所有任务，超时时间针对所有task，超时会取消没有执行完的任务，并抛出超时异常 |
| T invokeAny(Collection<? extends Callable\> tasks)           | 提交 tasks 中所有任务，哪个任务先成功执行完毕，返回此任务执行结果，其它任务取消 |

execute 和 submit 都属于线程池的方法，对比：

-  execute 只能执行 Runnable 类型的任务，没有返回值； submit 既能提交 Runnable 类型任务也能提交 Callable 类型任务，底层是**封装成 FutureTask，然后调用 execute 执行** 
-  execute 会直接抛出任务执行时的异常，submit 会吞掉异常，可通过 Future 的 get 方法将任务执行时的异常重新抛出 

### 关闭方法

ExecutorService 类 API：

| 方法                                                  | 说明                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| void shutdown()                                       | 线程池状态变为 SHUTDOWN，等待任务执行完后关闭线程池，不会接收新任务，但已提交任务会执行完，而且也可以添加线程（不绑定任务） |
| List shutdownNow()                                    | 线程池状态变为 STOP，用 interrupt 中断正在执行的任务，直接关闭线程池，不会接收新任务，会将队列中的任务返回 |
| boolean isShutdown()                                  | 不在 RUNNING 状态的线程池，此执行者已被关闭，方法返回 true   |
| boolean isTerminated()                                | 线程池状态是否是 TERMINATED，如果所有任务在关闭后完成，返回 true |
| boolean awaitTermination(long timeout, TimeUnit unit) | 调用 shutdown 后，由于调用线程不会等待所有任务运行结束，如果它想在线程池 TERMINATED 后做些事情，可以利用此方法等待 |

### 处理异常

execute 会直接抛出任务执行时的异常，submit 会吞掉异常，有两种处理方法

方法 1：主动捉异常

```java
ExecutorService executorService = Executors.newFixedThreadPool(1);
pool.submit(() -> {
    try {
        System.out.println("task1");
        int i = 1 / 0;
    } catch (Exception e) {
        e.printStackTrace();
    }
});
```

方法 2：使用 Future 对象

```java
ExecutorService executorService = Executors.newFixedThreadPool(1);
Future\<?\> future = pool.submit(() -> {
    System.out.println("task1");
    int i = 1 / 0;
    return true;
});
System.out.println(future.get());
```

## 工作原理

### 状态信息

ThreadPoolExecutor 使用 int 的**高 3 位来表示线程池状态，低 29 位表示线程数量**。这些信息存储在一个原子变量 ctl 中，目的是将线程池状态与线程个数合二为一，这样就可以用一次 CAS 原子操作进行赋值

-  状态表示： 

```java
// 高3位：表示当前线程池运行状态，除去高3位之后的低位：表示当前线程池中所拥有的线程数量
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
// 表示在 ctl 中，低 COUNT_BITS 位，是用于存放当前线程数量的位
private static final int COUNT_BITS = Integer.SIZE - 3;
// 低 COUNT_BITS 位所能表达的最大数值，000 11111111111111111111 => 5亿多
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-%E7%BA%BF%E7%A8%8B%E6%B1%A0%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2%E5%9B%BE.png)  四种状态： 

```java
// 111 000000000000000000，转换成整数后其实就是一个【负数】
private static final int RUNNING    = -1 << COUNT_BITS;
// 000 000000000000000000
private static final int SHUTDOWN   =  0 << COUNT_BITS;
// 001 000000000000000000
private static final int STOP       =  1 << COUNT_BITS;
// 010 000000000000000000
private static final int TIDYING    =  2 << COUNT_BITS;
// 011 000000000000000000
private static final int TERMINATED =  3 << COUNT_BITS;
```

| 状态       | 高3位 | 接收新任务 | 处理阻塞任务队列 | 说明                                      |
| ---------- | ----- | ---------- | ---------------- | ----------------------------------------- |
| RUNNING    | 111   | Y          | Y                |                                           |
| SHUTDOWN   | 000   | N          | Y                | 不接收新任务，但处理阻塞队列剩余任务      |
| STOP       | 001   | N          | N                | 中断正在执行的任务，并抛弃阻塞队列任务    |
| TIDYING    | 010   | -          | -                | 任务全执行完毕，活动线程为 0 即将进入终结 |
| TERMINATED | 011   | -          | -                | 终止状态                                  |

-  获取当前线程池运行状态： 

```java
// ~CAPACITY = ~000 11111111111111111111 = 111 000000000000000000000（取反）
// c == ctl = 111 000000000000000000111
// 111 000000000000000000111
// 111 000000000000000000000
// 111 000000000000000000000	获取到了运行状态
private static int runStateOf(int c)     { return c & ~CAPACITY; }
```

-  获取当前线程池线程数量： 

```java
//        c = 111 000000000000000000111
// CAPACITY = 000 111111111111111111111
//            000 000000000000000000111 => 7
private static int workerCountOf(int c)  { return c & CAPACITY; }
```

-  重置当前线程池状态 ctl： 

```java
// rs 表示线程池状态，wc 表示当前线程池中 worker（线程）数量，相与以后就是合并后的状态
private static int ctlOf(int rs, int wc) { return rs | wc; }
```

-  比较当前线程池 ctl 所表示的状态： 

```java
// 比较当前线程池 ctl 所表示的状态，是否小于某个状态 s
// 状态对比：RUNNING < SHUTDOWN < STOP < TIDYING < TERMINATED
private static boolean runStateLessThan(int c, int s) { return c < s; }
// 比较当前线程池 ctl 所表示的状态，是否大于等于某个状态s
private static boolean runStateAtLeast(int c, int s) { return c >= s; }
// 小于 SHUTDOWN 的一定是 RUNNING，SHUTDOWN == 0
private static boolean isRunning(int c) { return c < SHUTDOWN; }
```

-  设置线程池 ctl： 

```java
// 使用 CAS 方式 让 ctl 值 +1 ，成功返回 true, 失败返回 false
private boolean compareAndIncrementWorkerCount(int expect) {
    return ctl.compareAndSet(expect, expect + 1);
}
// 使用 CAS 方式 让 ctl 值 -1 ，成功返回 true, 失败返回 false
private boolean compareAndDecrementWorkerCount(int expect) {
    return ctl.compareAndSet(expect, expect - 1);
}
// 将 ctl 值减一，do while 循环会一直重试，直到成功为止
private void decrementWorkerCount() {
    do {} while (!compareAndDecrementWorkerCount(ctl.get()));
}
```

### 成员属性

成员变量

-  **线程池中存放 Worker 的容器**：线程池没有初始化，直接往池中加线程即可 

```java
private final HashSet\<Worker\> workers = new HashSet\<Worker\>();
```

-  线程全局锁： 

```java
// 增加减少 worker 或者时修改线程池运行状态需要持有 mainLock
private final ReentrantLock mainLock = new ReentrantLock();
```

-  可重入锁的条件变量： 

```java
// 当外部线程调用 awaitTermination() 方法时，会等待当前线程池状态为 Termination 为止
private final Condition termination = mainLock.newCondition()
```

-  线程池相关参数： 

```java
private volatile int corePoolSize;				// 核心线程数量
private volatile int maximumPoolSize;			// 线程池最大线程数量
private volatile long keepAliveTime;			// 空闲线程存活时间
private volatile ThreadFactory threadFactory;	// 创建线程时使用的线程工厂，默认是 DefaultThreadFactory
private final BlockingQueue\<Runnable\> workQueue;// 【超过核心线程提交任务就放入 阻塞队列】
private volatile RejectedExecutionHandler handler;	// 拒绝策略，juc包提供了4中方式
private static final RejectedExecutionHandler defaultHandler = new AbortPolicy();// 默认策略
```

-  记录线程池相关属性的数值： 

```java
private int largestPoolSize;		// 记录线程池生命周期内线程数最大值
private long completedTaskCount;	// 记录线程池所完成任务总数，当某个 worker 退出时将完成的任务累加到该属性
```

-  控制**核心线程数量内的线程是否可以被回收**： 

```java
// false（默认）代表不可以，为 true 时核心线程空闲超过 keepAliveTime 也会被回收
// allowCoreThreadTimeOut(boolean value) 方法可以设置该值
private volatile boolean allowCoreThreadTimeOut;
```

 内部类：

-  Worker 类：**每个 Worker 对象会绑定一个初始任务**，启动 Worker 时优先执行，这也是造成线程池不公平的原因。Worker 继承自 AQS，本身具有锁的特性，采用独占锁模式，state = 0 表示未被占用，> 0 表示被占用，< 0 表示初始状态不能被抢锁 

```java
private final class Worker extends AbstractQueuedSynchronizer implements Runnable {
	final Thread thread;			// worker 内部封装的工作线程
    Runnable firstTask;				// worker 第一个执行的任务，普通的 Runnable 实现类或者是 FutureTask
    volatile long completedTasks;	// 记录当前 worker 所完成任务数量
    
    // 构造方法
    Worker(Runnable firstTask) {
        // 设置AQS独占模式为初始化中状态，这个状态不能被抢占锁
       	setState(-1);
        // firstTask不为空时，当worker启动后，内部线程会优先执行firstTask，执行完后会到queue中去获取下个任务
        this.firstTask = firstTask;
        // 使用线程工厂创建一个线程，并且【将当前worker指定为Runnable】，所以thread启动时会调用 worker.run()
        this.thread = getThreadFactory().newThread(this);
    }
    // 【不可重入锁】
    protected boolean tryAcquire(int unused) {
        if (compareAndSetState(0, 1)) {
            setExclusiveOwnerThread(Thread.currentThread());
            return true;
        }
        return false;
    }
}
public Thread newThread(Runnable r) {
    // 将当前 worker 指定为 thread 的执行方法，线程调用 start 会调用 r.run()
    Thread t = new Thread(group, r, namePrefix + threadNumber.getAndIncrement(), 0);
    if (t.isDaemon())
        t.setDaemon(false);
    if (t.getPriority() != Thread.NORM_PRIORITY)
        t.setPriority(Thread.NORM_PRIORITY);
    return t;
}
```

-  拒绝策略相关的内部类 

### 成员方法

#### 提交方法

-  AbstractExecutorService#submit()：提交任务，**把 Runnable 或 Callable 任务封装成 FutureTask 执行**，可以通过方法返回的任务对象，调用 get 阻塞获取任务执行的结果或者异常，源码分析在笔记的 Future 部分 

```java
public Future\<?\> submit(Runnable task) {
    // 空指针异常
    if (task == null) throw new NullPointerException();
    // 把 Runnable 封装成未来任务对象，执行结果就是 null，也可以通过参数指定 FutureTask#get 返回数据
    RunnableFuture\<Void\> ftask = newTaskFor(task, null);
    // 执行方法
    execute(ftask);
    return ftask;
}
public \<T\> Future\<T\> submit(Callable\<T\> task) {
    if (task == null) throw new NullPointerException();
    // 把 Callable 封装成未来任务对象
    RunnableFuture\<T\> ftask = newTaskFor(task);
    // 执行方法
    execute(ftask);	
    // 返回未来任务对象，用来获取返回值
    return ftask;
}
protected \<T\> RunnableFuture\<T\> newTaskFor(Runnable runnable, T value) {
    // Runnable 封装成 FutureTask，【指定返回值】
    return new FutureTask\<T\>(runnable, value);
}
protected \<T\> RunnableFuture\<T\> newTaskFor(Callable\<T\> callable) {
    // Callable 直接封装成 FutureTask
    return new FutureTask\<T\>(callable);
}
```

-  execute()：执行任务，**但是没有返回值，没办法获取任务执行结果**，出现异常会直接抛出任务执行时的异常。根据线程池中的线程数，选择添加任务时的处理方式 

```java
// command 可以是普通的 Runnable 实现类，也可以是 FutureTask，不能是 Callable
public void execute(Runnable command) {
    // 非空判断
    if (command == null)
        throw new NullPointerException();
  	// 获取 ctl 最新值赋值给 c，ctl 高 3 位表示线程池状态，低位表示当前线程池线程数量。
    int c = ctl.get();
    // 【1】当前线程数量小于核心线程数，此次提交任务直接创建一个新的 worker，线程池中多了一个新的线程
    if (workerCountOf(c) < corePoolSize) {
        // addWorker 为创建线程的过程，会创建 worker 对象并且将 command 作为 firstTask，优先执行
        if (addWorker(command, true))
            return;
        
        // 执行到这条语句，说明 addWorker 一定是失败的，存在并发现象或者线程池状态被改变，重新获取状态
        // SHUTDOWN 状态下也有可能创建成功，前提 firstTask == null 而且当前 queue 不为空（特殊情况）
        c = ctl.get();
    }
    // 【2】执行到这说明当前线程数量已经达到核心线程数量 或者 addWorker 失败
    // 	判断当前线程池是否处于running状态，成立就尝试将 task 放入到 workQueue 中
    if (isRunning(c) && workQueue.offer(command)) {
        int recheck = ctl.get();
        // 条件一成立说明线程池状态被外部线程给修改了，可能是执行了 shutdown() 方法，该状态不能接收新提交的任务
        // 所以要把刚提交的任务删除，删除成功说明提交之后线程池中的线程还未消费（处理）该任务
        if (!isRunning(recheck) && remove(command))
            // 任务出队成功，走拒绝策略
            reject(command);
        // 执行到这说明线程池是 running 状态，获取线程池中的线程数量，判断是否是 0
        // 【担保机制】，保证线程池在 running 状态下，最起码得有一个线程在工作
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 【3】offer失败说明queue满了
    // 如果线程数量尚未达到 maximumPoolSize，会创建非核心 worker 线程直接执行 command，【这也是不公平的原因】
    // 如果当前线程数量达到 maximumPoolSiz，这里 addWorker 也会失败，走拒绝策略
    else if (!addWorker(command, false))
        reject(command);
}
```

#### 添加线程

-  prestartAllCoreThreads()：**提前预热**，创建所有的核心线程 

```java
public int prestartAllCoreThreads() {
    int n = 0;
    while (addWorker(null, true))
        ++n;
    return n;
}
```

-  addWorker()：**添加线程到线程池**，返回 true 表示创建 Worker 成功，且线程启动。首先判断线程池是否允许添加线程，允许就让线程数量 + 1，然后去创建 Worker 加入线程池
   注意：SHUTDOWN 状态也能添加线程，但是要求新加的 Woker 没有 firstTask，而且当前 queue 不为空，所以创建一个线程来帮助线程池执行队列中的任务 

```java
// core == true 表示采用核心线程数量限制，false 表示采用 maximumPoolSize
private boolean addWorker(Runnable firstTask, boolean core) {
    // 自旋【判断当前线程池状态是否允许创建线程】，允许就设置线程数量 + 1
    retry:
    for (;;) {
        // 获取 ctl 的值
        int c = ctl.get();
        // 获取当前线程池运行状态
        int rs = runStateOf(c);	
        
        // 判断当前线程池状态【是否允许添加线程】
        
        // 当前线程池是 SHUTDOWN 状态，但是队列里面还有任务尚未处理完，需要处理完 queue 中的任务
        // 【不允许再提交新的 task，所以 firstTask 为空，但是可以继续添加 worker】
        if (rs >= SHUTDOWN && !(rs == SHUTDOWN && firstTask == null && !workQueue.isEmpty()))
            return false;
        for (;;) {
            // 获取线程池中线程数量
            int wc = workerCountOf(c);
            // 条件一一般不成立，CAPACITY是5亿多，根据 core 判断使用哪个大小限制线程数量，超过了返回 false
            if (wc >= CAPACITY || wc >= (core ? corePoolSize : maximumPoolSize))
                return false;
            // 记录线程数量已经加 1，类比于申请到了一块令牌，条件失败说明其他线程修改了数量
            if (compareAndIncrementWorkerCount(c))
                // 申请成功，跳出了 retry 这个 for 自旋
                break retry;
            // CAS 失败，没有成功的申请到令牌
            c = ctl.get();
            // 判断当前线程池状态是否发生过变化，被其他线程修改了，可能其他线程调用了 shutdown() 方法
            if (runStateOf(c) != rs)
                // 返回外层循环检查是否能创建线程，在 if 语句中返回 false
                continue retry;
           
        }
    }
    
    //【令牌申请成功，开始创建线程】
    
	// 运行标记，表示创建的 worker 是否已经启动，false未启动  true启动
    boolean workerStarted = false;
    // 添加标记，表示创建的 worker 是否添加到池子中了，默认false未添加，true是添加。
    boolean workerAdded = false;
    Worker w = null;
    try {
        // 【创建 Worker，底层通过线程工厂 newThread 方法创建执行线程，指定了首先执行的任务】
        w = new Worker(firstTask);
        // 将新创建的 worker 节点中的线程赋值给 t
        final Thread t = w.thread;
        // 这里的判断为了防止 程序员自定义的 ThreadFactory 实现类有 bug，创造不出线程
        if (t != null) {
            final ReentrantLock mainLock = this.mainLock;
            // 加互斥锁，要添加 worker 了
            mainLock.lock();
            try {
                // 获取最新线程池运行状态保存到 rs
                int rs = runStateOf(ctl.get());
				// 判断线程池是否为RUNNING状态，不是再【判断当前是否为SHUTDOWN状态且firstTask为空，特殊情况】
                if (rs < SHUTDOWN || (rs == SHUTDOWN && firstTask == null)) {
                    // 当线程start后，线程isAlive会返回true，这里还没开始启动线程，如果被启动了就需要报错
                    if (t.isAlive())
                        throw new IllegalThreadStateException();
                    
                    //【将新建的 Worker 添加到线程池中】
                    workers.add(w);
                    int s = workers.size();
					// 当前池中的线程数量是一个新高，更新 largestPoolSize
                    if (s > largestPoolSize)
                        largestPoolSize = s;
                    // 添加标记置为 true
                    workerAdded = true;
                }
            } finally {
                // 解锁啊
                mainLock.unlock();
            }
            // 添加成功就【启动线程执行任务】
            if (workerAdded) {
                // Thread 类中持有 Runnable 任务对象，调用的是 Runnable 的 run ，也就是 FutureTask
                t.start();
                // 运行标记置为 true
                workerStarted = true;
            }
        }
    } finally {
        // 如果启动线程失败，做清理工作
        if (! workerStarted)
            addWorkerFailed(w);
    }
    // 返回新创建的线程是否启动
    return workerStarted;
}
```

-  addWorkerFailed()：清理任务 

```java
private void addWorkerFailed(Worker w) {
    final ReentrantLock mainLock = this.mainLock;
    // 持有线程池全局锁，因为操作的是线程池相关的东西
    mainLock.lock();
    try {
        //条件成立需要将 worker 在 workers 中清理出去。
        if (w != null)
            workers.remove(w);
        // 将线程池计数 -1，相当于归还令牌。
        decrementWorkerCount();
        // 尝试停止线程池
        tryTerminate();
    } finally {
        //释放线程池全局锁。
        mainLock.unlock();
    }
}
```

#### 运行方法

-  Worker#run：Worker 实现了 Runnable 接口，当线程启动时，会调用 Worker 的 run() 方法 

```java
public void run() {
    // ThreadPoolExecutor#runWorker()
    runWorker(this);
}
```

-  runWorker()：线程启动就要**执行任务**，会一直 while 循环获取任务并执行 

```java
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();	
    // 获取 worker 的 firstTask
    Runnable task = w.firstTask;
    // 引用置空，【防止复用该线程时重复执行该任务】
    w.firstTask = null;
    // 初始化 worker 时设置 state = -1，表示不允许抢占锁
    // 这里需要设置 state = 0 和 exclusiveOwnerThread = null，开始独占模式抢锁
    w.unlock();
    // true 表示发生异常退出，false 表示正常退出。
    boolean completedAbruptly = true;
    try {
        // firstTask 不是 null 就直接运行，否则去 queue 中获取任务
        // 【getTask 如果是阻塞获取任务，会一直阻塞在take方法，直到获取任务，不会走返回null的逻辑】
        while (task != null || (task = getTask()) != null) {
            // worker 加锁，shutdown 时会判断当前 worker 状态，【根据独占锁状态判断是否空闲】
            w.lock();
            
			// 说明线程池状态大于 STOP，目前处于 STOP/TIDYING/TERMINATION，此时给线程一个中断信号
            if ((runStateAtLeast(ctl.get(), STOP) ||
                 // 说明线程处于 RUNNING 或者 SHUTDOWN 状态，清除打断标记
                 (Thread.interrupted() && runStateAtLeast(ctl.get(), STOP))) && !wt.isInterrupted())
                // 中断线程，设置线程的中断标志位为 true
                wt.interrupt();
            try {
                // 钩子方法，【任务执行的前置处理】
                beforeExecute(wt, task);
                Throwable thrown = null;
                try {
                    // 【执行任务】
                    task.run();
                } catch (Exception x) {
                 	//.....
                } finally {
                    // 钩子方法，【任务执行的后置处理】
                    afterExecute(task, thrown);
                }
            } finally {
                task = null;		// 将局部变量task置为null，代表任务执行完成
                w.completedTasks++;	// 更新worker完成任务数量
                w.unlock();			// 解锁
            }
        }
        // getTask()方法返回null时会走到这里，表示queue为空并且线程空闲超过保活时间，【当前线程执行退出逻辑】
        completedAbruptly = false;	
    } finally {
        // 正常退出 completedAbruptly = false
       	// 异常退出 completedAbruptly = true，【从 task.run() 内部抛出异常】时，跳到这一行
        processWorkerExit(w, completedAbruptly);
    }
}
```

-  unlock()：重置锁 

```java
public void unlock() { release(1); }
// 外部不会直接调用这个方法 这个方法是 AQS 内调用的，外部调用 unlock 时触发此方法
protected boolean tryRelease(int unused) {
    setExclusiveOwnerThread(null);		// 设置持有者为 null
    setState(0);						// 设置 state = 0
    return true;
}
```

-  getTask()：获取任务，线程空闲时间超过 keepAliveTime 就会被回收，判断的依据是**当前线程阻塞获取任务超过保活时间**，方法返回 null 就代表当前线程要被回收了，返回到 runWorker 执行线程退出逻辑。线程池具有担保机制，对于 RUNNING 状态下的超时回收，要保证线程池中最少有一个线程运行，或者任务阻塞队列已经是空 

```java
private Runnable getTask() {
    // 超时标记，表示当前线程获取任务是否超时，true 表示已超时
    boolean timedOut = false; 
    for (;;) {
        int c = ctl.get();
        // 获取线程池当前运行状态
        int rs = runStateOf(c);
		
        // 【tryTerminate】打断线程后执行到这，此时线程池状态为STOP或者线程池状态为SHUTDOWN并且队列已经是空
        // 所以下面的 if 条件一定是成立的，可以直接返回 null，线程就应该退出了
        if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
            // 使用 CAS 自旋的方式让 ctl 值 -1
            decrementWorkerCount();
            return null;
        }
        
		// 获取线程池中的线程数量
        int wc = workerCountOf(c);

        // 线程没有明确的区分谁是核心或者非核心线程，是根据当前池中的线程数量判断
        
        // timed = false 表示当前这个线程 获取task时不支持超时机制的，当前线程会使用 queue.take() 阻塞获取
        // timed = true 表示当前这个线程 获取task时支持超时机制，使用 queue.poll(xxx,xxx) 超时获取
        // 条件一代表允许回收核心线程，那就无所谓了，全部线程都执行超时回收
        // 条件二成立说明线程数量大于核心线程数，当前线程认为是非核心线程，有保活时间，去超时获取任务
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        
		// 如果线程数量是否超过最大线程数，直接回收
        // 如果当前线程【允许超时回收并且已经超时了】，就应该被回收了，由于【担保机制】还要做判断：
        // 	  wc > 1 说明线程池还用其他线程，当前线程可以直接回收
        //    workQueue.isEmpty() 前置条件是 wc = 1，【如果当前任务队列也是空了，最后一个线程就可以退出】
        if ((wc > maximumPoolSize || (timed && timedOut)) && (wc > 1 || workQueue.isEmpty())) {
            // 使用 CAS 机制将 ctl 值 -1 ,减 1 成功的线程，返回 null，代表可以退出
            if (compareAndDecrementWorkerCount(c))
                return null;
            continue;
        }

        try {
            // 根据当前线程是否需要超时回收，【选择从队列获取任务的方法】是超时获取或者阻塞获取
            Runnable r = timed ?
                workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) : workQueue.take();
            // 获取到任务返回任务，【阻塞获取会阻塞到获取任务为止】，不会返回 null
            if (r != null)
                return r;
            // 获取任务为 null 说明超时了，将超时标记设置为 true，下次自旋时返 null
            timedOut = true;
        } catch (InterruptedException retry) {
            // 阻塞线程被打断后超时标记置为 false，【说明被打断不算超时】，要继续获取，直到超时或者获取到任务
            // 如果线程池 SHUTDOWN 状态下的打断，会在循环获取任务前判断，返回 null
            timedOut = false;
        }
    }
}
```

-  processWorkerExit()：**线程退出线程池**，也有担保机制，保证队列中的任务被执行 

```java
// 正常退出 completedAbruptly = false，异常退出为 true
private void processWorkerExit(Worker w, boolean completedAbruptly) {
    // 条件成立代表当前 worker 是发生异常退出的，task 任务执行过程中向上抛出异常了
    if (completedAbruptly) 
        // 从异常时到这里 ctl 一直没有 -1，需要在这里 -1
        decrementWorkerCount();

    final ReentrantLock mainLock = this.mainLock;
    // 加锁
    mainLock.lock();
    try {
        // 将当前 worker 完成的 task 数量，汇总到线程池的 completedTaskCount
        completedTaskCount += w.completedTasks;
		// 将 worker 从线程池中移除
        workers.remove(w);
    } finally {
        mainLock.unlock();	// 解锁
    }
	// 尝试停止线程池，唤醒下一个线程
    tryTerminate();

    int c = ctl.get();
    // 线程池不是停止状态就应该有线程运行【担保机制】
    if (runStateLessThan(c, STOP)) {
        // 正常退出的逻辑，是对空闲线程回收，不是执行出错
        if (!completedAbruptly) {
            // 根据是否回收核心线程确定【线程池中的线程数量最小值】
            int min = allowCoreThreadTimeOut ? 0 : corePoolSize;
            // 最小值为 0，但是线程队列不为空，需要一个线程来完成任务担保机制
            if (min == 0 && !workQueue.isEmpty())
                min = 1;
            // 线程池中的线程数量大于最小值可以直接返回
            if (workerCountOf(c) >= min)
                return;
        }
        // 执行 task 时发生异常，有个线程因为异常终止了，需要添加
        // 或者线程池中的数量小于最小值，这里要创建一个新 worker 加进线程池
        addWorker(null, false);
    }
}
```

#### 停止方法

-  shutdown()：停止线程池 

```java
public void shutdown() {
    final ReentrantLock mainLock = this.mainLock;
    // 获取线程池全局锁
    mainLock.lock();
    try {
        checkShutdownAccess();
        // 设置线程池状态为 SHUTDOWN，如果线程池状态大于 SHUTDOWN，就不会设置直接返回
        advanceRunState(SHUTDOWN);
        // 中断空闲线程
        interruptIdleWorkers();
        // 空方法，子类可以扩展
        onShutdown(); 
    } finally {
        // 释放线程池全局锁
        mainLock.unlock();
    }
    tryTerminate();
}
```

-  interruptIdleWorkers()：shutdown 方法会**中断所有空闲线程**，根据是否可以获取 AQS 独占锁判断是否处于工作状态。线程之所以空闲是因为阻塞队列没有任务，不会中断正在运行的线程，所以 shutdown 方法会让所有的任务执行完毕 

```java
// onlyOne == true 说明只中断一个线程 ，false 则中断所有线程
private void interruptIdleWorkers(boolean onlyOne) {
    final ReentrantLock mainLock = this.mainLock;
    / /持有全局锁
    mainLock.lock();
    try {
        // 遍历所有 worker
        for (Worker w : workers) {
            // 获取当前 worker 的线程
            Thread t = w.thread;
            // 条件一成立：说明当前迭代的这个线程尚未中断
            // 条件二成立：说明【当前worker处于空闲状态】，阻塞在poll或者take，因为worker执行task时是要加锁的
            //           每个worker有一个独占锁，w.tryLock()尝试加锁，加锁成功返回 true
            if (!t.isInterrupted() && w.tryLock()) {
                try {
                    // 中断线程，处于 queue 阻塞的线程会被唤醒，进入下一次自旋，返回 null，执行退出相逻辑
                    t.interrupt();
                } catch (SecurityException ignore) {
                } finally {
                    // 释放worker的独占锁
                    w.unlock();
                }
            }
            // false，代表中断所有的线程
            if (onlyOne)
                break;
        }

    } finally {
        // 释放全局锁
        mainLock.unlock();
    }
}
```

-  shutdownNow()：直接关闭线程池，不会等待任务执行完成 

```java
public List\<Runnable\> shutdownNow() {
    // 返回值引用
    List\<Runnable\> tasks;
    final ReentrantLock mainLock = this.mainLock;
    // 获取线程池全局锁
    mainLock.lock();
    try {
        checkShutdownAccess();
        // 设置线程池状态为STOP
        advanceRunState(STOP);
        // 中断线程池中【所有线程】
        interruptWorkers();
        // 从阻塞队列中导出未处理的task
        tasks = drainQueue();
    } finally {
        mainLock.unlock();
    }

    tryTerminate();
    // 返回当前任务队列中 未处理的任务。
    return tasks;
}
```

-  tryTerminate()：设置为 TERMINATED 状态 if either (SHUTDOWN and pool and queue empty) or (STOP and pool empty) 

```java
final void tryTerminate() {
    for (;;) {
        // 获取 ctl 的值
        int c = ctl.get();
        // 线程池正常，或者有其他线程执行了状态转换的方法，当前线程直接返回
        if (isRunning(c) || runStateAtLeast(c, TIDYING) ||
            // 线程池是 SHUTDOWN 并且任务队列不是空，需要去处理队列中的任务
            (runStateOf(c) == SHUTDOWN && ! workQueue.isEmpty()))
            return;
        
        // 执行到这里说明线程池状态为 STOP 或者线程池状态为 SHUTDOWN 并且队列已经是空
        // 判断线程池中线程的数量
        if (workerCountOf(c) != 0) {
            // 【中断一个空闲线程】，在 queue.take() | queue.poll() 阻塞空闲
            // 唤醒后的线程会在getTask()方法返回null，
            // 执行 processWorkerExit 退出逻辑时会再次调用 tryTerminate() 唤醒下一个空闲线程
            interruptIdleWorkers(ONLY_ONE);
            return;
        }
		// 池中的线程数量为 0 来到这里
        final ReentrantLock mainLock = this.mainLock;
        // 加全局锁
        mainLock.lock();
        try {
            // 设置线程池状态为 TIDYING 状态，线程数量为 0
            if (ctl.compareAndSet(c, ctlOf(TIDYING, 0))) {
                try {
                    // 结束线程池
                    terminated();
                } finally {
                    // 设置线程池状态为TERMINATED状态。
                    ctl.set(ctlOf(TERMINATED, 0));
                    // 【唤醒所有调用 awaitTermination() 方法的线程】
                    termination.signalAll();
                }
                return;
            }
        } finally {
			// 释放线程池全局锁
            mainLock.unlock();
        }
    }
}
```

### Future

#### 线程使用

FutureTask 未来任务对象，继承 Runnable、Future 接口，用于包装 Callable 对象，实现任务的提交

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    FutureTask\<String\> task = new FutureTask\<\>(new Callable\<String\>() {
        @Override
        public String call() throws Exception {
            return "Hello World";
        }
    });
    new Thread(task).start();	//启动线程
    String msg = task.get();	//获取返回任务数据
    System.out.println(msg);
}
```

构造方法：

```java
public FutureTask(Callable\<V\> callable){
	this.callable = callable;	// 属性注入
    this.state = NEW; 			// 任务状态设置为 new
}
public FutureTask(Runnable runnable, V result) {
    // 适配器模式
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;       
}
public static \<T\> Callable\<T\> callable(Runnable task, T result) {
    if (task == null) throw new NullPointerException();
    // 使用装饰者模式将 runnable 转换成 callable 接口，外部线程通过 get 获取
    // 当前任务执行结果时，结果可能为 null 也可能为传进来的值，【传进来什么返回什么】
    return new RunnableAdapter\<T\>(task, result);
}
static final class RunnableAdapter\<T\> implements Callable\<T\> {
    final Runnable task;
    final T result;
    // 构造方法
    RunnableAdapter(Runnable task, T result) {
        this.task = task;
        this.result = result;
    }
    public T call() {
        // 实则调用 Runnable#run 方法
        task.run();
        // 返回值为构造 FutureTask 对象时传入的返回值或者是 null
        return result;
    }
}
```

#### 成员属性

FutureTask 类的成员属性：

-  任务状态： 

```java
// 表示当前task状态
private volatile int state;
// 当前任务尚未执行
private static final int NEW          = 0;
// 当前任务正在结束，尚未完全结束，一种临界状态
private static final int COMPLETING   = 1;
// 当前任务正常结束
private static final int NORMAL       = 2;
// 当前任务执行过程中发生了异常，内部封装的 callable.run() 向上抛出异常了
private static final int EXCEPTIONAL  = 3;
// 当前任务被取消
private static final int CANCELLED    = 4;
// 当前任务中断中
private static final int INTERRUPTING = 5;
// 当前任务已中断
private static final int INTERRUPTED  = 6;
```

-  任务对象： 

```java
private Callable\<V\> callable;	// Runnable 使用装饰者模式伪装成 Callable
```

-  **存储任务执行的结果**，这是 run 方法返回值是 void 也可以获取到执行结果的原因： 

```java
// 正常情况下：任务正常执行结束，outcome 保存执行结果，callable 返回值
// 非正常情况：callable 向上抛出异常，outcome 保存异常
private Object outcome;
```

-  执行当前任务的线程对象： 

```java
private volatile Thread runner;	// 当前任务被线程执行期间，保存当前执行任务的线程对象引用
```

-  **线程阻塞队列的头节点**： 

```java
// 会有很多线程去 get 当前任务的结果，这里使用了一种数据结构头插头取（类似栈）的一个队列来保存所有的 get 线程
private volatile WaitNode waiters;
```

-  内部类： 

```java
static final class WaitNode {
    // 单向链表
    volatile Thread thread;
    volatile WaitNode next;
    WaitNode() { thread = Thread.currentThread(); }
}
```

#### 成员方法

FutureTask 类的成员方法：

-  **FutureTask#run**：任务执行入口 

```java
public void run() {
    //条件一：成立说明当前 task 已经被执行过了或者被 cancel 了，非 NEW 状态的任务，线程就不需要处理了
    //条件二：线程是 NEW 状态，尝试设置当前任务对象的线程是当前线程，设置失败说明其他线程抢占了该任务，直接返回
    if (state != NEW ||
        !UNSAFE.compareAndSwapObject(this, runnerOffset, null, Thread.currentThread()))
        return;
    try {
        // 执行到这里，当前 task 一定是 NEW 状态，而且【当前线程也抢占 task 成功】
        Callable\<V\> c = callable;
        // 判断任务是否为空，防止空指针异常；判断 state 状态，防止外部线程在此期间 cancel 掉当前任务
        // 【因为 task 的执行者已经设置为当前线程，所以这里是线程安全的】
        if (c != null && state == NEW) {
            V result;
            // true 表示 callable.run 代码块执行成功 未抛出异常
            // false 表示 callable.run 代码块执行失败 抛出异常
            boolean ran;
            try {
				// 【调用自定义的方法，执行结果赋值给 result】
                result = c.call();
                // 没有出现异常
                ran = true;
            } catch (Throwable ex) {
                // 出现异常，返回值置空，ran 置为 false
                result = null;
                ran = false;
                // 设置返回的异常
                setException(ex);
            }
            // 代码块执行正常
            if (ran)
                // 设置返回的结果
                set(result);
        }
    } finally {
        // 任务执行完成，取消线程的引用，help GC
        runner = null;
        int s = state;
        // 判断任务是不是被中断
        if (s >= INTERRUPTING)
            // 执行中断处理方法
            handlePossibleCancellationInterrupt(s);
    }
}
```

FutureTask#set：设置正常返回值，首先将任务状态设置为 COMPLETING 状态代表完成中，逻辑执行完设置为 NORMAL 状态代表任务正常执行完成，最后唤醒 get() 阻塞线程 

```java
protected void set(V v) {
    // CAS 方式设置当前任务状态为完成中，设置失败说明其他线程取消了该任务
    if (UNSAFE.compareAndSwapInt(this, stateOffset, NEW, COMPLETING)) {
        // 【将结果赋值给 outcome】
        outcome = v;
        // 将当前任务状态修改为 NORMAL 正常结束状态。
        UNSAFE.putOrderedInt(this, stateOffset, NORMAL);
        finishCompletion();
    }
}
```

FutureTask#setException：设置异常返回值 

```java
protected void setException(Throwable t) {
    if (UNSAFE.compareAndSwapInt(this, stateOffset, NEW, COMPLETING)) {
        // 赋值给返回结果，用来向上层抛出来的异常
        outcome = t;
        // 将当前任务的状态 修改为 EXCEPTIONAL
        UNSAFE.putOrderedInt(this, stateOffset, EXCEPTIONAL);
        finishCompletion();
    }
}
```

FutureTask#finishCompletion：**唤醒 get() 阻塞线程** 

```java
private void finishCompletion() {
    // 遍历所有的等待的节点，q 指向头节点
    for (WaitNode q; (q = waiters) != null;) {
        // 使用cas设置 waiters 为 null，防止外部线程使用cancel取消当前任务，触发finishCompletion方法重复执行
        if (UNSAFE.compareAndSwapObject(this, waitersOffset, q, null)) {
            // 自旋
            for (;;) {
                // 获取当前 WaitNode 节点封装的 thread
                Thread t = q.thread;
                // 当前线程不为 null，唤醒当前 get() 等待获取数据的线程
                if (t != null) {
                    q.thread = null;
                    LockSupport.unpark(t);
                }
                // 获取当前节点的下一个节点
                WaitNode next = q.next;
                // 当前节点是最后一个节点了
                if (next == null)
                    break;
                // 断开链表
                q.next = null; // help gc
                q = next;
            }
            break;
        }
    }
    done();
    callable = null;	// help GC
}
```

FutureTask#handlePossibleCancellationInterrupt：任务中断处理 

```java
private void handlePossibleCancellationInterrupt(int s) {
    if (s == INTERRUPTING)
        // 中断状态中
        while (state == INTERRUPTING)
            // 等待中断完成
            Thread.yield();
}
```

-  **FutureTask#get**：获取任务执行的返回值，执行 run 和 get 的不是同一个线程，一般有多个线程 get，只有一个线程 run 

```java
public V get() throws InterruptedException, ExecutionException {
    // 获取当前任务状态
    int s = state;
    // 条件成立说明任务还没执行完成
    if (s <= COMPLETING)
        // 返回 task 当前状态，可能当前线程在里面已经睡了一会
        s = awaitDone(false, 0L);
    return report(s);
}
```

FutureTask#awaitDone：**get 线程封装成 WaitNode 对象进入阻塞队列阻塞等待** 

```java
private int awaitDone(boolean timed, long nanos) throws InterruptedException {
    // 0 不带超时
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    // 引用当前线程，封装成 WaitNode 对象
    WaitNode q = null;
    // 表示当前线程 waitNode 对象，是否进入阻塞队列
    boolean queued = false;
    // 【三次自旋开始休眠】
    for (;;) {
        // 判断当前 get() 线程是否被打断，打断返回 true，清除打断标记
        if (Thread.interrupted()) {
            // 当前线程对应的等待 node 出队，
            removeWaiter(q);
            throw new InterruptedException();
        }
		// 获取任务状态
        int s = state;
        // 条件成立说明当前任务执行完成已经有结果了
        if (s > COMPLETING) {
            // 条件成立说明已经为当前线程创建了 WaitNode，置空 help GC
            if (q != null)
                q.thread = null;
            // 返回当前的状态
            return s;
        }
        // 条件成立说明当前任务接近完成状态，这里让当前线程释放一下 cpu ，等待进行下一次抢占 cpu
        else if (s == COMPLETING) 
            Thread.yield();
        // 【第一次自旋】，当前线程还未创建 WaitNode 对象，此时为当前线程创建 WaitNode对象
        else if (q == null)
            q = new WaitNode();
        // 【第二次自旋】，当前线程已经创建 WaitNode 对象了，但是node对象还未入队
        else if (!queued)
            // waiters 指向队首，让当前 WaitNode 成为新的队首，【头插法】，失败说明其他线程修改了新的队首
            queued = UNSAFE.compareAndSwapObject(this, waitersOffset, q.next = waiters, q);
        // 【第三次自旋】，会到这里，或者 else 内
        else if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                removeWaiter(q);
                return state;
            }
            // 阻塞指定的时间
            LockSupport.parkNanos(this, nanos);
        }
        // 条件成立：说明需要阻塞
        else
            // 【当前 get 操作的线程被 park 阻塞】，除非有其它线程将唤醒或者将当前线程中断
            LockSupport.park(this);
    }
}
```

FutureTask#report：封装运行结果，可以获取 run() 方法中设置的成员变量 outcome，**这是 run 方法的返回值是 void 也可以获取到任务执行的结果的原因** 

```java
private V report(int s) throws ExecutionException {
    // 获取执行结果，是在一个 futuretask 对象中的属性，可以直接获取
    Object x = outcome;
    // 当前任务状态正常结束
    if (s == NORMAL)
        return (V)x;	// 直接返回 callable 的逻辑结果
    // 当前任务被取消或者中断
    if (s >= CANCELLED)
        throw new CancellationException();		// 抛出异常
    // 执行到这里说明自定义的 callable 中的方法有异常，使用 outcome 上层抛出异常
    throw new ExecutionException((Throwable)x);	
}
```

-  FutureTask#cancel：任务取消，打断正在执行该任务的线程 

```java
public boolean cancel(boolean mayInterruptIfRunning) {
    // 条件一：表示当前任务处于运行中或者处于线程池任务队列中
    // 条件二：表示修改状态，成功可以去执行下面逻辑，否则返回 false 表示 cancel 失败
    if (!(state == NEW &&
          UNSAFE.compareAndSwapInt(this, stateOffset, NEW,
                                   mayInterruptIfRunning ? INTERRUPTING : CANCELLED)))
        return false;
    try {
        // 如果任务已经被执行，是否允许打断
        if (mayInterruptIfRunning) {
            try {
                // 获取执行当前 FutureTask 的线程
                Thread t = runner;
                if (t != null)
                    // 打断执行的线程
                    t.interrupt();
            } finally {
                // 设置任务状态为【中断完成】
                UNSAFE.putOrderedInt(this, stateOffset, INTERRUPTED);
            }
        }
    } finally {
        // 唤醒所有 get() 阻塞的线程
        finishCompletion();
    }
    return true;
}
```

## 任务调度

### Timer

Timer 实现定时功能，Timer 的优点在于简单易用，但由于所有任务都是由同一个线程来调度，因此所有任务都是串行执行的，同一时间只能有一个任务在执行，前一个任务的延迟或异常都将会影响到之后的任务

```java
private static void method1() {
    Timer timer = new Timer();
    TimerTask task1 = new TimerTask() {
        @Override
        public void run() {
            System.out.println("task 1");
            //int i = 1 / 0;//任务一的出错会导致任务二无法执行
            Thread.sleep(2000);
        }
    };
    TimerTask task2 = new TimerTask() {
        @Override
        public void run() {
            System.out.println("task 2");
        }
    };
    // 使用 timer 添加两个任务，希望它们都在 1s 后执行
	// 但由于 timer 内只有一个线程来顺序执行队列中的任务，因此任务1的延时，影响了任务2的执行
    timer.schedule(task1, 1000);//17:45:56 c.ThreadPool [Timer-0] - task 1
    timer.schedule(task2, 1000);//17:45:58 c.ThreadPool [Timer-0] - task 2
}
```

### Scheduled

任务调度线程池 ScheduledThreadPoolExecutor 继承 ThreadPoolExecutor：

- 使用内部类 ScheduledFutureTask 封装任务
- 使用内部类 DelayedWorkQueue 作为线程池队列
- 重写 onShutdown 方法去处理 shutdown 后的任务
- 提供 decorateTask 方法作为 ScheduledFutureTask 的修饰方法，以便开发者进行扩展

构造方法：`Executors.newScheduledThreadPool(int corePoolSize)`

```java
public ScheduledThreadPoolExecutor(int corePoolSize) {
    // 最大线程数固定为 Integer.MAX_VALUE，保活时间 keepAliveTime 固定为 0
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          // 阻塞队列是 DelayedWorkQueue
          new DelayedWorkQueue());
}
```

常用 API：

- `ScheduledFuture\<?\> schedule(Runnable/Callable\<V\>, long delay, TimeUnit u)`：延迟执行任务
- `ScheduledFuture\<?\> scheduleAtFixedRate(Runnable/Callable\<V\>, long initialDelay, long period, TimeUnit unit)`：定时执行周期任务，不考虑执行的耗时，参数为初始延迟时间、间隔时间、单位
- `ScheduledFuture\<?\> scheduleWithFixedDelay(Runnable/Callable\<V\>, long initialDelay, long delay, TimeUnit unit)`：定时执行周期任务，考虑执行的耗时，参数为初始延迟时间、间隔时间、单位

基本使用：

-  延迟任务，但是出现异常并不会在控制台打印，也不会影响其他线程的执行 

```java
public static void main(String[] args){
    // 线程池大小为1时也是串行执行
    ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);
    // 添加两个任务，都在 1s 后同时执行
    executor.schedule(() -> {
    	System.out.println("任务1，执行时间：" + new Date());
        //int i = 1 / 0;
    	try { Thread.sleep(2000); } catch (InterruptedException e) { }
    }, 1000, TimeUnit.MILLISECONDS);
    
    executor.schedule(() -> {
    	System.out.println("任务2，执行时间：" + new Date());
    }, 1000, TimeUnit.MILLISECONDS);
}
```

-  定时任务 scheduleAtFixedRate：**一次任务的启动到下一次任务的启动**之间只要大于等于间隔时间，抢占到 CPU 就会立即执行 

```java
public static void main(String[] args) {
    ScheduledExecutorService pool = Executors.newScheduledThreadPool(1);
    System.out.println("start..." + new Date());
    
    pool.scheduleAtFixedRate(() -> {
        System.out.println("running..." + new Date());
        Thread.sleep(2000);
    }, 1, 1, TimeUnit.SECONDS);
}

/*start...Sat Apr 24 18:08:12 CST 2021
running...Sat Apr 24 18:08:13 CST 2021
running...Sat Apr 24 18:08:15 CST 2021
running...Sat Apr 24 18:08:17 CST 2021
```

-  定时任务 scheduleWithFixedDelay：**一次任务的结束到下一次任务的启动之间**等于间隔时间，抢占到 CPU 就会立即执行，这个方法才是真正的设置两个任务之间的间隔 

```java
public static void main(String[] args){
    ScheduledExecutorService pool = Executors.newScheduledThreadPool(3);
    System.out.println("start..." + new Date());
    
    pool.scheduleWithFixedDelay(() -> {
        System.out.println("running..." + new Date());
        Thread.sleep(2000);
    }, 1, 1, TimeUnit.SECONDS);
}
/*start...Sat Apr 24 18:11:41 CST 2021
running...Sat Apr 24 18:11:42 CST 2021
running...Sat Apr 24 18:11:45 CST 2021
running...Sat Apr 24 18:11:48 CST 2021
```

### 成员属性

#### 成员变量

-  shutdown 后是否继续执行周期任务： 

```java
private volatile boolean continueExistingPeriodicTasksAfterShutdown;
```

-  shutdown 后是否继续执行延迟任务： 

```java
private volatile boolean executeExistingDelayedTasksAfterShutdown = true;
```

-  取消方法是否将该任务从队列中移除： 

```java
// 默认 false，不移除，等到线程拿到任务之后抛弃
private volatile boolean removeOnCancel = false;
```

-  任务的序列号，可以用来比较优先级： 

```java
private static final AtomicLong sequencer = new AtomicLong();
```

#### 延迟任务

ScheduledFutureTask 继承 FutureTask，实现 RunnableScheduledFuture 接口，具有延迟执行的特点，覆盖 FutureTask 的 run 方法来实现对**延时执行、周期执行**的支持。对于延时任务调用 FutureTask#run，而对于周期性任务则调用 FutureTask#runAndReset 并且在成功之后根据 fixed-delay/fixed-rate 模式来设置下次执行时间并重新将任务塞到工作队列

在调度线程池中无论是 runnable 还是 callable，无论是否需要延迟和定时，所有的任务都会被封装成 ScheduledFutureTask

成员变量：

-  任务序列号： 

```java
private final long sequenceNumber;
```

-  执行时间： 

```java
private long time;			// 任务可以被执行的时间，交付时间，以纳秒表示
private final long period;	// 0 表示非周期任务，正数表示 fixed-rate 模式的周期，负数表示 fixed-delay 模式
```

fixed-rate：两次开始启动的间隔，fixed-delay：一次执行结束到下一次开始启动 

-  实际的任务对象： 

```java
RunnableScheduledFuture\<V\> outerTask = this;
```

-  任务在队列数组中的索引下标： 

```java
// DelayedWorkQueue 底层使用的数据结构是最小堆，记录当前任务在堆中的索引，-1 代表删除
int heapIndex;
```

 成员方法：

-  构造方法： 

```java
ScheduledFutureTask(Runnable r, V result, long ns, long period) {
    super(r, result);
    // 任务的触发时间
    this.time = ns;
    // 任务的周期，多长时间执行一次
    this.period = period;
    // 任务的序号
    this.sequenceNumber = sequencer.getAndIncrement();
}
```

-  compareTo()：ScheduledFutureTask 根据执行时间 time 正序排列，如果执行时间相同，在按照序列号 sequenceNumber 正序排列，任务需要放入 DelayedWorkQueue，延迟队列中使用该方法按照从小到大进行排序 

```java
public int compareTo(Delayed other) {
    if (other == this) // compare zero if same object
        return 0;
    if (other instanceof ScheduledFutureTask) {
        // 类型强转
        ScheduledFutureTask\<?\> x = (ScheduledFutureTask\<?\>)other;
        // 比较者 - 被比较者的执行时间
        long diff = time - x.time;
        // 比较者先执行
        if (diff < 0)
            return -1;
        // 被比较者先执行
        else if (diff > 0)
            return 1;
        // 比较者的序列号小
        else if (sequenceNumber < x.sequenceNumber)
            return -1;
        else
            return 1;
    }
    // 不是 ScheduledFutureTask 类型时，根据延迟时间排序
    long diff = getDelay(NANOSECONDS) - other.getDelay(NANOSECONDS);
    return (diff < 0) ? -1 : (diff > 0) ? 1 : 0;
}
```

-  run()：执行任务，非周期任务直接完成直接结束，**周期任务执行完后会设置下一次的执行时间，重新放入线程池的阻塞队列**，如果线程池中的线程数量少于核心线程，就会添加 Worker 开启新线程 

```java
public void run() {
    // 是否周期性，就是判断 period 是否为 0
    boolean periodic = isPeriodic();
    // 根据是否是周期任务检查当前状态能否执行任务，不能执行就取消任务
    if (!canRunInCurrentRunState(periodic))
        cancel(false);
    // 非周期任务，直接调用 FutureTask#run 执行
    else if (!periodic)
        ScheduledFutureTask.super.run();
    // 周期任务的执行，返回 true 表示执行成功
    else if (ScheduledFutureTask.super.runAndReset()) {
        // 设置周期任务的下一次执行时间
        setNextRunTime();
        // 任务的下一次执行安排，如果当前线程池状态可以执行周期任务，加入队列，并开启新线程
        reExecutePeriodic(outerTask);
    }
}
```

周期任务正常完成后**任务的状态不会变化**，依旧是 NEW，不会设置 outcome 属性。但是如果本次任务执行出现异常，会进入 setException 方法将任务状态置为异常，把异常保存在 outcome 中，方法返回 false，后续的该任务将不会再周期的执行 

```java
protected boolean runAndReset() {
    // 任务不是新建的状态了，或者被别的线程执行了，直接返回 false
    if (state != NEW ||
        !UNSAFE.compareAndSwapObject(this, runnerOffset, null, Thread.currentThread()))
        return false;
    boolean ran = false;
    int s = state;
    try {
        Callable\<V\> c = callable;
        if (c != null && s == NEW) {
            try {
                // 执行方法，没有返回值
                c.call();
                ran = true;
            } catch (Throwable ex) {
                // 出现异常，把任务设置为异常状态，唤醒所有的 get 阻塞线程
                setException(ex);
            }
        }
    } finally {
		// 执行完成把执行线程引用置为 null
        runner = null;
        s = state;
        // 如果线程被中断进行中断处理
        if (s >= INTERRUPTING)
            handlePossibleCancellationInterrupt(s);
    }
    // 如果正常执行，返回 true，并且任务状态没有被取消
    return ran && s == NEW;
}
// 任务下一次的触发时间
private void setNextRunTime() {
    long p = period;
    if (p > 0)
        // fixed-rate 模式，【时间设置为上一次执行任务的时间 + p】，两次任务执行的时间差
        time += p;
    else
        // fixed-delay 模式，下一次执行时间是【当前这次任务结束的时间（就是现在） + delay 值】
        time = triggerTime(-p);
}
```

-  reExecutePeriodic()**：准备任务的下一次执行，重新放入阻塞任务队列** 

```java
// ScheduledThreadPoolExecutor#reExecutePeriodic
void reExecutePeriodic(RunnableScheduledFuture\<?\> task) {
    if (canRunInCurrentRunState(true)) {
        // 【放入任务队列】
        super.getQueue().add(task);
        // 如果提交完任务之后，线程池状态变为了 shutdown 状态，需要再次检查是否可以执行，
        // 如果不能执行且任务还在队列中未被取走，则取消任务
        if (!canRunInCurrentRunState(true) && remove(task))
            task.cancel(false);
        else
            // 当前线程池状态可以执行周期任务，加入队列，并【根据线程数量是否大于核心线程数确定是否开启新线程】
            ensurePrestart();
    }
}
```

-  cancel()：取消任务 

```java
public boolean cancel(boolean mayInterruptIfRunning) {
    // 调用父类 FutureTask#cancel 来取消任务
    boolean cancelled = super.cancel(mayInterruptIfRunning);
    // removeOnCancel 用于控制任务取消后是否应该从阻塞队列中移除
    if (cancelled && removeOnCancel && heapIndex >= 0)
        // 从等待队列中删除该任务，并调用 tryTerminate() 判断是否需要停止线程池
        remove(this);
    return cancelled;
}
```

#### 延迟队列

DelayedWorkQueue 是支持延时获取元素的阻塞队列，内部采用优先队列 PriorityQueue（小根堆、满二叉树）存储元素

其他阻塞队列存储节点的数据结构大都是链表，**延迟队列是数组**，所以延迟队列出队头元素后需要**让其他元素（尾）替换到头节点**，防止空指针异常

成员变量：

-  容量： 

```java
private static final int INITIAL_CAPACITY = 16;			// 初始容量
private int size = 0;									// 节点数量
private RunnableScheduledFuture\<?\>[] queue = 
    new RunnableScheduledFuture\<?\>[INITIAL_CAPACITY];	// 存放节点
```

-  锁： 

```java
private final ReentrantLock lock = new ReentrantLock();	// 控制并发
private final Condition available = lock.newCondition();// 条件队列
```

-  阻塞等待头节点的线程：线程池内的某个线程去 take() 获取任务时，如果延迟队列顶层节点不为 null（队列内有任务），但是节点任务还不到触发时间，线程就去检查**队列的 leader字段**是否被占用 

-  如果未被占用，则当前线程占用该字段，然后当前线程到 available 条件队列指定超时时间 `堆顶任务.time - now()` 挂起
-  如果被占用，当前线程直接到 available 条件队列不指定超时时间的挂起

```java
// leader 在 available 条件队列内是首元素，它超时之后会醒过来，然后再次将堆顶元素获取走，获取走之后，take()结束之前，会调用是 available.signal() 唤醒下一个条件队列内的等待者，然后释放 lock，下一个等待者被唤醒后去到 AQS 队列，做 acquireQueue(node) 逻辑
private Thread leader = null;
```

成员方法

-  offer()：插入节点 

```java
public boolean offer(Runnable x) {
    // 判空
    if (x == null)
        throw new NullPointerException();
    RunnableScheduledFuture\<?\> e = (RunnableScheduledFuture\<?\>)x;
    // 队列锁，增加删除数据时都要加锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        int i = size;
        // 队列数量大于存放节点的数组长度，需要扩容
        if (i >= queue.length)
            // 扩容为原来长度的 1.5 倍
            grow();
        size = i + 1;
        // 当前是第一个要插入的节点
        if (i == 0) {
            queue[0] = e;
            // 修改 ScheduledFutureTask 的 heapIndex 属性，表示该对象在队列里的下标
            setIndex(e, 0);
        } else {
            // 向上调整元素的位置，并更新 heapIndex 
            siftUp(i, e);
        }
        // 情况1：当前任务是第一个加入到 queue 内的任务，所以在当前任务加入到 queue 之前，take() 线程会直接
        //		到 available 队列不设置超时的挂起，并不会去占用 leader 字段，这时需会唤醒一个线程 让它去消费
       	// 情况2：当前任务【优先级最高】，原堆顶任务可能还未到触发时间，leader 线程设置超时的在 available 挂起
        //		原先的 leader 等待的是原先的头节点，所以 leader 已经无效，需要将 leader 线程唤醒，
        //		唤醒之后它会检查堆顶，如果堆顶任务可以被消费，则直接获取走，否则继续成为 leader 等待新堆顶任务
        if (queue[0] == e) {
            // 将 leader 设置为 null
            leader = null;
            // 直接随便唤醒等待头结点的阻塞线程
            available.signal();
        }
    } finally {
        lock.unlock();
    }
    return true;
}
// 插入新节点后对堆进行调整，进行节点上移，保持其特性【节点的值小于子节点的值】，小顶堆
private void siftUp(int k, RunnableScheduledFuture\<?\> key) {
    while (k > 0) {
        // 父节点，就是堆排序
        int parent = (k - 1) >>> 1;
        RunnableScheduledFuture\<?\> e = queue[parent];
        // key 和父节点比，如果大于父节点可以直接返回，否则就继续上浮
        if (key.compareTo(e) >= 0)
            break;
        queue[k] = e;
        setIndex(e, k);
        k = parent;
    }
    queue[k] = key;
    setIndex(key, k);
}
```

-  poll()：非阻塞获取头结点，**获取执行时间最近并且可以执行的** 

```java
// 非阻塞获取
public RunnableScheduledFuture\<?\> poll() {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 获取队头节点，因为是小顶堆
        RunnableScheduledFuture\<?\> first = queue[0];
        // 头结点为空或者的延迟时间没到返回 null
        if (first == null || first.getDelay(NANOSECONDS) > 0)
            return null;
        else
            // 头结点达到延迟时间，【尾节点成为替代节点下移调整堆结构】，返回头结点
            return finishPoll(first);
    } finally {
        lock.unlock();
    }
}
private RunnableScheduledFuture\<?\> finishPoll(RunnableScheduledFuture\<?\> f) {
    // 获取尾索引
    int s = --size;
    // 获取尾节点
    RunnableScheduledFuture\<?\> x = queue[s];
    // 将堆结构最后一个节点占用的 slot 设置为 null，因为该节点要尝试升级成堆顶，会根据特性下调
    queue[s] = null;
    // s == 0 说明 当前堆结构只有堆顶一个节点，此时不需要做任何的事情
    if (s != 0)
        // 从索引处 0 开始向下调整
        siftDown(0, x);
    // 出队的元素索引设置为 -1
    setIndex(f, -1);
    return f;
}
```

-  take()：阻塞获取头节点，读取当前堆中最小的也就是触发时间最近的任务 

```java
public RunnableScheduledFuture\<?\> take() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    // 保证线程安全
    lock.lockInterruptibly();
    try {
        for (;;) {
            // 头节点
            RunnableScheduledFuture\<?\> first = queue[0];
            if (first == null)
                // 等待队列不空，直至有任务通过 offer 入队并唤醒
                available.await();
            else {
                // 获取头节点的延迟时间是否到时
                long delay = first.getDelay(NANOSECONDS);
                if (delay <= 0)
                    // 到达触发时间，获取头节点并调整堆，重新选择延迟时间最小的节点放入头部
                    return finishPoll(first);
                
                // 逻辑到这说明头节点的延迟时间还没到
                first = null;
                // 说明有 leader 线程在等待获取头节点，当前线程直接去阻塞等待
                if (leader != null)
                    available.await();
                else {
                    // 没有 leader 线程，【当前线程作为leader线程，并设置头结点的延迟时间作为阻塞时间】
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        // 在条件队列 available 使用带超时的挂起（堆顶任务.time - now() 纳秒值..）
                        available.awaitNanos(delay);
                        // 到达阻塞时间时，当前线程会从这里醒来来
                    } finally {
                        // t堆顶更新，leader 置为 null，offer 方法释放锁后，
                        // 有其它线程通过 take/poll 拿到锁,读到 leader == null，然后将自身更新为leader。
                        if (leader == thisThread)
                            // leader 置为 null 用以接下来判断是否需要唤醒后继线程
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // 没有 leader 线程，头结点不为 null，唤醒阻塞获取头节点的线程，
        // 【如果没有这一步，就会出现有了需要执行的任务，但是没有线程去执行】
        if (leader == null && queue[0] != null)
            available.signal();
        lock.unlock();
    }
}
```

-  remove()：删除节点，堆移除一个元素的时间复杂度是 O(log n)，**延迟任务维护了 heapIndex**，直接访问的时间复杂度是 O(1)，从而可以更快的移除元素，任务在队列中被取消后会进入该逻辑 

```java
public boolean remove(Object x) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 查找对象在队列数组中的下标
        int i = indexOf(x);
        // 节点不存在，返回 false
        if (i < 0)
            return false;
		// 修改元素的 heapIndex，-1 代表删除
        setIndex(queue[i], -1);
        // 尾索引是长度-1
        int s = --size;
        // 尾节点作为替代节点
        RunnableScheduledFuture\<?\> replacement = queue[s];
        queue[s] = null;
        // s == i 说明头节点就是尾节点，队列空了
        if (s != i) {
            // 向下调整
            siftDown(i, replacement);
            // 说明没发生调整
            if (queue[i] == replacement)
                // 上移和下移不可能同时发生，替代节点大于子节点时下移，否则上移
                siftUp(i, replacement);
        }
        return true;
    } finally {
        lock.unlock();
    }
}
```

### 成员方法

#### 提交任务

-  schedule()：延迟执行方法，并指定执行的时间，默认是当前时间 

```java
public void execute(Runnable command) {
    // 以零延时任务的形式实现
    schedule(command, 0, NANOSECONDS);
}
public ScheduledFuture\<?\> schedule(Runnable command, long delay, TimeUnit unit) {
    // 判空
    if (command == null || unit == null) throw new NullPointerException();
    // 没有做任何操作，直接将 task 返回，该方法主要目的是用于子类扩展，并且【根据延迟时间设置任务触发的时间点】
    RunnableScheduledFuture\<?\> t = decorateTask(command, new ScheduledFutureTask\<Void\>(
        											command, null, triggerTime(delay, unit)));
    // 延迟执行
    delayedExecute(t);
    return t;
}
// 返回【当前时间 + 延迟时间】，就是触发当前任务执行的时间
private long triggerTime(long delay, TimeUnit unit) {
    // 设置触发的时间
    return triggerTime(unit.toNanos((delay < 0) ? 0 : delay));
}
long triggerTime(long delay) {
    // 如果 delay < Long.Max_VALUE/2，则下次执行时间为当前时间 +delay
    // 否则为了避免队列中出现由于溢出导致的排序紊乱,需要调用overflowFree来修正一下delay
    return now() + ((delay < (Long.MAX_VALUE >> 1)) ? delay : overflowFree(delay));
}
```

overflowFree 的原因：如果某个任务的 delay 为负数，说明当前可以执行（其实早该执行了）。阻塞队列中维护任务顺序是基于 compareTo 比较的，比较两个任务的顺序会用 time 相减。那么可能出现一个 delay 为正数减去另一个为负数的 delay，结果上溢为负数，则会导致 compareTo 产生错误的结果 

```java
private long overflowFree(long delay) {
    Delayed head = (Delayed) super.getQueue().peek();
    if (head != null) {
        long headDelay = head.getDelay(NANOSECONDS);
        // 判断一下队首的delay是不是负数，如果是正数就不用管，怎么减都不会溢出
        // 否则拿当前 delay 减去队首的 delay 来比较看，如果不出现上溢，排序不会乱
		// 不然就把当前 delay 值给调整为 Long.MAX_VALUE + 队首 delay
        if (headDelay < 0 && (delay - headDelay < 0))
            delay = Long.MAX_VALUE + headDelay;
    }
    return delay;
}
```

-  scheduleAtFixedRate()：定时执行，一次任务的启动到下一次任务的启动的间隔 

```java
public ScheduledFuture\<?\> scheduleAtFixedRate(Runnable command, long initialDelay, long period,
                                              TimeUnit unit) {
    if (command == null || unit == null)
        throw new NullPointerException();
    if (period <= 0)
        throw new IllegalArgumentException();
    // 任务封装，【指定初始的延迟时间和周期时间】
    ScheduledFutureTask\<Void\> sft =new ScheduledFutureTask\<Void\>(command, null,
                                      triggerTime(initialDelay, unit), unit.toNanos(period));
    // 默认返回本身
    RunnableScheduledFuture\<Void\> t = decorateTask(command, sft);
    sft.outerTask = t;
    // 开始执行这个任务
    delayedExecute(t);
    return t;
}
```

-  scheduleWithFixedDelay()：定时执行，一次任务的结束到下一次任务的启动的间隔 

```java
public ScheduledFuture\<?\> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay,
                                                 TimeUnit unit) {
    if (command == null || unit == null) 
        throw new NullPointerException();
    if (delay <= 0)
        throw new IllegalArgumentException();
    // 任务封装，【指定初始的延迟时间和周期时间】，周期时间为 - 表示是 fixed-delay 模式
    ScheduledFutureTask\<Void\> sft = new ScheduledFutureTask\<Void\>(command, null,
                                      triggerTime(initialDelay, unit), unit.toNanos(-delay));
    RunnableScheduledFuture\<Void\> t = decorateTask(command, sft);
    sft.outerTask = t;
    delayedExecute(t);
    return t;
}
```

#### 运行任务

-  delayedExecute()：**校验线程池状态**，延迟或周期性任务的主要执行方法 

```java
private void delayedExecute(RunnableScheduledFuture\<?\> task) {
    // 线程池是 SHUTDOWN 状态，需要执行拒绝策略
    if (isShutdown())
        reject(task);
    else {
        // 把当前任务放入阻塞队列，因为需要【获取执行时间最近的】，当前任务需要比较
        super.getQueue().add(task);
        // 线程池状态为 SHUTDOWN 并且不允许执行任务了，就从队列删除该任务，并设置任务的状态为取消状态
        if (isShutdown() && !canRunInCurrentRunState(task.isPeriodic()) && remove(task))
            task.cancel(false);
        else
            // 可以执行
            ensurePrestart();
    }
}
```

-  ensurePrestart()：**开启线程执行任务** 

```java
// ThreadPoolExecutor#ensurePrestart
void ensurePrestart() {
    int wc = workerCountOf(ctl.get());
    // worker数目小于corePoolSize，则添加一个worker。
    if (wc < corePoolSize)
        // 第二个参数 true 表示采用核心线程数量限制，false 表示采用 maximumPoolSize
        addWorker(null, true);
    // corePoolSize = 0的情况，至少开启一个线程，【担保机制】
    else if (wc == 0)
        addWorker(null, false);
}
```

 

-  canRunInCurrentRunState()：任务运行时都会被调用以校验当前状态是否可以运行任务 

```java
boolean canRunInCurrentRunState(boolean periodic) {
    // 根据是否是周期任务判断，在线程池 shutdown 后是否继续执行该任务，默认非周期任务是继续执行的
    return isRunningOrShutdown(periodic ? continueExistingPeriodicTasksAfterShutdown :
                               executeExistingDelayedTasksAfterShutdown);
}
```

-  onShutdown()：删除并取消工作队列中的不需要再执行的任务 

```java
void onShutdown() {
    BlockingQueue\<Runnable\> q = super.getQueue();
    // shutdown 后是否仍然执行延时任务
    boolean keepDelayed = getExecuteExistingDelayedTasksAfterShutdownPolicy();
    // shutdown 后是否仍然执行周期任务
    boolean keepPeriodic = getContinueExistingPeriodicTasksAfterShutdownPolicy();
    // 如果两者皆不可，则对队列中【所有任务】调用 cancel 取消并清空队列
    if (!keepDelayed && !keepPeriodic) {
        for (Object e : q.toArray())
            if (e instanceof RunnableScheduledFuture\<?\>)
                ((RunnableScheduledFuture\<?\>) e).cancel(false);
        q.clear();
    }
    else {
        for (Object e : q.toArray()) {
            if (e instanceof RunnableScheduledFuture) {
                RunnableScheduledFuture\<?\> t = (RunnableScheduledFuture\<?\>)e;
                // 不需要执行的任务删除并取消，已经取消的任务也需要从队列中删除
                if ((t.isPeriodic() ? !keepPeriodic : !keepDelayed) ||
                    t.isCancelled()) {
                    if (q.remove(t))
                        t.cancel(false);
                }
            }
        }
    }
    // 因为任务被从队列中清理掉，所以需要调用 tryTerminate 尝试【改变线程池的状态】
    tryTerminate();
}
```

## ForkJoin

Fork/Join：线程池的实现，体现是分治思想，适用于能够进行任务拆分的 CPU 密集型运算，用于**并行计算**

任务拆分：将一个大任务拆分为算法上相同的小任务，直至不能拆分可以直接求解。跟递归相关的一些计算，如归并排序、斐波那契数列都可以用分治思想进行求解

-  Fork/Join 在**分治的基础上加入了多线程**，把每个任务的分解和合并交给不同的线程来完成，提升了运算效率 
-  ForkJoin 使用 ForkJoinPool 来启动，是一个特殊的线程池，默认会创建与 CPU 核心数大小相同的线程池 
-  任务有返回值继承 RecursiveTask，没有返回值继承 RecursiveAction 

```java
public static void main(String[] args) {
    ForkJoinPool pool = new ForkJoinPool(4);
    System.out.println(pool.invoke(new MyTask(5)));
    //拆分  5 + MyTask(4) --> 4 + MyTask(3) -->
}

// 1~ n 之间整数的和
class MyTask extends RecursiveTask\<Integer\> {
    private int n;

    public MyTask(int n) {
        this.n = n;
    }

    @Override
    public String toString() {
        return "MyTask{" + "n=" + n + '}';
    }

    @Override
    protected Integer compute() {
        // 如果 n 已经为 1，可以求得结果了
        if (n == 1) {
            return n;
        }
        // 将任务进行拆分(fork)
        MyTask t1 = new MyTask(n - 1);
        t1.fork();
        // 合并(join)结果
        int result = n + t1.join();
        return result;
    }
}
```

继续拆分优化：

```java
class AddTask extends RecursiveTask\<Integer\> {
    int begin;
    int end;
    public AddTask(int begin, int end) {
        this.begin = begin;
        this.end = end;
    }
    
    @Override
    public String toString() {
        return "{" + begin + "," + end + '}';
    }
    
    @Override
    protected Integer compute() {
        // 5, 5
        if (begin == end) {
            return begin;
        }
        // 4, 5  防止多余的拆分  提高效率
        if (end - begin == 1) {
            return end + begin;
        }
        // 1 5
        int mid = (end + begin) / 2; // 3
        AddTask t1 = new AddTask(begin, mid); // 1,3
        t1.fork();
        AddTask t2 = new AddTask(mid + 1, end); // 4,5
        t2.fork();
        int result = t1.join() + t2.join();
        return result;
    }
}
```

ForkJoinPool 实现了**工作窃取算法**来提高 CPU 的利用率：

- 每个线程都维护了一个**双端队列**，用来存储需要执行的任务
- 工作窃取算法允许空闲的线程从其它线程的双端队列中窃取一个任务来执行
- 窃取的必须是**最晚的任务**，避免和队列所属线程发生竞争，但是队列中只有一个任务时还是会发生竞争

## 享元模式

享元模式（Flyweight pattern）： 用于减少创建对象的数量，以减少内存占用和提高性能，这种类型的设计模式属于结构型模式，它提供了减少对象数量从而改善应用所需的对象结构的方式

异步模式：让有限的工作线程（Worker Thread）来轮流异步处理无限多的任务，也可将其归类为分工模式，典型实现就是线程池

工作机制：享元模式尝试重用现有的同类对象，如果未找到匹配的对象，则创建新对象

自定义连接池：

```java
public static void main(String[] args) {
    Pool pool = new Pool(2);
    for (int i = 0; i < 5; i++) {
        new Thread(() -> {
            Connection con = pool.borrow();
            try {
                Thread.sleep(new Random().nextInt(1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            pool.free(con);
        }).start();
    }
}
class Pool {
    //连接池的大小
    private final int poolSize;
    //连接对象的数组
    private Connection[] connections;
    //连接状态数组 0表示空闲  1表示繁忙
    private AtomicIntegerArray states;  //int[] -> AtomicIntegerArray

    //构造方法
    public Pool(int poolSize) {
        this.poolSize = poolSize;
        this.connections = new Connection[poolSize];
        this.states = new AtomicIntegerArray(new int[poolSize]);
        for (int i = 0; i < poolSize; i++) {
            connections[i] = new MockConnection("连接" + (i + 1));
        }
    }

    //使用连接
    public Connection borrow() {
        while (true) {
            for (int i = 0; i < poolSize; i++) {
                if (states.get(i) == 0) {
                    if (states.compareAndSet(i, 0, 1)) {
                        System.out.println(Thread.currentThread().getName() + " borrow " +  connections[i]);
                        return connections[i];
                    }
                }
            }
            //如果没有空闲连接，当前线程等待
            synchronized (this) {
                try {
                    System.out.println(Thread.currentThread().getName() + " wait...");
                    this.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    //归还连接
    public void free(Connection con) {
        for (int i = 0; i < poolSize; i++) {
            if (connections[i] == con) {//判断是否是同一个对象
                states.set(i, 0);//不用cas的原因是只会有一个线程使用该连接
                synchronized (this) {
                    System.out.println(Thread.currentThread().getName() + " free " + con);
                    this.notifyAll();
                }
                break;
            }
        }
    }

}

class MockConnection implements Connection {
    private String name;
    //.....
}
```