---
order: 8
title: BIO：TCP
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# BIO：TCP

#### 基本介绍

TCP/IP (Transfer Control Protocol) 协议，传输控制协议

TCP/IP 协议的特点：

- 面向连接的协议，提供可靠交互，速度慢
- 点对点的全双工通信
- 通过**三次握手**建立连接，连接成功形成数据传输通道；通过**四次挥手**断开连接
- 基于字节流进行数据传输，传输数据大小没有限制

TCP 协议的使用场景：文件上传和下载、邮件发送和接收、远程登录

注意：**TCP 不会为没有数据的 ACK 超时重传**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877313808-354ba9b2-838c-4ab4-87c5-d048f040bc1b.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314269-dee875b1-3d70-45c9-b7dc-0ba4de68ea2e.png)

推荐阅读：https://yuanrengu.com/2020/77eef79f.html

#### Socket

TCP 通信也叫 **Socket 网络编程**，只要代码基于 Socket 开发，底层就是基于了可靠传输的 TCP 通信

双向通信：Java Socket 是全双工的，在任意时刻，线路上存在 `A -> B` 和 `B -> A` 的双向信号传输，即使是阻塞 IO，读和写也是可以同时进行的，只要分别采用读线程和写线程即可，读不会阻塞写、写也不会阻塞读

TCP 协议相关的类：

- Socket：一个该类的对象就代表一个客户端程序。
- ServerSocket：一个该类的对象就代表一个服务器端程序。

Socket 类：

-  构造方法： 

-  `Socket(InetAddress address,int port)`：创建流套接字并将其连接到指定 IP 指定端口号 
-  `Socket(String host, int port)`：根据 IP 地址字符串和端口号创建客户端 Socket 对象
   注意事项：**执行该方法，就会立即连接指定的服务器，连接成功，则表示三次握手通过**，反之抛出异常 

-  常用 API： 

-  `OutputStream getOutputStream()`：获得字节输出流对象
-  `InputStream getInputStream()`：获得字节输入流对象
-  `void shutdownInput()`：停止接受
-  `void shutdownOutput()`：停止发送数据，终止通信
-  `SocketAddress getRemoteSocketAddress()`：返回套接字连接到的端点的地址，未连接返回 null

ServerSocket 类：

-  构造方法：`public ServerSocket(int port)` 
-  常用 API：`public Socket accept()`，**阻塞等待**接收一个客户端的 Socket 管道连接请求，连接成功返回一个 Socket 对象
   三次握手后 TCP 连接建立成功，服务器内核会把连接从 SYN 半连接队列（一次握手时在服务端建立的队列）中移出，移入 accept 全连接队列，等待进程调用 accept 函数时把连接取出。如果进程不能及时调用 accept 函数，就会造成 accept 队列溢出，最终导致建立好的 TCP 连接被丢弃 ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314251-4e909cbf-fc06-4edb-9435-88f6c0b18c13.png)

**相当于**客户端和服务器建立一个数据管道（虚连接，不是真正的物理连接），管道一般不用 close

#### 实现TCP

##### 开发流程

客户端的开发流程：

1. 客户端要请求于服务端的 Socket 管道连接
2. 从 Socket 通信管道中得到一个字节输出流
3. 通过字节输出流给服务端写出数据

服务端的开发流程：

1. 用 ServerSocket 注册端口
2. 接收客户端的 Socket 管道连接
3. 从 Socket 通信管道中得到一个字节输入流
4. 从字节输入流中读取客户端发来的数据

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314275-73944230-9433-448e-915c-b103360ebe15.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314341-67054877-44e7-420b-9c34-40f265fbcd1a.png)

- 如果输出缓冲区空间不够存放主机发送的数据，则会被阻塞，输入缓冲区同理
- 缓冲区不属于应用程序，属于内核
- TCP 从输出缓冲区读取数据会加锁阻塞线程

##### 实现通信

需求一：客户端发送一行数据，服务端接收一行数据

```java
public class ClientDemo {
    public static void main(String[] args) throws Exception {
        // 1.客户端要请求于服务端的socket管道连接。
        Socket socket = new Socket("127.0.0.1", 8080);
        // 2.从socket通信管道中得到一个字节输出流
        OutputStream os = socket.getOutputStream();
        // 3.把低级的字节输出流包装成高级的打印流。
        PrintStream ps = new PrintStream(os);
        // 4.开始发消息出去
        ps.println("我是客户端");
        ps.flush();//一般不关闭IO流
        System.out.println("客户端发送完毕~~~~");
    }
}
public class ServerDemo{
    public static void main(String[] args) throws Exception {
        System.out.println("----服务端启动----");
        // 1.注册端口: public ServerSocket(int port)
        ServerSocket serverSocket = new ServerSocket(8080);
        // 2.开始等待接收客户端的Socket管道连接。
        Socket socket = serverSocket.accept();
        // 3.从socket通信管道中得到一个字节输入流。
        InputStream is = socket.getInputStream();
        // 4.把字节输入流转换成字符输入流
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        // 6.按照行读取消息 。
        String line;
        if((line = br.readLine()) != null){
            System.out.println(line);
        }
    }
}
```

