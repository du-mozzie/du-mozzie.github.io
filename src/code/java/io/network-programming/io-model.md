---
order: 2
title: I/O：IO模型
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# I/O：IO模型

#### 五种模型

对于一个套接字上的输入操作，第一步是等待数据从网络中到达，当数据到达时被复制到内核中的某个缓冲区。第二步就是把数据从内核缓冲区复制到应用进程缓冲区

Linux 有五种 I/O 模型：

- 阻塞式 I/O
- 非阻塞式 I/O
- I/O 复用（select 和 poll）
- 信号驱动式 I/O（SIGIO）
- 异步 I/O（AIO）

五种模型对比：

- 同步 I/O 包括阻塞式 I/O、非阻塞式 I/O、I/O 复用和信号驱动 I/O ，它们的主要区别在第一个阶段，非阻塞式 I/O 、信号驱动 I/O 和异步 I/O 在第一阶段不会阻塞

- 同步 I/O：将数据从内核缓冲区复制到应用进程缓冲区的阶段（第二阶段），应用进程会阻塞
- 异步 I/O：第二阶段应用进程不会阻塞

#### 阻塞式IO

应用进程通过系统调用 recvfrom 接收数据，会被阻塞，直到数据从内核缓冲区复制到应用进程缓冲区中才返回。阻塞不意味着整个操作系统都被阻塞，其它应用进程还可以执行，只是当前阻塞进程不消耗 CPU 时间，这种模型的 CPU 利用率会比较高

recvfrom() 用于**接收 Socket 传来的数据，并复制到应用进程的缓冲区 buf 中**，把 recvfrom() 当成系统调用

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877312490-f4d5aa1d-ca44-412a-87ee-0e4a7c5f690c.png)

#### 非阻塞式

应用进程通过 recvfrom 调用不停的去和内核交互，直到内核准备好数据。如果没有准备好数据，内核返回一个错误码，过一段时间应用进程再执行 recvfrom 系统调用，在两次发送请求的时间段，进程可以进行其他任务，这种方式称为轮询（polling）

由于 CPU 要处理更多的系统调用，因此这种模型的 CPU 利用率比较低

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877312467-49203424-a7df-4913-9bd6-657680128e6f.png)

#### 信号驱动

应用进程使用 sigaction 系统调用，内核立即返回，应用进程可以继续执行，等待数据阶段应用进程是非阻塞的。当内核数据准备就绪时向应用进程发送 SIGIO 信号，应用进程收到之后在信号处理程序中调用 recvfrom 将数据从内核复制到应用进程中

相比于非阻塞式 I/O 的轮询方式，信号驱动 I/O 的 CPU 利用率更高

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877312497-9ff2fb9a-6309-4948-86dd-59535f168a5b.png)

#### IO 复用

IO 复用模型使用 select 或者 poll 函数等待数据，select 会监听所有注册好的 IO，**等待多个套接字中的任何一个变为可读**，等待过程会被阻塞，当某个套接字准备好数据变为可读时 select 调用就返回，然后调用 recvfrom 把数据从内核复制到进程中

IO 复用让单个进程具有处理多个 I/O 事件的能力，又被称为 Event Driven I/O，即**事件驱动 I/O**

如果一个 Web 服务器没有 I/O 复用，那么每一个 Socket 连接都要创建一个线程去处理，如果同时有几万个连接，就需要创建相同数量的线程。相比于多进程和多线程技术，I/O 复用不需要进程线程创建和切换的开销，系统开销更小

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877312578-7c8ed9c9-f015-4e90-83f7-b7cbc643d643.png)

#### 异步 IO

应用进程执行 aio_read 系统调用会立即返回，给内核传递描述符、缓冲区指针、缓冲区大小等。应用进程可以继续执行不会被阻塞，内核会在所有操作完成之后向应用进程发送信号

异步 I/O 与信号驱动 I/O 的区别在于，异步 I/O 的信号是通知应用进程 I/O 完成，而信号驱动 I/O 的信号是通知应用进程可以开始 I/O

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877312488-57fbe5e0-1bec-47fa-ad07-9a82e9f53f9b.png)

