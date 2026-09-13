---
title: MIT Missing Semester 2026 第五课：版本控制与 Git
image: /assets/post-card/post-card-26-v20260818.jpg
cardImagePosition: center 35%
published: 2026-08-17
updated: 2026-08-18
description: 从 blob、tree、commit 和 DAG 出发，介绍 Git 的暂存区、分支、合并、远程同步、撤销操作与高级工具。
tags:
  - Git
  - CLI
category:
  - MIT Missing Semester
  - Tutorial
section: notes
author: nikonikoni
draft: false
---

# MIT Missing Semester 2026 第五课：版本控制与 Git

Git 使用不可变对象保存项目快照和提交历史，使用可变引用标记分支、标签与当前位置。MIT Missing Semester 第五课从 blob、tree、commit 和提交 DAG 开始，依次介绍暂存区、分支、合并、远程同步、撤销操作与常用高级工具。

## 版本控制系统的用途

版本控制系统跟踪某个顶层目录及其内容随时间形成的一系列状态。每个状态除了文件内容，通常还关联作者、时间、说明和父状态等元数据。

即使只有一个开发者，版本控制也可以回答：

- 过去某个可工作的版本是什么样；
- 某项修改为什么发生；
- 两个实验方案如何并行推进；
- 哪次变更引入了回归；
- 某行代码由谁、何时、因何修改。

多人协作还需要交换修改、合并并发开发并保留决策轨迹。Git 同时提供历史管理、并行开发和协作同步能力；备份与代码托管只是其中的部分用途。

| 维度 | 普通文件副本 | Git |
|---|---|---|
| 状态标识 | 文件名或时间目录 | 提交对象 ID 与引用 |
| 变化原因 | 通常需要另写说明 | commit message 与元数据 |
| 并行工作 | 手工复制目录 | 分支与 worktree |
| 合并 | 手工比较 | 三方合并、冲突标记、mergetool |
| 定位问题 | 依赖外部记录 | log、show、blame、bisect |
| 协作交换 | 复制压缩包 | fetch、push、pull |

Git 仓库本身也可能被误删或损坏，重要项目仍应保留独立备份和远端副本。

### commit 是逻辑检查点

Git 会检测工作区变化，但不会把每次按键或每次保存自动创建为 commit。开发者应在一个逻辑工作达到可解释状态时建立提交，例如修复一个错误、加入一个完整功能或更新一组相关文档。

```text
编辑文件
  ↓
git status：确认文件状态
  ↓
git diff：检查尚未暂存的修改
  ↓
git add：选择下一提交内容
  ↓
git diff --staged：复核即将提交的内容
  ↓
git commit：建立逻辑检查点
```

一个提交可以涉及多个文件，也可以只包含一个文件中的部分改动。关键在于其中的变化是否共同完成一个清晰意图。

## Git 的数据模型

### 快照、blob 与 tree

Git 在概念上把每次提交看成完整快照。文件内容称为 blob，目录称为 tree，顶层 tree 代表整个项目快照。

```text
<root> (tree)
├── foo (tree)
│   └── bar.txt (blob: "hello world")
└── baz.txt (blob: "git is wonderful")
```

blob 只保存字节，不保存文件名。tree 把名称和文件模式映射到 blob 或子 tree，因此文件名属于 tree 条目。内容相同的文件可以引用同一个 blob 对象。

快照模型不表示 Git 必须在磁盘上机械保存许多完整副本。对象复用、packfile 和 delta 压缩可以节省空间，但不改变提交代表完整项目状态这一概念。

### commit 与 DAG

commit 对象保存顶层 tree、父提交、作者和提交者信息、时间以及 message。

```text
commit
├── top-level tree
├── parent(s)
├── author / committer / time
└── message
```

普通提交通常有一个父提交，初始提交没有父提交，合并提交可以有两个或更多父提交。Git 历史因此是有向无环图 DAG，而不是只能线性排列的版本列表。

```text
A <- B <- C <- D
          \
           E <- F
```

箭头指向父提交。两条开发线合并后，可以产生具有两个父提交的新快照：

```text
A <- B <- C <- D <---- M
          \           /
           E <- F <--
```

### 不可变提交与历史重写

commit 的内容包含 tree、父提交和元数据。任一字段变化都会产生新的对象 ID。所谓修改旧提交，通常是创建新提交，再移动分支引用。

```text
旧历史：A <- B <- C
新历史：A <- B' <- C'
```

这解释了 `commit --amend`、rebase 和 reset 为什么会改变提交 ID，也解释了共享历史重写为什么需要协调。

### 数据模型伪代码

```text
type blob = array<byte>
type tree = map<string, tree | blob>

type commit = struct {
    parents: array<commit>
    author: string
    message: string
    snapshot: tree
}

type object = blob | tree | commit
objects = map<object_id, object>
references = map<string, object_id>
```

仓库的核心可以近似理解为对象数据库加引用集合。Git 命令要么创建或读取对象，要么移动引用，要么改变工作区与暂存区以准备下一批对象。

## 对象与内容寻址

