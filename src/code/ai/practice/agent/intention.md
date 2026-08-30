---
order: 2
title: 意图识别
date: 2026-01-15
category: 
    - AI
    - Agent
tag: 
    - AI
    - Agent
timeline: true
article: true
---

本文是关于自己学习agent工程中意图识别

## 提高意图识别准确率的方法

### Slot filling

通过对不同的意图建立结构化的槽位，思路就是仔细告诉大模型需要识别哪些参数，并且要对识别之后的参数进行检查。例如说用户输入“帮我推荐一台笔记本，主要是写代码，最好轻一点”。

系统应该输出的是：

```json
{
  "intent": "product_recommendation",
  "slots": {
      "category": "笔记本电脑",
      "usage_scenario": "写代码",
      "soft_preferences": ["轻一点"] },
      "missing_slots": ["budget_max"],
      "need_clarification": false 
	}
}
```

其中有一个字段 `missing_slots` 也就是描述用户的输入是缺少了有关预算的参数。

missing_slots 这个字段涉及到了 Slot Filling 的高级做法：结合上下文，在 ReAct/TAO 循环中补全所有的槽位，确保 missing_slots 为空，如图：

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301504703.png" style="zoom: 67%;" />

### 层次意图

层次意图的基本理念是将意图按照菜单那样来组织，分为一级意图、二级意图等。

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301505783.png" alt="image-20260830150514445" style="zoom:50%;" />

这种机制可以和 Slot filling 混合使用，最终达成的效果就非常接近 ReAct/TAO 的范式

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301506732.png" alt="image-20260830150626625" style="zoom:67%;" />

### 结合检索的意图识别

适合系统意图很多的情况，并且原始积累了大量的用户输入数据，具体做法是在意图识别之前先加一个检索的步骤，而后只把有可能的意图传递给大模型，让它进一步筛选。

同时检索可以比较好的识别一些用户输入的行业黑话，通过对用户的行业黑话进行向量打标

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301509291.png" alt="image-20260830150907008" style="zoom:50%;" />

意图非常多的时候也可以使用一个轻量的大模型先做一个筛选，不一定要使用检索

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301511373.png" style="zoom:50%;" />

### 动态 few-shot

few-shot 的做法是将样例放入提示词中，如果全部放进去，Prompt 会变得很长，如果只放几个固定示例，又可能和当前用户输入关系不大，这个时候我们会考虑动态 few-shot。

相应的解决方案是将 few-shot 案例全部放入到数据库中（可以是普通的数据库，也可以是 Elasticsearc，还可以是向量数据库），在拼接提示词的时候，先去检索一些相关性最强的 few-shot。

从理论上来说，few-shot 应该包含两个部分：不变的部分和可变的部分，不变的部分主要是针对一些特别的场景，要求大模型无论在何种场景下都要考虑进去。如 unclear 怎么处理，unsupported 怎么处理……可变的部分是跟当前用户的输入、上下文相关性比较强的 few-shot，整个提示词的 few-shot 部分的模板大概长这样：

```
# few-shot
固定的 few-shot 直接在 Prompt 里面写死
## few-shot 1 xxx
--动态的few-shot案例，结合搜索注入--
{{ .DynamicFewShots }}
```

### 保证意图正交

意图正交说的是要确保不同的意图之间的功能和职责是相互独立的，避免彼此之间有重叠或冲突。

1. 拆分一个新的意图

   <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301539647.png" style="zoom:67%;" />

2. 将相似度高的意图合并为一个，进一步要求大模型识别出来一些参数，而后自己写一个工具，根据参数识别准确的意图

   <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202608301540338.png" style="zoom: 50%;" />

## 意图识别评测

意图识别主要对以下关键指标进行评测：

1. Top-K Accuracy：意图识别K个候选项正确答案的比例。
2. 拒识准确率：应该拒识的时候，系统是否拒识。
3. 误拒率：本来能处理，却被系统错误拒识。
4. 漏拒率：本来应该拒识，却被系统强行归类。
5. 澄清触发准确率：缺少关键信息时，是否正确追问。
6. 澄清后收敛率：追问之后，用户任务是否顺利推进。

如果有使用Slot Filling，通常会评测如下指标：

1. 槽位准确率：抽出来的槽位值是否正确。
2. 槽位召回率：用户提供的信息有没有被抽出来。
3. 必填槽位完整率：启动流程必须的槽位是否齐备。
4. 槽位更新准确率：多轮对话中新信息是否正确覆盖旧信息。
5. 约束识别准确率：硬约束和软偏好是否识别正确。