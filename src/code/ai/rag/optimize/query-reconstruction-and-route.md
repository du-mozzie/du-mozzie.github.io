---
order: 3
title: 查询重构
date: 2025-05-06
category: RAG
tag: RAG
timeline: true
article: true
---

# 查询重构（Query Rewriting）

在真实的 RAG 场景中，用户的原始 Query 很少是"检索友好"的：

- **口语化、省略语**：如"那个接口超时的问题怎么处理？"——缺少上下文。
- **过长、包含多个子问题**：如"Milvus 和 Qdrant 在数据结构、索引类型、分布式架构上各有什么区别？"——一次查不清楚。
- **过于具体**：细节描述过多，反而和文档中的抽象表述对不上。
- **与文档风格不对齐**：用户问的是"怎么办"，文档写的是"XX 的原理与实现"——向量相似度低。

**查询重构** 的核心思路是：**在进入向量检索之前，先对 Query 做一次变换，让它更符合检索侧的语义分布，从而提升召回质量**。下面介绍四种主流方法。

## 1. 查询改写（Query Rewriting）

最直接的做法：通过一段 Prompt 让 LLM 把用户原始 Query 改写得更清晰、更具体、更接近文档的叙述风格。

### 使用场景

- 原始 Query 存在指代（"那个"、"它"）——借助对话历史补全。
- 口语化表达需要转成书面语。
- 用户问"现象"，而文档只描述"原因"——改写成更贴近原因的描述。

### Prompt 模板

```text
你是一个检索助手。请根据以下对话历史和当前问题，把问题改写成一个独立、完整、
利于在技术文档中检索的查询。保留原始意图，不要回答问题，只输出改写后的查询。

对话历史：
{history}

当前问题：{question}

改写后的查询：
```

### 代码示例

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

rewriter = ChatPromptTemplate.from_template(
    "把下面的用户问题改写为更适合在技术文档中检索的独立问题，"
    "不要回答问题，只输出改写后的问题。\n\n问题：{question}\n\n改写："
) | ChatOpenAI(model="gpt-4o-mini", temperature=0)

rewritten = rewriter.invoke({"question": "那个超时的怎么处理"}).content
docs = retriever.invoke(rewritten)
```

::: tip 成本建议
改写用**小模型**（如 `gpt-4o-mini`、`qwen-turbo`）就够用，没必要动用 GPT-4 级模型。
:::

## 2. 多查询拆分（Multi-Query / Sub-Query）

对于**包含多个子问题**的复合查询，一次检索很难覆盖所有维度。思路：

1. 让 LLM 把原始 Query 拆分成 **N 个独立的子查询**。
2. 并行执行每个子查询的向量检索。
3. 将所有召回结果合并去重后送入 LLM。

### 典型场景

- "**对比型**"问题：A 和 B 的区别。
- "**多维度**"问题：某个产品的功能、价格、售后各是什么。
- "**因果链**"问题：现象 → 原因 → 解决方案。

### Prompt 模板

```text
你是一名查询拆解专家。请将下面的复杂问题拆分为 3~5 个独立的、可以分别检索的子问题，
每个子问题一行，不要编号。

原始问题：{question}

子问题：
```

### 代码示例（LangChain MultiQueryRetriever）

```python
from langchain.retrievers.multi_query import MultiQueryRetriever

multi_retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    llm=ChatOpenAI(model="gpt-4o-mini", temperature=0),
)

# MultiQueryRetriever 会：
# 1. 用 LLM 生成 3 个变体问题
# 2. 分别检索
# 3. 自动合并去重
docs = multi_retriever.invoke(
    "Milvus 和 Qdrant 在数据结构、索引类型、分布式架构上各有什么区别？"
)
```

### RAG-Fusion：拆分 + RRF

**RAG-Fusion** 是多查询拆分的增强版：

1. 用 LLM 生成多个变体查询。
2. 每个变体独立检索 Top-K。
3. 用 **RRF（倒数排名融合）** 合并排序，而不是简单去重。

这样能显著提升综合召回的排序质量，尤其适合高相关性要求的场景。

## 3. 退步提示（Step-Back Prompting）

由 Google DeepMind 在 [Take a Step Back](https://arxiv.org/abs/2310.06117) 中提出。核心观察：**当问题过于具体时，模型容易陷入细节而丢掉全局；先"后退一步"问一个更抽象的问题，再基于抽象答案回答具体问题，效果反而更好**。

### 原理

给定一个具体问题，LLM 先生成一个更抽象、更本质的"上位问题"（Step-Back Question），然后：

- **两次检索**：分别用原问题和上位问题做检索。
- **合并上下文**：把两路召回的文档一起送给 LLM 生成最终答案。

### 举个例子

| 类型 | 内容 |
| :--- | :--- |
| 原问题 | 爱因斯坦在 1905 年 3 月到 5 月之间工作在哪里？ |
| 退步问题 | 爱因斯坦的职业履历是什么？ |

直接检索"1905 年 3 月到 5 月"可能找不到精确记录，但检索"爱因斯坦的职业履历"能拿到更完整的背景，再由 LLM 在这个背景里定位具体时间段就容易多了。

### Prompt 模板

```text
你的任务是对用户的具体问题进行抽象，得到一个更上位、更本质的问题。

