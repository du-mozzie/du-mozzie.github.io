---
order: 7
title: 同步器
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

## AQS

### 核心思想

AQS：AbstractQueuedSynchronizer，是阻塞式锁和相关的同步器工具的框架，许多同步类实现都依赖于该同步器

AQS 用状态属性来表示资源的状态（分**独占模式和共享模式**），子类需要定义如何维护这个状态，控制如何获取锁和释放锁

- 独占模式是只有一个线程能够访问资源，如 ReentrantLock
- 共享模式允许多个线程访问资源，如 Semaphore，ReentrantReadWriteLock 是组合式

AQS 核心思想：

-  如果被请求的共享资源空闲，则将当前请求资源的线程设置为有效的工作线程，并将共享资源设置锁定状态 
-  请求的共享资源被占用，AQS 用队列实现线程阻塞等待以及被唤醒时锁分配的机制，将暂时获取不到锁的线程加入到队列中

CLH 是一种基于单向链表的**高性能、公平的自旋锁**，AQS 是将每条请求共享资源的线程封装成一个 CLH 锁队列的一个结点（Node）来实现锁的分配 ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-AQS%E5%8E%9F%E7%90%86%E5%9B%BE.png)

### 设计原理

-  获取锁： 

```java
while(state 状态不允许获取) {	// tryAcquire(arg)
    if(队列中还没有此线程) {
        入队并阻塞 park
    }
}
当前线程出队
```

-  释放锁： 

```java
if(state 状态允许了) {	// tryRelease(arg)
	恢复阻塞的线程(s) unpark
}
```

 AbstractQueuedSynchronizer 中 state 设计：

-  state 使用了 32bit int 来维护同步状态，独占模式 0 表示未加锁状态，大于 0 表示已经加锁状态 

```java
private volatile int state;
```

-  state **使用 volatile 修饰配合 cas** 保证其修改时的原子性 
-  state 表示**线程重入的次数（独占模式）或者剩余许可数（共享模式）** 
-  state API： 

- `protected final int getState()`：获取 state 状态
- `protected final void setState(int newState)`：设置 state 状态
- `protected final boolean compareAndSetState(int expect,int update)`：**CAS** 安全设置 state

封装线程的 Node 节点中 waitstate 设计：

-  使用 **volatile 修饰配合 CAS** 保证其修改时的原子性 
-  表示 Node 节点的状态，有以下几种状态： 

```java
// 默认为 0
volatile int waitStatus;
// 由于超时或中断，此节点被取消，不会再改变状态
static final int CANCELLED =  1;
// 此节点后面的节点已（或即将）被阻止（通过park），【当前节点在释放或取消时必须唤醒后面的节点】
static final int SIGNAL    = -1;
// 此节点当前在条件队列中
static final int CONDITION = -2;
// 将releaseShared传播到其他节点
static final int PROPAGATE = -3;
```

 阻塞恢复设计：

- 使用 park & unpark 来实现线程的暂停和恢复，因为命令的先后顺序不影响结果
- park & unpark 是针对线程的，而不是针对同步器的，因此控制粒度更为精细
- park 线程可以通过 interrupt 打断

队列设计：

-  使用了 FIFO 先入先出队列，并不支持优先级队列，**同步队列是双向链表，便于出队入队** 

```java
// 头结点，指向哑元节点
private transient volatile Node head;
// 阻塞队列的尾节点，阻塞队列不包含头结点，从 head.next → tail 认为是阻塞队列
private transient volatile Node tail;

static final class Node {
    // 枚举：共享模式
    static final Node SHARED = new Node();
    // 枚举：独占模式
    static final Node EXCLUSIVE = null;
    // node 需要构建成 FIFO 队列，prev 指向前继节点
    volatile Node prev;
    // next 指向后继节点
    volatile Node next;
    // 当前 node 封装的线程
    volatile Thread thread;
    // 条件队列是单向链表，只有后继指针，条件队列使用该属性
    Node nextWaiter;
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-AQS%E9%98%9F%E5%88%97%E8%AE%BE%E8%AE%A1.png) 

-  条件变量来实现等待、唤醒机制，支持多个条件变量，类似于 Monitor 的 WaitSet，**条件队列是单向链表** 

```java
 public class ConditionObject implements Condition, java.io.Serializable {
     // 指向条件队列的第一个 node 节点
     private transient Node firstWaiter;
     // 指向条件队列的最后一个 node 节点
     private transient Node lastWaiter;
 }
