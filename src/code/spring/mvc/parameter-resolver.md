---
order: 2
title: 参数解析器
date: 2021-10-08
category: 
    - Spring
tag: 
    - Spring
timeline: true
article: true
---

Spring 提供了许多种类的控制器方法参数解析器

```java
org.springframework.web.method.annotation.RequestParamMethodArgumentResolver@abbc908
org.springframework.web.method.annotation.RequestParamMapMethodArgumentResolver@44afefd5
org.springframework.web.servlet.mvc.method.annotation.PathVariableMethodArgumentResolver@9a7a808
org.springframework.web.servlet.mvc.method.annotation.PathVariableMapMethodArgumentResolver@72209d93
org.springframework.web.servlet.mvc.method.annotation.MatrixVariableMethodArgumentResolver@2687f956
org.springframework.web.servlet.mvc.method.annotation.MatrixVariableMapMethodArgumentResolver@1ded7b14
org.springframework.web.servlet.mvc.method.annotation.ServletModelAttributeMethodProcessor@29be7749
org.springframework.web.servlet.mvc.method.annotation.RequestResponseBodyMethodProcessor@5f84abe8
org.springframework.web.servlet.mvc.method.annotation.RequestPartMethodArgumentResolver@4650a407
org.springframework.web.method.annotation.RequestHeaderMethodArgumentResolver@30135202
org.springframework.web.method.annotation.RequestHeaderMapMethodArgumentResolver@6a4d7f76
org.springframework.web.servlet.mvc.method.annotation.ServletCookieValueMethodArgumentResolver@10ec523c
org.springframework.web.method.annotation.ExpressionValueMethodArgumentResolver@53dfacba
org.springframework.web.servlet.mvc.method.annotation.SessionAttributeMethodArgumentResolver@79767781
org.springframework.web.servlet.mvc.method.annotation.RequestAttributeMethodArgumentResolver@78411116
org.springframework.web.servlet.mvc.method.annotation.ServletRequestMethodArgumentResolver@aced190
org.springframework.web.servlet.mvc.method.annotation.ServletResponseMethodArgumentResolver@245a060f
org.springframework.web.servlet.mvc.method.annotation.HttpEntityMethodProcessor@6edaa77a
org.springframework.web.servlet.mvc.method.annotation.RedirectAttributesMethodArgumentResolver@1e63d216
org.springframework.web.method.annotation.ModelMethodProcessor@62ddd21b
org.springframework.web.method.annotation.MapMethodProcessor@16c3ca31
org.springframework.web.method.annotation.ErrorsMethodArgumentResolver@2d195ee4
org.springframework.web.method.annotation.SessionStatusMethodArgumentResolver@2d6aca33
org.springframework.web.servlet.mvc.method.annotation.UriComponentsBuilderMethodArgumentResolver@21ab988f
org.springframework.web.servlet.mvc.method.annotation.PrincipalMethodArgumentResolver@29314cc9
org.springframework.web.method.annotation.RequestParamMethodArgumentResolver@4e38d975
org.springframework.web.servlet.mvc.method.annotation.ServletModelAttributeMethodProcessor@35f8a9d3
```

定义一个包含多个不同种类参数的控制器方法：

```java
static class Controller {
    public void test(
            @RequestParam("name1") String name1, 
            String name2,                       
            @RequestParam("age") int age,     
            @RequestParam(name = "home", defaultValue = "${JAVA_HOME}") String home1, 
            @RequestParam("file") MultipartFile file, 
            @PathVariable("id") int id,
            @RequestHeader("Content-Type") String header,
            @CookieValue("token") String token,
            @Value("${JAVA_HOME}") String home2, 
            HttpServletRequest request,
            @ModelAttribute("abc") User user1,
            User user2, 
            @RequestBody User user3
    ) {
    }
}

@Data
static class User {
    private String name;
    private int age;
}
```

将控制器方法封装成 HandlerMethod 并打印方法中每个参数的信息：

