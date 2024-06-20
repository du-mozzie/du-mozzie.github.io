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

## 分页查询

### 1. from/size方案

这是ES分页最常用的一种方案，跟mysql类似，from指定查询的起始位置，size表示从起始位置开始的文档数量

```json
GET /kibana_sample_data_ecommerce/_search
{
  "from": 0, 
  "size" : 10
}
```

ES默认的分页深度是10000，from+size超过10000就会报错

```json
{
	"error": {
		"root_cause": [{
			"type": "illegal_argument_exception",
			"reason": "Result window is too large, from + size must be less than or equal to: [10000] but was [10009]. See the scroll api for a more efficient way to request large data sets. This limit can be set by changing the [index.max_result_window] index level setting."
		}],
		"type": "search_phase_execution_exception",
		"reason": "all shards failed",
		"phase": "query",
		"grouped": true
	}
}
```

ES内部是通过`index.max_result_window`这个参数控制分页深度，ES之所以有这个限制，是因为在分布式环境下深度分页的查询效率会非常低。比如我们现在查询第from=990，size=10这样的条件，这个在业务层就是查询第990页，每页展示10条数据。

但是在ES处理的时候，会分别从每个分片上拿到1000条数据，然后在`coordinating`的节点上根据查询条件聚合出1000条记录，最后返回其中的10条。所以分页越深，ES处理的开销就大，占用内存就越大。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240619154116466.png)

### 2. search after方案

有时候我们会遇到一些业务场景，需要进行很深度的分页，但是可以不指定页数翻页，只要可以实时请求下一页就行。比如一些实时滚动的场景。

ES为这种场景提供了一种解决方案：search after。

search after利用实时有游标来帮我们解决实时滚动的问题，简单来说前一次查询的结果会返回一个唯一的字符串，下次查询带上这个字符串，进行`下一页`的查询。

```json
GET /kibana_sample_data_ecommerce/_search
{
  "size" : 2,
  "sort": [
    {
      "order_date": "desc",
      "_id": "asc"
    }
  ]
}
```

首先查询第一页数据，我这里指定取回2条，条件跟上一节一样。唯一的区别在于`sort`部分我多加了id，这个是为了在`order_date`字段一样的情况下告诉ES一个可选的排序方案。因为search after的游标是基于排序产生的。

查询结果会返回一个`sort`字段

```json
"sort" : [1580597280000,"RZz1f28BdseAsPClqbyw"]
```

在下一页查询中带上这个sort

```json
GET /kibana_sample_data_ecommerce/_search
{
  "size" : 2,
  "search_after": [1580597280000, "RZz1f28BdseAsPClqbyw"],
  "sort": [
    {
      "order_date": "desc",
      "_id": "asc"
    }
  ]
}
```

就这样一直操作就可以实现不断的查看下一页了。

因为有了排序的唯一标识，ES只需从每个分片上拿到满足条件的10条文档，然后基于这30条文档最终聚合成10条结果返回即可。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240619154857865.png)

### 3. scroll api方案

我们需要一次性或者每次查询大量的文档，但是对实时性要求并不高。ES针对这种场景提供了scroll api的方案。这个方案牺牲了实时性，但是查询效率确实非常高。

```json
POST /kibana_sample_data_ecommerce/_search?scroll=1m
{
    "size": 10
}
```

首先我们第一次查询，会生成一个当前查询条件结果的快照，后面的每次滚屏（或者叫翻页）都是基于这个快照的结果，也就是即使有新的数据进来也不会别查询到。

上面这个查询结果会返回一个`scroll_id`，拷贝过来，组成下一条查询语句，

```json
POST /_search/scroll
{
    "scroll" : "1m",
  	"scroll_id" : "FGluY2x1ZGVfY29udGV4dF91dWlkDnF1ZXJ5VGhlbkZldGNoAxRNOVI1TDVBQjQwNXNWamdheDhsbQAAAAAG3LpoFklpZjM3MTVVU1BhbjhJdmJyZzJZOFEUTkZGNUw1QUJlMG5tSHVMeHg5YUEAAAAABt5pNRZOaEdXV3JpUVFXLTh4U0ZNME1IdUN3FDFLZDVMNUFCeTAtcTc2SFd4Njk0AAAAAAbQiZUWQ1J1VllmOVhRcmVSTzFqcVpCeWtBZw"
}
```

以此类推，后面每次滚屏都把前一个的`scroll_id`复制过来。注意到，后续请求时没有了index信息，size信息等，这些都在初始请求中，只需要使用scroll_id和scroll两个参数即可。

很多人对`scroll`这个参数容易混淆，误认为是查询的限制时间。这个理解是错误的。这个时间其实指的是es把本次快照的结果缓存起来的有效时间。

scroll 参数相当于告诉了 ES我们的`search context`要保持多久，后面每个 scroll 请求都会设置一个新的过期时间，以确保我们可以一直进行下一页操作。

我们继续讨论一个问题，`scroll`这种方式为什么会比较高效？

ES的检索分为查询（query）和获取（fetch）两个阶段，query阶段比较高效，只是查询满足条件的文档id汇总起来。fetch阶段则基于每个分片的结果在coordinating节点上进行全局排序，然后最终计算出结果。

scroll查询的时候，在query阶段把符合条件的文档id保存在前面提到的`search context`里。后面每次scroll分批取回只是根据scroll_id定位到游标的位置，然后抓取size大小的结果集即可。

### 总结

- from/size方案的优点是简单，缺点是在深度分页的场景下系统开销比较大，占用较多内存。
- search after基于ES内部排序好的游标，可以实时高效的进行分页查询，但是它只能做`下一页`这样的查询场景，不能随机的指定页数查询。
- scroll方案也很高效，但是它基于快照，不能用在实时性高的业务场景，建议用在类似[报表](https://cloud.tencent.com/product/bi?from_column=20065&from=20065)导出，或者ES内部的reindex等场景。