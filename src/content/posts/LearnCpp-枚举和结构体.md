---
title: LearnCpp 枚举和结构体
image: /assets/post-card/post-card-36-v20260819.jpg
cardImagePosition: center 25%
published: 2026-08-20
updated: 2026-08-20
description: LearnCpp 枚举和结构体笔记，系统介绍程序定义类型、枚举、结构体、I/O 运算符重载与类模板。
tags:
  - C++
category:
  - LearnCpp
  - Tutorial
section: notes
author: nikonikoni
draft: false
---
# LearnCpp 枚举和结构体

## 13.1 程序定义类型简介

基本类型由 C++ 核心语言定义，`int`、`double` 等类型可以直接使用。函数、指针、引用和数组等简单扩展自基本类型的复合类型同样如此：语言已经知道这些类型名称和声明符号的含义，不需要程序另行提供类型定义。

类型别名则会引入新的标识符，因此必须先定义后使用：

```cpp
using Length = int;

Length x { 5 };
```

`using Length = int;` 不创建对象，只告诉编译器 `Length` 代表什么类型。

### 程序定义类型

C++ 允许程序定义核心语言没有预先提供的新类型。能够创建程序定义类型的复合类型分为两类：

- 枚举类型，包括无作用域枚举和作用域枚举；
- 类类型，包括结构体、类和联合体。

程序定义类型必须先有名称和完整的类型定义，之后才能使用。其他复合类型本身不一定需要程序提供名称或定义。函数虽然也需要名称和定义，但被命名、定义的是函数本身，而不是函数类型，因此程序编写的函数称为“用户定义函数”，不属于“用户定义类型”。

```cpp
struct Fraction
{
    int numerator {};
    int denominator {};
};

int main()
{
    Fraction f { 3, 4 };
}
```

`struct Fraction { ... };` 只描述 `Fraction` 类型的结构，不分配对象内存；`Fraction f { 3, 4 };` 才实例化并初始化对象。程序定义类型的定义必须以分号结束。漏写分号时，编译器可能在定义之后的代码行报错，使错误位置不直观。

### 命名和多文件定义

程序定义类型按惯例以大写字母开头，并且不附加 `_t` 等后缀，例如使用 `Fraction`，而不是 `fraction`、`fraction_t` 或 `Fraction_t`。`Fraction fraction {};` 中的前一个名称是类型，后一个名称是变量；C++ 区分大小写，因此二者不冲突。

每个使用程序定义类型的翻译单元都必须在使用前看到完整定义。只有前向声明通常不足以定义该类型的对象，因为编译器需要完整布局来确定对象占用多少内存。

- 只在一个源文件使用的类型，应定义在该文件中，并尽量靠近首次使用处。
- 在多个源文件使用的类型，通常定义在与类型同名的头文件中，再由需要它的源文件 `#include`。例如 `Fraction` 通常定义在 `Fraction.h`。
- 头文件应使用头文件保护，避免同一翻译单元内出现重复定义。

类型定义部分豁免于单一定义规则：同一类型可以在多个翻译单元中定义，因此完整类型定义可以放在头文件中。但这种豁免有两个限制：同一翻译单元中仍然只能出现一个该类型定义；程序中该类型的每份定义必须完全相同，否则行为未定义。

### 相关术语

| 术语 | 含义 | 示例 |
|---|---|---|
| 基本类型 | C++ 核心语言直接提供的基础类型 | `int`、`std::nullptr_t` |
| 复合类型 | 根据其他类型构成的类型 | `int&`、`double*`、`std::string`、`Fraction` |
| 用户定义类型 | 标准术语中的任意类类型或枚举类型，包括标准库和实现定义的类型 | `std::string`、`Fraction` |
| 程序定义类型 | 排除核心语言、标准库和实现所提供的类型，由程序或第三方代码定义的类类型或枚举类型 | `Fraction` |

“用户定义类型”在日常交流中经常被用来表示程序自己定义的类型，但 C++ 标准中的范围更宽，连标准库定义的 `std::string` 也属于用户定义类型。C++20 的“程序定义类型”术语能更精确地表示程序或第三方库定义的类类型和枚举类型。

## 13.2 无作用域枚举

用普通整数表示一组有限状态会产生魔数，例如约定 `0` 表示红色、`1` 表示绿色。改用符号常量虽然改善可读性，但变量与常量集合之间的关系仍然只存在于程序员的理解中。类型别名也不提供新的类型约束：

```cpp
using Color = int;

constexpr Color red { 0 };
constexpr Color green { 1 };
constexpr Color blue { 2 };

Color eyeColor { 8 }; // 语法有效，但没有约定的语义
```

调试这类对象时通常只能看到整数，而不是对应的符号含义。

