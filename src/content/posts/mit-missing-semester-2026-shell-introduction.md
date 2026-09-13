---
title: MIT Missing Semester 2026 第一课：Shell 入门
image: /assets/post-card/post-card-10-v20260818.jpg
cardImagePosition: center 35%
published: 2026-07-26
updated: 2026-07-27
description: MIT Missing Semester 2026 第一课笔记，介绍 Shell、路径、文本工具、管道、重定向、脚本基础及讲义练习涉及的工具。
tags:
  - Shell
  - Bash
  - CLI
category:
  - MIT Missing Semester
  - Tutorial
section: notes
author: nikonikoni
draft: false
---

# MIT Missing Semester 2026 第一课：Shell 入门

## Shell 的作用

现代计算机通常通过图形界面接收操作，但图形界面只能提供预先设计好的按钮和流程。Shell 提供了一种文本接口，可以运行程序、传入参数、连接输入与输出，并将重复操作组织成可复用的自动化流程。

Shell、终端和命令行程序是三个不同的概念：

| 概念 | 作用 | 常见例子 |
|---|---|---|
| 终端 | 显示文本输出并传递键盘输入 | Windows Terminal、Terminal.app |
| Shell | 解析命令、变量、管道和重定向 | Bash、Zsh、PowerShell |
| 命令行程序 | 执行具体任务 | `grep`、`find`、`python` |

以以下命令为例：

```bash
echo hello
```

Shell 首先解析命令，确定需要执行 `echo`，再把 `hello` 作为参数传给它。程序产生的标准输出随后由终端显示。

Bash 是课程采用的共同基线。Zsh 和 Fish 具有许多人机交互改进，但不如 Bash 普遍。Windows 原生的 `cmd.exe` 和 PowerShell 不是 Unix Shell；在 Windows 上应使用 WSL 或 Linux 虚拟机。Shell 能力也常用于阅读开源项目安装说明、配置持续集成和诊断程序故障。

常见提示符可能写成：

```text
missing:~$
```

其中 `missing` 是主机名，`~` 表示当前位于 home 目录，`$` 通常表示当前不是 root 用户。

## 命令与参数

Shell 通常使用空白字符分隔命令和参数：

```bash
echo hello world
```

第一个单词是命令，后续单词是传入程序的参数。如果参数包含空格或特殊字符，需要使用引号或转义：

```bash
cd "My Photos"
cd My\ Photos
```

常见引号的行为不同：

- 单引号通常把内容按字面量处理；
- 双引号保留参数整体，同时允许变量与命令替换；
- `$'...'` 支持 `\n` 等 ANSI-C 转义。

```bash
echo '$HOME !'       # 字面输出 $HOME 和 !
echo "$HOME !"       # 展开 $HOME
printf '%s\n' $'first\nsecond'
```

引号不仅影响显示，还决定变量、通配符和特殊字符由 Shell 如何解释。处理文件名或用户输入时，正确引用变量能够避免参数被意外拆分。

### 文件名展开

Shell 会在启动程序前处理未引用的文件名模式：

| 模式 | 含义 | 示例 |
|---|---|---|
| `*` | 匹配任意长度的字符串 | `*.txt` |
| `?` | 匹配单个字符 | `file?.txt` |
| `[...]` | 匹配集合或范围中的一个字符 | `file[0-9].txt` |
| `{a,b,c}` | 生成多个候选字符串；这是花括号展开 | `{a,b,c}.txt` |

```bash
ls *.txt
ls file?.txt
ls file[0-9].txt
ls {a,b,c}.txt
```

这些模式统称为 **glob（文件名通配模式）**。当 Shell 读到它们时，会先在当前目录中寻找匹配的文件名，再把匹配结果传给 `ls` 等程序。例如，`ls *.txt` 实际上传给 `ls` 的可能是 `a.txt b.txt`。

需要注意的是，glob 与正则表达式不是同一种语法。`find -name "*.zip"` 中的模式需要引用，否则当前 Shell 可能先展开 `*.zip`，使 `find` 收到与预期不同的参数。

## 使用帮助系统

命令行工具通常通过手册和帮助选项提供使用说明：

```bash
man date
date --help
```

`man` 适合查看完整手册，`--help` 通常提供较短的参数说明。面对陌生命令时，可以采用以下顺序：

1. 确认命令的参数结构；
2. 查找目标选项；
3. 在测试目录中使用小规模数据验证；
4. 确认行为后再处理真实文件。

这种方法比记忆固定命令更可靠，也能降低直接复制网络命令带来的风险。

## 工作目录与路径

每个 Shell 进程都有当前工作目录。许多程序在没有收到明确路径时，会对当前目录执行操作。

```bash
pwd
cd /
cd ~
cd ..
ls
```