```java
public static void main(String[] args) throws Exception {
    // 控制器方法封装成 HandlerMethod
    Method method = Controller.class.getMethod("test", String.class, String.class,
            int.class, String.class, MultipartFile.class,
            int.class, String.class, String.class,
            String.class, HttpServletRequest.class, User.class,
            User.class, User.class);
    HandlerMethod handlerMethod = new HandlerMethod(new Controller(), method);

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        String annotations = Arrays.stream(parameter.getParameterAnnotations())
                .map(i -> i.annotationType().getSimpleName()).collect(Collectors.joining());
        String appendAt = annotations.length() > 0 ? "@" + annotations + " " : "";
        // 设置参数名解析器
        parameter.initParameterNameDiscovery(new DefaultParameterNameDiscoverer());
        System.out.println("[" + parameter.getParameterIndex() + "] " + appendAt +
                parameter.getParameterType().getSimpleName() + " " + parameter.getParameterName());
    }
}
```

![img](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1711028501951-d34963ff-5fc9-46b5-89d4-b68f3059bb91.png)

## @RequestParam

@RequestParam 注解的解析需要使用到 RequestParamMethodArgumentResolver 参数解析器。构造时需要两个参数：

- beanFactory：Bean 工厂对象。需要解析 ${} 时，就需要指定 Bean 工厂对象
- useDefaultResolution：布尔类型参数。为 false 表示只解析添加了 @RequestParam 注解的参数，为 true 针对未添加 @RequestParam 注解的参数也使用该参数解析器进行解析。

RequestParamMethodArgumentResolver 利用 resolveArgument() 方法完成参数的解析，该方法需要传递四个参数：

- parameter：参数对象
- mavContainer：ModelAndView 容器，用来存储中间的 Model 结果
- webRequest：由 ServletWebRequest 封装后的请求对象
- binderFactory：数据绑定工厂，用于完成对象绑定和类型转换，比如将字符串类型的 18 转换成整型

```java
public static void main(String[] args) throws Exception {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(WebConfig.class);
    ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
    HttpServletRequest request = mockRequest();

    // 控制器方法封装成 HandlerMethod
    Method method = Controller.class.getMethod("test", String.class, String.class,
            int.class, String.class, MultipartFile.class,
            int.class, String.class, String.class,
            String.class, HttpServletRequest.class, User.class,
            User.class, User.class);
    HandlerMethod handlerMethod = new HandlerMethod(new Controller(), method);

    // 准备对象绑定与类型转换
    ServletRequestDataBinderFactory binderFactory = new ServletRequestDataBinderFactory(null, null);

    // 准备 ModelAndViewContainer 用来存储中间的 Model 结果
    ModelAndViewContainer container = new ModelAndViewContainer();

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
        RequestParamMethodArgumentResolver resolver = new RequestParamMethodArgumentResolver(beanFactory, true);

        String annotations = Arrays.stream(parameter.getParameterAnnotations())
                .map(i -> i.annotationType().getSimpleName()).collect(Collectors.joining());
        String appendAt = annotations.length() > 0 ? "@" + annotations + " " : "";
        // 设置参数名解析器
        parameter.initParameterNameDiscovery(new DefaultParameterNameDiscoverer());
        String paramInfo = "[" + parameter.getParameterIndex() + "] " + appendAt +
                parameter.getParameterType().getSimpleName() + " " + parameter.getParameterName();

        if (resolver.supportsParameter(parameter)) {
            Object v = resolver.resolveArgument(parameter, container, new ServletWebRequest(request), binderFactory);
            System.out.println(Objects.requireNonNull(v).getClass());
            System.out.println(paramInfo + " -> " + v);
        } else {
            System.out.println(paramInfo);
        }
    }
}
class java.lang.String
[0] @RequestParam String name1 -> zhangsan
class java.lang.String
[1] String name2 -> lisi
class java.lang.Integer
[2] @RequestParam int age -> 18
class java.lang.String
[3] @RequestParam String home1 -> D:\environment\JDK1.8
class org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@f2ff811
Exception in thread "main" java.lang.IllegalStateException: Optional int parameter 'id' is present but cannot be translated into a null value due to being declared as a primitive type. Consider declaring it as object wrapper for the corresponding primitive type.
```

控制器方法 test() 的前 5 个参数解析成功，但在解析第 6 个参数时产生了异常。

