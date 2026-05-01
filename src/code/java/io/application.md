---
order: 10
title: IO 流的应用
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# IO 流的应用

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
