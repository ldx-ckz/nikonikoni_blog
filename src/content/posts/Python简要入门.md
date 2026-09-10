---
title: Python简要入门
image: /assets/post-card/post-card-41-v20260908.jpg
cardImagePosition: center 50%
published: 2026-09-09
updated: 2026-09-10
description: 简要介绍 Python 基础、函数、迭代、模块、类、异常测试、IO 和虚拟环境。
tags:
  - Python
category:
  - LearnPy
  - Tutorial
section: notes
author: nikonikoni
draft: false
---

# Python简要入门


## 1. Python 基础

```python
# 缩进划分代码块，统一 4 个空格；冒号后开始代码块
score = 85
if score >= 60:
    print("pass")

# 名称区分大小写；= 赋值，== 比较值，is 比较身份
name, Name = "a", "b"
a = [1]
b = [1]
c = a
print(a == b, a is b, a is c)  # True False True
```

### 1.1 数据类型和变量

**基本类型与命名**

```python
integer = 10_000                 # int；下划线只提高可读性
hexadecimal = 0xff               # 255
big = 10 ** 100                  # 任意精度整数，受内存限制
decimal = 1.25                   # float
scientific = 2.5e-3              # 0.0025
text = "hello"                  # str，单引号也可以
enabled = True                   # bool：True / False
missing = None                   # 表示没有值
print(missing is None)           # True
print(None == 0, None == "")    # False False

item_2 = 2                      # 字母、数字、下划线；不能数字开头
数量 = 3                         # 合规的 Unicode 标识符也可以
PI = 3.14                       # 全大写只是常量约定，仍可重新赋值
# 2item = 2                     # SyntaxError
# class = 1                     # 不能使用关键字
```

**算术与浮点数**

```python
print(7 + 3, 7 - 3, 7 * 3)      # 10 4 21
print(9 / 3, 7 // 3, 7 % 3)     # 3.0 2 1
print(2 ** 3)                   # 8，乘方
print(-7 // 3, -7 % 3)          # -3 2：地板除向负无穷取整
print(7.0 // 3)                 # 2.0：结果不一定为 int
print(int(-1.9))                # -1：int 转换向零截断

import math
print(0.1 + 0.2 == 0.3)         # False，浮点运算有舍入误差
print(math.isclose(0.1 + 0.2, 0.3))  # True
print(float("inf"))            # inf；有限浮点值的范围有限
```

**字符串、转义和多行文本**

```python
print("I'm OK")
print('He said "OK"')
print("a\nb\tc\\d")         # \n 换行，\t 制表，\\ 反斜杠
raw = r"C:\notes\new"          # 原始字符串保留反斜杠
multiline = """line 1
line 2"""
# raw = r"C:\"                 # 错误：不能以奇数个反斜杠结束
```

**引用、重新绑定与共享修改**

```python
a = "old"
b = a
a = "new"
print(b)                        # old：重新绑定 a 不影响 b

a = [1]
b = a                           # 不复制列表
a.append(2)
print(b)                        # [1, 2]：修改的是共享对象
a = [9]
print(b)                        # [1, 2]
```

**真值与短路**

```python
print(bool(0), bool(""), bool([]), bool(None))  # 全为 False
print(bool("0"), bool("False"), bool([0]))    # 全为 True
print(True and False, True or False, not True)  # False True False
print("" or "default")         # default
print("hello" and 7)            # 7；and/or 返回操作数，不一定是 bool
print(False and (1 / 0))         # False；右侧不会执行
print(True or (1 / 0))           # True；右侧不会执行
```

### 1.2 字符串和编码

**码点、字节与长度**

```python
print(ord("A"), chr(65))        # 65 A；ASCII 定义 128 个字符
print(ord("中"), "\u4e2d")    # 20013 中；Unicode 为字符分配码点
print(type("abc"), type(b"abc"))  # str 与 bytes

text = "中文"
data = text.encode("utf-8")     # str -> bytes
print(data.decode("utf-8"))     # 中文；bytes -> str
print(len(text), len(data))      # 2 6：码点数与字节数
print(len("e\u0301"))          # 2：一个视觉字符可包含多个码点
print(b"ABC"[0])                # 65：bytes 索引取得整数

# UTF-8 每个 Unicode 标量值占 1–4 字节；ASCII 内容编码兼容
print([len(c.encode("utf-8")) for c in ["A", "é", "中", "😀"]])
# [1, 2, 3, 4]
```

**编码匹配与错误处理**

```python
data = "中文".encode("gbk")
print(data.decode("gbk"))       # 中文；按数据的真实编码解码
# data.decode("utf-8")          # UnicodeDecodeError
# "中文".encode("ascii")        # UnicodeEncodeError
print(b"A\xffB".decode("utf-8", errors="ignore"))   # AB，丢弃错误字节
print(b"A\xffB".decode("utf-8", errors="replace"))  # A�B
```

**源文件编码与解释器**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Python 3 源码默认 UTF-8；编码声明不会转换文件实际编码
# 第一行用于 Unix 类系统直接执行脚本时选择解释器
print("你好")
```

```bash
# 将上面的代码保存为 hello.py；Unix 类系统还需执行权限
chmod +x hello.py
./hello.py
# 显式指定解释器运行，不依赖脚本执行权限
python3 hello.py
```

**三种格式化写法**

```python
print("%s: %d, %.2f, %x" % ("item", 7, 2.718, 255))  # item: 7, 2.72, ff
print("[%2d] [%02d]" % (3, 3))   # [ 3] [03]：最小宽度与补零
print("%d%%" % 80)              # 80%
print("{0}: {1:.2f}".format("value", 2.718))  # value: 2.72
name, value = "value", 2.718
print(f"{name}: {value:.2f}")    # value: 2.72
print(f"{{result}}={2 + 3}")    # {result}=5；表达式与字面花括号
```

### 1.3 list 和 tuple

**列表的访问、增删与嵌套**

```python
items = ["a", "b", "a"]        # 有序、可重复、可修改
print(items[0], items[-1], len(items))  # a a 3
items[1] = "B"
items.append("c")
items.insert(1, "x")
print(items)                    # ['a', 'x', 'B', 'a', 'c']
print(items.pop())               # c，删除并返回末项
print(items.pop(1))              # x，删除并返回索引 1 的项
# items[99]                     # IndexError；负索引也可能越界

nested = [1, "two", [3, 4]]      # 允许混合类型与嵌套
print(len(nested), nested[2][1]) # 3 4；len 只数最外层
print(len([]))                  # 0
```

**元组不可变的是元素引用**

```python
empty = ()
single = (1,)                   # 单元素元组必须有逗号
number = (1)                    # 整数 1
t = (1, 2, 2)
print(t[0], t[-1], len(t))       # 1 2 3
# t[0] = 9                      # TypeError
# t.append(3)                   # AttributeError

t = (1, [2])
t[1].append(3)                  # 内部列表仍能修改
print(t)                        # (1, [2, 3])
# hash(t)                       # TypeError：含不可哈希元素
```

### 1.4 条件判断

```python
score = 85
if score >= 90:                 # 严格条件在前，只执行首个成立分支
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"
print(grade, 0 <= score <= 100)  # B True；支持连续比较

if "0":                        # 非空字符串为真
    print("nonempty")

# text = input("年龄：")         # input 返回 str，实际交互时取消注释
text = "18"
age = int(text)                 # 计算前转换
print(age >= 18)                # True
# int("eighteen")               # ValueError
# "18" >= 18                    # TypeError
```

### 1.5 模式匹配

```python
# Python 3.10+；首个模式与守卫均匹配时执行，不会贯穿后续分支
def classify(value):
    match value:
        case x if x < 0:        # 捕获 x，再检查守卫
            return "negative"
        case 0:
            return "zero"
        case 1 | 2:
            return "small"
        case _:                 # 无条件兜底必须放最后
            return "other"

print(classify(-1), classify(2), classify(8))  # negative small other

value = 7
match value:
    case captured:              # 裸名称是绑定变量，不是与旧值比较
        print(captured)         # 7

command = ["run", "main.py", "extra.py"]
match command:
    case ["run", first, *rest]: # 至少两个元素；rest 是列表
        print(first, rest)      # main.py ['extra.py']
    case ["stop"]:
        print("stopped")
    case _:
        print("unknown")

match "unknown":
    case "known":
        print("不会执行")       # 没有匹配且没有兜底：什么也不做
