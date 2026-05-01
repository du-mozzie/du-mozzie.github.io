---
order: 2
title: Collection 接口
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# Collection 接口

Collection 是集合框架中最基础的父接口，可以存储一组无序，不唯一的对象。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201855157.png)

Collection 接口可以存储一组无序，不唯一（可重复）的对象，一般不直接使用该接口，也不能被实例化，只是用来**提供规范**。

Collection 是 Iterable 接口的子接口。

| int size()                        | 获取集合长度                           |
| --------------------------------- | -------------------------------------- |
| boolean isEmpty()                 | 判断集合是否为空                       |
| boolean contains(Object o)        | 判断集合中是否存在某个对象             |
| Iterator iterator()               | 实例化 Iterator 接口，遍历集合         |
| Object[] toArray()                | 将集合转换为一个 Object 数组           |
| T[] toArray(T[] a)                | 将集合转换为一个指定数据类型的数组     |
| boolean add(E e)                  | 向集合中添加元素                       |
| boolean remove(Object o)          | 从集合中删除元素                       |
| boolean containsAll(Collection c) | 判断集合中是否存在另一个集合的所有元素 |
| boolean addAll(Collection c)      | 向集合中添加某个集合的所有元素         |
| boolean removeAll(Collection c)   | 从集合中删除某个集合的所有元素         |
| void clear()                      | 清除集合中的所有元素                   |
| boolean equals(Collection c)      | 判断两个集合是否相等                   |
| int hashCode()                    | 返回集合的哈希值                       |
