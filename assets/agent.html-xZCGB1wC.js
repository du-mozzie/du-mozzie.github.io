import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as p,o,c,b as n,d as a,e as i,h as s}from"./app-z-1K7-Nc.js";const l={},u=s(`<p>重新创建一个 SpringBoot 项目，同样需要导入 AOP 相关的依赖。</p><p>一个 Service 类：</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Service</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyService</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name">LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token class-name">MyService</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">final</span> <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;foo()&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">bar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">bar</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;bar()&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一个切面类，注意这个切面类没有被 Spring 管理：</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Aspect</span> <span class="token comment">// ⬅️注意此切面并未被 Spring 管理</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyAspect</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name">LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token class-name">MyAspect</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Before</span><span class="token punctuation">(</span><span class="token string">&quot;execution(* com.itheima.service.MyService.*())&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">before</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;before()&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>测试类</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">/*
    注意几点
    1. 版本选择了 java 8, 因为目前的 aspectj-maven-plugin 1.14.0 最高只支持到 java 16
    2. 运行时需要在 VM options 里加入 -javaagent:E:\\Environment\\apache-maven-3.6.3\\repository\\org\\aspectj\\aspectjweaver\\1.9.7\\aspectjweaver-1.9.7.jar
        把其中 E:\\Environment\\apache-maven-3.6.3\\repository 改为你自己 maven 仓库起始地址
 */</span>
<span class="token annotation punctuation">@SpringBootApplication</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">A10</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name">LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token constant">A10</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ConfigurableApplicationContext</span> context <span class="token operator">=</span> <span class="token class-name">SpringApplication</span><span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token constant">A10</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> args<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">MyService</span> service <span class="token operator">=</span> context<span class="token punctuation">.</span><span class="token function">getBean</span><span class="token punctuation">(</span><span class="token class-name">MyService</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// ⬇️MyService 并非代理, 但 foo 方法也被增强了, 做增强的 java agent, 在加载类时, 修改了 class 字节码</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;service class: {}&quot;</span><span class="token punctuation">,</span> service<span class="token punctuation">.</span><span class="token function">getClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        service<span class="token punctuation">.</span><span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069550686-8c69a850-8a19-4c93-bedd-87b5bea293be.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>能够看到我们的MyService也被增强了</p><p>怎么增强的？</p><ol><li>在 resources 目录下新建 META-INF 文件夹，并在 META-INF 目录下新建 aop.xml 文件，其内容如下：</li></ol><div class="language-xml line-numbers-mode" data-ext="xml" data-title="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>aspectj</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>aspects</span><span class="token punctuation">&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>aspect</span> <span class="token attr-name">name</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>com.itheima.aop.MyAspect<span class="token punctuation">&quot;</span></span><span class="token punctuation">/&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>weaver</span> <span class="token attr-name">options</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>-verbose -showWeaveInfo<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span>
            <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>include</span> <span class="token attr-name">within</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>com.itheima.service.MyService<span class="token punctuation">&quot;</span></span><span class="token punctuation">/&gt;</span></span>
            <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>include</span> <span class="token attr-name">within</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>com.itheima.aop.MyAspect<span class="token punctuation">&quot;</span></span><span class="token punctuation">/&gt;</span></span>
        <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>weaver</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>aspects</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>aspectj</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol><li>添加VM options</li></ol><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>-javaagent:E:\\Environment\\apache-maven-3.6.3\\repository\\org\\aspectj\\aspectjweaver\\1.9.7\\aspectjweaver-1.9.7.jar
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>其中的 E:\\Environment\\apache-maven-3.6.3\\repository 指本地 Maven 仓库地址，还需要确保本地仓库中存在 1.9.7 版本的 aspectjweaver，否则修改至对应版本。</p><p>控制台输出的信息就和前文的内容一样了。</p><p>从输出的内容可以看到 service.getClass() 打印出的信息也是原始类的 Class 信息，而非代理类的 Class 信息。因此不依赖 Spring 容器，直接 new 一个 MyService 实例并调用其 foo() 方法也能达到增强的目的。</p><p>如果查看 MyService 对应的 class 文件，会发现其内容并没有被修改，可以断定不是编译时增强，这里是在类加载时增强。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069581725-53f6eda2-a7d6-4d06-9da0-0a76a5067da3.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>类加载阶段增强</p>`,20),r={href:"https://arthas.aliyun.com/doc/download.html",target:"_blank",rel:"noopener noreferrer"},d=s(`<p>启动arthas-boot.jar，选择我们的应用</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069791456-24a0eb3f-7c09-4737-9b6c-2861c8ac9859.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>使用jad工具进行反编译</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>jad com.itheima.service.MyService
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069929692-eb786143-345b-47fd-b6fd-691c0af64916.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>可以看到 foo() 和 bar() 方法的第一行都被增加了一行代码，也就是这行代码对这两个方法实现了增强。</p><p>不仅如此，如果使用代理实现增强，被调用的 bar() 方法不会被成功增强，因为调用时默认使用了 this 关键词，表示调用的是原类中的方法，而不是代理类中的方法（经典面试题：@Transactional 注解失效的场景）。</p>`,7);function k(m,g){const t=p("ExternalLinkIcon");return o(),c("div",null,[u,n("p",null,[a("要证明agent是在类加载阶段增强的，我们可以使用阿里的工具，下载地址："),n("a",r,[a("arthas"),i(t)])]),d])}const y=e(l,[["render",k],["__file","agent.html.vue"]]),h=JSON.parse('{"path":"/code/spring/spring/aop/agent.html","title":"Agent 类加载","lang":"zh-CN","frontmatter":{"order":2,"title":"Agent 类加载","date":"2021-10-07T00:00:00.000Z","category":["Spring"],"tag":["Spring"],"timeline":true,"article":true,"description":"重新创建一个 SpringBoot 项目，同样需要导入 AOP 相关的依赖。 一个 Service 类： 一个切面类，注意这个切面类没有被 Spring 管理： 测试类 imgimg 能够看到我们的MyService也被增强了 怎么增强的？ 在 resources 目录下新建 META-INF 文件夹，并在 META-INF 目录下新建 aop.xml...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/spring/spring/aop/agent.html"}],["meta",{"property":"og:title","content":"Agent 类加载"}],["meta",{"property":"og:description","content":"重新创建一个 SpringBoot 项目，同样需要导入 AOP 相关的依赖。 一个 Service 类： 一个切面类，注意这个切面类没有被 Spring 管理： 测试类 imgimg 能够看到我们的MyService也被增强了 怎么增强的？ 在 resources 目录下新建 META-INF 文件夹，并在 META-INF 目录下新建 aop.xml..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069550686-8c69a850-8a19-4c93-bedd-87b5bea293be.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-26T09:10:40.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"Spring"}],["meta",{"property":"article:published_time","content":"2021-10-07T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-26T09:10:40.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Agent 类加载\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069550686-8c69a850-8a19-4c93-bedd-87b5bea293be.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069581725-53f6eda2-a7d6-4d06-9da0-0a76a5067da3.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069791456-24a0eb3f-7c09-4737-9b6c-2861c8ac9859.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1708069929692-eb786143-345b-47fd-b6fd-691c0af64916.png\\"],\\"datePublished\\":\\"2021-10-07T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-26T09:10:40.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[],"git":{"createdTime":1721985040000,"updatedTime":1721985040000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":2.47,"words":740},"filePathRelative":"code/spring/spring/aop/agent.md","localizedDate":"2021年10月7日","excerpt":"<p>重新创建一个 SpringBoot 项目，同样需要导入 AOP 相关的依赖。</p>","autoDesc":true}');export{y as comp,h as data};
