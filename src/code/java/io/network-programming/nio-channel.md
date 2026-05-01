---
order: 13
title: NIO：通道
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# NIO：通道

#### 基本介绍

通道（Channel）：表示 IO 源与目标打开的连接，Channel 类似于传统的流，只不过 Channel 本身不能直接访问数据，Channel 只能与 Buffer **进行交互**

1.  NIO 的通道类似于流，但有些区别如下： 

- 通道可以同时进行读写，而流只能读或者只能写
- 通道可以实现异步读写数据
- 通道可以从缓冲读数据，也可以写数据到缓冲

1.  BIO 中的 Stream 是单向的，NIO 中的 Channel 是双向的，可以读操作，也可以写操作 
2.  Channel 在 NIO 中是一个接口：`public interface Channel extends Closeable{}` 

Channel 实现类：

-  FileChannel：用于读取、写入、映射和操作文件的通道，**只能工作在阻塞模式下** 

-  通过 FileInputStream 获取的 Channel 只能读
-  通过 FileOutputStream 获取的 Channel 只能写
-  通过 RandomAccessFile 是否能读写根据构造 RandomAccessFile 时的读写模式决定

-  DatagramChannel：通过 UDP 读写网络中的数据通道 
-  SocketChannel：通过 TCP 读写网络中的数据 
-  ServerSocketChannel：可以**监听**新进来的 TCP 连接，对每一个新进来的连接都会创建一个 SocketChannel
   提示：ServerSocketChanne 类似 ServerSocket、SocketChannel 类似 Socket 

#### 常用API

获取 Channel 方式：

- 对支持通道的对象调用 `getChannel()` 方法
- 通过通道的静态方法 `open()` 打开并返回指定通道
- 使用 Files 类的静态方法 `newByteChannel()` 获取字节通道

Channel 基本操作：**读写都是相对于内存来看，也就是缓冲区**

| 方法                                       | 说明                                                     |
| ------------------------------------------ | -------------------------------------------------------- |
| public abstract int read(ByteBuffer dst)   | 从 Channel 中读取数据到 ByteBuffer，从 position 开始储存 |
| public final long read(ByteBuffer[] dsts)  | 将 Channel 中的数据分散到 ByteBuffer[]                   |
| public abstract int write(ByteBuffer src)  | 将 ByteBuffer 中的数据写入 Channel，从 position 开始写出 |
| public final long write(ByteBuffer[] srcs) | 将 ByteBuffer[] 到中的数据聚集到 Channel                 |
| public abstract long position()            | 返回此通道的文件位置                                     |
| FileChannel position(long newPosition)     | 设置此通道的文件位置                                     |
| public abstract long size()                | 返回此通道的文件的当前大小                               |

**SelectableChannel 的操作 API**：

| 方法                                                     | 说明                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| SocketChannel accept()                                   | 如果通道处于非阻塞模式，没有请求连接时此方法将立即返回 NULL，否则将阻塞直到有新的连接或发生 I/O 错误，**通过该方法返回的套接字通道将处于阻塞模式** |
| SelectionKey register(Selector sel, int ops)             | 将通道注册到选择器上，并指定监听事件                         |
| SelectionKey register(Selector sel, int ops, Object att) | 将通道注册到选择器上，并在当前通道**绑定一个附件对象**，Object 代表可以是任何类型 |

#### 文件读写

```java
public class ChannelTest {
    @Test
	public void write() throws Exception{
 		// 1、字节输出流通向目标文件
        FileOutputStream fos = new FileOutputStream("data01.txt");
        // 2、得到字节输出流对应的通道  【FileChannel】
        FileChannel channel = fos.getChannel();
        // 3、分配缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        buffer.put("hello,黑马Java程序员！".getBytes());
        // 4、把缓冲区切换成写出模式
        buffer.flip();
        channel.write(buffer);
        channel.close();
        System.out.println("写数据到文件中！");
    }
    @Test
    public void read() throws Exception {
        // 1、定义一个文件字节输入流与源文件接通
        FileInputStream fis = new FileInputStream("data01.txt");
        // 2、需要得到文件字节输入流的文件通道
        FileChannel channel = fis.getChannel();
        // 3、定义一个缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        // 4、读取数据到缓冲区
        channel.read(buffer);
        buffer.flip();
        // 5、读取出缓冲区中的数据并输出即可
        String rs = new String(buffer.array(),0,buffer.remaining());
        System.out.println(rs);
    }
}
```