```

### 1.6 循环

**for、range 与 while**

```python
total = 0                       # 累加初值 0，不用 sum 作变量名
product = 1                     # 累乘初值 1
for n in range(1, 5):            # 包含起点、不含终点
    total += n
    product *= n
print(total, product)           # 10 24
print(list(range(3)))            # [0, 1, 2]
print(list(range(5, 0, -2)))      # [5, 3, 1]；步长可负，不能为 0

n = 3
while n > 0:
    print(n)                    # 3、2、1
    n -= 1                      # 推进状态，避免死循环；Ctrl+C 可中断
```

**break、continue、return、pass**

```python
n = 0
while n < 10:
    n += 1                      # 放在 continue 前，保证每轮都更新
    if n % 2 == 0:
        continue                # 跳过本轮剩余代码
    if n > 5:
        break                   # 退出当前循环
    print(n)                    # 1、3、5

for row in range(2):
    for col in range(3):
        break                   # 仅退出内层
    print(row)                  # 0、1

def first_positive(values):
    for value in values:
        if value > 0:
            return value        # 退出整个函数
    return None

def unfinished():
    pass                        # 占位，什么也不做

print(first_positive([-1, 3, 4]), unfinished())  # 3 None
```

### 1.7 dict 和 set

**字典：增删、查询与顺序**

```python
d = {"a": 1, "b": 2}
d["a"] = 9                     # 同键覆盖，不移动位置
d["c"] = 3
print(d["a"], "b" in d)        # 9 True；in 检查键
print(d.get("x"), d.get("x", -1))  # None -1，不插入 x
# d["x"]                       # KeyError
print(d.pop("b"))               # 2，删除并返回值
d["b"] = 20                    # 删除后重插排在末尾
print(list(d))                  # ['a', 'c', 'b']；Python 3.7+ 保证插入顺序

# 按位置取值用 list；按键频繁查询用 dict
values = [10, 20, 30]
print(values[1], values.index(20))  # 20 1；按值查找通常需遍历
print({"item": 20}["item"])    # 20；哈希表平均查找高效，但有空间开销
```

**集合与可哈希要求**

```python
print(type({}), type(set()))     # dict、set；空集合必须 set()
s = set([1, 1, 2])
s.add(3)
s.add(3)                        # 重复添加无效果
print(s == {1, 2, 3}, 2 in s)    # True True；不依赖集合显示顺序
s.remove(3)
s.discard(99)                   # 不存在也不报错
# s.remove(99)                  # KeyError
# s[0]                          # TypeError：集合无位置索引
print(s & {2, 3})               # {2}，交集
print(s | {2, 3})               # {1, 2, 3}，并集
print(s - {2, 3})               # {1}，差集

# 字典键、集合元素必须可哈希；相等对象须有相等哈希值
mapping = {"name": 1, 2: "two", (3, 4): "pair"}
print(hash((3, 4)) == hash((3, 4)))  # True
# mapping[[1, 2]] = 3           # TypeError：list 不可哈希
# {(1, [2])}                    # TypeError：tuple 中含 list
# {set(), {}}                   # TypeError：set、dict 不可哈希
```

**原地修改与返回新值**

```python
items = [3, 1, 2]
result = items.sort()
print(items, result)            # [1, 2, 3] None
s = "abc"
t = s.replace("a", "A")
print(s, t)                     # abc Abc；原字符串不变
```

## 2. 函数

```python
# 用一个接口复用逻辑，修改实现时无需改动所有调用处
def rectangle_area(width, height):
    return width * height

print(rectangle_area(2, 3), rectangle_area(4, 5))  # 6 20
```

### 2.1 调用函数

```python
f = abs                         # 保存函数对象
value = f(-4)                   # 调用并保存结果
print(value)                    # 4
# help(abs)                     # 查看函数签名与文档
# abs(1, 2)                     # TypeError：参数数量错误
# abs("a")                     # TypeError：类型不支持

print(min(3, 1), max([3, 1]), sum([3, 1]))  # 1 3 4
print(hex(255))                 # 0xff，返回字符串
print(int("12"), float("1.2"), str(12), bool([]))  # 12 1.2 12 False
print(int(1.9), int(-1.9))       # 1 -1
```

### 2.2 定义函数

```python
def absolute(x):
    """返回数字的绝对值。"""     # 首个字符串为 docstring
    if not isinstance(x, (int, float)):
        raise TypeError("需要数字")
    return x if x >= 0 else -x  # return 后不再执行函数体

print(absolute(-3), absolute.__doc__)
print(isinstance(True, int))    # True；若不接受 bool，需要单独排除
# absolute("3")                # TypeError

def pair():
    return 1, 2                 # 实际返回一个 tuple

x, y = pair()                   # 按位置拆包，数量须匹配
print((x, y))                   # (1, 2)

def display():
    print("hello")              # print 输出不等于返回值

def stop():
    return                      # 裸 return 返回 None

print(display(), stop())        # 先 hello，再 None None

import math
print(math.sqrt(9), math.sin(math.pi / 2), math.cos(0))  # 3.0 1.0 1.0
# 三角函数使用弧度；自定义函数的模块导入见第 5 节
```

### 2.3 函数的参数

**普通参数、默认值、仅关键字参数与收集**

```python
def power(x, n=2):
    return x ** n

print(power(3), power(3, 3), power(n=3, x=2))  # 9 27 8

def describe(a, b=2, *args, mode, flag=True, **kwargs):
    return a, b, args, mode, flag, kwargs

print(describe(1, 3, 5, 7, mode="fast", debug=True))
# (1, 3, (5, 7), 'fast', True, {'debug': True})
# args 收集多余位置参数 -> tuple；kwargs 收集多余关键字参数 -> dict

def connect(host, *, port=80, timeout):
    return host, port, timeout

print(connect("localhost", timeout=3))  # ('localhost', 80, 3)
# 裸 * 或 *args 后的参数只能按名称传入，必填项可排在默认项后
# connect("localhost", 80, 3)           # TypeError
# def bad(a=1, b): pass                 # SyntaxError：普通必填参数不能放此处
```

**调用时拆包与冲突**

```python
def add(a, b):
    return a + b

values = [2, 3]
options = {"a": 2, "b": 3}
print(add(*values), add(**options))      # 5 5
# 定义时 * / ** 收集；调用时 * / ** 拆包，之后仍须符合签名
# add(1, a=2, b=3)                     # TypeError：a 被赋值两次
# add(**{"a": 1, "b": 2, "c": 3})      # TypeError：不接受 c
# add(1)                               # TypeError：缺少 b
```

**默认容器只创建一次**

```python
def bad_append(x, items=[]):
    items.append(x)
    return items

print(bad_append(1))             # [1]
print(bad_append(2))             # [1, 2]：共享定义时创建的默认列表

def append_new(x, items=None):
    if items is None:
        items = []              # 每次省略参数时创建新列表
    items.append(x)
    return items

print(append_new(1), append_new(2))  # [1] [2]
```

**传参绑定引用；kwargs 只复制外层字典**

```python
def modify(items):
    items.append(2)              # 修改调用方共享对象
    items = [9]                 # 只重新绑定局部变量

items = [1]
modify(items)
print(items)                    # [1, 2]

def edit(**kwargs):
    kwargs["new"] = 1           # 仅修改新字典
    kwargs["items"].append(2)   # 嵌套列表仍共享

options = {"items": [1]}
edit(**options)
print(options)                  # {'items': [1, 2]}
```

### 2.4 递归函数

**终止条件、缩小规模与迭代替代**

```python
def factorial(n):
    if type(n) is not int:
        raise TypeError("需要整数")
    if n < 0:
        raise ValueError("需要非负数")
    if n <= 1:
        return 1                # 0! = 1! = 1，终止条件
    return n * factorial(n - 1) # 问题规模减小

def factorial_loop(n):
    result = 1
    for value in range(2, n + 1):  # 此处约定 n 为非负整数
        result *= value
    return result

print(factorial(5), factorial_loop(5))  # 120 120
# factorial(-1)                 # ValueError
# factorial(10000)              # 通常 RecursionError；每层调用保存状态
```

**尾递归与汉诺塔**

```python
def factorial_tail(n, result=1): # 约定 n 为非负整数
    if n <= 1:
        return result
    return factorial_tail(n - 1, result * n)
    # 直接返回递归结果；CPython 不消除尾调用，仍可能超出递归深度

def hanoi(n, source, helper, target):  # 约定 n >= 1
    if n == 1:
        print(source, "->", target)
        return
    hanoi(n - 1, source, target, helper)
    print(source, "->", target)
    hanoi(n - 1, helper, source, target)

