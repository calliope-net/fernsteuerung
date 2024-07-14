
namespace btf { // b-dispaly5x5.ts


    // ========== group="25 LED Display" advanced=true color=#54C9C9

    let n5x5_setClearScreen = false // wenn ein Image angezeigt wird, merken dass z.B. Funkgruppe wieder angezeigt werden muss

    let n5x5_x01y0 = 0 // Bit 5-4 Betriebsart in x=0-1 y=0
    let n5x5_x2 = 0 // Bit 5-4-3-2-1 Motor Power in x=2
    let n5x5_x3 = 0 // Motor 1..16..31
    let n5x5_x4 = 0 // Servo 1..16..31

    // ↕↕...
    export function zeigeFunkgruppe() {
        zeigeBIN(getStorageFunkgruppe(), ePlot.hex, 1) // 5x5 x=0-1 y=1-2-3-4 (y=0 ist bei hex immer aus)
    }

    //% group="BIN" subcategory="Display 5x5" color=#54C9C9
    //% block="zeige ↑↑↕.. aktive Motoren %buffer" weight=8
    //% buffer.shadow="btf_sendBuffer19"
    export function zeige5x5Buffer(buffer: Buffer) {
        // 2 Bit oben links Betriebsart, die sind bei Funkgruppe frei
        if (n5x5_x01y0 != (buffer[0] & 0x30)) {
            n5x5_x01y0 = (buffer[0] & 0x30) // Betriebsart 00 01 10 11 (x=0-1 y=0)
            if ((n5x5_x01y0 & 0x20) == 0x20) { led.plot(0, 0) } else { led.unplot(0, 0) }
            if ((n5x5_x01y0 & 0x10) == 0x10) { led.plot(1, 0) } else { led.unplot(1, 0) }
        }

        // Mitte x=2 aktivierte Motoren aus Buffer anzeigen
        if (n5x5_x2 != buffer[3]) {
            n5x5_x2 = buffer[3]
            let x = 2 // 5x5 x=2 Motor Power außer m0
            if ((n5x5_x2 & e3aktiviert.m1) == e3aktiviert.m1) { led.plot(x, 0) } else { led.unplot(x, 0) }
            if ((n5x5_x2 & e3aktiviert.ma) == e3aktiviert.ma) { led.plot(x, 1) } else { led.unplot(x, 1) }
            if ((n5x5_x2 & e3aktiviert.mb) == e3aktiviert.mb) { led.plot(x, 2) } else { led.unplot(x, 2) }
            if ((n5x5_x2 & e3aktiviert.mc) == e3aktiviert.mc) { led.plot(x, 3) } else { led.unplot(x, 3) }
            if ((n5x5_x2 & e3aktiviert.md) == e3aktiviert.md) { led.plot(x, 4) } else { led.unplot(x, 4) }
        }
    }


    //% group="BIN" subcategory="Display 5x5" color=#54C9C9
    //% block="zeige ...↕↕ Joystick %buffer" weight=7
    //% buffer.shadow="btf_sendBuffer19"
    export function zeige5x5Joystick(buffer: Buffer) {
        if (isBetriebsart(buffer, e0Betriebsart.p0)) {
            // Betriebsart: 00 Fernsteuerung Motoren

            if (getaktiviert(buffer, e3aktiviert.m0)) {
                // fahren und lenken mit Servo
                zeigeBINx3Motor_map255(buffer[eBufferPointer.m0])
                zeigeBINx4Servo_31(buffer[eBufferPointer.m0 + eBufferOffset.b1_Servo] & 0x1F)

            } else {
                // die ersten 2 aktivierten Motoren ohne Servo
                let bin: number[] = []
                if (bin.length < 2 && getaktiviert(buffer, e3aktiviert.m1))
                    bin.push(buffer[eBufferPointer.m1]) // Motor M1

                if (bin.length < 2 && getaktiviert(buffer, e3aktiviert.ma))
                    bin.push(buffer[eBufferPointer.ma]) // Motor MA

                if (bin.length < 2 && getaktiviert(buffer, e3aktiviert.mb))
                    bin.push(buffer[eBufferPointer.mb]) // Motor MB

                if (bin.length < 2 && getaktiviert(buffer, e3aktiviert.mc))
                    bin.push(buffer[eBufferPointer.mc]) // Motor MC

                if (bin.length < 2 && getaktiviert(buffer, e3aktiviert.md)) {
                    bin.push(buffer[eBufferPointer.md]) // Motor MD

                    if (bin.length < 2) // offset 17 (Servo) enthält Callibot Beispiel Nummer
                        zeigeBINx4Servo_31(buffer[eBufferPointer.md + eBufferOffset.b1_Servo] & 0x1F)
                    // zeigt als letztes direkt 0..31 an, mit Motor würde das gemapt werden
                }

                if (bin.length >= 1)
                    zeigeBINx3Motor_map255(bin[0]) // in 5x5 LED Matrix x=3
                if (bin.length >= 2)
                    zeigeBINx4Motor_map255(bin[1]) // in 5x5 LED Matrix x=4
            }
        } else {
            // andere Betriebsarten als '00 Fernsteuerung Motoren'
            zeigeBINx3Motor_map255(buffer[eBufferPointer.m0])
            zeigeBINx4Servo_31(buffer[eBufferPointer.m0 + eBufferOffset.b1_Servo] & 0x1F)
        }
    }

