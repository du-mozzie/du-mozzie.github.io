---
order: 3
title: '@RequestHeader'
date: 2021-10-08
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

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
