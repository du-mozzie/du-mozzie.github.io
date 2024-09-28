---
order: 6
title: 索引
date: 2021-08-10
category: MySQL
tag: MySQL
timeline: true
article: true
---

MySQL索引是一种数据结构（主要为B-Tree），用于加速数据检索。它通过创建表中一列或多列值的排序列表，并存储指向实际数据行的指针，实现对数据的快速定位，从而大幅提高查询效率。索引支持不同类型，如主键索引、唯一索引、全文索引等，适用于不同查询场景。合理使用索引可优化数据库性能，但过度索引会增加存储负担并可能减慢写操作。

## 什么是索引？(index)

索引是在数据库表的字段上添加的，是为了提高查询效率存在的一种机制。

一张表的一个字段可以添加一个索引，多个字段联合起来也可以添加索引。

索引相当于一本书的目录，是为了缩小扫描范围而存在的一种机制。

对于一本字典来说，查找某个汉字有两种方式：

​		第一种方式：一页一页挨着找，直到找到为止，这种查方式属于全字典扫描，效率比较低.

​		第二种方式：先通过目录(索引)去定位-一个大概的位置，然后直接定位到这个位置，做局域性扫描，缩小扫描的范围，快速的查找，这种查找方式属于通过索引检索，效率较高。

MySQL在查询方面主要就是两种方式：

​	第一种方式：全表扫描

​	第二种方式：根据索引检索

`使用的时候需要排序，因为只有排序了，才会有区间，缩小范围就是扫描某个区间`

在mysql数据库当中索引也是需要排序的，并且这个索引的排序和TreeSet数据结构相。TreeSet(TreeMap)底层是一个自平衡的二叉树！在MySQL当中索引是一个B-Tree数据结构。遵循左小右大原则存放，采用中序遍历方式遍历数据

## 索引命名规则

1. 使用下划线"_"而不是驼峰命名法。因为索引会被转换为文件系统中的文件名,而文件系统是区分大小写的,所以下划线命名更易于区分。例如:user_name而不是userName。2. 对多列索引,使用下划线"_"连接各列名。例如:

```sql
CREATE INDEX user_name_age_idx ON user (name, age);
```

3. 对索引增加前缀"idx_",以便于识别。例如:

```sql
CREATE INDEX idx_user_name ON user (name);
```

4. 如果是UNIQUE索引,使用"unq_"作为前缀。例如:

```sql
CREATE UNIQUE INDEX unq_user_email ON user (email);
```

5. 如果是FULLTEXT索引,使用"ft_"作为前缀。例如:

```sql
CREATE FULLTEXT INDEX ft_page_content ON page (content); 
```

6. 对主键使用"pk_"作为前缀。例如:

```sql
CREATE INDEX pk_user_id ON user (id);  
```

7. 如果索引仅用于加速查询而不是唯一性检查或键定义,则使用"idx_"前缀。例如:

```sql
CREATE INDEX idx_user_age ON user (age); 
```

8. 对Foreign Key约束索引使用"fk_"前缀,并在索引名中包含相关联表的信息。例如:

```sql
CREATE INDEX fk_album_artist_id ON album (artist_id);
```

9. 如果索引是多列的,那么每列使用下划线"_",并给最后一列添加"_idx"后缀。例如:

```sql
CREATE INDEX user_first_name_last_name_idx ON user (first_name, last_name);  
```

10. 对可分区表的索引,应在索引名后添加"_p"后缀,以指示索引可分区。例如: 

```sql
CREATE INDEX idx_user_age_p ON user (age) PARTITIONS 32;  
```

总之,MySQL的索引命名规范主要通过为索引名增加各种有意义的前缀和后缀,来识别索引的类型和作用,这有利于索引的管理和维护。

## 索引的实现原理？

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616005605739.png)

1.  在任何数据库当中主键上都会自动添加索引对象，id字段上自动有索引，因为id是PK，在mysql中，一个字段上如果有unique约束的话，也会自动创建索引对象
2.  在任何数据库当中，任何一张表的任何一条记录在硬盘存储上都会有一个硬盘的物理存储编号
3.  在mysql当中，索引是一个单独的对象，不同的存储引擎以不同的形式存在，在MyISAM存储引擎中，索引存储在一个.MYI文件中，在InnoDB存储引擎中索引存储在一个逻辑名称叫作tablespace的当中，在MEMORY存储引擎当中索引被存储在内存当中。不管索引存储在哪，索引在mysql当中都是以一个树的形式存在(自平衡二叉树：B-Tree)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616010324663.png)

