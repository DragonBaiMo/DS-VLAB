// DS-VLAB Circuit-DSL Example: Comprehensive Demo
// This example demonstrates all new features:
// - 8-bit ALU (74LS181_8bit)
// - 8-bit Counter (74LS163_8bit)
// - 8-bit Reversible Counter (74LS191_8bit)
// - Text Label annotations
// - Circuit-DSL AI bridge layer

circuit ComprehensiveDemo {
    components {
        // ===== Section 1: Counter =====
        counter: 74LS163_8bit at (150, 150)
        clock1: ContinuousPulse at (50, 180)
        label_counter: TextLabel at (100, 100) with text="8-Bit Counter Section"

        // ===== Section 2: ALU =====
        alu: 74LS181_8bit at (450, 150)
        label_alu: TextLabel at (400, 100) with text="8-Bit ALU Section"

        // ===== Section 3: Reversible Counter =====
        rev_counter: 74LS191_8bit at (750, 150)
        clock2: ContinuousPulse at (650, 180)
        dir_sw: Switch at (650, 220)
        label_revcounter: TextLabel at (700, 100) with text="Reversible Counter"

        // ===== Outputs =====
        led_output1: Led at (300, 200)
        led_output2: Led at (600, 200)
        led_output3: Led at (900, 200)

        // ===== Main Title =====
        label_title: TextLabel at (400, 30) with text="DS-VLAB Extended Components Demonstration"
    }

    connections {
        // Counter section
        clock1.pin0 -> counter.CP
        counter.QA -> led_output1.pin0
        counter.QA -> alu.A0

        // ALU section
        alu.F0 -> led_output2.pin0

        // Reversible counter section
        clock2.pin0 -> rev_counter.CP
        dir_sw.pin0 -> rev_counter.D/U
        rev_counter.QA -> led_output3.pin0
    }

    configuration {
        linecolor: "#00BFFF"
    }
}
