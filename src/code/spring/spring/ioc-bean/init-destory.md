---
order: 5
title: 初始化与销毁
date: 2021-10-05
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

初始化和销毁 Bean 的实现有三种：

- 依赖于后置处理器提供的拓展功能
- 相关接口的功能
- 使用 @Bean 注解中的属性进行指定

当同时存在以上三种方式时，它们的执行顺序也将按照上述顺序进行执行。

包含三种初始化方式的 Bean：

```java
public class Bean1 implements InitializingBean {
    private static final Logger log = LoggerFactory.getLogger(Bean1.class);

    @PostConstruct
    public void init1() {
        log.debug("初始化1");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        log.debug("初始化2");
    }

    public void init3() {
        log.debug("初始化3");
    }
}
```

包含三种销毁方式的 Bean：

```java
public class Bean2 implements DisposableBean {
    private static final Logger log = LoggerFactory.getLogger(Bean2.class);

    @PreDestroy
    public void destroy1() {
        log.debug("销毁1");
    }

    @Override
    public void destroy() throws Exception {
        log.debug("销毁2");
    }

    public void destroy3() {
        log.debug("销毁3");
    }
}
```

测试：

```java
@SpringBootApplication
public class A07_1 {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(A07_1.class, args);
        context.close();
    }

    @Bean(initMethod = "init3")
    public Bean1 bean1() {
        return new Bean1();
    }

    @Bean(destroyMethod = "destroy3")
    public Bean2 bean2() {
        return new Bean2();
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707898671657-3dd6108b-910d-4a4e-8a9f-423b365c6a46.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707898659153-328468ec-fa19-4c7b-b8db-6f3330eca3f6.png)