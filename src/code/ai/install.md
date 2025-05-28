---
order: 1
title: 本地部署DeepSeek
date: 2025-03-03
category: 大模型开发
tag: 大模型开发
timeline: true
article: true
---

本地部署 DeepSeek 教程

## 为什么要本地部署

1. **省钱省心**：本地部署模型，前期买个好设备，后面用起来基本不用花钱。不用像用云端模型那样，老是担心费用问题，想怎么用就怎么用，经济上轻松不少。
2. **数据更安全**：现在数据安全很重要，尤其是公司的一些敏感数据。如果用云端模型，数据要上传到服务器，万一泄露就麻烦了。本地部署就不用担心这个，数据都在自己手里，处理敏感数据也放心，企业的隐私保护更有保障。
3. **说话更自由**：云端模型有很多内容限制，有些敏感话题不能聊，回答也受约束。本地部署的模型就自由多了，能更纯粹地根据数据和算法来回答问题，不过大家还是要自觉遵守道德和法律。
4. **随时随地用**：本地部署的模型不用联网，不管是在办公室、家里还是外出，只要有设备，随时都能用。不用担心网络不好或者断网，24 小时都能服务，特别方便。
5. **量身定制**：有些云端知识库服务，要么担心数据泄露，要么太贵，还不能完全满足自己的需求。本地部署后，可以用自己的数据来训练模型，打造专属的知识库，让它更懂特定领域，比如编程、法律这些，回答问题更精准，效果提升很明显。
6. **用着更顺手**：云端模型用的人多了，可能会卡顿、延迟，体验不好。本地部署的模型能充分利用自己的硬件，像电脑的 CPU、GPU，处理速度快，没有网络延迟，用起来特别顺畅，效率也高不少。

## DeepSeek 的满血版和蒸馏版本

**满血版**：DeepSeek 大模型满血版是指在训练和部署过程中，没有对模型的参数规模、计算资源等进行限制，能够充分发挥其全部性能和潜力的版本。它代表了该大模型在当前技术条件和资源支持下所能达到的最高水平，但是往往来说我们个人电脑的硬件配置是不支持部署满血版的。

**蒸馏版**：知识蒸馏是一种模型压缩方法。简单来说，就是用一个大型的、复杂的预训练模型（满血版）来指导一个小型的、结构更简单的模型（蒸馏版）的训练过程，在保持一定的性能的同时降低对设备硬件配置的要求。蒸馏版本的参数量从 `1.5B` 到 `70B` 不等，比如以下几种变体：

- DeepSeek-R1-Distill-Qwen-1.5B
- DeepSeek-R1-Distill-Qwen-7B
- DeepSeek-R1-Distill-Qwen-14B
- DeepSeek-R1-Distill-Qwen-32B
- DeepSeek-R1-Distill-Llama-8B
- DeepSeek-R1-Distill-Llama-70B

DeepSeek - R1 是主模型的名称。“Distill” 在中文里是 “蒸馏” 的意思，表明这是经过蒸馏处理的模型版本。其后跟随的名称则表明了该蒸馏模型的来源。例如，“DeepSeek - R1 - Distill - Qwen - 32B” 表示它是基于阿里巴巴的开源大模型千问（Qwen）蒸馏得到的版本。

最后的参数量（如 671B、32B、1.5B）代表模型中可训练参数的数量，其中 “B” 是 “Billion”（十亿）的缩写。也就是说，671B、32B、1.5B 分别表示模型的参数量为 6710 亿、320 亿和 15 亿。一般来说，参数量越大，模型的表达能力和复杂度越高，但相应地，对硬件资源的需求也会更高。

下面有张 DeepSeek 官网的测试报告，可以发现 32B 蒸馏版和满血版其实相差也不是很大。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032106493.jpg)

## 通过 Ollama 本地部署 DeepSeek

在 DeepSeek 官方 Github 仓库也给出了部署教程(https://github.com/deepseek-ai/DeepSeek-R1?tab=readme-ov-file#6-how-to-run-locally)

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032113546.png)

### Ollama部署

DeepSeek 官方的部署教程还是比较麻烦，目前市面上主流的还是通过 Ollama（https://ollama.com/）去进行部署

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032116926.png)

Ollama 是一个允许用户在本地运行大型语言模型的平台。

**主要功能和模型**：它支持运行多个大型语言模型，如 Llama 3.3、DeepSeek - R1、Phi - 4、Mistral 和 Gemma 2。这为用户提供了多种选择，可根据他们的具体需求和偏好进行挑选。

**可用性和平台**：Ollama 适用于 macOS、Linux 、Windows 和 Docker 容器，安装十分的便捷。

#### 部署步骤

1. 选择自己对应的平台下载 Ollama，我这边是 Windows，就直接下载了exe文件

2. 安装 Ollama，这里有一点还挺重要的，Ollama 默认是安装在C盘的，后续的模型也是安装到C盘。如果要安装到其他目录，需要使用cmd安装，指定安装目录。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032126417.png)

   执行命令之后就会安装到指定的目录

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032127942.png)

