---
order: 4
title: 查询路由
date: 2025-05-06
category: RAG
tag: RAG
timeline: true
article: true
---

# 查询路由（Query Routing）

当 RAG 系统里**只有一个知识库**时，所有查询无脑走向量检索就行；但随着业务扩展，往往会出现以下情况：

- **多库共存**：产品文档库、合同库、研发 Wiki、FAQ 库分别独立建索引。
- **多模态数据**：文本、表格、图像、代码各自有不同的索引方式。
- **不同数据源**：有的内容放在向量库，有的放在关系型数据库（MySQL / PG），有的必须走图数据库（Neo4j）。
- **不同处理方式**：简单问答走 RAG，复杂计算走 SQL/Code 工具，实时信息走 Web Search。

**查询路由** 的目标是：**根据用户问题的意图，自动把查询分发到最合适的数据源 / 工具 / 索引**，避免把所有问题都塞到同一条检索路径上造成召回噪音。

## 什么时候需要查询路由

| 信号 | 说明 |
| :--- | :--- |
| 多个知识库/索引 | 文档被拆到多个 Collection 后，需要决定查哪个 |
| 结构化 vs 非结构化 | 有些问题应该走 SQL（查数），有些应该走向量检索（查知识） |
| 实时性差异 | 新闻、价格等实时问题应走外部 API / Web Search |
| 模态不同 | 问图 / 问代码 / 问表格需要不同的检索器 |
| 成本差异 | 简单问题走轻量 FAQ 库，复杂问题才动用大向量库 + LLM |

## 路由架构总览

典型的路由流程：

```
用户 Query
    ↓
┌─────────────┐
│ 路由决策层   │ ← LLM / 分类器 / 规则 / 相似度匹配
└─────────────┘
    ↓（分发）
┌──────┬──────┬──────┬──────┐
│ KB-1 │ KB-2 │ SQL  │ Web  │
└──────┴──────┴──────┴──────┘
    ↓
  结果合并（可选）
    ↓
  LLM 生成答案
```

路由决策层的输出通常是：**一个或多个目标路由 ID + 相应的执行参数**。

## 主流路由方式

### 1. 基于 LLM 的意图识别（Logical / LLM Router）

最灵活、也最常用的方法：用 Prompt 让 LLM 直接对 Query 做分类，并输出一个路由标签。

#### 优点
- 理解能力强，能处理模糊、复合的查询。
- 无需训练数据，直接靠 Prompt 工程就能上线。
- 可以输出结构化结果（JSON），便于后续处理。

#### 缺点
- 每次路由都要调一次 LLM，有延迟和成本开销。
- 结果稳定性依赖 Prompt 质量，需要严格控制输出格式。

#### Prompt 模板

```text
你是一个查询路由专家。根据用户问题的意图，将它路由到下面其中一个知识库：

可选路由：
- product_docs：产品使用手册、功能介绍、操作指引
- api_reference：API 接口、参数说明、SDK 用法
- faq：常见问题、故障排查
- contract_kb：合同条款、法律文书、商务协议

请严格输出 JSON 格式：{"route": "xxx", "reason": "xxx"}

用户问题：{question}
输出：
```

#### 代码示例（LangChain + Pydantic）

```python
from typing import Literal
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

class RouteQuery(BaseModel):
    """路由决策"""
    route: Literal["product_docs", "api_reference", "faq", "contract_kb"] = Field(
        ..., description="目标知识库"
    )
    reason: str = Field(..., description="选择该路由的原因")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(RouteQuery)

router_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个查询路由专家。根据用户问题选择最合适的知识库。"),
    ("human", "{question}"),
])

router = router_prompt | llm

# 执行路由
decision = router.invoke({"question": "如何调用订单查询接口？"})
print(decision.route)   # → api_reference
```

拿到 `decision.route` 后，代码里再做分发：

```python
ROUTES = {
    "product_docs":  product_retriever,
    "api_reference": api_retriever,
    "faq":           faq_retriever,
    "contract_kb":   contract_retriever,
}
retriever = ROUTES[decision.route]
docs = retriever.invoke(question)
```

### 2. 嵌入相似性路由（Semantic Router）

不调 LLM，纯靠向量相似度决策：为每个路由预设一批"代表性语句"，对每个语句做 Embedding 建一个小索引。查询来了之后算与每组代表语句的平均相似度，取最高分的路由。

#### 优点
- **延迟极低**：只需要一次 Embedding + 一次向量比较。
- **成本极低**：不调用 LLM。
- **稳定性好**：相似度可量化，容易做阈值控制和监控。

#### 缺点
- **需要好的代表性语句**：每个路由要准备 10~50 条高质量示例。
- **对新意图不敏感**：没见过的表达可能路由失败，需要持续维护示例库。

#### 实现示例

