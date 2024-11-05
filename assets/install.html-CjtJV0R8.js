import{_ as i}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as l,o as c,c as o,b as s,d as a,e,h as t}from"./app-Bu82Y_9f.js";const p={},r=s("p",null,"本文基于 Elasticsearch 7.9.3 的安装教程",-1),d=s("h2",{id:"二进制离线安装",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#二进制离线安装"},[s("span",null,"二进制离线安装")])],-1),u={href:"https://www.elastic.co/cn/downloads/past-releases#elasticsearch",target:"_blank",rel:"noopener noreferrer"},m={href:"https://blog.51cto.com/mfc001/6565303",target:"_blank",rel:"noopener noreferrer"},v={href:"https://www.51cto.com/article/701727.html",target:"_blank",rel:"noopener noreferrer"},b=t(`<p>下面是我用到的一些配置</p><div class="language-properties line-numbers-mode" data-ext="properties" data-title="properties"><pre class="language-properties"><code><span class="token comment"># 集群名称，集群中的各节点此名称必须一致</span>
<span class="token key attr-name">cluster.name</span><span class="token punctuation">:</span> <span class="token value attr-value">es</span>
<span class="token comment"># 节点名称，集群中的各节点名称不重复，另一个节点设置为 node-2</span>
<span class="token key attr-name">node.name</span><span class="token punctuation">:</span> <span class="token value attr-value">node-1</span>
<span class="token comment"># 数据文件路径</span>
<span class="token key attr-name">path.data</span><span class="token punctuation">:</span> <span class="token value attr-value">/data/tools/elasticsearch-7.9.3/data</span>
<span class="token comment"># 日志文件路径</span>
<span class="token key attr-name">path.logs</span><span class="token punctuation">:</span> <span class="token value attr-value">/data/tools/elasticsearch-7.9.3/logs</span>
<span class="token comment"># 本机服务器 IP</span>
<span class="token key attr-name">network.host</span><span class="token punctuation">:</span> <span class="token value attr-value">192.168.168.1</span>
<span class="token key attr-name">network.bind_host</span><span class="token punctuation">:</span> <span class="token value attr-value">0.0.0.0</span>
<span class="token comment"># elasticsearch 访问端口</span>
<span class="token key attr-name">http.port</span><span class="token punctuation">:</span> <span class="token value attr-value">19200</span>
<span class="token comment"># 集群通信端口</span>
<span class="token key attr-name">transport.tcp.port</span><span class="token punctuation">:</span> <span class="token value attr-value">19300</span>
<span class="token comment"># 集群中的主机列表 通讯端口 19300</span>
<span class="token key attr-name">discovery.seed_hosts</span><span class="token punctuation">:</span> <span class="token value attr-value">[&quot;192.168.168.1:19300&quot;,&quot;192.168.168.2:19300&quot;,&quot;192.168.168.1:19300&quot;]</span>
<span class="token comment"># 设置主节点，这里设置 node-2 为主节点</span>
<span class="token key attr-name">cluster.initial_master_nodes</span><span class="token punctuation">:</span> <span class="token value attr-value">[&quot;node-2&quot;]</span>
<span class="token comment"># 配置以允许多个节点共享相同的数据目录，最大数量，默认为1</span>
<span class="token key attr-name">node.max_local_storage_nodes</span><span class="token punctuation">:</span> <span class="token value attr-value">2</span>

<span class="token comment"># 启用集群密码验证模块x-pack</span>
<span class="token key attr-name">xpack.security.enabled</span><span class="token punctuation">:</span> <span class="token value attr-value">true</span>
<span class="token key attr-name">xpack.license.self_generated.type</span><span class="token punctuation">:</span> <span class="token value attr-value">basic</span>
<span class="token key attr-name">xpack.security.transport.ssl.enabled</span><span class="token punctuation">:</span> <span class="token value attr-value">true</span>
<span class="token key attr-name">xpack.security.transport.ssl.verification_mode</span><span class="token punctuation">:</span> <span class="token value attr-value">certificate</span>
<span class="token comment"># 证书存放的位置</span>
<span class="token key attr-name">xpack.security.transport.ssl.keystore.path</span><span class="token punctuation">:</span> <span class="token value attr-value">/data/tools/elasticsearch-7.9.3/config/elastic-certificates.p12</span>
<span class="token key attr-name">xpack.security.transport.ssl.truststore.path</span><span class="token punctuation">:</span> <span class="token value attr-value">/data/tools/elasticsearch-7.9.3/config/elastic-certificates.p12</span>

<span class="token comment"># 跨域访问，不添加无法使用head连接es，连接时在http:ip:port/?auth_user=elastic&amp;auth_password=密码</span>
<span class="token key attr-name">http.cors.enabled</span><span class="token punctuation">:</span> <span class="token value attr-value">true</span>
<span class="token key attr-name">http.cors.allow-origin</span><span class="token punctuation">:</span> <span class="token value attr-value">&quot;*&quot;</span>
<span class="token key attr-name">http.cors.allow-headers</span><span class="token punctuation">:</span> <span class="token value attr-value">Authorization,X-Requested-With,Content-Length,Content-Type</span>

<span class="token comment"># 禁止 swap，一旦允许内存与磁盘的交换，会引起致命的性能问题</span>
<span class="token key attr-name">bootstrap.memory_lock</span><span class="token punctuation">:</span> <span class="token value attr-value">true</span>
<span class="token comment"># 进制swap需要修改linux配置/etc/security/limits.conf文件</span>
<span class="token comment"># es启动用户名 soft memlock unlimited</span>
<span class="token comment"># es启动用户名 hard memlock unlimited</span>

<span class="token comment"># 禁止自动创建索引</span>
<span class="token key attr-name">action.auto_create_index</span><span class="token punctuation">:</span> <span class="token value attr-value">false</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>默认安装的是一主分片、一副本分片</p><h3 id="开启集群密码验证" tabindex="-1"><a class="header-anchor" href="#开启集群密码验证"><span>开启集群密码验证</span></a></h3><ol><li><p>切换到elastsearch的目录下，使用下列命令生成证书，需要分发证书到其他机器</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>./elasticsearch-certutil cert <span class="token parameter variable">-out</span> <span class="token punctuation">..</span>/config/elastic-certificates.p12 <span class="token parameter variable">-pass</span> <span class="token string">&quot;&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>在es启动状态下，设置用户密码，交互式设置密码</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>./elasticsearch-setup-passwords interactive
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ol><h3 id="常见启动报错" tabindex="-1"><a class="header-anchor" href="#常见启动报错"><span>常见启动报错</span></a></h3><ol><li><p>不能使用root用户启动</p></li><li><p>文件描述符限制</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696923009409-f2d0a809-432c-4be3-9538-ce7426685e4d.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>打开 shell 终端，以 root 或具有足够权限的用户身份登录。

打开 /etc/security/limits.conf 文件，这是限制系统资源的配置文件。您可以使用文本编辑器来编辑它，比如使用 <span class="token function">nano</span> 或 vim：

<span class="token function">sudo</span> <span class="token function">vim</span> /etc/security/limits.conf
在文件的末尾添加以下行，将文件描述符的限制增加到所需的数量（65535）：

*    hard    nofile    <span class="token number">65535</span>
*    soft    nofile    <span class="token number">65535</span>
这些行会将硬限制（hard limit）和软限制（soft limit）都设置为65535，确保 Elasticsearch 进程可以获得足够的文件描述符。

保存并关闭文件。

接下来，打开 /etc/sysctl.conf 文件来配置操作系统的参数。使用以下命令打开它：

<span class="token function">sudo</span> <span class="token function">vim</span> /etc/sysctl.conf
在文件末尾添加以下行，以增加操作系统的文件描述符限制：

fs.file-max<span class="token operator">=</span><span class="token number">65535</span>
保存并关闭文件。

最后，重新加载 <span class="token function">sysctl</span> 配置，以使更改生效：
<span class="token function">sudo</span> <span class="token function">sysctl</span> <span class="token parameter variable">-p</span>

<span class="token comment"># 修改最大文件打开数，和最大进程数</span>
<span class="token function">sudo</span> <span class="token function">vim</span> /etc/security/limits.d/20-nproc.conf
<span class="token comment"># 修改资源限制为无限制</span>
root soft nproc unlimited
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>虚拟内存限制</p><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713753909417-540d8d86-3237-44a0-8af0-d041a9692050.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">sudo</span> <span class="token function">sysctl</span> <span class="token parameter variable">-w</span> <span class="token assign-left variable">vm.max_map_count</span><span class="token operator">=</span><span class="token number">262144</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>**注意：**使用ulimit -Hn查看一下实际文件描述符限制，发现为4096，说明当前继承的是sshd的文件描述符限制，需要修改RLIMIT_NOFILE 修改为 65536</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 目前没搞懂</span>
<span class="token comment"># 切换成root用户 修改这个, 但是之前设置过了</span>
<span class="token function">sudo</span> <span class="token builtin class-name">echo</span> <span class="token string">&#39;vm.max_map_count=655360&#39;</span> <span class="token operator">&gt;&gt;</span> /etc/sysctl.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ol><h3 id="脚本" tabindex="-1"><a class="header-anchor" href="#脚本"><span>脚本</span></a></h3><p>启动脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>bin/elasticsearch <span class="token parameter variable">-d</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>停止脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
  
<span class="token comment"># 定义Elasticsearch进程名，可以根据实际安装情况调整</span>
<span class="token assign-left variable">ELASTICSEARCH_PROC_NAME</span><span class="token operator">=</span><span class="token string">&quot;Elasticsearch&quot;</span>

<span class="token comment"># 查找与Elasticsearch进程名匹配的进程ID</span>
<span class="token assign-left variable">ELASTICSEARCH_PID</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token parameter variable">-v</span> <span class="token function">grep</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;<span class="token variable">$ELASTICSEARCH_PROC_NAME</span>&quot;</span> <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span><span class="token variable">)</span></span>

<span class="token keyword">if</span> <span class="token punctuation">[</span><span class="token punctuation">[</span> <span class="token parameter variable">-z</span> <span class="token string">&quot;<span class="token variable">$ELASTICSEARCH_PID</span>&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Elasticsearch 进程未运行。&quot;</span>
<span class="token keyword">else</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;正在停止 Elasticsearch (PID: <span class="token variable">$ELASTICSEARCH_PID</span>)…&quot;</span>

    <span class="token comment"># 发送TERM信号以优雅关闭Elasticsearch</span>
    <span class="token function">kill</span> <span class="token parameter variable">-s</span> <span class="token environment constant">TERM</span> <span class="token string">&quot;<span class="token variable">$ELASTICSEARCH_PID</span>&quot;</span>

    <span class="token comment"># 等待一段时间以允许进程优雅退出</span>
    <span class="token function">sleep</span> <span class="token number">5</span>

    <span class="token comment"># 检查是否已经停止</span>
    <span class="token keyword">if</span> <span class="token function">ps</span> <span class="token parameter variable">-p</span> <span class="token string">&quot;<span class="token variable">$ELASTICSEARCH_PID</span>&quot;</span> <span class="token operator">&gt;</span> /dev/null<span class="token punctuation">;</span> <span class="token keyword">then</span>
        <span class="token builtin class-name">echo</span> <span class="token string">&quot;Elasticsearch 在给定时间内未能正常停止。发送 KILL 信号…&quot;</span>

        <span class="token comment"># 如果进程仍未停止，发送KILL信号强制终止</span>
        <span class="token function">kill</span> <span class="token parameter variable">-s</span> KILL <span class="token string">&quot;<span class="token variable">$ELASTICSEARCH_PID</span>&quot;</span>
        <span class="token function">sleep</span> <span class="token number">2</span>

        <span class="token keyword">if</span> <span class="token function">ps</span> <span class="token parameter variable">-p</span> <span class="token string">&quot;<span class="token variable">$ELASTICSEARCH_PID</span>&quot;</span> <span class="token operator">&gt;</span> /dev/null<span class="token punctuation">;</span> <span class="token keyword">then</span>
            <span class="token builtin class-name">echo</span> <span class="token string">&quot;错误：无法停止 Elasticsearch (PID: <span class="token variable">$ELASTICSEARCH_PID</span>)。请查看日志获取更多信息。&quot;</span>
            <span class="token builtin class-name">exit</span> <span class="token number">1</span>
        <span class="token keyword">fi</span>
    <span class="token keyword">fi</span>

    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Elasticsearch 已成功停止。&quot;</span>                                                   
<span class="token keyword">fi</span>                                                                                      
                                                                                        
<span class="token builtin class-name">exit</span> <span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="kibana安装" tabindex="-1"><a class="header-anchor" href="#kibana安装"><span>Kibana安装</span></a></h2>`,13),k={href:"https://www.elastic.co/cn/downloads/past-releases#kibana",target:"_blank",rel:"noopener noreferrer"},h=t(`<p>配置</p><div class="language-properties line-numbers-mode" data-ext="properties" data-title="properties"><pre class="language-properties"><code><span class="token comment"># Kibana is served by a back end server. This setting specifies the port to use.</span>
<span class="token key attr-name">server.port</span><span class="token punctuation">:</span> <span class="token value attr-value">15601</span>

<span class="token comment"># Specifies the address to which the Kibana server will bind. IP addresses and host names are both valid values.</span>
<span class="token comment"># The default is &#39;localhost&#39;, which usually means remote machines will not be able to connect.</span>
<span class="token comment"># To allow connections from remote users, set this parameter to a non-loopback address.</span>
<span class="token key attr-name">server.host</span><span class="token punctuation">:</span> <span class="token value attr-value">&quot;localhost&quot;</span>

<span class="token comment"># Enables you to specify a path to mount Kibana at if you are running behind a proxy.</span>
<span class="token comment"># Use the \`server.rewriteBasePath\` setting to tell Kibana if it should remove the basePath</span>
<span class="token comment"># from requests it receives, and to prevent a deprecation warning at startup.</span>
<span class="token comment"># This setting cannot end in a slash.</span>
<span class="token comment">#server.basePath: &quot;&quot;</span>

<span class="token comment"># Specifies whether Kibana should rewrite requests that are prefixed with</span>
<span class="token comment"># \`server.basePath\` or require that they are rewritten by your reverse proxy.</span>
<span class="token comment"># This setting was effectively always \`false\` before Kibana 6.3 and will</span>
<span class="token comment"># default to \`true\` starting in Kibana 7.0.</span>
<span class="token comment">#server.rewriteBasePath: false</span>

<span class="token comment"># The maximum payload size in bytes for incoming server requests.</span>
<span class="token comment">#server.maxPayloadBytes: 1048576</span>

<span class="token comment"># The Kibana server&#39;s name.  This is used for display purposes.</span>
<span class="token comment">#server.name: &quot;your-hostname&quot;</span>

<span class="token comment"># The URLs of the Elasticsearch instances to use for all your queries.</span>
<span class="token key attr-name">elasticsearch.hosts</span><span class="token punctuation">:</span> <span class="token value attr-value">[&quot;http://192.168.168.1:19200&quot;,&quot;http://192.168.168.2:19200&quot;,&quot;http://192.168.168.3:19200&quot;]</span>

<span class="token comment"># When this setting&#39;s value is true Kibana uses the hostname specified in the server.host</span>
<span class="token comment"># setting. When the value of this setting is false, Kibana uses the hostname of the host</span>
<span class="token comment"># that connects to this Kibana instance.</span>
<span class="token comment">#elasticsearch.preserveHost: true</span>

<span class="token comment"># Kibana uses an index in Elasticsearch to store saved searches, visualizations and</span>
<span class="token comment"># dashboards. Kibana creates a new index if the index doesn&#39;t already exist.</span>
<span class="token key attr-name">kibana.index</span><span class="token punctuation">:</span> <span class="token value attr-value">&quot;.kibana&quot;</span>

<span class="token comment"># The default application to load.</span>
<span class="token comment">#kibana.defaultAppId: &quot;home&quot;</span>

<span class="token comment"># If your Elasticsearch is protected with basic authentication, these settings provide</span>
<span class="token comment"># the username and password that the Kibana server uses to perform maintenance on the Kibana</span>
<span class="token comment"># index at startup. Your Kibana users still need to authenticate with Elasticsearch, which</span>
<span class="token comment"># is proxied through the Kibana server.</span>
<span class="token key attr-name">elasticsearch.username</span><span class="token punctuation">:</span> <span class="token value attr-value">&quot;elastic&quot;</span>
<span class="token key attr-name">elasticsearch.password</span><span class="token punctuation">:</span> <span class="token value attr-value">&quot;123456&quot;</span>

<span class="token comment"># Enables SSL and paths to the PEM-format SSL certificate and SSL key files, respectively.</span>
<span class="token comment"># These settings enable SSL for outgoing requests from the Kibana server to the browser.</span>
<span class="token comment">#server.ssl.enabled: false</span>
<span class="token comment">#server.ssl.certificate: /path/to/your/server.crt</span>
<span class="token comment">#server.ssl.key: /path/to/your/server.key</span>

<span class="token comment"># Optional settings that provide the paths to the PEM-format SSL certificate and key files.</span>
<span class="token comment"># These files are used to verify the identity of Kibana to Elasticsearch and are required when</span>
<span class="token comment"># xpack.security.http.ssl.client_authentication in Elasticsearch is set to required.</span>
<span class="token comment">#elasticsearch.ssl.certificate: /path/to/your/client.crt</span>
<span class="token comment">#elasticsearch.ssl.key: /path/to/your/client.key</span>

<span class="token comment"># Optional setting that enables you to specify a path to the PEM file for the certificate</span>
<span class="token comment"># authority for your Elasticsearch instance.</span>
<span class="token comment">#elasticsearch.ssl.certificateAuthorities: [ &quot;/path/to/your/CA.pem&quot; ]</span>

<span class="token comment"># To disregard the validity of SSL certificates, change this setting&#39;s value to &#39;none&#39;.</span>
<span class="token comment">#elasticsearch.ssl.verificationMode: full</span>

<span class="token comment"># Time in milliseconds to wait for Elasticsearch to respond to pings. Defaults to the value of</span>
<span class="token comment"># the elasticsearch.requestTimeout setting.</span>
<span class="token comment">#elasticsearch.pingTimeout: 1500</span>

<span class="token comment"># Time in milliseconds to wait for responses from the back end or Elasticsearch. This value</span>
<span class="token comment"># must be a positive integer.</span>
<span class="token comment">#elasticsearch.requestTimeout: 30000</span>

<span class="token comment"># List of Kibana client-side headers to send to Elasticsearch. To send *no* client-side</span>
<span class="token comment"># headers, set this value to [] (an empty list).</span>
<span class="token comment">#elasticsearch.requestHeadersWhitelist: [ authorization ]</span>

<span class="token comment"># Header names and values that are sent to Elasticsearch. Any custom headers cannot be overwritten</span>
<span class="token comment"># by client-side headers, regardless of the elasticsearch.requestHeadersWhitelist configuration.</span>
<span class="token comment">#elasticsearch.customHeaders: {}</span>

<span class="token comment"># Time in milliseconds for Elasticsearch to wait for responses from shards. Set to 0 to disable.</span>
<span class="token comment">#elasticsearch.shardTimeout: 30000</span>

<span class="token comment"># Time in milliseconds to wait for Elasticsearch at Kibana startup before retrying.</span>
<span class="token comment">#elasticsearch.startupTimeout: 5000</span>

<span class="token comment"># Logs queries sent to Elasticsearch. Requires logging.verbose set to true.</span>
<span class="token comment">#elasticsearch.logQueries: false</span>

<span class="token comment"># Specifies the path where Kibana creates the process ID file.</span>
<span class="token key attr-name">pid.file</span><span class="token punctuation">:</span> <span class="token value attr-value">/data/tools/es/kibana-7.9.3-linux-x86_64/kibana.pid</span>

<span class="token comment"># Enables you to specify a file where Kibana stores log output.</span>
<span class="token comment">#logging.dest: stdout</span>

<span class="token comment"># Set the value of this setting to true to suppress all logging output.</span>
<span class="token comment">#logging.silent: false</span>

<span class="token comment"># Set the value of this setting to true to suppress all logging output other than error messages.</span>
<span class="token comment">#logging.quiet: false</span>

<span class="token comment"># Set the value of this setting to true to log all events, including system usage information</span>
<span class="token comment"># and all requests.</span>
<span class="token comment">#logging.verbose: false</span>

<span class="token comment"># Set the interval in milliseconds to sample system and process performance</span>
<span class="token comment"># metrics. Minimum is 100ms. Defaults to 5000.</span>
<span class="token comment">#ops.interval: 5000</span>

<span class="token comment"># Specifies locale to be used for all localizable strings, dates and number formats.</span>
<span class="token comment"># Supported languages are the following: English - en , by default , Chinese - zh-CN .</span>
<span class="token key attr-name">i18n.locale</span><span class="token punctuation">:</span> <span class="token value attr-value">&quot;zh-CN&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>启动脚本：需要先在kibana目录下创建一个logs文件夹，脚本放在kibana目录下</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token assign-left variable">basepath</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token builtin class-name">cd</span> \`dirname $0\`<span class="token punctuation">;</span> <span class="token builtin class-name">pwd</span><span class="token variable">)</span></span>
<span class="token function">nohup</span> <span class="token variable">$basepath</span>/bin/kibana <span class="token operator">&gt;</span> <span class="token variable">$basepath</span>/logs/start.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span> <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>停止脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 在配置文件中配置了kibana的pid，要停止直接杀死对应的pid就行了</span>
<span class="token function">kill</span> <span class="token parameter variable">-9</span> <span class="token variable"><span class="token variable">\`</span><span class="token function">cat</span> kibana.pid<span class="token variable">\`</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="kibana插件" tabindex="-1"><a class="header-anchor" href="#kibana插件"><span>kibana插件</span></a></h3><p>插件基本上安装都是同一个流程</p><p>以metricbeat插件为例</p><ol><li><p>下载插件，如果服务器不能联网，可以选择手动下载并上传</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">-L</span> <span class="token parameter variable">-O</span> https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-7.9.3-linux-x86_64.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>解压插件</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">tar</span> xzvf metricbeat-7.9.3-linux-x86_64.tar.gz
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>修改配置，进入插件目录<code>cd metricbeat-7.9.3-linux-x86_64</code></p><p>metricbeat.yml（插件名称.yml）</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>output.elasticsearch:
  hosts: <span class="token punctuation">[</span><span class="token string">&quot;&lt;es_url&gt;&quot;</span><span class="token punctuation">]</span>
  username: <span class="token string">&quot;elastic&quot;</span>
  password: <span class="token string">&quot;&lt;password&gt;&quot;</span>
setup.kibana:
  host: <span class="token string">&quot;&lt;kibana_url&gt;&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>启用模块<code>./metricbeat modules enable system</code></p></li><li><p>初始化插件<code>./metricbeat setup</code></p></li><li><p>启动插件<code>./metricbeat -e</code></p></li></ol><p>启动脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 根据实际修改为插件名称</span>
<span class="token assign-left variable">basepath</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token builtin class-name">cd</span> \`dirname $0\`<span class="token punctuation">;</span> <span class="token builtin class-name">pwd</span><span class="token variable">)</span></span>
<span class="token function">nohup</span> <span class="token variable">$basepath</span>/metricbeat <span class="token parameter variable">-e</span> <span class="token operator">&gt;</span> <span class="token variable">$basepath</span>/logs/start.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span> <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>停止脚本</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token assign-left variable">PROCESS_NAME</span><span class="token operator">=</span><span class="token string">&#39;heartbeat&#39;</span>
<span class="token assign-left variable">PROCESS_PIDS</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token parameter variable">-v</span> <span class="token function">grep</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;<span class="token variable">$PROCESS_NAME</span>&quot;</span> <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span><span class="token variable">)</span></span>

<span class="token keyword">for</span> <span class="token for-or-select variable">PID</span> <span class="token keyword">in</span> <span class="token variable">$PROCESS_PIDS</span><span class="token punctuation">;</span> <span class="token keyword">do</span>
    <span class="token function">kill</span> <span class="token string">&quot;<span class="token variable">$PID</span>&quot;</span>
<span class="token keyword">done</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>插件安装的基本流程如上，个别插件略有差异，具体以kibana提供的文档为准</p>`,15);function g(f,y){const n=l("ExternalLinkIcon");return c(),o("div",null,[r,d,s("p",null,[s("a",u,[a("下载地址"),e(n)])]),s("p",null,[s("a",m,[a("教程1"),e(n)])]),s("p",null,[s("a",v,[a("教程2"),e(n)])]),b,s("p",null,[s("a",k,[a("安装包"),e(n)])]),h])}const w=i(p,[["render",g],["__file","install.html.vue"]]),E=JSON.parse('{"path":"/code/distributed/elasticsearch/install.html","title":"安装Elasticsearch","lang":"zh-CN","frontmatter":{"order":1,"title":"安装Elasticsearch","date":"2022-03-15T00:00:00.000Z","category":["ElasticSearch","分布式","搜索引擎"],"tag":["ElasticSearch","分布式","搜索引擎"],"timeline":true,"article":true,"prev":"./","description":"本文基于 Elasticsearch 7.9.3 的安装教程 二进制离线安装 下载地址 教程1 教程2 下面是我用到的一些配置 默认安装的是一主分片、一副本分片 开启集群密码验证 切换到elastsearch的目录下，使用下列命令生成证书，需要分发证书到其他机器 在es启动状态下，设置用户密码，交互式设置密码 常见启动报错 不能使用root用户启动 文...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/distributed/elasticsearch/install.html"}],["meta",{"property":"og:title","content":"安装Elasticsearch"}],["meta",{"property":"og:description","content":"本文基于 Elasticsearch 7.9.3 的安装教程 二进制离线安装 下载地址 教程1 教程2 下面是我用到的一些配置 默认安装的是一主分片、一副本分片 开启集群密码验证 切换到elastsearch的目录下，使用下列命令生成证书，需要分发证书到其他机器 在es启动状态下，设置用户密码，交互式设置密码 常见启动报错 不能使用root用户启动 文..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696923009409-f2d0a809-432c-4be3-9538-ce7426685e4d.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-08-23T06:42:52.000Z"}],["meta",{"property":"article:author","content":"mozzie"}],["meta",{"property":"article:tag","content":"ElasticSearch"}],["meta",{"property":"article:tag","content":"分布式"}],["meta",{"property":"article:tag","content":"搜索引擎"}],["meta",{"property":"article:published_time","content":"2022-03-15T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-08-23T06:42:52.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"安装Elasticsearch\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696923009409-f2d0a809-432c-4be3-9538-ce7426685e4d.png\\",\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713753909417-540d8d86-3237-44a0-8af0-d041a9692050.png\\"],\\"datePublished\\":\\"2022-03-15T00:00:00.000Z\\",\\"dateModified\\":\\"2024-08-23T06:42:52.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"mozzie\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"二进制离线安装","slug":"二进制离线安装","link":"#二进制离线安装","children":[{"level":3,"title":"开启集群密码验证","slug":"开启集群密码验证","link":"#开启集群密码验证","children":[]},{"level":3,"title":"常见启动报错","slug":"常见启动报错","link":"#常见启动报错","children":[]},{"level":3,"title":"脚本","slug":"脚本","link":"#脚本","children":[]}]},{"level":2,"title":"Kibana安装","slug":"kibana安装","link":"#kibana安装","children":[{"level":3,"title":"kibana插件","slug":"kibana插件","link":"#kibana插件","children":[]}]}],"git":{"createdTime":1718249717000,"updatedTime":1724395372000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":4}]},"readingTime":{"minutes":6.94,"words":2081},"filePathRelative":"code/distributed/elasticsearch/install.md","localizedDate":"2022年3月15日","excerpt":"<p>本文基于 Elasticsearch 7.9.3 的安装教程</p>","autoDesc":true}');export{w as comp,E as data};
