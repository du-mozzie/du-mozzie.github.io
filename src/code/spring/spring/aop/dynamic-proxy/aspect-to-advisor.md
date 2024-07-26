---
order: 3
title: 从 @Aspect 到 Advisor
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

# AnnotationAwareAspectJAutoProxyCreator

讲解之前，准备一下类：

两个目标类

- 一个使用 @Aspect 的高级切面
- 一个利用配置类实现的低级切面 Advisor

```java
static class Target1 {
    public void foo() {
        System.out.println("target1 foo");
    }
}

static class Target2 {
    public void bar() {
        System.out.println("target2 bar");
    }
}

/**
 * 高级切面
 */
@Aspect
static class Aspect1 {
    @Before("execution(* foo())")
    public void before() {
        System.out.println("aspect1 before...");
    }

    @After("execution(* foo())")
    public void after() {
        System.out.println("aspect1 after...");
    }
}

@Configuration
static class Config {
    /**
     * 低级切面，由一个切点和一个通知组成
     */
    @Bean
    public Advisor advisor3(MethodInterceptor advice3) {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        pointcut.setExpression("execution(* foo())");
        return new DefaultPointcutAdvisor(pointcut, advice3);
    }

    @Bean
    public MethodInterceptor advices() {
        return invocation -> {
            System.out.println("advice3 before...");
            Object result = invocation.proceed();
            System.out.println("advice3 after...");
            return result;
        };
    }
}
```

编写 main() 方法创建 Spring 容器，并添加必要的 Bean：

```java
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("aspect1", Aspect1.class);
    context.registerBean("config", Config.class);
    context.registerBean(ConfigurationClassPostProcessor.class);

    context.refresh();
    for (String name : context.getBeanDefinitionNames()) {
        System.out.println(name);
    }
    context.close();
}
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709130744894-cd397b64-ef10-4d2d-835a-5d6037b63112.png)

Spring 中存在一个名为 AnnotationAwareAspectJAutoProxyCreator 的 Bean 后置处理器，尽管它的名称中没有 BeanPostProcessor 的字样，但它确实是实现了 BeanPostProcessor 接口的。

AnnotationAwareAspectJAutoProxyCreator 有两个主要作用：

1. 找到容器中所有的切面，针对高级切面，将其转换为低级切面；
2. 根据切面信息，利用 ProxyFactory 创建代理对象。

AnnotationAwareAspectJAutoProxyCreator 实现了 BeanPostProcessor，可以在 Bean 生命周期中的一些阶段对 Bean 进行拓展。AnnotationAwareAspectJAutoProxyCreator 可以在 Bean 进行 依赖注入之前、Bean 初始化之后 对 Bean 进行拓展。

重点介绍 AnnotationAwareAspectJAutoProxyCreator 中的两个方法：

- findEligibleAdvisors()：位于父类 AbstractAdvisorAutoProxyCreator 中，用于找到符合条件的切面类。低级切面直接添加，高级切面转换为低级切面再添加。
- wrapIfNecessary()：位于父类 AbstractAutoProxyCreator 中，用于将有资格被代理的 Bean 进行包装，即创建代理对象。

## findEligibleAdvisors() 方法

findEligibleAdvisors() 方法接收两个参数：

- beanClass：配合切面使用的目标类 Class 信息
- beanName：当前被代理的 Bean 的名称

修改 main() 方法，向容器中添加 AnnotationAwareAspectJAutoProxyCreator 后置处理器，测试 findEligibleAdvisors() 方法：

```java
public static void main(String[] args) {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean("aspect1", Aspect1.class);
    context.registerBean("config", Config.class);
    context.registerBean(ConfigurationClassPostProcessor.class);

    context.registerBean(AnnotationAwareAspectJAutoProxyCreator.class);

    context.refresh();

    // 测试 findEligibleAdvisors 方法
    AnnotationAwareAspectJAutoProxyCreator creator = context.getBean(AnnotationAwareAspectJAutoProxyCreator.class);
    // 获取能够配合 Target1 使用的切面
    List<Advisor> advisors = creator.findEligibleAdvisors(Target1.class, "target1");
    advisors.forEach(System.out::println);

    context.close();
}
org.springframework.aop.interceptor.ExposeInvocationInterceptor.ADVISOR
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.framework.autoproxy.A17$Config$$Lambda$56/802243390@7bd4937b]
InstantiationModelAwarePointcutAdvisor: expression [execution(* foo())]; advice method [public void org.springframework.aop.framework.autoproxy.A17$Aspect1.before()]; perClauseKind=SINGLETON
InstantiationModelAwarePointcutAdvisor: expression [execution(* foo())]; advice method [public void org.springframework.aop.framework.autoproxy.A17$Aspect1.after()]; perClauseKind=SINGLETON
```

打印出 4 个能配合 Target1 使用的切面信息，其中：

1. 第一个切面 ExposeInvocationInterceptor.ADVISOR 是 Spring 为每个代理对象都会添加的切面；
2. 第二个切面 DefaultPointcutAdvisor 是自行编写的低级切面；
3. 第三个和第四个切面 InstantiationModelAwarePointcutAdvisor 是由高级切面转换得到的两个低级切面。

若按照 creator.findEligibleAdvisors(Target2.class, "target2") 的方式进行调用，控制台不会打印出任何信息，因为没有任何切面能够配合 Target2 使用。

## wrapIfNecessary() 方法

wrapIfNecessary() 方法内部调用了 findEligibleAdvisors() 方法，若 findEligibleAdvisors() 方法返回的集合不为空，则表示需要创建代理对象。

如果需要创建对象，wrapIfNecessary() 方法返回的是代理对象，否则仍然是原对象。

wrapIfNecessary() 方法接收三个参数：

- bean：原始 Bean 实例
- beanName：Bean 的名称
- cacheKey：用于元数据访问的缓存 key

```java
public static void main(String[] args) {
    // --snip--

    Object o1 = creator.wrapIfNecessary(new Target1(), "target1", "target1");
    System.out.println(o1.getClass());
    Object o2 = creator.wrapIfNecessary(new Target2(), "target2", "target2");
    System.out.println(o2.getClass());

    context.close();
}
class org.springframework.aop.framework.autoproxy.A17$Target1$$EnhancerBySpringCGLIB$$634976f6
class org.springframework.aop.framework.autoproxy.A17$Target2
```

Target1 对象是被代理的，而 Target2 依旧是原对象。

如果将 o1 转换为 Target1，并调用 foo() 方法，foo() 方法将被增强：

```java
public static void main(String[] args) {
    // --snip--

    ((Target1) o1).foo();
    
    context.close();
}
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709130934275-aeefadf8-9b70-41a1-a0af-cb92666d4389.png)

