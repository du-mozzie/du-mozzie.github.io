---
order: 4
title: 调优
date: 2021-07-01
category: Java
tag: Java
timeline: true
article: true
---

# 调优

现在JVM调优标准：在最大吞吐量优先的情况下，降低停顿时间

**案例：**

[JAVA 生产环境下性能监控与调优详解](https://zq99299.github.io/note-book2/monitor-tuning/#必备推荐)

[当小白遇到FullGC | 京东云技术团队](https://juejin.cn/post/7270152013341425698)

[Arthas+JVM命令实战指南：快速定位并解决JVM内存溢出问题](https://www.ifb.me/blog/backend/arthasjvm-ming-ling)

**调优步骤**

1. 熟悉业务场景

2. 性能监控

   可能的问题：

   - GC 频繁

   - Cpu load过高

   - OOM

   - 内存泄漏

   - 死锁

   - 程序响应时间较长（Full GC频繁）

3. 性能分析

   - 打印GC日志，通过[GCviewer](https://github.com/chewiebug/GCViewer)或者[gceasy](https://gceasy.io/)来分析日志信息

   - 命令行工具，jstack，jmap，jinfo等

   - dump出堆文件，使用内存分析工具(**eclipse MAT、jconsole、JVisualVM、jprofile等**)分析文件

   - 使用阿里Arthas，jconsole，JVisualVM来实时查看JVM状态

   - jstack查看堆栈信息


4. 性能调优

   - 适当增加内存，根据业务背景选择垃圾回收器

   - 优化代码，控制内存使用

   - 增加机器，分散节点压力
     - 合理设置线程池线程数量


   - 使用中间件提高程序效率，比如缓存，消息队列等

   - 其他......

**GC相关的调优都是根据业务大致分析出来的初始配置，所以我们一定是需要不断地调优的，那么必要的日志相关参数就要添加。**

```bash
-XX:MaxGCPauseMillis=100：最大 GC 暂停时间为 100 毫秒，可以根据实际情况调整；
-XX:+HeapDumpOnOutOfMemoryError：当出现内存溢出时，自动生成堆内存快照文件；
-XX:HeapDumpPath=/path/to/heap/dump/file.hprof：堆内存快照文件的存储路径；
-XX:+PrintGC：输出 GC 信息；
-XX:+PrintGCDateStamps：输出 GC 发生时间；
-XX:+PrintGCTimeStamps：输出 GC 发生时 JVM 的运行时间；
-XX:+PrintGCDetails：输出 GC 的详细信息；
-Xlog:gc*:file=/path/to/gc.log:time,uptime:filecount=10,filesize=100M：将 GC 日志输出到指定文件中，可以根据需要调整日志文件路径、数量和大小
```

## 优化案例

4C8G服务器，各项指标，什么范围算是正常（经供参考）

|              | CPU利用率（单核） | Load | 磁盘利用率 | 内存利用率 | 堆内存占用率 | YGC次数    | YGC时长 | FGC次数  | FGC时长 |
| ------------ | ----------------- | ---- | ---------- | ---------- | ------------ | ---------- | ------- | -------- | ------- |
| 正常范围     | <70%              | <2   | 80%以下    | <80%       | <80%         | 每分钟<1次 | <50ms   | <1次/周  | <1s     |
| 需要关注范围 | 70%-90%           | >3   | >80%       | >=80%      | >=80%        | 每分钟>1次 | >200ms  | 1次/天   | >2s     |
| 不可接受范围 | >=100%            | >4   | >=100%     | >100%      | >100%        | 10次/分钟  | 1s      | 1次/小时 | >=5s    |

### 1.合理配置堆内存

依据的原则是根据Java Performance里面的推荐公式来进行设置。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240804205727545.png)

- Java整个堆大小设置，Xmx 和 Xms设置为老年代存活对象的3-4倍，即FullGC之后的老年代内存占用的3-4倍。
- 方法区（永久代 PermSize和MaxPermSize 或 元空间 MetaspaceSize 和 MaxMetaspaceSize）设置为老年代存活对象的1.2-1.5倍。
- 年轻代Xmn的设置为老年代存活对象的1-1.5倍。
- 老年代的内存大小设置为老年代存活对象的2-3倍。

老年代存活对象计算方式：

1. 查看日志
2. 强制触发FullGC

   - jmap -dump:live,format=b,file=heap.bin \<pid\> 将当前的存活对象dump到文件，此时会触发FullGC

   - jmap -histo:live pid 打印每个class的实例数目,内存占用,类全名信息.live子参数加上后,只统计活的对象数量. 此时会触发FullGC

   - 在性能测试环境，可以通过Java监控工具来触发FullGC，比如使用VisualVM和JConsole，VisualVM集成了JConsole，VisualVM或者JConsole上面有一个触发GC的按钮。

调整堆大小提高服务的吞吐量，堆空间设置多少合适？

- 最大大小的默认值是物理内存的1/4，初始大小是物理内存的1/64
- 堆太小，可能会频繁的导致年轻代和老年代的垃圾回收，会产生stw，暂停用户线程
- 堆内存大肯定是好的，存在风险，假如发生了full gc,它会扫描整个堆空间，暂停用户线程的时间长

### 2.内存溢出排查方案

1. 获取堆内存快照dump（dump文件是进程的内存镜像。可以把程序的执行状态通过调试器保存到dump文件中）

   - 使用jmap命令获取运行中程序的dump文件

     ```bash
     jmap -dump:format=b,file=heap.hprof pid
     ```

   - 使用vm参数获取dump文件

     有的情况是内存溢出之后程序则会直接中断，而jmap只能打印在运行中的程序，所以建议通过参数的方式的生成dump文件

     ```
     -XX:+HeapDumpOnOutOfMemoryError
     -XX:HeapDumpPath=/home/app/dumps/heapdump.hprof
     ```

2. VisualVM 去分析dump文件

3. 通过查看堆信息的情况，定位内存溢出问题

> 如果定位不到问题，可以在记录一下GC日志

1. **输出 GC 日志**

为了监控 GC 活动，可以通过以下参数输出 GC 日志：

```bash
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-XX:+PrintTenuringDistribution
-Xloggc:/path/to/gc.log
```

- -XX:+PrintGCDetails：输出详细的 GC 日志信息。
- -XX:+PrintGCDateStamps：在 GC 日志中附加时间戳。
- -XX:+PrintTenuringDistribution：输出对象晋升年龄分布信息。
- -Xloggc：指定 GC 日志文件的存放路径。

2. **配置 GC 日志滚动**

​	为了避免 GC 日志过大，你可以配置日志滚动：

```bash
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=10
-XX:GCLogFileSize=100M
```

- -XX:+UseGCLogFileRotation：启用 GC 日志滚动。
- -XX:NumberOfGCLogFiles=10：设置保留的日志文件个数。
- -XX:GCLogFileSize=100M：设置单个 GC 日志文件的大小。

3. **配置崩溃日志**

如果 JVM 崩溃了，你可以启用错误日志：

```bash
-XX:ErrorFile=/path/to/hs_err_pid%p.log
```

- -XX:ErrorFile：指定 JVM 崩溃日志的保存路径，%p 表示进程 ID。



### 3.CPU占用率很高的排查方案

1. **ps aux | grep java** 查看到当前java进程使用cpu、内存、磁盘的情况获取使用量异常的进程
2. **top -Hp  线程pid**  实时查看进程的所有线程运行信息，找到异常的线程id
3. 使用linux 命令 **printf "%x\n" 线程id**，把线程id变为16进制
4. **jstack 进程的pid | grep 线程id(16进制)** 得到相关进程的代码

### 4.频繁 GC

1. 如果经常性的发生提前晋升情况，需要调整新生代大小和Survivor 区大小，或者调整 SurvivorRadio 比例
2. 调整整个新生代比例，例如 -xmn=2g调整到 -xmn=6g，gc情况会大大改善
3. 提前晋升会增加 younggc 耗时，因为跨代拷贝是很耗时的。
4. 注意 Survivor 区幸存对象大小是否过大，这也是影响 younggc 耗时的因素。

## 命令

[官方文档](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/toc.html)

### [jps 虚拟机进程状况](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jps.html#CHDCGECD) 

> jps，查看正在运行的Java进程

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704206996779-df0c9c8d-8e4d-4a82-aa36-a21a3e369ef0.png)

### [jstat 收集虚拟机运行数据](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstat.html#BEHHGFAE)

>  jstat -gc 进程号 打印周期(ms) 打印次数，查看JVM统计信息

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372236245-d42c4444-ba3e-4bc8-a289-b5a2e355e3aa.png)

| 指标 | 描述                                                         | 单位 |
| ---- | ------------------------------------------------------------ | ---- |
| S0C  | S0 区的大小 (Young Generation 中的 Survivor Space 0)         | KB   |
| S1C  | S1 区的大小 (Young Generation 中的 Survivor Space 1)         | KB   |
| S0U  | S0 区已用空间 (Young Generation 中的 Survivor Space 0 已用空间) | KB   |
| S1U  | S1 区已用空间 (Young Generation 中的 Survivor Space 1 已用空间) | KB   |
| EC   | Eden 区的大小 (Young Generation 中的 Eden Space)             | KB   |
| EU   | Eden 区已用空间 (Young Generation 中的 Eden Space 已用空间)  | KB   |
| OC   | Old 区的大小 (Old Generation 中的空间)                       | KB   |
| OU   | Old 区已用空间 (Old Generation 中的已用空间)                 | KB   |
| MC   | Metaspace 区的大小 (Metaspace 区的空间大小)                  | KB   |
| MU   | Metaspace 区已用空间 (Metaspace 区的已用空间)                | KB   |
| CCSC | Compressed Class Space 的大小                                | KB   |
| CCSU | Compressed Class Space 的已用空间                            | KB   |
| YGC  | Young GC (年轻代垃圾回收) 的次数                             | 次   |
| YGCT | 执行 Young GC 所用的时间                                     | 秒   |
| FGC  | Full GC (完整垃圾回收) 的次数                                | 次   |
| FGCT | 执行 Full GC 所用的时间                                      | 秒   |
| GCT  | 总的垃圾回收时间                                             | 秒   |

### [jinfo Java配置信息工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jinfo.html#BCGEBFDD)

>  jinfo -flag 相关垃圾回收器参数 进程ID，实时查看和修改JVM配置参数（+表示在使用，-未使用）

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704207097037-e17da0c3-19d8-44ac-92d5-9bd79029650a.png)

