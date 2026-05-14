---
order: 5
title: List(列表)
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

## List(列表)

单键多值。

Redis 列表是简单的字符串列表，按照插入顺序排序，可以插入一个元素到列表的头部(左边)或者尾部(右边)。

列表类型内部使用`双向链表`实现的，所以向列表两端添加元素的时间复杂度为 O(1)，获取越接近两端的元素速度越快。但是使用链表的代价是通过索引访问元素比较慢。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608210412685.png)

### 常用命令

| 命令      | 用法                                  | 描述                                                         |
| --------- | ------------------------------------- | ------------------------------------------------------------ |
| lpush     | lpush key value [value ...]           | （1）将一个或多个值插入到列表 key 的表头； （2）如果有多个 value 值，则从左到右的顺序依次插入表头； （3）如果 key 不存在，则会创建一个空列表，然后执行 lpush 操作；如果 key 存在，但不是列表类型，则返回错误。 |
| lpushx    | lpushx key value                      | （1）将 value 值插入到列表 key 的表头，当且仅当 key 存在且是一个列表； （2）如果 key 不存在时，lpushx 命令什么都不会做。 |
| lpop      | lpop key                              | （1）移除并返回列表 key 的头元素。                           |
| lrange    | lrange key start stop                 | （1）返回列表 key 中指定区间内的元素； （2）start 大于列表最大下标时，返回空列表； （3）可使用负数下标，-1 表示列表最后一个元素，以此类推。 |
| lrem      | lrem key count value                  | （1）count>0 表示从头到尾搜索，移除与 value 相等的元素，数量为 count； （2）count<0 表示从尾到头搜索，移除与 value 相等的元素，数量为 count； （3）count=0 表示移除列表中所有与 value 相等的元素。 |
| lset      | lset key index value                  | （1）将列表 key 下标为 index 的元素值设置为 value； （2）当 index 参数超出范围，或对一个空列表进行 lset 操作时，返回错误。 |
| lindex    | lindex key index                      | （1）返回列表 key 中下标为 index 的元素。                    |
| linsert   | linsert key BEFORE\|AFTER pivot value | （1）将值 value 插入列表 key 中，位于 pivot 前面或者后面； （2）当 pivot 不存在列表 key 中，或者 key 不存在时，不执行任何操作。 |
| llen      | llen key                              | （1）返回列表 key 的长度，当 key 不存在时，返回 0。          |
| rpop      | rpop key                              | （1）移除并返回列表 key 的尾元素。                           |
| rpoplpush | rpoplpush source destination          | （1）将列表 source 中最后一个元素弹出并返回给客户端，并且将该元素插入到列表 destination 的头部。 |
| rpush     | rpush key value [value ...]           | （1）将一个或多个值插入到列表 key 的尾部。                   |
| rpushx    | rpushx key value                      | （1）将 value 值插入到列表 key 的表尾，当且仅当 key 存在且是一个列表； （2）如果 key 不存在时，rpushx 命令什么都不会做。 |

### 阻塞命令

`blpop` / `brpop` 是 `lpop` / `rpop` 的阻塞版本：当列表为空时，连接会阻塞直到列表中有元素或超时。常用于消息队列消费者的拉取场景，避免空轮询。

```bash
blpop key [key ...] timeout # 超时单位为秒，0 表示无限等待
brpop key [key ...] timeout
```

### 总结

==总结：==

1.  它是一个字符串链表，left 和 right 都可以插入、添加
2.  如果键不存在，创建新的链表
3.  如果键已存在，新增内容
4.  如果值全移除，对应的键也就消失了
5.  链表的操作无论是头和尾效率都极高，但假如是对中间元素进行操作，效率就很惨淡了

### 底层结构

- Redis 3.2 之前，List 在元素较少且较短时使用 `ziplist`，否则使用 `linkedlist`
- Redis 3.2 起统一使用 `quicklist`，本质是双向链表 + ziplist 节点的混合结构，兼顾节省内存与高性能
- Redis 7.0 起 `ziplist` 节点替换为 `listpack`

### 应用场景

- **消息队列**：`lpush` 入队 + `brpop` 阻塞消费，构建简单可靠的消息队列
- **最新列表**：朋友圈、评论流等"最近 N 条"场景，配合 `ltrim` 控制长度
- **分页缓存**：使用 `lrange` 配合分页参数获取指定区间数据
- **栈 / 队列**：`lpush + lpop` 即栈，`lpush + rpop` 即队列
