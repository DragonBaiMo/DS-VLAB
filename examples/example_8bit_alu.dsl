// DS-VLAB Circuit-DSL Example: 8-bit ALU Demonstration
// This example showcases the new 8-bit ALU component (74LS181_8bit)
// Demonstrates AI-to-circuit capability

circuit ALU_8bit_Demo {
    components {
        // Main ALU component (new 8-bit version)
        alu: 74LS181_8bit at (350, 200)

        // Input switches for operand A (8 bits)
        sw_a0: Switch at (100, 150)
        sw_a1: Switch at (100, 180)
        sw_a2: Switch at (100, 210)
        sw_a3: Switch at (100, 240)

        // Input switches for operand B (8 bits)
        sw_b0: Switch at (100, 280)
        sw_b1: Switch at (100, 310)
        sw_b2: Switch at (100, 340)
        sw_b3: Switch at (100, 370)

        // Output LEDs for result F (8 bits)
        led_f0: Led at (600, 150)
        led_f1: Led at (600, 180)
        led_f2: Led at (600, 210)
        led_f3: Led at (600, 240)

        // Text labels for documentation
        label_title: TextLabel at (300, 80) with text="8-Bit ALU Demonstration"
        label_input_a: TextLabel at (50, 120) with text="Input A"
        label_input_b: TextLabel at (50, 260) with text="Input B"
        label_output: TextLabel at (620, 120) with text="Output F"
    }

    connections {
        // Connect input A
        sw_a0.pin0 -> alu.A0
        sw_a1.pin0 -> alu.A1
        sw_a2.pin0 -> alu.A2
        sw_a3.pin0 -> alu.A3

        // Connect input B
        sw_b0.pin0 -> alu.B0
        sw_b1.pin0 -> alu.B1
        sw_b2.pin0 -> alu.B2
        sw_b3.pin0 -> alu.B3

        // Connect output F
        alu.F0 -> led_f0.pin0
        alu.F1 -> led_f1.pin0
        alu.F2 -> led_f2.pin0
        alu.F3 -> led_f3.pin0
    }

    configuration {
        linecolor: "#00BFFF"
    }
}