### 枚举与枚举项

枚举是一种复合数据类型，其值限制为一组命名的符号常量，这些常量称为枚举项。C++ 支持无作用域枚举和作用域枚举。枚举属于程序定义类型，必须在使用前完整定义。

无作用域枚举使用 `enum` 定义：

```cpp
enum Color
{
    red,
    green,
    blue,
};
```

- `Color` 是枚举类型；`red`、`green` 和 `blue` 是属于该类型的枚举项。
- 枚举项之间用逗号而不是分号分隔。最后一个枚举项之后的尾随逗号可选，但建议保留。
- 整个枚举定义以分号结束。
- 枚举项是隐式 `constexpr` 常量，也就是语言规则中的隐式 constexpr 常量。
- 正常初始化枚举对象时，初始化器必须是属于该枚举的枚举项；不存在的枚举项或普通整数不能直接使用。

枚举类型名按程序定义类型惯例以大写字母开头。枚举可以没有类型名，但现代 C++ 应避免匿名枚举。枚举项没有统一命名标准；较稳妥的约定是小写字母开头。全大写名称通常留给预处理器宏，容易发生冲突；大写字母开头的名称通常留给程序定义类型。

### 枚举是独立类型

每个枚举都是独立类型，编译器可以区分不同枚举；这与不创建独立类型的 `typedef` 或类型别名不同。一个枚举中的枚举项不能用于初始化另一个枚举类型的对象：

```cpp
enum Pet { cat, dog, pig, whale };
enum Color { black, red, blue };

Pet pet { black }; // 错误：black 不属于 Pet
```

枚举适合表示规模较小、彼此相关，并且对象在任一时刻只保存其中一个值的常量集合。典型用途包括星期、方向、扑克牌花色、函数状态码或错误码、游戏中的物品或地形、函数的选项参数，以及 `std::bitset` 中一组相关位标志的位置。枚举通常很小且复制成本低，按值传递和返回是合适的。布尔值在概念上类似只有两个值的枚举，但 C++ 的 `true` 和 `false` 是关键字，不是枚举项。

### 无作用域枚举的作用域

无作用域枚举会把枚举项放入枚举定义所在的作用域。全局定义的枚举会把枚举项放进全局命名空间，增加名称冲突的可能；同一作用域中的两个枚举不能声明同名枚举项。

无作用域枚举同时也为枚举项提供以枚举类型名命名的作用域，因此下面两种形式都有效：

```cpp
Color apple { red };
Color raspberry { Color::red };
```

无作用域枚举项通常不加限定名。减少名称冲突的方法包括：

- 为枚举项添加类型名前缀，例如 `color_red`；这种方式仍会污染外层作用域，只是降低碰撞概率。
- 把枚举放入命名空间；访问时使用命名空间限定名。
- 与类紧密相关时，把枚举定义在类的作用域中。
- 使用作用域枚举。
- 仅在单个函数中使用时，把枚举定义在函数体内；局部枚举项只在函数内可见，并会遮蔽同名全局枚举项。

无作用域枚举最好位于命名空间、类或函数等命名作用域中，避免枚举项污染全局命名空间。枚举对象可以用 `==` 和 `!=` 与属于同一枚举的枚举项比较。

## 13.3 无作用域枚举项与整数转换

每个枚举项都关联一个整数值。默认情况下，第一个枚举项的值是 `0`，之后每个枚举项比前一个大 `1`。

```cpp
enum Color
{
    black, // 0
    red,   // 1
    blue,  // 2
};
```

枚举值可以显式指定为正数或负数；没有显式值的枚举项仍取前一个值加 `1`。多个枚举项可以拥有相同值，但此时这些枚举项不再能通过存储值区分，使用上基本可以互换。语言允许重复值，通常应避免。显式枚举值必须是整数常量表达式，可以引用先前的枚举项，不能使用浮点值或非常量值。默认编号通常已经合适，不应无理由手工指定值。

```cpp
enum Animal
{
    cat = -3,
    dog,         // -2
    pig,         // -1
    horse = 5,
    giraffe = 5, // 与 horse 相同
    chicken,     // 6
};
```

### 值初始化

枚举进行零初始化时，存储值一定是 `0`，即使没有任何枚举项代表 `0`。因此：

- 若存在值为 `0` 的枚举项，它应表示最合理的默认状态。
- 若没有合理的默认状态，应增加 `unknown` 或 `invalid` 等值为 `0` 的枚举项，使这种状态有明确名称并能被显式处理。
- 若既没有值为 `0` 的枚举项，也没有无效状态枚举项，值初始化会产生语义上无效、但底层值仍为 `0` 的枚举对象。

### 枚举到整数