这些命令和路径分别表示：

| 写法 | 含义 |
|---|---|
| `pwd` | 显示当前工作目录 |
| `/` | Unix 文件系统根目录 |
| `~` | 当前用户的 home 目录 |
| `.` | 当前目录 |
| `..` | 父目录 |
| `cd` | 切换当前 Shell 的工作目录 |
| `ls` | 列出目录内容 |

绝对路径从 `/` 开始，描述从文件系统根到目标的完整位置：

```text
/home/alice/project/data.txt
```

相对路径以当前工作目录为起点：

```text
project/data.txt
```

相对路径是否正确取决于当前工作目录。遇到文件不存在的问题时，应先检查 `pwd`、目录内容和文件名，而不是立即使用更高权限。

按 `Tab` 可以触发路径或命令补全。`pwd` 与 `echo "$PWD"` 都能查看当前工作目录。

### 使用 `ls` 查看目录与权限

```bash
ls
ls /bin
ls -a
ls -l
ls -lh
ls -la
```

- `ls` 默认列出当前目录，给出路径时列出指定目录；
- `-a` 包含以 `.` 开头的隐藏项；
- `-l` 使用长格式，显示类型、权限、链接数、所有者、组、大小和修改时间等；
- `-h` 与 `-l` 组合时用易读单位显示大小；
- `ls` 只查看内容，不会打开、修改或删除文件。

长格式的权限字段例如：

```text
-rw-r--r-- 1 user group 45 Jul 26 19:20 hello.txt
drwxr-xr-x 2 user group 4.0K Jul 26 18:00 Documents
```

最前面的十个字符中，第一个表示类型：`-` 是普通文件，`d` 是目录，`l` 是符号链接；后九个字符按所有者、所属组、其他用户分成三组 `rwx` 权限。目录的 `x` 表示可以穿越并访问其中条目。

## PATH 与命令查找

输入不包含路径的命令时，Shell 会使用 `PATH` 环境变量查找可执行程序。

```bash
echo "$PATH"
which echo
type echo
type -a echo
command -V echo
```

`PATH` 包含一组以冒号分隔、按顺序排列的目录。Shell 从前到后搜索与外部命令同名的可执行文件，并运行首先找到的版本。列出这些目录的内容，可以了解当前环境能够直接调用哪些外部程序。

Shell 不一定一开始就查询 `PATH`。命令名还可能解析为别名、Shell 函数或内建命令。`echo`、`cd`、`pwd`、`export` 和 `alias` 都可能由 Shell 自己实现；系统中又可能同时存在 `/bin/echo` 等外部版本。

```bash
echo hello          # 通常调用 Shell 内建 echo
/bin/echo hello     # 明确调用外部程序
```

`which` 主要面向 `PATH` 中的外部程序，对别名、函数和内建命令的行为会随实现变化。检查一个名称实际会被解释为什么时，`type` 或 `command -V` 更可靠；`type -a` 可列出全部同名实现。

因此，即使程序已经安装，也可能因为以下原因出现 `command not found`：

- 安装目录不在 `PATH` 中；
- 环境变量修改尚未加载；
- 命令名称不正确；
- 当前 Shell 使用了不同的环境配置。

当系统中存在多个同名程序时，`which` 可以帮助确认实际运行的是哪个文件。也可以使用绝对路径绕过 `PATH`：

```bash
/bin/echo hello
```

绝对路径只绕过命令查找，不会绕过 Shell 的参数处理。例如 `/bin/echo "$PATH"` 中的变量仍由 Shell 先展开，再交给外部程序。

## 常用文本工具

Unix 命令行环境强调使用功能相对单一的工具，并通过统一的文本接口组合它们。

| 工具 | 主要用途 |
|---|---|
| `cat` | 输出文件内容 |
| `sort` | 按行排序 |
| `uniq` | 合并相邻的重复行 |
| `head` | 查看文件开头 |
| `tail` | 查看文件结尾 |
| `grep` | 查找匹配的行 |
| `sed` | 流式转换或编辑文本 |
| `find` | 按条件递归查找文件 |
| `awk` | 按记录和字段处理文本 |

### cat、sort、uniq、head 与 tail

```bash
cat file.txt
cat part1.txt part2.txt
sort file.txt
uniq file.txt
sort file.txt | uniq
sort -u file.txt
head -n 3 file.txt
tail -n 3 file.txt
```

- `cat` 的名称来自 concatenate，可按参数顺序连接并输出多个文件；
- `sort` 按行排序，默认只输出结果，不修改原文件；
- `uniq` 只合并相邻重复行，因此全局去重或计数前通常要先 `sort`；
- `sort -u` 可直接排序并去重；
- `head` 和 `tail` 默认各显示十行，`-n` 指定行数。