**索引的实现原理：就是缩小扫描的范围，避免全表扫描**

## 什么时候加索引？

1.  条件1：数据量庞大（到底有多么庞大算庞大，这个需要测试，因为每一个硬件环境不同）
2.  条件2：该字段经常出现在where的后面，以条件的形式存在，也就是说这个字段总是被扫描。
3.  条件3：该字段很少的DML(insert delete update)操作。（因为DML之后，索引需要重新排序。）

​		建议不要随意添加索引，因为索引也是需要维护的，太多的话反而会降低系统的性能。
​		建议通过主键查询，建议通过unique约束的字段进行查询，效率是比较高的。

**在mysql当中，主键上，以及unique字段上都会自动添加索引**

> 索引创建原则

1. 数据量较大，且查询比较频繁的表
2. 常作为查询条件、排序、分组的字段
3. 字段内容区分度高
4. 内容较长，使用前缀索引
5. 尽量联合索引
6. 要控制索引的数量
7. 如果索引I列不能存储 NULL 值，请在创建表时使用 NOT NULL 约束它

## 索引的使用

创建索引：

```sql
/*给emp表的ename字段添加索引，起名：emp_ename_index
create index 索引名 on 表名(字段名)*/
create index emp_ename_index on emp(ename);
```

删除索引：

```sql
/*将emp表上的emp_ename_index索引对象删除。*/
drop index emp_ename_index on emp;
```

查看一个SQL是否使用了索引进行检索：

