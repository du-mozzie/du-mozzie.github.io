---
order: 6
title: 总结
date: 2021-08-16
category: MySQL
tag: MySQL
timeline: true
article: true
---

MySQL的一些知识点总结

## 一个SQL执行过程

1. 连接管理收到请求，获取到SQL语句
2. 查询缓存，命中直接返回，SQL语句进行hash所以要完全匹配（8.0之前可以选择开启，8.0之后没有该功能）
3. 解析语法生产解析树，该步骤会检查语法是否正确
4. 解析树转化为执行计划，并且对我们的SQL进行一些优化处理。可以使用EXPLAIN查询某个语句的执行计划
5. 执行器阶段，按照生成的执行计划调用存储引擎提供的接口查询结果并返回客户端

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1717902009574.jpg)