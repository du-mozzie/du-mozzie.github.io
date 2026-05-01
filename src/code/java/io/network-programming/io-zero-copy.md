---
order: 5
title: I/O：零拷贝
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# I/O：零拷贝

#### DMA

DMA (Direct Memory Access) ：直接存储器访问，让外部设备不通过 CPU 直接与系统内存交换数据的接口技术

作用：可以解决批量数据的输入/输出问题，使数据的传送速度取决于存储器和外设的工作速度

把内存数据传输到网卡然后发送：

- 没有 DMA：CPU 读内存数据到 CPU 高速缓存，再写到网卡，这样就把 CPU 的速度拉低到和网卡一个速度
- 使用 DMA：把数据读到 Socket 内核缓存区（CPU 复制），CPU 分配给 DMA 开始**异步**操作，DMA 读取 Socket 缓冲区到 DMA 缓冲区，然后写到网卡。DMA 执行完后**中断**（就是通知） CPU，这时 Socket 内核缓冲区为空，CPU 从用户态切换到内核态，执行中断处理程序，将需要使用 Socket 缓冲区的阻塞进程移到就绪队列

一个完整的 DMA 传输过程必须经历 DMA 请求、DMA 响应、DMA 传输、DMA 结束四个步骤：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877313262-36ec3c50-ac46-46aa-88b6-a9c11011ff6e.png)

DMA 方式是一种完全由硬件进行信息传送的控制方式，通常系统总线由 CPU 管理，在 DMA 方式中，CPU 的主存控制信号被禁止使用，CPU 把总线（地址总线、数据总线、控制总线）让出来由 DMA 控制器接管，用来控制传送的字节数、判断 DMA 是否结束、以及发出 DMA 结束信号，所以 DMA 控制器必须有以下功能：

- 接受外设发出的 DMA 请求，并向 CPU 发出总线接管请求
- 当 CPU 发出允许接管信号后，进入 DMA 操作周期
- 确定传送数据的主存单元地址及长度，并自动修改主存地址计数和传送长度计数
- 规定数据在主存和外设间的传送方向，发出读写等控制信号，执行数据传送操作
- 判断 DMA 传送是否结束，发出 DMA 结束信号，使 CPU 恢复正常工作状态（中断）

#### BIO

传统的 I/O 操作进行了 4 次用户空间与内核空间的上下文切换，以及 4 次数据拷贝：

- JVM 发出 read 系统调用，OS 上下文切换到内核模式（切换 1）并将数据从网卡或硬盘等设备通过 DMA 读取到内核空间缓冲区（拷贝 1），内核缓冲区实际上是**磁盘高速缓存（PageCache）**
- OS 内核将数据复制到用户空间缓冲区（拷贝 2），然后 read 系统调用返回，又会导致一次内核空间到用户空间的上下文切换（切换 2）
- JVM 处理代码逻辑并发送 write() 系统调用，OS 上下文切换到内核模式（切换3）并从用户空间缓冲区复制数据到内核空间缓冲区（拷贝3）
- 将内核空间缓冲区中的数据写到 hardware（拷贝4），write 系统调用返回，导致内核空间到用户空间的再次上下文切换（切换4）

流程图中的箭头反过来也成立，可以从网卡获取数据

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877313288-4ea522b3-28ca-4f31-9178-688ff53e31cd.png)

read 调用图示：read、write 都是系统调用指令

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877313668-a0f3b00f-5e64-46bc-8d07-e621dcf5cdf7.png)

#### mmap

mmap（Memory Mapped Files）内存映射加 write 实现零拷贝，**零拷贝就是没有数据从内核空间复制到用户空间**

用户空间和内核空间都使用内存，所以可以共享同一块物理内存地址，省去用户态和内核态之间的拷贝。写网卡时，共享空间的内容拷贝到 Socket 缓冲区，然后交给 DMA 发送到网卡，只需要 3 次复制

进行了 4 次用户空间与内核空间的上下文切换，以及 3 次数据拷贝（2 次 DMA，一次 CPU 复制）：

- 发出 mmap 系统调用，DMA 拷贝到内核缓冲区，映射到共享缓冲区；mmap 系统调用返回，无需拷贝
- 发出 write 系统调用，将数据从内核缓冲区拷贝到内核 Socket 缓冲区；write 系统调用返回，DMA 将内核空间 Socket 缓冲区中的数据传递到协议引擎

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877313704-13affa58-a5d3-410c-acd1-8821d3c5c2f0.png)

原理：利用操作系统的 Page 来实现文件到物理内存的直接映射，完成映射后对物理内存的操作会**被同步**到硬盘上

缺点：不可靠，写到 mmap 中的数据并没有被真正的写到硬盘，操作系统会在程序主动调用 flush 的时候才把数据真正的写到硬盘

Java NIO 提供了 **MappedByteBuffer** 类可以用来实现 mmap 内存映射，MappedByteBuffer 类对象**只能通过调用** `**FileChannel.map()**` **获取**

#### sendfile

sendfile 实现零拷贝，打开文件的文件描述符 fd 和 socket 的 fd 传递给 sendfile，然后经过 3 次复制和 2 次用户态和内核态的切换

原理：数据根本不经过用户态，直接从内核缓冲区进入到 Socket Buffer，由于和用户态完全无关，就减少了两次上下文切换

说明：零拷贝技术是不允许进程对文件内容作进一步的加工的，比如压缩数据再发送

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877313805-13973f70-dee0-4c43-9139-a7c14555d1d9.png)

sendfile2.4 之后，sendfile 实现了更简单的方式，文件到达内核缓冲区后，不必再将数据全部复制到 socket buffer 缓冲区，而是只**将记录数据位置和长度相关等描述符信息**保存到 socket buffer，DMA 根据 Socket 缓冲区中描述符提供的位置和偏移量信息直接将内核空间缓冲区中的数据拷贝到协议引擎上（2 次复制 2 次切换）

Java NIO 对 sendfile 的支持是 `FileChannel.transferTo()/transferFrom()`，把磁盘文件读取 OS 内核缓冲区后的 fileChannel，直接转给 socketChannel 发送，底层就是 sendfile

参考文章：https://blog.csdn.net/hancoder/article/details/112149121

