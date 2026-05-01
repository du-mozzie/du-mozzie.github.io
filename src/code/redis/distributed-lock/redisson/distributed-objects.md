---
order: 3
title: '分布式对象'
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

# 分布式对象

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
