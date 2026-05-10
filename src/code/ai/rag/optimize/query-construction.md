---
order: 1
title: 元数据过滤
date: 2025-05-06
category: RAG
tag: RAG
timeline: true
article: true
---

# 元数据过滤（Metadata Filtering）

在构建向量索引时，文档块（Chunk）通常不会只存"正文 + 向量"，还会附加一批**元数据（Metadata）**，例如文档来源、发布日期、作者、章节、类别、标签等。这些元数据让我们在语义搜索之外还能进行**精确过滤**，也就是常说的 **"先筛选，再向量检索"（Pre-filtering）** 或 **"先向量检索，再筛选"（Post-filtering）**。

相比纯向量检索，元数据过滤带来三个直接收益：

1. **准确率更高**：提前把不相关文档（过期、非目标部门、非目标产品线）排除在外，向量检索的"噪声"显著下降。
2. **性能更好**：筛选后的候选集更小，ANN 搜索更快，尤其在多租户场景下至关重要。
3. **支持精确语义**：比如"只查 2024 年之后的技术规范""只查 A 部门的合同"——这些条件是向量相似度无法表达的。

## 元数据的来源与设计

### 元数据的典型来源

| 来源类型 | 示例字段 | 说明 |
| :--- | :--- | :--- |
| **文档级**（加载时提取） | `source`、`file_type`、`author`、`created_at`、`updated_at` | 文档共享的基础信息 |
| **结构级**（分块时生成） | `title_path`、`section`、`page_number`、`heading_level` | 文档内部结构，如 Markdown 标题链 |
| **业务级**（人工或规则打标） | `department`、`product_line`、`permission_level`、`tags` | 业务侧定义，通常是过滤核心 |
| **语义级**（LLM 抽取） | `topic`、`entity`、`keywords`、`summary` | 由 LLM 对 chunk 内容抽取，适合做自动分类 |

### 设计元数据字段的几条原则

1. **可枚举优先**：类别、部门、产品线等字段尽量用枚举值，不要自由文本。便于索引和过滤。
2. **控制基数**：高基数字段（如用户 ID）谨慎作为过滤字段，否则索引膨胀严重。
3. **统一时间格式**：日期建议用 ISO 8601 或 Unix 时间戳，便于范围过滤。
4. **预留扩展字段**：业务变化频繁时，预留一个 `extra` JSON 字段，避免频繁重建索引。
5. **命名规范**：统一用小写 snake_case，避免大小写不一致导致过滤失效。

## 过滤的三种使用模式

### 1. Pre-filtering（先过滤，再检索）

先按元数据条件筛掉不符合的候选，再在剩余集合上做 ANN 检索。

- **优点**：候选集小，检索快；不会出现"召回回来但被过滤掉导致 Top-K 不足"的问题。
- **缺点**：如果过滤条件匹配的文档非常多，ANN 索引可能退化为近似线性扫描；反之过滤后文档过少，又会影响召回多样性。
- **适用**：过滤条件能把候选集控制在合理规模（几千到几十万）。
- **主流向量库**（Milvus、Qdrant、Weaviate、Pinecone）目前默认都是 Pre-filtering。

### 2. Post-filtering（先检索，再过滤）

先做 ANN 检索拿 Top-K，再用元数据过滤。

- **优点**：实现简单，不需要向量库特殊支持。
- **缺点**：可能出现"召回 50 条，过滤后只剩 2 条"的情况，需要预留较大的 K。
- **适用**：过滤条件命中率较高、或者做轻量二次筛选。

### 3. In-filtering（检索时同步过滤）

向量库内部在 ANN 搜索过程中就把元数据条件代入判断（例如 Milvus 的 `expr`、Qdrant 的 `filter`）。

- 这是目前主流向量库的**标准做法**，性能最佳。
- 为保证效率，过滤字段必须**建立标量索引（Scalar Index）**。

## 实施步骤

### 1. 索引阶段：写入元数据

以 Milvus 为例，建表时声明元数据字段并建立标量索引：

```python
from pymilvus import FieldSchema, CollectionSchema, DataType, Collection, connections

connections.connect(host="localhost", port="19530")

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1024),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
    # —— 元数据字段 ——
    FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=256),
    FieldSchema(name="department", dtype=DataType.VARCHAR, max_length=64),
    FieldSchema(name="created_at", dtype=DataType.INT64),
    FieldSchema(name="tags", dtype=DataType.ARRAY, element_type=DataType.VARCHAR,
                max_capacity=16, max_length=32),
]
schema = CollectionSchema(fields, description="knowledge base")
col = Collection("kb", schema=schema)

# 向量索引
col.create_index("embedding", {"index_type": "HNSW", "metric_type": "COSINE",
                               "params": {"M": 16, "efConstruction": 200}})
# 标量索引（极大提升过滤性能）
col.create_index("department", {"index_type": "INVERTED"})
col.create_index("created_at", {"index_type": "STL_SORT"})
```

