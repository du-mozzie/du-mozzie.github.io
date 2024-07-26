---
order: 1
title: RequestMappingHandlerMapping 与 RequestMappingHandlerAdapter
date: 2021-10-08
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
prev: ./
---

# DispatcherServlet 的初始化

选择支持内嵌 Tomcat 服务器的 Spring 容器作为 ApplicationContext 的实现：

```java
public static void main(String[] args) {
    AnnotationConfigServletWebServerApplicationContext context =
        new AnnotationConfigServletWebServerApplicationContext(WebConfig.class);
}
```

WebConfig 作为配置类，向 Spring 容器中添加内嵌 Web 容器工厂、DispatcherServlet 和 DispatcherServlet 注册对象。

```java
@Configuration
@ComponentScan
public class WebConfig {
    /**
     * 内嵌 Web 容器工厂
     */
    @Bean
    public TomcatServletWebServerFactory tomcatServletWebServerFactory() {
        return new TomcatServletWebServerFactory();
    }

    /**
     * 创建 DispatcherServlet
     */
    @Bean
    public DispatcherServlet dispatcherServlet() {
        return new DispatcherServlet();
    }

    /**
     * 注册 DispatcherServlet，Spring MVC 的入口
     */
    @Bean
    public DispatcherServletRegistrationBean dispatcherServletRegistrationBean(DispatcherServlet dispatcherServlet) {
        return new DispatcherServletRegistrationBean(dispatcherServlet, "/");
    }
}
```

运行 main() 方法，控制台打印出：![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1709389629919-4f1d9565-f160-4656-a438-c10bd194f7b0.png)

Tomcat 容器初始化成功，Spring 容器初始化成功，但 DispatcherServlet 还未被初始化。

当 Tomcat 服务器 首次 使用到 DispatcherServlet 时，才会由 Tomcat 服务器初始化 DispatcherServlet。

清空控制台信息，使用浏览器访问 localhost:8080，控制台打印出：

```java
信息: Initializing Spring DispatcherServlet 'dispatcherServlet'
[INFO ] Initializing Servlet 'dispatcherServlet' 
[TRACE] No MultipartResolver 'multipartResolver' declared 
[TRACE] No LocaleResolver 'localeResolver': using default [AcceptHeaderLocaleResolver] 
[TRACE] No ThemeResolver 'themeResolver': using default [FixedThemeResolver] 
[TRACE] No HandlerMappings declared for servlet 'dispatcherServlet': using default strategies from DispatcherServlet.properties 
[TRACE] No HandlerAdapters declared for servlet 'dispatcherServlet': using default strategies from DispatcherServlet.properties 
[TRACE] No HandlerExceptionResolvers declared in servlet 'dispatcherServlet': using default strategies from DispatcherServlet.properties 
[TRACE] No RequestToViewNameTranslator 'viewNameTranslator': using default [DefaultRequestToViewNameTranslator] 
[TRACE] No ViewResolvers declared for servlet 'dispatcherServlet': using default strategies from DispatcherServlet.properties 
[TRACE] No FlashMapManager 'flashMapManager': using default [SessionFlashMapManager] 
[INFO] Completed initialization in 482 ms 
```

完成 DispatcherServlet 的初始化。

使用 DEBUG 查看 DispatcherServlet 的初始化时机

断点 DispatcherServlet 的 onRefresh() 方法中 this.initStrategies(context); 的所在行：

```java
protected void onRefresh(ApplicationContext context) {
    this.initStrategies(context);
}
```

以 DEBUG 方式重启程序，此时程序尚未执行到断点处。

再次在浏览器中访问 localhost:8080，程序执行到断点处。

查看调用栈可知，是从 GenericServlet 的 init() 方法执行到 onRefresh() 方法的：

```java
public void init(ServletConfig config) throws ServletException {
    this.config = config;
    this.init();
}
```

因此 DispatcherServlet 的初始化流程走的是 Servlet 的初始化流程。

使 DispatcherServlet 在 Tomcat 服务器启动时被初始化

修改添加到 Spring 容器的 DispatcherServlet 注册 Bean：

