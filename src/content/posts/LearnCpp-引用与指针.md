---
title: LearnCpp 引用与指针
image: /assets/post-card/post-card-29-v20260819.jpg
cardImagePosition: center 40%
published: 2026-08-19
updated: 2026-08-19
description: LearnCpp 引用与指针笔记，介绍复合类型、值类别、左值引用、指针、const、按引用与按地址传递及返回。
tags:
  - C++
category:
  - LearnCpp
  - Tutorial
section: notes
author: nikonikoni
draft: false
---

# LearnCpp 引用与指针

## 12.1 复合数据类型简介

C++ 核心语言提供的基础数据类型适合表示单个简单值，但不能直接表达所有结构关系。

例如，一个分数需要分子和分母两个整数。若分别声明 `num1`、`den1`、`num2`、`den2`，每一对变量的关系只存在于命名、注释和使用方式中。输入分数的逻辑也会重复；若将输入封装成函数，又会遇到普通函数一次只能返回一个值的问题。

类似地，用 `id1`、`id2`、`id3` 等独立变量保存员工编号，在数量增加后无法扩展：声明、输出和传参都需要逐个处理。

**复合数据类型**（compound data type），也称为组合数据类型（composite data type），是根据其他已有类型定义的类型。它们增加了适合特定问题的属性和行为。

每种数据类型要么属于基础类型，要么属于复合类型。C++ 的复合类型包括：

- 函数；
- C 风格数组；
- 指针类型：对象指针、函数指针；
- 成员指针类型：数据成员指针、成员函数指针；
- 引用类型：左值引用、右值引用；
- 枚举类型：无作用域枚举、有作用域枚举；
- 类类型：结构体、类、联合体。

函数本身就是复合类型。例如：

```cpp
void doSomething(int x, double y)
{
}
```

该函数的类型是 `void(int, double)`，由其他类型构成，同时具有可调用等专有行为。

**术语**

结构体、类或联合体类型统称为**类类型**。`std::string` 也是类类型。

## 12.2 值类别：左值与右值

表达式可以产生值，也可以产生在表达式结束后仍然存在的副作用。除此之外，表达式还可以求值为对象或函数。

C++ 中的每个表达式都具有一个**类型**和一个**值类别**。这两个属性共同决定表达式如何求值以及能用于哪些位置。

### 表达式的类型

表达式的类型等于表达式求值所得的值、对象或函数的类型：

```cpp
auto v1{ 12 / 4 };   // int
auto v2{ 12.0 / 4 }; // double
```

编译器使用表达式类型判断表达式能否用于特定上下文，例如实参是否匹配形参。表达式类型必须能在编译期确定，否则类型检查和类型推导无法进行；表达式的值则可能在编译期确定，也可能到运行期才确定。

### 表达式的值类别

值类别描述表达式求值后得到的是某个值、函数，还是某种对象。

C++11 之前只有 `lvalue` 和 `rvalue` 两种值类别。C++11 为移动语义增加了 `glvalue`、`prvalue` 和 `xvalue`。以传统二分视角描述时，现代 C++ 的右值涵盖 `prvalue` 与 `xvalue`。

### 左值表达式

**左值**（lvalue，读作“ell-value”）最初解释为 left value，也常解释为 locator value。左值表达式求值为具有身份的对象、函数或位域。

“具有身份”表示该实体能够与其他相似实体区分，通常可以通过地址区分。具有身份的实体可以经标识符、引用或指针访问，并通常比单个表达式或语句存在得更久。

```cpp
int x{ 5 };
int y{ x }; // x 是左值表达式
```

左值分为：

- **可修改左值**：其值可以修改；
- **不可修改左值**：因 `const` 或 `constexpr` 等原因不能修改。

```cpp
int x{};
const double d{};

int y{ x };        // x：可修改左值
const double e{ d }; // d：不可修改左值
```

### 右值表达式

传统二分视角下，不是左值的表达式就是**右值**（rvalue，读作“arr-value”）。右值表达式求值为一个值，通常没有可辨认身份，必须立即使用，并只存在于创建它的表达式范围内。

常见右值包括：

- 大多数文字常量；
- 按值返回的函数调用结果；
- 按值返回结果的运算符表达式；
- 类型转换产生的临时值。

```cpp
int return5()
{
    return 5;
}

int x{ 5 };                   // 5 是右值
int y{ return5() };           // return5() 是右值
int z{ x + 1 };               // x + 1 是右值
int q{ static_cast<int>(2.5) }; // 转换结果是右值
```

C 风格字符串字面量是例外：它是左值。C 风格字符串属于数组，数组退化为指针需要一个具有地址的左值；C++ 为兼容 C 保留了这一行为。

**关键点**

左值表达式求值为可辨认的对象或函数；右值表达式求值为值。

