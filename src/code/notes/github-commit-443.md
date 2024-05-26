---
order: 1
title: GitHub提交代码443
date: 2020-04-07
category: 杂记
tag: 杂记
timeline: true
article: true
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
取消git全局代理：
git config --global --unset http.proxy
 
git config --global --unset https.proxy

或者
#将url中的https更换成git即可
```