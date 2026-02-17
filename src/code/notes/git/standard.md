---
order: 3
title: Git使用规范
date: 2021-08-20
category: 
    - 其他
    - Git
tag: 
    - 其他
    - Git
timeline: true
article: true

---

公司中一些Git使用规范说明，基于特性的分支工作流。

[Git可视化学习网站](https://learngitbranching.js.org/?locale=zh_CN)

[一些好的Git使用case](https://mp.weixin.qq.com/s/u4lt3ucIeMZT-c1zAj7YAg)

## Git分支管理

通常采用**四类分支**，对应不同环境：

| **支类型**   | **命名示例**          | **用途**                                               | **稳定性要求**   |
| ------------ | --------------------- | ------------------------------------------------------ | ---------------- |
| **生产分支** | `release` 或 `master` | 线上运行代码，仅接受通过测试的代码，禁止直接修改。     | 高（与生产一致） |
| **预发分支** | `uat`                 | 模拟生产环境，用于最终验收和性能测试。                 | 较高             |
| **测试分支** | `test`                | QA 测试环境，开发人员提交代码后部署到此分支。          | 中等             |
| **开发分支** | `dev`                 | 集成各特性分支，日常开发联调使用，可能包含未测试代码。 | 低（不稳定）     |

**注意**：小公司可能简化到仅 `dev` + `master`，但大厂通过环境隔离规避代码污染风险

## 开发流程

1. **需求启动**  
   
   - 评审需求 → 排期 → 从 `release` 或 `uat` 拉取**特性分支**（如 `feat-需求ID-开发者`）。  
   - **分支命名规范**：  
     - `feat`: 新功能 · `fix`: Bug修复 · `refactor`: 重构 · `chore`: 工具链调整。
   
2. **本地开发**  
   - 在特性分支编码 → 自测（冒烟测试） → 提交格式：`<类型>: <描述>`（例：`fix: 禅道#3387-修复重复请求`）。  
   - **关键原则**：  
     - ⚠️ 禁止合并 `dev/test/uat` 到本地分支（避免引入未验证代码）。  
     - 单分支单功能：一个分支只开发一个需求/Bug，便于独立上线。

3. **代码合并与提测**  
   
   - **方式1（推荐）**：线上合并（GitLab/GitHub Merge Request）  
     
     - 推送特性分支到远程 → 发起 MR 到 `test` 分支 → Code Review → 解决冲突 → 合并部署测试环境。  
     - **优势**：支持代码审查、冲突集中处理、操作可追溯。  
   - **方式2（谨慎使用）**：本地合并，需要有对应远程分支的 **push** 权限
     
     ```bash
     # 没有对应远程分支代码
     git fetch origin test:test # 拉取远程分支代码到本地分支test（本地没有test会创建）
     git checkout test # 切换本地分支到test
     git merge feat-0820-dyj # 合并开发的本地分支到test分支
     git push origin test # 提交本地分支到远程test分支
     
     # 有对应远程分支代码
     git checkout test # 切换到test分支
     git pull origin test  # 更新test分支
     git merge feat-0820-dyj   # 合并特性分支（本地解决冲突）
     git push origin test
     ```
   
4. **测试与上线**  
   
   - 测试环境 → 修复 Bug → 预发环境（UAT）→ **二次验证**（Bug 修复需重新走测试流程）→ 产品验收 → 合并到 `release` 部署生产。  
   - 预发环境修 Bug 后必须回归测试：确保预发环境稳定性，避免污染生产。
   
5. **分支清理**  
   - 需求上线后删除特性分支：  
     ```bash
     git branch -d feat-xxx   # 删除本地分支
     git push origin --delete feat-xxx  # 删除远程分支
     ```

**具体Git命令**

```bash
# 切换到本地生产分支
git checkout release
# 拉取远程生产代码
git pull origin release
# 基于生产分支代码创建一个新的分支（关于某个需要）
# 推荐命名规范 分支类型-需求日期/需求号-开发人姓名
git checkout -b feat-0820-dyj
# 开发完成 提交代码
git add .
git commit -m "feat(login): 登录"  # 消息规范下面有讲
# 提交到远程分支
两种方式详细见开发流程

# 删除本地分支
git brach -d feat-0820-dyj
```

## Commit Message规范

常用的提交信息格式是 Angular 规范，格式如下：

```
<类型>(<作用域>): <主题>
<空行>
<描述>
<空行>
<脚注>
```

#### 类型

类型表示这次提交的变更类型，常见的有：

- feat：新功能（feature）
- fix：修复 bug
- docs：文档（documentation）
- style：格式（不影响代码逻辑的变动，比如空格、分号等）
- refactor：重构（既不是新增功能，也不是修复 bug，只是对代码进行重构）
- test：增加测试
- chore：构建过程或辅助工具的变动

#### 作用域

作用域表示这次变更涉及的模块或功能，比如 login、payment、api 等。作用域不是必须的，但加上可以让提交信息更明确。

#### 主题

主题是对本次变更的简短描述，要简洁明了，不能太长，一般不超过 50 个字符。

#### 描述

描述是对本次变更的详细说明，可以包括变更的原因、解决的问题等。

#### 脚注

脚注可以包括相关的 Issue 号、链接等，方便追溯问题。

比如一个标准的提交信息可能是这样的：

```
fix(login): 修复用户名密码加密逻辑

之前用户名密码在传输过程中没有进行加密，存在安全隐患。本次变更对用户名密码进行了 AES 加密处理，确保数据安全。

Closes #123
```

这样的提交信息清晰地说明了这次提交是修复了登录模块的用户名密码加密逻辑，详细描述了问题和解决方案，还关联了相关的 Issue，方便后续查看。

## 高频问题处理

1. **错误合并到生产分支，本来要提交到 uat 分支，结果提交到 release 分支了怎么解决**
   
   - 回退步骤：  
     ```bash
     git checkout release              # 切换到生产分支
     git log --merges                  # 查找误合提交的 commit ID
     git revert -m 1 <commit-id>       # 撤销合并
     git push -f origin release        # 强制推送（覆盖远程）
     ```
   - **注意**：`revert` 生成新提交保留记录，比 `reset` 更安全。
   
2. **临时切换任务（未提交代码）**  
   
   - 暂存当前修改：  
     ```bash
     git stash save "临时保存描述"    # 存储工作区，也可以不写提交信息 git stash
     git checkout feat-other         # 切换分支修复紧急需求
     git checkout feat-original      # 切回原分支
     git stash pop                   # 恢复暂存代码
     
     # 不确定之前的分支，如何查看
     git stash list
     ```

## 协作模式（Git Workflow）

大厂常用两种模型：  
1. **GitFlow**：  
   - 分支角色：`master`（生产） / `develop`（开发） / `feature`（特性） / `release`（预发布） / `hotfix`（热修复）。  
   - 适合复杂项目，但流程较重。  
2. **Forking 工作流**：  
   - 开发者 Fork 主仓库 → 提交到个人仓库 → PR 合并到主库。  
   - 适合开源项目或权限严格管控的场景（如 GitHub）。

## 总结：核心原则

- **分支隔离**：环境分离（dev/test/uat/release） + 功能隔离（单分支单需求）。  
- **合并安全**：优先线上 MR/PR，避免本地合并冲突。  
- **追溯性**：Commit 信息规范 + 分支清理机制。  
- **预发保护**：UAT 环境修 Bug 后必须回归测试，严防线上事故。  

> 流程虽严格，但能显著降低协作风险。实际执行中，团队会结合 CI/CD 自动化测试和部署，进一步提升效率。参考案例可查看 [阮一峰 Git 工作流程](https://www.ruanyifeng.com/blog/2015/12/git-workflow.html) 。