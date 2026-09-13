---
title: LearnCpp 类型转换
image: /assets/post-card/post-card-30-v20260819.jpg
cardImagePosition: center 50%
published: 2026-08-19
updated: 2026-08-19
description: LearnCpp 类型转换笔记，介绍隐式转换、数值提升、数值转换、窄化转换、通常算术转换及 static_cast。
tags:
  - C++
category:
  - LearnCpp
  - Tutorial
section: notes
author: nikonikoni
draft: false
---

# LearnCpp 类型转换

## 10.1 隐式类型转换

### 类型转换产生新值

类型转换是把一种类型的数据转换为另一种类型的过程。需要某种类型、实际却提供了另一种类型时，编译器可以自动执行**隐式类型转换**（implicit type conversion），也称自动类型转换或强制转换（coercion）。程序员也可以通过 `static_cast` 等转换运算符明确请求**显式类型转换**。

转换不会修改作为输入的原数据。值到值的转换会创建一个目标类型的临时对象，并把转换结果存入其中。本章讨论值之间的转换；涉及指针、引用和继承关系的转换具有另外的规则。

不同类型可能用完全不同的位模式表示逻辑上相同的值。例如，整数 `3` 的位表示不等于浮点数 `3.0` 的位表示，因此不能把整数对象的位直接复制到 `float` 对象中来代替数值转换：

```cpp
#include <cstring>
#include <iostream>

int main()
{
    int source{ 3 };
    float destination{};

    std::memcpy(&destination, &source, sizeof(float));
    std::cout << destination << '\n'; // 典型输出：4.2039e-45
}
```

`destination` 按 `float` 规则解释来自 `int` 的位，因此不会得到 `3.0`。正确的转换会读取整数值 `3`，生成等值的浮点结果 `3.0f`，再用 `float` 的表示形式保存结果。

**关键点**

类型决定了位模式的解释方式。数值转换转换的是值，而不是把源对象的原始位模式原样搬到另一种类型中。

### 隐式转换发生的位置

只要表达式类型与上下文要求的类型不同，就可能触发隐式转换。常见位置包括：

```cpp
double value{ 3 };        // 初始化：int -> double
value = 6;                // 赋值：int -> double

float makeValue()
{
    return 3.0;           // 返回值：double -> float
}

double quotient{ 4.0 / 3 }; // 混合类型运算：int -> double

if (5)                    // 条件：int -> bool
{
}

void consume(long x)
{
}

consume(3);               // 实参与形参：int -> long
```

这些转换由上下文提出目标类型，再由编译器查找可用的转换序列。

### 标准转换

C++ 核心语言定义了一组**标准转换**。截至 C++23，共有 14 种，可概括为五类：

| 类别 | 标准转换 | 含义 |
|---|---|---|
| 值变换 | 左值到右值 | 从左值表达式取得可用的值 |
| 值变换 | 数组到指针 | C 风格数组退化为指向首元素的指针 |
| 值变换 | 函数到指针 | 函数表达式转换为函数指针 |
| 值变换 | 临时量实质化 | 把值转换为临时对象 |
| 限定转换 | 限定转换 | 调整类型上的 `const` 或 `volatile` 限定 |
| 数值提升 | 整数提升 | 较小的整数类型转换为 `int` 或 `unsigned int` |
| 数值提升 | 浮点提升 | `float` 转换为 `double` |
| 数值转换 | 整数转换 | 不属于整数提升的整数类型转换 |
| 数值转换 | 浮点转换 | 不属于浮点提升的浮点类型转换 |
| 数值转换 | 整数—浮点转换 | 在整数类型与浮点类型之间转换 |
| 数值转换 | 布尔转换 | 整数、无作用域枚举、指针或成员指针转换为 `bool` |
| 指针转换 | 指针转换 | `nullptr`、`void*` 或继承层次中的相关指针转换 |
| 指针转换 | 成员指针转换 | 空成员指针以及基类、派生类成员指针之间的转换 |
| 指针转换 | 函数指针转换 | 指向 `noexcept` 函数的指针转换为普通函数指针 |

数值提升和数值转换是基本数值类型中最常遇到的两类。例如，`int` 到 `float` 不属于提升，而按整数—浮点转换规则处理。

### 转换失败

类型转换并不保证可用，失败通常有三类原因：