```

### 模板对象

同步器的设计是基于模板方法模式，该模式是基于继承的，主要是为了在不改变模板结构的前提下在子类中重新定义模板中的内容以实现复用代码

- 使用者继承 `AbstractQueuedSynchronizer` 并重写指定的方法
- 将 AQS 组合在自定义同步组件的实现中，并调用其模板方法，这些模板方法会调用使用者重写的方法

AQS 使用了模板方法模式，自定义同步器时需要重写下面几个 AQS 提供的模板方法：

```java
isHeldExclusively()		//该线程是否正在独占资源。只有用到condition才需要去实现它
tryAcquire(int)			//独占方式。尝试获取资源，成功则返回true，失败则返回false
tryRelease(int)			//独占方式。尝试释放资源，成功则返回true，失败则返回false
tryAcquireShared(int)	//共享方式。尝试获取资源。负数表示失败；0表示成功但没有剩余可用资源；正数表示成功且有剩余资源
tryReleaseShared(int)	//共享方式。尝试释放资源，成功则返回true，失败则返回false
```

- 默认情况下，每个方法都抛出 `UnsupportedOperationException`
- 这些方法的实现必须是内部线程安全的
- AQS 类中的其他方法都是 final ，所以无法被其他类使用，只有这几个方法可以被其他类使用

### 自定义

自定义一个不可重入锁：

```java
class MyLock implements Lock {
    //独占锁 不可重入
    class MySync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire(int arg) {
            if (compareAndSetState(0, 1)) {
                // 加上锁 设置 owner 为当前线程
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }
        @Override   //解锁
        protected boolean tryRelease(int arg) {
            setExclusiveOwnerThread(null);
            setState(0);//volatile 修饰的变量放在后面，防止指令重排
            return true;
        }
        @Override   //是否持有独占锁
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }
        public Condition newCondition() {
            return new ConditionObject();
        }
    }

    private MySync sync = new MySync();

    @Override   //加锁（不成功进入等待队列等待）
    public void lock() {
        sync.acquire(1);
    }

    @Override   //加锁 可打断
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(1);
    }

    @Override   //尝试加锁，尝试一次
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }

    @Override   //尝试加锁，带超时
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1, unit.toNanos(time));
    }
    
    @Override   //解锁
    public void unlock() {
        sync.release(1);
    }
    
    @Override   //条件变量
    public Condition newCondition() {
        return sync.newCondition();
    }
}
```

## Re-Lock

### 锁对比

ReentrantLock 相对于 synchronized 具备如下特点：

1. 锁的实现：synchronized 是 JVM 实现的，而 ReentrantLock 是 JDK 实现的
2. 性能：新版本 Java 对 synchronized 进行了很多优化，synchronized 与 ReentrantLock 大致相同
3. 使用：ReentrantLock 需要手动解锁，synchronized 执行完代码块自动解锁
4. **可中断**：ReentrantLock 可中断，而 synchronized 不行
5. **公平锁**：公平锁是指多个线程在等待同一个锁时，必须按照申请锁的时间顺序来依次获得锁 

- ReentrantLock 可以设置公平锁，synchronized 中的锁是非公平的
- 不公平锁的含义是阻塞队列内公平，队列外非公平

1. 锁超时：尝试获取锁，超时获取不到直接放弃，不进入阻塞队列 

- ReentrantLock 可以设置超时时间，synchronized 会一直等待

1. 锁绑定多个条件：一个 ReentrantLock 可以同时绑定多个 Condition 对象，更细粒度的唤醒线程
2. 两者都是可重入锁

### 使用锁

构造方法：`ReentrantLock lock = new ReentrantLock();`

ReentrantLock 类 API：

-  `public void lock()`：获得锁 

-  如果锁没有被另一个线程占用，则将锁定计数设置为 1 
-  如果当前线程已经保持锁定，则保持计数增加 1 
-  如果锁被另一个线程保持，则当前线程被禁用线程调度，并且在锁定已被获取之前处于休眠状态 

-  `public void unlock()`：尝试释放锁 

- 如果当前线程是该锁的持有者，则保持计数递减
- 如果保持计数现在为零，则锁定被释放
- 如果当前线程不是该锁的持有者，则抛出异常

基本语法：

```java
// 获取锁
reentrantLock.lock();
try {
    // 临界区
} finally {
	// 释放锁
	reentrantLock.unlock();
}
```

### 公平锁

#### 基本使用

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

#### 非公原理

#### 加锁

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

#### 解锁

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

#### 公平原理

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

### 可重入

可重入是指同一个线程如果首次获得了这把锁，那么它是这把锁的拥有者，因此有权利再次获取这把锁，如果不可重入锁，那么第二次获得锁时，自己也会被锁挡住，直接造成死锁

源码解析参考：`nonfairTryAcquire(int acquires))` 和 `tryRelease(int releases)`

```java
static ReentrantLock lock = new ReentrantLock();
public static void main(String[] args) {
    method1();
}
public static void method1() {
    lock.lock();
    try {
        System.out.println(Thread.currentThread().getName() + " execute method1");
        method2();
    } finally {
        lock.unlock();
    }
}
public static void method2() {
    lock.lock();
    try {
        System.out.println(Thread.currentThread().getName() + " execute method2");
    } finally {
        lock.unlock();
    }
}
```

在 Lock 方法加两把锁会是什么情况呢？

- 加锁两次解锁两次：正常执行
- 加锁两次解锁一次：程序直接卡死，线程不能出来，也就说明**申请几把锁，最后需要解除几把锁**
- 加锁一次解锁两次：运行程序会直接报错

```java
public void getLock() {
    lock.lock();
    lock.lock();
    try {
        System.out.println(Thread.currentThread().getName() + "\t get Lock");
    } finally {
        lock.unlock();
        //lock.unlock();
    }
}
```

### 可打断

#### 基本使用

`public void lockInterruptibly()`：获得可打断的锁

- 如果没有竞争此方法就会获取 lock 对象锁
- 如果有竞争就进入阻塞队列，可以被其他线程用 interrupt 打断

注意：如果是不可中断模式，那么即使使用了 interrupt 也不会让等待状态中的线程中断

```java
public static void main(String[] args) throws InterruptedException {    
    ReentrantLock lock = new ReentrantLock();    
    Thread t1 = new Thread(() -> {        
        try {            
            System.out.println("尝试获取锁");            
            lock.lockInterruptibly();        
        } catch (InterruptedException e) {            
            System.out.println("没有获取到锁，被打断，直接返回");            
            return;        
        }        
        try {            
            System.out.println("获取到锁");        
        } finally {            
            lock.unlock();        
        }    
    }, "t1");    
    lock.lock();    
    t1.start();    
    Thread.sleep(2000);    
    System.out.println("主线程进行打断锁");    
    t1.interrupt();
}
```

#### 实现原理

-  不可打断模式：即使它被打断，仍会驻留在 AQS 阻塞队列中，一直要**等到获得锁后才能得知自己被打断**了 

```java
public final void acquire(int arg) {    
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))//阻塞等待        
        // 如果acquireQueued返回true，打断状态 interrupted = true        
        selfInterrupt();
}
static void selfInterrupt() {
    // 知道自己被打断了，需要重新产生一次中断完成中断效果
    Thread.currentThread().interrupt();
}
final boolean acquireQueued(final Node node, int arg) {    
    try {        
        boolean interrupted = false;        
        for (;;) {            
            final Node p = node.predecessor();            
            if (p == head && tryAcquire(arg)) {                
                setHead(node);                
                p.next = null; // help GC                
                failed = false;                
                // 还是需要获得锁后, 才能返回打断状态
                return interrupted;            
            }            
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt()){
                // 条件二中判断当前线程是否被打断，被打断返回true，设置中断标记为 true，【获取锁后返回】
                interrupted = true;  
            }                  
        } 
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
 private final boolean parkAndCheckInterrupt() {    
     // 阻塞当前线程，如果打断标记已经是 true, 则 park 会失效
     LockSupport.park(this);    
     // 判断当前线程是否被打断，清除打断标记，被打断返回true
     return Thread.interrupted();
 }
```

-  可打断模式：AbstractQueuedSynchronizer#acquireInterruptibly，**被打断后会直接抛出异常** 

```java
public void lockInterruptibly() throws InterruptedException {    
    sync.acquireInterruptibly(1);
}
public final void acquireInterruptibly(int arg) {
    // 被其他线程打断了直接返回 false
    if (Thread.interrupted())
		throw new InterruptedException();
    if (!tryAcquire(arg))
        // 没获取到锁，进入这里
        doAcquireInterruptibly(arg);
}
private void doAcquireInterruptibly(int arg) throws InterruptedException {
    // 返回封装当前线程的节点
    final Node node = addWaiter(Node.EXCLUSIVE);
    boolean failed = true;
    try {
        for (;;) {
            //...
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                // 【在 park 过程中如果被 interrupt 会抛出异常】, 而不会再次进入循环获取锁后才完成打断效果
                throw new InterruptedException();
        }    
    } finally {
        // 抛出异常前会进入这里
        if (failed)
            // 取消当前线程的节点
            cancelAcquire(node);
    }
}
// 取消节点出队的逻辑
private void cancelAcquire(Node node) {
    // 判空
    if (node == null)
        return;
	// 把当前节点封装的 Thread 置为空
    node.thread = null;
	// 获取当前取消的 node 的前驱节点
    Node pred = node.prev;
    // 前驱节点也被取消了，循环找到前面最近的没被取消的节点
    while (pred.waitStatus > 0)
        node.prev = pred = pred.prev;
    
	// 获取前驱节点的后继节点，可能是当前 node，也可能是 waitStatus > 0 的节点
    Node predNext = pred.next;
    
	// 把当前节点的状态设置为 【取消状态 1】
    node.waitStatus = Node.CANCELLED;
    
	// 条件成立说明当前节点是尾节点，把当前节点的前驱节点设置为尾节点
    if (node == tail && compareAndSetTail(node, pred)) {
        // 把前驱节点的后继节点置空，这里直接把所有的取消节点出队
        compareAndSetNext(pred, predNext, null);
    } else {
        // 说明当前节点不是 tail 节点
        int ws;
        // 条件一成立说明当前节点不是 head.next 节点
        if (pred != head &&
            // 判断前驱节点的状态是不是 -1，不成立说明前驱状态可能是 0 或者刚被其他线程取消排队了
            ((ws = pred.waitStatus) == Node.SIGNAL ||
             // 如果状态不是 -1，设置前驱节点的状态为 -1
             (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
            // 前驱节点的线程不为null
            pred.thread != null) {
            
            Node next = node.next;
            // 当前节点的后继节点是正常节点
            if (next != null && next.waitStatus <= 0)
                // 把 前驱节点的后继节点 设置为 当前节点的后继节点，【从队列中删除了当前节点】
                compareAndSetNext(pred, predNext, next);
        } else {
            // 当前节点是 head.next 节点，唤醒当前节点的后继节点
            unparkSuccessor(node);
        }
        node.next = node; // help GC
    }
}
```

### 锁超时

#### 基本使用

`public boolean tryLock()`：尝试获取锁，获取到返回 true，获取不到直接放弃，不进入阻塞队列

`public boolean tryLock(long timeout, TimeUnit unit)`：在给定时间内获取锁，获取不到就退出

注意：tryLock 期间也可以被打断

```java
public static void main(String[] args) {
    ReentrantLock lock = new ReentrantLock();
    Thread t1 = new Thread(() -> {
        try {
            if (!lock.tryLock(2, TimeUnit.SECONDS)) {
                System.out.println("获取不到锁");
                return;
            }
        } catch (InterruptedException e) {
            System.out.println("被打断，获取不到锁");
            return;
        }
        try {
            log.debug("获取到锁");
        } finally {
            lock.unlock();
        }
    }, "t1");
    lock.lock();
    System.out.println("主线程获取到锁");
    t1.start();
    
    Thread.sleep(1000);
    try {
        System.out.println("主线程释放了锁");
    } finally {
        lock.unlock();
    }
}
```

#### 实现原理

-  成员变量：指定超时限制的阈值，小于该值的线程不会被挂起 

```java
static final long spinForTimeoutThreshold = 1000L;
```

超时时间设置的小于该值，就会被禁止挂起，因为阻塞在唤醒的成本太高，不如选择自旋空转 

-  tryLock() 

```java
public boolean tryLock() {   
    // 只尝试一次
    return sync.nonfairTryAcquire(1);
}
```

-  tryLock(long timeout, TimeUnit unit) 

```java
public final boolean tryAcquireNanos(int arg, long nanosTimeout) {
    if (Thread.interrupted())        
        throw new InterruptedException();    
    // tryAcquire 尝试一次
    return tryAcquire(arg) || doAcquireNanos(arg, nanosTimeout);
}
protected final boolean tryAcquire(int acquires) {    
    return nonfairTryAcquire(acquires);
}
private boolean doAcquireNanos(int arg, long nanosTimeout) {    
    if (nanosTimeout <= 0L)
        return false;
    // 获取最后期限的时间戳
    final long deadline = System.nanoTime() + nanosTimeout;
    //...
    try {
        for (;;) {
            //...
            // 计算还需等待的时间
            nanosTimeout = deadline - System.nanoTime();
            if (nanosTimeout <= 0L)	//时间已到     
                return false;
            if (shouldParkAfterFailedAcquire(p, node) &&
                // 如果 nanosTimeout 大于该值，才有阻塞的意义，否则直接自旋会好点
                nanosTimeout > spinForTimeoutThreshold)
                LockSupport.parkNanos(this, nanosTimeout);
            // 【被打断会报异常】
            if (Thread.interrupted())
                throw new InterruptedException();
        }    
    }
}
```

#### 哲学家就餐

```java
public static void main(String[] args) {
    Chopstick c1 = new Chopstick("1");//...
    Chopstick c5 = new Chopstick("5");
    new Philosopher("苏格拉底", c1, c2).start();
    new Philosopher("柏拉图", c2, c3).start();
    new Philosopher("亚里士多德", c3, c4).start();
    new Philosopher("赫拉克利特", c4, c5).start();    
    new Philosopher("阿基米德", c5, c1).start();
}
class Philosopher extends Thread {
    Chopstick left;
    Chopstick right;
    public void run() {
        while (true) {
            // 尝试获得左手筷子
            if (left.tryLock()) {
                try {
                    // 尝试获得右手筷子
                    if (right.tryLock()) {
                        try {
                            System.out.println("eating...");
                            Thread.sleep(1000);
                        } finally {
                            right.unlock();
                        }
                    }
                } finally {
                    left.unlock();
                }
            }
        }
    }
}
class Chopstick extends ReentrantLock {
    String name;
    public Chopstick(String name) {
        this.name = name;
    }
    @Override
    public String toString() {
        return "筷子{" + name + '}';
    }
}
```

### 条件变量

#### 基本使用

synchronized 的条件变量，是当条件不满足时进入 WaitSet 等待；ReentrantLock 的条件变量比 synchronized 强大之处在于支持多个条件变量

ReentrantLock 类获取 Condition 对象：`public Condition newCondition()`

Condition 类 API：

- `void await()`：当前线程从运行状态进入等待状态，释放锁
- `void signal()`：唤醒一个等待在 Condition 上的线程，但是必须获得与该 Condition 相关的锁

使用流程：

-  **await / signal 前需要获得锁** 
-  await 执行后，会释放锁进入 ConditionObject 等待 
-  await 的线程被唤醒去重新竞争 lock 锁 
-  **线程在条件队列被打断会抛出中断异常** 
-  竞争 lock 锁成功后，从 await 后继续执行 

```java
public static void main(String[] args) throws InterruptedException {    
    ReentrantLock lock = new ReentrantLock();
    //创建一个新的条件变量
    Condition condition1 = lock.newCondition();
    Condition condition2 = lock.newCondition();
    new Thread(() -> {
        try {
            lock.lock();
            System.out.println("进入等待");
            //进入休息室等待
            condition1.await();
            System.out.println("被唤醒了");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }    
    }).start();
    Thread.sleep(1000);
    //叫醒
    new Thread(() -> {
        try {            
            lock.lock();
            //唤醒
            condition2.signal();
        } finally {
            lock.unlock();
        }
    }).start();
}
```

#### 实现原理

#### await

总体流程是将 await 线程包装成 node 节点放入 ConditionObject 的条件队列，如果被唤醒就将 node 转移到 AQS 的执行阻塞队列，等待获取锁，**每个 Condition 对象都包含一个等待队列**

-  开始 Thread-0 持有锁，调用 await，线程进入 ConditionObject 等待，直到被唤醒或打断，调用 await 方法的线程都是持锁状态的，所以说逻辑里**不存在并发** 

```java
public final void await() throws InterruptedException {
     // 判断当前线程是否是中断状态，是就直接给个中断异常
    if (Thread.interrupted())
        throw new InterruptedException();
    // 将调用 await 的线程包装成 Node，添加到条件队列并返回
    Node node = addConditionWaiter();
    // 完全释放节点持有的锁，因为其他线程唤醒当前线程的前提是【持有锁】
    int savedState = fullyRelease(node);
    
    // 设置打断模式为没有被打断，状态码为 0
    int interruptMode = 0;
    
    // 如果该节点还没有转移至 AQS 阻塞队列, park 阻塞，等待进入阻塞队列
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        // 如果被打断，退出等待队列，对应的 node 【也会被迁移到阻塞队列】尾部，状态设置为 0
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
            break;
    }
    // 逻辑到这说明当前线程退出等待队列，进入【阻塞队列】
    
    // 尝试枪锁，释放了多少锁就【重新获取多少锁】，获取锁成功判断打断模式
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
        interruptMode = REINTERRUPT;
    
    // node 在条件队列时 如果被外部线程中断唤醒，会加入到阻塞队列，但是并未设 nextWaiter = null
    if (node.nextWaiter != null)
        // 清理条件队列内所有已取消的 Node
        unlinkCancelledWaiters();
    // 条件成立说明挂起期间发生过中断
    if (interruptMode != 0)
        // 应用打断模式
        reportInterruptAfterWait(interruptMode);
}
// 打断模式 - 在退出等待时重新设置打断状态
private static final int REINTERRUPT = 1;
// 打断模式 - 在退出等待时抛出异常
private static final int THROW_IE = -1;
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantLock-%E6%9D%A1%E4%BB%B6%E5%8F%98%E9%87%8F1.png)

-  **创建新的 Node 状态为 -2（Node.CONDITION）**，关联 Thread-0，加入等待队列尾部 

```java
private Node addConditionWaiter() {
    // 获取当前条件队列的尾节点的引用，保存到局部变量 t 中
    Node t = lastWaiter;
    // 当前队列中不是空，并且节点的状态不是 CONDITION（-2），说明当前节点发生了中断
    if (t != null && t.waitStatus != Node.CONDITION) {
        // 清理条件队列内所有已取消的 Node
        unlinkCancelledWaiters();
        // 清理完成重新获取 尾节点 的引用
        t = lastWaiter;
    }
    // 创建一个关联当前线程的新 node, 设置状态为 CONDITION(-2)，添加至队列尾部
    Node node = new Node(Thread.currentThread(), Node.CONDITION);
    if (t == null)
        firstWaiter = node;		// 空队列直接放在队首【不用CAS因为执行线程是持锁线程，并发安全】
    else
        t.nextWaiter = node;	// 非空队列队尾追加
    lastWaiter = node;			// 更新队尾的引用
    return node;
}
// 清理条件队列内所有已取消（不是CONDITION）的 node，【链表删除的逻辑】
private void unlinkCancelledWaiters() {
    // 从头节点开始遍历【FIFO】
    Node t = firstWaiter;
    // 指向正常的 CONDITION 节点
    Node trail = null;
    // 等待队列不空
    while (t != null) {
        // 获取当前节点的后继节点
        Node next = t.nextWaiter;
        // 判断 t 节点是不是 CONDITION 节点，条件队列内不是 CONDITION 就不是正常的
        if (t.waitStatus != Node.CONDITION) { 
            // 不是正常节点，需要 t 与下一个节点断开
            t.nextWaiter = null;
            // 条件成立说明遍历到的节点还未碰到过正常节点
            if (trail == null)
                // 更新 firstWaiter 指针为下个节点
                firstWaiter = next;
            else
                // 让上一个正常节点指向 当前取消节点的 下一个节点，【删除非正常的节点】
                trail.nextWaiter = next;
            // t 是尾节点了，更新 lastWaiter 指向最后一个正常节点
            if (next == null)
                lastWaiter = trail;
        } else {
            // trail 指向的是正常节点 
            trail = t;
        }
        // 把 t.next 赋值给 t，循环遍历
        t = next; 
    }
}
```

-  接下来 Thread-0 进入 AQS 的 fullyRelease 流程，释放同步器上的锁 

```java
// 线程可能重入，需要将 state 全部释放
final int fullyRelease(Node node) {
    // 完全释放锁是否成功，false 代表成功
    boolean failed = true;
    try {
        // 获取当前线程所持有的 state 值总数
        int savedState = getState();
        // release -> tryRelease 解锁重入锁
        if (release(savedState)) {
            // 释放成功
            failed = false;
            // 返回解锁的深度
            return savedState;
        } else {
            // 解锁失败抛出异常
            throw new IllegalMonitorStateException();
        }
    } finally {
        // 没有释放成功，将当前 node 设置为取消状态
        if (failed)
            node.waitStatus = Node.CANCELLED;
    }
}
```

-  fullyRelease 中会 unpark AQS 队列中的下一个节点竞争锁，假设 Thread-1 竞争成功
  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantLock-%E6%9D%A1%E4%BB%B6%E5%8F%98%E9%87%8F2.png)
