---
order: 2
title: 基本概念
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

本文介绍一些 ElasticSearch 的基本概念

## 基本结构

- 索引（index）：一个 ES 索引包含一个或多个物理分片，它只是这些分片的逻辑命名空间
- 文档（document）：最基础的可被索引的数据单元，如一个 JSON 串
- 分片（shards）：一个分片是一个底层的工作单元，它仅保存全部数据中的一部分，它是一个 Lucence 实例 (一个 lucene 索引最大包含 2,147,483,519 (= Integer.MAX_VALUE - 128)个文档数量)
- 分片备份（replicas）：分片备份，用于保障数据安全与分担检索压力

ES 依赖一个重要的组件 Lucene，关于数据结构的优化通常来说是对 Lucene 的优化，它是集群的一个存储于检索工作单元，结构如下图：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928010954-4d47c7be-f075-4325-841c-876c743c6591.png)

在 Lucene 中，分为索引(录入)与检索(查询)两部分，索引部分包含分词器、过滤器、字符映射器等，检索部分包含查询解析器等。

一个 Lucene 索引包含多个 segments，一个 segment 包含多个文档，每个文档包含多个字段，每个字段经过分词后形成一个或多个 term。

通过 Luke 工具查看 ES 的 lucene 文件如下，主要增加了\_id 和 _source 字段:

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928475614-f1e24e28-908a-456c-83fe-02e9fcf816d4.png)

## Lucene 索引

Lucene 索引文件结构主要分为：词典、倒排表、正向文件、DocValues 等，如下图：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696929260382-a546b876-578a-413a-b3d9-68f7b6146f60.png)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696929815228-af4be032-3a11-410a-a4a2-9e05961b5f51.png)

ES 中一个索引由一个或多个 lucene 索引构成，一个 lucene 索引由一个或多个 segment 构成，其中 segment 是最小的检索域。

数据具体被存储到哪个分片上：shard = hash(routing) % number_of_primary_shards

默认情况下 routing 参数是文档 ID (murmurhash3),可通过 URL 中的 \_routing 参数指定数据分布在同一个分片中，index 和 search 的时候都需要一致才能找到数据，如果能明确根据_routing 进行数据分区，则可减少分片的检索工作，以提高性能。

## 数据类型

### 基本数据类型

以下是Elasticsearch中常见的数据类型及其特性：

| 数据类型  | 描述                                                 | 默认长度或格式                    | 示例                                                         |
| --------- | ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| text      | 用于全文搜索的文本。会进行分词处理。                 | 不固定                            | "Elasticsearch is cool"                                      |
| keyword   | 适用于过滤、排序、聚合的文本，不会进行分词处理。     | 不固定，但建议长度不超过32766字节 | "user_id"                                                    |
| integer   | 32位有符号整数。                                     | 32位                              | 42                                                           |
| long      | 64位有符号整数。                                     | 64位                              | 9223372036854775807                                          |
| float     | 32位IEEE 754浮点数。                                 | 32位                              | 3.14                                                         |
| double    | 64位IEEE 754浮点数。                                 | 64位                              | 3.141592653589793                                            |
| boolean   | 布尔值，true 或 false。                              | 1位                               | true                                                         |
| date      | 日期类型，支持多种格式。                             | ISO 8601 或指定的格式             | "2023-06-13T18:30:00Z"                                       |
| binary    | 二进制数据。                                         | 不固定                            | "U29tZSBiaW5hcnkgZGF0YQ=="                                   |
| range     | 表示范围的类型，如整数范围、浮点数范围、日期范围等。 | 根据子类型不同而不同              | { "gte": 10, "lt": 20 }                                      |
| ip        | IP地址，支持IPv4和IPv6。                             | IPv4：32位，IPv6：128位           | "192.168.1.1"                                                |
| object    | JSON对象，可以包含多个属性。                         | 不固定                            | { "name": "John", "age": 30 }                                |
| nested    | 类似于object，但可以进行嵌套的复杂查询。             | 不固定                            | { "comments": [ { "author": "John", "text": "Great post!" } ] } |
| geo_point | 地理位置，表示经纬度。                               | 不固定                            | { "lat": 40.7128, "lon": -74.0060 }                          |
| geo_shape | 地理形状，如点、多边形等。                           | 不固定                            | { "type": "polygon", "coordinates": [ [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0] ] ] } |

