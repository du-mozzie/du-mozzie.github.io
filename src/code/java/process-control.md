---
order: 3
title: 流程控制
date: 2021-03-01
category: Java
tag: Java
timeline: true
article: true
---

# 流程控制

Java 中的流程控制主要包括条件语句（if-else、switch）、循环语句（for、while、do-while）和跳转语句（break、continue、return）。

## 1、选择流程控制

- if else

用来判断某个条件是否成立，然后执行不同的逻辑运算。

基本语法：

```java
if(判断条件){
  //条件成立的代码
}else{
  //条件不成立的代码
}
```

- 多重 if

> 173 M
>
> 173～178 L
>
> 178 XL

- if 后面必须跟条件
- else 后面不能跟条件
- else 后面可以根据{}，也可以跟 if

## 2、switch流程控制

- switch-case

与 if 不同的是，switch-case 只能完成等值判断，而无法完成判断大小。

如果是判断两个值是否相等，可以使用 switch-case，如果比较两个值的大小关系，则不能使用 switch-case。

switch 支持 int、short、byte、char、枚举、String 类型，不支持 boolean 类型。

基本语法

```java
switch(变量){
    case 值1:
        //业务代码
        break；
            case 值2:
        //业务代码
        breka;
        ...
            default:
        //业务代码
        break;
}
```

case 判断变量是否等于某个值，default 表示所有的 case 都不成立的情况下所执行的代码。

- 1 奖励 2000
- 2 奖励 1000
- 3 奖励 500
- 否则没有奖励

```java
public static void main(String[] args) {
    int placing = 1;
    if(placing == 1) {
        System.out.println("奖励2000元");
    }else {
        if(placing == 2) {
            System.out.println("奖励1000元");
        }else {
            if(placing == 3) {
                System.out.println("奖励500元");
            }else{
                System.out.println("没有奖励");
            }
        }
    }

    switch(placing) {
        case 1:
            System.out.println("奖励2000元");
            break;
        case 2:
            System.out.println("奖励1000元");
            break;
        case 3:
            System.out.println("奖励500元");
            break;
        default:
            System.out.println("没有奖励");
            break;
    }
}
```

## 3、循环

for、while、do-while、foreach
循环四要素：

- 初始化循环变量
- 循环条件
- 循环体
- 更新循环变量

```java
while
    初始化循环变量
    while(循环条件){
        循环体
            更新循环变量
    }
123456
//初始化循环变量
int num = 0;
//循环条件
while(num < 10) {
    //循环体
    System.out.println("Hello World");
    //更新循环变量
    num++;
}
int num = 0;
String flag = "y";
while(flag.equals("y")) {
    System.out.print("请输入学生学号：");
    Scanner scanner = new Scanner(System.in);
    int id = scanner.nextInt();
    switch(id) {
        case 1:
            System.out.println("张三的成绩是96");
            break;
        case 2:
            System.out.println("李四的成绩是91");
            break;
        case 3:
            System.out.println("王五的成绩是89");
            break;
        default:
            System.out.println("请输入正确的学号");
            break;
    }
    System.out.print("是否继续？y/n");
    flag = scanner.next();
}
System.out.println("感谢使用学生成绩查询系统");

do-while
    //初始化循环变量
    int num = 0;
do {
    //循环体
    System.out.println("Hello World");
    //更新循环变量
    num++;
}while(num<10);
//循环条件
Scanner scanner = new Scanner(System.in);
String result = "";
do {
    System.out.println("张三参加体能测试，跑1000米");
    System.out.print("是否合格？y/n");
    result = scanner.next();
}while(result.equals("n"));
System.out.println("合格，通过测试");

for
    for(初始化循环变量;循环条件;更新循环变量){
        循环体
    }
for(int num = 0;num < 10;num++) {
    System.out.println("Hello World");
}
```

while、do-while、for 3种循环的区别

- 相同点：都遵循循环四要素，初始化循环变量、循环条件、循环体、更新循环变量。
- 不同点：
    - while 和 do-while 适用于循环次数不确定的业务场景；for 适用于循环次数确定的场景。
    - while 和 for 都是先判断循环条件，再执行循环体；do-while 先执行循环体，再判断循环条件。

分别使用 while、do-while、for 循环输出 10 以内的所有奇数。

```java
//while循环
int num = 0;
while(num <= 10) {
    if(num%2!=0) {
        System.out.println(num);
    }
    num++;
}
//do-while循环
int num = 0;
do {
    if(num%2!=0) {
        System.out.println(num);
    }
    num++;
}while(num <= 10);

//for循环
for(int num = 0;num <= 10;num++) {
    if(num%2!=0) {
        System.out.println(num);
    }
}
```

for 循环只适用于循环次数确定的场景下(for 也可以适用于循环次数不确定的场景，只不过一般不会用这种方式进行开发)，while 和 do-while 循环次数确定或者不确定都可以使用。

```java
String result = "n";
for(;result.equals("n");) {
    System.out.println("张三参加体能测试，跑1000米");
    System.out.print("是否合格？y/n");
    result = scanner.next();
}
System.out.println("合格，通过测试");
```