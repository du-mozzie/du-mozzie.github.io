import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,h as e}from"./app-Dff-eiSY.js";const t={},i=e(`<p>Lua脚本是一种轻量级的脚本语言，常嵌入到Redis等数据库中，用于执行复杂的、原子性的操作序列，通过一次性执行多个命令来减少网络开销并避免并发问题，增强数据处理的安全性和效率。</p><h2 id="简介" tabindex="-1"><a class="header-anchor" href="#简介"><span>简介</span></a></h2><p>​ 从 Redis 2.6.0 版本开始，通过内置的 Lua 解释器，可以使用 EVAL 命令对 Lua 脚本进行求值。在lua脚本中可以通过两个不同的函数调用redis命令，分别是：<strong>redis.call()</strong> 和 <strong>redis.pcall()</strong></p><h3 id="脚本的原子性" tabindex="-1"><a class="header-anchor" href="#脚本的原子性"><span>脚本的原子性</span></a></h3><p>Redis 使用单个 Lua 解释器去运行所有脚本，并且， <strong>Redis 也保证脚本会以原子性</strong>**(atomic)的方式执行：当某个脚本正在运行的时候，不会有其他脚本或 Redis 命令被执行。**这和使用 MULTI / EXEC 包围的事务很类似。在其他别的客户端看来，脚本的效果(effect)要么是不可见的(not visible)，要么就是已完成的(already completed)。</p><p>另一方面，这也意味着，执行一个运行缓慢的脚本并不是一个好主意。写一个跑得很快很顺溜的脚本并不难，因为脚本的运行开销(overhead)非常少，但是当你不得不使用一些跑得比较慢的脚本时，请小心，因为当这些蜗牛脚本在慢吞吞地运行的时候，其他客户端会因为服务器正忙而无法执行命令。</p><h3 id="错误处理" tabindex="-1"><a class="header-anchor" href="#错误处理"><span>错误处理</span></a></h3><p>redis.call() 和 redis.pcall() 的唯一区别在于它们对错误处理的不同。</p><ol><li><p>当 redis.call() 在执行命令的过程中发生错误时，脚本会停止执行，并返回一个脚本错误，错误的输出信息会说明错误造成的原因</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191810070.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li><li><p>redis.pcall() 出错时并不引发(raise)错误，而是返回一个带 err 域的 Lua 表(table)，用于表示错误</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191844731.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li></ol><h3 id="带宽和evalsha" tabindex="-1"><a class="header-anchor" href="#带宽和evalsha"><span>带宽和EVALSHA</span></a></h3><ol><li><p>EVAL 命令要求你在每次执行脚本的时候都发送一次脚本主体(script body)。Redis 有一个内部的缓存机制，因此它不会每次都重新编译脚本，不过在很多场合，付出无谓的带宽来传送脚本主体并不是最佳选择。</p></li><li><p>为了减少带宽的消耗， Redis 实现了 EVALSHA 命令，它的作用和 EVAL 一样，都用于对脚本求值，但它接受的第一个参数不是脚本，而是脚本的 SHA1 校验和(sum)。</p></li><li><p>客户端库的底层实现可以一直乐观地使用 EVALSHA 来代替 EVAL ，并期望着要使用的脚本已经保存在服务器上了，只有当 NOSCRIPT 错误发生时，才使用 EVAL 命令重新发送脚本，这样就可以最大限度地节省带宽。</p></li><li><p>这也说明了执行 EVAL 命令时，使用正确的格式来传递键名参数和附加参数的重要性：因为如果将参数硬写在脚本中，那么每次当参数改变的时候，都要重新发送脚本，即使脚本的主体并没有改变，相反，通过使用正确的格式来传递键名参数和附加参数，就可以在脚本主体不变的情况下，直接使用 EVALSHA 命令对脚本进行复用，免去了无谓的带宽消耗。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191957370.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li></ol><h3 id="脚本缓存" tabindex="-1"><a class="header-anchor" href="#脚本缓存"><span>脚本缓存</span></a></h3><ol><li>Redis 保证所有被运行过的脚本都会被永久保存在脚本缓存当中，这意味着，当 EVAL命令在一个 Redis 实例上成功执行某个脚本之后，随后针对这个脚本的所有 EVALSHA 命令都会成功执行。</li><li>刷新脚本缓存的唯一办法是显式地调用 SCRIPT FLUSH 命令，这个命令会清空运行过的所有脚本的缓存。通常只有在云计算环境中，Redis 实例被改作其他客户或者别的应用程序的实例时，才会执行这个命令。</li><li>缓存可以长时间储存而不产生内存问题的原因是，它们的体积非常小，而且数量也非常少，即使脚本在概念上类似于实现一个新命令，即使在一个大规模的程序里有成百上千的脚本，即使这些脚本会经常修改，即便如此，储存这些脚本的内存仍然是微不足道的。</li><li>事实上，用户会发现 Redis 不移除缓存中的脚本实际上是一个好主意。比如说，对于一个和 Redis 保持持久化链接(persistent connection)的程序来说，它可以确信，执行过一次的脚本会一直保留在内存当中，因此它可以在流水线中使用 EVALSHA 命令而不必担心因为找不到所需的脚本而产生错误(稍候我们会看到在流水线中执行脚本的相关问题)。</li></ol><h3 id="全局变量保护" tabindex="-1"><a class="header-anchor" href="#全局变量保护"><span>全局变量保护</span></a></h3><p>​ 为了防止不必要的数据泄漏进 Lua 环境， Redis 脚本不允许创建全局变量。如果一个脚本需要在多次执行之间维持某种状态，它应该使用 Redis key 来进行状态保存。</p><p>​ 实现全局变量保护并不难，不过有时候还是会不小心而为之。一旦用户在脚本中混入了Lua 全局状态，那么 AOF 持久化和复制（replication）都会无法保证，所以，请不要使用全局变量。避免引入全局变量的一个诀窍是：将脚本中用到的所有变量都使用 local 关键字定义为局部变量。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193310960.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h2 id="脚本指令" tabindex="-1"><a class="header-anchor" href="#脚本指令"><span>脚本指令</span></a></h2><h3 id="eval" tabindex="-1"><a class="header-anchor" href="#eval"><span>eval</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#格式</span>
<span class="token builtin class-name">eval</span> script numkeys key <span class="token punctuation">[</span>key <span class="token punctuation">..</span>.<span class="token punctuation">]</span> arg <span class="token punctuation">[</span>arg <span class="token punctuation">..</span>.<span class="token punctuation">]</span>
<span class="token comment">#参数说明</span>
<span class="token comment">#script：是一段 Lua 5.1 脚本程序，它会被运行在 Redis 服务器上下文中，这段脚本不必(也不应该)定义为一个 Lua 函数。</span>
<span class="token comment">#numkeys:用于指定键名参数的个数。</span>
<span class="token comment">#key：键名参数，表示在脚本中所用到的那些 Redis 键(key)，这些键名参数可以在 Lua 中通过全局变量 KEYS 数组，用 1 为基址的形式访问( KEYS[1] ，KEYS[2] ，以此类推)。</span>
<span class="token comment">#arg：全局变量，可以在 Lua 中通过全局变量 ARGV 数组访问，访问的形式和 KEYS 变量类似( ARGV[1] 、 ARGV[2] ，诸如此类)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193550152.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>在lua脚本中可以通过两个不同的函数调用redis命令，分别是：redis.call() 和 redis.pcall()</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#写法1</span>
<span class="token builtin class-name">eval</span> <span class="token string">&quot;return redis.call(&#39;set&#39;,&#39;name1&#39;,&#39;ypf1&#39;)&quot;</span> <span class="token number">0</span>
<span class="token comment">#写法2 （推荐！！）</span>
<span class="token builtin class-name">eval</span> <span class="token string">&quot;return redis.call(&#39;set&#39;,KEYS[1],&#39;ypf2&#39;)&quot;</span> <span class="token number">1</span> name2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>剖析：</strong></p><p>写法1违反了EVAL 命令的语义，因为脚本里使用的所有键都应该由 KEYS 数组来传递。</p><p>要求使用正确的形式来传递键(key)是有原因的，因为不仅仅是 EVAL 这个命令，所有的 Redis 命令，在执行之前都会被分析，以此来确定命令会对哪些键进行操作。因此，对于 EVAL 命令来说，必须使用正确的形式来传递键，才能确保分析工作正确地执行。除此之外，使用正确的形式来传递键还有很多其他好处，它的一个特别重要的用途就是确保 Redis 集群可以将你的请求发送到正确的集群节点。(对 Redis 集群的工作还在进行当中，但是脚本功能被设计成可以与集群功能保持兼容。)不过，这条规矩并不是强制性的，从而使得用户有机会滥用(abuse) Redis 单实例配置(single instance configuration)，代价是这样写出的脚本不能被 Redis 集群所兼容。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193711610.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="evalsha" tabindex="-1"><a class="header-anchor" href="#evalsha"><span>evalsha</span></a></h3><p>根据给定的 sha1 校验码，对缓存在服务器中的脚本进行求值</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#格式</span>
evalsha sha1 numkeys key <span class="token punctuation">[</span>key <span class="token punctuation">..</span>.<span class="token punctuation">]</span> arg <span class="token punctuation">[</span>arg <span class="token punctuation">..</span>.<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193744846.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="script-load" tabindex="-1"><a class="header-anchor" href="#script-load"><span>script load</span></a></h3><p>将脚本 script 添加到脚本缓存中，但并不立即执行这个脚本。</p><p><strong>EVAL 命令也会将脚本添加到脚本缓存中</strong>，但是它会<strong>立即对输入的脚本</strong>进行求值。如果给定的脚本已经在缓存里面了，那么不做动作。在脚本被加入到缓存之<strong>script exists</strong>后，通过 EVALSHA 命令，可以使用脚本的 SHA1 校验和来调用这个脚本。脚本可以在缓存中保留无限长的时间，直到执行 SCRIPT FLUSH 为止。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193812953.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="script-exists" tabindex="-1"><a class="header-anchor" href="#script-exists"><span>script exists</span></a></h3><p>判断脚本是否已经添加到缓存中去了，1代表已经添加，0代表没有添加。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193856467.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="script-kill" tabindex="-1"><a class="header-anchor" href="#script-kill"><span>script kill</span></a></h3><p>​ 杀死当前正在运行的 Lua 脚本，当且仅当这个脚本没有执行过任何写操作时，这个命令才生效。</p><p>这个命令主要用于终止运行时间过长的脚本，比如一个因为 BUG 而发生无限 loop 的脚本，诸如此类。SCRIPT KILL 执行之后，当前正在运行的脚本会被杀死，执行这个脚本的客户端会从EVAL 命令的阻塞当中退出，并收到一个错误作为返回值。</p><p>另一方面，假如当前正在运行的脚本已经执行过写操作，那么即使执行 SCRIPT KILL ，也无法将它杀死，因为这是违反 Lua 脚本的原子性执行原则的。在这种情况下，唯一可行的办法是使用 SHUTDOWN NOSAVE 命令，通过停止整个 Redis 进程来停止脚本的运行，并防止不完整(half-written)的信息被写入数据库中。</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193950697.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="script-flush" tabindex="-1"><a class="header-anchor" href="#script-flush"><span>script flush</span></a></h3><p>清除所有 Lua 脚本缓存</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194024905.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h2 id="lua语法" tabindex="-1"><a class="header-anchor" href="#lua语法"><span>Lua语法</span></a></h2><h3 id="介绍" tabindex="-1"><a class="header-anchor" href="#介绍"><span>介绍</span></a></h3><p>Lua 是一种轻量小巧的脚本语言，用标准C语言编写并以源代码形式开放， 其设计目的是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能。常见的数据类型如下：</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194337397.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>redis和lua之间的数据类型存在一一对应关系:</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194608588.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194621057.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h3 id="好处" tabindex="-1"><a class="header-anchor" href="#好处"><span>好处</span></a></h3><ol><li>减少网络开销：本来多次网络请求的操作，可以用一个请求完成，原先多次次请求的逻辑都放在redis服务器上完成，使用脚本，减少了网络往返时延。</li><li>原子操作：Redis会将整个脚本作为一个整体执行，中间不会被其他命令插入。</li><li>复用：客户端发送的脚本会永久存储在Redis中，意味着其他客户端可以复用这一脚本而不需要使用代码完成同样的逻辑。</li><li>替代redis的事务功能：redis自带的事务功能很鸡肋，报错不支持回滚，而redis的lua脚本几乎实现了常规的事务功能，支持报错回滚操作，官方推荐如果要使用redis的事务功能可以用redis lua替代。</li></ol><p>官网原话</p><blockquote><p>A Redis script is transactional by definition, so everything you can do with a Redis transaction, you can also do with a script, and usually the script will be both simpler and faster.</p></blockquote><p><strong>注：lua整合一系列redis操作, 是为了保证原子性, 即redis在处理这个lua脚本期间不能执行其它操作,</strong> 但是lua脚本自身假设中间某条指令出错，并不会回滚的，会继续往下执行或者报错了。</p><h3 id="基本语法" tabindex="-1"><a class="header-anchor" href="#基本语法"><span>基本语法</span></a></h3><ol><li>基本结构，类似于js，前面声明方法，后面调用方法。</li><li>获取传过来的参数：ARGV[1]、ARGV[2] 依次类推，获取传过来的Key，用KEYS[1]来获取。</li><li>调用redis的api，用redis.call( )方法调用。</li><li>int类型转换 tonumber</li></ol><p><mark>参考代码</mark></p><p><strong>1.设计思路</strong></p><p>A.编写Lua脚本，将单品限流、购买商品限制、方法幂等、扩建库存整合在一个lua脚本中,程序通过相关的Api调用即可。</p><p>B.启动项目的是加载读取Lua脚本并转换→转换后的结果存到服务器缓存中→业务中调用的时候直接从缓存中读取传给Redis的Api。</p><p><strong>2.分析</strong></p><p>A. 整合在一个脚本中,程序相当于只链接了一次Redis，提高了性能,解决以上四个业务相互之间可能存在的并发问题</p><p>B. 在集群环境中，能替代分布式锁吗？</p><p><strong>3.代码分享</strong></p><p>lua整合脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>--<span class="token punctuation">[</span><span class="token punctuation">[</span>本脚本主要整合：单品限流、购买的商品数量限制、方法幂等、扣减库存的业务<span class="token punctuation">]</span><span class="token punctuation">]</span>

--<span class="token punctuation">[</span><span class="token punctuation">[</span>
    一. 方法声明
<span class="token punctuation">]</span><span class="token punctuation">]</span>--

--1. 单品限流--解决缓存覆盖问题
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> seckillLimit<span class="token punctuation">(</span><span class="token punctuation">)</span>
--<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>.获取相关参数
-- 限制请求数量
<span class="token builtin class-name">local</span> <span class="token assign-left variable">tLimits</span><span class="token operator">=</span>tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
-- 限制秒数
<span class="token builtin class-name">local</span> tSeconds <span class="token operator">=</span>tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">2</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
-- 受限商品key
<span class="token builtin class-name">local</span> limitKey <span class="token operator">=</span> ARGV<span class="token punctuation">[</span><span class="token number">3</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
--<span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>.执行判断业务
<span class="token builtin class-name">local</span> myLimitCount <span class="token operator">=</span> redis.call<span class="token punctuation">(</span><span class="token string">&#39;INCR&#39;</span>,limitKey<span class="token punctuation">)</span><span class="token punctuation">;</span>

-- 仅当第一个请求进来设置过期时间
<span class="token keyword">if</span> <span class="token punctuation">(</span>myLimitCount <span class="token operator">==</span><span class="token number">1</span><span class="token punctuation">)</span> 
<span class="token keyword">then</span>
redis.call<span class="token punctuation">(</span><span class="token string">&#39;expire&#39;</span>,limitKey,tSeconds<span class="token punctuation">)</span> --设置缓存过期
end<span class="token punctuation">;</span>   --对应的是if的结束

-- 超过限制数量,返回失败
<span class="token keyword">if</span> <span class="token punctuation">(</span>myLimitCount <span class="token operator">&gt;</span> tLimits<span class="token punctuation">)</span> 
<span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">0</span><span class="token punctuation">;</span>  --失败
end<span class="token punctuation">;</span>   --对应的是if的结束

end<span class="token punctuation">;</span>   --对应的是整个代码块的结束


--2. 限制一个用户商品购买数量（这里假设一次购买一件，后续改造）
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> userBuyLimit<span class="token punctuation">(</span><span class="token punctuation">)</span>
--<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>.获取相关参数
<span class="token builtin class-name">local</span> tGoodBuyLimits <span class="token operator">=</span> tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">5</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span> 
<span class="token builtin class-name">local</span> userBuyGoodLimitKey <span class="token operator">=</span> ARGV<span class="token punctuation">[</span><span class="token number">6</span><span class="token punctuation">]</span><span class="token punctuation">;</span> 

--<span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>.执行判断业务
<span class="token builtin class-name">local</span> myLimitCount <span class="token operator">=</span> redis.call<span class="token punctuation">(</span><span class="token string">&#39;INCR&#39;</span>,userBuyGoodLimitKey<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>myLimitCount <span class="token operator">&gt;</span> tGoodBuyLimits<span class="token punctuation">)</span>
<span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">0</span><span class="token punctuation">;</span>  --失败
<span class="token keyword">else</span>
redis.call<span class="token punctuation">(</span><span class="token string">&#39;expire&#39;</span>,userBuyGoodLimitKey,600<span class="token punctuation">)</span>  --10min过期
<span class="token builtin class-name">return</span> <span class="token number">1</span><span class="token punctuation">;</span>  --成功
end<span class="token punctuation">;</span>
end<span class="token punctuation">;</span>    --对应的是整个代码块的结束

--3. 方法幂等<span class="token punctuation">(</span>防止网络延迟多次下单<span class="token punctuation">)</span>
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> recordOrderSn<span class="token punctuation">(</span><span class="token punctuation">)</span>
--<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>.获取相关参数
<span class="token builtin class-name">local</span> requestId <span class="token operator">=</span> ARGV<span class="token punctuation">[</span><span class="token number">7</span><span class="token punctuation">]</span><span class="token punctuation">;</span>    --请求ID
--<span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>.执行判断业务
<span class="token builtin class-name">local</span> requestIdNum <span class="token operator">=</span> redis.call<span class="token punctuation">(</span><span class="token string">&#39;INCR&#39;</span>,requestId<span class="token punctuation">)</span><span class="token punctuation">;</span>
--表示第一次请求
<span class="token keyword">if</span> <span class="token punctuation">(</span>requestIdNum<span class="token operator">==</span><span class="token number">1</span><span class="token punctuation">)</span>                            
<span class="token keyword">then</span>
redis.call<span class="token punctuation">(</span><span class="token string">&#39;expire&#39;</span>,requestId,600<span class="token punctuation">)</span>  --10min过期
<span class="token builtin class-name">return</span> <span class="token number">1</span><span class="token punctuation">;</span> --成功
end<span class="token punctuation">;</span>
--第二次及第二次以后的请求
<span class="token keyword">if</span> <span class="token punctuation">(</span>requestIdNum<span class="token operator">&gt;</span><span class="token number">1</span><span class="token punctuation">)</span>
<span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">0</span><span class="token punctuation">;</span>  --失败
end<span class="token punctuation">;</span>
end<span class="token punctuation">;</span>  --对应的是整个代码块的结束

--4、扣减库存
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> subtractSeckillStock<span class="token punctuation">(</span><span class="token punctuation">)</span>
--<span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span> 获取相关参数
<span class="token parameter variable">--local</span> key <span class="token operator">=</span>KEYS<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span>   --传过来的是ypf12345没有什么用处
<span class="token parameter variable">--local</span> arg1 <span class="token operator">=</span> tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>--购买的商品数量
-- <span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">)</span>.扣减库存
-- <span class="token builtin class-name">local</span> lastNum <span class="token operator">=</span> redis.call<span class="token punctuation">(</span><span class="token string">&#39;DECR&#39;</span>,<span class="token string">&quot;sCount&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token builtin class-name">local</span> lastNum <span class="token operator">=</span> redis.call<span class="token punctuation">(</span><span class="token string">&#39;DECRBY&#39;</span>,ARGV<span class="token punctuation">[</span><span class="token number">8</span><span class="token punctuation">]</span>,tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">4</span><span class="token punctuation">]</span><span class="token punctuation">))</span><span class="token punctuation">;</span>  --string类型的自减
-- <span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>.判断库存是否完成
<span class="token keyword">if</span> lastNum <span class="token operator">&lt;</span> <span class="token number">0</span> 
<span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">0</span><span class="token punctuation">;</span> --失败
<span class="token keyword">else</span>
<span class="token builtin class-name">return</span> <span class="token number">1</span><span class="token punctuation">;</span> --成功
end
end



--<span class="token punctuation">[</span><span class="token punctuation">[</span>
    二. 方法调用   返回值1代表成功，返回：0，2，3，4 代表不同类型的失败
<span class="token punctuation">]</span><span class="token punctuation">]</span>--

--1. 单品限流调用
<span class="token builtin class-name">local</span> status1 <span class="token operator">=</span> seckillLimit<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> status1 <span class="token operator">==</span> <span class="token number">0</span> <span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">2</span><span class="token punctuation">;</span>   --失败
end

--2. 限制购买数量
<span class="token builtin class-name">local</span> status2 <span class="token operator">=</span> userBuyLimit<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> status2 <span class="token operator">==</span> <span class="token number">0</span> <span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">3</span><span class="token punctuation">;</span>   --失败
end


--3.  方法幂等
<span class="token builtin class-name">local</span> status3 <span class="token operator">=</span> recordOrderSn<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> status3 <span class="token operator">==</span> <span class="token number">0</span> <span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">4</span><span class="token punctuation">;</span>   --失败
end


--4.扣减秒杀库存
<span class="token builtin class-name">local</span> status4 <span class="token operator">=</span> subtractSeckillStock<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> status4 <span class="token operator">==</span> <span class="token number">0</span> <span class="token keyword">then</span>
<span class="token builtin class-name">return</span> <span class="token number">0</span><span class="token punctuation">;</span>   --失败
end
<span class="token builtin class-name">return</span> <span class="token number">1</span><span class="token punctuation">;</span>    --成功
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>lua回滚脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>--<span class="token punctuation">[</span><span class="token punctuation">[</span>本脚本主要整合：单品限流、购买的商品数量限制、方法幂等、扣减库存的业务的回滚操作<span class="token punctuation">]</span><span class="token punctuation">]</span>

--<span class="token punctuation">[</span><span class="token punctuation">[</span>
    一. 方法声明
<span class="token punctuation">]</span><span class="token punctuation">]</span>--

--1.单品限流恢复
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> RecoverSeckillLimit<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token builtin class-name">local</span> limitKey <span class="token operator">=</span> ARGV<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">;</span>-- 受限商品key
redis.call<span class="token punctuation">(</span><span class="token string">&#39;INCR&#39;</span>,limitKey<span class="token punctuation">)</span><span class="token punctuation">;</span>
end<span class="token punctuation">;</span>

--2.恢复用户购买数量
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> RecoverUserBuyNum<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token builtin class-name">local</span> userBuyGoodLimitKey <span class="token operator">=</span>  ARGV<span class="token punctuation">[</span><span class="token number">2</span><span class="token punctuation">]</span><span class="token punctuation">;</span> 
<span class="token builtin class-name">local</span> goodNum <span class="token operator">=</span> tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">5</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span> --商品数量
redis.call<span class="token punctuation">(</span><span class="token string">&quot;DECRBY&quot;</span>,userBuyGoodLimitKey,goodNum<span class="token punctuation">)</span><span class="token punctuation">;</span>
end

--3.删除方法幂等存储的记录
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> DelRequestId<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token builtin class-name">local</span> userRequestId <span class="token operator">=</span> ARGV<span class="token punctuation">[</span><span class="token number">3</span><span class="token punctuation">]</span><span class="token punctuation">;</span>  --请求ID
redis.call<span class="token punctuation">(</span><span class="token string">&#39;DEL&#39;</span>,userRequestId<span class="token punctuation">)</span><span class="token punctuation">;</span>
end<span class="token punctuation">;</span>

--4. 恢复订单原库存
<span class="token builtin class-name">local</span> <span class="token keyword">function</span> RecoverOrderStock<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token builtin class-name">local</span> stockKey <span class="token operator">=</span> ARGV<span class="token punctuation">[</span><span class="token number">4</span><span class="token punctuation">]</span><span class="token punctuation">;</span>  --库存中的key
<span class="token builtin class-name">local</span> goodNum <span class="token operator">=</span> tonumber<span class="token punctuation">(</span>ARGV<span class="token punctuation">[</span><span class="token number">5</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span> --商品数量
redis.call<span class="token punctuation">(</span><span class="token string">&quot;INCRBY&quot;</span>,stockKey,goodNum<span class="token punctuation">)</span><span class="token punctuation">;</span>
end<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>详细语法参考菜鸟教程：https://www.runoob.com/lua/lua-tutorial.html</strong></p>`,73),p=[i];function l(c,o){return s(),a("div",null,p)}const d=n(t,[["render",l],["__file","lua.html.vue"]]),m=JSON.parse('{"path":"/code/redis/lua.html","title":"Lua脚本","lang":"zh-CN","frontmatter":{"order":3,"title":"Lua脚本","date":"2022-01-23T00:00:00.000Z","category":["Redis","分布式","Lua"],"tag":["Redis","分布式","Lua"],"timeline":true,"article":true,"description":"Lua脚本是一种轻量级的脚本语言，常嵌入到Redis等数据库中，用于执行复杂的、原子性的操作序列，通过一次性执行多个命令来减少网络开销并避免并发问题，增强数据处理的安全性和效率。 简介 ​ 从 Redis 2.6.0 版本开始，通过内置的 Lua 解释器，可以使用 EVAL 命令对 Lua 脚本进行求值。在lua脚本中可以通过两个不同的函数调用redi...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/redis/lua.html"}],["meta",{"property":"og:title","content":"Lua脚本"}],["meta",{"property":"og:description","content":"Lua脚本是一种轻量级的脚本语言，常嵌入到Redis等数据库中，用于执行复杂的、原子性的操作序列，通过一次性执行多个命令来减少网络开销并避免并发问题，增强数据处理的安全性和效率。 简介 ​ 从 Redis 2.6.0 版本开始，通过内置的 Lua 解释器，可以使用 EVAL 命令对 Lua 脚本进行求值。在lua脚本中可以通过两个不同的函数调用redi..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191810070.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-13T03:35:17.000Z"}],["meta",{"property":"article:author","content":"mozzie"}],["meta",{"property":"article:tag","content":"Redis"}],["meta",{"property":"article:tag","content":"分布式"}],["meta",{"property":"article:tag","content":"Lua"}],["meta",{"property":"article:published_time","content":"2022-01-23T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-06-13T03:35:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Lua脚本\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191810070.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191844731.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817191957370.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193310960.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193550152.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193711610.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193744846.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193812953.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193856467.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817193950697.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194024905.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194337397.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194608588.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20220817194621057.png\\"],\\"datePublished\\":\\"2022-01-23T00:00:00.000Z\\",\\"dateModified\\":\\"2024-06-13T03:35:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"mozzie\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"简介","slug":"简介","link":"#简介","children":[{"level":3,"title":"脚本的原子性","slug":"脚本的原子性","link":"#脚本的原子性","children":[]},{"level":3,"title":"错误处理","slug":"错误处理","link":"#错误处理","children":[]},{"level":3,"title":"带宽和EVALSHA","slug":"带宽和evalsha","link":"#带宽和evalsha","children":[]},{"level":3,"title":"脚本缓存","slug":"脚本缓存","link":"#脚本缓存","children":[]},{"level":3,"title":"全局变量保护","slug":"全局变量保护","link":"#全局变量保护","children":[]}]},{"level":2,"title":"脚本指令","slug":"脚本指令","link":"#脚本指令","children":[{"level":3,"title":"eval","slug":"eval","link":"#eval","children":[]},{"level":3,"title":"evalsha","slug":"evalsha","link":"#evalsha","children":[]},{"level":3,"title":"script load","slug":"script-load","link":"#script-load","children":[]},{"level":3,"title":"script exists","slug":"script-exists","link":"#script-exists","children":[]},{"level":3,"title":"script kill","slug":"script-kill","link":"#script-kill","children":[]},{"level":3,"title":"script flush","slug":"script-flush","link":"#script-flush","children":[]}]},{"level":2,"title":"Lua语法","slug":"lua语法","link":"#lua语法","children":[{"level":3,"title":"介绍","slug":"介绍","link":"#介绍","children":[]},{"level":3,"title":"好处","slug":"好处","link":"#好处","children":[]},{"level":3,"title":"基本语法","slug":"基本语法","link":"#基本语法","children":[]}]}],"git":{"createdTime":1717727796000,"updatedTime":1718249717000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":2}]},"readingTime":{"minutes":12.97,"words":3890},"filePathRelative":"code/redis/lua.md","localizedDate":"2022年1月23日","excerpt":"<p>Lua脚本是一种轻量级的脚本语言，常嵌入到Redis等数据库中，用于执行复杂的、原子性的操作序列，通过一次性执行多个命令来减少网络开销并避免并发问题，增强数据处理的安全性和效率。</p>","autoDesc":true}');export{d as comp,m as data};