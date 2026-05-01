---
order: 7
title: 处理
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# 处理

## 1、读文件

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

## 2、写文件

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