```java
@Bean
public DispatcherServletRegistrationBean dispatcherServletRegistrationBean(DispatcherServlet dispatcherServlet) {
    DispatcherServletRegistrationBean registrationBean = new DispatcherServletRegistrationBean(dispatcherServlet, "/");
    registrationBean.setLoadOnStartup(1);
    return registrationBean;
}
```

设置其 loadOnStartup 为一个正数。

当存在多个 DispatcherServlet 需要被注册时，设置的 loadOnStartup 越大，优先级越小，初始化顺序越靠后。

在源码中loadOnStartup默认为-1

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710855374357-51427906-e34e-4ee2-8db7-7beabc5a9e4a.png)

再次重启程序，根据控制台输出的内容可知，不仅完成 Tomcat 和 Spring 容器的初始化，DispatcherServlet 也初始化成功。

## 抽取配置信息到配置文件中

使用 @PropertySource 注解设置配置类需要读取的配置文件，以便后续读取配置文件中的内容。

要读取配置文件中的内容，可以使用 @Value 注解，但该注解一次仅仅能够读取一个值，现实是往往需要从配置文件中读取多个值。

可以使用 @EnableConfigurationProperties 注解完成配置文件信息与对象的绑定，后续使用时作为 @Bean 注解标记的方法的参数直接在方法中使用即可：

```properties
server.port=8000
spring.mvc.servlet.load-on-startup=1
```

Spring提供了一些默认的配置类：WebMvcProperties、ServerProperties

```java
@Configuration
@ComponentScan
@PropertySource("classpath:application.properties")
@EnableConfigurationProperties({WebMvcProperties.class, ServerProperties.class})
public class WebConfig {
    /**
     * 内嵌 Web 容器工厂
     */
    @Bean
    public TomcatServletWebServerFactory tomcatServletWebServerFactory(ServerProperties serverProperties) {
        return new TomcatServletWebServerFactory(serverProperties.getPort());
    }

    /**
     * 创建 DispatcherServlet
     */
    @Bean
    public DispatcherServlet dispatcherServlet() {
        return new DispatcherServlet();
    }

    /**
     * 注册 DispatcherServlet，Spring MVC 的入口
     */
    @Bean
    public DispatcherServletRegistrationBean dispatcherServletRegistrationBean(DispatcherServlet dispatcherServlet,
                                                                               WebMvcProperties webMvcProperties) {
        DispatcherServletRegistrationBean registrationBean = new DispatcherServletRegistrationBean(dispatcherServlet, "/");
        registrationBean.setLoadOnStartup(webMvcProperties.getServlet().getLoadOnStartup());
        return registrationBean;
    }
}
```

再次重启程序，根据控制台输出的内容可知，Tomcat 此时监听的端口是 8000，DispatcherServlet 也在 Tomcat 启动时被初始化。

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710855832025-d73a00da-d216-4e98-a166-1527385c04be.png)

DispatcherServlet 初始化时执行的操作

回到 DispatcherServlet 的 onRefresh() 方法，它又调用了 initStrategies() 方法：

```java
protected void initStrategies(ApplicationContext context) {
    initMultipartResolver(context); // 文件上传的一种格式解析器
    initLocaleResolver(context); // 本地化信息解析器i18n
    initThemeResolver(context); // 解析和管理Web应用程序中的主题
    initHandlerMappings(context); // 路径映射
    initHandlerAdapters(context); // 处理适配器，调用具体的方法对用户发来的请求来进行处理
    initHandlerExceptionResolvers(context); // 处理器异常解析器
    initRequestToViewNameTranslator(context); // 请求信息（如HTTP请求的方法、路径等）转换为视图名称
    initViewResolvers(context); // 初始化视图解析器
    initFlashMapManager(context); // 初始化FlashMapManager，处理闪存的组件
}
```

重点：initHandlerMappings、initHandlerAdapters、initHandlerExceptionResolvers

在所有的初始化方法中都有一个相似的逻辑，首先使用一个布尔值判断是否检测 所有 目标组件。

Spring 支持父子容器嵌套，如果判断的布尔值为 true，那么 Spring 不仅会在当前容器中获取目标组件，还会在其所有父级容器中寻找。

以 initHandlerMappings() 为例：