1. 源类型与目标类型之间不存在有效转换，例如不能把字符串字面量 `"14"` 转换为 `int`。
2. 转换本身存在，但当前语法禁止它，例如列表初始化禁止 `double` 到 `int` 的窄化转换：`int x{ 3.5 };`。
3. 同时存在多个候选转换，而编译器无法选出唯一的最佳转换，例如某些重载调用形成歧义。

编译器只有在找到当前上下文允许的有效转换后，才会生成目标类型的新值。

## 10.2 浮点提升与整数提升

### 提升的目的

基本类型的实际大小可以随编译器和体系结构变化。类型使用的位数称为**宽度**；位数更多的类型更宽，位数更少的类型更窄。`int` 和 `double` 通常会选择适合目标处理器高效运算的自然宽度。例如，32 位处理器通常以 32 位数据为自然操作单位，处理 8 位或 16 位值可能更慢，甚至需要额外步骤。

**数值提升**（numeric promotion）把特定的较窄数值类型转换为通常更易处理的较宽类型，一般是 `int` 或 `double`。所有数值提升都保持值不变，因此属于安全转换；编译器可以按需使用，不必为此发出警告。

提升还减少了接口冗余。接受 `int` 的函数可以同时接收能够提升为 `int` 的 `short`、`char`、`bool` 等实参，而不必为每种小整数类型各写一个函数。

只有规则明确列出的转换才属于数值提升。它们分为浮点提升和整数提升。

### 浮点提升

浮点提升只有一条主要规则：`float` 可以提升为 `double`。

```cpp
#include <iostream>

void printDouble(double value)
{
    std::cout << value << '\n';
}

int main()
{
    printDouble(5.0);  // 已经是 double
    printDouble(4.0f); // float -> double
}
```

转换后的 `double` 与原 `float` 表示相同的数值。

### 整数提升

常用整数提升规则如下：

- `signed char` 和 `signed short` 可以提升为 `int`。
- `unsigned char`、`char8_t` 和 `unsigned short`：若 `int` 能表示源类型的全部值，则提升为 `int`；否则提升为 `unsigned int`。
- 普通 `char` 的行为取决于实现选择的默认有符号性：有符号时遵循 `signed char` 规则，无符号时遵循 `unsigned char` 规则。
- `bool` 提升为 `int`，`false` 变为 `0`，`true` 变为 `1`。
- 还有用于较少见字符类型等情形的整数提升规则，实际代码应以完整语言规则为准。

在 8 位字节且 `int` 至少为 4 字节的常见平台上，`bool`、`char`、`signed char`、`unsigned char`、`signed short` 和 `unsigned short` 通常都会提升为 `int`：

```cpp
#include <iostream>

void printInt(int value)
{
    std::cout << value << '\n';
}

int main()
{
    short s{ 3 };
    printInt(s);    // short -> int
    printInt('a');  // char -> int
    printInt(true); // bool -> int
}
```

在 `int` 只有 2 字节等体系结构上，某些无符号小整数可能提升为 `unsigned int`。此外，提升保持的是**值**，不保证保持类型的有符号性；例如 `unsigned char` 完全可能提升为有符号的 `int`。

### 变宽不一定是提升

`char` 到 `short`、`int` 到 `long` 都可能变宽，但它们不属于 C++ 定义的数值提升，而属于数值转换。这些转换没有把较窄类型带到处理器通常更高效的 `int` 或 `double`。

这种分类会影响重载决议：其他条件相同时，编译器优先选择数值提升，而不是普通数值转换。

**关键点**

“目标类型更宽”不足以判定提升。只有语言明确列入提升规则的转换才是提升，并且每一种提升都保持值不变。

## 10.3 数值转换

### 五类数值转换

基本数值类型之间、不属于数值提升的转换称为**数值转换**。如果某个转换已经符合提升规则，就应称为提升，而不是数值转换。

数值转换包含五类：

1. 整数类型转换为其他整数类型，但排除整数提升，例如 `int -> short`、`int -> long`、`short -> char`、`int -> unsigned int`。
2. 浮点类型转换为其他浮点类型，但排除 `float -> double` 的提升，例如 `double -> float`、`double -> long double`。
3. 浮点类型转换为整数类型，例如 `double -> int`。
4. 整数类型转换为浮点类型，例如 `int -> double`。
5. 整数或浮点类型转换为 `bool`：零转换为 `false`，非零转换为 `true`。

示例常使用复制初始化，是因为列表初始化会直接拒绝其中一些窄化转换。

### 按安全性分类

#### 保值转换

