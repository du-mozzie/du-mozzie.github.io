---
order: 3
title: Plan
date: 2026-07-30
category: 
    - AI
    - Agent
tag: 
    - AI
    - Agent
timeline: true
article: true
---

Agent 的 Plan 机制

## Plan的基本思路

1. 先分析用户需求
2. 再收集相关信息
3. 然后执行任务
4. 最后总结输出。

实际上步骤只是其中的一个部分，是表现形态，也是我们最终看到的产物。在这之前，还有很多的步骤，很多的内部信息，是我们需要关注的。

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608302144685.png" style="zoom:50%;" />

## 不确定性

Plan 的本质就是解决执行中的不确定性。

1. 目标不确定性
2. 上下文不确定性
3. 路径不确定性
4. 过程不确定性
5. 失败的不确定性

Plan 不只是步骤列表，而是一个可检查、可纠偏、可执行的运行时对象。

## G4C

这个方法论叫做 G4C，是五个单词的首字母的缩写，也是一个好的 Plan 至少要包含的内容：Goal、Context、Choice、Checkpoint、Correction。

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608302146567.png" style="zoom: 67%;" />

|            | 核心问题                     | 缺失后果                           |
| ---------- | ---------------------------- | ---------------------------------- |
| Goal       | 我要达成什么？什么叫成功？   | 目标漂移                           |
| Context    | 当前知道什么？还缺什么？     | 凭空 Plan，无中生有，幻觉          |
| Choice     | 为什么这么走？还有哪些路径？ | 生成机械步骤，无法根据情况实时制定 |
| Checkpoint | 怎么知道当前步骤对不对？     | 无法及时发现问题，发现问题只能重来 |
| Correction | 发现偏差后怎么办？           | 无法恢复，只能重来                 |

Goal 解决要去哪，Context 解决现在啥情况，Choice 解决怎么走，Checkpoint 解决怎么知道走偏了，Correction 解决走偏之后怎么拉回来。

### goal

目标需要给出具体的标准。通常专属领域的 Agent 可以做得更好，因为这些 Agent 可以预测到用户会有一些什么需求。

```json
{
    "goal": {
        "user_goal": "优化项目经历，使其适合阿里 Java 后端面试",
        "success_criteria": [
            "体现技术复杂度",
            "体现个人贡献",
            "体现业务价值",
            "能支撑面试官追问",
            "不虚构用户没有做过的内容"
        ]
    }
}
```

### Context

Plan 阶段的重要目标就是要搞清楚上下文中：当前已经知道什么？还缺什么？哪些信息可信？哪些信息不能乱用？

约束：在生成 Plan 和执行 Plan 的时候，最重要的就是保证约束的地位。将约束分成硬约束和软约束，在上下文中独立维护，硬约束通常放在系统提示词中，agent更容易遵循

```json
{
    "context": {
        "known_facts": [
            "用户认为项目偏 CRUD",
            "目标岗位是 Java 后端",
            "目标公司是阿里",
            "用户希望同时生成面试追问"
        ],
        "missing_info": [
            "项目背景",
            "技术栈",
            "业务规模",
            "用户负责模块",
            "性能或稳定性数据",
            "实际做过的优化"
        ]
    }
}
```

### Choice

关键决策与路径选择，本质上就是回答一个问题：有什么路径可选以及为什么选这个路径。

```json
{
    "choice": {
        "selected_path": "先抽取和补齐项目事实，再生成项目亮点，最后生成面试追问",
        "reason": "如果直接包装，容易违反不能虚构的要求；面试追问应该基于最终项目亮点生成",
        "steps": [
            {
                "id": "extract_project_facts",
                "objective": "抽取已有项目事实"
            },
            {
                "id": "ask_missing_info",
                "objective": "追问缺失的关键信息"
            },
            {
                "id": "generate_project_highlights",
                "objective": "生成项目亮点"
            },
            {
                "id": "rewrite_project_experience",
                "objective": "改写项目经历"
            },
            {
                "id": "generate_interview_questions",
                "objective": "基于项目亮点生成面试追问"
            }
        ]
    }
}
```

### checkpoint

检查点和过程校验，作用是：

1. 在 Plan 执行过程中，防止偏离。没有 Checkpoint，Agent 就只能一路执行到最后，然后输出一个看起来完整但可能完全错误的结果。
2. 为后续的重 Plan 和根因查找提供依据，在 Agent 出错了之后，可以通过检查点来快速排查、定位问题根源。

```json
{
    "checkpoint": [
        {
            "step_id": "extract_project_facts",
            "checks": [
                "是否区分事实和推测",
                "是否识别出缺失信息",
                "是否保留用户硬约束"
            ]
        },
        {
            "step_id": "rewrite_project_experience",
            "checks": [
                "是否存在虚构内容",
                "是否体现技术复杂度",
                "是否有量化结果",
                "是否适配阿里 Java 后端面试"
            ]
        }
    ]
}
```

