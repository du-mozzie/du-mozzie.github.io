---
order: 1
title: Java体系
date: 2021-02-15
category: Java
tag: Java
timeline: true
article: true
prev: ./
---

# Java体系

Java的体系概述可以涵盖多个方面，包括Java语言本身、Java平台和Java生态系统。

## 1、Java 基础

1、跨平台

2、面向对象编程语言

3、分布式计算

## 2、Java 的运行机制

- 编程 Java 程序
- 编译 Java 文件
- JVM 读取字节码文件运行程序

## 3、Java的三大体系

- Java SE(J2SE)
- Java ME(J2ME)
- Java EE([J2EE](https://so.csdn.net/so/search?q=J2EE&spm=1001.2101.3001.7020))

## 4、配置 Java 环境

JRE、JDK

JRE：Java Runtime [Environment](https://so.csdn.net/so/search?q=Environment&spm=1001.2101.3001.7020) Java 运行环境

JDK：Java Devlopment Kit Java 开发工具包

## 5、开发

- 编译

```shell
javac HelloWorld.java
```

- 运行

```bash
java HelloWorld
```

Java IDE
NetBeans、Eclipse、IDEA

## 6、代码规范

- 强制性代码规范，必须执行的

1、Java 程序的文件名与类名必须一致，若不一致，无法通过编译。

2、main 方法是程序的入口，方法的定义必须严格按照格式书写。

3、类是组织 Java 代码结构的，类中的方法是执行具体业务的。

- 非强制性代码规范，建议按照此方式编写代码

1、一行只写一条语句。

2、在 1 的基础上，还要注意代码缩进。