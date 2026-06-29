# Circuit-DSL 权威指南

## 给 AI 的说明

本文档是 DS-VLAB Circuit-DSL 的**权威参考手册**。作为 AI 助手，在生成电路代码时，**必须严格遵守**本文档中的组件名称、引脚名称和语法规则。

**核心原则：**
1.  **准确性**：组件类型和引脚名称必须与文档完全一致（区分大小写）。
2.  **完整性**：生成的电路应包含必要的电源、地线和控制信号连接。
3.  **布局**：生成合理的 `(x, y)` 坐标，避免元件重叠，保持连线清晰。

---

## 一、语言概述

**Circuit-DSL** 是一种用于描述数字逻辑电路的声明式语言。它通过文本定义元件、属性和连接关系，由 DS-VLAB 平台解析并渲染为可交互的仿真电路。

### 1.1 基本结构

```dsl
circuit CircuitName {
    components {
        // 1. 元件定义
        id: Type at (x, y)
        id: Type at (x, y) with property="value"
    }

    connections {
        // 2. 连线定义
        sourceId.pinName -> targetId.pinName
    }

    configuration {
        // 3. 全局配置
        linecolor: "#ColorHex"
    }
}
```

---

## 二、组件参考手册 (Component Reference)

以下是平台支持的所有组件及其引脚定义。**请务必使用下列准确的类型名称和引脚名称。**

### 2.1 基础交互元件

| 组件类型            | 描述           | 尺寸   | 引脚列表                                                              |
| :------------------ | :------------- | :----- | :-------------------------------------------------------------------- |
| **Switch**          | 拨动开关       | 17x35  | `pin0` (输出)                                                         |
| **Led**             | 发光二极管     | 17x26  | `pin0` (输入)                                                         |
| **SinglePulse**     | 单脉冲发生器   | 17x35  | `pin0` (输出)                                                         |
| **ContinuousPulse** | 连续脉冲(时钟) | 17x35  | `pin0` (输出)                                                         |
| **TextLabel**       | 文本标签       | 150x40 | 无引脚 (支持 `text`, `fontSize`, `fontColor`, `backgroundColor` 属性) |

### 2.2 逻辑门电路

| 组件类型       | 描述           | 引脚列表                                |
| :------------- | :------------- | :-------------------------------------- |
| **ANDgate**    | 与门 (2输入)   | `pin0` (入), `pin1` (入), `pin2` (出)   |
| **ORgate**     | 或门 (2输入)   | `pin0` (入), `pin1` (入), `pin2` (出)   |
| **NOTgate**    | 非门 (1输入)   | `pin0` (入), `pin1` (出)                |
| **NANDgate**   | 与非门 (2输入) | `pin0` (入), `pin1` (入), `pin2` (出)   |
| **XORgate**    | 异或门 (2输入) | `pin0` (入), `pin1` (入), `pin2` (出)   |
| **Triplegate** | 三态门         | `pin0` (入), `pin1` (控制), `pin2` (出) |

### 2.3 74LS 系列芯片 (标准版)

| 组件类型    | 描述              | 引脚名称 (按顺序)                                                                                 |
| :---------- | :---------------- | :------------------------------------------------------------------------------------------------ |
| **74LS181** | 4位 ALU           | `A3`..`A0`, `B3`..`B0`, `S3`..`S0`, `M`, `Cn`, `F3`..`F0`, `A=B`, `P`, `G`, `Cn+4`, `GND`, `VCC`  |
| **74LS163** | 4位同步计数器     | `-CR`, `CP`, `D`, `C`, `B`, `A`, `ENP`, `GND`, `-LD`, `ENT`, `QA`, `QB`, `QC`, `QD`, `RCO`, `VCC` |
| **74LS245** | 8位总线收发器     | `DIR`, `A7`..`A0`, `GND`, `B0`..`B7`, `-E`, `VCC`                                                 |
| **74LS139** | 双2-4译码器       | `-Ea`, `A0a`, `A1a`, `-O0b`..`-O3b`, `GND`, `-O3a`..`-O0a`, `A1b`, `A0b`, `-Eb`, `VCC`            |
| **74LS174** | 6位 D触发器       | `-MR`, `D5`..`D0`, `GND`, `CP`, `Q0`..`Q5`, `VCC`                                                 |
| **74LS175** | 4位 D触发器       | `-MR`, `D3`..`D0`, `GND`, `CP`, `Q0`..`Q3`, `VCC`                                                 |
| **74LS273** | 8位 D触发器       | `-MR`, `D7`..`D0`, `GND`, `CP`, `Q0`..`Q7`, `VCC`                                                 |
| **74LS374** | 8位 D触发器(三态) | `-OE`, `D7`..`D0`, `GND`, `CP`, `Q0`..`Q7`, `VCC`                                                 |

