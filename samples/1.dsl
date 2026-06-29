 circuit BinaryHalfAdder {
      components {
          // 标题说明
          title: TextLabel at (300, 20) with text="二进制半加器实验", fontSize=22, fontColor="#2C3E50"

          // 输入开关 (A 和 B)
          sw_a: Switch at (100, 150)
          sw_b: Switch at (100, 220)

          // 输入标签
          lbl_a: TextLabel at (50, 145) with text="输入 A", fontSize=14
          lbl_b: TextLabel at (50, 215) with text="输入 B", fontSize=14

          // 核心逻辑门
          xor1: XORgate at (350, 170)
          and1: ANDgate at (350, 250)

          // 输出 LED
          led_sum: Led at (650, 175)
          led_carry: Led at (650, 255)

          // 输出标签
          lbl_sum: TextLabel at (700, 168) with text="和位 (Sum)", fontSize=14, fontColor="#27AE60"
          lbl_carry: TextLabel at (700, 248) with text="进位 (Carry)", fontSize=14, fontColor="#E74C3C"

          // 说明文本
          info: TextLabel at (280, 350) with text="说明：半加器实现 A+B，输出和位与进位", fontSize=12,
  fontColor="#7F8C8D"
      }

      connections {
          // A 连接到 XOR 和 AND 门
          sw_a.pin0 -> xor1.pin0
          sw_a.pin0 -> and1.pin0

          // B 连接到 XOR 和 AND 门
          sw_b.pin0 -> xor1.pin1
          sw_b.pin0 -> and1.pin1

          // XOR 输出到和位 LED
          xor1.pin2 -> led_sum.pin0

          // AND 输出到进位 LED
          and1.pin2 -> led_carry.pin0
      }

      configuration {
          linecolor: "#3498DB"
      }
  }