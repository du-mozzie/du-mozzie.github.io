---
order: 2
title: 混合检索
date: 2025-05-06
category: RAG
tag: RAG
timeline: true
article: true
---

# 混合检索

在 RAG 系统的默认实现中，**稠密向量（Dense Vector）检索** 是最常用的召回方式。它擅长捕捉语义相近的表达（例如 “汽车” 与 “轿车”），但在面对**专有名词、型号编号、人名、代码标识符**等需要“精确字面匹配”的场景时，经常会出现漏检或误召回。

**混合检索（Hybrid Search）** 的思路是：同时使用**稀疏向量（Sparse Vector）** 与**稠密向量（Dense Vector）**两种检索方式，将两路结果进行融合排序，从而兼顾“字面匹配”与“语义匹配”的优势。

## 稠密向量 vs 稀疏向量

| 维度 | 稠密向量（Dense） | 稀疏向量（Sparse） |
| :--- | :--- | :--- |
| 表示形式 | 低维（数百到数千）实数向量，几乎每一维都非零 | 高维（词表大小，通常数万～百万）向量，绝大多数维为 0 |
| 生成方式 | 基于深度学习的 Embedding 模型（如 BGE、text-embedding-3） | 基于词袋（BM25、TF-IDF）或学习式稀疏模型（SPLADE） |
| 擅长场景 | 语义相似、同义改写、跨语言检索 | 关键词、实体、代号、罕见词的精确命中 |
| 弱点 | 对未登录词、专有名词不敏感 | 无法理解同义改写，词形不一致就召不回 |
| 可解释性 | 低（黑盒） | 高（可定位到具体命中词） |

典型的稀疏检索算法是 **BM25**，其核心思想是：词频（TF）越高越相关，但要用文档长度做归一化，并用**逆文档频率（IDF）** 惩罚常见词，从而凸显罕见关键词的作用。学习式稀疏模型（如 SPLADE）则在此基础上，利用 Transformer 为每个查询/文档预测一份“重要词 + 权重”的稀疏表示，既保留了可解释性，又引入了一定的语义扩展能力。

## 为什么需要混合检索

实际 RAG 场景中，以下几种情况纯稠密向量都很难搞定：

1. **型号/编号类查询**：“PF-2048 电源模块的故障代码 E07 是什么意思？”——E07、PF-2048 这类标识符对 Embedding 基本等于噪声。
2. **专有名词与缩写**：“CVE-2024-3094 的影响范围？”——向量模型不一定见过这个 CVE。
3. **代码片段与 API 名**：“`ConcurrentHashMap.computeIfAbsent` 的死锁场景”——标识符必须字面命中。
4. **短查询**：关键词只有一两个时，稠密向量的区分度很低，BM25 反而更稳。

结论：**稠密负责召回“意思相近”的内容，稀疏负责兜住“词必须对上”的内容**，两者互补。

## 融合策略

两路检索出来后，需要用一个策略把结果合并成一个最终列表，常见的有三种。

### RRF（Reciprocal Rank Fusion，倒数排名融合）

这是目前最流行、也最稳的融合方法，Elasticsearch、Milvus、Weaviate 都内置了这种融合方法。对任一文档 $d$，在第 $i$ 路检索中的排名为 $r_i(d)$，则：

$$
\text{RRF}(d) = \sum_i \frac{1}{k + r_i(d)}
$$

- $k$ 是平滑常数，经验值 60。
- **只依赖排名、不依赖原始分数**，因此不需要对 BM25 分和向量相似度做归一化，鲁棒性极高。
- 排名越靠前贡献越大，第 1 名的贡献远大于第 100 名。

伪代码：

```python
def rrf(result_lists, k: int = 60, top_k: int = 10):
    scores = {}
    for results in result_lists:          # results: List[doc_id]，按相关性降序
        for rank, doc_id in enumerate(results, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: -x[1])[:top_k]
```

### 加权线性融合（Weighted Sum）

对两路分数做归一化后加权求和：

$$
\text{score}(d) = \alpha \cdot s_{\text{dense}}(d) + (1 - \alpha) \cdot s_{\text{sparse}}(d)
$$