blob、tree 和 commit 都是 Git 对象。对象名由对象类型、长度和内容计算而来，因此相同对象可以由同一 ID 寻址，内容损坏也能通过重新计算发现。

课程讲义使用传统 SHA-1 对象 ID：

```text
4448adbf7ecd394f42ae135bbeed9676e894af85
```

实际使用通常写一个不产生歧义的短前缀：

```bash
git show 4448adb
```

现代 Git 还包含 SHA-256 对象格式和迁移机制。需要掌握的是内容寻址，而不是把 SHA-1 当成永远不变的接口。对象 ID 也不是密码或访问控制机制。

以下 plumbing 命令可以直接观察对象：

```bash
git hash-object README.md
git cat-file -t HEAD
git cat-file -p HEAD
git cat-file -p HEAD^{tree}
git ls-tree -r HEAD
```

| 命令 | 作用 |
|---|---|
| `hash-object` | 计算对象 ID；加 `-w` 才写入对象库 |
| `cat-file -t` | 查看对象类型 |
| `cat-file -p` | 以可读形式显示对象内容 |
| `HEAD^{tree}` | 取得 HEAD commit 的顶层 tree |
| `ls-tree` | 列出 tree 条目 |

### 从 HEAD 逐层找到文件内容

假设当前快照包含：

```text
project/
├── README.md
└── src/
    └── main.py
```

可以按对象关系逐层检查：

```bash
git cat-file -t HEAD
git cat-file -p HEAD
git cat-file -p HEAD^{tree}
git ls-tree -r HEAD
```

第一条确认 `HEAD` 最终解析为 commit；第二条显示该 commit 的顶层 tree、父提交和元数据；第三条打印顶层 tree，因此根目录下的 `src` 只表现为另一个 tree；第四条递归展开整个快照，显示 `src/main.py` 对应的 blob。

```text
HEAD
  ↓
commit C
  ↓ tree 字段
root tree T
├── README.md → blob A
└── src       → tree S
                └── main.py → blob B
```

`HEAD^{tree}` 可以读作“把 HEAD 对应的对象解析为 tree”。`HEAD~^{tree}` 从 HEAD 的父提交取得顶层 tree。`git hash-object README.md` 默认只计算 blob ID，增加 `-w` 才写入对象数据库。

日常命令常称为 porcelain，底层命令常称为 plumbing。理解底层有助于建立模型，但普通工作不应手工修改 `.git/objects` 或 `.git/refs`。

## 引用、分支、tag 与 HEAD

完整对象 ID 不适合人类记忆，Git 使用引用为对象提供可读名称。

### 分支是可移动引用

```text
refs/heads/main -> commit C
```

创建新提交 `D` 后，Git 把 `main` 移到 `D`：

```text
A <- B <- C <- D
               ^
               main
```

创建分支只需增加另一个引用，不需要复制整个项目：

```text
A <- B <- C
          ^
          main
          experiment
```

这就是 Git 分支轻量的原因。

### tag 是相对稳定的名称

轻量 tag 近似固定引用，附注 tag 则有独立 tag 对象，可以包含标记者、说明和签名。tag 常用来标识发布版本，分支则用于持续开发。

```bash
git tag v1.0
git tag -a v1.0 -m "Version 1.0"
```

```text
轻量 tag：v1.0 → commit C

附注 tag：v1.0 → tag object T → commit C
                    ├── tagger
                    ├── time
                    ├── message
                    └── optional signature
```

正式发布通常更适合附注 tag。后续提交会推动当前分支前进，但不会自动移动 `v1.0`。

### 删除引用与对象可达性

```bash
git branch -d experiment
```

这条命令主要删除分支引用，不会立即逐个删除它曾经指向的 commit、tree 和 blob。Git 从分支、tag 等引用出发，沿父提交关系判断对象是否可达：

```text
main → D → C → B → A    A、B、C、D 可达

E                        没有普通引用可达
```

不可达对象可能暂时仍存在，并可能通过 reflog 找回；经过过期和垃圾回收后才可能被清理。

### HEAD 记录当前位置

通常：

```text
HEAD -> refs/heads/main -> commit D
```

新提交完成后，`main` 前进，`HEAD` 继续通过当前分支指向最新提交。

直接检出某个提交 ID 会进入 detached HEAD：

```text
HEAD -> commit B
```

可以用聚焦的新命令或传统命令进入这一状态：

```bash
git switch --detach <revision>
git checkout <revision>
```

此时可以检查和实验，也能创建提交；若希望保留新工作，应及时创建分支：

```bash
git switch -c rescue-branch
```

正常状态的完整寻址链是：

```text
HEAD → refs/heads/main → commit C → root tree → child tree/blob
```

`HEAD` 表示当前位置，分支表示开发线当前位于哪个 commit，commit 保存快照入口和历史关系，tree 保存名称与目录结构，blob 保存文件内容。切换分支主要改变 `HEAD` 所关联的引用；创建提交时真正向前移动的是当前分支引用。

## 工作区、暂存区与 HEAD

Git 的日常界面可以理解为三层：

```text
HEAD 快照  <---->  暂存区 index  <---->  工作区 working tree
上次提交           下次提交草稿          当前磁盘文件
```

