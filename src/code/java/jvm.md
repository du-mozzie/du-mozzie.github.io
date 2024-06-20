---
order: 14
title: JVM
date: 2021-07-01
category: Java
tag: Java
timeline: true
article: true
---

JVM（Java虚拟机）内存模型是Java平台规范的一部分，它定义了如何在JVM中管理内存，以及Java程序在执行过程中的内存使用规则。这一模型确保了跨平台的Java程序具有确定性的行为。JVM内存模型主要分为几个关键区域：堆、栈、程序计数器、本地方法栈、方法区

## JVM内存模型

### JVM内存模型

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1702296545251-14404f88-739e-46fd-8de4-7ee6cbe618a6.png)

**线程共享**：堆、方法区

**线程独享**：虚拟机栈、程序计数器、本地方法栈

#### 堆

> 对象分配策略

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1702296505567-b1b0c93b-bca4-48b4-b451-62e8f700f7fc.png)

- 对象进入Eden区，Minor GC存活的进入Survivor区，计数达到设置的MaxTenuringThreshold进入Old区
- 大对象直接进入Old区
- 动态年龄判断，在Survivor区，年龄从小到大累加大于该值的阈值，例 年龄1 + 年龄2 + 年龄3 + 年龄N size > TargetSurvivorRatio值(默认是Survivor一半)， 则年龄N 跟 年龄N以上的对象进入老年区
- 年龄大于阈值，进入老年代，--X:MaxTenuringThreshold参数设置
- Minor GC后，存活的对象空间大于survivor空间，直接进入老年代。

以上对象均是分配到堆空间。

#### 栈

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1715525875467-212eae86-8358-446a-81d8-3ec21e44a37f.png)

#### 方法区

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1715525916410-043c5f5a-261d-4c5d-a552-b3ae027fbc9d.png)

jdk7及以前叫做永久代，jdk8开始，使用元空间取代了永久代。方法区和永久代并不等价，仅是对HotSpot虚拟机而言。《Java虚拟机规范》对如何实现方法区不做统一的要求，元空间使用的是本地内存。

jdk1.6及之前：有永久代(permanent generation)

jdk1.7：有永久代，但已经逐步“去永久代”，字符串常量池、静态变量移除，保存在堆中

jdk1.8及以后：无永久代，类型信息、字段、方法、常量保存在本地内存的元空间，但字符串常量池、静态变量仍在堆中

**字符串创建频率高，放在永久代不易回收**

### 对象内存布局

#### 创建对象的方法

1. new

2. 反射

   - 根据类名：类名.class

   - 根据对象：对象.getClass()

   - 根据全限定类名：Class.forName(全限定类名)

   - 根据对象：对象.newInstance()，JDK9废弃

3. Constructor的getDeclaredConstructors()[0].newInstance(xx)，可以调用空参、带参的构造器，没有权限要求

4. clone()，浅拷贝

5. 反序列化，从文件中、数据库中、网络中获取一个对象的二进制流，反序列化为内存中的对象

6. 第三方库Objenesis，利用了asm字节码技术，动态生成Constructor

#### 从执行步骤角度分析

1. 判断对象对应的类是否加载、链接、初始化

2. 为对象分配内存

   - 指针碰撞

   - 空闲列表

3. 处理并发安全问题

4. 初始化分配到的空间

5. 设置对象的对象头

6. 执行init方法进行初始化

#### 五种引用

1. 强引用：不回收，程序中绝大部分都是强引用。

2. 软引用：内存不足即回收，使用SoftReference类

   作用：可以缓存一些经常使用到的数据，但是在垃圾回收时发现内存不足会被回收

3. 弱引用：发现即回收，使用WeakReference类

   作用：在资源充足的时候缓存一些数据，当有垃圾回收(说明资源可能不足了)直接被回收掉

4. 虚引用：对象回收跟踪，使用PhantomReference类

   作用：用于跟踪垃圾回收过程。

5. 终结器引用：实现对象的finalize()方法，无需手动编码，其内部配合队列使用。在GC时，终结器引用入队。由Finalizer线程通过终结器引用找到被引用对象并调用，它的finalize()方法，第二次GC时才能回收被引用对象。

