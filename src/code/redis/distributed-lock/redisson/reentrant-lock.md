---
order: 7
title: '1. 可重入锁（Reentrant Lock）'
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

# 1. 可重入锁（Reentrant Lock）

Redisson的分布式可重入锁RLock Java对象实现了java.util.concurrent.locks.Lock接口，同时还支持自动过期解锁。

```java
public void testReentrantLock(RedissonClient redisson){

        RLock lock = redisson.getLock("anyLock");
        try{
            // 1. 最常见的使用方法
            //lock.lock();

            // 2. 支持过期解锁功能,10秒钟以后自动解锁, 无需调用unlock方法手动解锁
            //lock.lock(10, TimeUnit.SECONDS);

            // 3. 尝试加锁，最多等待3秒，上锁以后10秒自动解锁
            boolean res = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if(res){    //成功
                // do your business

            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }

    }
```

Redisson同时还为分布式锁提供了异步执行的相关方法：

```java
public void testAsyncReentrantLock(RedissonClient redisson){
        RLock lock = redisson.getLock("anyLock");
        try{
            lock.lockAsync();
            lock.lockAsync(10, TimeUnit.SECONDS);
            Future<Boolean> res = lock.tryLockAsync(3, 10, TimeUnit.SECONDS);

            if(res.get()){
                // do your business

            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }

    }
```
