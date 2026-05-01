---
order: 2
title: 参数解析器
date: 2021-10-08
article: false
index: false
dir:
  order: 2
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

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1711028501951-d34963ff-5fc9-46b5-89d4-b68f3059bb91.png)

<!--more-->

<Catalog />