## GC

### 垃圾判别算法

判断一个对象是否是一个垃圾的算法

1. 引用计数算法：对于一个对象A，只要任何一个对象引用了A，那么的A的引用计数器则+1，当引用失效时，引用计数器-1。如果A的引用计数器=0了，则表示对象A不可能再被使用，可进行回收。

   优点：实现简单，垃圾对象便于辨识；判断效率高，回收没有延迟性

   缺点：

   - 需要单独的字段存储计数器，增加了内存开销
   - 每次赋值都需要更新计数器，需要加减法操作，增加了时间开销
   - 无法处理循环引用，致命缺陷，Java的垃圾回收器没有使用这个算法

2. 可达性分析算法(GC Root 根搜索算法)：以根对象集合为起始点，按照从上至下的方法搜索被根对象集合所连接的目标对象是否可达。使用可达性分析算法后，内存中的存活对象都会被根对象集合直接或间接连接，搜索所走过的路径称为引用链。如果目标对象没有任何引用链相连，则是不可达标记为垃圾对象。只有能够被根集合直接或者间接连接的对象才是存活对象。

   优点：实现简单，执行高效，有效的解决循环引用的问题，防止内存泄露。

   GC Roots：

   - 虚拟机栈中引用的对象：各个线程被调用的方法中使用到的参数、局部变量等。
   - 本地方法栈内JNI (通常说的本地方法)引用的对象
   - 类静态属性引用的对象：比如: Java类的引用类型静态变量
   - 方法区中常量引用的对象：字符串常量池(String Table)里的引用
   - 所有被同步锁synchronized持有的对象
   - Java虚拟机内部的引用：基本数据类型对应的Class对象，一些常驻的异常对象( 如: NullPointerException、OutOfMemoryError），系统加载类
   - 反映Java虚拟机内部情况的JMXBean、JVMTI中注册的回调、本地代码缓存等。
   - 除了这些固定的GCRoots集合以外，根据用户所选用的垃圾收集器以及当前回收的内存区域不同，还可以有其他对象“临时性”地加入，共同构成完整GC Roots集合。比如：分代收集和局部回收（Partial GC）

**可达性分析算法必须在一个能保证一致性的快照中进行，因为你的一个对象当前可能是可达的，但是下一秒可能不可达，所以判断必须是某一个快照时刻去判断**

### 垃圾清除算法

当一个对象被判别为一个垃圾对象，如何清除的算法

1. 标记-清除算法

   标记非垃圾对象，将未标记的对象进行清除

   缺点：存在垃圾碎片问题

   CMS垃圾回收器使用

2. 复制算法

   需要两块空间，每次只使用其中一块，将存活对象复制一份到另外一块空间，将原来的对象引用指向新复制的对象![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704088261924-4f6bfc04-082b-48f6-b4d2-23cdf29096f8.png)

   缺点：空间占用比较大，但是没有碎片空间

   新生代常用

3. 标记-压缩算法

   标记对象的同时进行碎片整理

   缺点：效率较低

   老年代常用

4. 分代收集算法

   根据不同代采用不同的算法
   
   |          | Mark-Sweep     | Mark-Compact   | Copying                             |
   | -------- | -------------- | -------------- | ----------------------------------- |
   | 速度     | 中等           | 最慢           | 最快                                |
   | 空间开销 | 少(会堆积碎片) | 少(不堆积碎片) | 通常需要活对象的2倍大小(不堆积碎片) |
   | 移动对象 | 否             | 是             | 是                                  |
   
   年轻代特点：区域相对老年代较小，对象生命周期短、存活率低，回收频繁。适合复制算法
   
   老年代特点：区域较大，对象生命周期长、存活率高，回收不及年轻代频繁。一般是由标记-清除或者标记-清除与标记-整理的混合实现。  

5. 增量收集算法

   通过增加GC的频率，而降低Stop the world，垃圾收集线程和应用程序线程交替执行。每次，垃圾收集线程只收集一小片区域的内存空间，接着切换到应用程序线程，依次反复，直到垃圾收集完成。

   缺点：吞吐量会降低。

   G1垃圾回收器，老年代分为多个region

6. 分区算法

   每一个小区间都独立使用，独立回收。这种算法的好处是可以控制次回收多少个小区间。般来说，在相同条件下，堆空间越大，一次GC时所需要的时间就越长，有关GC产生的停顿也越长。为了更好地控制GC产生的停顿时间，将一块大的内存区域分割成多个小块，根据目标的停顿时间，每次合理地回收若千个小区间，而不是整个堆空间，从而减少一次GC所产生的停顿。

### 垃圾回收器

#### 分类

**串行vs并行**

按线程数分，可以分为串行垃圾回收器和并行垃圾回收器。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704107657017-6049e710-4cae-415f-81c4-dadc97b03bd5.png)

