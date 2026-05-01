---
order: 2
title: 使用锁
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 使用锁

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
