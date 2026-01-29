---
order: 2
title: Netty基础组件
date: 2026-01-30
category: Netty
tag: Netty
timeline: true
article: true
prev: ./
---

Nettyty 基础组件介绍

## EventLoop

EventLoop 是 Netty 的内部线程组件，主要用来处理相关IO事件，实现了ScheduledExecutorService接口，可以执行定时任务，拥有线程池功能。

常用EvnentLoopGroup：

- NioEventLoopGroup：NIO 线程组，用于处理 NIO 线程，继承了 AbstractEventLoopGroup 类
- EpollEventLoopGroup：EPOLL 线程组，用于处理 EPOLL 线程，继承了 AbstractEventLoopGroup 类
- DefaultEventLoopGroup：默认线程组，用于处理默认线程，继承了 AbstractEventLoopGroup 类
