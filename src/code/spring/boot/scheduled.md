---
order: 10
title: 定时任务
date: 2021-10-16
category: 
    - Spring Boot
tag: 
    - Spring Boot
timeline: true
article: true
---

Spring Boot 定时任务使用说明

1. spring中6位组成，不允许第7位的年

2. 在周几的位置，1-7代表周一到周日

3. 定时任务不应该阻塞

    - 可以让业务运行以异步的方式，自己提交到线程池

        ```java
        CompletableFuture.runAsync(()->{
        	xxxService.hello();
        },executor);
        ```

    - 支持定时任务线程池；设置 TaskSchedulingProperties；

        ```yaml
        spring:
          task:
            scheduling:
              pool:
                size: 5
        ```

    - 让定时任务异步执行

        ```java
        // 开启异步任务
        @EnableAsync
        public class hello{
            
            @Async
            @Scheduled(cron = "0/5 * * * * ?")
            public void hello(){
                system.out.println("hello");
            }
        }
        
        // 自动配置类
        TaskExecutionAutoConfiguration
        // 异步任务配置
        spring.task.execution.pool.xxxx
        ```

定时任务

```java
// 启动类添加注解
@EnableScheduling

@Service
public class HelloScheduled {

    @Scheduled(cron = "0/5 * * * * ?")
    public void hello() {
        System.out.println("当前时间："+ LocalDateTime.now() + "————hello");
    }
}
```