---
order: 6
title: String
date: 2021-04-02
category: Java
tag: Java
timeline: true
article: true
---

# String

Java 通过 String 类来创建和操作字符串数据。

- String 实例化

1、直接赋值

```java
String str = "Hello World";
```

2、通过构造函数创建对象

```java
String str = new String("Hello World");
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202424784.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202434963.png)

```java
isLatin1() ? StringLatin1.equals(value, aString.value)
	:StringUTF16.equals(value, aString.value);
```

三目运算符 三元表达式

## 1、String 常用方法

| 方法                                                 | 描述                                   |
| ---------------------------------------------------- | -------------------------------------- |
| public String()                                      | 创建一个空的字符串对象                 |
| public String(String value)                          | 创建一个值为 value 的字符串对象        |
| public String(char value[])                          | 将一个char数组转换为字符串对象         |
| public String(char value[],int offset, int count)    | 将一个指定范围的char数组转为字符串对象 |
| public String(byte value[])                          | 将一个byte数组转换为字符串对象         |
| public String(byte value[],int offset, int count)    | 将一个指定范围的byte数组转为字符串对象 |
| public int length()                                  | 获取字符串的长度                       |
| public boolean isEmpty()                             | 判断字符串是否为空                     |
| public char charAt(int index)                        | 返回指定下标的字符                     |
| public byte[] getBytes()                             | 返回字符串对应的byte数组               |
| public boolean equals(Object anObject)               | 判断两个字符串值是否相等               |
| public boolean equalsIgnoreCase(Object anObject)     | 判断两个字符串值是否相等（忽略大小写） |
| public int compareTo(String value)                   | 对字符串进行排序                       |
| public int compareToIgnoreCase(String value)         | 忽略大小写进行排序                     |
| public boolean startsWith(String value)              | 判断字符串是否以 value 开头            |
| public boolean endsWith(String value)                | 判断字符串是否以 value 结尾            |
| public int hashCode()                                | 返回字符串的 hash 值                   |
| public int indexOf(String str)                       | 返回 str 在字符串中的下标              |
| public int indexOf(String str,int formIndex)         | 从指定位置查找字符串的下标             |
| public String subString(int beginIndex)              | 从指定位置开始截取字符串               |
| public String subString(int beginIndex,int endIndex) | 截取指定区间的字符串                   |
| public String concat(String str)                     | 追加字符串                             |
| public String replaceAll(String o,String n)          | 将字符串中所有的 o 替换成 n            |
| public String[] split(String regex)                  | 用指定的字符串对目标进行分割，返回数组 |
| public String toLowerCase()                          | 转小写                                 |
| public String toUpperCase()                          | 转大写                                 |
| public char[] toCharArray()                          | 将字符串转为字符数组                   |

null 和空是两个概念。

null 是指对象不存在，引用地址为空。

空是指对象存在，没有内容，长度为零。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202449230.png)

## 2、StringBuffer

String 对象一旦创建，值不能修改（原来的值不能修改，一旦修改就是一个新的对象，只要一改动，就会创建一个新的对象）

修改之后会重新开辟内存空间来存储新的对象，会修改 String 的引用。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202501971.png)

String 的值为什么不能修改？修改之后会创建一个新的对象？而不是在原有对象的基础上进行修改？

因为 String 底层是用数组来存值的，数组长度一旦创建就不可修改，所以导致上述问题。

StringBuffer 可以解决 String 频繁修改造成的空间资源浪费的问题。

StringBuffer 底层也是使用数组来存值。

- StringBuffer 数组的默认长度为 16，使用无参构造函数来创建对象。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202535624.png)

- 使用有参构造创建对象，数组长度=值的长度+16。
    ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202557779.png)

```java
public class Test {
    public static void main(String[] args) {
        StringBuffer stringBuffer = new StringBuffer("Hello");
        StringBuffer stringBuffer1 = new StringBuffer();
        //stringBuffer 底层数组的长度是 21
        //stringBuffer1 底层数组的长度是 16
        stringBuffer1.append("Hello");
        System.out.println(stringBuffer.toString().equals(stringBuffer1.toString()));
        System.out.println(stringBuffer.length());
        System.out.println(stringBuffer1.length());
    }
}
```

length 方法返回的并不是底层数组的长度，而是它的**有效长度**（值的长度）。

StringBuffer 一旦创建，默认会有 16 个字节的空间去修改，但是一旦追加的字符串长度超过 16，如何处理？

StringBuffer 不会重新开辟一块新的内存区域，而是在原有的基础上进行扩容，通过调用父类 ensureCapacityInternal() 方法对底层数组进行扩容，保持引用不变。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220114202621186.png)

StringBuffer 的常用方法，StringBuffer 是线程安全的，但是效率较低，StringBuilder 是线程不安全的，但是效率较高。

HashMap：线程不安全，效率高

Hashtable：线程安全，效率低

| 方法                                                         | 描述                                  |
| ------------------------------------------------------------ | ------------------------------------- |
| public StringBuffer()                                        | 创建一个空的 StringBuffer对象         |
| public StringBuffer(String str)                              | 创建一个值为 str 的 StringBuffer 对象 |
| public synchronized int length()                             | 返回 StringBuffer 的长度              |
| public synchronized char charAt(int index)                   | 返回指定位置的字符                    |
| public synchronized StringBuffer append(String str)          | 追加内容                              |
| public synchronized StringBuffer delete(int start,int end)   | 删除指定区间的值                      |
| public synchronized StringBuffer deleteCharAt(int index)     | 删除指定位置的字符                    |
| public synchronized StringBuffer replace(int start,int end,String str) | 将指定区间的值替换成 str              |
| public synchronized String substring(int start)              | 截取字符串从指定位置到结尾            |
| public synchronized String substring(int start,int end)      | 截取字符串从start开始，到end结束      |
| public synchronized StringBuffer insert(int offset,String str) | 在指定位置插入 str                    |
| public int indexOf(String str)                               | 从头开始查找指定字符的位置            |
| public int indexOf(String str,int fromIndex)                 | 从fromIndex开始查找指定字符的位置     |
| public synchronized StringBuffer reverse()                   | 进行反转                              |
| public synchronized String toString()                        | 转为 String                           |

读取数据不需要考虑线程安全问题，因为这种操作不存在安全隐患。
