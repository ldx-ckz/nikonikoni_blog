---
title: LearnCpp 控制流
image: /assets/post-card/post-card-34-v20260819.jpg
cardImagePosition: center 20%
published: 2026-08-19
updated: 2026-08-19
description: LearnCpp 控制流笔记，介绍条件语句、switch、goto、while、do-while、for、break、continue 与提前返回。
tags:
  - C++
category:
  - LearnCpp
  - Tutorial
section: notes
author: nikonikoni
draft: false
---

# LearnCpp 控制流

## 8.1 控制流简介

程序从 `main()` 顶部开始执行，默认依次执行语句，最后在 `main()` 末尾终止。CPU 实际执行的语句序列称为程序的**执行路径**。

每次运行都以相同顺序执行相同语句的程序称为直线式程序。直线式执行无法处理次数在运行期才确定的行为，例如输入无效时反复请求新输入。

**控制流语句**（control flow statement）可以改变默认执行路径。控制流使执行点跳到非顺序位置时，这种行为称为**分支**（branching）。

C++ 控制流可分为六类：

| 类别 | 作用 | C++ 实现 |
|---|---|---|
| 条件语句 | 仅在条件满足时执行一组代码 | `if`、`else`、`switch` |
| 跳转 | 从当前位置转到另一位置 | `goto`、`break`、`continue` |
| 函数调用 | 跳到函数并在完成后返回 | 函数调用、`return` |
| 循环 | 在条件控制下重复执行代码零次或多次 | `while`、`do-while`、`for`、范围 `for` |
| 停止 | 终止程序 | `std::exit()`、`std::abort()` |
| 异常 | 用于错误处理的特殊控制流 | `try`、`throw`、`catch` |

**关键点**

控制流描述的是执行路径如何变化，不只是条件判断。函数调用、循环、提前退出和异常都属于控制流。

## 8.2 if 语句与代码块

### 条件语句与 if

条件语句决定关联语句是否执行。C++ 的基本条件语句包括 `if` 和 `switch`。

`if` 的基本形式为：

```cpp
if (condition)
    true_statement;
else
    false_statement;
```

条件转换为 `true` 时执行 `true_statement`；条件为 `false` 且存在 `else` 时执行 `false_statement`。`else` 可以省略。

### 每个分支只控制一条语句

`if` 或 `else` 直接关联的只能是一条语句。缩进不改变语法：

```cpp
if (height >= minimumHeight)
    std::cout << "Allowed\n";
else
    std::cout << "Not allowed\n";
    std::cout << "Choose another activity\n"; // 始终执行
```

第二个输出语句不是 `else` 的一部分。需要条件执行多条语句时，应使用复合语句，也就是代码块。代码块在语法上仍算一条语句：

```cpp
if (height >= minimumHeight)
{
    std::cout << "Allowed\n";
}
else
{
    std::cout << "Not allowed\n";
    std::cout << "Choose another activity\n";
}
```

### 隐式代码块与作用域

未显式写花括号时，可以把 `if` 和 `else` 的关联语句理解为处在各自的隐式代码块内。因此，在单语句分支中定义的变量仍具有块作用域：

```cpp
if (true)
    int x{ 5 };
else
    int x{ 6 };

std::cout << x; // 错误：两个 x 都已离开作用域
```

两个 `x` 分别在各自分支结束时销毁，分支外不存在可访问的 `x`。

### 单语句是否使用花括号

为单条关联语句也添加花括号具有两个主要优点：

1. 后续增加第二条语句时，不会让新语句因漏加花括号而意外变成无条件执行。
2. 调试时注释掉原关联语句，不会让紧随其后的语句意外成为 `if` 的新主体。

代价是垂直空间增加，同屏可见代码减少。把短分支写在 `if` 同一行可以压缩空间，但条件和语句通常会作为同一个调试步骤执行，也无法只在关联语句上设置断点。

**最佳实践**

优先考虑为 `if` 和 `else` 的单条关联语句也使用花括号。若团队采用无花括号风格，必须确保语句归属清晰，并在调试需要时拆行。

### 来源中的版本表述差异

8.2 页面把“统一使用代码块”的一项理由写成 `if constexpr` 是 C++23 引入且要求代码块；8.4 页面则明确说明 `if constexpr` 由 C++17 引入，并展示不带花括号的单语句形式。两处表述互相冲突，因此版本规则以专门讨论该特性的 8.4 为准：`if constexpr` 自 C++17 起可用。

