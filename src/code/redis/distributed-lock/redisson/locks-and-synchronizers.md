---
order: 5
title: '分布式锁和同步器'
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

# 分布式锁和同步器

如果负责存储分布式锁的Redisson节点宕机以后，而且这个锁正好处于锁住的状态，这时便会出现死锁。为了避免发生这种状况，提供了

一个看门狗，它的作用是在Redisson实例被关闭之前，不断延长锁的有效期。默认情况下，看门狗的检查锁的超时时间是30秒钟。

分布式锁种类有：可重入锁（Reentrant Lock）、公平锁、联锁（MultiLock）、红锁（RedLock）、 读写锁、信号量（Semaphore）、

可过期性信号量（PermitExpirableSemaphore）、闭锁（CountDownLatch）

```csharp
public class LockExamples {

    public static void main(String[] args) throws InterruptedException {
        // connects to 127.0.0.1:6379 by default
        RedissonClient redisson = Redisson.create();
        
        RLock lock = redisson.getLock("lock");
        lock.lock(2, TimeUnit.SECONDS);

        Thread t = new Thread() {
            public void run() {
                RLock lock1 = redisson.getLock("lock");
                lock1.lock();
                lock1.unlock();
            };
        };

        t.start();
        t.join();

        lock.unlock();
        
        redisson.shutdown();
    }
    
}
```

红锁

```csharp
public class RedLockExamples {

    public static void main(String[] args) throws InterruptedException {
        // connects to 127.0.0.1:6379 by default
        RedissonClient client1 = Redisson.create();
        RedissonClient client2 = Redisson.create();
        
        RLock lock1 = client1.getLock("lock1");
        RLock lock2 = client1.getLock("lock2");
        RLock lock3 = client2.getLock("lock3");
        
        Thread t1 = new Thread() {
            public void run() {
                lock3.lock();
            };
        };
        t1.start();
        t1.join();
        
        Thread t = new Thread() {
            public void run() {
                RedissonMultiLock lock = new RedissonRedLock(lock1, lock2, lock3);
                lock.lock();
                
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                }
                lock.unlock();
            };
        };
        t.start();
        t.join(1000);

        lock3.forceUnlock();
        
        RedissonMultiLock lock = new RedissonRedLock(lock1, lock2, lock3);
        lock.lock();
        lock.unlock();

        client1.shutdown();
        client2.shutdown();
    }
    
}
```
