import{_ as r}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as i,o as n,c as s,b as e,d as t,e as o,h as c}from"./app-DBHwYa0s.js";const p="/assets/image-20210513125707472-B0jg5weF.png",l="/assets/image-20210419215326952-DGZtPE9r.png",u={},d=c('<h1 id="栈和队列" tabindex="-1"><a class="header-anchor" href="#栈和队列"><span>栈和队列</span></a></h1><figure><img src="'+p+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>push：插入</p><p>pop：删除</p><p>peek：查看顶部</p><h2 id="栈-stack" tabindex="-1"><a class="header-anchor" href="#栈-stack"><span>栈(stack)</span></a></h2><p>==栈是限定仅在表尾进行插入和删除的线性表==</p><p>允许插入和删除的一端称为栈顶，另一端称为栈底，不含任何数据元素的栈称为空栈。</p><p>后进先出LIFO</p><blockquote><p>栈的插入操作，叫作进栈，也称压栈、入栈。</p><p>栈的删除操作，叫作出栈，有的也叫作弹栈。</p></blockquote><figure><img src="'+l+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p><strong>逆波兰，使用栈结构来帮助计算机处理数学加减乘除计算问题</strong></p><p>​ 把生活中数学中缀表示法改成后缀表示法</p><p>​ 逆波兰记法中，操作符置于操作数的后面。例如表达“三加四”时，写作“3 4 + ”，而不是“3 + 4”。如果有多个操作符，操作符置于第二个操作数的后面，所以常规中缀记法的“3 - 4 + 5”在逆波兰记法中写作“3 4 - 5 + ”：先3减去4，再加上5。使用逆波兰记法的一个好处是不需要使用括号。例如中缀记法中“3 - 4 * 5”与“（3 - 4）*5”不相同，但后缀记法中前者写做“3 4 5 * - ”，无歧义地表示“3 (4 5 *) -”；后者写做“3 4 - 5 * ”。</p>',14),h={href:"https://zh.wikipedia.org/wiki/%E8%A7%A3%E9%87%8A%E5%99%A8",target:"_blank",rel:"noopener noreferrer"},m={href:"https://zh.wikipedia.org/wiki/%E5%A0%86%E6%A0%88",target:"_blank",rel:"noopener noreferrer"},g=e("h2",{id:"队列-queue",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#队列-queue"},[e("span",null,"队列(Queue)")])],-1),_=e("p",null,"==队列是只允许在一端进行插入操作、而在另一端进行删除操作的线性表==",-1),k=e("p",null,"先进先出FIFO",-1),f=e("blockquote",null,[e("p",null,"循环队列、双端队列Deque")],-1),b=e("p",null,"支持两端元素插入和移除的线性集合，头尾相接的顺序存储结构，插入删除不需要申请和释放节点，扩充空间较为麻烦",-1),y=e("blockquote",null,[e("p",null,"链队列")],-1),x=e("p",null,"使用链式结构存储元素，有指针，插入删除需要申请和释放节点，扩充空间较为简便",-1);function q(z,T){const a=i("ExternalLinkIcon");return n(),s("div",null,[d,e("p",null,[t("逆波兰表达式的"),e("a",h,[t("解释器"),o(a)]),t("一般是基于"),e("a",m,[t("堆栈"),o(a)]),t("的。解释过程一般是：操作数入栈；遇到操作符时，操作数出栈，求值，将结果入栈；当一遍后，栈顶就是表达式的值。因此逆波兰表达式的求值使用堆栈结构很容易实现，并且能很快求值。")]),g,_,k,f,b,y,x])}const N=r(u,[["render",q],["__file","stackQueue.html.vue"]]),Q=JSON.parse('{"path":"/code/data-structure-and-algorithms/data-structure/stackQueue.html","title":"栈和队列","lang":"zh-CN","frontmatter":{"order":2,"title":"栈和队列","date":"2020-12-27T00:00:00.000Z","category":"数据结构与算法","timeline":true,"article":true,"description":"栈和队列 push：插入 pop：删除 peek：查看顶部 栈(stack) ==栈是限定仅在表尾进行插入和删除的线性表== 允许插入和删除的一端称为栈顶，另一端称为栈底，不含任何数据元素的栈称为空栈。 后进先出LIFO 栈的插入操作，叫作进栈，也称压栈、入栈。 栈的删除操作，叫作出栈，有的也叫作弹栈。 逆波兰，使用栈结构来帮助计算机处理数学加减乘除计...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/data-structure-and-algorithms/data-structure/stackQueue.html"}],["meta",{"property":"og:title","content":"栈和队列"}],["meta",{"property":"og:description","content":"栈和队列 push：插入 pop：删除 peek：查看顶部 栈(stack) ==栈是限定仅在表尾进行插入和删除的线性表== 允许插入和删除的一端称为栈顶，另一端称为栈底，不含任何数据元素的栈称为空栈。 后进先出LIFO 栈的插入操作，叫作进栈，也称压栈、入栈。 栈的删除操作，叫作出栈，有的也叫作弹栈。 逆波兰，使用栈结构来帮助计算机处理数学加减乘除计..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-05-08T06:42:11.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:published_time","content":"2020-12-27T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-05-08T06:42:11.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"栈和队列\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2020-12-27T00:00:00.000Z\\",\\"dateModified\\":\\"2024-05-08T06:42:11.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"栈(stack)","slug":"栈-stack","link":"#栈-stack","children":[]},{"level":2,"title":"队列(Queue)","slug":"队列-queue","link":"#队列-queue","children":[]}],"git":{"createdTime":1715140098000,"updatedTime":1715150531000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":2}]},"readingTime":{"minutes":1.89,"words":567},"filePathRelative":"code/data-structure-and-algorithms/data-structure/stackQueue.md","localizedDate":"2020年12月27日","excerpt":"\\n<figure><figcaption></figcaption></figure>","autoDesc":true}');export{N as comp,Q as data};