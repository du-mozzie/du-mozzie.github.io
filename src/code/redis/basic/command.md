---
order: 2
title: 命令操作
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

## 命令操作

Redis 的常用通用命令，包括客户端连接、键管理与库管理。各数据类型自身的命令请参考对应章节。

### 客户端连接

```bash
# redis自带的客户端
redis-cli
```

如果有给 Redis 设置密码，需要先验证一下才能操作 Redis：

```bash
127.0.0.1:6379> auth root
```

### 键 key

通用的键命令，适用于所有数据类型。

```bash
keys * # 查看数据库中所有的key
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608195351415.png)

```bash
exists (key) # 查看key是否存在，返回值为key的数量
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608195510061.png)

```bash
type (key) # 查看key是什么类型
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608195614578.png)

```bash
del (key) # 删除key，返回删除个数
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608195742144.png)

```bash
unlink (key) # 根据value选择非阻塞删除，先通知删除该key，后续再删除内存中的key，异步执行
```

```bash
expire (key) (time) # 设置key的过期时间，单位秒
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608200044843.png)

```bash
ttl (key) # 查看key过期时间，-1表示永不过期，-2表示已经过期
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608200218937.png)

> `del` 与 `unlink` 的区别：`del` 是同步删除，会阻塞当前线程直到内存释放完毕；`unlink` 是异步删除，仅在 keyspace 中先解除引用，真正的内存回收交由后台线程完成，更适合删除大 key。

### 库

Redis 默认有 16 个库（编号 0~15），每个库相互独立，可通过编号切换。

```bash
select (库序号) # 切换库，redis有16个库，默认是0
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608200422509.png)

```bash
dbsize # 查看当前数据库key的数量，返回个数
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608200538584.png)

```bash
flushdb  # 清除当前库
flushall # 清除全部库
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210608200724046.png)

> 生产环境慎用 `flushdb` 与 `flushall`，建议通过 `rename-command` 配置项重命名或禁用该命令。