```java
private void initHandlerMappings(ApplicationContext context) {
    // 成员变量, 存储所有的映射处理器
    this.handlerMappings = null;
    // 是否检测所有的，到父子容器查找
    if (this.detectAllHandlerMappings) {
        // Find all HandlerMappings in the ApplicationContext, including ancestor contexts.
        Map<String, HandlerMapping> matchingBeans =
                BeanFactoryUtils.beansOfTypeIncludingAncestors(context, HandlerMapping.class, true, false);
        if (!matchingBeans.isEmpty()) {
            this.handlerMappings = new ArrayList<>(matchingBeans.values());
            // We keep HandlerMappings in sorted order.
            AnnotationAwareOrderComparator.sort(this.handlerMappings);
        }
    }
    else {
        // 在当前容器中找
        try {
            // 跟上面逻辑一样
            // 根据HandlerMapping类型找, 存储到上面的集合中
            HandlerMapping hm = context.getBean(HANDLER_MAPPING_BEAN_NAME, HandlerMapping.class);
            this.handlerMappings = Collections.singletonList(hm);
        }
        catch (NoSuchBeanDefinitionException ex) {
            // Ignore, we'll add a default HandlerMapping later.
        }
    }

    // 上面没找到提供一个默认的
    if (this.handlerMappings == null) {
        // 在DispatcherServlet.properties这个文件里面
        this.handlerMappings = getDefaultStrategies(context, HandlerMapping.class);
        if (logger.isTraceEnabled()) {
            logger.trace("No HandlerMappings declared for servlet '" + getServletName() +
                    "': using default strategies from DispatcherServlet.properties");
        }
    }

    for (HandlerMapping mapping : this.handlerMappings) {
        if (mapping.usesPathPatterns()) {
            this.parseRequestPath = true;
            break;
        }
    }
}
```

没有的时候都用默认的，这些默认的是不会添加到Spring容器中的，只是放在Dispathcher的成员变量中

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710858790857-b1d3c199-eba6-425e-8f1d-5f3b877178d4.png)

# RequestMappingHandlerMapping

HandlerMapping，即处理器映射器，用于建立请求路径与控制器方法的映射关系。

RequestMappingHandlerMapping 是 HandlerMapping 的一种实现，根据类名可知，它是通过 @RequestMapping 注解来实现路径映射。

当 Spring 容器中没有 HandlerMapping 的实现时，尽管 DispatcherServlet 在初始化时会添加一些默认的实现，但这些实现不会交由 Spring 管理，而是作为 DispatcherServlet 的成员变量。

注册一个RequestMappingHandlerMapping

```java
@Bean
public RequestMappingHandlerMapping requestMappingHandlerMapping(){
    return new RequestMappingHandlerMapping();
}
```

控制器

```java
@Slf4j
@Controller
public class Controller1 {
    @GetMapping("/test1")
    public ModelAndView test1() throws Exception {
        log.debug("test1()");
        return null;
    }

    @PostMapping("/test2")
    public ModelAndView test2(@RequestParam("name") String name) {
        log.debug("test2({})", name);
        return null;
    }

    @PutMapping("/test3")
    public ModelAndView test3(String token) {
        log.debug("test3({})", token);
        return null;
    }

    @RequestMapping("/test4")
    public User test4() {
        log.debug("test4");
        return new User("张三", 18);
    }

    @Data
    @AllArgsConstructor
    public static class User {
        private String name;
        private int age;
    }
}
```

编写 main() 方法，从 Spring 容器中获取 RequestMappingHandlerMapping，再获取请求路径与映射器方法的映射关系，并根据给定请求获取控制器方法：

