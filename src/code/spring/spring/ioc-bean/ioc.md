---
order: 1
title: 容器接口
date: 2021-10-01
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
prev: ./
---



BeanFactory与ApplicationContext

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1705927765126-ae155b94-43f7-4e4d-85ee-b32806bb9370.png)

# BeanFactory

现有如下类，尝试将 Config 添加到 Bean 工厂中：

```java
@Configuration
static class Config {
    @Bean
    public Bean1 bean1() {
        return new Bean1();
    }

    @Bean
    public Bean2 bean2() {
        return new Bean2();
    }
}

@Slf4j
static class Bean1 {
    public Bean1() {
        log.debug("构造 Bean1()");
    }

    @Autowired
    private Bean2 bean2;

    public Bean2 getBean2() {
        return bean2;
    }
}

@Slf4j
static class Bean2 {
    public Bean2() {
        log.debug("构造 Bean2()");
    }
}
```

需要使用到 BeanFactory 的一个实现类： DefaultListableBeanFactory。有了 Bean 工厂，还需要定义 Bean，之后再把定义的 Bean 注册到工厂即可。

```java
public static void main(String[] args) {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    // bean 的定义（class，scope，初始化，销毁）
    AbstractBeanDefinition beanDefinition = BeanDefinitionBuilder.genericBeanDefinition(Config.class)
            .setScope("singleton")
            .getBeanDefinition();
    beanFactory.registerBeanDefinition("config", beanDefinition);

    // 只有 config
    Arrays.stream(beanFactory.getBeanDefinitionNames()).forEach(System.out::println);
}
```

现在 Bean 工厂中 有且仅有一个 名为 config 的 Bean。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707454755907-24a8d2cf-792d-4e3a-b438-7a308e468318.png)

## 解析配置类

根据对 @Configuration 和 @Bean 两个注解的认识可知，Bean 工厂中应该还存在 bean1 和 bean2，那为什么现在没有呢？

很明显是现在的 BeanFactory 缺少了解析 @Configuration 和 @Bean 两个注解的能力。

使用**AnnotationConfigUtils**添加一些常用的后处理器

```java
AnnotationConfigUtils.registerAnnotationConfigProcessors(beanFactory);
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707454929275-1b6f3ae0-61fd-476d-914d-186e342fbc15.png)

根据打印出的信息，可以看到有一个名为 org.springframework.context.annotation.internalConfigurationAnnotationProcessor 的 Bean，根据其所含的 ConfigurationAnnotationProcessor 字样，可以知道这个 Bean 就是用来处理 @Configuration 和 @Bean 注解的，将配置类中定义的 Bean 信息补充到 BeanFactory 中。

那为什么在 Bean 工厂中依旧没有 bean1 和 bean2 呢？

现在仅仅是将处理器添加到了 Bean 工厂，还没有使用处理器。

使用处理器很简单，先获取到处理器，然后再使用即可。像 internalConfigurationAnnotationProcessor 这样的 Bean，都有一个共同的类型，名为 BeanFactoryPostProcessor，因此可以：

```java
beanFactory.getBeansOfType(BeanFactoryPostProcessor.class).values().forEach(beanFactoryPostProcessor -> {
    beanFactoryPostProcessor.postProcessBeanFactory(beanFactory);
});
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707455199668-916fb2fd-897c-40a1-8991-8108279257c4.png)

## 依赖注入

我们在bean1中使用@Autowired自动注入了bean2，打印看看

```java
System.out.println(beanFactory.getBean(Bean1.class).getBean2());
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707455426534-f1a51d73-adf8-4c7e-a4d9-69a453d58a0b.png)

发现bean2没有被注入

在先前添加到 BeanFactory 中的后处理器里，有名为 internalAutowiredAnnotationProcessor 和 internalCommonAnnotationProcessor 的两个后处理器。前者用于解析 @Autowired 注解，后者用于解析 @Resource 注解，它们都有一个共同的类型 BeanPostProcessor，我们需要使用这两个后处理器，因此可以：

```java
// Bean 后处理器, 针对 bean 的生命周期的各个阶段提供扩展, 例如 @Autowired @Resource ...
beanFactory.getBeansOfType(BeanPostProcessor.class).values().stream()
        .forEach(beanPostProcessor -> {
    beanFactory.addBeanPostProcessor(beanPostProcessor);
});
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707459394086-68c5673c-b762-4bb8-b015-a1ec26f2ca29.png)

