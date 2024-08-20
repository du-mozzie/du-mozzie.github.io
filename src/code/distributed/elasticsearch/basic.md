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

## 主要结构

### Lucene

Lucene 索引文件结构主要如下

| Name                | Extension | Description                                                  |
| ------------------- | --------- | ------------------------------------------------------------ |
| Term Index          | .tip      | 词典索引（需要加载进内存）                                   |
| Term dictionary     | .tim      | 倒排表数据                                                   |
| Frequencies         | .doc      | 包含 Trem 和频率的文档列表（倒排表）<br />Term Frequency (TF)：一个词项在文档中出现的次数。<br />Document Frequency (DF)：一个词项在整个索引中出现的文档数量。 |
| Fields              | .fnm      | Field 数据元信息                                             |
| Field Index         | .fdx      | 文档位置索引（虚加载进内存）                                 |
| Field Data          | .fdt      | 文档值                                                       |
| Per-Document Values | .dvd .dvm | .dvm 为 DocValues 元信息<br />.dvd 为 DocValue 值（默认情况下 Elasticsearch 开启该功能用于快速排序、聚合操作等） |

#### Inverted Index（倒排索引）

一段文本进行分词后存储在 **Term dictionary** 按照顺序排列（可以二分查找），**Posting list** 存储对应的文档ID，由于 **Term dictionary** 数据量大所以不适合存储内存中。

| Term dictionary | Posting list |
| --------------- | ------------ |
| follow          | 1            |
| forward         | 2            |
| link            | 0、1、2      |
| like            | 0            |

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215929319.png)

#### Term Index

lucene 中出现了另外一个结构 **Term Index** 这是一个前缀树，通过提取  **Term dictionary** 的前缀减少存储的数据，记录 **Term dictionary** 中的偏移量， **Term Index** 该结构存在内存中。查询的时候先通过 **Term Index** 定位到大概的位置，在去 **Term dictionary** 中遍历，可以提升查找的效率

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813211731724.png)

#### Stored Fields

存储完整的文档内容

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813212156052.png)

通过 ID 可以从 Stored Fields 取出文档内容

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813212230441.png)

#### Doc Values

按照某个字段排序的文档，功能类似MySQL的索引

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813212643652.png)

1. Segment：由上面四种结构组成，具备完整搜索功能的最小单元。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240628003637291.png)

   随着不断地插入数据会出现多个 segment，Segment一旦生成就不能修改，只能进行合并 **Segment Merging**（段合并）

   [segment-merge 官方文档](https://www.elastic.co/guide/en/elasticsearch/guide/current/merge-process.html)

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813214043589.png)

   上面提到的多个 segment，就共同构成了一个**单机文本检索库**，它其实就是非常有名的开源基础搜索库 **lucene**。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240628003610415.png)

#### 上述结构执行过程

以下是一个插入文档和查询的例子，解释这些结构在背后是如何工作的。

##### 插入文档示例

假设我们在 `library` 索引中插入一本书的信息：

```JSON
POST /library/_doc/1
{
  "title": "Elasticsearch: The Definitive Guide",
  "author": "Clinton Gormley",
  "published_year": 2015
}
```

**步骤解析：**

1. **解析文档**：解析 JSON 文档，提取字段 `title`、`author` 和 `published_year`。
2. **分词**：对 `title` 字段进行分词，如 "Elasticsearch"、"The"、"Definitive"、"Guide"。
3. 更新倒排索引：将词项添加到倒排索引中。
   - `Term Dictionary`：记录词项 "Elasticsearch"、"The"、"Definitive"、"Guide"。
   - `Term Index`：记录词项的位置。
   - `Frequencies`：记录每个词项在文档中的出现频率。
4. **存储字段值**：存储字段值用于后续的排序、聚合和返回结果。
5. **Doc Values**：为 `published_year` 字段存储数值用于快速范围查询和排序。

##### 查询所有文档

```JSON
GET /library/_search
{
  "query": {
    "match_all": {}
  }
}
```

**步骤解析：**

1. **解析查询**：解析 `match_all` 查询，获取所有文档。
2. **读取倒排索引**：读取所有文档的索引。
3. **返回结果**：返回存储的字段值。

##### 按标题关键字查询

```JSON
GET /library/_search
{
  "query": {
    "match": {
      "title": "Elasticsearch"
    }
  }
}
```

