---
order: 2
title: '使用Redisson'
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

# 使用Redisson

1. 导入依赖

   ```xml
   <!-- https://mvnrepository.com/artifact/org.redisson/redisson-spring-boot-starter -->
   <dependency>
       <groupId>org.redisson</groupId>
       <artifactId>redisson-spring-boot-starter</artifactId>
       <version>3.15.6</version>
   </dependency>
   ```

2. 配置redisson.yml

   ```yaml
   singleServerConfig:
       idleConnectionTimeout: 10000
       #pingTimeout: 1000
       connectTimeout: 10000
       timeout: 3000
       retryAttempts: 3
       retryInterval: 1500
       #reconnectionTimeout: 3000
       #failedAttempts: 3
       password: root
       subscriptionsPerConnection: 5
       clientName: null
       address: "redis://192.168.190.138:6379"
       subscriptionConnectionMinimumIdleSize: 1
       subscriptionConnectionPoolSize: 50
       connectionMinimumIdleSize: 32
       connectionPoolSize: 64
       database: 0
       #dnsMonitoring: false
       dnsMonitoringInterval: 5000
   threads: 0
   nettyThreads: 0
   codec: !<org.redisson.codec.JsonJacksonCodec> {}
   transportMode : "NIO"
   ```

3. 添加配置类

   ```java
   package com.du.config;
   
   import org.redisson.Redisson;
   import org.redisson.api.RedissonClient;
   import org.redisson.config.Config;
   import org.springframework.context.annotation.Bean;
   import org.springframework.context.annotation.Configuration;
   import org.springframework.core.io.ClassPathResource;
   
   import java.io.IOException;
   
   /**
    * @author mozzie
    */
   @Configuration
   public class RedissonConfig {
   
       @Bean(destroyMethod="shutdown")
       public RedissonClient redisson() throws IOException {
           //两种方式
           //1、导入YAML文件
           RedissonClient redisson = Redisson.create(
                   Config.fromYAML(new ClassPathResource("redisson-single.yml").getInputStream()));
           return redisson;
           
           //2、创建Config类，配置参数
           Config config = new Config();
           config.useSingleServer()
                   .setAddress("redis://192.168.190.140:6379")
                   .setDatabase(0)
                   .setPassword("root");
           config.setLockWatchdogTimeout(15000);
           return Redisson.create(config);
       }
   }
   ```

4. 测试

   ```java
   @Autowired
   RedissonClient redissonClient;
   
   @PostMapping("/redissonlock")
   public String redissonlock(@RequestParam String name) {
   
       // 加锁，添加key
       String lock = name + "-lock";
       RLock rLock = redissonClient.getLock(lock);
   
       try {
           rLock.lock();
           int apple = Integer.parseInt(Objects.requireNonNull(stringRedisTemplate.opsForValue().get(name)));
           if (apple > 0) {
               apple--;
               System.out.println("---------扣减成功，" + name + "库存：" + apple);
               stringRedisTemplate.opsForValue().set("apple", String.valueOf(apple));
           } else {
               System.out.println("---------库存不足，扣减失败");
           }
       } finally {
           // 解锁，删除key
           rLock.unlock();
       }
       return "";
   }
   ```

## watchdog

**看门狗，redisson不指定leaseTime，默认创建一个30秒的看门狗。**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210629093557825.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210629211950555.png)

**核心源码**

```java
// 直接使用lock无参数方法
public void lock() {
    try {
        lock(-1, null, false);
    } catch (InterruptedException e) {
        throw new IllegalStateException();
    }
}

// 进入该方法 其中leaseTime = -1
private void lock(long leaseTime, TimeUnit unit, boolean interruptibly) throws InterruptedException {
    long threadId = Thread.currentThread().getId();
    Long ttl = tryAcquire(-1, leaseTime, unit, threadId);
    // lock acquired
    if (ttl == null) {
        return;
    }

   //...
}

// 进入 tryAcquire(-1, leaseTime, unit, threadId)
private Long tryAcquire(long waitTime, long leaseTime, TimeUnit unit, long threadId) {
    return get(tryAcquireAsync(waitTime, leaseTime, unit, threadId));
}

// 进入 tryAcquireAsync
private <T> RFuture<Long> tryAcquireAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId) {
    if (leaseTime != -1) {
        return tryLockInnerAsync(waitTime, leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
    }
    //当leaseTime = -1 时 启动 watch dog机制
    RFuture<Long> ttlRemainingFuture = tryLockInnerAsync(waitTime,
                                            commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout(),
                                            TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);
    //执行完lua脚本后的回调
    ttlRemainingFuture.onComplete((ttlRemaining, e) -> {
        if (e != null) {
            return;
        }

        if (ttlRemaining == null) {
            // watch dog 
            scheduleExpirationRenewal(threadId);
        }
    });
    return ttlRemainingFuture;
}
```

scheduleExpirationRenewal 方法开启监控：

