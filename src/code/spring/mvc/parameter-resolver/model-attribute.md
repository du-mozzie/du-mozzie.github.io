---
order: 7
title: '@ModelAttribute'
date: 2021-10-08
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

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
