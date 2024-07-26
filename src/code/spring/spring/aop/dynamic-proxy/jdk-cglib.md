---
order: 1
title: JDK 和 CGLib 的统一
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
prev: ./
---

## advisor

切面有 aspect 和 advisor 两个概念，aspect 是多组通知（advice）和切点（pointcut）的组合，也是实际编码时使用的，advisor 则是更细粒度的切面，仅包含一个通知和切点，aspect 在生效之前会被拆解成多个 advisor。

Spring 中对切点、通知、切面的抽象如下：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708439856791-31385206-2a33-4085-9202-2d5de36459f8.png)

- 切点：即 Pointcut，其典型实现是 AspectJExpressionPointcut
- 通知：即 Advice，其典型子类接口为 MethodInterceptor，表示环绕通知
- 切面：即 Advisor，仅包含一个切点和通知

本节将重点介绍 advisor 切面。

## 切面与代理对象的创建

通过以下四步创建切面和代理：

1. 备好切点
2. 备好通知
3. 备好切面
4. 创建代理

在 Spring 中，切点通过接口 org.springframework.aop.Pointcut 来表示：

```java
public interface Pointcut {

	/**
	 * 根据类型过滤
	 */
	ClassFilter getClassFilter();

	/**
	 * 根据方法匹配
	 */
	MethodMatcher getMethodMatcher();


	/**
	 * Canonical Pointcut instance that always matches.
	 */
	Pointcut TRUE = TruePointcut.INSTANCE;

}
```

Pointcut 接口有很多实现类，比如：

- AnnotationMatchingPointcut：通过注解进行匹配
- AspectJExpressionPointcut：通过 AspectJ 表达式进行匹配（本节的选择）

在 Spring 中，通知的表示也有很多接口，在此介绍最基本、最重要的接口 org.aopalliance.intercept.MethodInterceptor，这个接口实现的通知属于环绕通知。

在 Spring 中，切面的实现也有很多，在此选择 DefaultPointcutAdvisor，创建这种切面时，传递一个节点和通知。

最后创建代理对象时，无需显式实现 JDK 动态代理或 CGLib 动态代理，Spring 提供了名为 ProxyFactory 的工厂，其内部通过不同的情况选择不同的代理实现，更方便地创建代理对象。

**AspectJ 表达式：**

