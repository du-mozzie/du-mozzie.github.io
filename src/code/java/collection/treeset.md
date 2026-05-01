---
order: 8
title: TreeSet
date: 2021-04-20
category: Java
tag: Java
timeline: true
article: true
---

# TreeSet

LinkedHashSet 和 TreeSet 都是存储一组**有序且唯一**的数据，但是这里的两个有序是有区别的。

LinkedHashSet 的有序是指元素的**存储顺序和遍历顺序**是一致的。

如：6,3,4,5,1,2–>6,3,4,5,1,2

TreeSet 的有序是指集合内部会**自动对所有的元素**按照升序进行排列，无论存入的顺序是什么，遍历的时候一定按照生序输出。

```java
public class Test {
    public static void main(String[] args) {
        TreeSet treeSet = new TreeSet();
        //        treeSet.add(1);
        //        treeSet.add(3);
        //        treeSet.add(6);
        //        treeSet.add(2);
        //        treeSet.add(5);
        //        treeSet.add(4);
        //        treeSet.add(1);
        treeSet.add("b11");
        treeSet.add("e22");
        treeSet.add("a33");
        treeSet.add("c44");
        treeSet.add("d55");
        System.out.println("treeSet的长度是"+treeSet.size());
        System.out.println("treeSet遍历");
        Iterator iterator = treeSet.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
    }
}
```

```java
public class Test {
    public static void main(String[] args) {
        TreeSet treeSet = new TreeSet();
        treeSet.add(new Data(1));
        treeSet.add(new Data(3));
        treeSet.add(new Data(6));
        treeSet.add(new Data(2));
        treeSet.add(new Data(5));
        treeSet.add(new Data(4));
        treeSet.add(new Data(1));
        System.out.println("treeSet的长度"+treeSet.size());
        System.out.println("treeSet遍历");
        Iterator iterator = treeSet.iterator();
        while(iterator.hasNext()){
            System.out.println(iterator.next());
        }
    }
}

class Data implements Comparable{
    private int num;

    public Data(int num) {
        this.num = num;
    }

    /**
     * A.compareTo(B)
     * 返回值：
     * 1 表示A大于B
     * 0 表示A等于B
     * -1 表示A小于B
     * @param o
     * @return
     */
    @Override
    public int compareTo(Object o) {
        if(o instanceof Data){
            Data data = (Data) o;
            if(this.num < data.num){
                return 1;
            }else if(this.num == data.num){
                return 0;
            }else{
                return -1;
            }
        }
        return 0;
    }

    @Override
    public String toString() {
        return "Data{" +
            "num=" + num +
            '}';
    }
}
```
