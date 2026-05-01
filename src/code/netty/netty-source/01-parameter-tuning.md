---
order: 1
title: 参数优化
date: 2026-02-13
category: Netty
tag: Netty
timeline: true
article: true
---

## 参数优化

参数配置：

| TCP层        | Netty对象           | 方法          |
| ------------ | ------------------- | ------------- |
| ServerSocket | ServerSocketChannel | opetion()     |
| Socket       | SocketChannel       | childOption() |

`option()` 控制 **服务器入口**，
`childOption()` 控制 **连接行为**。

### CONNECT_TIMEOUT_MILLIS

* 属于 SocketChannal 参数
* 用在客户端建立连接时，如果在指定毫秒内无法连接，会抛出 timeout 异常

* SO_TIMEOUT 主要用在阻塞 IO，阻塞 IO 中 accept，read 等都是无限等待的，如果不希望永远阻塞，使用它调整超时时间

```java
@Slf4j
public class TestConnectionTimeout {
    public static void main(String[] args) {
        NioEventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap()
                    .group(group)
                    .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 300)
                    .channel(NioSocketChannel.class)
                    .handler(new LoggingHandler());
            ChannelFuture future = bootstrap.connect("127.0.0.1", 8080);
            future.sync().channel().closeFuture().sync(); // 断点1
        } catch (Exception e) {
            e.printStackTrace();
            log.debug("timeout");
        } finally {
            group.shutdownGracefully();
        }
    }
}
```

另外源码部分 `io.netty.channel.nio.AbstractNioChannel.AbstractNioUnsafe#connect`

```java
@Override
public final void connect(
        final SocketAddress remoteAddress, final SocketAddress localAddress, final ChannelPromise promise) {
    // ...
    // Schedule connect timeout.
    int connectTimeoutMillis = config().getConnectTimeoutMillis();
    if (connectTimeoutMillis > 0) {
        connectTimeoutFuture = eventLoop().schedule(new Runnable() {
            @Override
            public void run() {                
                ChannelPromise connectPromise = AbstractNioChannel.this.connectPromise;
                ConnectTimeoutException cause =
                    new ConnectTimeoutException("connection timed out: " + remoteAddress); // 断点2
                if (connectPromise != null && connectPromise.tryFailure(cause)) {
                    close(voidPromise());
                }
            }
        }, connectTimeoutMillis, TimeUnit.MILLISECONDS);
    }
	// ...
}
```

### SO_BACKLOG