### `git add` 保存执行时的内容

```bash
git add report.md
```

这条命令把 `report.md` 当前内容放入 index。随后继续编辑产生的新修改只在工作区，必须再次执行 `git add` 才会进入下一提交。

```text
第一次编辑 -> git add -> 暂存版本 A
继续编辑              -> 工作区版本 B
git commit            -> 只提交版本 A
```

同一个文件的三个版本可以表示为：

| 操作阶段 | HEAD | index | working tree |
|---|---|---|---|
| 刚提交完成 | Version 1 | Version 1 | Version 1 |
| 编辑文件 | Version 1 | Version 1 | Version 2 |
| `git add` | Version 1 | Version 2 | Version 2 |
| 继续编辑 | Version 1 | Version 2 | Version 3 |
| 直接 commit 后 | Version 2 | Version 2 | Version 3 |

最后一种状态表示 commit 已经保存 Version 2，而 Version 3 仍作为未提交修改留在工作区。

暂存区使一个工作目录中的 bug 修复、未完成功能和调试输出可以被拆成多个清晰快照。`git add -p` 还能选择同一文件中的部分 hunk。

### 三种 diff

```bash
git diff                 # 工作区 vs 暂存区
git diff --staged        # 暂存区 vs HEAD
git diff HEAD            # 工作区与暂存内容综合对比 HEAD
```

提交前通常应依次检查：

```bash
git status
git diff
git diff --staged
```

`git commit` 默认只把暂存区写成新提交，未暂存修改保留在工作区。

当同一个文件处于 `HEAD=A、index=B、working tree=C` 时，`git status` 可能同时把它列为 `Changes to be committed` 和 `Changes not staged for commit`。前者表示 `A→B` 已暂存，后者表示 `B→C` 尚未暂存。

## 建立第一个提交

### 基础配置

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

姓名和邮箱进入提交元数据，不等于 GitHub 登录凭据。公开仓库应考虑邮箱隐私设置。

`--global` 为当前操作系统用户设置默认值；仓库内的 local 配置通常会覆盖它：

```bash
git config --global user.name "Default Name"
git config user.email "project-specific@example.com"
git config --list --show-origin
```

作者元数据和远端认证是两个独立问题。远端权限由 SSH 密钥、令牌、账号权限与服务器策略决定。

### 最小工作流

```bash
mkdir demo
cd demo
git init

printf '# Demo\n' > README.md
git status
git add README.md
git diff --staged
git commit -m "docs: add project overview"
git log --oneline --decorate
```

底层变化如下：

1. `git init` 创建 `.git` 元数据目录；
2. 工作区出现未跟踪文件；
3. `git add` 把内容加入 index，并创建或复用 blob；
4. `git commit` 从 index 构造 tree 和 commit；
5. 当前分支引用移动到新 commit；
6. `HEAD` 继续通过当前分支指向最新提交。

刚执行 `git init`、尚无提交时，可以近似表示为：

```text
HEAD → refs/heads/main
main 尚未指向任何 commit
```

第一次 commit 创建 root commit 后才形成：

```text
HEAD → main → commit A → tree → blob
```

`.git/` 保存对象数据库、refs、`HEAD`、index、配置和引用日志等仓库数据。项目文件构成工作区；`.git/` 损坏或丢失会使该目录失去对应的本地历史与元数据。

### 帮助、状态与历史

```bash
git help commit
git status --short
git log --oneline --decorate
git log --all --graph --decorate --oneline
git show HEAD
git show HEAD:README.md
git log -- README.md
```

`git status` 是出现混乱时的首要诊断工具。`git log` 显示从指定起点可达的提交，不等于对象数据库中的所有对象；`--all` 使用全部引用作为起点。

短状态格式的两列分别反映 index 和工作区，例如：

```text
?? notes.txt    未跟踪
A  README.md    已加入 index
 M main.py      工作区修改尚未暂存
MM model.py     已暂存后又继续修改
```

`git show HEAD:README.md` 读取 HEAD 快照中的文件，而不是工作区当前版本。`git log -- README.md` 中的 `--` 用于分隔 Git 参数与路径，只查看与该路径相关的提交。

## 分支、合并与冲突

### 创建和切换分支

```bash
git branch
git branch feature/login
git switch feature/login
git switch -c feature/payment
```

旧式 `git checkout -b feature/login` 仍然常见。`switch` 更聚焦分支，`restore` 更聚焦文件恢复，可以减少 `checkout` 一条命令承担多种语义的混淆。

### fast-forward 与 merge commit

若当前分支没有额外提交，merge 只需把引用向前移动：

```text
A <- B <- C
^         ^
main      feature

git switch main
git merge feature

A <- B <- C
          ^
          main, feature
```

这叫 fast-forward，不产生新的 merge commit。

若两边都继续提交，Git 会寻找共同祖先并执行三方合并：

```text
      D <- E  feature
     /
A <- B <- C  main
```

成功后可以产生拥有两个父提交的 merge commit。

三方合并比较共同祖先 B、当前分支 C 和待合并分支 E。假设 B 中为：

```text
name = "Alice"
age = 18
```