```bash
sort names.txt | uniq -c
```

`cat > hello.txt` 会让 `cat` 从 stdin 读取，Shell 再把 stdout 写入文件。交互输入结束时按 `Ctrl+D` 发送 EOF。

### grep

`grep` 根据模式筛选匹配行，默认打印包含匹配片段的整行，不修改输入文件：

```bash
grep 'apple' hello.txt
grep -i 'apple' hello.txt
grep -n 'apple' hello.txt
grep -v 'apple' hello.txt
grep -l 'TODO' *.py
grep -q 'apple' hello.txt
grep -rn --include='*.py' 'TODO' .
```

| 选项 | 作用 |
|---|---|
| `-i` | 忽略大小写 |
| `-n` | 显示原文件行号 |
| `-v` | 反选不匹配的行 |
| `-r` | 递归搜索目录 |
| `-l` | 只输出包含匹配项的文件名 |
| `-q` | 静默，只通过退出状态表示是否匹配 |
| `--include='*.py'` | 递归时只搜索匹配该 glob 的文件 |

默认模式是基本正则表达式。`^apple` 匹配以 `apple` 开头的行，`apple$` 匹配以它结尾的行。正则中的 `$`、`*`、`[` 等字符对 Shell 也可能有意义，因此模式通常用单引号保护。递归搜索前应确认起点，避免扫描过大的目录。

### sed

`sed` 是流编辑器，最常见用途是按规则替换文本：

```bash
sed 's/apple/orange/' hello.txt
sed 's/apple/orange/g' hello.txt
sed 's/old/new/g' file.txt
```

`s/pattern/replacement/g` 中，`s` 表示替换，分隔符分开模式与替换文本，`g` 表示替换每一行中的所有匹配；没有 `g` 时只替换每行第一个匹配。没有 `-i` 时结果写到 stdout，原文件不变。

加入 `-i` 后会直接修改原文件：

```bash
sed -i 's/old/new/g' file.txt
```

安全做法是先运行不带 `-i` 的版本，检查标准输出，再决定是否写回文件。扩展正则可使用 `-E`；替换文本中的 `\1` 等反向引用对应模式中的捕获组。

### find

`find` 的基本模型是：

```text
find 起点 条件 条件 动作
```

它会递归遍历起点下的目录树，只有满足全部条件的对象才执行动作；没有显式动作时默认打印路径。

```bash
find ~/Downloads -type f -name "*.zip" -mtime +30
find ~ -type f -size +100M -exec ls -lh {} \;
find . -type f -name "*.py" -exec grep -l "TODO" {} \;
```

| 表达式 | 含义 |
|---|---|
| `-type f` / `-type d` | 普通文件 / 目录 |
| `-name "*.zip"` | 名称匹配 glob；引号阻止 Shell 预先展开 |
| `-mtime +30` | 按完整 24 小时时段计算，内容修改时间超过约 30 天 |
| `-size +100M` | GNU `find` 中大于 100 MiB 单位的大小区间 |
| `-exec command {} \;` | 每个匹配对象执行一次命令 |
| `-exec command {} +` | 尽量把多个路径批量交给一次命令 |

`{}` 是当前匹配路径的占位符；`\;` 结束 `-exec`，反斜杠防止分号被 Shell 当成命令分隔符。`+` 通常比逐文件执行更高效：

```bash
find ~ -type f -size +100M -exec ls -lh {} +
```

复杂搜索应先只打印路径，逐项增加条件，再加入修改性动作。`Permission denied` 只表示当前用户无法遍历相应路径。

### awk

`awk` 适合处理具有规则字段结构的文本：

```bash
awk '{print $2}' data.txt
awk -F, '{print $2}' data.csv
```

第一条命令按空白分隔字段，第二条使用逗号作为分隔符。除字段提取外，`awk` 还可以过滤记录、计算统计值和重组输出。

`awk` 通常逐行读取输入。一行称为一个记录，记录再按字段分隔符拆成字段：

| 写法 | 含义 |
|---|---|
| `$0` | 当前完整记录 |
| `$1`、`$2`…… | 当前记录的第 1、2……个字段 |
| `NF` | 当前记录的字段数 |
| `NR` | 从程序开始到现在读取的记录数 |
| `-F ','` | 将字段分隔符设置为逗号 |

默认字段分隔符是一个具有特殊语义的空格：连续的空格、Tab 等空白序列会被作为一个分隔区域，而不是产生多个空字段。

`awk` 程序的基本结构是：

```text
pattern { action }
```

`pattern` 决定当前记录是否匹配，`action` 决定匹配后执行的动作。省略 `pattern` 时，动作应用于每条记录；只有 `pattern` 而省略动作时，默认打印整条记录 `$0`。

