import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,h as t}from"./app-BKjTP-TF.js";const e={},o=t(`<h1 id="aware接口" tabindex="-1"><a class="header-anchor" href="#aware接口"><span>Aware接口</span></a></h1><p>Aware 接口用于注入一些与容器相关的信息，比如：</p><ul><li>BeanNameAware 注入 Bean 的名字</li><li>BeanFactoryAware 注入 BeanFactory 容器</li><li>ApplicationContextAware 注入 ApplicationContext 容器</li><li>EmbeddedValueResolverAware 解析 \${}</li></ul><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBean</span> <span class="token keyword">implements</span> <span class="token class-name">BeanNameAware</span><span class="token punctuation">,</span> <span class="token class-name">ApplicationContextAware</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name">LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token class-name">MyBean</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setBeanName</span><span class="token punctuation">(</span><span class="token class-name">String</span> name<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;当前bean &quot;</span> <span class="token operator">+</span> <span class="token keyword">this</span> <span class="token operator">+</span> <span class="token string">&quot; 名字叫:&quot;</span> <span class="token operator">+</span> name<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setApplicationContext</span><span class="token punctuation">(</span><span class="token class-name">ApplicationContext</span> applicationContext<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;当前bean &quot;</span> <span class="token operator">+</span> <span class="token keyword">this</span> <span class="token operator">+</span> <span class="token string">&quot; 容器是:&quot;</span> <span class="token operator">+</span> applicationContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">GenericApplicationContext</span> context <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">GenericApplicationContext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token string">&quot;myBean&quot;</span><span class="token punctuation">,</span> <span class="token class-name">MyBean</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    context<span class="token punctuation">.</span><span class="token function">refresh</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707877980523-3b5b79a1-7dd5-43d4-be79-2536dd622f4b.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h1 id="initializingbean" tabindex="-1"><a class="header-anchor" href="#initializingbean"><span>InitializingBean</span></a></h1><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Slf4j</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBean</span> <span class="token keyword">implements</span> <span class="token class-name">BeanNameAware</span><span class="token punctuation">,</span> <span class="token class-name">ApplicationContextAware</span><span class="token punctuation">,</span> <span class="token class-name">InitializingBean</span> <span class="token punctuation">{</span>
    <span class="token comment">// --snip--</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">afterPropertiesSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;当前 Bean: &quot;</span> <span class="token operator">+</span> <span class="token keyword">this</span> <span class="token operator">+</span> <span class="token string">&quot; 初始化&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707878992152-a619d586-cbcc-45ee-b977-da10a107ed27.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>当同时实现 Aware 接口和 InitializingBean 接口时，会先执行 Aware 接口。</p><p>BeanFactoryAware 、ApplicationContextAware 和 EmbeddedValueResolverAware 三个接口的功能可以使用 @Autowired 注解实现，InitializingBean 接口的功能也可以使用 @PostConstruct 注解实现，为什么还要使用接口呢？</p><p>@Autowired 和 @PostConstruct 注解的解析需要使用 Bean 后置处理器，属于拓展功能，而这些接口属于内置功能，不加任何拓展 Spring 就能识别。在某些情况下，拓展功能会失效，而内容功能不会失效。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Slf4j</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBean</span> <span class="token keyword">implements</span> <span class="token class-name">BeanNameAware</span><span class="token punctuation">,</span> <span class="token class-name">ApplicationContextAware</span><span class="token punctuation">,</span> <span class="token class-name">InitializingBean</span> <span class="token punctuation">{</span>
   	<span class="token comment">// --snip--</span>

    <span class="token annotation punctuation">@Autowired</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setApplicationContextWithAutowired</span><span class="token punctuation">(</span><span class="token class-name">ApplicationContext</span> applicationContext<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;当前 Bean: &quot;</span> <span class="token operator">+</span> <span class="token keyword">this</span> <span class="token operator">+</span> <span class="token string">&quot; 使用 @Autowired 注解，容器是: &quot;</span> <span class="token operator">+</span> applicationContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@PostConstruct</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">init</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;当前 Bean: &quot;</span> <span class="token operator">+</span> <span class="token keyword">this</span> <span class="token operator">+</span> <span class="token string">&quot; 使用 @PostConstruct 注解初始化&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>再运行 main() 方法会发现使用的注解没有被成功解析，原因很简单，GenericApplicationContext 是一个干净的容器，其内部没有用于解析这些注解的后置处理器。如果想要这些注解生效，则需要像前文一样添加必要的后置处理器：</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code>context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">AutowiredAnnotationBeanPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">CommonAnnotationBeanPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="失效的-autowired-注解" tabindex="-1"><a class="header-anchor" href="#失效的-autowired-注解"><span>失效的 @Autowired 注解</span></a></h1><p>在某些情况下，尽管容器中存在必要的后置处理器，但 @Autowired 和 @PostConstruct 注解也会失效。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Slf4j</span>
<span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyConfig1</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Autowired</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setApplicationContext</span><span class="token punctuation">(</span><span class="token class-name">ApplicationContext</span> applicationContext<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;注入 ApplicationContext&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@PostConstruct</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">init</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;初始化&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">GenericApplicationContext</span> context <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">GenericApplicationContext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token string">&quot;myConfig1&quot;</span><span class="token punctuation">,</span> <span class="token class-name">MyConfig1</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">AutowiredAnnotationBeanPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">CommonAnnotationBeanPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 解析配置类中的注解</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">ConfigurationClassPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    context<span class="token punctuation">.</span><span class="token function">refresh</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707890960872-e1ad814c-2695-4a88-96ec-137749ec21fb.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>@Autowired 和 @PostConstruct 注解成功被解析。</p><p>如果再对 Config1 进行一点小小的修改呢？</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Slf4j</span>
<span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyConfig1</span> <span class="token punctuation">{</span>
    <span class="token comment">// --snip--</span>

    <span class="token annotation punctuation">@Bean</span>
    <span class="token keyword">public</span> <span class="token class-name">BeanFactoryPostProcessor</span> <span class="token function">processor1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> processor <span class="token operator">-&gt;</span> log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;执行 processor1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891037131-c0f09cc4-ef55-4896-a210-0760616211b3.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>processor1() 方法成功生效，但 @Autowired 和 @PostConstruct 注解的解析失败了。</p><p>对于 context.refresh(); 方法来说，它主要按照以下顺序干了三件事：</p><ol><li>执行 BeanFactory 后置处理器；</li><li>添加 Bean 后置处理器；</li><li>创建和初始化单例对象。</li></ol><p>比如当 Java 配置类不包括 BeanFactoryPostProcessor 时：</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891130633-0b7049c8-0334-4946-a614-3629d04361b4.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>BeanFactoryPostProcessor 会在 Java 配置类初始化之前执行。</p><p>当 Java 配置类中定义了 BeanFactoryPostProcessor 时，如果要创建配置类中的 BeanFactoryPostProcessor 就必须提前创建和初始化 Java 配置类。</p><p>在创建和初始化 Java 配置类时，由于 BeanPostProcessor 还未准备好，无法解析配置类中的 @Autowired 等注解，导致 @Autowired 等注解失效：</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891168662-432b200e-7f4d-4d51-95c3-db56f64f6fea.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>要解决这个问题也很简单，使用相关接口的功能实现注入和初始化：</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyConfig2</span> <span class="token keyword">implements</span> <span class="token class-name">InitializingBean</span><span class="token punctuation">,</span> <span class="token class-name">ApplicationContextAware</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name">LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token class-name">MyConfig2</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">afterPropertiesSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;初始化&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setApplicationContext</span><span class="token punctuation">(</span><span class="token class-name">ApplicationContext</span> applicationContext<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">BeansException</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;注入 ApplicationContext&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Bean</span> <span class="token comment">//  beanFactory 后处理器</span>
    <span class="token keyword">public</span> <span class="token class-name">BeanFactoryPostProcessor</span> <span class="token function">processor2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> beanFactory <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
            log<span class="token punctuation">.</span><span class="token function">debug</span><span class="token punctuation">(</span><span class="token string">&quot;执行 processor2&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">GenericApplicationContext</span> context <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">GenericApplicationContext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token string">&quot;myConfig2&quot;</span><span class="token punctuation">,</span> <span class="token class-name">MyConfig2</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">AutowiredAnnotationBeanPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">CommonAnnotationBeanPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 解析配置类中的注解</span>
    context<span class="token punctuation">.</span><span class="token function">registerBean</span><span class="token punctuation">(</span><span class="token class-name">ConfigurationClassPostProcessor</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    context<span class="token punctuation">.</span><span class="token function">refresh</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    context<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891525899-12ec539f-959b-45dd-a46c-ba07c94f77ad.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>其实在测试Config1、Config2的时候spring就给我们提示了</p><p>[INFO ] 14:10:03.081 [main] o.s.c.a.ConfigurationClassEnhancer - @Bean method MyConfig1.processor1 is non-static and returns an object assignable to Spring&#39;s BeanFactoryPostProcessor interface. This will result in a failure to process annotations such as @Autowired, @Resource and @PostConstruct within the method&#39;s declaring @Configuration class. Add the &#39;static&#39; modifier to this method to avoid these container lifecycle issues; see @Bean javadoc for complete details.</p><p>我们自定义的BeanFactoryPostProcessor跟Bean生命周期冲突了，可以将自定义的方法修改为静态方法，也能够解决这个问题，静态方法会在类加载时就被初始化</p><p><strong>总结：</strong></p><ol><li>Aware 接口提供了一种 内置 的注入手段，可以注入 BeanFactory、ApplicationContext；</li><li>InitializingBean 接口提供了一种 内置 的初始化手段；</li><li>内置的注入和初始化不受拓展功能的影响，总会被执行，因此 Spring 框架内部的类总是使用这些接口。</li></ol>`,39),p=[o];function c(i,l){return s(),a("div",null,p)}const d=n(e,[["render",c],["__file","aware.html.vue"]]),k=JSON.parse('{"path":"/code/spring/spring/ioc-bean/aware.html","title":"Aware接口","lang":"zh-CN","frontmatter":{"order":4,"title":"Aware接口","date":"2021-10-04T00:00:00.000Z","category":["Spring"],"tag":["Spring"],"timeline":true,"article":true,"description":"Aware接口 Aware 接口用于注入一些与容器相关的信息，比如： BeanNameAware 注入 Bean 的名字 BeanFactoryAware 注入 BeanFactory 容器 ApplicationContextAware 注入 ApplicationContext 容器 EmbeddedValueResolverAware 解析 ${...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/spring/spring/ioc-bean/aware.html"}],["meta",{"property":"og:title","content":"Aware接口"}],["meta",{"property":"og:description","content":"Aware接口 Aware 接口用于注入一些与容器相关的信息，比如： BeanNameAware 注入 Bean 的名字 BeanFactoryAware 注入 BeanFactory 容器 ApplicationContextAware 注入 ApplicationContext 容器 EmbeddedValueResolverAware 解析 ${..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707877980523-3b5b79a1-7dd5-43d4-be79-2536dd622f4b.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-26T03:50:17.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"Spring"}],["meta",{"property":"article:published_time","content":"2021-10-04T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-26T03:50:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Aware接口\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707877980523-3b5b79a1-7dd5-43d4-be79-2536dd622f4b.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707878992152-a619d586-cbcc-45ee-b977-da10a107ed27.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707890960872-e1ad814c-2695-4a88-96ec-137749ec21fb.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891037131-c0f09cc4-ef55-4896-a210-0760616211b3.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891130633-0b7049c8-0334-4946-a614-3629d04361b4.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891168662-432b200e-7f4d-4d51-95c3-db56f64f6fea.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1707891525899-12ec539f-959b-45dd-a46c-ba07c94f77ad.png\\"],\\"datePublished\\":\\"2021-10-04T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-26T03:50:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[],"git":{"createdTime":1721965817000,"updatedTime":1721965817000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":3.71,"words":1113},"filePathRelative":"code/spring/spring/ioc-bean/aware.md","localizedDate":"2021年10月4日","excerpt":"\\n<p>Aware 接口用于注入一些与容器相关的信息，比如：</p>","autoDesc":true}');export{d as comp,k as data};
