---
order: 1
title: Timer
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# Timer

Timer 实现定时功能，Timer 的优点在于简单易用，但由于所有任务都是由同一个线程来调度，因此所有任务都是串行执行的，同一时间只能有一个任务在执行，前一个任务的延迟或异常都将会影响到之后的任务

```java
private static void method1() {
    Timer timer = new Timer();
    TimerTask task1 = new TimerTask() {
        @Override
        public void run() {
            System.out.println("task 1");
            //int i = 1 / 0;//任务一的出错会导致任务二无法执行
            Thread.sleep(2000);
        }
    };
    TimerTask task2 = new TimerTask() {
        @Override
        public void run() {
            System.out.println("task 2");
        }
    };
    // 使用 timer 添加两个任务，希望它们都在 1s 后执行
	// 但由于 timer 内只有一个线程来顺序执行队列中的任务，因此任务1的延时，影响了任务2的执行
    timer.schedule(task1, 1000);//17:45:56 c.ThreadPool [Timer-0] - task 1
    timer.schedule(task2, 1000);//17:45:58 c.ThreadPool [Timer-0] - task 2
}
```
