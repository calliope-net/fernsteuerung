let t = 0
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    cb2.fahre2MotorenEncoder(
    128 + 64,
    128 - 64,
    800,
    800,
    true
    )
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    t = input.runningTime()
    cb2.fahre2MotorenEncoder(
    255,
    1,
    25,
    25,
    false
    )
    basic.showNumber(input.runningTime() - t)
})
