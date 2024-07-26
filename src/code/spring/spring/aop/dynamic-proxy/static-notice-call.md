---
order: 4
title: 静态通知调用
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

## 统一转换成环绕通知

通知相关注解都对应一个原始通知类，在 Spring 底层会将这些通知转换成环绕通知 MethodInterceptor。如果原始通知类本就实现了 MethodInterceptor 接口，则无需转换。

| 原始通知类                  | 是否需要转换成 MethodInterceptor |
| --------------------------- | -------------------------------- |
| AspectJMethodBeforeAdvice   | ✅                                |
| AspectJAfterReturningAdvice | ✅                                |
| AspectJAfterThrowingAdvice  | ❌                                |
| AspectJAfterAdvice          | ❌                                |
| AspectJAroundAdvice         | ❌                                |

使用 ProxyFactory 无论基于哪种方式创建代理对象，最终调用 advice（通知，或者说通知对应的方法）的都是 MethodInvocation 对象。

项目中存在的 advisor（原本的低级切面和由高级切面转换得到的低级切面）往往不止一个，它们一个套一个地被调用，因此需要一个调用链对象，即 MethodInvocation。

MethodInvocation 需要知道 advice 有哪些，还需要知道目标对象是哪个。调用次序如下：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709388555931-b264228f-4387-49f6-a06f-e3bcab0ff62f.png)

由上图可知，环绕 通知最适合作为 advice，而 Before、AfterReturning 都应该转换成环绕通知。

统一转换成环绕通知的形式，体现了设计模式中的适配器模式：

- 对外更方便使用和区分各种通知类型
- 对内统一都是环绕通知，统一使用 MethodInterceptor 表示

通过 ProxyFactory 对象的 getInterceptorsAndDynamicInterceptionAdvice() 方法将其他通知统一转换为 MethodInterceptor 环绕通知：

| 注解            | 原始通知类                  | 适配器                      | 拦截器                          |
| --------------- | --------------------------- | --------------------------- | ------------------------------- |
| @Before         | AspectJMethodBeforeAdvice   | MethodBeforeAdviceAdapter   | MethodBeforeAdviceInterceptor   |
| @AfterReturning | AspectJAfterReturningAdvice | AspectJAfterReturningAdvice | AfterReturningAdviceInterceptor |

转换得到的通知都是静态通知，体现在 getInterceptorsAndDynamicInterceptionAdvice() 方法中的 Interceptors 部分，这些通知在被调用时无需再次检查切点，直接调用即可。

#### 代码测试

切面类与目标类：

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

    @AfterReturning("execution(* foo())")
    public void afterReturning() {
        System.out.println("afterReturning");
    }

    @AfterThrowing("execution(* foo())")
    public void afterThrowing(Exception e) {
        System.out.println("afterThrowing " + e.getMessage());
    }

    @Around("execution(* foo())")
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

将高级切面转换成低级切面，并将通知统一转换成环绕通知：

```java
@SuppressWarnings("all")
public static void main(String[] args) throws Throwable {

    AspectInstanceFactory factory = new SingletonAspectInstanceFactory(new Aspect());
    // 1. 高级切面转低级切面类
    List<Advisor> list = new ArrayList<>();
    for (Method method : Aspect.class.getDeclaredMethods()) {
        if (method.isAnnotationPresent(Before.class)) {
            // 解析切点
            String expression = method.getAnnotation(Before.class).value();
            AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
            pointcut.setExpression(expression);
            // 通知类
            AspectJMethodBeforeAdvice advice = new AspectJMethodBeforeAdvice(method, pointcut, factory);
            // 切面
            Advisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
            list.add(advisor);
        } else if (method.isAnnotationPresent(AfterReturning.class)) {
            // 解析切点
            String expression = method.getAnnotation(AfterReturning.class).value();
            AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
            pointcut.setExpression(expression);
            // 通知类
            AspectJAfterReturningAdvice advice = new AspectJAfterReturningAdvice(method, pointcut, factory);
            // 切面
            Advisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
            list.add(advisor);
        } else if (method.isAnnotationPresent(Around.class)) {
            // 解析切点
            String expression = method.getAnnotation(Around.class).value();
            AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
            pointcut.setExpression(expression);
            // 通知类
            AspectJAroundAdvice advice = new AspectJAroundAdvice(method, pointcut, factory);
            // 切面
            Advisor advisor = new DefaultPointcutAdvisor(pointcut, advice);
            list.add(advisor);
        }
    }
    for (Advisor advisor : list) {
        System.out.println(advisor);
    }

    // 2. 通知统一转换为环绕通知 MethodInterceptor
    Target target = new Target();
    ProxyFactory proxyFactory = new ProxyFactory();
    proxyFactory.setTarget(target);
    proxyFactory.addAdvisors(list);

    System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    List<Object> methodInterceptorList = proxyFactory.getInterceptorsAndDynamicInterceptionAdvice(Target.class.getMethod("foo"), Target.class);
    for (Object o : methodInterceptorList) {
        System.out.println(o);
    }
}
```

