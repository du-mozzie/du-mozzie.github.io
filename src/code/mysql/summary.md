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

## InnoDB支持哪几种行格式

InnoDB是MySQL数据库的存储引擎之一，它使用不同的行格式来物理存储数据：

1. **COMPACT**：这是MySQL 5.0之前的默认行格式。它保存字段值，并使用空值列表来记录null值。对于可变长度的列，如VARCHAR、VARBINARY、BLOB和TEXT类型，前768字节的数据存储在索引记录中，超出部分存储在溢出页中。对于大于或等于768字节的固定长度列，它们会被当作可变长度列处理，并可能存储在页外。COMPACT格式适合处理大量包含可变长度列的数据。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240918211226087.png)

2. **REDUNDANT**：这是MySQL 5.0版本之前的另一种行格式，使用较少。它在字段长度偏移列表中存储所有列（包括隐藏列）的长度信息。这种格式不支持紧凑存储、增强的可变长度列存储、大索引键前缀支持和压缩。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240918211300186.png)

3. **DYNAMIC**：这是MySQL 5.7版本引入的行格式，是COMPACT的改进版。它保持了COMPACT的优点，并在存储大的可变长度列时更加灵活。DYNAMIC格式在存储空间和性能上做了平衡，适用于大多数应用场景。它支持紧凑的存储特性、增强的可变长度列存储和大索引键前缀支持，但不支持压缩。

4. **COMPRESSED**：这是MySQL 5.1中引入的新特性，它在存储数据时可以对数据进行压缩，以减少磁盘占用空间。这种压缩会增加CPU的使用，可能会影响查询性能。COMPRESSED行格式在DYNAMIC行格式的基础上添加了页外压缩功能。它支持紧凑的存储特性、增强的可变长度列存储、大索引键前缀支持和压缩。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240918211346965.png)