---
order: 4
title: Math
date: 2021-04-02
category: Java
tag: Java
timeline: true
article: true
---

# Math

Math 类为开发者提供了一系列的数学方法，同时还提供了两个静态常量 E（自然对数的底数）和 PI（圆周率）。

```java
public class Test {
    public static void main(String[] args) {
        System.out.println("常量E"+Math.E);
        System.out.println("常量PI"+Math.PI);
        System.out.println("9的平方根"+Math.sqrt(9));
        System.out.println("8的立方根"+Math.cbrt(8));
        System.out.println("2的3次方"+Math.pow(2,3));
        System.out.println("较大值"+Math.max(6.5,1));
        System.out.println("-10.3的绝对值"+Math.abs(-10.3));
        System.out.println(Math.ceil(10.000001));
        System.out.println(Math.floor(10.999999));
        System.out.println((int)(Math.random()*10));
        System.out.println(Math.rint(5.4));
    }
}
```
