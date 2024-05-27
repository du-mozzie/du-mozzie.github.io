---
order: 11
title: IO流
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# IO

Java IO（输入/输出）是指用于读取和写入数据的API，包括处理文件、网络连接、内部存储等。Java IO API 提供了广泛的类和接口来处理不同类型的输入输出操作。

## 1、文件

File 类

java.io.File，使用该类的构造函数就可以创建文件对象，将`硬盘`中的一个具体的`文件`以 Java 对象的形式来表示。

| 方法                               | 描述                           |
| ---------------------------------- | ------------------------------ |
| public File(String pathname)       | 根据路径创建对象               |
| public String getName()            | 获取文件名                     |
| public String getParent()          | 获取文件所在的目录             |
| public File getParentFile()        | 获取文件所在目录对应的File对象 |
| public String getPath()            | 获取文件路径                   |
| public boolean exists()            | 判断文件是否存在               |
| public boolean isDirectory()       | 判断对象是否为目录             |
| public boolean isFile()            | 判断对象是否为文件             |
| public long length()               | 获取文件的大小                 |
| public boolean createNewFile()     | 根据当前对象创建新文件         |
| public boolean delete()            | 删除对象                       |
| public boolean mkdir()             | 根据当前对象创建目录           |
| public boolean renameTo(File file) | 为已存在的对象重命名           |

IO

Input 输入流（将外部文件读入到 Java 程序中）

Output 输出流（将 Java 程序中的数据输出到外部）

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202710730.png)

Java 中的流有很多种不同的分类。

- 按照方向分，`输入流`和`输出流`
- 按照单位分，可以分为`字节流`和`字符流`（字节流是指每次处理数据以字节为单位，字符流是指每次处理数据以字符为单位）
- 按照功能分，可以分为`节点流`和`处理流`。

方法定义时的异常如果直接继承自 Exception，实际调用的时候需要手动处理（捕获异常/丢给虚拟机去处理）

方法定义时的异常如果继承自 RuntimeException，调用的时候不需要处理。

## 2、IO流

- 按照方向分，可以分为输入流和输出流。
- 按照单位分，可以分为字节流和字符流。
- 按照功能分，可以分为节点流和处理流。

## 3、字节流

按照方向可以分为输入字节流和输出字节流。

InputStream、OutputStream

1 byte = 8 位二进制数 01010101

InputStream常用方法

| 方法                               | 描述                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| int read()                         | 以字节为单位读取数据                                   |
| int read(byte b[])                 | 将数据存入 byte 类型的数组中，返回数组中有效数据的长度 |
| int read(byte b[],int off,int len) | 将数据存入 byte 数组的指定区间内，返回数组长度         |
| byte[] readAllBytes()              | 将所有数据存入 byte 数组并返回                         |
| int available()                    | 返回当前数据流未读取的数据个数                         |
| void close()                       | 关闭数据流                                             |

OutputStream

| 方法                                 | 描述                           |
| ------------------------------------ | ------------------------------ |
| void write(int b)                    | 以字节为单位输出数据           |
| void write(byte b[])                 | 将byte数组中的数据输出         |
| void write(byte b[],int off,int len) | 将byte数组中指定区间的数据输出 |
| void close()                         | 关闭数据流                     |
| void flush()                         | 将缓冲流中的数据同步到输出流中 |

## 4、字符流

字节流是单位时间内处理一个字节的数据（输入+输出）

字符流是单位时间内处理一个字符的数据（输入+输出）

字符流：

- 输入字符流 Reader
- 输出字符流 Writer

## 5、Reader

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202728127.png)

是一个抽象类

Readable 接口的作用？

可以将数据以字符的形式读入到`缓冲区`

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202738105.png)

- 方向：输入+输出
- 单位：字节+字符
- 功能：节点流（字节流） + 处理流（对节点流进行处理，生成其他类型的流）

InputStream(字节输入流) —> Reader（字符输入流）

InputStreamReader 的功能是将`字节输入流`转换为`字符输入流`
![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202755005.png)

> 英文、数字、符号

1 个字节 = 1 个字符

如：a 1 个字符、1 个字节

> 汉字

1 个字符 = 3 个字节

如：好 1个字符、3 个字节

```java
public class Test {
    public static void main(String[] args) throws Exception {
        //字符流
        Reader reader = new FileReader("/Users/du/Desktop/test.txt");
        int temp = 0;
        System.out.println("*******字符流读取********");
        while ((temp = reader.read())!=-1){
            System.out.println(temp);
        }
        reader.close();

        //字节流
        InputStream inputStream = new FileInputStream("/Users/du/Desktop/test.txt");
        temp = 0;
        System.out.println("*******字节流读取********");
        while ((temp = inputStream.read())!=-1){
            System.out.println(temp);
        }
        inputStream.close();
    }
}

```

