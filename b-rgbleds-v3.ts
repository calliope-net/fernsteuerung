
namespace btf { // b-rgbleds-v3.ts


    let a_RgbLeds = [0, 0, 0, 0] // speichert 3 LEDs + Helligkeit, wenn nur eine geändert wird
    let n_RgbLedTimer = input.runningTime() // ms seit Start, zwischen zwei Aufrufen ist eine Pause erforderlich

    function rgbLedPause() {
        let t = input.runningTime() - n_RgbLedTimer // ms seit letztem setLedColors
        if (t < 25)
            basic.pause(t) // restliche Zeit-Differenz bis 25 ms warten
        n_RgbLedTimer = input.runningTime()
    }

    btf.onSetLedColors(function (led, color, on, blinken, helligkeit) {

        if (!on || (blinken && a_RgbLeds[led] == color)) // entweder aus .. oder an und blinken
            color = Colors.Off // alle Farben aus = 0

        if (a_RgbLeds[led] != color || a_RgbLeds[3] != helligkeit) { // nur wenn Farbe oder Helligkeit geändert

            a_RgbLeds[led] = color
            a_RgbLeds[3] = helligkeit
         
            rgbLedPause()
            basic.setLedColors(a_RgbLeds[0], a_RgbLeds[1], a_RgbLeds[2], helligkeit)
        }
    })

    btf.onSetLedColors3(function (color1, color2, color3, brightness) {

        if (a_RgbLeds[0] != color1 || a_RgbLeds[1] != color2 || a_RgbLeds[2] != color3 || a_RgbLeds[3] != brightness) { // nur wenn Farbe oder Helligkeit geändert
            a_RgbLeds[0] = color1
            a_RgbLeds[1] = color2
            a_RgbLeds[2] = color3
            a_RgbLeds[3] = brightness

            rgbLedPause()
            basic.setLedColors(a_RgbLeds[0], a_RgbLeds[1], a_RgbLeds[2], brightness) // gibt es nur bei v3
        }
    })


} // b-rgbleds-v3.ts