3. 安装成功后 Ollama 会监听我们的 11434 端口。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032128250.png)

### 安装大模型

在 Ollama（https://ollama.com/search）的官网可以看到它支持安装多种模型，并且支持 Embedding（嵌入大模型）后续需要用到 RAG 技术的时候我们可以部署自己的 Embedding 来将我们的知识库转为向量数据

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032131698.png)

选择 DeepSeek-R1 模型（https://ollama.com/library/deepseek-r1）

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032136901.png)

Ollama 提供了多种蒸馏的模型让我们部署，我们可以根据自己的硬件配置选择合适的，如果不知道怎么选择可以把自己电脑的硬件配置（CPU、显卡，显存、内存）告诉 DeepSeek 让它帮你挑选一个合适的（在任务管理器可以看到大部分的硬件配置，如果有一些没有可以搜索一下如何查看）

我这边根据我的配置选择的是 deepseek-r1:7b，在控制台执行对应的命令安装即可。

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032141877.png)

下载完成后可以直接在命令行运行：

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032210048.png)

目前我们就在本地安装好了一个自己的本地大模型，但是这种方式需要通过控制台终端交互，体验不是很好，我们可以安装一些AI工具，给大家推荐几款都可以试一试：

- **AnythingLLM**：https://anythingllm.com/，支持Agent、向量数据库和代理配置，并且可以配置不同的工作区，工作区可以共享文档，但工作区之间的内容不会互相干扰或污染，可以保持每个工作区的上下文清晰，功能强大。
- **Chatbox**：https://chatboxai.app/zh，支持包括 Ollama 在内的多种主流模型的 API 接入，无论是本地部署的模型，还是其他服务提供商的模型，都能轻松连接。
- **Cherry Studio**：https://cherry-ai.com/，支持多个LLM提供商，可在 Windows、Mac 和 Linux 上使用，提供直观的可视化界面和远程 API 接口，旨在降低对本地硬件的依赖，提升使用效率。
- **Dify**：https://dify.ai/，支持工作流，Dify 是一款开源的大语言模型(LLM) 应用开发平台。它融合了后端即服务（Backend as Service）和 [LLMOps](https://docs.dify.ai/zh-hans/learn-more/extended-reading/what-is-llmops) 的理念，使开发者可以快速搭建生产级的生成式 AI 应用。即使你是非技术人员，也能参与到 AI 应用的定义和数据运营过程中。

我自己是安装了 AnythingLLM，另外几个大家也可以去试一试，有好的客户端也可以分享一下。

### 安装客户端工具

1. 安装好之后选择 Ollama 模型，AnythingLLM 会自己试别我们本地的大模型

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032213376.png)

2. 然后进来就是一些引导话术，随便填一下就行

3. 然后他让我们输入一个 Workspace（工作区）的名字，设置完成就可以使用了

4. 我们问一个问题，正常配置了自己本地的大模型可以听到自己电脑风扇轰轰的转起来了🤣🤣

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032219804.png)

5. 如果没有选择对也可以到设置里面去修改一下。

   ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202503032220721.png)

**Ollama命令大全**：

| 命令                                            | 描述                             | 示例                                             |
| ----------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| ollama run \<model-name\>                       | 启动模型并与之交互               | ollama run llama2                                |
| ollama list                                     | 列出本地已下载的模型             | ollama list                                      |
| ollama pull \<model-name\>                      | 从模型库中下载一个模型           | ollama pull llama2                               |
| ollama rm \<model-name\>                        | 删除本地的一个模型               | ollama rm llama2                                 |
| ollama show \<model-name\>                      | 查看某个模型的详细信息           | ollama show llama2                               |
| ollama serve                                    | 启动 Ollama 服务                 | ollama serve                                     |
| ollama stop                                     | 停止 Ollama 服务                 | ollama stop                                      |
| ollama logs                                     | 查看 Ollama 的日志信息           | ollama logs                                      |
| ollama create \<model-name\> -f \<config-file\> | 使用自定义的模型配置文件创建模型 | ollama create my-model -f ./my-model-config.yaml |
| ollama export \<model-name> \<output-file\>     | 导出模型为文件                   | ollama export llama2 ./llama2-model.tar          |
| ollama import \<input-file\>                    | 从文件导入模型                   | ollama import ./llama2-model.tar                 |
| ollama version                                  | 查看 Ollama 的版本信息           | ollama version                                   |
| ollama --help                                   | 查看所有可用的命令及其说明       | ollama --help                                    |

## 最后

本文主要介绍了基础的安装与使用流程，但其探索空间远不止于此。对于有更高追求的用户，大家完全可以积极探索更多拓展性内容。例如，借助 RAG 技术打造专属知识库并与 LLM 相融合，或者对模型进行细致的微调，这些方法都能在很大程度上优化大模型存在的幻觉问题。而那些具备更深厚技术实力的用户，还可以尝试结合其他各类工具，构建出功能强大的个性化 Agent，进一步拓展应用的边界与深度。