### if-else 与多个独立 if

`if-else if-else` 链只执行第一个条件为真的分支；后续条件不再求值。多个相互独立的 `if` 会分别求值，并执行所有条件为真的分支。

```cpp
if (a)
    printA();
else if (b)
    printB();
else if (c)
    printC(); // 最多执行一个

if (a)
    printA();
if (b)
    printB();
if (c)
    printC(); // 可能执行多个
```

当每个成功分支都会 `return` 时，`else` 不再提供控制流价值，因为函数已在前一个成功分支终止：

```cpp
char firstMatch(bool a, bool b, bool c)
{
    if (a)
        return 'a';
    if (b)
        return 'b';
    if (c)
        return 'c';

    return '\0';
}
```

**关键点**

需要“只处理第一个真条件”时使用 `if-else` 链；需要“处理每个真条件”时使用独立 `if`。若每个成功分支都返回，可省略多余的 `else`。

## 8.3 if 语句的常见问题

### 悬空 else

`if` 可以嵌套。没有花括号时，`else` 总是与**同一代码块中最后一个尚未匹配的 `if`** 配对：

```cpp
if (x >= 0)
    if (x <= 20)
        std::cout << "0 to 20\n";
    else
        std::cout << "greater than 20\n";
```

这里的 `else` 属于内层 `if`，缩进无法改变配对规则。这类视觉含义与语法含义可能不一致的问题称为**悬空 else**。

显式代码块能确定配对关系：

```cpp
if (x >= 0)
{
    if (x <= 20)
        std::cout << "0 to 20\n";
    else
        std::cout << "greater than 20\n";
}
else
{
    std::cout << "negative\n";
}
```

嵌套条件还可以通过重排分支或逻辑运算符扁平化。减少嵌套通常能降低错误概率：

```cpp
if (x < 0)
    std::cout << "negative\n";
else if (x <= 20)
    std::cout << "0 to 20\n";
else
    std::cout << "greater than 20\n";
```

多个条件可用 `&&` 或 `||` 合并，但仍应保持表达式可读。

### 空语句

只有分号的表达式语句称为空语句：

```cpp
if (x > 10)
    ;
```

空语句什么也不做，适用于语法要求存在语句、实际无需执行操作的少数场景。为表明它是有意的，通常把分号单独放一行。

在 `if` 条件后误写分号会让空语句成为条件主体，原本想条件执行的语句转为无条件执行：

```cpp
if (systemReady()); // if 控制的是空语句
{
    launch();        // 始终执行
}
```

**警告**

不要用分号“结束”`if` 条件。即使后面紧跟代码块，该代码块也不再受 `if` 控制。

若需要类似其他语言 `pass` 的显式占位符，可以定义会被预处理器移除的宏，使保留的分号形成可搜索、意图明确的空语句：

```cpp
#define PASS

if (x > y)
    PASS;
```

### 在条件中混淆赋值和比较

`operator==` 检查相等，`operator=` 执行赋值。赋值表达式本身会产生所赋的值，因此常能通过编译：

```cpp
if (x = 0)
{
    std::cout << "zero\n";
}
else
{
    std::cout << "nonzero\n"; // 总会执行
}
```

`x = 0` 先把 `x` 改为 `0`，再把结果 `0` 转换为 `false`。正确写法是 `if (x == 0)`。编译器警告应保持开启，但不能只依赖警告发现此类语义错误。

## 8.4 constexpr if 语句

普通 `if` 的条件在运行期求值。即使条件是常量表达式，普通 `if` 在语言语义上仍是运行期条件：

```cpp
constexpr double gravity{ 9.8 };

if (gravity == 9.8)
    std::cout << "normal\n";
else
    std::cout << "different\n";
```

条件结果永远相同，运行期重复判断以及把永远不会执行的分支放入可执行文件都没有必要。

C++17 引入 `if constexpr`。它要求条件是常量表达式，并在编译期求值：

```cpp
if constexpr (gravity == 9.8)
    std::cout << "normal\n";
else
    std::cout << "different\n";
```

条件为真时，整个结构只保留真分支；条件为假时只保留假分支，若没有 `else` 则不保留任何关联语句。