**并发式vs独占式**

按照工作模式分，可以分为并发式垃圾回收器和独占式垃圾回收器。

- 并发式垃圾回收器与应用程序线程交替工作，以尽可能减少应用程序的停顿时间

- 独占式垃圾回收器(Stop the world)一旦运行， 就停止应用程序中的所有用户

线程，直到垃圾回收过程完全结束。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704107728908-34ebfee1-645f-471a-81bc-e929a10497d1.png)

**压缩式vs非压缩式**

按碎片处理方式分，可分为压缩式垃圾回收器和非压缩式垃圾回收器，垃圾回收完是否进行碎片压缩

- 压缩式垃圾回收器会在回收完成后，对存活对象进行压缩整理，消除回收后的碎片。
  - 再分配对象空间使用：指针碰撞

- 非压缩式的垃圾回收器不进行这步操作。
  - 再分配对象空间使用：空闲列表


**年轻代vs老年代**

按工作的内存区间分，又可分为年轻代垃圾回收器和老年代垃圾回收器。

#### GC评估指标

1. 吞吐量：程序的运行时间(程序的运行时间十内存回收的时间)
2. 暂停时间(响应时间)：执行垃圾收集时，程序的工作线程被暂停的时间
3. 垃圾收集开销：吞吐量的补数，垃圾收集器所占时间与总时间的比例。
4. 收集频率：相对于应用程序的执行，收集操作发生的频率。
5. 内存占用：Java堆区所占的内存大小。
6. 快速：一个对象从诞生到被回收所经历的时间。

**吞吐量---> 吞吐量越大越好!**

**暂停时间(或响应时间)-->追求低延迟**

#### 垃圾回收器有哪些？

串行回收器：Serial、Serial old

并行回收器：ParNew、Parallel Scavenge、Parallel old

并发回收器：CMS、G1

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704205359912-22c479f2-e3d2-4eab-b7f7-aa2fdb66a4e9.png)

不同厂商、不同版本的虚拟机实现差别很大。HotSpot 虚拟机在JDK7/8后所有收集器及组合(连线)，如下图：（更新到了JDK14）

![](https://cdn.nlark.com/yuque/0/2024/png/25672830/1704205929568-d6fcb86a-883b-4c50-92d9-0ecef6cae2a6.png)

1. 两个收集器间有连线，表明它们可以搭配使用：

   Serial/Serial old、Serial/CMS、ParNew/Serial old、ParNew/CMS、Parallel Scavenge/Serial old、Parallel Scavenge/Parallel old、G1;

2. 其中Serial old作为CMS出现“Concurrent Mode Failure”失败的后备预案
3. （红色虚线）由于维护和兼容性测试的成本，在JDK 8时将Serial+CMS、ParNew+Serial old这两个组合声明为废弃(JEP 173)，并在JDK 9中完全取消了这些组合的支持(JEP214)，即：移除。
4. （绿色虚线）JDK 14中：弃用Parallel Scavenge 和Serial old GC组合(JEP366)
5. （青色虚线）JDK 14中：删除CMS垃圾回收器(JEP 363)

##### Serial GC：串行回收

Serial GC 新生代

- JDK1.3之前回收新生代的唯一选择
- HotSpot中Client模式下默认
- 复制算法、串行回收、Stop the world机制

Serial Old GC 老年代

- 标记-压缩算法、串行回收、Stop the world机制
- HotSpot中Client模式下默认
- 在server模式有两个用途：与新生代Parallel Scavenge配合使用，作为老年代CMS收集器的后备垃圾回收方案

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704208181172-d4795083-5416-4348-ac2f-16e05b3d602c.png)

