---
order: 7
title: 调优
date: 2021-09-16
category: MySQL
tag: MySQL
timeline: true
article: true
---

MySQL的一些调优经验



## MySQL数据库CPU飙升如何定位分析

> 使用top观察mysqld的cpu利用率（确认问题是由mysqld产生的）

1. 切换到常用的数据库

2. 使用 **show full processlist** 查看会话

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240611223146267.png)

3. 观察是哪些sql消耗了资源，其中重点观察state指标

4. 定位到具体sql

> 使用pidstate

1. 定位到线程

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240611224045171.png)

2. 在数据库 **performance_schema.threads** 中记录了 thread_os_id 找到执行的sql

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240611224317970.png)

3. 根据操作系统id可以到 **performance_schema.processlist** 表找到对应的会话

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240611224347159.png)

4. 在会话中即可定位到问题sql
