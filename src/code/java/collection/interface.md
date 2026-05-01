---
order: 1
title: 接口
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# 接口

Collection：集合框架最基础的接口，最顶层的接口。

List：Collection 的子接口，存储有序、不唯一（元素可重复）的对象，最常用的接口。

Set：Collection 的子接口，存储无序、唯一（元素不可重复）的对象。

Map：独立于 Collection 的另外一个接口，最顶层的接口，存储一组键值对象，提供键到值的映射。

Iterator：输出集合元素的接口，一般适用于无序集合，从前往后输出。

ListIterator：Iterator 子接口，可以双向输出集合中的元素。

Enumeration：传统的输出接口，已经被 Iterator 取代。

SortedSet：Set 的子接口，可以对集合中的元素进行排序。

SortedMap：Map 的子接口，可以对集合中的元素进行排序。

Queue：队列接口。

Map.Entry：Map 的内部接口，描述 Map 中存储的一组键值对元素。
