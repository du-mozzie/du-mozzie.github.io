import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as s,h as n}from"./app-CW8GPC8W.js";const t={},i=n(`<p>MySQL索引是一种数据结构（主要为B-Tree），用于加速数据检索。它通过创建表中一列或多列值的排序列表，并存储指向实际数据行的指针，实现对数据的快速定位，从而大幅提高查询效率。索引支持不同类型，如主键索引、唯一索引、全文索引等，适用于不同查询场景。合理使用索引可优化数据库性能，但过度索引会增加存储负担并可能减慢写操作。</p><h2 id="什么是索引-index" tabindex="-1"><a class="header-anchor" href="#什么是索引-index"><span>什么是索引？(index)</span></a></h2><p>索引是在数据库表的字段上添加的，是为了提高查询效率存在的一种机制。</p><p>一张表的一个字段可以添加一个索引，多个字段联合起来也可以添加索引。</p><p>索引相当于一本书的目录，是为了缩小扫描范围而存在的一种机制。</p><p>对于一本字典来说，查找某个汉字有两种方式：</p><p>​ 第一种方式：一页一页挨着找，直到找到为止，这种查方式属于全字典扫描，效率比较低.</p><p>​ 第二种方式：先通过目录(索引)去定位-一个大概的位置，然后直接定位到这个位置，做局域性扫描，缩小扫描的范围，快速的查找，这种查找方式属于通过索引检索，效率较高。</p><p>MySQL在查询方面主要就是两种方式：</p><p>​ 第一种方式：全表扫描</p><p>​ 第二种方式：根据索引检索</p><p><code>使用的时候需要排序，因为只有排序了，才会有区间，缩小范围就是扫描某个区间</code></p><p>在mysql数据库当中索引也是需要排序的，并且这个索引的排序和TreeSet数据结构相。TreeSet(TreeMap)底层是一个自平衡的二叉树！在MySQL当中索引是一个B-Tree数据结构。遵循左小右大原则存放，采用中序遍历方式遍历数据</p><h2 id="索引命名规则" tabindex="-1"><a class="header-anchor" href="#索引命名规则"><span>索引命名规则</span></a></h2><ol><li>使用下划线&quot;<em>&quot;而不是驼峰命名法。因为索引会被转换为文件系统中的文件名,而文件系统是区分大小写的,所以下划线命名更易于区分。例如:user_name而不是userName。2. 对多列索引,使用下划线&quot;</em>&quot;连接各列名。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> user_name_age_idx <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>name<span class="token punctuation">,</span> age<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="3"><li>对索引增加前缀&quot;idx_&quot;,以便于识别。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_user_name <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="4"><li>如果是UNIQUE索引,使用&quot;unq_&quot;作为前缀。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">UNIQUE</span> <span class="token keyword">INDEX</span> unq_user_email <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>email<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="5"><li>如果是FULLTEXT索引,使用&quot;ft_&quot;作为前缀。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> FULLTEXT <span class="token keyword">INDEX</span> ft_page_content <span class="token keyword">ON</span> page <span class="token punctuation">(</span>content<span class="token punctuation">)</span><span class="token punctuation">;</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="6"><li>对主键使用&quot;pk_&quot;作为前缀。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> pk_user_id <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="7"><li>如果索引仅用于加速查询而不是唯一性检查或键定义,则使用&quot;idx_&quot;前缀。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_user_age <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>age<span class="token punctuation">)</span><span class="token punctuation">;</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="8"><li>对Foreign Key约束索引使用&quot;fk_&quot;前缀,并在索引名中包含相关联表的信息。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> fk_album_artist_id <span class="token keyword">ON</span> album <span class="token punctuation">(</span>artist_id<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="9"><li>如果索引是多列的,那么每列使用下划线&quot;_&quot;,并给最后一列添加&quot;_idx&quot;后缀。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> user_first_name_last_name_idx <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>first_name<span class="token punctuation">,</span> last_name<span class="token punctuation">)</span><span class="token punctuation">;</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ol start="10"><li>对可分区表的索引,应在索引名后添加&quot;_p&quot;后缀,以指示索引可分区。例如:</li></ol><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_user_age_p <span class="token keyword">ON</span> <span class="token keyword">user</span> <span class="token punctuation">(</span>age<span class="token punctuation">)</span> PARTITIONS <span class="token number">32</span><span class="token punctuation">;</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>总之,MySQL的索引命名规范主要通过为索引名增加各种有意义的前缀和后缀,来识别索引的类型和作用,这有利于索引的管理和维护。</p><h2 id="索引的实现原理" tabindex="-1"><a class="header-anchor" href="#索引的实现原理"><span>索引的实现原理？</span></a></h2><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616005605739.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><ol><li>在任何数据库当中主键上都会自动添加索引对象，id字段上自动有索引，因为id是PK，在mysql中，一个字段上如果有unique约束的话，也会自动创建索引对象</li><li>在任何数据库当中，任何一张表的任何一条记录在硬盘存储上都会有一个硬盘的物理存储编号</li><li>在mysql当中，索引是一个单独的对象，不同的存储引擎以不同的形式存在，在MyISAM存储引擎中，索引存储在一个.MYI文件中，在InnoDB存储引擎中索引存储在一个逻辑名称叫作tablespace的当中，在MEMORY存储引擎当中索引被存储在内存当中。不管索引存储在哪，索引在mysql当中都是以一个树的形式存在(自平衡二叉树：B-Tree)</li></ol><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616010324663.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>索引的实现原理：就是缩小扫描的范围，避免全表扫描</strong></p><h2 id="什么时候加索引" tabindex="-1"><a class="header-anchor" href="#什么时候加索引"><span>什么时候加索引？</span></a></h2><ol><li>条件1：数据量庞大（到底有多么庞大算庞大，这个需要测试，因为每一个硬件环境不同）</li><li>条件2：该字段经常出现在where的后面，以条件的形式存在，也就是说这个字段总是被扫描。</li><li>条件3：该字段很少的DML(insert delete update)操作。（因为DML之后，索引需要重新排序。）</li></ol><p>​ 建议不要随意添加索引，因为索引也是需要维护的，太多的话反而会降低系统的性能。 ​ 建议通过主键查询，建议通过unique约束的字段进行查询，效率是比较高的。</p><p><strong>在mysql当中，主键上，以及unique字段上都会自动添加索引</strong></p><h2 id="索引的使用" tabindex="-1"><a class="header-anchor" href="#索引的使用"><span>索引的使用</span></a></h2><p>创建索引：</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">/*给emp表的ename字段添加索引，起名：emp_ename_index
create index 索引名 on 表名(字段名)*/</span>
<span class="token keyword">create</span> <span class="token keyword">index</span> emp_ename_index <span class="token keyword">on</span> emp<span class="token punctuation">(</span>ename<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>删除索引：</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">/*将emp表上的emp_ename_index索引对象删除。*/</span>
<span class="token keyword">drop</span> <span class="token keyword">index</span> emp_ename_index <span class="token keyword">on</span> emp<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>查看一个SQL是否使用了索引进行检索：</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">EXPLAIN</span> <span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token keyword">user</span> <span class="token keyword">WHERE</span> name <span class="token operator">=</span> <span class="token string">&#39;admin&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616125239712.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">/*使用关键字explain*/</span>
<span class="token keyword">EXPLAIN</span> <span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token keyword">user</span> <span class="token keyword">WHERE</span> phone <span class="token operator">=</span> <span class="token string">&#39;12456458532&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616125205987.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><code>返回结果type，ref使用了索引，all查询所有没有使用索引</code></p><h2 id="索引失效" tabindex="-1"><a class="header-anchor" href="#索引失效"><span>索引失效</span></a></h2><ol><li><p>select * from emp where ename like &#39;%T&#39;;</p><p>ename上即使添加了索引，也不会走索引，为什么？ 原因是因为模糊匹配当中以“%”开头了！ 尽量避免模糊查询的时候以“%”开始。 这是一种优化的手段/策略。</p></li><li><p>使用or的时候会失效，如果使用or那么要求or两边的条件字段都要有 索引，才会走索引，如果其中一边有一个字段没有索引，那么另一个 字段上的索引也会实现。所以这就是为什么不建议使用or的原因。</p></li><li><p>使用复合索引的时候，没有使用左侧的列查找，索引失效 什么是复合索引？ 两个字段，或者更多的字段联合起来添加一个索引，叫做复合索引。</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> phone_name_index <span class="token keyword">ON</span> <span class="token keyword">user</span><span class="token punctuation">(</span>phone<span class="token punctuation">,</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">EXPLAIN</span> <span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token keyword">user</span> <span class="token keyword">WHERE</span> phone <span class="token operator">=</span> <span class="token string">&#39;12456458532&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616130742790.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">EXPLAIN</span> <span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token keyword">user</span> <span class="token keyword">WHERE</span> name <span class="token operator">=</span> <span class="token string">&#39;admin&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616130837019.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li><li><p>在where当中索引列参加了运算，索引失效。</p></li></ol><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>索引是各种数据库进行优化的重要手段。优化的时候优先考虑的因素就是索引。</p><p>索引在数据库当中分了很多类？</p><ul><li>单一索引：一个字段上添加索引。</li><li>复合索引：两个字段或者更多的字段上添加索引。</li><li>主键索引：主键上添加索引。</li><li>唯一性索引：具有unique约束的字段上添加索引。</li></ul><p>注意：唯一性比较弱的字段上添加索引用处不大。</p>`,60),l=[i];function o(p,d){return a(),s("div",null,l)}const u=e(t,[["render",o],["__file","indexes.html.vue"]]),m=JSON.parse('{"path":"/code/mysql/indexes.html","title":"索引","lang":"zh-CN","frontmatter":{"order":6,"title":"索引","date":"2021-08-10T00:00:00.000Z","category":"MySQL","tag":"MySQL","timeline":true,"article":true,"description":"MySQL索引是一种数据结构（主要为B-Tree），用于加速数据检索。它通过创建表中一列或多列值的排序列表，并存储指向实际数据行的指针，实现对数据的快速定位，从而大幅提高查询效率。索引支持不同类型，如主键索引、唯一索引、全文索引等，适用于不同查询场景。合理使用索引可优化数据库性能，但过度索引会增加存储负担并可能减慢写操作。 什么是索引？(index) ...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/mysql/indexes.html"}],["meta",{"property":"og:title","content":"索引"}],["meta",{"property":"og:description","content":"MySQL索引是一种数据结构（主要为B-Tree），用于加速数据检索。它通过创建表中一列或多列值的排序列表，并存储指向实际数据行的指针，实现对数据的快速定位，从而大幅提高查询效率。索引支持不同类型，如主键索引、唯一索引、全文索引等，适用于不同查询场景。合理使用索引可优化数据库性能，但过度索引会增加存储负担并可能减慢写操作。 什么是索引？(index) ..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616005605739.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-10T14:32:06.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2021-08-10T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-06-10T14:32:06.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"索引\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616005605739.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616010324663.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616125239712.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616125205987.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616130742790.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616130837019.png\\"],\\"datePublished\\":\\"2021-08-10T00:00:00.000Z\\",\\"dateModified\\":\\"2024-06-10T14:32:06.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"什么是索引？(index)","slug":"什么是索引-index","link":"#什么是索引-index","children":[]},{"level":2,"title":"索引命名规则","slug":"索引命名规则","link":"#索引命名规则","children":[]},{"level":2,"title":"索引的实现原理？","slug":"索引的实现原理","link":"#索引的实现原理","children":[]},{"level":2,"title":"什么时候加索引？","slug":"什么时候加索引","link":"#什么时候加索引","children":[]},{"level":2,"title":"索引的使用","slug":"索引的使用","link":"#索引的使用","children":[]},{"level":2,"title":"索引失效","slug":"索引失效","link":"#索引失效","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"createdTime":1717143455000,"updatedTime":1718029926000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":3}]},"readingTime":{"minutes":6.36,"words":1909},"filePathRelative":"code/mysql/indexes.md","localizedDate":"2021年8月10日","excerpt":"<p>MySQL索引是一种数据结构（主要为B-Tree），用于加速数据检索。它通过创建表中一列或多列值的排序列表，并存储指向实际数据行的指针，实现对数据的快速定位，从而大幅提高查询效率。索引支持不同类型，如主键索引、唯一索引、全文索引等，适用于不同查询场景。合理使用索引可优化数据库性能，但过度索引会增加存储负担并可能减慢写操作。</p>","autoDesc":true}');export{u as comp,m as data};
