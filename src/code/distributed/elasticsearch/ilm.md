---
order: 4
title: ILM索引生命周期管理
date: 2022-03-20
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

[索引生命周期管理 (ILM)](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/index-lifecycle-management.html) 是在 Elasticsearch 6.6（公测版）首次引入并在 6.7 版正式推出的一项功能。ILM 是 Elasticsearch 的一部分，主要用来帮助您管理索引。

## 基础理论

在ILM策略期间可以触发的操作有：**Set Priority，Unfollow，Rollover，Read-only，Shrink，Force merge，Searchable snapshot，Allocate，Migrate，Wait for snapshot，Delete**

下面是每个操作具体的含义

- `Set Priority`

  > 可应用阶段：`Hot`，`Warm`，`Cold`

  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202502120014083.png)

  设置步骤的优先级

  必须参数，设置索引优先级，大于等于`0`的整数；设置为`null`删除优先级；`Hot`阶段应具有最高值，`Cold`应具有最低值；例如`Hot 100`，`Warm 50`，`Cold 0`；未设置此值的索引优先级默认为`1`

- `Unfollow`

  > 可应用阶段：`Hot`，`Warm`，`Cold`，`Frozen`

  跨集群索引设置为标准索引，可以使`shrink`、`rollover`、`searchable snapshot` 操作安全的在`follower`索引上执行；

  在整个生命周期中移动`follower`索引时，也可以直接使用`unfollow`，对于不是`follower`索引的没有影响、阶段执行中只是跳转到下一个操作

  > 当`shrink`、`rollover`、`searchable snapshot` 应用于`follower`索引时，该操作会自动触发

  `follower`索引安全转换为标准索引需要满足以下条件

  - `leader` 索引 `index.lifecycle.indexing_complete`设置为`true`。如果是`rollover`操作，则会自动设置此设置，或者使用`index settings api`手动设置
  - 对`leader` 索引执行的操作都已经复制到`follower`索引，这样可以确保在转换索引时不会丢失任何操作

  当上述条件都满足后，`unfollow`将执行以下操作

  - 暂停`follower`索引的索引
  - 关闭`follower`索引
  - 取消 `leader`索引
  - 打开`follower`索引（此时是标准索引）

- `Rollover`

  滚动策略，也就是按照策略递增的实现方式；

  当前索引达到一定的大小、或者一定文档的数量或者年龄时自动创建一个新的写索引

  > 可应用阶段：`Hot`
  >
  > 如果该操作是在`follower`索引上执行，那么该操作将等待`leader` 索引执行该操作完成

  `rollover`的目标可以是数据流或者索引别名

  当滚动目标是`数据流`时，这个生成的新索引将成为数据流的写入索引，并且索引名是`递增`的

  当滚动目前是`索引别名`时，别名以及其写索引**需要满足以下条件(重要!!!重要!!!重要!!!)**

  - 索引名称必须满足如下匹配规则*`^.\*-\d+$`*
  - 索引的滚动目标别名`index.lifecycle.rollover_alias`必须要设置
  - 该索引必须是索引的`写入`索引

  例如：索引`my-index-001`别名为`my_data`，如下配置是必须的

  ```text
  text 代码解读复制代码PUT my-index-001
  {
    "settings": {
      "index.lifecycle.name": "my_policy",
      "index.lifecycle.rollover_alias": "my_data"
    },
    "aliases": {
      "my_data": {
        "is_write_index": true
      }
    }
  }
  ```

  上面我们看到`rollover`的操作需要满足一种条件，那么我们必须至少设置一种滚动条件

  - `max_age`：从索引创建之日起开始计算时间，满足之后触发滚动操作。例如`1d`，`7d`，`30d`；即使我们通过`index.lifecycle.parse_origination_date`或者`index.lifecycle.origination_date`来设置索引的起始日期，计算时也是按照**索引创建时的日期**

  - `max_docs`：达到指定的**最大文档数量**之后触发滚动操作。上一次`refresh`之后的文档不计数，副本分片中的文档也不计数

  - `max_size`：当索引中**所有的主分片之和**达到一定的大小时触发滚动操作，副本分片不计算入最大索引大小

    > 在使用`_cat API `时，`pri.store.size`的值就是主分片的大小

  - `max_primary_shard_size`：当索引中最大的主分片达到一定的大小时触发滚动操作，这是索引中**最大主分片的最大大小**。与`max_size`一样，副本分片大小也不计入其中

- `Read-only`

  > 可应用阶段：`Hot`，`Warm`，`Cold`

  使索引变为**只读**索引，如果要在`Hot`阶段执行`Read-only`操作，前提是必须执行`rollover`操作，如果没有配置`rollover`操作，**ILM**将拒绝`Read-only`策略

