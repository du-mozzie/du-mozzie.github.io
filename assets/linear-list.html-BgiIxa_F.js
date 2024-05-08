import{_ as a}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as e,c as t,a as n,h as s}from"./app-BLFafG7Z.js";const i="/assets/image-20210418224522556-CAEFeyb-.png",l="/assets/image-20201209160216218-D5i-X6Xh.png",r="/assets/image-20210418220357626-D7fpVuQr.png",p="/assets/image-20210418220439032-C399iKTy.png",o={},c=s('<h1 id="线性表" tabindex="-1"><a class="header-anchor" href="#线性表"><span>线性表</span></a></h1><p>什么是线性表？</p><p><strong>由同类型数据元素构成有序序列的线性结构</strong></p><figure><img src="'+i+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><ul><li>表中元素个数称为线性表的<strong>长度</strong></li><li>线性表没有元素时，成为<strong>空表</strong></li><li>表起始位置称<strong>表头</strong>，表结束位置称<strong>表尾</strong></li></ul><p>类型名称：线性表(List)</p><p>数据对象集：线性表是 n(≥0)个元素构成的有序序列(a<sub>1</sub>，a<sub>2</sub>，......，a<sub>n</sub>)</p><p>操作集：线性表 L∈List，整数 i 表示位置，元素 X∈ElementType，线 性表基本操作主要有：</p><figure><img src="'+l+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h2 id="顺序存储结构" tabindex="-1"><a class="header-anchor" href="#顺序存储结构"><span>顺序存储结构</span></a></h2><p><strong>数组</strong></p><p>数组是将相同类型的元素存储于连续内存空间的数据结构，其长度不可变。</p><p>查询较快，增删较慢，增加每一个元素都要后移，删除每一个元素都要前移。</p><h2 id="单链表-linklist" tabindex="-1"><a class="header-anchor" href="#单链表-linklist"><span>单链表(LinkList)</span></a></h2><p>链表以节点为单位，每个元素都是一个独立对象，在内存空间的存储是非连续的。链表的节点对象具有两个成员变量：「值 <code>val</code>」，「后继节点引用 <code>next</code>」</p><p>元素无需按顺序排列，只要上一个元素指向下一个元素即可</p><p>创建链表：每一个链表的空间和位置是不需要预先分配划定的，可以根据系统的情况和实际的需求即时生成。</p><p>单链表结构与顺序存储结构的优缺点：</p><ol><li>存储分配方式： <ul><li>顺序存储结构用一段连续存储单依次存储线性表的数据元素</li><li>单链表采用链式存储结构，用一任意的存储单元存放线性表的元素</li></ul></li><li>时间性能： <ul><li>查找 <ul><li>顺序存储结构 O(1)</li><li>单链表 O(n)</li></ul></li><li>插入和删除 <ul><li>顺序存储结构需要平均移动长一半的元素，时间复杂度为 O(n)</li><li>单链表在找出位置的指针后插入和删除时间复杂度仅为 O(1)</li></ul></li></ul></li><li>空间性能： - 顺序存储结构需要预分配存储间，分大了，浪费；分小了，易发生上溢 - 单链表不需要分配存储空间，只有就可以分配，元素个数不受限制 <mark>若线性表需要频繁查找，很少进行插入和操作时，宜采用顺序存储结构，反正使用单结构</mark><mark>当线性表中的元素个数变化较大或者根本知道有多大时，最好用单链表结构。</mark></li></ol><h2 id="静态链表" tabindex="-1"><a class="header-anchor" href="#静态链表"><span>静态链表</span></a></h2><p><mark>用数组描述的链表叫做静态链表</mark>，数组的每个下标都对应一个 data 和 cur，数据域 data 用来存放数据元素，游标 cur 用来指向该元素的后继(类似单链表中的 next 指针)</p><p>静态链表创建</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><pre class="language-c"><code><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">MAXSIZE</span> <span class="token expression"><span class="token number">1000</span> </span><span class="token comment">/* 存储空间的初始分配量 */</span></span>

<span class="token comment">/* 线性表的静态链表存储结构 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span>
<span class="token punctuation">{</span>
    Elemtype data<span class="token punctuation">;</span>
    <span class="token keyword">int</span> cur<span class="token punctuation">;</span>			<span class="token comment">/* 游标(cursor)，为0表示无指向 */</span>
<span class="token punctuation">}</span> Component<span class="token punctuation">,</span>StaticLinkList<span class="token punctuation">[</span>MAXSIZE<span class="token punctuation">]</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><mark>第一个跟最后一个元素不存数据</mark></p><p>第一个 cur 存储空闲空间第一个结点的下标，最后一个 cur 存储第一个元素的下标</p><figure><img src="`+r+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>第一个 cur 指向备用链表的第一个结点，最后一个 cur 指向第一个数据</p><figure><img src="'+p+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><blockquote><p>优点：</p><p>​ 在插入和删除操作时，只需要修改游标，不需要移动元素，从而改进了在顺序存储结构中插入和删除操作需要移动大量元素的缺点。</p><p>缺点：</p><p>​ 没有解决连续存储分配带来的表长难以确定的问题，失去了链式存储结构随机存取的特性</p></blockquote><h2 id="循环链表" tabindex="-1"><a class="header-anchor" href="#循环链表"><span>循环链表</span></a></h2><p><mark>将单链表中终端节点的指针指向头结点，形成一个环，这就是循环链表</mark></p><h2 id="双向链表" tabindex="-1"><a class="header-anchor" href="#双向链表"><span>双向链表</span></a></h2><p><mark>在单链表的每个节点中在设置一个前驱指针</mark>，两个指针一个指向后继节点，一个指向前驱节点</p>',33);function d(u,m){return e(),t("div",null,[n(" more "),c])}const k=a(o,[["render",d],["__file","linear-list.html.vue"]]),f=JSON.parse('{"path":"/code/data-structure-and-algorithms/data-structure/linear-list.html","title":"线性表","lang":"zh-CN","frontmatter":{"order":1,"title":"线性表","date":"2020-12-26T00:00:00.000Z","category":"数据结构与算法","timeline":true,"article":true,"prev":"./","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/data-structure-and-algorithms/data-structure/linear-list.html"}],["meta",{"property":"og:title","content":"线性表"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-05-08T07:09:33.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:published_time","content":"2020-12-26T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-05-08T07:09:33.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"线性表\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2020-12-26T00:00:00.000Z\\",\\"dateModified\\":\\"2024-05-08T07:09:33.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"顺序存储结构","slug":"顺序存储结构","link":"#顺序存储结构","children":[]},{"level":2,"title":"单链表(LinkList)","slug":"单链表-linklist","link":"#单链表-linklist","children":[]},{"level":2,"title":"静态链表","slug":"静态链表","link":"#静态链表","children":[]},{"level":2,"title":"循环链表","slug":"循环链表","link":"#循环链表","children":[]},{"level":2,"title":"双向链表","slug":"双向链表","link":"#双向链表","children":[]}],"git":{"createdTime":1715140098000,"updatedTime":1715152173000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":3}]},"readingTime":{"minutes":3.4,"words":1021},"filePathRelative":"code/data-structure-and-algorithms/data-structure/linear-list.md","localizedDate":"2020年12月26日","excerpt":""}');export{k as comp,f as data};