需求二：客户端可以反复发送数据，服务端可以反复数据

```java
public class ClientDemo {
    public static void main(String[] args) throws Exception {
        // 1.客户端要请求于服务端的socket管道连接。
        Socket socket = new Socket("127.0.0.1",8080);
        // 2.从socket通信管道中得到一个字节输出流
        OutputStream os = socket.getOutputStream();
        // 3.把低级的字节输出流包装成高级的打印流。
        PrintStream ps = new PrintStream(os);
        // 4.开始发消息出去
         while(true){
            Scanner sc = new Scanner(System.in);
            System.out.print("请说：");
            ps.println(sc.nextLine());
            ps.flush();
        }
    }
}
public class ServerDemo{
    public static void main(String[] args) throws Exception {
        System.out.println("----服务端启动----");
        // 1.注册端口: public ServerSocket(int port)
        ServerSocket serverSocket = new ServerSocket(8080);
        // 2.开始等待接收客户端的Socket管道连接。
        Socket socket = serverSocket.accept();
        // 3.从socket通信管道中得到一个字节输入流。
        InputStream is = socket.getInputStream();
        // 4.把字节输入流转换成字符输入流
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        // 6.按照行读取消息 。
        String line;
        while((line = br.readLine()) != null){
            System.out.println(line);
        }
    }
}
```

需求三：实现一个服务端可以同时接收多个客户端的消息

```java
public class ClientDemo {
    public static void main(String[] args) throws Exception {
        Socket socket = new Socket("127.0.0.1",8080);
        OutputStream os = new socket.getOutputStream();
        PrintStream ps = new PrintStream(os);
		while(true){
            Scanner sc = new Scanner(System.in);
            System.out.print("请说：");
            ps.println(sc.nextLine());
            ps.flush();
        }
    }
}
public class ServerDemo{
    public static void main(String[] args) throws Exception {
        System.out.println("----服务端启动----");
        ServerSocket serverSocket = new ServerSocket(8080);
        while(true){
            // 开始等待接收客户端的Socket管道连接。
             Socket socket = serverSocket.accept();
            // 每接收到一个客户端必须为这个客户端管道分配一个独立的线程来处理与之通信。
            new ServerReaderThread(socket).start();
        }
    }
}
class ServerReaderThread extends Thread{
    privat Socket socket;
    public ServerReaderThread(Socket socket){this.socket = socket;}
    @Override
    public void run() {
        try(InputStream is = socket.getInputStream();
           	BufferedReader br = new BufferedReader(new InputStreamReader(is))
           ){
            String line;
            while((line = br.readLine()) != null){
                sout(socket.getRemoteSocketAddress() + ":" + line);
            }
        }catch(Exception e){
            sout(socket.getRemoteSocketAddress() + "下线了~~~~~~");
        }
    }
}
```

##### 伪异步

一个客户端要一个线程，并发越高系统瘫痪的越快，可以在服务端引入线程池，使用线程池来处理与客户端的消息通信

-  优势：不会引起系统的死机，可以控制并发线程的数量 
-  劣势：同时可以并发的线程将受到限制 

