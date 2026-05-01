---
order: 3
title: 字节流
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# 字节流

按照方向可以分为输入字节流和输出字节流。

InputStream、OutputStream

1 byte = 8 位二进制数 01010101

InputStream常用方法

| 方法                               | 描述                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| int read()                         | 以字节为单位读取数据                                   |
| int read(byte b[])                 | 将数据存入 byte 类型的数组中，返回数组中有效数据的长度 |
| int read(byte b[],int off,int len) | 将数据存入 byte 数组的指定区间内，返回数组长度         |
| byte[] readAllBytes()              | 将所有数据存入 byte 数组并返回                         |
| int available()                    | 返回当前数据流未读取的数据个数                         |
| void close()                       | 关闭数据流                                             |

OutputStream

| 方法                                 | 描述                           |
| ------------------------------------ | ------------------------------ |
| void write(int b)                    | 以字节为单位输出数据           |
| void write(byte b[])                 | 将byte数组中的数据输出         |
| void write(byte b[],int off,int len) | 将byte数组中指定区间的数据输出 |
| void close()                         | 关闭数据流                     |
| void flush()                         | 将缓冲流中的数据同步到输出流中 |