运行 main() 方法后，控制台打印出：

```java
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.aspectj.AspectJMethodBeforeAdvice: advice method [public void org.springframework.aop.framework.A18$Aspect.before2()]; aspect name '']
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.aspectj.AspectJAroundAdvice: advice method [public java.lang.Object org.springframework.aop.framework.A18$Aspect.around(org.aspectj.lang.ProceedingJoinPoint) throws java.lang.Throwable]; aspect name '']
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.aspectj.AspectJMethodBeforeAdvice: advice method [public void org.springframework.aop.framework.A18$Aspect.before1()]; aspect name '']
org.springframework.aop.support.DefaultPointcutAdvisor: pointcut [AspectJExpressionPointcut: () execution(* foo())]; advice [org.springframework.aop.aspectj.AspectJAfterReturningAdvice: advice method [public void org.springframework.aop.framework.A18$Aspect.afterReturning()]; aspect name '']
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@7ce6a65d
org.springframework.aop.aspectj.AspectJAroundAdvice: advice method [public java.lang.Object org.springframework.aop.framework.A18$Aspect.around(org.aspectj.lang.ProceedingJoinPoint) throws java.lang.Throwable]; aspect name ''
org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor@1500955a
org.springframework.aop.framework.adapter.AfterReturningAdviceInterceptor@e874448
```

根据打印信息可知：

- 前置通知 AspectJMethodBeforeAdvice 被转换成 MethodBeforeAdviceInterceptor
- 环绕通知 AspectJAroundAdvice 保持不变
- 后置通知 AspectJAfterReturningAdvice 被转换成 AfterReturningAdviceInterceptor

## 调用链执行

高级切面成功转换成低级切面，切面中的通知也全部转换成环绕通知 MethodInterceptor，最后还要调用这些通知和目标方法。

这个调用交由调用链对象 MethodInvocation 来完成，在调用链对象中存放了所有经过转换得到的环绕通知和目标方法。

MethodInvocation 是一个接口，其最根本的实现是 ReflectiveMethodInvocation。

构建 ReflectiveMethodInvocation 对象需要 6 个参数：

1. proxy：代理对象
2. target：目标对象
3. method：目标对象中的方法对象
4. arguments：调用目标对象中的方法需要的参数
5. targetClass：目标对象的 Class 对象
6. interceptorsAndDynamicMethodMatchers：转换得到的环绕通知列表

```java
public static void main(String[] args) throws Throwable {
	// --snip--

    System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    // 3. 创建并执行调用链 (环绕通知s + 目标)
    MethodInvocation methodInvocation = new ReflectiveMethodInvocation(
        null, target, Target.class.getMethod("foo"), new Object[0], Target.class, methodInterceptorList
    );
    methodInvocation.proceed();
}
```

运行 main() 方法后会抛出异常：

```java
Exception in thread "main" java.lang.IllegalStateException: No MethodInvocation found:
```

提示没有找到 MethodInvocation。但调用链对象不是已经创建好了吗？

这是因为调用链在执行过程会调用到很多通知，而某些通知内部可能需要使用调用链对象。因此需要将调用链对象存放在某一位置，使所有通知都能获取到调用链对象。

这个 “位置” 就是 当前线程。

那怎么将调用链对象放入当前线程呢？

可以在所有通知的最外层再添加一个环绕通知，其作用是将调用链对象放入当前线程。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709388874301-ae3cc89a-cfdd-4098-81b1-946a805b7c59.png)

可以使用 Spring 提供的 ExposeInvocationInterceptor 作为最外层的环绕通知。

