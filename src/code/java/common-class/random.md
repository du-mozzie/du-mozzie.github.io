---
order: 5
title: Random
date: 2021-04-02
category: Java
tag: Java
timeline: true
article: true
---

# Random

用来产生随机数的类，并且可以任意指定一个区间，在此区间范围内产生一个随机数。

| 方法                         | 描述                                                 |
| ---------------------------- | ---------------------------------------------------- |
| public Random()              | 创建一个无参的随机数构造器，使用系统时间作为默认种子 |
| public Random(long seed)     | 使用 long 数据类型的种子创建一个随机数构造器         |
| public boolean nextBoolean() | 返回一个 boolean 类型的随机数                        |
| public double nextDouble()   | 返回一个 double 类型的随机数，0.0 - 1.0 之间         |
| public float nextFloat()     | 返回一个 float 类型的随机数，0.0 - 1.0 之间          |
| public int nextInt()         | 返回一个 int 类型的随机数                            |
| public int nextInt(n)        | 返回一个 int 类型的随机数，0-n之间                   |
| public long nextLong         | 返回一个 long 类型的随机数，0-1 之间                 |

```java
public class Test {
    public static void main(String[] args) {
        Random random = new Random();
        //生成订单编号（时间戳+随机数）
        for (int i = 1; i <= 10000; i++) {
            //随机生成一个六位数
            System.out.println("订单"+i+"的编号是："+System.currentTimeMillis()+random.nextInt(100000)+100000);
        }

    }
}
```
