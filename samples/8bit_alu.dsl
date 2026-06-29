circuit ALU_Demo {
  components {
    alu: 74LS181_8bit at (350, 250)

    sw_a0: Switch at (100, 200)
    sw_a1: Switch at (100, 230)
    sw_a2: Switch at (100, 260)
    sw_a3: Switch at (100, 290)

    sw_b0: Switch at (100, 340)
    sw_b1: Switch at (100, 370)

    led_f0: Led at (600, 200)
    led_f1: Led at (600, 230)
    led_f2: Led at (600, 260)

    title: TextLabel at (300, 150) with text="8位ALU演示"
    input_a: TextLabel at (50, 170) with text="操作数A"
    input_b: TextLabel at (50, 320) with text="操作数B"
    output: TextLabel at (620, 170) with text="结果F"
  }

  connections {
    sw_a0.pin0 -> alu.A0
    sw_a1.pin0 -> alu.A1
    sw_a2.pin0 -> alu.A2
    sw_a3.pin0 -> alu.A3

    sw_b0.pin0 -> alu.B0
    sw_b1.pin0 -> alu.B1

    alu.F0 -> led_f0.pin0
    alu.F1 -> led_f1.pin0
    alu.F2 -> led_f2.pin0
  }

  configuration {
    linecolor: "#00BFFF"
  }
}