```java
public class Start {
    public static void main(String[] args) throws Exception {
        // 使用注解来注册web容器
        AnnotationConfigServletWebServerApplicationContext context =
                new AnnotationConfigServletWebServerApplicationContext(WebConfig.class);

        // 解析 @RequestMapping 以及派生注解，在初始化时生成路径与控制器方法的映射关系
        RequestMappingHandlerMapping handlerMapping = context.getBean(RequestMappingHandlerMapping.class);

        // 将解析的注解存到一个map中, key是请求的信息（例: GET请求, 请求路径/test1）, value是对应的方法信息（属于哪个类, 哪个方法）
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = handlerMapping.getHandlerMethods();
        handlerMethods.forEach((k, v) -> System.out.println(k + " = " + v));

        // 请求来了, 根据请求的信息, 获取控制器方法 返回执行链对象（包含拦截器）
        HandlerExecutionChain chain = handlerMapping.getHandler(new MockHttpServletRequest("GET", "/test1"));
        System.out.println(chain);
    }
}
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710861834079-a27170e9-545d-4b30-a5fb-a0d3f5908a5a.png)

# RequestMappingHandlerAdapter

RequestMappingHandlerAdapter 实现了 HandlerAdapter 接口，HandlerAdapter 用于执行控制器方法，而 RequestMapping 表明 RequestMappingHandlerAdapter 用于执行被 @RequestMapping 注解标记的控制器方法。

同样需要在配置类中将 RequestMappingHandlerAdapter 添加到 Spring 容器，但该类中需要测试的方法被 protected 修饰，无法直接使用，因此创建一个子类，将子类添加到 Spring 容器中：

```java
public class MyRequestMappingHandlerAdapter extends RequestMappingHandlerAdapter {

    @Override
    protected ModelAndView invokeHandlerMethod(HttpServletRequest request, HttpServletResponse response,
                                               HandlerMethod handlerMethod) throws Exception {
        return super.invokeHandlerMethod(request, response, handlerMethod);
    }
}
```

将我们自定义的adapter注册到容器中

```java
@Bean
public MyRequestMappingHandlerAdapter requestMappingHandlerAdapter(){
    return new MyRequestMappingHandlerAdapter();
}
```

main方法

```java
    public static void main(String[] args) throws Exception {
        // 使用注解来注册web容器
        AnnotationConfigServletWebServerApplicationContext context =
                new AnnotationConfigServletWebServerApplicationContext(WebConfig.class);

        // 解析 @RequestMapping 以及派生注解，在初始化时生成路径与控制器方法的映射关系
        RequestMappingHandlerMapping handlerMapping = context.getBean(RequestMappingHandlerMapping.class);

        // 将解析的注解存到一个map中, key是请求的信息（例: GET请求, 请求路径/test1）, value是对应的方法信息（属于哪个类, 哪个方法）
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = handlerMapping.getHandlerMethods();

        // 无参get方法
        MockHttpServletRequest getNotArgumentReq = new MockHttpServletRequest("GET", "/test1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // 请求来了, 根据请求的信息, 获取控制器方法 返回执行链对象（包含拦截器）
        HandlerExecutionChain chain = handlerMapping.getHandler(getNotArgumentReq);

        // 使用requestMappingHandlerAdapter 来执行方法
        MyRequestMappingHandlerAdapter handlerAdapter = context.getBean(MyRequestMappingHandlerAdapter.class);
        handlerAdapter.invokeHandlerMethod(getNotArgumentReq, response, (HandlerMethod) chain.getHandler());

        // 执行带参数的post方法
        MockHttpServletRequest postArgumentReq = new MockHttpServletRequest("POST", "/test2");
        postArgumentReq.setParameter("name", "du");
        HandlerExecutionChain chain1 = handlerMapping.getHandler(postArgumentReq);
        handlerAdapter.invokeHandlerMethod(postArgumentReq, response, (HandlerMethod) chain1.getHandler());
    }
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710938281833-c0a4bd8c-1a63-40e2-b1c9-aeb383be22f3.png)

实现控制器方法的调用很简单，但如何将请求参数与方法参数相绑定的呢？

显然是需要解析 @RequestParam 注解。

Spring 支持许多种类的控制器方法参数，不同种类的参数使用不同的解析器，使用 MyRequestMappingHandlerAdapter 的 getArgumentResolvers() 方法获取所有参数解析器。

Spring 也支持许多种类的控制器方法返回值类型，使用 MyRequestMappingHandlerAdapter 的 getReturnValueHandlers() 方法获取所有返回值处理器。

