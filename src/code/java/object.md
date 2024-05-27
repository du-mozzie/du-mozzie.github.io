---
order: 5
title: 面向对象
date: 2021-03-10
category: Java
tag: Java
timeline: true
article: true
---

# 面向对象程序

Java 是一种面向对象编程（OOP）语言，其核心思想是通过对象和类来组织程序代码。面向对象编程具有四个主要特性：封装、继承、多态和抽象。

## 1、面向对象

面向对象编程思想：将程序模块化的思想。

- 什么是面向对象？

面向对象编程思想诞生之前，程序开发采用的是面向过程的结构化编程方式，是一种面向功能划分的软件结构。

最小粒度细化到方法这一层。

面向过程注重的是每一个步骤，面向对象关注点在于整件事情的模块化结构。

- 类和对象

类和对象的关系

每个对象都有特定的特征：1、属性。2、方法。

属性指的是对象的静态特征，方法用来描述对象的动态特征。

对象是用来描述客观存在的一个实体，改实体是由一组属性和方法构成。

类是与对象紧密结合的另外一个概念，类是产生对象的模版，所有的对象都是通过类来创建的。

二者的关系：类是对象的抽象化描述，这些对象具有相同的特征和动作（属性和方法）。

​						对象是类的具体实例。

Java 程序是以类位组织单元，程序运行时的主体是通过类创建的具体对象。

**三大特征：封装、继承、多态**

## 2、定义类

```java
public class 类名{
    //定义属性，属性名符合驼峰式命名法
    public 数据类型 属性名;
    //定义方法，方法名符合驼峰式命名法
    public 返回值类型 方法名(参数列表:数据类型 参数名){
        //方法体
    }
}
```

Java 关于返回值的定义分为两类：有返回值和无返回值，有返回值的方法需要在方法定义时指定返回值的数据类型，并在方法体中用return 将结果返回给外部调用者，加法运算。

如果一个方法不需要进行返回操作，将返回值类型定义为 void。

参数列表是指外部在调用该方法时需要传入到方法内部进行运算的数据。

## 3、构造函数、构造方法、构造器

构造函数是一种特殊的方法，普通方法是用来描述某个动作的，构造方法是用来创建对象的。

- 方法名必须与类名一致。
- 不需要定义返回值类型。

构造函数可分为有参构造和无参构造，有参构造是指带参数的构造函数，无参构造是指没有参数的构造函数。

任何一个类都默认自带一个无参构造函数，如果手动在类中定义一个有参构造，则会覆盖默认的无参构造。

## 4、this 关键字

this 用来指代当前类的实例化对象，通过 this 可以调用当前类的属性和方法，比如在有参构造中，通过 this 将外部传入的值赋给当前类的实例化对象。

this 除了可以在类中访问属性也可以在类中调用方法，类中的方法可以分为两类：构造方法、普通方法，用 this 调用这两类方法的语法也不同。

1、调用构造函数的语法是 this(参数列表)，不能在普通方法中使用 this 调用构造函数。

2、用 this 调用普通方法，this.方法名(参数列表)，可以在构造函数中使用，也可以在普通方法中使用。

## 5、成员变量和局部变量

变量的作用域是指在程序中可以通过变量名来访问该变量的范围，变量的作用域由变量被声明时所在位置决定的，Java 中根据不同的作用域可以将变量分为成员变量和局部变量。

局部变量：如果一个变量**在方法中声明**，则该变量是局部变量。

成员变量：如果一个变量**在方法外，类中声明**，则该变量是成员变量。

```java
public class HelloWorld{
    int num2 = 2;
    public int test(){
        int num1 = 1;
    }
}
```

1、成员变量和局部变量的区别在于作用域不同，成员变量的作用域在整个类中，类中的每个方法都可以访问该变量，局部变量的作用域只在定义该变量的方法中，出了方法体就无法访问。

2、成员变量和局部变量的初始值也不同，局部变量不会赋初始值，成员变量会赋初始值，具体的值是由成员变量的数据类型决定的。

## 6、封装

封装是指将类的属性隐藏在内部，外部不能直接访问和修改，如何实现？通过修改成员变量的可见性，从公有改为私有。

