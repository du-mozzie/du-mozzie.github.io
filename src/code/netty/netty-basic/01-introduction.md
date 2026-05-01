---
order: 1
title: 初识Netty
date: 2026-01-30
category: Netty
tag: Netty
timeline: true
article: true
---

## 初识Netty

先写个HelloWorld，了解Netty基本用法

> 服务端
```java
public static void main(String[] args) {
    // 启动器，负责组装Netty组件 启动服务器
    new ServerBootstrap()
            // BossEventLoop 和 WorkerEventLoop (selector, thread) group 组
            .group(new NioEventLoopGroup())
            // 选择服务器的ServerSocketChannel实现
            .channel(NioServerSocketChannel.class) // OIO BIO
            // boss 负责连接请求 worker(child) 负责读写 决定worker能执行哪些操作
            .childHandler(
                    // channel代表和客户端读写数据的通道 Initializer 初始化 负责添加handler
                    new ChannelInitializer<NioSocketChannel>() {
                        @Override
                        protected void initChannel(NioSocketChannel sc) {
                            // 添加具体的handler
                            // StringDecoder 解码器 负责将ByteBuf转换为String
                            sc.pipeline().addLast(new StringDecoder());
                            // ChannelInboundHandlerAdapter 适配器 负责处理业务逻辑
                            sc.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                                @Override
                                public void channelRead(ChannelHandlerContext ctx, Object msg) {
                                    // 打印上一个handler处理后的结果
                                    System.out.println(msg);
                                }
                            });
                        }
                    })
            // 绑定端口
            .bind(7000);
}
```

> 客户端
```java
public static void main(String[] args) throws InterruptedException {
    // 客户端启动器
    new Bootstrap()
            // 添加EventLoopGroup
            .group(new NioEventLoopGroup())
            // 客户端通道
            .channel(NioSocketChannel.class)
            // 添加处理器
            .handler(new ChannelInitializer<NioSocketChannel>() {
                @Override
                protected void initChannel(NioSocketChannel sc) {
                    // 编码器 负责将String转换为ByteBuf
                    sc.pipeline().addLast(new StringEncoder());
                }
            })
            // 连接到服务器
            .connect("localhost", 7000)
            // 等待连接完成
            .sync()
            // 获取通道
            .channel()
            // 发送数据
            .writeAndFlush("你好Netty!!");
}
```