枚举保存整数值，但枚举本身不是整数类型，而是复合类型。无作用域枚举可以隐式转换为整数；枚举项是编译期常量，因此该转换可以出现在常量表达式中。

当枚举参与函数调用或运算符表达式时，编译器先寻找直接接受枚举类型的重载；若没有匹配，再考虑无作用域枚举到整数的转换。例如没有 `Color` 专用输出重载时，`std::cout << color` 会使用整数输出重载并打印底层值。

### 底层类型和大小

保存枚举项值的整数类型称为枚举的底层类型或基类型。无作用域枚举未显式指定底层类型时，具体选择由实现决定。多数实现会在所有枚举值都能容纳时选择 `int`，需要时选择更大的整数类型；代码不应假定所有平台都使用 `int`。

底层类型可以显式指定，而且必须是整数类型：

```cpp
#include <cstdint>

enum Color : std::int8_t
{
    black,
    red,
    blue,
};
```

显式指定较小底层类型可用于网络传输等对存储或带宽敏感的场景，但只应在确有必要时使用。`std::int8_t` 和 `std::uint8_t` 通常是字符类型的别名；以它们为底层类型后，流输出底层值时很可能按字符而不是数字处理。

### 整数到无作用域枚举

整数不会隐式转换为无作用域枚举。可以使用 `static_cast<Enum>(value)` 显式转换，但应先验证外部输入：

- 转换为枚举中实际存在的枚举值是安全的。
- 整数只要位于目标枚举允许的范围内，即使没有对应的命名枚举项，转换本身仍安全，但会产生没有符号名称的状态。
- 超出枚举允许范围的转换会产生未定义行为。

显式指定底层类型时，枚举允许范围等于底层类型的完整范围。未显式指定底层类型时，安全范围由能够容纳全部枚举项值的最小位数决定。例如，枚举值为 `2`、`9`、`12` 时，最少需要无符号 4 位，安全范围为 `0` 到 `15`；枚举值为 `-28`、`2`、`6` 时，最少需要有符号 6 位，安全范围为 `-32` 到 `31`。

C++17 起，显式指定底层类型的无作用域枚举可用整数进行花括号列表初始化：

```cpp
enum Pet : int { cat, dog, pig, whale };

Pet pet1 { 2 }; // C++17：有效
Pet pet2(2);    // 错误：圆括号直接初始化未放宽
Pet pet3 = 2;   // 错误：复制初始化未放宽

pet1 = 3;       // 错误：整数赋值未放宽
```

## 13.4 枚举与字符串之间的转换

C++ 没有自动把枚举项名称转换成字符串的内建机制。无作用域枚举直接送入普通输出流时，通常只会打印底层整数。

### 从枚举取得名称

常见实现是编写一个 `constexpr` 函数，用 `switch` 把每个枚举项映射到字符串：

```cpp
#include <string_view>

enum Color { black, red, blue };

constexpr std::string_view getColorName(Color color)
{
    switch (color)
    {
    case black: return "black";
    case red:   return "red";
    case blue:  return "blue";
    default:    return "???";
    }
}
```

`default` 处理意外值或没有命名枚举项对应的值。返回查看字符串字面量的 `std::string_view` 是安全的，因为字符串字面量具有静态存储期，在整个程序运行期间存在。函数声明为 `constexpr` 后，返回的名称也可以用于常量表达式。另一种常见映射方式是使用数组。

### 数字输入

输入流不知道如何直接读入程序定义的枚举类型。数值输入可以先读入 `int`，检查它是否位于允许的语义范围内，再执行 `static_cast<Enum>(input)`。校验必须发生在转换之前。

### 从字符串取得枚举

`switch` 不能作用于字符串，简单的字符串解析可以使用一系列 `if` 比较。无效输入可以用额外的 `invalid` 枚举项表达，但返回 `std::optional<Enum>` 能更直接地表示“没有匹配值”：

```cpp
#include <optional>
#include <string_view>

enum Pet { cat, dog, pig, whale };

constexpr std::optional<Pet> getPetFromString(std::string_view sv)
{
    if (sv == "cat")   return cat;
    if (sv == "dog")   return dog;
    if (sv == "pig")   return pig;
    if (sv == "whale") return whale;

    return {};
}
```

这个实现只匹配小写输入。ASCII 式的大小写无关匹配可以先用 `std::transform` 和 `std::tolower` 逐字符转换。传给 `std::tolower` 的 `char` 应先转换为 `unsigned char`，结果再转换回 `char`，以满足函数的有效输入范围。这种简单函数只支持 1:1 字符映射，不能处理所有语言环境中的复杂大小写变换。

## 13.5 I/O 运算符重载简介