-  Thread-0 进入 isOnSyncQueue 逻辑判断节点**是否移动到阻塞队列**，没有就 park 阻塞 Thread-0 

```java
final boolean isOnSyncQueue(Node node) {
    // node 的状态是 CONDITION，signal 方法是先修改状态再迁移，所以前驱节点为空证明还【没有完成迁移】
    if (node.waitStatus == Node.CONDITION || node.prev == null)
        return false;
    // 说明当前节点已经成功入队到阻塞队列，且当前节点后面已经有其它 node，因为条件队列的 next 指针为 null
    if (node.next != null)
        return true;
	// 说明【可能在阻塞队列，但是是尾节点】
    // 从阻塞队列的尾节点开始向前【遍历查找 node】，如果查找到返回 true，查找不到返回 false
    return findNodeFromTail(node);
}
```

-  await 线程 park 后如果被 unpark 或者被打断，都会进入 checkInterruptWhileWaiting 判断线程是否被打断：**在条件队列被打断的线程需要抛出异常** 

```java
private int checkInterruptWhileWaiting(Node node) {
    // Thread.interrupted() 返回当前线程中断标记位，并且重置当前标记位 为 false
    // 如果被中断了，根据是否在条件队列被中断的，设置中断状态码
    return Thread.interrupted() ?(transferAfterCancelledWait(node) ? THROW_IE : REINTERRUPT) : 0;
}
// 这个方法只有在线程是被打断唤醒时才会调用
final boolean transferAfterCancelledWait(Node node) {
    // 条件成立说明当前node一定是在条件队列内，因为 signal 迁移节点到阻塞队列时，会将节点的状态修改为 0
    if (compareAndSetWaitStatus(node, Node.CONDITION, 0)) {
        // 把【中断唤醒的 node 加入到阻塞队列中】
        enq(node);
        // 表示是在条件队列内被中断了，设置为 THROW_IE 为 -1
        return true;
    }

    //执行到这里的情况：
    //1.当前node已经被外部线程调用 signal 方法将其迁移到 阻塞队列 内了
    //2.当前node正在被外部线程调用 signal 方法将其迁移至 阻塞队列 进行中状态
    
    // 如果当前线程还没到阻塞队列，一直释放 CPU
    while (!isOnSyncQueue(node))
        Thread.yield();

    // 表示当前节点被中断唤醒时不在条件队列了，设置为 REINTERRUPT 为 1
    return false;
}
```

