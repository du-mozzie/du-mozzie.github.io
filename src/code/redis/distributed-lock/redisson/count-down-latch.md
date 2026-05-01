---
order: 14
title: '8. 闭锁（CountDownLatch）'
date: 2022-02-09
category: 
    - Redis
    - 分布式
    - Redisson
tag: 
    - Redis
    - 分布式
    - Redisson
timeline: true
article: true
---

# 8. 闭锁（CountDownLatch）

Redisson的分布式闭锁（CountDownLatch）Java对象RCountDownLatch采用了与java.util.concurrent.CountDownLatch相似的接口和用法。

```java
RCountDownLatch latch = redisson.getCountDownLatch("anyCountDownLatch");
latch.trySetCount(1);
latch.await();

// 在其他线程或其他JVM里
RCountDownLatch latch = redisson.getCountDownLatch("anyCountDownLatch");
latch.countDown();
```