### 2.4 增强型 8位组件 (推荐用于复杂实验)

这些组件是 DS-VLAB 特有的增强版，简化了 8 位电路的搭建。

#### **74LS181_8bit** (8位 ALU)
*   **输入**: `A7`..`A0`, `B7`..`B0`
*   **控制**: `S3`, `S2`, `S1`, `S0`, `M`, `Cn`
*   **输出**: `F0`..`F7`, `A=B`, `P`, `G`, `Cn+8`
*   **电源**: `GND`, `VCC`

#### **74LS163_8bit** (8位同步计数器)
*   **控制**: `-CR` (清零), `CP` (时钟), `-LD` (加载), `ENP`, `ENT` (使能)
*   **输入**: `D`..`A` (低4位), `H`..`E` (高4位)
*   **输出**: `QA`..`QD` (低4位), `QE`..`QH` (高4位), `RCO` (进位)
*   **电源**: `GND`, `VCC`

#### **74LS191_8bit** (8位可逆计数器)
*   **控制**: `D/U` (方向:0上/1下), `CP`, `-LOAD`, `CTEN` (使能:0有效)
*   **输入**: `D`..`A` (低4位), `H`..`E` (高4位)
*   **输出**: `QA`..`QD` (低4位), `QE`..`QH` (高4位), `MAX/MIN`, `RCO`
*   **电源**: `GND`, `VCC`

### 2.5 存储器与总线

| 组件类型        | 描述           | 关键引脚                                                                         |
| :-------------- | :------------- | :------------------------------------------------------------------------------- |
| **RAM6116**     | 2K x 8位 SRAM  | `A0`..`A10`, `IO0`..`IO7`, `-CE`, `-OE`, `-WE`, `GND`, `VCC`                     |
| **EPROM2716C3** | 2K x 8位 EPROM | `A0`..`A10`, `Q0`..`Q23` (注意: 输出引脚较多), `-CE`, `-OE`, `VPP`, `GND`, `VCC` |
| **EPROM2716C4** | 2K x 8位 EPROM | `A0`..`A10`, `Q0`..`Q31`, `-CE`, `-OE`, `VPP`, `GND`, `VCC`                      |
| **BUS**         | 通用总线       | `A0`..`A7`, `B0`..`B7` ... `P0`..`P7` (共16组8位接口)                            |
| **SequeTimer**  | 时序发生器     | `Ts`, `Stop`, `Step`, `Start`, `T4`, `T3`, `T2`, `T1`                            |

---

## 三、连线语法详解

### 3.1 基本连线
```dsl
元件ID.引脚名 -> 目标ID.引脚名
```
例如：`sw1.pin0 -> led1.pin0`

### 3.2 特殊字符处理
如果引脚名称包含特殊字符（如 `/`, `-`, `+`, 空格），**必须**使用双引号包裹引脚名。

*   `counter."D/U"`
*   `alu."Cn+4"`
*   `ram."-WE"`
*   `reg."-MR"`

### 3.3 常用引脚速查
*   **Switch/LED/Pulse**: 统一使用 `pin0`
*   **逻辑门**: 输入 `pin0`, `pin1`... 输出 `pin2` (具体见上表)
*   **芯片**: 直接使用数据手册上的名称，如 `A0`, `D0`, `CP`, `Q0` 等。

---

## 四、布局最佳实践

DS-VLAB 画布坐标系：左上角为 (0,0)，X轴向右增加，Y轴向下增加。

1.  **输入区 (左侧)**: 开关、时钟源通常放置在 `x: 50-150` 区域。
2.  **处理区 (中间)**: 核心芯片（ALU、计数器、存储器）放置在 `x: 300-600` 区域。
3.  **输出区 (右侧)**: LED、显示设备放置在 `x: 700-900` 区域。
4.  **间距**:
    *   水平间距：建议至少 150px。
    *   垂直间距：建议开关/LED之间间隔 30-40px。

---

## 五、完整示例代码

### 示例 1: 8位 ALU 运算演示

