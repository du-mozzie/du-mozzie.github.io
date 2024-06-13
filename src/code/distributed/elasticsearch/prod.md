---
order: 5
title: 生产实践
date: 2023-08-11
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

工作中的一些ElasticSearch相关实践

## 如何进行分片设置

```java
PUT /my_index
{
  "settings": {
    "number_of_shards": 3,         // 设置主分片数量为3
    "number_of_replicas": 1        // 设置副本分片数量为1
  }
}
```

通常来说都需要为每个主分片设置一个副本分片

## 集群监控

Kibana

Grafana