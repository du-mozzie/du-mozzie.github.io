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