C 只把 `age` 改为 19，E 只把 `name` 改为 `Bob`。Git 比较 `B→C` 和 `B→E` 后，可以判断两项修改互不冲突并得到：

```text
name = "Bob"
age = 19
```

共同祖先为两条开发线提供修改基线，因此三方合并比只比较 C 与 E 更有信息。

### 解决合并冲突

若两个分支从共同祖先出发，对同一区域作出无法自动协调的修改，Git 会写入冲突标记：

```text
<<<<<<< HEAD
1 cup salt
=======
2 cups sugar
>>>>>>> sweet
```

`HEAD` 一侧是当前分支内容，另一侧是待合并分支内容。应编辑出最终正确版本，删除全部标记，再完成合并：

```bash
git status
git diff
git add recipe.txt
git merge --continue
```

也可以调用已配置的图形或终端合并工具：

```bash
git mergetool
```

放弃尚未完成的 merge：

```bash
git merge --abort
```

冲突期间三层模型仍然成立。`HEAD` 表示当前分支一侧，`MERGE_HEAD` 记录待合并提交；index 可以为冲突路径保留共同祖先、当前一侧和待合并一侧的多个阶段。开发者编辑工作区中的最终内容，再用 `git add` 更新 index 并标记该路径已经解决：

```text
共同祖先 / HEAD / MERGE_HEAD
             ↓ Git 尝试合并
       index 中出现冲突阶段
             ↓ 编辑工作区
          git add path
             ↓
       index 保存最终版本
             ↓
     git commit 或 merge --continue
```

最终内容可以采用任一版本、组合两者，或者根据程序语义重新编写；解决冲突不等同于机械选择冲突标记的某一侧。

### rebase 的模型

```text
      D <- E  feature
     /
A <- B <- C  main
```

在 feature 上执行：

```bash
git rebase main
```

Git 把 feature 相对共同祖先的修改重放到 `C` 后面：

```text
A <- B <- C <- D' <- E'
          main       feature
```

`D'` 和 `E'` 是新提交。rebase 可以得到线性历史，却会改变提交 ID。不要在未经协调时 rebase 已被他人使用的共享提交。

逐提交重放可以分解为：提取 `B→D` 的修改并在 C 上应用，创建 `D'`；再提取 `D→E` 的修改并在 `D'` 上应用，创建 `E'`。父提交字段从 B、D 变成 C、D'，因此新 commit 的内容和 ID 必然变化。

merge 保存分叉和合并拓扑，rebase 重写开发线的基底。选择应服从团队工作流。

#### merge 与 rebase 的处理单位

两者在没有冲突时常能得到相同的最终文件，但过程和历史语义不同：

| 维度 | merge | rebase |
|---|---|---|
| 处理方式 | 比较共同祖先到两端的净变化，一次整合 | 取出当前分支独有提交，按顺序逐个重放 |
| 原提交 | 保留原 ID | 产生 `D'`、`E'` 等新提交 |
| 拓扑 | 保留分叉，并可能创建 merge commit | 把开发线接到新基底后，历史趋于线性 |
| 冲突粒度 | 通常在一次综合合并中处理 | 可能在多个被重放的提交上分别暂停 |
| 共享风险 | 通常不改写已有提交 | 改写已共享提交会破坏他人的基线与哈希引用 |

“净变化”和“逐提交重放”的差别在中间过程相互抵消时尤其明显。设共同祖先中 `value=1`，feature 先改成 2，下一提交又改回 1，而 main 改成 3。对 merge 而言，feature 相对祖先的最终净变化为零；对 rebase 而言，Git 仍会依次尝试重放“1→2”和“2→1”，每一步都可能需要结合新基底解释。这说明 rebase 保留并重新执行提交序列的语义，而不是只搬运分支末端的最终快照。

rebase 冲突时，应在每个暂停点检查当前正在重放的提交，解决文件后继续：

```bash
git status
git add <resolved-path>
git rebase --continue

# 放弃整次 rebase，回到开始前
git rebase --abort
```

merge 历史可以用 `git log --first-parent` 沿主线查看某个功能何时进入当前分支。rebase 后原提交 ID 会失效，依赖这些 ID 的代码审查链接、CI 记录、签名或外部引用也可能受影响。若个人分支已经推送、团队又允许重写，更新远端时通常应在协调后使用 `git push --force-with-lease`，而不是无条件 force push。

## 远程仓库与同步

remote 是命名的远程仓库配置，不是云端分支的同义词。

```bash
git remote -v
git remote add origin git@example.com:team/project.git
```

`git remote add` 只在本地写入 remote 名称与 URL 配置，不会自动 fetch、pull 或 push。`git remote -v` 分别显示 fetch URL 和 push URL；二者通常相同，也可以不同。一个本地仓库还可以配置多个 remote，例如 `origin` 指向自己的 fork，`upstream` 指向原项目。此处的 `upstream` 只是 remote 名称，不能和本地分支的 upstream 属性混为一谈。

### clone

```bash
git clone <url>
```

clone 通常创建本地仓库、下载对象和引用、添加 `origin`、建立本地分支与 upstream，并检出工作区。`origin` 只是默认名称。