如果目标类型能精确表示源类型的每个可能值，转换就是安全的**保值转换**。典型例子是常见平台上的 `int -> long` 和 `short -> double`：

```cpp
int n{ 5 };
long wider = n;

short s{ 5 };
double real = s;
```

保值转换通常不触发编译器警告。转换后的值再转回源类型，仍与原值等价。

#### 重解释型数值转换

有符号与无符号整数之间的转换属于不安全的**重解释型转换**：转换后的数值可能改变，但位中携带的信息并未丢失，因此转回原类型可以恢复等价值。

```cpp
int positive{ 5 };
unsigned int u1 = positive; // 仍为 5

int negative{ -5 };
unsigned int u2 = negative; // 模运算折回为很大的无符号值
```

负的有符号值无法由无符号类型表示，因此结果按模运算折回。此类值变化通常不是程序想表达的语义，却可能不产生默认警告。标准库数组等接口会让部分有符号/无符号转换难以完全避免，若没有启用相关警告，函数实参与形参符号性相反时尤其需要检查。

重解释型转换可以往返恢复：

```cpp
#include <iostream>

int main()
{
    int restored = static_cast<int>(static_cast<unsigned int>(-5));
    std::cout << restored << '\n'; // C++20 起按规定得到 -5
}
```

C++20 要求有符号整数采用二进制补码，并把无符号值转为超出目标有符号范围时的结果规定为模折回；在 C++20 之前，这种结果在标准上由实现定义。这里的转换规则不等于算术规则：**有符号算术溢出仍是未定义行为**。

#### 有损转换

如果转换可能丢失数据，就是不安全的**有损转换**。例如：

```cpp
int whole1 = 3.0;       // 得到 3，没有实际丢失
int whole2 = 3.5;       // 得到 3，小数部分丢失

float approximate = 1.23456789; // 可能得到约 1.23457
```

把结果转回源类型无法恢复丢掉的信息：`3.5 -> 3 -> 3.0`，`double -> float -> double` 也只能保留经过 `float` 舍入后的值。运行期发生的隐式有损转换通常会产生警告或错误。

转换是否安全还取决于实现。`int` 为 32 位、`double` 为 64 位时，`double` 通常能精确表示所有 `int` 值；若二者都是 64 位，`int -> double` 可能丢失精度：

```cpp
#include <iostream>

int main()
{
    auto original = 10000000000000001LL;
    auto restored = static_cast<long long>(static_cast<double>(original));
    std::cout << restored << '\n'; // 可能输出 10000000000000000
}
```

### 不安全转换可接受的条件

不安全转换应尽量避免，但在两类条件下可能合理：

- 已用不变量把源值限制在目标类型可精确表示的子集内，例如能够保证 `int` 非负时再转为 `unsigned int`。
- 丢失的信息与目的无关，例如把整数转换为 `bool` 只关心它是否为零。

显式转换只表示“这是有意的”，不会自动证明值满足这些前提。

### 常用结果规则

- 目标类型范围不能容纳源值时，结果通常违背直觉。较大的整数转入 `char` 等小类型尤其危险。
- 无符号算术溢出按模运算定义；有符号算术溢出是未定义行为。类型转换与算术溢出应分别判断。
- 同一家族中由较大类型转到较小类型，只要当前值位于目标范围内，通常能得到预期结果；浮点转换仍可能因精度降低而舍入。
- 整数转浮点时，只要数值在浮点类型范围内，量级通常可表示，但不保证每个整数都能精确表示。
- 浮点转整数时，数值必须位于目标整数范围内，小数部分会被截去而不是四舍五入。
- 编译器通常会提示危险的隐式转换，但有符号/无符号转换经常例外，不能把“无警告”当作安全证明。

## 10.4 窄化转换、列表初始化与 constexpr 初始化器

### 窄化转换的定义

**窄化转换**是目标类型可能无法容纳源类型全部值的潜在不安全数值转换。C++ 把以下转换定义为窄化：

1. 浮点类型转换为整数类型。
2. 浮点类型转换为更窄或等级更低的浮点类型；例外是源值为常量表达式且位于目标类型范围内，即使目标精度不足以保存所有有效数字也不算窄化。
3. 整数类型转换为浮点类型；例外是源值为常量表达式且能在目标类型中精确表示。
4. 整数类型转换为不能表示源类型全部值的另一整数类型；例外是源值为常量表达式且该具体值能由目标类型精确表示。该类既包括宽整数到窄整数，也包括有符号与无符号之间的转换。

