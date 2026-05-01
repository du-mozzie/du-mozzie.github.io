---
order: 4
title: 可重入
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 可重入

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
