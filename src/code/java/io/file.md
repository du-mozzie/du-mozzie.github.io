---
order: 1
title: 文件
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# 文件

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
