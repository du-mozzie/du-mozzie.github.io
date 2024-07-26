---
order: 13
title: 读取自定义配置文件属性
date: 2021-10-16
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

创建一个xxxProperties类

```java
@EnableConfigurationProperties
//读取属性配置文件
@ConfigurationProperties(prefix = "wx.open")
@Configuration
@Data
public class SecurityProperties {
    //属性名称与配置文件中的名称对应
    private String appId;
    private String appSecret;
    private String redirectUrl;
}
```

```yaml
# 微信开放平台
wx:
  open:
    app_id: wxcdc05016b9dee6ef
    app_secret: 93ed95abec9d3c83da411f45d4ac281d
    redirect_url: http://sycimi.natappfree.cc/callback
```

还可以使用value注解

```java
package com.du.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WxProperties {

    @Value("${wx.open.app_id}")
    private String appId;
    
    @Value("${wx.open.app_secret}")
    private String appSecret;
    
    @Value("${wx.open.redirect_url}")
    private String redirectUrl;
}
```