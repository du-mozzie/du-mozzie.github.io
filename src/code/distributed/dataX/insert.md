---
order: 1
title: 安装DataX
date: 2023-08-11
category: 
    - DataX
    - 分布式
    - 数据同步
tag: 
    - DataX
    - 分布式
    - 数据同步
timeline: true
article: true	
prev: ./
---

## DataX
DataX 是阿里云 DataWorks数据集成 的开源版本，在阿里巴巴集团内被广泛使用的离线数据同步工具/平台。DataX 实现了包括 MySQL、Oracle、OceanBase、SqlServer、Postgre、HDFS、Hive、ADS、HBase、TableStore(OTS)、MaxCompute(ODPS)、Hologres、DRDS, databend 等各种异构数据源之间高效的数据同步功能。

DataX Web是在DataX之上开发的分布式数据同步工具，提供简单易用的 操作界面，降低用户使用DataX的学习成本，缩短任务配置时间，避免配置过程中出错。用户可通过页面选择数据源即可创建数据同步任务，支持RDBMS、Hive、HBase、ClickHouse、MongoDB等数据源，RDBMS数据源可批量创建数据同步任务，支持实时查看数据同步进度及日志并提供终止同步功能，集成并二次开发xxl-job可根据时间、自增主键增量同步数据。

**DataX是基于查询的数据同步，还有一种基于biglog的数据同步Canal**

[Datax3.0+DataX-Web打造分布式可视化ETL系统](https://www.modb.pro/db/466999)

## 安装DataX-Web

[安装文档](https://github.com/WeiYe-Jing/datax-web/blob/master/doc/datax-web/datax-web-deploy.md)

**前置环境：**

- MySQL (5.5+) 必选，对应客户端可以选装, Linux服务上若安装mysql的客户端可以通过部署脚本快速初始化数据库
- JDK (1.8.0_xxx) 必选
- Maven (3.6.1+) 可选（手动编译项目需要）
- DataX 必选
- Python (2.x) (支持Python3需要修改替换datax/bin下面的三个python文件，替换文件在doc/datax-web/datax-python3下) 必选，主要用于调度执行底层DataX的启动脚本，默认的方式是以Java子进程方式执行DataX，用户可以选择以Python方式来做自定义的改造**，（推荐2.6.x）**

[基础软件安装教程](https://github.com/WeiYe-Jing/datax-web/blob/master/doc/datax-web/datax-web-deploy-V2.1.1.md)

### Python离线安装

1. 下载python 2.6.2 上传到服务器

https://www.python.org/downloads/release/python-266/

1. 解压 tar xvf Python-2.6.6.tgz
2. 配置并且要指定安装的路径

```bash
cd Python-2.6.6
./configure --prefix=/data/staryea/tools/Python-2.6.6   #这里prefix的含义是，安装之后的python路径放在指定目录里。
```

1. 编译 make & make install
2. 创建软连接

```bash
ln -s /data/staryea/tools/python-2.6.6/python /usr/bin/python
```

### DataX离线安装

1. 下载DataX并上传到服务器

http://datax-opensource.oss-cn-hangzhou.aliyuncs.com/datax.tar.gz

1. 解压 tar -zxf datax.tar.gz
2. 验证是否安装成功

```bash
# 进入安装目录
cd datax/bin
python datax.py -r streamreader -w streamwriter
```

出现一下内容证明安装成功

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1697091131236-62c4081d-bd0b-4938-94f9-c8df0aee197d.png)

1. 需要删除文件

```bash
# 当未删除时，可能会输出：[datax/plugin/reader/._drdsreader/plugin.json] 不存在. 请检查您的配置文件.
rm -rf ../plugin/*/._*	
```

[DataX操作](https://mp.weixin.qq.com/s/_ZXqA3H__Kwk-9O-9dKyOQ)

[全量同步多个MySQL数据库](https://cloud.tencent.com/developer/article/2252120)

### DataX-Web 离线安装

[参考官方教程](https://github.com/WeiYe-Jing/datax-web/blob/master/doc/datax-web/datax-web-deploy.md)

[分布式数据同步工具之DataX Web的基本使用](https://blog.csdn.net/qq_38628046/article/details/124769355)