- 需要先把 BM25 分和余弦相似度做 Min-Max 或 Z-score 归一化。
- 权重 $\alpha$ 需要根据业务调参，通常 $\alpha \in [0.5, 0.7]$。
- 简单直观，但对分数分布敏感，两路分数尺度不一致时容易翻车。

### 基于 Reranker 的重排

粗排阶段用稀疏 + 稠密各召回 Top-K（比如各 50 条），合并去重后送入 **Cross-Encoder 重排模型**（如 BGE-Reranker、Cohere Rerank）做精排。

- 重排器会把 “查询 + 文档” 一起送进模型打分，精度远高于双塔向量。
- 代价是延迟更高，通常只对 Top 20~50 做重排。
- 实践中常见的组合是：**BM25 + 稠密向量 → RRF 粗排 → Reranker 精排**。

## 实施步骤

以下是一套通用、可落地的混合检索落地路径。

### 1. 索引构建阶段

同一份文档块（chunk）需要**同时写入两种索引**：

1. **稠密索引**：用 Embedding 模型（如 `bge-m3`、`text-embedding-3-large`）把 chunk 编码成向量，写入向量库（Milvus / Qdrant / Weaviate / Elasticsearch 等）。
2. **稀疏索引**：
   - 传统方案：倒排索引 + BM25（ES、OpenSearch 原生支持）。
   - 进阶方案：用 **SPLADE** 或 **BGE-M3 的稀疏输出** 预先算好稀疏向量，写入支持稀疏向量的库（Milvus 2.4+ / Qdrant / Weaviate）。

::: tip 推荐模型
**BGE-M3** 一次前向传播同时输出稠密向量、稀疏向量、多向量（ColBERT 风格）三种表示，非常适合混合检索场景，能省掉维护两套模型的成本。
:::

### 2. 检索阶段

1. 把用户 Query 同时送入稠密编码器和稀疏编码器，分别得到稠密向量和稀疏向量。
2. 并行发起两路检索，各召回 Top-K（K 通常取 20~100）。
3. 用 RRF 或加权求和做融合，得到一个统一的候选列表。
4. 可选：对 Top-N 做 Cross-Encoder 重排。
5. 取最终的 Top-k 作为上下文送给 LLM。

### 3. 工程要点

- **候选池大小**：两路的 Top-K 不宜过小，否则融合效果会退化。经验值：稠密 50 + 稀疏 50 → RRF 后取 Top 10。
- **去重**：按 chunk_id 或内容哈希去重，避免同一段内容在两路都命中时重复出现。
- **超时与降级**：稀疏一路（尤其是 ES）通常比较快，稠密一路偶尔会被向量库拖慢，要设置超时 + 降级策略——即使一路失败，另一路也能单独返回结果。
- **评估指标**：用 Recall@K、MRR、nDCG 做 A/B，**一定要离线评估**，不要只靠肉眼感觉。

## 代码示例（LangChain + Milvus）

```python
from langchain_community.retrievers import BM25Retriever
from langchain_milvus import Milvus
from langchain.retrievers import EnsembleRetriever
from langchain_huggingface import HuggingFaceEmbeddings

# 1. 稠密检索器
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
dense_retriever = Milvus(
    embedding_function=embeddings,
    collection_name="kb",
    connection_args={"host": "localhost", "port": "19530"},
).as_retriever(search_kwargs={"k": 50})

# 2. 稀疏检索器（这里用 BM25 做演示，生产建议用 ES/OpenSearch）
sparse_retriever = BM25Retriever.from_documents(docs)
sparse_retriever.k = 50

# 3. EnsembleRetriever 内置 RRF 融合
hybrid_retriever = EnsembleRetriever(
    retrievers=[dense_retriever, sparse_retriever],
    weights=[0.5, 0.5],   # 加权版；如需纯 RRF 可使用 search_type="rrf"
)

results = hybrid_retriever.invoke("PF-2048 电源模块的故障代码 E07 是什么意思？")
```

## 小结

- 纯稠密向量在语义场景强，但对关键词、编号、专有名词等易漏召回。
- 稀疏检索（BM25 / SPLADE）在字面匹配上不可替代。
- **混合检索 = 稠密 + 稀疏 + 融合策略（RRF 优先）**，在大多数企业级 RAG 场景中都能带来显著的召回率和准确率提升。
- 追求极致效果时，再叠加一层 Cross-Encoder Reranker，性价比最高。
