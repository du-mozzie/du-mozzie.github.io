---
order: 1
title: 数据加载
date: 2025-05-30
category: RAG
tag: RAG
timeline: true
article: true
---

# 数据加载

RAG 系统中，数据加载是整个流水线的第一步，也是不可或缺的一步。文档加载器负责将各种格式的非结构化文档（如PDF、Word、Markdown、HTML等）转换为程序可以处理的结构化数据。数据加载的质量会直接影响后续的索引构建、检索效果和最终的生成质量。

**主流的RAG 数据加载工具**：

| 工具名称 | 特点 | 适用场景 | 性能表现 |
| :--- | :--- | :--- | :--- |
| PyMuPDF4LLM | PDF→Markdown转换，OCR+表格识别 | 科研文献、技术手册 | 开源免费，GPU加速 |
| TextLoader | 基础文本文件加载 | 纯文本处理 | 轻量高效 |
| DirectoryLoader | 批量目录文件处理 | 混合格式文档库 | 支持多格式扩展 |
| Unstructured | 多格式文档解析 | PDF、Word、HTML等 | 统一接口，智能解析 |
| FireCrawlLoader | 网页内容抓取 | 在线文档、新闻 | 实时内容获取 |
| LlamaParse | 深度PDF结构解析 | 法律合同、学术论文 | 解析精度高，商业API |
| Docling | 模块化企业级解析 | 企业合同、报告 | IBM生态兼容 |
| Marker | PDF→Markdown，GPU加速 | 科研文献、书籍 | 专注PDF转换 |
| MinerU | 多模态集成解析 | 学术文献、财务报表 | 集成LayoutLMv3+YOLOv8 |

