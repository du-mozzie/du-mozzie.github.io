---
order: 3
title: 公平锁
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 公平锁

## 基本使用

构造方法：`ReentrantLock lock = new ReentrantLock(true)`

```java
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

ReentrantLock 默认是不公平的：

```java
public ReentrantLock() {
    sync = new NonfairSync();
}
```

说明：公平锁一般没有必要，会降低并发度

## 非公原理

## 加锁

NonfairSync 继承自 AQS

```java
public void lock() {
    sync.lock();
}
```

-  没有竞争：ExclusiveOwnerThread 属于 Thread-0，state 设置为 1 

```java
// ReentrantLock.NonfairSync#lock
final void lock() {
    // 用 cas 尝试（仅尝试一次）将 state 从 0 改为 1, 如果成功表示【获得了独占锁】
    if (compareAndSetState(0, 1))
        // 设置当前线程为独占线程
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);//失败进入
}
```

-  第一个竞争出现：Thread-1 执行，CAS 尝试将 state 由 0 改为 1，结果失败（第一次），进入 acquire 逻辑 

```java
// AbstractQueuedSynchronizer#acquire
public final void acquire(int arg) {
    // tryAcquire 尝试获取锁失败时, 会调用 addWaiter 将当前线程封装成node入队，acquireQueued 阻塞当前线程，
    // acquireQueued 返回 true 表示挂起过程中线程被中断唤醒过，false 表示未被中断过
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        // 如果线程被中断了逻辑来到这，完成一次真正的打断效果
        selfInterrupt();
}
```

 ![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-ReentrantLock-非公平锁1.png)

-  进入 tryAcquire 尝试获取锁逻辑，这时 state 已经是1，结果仍然失败（第二次），加锁成功有两种情况： 

- 当前 AQS 处于无锁状态
- 加锁线程就是当前线程，说明发生了锁重入

```java
// ReentrantLock.NonfairSync#tryAcquire
protected final boolean tryAcquire(int acquires) {
    return nonfairTryAcquire(acquires);
}
// 抢占成功返回 true，抢占失败返回 false
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    // state 值
    int c = getState();
    // 条件成立说明当前处于【无锁状态】
    if (c == 0) {
        //如果还没有获得锁，尝试用cas获得，这里体现非公平性: 不去检查 AQS 队列是否有阻塞线程直接获取锁        
    	if (compareAndSetState(0, acquires)) {
            // 获取锁成功设置当前线程为独占锁线程。
            setExclusiveOwnerThread(current);
            return true;
         }    
	}    
   	// 如果已经有线程获得了锁, 独占锁线程还是当前线程, 表示【发生了锁重入】
	else if (current == getExclusiveOwnerThread()) {
        // 更新锁重入的值
        int nextc = c + acquires;
        // 越界判断，当重入的深度很深时，会导致 nextc < 0，int值达到最大之后再 + 1 变负数
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        // 更新 state 的值，这里不使用 cas 是因为当前线程正在持有锁，所以这里的操作相当于在一个管程内
        setState(nextc);
        return true;
    }
    // 获取失败
    return false;
}
```

-  接下来进入 addWaiter 逻辑，构造 Node 队列（不是阻塞队列），前置条件是当前线程获取锁失败，说明有线程占用了锁 

- 图中黄色三角表示该 Node 的 waitStatus 状态，其中 0 为默认**正常状态**
- Node 的创建是懒惰的，其中第一个 Node 称为 **Dummy（哑元）或哨兵**，用来占位，并不关联线程

```java
// AbstractQueuedSynchronizer#addWaiter，返回当前线程的 node 节点
private Node addWaiter(Node mode) {
    // 将当前线程关联到一个 Node 对象上, 模式为独占模式   
    Node node = new Node(Thread.currentThread(), mode);
    Node pred = tail;
    // 快速入队，如果 tail 不为 null，说明存在队列
    if (pred != null) {
        // 将当前节点的前驱节点指向 尾节点
        node.prev = pred;
        // 通过 cas 将 Node 对象加入 AQS 队列，成为尾节点，【尾插法】
        if (compareAndSetTail(pred, node)) {
            pred.next = node;// 双向链表
            return node;
        }
    }
    // 初始时队列为空，或者 CAS 失败进入这里
    enq(node);
    return node;
}
// AbstractQueuedSynchronizer#enq
private Node enq(final Node node) {
    // 自旋入队，必须入队成功才结束循环
    for (;;) {
        Node t = tail;
        // 说明当前锁被占用，且当前线程可能是【第一个获取锁失败】的线程，【还没有建立队列】
        if (t == null) {
            // 设置一个【哑元节点】，头尾指针都指向该节点
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            // 自旋到这，普通入队方式，首先赋值尾节点的前驱节点【尾插法】
            node.prev = t;
            // 【在设置完尾节点后，才更新的原始尾节点的后继节点，所以此时从前往后遍历会丢失尾节点】
            if (compareAndSetTail(t, node)) {
                //【此时 t.next  = null，并且这里已经 CAS 结束，线程并不是安全的】
                t.next = node;
                return t;	// 返回当前 node 的前驱节点
            }
        }
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantLock-%E9%9D%9E%E5%85%AC%E5%B9%B3%E9%94%812.png)

-  线程节点加入队列成功，进入 AbstractQueuedSynchronizer#acquireQueued 逻辑阻塞线程 

-  acquireQueued 会在一个自旋中不断尝试获得锁，失败后进入 park 阻塞 
-  如果当前线程是在 head 节点后，会再次 tryAcquire 尝试获取锁，state 仍为 1 则失败（第三次） 

```java
final boolean acquireQueued(final Node node, int arg) {
    // true 表示当前线程抢占锁失败，false 表示成功
    boolean failed = true;
    try {
        // 中断标记，表示当前线程是否被中断
        boolean interrupted = false;
        for (;;) {
            // 获得当前线程节点的前驱节点
            final Node p = node.predecessor();
            // 前驱节点是 head, FIFO 队列的特性表示轮到当前线程可以去获取锁
            if (p == head && tryAcquire(arg)) {
                // 获取成功, 设置当前线程自己的 node 为 head
                setHead(node);
                p.next = null; // help GC
                // 表示抢占锁成功
                failed = false;
                // 返回当前线程是否被中断
                return interrupted;
            }
            // 判断是否应当 park，返回 false 后需要新一轮的循环，返回 true 进入条件二阻塞线程
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                // 条件二返回结果是当前线程是否被打断，没有被打断返回 false 不进入这里的逻辑
                // 【就算被打断了，也会继续循环，并不会返回】
                interrupted = true;
        }
    } finally {
        // 【可打断模式下才会进入该逻辑】
        if (failed)
            cancelAcquire(node);
    }
}
```

- 进入 shouldParkAfterFailedAcquire 逻辑，**将前驱 node 的 waitStatus 改为 -1**，返回 false；waitStatus 为 -1 的节点用来唤醒下一个节点

```java
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    // 表示前置节点是个可以唤醒当前节点的节点，返回 true
    if (ws == Node.SIGNAL)
        return true;
    // 前置节点的状态处于取消状态，需要【删除前面所有取消的节点】, 返回到外层循环重试
    if (ws > 0) {
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        // 获取到非取消的节点，连接上当前节点
        pred.next = node;
    // 默认情况下 node 的 waitStatus 是 0，进入这里的逻辑
    } else {
        // 【设置上一个节点状态为 Node.SIGNAL】，返回外层循环重试
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    // 返回不应该 park，再次尝试一次
    return false;
}
```

- shouldParkAfterFailedAcquire 执行完毕回到 acquireQueued ，再次 tryAcquire 尝试获取锁，这时 state 仍为 1 获取失败（第四次）
- 当再次进入 shouldParkAfterFailedAcquire 时，这时其前驱 node 的 waitStatus 已经是 -1 了，返回 true
- 进入 parkAndCheckInterrupt， Thread-1 park（灰色表示）

```java
private final boolean parkAndCheckInterrupt() {
    // 阻塞当前线程，如果打断标记已经是 true, 则 park 会失效
    LockSupport.park(this);
    // 判断当前线程是否被打断，清除打断标记
    return Thread.interrupted();
}
```

-  再有多个线程经历竞争失败后：
  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantLock-%E9%9D%9E%E5%85%AC%E5%B9%B3%E9%94%813.png)