### 值类别与运算符

除非另有说明，运算符通常期望右值操作数。赋值运算符要求左操作数是可修改左值：

```cpp
int x{};

x = 5; // 正确：x 是可修改左值，5 是右值
5 = x; // 错误：5 不是可修改左值
```

### 左值到右值转换

需要右值而提供左值时，左值会隐式进行**左值到右值转换**：对左值求值，取得对象中保存的值，产生右值。

```cpp
int x{ 1 };
int y{ 2 };

x = y; // y 转换为保存的值 2
```

左值可以隐式转换为右值，因此能用于期望右值的位置；右值不会隐式转换为左值。

同一表达式可以在不同上下文承担不同角色：

```cpp
x = x + 1;
```

左侧 `x` 保持左值身份；右侧 `x` 转换为右值供 `operator+` 使用；加法结果也是右值。

识别规则为：

- 求值为函数或可辨认对象，且通常在表达式结束后仍存在的是左值；
- 求值为文字值或不在表达式结束后继续存在的临时对象的是右值。

前置递增 `++x` 返回左值，后置递增 `x++` 返回右值。编译器也可以通过左值引用和右值引用重载判断表达式类别：

```cpp
template <typename T>
constexpr bool isLvalue(T&)
{
    return true;
}

template <typename T>
constexpr bool isLvalue(T&&)
{
    return false;
}
```

左值实参优先匹配 `T&`，右值实参优先匹配 `T&&`。

## 12.3 左值引用

**引用**是现有对象的别名。引用定义后，对引用执行的操作会作用于被引用对象，因此引用可用于读取或修改该对象。引用也可以绑定函数，但这种用法较少见。

现代 C++ 包含左值引用和右值引用。本节的引用指左值引用。

### 引用类型与引用变量

左值引用类型在类型说明符中使用单个 `&`：

```cpp
int        // 普通 int
int&       // int 的左值引用
double&    // double 的左值引用
const int& // const int 的左值引用
```

`int&` 是引用类型，`int` 是被引用类型。左值引用分为：

- 非 `const` 左值引用，常简称为左值引用；
- `const` 左值引用，也称常量左值引用或对常量的左值引用。

```cpp
int x{ 5 };
int& ref{ x };

std::cout << x << '\n';   // 5
std::cout << ref << '\n'; // 5
```

`ref` 与 `x` 可以作为同一对象使用。非 `const` 引用还能修改被引用对象：

```cpp
ref = 7; // x 变为 7
```

**最佳实践**

定义引用时把 `&` 放在类型名旁边，例如 `int& ref`。此处 `&` 表示“左值引用”，不是取地址运算符。

### 引用初始化与绑定

所有引用都必须初始化。引用初始化时，引用会**绑定**（bind）到对象或函数；该过程称为引用绑定，被引用的对象或函数称为**referent**。

```cpp
int& invalidRef; // 错误：引用必须初始化

int x{ 5 };
int& ref{ x };   // ref 绑定 x
```

非 `const` 左值引用只能绑定可修改左值：

```cpp
int x{ 5 };
int& ref{ x };          // 正确

const int y{ 5 };
int& invalid1{ y };     // 错误：不可修改左值
int& invalid2{ 0 };     // 错误：右值
```

若允许非 `const` 引用绑定常量或右值，就可能通过引用修改本不允许修改的对象。C++ 也禁止 `void` 的左值引用。

引用类型与被引用对象类型之间的 `&` 差异由引用初始化规则处理，不发生普通类型转换。引用通常只能绑定与被引用类型匹配的对象；继承相关情形是例外。

若类型不匹配，编译器尝试把初始化对象转换为被引用类型。转换结果是右值，而非 `const` 左值引用不能绑定右值，因此绑定失败：

```cpp
double d{ 6.0 };
int& invalid1{ d };     // 窄化转换且无法绑定
int x{ 5 };
double& invalid2{ x };  // 转换结果是右值
```

### 引用不能重新绑定

引用一旦初始化就不能改为引用另一个对象。给引用赋值会修改当前被引用对象：

```cpp
int x{ 5 };
int y{ 6 };
int& ref{ x };

ref = y; // 等价于 x = y，不会让 ref 改为引用 y
```

执行后 `x` 的值为 `6`，`ref` 仍绑定 `x`。

### 作用域、存储期与悬空引用

引用遵循普通变量的作用域和存储期规则。引用与被引用对象的生命周期通常相互独立：

- 引用可以先于被引用对象销毁，被引用对象不受影响；
- 被引用对象也可能先销毁，此时留下悬空引用。

引用指向的对象已销毁后，该引用称为**悬空引用**（dangling reference）。访问悬空引用会产生未定义行为。

### 引用不是对象

