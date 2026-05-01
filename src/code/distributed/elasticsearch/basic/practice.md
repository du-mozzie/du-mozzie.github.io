---
order: 5
title: '个人实践配置'
date: 2022-03-16
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

## 个人实践配置

### 禁用自动创建索引

```json
PUT /_cluster/settings
{
  "persistent": {
    "action.auto_create_index": "false"
  }
}
```

### 创建索引模板

```json
{
  "settings": {
    "number_of_shards": "3", // 数据分片数量
    "number_of_replicas": "0", // 副本分片
  	"index": {
      "sort.field": "time", // 字段自定义
      "sort.order": "desc" // 排序策略
    }
  },
  "mappings": {
  	"dynamic": false,
    "properties": {
 			"filed" : {
                "type" : "xxxx",
                "doc_values" : true // 设置doc_values
            }
    	}
    }
}
```

### 避坑实践

- 禁用`_all`字段节省25%存储空间
- 设置`index.mapping.total_fields.limit=2000`防止mapping爆炸
- 采用`@timestamp`替代自动生成`_id`，减少写入开销