### [jmap 内存映射工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jmap.html#CEGCECJB)

> jmap -dump:live,format=b,file=heapdump.hprof \<pid>，生成堆转储文件，包含 JVM 内存中的所有对象及其详细信息（信息最完整，通常配合 Eclipse MAT 或 VisualVM 进行分析）

> jmap -histo:live \<pid>，JVM 进程的内存使用情况，活跃的对象

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372377866-0cb243ba-a322-4c3b-99a6-cd5b664984cf.png)

> jmap -heap 进程ID ，打印内存信息

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372330181-201d48b5-7e83-42f6-ac6d-a490c5c8b0a2.png)

> jmap -histo \<pid> | head -n 10 实时查看占用前十的对象，包括被回收的对象

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240701110942786.png)

### [jhat 堆转储快照分析工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jhat.html#CIHHJAGE)

jhat（JVM Heap Analysis Tool），与jmap配合使用，用于分析jmap生成的堆转储快照。

jhat内置了一个小型的http/web服务器，可以把堆转储快照分析的结果，展示在浏览器中查看。不过用途不大，基本大家都会使用其他第三方工具。

**命令格式**

```
jhat [-stack <bool>] [-refs <bool>] [-port <port>] [-baseline <file>] [-debug <int>] [-version] [-h|-help] <file>
```