每次输出枚举都显式调用 `getColorName(color)` 会要求调用者记住辅助函数名称，也会增加表达式噪声。运算符重载允许为现有运算符定义适用于程序定义类型的新重载。

基本规则如下：

- 函数名由 `operator` 和运算符符号组成。
- 按从左到右的操作数顺序声明参数。
- 至少一个参数必须是用户定义类型，即类类型或枚举类型。
- 返回类型应符合运算的语义，并返回运算结果。

编译器遇到 `x + y` 时，会使用重载决议寻找可调用的 `operator+(x, y)`。运算符也可以重载为最左操作数类型的成员函数。

### 重载输出运算符

`std::cout << 5` 本质上会调用接受 `std::ostream` 和 `int` 的 `operator<<` 重载。输出运算符按惯例返回左操作数，使连续输出能够链式执行。

```cpp
std::ostream& operator<<(std::ostream& out, Color color)
{
    out << getColorName(color);
    return out;
}
```

`std::ostream` 以非常量引用传入，因为流对象不能复制，输出也会修改流状态。枚举对象很小，可以按值传递。实现必须写入参数 `out`，不能固定写入 `std::cout`；这样同一重载才能用于 `std::cout`、`std::cerr` 或其他输出流。返回 `out` 后，`std::cout << color << '\n'` 可以继续链式输出。

### 重载输入运算符

```cpp
std::istream& operator>>(std::istream& in, Pet& pet)
{
    std::string input {};
    in >> input;

    if (auto match { getPetFromString(input) })
        pet = *match;
    else
        in.setstate(std::ios_base::failbit);

    return in;
}
```

输入流参数和返回值使用 `std::istream&`。右操作数 `pet` 是非常量引用，因为它是输出参数，解析成功后需要修改调用者的对象；若按值传递，只会修改副本。

实现可以先利用已有重载读取 `std::string`，再映射成枚举。匹配失败时应设置 `std::ios_base::failbit`，让失败反映到输入流状态。标准提取失败时会将基本类型零初始化；自定义枚举输入是否也执行 `pet = {};` 是接口设计选择。

调用者可以测试输入流是否有效。失败后可调用 `clear()` 恢复流状态，再用 `ignore(std::numeric_limits<std::streamsize>::max(), '\n')` 丢弃错误输入的剩余部分。基于数组的统一映射可以减少输入、输出转换之间的重复，并降低新增枚举项后漏改映射代码的风险。

## 13.6 作用域枚举（枚举类）

无作用域枚举虽然是独立类型，但不是完全类型安全的。两个不同枚举都可以隐式转换成整数，因此比较不同枚举对象时，编译器可能把二者转成整数并得出语义上无意义的相等结果。无作用域枚举还会把枚举项注入外层作用域。

作用域枚举使用 `enum class` 定义：

```cpp
enum class Color
{
    red,
    blue,
};

Color shirt { Color::red };
```

作用域枚举有两个核心区别：

- 不隐式转换为整数；
- 枚举项只存在于枚举自身的作用域中，必须用 `Color::red` 等限定名访问。

不同作用域枚举类型之间不能直接比较，同一作用域枚举的值仍可正常使用 `==` 等运算符比较。作用域枚举已经提供自己的命名作用域，通常无需再包入额外命名空间。

`enum class` 中的 `class` 不代表这种枚举属于类类型；类类型仍专指结构体、类和联合体。`enum struct` 与 `enum class` 的行为相同，但不是惯用写法，应避免使用。

### 显式转换

需要底层整数时，可以使用 `static_cast<int>(value)`。C++23 起，`<utility>` 中的 `std::to_underlying(value)` 会返回枚举底层类型的值，比固定转换到 `int` 更准确。整数也可以用 `static_cast<Enum>(integer)` 显式转换成作用域枚举，但外部输入仍应先验证语义范围。

C++17 起，作用域枚举可以直接用整数进行花括号列表初始化，而且不要求显式指定底层类型：

```cpp
enum class Pet { cat, dog, pig, whale };

Pet pet { 1 }; // C++17
```

作用域枚举通常优于无作用域枚举。确实需要频繁隐式转换为 `int`，并且不需要额外命名作用域时，无作用域枚举仍可能更方便。

### 简化到底层类型的转换

需要频繁、但仍希望保持显式转换时，可以重载一元 `operator+`：

```cpp
#include <type_traits>

template <typename T>
constexpr auto operator+(T value) noexcept
{
    return static_cast<std::underlying_type_t<T>>(value);
}
```

此后 `+Color::red` 会得到底层整数值。该做法保留“默认不隐式转换”的保护，同时提供简洁的显式请求。C++23 的实现可以改用 `std::to_underlying()`。