```java
System.out.println("------------>所有的参数解析器");
Objects.requireNonNull(handlerAdapter.getArgumentResolvers()).forEach(System.out::println);
System.out.println("------------>所有的返回值解析器");
Objects.requireNonNull(handlerAdapter.getReturnValueHandlers()).forEach(System.out::println);
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710939402091-4e804566-49ae-459c-8c51-4b0dbd06b90d.png)

## ![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710939411548-132d3093-9a3d-4438-8eb4-3ff7427f877a.png)自定义参数解析器

创建一个自定义的注解

```java
// 例如经常需要用到请求头中的 token 信息, 用下面注解来标注由哪个参数来获取它
// token=令牌
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface Token {
}
@PutMapping("/test3")
public ModelAndView test3(@Token String token) {
    log.debug("test3({})", token);
    return null;
}
```

自定义token注解的参数解析器

```java
public class TokenArgumentResolvers implements HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(Token.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        return webRequest.getHeader("token");
    }
}
```

将自定义的注解解析器添加到RequestMappingHandlerAdapter中去

```java
@Bean
public MyRequestMappingHandlerAdapter requestMappingHandlerAdapter(){
    MyRequestMappingHandlerAdapter handlerAdapter = new MyRequestMappingHandlerAdapter();
    handlerAdapter.setCustomArgumentResolvers(Collections.singletonList(new TokenArgumentResolvers()));
    return handlerAdapter;
}
```

测试

```java
// 解析自定义的token
MockHttpServletRequest tokenRequest = new MockHttpServletRequest("PUT", "/test3");
tokenRequest.addHeader("token", "令牌");
MockHttpServletResponse response = new MockHttpServletResponse();
HandlerExecutionChain tokenChain = handlerMapping.getHandler(tokenRequest);
handlerAdapter.invokeHandlerMethod(tokenRequest, response, (HandlerMethod) tokenChain.getHandler());
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710940903967-f3941633-c8aa-4aa9-87df-ecb22b377d9d.png)

## 自定义返回值解析器

创建一个自定义的解析器

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Yaml {
}
@RequestMapping("/test4")
@Yaml
public User test4() {
    log.debug("test4");
    return new User("张三", 18);
}
```

自定义Yaml注解的返回值解析器

```java
public class YamlReturnValueResolvers implements HandlerMethodReturnValueHandler {
    @Override
    public boolean supportsReturnType(MethodParameter returnType) {
        return returnType.hasMethodAnnotation(Yaml.class);
    }

    @Override
    public void handleReturnValue(Object returnValue, MethodParameter returnType, ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws Exception {
        HttpServletResponse response = (HttpServletResponse) webRequest.getNativeResponse();
        // 1.返回值转换为Yaml格式
        String result = new org.yaml.snakeyaml.Yaml().dump(returnValue);
        // 2.写入response
        response.setContentType("text/plain;charset=utf-8");
        response.getWriter().print(result);

        // 3.设置请求已经处理完毕
        mavContainer.setRequestHandled(true);
    }
}
```

将自定义的注解解析器添加到RequestMappingHandlerAdapter中去

```java
@Bean
public MyRequestMappingHandlerAdapter requestMappingHandlerAdapter(){
    MyRequestMappingHandlerAdapter handlerAdapter = new MyRequestMappingHandlerAdapter();
    // 添加返回值解析器
    handlerAdapter.setCustomReturnValueHandlers(Collections.singletonList(new YamlReturnValueResolvers()));
    return handlerAdapter;
}
```

测试

```java
MockHttpServletRequest yamlRequest = new MockHttpServletRequest("", "/test4");
HandlerExecutionChain yamlChain = handlerMapping.getHandler(yamlRequest);
handlerAdapter.invokeHandlerMethod(tokenRequest, response, (HandlerMethod) yamlChain.getHandler());
System.out.println(response.getContentAsString());
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710942532794-20146998-643f-4ae9-9810-70ec594fc011.png)

**处理流程总结**

1. RequestMappingHandlerMapping将请求映射为HandlerMethod
2. RequestMappingHandlerAdapter的ArgumentResolver解析请求参数
3. RequestMappingHandlerAdapter执行invokeHandlerMethod方法
4. RequestMappingHandlerAdapter的ReturnValueResolver处理返回值

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1710943344380-6fde5964-6fb4-4093-8009-e1921921a947.png)