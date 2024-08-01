import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as o,o as l,c as r,b as t,d as a,e as i,h as e}from"./app-CR1WH-co.js";const d={},p=e(`<p>本文介绍一些 ElasticSearch 的基本概念</p><h2 id="基本结构" tabindex="-1"><a class="header-anchor" href="#基本结构"><span>基本结构</span></a></h2><ul><li>索引（index）：一个 ES 索引包含一个或多个物理分片，它只是这些分片的逻辑命名空间</li><li>文档（document）：最基础的可被索引的数据单元，如一个 JSON 串</li><li>分片（shards）：一个分片是一个底层的工作单元，它仅保存全部数据中的一部分，它是一个 Lucence 实例 (一个 lucene 索引最大包含 2,147,483,519 (= Integer.MAX_VALUE - 128)个文档数量)</li><li>分片备份（replicas）：分片备份，用于保障数据安全与分担检索压力</li></ul><p>ES 依赖一个重要的组件 Lucene，关于数据结构的优化通常来说是对 Lucene 的优化，它是集群的一个存储于检索工作单元，结构如下图：</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928010954-4d47c7be-f075-4325-841c-876c743c6591.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>在 Lucene 中，分为索引(录入)与检索(查询)两部分，索引部分包含分词器、过滤器、字符映射器等，检索部分包含查询解析器等。</p><p>一个 Lucene 索引包含多个 segments，一个 segment 包含多个文档，每个文档包含多个字段，每个字段经过分词后形成一个或多个 term。</p><p>通过 Luke 工具查看 ES 的 lucene 文件如下，主要增加了_id 和 _source 字段:</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928475614-f1e24e28-908a-456c-83fe-02e9fcf816d4.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h2 id="lucene" tabindex="-1"><a class="header-anchor" href="#lucene"><span>Lucene</span></a></h2><h3 id="主要结构" tabindex="-1"><a class="header-anchor" href="#主要结构"><span>主要结构</span></a></h3><p>Lucene 索引文件结构主要如下</p><table><thead><tr><th>Name</th><th>Extension</th><th>Description</th></tr></thead><tbody><tr><td>Term Index</td><td>.tip</td><td>词典索引（需要加载进内存）</td></tr><tr><td>Term dictionary</td><td>.tim</td><td>倒排表数据</td></tr><tr><td>Frequencies</td><td>.doc</td><td>包含 Trem 和频率的文档列表（倒排表）<br>Term Frequency (TF)：一个词项在文档中出现的次数。<br>Document Frequency (DF)：一个词项在整个索引中出现的文档数量。</td></tr><tr><td>Fields</td><td>.fnm</td><td>Field 数据元信息</td></tr><tr><td>Field Index</td><td>.fdx</td><td>文档位置索引（虚加载进内存）</td></tr><tr><td>Field Data</td><td>.fdt</td><td>文档值</td></tr><tr><td>Per-Document Values</td><td>.dvd .dvm</td><td>.dvm 为 DocValues 元信息<br>.dvd 为 DocValue 值（默认情况下 Elasticsearch 开启该功能用于快速排序、聚合操作等）</td></tr></tbody></table><ol><li><p>Inverted Index（倒排索引）：</p><p>一段文本进行分词后存储在 <strong>Term dictionary</strong> 按照顺序排列（可以二分查找），<strong>Posting list</strong> 存储对应的文档ID，由于 <strong>Term dictionary</strong> 数据量大所以不适合存储内存中。</p><table><thead><tr><th>Term dictionary</th><th>Posting list</th></tr></thead><tbody><tr><td>follow</td><td>1</td></tr><tr><td>forward</td><td>2</td></tr><tr><td>link</td><td>0、1、2</td></tr><tr><td>like</td><td>0</td></tr></tbody></table></li><li><p>Term Index</p><p>lucene 中出现了另外一个结构 <strong>Term Index</strong> 这是一个前缀树，通过提取 <strong>Term dictionary</strong> 的前缀减少存储的数据，记录 <strong>Term dictionary</strong> 中的偏移量， <strong>Term Index</strong> 该结构存在内存中。查询的时候先通过 <strong>Term Index</strong> 定位到大概的位置，在去 <strong>Term dictionary</strong> 中遍历，可以提升查找的效率</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240627175528350.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li><li><p>Stored Fields：存储完整的文档内容</p></li><li><p>Doc Values：按照某个字段排序的文档，功能类似MySQL的索引</p></li><li><p>Segment：由上面四种结构组成，具备完整搜索功能的最小单元。Segment一旦生成就不能修改，只能进行合并 <strong>Segment Merging</strong></p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240628003637291.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>多个 Segment 就构成了Lucene</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240628003610415.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li></ol><p>ES 中一个索引由一个或多个 lucene 索引构成，一个 lucene 索引由一个或多个 segment 构成，其中 segment 是最小的检索域。数据具体被存储到哪个分片上：shard = hash(routing) % number_of_primary_shards</p><p>默认情况下 routing 参数是文档 ID (murmurhash3), 可通过 URL 中的 _routing 参数指定数据分布在同一个分片中，index 和 search 的时候都需要一致才能找到数据，如果能明确根据_routing 进行数据分区，则可减少分片的检索工作，以提高性能。</p><h3 id="结构示例" tabindex="-1"><a class="header-anchor" href="#结构示例"><span>结构示例</span></a></h3><p>以下是一个插入文档和查询的例子，解释这些结构在背后是如何工作的。</p><h4 id="插入文档示例" tabindex="-1"><a class="header-anchor" href="#插入文档示例"><span>插入文档示例</span></a></h4><p>假设我们在 <code>library</code> 索引中插入一本书的信息：</p><div class="language-JSON line-numbers-mode" data-ext="JSON" data-title="JSON"><pre class="language-JSON"><code>POST /library/_doc/1
{
  &quot;title&quot;: &quot;Elasticsearch: The Definitive Guide&quot;,
  &quot;author&quot;: &quot;Clinton Gormley&quot;,
  &quot;published_year&quot;: 2015
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>步骤解析：</strong></p><ol><li><strong>解析文档</strong>：解析 JSON 文档，提取字段 <code>title</code>、<code>author</code> 和 <code>published_year</code>。</li><li><strong>分词</strong>：对 <code>title</code> 字段进行分词，如 &quot;Elasticsearch&quot;、&quot;The&quot;、&quot;Definitive&quot;、&quot;Guide&quot;。</li><li>更新倒排索引：将词项添加到倒排索引中。 <ul><li><code>Term Dictionary</code>：记录词项 &quot;Elasticsearch&quot;、&quot;The&quot;、&quot;Definitive&quot;、&quot;Guide&quot;。</li><li><code>Term Index</code>：记录词项的位置。</li><li><code>Frequencies</code>：记录每个词项在文档中的出现频率。</li></ul></li><li><strong>存储字段值</strong>：存储字段值用于后续的排序、聚合和返回结果。</li><li><strong>Doc Values</strong>：为 <code>published_year</code> 字段存储数值用于快速范围查询和排序。</li></ol><h4 id="查询文档示例" tabindex="-1"><a class="header-anchor" href="#查询文档示例"><span>查询文档示例</span></a></h4><h5 id="查询所有文档" tabindex="-1"><a class="header-anchor" href="#查询所有文档"><span>查询所有文档</span></a></h5><div class="language-JSON line-numbers-mode" data-ext="JSON" data-title="JSON"><pre class="language-JSON"><code>GET /library/_search
{
  &quot;query&quot;: {
    &quot;match_all&quot;: {}
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>步骤解析：</strong></p><ol><li><strong>解析查询</strong>：解析 <code>match_all</code> 查询，获取所有文档。</li><li><strong>读取倒排索引</strong>：读取所有文档的索引。</li><li><strong>返回结果</strong>：返回存储的字段值。</li></ol><h5 id="按标题关键字查询" tabindex="-1"><a class="header-anchor" href="#按标题关键字查询"><span>按标题关键字查询</span></a></h5><div class="language-JSON line-numbers-mode" data-ext="JSON" data-title="JSON"><pre class="language-JSON"><code>GET /library/_search
{
  &quot;query&quot;: {
    &quot;match&quot;: {
      &quot;title&quot;: &quot;Elasticsearch&quot;
    }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>步骤解析：</strong></p><ol><li><strong>解析查询</strong>：解析 <code>match</code> 查询，提取查询词项 &quot;Elasticsearch&quot;。</li><li><strong>查找词项</strong>：在 <code>Term Dictionary</code> 中查找 &quot;Elasticsearch&quot;。</li><li><strong>读取倒排索引</strong>：获取包含 &quot;Elasticsearch&quot; 的文档列表及词频信息。</li><li><strong>计算相关性</strong>：根据词频和其他因素计算文档的相关性得分。</li><li><strong>返回结果</strong>：根据相关性得分排序并返回结果。</li></ol><p>通过这些步骤，可以看到 Elasticsearch 如何利用 Term Index、Term Dictionary、Frequencies、Fields、Field Index、Field Data 和 Per-Document Values 来实现高效的文档插入和查询。了解这些底层结构有助于优化索引和查询性能。</p><h2 id="基本数据类型" tabindex="-1"><a class="header-anchor" href="#基本数据类型"><span>基本数据类型</span></a></h2>`,34),c={href:"https://www.elastic.co/guide/en/elasticsearch/reference/7.9/mapping-types.html",target:"_blank",rel:"noopener noreferrer"},u=e(`<p>以下是Elasticsearch中常见的数据类型及其特性：</p><table><thead><tr><th>数据类型</th><th>描述</th><th>默认长度或格式</th><th>示例</th></tr></thead><tbody><tr><td>text</td><td>用于全文搜索的文本。会进行分词处理。</td><td>不固定</td><td>&quot;Elasticsearch is cool&quot;</td></tr><tr><td>keyword</td><td>适用于过滤、排序、聚合的文本，不会进行分词处理。</td><td>不固定，但建议长度不超过32766字节</td><td>&quot;user_id&quot;</td></tr><tr><td>byte</td><td>有符号的8位整数, 范围: [-128 ~ 127]</td><td>8位</td><td>1</td></tr><tr><td>short</td><td>有符号的16位整数, 范围: [-32768 ~ 32767]</td><td>16位</td><td>10000</td></tr><tr><td>integer</td><td>32位有符号整数。</td><td>32位</td><td>42</td></tr><tr><td>long</td><td>64位有符号整数。</td><td>64位</td><td>9223372036854775807</td></tr><tr><td>float</td><td>32位IEEE 754浮点数。</td><td>32位</td><td>3.14</td></tr><tr><td>double</td><td>64位IEEE 754浮点数。</td><td>64位</td><td>3.141592653589793</td></tr><tr><td>half_float</td><td>16 位IEEE 754 浮点数</td><td>16位</td><td>3.1415<br>精度相比 <strong>float</strong> 或 <strong>double</strong> 有限，范围大约在 ±65504</td></tr><tr><td>scaled_float</td><td>缩放类型的的浮点数</td><td>不固定</td><td>如果 <strong>scaling_factor</strong> 为 100，值 123.45 将存储为 12345（整数）</td></tr><tr><td>boolean</td><td>布尔值，true 或 false。</td><td>1位</td><td>true</td></tr><tr><td>date</td><td>日期类型，支持多种格式。</td><td>ISO 8601 或指定的格式</td><td>&quot;2023-06-13T18:30:00Z&quot;</td></tr><tr><td>binary</td><td>二进制数据。</td><td>不固定</td><td>&quot;U29tZSBiaW5hcnkgZGF0YQ==&quot;</td></tr><tr><td>range</td><td>表示范围的类型，如整数范围、浮点数范围、日期范围等。</td><td>根据子类型不同而不同</td><td>{ &quot;gte&quot;: 10, &quot;lt&quot;: 20 }</td></tr><tr><td>ip</td><td>IP地址，支持IPv4和IPv6。</td><td>IPv4：32位，IPv6：128位</td><td>&quot;192.168.1.1&quot;</td></tr><tr><td>array</td><td>数组类型</td><td></td><td>[ &quot;one&quot;, &quot;two&quot; ]</td></tr><tr><td>object</td><td>JSON对象，可以包含多个属性。</td><td>不固定</td><td>{ &quot;name&quot;: &quot;John&quot;, &quot;age&quot;: 30 }</td></tr><tr><td>nested</td><td>类似于object，但可以进行嵌套的复杂查询。</td><td>不固定</td><td>{ &quot;comments&quot;: [ { &quot;author&quot;: &quot;John&quot;, &quot;text&quot;: &quot;Great post!&quot; } ] }</td></tr><tr><td>geo_point</td><td>地理位置，表示经纬度。</td><td>不固定</td><td>{ &quot;lat&quot;: 40.7128, &quot;lon&quot;: -74.0060 }</td></tr><tr><td>geo_shape</td><td>地理形状，如点、多边形等。</td><td>不固定</td><td>{ &quot;type&quot;: &quot;polygon&quot;, &quot;coordinates&quot;: [ [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0] ] ] }</td></tr></tbody></table><p>补充说明：</p><ul><li>text vs keyword：text类型用于需要进行全文搜索的字段，如文章内容；keyword类型用于需要进行精确匹配、不分词的字段，如用户名、标签等。</li><li>date类型的格式：默认使用ISO 8601格式（例如：&quot;2023-06-13T18:30:00Z&quot;），但也可以自定义格式，例如：&quot;yyyy/MM/dd HH:mm&quot;。</li><li>geo_point和geo_shape：用于地理位置数据处理，其中geo_point用于单个地理位置，geo_shape用于复杂的地理形状，如多边形。</li></ul><h2 id="mapping" tabindex="-1"><a class="header-anchor" href="#mapping"><span>Mapping</span></a></h2><h3 id="什么是mapping" tabindex="-1"><a class="header-anchor" href="#什么是mapping"><span>什么是Mapping</span></a></h3><p>Mapping 类似于数据库中的表结构定义schema，它的主要作用是：用来定义索引中的字段的名称、定义字段的数据类型和定义字段类型的一些其它参数**，比如字符串、数字、布尔字段，倒排索引的相关配置，设置某个字段为不被索引、记录 position 等。每一种数据类型都有对应的使用场景，并且每个文档都有映射，但是在大多数使用场景中，我们并不需要显示的创建映射，因为ES中实现了动态映射。我们在索引中写入一个下面的JSON文档：</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code><span class="token punctuation">{</span>
    <span class="token property">&quot;name&quot;</span><span class="token operator">:</span><span class="token string">&quot;jack&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;age&quot;</span><span class="token operator">:</span><span class="token number">18</span><span class="token punctuation">,</span>
    <span class="token property">&quot;birthDate&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1991-10-05&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在动态映射的作用下，name会映射成text类型，age会映射成long类型，birthDate会被映射为date类型，映射的索引信息如下。</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;mappings&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;_doc&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;age&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;long&quot;</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token property">&quot;birthDate&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;date&quot;</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;fields&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token property">&quot;keyword&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
              <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span><span class="token punctuation">,</span>
              <span class="token property">&quot;ignore_above&quot;</span><span class="token operator">:</span> <span class="token number">256</span>
            <span class="token punctuation">}</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>自动判断的规则如下：</p><table><thead><tr><th>JSON Type</th><th>Field Type</th></tr></thead><tbody><tr><td>Boolean：true、flase</td><td>boolean</td></tr><tr><td>Whole number：123、456、876</td><td>long</td></tr><tr><td>Floating point：123.43、234.534</td><td>double</td></tr><tr><td>String，valid date：&quot;2022-05-15&quot;</td><td>date</td></tr><tr><td>String：&quot;Hello Elasticsearch&quot;</td><td>string</td></tr></tbody></table><h3 id="mapping组成" tabindex="-1"><a class="header-anchor" href="#mapping组成"><span>Mapping组成</span></a></h3><p>一个mapping主要有两部分组成：metadata和mapping：</p><ul><li>metadata元数据字段用于自定义如何处理文档关联的元数据。例如： <ul><li>_index：用于定义document属于哪个index</li><li>_type：类型，已经移除的概念</li><li>_id：document的唯一id</li><li>_source：存放原始的document数据</li><li>_size：_source字段中存放的数据的大小</li></ul></li><li>mapping中包含的field，包含字段的类型和参数。本文主要介绍的mapping参数就需要在field中去定义。例如： <ul><li>type：设置字段对应的类型，常见的有text，keyword等</li><li>analyzer：指定一个用来文本分析的索引或者搜索text字段的分析器 应用于索引以及查询</li></ul></li></ul><h3 id="mapping参数" tabindex="-1"><a class="header-anchor" href="#mapping参数"><span>Mapping参数</span></a></h3>`,16),g={href:"https://www.elastic.co/guide/en/elasticsearch/reference/7.9/mapping-params.html",target:"_blank",rel:"noopener noreferrer"},m=e('<p>主要参数如下：</p><ul><li><p>analyzer：只能用于text字段，用于根据需求设置不通的分词器，默认是ES的标准分词</p></li><li><p>boost：默认值为1。用于设置字段的权重，主要应用于查询时候的评分</p></li><li><p>coerce：默认是true。主要用于清理脏数据来匹配字段对应的类型。例如字符串“5”会被强制转换为整数，浮点数5.0会被强制转换为整数</p></li><li><p>copy_to：能够把几个字段拼成一个字段。老字段和新组成的字段都可以查询</p></li><li><p>doc_values：默认值为true。Doc Values和倒排索引同时生成，本质上是一个序列化的 列式存储。列式存储适用于聚合、排序、脚本等操作，也很适合做压缩。如果字段不需要聚合、排序、脚本等操作可以关闭掉，能节省磁盘空间和提升索引速度。</p></li><li><p>dynamic：默认值为true。默认如果插入的document字段中有mapping没有的，会自动插入成功，并自动设置新字段的类型；如果一个字段中插入一个包含多个字段的json对象也会插入成功。但是这个逻辑可以做限制：</p><ul><li>ture: 默认值，可以动态插入</li><li>false：数据可写入但是不能被索引分析和查询，但是会保存到_source字段。</li><li>strict：无法写入</li></ul></li><li><p>eager_global_ordinals：默认值为false。设置每refresh一次就创建一个全局的顺序映射，用于预加载来加快查询的速度。需要消耗一定的heap。</p></li><li><p>enabled：默认值为true。设置字段是否索引分析。如果设置为false，字段不对此字段索引分析和store，会导致此字段不能被查询和聚合，但是字段内容仍然会存储到_source中。</p></li><li><p>fielddata：默认值为false，只作用于text字段。默认text字段不能排序，聚合和脚本操作，可以通过开启此参数打开此功能。但是会消耗比较大的内存。</p></li><li><p>fields：可以对一个字段设置多种索引类型，例如text类型用来做全文检索，再加一个keyword来用于做聚合和排序。</p></li><li><p>format：用于date类型。设置时间的格式。具体见https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html</p></li><li><p>ignore_above：默认值为256，作用于keyword类型。指示该字段的最大索引长度（即超过该长度的内容将不会被索引分析），对于超过ignore_above长度的字符串，analyzer不会进行索引分析，所以超过该长度的内容将不会被搜索到。注意：keyword类型的字段的最大长度限制为32766个UTF-8字符，text类型的字段对字符长度没有限制</p></li><li><p>ignore_malformed：默认为false。插入新document的时候，是否忽略字段的类型，默认字段类型必须和mapping中设置的一样</p></li><li><p>index_options：默认值为positions，只作用于text字段。控制将哪些信息添加到倒排索引中以进行搜索和突出显示。有4个选项：</p><ul><li>docs 添加文档号</li><li>freqs 添加文档号和次频</li><li>positions 添加文档号，词频，位置</li><li>offsets 添加文档号，词频，位置，偏移量</li></ul></li><li><p>index：默认值为true。设置字段是否会被索引分析和可以查询</p></li><li><p>meta：可以给字段设置metedata字段，用于标记等</p></li><li><p>normalizer：可以对字段做一些标准化规则，例如字符全部大小写等</p></li><li><p>norm：默认值为true。默认会存储了各种规范化因子，在查询的时候使用这些因子来计算文档相对于查询的得分，会占用一部分磁盘空间。如果字段不用于检索，只是过滤，查询等精确操作可以关闭。</p></li><li><p>null_value：null_value意味着无法索引或搜索空值。当字段设置为 null , [] ,和 [null]（这些null的表示形式都是等价的），它被视为该字段没有值。通过设置此字段，可以设置控制可以被索引和搜索。</p></li><li><p>properties：如果这个字段有嵌套属性，包含了多个子字段。需要用到properties</p></li><li><p>search_analyzer：默认值和analyzer相同。在查询时，先对要查询的text类型的输入做分词，再去倒排索引搜索，可以通过这个设置查询的分析器为其它的，默认情况下，查询将使用analyzer字段制定的分析器，但也可以被search_analyzer覆盖</p></li><li><p>similarity：用于设置document的评分模型，有三个：</p><ul><li>BM25:lucene的默认评分模型</li><li>classic:TF/IDF评分模型</li><li>boolean:布尔评分模型</li></ul></li><li><p>store：默认为false，lucene不存储原始内容，但是_source仍然会存储。这个属性其实是lucene创建字段时候的一个选项，表明是否要单独存储原始值（_source字段是elasticsearch单独加的和store没有关系）。如果字段比较长，从_source中获取损耗比较大，可以关闭_source存储，开启store。</p></li><li><p>term_vector： 用于存储术语的规则。默认值为no，不存储向量信息.</p></li></ul><h2 id="分词器" tabindex="-1"><a class="header-anchor" href="#分词器"><span>分词器</span></a></h2><h3 id="什么是分词器" tabindex="-1"><a class="header-anchor" href="#什么是分词器"><span>什么是分词器</span></a></h3><p>顾名思义，文本分析就是<strong>把全文本转换成一系列单词（term/token）的过程</strong>，也叫<strong>分词</strong>。在 ES 中，Analysis 是通过<strong>分词器（Analyzer）</strong> 来实现的，可使用 ES 内置的分析器或者按需定制化分析器。</p><p>举一个分词简单的例子：比如你输入 <code>Mastering Elasticsearch</code>，会自动帮你分成两个单词，一个是 <code>mastering</code>，另一个是 <code>elasticsearch</code>，可以看出单词也被转化成了小写的。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20200306215020457.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="分词器的组成" tabindex="-1"><a class="header-anchor" href="#分词器的组成"><span>分词器的组成</span></a></h3><p>分词器是专门处理分词的组件，分词器由以下三部分组成：</p><ul><li>Character Filters：针对原始文本处理，比如去除 html 标签</li><li>Tokenizer：按照规则切分为单词，比如按照空格切分</li><li>Token Filters：将切分的单词进行加工，比如大写转小写，删除 stopwords，增加同义语</li></ul><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240614115134029.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>同时 Analyzer 三个部分也是有顺序的，从图中可以看出，从上到下依次经过 <code>Character Filters</code>，<code>Tokenizer</code> 以及 <code>Token Filters</code>，这个顺序比较好理解，一个文本进来肯定要先对文本数据进行处理，再去分词，最后对分词的结果进行过滤。</p><p>其中，ES 内置了许多分词器：</p><ul><li>Standard Analyzer - 默认分词器，按词切分，小写处理</li><li>Simple Analyzer - 按照非字母切分（符号被过滤），小写处理</li><li>Stop Analyzer - 小写处理，停用词过滤（the ，a，is）</li><li>Whitespace Analyzer - 按照空格切分，不转小写</li><li>Keyword Analyzer - 不分词，直接将输入当做输出</li><li>Pattern Analyzer - 正则表达式，默认 \\W+</li><li>Language - 提供了 30 多种常见语言的分词器</li><li>Customer Analyzer - 自定义分词器</li></ul><p><strong>中文分词器</strong></p><ol><li><p>ICU：</p><ul><li>Lucene ICU模块集成到Elasticsearch中的库，ICU的目的是增加对Unicode和全球化的支持，以提供对亚洲语言更好的文本分割分析</li></ul></li><li><p>IK：</p><ul><li><p>支持自定义词库，支持热更新分词字典</p></li><li><p>https://github.com/medcl/elasticsearch-analysis-ik</p></li></ul></li><li><p>jieba：</p><ul><li><p>Python 中最流行的分词系统，支持分词和词性标注</p></li><li><p>支持繁体分词、自定义词典、并行分词等</p></li><li><p>https://github.com/sing1ee/elasticsearch-jieba-plugin</p></li></ul></li><li><p>THULAC：</p><ul><li><p>THU Lexucal Analyzer for Chinese, 清华大学自然语言处理和社会人文计算实验室的一套中文分词器</p></li><li><p>https://github.com/thunlp/THULAC-Java</p></li></ul></li></ol>',16);function h(b,v){const n=o("ExternalLinkIcon");return l(),r("div",null,[p,t("p",null,[t("a",c,[a("官方文档"),i(n)])]),u,t("p",null,[t("a",g,[a("官网文档"),i(n)])]),m])}const f=s(d,[["render",h],["__file","basic.html.vue"]]),k=JSON.parse('{"path":"/code/distributed/elasticsearch/basic.html","title":"基本概念","lang":"zh-CN","frontmatter":{"order":2,"title":"基本概念","date":"2022-03-16T00:00:00.000Z","category":["ElasticSearch","分布式","搜索引擎"],"tag":["ElasticSearch","分布式","搜索引擎"],"timeline":true,"article":true,"description":"本文介绍一些 ElasticSearch 的基本概念 基本结构 索引（index）：一个 ES 索引包含一个或多个物理分片，它只是这些分片的逻辑命名空间 文档（document）：最基础的可被索引的数据单元，如一个 JSON 串 分片（shards）：一个分片是一个底层的工作单元，它仅保存全部数据中的一部分，它是一个 Lucence 实例 (一个 lu...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/distributed/elasticsearch/basic.html"}],["meta",{"property":"og:title","content":"基本概念"}],["meta",{"property":"og:description","content":"本文介绍一些 ElasticSearch 的基本概念 基本结构 索引（index）：一个 ES 索引包含一个或多个物理分片，它只是这些分片的逻辑命名空间 文档（document）：最基础的可被索引的数据单元，如一个 JSON 串 分片（shards）：一个分片是一个底层的工作单元，它仅保存全部数据中的一部分，它是一个 Lucence 实例 (一个 lu..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928010954-4d47c7be-f075-4325-841c-876c743c6591.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-28T03:19:25.000Z"}],["meta",{"property":"article:author","content":"mozzie"}],["meta",{"property":"article:tag","content":"ElasticSearch"}],["meta",{"property":"article:tag","content":"分布式"}],["meta",{"property":"article:tag","content":"搜索引擎"}],["meta",{"property":"article:published_time","content":"2022-03-16T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-06-28T03:19:25.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"基本概念\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928010954-4d47c7be-f075-4325-841c-876c743c6591.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696928475614-f1e24e28-908a-456c-83fe-02e9fcf816d4.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240627175528350.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240628003637291.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240628003610415.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/20200306215020457.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20240614115134029.png\\"],\\"datePublished\\":\\"2022-03-16T00:00:00.000Z\\",\\"dateModified\\":\\"2024-06-28T03:19:25.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"mozzie\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"基本结构","slug":"基本结构","link":"#基本结构","children":[]},{"level":2,"title":"Lucene","slug":"lucene","link":"#lucene","children":[{"level":3,"title":"主要结构","slug":"主要结构","link":"#主要结构","children":[]},{"level":3,"title":"结构示例","slug":"结构示例","link":"#结构示例","children":[]}]},{"level":2,"title":"基本数据类型","slug":"基本数据类型","link":"#基本数据类型","children":[]},{"level":2,"title":"Mapping","slug":"mapping","link":"#mapping","children":[{"level":3,"title":"什么是Mapping","slug":"什么是mapping","link":"#什么是mapping","children":[]},{"level":3,"title":"Mapping组成","slug":"mapping组成","link":"#mapping组成","children":[]},{"level":3,"title":"Mapping参数","slug":"mapping参数","link":"#mapping参数","children":[]}]},{"level":2,"title":"分词器","slug":"分词器","link":"#分词器","children":[{"level":3,"title":"什么是分词器","slug":"什么是分词器","link":"#什么是分词器","children":[]},{"level":3,"title":"分词器的组成","slug":"分词器的组成","link":"#分词器的组成","children":[]}]}],"git":{"createdTime":1718249717000,"updatedTime":1719544765000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":13}]},"readingTime":{"minutes":14.21,"words":4264},"filePathRelative":"code/distributed/elasticsearch/basic.md","localizedDate":"2022年3月16日","excerpt":"<p>本文介绍一些 ElasticSearch 的基本概念</p>","autoDesc":true}');export{f as comp,k as data};