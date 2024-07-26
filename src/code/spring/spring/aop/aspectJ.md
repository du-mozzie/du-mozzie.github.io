---
order: 1
title: AspectJ 编译器增强
date: 2021-10-07
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
prev: ./
---

创建一个 SpringBoot 项目，除了常见的依赖外，记得导入 AOP 相关的依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

一个 Service 类：

```java
@Service
public class MyService {
    private static final Logger log = LoggerFactory.getLogger(MyService.class);
    public void foo() {
        log.info("foo()");
    }
}
```

一个切面类，注意这个切面类没有被 Spring 管理：

```java
@Aspect
public class MyAspect {
    private static final Logger log = LoggerFactory.getLogger(MyAspect.class);

    @Before("execution(* indi.mofan.service.MyService.foo())")
    public void before() {
        log.info("before()");
    }
}
```

一个用于测试的主启动类：

```java
@SpringBootApplication
public class A10Application {
    private static final Logger log = LoggerFactory.getLogger(A10Application.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(A10Application.class, args);
        MyService service = context.getBean(MyService.class);

        log.info("service class: {}", service.getClass());
        service.foo();

        context.close();
    }
}
```

运行主启动类后，控制台会显示：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708004033946-b73d30ee-a741-4b49-8bce-5eda91874b1d.png)

如果完全按照上述步骤进行，会发现 输出结果和给出的结果不一样。

在揭晓答案前，查看 service.getClass() 打印出的信息，它打印出的是原始类的 Class 信息，而非代理类的 Class 信息。

如果要问到 Spring AOP 的实现原理是什么，一下就能想到的是使用了代理，但这里并没有使用代理，依旧实现了增强。

这是因为在 pom.xml 中还引入了一个插件：

```java
<build>
    <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>aspectj-maven-plugin</artifactId>
            <version>1.11</version>
            <configuration>
                <complianceLevel>1.8</complianceLevel>
                <source>8</source>
                <target>8</target>
                <showWeaveInfo>true</showWeaveInfo>
                <verbose>true</verbose>
                <Xlint>ignore</Xlint>
                <encoding>UTF-8</encoding>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <!-- use this goal to weave all your main classes -->
                        <goal>compile</goal>
                        <!-- use this goal to weave all your test classes -->
                        <goal>test-compile</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

之后不在使用 IDEA 自带的编译器进行编译，而是使用 Maven 编译，即：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708004113781-3c7805b5-c132-4deb-9f1a-a6491afbd12c.png)

这个插件将我们的被代理类MyService进行了编译增强，查看生成的 target 文件夹下的 MyService.class 文件：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708004188015-64914c3a-9115-44ae-b4c7-e757fee59b63.png)

可以看到在 foo() 方法中增加了一行代码：MyAspect.aspectOf().before();，也就是这行代码对 foo() 方法实现了增强。

这种方式属于编译时增强，和 Lombok 类似，使用这种方式时，没有 Spring 容器也能实现方法的增强。