以下示例依次完成字段选择、条件过滤、求和与计数：

```bash
awk -F ',' '{print $1, $3}' people.csv
awk -F ',' 'NR > 1 && $2 > 18 {print $1, $3}' people.csv
awk -F ',' 'NR > 1 {sum += $2} END {print sum}' people.csv
awk 'END {print NR}' data.txt
```

`$2` 是 `awk` 语言中的字段引用，不是 Shell 变量。将 `awk` 程序放在单引号内，可以防止 Shell 提前展开其中的 `$`。

`-F ','` 适合不包含带引号逗号、换行或转义引号的简单数据。完整 CSV 格式允许这些结构，不能一概按逗号机械切分。支持相应功能的新版 GNU `gawk` 可以使用 `--csv`；对可移植程序或复杂 CSV，更稳妥的做法是使用专门的 CSV 解析器。

### 拆解 SSH 日志分析管道

这是一个组合示例：

```bash
ssh myserver 'journalctl -u sshd -b-1 | grep "Disconnected from"' \
  | sed -E 's/.*Disconnected from .* user (.*) [^ ]+ port.*/\1/' \
  | sort | uniq -c \
  | sort -nk1,1 | tail -n10 \
  | awk '{print $2}' | paste -sd,
```

这条命令把远程 SSH 日志逐步转换为出现频率最高的十个用户名：

| 阶段 | 作用 |
|---|---|
| `ssh myserver '…'` | 在远程主机执行引号中的命令；引号外的管道在本地继续处理 |
| `journalctl -u sshd -b-1` | 读取 `sshd` 单元在上一次启动期间的日志；也可写成更易读的 `-b -1` |
| `grep "Disconnected from"` | 只保留断开连接的日志行 |
| `sed -E 's/…/\1/'` | 用扩展正则的捕获组提取用户名，`\1` 引用第一个捕获组 |
| `sort` | 把相同用户名排列到一起 |
| `uniq -c` | 统计每组相邻相同行的数量 |
| `sort -nk1,1` | 仅按第一字段进行数值升序排列 |
| `tail -n10` | 取升序结果末尾的十项，即频次最高的十项 |
| `awk '{print $2}'` | 去掉计数，只保留用户名 |
| `paste -sd,` | 将多行以逗号连接成一行 |

`sed` 中的 `(.*)` 是贪婪匹配，整个表达式也依赖具体的日志格式。日志格式改变时，提取结果可能不再正确。因此，长管道应从左向右逐段构建：

```bash
producer
producer | filter
producer | filter | extract
producer | filter | extract | sort
```

每加入一个阶段，都应检查当前数据的字段、排序状态和下一阶段的输入假设。

## 标准输入、标准输出与标准错误

命令行程序通常使用三条标准流：

| 标准流 | 文件描述符 | 作用 |
|---|---:|---|
| stdin | 0 | 输入数据 |
| stdout | 1 | 正常结果 |
| stderr | 2 | 错误与诊断信息 |

默认情况下，stdin 来自键盘，stdout 和 stderr 显示在终端。Shell 可以把这些流连接到文件：

```bash
command < input.txt
command > output.txt
command >> output.txt
command 2> error.txt
command > all.txt 2>&1
```

其中：

- `<` 从文件读取标准输入；
- `>` 覆盖文件并写入标准输出；
- `>>` 追加标准输出；
- `2>` 单独重定向标准错误；
- `2>&1` 让标准错误指向当前标准输出的目标。

重定向会从左到右处理，因此调整顺序可能改变最终结果。对重要文件使用 `>` 前，应确认目标文件是否允许被覆盖。

如果命令没有收到文件参数，它通常会从 stdin 读取。例如：

```bash
grep apple
```

可以逐行键入文本，最后按 `Ctrl+D` 发送 EOF，表示输入流结束。EOF 不是实际输入的字符，而是“不会再有后续数据”的状态。

输入重定向与文件参数有时产生相同输出，但文件由不同主体打开：

```bash
sort < hello.txt   # Shell 打开文件，并把文件连接到 sort 的 stdin
sort hello.txt     # sort 收到文件名参数，并自行打开文件
```

`>` 会在命令运行前创建目标文件；如果文件已存在，则先把它截断为零长度。因此，单独执行以下语句也会清空文件：

```bash
> result.txt
```

重定向的顺序可以通过文件描述符模型理解：

```bash
command > all.log 2>&1
command 2>&1 > out.log
```

第一条命令先让 stdout 指向文件，再让 stderr 复制 stdout 的当前目标，因此两者都进入文件。第二条命令先让 stderr 复制仍指向终端的 stdout，随后才改变 stdout，因此 stderr 仍显示在终端。Bash 还提供 `command &> all.log` 作为同时重定向两者的专有简写。