除此之外还可以发现：当需要使用 Bean 时，Bean 才会被创建，即按需加载。那有没有什么办法预先就初始化好单例对象呢？**默认懒加载模式**

**测试前注释主动调用bean的代码，只留下添加后处理器的代码**

可以观察到日志中并没有去构造bean

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707459442484-b45002e8-b86f-4d23-8d2a-9c5d6ff8f9a4.png)

```java
// 准备好所有单例（完成依赖注入和初始化流程）
beanFactory.preInstantiateSingletons(); 
```

可以发现帮我们准备好了所有的bean实例

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707459459325-e22d09e8-7150-4327-8e1f-143150d829b6.png)

## 后处理器排序

 给最初的类信息进行补充

```java
@Configuration
static class Config {
    // --snip--

    @Bean
    public Bean3 bean3() {
        return new Bean3();
    }

    @Bean
    public Bean4 bean4() {
        return new Bean4();
    }
}

interface Inter {

}

@Slf4j
static class Bean3 implements Inter {
    public Bean3() {
        log.debug("构造 Bean3()");
    }
}

@Slf4j
static class Bean4 implements Inter {
    public Bean4() {
        log.debug("构造 Bean4()");
    }
}

@Slf4j
static class Bean1 {
    // --snip--

    @Autowired
    @Resource(name = "bean4")
    private Inter bean3;

    private Inter getInter() {
        return bean3;
    }
}
```

向 Bean 工厂中添加了 bean3 和 bean4，并且计划在 bean1 中注入 Inter 类型的 Bean。

现在 Bean 工厂中 Inter 类型的 Bean 有两个，分别是 bean3、bean4，那么会注入哪一个呢？

如果只使用 @Autowired，首先会按照类型注入，如果同种类型的 Bean 有多个，再按照变量名称注入，如果再注入失败，就报错；如果只使用 @Resource，也会采取与 @Autowired 一样的注入策略，只不过 @Resource 注解还可以指定需要注入 Bean 的 id（使用 name 属性进行指定），如果指定了需要注入 Bean 的 id，就直接按照指定的 id 进行注入，如果失败就报错。

那如果即使用 @Autowired 又使用 @Resource(name = "bean4") 呢？

```java
System.out.println(beanFactory.getBean(Bean1.class).getInter());
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707459225087-5806f76c-88e4-42f8-88f0-b78d8628a396.png)

根据打印的结果可知，@Autowired 先生效了，这是因为 internalAutowiredAnnotationProcessor 排在 internalCommonAnnotationProcessor 之前。可以查看它们的先后关系：

```java
beanFactory.getBeansOfType(BeanPostProcessor.class).values().stream()
        .forEach(beanPostProcessor -> {
    System.out.println("-----" + beanPostProcessor);
    beanFactory.addBeanPostProcessor(beanPostProcessor);
});
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707459546686-9c4d82fa-3663-43ce-b966-14686c0116e3.png)

可以看到是先添加了AutowiredAnnotationBeanPostProcessor，改变一下顺序在看一下