clone 与下载 ZIP 不同。ZIP 通常只包含某个时刻的文件；clone 还会建立 `.git/`、取得提交历史与引用、配置 remote 并检出默认分支。浅克隆是有意只取得有限历史的例外。

### fetch

```bash
git fetch origin
```

fetch 获取对象和远端引用，并更新 `origin/main` 等远程跟踪引用。它通常不自动合并到本地 `main`，也不直接覆盖当前工作区。

```text
refs/heads/main          本地分支
refs/remotes/origin/main 本地记录的远端 main 状态
```

远程协作需要同时区分三层引用：

```text
服务器上的 main
        │ git fetch
        ▼
本地的 origin/main
        │ git merge / git rebase
        ▼
本地的 main
```

`origin/main` 是最近一次与 origin 通信后，本地记录的远端 main 位置，不是服务器状态的实时镜像。fetch 后可以使用 `git log main..origin/main` 查看远程跟踪分支有而本地 main 没有的提交，或用 `git diff main origin/main` 比较两端快照。

### pull

课程把 pull 概括为 fetch 后 merge。实际行为还会受到 upstream、`pull.rebase`、`pull.ff` 和命令选项影响。

需要明确控制时可以拆开：

```bash
git fetch origin
git merge origin/main
```

采用 rebase 工作流时可显式使用：

```bash
git pull --rebase
```

### push 与 upstream

```bash
git push origin main
git push -u origin main
git push origin local-name:remote-name
git branch --set-upstream-to=origin/main main
git branch -vv
```

push 发送远端缺少的对象，并请求更新远端引用。服务器可能因非 fast-forward、分支保护、权限或检查失败而拒绝。

push 不会直接上传尚未形成 commit 的工作区或 index 内容：

```text
工作区修改 → git add → index → git commit → 本地对象与引用 → git push → 远端对象与引用
```

因此修改文件后立即 push 不能代替 add 和 commit。

`local-name:remote-name` 是 push refspec 的直观形式。例如 `git push origin feature:dev` 请求用本地 `feature` 更新远端 `dev`；`git push origin main` 在常见情形下相当于 `main:main`。若远端分支含有本地没有的提交，直接更新会让其历史无法通过父提交链 fast-forward 到新位置，服务器通常以 non-fast-forward 拒绝。此时应先 fetch，再用 merge 或 rebase 整合远端变化，而不是立即强制覆盖。

upstream 是本地分支默认比较、拉取或推送的远程跟踪分支。它不是父提交，也不等同于社区常命名为 `upstream` 的 remote。

```text
本地 main ──upstream──> origin/main
```

这项本地配置使 `git status`、无参数 `git pull` 和 `git push` 知道默认与谁比较或通信，也使 Git 能报告 ahead、behind 或 diverged。`git push -u origin feature` 是推送并设置 upstream；`git branch --set-upstream-to=origin/main main` 只设置关系，不发生网络传输。`git branch -vv` 可检查每个本地分支的当前提交、upstream 与领先/落后状态。

## 撤销操作

执行撤销前先确认：

1. 修改只在工作区、已经暂存，还是已经提交；
2. 提交是否已经推送或被他人基于它工作；
3. 目标是保留修改、丢弃修改，还是生成可审计的反向提交。

| 状态与目标 | 推荐操作 | 主要影响 |
|---|---|---|
| 取消暂存但保留修改 | `git restore --staged file` | index |
| 丢弃未暂存的已跟踪文件修改 | `git restore file` | 工作区，难以恢复 |
| 修改最近提交 | `git commit --amend` | 新建 commit 并移动分支 |
| 撤销本地提交并保留暂存内容 | `git reset --soft HEAD~1` | 分支引用 |
| 撤销本地提交并把修改放回工作区 | `git reset HEAD~1` | 分支引用和 index |
| 丢弃本地提交与文件修改 | `git reset --hard ...` | 引用、index、工作区，破坏性高 |
| 撤销已经共享的提交 | `git revert <commit>` | 新建反向提交 |
| 找回最近移动的引用 | `git reflog` | 查看本地引用日志 |

把 `HEAD` 快照、index 和工作区分别记作三份状态，更容易预测命令结果。假设文件当前是：

```text
HEAD     = A
index    = B
worktree = C
```

路径恢复命令的数据方向为：

| 命令 | 数据方向 | 结果要点 |
|---|---|---|
| `git restore file` | index → 工作区 | 工作区 C 变回 B，而不是 A |
| `git restore --source=HEAD file` | HEAD → 工作区 | 工作区直接变回 A |
| `git restore --staged file` | HEAD → index | index B 变回 A，工作区 C 保留 |
| `git reset file` | HEAD → index | 路径模式近似取消暂存，不移动分支 |

reset 的提交模式先移动当前分支，再决定是否同步另外两层：

| 模式 | 分支/HEAD | index | 工作区 |
|---|---|---|---|
| `git reset --soft <target>` | 移到 target | 保留 | 保留 |
| `git reset --mixed <target>`（默认） | 移到 target | 重置为 target | 保留 |
| `git reset --hard <target>` | 移到 target | 重置为 target | 重置为 target |

