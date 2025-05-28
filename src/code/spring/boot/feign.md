---
order: 11
title: Feign远程调用请求头丢失
date: 2021-10-16
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

遇到项目中使用Feign远程调用时，请求头丢失，导致服务调用失败。

```java
@Component
public class FeignAuthRequestInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes servletRequestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (servletRequestAttributes != null) {
            HttpServletRequest request = servletRequestAttributes.getRequest();
            Enumeration\<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String name = headerNames.nextElement();
                    String header = request.getHeader(name);
                    template.header(name, header);
                }
            }
        }
    }
}
```