C++20 的 `using enum EnumType;` 会把指定枚举的全部枚举项引入当前作用域。它特别适合局部 `switch`：可以省略重复的 `Color::` 前缀，同时把名称缩短的影响限制在局部作用域。

## 13.7 结构体、成员与成员选择

用许多独立变量描述一个对象会隐藏变量之间的关系；函数需要庞大且顺序敏感的参数列表；新增属性时要修改大量声明、定义和调用；表示多个同类对象时，变量数量和命名还会迅速膨胀。结构体把多个相关变量组合成一个程序定义类型。

结构体属于类类型，适用于类类型的一般规则也适用于结构体。

```cpp
struct Employee
{
    int id {};
    int age {};
    double wage {};
};
```

结构体内声明的变量称为数据成员或成员变量。更一般地，C++ 中的“成员”是属于结构体或类，并在其定义内部声明的变量、函数或类型。成员声明后的 `{}` 是默认成员初始化器，使成员在适用时进行值初始化。

类型定义以分号结束，而且本身不创建对象。`Employee joe {};` 才实例化一个 `Employee` 对象；空花括号使对象值初始化。同一结构体类型可以创建多个独立对象，它们共享相同的成员名称。

对象使用成员选择运算符 `.` 访问成员：

```cpp
Employee joe {};

joe.age = 32;
joe.wage = 60000.0;
++joe.age;
```

成员变量与普通变量一样，可以赋值、参与算术和比较或执行自增等操作。结构体只需为每个对象创建一个外部名称，成员名由类型统一提供，因此多个同类对象的代码更一致，也更容易看出数据归属。

## 13.8 结构体的聚合初始化

数据成员与普通局部变量类似，没有初始化器时默认不会自动初始化。如果结构体对象本身也没有初始化器，未初始化成员会持有不确定值；读取它们会产生未定义行为。

### 聚合类型

一般编程语境中的聚合是能够包含多个数据成员的类型。C++ 标准的定义更严格。简化而言，C++ 聚合是 C 风格数组，或者满足以下条件的类类型：

- 没有用户声明的构造函数；
- 没有私有或受保护的非静态数据成员；
- 没有虚函数。

`std::array` 也是聚合。只包含数据成员的普通结构体通常是聚合。

### 聚合初始化规则

聚合初始化通过花括号内的逗号分隔列表直接初始化成员：

```cpp
struct Employee
{
    int id {};
    int age {};
    double wage {};
};

Employee frank = { 1, 32, 60000.0 }; // 复制列表初始化
Employee joe { 2, 28, 45000.0 };     // 列表初始化，优先
```

初始化严格按成员声明顺序逐成员进行。初始化聚合时应优先使用非复制的花括号列表形式。

C++20 允许某些聚合用圆括号列表直接初始化，但应尽量避免，因为这种形式不能正确覆盖依赖花括号省略的聚合，典型例子是 `std::array`。

初始化器少于成员数时，缺失成员按以下规则处理：

1. 成员有默认成员初始化器时，使用该初始化器。
2. 否则从空初始化器列表进行复制初始化，通常会值初始化该成员；若成员是类类型，可能调用默认构造函数，即使该类型还有列表构造函数。

因此 `Employee joe {};` 通常可以值初始化全部没有显式值的成员。

### 输出和常量结构体

结构体可以重载 `operator<<`。结构体可能包含多个值，通常以 `const Struct&` 传入以避免复制。输出格式由程序决定，包含字段名称的描述性格式往往比连续输出裸值更清楚。

结构体对象可以声明为 `const` 或 `constexpr`；与其他常量对象一样，它们必须初始化。

### 指定初始化器（C++20）

位置初始化依赖成员声明顺序。在已有结构体定义中间插入成员，可能使原有初始化值整体错位，而语法仍然有效。C++20 的指定初始化器显式说明值对应哪个成员：

```cpp
struct Foo
{
    int a {};
    int b {};
    int c {};
};

Foo f1 { .a{ 1 }, .c{ 3 } };
Foo f2 { .a = 1, .c = 3 };
Foo f3 { .b{ 2 }, .a{ 1 } }; // 错误：顺序不符合声明顺序
```

指定成员必须按照结构体中的声明顺序出现，否则会产生警告或错误；未指定成员仍按缺失初始化器规则初始化。Clang 可能对使用花括号指定单个标量值错误地报告 `braces around scalar initializer`，这是实现问题。

指定初始化器增强自说明性，但也明显增加语法噪声，不能保证项目中所有初始化都一致采用这种形式。向已有聚合增加成员时，把新成员追加到定义末尾最安全，可以降低旧位置初始化器发生偏移的风险。

### 使用初始化器列表赋值