**命令使用**

```java
E:\Code\myself\interview>jhat -port 8090 E:\Code\myself\interview\interview-26\heap.bin
Reading from E:\Code\myself\interview\interview-26\heap.bin...
Dump file created Wed Jan 13 16:53:47 CST 2021
Snapshot read, resolving...
Resolving 246455 objects...
Chasing references, expect 49 dots.................................................
Eliminating duplicate references.................................................
Snapshot resolved.
Started HTTP server on port 8090
Server is ready.
```

http://localhost:8090/

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20241105201150848.png)

### [jstack Java堆栈跟踪工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstack.html#BABGJDIF)

> jstack 进程ID，打印JVM中线程快照

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372426504-0d317319-6105-44e9-8937-3c55fb075b3d.png)

### [jcmd 虚拟机诊断命令](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jcmd.html#CIHEEDIB)

多功能命令行

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372447216-f8284e21-6894-4d29-afa1-dbb91b3ece46.png)

### [jstatd 远程主机信息收集](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstatd.html#BABEHFHF)

jstatd，即虚拟机的jstat守护进程，主要用于监控JVM的创建与终止，并提供一个接口允许远程监控工具依附到在本地主机上运行的JVM。

**用法**

```
jstatd [ options ]
```

- options

  命令行选项。这些选项可以是任意顺序。如果存在多余的或者自相矛盾的选项，则优先考虑最后的选项。

**描述**

jstatd工具是一个RMI服务器应用程序，主要用于监控HotSpot Java 虚拟机的创建与终止，并提供一个接口以允许远程监控工具附加到本地主机上运行的JVM上。

jstatd服务器需要在本地主机上存在一个RMI注册表。jstatd服务器将尝试在默认端口或-p port选项指定的端口附加到该RMI注册表上。如果RMI注册表不存在，jstatd应用程序将会自动创建一个，并绑定到-p port选项指定的端口上，如果省略了-p port选项，则绑定到默认的RMI注册表端口。你可以通过指定-nr选项来抑制内部RMI注册表的创建。

## 工具

1. [jConsole](https://docs.oracle.com/javase/8/docs/technotes/guides/management/jconsole.html)

2. [Visual VM](https://visualvm.github.io/)

3. [Eclipse MAT](https://eclipse.dev/mat/)

   分析快照文件的思路或者方法论：

   - 内存占用过大的对象是什么？`histogram`，按照占用的内存倒序进行排序的。
   - 这个对象被谁引用？`dominator Tree`，用来分析对象的调用链
   - 定位到具体的代码？`thread_overview`，线程简介图，这个里面有方法的调用链信息和堆栈信息

4. [JProfiler](https://www.ej-technologies.com/products/jprofiler/overview.html)

5. [Arthas](https://arthas.aliyun.com/)

6. [Java Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)