这是因为在构造 RequestParamMethodArgumentResolver 对象时，将 useDefaultResolution 设置为 true，针对未添加 @RequestParam 注解的参数都使用该参数解析器进行解析。第 6 个参数需要的 id 信息使用该解析器解析得到的结果是 null，无法将 null 值赋值给基本类型 int，显然第 6 个及其以后的参数应该使用其他参数解析器进行解析。

多个参数解析器的组合 - 组合模式

不同种类的参数需要不同的参数解析器，当前使用的参数解析器不支持当前参数的解析时，就应该换一个参数解析器进行解析。

可以将所有参数解析器添加到一个集合中，然后遍历这个集合，实现上述需求。

Spring 提供了名为 HandlerMethodArgumentResolverComposite 的类，对上述逻辑进行封装。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
                // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
                new RequestParamMethodArgumentResolver(beanFactory, true)
        );

        // --snip--

        if (composite.supportsParameter(parameter)) {
            Object v = composite.resolveArgument(parameter, container, new ServletWebRequest(request), binderFactory);
            System.out.println(paramInfo + " -> " + v);
        } else {
            System.out.println(paramInfo);
        }
    }
}
```

## @PathVariable

@PathVariable 注解的解析需要使用到 PathVariableMethodArgumentResolver 参数解析器。构造时无需传入任何参数。

使用该解析器需要一个 Map 集合，该 Map 集合是 @RequestMapping 注解上指定的路径和实际 URL 路径进行匹配后，得到的路径上的参数与实际路径上的值的关系（获取这个 Map 并将其设置给 request 作用域由 HandlerMapping 完成）。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver()
        );

        // --snip--
    }
}
```

修改 RequestParamMethodArgumentResolver 参数解析器的构造，将 useDefaultResolution 设置为 false，让程序 暂时 不抛出异常。

```java
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@11c9af63
[5] @PathVariable int id -> 123
```

## @RequestHeader

@RequestHeader 注解的解析需要使用到 RequestHeaderMethodArgumentResolver 参数解析器。构造时需要传入一个 Bean 工厂对象。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory)
        );

        // --snip--
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@3943a2be
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
```

## @CookieValue

@CookieValue 注解的解析需要使用到 ServletCookieValueMethodArgumentResolver 参数解析器。构造时需要传入一个 Bean 工厂对象。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory),
            // 解析 @CookieValue
            new ServletCookieValueMethodArgumentResolver(beanFactory)
        );

        // --snip--
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@1329eff
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
[7] @CookieValue String token -> 123456
```

## @Value

@Value 注解的解析需要使用到 ExpressionValueMethodArgumentResolver 参数解析器。构造时需要传入一个 Bean 工厂对象。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory),
            // 解析 @CookieValue
            new ServletCookieValueMethodArgumentResolver(beanFactory),
            // 解析 @Value
            new ExpressionValueMethodArgumentResolver(beanFactory)
        );

        // --snip--
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@46fa7c39
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
[7] @CookieValue String token -> 123456
[8] @Value String home2 -> D:\environment\JDK1.8
```

## HttpServletRequest

HttpServletRequest 类型的参数的解析需要使用到 ServletRequestMethodArgumentResolver 参数解析器。构造时无需传入任何参数。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory),
            // 解析 @CookieValue
            new ServletCookieValueMethodArgumentResolver(beanFactory),
            // 解析 @Value
            new ExpressionValueMethodArgumentResolver(beanFactory),
            // 解析 HttpServletRequest
            new ServletRequestMethodArgumentResolver()
        );

        // --snip--
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@5f683daf
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
[7] @CookieValue String token -> 123456
[8] @Value String home2 -> D:\environment\JDK1.8
[9] HttpServletRequest request -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest@152aa092
```

ServletRequestMethodArgumentResolver 参数解析器不仅可以解析 HttpServletRequest 类型的参数，还支持许多其他类型的参数，其支持的参数类型可在 supportsParameter() 方法中看到：