隐式窄化通常产生编译器警告；有符号/无符号转换是否警告取决于编译器配置。

**最佳实践**

尽可能避免窄化转换。确实需要时使用 `static_cast` 明确表达意图，使代码表明程序接受潜在的数据丢失，并抑制相应的隐式转换诊断。

```cpp
void consume(int value)
{
}

int main()
{
    double d{ 5.0 };
    consume(static_cast<int>(d));
}
```

### 列表初始化禁止窄化

花括号列表初始化会把窄化转换当作编译错误，这是优先使用该初始化形式的重要原因之一：

```cpp
int rejected{ 3.5 }; // 错误：double -> int 是窄化
```

若转换确实有意，应先显式得到目标类型，再用该结果初始化对象：

```cpp
double d{ 3.5 };
int accepted{ static_cast<int>(d) };
```

花括号看到的初始化表达式已经是 `int`，因此初始化本身没有类型不匹配。

### 常量表达式例外

运行期值在编译时未知，编译器无法判断某次潜在窄化是否恰好保持值。例如运行期读入的 `int` 传给 `unsigned int` 形参，输入 `5` 时保值，输入 `-5` 时改变值，所以仍按可能窄化处理。

源值是常量表达式时，编译器能够先完成转换并检查具体值。若该值能精确存入目标类型，规则规定它不算窄化；否则列表初始化报错：

```cpp
constexpr int positive{ 5 };
unsigned int u1{ positive }; // 合法：5 可精确表示

constexpr int negative{ -5 };
unsigned int u2{ negative }; // 错误：转换会改变值
```

浮点到整数没有这种常量表达式例外，所以即使值为编译期常量且看似可表示，也始终属于窄化：

```cpp
int n{ 5.0 }; // 错误
```

相反，常量表达式浮点值转为更低等级的浮点类型，只要值在目标范围内就不算窄化，哪怕发生精度损失：

```cpp
constexpr double tenth{ 0.1 };
float f{ tenth }; // 合法，但通常不能精确保存 0.1
```

**警告**

`constexpr` 浮点值转为更窄或更低等级的浮点类型时，列表初始化并不保证精度不变。GCC 和 Clang 在启用 `-Wconversion` 后仍可能对此给出警告。

### constexpr 初始化器带来的便利

常量表达式例外使很多列表初始化无需字面量后缀或 `static_cast`：

```cpp
unsigned int count{ 5 }; // 不必写 5u
float ratio{ 1.5 };      // 不必写 1.5f

constexpr int size{ 5 };
double precise{ size };  // 不必转换
short small{ 5 };        // short 没有专用字面量后缀
```

同样的常量表达式判断也适用于复制初始化和直接初始化。

浮点类型等级从高到低为：

1. `long double`
2. `double`
3. `float`

因此 `float f{ 1.23456789 };` 是合法的：`1.23456789` 是 `double` 常量表达式，值位于 `float` 范围内，虽然 `float` 可能无法保留全部有效数字。

## 10.5 算术转换

### 通常算术转换与公共类型

同类型操作数参与二元运算时，通常直接以该类型计算并产生该类型结果，例如 `2 + 3` 得到 `int` 值 `5`。某些运算符要求两个操作数具有相同类型；操作数类型不同时，编译器使用**通常算术转换**（usual arithmetic conversions）把一方或双方转换为匹配类型。最终匹配出的类型称为操作数的**公共类型**。

需要匹配操作数类型的运算符包括：

- 二元算术运算符：`+`、`-`、`*`、`/`、`%`；
- 二元关系运算符：`<`、`>`、`<=`、`>=`、`==`、`!=`；
- 二元按位运算符：`&`、`^`、`|`；
- 条件运算符 `?:` 的后两个操作数；条件本身应能转换为 `bool`。

重载运算符不受内建运算符的通常算术转换规则约束。

### 简化的类型等级与判定步骤

常用类型的简化等级从高到低可写为：

1. `long double`
2. `double`
3. `float`
4. `long long`
5. `long`
6. `int`

公共类型按以下顺序确定：

1. 若一个操作数是整数、另一个是浮点数，整数直接转换为浮点操作数的类型，不先执行整数提升。
2. 否则，对整数操作数执行整数提升。
3. 提升后若两个操作数符号性相同，或两者都是浮点类型，较低等级的操作数转换为较高等级类型。
4. 提升后若一个有符号、一个无符号，则使用专门的符号匹配规则。

