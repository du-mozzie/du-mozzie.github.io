---
order: 2
title: RAG 评估常用工具
date: 2026-05-11
category: RAG
tag: RAG
timeline: true
article: true
---

# RAG 评估常用工具

RAG 评估工具大致可以分成三类：

1. **框架内嵌型**：和 RAG 开发框架深度绑定，适合开发阶段快速验证。
2. **独立评估型**：和具体框架解耦，适合做离线评估、版本对比和回归测试。
3. **可观测性平台型**：面向线上运行数据，适合追踪链路、分析 Bad Case 和持续监控。

参考这个分类，常见工具可以这样定位：

| 工具 | 类型 | 核心价值 | 适合阶段 |
| :--- | :--- | :--- | :--- |
| LlamaIndex Evaluation | 框架内嵌型 | 在 LlamaIndex 应用中快速评估检索和响应质量 | 开发、实验、策略对比 |
| RAGAS | 独立评估型 | 用标准指标量化 RAG Pipeline，支持无参考评估 | 离线评估、CI 回归、版本对比 |
| Phoenix | 可观测性平台型 | 通过 Trace 可视化 RAG 链路，定位线上问题 | 调试、监控、生产诊断 |

## 1. LlamaIndex Evaluation

`LlamaIndex Evaluation` 是 LlamaIndex 框架内置的评估模块。它适合已经使用 LlamaIndex 构建 RAG 应用的项目，因为评估器、数据集、查询引擎可以直接复用框架对象。

它的核心思路是：用 LLM 作为评估器，对检索结果或生成答案进行自动打分。

### 1.1 典型工作流

```text
准备文档或评估数据集
  -> 构建一个或多个 QueryEngine
  -> 初始化评估器
  -> 批量执行评估
  -> 汇总不同策略的分数
```

常见评估器包括：

| 评估器 | 作用 |
| :--- | :--- |
| FaithfulnessEvaluator | 判断答案是否被上下文支持 |
| RelevancyEvaluator | 判断答案是否和问题相关 |
| CorrectnessEvaluator | 对比答案和标准答案是否一致 |
| RetrieverEvaluator | 评估检索命中率、MRR 等检索指标 |

### 1.2 示例：对比两种检索策略

例如想比较“普通 Chunk 检索”和“句子窗口检索”，可以让两套 QueryEngine 跑同一批问题，再比较忠实度和相关性。

```python
from llama_index.core.evaluation import (
    FaithfulnessEvaluator,
    RelevancyEvaluator,
    BatchEvalRunner,
)

evaluators = {
    "faithfulness": FaithfulnessEvaluator(llm=llm),
    "relevancy": RelevancyEvaluator(llm=llm),
}

runner = BatchEvalRunner(evaluators, workers=2, show_progress=True)

base_results = await runner.aevaluate_queries(
    query_engine=base_query_engine,
    queries=queries,
)

window_results = await runner.aevaluate_queries(
    query_engine=sentence_window_query_engine,
    queries=queries,
)
```

评估完成后，可以统计不同策略的平均分：

```python
def pass_rate(results, metric_name: str) -> float:
    metric_results = results[metric_name]
    passed = [r.passing for r in metric_results]
    return sum(passed) / len(passed)

print("普通检索 Faithfulness:", pass_rate(base_results, "faithfulness"))
print("句子窗口 Faithfulness:", pass_rate(window_results, "faithfulness"))
```

### 1.3 适用场景

适合使用 LlamaIndex Evaluation 的情况：

- 项目本身已经基于 LlamaIndex。
- 需要快速比较多个 QueryEngine。
- 开发阶段想验证 Chunk、Retriever、Reranker、Prompt 的变化。
- 希望用较少胶水代码跑响应评估。

不太适合的情况：

- RAG Pipeline 不是 LlamaIndex 构建的。
- 需要跨框架统一评估。
- 需要更完整的生产观测和 Trace 分析。

## 2. RAGAS

