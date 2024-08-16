---
order: 1
title: 安装Elasticsearch
date: 2022-03-15
category: 
    - ElasticSearch
    - 分布式
    - 搜索引擎
tag: 
    - ElasticSearch
    - 分布式
    - 搜索引擎
timeline: true
article: true
prev: ./
---

本文基于 Elasticsearch 7.9.3 的安装教程

## 二进制离线安装

[下载地址](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)

[教程1](https://blog.51cto.com/mfc001/6565303)

[教程2](https://www.51cto.com/article/701727.html)

下面是我用到的一些配置

```properties
# 集群名称，集群中的各节点此名称必须一致
cluster.name: es
# 节点名称，集群中的各节点名称不重复，另一个节点设置为 node-2
node.name: node-1
# 数据文件路径
path.data: /data/tools/elasticsearch-7.9.3/data
# 日志文件路径
path.logs: /data/tools/elasticsearch-7.9.3/logs
# 本机服务器 IP
network.host: 192.168.168.1
network.bind_host: 0.0.0.0
# elasticsearch 访问端口
http.port: 19200
# 集群通信端口
transport.tcp.port: 19300
# 集群中的主机列表 通讯端口 19300
discovery.seed_hosts: ["192.168.168.1:19300","192.168.168.2:19300","192.168.168.1:19300"]
# 设置主节点，这里设置 node-2 为主节点
cluster.initial_master_nodes: ["node-2"]
# 配置以允许多个节点共享相同的数据目录，最大数量，默认为1
node.max_local_storage_nodes: 2

# 启用集群密码验证模块x-pack
xpack.security.enabled: true
xpack.license.self_generated.type: basic
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
# 证书存放的位置
xpack.security.transport.ssl.keystore.path: /data/tools/elasticsearch-7.9.3/config/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: /data/tools/elasticsearch-7.9.3/config/elastic-certificates.p12

# 跨域访问，不添加无法使用head连接es，连接时在http:ip:port/?auth_user=elastic&auth_password=密码
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: Authorization,X-Requested-With,Content-Length,Content-Type

# 禁止 swap，一旦允许内存与磁盘的交换，会引起致命的性能问题
bootstrap.memory_lock: true
# 进制swap需要修改linux配置/etc/security/limits.conf文件
# es启动用户名 soft memlock unlimited
# es启动用户名 hard memlock unlimited
```

默认安装的是一主分片、一副本分片

### 开启集群密码验证

1. 切换到elastsearch的目录下，使用下列命令生成证书，需要分发证书到其他机器

   ```bash
   ./elasticsearch-certutil cert -out ../config/elastic-certificates.p12 -pass ""
   ```

2. 在es启动状态下，设置用户密码，交互式设置密码

   ```bash
   ./elasticsearch-setup-passwords interactive
   ```

### 常见启动报错

1. 不能使用root用户启动

2. 文件描述符限制

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1696923009409-f2d0a809-432c-4be3-9538-ce7426685e4d.png)

   ```bash
   打开 shell 终端，以 root 或具有足够权限的用户身份登录。
   
   打开 /etc/security/limits.conf 文件，这是限制系统资源的配置文件。您可以使用文本编辑器来编辑它，比如使用 nano 或 vim：
   
   sudo vim /etc/security/limits.conf
   在文件的末尾添加以下行，将文件描述符的限制增加到所需的数量（65535）：
   
   *    hard    nofile    65535
   *    soft    nofile    65535
   这些行会将硬限制（hard limit）和软限制（soft limit）都设置为65535，确保 Elasticsearch 进程可以获得足够的文件描述符。
   
   保存并关闭文件。
   
   接下来，打开 /etc/sysctl.conf 文件来配置操作系统的参数。使用以下命令打开它：
   
   sudo vim /etc/sysctl.conf
   在文件末尾添加以下行，以增加操作系统的文件描述符限制：
   
   fs.file-max=65535
   保存并关闭文件。
   
   最后，重新加载 sysctl 配置，以使更改生效：
   sudo sysctl -p
   
   # 修改最大文件打开数，和最大进程数
   sudo vim /etc/security/limits.d/20-nproc.conf
   # 修改资源限制为无限制
   root soft nproc unlimited
   ```

3. 虚拟内存限制

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/1713753909417-540d8d86-3237-44a0-8af0-d041a9692050.png)

   ```bash
   sudo sysctl -w vm.max_map_count=262144
   ```

   **注意：**使用ulimit -Hn查看一下实际文件描述符限制，发现为4096，说明当前继承的是sshd的文件描述符限制，需要修改RLIMIT_NOFILE 修改为 65536

   ```bash
   # 目前没搞懂
   # 切换成root用户 修改这个, 但是之前设置过了
   sudo echo 'vm.max_map_count=655360' >> /etc/sysctl.conf
   ```