**步骤解析：**

1. **解析查询**：解析 `match` 查询，提取查询词项 "Elasticsearch"。
2. **查找词项**：在 `Term Dictionary` 中查找 "Elasticsearch"。
3. **读取倒排索引**：获取包含 "Elasticsearch" 的文档列表及词频信息。
4. **计算相关性**：根据词频和其他因素计算文档的相关性得分。
5. **返回结果**：根据相关性得分排序并返回结果。

通过这些步骤，可以看到 Elasticsearch 如何利用 Term Index、Term Dictionary、Frequencies、Fields、Field Index、Field Data 和 Per-Document Values 来实现高效的文档插入和查询。了解这些底层结构有助于优化索引和查询性能。

### 高性能

将数据分为多个 index，每个 index 可以有多个 shard，每个 shard 是一个独立的 lucene 库，这样可以将读写操作分摊到多个 分片 中去，大大降低了争抢，提升了系统性能。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215046363.png)

### 高扩展性

可以通过增加机器来缓解 CPU 过高带来的性能问题，每一个机器就是一个 Node

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215246525.png)

### 高可用

我们可以给 分片 **多加几个副本**。将 分片 分为 **Primary shard** 和 **Replica shard**，也就是主分片和副本分片 。主分片会将数据同步给副本分片，副本分片**既可以**同时提供读操作，**还能**在主分片挂了的时候，升级成新的主分片让系统保持正常运行，**提高性能**的同时，还保证了系统的**高可用**。这样如果其中一个 Node 挂了，仍然可以对外提供服务。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215428287.png)

### Node 角色分化

搜索架构需要支持的功能很多，既要负责**管理集群**，又要**存储管理数据**，还要**处理客户端的搜索请求**。如果每个 Node **都**支持这几类功能，那当集群有数据压力，需要扩容 Node 时，就会**顺带**把其他能力也一起扩容，但其实其他能力完全够用，不需要跟着扩容，这就有些**浪费**了。
因此我们可以将这几类功能拆开，给集群里的 Node 赋予**角色身份**，不同的角色负责不同的功能。
比如负责管理集群的，叫**主节点(Master Node)**， 负责存储管理数据的，叫**数据节点(Data Node)**， 负责接受客户端搜索查询请求的叫**协调节点(Coordinate Node)**。
集群规模小的时候，一个 Node 可以**同时**充当多个角色，随着集群规模变大，可以让一个 Node 一个角色。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215501299.png)

### 去中心化

上面提到了主节点，那就意味着还有个**选主**的过程，但现在每个 Node 都是独立的，需要有个机制协调 Node 间的数据。
我们很容易想到，可以像 `kafka` 那样引入一个中心节点 `Zookeeper`，但如果不想引入新节点，还有其他更轻量的方案吗？
有，**去中心化**。
我们可以在 Node 间引入协调模块，用**类似一致性算法 Raft** 的方式，在节点间互相同步数据，让所有 Node 看到的集群数据状态都是一致的。这样，集群内的 Node 就能参与选主过程，还能了解到集群内某个 Node 是不是挂了等信息。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215537861.png)

到这里，当初那个简陋的 lucene，就成了一个高性能，高扩展性，高可用，支持持久化的分布式搜索引擎，它就是我们常说的 elastic search，简称 ES。它对外提供 http 接口，任何语言的客户端都可以通过 HTTP 接口接入 es，实现对数据的增删改查。
从架构角度来看，es 给了一套方案，告诉我们如何让一个单机系统 lucene 变成一个分布式系统。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813215630368.png)

按这个思路，是不是也可以将 lucene 改成其他单机系统，比如 mysql 数据库，或者专门做向量检索的单机引擎 faiss？
那以后再来个 elastic mysql 或者 elastic faiss 是不是就不那么意外了，大厂内卷晋升或者下一个明星开源大项目的小提示就给到这里了。

### ES 的写入流程

- 当**客户端应用**发起数据**写入**请求，请求会先发到集群中**协调节点**。
- 协调节点根据 hash 路由，判断数据该写入到哪个**数据节点**里的哪个**分片**(Shard)，找到**主分片**并写入。分片底层是 **lucene**，所以最终是将数据写入到 lucene 库里的 **segment** 内，将数据固化为**倒排索引**和 **Stored Fields** 以及 **Doc Values** 等多种结构。
- 主分片 写入成功后会将数据同步给 **副本分片**。
- 副本分片 写入完成后，**主分片**会响应协调节点一个 ACK，意思是写入完成。
- 最后，**协调节点**响应**客户端应用**写入完成。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813220225940.png)

