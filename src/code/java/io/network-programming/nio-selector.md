---
order: 14
title: NIO：选择器
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# NIO：选择器

#### 基本介绍

选择器（Selector） 是 SelectableChannle 对象的**多路复用器**，Selector 可以同时监控多个通道的状况，利用 Selector 可使一个单独的线程管理多个 Channel，**Selector 是非阻塞 IO 的核心**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877315508-abd3b7f0-dfdb-413f-b3d6-c6fff66a74ab.png)

- Selector 能够检测多个注册的通道上是否有事件发生（多个 Channel 以事件的方式可以注册到同一个 Selector)，如果有事件发生，就获取事件然后针对每个事件进行相应的处理，就可以只用一个单线程去管理多个通道，也就是管理多个连接和请求
- 只有在连接/通道真正有读写事件发生时，才会进行读写，就大大地减少了系统开销，并且不必为每个连接都创建一个线程，不用去维护多个线程
- 避免了多线程之间的上下文切换导致的开销

#### 常用API

创建 Selector：`Selector selector = Selector.open();`

向选择器注册通道：`SelectableChannel.register(Selector sel, int ops, Object att)`

- 参数一：选择器，指定当前 Channel 注册到的选择器
- 参数二：选择器对通道的监听事件，监听的事件类型用四个常量表示 

- 读 : SelectionKey.OP_READ （1）
- 写 : SelectionKey.OP_WRITE （4）
- 连接 : SelectionKey.OP_CONNECT （8）
- 接收 : SelectionKey.OP_ACCEPT （16）
- 若不止监听一个事件，使用位或操作符连接：`int interest = SelectionKey.OP_READ | SelectionKey.OP_WRITE`

- 参数三：可以关联一个附件，可以是任何对象

**Selector API**：

| 方法                                     | 说明                                        |
| ---------------------------------------- | ------------------------------------------- |
| public static Selector open()            | 打开选择器                                  |
| public abstract void close()             | 关闭此选择器                                |
| public abstract int select()             | **阻塞**选择一组通道准备好进行 I/O 操作的键 |
| public abstract int select(long timeout) | **阻塞**等待 timeout 毫秒                   |
| public abstract int selectNow()          | 获取一下，**不阻塞**，立刻返回              |
| public abstract Selector wakeup()        | 唤醒正在阻塞的 selector                     |
| public abstract Set selectedKeys()       | 返回此选择器的选择键集                      |

SelectionKey API:

| 方法                                        | 说明                                               |
| ------------------------------------------- | -------------------------------------------------- |
| public abstract void cancel()               | 取消该键的通道与其选择器的注册                     |
| public abstract SelectableChannel channel() | 返回创建此键的通道，该方法在取消键之后仍将返回通道 |
| public final Object attachment()            | 返回当前 key 关联的附件                            |
| public final boolean isAcceptable()         | 检测此密钥的通道是否已准备好接受新的套接字连接     |
| public final boolean isConnectable()        | 检测此密钥的通道是否已完成或未完成其套接字连接操作 |
| public final boolean isReadable()           | 检测此密钥的频道是否可以阅读                       |
| public final boolean isWritable()           | 检测此密钥的通道是否准备好进行写入                 |

基本步骤：

```java
//1.获取通道
ServerSocketChannel ssChannel = ServerSocketChannel.open();
//2.切换非阻塞模式
ssChannel.configureBlocking(false);
//3.绑定连接
ssChannel.bin(new InetSocketAddress(9999));
//4.获取选择器
Selector selector = Selector.open();
//5.将通道注册到选择器上，并且指定“监听接收事件”
ssChannel.register(selector, SelectionKey.OP_ACCEPT);
```

