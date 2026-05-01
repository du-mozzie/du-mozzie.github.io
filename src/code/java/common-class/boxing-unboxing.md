---
order: 3
title: 装箱和拆箱
date: 2021-04-02
category: Java
tag: Java
timeline: true
article: true
---

# 装箱和拆箱

装箱和拆箱是包装类的特有名词，装箱是指将基本数据类型转为对应的包装类对象，拆箱就是将包装类对象转为对应的基本数据类型。

装箱与拆箱

装箱是指将基本数据类型转换为包装类对象。

拆箱是指将包装类对象转换为基本数据类型。

## 3.1、构造函数

1、public Type(type value) 【**即原类型**】

每个包装类都提供了一个有参构造函数：public Type(type value)，用来实例化包装类对象。

```java
byte b = 1;
Byte byt = new Byte(b);
short s = 2;
Short shor = new Short(s);
int i = 3;
Integer integer = new Integer(i);
long l = 4;
Long lon = new Long(l);
float f = 5.5f;
Float flo = new Float(f);
double d = 6.6;
Double dou = new Double(d);
char cha = 'J';
Character charac = new Character(cha);
boolean bo = true;
Boolean bool = new Boolean(bo);
System.out.println(byt);
System.out.println(shor);
System.out.println(integer);
System.out.println(lon);
System.out.println(flo);
System.out.println(dou);
System.out.println(charac);
System.out.println(bool);
```

2、public Type(String value)/public Type(char value) 【**即字符/字符串类型**】

每个包装类还有一个重载构造函数：

Character 类的重载构造函数：`public Type(char value)`，其他包装类的重载构造函数：`public Type(String value)`。

```java
Byte byt = new Byte("1");
Short shor = new Short("2");
Integer integer = new Integer("3");
Long lon = new Long("4");
Float flo = new Float("5.5f");
Double dou = new Double("6.6");
Character charac = new Character('J');
Boolean bool = new Boolean("abc");
System.out.println(byt);
System.out.println(shor);
System.out.println(integer);
System.out.println(lon);
System.out.println(flo);
System.out.println(dou);
System.out.println(charac);
```

需要注意的是，Boolean 类的构造函数中，当参数为 “true” 时，Boolean 值为 true，当参数不为 “true”，Boolean 值为 false。

## 3.2、装箱

1、public Type(type value)

2、public Type(String value)/public Type(char value)

3、**valueOf**(type value) 静态方法，参数是基本数据类型的数据

每一个包装类都有一个 valueOf(type value) 方法

```java
byte b = 1;
Byte byt = Byte.valueOf(b);
short s = 2;
Short shot = Short.valueOf(s);
int i = 3;
Integer integer = Integer.valueOf(i);
long l = 4L;
Long lon = Long.valueOf(l);
float f = 5.5f;
Float floa = Float.valueOf(f);
double d = 6.6;
Double doub = Double.valueOf(d);
boolean boo = true;
Boolean bool = Boolean.valueOf(boo);
char ch = 'J';
Character cha = Character.valueOf(ch);
```

其中：

```java
//valueOf(String value)/valueOf(char value) 专门为 Character 转换使用的，
//其他的 7 个包装类都可以使用 valueOf(String value)。
Byte byt = Byte.valueOf("1");
Short sho = Short.valueOf("2");
Integer integer = Integer.valueOf("3");
Long lon = Long.valueOf("4");
Float flo = Float.valueOf("5.5f");
Double dou = Double.valueOf("6.6");
Boolean boo = Boolean.valueOf("true");
Character cha = Character.valueOf('J');
```

需要注意的是 Boolean.valueOf(String value) 方法中，当 value 为 “true” 时，Boolean 的值为 true，否则，Boolean 的值为 false。

## 3.3、拆箱

1、`*Value()`
每个包装类都有一个 *Value() 方法，通过该方法可以将包装类转为基本数据类型。

```java
Byte byt = Byte.valueOf("1");
Short sho = Short.valueOf("2");
Integer integer = Integer.valueOf("3");
Long lon = Long.valueOf("4");
Float flo = Float.valueOf("5.5f");
Double dou = Double.valueOf("6.6");
Boolean boo = Boolean.valueOf("true");
Character cha = Character.valueOf('J');
 
byte b = byt.byteValue();
short sh = sho.shortValue();
int i = integer.intValue();
long l = lon.longValue();
float f = flo.floatValue();
double d = dou.doubleValue();
boolean bo = boo.booleanValue();
char c = cha.charValue();
```

2、`parse*(String value)`

除了 `Character` 类以外的每一个包装类都有一个`静态方法`可以将字符串类型转为基本数据类型。

```java
byte b = Byte.parseByte("1");
short s = Short.parseShort("2");
int i = Integer.parseInt("3");
long l = Long.parseLong("4");
float f = Float.parseFloat("5.5");
double d = Double.parseDouble("6.6");
boolean bo = Boolean.parseBoolean("true");
```

3、toString(type value)

每个包装类都有该方法，作用是将基本数据类型转为 String 类型。

```java
byte b = 1;
String bstr = Byte.toString(b);
short s = 2;
String sstr = Short.toString(s);
String i = Integer.toString(3);
long l = 4L;
String lstr = Long.toString(l);
float f = 5.5f;
String fstr = Float.toString(f);
double d = 6.6;
String dstr = Double.toString(d);
boolean bo = true;
String bostr = Boolean.toString(bo);
String chstr = Character.toString('J');
```
