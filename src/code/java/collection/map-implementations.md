---
order: 10
title: Map 接口的实现类
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# Map 接口的实现类

- HashMap：存储一组无序，key 不可以重复，value 可以重复的元素。
- Hashtable：存储一组无序，key 不可以重复，value 可以重复的元素。
- TreeMap：存储一组有序，key 不可以重复，value 可以重复的元素，可以按照 key 进行排序。

## 1、HashMap 的使用

```java
public class Test {
    public static void main(String[] args) {
        HashMap hashMap = new HashMap();
        hashMap.put("h","Hello");
        hashMap.put("w","World");
        hashMap.put("j","Java");
        hashMap.put("s","JavaSE");
        hashMap.put("m","JavaME");
        hashMap.put("e","JavaEE");
        System.out.println(hashMap);
        hashMap.remove("e");
        System.out.println("删除之后"+hashMap);
        hashMap.put("m","Model");
        System.out.println("添加之后"+hashMap);
        if (hashMap.containsKey("a")){
            System.out.println("集合中存在key=a");
        }else{
            System.out.println("集合中不存在key=a");
        }
        if(hashMap.containsValue("Java")){
            System.out.println("集合中存在value=Java");
        }else {
            System.out.println("集合中不存在value=Java");
        }
        Set keys = hashMap.keySet();
        System.out.println("集合中的key");
        Iterator iterator = keys.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
        Collection values = hashMap.values();
        for (Object value : values) {
            System.out.println(value);
        }
        System.out.println("************");
        iterator = keys.iterator();
        while(iterator.hasNext()){
            String key = (String) iterator.next();
            String value = (String) hashMap.get(key);
            System.out.println(key+"-"+value);
        }
    }
}
```

## 2、Hashtable

Hashtable 用法与 HashMap基本一样，它们的区别是，Hashtable是线程安全的，但是性能较低。HashMap 是非线程安全的，但是性能较高。

HashMap，方法没有用 synchronized 修饰，所以是非线程安全的。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202129108.png)

Hashtable，方法用 synchronized 修饰，所以是线程安全的。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202200414.png)

Hashtable 的使用

```java
public class Test {
    public static void main(String[] args) {
        Hashtable hashtable = new Hashtable();
        hashtable.put("h","Hello");
        hashtable.put("w","World");
        hashtable.put("j","Java");
        hashtable.put("s","JavaSE");
        hashtable.put("m","JavaME");
        hashtable.put("e","JavaEE");
        System.out.println(hashtable);
        hashtable.remove("e");
        System.out.println(hashtable);
        System.out.println(hashtable.containsKey("a"));
        System.out.println(hashtable.containsValue("Java"));
        Set keys = hashtable.keySet();
        System.out.println(keys);
        Collection values = hashtable.values();
        System.out.println(values);
    }
}
```

HashMap 和 Hashtable，保存的书画家都是无序的，Map 的另外一个实现类 TreeMap 主要功能是按照 key 对集合中的元素进行排序。

## 3、TreeMap

TreeMap 的使用

```java
public class Test2 {
    public static void main(String[] args) {
        TreeMap treeMap = new TreeMap();
        treeMap.put(new User(3,"Java"),"Java");
        treeMap.put(new User(5,"JavaME"),"JavaME");
        treeMap.put(new User(1,"Hello"),"Hello");
        treeMap.put(new User(6,"JavaEE"),"JavaEE");
        treeMap.put(new User(2,"World"),"World");
        treeMap.put(new User(4,"JavaSE"),"JavaSE");
        System.out.println(treeMap);
        Set set = treeMap.keySet();
        Iterator iterator = set.iterator();
        while(iterator.hasNext()){
            Object key = iterator.next();
            System.out.println(key+"-"+treeMap.get(key));
        }
    }
}

class User implements Comparable{
    private int id;
    private String name;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }

    @Override
    public int compareTo(Object o) {
        if (o instanceof User){
            User user = (User)o;
            if(this.id > user.id){
                return 1;
            }else if(this.id == user.id){
                return 0;
            }else {
                return -1;
            }
        }
        return 0;
    }
}
```
