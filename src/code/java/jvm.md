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

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202504271712636.png)

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

#### 类加载

##### 类加载器：

- BootStrapClassLoader 启动类加载器：加载JAVA_HOME/jre/lib目录下的库
- ExtClassLoader 扩展类加载器：加载JAVA_HOME/jre/lib目录下的库
- AppClassLoader 应用类加载器：加载classPath下的类
- CustomizeClassLoader 自定义类加载器：自定义类加载规则

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240801235029585.png)

双亲委派机制：当需要加载一个类的时候，先委托上一级的加载器去进行加载，如果上一级的加载器加载成功，子加载器就不会在进行加载。

**为什么要使用双亲委派机制**：

1. 通过双亲委派机制可以避免某一个类被重复加载，当父类已经加载后则无需重复加载，保证唯一性。
2. 为了安全，保证核心类不被篡改

##### 类加载流程：

类从加载到虚拟机中开始，直到卸载为止，它的整个生命周期包括了：加载、验证、准备、解析、初始化、使用和卸载这7个阶段。其中，验证、准备和解析这三个部分统称为连接（linking)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240802001210466.png)

- 加载：查找和导入class文件
- 验证：保证加载类的准确性
- 准备：为类变量分配内存并设置类变量初始值
- 解析：把类中的符号引用转换为直接引用
- 初始化：对类的静态变量，静态代码块执行初始化操作
- 使用：JVM开始从入口方法开始执行用户的程序代码
- 卸载：当用户程序代码执行完毕后，JVM便开始销毁创建的Class对象。

#### 五种引用

1. 强引用：不回收，程序中绝大部分都是强引用。只有所有GCRoots对象都不通过【强引l用】引I用该对象，该对象才能被垃圾回收。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240804141959387.png)

2. 软引用：内存不足即回收，使用SoftReference类

   作用：可以缓存一些经常使用到的数据，但是在垃圾回收时发现内存不足会被回收

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240804142035143.png)

3. 弱引用：发现即回收，使用WeakReference类

   作用：在资源充足的时候缓存一些数据，当有垃圾回收(说明资源可能不足了)直接被回收掉

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240804142120496.png)

4. 虚引用：必须配合引用队列使用，被引用对象回收时，会将虚引l用入队，由ReferenceHandler线程调用虚引l用相关方法释放直接内存

   作用：用于跟踪垃圾回收过程。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240804142448150.png)

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

**可达性分析算法必须在一个能保证一致性的快照中进行，因为你的一个对象当前可能是可达的，但是下一秒可能不可达，所以判断必须是某一个快照时刻去判断，现在的虚拟机常用的是可达性分析算法。**

### 垃圾清除算法

当一个对象被判别为一个垃圾对象，如何清除的算法

1. 标记-清除算法(Mark-Sweep)

   - **过程**：首先标记所有需要回收的对象，然后统一回收
   - **优点**：实现简单
   - **缺点**：效率低，会产生大量内存碎片

2. 标记-整理算法(Mark-Compact)

   - **过程**：标记后将存活对象向一端移动，然后清理边界以外的内存
   - **优点**：不会产生内存碎片
   - **缺点**：移动对象需要更新引用，效率较低

3. 复制算法(Copying)

   - **过程**：将内存分为两块，只使用一块，当这块用完时，将存活对象复制到另一块
   - **优点**：高效，不会产生内存碎片
   - **缺点**：可用内存减少为原来的一半

4. 分代收集算法(Generational Collection)

   - **过程**：根据对象存活周期，将内存划分为不同的区域，根据各个区域特点使用不同算法
   - **优点**：结合各种算法优点，提高回收效率
   - **缺点**：实现复杂


### 垃圾回收器

#### 1. Serial/Serial Old 回收器

- **执行过程**:
  - 新生代回收时，Eden区满触发Minor GC
  - 单线程执行，完全暂停应用线程(STW)
  - 老年代回收时，单线程执行Full GC
- **优缺点**:
  - **优点**: 简单高效，单线程无线程切换开销
  - **缺点**: 停顿时间长，不适合多核处理器

#### 2. Parallel/Parallel Old 回收器

- **执行过程**:
  - 新生代回收时，多线程并行执行垃圾回收
  - 应用线程仍然完全暂停(STW)
  - 注重吞吐量，可通过参数控制最大停顿时间和吞吐量