read() 返回的是 int ，直接将字符转成字节（1-1，1-3）

read(char[] chars) 返回的是char数组，直接就返回字符，不会转成字节的。

## 6、Writer

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202852617.png)

Appendable 接口可以将 char 类型的数据读入到`数据缓冲区`
![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202905901.png)

OutputStreamWriter 处理流

OutputStreamWriter 的功能是将`输出字节流`转成`输出字符流`，与 InputStreamReader 相对应的，将`输入字节流`转成`输入字符流`
![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202923524.png)

```java
public class Test {
    public static void main(String[] args) throws Exception {
        Writer writer = new FileWriter("/Users/du/Desktop/copy.txt");
        //writer.write("你好");
//        char[] chars = {'你','好','世','界'};
//        writer.write(chars,2,2);
        String str = "Hello World,你好世界";
        writer.write(str,10,6);
        writer.flush();
        writer.close();
    }
}
```

## 7、处理

### 1、读文件

```java
public class Test {
    public static void main(String[] args) throws Exception {
        //基础管道
        InputStream inputStream = new FileInputStream("/Users/du/Desktop/test.txt");
        //处理流
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
        char[] chars = new char[1024];
        int length = inputStreamReader.read(chars);
        inputStreamReader.close();
        String result = new String(chars,0,length);
        System.out.println(result);
    }
}
```

### 2、写文件

```java
public class Test2 {
    public static void main(String[] args) throws Exception {
        String str = "你好 世界";
        OutputStream outputStream = new FileOutputStream("/Users/du/Desktop/copy.txt");
        OutputStreamWriter writer = new OutputStreamWriter(outputStream);
        writer.write(str,2,1);
        writer.flush();
        writer.close();
    }
}
```

## 8、缓冲流

无论是`字节流`还是`字符流`，使用的时候都会频繁访问硬盘，对硬盘是一种损伤，同时效率不高，如何解决？

可以使用**缓冲流**，缓冲流自带缓冲区，可以一次性从硬盘中读取部分数据存入缓冲区，再写入内存，这样就可以有效减少对硬盘的直接访问。

缓冲流属于`处理流`，如何来区分**节点流**和**处理流**？

1、节点流使用的时候可以直接对接到文件对象File

2、处理流使用的时候不可以直接对接到文件对象 File，必须要建立在`字节流`的基础上才能创建。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114203006564.png)

缓冲流又可以分为字节缓冲流和字符缓冲流，按照方向再细分，又可以分为字节输入缓冲流和字节输出缓冲流，以及字符输入缓冲流和字符输出缓冲流。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114203035230.png)

> 字节输入缓冲流

```java
public class Test {
    public static void main(String[] args) throws Exception {
        //1、创建节点流
        InputStream inputStream = new FileInputStream("/Users/du/Desktop/test.txt");
        //2、创建缓冲流
        BufferedInputStream bufferedInputStream = new BufferedInputStream(inputStream);
        //        int temp = 0;
        //        while ((temp = bufferedInputStream.read())!=-1){
        //            System.out.println(temp);
        //        }

        byte[] bytes = new byte[1024];
        int length = bufferedInputStream.read(bytes,10,10);
        System.out.println(length);
        for (byte aByte : bytes) {
            System.out.println(aByte);
        }
        bufferedInputStream.close();
        inputStream.close();
    }
}
```

> 字符输入缓冲流

readLine 方法

```java
public class Test2 {
    public static void main(String[] args) throws Exception {
        //1、创建字符流（节点流）
        Reader reader = new FileReader("/Users/du/Desktop/test.txt");
        //2、创建缓冲流（处理流）
        BufferedReader bufferedReader = new BufferedReader(reader);
        String str = null;
        int num = 0;
        System.out.println("***start***");
        while ((str = bufferedReader.readLine())!=null){
            System.out.println(str);
            num++;
        }
        System.out.println("***end***,共读取了"+num+"次");
        bufferedReader.close();
        reader.close();
    }
}
```

> 字节输出缓冲流

```java
public class Test {
    public static void main(String[] args) throws Exception {
        OutputStream outputStream = new FileOutputStream("/Users/du/Desktop/test2.txt");
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(outputStream);
        String str = "由于在开发Oak语言时，尚且不存在运行字节码的硬件平台，所以为了在开发时可以对这种语言进行实验研究，他们就在已有的硬件和软件平台基础上，按照自己所指定的规范，用软件建设了一个运行平台，整个系统除了比C++更加简单之外，没有什么大的区别。";
        byte[] bytes = str.getBytes();
//        for (byte aByte : bytes) {
//            bufferedOutputStream.write(aByte);
//        }
        bufferedOutputStream.write(bytes,9,9);
        bufferedOutputStream.flush();
        bufferedOutputStream.close();
        outputStream.close();
    }
}
```