C++ 中的引用不是对象，不要求独立占用存储。编译器会尽可能用被引用对象替换引用；无法消除时，引用的实现才可能需要存储。因此“引用变量”严格来说并不准确。

引用不是对象带来以下结果：

- 不能在需要对象的地方使用引用；
- 不能创建指向引用的指针；
- 不能创建“引用的引用”。

```cpp
int var{};
int& ref1{ var };
int& ref2{ ref1 }; // ref1 求值为 var，因此 ref2 也直接绑定 var
```

`int&&` 并不是引用的引用。C++11 将该语法用于右值引用。若需要可重新绑定且本身是对象的引用式包装，可使用 `std::reference_wrapper`。

## 12.4 对 const 的左值引用

非 `const` 左值引用不能绑定 `const` 对象，因为这样会允许绕过常量限制。声明时在被引用类型上添加 `const`，可得到**对 const 的左值引用**：

```cpp
const int x{ 5 };
const int& ref{ x };

std::cout << ref << '\n'; // 可以读取
// ref = 6;               // 错误：不能通过 ref 修改
```

`const` 引用把经该引用访问的对象视为常量。

### 绑定可修改左值

`const` 引用也能绑定普通可修改左值：

```cpp
int x{ 5 };
const int& ref{ x };

// ref = 7; // 错误
x = 6;      // 正确
```

常量性只限制通过 `ref` 的访问；底层对象仍可通过 `x` 等非常量途径修改。

**最佳实践**

除非需要修改被引用对象，否则优先使用对 `const` 的左值引用。

### 绑定右值与不同类型的值

`const` 左值引用可以绑定右值。编译器创建临时对象，以右值初始化它，再把引用绑定该临时对象：

```cpp
const int& ref{ 5 };
```

`const` 引用也能绑定可隐式转换为被引用类型的不同类型值。编译器创建一个与引用类型匹配的临时对象：

```cpp
const double& r1{ 5 }; // 创建值为 5.0 的临时 double

char c{ 'a' };
const int& r2{ c };    // 创建临时 int，r2 绑定该临时对象
```

`r2` 引用的是临时 `int`，不是原始 `char`。因此打印 `r2` 会按整数输出字符编码。

**警告**

引用通常可视为原对象的别名，但发生类型转换时，引用实际绑定的是临时副本。之后修改原对象不会反映到引用中，反过来也一样。

### 临时对象的生命周期延长

临时对象通常在创建它的完整表达式结束时销毁。若 `const` 左值引用**直接绑定**临时对象，临时对象的生命周期会延长到与该引用一致：

```cpp
const int& ref{ 5 };

std::cout << ref << '\n'; // 安全
```

在代码块末尾，`ref` 与保存 `5` 的临时对象一同销毁。

生命周期延长只适用于直接绑定。临时对象经函数返回的引用间接传递后，不会再次延长。对于类类型右值，引用直接绑定其成员会延长整个临时类对象的生命周期。

**关键点**

非 `const` 左值引用只能绑定可修改左值；`const` 左值引用可以绑定可修改左值、不可修改左值和右值。

### constexpr 左值引用

`constexpr` 修饰引用时，表示该引用可以用于常量表达式。`constexpr` 引用只能绑定静态存储期对象，例如全局变量或静态局部变量，因为这些对象的地址可作为编译期常量。普通局部变量的地址要到函数调用时才确定，不能绑定 `constexpr` 引用。

```cpp
int g_x{ 5 };

int main()
{
    constexpr int& ref1{ g_x }; // 正确

    static int s_x{ 6 };
    constexpr int& ref2{ s_x }; // 正确

    int x{ 6 };
    // constexpr int& ref3{ x }; // 错误
}
```

引用 `const` 对象时，`constexpr` 与 `const` 分别作用于引用和被引用类型，两者都要写：

```cpp
static const int s_x{ 6 };
constexpr const int& ref{ s_x };
```

由于限制较多，`constexpr` 引用并不常用。

## 12.5 按左值引用传递

**按值传递**会把实参值复制到形参。基础类型通常复制成本低；`std::string` 等类类型的复制可能昂贵，而且函数结束后副本很快销毁。

**按引用传递**把形参声明为引用类型。调用时，引用形参直接绑定实参，不复制实参对象：

```cpp
void printValue(std::string& value)
{
    std::cout << value << '\n';
}

std::string text{ "Hello, world!" };
printValue(text);
```

绑定引用始终成本低。引用形参访问的是实际实参，而不是副本。对同一实参取地址时，值形参地址与实参不同，引用形参的地址与实参相同。

**关键点**

按引用传递可以在每次函数调用时避免复制实参。

### 修改实参

值形参只修改副本；非 `const` 引用形参能够修改实际实参：

```cpp
void addOne(int& value)
{
    ++value;
}

int x{ 5 };
addOne(x); // x 变为 6
```