- **优缺点**:
  - **优点**: 充分利用多核CPU，提高吞吐量
  - **缺点**: 仍有较长停顿时间，不适合需要低延迟的应用

**配置参数**

> -XX:MaxGCpauseMillis，设置垃圾收集器最大停顿时间(即STW的时间)，单位是毫秒

> -XX:GCTimeRation，垃圾收集时间占总时间的比例( = 1 / (N + 1))，用于衡量的大小，取值范围(0,100)，默认99，垃圾回收时间不超过1%

> -XX:+UseAdaptiveSizePolicy，设置Parallel Scavenge收集器具有自适应调节策略

#### 3. CMS 回收器

- **执行过程**:
  1. 初始标记(STW): 仅标记GC Roots能直接关联的对象
  2. 并发标记: 与用户线程并发执行，进行GC Roots追踪
  3. 重新标记(STW): 修正并发标记期间用户线程导致的变动
  4. 并发清除: 与用户线程并发执行，清除垃圾对象
- **优缺点**:
  - **优点**: 并发收集，低停顿
  - **缺点**:
    - CPU资源敏感
    - 无法处理浮动垃圾
    - 会产生内存碎片

#### 4. G1 回收器

- **特点**：

  - 应用于新生代和老年代，在JDK9之后默认使用G1
  - 划分成多个区域，每个区域都可以充当eden，survivor，old，humongous，其中humongous专为大对象准备
  - 采用复制算法
  - 响应时间与吞吐量兼顾
  - 分成三个阶段：新生代回收(stw)、并发标记(重新标记stw)、混合收集
  - 如果并发失败（即回收速度赶不上创建新对象速度），会触发 FullGC

  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240804100840750.png)

- **执行过程**:
  1. 初始标记(STW): 标记GC Roots直接关联对象
  2. 并发标记: 与用户线程并发执行
  3. 最终标记(STW): 处理并发阶段遗留的标记
  4. 筛选回收(STW): 对各个Region的回收价值排序，选择回收收益最大的Region
- **优缺点**:
  - **优点**:
    - 可预测的停顿时间模型
    - 区域化分配与回收
    - 空间整合，不会产生大量碎片
  - **缺点**:
    - 内存占用和额外执行负载比CMS高

#### 总结

1. **分代假设驱动堆划分**

传统垃圾回收器（如Serial、Parallel Scavenge、CMS）基于**分代假设（Generational Hypothesis）**设计：

- **年轻代**：对象生命周期短（朝生夕死），适合**复制算法**（如Eden + Survivor区）。

- **老年代**：对象存活时间长，适合**标记-清除**或**标记-整理**算法。

堆的分代划分（Eden/Survivor/老年代）直接服务于分代回收策略，不同代区使用不同的回收算法。

2. **非分代堆结构**

现代垃圾回收器（如G1、ZGC、Shenandoah）采用**区域化堆设计**，打破了传统分代模型的物理界限：

- **G1（Garbage-First）**：将堆划分为多个**等大小Region**（通常2MB~32MB），逻辑上仍分年轻代（Eden/Survivor Region）和老年代（Old Region），但物理上不固定。
- **ZGC/Shenandoah**：彻底抛弃分代概念，将堆视为**连续的内存块**，通过着色指针或读屏障实现并发标记-整理。

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

项目中如何选择垃圾回收器：

1. 根据机器情况判断，如果是单核机器，或者内存较小的机器，则选择Serial GC。
2. 根据业务类型判断，看你的应用更在意的是吞吐量还是 STW 的时长。比如批处理任务的应用，更在意的就是吞吐量，而实时交易系统，更在意的就是 STW 的时长。
3. 根据机器分配的堆内存大小进行判断，一把来说，我们认为至少达到4G 以上才可以用 G1、ZGC 等，通常要比如超过8G、16G 这样效果才更好。
4. 根据 JDK 版本进行判断，不同的版本支持的垃圾收集器不一样。

GC评估指标：

1. 吞吐量：程序的运行时间(程序的运行时间十内存回收的时间)
2. 暂停时间(响应时间)：执行垃圾收集时，程序的工作线程被暂停的时间
3. 垃圾收集开销：吞吐量的补数，垃圾收集器所占时间与总时间的比例。
4. 收集频率：相对于应用程序的执行，收集操作发生的频率。
5. 内存占用：Java堆区所占的内存大小。
6. 快速：一个对象从诞生到被回收所经历的时间。

