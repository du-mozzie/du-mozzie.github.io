---
order: 6
title: Set(集合)
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

## Set(集合)

Redis 中的 Set 类型是 string 类型的`无序集合`。集合类型的常用操作是向集合中加入或删除元素、判断某个元素是否存在等。由于集合类型在 Redis 内部是使用值为空的散列表实现的，所以这些操作的时间复杂度都是 O(1)。

最方便的是多个集合类型键之间还可以进行并集、交集和差集运算。

### 常用命令

| 命令        | 用法                                   | 描述                                                         |
| ----------- | -------------------------------------- | ------------------------------------------------------------ |
| sadd        | sadd key member [member ...]           | （1）将一个或多个 member 元素加入 key 中，已存在在集合中的 member 将被忽略； （2）如果 key 不存在，则创建一个只包含 member 元素的集合； （3）当 key 不是集合类型时，将返回一个错误。 |
| scard       | scard key                              | （1）返回 key 对应的集合中的元素数量。                       |
| sdiff       | sdiff key [key ...]                    | （1）返回所有 key 对应的集合的差集。                         |
| sdiffstore  | sdiffstore destination key [key ...]   | （1）返回所有 key 对应的集合的差集，并把该差集赋值给 destination； （2）如果 destination 已经存在，则直接覆盖。 |
| sinter      | sinter key [key ...]                   | （1）返回所有 key 对应的集合的交集； （2）不存在的 key 被视为空集。 |
| sinterstore | sinterstore destination key [key ...]  | （1）返回所有 key 对应的集合的交集，并把该交集赋值给 destination； （2）如果 destination 已经存在，则直接覆盖。 |
| sismember   | sismember key member                   | （1）判断 member 元素是否是 key 的成员，0 表示不是，1 表示是。 |
| smembers    | smembers key                           | （1）返回集合 key 中的所有成员； （2）不存在的 key 被视为空集。 |
| srem        | srem key member [member ...]           | （1）移除集合 key 中的一个或多个 member 元素，不存在的 member 将被忽略。 |
| sunion      | sunion key [key ...]                   | （1）返回所有 key 对应的集合的并集； （2）不存在的 key 被视为空集。 |
| sunionstore | sunionstore destination key [key ...]  | （1）返回所有 key 对应的集合的并集，并把该并集赋值给 destination； （2）如果 destination 已经存在，则直接覆盖。 |
| srandmember | srandmember key [count]                | （1）随机返回集合中的一个或多个成员，不会修改集合。           |
| spop        | spop key [count]                       | （1）随机弹出集合中的一个或多个成员（会从集合中移除）。      |

### 集合运算

```bash
# 求差集：A 中有但 B 中没有的元素
sdiff A B

# 求交集：A 与 B 都有的元素
sinter A B

# 求并集：A 与 B 中所有不重复的元素
sunion A B
```

### 底层结构

- 当集合中所有元素都为整数且数量较少时，使用 `intset`(整数集合)
- 否则使用 `hashtable`(哈希表)，仅使用 key，value 为空

### 应用场景

- **去重**：`sadd` 天然去重，例如统计 UV
- **共同好友 / 关注**：通过 `sinter` 求交集
- **抽奖**：使用 `spop` / `srandmember` 实现随机抽取
- **标签系统**：每个用户/文章关联多个标签
