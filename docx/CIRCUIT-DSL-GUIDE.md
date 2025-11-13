# Circuit-DSL 语言指南

## 给 AI 的说明

本文档描述了 DS-VLAB Circuit-DSL 的完整语法和用法。作为 AI 助手，你可以根据用户的电路需求，按照本指南编写 Circuit-DSL 代码。DS-VLAB 平台会自动解析你生成的 DSL 代码并创建可运行的数字电路。

---

## 一、语言概述

**Circuit-DSL** 是一种专门用于描述数字电路的领域特定语言（DSL）。它允许你用简洁的文本格式定义：
- 电路中的元件
- 元件之间的连线
- 电路的配置参数
- 文字标注和说明

---

## 二、基本语法结构

每个 Circuit-DSL 文件包含一个电路定义，结构如下：

```
circuit CircuitName {
    components {
        // 元件定义
    }

    connections {
        // 连线定义
    }

    configuration {
        // 配置参数（可选）
    }
}
```

### 语法规则

1. **关键字**: `circuit`, `components`, `connections`, `configuration`, `at`, `with`
2. **标识符**: 元件 ID、元件类型、引脚名称（字母、数字、下划线、可以以数字开头如 74LS181）
3. **数字**: 整数或浮点数，用于坐标
4. **字符串**: 用双引号包裹，如 `"Hello World"`
5. **注释**: 使用 `//` 或 `#` 开头的行

---

## 三、元件定义语法

### 3.1 基本元件定义

```
元件ID: 元件类型 at (X坐标, Y坐标)
```

**示例**:
```
sw1: Switch at (100, 150)
led1: Led at (500, 150)
alu: 74LS181_8bit at (300, 200)
```

### 3.2 带属性的元件定义

某些元件（如 TextLabel）支持额外属性：

```
元件ID: 元件类型 at (X, Y) with 属性名="属性值"
```

**示例**:
```
label1: TextLabel at (200, 50) with text="这是标题"
label2: TextLabel at (200, 80) with text="输入区域", fontSize=16
```

### 3.3 支持的元件类型

#### 基本数字功能器件
- `74LS181` - 4位 ALU
- `74LS181_8bit` - 8位 ALU（扩展版）
- `74LS163` - 4位同步计数器
- `74LS163_8bit` - 8位同步计数器（扩展版）
- `74LS191_8bit` - 8位可逆计数器（新增）
- `74LS245` - 总线收发器
- `74LS175`, `74LS174` - D 触发器
- `74LS273` - 8位寄存器
- `74LS139` - 译码器
- `74LS374` - 八D锁存器
- `RAM6116` - 静态RAM

#### 逻辑门电路
- `ANDgate` - 与门
- `ORgate` - 或门
- `NOTgate` - 非门
- `NANDgate` - 与非门
- `XORgate` - 异或门
- `Triplegate` - 三态门

#### 基本元件
- `Switch` - 开关（输入）
- `Led` - LED（输出）
- `SinglePulse` - 单脉冲发生器
- `ContinuousPulse` - 连续脉冲/时钟源

#### 存储器件
- `EPROM2716C3`, `EPROM2716C4` - EPROM
- `SequeTimer` - 时序发生器
- `BUS` - 总线

#### 注释工具
- `TextLabel` - 文字标注（支持 `text` 属性）

---

## 四、连线定义语法

连线格式：

```
源元件.引脚 -> 目标元件.引脚
```

### 4.1 引脚命名规则

可以使用：
1. **引脚名称**（推荐）: `A0`, `B1`, `QA`, `CP`, `-CR`, `D/U`
2. **引脚编号**: `pin0`, `pin1`, `pin5`

### 4.2 连线示例

```
connections {
    // 开关连接到 ALU 的 A0 引脚
    sw1.pin0 -> alu.A0

    // ALU 输出连接到 LED
    alu.F0 -> led1.pin0

    // 计数器连接到 ALU
    counter.QA -> alu.B0
    counter.QB -> alu.B1

    // 时钟连接
    clock.pin0 -> counter.CP
}
```

### 4.3 常见元件的引脚

#### Switch (开关)
- `pin0` - 输出引脚

#### Led (LED)
- `pin0` - 输入引脚

#### ContinuousPulse (时钟)
- `pin0` - 时钟输出

#### 74LS181_8bit (8位ALU)
- `A0`-`A7` - A操作数输入
- `B0`-`B7` - B操作数输入
- `F0`-`F7` - 运算结果输出
- `S0`-`S3` - 功能选择
- `M` - 模式选择
- `Cn` - 进位输入
- `Cn+8` - 进位输出

