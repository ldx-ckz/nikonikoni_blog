---
title: LearnCpp 函数重载与函数模板
image: /assets/post-card/post-card-27-v20260819.jpg
cardImagePosition: center 40%
published: 2026-08-19
updated: 2026-08-19
description: LearnCpp 函数重载与函数模板笔记，介绍重载区分与决议、删除函数、默认实参、函数模板、实例化、实参推导、多类型模板及模板偏序。
tags:
  - C++
category:
  - LearnCpp
  - Tutorial
section: notes
author: nikonikoni
draft: false

---

# LearnCpp 函数重载与函数模板

## 11.1 函数重载简介

下面的函数只能正确处理整数：

```cpp
int add(int x, int y)
{
    return x + y;
}
```

浮点实参传给该函数时会转换为 `int`，小数部分随之丢失。为整数版和浮点版分别使用 `addInteger`、`addDouble` 等名称虽然可行，但函数名会随着类型和参数数量不断增加，调用者还必须记住每个名称。

函数重载允许同一作用域中的多个函数共享同一个名称，只要编译器能够区分它们。共享名称的每个函数称为一个重载：

```cpp
int add(int x, int y)
{
    return x + y;
}

double add(double x, double y)
{
    return x + y;
}
```

`add(1, 2)` 的实参类型为 `int`，因此调用 `add(int, int)`；`add(1.2, 3.4)` 的实参类型为 `double`，因此调用 `add(double, double)`。从同名函数中为一次调用选择具体函数的过程称为重载决议。

重载代码能够编译必须同时满足两个条件：

1. 每个同名函数都能与其他重载区分；
2. 每次函数调用都能解析到唯一的重载。

函数声明无法区分，或函数调用无法解析，都会产生编译错误。运算符也可以通过类似机制重载。

**关键点**

函数重载减少了表达同一操作所需的函数名。重载应当让接口更简单，而不是仅为了共享名称而合并语义无关的操作。

## 11.2 函数重载的区分规则

### 用于区分重载的属性

| 函数属性 | 是否用于区分 | 说明 |
|---|---|---|
| 参数数量 | 是 | `add(int, int)` 与 `add(int, int, int)` 不同 |
| 参数类型 | 是 | 参数类型及排列顺序构成区别 |
| 返回类型 | 否 | 不能仅凭返回类型形成重载 |

成员函数还可以通过函数级 `const`、`volatile` 和引用限定符区分。例如，参数列表相同的常量成员函数和非常量成员函数可以形成重载。

### 参数数量

```cpp
int add(int x, int y);
int add(int x, int y, int z);
```

调用提供两个实参时匹配第一个函数，提供三个实参时匹配第二个函数。

### 参数类型和顺序

```cpp
int add(int x, int y);
double add(double x, double y);
double add(int x, double y);
double add(double x, int y);
```

以上参数类型序列各不相同，因此构成四个重载。

类型别名不是新类型：

```cpp
using Age = int;
typedef int Height;

void print(int value);
void print(Age value);    // 错误：仍是 print(int)
void print(Height value); // 错误：仍是 print(int)
```

按值传递参数的顶层 `const` 也不参与区分：

```cpp
void print(int);
void print(const int); // 错误：不能与 print(int) 区分
```

省略号参数被视为独特的参数类型：

```cpp
void foo(int x, int y);
void foo(int x, ...);
```

`foo(4, 5)` 同时可能适用于两者，但 `foo(int, int)` 的匹配优于省略号版本。

### 返回类型

```cpp
int getRandomValue();
double getRandomValue(); // 错误：仅返回类型不同
```

表达式 `getRandomValue()` 没有提供可用于选择重载的实参信息。若返回类型参与区分，理解一次调用还必须分析返回值在整个表达式中的用法。C++ 因而根据调用中的实参确定重载，不把返回类型作为区分依据。需要表达不同返回语义时，应使用 `getRandomInt()` 和 `getRandomDouble()` 等不同名称。

### 函数签名

函数签名是函数头中参与函数区分的部分。这里包括函数名、参数数量、参数类型和函数级限定符，不包括返回类型。

### 名称修饰

