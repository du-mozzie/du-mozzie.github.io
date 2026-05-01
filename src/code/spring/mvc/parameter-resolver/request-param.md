---
order: 1
title: '@RequestParam'
date: 2021-10-08
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

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