### 脚本

启动脚本

   ```bash
   bin/elasticsearch -d
   ```

停止脚本

   ```bash
   #!/bin/bash
     
   # 定义Elasticsearch进程名，可以根据实际安装情况调整
   ELASTICSEARCH_PROC_NAME="Elasticsearch"
   
   # 查找与Elasticsearch进程名匹配的进程ID
   ELASTICSEARCH_PID=$(ps -ef | grep -v grep | grep "$ELASTICSEARCH_PROC_NAME" | awk '{print $2}')
   
   if [[ -z "$ELASTICSEARCH_PID" ]]; then
       echo "Elasticsearch 进程未运行。"
   else
       echo "正在停止 Elasticsearch (PID: $ELASTICSEARCH_PID)…"
   
       # 发送TERM信号以优雅关闭Elasticsearch
       kill -s TERM "$ELASTICSEARCH_PID"
   
       # 等待一段时间以允许进程优雅退出
       sleep 5
   
       # 检查是否已经停止
       if ps -p "$ELASTICSEARCH_PID" > /dev/null; then
           echo "Elasticsearch 在给定时间内未能正常停止。发送 KILL 信号…"
   
           # 如果进程仍未停止，发送KILL信号强制终止
           kill -s KILL "$ELASTICSEARCH_PID"
           sleep 2
   
           if ps -p "$ELASTICSEARCH_PID" > /dev/null; then
               echo "错误：无法停止 Elasticsearch (PID: $ELASTICSEARCH_PID)。请查看日志获取更多信息。"
               exit 1
           fi
       fi
   
       echo "Elasticsearch 已成功停止。"                                                   
   fi                                                                                      
                                                                                           
   exit 0
   ```

## Kibana安装

