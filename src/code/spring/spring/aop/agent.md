---
order: 2
title: Agent 类加载
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

重新创建一个 SpringBoot 项目，同样需要导入 AOP 相关的依赖。

一个 Service 类：

```java
@Service
public class MyService {

    private static final Logger log = LoggerFactory.getLogger(MyService.class);

    final public void foo() {
        log.debug("foo()");
        this.bar();
    }

    public void bar() {
        log.debug("bar()");
    }
}
```

一个切面类，注意这个切面类没有被 Spring 管理：

```java
@Aspect // ⬅️注意此切面并未被 Spring 管理
public class MyAspect {

    private static final Logger log = LoggerFactory.getLogger(MyAspect.class);

    @Before("execution(* com.itheima.service.MyService.*())")
    public void before() {
        log.debug("before()");
    }
}
```

测试类

```java
/*
    注意几点
    1. 版本选择了 java 8, 因为目前的 aspectj-maven-plugin 1.14.0 最高只支持到 java 16
    2. 运行时需要在 VM options 里加入 -javaagent:E:\Environment\apache-maven-3.6.3\repository\org\aspectj\aspectjweaver\1.9.7\aspectjweaver-1.9.7.jar
        把其中 E:\Environment\apache-maven-3.6.3\repository 改为你自己 maven 仓库起始地址
 */
@SpringBootApplication
public class A10 {

    private static final Logger log = LoggerFactory.getLogger(A10.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(A10.class, args);
        MyService service = context.getBean(MyService.class);

        // ⬇️MyService 并非代理, 但 foo 方法也被增强了, 做增强的 java agent, 在加载类时, 修改了 class 字节码
        log.debug("service class: {}", service.getClass());
        service.foo();
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069550686-8c69a850-8a19-4c93-bedd-87b5bea293be.png)

能够看到我们的MyService也被增强了

怎么增强的？

1. 在 resources 目录下新建 META-INF 文件夹，并在 META-INF 目录下新建 aop.xml 文件，其内容如下：

```xml
<aspectj>
    <aspects>
        <aspect name="com.itheima.aop.MyAspect"/>
        <weaver options="-verbose -showWeaveInfo">
            <include within="com.itheima.service.MyService"/>
            <include within="com.itheima.aop.MyAspect"/>
        </weaver>
    </aspects>
</aspectj>
```

1. 添加VM options

```plain
-javaagent:E:\Environment\apache-maven-3.6.3\repository\org\aspectj\aspectjweaver\1.9.7\aspectjweaver-1.9.7.jar
```

其中的 E:\Environment\apache-maven-3.6.3\repository 指本地 Maven 仓库地址，还需要确保本地仓库中存在 1.9.7 版本的 aspectjweaver，否则修改至对应版本。

控制台输出的信息就和前文的内容一样了。

从输出的内容可以看到 service.getClass() 打印出的信息也是原始类的 Class 信息，而非代理类的 Class 信息。因此不依赖 Spring 容器，直接 new 一个 MyService 实例并调用其 foo() 方法也能达到增强的目的。

如果查看 MyService 对应的 class 文件，会发现其内容并没有被修改，可以断定不是编译时增强，这里是在类加载时增强。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069581725-53f6eda2-a7d6-4d06-9da0-0a76a5067da3.png)

类加载阶段增强

要证明agent是在类加载阶段增强的，我们可以使用阿里的工具，下载地址：[arthas](https://arthas.aliyun.com/doc/download.html)

启动arthas-boot.jar，选择我们的应用

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069791456-24a0eb3f-7c09-4737-9b6c-2861c8ac9859.png)

使用jad工具进行反编译

```bash
jad com.itheima.service.MyService
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069929692-eb786143-345b-47fd-b6fd-691c0af64916.png)

可以看到 foo() 和 bar() 方法的第一行都被增加了一行代码，也就是这行代码对这两个方法实现了增强。

不仅如此，如果使用代理实现增强，被调用的 bar() 方法不会被成功增强，因为调用时默认使用了 this 关键词，表示调用的是原类中的方法，而不是代理类中的方法（经典面试题：@Transactional 注解失效的场景）。