结构体可以用初始化器列表整体赋值，执行逐成员赋值：

```cpp
Employee joe { 1, 32, 60000.0 };
joe = { joe.id, 33, 66000.0 };
```

希望保留的前置成员仍需提供当前值作为占位。C++20 的指定初始化器也能用于列表赋值，但未指定成员不会自动保留旧值，而会被赋予聚合初始化时应得到的默认值或值初始化值。

同类型结构体之间可以使用普通的复制初始化、直接初始化或直接列表初始化：

```cpp
Foo foo { 1, 2, 3 };
Foo x = foo;
Foo y(foo);
Foo z { foo };
```

这里是用同类型对象初始化新对象，不是把 `foo` 当成第一个成员的聚合位置初始化。这种形式常用于用返回同类型结构体的函数结果初始化对象。

## 13.9 默认成员初始化

结构体或类定义可以为非静态成员提供默认初始化值，这个值称为默认成员初始化器：

```cpp
struct Something
{
    int x;       // 没有默认初始化器
    int y {};    // 默认值初始化为 0
    int z { 2 }; // 默认初始化为 2
};
```

默认成员初始化器使对象即使没有对象级显式初始化器也能自初始化。类模板实参推导（CTAD）不能用于非静态成员初始化。

显式初始化值始终优先于默认成员初始化器。完整规则取决于对象是否提供初始化器列表：

| 对象定义方式 | 成员情况 | 结果 |
|---|---|---|
| 有初始化器列表 | 有对应的显式值 | 使用显式值 |
| 有初始化器列表 | 缺少显式值，但有默认成员初始化器 | 使用默认值 |
| 有初始化器列表 | 缺少显式值，也没有默认成员初始化器 | 值初始化 |
| 完全没有初始化器列表 | 有默认成员初始化器 | 使用默认值 |
| 完全没有初始化器列表 | 没有默认成员初始化器 | 保持未初始化 |

成员始终按照声明顺序初始化。应为每个成员提供默认值，可以使用 `{}` 或合理的明确值。例如分数的分子可默认为 `0`，分母默认为 `1`，使默认对象具有有效语义。

当所有成员都有默认初始化器时，`Fraction f;` 和 `Fraction f {};` 可能得到相同结果，但空花括号更安全：若遗漏某个成员的默认初始化器，该成员仍会被值初始化；这种写法也与其他类型的初始化保持一致。因此聚合对象应优先使用空花括号值初始化，而不是无花括号默认初始化。

类类型代码中仍常见无花括号默认初始化，一部分是历史原因，另一部分是某些非聚合类的默认初始化可能比值初始化更高效；这种差异与构造函数行为有关，不改变聚合的上述安全建议。

## 13.10 结构体的传递与返回

把相关数据组织为结构体后，函数只需接收一个对象，而不必维护庞大且顺序敏感的参数列表。以后增加结构体成员时，接收整个结构体的函数声明和调用通常不需要修改。

### 传递结构体

结构体通常按引用传递，一般使用常量左值引用来避免复制：

```cpp
void printEmployee(const Employee& employee)
{
    std::cout << employee.id << ' '
              << employee.age << ' '
              << employee.wage << '\n';
}
```

对象足够小且复制便宜时也可以按值传递；需要修改调用者对象时则使用适合修改语义的引用。

只使用一次的对象可以直接构造为临时对象：

```cpp
printEmployee(Employee { 14, 32, 24.15 }); // 显式写出类型，优先
printEmployee({ 15, 28, 18.27 });          // 从形参推断目标类型
```

省略类型名的第二种形式属于隐式转换，在只允许显式转换的上下文中不可用。显式写出类型能更清楚地表达要创建哪种临时对象，也不易被误解。

临时对象在表达式中的创建点构造和初始化，在所属完整表达式结束时销毁；对临时对象求值会产生右值。作为函数实参时，它可以绑定到按值或常量引用形参，不能绑定到非常量左值引用，也不能作为要求命名对象地址的地址参数。

### 返回结构体

函数可以把多个相关结果放入一个结构体并作为单一返回值返回。函数内部创建的结构体对象通常按值返回，避免把指向局部对象的悬空引用交给调用者。

```cpp
struct Point3d
{
    double x { 0.0 };
    double y { 0.0 };
    double z { 0.0 };
};

Point3d getZeroPoint()
{
    return Point3d { 0.0, 0.0, 0.0 };
}
```

没有必要只为返回值创建一个没有说明价值的局部变量，可以直接返回临时对象。函数已经声明明确返回类型时，还可以省略返回表达式中的类型名：

```cpp
Point3d getZeroPoint()
{
    return { 0.0, 0.0, 0.0 }; // 到 Point3d 的隐式转换
}
```

