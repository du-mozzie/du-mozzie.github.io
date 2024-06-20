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

- **text vs keyword**：text类型用于需要进行全文搜索的字段，如文章内容；keyword类型用于需要进行精确匹配、不分词的字段，如用户名、标签等。
- **date类型的格式**：默认使用ISO 8601格式（例如："2023-06-13T18:30:00Z"），但也可以自定义格式，例如："yyyy/MM/dd HH:mm"。
- **geo_point和geo_shape**：用于地理位置数据处理，其中geo_point用于单个地理位置，geo_shape用于复杂的地理形状，如多边形。

## Mapping

### 什么是Mapping

Mapping 类似于数据库中的表结构定义schema，它的主要作用是：**用来定义索引中的字段的名称、定义字段的数据类型和定义字段类型的一些其它参数**，比如字符串、数字、布尔字段，倒排索引的相关配置，设置某个字段为不被索引、记录 position 等。每一种数据类型都有对应的使用场景，并且每个文档都有映射，但是在大多数使用场景中，我们并不需要显示的创建映射，因为ES中实现了动态映射。我们在索引中写入一个下面的JSON文档：

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

- **analyzer：**只能用于text字段，用于根据需求设置不通的分词器，默认是ES的标准分词

- **boost：**默认值为1。用于设置字段的权重，主要应用于查询时候的评分

- **coerce：**默认是true。主要用于清理脏数据来匹配字段对应的类型。例如字符串“5”会被强制转换为整数，浮点数5.0会被强制转换为整数

- **copy_to**：能够把几个字段拼成一个字段。老字段和新组成的字段都可以查询

- **doc_values：**默认值为true。Doc Values和倒排索引同时生成，本质上是一个序列化的 列式存储。列式存储适用于聚合、排序、脚本等操作，也很适合做压缩。如果字段不需要聚合、排序、脚本等操作可以关闭掉，能节省磁盘空间和提升索引速度。

- dynamic：

  默认值为true。默认如果插入的document字段中有mapping没有的，会自动插入成功，并自动设置新字段的类型；如果一个字段中插入一个包含多个字段的json对象也会插入成功。但是这个逻辑可以做限制：

  - ture: 默认值，可以动态插入
  - false：数据可写入但是不能被索引分析和查询，但是会保存到_source字段。
  - strict：无法写入

- **eager_global_ordinals：**默认值为false。设置每refresh一次就创建一个全局的顺序映射，用于预加载来加快查询的速度。需要消耗一定的heap。

- **enabled：**默认值为true。设置字段是否索引分析。如果设置为false，字段不对此字段索引分析和store，会导致此字段不能被查询和聚合，但是字段内容仍然会存储到_source中。

- **fielddata：**默认值为false，只作用于text字段。默认text字段不能排序，聚合和脚本操作，可以通过开启此参数打开此功能。但是会消耗比较大的内存。

- **fields：**可以对一个字段设置多种索引类型，例如text类型用来做全文检索，再加一个keyword来用于做聚合和排序。

- **format：**用于date类型。设置时间的格式。具体见https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html

- **ignore_above：**默认值为256，作用于keyword类型。指示该字段的最大索引长度（即超过该长度的内容将不会被索引分析），对于超过ignore_above长度的字符串，analyzer不会进行索引分析，所以超过该长度的内容将不会被搜索到。注意：keyword类型的字段的最大长度限制为32766个UTF-8字符，text类型的字段对字符长度没有限制

- **ignore_malformed：**默认为false。插入新document的时候，是否忽略字段的类型，默认字段类型必须和mapping中设置的一样

- index_options：

  默认值为positions，只作用于text字段。控制将哪些信息添加到倒排索引中以进行搜索和突出显示。有4个选项：

  - docs 添加文档号
  - freqs 添加文档号和次频
  - positions 添加文档号，词频，位置
  - offsets 添加文档号，词频，位置，偏移量

- **index：**默认值为true。设置字段是否会被索引分析和可以查询

- **meta：**可以给字段设置metedata字段，用于标记等

