---
order: 2
title: Docker安装Redis
date: 2022-01-21
category: Redis
tag: Redis
timeline: true
article: true
---

Docker安装Redis笔记

## 安装Redis

通过`docker search redis`和`docker pull redis`下载redis镜像

```bash
# 通过关键词搜索可用的redis镜像
docker search redis
NAME                             DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
redis                            Redis is an open source key-value store that…   8297                [OK]
bitnami/redis                    Bitnami Redis Docker Image                      148                                     [OK]
sameersbn/redis                                                                  80                                      [OK]
grokzen/redis-cluster            Redis cluster 3.0, 3.2, 4.0, 5.0, 6.0           68
rediscommander/redis-commander   Alpine image for redis-commander - Redis man…   41                                      [OK]
kubeguide/redis-master           redis-master with "Hello World!"                31
redislabs/redis                  Clustered in-memory database engine compatib…   25
redislabs/redisearch             Redis With the RedisSearch module pre-loaded…   23
oliver006/redis_exporter          Prometheus Exporter for Redis Metrics. Supp…   22
arm32v7/redis                    Redis is an open source key-value store that…   21
bitnami/redis-sentinel           Bitnami Docker Image for Redis Sentinel         14                                      [OK]
webhippie/redis                  Docker images for Redis                         12                                      [OK]
redislabs/redisgraph             A graph database module for Redis               11                                      [OK]
s7anley/redis-sentinel-docker    Redis Sentinel                                  10                                      [OK]
arm64v8/redis                    Redis is an open source key-value store that…   9
insready/redis-stat              Docker image for the real-time Redis monitor…   9                                       [OK]
redislabs/redisinsight           RedisInsight - The GUI for Redis                7
redislabs/redismod               An automated build of redismod - latest Redi…   7                                       [OK]
centos/redis-32-centos7          Redis in-memory data structure store, used a…   5
circleci/redis                   CircleCI images for Redis                       4                                       [OK]
clearlinux/redis                 Redis key-value data structure server with t…   2
runnable/redis-stunnel           stunnel to redis provided by linking contain…   1                                       [OK]
tiredofit/redis                  Redis Server w/ Zabbix monitoring and S6 Ove…   1                                       [OK]
wodby/redis                      Redis container image with orchestration        1                                       [OK]
xetamus/redis-resource           forked redis-resource                           0                                       [OK]

# 下载最新版本的Redis镜像
docker pull redis
```

## 新增挂载配置文件夹

> 因为 redis 默认配置你会发现只能够本地连接，不能进行远程访问，使用 Redis Desktop Manager连接都会报错，因此需要手动挂载 redis 配置文件/
> 新建`data`和`conf`两个文件夹，位置随意。例如：

```bash
mkdir -p /export/servers/redis/conf
mkdir -p /export/servers/redis/data
```

## 新增Redis配置文件

```bash
vim /export/servers/redis/conf/redis.conf
```

内容如下：

```css
#bind 127.0.0.1 
protected-mode no
appendonly yes 
requirepass root 
```

- 将bind 127.0.0.1注释掉，保证可以从远程访问到该Redis，不单单是从本地
- appendonly：开启数据持久化到磁盘，由于开启了磁盘映射，数据最终将落到`/export/server/redis/data`目录下
- requirepass：设置访问密码为root

## 创建redis容器并启动

```bash
docker run --restart=always --privileged=true \
-p 6379:6379 --name redis \
-v /export/servers/redis/data:/data \
-v /export/servers/redis/conf/redis.conf:/etc/redis/redis.conf \
-d redis redis-server /etc/redis/redis.conf
```

- `docker run`表示运行的意思
- `--name redis`表示运行容器的名字叫`redis`
- `-p 6379:6379`表示将服务器的6379（冒号前的6379）端口映射到docker的6379（冒号后的6379）端口，这样就可以通过服务器的端口访问到docker容器的端口了
- -d 表示以后台服务的形式运行redis
- `-v /export/servers/redis/data:/data`表示将服务器上的`/export/server/redis/data`映射为docker容器上的`/data` ，这样`/data`中产生的数据就可以持久化到本地的目录下了
- `-v /export/servers/redis/conf/redis.conf:/etc/redis/redis.conf`表示将本地`/export/server/redis/conf/redis.conf`映射为docker容器上的`/etc/redis/redis.conf`，这样再配合指令末尾的`redis redis-server /etc/redis/redis.conf`实现让docker容器运行时使用本地配置的Redis配置文件的功能了。
- `redis redis-server /etc/redis/redis.conf`表示运行redis服务器程序，并且指定运行时的配置文件