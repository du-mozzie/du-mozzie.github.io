---
order: 5
title: 动态通知调用
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

前文的示例都是静态通知调用，无需参数绑定，执行时无需切点信息，性能较高。

相应地就有动态通知调用，它需要参数绑定，执行时还需要切点信息，性能较低。比如：

```java
@Aspect
static class MyAspect {
    /**
     * 静态通知调用，无需参数绑定，性能较高
     * 执行时无需切点信息
     */
    @Before("execution(* foo(..))")
    public void before1() {
        System.out.println("before1");
    }

    /**
     * 动态通知调用，需要参数绑定，性能较低
     * 执行时还需要切点信息
     */
    @Before("execution(* foo(..)) && args(x)")
    public void before2(int x) {
        System.out.printf("before(%d)\n", x);
    }
}
```

目标类 Target：

```java
static class Target {
    public void foo(int x) {
        System.out.printf("target foo(%d)\n", x);
    }
}
```

配置类 MyConfig：

```java
@Configuration
static class MyConfig {
    @Bean
    public AnnotationAwareAspectJAutoProxyCreator proxyCreator() {
        return new AnnotationAwareAspectJAutoProxyCreator();
    }

    @Bean
    public MyAspect myAspect() {
        return new MyAspect();
    }
}
```

编写 main() 方法，新建 Spring 容器，查找符合条件的切面，将所有通知转换成环绕通知：

```java
public static void main(String[] args) throws Throwable {
    GenericApplicationContext context = new GenericApplicationContext();
    context.registerBean(ConfigurationClassPostProcessor.class);
    context.registerBean(MyConfig.class);
    context.refresh();

    AnnotationAwareAspectJAutoProxyCreator creator = context.getBean(AnnotationAwareAspectJAutoProxyCreator.class);
    List<Advisor> list = creator.findEligibleAdvisors(Target.class, "target");

    Target target = new Target();
    ProxyFactory factory = new ProxyFactory();
    factory.setTarget(target);
    factory.addAdvisors(list);

    List<Object> interceptorList = factory.getInterceptorsAndDynamicInterceptionAdvice(Target.class.getMethod("foo", int.class), Target.class);
    for (Object o : interceptorList) {
        System.out.println(o);
    }
}
```

执行 main() 方法，控制台打印出：

```java
org.springframework.aop.interceptor.ExposeInvocationInterceptor@73e22a3d
org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@47faa49c
org.springframework.aop.framework.InterceptorAndDynamicMethodMatcher@28f2a10f
```

第一个 ExposeInvocationInterceptor 对象是 Spring 添加的环绕通知，第二个MethodBeforeAdviceInterceptor 对象是前置通知转换得到的环绕通知，那InterceptorAndDynamicMethodMatcher 对象是什么呢？

```java
class InterceptorAndDynamicMethodMatcher {

   final MethodInterceptor interceptor;

   final MethodMatcher methodMatcher;

   public InterceptorAndDynamicMethodMatcher(MethodInterceptor interceptor, MethodMatcher methodMatcher) {
      this.interceptor = interceptor;
      this.methodMatcher = methodMatcher;
   }

}
```

InterceptorAndDynamicMethodMatcher 并没有实现 MethodInterceptor 接口，它 不是一个环绕通知，对应了动态通知调用。

因此 ProxyFactory 对象的 getInterceptorsAndDynamicInterceptionAdvice() 方法返回的不仅是转换得到的环绕通知，还有对应动态通知调用的 InterceptorAndDynamicMethodMatcher 对象。

InterceptorAndDynamicMethodMatcher 对象中包含了环绕通知 interceptor 对象和切点信息 methodMatcher（前文使用过的 AspectJExpressionPointcut 也实现了 MethodMatcher 接口）。

尝试查看 InterceptorAndDynamicMethodMatcher 对象中包含的信息，但该类并未声明成 public，其成员变量也未被 public 修饰，也没提供获取的方式，但可以使用反射：

```java
public static void main(String[] args) throws Throwable {
    // --snip--

    for (Object o : interceptorList) {
        showDetail(o);
    }
}

public static void showDetail(Object o) {
    try {
        Class<?> clazz = Class.forName("org.springframework.aop.framework.InterceptorAndDynamicMethodMatcher");
        if (clazz.isInstance(o)) {
            Field methodMatcher = clazz.getDeclaredField("methodMatcher");
            methodMatcher.setAccessible(true);
            Field methodInterceptor = clazz.getDeclaredField("interceptor");
            methodInterceptor.setAccessible(true);
            System.out.println("环绕通知和切点：" + o);
            System.out.println("\t切点为：" + methodMatcher.get(o));
            System.out.println("\t通知为：" + methodInterceptor.get(o));
        } else {
            System.out.println("普通环绕通知：" + o);
        }
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}
```

运行 main() 方法后，控制台打印出：

```java
普通环绕通知：org.springframework.aop.interceptor.ExposeInvocationInterceptor@73e22a3d
普通环绕通知：org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@47faa49c
环绕通知和切点：org.springframework.aop.framework.InterceptorAndDynamicMethodMatcher@f736069
	切点为：AspectJExpressionPointcut: (int x) execution(* foo(..)) && args(x)
	通知为：org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@6da21078
```

根据打印的切点信息可知，InterceptorAndDynamicMethodMatcher 对象的确对应了动态通知调用。

最后创建调用链对象，执行通知和原始方法：

```java
public static void main(String[] args) throws Throwable {
    // --snip--

    System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>");
    Object proxy = factory.getProxy();
    MethodInvocation methodInvocation = new ReflectiveMethodInvocation(
        proxy, target, Target.class.getMethod("foo", int.class), new Object[]{100}, Target.class, interceptorList
    ) {
    };

    methodInvocation.proceed();
}
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709389362522-1cdceacf-73dd-469d-b54e-1f224322c389.png)

动态通知调用需要切点信息，需要对参数进行匹配和绑定，复杂程度高，性能比静态通知调用低。