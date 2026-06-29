circuit SimpleLED {
  components {
    sw1: Switch at (100, 150)
    led1: Led at (300, 150)
    label: TextLabel at (200, 50) with text="二进制开关演示"
  }

  connections {
    sw1.pin0 -> led1.pin0
  }

  configuration {
    linecolor: "#00BFFF"
  }
}