### ES 的搜索流程

ES 的搜索流程分为两个阶段：分别是**查询阶段（Query Phase）**和 **获取阶段（Fetch Phase）**
我们分别看下。

#### 查询阶段

- 当**客户端应用**发起**搜索**请求，请求会先发到集群中的**协调节点**。
- 协调节点根据 **index name** 的信息，可以了解到 index name 被分为了几个 **分片**，以及这些分片 分散哪个**数据节点**上，将请求转发到这些数据节点的 分片 上面。
- 搜索请求到达分片后，分片 底层的 lucene 库会**并发**搜索多个 **segment**，利用每个 segment 内部的**倒排索引**获取到对应**文档 id**，并结合 **doc values** 获得**排序信息**。分片将结果聚合返回给**协调节点**。
- **协调节点**对多个分片中拿到的数据进行**一次排序聚合**，**舍弃**大部分不需要的数据。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813220427724.png)

#### 获取阶段

- **协调节点**再次拿着**文档 id** 请求**数据节点**里的 **分片**，分片 底层的 lucene 库会从 segment 内的 **Stored Fields** 中取出**完整文档内容**，并返回给协调节点。
- **协调节点**最终将数据结果返回给**客户端**。完成整个搜索过程。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240813220500438.png)

### 总结

- lucene 是 es 底层的单机文本检索库，它由多个 segment 组成，每个 segment 其实是由倒排索引、Term Index、Stored Fields 和 Doc Values 组成的具备完整搜索功能的最小单元。
- 将数据分类，存储在 es 内不同的 Index Name 中。
- 为了防止 Index Name 内数据过多，引入了 Shard 的概念对数据进行分片。提升了性能。
- 将多个 shard 分布在多个 Node 上，根据需要对 Node 进行扩容，提升扩展性。
- 将 shard 分为主分片和副本分片，主分片挂了之后由副本分片顶上，提升系统的可用性。
- 对 Node 进行角色分化，提高系统的性能和资源利用率，同时简化扩展和维护。
- es 和 kafka 的架构非常像，可以类比学习。
- shard = hash(routing) % number_of_primary_shards，计算文档在哪个分片，routing 默认值是文档的 id，也可以采用自定义值，比如用户 ID

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

- format：用于date类型。设置时间的格式。具体见https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html

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

## 分词器

### 什么是分词器

顾名思义，文本分析就是**把全文本转换成一系列单词（term/token）的过程**，也叫**分词**。在 ES 中，Analysis 是通过**分词器（Analyzer）** 来实现的，可使用 ES 内置的分析器或者按需定制化分析器。

举一个分词简单的例子：比如你输入 `Mastering Elasticsearch`，会自动帮你分成两个单词，一个是 `mastering`，另一个是 `elasticsearch`，可以看出单词也被转化成了小写的。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20200306215020457.png)

### 分词器的组成

分词器是专门处理分词的组件，分词器由以下三部分组成：

- Character Filters：针对原始文本处理，比如去除 html 标签
- Tokenizer：按照规则切分为单词，比如按照空格切分
- Token Filters：将切分的单词进行加工，比如大写转小写，删除 stopwords，增加同义语

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240614115134029.png)

同时 Analyzer 三个部分也是有顺序的，从图中可以看出，从上到下依次经过 `Character Filters`，`Tokenizer` 以及 `Token Filters`，这个顺序比较好理解，一个文本进来肯定要先对文本数据进行处理，再去分词，最后对分词的结果进行过滤。

其中，ES 内置了许多分词器：

- Standard Analyzer - 默认分词器，按词切分，小写处理
- Simple Analyzer - 按照非字母切分（符号被过滤），小写处理
- Stop Analyzer - 小写处理，停用词过滤（the ，a，is）
- Whitespace Analyzer - 按照空格切分，不转小写
- Keyword Analyzer - 不分词，直接将输入当做输出
- Pattern Analyzer - 正则表达式，默认 \W+
- Language - 提供了 30 多种常见语言的分词器
- Customer Analyzer - 自定义分词器

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