所有成员都需要值初始化时，可以直接 `return {};`。结构体的数据成员、成员选择和默认成员初始化也是类与面向对象程序设计的基础。

## 13.11 结构体的其他事项

### 程序定义类型成员与嵌套类型

结构体或类的成员可以是其他程序定义类型。先在外层定义 `Employee`，再让 `Company` 包含一个 `Employee` 成员时，可以用嵌套初始化器列表初始化，多层成员用连续的 `.` 访问，例如 `company.CEO.wage`。

类型本身也可以定义在另一个类型内部：

```cpp
struct Company
{
    struct Employee
    {
        int id {};
        double wage {};
    };

    Employee CEO {};
};

Company::Employee employee {};
```

外部引用嵌套类型时使用 `Company::Employee`。

### 拥有型结构体

所有者管理自己的数据并控制其生命周期；查看者只引用其他对象的数据，不控制被查看对象何时改变或销毁。多数结构体和类应拥有所包含的数据。让每个成员都使用拥有型类型，是让结构体整体成为所有者的最简单方式。

查看者、指针或引用成员可能比被查看对象活得更久，从而成为悬空成员；访问悬空成员会产生未定义行为。因此字符串数据成员通常使用拥有数据的 `std::string`，而不是只查看数据的 `std::string_view`。

```cpp
struct Owner
{
    std::string name {};
};

struct Viewer
{
    std::string_view name {};
};
```

若函数返回临时 `std::string`，用它初始化 `Owner::name` 时，成员会保存自己的字符串数据；临时值在完整表达式末尾销毁后，成员仍然有效。用同一临时值初始化 `Viewer::name` 时，`string_view` 只查看临时字符串；临时值销毁后成员立即悬空。

### 结构体大小、对齐与填充

结构体大小至少足以容纳全部成员，但可能大于成员大小之和。可以用 `sizeof` 检查类型或对象的大小；编译器会为数据对齐和访问性能在成员之间或对象末尾插入填充字节。

例如，某个平台上 `short`、`int`、`double` 的大小合计可能是 14 字节，而包含它们的结构体是 16 字节。这只是特定实现结果，不是跨平台定律。成员集合相同但声明顺序不同，也可能产生显著不同的结构体大小。

编译器不能自行重排成员。需要减小填充时，通常可以按成员类型大小从大到小声明。但内存布局优化可能降低可读性或破坏逻辑分组，只有结构体尺寸确实重要时才值得优先处理。

## 13.12 通过引用和指针选择成员

结构体对象使用 `.` 选择成员。对象引用的行为类似对象本身，也使用 `.`：

```cpp
const Employee& employee { joe };
std::cout << employee.id;
```

指针保存对象地址，不能直接使用 `.`。可以先解引用再选择成员：

```cpp
Employee* ptr { &joe };
std::cout << (*ptr).id;
```

这里必须为 `*ptr` 加括号，使解引用先于成员选择。更清楚的写法是使用指针成员选择运算符 `->`，也称 `operator->` 或箭头运算符：

```cpp
std::cout << ptr->id;
```

`ptr->id` 严格等价于 `(*ptr).id`，但隐式完成解引用，减少括号和优先级错误。通过指针访问成员时应使用 `->`。

若通过 `->` 选出的成员本身又是指向类类型的指针，可以继续使用 `->`，例如 `trianglePtr->c->y`。访问链混合指针成员和普通对象成员时，每一步都根据当前子表达式的类型选择运算符：当前值是指针时使用 `->`，当前值是对象或引用时使用 `.`。

```cpp
std::cout << ptr->paw.claws;
```

这里 `ptr` 是指针，所以先用 `->` 得到普通对象成员 `paw`；`paw` 不是指针，所以再用 `.` 取得 `claws`。`.` 和 `->` 都按从左到右结合；写成 `(ptr->paw).claws` 的括号不是语法必需，但有时能改善可读性。多个箭头连续出现时，适当空格也可帮助区分成员和运算符。

## 13.13 类模板

函数模板解决“算法相同、类型不同”导致的函数重载重复。聚合类型也会遇到同一问题：类型定义不能像函数一样重载，同一作用域不能同时定义整数版和浮点版 `Pair`；函数重载也不能只依靠返回类型区分，因此两个仅返回类型不同的 `max(Pair)` 仍然冲突。为每种类型分别命名 `PairInt`、`PairDouble` 会增加命名负担和重复代码。

### 类模板定义与实例化

类模板是用于实例化类类型的模板定义。类类型包括结构体、类和联合体，因此类模板同样适用于三者。

```cpp
template <typename T>
struct Pair
{
    T first {};
    T second {};
};

Pair<int> p1 { 5, 6 };
Pair<double> p2 { 1.2, 3.4 };
```