编译器通常会根据参数数量和参数类型等信息修改编译后的函数名，使链接器能够区分源代码中的同名重载。例如，`int fcn()` 和 `int fcn(int)` 会得到不同的链接名称。名称修饰方式没有统一标准，不同编译器可以采用不同编码。

## 11.3 重载决议与歧义匹配

非重载函数只有一个潜在候选：它要么直接匹配，要么经过允许的转换后匹配，否则调用失败。重载函数可能有多个候选，因此编译器必须确定唯一的最佳匹配。

在每一级匹配中可能出现三种结果：

- 没有匹配：继续检查下一级；
- 恰好一个匹配：该函数成为最佳匹配，决议结束；
- 多个同级匹配：调用歧义，立即产生编译错误。

所有等级都没有匹配时，编译器报告找不到匹配函数。

### 第 1 级：精确匹配

编译器先检查实参类型与形参类型是否完全相同：

```cpp
void foo(int);
void foo(double);

foo(0);   // foo(int)
foo(3.4); // foo(double)
```

随后还会应用不改变值的平凡转换，包括左值到右值转换、限定转换，以及非引用到引用的绑定。这些转换仍按精确匹配计算：

```cpp
void foo(const int);
void foo(const double&);

int x{1};
double d{2.3};
foo(x); // int 到 const int
foo(d); // double 绑定到 const double&
```

平凡转换与直接类型相同处于同一等级，因此也可能产生歧义：

```cpp
void foo(int);
void foo(const int&);

int x{1};
foo(x); // 两个候选都是精确匹配
```

### 第 2 级：数值提升

没有精确匹配时，编译器尝试数值提升：

```cpp
void foo(int);
void foo(double);

foo('a');  // char 提升为 int
foo(true); // bool 提升为 int
foo(4.5f); // float 提升为 double
```

### 第 3 级：数值转换

没有提升匹配时，编译器尝试其他数值转换。例如，仅存在 `foo(double)` 时，`char` 实参可以数值转换为 `double`。数值提升优先于数值转换。

### 第 4 级：用户定义转换

类可以定义到其他类型的转换。类的构造函数也可以充当从其他类型到该类的用户定义转换。只有更高等级没有匹配时，编译器才考虑这类转换。

```cpp
class X
{
public:
    operator int() { return 0; }
};

void foo(int);
void foo(double);

X x;
foo(x); // 使用 X 到 int 的用户定义转换
```

一次用户定义转换之后还可以接标准提升或转换。例如，若 `X` 转换到 `char`，结果还可继续提升到 `int` 以匹配 `foo(int)`。

### 第 5 级：省略号

前面各级都没有匹配时，编译器才考虑含省略号参数的函数。

### 第 6 步：无匹配

省略号也无法匹配时，调用以“找不到匹配函数”的编译错误结束。

### 歧义匹配

```cpp
void foo(int);
void foo(double);

foo(5L); // long 到 int 和 long 到 double 都是数值转换
```

两个候选在同一数值转换等级匹配，任何一个都不比另一个更好，因此调用歧义。相同规则也适用于下面的调用：

```cpp
void foo(unsigned int);
void foo(float);

foo(0);       // int 可转换为 unsigned int 或 float
foo(3.14159); // double 可转换为 unsigned int 或 float
```

**关键点**

同一级出现多个匹配就会产生歧义。同一级中的候选不会仅因某个转换“看起来更自然”而自动胜出。

歧义可通过三种方式消除：

1. 增加与实际实参类型精确匹配的重载；
2. 使用 `static_cast` 把实参显式转换为目标形参类型；
3. 对字面量使用类型后缀，例如 `foo(0u)` 精确匹配 `foo(unsigned int)`。

### 多参数函数的匹配

多个实参分别参与匹配比较。某候选要成为最佳函数，必须满足：

- 每个实参的匹配都不差于其他候选；
- 至少有一个实参的匹配优于其他候选。

```cpp
void print(char, int);
void print(char, double);
void print(char, float);

print('x', 'a');
```

三个候选对第一个实参都是精确匹配。第二个实参 `'a'` 对 `int` 是提升，对 `double` 和 `float` 是转换，因此 `print(char, int)` 是唯一最佳匹配。若不存在一个“所有参数不更差且至少一个更好”的候选，调用就会歧义或不匹配。

