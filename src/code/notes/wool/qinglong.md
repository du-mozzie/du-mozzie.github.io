---
order: 1
title: 青龙-京东faker仓库
date: 2025-01-07
category: 
    - 羊毛
    - 青龙
tag: 
    - 羊毛
    - 青龙
timeline: true
article: true
prev: ./
---

## 安装青龙

1. 我是基于1Panel安装的，在1Panel应用商店有青龙面板，直接一键安装

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107140706790.png)

2. 初始化青龙，直接IP + 端口访问青龙面板（如果是云服务器记得开放端口）

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107141047125.png)

3. 配置通知服务，我这边用的是[pushplus](https://www.pushplus.plus/)，填写自己的token即可

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107141119459.png)

4. 设置一下账号密码，登录青龙

## 安装依赖

1. 依赖管理->创建依赖，选择自动拆分

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107142001490.png)

2. NodeJs依赖

   ```
   crypto-js
   prettytable
   dotenv
   jsdom
   date-fns
   tough-cookie
   tslib
   ws@7.4.3
   ts-md5
   jsdom -g
   jieba
   fs
   form-data
   json5
   global-agent
   png-js
   @types/node
   require
   typescript
   js-base64
   axios
   cheerio
   data-fns
   node-jsencrypt
   node-rsa
   node-fetch
   qs
   ds
   yml2213-utils
   ```

3. Python3依赖

   ```
   requests
   canvas
   ping3
   jieba
   aiohttp
   bs4
   userAgent
   selenium
   PyExecJS
   redis
   Pycryptodome
   ```

4. Linux依赖

   ```
   bizCode
   bizMsg
   lxml
   ```

等待一会依赖安装完成，如果安装太慢可以自己配置一下镜像加速，有安装失败的可以查看安装日志解决一下

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107162238752.png)

```
# Node 软件包镜像源
https://registry.npmmirror.com

# Python 软件包镜像源
https://mirrors.aliyun.com/pypi/simple/

# Linux 软件包镜像源
https://mirrors.aliyun.com
```

## 拉取Faker仓库并配置

[GitHub Faker 仓库地址](https://github.com/shufflewzc)

```
复制以下拉库命令即可。

Faker2 助力池版【安全本地sign防CK泄漏】使用助力池请在群里发"助力池" 机器人自动回复教程
ql repo https://git.metauniverse-cn.com/https://github.com/shufflewzc/faker2.git "jd_|jx_|gua_|jddj_|jdCookie" "activity|backUp" "^jd[^_]|USER|function|utils|sendNotify|ZooFaker_Necklace.js|JDJRValidator_|sign_graphics_validate|ql|JDSignValidator|magic|depend|h5sts" "main"

Faker3 内部互助版【安全本地sign防CK泄漏】
ql repo https://git.metauniverse-cn.com/https://github.com/shufflewzc/faker3.git "jd_|jx_|gua_|jddj_|jdCookie" "activity|backUp" "^jd[^_]|USER|function|utils|sendNotify|ZooFaker_Necklace.js|JDJRValidator_|sign_graphics_validate|ql|JDSignValidator|magic|depend|h5sts" "main"

Faker4 纯净版 仅包含少量日常内部助力任务 防止运行过多任务掉ck 适合安静挂机
ql repo https://git.metauniverse-cn.com/https://github.com/shufflewzc/faker4.git "jd_|jx_|gua_|jddj_|jdCookie" "activity|backUp" "^jd[^_]|USER|function|utils|sendNotify|ZooFaker_Necklace.js|JDJRValidator_|sign_graphics_validate|ql|JDSignValidator|magic|depend|h5sts" "main"
```

**配置Faker**

1. 订阅任务

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107142920124.png)

2. 配置任务，直接复制上面的脚本即可，我选择的是`Faker4` 

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107143119647.png)

3. 配置定时规则 `0 3,14 * * *`，凌晨三点，下午两点更新任务

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107143329495.png)

4. 到这边Faker仓库就已经配置完成了，可以手动运行一次订阅任务

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107143501964.png)

5. 在青龙初始化的时候我们配置了pushplus推送消息，订阅任务执行完成的时候可以在pushplus的公众号收到消息通知

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107144203125.png)

**配置京东 Cookie**

1. 浏览器打开[m.jd.com](https://m.jd.com/) 登录账号

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107144321487.png)

2. 登录后按F12打开浏览器的控制台，选择`Application` -> `Cookies` -> `my.m.jd.com` 这个域，找到 `pt_key`、`pt_pin`

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107144533325.png)

3. 配置环境变量，名称为：JD_COOKIE，值为：pt_key=xxxxxxxxxxxxxxx;pt_pin=xxxxxxx;具体信息为你在Cookie中看到的信息。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107144644984.png)

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20250107144752360.png)

到这一步，基本上的配置就已经完成了，青龙面板本质上是一个任务管理平台，我们也可以去GitHub找一些其他的脚本来执行。