优势：简单高效，适合单CPU，在垃圾回收时暂停用户线程，STW

**适合硬件配置不高的情况**

##### ParNew GC：并行回收

Serial多线程版本，使用的算法一样

ParNew是很多JVM运行在Server模式下新生代的默认垃圾收集器，**只管新生代**

**默认老年代是：Serial Old GC**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704208583802-a9e65867-4a3e-4ef5-adfc-62be87d260e4.png)

对于新生代，回收次数频繁，使用并行方式高效。|

对于老年代，回收次数少，使用串行方式节省资源。(CPU并行需要切换线程，串行可以省去切换线程的资源)

- 在程序中，开发人员可以通过选项"-xx:+UseParNewGC"手动指定使用ParNew收集器执行内存回收任务。它表示年轻代使用并行收集器，不影响老年代。
- -XX:ParallelGCThreads 限制线程数量，默认开启和CPU数据相同的线程数。

##### Parallel GC：并行回收

Parallel GC 新生代

Parallel old GC 老年代

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704287324217-f873cf87-3ad3-4ef9-9067-35c453ad8696.png)

- 和ParNew收集器不同，Parallel Scavenge收 集器的目标则是达到一个可控制的吞吐量(Throughput)，它也被称为吞吐量优先的垃圾收集器。
- 自适应调节策略是Parallel Scavenge 与ParNew个重要区别。

高吞吐量则可以高效率地利用CPU时间，尽快完成程序的运算任务，主要适合在后台运算而不需要太多交互的任务。因此，常见在服务器环境中使用。例如，那些执行批量处理、订单处理、工资支付、科学计算的应用程序。

Parallel收集器在JDK1.6时提供了用于执行老年代垃圾收集的Parallel 0ld收集器，用来代替老年代的Serial old收集器。

Parallel old收集器采用了标记-压缩算法，但同样也是基于并行回收和“Stop-the-World”机制。

默认Eden与Survivor比例为6：1：1

**配置参数**

> -XX:MaxGCpauseMillis，设置垃圾收集器最大停顿时间(即STW的时间)，单位是毫秒

> -XX:GCTimeRation，垃圾收集时间占总时间的比例( = 1 / (N + 1))，用于衡量的大小，取值范围(0,100)，默认99，垃圾回收时间不超过1%

>  -XX:+UseAdaptiveSizePolicy，设置Parallel Scavenge收集器具有自适应调节策略

##### CMS：低延迟

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704330119911-2bab1a6a-5f1c-4e47-8672-1c87160855cf.png)

回收步骤

1. 初始标记：STW，非常短暂，找到与GC Roots直接相连的对象
2. 并发标记：并发，从GC Roots开始标记所有不可达的对象，不会停顿用户线程
3. 重新标记：STW，由于步骤2是并发的用户线程在执行，可能存在数据不一致，之前是不可达但是现在是可达的需要修正这些标记，还有一些之前是可达的现在是不可达，称为浮动垃圾，需要等到下次进行清理
4. 并发清理：清理删除掉标记阶段判断的已经死亡的对象

##### G1：区域划分代式

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704330175265-e24f9b23-66ba-4333-8d0f-b351cafe6f0d.png)

老年代分为一个个region，进行清理

region内是标记--复制，region之间是标记--整理，region使用率进行排序，优先清除使用率高的

一般使用G1垃圾回收器就不设置新生代跟老年代的空间比值，让G1自动调整，通常设置垃圾回收最大停顿时间

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704330242306-65665e5f-e412-4a36-8a5a-68e8835c49aa.png)

**并行与并发**

- 并行性：G1在回收期间，可以有多个GC线程同时工作，有效利用多核计算能力。此时用户线程STW
- 并发性：G1拥有与应用程序交替执行的能力，部分工作可以和应用程序同时执行，因此一般来说，不会在整个回收阶段发生完全阻塞应用程序的情况

**分代收集**

