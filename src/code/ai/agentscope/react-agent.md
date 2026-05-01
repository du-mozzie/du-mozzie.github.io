---
order: 2
title: ReAct智能体
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# ReAct智能体

AgentScope 提供了开箱即用的 ReAct 智能体 ReActAgent 供开发者使用。

ReActAgent 是框架提供的主要实现，使用 ReAct 算法（推理 + 行动循环）

它同时支持以下功能：

- **基础功能**
    - 支持围绕 `reasoning` 和 `acting` 的钩子函数（hooks）
    - 支持结构化输出
- **实时介入（Realtime Steering）**
    - 支持用户中断
    - 支持自定义中断处理
- **工具**
    - 支持同步/异步工具函数
    - 支持流式工具响应
    - 支持并行工具调用
    - 支持 MCP 服务器
- **记忆**
    - 支持智能体自主管理长期记忆
    - 支持"静态"的长期记忆管理

一个简单的demo：

```java
public class HelloReActAgent {

    public static void main(String[] args) {
        // 准备工具
        Toolkit toolkit = new Toolkit();
        toolkit.registerTool(new SimpleTools());

        // 创建智能体
        ReActAgent jarvis = ReActAgent.builder()
                .name("Jarvis")
                .sysPrompt("你是一个名为 Jarvis 的助手")
                .model(DashScopeChatModel.builder()
                    .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                    .modelName("qwen3-max")
                    .build())
                .toolkit(toolkit)
                .build();

        // 发送消息
        Msg msg = Msg.builder()
                .textContent("你好！Jarvis，现在几点了？")
                .build();

        Msg response = jarvis.call(msg).block();
        System.out.println(response.getTextContent());
    }
}

// 工具类
class SimpleTools {
    @Tool(name = "get_time", description = "获取当前时间")
    public String getTime(
            @ToolParam(name = "zone", description = "时区，例如：北京") String zone) {
        return java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602212044628.png)

### 支持的模型

| 提供商    | 类                   | 流式 | 工具 | 视觉 | 推理 |
| --------- | -------------------- | ---- | ---- | ---- | ---- |
| DashScope | `DashScopeChatModel` | ✅    | ✅    | ✅    | ✅    |
| OpenAI    | `OpenAIChatModel`    | ✅    | ✅    | ✅    |      |
| Anthropic | `AnthropicChatModel` | ✅    | ✅    | ✅    | ✅    |
| Gemini    | `GeminiChatModel`    | ✅    | ✅    | ✅    | ✅    |
| Ollama    | `OllamaChatModel`    | ✅    | ✅    | ✅    | ✅    |

- `OpenAIChatModel` 兼容 OpenAI API 规范，可用于 vLLM、DeepSeek 等提供商
- `GeminiChatModel` 同时支持 Gemini API 和 Vertex AI

通过 `GenerateOptions` 配置模型生成参数：

| 参数             | 类型       | 说明                |
| ---------------- | ---------- | ------------------- |
| `temperature`    | Double     | 控制随机性，0.0-2.0 |
| `topP`           | Double     | 核采样阈值，0.0-1.0 |
| `topK`           | Integer    | 限制候选 token 数量 |
| `maxTokens`      | Integer    | 最大生成 token 数   |
| `thinkingBudget` | Integer    | 思考 token 预算     |
| `seed`           | Long       | 随机种子            |
| `toolChoice`     | ToolChoice | 工具选择策略        |