- **normalizer：**可以对字段做一些标准化规则，例如字符全部大小写等

- **norms：**默认值为true。默认会存储了各种规范化因子，在查询的时候使用这些因子来计算文档相对于查询的得分，会占用一部分磁盘空间。如果字段不用于检索，只是过滤，查询等精确操作可以关闭。

- **null_value：**null_value意味着无法索引或搜索空值。当字段设置为 null , [] ,和 [null]（这些null的表示形式都是等价的），它被视为该字段没有值。通过设置此字段，可以设置控制可以被索引和搜索。

- **properties：**如果这个字段有嵌套属性，包含了多个子字段。需要用到properties

- **search_analyzer：**默认值和analyzer相同。在查询时，先对要查询的text类型的输入做分词，再去倒排索引搜索，可以通过这个设置查询的分析器为其它的，默认情况下，查询将使用analyzer字段制定的分析器，但也可以被search_analyzer覆盖

- similarity：

  用于设置document的评分模型，有三个：

  - BM25:lucene的默认评分模型
  - classic:TF/IDF评分模型
  - boolean:布尔评分模型

- **store：**默认为false，lucene不存储原始内容，但是_source仍然会存储。这个属性其实是lucene创建字段时候的一个选项，表明是否要单独存储原始值（_source字段是elasticsearch单独加的和store没有关系）。如果字段比较长，从\_source中获取损耗比较大，可以关闭_source存储，开启store。

- **term_vector：** 用于存储术语的规则。默认值为no，不存储向量信息.

## 分词器

### 什么是分词器

顾名思义，文本分析就是**把全文本转换成一系列单词（term/token）的过程**，也叫**分词**。在 ES 中，Analysis 是通过**分词器（Analyzer）** 来实现的，可使用 ES 内置的分析器或者按需定制化分析器。

举一个分词简单的例子：比如你输入 `Mastering Elasticsearch`，会自动帮你分成两个单词，一个是 `mastering`，另一个是 `elasticsearch`，可以看出单词也被转化成了小写的。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20200306215020457.png)

### 分词器的组成

分词器是专门处理分词的组件，分词器由以下三部分组成：

- **Character Filters**：针对原始文本处理，比如去除 html 标签
- **Tokenizer**：按照规则切分为单词，比如按照空格切分
- **Token Filters**：将切分的单词进行加工，比如大写转小写，删除 stopwords，增加同义语

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240614115134029.png)

同时 Analyzer 三个部分也是有顺序的，从图中可以看出，从上到下依次经过 `Character Filters`，`Tokenizer` 以及 `Token Filters`，这个顺序比较好理解，一个文本进来肯定要先对文本数据进行处理，再去分词，最后对分词的结果进行过滤。

其中，ES 内置了许多分词器：

- **Standard Analyzer** - 默认分词器，按词切分，小写处理
- **Simple Analyzer** - 按照非字母切分（符号被过滤），小写处理
- **Stop Analyzer** - 小写处理，停用词过滤（the ，a，is）
- **Whitespace Analyzer** - 按照空格切分，不转小写
- **Keyword Analyzer** - 不分词，直接将输入当做输出
- **Pattern Analyzer** - 正则表达式，默认 \W+
- **Language** - 提供了 30 多种常见语言的分词器
- **Customer Analyzer** - 自定义分词器

**中文分词器**

1. ICU：
   - Lucene ICU模块集成到Elasticsearch中的库，ICU的目的是增加对Unicode和全球化的支持，以提供对亚洲语言更好的文本分割分析

2. IK：

   - 支持自定义词库，支持热更新分词字典

   - https://github.com/medcl/elasticsearch-analysis-ik

3. jieba：

   - Python 中最流行的分词系统，支持分词和词性标注

   - 支持繁体分词、自定义词典、并行分词等

   - https://github.com/sing1ee/elasticsearch-jieba-plugin


4. THULAC：

   - THU Lexucal Analyzer for Chinese, 清华大学自然语言处理和社会人文计算实验室的一套中文分词器

   - https://github.com/thunlp/THULAC-Java