`RAGAS` 是一个独立的 RAG 评估框架，它不要求你的应用必须使用某个 RAG 开发框架。只要能整理出问题、答案、上下文和可选标准答案，就可以跑评估。

RAGAS 的核心思想是围绕下面几类对象建立指标：

```text
question：用户问题
contexts：检索上下文
answer：RAG 生成答案
ground_truth：标准答案，可选但很有价值
```

### 2.1 核心指标

| 指标 | 评估对象 | 是否通常需要标准答案 | 含义 |
| :--- | :--- | :--- | :--- |
| faithfulness | answer + contexts | 否 | 答案中的信息是否被上下文支持 |
| answer_relevancy | question + answer | 否 | 答案是否切题 |
| context_precision | question + contexts | 可选 | 检索上下文的相关性和排序质量 |
| context_recall | ground_truth + contexts | 是 | 标准答案所需信息是否被上下文召回 |
| answer_correctness | answer + ground_truth | 是 | 答案和标准答案是否一致 |

### 2.2 数据格式

一个最小评估样本可以长这样：

```python
dataset = [
    {
        "question": "PF-2048 电源模块故障码 E07 如何处理？",
        "answer": "应检查输入电压，复位保护开关；若仍报警则更换模块。",
        "contexts": [
            "E07 表示输入电压异常。处理步骤：检查输入电压，复位保护开关；故障持续时更换电源模块。"
        ],
        "ground_truth": "先检查输入电压，再复位保护开关；若仍报警需更换模块。",
    }
]
```

如果没有 `ground_truth`，仍然可以评估 `faithfulness`、`answer_relevancy` 等无参考指标；但如果要评估 `context_recall` 和 `answer_correctness`，标准答案会非常重要。

### 2.3 示例流程

```python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)

eval_dataset = Dataset.from_list(dataset)

result = evaluate(
    eval_dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall,
    ],
)

print(result)
```

RAGAS 很适合做版本对比：

```text
baseline pipeline
  -> 跑完整评估集
  -> 记录指标

new pipeline
  -> 跑同一评估集
  -> 与 baseline 对比
  -> 如果核心指标下降超过阈值，则阻止上线
```

### 2.4 适用场景

适合使用 RAGAS 的情况：

- 需要和具体 RAG 框架解耦。
- 需要固定评估集做版本回归。
- 希望把评估接入 CI 或发布流程。
- 想快速获得 Faithfulness、Context Precision、Context Recall 等指标。

需要注意：

- 自动评估不等于真理，关键业务场景仍然需要人工抽检。
- 指标受评估模型、Prompt、数据质量影响。
- 无参考评估成本低，但有标准答案时结果通常更可靠。

## 3. Phoenix

`Phoenix` 是 Arize 维护的开源 LLM 可观测性与评估平台。它更像是 RAG 系统的调试和监控工作台，而不是单纯的离线打分脚本。

Phoenix 的核心价值是 Trace：把一次 RAG 请求中的检索、重排、压缩、生成、评估等步骤记录下来，然后在 UI 中可视化分析。

```text
用户请求
  -> Retriever span
  -> Reranker span
  -> LLM generation span
  -> Evaluator span
  -> Trace UI 分析
```

### 3.1 能解决什么问题

Phoenix 适合回答这类问题：

- 某个 Bad Case 到底是检索错了，还是生成错了？
- 哪类用户问题最容易出现低 Faithfulness？
- 哪些文档经常被召回但贡献低？
- 新版本上线后，延迟、成本、答案质量是否漂移？
- 线上失败样本如何沉淀成新的评估集？

### 3.2 典型工作流

```text
应用接入 OpenTelemetry / Phoenix Instrumentation
  -> 自动采集 LLM、Retriever、Embedding 等调用 Trace
  -> 在 Phoenix UI 中查看请求链路
  -> 对低分样本做切片、筛选、聚类
  -> 使用 Phoenix Evals 或外部评估器打分
  -> 将 Bad Case 回流到离线评估集
```

一个工程闭环可以这样设计：

