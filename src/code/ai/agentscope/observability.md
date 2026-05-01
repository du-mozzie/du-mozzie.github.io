---
order: 9
title: 可观测能力
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# 可观测能力

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

