---
order: 3
title: 自定义事件监听器
date: 2021-10-11
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

```java
实现接口
ApplicationContextInitializer
public class MyApplicationContextInitializer implements ApplicationContextInitializer {
}

ApplicationListener 
public class MyApplicationListener implements ApplicationListener {
}

SpringApplicationRunListener
public class MySpringApplicationRunListeners implements SpringApplicationRunListener {
}

ApplicationRunner
@Component
public class MyApplicationRunner implements ApplicationRunner {
}

CommandLineRunner
/**
 * 应用启动做一个一次性事情
 */
//MyApplicationRunner，与MyCommandLineRunner优先级@Order()，数字越大优先级越高
@Order(2)
@Component
public class MyCommandLineRunner implements CommandLineRunner {
}
```

>   配置

ApplicationContextInitializer

ApplicationListener

SpringApplicationRunListener

在src/main/resources/META-INF/spring.factories下配置

```properties
# Application Context Initializers
org.springframework.context.ApplicationContextInitializer=\
  com.du.lister.MyApplicationContextInitializer

# Application Listeners
org.springframework.context.ApplicationListener=\
  com.du.lister.MyApplicationListener

# Run Listeners
org.springframework.boot.SpringApplicationRunListener=\
  com.du.lister.MySpringApplicationRunListeners
```

ApplicationRunner

CommandLineRunner

添加注解@Component，注入IOC容器中，使用@order可以进行排序，数字越大优先级越高