import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as o,o as r,c as l,b as e,d as t,e as a,h as p}from"./app-DBHwYa0s.js";const i={},c=p(`<h1 id="双指针" tabindex="-1"><a class="header-anchor" href="#双指针"><span>双指针</span></a></h1><p><strong>双指针</strong>，指的是在遍历对象的过程中，不是普通的使用单个指针进行访问，而是使用两个相同方向（<em>快慢指针</em>）或者相反方向（<em>对撞指针</em>）的指针进行扫描，从而达到相应的目的。</p><h2 id="对撞指针" tabindex="-1"><a class="header-anchor" href="#对撞指针"><span>对撞指针</span></a></h2><p><strong>对撞指针</strong>是指在有序数组中，将指向最左侧的索引定义为<code>左指针(left)</code>，最右侧的定义为<code>右指针(right)</code>，然后从两头向中间进行数组遍历。</p><blockquote><p>对撞数组适用于<strong>有序数组</strong>，也就是说当你遇到题目给定有序数组时，应该第一时间想到用对撞指针解题。</p></blockquote><p>伪代码</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token keyword">function</span> <span class="token function">fn</span> <span class="token punctuation">(</span><span class="token parameter">list</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">var</span> left <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token keyword">var</span> right <span class="token operator">=</span> list<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">;</span>

  <span class="token comment">//遍历数组</span>
  <span class="token keyword">while</span> <span class="token punctuation">(</span>left <span class="token operator">&lt;=</span> right<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    left<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token comment">// 一些条件判断 和处理</span>
    <span class="token operator">...</span> <span class="token operator">...</span>
    right<span class="token operator">--</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7),d={href:"https://leetcode-cn.com/problems/boats-to-save-people/",target:"_blank",rel:"noopener noreferrer"},u=e("h2",{id:"快慢指针",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#快慢指针"},[e("span",null,"快慢指针")])],-1),m=e("p",null,[e("strong",null,"快慢指针"),t("也是双指针，但是两个指针从同一侧开始遍历数组，将这两个指针分别定义为"),e("code",null,"快指针（fast）"),t("和"),e("code",null,"慢指针（slow）"),t("，两个指针以不同的策略移动，直到两个指针的值相等（或其他特殊条件）为止，如fast每次增长两个，slow每次增长一个。")],-1),h={href:"https://link.zhihu.com/?target=https%3A//leetcode-cn.com/problems/remove-duplicates-from-sorted-array/",target:"_blank",rel:"noopener noreferrer"},k={href:"https://link.zhihu.com/?target=https%3A//leetcode-cn.com/problems/linked-list-cycle/",target:"_blank",rel:"noopener noreferrer"},g=e("h2",{id:"总结",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#总结"},[e("span",null,"总结")])],-1),v=e("p",null,[t("当遇到有序数组时，应该优先想到"),e("code",null,"双指针"),t("来解决问题，因两个指针的同时遍历会减少空间复杂度和时间复杂度。")],-1);function b(_,f){const n=o("ExternalLinkIcon");return r(),l("div",null,[c,e("p",null,[e("a",d,[t("LeetCode 881 救生艇"),a(n)])]),u,m,e("p",null,[e("a",h,[t("LeetCode 26 删除排序数组中的重复项"),a(n)])]),e("p",null,[e("a",k,[t("LeetCode 141.环形链表"),a(n)])]),g,v])}const T=s(i,[["render",b],["__file","double-pointer.html.vue"]]),z=JSON.parse('{"path":"/code/data-structure-and-algorithms/algorithms/double-pointer.html","title":"双指针","lang":"zh-CN","frontmatter":{"order":5,"title":"双指针","date":"2021-01-04T00:00:00.000Z","category":"数据结构与算法","timeline":true,"article":true,"description":"双指针 双指针，指的是在遍历对象的过程中，不是普通的使用单个指针进行访问，而是使用两个相同方向（快慢指针）或者相反方向（对撞指针）的指针进行扫描，从而达到相应的目的。 对撞指针 对撞指针是指在有序数组中，将指向最左侧的索引定义为左指针(left)，最右侧的定义为右指针(right)，然后从两头向中间进行数组遍历。 对撞数组适用于有序数组，也就是说当你遇...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/data-structure-and-algorithms/algorithms/double-pointer.html"}],["meta",{"property":"og:title","content":"双指针"}],["meta",{"property":"og:description","content":"双指针 双指针，指的是在遍历对象的过程中，不是普通的使用单个指针进行访问，而是使用两个相同方向（快慢指针）或者相反方向（对撞指针）的指针进行扫描，从而达到相应的目的。 对撞指针 对撞指针是指在有序数组中，将指向最左侧的索引定义为左指针(left)，最右侧的定义为右指针(right)，然后从两头向中间进行数组遍历。 对撞数组适用于有序数组，也就是说当你遇..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-05-08T06:42:11.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:published_time","content":"2021-01-04T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-05-08T06:42:11.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"双指针\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-01-04T00:00:00.000Z\\",\\"dateModified\\":\\"2024-05-08T06:42:11.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"对撞指针","slug":"对撞指针","link":"#对撞指针","children":[]},{"level":2,"title":"快慢指针","slug":"快慢指针","link":"#快慢指针","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"createdTime":1715140098000,"updatedTime":1715150531000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":2}]},"readingTime":{"minutes":1.41,"words":422},"filePathRelative":"code/data-structure-and-algorithms/algorithms/double-pointer.md","localizedDate":"2021年1月4日","excerpt":"\\n<p><strong>双指针</strong>，指的是在遍历对象的过程中，不是普通的使用单个指针进行访问，而是使用两个相同方向（<em>快慢指针</em>）或者相反方向（<em>对撞指针</em>）的指针进行扫描，从而达到相应的目的。</p>","autoDesc":true}');export{T as comp,z as data};
