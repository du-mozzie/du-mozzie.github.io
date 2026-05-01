---
order: 6
title: 'HttpServletRequest'
date: 2021-10-08
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

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
