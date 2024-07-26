---
order: 6
title: Scop
date: 2021-10-06
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

Scope 用于指定 Bean 的作用范围，有如下五个取值：

- singleton：单例（默认值）。容器启动时创建（未设置延迟），容器关闭时销毁
- prototype：多例。每次使用时创建，不会自动销毁，需要调用 DefaultListableBeanFactory#destroyBean() 进行销毁
- request：作用于 Web 应用的请求范围。每次请求用到此 Bean 时创建，请求结束时销毁
- session：作用于 Web 应用的会话范围。每个会话用到此 Bean 时创建，会话结束时销毁
- application：作用于 Web 应用的 ServletContext。Web 容器用到此 Bean 时创建，容器关闭时销毁

前两个取值不再赘述，重点看下后三个取值。

```java
@Slf4j  
@Component  
@Scope(WebApplicationContext.SCOPE_REQUEST)
public class BeanForRequest {
	@PreDestroy  
	public void destroy() {
		log.info("destroy");
	}
}
@Slf4j  
@Component  
@Scope(WebApplicationContext.SCOPE_SESSION)
public class BeanForSession {
	@PreDestroy  
	public void destroy() {
		log.info("destroy");
	}
}
@Slf4j  
@Component  
@Scope(WebApplicationContext.SCOPE_APPLICATION)
public class BeanForApplication {
	@PreDestroy  
	public void destroy() {
		log.info("destroy");
	}
}
```

编写一个 Controller 进行测试：

主启动类：

```java
@SpringBootApplication
public class A08Application {
	public static void main(String[] args) {
		SpringApplication.run(A08Application.class, args);
	}
}
```

如果使用的 JDK 版本大于 8，需要要启动参数中添加如下信息避免报错：

```plain
--add-opens java.base/java.lang=ALL-UNNAMED
```

但更建议在 pom.xml 中添加以下配置，一劳永逸：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <configuration>
                <argLine>
                    --add-opens java.base/java.lang=ALL-UNNAMED
                </argLine>
            </configuration>
        </plugin>
    </plugins>
</build>
```

运行主启动类，在浏览器中访问 http://localhost:8080/test，页面上显示：

```plain
request scope: indi.mofan.bean.a08.BeanForRequest@34d37122  
session scope: indi.mofan.bean.a08.BeanForSession@75ee7b19  
application scope: indi.mofan.bean.a08.BeanForApplication@68b50897  
```

刷新页面，页面上的信息变化为：

可以看到 request scope 发生了变化，session scope 和 application scope 没有变化。

这是因为刷新页面后就产生了一个新的请求，而 request 的作用范围只在一个请求内，因此每一个新请求就对应一个新的对象。

那要怎么改变 session scope 呢？

换一个浏览器访问 http://localhost:8080/test，两个浏览器中的会话肯定不是同一个，此时 session scope 应该会发生变化：
application 的作用范围是 ServletContext，要想 application scope 发生变化可以重启程序。

销毁

当刷新页面后，除了 request scope 的值发生变化外，在 IDEA 的控制台能看到以下信息：

```plain
indi.mofan.bean.a08.BeanForRequest       : destroy
```

这表示 request 作用范围的 Bean 进行了销毁，执行了销毁方法。

如果想看到 session 作用范围的 Bean 执行销毁方法，可以等 session 过期时在控制台上看到对应的信息。默认情况下，session 的过期时间是 30 分钟，为了更好地测试，可以在配置文件中添加：

```properties
# 修改 session 过期时间为 10s
server.servlet.session.timeout=10s
```

这个配置是全局的，如果只想针对某个请求进行配置，则可以：

```java
@GetMapping(value = "/test", produces = "text/html")
public String test(HttpServletRequest request, HttpSession session) {
    // 设置 session 过期时间为 10 秒
    session.setMaxInactiveInterval(10);
    
    // --snip--
}
```

设置 session 过期时间为 10 秒后，并不表示不进行任何操作 10 秒后就能在控制台上看到执行销毁方法的信息，经过测试，大概会等 1 分钟，静静等待 1 分钟左右，控制台上显示：

```plain
indi.mofan.bean.a08.BeanForSession       : destroy
```

很遗憾没有办法看到 application 作用范围的 Bean 执行销毁方法，因为 Spring 似乎并没有对 application 作用范围的 Bean 进行正确的销毁处理，因此在 Servlet 容器销毁时看不到 application 作用范围的 Bean 执行销毁方法。

# Scope 失效分析

现有两个类：

```java
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class F1 {
}
@Getter
@Component
public class E {
    @Autowired
    private F1 f1;
}
```

之后进行测试：

```java
@Slf4j
@ComponentScan("indi.mofan.bean.a09")
public class A09Application {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(A09Application.class);

        E e = context.getBean(E.class);
        log.info("{}", e.getF1());
        log.info("{}", e.getF1());
        log.info("{}", e.getF1());

        context.close();
    }
}
```

现在问题来了：F1 被 @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE) 标记，之后向 e 中注入了 f1，那么 log.info("{}", e.getF1()); 打印出的 f1 应该都不是同一个对象吗？

```plain
indi.mofan.bean.a09.A09Application       : indi.mofan.bean.a09.F1@5fdcaa40
indi.mofan.bean.a09.A09Application       : indi.mofan.bean.a09.F1@5fdcaa40
indi.mofan.bean.a09.A09Application       : indi.mofan.bean.a09.F1@5fdcaa40
```

获取到的 f1 居然都是同一个，也就是说向单例对象中注入多例对象失败了。

对于单例对象来说，依赖注入仅发生了一次，后续不会再注入其他的 f1，因此 e 始终使用的是第一次注入的 f1：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708000450514-83928f35-cf20-4b99-aea8-54d81105d8d5.png)

为了解决这个问题，可以使用 @Lazy 生成代理对象，虽然代理对象依旧是同一个，但每次使用代理对象中的方法时，会由代理对象创建新的目标对象：

 ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708000530832-4a008989-c2d8-4aa9-902b-48a4c6b8bc3c.png)

解决方法1

```java
@Getter
@Component
public class E {
    @Lazy
    @Autowired
    private F1 f1;
}
```

使用 @Lazy 注解后，注入的是代理对象，每次获取到的 f1 不再是同一个。

解决方法2

使用 @Scope 注解的 proxyMode 属性指定代理模式：

```java
@Component
@Scope(
        value = ConfigurableBeanFactory.SCOPE_PROTOTYPE,
        proxyMode = ScopedProxyMode.TARGET_CLASS
)
public class F2 {
}

@Getter
@Component
public class E {

    @Autowired
    private F2 f2;
}
```

解决方法3

```java
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class F3 {
}

@Component
public class E {

    @Autowired
    private ObjectFactory<F3> f3;

    public F3 getF3() {
        return f3.getObject();
    }
}
```

使用ObjectFactory，对象工厂

解决方法4

使用容器对象

```java
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class F4 {
}

@Component
public class E {

    @Autowired
    private ApplicationContext applicationContext;

    public F4 getF4() {
        return applicationContext.getBean(F4.class);
    }
}
```

如果对性能要求较高，则推荐使用后两种方式，前两种使用代理会有一定的性能损耗；如果不在乎那点性能损耗，则可以使用第一种方式，这种方式最简单。

四种解决方式虽然不同，但在理念上殊途同归，都是推迟了其他 Scope Bean 的获取，或者说按需加载。
