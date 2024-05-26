---
order: 5
title: 图
date: 2020-12-30
category: 数据结构
tag: 数据结构
timeline: true
article: true
---

# 图(Graph)

[以交互方式学习图论](https://d3gt.com/index.html)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713084911013.png)

-   `节点(Vertex)` 与 `边（Edge）`
-   图的表示： `邻接表` 和 `邻接矩阵`
    -   这里可以分为 `有向图` 和`无向图`
        `无向图是一种特殊的有向图`
    -   `有权图` 和 `无权图`
-   图的遍历： `(广度优先搜索)DFS` `(深度优先搜索)BFS` 常见可以解决的问题有： `联通分量` `Flood Fill` `寻路` `走迷宫` `迷宫生成` `无权图的最短路径` `环的判断`
-   最小生成树问题（Minimum Spanning Tree） `Prim` `Kruskal`
-   最短路径问题(Shortest Path) `Dijkstra` `Bellman-Ford`
-   拓扑排序(Topological sorting)

>   图的定义

## 术语

### 什么是图

图是一种复杂的非线性结构。

在线性结构中，数据元素之间满足唯一的线性关系，每个数据元素(除第一个和最后一个外)只有一个直接前趋和一个直接后继；

在树形结构中，数据元素之间有着明显的层次关系，并且每个数据元素只与上一层中的一个元素(parent node)及下一层的多个元素(孩子节点)相关；

而在图形结构中，节点之间的关系是任意的，图中任意两个数据元素之间都有可能相关。

**图G由两个集合V(顶点Vertex)和E(边Edge)组成，定义为G=(V，E)**

>   图相关的概念和术语

### 无向图和有向图

对于一个图，若每条边都是没有方向的，则称该图为无向图。图示如下：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713085101912.png)

因此，(Vi，Vj)和(Vj，Vi)表示的是同一条边。注意，无向图是用小括号

无向图的顶点集和边集分别表示为：

V(G)={V1，V2，V3，V4，V5}

E(G)={(V1，V2)，(V1，V4)，(V2，V3)，(V2，V5)，(V3，V4)，(V3，V5)，(V4，V5)}

对于一个图G，若每条边都是有方向的，则称该图为有向图。图示如下。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713085314217.png)

因此，<Vi，Vj>和<Vj，Vi>是两条不同的有向边。注意，有向边又称为弧。

有向图的顶点集和边集分别表示为：

V(G) = {V1，V2，V3}

E(G) = {<V1，V2>，<V2，V3>，<V3，V1>，<V1，V3>}

##### 无向完全图和有向完全图

`我们将具有n(n-1)/2条边的无向图称为无向完全图(每两个节点之间都有一个条边)。同理，将具有n(n-1)条边的有向图称为有向完全图(每两个节点之间都有两条边，并且边是双向的)。`

##### 顶点的度

对于无向图，顶点的度表示以该顶点作为一个端点的边的数目。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713110355280.png)

对于有向图，顶点的度分为入度和出度。入度表示以该顶点为终点的入边数目，出度是以该顶点为起点的出边数目，该顶点的度等于其入度和出度之和。

记住，不管是无向图还是有向图，顶点数n，边数e和顶点的度数有如下关系：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713090008230.png)

##### 子图

一个图中任意个数的节点组成的图称为该图的子图

##### 路径，路径长度和回路

路径，比如在无向图G中，存在一个顶点序列Vp,Vi1,Vi2,Vi3…，Vim，Vq，使得(Vp,Vi1)，(Vi1,Vi2)，…,(Vim,Vq)均属于边集E(G)，则称顶点Vp到Vq存在一条路径。

路径长度，是指一条路径上经过的边的数量。

回路，指一条路径的起点和终点为同一个顶点。

##### 连通图(无向图)

连通图是指图中任意两个顶点Vi和Vj都连通，则称为连通图。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713110528436.png)

下面是一个非连通图的例子。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713091435601.png)

因为V5和V6是单独的，所以是非连通图。

##### 强连通图(有向图)