## 管道与程序组合

管道符 `|` 把左侧程序的 stdout 连接到右侧程序的 stdin：

```bash
producer | transformer | consumer
```

例如：

```bash
printf 'pear\napple\npear\n' | sort | uniq -c | sort -nr
```

这个管道依次执行：

1. 产生多行文本；
2. 对文本排序，使相同内容相邻；
3. 统计每种内容的数量；
4. 按数字降序排列。

管道传递的是字节流，而不是文件本身。stderr 默认不会进入管道，除非显式重定向。

调试复杂管道时，适合从左向右逐步扩展：

```bash
producer
producer | filter
producer | filter | sort
producer | filter | sort | uniq -c
```

每增加一个步骤，都应先观察当前数据的格式和含义。

`tee` 可以在保留管道输出的同时把内容写入文件：

```bash
command | tee full.log | grep CRITICAL
```

完整输出进入 `full.log`，而终端只显示经过筛选的行。

`tee` 默认覆盖目标文件，追加写入需要 `-a`：

```bash
command | tee -a full.log | grep CRITICAL
```

`tee` 只复制进入其 stdin 的数据。若上游程序的 stderr 也需要保存，必须先显式合并或单独重定向。

## 退出状态与条件执行

Unix 程序通常使用退出状态报告执行结果：

- `0` 表示成功；
- 非零值表示失败。

上一条命令的退出状态保存在 `$?`：

```bash
command
echo "$?"
```

Shell 的条件控制主要依据退出状态，而不是命令输出的文字：

```bash
command1 && command2
command1 || command2
```

- `&&` 只在前一个命令成功时执行后一个命令；
- `||` 只在前一个命令失败时执行后一个命令。

## Bash 条件与循环

Bash 不只是交互式命令环境，也是一门脚本语言。

### 条件语句

```bash
if [ -f "$file" ]; then
    echo "file exists"
else
    echo "file does not exist"
fi
```

`test` 或 `[` 可以判断文件、字符串和数值条件。变量通常应放在双引号中，避免空值或空格导致参数结构发生变化。

`if` 判断的是条件命令的退出状态。例如：

```bash
if grep -q "apple" hello.txt; then
    echo "found"
else
    echo "not found"
fi
```

`grep -q` 不打印匹配行，只通过退出状态报告是否找到。`if command; then` 中的分号是命令分隔符；如果把 `then` 放在下一行，换行本身就可以结束前一条命令：

```bash
if grep -q "apple" hello.txt
then
    echo "found"
fi
```

`test`、`[` 与 `[[` 的关系如下：

| 写法 | 性质 | 适用范围 |
|---|---|---|
| `test -f "$file"` | 条件测试命令 | POSIX Shell |
| `[ -f "$file" ]` | `test` 的另一种形式，`]` 是最后一个参数 | POSIX Shell |
| `[[ -f $file ]]` | Bash 条件复合命令，不进行普通的分词与文件名展开 | Bash/Ksh 等，非 POSIX |

在 `[` 形式中，各操作符和操作数必须是独立参数，因此 `[` 后和 `]` 前必须保留空格：

```bash
[ -f "$file" ]      # 正确
[-f "$file"]        # 错误
```

常见文件测试包括：

| 测试 | 含义 |
|---|---|
| `-e path` | 路径存在 |
| `-f path` | 存在且为普通文件 |
| `-d path` | 存在且为目录 |
| `-r path` | 当前进程可读 |
| `-w path` | 当前进程可写 |

字符串相等的可移植写法是：

```bash
[ "$name" = "Alice" ]
```

在 `[` 中引用变量，可以防止空值或空格改变参数个数。Bash 的 `[[ ... ]]` 还支持模式匹配；当 `==` 右侧未引用时，右侧可作为模式：

```bash
if [[ $filename == *.txt ]]; then
    echo "text file"
fi
```

需要 `#!/bin/sh` 可移植性时应使用 `[ ... ]`；明确使用 Bash 时可以使用 `[[ ... ]]`。

### for 循环

```bash
for item in a b c; do
    echo "$item"
done
```

### while 循环

```bash
while command; do
    another_command
done
```

只要条件命令持续返回成功状态，`while` 就会继续执行。

例如：

```bash
count=1
while [[ $count -le 5 ]]; do
    echo "$count"
    ((count++))
done
```

这里的 `((count++))` 是 Bash 算术命令。连续整数循环还可以写成：

```bash
for i in {1..10}; do
    echo "$i"
done

for ((i = 1; i <= 10; i++)); do
    echo "$i"
done
```

### 命令替换

`$(...)` 会执行内部命令，并把 stdout 替换到原位置：