## 解锁

ReentrantLock#unlock：释放锁

```java
public void unlock() {
    sync.release(1);
}
```

Thread-0 释放锁，进入 release 流程

-  进入 tryRelease，设置 exclusiveOwnerThread 为 null，state = 0 
-  当前队列不为 null，并且 head 的 waitStatus = -1，进入 unparkSuccessor 

```java
// AbstractQueuedSynchronizer#release
public final boolean release(int arg) {
    // 尝试释放锁，tryRelease 返回 true 表示当前线程已经【完全释放锁，重入的释放了】
    if (tryRelease(arg)) {
        // 队列头节点
        Node h = head;
        // 头节点什么时候是空？没有发生锁竞争，没有竞争线程创建哑元节点
        // 条件成立说明阻塞队列有等待线程，需要唤醒 head 节点后面的线程
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }    
    return false;
}
// ReentrantLock.Sync#tryRelease
protected final boolean tryRelease(int releases) {
    // 减去释放的值，可能重入
    int c = getState() - releases;
    // 如果当前线程不是持有锁的线程直接报错
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    // 是否已经完全释放锁
    boolean free = false;
    // 支持锁重入, 只有 state 减为 0, 才完全释放锁成功
    if (c == 0) {
        free = true;
        setExclusiveOwnerThread(null);
    }
    // 当前线程就是持有锁线程，所以可以直接更新锁，不需要使用 CAS
    setState(c);
    return free;
}
```

