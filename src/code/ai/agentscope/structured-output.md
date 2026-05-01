---
order: 8
title: 结构化输出
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# 结构化输出

结构化输出让 Agent 生成符合预定义 Schema 的类型化数据，实现从自然语言到结构化数据的可靠转换。

> 使用方式

1. 定义需要的schema

   ```java
   public class ProductInfo {
       public String name;
       public Double price;
       public List<String> features;
   
       public ProductInfo() {}  // 必须有无参构造函数
   }
   ```

2. 请求结构化输出

   ```java
   // 发送查询，指定输出类型
   Msg response = agent.call(userMsg, ProductInfo.class).block();
   
   // 提取类型化数据
   ProductInfo data = response.getStructuredData(ProductInfo.class);
   
   System.out.println("产品: " + data.name);
   System.out.println("价格: $" + data.price);
   ```

### 两种模式

| 模式                  | 特点                        | 适用场景                                    |
| --------------------- | --------------------------- | ------------------------------------------- |
| `TOOL_CHOICE`（默认） | 强制调用工具，一次 API 调用 | 支持 tool_choice 的模型（qwen3-max, gpt-4） |
| `PROMPT`              | 提示词引导，可能多次调用    | 兼容老模型                                  |

```
ReActAgent agent = ReActAgent.builder()
    .name("Agent")
    .model(model)
    .structuredOutputReminder(StructuredOutputReminder.TOOL_CHOICE)  // 或 PROMPT
    .build();
```

