---
order: 4
title: Tool
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# Tool

LLM本质上是基于历史数据的概率预测系统，只能依赖训练时学到的旧知识来生成回答，无法获取训练之后的数据，工具系统让智能体能够执行 API 调用、数据库查询、文件操作等外部操作。

使用 `Toolkit` 管理代理工具的注册、检索和执行

### 核心特性

- **注解驱动**：使用 `@Tool` 和 `@ToolParam` 快速定义工具
- **响应式编程**：原生支持 `Mono`/`Flux` 异步执行
- **自动 Schema**：自动生成 JSON Schema 供 LLM 理解
- **工具组管理**：动态激活/停用工具集合
- **预设参数**：隐藏敏感参数（如 API Key）
- **并行执行**：支持多工具并行调用

Tool（工具）：本质上是模型可以调用的外部接口，使得模型的能力得以延伸至其静态训练数据之外。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602221048475.png)

### 使用教程

1. 定义工具

```java
public static class WeatherService {
    @Tool(description = "获取指定城市的天气")
    public String getWeather(
            @ToolParam(name = "city", description = "城市名称") String city) {
        // 模拟获取天气数据
        return city + " 的天气：晴天，25°C";
    }
}
```

**注意**：`@ToolParam` 的 `name` 属性必须指定，因为 Java 默认不保留参数名。

2. 注册和使用

```java
Toolkit toolkit = new Toolkit();
toolkit.registerTool(new WeatherService());

ReActAgent agent = ReActAgent.builder()
    .name("助手")
    .model(model)
    .toolkit(toolkit)
    .build();

Msg msg = Msg.builder()
        .textContent("你好！北京的天气怎么样")
        .build();

Msg response = agent.call(msg).block();
System.out.println(response.getTextContent());
```

```
您好！根据最新的天气信息，北京今天的天气是晴天，气温为25°C。天气很不错，适合外出活动！
```

### Tool Group

#### 为什么需要工具组

企业级智能体通常会有多个智能体，会存在如下问题

- 工具决策正确率降低，Agent没法正确完成任务
- token耗费增多、响应延迟变大
- 错误的工具调用存在安全隐患

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602232022094.png" style="zoom:50%;" />

#### 工具分组机制

1. 默认分组不激活

    - 所有工具按照类型分好组

    - 给出每组工具的基础信息

    - 默认情况下工具都不激活

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602232024696.png" style="zoom:50%;" />

2. Mate Tool，`enableMetaTool(boolean enableMetaTool)` 发现未被激活的工具

   - 初始态下只注册一个元工具

   - LLM通过其来查询具体工具信息

   - 模型按需决定激活哪些分组信息

   - 激活工具后才会附带上工具信息
   
   <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602232027508.png" style="zoom:50%;" />


#### 使用方式

按场景管理工具，支持动态激活/停用：

```java
// 创建工具组
toolkit.createToolGroup("basic", "基础工具", true);   // 默认激活
toolkit.createToolGroup("admin", "管理工具", false);  // 默认停用

// 注册到工具组
toolkit.registration()
    .tool(new BasicTools())
    .group("basic")
    .apply();

// 动态切换
toolkit.updateToolGroups(List.of("admin"), true);   // 激活
toolkit.updateToolGroups(List.of("basic"), false);  // 停用

ReActAgent agent = ReActAgent.builder()
    .name("助手")
    .model(model)
    .toolkit(toolkit)
    .enableMetaTool(true) // 通过元工具发现未被激活的工具
    .build();
```

