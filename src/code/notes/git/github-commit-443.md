---
order: 1
title: GitHub提交代码443
date: 2021-08-17
category: 
    - 杂记
    - Git
tag: 
    - 杂记
    - Git
timeline: true
article: true
prev: ./
---

**提交代码到Github报错**
> fatal: unable to access 'https://github.com/xxx': OpenSSL SSL_read: Connection was reset, errno 10054

解决办法：

```bash
#解除ssl验证后，再次git即可

git config --global http.sslVerify "false"
```

> Failed to connect to github.com port 443:connection timed out

解决办法：

```bash
# 在有vpn的情况下，配置全局代理，socks5和http两种协议由使用的代理软件决定，不同软件对这两种协议的支持有差异，如果不确定可以都尝试一下

# 配置socks5代理
git config --global http.proxy socks5 127.0.0.1:7890
git config --global https.proxy socks5 127.0.0.1:7890

# 配置http代理
git config --global http.proxy 127.0.0.1:7890
git config --global https.proxy 127.0.0.1:7890

# 查看代理
git config --global --get http.proxy
git config --global --get https.proxy

#取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

命令中的主机号（127.0.0.1）是使用的代理的主机号(自己电脑有vpn那么本机可看做访问github的代理主机)，即填入127.0.0.1即可，否则填入代理主机 ip(就是网上找的那个ip)

命令中的端口号（7890）为代理软件(代理软件不显示端口的话，就去Windows中的代理服务器设置中查看)或代理主机的监听IP，可以从代理服务器配置中获得，否则填入网上找的那个端口port 