不同符号整数的匹配规则依次为：

1. 若无符号操作数的等级不低于有符号操作数，把有符号操作数转换为无符号操作数的类型。
2. 否则，若有符号操作数的类型能表示无符号操作数类型的全部值，把无符号操作数转换为该有符号类型。
3. 否则，把两个操作数都转换为与有符号操作数类型对应的无符号类型。

### 常见示例

`int` 与 `double` 相加时，`int` 操作数转换为 `double`，结果也是 `double`：

```cpp
int i{ 2 };
double d{ 3.5 };
auto result = i + d; // double 5.5
```

两个 `short` 相加前都会整数提升为 `int`，因此结果类型不是 `short`，而是 `int`：

```cpp
short a{ 4 };
short b{ 5 };
auto result = a + b; // int 9
```

`typeid(expression).name()` 可以观察实现给出的类型名称，但返回的文本由实现定义，不同编译器不保证相同。

### 混合有符号与无符号值的风险

规则可能把负的有符号值转换为很大的无符号值：

```cpp
#include <iostream>
#include <typeinfo>

int main()
{
    std::cout << typeid(5u - 10).name() << ' ' << 5u - 10 << '\n';
    // 32 位 unsigned int 的典型数值结果：4294967291

    std::cout << std::boolalpha << (-3 < 5u) << '\n';
    // 典型结果：false
}
```

`5u - 10` 中的 `10` 被转换为 `unsigned int`，运算结果按无符号规则折回。比较 `-3 < 5u` 时，`-3` 先变成很大的无符号值，因此比较得到 `false`。这类转换经常没有编译器警告。

**警告**

避免在算术和比较表达式中混用有符号与无符号整数。无符号值进入通常算术转换后，结果类型和数值都可能与直觉不符。

### 查询公共类型

头文件 `<type_traits>` 中的 `std::common_type` 和别名 `std::common_type_t` 可在编译期给出若干类型的公共类型：

```cpp
#include <type_traits>

using A = std::common_type_t<int, double>;        // double
using B = std::common_type_t<unsigned int, long>; // 取决于平台类型范围
```

第二个结果依赖目标平台上 `long` 与 `unsigned int` 的等级和可表示范围。

## 10.6 显式类型转换、类型转换运算符与 static_cast

### 转换必须发生在运算之前

```cpp
double d = 10 / 4;
```

两个操作数都是 `int`，所以先执行整数除法得到 `int` 值 `2`，随后才把 `2` 转换为 `double` 值 `2.0`。赋值目标是 `double` 并不能反向改变已经完成的除法。

字面量可以直接写成浮点类型：

```cpp
double d = 10.0 / 4.0; // 2.5
```

变量没有可追加的字面量后缀，因此需要在运算前显式转换至少一个操作数：

```cpp
int x{ 10 };
int y{ 4 };

double d = static_cast<double>(x) / y; // 2.5
```

左操作数成为 `double` 后，通常算术转换会把右操作数也转换为 `double`，从而执行浮点除法。

### C++ 的五类转换

转换运算符接收一个表达式和一个目标类型，并返回转换结果。C++ 支持五类转换：

| 转换 | 作用 | 安全性 |
|---|---|---|
| `static_cast` | 在编译期执行相关类型之间的转换 | 安全，能力受限且受编译期检查 |
| `dynamic_cast` | 在多态继承层次中对指针或引用执行运行期转换 | 安全 |
| `const_cast` | 添加或移除 `const` | 只有添加 `const` 是安全的 |
| `reinterpret_cast` | 按另一类型重新解释底层位表示 | 不安全 |
| C 风格转换 | 可能组合使用 `static_cast`、`const_cast` 或 `reinterpret_cast` | 不安全且意图不明确 |

`const_cast` 和 `reinterpret_cast` 只适用于少数专门场景，错误使用会破坏类型系统提供的保护。

**警告**

没有充分理由时应避免 `const_cast` 和 `reinterpret_cast`。

### C 风格转换

C 风格转换把目标类型写在圆括号中：

```cpp
std::cout << (double)x / y << '\n';
```

函数风格写法表达相同类别的转换：

```cpp
std::cout << double(x) / y << '\n';
```

C 风格转换的问题不只是语法旧。它会按顺序尝试：

