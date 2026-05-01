---
order: 4
title: park-un
date: 2021-05-06
category: Java
tag: Java
timeline: true
article: true
---

# park-un

LockSupport 是用来创建锁和其他同步类的**线程原语**

LockSupport 类方法：

- `LockSupport.park()`：暂停当前线程，挂起原语
- `LockSupport.unpark(暂停的线程对象)`：恢复某个线程的运行

```java
public static void main(String[] args) {
    Thread t1 = new Thread(() -> {
        System.out.println("start...");	//1
		Thread.sleep(1000);// Thread.sleep(3000)
        // 先 park 再 unpark 和先 unpark 再 park 效果一样，都会直接恢复线程的运行
        System.out.println("park...");	//2
        LockSupport.park();
        System.out.println("resume...");//4
    },"t1");
    t1.start();
   	Thread.sleep(2000);
    System.out.println("unpark...");	//3
    LockSupport.unpark(t1);
}
```

LockSupport 出现就是为了增强 wait & notify 的功能：

- wait，notify 和 notifyAll 必须配合 Object Monitor 一起使用，而 park、unpark 不需要
- park & unpark **以线程为单位**来阻塞和唤醒线程，而 notify 只能随机唤醒一个等待线程，notifyAll 是唤醒所有等待线程
- park & unpark 可以先 unpark，而 wait & notify 不能先 notify。类比生产消费，先消费发现有产品就消费，没有就等待；先生产就直接产生商品，然后线程直接消费
- wait 会释放锁资源进入等待队列，**park 不会释放锁资源**，只负责阻塞当前线程，会释放 CPU

原理：类似生产者消费者

- 先 park： 

1. 当前线程调用 Unsafe.park() 方法
2. 检查 *counter ，本情况为 0，这时获得* mutex 互斥锁
3. 线程进入 _cond 条件变量挂起
4. 调用 Unsafe.unpark(Thread_0) 方法，设置 _counter 为 1
5. 唤醒 *cond 条件变量中的 Thread_0，Thread_0 恢复运行，设置* counter 为 0

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-park%E5%8E%9F%E7%90%861.png)

-  先 unpark： 

1. 调用 Unsafe.unpark(Thread_0) 方法，设置 _counter 为 1
2. 当前线程调用 Unsafe.park() 方法
3. 检查 *counter ，本情况为 1，这时线程无需挂起，继续运行，设置* counter 为 0

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-park原理2.png)
