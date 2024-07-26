import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as s,h as t}from"./app-zeslOAle.js";const e={},p=t(`<ol><li><p>spring中6位组成，不允许第7位的年</p></li><li><p>在周几的位置，1-7代表周一到周日</p></li><li><p>定时任务不应该阻塞</p><ul><li><p>可以让业务运行以异步的方式，自己提交到线程池</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">CompletableFuture</span><span class="token punctuation">.</span><span class="token function">runAsync</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">-&gt;</span><span class="token punctuation">{</span>
	xxxService<span class="token punctuation">.</span><span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">,</span>executor<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>支持定时任务线程池；设置 TaskSchedulingProperties；</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">spring</span><span class="token punctuation">:</span>
  <span class="token key atrule">task</span><span class="token punctuation">:</span>
    <span class="token key atrule">scheduling</span><span class="token punctuation">:</span>
      <span class="token key atrule">pool</span><span class="token punctuation">:</span>
        <span class="token key atrule">size</span><span class="token punctuation">:</span> <span class="token number">5</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>让定时任务异步执行</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">// 开启异步任务</span>
<span class="token annotation punctuation">@EnableAsync</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> hello<span class="token punctuation">{</span>
    
    <span class="token annotation punctuation">@Async</span>
    <span class="token annotation punctuation">@Scheduled</span><span class="token punctuation">(</span>cron <span class="token operator">=</span> <span class="token string">&quot;0/5 * * * * ?&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        system<span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;hello&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 自动配置类</span>
<span class="token class-name">TaskExecutionAutoConfiguration</span>
<span class="token comment">// 异步任务配置</span>
spring<span class="token punctuation">.</span>task<span class="token punctuation">.</span>execution<span class="token punctuation">.</span>pool<span class="token punctuation">.</span>xxxx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ul></li></ol><p>定时任务</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">// 启动类添加注解</span>
<span class="token annotation punctuation">@EnableScheduling</span>

<span class="token annotation punctuation">@Service</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">HelloScheduled</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Scheduled</span><span class="token punctuation">(</span>cron <span class="token operator">=</span> <span class="token string">&quot;0/5 * * * * ?&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;当前时间：&quot;</span><span class="token operator">+</span> <span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&quot;————hello&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,3),o=[p];function c(l,i){return a(),s("div",null,o)}const d=n(e,[["render",c],["__file","scheduled.html.vue"]]),k=JSON.parse('{"path":"/code/spring/boot/scheduled.html","title":"定时任务","lang":"zh-CN","frontmatter":{"order":10,"title":"定时任务","date":"2021-10-16T00:00:00.000Z","category":["Spring Boot"],"tag":["Spring Boot"],"timeline":true,"article":true,"description":"spring中6位组成，不允许第7位的年 在周几的位置，1-7代表周一到周日 定时任务不应该阻塞 可以让业务运行以异步的方式，自己提交到线程池 支持定时任务线程池；设置 TaskSchedulingProperties； 让定时任务异步执行 定时任务","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/spring/boot/scheduled.html"}],["meta",{"property":"og:title","content":"定时任务"}],["meta",{"property":"og:description","content":"spring中6位组成，不允许第7位的年 在周几的位置，1-7代表周一到周日 定时任务不应该阻塞 可以让业务运行以异步的方式，自己提交到线程池 支持定时任务线程池；设置 TaskSchedulingProperties； 让定时任务异步执行 定时任务"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-26T09:54:15.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"Spring Boot"}],["meta",{"property":"article:published_time","content":"2021-10-16T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-26T09:54:15.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"定时任务\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-10-16T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-26T09:54:15.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[],"git":{"createdTime":1721987655000,"updatedTime":1721987655000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":0.61,"words":182},"filePathRelative":"code/spring/boot/scheduled.md","localizedDate":"2021年10月16日","excerpt":"<ol>\\n<li>\\n<p>spring中6位组成，不允许第7位的年</p>\\n</li>\\n<li>\\n<p>在周几的位置，1-7代表周一到周日</p>\\n</li>\\n<li>\\n<p>定时任务不应该阻塞</p>\\n<ul>\\n<li>\\n<p>可以让业务运行以异步的方式，自己提交到线程池</p>\\n<div class=\\"language-java\\" data-ext=\\"java\\" data-title=\\"java\\"><pre class=\\"language-java\\"><code><span class=\\"token class-name\\">CompletableFuture</span><span class=\\"token punctuation\\">.</span><span class=\\"token function\\">runAsync</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span><span class=\\"token operator\\">-&gt;</span><span class=\\"token punctuation\\">{</span>\\n\\txxxService<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">hello</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n<span class=\\"token punctuation\\">}</span><span class=\\"token punctuation\\">,</span>executor<span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n</code></pre></div></li>\\n<li>\\n<p>支持定时任务线程池；设置 TaskSchedulingProperties；</p>\\n<div class=\\"language-yaml\\" data-ext=\\"yml\\" data-title=\\"yml\\"><pre class=\\"language-yaml\\"><code><span class=\\"token key atrule\\">spring</span><span class=\\"token punctuation\\">:</span>\\n  <span class=\\"token key atrule\\">task</span><span class=\\"token punctuation\\">:</span>\\n    <span class=\\"token key atrule\\">scheduling</span><span class=\\"token punctuation\\">:</span>\\n      <span class=\\"token key atrule\\">pool</span><span class=\\"token punctuation\\">:</span>\\n        <span class=\\"token key atrule\\">size</span><span class=\\"token punctuation\\">:</span> <span class=\\"token number\\">5</span>\\n</code></pre></div></li>\\n<li>\\n<p>让定时任务异步执行</p>\\n<div class=\\"language-java\\" data-ext=\\"java\\" data-title=\\"java\\"><pre class=\\"language-java\\"><code><span class=\\"token comment\\">// 开启异步任务</span>\\n<span class=\\"token annotation punctuation\\">@EnableAsync</span>\\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> hello<span class=\\"token punctuation\\">{</span>\\n    \\n    <span class=\\"token annotation punctuation\\">@Async</span>\\n    <span class=\\"token annotation punctuation\\">@Scheduled</span><span class=\\"token punctuation\\">(</span>cron <span class=\\"token operator\\">=</span> <span class=\\"token string\\">\\"0/5 * * * * ?\\"</span><span class=\\"token punctuation\\">)</span>\\n    <span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">void</span> <span class=\\"token function\\">hello</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">{</span>\\n        system<span class=\\"token punctuation\\">.</span>out<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">println</span><span class=\\"token punctuation\\">(</span><span class=\\"token string\\">\\"hello\\"</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token punctuation\\">}</span>\\n<span class=\\"token punctuation\\">}</span>\\n\\n<span class=\\"token comment\\">// 自动配置类</span>\\n<span class=\\"token class-name\\">TaskExecutionAutoConfiguration</span>\\n<span class=\\"token comment\\">// 异步任务配置</span>\\nspring<span class=\\"token punctuation\\">.</span>task<span class=\\"token punctuation\\">.</span>execution<span class=\\"token punctuation\\">.</span>pool<span class=\\"token punctuation\\">.</span>xxxx\\n</code></pre></div></li>\\n</ul>\\n</li>\\n</ol>","autoDesc":true}');export{d as comp,k as data};