-  最后开始处理中断状态： 

```java
private void reportInterruptAfterWait(int interruptMode) throws InterruptedException {
    // 条件成立说明【在条件队列内发生过中断，此时 await 方法抛出中断异常】
    if (interruptMode == THROW_IE)
        throw new InterruptedException();

    // 条件成立说明【在条件队列外发生的中断，此时设置当前线程的中断标记位为 true】
    else if (interruptMode == REINTERRUPT)
        // 进行一次自己打断，产生中断的效果
        selfInterrupt();
}
```

#### signal

-  假设 Thread-1 要来唤醒 Thread-0，进入 ConditionObject 的 doSignal 流程，**取得等待队列中第一个 Node**，即 Thread-0 所在 Node，必须持有锁才能唤醒, 因此 doSignal 内线程安全 

```java
public final void signal() {
    // 判断调用 signal 方法的线程是否是独占锁持有线程
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    // 获取条件队列中第一个 Node
    Node first = firstWaiter;
    // 不为空就将第该节点【迁移到阻塞队列】
    if (first != null)
        doSignal(first);
}
// 唤醒 - 【将没取消的第一个节点转移至 AQS 队列尾部】
private void doSignal(Node first) {
    do {
        // 成立说明当前节点的下一个节点是 null，当前节点是尾节点了，队列中只有当前一个节点了
        if ((firstWaiter = first.nextWaiter) == null)
            lastWaiter = null;
        first.nextWaiter = null;
    // 将等待队列中的 Node 转移至 AQS 队列，不成功且还有节点则继续循环
    } while (!transferForSignal(first) && (first = firstWaiter) != null);
}

// signalAll() 会调用这个函数，唤醒所有的节点
private void doSignalAll(Node first) {
    lastWaiter = firstWaiter = null;
    do {
        Node next = first.nextWaiter;
        first.nextWaiter = null;
        transferForSignal(first);
        first = next;
    // 唤醒所有的节点，都放到阻塞队列中
    } while (first != null);
}
```

-  执行 transferForSignal，**先将节点的 waitStatus 改为 0，然后加入 AQS 阻塞队列尾部**，将 Thread-3 的 waitStatus 改为 -1 

```java
// 如果节点状态是取消, 返回 false 表示转移失败, 否则转移成功
final boolean transferForSignal(Node node) {
    // CAS 修改当前节点的状态，修改为 0，因为当前节点马上要迁移到阻塞队列了
    // 如果状态已经不是 CONDITION, 说明线程被取消（await 释放全部锁失败）或者被中断（可打断 cancelAcquire）
    if (!compareAndSetWaitStatus(node, Node.CONDITION, 0))
        // 返回函数调用处继续寻找下一个节点
        return false;
    
    // 【先改状态，再进行迁移】
    // 将当前 node 入阻塞队列，p 是当前节点在阻塞队列的【前驱节点】
    Node p = enq(node);
    int ws = p.waitStatus;
    
    // 如果前驱节点被取消或者不能设置状态为 Node.SIGNAL，就 unpark 取消当前节点线程的阻塞状态, 
    // 让 thread-0 线程竞争锁，重新同步状态
    if (ws > 0 || !compareAndSetWaitStatus(p, ws, Node.SIGNAL))
        LockSupport.unpark(node.thread);
    return true;
}
```

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-ReentrantLock-条件变量3.png)

-  Thread-1 释放锁，进入 unlock 流程 

## ReadWrite

### 读写锁

独占锁：指该锁一次只能被一个线程所持有，对 ReentrantLock 和 Synchronized 而言都是独占锁

共享锁：指该锁可以被多个线程锁持有

ReentrantReadWriteLock 其**读锁是共享锁，写锁是独占锁**

作用：多个线程同时读一个资源类没有任何问题，为了满足并发量，读取共享资源应该同时进行，但是如果一个线程想去写共享资源，就不应该再有其它线程可以对该资源进行读或写

使用规则：

-  加锁解锁格式： 

```java
r.lock();
try {
    // 临界区
} finally {
	r.unlock();
}
```

-  读-读能共存、读-写不能共存、写-写不能共存 
-  读锁不支持条件变量 
-  **重入时升级不支持**：持有读锁的情况下去获取写锁会导致获取写锁永久等待，需要先释放读，再去获得写锁
-  **重入时降级支持**：持有写锁的情况下去获取读锁，造成只有当前线程会持有读锁，因为写锁会互斥其他的锁 
-  一个线程拥有了读锁，此时第二个线程去获取写锁会失败，第三个线程（在第二个线程之后）去获取读锁也会失败，因为写锁的优先级更高，**如果不这样可能会导致写锁一直无法获取**

```java
w.lock();
try {
    r.lock();// 降级为读锁, 释放写锁, 这样能够让其它线程读取缓存
    try {
        // ...
    } finally{
    	w.unlock();// 要在写锁释放之前获取读锁
    }
} finally{
	r.unlock();
}
```

 构造方法：

- `public ReentrantReadWriteLock()`：默认构造方法，非公平锁
- `public ReentrantReadWriteLock(boolean fair)`：true 为公平锁

常用API：

- `public ReentrantReadWriteLock.ReadLock readLock()`：返回读锁
- `public ReentrantReadWriteLock.WriteLock writeLock()`：返回写锁
- `public void lock()`：加锁
- `public void unlock()`：解锁
- `public boolean tryLock()`：尝试获取锁

读读并发：

```java
public static void main(String[] args) {
    ReentrantReadWriteLock rw = new ReentrantReadWriteLock();
    ReentrantReadWriteLock.ReadLock r = rw.readLock();
    ReentrantReadWriteLock.WriteLock w = rw.writeLock();

    new Thread(() -> {
        r.lock();
        try {
            Thread.sleep(2000);
            System.out.println("Thread 1 running " + new Date());
        } finally {
            r.unlock();
        }
    },"t1").start();
    new Thread(() -> {
        r.lock();
        try {
            Thread.sleep(2000);
            System.out.println("Thread 2 running " + new Date());
        } finally {
            r.unlock();
        }
    },"t2").start();
}
```

### 缓存应用

缓存更新时，是先清缓存还是先更新数据库

-  先清缓存：可能造成刚清理缓存还没有更新数据库，线程直接查询了数据库更新过期数据到缓存 
-  先更新据库：可能造成刚更新数据库，还没清空缓存就有线程从缓存拿到了旧数据 
-  补充情况：查询线程 A 查询数据时恰好缓存数据由于时间到期失效，或是第一次查询 ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantReadWriteLock%E7%BC%93%E5%AD%98.png)

可以使用读写锁进行操作

### 实现原理

#### 成员属性

读写锁用的是同一个 Sycn 同步器，因此等待队列、state 等也是同一个，原理与 ReentrantLock 加锁相比没有特殊之处，不同是**写锁状态占了 state 的低 16 位，而读锁使用的是 state 的高 16 位**

-  读写锁： 

```java
private final ReentrantReadWriteLock.ReadLock readerLock;		
private final ReentrantReadWriteLock.WriteLock writerLock;
```

-  构造方法：默认是非公平锁，可以指定参数创建公平锁 

```java
public ReentrantReadWriteLock(boolean fair) {
    // true 为公平锁
    sync = fair ? new FairSync() : new NonfairSync();
    // 这两个 lock 共享同一个 sync 实例，都是由 ReentrantReadWriteLock 的 sync 提供同步实现
    readerLock = new ReadLock(this);
    writerLock = new WriteLock(this);
}
```

 Sync 类的属性：

-  统计变量： 

```java
// 用来移位
static final int SHARED_SHIFT   = 16;
// 高16位的1
static final int SHARED_UNIT    = (1 << SHARED_SHIFT);
// 65535，16个1，代表写锁的最大重入次数
static final int MAX_COUNT      = (1 << SHARED_SHIFT) - 1;
// 低16位掩码：0b 1111 1111 1111 1111，用来获取写锁重入的次数
static final int EXCLUSIVE_MASK = (1 << SHARED_SHIFT) - 1;
```

-  获取读写锁的次数： 

```java
// 获取读写锁的读锁分配的总次数
static int sharedCount(int c)    { return c >>> SHARED_SHIFT; }
// 写锁（独占）锁的重入次数
static int exclusiveCount(int c) { return c & EXCLUSIVE_MASK; }
```

-  内部类： 

```java
// 记录读锁线程自己的持有读锁的数量（重入次数），因为 state 高16位记录的是全局范围内所有的读线程获取读锁的总量
static final class HoldCounter {
    int count = 0;
    // Use id, not reference, to avoid garbage retention
    final long tid = getThreadId(Thread.currentThread());
}
// 线程安全的存放线程各自的 HoldCounter 对象
static final class ThreadLocalHoldCounter extends ThreadLocal\<HoldCounter\> {
    public HoldCounter initialValue() {
        return new HoldCounter();
    }
}
```

-  内部类实例： 

```java
// 当前线程持有的可重入读锁的数量，计数为 0 时删除
private transient ThreadLocalHoldCounter readHolds;
// 记录最后一个获取【读锁】线程的 HoldCounter 对象
private transient HoldCounter cachedHoldCounter;
```

-  首次获取锁： 

```java
// 第一个获取读锁的线程
private transient Thread firstReader = null;
// 记录该线程持有的读锁次数（读锁重入次数）
private transient int firstReaderHoldCount;
```

