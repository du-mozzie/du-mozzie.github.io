---
order: 6
title: 锁超时
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 锁超时

## 基本使用

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

## 实现原理

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

## 哲学家就餐

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
