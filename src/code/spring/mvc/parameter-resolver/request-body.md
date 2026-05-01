---
order: 8
title: '@RequestBody'
date: 2021-10-08
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

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