- 属于 ServerSocketChannal 参数

  ```mermaid
  sequenceDiagram
  
  participant c as client
  participant s as server
  participant sq as syns queue
  participant aq as accept queue
  
  s ->> s : bind()
  s ->> s : listen()
  c ->> c : connect()
  c ->> s : 1. SYN
  Note left of c : SYN_SEND
  s ->> sq : put
  Note right of s : SYN_RCVD
  s ->> c : 2. SYN + ACK
  Note left of c : ESTABLISHED
  c ->> s : 3. ACK
  sq ->> aq : put
  Note right of s : ESTABLISHED
  aq -->> s : 
  s ->> s : accept()
  ```

  1. 第一次握手，client 发送 SYN 到 server，状态修改为 SYN_SEND，server 收到，状态改变为 SYN_REVD，并将该请求放入 sync queue 队列
  2. 第二次握手，server 回复 SYN + ACK 给 client，client 收到，状态改变为 ESTABLISHED，并发送 ACK 给 server
  3. 第三次握手，server 收到 ACK，状态改变为 ESTABLISHED，将该请求从 sync queue 放入 accept queue

  其中

  * 在 linux 2.2 之前，backlog 大小包括了两个队列的大小，在 2.2 之后，分别用下面两个参数来控制

  * sync queue - 半连接队列
    * 大小通过 /proc/sys/net/ipv4/tcp_max_syn_backlog 指定，在 `syncookies` 启用的情况下，逻辑上没有最大值限制，这个设置便被忽略
  * accept queue - 全连接队列
    * 其大小通过 /proc/sys/net/core/somaxconn 指定，在使用 listen 函数时，内核会根据传入的 backlog 参数与系统参数，取二者的较小值
    * 如果 accpet queue 队列满了，server 将发送一个拒绝连接的错误信息到 client

  Netty 中

  可以通过  option(ChannelOption.SO_BACKLOG, 值) 来设置大小

  可以通过下面源码查看默认大小

  ```java
  public class DefaultServerSocketChannelConfig extends DefaultChannelConfig
                                                implements ServerSocketChannelConfig {
  
      private volatile int backlog = NetUtil.SOMAXCONN;
      // ...
  }
  ```
  
  调试关键断点为：`io.netty.channel.nio.NioEventLoop#processSelectedKey`
  
  oio 中更容易说明，不用 debug 模式

  ```java
  public class Server {
      public static void main(String[] args) throws IOException {
          ServerSocket ss = new ServerSocket(8888, 2);
          Socket accept = ss.accept();
          System.out.println(accept);
          System.in.read();
      }
  }
  ```
  
  客户端启动 4 个
  
  ```java
  public class Client {
      public static void main(String[] args) throws IOException {
          try {
              Socket s = new Socket();
              System.out.println(new Date()+" connecting...");
              s.connect(new InetSocketAddress("localhost", 8888),1000);
              System.out.println(new Date()+" connected...");
              s.getOutputStream().write(1);
              System.in.read();
          } catch (IOException e) {
              System.out.println(new Date()+" connecting timeout...");
              e.printStackTrace();
          }
      }
  }
  ```
  
  第 1，2，3 个客户端都打印，但除了第一个处于 accpet 外，其它两个都处于 accept queue 中
  
  ```java
  Tue Apr 21 20:30:28 CST 2020 connecting...
  Tue Apr 21 20:30:28 CST 2020 connected...
  ```
  
  第 4 个客户端连接时
  
  ```
  Tue Apr 21 20:53:58 CST 2020 connecting...
  Tue Apr 21 20:53:59 CST 2020 connecting timeout...
  java.net.SocketTimeoutException: connect timed out
  ```

### ulimit -n

操作系统参数，进程最多可以打开的文件描述符数量，linux默认1024

超过会发生什么？

```java
java.io.IOException: Too many open files
```

Netty表现为：

- 新连接无法建立
- accept失败
- Redis/Kafka连接异常
- 服务看起来“随机挂”

> 推荐配置

常见配置：

```bash
ulimit -n 65535
```

高并发场景：

```bash
ulimit -n 200000
```

永久修改：

```bash
/etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
```

### TCP_NODELAY

SocketChannal 参数，是否启用 **Nagle 算法**

Nagle 算法？

TCP 为了减少小包发送，会：

```
等待多个小数据包 → 合并 → 一次发送
```

目的：减少网络包数量，但是会增加延迟

> Netty默认建议开启 TCP_NODELAY参数

```
ServerBootstrap bootstrap = new ServerBootstrap();

bootstrap
    .group(bossGroup, workerGroup)
    .channel(NioServerSocketChannel.class)
    .childOption(ChannelOption.TCP_NODELAY, true);

ChannelOption.TCP_NODELAY = true
关闭 Nagle 算法
```

Netty典型场景：

- RPC调用
- IM消息
- 实时数据
- 微服务调用

特点：

```
小包多 + 低延迟要求高
```

如果不开：

- 请求延迟增加
- RT抖动
- TPS下降

| 维度   | 开启 Nagle（默认） | 关闭 Nagle（TCP_NODELAY） |
| ------ | ------------------ | ------------------------- |
| 目标   | 网络效率           | 低延迟                    |
| 包数量 | 少                 | 多                        |
| 吞吐   | 高                 | 略低                      |
| 延迟   | 高                 | 低                        |
| 适合   | 文件传输           | RPC / Netty               |

### SO_SNDBUF & SO_RCVB

* SO_SNDBUF 属于 SocketChannal 参数
* SO_RCVBUF 既可用于 SocketChannal 参数，也可以用于 ServerSocketChannal 参数（建议设置到 ServerSocketChannal 上）

### ALLOCATOR

* 属于 SocketChannal 参数
* 用来分配 ByteBuf， ctx.alloc()

### RCVBUF_ALLOCATOR

* 属于 SocketChannal 参数
* 控制 netty 接收缓冲区大小
* 负责入站数据的分配，决定入站缓冲区的大小（并可动态调整），统一采用 direct 直接内存，具体池化还是非池化由 allocator 决定