```text
线上 Trace
  -> Phoenix 发现 Bad Case
  -> 人工标注或修正样本
  -> 加入 RAGAS 离线评估集
  -> 优化检索 / Prompt / 数据
  -> CI 回归评估
  -> 重新上线观察
```

### 3.3 适用场景

适合使用 Phoenix 的情况：

- RAG 应用已经进入联调或生产阶段。
- 需要看完整调用链路，而不是只看最终答案。
- 需要对线上请求做持续监控和 Bad Case 分析。
- 需要把真实用户数据反哺到评估集和系统优化中。

不太适合的情况：

- 只是写一个离线实验脚本。
- 项目规模很小，暂时不需要 Trace 和可视化诊断。
- 团队还没有稳定评估集，先用 RAGAS 或框架内置评估更轻。

## 4. 工具选型建议

三类工具不是互斥关系，而是对应 RAG 生命周期的不同阶段。

| 阶段 | 推荐工具 | 目标 |
| :--- | :--- | :--- |
| 原型开发 | LlamaIndex Evaluation | 快速验证 Retriever、Prompt、Chunk 策略 |
| 离线回归 | RAGAS | 固定评估集，对比版本质量变化 |
| 线上诊断 | Phoenix | 追踪请求链路，定位 Bad Case 和质量漂移 |

一个比较实用的组合是：

```text
开发阶段：LlamaIndex Evaluation 快速试错
测试阶段：RAGAS 跑固定评估集，做版本门禁
生产阶段：Phoenix 采集 Trace，持续发现新问题
```

## 5. 对比表

| 维度 | LlamaIndex Evaluation | RAGAS | Phoenix |
| :--- | :--- | :--- | :--- |
| 定位 | 框架内评估模块 | 独立评估框架 | 可观测性与评估平台 |
| 框架绑定 | 强，适合 LlamaIndex | 弱，数据格式对齐即可 | 弱，通过 Trace 接入 |
| 主要对象 | QueryEngine、Retriever、Response | question、answer、contexts、ground_truth | Trace、Span、线上样本 |
| 强项 | 开发期快速实验 | 指标标准化、回归评估 | 可视化诊断、生产监控 |
| 成本 | 中 | 中 | 接入成本较高 |
| 最佳使用方式 | 策略对比 | CI / 离线评估 | Bad Case 分析和监控 |

## 6. 落地清单

如果要在项目中真正把评估工具用起来，可以按下面的顺序推进：

1. **先定义评估集格式**：统一 `question`、`contexts`、`answer`、`ground_truth`、`relevant_doc_ids`。
2. **跑一个 Baseline**：记录当前系统的检索指标和响应指标。
3. **固定核心指标**：至少包括 Recall@K、Precision@K、Faithfulness、Answer Relevance。
4. **设置回归阈值**：例如 Faithfulness 下降超过 3% 就阻止发布。
5. **保留 Bad Case**：每次低分样本都要归因到检索、生成、数据或产品需求。
6. **定期更新评估集**：从线上 Trace、用户反馈和人工标注中补充新样本。
7. **人工校准自动评估器**：定期抽样检查评估模型是否误判。

## 小结

- LlamaIndex Evaluation 适合开发阶段，在 LlamaIndex 体系内快速比较不同 RAG 策略。
- RAGAS 适合离线评估和回归测试，是跨框架做质量门禁的常用选择。
- Phoenix 适合生产诊断，通过 Trace 把 RAG 请求的每一步摊开来看。
- 工具只是载体，真正关键的是固定评估集、明确指标、保留 Bad Case，并把评估结果反哺到系统优化。

## 参考资料

- [Datawhale：评估常用工具](https://datawhalechina.github.io/all-in-rag/#/chapter6/19_common_tools)
- [LlamaIndex：Evaluating](https://docs.llamaindex.ai/en/stable/module_guides/evaluating/)
- [RAGAS Docs](https://docs.ragas.io/en/stable/)
- [Arize Phoenix Docs](https://arize.com/docs/phoenix)

