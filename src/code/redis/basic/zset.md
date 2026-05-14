---
order: 7
title: Zset(sorted set有序集合)
date: 2022-01-14
category:
    - Redis
    - 分布式
tag:
    - Redis
    - 分布式
timeline: true
article: true
---

## Zset(sorted set 有序集合)

Zset 类型也是 string 类型元素的集合，但是它是`有序`的。每个元素都会关联一个 `double` 类型的分数(score)，Redis 通过分数对集合中的元素进行从小到大的排序。

集合内的元素是`唯一`的，但分数可以`重复`。

### 常用命令

| 命令             | 用法                                     | 描述                                                         |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------ |
| zadd             | zadd key score member [score member ...] | （1）将一个或多个 member 元素及其 score 值加入集合 key 中； （2）如果 member 已经是有序集合的元素，那么更新 member 对应的 score 并重新插入 member 保证 member 在正确的位置上； （3）score 可以是整数也可以是双精度浮点数。 |
| zcard            | zcard key                                | （1）返回有序集的元素个数。                                  |
| zcount           | zcount key min max                       | （1）返回有序集 key 中，score 值 >=min 且 <=max 的成员数量。 |
| zrange           | zrange key start stop [withscores]       | （1）返回有序集 key 中指定区间内的成员，成员位置按 score 从小到大排序； （2）如果 score 值相同，则按字典排序； （3）如果要使成员按 score 从大到小排序，则使用 zrevrange 命令。 |
| zrangebyscore    | zrangebyscore key min max [withscores] [limit offset count] | （1）按 score 范围返回元素，可指定分页。       |
| zrank            | zrank key member                         | （1）返回有序集 key 中成员 member 的排名，有序集合按 score 值从小到大排列； （2）zrevrank 命令将按照 score 值从大到小排序。 |
| zrem             | zrem key member [member ...]             | （1）移除有序集 key 中的一个或多个元素，不存在的元素将被忽略； （2）当 key 存在但不是有序集时，返回错误。 |
| zremrangebyrank  | zremrangebyrank key start stop           | （1）移除有序集 key 中指定排名区间内的所有元素。             |
| zremrangebyscore | zremrangebyscore key min max             | （1）移除有序集 key 中所有 score 值 >=min 且 <=max 之间的元素。 |
| zincrby          | zincrby key increment member             | （1）为指定 member 的 score 增加 increment。                 |
| zscore           | zscore key member                        | （1）返回 member 的 score 值。                               |

### 底层结构

Zset 由两种数据结构同时维护，以兼顾按 member 查找与按 score 排序的性能：

- **跳跃表(skiplist)**：用于按 score 排序，支持 O(logN) 的范围查询
- **哈希表(hashtable)**：用于按 member O(1) 查找对应的 score

当元素数量较少且元素较短时，会退化为更节省内存的 `ziplist`(7.0+ 为 `listpack`)。

### 应用场景

- **排行榜**：游戏积分榜、热搜榜，基于 `zadd` 写入分数，`zrevrange` 取 Top N
- **延迟队列**：以执行时间戳作为 score，定时任务用 `zrangebyscore` 拉取到期任务
- **范围查询**：按时间、价格等范围筛选数据
- **带权重的去重列表**：相同 member 自动覆盖 score
