import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as e,h as a}from"./app-BWbZdTat.js";const i={},t=a(`<p>Spring Boot 自定义事件监听器</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code>实现接口
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ApplicationRunner</p><p>CommandLineRunner</p><p>添加注解@Component，注入IOC容器中，使用@order可以进行排序，数字越大优先级越高</p>`,11),p=[t];function o(l,c){return s(),e("div",null,p)}const m=n(i,[["render",o],["__file","diy-listener.html.vue"]]),u=JSON.parse('{"path":"/code/spring/boot/diy-listener.html","title":"自定义事件监听器","lang":"zh-CN","frontmatter":{"order":3,"title":"自定义事件监听器","date":"2021-10-11T00:00:00.000Z","category":["Spring Boot"],"tag":["Spring Boot"],"timeline":true,"article":true,"description":"Spring Boot 自定义事件监听器 配置 ApplicationContextInitializer ApplicationListener SpringApplicationRunListener 在src/main/resources/META-INF/spring.factories下配置 ApplicationRunner Command...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/spring/boot/diy-listener.html"}],["meta",{"property":"og:title","content":"自定义事件监听器"}],["meta",{"property":"og:description","content":"Spring Boot 自定义事件监听器 配置 ApplicationContextInitializer ApplicationListener SpringApplicationRunListener 在src/main/resources/META-INF/spring.factories下配置 ApplicationRunner Command..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-05-28T09:20:27.000Z"}],["meta",{"property":"article:author","content":"mozzie"}],["meta",{"property":"article:tag","content":"Spring Boot"}],["meta",{"property":"article:published_time","content":"2021-10-11T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-05-28T09:20:27.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"自定义事件监听器\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-10-11T00:00:00.000Z\\",\\"dateModified\\":\\"2025-05-28T09:20:27.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"mozzie\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[],"git":{"createdTime":1721987655000,"updatedTime":1748424027000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1},{"name":"mozzie","email":"du.mozzie@outlook.com","commits":1}]},"readingTime":{"minutes":0.53,"words":160},"filePathRelative":"code/spring/boot/diy-listener.md","localizedDate":"2021年10月11日","excerpt":"<p>Spring Boot 自定义事件监听器</p>","autoDesc":true}');export{m as comp,u as data};