print(factorial_tail(5))         # 120
hanoi(2, "A", "B", "C")       # A -> B；A -> C；B -> C
```

## 3. 高级特性

```python
values = list(range(6))
print(values[:3])                # 取子序列：[0, 1, 2]
print([x * x for x in values])   # 立即变换：[0, 1, 4, 9, 16, 25]
stream = (x * x for x in values) # 按需生产
print(next(stream))             # 0
```

### 3.1 切片

```python
a = [0, 1, 2, 3, 4]
# seq[start:stop:step]：含起点、不含终点
print(a[:3], a[-3:], a[1:4])     # [0, 1, 2] [2, 3, 4] [1, 2, 3]
print(a[::2], a[::-1])           # [0, 2, 4] [4, 3, 2, 1, 0]
print(a[:99], a[99:])            # [0, 1, 2, 3, 4] []：边界自动裁剪
print(a[:-1:-1])                 # []：显式 -1 与省略反向终点不同
# a[::0]                        # ValueError：步长不能为 0
print((1, 2, 3)[:2], "hello"[::2])  # (1, 2) hlo

a = [[1], [2]]
b = a[:]                        # list 浅拷贝，内部对象仍共享
print(a is b, a[0] is b[0])      # False True
b[0].append(9)
print(a)                        # [[1, 9], [2]]
```

### 3.2 迭代

```python
d = {"a": 1, "b": 2}
print(list(d), list(d.values()), list(d.items()))
# ['a', 'b'] [1, 2] [('a', 1), ('b', 2)]
for key, value in d.items():
    print(key, value)
for index, value in enumerate(["x", "y"], start=1):
    print(index, value)         # 1 x；2 y
for x, y in [(1, 2), (3, 4)]:
    print(x + y)               # 3；7
print(list("abc"))             # ['a', 'b', 'c']；可迭代不要求整数下标

from collections.abc import Iterable
print(isinstance([], Iterable), isinstance(3, Iterable))  # True False
# iter(3)                       # TypeError；实际是否可迭代以 iter 为准

# 筛选时建立新容器，避免遍历时直接增删原容器
positive = {k: v for k, v in d.items() if v > 1}
print(positive)                 # {'b': 2}

def extremes(values):
    if not values:
        return None, None
    low = high = values[0]      # 用真实元素初始化，不假定全为正数
    for value in values[1:]:
        low, high = min(low, value), max(high, value)
    return low, high

print(extremes([-3, -1]), extremes([]))  # (-3, -1) (None, None)
```

### 3.3 列表生成式

```python
print([x * x for x in range(4)])                  # [0, 1, 4, 9]
print([x * x for x in range(6) if x % 2 == 0])    # [0, 4, 16]
print([x if x >= 0 else -x for x in [-2, 3]])     # [2, 3]
# for 后的 if 是筛选，不带 else；for 前的 if...else 必须两种结果齐全

print([(x, y) for x in [1, 2] for y in [3, 4]])
# [(1, 3), (1, 4), (2, 3), (2, 4)]；前一个 for 是外层

values = ["Hi", 3, None, "PYTHON"]
print([s.lower() for s in values if isinstance(s, str)])  # ['hi', 'python']
print([f"{k}={v}" for k, v in {"a": 1, "b": 2}.items()])
# ['a=1', 'b=2']；推导式立即创建整个 list
```

### 3.4 生成器

**创建、暂停、恢复与耗尽**

```python
g = (x * x for x in range(3))
print(next(g), list(g), list(g)) # 0 [1, 4] []：只能向前消费

def steps():
    print("start")
    yield 1                     # 交出值并保存当前位置和局部状态
    yield 2
    return "done"

g = steps()                     # 此时不执行函数体，不输出 start
print(next(g))                  # 输出 start，再输出 1
print(next(g))                  # 2，从上次 yield 后继续
try:
    next(g)
except StopIteration as exc:
    print(exc.value)            # done；return 值存在异常中

print(list(steps()))            # 输出 start 与 [1, 2]；for/list 自动处理结束
print(next(steps()), next(steps()))  # 两个新生成器，均从第一项开始
```

**递推状态与无限流**

```python
def fibonacci(count):
    a, b = 0, 1
    for _ in range(count):
        yield b
        a, b = b, a + b         # 先计算整个右侧，再分别赋值

print(list(fibonacci(5)))        # [1, 1, 2, 3, 5]

def naturals():
    n = 0
    while True:
        yield n
        n += 1

for n in naturals():
    if n == 3:
        break                   # 无限生成器由消费端限制
    print(n)                    # 0、1、2
# 只保存当前递推状态，不保存完整序列；局部状态本身仍占内存
```

### 3.5 迭代器

```python
from collections.abc import Iterable, Iterator

a = [10, 20]
it = iter(a)                    # 不复制整个列表
g = (x for x in a)
print(isinstance(a, Iterable), isinstance(a, Iterator))  # True False
print(isinstance(it, Iterator), isinstance(g, Iterator)) # True True
print(iter(it) is it)            # True：迭代器的 __iter__ 返回自身
print(next(it), next(it))        # 10 20
print(next(it, "END"))           # END；默认值避免抛 StopIteration

# for 的核心流程：取得迭代器，反复取下一项，遇到结束异常退出
it = iter([1, 2])
while True:
    try:
        value = next(it)
    except StopIteration:
        break
    print(value)

# 生成器属于迭代器，迭代器属于可迭代对象；协议不承诺索引或长度
# it[0]                         # TypeError
# len(it)                       # TypeError
# 迭代器也不保证省内存，例如 iter(巨大的列表) 仍引用原列表
```

## 4. 函数式编程

```python
# 纯函数：相同输入得到相同结果，不修改外部状态；可使用局部变量
def square(x):
    result = x * x
    return result

print(square(3), square(3))      # 9 9

history = []
def record(x):
    history.append(x)           # 有外部副作用；Python 也支持这种写法
    return x

record(3)
print(history)                  # [3]
```

### 4.1 高阶函数

```python
# 接受函数或返回函数的函数是高阶函数
def combine(x, y, func):
    return func(x) + func(y)

f = abs
print(combine(-2, 3, f))         # 5；传 f 是传规则，f(x) 才执行

def make_adder(offset):
    return lambda x: x + offset

add_two = make_adder(2)
print(add_two(5))                # 7

# 不用 abs、list、sum 等内置名称命名普通变量
# abs = 3
# abs(-2)                       # TypeError：名称已不再指向函数
```

### 4.1.1 map / reduce

```python
from functools import reduce

mapped = map(str, [2, 4])        # 惰性变换，返回迭代器
print(list(mapped), list(mapped))  # ['2', '4'] []
print(list(map(lambda a, b: a + b, [1, 2, 3], [10, 20])))
# [11, 22]；多输入默认到最短输入结束

print(reduce(lambda a, b: a - b, [10, 3, 2]))  # 5，即 (10 - 3) - 2
print(reduce(lambda a, b: a * b, [2, 3, 4], 1))  # 24，初值为 1
print(reduce(lambda a, b: a * b, [], 1))         # 1，空输入返回初值
# reduce(lambda a, b: a + b, [])                # TypeError：空输入无初值
print(sum([1, 2, 3]))            # 求和直接用 sum，结果 6

digits = map(int, "246")
number = reduce(lambda acc, digit: acc * 10 + digit, digits, 0)
print(number)                   # 246：逐项转换，再从左向右累积
```

### 4.1.2 filter

```python
print(list(filter(lambda x: x % 2, range(6))))  # [1, 3, 5]
print(list(filter(None, [0, 1, "", "hi", None])))  # [1, 'hi']
# 谓词按真值筛选，不必严格返回 bool；结果是惰性迭代器

texts = ["", "  ", " A ", None, "B"]
print(list(filter(lambda s: s and s.strip(), texts)))  # [' A ', 'B']
# 保留的是原元素，不是 strip() 的返回值

def palindrome(n):
    return str(n) == str(n)[::-1]

print(list(filter(palindrome, [12, 121, 1331])))  # [121, 1331]
```

```python
# 素数筛：每次取最小候选，再过滤它的倍数
def odd_numbers():
    n = 3
    while True:
        yield n
        n += 2

def not_divisible(divisor):
    return lambda x: x % divisor != 0

def primes():
    yield 2
    candidates = odd_numbers()
    while True:
        prime = next(candidates)
        yield prime
        candidates = filter(not_divisible(prime), candidates)

result = []
for prime in primes():
    if prime >= 15:
        break                   # 不把无限流整体转成 list
    result.append(prime)