模板参数声明以 `template` 开始，在尖括号内声明类型参数。类型参数可写成 `typename T` 或 `class T`，通常优先使用 `typename`。模板类型可以出现在成员类型以及类型定义中的其他合适位置。

首次需要 `Pair<int>` 时，编译器用模板生成 `T` 被 `int` 替换的类类型；首次需要 `Pair<double>` 时生成另一个类类型。二者是不同类型。以后再次使用同一具体类型时，编译器复用相同的实例化定义。可以用显式类模板特化写出概念上等价的生成结果，但类模板特化本身是更高级的机制。

### 类模板与函数模板组合

不同的 `Pair<T>` 可以由函数模板统一处理：

```cpp
template <typename T>
constexpr T max(Pair<T> pair)
{
    return pair.first < pair.second ? pair.second : pair.first;
}
```

函数模板必须声明 `T`，才能把它用于返回类型和 `Pair<T>` 形参。调用可以显式写成 `max<int>(p1)`，也可以让编译器从 `Pair<int>` 实参推导 `T`；能够推导时，通常优先省略显式模板实参。

类模板的成员不必全部依赖模板类型：

```cpp
template <typename T>
struct Foo
{
    T first {};
    int second {};
};
```

### 多个模板类型

多个模板参数用逗号分隔，实际类型可以相同或不同：

```cpp
template <typename T, typename U>
struct Pair
{
    T first {};
    U second {};
};

Pair<int, double> p1 { 1, 2.3 };
Pair<double, int> p2 { 4.5, 6 };
Pair<int, int> p3 { 7, 8 };
```

函数形参写成 `Pair<T, U>` 时，只有该类模板的实例或能转换成它的对象能够匹配。若函数模板形参只是普通类型参数 `T value`，它可以匹配任意类型；只有实例化函数体时，才要求该类型提供函数体使用的 `first`、`second` 等成员。

```cpp
template <typename T>
void print(T value)
{
    std::cout << '[' << value.first << ", " << value.second << ']';
}
```

把模板参数命名为 `Pair` 不会限制实参必须是 `Pair` 类。`template <typename Pair>` 中的 `Pair` 是一个能匹配任意类型的模板参数名，而且会遮蔽外层同名类模板。模板参数宜使用简单且不易遮蔽类型名的惯用名称，例如 `T`、`U`、`N`。

### `std::pair` 与多文件使用

标准库 `<utility>` 提供 `std::pair<T, U>`，成员名为 `first` 和 `second`。通用二元组应优先使用 `std::pair`，而不是重复实现自己的 `Pair`。

类模板和函数模板通常完整定义在头文件中，使每个需要实例化它们的翻译单元都能看到定义。模板定义和类型定义都可以在多个翻译单元中保持相同定义，因此把完整模板定义放在头文件中不违反单一定义规则。

## 参考来源

- [13.1 — Introduction to program-defined (user-defined) types](https://www.learncpp.com/cpp-tutorial/introduction-to-program-defined-user-defined-types/)
- [13.2 — Unscoped enumerations](https://www.learncpp.com/cpp-tutorial/unscoped-enumerations/)
- [13.3 — Unscoped enumerator integral conversions](https://www.learncpp.com/cpp-tutorial/unscoped-enumerator-integral-conversions/)
- [13.4 — Converting an enumeration to and from a string](https://www.learncpp.com/cpp-tutorial/converting-an-enumeration-to-and-from-a-string/)
- [13.5 — Introduction to overloading the I/O operators](https://www.learncpp.com/cpp-tutorial/introduction-to-overloading-the-i-o-operators/)
- [13.6 — Scoped enumerations (enum classes)](https://www.learncpp.com/cpp-tutorial/scoped-enumerations-enum-classes/)
- [13.7 — Introduction to structs, members, and member selection](https://www.learncpp.com/cpp-tutorial/introduction-to-structs-members-and-member-selection/)
- [13.8 — Struct aggregate initialization](https://www.learncpp.com/cpp-tutorial/struct-aggregate-initialization/)
- [13.9 — Default member initialization](https://www.learncpp.com/cpp-tutorial/default-member-initialization/)
- [13.10 — Passing and returning structs](https://www.learncpp.com/cpp-tutorial/passing-and-returning-structs/)
- [13.11 — Struct miscellany](https://www.learncpp.com/cpp-tutorial/struct-miscellany/)
- [13.12 — Member selection with pointers and references](https://www.learncpp.com/cpp-tutorial/member-selection-with-pointers-and-references/)
- [13.13 — Class templates](https://www.learncpp.com/cpp-tutorial/class-templates/)

