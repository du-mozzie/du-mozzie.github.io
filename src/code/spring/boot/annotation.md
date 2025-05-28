---
order: 4
title: 注解总结
date: 2021-10-12
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

Spring Boot 默认支持的注解

## 参数注解

|        | 获取url模板上数据的（/{id}）@DefaultValue，RestFul风格 | 获取请求参数的（包括post表单提交）键值对（?param1=10&param2=20）、可以设置defaultValue | 接收前端传递给后端的json字符串中的数据(Get请求不能使用) |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------- |
| JAX-RS |                                                        | @PathParam                                                   | @RequestBody                                            |
| Spring | @PathVariable                                          | @RequestParam                                                |                                                         |

@PathVariable：使用RestFul风格获取参数

```java
// localhost:8080/user/findOne/2
@GetMapping("/findOne/{id}")
public User findUserById(@PathVariable("id") Integer id) {
    return userService.findUserById(id);
}
```

@RequestParam：url拼接属性

```java
// localhost:8080/user/findOne?id=2
@GetMapping("/findOne")
public User findUserById(@RequestParam("id") Integer id) {
    return userService.findUserById(id);
}
```

@PathParam：url拼接属性

```java
// localhost:8080/user/findOne?id=2
@GetMapping("/findOne")
public User findUserById(@PathParam("id") Integer id) {
    return userService.findUserById(id);
}
```

## 格式化注解

```java
//注解@JsonFormat主要是后台到前台的时间格式的转换，从数据库获取出的数据展示给前端
@JsonFormat(pattern="yyyy/MM/dd",timezone = "UTC+8")
private LocalDate birthday;

//注解@DataFormat主要是前后到后台的时间格式的转换，从前端接收的数据保存到数据库
@DateTimeFormat(pattern="yyyy/MM/dd")
@Column(columnDefinition = "DATE COMMENT '员工生日'")
private LocalDate birthday;
```

## Swagger

| swagger2           | OpenAPI 3                                                    | 注解位置                         |
| ------------------ | ------------------------------------------------------------ | -------------------------------- |
| @Api               | @Tag(name = “接口类描述”)                                    | Controller 类上                  |
| @ApiOperation      | @Operation(summary =“接口方法描述”)                          | Controller 方法上                |
| @ApiImplicitParams | @Parameters                                                  | Controller 方法上                |
| @ApiImplicitParam  | @Parameter(description=“参数描述”)                           | Controller 方法上 @Parameters 里 |
| @ApiParam          | @Parameter(description=“参数描述”)                           | Controller 方法的参数上          |
| @ApiIgnore         | @Parameter(hidden = true) 或 @Operation(hidden = true) 或 @Hidden | -                                |
| @ApiModel          | @Schema                                                      | DTO类上                          |
| @ApiModelProperty  | @Schema(description=“属性描述”)                              | DTO属性上                        |
