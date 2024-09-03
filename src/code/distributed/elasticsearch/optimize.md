---
order: 4
title: 调优
date: 2022-03-22
category: 
    - ElasticSearch
    - 分布式
    - 搜索引擎
tag: 
    - ElasticSearch
    - 分布式
    - 搜索引擎
timeline: true
article: true	
---

## 异常情况

### 集群健康状态

**GREEN**是最健康的状态，说明所有的分片包括副本都可用。这种情况Elasticsearch集群所有的主分片和副本分片都已分配，Elasticsearch集群是100%可用的。

**YELLOW**：主分片可用，但是副本分片不可用。这种情况Elasticsearch集群所有的主分片已经分配了，但至少还有一个副本是未分配的。不会有数据丢失，所以搜索结果依然是完整的。不过，集群高可用性在某种程度上会被弱化。可以把yellow想象成一个需要关注的warnning，该情况不影响索引读写，一般会自动恢复。

**RED**：存在不可用的主分片。此时执行查询虽然部分数据仍然可以查到，但实际上已经影响到索引读写，需要重点关注。这种情况Elasticsearch集群至少一个主分片（以及它的全部副本）都在缺失中。这意味着索引已缺少数据，搜索只能返回部分数据，而分配到这个分片上的请求都返回异常。

[Elasticsearch集群异常状态（RED、YELLOW）原因分析](https://cloud.tencent.com/developer/article/1803943)

[干货 | Elasticsearch集群黄色原因的终极探秘](https://blog.csdn.net/laoyang360/article/details/81271491)

## 优化

ElasticSearch的一些调优案例汇总

**案例：**

[infoq](https://www.infoq.cn/article/wymrl5h80sfawg8u7ede)

**文档：**

[ES详解 - 优化：ElasticSearch性能优化详解](https://www.pdai.tech/md/db/nosql-es/elasticsearch-y-peformance.html)

[elasticsearch三个重要的优化](https://zhaoyanblog.com/archives/319.html)

[Elasticsearch重要文章之五：预加载fielddata](https://zhaoyanblog.com/archives/764.html)

[万字长文：可能是最全面的 Elasticsearch 性能调优指南](https://www.modb.pro/db/582082)

[腾讯云ES：让你的ES查询性能起飞：Elasticsearch 查询优化攻略“一网打尽”](https://cloud.tencent.com/developer/article/2175753)

[腾讯：腾讯万亿级 Elasticsearch 技术实践](https://www.pdai.tech/md/db/nosql-es/elasticsearch-z-tencent.html)

[博客【ES高手之路】](https://xiaoxiami.gitbook.io/elasticsearch/)

[ElasticSearch 写入调优](https://www.modb.pro/db/541037)

[哈啰技术：记录一次ElasticSearch的查询性能优化](https://mp.weixin.qq.com/s?__biz=MzI3OTE3ODk4MQ==&mid=2247486047&idx=1&sn=b3ab21da891df124c03e628eb3851b4c&chksm=eb4af1d5dc3d78c3be8995c0e16674f47598f907185dac03919f0c4d0a26ea4a71a0543390bf&cur_album_id=2167592080448028675&scene=190#rd)

[美团外卖搜索基于Elasticsearch的优化实践](https://tech.meituan.com/2022/11/17/elasicsearch-optimization-practice-based-on-run-length-encoding.html)

[es在数据量很大的情况下（数十亿级别）如何提高查询效率](https://blog.csdn.net/cuiwjava/article/details/104341713/)

### 预加载

设置 **index.store.preload** ，用于预加载索引数据到文件系统缓存中。通过预加载索引数据，可以提高搜索性能，尤其是在首次查询时。

以下是一些常见文件类型及其作用：

- **nvd（Norms file）**：包含字段规范化数据，通常用于排序和打分。
- **tim（Term index file）**：包含术语索引数据，用于加速查询。
- **doc（Document index file）**：包含文档数据，直接用于查询结果的返回。
- **dim（Doc values file）**：包含字段数据，用于聚合和排序。
- **tip（Term dictionary file）**：包含术语字典，用于加速查询。

> 创建索引时设置：

```json
PUT /index
{
  "settings": {
    "index.store.preload": ["nvd", "tim", "doc"]
  }
}
```

> 索引存在时设置

1. 关闭索引

   ```json
   POST /index/_close
   ```

2. 添加预加载文件配置

   ```json
   PUT /index/_settings
   {
     "index.store.preload": ["tim"]
   }
   ```
   
3. 打开索引

   ```json
   POST /index/_open
   ```

**关闭索引时如果正在写入数据会被拒绝写入，需要进行处理**

> 示例设置：

以下是几个示例设置，供参考：

设置1：高查询频率索引

```json
PUT /high_frequency_index/_settings
{
  "index.store.preload": ["nvd", "tim", "doc", "dim"]
}
```

设置2：部分字段查询索引

```json
PUT /partial_field_index/_settings
{
  "index.store.preload": ["nvd", "tim"]
}
```

设置3：资源受限环境

```json
PUT /limited_resources_index/_settings
{
  "index.store.preload": ["tim"]
}
```