#### 74LS163_8bit (8位计数器)
- `CP` - 时钟输入
- `-CR` - 清零（低电平有效）
- `A`-`D`, `E`-`H` - 并行数据输入
- `-LD` - 加载使能
- `ENP`, `ENT` - 计数使能
- `QA`-`QH` - 计数输出
- `RCO` - 进位输出

#### 74LS191_8bit (8位可逆计数器)
- `CP` - 时钟输入
- `D/U` - 方向控制（0=上数，1=下数）
- `-LOAD` - 加载使能
- `A`-`D`, `E`-`H` - 并行数据输入
- `CTEN` - 计数使能
- `QA`-`QH` - 计数输出
- `MAX/MIN` - 最大/最小值标志
- `RCO` - 进位输出

---

## 五、配置定义语法

配置块是可选的，用于设置电路的全局参数：

```
configuration {
    linecolor: "颜色值"
}
```

**支持的配置**:
- `linecolor` - 连线颜色（CSS 颜色值，如 `"#00BFFF"`, `"red"`, `"#FF6347"`）

**示例**:
```
configuration {
    linecolor: "#00BFFF"
}
```

---

## 六、完整示例

### 示例 1: 简单的开关-LED电路

```dsl
circuit SimpleLED {
    components {
        sw1: Switch at (100, 100)
        led1: Led at (300, 100)
        label: TextLabel at (150, 50) with text="开关控制LED"
    }

    connections {
        sw1.pin0 -> led1.pin0
    }

    configuration {
        linecolor: "#00BFFF"
    }
}
```

### 示例 2: 8位计数器演示

```dsl
circuit Counter8Bit {
    components {
        // 8位计数器
        counter: 74LS163_8bit at (250, 200)

        // 时钟源
        clock: ContinuousPulse at (100, 230)

        // 输出LED（显示低4位）
        led0: Led at (450, 160)
        led1: Led at (450, 190)
        led2: Led at (450, 220)
        led3: Led at (450, 250)

        // 文字说明
        title: TextLabel at (200, 120) with text="8位计数器演示"
        output_label: TextLabel at (470, 130) with text="输出"
    }

    connections {
        // 时钟连接
        clock.pin0 -> counter.CP

        // 输出连接
        counter.QA -> led0.pin0
        counter.QB -> led1.pin0
        counter.QC -> led2.pin0
        counter.QD -> led3.pin0
    }

    configuration {
        linecolor: "#00FF00"
    }
}
```

### 示例 3: 8位ALU电路

```dsl
circuit ALU_Demo {
    components {
        // 8位ALU
        alu: 74LS181_8bit at (350, 250)

        // A操作数输入开关
        sw_a0: Switch at (100, 200)
        sw_a1: Switch at (100, 230)
        sw_a2: Switch at (100, 260)
        sw_a3: Switch at (100, 290)

        // B操作数输入开关
        sw_b0: Switch at (100, 340)
        sw_b1: Switch at (100, 370)

        // 结果输出LED
        led_f0: Led at (600, 200)
        led_f1: Led at (600, 230)
        led_f2: Led at (600, 260)

        // 文字标注
        title: TextLabel at (300, 150) with text="8位ALU演示"
        input_a: TextLabel at (50, 170) with text="操作数A"
        input_b: TextLabel at (50, 320) with text="操作数B"
        output: TextLabel at (620, 170) with text="结果F"
    }

    connections {
        // A输入
        sw_a0.pin0 -> alu.A0
        sw_a1.pin0 -> alu.A1
        sw_a2.pin0 -> alu.A2
        sw_a3.pin0 -> alu.A3

        // B输入
        sw_b0.pin0 -> alu.B0
        sw_b1.pin0 -> alu.B1

        // F输出
        alu.F0 -> led_f0.pin0
        alu.F1 -> led_f1.pin0
        alu.F2 -> led_f2.pin0
    }

    configuration {
        linecolor: "#00BFFF"
    }
}
```

### 示例 4: 可逆计数器

```dsl
circuit ReversibleCounter {
    components {
        // 8位可逆计数器
        counter: 74LS191_8bit at (300, 220)

        // 时钟源
        clock: ContinuousPulse at (100, 220)

        // 方向控制开关
        dir_switch: Switch at (100, 270)

        // 输出显示
        led_q0: Led at (500, 180)
        led_q1: Led at (500, 210)
        led_q2: Led at (500, 240)
        led_q3: Led at (500, 270)

        // 状态指示
        led_maxmin: Led at (500, 320)

        // 文字标注
        title: TextLabel at (250, 150) with text="可逆计数器"
        dir_label: TextLabel at (50, 270) with text="方向(0=上/1=下)"
        status_label: TextLabel at (520, 320) with text="MAX/MIN"
    }

    connections {
        // 时钟和控制
        clock.pin0 -> counter.CP
        dir_switch.pin0 -> counter.D/U

        // 输出
        counter.QA -> led_q0.pin0
        counter.QB -> led_q1.pin0
        counter.QC -> led_q2.pin0
        counter.QD -> led_q3.pin0

        // 状态
        counter.MAX/MIN -> led_maxmin.pin0
    }

    configuration {
        linecolor: "#FF6347"
    }
}
```

