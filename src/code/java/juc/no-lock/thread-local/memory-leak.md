---
order: 5
title: 内存泄漏
date: 2021-05-10
category: Java
tag: Java
timeline: true
article: true
---

# 内存泄漏

Memory leak：内存泄漏是指程序中动态分配的堆内存由于某种原因未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果，内存泄漏的堆积终将导致内存溢出

-  如果 key 使用强引用：使用完 ThreadLocal ，threadLocal Ref 被回收，但是 threadLocalMap 的 Entry 强引用了 threadLocal，造成 threadLocal 无法被回收，无法完全避免内存泄漏 ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ThreadLocal%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E5%BC%BA%E5%BC%95%E7%94%A8.png) 
-  如果 key 使用弱引用：使用完 ThreadLocal ，threadLocal Ref 被回收，ThreadLocalMap 只持有 ThreadLocal 的弱引用，所以threadlocal 也可以被回收，此时 Entry 中的 key = null。但没有手动删除这个 Entry 或者 CurrentThread 依然运行，依然存在强引用链，value 不会被回收，而这块 value 永远不会被访问到，也会导致 value 内存泄漏 ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ThreadLocal%E5%86%85%E5%AD%98%E6%B3%84%E6%BC%8F%E5%BC%B1%E5%BC%95%E7%94%A8.png)
-  两个主要原因： 

-  没有手动删除这个 Entry
-  CurrentThread 依然运行

根本原因：ThreadLocalMap 是 Thread的一个属性，**生命周期跟 Thread 一样长**，如果没有手动删除对应 Entry 就会导致内存泄漏

解决方法：使用完 ThreadLocal 中存储的内容后将它 remove 掉就可以

ThreadLocal 内部解决方法：在 ThreadLocalMap 中的 set/getEntry 方法中，通过线性探测法对 key 进行判断，如果 key 为 null（ThreadLocal 为 null）会对 Entry 进行垃圾回收。所以**使用弱引用比强引用多一层保障**，就算不调用 remove，也有机会进行 GC