```java
// 加个排序
beanFactory.getBeansOfType(BeanPostProcessor.class).values().stream()
        .sorted(Objects.requireNonNull(beanFactory.getDependencyComparator()))
        .forEach(beanPostProcessor -> {
    System.out.println("-----" + beanPostProcessor);
    beanFactory.addBeanPostProcessor(beanPostProcessor);
});
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707459811666-bf9501a9-4b7d-4132-ad9e-36ea6dbdf530.png)

注入的是bean4为什么使用 beanFactory.getDependencyComparator() 后就改变了 BeanPostProcessor 的先后顺序呢？

在调用的 AnnotationConfigUtils.registerAnnotationConfigProcessors(beanFactory); 方法源码中有：

```java
public static Set<BeanDefinitionHolder> registerAnnotationConfigProcessors(
        BeanDefinitionRegistry registry, @Nullable Object source) {

    DefaultListableBeanFactory beanFactory = unwrapDefaultListableBeanFactory(registry);
    if (beanFactory != null) {
        if (!(beanFactory.getDependencyComparator() instanceof AnnotationAwareOrderComparator)) {
            // 设置比较器
            beanFactory.setDependencyComparator(AnnotationAwareOrderComparator.INSTANCE);
        }
        if (!(beanFactory.getAutowireCandidateResolver() instanceof ContextAnnotationAutowireCandidateResolver)) {
            beanFactory.setAutowireCandidateResolver(new ContextAnnotationAutowireCandidateResolver());
        }
    }
}
// AutowiredAnnotationBeanPostProcessor
private int order = Ordered.LOWEST_PRECEDENCE - 2;

// CommonAnnotationBeanPostProcessor
public CommonAnnotationBeanPostProcessor() {
    setOrder(Ordered.LOWEST_PRECEDENCE - 3);
}
```

值越小，优先级越大，就排在更前面，因此当设置了 AnnotationAwareOrderComparator 比较器后，CommonAnnotationBeanPostProcessor 排在更前面，@Resource 就先生效。

## 总结

beanFactory 不会做的事

1. 不会主动调用 BeanFactory 后处理器
2. 不会主动添加 Bean 后处理器
3. 不会主动初始化单例
4. 不会解析 beanFactory
5. 不会解析${} 与 #{}

bean 后处理器会有排序的逻辑

# ApplicationContext

## 四种经典

```java
@Slf4j
public class A02Application {

    static class Bean1 {

    }

    static class Bean2 {
        @Getter
        @Setter
        private Bean1 bean1;
    }
}
```

### ClassPathXmlApplicationContext

基于 classpath 下 xml 格式的配置文件来创建

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="bean1" class="indi.mofan.bean.a02.A02Application.Bean1"/>

    <bean id="bean2" class="indi.mofan.bean.a02.A02Application.Bean2">
        <property name="bean1" ref="bean1" />
    </bean>
</beans>
private static void testClassPathXmlApplicationContext() {
    ClassPathXmlApplicationContext context =
            new ClassPathXmlApplicationContext("a02.xml");
    
    for (String name : context.getBeanDefinitionNames()) {
        System.out.println(name);
    }

    System.out.println(context.getBean(Bean2.class).getBean1());
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707460711695-ba1b41f8-e9a0-47ec-b738-155a06b78cd3.png)

### FileSystemXmlApplicationContext

基于磁盘路径下 xml 格式的配置文件来创建

```java
private static void testFileSystemXmlApplicationContext() {
    // 使用相对路径时，以模块为起点（IDEA 中需要设置 Working directory），也支持绝对路径
    FileSystemXmlApplicationContext context =
            new FileSystemXmlApplicationContext(
                    "show\\src\\main\\resources\\a02.xml");
    for (String name : context.getBeanDefinitionNames()) {
        System.out.println(name);
    }

    System.out.println(context.getBean(Bean2.class).getBean1());
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707460940318-dfc894d8-57be-4811-befe-90e79f4932e1.png)

ClassPathXmlApplicationContext 和 FileSystemXmlApplicationContext 都依赖于从 XML 文件中读取 Bean 的信息，而这都利用了 XmlBeanDefinitionReader 进行读取。

```java
private static void testXmlBeanDefinitionReader() {
    DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
    System.out.println("读取之前...");
    for (String name : beanFactory.getBeanDefinitionNames()) {
        System.out.println(name);
    }
    System.out.println("读取之后...");
    XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(beanFactory);
    reader.loadBeanDefinitions(new FileSystemResource("show\\src\\main" +
            "\\resources\\a02.xml"));
    for (String name : beanFactory.getBeanDefinitionNames()) {
        System.out.println(name);
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707461426522-244bbe4a-883d-43db-b28f-627bb2c810cc.png)

### AnnotationConfigApplicationContext

基于 java 配置类来创建

创建配置

```java
@Configuration
static class Config {
    @Bean
    public Bean1 bean1() {
        return new Bean1();
    }