```bash
backup="notes_$(date +%Y-%m-%d).txt"
```

例如，`seq 1 10` 逐行输出 1 到 10，命令替换可以把这些输出放进 `for` 的值列表：

```bash
for i in $(seq 1 10); do
    echo "$i"
done
```

与旧式反引号相比，`$(...)` 更容易阅读并且支持嵌套。

旧式写法 `` `command` `` 仍然是命令替换，但边界不清晰，嵌套时需要额外转义。命令替换会删除末尾换行；未引用的结果还会经历分词和文件名展开。因此，`for file in $(find ...)` 无法可靠处理包含空格或换行的文件名。

## 后台任务与进程清理

命令末尾的 `&` 会异步启动命令，使 Shell 不等待其完成就继续执行。特殊参数 `$!` 是最近放入后台的作业的进程 ID：

```bash
long_running_command &
worker_pid=$!

# 执行其他工作

kill "$worker_pid"
```

`kill` 默认发送 `SIGTERM`，请求进程有序终止。若脚本可能在中途退出，只在正常路径末尾调用 `kill` 无法保证清理，可以使用退出陷阱：

```bash
cleanup() {
    kill "$worker_pid" 2>/dev/null || true
}
trap cleanup EXIT
```

`trap ... EXIT` 会在 Shell 退出前执行清理函数。实际脚本仍需处理后台进程已经结束、变量尚未赋值等边界。

## Shell 脚本执行

Shell 命令可以保存为 `.sh` 文件。脚本开头通常包含 shebang：

```bash
#!/usr/bin/env bash
```

shebang 指定直接执行文件时使用的解释器。

脚本可以显式交给 Bash：

```bash
bash script.sh
```

也可以增加执行权限后直接运行：

```bash
chmod +x script.sh
./script.sh
```

直接执行依赖正确的 shebang 和执行权限。

三种运行方式的解释器选择不同：

- `./script.sh` 直接执行文件，由 shebang 指定解释器；
- `bash script.sh` 明确让 Bash 读取文件，不依赖执行权限，也不依赖 shebang 选择 Bash；
- `sh script.sh` 明确使用 `sh`，不会因为脚本的 Bash shebang 自动切换。

因此，使用 `[[ ... ]]`、`(( ... ))` 等 Bash 语法的脚本不应通过 `sh script.sh` 运行。变量赋值的等号两侧也不能加空格：

```bash
LOGFILE="test.log"     # 正确
LOGFILE = "test.log"   # 错误：会被解析为执行 LOGFILE 命令
```

## 更严格的 Bash 模式

常见脚本会启用：

```bash
set -euo pipefail
```

这些选项的基本含义是：

- `-e`：未处理的命令失败时尽早退出；
- `-u`：使用未定义变量时报错；
- `pipefail`：管道中的关键命令失败时让整个管道报告失败。

严格模式可以减少静默错误，但不能代替测试和错误处理。ShellCheck 等静态分析工具可以发现许多常见的引用、条件和可移植性问题。

这些选项有更精确的边界：

- `set -e` 有控制流例外。命令作为 `if`、`while`、`until` 的条件，或位于某些 `&&`、`||`、`!` 上下文时，非零状态不会直接使脚本退出；
- `set -u` 会把未定义变量视为错误。有意使用默认值时可以写 `${name:-unknown}`；
- `set -o pipefail` 使管道返回最右侧非零命令的状态；如果所有命令成功，则返回 0；
- 算术命令 `(( expression ))` 在表达式结果为 0 时返回状态 1，因此与 `set -e` 组合时需要注意所处上下文。

## 综合示例：反复运行测试直到失败

下面的脚本组合了严格模式、后台任务、特殊参数、命令替换、循环和重定向：

```bash
#!/bin/bash
set -euo pipefail

stress --cpu 8 &
STRESS_PID=$!

LOGFILE="test_runs_$(date +%s).log"
RUN=1

while cargo test my_test > "$LOGFILE" 2>&1; do
    echo "Run $RUN passed"
    ((RUN++))
done

kill "$STRESS_PID"
echo "Test failed on run $RUN"
echo "Last 20 lines of output:"
tail -n 20 "$LOGFILE"
echo "Full log: $LOGFILE"
```

执行流程如下：

1. `stress --cpu 8 &` 在后台启动八个 CPU 压力工作进程；
2. `STRESS_PID=$!` 保存后台作业的 PID；
3. `$(date +%s)` 产生 Unix 时间戳，用于生成不同的日志文件名；
4. `while cargo test ...; do` 直接用测试命令的退出状态控制循环；
5. `> "$LOGFILE" 2>&1` 先把 stdout 指向日志，再让 stderr 复制 stdout 的目标；
6. 测试成功时输出轮次并递增计数，失败时退出循环；
7. `kill` 停止后台负载，`tail` 显示失败日志的最后 20 行。

