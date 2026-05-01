---
order: 9
title: 序列化和反序列化
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# 序列化和反序列化

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