```java
public class Student {
    private int id;
    private String name;
    private int age;
    public void show() {
        System.out.println("学生信息如下：");
        System.out.println("学生编号："+id);
        System.out.println("学生姓名："+name);
        System.out.println("学生年龄："+age);
    }
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
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        if(age <= 0) {
            System.out.println("输入的数值有误！");
            age = 18;
        }
        this.age = age;
    }
}
```

封装的核心思想就是尽可能把**属性都隐藏在内部**，对外提供方法来访问，我们可以在这些方法中添加逻辑处理来实现过滤，以屏蔽错误数据的赋值。

封装的步骤：

- 修改属性（成员变量）的访问权限为私有，使得外部不能直接访问。
- 提供外部可以直接调用的方法。
- 在该方法中加入对于属性的逻辑控制，避免出现逻辑上的错误。

> 什么是访问权限？

访问权限是指该属性可以被直接访问的范围，是在属性定义时设定的，访问权限的可选项一共有 4 种：区别在于作用域范围不同。

| 同一个类      | 同一个包 | 不同包的子类 | 不同包的非子类 |      |
| ------------- | -------- | ------------ | -------------- | ---- |
| public        | √        | √            | √              | √    |
| protected     | √        | √            | √              |      |
| 默认(default) | √        | √            |                |      |
| private       | √        |              |                |      |

## 7、static

static 表示静态或者全局，可以用来修饰成员变量和成员方法以及代码块。

使用 static 修饰的成员变量和成员方法**独立于该类的任何一个实例化对象**，访问时不依赖于该类的对象，而是直接通过类去访问，可以理解为被该类的所有实例对象所共用，所以说是**全局的**。

static 还可以修饰代码块，被 static 修饰的代码块叫做静态代码块。

```java
static {
    System.out.println(1);
}
```

静态代码块的特点是只执行一次，什么时候执行？当这个类被加载到内存时执行，不需要开发者手动调用，会自动执行。

被加载到内存中的类叫做运行时类，静态代码块就是在家中类的时候执行的，因为类只加载一次，所以静态代码块也只执行一次。

## 8、继承

- 什么是继承？

继承是用来描述类之间的关系的，即一个类继承（拥有）另外一个类中的属性和方法，被继承的类叫做父类，继承父类的类叫做子类。

继承的基本语法：

```java
public class 类名 extends 父类名{

}
public class People {
    private int id;
    private String name;
    private int age;
    private char gender;
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
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public char getGender() {
        return gender;
    }
    public void setGender(char gender) {
        this.gender = gender;
    }
}
public class Student extends People {

}
```

Java 中的继承是单继承，也就是说一个子类只能有一个直接父类。

#### 8.1、子类访问父类

**创建一个子类对象的时候，会默认先创建一个父类对象，无论是通过有参构造或是无参构造来创建子类对象，都是通过【无参构造来创建父类对象的】。**

可以通过 super 关键字让子类创建对象时调用父类的有参构造。

```java
public Student() {
    super(1);
    System.out.println("通过无参构造创建了Student对象");
}
1234
```

子类可以访问父类的构造方法、普通方法、成员变量，都是通过 super 关键字来完成，具体语法：

构造方法：super(参数列表)

普通方法：super.方法名(参数列表)

成员变量：super.成员变量名

在子类的构造方法中，可以通过 super 访问父类的构造方法和普通方法。

在子类的普通方法中，只能通过 super 访问父类的普通方法。

#### 8.2、子类的访问权限

访问权限修饰符：public、protected、默认修饰符、private。

| 属性       | 同一个类中 | 同包     | 子类（不同包） | 不同包   |
| ---------- | ---------- | -------- | -------------- | -------- |
| public     | 可以访问   | 可以访问 | 可以访问       | 可以访问 |
| protected  | 可以访问   | 可以访问 | 可以访问       | 不能访问 |
| 默认修饰符 | 可以访问   | 可以访问 | 不能访问       | 不能访问 |
| private    | 可以访问   | 不能访问 | 不能访问       | 不能访问 |

包：package，用来管理 Java 文件，一个项目中不可避免会出现同名的 Java 类，为了防止产生冲突，可以把同名的 Java 类分别放入不同的包中。

