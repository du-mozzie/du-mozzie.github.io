---
order: 2
title: 栈和队列
date: 2020-12-27
category: 数据结构
tag: 数据结构
timeline: true
article: true
---

# 栈和队列

栈和队列，也属于线性表，因为它们也都用于存储逻辑关系为 "一对一" 的数据。使用栈结构存储数据，讲究先进后出，即最先进栈的数据，最后出栈；使用队列存储数据，讲究先进先出，即最先进队列的数据，也最先出队列。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210513125707472.png)

push：插入

pop：删除

peek：查看顶部

## 栈(stack)

==栈是限定仅在表尾进行插入和删除的线性表==

允许插入和删除的一端称为栈顶，另一端称为栈底，不含任何数据元素的栈称为空栈。

后进先出LIFO

>   栈的插入操作，叫作进栈，也称压栈、入栈。
>
>   栈的删除操作，叫作出栈，有的也叫作弹栈。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210419215326952.png)

**逆波兰，使用栈结构来帮助计算机处理数学加减乘除计算问题**

​	把生活中数学中缀表示法改成后缀表示法

​	逆波兰记法中，操作符置于操作数的后面。例如表达“三加四”时，写作“3 4 + ”，而不是“3 + 4”。如果有多个操作符，操作符置于第二个操作数的后面，所以常规中缀记法的“3 - 4 + 5”在逆波兰记法中写作“3 4 - 5 + ”：先3减去4，再加上5。使用逆波兰记法的一个好处是不需要使用括号。例如中缀记法中“3 - 4 * 5”与“（3 - 4）*5”不相同，但后缀记法中前者写做“3 4 5 * - ”，无歧义地表示“3 (4 5 *) -”；后者写做“3 4 - 5 * ”。

逆波兰表达式的[解释器](https://zh.wikipedia.org/wiki/解释器)一般是基于[堆栈](https://zh.wikipedia.org/wiki/堆栈)的。解释过程一般是：操作数入栈；遇到操作符时，操作数出栈，求值，将结果入栈；当一遍后，栈顶就是表达式的值。因此逆波兰表达式的求值使用堆栈结构很容易实现，并且能很快求值。

## 队列(Queue)

==队列是只允许在一端进行插入操作、而在另一端进行删除操作的线性表==

先进先出FIFO

>   循环队列、双端队列Deque

支持两端元素插入和移除的线性集合，头尾相接的顺序存储结构，插入删除不需要申请和释放节点，扩充空间较为麻烦

>   链队列

使用链式结构存储元素，有指针，插入删除需要申请和释放节点，扩充空间较为简便