---
title: LLM中的提示词压缩工程
image: /assets/post-card/post-card-33-v20260819.jpg
cardImagePosition: center 35%
published: 2026-11-26
updated: 2026-11-26
description: 一篇关于提示词压缩工程的综述
tags:
  - LLM
  - Deep Learning
category:
  - LLM
section: technology
author: nikonikoni
draft: false
---

# LLM中的提示词压缩工程

在自回归LLM中，模型接收提示词并将其映射为词嵌入向量，然后在每一层计算key和value，并存入缓存。然而，当上下文窗口变长时，过长的提示词可能增加计算量，导致模型推理效率下降；也可能“稀释”模型的注意力分配，导致模型输出质量下降。本文将介绍多种常见的提示词压缩方法。

[TOC]

## 一、压缩对象和预算

先建立一个整体的认知：记任务指令为 $I$，上下文或示例为 $X$，当前问题为 $q$，回答为 $y$，$\oplus$ 表示沿序列维拼接。若只压缩上下文，原始和压缩后的两条计算路径可写为

$$
P_{\rm full}(y)=P_G(y\mid I,X,q),\qquad
Z=C(X;q),\qquad P_{\rm comp}(y)=P_G(y\mid I,Z,q).
$$

-  $C(X;q)$ 可以针对这次问题保留证据；$C(X)$ 可以提前为同一文档建立一份表示，随后服务多个问题
- 设 $B$ 为预算、$\ell$ 为任务损失。目标函数记为 $\min_C\mathbb E[\ell(G(I,C(X;q),q),y)]$，约束为 $|C(X;q)|\le B$。

| 输出给生成模型的表示 | 本文中的方法 | 长度缩短的位置 |
|---|---|---|
| 原文中保留下来的词、短语或文档 | Selective Context、LLMLingua、LongLLMLingua、LLMLingua-2、AdaComp | 选择子序列或文档前缀 |
| 重新生成的自然语言 | Nano-Capsulator、CompAct、FAVICOMP | 生成短提示或证据摘要 |
| 固定前缀参数，或从指令、上下文读出的状态 | CC、GIST、AutoCompressor | 用少量可训练位置或缓存代替原前缀 |
| 编码器产生的向量或逐层 KV | ICAE、500xCompressor、xRAG、UniICL | 向生成端传递有限个位置 |

## 二、硬提示：Filtering

### 1. Selective Context

![Compressing Context to Enhance Inference Efficiency of Large Language Models，原图 2](<images/prompt compression/selective.png>)

