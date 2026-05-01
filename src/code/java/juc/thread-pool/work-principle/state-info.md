---
order: 1
title: 状态信息
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# 状态信息

ThreadPoolExecutor 使用 int 的**高 3 位来表示线程池状态，低 29 位表示线程数量**。这些信息存储在一个原子变量 ctl 中，目的是将线程池状态与线程个数合二为一，这样就可以用一次 CAS 原子操作进行赋值

-  状态表示： 

```java
// 高3位：表示当前线程池运行状态，除去高3位之后的低位：表示当前线程池中所拥有的线程数量
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
// 表示在 ctl 中，低 COUNT_BITS 位，是用于存放当前线程数量的位
private static final int COUNT_BITS = Integer.SIZE - 3;
// 低 COUNT_BITS 位所能表达的最大数值，000 11111111111111111111 => 5亿多
private static final int CAPACITY   = (1 << COUNT_BITS) - 1;
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-%E7%BA%BF%E7%A8%8B%E6%B1%A0%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2%E5%9B%BE.png)  四种状态： 

```java
// 111 000000000000000000，转换成整数后其实就是一个【负数】
private static final int RUNNING    = -1 << COUNT_BITS;
// 000 000000000000000000
private static final int SHUTDOWN   =  0 << COUNT_BITS;
// 001 000000000000000000
private static final int STOP       =  1 << COUNT_BITS;
// 010 000000000000000000
private static final int TIDYING    =  2 << COUNT_BITS;
// 011 000000000000000000
private static final int TERMINATED =  3 << COUNT_BITS;
```

| 状态       | 高3位 | 接收新任务 | 处理阻塞任务队列 | 说明                                      |
| ---------- | ----- | ---------- | ---------------- | ----------------------------------------- |
| RUNNING    | 111   | Y          | Y                |                                           |
| SHUTDOWN   | 000   | N          | Y                | 不接收新任务，但处理阻塞队列剩余任务      |
| STOP       | 001   | N          | N                | 中断正在执行的任务，并抛弃阻塞队列任务    |
| TIDYING    | 010   | -          | -                | 任务全执行完毕，活动线程为 0 即将进入终结 |
| TERMINATED | 011   | -          | -                | 终止状态                                  |

-  获取当前线程池运行状态： 

```java
// ~CAPACITY = ~000 11111111111111111111 = 111 000000000000000000000（取反）
// c == ctl = 111 000000000000000000111
// 111 000000000000000000111
// 111 000000000000000000000
// 111 000000000000000000000	获取到了运行状态
private static int runStateOf(int c)     { return c & ~CAPACITY; }
```

-  获取当前线程池线程数量： 

```java
//        c = 111 000000000000000000111
// CAPACITY = 000 111111111111111111111
//            000 000000000000000000111 => 7
private static int workerCountOf(int c)  { return c & CAPACITY; }
```

-  重置当前线程池状态 ctl： 

```java
// rs 表示线程池状态，wc 表示当前线程池中 worker（线程）数量，相与以后就是合并后的状态
private static int ctlOf(int rs, int wc) { return rs | wc; }
```

-  比较当前线程池 ctl 所表示的状态： 

```java
// 比较当前线程池 ctl 所表示的状态，是否小于某个状态 s
// 状态对比：RUNNING < SHUTDOWN < STOP < TIDYING < TERMINATED
private static boolean runStateLessThan(int c, int s) { return c < s; }
// 比较当前线程池 ctl 所表示的状态，是否大于等于某个状态s
private static boolean runStateAtLeast(int c, int s) { return c >= s; }
// 小于 SHUTDOWN 的一定是 RUNNING，SHUTDOWN == 0
private static boolean isRunning(int c) { return c < SHUTDOWN; }
```

-  设置线程池 ctl： 

```java
// 使用 CAS 方式 让 ctl 值 +1 ，成功返回 true, 失败返回 false
private boolean compareAndIncrementWorkerCount(int expect) {
    return ctl.compareAndSet(expect, expect + 1);
}
// 使用 CAS 方式 让 ctl 值 -1 ，成功返回 true, 失败返回 false
private boolean compareAndDecrementWorkerCount(int expect) {
    return ctl.compareAndSet(expect, expect - 1);
}
// 将 ctl 值减一，do while 循环会一直重试，直到成功为止
private void decrementWorkerCount() {
    do {} while (!compareAndDecrementWorkerCount(ctl.get()));
}
```