```java
public static void main(String[] args) throws Throwable {
    // --snip--

    // 2. 通知统一转换为环绕通知 MethodInterceptor
    Target target = new Target();
    ProxyFactory proxyFactory = new ProxyFactory();
    proxyFactory.setTarget(target);
    // 在最外层添加环绕通知，把 MethodInvocation 放入当前线程
    proxyFactory.addAdvice(ExposeInvocationInterceptor.INSTANCE);
    proxyFactory.addAdvisors(list);

    // --snip--

    System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    // 3. 创建并执行调用链 (环绕通知s + 目标)
    MethodInvocation methodInvocation = new ReflectiveMethodInvocation(
        null, target, Target.class.getMethod("foo"), new Object[0], Target.class, methodInterceptorList
    );
    methodInvocation.proceed();
}
```

再次运行 main() 方法不再报错，控制台打印出：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709388921968-93fddb5d-5478-45da-aa4d-42a2c429e7b8.png)

## 模拟实现调用链

调用链执行过程是一个递归过程。执行 proceed() 方法将调用调用链中下一个通知或目标方法。当调用链中没有通知时，就调用目标方法，反之调用下一个通知。

这体现了设计模式中的责任链模式。

目标类 Target：

```java
static class Target {
    public void foo() {
        System.out.println("Target foo()");
    }
}
```

实现 MethodInterceptor 接口，编写两个环绕通知：

```java
static class Advice1 implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        System.out.println("Advice1.before()");
        Object result = invocation.proceed();
        System.out.println("Advice1.after()");
        return result;
    }
}

static class Advice2 implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        System.out.println("Advice2.before()");
        Object result = invocation.proceed();
        System.out.println("Advice2.after()");
        return result;
    }
}
```

实现 MethodInvocation 接口，实现自己的调用链：

```java
static class MyInvocation implements MethodInvocation {

    private final Object target;
    private final Method method;
    private final Object[] args;
    private final List<MethodInterceptor> methodInterceptorList;
    private int count = 1;

    public MyInvocation(Object target, Method method, Object[] args, List<MethodInterceptor> methodInterceptorList) {
        this.target = target;
        this.method = method;
        this.args = args;
        this.methodInterceptorList = methodInterceptorList;
    }

    @Override
    public Method getMethod() {
        return this.method;
    }

    @Override
    public Object[] getArguments() {
        return this.args;
    }

    @Override
    public Object proceed() throws Throwable {
        if (count > methodInterceptorList.size()) {
            // 调用目标，结束递归并返回
            return method.invoke(target, args);
        }
        // 逐一调用通知
        MethodInterceptor interceptor = methodInterceptorList.get(count++ - 1);
        // 递归操作交给通知类
        return interceptor.invoke(this);
    }

    @Override
    public Object getThis() {
        return this.target;
    }

    @Override
    public AccessibleObject getStaticPart() {
        return method;
    }
}
```

编写 main() 方法，执行调用链，查看控制台输出结果：

```java
public static void main(String[] args) throws Throwable {
    Target target = new Target();
    List<MethodInterceptor> list = new ArrayList<>(Arrays.asList(
            new Advice1(),
            new Advice2()
    ));
    MyInvocation invocation = new MyInvocation(target, Target.class.getMethod("foo"), new Object[0], list);
    invocation.proceed();
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709388999801-90e0c6f0-a800-4306-afe5-a4d24df9c8be.png)

## 代理对象调用流程

以 JDK 动态代理实现为例：

- 从 ProxyFactory 获得 Target 和环绕通知链，根据它们创建 MethodInvocation 对象，简称 mi
- 首次执行 mi.proceed() 后发现有下一个环绕通知，调用它的 invoke(mi)
- 进入环绕通知 1，执行前增强，再次调用 mi.proceed() 后又发现有下一个环绕通知，调用它的 invoke(mi)
- 进入环绕通知 2，执行前增强，调用 mi.proceed() 发现没有环绕通知，调用 mi.invokeJoinPoint() 执行目标方法
- 目标方法执行结束，将结果返回给环绕通知 2，执行环绕通知 2 的后增强
- 环绕通知 2 继续将结果返回给环绕通知 1，执行环绕通知 1 的后增强
- 环绕通知 1 返回最终的结果

下图中不同颜色对应一次环绕通知或目标的调用起始至终结：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709389085590-51d6e55d-8935-44a9-9ed1-5b57bb3f90df.png)