---
order: 2
title: Scheduled
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# Scheduled

任务调度线程池 ScheduledThreadPoolExecutor 继承 ThreadPoolExecutor：

- 使用内部类 ScheduledFutureTask 封装任务
- 使用内部类 DelayedWorkQueue 作为线程池队列
- 重写 onShutdown 方法去处理 shutdown 后的任务
- 提供 decorateTask 方法作为 ScheduledFutureTask 的修饰方法，以便开发者进行扩展

构造方法：`Executors.newScheduledThreadPool(int corePoolSize)`

```java
public ScheduledThreadPoolExecutor(int corePoolSize) {
    // 最大线程数固定为 Integer.MAX_VALUE，保活时间 keepAliveTime 固定为 0
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          // 阻塞队列是 DelayedWorkQueue
          new DelayedWorkQueue());
}
```

常用 API：

- `ScheduledFuture\<?\> schedule(Runnable/Callable\<V\>, long delay, TimeUnit u)`：延迟执行任务
- `ScheduledFuture\<?\> scheduleAtFixedRate(Runnable/Callable\<V\>, long initialDelay, long period, TimeUnit unit)`：定时执行周期任务，不考虑执行的耗时，参数为初始延迟时间、间隔时间、单位
- `ScheduledFuture\<?\> scheduleWithFixedDelay(Runnable/Callable\<V\>, long initialDelay, long delay, TimeUnit unit)`：定时执行周期任务，考虑执行的耗时，参数为初始延迟时间、间隔时间、单位

基本使用：

-  延迟任务，但是出现异常并不会在控制台打印，也不会影响其他线程的执行 

```java
public static void main(String[] args){
    // 线程池大小为1时也是串行执行
    ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);
    // 添加两个任务，都在 1s 后同时执行
    executor.schedule(() -> {
    	System.out.println("任务1，执行时间：" + new Date());
        //int i = 1 / 0;
    	try { Thread.sleep(2000); } catch (InterruptedException e) { }
    }, 1000, TimeUnit.MILLISECONDS);
    
    executor.schedule(() -> {
    	System.out.println("任务2，执行时间：" + new Date());
    }, 1000, TimeUnit.MILLISECONDS);
}
```

-  定时任务 scheduleAtFixedRate：**一次任务的启动到下一次任务的启动**之间只要大于等于间隔时间，抢占到 CPU 就会立即执行 

```java
public static void main(String[] args) {
    ScheduledExecutorService pool = Executors.newScheduledThreadPool(1);
    System.out.println("start..." + new Date());
    
    pool.scheduleAtFixedRate(() -> {
        System.out.println("running..." + new Date());
        Thread.sleep(2000);
    }, 1, 1, TimeUnit.SECONDS);
}

/*start...Sat Apr 24 18:08:12 CST 2021
running...Sat Apr 24 18:08:13 CST 2021
running...Sat Apr 24 18:08:15 CST 2021
running...Sat Apr 24 18:08:17 CST 2021
```

-  定时任务 scheduleWithFixedDelay：**一次任务的结束到下一次任务的启动之间**等于间隔时间，抢占到 CPU 就会立即执行，这个方法才是真正的设置两个任务之间的间隔 

```java
public static void main(String[] args){
    ScheduledExecutorService pool = Executors.newScheduledThreadPool(3);
    System.out.println("start..." + new Date());
    
    pool.scheduleWithFixedDelay(() -> {
        System.out.println("running..." + new Date());
        Thread.sleep(2000);
    }, 1, 1, TimeUnit.SECONDS);
}
/*start...Sat Apr 24 18:11:41 CST 2021
running...Sat Apr 24 18:11:42 CST 2021
running...Sat Apr 24 18:11:45 CST 2021
running...Sat Apr 24 18:11:48 CST 2021
```
