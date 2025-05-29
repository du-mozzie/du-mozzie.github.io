---
order: 2
title: RAG知识库
date: 2025-05-28
category: 大模型开发
tag: 大模型开发
timeline: true
article: true
---

开发一个自己的RAG知识库

## 什么是RAG

RAG（retrieval-augmented generation）直译为检索增强生成，简单来说就是增强大模型的能力，让大模型可以检索用户提供的文本资料，而不需要每次都将这些文本资料通过token传递给大模型。

主要使用的计算是嵌入大模型，将用户上传的文本资料进行文件切割、打标最后转为向量数据存储在向量数据库，进行提问的时候去向量数据库进行检索，这样问的信息能够更加正确，并且可以让大模型读取到公司内部的资料。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202505281809286.jpg)

本教程使用的嵌入模型是[nomic-embed-text](https://ollama.com/library/nomic-embed-text)，使用ollama可以一键安装

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202505291107693.png" style="zoom:70%;" />

使用[Spring AI对接大模型](https://spring.io/projects/spring-ai)

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202505291110739.png" style="zoom:67%;" />