```python
import numpy as np
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# 为每个路由准备一批代表性语句
ROUTE_SAMPLES = {
    "product_docs": [
        "怎么使用这个功能",
        "新建一个项目的步骤",
        "导出数据的方法",
    ],
    "api_reference": [
        "订单查询接口返回什么",
        "调用 API 需要什么参数",
        "SDK 的安装方法",
    ],
    "faq": [
        "登录失败怎么办",
        "为什么我的请求超时",
        "报错 E07 是什么意思",
    ],
}

# 预计算每个路由的向量中心
ROUTE_CENTROIDS = {
    name: np.mean(embeddings.embed_documents(samples), axis=0)
    for name, samples in ROUTE_SAMPLES.items()
}

def route(query: str, threshold: float = 0.5) -> str:
    q_vec = np.array(embeddings.embed_query(query))
    scores = {
        name: float(np.dot(q_vec, cen) / (np.linalg.norm(q_vec) * np.linalg.norm(cen)))
        for name, cen in ROUTE_CENTROIDS.items()
    }
    best = max(scores, key=scores.get)
    if scores[best] < threshold:
        return "fallback"    # 低置信度时走兜底路径
    return best
```

::: tip 开源工具
[**semantic-router**](https://github.com/aurelio-labs/semantic-router) 项目提供了开箱即用的封装，支持多种 Embedding 后端和动态路由定义，生产环境推荐使用。
:::

### 3. 规则/关键词路由

最简单也最不该被忽视的方法：直接用关键词、正则、字段匹配做路由。

```python
def rule_router(query: str) -> str:
    q = query.lower()
    if any(k in q for k in ["接口", "api", "sdk", "参数"]):
        return "api_reference"
    if any(k in q for k in ["报错", "失败", "异常"]):
        return "faq"
    if any(k in q for k in ["合同", "条款", "协议"]):
        return "contract_kb"
    return "product_docs"
```

- **优点**：0 延迟、0 成本，易调试。
- **缺点**：只能覆盖强特征词，遇到口语化表达容易失效。
- **最佳实践**：作为 LLM 路由或语义路由的**前置快筛**——命中规则直接走，未命中再交给 LLM。

### 4. 混合路由（推荐的生产方案）

实际生产系统通常会把上面的方法组合起来：

```
Query
  ↓
[规则快筛]  ← 命中 → 直接路由
  ↓ 未命中
[语义路由]  ← 高置信度 → 直接路由
  ↓ 置信度不足
[LLM 路由]  ← 兜底
```

这样可以**把 90% 以上的简单 Query 用低成本方案解决**，只有真正模糊的问题才调用 LLM，平衡了效果、延迟、成本。

## 多路并行检索（Multi-Route）

有些问题天然跨多个知识库，比如：

> "对比一下 A 产品的功能清单和 B 产品的合同承诺。"

这时候"选一个路由"不够用，需要让 LLM 输出 **一组路由** 并并行执行：

```python
class MultiRoute(BaseModel):
    routes: list[Literal["product_docs", "contract_kb", "api_reference", "faq"]]

multi_router = prompt | llm.with_structured_output(MultiRoute)

decision = multi_router.invoke({"question": "对比 A 产品功能清单和 B 产品合同条款"})

# 并行检索 + 合并
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor() as ex:
    results = list(ex.map(
        lambda r: ROUTES[r].invoke(question),
        decision.routes
    ))
all_docs = [d for sub in results for d in sub]
```

合并结果时建议**按来源标注 metadata**，让 LLM 生成答案时能区分不同来源。

## 路由对象的扩展：不只是知识库

除了路由到"哪个知识库"，同样的机制可以扩展到：

| 路由目标 | 适用场景 |
| :--- | :--- |
| **向量索引** | 多 Collection 的选择 |
| **工具 / Agent** | SQL 工具、代码执行、Web Search、计算器 |
| **Prompt 模板** | 不同问题类型用不同系统提示 |
| **模型选择** | 简单问题走小模型，复杂推理走大模型 |
| **检索参数** | 不同路由用不同的 Top-K、filter、重排策略 |

这就是 **Query Router** 和 **Agent Tool Selection** 在设计上的交叉点：从"选知识库"扩展到"选工具"，本质上是同一类问题。

## 工程注意事项

1. **路由的可观测性**：把每次路由决策（输入 Query、输出路由、置信度）记录下来，便于 badcase 回溯。
2. **置信度阈值要调**：语义路由的阈值太低会误判，太高会频繁走 fallback，需要用真实数据统计分布。
3. **Fallback 必须要有**：无论哪种路由，都要准备一个"未命中时走什么"的兜底路径，避免空结果。
4. **持续迭代示例库**：语义路由靠示例吃饭，**把线上真实 Query 定期沉淀进示例库**才能越用越准。
5. **注意路由漂移**：当业务新增知识库时，旧的路由示例可能不再适用，需要定期评估各路由的命中率和准确率。
6. **离线评估**：维护一份带标注的路由测试集，每次路由逻辑变更前先跑一遍。

## 小结

- 查询路由是 RAG 从"单库问答"走向"多源知识系统"的关键基础设施。
- **规则路由**快但覆盖有限，**语义路由**快且稳，**LLM 路由**最灵活，三者通常组合使用。
- 路由的本质不限于"选库"，也可以用来选工具、选模型、选提示。
- 生产环境必须关注路由的可观测性、置信度阈值和兜底机制。