## 11.4 删除函数

隐式提升可能产生语法合法但不符合接口语义的调用：

```cpp
void printInt(int x);

printInt(5);    // 输出 5
printInt('a');  // char 提升为 int，通常输出字符编码值
printInt(true); // bool 提升为 int，输出 1
```

不允许调用的精确类型可以声明为已删除函数：

```cpp
void printInt(int x);
void printInt(char) = delete;
void printInt(bool) = delete;
```

`printInt('a')` 精确匹配已删除的 `printInt(char)`，`printInt(true)` 精确匹配已删除的 `printInt(bool)`。选中已删除函数后，编译停止并报告错误。

已删除函数仍参加整个重载决议，而不是只参加精确匹配阶段：

```cpp
printInt(5.0); // 可能在 int、char、bool 候选之间形成歧义
```

即使 `printInt(int)` 是唯一未删除函数，编译器也不会先移除其他候选再决议。

**关键点**

`= delete` 表示“函数存在，但禁止调用”，不是“函数不存在”。

成员函数以及函数模板的特定特化也可以删除。若只允许参数类型精确等于目标类型，可以用已删除的函数模板拒绝所有其他类型：

```cpp
void printInt(int x);

template <typename T>
void printInt(T) = delete;
```

`int` 实参选择普通函数；其他类型更精确地匹配模板生成的函数，而该函数已删除，因此编译失败。

## 11.5 默认实参

默认实参是为形参提供的默认值：

```cpp
void print(int x, int y = 4);

print(1, 2); // y 使用显式实参 2
print(3);    // 按 print(3, 4) 处理
```

默认实参必须使用等号声明。圆括号和花括号初始化语法不能替代等号：

```cpp
void foo(int x = 5);  // 正确
void goo(int x(5));   // 错误
void boo(int x{5});   // 错误
```

编译器在调用点插入默认实参。`print(3)` 会被处理成参数数量完整的 `print(3, 4)`，随后按普通函数调用规则编译。

### 使用场景

函数需要一个合理的常用值，同时允许调用者覆盖该值时，默认实参可以简化调用：

```cpp
int rollDie(int sides = 6);
void openLogFile(std::string filename = "default.log");
```

带默认实参的形参有时称为“可选参数”，但该术语也用于地址参数和 `std::optional` 等其他机制，容易产生歧义。

为现有函数新增形参时，如果新形参没有默认值，所有旧调用都必须同步修改；给新形参提供默认值，可以保持既有调用继续有效，同时允许新调用显式传值。

### 多个默认实参

```cpp
void print(int x = 10, int y = 20, int z = 30);

print(1, 2, 3); // 1, 2, 3
print(1, 2);    // 1, 2, 30
print(1);       // 1, 20, 30
print();        // 10, 20, 30
```

截至 C++23，调用语法不能通过 `print(,,3)` 跳过左侧实参。由此得到三条规则：

1. 显式提供的实参必须位于最左侧；
2. 某个形参具有默认实参后，其右侧所有形参也必须有默认实参；
3. 多个形参都有默认实参时，最可能由调用者显式设置的形参应放在最左侧。

```cpp
void good(int x, int y = 20, int z = 30);
void bad(int x = 10, int y); // 错误
```

### 声明位置与可见性

同一翻译单元中，一个默认实参不能重复声明：

```cpp
void print(int x, int y = 4);
void print(int x, int y = 4) {} // 错误：重复声明默认实参
```

默认实参还必须在调用发生前可见。函数具有前向声明时，尤其当前向声明位于头文件中，应把默认实参放在声明处，在函数定义中省略：

```cpp
// foo.h
void print(int x, int y = 4);

// foo.cpp
void print(int x, int y)
{
    // ...
}
```

没有前向声明时，默认实参放在函数定义中。

### 默认实参与重载

带默认实参的函数可以重载。默认值不是函数签名的一部分：

```cpp
void print(int x);
void print(int x, int y = 10);
void print(int x, double y = 20.5);
```

三个声明的参数列表不同，因此能够共存。`print(1, 2)` 选择第二个，`print(1, 2.5)` 选择第三个；`print(1)` 同时适用于三个候选，因此产生歧义。

