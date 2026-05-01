---
order: 5
title: 可打断
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 可打断

## 基本使用

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

## 实现原理

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
