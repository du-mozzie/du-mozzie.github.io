---
order: 2
title: 成员属性
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# 成员属性

成员变量

-  **线程池中存放 Worker 的容器**：线程池没有初始化，直接往池中加线程即可 

```java
private final HashSet\<Worker\> workers = new HashSet\<Worker\>();
```

-  线程全局锁： 

```java
// 增加减少 worker 或者时修改线程池运行状态需要持有 mainLock
private final ReentrantLock mainLock = new ReentrantLock();
```

-  可重入锁的条件变量： 

```java
// 当外部线程调用 awaitTermination() 方法时，会等待当前线程池状态为 Termination 为止
private final Condition termination = mainLock.newCondition()
```

-  线程池相关参数： 

```java
private volatile int corePoolSize;				// 核心线程数量
private volatile int maximumPoolSize;			// 线程池最大线程数量
private volatile long keepAliveTime;			// 空闲线程存活时间
private volatile ThreadFactory threadFactory;	// 创建线程时使用的线程工厂，默认是 DefaultThreadFactory
private final BlockingQueue\<Runnable\> workQueue;// 【超过核心线程提交任务就放入 阻塞队列】
private volatile RejectedExecutionHandler handler;	// 拒绝策略，juc包提供了4中方式
private static final RejectedExecutionHandler defaultHandler = new AbortPolicy();// 默认策略
```

-  记录线程池相关属性的数值： 

```java
private int largestPoolSize;		// 记录线程池生命周期内线程数最大值
private long completedTaskCount;	// 记录线程池所完成任务总数，当某个 worker 退出时将完成的任务累加到该属性
```

-  控制**核心线程数量内的线程是否可以被回收**： 

```java
// false（默认）代表不可以，为 true 时核心线程空闲超过 keepAliveTime 也会被回收
// allowCoreThreadTimeOut(boolean value) 方法可以设置该值
private volatile boolean allowCoreThreadTimeOut;
```

 内部类：

-  Worker 类：**每个 Worker 对象会绑定一个初始任务**，启动 Worker 时优先执行，这也是造成线程池不公平的原因。Worker 继承自 AQS，本身具有锁的特性，采用独占锁模式，state = 0 表示未被占用，> 0 表示被占用，< 0 表示初始状态不能被抢锁 

```java
private final class Worker extends AbstractQueuedSynchronizer implements Runnable {
	final Thread thread;			// worker 内部封装的工作线程
    Runnable firstTask;				// worker 第一个执行的任务，普通的 Runnable 实现类或者是 FutureTask
    volatile long completedTasks;	// 记录当前 worker 所完成任务数量
    
    // 构造方法
    Worker(Runnable firstTask) {
        // 设置AQS独占模式为初始化中状态，这个状态不能被抢占锁
       	setState(-1);
        // firstTask不为空时，当worker启动后，内部线程会优先执行firstTask，执行完后会到queue中去获取下个任务
        this.firstTask = firstTask;
        // 使用线程工厂创建一个线程，并且【将当前worker指定为Runnable】，所以thread启动时会调用 worker.run()
        this.thread = getThreadFactory().newThread(this);
    }
    // 【不可重入锁】
    protected boolean tryAcquire(int unused) {
        if (compareAndSetState(0, 1)) {
            setExclusiveOwnerThread(Thread.currentThread());
            return true;
        }
        return false;
    }
}
public Thread newThread(Runnable r) {
    // 将当前 worker 指定为 thread 的执行方法，线程调用 start 会调用 r.run()
    Thread t = new Thread(group, r, namePrefix + threadNumber.getAndIncrement(), 0);
    if (t.isDaemon())
        t.setDaemon(false);
    if (t.getPriority() != Thread.NORM_PRIORITY)
        t.setPriority(Thread.NORM_PRIORITY);
    return t;
}
```

-  拒绝策略相关的内部类