可以参考以下的选择方式（但是，并不绝对，尤其是 ZGC 和Shenandoah GC 的选择，其实还是要慎重，毕竟他们的稳定性各方面还有待验证）：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240917232425222.png)

**一次完整的GC流程大致如下，基于JDK1.8**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240917205336308.png)

## 参数

[参考文档](https://www.oracle.com/java/technologies/javase/vmoptions-jsp.html)

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

一些GC日志打印

> -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+PrintCommandLineFlags -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -XX:+PrintHeapAtGC -XX:+PrintTenuringDistribution -XX:+PrintGCApplicationStoppedTime -XX:+PrintReferenceGC

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




### 优化案例

#### 1.合理配置堆内存

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



#### 3.内存溢出排查方案

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



#### 4.CPU占用率很高的排查方案

1. **ps aux | grep java** 查看到当前java进程使用cpu、内存、磁盘的情况获取使用量异常的进程
2. **top -Hp  线程pid**  实时查看进程的所有线程运行信息，找到异常的线程id
3. 使用linux 命令 **printf "%x\n" 线程id**，把线程id变为16进制
4. **jstack 进程的pid | grep 线程id(16进制)** 得到相关进程的代码



#### 5.频繁 GC

1. 如果经常性的发生提前晋升情况，需要调整新生代大小和Survivor 区大小，或者调整 SurvivorRadio 比例
2. 调整整个新生代比例，例如 -xmn=2g调整到 -xmn=6g，gc情况会大大改善
3. 提前晋升会增加 younggc 耗时，因为跨代拷贝是很耗时的。
4. 注意 Survivor 区幸存对象大小是否过大，这也是影响 younggc 耗时的因素。

### 命令

[官方文档](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/toc.html)

#### [jps 虚拟机进程状况](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jps.html#CHDCGECD) 

> jps，查看正在运行的Java进程

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704206996779-df0c9c8d-8e4d-4a82-aa36-a21a3e369ef0.png)



#### [jstat 收集虚拟机运行数据](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstat.html#BEHHGFAE)

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

#### [jinfo Java配置信息工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jinfo.html#BCGEBFDD)

>  jinfo -flag 相关垃圾回收器参数 进程ID，实时查看和修改JVM配置参数（+表示在使用，-未使用）

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1704207097037-e17da0c3-19d8-44ac-92d5-9bd79029650a.png)

#### [jmap 内存映射工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jmap.html#CEGCECJB)

> jmap -dump:live,format=b,file=heapdump.hprof \<pid>，生成堆转储文件，包含 JVM 内存中的所有对象及其详细信息（信息最完整，通常配合 Eclipse MAT 或 VisualVM 进行分析）

> jmap -histo:live \<pid>，JVM 进程的内存使用情况，活跃的对象

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372377866-0cb243ba-a322-4c3b-99a6-cd5b664984cf.png)

> jmap -heap 进程ID ，打印内存信息

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372330181-201d48b5-7e83-42f6-ac6d-a490c5c8b0a2.png)

> jmap -histo \<pid> | head -n 10 实时查看占用前十的对象，包括被回收的对象

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240701110942786.png)

#### [jhat 堆转储快照分析工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jhat.html#CIHHJAGE)

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

#### [jstack Java堆栈跟踪工具](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstack.html#BABGJDIF)

> jstack 进程ID，打印JVM中线程快照

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372426504-0d317319-6105-44e9-8937-3c55fb075b3d.png)

#### [jcmd 虚拟机诊断命令](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jcmd.html#CIHEEDIB)

多功能命令行

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705372447216-f8284e21-6894-4d29-afa1-dbb91b3ece46.png)

#### [jstatd 远程主机信息收集](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jstatd.html#BABEHFHF)

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

### 工具

1. [jConsole](https://docs.oracle.com/javase/8/docs/technotes/guides/management/jconsole.html)
2. [Visual VM](https://visualvm.github.io/)
3. [Eclipse MAT](https://eclipse.dev/mat/)
4. [JProfiler](https://www.ej-technologies.com/products/jprofiler/overview.html)
5. [Arthas](https://arthas.aliyun.com/)
6. [Java Mission Control](https://www.oracle.com/java/technologies/jdk-mission-control.html)