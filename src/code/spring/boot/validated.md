---
order: 6
title: 校验器
date: 2021-10-14
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

## @Validated参数合法性

1. 在实体类添加校验规则

   ```java
   //所属包
   import javax.validation.constraints
   ```

   | 限制                      | 说明                                                         |
   | ------------------------- | ------------------------------------------------------------ |
   | @Null                     | 限制只能为null                                               |
   | @NotNull                  | 限制必须不为null                                             |
   | @AssertFalse              | 限制必须为false                                              |
   | @AssertTrue               | 限制必须为true                                               |
   | @DecimalMax(value)        | 限制必须为一个不大于指定值的数字                             |
   | @DecimalMin(value)        | 限制必须为一个不小于指定值的数字                             |
   | @Digits(integer,fraction) | 限制必须为一个小数，且整数部分的位数不能超过integer，小数部分的位数不能超过fraction |
   | @Future                   | 限制必须是一个将来的日期                                     |
   | @Past                     | 限制必须是一个过去的日期                                     |
   | @Max(value)               | 限制必须为一个不大于指定值的数字                             |
   | @Min(value)               | 限制必须为一个不小于指定值的数字                             |
   | @Pattern(value)           | 限制必须符合指定的正则表达式                                 |
   | @Size(max,min)            | 限制字符长度必须在min到max之间                               |
   | @Past                     | 验证注解的元素值（日期类型）比当前时间早                     |
   | @NotEmpty                 | 验证注解的元素值不为null且不为空（字符串长度不为0、集合大小不为0） |
   | @NotBlank                 | 验证注解的元素值不为空（不为null、去除首位空格后长度为0），不同于@NotEmpty，@NotBlank只应用于字符串且在比较时会去除字符串的空格 |
   | @Email                    | 验证注解的元素值是Email，也可以通过正则表达式和flag指定自定义的email格式 |

2. 在controller中开启

   在接受参数前面加上 `@Validated` 注解, 对象中的 `@NotNull、@Max` 等注解才会生效, 不加的话是无效的

bindingResult.getFieldError.getDefaultMessage()⽤于获取相应字段上校验器添加的message中的内容，如：@Min注解中message属性的

内容（注: 通常不在这⾥处理异常，由统⼀的exceptioin全局异常处理）

## 自定义校验器

1. 编写一个自定义的校验注解

   ```java
   @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
   @Retention(RUNTIME)
   @Documented
   @Constraint(validatedBy = {PhoneValidatorForString.class }) // 自定义的校验规则
   public @interface Phone {
   
       String message() default "手机号格式不正确"; 
   
       Class\<?>[] groups() default { };
   
       Class\<? extends Payload>[] payload() default { };
   }
   ```

2. 编写一个自定义的校验规则

   ```java
   public class PhoneValidatorForString implements ConstraintValidator\<Phone, String> {
       // 实现initialize方法可以获取到标注的数据
       
       @Override
       public boolean isValid(String value, ConstraintValidatorContext context) {
           // 手机号正则
           String regex = "^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$";
           return value.matches(regex);
       }
   }
   ```

如果一个校验器需要校验多种类型的时候，我们在约束条件添加多个校验规则就行了

```java
@Constraint(validatedBy = {PhoneValidatorForString.class, xxxxxx.class })
```

## 校验组

1. 自定义一个校验组（声明一个接口）

   ```java
   public interface SaveGroup {
   }
   ```

2. 在需要校验的属性上添加校验分组

   ```java
   @Phone(groups = {SaveGroup.class})
   private String phone;
   ```

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220621224136086.png)

3. 在controller方法上添加校验分组

   ```java
   @PostMapping("/send")
   public R sendSms(@RequestBody @Validated(value = {SaveGroup.class}) SmsSendCodeReq smsSendCode) {
       String code = smsService.sendMessage(smsSendCode);
       return R.ok(code);
   }
   ```

   如果还有其他属性没有标注分组信息，默认是不进行校验的，要校验就需要添加分组

==@Validated、@Valid区别==

1. 所在包不同

   - @Valid 在	import javax.validation.Valid;
   - @Validated 在    import org.springframework.validation.annotation.Validated;

2. 支持分组校验

   - @Valid 不支持分组校验
   - @Validated 支持分组校验

3. 嵌套校验

   - @Valid  如果一个属性是一个类，这个类下面又有属性需要校验，使用@Valid可以进行校验
   - @Validated 如果一个属性是一个类，这个类下面又有属性需要校验，使用@Validated不可以进行校验

4. 注解地方

   - Valid 可以用在方法、构造函数、方法参数和成员属性（字段）上
   - 可以用在类型、方法和方法参数上。但是不能用在成员属性（字段）上

   能不能用在成员属性上影响了其嵌套校验功能