现代编译器通常会优化普通 `if` 中的常量条件，使结果类似 `if constexpr`，但标准不要求这样做，关闭优化时也不保证发生。编译器还可能警告应改用 `if constexpr`。

**最佳实践**

条件是常量表达式时优先使用 `if constexpr`，明确保证编译期求值，而不是依赖可选优化。

## 8.5 switch 语句基础

### 适用问题

用长 `if-else` 链把同一个表达式反复与不同值比较，会重复求值并增加阅读负担。`switch` 专门用于把一个表达式与一组离散值进行相等比较，而且条件表达式只求值一次：

```cpp
switch (digit)
{
case 1:
    std::cout << "one";
    return;
case 2:
    std::cout << "two";
    return;
case 3:
    std::cout << "three";
    return;
default:
    std::cout << "unknown";
    return;
}
```

执行规则如下：

- 条件值等于某个 `case` 标签时，从该标签后的第一条语句开始执行。
- 没有匹配 `case` 且存在 `default` 时，从 `default` 后开始执行。
- 没有匹配项也没有 `default` 时，跳过整个 `switch`。

### switch 条件类型

`switch` 条件必须产生整数类型、枚举类型，或可转换为这些类型。浮点类型、字符串和大多数非整数类型不能直接用作条件。

这种限制与 `switch` 的高效实现有关。编译器历史上常使用**跳转表**：把整数值用作类似数组索引的入口，直接跳到目标分支。标准并不强制使用跳转表，编译器也可能选择其他实现；截至 C++23，条件类型限制仍然存在。

### case 标签

`case` 后必须是常量表达式，该表达式的类型应与条件类型相同或可转换为条件类型：

```cpp
constexpr int openCode{ 1 };

switch (command)
{
case openCode:
    open();
    break;
case 2:
    close();
    break;
}
```

同一个 `switch` 内的 `case` 值必须唯一。唯一性按转换后的值判断，因此数值不同的源码写法仍可能冲突。例如在常见字符集中，`case 54:` 与 `case '6':` 可能具有相同整数值。

`case` 数量没有实际的语言级小上限，但过多标签会降低可读性。

### default 标签

`default` 可选，每个 `switch` 最多一个。若没有 `case` 匹配，它提供兜底入口。惯例把 `default` 放在最后；没有匹配项且没有 `default` 时，执行从 `switch` 后继续。

**最佳实践**

把 `default` 放在 `switch` 末尾。

### break 与 return

`return` 结束整个函数；`break` 只结束当前 `switch`，执行从 `switch` 后继续：

```cpp
switch (digit)
{
case 1:
    std::cout << "one";
    break;
default:
    std::cout << "unknown";
    break;
}

std::cout << " processed\n";
```

每个标签下的语句组通常应以 `break` 或 `return` 结束，包括最后一个标签。最后一个标签即使当前不会落入别处，也应明确结束，以防将来追加标签后改变行为。

### 标签缩进与作用域含义

标签不创建嵌套作用域。惯例是不缩进 `case` 和 `default`，而把标签后的语句缩进一级：

```cpp
switch (value)
{
case 1:
    handleOne();
    break;
default:
    handleOther();
    break;
}
```

这样既突出入口，又不会误示每个标签拥有独立作用域。

**最佳实践**

不要缩进标签；缩进标签后的语句。

### switch 与 if-else 的选择

`switch` 最适合把一个非布尔整数或枚举表达式与少量离散值进行相等比较。它只求值一次，能清楚表明所有分支检查的是同一表达式。

以下情况通常更适合 `if` 或 `if-else`：

- 需要 `>`、`<` 等非相等比较；
- 需要组合多个条件；
- 需要检查数值范围；
- 表达式类型不受 `switch` 支持；
- 条件本身是 `bool`；
- 分支数量过多，`switch` 已难以阅读。

**最佳实践**

单个非布尔整数或枚举表达式与少量离散值比较相等时，优先使用 `switch`；其他条件逻辑优先使用 `if-else`。

## 8.6 switch 的贯穿与作用域

### 贯穿

匹配某个 `case` 或 `default` 后，执行从标签后的第一条语句开始，随后按顺序继续，直到：

- 到达 `switch` 代码块末尾；
- `break`、`return` 等控制流语句离开 `switch` 或函数；
- 其他事件中断正常执行。

遇到另一个 `case` 标签不会自动停止。执行从一个标签下的语句进入后续标签下的语句称为**贯穿**（fallthrough）：

