---
order: 1
title: '原生'
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
