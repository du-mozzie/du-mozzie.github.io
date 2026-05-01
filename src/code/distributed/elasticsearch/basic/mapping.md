---
order: 3
title: 'Mapping'
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

## Mapping

### 什么是Mapping

Mapping 类似于数据库中的表结构定义schema，它的主要作用是：用来定义索引中的字段的名称、定义字段的数据类型和定义字段类型的一些其它参数**，比如字符串、数字、布尔字段，倒排索引的相关配置，设置某个字段为不被索引、记录 position 等。每一种数据类型都有对应的使用场景，并且每个文档都有映射，但是在大多数使用场景中，我们并不需要显示的创建映射，因为ES中实现了动态映射。我们在索引中写入一个下面的JSON文档：

```json
{
    "name":"jack",
    "age":18,
    "birthDate": "1991-10-05"
}
```

在动态映射的作用下，name会映射成text类型，age会映射成long类型，birthDate会被映射为date类型，映射的索引信息如下。

```json
{
  "mappings": {
    "_doc": {
      "properties": {
        "age": {
          "type": "long"
        },
        "birthDate": {
          "type": "date"
        },
        "name": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        }
      }
    }
  }
}
```

自动判断的规则如下：

| JSON Type                        | Field Type |
| -------------------------------- | ---------- |
| Boolean：true、flase             | boolean    |
| Whole number：123、456、876      | long       |
| Floating point：123.43、234.534  | double     |
| String，valid date："2022-05-15" | date       |
| String："Hello Elasticsearch"    | string     |

### Mapping组成

一个mapping主要有两部分组成：metadata和mapping：

- metadata元数据字段用于自定义如何处理文档关联的元数据。例如：
  - _index：用于定义document属于哪个index
  - _type：类型，已经移除的概念
  - _id：document的唯一id
  - _source：存放原始的document数据
  - _size：_source字段中存放的数据的大小
- mapping中包含的field，包含字段的类型和参数。本文主要介绍的mapping参数就需要在field中去定义。例如：
  - type：设置字段对应的类型，常见的有text，keyword等
  - analyzer：指定一个用来文本分析的索引或者搜索text字段的分析器 应用于索引以及查询

### Mapping参数

[官网文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.9/mapping-params.html)

主要参数如下：

- analyzer：只能用于text字段，用于根据需求设置不通的分词器，默认是ES的标准分词

- boost：默认值为1。用于设置字段的权重，主要应用于查询时候的评分

- coerce：默认是true。主要用于清理脏数据来匹配字段对应的类型。例如字符串“5”会被强制转换为整数，浮点数5.0会被强制转换为整数

- copy_to：能够把几个字段拼成一个字段。老字段和新组成的字段都可以查询

- doc_values：默认值为true。Doc Values和倒排索引同时生成，本质上是一个序列化的 列式存储。列式存储适用于聚合、排序、脚本等操作，也很适合做压缩。如果字段不需要聚合、排序、脚本等操作可以关闭掉，能节省磁盘空间和提升索引速度。

- dynamic：默认值为true。默认如果插入的document字段中有mapping没有的，会自动插入成功，并自动设置新字段的类型；如果一个字段中插入一个包含多个字段的json对象也会插入成功。但是这个逻辑可以做限制：

  - ture: 默认值，可以动态插入
  - false：数据可写入但是不能被索引分析和查询，但是会保存到_source字段。
  - strict：无法写入

- eager_global_ordinals：默认值为false。设置每refresh一次就创建一个全局的顺序映射，用于预加载来加快查询的速度。需要消耗一定的heap。

- enabled：默认值为true。设置字段是否索引分析。如果设置为false，字段不对此字段索引分析和store，会导致此字段不能被查询和聚合，但是字段内容仍然会存储到_source中。

- fielddata：默认值为false，只作用于text字段。默认text字段不能排序，聚合和脚本操作，可以通过开启此参数打开此功能。但是会消耗比较大的内存。

- fields：可以对一个字段设置多种索引类型，例如text类型用来做全文检索，再加一个keyword来用于做聚合和排序。

- format：用于date类型。设置时间的格式。具体见[文档-format](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html)

- ignore_above：默认值为256，作用于keyword类型。指示该字段的最大索引长度（即超过该长度的内容将不会被索引分析），对于超过ignore_above长度的字符串，analyzer不会进行索引分析，所以超过该长度的内容将不会被搜索到。注意：keyword类型的字段的最大长度限制为32766个UTF-8字符，text类型的字段对字符长度没有限制

- ignore_malformed：默认为false。插入新document的时候，是否忽略字段的类型，默认字段类型必须和mapping中设置的一样

- index_options：默认值为positions，只作用于text字段。控制将哪些信息添加到倒排索引中以进行搜索和突出显示。有4个选项：

  - docs 添加文档号
  - freqs 添加文档号和次频
  - positions 添加文档号，词频，位置
  - offsets 添加文档号，词频，位置，偏移量

- index：默认值为true。设置字段是否会被索引分析和可以查询

- meta：可以给字段设置metedata字段，用于标记等

- normalizer：可以对字段做一些标准化规则，例如字符全部大小写等

- norm：默认值为true。默认会存储了各种规范化因子，在查询的时候使用这些因子来计算文档相对于查询的得分，会占用一部分磁盘空间。如果字段不用于检索，只是过滤，查询等精确操作可以关闭。

- null_value：null_value意味着无法索引或搜索空值。当字段设置为 null , [] ,和 [null]（这些null的表示形式都是等价的），它被视为该字段没有值。通过设置此字段，可以设置控制可以被索引和搜索。

- properties：如果这个字段有嵌套属性，包含了多个子字段。需要用到properties

- search_analyzer：默认值和analyzer相同。在查询时，先对要查询的text类型的输入做分词，再去倒排索引搜索，可以通过这个设置查询的分析器为其它的，默认情况下，查询将使用analyzer字段制定的分析器，但也可以被search_analyzer覆盖

- similarity：用于设置document的评分模型，有三个：

  - BM25:lucene的默认评分模型
  - classic:TF/IDF评分模型
  - boolean:布尔评分模型

- store：默认为false，lucene不存储原始内容，但是_source仍然会存储。这个属性其实是lucene创建字段时候的一个选项，表明是否要单独存储原始值（_source字段是elasticsearch单独加的和store没有关系）。如果字段比较长，从\_source中获取损耗比较大，可以关闭_source存储，开启store。

- term_vector： 用于存储术语的规则。默认值为no，不存储向量信息.