```cpp
switch (2)
{
case 1:
    std::cout << 1 << '\n';
case 2:
    std::cout << 2 << '\n';
case 3:
    std::cout << 3 << '\n';
default:
    std::cout << 4 << '\n';
}
```

输出为 `2`、`3`、`4`。无意贯穿通常是错误，编译器和静态分析工具也常发出警告。

**警告**

标签下开始执行后会继续进入后续标签。通常使用 `break` 或 `return` 阻止贯穿。

### 有意贯穿与 `[[fallthrough]]`

注释能向读者说明贯穿有意，却不一定能被编译器识别。C++17 的 `[[fallthrough]]` 属性修饰一个空语句，明确表示此处有意贯穿：

```cpp
switch (value)
{
case 1:
    prepare();
    [[fallthrough]];
case 2:
    execute();
    break;
}
```

末尾分号不可省略，因为属性附着的是空语句。正确使用时，编译器不应再给出无意贯穿警告。

**最佳实践**

有意贯穿时使用 `[[fallthrough]];`，不要只依赖注释。

### 连续 case 标签

多个连续标签可以共享同一组语句：

```cpp
bool isVowel(char ch)
{
    switch (ch)
    {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
        return true;
    default:
        return false;
    }
}
```

标签不是语句。任一标签匹配后，执行从所有连续标签之后的第一条语句开始。这种“堆叠标签”不算贯穿，不需要 `[[fallthrough]]`。

### 标签不创建作用域

`switch` 的花括号创建一个作用域，但各个标签不会创建隐式代码块。因此一个 `case` 中声明的变量可能在后续 `case` 中可见，即使执行路径跳过了声明所在标签。

不带初始化的声明可以出现在标签前后，但跨标签跳过初始化会留下未初始化对象，因此编译器禁止这类控制流：

```cpp
switch (value)
{
    int declared;       // 可声明，但不推荐
    // int ready{ 5 };  // 错误：第一个标签会跳过初始化

case 1:
    int later;          // 可声明，但后续 case 也处于同一作用域
    later = 4;
    break;

case 2:
    // int skipped{ 4 }; // 若后面还有标签，可能被跳过初始化
    later = 5;
    break;
}
```

需要在某个 `case` 中定义或初始化局部变量时，应显式创建代码块：

```cpp
switch (value)
{
case 1:
{
    int local{ 4 };
    use(local);
    break;
}
default:
    break;
}
```

**最佳实践**

`case` 专用变量应定义在该 `case` 下的显式代码块中。

## 8.7 goto 语句

### 无条件跳转与语句标签

无条件跳转每次都会发生，不依赖条件结果。C++ 用 `goto` 跳到语句标签：

```cpp
double value{};

retry:
std::cin >> value;

if (value < 0.0)
    goto retry;
```

语句标签通常不缩进。标签具有**函数作用域**：在整个函数中都可见，甚至在定义位置之前可见；`goto` 和目标标签必须位于同一个函数。

`goto` 既能向后跳，也能向前跳。标签必须关联一条语句；若目标位置本来没有语句，可以使用空语句：

```cpp
if (skip)
    goto end;

doWork();

end:
; // 被 end 标记的空语句
```

标签具有函数作用域，因此不需要前向声明。

### 跳转限制

`goto` 有两个主要限制：

1. 不能跨越函数边界。
2. 向前跳不能越过一个在目标位置仍处于作用域内的变量初始化。

```cpp
goto skip;
int x{ 5 }; // 错误：跳过了仍在目标处有效的初始化

skip:
x += 3;
```

若允许这种跳转，`x` 会在未初始化的情况下被使用。向后越过初始化是允许的；再次执行定义时，对象会重新初始化。

### 避免 goto

`goto` 允许任意改变执行路径，容易形成难以追踪的“意大利面条式代码”。几乎所有 `goto` 都能用 `if`、循环、函数或其他结构化控制流更清楚地表达。

一个可能更清楚的例外是：需要离开多层嵌套循环，但不能返回整个函数。`break` 只能退出最内层循环，这时跳到所有循环之后的单一标签有时比额外状态变量更直接。

**最佳实践**

避免 `goto`；只有替代方案会显著降低可读性时才使用，例如有界地跳出多层嵌套循环。

## 8.8 循环简介与 while 语句

### while 的执行模型

