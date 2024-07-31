---
order: 3
title: 执行流程
date: 2021-10-09
category: 
    - Spring MVC
tag: 
    - Spring MVC
timeline: true
article: true
---

- 视图阶段（JSP）

   1. 用户发送出请求到前端控制器 DispatcherServlet
   2. DispatcherServlet 收到请求调用 HandlerMapping（处理器映射器）
   3. HandlerMapping 找到具体的处理器，生成处理器对象及处理器拦截器（如果有）返回的是一个 Handler 链（责任链模式），再一起返回给 DispatcherServlet
   4. DispatcherServlet 调用 HandlerAdapter（处理器适配器）
   5. HandlerAdapter 经过适配调用具体的处理器（Handler/Controller）
   6. Controller 执行完成返回 ModelAndView 对象
   7. HandlerAdapter 将 Controller 执行结果 ModelAndView 返回给 DispatcherServlet
   8. DispatcherServlet 将 ModelAndView 传给 ViewReslover（视图解析器
   9. ViewReslover 解析后返回具体 View（视图）

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240729193930322.png)

- 前后端分离阶段（接口开发，异步请求）

  1. 用户发送出请求到前端控制器 DispatcherServlet
  2. DispatcherServlet 收到请求调用 HandlerMapping（处理器映射器）
  3. HandlerMapping 找到具体的处理器，生成处理器对象及处理器拦截器（如果有）返回的是一个 Handler 链（责任链模式），再一起返回给 DispatcherServlet
  4. DispatcherServlet 调用 HandlerAdapter（处理器适配器）
  5. HandlerAdapter 经过适配调用具体的处理器（Handler/Controller）
  6. 方法上添加了 @ResponseBody
  7. 通过 HttpMessageConverter 来返回结果转换为 JSON 并响应

  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240729194344371.png)