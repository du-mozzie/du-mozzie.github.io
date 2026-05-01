---
order: 7
title: BIO：UDP
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# BIO：UDP

#### 基本介绍

UDP（User Datagram Protocol）协议的特点：

- 面向无连接的协议，发送端只管发送，不确认对方是否能收到，速度快，但是不可靠，会丢失数据
- 尽最大努力交付，没有拥塞控制
- 基于数据包进行数据传输，发送数据的包的大小限制 **64KB** 以内
- 支持一对一、一对多、多对一、多对多的交互通信

UDP 协议的使用场景：在线视频、网络语音、电话

#### 实现UDP

UDP 协议相关的两个类：

- DatagramPacket（数据包对象）：用来封装要发送或要接收的数据，比如：集装箱
- DatagramSocket（发送对象）：用来发送或接收数据包，比如：码头

**DatagramPacket**：

-  DatagramPacket 类：
   `public new DatagramPacket(byte[] buf, int length, InetAddress address, int port)`：创建发送端数据包对象 

-  buf：要发送的内容，字节数组
-  length：要发送内容的长度，单位是字节
-  address：接收端的IP地址对象
-  port：接收端的端口号

`public new DatagramPacket(byte[] buf, int length)`：创建接收端的数据包对象 

- buf：用来存储接收到内容
- length：能够接收内容的长度

- DatagramPacket 类常用方法： 

- `public int getLength()`：获得实际接收到的字节个数
- `public byte[] getData()`：返回数据缓冲区

**DatagramSocket**：

- DatagramSocket 类构造方法： 

- `protected DatagramSocket()`：创建发送端的 Socket 对象，系统会随机分配一个端口号
- `protected DatagramSocket(int port)`：创建接收端的 Socket 对象并指定端口号

- DatagramSocket 类成员方法： 

- `public void send(DatagramPacket dp)`：发送数据包
- `public void receive(DatagramPacket p)`：接收数据包
- `public void close()`：关闭数据报套接字

```java
public class UDPClientDemo {
    public static void main(String[] args) throws Exception {
        System.out.println("===启动客户端===");
        // 1.创建一个集装箱对象，用于封装需要发送的数据包!
        byte[] buffer = "我学Java".getBytes();
        DatagramPacket packet = new DatagramPacket(buffer,bubffer.length,InetAddress.getLoclHost,8000);
        // 2.创建一个码头对象
        DatagramSocket socket = new DatagramSocket();
        // 3.开始发送数据包对象
        socket.send(packet);
        socket.close();
    }
}
public class UDPServerDemo{
    public static void main(String[] args) throws Exception {
        System.out.println("==启动服务端程序==");
        // 1.创建一个接收客户都端的数据包对象（集装箱）
        byte[] buffer = new byte[1024*64];
        DatagramPacket packet = new DatagramPacket(buffer, bubffer.length);
        // 2.创建一个接收端的码头对象
        DatagramSocket socket = new DatagramSocket(8000);
        // 3.开始接收
        socket.receive(packet);
        // 4.从集装箱中获取本次读取的数据量
        int len = packet.getLength();
        // 5.输出数据
        // String rs = new String(socket.getData(), 0, len)
        String rs = new String(buffer , 0 , len);
        System.out.println(rs);
        // 6.服务端还可以获取发来信息的客户端的IP和端口。
        String ip = packet.getAddress().getHostAdress();
        int port = packet.getPort();
        socket.close();
    }
}
```

#### 通讯方式

UDP 通信方式：

-  单播：用于两个主机之间的端对端通信 
-  组播：用于对一组特定的主机进行通信
   IP : 224.0.1.0
   Socket 对象 : MulticastSocket 
-  广播：用于一个主机对整个局域网上所有主机上的数据通信
   IP : 255.255.255.255
   Socket 对象 : DatagramSocket 