循环重复执行一段代码，直到条件不再满足。`while` 是 C++ 三种基本循环中最简单的一种：

```cpp
while (condition)
    statement;
```

每次迭代开始时求值条件。条件为真则执行主体，主体完成后回到顶部重新检查；条件为假则跳过主体并结束循环。因此条件一开始就是假时，主体执行零次。

```cpp
int count{ 1 };

while (count <= 10)
{
    std::cout << count << ' ';
    ++count;
}
```

`count` 控制循环次数，称为**循环变量**；用于记录已经迭代多少次的循环变量称为**计数器**。循环主体每执行一次称为一次**迭代**。

### 无限循环

条件始终为真时形成无限循环。遗漏对循环变量的更新是常见原因：

```cpp
int count{ 1 };

while (count <= 10)
{
    std::cout << count << ' '; // count 从未改变
}
```

有意的无限循环应直接写成：

```cpp
while (true)
{
    serviceRequest();
}
```

它只能通过 `return`、`break`、`std::exit()`、`goto`、抛出异常或外部终止程序离开。持续运行的服务器是合理使用场景。

**最佳实践**

有意无限循环优先写成 `while (true)`，使意图清楚。

### while 条件后的分号

条件后的分号会让空语句成为循环主体：

```cpp
int count{ 1 };

while (count <= 10); // 空主体，无限循环
{
    std::cout << count;
    ++count;
}
```

花括号代码块已经与 `while` 无关，`count` 也不会在空主体中更新。

少数代码会有意使用空主体，例如 `while (keepRunning());` 不断调用函数直到返回假；若条件永不变假，同样会无限循环。

**警告**

`while` 条件后的分号只有在确实需要空主体时才应出现，并应清楚标明意图。

### 循环变量命名与类型

`i`、`j`、`k` 是传统循环变量名，但难以搜索。`count`、`index`、`userCount` 等描述性名称更容易理解；若项目坚持短名称，使用更易搜索的形式也优于含义模糊的单字符。

整数循环变量通常应使用有符号类型。无符号倒计时不会小于零：

```cpp
unsigned int count{ 10 };

while (count >= 0)
{
    std::cout << count << ' ';
    --count;
}
```

`count >= 0` 对无符号数永远为真。`count` 从 `0` 递减后按无符号规则折回最大值，循环继续。

**最佳实践**

整数循环变量通常使用有符号整数类型。

### 每 N 次执行与嵌套循环

计数器配合余数运算符可以每隔固定迭代执行一次操作：

```cpp
int count{ 1 };

while (count <= 50)
{
    std::cout << count << ' ';

    if (count % 10 == 0)
        std::cout << '\n';

    ++count;
}
```

循环可以嵌套。外层每迭代一次，内层循环都会完整执行。内层变量应在外层主体中定义，使它在每次外层迭代时重新初始化，并把作用域限制到实际使用位置：

```cpp
int outer{ 1 };

while (outer <= 5)
{
    int inner{ 1 };

    while (inner <= outer)
    {
        std::cout << inner << ' ';
        ++inner;
    }

    std::cout << '\n';
    ++outer;
}
```

输出形成从 `1` 到当前外层值的各行。变量应定义在满足用途的最小作用域内。

## 8.9 do-while 语句

`while` 在主体前检查条件。如果循环主体必须至少执行一次，为了让第一次检查通过而设置无效哨兵值，可能引入魔法数字；增加专门的布尔变量又会增加状态和出错点。

`do-while` 把条件放在主体之后：

```cpp
do
    statement;
while (condition);
```

主体先执行一次，再求值条件。条件为真时回到顶部，条件为假时结束，因此主体至少执行一次：

```cpp
int selection{};

do
{
    std::cout << "Choose 1 through 4: ";
    std::cin >> selection;
}
while (selection < 1 || selection > 4);
```

末尾 `while (condition)` 后的分号是语法必需部分，不是误写的空主体。

条件使用的变量必须在 `do` 代码块之外声明。若 `selection` 定义在主体内，它会在到达条件前销毁，条件无法访问它。该变量即使只用于循环，也因此需要较大的作用域。

`do-while` 并不常用。条件位于底部，不如顶部条件醒目，容易增加理解和维护成本。

**最佳实践**

两种形式同样自然时，优先使用 `while`；只有主体必须先执行一次时才考虑 `do-while`。

## 8.10 for 语句

### 结构与执行顺序

