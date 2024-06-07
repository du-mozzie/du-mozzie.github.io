---
order: 5
title: 事务
date: 2021-08-07
category: MySQL
tag: MySQL
timeline: true
article: true
---

MySQL事务是为确保数据一致性而将多条SQL操作封装成的逻辑工作单元，遵循ACID原则。

## 什么是事务？

　　在人员管理系统中，你删除一个人员，你即需要删除人员的基本资料，也要删除和该人员相关的信息，如信箱，文章等等，这样，这些数据库操作语句就构成一个事务！

## 事务是必须满足4个条件（ACID）

-   **事务的原子性（ Atomicity）：**一组事务，要么成功；要么撤回。
-   **一致性 （Consistency）：**事务执行后，数据库状态与其他业务规则保持一致。如转账业务，无论事务执行成功否，参与转账的两个账号余额之和应该是不变的。
-   **隔离性（Isolation）：**事务独立运行。一个事务处理后的结果，影响了其他事务，那么其他事务会撤回。事务的100%隔离，需要牺牲速度。
-   **持久性（Durability）：**软、硬件崩溃后，InnoDB数据表驱动会利用日志文件重构修改。可靠性和高速度不可兼得， innodb_flush_log_at_trx_commit 选项 决定什么时候吧事务保存到日志里。

## MySQL中的事务

  在默认情况下，MySQL每执行一条SQL语句，都是一个单独的事务。如果需要在一个事务中包含多条SQL语句，那么需要开启事务和结束事务。

- 开启事务：start transaction

- 结束事务：commit或rollback

  在执行SQL语句之前，先执行start transaction，这就开启了一个事务（事务的起点），然后可以去执行多条SQL语句，最后要结束事务，commit表示提交，即事务中的多条SQL语句所作出的影响会持久到数据库中，或者rollback，表示回滚到事务的起点，之前做的所有操作都被撤销了。

```sql
mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   | 1000.00 |
|  2 | ls   | 1000.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)

mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

mysql> UPDATE account SET balance=900 WHERE name = 'zs';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   |  900.00 |
|  2 | ls   | 1000.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)

mysql> UPDATE account SET balance=1100 WHERE name = 'ls';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   |  900.00 |
|  2 | ls   | 1100.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)

mysql> ROLLBACK;
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   | 1000.00 |
|  2 | ls   | 1000.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)

mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

mysql> UPDATE account SET balance=balance-100 WHERE name = 'zs';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   |  900.00 |
|  2 | ls   | 1000.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)

mysql> UPDATE account SET balance=balance+100 WHERE name = 'ls';
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   |  900.00 |
|  2 | ls   | 1100.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)

mysql> commit;
Query OK, 0 rows affected (0.02 sec)

mysql> SELECT * FROM account;
+----+------+---------+
| id | NAME | balance |
+----+------+---------+
|  1 | zs   |  900.00 |
|  2 | ls   | 1100.00 |
|  3 | ww   | 1000.00 |
+----+------+---------+
3 rows in set (0.00 sec)
```

## JDBC事务

在JDBC中处理事务，都是通过Connection完成的。

**同一事务中所有的操作，都在使用同一个Connection对象。**

①JDBC中的事务   

Connection的三个方法与事务有关：

-   setAutoCommit（boolean）:设置是否为自动提交事务，如果true（默认值为true）表示自动提交，也就是每条执行的SQL语句都是一个单独的事务，如果设置为false，那么相当于开启了事务了；**con.setAutoCommit(false) 表示开启事务。**
-   **commit（）：提交结束事务。**
-   **rollback（）：回滚结束事务。**

**JDBC处理事务的代码格式：**

```java
try{
     con.setAutoCommit(false);//开启事务
     ......
     con.commit();//try的最后提交事务      
} catch（） {
    con.rollback();//回滚事务
}
```

示例：

```java
public class AccountDao {
    /*
    * 修改指定用户的余额
    * */
    public void updateBalance(Connection con, String name,double balance) {
        try {
            String sql = "UPDATE account SET balance=balance+? WHERE name=?";
            PreparedStatement pstmt = con.prepareStatement(sql);
            pstmt.setDouble(1,balance);
            pstmt.setString(2,name);
            pstmt.executeUpdate();
        }catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

```java
import cn.itcast.jdbc.JdbcUtils;
import org.junit.Test;
import java.sql.Connection;
import java.sql.SQLException;

public class Demo1 {
    /*
    * 演示转账方法
    * 所有对Connect的操作都在Service层进行的处理
    * 把所有connection的操作隐藏起来，这需要使用自定义的小工具（day19_1）
    * */
    public void transferAccounts(String from,String to,double money) {
        //对事务的操作
        Connection con = null;
        try{
            con = JdbcUtils.getConnection();
            con.setAutoCommit(false);
            AccountDao dao = new AccountDao();
            dao.updateBalance(con,from,-money);//给from减去相应金额
            if (true){
                throw new RuntimeException("不好意思，转账失败");
            }
            dao.updateBalance(con,to,+money);//给to加上相应金额
            //提交事务
            con.commit();

        } catch (Exception e) {
            try {
                con.rollback();
            } catch (SQLException e1) {
                e.printStackTrace();
            }
            throw new RuntimeException(e);
        }
    }
    @Test
    public void fun1() {
        transferAccounts("zs","ls",100);
    }
}
```

五、事务隔离级别

1、事务的并发读问题

-   脏读：读取到另外一个事务未提交数据（不允许出来的事）；
-   不可重复读：两次读取不一致；
-   幻读（虚读）：读到另一事务已提交数据。

2、并发事务问题

因为并发事务导致的问题大致有5类，其中两类是更新问题三类是读问题。

-   **脏读（dirty read）：读到另一个事务的未提交新数据，即读取到了脏数据；**
-   **不可重复读（unrepeatable）：对同一记录的两次读取不一致，因为另一事务对该记录做了修改；**
-   **幻读（虚读）（phantom read）：对同一张表的两次查询不一致，因为另一事务插入了一条记录。**

3、四大隔离级别

  4个等级的事务隔离级别，在相同的数据环境下，使用相同的输入，执行相同的工作，根据不同的隔离级别，可以导致不同的结果。不同事务隔离级别能够解决的数据并发问题的能力是不同的。

1、SERIALIZABLE(串行化)

-   不会出现任何并发问题，因为它是对同一数据的访问是串行的，非并发访问的；
-   性能最差

**2、REPEATABLE READ(可重复读)（MySQL）**

-   **防止脏读和不可重复读，不能处理幻读**
-   **性能比SERIALIZABLE好**

**3、READ COMMITTED(读已提交数据)（Oracle）**

-   **防止脏读，不能处理不可重复读和幻读；**
-   **性能比REPEATABLE READ好**

4、READ UNCOMMITTED(读未提交数据)

-   可能出现任何事物并发问题，什么都不处理。
-   性能最好

六、MySQL隔离级别

MySQL的默认隔离级别为Repeatable read,可以通过下面语句查看：

>   SELECT @@`TX_ISOLATION`;

也可以通过下面语句来设置当前连接的隔离级别：

>   SET TRANSACTION ISOLATION LEVEL REPEATABLE READ ;//[4选1]

七、JDBC设置隔离级别

con.setTransactionIsolation(int level) :参数可选值如下：

-   Connection.TRANSACTION_READ_UNCOMMITTED；
-   Connection.TRANSACTION_READ_COMMITTED；
-   Connection.TRANSACTION_REPEATABLE_READ；
-   Connection.TRANSACTION_READ_SERIALIZABLE。
