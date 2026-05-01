---
order: 2
title: '基本数据类型'
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

## 基本数据类型

[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.9/mapping-types.html)

以下是Elasticsearch中常见的数据类型及其特性：

| 数据类型     | 描述                                                 | 默认长度或格式                    | 示例                                                         |
| ------------ | ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| text         | 用于全文搜索的文本。会进行分词处理。                 | 不固定                            | "Elasticsearch is cool"                                      |
| keyword      | 适用于过滤、排序、聚合的文本，不会进行分词处理。     | 不固定，但建议长度不超过32766字节 | "user_id"                                                    |
| byte         | 有符号的8位整数, 范围: [-128 ~ 127]                  | 8位                               | 1                                                            |
| short        | 有符号的16位整数, 范围: [-32768 ~ 32767]             | 16位                              | 10000                                                        |
| integer      | 32位有符号整数。                                     | 32位                              | 42                                                           |
| long         | 64位有符号整数。                                     | 64位                              | 9223372036854775807                                          |
| float        | 32位IEEE 754浮点数。                                 | 32位                              | 3.14                                                         |
| double       | 64位IEEE 754浮点数。                                 | 64位                              | 3.141592653589793                                            |
| half_float   | 16 位IEEE 754 浮点数                                 | 16位                              | 3.1415<br />精度相比 **float** 或 **double** 有限，范围大约在 ±65504 |
| scaled_float | 缩放类型的的浮点数                                   | 不固定                            | 如果 **scaling_factor** 为 100，值 123.45 将存储为 12345（整数） |
| boolean      | 布尔值，true 或 false。                              | 1位                               | true                                                         |
| date         | 日期类型，支持多种格式。                             | ISO 8601 或指定的格式             | "2023-06-13T18:30:00Z"                                       |
| binary       | 二进制数据。                                         | 不固定                            | "U29tZSBiaW5hcnkgZGF0YQ=="                                   |
| range        | 表示范围的类型，如整数范围、浮点数范围、日期范围等。 | 根据子类型不同而不同              | { "gte": 10, "lt": 20 }                                      |
| ip           | IP地址，支持IPv4和IPv6。                             | IPv4：32位，IPv6：128位           | "192.168.1.1"                                                |
| array        | 数组类型                                             |                                   | [ "one", "two" ]                                             |
| object       | JSON对象，可以包含多个属性。                         | 不固定                            | { "name": "John", "age": 30 }                                |
| nested       | 类似于object，但可以进行嵌套的复杂查询。             | 不固定                            | { "comments": [ { "author": "John", "text": "Great post!" } ] } |
| geo_point    | 地理位置，表示经纬度。                               | 不固定                            | { "lat": 40.7128, "lon": -74.0060 }                          |
| geo_shape    | 地理形状，如点、多边形等。                           | 不固定                            | { "type": "polygon", "coordinates": [ [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0] ] ] } |

补充说明：

- text vs keyword：text类型用于需要进行全文搜索的字段，如文章内容；keyword类型用于需要进行精确匹配、不分词的字段，如用户名、标签等。
- date类型的格式：默认使用ISO 8601格式（例如："2023-06-13T18:30:00Z"），但也可以自定义格式，例如："yyyy/MM/dd HH:mm"。
- geo_point和geo_shape：用于地理位置数据处理，其中geo_point用于单个地理位置，geo_shape用于复杂的地理形状，如多边形。