```java
public boolean supportsParameter(MethodParameter parameter) {
    Class<?> paramType = parameter.getParameterType();
    return (WebRequest.class.isAssignableFrom(paramType) ||
            ServletRequest.class.isAssignableFrom(paramType) ||
            MultipartRequest.class.isAssignableFrom(paramType) ||
            HttpSession.class.isAssignableFrom(paramType) ||
            (pushBuilder != null && pushBuilder.isAssignableFrom(paramType)) ||
            (Principal.class.isAssignableFrom(paramType) && !parameter.hasParameterAnnotations()) ||
            InputStream.class.isAssignableFrom(paramType) ||
            Reader.class.isAssignableFrom(paramType) ||
            HttpMethod.class == paramType ||
            Locale.class == paramType ||
            TimeZone.class == paramType ||
            ZoneId.class == paramType);
}
```

## @ModelAttribute

@ModelAttribute 注解的解析需要使用到 ServletModelAttributeMethodProcessor 参数解析器。构造时需要传入一个布尔类型的值。为 false 时，表示 @ModelAttribute 不是不必须的，即是必须的。

针对 @ModelAttribute("abc") User user1 和 User user2 两种参数来说，尽管后者没有使用 @ModelAttribute 注解，但它们使用的是同一种解析器。

添加两个 ServletModelAttributeMethodProcessor 参数解析器，先解析带 @ModelAttribute 注解的参数，再解析不带 @ModelAttribute 注解的参数。

通过 ServletModelAttributeMethodProcessor 解析得到的数据还会被存入 ModelAndViewContainer 中。存储的数据结构是一个 Map，其 key 为 @ModelAttribute 注解指定的 value 值，在未显式指定的情况下，默认为对象类型的首字母小写对应的字符串。

```java
static class Controller {
    public void test(
		// 指定 value
        @ModelAttribute("abc") User user1, // name=zhang&age=18
        User user2, // name=zhang&age=18
        @RequestBody User user3 // json
    ) {
    }
}
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory),
            // 解析 @CookieValue
            new ServletCookieValueMethodArgumentResolver(beanFactory),
            // 解析 @Value
            new ExpressionValueMethodArgumentResolver(beanFactory),
            // 解析 HttpServletRequest
            new ServletRequestMethodArgumentResolver(),
            // 解析 @ModelAttribute，且不能省略
            new ServletModelAttributeMethodProcessor(false),
            new ServletModelAttributeMethodProcessor(true)
        );

        // --snip--

        if (composite.supportsParameter(parameter)) {
            Object v = composite.resolveArgument(parameter, container, new ServletWebRequest(request), binderFactory);
            System.out.println(paramInfo + " -> " + v);
            // 打印模型数据
            ModelMap modelMap = container.getModel();
            if (MapUtils.isNotEmpty(modelMap)) {
                System.out.println("模型数据: " + modelMap);
            }
        } else {
            System.out.println(paramInfo);
        }
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@2beee7ff
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
[7] @CookieValue String token -> 123456
[8] @Value String home2 -> D:\environment\JDK1.8
[9] HttpServletRequest request -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest@5fa07e12
[10] @ModelAttribute User user1 -> A21.User(name=张三, age=18)
模型数据: {abc=A21.User(name=张三, age=18), org.springframework.validation.BindingResult.abc=org.springframework.validation.BeanPropertyBindingResult: 0 errors}
[11] User user2 -> A21.User(name=张三, age=18)
模型数据: {abc=A21.User(name=张三, age=18), org.springframework.validation.BindingResult.abc=org.springframework.validation.BeanPropertyBindingResult: 0 errors, user=A21.User(name=张三, age=18), org.springframework.validation.BindingResult.user=org.springframework.validation.BeanPropertyBindingResult: 0 errors}
[12] @RequestBody User user3 -> A21.User(name=李四, age=20)
模型数据: {abc=A21.User(name=张三, age=18), org.springframework.validation.BindingResult.abc=org.springframework.validation.BeanPropertyBindingResult: 0 errors, user=A21.User(name=张三, age=18), org.springframework.validation.BindingResult.user=org.springframework.validation.BeanPropertyBindingResult: 0 errors}
```

@RequestBody User user3 参数也被 ServletModelAttributeMethodProcessor 解析了，如果想使其数据通过 JSON 数据转换而来，则需要使用另一个参数解析器。

## @RequestBody

