---
order: 13
title: 注解
date: 2021-06-25
category: Java
tag: Java
timeline: true
article: true
---

# 注解

Java注解（Annotation）是Java中的一种元数据机制，用于向代码中添加额外的信息。这些注解可以在编译时、类加载时、甚至在运行时被处理和利用，从而实现多种功能，例如代码生成、编译时检查、配置等。

**@开头的**

注解可以检查跟约束

@Override重写

## 内置注解

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201021172409599.png)

## 元注解

```java
package com.du.annotation;

import java.lang.annotation.*;


public class Test {

    @MyAnnotation
    public void test(){

    }
}

//定义一个注解
//target    表示我们的注解可以用在哪
@Target(value = {ElementType.METHOD,ElementType.TYPE})

//retention 表示注解在什么地方有效
//RUNTIME>CLASS>SOURCE
@Retention(value = RetentionPolicy.RUNTIME)

//document  表示是否将我们的注解生成在JAVAdoc中
@Documented

//inherited 表示子类可以继承父类的注解
@Inherited
@interface MyAnnotation{

}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201021173008986.png)

## 自定义注解

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201021174814402.png)

## 反射

>   在计算机学中，反射（英语：reflection）是指计算机程序在运行时（runtime）可以访问、检测和修改它本身状态或行为的一种能力。用比喻来说，反射就是程序在运行的时候能够“观察”并且修改自己的行为。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210601233759277.png)

-   Field 类：提供有关类的属性信息，以及对它的动态访问权限。它是一个封装反射类的属性的类。
-   Constructor 类：提供有关类的构造方法的信息，以及对它的动态访问权限。它是一个封装反射类的构造方法的类。
-   Method 类：提供关于类的方法的信息，包括抽象方法。它是用来封装反射类方法的一个类。
-   Class 类：表示正在运行的 Java 应用程序中的类的实例。
-   Object 类：Object 是所有 Java 类的父类。所有对象都默认实现了 Object 类的方法。

接下来，我们通过一个典型的例子来学习反射。先做准备工作，新建 com.test.reflection 包，在此包中新建一个 Student 类：

```java
package com.test.reflection;

public class Student {

    private String studentName;
    public int studentAge;

    public Student() {
    }

    private Student(String studentName) {
        this.studentName = studentName;
    }

    public void setStudentAge(int studentAge) {
        this.studentAge = studentAge;
    }

    private String show(String message) {
        System.out.println("show: " + studentName + "," + studentAge + "," + message);
        return "testReturnValue";
    }
}
```

可以看到，Student 类中有两个**字段**、两个**构造方法**、两个**函数**，且都是一个私有，一个公有。由此可知，这个测试类基本涵盖了我们平时常用的所有类成员。



### **3.1 获取 Class 对象的三种方式**

获取 Class 对象有三种方式：

```java
// 1.通过字符串获取Class对象，这个字符串必须带上完整路径名
Class studentClass = Class.forName("com.test.reflection.Student");
// 2.通过类的class属性
Class studentClass2 = Student.class;
// 3.通过对象的getClass()函数
Student studentObject = new Student();
Class studentClass3 = studentObject.getClass();
```

-   第一种方法是通过类的全路径字符串获取 Class 对象，这也是我们平时最常用的反射获取 Class 对象的方法；
-   第二种方法有限制条件：需要导入类的包；
-   第三种方法已经有了 Student 对象，不再需要反射。

通过这三种方式获取到的 Class 对象是同一个，也就是说 Java 运行时，每一个类只会生成一个 Class 对象。

我们将其打印出来测试一下：

```java
System.out.println("class1 = " + studentClass + "\n" +
        "class2 = " + studentClass2 + "\n" +
        "class3 = " + studentClass3 + "\n" +
        "class1 == class2 ? " + (studentClass == studentClass2) + "\n" +
        "class2 == class3 ? " + (studentClass2 == studentClass3));
