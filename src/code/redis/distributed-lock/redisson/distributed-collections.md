---
order: 4
title: '分布式集合'
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

# 分布式集合

在Redis分布式的集合元素与java对象相对应。包括：映射、多值映射(Multimap)、集(Set)、有序集(SortedSet)、计分排序集

(ScoredSortedSet)、字典排序集(LexSortedSet)、列表(List)、队列(Queue)、双端队列(Deque)、阻塞队列(Blocking Queue)

### 映射（RMap）

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

### 映射持久化方式(缓存策略)

将映射中的数据持久化到外部存储服务的功能

主要场景：

1.  作为业务和外部存储媒介之间的缓存
2.  用来增加数据的持久性、增加已被驱逐的数据的寿命
3.  用来缓存数据库、web服务或其他数据源的数据

Read-through策略：如果在映射中不存在，则通过Maploader对象加载

Write-through策略(数据同步写入)：对映射数据的更改则会通过MapWriter写入到外部存储系统，然后更新redis里面的数据

Write-behind策略(数据异步写入)：对映射数据的更改先写到redis，然后使用异步方式写入到外部存储
