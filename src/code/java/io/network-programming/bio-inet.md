---
order: 6
title: BIO：Inet
date: 2021-06-06
category: Java
tag: Java
timeline: true
article: true
---

# BIO：Inet

一个 InetAddress 类的对象就代表一个 IP 地址对象

成员方法：

- `static InetAddress getLocalHost()`：获得本地主机 IP 地址对象
- `static InetAddress getByName(String host)`：根据 IP 地址字符串或主机名获得对应的 IP 地址对象
- `String getHostName()`：获取主机名
- `String getHostAddress()`：获得 IP 地址字符串

```java
public class InetAddressDemo {
    public static void main(String[] args) throws Exception {
        // 1.获取本机地址对象
        InetAddress ip = InetAddress.getLocalHost();
        System.out.println(ip.getHostName());//DESKTOP-NNMBHQR
        System.out.println(ip.getHostAddress());//192.168.11.1
        // 2.获取域名ip对象
        InetAddress ip2 = InetAddress.getByName("www.baidu.com");
        System.out.println(ip2.getHostName());//www.baidu.com
        System.out.println(ip2.getHostAddress());//14.215.177.38
        // 3.获取公网IP对象。
        InetAddress ip3 = InetAddress.getByName("182.61.200.6");
        System.out.println(ip3.getHostName());//182.61.200.6
        System.out.println(ip3.getHostAddress());//182.61.200.6
        
        // 4.判断是否能通： ping  5s之前测试是否可通
        System.out.println(ip2.isReachable(5000)); // ping百度
    }
}
```