该示例适合解释语义，但仍有四个工程边界：

- `stress` 会显著占用 CPU，不应在不了解影响时直接运行；
- 循环中的 `>` 会在每轮覆盖日志，因此最终只保留最后一轮输出；若要保留全部轮次，应使用 `>>` 并加入轮次分隔；
- 如果脚本在执行 `kill` 前异常退出，后台任务可能继续运行，应使用 `trap cleanup EXIT`；
- 如果测试始终成功，循环不会结束，实际脚本应增加最大轮数或外部超时。

一个带清理和最大轮数的结构可以写成：

```bash
#!/usr/bin/env bash
set -euo pipefail

stress --cpu 8 &
STRESS_PID=$!

cleanup() {
    kill "$STRESS_PID" 2>/dev/null || true
}
trap cleanup EXIT

LOGFILE="test_runs_$(date +%s).log"
RUN=1
MAX_RUNS=100

while [[ $RUN -le $MAX_RUNS ]] &&
      cargo test my_test > "$LOGFILE" 2>&1; do
    echo "Run $RUN passed"
    ((RUN++))
done
```

这个版本保证 Shell 退出时尝试清理后台任务，并为循环设置上限。日志保留策略仍需根据目标选择覆盖或追加。

## 补充

以下是若干正文没有展开、但属于 Shell 基础链条的知识。

### 确认当前环境

```bash
echo "$SHELL"
```

`$SHELL` 通常记录账户的登录 Shell，例如 `/bin/bash` 或 `/usr/bin/zsh`。它不保证等于当前进程实际使用的解释器；精确诊断时可结合 `ps -p $$ -o comm=`。课程要求的是 Unix 风格 Shell，而不是直接在 `cmd.exe` 或 PowerShell 中执行 Bash 语法。

### 分离标准输出与标准错误

```bash
ls /nonexistent /tmp >stdout.log 2>stderr.log
ls /nonexistent /tmp >all.log 2>&1
```

第一条命令把正常结果与错误诊断分开保存；第二条把两条流合并。重定向从左到右生效。

### 退出状态与短路执行

```bash
test -d /tmp/mydir || mkdir /tmp/mydir
```

`$?` 保存上一条命令的退出状态；`&&` 只在左侧成功时执行右侧，`||` 只在左侧失败时执行右侧。创建目录这一特定需求也可直接使用 `mkdir -p /tmp/mydir`。

### `cd` 为什么是内建命令

外部程序作为子进程运行，不能永久修改父 Shell 的当前工作目录。若 `cd` 是普通外部程序，它只能改变自己的目录，进程退出后父 Shell 仍停留在原位置。因此 `cd` 必须由当前 Shell 进程执行。

### 脚本位置参数

```bash
#!/usr/bin/env bash

file=$1
if [[ -f $file ]]; then
    printf '%s\n' "file exists: $file"
else
    printf '%s\n' "file does not exist: $file"
fi
```

| 参数 | 含义 |
|---|---|
| `$0` | 脚本或 Shell 名称 |
| `$1`、`$2`…… | 第 1、2……个位置参数 |
| `$#` | 位置参数个数 |
| `"$@"` | 保持每个位置参数为独立参数 |

把固定测试命令改为调用者传入的命令时，可以写：

```bash
if (( $# == 0 )); then
    printf '%s\n' "usage: $0 command [arg ...]" >&2
    exit 2
fi

while "$@" >"$LOGFILE" 2>&1; do
    ((RUN++))
done
```

这里使用 `"$@"` 才能保留包含空格的参数边界。

### 执行权限与跟踪

```bash
chmod +x check.sh
./check.sh somefile
```

`chmod +x` 增加执行位；`./` 明确指定当前目录中的文件。`bash check.sh` 是让 Bash 读取文件，不要求脚本本身有执行位。

`set -x` 会在命令展开后、执行前输出跟踪信息，通常带 `+` 前缀；`set +x` 关闭：

```bash
set -x
command arg
set +x
```

执行跟踪可能把令牌或密码写入日志，因此不应无条件用于含敏感值的脚本。

### 日期命名

```bash
cp -- notes.txt "notes_$(date +%Y-%m-%d).txt"
```

命令替换把当前日期嵌入目标文件名；双引号保持路径为单个参数，`--` 结束选项解析。

### 统计常见扩展名

```bash
find "$HOME" -type f -name '*.*' -printf '%f\n' 2>/dev/null \
  | sed -n 's/.*\.//p' \
  | tr '[:upper:]' '[:lower:]' \
  | sort \
  | uniq -c \
  | sort -nr \
  | head -n 5
```