print(result)                   # [2, 3, 5, 7, 11, 13]
```

### 4.1.3 sorted

```python
values = [-3, 1, -2]
print(sorted(values))           # [-3, -2, 1]
print(sorted(values, key=abs))  # [1, -2, -3]；比较键，返回原元素
print(values)                   # [-3, 1, -2]；不改原列表
print(sorted(values, reverse=True))  # [1, -2, -3]

print(sorted(["b", "A", "Z"]))  # ['A', 'Z', 'b']；按 Unicode 码点字典序
print(sorted(["b", "A", "Z"], key=str.lower))  # ['A', 'b', 'Z']
# 默认排序不是汉语拼音排序

rows = [("A", 80), ("B", 90), ("C", 80)]
print(sorted(rows, key=lambda row: row[1], reverse=True))
# [('B', 90), ('A', 80), ('C', 80)]；同键保持原相对顺序，排序稳定

print(values.sort())            # None；list.sort 原地修改并返回 None
print(values)                   # [-3, -2, 1]
```

### 4.2 返回函数与闭包

**延后计算与绑定时机**

```python
def lazy_total(*values):
    def calculate():
        return sum(values)      # 引用外层变量，形成闭包
    return calculate            # 返回函数；calculate() 才是返回计算结果

f = lazy_total(1, 2, 3)
print(f())                      # 6；此时才求和
print(f is lazy_total(1, 2, 3)) # False；不同函数对象

def bad_functions():
    return [lambda: i * i for i in range(3)]

print([f() for f in bad_functions()])  # [4, 4, 4]；调用时读取共享 i
good = [lambda i=i: i * i for i in range(3)]
print([f() for f in good])       # [0, 1, 4]；默认值绑定本轮引用

def bind_square(value):         # 也可用工厂参数形成独立绑定
    return lambda: value * value

print([bind_square(i)() for i in range(3)])  # [0, 1, 4]

items = [1]
read = lambda items=items: items
items.append(2)
print(read())                   # [1, 2]；固定引用不是深拷贝
```

**nonlocal 与独立状态**

```python
def make_counter():
    count = 0
    def increment():
        nonlocal count          # 重新赋值外层函数变量前声明
        count += 1
        return count
    return increment

a, b = make_counter(), make_counter()
print(a(), a(), b())            # 1 2 1；两个闭包各有状态

def make_reader():
    value = 10
    def read():
        return value + 1        # 仅读取，不需要 nonlocal
    return read

print(make_reader()())          # 11
# 若在 read 中写 value += 1 而未声明 nonlocal，会触发 UnboundLocalError
```

### 4.3 匿名函数

```python
square = lambda x: x * x        # 单个表达式，自动返回结果
print(square(4))                # 16
print(list(map(lambda x: x + 1, [1, 2])))  # [2, 3]
print(sorted(["pear", "a"], key=lambda s: len(s)))  # ['a', 'pear']
choose = lambda x: "yes" if x else "no"
print(choose(0))                # no
# lambda x: return x            # SyntaxError，不写 return

def explainable(x):             # 多步骤、需文档或复杂分支时用 def
    """将输入加一后平方。"""
    adjusted = x + 1
    return adjusted * adjusted

print(explainable(2))           # 9
```

### 4.4 装饰器

**无参数装饰器：接收函数、返回包装器**

```python
from functools import wraps

def logged(func):
    @wraps(func)                # 保留 __name__、__doc__，设置 __wrapped__
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)  # 转发参数，保留原返回值
    return wrapper

@logged                         # 等价于定义后 multiply = logged(multiply)
def multiply(x, y=2):
    """Return the product."""
    return x * y

print(multiply(3, y=4))         # calling multiply；12
print(multiply.__name__)        # multiply
print(multiply.__doc__)         # Return the product.
print(multiply.__wrapped__(3))  # 6，直接调用原函数
```

**带参数装饰器、计时与异常时的收尾**

```python
from functools import wraps
from time import perf_counter

def timed(label):               # 第一层：装饰器配置
    def decorate(func):         # 第二层：接收原函数
        @wraps(func)
        def wrapper(*args, **kwargs):  # 第三层：每次调用执行
            start = perf_counter()
            try:
                return func(*args, **kwargs)
            finally:            # 原函数抛异常也记录结束时间
                elapsed_ms = (perf_counter() - start) * 1000
                print(f"{label}: {elapsed_ms:.3f} ms")
        return wrapper
    return decorate

@timed("sum")                  # 等价于 total = timed("sum")(total)
def total(values):
    return sum(values)

print(total([1, 2, 3]))          # 先输出实际耗时，再输出 6
```

**定义时装饰，调用时执行包装器；叠加由内向外**

```python
events = []
def tag(name):
    events.append("configure " + name)
    def decorate(func):
        events.append("decorate " + name)
        def wrapper():
            return name + func()
        return wrapper
    return decorate

@tag("A")
@tag("B")                      # greet = tag("A")(tag("B")(greet))
def greet():
    return "!"

print(events)  # ['configure A', 'configure B', 'decorate B', 'decorate A']
print(greet())                  # AB!；包装器在调用时才运行
```

### 4.5 偏函数

```python
from functools import partial

parse_binary = partial(int, base=2)  # 预绑定参数，不修改 int
print(parse_binary("101"))          # 5
print(parse_binary("101", base=10)) # 101；调用时可覆盖预绑定关键字
print(int("101"))                   # 101；原函数不变

at_least_ten = partial(max, 10)      # 普通预绑定位置参数放最前面
print(at_least_ten(3, 7))            # 10，等价于 max(10, 3, 7)
# 此处“偏函数”表示固定部分实参以简化调用，并非数学中的同名概念
```

## 5. 模块与包

```text
# 每个 .py 文件通常对应一个模块，目录组织成包
project/
├── app.py
└── tools/
    ├── __init__.py        # 普通包初始化文件，可为空
    ├── helpers.py         # 模块名 tools.helpers
    └── text/
        ├── __init__.py
        └── formatter.py   # 模块名 tools.text.formatter

# 特殊的命名空间包允许省略 __init__.py
# 模块名宜小写，避免 json.py、random.py 等与依赖同名造成遮蔽
```

### 5.1 使用模块

**导入、别名与文档属性**

```python
import math
import math as m
from math import sqrt

print(math.sqrt(9), m.sqrt(9), sqrt(9))  # 3.0 3.0 3.0
print(math.__name__)                    # math
print(math.__doc__ is not None)         # True
```

下面两个文件放在同一目录。

```python
# 文件：helpers.py
"""数字计算工具。"""              # 模块 __doc__

def _double(x):                 # _ 前缀约定内部使用，并非权限控制
    return x * 2

def calculate(x):               # 公开接口封装内部实现
    return _double(x) + 1

print("helpers loaded")         # 首次导入会执行顶层语句

if __name__ == "__main__":
    print(calculate(3))          # 仅作为入口运行时执行
```

```python
# 文件：app.py
import sys
import helpers
import helpers                  # 通常复用 sys.modules 缓存，不再打印 loaded
from helpers import calculate

print(calculate(3))              # 7
print(helpers.__name__)          # helpers
print(__name__)                  # 直接运行本文件时是 __main__
print(sys.argv)                 # 脚本名及字符串参数
# helpers._double(3)             # 技术上可访问，但不应依赖内部接口
# 模块级 __secret 也不自动隐藏；__name__ 等双端下划线名有特殊用途
```

```bash
python app.py hello 3
# sys.argv 为 ['app.py', 'hello', '3']；数字参数也是字符串
python helpers.py
# 输出 helpers loaded，再输出 7
```

### 5.2 第三方模块与搜索路径

```bash
# 使用目标解释器对应的 pip；下面是终端命令，不是 Python 语句
python -m pip install Pillow
python -m pip --version
python -c "from PIL import Image; print(Image.__name__)"
# 安装名 Pillow，导入名 PIL；两者未必相同

# Anaconda 是集成 Python 与数据科学工具的发行版，可用 conda 管理环境
# 安装 Anaconda 后，可在其提供的终端检查解释器与包
conda info --envs
python -c "import sys; print(sys.executable)"
```

```python
import sys
import os
import importlib.util

print(sys.executable)            # 当前解释器实际路径
print(sys.path)                  # 文件模块搜索路径，初始项受启动方式影响
print(os.environ.get("PATH"))   # Shell 查找可执行命令的路径
print(os.environ.get("PYTHONPATH"))  # 为 Python 添加模块搜索目录
print(importlib.util.find_spec("json").origin)  # 定位实际加载的模块

