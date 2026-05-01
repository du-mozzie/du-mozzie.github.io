---
order: 5
title: Reader
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# Reader

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