强连通图是对于有向图而言的，与无向图的连通图类似。

##### 网

带”权值“的连通图称为网。如图所示。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713091510094.png)

>   图的创建和遍历

#### 图的创建

1. 邻接矩阵

   原理就是用两个数组，一个数组保存顶点集，一个数组保存边集。下面的算法实现里边我们也是采用这种存储结构。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713091734346.png)

2. 邻接表

   邻接表是图的一种链式存储结构。这种存储结构类似于树的孩子链表。对于图G中每个顶点Vi，把所有邻接于Vi的顶点Vj链成一个单链表，这个单链表称为顶点Vi的邻接表。

#### 图的遍历

1. 深度优先搜索遍历(DFS)

   `深度优先搜索是一个不断回溯的过程`

   深度优先搜索DFS遍历类似于树的前序遍历。其基本思路是：

   -   假设初始状态是图中所有顶点都未曾访问过，则可从图G中任意一顶点v为初始出发点，首先访问出发点v，并将其标记为已访问过。
   -   然后依次从v出发搜索v的每个邻接点w，若w未曾访问过，则以w作为新的出发点出发，继续进行深度优先遍历，直到图中所有和v有路径相通的顶点都被访问到。
   -   若此时图中仍有顶点未被访问，则另选一个未曾访问的顶点作为起点，重复上述步骤，直到图中所有顶点都被访问到为止。

   图示如下：

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713091920035.png)

   注：红色数字代表遍历的先后顺序，所以图(e)无向图的深度优先遍历的顶点访问序列为：V0，V1，V2，V5，V4，V6，V3，V7，V8

   如果采用邻接矩阵存储，则时间复杂度为O(n2)；当采用邻接表时时间复杂度为O(n+e)。

   ```C
   #include <stdio.h>
   
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
       for (; i<G->vexnum; i++) {
           if (G->vexs[i]==v) {
               break;
           }
       }
       //如果找不到，输出提示语句，返回-1
       if (i>G->vexnum) {
           printf("no such vertex.\n");
           return -1;
       }
       return i;
   }
   //构造无向图
   void CreateDN(MGraph *G){
       scanf("%d,%d",&(G->vexnum),&(G->arcnum));
       for (int i=0; i<G->vexnum; i++) {
           scanf("%d",&(G->vexs[i]));
       }
       for (int i=0; i<G->vexnum; i++) {
           for (int j=0; j<G->vexnum; j++) {
               G->arcs[i][j].adj=0;
               G->arcs[i][j].info=NULL;
           }
       }
       for (int i=0; i<G->arcnum; i++) {
           int v1,v2;
           scanf("%d,%d",&v1,&v2);
           int n=LocateVex(G, v1);
           int m=LocateVex(G, v2);
           if (m==-1 ||n==-1) {
               printf("no this vertex\n");
               return;
           }
           G->arcs[n][m].adj=1;
           G->arcs[m][n].adj=1;//无向图的二阶矩阵沿主对角线对称
       }
   }
   
   int FirstAdjVex(MGraph G,int v)
   {
       //查找与数组下标为v的顶点之间有边的顶点，返回它在数组中的下标
       for(int i = 0; i<G.vexnum; i++){
           if( G.arcs[v][i].adj ){
               return i;
           }
       }
       return -1;
   }
   int NextAdjVex(MGraph G,int v,int w)
   {
       //从前一个访问位置w的下一个位置开始，查找之间有边的顶点
       for(int i = w+1; i<G.vexnum; i++){
           if(G.arcs[v][i].adj){
               return i;
           }
       }
       return -1;
   }
   void visitVex(MGraph G, int v){
       printf("%d ",G.vexs[v]);
   }
   void DFS(MGraph G,int v){
       visited[v] = true;//标记为true
       visitVex( G,  v); //访问第v 个顶点
       //从该顶点的第一个边开始，一直到最后一个边，对处于边另一端的顶点调用DFS函数
       for(int w = FirstAdjVex(G,v); w>=0; w = NextAdjVex(G,v,w)){
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
       for( v = 0; v < G.vexnum; ++v){
           visited[v] = false;
       }
       //对于每个标记为false的顶点调用深度优先搜索函数
       for( v = 0; v < G.vexnum; v++){
           //如果该顶点的标记位为false，则调用深度优先搜索函数
           if(!visited[v]){
               DFS( G, v);
           }
       }
   }
   
   int main() {
       MGraph G;//建立一个图的变量
       CreateDN(&G);//初始化图
       DFSTraverse(G);//深度优先搜索图
       return 0;
   }
   ```

