
namespace btf { // b-rgbleds.ts color=#54C9C9

    // ========== group="RGB LEDs (v3)" subcategory="Aktoren"

    export enum eRgbLed { a, b, c } // Index im Array
    let n_RgbLed = 0 // aktueller Wert v1 v2

    //% blockId=btf_RgbLed block="%led" blockHidden=true
    export function btf_RgbLed(led: eRgbLed): number {
        return led
    }

    // deklariert die Variable mit dem Delegat-Typ '(color1: number, color2: number, color3: number, brightness: number) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    let onSetLedColorsHandler3: (color1: number, color2: number, color3: number, brightness: number) => void
    let onSetLedColorsHandler: (led: eRgbLed, color: number, on: boolean, blinken: boolean, helligkeit: number) => void


    // sichtbarer Event-Block; deprecated=true
    // wird bei v3 automatisch im Code b-rgbleds-v3.ts aufgerufen und deshalb nicht als Block angezeigt

    //% group="RGB LEDs (Calliope v3)" deprecated=true
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors3(cb: (a: number, b: number, c: number, brightness: number) => void) {
        // das ist der sichtbare Ereignis Block 'SetLedColors (a, b, c, brightness)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onSetLedColorsHandler3 = cb
        // aufgerufen wird in der function 'rgbLEDs' die der Variable 'onSetLedColorsHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'SetLedColors (a, b, c, brightness)' enthalten sind
    }

    //% group="RGB LEDs (Calliope v3)" deprecated=true
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors(cb: (led: eRgbLed, color: number, on: boolean, blinken: boolean, helligkeit: number) => void) {
        onSetLedColorsHandler = cb
    }



    // ========== group="RGB LEDs (Calliope v1 v2 v3)" subcategory="LEDs, Display" color=#54C9C9

    //% group="RGB LEDs (Calliope v1 v2 nur LED a)" subcategory="LEDs, Display"
    //% block="RGB LED %led %color || %on blinken %blinken Helligkeit %helligkeit \\%" weight=5
    //% led.shadow=btf_RgbLed
    //% color.shadow="colorNumberPicker" color.defl=Colors.Off
    //% on.shadow=toggleOnOff on.defl=1
    //% blinken.shadow=toggleYesNo
    //% helligkeit.min=5 helligkeit.max=100 helligkeit.defl=20
    //% inlineInputMode=inline
    export function setLedColors(led: number, color: number, on = true, blinken = false, helligkeit = 20) {
        if (onSetLedColorsHandler) { // v3 hat 3 RgbLeds
            onSetLedColorsHandler(led, color, on, blinken, helligkeit)
        }
        else if (led == eRgbLed.a) { // v1, v2: b und c wird ignoriert
            if (!on || (blinken && n_RgbLed == color)) // entweder aus .. oder an und blinken
                color = Colors.Off // alle Farben aus = 0

            if (n_RgbLed != color) { // nur wenn Farbe geändert
                n_RgbLed = color
                basic.setLedColor(n_RgbLed) // v1 v2
            }
        }
    }


    //% group="RGB LEDs (Calliope v1 v2 nur LED a)" subcategory="LEDs, Display"
    //% block="RGB LEDs a %color1 b %color2 c %color3 || Helligkeit %helligkeit \\%" weight=4
    //% color1.shadow="colorNumberPicker" color1.defl=Colors.Off
    //% color2.shadow="colorNumberPicker" color2.defl=Colors.Off
    //% color3.shadow="colorNumberPicker" color3.defl=Colors.Off
    //% brightness.min=5 brightness.max=100 brightness.defl=20
    //% inlineInputMode=inline
    export function setLedColors3(color1: number, color2: number, color3: number, brightness = 20) {
        if (onSetLedColorsHandler3)
            onSetLedColorsHandler3(color1, color2, color3, brightness) // v3 Ereignis Block auslösen, nur wenn benutzt
        else
            basic.setLedColor(color1) // v1 v2
    }

    //% group="RGB LEDs (Calliope v1 v2 nur LED a)" subcategory="LEDs, Display"
    //% block="RGB LEDs aus" weight=3
    export function setLedColorsOff() {
        setLedColors3(0, 0, 0)
        //if (onSetLedColorsHandler3)
        //    onSetLedColorsHandler3(0, 0, 0, 20) // v3 Ereignis Block auslösen, nur wenn benutzt
        //else
        //    basic.setLedColor(0) // v1 v2
    }

} // b-rgbleds.ts
