// DS-VLAB Circuit-DSL Example: 8-bit Reversible Counter
// This demonstrates the new 74LS191_8bit up/down counter
// AI-generated circuit example

circuit ReversibleCounter_Demo {
    components {
        // 8-bit reversible counter (NEW component)
        counter: 74LS191_8bit at (350, 200)

        // Clock source
        clock: ContinuousPulse at (100, 180)

        // Direction control switch (0=up, 1=down)
        dir_switch: Switch at (100, 220) with text="Direction"

        // Count enable switch
        enable_switch: Switch at (100, 260)

        // Output LEDs for counter value (8 bits)
        led_q0: Led at (600, 150)
        led_q1: Led at (600, 180)
        led_q2: Led at (600, 210)
        led_q3: Led at (600, 240)
        led_q4: Led at (600, 270)
        led_q5: Led at (600, 300)
        led_q6: Led at (600, 330)
        led_q7: Led at (600, 360)

        // Status LED for MAX/MIN
        led_maxmin: Led at (600, 400)

        // Text annotations
        label_title: TextLabel at (250, 80) with text="8-Bit Up/Down Counter"
        label_controls: TextLabel at (50, 150) with text="Controls"
        label_output: TextLabel at (620, 120) with text="Count Output"
        label_status: TextLabel at (620, 400) with text="MAX/MIN"
    }

    connections {
        // Connect clock and control signals
        clock.pin0 -> counter.CP
        dir_switch.pin0 -> counter.D/U
        enable_switch.pin0 -> counter.CTEN

        // Connect output LEDs
        counter.QA -> led_q0.pin0
        counter.QB -> led_q1.pin0
        counter.QC -> led_q2.pin0
        counter.QD -> led_q3.pin0
        counter.QE -> led_q4.pin0
        counter.QF -> led_q5.pin0
        counter.QG -> led_q6.pin0
        counter.QH -> led_q7.pin0

        // Connect status LED
        counter.MAX/MIN -> led_maxmin.pin0
    }

    configuration {
        linecolor: "#00FF7F"
    }
}
