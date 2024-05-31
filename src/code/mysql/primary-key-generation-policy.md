---
order: 3
title: 主键生成策略
date: 2021-08-03
category: MySQL
tag: MySQL
timeline: true
article: true
---

# 主键生成策略

uuid、自增id、雪花算法、redis、zookeeper

## 雪花算法

雪花算法这一在分布式架构中很常见的玩意，但一般也不需要怎么去深入了解，一方面一般个人项目用不到分布式之类的大型架构，另一方面，就算要用到，市面上很多ID生成器也帮我们完成了这项工作。

## 分布式ID的特点

#### 全局唯一性

不能出现有重复的ID标识，这是基本要求。

#### 递增性

确保生成ID对于用户或业务是递增的。

#### 高可用性

确保任何时候都能生成正确的ID。

#### 高性能性

在高并发的环境下依然表现良好。

## 分布式ID的常见解决方案

#### UUID

Java自带的生成一串唯一随机36位字符串（32个字符串+4个“-”）的算法。它可以保证唯一性，且据说够用N亿年，但是其业务可读性差，无法有序递增。

#### SnowFlake

雪花算法，它是Twitter开源的由64位整数组成分布式ID，性能较高，并且在单机上递增。 具体参考：

>   [https://github.com/twitter-archive/snowflake](https://link.zhihu.com/?target=https%3A//github.com/twitter-archive/snowflake)

#### UidGenerator

UidGenerator是百度开源的分布式ID生成器，其基于雪花算法实现。 具体参考：

>   [https://github.com/baidu/uid-generator/blob/master/README.zh_cn.md](https://link.zhihu.com/?target=https%3A//github.com/baidu/uid-generator/blob/master/README.zh_cn.md)

#### Leaf

Leaf是美团开源的分布式ID生成器，能保证全局唯一，趋势递增，但需要依赖关系数据库、Zookeeper等中间件。 具体参考：

>   [https://tech.meituan.com/MT_Leaf.html](https://link.zhihu.com/?target=https%3A//tech.meituan.com/MT_Leaf.html)

### 雪花算法的概要

SnowFlake是Twitter公司采用的一种算法，目的是在分布式系统中产生全局唯一且趋势递增的ID。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210421135210471.png)

- #### 组成部分（64bit）

  1. **第一位**0000000000000 占用1bit，其值始终是0，没有实际作用。 
  2. **时间戳** 占用41bit，精确到毫秒，总共可以容纳约69年的时间。 
  3. **工作机器id** 占用10bit，其中高位5bit是数据中心ID，低位5bit是工作节点ID，做多可以容纳1024个节点。 
  4. **序列号** 占用12bit，每个节点每毫秒0开始不断累加，最多可以累加到4095，一共可以产生4096个ID。

  SnowFlake算法在同一毫秒内最多可以生成多少个全局唯一ID呢：： **同一毫秒的ID数量 = 1024 X 4096 = 4194304**

  ## 雪花算法的实现

  雪花算法的实现主要依赖于数据中心ID和数据节点ID这两个参数，具体实现如下。

  #### JAVA实现

  ```java
  public class SnowflakeIdWorker {
      /**
       * 开始时间截 (2015-01-01)
       */
      private final long twepoch = 1420041600000L;
      /**
       * 机器id所占的位数
       */
      private final long workerIdBits = 5L;
      /**
       * 数据标识id所占的位数
       */
      private final long datacenterIdBits = 5L;
      /**
       * 支持的最大机器id，结果是31 (这个移位算法可以很快的计算出几位二进制数所能表示的最大十进制数)
       */
      private final long maxWorkerId = -1L ^ (-1L << workerIdBits);
      /**
       * 支持的最大数据标识id，结果是31
       */
      private final long maxDatacenterId = -1L ^ (-1L << datacenterIdBits);
      /**
       * 序列在id中占的位数
       */
      private final long sequenceBits = 12L;
      /**
       * 机器ID向左移12位
       */
      private final long workerIdShift = sequenceBits;
      /**
       * 数据标识id向左移17位(12+5)
       */
      private final long datacenterIdShift = sequenceBits + workerIdBits;
      /**
       * 时间截向左移22位(5+5+12)
       */
      private final long timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;
      /**
       * 生成序列的掩码，这里为4095 (0b111111111111=0xfff=4095)
       */
      private final long sequenceMask = -1L ^ (-1L << sequenceBits);
      /**
       * 工作机器ID(0~31)
       */
      private long workerId;
      /**
       * 数据中心ID(0~31)
       */
      private long datacenterId;
      /**
       * 毫秒内序列(0~4095)
       */
      private long sequence = 0L;
      /**
       * 上次生成ID的时间截
       */
      private long lastTimestamp = -1L;
      /**
       * 构造函数
       * @param workerId     工作ID (0~31)
       * @param datacenterId 数据中心ID (0~31)
       */
      public SnowflakeIdWorker(long workerId, long datacenterId) {
          if (workerId > maxWorkerId || workerId < 0) {
              throw new IllegalArgumentException(String.format("worker Id can't be greater than %d or less than 0", maxWorkerId));
          }
          if (datacenterId > maxDatacenterId || datacenterId < 0) {
              throw new IllegalArgumentException(String.format("datacenter Id can't be greater than %d or less than 0", maxDatacenterId));
          }
          this.workerId = workerId;
          this.datacenterId = datacenterId;
      }
      /**
       * 获得下一个ID (该方法是线程安全的)
       * @return SnowflakeId
       */
      public synchronized long nextId() {
          long timestamp = timeGen();
          // 如果当前时间小于上一次ID生成的时间戳，说明系统时钟回退过这个时候应当抛出异常
          if (timestamp < lastTimestamp) {
              throw new RuntimeException(
                      String.format("Clock moved backwards.  Refusing to generate id for %d milliseconds", lastTimestamp - timestamp));
          }
          // 如果是同一时间生成的，则进行毫秒内序列
          if (lastTimestamp == timestamp) {
              sequence = (sequence + 1) & sequenceMask;
              // 毫秒内序列溢出
              if (sequence == 0) {
                  //阻塞到下一个毫秒,获得新的时间戳
                  timestamp = tilNextMillis(lastTimestamp);
              }
          }
          // 时间戳改变，毫秒内序列重置
          else {
              sequence = 0L;
          }
          // 上次生成ID的时间截
          lastTimestamp = timestamp;
          // 移位并通过或运算拼到一起组成64位的ID
          return ((timestamp - twepoch) << timestampLeftShift) //
                  | (datacenterId << datacenterIdShift) //
                  | (workerId << workerIdShift) //
                  | sequence;
      }
      /**
       * 阻塞到下一个毫秒，直到获得新的时间戳
       * @param lastTimestamp 上次生成ID的时间截
       * @return 当前时间戳
       */
      protected long tilNextMillis(long lastTimestamp) {
          long timestamp = timeGen();
          while (timestamp <= lastTimestamp) {
              timestamp = timeGen();
          }
          return timestamp;
      }
      /**
       * 返回以毫秒为单位的当前时间
       * @return 当前时间(毫秒)
       */
      protected long timeGen() {
          return System.currentTimeMillis();
      }
  
      public static void main(String[] args) throws InterruptedException {
          SnowflakeIdWorker idWorker = new SnowflakeIdWorker(0, 0);
          for (int i = 0; i < 10; i++) {
              long id = idWorker.nextId();
              Thread.sleep(1);
              System.out.println(id);
          }
      }
  }
  ```