    @Bean
    public Bean2 bean2(Bean1 bean1) {
        Bean2 bean2 = new Bean2();
        bean2.setBean1(bean1);
        return bean2;
    }
}
private static void testAnnotationConfigApplicationContext() {
    AnnotationConfigApplicationContext context =
            new AnnotationConfigApplicationContext(Config.class);

    for (String name : context.getBeanDefinitionNames()) {
        System.out.println(name);
    }

    System.out.println(context.getBean(Bean2.class).getBean1());
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707461515276-b702cd71-40d3-4102-b17c-2a7c1b73f938.png)

与前面两种基于 XML 创建 ApplicationContext 的方式相比，使用 AnnotationConfigApplicationContext 后，使得容器中多了一些后置处理器相关的 Bean。

如果要在先前的两种方式中也添加上这些 Bean，可以在 XML 进行配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <bean id="bean1" class="indi.mofan.bean.a02.A02Application.Bean1"/>

    <bean id="bean2" class="indi.mofan.bean.a02.A02Application.Bean2">
        <property name="bean1" ref="bean1" />
    </bean>

    <!--  添加后置处理器  -->
    <context:annotation-config />
</beans>
```

### AnnotationConfigServletWebServerApplicationContext

基于 java 配置类来创建, 用于 web 环境

创建配置

```java
@Configuration
static class WebConfig {
    @Bean
    public ServletWebServerFactory servletWebServerFactory(){
        return new TomcatServletWebServerFactory();
    }
    @Bean
    public DispatcherServlet dispatcherServlet() {
        return new DispatcherServlet();
    }
    @Bean
    public DispatcherServletRegistrationBean registrationBean(DispatcherServlet dispatcherServlet) {
        return new DispatcherServletRegistrationBean(dispatcherServlet, "/");
    }
    @Bean("/hello")
    public Controller controller1() {
        return (request, response) -> {
            response.getWriter().print("hello");
            return null;
        };
    }
}
private static void testAnnotationConfigServletWebServerApplicationContext() {
    AnnotationConfigServletWebServerApplicationContext context =
            new AnnotationConfigServletWebServerApplicationContext(WebConfig.class);
}
```

可以看到AnnotationConfigServletWebServerApplicationContext帮我们创建了一个web容器

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707461744473-ff6aa430-abd8-40b9-b814-e09f3eec9eba.png)

运行代码，在浏览器中访问 http://localhost:8080/hello 路径则会显示出 hello 字样：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707461672003-eb2e563a-b0b3-464a-add8-40fc61abfcd7.png)

## ApplicationContext 接口体系

```java
public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory, MessageSource, ApplicationEventPublisher, ResourcePatternResolver {
    // --snip--
}
```

ApplicationContext间接继承了BeanFactory接口，并且扩展了功能

1. EnvironmentCapable：获取环境变量
2. ListableBeanFactory：提供了获取某种类型的Bean集合的能力
3. HierarchicalBeanFactory：提供了获取父容器的能力
4. MessageSource：提供了对国际化信息进行处理的能力
5. ApplicationEventPublisher：提供了事件发布能力
6. ResourcePatternResolver：提供了通过通配符获取多个资源的能力

虽然 ApplicationContext 继承了很多接口，但这些能力的实现是通过一种委派（Delegate）的方式实现的，这种方式也被叫做委派模式，但它并不属于 GoF 的 23 种设计模式中的一种，是一种面向对象的设计模式。什么是委派呢？

```java
public class MyApplicationContext implements ApplicationContext {

    private final ResourcePatternResolver resourcePatternResolver = new PathMatchingResourcePatternResolver();

    @Override
    public Resource[] getResources(String locationPattern) throws IOException {
        return resourcePatternResolver.getResources(locationPattern);
    }

