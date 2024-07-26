---
order: 4
title: Aware接口
date: 2021-10-04
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

## Aware接口

Aware 接口用于注入一些与容器相关的信息，比如：

- BeanNameAware 注入 Bean 的名字
- BeanFactoryAware 注入 BeanFactory 容器
- ApplicationContextAware 注入 ApplicationContext 容器
- EmbeddedValueResolverAware 解析 ${}

```java
public class MyBean implements BeanNameAware, ApplicationContextAware {

    private static final Logger log = LoggerFactory.getLogger(MyBean.class);

    @Override
    public void setBeanName(String name) {
        log.debug("当前bean " + this + " 名字叫:" + name);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        log.debug("当前bean " + this + " 容器是:" + applicationContext);
    }
}
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("myBean", MyBean.class);

    context.refresh();
    context.close();
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707877980523-3b5b79a1-7dd5-43d4-be79-2536dd622f4b.png)

## InitializingBean

```java
@Slf4j
public class MyBean implements BeanNameAware, ApplicationContextAware, InitializingBean {
    // --snip--

    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("当前 Bean: " + this + " 初始化");
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707878992152-a619d586-cbcc-45ee-b977-da10a107ed27.png)

当同时实现 Aware 接口和 InitializingBean 接口时，会先执行 Aware 接口。

BeanFactoryAware 、ApplicationContextAware 和 EmbeddedValueResolverAware 三个接口的功能可以使用 @Autowired 注解实现，InitializingBean 接口的功能也可以使用 @PostConstruct 注解实现，为什么还要使用接口呢？

@Autowired 和 @PostConstruct 注解的解析需要使用 Bean 后置处理器，属于拓展功能，而这些接口属于内置功能，不加任何拓展 Spring 就能识别。在某些情况下，拓展功能会失效，而内容功能不会失效。

```java
@Slf4j
public class MyBean implements BeanNameAware, ApplicationContextAware, InitializingBean {
   	// --snip--

    @Autowired
    public void setApplicationContextWithAutowired(ApplicationContext applicationContext) {
        log.info("当前 Bean: " + this + " 使用 @Autowired 注解，容器是: " + applicationContext);
    }

    @PostConstruct
    public void init() {
        log.info("当前 Bean: " + this + " 使用 @PostConstruct 注解初始化");
    }
}
```

再运行 main() 方法会发现使用的注解没有被成功解析，原因很简单，GenericApplicationContext 是一个干净的容器，其内部没有用于解析这些注解的后置处理器。如果想要这些注解生效，则需要像前文一样添加必要的后置处理器：

```java
context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
context.registerBean(CommonAnnotationBeanPostProcessor.class);
```

## 失效的 @Autowired 注解

在某些情况下，尽管容器中存在必要的后置处理器，但 @Autowired 和 @PostConstruct 注解也会失效。

```java
@Slf4j
@Configuration
public class MyConfig1 {
    @Autowired
    public void setApplicationContext(ApplicationContext applicationContext) {
        log.info("注入 ApplicationContext");
    }

    @PostConstruct
    public void init() {
        log.info("初始化");
    }
}
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("myConfig1", MyConfig1.class);
    context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
    context.registerBean(CommonAnnotationBeanPostProcessor.class);
    // 解析配置类中的注解
    context.registerBean(ConfigurationClassPostProcessor.class);

    context.refresh();
    context.close();
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707890960872-e1ad814c-2695-4a88-96ec-137749ec21fb.png)

@Autowired 和 @PostConstruct 注解成功被解析。

如果再对 Config1 进行一点小小的修改呢？

```java
@Slf4j
@Configuration
public class MyConfig1 {
    // --snip--

    @Bean
    public BeanFactoryPostProcessor processor1() {
        return processor -> log.info("执行 processor1");
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891037131-c0f09cc4-ef55-4896-a210-0760616211b3.png)

processor1() 方法成功生效，但 @Autowired 和 @PostConstruct 注解的解析失败了。

对于 context.refresh(); 方法来说，它主要按照以下顺序干了三件事：

1. 执行 BeanFactory 后置处理器；
2. 添加 Bean 后置处理器；
3. 创建和初始化单例对象。

比如当 Java 配置类不包括 BeanFactoryPostProcessor 时：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891130633-0b7049c8-0334-4946-a614-3629d04361b4.png)

BeanFactoryPostProcessor 会在 Java 配置类初始化之前执行。

当 Java 配置类中定义了 BeanFactoryPostProcessor 时，如果要创建配置类中的 BeanFactoryPostProcessor 就必须提前创建和初始化 Java 配置类。

在创建和初始化 Java 配置类时，由于 BeanPostProcessor 还未准备好，无法解析配置类中的 @Autowired 等注解，导致 @Autowired 等注解失效：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891168662-432b200e-7f4d-4d51-95c3-db56f64f6fea.png)

要解决这个问题也很简单，使用相关接口的功能实现注入和初始化：

```java
@Configuration
public class MyConfig2 implements InitializingBean, ApplicationContextAware {

    private static final Logger log = LoggerFactory.getLogger(MyConfig2.class);

    @Override
    public void afterPropertiesSet() throws Exception {
        log.debug("初始化");
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        log.debug("注入 ApplicationContext");
    }

    @Bean //  beanFactory 后处理器
    public BeanFactoryPostProcessor processor2() {
        return beanFactory -> {
            log.debug("执行 processor2");
        };
    }
}
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("myConfig2", MyConfig2.class);
    context.registerBean(AutowiredAnnotationBeanPostProcessor.class);
    context.registerBean(CommonAnnotationBeanPostProcessor.class);

    // 解析配置类中的注解
    context.registerBean(ConfigurationClassPostProcessor.class);

    context.refresh();
    context.close();
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891525899-12ec539f-959b-45dd-a46c-ba07c94f77ad.png)

其实在测试Config1、Config2的时候spring就给我们提示了

[INFO ] 14:10:03.081 [main] o.s.c.a.ConfigurationClassEnhancer - @Bean method MyConfig1.processor1 is non-static and returns an object assignable to Spring's BeanFactoryPostProcessor interface. This will result in a failure to process annotations such as @Autowired, @Resource and @PostConstruct within the method's declaring @Configuration class. Add the 'static' modifier to this method to avoid these container lifecycle issues; see @Bean javadoc for complete details. 

我们自定义的BeanFactoryPostProcessor跟Bean生命周期冲突了，可以将自定义的方法修改为静态方法，也能够解决这个问题，静态方法会在类加载时就被初始化

**总结：**

1. Aware 接口提供了一种 内置 的注入手段，可以注入 BeanFactory、ApplicationContext；
2. InitializingBean 接口提供了一种 内置 的初始化手段；
3. 内置的注入和初始化不受拓展功能的影响，总会被执行，因此 Spring 框架内部的类总是使用这些接口。
