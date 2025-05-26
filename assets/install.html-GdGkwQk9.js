import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as e,c as s,h as a}from"./app-BgVhLFk7.js";const t={},i=a(`<p>Docker安装MySQL笔记</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 创建挂载文件夹</span>
<span class="token function">mkdir</span> <span class="token parameter variable">-p</span> /export/server/mysql/conf /export/server/mysql/data /export/server/mysql/logs

<span class="token comment"># 拉取镜像</span>
<span class="token function">docker</span> pull mysql:8.0.29

<span class="token comment"># 修改配置</span>
<span class="token function">vim</span> /export/server/mysql/conf/my.cnf

<span class="token punctuation">[</span>client<span class="token punctuation">]</span>
default-character-set<span class="token operator">=</span>utf8

<span class="token punctuation">[</span>mysql<span class="token punctuation">]</span>
default-character-set<span class="token operator">=</span>utf8

<span class="token punctuation">[</span>mysqld<span class="token punctuation">]</span>
<span class="token assign-left variable">init_connect</span><span class="token operator">=</span><span class="token string">&#39;SET collation_connection = utf8_unicode_ci&#39;</span>
<span class="token assign-left variable">init_connect</span><span class="token operator">=</span><span class="token string">&#39;SET NAMES utf8&#39;</span> 
character-set-server<span class="token operator">=</span>utf8
collation-server<span class="token operator">=</span>utf8_unicode_ci
skip-character-set-client-handshake
skip-name-resolve

<span class="token comment"># 启动容器</span>
<span class="token function">docker</span> run <span class="token parameter variable">--restart</span><span class="token operator">=</span>always <span class="token parameter variable">--privileged</span><span class="token operator">=</span>true <span class="token parameter variable">-d</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">-p</span> <span class="token number">3302</span>:3306 <span class="token parameter variable">--name</span> mysql-master <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> /export/server/mysql/logs:/var/log/mysql <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> /export/server/mysql/data:/var/lib/mysql <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> /export/server/mysql/conf:/etc/mysql <span class="token punctuation">\\</span>
-v/export/server/mysql/conf/my.cnf:/etc/mysql/my.cnf <span class="token punctuation">\\</span>
<span class="token parameter variable">-e</span> <span class="token assign-left variable">MYSQL_ROOT_PASSWORD</span><span class="token operator">=</span>dyj0129<span class="token punctuation">..</span> <span class="token punctuation">\\</span>
mysql:8.0.29

<span class="token comment">#  参数说明：</span>
<span class="token comment">#  --restart=always： 当Docker 重启时，容器会自动启动。</span>
<span class="token comment">#  --privileged=true：容器内的root拥有真正root权限，否则容器内root只是外部普通用户权限</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果是云服务器需要开放端口</p>`,3),l=[i];function r(o,c){return e(),s("div",null,l)}const m=n(t,[["render",r],["__file","install.html.vue"]]),v=JSON.parse('{"path":"/code/mysql/install.html","title":"Docker安装MySQL","lang":"zh-CN","frontmatter":{"order":1,"title":"Docker安装MySQL","date":"2021-08-01T00:00:00.000Z","category":"MySQL","tag":"MySQL","timeline":true,"article":true,"prev":"./","description":"Docker安装MySQL笔记 如果是云服务器需要开放端口","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/mysql/install.html"}],["meta",{"property":"og:title","content":"Docker安装MySQL"}],["meta",{"property":"og:description","content":"Docker安装MySQL笔记 如果是云服务器需要开放端口"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-07T02:36:36.000Z"}],["meta",{"property":"article:author","content":"mozzie"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2021-08-01T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-06-07T02:36:36.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Docker安装MySQL\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-08-01T00:00:00.000Z\\",\\"dateModified\\":\\"2024-06-07T02:36:36.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"mozzie\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[],"git":{"createdTime":1717143455000,"updatedTime":1717727796000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":4}]},"readingTime":{"minutes":0.61,"words":182},"filePathRelative":"code/mysql/install.md","localizedDate":"2021年8月1日","excerpt":"<p>Docker安装MySQL笔记</p>","autoDesc":true}');export{m as comp,v as data};