函数指针调用不使用默认实参。通过函数指针调用时必须提供完整实参；这一点也可用于绕过由默认实参造成的某些歧义。

## 11.6 函数模板

`max(int, int)` 与 `max(double, double)` 若拥有完全相同的函数体，逐个编写重载会重复实现，增加维护量和出错机会，也违反 DRY（不要重复自己）原则。调用者还可能使用模板作者编写时没有预见的新类型。

模板用一份定义描述一族相似函数。模板中的占位类型在模板定义时尚未确定，在模板使用时才由具体类型替换。它与模具或施工蓝图类似：结构只定义一次，实际材料或类型在使用时确定。由此生成的函数可以使用模板编写时尚不存在的类型。

函数模板是一种用于生成一个或多个具体函数的类函数定义。原始定义称为主模板，由主模板生成的函数称为实例化函数。

### 模板参数的种类

C++ 支持三类模板参数：

- 类型模板参数：代表一个类型；
- 非类型模板参数：代表一个常量表达式值；
- 模板模板参数：代表另一个模板。

这里主要使用类型模板参数。

### 定义函数模板

具体的整数函数为：

```cpp
int max(int x, int y)
{
    return (x < y) ? y : x;
}
```

直接把 `int` 换成 `T` 仍不是完整模板，因为 `T` 尚未声明：

```cpp
T max(T x, T y) // 错误：T 未定义
{
    return (x < y) ? y : x;
}
```

模板参数声明定义 `T` 为类型占位符：

```cpp
template <typename T>
T max(T x, T y)
{
    return (x < y) ? y : x;
}
```

`template` 表示模板定义，尖括号中列出模板参数。类型模板参数可使用 `typename` 或 `class` 声明，两者在此处含义相同。`typename` 更明确地表示参数可以被任何类型替换，而不仅是类类型。

模板参数声明的作用域只覆盖紧随其后的函数模板或类模板，因此每个模板都需要自己的参数声明。

### 模板参数命名与隐式要求

用途简单、表示“任意合理类型”的类型参数通常使用 `T`、`U`、`V` 等单个大写字母。参数具有特定职责或要求时，应使用 `Allocator`、`TAllocator` 等描述性名称。

```cpp
template<class T, class Compare>
const T& max(const T& a, const T& b, Compare comp);
```

`T` 表示两个被比较值的类型，`Compare` 表示比较器类型。基础版 `max<T>` 要求 `T` 支持 `<` 比较；`int`、`double` 和 `char` 可以满足这一要求，`nullptr` 则不能。模板实例化后，编译器会把模板参数替换为模板实参，再编译得到的具体函数。模板参数必须满足哪些要求，由函数体对该类型执行的操作隐式决定。要求不明显时，应查阅模板的技术文档；标准库文档会明确列出 `Compare` 等参数必须满足的条件。

**最佳实践**

简单类型参数使用 `T`、`U`、`V`；具有非显然用途或特定要求的参数使用描述性名称。

## 11.7 函数模板实例化

函数模板本身不是直接编译和执行的函数。它的作用是生成随后被编译和执行的具体函数。

### 显式指定模板实参

```cpp
template <typename T>
T max(T x, T y)
{
    return (x < y) ? y : x;
}

max<int>(1, 2);
```

尖括号中的 `int` 是模板实参。编译器发现 `max<int>(int, int)` 尚不存在时，会复制主模板并用 `int` 替换 `T`，生成具体函数。这个过程称为函数模板实例化；由函数调用触发时称为隐式实例化。

生成的函数在技术上称为特化，日常表述中也常称为函数实例。生成它的原始模板称为主模板。“特化”一词也经常专指显式特化，即显式编写某组模板实参对应的实现。

每个翻译单元中，同一函数实例只在首次需要时实例化，后续调用使用已经生成的函数。没有被调用的模板不会在该翻译单元中实例化。不同模板实参会生成不同函数，例如 `max<int>` 和 `max<double>`。

显式指定 `max<double>(1, 2)` 后，形参类型已经确定为 `double`，两个 `int` 实参可以按普通调用规则隐式转换为 `double`。

### 模板实参推导

实参类型已经能说明所需模板类型时，可以让编译器推导：