修改会在函数返回后保留。

非 `const` 引用形参只能接受可修改左值：

```cpp
void printValue(int& value);

int x{ 5 };
printValue(x); // 正确

const int y{ 5 };
// printValue(y); // 错误：不可修改左值
// printValue(5); // 错误：右值
```

因此，非 `const` 引用传递主要用于函数确实需要修改调用者对象的场景。

## 12.6 按 const 左值引用传递

`const` 引用形参能绑定可修改左值、不可修改左值和右值，同时避免复制，并保证函数不能通过该形参修改被引用值：

```cpp
void printRef(const int& value)
{
    std::cout << value << '\n';
}

int x{ 5 };
const int y{ 5 };

printRef(x);
printRef(y);
printRef(5);
```

**最佳实践**

除非函数需要修改实参，否则优先按 `const` 引用而不是按非 `const` 引用传递。

### 不同类型实参产生临时对象

不同类型的实参若能转换为引用类型，编译器会先创建转换后的临时对象，再让引用形参绑定它：

```cpp
void printRef(const double& value);

printRef(5); // 创建临时 double
```

按值传递本来就预期复制，额外转换副本常能被优化。按引用传递通常正是为了避免复制，因此隐式转换产生的临时副本可能既意外又昂贵。

**警告**

按引用传递时，应确保实参类型与引用类型匹配，否则可能发生意外且昂贵的转换。

### 每个形参独立选择传递方式

同一函数的形参可以分别按值、按引用或按 `const` 引用传递：

```cpp
void foo(int a, int& b, const std::string& c)
{
}
```

### 按值还是按引用

基础经验法则：

- 基础类型和枚举类型复制成本低，通常按值传递；
- 类类型可能复制成本高，通常按 `const` 引用传递；
- 不确定时，按 `const` 引用更不容易产生意外行为。

常按值传递的类型包括：

- 无作用域和有作用域枚举；
- `std::string_view`、`std::span` 等视图与跨度；
- 迭代器、`std::reference_wrapper` 等模拟引用或非拥有指针的类型；
- 具有值语义且复制便宜的类，例如由基础类型组成的 `std::pair`、`std::optional`、`std::expected`。

应按引用传递的情形包括：

- 函数需要修改实参；
- 类型不可复制，例如 `std::ostream`；
- 复制会产生不希望的所有权语义，例如 `std::unique_ptr`、`std::shared_ptr`；
- 类型含虚函数或可能作为基类，按值传递会产生对象切片。

### 按值与按引用的成本模型

按值初始化形参的复制成本主要取决于：

1. 对象大小；
2. 构造时的额外工作，例如打开资源或分配动态内存。

引用绑定通常与复制基础类型一样快，但使用引用形参时，程序通常要先读取引用保存的位置，再访问内存中的被引用对象；值形参可直接访问寄存器或内存中的副本。

按值传递还排除了别名关系。引用或指针可能让多个名称访问同一对象，优化器必须保守；独立副本往往更容易优化。

因此：

- 对复制便宜的对象，复制与绑定成本接近，而值形参访问更直接、优化空间更大；
- 对复制昂贵的对象，复制成本占主导，引用更合适。

“复制便宜”没有绝对界线，会随编译器、架构和用途变化。实用规则是：对象不超过两个机器字且没有额外设置成本。机器字可用指针大小近似：

```cpp
#define IS_SMALL(T) (sizeof(T) <= 2 * sizeof(void*))
```

多数标准库类应假定有额外设置成本，除非明确知道没有。

### 字符串参数优先使用 string_view

多数情况下，字符串形参应按值使用 `std::string_view`，而不是使用 `const std::string&`：

```cpp
void process(std::string_view text);
```

`std::string_view` 能高效接受 `std::string`、`std::string_view` 和 C 风格字符串，也能无复制地表示子串。

| 实参类型 | `std::string_view` 值形参 | `const std::string&` 形参 |
|---|---|---|
| `std::string` | 低成本转换 | 低成本引用绑定 |
| `std::string_view` | 低成本复制 | 不能隐式转换；显式转为 `std::string` 成本高 |
| C 风格字符串或字面量 | 低成本转换 | 创建 `std::string` 临时对象，成本高 |

`std::string_view` 是普通小对象，访问自身成员不需要先经引用间接访问。创建子 `string_view` 也比复制子串到 `std::string` 便宜。

以下情况可选择 `const std::string&`：

- 使用 C++14 或更早标准，没有 `std::string_view`；
- 函数还要调用要求 C 风格字符串或 `std::string` 的接口。`std::string_view` 不保证以空字符结尾，也不能低成本转回 `std::string`。

## 12.7 指针简介

对象存储在内存地址中。变量名让编译器代为管理地址；引用也隐式访问被引用对象的地址。指针把地址本身作为一个可存储和操作的值暴露出来。

