---
order: 4
title: Future
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# Future

## 线程使用

FutureTask 未来任务对象，继承 Runnable、Future 接口，用于包装 Callable 对象，实现任务的提交

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    FutureTask\<String\> task = new FutureTask\<\>(new Callable\<String\>() {
        @Override
        public String call() throws Exception {
            return "Hello World";
        }
    });
    new Thread(task).start();	//启动线程
    String msg = task.get();	//获取返回任务数据
    System.out.println(msg);
}
```

构造方法：

```java
public FutureTask(Callable\<V\> callable){
	this.callable = callable;	// 属性注入
    this.state = NEW; 			// 任务状态设置为 new
}
public FutureTask(Runnable runnable, V result) {
    // 适配器模式
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;       
}
public static \<T\> Callable\<T\> callable(Runnable task, T result) {
    if (task == null) throw new NullPointerException();
    // 使用装饰者模式将 runnable 转换成 callable 接口，外部线程通过 get 获取
    // 当前任务执行结果时，结果可能为 null 也可能为传进来的值，【传进来什么返回什么】
    return new RunnableAdapter\<T\>(task, result);
}
static final class RunnableAdapter\<T\> implements Callable\<T\> {
    final Runnable task;
    final T result;
    // 构造方法
    RunnableAdapter(Runnable task, T result) {
        this.task = task;
        this.result = result;
    }
    public T call() {
        // 实则调用 Runnable#run 方法
        task.run();
        // 返回值为构造 FutureTask 对象时传入的返回值或者是 null
        return result;
    }
}
```

## 成员属性

FutureTask 类的成员属性：

-  任务状态： 

```java
// 表示当前task状态
private volatile int state;
// 当前任务尚未执行
private static final int NEW          = 0;
// 当前任务正在结束，尚未完全结束，一种临界状态
private static final int COMPLETING   = 1;
// 当前任务正常结束
private static final int NORMAL       = 2;
// 当前任务执行过程中发生了异常，内部封装的 callable.run() 向上抛出异常了
private static final int EXCEPTIONAL  = 3;
// 当前任务被取消
private static final int CANCELLED    = 4;
// 当前任务中断中
private static final int INTERRUPTING = 5;
// 当前任务已中断
private static final int INTERRUPTED  = 6;
```

-  任务对象： 

```java
private Callable\<V\> callable;	// Runnable 使用装饰者模式伪装成 Callable
```

-  **存储任务执行的结果**，这是 run 方法返回值是 void 也可以获取到执行结果的原因： 

```java
// 正常情况下：任务正常执行结束，outcome 保存执行结果，callable 返回值
// 非正常情况：callable 向上抛出异常，outcome 保存异常
private Object outcome;
```

-  执行当前任务的线程对象： 

```java
private volatile Thread runner;	// 当前任务被线程执行期间，保存当前执行任务的线程对象引用
```

-  **线程阻塞队列的头节点**： 

```java
// 会有很多线程去 get 当前任务的结果，这里使用了一种数据结构头插头取（类似栈）的一个队列来保存所有的 get 线程
private volatile WaitNode waiters;
```

-  内部类： 

```java
static final class WaitNode {
    // 单向链表
    volatile Thread thread;
    volatile WaitNode next;
    WaitNode() { thread = Thread.currentThread(); }
}
```

## 成员方法

FutureTask 类的成员方法：

-  **FutureTask#run**：任务执行入口 

```java
public void run() {
    //条件一：成立说明当前 task 已经被执行过了或者被 cancel 了，非 NEW 状态的任务，线程就不需要处理了
    //条件二：线程是 NEW 状态，尝试设置当前任务对象的线程是当前线程，设置失败说明其他线程抢占了该任务，直接返回
    if (state != NEW ||
        !UNSAFE.compareAndSwapObject(this, runnerOffset, null, Thread.currentThread()))
        return;
    try {
        // 执行到这里，当前 task 一定是 NEW 状态，而且【当前线程也抢占 task 成功】
        Callable\<V\> c = callable;
        // 判断任务是否为空，防止空指针异常；判断 state 状态，防止外部线程在此期间 cancel 掉当前任务
        // 【因为 task 的执行者已经设置为当前线程，所以这里是线程安全的】
        if (c != null && state == NEW) {
            V result;
            // true 表示 callable.run 代码块执行成功 未抛出异常
            // false 表示 callable.run 代码块执行失败 抛出异常
            boolean ran;
            try {
				// 【调用自定义的方法，执行结果赋值给 result】
                result = c.call();
                // 没有出现异常
                ran = true;
            } catch (Throwable ex) {
                // 出现异常，返回值置空，ran 置为 false
                result = null;
                ran = false;
                // 设置返回的异常
                setException(ex);
            }
            // 代码块执行正常
            if (ran)
                // 设置返回的结果
                set(result);
        }
    } finally {
        // 任务执行完成，取消线程的引用，help GC
        runner = null;
        int s = state;
        // 判断任务是不是被中断
        if (s >= INTERRUPTING)
            // 执行中断处理方法
            handlePossibleCancellationInterrupt(s);
    }
}
```

FutureTask#set：设置正常返回值，首先将任务状态设置为 COMPLETING 状态代表完成中，逻辑执行完设置为 NORMAL 状态代表任务正常执行完成，最后唤醒 get() 阻塞线程 

```java
protected void set(V v) {
    // CAS 方式设置当前任务状态为完成中，设置失败说明其他线程取消了该任务
    if (UNSAFE.compareAndSwapInt(this, stateOffset, NEW, COMPLETING)) {
        // 【将结果赋值给 outcome】
        outcome = v;
        // 将当前任务状态修改为 NORMAL 正常结束状态。
        UNSAFE.putOrderedInt(this, stateOffset, NORMAL);
        finishCompletion();
    }
}
```

FutureTask#setException：设置异常返回值 

```java
protected void setException(Throwable t) {
    if (UNSAFE.compareAndSwapInt(this, stateOffset, NEW, COMPLETING)) {
        // 赋值给返回结果，用来向上层抛出来的异常
        outcome = t;
        // 将当前任务的状态 修改为 EXCEPTIONAL
        UNSAFE.putOrderedInt(this, stateOffset, EXCEPTIONAL);
        finishCompletion();
    }
}
```

FutureTask#finishCompletion：**唤醒 get() 阻塞线程** 

```java
private void finishCompletion() {
    // 遍历所有的等待的节点，q 指向头节点
    for (WaitNode q; (q = waiters) != null;) {
        // 使用cas设置 waiters 为 null，防止外部线程使用cancel取消当前任务，触发finishCompletion方法重复执行
        if (UNSAFE.compareAndSwapObject(this, waitersOffset, q, null)) {
            // 自旋
            for (;;) {
                // 获取当前 WaitNode 节点封装的 thread
                Thread t = q.thread;
                // 当前线程不为 null，唤醒当前 get() 等待获取数据的线程
                if (t != null) {
                    q.thread = null;
                    LockSupport.unpark(t);
                }
                // 获取当前节点的下一个节点
                WaitNode next = q.next;
                // 当前节点是最后一个节点了
                if (next == null)
                    break;
                // 断开链表
                q.next = null; // help gc
                q = next;
            }
            break;
        }
    }
    done();
    callable = null;	// help GC
}
```

FutureTask#handlePossibleCancellationInterrupt：任务中断处理 

```java
private void handlePossibleCancellationInterrupt(int s) {
    if (s == INTERRUPTING)
        // 中断状态中
        while (state == INTERRUPTING)
            // 等待中断完成
            Thread.yield();
}
```

-  **FutureTask#get**：获取任务执行的返回值，执行 run 和 get 的不是同一个线程，一般有多个线程 get，只有一个线程 run 

```java
public V get() throws InterruptedException, ExecutionException {
    // 获取当前任务状态
    int s = state;
    // 条件成立说明任务还没执行完成
    if (s <= COMPLETING)
        // 返回 task 当前状态，可能当前线程在里面已经睡了一会
        s = awaitDone(false, 0L);
    return report(s);
}
```

FutureTask#awaitDone：**get 线程封装成 WaitNode 对象进入阻塞队列阻塞等待** 

```java
private int awaitDone(boolean timed, long nanos) throws InterruptedException {
    // 0 不带超时
    final long deadline = timed ? System.nanoTime() + nanos : 0L;
    // 引用当前线程，封装成 WaitNode 对象
    WaitNode q = null;
    // 表示当前线程 waitNode 对象，是否进入阻塞队列
    boolean queued = false;
    // 【三次自旋开始休眠】
    for (;;) {
        // 判断当前 get() 线程是否被打断，打断返回 true，清除打断标记
        if (Thread.interrupted()) {
            // 当前线程对应的等待 node 出队，
            removeWaiter(q);
            throw new InterruptedException();
        }
		// 获取任务状态
        int s = state;
        // 条件成立说明当前任务执行完成已经有结果了
        if (s > COMPLETING) {
            // 条件成立说明已经为当前线程创建了 WaitNode，置空 help GC
            if (q != null)
                q.thread = null;
            // 返回当前的状态
            return s;
        }
        // 条件成立说明当前任务接近完成状态，这里让当前线程释放一下 cpu ，等待进行下一次抢占 cpu
        else if (s == COMPLETING) 
            Thread.yield();
        // 【第一次自旋】，当前线程还未创建 WaitNode 对象，此时为当前线程创建 WaitNode对象
        else if (q == null)
            q = new WaitNode();
        // 【第二次自旋】，当前线程已经创建 WaitNode 对象了，但是node对象还未入队
        else if (!queued)
            // waiters 指向队首，让当前 WaitNode 成为新的队首，【头插法】，失败说明其他线程修改了新的队首
            queued = UNSAFE.compareAndSwapObject(this, waitersOffset, q.next = waiters, q);
        // 【第三次自旋】，会到这里，或者 else 内
        else if (timed) {
            nanos = deadline - System.nanoTime();
            if (nanos <= 0L) {
                removeWaiter(q);
                return state;
            }
            // 阻塞指定的时间
            LockSupport.parkNanos(this, nanos);
        }
        // 条件成立：说明需要阻塞
        else
            // 【当前 get 操作的线程被 park 阻塞】，除非有其它线程将唤醒或者将当前线程中断
            LockSupport.park(this);
    }
}
```

FutureTask#report：封装运行结果，可以获取 run() 方法中设置的成员变量 outcome，**这是 run 方法的返回值是 void 也可以获取到任务执行的结果的原因** 

```java
private V report(int s) throws ExecutionException {
    // 获取执行结果，是在一个 futuretask 对象中的属性，可以直接获取
    Object x = outcome;
    // 当前任务状态正常结束
    if (s == NORMAL)
        return (V)x;	// 直接返回 callable 的逻辑结果
    // 当前任务被取消或者中断
    if (s >= CANCELLED)
        throw new CancellationException();		// 抛出异常
    // 执行到这里说明自定义的 callable 中的方法有异常，使用 outcome 上层抛出异常
    throw new ExecutionException((Throwable)x);	
}
```

-  FutureTask#cancel：任务取消，打断正在执行该任务的线程 

```java
public boolean cancel(boolean mayInterruptIfRunning) {
    // 条件一：表示当前任务处于运行中或者处于线程池任务队列中
    // 条件二：表示修改状态，成功可以去执行下面逻辑，否则返回 false 表示 cancel 失败
    if (!(state == NEW &&
          UNSAFE.compareAndSwapInt(this, stateOffset, NEW,
                                   mayInterruptIfRunning ? INTERRUPTING : CANCELLED)))
        return false;
    try {
        // 如果任务已经被执行，是否允许打断
        if (mayInterruptIfRunning) {
            try {
                // 获取执行当前 FutureTask 的线程
                Thread t = runner;
                if (t != null)
                    // 打断执行的线程
                    t.interrupt();
            } finally {
                // 设置任务状态为【中断完成】
                UNSAFE.putOrderedInt(this, stateOffset, INTERRUPTED);
            }
        }
    } finally {
        // 唤醒所有 get() 阻塞的线程
        finishCompletion();
    }
    return true;
}
```
