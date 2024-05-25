---
order: 1
title: 时间复杂度、空间复杂度
date: 2020-12-31
category: 数据结构与算法
timeline: true
article: true
prev: ./
---

# 时间复杂度、空间复杂度

一个好的算法，满足以下两点：

- 空间复杂度S(n)——算法写成的程序在执行时占用存储单元的长度。

-  时间复杂度T(n)——算法写成的程序在执行时耗费时间的长度。

算法复杂度的渐进表示法：

- T(n)=O(f(n))表示存在常数C>0，n~0~>0使得当n≥n~0~时有T(n)≤C·f(n)

- T(n)=Ω(g(n))表示存在常熟C>0，n~0~>0使得当n≥n~0~时有T(n)≥C·g(n)

- T(n)=θ(h(n))表示同时有T(n)=O(h(n))和T(n)=Ω(h(n))

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201207110034898.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201207110228918.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201207110457415.png)

>   复杂度分析小技巧

若两段算法分别有复杂度T~1~(n)=O(f~1~(n))和T~2~(n)=O(f~2~(n))，则

   -   T~1~(n)+T~2~(n)=max(O(f~1~(n))，O(f~2~(n)))
   -   T~1~(n)×T~2~(n)=O(f~1~(n)×f~2~(n))

   若T(n)是关于n的k阶多项式，那么T(n)=θ(n^k^)

   一个==for==循环的时间复杂度等于循环次数乘以循环体代码的复杂度

​	==if-else==结构的复杂度取决于==if==的条件判断复杂度和两个分枝部分的复杂度，总体复杂度取三者中最大

**master公式：**

*T*(*n*)=*a*∗*T*(*b/n*)+*n/d*

T(n)：母问题	a：子问题被调用次数	*T*(*b/n*)：子问题的规模	n/d：剩下过程的时间复杂度

先确定abd

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220301201951903.png)