### Correction

纠偏机制与失败恢复，要解决的问题是一旦出错了，我还能不能挣扎一下，试着拯救一下。常规的手段有几种：

- 重试：重试还可以进一步细分重试当前步骤、重试局部流程以及从头开始重试。一般工具偶发失败、模型输出格式错误、网络超时等问题只需要重试一下就可以。
- Replan ：不同于重试，重试并不修改原 Plan，而 Replan 则是认定 Plan 本身有问题，所以才需要重新生成一个 Plan。
- 澄清：提前对缺失、存在歧义 context 提前向用户进行一个确认，尽可能找用户收集了足够的信息而后再执行。
- 回滚：如果中途发现数据、状态有错误，可以尝试将状态回滚到某一个步骤之前。而这个回滚一般是和 Checkpoint 配合使用的。
- 中断：确实是错了，而且是不可挽回的错误，这个时候就只能中断并告知用户出错了，由用户来决定后续要做什么。

```json
{
    "correction": [
        {
            "condition": "缺少关键项目信息",
            "action": "向用户澄清"
        },
        {
            "condition": "生成内容包含未经确认的事实",
            "action": "回滚到事实抽取阶段"
        },
        {
            "condition": "用户否认某个技术点",
            "action": "删除该技术点并局部 Replan"
        },
        {
            "condition": "面试追问无法从项目经历中推导",
            "action": "重新生成项目亮点或降低表达强度"
        }
    ]
}
```

## Prompt

1. 给出非常明确的目标，对形容词有一个清晰的标准，可以支持去RAG或知识库检索定义好的一些标准。
2. 强调约束，这些约束在多轮对话中一般是通过专门的摘要提取步骤，或者直接就是一个约束提取步骤提取而来，每一个约束的修改都需要有用户输入作为证据。
3. 生成 Plan 步骤的时候，要强调输出路径以及选择路径的理由，解决方案，必须要有根据，也就是 evidence-based
4. 生成检查点的时候，要注意一个粒度的问题。
   - 每次从业务逻辑上达到了一个新的状态了，就要确定一个检查点。
   - 关键中间步骤完成。
   - 容易出错的步骤，后面设定一个检查点。
5. 纠偏机制，在提示词里面列举不同的业务失败场景，以及对应的纠偏做法。

## 评估 plan

1. 用大模型离线分析生成的 Plan，离线分析的时候可以做到比较细致，可以围绕G4C来做评测

2. 线上评估：关键指标

| 指标 | 解释 |
| :--- | :--- |
| Plan 完成率 | 按 Plan 完成任务的比例，你通过 Prometheus 可以监控到 |
| 步骤成功率 | 每个步骤执行成功率，同样可以通过 Prometheus 监控 |
| 重 Plan 触发率 | 执行中需要重 Plan 的比例，同样通过 Prometheus 监控 |
| 用户纠正率 | 用户说“不是这个意思”“你理解错了”的比例，这需要在用户输入之后引入一个评估 / 观察步骤，比较麻烦。 |
| 最终任务成功率 | 用户目标是否达成。这个其实也不太好评，因为 Plan 完成并不等于最终任务成功，更加不等于达成用户目标，但是可以认为一般情况下任务完成，Plan 质量就挺不错的。 |

### 迭代式 Plan

类似ReAct之类的循环，生成 - 评估 - 修正循环，Plan 生成之后不要马上输出或者执行，而是先做审查

引入一个评估器（Plan Verifier），在生成plan的时候就运行，评估器发现问题后输出如下内容

```json
{
    "score": 0.78, // 这个你需要给出一些评分标准，不然就只能让大模型自由发挥
    "goal_issues": [],
    "context_issues": [
        "没有识别出用户实际负责模块缺失"
    ],
    "choice_issues": [
        "当前Plan直接生成项目描述，存在虚构风险"
    ],
    "checkpoint_issues": [
        "缺少事实一致性检查"
    ],
    "correction_issues": [
        "没有定义用户否认技术点后的回滚策略"
    ],
    "suggestions": [
        "先追问用户实际负责内容",
        "增加事实一致性检查",
        "增加局部 Replan 条件"
    ]
}
```

### DAG式 Plan

生成 Plan 的时候，要求大模型识别不同步骤之间的依赖关系，进而生成一个 DAG。

核心是先识别依赖关系，而后再根据依赖关系生成 DAG

```json
{
    "nodes": [
        // ...
        {
            "id": "generate_highlights",
            "depends_on": [
                "extract_project_facts",
                "analyze_target_role"
            ],
        },
        // ...
    ]
}
```

少部分情况下，例如说依赖关系带属性的，可以考虑使用这种结构：

```json
"edges": [
   {
       src: "extract_project_facts",
       dst: "generate_highlights",
       attrs: {}
   }
]
```

