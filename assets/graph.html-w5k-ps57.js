import{_ as a}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as t,o as e,c as p,b as n,d as o,e as i,h as c}from"./app-HscYGYLB.js";const l="/assets/image-20210713084911013-CQEdReON.png",u="/assets/image-20210713085101912-DntKR-Du.png",r="/assets/image-20210713085314217-C0ZNDLcj.png",d="/assets/image-20210713110355280-D-kdc57Y.png",k="/assets/image-20210713090008230-DKhtn4R4.png",v="/assets/image-20210713110528436-CN0Bk3Dc.png",m="/assets/image-20210713091435601-DL9ICQcJ.png",b="/assets/image-20210713091510094-Cmf82P9Q.png",g="/assets/image-20210713091734346-iTvycZES.png",f="/assets/image-20210713091920035-JbrHXoLG.png",V="/assets/image-20210713092004788-Ds4ZBTkd.png",h="/assets/image-20210713092048754-B0v3XLw6.png",y="/assets/image-20210713092055628-xc5-gImZ.png",x="/assets/image-20210713092107112-Bjlb3j2b.png",G="/assets/image-20210713092142541-B8FI1cnJ.png",w={},_=n("h1",{id:"图-graph",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#图-graph"},[n("span",null,"图(Graph)")])],-1),j={href:"https://d3gt.com/index.html",target:"_blank",rel:"noopener noreferrer"},M=c('<figure><img src="'+l+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><ul><li><code>节点(Vertex)</code> 与 <code>边（Edge）</code></li><li>图的表示： <code>邻接表</code> 和 <code>邻接矩阵</code><ul><li>这里可以分为 <code>有向图</code> 和<code>无向图</code><code>无向图是一种特殊的有向图</code></li><li><code>有权图</code> 和 <code>无权图</code></li></ul></li><li>图的遍历： <code>(广度优先搜索)DFS</code> <code>(深度优先搜索)BFS</code> 常见可以解决的问题有： <code>联通分量</code> <code>Flood Fill</code> <code>寻路</code> <code>走迷宫</code> <code>迷宫生成</code> <code>无权图的最短路径</code> <code>环的判断</code></li><li>最小生成树问题（Minimum Spanning Tree） <code>Prim</code> <code>Kruskal</code></li><li>最短路径问题(Shortest Path) <code>Dijkstra</code> <code>Bellman-Ford</code></li><li>拓扑排序(Topological sorting)</li></ul><blockquote><p>图的定义</p></blockquote><h2 id="术语" tabindex="-1"><a class="header-anchor" href="#术语"><span>术语</span></a></h2><h3 id="什么是图" tabindex="-1"><a class="header-anchor" href="#什么是图"><span>什么是图</span></a></h3><p>图是一种复杂的非线性结构。</p><p>在线性结构中，数据元素之间满足唯一的线性关系，每个数据元素(除第一个和最后一个外)只有一个直接前趋和一个直接后继；</p><p>在树形结构中，数据元素之间有着明显的层次关系，并且每个数据元素只与上一层中的一个元素(parent node)及下一层的多个元素(孩子节点)相关；</p><p>而在图形结构中，节点之间的关系是任意的，图中任意两个数据元素之间都有可能相关。</p><p><strong>图G由两个集合V(顶点Vertex)和E(边Edge)组成，定义为G=(V，E)</strong></p><blockquote><p>图相关的概念和术语</p></blockquote><h3 id="无向图和有向图" tabindex="-1"><a class="header-anchor" href="#无向图和有向图"><span>无向图和有向图</span></a></h3><p>对于一个图，若每条边都是没有方向的，则称该图为无向图。图示如下：</p><figure><img src="'+u+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>因此，(Vi，Vj)和(Vj，Vi)表示的是同一条边。注意，无向图是用小括号</p><p>无向图的顶点集和边集分别表示为：</p><p>V(G)={V1，V2，V3，V4，V5}</p><p>E(G)={(V1，V2)，(V1，V4)，(V2，V3)，(V2，V5)，(V3，V4)，(V3，V5)，(V4，V5)}</p><p>对于一个图G，若每条边都是有方向的，则称该图为有向图。图示如下。</p><figure><img src="'+r+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>因此，&lt;Vi，Vj&gt;和&lt;Vj，Vi&gt;是两条不同的有向边。注意，有向边又称为弧。</p><p>有向图的顶点集和边集分别表示为：</p><p>V(G) = {V1，V2，V3}</p><p>E(G) = {&lt;V1，V2&gt;，&lt;V2，V3&gt;，&lt;V3，V1&gt;，&lt;V1，V3&gt;}</p><h5 id="无向完全图和有向完全图" tabindex="-1"><a class="header-anchor" href="#无向完全图和有向完全图"><span>无向完全图和有向完全图</span></a></h5><p><code>我们将具有n(n-1)/2条边的无向图称为无向完全图(每两个节点之间都有一个条边)。同理，将具有n(n-1)条边的有向图称为有向完全图(每两个节点之间都有两条边，并且边是双向的)。</code></p><h5 id="顶点的度" tabindex="-1"><a class="header-anchor" href="#顶点的度"><span>顶点的度</span></a></h5><p>对于无向图，顶点的度表示以该顶点作为一个端点的边的数目。</p><figure><img src="'+d+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>对于有向图，顶点的度分为入度和出度。入度表示以该顶点为终点的入边数目，出度是以该顶点为起点的出边数目，该顶点的度等于其入度和出度之和。</p><p>记住，不管是无向图还是有向图，顶点数n，边数e和顶点的度数有如下关系：</p><figure><img src="'+k+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h5 id="子图" tabindex="-1"><a class="header-anchor" href="#子图"><span>子图</span></a></h5><p>一个图中任意个数的节点组成的图称为该图的子图</p><h5 id="路径-路径长度和回路" tabindex="-1"><a class="header-anchor" href="#路径-路径长度和回路"><span>路径，路径长度和回路</span></a></h5><p>路径，比如在无向图G中，存在一个顶点序列Vp,Vi1,Vi2,Vi3…，Vim，Vq，使得(Vp,Vi1)，(Vi1,Vi2)，…,(Vim,Vq)均属于边集E(G)，则称顶点Vp到Vq存在一条路径。</p><p>路径长度，是指一条路径上经过的边的数量。</p><p>回路，指一条路径的起点和终点为同一个顶点。</p><h5 id="连通图-无向图" tabindex="-1"><a class="header-anchor" href="#连通图-无向图"><span>连通图(无向图)</span></a></h5><p>连通图是指图中任意两个顶点Vi和Vj都连通，则称为连通图。</p><figure><img src="'+v+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>下面是一个非连通图的例子。</p><figure><img src="'+m+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>因为V5和V6是单独的，所以是非连通图。</p><h5 id="强连通图-有向图" tabindex="-1"><a class="header-anchor" href="#强连通图-有向图"><span>强连通图(有向图)</span></a></h5><p>强连通图是对于有向图而言的，与无向图的连通图类似。</p><h5 id="网" tabindex="-1"><a class="header-anchor" href="#网"><span>网</span></a></h5><p>带”权值“的连通图称为网。如图所示。</p><figure><img src="'+b+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><blockquote><p>图的创建和遍历</p></blockquote><h4 id="图的创建" tabindex="-1"><a class="header-anchor" href="#图的创建"><span>图的创建</span></a></h4><ol><li><p>邻接矩阵</p><p>原理就是用两个数组，一个数组保存顶点集，一个数组保存边集。下面的算法实现里边我们也是采用这种存储结构。</p><figure><img src="'+g+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure></li><li><p>邻接表</p><p>邻接表是图的一种链式存储结构。这种存储结构类似于树的孩子链表。对于图G中每个顶点Vi，把所有邻接于Vi的顶点Vj链成一个单链表，这个单链表称为顶点Vi的邻接表。</p></li></ol><h4 id="图的遍历" tabindex="-1"><a class="header-anchor" href="#图的遍历"><span>图的遍历</span></a></h4><ol><li><p>深度优先搜索遍历(DFS)</p><p><code>深度优先搜索是一个不断回溯的过程</code></p><p>深度优先搜索DFS遍历类似于树的前序遍历。其基本思路是：</p><ul><li>假设初始状态是图中所有顶点都未曾访问过，则可从图G中任意一顶点v为初始出发点，首先访问出发点v，并将其标记为已访问过。</li><li>然后依次从v出发搜索v的每个邻接点w，若w未曾访问过，则以w作为新的出发点出发，继续进行深度优先遍历，直到图中所有和v有路径相通的顶点都被访问到。</li><li>若此时图中仍有顶点未被访问，则另选一个未曾访问的顶点作为起点，重复上述步骤，直到图中所有顶点都被访问到为止。</li></ul><p>图示如下：</p><figure><img src="'+f+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>注：红色数字代表遍历的先后顺序，所以图(e)无向图的深度优先遍历的顶点访问序列为：V0，V1，V2，V5，V4，V6，V3，V7，V8</p><p>如果采用邻接矩阵存储，则时间复杂度为O(n2)；当采用邻接表时时间复杂度为O(n+e)。</p><div class="language-C line-numbers-mode" data-ext="C" data-title="C"><pre class="language-C"><code>#include &lt;stdio.h&gt;

#define MAX_VERtEX_NUM 20                   //顶点的最大个数
#define VRType int                          //表示顶点之间的关系的变量类型
#define InfoType char                       //存储弧或者边额外信息的指针变量类型
#define VertexType int                      //图中顶点的数据类型

typedef enum{false,true}bool;               //定义bool型常量
bool visited[MAX_VERtEX_NUM];               //设置全局数组，记录标记顶点是否被访问过

typedef struct {
    VRType adj;                             //对于无权图，用 1 或 0 表示是否相邻；对于带权图，直接为权值。
    InfoType * info;                        //弧或边额外含有的信息指针
}ArcCell,AdjMatrix[MAX_VERtEX_NUM][MAX_VERtEX_NUM];

typedef struct {
    VertexType vexs[MAX_VERtEX_NUM];        //存储图中顶点数据
    AdjMatrix arcs;                         //二维数组，记录顶点之间的关系
    int vexnum,arcnum;                      //记录图的顶点数和弧（边）数
}MGraph;
//根据顶点本身数据，判断出顶点在二维数组中的位置
int LocateVex(MGraph * G,VertexType v){
    int i=0;
    //遍历一维数组，找到变量v
    for (; i&lt;G-&gt;vexnum; i++) {
        if (G-&gt;vexs[i]==v) {
            break;
        }
    }
    //如果找不到，输出提示语句，返回-1
    if (i&gt;G-&gt;vexnum) {
        printf(&quot;no such vertex.\\n&quot;);
        return -1;
    }
    return i;
}
//构造无向图
void CreateDN(MGraph *G){
    scanf(&quot;%d,%d&quot;,&amp;(G-&gt;vexnum),&amp;(G-&gt;arcnum));
    for (int i=0; i&lt;G-&gt;vexnum; i++) {
        scanf(&quot;%d&quot;,&amp;(G-&gt;vexs[i]));
    }
    for (int i=0; i&lt;G-&gt;vexnum; i++) {
        for (int j=0; j&lt;G-&gt;vexnum; j++) {
            G-&gt;arcs[i][j].adj=0;
            G-&gt;arcs[i][j].info=NULL;
        }
    }
    for (int i=0; i&lt;G-&gt;arcnum; i++) {
        int v1,v2;
        scanf(&quot;%d,%d&quot;,&amp;v1,&amp;v2);
        int n=LocateVex(G, v1);
        int m=LocateVex(G, v2);
        if (m==-1 ||n==-1) {
            printf(&quot;no this vertex\\n&quot;);
            return;
        }
        G-&gt;arcs[n][m].adj=1;
        G-&gt;arcs[m][n].adj=1;//无向图的二阶矩阵沿主对角线对称
    }
}

int FirstAdjVex(MGraph G,int v)
{
    //查找与数组下标为v的顶点之间有边的顶点，返回它在数组中的下标
    for(int i = 0; i&lt;G.vexnum; i++){
        if( G.arcs[v][i].adj ){
            return i;
        }
    }
    return -1;
}
int NextAdjVex(MGraph G,int v,int w)
{
    //从前一个访问位置w的下一个位置开始，查找之间有边的顶点
    for(int i = w+1; i&lt;G.vexnum; i++){
        if(G.arcs[v][i].adj){
            return i;
        }
    }
    return -1;
}
void visitVex(MGraph G, int v){
    printf(&quot;%d &quot;,G.vexs[v]);
}
void DFS(MGraph G,int v){
    visited[v] = true;//标记为true
    visitVex( G,  v); //访问第v 个顶点
    //从该顶点的第一个边开始，一直到最后一个边，对处于边另一端的顶点调用DFS函数
    for(int w = FirstAdjVex(G,v); w&gt;=0; w = NextAdjVex(G,v,w)){
        //如果该顶点的标记位false，证明未被访问，调用深度优先搜索函数
        if(!visited[w]){
            DFS(G,w);
        }
    }
}
//深度优先搜索
void DFSTraverse(MGraph G){//
    int v;
    //将用做标记的visit数组初始化为false
    for( v = 0; v &lt; G.vexnum; ++v){
        visited[v] = false;
    }
    //对于每个标记为false的顶点调用深度优先搜索函数
    for( v = 0; v &lt; G.vexnum; v++){
        //如果该顶点的标记位为false，则调用深度优先搜索函数
        if(!visited[v]){
            DFS( G, v);
        }
    }
}

int main() {
    MGraph G;//建立一个图的变量
    CreateDN(&amp;G);//初始化图
    DFSTraverse(G);//深度优先搜索图
    return 0;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>广度优先搜索遍历(BFS)</p><p>广度优先搜索遍历BFS类似于树的按层次遍历。其基本思路是：</p><ul><li>首先访问出发点Vi</li><li>接着依次访问Vi的所有未被访问过的邻接点Vi1，Vi2，Vi3，…，Vit并均标记为已访问过。</li><li>然后再按照Vi1，Vi2，… ，Vit的次序，访问每一个顶点的所有未曾访问过的顶点并均标记为已访问过，依此类推，直到图中所有和初始出发点Vi有路径相通的顶点都被访问过为止。</li></ul><p>图示如下：</p><figure><img src="`+V+`" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>因此，图(f)采用广义优先搜索遍历以V0为出发点的顶点序列为：V0，V1，V3，V4，V2，V6，V8，V5，V7</p><p>如果采用邻接矩阵存储，则时间复杂度为O(n2)，若采用邻接表，则时间复杂度为O(n+e)。</p><div class="language-c line-numbers-mode" data-ext="c" data-title="c"><pre class="language-c"><code><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdio.h&gt;</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">include</span> <span class="token string">&lt;stdlib.h&gt;</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">MAX_VERtEX_NUM</span> <span class="token expression"><span class="token number">20</span>                   </span><span class="token comment">//顶点的最大个数</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">VRType</span> <span class="token expression"><span class="token keyword">int</span>                          </span><span class="token comment">//表示顶点之间的关系的变量类型</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">InfoType</span> <span class="token expression"><span class="token keyword">char</span>                       </span><span class="token comment">//存储弧或者边额外信息的指针变量类型</span></span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">VertexType</span> <span class="token expression"><span class="token keyword">int</span>                      </span><span class="token comment">//图中顶点的数据类型</span></span>
<span class="token keyword">typedef</span> <span class="token keyword">enum</span><span class="token punctuation">{</span>false<span class="token punctuation">,</span>true<span class="token punctuation">}</span>bool<span class="token punctuation">;</span>               <span class="token comment">//定义bool型常量</span>
bool visited<span class="token punctuation">[</span>MAX_VERtEX_NUM<span class="token punctuation">]</span><span class="token punctuation">;</span>               <span class="token comment">//设置全局数组，记录标记顶点是否被访问过</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">Queue</span><span class="token punctuation">{</span>
    VertexType data<span class="token punctuation">;</span>
    <span class="token keyword">struct</span> <span class="token class-name">Queue</span> <span class="token operator">*</span> next<span class="token punctuation">;</span>
<span class="token punctuation">}</span>Queue<span class="token punctuation">;</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span>
    VRType adj<span class="token punctuation">;</span>                             <span class="token comment">//对于无权图，用 1 或 0 表示是否相邻；对于带权图，直接为权值。</span>
    InfoType <span class="token operator">*</span> info<span class="token punctuation">;</span>                        <span class="token comment">//弧或边额外含有的信息指针</span>
<span class="token punctuation">}</span>ArcCell<span class="token punctuation">,</span>AdjMatrix<span class="token punctuation">[</span>MAX_VERtEX_NUM<span class="token punctuation">]</span><span class="token punctuation">[</span>MAX_VERtEX_NUM<span class="token punctuation">]</span><span class="token punctuation">;</span>

<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token punctuation">{</span>
    VertexType vexs<span class="token punctuation">[</span>MAX_VERtEX_NUM<span class="token punctuation">]</span><span class="token punctuation">;</span>        <span class="token comment">//存储图中顶点数据</span>
    AdjMatrix arcs<span class="token punctuation">;</span>                         <span class="token comment">//二维数组，记录顶点之间的关系</span>
    <span class="token keyword">int</span> vexnum<span class="token punctuation">,</span>arcnum<span class="token punctuation">;</span>                      <span class="token comment">//记录图的顶点数和弧（边）数</span>
<span class="token punctuation">}</span>MGraph<span class="token punctuation">;</span>
<span class="token comment">//根据顶点本身数据，判断出顶点在二维数组中的位置</span>
<span class="token keyword">int</span> <span class="token function">LocateVex</span><span class="token punctuation">(</span>MGraph <span class="token operator">*</span> G<span class="token punctuation">,</span>VertexType v<span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token keyword">int</span> i<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token comment">//遍历一维数组，找到变量v</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span> i<span class="token operator">&lt;</span>G<span class="token operator">-&gt;</span>vexnum<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>G<span class="token operator">-&gt;</span>vexs<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token operator">==</span>v<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token comment">//如果找不到，输出提示语句，返回-1</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>i<span class="token operator">&gt;</span>G<span class="token operator">-&gt;</span>vexnum<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;no such vertex.\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> i<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//构造无向图</span>
<span class="token keyword">void</span> <span class="token function">CreateDN</span><span class="token punctuation">(</span>MGraph <span class="token operator">*</span>G<span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token function">scanf</span><span class="token punctuation">(</span><span class="token string">&quot;%d,%d&quot;</span><span class="token punctuation">,</span><span class="token operator">&amp;</span><span class="token punctuation">(</span>G<span class="token operator">-&gt;</span>vexnum<span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token operator">&amp;</span><span class="token punctuation">(</span>G<span class="token operator">-&gt;</span>arcnum<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">&lt;</span>G<span class="token operator">-&gt;</span>vexnum<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">scanf</span><span class="token punctuation">(</span><span class="token string">&quot;%d&quot;</span><span class="token punctuation">,</span><span class="token operator">&amp;</span><span class="token punctuation">(</span>G<span class="token operator">-&gt;</span>vexs<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">&lt;</span>G<span class="token operator">-&gt;</span>vexnum<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> j<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">;</span> j<span class="token operator">&lt;</span>G<span class="token operator">-&gt;</span>vexnum<span class="token punctuation">;</span> j<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            G<span class="token operator">-&gt;</span>arcs<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">[</span>j<span class="token punctuation">]</span><span class="token punctuation">.</span>adj<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">;</span>
            G<span class="token operator">-&gt;</span>arcs<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">[</span>j<span class="token punctuation">]</span><span class="token punctuation">.</span>info<span class="token operator">=</span><span class="token constant">NULL</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">&lt;</span>G<span class="token operator">-&gt;</span>arcnum<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> v1<span class="token punctuation">,</span>v2<span class="token punctuation">;</span>
        <span class="token function">scanf</span><span class="token punctuation">(</span><span class="token string">&quot;%d,%d&quot;</span><span class="token punctuation">,</span><span class="token operator">&amp;</span>v1<span class="token punctuation">,</span><span class="token operator">&amp;</span>v2<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> n<span class="token operator">=</span><span class="token function">LocateVex</span><span class="token punctuation">(</span>G<span class="token punctuation">,</span> v1<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">int</span> m<span class="token operator">=</span><span class="token function">LocateVex</span><span class="token punctuation">(</span>G<span class="token punctuation">,</span> v2<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>m<span class="token operator">==</span><span class="token operator">-</span><span class="token number">1</span> <span class="token operator">||</span>n<span class="token operator">==</span><span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;no this vertex\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        G<span class="token operator">-&gt;</span>arcs<span class="token punctuation">[</span>n<span class="token punctuation">]</span><span class="token punctuation">[</span>m<span class="token punctuation">]</span><span class="token punctuation">.</span>adj<span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">;</span>
        G<span class="token operator">-&gt;</span>arcs<span class="token punctuation">[</span>m<span class="token punctuation">]</span><span class="token punctuation">[</span>n<span class="token punctuation">]</span><span class="token punctuation">.</span>adj<span class="token operator">=</span><span class="token number">1</span><span class="token punctuation">;</span><span class="token comment">//无向图的二阶矩阵沿主对角线对称</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">int</span> <span class="token function">FirstAdjVex</span><span class="token punctuation">(</span>MGraph G<span class="token punctuation">,</span><span class="token keyword">int</span> v<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">//查找与数组下标为v的顶点之间有边的顶点，返回它在数组中的下标</span>
    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i<span class="token operator">&lt;</span>G<span class="token punctuation">.</span>vexnum<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span> G<span class="token punctuation">.</span>arcs<span class="token punctuation">[</span>v<span class="token punctuation">]</span><span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>adj <span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token keyword">return</span> i<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">int</span> <span class="token function">NextAdjVex</span><span class="token punctuation">(</span>MGraph G<span class="token punctuation">,</span><span class="token keyword">int</span> v<span class="token punctuation">,</span><span class="token keyword">int</span> w<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">//从前一个访问位置w的下一个位置开始，查找之间有边的顶点</span>
    <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> w<span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">;</span> i<span class="token operator">&lt;</span>G<span class="token punctuation">.</span>vexnum<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>G<span class="token punctuation">.</span>arcs<span class="token punctuation">[</span>v<span class="token punctuation">]</span><span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">.</span>adj<span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token keyword">return</span> i<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//操作顶点的函数</span>
<span class="token keyword">void</span> <span class="token function">visitVex</span><span class="token punctuation">(</span>MGraph G<span class="token punctuation">,</span> <span class="token keyword">int</span> v<span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;%d &quot;</span><span class="token punctuation">,</span>G<span class="token punctuation">.</span>vexs<span class="token punctuation">[</span>v<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//初始化队列</span>
<span class="token keyword">void</span> <span class="token function">InitQueue</span><span class="token punctuation">(</span>Queue <span class="token operator">*</span><span class="token operator">*</span> Q<span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token operator">=</span><span class="token punctuation">(</span>Queue<span class="token operator">*</span><span class="token punctuation">)</span><span class="token function">malloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span>Queue<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">(</span><span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token operator">-&gt;</span>next<span class="token operator">=</span><span class="token constant">NULL</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//顶点元素v进队列</span>
<span class="token keyword">void</span> <span class="token function">EnQueue</span><span class="token punctuation">(</span>Queue <span class="token operator">*</span><span class="token operator">*</span>Q<span class="token punctuation">,</span>VertexType v<span class="token punctuation">)</span><span class="token punctuation">{</span>
    Queue <span class="token operator">*</span> element<span class="token operator">=</span><span class="token punctuation">(</span>Queue<span class="token operator">*</span><span class="token punctuation">)</span><span class="token function">malloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span>Queue<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    element<span class="token operator">-&gt;</span>data<span class="token operator">=</span>v<span class="token punctuation">;</span>
    Queue <span class="token operator">*</span> temp<span class="token operator">=</span><span class="token punctuation">(</span><span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span>temp<span class="token operator">-&gt;</span>next<span class="token operator">!=</span><span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        temp<span class="token operator">=</span>temp<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    temp<span class="token operator">-&gt;</span>next<span class="token operator">=</span>element<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//队头元素出队列</span>
<span class="token keyword">void</span> <span class="token function">DeQueue</span><span class="token punctuation">(</span>Queue <span class="token operator">*</span><span class="token operator">*</span>Q<span class="token punctuation">,</span><span class="token keyword">int</span> <span class="token operator">*</span>u<span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token punctuation">(</span><span class="token operator">*</span>u<span class="token punctuation">)</span><span class="token operator">=</span><span class="token punctuation">(</span><span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token operator">-&gt;</span>next<span class="token operator">-&gt;</span>data<span class="token punctuation">;</span>
    <span class="token punctuation">(</span><span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token operator">-&gt;</span>next<span class="token operator">=</span><span class="token punctuation">(</span><span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token operator">-&gt;</span>next<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//判断队列是否为空</span>
bool <span class="token function">QueueEmpty</span><span class="token punctuation">(</span>Queue <span class="token operator">*</span>Q<span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>Q<span class="token operator">-&gt;</span>next<span class="token operator">==</span><span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> true<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> false<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token comment">//广度优先搜索</span>
<span class="token keyword">void</span> <span class="token function">BFSTraverse</span><span class="token punctuation">(</span>MGraph G<span class="token punctuation">)</span><span class="token punctuation">{</span><span class="token comment">//</span>
    <span class="token keyword">int</span> v<span class="token punctuation">;</span>
    <span class="token comment">//将用做标记的visit数组初始化为false</span>
    <span class="token keyword">for</span><span class="token punctuation">(</span> v <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> v <span class="token operator">&lt;</span> G<span class="token punctuation">.</span>vexnum<span class="token punctuation">;</span> <span class="token operator">++</span>v<span class="token punctuation">)</span><span class="token punctuation">{</span>
        visited<span class="token punctuation">[</span>v<span class="token punctuation">]</span> <span class="token operator">=</span> false<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">//对于每个标记为false的顶点调用深度优先搜索函数</span>
    Queue <span class="token operator">*</span> Q<span class="token punctuation">;</span>
    <span class="token function">InitQueue</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Q<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">for</span><span class="token punctuation">(</span> v <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> v <span class="token operator">&lt;</span> G<span class="token punctuation">.</span>vexnum<span class="token punctuation">;</span> v<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token operator">!</span>visited<span class="token punctuation">[</span>v<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            visited<span class="token punctuation">[</span>v<span class="token punctuation">]</span><span class="token operator">=</span>true<span class="token punctuation">;</span>
            <span class="token function">visitVex</span><span class="token punctuation">(</span>G<span class="token punctuation">,</span> v<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token function">EnQueue</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Q<span class="token punctuation">,</span> G<span class="token punctuation">.</span>vexs<span class="token punctuation">[</span>v<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token function">QueueEmpty</span><span class="token punctuation">(</span>Q<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">int</span> u<span class="token punctuation">;</span>
                <span class="token function">DeQueue</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Q<span class="token punctuation">,</span> <span class="token operator">&amp;</span>u<span class="token punctuation">)</span><span class="token punctuation">;</span>
                u<span class="token operator">=</span><span class="token function">LocateVex</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>G<span class="token punctuation">,</span> u<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> w<span class="token operator">=</span><span class="token function">FirstAdjVex</span><span class="token punctuation">(</span>G<span class="token punctuation">,</span> u<span class="token punctuation">)</span><span class="token punctuation">;</span> w<span class="token operator">&gt;=</span><span class="token number">0</span><span class="token punctuation">;</span> w<span class="token operator">=</span><span class="token function">NextAdjVex</span><span class="token punctuation">(</span>G<span class="token punctuation">,</span> u<span class="token punctuation">,</span> w<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>visited<span class="token punctuation">[</span>w<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        visited<span class="token punctuation">[</span>w<span class="token punctuation">]</span><span class="token operator">=</span>true<span class="token punctuation">;</span>
                        <span class="token function">visitVex</span><span class="token punctuation">(</span>G<span class="token punctuation">,</span> w<span class="token punctuation">)</span><span class="token punctuation">;</span>
                        <span class="token function">EnQueue</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>Q<span class="token punctuation">,</span> G<span class="token punctuation">.</span>vexs<span class="token punctuation">[</span>w<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    MGraph G<span class="token punctuation">;</span><span class="token comment">//建立一个图的变量</span>
    <span class="token function">CreateDN</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>G<span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//初始化图</span>
    <span class="token function">BFSTraverse</span><span class="token punctuation">(</span>G<span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//广度优先搜索图</span>
    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ol><p><mark>总结</mark></p><p>深度优先搜索算法的实现运用的主要是回溯法，类似于树的先序遍历算法。广度优先搜索算法借助队列的先进先出的特点，类似于树的层次遍历。</p><blockquote><p>最小生成树和最短路径</p></blockquote><h4 id="最小生成树" tabindex="-1"><a class="header-anchor" href="#最小生成树"><span>最小生成树</span></a></h4><p>什么是最小生成树呢？在弄清什么是最小生成树之前，我们需要弄清什么是生成树？</p><p>用一句语简单概括生成树就是：生成树是将图中所有顶点以最少的边连通的子图。</p><p>比如图(g)可以同时得到两个生成树图(h)和图(i)</p><p><img src="`+h+'" alt="" loading="lazy"> <img src="'+y+'" alt="" loading="lazy"></p><figure><img src="'+x+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>知道了什么是生成树之后，我们就很容易理解什么是最小生成树了。所谓最小生成树，用一句话总结就是：权值和最小的生成树就是最小生成树。</p><p>比如上图中的两个生成树，生成树1和生成树2，生成树1的权值和为：12，生成树2的权值为：14，我们可以证明图(h)生成树1就是图(g)的最小生成树。</p><p>那么如何构造最小生成树呢？可以使用普里姆算法、克鲁斯卡尔算法</p><h4 id="最短路径" tabindex="-1"><a class="header-anchor" href="#最短路径"><span>最短路径</span></a></h4><p>求最短路径也就是求最短路径长度。下面是一个带权值的有向图，表格中分别列出了顶点V1其它各顶点的最短路径长度。</p><figure><img src="'+G+'" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><table><thead><tr><th>源点</th><th>最短路径</th><th>终点</th><th></th><th>路径长度</th></tr></thead><tbody><tr><td>V1</td><td>V1，V3，V2</td><td>V2</td><td>中转</td><td>5</td></tr><tr><td>V1</td><td>V1，V3</td><td>V3</td><td>直达</td><td>3</td></tr><tr><td>V1</td><td>V1，V3，V2，V4</td><td>V4</td><td>中转</td><td>10</td></tr><tr><td>V1</td><td>V1，V3，V5</td><td>V5</td><td>中转</td><td>18</td></tr></tbody></table><p>表：顶点V1到其它各顶点的最短路径表</p><p>从图中可以看出，顶点V1到V4的路径有3条(V1，V2，V4)，(V1，V4)，(V1，V3，V2，V4)，其路径长度分别为15，20和10，因此，V1到V4的最短路径为(V1，V3，V2，V4)。</p><p>那么如何求带权有向图的最短路径长度呢？可以使用迪杰斯特拉(Dijkstra)算法。</p>',73);function Q(E,F){const s=t("ExternalLinkIcon");return e(),p("div",null,[_,n("p",null,[n("a",j,[o("以交互方式学习图论"),i(s)])]),M])}const D=a(w,[["render",Q],["__file","graph.html.vue"]]),N=JSON.parse('{"path":"/code/data-structure-and-algorithms/data-structure/graph.html","title":"图","lang":"zh-CN","frontmatter":{"order":5,"title":"图","date":"2020-12-30T00:00:00.000Z","category":"数据结构与算法","timeline":true,"article":false,"description":"图(Graph) 以交互方式学习图论 节点(Vertex) 与 边（Edge） 图的表示： 邻接表 和 邻接矩阵 这里可以分为 有向图 和无向图 无向图是一种特殊的有向图 有权图 和 无权图 图的遍历： (广度优先搜索)DFS (深度优先搜索)BFS 常见可以解决的问题有： 联通分量 Flood Fill 寻路 走迷宫 迷宫生成 无权图的最短路径 环的...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/data-structure-and-algorithms/data-structure/graph.html"}],["meta",{"property":"og:title","content":"图"}],["meta",{"property":"og:description","content":"图(Graph) 以交互方式学习图论 节点(Vertex) 与 边（Edge） 图的表示： 邻接表 和 邻接矩阵 这里可以分为 有向图 和无向图 无向图是一种特殊的有向图 有权图 和 无权图 图的遍历： (广度优先搜索)DFS (深度优先搜索)BFS 常见可以解决的问题有： 联通分量 Flood Fill 寻路 走迷宫 迷宫生成 无权图的最短路径 环的..."}],["meta",{"property":"og:type","content":"website"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-05-08T03:48:18.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:published_time","content":"2020-12-30T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-05-08T03:48:18.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"WebPage\\",\\"name\\":\\"图\\",\\"description\\":\\"图(Graph) 以交互方式学习图论 节点(Vertex) 与 边（Edge） 图的表示： 邻接表 和 邻接矩阵 这里可以分为 有向图 和无向图 无向图是一种特殊的有向图 有权图 和 无权图 图的遍历： (广度优先搜索)DFS (深度优先搜索)BFS 常见可以解决的问题有： 联通分量 Flood Fill 寻路 走迷宫 迷宫生成 无权图的最短路径 环的...\\"}"]]},"headers":[{"level":2,"title":"术语","slug":"术语","link":"#术语","children":[{"level":3,"title":"什么是图","slug":"什么是图","link":"#什么是图","children":[]},{"level":3,"title":"无向图和有向图","slug":"无向图和有向图","link":"#无向图和有向图","children":[]}]}],"git":{"createdTime":1715140098000,"updatedTime":1715140098000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":1}]},"readingTime":{"minutes":12.42,"words":3725},"filePathRelative":"code/data-structure-and-algorithms/data-structure/graph.md","localizedDate":"2020年12月30日","excerpt":"\\n<p><a href=\\"https://d3gt.com/index.html\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">以交互方式学习图论</a></p>\\n<figure><figcaption></figcaption></figure>\\n<ul>\\n<li><code>节点(Vertex)</code> 与 <code>边（Edge）</code></li>\\n<li>图的表示： <code>邻接表</code> 和 <code>邻接矩阵</code>\\n<ul>\\n<li>这里可以分为 <code>有向图</code> 和<code>无向图</code>\\n<code>无向图是一种特殊的有向图</code></li>\\n<li><code>有权图</code> 和 <code>无权图</code></li>\\n</ul>\\n</li>\\n<li>图的遍历： <code>(广度优先搜索)DFS</code> <code>(深度优先搜索)BFS</code> 常见可以解决的问题有： <code>联通分量</code> <code>Flood Fill</code> <code>寻路</code> <code>走迷宫</code> <code>迷宫生成</code> <code>无权图的最短路径</code> <code>环的判断</code></li>\\n<li>最小生成树问题（Minimum Spanning Tree） <code>Prim</code> <code>Kruskal</code></li>\\n<li>最短路径问题(Shortest Path) <code>Dijkstra</code> <code>Bellman-Ford</code></li>\\n<li>拓扑排序(Topological sorting)</li>\\n</ul>","autoDesc":true}');export{D as comp,N as data};
