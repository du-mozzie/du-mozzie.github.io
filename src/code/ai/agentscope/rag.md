---
order: 7
title: RAG
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# RAG

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



### 最佳实践

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