1. `const_cast`；
2. `static_cast`；
3. `static_cast` 后接 `const_cast`；
4. `reinterpret_cast`；
5. `reinterpret_cast` 后接 `const_cast`。

因此一段看似普通的转换可能实际执行去除限定或位级重解释。此语法也难以在代码中识别和搜索，错误可能直到运行期才暴露。命名转换能力更受限、意图更明确，并会在误用时产生编译错误。

C 风格转换还存在一个命名转换无法直接复现的特殊能力：它可以把派生类对象转换为不可访问的基类，例如私有继承形成的基类。这个例外进一步说明了它的权限过宽。

**最佳实践**

现代 C++ 代码应避免 C 风格转换和函数风格的 C 风格转换。

### static_cast

`static_cast<目标类型>(表达式)` 用于显式地把一个类型的值转换为另一类型的值。结果是一个用转换后数值直接初始化的目标类型临时对象：

```cpp
#include <iostream>

int main()
{
    char ch{ 'a' };
    std::cout << static_cast<int>(ch) << '\n'; // 常见字符集下输出 97
}
```

`static_cast` 有两个重要性质：

1. 编译器必须知道如何完成所请求的转换；不存在有效转换时直接编译失败。
2. 它有意弱于 C 风格转换，不允许需要位级重解释或丢弃 `const` 的危险操作。

```cpp
int invalid{ static_cast<int>("Hello") }; // 错误：字符串字面量不能转为 int
```

目标为类类型时，`static_cast` 使用直接初始化，因此目标类的显式构造函数也会参与临时对象初始化。

**最佳实践**

需要把一个值转换为另一类型的值时，优先使用 `static_cast`。

### 用 static_cast 标记有意窄化

`static_cast` 可以把隐式窄化改为显式窄化：

```cpp
int code{ 48 };
char ch{ static_cast<char>(code) };
```

这段代码表明转换是有意的，并消除初始化处的类型不匹配诊断；程序员同时承担值超出 `char` 范围时的后果。消除警告并不等于消除风险。

表达式结果也可以显式窄化：

```cpp
int value{ 100 };
value = static_cast<int>(value / 2.5);
```

除法先产生浮点结果，再明确丢弃小数部分。

### static_cast 与临时对象列表初始化

把 `x` 转成 `int` 有两种常见写法：

- `static_cast<int>(x)`：返回以 `x` 直接初始化的临时 `int`；
- `int{ x }`：创建以 `x` 直接列表初始化的临时 `int`。

不应使用 `int(x)`，因为它属于函数风格的 C 风格转换。

两种常见写法有三项重要差异：

1. `int{ x }` 禁止窄化。初始化变量时这通常有利，但显式转换本就可能用于接受有意的数据损失。某些转换还会因平台宽度不同而只在部分平台被判定为窄化。例如 `double{x}` 在 32 位 `int` 平台通常可行，在 `int` 为 64 位且 `double` 不能精确表示其全部值的平台可能无法编译。
2. `static_cast` 明确标记转换意图，更容易识别和搜索。
3. 临时对象的直接列表初始化只接受单词形式的简单类型说明符。`int{ x }` 合法，而 `unsigned int{ x }` 在这类表达式位置不合法。

多词类型可以先定义单词别名：

```cpp
using uint = unsigned int;

unsigned char ch{ 'a' };
auto value = uint{ ch };
```

但直接写 `static_cast<unsigned int>(ch)` 更清楚，也没有这一语法限制。

**最佳实践**

需要转换而不是声明并初始化变量时，优先使用 `static_cast`，而不是构造一个直接列表初始化的临时对象。

## 参考来源

1. [10.1 — Implicit type conversion](https://www.learncpp.com/cpp-tutorial/implicit-type-conversion/)
2. [10.2 — Floating-point and integral promotion](https://www.learncpp.com/cpp-tutorial/floating-point-and-integral-promotion/)
3. [10.3 — Numeric conversions](https://www.learncpp.com/cpp-tutorial/numeric-conversions/)
4. [10.4 — Narrowing conversions, list initialization, and constexpr initializers](https://www.learncpp.com/cpp-tutorial/narrowing-conversions-list-initialization-and-constexpr-initializers/)
5. [10.5 — Arithmetic conversions](https://www.learncpp.com/cpp-tutorial/arithmetic-conversions/)
6. [10.6 — Explicit type conversion (casting) and static_cast](https://www.learncpp.com/cpp-tutorial/explicit-type-conversion-casting-and-static-cast/)

