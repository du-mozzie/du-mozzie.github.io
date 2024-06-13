import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as t,c as a,h as n}from"./app-CW8GPC8W.js";const i={},o=n('<p>MySQL存储引擎是管理数据表的底层软件组件，决定数据的存储格式、索引方式、锁定水平及并发控制等，直接影响数据库性能与功能。MySQL支持多种存储引擎，每张表可以选择最适合其需求的引擎。</p><h2 id="什么是引擎" tabindex="-1"><a class="header-anchor" href="#什么是引擎"><span>什么是引擎</span></a></h2><p>存储引擎说白了就是如何存储数据、如何为存储的数据建立索引和如何更新、查询数据等技术的实现方法。因为在关系数据库中数据的存储是以表的形式存储的，所以存储引擎也可以称为表类型（即存储和操作此表的类型）。 在Oracle 和SQL Server等数据库中只有一种存储引擎，所有数据存储管理机制都是一样的。而MySql数据库提供了多种存储引擎。用户可以根据不同的需求为数据表选择不同的存储引擎，用户也可以根据自己的需要编写自己的存储引擎。</p><p>mysql 有多种存储引擎，目前常用的是 MyISAM 和 InnoDB 这两个引擎，除了这两个引擎以外还有许多其他引擎，有官方的，也有一些公司自己研发的。这篇文章主要简单概述一下常用常见的 MySQL 引擎，一则这是面试中常被问到的问题，二则这也是数据库设计中不可忽略的问题，用合适的引擎可以更好的适应业务场景，提高业务效率。</p><h2 id="myisam" tabindex="-1"><a class="header-anchor" href="#myisam"><span>MyISAM</span></a></h2><p>MyISAM 是 mysql 5.5.5 之前的默认引擎，它支持 B-tree/FullText/R-tree 索引类型。</p><p>锁级别为表锁，表锁优点是开销小，加锁快；缺点是锁粒度大，发生锁冲动概率较高，容纳并发能力低，这个引擎适合查询为主的业务。</p><p>此引擎不支持事务，也不支持外键。</p><p>MyISAM 强调了快速读取操作。它存储表的行数，于是 SELECT COUNT (*) FROM TABLE 时只需要直接读取已经保存好的值而不需要进行全表扫描。</p><p>自增的字段可以和其它字段一起建立索引</p><h2 id="innodb" tabindex="-1"><a class="header-anchor" href="#innodb"><span>InnoDB</span></a></h2><p>InnoDB 存储引擎最大的亮点就是支持事务，支持回滚，它支持 Hash/B-tree 索引类型。</p><p>锁级别为行锁，行锁优点是适用于高并发的频繁表修改，高并发是性能优于 MyISAM。缺点是系统消耗较大，索引不仅缓存自身，也缓存数据，相比 MyISAM 需要更大的内存。</p><p>InnoDB 中不保存表的具体行数，也就是说，执行 select count (*) from table 时，InnoDB 要扫描一遍整个表来计算有多少行。</p><p>支持事务，支持外键。</p><p>自增的字段必须包含在索引中</p><p>innodb的数据组织就是按照主键建成的一个B+树，如果没有显示的定义主键，那么innodb会选区一个not null unique key，作为主键，如果还是没有，那么innodb会创建一个 6字节的主键，主键索引到页不是具体的行位置</p><h2 id="acid-事务" tabindex="-1"><a class="header-anchor" href="#acid-事务"><span>ACID 事务</span></a></h2><p>A 事务的原子性 (Atomicity)：指一个事务要么全部执行，要么不执行。也就是说一个事务不可能只执行了一半就停止了。比如你从取款机取钱，这个事务可以分成两个步骤：1）划卡，2）出钱。不可能划了卡，而钱却没出来，这两步必须同时完成，要么就不完成。 C 事务的一致性 (Consistency)：指事务的运行并不改变数据库中数据的一致性。例如，完整性约束了 a+b=10，一个事务改变了 a，那么 b 也应该随之改变。 I 独立性 (Isolation）：事务的独立性也有称作隔离性，是指两个以上的事务不会出现交错执行的状态。因为这样可能会导致数据不一致。 D 持久性 (Durability）：事务的持久性是指事务执行成功以后，该事务所对数据库所作的更改便是持久的保存在数据库之中，不会无缘无故的回滚。</p><h2 id="memory" tabindex="-1"><a class="header-anchor" href="#memory"><span>Memory</span></a></h2><p>Memory 是内存级别存储引擎，数据存储在内存中，所以他能够存储的数据量较小。</p><p>因为内存的特性，存储引擎对数据的一致性支持较差。锁级别为表锁，不支持事务。但访问速度非常快，并且默认使用 hash 索引。</p><p>Memory 存储引擎使用存在内存中的内容来创建表，每个 Memory 表只实际对应一个磁盘文件，在磁盘中表现为.frm 文件。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><figure><img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201103214916470.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>互联网项目中随着硬件成本的降低及缓存、中间件的应用，一般我们选择都以 InnoDB 存储引擎为主，很少再去选择 MyISAM 了。而业务真发展到一定程度时，自带的存储引擎无法满足时，这时公司应该是有实力去自主研发满足自己需求的存储引擎或者购买商用的存储引擎了。</p>',26),r=[o];function p(l,s){return t(),a("div",null,r)}const d=e(i,[["render",p],["__file","storage-engine.html.vue"]]),h=JSON.parse('{"path":"/code/mysql/storage-engine.html","title":"存储引擎","lang":"zh-CN","frontmatter":{"order":4,"title":"存储引擎","date":"2021-08-05T00:00:00.000Z","category":"MySQL","tag":"MySQL","timeline":true,"article":true,"description":"MySQL存储引擎是管理数据表的底层软件组件，决定数据的存储格式、索引方式、锁定水平及并发控制等，直接影响数据库性能与功能。MySQL支持多种存储引擎，每张表可以选择最适合其需求的引擎。 什么是引擎 存储引擎说白了就是如何存储数据、如何为存储的数据建立索引和如何更新、查询数据等技术的实现方法。因为在关系数据库中数据的存储是以表的形式存储的，所以存储引擎...","head":[["meta",{"property":"og:url","content":"https://du-mozzie.github.io/code/mysql/storage-engine.html"}],["meta",{"property":"og:title","content":"存储引擎"}],["meta",{"property":"og:description","content":"MySQL存储引擎是管理数据表的底层软件组件，决定数据的存储格式、索引方式、锁定水平及并发控制等，直接影响数据库性能与功能。MySQL支持多种存储引擎，每张表可以选择最适合其需求的引擎。 什么是引擎 存储引擎说白了就是如何存储数据、如何为存储的数据建立索引和如何更新、查询数据等技术的实现方法。因为在关系数据库中数据的存储是以表的形式存储的，所以存储引擎..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201103214916470.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-07T02:36:36.000Z"}],["meta",{"property":"article:author","content":"Du"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2021-08-05T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-06-07T02:36:36.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"存储引擎\\",\\"image\\":[\\"https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20201103214916470.png\\"],\\"datePublished\\":\\"2021-08-05T00:00:00.000Z\\",\\"dateModified\\":\\"2024-06-07T02:36:36.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"Du\\",\\"url\\":\\"https://du-mozzie.github.io\\"}]}"]]},"headers":[{"level":2,"title":"什么是引擎","slug":"什么是引擎","link":"#什么是引擎","children":[]},{"level":2,"title":"MyISAM","slug":"myisam","link":"#myisam","children":[]},{"level":2,"title":"InnoDB","slug":"innodb","link":"#innodb","children":[]},{"level":2,"title":"ACID 事务","slug":"acid-事务","link":"#acid-事务","children":[]},{"level":2,"title":"Memory","slug":"memory","link":"#memory","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"createdTime":1717143455000,"updatedTime":1717727796000,"contributors":[{"name":"du","email":"25484255238@qq.com","commits":2}]},"readingTime":{"minutes":4.37,"words":1311},"filePathRelative":"code/mysql/storage-engine.md","localizedDate":"2021年8月5日","excerpt":"<p>MySQL存储引擎是管理数据表的底层软件组件，决定数据的存储格式、索引方式、锁定水平及并发控制等，直接影响数据库性能与功能。MySQL支持多种存储引擎，每张表可以选择最适合其需求的引擎。</p>","autoDesc":true}');export{d as comp,h as data};