#### 文件复制

Channel 的方法：**sendfile 实现零拷贝**

-  `abstract long transferFrom(ReadableByteChannel src, long position, long count)`：从给定的可读字节通道将字节传输到该通道的文件中 

-  src：源通道
-  position：文件中要进行传输的位置，必须是非负的
-  count：要传输的最大字节数，必须是非负的

-  `abstract long transferTo(long position, long count, WritableByteChannel target)`：将该通道文件的字节传输到给定的可写字节通道。 

-  position：传输开始的文件中的位置; 必须是非负的
-  count：要传输的最大字节数; 必须是非负的
-  target：目标通道

文件复制的两种方式：

1. Buffer
2. 使用上述两种方法

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314980-2f4d204b-2aa3-4af1-b16c-be555b80eff7.png)

```java
public class ChannelTest {
    @Test
    public void copy1() throws Exception {
        File srcFile = new File("C:\\壁纸.jpg");
        File destFile = new File("C:\\Users\\壁纸new.jpg");
        // 得到一个字节字节输入流
        FileInputStream fis = new FileInputStream(srcFile);
        // 得到一个字节输出流
        FileOutputStream fos = new FileOutputStream(destFile);
        // 得到的是文件通道
        FileChannel isChannel = fis.getChannel();
        FileChannel osChannel = fos.getChannel();
        // 分配缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        while(true){
            // 必须先清空缓冲然后再写入数据到缓冲区
            buffer.clear();
            // 开始读取一次数据
            int flag = isChannel.read(buffer);
            if(flag == -1){
                break;
            }
            // 已经读取了数据 ，把缓冲区的模式切换成可读模式
            buffer.flip();
            // 把数据写出到
            osChannel.write(buffer);
        }
        isChannel.close();
        osChannel.close();
        System.out.println("复制完成！");
    }
    
	@Test
	public void copy02() throws Exception {
    	// 1、字节输入管道
   	 	FileInputStream fis = new FileInputStream("data01.txt");
   	 	FileChannel isChannel = fis.getChannel();
    	// 2、字节输出流管道
    	FileOutputStream fos = new FileOutputStream("data03.txt");
    	FileChannel osChannel = fos.getChannel();
    	// 3、复制
    	osChannel.transferFrom(isChannel,isChannel.position(),isChannel.size());
    	isChannel.close();
    	osChannel.close();
	}
    
	@Test
	public void copy03() throws Exception {
    	// 1、字节输入管道
    	FileInputStream fis = new FileInputStream("data01.txt");
    	FileChannel isChannel = fis.getChannel();
    	// 2、字节输出流管道
    	FileOutputStream fos = new FileOutputStream("data04.txt");
    	FileChannel osChannel = fos.getChannel();
    	// 3、复制
    	isChannel.transferTo(isChannel.position() , isChannel.size() , osChannel);
    	isChannel.close();
    	osChannel.close();
	}
}
```

#### 分散聚集

分散读取（Scatter ）：是指把 Channel 通道的数据读入到多个缓冲区中去

聚集写入（Gathering ）：是指将多个 Buffer 中的数据聚集到 Channel

```java
public class ChannelTest {
    @Test
    public void test() throws IOException{
    	// 1、字节输入管道
        FileInputStream is = new FileInputStream("data01.txt");
        FileChannel isChannel = is.getChannel();
        // 2、字节输出流管道
        FileOutputStream fos = new FileOutputStream("data02.txt");
        FileChannel osChannel = fos.getChannel();
        // 3、定义多个缓冲区做数据分散
        ByteBuffer buffer1 = ByteBuffer.allocate(4);
        ByteBuffer buffer2 = ByteBuffer.allocate(1024);
        ByteBuffer[] buffers = {buffer1 , buffer2};
        // 4、从通道中读取数据分散到各个缓冲区
        isChannel.read(buffers);
        // 5、从每个缓冲区中查询是否有数据读取到了
        for(ByteBuffer buffer : buffers){
            buffer.flip();// 切换到读数据模式
            System.out.println(new String(buffer.array() , 0 , buffer.remaining()));
        }
        // 6、聚集写入到通道
        osChannel.write(buffers);
        isChannel.close();
        osChannel.close();
        System.out.println("文件复制~~");
    }
}
```

