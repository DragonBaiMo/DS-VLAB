circuit Counter8Bit {
  components {
    counter: 74LS163_8bit at (250, 200)
    clock: ContinuousPulse at (100, 230)

    led0: Led at (450, 160)
    led1: Led at (450, 190)
    led2: Led at (450, 220)
    led3: Led at (450, 250)

    title: TextLabel at (200, 120) with text="8位计数器演示"
    output_label: TextLabel at (470, 130) with text="输出"
  }

  connections {
    clock.pin0 -> counter.CP

    counter.QA -> led0.pin0
    counter.QB -> led1.pin0
    counter.QC -> led2.pin0
    counter.QD -> led3.pin0
  }

  configuration {
    linecolor: "#00FF00"
  }
}
