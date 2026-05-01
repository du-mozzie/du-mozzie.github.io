---
order: 9
title: Map
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# Map

key-value，数据字典

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202112687.png)

List、Set 接口都是 Collection 的子接口，Map 接口是与 Collection 完全独立的另外一个体系。

List & Set VS Map

List & Set & Collection 只能操作单个元素，Map 可以操作一对元素，因为 Map 存储结构是 key - value 映射。

Map 接口定义时使用了泛型，并且定义两个泛型 K 和 V，K 表示 key，规定键元素的数据类型，V 表示 value，规定值元素的数据类型。

| 方法                                | 描述                                        |
| ----------------------------------- | ------------------------------------------- |
| int size()                          | 获取集合长度                                |
| boolean isEmpty()                   | 判断集合是否为空                            |
| boolean containsKey(Object key)     | 判断集合中是否存在某个 key                  |
| boolean containsValue(Object value) | 判断集合中是否存在某个 value                |
| V get(Object key)                   | 取出集合中 key 对应的 value                 |
| V put(K key,V value)                | 向集合中存入一组 key-value 的元素           |
| V remove(Object key)                | 删除集合中 key 对应的 value                 |
| void putAll(Map map)                | 向集合中添加另外一个 Map                    |
| void clear()                        | 清除集合中所有的元素                        |
| Set keySet()                        | 取出集合中所有的 key，返回一个 Set          |
| Collection values()                 | 取出集合中所有的 value，返回一个 Collection |
| Set<Map.Entry<K,V>> entrySet()      | 将 Map 以 Set 的形式输出                    |
| int hashCode()                      | 获取集合的散列值                            |
| boolean equals(Object o)            | 比较两个集合是否相等                        |
