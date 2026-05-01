---
order: 5
title: 查看线程
date: 2021-05-04
category: Java
tag: Java
timeline: true
article: true
---

# 查看线程

Windows：

- 任务管理器可以查看进程和线程数，也可以用来杀死进程
- tasklist 查看进程
- taskkill 杀死进程

Linux：

- ps -ef 查看所有进程
- ps -fT -p  查看某个进程（PID）的所有线程
- kill 杀死进程
- top 按大写 H 切换是否显示线程
- top -H -p  查看某个进程（PID）的所有线程

Java：

- jps 命令查看所有 Java 进程
- jstack  查看某个 Java 进程（PID）的所有线程状态
- jconsole 来查看某个 Java 进程中线程的运行情况（图形界面）
