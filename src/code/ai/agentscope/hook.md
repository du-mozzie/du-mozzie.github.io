---
order: 3
title: Hook
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# Hook

AgentScopeJava使用统一事件模型，所有Hook都需要实现onEvent（HookEvent）方法。Hook典型应用场景包括：监控、上下文压缩、日志、限流等。

- **基于事件**：所有智能体活动生成事件
- **类型安全**：对事件类型进行模式匹配
- **优先级排序**：钩子按优先级执行（值越小优先级越高）
- **可修改**：某些事件允许修改执行上下文

### 支持的事件

| 事件类型            | 时机         | 可修改 | 描述                                 |
| ------------------- | ------------ | ------ | ------------------------------------ |
| PreCallEvent        | 智能体调用前 | ❌      | 智能体开始处理之前（仅通知）         |
| PostCallEvent       | 智能体调用后 | ✅      | 智能体完成响应之后（可修改最终消息） |
| PreReasoningEvent   | 推理前       | ✅      | LLM 推理之前（可修改输入消息）       |
| PostReasoningEvent  | 推理后       | ✅      | LLM 推理完成之后（可修改推理结果）   |
| ReasoningChunkEvent | 推理流式期间 | ❌      | 流式推理的每个块（仅通知）           |
| PreActingEvent      | 工具执行前   | ✅      | 工具执行之前（可修改工具参数）       |
| PostActingEvent     | 工具执行后   | ✅      | 工具执行之后（可修改工具结果）       |
| ActingChunkEvent    | 工具流式期间 | ❌      | 工具执行进度块（仅通知）             |
| ErrorEvent          | 发生错误时   | ❌      | 发生错误时（仅通知）                 |

### 使用教程

1. 自定义一个hook

   ```java
   public class LoggingHook implements Hook {
   
       @Override
       public <T extends HookEvent> Mono<T> onEvent(T event) {
   
           if (event instanceof PreCallEvent) {
               System.out.println("智能体启动: " + event.getAgent().getName());
               return Mono.just(event);
           }
   
           if (event instanceof PostCallEvent) {
               System.out.println("智能体完成: " + event.getAgent().getName());
               return Mono.just(event);
           }
   
           return Mono.just(event);
       }
   }
   ```

2. 使用

   ```java
   public static void main(String[] args) {
       ReActAgent agent = ReActAgent.builder()
               .name("ai_assistant")
               .model(model)
               .hooks(List.of(new LoggingHook()))
               .build();
   
       Msg msg = Msg.builder()
               .textContent("2022年世界杯冠军")
               .build();
   
       Msg response = agent.call(msg).block();
       System.out.println(response.getTextContent());
   }
   ```

   ```
   智能体启动: ai_assistant
   智能体完成: ai_assistant
   2022年卡塔尔世界杯的冠军是**阿根廷队**。
   
   在决赛中，阿根廷队与法国队在常规时间和加时赛战成3-3平，最终通过点球大战以4-2击败对手，夺得冠军。这也是莱昂内尔·梅西（Lionel Messi）职业生涯中首次捧起大力神杯。
   ```

