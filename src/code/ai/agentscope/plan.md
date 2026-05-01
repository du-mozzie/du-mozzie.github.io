---
order: 10
title: Plan
date: 2026-02-21
category: AI
tag: AI
timeline: true
article: true
---

# Plan

PlanNotebook 为智能体提供计划管理能力，帮助智能体将复杂任务分解为结构化的子任务并逐步执行。

### 启用计划功能

1. 使用默认配置

```
ReActAgent agent = ReActAgent.builder()
        .name("Assistant")
        .model(model)
        .toolkit(toolkit)
        .enablePlan()  // 启用计划功能
        .build();
```

2. 自定义配置

```
PlanNotebook planNotebook = PlanNotebook.builder()
        .maxSubtasks(10)  // 限制子任务数量
        .build();

ReActAgent agent = ReActAgent.builder()
        .name("Assistant")
        .model(model)
        .toolkit(toolkit)
        .planNotebook(planNotebook)
        .build();
```

### 为什么要使用 PlanNotebook

1. 对抗上下文噪声，锁定原始目标

   痛点：中间迷失(Lost in the Middle)

   解法：规划锚点

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602231950671.png" style="zoom: 67%;" />

2. 逻辑预演（Dry Run），避免高昂试错

   痛点：后期高耗损

   解法：提前校验

   <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602231952655.png" style="zoom:67%;" />

### PlanNotebook实现原理

- 模型通过工具操作PlanNotebook
- 用户可以直接操作PlanNotebook
- PlanNotebook 通过 hint message 提示模型

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602231955471.png" style="zoom:67%;" />

#### 默认的提示实现：DefaultPlanToHint

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202602232008290.png)

