---
order: 11
title: Collections 工具类
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# Collections 工具类

Collection 接口，List 和 Set的父接口。

Collections不是接口，它是一个**工具类**，专门提供了一些对集合的操作，方便开发者去使用，完成相应的业务功能。

Colletions 针对集合的工具类，Collection

Arrays 针对数组的工具类，Array

| name                                                         | 描述                                        |
| ------------------------------------------------------------ | ------------------------------------------- |
| public static sort()                                         | 对集合进行排序                              |
| public static int binarySearch(List list,Object v)           | 查找 v 在 list 中的位置，集合必须是生序排列 |
| public static get(List list,int index)                       | 返回 list 中 index 位置的值                 |
| public static void reverse(List list)                        | 对 list 进行反序输出                        |
| public static void swap(List list,int i,int j)               | 交换集合中指定位置的两个元素                |
| public static void fill(List list,Object obj)                | 将集合中所有元素替换成 obj                  |
| public static Object min(List list)                          | 返回集合中的最小值                          |
| public static Object max(List list)                          | 返回集合中的最大值                          |
| public static boolean replaceAll(List list,Object old,Object new) | 在 list 集合中用 new 替换 old               |
| public static boolean addAll(List list,Object… obj)          | 向集合中添加元素                            |

可变参数，在调用方法的时候，参数可以是任意个数，但是类型必须匹配。

```java
public static void test(int... arg){
}
```

但是下面这种写法，可以传任意类型，任意数量的参数，多态的一种具体表示形式。

```java
public static void test(Object... arg){
}
```

Java 中默认输出对象的格式：对象所属的全类名（全限定类名）带着包名的类名+@+对象的哈希值

断点 breakpoint

JavaScript js 脚本语言

Java 是必须全部编译之后，统一执行，假如有 10 行 Java 代码，必须先对这 10 行代码进行编译，通过之后，再交给 JVM 执行。

JS 逐行执行，执行一行算一行，假如有 10 行 JS 代码，一行一行开始执行，执行到第 5 行报错，那么后续 6-10 就不再执行，但是已经执行的前 5 行结果不变。

Java 更加严谨，JS 更加随意

Java 是强语言类型的，JS 是弱语言类型

```java
public class Test {
    public static void main(String[] args) {
        ArrayList list = new ArrayList();
//        list.add("Hello");
//        list.add("Java");
//        Collections.addAll(list,"Java","JavaME","World");
//        System.out.println("排序之前");
//        System.out.println(list);
        //进行排序-》升序a
//        Collections.sort(list);
//        System.out.println("排序之后");
//        System.out.println(list);
        //查找元素在集合中的下标,二分查找法（集合中的元素必须升序排列）
//        int index = Collections.binarySearch(list,"Java");
//        System.out.println("Java 在 list 中的下标"+index);
//        System.out.println(list);
//        Collections.replaceAll(list,"Java","Collections");
//        System.out.println(list);

        Collections.addAll(
                list,
                new User(1,"张三",30),
                new User(2,"李四",26),
                new User(3,"王五",18)
        );
        Collections.sort(list);
        System.out.println(list);
    }
}

class User implements Comparable{
    private Integer id;
    private String name;
    private Integer age;

    public User(Integer id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", age=" + age +
                '}';
    }

    @Override
    public int compareTo(Object o) {
        if(o instanceof User){
            User user = (User) o;
            if(this.age < user.age){
                return 1;
            }else if(this.age == user.age){
                return 0;
            }else{
                return -1;
            }
        }
        return 0;
    }
}
```
