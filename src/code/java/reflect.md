---
order: 12
title: 反射
date: 2021-06-20
category: Java
tag: Java
timeline: true
article: true
---

## 反射

地位：Java 中最核心的模块，Java 之所以称为动态语言的关键，大部分的类库、企业级框架底层都是通过反射来实现的，非常重要。

反射顾名思义就反转执行，生活中的反射就是通过虚像映射到具体的实物，可以获取到实物的某些形态特征。

程序中的反射，通过一个实例化对象映射到类。

一句话理解反射：常规情况下是通过类来创建对象的，反射就是将这一过程进行反转，通过对象来获取类的信息。

**通过对象来获取类的信息**

类的信息我们也同样使用对象来描述，Class 类专门用来描述其他类的类，每一个 Class 的实例化对象都是对某个类的描述。

Class 是反射的源头

如何来创建 Class 的对象？

1、调用 Class 的静态方法 forName(String name)，将目标类的全限定类名（全类名，带着包名的类名）

```java
package com.du.demo2;

public class Test {
    public static void main(String[] args) throws Exception {
        User user = new User();
        Class clazz = Class.forName("com.du.demo2.User");
        System.out.println(clazz.getName());
        System.out.println(clazz.getTypeName());
        System.out.println(clazz.getSuperclass().getName());
        Class[] array = clazz.getInterfaces();
        System.out.println("****************");
        for (Class aClass : array) {
            System.out.println(aClass);
        }
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114203249294.png)

2、通过目标类的 class 创建，Java 中的每一个类都可以调用类.class，class 不是属性也不是方法，叫做“类字面量”，作用是获取内存中目标类型对象的引用（类的结构）。

```java
Class clazz2 = User.class;
System.out.println(clazz2.getName());
```

3、通过目标类的实例化对象获取，getClass()

```java
Class clazz3 = user.getClass();
System.out.println(clazz3.getName());
```