2. 广度优先搜索遍历(BFS)

   广度优先搜索遍历BFS类似于树的按层次遍历。其基本思路是：

   -   首先访问出发点Vi
   -   接着依次访问Vi的所有未被访问过的邻接点Vi1，Vi2，Vi3，…，Vit并均标记为已访问过。
   -   然后再按照Vi1，Vi2，… ，Vit的次序，访问每一个顶点的所有未曾访问过的顶点并均标记为已访问过，依此类推，直到图中所有和初始出发点Vi有路径相通的顶点都被访问过为止。

   图示如下：

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713092004788.png)

   因此，图(f)采用广义优先搜索遍历以V0为出发点的顶点序列为：V0，V1，V3，V4，V2，V6，V8，V5，V7

   如果采用邻接矩阵存储，则时间复杂度为O(n2)，若采用邻接表，则时间复杂度为O(n+e)。

   ```c
   #include <stdio.h>
   #include <stdlib.h>
   #define MAX_VERtEX_NUM 20                   //顶点的最大个数
   #define VRType int                          //表示顶点之间的关系的变量类型
   #define InfoType char                       //存储弧或者边额外信息的指针变量类型
   #define VertexType int                      //图中顶点的数据类型
   typedef enum{false,true}bool;               //定义bool型常量
   bool visited[MAX_VERtEX_NUM];               //设置全局数组，记录标记顶点是否被访问过
   typedef struct Queue{
       VertexType data;
       struct Queue * next;
   }Queue;
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
       for (; i<G->vexnum; i++) {
           if (G->vexs[i]==v) {
               break;
           }
       }
       //如果找不到，输出提示语句，返回-1
       if (i>G->vexnum) {
           printf("no such vertex.\n");
           return -1;
       }
       return i;
   }
   //构造无向图
   void CreateDN(MGraph *G){
       scanf("%d,%d",&(G->vexnum),&(G->arcnum));
       for (int i=0; i<G->vexnum; i++) {
           scanf("%d",&(G->vexs[i]));
       }
       for (int i=0; i<G->vexnum; i++) {
           for (int j=0; j<G->vexnum; j++) {
               G->arcs[i][j].adj=0;
               G->arcs[i][j].info=NULL;
           }
       }
       for (int i=0; i<G->arcnum; i++) {
           int v1,v2;
           scanf("%d,%d",&v1,&v2);
           int n=LocateVex(G, v1);
           int m=LocateVex(G, v2);
           if (m==-1 ||n==-1) {
               printf("no this vertex\n");
               return;
           }
           G->arcs[n][m].adj=1;
           G->arcs[m][n].adj=1;//无向图的二阶矩阵沿主对角线对称
       }
   }
   
   int FirstAdjVex(MGraph G,int v)
   {
       //查找与数组下标为v的顶点之间有边的顶点，返回它在数组中的下标
       for(int i = 0; i<G.vexnum; i++){
           if( G.arcs[v][i].adj ){
               return i;
           }
       }
       return -1;
   }
   int NextAdjVex(MGraph G,int v,int w)
   {
       //从前一个访问位置w的下一个位置开始，查找之间有边的顶点
       for(int i = w+1; i<G.vexnum; i++){
           if(G.arcs[v][i].adj){
               return i;
           }
       }
       return -1;
   }
   //操作顶点的函数
   void visitVex(MGraph G, int v){
       printf("%d ",G.vexs[v]);
   }
   //初始化队列
   void InitQueue(Queue ** Q){
       (*Q)=(Queue*)malloc(sizeof(Queue));
       (*Q)->next=NULL;
   }
   //顶点元素v进队列
   void EnQueue(Queue **Q,VertexType v){
       Queue * element=(Queue*)malloc(sizeof(Queue));
       element->data=v;
       Queue * temp=(*Q);
       while (temp->next!=NULL) {
           temp=temp->next;
       }
       temp->next=element;
   }
   //队头元素出队列
   void DeQueue(Queue **Q,int *u){
       (*u)=(*Q)->next->data;
       (*Q)->next=(*Q)->next->next;
   }
   //判断队列是否为空
   bool QueueEmpty(Queue *Q){
       if (Q->next==NULL) {
           return true;
       }
       return false;
   }
   //广度优先搜索
   void BFSTraverse(MGraph G){//
       int v;
       //将用做标记的visit数组初始化为false
       for( v = 0; v < G.vexnum; ++v){
           visited[v] = false;
       }
       //对于每个标记为false的顶点调用深度优先搜索函数
       Queue * Q;
       InitQueue(&Q);
       for( v = 0; v < G.vexnum; v++){
           if(!visited[v]){
               visited[v]=true;
               visitVex(G, v);
               EnQueue(&Q, G.vexs[v]);
               while (!QueueEmpty(Q)) {
                   int u;
                   DeQueue(&Q, &u);
                   u=LocateVex(&G, u);
                   for (int w=FirstAdjVex(G, u); w>=0; w=NextAdjVex(G, u, w)) {
                       if (!visited[w]) {
                           visited[w]=true;
                           visitVex(G, w);
                           EnQueue(&Q, G.vexs[w]);
                       }
                   }
               }
           }
       }
   }
   int main() {
       MGraph G;//建立一个图的变量
       CreateDN(&G);//初始化图
       BFSTraverse(G);//广度优先搜索图
       return 0;
   }
   ```