包的命名规范：包名由小写字母组成，不能以 . 开头或结尾，可以包含数字，但不能以数字开头，使用 . 来分层。

包的命名方式一般采用网络域名的反向输出，如 com.company.test/com.company.entity。

## 9、方法重写

子类在继承父类方法的基础上，对父类方法重新定义并覆盖的操作叫做方法重写。

**构造方法不能被重新**，方法重写的规则：

1、父子类的方法名相同。

2、父子类的方法参数列表相同。

3、子类方法的返回值与父类方法返回值**类型相同或者是其子类**。

4、子类方法的**访问权限不能小于父类**。

## 10、方法重写 VS 方法重载

位置：方法重写在子类中对父类方法进行重写，方法重载是在同一个类中。

方法名：方法重写相同，方法重载相同。

参数列表：方法重写相同，方法重载不同。

返回值：方法重写相同或是其子类，方法重载没有要求。

访问权限：方法重写不能小于父类，方法重载没有要求。

## 11、多态

一个事物具有多种表现形态，在 Java 程序中，定义一个方法，在具体的生成环境中根据不同的需求呈现不同的业务逻辑，多态的前提是继承。

```java
public class Memeber {
    public void buyBook() {

    }
}

//子类一
public class OrdinaryMember extends Memeber {
    public void buyBook() {
        System.out.println("普通会员买书打9折");
    }
}

//子类二 
public class SuperMember extends Memeber {
    public void buyBook() {
        System.out.println("超级会员买书打6折");
    }
}


public class Cashier {
    private Memeber memeber;

    public Memeber getMemeber() {
        return memeber;
    }

    public void setMemeber(Memeber memeber) {
        this.memeber = memeber;
    }

    public void settlement() {
        this.memeber.buyBook();
    }
}


public class Test {
    public static void main(String[] args) {
        OrdinaryMember ordinaryMember = new OrdinaryMember();
        SuperMember superMember = new SuperMember();
        Cashier cashier = new Cashier();
        cashier.setMemeber(superMember);
        cashier.settlement(ordinaryMember);
    }
}
```

多态的具体使用有两种形式：

1、定义方法时**形参类型为父类**，实际调用方法时传入**子类类型的参数**。

2、定义方法时**返回值类型为父类**，实际调用方法时**返回子类对象**。

以上两种形式的基本原理都是**父类引用可以指向子类对象**。

## 11、抽象方法和抽象类

如果一个方法只有方法的声明而没有具体的方法实现，这个方法就叫做抽象方法，Java 中的抽象方法需要使用 abstract 关键字来修饰。

```java
public abstract void buyBook();
```

一旦类中定义了抽象方法，则该类也必须声明为抽象类，需要在类定义处添加 abstract 关键字。

```java
public abstract class Member {
    public abstract void buyBook();
}
```

抽象类与普通类的区别是抽象类不能被实例化，抽象方法与普通方法的区别是抽象方法没有方法体。

抽象类中可以没有抽象方法，但是包含了抽象方法的类必须定义为抽象类。即我们可以在抽象类中定义普通方法，但是在普通类中不能定义抽象方法。

如果父类是抽象类，一旦子类继承了该抽象父类，则子类必须对父类的抽象方法进行重写，否则程序报错。

```java
public abstract class Member {
    public abstract void buyBook();
}
package com.du.test;
public class SuperMember extends Member {
    @Override
    public void buyBook() {
        // TODO Auto-generated method stub
        System.out.println("超级会员买书打6折");
    }
}
```

如果子类也是抽象类，则可以不用重写父类的抽象方法。

## 12、接口

- 什么是接口？

接口是由抽象类衍生出来的一个概念，并由此产生了一种编程方式：面向接口编程。

面向接口编程就是将程序中的业务模块进行分离，以接口的形式去对接不同的业务模块。

面向接口编程的优点：当用户需求变更时，只需要切换不同的实现类，而不需要修改串联模块的接口，减少对系统的影响。

1、能够最大限度实现解耦合，降低程序的耦合性。

2、使程序易于扩展。

3、有利于程序的后期维护。

- 如何使用接口

接口在 Java 中时独立存在的一种结构，和类相似，我们需要创建一个接口文件，Java 中用 class 关键字来标识类，用 interface 来标识接口，基本语法：

