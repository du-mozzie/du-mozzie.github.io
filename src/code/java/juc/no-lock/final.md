---
order: 6
title: final
date: 2021-05-10
category: Java
tag: Java
timeline: true
article: true
---

# final

### 原理

```java
public class TestFinal {
	final int a = 20;
}
```

字节码：

```java
0: aload_0
1: invokespecial #1 // Method java/lang/Object."\<init\>":()V
4: aload_0
5: bipush 20		// 将值直接放入栈中
7: putfield #2 		// Field a:I
<-- 写屏障
10: return
```

final 变量的赋值通过 putfield 指令来完成，在这条指令之后也会加入写屏障，保证在其它线程读到它的值时不会出现为 0 的情况

其他线程访问 final 修饰的变量

- **复制一份放入栈中**直接访问，效率高
- 大于 short 最大值会将其复制到类的常量池，访问时从常量池获取

### 不可变

不可变：如果一个对象不能够修改其内部状态（属性），那么就是不可变对象

不可变对象线程安全的，不存在并发修改和可见性问题，是另一种避免竞争的方式

String 类也是不可变的，该类和类中所有属性都是 final 的

-  类用 final 修饰保证了该类中的方法不能被覆盖，防止子类无意间破坏不可变性 
-  无写入方法（set）确保外部不能对内部属性进行修改 
-  属性用 final 修饰保证了该属性是只读的，不能修改 

```java
public final class String
    implements java.io.Serializable, Comparable\<String\>, CharSequence {
    /** The value is used for character storage. */
    private final char value[];
    //....
}
```

-  更改 String 类数据时，会构造新字符串对象，生成新的 char[] value，通过**创建副本对象来避免共享的方式称之为保护性拷贝**