```

运行程序，输出如下：

```text
class1 = class com.test.reflection.Student
class2 = class com.test.reflection.Student
class3 = class com.test.reflection.Student
class1 == class2 ? true
class2 == class3 ? true
```

OK，拿到 Class 对象之后，我们就可以为所欲为啦！



### **3.2 获取成员变量**

获取字段有两个 API：`getDeclaredFields`和`getFields`。他们的区别是:`getDeclaredFields`用于获取所有声明的字段，包括公有字段和私有字段，`getFields`仅用来获取公有字段：

```java
// 1.获取所有声明的字段
Field[] declaredFieldList = studentClass.getDeclaredFields();
for (Field declaredField : declaredFieldList) {
    System.out.println("declared Field: " + declaredField);
}
// 2.获取所有公有的字段
Field[] fieldList = studentClass.getFields();
for (Field field : fieldList) {
    System.out.println("field: " + field);
}
```

运行程序，输出如下：

```text
declared Field: private java.lang.String com.test.reflection.Student.studentName
declared Field: public int com.test.reflection.Student.studentAge
field: public int com.test.reflection.Student.studentAge
```

### **3.3 获取构造方法**

获取构造方法同样包含了两个 API：用于获取所有构造方法的 `getDeclaredConstructors`和用于获取公有构造方法的`getConstructors`:

```java
// 1.获取所有声明的构造方法
Constructor[] declaredConstructorList = studentClass.getDeclaredConstructors();
for (Constructor declaredConstructor : declaredConstructorList) {
    System.out.println("declared Constructor: " + declaredConstructor);
}
// 2.获取所有公有的构造方法
Constructor[] constructorList = studentClass.getConstructors();
for (Constructor constructor : constructorList) {
    System.out.println("constructor: " + constructor);
}
```

运行程序，输出如下：

```text
declared Constructor: public com.test.reflection.Student()
declared Constructor: private com.test.reflection.Student(java.lang.String)
constructor: public com.test.reflection.Student()
```

### **3.4.获取非构造方法**

同样地，获取非构造方法的两个 API 是：获取所有声明的非构造函数的 `getDeclaredMethods` 和仅获取公有非构造函数的 `getMethods`：

```java
// 1.获取所有声明的函数
Method[] declaredMethodList = studentClass.getDeclaredMethods();
for (Method declaredMethod : declaredMethodList) {
    System.out.println("declared Method: " + declaredMethod);
}
// 2.获取所有公有的函数
Method[] methodList = studentClass.getMethods();
for (Method method : methodList) {
    System.out.println("method: " + method);
}
```

运行程序，输出如下：

```text
declared Method: public void com.test.reflection.Student.setStudentAge(int)
declared Method: private java.lang.String com.test.reflection.Student.show(java.lang.String)
method: public void com.test.reflection.Student.setStudentAge(int)
method: public final void java.lang.Object.wait(long,int) throws java.lang.InterruptedException
method: public final native void java.lang.Object.wait(long) throws java.lang.InterruptedException
method: public final void java.lang.Object.wait() throws java.lang.InterruptedException
method: public boolean java.lang.Object.equals(java.lang.Object)
method: public java.lang.String java.lang.Object.toString()
method: public native int java.lang.Object.hashCode()
method: public final native java.lang.Class java.lang.Object.getClass()
method: public final native void java.lang.Object.notify()
method: public final native void java.lang.Object.notifyAll()
```

从输出中我们看到，`getMethods` 方法不仅获取到了我们声明的公有方法`setStudentAge`，还获取到了很多 Object 类中的公有方法。这是因为我们前文已说到：Object 是所有 Java 类的父类。所有对象都默认实现了 Object 类的方法。 而`getDeclaredMethods`是无法获取到父类中的方法的。

### **实践**

学以致用，让我们来一个实际的应用感受一下。还是以 Student 类为例，如果此类在其他的包中，并且我们的需求是要在程序中通过反射获取他的构造方法，构造出 Student 对象，并且通过反射访问他的私有字段和私有方法。那么我们可以这样做：

```java
// 1.通过字符串获取Class对象，这个字符串必须带上完整路径名
Class studentClass = Class.forName("com.test.reflection.Student");
// 2.获取声明的构造方法，传入所需参数的类名，如果有多个参数，用','连接即可
Constructor studentConstructor = studentClass.getDeclaredConstructor(String.class);
// 如果是私有的构造方法，需要调用下面这一行代码使其可使用，公有的构造方法则不需要下面这一行代码
studentConstructor.setAccessible(true);
// 使用构造方法的newInstance方法创建对象，传入构造方法所需参数，如果有多个参数，用','连接即可
Object student = studentConstructor.newInstance("NameA");
// 3.获取声明的字段，传入字段名
Field studentAgeField = studentClass.getDeclaredField("studentAge");
// 如果是私有的字段，需要调用下面这一行代码使其可使用，公有的字段则不需要下面这一行代码
// studentAgeField.setAccessible(true);
// 使用字段的set方法设置字段值，传入此对象以及参数值
studentAgeField.set(student,10);
// 4.获取声明的函数，传入所需参数的类名，如果有多个参数，用','连接即可
Method studentShowMethod = studentClass.getDeclaredMethod("show",String.class);
// 如果是私有的函数，需要调用下面这一行代码使其可使用，公有的函数则不需要下面这一行代码
studentShowMethod.setAccessible(true);
// 使用函数的invoke方法调用此函数，传入此对象以及函数所需参数，如果有多个参数，用','连接即可。函数会返回一个Object对象，使用强制类型转换转成实际类型即可
Object result = studentShowMethod.invoke(student,"message");
System.out.println("result: " + result);
```

程序的逻辑注释已经写得很清晰了，我们再梳理一下：

1.  先用第一种全路径获取 Class 的方法获取到了 Student 的 Class 对象
2.  然后反射调用它的私有构造方法 `private Student(String studentName)`，构建出 newInstance
3.  再将其公有字段 studentAge 设置为 10
4.  最后反射调用其私有方法 `show`，传入参数 “message”，并打印出这个方法的返回值。

其中，`setAccessible` 函数用于动态获取访问权限，Constructor、Field、Method 都提供了此方法，让我们得以访问类中的私有成员。

运行程序，输出如下：

```java
show: NameA,10,message
result: testReturnValue
```