### 取地址与解引用

一元**取地址运算符** `&` 返回操作数的地址。多字节对象的地址是它占用的第一个字节的地址。地址通常以十六进制显示。

`&` 依上下文有三种含义：

- 类型名之后：左值引用，例如 `int& ref`；
- 一元表达式：取地址，例如 `&x`；
- 二元表达式：按位与，例如 `x & y`。

一元**解引用运算符** `*`，也称间接寻址运算符，根据地址取得该地址处的对象，并返回左值：

```cpp
int x{ 5 };

std::cout << &x << '\n';
std::cout << *(&x) << '\n'; // 5
```

取地址和解引用互为相反操作。解引用 `*` 是一元运算符，乘法 `*` 是二元运算符。

### 指针对象

**指针**是保存内存地址的对象，通常保存另一个对象的地址。普通指针也称原始指针或裸指针，以区别于智能指针。

指针类型使用 `*`：

```cpp
int* ptr; // 指向 int 的指针
```

声明中的 `*` 是指针类型语法，不是解引用运算符。

**最佳实践**

声明指针时把 `*` 放在类型名旁边。不要在一条语句中声明多个变量；若这样做，每个指针声明符都必须有 `*`：

```cpp
int* ptr1, value; // ptr1 是指针，value 是 int
int* ptr2, *ptr3; // 两者都是指针
```

### 指针初始化

普通局部指针默认不初始化。未初始化指针称为**野指针**（wild pointer），含有垃圾地址；解引用野指针产生未定义行为。

```cpp
int x{ 5 };

int* ptr1;        // 野指针
int* ptr2{};      // 空指针
int* ptr3{ &x };  // 指向 x
```

**最佳实践**

始终初始化指针。若没有有效对象可指向，就进行值初始化使其为空。

指针保存地址，因此初始化或赋值通常必须提供与指针类型匹配的对象地址：

```cpp
int i{ 5 };
double d{ 7.0 };

int* iPtr{ &i };
double* dPtr{ &d };
// int* bad{ &d }; // 类型不匹配
```

除空指针的特殊表示外，不能用整数地址文字初始化指针。C++ 不提供普通地址文字：

```cpp
// int* ptr{ 5 };          // 错误
// int* ptr{ 0x0012FF7C }; // 错误：这是整数文字
```

### 修改指针与修改所指对象

指针赋值有两种不同含义：

```cpp
int x{ 5 };
int y{ 6 };
int* ptr{ &x };

ptr = &y; // 修改 ptr 保存的地址，现在指向 y
*ptr = 7; // 修改 y 的值
```

使用 `ptr` 访问的是指针保存的地址；使用 `*ptr` 访问的是所指对象。

### 指针与引用的比较

指针与引用都能间接访问对象。指针需要显式取地址和解引用，引用则隐式完成这些操作。

| 属性 | 引用 | 指针 |
|---|---|---|
| 初始化 | 必须初始化 | 语法上可不初始化，但应初始化 |
| 是否为对象 | 否 | 是 |
| 能否改指向 | 不能重新绑定 | 可以改为保存其他地址 |
| 能否表示无对象 | 不能 | 可以为空 |
| 风险 | 除悬空外较安全 | 可能为空、野生或悬空 |

取地址运算符不是返回地址文字，而是返回指向操作数的指针。例如，`int x` 的 `&x` 类型是 `int*`。`typeid(...).name()` 的显示文本由编译器决定，不能依赖具体字符串格式。

### 指针大小

指针大小取决于目标可执行文件的地址宽度：32 位程序的指针通常是 4 字节，64 位程序通常是 8 字节。它与所指对象类型和大小无关，因为指针只保存地址。

### 悬空指针与无效指针值

对象销毁后，仍保存其旧地址的指针成为**悬空指针**。解引用悬空指针产生未定义行为。

C++ 标准对无效指针值区分处理：

- 解引用无效指针产生未定义行为；
- 使用无效指针值进行复制、递增等其他操作，行为由实现定义；
- 可以直接给该指针赋新值，例如 `nullptr`，因为赋值不需要读取旧的无效值。

野指针、悬空指针和空指针都不能解引用。

## 12.8 空指针

除了对象地址，指针还能保存**空值**。空值表示“没有值”；保存空值的指针不指向任何对象，称为**空指针**。

值初始化会产生空指针：

```cpp
int* ptr{};
```

显式空指针文字使用 `nullptr`：

```cpp
int* ptr{ nullptr };

int x{ 5 };
ptr = &x;
ptr = nullptr;
```

`nullptr` 可用于初始化、赋值，也可作为指针实参传给函数。

**最佳实践**

没有有效对象地址可用于初始化时，对指针进行值初始化。需要显式空指针文字时使用 `nullptr`。

