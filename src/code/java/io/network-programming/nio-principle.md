---
order: 10
title: NIO：实现原理
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# NIO：实现原理

NIO 三大核心部分：Channel (通道)、Buffer (缓冲区)、Selector (选择器)

-  Buffer 缓冲区
   缓冲区本质是一块可以写入数据、读取数据的内存，**底层是一个数组**，这块内存被包装成 NIO Buffer 对象，并且提供了方法用来操作这块内存，相比较直接对数组的操作，Buffer 的 API 更加容易操作和管理 
-  Channel 通道
   Java NIO 的通道类似流，不同的是既可以从通道中读取数据，又可以写数据到通道，流的读写通常是单向的，通道可以非阻塞读取和写入通道，支持读取或写入缓冲区，也支持异步地读写 
-  Selector 选择器
   Selector 是一个 Java NIO 组件，能够检查一个或多个 NIO 通道，并确定哪些通道已经准备好进行读取或写入，这样一个单独的线程可以管理多个 channel，从而管理多个网络连接，提高效率 

NIO 的实现框架：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314506-60b2c961-2bf7-40c0-893e-a1cde5eacca0.png)

- 每个 Channel 对应一个 Buffer
- 一个线程对应 Selector ， 一个 Selector 对应多个 Channel（连接）
- 程序切换到哪个 Channel 是由事件决定的，Event 是一个重要的概念
- Selector 会根据不同的事件，在各个通道上切换
- Buffer 是一个内存块 ， 底层是一个数组
- 数据的读取写入是通过 Buffer 完成的 , BIO 中要么是输入流，或者是输出流，不能双向，NIO 的 Buffer 是可以读也可以写， flip() 切换 Buffer 的工作模式

Java NIO 系统的核心在于：通道和缓冲区，通道表示打开的 IO 设备（例如：文件、 套接字）的连接。若要使用 NIO 系统，获取用于连接 IO 设备的通道以及用于容纳数据的缓冲区，然后操作缓冲区，对数据进行处理。简而言之，Channel 负责传输， Buffer 负责存取数据