::: tip
主流向量库都支持标量索引，过滤字段**一定要建索引**，否则高过滤率下性能会急剧退化。
:::

### 2. 查询阶段：手写过滤表达式

最直接的方式是由业务代码根据用户意图拼接过滤条件：

```python
expr = 'department == "研发" and created_at >= 1704067200 and "API" in tags'

results = col.search(
    data=[query_vector],
    anns_field="embedding",
    param={"metric_type": "COSINE", "params": {"ef": 128}},
    limit=10,
    expr=expr,
    output_fields=["text", "source", "department", "created_at"],
)
```

这种方式适合**条件固定**的场景，比如"只查当前登录用户所属部门的文档"、"只查近 30 天的数据"。

### 3. 自查询检索器（Self-Query Retriever）

用户自然语言查询里往往同时包含**语义意图**和**结构化条件**，例如：

> "找出 2024 年之后关于 **Milvus 性能优化** 的博客，作者是 zilliz 团队的。"

可以让 LLM 把这句话**自动拆解**为：

- `query = "Milvus 性能优化"`
- `filter = year >= 2024 AND author == "zilliz"`

这就是 LangChain 的 **SelfQueryRetriever** 要做的事。

```python
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.chains.query_constructor.base import AttributeInfo
from langchain_openai import ChatOpenAI

# 1. 描述每个元数据字段，供 LLM 理解
metadata_field_info = [
    AttributeInfo(name="author", description="文档作者", type="string"),
    AttributeInfo(name="year", description="发布年份", type="integer"),
    AttributeInfo(name="tags", description="文档标签列表", type="list[string]"),
]

retriever = SelfQueryRetriever.from_llm(
    llm=ChatOpenAI(model="gpt-4o-mini", temperature=0),
    vectorstore=vectorstore,
    document_contents="技术博客正文",
    metadata_field_info=metadata_field_info,
    verbose=True,
)

docs = retriever.invoke(
    "找出 2024 年之后关于 Milvus 性能优化的博客，作者是 zilliz 团队的"
)
```

执行时 LLM 会输出一个结构化的 Query 对象（语义部分 + 过滤部分），框架再把过滤部分翻译成目标向量库的 `expr` 语法。

### 4. 动态元数据（权限过滤）

企业场景里最常见的过滤是"**权限隔离**"：不同用户只能看自己有权限的文档。做法：

1. 在每条 chunk 上附加 `permission_level`、`owner_dept`、`visible_roles` 等字段。
2. 查询时从登录态获取当前用户的权限集合，拼接到过滤表达式里。
3. **过滤必须在向量库层面完成**，不能在应用层 Post-filter，否则会存在"召回后被裁剪，返回给用户的文档不足"或越权风险。

```python
# 假设当前用户属于 ["研发", "安全"] 部门，角色为 "普通员工"
user_depts = ["研发", "安全"]
user_role = "普通员工"

expr = f'department in {user_depts} and "{user_role}" in visible_roles'
```

## 最佳实践与避坑

1. **过滤字段一定要建标量索引**，否则高过滤率时 ANN 会退化。
2. **避免"空召回"**：过滤条件过严时结果可能为空，建议：
   - 预设降级策略，例如逐步放宽时间范围。
   - 当结果数低于阈值时，去掉部分过滤条件再查一次。
3. **时间字段统一存时间戳**，便于范围比较，避免字符串比较踩坑。
4. **多租户场景用 Partition Key**：Milvus、Qdrant 等支持按某字段做物理分区，比 expr 过滤更快。
5. **监控过滤命中率**：如果某个过滤条件常年命中率接近 0%，说明元数据设计或数据打标出了问题。
6. **元数据抽取要做验证**：LLM 抽取的 tags/topic 需要人工抽检，避免错误元数据污染索引。

## 小结

- 元数据过滤是 RAG 从"能用"到"好用"的关键一步，尤其在企业知识库、权限隔离场景下几乎是**必选项**。
- 元数据设计要尽量"可枚举、低基数、格式统一"。
- 生产环境优先使用向量库内置的 In-filtering，并为过滤字段建立标量索引。
- 对含有结构化条件的自然语言查询，用 **SelfQueryRetriever** 自动生成过滤表达式，能显著提升用户体验。
