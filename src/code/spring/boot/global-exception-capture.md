---
order: 9
title: 全局异常捕获
date: 2021-10-16
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

**HTTP决策树**

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/HTTP决策树.webp)

```java
@RestControllerAdvice
@Slf4j /*日志处理*/
public class GlobalExceptionHandler {
	/**
	 * \<p>
	 *     处理自定义业务异常
	 *     注意：我们规定所有网络异常使用HttpStatus码
	 *          如果是业务状态码，最好作用自定义的异常code
	 *          因此这里我们响应码用200，响应信息里的code用来放业务异常码
	 * \</p>
	 * @param exception {@link BizException} 自定义业务异常
	 * @return {@link Resp}
	 */
	@ResponseStatus(HttpStatus.OK)
	@ExceptionHandler(value = BizException.class)
	public Object handleException(BizException exception) {
		printException(exception);
		return Resp.fail(exception.getCode(), exception.getMessage());
	}
}
```

**@RestControllerAdvice**

定义该类为全局异常处理类。

**@ExceptionHandler**

定义该方法为异常处理方法。value 的值为需要处理的异常类的 class 文件。在例子中，方法传入两个参数。一个是对应的 Exception 异常类，一个是 HttpServletRequest 类。当然，除了这两种参数，还支持传入一些其他参数。详见文档

[Spring ExceptionHandler文档](https://link.segmentfault.com/?url=https%3A%2F%2Fdocs.spring.io%2Fspring%2Fdocs%2Fcurrent%2Fjavadoc-api%2Forg%2Fspringframework%2Fweb%2Fbind%2Fannotation%2FExceptionHandler.html)

这样，就可以对不同的异常进行统一处理了。通常，为了使 controller 中不再使用任何 try/catch，也可以在 GlobalExceptionHandler 中对 Exception 做统一处理。这样其他没有用 @ExceptionHandler 配置的异常就都会统一被处理。

>   在业务中遇到对应的异常直接抛出就行

```java
throw new BusinessException("3000", "账户密码错误");
```