### 解引用与检查

解引用空指针产生未定义行为，通常导致程序崩溃。

指针可以与 `nullptr` 显式比较，也可以隐式转换为布尔值：

- 空指针转换为 `false`；
- 非空指针转换为 `true`。

```cpp
if (ptr)
    std::cout << *ptr << '\n';
```

条件只能区分空指针和非空指针，不能判断非空指针是否悬空。非空不等于有效。

维持安全约束的实用方法是让每个指针只处于两种状态：

1. 指向有效对象；
2. 等于 `nullptr`。

对象销毁时，指向它的指针不会自动变成 `nullptr`。程序必须识别这些指针并重置，否则它们会悬空。

### 旧式空指针文字

旧代码可能使用 `0` 或 `NULL`：

- 整数文字 `0` 在指针上下文中被特殊定义为空指针常量，这是整数文字能直接赋给指针的特殊情形；
- 机器通常用地址 0 表示空指针，但标准不保证这一具体表示；编译器会把空指针常量转换为目标架构的空指针表示；
- `NULL` 是 `<cstddef>` 中继承自 C 的预处理宏，其具体定义不由 C++ 语言标准固定。

现代 C++ 应使用 `nullptr`，避免 `0` 和 `NULL`。

### 引用优先于指针

引用与指针都提供间接访问。指针额外支持改指向和表示“无对象”，但这些能力也引入空指针与悬空指针风险。引用必须在创建时绑定对象且不能重新绑定，因此通常更安全。

**最佳实践**

除非确实需要“可改指向”或“可为空”等指针能力，否则优先使用引用。

## 12.9 指针与 const

普通指针 `int*` 既能改为指向其他对象，也能通过解引用修改所指对象。`const` 可以分别约束所指对象和指针本身。

### 指向 const 值的指针

普通 `int*` 不能指向 `const int`，否则可能通过指针修改常量。指向常量的指针写作：

```cpp
const int x{ 5 };
const int* ptr{ &x };

// *ptr = 6; // 错误
```

`const` 位于 `*` 左侧，约束所指类型。指针本身仍可改为指向其他对象：

```cpp
const int y{ 6 };
ptr = &y;
```

指向 `const` 的指针也能指向普通对象，但经该指针访问时对象被视为常量；原对象仍能通过非常量标识符修改。

### const 指针

`const` 位于 `*` 右侧时，约束指针对象本身：

```cpp
int x{ 5 };
int* const ptr{ &x };

*ptr = 6; // 正确
// ptr = &y; // 错误：不能改地址
```

`const` 指针必须在定义时初始化。它不能改变保存的地址，但若所指类型非常量，仍可修改所指对象。

### 指向 const 值的 const 指针

两侧都使用 `const`：

```cpp
int value{ 5 };
const int* const ptr{ &value };
```

地址不能修改，所指值也不能通过该指针修改，只能读取。

四种组合如下：

| 声明 | 可改地址 | 可经指针改值 |
|---|---:|---:|
| `int* ptr` | 是 | 是 |
| `const int* ptr` | 是 | 否 |
| `int* const ptr` | 否 | 是 |
| `const int* const ptr` | 否 | 否 |

记忆规则：

- `const` 在 `*` 左侧，属于所指值；
- `const` 在 `*` 右侧，属于指针本身。

指向非常量的指针不能指向常量；指向常量的指针可以指向常量或非常量左值，但不能指向没有可取地址对象的右值。

## 12.10 按地址传递

**按地址传递**时，调用者提供对象地址。该地址以指针形式按值复制到指针形参，函数再解引用指针访问原对象：

```cpp
void printByAddress(const std::string* ptr)
{
    std::cout << *ptr << '\n';
}

std::string text{ "Hello, world!" };
printByAddress(&text);
```

若已有指针，也可直接传入：

```cpp
std::string* ptr{ &text };
printByAddress(ptr);
```

术语上：

- 使用 `&object` 作为实参时，对象按地址传递；
- 传入已经保存对象地址的指针变量时，对象仍按地址传递，而指针自身按值传递。

按地址传递只复制通常为 4 或 8 字节的指针，不复制所指对象，因此与按引用传递一样能够避免昂贵对象复制。

### 修改所指对象

指向非常量的指针形参可以修改实际实参：

```cpp
void changeValue(int* ptr)
{
    *ptr = 6;
}

int x{ 5 };
changeValue(&x);
```

只读函数应使用指向 `const` 的形参：

```cpp
void print(const int* ptr);
```

把指针形参本身声明为 `const` 指针通常价值很小：它只限制函数体内的局部指针副本，对调用者无影响，还会使真正重要的“所指对象是否可修改”更难辨认。

**最佳实践**

- 除非函数需要修改传入对象，否则使用指向 `const` 的指针形参。
- 除非存在明确理由，不要把函数形参声明为 `const` 指针。

