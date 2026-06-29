circuit ReversibleCounter {
  components {
    counter: 74LS191_8bit at (300, 220)
    clock: ContinuousPulse at (100, 220)
    dir_switch: Switch at (100, 270)

    led_q0: Led at (500, 180)
    led_q1: Led at (500, 210)
    led_q2: Led at (500, 240)
    led_q3: Led at (500, 270)

    led_maxmin: Led at (500, 320)

    title: TextLabel at (250, 150) with text="可逆计数器"
    dir_label: TextLabel at (50, 270) with text="方向(0=上/1=下)"
    status_label: TextLabel at (520, 320) with text="MAX/MIN"
  }

  connections {
    clock.pin0 -> counter.CP
    dir_switch.pin0 -> counter.D/U

    counter.QA -> led_q0.pin0
    counter.QB -> led_q1.pin0
    counter.QC -> led_q2.pin0
    counter.QD -> led_q3.pin0

    counter."MAX/MIN" -> led_maxmin.pin0
  }

  configuration {
    linecolor: "#FF6347"
  }
}
