
namespace receiver { // r-aktoren-v3.ts


    receiver.onSetLedColors(function (a, b, c) {
        basic.setLedColors(a, b, c)
    })

    /* receiver.onDualMotorPower(function (motor, duty_percent) {
        motors.dualMotorPower(motor, duty_percent)
    }) */

/* 
    let n_rgbled = [0, 0, 0]

    //% group="Licht" subcategory="Aktoren"
    //% block="RGB LEDs3 %led %color %on" weight=6
    //% color.shadow="colorNumberPicker"
    //% on.shadow="toggleOnOff"
    export function rgbLEDon3(led: eRGBled, color: number, on: boolean) {
        rgbLEDs(led, (on ? color : 0), false)
    }

    
    //% group="Licht" subcategory="Aktoren"
    //% block="RGB LEDs3 %led %color blinken %blinken" weight=5
    //% color.shadow="colorNumberPicker"
    //% blinken.shadow="toggleYesNo"
    export function rgbLEDs3(led: eRGBled, color: number, blinken: boolean) {
        if (blinken && n_rgbled[led] != 0)
            n_rgbled[led] = 0
        else
            n_rgbled[led] = color

        basic.setLedColors(n_rgbled[0], n_rgbled[1], n_rgbled[2])
    }
 */
}