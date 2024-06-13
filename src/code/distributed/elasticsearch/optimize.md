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

ElasticSearch的一些调优案例汇总

**案例：**

[infoq](https://www.infoq.cn/article/wymrl5h80sfawg8u7ede)

**文档：**

[**elasticsearch三个重要的优化**](https://zhaoyanblog.com/archives/319.html)

[**Elasticsearch重要文章之五：预加载fielddata**](https://zhaoyanblog.com/archives/764.html)

[**万字长文：可能是最全面的 Elasticsearch 性能调优指南**](https://www.modb.pro/db/582082)

[**【腾讯云ES】让你的ES查询性能起飞：Elasticsearch 查询优化攻略“一网打尽”**](https://cloud.tencent.com/developer/article/2175753)

[**博客【ES高手之路】**](https://xiaoxiami.gitbook.io/elasticsearch/)

[**写入调优**](https://www.modb.pro/db/541037)

## 异常情况

### 集群健康状态

**GREEN**是最健康的状态，说明所有的分片包括副本都可用。这种情况Elasticsearch集群所有的主分片和副本分片都已分配，Elasticsearch集群是100%可用的。

**YELLOW**：主分片可用，但是副本分片不可用。这种情况Elasticsearch集群所有的主分片已经分配了，但至少还有一个副本是未分配的。不会有数据丢失，所以搜索结果依然是完整的。不过，集群高可用性在某种程度上会被弱化。可以把yellow想象成一个需要关注的warnning，该情况不影响索引读写，一般会自动恢复。

**RED**：存在不可用的主分片。此时执行查询虽然部分数据仍然可以查到，但实际上已经影响到索引读写，需要重点关注。这种情况Elasticsearch集群至少一个主分片（以及它的全部副本）都在缺失中。这意味着索引已缺少数据，搜索只能返回部分数据，而分配到这个分片上的请求都返回异常。

[Elasticsearch集群异常状态（RED、YELLOW）原因分析](https://cloud.tencent.com/developer/article/1803943)

[干货 | Elasticsearch集群黄色原因的终极探秘](https://blog.csdn.net/laoyang360/article/details/81271491)