```java
public class BIOServer {
    public static void main(String[] args) throws Exception {
        //线程池机制
        //创建一个线程池，如果有客户端连接，就创建一个线程，与之通讯(单独写一个方法)
        ExecutorService newCachedThreadPool = Executors.newCachedThreadPool();
        //创建ServerSocket
        ServerSocket serverSocket = new ServerSocket(6666);
        System.out.println("服务器启动了");
        while (true) {
            System.out.println("线程名字 = " + Thread.currentThread().getName());
            //监听，等待客户端连接
            System.out.println("等待连接....");
            final Socket socket = serverSocket.accept();
            System.out.println("连接到一个客户端");
            //创建一个线程，与之通讯
            newCachedThreadPool.execute(new Runnable() {
                public void run() {
                    //可以和客户端通讯
                    handler(socket);
                }
            });
        }
    }

    //编写一个handler方法，和客户端通讯
    public static void handler(Socket socket) {
        try {
            System.out.println("线程名字 = " + Thread.currentThread().getName());
            byte[] bytes = new byte[1024];
            //通过socket获取输入流
            InputStream inputStream = socket.getInputStream();
            int len;
            //循环的读取客户端发送的数据
            while ((len = inputStream.read(bytes)) != -1) {
                System.out.println("线程名字 = " + Thread.currentThread().getName());
                //输出客户端发送的数据
                System.out.println(new String(bytes, 0, read));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            System.out.println("关闭和client的连接");
            try {
                socket.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

#### 文件传输

##### 字节流

客户端：本地图片:  ‪E:\seazean\图片资源\beautiful.jpg
服务端：服务器路径：E:\seazean\图片服务器

UUID. randomUUID() : 方法生成随机的文件名

**socket.shutdownOutput()**：这个必须执行，不然服务器会一直循环等待数据，最后文件损坏，程序报错

```java
//常量包
public class Constants {
    public static final String SRC_IMAGE = "D:\\seazean\\图片资源\\beautiful.jpg";
    public static final String SERVER_DIR = "D:\\seazean\\图片服务器\\";
    public static final String SERVER_IP = "127.0.0.1";
    public static final int SERVER_PORT = 8888;

}
public class ClientDemo {
    public static void main(String[] args) throws Exception {
        Socket socket = new Socket(Constants.ERVER_IP,Constants.SERVER_PORT);
        BufferedOutputStream bos=new BufferedOutputStream(socket.getOutputStream());
        //提取本机的图片上传给服务端。Constants.SRC_IMAGE
        BufferedInputStream bis = new BufferedInputStream(new FileInputStream());
        byte[] buffer = new byte[1024];
        int len ;
        while((len = bis.read(buffer)) != -1) {
            bos.write(buffer, 0 ,len);
        }
        bos.flush();// 刷新图片数据到服务端！！
        socket.shutdownOutput();// 告诉服务端我的数据已经发送完毕，不要在等我了！
        bis.close();
        
        //等待着服务端的响应数据！！
        BufferedReader br = new BufferedReader(
           				 new InputStreamReader(socket.getInputStream()));
        System.out.println("收到服务端响应："+br.readLine());
    }
}
public class ServerDemo {
    public static void main(String[] args) throws Exception {
        System.out.println("----服务端启动----");
        // 1.注册端口: 
        ServerSocket serverSocket = new ServerSocket(Constants.SERVER_PORT);
        // 2.定义一个循环不断的接收客户端的连接请求
        while(true){
            // 3.开始等待接收客户端的Socket管道连接。
            Socket socket = serverSocket.accept();
            // 4.每接收到一个客户端必须为这个客户端管道分配一个独立的线程来处理与之通信。
            new ServerReaderThread(socket).start();
        }
    }
}
class ServerReaderThread extends Thread{
    private Socket socket ;
    public ServerReaderThread(Socket socket){this.socket = socket;}
    @Override
    public void run() {
        try{
            InputStream is = socket.getInputStream();
           	BufferedInputStream bis = new BufferedInputStream(is);
            BufferedOutputStream bos = new BufferedOutputStream(
                new FileOutputStream
                (Constants.SERVER_DIR+UUID.randomUUID().toString()+".jpg"));
            byte[] buffer = new byte[1024];
            int len;
            while((len = bis.read(buffer)) != -1){
                bos.write(buffer,0,len);
            }
            bos.close();
            System.out.println("服务端接收完毕了！");
            
            // 4.响应数据给客户端
            PrintStream ps = new PrintStream(socket.getOutputStream());
            ps.println("您好，已成功接收您上传的图片！");
            ps.flush();
            Thread.sleep(10000);
        }catch (Exception e){
            sout(socket.getRemoteSocketAddress() + "下线了");
        }
    }
}
```

##### 数据流

构造方法：

- `DataOutputStream(OutputStream out)` : 创建一个新的数据输出流，以将数据写入指定的底层输出流
- `DataInputStream(InputStream in)` : 创建使用指定的底层 InputStream 的 DataInputStream

常用API：

- `final void writeUTF(String str)` : 使用机器无关的方式使用 UTF-8 编码将字符串写入底层输出流
- `final String readUTF()` : 读取以 modified UTF-8 格式编码的 Unicode 字符串，返回 String 类型

```java
public class Client {
    public static void main(String[] args) {
		InputStream is = new FileInputStream("path");
            //  1、请求与服务端的Socket链接
            Socket socket = new Socket("127.0.0.1" , 8888);
            //  2、把字节输出流包装成一个数据输出流
            DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
            //  3、先发送上传文件的后缀给服务端
            dos.writeUTF(".png");
            //  4、把文件数据发送给服务端进行接收
            byte[] buffer = new byte[1024];
            int len;
            while((len = is.read(buffer)) > 0 ){
                dos.write(buffer , 0 , len);
            }
            dos.flush();
            Thread.sleep(10000);
    }
}

public class Server {
    public static void main(String[] args) {
        ServerSocket ss = new ServerSocket(8888);
        Socket socket = ss.accept();
 		// 1、得到一个数据输入流读取客户端发送过来的数据
		DataInputStream dis = new DataInputStream(socket.getInputStream());
		// 2、读取客户端发送过来的文件类型
		String suffix = dis.readUTF();
		// 3、定义一个字节输出管道负责把客户端发来的文件数据写出去
		OutputStream os = new FileOutputStream("path"+
                    UUID.randomUUID().toString()+suffix);
		// 4、从数据输入流中读取文件数据，写出到字节输出流中去
		byte[] buffer = new byte[1024];
		int len;
		while((len = dis.read(buffer)) > 0){
 			os.write(buffer,0, len);
		}
		os.close();
		System.out.println("服务端接收文件保存成功！");
    }
}
```