-  Sync 构造方法： 

```java
Sync() {
    readHolds = new ThreadLocalHoldCounter();
    // 确保其他线程的数据可见性，state 是 volatile 修饰的变量，重写该值会将线程本地缓存数据【同步至主存】
    setState(getState()); 
}
```

#### 加锁原理

-  t1 线程：w.lock（**写锁**），成功上锁 state = 0_1 

```java
// lock()  -> sync.acquire(1);
public void lock() {
    sync.acquire(1);
}
public final void acquire(int arg) {
    // 尝试获得写锁，获得写锁失败，将当前线程关联到一个 Node 对象上, 模式为独占模式 
    if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
protected final boolean tryAcquire(int acquires) {
    Thread current = Thread.currentThread();
    int c = getState();
    // 获得低 16 位, 代表写锁的 state 计数
    int w = exclusiveCount(c);
    // 说明有读锁或者写锁
    if (c != 0) {
        // c != 0 and w == 0 表示有读锁，【读锁不能升级】，直接返回 false
        // w != 0 说明有写锁，写锁的拥有者不是自己，获取失败
        if (w == 0 || current != getExclusiveOwnerThread())
            return false;
        
        // 执行到这里只有一种情况：【写锁重入】，所以下面几行代码不存在并发
        if (w + exclusiveCount(acquires) > MAX_COUNT)
            throw new Error("Maximum lock count exceeded");
        // 写锁重入, 获得锁成功，没有并发，所以不使用 CAS
        setState(c + acquires);
        return true;
    }
    
    // c == 0，说明没有任何锁，判断写锁是否该阻塞，是 false 就尝试获取锁，失败返回 false
    if (writerShouldBlock() || !compareAndSetState(c, c + acquires))
        return false;
    // 获得锁成功，设置锁的持有线程为当前线程
    setExclusiveOwnerThread(current);
    return true;
}
// 非公平锁 writerShouldBlock 总是返回 false, 无需阻塞
final boolean writerShouldBlock() {
    return false; 
}
// 公平锁会检查 AQS 队列中是否有前驱节点, 没有(false)才去竞争
final boolean writerShouldBlock() {
    return hasQueuedPredecessors();
}
```

-  t2 r.lock（**读锁**），进入 tryAcquireShared 流程： 

- 返回 -1 表示失败
- 如果返回 0 表示成功
- 返回正数表示还有多少后继节点支持共享模式，读写锁返回 1

```java
public void lock() {
    sync.acquireShared(1);
}
public final void acquireShared(int arg) {
    // tryAcquireShared 返回负数, 表示获取读锁失败
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
// 尝试以共享模式获取
protected final int tryAcquireShared(int unused) {
    Thread current = Thread.currentThread();
    int c = getState();
    // exclusiveCount(c) 代表低 16 位, 写锁的 state，成立说明有线程持有写锁
    // 写锁的持有者不是当前线程，则获取读锁失败，【写锁允许降级】
    if (exclusiveCount(c) != 0 && getExclusiveOwnerThread() != current)
        return -1;
    
    // 高 16 位，代表读锁的 state，共享锁分配出去的总次数
    int r = sharedCount(c);
    // 读锁是否应该阻塞
    if (!readerShouldBlock() &&	r < MAX_COUNT &&
        compareAndSetState(c, c + SHARED_UNIT)) {	// 尝试增加读锁计数
        // 加锁成功
        // 加锁之前读锁为 0，说明当前线程是第一个读锁线程
        if (r == 0) {
            firstReader = current;
            firstReaderHoldCount = 1;
        // 第一个读锁线程是自己就发生了读锁重入
        } else if (firstReader == current) {
            firstReaderHoldCount++;
        } else {
            // cachedHoldCounter 设置为当前线程的 holdCounter 对象，即最后一个获取读锁的线程
            HoldCounter rh = cachedHoldCounter;
            // 说明还没设置 rh
            if (rh == null || rh.tid != getThreadId(current))
                // 获取当前线程的锁重入的对象，赋值给 cachedHoldCounter
                cachedHoldCounter = rh = readHolds.get();
            // 还没重入
            else if (rh.count == 0)
                readHolds.set(rh);
            // 重入 + 1
            rh.count++;
        }
        // 读锁加锁成功
        return 1;
    }
    // 逻辑到这 应该阻塞，或者 cas 加锁失败
    // 会不断尝试 for (;;) 获取读锁, 执行过程中无阻塞
    return fullTryAcquireShared(current);
}
// 非公平锁 readerShouldBlock 偏向写锁一些，看 AQS 阻塞队列中第一个节点是否是写锁，是则阻塞，反之不阻塞
// 防止一直有读锁线程，导致写锁线程饥饿
// true 则该阻塞, false 则不阻塞
final boolean readerShouldBlock() {
    return apparentlyFirstQueuedIsExclusive();
}
final boolean readerShouldBlock() {
    return hasQueuedPredecessors();
}
final int fullTryAcquireShared(Thread current) {
    // 当前读锁线程持有的读锁次数对象
    HoldCounter rh = null;
    for (;;) {
        int c = getState();
        // 说明有线程持有写锁
        if (exclusiveCount(c) != 0) {
            // 写锁不是自己则获取锁失败
            if (getExclusiveOwnerThread() != current)
                return -1;
        } else if (readerShouldBlock()) {
            // 条件成立说明当前线程是 firstReader，当前锁是读忙碌状态，而且当前线程也是读锁重入
            if (firstReader == current) {
                // assert firstReaderHoldCount > 0;
            } else {
                if (rh == null) {
                    // 最后一个读锁的 HoldCounter
                    rh = cachedHoldCounter;
                    // 说明当前线程也不是最后一个读锁
                    if (rh == null || rh.tid != getThreadId(current)) {
                        // 获取当前线程的 HoldCounter
                        rh = readHolds.get();
                        // 条件成立说明 HoldCounter 对象是上一步代码新建的
                        // 当前线程不是锁重入，在 readerShouldBlock() 返回 true 时需要去排队
                        if (rh.count == 0)
                            // 防止内存泄漏
                            readHolds.remove();
                    }
                }
                if (rh.count == 0)
                    return -1;
            }
        }
        // 越界判断
        if (sharedCount(c) == MAX_COUNT)
            throw new Error("Maximum lock count exceeded");
        // 读锁加锁，条件内的逻辑与 tryAcquireShared 相同
        if (compareAndSetState(c, c + SHARED_UNIT)) {
            if (sharedCount(c) == 0) {
                firstReader = current;
                firstReaderHoldCount = 1;
            } else if (firstReader == current) {
                firstReaderHoldCount++;
            } else {
                if (rh == null)
                    rh = cachedHoldCounter;
                if (rh == null || rh.tid != getThreadId(current))
                    rh = readHolds.get();
                else if (rh.count == 0)
                    readHolds.set(rh);
                rh.count++;
                cachedHoldCounter = rh; // cache for release
            }
            return 1;
        }
    }
}
```

-  获取读锁失败，进入 sync.doAcquireShared(1) 流程开始阻塞，首先也是调用 addWaiter 添加节点，不同之处在于节点被设置为 Node.SHARED 模式而非 Node.EXCLUSIVE 模式，注意此时 t2 仍处于活跃状态 

```java
private void doAcquireShared(int arg) {
    // 将当前线程关联到一个 Node 对象上, 模式为共享模式
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            // 获取前驱节点
            final Node p = node.predecessor();
            // 如果前驱节点就头节点就去尝试获取锁
            if (p == head) {
                // 再一次尝试获取读锁
                int r = tryAcquireShared(arg);
                // r >= 0 表示获取成功
                if (r >= 0) {
                    //【这里会设置自己为头节点，唤醒相连的后序的共享节点】
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            // 是否在获取读锁失败时阻塞      					 park 当前线程
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
```

如果没有成功，在 doAcquireShared 内 for (;;) 循环一次，shouldParkAfterFailedAcquire 内把前驱节点的 waitStatus 改为 -1，再 for (;;) 循环一次尝试 tryAcquireShared，不成功在 parkAndCheckInterrupt() 处 park ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantReadWriteLock%E5%8A%A0%E9%94%811.png)

-  这种状态下，假设又有 t3 r.lock，t4 w.lock，这期间 t1 仍然持有锁，就变成了下面的样子
  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantReadWriteLock%E5%8A%A0%E9%94%812.png)

#### 解锁原理

-  t1 w.unlock， 写锁解锁 

```java
public void unlock() {
    // 释放锁
    sync.release(1);
}
public final boolean release(int arg) {
    // 尝试释放锁
    if (tryRelease(arg)) {
        Node h = head;
        // 头节点不为空并且不是等待状态不是 0，唤醒后继的非取消节点
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
protected final boolean tryRelease(int releases) {
    if (!isHeldExclusively())
        throw new IllegalMonitorStateException();
    int nextc = getState() - releases;
    // 因为可重入的原因, 写锁计数为 0, 才算释放成功
    boolean free = exclusiveCount(nextc) == 0;
    if (free)
        setExclusiveOwnerThread(null);
    setState(nextc);
    return free;
}
```

-  唤醒流程 sync.unparkSuccessor，这时 t2 在 doAcquireShared 的 parkAndCheckInterrupt() 处恢复运行，继续循环，执行 tryAcquireShared 成功则让读锁计数加一 
-  接下来 t2 调用 setHeadAndPropagate(node, 1)，它原本所在节点被置为头节点；还会检查下一个节点是否是 shared，如果是则调用 doReleaseShared() 将 head 的状态从 -1 改为 0 并唤醒下一个节点，这时 t3 在 doAcquireShared 内 parkAndCheckInterrupt() 处恢复运行，**唤醒连续的所有的共享节点** 