经典 `for` 适合存在明显循环变量的循环，因为定义、初始化、条件和更新集中在循环头部：

```cpp
for (init_statement; condition; end_expression)
    statement;
```

它大致等价于：

```cpp
{
    init_statement;

    while (condition)
    {
        statement;
        end_expression;
    }
}
```

执行顺序为：

1. 初始化语句执行一次。
2. 每轮开始求值条件；为假则终止。
3. 执行循环主体。
4. 执行末尾表达式，再回到条件。

初始化语句定义的变量具有循环作用域，本质上是覆盖整个 `for` 语句的块作用域；循环结束后变量销毁。

```cpp
for (int i{ 1 }; i <= 10; ++i)
{
    std::cout << i << ' ';
}
```

C++11 还提供范围 `for`，用于遍历集合；经典 `for` 仍是本节讨论的形式。

### 计数方式

`for` 可以递增、递减或使用任意步长：

```cpp
for (int i{ 9 }; i >= 0; --i)
    std::cout << i << ' ';

for (int i{ 0 }; i <= 10; i += 2)
    std::cout << i << ' ';
```

循环也适合累积计算。下面的主体执行 `exponent` 次；`exponent` 为 `0` 时执行零次并返回初始值 `1`：

```cpp
#include <cstdint>

std::int64_t power(int base, int exponent)
{
    std::int64_t total{ 1 };

    for (int i{ 0 }; i < exponent; ++i)
        total *= base;

    return total;
}
```

整数乘法仍可能溢出，循环结构不会提供额外数值保护。

### 数值条件避免 !=

`i != bound` 只有在 `i` 必定准确到达 `bound` 时才终止。若主体或步长让 `i` 越过边界，它可能永远不再等于边界。`i < bound` 或 `i <= bound` 在越界后仍会终止。

**最佳实践**

数值型 `for` 条件避免使用 `!=`；能够表达范围时优先使用 `<` 或 `<=`。

### 差一错误

循环比预期多执行或少执行一次称为**差一错误**（off-by-one error）。常见原因包括：

- 把 `<` 写成 `<=`，或反之；
- 起始值或终止值错误；
- 前置与后置递增、递减放在错误位置；
- 对区间端点是包含还是排除判断不一致。

例如 `for (int i{ 1 }; i < 5; ++i)` 只产生 `1` 到 `4`，不会产生 `5`。循环设计应明确起点、终点、边界是否包含以及步长。

### 省略组成部分

初始化语句、条件和末尾表达式都可以省略，但两个分号仍需保留：

```cpp
int i{ 0 };

for (; i < 10;)
{
    std::cout << i << ' ';
    ++i;
}
```

省略条件时，标准把条件视为真，因此 `for (;;)` 是无限循环，等价于 `while (true)`。

### 多个循环变量与逗号运算符

初始化语句可以定义多个**同类型**变量，末尾表达式可以用逗号运算符更新多个变量：

```cpp
for (int left{ 0 }, right{ 9 };
     left < 10;
     ++left, --right)
{
    std::cout << left << ' ' << right << '\n';
}
```

这几乎是 C++ 中少数同时定义多个变量并使用逗号运算符仍被认为合理的场景。

**最佳实践**

`for` 初始化区定义多个变量、末尾表达式使用逗号运算符可以接受，但只应在循环控制确实需要这些变量时使用。

### 嵌套 for

`for` 可以嵌套；外层每次迭代都会完整运行内层：

```cpp
for (char letter{ 'a' }; letter <= 'e'; ++letter)
{
    std::cout << letter;

    for (int i{ 0 }; i < 3; ++i)
        std::cout << i;

    std::cout << '\n';
}
```

输出为 `a012` 到 `e012`。内层循环的初始化在每次进入时重新执行。

### 循环变量的最小作用域

只在循环中使用的变量应在循环内部定义：

```cpp
for (int i{ 0 }; i < 10; ++i)
    std::cout << i << ' ';
```

把 `i` 预先定义在外部并在 `for` 中赋值不会节省“创建变量”的成本。通常初始化与赋值没有值得依赖的成本差异；扩大作用域反而增加阅读范围，还可能妨碍优化。只有循环结束后确实需要该变量时，才应把它定义在外部。

**最佳实践**

- 有明显循环变量时优先使用 `for`。
- 没有明显循环变量时优先使用 `while`。
- 只在循环中使用的变量定义在循环作用域内。