- 从分代上看，G1依然属于分代型垃圾回收器，它会区分年轻代和老年代，年轻代依然有Eden区和Survivor区。但从堆的结构上看，它不要求整个Eden区、年轻代或者老年代都是连续的，也不再坚持固定大小和固定数量。
- 将堆空间分为若干个区域(Region)，这些区域中包含了逻辑上的年轻代和老年代。
- 和之前的各类回收器不同，它同时兼顾年轻代和老年代。对比其他回收器，或者工作在年轻代，或者工作在老年代

#### 总结

| 收集器            | 串行、并行or并发 | 新生代/老年代   | 算法               | 目标                 | 适用场景                                  |
| ----------------- | ---------------- | --------------- | ------------------ | -------------------- | ----------------------------------------- |
| Serial            | 串行             | 新生代          | 复制算法           | 响应速度优先         | 单CPU环境下的Client模式                   |
| Serial Old        | 串行             | 老年代          | 标记-整理          | 响应速度优先         | 单CPU环境下的Client模式、CMS的后备预案    |
| ParNew            | 并行             | 新生代          | 复制算法           | 响应速度优先         | 多CPU环境时在Server模式下与CMS配合        |
| Parallel Scavenge | 并行             | 新生代          | 复制算法           | 最大化吞吐量         | 在后台运算而不需要太多交互的任务          |
| Parallel Old      | 并行             | 老年代          | 标记-整理          | 吞吐量优先           | 在后台运算而不需要太多交互的任务          |
| CMS               | 并发             | 老年代          | 标记-清除          | 降低暂停时间         | 集中在互联网站或B/S系统服务端上的Java应用 |
| G1                | 并发             | 新生代 / 老年代 | 标记-整理+复制算法 | 可预测的暂停时间控制 | 面向服务端应用，将来替换CMS               |
| Shenandoah        | 并发             | 整个堆          | 标记-复制-压缩     | 极低的暂停时间       | 适合大内存低延迟应用                      |
| ZGC               | 并发             | 整个堆          | 标记-复制-重定位   | 极低的暂停时间       | 适合大内存低延迟应用                      |

## 参数

### 栈

> -Xss：设置虚拟机栈大小，JDK5后默认1024k

### 堆

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

### 方法区

> -XX:+TraceClassLoading，加载类信息打印

> -XX:+TraceClassUnloading，卸载类信息打印

**jdk6/7**

> -XX:PermSize=10m，永久代初始空间

> -XX:MaxPermSize=10m，永久代最大空间

**jdk8**

> -XX:MetaspaceSize=10m，元空间初始空间

> -XX:MaxMetaspaceSize=10m，元空间最大空间

### GC

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

### 查看运行时 JVM 参数

> -XX:+PrintFlagsInitial 查看初始值

> -XX:+PrintFlagsFinal：查看最终的值一般都有一个默认值，可以通过命令行等配置方式覆盖掉这个默认值，这里查看的则是这个最终的值

> -XX:+UnlockExperimentaIVMOptions：解锁实验参数JVM 中有一部分参数是无法直接赋值的，需要加该参数，解锁实验参数，才能配置

> -XX:UnlockDiagnosticVMOpeions：解锁诊断参数

> -XX:+PrintCommandLineFlags：打印命令行参数，查看命令行相关参数（包含使用的垃圾收集器）

### JIT编译器

> -XX:+DoEscapeAnalysis，jdk 6u23开始已经默认开始逃逸分析

> -XX:+EliminateAllocations，开启标量替换，需要逃逸分析先开启

### 总结

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

## 调优

现在JVM调优标准：在最大吞吐量优先的情况下，降低停顿时间

**案例：**

