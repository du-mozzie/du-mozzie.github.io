---
order: 3
title: 链表队列
date: 2021-05-13
category: Java
tag: Java
timeline: true
article: true
---

# 链表队列

### 入队出队

LinkedBlockingQueue 源码：

```java
public class LinkedBlockingQueue\<E\> extends AbstractQueue\<E\>
			implements BlockingQueue\<E\>, java.io.Serializable {
	static class Node\<E\> {
        E item;
        /**
        * 下列三种情况之一
        * - 真正的后继节点
        * - 自己, 发生在出队时
        * - null, 表示是没有后继节点, 是尾节点了
        */
        Node\<E\> next;

        Node(E x) { item = x; }
    }
}
```

入队：**尾插法**

-  初始化链表 `last = head = new Node\<E\>(null)`，**Dummy 节点用来占位**，item 为 null 

```java
public LinkedBlockingQueue(int capacity) {
    // 默认是 Integer.MAX_VALUE
    if (capacity <= 0) throw new IllegalArgumentException();
    this.capacity = capacity;
    last = head = new Node\<E\>(null);
}
```

  当一个节点入队： 

```java
private void enqueue(Node\<E\> node) {
    // 从右向左计算
    last = last.next = node;
}
```

![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-LinkedBlockingQueue入队流程.png)

-  再来一个节点入队 `last = last.next = node` 

出队：**出队头节点**，FIFO

-  出队源码： 

```java
private E dequeue() {
    Node\<E\> h = head;
    // 获取临头节点
    Node\<E\> first = h.next;
    // 自己指向自己，help GC
    h.next = h;
    head = first;
    // 出队的元素
    E x = first.item;
    // 【当前节点置为 Dummy 节点】
    first.item = null;
    return x;
}
```

-  `h = head` → `first = h.next`
   ![](https://seazean.oss-cn-beijing.aliyuncs.com/img/Java/JUC-LinkedBlockingQueue出队流程1.png) 
-  `h.next = h` → `head = first`
   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-LinkedBlockingQueue%E5%87%BA%E9%98%9F%E6%B5%81%E7%A8%8B2.png) 

-  `first.item = null`：当前节点置为 Dummy 节点

### 加锁分析

用了两把锁和 dummy 节点：

- 用一把锁，同一时刻，最多只允许有一个线程（生产者或消费者，二选一）执行
- 用两把锁，同一时刻，可以允许两个线程同时（一个生产者与一个消费者）执行 

- 消费者与消费者线程仍然串行
- 生产者与生产者线程仍然串行

线程安全分析：

-  当节点总数大于 2 时（包括 dummy 节点），**putLock 保证的是 last 节点的线程安全，takeLock 保证的是 head 节点的线程安全**，两把锁保证了入队和出队没有竞争 
-  当节点总数等于 2 时（即一个 dummy 节点，一个正常节点）这时候，仍然是两把锁锁两个对象，不会竞争 
-  当节点总数等于 1 时（就一个 dummy 节点）这时 take 线程会被 notEmpty 条件阻塞，有竞争，会阻塞 

```java
// 用于 put(阻塞) offer(非阻塞)
private final ReentrantLock putLock = new ReentrantLock();
private final Condition notFull = putLock.newCondition();	// 阻塞等待不满，说明已经满了

// 用于 take(阻塞) poll(非阻塞)
private final ReentrantLock takeLock = new ReentrantLock();
private final Condition notEmpty = takeLock.newCondition();	// 阻塞等待不空，说明已经是空的
```

 入队出队：

-  put 操作： 

```java
public void put(E e) throws InterruptedException {
    // 空指针异常
    if (e == null) throw new NullPointerException();
    int c = -1;
    // 把待添加的元素封装为 node 节点
    Node\<E\> node = new Node\<E\>(e);
    // 获取全局生产锁
    final ReentrantLock putLock = this.putLock;
    // count 用来维护元素计数
    final AtomicInteger count = this.count;
    // 获取可打断锁，会抛出异常
    putLock.lockInterruptibly();
    try {
    	// 队列满了等待
        while (count.get() == capacity) {
            // 【等待队列不满时，就可以生产数据】，线程处于 Waiting
            notFull.await();
        }
        // 有空位, 入队且计数加一，尾插法
        enqueue(node);
        // 返回自增前的数字
        c = count.getAndIncrement();
        // put 完队列还有空位, 唤醒其他生产 put 线程，唤醒一个减少竞争
        if (c + 1 < capacity)
            notFull.signal();
    } finally {
        // 解锁
        putLock.unlock();
    }
    // c自增前是0，说明生产了一个元素，唤醒一个 take 线程
    if (c == 0)
        signalNotEmpty();
}
private void signalNotEmpty() {
    final ReentrantLock takeLock = this.takeLock;
    takeLock.lock();
    try {
        // 调用 notEmpty.signal()，而不是 notEmpty.signalAll() 是为了减少竞争，因为只剩下一个元素
        notEmpty.signal();
    } finally {
        takeLock.unlock();
    }
}
```

-  take 操作： 

```java
public E take() throws InterruptedException {
    E x;
    int c = -1;
    // 元素个数
    final AtomicInteger count = this.count;
    // 获取全局消费锁
    final ReentrantLock takeLock = this.takeLock;
    // 可打断锁
    takeLock.lockInterruptibly();
    try {
        // 没有元素可以出队
        while (count.get() == 0) {
            // 【阻塞等待队列不空，就可以消费数据】，线程处于 Waiting
            notEmpty.await();
        }
        // 出队，计数减一，FIFO，出队头节点
        x = dequeue();
        // 返回自减前的数字
        c = count.getAndDecrement();
        // 队列还有元素
        if (c > 1)
            // 唤醒一个消费take线程
            notEmpty.signal();
    } finally {
        takeLock.unlock();
    }
    // c 是消费前的数据，消费前满了，消费一个后还剩一个空位，唤醒生产线程
    if (c == capacity)
        // 调用的是 notFull.signal() 而不是 notFull.signalAll() 是为了减少竞争
        signalNotFull();
    return x;
}
```

### 性能比较

主要列举 LinkedBlockingQueue 与 ArrayBlockingQueue 的性能比较：

- Linked 支持有界，Array 强制有界
- Linked 实现是链表，Array 实现是数组
- Linked 是懒惰的，而 Array 需要提前初始化 Node 数组
- Linked 每次入队会生成新 Node，而 Array 的 Node 是提前创建好的
- Linked 两把锁，Array 一把锁