```sql
EXPLAIN SELECT * FROM user WHERE name = 'admin';
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616125239712.png)

```sql
/*使用关键字explain*/
EXPLAIN SELECT * FROM user WHERE phone = '12456458532';
```

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616125205987.png)

`返回结果type，ref使用了索引，all查询所有没有使用索引`

### 索引字段的解释

1. id：执行计划中每个操作的唯一标识符。对于一条查询语句，每个操作都有一个唯一的id。但是在多表join的时候，一次explain中的多条记录的id是相同的。
2. select_type：操作的类型。常见的类型包括SIMPLE、PRIMARY、SUBQUERY、UNION等。不同类型的操作会影响查询的执行效率。
3. table：当前操作所涉及的表。
4. partitions：当前操作所涉及的分区。
5. type：表示查询时所使用的索引类型，包括ALL、index、range、ref、eq_ref、const、system等。
6. possible_keys：表示可能被查询优化器选择使用的索引。
7. key：表示查询优化器选择使用的索引。
8. key_len：表示索引的长度。索引的长度越短，查询时的效率越高。
9. ref：用来表示哪些列或常量被用来与key列中命名的索引进行比较。
10. rows：表示此操作需要扫描的行数，即扫描表中多少行才能得到结果。
11. filtered：表示此操作过滤掉的行数占扫描行数的百分比。该值越大，表示查询结果越准确。
12. Extra：表示其他额外的信息，包括Using index、Using filesort、Using temporary等

例如有一张表

```sql
 CREATE TABLE `t2` (          
  `id` INT(11),
  `a` varchar(64) NOT NULL,                                     
  `b` varchar(64) NOT NULL,                        
  `c` varchar(64) NOT NULL,                                
  `d` varchar(64) NOT NULL,                               
  `f` varchar(64) DEFAULT NULL,    
  PRIMARY KEY(id),
  UNIQUE KEY `f` (`f`),                                         
  KEY `idx_abc` (`a`,`b`,`c`)                                       
) ENGINE=InnoDB DEFAULT CHARSET=latin1
```

possible_keys 和 key，possible_keys 表示查询语句中可以使用的索引，而不一定实际使用了这些索引。这个字段列出了可能用于这个查询的所有索引，包括联合索引的组合。而 key 字段表示实际用于查询的索引。如果在查询中使用了索引，则该字段将显示使用的索引名称；

#### type

- system：系统表，少量数据，往往不需要进行磁盘IO
- const：使用常数索引，MySQL 只会在查询时使用常数值进行匹配。
  - explain select * from t2 where f='Hollis';
  - 使用唯一性索引做唯一查询
- eq_ref：唯一索引扫描，只会扫描索引树中的一个匹配行。
  - explain select * from t1 join t2 on t1.id = t2.id where t1.f1 = 's'; 
  - 当在连接操作中使用了唯一索引或主键索引，并且连接条件是基于这些索引的等值条件时，MySQL通常会选择 eq_ref 连接类型，以提高查询性能。
- ref：非唯一索引扫描， 只会扫描索引树中的一部分来查找匹配的行。
  - explain select * from t2 where a = 'Hollis'; 
  - 使用非唯一索引进行查询
- range：范围扫描， 只会扫描索引树中的一个范围来查找匹配的行。
  - explain select * from t2 where a > 'a' and a < 'c';
  - 使用索引进行性范围查询
- index：全索引扫描， 会遍历索引树来查找匹配的行
  - explain select c from t2 where b = 's';
  - 不符合最左前缀匹配的查询
- ALL：全表扫描， 将遍历全表来找到匹配的行。
  - explain select * from t2 where d = "ni";
  - 使用非索引字段查询

以上类型由快到慢：
system> const > eq_ref >ref>range> index >ALL

#### extra

- Using where：表示 MySQL 将在存储引擎检索行后，再进行条件过滤（使用 WHERE 子句）；查询的列未被索引覆盖，where筛选条件非索引的前导列或者where筛选条件非索引列。
  - explain select * from t2 where d = "ni";   非索引字段查询
  - explain select d from t2 where b = "ni";   未索引覆盖，用联合索引的非前导列查询
- Using index：表示 MySQL 使用了覆盖索引（也称为索引覆盖）优化，只需要扫描索引，而无需回到数据表中检索行；
  - explain select b,c from t2 where a = "ni";  索引覆盖
- Using index condition：表示查询在索引上执行了部分条件过滤。这通常和索引下推有关。
  - explain select d from t2 where a = "ni" and b like "s%";   使用到索引下推。
- Using where; Using index：查询的列被索引覆盖，并且where筛选条件是索引列之一，但不是索引的前导列，或者where筛选条件是索引列前导列的一个范围
  - explain select a from t2 where b = "ni";   索引覆盖，但是不符合最左前缀
  - explain select b from t2 where a in ('a','d','sd');   索引覆盖，但是前导列是个范围
- Using join buffer：表示 MySQL 使用了连接缓存；
  - explain select * from t1 join t2 on t1.id = t2.id where a = 's';
- Using temporary：表示 MySQL 创建了临时表来存储查询结果。这通常是在排序或分组时发生的；
  - explain select count(*),b  from t2 group by b; 
- Using filesort：表示 MySQL 将使用文件排序而不是索引排序，这通常发生在无法使用索引来进行排序时；
  - explain select count(*), b  from t2 group by b; 
- Using index for group-by：表示 MySQL 在分组操作中使用了索引。这通常是在分组操作涉及到索引中的所有列时发生的；
- Using filesort for group-by：表示 MySQL 在分组操作中使用了文件排序。这通常发生在无法使用索引进行分组操作时；
- Range checked for each record：表示 MySQL 在使用索引范围查找时，需要检查每一条记录；
- Using index for order by：表示 MySQL 在排序操作中使用了索引，这通常发生在排序涉及到索引中的所有列时；
- Using filesort for order by：表示 MySQL 在排序操作中使用了文件排序，这通常发生在无法使用索引进行排序时；
- Using index for group-by; Using index for order by：表示 MySQL 在分组和排序操作中都使用了索引。

## 索引失效

1. select * from emp where ename like '%T';

   ename上即使添加了索引，也不会走索引，为什么？
   	原因是因为模糊匹配当中以“%”开头了！
   	尽量避免模糊查询的时候以“%”开始。
   	这是一种优化的手段/策略。

2. 使用or的时候会失效，如果使用or那么要求or两边的条件字段都要有
   索引，才会走索引，如果其中一边有一个字段没有索引，那么另一个
   字段上的索引也会实现。所以这就是为什么不建议使用or的原因。

3. 使用复合索引的时候，没有使用左侧的列查找，索引失效
   什么是复合索引？
   两个字段，或者更多的字段联合起来添加一个索引，叫做复合索引。**最左前缀原则**

   ```sql
   CREATE INDEX phone_name_index ON user(phone,name);
   ```

   ```sql
   EXPLAIN SELECT * FROM user WHERE phone = '12456458532';
   ```

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616130742790.png)

   ```sql
   EXPLAIN SELECT * FROM user WHERE name = 'admin';
   ```

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/image-20210616130837019.png)

4. 在where当中索引列参加了运算，索引失效。

5. 字段使用了函数也会失效。

## 总结

索引是各种数据库进行优化的重要手段。优化的时候优先考虑的因素就是索引。

索引在数据库当中分了很多类？
- 单一索引：一个字段上添加索引。
- 复合索引：两个字段或者更多的字段上添加索引。
- 主键索引：主键上添加索引。
- 唯一性索引：具有unique约束的字段上添加索引。

注意：唯一性比较弱的字段上添加索引用处不大。