soft 适合取消本地 commit 后重新组织提交，mixed 让改动回到未暂存状态，hard 会丢弃工作区中的相应修改。hard 是需要先确认目标与未提交内容的破坏性操作。

restore 主要恢复路径而不移动当前分支；reset 可以移动分支或修改 index；revert 创建效果相反的新提交。

`git commit --amend` 也不是编辑原对象。它基于当前 index、父节点和元数据创建另一个 commit，再让分支指向新对象。

共享历史通常优先使用：

```bash
git revert <commit>
```

它保留错误和撤销过程的审计轨迹，不要求其他克隆重写历史。

revert 应用的是旧提交的反向修改，而不是恢复整棵目录到某个旧快照。若后续代码已经修改同一区域，revert 也可能发生冲突；解决后继续创建反向提交，或放弃本次 revert。

reflog 可以帮助找回误 reset 或 rebase 前的位置：

```bash
git reflog
git branch rescue <object-id>
```

reflog 有过期和清理策略，不同步到远端，也不能代替备份。

它记录的是 HEAD 或分支曾指向哪里，不是工作区所有编辑历史。因此从未进入对象数据库的未提交内容通常不能靠 reflog 恢复；误 reset、误 rebase、误 amend 或误删分支后仍可达的旧提交，才是 reflog 最擅长的恢复对象。

## 高级 Git 工具

### 配置来源

```bash
git config --list --show-origin
git config --global core.editor "vim"
git config --local user.email "project@example.com"
```

Git 配置存在 system、global、local 等层级，后者通常覆盖前者。`--show-origin` 可以查明某个值来自哪个文件。

### 浅克隆

```bash
git clone --depth=1 <url>
```

浅克隆只获取有限历史，可减少时间和空间，但 log、blame、bisect、合并基础和历史分析可能受限。

需要更多或完整历史时可以执行：

```bash
git fetch --deepen=100
git fetch --unshallow
```

### 交互暂存

```bash
git add -p
```

按 hunk 选择进入 index 的修改，适合把混杂的工作区拆成多个单一意图提交。

常见提示 `Stage this hunk [y,n,q,a,d,...]?` 中，`y` 表示暂存当前 hunk，`n` 表示跳过当前 hunk，`q` 表示退出并停止处理后续 hunk，`a` 表示暂存当前及后续 hunk，`d` 表示当前及后续 hunk 都不暂存。它是在逐块决定哪些修改进入下一提交，不是立即 commit 或上传。

### 交互 rebase

```bash
git rebase -i HEAD~5
```

可以重排、合并、修改或删除本地提交。它会重写相关提交，适合尚未共享的开发线。

| todo 指令 | 作用 |
|---|---|
| `pick` | 正常重放并保留提交 |
| 调整行顺序 | 改变重放顺序，依赖关系不成立时可能冲突 |
| `reword` | 保留修改，只重写提交信息 |
| `edit` | 重放该提交后暂停，允许修改并 amend |
| `squash` | 合入前一个提交，并整理双方 message |
| `fixup` | 合入前一个提交，通常丢弃自己的 message |
| `drop` | 不再重放该提交 |

`fixup` 和 `squash` 总是合入它们上方最近的保留提交；`edit` 是先应用再暂停。完成暂停处的修改后执行 `git rebase --continue`。由于 Git 是按新顺序重新创建提交，重排也不是简单移动原对象。

### blame

```bash
git blame -L 20,40 path/to/file
```

blame 显示当前每行最后归因到哪个提交，不自动解释原始作者、复制来源和修改动机。应结合 `git show`、`git log -L` 与 message。

### stash

```bash
git stash push -m "wip: parser experiment"
git stash list
git stash show -p stash@{0}
git stash pop
git stash apply stash@{0}
```

stash 暂存工作区与 index 变化并清理现场。`apply` 恢复指定 stash 但保留该条目，`pop` 恢复后尝试从列表移除。默认不一定包含 untracked 或 ignored 文件；需要时可用 `-u` 纳入 untracked，或用 `-a` 进一步纳入 ignored。重要成果不应长期只保存在 stash。

### bisect

```bash
git bisect start
git bisect bad
git bisect good <known-good-commit>
# 对 Git 选出的提交进行测试，然后标记 good 或 bad
git bisect reset
```

bisect 在提交历史上二分定位首次回归。若测试可以脚本化，可使用 `git bisect run <test-command>`。

### worktree

```bash
git worktree add ../project-hotfix hotfix
git worktree list
git worktree remove ../project-hotfix
```

worktree 允许同一仓库同时检出多个分支，适合在保留实验现场的同时处理紧急修复。

worktree 是工作目录，不是新的历史线。真正前进的是各目录中检出的 branch；整合时也应 merge、rebase 或 cherry-pick 分支，而不是手工复制目录：

```text
共享对象数据库
├── project/         → feature 分支
└── project-hotfix/  → hotfix 分支
```

在 hotfix worktree 中提交后，可回到 feature 或 main 所在 worktree 执行 `git merge hotfix`。worktree 解决同时在哪些目录工作，分支操作解决这些提交历史如何整合。

### `.gitignore`

