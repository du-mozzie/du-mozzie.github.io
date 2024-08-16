---
order: 6
title: Redis分布式锁
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

Redis分布式锁是一种在分布式系统中控制共享资源访问的同步机制，利用Redis的原子操作确保并发安全。

Redission是Redis的Java客户端，它提供了更高级的特性，包括基于Redis实现的高性能分布式锁服务，支持公平锁、联锁等多种锁模式，增强了分布式环境下的并发控制能力。

## 原生

使用redis中的setnx API，当key存在时不能设置value

1. 配置环境

   ```yaml
   server:
       port: 8080
   spring:
       redis:
           host: 192.168.190.137
           port: 6379
           database: 0
           timeout: 6000
           password: root
       cache:
           type: redis
   ```

   开启缓存

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210626170623784.png)

2. Controller层加锁，使用StringRedisTemplate

## Redisson框架

[Github文档](https://github.com/redisson/redisson/wiki/Table-of-Content)

[官网](https://redisson.org/)

### Redisson是什么？

Redisson是Redis服务器上的分布式可伸缩Java数据结构----驻内存数据网格(In-Memory Data Grid，IMDG)。底层使用netty框架，并

提供了与java对象相对应的分布式对象、分布式集合、分布式锁和同步器、分布式服务等一系列的Redisson的分布式对象。

### 使用Redisson

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
    * @author Du
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

#### watchdog

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

##### 结论：

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

### 分布式对象

每一个Redisson对象都有一个Redis数据实例相对应。

1. 通用对象桶

   Redisson分布式对象RBucket，可以存放任意类型对象

2. 二进制流

   Redisson分布式对象RBinaryStream，InputStream和OutoutStream接口实现

3. 地理空间对象桶

   Reddisson分布式RGo，储存于地理位置有关的对象桶

4. BitSet

   Reddisson分布式RBitSet，是分布式的可伸缩位向量通过实现RClusteredBitSet接口，可以在集群环境下数据分片

5. 布隆过滤器

   Reddisson利用Redis实现了java分布式的布隆过滤器RBloomFilter

   ```java
   public class BloomFilterExamples {
   
       public static void main(String[] args) {
           // connects to 127.0.0.1:6379 by default
           RedissonClient redisson = Redisson.create();
   
           RBloomFilter<String> bloomFilter = redisson.getBloomFilter("bloomFilter");
           bloomFilter.tryInit(100_000_000, 0.03);
           
           bloomFilter.add("a");
           bloomFilter.add("b");
           bloomFilter.add("c");
           bloomFilter.add("d");
           
           bloomFilter.getExpectedInsertions();
           bloomFilter.getFalseProbability();
           bloomFilter.getHashIterations();
           
           bloomFilter.contains("a");
           
           bloomFilter.count();
           
           redisson.shutdown();
       }
       
   }
   ```

   实现RClusteredBloomFilter接口，可以分片。通过压缩未使用的比特位来释放集群内存空间

6. 基数估计算法(RHyperLogLog)

   可以在有限的空间通过概率算法统计大量数据

7. 限流器（RRateLimiter ）

   可以用来在分布式环境下限制请求方的调用频率。适用于不同或相同的Reddisson实例的多线程限流。并不保证公平性

   ```java
   public class RateLimiterExamples {
   
       public static void main(String[] args) throws InterruptedException {
           // connects to 127.0.0.1:6379 by default
           RedissonClient redisson = Redisson.create();
   
           RRateLimiter limiter = redisson.getRateLimiter("myLimiter");
           // one permit per 2 seconds
           limiter.trySetRate(RateType.OVERALL, 1, 2, RateIntervalUnit.SECONDS);
           
           CountDownLatch latch = new CountDownLatch(2);
           limiter.acquire(1);
           latch.countDown();
   
           Thread t = new Thread(() -> {
               limiter.acquire(1);
               
               latch.countDown();
           });
           t.start();
           t.join();
           
           latch.await();
           
           redisson.shutdown();
       }
       
   }
   ```

8. 及原子整长形（RAtomicLong ）、原子双精度浮点（RAtomicDouble ）、话题(订阅分发)（RTopic ）、整长型累加器（RLongAdder ）、双精度浮点累加器（RLongDouble ）等分布式对象

### 分布式集合

在Redis分布式的集合元素与java对象相对应。包括：映射、多值映射(Multimap)、集(Set)、有序集(SortedSet)、计分排序集

(ScoredSortedSet)、字典排序集(LexSortedSet)、列表(List)、队列(Queue)、双端队列(Deque)、阻塞队列(Blocking Queue)

##### 映射（RMap）

映射类型按照特性主要分为三类：元素淘汰、本地缓存、数据分片。

1. 元素淘汰(Eviction)类：对映射中每个元素单独设置有效时间和最长闲置时间。保留了元素的插入顺序。不支持散列(hash)的元素

   淘汰，过期元素通过EvictionScheduler实例定期清理。实现类RMapCache

2. 本地缓存(LocalCache)类：本地缓存也叫就近缓存，主要用在特定场景下。映射缓存上的高度频繁的读取操作，使网络通信被视

   为瓶颈的情况下。较分布式映射提高45倍。实现类RLocalCachedMap

3. 数据分片(Sharding)：利用分库的原理，将单一映射结构切分若干，并均匀分布在集群的各个槽里。可以突破Redis自身的容量限

   制，可以随集群的扩大而增长，也可以使读写性能和元素淘汰能力随之线性增长。主要实现类RClusteredMap

当然还有其他类型，比如映射监听器、LRU有界映射

映射监听器：监听元素的添加(EntryCreatedListener)、过期、删除、更新事件

LRU有界映射：根据时间排序，超过容量限制的元素会被删除

```cpp
public class MapExamples {

    public static void main(String[] args) throws IOException {
        // connects to 127.0.0.1:6379 by default
        RedissonClient redisson = Redisson.create();
        
        RMap<String, Integer> map =  redisson.getMap("myMap");
        map.put("a", 1);
        map.put("b", 2);
        map.put("c", 3);
        
        boolean contains = map.containsKey("a");
        
        Integer value = map.get("c");
        Integer updatedValue = map.addAndGet("a", 32);
        
        Integer valueSize = map.valueSize("c");
        
        Set<String> keys = new HashSet<String>();
        keys.add("a");
        keys.add("b");
        keys.add("c");
        Map<String, Integer> mapSlice = map.getAll(keys);
        
        // use read* methods to fetch all objects
        Set<String> allKeys = map.readAllKeySet();
        Collection<Integer> allValues = map.readAllValues();
        Set<Entry<String, Integer>> allEntries = map.readAllEntrySet();
        
        // use fast* methods when previous value is not required
        boolean isNewKey = map.fastPut("a", 100);
        boolean isNewKeyPut = map.fastPutIfAbsent("d", 33);
        long removedAmount = map.fastRemove("b");
        
        redisson.shutdown();
    }
    
}
```

##### 映射持久化方式(缓存策略)

将映射中的数据持久化到外部存储服务的功能

主要场景：

1.  作为业务和外部存储媒介之间的缓存
2.  用来增加数据的持久性、增加已被驱逐的数据的寿命
3.  用来缓存数据库、web服务或其他数据源的数据

Read-through策略：如果在映射中不存在，则通过Maploader对象加载

Write-through策略(数据同步写入)：对映射数据的更改则会通过MapWriter写入到外部存储系统，然后更新redis里面的数据

Write-behind策略(数据异步写入)：对映射数据的更改先写到redis，然后使用异步方式写入到外部存储

### 分布式锁和同步器

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

### 分布式服务

分布式服务包括分布式远程服务(RRemoteService )、分布式实时对象服务(RLiveObjectService )、分布式执行服务(RExecutorService )、分布式调度任务服务(RScheduledExecutorService )、分布式映射归纳服务(MapReduce)

1.  分布式远程服务：实现了java的RPC远程调用，可以通过共享接口执行另一个Redisson实例里的对象方法。
2.  分布式实时对象(RLO)：使用生成的代理类，将一个指定的普通java类的所有字段以及这些字段的操作(get set方法)全部映射到一个Redis Hash的数据结构。get和set方法被转义为hget和hset命令，从而使所有连接到同一个redis节点的客户端同时对一个指定对象操作。通过将这些值保存在一个像redis这样的远程共享的空间的过程，把这个对象强化成一个分布式对象。这个对象就叫RLO。RLO使用方法：通过一系列注解@REntity(必选，类)、@RId(必选、主键字段)、@RIndex、@RObjectField、@RCascade(级联操作)
3.  分布式执行服务：执行任务及取消任务

```java
public class ExecutorServiceExamples {

    public static class RunnableTask implements Runnable, Serializable {

        @RInject
        RedissonClient redisson;

        @Override
        public void run() {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("5", "11");
        }
        
    }
    
    public static class CallableTask implements Callable<String>, Serializable {

        @RInject
        RedissonClient redisson;
        
        @Override
        public String call() throws Exception {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("1", "2");
            return map.get("3");
        }

    }
    
    public static void main(String[] args) {
        Config config = new Config();
        config.useClusterServers()
            .addNodeAddress("127.0.0.1:7001", "127.0.0.1:7002", "127.0.0.1:7003");
        
        RedissonClient redisson = Redisson.create(config);

        RedissonNodeConfig nodeConfig = new RedissonNodeConfig(config);
        nodeConfig.setExecutorServiceWorkers(Collections.singletonMap("myExecutor", 1));
        RedissonNode node = RedissonNode.create(nodeConfig);
        node.start();

        RExecutorService e = redisson.getExecutorService("myExecutor");
        e.execute(new RunnableTask());
        e.submit(new CallableTask());
        
        e.shutdown();
        node.shutdown();
    }
    
}
```

4、分布式调度任务服务：对计划任务的设定(可以通过CRON表达式)及去掉计划任务

```java
public class SchedulerServiceExamples {

    public static class RunnableTask implements Runnable, Serializable {

        @RInject
        RedissonClient redisson;

        @Override
        public void run() {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("5", "11");
        }
        
    }
    
    public static class CallableTask implements Callable<String>, Serializable {

        @RInject
        RedissonClient redisson;
        
        @Override
        public String call() throws Exception {
            RMap<String, String> map = redisson.getMap("myMap");
            map.put("1", "2");
            return map.get("3");
        }

    }
    
    public static void main(String[] args) {
        Config config = new Config();
        config.useClusterServers()
            .addNodeAddress("127.0.0.1:7001", "127.0.0.1:7002", "127.0.0.1:7003");
        
        RedissonClient redisson = Redisson.create(config);

        RedissonNodeConfig nodeConfig = new RedissonNodeConfig(config);
        nodeConfig.setExecutorServiceWorkers(Collections.singletonMap("myExecutor", 5));
        RedissonNode node = RedissonNode.create(nodeConfig);
        node.start();

        RScheduledExecutorService e = redisson.getExecutorService("myExecutor");
        e.schedule(new RunnableTask(), 10, TimeUnit.SECONDS);
        e.schedule(new CallableTask(), 4, TimeUnit.MINUTES);

        e.schedule(new RunnableTask(), CronSchedule.of("10 0/5 * * * ?"));
        e.schedule(new RunnableTask(), CronSchedule.dailyAtHourAndMinute(10, 5));
        e.schedule(new RunnableTask(), CronSchedule.weeklyOnDayAndHourAndMinute(12, 4, Calendar.MONDAY, Calendar.FRIDAY));
        
        e.shutdown();
        node.shutdown();
    }
    
}
```

5、分布式映射归纳服务：通过映射归纳处理存储在Redis环境里的大量数据。示例代码单词统计

### Redisson实现的锁

#### 1. 可重入锁（Reentrant Lock）

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

#### 2. 公平锁（Fair Lock）

Redisson分布式可重入公平锁也是实现了java.util.concurrent.locks.Lock接口的一种RLock对象。在提供了自动过期解锁功能的同时，保证了当多个Redisson客户端线程同时请求加锁时，优先分配给先发出请求的线程。

```java
public void testFairLock(RedissonClient redisson){

    RLock fairLock = redisson.getFairLock("anyLock");
    try{
        // 最常见的使用方法
        fairLock.lock();

        // 支持过期解锁功能, 10秒钟以后自动解锁,无需调用unlock方法手动解锁
        fairLock.lock(10, TimeUnit.SECONDS);

        // 尝试加锁，最多等待100秒，上锁以后10秒自动解锁
        boolean res = fairLock.tryLock(100, 10, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
        e.printStackTrace();
    } finally {
        fairLock.unlock();
    }

}
```

Redisson同时还为分布式可重入公平锁提供了异步执行的相关方法：

```java
RLock fairLock = redisson.getFairLock("anyLock");
fairLock.lockAsync();
fairLock.lockAsync(10, TimeUnit.SECONDS);
Future<Boolean> res = fairLock.tryLockAsync(100, 10, TimeUnit.SECONDS);
```

#### 3. 联锁（MultiLock）

Redisson的RedissonMultiLock对象可以将多个RLock对象关联为一个联锁，每个RLock对象实例可以来自于不同的Redisson实例。

```java
public void testMultiLock(RedissonClient redisson1,
                              RedissonClient redisson2, RedissonClient redisson3){

        RLock lock1 = redisson1.getLock("lock1");
        RLock lock2 = redisson2.getLock("lock2");
        RLock lock3 = redisson3.getLock("lock3");

        RedissonMultiLock lock = new RedissonMultiLock(lock1, lock2, lock3);

        try {
            // 同时加锁：lock1 lock2 lock3, 所有的锁都上锁成功才算成功。
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

#### 4. 红锁（RedLock）

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

#### 5. 读写锁（ReadWriteLock）

Redisson的分布式可重入读写锁RReadWriteLock Java对象实现了java.util.concurrent.locks.ReadWriteLock接口。同时还支持自动过期解锁。该对象允许同时有多个读取锁，但是最多只能有一个写入锁。

```java
RReadWriteLock rwlock = redisson.getLock("anyRWLock");
// 最常见的使用方法
rwlock.readLock().lock();
// 或
rwlock.writeLock().lock();

// 支持过期解锁功能
// 10秒钟以后自动解锁
// 无需调用unlock方法手动解锁
rwlock.readLock().lock(10, TimeUnit.SECONDS);
// 或
rwlock.writeLock().lock(10, TimeUnit.SECONDS);

// 尝试加锁，最多等待100秒，上锁以后10秒自动解锁
boolean res = rwlock.readLock().tryLock(100, 10, TimeUnit.SECONDS);
// 或
boolean res = rwlock.writeLock().tryLock(100, 10, TimeUnit.SECONDS);
...
lock.unlock();
```

#### 6. 信号量（Semaphore）

Redisson的分布式信号量（Semaphore）Java对象RSemaphore采用了与java.util.concurrent.Semaphore相似的接口和用法。

```java
RSemaphore semaphore = redisson.getSemaphore("semaphore");
semaphore.acquire();
//或
semaphore.acquireAsync();
semaphore.acquire(23);
semaphore.tryAcquire();
//或
semaphore.tryAcquireAsync();
semaphore.tryAcquire(23, TimeUnit.SECONDS);
//或
semaphore.tryAcquireAsync(23, TimeUnit.SECONDS);
semaphore.release(10);
semaphore.release();
//或
semaphore.releaseAsync();
```

#### 7. 可过期性信号量（PermitExpirableSemaphore）

Redisson的可过期性信号量（PermitExpirableSemaphore）实在RSemaphore对象的基础上，为每个信号增加了一个过期时间。每个信号可以通过独立的ID来辨识，释放时只能通过提交这个ID才能释放。



```java
RPermitExpirableSemaphore semaphore = redisson.getPermitExpirableSemaphore("mySemaphore");
String permitId = semaphore.acquire();
// 获取一个信号，有效期只有2秒钟。
String permitId = semaphore.acquire(2, TimeUnit.SECONDS);
// ...
semaphore.release(permitId);
```

#### 8. 闭锁（CountDownLatch）

Redisson的分布式闭锁（CountDownLatch）Java对象RCountDownLatch采用了与java.util.concurrent.CountDownLatch相似的接口和用法。

```java
RCountDownLatch latch = redisson.getCountDownLatch("anyCountDownLatch");
latch.trySetCount(1);
latch.await();

// 在其他线程或其他JVM里
RCountDownLatch latch = redisson.getCountDownLatch("anyCountDownLatch");
latch.countDown();
```