补充说明：

- **text vs keyword**：text类型用于需要进行全文搜索的字段，如文章内容；keyword类型用于需要进行精确匹配、不分词的字段，如用户名、标签等。
- **date类型的格式**：默认使用ISO 8601格式（例如："2023-06-13T18:30:00Z"），但也可以自定义格式，例如："yyyy/MM/dd HH:mm"。
- **geo_point和geo_shape**：用于地理位置数据处理，其中geo_point用于单个地理位置，geo_shape用于复杂的地理形状，如多边形。

### Mapping可用字段

#### 基本字段类型

| 字段类型 | 描述                                                         | 常见属性                                                     |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| text     | 用于全文搜索的文本。会被分析。                               | analyzer, boost, eager_global_ordinals, fielddata, fields, index, index_options, norms, position_increment_gap, store, term_vector |
| keyword  | 不进行分析的精确值。适用于排序、聚合和精确过滤。             | boost, eager_global_ordinals, fields, ignore_above, index, norms, split_queries_on_whitespace, store |
| integer  | 32位有符号整数。                                             | coerce, boost, doc_values, ignore_malformed, index, null_value, store |
| long     | 64位有符号整数。                                             | coerce, boost, doc_values, ignore_malformed, index, null_value, store |
| float    | 32位单精度浮点数。                                           | coerce, boost, doc_values, ignore_malformed, index, null_value, store |
| double   | 64位双精度浮点数。                                           | coerce, boost, doc_values, ignore_malformed, index, null_value, store |
| boolean  | true 或 false 值。                                           | boost, doc_values, index, null_value, store                  |
| date     | 日期类型，支持多种格式。默认格式为 strict_date_optional_time |                                                              |
| binary   | 基础64编码的二进制值。                                       | doc_values, store                                            |
| range    | 范围类型，支持 integer_range, float_range, long_range, double_range, date_range。 | coerce, boost, doc_values, index, store                      |

#### 复杂字段类型

| 字段类型    | 描述                                    | 常见属性                                                     |
| ----------- | --------------------------------------- | ------------------------------------------------------------ |
| object      | JSON对象。                              | enabled, dynamic, properties                                 |
| nested      | 类似于 object，但可以独立地索引、查询。 | enabled, dynamic, properties                                 |
| geo_point   | 用于地理位置的经纬度点。                | ignore_malformed, ignore_z_value, null_value                 |
| geo_shape   | 复杂的地理形状，如多边形。              | ignore_malformed, tree, precision, strategy, orientation, points_only |
| ip          | IPv4和IPv6地址。                        | boost, doc_values, index, null_value, store                  |
| completion  | 用于自动完成建议的类型。                | analyzer, preserve_separators, preserve_position_increments, max_input_length, contexts |
| token_count | 计算分析后的词元数量，用于评分计算。    | analyzer, boost, doc_values, index, null_value, store        |
| percolator  | 用于存储查询以便将来匹配文档。          | 无                                                           |

#### 特殊字段属性

| 属性名称         | 描述                                                         |
| ---------------- | ------------------------------------------------------------ |
| boost            | 用于在查询时调整字段的相关性得分。                           |
| analyzer         | 指定用于字段的分析器。只适用于 text 和 completion 类型。     |
| coerce           | 是否尝试将值强制转换为正确的类型。适用于 number 和 date 类型。 |
| doc_values       | 是否为字段生成排序和聚合所需的倒排索引。大多数字段类型默认为 true。 |
| ignore_above     | 如果字符串长度超过此值，则不会被索引。适用于 keyword 类型。  |
| ignore_malformed | 是否忽略格式错误的值。适用于 number 和 date 类型。           |
| index            | 是否对字段进行索引，使其可搜索。                             |
| null_value       | 在索引时将null值替换为指定的值。适用于 number, date, boolean, keyword, ip 等类型。 |
| store            | 是否单独存储字段值而不只是索引。默认为 false。               |
| fields           | 允许为同一字段定义多种表示方式。适用于 text 和 keyword 类型。 |
| format           | 指定日期格式。适用于 date 类型。                             |

通过这些字段类型和属性，Elasticsearch可以灵活地适应各种数据索引和搜索需求。定义合适的映射能够显著提升搜索性能和准确性。
