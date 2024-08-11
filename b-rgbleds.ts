
namespace btf { // b-rgbleds.ts

    // ========== group="RGB LEDs (v3)" subcategory="Aktoren"

    export enum eRGBled { a, b, c } // Index im Array
    let n_RgbLed = 0 // aktueller Wert v1 v2

    // deklariert die Variable mit dem Delegat-Typ '(color1: number, color2: number, color3: number, brightness: number) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    let onSetLedColorsHandler: (color1: number, color2: number, color3: number, brightness: number) => void


    // sichtbarer Event-Block; deprecated=true
    // wird bei v3 automatisch im Code r-aktoren-v3.ts aufgerufen und deshalb nicht als Block angezeigt

    //% group="RGB LEDs (Calliope v3)" deprecated=true
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors(cb: (a: number, b: number, c: number, brightness: number) => void) {
        // das ist der sichtbare Ereignis Block 'SetLedColors (a, b, c, brightness)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onSetLedColorsHandler = cb
        // aufgerufen wird in der function 'rgbLEDs' die der Variable 'onSetLedColorsHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'SetLedColors (a, b, c, brightness)' enthalten sind
    }


    let onSetLedColorsHandler_v3: (led: eRGBled, color: number, on: boolean, blinken: boolean, helligkeit: number) => void
    //% group="RGB LEDs (Calliope v3)" deprecated=true
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors_v3(cb: (led: eRGBled, color: number, on: boolean, blinken: boolean, helligkeit: number) => void) {
        onSetLedColorsHandler_v3 = cb
    }



    // ========== group="RGB LEDs (Calliope v1 v2 v3)" subcategory="LEDs, Display" color=#54C9C9

    //% group="RGB LEDs (Calliope v1 v2 v3)" subcategory="LEDs, Display" color=#54C9C9
    //% block="RGB LED %led %color || %on blinken %blinken Helligkeit %helligkeit \\%" weight=4
    //% on.shadow=toggleOnOff on.defl=1
    //% color.shadow="colorNumberPicker"
    //% blinken.shadow=toggleYesNo
    //% helligkeit.min=5 helligkeit.max=100 helligkeit.defl=20
    //% inlineInputMode=inline
    export function setLedColors(led: eRGBled, color: number, on = true, blinken = false, helligkeit = 20) {
        if (onSetLedColorsHandler_v3) { // v3 hat 3 RgbLeds
            onSetLedColorsHandler_v3(led, color, on, blinken, helligkeit)
        }
        else if (led == eRGBled.a) { // b und c wird ignoriert
            if (!on || (blinken && n_RgbLed == color)) // entweder aus .. oder an und blinken
                color = Colors.Off // alle Farben aus = 0

            if (n_RgbLed != color) { // nur wenn Farbe geändert
                n_RgbLed = color
                basic.setLedColor(n_RgbLed) // v1 v2
            }
        }
    }

    //% group="RGB LEDs (Calliope v1 v2 v3)" subcategory="LEDs, Display" color=#54C9C9
    //% block="RGB LEDs aus" weight=3
    export function setLedColorsOff() {
        if (onSetLedColorsHandler)
            onSetLedColorsHandler(0, 0, 0, 20) // v3 Ereignis Block auslösen, nur wenn benutzt
        else
            basic.setLedColor(0) // v1 v2
    }

} // b-rgbleds.ts