==总结==

深度优先搜索算法的实现运用的主要是回溯法，类似于树的先序遍历算法。广度优先搜索算法借助队列的先进先出的特点，类似于树的层次遍历。

>   最小生成树和最短路径

#### 最小生成树

什么是最小生成树呢？在弄清什么是最小生成树之前，我们需要弄清什么是生成树？

用一句语简单概括生成树就是：生成树是将图中所有顶点以最少的边连通的子图。

比如图(g)可以同时得到两个生成树图(h)和图(i)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713092048754.png) ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713092055628.png) 

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713092107112.png) 

知道了什么是生成树之后，我们就很容易理解什么是最小生成树了。所谓最小生成树，用一句话总结就是：权值和最小的生成树就是最小生成树。

比如上图中的两个生成树，生成树1和生成树2，生成树1的权值和为：12，生成树2的权值为：14，我们可以证明图(h)生成树1就是图(g)的最小生成树。

那么如何构造最小生成树呢？可以使用普里姆算法、克鲁斯卡尔算法

#### 最短路径

求最短路径也就是求最短路径长度。下面是一个带权值的有向图，表格中分别列出了顶点V1其它各顶点的最短路径长度。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210713092142541.png)

| 源点 | 最短路径       | 终点 |      | 路径长度 |
| ---- | -------------- | ---- | ---- | -------- |
| V1   | V1，V3，V2     | V2   | 中转 | 5        |
| V1   | V1，V3         | V3   | 直达 | 3        |
| V1   | V1，V3，V2，V4 | V4   | 中转 | 10       |
| V1   | V1，V3，V5     | V5   | 中转 | 18       |

表：顶点V1到其它各顶点的最短路径表

从图中可以看出，顶点V1到V4的路径有3条(V1，V2，V4)，(V1，V4)，(V1，V3，V2，V4)，其路径长度分别为15，20和10，因此，V1到V4的最短路径为(V1，V3，V2，V4)。

那么如何求带权有向图的最短路径长度呢？可以使用迪杰斯特拉(Dijkstra)算法。