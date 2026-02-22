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

## Tool、MCP

LLM本质上是基于历史数据的概率预测系统，只能依赖训练时学到的旧知识来生成回答，无法获取训练之后的数据

### Tool

Tool（工具）：本质上是模型可以调用的外部接口，使得模型的能力得以延伸至其静态训练数据之外。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602221048475.png)

### MCP

MCP（Model ContextProtocol，模型上下文协议），使用统一的客户端-服务器架构实现LLM和外部数据源及工具的调用

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602221054732.png" style="zoom:50%;" />

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602221056161.png" style="zoom: 50%;" />

## RAG

AgentScope 中的 RAG 模块由两个核心组件组成：

- **Reader（读取器）**：负责读取和分块输入文档，将其转换为可处理的单元
- **Knowledge（知识库）**：负责存储文档、生成嵌入向量以及检索相关信息

### 支持范围

AgentScope 支持多种类型的知识库实现：

| 类型               | 实现               | 支持功能             | 文档管理                                          | 适用场景                    |
| ------------------ | ------------------ | -------------------- | ------------------------------------------------- | --------------------------- |
| **本地知识库**     | `SimpleKnowledge`  | 完整的文档管理和检索 | 通过代码管理（使用 Reader）                       | 开发、测试、完全控制数据    |
| **云托管知识库**   | `BailianKnowledge` | 仅检索               | [百炼控制台](https://bailian.console.aliyun.com/) | 企业级、多轮对话、查询重写  |
| **Dify 知识库**    | `DifyKnowledge`    | 仅检索               | Dify 控制台                                       | 多种检索模式、Reranking     |
| **RAGFlow 知识库** | `RAGFlowKnowledge` | 仅检索               | RAGFlow 控制台                                    | 强大OCR、知识图谱、多数据集 |

### 集成模式

AgentScope提供了两种集成模式

| 模式             | 描述                                 | 优点                 | 缺点               |
| ---------------- | ------------------------------------ | -------------------- | ------------------ |
| **Generic 模式** | 在每个推理步骤之前自动检索和注入知识 | 简单，适用于任何 LLM | 即使不需要也会检索 |
| **Agentic 模式** | Agent 使用工具决定何时检索           | 灵活，只在需要时检索 | 需要强大的推理能力 |

#### Generic 模式

通过Hook机制在推理前自动注入

**工作原理**：

1. 用户发送查询
2. 知识库自动检索相关文档
3. 检索到的文档被添加到用户消息之前
4. Agent 处理增强后的消息并响应

`.ragMode(RAGMode.GENERIC)`

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20260222170937245.png" style="zoom: 50%;" />

#### Agentic 模式

通过Tool 机制由 Agent主动调用

**工作原理**：

1. 用户发送查询
2. Agent 推理并决定是否检索知识
3. 如果需要，Agent 调用 `retrieve_knowledge(query="...")`
4. 检索到的文档作为工具结果返回
5. Agent 使用检索到的信息再次推理

`.ragMode(RAGMode.AGENTIC`

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20260222171242297.png" style="zoom:50%;" />



## 最佳实践

1. **分块大小**：根据模型的上下文窗口和使用场景选择分块大小。典型值：256-1024 个字符。
2. **重叠**：使用 10-20% 的重叠以保持块之间的上下文连续性。
3. **分数阈值**：从 0.3-0.5 开始，根据检索质量调整。
4. **Top-K**：初始检索 3-5 个文档，根据上下文窗口限制调整。
5. **模式选择**：
   - 使用 **Generic 模式**：简单问答、一致的检索模式、较弱的 LLM
   - 使用 **Agentic 模式**：复杂任务、选择性检索、强大的 LLM
6. **向量存储选择**：
   - 使用 **InMemoryStore**：开发、测试、小型数据集（<10K 文档）
   - 使用 **QdrantStore**：生产环境、大型数据集、需要持久化
   - 使用 **ElasticsearchStore**: 生产环境、大型数据集、私有部署服务。

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

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20260222214531095.png" style="zoom:50%;" />

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
