---
order: 9
title: 总结
date: 2021-05-31
category: Java
tag: Java
timeline: true
article: true
---

thread接口提供的几种同步原语如下：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/9b8c086ae944f0d4861f9b398c673c0e349572.png)

由于linux下线程和进程本质都是LWP，那么进程间通信使用的IPC（管道、FIFO、消息队列、信号量）线程间也可以使用，也可以达到相同的作用。 但是由于IPC资源在进程退出时不会清理（因为它是系统资源），因此不建议使用。

以下是一些非锁但是也能实现线程安全或者部分线程安全的常见做法：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/43010f87d03c76ab29d444f3469875ac380936.png)

可以看到，上面很多做法都是采用了副本，尽量避免在 thread 中间共享数据。最快的同步就是没同步（The fastest synchronization of all is the kind that never takes place），Share nothing is best。