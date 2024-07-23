input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    t = input.runningTime()
    cb2.fahre2MotorenEncoder(
    128 + 32,
    128 - 32,
    800,
    800,
    true
    )
    basic.showNumber(input.runningTime() - t)
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    t = input.runningTime()
    cb2.fahre2MotorenEncoder(
    1,
    255,
    25,
    25,
    false
    )
    basic.showNumber(input.runningTime() - t)
})
let t = 0
cb2.writeReset()
btf.zeigeBIN(cb2.readSpannung(), btf.ePlot.bcd, 4)