```java
execution([访问控制权限修饰符] 返回值类型 [全限定类名]方法名(形式参数列表) [异常])
<dependencies>
	<dependency>
		<groupId>org.springframework</groupId>
		<artifactId>spring-aop</artifactId>
		<version>5.1.4.RELEASE</version>
	</dependency>
	<dependency>
		<groupId>org.aspectj</groupId>
		<artifactId>aspectjweaver</artifactId>
		<version>1.9.7</version>
	</dependency>
</dependencies>
package com.du.proxy.aop;

import org.aopalliance.intercept.MethodInterceptor;
import org.springframework.aop.aspectj.AspectJExpressionPointcut;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.aop.support.DefaultPointcutAdvisor;

/**
 * @author : Du
 * @date : [2024/2/21 7:37]
 */
public class Test1 {

    interface T1 {
        void foo();

        void bar();
    }

    static class Target implements T1{

        @Override
        public void foo() {
            System.out.println("target foo");
        }

        @Override
        public void bar() {
            System.out.println("target bar");
        }
    }

    /*
     * 两个切面概念：
     *  aspect =
     *          通知 1 （advice） + 切点 1（pointcut）
     *          通知 2 （advice） + 切点 2（pointcut）
     *          通知 3 （advice） + 切点 3（pointcut）
     *          ...
     *
     * advisor = 更细粒度的切面，包含一个通知和切点
     * */
    public static void main(String[] args) {
        // 1.备好切点 AspectJ表达式
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        // execution([访问控制权限修饰符] 返回值类型 [全限定类名]方法名(形式参数列表) [异常])
        pointcut.setExpression("execution(* com.du.proxy.aop.*.*.*foo())");
        // 2.备好通知
        MethodInterceptor methodInterceptor = methodInvocation -> {
            System.out.println("before...");
            // 使用methodInvocation执行被代理方法
            Object result = methodInvocation.proceed();
            System.out.println("after...");
            return result;
        };
        // 3.备好切面
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut,
                methodInterceptor);
        // 4.创建代理
        // 目标
        Target target = new Target();
        ProxyFactory proxyFactory = new ProxyFactory();
        proxyFactory.setTarget(target);
        proxyFactory.addAdvisor(advisor);
        T1 proxy = (T1) proxyFactory.getProxy();
        System.out.println(proxy.getClass());
        proxy.foo();
        proxy.bar();
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708480620419-f7746c1f-920d-46b9-96e1-62433aaefcf1.png)

foo() 方法被增强，但 bar() 并没有，并且选择了 CGLib 动态代理作为代理的实现。

Spring 是根据什么信息来选择不同的动态代理实现呢？

ProxyFactory 的父类 ProxyConfig 中有个名为 proxyTargetClass 的布尔类型成员变量：

- 当 proxyTargetClass == false，并且目标对象所在类实现了接口时，将选择 JDK 动态代理；
- 当 proxyTargetClass == false，但目标对象所在类未实现接口时，将选择 CGLib 动态代理；
- 当 proxyTargetClass == true，总是选择 CGLib 动态代理。

上文中的 target 对象的所在类 Targer1 实现了 I1 接口，最终为什么依旧选择了 CGLib 动态代理作为代理类的创建方式呢？

这是因为并没有显式的设置这是 target 对象的实现类，Spring 认为其并未实现接口。

设置 proxyFactory 对象的 interfaces 信息：

```java
// 需要在获取代理对象前显示设置
proxyFactory.setInterfaces(target.getClass().getInterfaces());
T1 proxy = (T1) proxyFactory.getProxy();
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708519032945-bc3f0f43-39a6-4629-a768-926a673baed5.png)

此时选择的动态代理实现方式是 JDK 动态代理。

再设置 factory 对象的 proxyTargetClass 为 true：

```java
proxyFactory.setProxyTargetClass(true);
```

运行 main() 方法后，控制台打印出以下内容，选择 CGLib 动态代理作为动态代理的实现方式：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708519116428-ae958d9f-e9ea-4c77-9fa8-651721d731ac.png)再将 proxyTargetClass 的值修改回 false，并修改目标对象的所在类为 Target2，Target2 并未实现任何接口：

```java
public static void main(String[] args) {
    // --snip--
    
    // 4. 创建代理
    Target2 target = new Target2();
    ProxyFactory factory = new ProxyFactory();
    factory.setTarget(target);
    factory.addAdvisor(advisor);
    factory.setInterfaces(target.getClass().getInterfaces());
    factory.setProxyTargetClass(false);

    Target2 proxy = (Target2) factory.getProxy();
    System.out.println(proxy.getClass());
    proxy.foo();
    proxy.bar();
}
```

运行 main() 方法后，控制台打印出以下内容，依旧选择 CGLib 动态代理作为动态代理的实现方式：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708519183949-3d5612dd-f7e4-4c6f-a00c-63a4addd5a44.png)

ProxyFactory 是用来创建代理的核心实现，使用 AopProxyFactory 选择具体的代理实现：

- JdkDynamicAopProxy
- ObjenesisCglibAopProxy

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708519227967-f6ca7e3e-a2d5-4912-93ed-e5da7ab96b33.png)

AopProxyFactory 根据 proxyTargetClass 等设置选择 AopProxy 实现，AopProxy 通过 getProxy() 方法创建代理对象。

上述类图中的类与接口都实现了 Advised 接口，能够获得关联的切面集合与目标（实际上是从 ProxyFactory 中获取的）。

调用代理方法时，会借助 ProxyFactory 统一将通知转换为环绕通知 MethodInterceptor。
