
namespace receiver { // r-calliope-v3.ts
    /*
Diese Datei wird nur bei Calliope mini v3 geladen. In pxt.json steht:
    "fileDependencies": {
        "r-aktoren-v3.ts": "v3"
    }

Der Code behandelt Ereignisse und übergibt die Parameter an Funktionen, die es nur bei v3 gibt.
Bei !v3 ignoriert der Compiler nicht existierende Funktionen und zeigt keinen Fehler an.

Ein Ereignis definieren:
        let onSetLedColorsHandler: (color1: number, color2: number, color3: number, brightness: number) => void

        export function onSetLedColors(cb: (a: number, b: number, c: number, brightness: number) => void) {
            onSetLedColorsHandler = cb
        }

So kann getestet werden, ob das Ereignis einen Handler hat:
        if (onSetLedColorsHandler)
            onSetLedColorsHandler(n_rgbled[0], n_rgbled[1], n_rgbled[2], helligkeit) // Ereignis Block auslösen, nur wenn benutzt
        else
            basic.setLedColor(n_rgbled[0])




    24.11.2023 14:07 Juri
    https://forum.calliope.cc/t/makecode-betaversion-6-0-24/2725/16?u=asp.net
    
    Ja, die Abhängigkeit zu den Versionspaketen in die Erweiterung zu schreiben kommt vermutlich den User-Einstellungen in die Queere. 
    Das also nur bei Projekten, die importiert werden sollen und nicht bei Erweiterungen, die in bestehende Projekte geladen werden machen.
    
    Wenn du über „importieren → github → neues Projekt" gehst, sollte in der pxt.json aber auch keine Boardversion drin stehen 
    (ob das anders wird, wenn das Default laden des v1 Boards behoben wird weiß ich allerdings nicht). 
    Ansonsten beim committen eben darauf achten, dass die nicht mit reinkommt.
    
    Du kannst aber Dateien nur abhängig von anderen Erweiterungen laden:
    
        "fileDependencies": {
            "custom-a.ts": "v2", // Lädt nur, wenn der mini 2 ausgewählt ist
            "custom-b.ts": "v1 || v2", // Lädt beim mini 1 und 2
            "custom-b.ts": "!v3" // Lädt nicht beim mini 3
        },
    Bei pxt-jacdac wird das u.a. gemacht, um nach der Editor-Variante zu unterscheiden:
    https://github.com/microsoft/pxt-jacdac/blob/78e2c68b85363e580cc4c757fdce89a032e990f9/pxt.json#L73
    */


    //receiver.onSetLedColors(function (a, b, c, brightness) {
    //    basic.setLedColors(a, b, c, brightness) // gibt es nur bei v3, sonst any
    //})

    receiver.onDualMotorPower(function (motor: Motor, duty_percent) {
        motors.dualMotorPower(motor, duty_percent)
    })




    let a_RgbLeds = [0, 0, 0, 0] // speichert 3 LEDs, wenn nur eine geändert wird
    let n_RgbLedTimer = input.runningTime() // ms seit Start, zwischen zwei Aufrufen ist eine Pause erforderlich

    function rgbLedPause() {
        let t = input.runningTime() - n_RgbLedTimer // ms seit letztem setLedColors
        if (t < 25)
            basic.pause(t) // restliche Zeit-Differenz bis 25 ms warten
        n_RgbLedTimer = input.runningTime()
    }

    receiver.onSetLedColors_v3(function (led, color, on, blinken, helligkeit) {

        if (!on || (blinken && a_RgbLeds[led] == color)) // entweder aus .. oder an und blinken
            color = Colors.Off // alle Farben aus = 0

        if (a_RgbLeds[led] != color || a_RgbLeds[3] != helligkeit) { // nur wenn Farbe oder Helligkeit geändert

            a_RgbLeds[led] = color
            a_RgbLeds[3] = helligkeit

            //let t = input.runningTime() - n_RgbLedTimer // ms seit letztem setLedColors
            //if (t < 25)
            //    basic.pause(t) // restliche Zeit-Differenz bis 10 ms warten
            //n_RgbLedTimer = input.runningTime()

            rgbLedPause()
            basic.setLedColors(a_RgbLeds[0], a_RgbLeds[1], a_RgbLeds[2], helligkeit)
        }
    })

    receiver.onSetLedColors(function (color1, color2, color3, brightness) {

        if (a_RgbLeds[0] != color1 || a_RgbLeds[1] != color2 || a_RgbLeds[2] != color3 || a_RgbLeds[3] != brightness) { // nur wenn Farbe oder Helligkeit geändert
            a_RgbLeds[0] = color1
            a_RgbLeds[1] = color2
            a_RgbLeds[2] = color3
            a_RgbLeds[3] = brightness

            rgbLedPause()
            basic.setLedColors(a_RgbLeds[0], a_RgbLeds[1], a_RgbLeds[2], brightness) // gibt es nur bei v3, sonst any
        }
    })


} // r-calliope-v3.ts