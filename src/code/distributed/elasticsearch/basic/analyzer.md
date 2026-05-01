---
order: 4
title: '分词器'
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