-  进入 AbstractQueuedSynchronizer#unparkSuccessor 方法，唤醒当前节点的后继节点 

- 找到队列中距离 head 最近的一个没取消的 Node，unpark 恢复其运行，本例中即为 Thread-1
- 回到 Thread-1 的 acquireQueued 流程

```java
private void unparkSuccessor(Node node) {
    // 当前节点的状态
    int ws = node.waitStatus;    
    if (ws < 0)        
        // 【尝试重置状态为 0】，因为当前节点要完成对后续节点的唤醒任务了，不需要 -1 了
        compareAndSetWaitStatus(node, ws, 0);    
    // 找到需要 unpark 的节点，当前节点的下一个    
    Node s = node.next;    
    // 已取消的节点不能唤醒，需要找到距离头节点最近的非取消的节点
    if (s == null || s.waitStatus > 0) {
        s = null;
        // AQS 队列【从后至前】找需要 unpark 的节点，直到 t == 当前的 node 为止，找不到就不唤醒了
        for (Node t = tail; t != null && t != node; t = t.prev)
            // 说明当前线程状态需要被唤醒
            if (t.waitStatus <= 0)
                // 置换引用
                s = t;
    }
    // 【找到合适的可以被唤醒的 node，则唤醒线程】
    if (s != null)
        LockSupport.unpark(s.thread);
}
```

**从后向前的唤醒的原因**：enq 方法中，节点是尾插法，首先赋值的是尾节点的前驱节点，此时前驱节点的 next 并没有指向尾节点，从前遍历会丢失尾节点 

-  唤醒的线程会从 park 位置开始执行，如果加锁成功（没有竞争），会设置 

- exclusiveOwnerThread 为 Thread-1，state = 1
- head 指向刚刚 Thread-1 所在的 Node，该 Node 会清空 Thread
- 原本的 head 因为从链表断开，而可被垃圾回收（图中有错误，原来的头节点的 waitStatus 被改为 0 了）

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantLock-%E9%9D%9E%E5%85%AC%E5%B9%B3%E9%94%814.png)

-  如果这时有其它线程来竞争**（非公平）**，例如这时有 Thread-4 来了并抢占了锁 

- Thread-4 被设置为 exclusiveOwnerThread，state = 1
- Thread-1 再次进入 acquireQueued 流程，获取锁失败，重新进入 park 阻塞

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantLock-%E9%9D%9E%E5%85%AC%E5%B9%B3%E9%94%815.png)

## 公平原理

与非公平锁主要区别在于 tryAcquire 方法：先检查 AQS 队列中是否有前驱节点，没有才去 CAS 竞争

```java
static final class FairSync extends Sync {
    private static final long serialVersionUID = -3000897897090466540L;
    final void lock() {
        acquire(1);
    }

    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            // 先检查 AQS 队列中是否有前驱节点, 没有(false)才去竞争
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        // 锁重入
        return false;
    }
}
public final boolean hasQueuedPredecessors() {    
    Node t = tail;
    Node h = head;
    Node s;    
    // 头尾指向一个节点，链表为空，返回false
    return h != t &&
        // 头尾之间有节点，判断头节点的下一个是不是空
        // 不是空进入最后的判断，第二个节点的线程是否是本线程，不是返回 true，表示当前节点有前驱节点
        ((s = h.next) == null || s.thread != Thread.currentThread());
}
```