### 空指针检查

指针形参可能为空，解引用前必须处理。若空值表示允许的特殊情况，可先处理否定分支并提前返回，避免重复检查和深层嵌套：

```cpp
void print(const int* ptr)
{
    if (!ptr)
        return;

    std::cout << *ptr << '\n';
}
```

若函数契约禁止空指针，可使用 `assert(ptr)` 记录前置条件；发布构建仍可保留必要的错误处理，避免断言关闭后解引用空指针。

### 优先按引用传递

按 `const` 引用具有按地址传递的主要优点，却没有误解引用空指针的风险。它还能接受左值和右值；按地址传递要求对象有地址，因此只能传左值。引用调用语法也不需要在调用点和函数体散布 `&` 与 `*`。

**最佳实践**

能按引用传递时使用引用；只有需要空值或其他指针语义时才按地址传递。

## 12.11 按地址传递（二）

### 可选实参

指针形参可以用 `nullptr` 表示“没有提供对象”，并可把默认实参设为 `nullptr`：

```cpp
void printIDNumber(const int* id = nullptr)
{
    if (id)
        std::cout << *id << '\n';
    else
        std::cout << "unknown\n";
}
```

许多情况下，函数重载是更好的替代方案：无参重载处理“没有值”，有参重载接受实际值。这样不需要防范空指针，还能接受文字常量和其他右值。

### 修改指针实参的指向

指针形参按值接收地址副本。给形参赋 `nullptr` 只修改副本，不会改变调用者的指针：

```cpp
void nullify(int* ptr)
{
    ptr = nullptr;
}
```

若函数要修改调用者指针本身，应按引用传递指针：

```cpp
void nullify(int*& ptr)
{
    ptr = nullptr;
}
```

`int*&` 是“对 `int*` 指针的引用”。`int&*` 不合法，因为引用不是对象，指针不能保存引用的地址。

### 0、NULL 与重载歧义

文字 `0` 既是整数，也能在指针上下文表示空指针。`NULL` 的宏定义可能是 `0`、`0L`、`((void*)0)` 或其他实现选择，因此重载决议可能出现意外：

```cpp
void print(int);
void print(int*);

print(0);       // 选择 print(int)
print(NULL);    // 可能选择整数重载、指针重载或产生歧义
print(nullptr); // 选择 print(int*)
```

`nullptr` 只匹配指针相关类型，消除了整数与指针重载之间的歧义。

### std::nullptr_t

`nullptr` 的类型是 `std::nullptr_t`，定义于 `<cstddef>`。该类型只能保存 `nullptr`。函数可用它只接受 `nullptr` 文字：

```cpp
void print(std::nullptr_t);
void print(int*);
```

`print(nullptr)` 优先精确匹配 `std::nullptr_t`。若 `int* ptr` 当前保存 `nullptr`，`print(ptr)` 仍匹配 `int*`，因为重载根据表达式类型而不是运行时保存的值选择。指针类型不会隐式转换为 `std::nullptr_t`。

### 实现层面的按值传递

引用在无法优化消除时通常由编译器用指针实现，因此按引用传递在底层近似按地址传递。按地址传递又是把地址值复制到形参。

从这种实现视角看，C++ 最终仍在按值传递：普通值形参复制对象值，地址形参复制地址值。按引用和按地址能够修改实参，是因为函数可以通过传入的地址间接访问原对象。

## 12.12 按引用返回与按地址返回

按值返回会把返回值交给调用者。类类型的复制可能昂贵；按引用返回让返回引用直接绑定现有对象，从而避免复制：

```cpp
std::string& returnByReference();
const std::string& returnByConstReference();
```

例如，返回静态局部常量的引用是安全的，因为该对象存在到程序结束：

```cpp
const std::string& getProgramName()
{
    static const std::string name{ "Calculator" };
    return name;
}
```

### 被返回对象必须继续存在

按引用返回的首要条件是：被引用对象必须比返回该引用的函数活得更久。返回普通局部变量的引用会在函数结束时立即悬空：

```cpp
const std::string& getProgramName()
{
    const std::string name{ "Calculator" };
    return name; // 错误：返回后 name 被销毁
}
```

使用该返回值产生未定义行为。现代编译器通常能警告或拒绝简单案例，但复杂路径未必能检测。

**警告**

不要按引用返回非静态局部变量或临时对象。

### 生命周期延长不能跨函数边界

`const` 引用直接绑定临时对象时可以延长临时对象生命周期，但将引用经函数返回后再绑定不会延长：

```cpp
const int& returnRef()
{
    return 5; // 返回指向临时对象的引用
}

const int& ref{ returnRef() }; // ref 悬空
```

把右值先绑定到 `const` 引用形参，再从函数原样返回，也属于间接绑定：