# 切面的顺序控制

根据上述打印的信息可知，低级切面相比于高级切面先一步被执行，这个执行顺序是可以被控制的。

针对高级切面来说，可以在类上使用 @Order 注解，比如：

```java
@Aspect
@Order(1)
static class Aspect1 {
    @Before("execution(* foo())")
    public void before() {
        System.out.println("aspect1 before...");
    }

    @After("execution(* foo())")
    public void after() {
        System.out.println("aspect1 after...");
    }
}
```

在高级切面中，@Order 只有放在类上才生效，放在方法上不会生效。比如高级切面中有多个前置通知，这些前置通知对应的方法上使用 @Order 注解是无法生效的。

针对低级切面，需要设置 advisor 的 order 值，而不是向高级切面那样使用 @Order 注解，使用 @Order 注解设置在 advisor3() 方法上是无用的：

```java
@Configuration
static class Config {
    /**
     * 低级切面，由一个切点和一个通知组成
     */
    @Bean
    public Advisor advisor3(MethodInterceptor advice3) {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        pointcut.setExpression("execution(* foo())");
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, advice3);
        // 设置切面执行顺序
        advisor.setOrder(2);
        return advisor;
    }

    // --snip--
}
```

设置完成后，高级切面的执行优先级高于低级切面。执行 main() 方法验证执行顺序是否改变：![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709131001793-ef866880-8286-4a5e-94a8-5224fb416473.png)

# 代理对象创建时机

使用 AnnotationAwareAspectJAutoProxyCreator Bean 后置处理器创建代理对象的时机有以下两个选择：

- Bean 的依赖注入之前
- Bean 初始化完成之后

这两个时机二选一，不会重复创建代理对象。