[JAVA 生产环境下性能监控与调优详解](https://zq99299.github.io/note-book2/monitor-tuning/#必备推荐)

[当小白遇到FullGC | 京东云技术团队](https://juejin.cn/post/7270152013341425698)

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

   - 打印GC日志，通过GCviewer或者[gceasy](https://gceasy.ycrash.cn/)来分析日志信息

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


### 优化案例

#### 1.调整堆大小提高服务的吞吐量

#### 2.JIT编译器优化

1. 逃逸分析：如果一个引用的对象的使用是否只会在一个方法中，如果在其他方法还会使用，说明该对象发生逃逸；如果一个对象没有发生逃逸（作用域只在一个方法中），JIT编译器根据逃逸分析的结构，可能将该对象优化成**栈上分配**，分配完成后，继续在调用栈内执行，最后线程结束，栈空间被回收，局部变量对象也被回收。这样就无须进行垃圾回收了。

2. 同步消除：

   编译前代码

   ```java
   public void f() {
       Object object = new Object(); // object这个对象不会发生逃逸
       synchronized(object) {
           System.out.println(object);
       }
   }
   ```

   编译后代码

   ```java
   public void f() {
       Object object = new Object();
       System.out.println(object);
   }
   ```

由于object对象不会发生逃逸，所有经过JIT编译后，会消除同步代码块

3. 标量替换

   标量替换前

   ```java
   public static void main(String[] args) {
      alloc();
   }
   private static void alloc() {
      Point point = new Point（1,2）; // point这个对象不会发生逃逸
      System.out.println("point.x="+point.x+"; point.y="+point.y);
   }
   class Point{
       private int x;
       private int y;
   }
   ```

   标量替换后

   ```java
   private static void alloc() {
      int x = 1;
      int y = 2;
      System.out.println("point.x="+x+"; point.y="+y);
   }
   ```

Point这个聚合量经过逃逸分析后，发现它并没有逃逸，就被替换成两个标量了。那么标量替换有什么好处呢？就是可以大大减少堆内存的占用。因为一旦不需要创建对象了，那么就不再需要分配堆内存了。

标量替换为栈上分配提供了很好的基础。

**结论：Java中的逃逸分析，其实优化的点就在于对栈上分配的对象进行标量替换。**

#### 3.合理配置堆内存

依据的原则是根据Java Performance里面的推荐公式来进行设置。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704724054137-385b3191-2044-4cd7-9a42-ab37cbcefe0c.png)

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


#### 4.CPU占用率很高的排查方案

1. ps aux | grep java 查看到当前java进程使用cpu、内存、磁盘的情况获取使用量异常的进程
2. top -Hp 进程pid 检查当前使用异常线程的pid
3. 把线程pid变为16进制如 31695 - 》 7bcf 然后得到0x7bcf
4. jstack 进程的pid | grep -A20  0x7bcf  得到相关进程的代码

### 命令

[官方文档](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/toc.html)

1. [**jps**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jps.html#CHDCGECD)

> jps，查看正在运行的Java进程

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704206996779-df0c9c8d-8e4d-4a82-aa36-a21a3e369ef0.png)



2. [**jstat**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstat.html#BEHHGFAE)

>  jstat -gc 进程号 打印周期(ms) 打印次数，查看JVM统计信息

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372236245-d42c4444-ba3e-4bc8-a289-b5a2e355e3aa.png)

3. [**jinfo**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jinfo.html#BCGEBFDD)

>  jinfo -flag 相关垃圾回收器参数 进程ID，实时查看和修改JVM配置参数（+表示在使用，-未使用）

![](https://cdn.nlark.com/yuque/0/2024/png/25672830/1704207097037-e17da0c3-19d8-44ac-92d5-9bd79029650a.png)

4. [**jmap**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jmap.html#CEGCECJB)

> jmap -histo:live 进程ID，导出内存映像文件&内存使用情况

![](https://cdn.nlark.com/yuque/0/2024/png/25672830/1705372377866-0cb243ba-a322-4c3b-99a6-cd5b664984cf.png)

> jmap -heap 进程ID ，打印内存信息

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372330181-201d48b5-7e83-42f6-ac6d-a490c5c8b0a2.png)

5. [**jhat**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jhat.html#CIHHJAGE)

JDK自带堆分析工具

6. [**jstack**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstack.html#BABGJDIF)

> jstack 进程ID，打印JVM中线程快照

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372426504-0d317319-6105-44e9-8937-3c55fb075b3d.png)

7. [**jcmd**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jcmd.html#CIHEEDIB)

多功能命令行

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372447216-f8284e21-6894-4d29-afa1-dbb91b3ece46.png)

8. [**jstatd**](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstatd.html#BABEHFHF)

远程主机信息收集

### 工具

1. jConsole
2. Visual VM
3. eclipse MAT
4. JProfiler
5. Arthas
6. Java Mission Control