示例：
原问题：爱因斯坦在 1905 年 3 月到 5 月之间工作在哪里？
退步问题：爱因斯坦的职业履历是什么？

原问题：{question}
退步问题：
```

### 适用场景

- **细节类事实问题**：涉及具体时间、地点、数字，但知识库更多是宏观叙述。
- **原理解释类问题**："为什么 X 会导致 Y？" → 先问"X 是什么 / Y 是什么"。
- **长尾、罕见问题**：原问题命中率低，退步问题能拿到相关背景知识。

## 4. 假设性文档嵌入（HyDE）

**HyDE**（Hypothetical Document Embeddings）出自 [Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496)，思路很"反直觉"但很有效：

> **不要直接嵌入用户的问题，而是先让 LLM"瞎编"一份假设性的答案文档，再用这份文档的向量去检索真实文档。**

### 为什么有效？

问题和答案的**语义分布本来就不同**：问题通常短、疑问句式，答案通常长、陈述句式。直接用问题的向量去匹配答案段落，向量距离往往不够近。而 LLM 生成的"假答案"与真实文档在句式和词汇上**更接近**，因此检索效果更好——即使假答案里的事实是错的也没关系，反正只用它的向量。

### 工作流程

1. 用 LLM 生成假设性答案（可以生成多份，提升稳定性）。
2. 对假设答案做 Embedding。
3. 用这份向量去向量库检索。
4. 拿到真实文档后，再交给 LLM 生成最终回答。

### Prompt 模板

```text
请针对下面的问题，写一段简洁、具体的答案段落（150 字以内）。
答案可以是推测性的，不要求 100% 正确，但要语言流畅、符合技术文档风格。

问题：{question}

假设性答案：
```

### 代码示例

```python
from langchain.chains import HypotheticalDocumentEmbedder
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

base_embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

hyde_embeddings = HypotheticalDocumentEmbedder.from_llm(
    llm=llm,
    base_embeddings=base_embeddings,
    prompt_key="web_search",    # 内置的几种 Prompt 模板之一
)

query_vector = hyde_embeddings.embed_query("Milvus 的 HNSW 索引是怎么构建的？")
# 之后用 query_vector 去向量库检索
```

### 适用场景与局限

- ✅ **检索召回率不足**、Query 与文档风格差异大的场景。
- ✅ Zero-shot 场景（没有训练数据微调 Embedding 模型）。
- ⚠️ 延迟会增加一次 LLM 调用。
- ⚠️ 不适合问题本身包含强关键词的场景（如编号、CVE 号），容易被 LLM"发散"写偏。

## 方法选型对照表

| 方法 | 适用场景 | 额外延迟 | 复杂度 | 稳定性 |
| :--- | :--- | :--- | :--- | :--- |
| 查询改写 | 口语化、含指代、需要上下文补全 | 低（1 次 LLM） | 低 | 高 |
| 多查询拆分 | 复合问题、多维度对比 | 中（1+N 次检索） | 中 | 中高 |
| RAG-Fusion | 高相关性要求的检索 | 中 | 中 | 高 |
| Step-Back | 细节问题、原理解释 | 中（2 次检索） | 中 | 中高 |
| HyDE | 问题 / 文档分布差异大 | 高（LLM 生成假文档） | 中 | 中（依赖 LLM 质量） |

## 组合使用

这几种方法**不是互斥的**，实际系统里经常组合使用。常见的组合：

1. **改写 + 多查询 + RRF**：先把 Query 改写干净，再拆分成多个变体，用 RRF 合并结果。
2. **HyDE + 混合检索**：HyDE 的向量走稠密检索，原 Query 走稀疏检索，再 RRF 融合。
3. **改写 + Step-Back**：改写后再退一步，兼顾具体和宏观。

## 工程注意事项

1. **延迟预算**：每多一次 LLM 调用就多 100ms~1s，要想清楚哪些步骤必须做。
2. **缓存**：对重复出现的 Query，改写、子查询、HyDE 的结果都应缓存。
3. **降级策略**：当 LLM 调用失败时，必须回退到原始 Query 直接检索，不能整体报错。
4. **效果评估**：**一定要离线评估**，常用指标是 Recall@K、MRR。线上凭感觉调只会越调越乱。
5. **Token 成本**：多查询 + HyDE 会显著放大 Prompt 长度，成本敏感的场景要监控。

## 小结

- 查询重构的本质是**让 Query 和 Doc 处在更接近的语义空间**。
- **改写**解决表达不清；**多查询**解决复合问题；**Step-Back**解决细节偏差；**HyDE**解决分布差异。
- 不同方法可组合，但要根据延迟和成本做取舍。
- 生产环境务必做缓存、降级和离线评估。