> 字符输出缓冲流

```java
public class Test2 {
    public static void main(String[] args) throws Exception {
        Writer writer = new FileWriter("/Users/du/Desktop/test2.txt");
        BufferedWriter bufferedWriter = new BufferedWriter(writer);
//        String str = "由于在开发语言时尚且不存在运行字节码的硬件平台，所以为了在开发时可以对这种语言进行实验研究，他们就在已有的硬件和软件平台基础上，按照自己所指定的规范，用软件建设了一个运行平台，整个系统除了比C++更加简单之外，没有什么大的区别。";
//        bufferedWriter.write(str,5,10);
        char[] chars = {'J','a','v','a'};
//        bufferedWriter.write(chars,2,1);
        bufferedWriter.write(22902);
        bufferedWriter.flush();
        bufferedWriter.close();
        writer.close();
    }
}
```

输入流没有 flush 方法，但不代表它没有缓冲流，输出流是有 flush 方法的，实际开发中在关闭输出缓冲流之前，需要调用 flush 方法。

## 9、序列化和反序列化

序列化就是将内存中的对象输出到硬盘文件中保存。

反序列化就是相反的操作，从文件中读取数据并还原成内存中的对象。

> 序列化

1、实体类需要实现序列化接口，Serializable

```java
public class User implements Serializable {
    private Integer id;
    private String name;
    private Integer age;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
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

    public User(Integer id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
}
```

2、实体类对象进行序列化处理，通过数据流写入到文件中，ObjectOutputStream。

```java
package com.du.demo3;

import com.du.entity.User;

import java.io.File;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;

public class Test {
    public static void main(String[] args) throws Exception {
        User user = new User(1,"张三",22);
        OutputStream outputStream = new FileOutputStream("/Users/du/Desktop/obj.txt");
        ObjectOutputStream objectOutputStream = new ObjectOutputStream(outputStream);
        objectOutputStream.writeObject(user);
        objectOutputStream.flush();
        objectOutputStream.close();
        outputStream.close();
    }
}
```

> 反序列化

```java
public class Test2 {
    public static void main(String[] args) throws Exception {
        InputStream inputStream = new FileInputStream("/Users/du/Desktop/obj.txt");
        ObjectInputStream objectInputStream = new ObjectInputStream(inputStream);
        User user = (User) objectInputStream.readObject();
        System.out.println(user);
        objectInputStream.close();
        inputStream.close();
    }
}
```

## 10、IO 流的应用

IO 流就是完成文件传输（上传文件：发朋友圈、换头像，文件下载：CSDN 下载源代码、文档）

字符 a 你好

文本类型的数据（txt、word、Excel、MD）可以使用字符去读取（当然也可以用字节）

```java
public class Test3 {
    public static void main(String[] args) throws Exception {
        Reader reader = new FileReader("/Users/du/Desktop/test.txt");
        BufferedReader bufferedReader = new BufferedReader(reader);

        Writer writer = new FileWriter("/Users/du/myjava/test.txt");
        BufferedWriter bufferedWriter = new BufferedWriter(writer);

        String str = "";
        int num = 0;
        while ((str = bufferedReader.readLine())!=null){
            bufferedWriter.write(str);
            num++;
        }

        System.out.println("传输完毕，共读取了"+num+"次");
        bufferedWriter.flush();
        bufferedWriter.close();
        writer.close();
        bufferedReader.close();
        reader.close();

    }
}
```

非文本类型的数据（图片、音频、视频）不能用字符去读取，只能用字节去读。

```java
public class Test {
    public static void main(String[] args) throws Exception {
        //1、通过输入流将文件读入到 Java
        InputStream inputStream = new FileInputStream("/Users/du/Desktop/1.png");
        //2、通过输出流将文件从 Java 中写入到 myjava
        OutputStream outputStream = new FileOutputStream("/Users/du/myjava/1.png");
        int temp = 0;
        int num = 0;
        long start = System.currentTimeMillis();
        while((temp = inputStream.read())!=-1){
            num++;
            outputStream.write(temp);
        }
        long end = System.currentTimeMillis();
        System.out.println("传输完毕，共耗时"+(end-start));
        outputStream.flush();
        outputStream.close();
        inputStream.close();
    }
}
```