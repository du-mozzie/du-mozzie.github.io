---
order: 5
title: 安全分析
date: 2021-05-06
category: Java
tag: Java
timeline: true
article: true
---

# 安全分析

成员变量和静态变量：

- 如果它们没有共享，则线程安全
- 如果它们被共享了，根据它们的状态是否能够改变，分两种情况： 

- 如果只有读操作，则线程安全
- 如果有读写操作，则这段代码是临界区，需要考虑线程安全问题

局部变量：

- 局部变量是线程安全的
- 局部变量引用的对象不一定线程安全（逃逸分析）： 

- 如果该对象没有逃离方法的作用访问，它是线程安全的（每一个方法有一个栈帧）
- 如果该对象逃离方法的作用范围，需要考虑线程安全问题（暴露引用）

常见线程安全类：String、Integer、StringBuffer、Random、Vector、Hashtable、java.util.concurrent 包

-  线程安全的是指，多个线程调用它们同一个实例的某个方法时，是线程安全的 
-  **每个方法是原子的，但多个方法的组合不是原子的**，只能保证调用的方法内部安全： 

```java
Hashtable table = new Hashtable();
// 线程1，线程2
if(table.get("key") == null) {
	table.put("key", value);
}
```

无状态类线程安全，就是没有成员变量的类

不可变类线程安全：String、Integer 等都是不可变类，**内部的状态不可以改变**，所以方法是线程安全

-  replace 等方法底层是新建一个对象，复制过去 

```java
Map\<String,Object\> map = new HashMap\<\>();	// 线程不安全
String S1 = "...";							// 线程安全
final String S2 = "...";					// 线程安全
Date D1 = new Date();						// 线程不安全
final Date D2 = new Date();					// 线程不安全，final让D2引用的对象不能变，但对象的内容可以变
```

抽象方法如果有参数，被重写后行为不确定可能造成线程不安全，被称之为外星方法：`public abstract foo(Student s);`
