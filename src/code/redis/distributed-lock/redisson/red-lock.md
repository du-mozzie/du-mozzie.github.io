---
order: 10
title: '4. 红锁（RedLock）'
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

# 4. 红锁（RedLock）

Redisson的RedissonRedLock对象实现了[Redlock](https://link.jianshu.com?t=http://redis.cn/topics/distlock.html)介绍的加锁算法。该对象也可以用来将多个RLock
 对象关联为一个红锁，每个RLock对象实例可以来自于不同的Redisson实例。

```java
    public void testRedLock(RedissonClient redisson1,
                              RedissonClient redisson2, RedissonClient redisson3){

        RLock lock1 = redisson1.getLock("lock1");
        RLock lock2 = redisson2.getLock("lock2");
        RLock lock3 = redisson3.getLock("lock3");

        RedissonRedLock lock = new RedissonRedLock(lock1, lock2, lock3);
      try {
            // 同时加锁：lock1 lock2 lock3, 红锁在大部分节点上加锁成功就算成功。
            lock.lock();

            // 尝试加锁，最多等待100秒，上锁以后10秒自动解锁
            boolean res = lock.tryLock(100, 10, TimeUnit.SECONDS);

        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }

    }
```
