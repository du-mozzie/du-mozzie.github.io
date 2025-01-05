import{_ as o}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as i,o as r,c as l,b as e,d as t,e as s,h as a}from"./app-CBLO0Guh.js";const c={},p=a('<h2 id="异常情况" tabindex="-1"><a class="header-anchor" href="#异常情况"><span>异常情况</span></a></h2><h3 id="集群健康状态" tabindex="-1"><a class="header-anchor" href="#集群健康状态"><span>集群健康状态</span></a></h3><p><strong>GREEN</strong>是最健康的状态，说明所有的分片包括副本都可用。这种情况Elasticsearch集群所有的主分片和副本分片都已分配，Elasticsearch集群是100%可用的。</p><p><strong>YELLOW</strong>：主分片可用，但是副本分片不可用。这种情况Elasticsearch集群所有的主分片已经分配了，但至少还有一个副本是未分配的。不会有数据丢失，所以搜索结果依然是完整的。不过，集群高可用性在某种程度上会被弱化。可以把yellow想象成一个需要关注的warnning，该情况不影响索引读写，一般会自动恢复。</p><p><strong>RED</strong>：存在不可用的主分片。此时执行查询虽然部分数据仍然可以查到，但实际上已经影响到索引读写，需要重点关注。这种情况Elasticsearch集群至少一个主分片（以及它的全部副本）都在缺失中。这意味着索引已缺少数据，搜索只能返回部分数据，而分配到这个分片上的请求都返回异常。</p>',5),d={href:"https://cloud.tencent.com/developer/article/1803943",target:"_blank",rel:"noopener noreferrer"},u={href:"https://blog.csdn.net/laoyang360/article/details/81271491",target:"_blank",rel:"noopener noreferrer"},h=e("h2",{id:"优化",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#优化"},[e("span",null,"优化")])],-1),m=e("p",null,"ElasticSearch的一些调优案例汇总",-1),g=e("p",null,[e("strong",null,"案例：")],-1),v={href:"https://www.infoq.cn/article/wymrl5h80sfawg8u7ede",target:"_blank",rel:"noopener noreferrer"},b=e("p",null,[e("strong",null,"文档：")],-1),_={href:"https://www.pdai.tech/md/db/nosql-es/elasticsearch-y-peformance.html",target:"_blank",rel:"noopener noreferrer"},k={href:"https://zhaoyanblog.com/archives/319.html",target:"_blank",rel:"noopener noreferrer"},f={href:"https://zhaoyanblog.com/archives/764.html",target:"_blank",rel:"noopener noreferrer"},q={href:"https://www.modb.pro/db/582082",target:"_blank",rel:"noopener noreferrer"},E={href:"https://cloud.tencent.com/developer/article/2175753",target:"_blank",rel:"noopener noreferrer"},x={href:"https://www.pdai.tech/md/db/nosql-es/elasticsearch-z-tencent.html",target:"_blank",rel:"noopener noreferrer"},y={href:"https://xiaoxiami.gitbook.io/elasticsearch/",target:"_blank",rel:"noopener noreferrer"},j={href:"https://www.modb.pro/db/541037",target:"_blank",rel:"noopener noreferrer"},w={href:"https://mp.weixin.qq.com/s?__biz=MzI3OTE3ODk4MQ==&mid=2247486047&idx=1&sn=b3ab21da891df124c03e628eb3851b4c&chksm=eb4af1d5dc3d78c3be8995c0e16674f47598f907185dac03919f0c4d0a26ea4a71a0543390bf&cur_album_id=2167592080448028675&scene=190#rd",target:"_blank",rel:"noopener noreferrer"},z={href:"https://tech.meituan.com/2022/11/17/elasicsearch-optimization-practice-based-on-run-length-encoding.html",target:"_blank",rel:"noopener noreferrer"},T={href:"https://blog.csdn.net/cuiwjava/article/details/104341713/",target:"_blank",rel:"noopener noreferrer"},S=a(`<h3 id="预加载" tabindex="-1"><a class="header-anchor" href="#预加载"><span>预加载</span></a></h3><p>设置 <strong>index.store.preload</strong> ，用于预加载索引数据到文件系统缓存中。通过预加载索引数据，可以提高搜索性能，尤其是在首次查询时。</p><p>以下是一些常见文件类型及其作用：</p><ul><li><strong>nvd（Norms file）</strong>：包含字段规范化数据，通常用于排序和打分。</li><li><strong>tim（Term index file）</strong>：包含术语索引数据，用于加速查询。</li><li><strong>doc（Document index file）</strong>：包含文档数据，直接用于查询结果的返回。</li><li><strong>dim（Doc values file）</strong>：包含字段数据，用于聚合和排序。</li><li><strong>tip（Term dictionary file）</strong>：包含术语字典，用于加速查询。</li></ul><blockquote><p>创建索引时设置：</p></blockquote><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>PUT /index
<span class="token punctuation">{</span>
  <span class="token property">&quot;settings&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;index.store.preload&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;nvd&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;tim&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;doc&quot;</span><span class="token punctuation">]</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>索引存在时设置</p></blockquote><ol><li><p>关闭索引</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>POST /index/_close
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>添加预加载文件配置</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>PUT /index/_settings
<span class="token punctuation">{</span>
  <span class="token property">&quot;index.store.preload&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;tim&quot;</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>打开索引</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>POST /index/_open
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ol><p><strong>关闭索引时如果正在写入数据会被拒绝写入，需要进行处理</strong></p><blockquote><p>示例设置：</p></blockquote><p>以下是几个示例设置，供参考：</p><p>设置1：高查询频率索引</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>PUT /high_frequency_index/_settings
<span class="token punctuation">{</span>
  <span class="token property">&quot;index.store.preload&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;nvd&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;tim&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;doc&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;dim&quot;</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>设置2：部分字段查询索引</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>PUT /partial_field_index/_settings
<span class="token punctuation">{</span>
  <span class="token property">&quot;index.store.preload&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;nvd&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;tim&quot;</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>设置3：资源受限环境</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code>PUT /limited_resources_index/_settings
<span class="token punctuation">{</span>
  <span class="token property">&quot;index.store.preload&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;tim&quot;</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,17);function N(L,P){const n=i("ExternalLinkIcon");return r(),l("div",null,[p,e("p",null,[e("a",d,[t("Elasticsearch集群异常状态（RED、YELLOW）原因分析"),s(n)])]),e("p",null,[e("a",u,[t("干货 | Elasticsearch集群黄色原因的终极探秘"),s(n)])]),h,m,g,e("p",null,[e("a",v,[t("infoq"),s(n)])]),b,e("p",null,[e("a",_,[t("ES详解 - 优化：ElasticSearch性能优化详解"),s(n)])]),e("p",null,[e("a",k,[t("elasticsearch三个重要的优化"),s(n)])]),e("p",null,[e("a",f,[t("Elasticsearch重要文章之五：预加载fielddata"),s(n)])]),e("p",null,[e("a",q,[t("万字长文：可能是最全面的 Elasticsearch 性能调优指南"),s(n)])]),e("p",null,[e("a",E,[t("腾讯云ES：让你的ES查询性能起飞：Elasticsearch 查询优化攻略“一网打尽”"),s(n)])]),e("p",null,[e("a",x,[t("腾讯：腾讯万亿级 Elasticsearch 技术实践"),s(n)])]),e("p",null,[e("a",y,[t("博客【ES高手之路】"),s(n)])]),e("p",null,[e("a",j,[t("ElasticSearch 写入调优"),s(n)])]),e("p",null,[e("a",w,[t("哈啰技术：记录一次ElasticSearch的查询性能优化"),s(n)])]),e("p",null,[e("a",z,[t("美团外卖搜索基于Elasticsearch的优化实践"),s(n)])]),e("p",null,[e("a",T,[t("es在数据量很大的情况下（数十亿级别）如何提高查询效率"),s(n)])]),S])}const R=o(c,[["render",N],["__file","optimize.html.vue"]]),Z=JSON.parse('{"path":"/code/distributed/elasticsearch/optimize.html","title":"调优","lang":"zh-CN","frontmatter":{"order":4,"title":"调优","date":"2022-03-22T00:00:00.000Z","category":["ElasticSearch","分布式","搜索引擎"],"tag":["ElasticSearch","分布式","搜索引擎"],"timeline":true,"article":true,"description":"异常情况 集群健康状态 GREEN是最健康的状态，说明所有的分片包括副本都可用。这种情况Elasticsearch集群所有的主分片和副本分片都已分配，Elasticsearch集群是100%可用的。 YELLOW：主分片可用，但是副本分片不可用。这种情况Elasticsearch集群所有的主分片已经分配了，但至少还有一个副本是未分配的。不会有数据丢失，...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/distributed/elasticsearch/optimize.html"}],["meta",{"property":"og:title","content":"调优"}],["meta",{"property":"og:description","content":"异常情况 集群健康状态 GREEN是最健康的状态，说明所有的分片包括副本都可用。这种情况Elasticsearch集群所有的主分片和副本分片都已分配，Elasticsearch集群是100%可用的。 YELLOW：主分片可用，但是副本分片不可用。这种情况Elasticsearch集群所有的主分片已经分配了，但至少还有一个副本是未分配的。不会有数据丢失，..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-09-03T12:01:39.000Z"}],["meta",{"property":"article:author","content":"mozzie"}],["meta",{"property":"article:tag","content":"ElasticSearch"}],["meta",{"property":"article:tag","content":"分布式"}],["meta",{"property":"article:tag","content":"搜索引擎"}],["meta",{"property":"article:published_time","content":"2022-03-22T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-09-03T12:01:39.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"调优\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-03-22T00:00:00.000Z\\",\\"dateModified\\":\\"2024-09-03T12:01:39.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"mozzie\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"异常情况","slug":"异常情况","link":"#异常情况","children":[{"level":3,"title":"集群健康状态","slug":"集群健康状态","link":"#集群健康状态","children":[]}]},{"level":2,"title":"优化","slug":"优化","link":"#优化","children":[{"level":3,"title":"预加载","slug":"预加载","link":"#预加载","children":[]}]}],"git":{"createdTime":1718249717000,"updatedTime":1725364899000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":7}]},"readingTime":{"minutes":2.91,"words":873},"filePathRelative":"code/distributed/elasticsearch/optimize.md","localizedDate":"2022年3月22日","excerpt":"<h2>异常情况</h2>","autoDesc":true}');export{R as comp,Z as data};