    // --snip--

}
```

实现获取资源的方式并不是由实现类自身完成，而是交给其内部的一个成员变量完成，这样的方式就是委派（这和对象适配器模式很相似）。

在日常编码遇到这样的实现逻辑时，类名可以以 Delegate 结尾。

ConfigurableApplicationContext

ApplicationContext 有一个子接口 ConfigurableApplicationContext，从类名就可以看出，它提供了对 ApplicationContext 进行配置的能力，浏览其内部方法可知，提供了诸如设置父容器、设置 Environment 等能力。

AbstractApplicationContext

ApplicationContext 有一个非常重要的抽象实现 AbstractApplicationContext，其他具体实现都会继承这个抽象实现，在其内部通过委派的方式实现了一些接口的能力，除此之外还有一个与 Spring Bean 的生命周期息息相关的方法：refresh()。

# BeanFactory 接口体系

BeanFactory 其实就是 Spring IoC 容器，它本身是一个接口，提供了一系列获取 Bean 的方式。

基于它也有众多子接口：

- ListableBeanFactory：提供获取 Bean 集合的能力，比如一个接口可能有多个实现，通过该接口下的方法就能获取某种类型的所有 Bean；
- HierarchicalBeanFactory：Hierarchical 意为 “层次化”，通常表示一种具有层级结构的概念或组织方式，这种层次化结构可以通过父子关系来表示对象之间的关联，比如树、图、文件系统、组织架构等。根据该接口下的方法可知，能够获取到父容器，说明 BeanFactory 有父子容器概念；
- AutowireCapableBeanFactory：提供了创建 Bean、自动装配 Bean、属性填充、Bean 初始化、依赖注入等能力，比如 @Autowired 注解的底层实现就依赖于该接口的 resolveDependency() 方法；
- ConfigurableBeanFactory：该接口并未直接继承至 BeanFactory，而是继承了 HierarchicalBeanFactory。Configurable 意为 “可配置的”，就是说该接口用于对 BeanFactory 进行一些配置，比如设置类型转换器。

# 读取 BeanDefinition

BeanDefinition 也是一个接口，它封装了 Bean 的定义，Spring 根据 Bean 的定义，就能创建出符合要求的 Bean。

读取 BeanDefinition 可以通过下列两种类完成：

- BeanDefinitionReader
- ClassPathBeanDefinitionScanner

### BeanDefinitionReader

该接口中对 loadBeanDefinitions() 方法进行了多种重载，支持传入一个或多个 Resource 对象、资源位置来加载 BeanDefinition。

它有一系列相关实现，比如：

- XmlBeanDefinitionReader：通过读取 XML 文件来加载；
- PropertiesBeanDefinitionReader：通过读取 properties 文件来加载，此类已经被 @Deprecated 注解标记；

除此之外，还有一个 AnnotatedBeanDefinitionReader，尽管它并不是 BeanDefinition 的子类，但它们俩长得很像，根据其类注释可知：它能够通过编程的方式对 Bean 进行注册，是 ClassPathBeanDefinitionScanner 的替代方案，能读取通过注解定义的 Bean。

### ClassPathBeanDefinitionScanner

通过扫描指定包路径下的 @Component 及其派生注解来注册 Bean，是 @ComponentScan 注解的底层实现。

比如 MyBatis 通过继承 ClassPathBeanDefinitionScanner 实现通过 @MapperScan 注解来扫描指定包下的 Mapper 接口。

### BeanDefinitionRegistry

AnnotatedBeanDefinitionReader 和 ClassPathBeanDefinitionScanner 中都有一个 BeanDefinitionRegistry 类型的成员变量，它是一个接口，提供了 BeanDefinition 的增加、删除和查找功能。

### 注册与获取 Bean

根据前面的补充，现在可以这样注册并获取 Bean：

```java
public class DefaultListableBeanFactoryTest {
    static class MyBean {
    }

    public static void main(String[] args) {
        // 既实现了 BeanFactory，又实现了 BeanDefinitionRegistry
        DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
        // ClassPathBeanDefinitionScanner 的一种替代，编程式显式注册 bean
        AnnotatedBeanDefinitionReader reader = new AnnotatedBeanDefinitionReader(beanFactory);
        reader.registerBean(MyBean.class);
        MyBean bean = beanFactory.getBean(MyBean.class);
        System.out.println(bean);
    }
}
```
