import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,h as t}from"./app-HscYGYLB.js";const e="/assets/%E6%BB%91%E5%8A%A8%E7%AA%97%E5%8F%A3-iDcejNit.gif",p="/assets/image-20210719172352539-DKX876a6.png",o={},i=t(`<h1 id="滑动窗口" tabindex="-1"><a class="header-anchor" href="#滑动窗口"><span>滑动窗口</span></a></h1><p><strong>滑动窗口算法思想是非常重要的一种思想，可以用来解决数组，字符串的子元素问题。它可以将嵌套循环的问题，转换为单层循环问题，降低时间复杂度，提高效率。</strong></p><p>滑动窗口的思想非常简单，它将子数组（子字符串）理解成一个滑动的窗口，然后将这个窗口在数组上滑动，在窗口滑动的过程中，左边会出一个元素，右边会进一个元素，然后只需要计算当前窗口内的元素值即可。</p><p>可用滑动窗口思想解决的问题，一般有如下特点：</p><ol><li>窗口内元素是连续的。就是说，抽象出来的这个可滑动的窗口，在原数组或字符串上是连续的。</li><li>窗口只能由左向右滑动，不能逆过来滑动。就是说，窗口的左右边界，只能从左到右增加，不能减少，即使局部也不可以。</li></ol><h2 id="算法思路" tabindex="-1"><a class="header-anchor" href="#算法思路"><span>算法思路</span></a></h2><ol><li>使用双指针中的左右指针技巧，初始化 left = right = 0，把索引闭区间 [left, right] 称为一个「窗口」。</li><li>先不断地增加 right 指针扩大窗口 [left, right]，直到窗口符合要求</li><li>停止增加 right，转而不断增加 left 指针缩小窗口 [left, right]，直到窗口中的字符串不再符合要求。同时，每次增加 left，我们都要更新一轮结果。</li><li>重复第 2 和第 3 步，直到 right 到达尽头。</li></ol><blockquote><p>第 2 步相当于在寻找一个「可行解」，然后第 3 步在优化这个「可行解」，最终找到最优解。 左右指针轮流前进，窗口大小增增减减，窗口不断向右滑动。</p></blockquote><p><strong>代码模板</strong></p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code>left<span class="token punctuation">,</span>right <span class="token operator">:=</span> <span class="token number">0</span><span class="token punctuation">,</span><span class="token number">0</span> <span class="token comment">// 左右指针</span>

<span class="token comment">// 窗口右边界滑动</span>
<span class="token keyword">for</span> right <span class="token operator">&lt;</span> length <span class="token punctuation">{</span>
  window<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>s<span class="token punctuation">[</span>right<span class="token punctuation">]</span><span class="token punctuation">)</span>      <span class="token comment">// 右元素进窗</span>
  right<span class="token operator">++</span>                   <span class="token comment">// 右指针增加</span>

  <span class="token comment">// 窗口满足条件</span>
  <span class="token keyword">for</span> <span class="token function">valid</span><span class="token punctuation">(</span>window<span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span> left<span class="token operator">&lt;</span>right <span class="token punctuation">{</span>
    <span class="token operator">...</span>                      <span class="token comment">// 满足条件后的操作</span>
    window<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>arr<span class="token punctuation">[</span>left<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token comment">// 左元素出窗</span>
    left<span class="token operator">++</span>                   <span class="token comment">// 左指针移动，直到窗口不满足条件</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意:</p><ul><li>滑动窗口适用的题目一般具有单调性</li><li>滑动窗口、双指针、单调队列和单调栈经常配合使用</li></ul><p>滑动窗口的思路很简单，但在leetcode上关于滑动窗口的题目一般都是mid甚至hard的题目。其难点在于，如何抽象窗口内元素的操作，验证窗口是否符合要求的过程。 即上面步骤2，步骤3的两个过程。https://leetcode-cn.com/problems/minimum-size-subarray-sum/)</p><p>所谓滑动窗口，<strong>就是不断的调节子序列的起始位置和终止位置，从而得出我们要想的结果</strong></p><p>给定一个含有 n 个正整数的数组和一个正整数 s ，找出该数组中满足其和 ≥ s 的长度最小的 连续 子数组，并返回其长度。如果不存在符合条件的子数组，返回 0。</p><p>示例：</p><p>输入：s = 7, nums = [2,3,1,2,4,3] 输出：2 解释：子数组 [4,3] 是该条件下的长度最小的子数组。</p><figure><img src="`+e+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>最后找到 4，3 是最短距离。</p><p>其实从动画中可以发现滑动窗口也可以理解为双指针法的一种！只不过这种解法更像是一个窗口的移动，所以叫做滑动窗口更适合一些。</p><p>在本题中实现滑动窗口，主要确定如下三点：</p><ul><li>窗口内是什么？</li><li>如何移动窗口的起始位置？</li><li>如何移动窗口的结束位置？</li></ul><p>窗口就是 满足其和 ≥ s 的长度最小的 连续 子数组。</p><p>窗口的起始位置如何移动：如果当前窗口的值大于s了，窗口就要向前移动了（也就是该缩小了）。</p><p>窗口的结束位置如何移动：窗口的结束位置就是遍历数组的指针，窗口的起始位置设置为数组的起始位置就可以了。</p><p>解题的关键在于 窗口的起始位置如何移动，如图所示：</p><figure><img src="'+p+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>可以发现<strong>滑动窗口的精妙之处在于根据当前子序列和大小的情况，不断调节子序列的起始位置。从而将O(n^2)的暴力解法降为O(n)。</strong></p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">class</span> <span class="token class-name">Solution</span> <span class="token punctuation">{</span>
    <span class="token comment">// 滑动窗口</span>
    <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">minSubArrayLen</span><span class="token punctuation">(</span><span class="token keyword">int</span> s<span class="token punctuation">,</span> <span class="token keyword">int</span><span class="token punctuation">[</span><span class="token punctuation">]</span> nums<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> left <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> sum <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> result <span class="token operator">=</span> <span class="token class-name">Integer</span><span class="token punctuation">.</span><span class="token constant">MAX_VALUE</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> right <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> right <span class="token operator">&lt;</span> nums<span class="token punctuation">.</span>length<span class="token punctuation">;</span> right<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            sum <span class="token operator">+=</span> nums<span class="token punctuation">[</span>right<span class="token punctuation">]</span><span class="token punctuation">;</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span>sum <span class="token operator">&gt;=</span> s<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                result <span class="token operator">=</span> <span class="token class-name">Math</span><span class="token punctuation">.</span><span class="token function">min</span><span class="token punctuation">(</span>result<span class="token punctuation">,</span> right <span class="token operator">-</span> left <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                sum <span class="token operator">-=</span> nums<span class="token punctuation">[</span>left<span class="token operator">++</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> result <span class="token operator">==</span> <span class="token class-name">Integer</span><span class="token punctuation">.</span><span class="token constant">MAX_VALUE</span> <span class="token operator">?</span> <span class="token number">0</span> <span class="token operator">:</span> result<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,29),l=[i];function c(r,u){return s(),a("div",null,l)}const m=n(o,[["render",c],["__file","sliding-window.html.vue"]]),g=JSON.parse('{"path":"/code/data-structure-and-algorithms/algorithms/sliding-window.html","title":"滑动窗口","lang":"zh-CN","frontmatter":{"order":7,"title":"滑动窗口","date":"2021-01-05T00:00:00.000Z","category":"数据结构与算法","timeline":true,"article":false,"description":"滑动窗口 滑动窗口算法思想是非常重要的一种思想，可以用来解决数组，字符串的子元素问题。它可以将嵌套循环的问题，转换为单层循环问题，降低时间复杂度，提高效率。 滑动窗口的思想非常简单，它将子数组（子字符串）理解成一个滑动的窗口，然后将这个窗口在数组上滑动，在窗口滑动的过程中，左边会出一个元素，右边会进一个元素，然后只需要计算当前窗口内的元素值即可。 可用...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/data-structure-and-algorithms/algorithms/sliding-window.html"}],["meta",{"property":"og:title","content":"滑动窗口"}],["meta",{"property":"og:description","content":"滑动窗口 滑动窗口算法思想是非常重要的一种思想，可以用来解决数组，字符串的子元素问题。它可以将嵌套循环的问题，转换为单层循环问题，降低时间复杂度，提高效率。 滑动窗口的思想非常简单，它将子数组（子字符串）理解成一个滑动的窗口，然后将这个窗口在数组上滑动，在窗口滑动的过程中，左边会出一个元素，右边会进一个元素，然后只需要计算当前窗口内的元素值即可。 可用..."}],["meta",{"property":"og:type","content":"website"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-05-08T03:48:18.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:published_time","content":"2021-01-05T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-05-08T03:48:18.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"WebPage\\",\\"name\\":\\"滑动窗口\\",\\"description\\":\\"滑动窗口 滑动窗口算法思想是非常重要的一种思想，可以用来解决数组，字符串的子元素问题。它可以将嵌套循环的问题，转换为单层循环问题，降低时间复杂度，提高效率。 滑动窗口的思想非常简单，它将子数组（子字符串）理解成一个滑动的窗口，然后将这个窗口在数组上滑动，在窗口滑动的过程中，左边会出一个元素，右边会进一个元素，然后只需要计算当前窗口内的元素值即可。 可用...\\"}"]]},"headers":[{"level":2,"title":"算法思路","slug":"算法思路","link":"#算法思路","children":[]}],"git":{"createdTime":1715140098000,"updatedTime":1715140098000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":3.94,"words":1182},"filePathRelative":"code/data-structure-and-algorithms/algorithms/sliding-window.md","localizedDate":"2021年1月5日","excerpt":"\\n<p><strong>滑动窗口算法思想是非常重要的一种思想，可以用来解决数组，字符串的子元素问题。它可以将嵌套循环的问题，转换为单层循环问题，降低时间复杂度，提高效率。</strong></p>\\n<p>滑动窗口的思想非常简单，它将子数组（子字符串）理解成一个滑动的窗口，然后将这个窗口在数组上滑动，在窗口滑动的过程中，左边会出一个元素，右边会进一个元素，然后只需要计算当前窗口内的元素值即可。</p>\\n<p>可用滑动窗口思想解决的问题，一般有如下特点：</p>\\n<ol>\\n<li>窗口内元素是连续的。就是说，抽象出来的这个可滑动的窗口，在原数组或字符串上是连续的。</li>\\n<li>窗口只能由左向右滑动，不能逆过来滑动。就是说，窗口的左右边界，只能从左到右增加，不能减少，即使局部也不可以。</li>\\n</ol>","autoDesc":true}');export{m as comp,g as data};
