import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,h as e}from"./app-zeslOAle.js";const t={},p=e(`<div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code>实现接口
<span class="token class-name">ApplicationContextInitializer</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyApplicationContextInitializer</span> <span class="token keyword">implements</span> <span class="token class-name">ApplicationContextInitializer</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>

<span class="token class-name">ApplicationListener</span> 
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyApplicationListener</span> <span class="token keyword">implements</span> <span class="token class-name">ApplicationListener</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>

<span class="token class-name">SpringApplicationRunListener</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MySpringApplicationRunListeners</span> <span class="token keyword">implements</span> <span class="token class-name">SpringApplicationRunListener</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>

<span class="token class-name">ApplicationRunner</span>
<span class="token annotation punctuation">@Component</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyApplicationRunner</span> <span class="token keyword">implements</span> <span class="token class-name">ApplicationRunner</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>

<span class="token class-name">CommandLineRunner</span>
<span class="token doc-comment comment">/**
 * 应用启动做一个一次性事情
 */</span>
<span class="token comment">//MyApplicationRunner，与MyCommandLineRunner优先级@Order()，数字越大优先级越高</span>
<span class="token annotation punctuation">@Order</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>
<span class="token annotation punctuation">@Component</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyCommandLineRunner</span> <span class="token keyword">implements</span> <span class="token class-name">CommandLineRunner</span> <span class="token punctuation">{</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>配置</p></blockquote><p>ApplicationContextInitializer</p><p>ApplicationListener</p><p>SpringApplicationRunListener</p><p>在src/main/resources/META-INF/spring.factories下配置</p><div class="language-properties line-numbers-mode" data-ext="properties" data-title="properties"><pre class="language-properties"><code><span class="token comment"># Application Context Initializers</span>
<span class="token key attr-name">org.springframework.context.ApplicationContextInitializer</span><span class="token punctuation">=</span><span class="token value attr-value">\\
  com.du.lister.MyApplicationContextInitializer</span>

<span class="token comment"># Application Listeners</span>
<span class="token key attr-name">org.springframework.context.ApplicationListener</span><span class="token punctuation">=</span><span class="token value attr-value">\\
  com.du.lister.MyApplicationListener</span>

<span class="token comment"># Run Listeners</span>
<span class="token key attr-name">org.springframework.boot.SpringApplicationRunListener</span><span class="token punctuation">=</span><span class="token value attr-value">\\
  com.du.lister.MySpringApplicationRunListeners</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ApplicationRunner</p><p>CommandLineRunner</p><p>添加注解@Component，注入IOC容器中，使用@order可以进行排序，数字越大优先级越高</p>`,10),i=[p];function o(l,c){return s(),a("div",null,i)}const d=n(t,[["render",o],["__file","diy-listener.html.vue"]]),m=JSON.parse('{"path":"/code/spring/boot/diy-listener.html","title":"自定义事件监听器","lang":"zh-CN","frontmatter":{"order":3,"title":"自定义事件监听器","date":"2021-10-11T00:00:00.000Z","category":["Spring Boot"],"tag":["Spring Boot"],"timeline":true,"article":true,"description":"配置 ApplicationContextInitializer ApplicationListener SpringApplicationRunListener 在src/main/resources/META-INF/spring.factories下配置 ApplicationRunner CommandLineRunner 添加注解@Compo...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/spring/boot/diy-listener.html"}],["meta",{"property":"og:title","content":"自定义事件监听器"}],["meta",{"property":"og:description","content":"配置 ApplicationContextInitializer ApplicationListener SpringApplicationRunListener 在src/main/resources/META-INF/spring.factories下配置 ApplicationRunner CommandLineRunner 添加注解@Compo..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-26T09:54:15.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"Spring Boot"}],["meta",{"property":"article:published_time","content":"2021-10-11T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-26T09:54:15.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"自定义事件监听器\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-10-11T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-26T09:54:15.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[],"git":{"createdTime":1721987655000,"updatedTime":1721987655000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":0.5,"words":150},"filePathRelative":"code/spring/boot/diy-listener.md","localizedDate":"2021年10月11日","excerpt":"<div class=\\"language-java\\" data-ext=\\"java\\" data-title=\\"java\\"><pre class=\\"language-java\\"><code>实现接口\\n<span class=\\"token class-name\\">ApplicationContextInitializer</span>\\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> <span class=\\"token class-name\\">MyApplicationContextInitializer</span> <span class=\\"token keyword\\">implements</span> <span class=\\"token class-name\\">ApplicationContextInitializer</span> <span class=\\"token punctuation\\">{</span>\\n<span class=\\"token punctuation\\">}</span>\\n\\n<span class=\\"token class-name\\">ApplicationListener</span> \\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> <span class=\\"token class-name\\">MyApplicationListener</span> <span class=\\"token keyword\\">implements</span> <span class=\\"token class-name\\">ApplicationListener</span> <span class=\\"token punctuation\\">{</span>\\n<span class=\\"token punctuation\\">}</span>\\n\\n<span class=\\"token class-name\\">SpringApplicationRunListener</span>\\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> <span class=\\"token class-name\\">MySpringApplicationRunListeners</span> <span class=\\"token keyword\\">implements</span> <span class=\\"token class-name\\">SpringApplicationRunListener</span> <span class=\\"token punctuation\\">{</span>\\n<span class=\\"token punctuation\\">}</span>\\n\\n<span class=\\"token class-name\\">ApplicationRunner</span>\\n<span class=\\"token annotation punctuation\\">@Component</span>\\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> <span class=\\"token class-name\\">MyApplicationRunner</span> <span class=\\"token keyword\\">implements</span> <span class=\\"token class-name\\">ApplicationRunner</span> <span class=\\"token punctuation\\">{</span>\\n<span class=\\"token punctuation\\">}</span>\\n\\n<span class=\\"token class-name\\">CommandLineRunner</span>\\n<span class=\\"token doc-comment comment\\">/**\\n * 应用启动做一个一次性事情\\n */</span>\\n<span class=\\"token comment\\">//MyApplicationRunner，与MyCommandLineRunner优先级@Order()，数字越大优先级越高</span>\\n<span class=\\"token annotation punctuation\\">@Order</span><span class=\\"token punctuation\\">(</span><span class=\\"token number\\">2</span><span class=\\"token punctuation\\">)</span>\\n<span class=\\"token annotation punctuation\\">@Component</span>\\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> <span class=\\"token class-name\\">MyCommandLineRunner</span> <span class=\\"token keyword\\">implements</span> <span class=\\"token class-name\\">CommandLineRunner</span> <span class=\\"token punctuation\\">{</span>\\n<span class=\\"token punctuation\\">}</span>\\n</code></pre></div>","autoDesc":true}');export{d as comp,m as data};
