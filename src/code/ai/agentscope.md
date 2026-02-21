---
order: 5
title: AgentScope
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

AgentScope 是阿里云公司开源的一款企业级开箱即用的智能体框架

## 什么是AgentScope

- 简单: 使用内置的 ReAct 智能体、工具、技能、人机协作、记忆、计划、实时语音、评估和模型微调轻松构建智能体应用
- 可扩展: 大量生态系统集成，包括工具、记忆和可观察性；内置 MCP 和 A2A 支持；消息中心（MsgHub）提供灵活的多智能体编排能力
- 生产就绪: 在本地、云端 Serverless 或 K8s 集群上轻松部署智能体应用，并内置 OTel 可观察性支持

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602211123542.png)

## ReAct智能体

AgentScope 提供了开箱即用的 ReAct 智能体 ReActAgent 供开发者使用。

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
                        .apiKey(ApiKeyConfigUtil.getKey(ProviderEnums.DASHSCOPE))
                        .modelName(ApiKeyConfigUtil.getModels(ProviderEnums.DASHSCOPE).get(0).get("chat"))
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

## 可观测能力

Agent Scope Studio：https://java.agentscope.io/zh/task/studio.html

### 三大基础能力：

- 项目管理
- 应用评测（企业版提供）
- 链路追踪

一个内置智能体
- Friday

### 启动项目

基于Node.Js

下载源码启动

```bash
git clone https://github.com/agentscope-ai/agentscope-studio
cd agentscope-studio
npm install
npm run dev  # 会自动启动client、server
```

前端UI：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602212128927.png)

界面访问地址：http://localhost:5173/

![](C:/Users/Du/AppData/Roaming/Typora/typora-user-images/image-20260221213532825.png)

server端：

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602212128830.png" style="zoom:50%;" />



数据默认使用sqlite存储，启动server可以看到具体存储位置

目前提供了两种上报方式

```
Traces Endpoint:
HTTP:       http://localhost:3000/v1/traces
gRPC:       http://localhost:4317
```

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602212140850.png" style="zoom:50%;" />

### Java 应用集成

依赖

```xml
<!-- Source: https://mvnrepository.com/artifact/io.agentscope/agentscope-extensions-studio -->
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope-extensions-studio</artifactId>
    <version>1.0.9</version>
    <scope>compile</scope>
</dependency>
```

初始化studio

```
// 初始化studio
StudioManager.init().studioUrl("http://localhost:3000")
        .project("AgentScope")
        .runName("Java - Demo")
        .initialize()
        .block();
```

基于hook的方式上报

```java
ReActAgent agent = ReActAgent.builder()
                    .hook(new StudioMessageHook(StudioManager.getClient()))
                    .build();
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602212215540.png)
