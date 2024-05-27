---
order: 14
title: 注解
date: 2021-07-01
category: Java
tag: Java
timeline: true
article: true
---

# JVM内存模型

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1702296545251-14404f88-739e-46fd-8de4-7ee6cbe618a6.png)

**线程共享**：堆、方法区

**线程独享**：虚拟机栈、程序计数器、本地方法栈

## 堆

> 对象分配策略

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1702296505567-b1b0c93b-bca4-48b4-b451-62e8f700f7fc.png)

- 对象进入Eden区，Minor GC存活的进入Survivor区，计数达到设置的MaxTenuringThreshold进入Old区
- 大对象直接进入Old区
- 动态年龄判断，在Survivor区，年龄从小到大累加大于该值的阈值，例 年龄1 + 年龄2 + 年龄3 + 年龄N size > TargetSurvivorRatio值(默认是Survivor一半)， 则年龄N 跟 年龄N以上的对象进入老年区
- 年龄大于阈值，进入老年代，--X:MaxTenuringThreshold参数设置
- Minor GC后，存活的对象空间大于survivor空间，直接进入老年代。

以上对象均是分配到堆空间。

## 栈

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1715525875467-212eae86-8358-446a-81d8-3ec21e44a37f.png)

## 方法区

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1715525916410-043c5f5a-261d-4c5d-a552-b3ae027fbc9d.png)

jdk7及以前叫做永久代，jdk8开始，使用元空间取代了永久代。方法区和永久代并不等价，仅是对HotSpot虚拟机而言。《Java虚拟机规范》对如何实现方法区不做统一的要求，元空间使用的是本地内存。

jdk1.6及之前：有永久代(permanent generation)

jdk1.7：有永久代，但已经逐步“去永久代”，字符串常量池、静态变量移除，保存在堆中

jdk1.8及以后：无永久代，类型信息、字段、方法、常量保存在本地内存的元空间，但字符串常量池、静态变量仍在堆中

**字符串创建频率高，放在永久代不易回收**

# 对象内存布局

## 创建对象的方法

1. new
2. 反射

- 根据类名：类名.class
- 根据对象：对象.getClass()
- 根据全限定类名：Class.forName(全限定类名)
- 根据对象：对象.newInstance()，JDK9废弃

1. Constructor的getDeclaredConstructors()[0].newInstance(xx)，可以调用空参、带参的构造器，没有权限要求
2. clone()，浅拷贝
3. 反序列化，从文件中、数据库中、网络中获取一个对象的二进制流，反序列化为内存中的对象
4. 第三方库Objenesis，利用了asm字节码技术，动态生成Constructor

## 从执行步骤角度分析

1. 判断对象对应的类是否加载、链接、初始化
2. 为对象分配内存

- 指针碰撞
- 空闲列表

1. 处理并发安全问题
2. 初始化分配到的空间
3. 设置对象的对象头
4. 执行init方法进行初始化

## 五种引用

1. 强引用：不回收，程序中绝大部分都是强引用。
2. 软引用：内存不足即回收，使用SoftReference类

作用：可以缓存一些经常使用到的数据，但是在垃圾回收时发现内存不足会被回收

1. 弱引用：发现即回收，使用WeakReference类

作用：在资源充足的时候缓存一些数据，当有垃圾回收(说明资源可能不足了)直接被回收掉

1. 虚引用：对象回收跟踪，使用PhantomReference类

作用：用于跟踪垃圾回收过程。

1. 终结器引用：实现对象的finalize()方法，无需手动编码，其内部配合队列使用。在GC时，终结器引用入队。由Finalizer线程通过终结器引用找到被引用对象并调用，它的finalize()方法，第二次GC时才能回收被引用对象。