---
order: 7
title: 条件变量
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 条件变量

## 基本使用

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

## 实现原理

## await

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

## signal

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
