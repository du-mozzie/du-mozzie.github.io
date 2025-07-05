---
order: 4
title: Windows下安装Claude Code
date: 2025-07-04
category: AI工具
tag: AI工具
timeline: true
article: true
---

由于Claude Code在Windows环境下的安装有点复杂，专门写这篇文章记录一下。

## Windows安装Claude Code

[官方文档](https://docs.anthropic.com/en/docs/claude-code/overview)介绍中可以看到，Claude Code支持的平台: macOS 10.15+, Ubuntu 20.04+/Debian 10+, or Windows via WSL

Claude Code是不支持直接在Windows中使用的，需要安装WSL(Windows Subsystem for Linux)，适用于 Linux 的 Windows 子系统

<img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507051203898.png" style="zoom:80%;" />

### 启用WSL功能

1. Windows 下使用 WSL 功能需要系统是专业版

   <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507042149058.png" style="zoom:80%;" />

2. 开启 Windows 功能，快捷键 Win + Q 搜索 "启用或关闭 Windows 功能"，一共要开启三个功能，开启后需要重启一下电脑

   - Hyper-V
   - 适用于Linux的Windows子系统
   - 虚拟机平台

   <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507042152797.png" style="zoom: 80%;" />

3. 以管理员身份打开 PowerShell

   ```bash
   # 使用默认发行版（Ubuntu）安装 WSL2
   wsl --install
   
   # 如果上面的情况安装不好，使用下面的命令，指明版本
   wsl --install -d Ubuntu-22.04
   ```

   安装好后再次重启

4. 验证 WSL 2安装

   ```bash
   wsl -l -v
   ```

   如果显示 1，升级到 WSL2：

   ```bash
   # 将 WSL2 设置为默认版本
   wsl --set-default-version 2
   # 将现有发行版转换为版本 2
   wsl --set-version Ubuntu-22.04 2
   ```

5. 上面安装好 **Ubuntu** 会自动打开终端，跟着提示一步步配置账号密码

6. 配置好系统后需要安装一些需要的开发工具，跟着下面的指令一步步执行即可

   ```bash
   # 先升级一下软件包
   sudo apt update && sudo apt upgrade -y
   
   # 安装git、ccurl、构建工具
   sudo apt install git curl build-essential -y
   
   # 配置git
   git config --global user.name "Your Name"
   git config --global user.email "your@email.com"
   git config --global init.defaultBranch main
   
   # Python依赖
   sudo apt install python3-pip python3-venv -y
   
   # 使用 pyenv 安装 Python（在 WSL 中）
   sudo apt install make libssl-dev zlib1g-dev \
   libbz2-dev libreadline-dev libsqlite3-dev wget llvm \
   libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
   libffi-dev liblzma-dev -y
   
   # 安装 pyenv
   curl https://pyenv.run | bash
   
   # 把pyenv 添加到 shell 并重新加载
   shecho 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
   echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
   echo 'eval "$(pyenv init -)"' >> ~/.bashrc
   source ~/.bashrc
   
   # 安装 Python 版本并设置为默认版本
   pyenv install 3.11.8
   pyenv global 3.11.8
   
   # 安装 nvm（Node管理工具）
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
   # 重新加载 shell 以使 nvm 可用：
   source ~/.bashrc
   
   # 安装 Node，最新 LTS 版本
   nvm install --lts
   nvm use --lts
   ```

自此关于WSL的基本安装都配置好了

### 安装Claude Code

Claude Code 通过npm安装

- 安装命令

  ```bash
  npm install -g @anthropic-ai/claude-code
  ```

  如果安装出现了我下面这种情况，其实可以看到WSL在使用windows的npm

  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507042209688.png)

  - 还有一种情况可能要执行一个命令，[官方有一句话](https://docs.anthropic.com/en/docs/claude-code/setup#troubleshooting)：**OS/platform detection issues**: If you receive an error during installation, WSL may be using Windows `npm`，说明了WSL在使用windows 的npm，也可以试试

  ```bash
  npm config set os linux
  
  npm install -g @anthropic-ai/claude-code --force --no-os-check # 注意不要用sudo
  ```

  - 我试了一下官方的解决方案，但是也不太好使，目前也没发现什么好的解决办法，因为我本地也是 nvm 管理的，我直接把node卸载了，重新source ~/.bashrc就行了；*估计我执行命令还是走的Windows的npm*

  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507042216703.png)

- 启动claude

  ```bash
  claude
  ```

  如果出现我下面这种情况就是你的网络有问题，Claude 需要科学上网，可以自行配置一下网络

  <img src="https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507050855331.png" style="zoom:80%;" />

  第一次运行 `claude`时，会看到身份验证选项：

  1. **Anthropic 控制台（按使用付费）**：
     - 如果你想按 API 使用量付费，请选择此选项
     - 需要在 [console.anthropic.com](http://console.anthropic.com/) 激活账单
     - Claude 将打开一个浏览器窗口进行 OAuth 身份验证
     - 如果你在没有 GUI 的 WSL 中，URL 将打印在终端中
     - 在任何电脑上打开 URL 并使用你的 Anthropic 凭据登录
  2. **Claude 应用（专业版/最大版套餐）**：
     - 如果你有 Claude 专业版（每月 20 美元）或最大版（每月 100-200 美元）订阅，请选择此选项
     - 使用你的 [Claude.ai](http://claude.ai/) 帐户凭据登录
     - 这为 Claude Code 和 Web 界面提供统一的订阅

  ![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507051126136.png)

  如果使用一些三方的镜像可以使用下面的方式授权

  ```bash
  export ANTHROPIC_AUTH_TOKEN=你的apikey
  export ANTHROPIC_BASE_URL=镜像站的代理url
  ```

### 使用 Claude

使用之前先说一个注意点：在 Ubuntu 中有一个目录 `/mnt` 我们Windows系统中的文件就挂载到这个位置

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507051100032.png)

进入你的项目目录，然后启动 Claude，直接输入你想要的内容即可

![](https://raw.githubusercontent.com/du-mozzie/PicGo/master/images/202507051136396.png)
