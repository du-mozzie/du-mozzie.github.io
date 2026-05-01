---
order: 1
title: Object
date: 2021-04-02
category: Java
tag: Java
timeline: true
article: true
---

# Object

Object 是 Java 官方提供的类，存放在 java.lang 包中，该类是所有类的直接父类或者间接父类，无论是 Java 提供的类还是开发者自定义的类，都是 Object 的直接子类或间接子类，Java 中的任何一个类都会继承 Object 中的 public 和 protected 方法。

```java
hashCode();
getClass();
equals(null);
clone();
toString();
notify();
notifyAll();
wait();
wait(1000L);
wait(1000L, 100);
```

Object 类中经常被子类重写的方法：

1、public String toString() 以字符串的形式返回对象的信息

2、public boolean equals(Object obj) 判断两个对象是否相等

3、public native int hashCode() 返回对象的`散列码`

- toString

```java
Object
public String toString() {
  return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
//重写之后
@Override
public String toString() {
  return "People [id=" + id + ", name=" + name + ", score=" + score + "]";
}
```

- equals

```java
Object
public boolean equals(Object obj) {
  return (this == obj);
}
//重写之后
@Override
public boolean equals(Object obj) {
  // TODO Auto-generated method stub
  People people = (People)obj;
  if(this.id == people.id && this.name.equals(people.name) && this.score.equals(people.score)) {
    return true;
  }
  return false;
}
```

- hashCode

```java
Object
public native int hashCode();
//重写之后
@Override
public int hashCode() {
  // TODO Auto-generated method stub
  return (int) (id*name.hashCode()*score);
}
```