```java
private void scheduleExpirationRenewal(long threadId) {
    ExpirationEntry entry = new ExpirationEntry();
    //将线程放入缓存中
    ExpirationEntry oldEntry = EXPIRATION_RENEWAL_MAP.putIfAbsent(getEntryName(), entry);
    //第二次获得锁后 不会进行延期操作
    if (oldEntry != null) {
        oldEntry.addThreadId(threadId);
    } else {
        entry.addThreadId(threadId);
        
        // 第一次获得锁 延期操作
        renewExpiration();
    }
}

// 进入 renewExpiration()
private void renewExpiration() {
    ExpirationEntry ee = EXPIRATION_RENEWAL_MAP.get(getEntryName());
    //如果缓存不存在，那不再锁续期
    if (ee == null) {
        return;
    }
    
    Timeout task = commandExecutor.getConnectionManager().newTimeout(new TimerTask() {
        @Override
        public void run(Timeout timeout) throws Exception {
            ExpirationEntry ent = EXPIRATION_RENEWAL_MAP.get(getEntryName());
            if (ent == null) {
                return;
            }
            Long threadId = ent.getFirstThreadId();
            if (threadId == null) {
                return;
            }
            
            //执行lua 进行续期
            RFuture<Boolean> future = renewExpirationAsync(threadId);
            future.onComplete((res, e) -> {
                if (e != null) {
                    log.error("Can't update lock " + getName() + " expiration", e);
                    return;
                }
                
                if (res) {
                    //延期成功，继续循环操作
                    renewExpiration();
                }
            });
        }
        //每隔internalLockLeaseTime/3=10秒检查一次
    }, internalLockLeaseTime / 3, TimeUnit.MILLISECONDS);
    
    ee.setTimeout(task);
}

//lua脚本 执行包装好的lua脚本进行key续期
protected RFuture<Boolean> renewExpirationAsync(long threadId) {
    return evalWriteAsync(getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return 1; " +
                    "end; " +
                    "return 0;",
            Collections.singletonList(getName()),
            internalLockLeaseTime, getLockName(threadId));
}
```

### 结论：

1.  watch dog 在当前节点存活时每10s给分布式锁的key续期 30s；
2.  watch dog 机制启动，且代码中没有释放锁操作时，watch dog 会不断的给锁续期；
3.  从可2得出，如果程序释放锁操作时因为异常没有被执行，那么锁无法被释放，所以释放锁操作一定要放到 finally {} 中；

看到3的时候，可能会有人有疑问，如果释放锁操作本身异常了，watch dog 不会继续续期

```java
// 锁释放
public void unlock() {
    try {
        get(unlockAsync(Thread.currentThread().getId()));
    } catch (RedisException e) {
        if (e.getCause() instanceof IllegalMonitorStateException) {
            throw (IllegalMonitorStateException) e.getCause();
        } else {
            throw e;
        }
    }
}

// 进入 unlockAsync(Thread.currentThread().getId()) 方法 入参是当前线程的id
public RFuture<Void> unlockAsync(long threadId) {
    RPromise<Void> result = new RedissonPromise<Void>();
    //执行lua脚本 删除key
    RFuture<Boolean> future = unlockInnerAsync(threadId);

    future.onComplete((opStatus, e) -> {
        // 无论执行lua脚本是否成功 执行cancelExpirationRenewal(threadId) 方法来删除EXPIRATION_RENEWAL_MAP中的缓存
        cancelExpirationRenewal(threadId);

        if (e != null) {
            result.tryFailure(e);
            return;
        }

        if (opStatus == null) {
            IllegalMonitorStateException cause = new IllegalMonitorStateException("attempt to unlock lock, not locked by current thread by node id: "
                    + id + " thread-id: " + threadId);
            result.tryFailure(cause);
            return;
        }

        result.trySuccess(null);
    });

    return result;
}

// 此方法会停止 watch dog 机制
void cancelExpirationRenewal(Long threadId) {
    ExpirationEntry task = EXPIRATION_RENEWAL_MAP.get(getEntryName());
    if (task == null) {
        return;
    }
    
    if (threadId != null) {
        task.removeThreadId(threadId);
    }

    if (threadId == null || task.hasNoThreads()) {
        Timeout timeout = task.getTimeout();
        if (timeout != null) {
            timeout.cancel();
        }
        EXPIRATION_RENEWAL_MAP.remove(getEntryName());
    }
}
```

释放锁的操作中 有一步操作是从 EXPIRATION_RENEWAL_MAP 中获取 ExpirationEntry 对象，然后将其remove，结合watch dog中的续期前的判断：

```
EXPIRATION_RENEWAL_MAP.get(getEntryName());
if (ent == null) {
    return;
}
```

可以得出结论：

如果释放锁操作本身异常了，watch dog 还会不停的续期吗？不会，因为无论释放锁操作是否成功，EXPIRATION_RENEWAL_MAP中的目标 ExpirationEntry 对象已经被移除了，watch dog 通过判断后就不会继续给锁续期了。