```text
.DS_Store
.venv/
__pycache__/
*.log
build/
```

ignore 主要影响未跟踪文件，不会让已跟踪文件停止跟踪。要停止跟踪但保留本地文件，需要在确认影响后执行：

```bash
git rm --cached path
```

项目共同规则应写入仓库内 `.gitignore`；只与个人系统或编辑器有关的模式可以放入 global excludes。

| 文件状态 | 匹配 `.gitignore` 后的行为 |
|---|---|
| untracked | 通常不在 `status` 中提示，也不会被 `git add .` 默认加入 |
| tracked 且 modified | 仍会显示并可被暂存，ignore 不会停止跟踪 |
| 远端 commit 中已 tracked | clone 或 pull 时仍会检出，ignore 不负责选择下载内容 |

因此 `git add .` 可能暂存已跟踪的 `main.py` 修改，同时跳过匹配 `*.log` 的未跟踪 `debug.log`；若 `debug.log` 早已 tracked，它仍会被暂存。

## Git 托管与协作工作流

Git 是分布式版本控制系统。GitHub 是提供 Git 托管、pull request、issue、权限和自动化的平台。GitLab、Bitbucket 与自建服务也可以托管 Git；pull request 属于托管平台协作界面，不是 Git 对象类型。

图形客户端、命令行、Shell prompt 和编辑器集成都在操作同一仓库模型。GUI 有利于观察 diff、提交选择和历史图，命令行便于精确操作与自动化。集成显示仍可以用 `git status`、`git diff` 和 `git log` 交叉确认。

大型项目也没有唯一正确的工作流。主干开发、功能分支、squash merge、保留 merge commit、本地 rebase 和发布分支都有适用条件，选择取决于团队规模、发布节奏、审计要求和工具链。

常见的短生命周期功能分支闭环是：从 main 创建 feature 分支，小步开发并形成逻辑提交，push 后建立 upstream，通过 pull request 完成审查和自动检查，再选择 merge、squash 或 rebase 后 fast-forward，最后删除已完成的短期分支。分支长期脱离 main 会扩大差异和冲突成本。

三种常见进入主分支的策略各保留不同信息：squash merge 把整项 PR 压为一个主线提交；merge commit 保留功能分支拓扑；本地 rebase 后 fast-forward 保留整理后的线性提交序列但改写 feature 原 ID。Git Flow 进一步设置长期 `develop`、`release/*`、`hotfix/*` 等分支，适合部分固定发布流程，但不是所有团队的默认答案。

一个可维护的提交通常满足：

- 聚焦一个可解释意图；
- 暂存前检查工作区，提交前检查 `git diff --staged`；
- message 说明修改原因，而不只复述文件名；
- 不包含密钥、token、密码、数据库导出和无必要大文件；
- 在约定范围内通过构建或测试；
- 不用历史整理代替代码审查。

### AI 项目中的跟踪边界

Git 适合管理代码、文档、小型配置、测试和可复现实验脚本：

```text
README.md
requirements.txt
src/
configs/
tests/
scripts/
```

数据集、模型 checkpoint、训练输出、缓存、虚拟环境和包含凭据的环境文件通常不应直接进入普通 Git 历史：

```text
data/
checkpoints/
outputs/
wandb/
.venv/
.env
__pycache__/
```

这些内容可能造成仓库快速膨胀、二进制历史难以比较或凭据泄露。项目应为数据与制品选择合适的独立存储，并通过 `.gitignore` 排除本地产物。`.gitignore` 不能代替密钥管理；公开示例配置只应保留变量名和说明，不包含真实凭据。

环境本身和环境描述也应区分：`.venv/` 是可重建的本地环境，通常忽略；`requirements.txt`、锁文件或其他环境声明应提交。真实 `.env` 保存秘密并应忽略，而可提交的 `.env.example` 只列出变量名和无敏感值的说明。Git 由此保存如何产生结果的代码、配置与依赖描述，大型数据、checkpoint 和实验输出则交给适合的数据或制品存储系统。

## 综合实践

### 把命令映射回数据模型

阅读 Pro Git 或使用 Learn Git Branching 时，可以为每条命令标注模型变化：

| 命令 | 模型变化 |
|---|---|
| `git add` | 工作区内容写入 index，创建或复用 blob |
| `git commit` | 从 index 创建 tree/commit，移动当前分支 |
| `git branch x` | 新建指向 commit 的引用 |
| `git switch x` | 改变 HEAD 所关联分支，并更新工作区/index |
| `git merge x` | fast-forward 引用，或创建合并快照与 commit |
| `git rebase x` | 在新基底创建重放后的 commits |
| `git fetch` | 获取对象并更新远程跟踪引用 |
| `git push` | 发送对象并请求移动远端引用 |

### 调查课程网站仓库历史

```bash
git clone <course-repository-url>
cd missing-semester

git log --all --graph --decorate --oneline
git log -1 -- README.md
git blame -L '/collections:/,+1' _config.yml
git show <blame-output中的提交ID>
git log -S'collections:' -p -- _config.yml
```

仓库会继续变化，因此最后修改者、提交 ID 和 message 应以执行时结果为准。

