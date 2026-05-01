---
order: 4
title: 成员方法
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# 成员方法

### 提交任务

-  schedule()：延迟执行方法，并指定执行的时间，默认是当前时间 

```java
public void execute(Runnable command) {
    // 以零延时任务的形式实现
    schedule(command, 0, NANOSECONDS);
}
public ScheduledFuture\<?\> schedule(Runnable command, long delay, TimeUnit unit) {
    // 判空
    if (command == null || unit == null) throw new NullPointerException();
    // 没有做任何操作，直接将 task 返回，该方法主要目的是用于子类扩展，并且【根据延迟时间设置任务触发的时间点】
    RunnableScheduledFuture\<?\> t = decorateTask(command, new ScheduledFutureTask\<Void\>(
        											command, null, triggerTime(delay, unit)));
    // 延迟执行
    delayedExecute(t);
    return t;
}
// 返回【当前时间 + 延迟时间】，就是触发当前任务执行的时间
private long triggerTime(long delay, TimeUnit unit) {
    // 设置触发的时间
    return triggerTime(unit.toNanos((delay < 0) ? 0 : delay));
}
long triggerTime(long delay) {
    // 如果 delay < Long.Max_VALUE/2，则下次执行时间为当前时间 +delay
    // 否则为了避免队列中出现由于溢出导致的排序紊乱,需要调用overflowFree来修正一下delay
    return now() + ((delay < (Long.MAX_VALUE >> 1)) ? delay : overflowFree(delay));
}
```

overflowFree 的原因：如果某个任务的 delay 为负数，说明当前可以执行（其实早该执行了）。阻塞队列中维护任务顺序是基于 compareTo 比较的，比较两个任务的顺序会用 time 相减。那么可能出现一个 delay 为正数减去另一个为负数的 delay，结果上溢为负数，则会导致 compareTo 产生错误的结果 

```java
private long overflowFree(long delay) {
    Delayed head = (Delayed) super.getQueue().peek();
    if (head != null) {
        long headDelay = head.getDelay(NANOSECONDS);
        // 判断一下队首的delay是不是负数，如果是正数就不用管，怎么减都不会溢出
        // 否则拿当前 delay 减去队首的 delay 来比较看，如果不出现上溢，排序不会乱
		// 不然就把当前 delay 值给调整为 Long.MAX_VALUE + 队首 delay
        if (headDelay < 0 && (delay - headDelay < 0))
            delay = Long.MAX_VALUE + headDelay;
    }
    return delay;
}
```

-  scheduleAtFixedRate()：定时执行，一次任务的启动到下一次任务的启动的间隔 

```java
public ScheduledFuture\<?\> scheduleAtFixedRate(Runnable command, long initialDelay, long period,
                                              TimeUnit unit) {
    if (command == null || unit == null)
        throw new NullPointerException();
    if (period <= 0)
        throw new IllegalArgumentException();
    // 任务封装，【指定初始的延迟时间和周期时间】
    ScheduledFutureTask\<Void\> sft =new ScheduledFutureTask\<Void\>(command, null,
                                      triggerTime(initialDelay, unit), unit.toNanos(period));
    // 默认返回本身
    RunnableScheduledFuture\<Void\> t = decorateTask(command, sft);
    sft.outerTask = t;
    // 开始执行这个任务
    delayedExecute(t);
    return t;
}
```

-  scheduleWithFixedDelay()：定时执行，一次任务的结束到下一次任务的启动的间隔 

```java
public ScheduledFuture\<?\> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay,
                                                 TimeUnit unit) {
    if (command == null || unit == null) 
        throw new NullPointerException();
    if (delay <= 0)
        throw new IllegalArgumentException();
    // 任务封装，【指定初始的延迟时间和周期时间】，周期时间为 - 表示是 fixed-delay 模式
    ScheduledFutureTask\<Void\> sft = new ScheduledFutureTask\<Void\>(command, null,
                                      triggerTime(initialDelay, unit), unit.toNanos(-delay));
    RunnableScheduledFuture\<Void\> t = decorateTask(command, sft);
    sft.outerTask = t;
    delayedExecute(t);
    return t;
}
```

### 运行任务

-  delayedExecute()：**校验线程池状态**，延迟或周期性任务的主要执行方法 

```java
private void delayedExecute(RunnableScheduledFuture\<?\> task) {
    // 线程池是 SHUTDOWN 状态，需要执行拒绝策略
    if (isShutdown())
        reject(task);
    else {
        // 把当前任务放入阻塞队列，因为需要【获取执行时间最近的】，当前任务需要比较
        super.getQueue().add(task);
        // 线程池状态为 SHUTDOWN 并且不允许执行任务了，就从队列删除该任务，并设置任务的状态为取消状态
        if (isShutdown() && !canRunInCurrentRunState(task.isPeriodic()) && remove(task))
            task.cancel(false);
        else
            // 可以执行
            ensurePrestart();
    }
}
```

-  ensurePrestart()：**开启线程执行任务** 

```java
// ThreadPoolExecutor#ensurePrestart
void ensurePrestart() {
    int wc = workerCountOf(ctl.get());
    // worker数目小于corePoolSize，则添加一个worker。
    if (wc < corePoolSize)
        // 第二个参数 true 表示采用核心线程数量限制，false 表示采用 maximumPoolSize
        addWorker(null, true);
    // corePoolSize = 0的情况，至少开启一个线程，【担保机制】
    else if (wc == 0)
        addWorker(null, false);
}
```

 

-  canRunInCurrentRunState()：任务运行时都会被调用以校验当前状态是否可以运行任务 

```java
boolean canRunInCurrentRunState(boolean periodic) {
    // 根据是否是周期任务判断，在线程池 shutdown 后是否继续执行该任务，默认非周期任务是继续执行的
    return isRunningOrShutdown(periodic ? continueExistingPeriodicTasksAfterShutdown :
                               executeExistingDelayedTasksAfterShutdown);
}
```

-  onShutdown()：删除并取消工作队列中的不需要再执行的任务 

```java
void onShutdown() {
    BlockingQueue\<Runnable\> q = super.getQueue();
    // shutdown 后是否仍然执行延时任务
    boolean keepDelayed = getExecuteExistingDelayedTasksAfterShutdownPolicy();
    // shutdown 后是否仍然执行周期任务
    boolean keepPeriodic = getContinueExistingPeriodicTasksAfterShutdownPolicy();
    // 如果两者皆不可，则对队列中【所有任务】调用 cancel 取消并清空队列
    if (!keepDelayed && !keepPeriodic) {
        for (Object e : q.toArray())
            if (e instanceof RunnableScheduledFuture\<?\>)
                ((RunnableScheduledFuture\<?\>) e).cancel(false);
        q.clear();
    }
    else {
        for (Object e : q.toArray()) {
            if (e instanceof RunnableScheduledFuture) {
                RunnableScheduledFuture\<?\> t = (RunnableScheduledFuture\<?\>)e;
                // 不需要执行的任务删除并取消，已经取消的任务也需要从队列中删除
                if ((t.isPeriodic() ? !keepPeriodic : !keepDelayed) ||
                    t.isCancelled()) {
                    if (q.remove(t))
                        t.cancel(false);
                }
            }
        }
    }
    // 因为任务被从队列中清理掉，所以需要调用 tryTerminate 尝试【改变线程池的状态】
    tryTerminate();
}
```