@RequestBody 注解的解析需要使用到 RequestResponseBodyMethodProcessor 参数解析器。构造时需要传入一个消息转换器列表。

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory),
            // 解析 @CookieValue
            new ServletCookieValueMethodArgumentResolver(beanFactory),
            // 解析 @Value
            new ExpressionValueMethodArgumentResolver(beanFactory),
            // 解析 HttpServletRequest
            new ServletRequestMethodArgumentResolver(),
            // 解析 @ModelAttribute，且不能省略
            new ServletModelAttributeMethodProcessor(false),
            new RequestResponseBodyMethodProcessor(Collections.singletonList(new MappingJackson2HttpMessageConverter())),
            new ServletModelAttributeMethodProcessor(true)
        );

        // --snip--
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@5e17553a
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
[7] @CookieValue String token -> 123456
[8] @Value String home2 -> D:\environment\JDK1.8
[9] HttpServletRequest request -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest@13bc8645
[10] @ModelAttribute User user1 -> A21.User(name=张三, age=18)
[11] User user2 -> A21.User(name=张三, age=18)
[12] @RequestBody User user3 -> A21.User(name=李四, age=20)
```

@RequestBody User user3 参数数据通过 JSON 数据得到，与上一节的解析进行区分。

除此之外，添加的参数解析器顺序也影响着解析结果：

```java
new ServletModelAttributeMethodProcessor(false),
new RequestResponseBodyMethodProcessor(Collections.singletonList(new MappingJackson2HttpMessageConverter())),
new ServletModelAttributeMethodProcessor(true)
```

先添加解析 @ModelAttribute 注解的解析器，再添加解析 @RequestBody 注解的解析器，最后添加解析省略了 @ModelAttribute 注解的解析器。如果更换最后两个解析器的顺序，那么 @RequestBody User user3 将会被 ServletModelAttributeMethodProcessor 解析，而不是 RequestResponseBodyMethodProcessor。

因此 String name2 参数也能通过添加同种参数但不同构造参数的解析器进行解析，注意添加的解析器的顺序，先处理对象，再处理单个参数：

```java
public static void main(String[] args) throws Exception {
    // --snip--

    // 解析每个参数值
    for (MethodParameter parameter : handlerMethod.getMethodParameters()) {
        // 多个参数解析器的组合
        HandlerMethodArgumentResolverComposite composite = new HandlerMethodArgumentResolverComposite();
        composite.addResolvers(
            // useDefaultResolution 为 false 表示必须添加 @RequestParam 注解
            new RequestParamMethodArgumentResolver(beanFactory, false),
            // 解析 @PathVariable
            new PathVariableMethodArgumentResolver(),
            // 解析 @RequestHeader
            new RequestHeaderMethodArgumentResolver(beanFactory),
            // 解析 @CookieValue
            new ServletCookieValueMethodArgumentResolver(beanFactory),
            // 解析 @Value
            new ExpressionValueMethodArgumentResolver(beanFactory),
            // 解析 HttpServletRequest
            new ServletRequestMethodArgumentResolver(),
            // 解析 @ModelAttribute，且不能省略
            new ServletModelAttributeMethodProcessor(false),
            new RequestResponseBodyMethodProcessor(Collections.singletonList(new MappingJackson2HttpMessageConverter())),
            new ServletModelAttributeMethodProcessor(true),
            new RequestParamMethodArgumentResolver(beanFactory, true)
        );

        // --snip--
    }
}
[0] @RequestParam String name1 -> zhangsan
[1] String name2 -> lisi
[2] @RequestParam int age -> 18
[3] @RequestParam String home1 -> D:\environment\JDK1.8
[4] @RequestParam MultipartFile file -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest$StandardMultipartFile@5e17553a
[5] @PathVariable int id -> 123
[6] @RequestHeader String header -> application/json
[7] @CookieValue String token -> 123456
[8] @Value String home2 -> D:\environment\JDK1.8
[9] HttpServletRequest request -> org.springframework.web.multipart.support.StandardMultipartHttpServletRequest@13bc8645
[10] @ModelAttribute User user1 -> A21.User(name=张三, age=18)
[11] User user2 -> A21.User(name=张三, age=18)
[12] @RequestBody User user3 -> A21.User(name=李四, age=20)
```