```cpp
max<int>(1, 2); // 显式指定 T
max<>(1, 2);    // 推导 T，只考虑模板候选
max(1, 2);      // 推导 T，同时考虑模板和非模板候选
```

后两种写法都可推导出 `T=int` 并实例化 `max<int>(int, int)`。空尖括号把候选限制为函数模板；没有尖括号的普通调用语法同时考虑同名非模板函数。

模板实例和非模板函数同样可行时，普通调用语法优先选择非模板函数。具体类型的非模板函数可能提供比通用模板更专门的行为：

```cpp
template <typename T>
void print(T x)
{
    std::cout << x;
}

void print(bool x)
{
    std::cout << std::boolalpha << x;
}
```

`print<bool>(true)` 和 `print<>(true)` 调用模板实例，通常输出 `1`；`print(true)` 选择非模板 `print(bool)`，输出 `true`。

**最佳实践**

调用模板生成的函数时优先使用普通调用语法；只有需要模板版本优先于同样匹配的非模板函数时，才显式写模板实参或空尖括号。

### 模板形参与普通形参可以混用

```cpp
template <typename T>
int someFcn(T, double)
{
    return 5;
}
```

第一个形参的类型由 `T` 决定，第二个形参固定为 `double`，返回类型固定为 `int`。`someFcn(1.2f, 3.4f)` 推导 `T=float`，第二个 `float` 实参再提升为 `double`。

### 实例化可能无法编译

```cpp
template <typename T>
T addOne(T x)
{
    return x + 1;
}
```

`addOne(1)` 和 `addOne(2.3)` 可以实例化，因为相应类型支持 `x + 1`。`addOne(std::string{"Hello"})` 会尝试生成 `addOne<std::string>`，但 `std::string + int` 不合法，因此实例化失败。

### 语法正确不等于语义正确

字符串字面量调用 `addOne("Hello, world!")` 可能编译成功。字符串字面量在该表达式中退化为指针，`+ 1` 执行指针算术，结果从第二个字符开始，输出可能为 `ello, world!`。表达式在语法上合法，却不符合“加一”的通常语义。

**警告**

编译器只验证模板实例化后的表达式是否合法，不判断该操作是否符合业务语义。模板调用必须使用语义上合理的类型。

特定模板实参可以通过显式特化和 `= delete` 禁止：

```cpp
template <typename T>
T addOne(T x)
{
    return x + 1;
}

template <>
const char* addOne(const char*) = delete;
```

字符串字面量匹配 `const char*` 特化，因此调用在编译期被拒绝。

### 默认实参与函数模板

函数模板可以为非模板形参提供默认实参，所有实例使用同一个默认值：

```cpp
template <typename T>
void print(T value, int times = 1)
{
    while (times--)
        std::cout << value;
}

print(5);      // 输出一次
print('a', 3); // 输出三次
```

### 每个实例拥有独立的静态局部变量

```cpp
template <typename T>
void printIDAndValue(T value)
{
    static int id{0};
    std::cout << ++id << ") " << value << '\n';
}
```

`printIDAndValue<int>` 和 `printIDAndValue<double>` 是不同函数，各自拥有独立的 `id`。两次整数调用后再进行一次 `double` 调用，编号会依次显示 `1`、`2`、`1`，而不是 `1`、`2`、`3`。

### 泛型编程与代价

模板类型可以由多种实际类型替换，因此也称为泛型类型。编写不依赖具体类型的模板称为泛型编程，其重点是算法逻辑和数据结构设计，而不是某个固定类型。

函数模板减少重复代码和维护错误，但每一组不同实参类型都可能生成并编译一个具体函数，造成代码膨胀和更长的编译时间。模板相关错误信息通常也比普通函数错误更长、更难阅读。

**最佳实践**

需要同一实现适配多种类型时使用函数模板；只有一种具体类型需求时，普通函数通常更直接。

## 11.8 具有多个模板类型的函数模板

下面的模板要求两个形参使用同一个 `T`：

```cpp
template <typename T>
T max(T x, T y)
{
    return (x < y) ? y : x;
}

max(2, 3.5); // 推导失败
```