    function zeigeBINx3Motor_map255(x3: number) {
        if (n5x5_x3 != x3) { // zeigt Motor0 aus Buffer[1] 1..16..31 (x=3)
            n5x5_x3 = x3
            if (x3 == 0)
                zeigeBIN(0, ePlot.bin, 3)
            else
                zeigeBIN(mapInt32(x3, 1, 255, 1, 31), ePlot.bin, 3) // 8 Bit auf 5 Bit verteilen
        }
    }

    function zeigeBINx4Motor_map255(x4: number) {
        if (n5x5_x4 != x4) { // zeigt Motor0 aus Buffer[1] 1..16..31 (x=4)
            n5x5_x4 = x4
            if (x4 == 0)
                zeigeBIN(0, ePlot.bin, 4)
            else
                zeigeBIN(mapInt32(x4, 1, 255, 1, 31), ePlot.bin, 4) // 8 Bit auf 5 Bit verteilen
        }
    }

    function zeigeBINx4Servo_31(x4: number) {
        if (n5x5_x4 != x4) { // zeigt Servo0 aus Buffer[2] 1..16..31 (x=4)
            n5x5_x4 = x4
            zeigeBIN(x4, ePlot.bin, 4)
        }
    }





    // zeigt Funkgruppe oder i²C Adresse im 5x5 Display binär an

    export enum ePlot {
        //% block="BIN 0..31"
        bin,
        //% block="HEX Zahl"
        hex,
        //% block="BCD Zahl"
        bcd
    }

    //% group="BIN" subcategory="Display 5x5" color=#54C9C9
    //% block="zeige ↕↕↕↕↕ %int %format ←x %x" weight=2
    //% x.min=0 x.max=4 x.defl=4
    export function zeigeBIN(int: number, format: ePlot, xLed: number) {
        int = Math.imul(int, 1) // 32 bit signed integer
        xLed = Math.imul(xLed, 1) // entfernt mögliche Kommastellen

        if (format == ePlot.bin && between(xLed, 0, 4)) {
            // pro Ziffer werden mit zeigeBIN immer 5 LEDs geschaltet 0..31
            if (n5x5_setClearScreen) {  // wenn vorher Image oder Text angezeigt wurde
                n5x5_setClearScreen = false
                basic.clearScreen()     // löschen und Funkgruppe in 01 ↕↕... wieder anzeigen
                zeigeFunkgruppe()       // !ruft zeigeBIN rekursiv auf!
            }
            for (let y = 4; y >= 0; y--) {
                if ((int % 2) == 1) { led.plot(xLed, y) } else { led.unplot(xLed, y) }
                int = int >> 1 // bitweise Division durch 2
            }
        } else {
            // bcd und hex zeigt von rechts nach links so viele Spalten an, wie die Zahl Ziffern hat
            // wenn die nächste Zahl weniger Ziffern hat, werden die links daneben nicht gelöscht
            // pro Ziffer werden mit zeigeBIN immer 5 LEDs geschaltet, die obere 2^4 ist immer aus
            while (int > 0 && between(xLed, 0, 4)) {
                if (format == ePlot.bcd) {
                    zeigeBIN(int % 10, ePlot.bin, xLed) // Ziffer 0..9
                    int = Math.idiv(int, 10) // 32 bit signed integer
                } else if (format == ePlot.hex) {
                    zeigeBIN(int % 16, ePlot.bin, xLed) // Ziffer 0..15
                    int = int >>> 4 // bitweise Division durch 16
                }
                xLed--
            }
        }
    }



    let n_showString = ""

    //% group="Text" subcategory="Display 5x5" color=#54C9C9
    //% block="zeige Text wenn geändert %text" weight=1
    //% text.shadow="btf_text"
    export function zeigeText(text: any) {
        let tx = convertToText(text)
        if (n_showString != tx) {
            n_showString = tx
            basic.showString(tx)
            n5x5_setClearScreen = true
        }
    }

    export function zeigeHex(n: number) {
        zeigeText(Buffer.fromArray([n]).toHex())
    }

    //% group="Image" subcategory="Display 5x5" color=#54C9C9
    //% block="zeige Bild %image" weight=1
    export function zeigeImage(image: Image) {
        image.showImage(0)
        n5x5_setClearScreen = true
    }

} // b-dispaly5x5.ts
