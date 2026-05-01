---
order: 2
title: 核心方法
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# 核心方法

| 方法类型         | 抛出异常  | 特殊值   | 阻塞   | 超时               |
| ---------------- | --------- | -------- | ------ | ------------------ |
| 插入（尾）       | add(e)    | offer(e) | put(e) | offer(e,time,unit) |
| 移除（头）       | remove()  | poll()   | take() | poll(time,unit)    |
| 检查（队首元素） | element() | peek()   | 不可用 | 不可用             |

- 抛出异常组： 

- 当阻塞队列满时：在往队列中 add 插入元素会抛出 IIIegalStateException: Queue full
- 当阻塞队列空时：再往队列中 remove 移除元素，会抛出 NoSuchException

- 特殊值组： 

- 插入方法：成功 true，失败 false
- 移除方法：成功返回出队列元素，队列没有就返回 null

- 阻塞组： 

- 当阻塞队列满时，生产者继续往队列里 put 元素，队列会一直阻塞生产线程直到队列有空间 put 数据或响应中断退出
- 当阻塞队列空时，消费者线程试图从队列里 take 元素，队列会一直阻塞消费者线程直到队列中有可用元素

- 超时退出：当阻塞队列满时，队里会阻塞生产者线程一定时间，超过限时后生产者线程会退出