```java
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head; 
    // 设置自己为 head 节点
    setHead(node);
    // propagate 表示有共享资源（例如共享读锁或信号量），为 0 就没有资源
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        // 获取下一个节点
        Node s = node.next;
        // 如果当前是最后一个节点，或者下一个节点是【等待共享读锁的节点】
        if (s == null || s.isShared())
            // 唤醒后继节点
            doReleaseShared();
    }
}
private void doReleaseShared() {
    // 如果 head.waitStatus == Node.SIGNAL ==> 0 成功, 下一个节点 unpark
	// 如果 head.waitStatus == 0 ==> Node.PROPAGATE
    for (;;) {
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // SIGNAL 唤醒后继
            if (ws == Node.SIGNAL) {
                // 因为读锁共享，如果其它线程也在释放读锁，那么需要将 waitStatus 先改为 0
            	// 防止 unparkSuccessor 被多次执行
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;  
                // 唤醒后继节点
                unparkSuccessor(h);
            }
            // 如果已经是 0 了，改为 -3，用来解决传播性
            else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;                
        }
        // 条件不成立说明被唤醒的节点非常积极，直接将自己设置为了新的 head，
        // 此时唤醒它的节点（前驱）执行 h == head 不成立，所以不会跳出循环，会继续唤醒新的 head 节点的后继节点
        if (h == head)                   
            break;
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ReentrantReadWriteLock%E8%A7%A3%E9%94%811.png)

-  下一个节点不是 shared 了，因此不会继续唤醒 t4 所在节点 
-  t2 读锁解锁，进入 sync.releaseShared(1) 中，调用 tryReleaseShared(1) 让计数减一，但计数还不为零，t3 同样让计数减一，计数为零，进入doReleaseShared() 将头节点从 -1 改为 0 并唤醒下一个节点 

```java
public void unlock() {
    sync.releaseShared(1);
}
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
protected final boolean tryReleaseShared(int unused) {

    for (;;) {
        int c = getState();
        int nextc = c - SHARED_UNIT;
        // 读锁的计数不会影响其它获取读锁线程, 但会影响其它获取写锁线程，计数为 0 才是真正释放
        if (compareAndSetState(c, nextc))
            // 返回是否已经完全释放了 
            return nextc == 0;
    }
}
```

-  t4 在 acquireQueued 中 parkAndCheckInterrupt 处恢复运行，再次 for (;;) 这次自己是头节点的临节点，并且没有其他节点竞争，tryAcquire(1) 成功，修改头结点，流程结束 ![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-ReentrantReadWriteLock解锁2.png)

### Stamped

StampedLock：读写锁，该类自 JDK 8 加入，是为了进一步优化读性能

特点：

-  在使用读锁、写锁时都必须配合戳使用 
-  StampedLock 不支持条件变量 
-  StampedLock **不支持重入** 

基本用法

-  加解读锁： 

```java
long stamp = lock.readLock();
lock.unlockRead(stamp);			// 类似于 unpark，解指定的锁
```

-  加解写锁： 

```java
long stamp = lock.writeLock();
lock.unlockWrite(stamp);
```

-  乐观读，StampedLock 支持 `tryOptimisticRead()` 方法，读取完毕后做一次**戳校验**，如果校验通过，表示这期间没有其他线程的写操作，数据可以安全使用，如果校验没通过，需要重新获取读锁，保证数据一致性 

```java
long stamp = lock.tryOptimisticRead();
// 验戳
if(!lock.validate(stamp)){
	// 锁升级
}
```

 提供一个数据容器类内部分别使用读锁保护数据的 read() 方法，写锁保护数据的 write() 方法：

- 读-读可以优化
- 读-写优化读，补加读锁

```java
public static void main(String[] args) throws InterruptedException {
    DataContainerStamped dataContainer = new DataContainerStamped(1);
    new Thread(() -> {
    	dataContainer.read(1000);
    },"t1").start();
    Thread.sleep(500);
    
    new Thread(() -> {
        dataContainer.write(1000);
    },"t2").start();
}

class DataContainerStamped {
    private int data;
    private final StampedLock lock = new StampedLock();

    public int read(int readTime) throws InterruptedException {
        long stamp = lock.tryOptimisticRead();
        System.out.println(new Date() + " optimistic read locking" + stamp);
        Thread.sleep(readTime);
        // 戳有效，直接返回数据
        if (lock.validate(stamp)) {
            Sout(new Date() + " optimistic read finish..." + stamp);
            return data;
        }

        // 说明其他线程更改了戳，需要锁升级了，从乐观读升级到读锁
        System.out.println(new Date() + " updating to read lock" + stamp);
        try {
            stamp = lock.readLock();
            System.out.println(new Date() + " read lock" + stamp);
            Thread.sleep(readTime);
            System.out.println(new Date() + " read finish..." + stamp);
            return data;
        } finally {
            System.out.println(new Date() + " read unlock " +  stamp);
            lock.unlockRead(stamp);
        }
    }

