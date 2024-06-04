---
order: 1
title: Docker安装MySQL
date: 2021-08-01
category: MySQL
tag: MySQL
timeline: true
article: true
prev: ./
---

# Docker安装MySQL

Docker安装MySQL笔记

```bash
# 创建挂载文件夹
mkdir -p /export/server/mysql/conf /export/server/mysql/data /export/server/mysql/logs

# 拉取镜像
docker pull mysql:8.0.29

# 修改配置
vim /export/server/mysql/conf/my.cnf

[client]
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
init_connect='SET collation_connection = utf8_unicode_ci'
init_connect='SET NAMES utf8' 
character-set-server=utf8
collation-server=utf8_unicode_ci
skip-character-set-client-handshake
skip-name-resolve

# 启动容器
docker run --restart=always --privileged=true -d \
-p 3302:3306 --name mysql-master \
-v /export/server/mysql/logs:/var/log/mysql \
-v /export/server/mysql/data:/var/lib/mysql \
-v /export/server/mysql/conf:/etc/mysql \
-v/export/server/mysql/conf/my.cnf:/etc/mysql/my.cnf \
-e MYSQL_ROOT_PASSWORD=dyj0129.. \
mysql:8.0.29

#  参数说明：
#  --restart=always： 当Docker 重启时，容器会自动启动。
#  --privileged=true：容器内的root拥有真正root权限，否则容器内root只是外部普通用户权限
```

如果是云服务器需要开放端口