---
order: 12
title: NIO：直接内存
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# NIO：直接内存

#### 基本介绍

Byte Buffer 有两种类型，一种是基于直接内存（也就是非堆内存），另一种是非直接内存（也就是堆内存）

Direct Memory 优点：

- Java 的 NIO 库允许 Java 程序使用直接内存，使用 native 函数直接分配堆外内存
- **读写性能高**，读写频繁的场合可能会考虑使用直接内存
- 大大提高 IO 性能，避免了在 Java 堆和 native 堆来回复制数据

直接内存缺点：

- 不能使用内核缓冲区 Page Cache 的缓存优势，无法缓存最近被访问的数据和使用预读功能
- 分配回收成本较高，不受 JVM 内存回收管理
- 可能导致 OutOfMemoryError 异常：OutOfMemoryError: Direct buffer memory
- 回收依赖 System.gc() 的调用，但这个调用 JVM 不保证执行、也不保证何时执行，行为是不可控的。程序一般需要自行管理，成对去调用 malloc、free

应用场景：

- 传输很大的数据文件，数据的生命周期很长，导致 Page Cache 没有起到缓存的作用，一般采用直接 IO 的方式
- 适合频繁的 IO 操作，比如网络并发场景

数据流的角度：

- 非直接内存的作用链：本地 IO → 内核缓冲区→ 用户（JVM）缓冲区 →内核缓冲区 → 本地 IO
- 直接内存是：本地 IO → 直接内存 → 本地 IO

JVM 直接内存图解：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314888-17f1a26b-51eb-4d16-ab3d-0003d5196136.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713877314904-1e0bcc1e-13a3-4ce7-ad3a-48f76e5e43cc.png)

#### 通信原理

堆外内存不受 JVM GC 控制，可以使用堆外内存进行通信，防止 GC 后缓冲区位置发生变化的情况

NIO 使用的 SocketChannel 也是使用的堆外内存，源码解析：

-  SocketChannel#write(java.nio.ByteBuffer) → SocketChannelImpl#write(java.nio.ByteBuffer) 

```java
public int write(ByteBuffer var1) throws IOException {
     do {
         var3 = IOUtil.write(this.fd, var1, -1L, nd);
     } while(var3 == -3 && this.isOpen());
}
```

-  IOUtil#write(java.io.FileDescriptor, java.nio.ByteBuffer, long, sun.nio.ch.NativeDispatcher) 

```java
static int write(FileDescriptor var0, ByteBuffer var1, long var2, NativeDispatcher var4) {
    // 【判断是否是直接内存，是则直接写出，不是则封装到直接内存】
    if (var1 instanceof DirectBuffer) {
        return writeFromNativeBuffer(var0, var1, var2, var4);
    } else {
        //....
        // 从堆内buffer拷贝到堆外buffer
        ByteBuffer var8 = Util.getTemporaryDirectBuffer(var7);
        var8.put(var1);
        //...
        // 从堆外写到内核缓冲区
		int var9 = writeFromNativeBuffer(var0, var8, var2, var4);
	}
}
```

-  读操作相同 

#### 分配回收

直接内存创建 Buffer 对象：`static XxxBuffer allocateDirect(int capacity)`

DirectByteBuffer 源码分析：

```java
DirectByteBuffer(int cap) { 
    //....
    long base = 0;
    try {
        // 分配直接内存
        base = unsafe.allocateMemory(size);
    }
    // 内存赋值
    unsafe.setMemory(base, size, (byte) 0);
    if (pa && (base % ps != 0)) {
        address = base + ps - (base & (ps - 1));
    } else {
        address = base;
    }
    // 创建回收函数
    cleaner = Cleaner.create(this, new Deallocator(base, size, cap));
}
private static class Deallocator implements Runnable {
    public void run() {
        unsafe.freeMemory(address);
		//...
    }
}
```

**分配和回收原理**：

- 使用了 Unsafe 对象的 allocateMemory 方法完成直接内存的分配，setMemory 方法完成赋值
- ByteBuffer 的实现类内部，使用了 Cleaner（虚引用）来监测 ByteBuffer 对象，一旦 ByteBuffer 对象被垃圾回收，那么 ReferenceHandler 线程通过 Cleaner 的 clean 方法调用 Deallocator 的 run方法，最后通过 freeMemory 来释放直接内存

