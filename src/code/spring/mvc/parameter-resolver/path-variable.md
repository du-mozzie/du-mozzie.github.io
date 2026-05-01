---
order: 2
title: '@PathVariable'
date: 2021-10-08
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

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