以下述代码为例，查看代理对象的创建时机：

```java
package org.springframework.aop.framework.autoproxy;

/**
 * @author mofan
 * @date 2023/1/20 22:13
 */
public class A17_1 {
    public static void main(String[] args) {
        GenericApplicationContext context = new GenericApplicationContext();
        context.registerBean(ConfigurationClassPostProcessor.class);
        context.registerBean(Config.class);
        context.refresh();
        context.close();
        // 创建 -> (*) 依赖注入 -> 初始化 (*)

    }

    @Configuration
    static class Config {
        /**
         * 解析 @AspectJ 注解，产生代理
         */
        @Bean
        public AnnotationAwareAspectJAutoProxyCreator annotationAwareAspectJAutoProxyCreator() {
            return new AnnotationAwareAspectJAutoProxyCreator();
        }

        /**
         * 解析 @Autowired
         */
        @Bean
        public AutowiredAnnotationBeanPostProcessor autowiredAnnotationBeanPostProcessor() {
            return new AutowiredAnnotationBeanPostProcessor();
        }

        /**
         * 解析 @PostConstruct
         */
        @Bean
        public CommonAnnotationBeanPostProcessor commonAnnotationBeanPostProcessor() {
            return new CommonAnnotationBeanPostProcessor();
        }

        @Bean
        public Advisor advisor(MethodInterceptor advice) {
            AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
            pointcut.setExpression("execution(* foo())");
            return new DefaultPointcutAdvisor(pointcut, advice);
        }

        @Bean
        public MethodInterceptor advice() {
            return invocation -> {
                System.out.println("before...");
                return invocation.proceed();
            };
        }

        @Bean
        public Bean1 bean1() {
            return new Bean1();
        }

        @Bean
        public Bean2 bean2() {
            return new Bean2();
        }
    }

    static class Bean1 {
        public void foo() {}
        public Bean1() {
            System.out.println("Bean1()");
        }
        @PostConstruct
        public void init() {
            System.out.println("Bean1 init()");
        }
    }

    static class Bean2 {
        public Bean2() {
            System.out.println("Bean2()");
        }
        @Autowired
        public void setBean1(Bean1 bean1) {
            System.out.println("Bean2 setBean1(bean1) class is: " + bean1.getClass());
        }
        @PostConstruct
        public void init() {
            System.out.println("Bean2 init()");
        }
    }
}
```

其中 bean2 中注入了 bean1。运行 main() 方法后，控制台打印出：

```java
Bean1()
Bean1 init()
Creating implicit proxy for bean 'bean1' with 0 common interceptors and 2 specific interceptors 
Bean2()
Bean2 setBean1(bean1) class is: class org.springframework.aop.framework.autoproxy.A17_1$Bean1$$EnhancerBySpringCGLIB$$b7d6405
Bean2 init()
```

在 bean1 初始化完成后，额外打印了一句日志信息：

```java
Creating implicit proxy for bean 'bean1' with 0 common interceptors and 2 specific interceptors
```

表示为 bean1 创建了隐式代理。

**此时代理对象在 Bean 初始化完成之后创建。**

之后为 bean2 进行依赖注入时，注入的 bean1 是代理对象。

在 Bean1 类中添加 setBean2() 方法，表示向 bean1 中注入 bean2，此时 bean1 依赖 bean2，而 bean2 原本就依赖了 bean1，出现循环依赖：

```java
static class Bean1 {
    public void foo() {}
    public Bean1() {
        System.out.println("Bean1()");
    }
    @Autowired
    public void setBean2(Bean2 bean2) {
        System.out.println("Bean1 setBean2(bean2) class is: " + bean2.getClass());
    }
    @PostConstruct
    public void init() {
        System.out.println("Bean1 init()");
    }
}
```

再次运行 main() 方法，查看 bean1 的代理对象的生成时机：

```java
Bean1()
Bean2()
Creating implicit proxy for bean 'bean1' with 0 common interceptors and 2 specific interceptors 
Bean2 setBean1(bean1) class is: class org.springframework.aop.framework.autoproxy.A17_1$Bean1$$EnhancerBySpringCGLIB$$5cff48bf
Bean2 init()
Bean1 setBean2(bean2) class is: class org.springframework.aop.framework.autoproxy.A17_1$Bean2
Bean1 init()
```

