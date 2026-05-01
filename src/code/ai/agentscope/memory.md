---
order: 6
title: Memory
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# Memory

https://java.agentscope.io/zh/task/memory.html

记忆负责管理 AgentScope 中智能体的对话历史和上下文。AgentScope 提供两种类型的记忆：

- **短期记忆 (Short-term Memory)**：存储当前会话的对话历史，需要结合 Session 进行持久化和恢复
- **长期记忆 (Long-term Memory)**：存储跨会话的用户偏好和知识，依赖外部记忆组件（如 Mem0、ReMe）自动持久化

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20260222221943765.png" style="zoom:50%;" />

**分工说明**：

- **短期记忆**：存储当前会话消息，提供给 LLM 作为上下文，支持推理循环
- **长期记忆**（独立组件）：
  - 内部集成 LLM（记忆提取/总结）和向量数据库（存储/检索）
  - **召回**：对话开始时，召回相关记忆注入短期记忆
  - **存储**：回复用户后，异步存入长期记忆进行提取和持久化