## 8.11 break 与 continue

### break

`break` 会结束当前 `while`、`do-while`、`for` 或 `switch`，执行从被结束结构之后的第一条语句继续。

在 `switch` 中，`break` 通常结束一个 `case`，阻止贯穿。在循环中，它可以在正常条件失效前提前终止：

```cpp
int sum{ 0 };

for (int count{ 0 }; count < 10; ++count)
{
    int value{};
    std::cin >> value;

    if (value == 0)
        break;

    sum += value;
}

std::cout << sum;
```

`break` 也是离开 `while (true)` 的常用方式。

### break 与 return

`break` 只终止当前循环或 `switch`；`return` 终止整个函数并把控制权交回调用点：

```cpp
int process()
{
    while (true)
    {
        char command{};
        std::cin >> command;

        if (command == 'b')
            break;    // 跳到循环之后

        if (command == 'r')
            return 1; // 立即离开 process()
    }

    cleanup();
    return 0;
}
```

选择取决于循环后的代码是否还应执行。

### continue

`continue` 结束当前迭代，不终止整个循环：

```cpp
for (int count{ 0 }; count < 10; ++count)
{
    if (count % 4 == 0)
        continue;

    std::cout << count << '\n';
}
```

它跳到当前循环主体底部。在 `for` 中，`continue` 后仍会执行末尾表达式，例如 `++count`，再检查条件。

在 `while` 和 `do-while` 中，循环变量常在主体里更新。若 `continue` 跳过更新，循环可能永远停在同一状态：

```cpp
int count{ 0 };

while (count < 10)
{
    if (count == 5)
        continue; // count 不再增加

    std::cout << count << '\n';
    ++count;
}
```

**警告**

在 `while` 和 `do-while` 中使用 `continue` 时，必须确认所有到达 `continue` 的路径仍能推动循环条件最终变假。有明显计数器时改用 `for` 通常更安全。

### 可读性权衡

`break` 和 `continue` 会产生跳转，藏在复杂主体中时可能难以发现。但克制使用可以：

- 删除只为控制循环而存在的布尔变量；
- 避免不必要的 `else`；
- 减少嵌套代码块；
- 把“跳过本轮”的条件放在 `for` 主体顶部。

`continue` 最适合在 `for` 顶部作为守卫，先排除无需处理的迭代。`break` 适合直接表达已经满足退出条件。

**最佳实践**

当 `break` 或 `continue` 能简化循环逻辑时使用它们；不要在复杂流程中堆叠难以追踪的跳转。

### 提前返回

不位于函数末尾的 `return` 称为**提前返回**。单一末尾返回让出口数量最少，但可能迫使后续逻辑进入多层条件嵌套。提前返回能在工作完成或参数无效时立即退出，减少无关代码和嵌套。

一种折中做法是只在函数顶部用提前返回验证参数，其余路径共用末尾返回。更一般的判断标准仍是可读性。

**最佳实践**

提前返回能简化函数逻辑时使用提前返回。

## 参考来源

1. [8.1 — Control flow introduction](https://www.learncpp.com/cpp-tutorial/control-flow-introduction/)
2. [8.2 — If statements and blocks](https://www.learncpp.com/cpp-tutorial/if-statements-and-blocks/)
3. [8.3 — Common if statement problems](https://www.learncpp.com/cpp-tutorial/common-if-statement-problems/)
4. [8.4 — Constexpr if statements](https://www.learncpp.com/cpp-tutorial/constexpr-if-statements/)
5. [8.5 — Switch statement basics](https://www.learncpp.com/cpp-tutorial/switch-statement-basics/)
6. [8.6 — Switch fallthrough and scoping](https://www.learncpp.com/cpp-tutorial/switch-fallthrough-and-scoping/)
7. [8.7 — Goto statements](https://www.learncpp.com/cpp-tutorial/goto-statements/)
8. [8.8 — Introduction to loops and while statements](https://www.learncpp.com/cpp-tutorial/introduction-to-loops-and-while-statements/)
9. [8.9 — Do while statements](https://www.learncpp.com/cpp-tutorial/do-while-statements/)
10. [8.10 — For statements](https://www.learncpp.com/cpp-tutorial/for-statements/)
11. [8.11 — Break and continue](https://www.learncpp.com/cpp-tutorial/break-and-continue/)