# 只影响当前进程；此处以字符串演示，不要求目录存在
sys.path.append("./my_modules")
sys.path.pop()                   # 撤销示例添加项
# import module_that_does_not_exist  # ModuleNotFoundError
# 已安装却不能导入：核对解释器、pip 路径和当前目录是否有同名文件
```

## 6. 面向对象编程

```python
# 类把属性和操作属性的方法放在一起；实例是具体对象
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def total(self, quantity):
        return self.price * quantity

pen = Product("pen", 3)
print(pen.name, pen.total(4))    # pen 12
```

### 6.1 类和实例

```python
class Item:                     # Python 3 中最终继承 object
    def __init__(self, name):    # 初始化，不返回非 None 值
        self.name = name

    def rename(self, name="untitled"):
        self.name = name        # self 按惯例表示当前实例

a, b = Item("A"), Item("B")
a.rename("new")                # 自动传入 self
Item.rename(b, "other")         # 对普通实例方法，显式传入实例
print(a.name, b.name)            # new other
a.extra = 1                     # 一般自定义实例可动态绑定属性
print(hasattr(b, "extra"))      # False，不自动给其他实例添加
print(isinstance(a, object))     # True

shared = []
a.data = shared
b.data = shared
a.data.append(1)
print(b.data)                   # [1]；实例也可显式共享可变数据
```

### 6.2 访问限制

```python
class Account:
    def __init__(self, balance):
        self.owner = "guest"    # 公共属性
        self._label = "main"    # 约定内部使用
        self.__balance = 0      # 名称改写为 _Account__balance
        self.set_balance(balance)

    def get_balance(self):
        return self.__balance

    def set_balance(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError("需要数字")
        if value < 0:
            raise ValueError("余额不能为负")
        self.__balance = value

account = Account(10)
account.set_balance(20)
print(account.get_balance())    # 20；通过接口校验后修改
# account.__balance             # AttributeError
print(account._Account__balance) # 20；名称改写不是安全隔离
account.__balance = 999         # 类外创建另一个属性
print(account.get_balance())    # 20；内部值不变
# account.set_balance(-1)       # ValueError
# __name__、__init__ 等双端下划线名有特殊用途，不是私有变量写法
```

### 6.3 继承、多态与鸭子类型

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "sound"

class Dog(Animal):
    def __init__(self, name):
        super().__init__(name)  # 重写初始化后，按需显式调用基类初始化

    def speak(self):
        return "woof"          # 重写同名方法

class Cat(Animal):
    def speak(self):
        return "meow"

def sound_of(obj):
    return obj.speak()          # 稳定接口，新增实现不必修改调用方

dog = Dog("D")
print(sound_of(dog), sound_of(Cat("C")))  # woof meow
print(isinstance(dog, Animal), isinstance(Animal("A"), Dog))  # True False

class Bell:                    # 没有继承 Animal，但提供所需行为
    def speak(self):
        return "ding"

print(sound_of(Bell()))         # ding；鸭子类型关注行为及返回约定
```

### 6.4 获取对象信息

```python
import types

class Base:
    pass
class Child(Base):
    def __init__(self):
        self.x = 3
    def power(self):
        return self.x ** 2

obj = Child()
print(type(obj) is Child, type(obj) is Base)  # True False：确切类型
print(isinstance(obj, Base), isinstance([], (list, tuple)))  # True True
print(isinstance(lambda: 1, types.FunctionType))  # True
print(types.LambdaType is types.FunctionType)    # True
print(isinstance(abs, types.BuiltinFunctionType)) # True
print(isinstance((x for x in []), types.GeneratorType))  # True

print("power" in dir(obj))      # True；dir 用于探索，不穷尽动态属性
print(hasattr(obj, "x"))        # True；可能触发属性查找逻辑
print(getattr(obj, "missing", 0))  # 0；无默认值且缺失时 AttributeError
setattr(obj, "x", 4)            # 对应 obj.x = 4
method = getattr(obj, "power")
print(method())                 # 16，获得绑定方法后调用
print(obj.x)                    # 4；名称已知时直接访问更清楚

class Sized:
    def __len__(self):
        return 3                # 特殊方法须返回非负整数

print(len(Sized()))             # 3
```

### 6.5 实例属性和类属性

```python
class Student:
    school = "School"          # 类属性，供实例共享访问
    count = 0
    shared = []

    def __init__(self, name):
        self.name = name        # 实例属性
        self.notes = []         # 每个实例独立的列表
        Student.count += 1      # 累计创建数，不等于仍存活实例数

a, b = Student("A"), Student("B")
print(Student.count, a.school, b.school)  # 2 School School
a.school = "Other"             # 遮蔽普通同名类属性
print(a.school, Student.school) # Other School
del a.school
print(a.school)                 # School：删除后重新找到类属性

a.shared.append(1)
print(b.shared)                 # [1]：修改共享列表
a.notes.append("math")
print(b.notes)                  # []：实例列表互不影响
```

## 7. 定制类

```python
# 特殊方法把类接入内置操作，而非只能显式调用普通方法
class Answer:
    def __call__(self):
        return 42

print(Answer()())                # 42；调用实例会使用 __call__
```

### 7.1 字符串表示：__str__ / __repr__

```python
class User:
    def __init__(self, name):
        self.name = name
    def __str__(self):
        return self.name        # 面向用户，必须返回 str
    def __repr__(self):
        return f"User({self.name!r})"  # 面向调试；!r 使用 repr

user = User("Ada")
print(str(user), repr(user))    # Ada User('Ada')
print([user])                   # [User('Ada')]；容器显示成员通常用 repr

class Label:
    def __str__(self):
        return "label"
    __repr__ = __str__           # 两种显示需求相同时复用

class OnlyRepr:
    def __repr__(self):
        return "fallback"

print(str(OnlyRepr()))          # fallback；没有 __str__ 时回退到 __repr__
```

### 7.2 迭代协议：__iter__ / __next__

```python
class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self             # 自身就是迭代器，共享当前进度
    def __next__(self):
        if self.current <= 0:
            raise StopIteration # 耗尽后持续保持耗尽
        value = self.current
        self.current -= 1
        return value

counter = Countdown(3)
print(next(counter))            # 3
print(list(counter), list(counter))  # [2, 1] []

class Bag:
    def __init__(self, values):
        self.values = list(values)
    def __iter__(self):
        return iter(self.values) # 每次新建迭代器，可重复遍历

bag = Bag([1, 2])
print(list(bag), list(bag))      # [1, 2] [1, 2]
```

### 7.3 索引、切片与增删

```python
class Series:
    def __init__(self, values):
        self.values = list(values)
    def __getitem__(self, key):
        return self.values[key] # 委托 list 处理负索引和 slice
    def __setitem__(self, key, value):
        self.values[key] = value
    def __delitem__(self, key):
        del self.values[key]
    def __len__(self):
        return len(self.values)

s = Series([1, 2, 3, 4])
print(s[-1], s[::2])            # 4 [1, 3]
s[1] = 20
del s[0]
print(s[:], len(s))             # [20, 3, 4] 3
# s[99]                         # IndexError；映射缺失键应是 KeyError
# s[::0]                        # ValueError；不能只实现正向切片就声称支持全部切片

key = slice(None, None, -1)     # s[::-1] 传入这样的 slice
print(key.start, key.stop, key.step)  # None None -1
print(key.indices(4))           # (3, -1, -1)，按长度规范化
print(list(range(*key.indices(4))))  # [3, 2, 1, 0]
```

### 7.4 动态属性：__getattr__

```python
class Profile:
    name = "guest"
    def __getattr__(self, name): # 仅在普通属性查找失败后调用
        if name == "score":
            return 100
        if name == "greeting":
            return lambda: "hello"  # 属性也可动态返回函数
        raise AttributeError(name)  # 不认识的名称不要默默返回 None

p = Profile()
print(p.name, p.score, p.greeting())  # guest 100 hello
print(hasattr(p, "typo"))       # False；依赖 AttributeError
# p.typo                        # AttributeError
```

### 7.5 可调用对象与链式访问

```python
class Adder:
    def __init__(self, amount):
        self.amount = amount
    def __call__(self, value):
        return self.amount + value

add_two = Adder(2)
print(add_two(3), callable(add_two))  # 5 True
print(callable(Adder), callable(abs), callable([]))  # True True False
# add_two()                     # TypeError：callable 不保证任意参数调用都成功

class PathChain:
    def __init__(self, path=""):
        self.path = path
    def __getattr__(self, name):
        return PathChain(f"{self.path}/{name}")
    def __call__(self, value):
        return PathChain(f"{self.path}/{value}")
    def __str__(self):
        return self.path

print(PathChain().users("ada").repos)  # /users/ada/repos
# 这里只构造路径，不发送网络请求；动态属性返回新对象实现链式调用
```

## 8. 错误、调试和测试

```python
def parse_number(text):
    return int(text)

try:
    parse_number("bad")         # 异常处理：应对失败
except ValueError:
    print("需要整数")

value = parse_number("3")
print("debug value:", value)    # 调试：观察状态
assert value == 3               # 验证当前结果；系统化测试见下文
```

### 8.1 错误处理

**try / except / else / finally**

```python
def divide(text):
    try:
        result = 10 / int(text)
        print("calculated")    # 出错后跳过 try 中剩余语句
    except ValueError:
        print("invalid integer")
    except ZeroDivisionError:
        print("zero divisor")
    else:
        print(result)           # try 正常执行到末尾时执行
    finally:
        print("finished")       # 正常、异常或提前返回时执行清理

divide("2")                     # calculated；5.0；finished
divide("0")                     # zero divisor；finished
divide("bad")                   # invalid integer；finished
# try 通过 return/break/continue 提前离开也不会进入 else
# finally 无法保证在进程被强制终止时执行；其中不宜 return，以免掩盖异常
```

**异常继承、匹配顺序与传播**

```python
print(issubclass(ValueError, Exception))       # True
print(issubclass(Exception, BaseException))    # True
print(issubclass(KeyboardInterrupt, Exception)) # False

try:
    b"\xff".decode("utf-8")
except UnicodeError:            # 子类在前；它也是 ValueError 的子类
    print("unicode error")
except ValueError:
    print("other value error")

try:
    int(None)
except (TypeError, ValueError): # 一次处理多个类型，不吞掉所有 BaseException
    print("invalid input")

def inner():
    return 1 / 0
def outer():
    return inner()

try:
    outer()                     # 异常跨调用层级传播，在能处理的位置捕获
except ZeroDivisionError:
    print("handled outside")
```

**主动抛出、记录、重新抛出与异常链**

```python
import logging

class ConfigError(ValueError):
    pass                        # 必要时派生自定义异常

def read_count(text):
    try:
        value = int(text)
    except ValueError as exc:
        raise ConfigError("count 必须是整数") from exc
    if value < 0:
        raise ConfigError("count 不能为负")
    return value

def process(text):
    try:
        return read_count(text)
    except ConfigError:
        logging.exception("读取配置失败")  # 记录当前异常及堆栈
        raise                   # 原样重抛，日志不等于已解决

try:
    process("abc")
except ConfigError as exc:
    print(type(exc.__cause__).__name__)  # ValueError，保留原始原因
```

**阅读 traceback**

```text
Traceback (most recent call last):
  File "app.py", line 6, in outer
    return inner()
  File "app.py", line 3, in inner
    return 1 / 0
ZeroDivisionError: division by zero

# 先看末行：异常类型与信息
# 再看最近出错行：inner 内的 1 / 0
# 向上追踪调用者：outer 如何调用到这里
```

### 8.2 调试

**临时输出与断言**

```python
# 文件：debug_demo.py
def divide(n):
    print("n =", n)             # 临时观察，定位后移除无用输出
    assert n != 0, "n 不能为零" # 断言内部假设，失败时 AssertionError
    return 10 / n

print(divide(2))                 # n = 2；5.0
# divide(0)                     # AssertionError
# 必要的用户输入校验应 if...raise，不能依赖可能被禁用的 assert
```

```bash
python -O debug_demo.py
# 大写字母 O，禁用 assert；不是数字 0
```

**logging 级别与输出**

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s", force=True)
logging.debug("不会显示")        # 低于 INFO 阈值
logging.info("n=%s", 3)
logging.warning("warning")
logging.error("error")
logging.critical("critical")
# DEBUG < INFO < WARNING < ERROR < CRITICAL；默认阈值通常为 WARNING
# 独立脚本写文件可改为：
# logging.basicConfig(filename="app.log", encoding="utf-8", level=logging.INFO)
```

**断点与单步调试**

```python
# 文件：app.py；交互调试示例，取消断点行注释后运行
import pdb

value = 2
# pdb.set_trace()                # 执行到这里进入 pdb
# breakpoint()                   # 默认进入 pdb，可通过配置改变
result = 10 / value
print(result)
# IDE 中也可在 result 行设置断点，查看 value 与调用栈，然后逐步执行
```

```bash
python -m pdb app.py
```

```text
# 在 (Pdb) 提示符后输入
l           # 查看源码
n           # 下一行，不进入被调用函数
s           # 进入函数
p value     # 查看表达式
c           # 继续执行
q           # 退出调试
```

### 8.3 单元测试

```python
# 文件：test_numbers.py
import unittest

def parse_nonnegative(text):
    value = int(text)
    if value < 0:
        raise ValueError("不能为负")
    return value

class TestNumbers(unittest.TestCase):
    def setUp(self):
        self.values = []        # 每个测试前准备，各用独立状态

    def tearDown(self):
        self.values.clear()     # setUp 成功后，即使测试失败也执行

    def test_normal(self):
        self.assertEqual(parse_nonnegative("12"), 12)
        self.assertTrue(isinstance(parse_nonnegative("1"), int))
        self.assertFalse(self.values)

    def test_boundary(self):
        self.assertEqual(parse_nonnegative("0"), 0)

    def test_empty(self):
        with self.assertRaises(ValueError):
            parse_nonnegative("")

    def test_invalid(self):
        for text in ("-1", "bad"):
            with self.assertRaises(ValueError):
                parse_nonnegative(text)

if __name__ == "__main__":
    unittest.main()

# test 开头的方法才会被默认识别；test_*.py 便于自动发现
# TDD：先写上述预期用例 -> 实现函数 -> 重构后再运行
# 用例应独立且简单；通过不证明无 bug，失败也需核对测试预期与环境
```

```bash
python test_numbers.py
python -m unittest test_numbers
python -m unittest test_numbers.TestNumbers.test_boundary
python -m unittest test_numbers -k invalid -v
python -m unittest discover
# 依次：直接运行、指定模块、指定方法、按名称筛选并显示详情、自动发现
```

### 8.4 文档测试

```python
# 文件：labels.py
def label(number):
    """给非负数生成标签；>>> 为输入，下一行为预期输出。

    >>> label(3)
    'item-3'
    >>> label(-1)
    Traceback (most recent call last):
        ...
    ValueError: 不能为负
    >>> print(label(12))  # doctest: +ELLIPSIS
    item-...
    """
    if number < 0:
        raise ValueError("不能为负")
    return f"item-{number}"

if __name__ == "__main__":
    import doctest
    doctest.testmod()

# 普通输出默认精确比对：引号、空白、换行均可能影响结果
# 异常中间的栈内容可省略；普通输出用 ... 通配需 ELLIPSIS
# 避免使用随机值、内存地址等不稳定预期输出
```

```bash
python labels.py                 # 默认通过时无输出
python -m doctest -v labels.py   # 显示各示例的测试结果
```

## 9. IO 编程

```python
from io import StringIO

stream = StringIO()
stream.write("hello")           # Output：写出
stream.seek(0)
text = stream.read()            # Input：读入
print(text)                     # hello
stream.close()                  # 用完关闭资源
```

```python
# 同步文件调用完成后才继续执行；文件对象不同于底层整数描述符
import tempfile

with tempfile.TemporaryFile(mode="w+", encoding="utf-8") as file:
    file.write("hello")
    print(isinstance(file.fileno(), int))  # True，fileno 得到整数描述符
    file.seek(0)
    print(file.read())           # hello；退出 with 自动关闭
```

```python
# 对比：把阻塞工作放到线程后，事件循环可在等待期间运行其他任务
import asyncio
from io import StringIO

async def main():
    with StringIO("hello") as stream:
        text = await asyncio.to_thread(stream.read)
        print(text)

# asyncio.run(main())            # 在普通脚本中运行；不保证所有任务都会更快
```

### 9.1 文件读写

**模式、编码与自动关闭**

```python
# 下面的模式会实际创建或修改当前目录的示例文件
with open("notes.txt", "w", encoding="utf-8") as f:
    print(f.write("第一行\n"))   # 4；w 不存在则创建，存在则立即截断
    f.flush()                   # 把 Python 缓冲交给下层

with open("notes.txt", "a", encoding="utf-8") as f:
    f.write("第二行\n")         # a 追加，不自动添加换行

with open("notes.txt", "r", encoding="utf-8") as f:
    print(f.read())             # 文本模式返回 str，按实际编码读取
print(f.closed)                 # True；块内抛异常也会关闭

with open("bytes.bin", "wb") as f:
    f.write(b"\x00\x01")       # 二进制写入 bytes，不传 encoding
with open("bytes.bin", "rb") as f:
    print(f.read())             # b'\x00\x01'

# ab 为二进制追加；正常 close 会刷新缓冲，不等于保证断电后已持久落盘
```

```python
import os
import tempfile

with tempfile.TemporaryDirectory() as directory:
    path = os.path.join(directory, "new.txt")
    with open(path, "x", encoding="utf-8") as f:
        f.write("abc")          # x 独占创建，已存在会 FileExistsError
    with open(path, "r+", encoding="utf-8") as f:
        f.write("X")            # + 增加读写能力；r+ 不截断
        f.seek(0)
        print(f.read())         # Xbc
    # open(path, "x")           # FileExistsError
    # open(path, "w+")          # 可读写，但仍会截断
```

**读取位置、长度单位与逐行处理**

```python
with open("reading.txt", "w", encoding="utf-8") as f:
    f.write("中文\n  hello  \n")

with open("reading.txt", encoding="utf-8") as f:
    print(f.read(1))            # 中；文本 size 计字符
    print(repr(f.readline()))   # '文\n'；从当前位置读到行尾
    print(f.readlines())        # ['  hello  \n']；剩余行组成 list
    print(repr(f.read()))       # ''：已到 EOF
    f.seek(0)
    print(f.read(2))            # 中文；显式回到开头

with open("reading.txt", "rb") as f:
    print(len(f.read(1)))        # 1；二进制 size 计字节
    f.read()
    print(f.read())             # b''：二进制 EOF

with open("reading.txt", encoding="utf-8") as f:
    for line in f:              # 大文本逐行处理，不一次加载全部
        print(repr(line.rstrip("\n")))  # 保留行首尾空格

print(repr("  hello  \n".strip()))      # 'hello'；strip 去掉两端所有空白
```

**文件与编码异常**

```python
import os
import tempfile

with tempfile.TemporaryDirectory() as directory:
    try:
        with open(os.path.join(directory, "missing.txt")) as f:
            f.read()
    except FileNotFoundError:
        print("file not found")

print(issubclass(FileNotFoundError, OSError))  # True
print(issubclass(PermissionError, OSError))   # True；权限不足

with open("encoding.bin", "wb") as f:
    f.write(b"A\xffB")
with open("encoding.bin", encoding="utf-8", errors="ignore") as f:
    print(f.read())             # AB，丢弃错误字节；默认会 UnicodeDecodeError
```

### 9.2 StringIO 和 BytesIO

```python
from io import StringIO, BytesIO

with StringIO() as f:
    print(f.write("hello"))     # 5，操作 str
    print(repr(f.read()))       # ''：写完游标位于末尾
    print(f.getvalue())         # hello：取完整内容，不受游标影响
    f.seek(0)
    print(f.read())             # hello

with StringIO("a\nb") as f:    # 可用初始文本创建
    print(repr(f.readline()))   # 'a\n'
    print(f.read())             # b

with BytesIO() as f:
    f.write("中文".encode("utf-8"))  # 只写 bytes
    print(len(f.getvalue()))    # 6
    f.seek(0)
    print(f.read().decode("utf-8"))  # 中文

def read_text(stream):          # 接口只要求满足 read() 行为和返回约定
    return stream.read().upper()

with StringIO("hello") as memory_file:
    print(read_text(memory_file))  # HELLO；内存流可替代真实文件做测试
```

### 9.3 文件与目录操作

**系统、环境变量与路径处理**

```python
import os

print(os.name)                  # Windows 常见 nt；Unix 类系统常见 posix
if hasattr(os, "uname"):
    print(os.uname())           # 平台相关，Windows 通常不支持
print(os.environ.get("PYTHON_REVIEW_OPTION", "default"))
print(os.getcwd())              # 当前工作目录
print(os.path.abspath("."))    # 规范化绝对路径

path = os.path.join("data", "report.txt")  # 使用平台分隔符
print(os.path.split(path))      # ('data', 'report.txt')
print(os.path.splitext(path))   # ('data/report', '.txt')，分隔符随平台
# 合并、拆分路径不要求文件存在，也不会创建目录
```

**创建、复制、重命名、查询和删除**

```python
import os
import shutil
import tempfile

with tempfile.TemporaryDirectory() as root:
    folder = os.path.join(root, "data")
    os.mkdir(folder)            # 创建单层目录，父目录须存在
    source = os.path.join(folder, "a.txt")
    with open(source, "w", encoding="utf-8") as f:
        f.write("abc")
    copied = os.path.join(folder, "b.txt")
    shutil.copyfile(source, copied)  # 复制内容，不保证全部元数据
    renamed = os.path.join(folder, "c.txt")
    os.rename(copied, renamed)  # 目标覆盖语义有平台差异

    print(sorted(os.listdir(folder)))  # ['a.txt', 'c.txt']；listdir 不保证顺序
    print(os.path.isfile(source), os.path.isdir(folder))  # True True
    stat = os.stat(source)
    print(stat.st_size)         # 3，字节大小；stat.st_mtime 为修改时间

    os.remove(source)           # 删除文件
    os.remove(renamed)
    os.rmdir(folder)            # 只能删除空目录
```

**按类型筛选与递归搜索**

```python
import os

root = "."
python_files = [
    name for name in os.listdir(root)
    if os.path.isfile(os.path.join(root, name))
    and os.path.splitext(name)[1] == ".py"
]
print(python_files)
# listdir 只返回直属条目名；检查其他目录时必须先与 root 拼接

for directory, subdirs, filenames in os.walk(root):
    for name in filenames:
        if "report" in name:
            path = os.path.join(directory, name)
            print(os.path.relpath(path, root))  # 相对路径
```

### 9.4 序列化

**pickle：Python 对象与字节表示**

```python
import pickle
from io import BytesIO

record = {"numbers": [1, 2], "point": (3, 4)}
data = pickle.dumps(record)     # 对象 -> bytes
restored = pickle.loads(data)   # bytes -> 对象，仅加载可信数据
print(type(data), restored == record, restored is record)  # bytes True False

with BytesIO() as f:            # 真实文件相应使用 wb / rb
    pickle.dump(record, f)      # 写二进制流
    f.seek(0)
    print(pickle.load(f))        # 从流恢复

# pickle.loads(untrusted_data)  # 不要执行：反序列化可能运行任意代码
# pickle.dumps((x for x in [])) # TypeError：生成器不可直接保存
# 自定义类恢复还依赖可导入的类定义、协议版本和环境兼容性
```

**JSON：类型映射、文本与文件**

```python
import json

record = {"name": "中文", "items": [1, 2.5], "ok": True, "extra": None}
text = json.dumps(record, ensure_ascii=False)
print(text)
# {"name": "中文", "items": [1, 2.5], "ok": true, "extra": null}
# dict/list/str/int或float/True或False/None -> object/array/string/number/boolean/null
print(type(text), json.loads(text) == record)  # str True

escaped = json.dumps(record)    # 默认 ensure_ascii=True，非 ASCII 字符转义
print(json.loads(escaped) == json.loads(text)) # True，含义相同
print(json.loads(json.dumps((1, 2))))         # [1, 2]；tuple 恢复为 list
print(json.loads(json.dumps({1: "one"})))      # {'1': 'one'}；键变为字符串
# json.dumps({1, 2})            # TypeError：set 默认不支持
# json.dumps(float("nan"), allow_nan=False)   # ValueError，拒绝非标准数值

with open("record.json", "w", encoding="utf-8") as f:
    json.dump(record, f, ensure_ascii=False, indent=2)  # 写文本流
with open("record.json", encoding="utf-8") as f:
    print(json.load(f) == record)  # True；文件编码由 open 指定
```

**自定义编码与恢复对象**

```python
import json

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

def encode(obj):
    if isinstance(obj, Point):
        return {"__type__": "Point", "x": obj.x, "y": obj.y}
    raise TypeError("不支持此类型")

def decode(data):
    if data.get("__type__") == "Point":
        return Point(data["x"], data["y"])
    return data                 # 普通字典保持原样

text = json.dumps({"point": Point(1, 2)}, default=encode)
result = json.loads(text, object_hook=decode)
print(result["point"].x, result["point"].y)  # 1 2
# default 处理默认不支持的类型，显式选择字段，不假定都有 __dict__
# object_hook 对每个 JSON object 都调用，包括嵌套对象，须识别类型标记
```

## 10. venv 虚拟环境

### 10.1 环境隔离与创建

```text
# 一个项目一套依赖；源码放在环境目录之外
project/
├── .venv/              # 解释器副本或链接、包目录、pyvenv.cfg
├── app.py              # 项目源码
└── requirements.txt    # 依赖记录

# 默认不使用系统第三方包；环境可重建，不把唯一源码存进 .venv
```

```powershell
# Windows PowerShell，用当前解释器创建环境
python -m venv .venv
# 用另一已安装解释器创建；venv 不负责下载 Python 版本
# & 'C:\Python312\python.exe' -m venv .venv312
```

```bash
# Linux / macOS
python3 -m venv .venv
# 不同项目可各自创建，不同环境可安装不同版本依赖
python3 -m venv .venv-other
```

### 10.2 激活、安装与退出

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
python -m pip install jinja2
python -c "import jinja2; print(jinja2.__version__)"
deactivate
# 激活调整当前 Shell 的 PATH 等变量，提示符通常显示环境名
# deactivate 退出环境，不删除包，也不修改整个系统的 Python
```

```bat
:: Windows cmd.exe，使用不同的激活脚本
.venv\Scripts\activate.bat
python -m pip install jinja2
deactivate
```

```bash
# Linux / macOS，bash 或 zsh
source .venv/bin/activate
python -m pip install jinja2
deactivate
```

### 10.3 不激活运行与确认解释器

```powershell
# Windows；激活脚本无法执行时也可直接指定环境解释器
.\.venv\Scripts\python.exe app.py
.\.venv\Scripts\python.exe -m pip --version
```

```bash
# Linux / macOS
.venv/bin/python app.py
.venv/bin/python -m pip --version
```

```python
import sys

print(sys.executable)            # 当前解释器路径
print(sys.prefix)               # 当前环境目录
print(sys.base_prefix)          # 基础 Python 目录
print(sys.prefix != sys.base_prefix)  # 在 venv 中通常为 True
```

### 10.4 依赖快照与重建

```bash
# 在已激活环境中保存依赖；这是当前环境快照，仍受平台与 Python 版本影响
python -m pip freeze > requirements.txt

# 新建环境并激活后安装
python -m pip install -r requirements.txt

# 停止相关程序并退出后，才考虑删除不再使用的环境目录
deactivate
# 环境通常重建而非跨机器复制；不要删除项目源码目录
```

## 参考来源


[廖雪峰 Python 教程](https://liaoxuefeng.com/books/python/introduction/index.html)：

- [5 Python基础](https://liaoxuefeng.com/books/python/basic/index.html)；[5.1 数据类型和变量](https://liaoxuefeng.com/books/python/basic/data-types/index.html)；[5.2 字符串和编码](https://liaoxuefeng.com/books/python/basic/string-encoding/index.html)；[5.3 使用list和tuple](https://liaoxuefeng.com/books/python/basic/list-tuple/index.html)；[5.4 条件判断](https://liaoxuefeng.com/books/python/basic/if/index.html)；[5.5 模式匹配](https://liaoxuefeng.com/books/python/basic/match/index.html)；[5.6 循环](https://liaoxuefeng.com/books/python/basic/loop/index.html)；[5.7 使用dict和set](https://liaoxuefeng.com/books/python/basic/dict-set/index.html)
- [6 函数](https://liaoxuefeng.com/books/python/function/index.html)；[6.1 调用函数](https://liaoxuefeng.com/books/python/function/call-function/index.html)；[6.2 定义函数](https://liaoxuefeng.com/books/python/function/define-function/index.html)；[6.3 函数的参数](https://liaoxuefeng.com/books/python/function/parameter/index.html)；[6.4 递归函数](https://liaoxuefeng.com/books/python/function/recursive-function/index.html)
- [7 高级特性](https://liaoxuefeng.com/books/python/advanced/index.html)；[7.1 切片](https://liaoxuefeng.com/books/python/advanced/slice/index.html)；[7.2 迭代](https://liaoxuefeng.com/books/python/advanced/iterate/index.html)；[7.3 列表生成式](https://liaoxuefeng.com/books/python/advanced/list-comprehension/index.html)；[7.4 生成器](https://liaoxuefeng.com/books/python/advanced/generator/index.html)；[7.5 迭代器](https://liaoxuefeng.com/books/python/advanced/iterator/index.html)
- [8 函数式编程](https://liaoxuefeng.com/books/python/functional/index.html)；[8.1 高阶函数](https://liaoxuefeng.com/books/python/functional/higher-order-function/index.html)；[8.1.1 map/reduce](https://liaoxuefeng.com/books/python/functional/higher-order-function/map-reduce/index.html)；[8.1.2 filter](https://liaoxuefeng.com/books/python/functional/higher-order-function/filter/index.html)；[8.1.3 sorted](https://liaoxuefeng.com/books/python/functional/higher-order-function/sorted/index.html)；[8.2 返回函数](https://liaoxuefeng.com/books/python/functional/return-function/index.html)；[8.3 匿名函数](https://liaoxuefeng.com/books/python/functional/lambda/index.html)；[8.4 装饰器](https://liaoxuefeng.com/books/python/functional/decorator/index.html)；[8.5 偏函数](https://liaoxuefeng.com/books/python/functional/partial/index.html)
- [9 模块](https://liaoxuefeng.com/books/python/module/index.html)；[9.1 使用模块](https://liaoxuefeng.com/books/python/module/use-module/index.html)；[9.2 安装第三方模块](https://liaoxuefeng.com/books/python/module/install/index.html)
- [10 面向对象编程](https://liaoxuefeng.com/books/python/oop/index.html)；[10.1 类和实例](https://liaoxuefeng.com/books/python/oop/class/index.html)；[10.2 访问限制](https://liaoxuefeng.com/books/python/oop/access/index.html)；[10.3 继承和多态](https://liaoxuefeng.com/books/python/oop/extend/index.html)；[10.4 获取对象信息](https://liaoxuefeng.com/books/python/oop/attr/index.html)；[10.5 实例属性和类属性](https://liaoxuefeng.com/books/python/oop/props/index.html)
- [11.4 定制类](https://liaoxuefeng.com/books/python/oop-adv/special-method/index.html)
- [12 错误、调试和测试](https://liaoxuefeng.com/books/python/error-debug-test/index.html)；[12.1 错误处理](https://liaoxuefeng.com/books/python/error-debug-test/error/index.html)；[12.2 调试](https://liaoxuefeng.com/books/python/error-debug-test/debug/index.html)；[12.3 单元测试](https://liaoxuefeng.com/books/python/error-debug-test/unit-test/index.html)；[12.4 文档测试](https://liaoxuefeng.com/books/python/error-debug-test/doctest/index.html)
- [13 IO编程](https://liaoxuefeng.com/books/python/io/index.html)；[13.1 文件读写](https://liaoxuefeng.com/books/python/io/file/index.html)；[13.2 StringIO和BytesIO](https://liaoxuefeng.com/books/python/io/stringio-bytesio/index.html)；[13.3 操作文件和目录](https://liaoxuefeng.com/books/python/io/dir/index.html)；[13.4 序列化](https://liaoxuefeng.com/books/python/io/serialization/index.html)
- [16.13 venv](https://liaoxuefeng.com/books/python/built-in-modules/venv/index.html)

Python 官方文档：

- [Unicode 与编码](https://docs.python.org/3/howto/unicode.html)
- [内置类型](https://docs.python.org/3/library/stdtypes.html)
- [控制流与函数参数](https://docs.python.org/3/tutorial/controlflow.html)
- [模块与包](https://docs.python.org/3/tutorial/modules.html)
- [数据模型与特殊方法](https://docs.python.org/3/reference/datamodel.html)
- [functools](https://docs.python.org/3/library/functools.html)
- [unittest](https://docs.python.org/3/library/unittest.html)
- [doctest](https://docs.python.org/3/library/doctest.html)
- [IO 流](https://docs.python.org/3/library/io.html)
- [pickle](https://docs.python.org/3/library/pickle.html)
- [JSON](https://docs.python.org/3/library/json.html)
- [venv](https://docs.python.org/3/library/venv.html)
