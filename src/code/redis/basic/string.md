---
order: 3
title: String(字符串)
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

## String(字符串)

String 类型是(`二进制安全的`)，可以包含任何数据，包括二进制图片、序列化对象等。

String 类型是 Redis 最基本的数据类型，一个 Redis 字符串的 value 最多可以是 `512M`。

### 常用命令

```bash
set <key> <value> # 设置一个key，value
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608201205040.png)

```bash
get <key> # 根据key获取value
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608201144079.png)

```bash
append <key> <value> # 在对应key的value后面追加数据，返回总长度
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608201438649.png)

```bash
strlen <key> # 获取值的长度
```

```bash
setnx <key> <value> # 设置值，当键存在时不进行设置，键不存在才进行设置
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608201640465.png)

### 数值操作

```bash
incr <key> # 将key中存储的值+1，返回增加后的值，只能对数字值进行操作，如果为空，新增值为1
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608201951902.png)

```bash
decr <key> # 将key中存储的值-1，返回减少后的值，只能对数字值进行操作，如果为空，新增值为-1
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608202009173.png)

```bash
incrby/decrby <key> <步长> # 将key中的值进行增减，长度为步长
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608202320342.png)

> `增减操作都是原子性操作`：对 Redis 而言，命令的原子性指的是：一个操作不可以再分，操作要么执行，要么不执行。Redis 的操作之所以是原子性的，是因为 Redis 是单线程的。

### 批量操作

```bash
mset <key1> <value1> <key2> <value2> ... # 同时对多对k-v进行赋值
```

```bash
mget <key1> <key2> <key3> ... # 同时获取多个value
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608205325643.png)

```bash
msetnx <key1> <value1> <key2> <value2> ... # 同时设置多对值，当值存在时不进行设置，值不存在才进行设置
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608205433667.png)

> `msetnx` 同时设置多对值时，`原子性操作，要么都成功要么都不成功`。

### 范围操作

```bash
# 获取值的范围，类似Java中的substring，前后都为闭区间
getrange <key> <起始位置> <结束位置>
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608204654354.png)

```bash
# 根据起始位置，将key中的值覆盖为value
setrange <key> <起始位置> <value>
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608204850347.png)

### 过期与替换

```bash
setex <key> <过期时间> <value> # 设置k-v的同时设置过期时间，单位s
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608205041973.png)

```bash
getset <key> <value> # 设置新值的同时，获取旧值
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608205208369.png)

### 底层结构

String 的底层结构为简单动态字符串(SDS)，内部结构类似于 Java 的 ArrayList，采用预分配冗余空间的方式来减少内存的频繁操作。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608205748834.png)

内部为当前字符串实际分配的空间 `capacity` 一般要高于实际字符串长度 `len`。当字符串长度小于 1M 时，扩容都是加倍现有的空间；如果超过 1M，扩容时一次只会多扩 1M 的空间。需要注意的是字符串最大长度为 `512M`。

### 应用场景

- **缓存**：最常见的用途，缓存数据库查询结果、页面渲染结果
- **计数器**：基于 `incr`/`decr` 的原子性，实现文章浏览量、点赞数等
- **分布式锁**：基于 `setnx` 配合过期时间实现简易分布式锁
- **限流**：基于 `incr` 与 `expire` 实现固定窗口限流
- **共享 Session**：分布式系统下集中存储用户会话
