import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as t,h as s}from"./app-zeslOAle.js";const e={},o=s(`<h2 id="参数注解" tabindex="-1"><a class="header-anchor" href="#参数注解"><span>参数注解</span></a></h2><table><thead><tr><th></th><th>获取url模板上数据的（/{id}）@DefaultValue，RestFul风格</th><th>获取请求参数的（包括post表单提交）键值对（?param1=10&amp;param2=20）、可以设置defaultValue</th><th>接收前端传递给后端的json字符串中的数据(Get请求不能使用)</th></tr></thead><tbody><tr><td>JAX-RS</td><td></td><td>@PathParam</td><td>@RequestBody</td></tr><tr><td>Spring</td><td>@PathVariable</td><td>@RequestParam</td><td></td></tr></tbody></table><p>@PathVariable：使用RestFul风格获取参数</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">// localhost:8080/user/findOne/2</span>
<span class="token annotation punctuation">@GetMapping</span><span class="token punctuation">(</span><span class="token string">&quot;/findOne/{id}&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token class-name">User</span> <span class="token function">findUserById</span><span class="token punctuation">(</span><span class="token annotation punctuation">@PathVariable</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span> <span class="token class-name">Integer</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> userService<span class="token punctuation">.</span><span class="token function">findUserById</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>@RequestParam：url拼接属性</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">// localhost:8080/user/findOne?id=2</span>
<span class="token annotation punctuation">@GetMapping</span><span class="token punctuation">(</span><span class="token string">&quot;/findOne&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token class-name">User</span> <span class="token function">findUserById</span><span class="token punctuation">(</span><span class="token annotation punctuation">@RequestParam</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span> <span class="token class-name">Integer</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> userService<span class="token punctuation">.</span><span class="token function">findUserById</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>@PathParam：url拼接属性</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">// localhost:8080/user/findOne?id=2</span>
<span class="token annotation punctuation">@GetMapping</span><span class="token punctuation">(</span><span class="token string">&quot;/findOne&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token class-name">User</span> <span class="token function">findUserById</span><span class="token punctuation">(</span><span class="token annotation punctuation">@PathParam</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span> <span class="token class-name">Integer</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> userService<span class="token punctuation">.</span><span class="token function">findUserById</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="格式化注解" tabindex="-1"><a class="header-anchor" href="#格式化注解"><span>格式化注解</span></a></h2><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//注解@JsonFormat主要是后台到前台的时间格式的转换，从数据库获取出的数据展示给前端</span>
<span class="token annotation punctuation">@JsonFormat</span><span class="token punctuation">(</span>pattern<span class="token operator">=</span><span class="token string">&quot;yyyy/MM/dd&quot;</span><span class="token punctuation">,</span>timezone <span class="token operator">=</span> <span class="token string">&quot;UTC+8&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">private</span> <span class="token class-name">LocalDate</span> birthday<span class="token punctuation">;</span>

<span class="token comment">//注解@DataFormat主要是前后到后台的时间格式的转换，从前端接收的数据保存到数据库</span>
<span class="token annotation punctuation">@DateTimeFormat</span><span class="token punctuation">(</span>pattern<span class="token operator">=</span><span class="token string">&quot;yyyy/MM/dd&quot;</span><span class="token punctuation">)</span>
<span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>columnDefinition <span class="token operator">=</span> <span class="token string">&quot;DATE COMMENT &#39;员工生日&#39;&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">private</span> <span class="token class-name">LocalDate</span> birthday<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="swagger" tabindex="-1"><a class="header-anchor" href="#swagger"><span>Swagger</span></a></h2><table><thead><tr><th>swagger2</th><th>OpenAPI 3</th><th>注解位置</th></tr></thead><tbody><tr><td>@Api</td><td>@Tag(name = “接口类描述”)</td><td>Controller 类上</td></tr><tr><td>@ApiOperation</td><td>@Operation(summary =“接口方法描述”)</td><td>Controller 方法上</td></tr><tr><td>@ApiImplicitParams</td><td>@Parameters</td><td>Controller 方法上</td></tr><tr><td>@ApiImplicitParam</td><td>@Parameter(description=“参数描述”)</td><td>Controller 方法上 @Parameters 里</td></tr><tr><td>@ApiParam</td><td>@Parameter(description=“参数描述”)</td><td>Controller 方法的参数上</td></tr><tr><td>@ApiIgnore</td><td>@Parameter(hidden = true) 或 @Operation(hidden = true) 或 @Hidden</td><td>-</td></tr><tr><td>@ApiModel</td><td>@Schema</td><td>DTO类上</td></tr><tr><td>@ApiModelProperty</td><td>@Schema(description=“属性描述”)</td><td>DTO属性上</td></tr></tbody></table>`,12),p=[o];function i(c,l){return a(),t("div",null,p)}const u=n(e,[["render",i],["__file","annotation.html.vue"]]),m=JSON.parse('{"path":"/code/spring/boot/annotation.html","title":"注解总结","lang":"zh-CN","frontmatter":{"order":4,"title":"注解总结","date":"2021-10-12T00:00:00.000Z","category":["Spring Boot"],"tag":["Spring Boot"],"timeline":true,"article":true,"description":"参数注解 @PathVariable：使用RestFul风格获取参数 @RequestParam：url拼接属性 @PathParam：url拼接属性 格式化注解 Swagger","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/spring/boot/annotation.html"}],["meta",{"property":"og:title","content":"注解总结"}],["meta",{"property":"og:description","content":"参数注解 @PathVariable：使用RestFul风格获取参数 @RequestParam：url拼接属性 @PathParam：url拼接属性 格式化注解 Swagger"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-07-26T09:54:15.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"Spring Boot"}],["meta",{"property":"article:published_time","content":"2021-10-12T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-07-26T09:54:15.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"注解总结\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-10-12T00:00:00.000Z\\",\\"dateModified\\":\\"2024-07-26T09:54:15.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"参数注解","slug":"参数注解","link":"#参数注解","children":[]},{"level":2,"title":"格式化注解","slug":"格式化注解","link":"#格式化注解","children":[]},{"level":2,"title":"Swagger","slug":"swagger","link":"#swagger","children":[]}],"git":{"createdTime":1721987655000,"updatedTime":1721987655000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":1.21,"words":362},"filePathRelative":"code/spring/boot/annotation.md","localizedDate":"2021年10月12日","excerpt":"<h2>参数注解</h2>","autoDesc":true}');export{u as comp,m as data};
