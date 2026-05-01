---
order: 15
title: NIO：NIO实现
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# NIO：NIO实现

#### 常用API

-  SelectableChannel_API 

| 方法                                                         | 说明                                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| public final SelectableChannel configureBlocking(boolean block) | 设置此通道的阻塞模式                         |
| public final SelectionKey register(Selector sel, int ops)    | 向给定的选择器注册此通道，并选择关注的的事件 |

-  SocketChannel_API： 

| 方法                                                    | 说明                           |
| ------------------------------------------------------- | ------------------------------ |
| public static SocketChannel open()                      | 打开套接字通道                 |
| public static SocketChannel open(SocketAddress remote)  | 打开套接字通道并连接到远程地址 |
| public abstract boolean connect(SocketAddress remote)   | 连接此通道的到远程地址         |
| public abstract SocketChannel bind(SocketAddress local) | 将通道的套接字绑定到本地地址   |
| public abstract SocketAddress getLocalAddress()         | 返回套接字绑定的本地套接字地址 |
| public abstract SocketAddress getRemoteAddress()        | 返回套接字连接的远程套接字地址 |

-  ServerSocketChannel_API： 

| 方法                                                       | 说明                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| public static ServerSocketChannel open()                   | 打开服务器套接字通道                                         |
| public final ServerSocketChannel bind(SocketAddress local) | 将通道的套接字绑定到本地地址，并配置套接字以监听连接         |
| public abstract SocketChannel accept()                     | 接受与此通道套接字的连接，通过此方法返回的套接字通道将处于阻塞模式 |

- 如果 ServerSocketChannel 处于非阻塞模式，如果没有挂起连接，则此方法将立即返回 null
- 如果通道处于阻塞模式，如果没有挂起连接将无限期地阻塞，直到有新的连接或发生 I/O 错误

#### 代码实现

服务端 ：

1.  获取通道，当客户端连接服务端时，服务端会通过 `ServerSocketChannel.accept` 得到 SocketChannel 
2.  切换非阻塞模式 
3.  绑定连接 
4.  获取选择器 
5.  将通道注册到选择器上，并且指定监听接收事件 
6.  **轮询式**的获取选择器上已经准备就绪的事件 

客户端：

1. 获取通道：`SocketChannel sc = SocketChannel.open(new InetSocketAddress(HOST, PORT))`
2. 切换非阻塞模式
3. 分配指定大小的缓冲区：`ByteBuffer buffer = ByteBuffer.allocate(1024)`
4. 发送数据给服务端

37 行代码，如果判断条件改为 !=-1，需要客户端 close 一下

```java
public class Server {
    public static void main(String[] args){
        // 1、获取通道
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        // 2、切换为非阻塞模式
        serverSocketChannel.configureBlocking(false);
        // 3、绑定连接的端口
        serverSocketChannel.bind(new InetSocketAddress(9999));
        // 4、获取选择器Selector
        Selector selector = Selector.open();
        // 5、将通道都注册到选择器上去，并且开始指定监听接收事件
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
		// 6、使用Selector选择器阻塞等待轮已经就绪好的事件
        while (selector.select() > 0) {
            System.out.println("----开始新一轮的时间处理----");
            // 7、获取选择器中的所有注册的通道中已经就绪好的事件
            Set<SelectionKey> selectionKeys = selector.selectedKeys();
            Iterator<SelectionKey> it = selectionKeys.iterator();
            // 8、开始遍历这些准备好的事件
            while (it.hasNext()) {
                SelectionKey key = it.next();// 提取当前这个事件
                // 9、判断这个事件具体是什么
                if (key.isAcceptable()) {
                    // 10、直接获取当前接入的客户端通道
                    SocketChannel socketChannel = serverSocketChannel.accept();
                    // 11 、切换成非阻塞模式
                    socketChannel.configureBlocking(false);
                    /*
                     ByteBuffer buffer = ByteBuffer.allocate(16);
                	 // 将一个 byteBuffer 作为附件【关联】到 selectionKey 上
                	 SelectionKey scKey = sc.register(selector, 0, buffer);
                    */
                    // 12、将本客户端通道注册到选择器
                    socketChannel.register(selector, SelectionKey.OP_READ);
                } else if (key.isReadable()) {
                    // 13、获取当前选择器上的读就绪事件
                    SelectableChannel channel = key.channel();
                    SocketChannel socketChannel = (SocketChannel) channel;
                    // 14、读取数据
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    // 获取关联的附件
                    // ByteBuffer buffer = (ByteBuffer) key.attachment();
                    int len;
                    while ((len = socketChannel.read(buffer)) > 0) {
                        buffer.flip();
                        System.out.println(socketChannel.getRemoteAddress() + ":" + new String(buffer.array(), 0, len));
                        buffer.clear();// 清除之前的数据
                    }
                }
                // 删除当前的 selectionKey，防止重复操作
                it.remove();
            }
        }
    }
}
public class Client {
    public static void main(String[] args) throws Exception {
        // 1、获取通道
        SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 9999));
        // 2、切换成非阻塞模式
        socketChannel.configureBlocking(false);
        // 3、分配指定缓冲区大小
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        // 4、发送数据给服务端
        Scanner sc = new Scanner(System.in);
        while (true){
            System.out.print("请说：");
            String msg = sc.nextLine();
            buffer.put(("Client：" + msg).getBytes());
            buffer.flip();
            socketChannel.write(buffer);
            buffer.clear();
        }
    }
}
```