---

## 七、AI 使用指南

作为 AI 助手，当用户请求生成电路时，请按以下步骤操作：

### 步骤 1: 理解需求

分析用户想要的电路功能，确定需要的元件类型。

### 步骤 2: 规划电路

决定：
- 需要哪些元件
- 元件在画布上的大致位置
- 元件之间的连线关系

### 步骤 3: 生成 DSL 代码

按照本指南的语法规则，编写完整的 Circuit-DSL 代码。

### 步骤 4: 验证语法

确保：
- 所有元件ID唯一
- 连线的引脚名称正确
- 坐标合理（通常在 50-800 范围内）
- 所有括号、引号匹配

---

## 八、常见模式

### 模式 1: 输入-处理-输出

```
Switch → 处理元件 → Led
```

示例：
```dsl
sw1: Switch at (100, 200)
gate1: ANDgate at (300, 200)
led1: Led at (500, 200)

// connections
sw1.pin0 -> gate1.inputA
gate1.output -> led1.pin0
```

### 模式 2: 时钟驱动

```
ContinuousPulse → 时序元件 → 输出
```

示例：
```dsl
clock: ContinuousPulse at (100, 200)
counter: 74LS163_8bit at (300, 200)
led: Led at (500, 200)

// connections
clock.pin0 -> counter.CP
counter.QA -> led.pin0
```

### 模式 3: 复杂电路（多级）

```
输入 → 第一级 → 第二级 → 输出
```

布局建议：
- 输入在左侧（x ≈ 100-150）
- 处理在中间（x ≈ 300-500）
- 输出在右侧（x ≈ 600-700）
- 垂直间隔 30-50 像素

---

## 九、调试技巧

### 常见错误

1. **引脚名称错误**
   - ❌ `counter.Q0` (错误)
   - ✅ `counter.QA` (正确)

2. **忘记引号**
   - ❌ `with text=Hello` (错误)
   - ✅ `with text="Hello"` (正确)

3. **坐标格式错误**
   - ❌ `at 100, 200` (缺少括号)
   - ✅ `at (100, 200)` (正确)

4. **元件类型错误**
   - ❌ `switch: switch at (100, 100)` (类型名错误)
   - ✅ `switch1: Switch at (100, 100)` (正确)

### 调试步骤

1. 检查所有括号、引号是否匹配
2. 验证元件类型名称大小写正确
3. 确认引脚名称与元件文档一致
4. 检查是否有重复的元件 ID

---

## 十、最佳实践

1. **命名规范**
   - 元件ID：描述性名称（如 `sw_a0`, `led_output`）
   - 避免使用纯数字作为ID

2. **布局建议**
   - 信号流从左到右
   - 相关元件垂直对齐
   - 保持足够间距（最少 100 像素）

3. **注释**
   - 使用 `//` 添加说明
   - 分组相关的元件定义

4. **文字标注**
   - 为重要区域添加 TextLabel
   - 说明输入/输出的含义
   - 标注特殊功能

---

## 十一、快速参考

### 语法速查表

```
// 电路定义
circuit Name { ... }

// 元件定义
id: Type at (x, y)
id: Type at (x, y) with prop="value"

// 连线
source.pin -> target.pin

// 配置
configuration {
    linecolor: "color"
}

// 注释
// 单行注释
# 另一种注释
```

### 常用元件组合

| 功能 | 元件组合 |
|------|----------|
| 基本输入输出 | Switch + Led |
| 时钟电路 | ContinuousPulse + 74LS163_8bit |
| 算术运算 | Switch + 74LS181_8bit + Led |
| 计数器 | ContinuousPulse + 74LS163_8bit/74LS191_8bit + Led |
| 逻辑运算 | Switch + 逻辑门 + Led |

---

## 结语

Circuit-DSL 让你能够用简洁的文本描述复杂的数字电路。作为 AI，你可以快速生成符合语法的 DSL 代码，帮助用户创建教学电路、实验电路和演示电路。

记住核心原则：
- **简洁**: 语法简单直接
- **清晰**: 结构明确，易于理解
- **完整**: 包含电路的所有必要信息

祝你生成出色的电路设计！

---

**文档版本**: 1.0
**更新日期**: 2025年
**适用平台**: DS-VLAB v1.2+
