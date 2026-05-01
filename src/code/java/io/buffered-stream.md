---
order: 8
title: 缓冲流
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# 缓冲流

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
