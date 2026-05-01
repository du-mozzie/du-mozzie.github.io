---
order: 2
title: 网络编程
date: 2026-01-20
category: Netty
tag: Netty
timeline: true
article: true
---

### 网络编程

#### 阻塞模式

* 阻塞模式下，相关方法都会导致线程暂停
  * ServerSocketChannel.accept 会在没有连接建立时让线程暂停
  * SocketChannel.read 会在没有数据可读时让线程暂停
  * 阻塞的表现其实就是线程暂停了，暂停期间不会占用 cpu，但线程相当于闲置
* 单线程下，阻塞方法之间相互影响，几乎不能正常工作，需要多线程支持
* 但多线程下，有新的问题，体现在以下方面
  * 32 位 jvm 一个线程 320k，64 位 jvm 一个线程 1024k，如果连接数过多，必然导致 OOM，并且线程太多，反而会因为频繁上下文切换导致性能降低
  * 可以采用线程池技术来减少线程数和线程上下文切换，但治标不治本，如果有很多连接建立，但长时间 inactive，会阻塞线程池中所有线程，因此不适合长连接，只适合短连接

> 服务器端

```java
public static void main(String[] args) {
    try {
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        // 使用open()方法打开一个ServerSocketChannel
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        // 绑定监听端口
        serverSocketChannel.bind(new InetSocketAddress(7000));

        // 创建一个SocketChannel列表用于保存所有连接
        List<SocketChannel> socketChannels = new ArrayList<>();;
        while (true) {
            // 接收连接，返回一个SocketChannel  阻塞方法
            // 没有获取到连接会一直阻塞
            SocketChannel socketChannel = serverSocketChannel.accept();
            if (socketChannel != null) {
                socketChannels.add(socketChannel);
                // 处理连接
                System.out.println("New connection: " + socketChannel.getRemoteAddress());
            }
            for (SocketChannel channel : socketChannels) {
                // 处理read事件  默认阻塞方法
                int read = channel.read(buffer);
                if (read > 0) {
                    // 处理读取到的数据
                    buffer.flip();
                    StringBuilder sb = new StringBuilder();
                    while (buffer.hasRemaining()) {
                        sb.append((char) buffer.get());
                    }
                    System.out.println("Received: " + sb);
                    buffer.clear();
                }
            }
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

> 客户端

```java
public static void main(String[] args) {
    try {
        try (SocketChannel clientChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7000))) {
            System.out.println(clientChannel);
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

#### 非阻塞模式

* 非阻塞模式下，相关方法都会不会让线程暂停
  * 在 ServerSocketChannel.accept 在没有连接建立时，会返回 null，继续运行
  * SocketChannel.read 在没有数据可读时，会返回 0，但线程不必阻塞，可以去执行其它 SocketChannel 的 read 或是去执行 ServerSocketChannel.accept 
  * 写数据时，线程只是等待数据写入 Channel 即可，无需等 Channel 通过网络把数据发送出去
* 但非阻塞模式下，即使没有连接建立，和可读数据，线程仍然在不断运行，白白浪费了 cpu
* 数据复制过程中，线程实际还是阻塞的（AIO 改进的地方）

> 服务端

```java
public static void main(String[] args) {
    try {
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        // 使用open()方法打开一个ServerSocketChannel
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        // 绑定监听端口
        serverSocketChannel.bind(new InetSocketAddress(7000));
        // 设置为非阻塞模式
        serverSocketChannel.configureBlocking(false);
        List<SocketChannel> socketChannels = new ArrayList<>();
        ;
        while (true) {
            // 接收连接，返回一个SocketChannel
            SocketChannel socketChannel = serverSocketChannel.accept();
            if (socketChannel != null) {
                socketChannels.add(socketChannel);
                socketChannel.configureBlocking(false);
                // 处理连接
                System.out.println("New connection: " + socketChannel.getRemoteAddress());
            }
            for (SocketChannel channel : socketChannels) {
                // 处理read事件
                int read = channel.read(buffer);
                if (read > 0) {
                    // 处理读取到的数据
                    buffer.flip();
                    StringBuilder sb = new StringBuilder();
                    while (buffer.hasRemaining()) {
                        sb.append((char) buffer.get());
                    }
                    System.out.println("Received: " + sb);
                    buffer.clear();
                }
            }
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

> 客户端

```java
public static void main(String[] args) {
    try {
        try (SocketChannel clientChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7000))) {
            System.out.println(clientChannel);
            while (true) {
                // do something
            }
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

#### 多路复用

单线程可以配合 Selector 完成对多个 Channel 可读写事件的监控，这称之为多路复用

* 多路复用仅针对网络 IO、普通文件 IO 没法利用多路复用
* 如果不用 Selector 的非阻塞模式，线程大部分时间都在做无用功，而 Selector 能够保证
  * 有可连接事件时才去连接
  * 有可读事件才去读取
  * 有可写事件才去写入
    * 限于网络传输能力，Channel 未必时时可写，一旦 Channel 可写，会触发 Selector 的可写事件

> 服务端

```java
ublic static void main(String[] args) throws IOException {
    // 创建一个selector
    Selector selector = Selector.open();
    // 使用open()方法打开一个ServerSocketChannel
    ServerSocketChannel ssc = ServerSocketChannel.open();
    // 绑定监听端口
    ssc.bind(new InetSocketAddress(7000));
    // 设置为非阻塞模式
    ssc.configureBlocking(false);
    // 把server的channel 注册到selector
    ssc.register(selector, SelectionKey.OP_ACCEPT);
    List<SocketChannel> socketChannels = new ArrayList<>();
    while (true) {
        // select方法，没有事件发生，线程阻塞，有事件，线程才会恢复运行
        // select 在事件未处理时, 它不会阻塞, 事件发生后要么处理, 要么取消(cancel)
        selector.select();
        Iterator<SelectionKey> iterator = selector.selectedKeys().iterator();
        while (iterator.hasNext()) {
            SelectionKey key = iterator.next();
            // 这里移除的是事件, 如果一次消息没有接受完, 那么事件会再次触发
            iterator.remove();
            log.debug("key: {}", key);
            if (key.isAcceptable()) {
                // 监听到连接事件
                ServerSocketChannel channel = (ServerSocketChannel) key.channel();
                SocketChannel sc = channel.accept();
                socketChannels.add(sc);
                sc.configureBlocking(false);
                // 把新的连接channel
                SelectionKey scKey = sc.register(selector, SelectionKey.OP_READ);
                ByteBuffer buffer = ByteBuffer.allocate(16);
                // attachment 附件，可以理解为与channel绑定的附件
                scKey.attach(buffer);
                log.debug("connected: {}", sc.getRemoteAddress());
            }
            if (key.isReadable()) {
                try {
                    SocketChannel channel = (SocketChannel) key.channel();
                    ByteBuffer buffer = (ByteBuffer) key.attachment();
                    // 处理read事件
                    int read = channel.read(buffer);
                    if (read == -1) {
                        // 处理客户端正常断开了连接
                        key.cancel();
                    } else if (read > 0) {
                        // 处理读取到的数据
                        split(buffer);
                        if (buffer.position() == buffer.limit()) {
                            // 缓冲区已满，需要扩容
                            ByteBuffer newBuffer = ByteBuffer.allocate(buffer.capacity() * 2);
                            buffer.flip();
                            newBuffer.put(buffer);
                            key.attach(newBuffer);
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    // 客户端断开了, 取消注册（从selector的keys集合中移除）
                    key.cancel();
                }
            }
        }
    }
}

private static void split(ByteBuffer source) {
    source.flip();
    for (int i = 0; i < source.limit(); i++) {
        // 通过\n分割读取
        if (source.get(i) == '\n') {
            int length = i + 1 - source.position();
            // 把这条完整消息存入新的 ByteBuffer
            ByteBuffer target = ByteBuffer.allocate(length);
            // 将source中的数据读取到target中
            for (int j = 0; j < length; j++) {
                target.put(source.get());
            }
            target.flip();
            System.out.print("read: " + Charset.defaultCharset().decode(target));
        }
    }
    source.compact();
}
```

> 客户端

```java
public static void main(String[] args) {
    try {
        try (SocketChannel clientChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7000))) {
            System.out.println(clientChannel);
            clientChannel.write(ByteBuffer.wrap("hello12356789abcdefg!!!\nworld\n".getBytes()));
            System.in.read();
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

#### 多线程Selector

> 现在都是多核 cpu，设计时要充分考虑别让 cpu 的力量被白白浪费

前面的代码只有一个选择器，没有充分利用多核 cpu，改进为下面的模式：

分两组选择器

* 单线程配一个选择器，专门处理 accept 事件
* 创建 cpu 核心数的线程，每个线程配一个选择器，轮流处理 read 事件

> 服务端

```java
public static void main(String[] args) throws IOException {
    new BossEventLoop().register();
}

@Slf4j
static class BossEventLoop implements Runnable {
    private Selector boss;
    private WorkerEventLoop[] workers;
    private volatile boolean start = false;
    AtomicInteger index = new AtomicInteger();

    public void register() throws IOException {
        if (!start) {
            ServerSocketChannel ssc = ServerSocketChannel.open();
            ssc.bind(new InetSocketAddress(7000));
            ssc.configureBlocking(false);
            boss = Selector.open();
            SelectionKey ssckey = ssc.register(boss, 0, null);
            ssckey.interestOps(SelectionKey.OP_ACCEPT);
            workers = initEventLoops();
            new Thread(this, "boss").start();
            log.debug("boss start...");
            start = true;
        }
    }

    public WorkerEventLoop[] initEventLoops() {
        // EventLoop[] eventLoops = new EventLoop[Runtime.getRuntime().availableProcessors()];
        WorkerEventLoop[] workerEventLoops = new WorkerEventLoop[2];
        for (int i = 0; i < workerEventLoops.length; i++) {
            workerEventLoops[i] = new WorkerEventLoop(i);
        }
        return workerEventLoops;
    }

    @Override
    public void run() {
        while (true) {
            try {
                boss.select();
                Iterator<SelectionKey> iter = boss.selectedKeys().iterator();
                while (iter.hasNext()) {
                    SelectionKey key = iter.next();
                    iter.remove();
                    if (key.isAcceptable()) {
                        ServerSocketChannel c = (ServerSocketChannel) key.channel();
                        SocketChannel sc = c.accept();
                        sc.configureBlocking(false);
                        log.debug("{} connected", sc.getRemoteAddress());
                        workers[index.getAndIncrement() % workers.length].register(sc);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

@Slf4j
static class WorkerEventLoop implements Runnable {
    private Selector worker;
    private volatile boolean start = false;
    private int index;

    private final ConcurrentLinkedQueue<Runnable> tasks = new ConcurrentLinkedQueue<>();

    public WorkerEventLoop(int index) {
        this.index = index;
    }

    public void register(SocketChannel sc) throws IOException {
        if (!start) {
            worker = Selector.open();
            new Thread(this, "worker-" + index).start();
            start = true;
        }
        tasks.add(() -> {
            try {
                SelectionKey sckey = sc.register(worker, 0, null);
                sckey.interestOps(SelectionKey.OP_READ);
                worker.selectNow();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        worker.wakeup();
    }

    @Override
    public void run() {
        while (true) {
            try {
                worker.select();
                Runnable task = tasks.poll();
                if (task != null) {
                    task.run();
                }
                Set<SelectionKey> keys = worker.selectedKeys();
                Iterator<SelectionKey> iter = keys.iterator();
                while (iter.hasNext()) {
                    SelectionKey key = iter.next();
                    if (key.isReadable()) {
                        SocketChannel sc = (SocketChannel) key.channel();
                        ByteBuffer buffer = ByteBuffer.allocate(128);
                        try {
                            int read = sc.read(buffer);
                            if (read == -1) {
                                key.cancel();
                                sc.close();
                            } else {
                                buffer.flip();
                                log.debug("{} message:", sc.getRemoteAddress());
                                debugAll(buffer);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                            key.cancel();
                            sc.close();
                        }
                    }
                    iter.remove();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

* Runtime.getRuntime().availableProcessors() 如果工作在 docker 容器下，因为容器不是物理隔离的，会拿到物理 cpu 个数，而不是容器申请时的个数
* 这个问题直到 jdk 10 才修复，使用 jvm 参数 UseContainerSupport 配置， 默认开启

> 客户端

```java
public static void main(String[] args) {
    try {
        try (SocketChannel clientChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 7000))) {
            System.out.println(clientChannel);
            clientChannel.write(ByteBuffer.wrap("hello12356789abcdefg!!!\nworld\n".getBytes()));
            System.in.read();
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```