1. 首先进行 bean1 的实例化，然后进行 bean1 的依赖注入，但此时容器中并没有 bean2，因此需要进行 bean2 的实例化。
2. 接下来进行 bean2 的依赖注入，向 bean2 中注入 bean1，注入的 bean1 应该是被增强的，即它的代理对象，因此创建 bean1 的代理对象后再完成 bean2 的依赖注入。
3. 接着继续 bean2 的生命周期，完成 bean2 的初始化阶段，最后回到 bean1 的依赖注入阶段，向 bean1 中注入 bean2，最后完成 bean1 的初始化阶段。

总结

代理对象的创建时机：

- 无循环依赖时，在 Bean 初始化阶段之后创建；
- 有循环依赖时，在 Bean 实例化后、依赖注入之前创建，并将代理对象暂存于二级缓存。
- Bean 的依赖注入阶段和初始化阶段不应该被增强，仍应被施加于原始对象。

# 高级切面转低级切面

调用 AnnotationAwareAspectJAutoProxyCreator 对象的 findEligibleAdvisors() 方法时，获取能配合目标 Class 使用的切面，最终返回 Advisor 列表。在搜索过程中，如果遇到高级切面，则会将其转换成低级切面。

现有切面类与目标类信息如下：

```java
static class Aspect {
    @Before("execution(* foo())")
    public void before1() {
        System.out.println("before1");
    }

    @Before("execution(* foo())")
    public void before2() {
        System.out.println("before2");
    }

    public void after() {
        System.out.println("after");
    }

    public void afterReturning() {
        System.out.println("afterReturning");
    }

    public void afterThrowing() {
        System.out.println("afterThrowing");
    }

    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        try {
            System.out.println("around...before");
            return pjp.proceed();
        } finally {
            System.out.println("around...after");
        }
    }
}

static class Target {
    public void foo() {
        System.out.println("target foo");
    }
}
```

高级切面中与通知类型相关的常用注解有 5 个：

- @Before：前置通知
- @AfterReturning：后置通知
- @AfterThrowing：异常通知
- @After：最终通知
- @Around：环绕通知

以解析 @Before 注解为例：

```java
public static void main(String[] args) throws Throwable {
    // 切面对象实例工厂，用于后续反射调用切面中的方法
    AspectInstanceFactory factory = new SingletonAspectInstanceFactory(new Aspect());
    // 高级切面转低级切面类
    List<Advisor> list = new ArrayList<>();
    for (Method method : Aspect.class.getDeclaredMethods()) {
        if (method.isAnnotationPresent(Before.class)) {
            // 解析切点
            String expression = method.getAnnotation(Before.class).value();
            AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
            pointcut.setExpression(expression);
            // 通知类。前置通知对应的通知类是 AspectJMethodBeforeAdvice
            AspectJMethodBeforeAdvice advice = new AspectJMethodBeforeAdvice(method, pointcut, factory);
            // 切面
            Advisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
            list.add(advisor);
        }
    }
    for (Advisor advisor : list) {
        System.out.println(advisor);
    }
}
```

运行 main() 方法，控制台打印出：

```java
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.aspectj.AspectJMethodBeforeAdvice: advice method [public void org.springframework.aop.framework.autoproxy.A17_2$Aspect.before1()]; aspect name '']
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.aspectj.AspectJMethodBeforeAdvice: advice method [public void org.springframework.aop.framework.autoproxy.A17_2$Aspect.before2()]; aspect name '']
```

@Before 标记的前置通知会被转换成原始的 AspectJMethodBeforeAdvice 形式，该对象包含了以下信息：

- 通知对应的方法信息
- 切点信息
- 通知对象如何创建，本例公用一个 Aspect 对象

通知相关注解与原始通知类对应关系如下：

| 注解            | 对应的原始通知类            |
| --------------- | --------------------------- |
| @Before         | AspectJMethodBeforeAdvice   |
| @AfterReturning | AspectJAfterReturningAdvice |
| @AfterThrowing  | AspectJAfterThrowingAdvice  |
| @After          | AspectJAfterAdvice          |
| @Around         | AspectJAroundAdvice         |