- `Shrink`

  > 可应用阶段：`Hot`，`Warm`

  前提：将源索引设置为只读；所有分片必须在同一个节点上；集群健康状态为 `Green`；

  减少索引分片的数量或者减少主分片的数量，生成的索引名为`shrink-<random-uuid>-<original-index-name>`,分片数量使用如下参数控制

  - `number_of_shards`：可选整数类型，必须为现有索引分片数整除的数字，与`max_primary_shard_size`不兼容，只能设置一个
  - `max_primary_shard_size`：可选字节单位（**b,kb,mb,gb,tb,pb**），目标索引的最大主分片的大小，用于查找目标索引的最大分片数，设置此参数后，每个分片在目标索引的存储占用不会大于该参数

- `Force merge`

  > 可应用阶段：`Hot`，`Warm`

  合并索引中的`segments`到指定的最大段数，此操作会将索引设置为`Read-only`；强制合并会尽最大的努力去合并，如果此时有的分片在重新分配，那么该分片是无法被合并的

  如果我们要在`Hot`阶段执行`Force merge` 操作，`rollover`操作是必须的，如果没有配置`rollover`，**ILM**会拒绝该策略

  - `max_num_segments`：必须的整数类型，表示要合并到的`segments`数量，如果要完全合并索引，需要设置值为`1`
  - `index_codec`：可选字符串参数，压缩文档的编解码器，只能设置`best_compression`，它可以获得更高的压缩比，但是存储性能较差。该参数默认值`LZ4`，如果要使用`LZ4`，此参数可不用设置

- `Searchable snapshot`

  > 可应用阶段：`Hot`，`Cold`，`Forzen`

  将快照挂载为可搜索的索引。如果索引是数据流的一部分，则挂载的索引将替换数据流中的原始索引

  Searchable snapshot操作绑定对应的数据层，也就是（**Hot-Warm-Cold-Forzen-Delete**），恢复数据时直接恢复到对应的数据层，该操作使用`index.routing.allocation.include._tier_preference`设置，在冻结层（**frozen**）该操作会将前缀为`partial-`的部分数据恢复到冻结层，在其他层，会将前缀为`restored-`的全部数据恢复到对应层

- `Allocate`

  > 可应用阶段：`Warm`，`Cold`

  设定副本数量，修改分片分配规则。将分片移动到不同性能特征的节点上并减少副本的数量，该操作不可在`Hot`阶段执行，初始的分配必须通过手动设置或者索引模版设置。如果配置该设置必须指定副本的数量，或者至少指定如下操作的一个(**include,exclude,require**)，如果不设置分配策略即空的分配策略是无效的

  - `number_of_replicas`：整数类型，分配给索引的副本数
  - `total_shards_per_node`：单个**ES**节点上索引最大分片数，`-1`代表没有限制
  - `include`：为至少具有一个自定义属性的节点分配索引
  - `exclude`：为没有指定自定义属性的节点分配索引
  - `require`：为具有所有指定自定义属性的节点分配索引

  `elasticsearch.yml` 中自定义属性

  ```yaml
  yaml 代码解读复制代码# 节点增加属性，在elasticsearch.yml里面
  node.attr.{attribute}: {value}
  # 例如：增加一个node_type属性
  node.attr.node_type: hot
  # 索引分配过滤器设置
  index.routing.allocation.include.{attribute}
  index.routing.allocation.exclude.{attribute}
  index.routing.allocation.require.{attribute}
  ```

- `Migrate`

  > 可应用阶段：`Warm`，`Cold`

  通过更新`index.routing.allocation.include._tier_preference`设置，将索引移动到当前阶段对应的数据层

  **ILM**自动的在`Warm`和`Cold`阶段开启该操作，如果我们不想自动开启可以通过设置`enabled`为`false`来关闭

  - 如果在`Cold`阶段定义了一个可搜索的快照（**Searchable snapshot**）动作，那么将不会自动注入`Migrate`操作，因为`Migrate`与`Searchable snapshot`使用相同的`index.routing.allocation.include._tier_preference`设置
  - 在`Warm`阶段，`Migrate`操作会设置`index.routing.allocation.include._tier_preference`为`data_warm`,`data_hot`。意思就是这会将索引移动到`Warm`层的节点上，如果`Warm`层没有，那就返回到`Hot`层节点
  - 在`Cold`阶段，`Migrate`操作会设置`index.routing.allocation.include._tier_preference`为`data_cold`,`data_warm`,`data_hot`。这会将索引移动到`Cold`层，如果`Cold`层没有返回到`Warm`层，如果还没有可用的节点，返回到`Hot`层
  - 在`Frozen`阶段不允许迁移操作，`Migrate`操作会设置`index.routing.allocation.include._tier_preference`为`data_frozen`,`data_cold`,`data_warm`,`data_hot`。冻结阶段直接使用此配置挂载可搜索的镜像，这会将索引移动到(`frozen`)冻结层，如果冻结层没有节点，它会返回`Cold`层，依次是`Warm`层，`Hot`层
  - 在`Hot`阶段是不被允许迁移操作的，初始的索引分配是自动执行的，我们也可以通过索引模版配置

  该阶段可选的配置参数如下

  - `enabled`：可选布尔值，控制**ILM**是否在此阶段迁移索引，默认`true`

