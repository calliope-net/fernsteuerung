// Gib deinen Code hier ein

namespace receiver { // r-aktoren.ts



    // deklariert die Variable mit dem Delegat-Typ '(receivedBuffer: Buffer) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    let onSetLedColorsHandler: (color1: number, color2: number, c: number) => void




    // sichtbarer Event-Block

    //% group="RGB" subcategory="Aktoren"
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors(cb: (a: number, b: number, c: number) => void) {
        // das ist der sichtbare Ereignis Block 'wenn Buffer empfangen (receivedData)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onSetLedColorsHandler = cb
        // aufgerufen wird beim Ereignis 'radio.onReceivedBuffer' die der Variable 'onReceivedDataHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'wenn Buffer empfangen (receivedData)' enthalten sind
    }






    export enum eRGBled { a, b, c }

    let n_rgbled = [0, 0, 0]
    let n_hupe = false


    //% group="Relais" subcategory="Aktoren"
    //% block="Relais %pON"
    //% pON.shadow="toggleOnOff"
    export function relay(pON: boolean) { }




    //% group="Hupe" subcategory="Aktoren"
    //% block="Hupe %pON"
    //% pON.shadow="toggleOnOff"
    export function hupe(pON: boolean) {
        if (n_hupe !== pON) {
            n_hupe = pON
            if (n_hupe)
                music.ringTone(262)
            else
                music.stopAllSounds()
            // pins.digitalWritePin(pinBuzzer, n_buzzer ? 1 : 0)
        }
    }





    //% group="Licht" subcategory="Aktoren"
    //% block="RGB LEDs %led %color %on" weight=6
    //% color.shadow="colorNumberPicker"
    //% on.shadow="toggleOnOff"
    export function rgbLEDon(led: eRGBled, color: number, on: boolean) {
        rgbLEDs(led, (on ? color : 0), false)
    }

    //% group="Licht" subcategory="Aktoren"
    //% block="RGB LEDs %led %color blinken %blinken" weight=5
    //% color.shadow="colorNumberPicker"
    //% blinken.shadow="toggleYesNo"
    export function rgbLEDs(led: eRGBled, color: number, blinken: boolean) {
        if (blinken && n_rgbled[led] != 0)
            n_rgbled[led] = 0
        else
            n_rgbled[led] = color

        //basic.setLedColors(n_rgbled[0], n_rgbled[1], n_rgbled[2])

        // die Variable 'onReceivedDataHandler' ist normalerweise undefined, dann passiert nichts
        // die Variable erhält einen Wert, wenn der folgende Ereignis Block 'onReceivedData' einmal im Code vorkommt
        // der Wert der Variable 'onReceivedDataHandler' ist die function, die bei true zurück gerufen wird
        // die function ruft mit dem Parameter vom Typ Buffer die Blöcke auf, die im Ereignis-Block stehen
        if (onSetLedColorsHandler)
            onSetLedColorsHandler(n_rgbled[0], n_rgbled[1], n_rgbled[2]) // Ereignis Block auslösen, nur wenn benutzt
    }



    // I²C Adresse Single Relay
    const i2cRelay = 0x19

    const SINGLE_OFF = 0x00
    const SINGLE_ON = 0x01

    //% group="SparkFun Qwiic Single Relay"
    //% block="Magnet %pOn"
    //% pOn.shadow="toggleOnOff"
    export function turnRelay(pOn: boolean) {
        pins.i2cWriteBuffer(i2cRelay, Buffer.fromArray([pOn ? SINGLE_ON : SINGLE_OFF]))
    }

} // r-aktoren.ts