### 从多次提交的历史中移除文件

只应在可丢弃的练习仓库中实验：

```bash
git filter-repo --invert-paths --path path/to/large-file.bin
git log --all -- path/to/large-file.bin
git rev-list --objects --all | grep 'large-file.bin'
```

真实秘密泄露时，第一步是撤销或轮换凭据。之后才是隔离协作、使用最新 `git-filter-repo` 清理历史、验证全部引用、协调强制更新并处理缓存、fork 与其他克隆。

历史清理会改变后继提交 ID，可能破坏签名和 pull request，也不能让已经泄露的 token 恢复安全。

### 暂存正在进行的修改

```bash
printf '\nwork in progress\n' >> README.md
git stash push -m "wip: README experiment"
git stash list
git log --all --oneline --decorate
git stash show -p stash@{0}
git stash pop
```

stash 适合短暂切换任务或恢复干净工作区。重要成果应形成分支和 commit。

### 创建 `git graph` alias

```bash
git config --global alias.graph \
  "log --all --graph --decorate --oneline"
git graph
```

对应配置：

```text
[alias]
    graph = log --all --graph --decorate --oneline
```

以 `!` 开头的 alias 会交给 Shell，能力更强，也有更高的注入与可移植性风险。

### 配置全局 ignore

```bash
git config --global core.excludesFile ~/.gitignore_global
```

在该文件中加入本机或编辑器临时项：

```text
.DS_Store
Thumbs.db
*~
*.swp
```

```bash
git config --global --get core.excludesFile
git check-ignore -v path/to/test-file
```

团队共同规则应写入项目 `.gitignore` 并提交。

### 提交有价值的 pull request

标准流程是 fork 仓库、clone 自己的 fork、建立主题分支、完成真实改进、检查 diff 与测试、push 分支并创建 pull request。课程明确要求不要为了完成练习发送无价值或重复 PR；找不到真实改进时可以跳过。

### 制造并解决合并冲突

```bash
git init -b main conflict-lab
cd conflict-lab

printf '1 cup sugar\n2 cups flour\n' > recipe.txt
git add recipe.txt
git commit -m "recipe: add base recipe"

git branch salty
git branch sweet

git switch salty
printf '1 cup salt\n2 cups flour\n' > recipe.txt
git add recipe.txt
git commit -m "recipe: make salty variant"

git switch sweet
printf '2 cups sugar\n2 cups flour\n' > recipe.txt
git add recipe.txt
git commit -m "recipe: make sweeter variant"

git switch main
git merge salty
git merge sweet
```

第二次 merge 会制造冲突。编辑最终内容并删除冲突标记后：

```bash
git add recipe.txt
git merge --continue
git log --graph --decorate --oneline --all
```

本例通过 `git init -b main` 显式固定默认分支名，避免不同 Git 配置使用 `main` 或 `master` 造成步骤差异。

## 常见误区

| 误区 | 更准确的理解 |
|---|---|
| Git 只保存逐行 diff | 概念上保存快照，存储层可使用 delta 压缩 |
| branch 是项目副本 | branch 主要是可移动的 commit 引用 |
| `git add` 会自动包含后续编辑 | add 只暂存执行时内容 |
| commit 会提交整个工作区 | 默认只提交 index |
| `origin/main` 是远端实时状态 | 它是最近 fetch 后的本地远程跟踪引用 |
| pull 总是固定的 fetch+merge | 行为可由配置和选项改变 |
| `.gitignore` 会取消已跟踪文件 | ignore 主要作用于未跟踪文件 |
| 删除含密钥文件就消除了泄露 | 历史、缓存、fork 和克隆仍可能保留，凭据必须轮换 |
| amend/rebase 编辑原 commit | 它们创建新提交并移动引用 |
| force push 是更强的普通 push | 它可能覆盖远端历史，必须协调并使用保护机制 |
| GitHub 就是 Git | Git 是 VCS，GitHub 是托管与协作平台 |

理解 Git 的关键，是在敲命令前先描述目标图状态。要创建对象、移动哪个引用、保留哪层修改、是否改写共享历史。命令只是把这个目标翻译给 Git 的接口。

## 参考来源

- [MIT Missing Semester 2026：Version Control and Git](https://missing.csail.mit.edu/2026/version-control/)
- [MIT Missing Semester 2026 课程主页](https://missing.csail.mit.edu/2026/)
- [简体中文社区页面：Version Control and Git](https://missing-semester-cn.github.io/2026/version-control/)
- [YouTube：Version Control and Git](https://www.youtube.com/watch?v=9K8lB61dl3Y)
- [Pro Git](https://git-scm.com/book/en/v2)
- [Git 命令参考](https://git-scm.com/docs)
- [Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)
- [Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References)
- [git-add 文档](https://git-scm.com/docs/git-add)
- [git-restore 文档](https://git-scm.com/docs/git-restore)
- [git-reset 文档](https://git-scm.com/docs/git-reset)
- [Git 哈希函数迁移文档](https://git-scm.com/docs/hash-function-transition)
- [GitHub：从仓库历史中移除敏感数据](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Learn Git Branching](https://learngitbranching.js.org/)
