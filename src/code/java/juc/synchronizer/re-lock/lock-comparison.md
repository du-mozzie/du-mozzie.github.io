---
order: 1
title: 锁对比
date: 2021-05-18
category: Java
tag: Java
timeline: true
article: true
---

# 锁对比

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