```java
/**
 * 直接内存分配的底层原理：Unsafe
 */
public class Demo1_27 {
    static int _1Gb = 1024 * 1024 * 1024;

    public static void main(String[] args) throws IOException {
        Unsafe unsafe = getUnsafe();
        // 分配内存
        long base = unsafe.allocateMemory(_1Gb);
        unsafe.setMemory(base, _1Gb, (byte) 0);
        System.in.read();
        // 释放内存
        unsafe.freeMemory(base);
        System.in.read();
    }

    public static Unsafe getUnsafe() {
        try {
            Field f = Unsafe.class.getDeclaredField("theUnsafe");
            f.setAccessible(true);
            Unsafe unsafe = (Unsafe) f.get(null);
            return unsafe;
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}
```

#### 共享内存

FileChannel 提供 map 方法返回 MappedByteBuffer 对象，把文件映射到内存，通常情况可以映射整个文件，如果文件比较大，可以进行分段映射，完成映射后对物理内存的操作会被**同步**到硬盘上

FileChannel 中的成员属性：

-  MapMode.mode：内存映像文件访问的方式，共三种： 

-  `MapMode.READ_ONLY`：只读，修改得到的缓冲区将导致抛出异常
-  `MapMode.READ_WRITE`：读/写，对缓冲区的更改最终将写入文件，但此次修改对映射到同一文件的其他程序不一定是可见
-  `MapMode.PRIVATE`：私用，可读可写，但是修改的内容不会写入文件，只是 buffer 自身的改变

-  `public final FileLock lock()`：获取此文件通道的排他锁 

MappedByteBuffer，可以让文件在直接内存（堆外内存）中进行修改，这种方式叫做**内存映射**，可以直接调用系统底层的缓存，没有 JVM 和 OS 之间的复制操作，提高了传输效率，作用：

- **可以用于进程间的通信，能达到共享内存页的作用**，但在高并发下要对文件内存进行加锁，防止出现读写内容混乱和不一致性，Java 提供了文件锁 FileLock，但在父/子进程中锁定后另一进程会一直等待，效率不高
- 读写那些太大而不能放进内存中的文件，**分段映射**

MappedByteBuffer 较之 ByteBuffer 新增的三个方法：

- `final MappedByteBuffer force()`：缓冲区是 READ_WRITE 模式下，对缓冲区内容的修改**强制写入文件**
- `final MappedByteBuffer load()`：将缓冲区的内容载入物理内存，并返回该缓冲区的引用
- `final boolean isLoaded()`：如果缓冲区的内容在物理内存中，则返回真，否则返回假

```java
public class MappedByteBufferTest {
    public static void main(String[] args) throws Exception {
        // 读写模式
        RandomAccessFile ra = new RandomAccessFile("1.txt", "rw");
        // 获取对应的通道
        FileChannel channel = ra.getChannel();

        /**
         * 参数1	FileChannel.MapMode.READ_WRITE 使用的读写模式
         * 参数2	0: 文件映射时的起始位置
         * 参数3	5: 是映射到内存的大小（不是索引位置），即将 1.txt 的多少个字节映射到内存
         * 可以直接修改的范围就是 0-5
         * 实际类型 DirectByteBuffer
         */
        MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 5);

        buffer.put(0, (byte) 'H');
        buffer.put(3, (byte) '9');
        buffer.put(5, (byte) 'Y');	//IndexOutOfBoundsException

        ra.close();
        System.out.println("修改成功~~");
    }
}
```

从硬盘上将文件读入内存，要经过文件系统进行数据拷贝，拷贝操作是由文件系统和硬件驱动实现。通过内存映射的方法访问硬盘上的文件，拷贝数据的效率要比 read 和 write 系统调用高：

- read() 是系统调用，首先将文件从硬盘拷贝到内核空间的一个缓冲区，再将这些数据拷贝到用户空间，实际上进行了两次数据拷贝
- mmap() 也是系统调用，但没有进行数据拷贝，当缺页中断发生时，直接将文件从硬盘拷贝到共享内存，只进行了一次数据拷贝

注意：mmap 的文件映射，在 Full GC 时才会进行释放，如果需要手动清除内存映射文件，可以反射调用 sun.misc.Cleaner 方法

参考文章：https://www.jianshu.com/p/f90866dcbffc