```java
public interface 接口名{
    public 返回值 方法名(参数列表)
}
```

**接口其实就是一个抽象类，极度抽象的抽象类。**

抽象类：一个类中一旦存在没有具体实现的抽象方法时，那么该类就必须定义为抽象类，同时抽象类允许存在非抽象方法。

但是接口完全不同，接口中不能存在非抽象方法，接口中必须全部是抽象方法。

因为接口中必须全部都是抽象方法，所以修饰抽象方法的关键字 abstract 可以省略。

接口中允许定义成员变量，但是有如下要求：

1、不能定义 private 和 protected 修饰的成员变量，只能定义**public和默认访问**权限修饰符修饰的成员变量。

2、接口中的成员变量在定义时就必须完成初始化。

3、接口中的成员变量都是静态常量，即可以直接通过接口访问，同时值不能被修改。

```java
package com.du.test;

public interface MyInterface {
    public int ID = 0;
    String NAME = "张三";
    public void test();
}
```

使用接口时，不能直接实例化接口对象，而必须实例化其实现类对象，实现类本身就是一个普通的 Java 类，创建实现类的代码如下所示。

```java
package com.du.test;

public class MyInterfaceImpl implements MyInterface {

    @Override
    public void test() {
        // TODO Auto-generated method stub

    }
}
```

通过 implements 关键字来指定实现类具体要实现的接口，在实现类的内部需要对接口的所有抽象方法进行实现，同时要求**访问权限修饰符、返回值类型、方法名和参数列表**必须完全一致。

接口和继承，Java 只支持单继承，但是接口可以多实现（一个实现类可以同时实现多个接口）

```java
//接口一
public interface MyInterface {
    public int ID = 0;
    String NAME = "张三";
    public void fly();
}
//接口二
public interface MyInterface2 {
    public void run();
}
//继承两个接口
public class MyInterfaceImpl implements MyInterface,MyInterface2 {
    @Override
    public void run() {
        // TODO Auto-generated method stub
        System.out.println("实现了跑步的方法");
    }
    @Override
    public void fly() {
        // TODO Auto-generated method stub
        System.out.println("实现了飞行的方法");
    }
}
//测试
public class Test {
    public static void main(String[] args) {
        MyInterfaceImpl myInterfaceImpl = new MyInterfaceImpl();
        myInterfaceImpl.fly();
        myInterfaceImpl.run();
    }
}
```

## 13、枚举

枚举 Enum，是一种有确定值区间的数据类型，本质上就是一个类，具有简洁、安全、方便等特点。

枚举的值被约束到了一个特定的范围内，只能从这个范围以内取值。

为什么要有枚举？

因为在描述某些对象的属性时，该属性的值不能随便定义，必须在某个特定的区间内取值。

出于对数据的安全性考虑，类似这种有特定取值范围的数据我们就可以使用枚举来描述。

枚举指由一组常量组成的类型，指定一个取值区间，我们只能从该区间中取值。

```java
final class Week extends Enum{
    public static final Week MONDAY;
    public static final Week TUESDAY;
    public static final Week WEDNSDAY;
    public static final Week THURSDAY;
    public static final Week FRIDAY;
    public static final Week SATURDAY;
    public static final Week SUNDAY;
    private static final Week $VALUES[];

    static{
        MONDAY = new Week("MONDAY",0);
        TUESDAY = new Week("TUESDAY",1);
        WEDNSDAY = new Week("WEDNSDAY",2);
        THURSDAY = new Week("THURSDAY",3);
        FRIDAY = new Week("FRIDAY",4);
        SATURDAY = new Week("SATURDAY",5);
        SUNDAY = new Week("SUNDAY",6);
        $VALUES[] = (new Week[]{
            MONDAY,TUESDAY,WEDNSDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY
        })
    }

    public static Week[] values(){
        return $VALUES.clone();
    }

    public static Week valueOf(String s){
        return Enum.valueOf(s);
    }

    private Week(String s,int i){
        super(s,i);
    }

}
```

## 14、内部类

1. 成员内部类。
2. 局部内部类。
3. 匿名内部类
4. 静态内部类