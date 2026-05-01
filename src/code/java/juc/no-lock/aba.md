---
order: 4
title: ABA
date: 2021-05-10
category: Java
tag: Java
timeline: true
article: true
---

# ABA

ABA 问题：当进行获取主内存值时，该内存值在写入主内存时已经被修改了 N 次，但是最终又改成原来的值

其他线程先把 A 改成 B 又改回 A，主线程**仅能判断出共享变量的值与最初值 A 是否相同**，不能感知到这种从 A 改为 B 又 改回 A 的情况，这时 CAS 虽然成功，但是过程存在问题

-  构造方法： 

-  `public AtomicStampedReference(V initialRef, int initialStamp)`：初始值和初始版本号

-  常用API： 

-  `public boolean compareAndSet(V expectedReference, V newReference, int expectedStamp, int newStamp)`：**期望引用和期望版本号都一致**才进行 CAS 修改数据
-  `public void set(V newReference, int newStamp)`：设置值和版本号
-  `public V getReference()`：返回引用的值
-  `public int getStamp()`：返回当前版本号

```java
public static void main(String[] args) {
    AtomicStampedReference\<Integer\> atomicReference = new AtomicStampedReference\<\>(100,1);
    int startStamp = atomicReference.getStamp();
    new Thread(() ->{
        int stamp = atomicReference.getStamp();
        atomicReference.compareAndSet(100, 101, stamp, stamp + 1);
        stamp = atomicReference.getStamp();
        atomicReference.compareAndSet(101, 100, stamp, stamp + 1);
    },"t1").start();

    new Thread(() ->{
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        if (!atomicReference.compareAndSet(100, 200, startStamp, startStamp + 1)) {
            System.out.println(atomicReference.getReference());//100
            System.out.println(Thread.currentThread().getName() + "线程修改失败");
        }
    },"t2").start();
}
```
