---
order: 3
title: 实现原理
date: 2021-05-10
category: Java
tag: Java
timeline: true
article: true
---

# 实现原理

### 底层结构

JDK8 以前：每个 ThreadLocal 都创建一个 Map，然后用线程作为 Map 的 key，要存储的局部变量作为 Map 的 value，达到各个线程的局部变量隔离的效果。这种结构会造成 Map 结构过大和内存泄露，因为 Thread 停止后无法通过 key 删除对应的数据

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ThreadLocal%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84JDK8%E5%89%8D.png)

JDK8 以后：每个 Thread 维护一个 ThreadLocalMap，这个 Map 的 key 是 ThreadLocal 实例本身，value 是真正要存储的值

- **每个 Thread 线程内部都有一个 Map (ThreadLocalMap)**
- Map 里面存储 ThreadLocal 对象（key）和线程的私有变量（value）
- Thread 内部的 Map 是由 ThreadLocal 维护的，由 ThreadLocal 负责向 map 获取和设置线程的变量值
- 对于不同的线程，每次获取副本值时，别的线程并不能获取到当前线程的副本值，形成副本的隔离，互不干扰

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/JUC-ThreadLocal%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84JDK8%E5%90%8E.png)

JDK8 前后对比：

- 每个 Map 存储的 Entry 数量会变少，因为之前的存储数量由 Thread 的数量决定，现在由 ThreadLocal 的数量决定，在实际编程当中，往往 ThreadLocal 的数量要少于 Thread 的数量
- 当 Thread 销毁之后，对应的 ThreadLocalMap 也会随之销毁，能减少内存的使用，**防止内存泄露**

### 成员变量

-  Thread 类的相关属性：**每一个线程持有一个 ThreadLocalMap 对象**，存放由 ThreadLocal 和数据组成的 Entry 键值对 

```java
ThreadLocal.ThreadLocalMap threadLocals = null
```

-  计算 ThreadLocal 对象的哈希值： 

```java
private final int threadLocalHashCode = nextHashCode()
```

使用 `threadLocalHashCode & (table.length - 1)` 计算当前 entry 需要存放的位置 

-  每创建一个 ThreadLocal 对象就会使用 nextHashCode 分配一个 hash 值给这个对象： 

```java
private static AtomicInteger nextHashCode = new AtomicInteger()
```

  斐波那契数也叫黄金分割数，hash 的**增量**就是这个数字，带来的好处是 hash 分布非常均匀： 

```java
private static final int HASH_INCREMENT = 0x61c88647
```

### 成员方法

方法都是线程安全的，因为 ThreadLocal 属于一个线程的，ThreadLocal 中的方法，逻辑都是获取当前线程维护的 ThreadLocalMap 对象，然后进行数据的增删改查，没有指定初始值的 threadlcoal 对象默认赋值为 null

-  initialValue()：返回该线程局部变量的初始值 

-  延迟调用的方法，在执行 get 方法时才执行
-  该方法缺省（默认）实现直接返回一个 null
-  如果想要一个初始值，可以重写此方法， 该方法是一个 `protected` 的方法，为了让子类覆盖而设计的

```java
protected T initialValue() {
    return null;
}
```

-  nextHashCode()：计算哈希值，ThreadLocal 的散列方式称之为**斐波那契散列**，每次获取哈希值都会加上 HASH_INCREMENT，这样做可以尽量避免 hash 冲突，让哈希值能均匀的分布在 2 的 n 次方的数组中 

```java
private static int nextHashCode() {
    // 哈希值自增一个 HASH_INCREMENT 数值
    return nextHashCode.getAndAdd(HASH_INCREMENT);
}
```

-  set()：修改当前线程与当前 threadlocal 对象相关联的线程局部变量 

```java
public void set(T value) {
    // 获取当前线程对象
    Thread t = Thread.currentThread();
    // 获取此线程对象中维护的 ThreadLocalMap 对象
    ThreadLocalMap map = getMap(t);
    // 判断 map 是否存在
    if (map != null)
        // 调用 threadLocalMap.set 方法进行重写或者添加
        map.set(this, value);
    else
        // map 为空，调用 createMap 进行 ThreadLocalMap 对象的初始化。参数1是当前线程，参数2是局部变量
        createMap(t, value);
}
// 获取当前线程 Thread 对应维护的 ThreadLocalMap 
ThreadLocalMap getMap(Thread t) {
    return t.threadLocals;
}
// 创建当前线程Thread对应维护的ThreadLocalMap 
void createMap(Thread t, T firstValue) {
    // 【这里的 this 是调用此方法的 threadLocal】，创建一个新的 Map 并设置第一个数据
    t.threadLocals = new ThreadLocalMap(this, firstValue);
}
```

-  get()：获取当前线程与当前 ThreadLocal 对象相关联的线程局部变量 

```java
public T get() {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    // 如果此map存在
    if (map != null) {
        // 以当前的 ThreadLocal 为 key，调用 getEntry 获取对应的存储实体 e
        ThreadLocalMap.Entry e = map.getEntry(this);
        // 对 e 进行判空 
        if (e != null) {
            // 获取存储实体 e 对应的 value值
            T result = (T)e.value;
            return result;
        }
    }
    /*有两种情况有执行当前代码
      第一种情况: map 不存在，表示此线程没有维护的 ThreadLocalMap 对象
      第二种情况: map 存在, 但是【没有与当前 ThreadLocal 关联的 entry】，就会设置为默认值 */
    // 初始化当前线程与当前 threadLocal 对象相关联的 value
    return setInitialValue();
}
private T setInitialValue() {
    // 调用initialValue获取初始化的值，此方法可以被子类重写, 如果不重写默认返回 null
    T value = initialValue();
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    // 判断 map 是否初始化过
    if (map != null)
        // 存在则调用 map.set 设置此实体 entry，value 是默认的值
        map.set(this, value);
    else
        // 调用 createMap 进行 ThreadLocalMap 对象的初始化中
        createMap(t, value);
    // 返回线程与当前 threadLocal 关联的局部变量
    return value;
}
```

-  remove()：移除当前线程与当前 threadLocal 对象相关联的线程局部变量 

```java
public void remove() {
    // 获取当前线程对象中维护的 ThreadLocalMap 对象
    ThreadLocalMap m = getMap(Thread.currentThread());
    if (m != null)
        // map 存在则调用 map.remove，this时当前ThreadLocal，以this为key删除对应的实体
        m.remove(this);
}
```
