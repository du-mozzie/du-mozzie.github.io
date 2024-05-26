---
order: 7
title: 异常
date: 2021-04-16
category: Java
tag: Java
timeline: true
article: true
---

# 异常

## 1、基本概念

- 什么是异常？

Java 中的错误大致可以分为两类：

1、一类是编译时错误，一般是指语法错误。`CheckedException`

2、另一类是运行时错误。`RuntimeException`

Java 中有一组专门用来描述各种不同的运行时异常，叫做`异常类`，Java 结合异常类提供了处理错误的机制。

具体步骤是当程序出现错误时，会创建一个包含错误信息的异常类的实例化对象，并自动将该对象提交给系统，由系统转交给能够处理异常的代码进行处理。

异常可以分为两类：

**【Error 和 Exception】：**
1、Error 是指系统错误，JVM 生成，我们编写的程序无法处理。

2、Exception 指程序运行期间出现的错误，我们编写的程序可以对其进行处理。

Error 和 Exception 都是 Throwable 的子类，Throwable、Error、Exception 都是存放在 java.lang 包中。

- 异常的使用

异常的使用需要用到两个关键字 try 和 catch，并且这两个关键字需要结合起来使用，用 try 来监听可能会抛出异常的代码，一旦捕获到异常，生成异常对象并交给 catch 来处理，基本语法如下所示。

```java
try{
    //可能抛出异常的代码
}catch(Exception e){
    //处理异常
}
package com.du.exception;

public class Test {
    public static void main(String[] args) {
        try {
            int num = 10/10;
        }catch (Exception e) {
            // TODO: handle exception
            if(e.getMessage().equals("/ by zero")) {
                System.err.println("分母不能为0");
            }
        }
    }
}
```

除了 try 和 catch，还可以使用 finally 关键字来处理异常，finally 的作用？

无论程序是否抛出异常，finally 代码块中的代码一定都会执行，finally 一般跟在 catch 代码块的后面，基本语法如下所示。

```java
try{
    //可能抛出异常的代码
}catch(Exception e){
    //处理异常
}finally{
    //必须执行的代码
}
```

## 2、异常类

Java 将运行时出现的错误全部封装成类，并且不是一个类，而是一组类。同时这些类之间是有层级关系的，由树状结构一层层向下分级，处在最顶端的类是 Throwable，是所有异常类的根结点。

Throwable 有两个直接子类：

- Error
  - VirtualMachineError
    - StackOverflowError
    - OutOfMemoryError
  - AWTError
  - IOError
- Exception。
- IOException
- FileLockInterruptionException
- FileNotFoundException
- FilerException
- RuntimeException
  - ArithmeticException
  - ClassNotFoundException
  - IllegalArggumentException
  - ArrayIndexOutOfBoundsException
  - NullPointerException
  - NoSuchMethodException
  - NumberFormatException

## 3、throw 和 throws

throw 和 throws 是 Java 在处理异常时使用的两个关键字，都可以用来抛出异常，但是使用的方式和表示的含义完全不同。

Java 中抛出异常有 3 种方式：

- try-catch
- 使用 throw 是开发者主动抛出异常，即读到 throw 代码就一定抛出异常，基本语法：throw new Exception()，是一种基于代码的逻辑而主动抛出异常的方式。

```java
public class Test {
    public static void main(String[] args) {
        int[] array = {1,2,3};
        test(array,2);
    }

    public static void test(int[] array,int index) {
        if(index >= 3 || index < 0) {
            try {
                throw new Exception();
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }else {
            System.out.println(array[index]);
        }
    }
}
```

- try-catch 和 throw 都是作用于具体的逻辑代码，throws 是作用于方法的，用来描述方法可能会抛出的异常。

> 如果方法 throws 的是 RuntimeException 异常或者其子类，外部调用时可以不处理，JVM 会处理。
> 如果方法 throws 的是 Exception 异常或者其子类，外部调用时必须处理，否则报错。

```java
public class Test {
    public static void main(String[] args) throws Exception {
        test("123");
    }

    public static void test(String str) throws Exception {
        int num = Integer.parseInt(str);
    }
}
```

## 4、异常捕获

- 自动捕获 try-cath
- throw 主动抛出异常
- throws 修饰可能抛出异常的方法

## 5、自定义异常

除了使用 Java 提供的异常外，也可以根据需求来自定义异常。

```java
package com.du.exception;

public class MyNumberException extends RuntimeException {
    public MyNumberException(String error) {
        super(error);
    }
}
1234567
package com.du.exception;

public class Test {
	public static void main(String[] args){
		Test test = new Test();
		System.out.println(test.add("a"));
	}
	
	public int add(Object object){
		if(object instanceof Integer) {
			int num = (int)object;
			return ++num;
		}else {
			String error = "传入的参数不是整数类型";
			MyNumberException myNumberException = new MyNumberException(error);
			throw myNumberException;
		}
	}
}
```

面向对象的高级部分，包括 Object 类、包装类、接口和异常。其中 Object 类是所有 Java 类的父类，定义了 Java 体系的基础资料，通过继承传递给 Java 的每一个类，通过方法重写和多态让整个 Java 体系具有很强的灵活性。

包装类是 Java 为基本数据类型提供封装的一组类，通过包装类我们可以将基本数据类型转为对象，这一点在面向对象编程中很重要。

接口是抽象类的扩展，是 Java 中实现多态的重要方式，可以降低程序的耦合性，让程序变得更加灵活多变。接口就相当于零件，我们可以自由地将这些零件进行组装、整合。

异常是 Java 中处理错误的一种机制，同样是基于面向对象的思想，将错误抽象成对象然后进行处理，这里需要关注的是对异常相关的几个关键字的使用，try、catch、finally、throw、throws。