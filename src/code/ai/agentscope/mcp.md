---
order: 5
title: MCP
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# MCP

MCP（Model ContextProtocol，模型上下文协议），使用统一的客户端-服务器架构实现LLM和外部数据源及工具的调用

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602221054732.png" style="zoom:50%;" />

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602221056161.png" style="zoom: 50%;" />

### 使用教程

1. 创建一个MCP Client 注册到Toolkit

   ```java
   Toolkit toolkit = new Toolkit();
   // 
   McpClientBuilder builder = McpClientBuilder.create("mcp").sseTransport("https://mcp.higress.ai/mcp-calendar-holiday-helper/xxxx/sse");
   McpClientWrapper client = builder.buildAsync().block();
   // 注册到Toolkit
   toolkit.registerMcpClient(client);
   ```

2. 使用

   ```java
   ReActAgent agent = ReActAgent.builder()
           .name("mcp_assistant")
           .model(model)
           .toolkit(toolkit)
           .build();
   
   Msg msg = Msg.builder()
           .textContent("查询一下2026年的春节是几号")
           .build();
   
   Msg response = agent.call(msg).block();
   System.out.println(response.getTextContent());
   ```

   ```
   2026年的春节是公历**2026年2月17日**（农历丙午年正月初一）
   ```