- `Wait for snapshot`

  > 可应用阶段：`Delete`

  在删除索引之前等待指定的`SLM`策略执行，这样可以确保已删除索引的快照是可用的

  - `policy`：必须的字符串参数，删除操作应等待的SLM策略的名称

- `Delete`

  > 可应用阶段：`Delete`

  永久的删除索引

  - `delete_searchable_snapshot`：删除在上一个阶段创建的可搜索快照，默认`true`

ILM可以很轻松的管理索引的各个阶段，常见的就是处理日志类型或者度量值等时间序列的数据

> 需要注意的是,**ILM**要生效的前提是集群中所有的节点都必须是使用相同的版本。虽说可以在混合版本汇中创建或者应用**ILM**，但是不能保证**ILM**按照预期的策略执行

下面我们就详细说一下索引生命周期的几个阶段

- Hot：频繁的查询、更新
- Warm：索引不在被更新、但是还有查询
- Cold：索引不在被更新、但是还有少量查询，索引的内容仍然需要被检索、检索的速度快慢没关系
- Frozen：索引不在被更新、但是还有少量查询，索引的内容仍然需要被检索、检索的速度非常慢也没关系
- Delete：索引不在需要，可以安全的删除

在上面的这几个阶段中，每个阶段的执行操作是不同的以及从一个阶段转到另一个阶段的时间也是不固定的

| 操作                | Hot  | Warm | Cold | Frozen | Delete |
| ------------------- | ---- | ---- | ---- | ------ | ------ |
| Set Priority        | ✓    | ✓    | ✓    |        |        |
| Unfollo             | ✓    | ✓    | ✓    | ✓      |        |
| Rollove             | ✓    |      |      |        |        |
| Read-only           | ✓    | ✓    | ✓    |        |        |
| Shrink              | ✓    | ✓    |      |        |        |
| Force merge         | ✓    | ✓    |      |        |        |
| Searchable snapshot | ✓    |      | ✓    | ✓      |        |
| Allocate            |      | ✓    | ✓    |        |        |
| Migrate             |      | ✓    | ✓    |        |        |
| Wait for snapshot   |      |      |      |        | ✓      |
| Delete              |      |      |      |        | ✓      |

## 配置步骤

1. 配置分片分配感知

   可以通过启动参数或在 elasticsearch.yml 配置文件中完成。例如：

   ```bash
   # 启动参数
   bin/elasticsearch -Enode.attr.data=hot
   bin/elasticsearch -Enode.attr.data=warm
   bin/elasticsearch -Enode.attr.data=cold
   
   #配置方法
   vim  /etc/elasticsearch/elasticsearch.yml
    
   #每个热节点加入如下配置并重启服务 hot、warm、cold
   node.attr.box_type: hot
   node.attr.rack: rack1
   #这两项配置是为节点增加标签，具体名称并不是写死的，与后面模板和策略配置有关
   ```

2. 配置ILM策略

   ILM 策略分为四个主要阶段 - 热、温、冷和删除。不需要在一个策略中定义每个阶段，ILM 会始终按该顺序执行各个阶段（跳过任何未定义的阶段）。

   一个比较完整的策略：

   ```json
   PUT _ilm/policy/hot-warm-cold-delete-60days
   {
     "policy": {
       "phases": {
         "hot": {
           "actions": {
             "rollover": {
               "max_size":"50gb",
               "max_age":"30d"
             },
             "set_priority": {
               "priority":50
             }
           }
         },
         "warm": {
           "min_age":"7d",
           "actions": {
             "forcemerge": {
               "max_num_segments":1
             },
             "shrink": {
               "number_of_shards":1
             },
             "allocate": {
               "require": {
                 "data": "warm"
               }
             },
             "set_priority": {
               "priority":25
             }
           }
         },
         "cold": {
           "min_age":"30d",
           "actions": {
             "set_priority": {
               "priority":0
             },
             "freeze": {},
             "allocate": {
               "require": {
                 "data": "cold"
               }
             }
           }
         },
         "delete": {
           "min_age":"60d",
           "actions": {
             "delete": {}
           }
         }
       }
     }
   }
   ```

3. 创建索引模板

   ```json
   PUT _template/bash_template
   {
    "index_patterns": ["bash-*"], #指定以 bash-* 开头的index遵循该模板规则
    "settings": {
    "number_of_shards": 2,  #指定索引的分片
    "number_of_replicas": 1, #指定索引的副本
    "index.lifecycle.name": "bash_policy", #指定索引生命周期策略名称
    "index.lifecycle.rollover_alias": "bash", #指定rollover别名（索引写入与读取时所用的名称）
    "routing.allocation.require.box_type": "hot" #指定索引新建时所分配的节点（此项不指定会默认分配到所有节点,当没有指定节点属性时无需指定该参数）
     }
   }
   ```

4. 