*原论文图 2。上半部按自信息着色，下半部显示筛选后留下的原文单元。* <a id="use-4" name="use-4"></a>[〔4〕](#ref-4)

- **自信息。** 小型因果语言模型在位置 $t$ 给词表打分 $z_t$。先归一化 $p_t(v)=\operatorname{softmax}(z_t)_v$，再取原文实际出现的 $x_t$。它的自信息为 $s_t=-\log_2 p_t(x_t)$。越容易根据前文预测的词，分数越低。
- 固定一个位置，对词表求期望，得到预测分布的熵；固定一段已经发生的文本，沿位置平均，得到模型在该文本上的平均负对数概率。

$$
H(p_t)=\sum_{v\in V}p_t(v)[-\log_2p_t(v)],\qquad
h(X)=\frac1n\sum_{t=1}^n s_t,\qquad
\mathrm{PPL}(X)=2^{h(X)}.
$$

- 可以按 token、短语或句子筛选。对连续单元 $u=x_{a:b}$， $s(u)=-\log_2P(x_{a:b}\mid x_{<a})=\sum_{t=a}^bs_t$。短语方案借助句法分析合并名词短语。按单元分数的分位数设阈值，保留高分单元，再按原序拼回。
- 图中颜色编码自信息，上下两行分别展示原文和筛选结果。每个单元的分数都在原始前文上计算。其中，罕见词可能很意外，得到保留，却与问题无关，这也是Selective Context的缺陷。

### 2. LLMLingua

![LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models，原图 1](<images/prompt compression/lingua.png>)

*原论文图 1。中间绿色模块依次分配预算、迭代删词；分布对齐作用于小模型。右侧黑盒读取短文本。* <a id="use-5" name="use-5"></a>[〔5〕](#ref-5)

- **粗筛示例。** 将提示拆成指令、示例集和问题。小模型计算每条示例的困惑度，按从高到低的顺序在粗筛预算内选入示例。指令和问题通常保留较高比例。
- **分块细筛。** 记第 $j$ 块为 $S_j$，前面各块已经保留的部分为 $\widetilde S_{<j}$。该块中第 $t$ 个 token 的工作分数可写为

$$
s_{j,t}=-\log p_s(x_{j,t}\mid\widetilde S_{<j},x_{j,<t}),
\qquad
\widetilde S_j=(x_{j,t}:s_{j,t}\ge\gamma_j).
$$

- 图中小模型负责打分，黑盒大模型只接收最终文本。论文还用目标模型产生的指令响应数据调整小模型，使打分模型更接近目标模型的分布。
- **与 Selective Context 的区别。** 两者都用原文 token 的预测难度。Selective Context 在完整前文上一次确定单元分数；LLMLingua 增加了分区预算和跨块重打分。它能识别、保护末尾的问题；在通常的前向打分顺序中，较早的文档词仍看不到末尾问题。

### 3. LongLLMLingua

![LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression，原图 2](<images/prompt compression/long.png>)

*原论文图 2。文档重排在粗筛阶段完成，动态预算进入词级细筛；最右侧的子序列恢复位于生成之后。* <a id="use-6" name="use-6"></a>[〔6〕](#ref-6)

- **文档级。** 对每篇文档 $D_k$，都让小模型预测同一问题序列 $q'$（论文在问题后追加约束语句）。下式越小，读过该文档后，问题越容易预测。

$$
r_k=-\frac1{|q'|}\sum_t\log p_s(q'_t\mid D_k,q'_{<t}).
$$

- **词级。** 令 $h_t$ 表示该处的可用前文。按原论文对数损失的写法，问题为一个已观察词提供的额外信息为

$$
\Delta_t=[-\log p_s(x_t\mid h_t)]-[-\log p_s(x_t\mid q,h_t)]
=\log\frac{p_s(x_t\mid q,h_t)}{p_s(x_t\mid h_t)}.
$$

  $\Delta_t$ 大，表示给出问题后这个词变得更容易预测，因而得到较高保留优先级。

-  粗筛后按相关性调整文档位置，减轻关键信息落在长输入中部的影响，并让高相关文档获得较宽松的词级预算。回答生成后，还可以把回答中匹配压缩文本的片段映回原文，以恢复被裁掉的细节。
- **与 LLMLingua 的区别。** 初代给“问题本身”留预算，LongLLMLingua 用“当前问的是什么”决定前面哪篇文档、哪些词值得保留。换一个问题，文档排序和词级保留结果都可能改变。

### 4. LLMLingua-2

![LLMLingua-2: Data Distillation for Efficient and Faithful Task-Agnostic Prompt Compression，原图 1](<images/prompt compression/lingua2.png>)

*原论文图 1。左侧教师生成抽取式短文，中间将其对齐成保留标签，右侧学生用一次编码预测各位置的标签。* <a id="use-7" name="use-7"></a>[〔7〕](#ref-7)

- **标签。** 让教师模型 GPT-4 对原文执行抽取式压缩，要求尽量使用原词。将短文与原文对齐，给原位置赋保留或删除标签，再做质量过滤。
- **双向分类。** 学生编码器同时读左右上下文。$h_t$ 为该位置的上下文化表示，$y_t\in\{0,1\}$ 为对齐标签。二分类头输出保留概率 $a_t$，以交叉熵训练：

$$
a_t=\operatorname{softmax}(Wh_t+b)_1,\qquad
\mathcal L=-\sum_t\{y_t\log a_t+(1-y_t)\log(1-a_t)\}.
$$

- 对一个词的多个子词取保留概率均值，按预算选得分最高的词，再恢复原有顺序。
- **与前两代的区别。** 初代估计“这个词有多难预测”，LongLLMLingua 估计“给出问题后预测这个词改变多少”，LLMLingua-2 估计“教师会不会保留这个词”。最后一种可以在问题出现之前压缩文档，以后反复使用。

### 5. AdaComp

![AdaComp: Extractive Context Compression with Adaptive Predictor for Retrieval-Augmented Large Language Models，原图 2](<images/prompt compression/ada.png>)

*原论文图 2。中间横条的切点 K 是预测结果；底部只有前 K 篇文档与问题一起送入生成器。* <a id="use-8" name="use-8"></a>[〔8〕](#ref-8)

- **监督信号。** 检索结果已排序为 $D_{1:N}$。在训练集上，以已知答案 $y$ 检查各个前缀。标签是足以使系统答对的最小前缀长度；没有前缀答对时，原算法返回空集。

$$
k^*=\min\{k\in\{1,\dots,N\}:G(q,D_{1:k})\text{ 命中 }y\}.
$$

- 预测器以问题和检索集为输入，预测 $\hat k=f_\theta(q,D_{1:N})$；生成模型读取 $q\oplus D_{1:\hat k}$。
- **与 LongLLMLingua 的区别。** 两者都关心当前问题。AdaComp 学的是排序切点，整篇保留入选文档；LongLLMLingua 还可以重排并在文档内部删词。因此相同的 $\hat k$ 能产生完全不同的 token 成本，排序靠后的关键证据也可能被前缀选择漏掉。

## 三、硬提示：Paraphrasing

### 6. Nano-Capsulator

![Learning to Compress Prompt in Natural Language Formats，原图 2](<images/prompt compression/nano.png>)

*原论文图 2。左侧比较复述和概括的语义，右侧冻结模型对两份提示作答，中间反馈两条答题路径的差异。* <a id="use-9" name="use-9"></a>[〔9〕](#ref-9)

- **压缩器的比较。** 可训练模型 $F_\theta$ 在复述指令下读取长提示 $K$，得到表示 $e_K$；在概括指令下生成短提示 $C$，得到表示 $e_C$。用均方误差约束两种表示的距离。
- **冻结模型的比较。** 抽取训练问题 $q$，让已有的下游模型 $G$ 分别在 $K\oplus q$ 与 $\Phi(C)\oplus q$ 下作答。$\Phi$ 将短提示截到目标预算；比较两条答题路径的隐藏表示，得到论文称为 reward 的效用差异信号。复述和概括分支在 $F_\theta$ 上，答题分支在冻结的 $G$ 上。

$$
\mathcal L_{\rm sem}=\mathbb E_C\,\mathrm{MSE}(e_K,e_C),\qquad
R_{\rm cap}=\mathbb E_q\,\mathrm{MSE}\big(h_G(K,q),h_G(\Phi(C),q)\big),
\qquad \mathcal L_{\rm Nano}=\mathcal L_{\rm sem}\,R_{\rm cap}.
$$

- **与 LLMLingua-2 的区别。** 抽取器只能从原文词序列中选择；生成式压缩器可以合并、换词和重组句子。后者有机会保留跨句含义，也增加逐步生成短文的开销及改写事实的可能。

### 7. CompAct

![CompAct: Compressing Retrieved Documents Actively for Question Answering，原图 2](<images/prompt compression/compact.png>)

*原论文图 2。每列是一轮读取。前一列的短文本进入后一列；下方的判断由证据不足转为充分时终止。* <a id="use-10" name="use-10"></a>[〔10〕](#ref-10)

- **状态。** 将检索文档分批为 $B_1,\dots,B_J$。初始摘要 $C_0$ 为空；每次把问题、上一版摘要和新一批文档交给压缩器。图中从第二轮起才出现“Previous Output”。

$$
(C_j,E_j)=F_\theta(q,C_{j-1},B_j),\qquad
j^*=\min\{j:E_j\text{ 判断证据充分}\};
\qquad \hat y=G(q,C_{j^*}).
$$

- **停止条件。** $E_j$ 给出判断理由和结论。证据不足则读下一批，证据充分则提前停止；若始终不充分，读完末批后使用最终摘要。早先文档中的中间事实只能通过 $C_{j-1}$ 传给下一轮。
- 用含逐轮摘要和充分性判断的监督数据微调压缩器。多跳问题受益于跨批合并；若过早判定充分，尚在后续批次的证据没有补入机会。
- **与 Nano-Capsulator、AdaComp 的区别。** Nano-Capsulator 为长提示学习可复用的短表述；CompAct 围绕当前问题反复更新摘要。AdaComp 通过预测篇数决定读多少，CompAct 通过已经积累的证据决定是否继续读。

### 8. FAVICOMP

![Familiarity-Aware Evidence Compression for Retrieval Augmented Generation，原图 1](<images/prompt compression/favi.png>)

*原论文图 1。下路使目标模型参与证据压缩。图中的日期差异展示了只有压缩器参与和两模型共同参与时可能产生的不同表述。* <a id="use-11" name="use-11"></a>[〔11〕](#ref-11)

- 压缩模型 $P_c$ 读取问题、检索证据 $D$ 和摘要前缀 $c_{<t}$。目标模型 $P_g$ 只读问题和同一个前缀，根据自身知识预测对答题有用的下一个词。
- **逐词合并。** 每一步在两者共享的词表中选择

$$
c_t=\arg\max_{v\in V}
\left[(1-\alpha)\log P_c(v\mid D,q,c_{<t})
+\alpha\log P_g(v\mid q,c_{<t})\right].
$$

  这相当于最大化两项概率的加权几何平均。$\alpha=0$ 时完全依赖证据压缩器；增大 $\alpha$ 会让目标模型较熟悉的表达更容易入选，也可能加大其已有知识与新证据冲突时的偏移。

- **与 CompAct 的区别。** CompAct 的决策发生在批次之间，决定要不要继续读；FAVICOMP 的决策发生在摘要的每个生成位置，决定怎样写。原方案是免训练的解码策略，但需要能对齐两个模型的候选 token 并取得相应分数。

## 四、软提示

### 9. Contrastive Conditioning（CC）

![Prompt Compression and Contrastive Conditioning for Controllability and Toxicity Reduction in Language Models，原图 1](<images/prompt compression/cc.png>)

*原论文图 1。左右使用同一语言模型；中间的 KL 比较硬前缀和短软前缀所诱导的后续分布。* <a id="use-12" name="use-12"></a>[〔12〕](#ref-12)

- 记当前用户输入及已生成历史为 $h$。实践者另外准备体现目标属性的前缀 $x^+$ 和对照前缀 $x^-$。“正、负”由希望控制的属性定义。普通对话只有 $h$ 时，模型没有这两段材料，也没有自动决定控制方向的步骤。
- 对给定硬提示 $x$，冻结语言模型，初始化 $S_x\in\mathbb R^{k\times d}$。让同一模型分别读取硬前缀和软前缀，在相同的训练文本位置比较下一词分布。用统一记号展开图中的 KL 目标：

$$
S_x^*=\arg\min_S\ \mathbb E_{u}
\sum_t D_{\rm KL}\!\left(P_G(\cdot\mid x,u_{<t})\,\Vert\,P_G(\cdot\mid S,u_{<t})\right).
$$

  训练文本提供各种后续语境，优化变量是 $S$。每个新的固定前缀都要单独拟合；反复使用同一前缀时可以摊薄训练成本。

- 分别为 $x^+,x^-$ 学得 $S^+,S^-$。对候选 token $v$，令 $p_0=P_G(v\mid h)$、$p_+=P_G(v\mid S^+,h)$、$p_-=P_G(v\mid S^-,h)$。原论文将属性分数乘回基础分布，并在词表上归一化：

$$
P_{\rm ctrl}(v\mid h)=
\frac{1}{Z(h)}p_0\left(\frac{p_+}{p_++p_-}\right)^{\omega}.
$$

- **压缩。** 用户历史 $h$ 在三个分支中都保留；缩短的是两段反复使用的控制示例。$\omega=0$ 恢复基础分布。与 LongLLMLingua 对照，后者的对比分数决定删哪个**输入词**；这里的对比分数调整哪个**输出词**更可能被生成。

### 10. GIST

![Learning to Compress Prompts with Gist Tokens，原图 2](<images/prompt compression/gist.png>)

*原论文图 2。逐行读掩码：绿色表示采用 gist 掩码后仍可关注的位置，灰色表示普通模型原本可见、采用 gist 掩码后被阻断的位置。左边是因果解码器，右边分别画出编码器和交叉注意力。* <a id="use-13" name="use-13"></a>[〔13〕](#ref-13)

- **构造序列。** 令 $T$ 为指令、$g_{1:k}$ 为追加的 gist 位置、$X$ 为本次输入。模型处理 $[T;g_{1:k};X;y]$。相同的特殊 token 在不同指令后会产生不同状态，因为它们在计算注意力时读到了不同的 $T$。
- 在 decoder-only 实现中，对查询位置 $i$ 与键位置 $j$，可将加性掩码写成

$$
A_{ij}=\begin{cases}
-\infty,&j>i,\\
-\infty,&i\in X\cup y,\ j\in T,\\
0,&\text{其余情况}.
\end{cases}
$$

  gist 位置可以读指令，输入与回答位置可以读 gist 和各自可见的历史。若放开 $X\to T$，模型就能绕过 gist，保留原指令也会成为推理时的依赖。

- **训练和复用。** 在多种指令、输入与目标回答上训练带掩码的模型。遇到新指令时一次前向即可形成 gist；相同指令换输入时可直接复用 gist 状态。在因果模型里缓存相应位置的逐层 KV，随后无需保留全部指令位置。
- **与 CC 的区别。** CC 为每条固定前缀重新优化矩阵；GIST 将“怎样读出指令摘要”学进模型参数，因此能够对训练时未见的指令执行压缩。

### 11. AutoCompressor

![Adapting Language Models to Compress Contexts，原图 1](<images/prompt compression/auto.png>)

*原论文图 1。自下而上是相继读入的文本段。段末摘要沿箭头传给后续段；顶部紫色框为累积的摘要向量。* <a id="use-14" name="use-14"></a>[〔14〕](#ref-14)

- **分块读。** 将长文分成 $S_1,\ldots,S_J$，每段末尾追加 $k$ 个摘要位置。记 $U_j$ 为本段摘要，$U_{<j}$ 为以前各段摘要的拼接。论文的摘要累积版本可写为

$$
U_j=\operatorname{tail}_k F_\theta\!\left(U_{<j}\oplus E(S_j)\oplus E(\sigma_{1:k})\right),\qquad
U_{\le j}=U_{<j}\oplus U_j.
$$

- 下一段只能通过 $U_{\le j}$ 获取早先文本。用语言建模损失 $\mathcal L=-\sum_{j,t}\log P_\theta(s_{j,t}\mid U_{<j},s_{j,<t})$ 训练；后文若依赖前文，被保留的摘要应提高对后文的预测概率。
- 段末输出取顶层向量，作为下一段输入端的软提示。累积版本的摘要长度随段数增长为 $Jk$；早先的正文位置不再进入下一段。
- **与 GIST 的区别。** “逐段做 gist 再拼接”能描述段末读出的直觉。实现上，AutoCompressor 把向量送回输入层、递归处理后续段，并用后文的预测损失训练。GIST 的典型任务是用受限可见性的少数位置承载一条指令，再对新输入执行它。

### 12. ICAE

![In-context Autoencoder for Context Compression in a Large Language Model，原图 3](<images/prompt compression/icae.png>)

*原论文图 3。下方启用 LoRA 的编码端输出记忆槽，上方冻结解码端以这些槽和已知目标前缀逐词重建。* <a id="use-15" name="use-15"></a>[〔15〕](#ref-15)

- **编码。** 长度为 $n$ 的正文后追加 $k$ 个记忆 token，用带 LoRA 的语言模型处理。只取末尾位置的顶层隐藏状态：

$$
M=\operatorname{tail}_k F_{\theta+\Delta_{\rm LoRA}}
       (E(X)\oplus E_m)\in\mathbb R^{k\times d}.
$$

  $E_m$ 是可学习的初始记忆嵌入，$M$ 是读完这条正文后的结果。同一组 $E_m$ 可以处理不同文档，每篇得到自己的 $M$。

- **训练目标。** 设 $\mathrm{NLL}_G(b\mid a)=-\sum_t\log P_G(b_t\mid a,b_{<t})$。下表给出编码端收到的三类监督：

| 阶段 | 解码器的条件 | 损失 | 记忆需要保留什么 |
|---|---|---|---|
| 自编码预训练 | $M$ 和特殊标记 $[\mathrm{AE}]$ | $\mathrm{NLL}_G(X\mid M,[\mathrm{AE}])$ | 足够还原原文的细节 |
| 续写预训练 | $M$ | $\mathrm{NLL}_G(X_{\rm next}\mid M)$ | 对后文有预测价值的信息 |
| 指令微调 | $M$ 和完整问题 $q$ | $\mathrm{NLL}_G(y\mid M,q)$ | 回答所需的内容 |

- 训练时，在预测 $x_t$ 的位置只提供真实前缀 $x_{<t}$。标签是原文 token，不需要人为指定“正确的记忆向量”。解码器权重冻结，但损失对输入 $M$ 可微，梯度沿 $\partial\mathcal L/\partial M$ 更新编码端 LoRA 和记忆嵌入。
- **与 AutoCompressor 的区别。** 两者的底层都可以采用因果 Transformer。“编码器—解码器”在 ICAE 里指功能分工：编码端学习怎样写入 $M$，原始冻结模型负责读取。AutoCompressor 让同一套经训练的模型递归写摘要、读摘要、预测后文。两者最后都能拼接 embedding，训练约束却不同。

### 13. 500xCompressor

![500xCompressor: Generalized Prompt Compression for Large Language Models，原图 2](<images/prompt compression/500x.png>)

*原论文图 2。三栏依次展示重建、问答微调和推理。绿色块表示传给冻结解码器的键值状态。* <a id="use-16" name="use-16"></a>[〔16〕](#ref-16)

- **编码前半段类似 ICAE。** 将 $k$ 个压缩位置追加在正文末尾。区别出现在读出时：对第 $\ell$ 层，只截取这些位置的键和值。若省略批次维，模型有 $L$ 层、$H_{\rm kv}$ 个 KV 头，每头宽度为 $d_h$，则

$$
\mathcal K_X=\{(K_c^{(\ell)},V_c^{(\ell)}):\ell=1,\dots,L\},\qquad
K_c^{(\ell)},V_c^{(\ell)}\in\mathbb R^{H_{\rm kv}\times k\times d_h}.
$$

- 标准注意力先从进入本层的状态投影出 Q、K、V，再按注意力权重读取前文。第一层末尾位置在完成注意力后才获得上下文化的输出；上层可将这部分文档信息写进该位置的 K、V。保存所有层，解码器每层就能读取与本层对应的前缀状态。
- **解码接口。** 解码问题时，每层将 $K_c^{(\ell)}$ 与当前问题前缀的键沿序列维拼接，值同理。问题的查询与这些键计算注意力，再加权读取值。编码器学习写入缓存，解码器保持冻结。
- **与 ICAE 的区别。** ICAE 传递 $kd$ 个输入嵌入分量，解码器自行算出各层 KV；这里直接传递 $2LkH_{\rm kv}d_h$ 个分量。同样的 $k=1$，两种方案暴露给解码器的信息接口和离线存储量都不同。

### 14. xRAG

![xRAG: Extreme Context Compression for Retrieval-augmented Generation with One Token，原图 2](<images/prompt compression/xrag.png>)

*原论文图 2。数据库里的文档向量经投影进入语言模型。虚线框中的传统路径需要取回并编码文档文本。* <a id="use-17" name="use-17"></a>[〔17〕](#ref-17)

- **索引阶段。** 冻结检索编码器 $R$ 将每段文档变成向量 $e_D=R(D)\in\mathbb R^{d_r}$。它原本用于检索相关文档，适合离线计算和保存。
- **回答阶段。** 找到文档后，训练过的两层 MLP 将它的检索向量映为一个输入 embedding。单篇文档对应一行：

$$
z_D=W_2\sigma(W_1e_D+b_1)+b_2\in\mathbb R^d,\qquad
P(y\mid D,q)\approx P_G(y\mid z_D\oplus E(q)).
$$

- 检索训练使向量距离有意义；冻结生成模型要求前缀激活能引发合适的回答。即便 $d_r=d$，维数相同也不能保证这两种用途已经对齐。投影器是两端都冻结后可学习的连接。
- 先用改述预训练，让模型根据文档向量生成文档文本；随后用上下文感知的指令微调，结合目标答案的语言建模损失与自蒸馏。蒸馏项的方向是 $D_{\rm KL}(P_G(\cdot\mid D,q)\Vert P_G(\cdot\mid z_D,q))$，完整文本路径提供教师分布。
- **与 ICAE、500xCompressor 的区别。** xRAG 复用已经存在的检索表示，信息在检索编码器生成单向量时已经收缩。ICAE 用重建与问答监督学习写入多个记忆位置；500xCompressor 还把传递接口推进到解码器每一层。

### 15. UniICL

![UniICL: An Efficient Unified Framework Unifying Compression, Selection, and Generation，原图 2](<images/prompt compression/uni.png>)

*原论文图 2。示例库保存压缩序列；相似度排序决定从库中取哪几条，选中的序列再与问题共同进入生成模型。* <a id="use-18" name="use-18"></a>[〔18〕](#ref-18)

- 设示例 $D_i$ 长 $n_i$。在末尾追加 $k_i$ 个共享初始嵌入的记忆位置，冻结的 Vicuna 输出末尾 $k_i$ 行隐藏状态，再以同一个线性层逐行投影：

$$
H_i=\operatorname{tail}_{k_i}F(E(D_i)\oplus[M]^{k_i})
\in\mathbb R^{k_i\times d},\qquad
C_i=H_iW_p^\top\in\mathbb R^{k_i\times d}.
$$

  长度从 $n_i$ 缩到 $k_i$ 发生在取末尾的行。$W_p$ 保留行数，学习把顶层输出对齐到生成模型的输入空间。共享记忆嵌入和投影层都可训练，主干冻结。

- 候选的 $C_i$ 可预先建库。用同样过程编码新问题，得到 $C_q$。先在**单条示例内部**沿 token 维平均，再比较余弦相似度：

$$
\bar c_i=\frac1{k_i}\sum_{j=1}^{k_i} C_i[j,:]\in\mathbb R^d,\qquad
s_i=\frac{\bar c_q^\top\bar c_i}{\|\bar c_q\|\,\|\bar c_i\|}.
$$

- 设选中的示例编号为 $i_1,\ldots,i_m$，解码器读入 $C_{i_1}\oplus\cdots\oplus C_{i_m}\oplus E(q)$，总长度为 $\sum_j k_{i_j}+|q|$。排序阶段的一行均值已完成任务。问题在选示例时压缩过一次，在回答时以完整 token 出现。
- 首先随机压缩训练输入的一部分，结合剩余原文预测目标答案，训练写入能力。随后用有标签的训练问题测量候选示例的价值：

$$
g_i=\mathrm{PPL}(y\mid q)-\mathrm{PPL}(y\mid D_i,q).
$$

  增益大的候选能让正确答案更容易预测。根据相对增益挖掘正负示例，再结合语言建模与对比训练，使均值向量能区分有益和干扰示例。上线时没有标准答案，用已学到的余弦分数选示例。
- **与 xRAG 的区别。** 两者都把投影结果拼在完整问题之前。xRAG 从一个已有的、固定的文档检索向量出发；UniICL 为带输入和答案的示例生成多行表示，训练共享记忆嵌入来影响读取过程。其均值服务于检索，整组行服务于上下文学习。



## 参考文献

<a id="ref-1" name="ref-1"></a>〔1〕 Zongqian Li、Yinhong Liu、Yixuan Su、Nigel Collier．[Prompt Compression for Large Language Models: A Survey](https://arxiv.org/abs/2410.12388v2)．2024，arXiv:2410.12388v2。[↩ 返回正文](#use-1)

<a id="ref-2" name="ref-2"></a>〔2〕 360亿方智能（文内注明转自「老刘说NLP」）．[大模型prompt压缩技术总结：从硬提示到软提示代表方案实现思路](https://zhuanlan.zhihu.com/p/8370444834)．知乎，2024-11-22。[↩ 返回正文](#use-2)

<a id="ref-3" name="ref-3"></a>〔3〕 用户与 ChatGPT．[提示词压缩工程](https://chatgpt.com/share/6b0715c8-cad4-83ee-9d0f-8213967f77b1)．用户提供的完整分享对话，另有本地 HTML 节选。[↩ 返回正文](#use-3)

<a id="ref-4" name="ref-4"></a>〔4〕 Yucheng Li 等．[Compressing Context to Enhance Inference Efficiency of Large Language Models](https://arxiv.org/abs/2310.06201v1)．arXiv:2310.06201v1，原图 2，PDF 第 3 页。[↩ 返回正文](#use-4)

<a id="ref-5" name="ref-5"></a>〔5〕 Huiqiang Jiang 等．[LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models](https://arxiv.org/abs/2310.05736v2)．arXiv:2310.05736v2，原图 1，PDF 第 3 页。[↩ 返回正文](#use-5)

<a id="ref-6" name="ref-6"></a>〔6〕 Huiqiang Jiang 等．[LongLLMLingua: Accelerating and Enhancing LLMs in Long Context Scenarios via Prompt Compression](https://arxiv.org/abs/2310.06839v2)．arXiv:2310.06839v2，原图 2，PDF 第 3 页。[↩ 返回正文](#use-6)

<a id="ref-7" name="ref-7"></a>〔7〕 Zhuoshi Pan 等．[LLMLingua-2: Data Distillation for Efficient and Faithful Task-Agnostic Prompt Compression](https://arxiv.org/abs/2403.12968v2)．arXiv:2403.12968v2，原图 1，PDF 第 3 页。[↩ 返回正文](#use-7)

<a id="ref-8" name="ref-8"></a>〔8〕 Qianchi Zhang 等．[AdaComp: Extractive Context Compression with Adaptive Predictor for Retrieval-Augmented Large Language Models](https://arxiv.org/abs/2409.01579v2)．arXiv:2409.01579v2，原图 2，PDF 第 3 页。[↩ 返回正文](#use-8)

<a id="ref-9" name="ref-9"></a>〔9〕 Yu-Neng Chuang 等．[Learning to Compress Prompt in Natural Language Formats](https://arxiv.org/abs/2402.18700v2)．arXiv:2402.18700v2，原图 2，PDF 第 4 页。[↩ 返回正文](#use-9)

<a id="ref-10" name="ref-10"></a>〔10〕 Chanwoong Yoon 等．[CompAct: Compressing Retrieved Documents Actively for Question Answering](https://arxiv.org/abs/2407.09014v3)．arXiv:2407.09014v3，原图 2，PDF 第 3 页。[↩ 返回正文](#use-10)

<a id="ref-11" name="ref-11"></a>〔11〕 Dongwon Jung 等．[Familiarity-Aware Evidence Compression for Retrieval Augmented Generation](https://arxiv.org/abs/2409.12468v1)．arXiv:2409.12468v1，原图 1，PDF 第 2 页。[↩ 返回正文](#use-11)

<a id="ref-12" name="ref-12"></a>〔12〕 David Wingate、Mohammad Shoeybi、Taylor Sorensen．[Prompt Compression and Contrastive Conditioning for Controllability and Toxicity Reduction in Language Models](https://arxiv.org/abs/2210.03162v1)．arXiv:2210.03162v1，原图 1，PDF 第 1 页。[↩ 返回正文](#use-12)

<a id="ref-13" name="ref-13"></a>〔13〕 Jesse Mu、Xiang Lisa Li、Noah Goodman．[Learning to Compress Prompts with Gist Tokens](https://arxiv.org/abs/2304.08467v3)．arXiv:2304.08467v3，原图 2，PDF 第 3 页。[↩ 返回正文](#use-13)

<a id="ref-14" name="ref-14"></a>〔14〕 Alexis Chevalier 等．[Adapting Language Models to Compress Contexts](https://arxiv.org/abs/2305.14788v2)．arXiv:2305.14788v2，原图 1，PDF 第 1 页。[↩ 返回正文](#use-14)

<a id="ref-15" name="ref-15"></a>〔15〕 Tao Ge 等．[In-context Autoencoder for Context Compression in a Large Language Model](https://arxiv.org/abs/2307.06945v4)．arXiv:2307.06945v4，原图 3，PDF 第 3 页。[↩ 返回正文](#use-15)

<a id="ref-16" name="ref-16"></a>〔16〕 Zongqian Li、Yixuan Su、Nigel Collier．[500xCompressor: Generalized Prompt Compression for Large Language Models](https://arxiv.org/abs/2408.03094v1)．arXiv:2408.03094v1，原图 2，PDF 第 2 页。[↩ 返回正文](#use-16)

<a id="ref-17" name="ref-17"></a>〔17〕 Xin Cheng 等．[xRAG: Extreme Context Compression for Retrieval-augmented Generation with One Token](https://arxiv.org/abs/2405.13792v2)．arXiv:2405.13792v2，原图 2，PDF 第 3 页。[↩ 返回正文](#use-17)

<a id="ref-18" name="ref-18"></a>〔18〕 Jun Gao 等．[UniICL: An Efficient Unified Framework Unifying Compression, Selection, and Generation](https://arxiv.org/abs/2405.17062v3)．arXiv:2405.17062v3，原图 2，PDF 第 2 页。[↩ 返回正文](#use-18)

