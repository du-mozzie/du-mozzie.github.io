---
order: 2
title: Charles抓安卓Https接口
date: 2025-01-09
category: 
    - 羊毛
    - 抓包
    - Charles
tag: 
    - 羊毛
    - 抓包
    - Charles
timeline: true
article: true
prev: ./
---

Charles 是一个抓包工具，可以用来抓手机的包

## Charles 配置

1. Proxy -> Proxy Settings

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109105946884.png)

2. Proxy -> SSL Proxying Settings

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109110059391.png)

   host主机地址：*

   *为所有主机地址

   port端口号：443

   https端口号443，http端口号：80

3. 安装证书，Help -> SSL Proxying -> Install Charles Root Certificate

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109110619373.png)

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109110802565.png)

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109110838359.png)

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109110905746.png)

## 手机配置

1. 设置 WiFi代理

   - 查看 Charles 代理端口，Help -> SSL Proxying -> Install Charles Root Certificate On Mobile Device or Remote Browser

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109111911814.png)

     记住ip，端口

   - 手机上选择连接的WiFi，设置代理

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109112256507.png)
     
   - 如果电脑出现允许代理的提示，点击 Allow 即可

     ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109113429964.png)

2. 下载 Charles 证书

   - 方式一：
     - 打开手机浏览器输入：chls.pro/ssl 下载证书
     
       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109113615642.png)
     
     - 下载好后点击安装，提示：\_\_\_\_\_\_\_  你自定义一个证书名称，点击保存
     
       提示证书安装成功即可
     
       点击打开或保存（部分手机点击证书提示找不到对应的打开文件、无法打开文件）
     
       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109113830235.png)
     
       这是由于部分手机不能识别pem格式的证书文件（不幸的是我的手机也试别不了，这个时候可以选择方式二）
     
   - 方式二：

     - 导出Charles证书，Help -> SSL Proxying -> Save Charles Root Certificate...

       ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109111334519.png)

     - 通过数据线（或者使用微信文件传输助手），保存到手机

     - 手机安装证书（以下不同手机可能存在略微差异）

       - 在设置中搜索 “证书”

         ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109114320222.png)

       - 选择 “从存储设备安装证书”

       - 安装 “CA证书”

         ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109114401724.png)

       - 手机可能会提示 “安全警告” 之类的信息，不用管，直接安装即可（通常这一步会让你输入密码进行确认）

         ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109114550434.png)

       - 选择前面保存的证书进行安装

         ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109124934547.png)

       - 提示 “已安装CA证书”，到这一步证书的安装已经成功了

         ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109114747898.png)

**上面的步骤是安卓手机的配置，如果是IOS也是类似的操作，核心就是将WiFi的数据包通过代理端口转发给Charles，配置证书是因为需要抓取Https协议的接口，如果不用不需要Https也可以不用配置**

## 测试

通过前面的准备工作证书已经安装成功，已经能够使用Charles进行抓包了，可以在手机上随便浏览一个网站试试，Charles能够正常解析Https数据

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250109124833494.png)