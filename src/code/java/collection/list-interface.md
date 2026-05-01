---
order: 4
title: List 接口
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# List 接口

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114201912934.png)

List 常用的扩展方法：

| 方法                                    | 含义                                         |
| --------------------------------------- | -------------------------------------------- |
| T get(int index)                        | 通过下标返回集合中对应位置的元素             |
| T set(int index,T element)              | 在集合中的指定位置存入对象                   |
| int indexOf(Object o)                   | 从前向后查找某个对象在集合中的位置           |
| int lastIndexOf(Object o)               | 从后向前查找某个对象在集合中的位置           |
| ListIterator listIterator()             | 实例化 ListIterator 接口，用来遍历 List 集合 |
| List subList(int fromIndex,int toIndex) | 通过下标截取 List 集合                       |
