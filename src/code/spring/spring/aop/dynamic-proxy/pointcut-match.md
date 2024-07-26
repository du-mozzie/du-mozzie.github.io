---
order: 2
title: 切点匹配
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

上一节中，选择 AspectJExpressionPointcut 作为切点的实现，判断编写的 AspectJ 表达式是否与某一方法匹配可以使用其 matches() 方法。

```java
public class PointcutMatch {

    static class Target{
        @Transactional
        public void foo(){

        }
        public void bar(){

        }
    }

    public static void main(String[] args) throws NoSuchMethodException {
        // 方法匹配
        AspectJExpressionPointcut pointcut1 = new AspectJExpressionPointcut();
        pointcut1.setExpression("execution(* bar())");
        System.out.println(pointcut1.matches(Target.class.getMethod("foo"),Target.class));
        System.out.println(pointcut1.matches(Target.class.getMethod("bar"),Target.class));

        // 注解匹配
        AspectJExpressionPointcut pointcut2 = new AspectJExpressionPointcut();
        pointcut2.setExpression("annotation(org.springframework.transaction.annotation.Transactional)");
        System.out.println(pointcut1.matches(Target.class.getMethod("foo"),Target.class));
        System.out.println(pointcut1.matches(Target.class.getMethod("bar"),Target.class));
    }
}
```

运行 main() 方法后，控制台打印出：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708526216195-ac7b0a3e-3277-432f-9d1c-ef50e147e3f2.png)

@Transactional 是 Spring 中使用频率非常高的注解，那它底层是通过 AspectJExpressionPointcut 与 @annotation() 切点表达式相结合对目标方法进行匹配的吗？

答案是否定的。@Transactional 注解除了可以作用在方法上，还可以作用在类（或接口）上。

在底层 @Transactional 注解的匹配使用到了 StaticMethodMatcherPointcut，在此模拟一下：

```java
public class PointcutMatch {

    static class Target {
        @Transactional
        public void foo() {

        }

        public void bar() {

        }
    }

    @Transactional
    static class Target2 {

        public void foo() {

        }
    }

    static class Target3 implements I1{

        @Override
        public void foo() {

        }
    }

    @Transactional
    interface I1 {
        void foo();
    }

    public static void main(String[] args) throws NoSuchMethodException {
        // spring使用 StaticMethodMatcherPointcut 接口来匹配注解
        StaticMethodMatcherPointcut pointcut = new StaticMethodMatcherPointcut() {
            @Override
            public boolean matches(Method method, Class<?> aClass) {
                // 先匹配方法
                MergedAnnotations annotations = MergedAnnotations.from(method);
                if (annotations.isPresent(Transactional.class)) {
                    return true;
                }
                /**
                 * 匹配类
                 * 默认匹配策略SearchStrategy.DIRECT, 只能匹配当前类
                 * Target3实现了I1, I1有Transactional注解无法匹配到
                 * 切换策略可以匹配到继承树
                 */
                // annotations = MergedAnnotations.from(aClass);
                annotations = MergedAnnotations.from(aClass, MergedAnnotations.SearchStrategy.TYPE_HIERARCHY);
                if (annotations.isPresent(Transactional.class)) {
                    return true;
                }
                return false;
            }
        };

        // 方法上是否存在
        System.out.println(pointcut.matches(Target.class.getMethod("foo"),
                Target.class));
        System.out.println(pointcut.matches(Target.class.getMethod("bar"),
                Target.class));
        System.out.println(pointcut.matches(Target2.class.getMethod("foo"),
                Target2.class));
        System.out.println(pointcut.matches(Target3.class.getMethod("foo"),
                Target3.class));
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708610459178-b7af391a-e2b4-45d4-8439-1bd31875429b.png)

无论是 AspectJExpressionPointcut 还是 StaticMethodMatcherPointcut，它们都实现了 MethodMatcher 接口，用来执行方法的匹配。