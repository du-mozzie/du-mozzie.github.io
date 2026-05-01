---
order: 2
title: Atomic
date: 2021-05-10
category: Java
tag: Java
timeline: true
article: true
---

# Atomic

### 常用API

常见原子类：AtomicInteger、AtomicBoolean、AtomicLong

构造方法：

- `public AtomicInteger()`：初始化一个默认值为 0 的原子型 Integer
- `public AtomicInteger(int initialValue)`：初始化一个指定值的原子型 Integer

常用API：

| 方法                                  | 作用                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| public final int get()                | 获取 AtomicInteger 的值                                      |
| public final int getAndIncrement()    | 以原子方式将当前值加 1，返回的是自增前的值                   |
| public final int incrementAndGet()    | 以原子方式将当前值加 1，返回的是自增后的值                   |
| public final int getAndSet(int value) | 以原子方式设置为 newValue 的值，返回旧值                     |
| public final int addAndGet(int data)  | 以原子方式将输入的数值与实例中的值相加并返回 实例：AtomicInteger 里的 value |

### 原理分析

**AtomicInteger 原理**：自旋锁  + CAS 算法

CAS 算法：有 3 个操作数（内存值 V， 旧的预期值 A，要修改的值 B）

- 当旧的预期值 A == 内存值 V  此时可以修改，将 V 改为 B
- 当旧的预期值 A !=  内存值 V  此时不能修改，并重新获取现在的最新值，重新获取的动作就是自旋

分析 getAndSet 方法：

-  AtomicInteger： 

```java
public final int getAndSet(int newValue) {
    /**
    * this: 		当前对象
    * valueOffset:	内存偏移量，内存地址
    */
    return unsafe.getAndSetInt(this, valueOffset, newValue);
}
```

valueOffset：偏移量表示该变量值相对于当前对象地址的偏移，Unsafe 就是根据内存偏移地址获取数据 

```java
valueOffset = unsafe.objectFieldOffset
                (AtomicInteger.class.getDeclaredField("value"));
//调用本地方法   -->
public native long objectFieldOffset(Field var1);
```

  unsafe 类： 

```java
// val1: AtomicInteger对象本身，var2: 该对象值得引用地址，var4: 需要变动的数
public final int getAndSetInt(Object var1, long var2, int var4) {
    int var5;
    do {
        // var5: 用 var1 和 var2 找到的内存中的真实值
        var5 = this.getIntVolatile(var1, var2);
    } while(!this.compareAndSwapInt(var1, var2, var5, var4));

    return var5;
}
```

var5：从主内存中拷贝到工作内存中的值（每次都要从主内存拿到最新的值到本地内存），然后执行 `compareAndSwapInt()` 再和主内存的值进行比较，假设方法返回 false，那么就一直执行 while 方法，直到期望的值和真实值一样，修改数据 

-  变量 value 用 volatile 修饰，保证了多线程之间的内存可见性，避免线程从工作缓存中获取失效的变量 

```java
private volatile int value
```

**CAS 必须借助 volatile 才能读取到共享变量的最新值来实现比较并交换的效果** 

分析 getAndUpdate 方法：

-  getAndUpdate： 

```java
public final int getAndUpdate(IntUnaryOperator updateFunction) {
    int prev, next;
    do {
        prev = get();	//当前值，cas的期望值
        next = updateFunction.applyAsInt(prev);//期望值更新到该值
    } while (!compareAndSet(prev, next));//自旋
    return prev;
}
```

函数式接口：可以自定义操作逻辑 

```java
AtomicInteger a = new AtomicInteger();
a.getAndUpdate(i -> i + 10);
```

  compareAndSet： 

```java
public final boolean compareAndSet(int expect, int update) {
    /**
    * this: 		当前对象
    * valueOffset:	内存偏移量，内存地址
    * expect:		期望的值
    * update: 		更新的值
    */
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}
```

###  原子引用

原子引用：对 Object 进行原子操作，提供一种读和写都是原子性的对象引用变量

原子引用类：AtomicReference、AtomicStampedReference、AtomicMarkableReference

AtomicReference 类：

-  构造方法：`AtomicReference\<T\> atomicReference = new AtomicReference\<T\>()` 
-  常用 API： 

-  `public final boolean compareAndSet(V expectedValue, V newValue)`：CAS 操作
-  `public final void set(V newValue)`：将值设置为 newValue
-  `public final V get()`：返回当前值

```java
public class AtomicReferenceDemo {
    public static void main(String[] args) {
        Student s1 = new Student(33, "z3");
        
        // 创建原子引用包装类
        AtomicReference\<Student\> atomicReference = new AtomicReference\<\>();
        // 设置主内存共享变量为s1
        atomicReference.set(s1);

        // 比较并交换，如果现在主物理内存的值为 z3，那么交换成 l4
        while (true) {
            Student s2 = new Student(44, "l4");
            if (atomicReference.compareAndSet(s1, s2)) {
                break;
            }
        }
        System.out.println(atomicReference.get());
    }
}

class Student {
    private int id;
    private String name;
    //。。。。
}
```

### 原子数组

原子数组类：AtomicIntegerArray、AtomicLongArray、AtomicReferenceArray

AtomicIntegerArray 类方法：

```java
/**
*   i		the index
* expect 	the expected value
* update 	the new value
*/
public final boolean compareAndSet(int i, int expect, int update) {
    return compareAndSetRaw(checkedByteOffset(i), expect, update);
}
```

### 原子更新器

原子更新器类：AtomicReferenceFieldUpdater、AtomicIntegerFieldUpdater、AtomicLongFieldUpdater

利用字段更新器，可以针对对象的某个域（Field）进行原子操作，只能配合 volatile 修饰的字段使用，否则会出现异常 `IllegalArgumentException: Must be volatile type`

常用 API：

- `static \<U\> AtomicIntegerFieldUpdater\<U\> newUpdater(Class\<U\> c, String fieldName)`：构造方法
- `abstract boolean compareAndSet(T obj, int expect, int update)`：CAS

```java
public class UpdateDemo {
    private volatile int field;
    
    public static void main(String[] args) {
        AtomicIntegerFieldUpdater fieldUpdater = AtomicIntegerFieldUpdater
            		.newUpdater(UpdateDemo.class, "field");
        UpdateDemo updateDemo = new UpdateDemo();
        fieldUpdater.compareAndSet(updateDemo, 0, 10);
        System.out.println(updateDemo.field);//10
    }
}
```

### 原子累加器

原子累加器类：LongAdder、DoubleAdder、LongAccumulator、DoubleAccumulator

LongAdder 和 LongAccumulator 区别：

相同点：

- LongAddr 与 LongAccumulator 类都是使用非阻塞算法 CAS 实现的
- LongAddr 类是 LongAccumulator 类的一个特例，只是 LongAccumulator 提供了更强大的功能，可以自定义累加规则，当accumulatorFunction 为 null 时就等价于 LongAddr

不同点：

-  调用 casBase 时，LongAccumulator 使用 function.applyAsLong(b = base, x) 来计算，LongAddr 使用 casBase(b = base, b + x) 
-  LongAccumulator 类功能更加强大，构造方法参数中 

-  accumulatorFunction 是一个双目运算器接口，可以指定累加规则，比如累加或者相乘，其根据输入的两个参数返回一个计算值，LongAdder 内置累加规则
-  identity 则是 LongAccumulator 累加器的初始值，LongAccumulator 可以为累加器提供非0的初始值，而 LongAdder 只能提供默认的 0