该流水线提取最后一个点后的扩展名，统一大小写，再排序、计数并取前五。扩展名不是文件系统强类型；隐藏文件、多重扩展名和无扩展名文件需要先定义统计口径。

### `xargs` 与文件名安全

`xargs` 从 stdin 读取项目并把它们转换成命令参数。默认空白分隔不能安全处理包含空格、Tab 或换行的路径，常见稳健组合使用 NUL 分隔：

```bash
find . -type f -name '*.sh' -print0 | xargs -0 -r wc -l
```

- `find -print0` 用 NUL 终止每个路径；
- `xargs -0` 按 NUL 读取；
- GNU `xargs -r` 在没有输入时不执行命令，但不是所有平台都有该选项；
- `find ... -exec wc -l {} +` 也能批量且安全地传递路径。

### `curl` 与网页响应

```bash
curl -s "$COURSE_URL" | grep -c 'href="/2026/'
```

`COURSE_URL` 表示文末列出的课程主页。`curl` 把响应正文写到 stdout，因此能直接进入文本管道。示例按当前页面中 2026 课程链接的 `href` 前缀计数；实际使用前应确认该模式确实每讲只出现一次。`-s` 隐藏进度与常规错误信息；自动化脚本通常用 `-fsS` 让 HTTP 错误产生失败状态且保留诊断，跟随重定向时再加入 `-L`。基于 HTML 字符串的计数依赖页面结构，页面更新后模式也要复核。

### `jq` 与 JSON

```bash
curl -fsSL "$JSON_URL" \
  | jq -r '.[] | select(.version > 6) | .name'
```

`JSON_URL` 表示文末列出的课程练习示例 JSON。命令中：

- `.[]` 依次产生数组元素；
- `select(.version > 6)` 保留满足条件的对象；
- `.name` 取得字段；
- `-r` 把 JSON 字符串按原始文本输出。

与正则处理 JSON 相比，`jq` 保留数组、对象、数字和字符串的结构语义。

### `awk` 过滤与重排

```bash
printf 'a 50 x\nb 150 y\nc 200 z\n' \
  | awk '$2 > 100 {print $3, $2, $1}'
```

输出：

```text
y 150 b
z 200 c
```

条件 `$2 > 100` 过滤第二字段，动作按第三、第二、第一字段重组输出。相关形式 `awk '$3 ~ /pattern/ {$4=""; print}'` 中，`~` 表示正则匹配；把 `$4` 设为空后使用默认 `print` 会重建整条记录。

### 历史记录统计

```bash
awk '{print $1}' ~/.bash_history \
  | sort \
  | uniq -c \
  | sort -nr \
  | head -n 10
```

这只是近似统计。多行命令、前导环境变量、`sudo`、管道、时间戳和 Zsh 扩展历史格式都会改变第一字段的含义。可靠分析应先观察实际历史格式，再定义“命令”的统计口径。

## Shell 的适用边界

Shell 适合：

- 组合现有命令；
- 批量处理文件；
- 编写构建、部署和环境初始化入口；
- 自动化短小、线性的系统任务。

当脚本需要复杂数据结构、大量错误处理、并发控制或系统化测试时，Python 等通用编程语言通常更容易维护。

Shell 的优势不在于替代所有编程语言，而在于用统一的输入输出模型，把已有工具高效组合成新的工作流。完成这些基础后，课程下一讲将继续讨论如何用 Shell 和更多命令行程序执行、组合并自动化更复杂的任务。

## 参考来源

- [MIT Missing Semester 2026：Course Overview + Introduction to the Shell](https://missing.csail.mit.edu/2026/course-shell/)
- [MIT Missing Semester 2026 课程主页](https://missing.csail.mit.edu/)
- [简体中文社区翻译：课程概览 + Shell 入门](https://missing-semester-cn.github.io/2026/course-shell/)
- [YouTube：Lecture 1 — Course Overview + Introduction to the Shell](https://www.youtube.com/watch?v=MSgoeuMqUmU)
- [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [GNU Awk User’s Guide](https://www.gnu.org/software/gawk/manual/)
- [GNU Coreutils Manual](https://www.gnu.org/software/coreutils/manual/)
- [GNU Grep Manual](https://www.gnu.org/software/grep/manual/)
- [GNU Findutils Manual](https://www.gnu.org/software/findutils/manual/)
- [GNU sed Manual](https://www.gnu.org/software/sed/manual/)
- [curl Manual](https://curl.se/docs/manpage.html)
- [jq Manual](https://jqlang.org/manual/)
- [课程练习示例 JSON](https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json)
- [systemd：journalctl Manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)
- [OpenSSH：ssh(1) Manual](https://man.openbsd.org/ssh)
