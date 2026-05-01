---
order: 3
title: 参数
date: 2021-07-01
category: Java
tag: Java
timeline: true
article: true
---

# 参数

[参考文档](https://www.oracle.com/java/technologies/javase/vmoptions-jsp.html)

## 栈

> -Xss：设置虚拟机栈大小，JDK5后默认1024k

## 堆

> -Xms：设置堆空间初始大小

> -Xmx：设置堆空间最大大小，超过该值会抛出OutOfMemoryError异常

- **通常会将 -Xms 和 -Xmx 设置为一样的值，是为了让java垃圾回收机制清理完堆区后不需要重新分隔计算堆区的大小，从而提高性能**
- **heap默认最大值计算方式：如果物理内存小于192M，那么heap最大值为物理内存的一半。如果物理内存大于等于1G，那么heap的最大值为物理内存的1/4。**
- **heap默认最小值计算方式：最少不得小于8M，如果物理内存大于等于1G，那么默认值为物理内存的1/64，即1024/64=16M。最小堆内存在jvm启动的时候就会被初始化。**

> -XX:NewRatio=2，表示新生代占1，老年代占2，新生代站整个堆的1/3

> -Xmn：设置新生代最大内存大小

**一般上面这两个参数都不会去修改**

> -XX:SurvivorRatio=8，调整Eden空间和另外两个Survivor空间的比例，默认是8:1:1

> -XX:+UseAdaptiveSizePolicy

**要显示设置jvm参数不然是6:1:1**

> -XX:MaxTenuringThreshold=\<N\>，年轻代转换到老年代阈值，默认15

> -XX:TargetSurvivorRatio，动态年龄判断，默认Survior区一半

Survivor区年龄从小到大累加大于该值的阈值，例 年龄1 + 年龄2 + 年龄3 + 年龄N size > TargetSurvivorRatio， 则年龄N 跟 年龄N以上的对象进入老年区

> -XX:HandlePromotionFailure，是否允许担保失败

在MinorGC之前，检查老年代最大可用的连续空间是否大于新生代所以对象的总空间

- 如果大于，则此次MinorGC是安全的
- 如果小于，则虚拟机会查看-XX:HandlePromotionFailure设置是否允许担保失败，如果允许会检查老年代的最大可用的联系空间是否大于历次晋升到老年代的对象的平均大小，如果大于，那么会先进行MinorGC，但这次MinorGC仍然是有风险，失败后会发起一次MajorGC(FullGC)
- 如果小于或者HandlePromotionFailure=false，则改为直接进行一次MajorGC（FullGC）。

在jdk1.6 update 24之后-XX:-HandlePromotionFailure 不起作用了，只要老年代的连续空间大于新生代对象的总大小或者历次晋升到老年代的对象的平均大小就进行MinorGC，否则FullGC

> -XX:+/-UseTLAB 设置是否开启TLAB空间

> -XX:TLABWasteTargetPercent 设置TLAB空间所占用Eden空间的百分比大小

TLAB：线程专用的内存分配区域，可以解决内存分配冲突问题，线程分配优先考虑Eden区中的TLAB区

## 方法区

> -XX:+TraceClassLoading，加载类信息打印

> -XX:+TraceClassUnloading，卸载类信息打印

**jdk6/7**

> -XX:PermSize=10m，永久代初始空间

> -XX:MaxPermSize=10m，永久代最大空间

**jdk8**

> -XX:MetaspaceSize=10m，元空间初始空间

> -XX:MaxMetaspaceSize=10m，元空间最大空间

## GC

> -XX:+PrintGCDetails，打印GC详细信息

> -Xloggc:./logs/gc.log，配置GC日志输出文件

> -XX:HeapDumpPath=xxx/xxx.hprof，参数表示当JVM发生OOM时，自动生成DUMP文件

> -XX:-UseGCOverheadLimit，禁用检查（GC overhead limit exceeded，这个GC错误是因为回收堆内存效率低，98%时间都在做GC却回收不到了2%的堆内存）

**Parallel old GC**

> -XX:MaxGCpauseMillis，设置垃圾收集器最大停顿时间(即STW的时间)，单位是毫秒

> -XX:GCTimeRation，垃圾收集时间占总时间的比例( = 1 / (N + 1))，用于衡量的大小，取值范围(0,100)，默认99，垃圾回收时间不超过1%

> -XX:+UseAdaptiveSizePolicy，设置Parallel Scavenge收集器具有自适应调节策略

> -XX:ParallelGCThreads=8，限制线程数量，默认开启和CPU相同的线程数

**ParNew**

> -XX:+UseParNewGC，指定使用ParNew收集器

**G1**

> -XX：+UseG1GC  手动指定使用G1收集器执行内存回收任务。

> -XX:G1HeapRegionSize  设置每个Region的大小。值是2的幂，范围是1MB到32MB之间，目标是根据最小的Java堆大小划分出约2048个区域。默认是堆内存的1/2000。

> -XX:MaxGCPauseMillis  设置期望达到的最大GC停顿时间指标(JVM会尽力实现，但不保证达到)。默认值是200ms

> -XX:ParallelGCThread  设置STW时GC线程数的值。最多设置为8

> -XX:ConcGCThreads  设置并发标记的线程数。将n设置为并行垃圾回收线程数(ParallelGCThreads)的1/4左右。

> -XX:InitiatingHeapOccupancyPercent 设置触发并发GC周期的Java堆占用率阈值。超过此值，就触发GC。默认值是45。

一些GC日志打印

> -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+PrintCommandLineFlags -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -XX:+PrintHeapAtGC -XX:+PrintTenuringDistribution -XX:+PrintGCApplicationStoppedTime -XX:+PrintReferenceGC

## 查看运行时 JVM 参数

> -XX:+PrintFlagsInitial 查看初始值

> -XX:+PrintFlagsFinal：查看最终的值一般都有一个默认值，可以通过命令行等配置方式覆盖掉这个默认值，这里查看的则是这个最终的值

> -XX:+UnlockExperimentaIVMOptions：解锁实验参数JVM 中有一部分参数是无法直接赋值的，需要加该参数，解锁实验参数，才能配置

> -XX:UnlockDiagnosticVMOpeions：解锁诊断参数

> -XX:+PrintCommandLineFlags：打印命令行参数，查看命令行相关参数（包含使用的垃圾收集器）

## JIT编译器

> -XX:+DoEscapeAnalysis，jdk 6u23开始已经默认开始逃逸分析

> -XX:+EliminateAllocations，开启标量替换，需要逃逸分析先开启

## 总结

| 参数作用                                                   | 写法                                                         | 可选值                                      | 备注                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------- |
| 启用G1垃圾收集器                                           | -XX:+UseG1GC                                                 | 启用: -XX:-UseG1GC                          |                                                          |
| 启用其他的垃圾收集器                                       | -XX:+UseSerialGC<br/>-XX:+UseParallelGC<br/>-XX:+UseConcMarkSweepGC<br/>-XX:+UseZGC<br/>-XX:+UseShenandoahGC<br/> |                                             | 其中部分垃圾收集器是可以组合使用的                       |
| 设置最大垃圾收集暂停的时间目标（毫秒）                     | -XX:MaxGCPauseMillis=\<N>                                    | 任何正整数，默认值200                       | 会影响每次收集的范围                                     |
| 设置堆的初始大小                                           | -Xms\<size>                                                  | 任何合适的大小，例如4g、512m                |                                                          |
| 设置堆的最大值                                             | -Xmx\<size>                                                  | 任何合适的大小，例如4g、512m                |                                                          |
| 设置垃圾收集的最小堆大小                                   | -Xmn\<size>                                                  | 任何合适的大小，例如4g、512m                | 设置较小的堆大小可以节省内存空间                         |
| 设置栈大小                                                 | -Xss\<size>                                                  | 任何合适的大小，例如512k                    |                                                          |
| 设置单个Region的大小                                       | -XX:G1HeapRegionSize=\<size>                                 | 1MB到32MB，必须是2的幂                      | 较大的区域大小可能会减少收集频率，但增加了每次收集的开销 |
| 设置年轻代初始大小占整个堆大小的百分比                     | -XX:NewSizePercent=\<percent>                                | 0到100，默认值5                             |                                                          |
| 设置年轻代最大大小占整个堆大小的百分比                     | -XX:MaxNewSizePercent=\<percent>                             | 0到100，默认值60                            | 较大的年轻代大小可能会减少年轻代的频繁回收               |
| 设置最大晋升阈值                                           | -XX:MaxTenuringThreshold                                     | 任何正整数                                  | 间值越大，则Survivor存放的对象越多                       |
| 设置初始老年代并未被使用的老年代占比                       | -XX:InitiatingHeapOccupancyPercent=\<percent>                | 0到100，默认值45                            | 较低的阈值可能导致频繁的老年代收集                       |
| 设置触发Cset的G1混合垃圾收集的老年代占比阈值               | -XX:G1MixedGCLiveThresholdPercent=\<percent>                 | 0到100                                      | 不同版本默认值不同，Region中有对象大于这个值会被放入Cset |
| 设置G1回收时的预留空间的百分比                             | -XX:G1ReservePercent                                         | 0到100                                      | 较大的预留内存可能会减少浮动和暂停时间                   |
| 设置触发一次（混合）回收所需的存活对象分区的最小数数       | -XX:G1MixedGCLiveThresholdPercent=\<percent>                 | 任何正整数，默认8                           |                                                          |
| 设置垃圾收集时使用的最大并行线程数                         | -XX:ConcGCThreads=\<N>                                       | 任何正整数                                  |                                                          |
| 设置混合垃圾收集时的最大并行线程数                         | -XX:ParallelGCThreads=\<N>                                   | 任何正整数                                  |                                                          |
| 设置16进制的打印线程时间的概率                             | -XX:G1ConfidencePercent=\<percent>                           | 任何正整数                                  |                                                          |
| 设置最大垃圾收集时间（毫秒）                               | -XX:MaxGCPauseMillis=\<N>                                    | 任何正整数                                  |                                                          |
| 启用类卸载                                                 | -XX:+ClassUnloadingWithConcurrentMark                        | 启用: -XX:-ClassUnloadingWithConcurrentMark |                                                          |
| 禁用类卸载                                                 | -XX:-ClassUnloadingWithConcurrentMark                        |                                             |                                                          |
| 设置可进行垃圾收集的堆的最大百分比                         | -XX:G1HeapWastePercent=\<percent>                            |                                             |                                                          |
| 启用字符串去重                                             | -XX:+UseStringDeduplication                                  |                                             |                                                          |
| 禁用字符串去重                                             | -XX:-UseStringDeduplication                                  |                                             |                                                          |
| 启用详细的垃圾回收日志                                     | -XX:+PrintGCDetails                                          |                                             |                                                          |
| 启用带时间戳的垃圾回收日志                                 | -XX:+PrintGCDateStamps                                       |                                             |                                                          |
| 启用带时间戳的垃圾回收日志                                 | -XX:+PrintGCTimeStamps                                       |                                             |                                                          |
| 输出GC日志到文件                                           | -Xloggc:\<file>                                              | 例如: -Xloggc:/path/to/gc.log               |                                                          |
| 打印垃圾回收过程中使用的适应性信息                         | -XX:+PrintAdaptiveSizePolicy                                 |                                             |                                                          |
| 打印详细的G1收集器统计信息                                 | -XX:+UnlockDiagnosticVMOptions                               |                                             |                                                          |
| 打印详细的G1收集器统计信息                                 | -XX:+G1PrintRegionLivenessInfo                               |                                             |                                                          |
| 设置年轻代（包括Eden和Survivor区）和老年代的比例           | -XX:NewRatio                                                 | 默认值为2                                   |                                                          |
| 设置Eden区和Survivor区的比例                               | -XX:SurvivorRatio                                            | 默认值为8，即Eden区是每个Survivor区的8倍    |                                                          |
| 设置在垃圾回收之后希望幸存的对象在Survivor区中所占的百分比 | -XX:TargetSurvivorRatio                                      | 默认值为50                                  |                                                          |
| 解锁实验性的JVM选项                                        | -XX:+UnlockExperimentalVMOptions                             | 某些选项需要开启这个条件                    |                                                          |