第一个实参要求 `T=int`，第二个实参要求 `T=double`，单个 `T` 无法同时代表两种类型。模板实参推导不会先执行普通类型转换。这样设计一方面使推导规则保持简单，另一方面允许模板明确要求多个参数具有相同类型。

### 三种处理混合类型的方法

第一种方法是在调用点显式转换，使实参类型一致：

```cpp
max(static_cast<double>(2), 3.5);
```

该写法可以推导 `T=double`，但调用表达式较冗长。

第二种方法是显式指定模板实参：

```cpp
max<double>(2, 3.5);
```

`T` 已确定为 `double`，因此不再进行模板实参推导；`int` 实参随后按普通调用规则转换为 `double`。这种写法比在每个实参上转换更简洁。

第三种方法是使用独立的模板类型参数：

```cpp
template <typename T, typename U>
T max(T x, U y)
{
    return (x < y) ? y : x;
}
```

`max(2, 3.5)` 推导为 `max<int, double>(int, double)`。`T` 与 `U` 独立推导，可以是不同类型，也可以恰好相同。

### 混合类型的返回值

上一个版本的返回类型为 `T`。条件运算符会把 `int` 和 `double` 操作数转换为公共类型 `double`，得到 `3.5`；函数返回类型却是 `int`，于是结果窄化为 `3`。把返回类型改为 `U` 只会在实参顺序改变时重现同类问题。

返回类型可以从 `return` 表达式推导：

```cpp
template <typename T, typename U>
auto max(T x, U y)
{
    return (x < y) ? y : x;
}
```

`auto` 返回类型要求完整定义在调用前可见，因为编译器必须检查函数体才能确定返回类型。需要前向声明时，可以显式使用公共类型：

```cpp
#include <type_traits>

template <typename T, typename U>
auto max(T x, U y) -> std::common_type_t<T, U>;
```

### C++20 缩写函数模板

C++20 允许普通函数的形参类型写成 `auto`：

```cpp
auto max(auto x, auto y)
{
    return (x < y) ? y : x;
}
```

它等价于为两个形参分别声明独立的模板类型参数：

```cpp
template <typename T, typename U>
auto max(T x, U y)
{
    return (x < y) ? y : x;
}
```

每个 `auto` 独立推导，因此缩写形式适用于单个 `auto` 形参，或多个形参允许使用不同类型的情况。它不能简洁表达“两个形参必须具有相同类型”；这种约束仍应复用同一个 `T`。

### 函数模板重载与偏序

函数模板可以按模板参数数量、函数参数数量或函数参数类型重载：

```cpp
template <typename T>
auto add(T x, T y)
{
    return x + y;
}

template <typename T, typename U>
auto add(T x, U y)
{
    return x + y;
}

template <typename T, typename U, typename V>
auto add(T x, U y, V z)
{
    return x + y + z;
}
```

`add(1.2, 3.4)` 同时匹配前两个二参数模板。函数模板偏序规则会选择更受限制、更特化的模板；`add(T, T)` 要求两个参数类型相同，比 `add(T, U)` 更受限制，因此胜出。

多个函数模板都能匹配，而编译器无法确定哪个更受限制时，调用产生歧义。

## 参考来源

- [Learn C++ 11.1：Introduction to function overloading](https://www.learncpp.com/cpp-tutorial/introduction-to-function-overloading/)
- [Learn C++ 11.2：Function overload differentiation](https://www.learncpp.com/cpp-tutorial/function-overload-differentiation/)
- [Learn C++ 11.3：Function overload resolution and ambiguous matches](https://www.learncpp.com/cpp-tutorial/function-overload-resolution-and-ambiguous-matches/)
- [Learn C++ 11.4：Deleting functions](https://www.learncpp.com/cpp-tutorial/deleting-functions/)
- [Learn C++ 11.5：Default arguments](https://www.learncpp.com/cpp-tutorial/default-arguments/)
- [Learn C++ 11.6：Function templates](https://www.learncpp.com/cpp-tutorial/function-templates/)
- [Learn C++ 11.7：Function template instantiation](https://www.learncpp.com/cpp-tutorial/function-template-instantiation/)
- [Learn C++ 11.8：Function templates with multiple template types](https://www.learncpp.com/cpp-tutorial/function-templates-with-multiple-template-types/)