[安装包](https://www.elastic.co/cn/downloads/past-releases#kibana)

配置

```properties
# Kibana is served by a back end server. This setting specifies the port to use.
server.port: 15601

# Specifies the address to which the Kibana server will bind. IP addresses and host names are both valid values.
# The default is 'localhost', which usually means remote machines will not be able to connect.
# To allow connections from remote users, set this parameter to a non-loopback address.
server.host: "localhost"

# Enables you to specify a path to mount Kibana at if you are running behind a proxy.
# Use the `server.rewriteBasePath` setting to tell Kibana if it should remove the basePath
# from requests it receives, and to prevent a deprecation warning at startup.
# This setting cannot end in a slash.
#server.basePath: ""

# Specifies whether Kibana should rewrite requests that are prefixed with
# `server.basePath` or require that they are rewritten by your reverse proxy.
# This setting was effectively always `false` before Kibana 6.3 and will
# default to `true` starting in Kibana 7.0.
#server.rewriteBasePath: false

# The maximum payload size in bytes for incoming server requests.
#server.maxPayloadBytes: 1048576

# The Kibana server's name.  This is used for display purposes.
#server.name: "your-hostname"

# The URLs of the Elasticsearch instances to use for all your queries.
elasticsearch.hosts: ["http://192.168.168.1:19200","http://192.168.168.2:19200","http://192.168.168.3:19200"]

# When this setting's value is true Kibana uses the hostname specified in the server.host
# setting. When the value of this setting is false, Kibana uses the hostname of the host
# that connects to this Kibana instance.
#elasticsearch.preserveHost: true

# Kibana uses an index in Elasticsearch to store saved searches, visualizations and
# dashboards. Kibana creates a new index if the index doesn't already exist.
kibana.index: ".kibana"

# The default application to load.
#kibana.defaultAppId: "home"

# If your Elasticsearch is protected with basic authentication, these settings provide
# the username and password that the Kibana server uses to perform maintenance on the Kibana
# index at startup. Your Kibana users still need to authenticate with Elasticsearch, which
# is proxied through the Kibana server.
elasticsearch.username: "elastic"
elasticsearch.password: "123456"

# Enables SSL and paths to the PEM-format SSL certificate and SSL key files, respectively.
# These settings enable SSL for outgoing requests from the Kibana server to the browser.
#server.ssl.enabled: false
#server.ssl.certificate: /path/to/your/server.crt
#server.ssl.key: /path/to/your/server.key

# Optional settings that provide the paths to the PEM-format SSL certificate and key files.
# These files are used to verify the identity of Kibana to Elasticsearch and are required when
# xpack.security.http.ssl.client_authentication in Elasticsearch is set to required.
#elasticsearch.ssl.certificate: /path/to/your/client.crt
#elasticsearch.ssl.key: /path/to/your/client.key

# Optional setting that enables you to specify a path to the PEM file for the certificate
# authority for your Elasticsearch instance.
#elasticsearch.ssl.certificateAuthorities: [ "/path/to/your/CA.pem" ]

# To disregard the validity of SSL certificates, change this setting's value to 'none'.
#elasticsearch.ssl.verificationMode: full

# Time in milliseconds to wait for Elasticsearch to respond to pings. Defaults to the value of
# the elasticsearch.requestTimeout setting.
#elasticsearch.pingTimeout: 1500

# Time in milliseconds to wait for responses from the back end or Elasticsearch. This value
# must be a positive integer.
#elasticsearch.requestTimeout: 30000

# List of Kibana client-side headers to send to Elasticsearch. To send *no* client-side
# headers, set this value to [] (an empty list).
#elasticsearch.requestHeadersWhitelist: [ authorization ]

# Header names and values that are sent to Elasticsearch. Any custom headers cannot be overwritten
# by client-side headers, regardless of the elasticsearch.requestHeadersWhitelist configuration.
#elasticsearch.customHeaders: {}

# Time in milliseconds for Elasticsearch to wait for responses from shards. Set to 0 to disable.
#elasticsearch.shardTimeout: 30000

# Time in milliseconds to wait for Elasticsearch at Kibana startup before retrying.
#elasticsearch.startupTimeout: 5000

# Logs queries sent to Elasticsearch. Requires logging.verbose set to true.
#elasticsearch.logQueries: false

# Specifies the path where Kibana creates the process ID file.
pid.file: /data/tools/es/kibana-7.9.3-linux-x86_64/kibana.pid

# Enables you to specify a file where Kibana stores log output.
#logging.dest: stdout

# Set the value of this setting to true to suppress all logging output.
#logging.silent: false

# Set the value of this setting to true to suppress all logging output other than error messages.
#logging.quiet: false

# Set the value of this setting to true to log all events, including system usage information
# and all requests.
#logging.verbose: false

# Set the interval in milliseconds to sample system and process performance
# metrics. Minimum is 100ms. Defaults to 5000.
#ops.interval: 5000

# Specifies locale to be used for all localizable strings, dates and number formats.
# Supported languages are the following: English - en , by default , Chinese - zh-CN .
i18n.locale: "zh-CN"
```

启动脚本：需要先在kibana目录下创建一个logs文件夹，脚本放在kibana目录下

```bash
basepath=$(cd `dirname $0`; pwd)
nohup $basepath/bin/kibana > $basepath/logs/start.log 2>&1 &
```

停止脚本

```bash
# 在配置文件中配置了kibana的pid，要停止直接杀死对应的pid就行了
kill -9 `cat kibana.pid`
```

### kibana插件

插件基本上安装都是同一个流程

以metricbeat插件为例

1. 下载插件，如果服务器不能联网，可以选择手动下载并上传

   ```bash
   curl -L -O https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-7.9.3-linux-x86_64.tar.gz
   ```

2. 解压插件

   ```bash
   tar xzvf metricbeat-7.9.3-linux-x86_64.tar.gz
   ```

3. 修改配置，进入插件目录`cd metricbeat-7.9.3-linux-x86_64`

   metricbeat.yml（插件名称.yml）

   ```bash
   output.elasticsearch:
     hosts: ["<es_url>"]
     username: "elastic"
     password: "<password>"
   setup.kibana:
     host: "<kibana_url>"
   ```

4. 启用模块`./metricbeat modules enable system`

5. 初始化插件`./metricbeat setup`

6. 启动插件`./metricbeat -e`

启动脚本

```bash
# 根据实际修改为插件名称
basepath=$(cd `dirname $0`; pwd)
nohup $basepath/metricbeat -e > $basepath/logs/start.log 2>&1 &
```

停止脚本

```bash
PROCESS_NAME='heartbeat'
PROCESS_PIDS=$(ps -ef | grep -v grep | grep "$PROCESS_NAME" | awk '{print $2}')

for PID in $PROCESS_PIDS; do
    kill "$PID"
done
```

插件安装的基本流程如上，个别插件略有差异，具体以kibana提供的文档为准