```cpp
const int& identity(const int& value)
{
    return value;
}

const int& ref{ identity(5) }; // 完整表达式结束后悬空
```

引用生命周期延长只作用于直接绑定，不能跨函数边界恢复。

### 避免返回非 const 静态局部变量的引用

多个返回引用可能指向同一个可变静态对象：

```cpp
const int& getNextId()
{
    static int id{ 0 };
    ++id;
    return id;
}

const int& id1{ getNextId() };
const int& id2{ getNextId() }; // id1 与 id2 都观察同一个 id
```

两者最终都读到 `2`。更隐蔽的情形是函数反复改写一个静态 `std::string` 并返回引用，多个形参会绑定同一字符串；后一次调用覆盖前一次结果。若改用 `std::string_view`，底层字符串改变还可能使先前视图失效。

这种静态状态也通常没有标准化的重置方式，只能设计额外接口或重启程序。

**最佳实践**

避免返回非 `const` 静态局部变量的引用。返回昂贵且只初始化一次的 `const` 静态局部对象的常量引用偶尔合理；谨慎返回 `const` 全局对象的常量引用也可用于封装只读访问。

### 普通变量接收引用返回值会复制

函数按引用返回，但调用者用普通非引用变量接收时，返回对象的值会复制到新变量：

```cpp
const int value{ getNextId() }; // value 保存副本
```

这能把后续变化隔离开，但不能修复已经悬空的返回引用：若引用在复制前已经悬空，读取它进行复制仍是未定义行为。

### 返回引用形参

传入函数的左值对象存在于调用者作用域，因此按引用传入的形参通常可以按引用返回：

```cpp
const std::string& firstAlphabetical(
    const std::string& a,
    const std::string& b)
{
    return (a < b) ? a : b;
}
```

这能避免两个形参副本和一个返回值副本。

右值传给 `const` 引用形参后，也可以在同一完整表达式中按 `const` 引用返回并立即用于初始化一个普通对象：

```cpp
const std::string& identity(const std::string& value)
{
    return value;
}

std::string result{ identity(std::string{ "Hello" }) };
```

右值会存活到创建它的完整表达式结束，因此复制 `result` 时仍有效。若改用引用变量接收，完整表达式结束后该引用会悬空，且函数返回不能触发生命周期延长。

### 返回非常量引用允许调用者修改对象

非常量引用返回值是可修改左值，调用者可以通过它修改原对象：

```cpp
int& max(int& x, int& y)
{
    return (x > y) ? x : y;
}

int a{ 5 };
int b{ 6 };
max(a, b) = 7; // 等价于 b = 7
```

接口是否返回非常量引用，应取决于是否有意授予调用者修改底层对象的权限。

### 按地址返回

按地址返回与按引用返回相似，但返回对象指针。所指对象同样必须在函数返回后继续存在，否则调用者得到悬空指针。

按地址返回的主要优点是可以用 `nullptr` 表示“没有对象”，例如查找失败。主要缺点是调用者必须在解引用前检查空指针，否则产生未定义行为。

**最佳实践**

除非必须用 `nullptr` 表示“没有对象”，否则优先按引用返回。若需要返回“没有值”或一个值，`std::optional` 常是更合适的表达方式。

## 参考来源

1. [12.1 — Introduction to compound data types](https://www.learncpp.com/cpp-tutorial/introduction-to-compound-data-types/)
2. [12.2 — Value categories (lvalues and rvalues)](https://www.learncpp.com/cpp-tutorial/value-categories-lvalues-and-rvalues/)
3. [12.3 — Lvalue references](https://www.learncpp.com/cpp-tutorial/lvalue-references/)
4. [12.4 — Lvalue references to const](https://www.learncpp.com/cpp-tutorial/lvalue-references-to-const/)
5. [12.5 — Pass by lvalue reference](https://www.learncpp.com/cpp-tutorial/pass-by-lvalue-reference/)
6. [12.6 — Pass by const lvalue reference](https://www.learncpp.com/cpp-tutorial/pass-by-const-lvalue-reference/)
7. [12.7 — Introduction to pointers](https://www.learncpp.com/cpp-tutorial/introduction-to-pointers/)
8. [12.8 — Null pointers](https://www.learncpp.com/cpp-tutorial/null-pointers/)
9. [12.9 — Pointers and const](https://www.learncpp.com/cpp-tutorial/pointers-and-const/)
10. [12.10 — Pass by address](https://www.learncpp.com/cpp-tutorial/pass-by-address/)
11. [12.11 — Pass by address (part 2)](https://www.learncpp.com/cpp-tutorial/pass-by-address-part-2/)
12. [12.12 — Return by reference and return by address](https://www.learncpp.com/cpp-tutorial/return-by-reference-and-return-by-address/)