    public void write(int newData) {
        long stamp = lock.writeLock();
        System.out.println(new Date() + " write lock " + stamp);
        try {
            Thread.sleep(2000);
            this.data = newData;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            System.out.println(new Date() + " write unlock " + stamp);
            lock.unlockWrite(stamp);
        }
    }
}
```

## CountDown

### 基本使用

CountDownLatch：计数器，用来进行线程同步协作，**等待所有线程完成**

构造器：

- `public CountDownLatch(int count)`：初始化唤醒需要的 down 几步

常用API：

- `public void await()`：让当前线程等待，必须 down 完初始化的数字才可以被唤醒，否则进入无限等待
- `public void countDown()`：计数器进行减 1（down 1）

应用：同步等待多个 Rest 远程调用结束

```java
// LOL 10人进入游戏倒计时
public static void main(String[] args) throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(10);
    ExecutorService service = Executors.newFixedThreadPool(10);
    String[] all = new String[10];
    Random random = new Random();

    for (int j = 0; j < 10; j++) {
        int finalJ = j;//常量
        service.submit(() -> {
            for (int i = 0; i <= 100; i++) {
                Thread.sleep(random.nextInt(100));	//随机休眠
                all[finalJ] = i + "%";
                System.out.print("\r" + Arrays.toString(all));	// \r代表覆盖
            }
            latch.countDown();
        });
    }
    latch.await();
    System.out.println("\n游戏开始");
    service.shutdown();
}
/*
[100%, 100%, 100%, 100%, 100%, 100%, 100%, 100%, 100%, 100%]
游戏开始
```

### 实现原理

阻塞等待：

-  线程调用 await() 等待其他线程完成任务：支持打断 

```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
// AbstractQueuedSynchronizer#acquireSharedInterruptibly
public final void acquireSharedInterruptibly(int arg) throws InterruptedException {
    // 判断线程是否被打断，抛出打断异常
    if (Thread.interrupted())
        throw new InterruptedException();
    // 尝试获取共享锁，条件成立说明 state > 0，此时线程入队阻塞等待，等待其他线程获取共享资源
    // 条件不成立说明 state = 0，此时不需要阻塞线程，直接结束函数调用
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}
// CountDownLatch.Sync#tryAcquireShared
protected int tryAcquireShared(int acquires) {
    return (getState() == 0) ? 1 : -1;
}
```

-  线程进入 AbstractQueuedSynchronizer#doAcquireSharedInterruptibly 函数阻塞挂起，等待 latch 变为 0： 

```java
private void doAcquireSharedInterruptibly(int arg) throws InterruptedException {
    // 将调用latch.await()方法的线程 包装成 SHARED 类型的 node 加入到 AQS 的阻塞队列中
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        for (;;) {
            // 获取当前节点的前驱节点
            final Node p = node.predecessor();
            // 前驱节点时头节点就可以尝试获取锁
            if (p == head) {
                // 再次尝试获取锁，获取成功返回 1
                int r = tryAcquireShared(arg);
                if (r >= 0) {
                    // 获取锁成功，设置当前节点为 head 节点，并且向后传播
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    failed = false;
                    return;
                }
            }
            // 阻塞在这里
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                throw new InterruptedException();
        }
    } finally {
        // 阻塞线程被中断后抛出异常，进入取消节点的逻辑
        if (failed)
            cancelAcquire(node);
    }
}
```

-  获取共享锁成功，进入唤醒阻塞队列中与头节点相连的 SHARED 模式的节点： 

```java
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head;
    // 将当前节点设置为新的 head 节点，前驱节点和持有线程置为 null
    setHead(node);
	// propagate = 1，条件一成立
    if (propagate > 0 || h == null || h.waitStatus < 0 || (h = head) == null || h.waitStatus < 0) {
        // 获取当前节点的后继节点
        Node s = node.next;
        // 当前节点是尾节点时 next 为 null，或者后继节点是 SHARED 共享模式
        if (s == null || s.isShared())
            // 唤醒所有的等待共享锁的节点
            doReleaseShared();
    }
}
```

 计数减一：

-  线程进入 countDown() 完成计数器减一（释放锁）的操作 

```java
public void countDown() {
    sync.releaseShared(1);
}
public final boolean releaseShared(int arg) {
    // 尝试释放共享锁
    if (tryReleaseShared(arg)) {
        // 释放锁成功开始唤醒阻塞节点
        doReleaseShared();
        return true;
    }
    return false;
}
```

-  更新 state 值，每调用一次，state 值减一，当 state -1 正好为 0 时，返回 true 

```java
protected boolean tryReleaseShared(int releases) {
    for (;;) {
        int c = getState();
        // 条件成立说明前面【已经有线程触发唤醒操作】了，这里返回 false
        if (c == 0)
            return false;
        // 计数器减一
        int nextc = c-1;
        if (compareAndSetState(c, nextc))
            // 计数器为 0 时返回 true
            return nextc == 0;
    }
}
```

-  state = 0 时，当前线程需要执行**唤醒阻塞节点的任务** 

```java
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        // 判断队列是否是空队列
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            // 头节点的状态为 signal，说明后继节点没有被唤醒过
            if (ws == Node.SIGNAL) {
                // cas 设置头节点的状态为 0，设置失败继续自旋
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 唤醒后继节点
                unparkSuccessor(h);
            }
            // 如果有其他线程已经设置了头节点的状态，重新设置为 PROPAGATE 传播属性
            else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        // 条件不成立说明被唤醒的节点非常积极，直接将自己设置为了新的head，
        // 此时唤醒它的节点（前驱）执行 h == head 不成立，所以不会跳出循环，会继续唤醒新的 head 节点的后继节点
        if (h == head)
            break;
    }
}
```

## CyclicBarrier

### 基本使用

CyclicBarrier：循环屏障，用来进行线程协作，等待线程满足某个计数，才能触发自己执行

常用方法：

- `public CyclicBarrier(int parties, Runnable barrierAction)`：用于在线程到达屏障 parties 时，执行 barrierAction 

- parties：代表多少个线程到达屏障开始触发线程任务
- barrierAction：线程任务

- `public int await()`：线程调用 await 方法通知 CyclicBarrier 本线程已经到达屏障

与 CountDownLatch 的区别：CyclicBarrier 是可以重用的

应用：可以实现多线程中，某个任务在等待其他线程执行完毕以后触发

```java
public static void main(String[] args) {
    ExecutorService service = Executors.newFixedThreadPool(2);
    CyclicBarrier barrier = new CyclicBarrier(2, () -> {
        System.out.println("task1 task2 finish...");
    });

    for (int i = 0; i < 3; i++) { // 循环重用
        service.submit(() -> {
            System.out.println("task1 begin...");
            try {
                Thread.sleep(1000);
                barrier.await();    // 2 - 1 = 1
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });

        service.submit(() -> {
            System.out.println("task2 begin...");
            try {
                Thread.sleep(2000);
                barrier.await();    // 1 - 1 = 0
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });
    }
    service.shutdown();
}
```

### 实现原理

#### 成员属性

-  全局锁：利用可重入锁实现的工具类 

```java
// barrier 实现是依赖于Condition条件队列，condition 条件队列必须依赖lock才能使用
private final ReentrantLock lock = new ReentrantLock();
// 线程挂起实现使用的 condition 队列，当前代所有线程到位，这个条件队列内的线程才会被唤醒
private final Condition trip = lock.newCondition();
```

-  线程数量： 

```java
private final int parties;	// 代表多少个线程到达屏障开始触发线程任务
private int count;			// 表示当前“代”还有多少个线程未到位，初始值为 parties
```

-  当前代中最后一个线程到位后要执行的事件： 

```java
private final Runnable barrierCommand;
```

-  代： 

```java
// 表示 barrier 对象当前 代
private Generation generation = new Generation();
private static class Generation {
    // 表示当前“代”是否被打破，如果被打破再来到这一代的线程 就会直接抛出 BrokenException 异常
    // 且在这一代挂起的线程都会被唤醒，然后抛出 BrokerException 异常。
    boolean broken = false;
}
```

-  构造方法： 

```java
public CyclicBarrie(int parties, Runnable barrierAction) {
    // 因为小于等于 0 的 barrier 没有任何意义
    if (parties <= 0) throw new IllegalArgumentException();

    this.parties = parties;
    this.count = parties;
    // 可以为 null
    this.barrierCommand = barrierAction;
}
```

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-CyclicBarrier工作原理.png)

#### 成员方法

-  await()：阻塞等待所有线程到位 

```java
public int await() throws InterruptedException, BrokenBarrierException {
    try {
        return dowait(false, 0L);
    } catch (TimeoutException toe) {
        throw new Error(toe); // cannot happen
    }
}
// timed：表示当前调用await方法的线程是否指定了超时时长，如果 true 表示线程是响应超时的
// nanos：线程等待超时时长，单位是纳秒
private int dowait(boolean timed, long nanos) {
    final ReentrantLock lock = this.lock;
    // 加锁
    lock.lock();
    try {
        // 获取当前代
        final Generation g = generation;

        // 【如果当前代是已经被打破状态，则当前调用await方法的线程，直接抛出Broken异常】
        if (g.broken)
            throw new BrokenBarrierException();
		// 如果当前线程被中断了，则打破当前代，然后当前线程抛出中断异常
        if (Thread.interrupted()) {
            // 设置当前代的状态为 broken 状态，唤醒在 trip 条件队列内的线程
            breakBarrier();
            throw new InterruptedException();
        }

        // 逻辑到这说明，当前线程中断状态是 false， 当前代的 broken 为 false（未打破状态）
        
        // 假设 parties 给的是 5，那么index对应的值为 4,3,2,1,0
        int index = --count;
        // 条件成立说明当前线程是最后一个到达 barrier 的线程，【需要开启新代，唤醒阻塞线程】
        if (index == 0) {
            // 栅栏任务启动标记
            boolean ranAction = false;
            try {
                final Runnable command = barrierCommand;
                if (command != null)
                    // 启动触发的任务
                    command.run();
                // run()未抛出异常的话，启动标记设置为 true
                ranAction = true;
                // 开启新的一代，这里会【唤醒所有的阻塞队列】
                nextGeneration();
                // 返回 0 因为当前线程是此代最后一个到达的线程，index == 0
                return 0;
            } finally {
                // 如果 command.run() 执行抛出异常的话，会进入到这里
                if (!ranAction)
                    breakBarrier();
            }
        }

        // 自旋，一直到条件满足、当前代被打破、线程被中断，等待超时
        for (;;) {
            try {
                // 根据是否需要超时等待选择阻塞方法
                if (!timed)
                    // 当前线程释放掉 lock，【进入到 trip 条件队列的尾部挂起自己】，等待被唤醒
                    trip.await();
                else if (nanos > 0L)
                    nanos = trip.awaitNanos(nanos);
            } catch (InterruptedException ie) {
                // 被中断后来到这里的逻辑
                
                // 当前代没有变化并且没有被打破
                if (g == generation && !g.broken) {
                    // 打破屏障
                    breakBarrier();
                    // node 节点在【条件队列】内收到中断信号时 会抛出中断异常
                    throw ie;
                } else {
                    // 等待过程中代变化了，完成一次自我打断
                    Thread.currentThread().interrupt();
                }
            }
			// 唤醒后的线程，【判断当前代已经被打破，线程唤醒后依次抛出 BrokenBarrier 异常】
            if (g.broken)
                throw new BrokenBarrierException();

            // 当前线程挂起期间，最后一个线程到位了，然后触发了开启新的一代的逻辑
            if (g != generation)
                return index;
			// 当前线程 trip 中等待超时，然后主动转移到阻塞队列
            if (timed && nanos <= 0L) {
                breakBarrier();
                // 抛出超时异常
                throw new TimeoutException();
            }
        }
    } finally {
        // 解锁
        lock.unlock();
    }
}
```

-  breakBarrier()：打破 Barrier 屏障 

```java
private void breakBarrier() {
    // 将代中的 broken 设置为 true，表示这一代是被打破了，再来到这一代的线程，直接抛出异常
    generation.broken = true;
    // 重置 count 为 parties
    count = parties;
    // 将在trip条件队列内挂起的线程全部唤醒，唤醒后的线程会检查当前是否是打破的，然后抛出异常
    trip.signalAll();
}
```

-  nextGeneration()：开启新的下一代 

```java
private void nextGeneration() {
    // 将在 trip 条件队列内挂起的线程全部唤醒
    trip.signalAll();
    // 重置 count 为 parties
    count = parties;

    // 开启新的一代，使用一个新的generation对象，表示新的一代，新的一代和上一代【没有任何关系】
    generation = new Generation();
}
```

参考视频：https://space.bilibili.com/457326371/

## Semaphore

### 基本使用

synchronized 可以起到锁的作用，但某个时间段内，只能有一个线程允许执行

Semaphore（信号量）用来限制能同时访问共享资源的线程上限，非重入锁

构造方法：

- `public Semaphore(int permits)`：permits 表示许可线程的数量（state）
- `public Semaphore(int permits, boolean fair)`：fair 表示公平性，如果设为 true，下次执行的线程会是等待最久的线程

常用API：

- `public void acquire()`：表示获取许可
- `public void release()`：表示释放许可，acquire() 和 release() 方法之间的代码为同步代码

```java
public static void main(String[] args) {
    // 1.创建Semaphore对象
    Semaphore semaphore = new Semaphore(3);

    // 2. 10个线程同时运行
    for (int i = 0; i < 10; i++) {
        new Thread(() -> {
            try {
                // 3. 获取许可
                semaphore.acquire();
                sout(Thread.currentThread().getName() + " running...");
                Thread.sleep(1000);
                sout(Thread.currentThread().getName() + " end...");
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                // 4. 释放许可
                semaphore.release();
            }
        }).start();
    }
}
```

### 实现原理

加锁流程：

-  Semaphore 的 permits（state）为 3，这时 5 个线程来获取资源 

```java
Sync(int permits) {
    setState(permits);
}
```

假设其中 Thread-1，Thread-2，Thread-4 CAS 竞争成功，permits 变为 0，而 Thread-0 和 Thread-3 竞争失败，进入 AQS 队列park 阻塞 

```java
// acquire() -> sync.acquireSharedInterruptibly(1)，可中断
public final void acquireSharedInterruptibly(int arg) {
    if (Thread.interrupted())
        throw new InterruptedException();
    // 尝试获取通行证，获取成功返回 >= 0的值
    if (tryAcquireShared(arg) < 0)
        // 获取许可证失败，进入阻塞
        doAcquireSharedInterruptibly(arg);
}

// tryAcquireShared() -> nonfairTryAcquireShared()
// 非公平，公平锁会在循环内 hasQueuedPredecessors()方法判断阻塞队列是否有临头节点(第二个节点)
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        // 获取 state ，state 这里【表示通行证】
        int available = getState();
        // 计算当前线程获取通行证完成之后，通行证还剩余数量
        int remaining = available - acquires;
        // 如果许可已经用完, 返回负数, 表示获取失败,
        if (remaining < 0 ||
            // 许可证足够分配的，如果 cas 重试成功, 返回正数, 表示获取成功
            compareAndSetState(available, remaining))
            return remaining;
    }
}
private void doAcquireSharedInterruptibly(int arg) {
    // 将调用 Semaphore.aquire 方法的线程，包装成 node 加入到 AQS 的阻塞队列中
    final Node node = addWaiter(Node.SHARED);
    // 获取标记
    boolean failed = true;
    try {
        for (;;) {
            final Node p = node.predecessor();
            // 前驱节点是头节点可以再次获取许可
            if (p == head) {
                // 再次尝试获取许可，【返回剩余的许可证数量】
                int r = tryAcquireShared(arg);
                if (r >= 0) {
                    // 成功后本线程出队（AQS）, 所在 Node设置为 head
                    // r 表示【可用资源数】, 为 0 则不会继续传播
                    setHeadAndPropagate(node, r); 
                    p.next = null; // help GC
                    failed = false;
                    return;
                }
            }
            // 不成功, 设置上一个节点 waitStatus = Node.SIGNAL, 下轮进入 park 阻塞
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                throw new InterruptedException();
        }
    } finally {
        // 被打断后进入该逻辑
        if (failed)
            cancelAcquire(node);
    }
}
private void setHeadAndPropagate(Node node, int propagate) {    
    Node h = head;
    // 设置自己为 head 节点
    setHead(node);
    // propagate 表示有【共享资源】（例如共享读锁或信号量）
    // head waitStatus == Node.SIGNAL 或 Node.PROPAGATE，doReleaseShared 函数中设置的
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        // 如果是最后一个节点或者是等待共享读锁的节点，做一次唤醒
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-Semaphore%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A8%8B1.png)

-  这时 Thread-4 释放了 permits，状态如下 

```java
// release() -> releaseShared()
public final boolean releaseShared(int arg) {
    // 尝试释放锁
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }    
    return false;
}
protected final boolean tryReleaseShared(int releases) {    
    for (;;) {
        // 获取当前锁资源的可用许可证数量
        int current = getState();
        int next = current + releases;
        // 索引越界判断
        if (next < current)            
            throw new Error("Maximum permit count exceeded");        
        // 释放锁
        if (compareAndSetState(current, next))            
            return true;    
    }
}
private void doReleaseShared() {    
    // PROPAGATE 详解    
    // 如果 head.waitStatus == Node.SIGNAL ==> 0 成功, 下一个节点 unpark	
    // 如果 head.waitStatus == 0 ==> Node.PROPAGATE
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-Semaphore%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A8%8B2.png)

-  接下来 Thread-0 竞争成功，permits 再次设置为 0，设置自己为 head 节点，并且 unpark 接下来的共享状态的 Thread-3 节点，但由于 permits 是 0，因此 Thread-3 在尝试不成功后再次进入 park 状态 

### PROPAGATE

假设存在某次循环中队列里排队的结点情况为 `head(-1) → t1(-1) → t2(0)`，存在将要释放信号量的 T3 和 T4，释放顺序为先 T3 后 T4

```java
// 老版本代码
private void setHeadAndPropagate(Node node, int propagate) {    
    setHead(node);    
    // 有空闲资源    
    if (propagate > 0 && node.waitStatus != 0) {    	
        Node s = node.next;        
        // 下一个        
        if (s == null || s.isShared())            
            unparkSuccessor(node);        
    }
}
```

正常流程：

- T3 调用 releaseShared(1)，直接调用了 unparkSuccessor(head)，head.waitStatus 从 -1 变为 0
- T1 由于 T3 释放信号量被唤醒，然后 T4 释放，唤醒 T2

BUG 流程：

- T3 调用 releaseShared(1)，直接调用了 unparkSuccessor(head)，head.waitStatus 从 -1 变为 0
- T1 由于 T3 释放信号量被唤醒，调用 tryAcquireShared，返回值为 0（获取锁成功，但没有剩余资源量）
- T1 还没调用 setHeadAndPropagate 方法，T4 调用 releaseShared(1)，此时 head.waitStatus 为 0（此时读到的 head 和 1 中为同一个 head），不满足条件，因此不调用 unparkSuccessor(head)
- T1 获取信号量成功，调用 setHeadAndPropagate(t1.node, 0) 时，因为不满足 propagate > 0（剩余资源量 == 0），从而不会唤醒后继结点， **T2 线程得不到唤醒**

更新后流程：

-  T3 调用 releaseShared(1)，直接调用了 unparkSuccessor(head)，head.waitStatus 从 -1 变为 0 
-  T1 由于 T3 释放信号量被唤醒，调用 tryAcquireShared，返回值为 0（获取锁成功，但没有剩余资源量） 
-  T1 还没调用 setHeadAndPropagate 方法，T4 调用 releaseShared()，此时 head.waitStatus 为 0（此时读到的 head 和 1 中为同一个 head），调用 doReleaseShared() 将等待状态置为 **PROPAGATE（-3）** 
-  T1 获取信号量成功，调用 setHeadAndPropagate 时，读到 h.waitStatus < 0，从而调用 doReleaseShared() 唤醒 T2 

```java
private void setHeadAndPropagate(Node node, int propagate) {    
    Node h = head;
    // 设置自己为 head 节点
    setHead(node);
    // propagate 表示有共享资源（例如共享读锁或信号量）
    // head waitStatus == Node.SIGNAL 或 Node.PROPAGATE
    if (propagate > 0 || h == null || h.waitStatus < 0 ||
        (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        // 如果是最后一个节点或者是等待共享读锁的节点，做一次唤醒
        if (s == null || s.isShared())
            doReleaseShared();
    }
}
// 唤醒
private void doReleaseShared() {
    // 如果 head.waitStatus == Node.SIGNAL ==> 0 成功, 下一个节点 unpark	
    // 如果 head.waitStatus == 0 ==> Node.PROPAGATE    
    for (;;) {
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            if (ws == Node.SIGNAL) {
                // 防止 unparkSuccessor 被多次执行
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;
                // 唤醒后继节点
                unparkSuccessor(h);
            }
            // 如果已经是 0 了，改为 -3，用来解决传播性
            else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;
        }
        if (h == head)
            break;
    }
}
```

## Exchanger

Exchanger：交换器，是一个用于线程间协作的工具类，用于进行线程间的数据交换

工作流程：两个线程通过 exchange 方法交换数据，如果第一个线程先执行 exchange() 方法，它会一直等待第二个线程也执行 exchange 方法，当两个线程都到达同步点时，这两个线程就可以交换数据

常用方法：

- `public Exchanger()`：创建一个新的交换器
- `public V exchange(V x)`：等待另一个线程到达此交换点
- `public V exchange(V x, long timeout, TimeUnit unit)`：等待一定的时间

```java
public class ExchangerDemo {
    public static void main(String[] args) {
        // 创建交换对象（信使）
        Exchanger\<String\> exchanger = new Exchanger\<\>();
        new ThreadA(exchanger).start();
        new ThreadB(exchanger).start();
    } 
}
class ThreadA extends Thread{
    private Exchanger\<String\> exchanger();
    
    public ThreadA(Exchanger\<String\> exchanger){
        this.exchanger = exchanger;
    }
    
    @Override
    public void run() {
        try{
            sout("线程A，做好了礼物A，等待线程B送来的礼物B");
            //如果等待了5s还没有交换就死亡（抛出异常）！
            String s = exchanger.exchange("礼物A",5,TimeUnit.SECONDS);
            sout("线程A收到线程B的礼物：" + s);
        } catch (Exception e) {
            System.out.println("线程A等待了5s，没有收到礼物,最终就执行结束了!");
        }
    }
}
class ThreadB extends Thread{
    private Exchanger\<String\> exchanger;
    
    public ThreadB(Exchanger\<String\> exchanger) {
        this.exchanger = exchanger;
    }
    
    @Override
    public void run() {
        try {
            sout("线程B,做好了礼物B,等待线程A送来的礼物A.....");
            // 开始交换礼物。参数是送给其他线程的礼物!
            sout("线程B收到线程A的礼物：" + exchanger.exchange("礼物B"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```