```dsl
circuit ALU8BitDemo {
    components {
        // 核心组件
        alu: 74LS181_8bit at (400, 200)
        
        // 输入 A (A7-A0)
        sw_a7: Switch at (100, 50)
        sw_a6: Switch at (100, 80)
        sw_a5: Switch at (100, 110)
        sw_a4: Switch at (100, 140)
        sw_a3: Switch at (100, 170)
        sw_a2: Switch at (100, 200)
        sw_a1: Switch at (100, 230)
        sw_a0: Switch at (100, 260)
        
        // 输入 B (B7-B0) - 简化演示，仅列出部分
        sw_b0: Switch at (100, 350)
        
        // 控制信号
        sw_m: Switch at (250, 400)
        sw_s0: Switch at (280, 400)
        
        // 输出显示 (F7-F0)
        led_f7: Led at (700, 50)
        led_f6: Led at (700, 80)
        led_f5: Led at (700, 110)
        led_f4: Led at (700, 140)
        led_f3: Led at (700, 170)
        led_f2: Led at (700, 200)
        led_f1: Led at (700, 230)
        led_f0: Led at (700, 260)
        
        // 标注
        lbl_title: TextLabel at (350, 20) with text="8位 ALU 运算实验", fontSize=20, fontColor="#4a90e2"
        lbl_a: TextLabel at (50, 40) with text="输入 A"
        lbl_f: TextLabel at (750, 40) with text="输出 F"
    }
    
    connections {
        // 连接 A 输入
        sw_a7.pin0 -> alu.A7
        sw_a6.pin0 -> alu.A6
        sw_a5.pin0 -> alu.A5
        sw_a4.pin0 -> alu.A4
        sw_a3.pin0 -> alu.A3
        sw_a2.pin0 -> alu.A2
        sw_a1.pin0 -> alu.A1
        sw_a0.pin0 -> alu.A0
        
        // 连接 B 输入 (示例)
        sw_b0.pin0 -> alu.B0
        
        // 连接控制
        sw_m.pin0 -> alu.M
        sw_s0.pin0 -> alu.S0
        
        // 连接输出
        alu.F7 -> led_f7.pin0
        alu.F6 -> led_f6.pin0
        alu.F5 -> led_f5.pin0
        alu.F4 -> led_f4.pin0
        alu.F3 -> led_f3.pin0
        alu.F2 -> led_f2.pin0
        alu.F1 -> led_f1.pin0
        alu.F0 -> led_f0.pin0
    }
    
    configuration {
        linecolor: "#5DADE2"
    }
}
```

### 示例 2: 存储器读写实验 (RAM6116)

```dsl
circuit RAMDemo {
    components {
        ram: RAM6116 at (400, 200)
        
        // 地址输入 (A0-A3)
        sw_a0: Switch at (150, 150)
        sw_a1: Switch at (150, 180)
        sw_a2: Switch at (150, 210)
        sw_a3: Switch at (150, 240)
        
        // 数据 I/O (IO0-IO3)
        // 注意：在真实电路中 IO 是双向的，这里简化为连接 LED 观察输出
        led_d0: Led at (650, 150)
        led_d1: Led at (650, 180)
        led_d2: Led at (650, 210)
        led_d3: Led at (650, 240)
        
        // 控制信号
        sw_ce: Switch at (300, 350) // -CE
        sw_oe: Switch at (330, 350) // -OE
        sw_we: Switch at (360, 350) // -WE
        
        lbl_ctrl: TextLabel at (300, 380) with text="控制信号 (CE/OE/WE)"
    }
    
    connections {
        sw_a0.pin0 -> ram.A0
        sw_a1.pin0 -> ram.A1
        sw_a2.pin0 -> ram.A2
        sw_a3.pin0 -> ram.A3
        
        ram.IO0 -> led_d0.pin0
        ram.IO1 -> led_d1.pin0
        ram.IO2 -> led_d2.pin0
        ram.IO3 -> led_d3.pin0
        
        sw_ce.pin0 -> ram."-CE"
        sw_oe.pin0 -> ram."-OE"
        sw_we.pin0 -> ram."-WE"
    }
}
```

---

## 六、常见问题排查

1.  **连线不显示？**
    *   检查引脚名称是否完全正确（区分大小写）。
    *   检查特殊字符引脚是否加了引号（如 `"-CE"`）。
    *   检查坐标是否重叠，导致连线无法生成。

2.  **组件未出现？**
    *   检查 `components` 块中的类型名称拼写是否正确。
    *   确认该组件是否在本文档的“组件参考手册”中列出。

3.  **仿真无反应？**
    *   确认电源 (`VCC`) 和地 (`GND`) 是否需要连接（部分组件内部已处理，但建议检查）。
    *   确认控制信号（如 `-CE`, `-OE`, `CP`）是否处于有效电平。
