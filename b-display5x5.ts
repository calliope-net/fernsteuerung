
namespace btf { // b-dispaly5x5.ts


    // ========== group="25 LED Display" advanced=true color=#54C9C9

    export let n5x5_setClearScreen = true // wenn ein Image angezeigt wird, merken dass z.B. Funkgruppe wieder angezeigt werden muss

    let n5x5_x01y0 = 0 // Bit 5-4 Betriebsart in x=0-1 y=0
    // let n5x5_x2 = 0 // Bit 5-4-3-2-1 Motor Power in x=2
    // let n5x5_x3 = 0 // Motor 1..16..31
    //  let n5x5_x4 = 0 // Servo 1..16..31

    let a5x5_xBuffer = Buffer.create(5)

    // ↕↕...
    export function zeigeFunkgruppe() {
        /*  if (clearScreen) {
             basic.clearScreen()
             a5x5_xBuffer.fill(0, 2, 3)
             // n5x5_x2 = 0 // Bit 5-4-3-2-1 Motor Power in x=2
             // n5x5_x3 = 0 // Motor 1..16..31
             // n5x5_x4 = 0 // Servo 1..16..31
         } */
        let int = getStorageFunkgruppe()
        if (between(int, c_funkgruppe_min, c_funkgruppe_max)) {
            // zeigeBIN(getStorageFunkgruppe() << 4, ePlot.hex, 1) // 5x5 x=0-1 y=1-2-3-4 (y=0 ist bei hex immer aus)
            int = [0x10, 0x30, 0x70, 0xF0, 0xF1, 0xF3, 0xF7, 0xFF][getStorageFunkgruppe() & 0x07] // 3 Bit 0..7 als Index
        }
        // else
        //     zeigeBIN(getStorageFunkgruppe(), ePlot.hex, 1) // 5x5 x=0-1 y=1-2-3-4 (y=0 ist bei hex immer aus)
        zeigeBIN(int, ePlot.hex, 1) // 5x5 x=0-1 y=1-2-3-4 (y=0 ist bei hex immer aus)
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

        let xLed = 2 // 5x5 x=2 Motor Power außer m0
        if (m_Namespace == eNamespace.cb2 && isBetriebsart(buffer, e0Betriebsart.p2Fahrplan)) {
            // Betriebsart 20 Fahrplan nichts anzeigen siehe unten zeigeBINx234Fahrplan
        }
        // Mitte x=2 aktivierte Motoren aus Buffer anzeigen
        else {
            let int = 0
            if (getaktiviert(buffer, e3aktiviert.m1)) int |= 16
            if (getaktiviert(buffer, e3aktiviert.ma)) int |= 8
            if (getaktiviert(buffer, e3aktiviert.mb)) int |= 4
            if (getaktiviert(buffer, e3aktiviert.mc)) int |= 2
            if (getaktiviert(buffer, e3aktiviert.md)) int |= 1

            zeigeBIN(int, ePlot.bin, xLed)

            /*             n5x5_x2 = buffer[3]
                        // bitweise UND mit 2 4 8 16 32
                        if ((n5x5_x2 & e3aktiviert.m1) == e3aktiviert.m1) { led.plot(xLed, 0) } else { led.unplot(xLed, 0) }
                        if ((n5x5_x2 & e3aktiviert.ma) == e3aktiviert.ma) { led.plot(xLed, 1) } else { led.unplot(xLed, 1) }
                        if ((n5x5_x2 & e3aktiviert.mb) == e3aktiviert.mb) { led.plot(xLed, 2) } else { led.unplot(xLed, 2) }
                        if ((n5x5_x2 & e3aktiviert.mc) == e3aktiviert.mc) { led.plot(xLed, 3) } else { led.unplot(xLed, 3) }
                        if ((n5x5_x2 & e3aktiviert.md) == e3aktiviert.md) { led.plot(xLed, 4) } else { led.unplot(xLed, 4) }
             */
        }
    }


    //% group="BIN" subcategory="Display 5x5" color=#54C9C9
    //% block="zeige ...↕↕ Joystick %buffer" weight=7
    //% buffer.shadow="btf_sendBuffer19"
    export function zeige5x5Joystick(buffer: Buffer) {
        //if (isBetriebsart(buffer, e0Betriebsart.p0)) {
        // Betriebsart: 00 Fernsteuerung Motoren

        if (getaktiviert(buffer, e3aktiviert.m0)) {
            // fahren und lenken mit Servo
            zeigeBIN_map255(buffer[eBufferPointer.m0], 3)
            zeigeBIN(buffer[eBufferPointer.m0 + eBufferOffset.b1_Servo] & 0x1F, ePlot.bin, 4)
        }
        else if (m_Namespace == eNamespace.cb2 && btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)) {
            // Betriebsart 20 Fahrplan nichts anzeigen siehe unten zeigeBINx234Fahrplan
        }
        else {
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
                    zeigeBIN(buffer[eBufferPointer.md + eBufferOffset.b1_Servo] & 0x1F, ePlot.bin, 4)
                // zeigt als letztes direkt 0..31 an, mit Motor würde das gemapt werden
            }

            if (bin.length >= 2) {
                zeigeBIN_map255(bin[0], 3) // in 5x5 LED Matrix x=3
                zeigeBIN_map255(bin[1], 4) // in 5x5 LED Matrix x=4
            }
            else if (bin.length == 1) {
                zeigeBIN_map255(bin[0], 3) // in 5x5 LED Matrix x=3
                zeigeBIN(0, ePlot.bin, 4)
            }
            else {
                zeigeBIN(0, ePlot.bin, 3) // Display löschen, wenn nichts aktiviert ist
                zeigeBIN(0, ePlot.bin, 4)
            }

        }
        //} else {
        //    // andere Betriebsarten als '00 Fernsteuerung Motoren'
        //    zeigeBINx3Motor_map255(buffer[eBufferPointer.m0])
        //    zeigeBINx4Servo_31(buffer[eBufferPointer.m0 + eBufferOffset.b1_Servo] & 0x1F)
        //}
    }
    function zeigeBIN_map255(int255: number, xLed: number) {
        if (int255 == 0)
            zeigeBIN(0, ePlot.bin, xLed)
        else
            zeigeBIN(mapInt32(int255, 1, 255, 1, 31), ePlot.bin, xLed) // 8 Bit auf 5 Bit verteilen
    }
    /*
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
     } */

    export function zeigeBINx234Fahrplan(buffer: Buffer, iBufferPointer: btf.eBufferPointer) { // 4, 7, 10, 13, 16
        //  Math.pow(2, 4 - Math.idiv(iBufferPointer - 4, 3)) // 16, 8, 4, 2, 1

        let xLed = 2
        let int = a5x5_xBuffer[xLed]
        if (iBufferPointer == btf.eBufferPointer.m1) int |= 16 // { led.plot(xLed, 0) } //else { led.unplot(x, 0) }
        if (iBufferPointer == btf.eBufferPointer.ma) int |= 8 // { led.plot(xLed, 1) } //else { led.unplot(x, 1) }
        if (iBufferPointer == btf.eBufferPointer.mb) int |= 4 // { led.plot(xLed, 2) } //else { led.unplot(x, 2) }
        if (iBufferPointer == btf.eBufferPointer.mc) int |= 2 // { led.plot(xLed, 3) } //else { led.unplot(x, 3) }
        if (iBufferPointer == btf.eBufferPointer.md) int |= 1 // { led.plot(xLed, 4) } //else { led.unplot(x, 4) }

        zeigeBIN(int, ePlot.bin, xLed)
        zeigeBIN_map255(getByte(buffer, iBufferPointer, eBufferOffset.b0_Motor), 3)
        zeigeBIN(getByte(buffer, iBufferPointer, eBufferOffset.b1_Servo), ePlot.bin, 4)

        // zeigeBIN_map255(buffer[iBufferPointer + eBufferOffset.b0_Motor], 3)
        // zeigeBIN(buffer[iBufferPointer + eBufferOffset.b1_Servo] & 0x1F, ePlot.bin, 4)
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
    //% block="zeige ↕↕↕↕↕ %int %format ←x %xLed" weight=2
    //% xLed.min=0 xLed.max=4 xLed.defl=4
    export function zeigeBIN(int: number, format: ePlot, xLed: number) {
        int = Math.imul(int, 1) // 32 bit signed integer
        xLed = Math.imul(xLed, 1) // entfernt mögliche Kommastellen

        if (format == ePlot.bin && between(xLed, 0, 4)) {

            // pro Ziffer werden mit zeigeBIN immer 5 LEDs geschaltet 0..31
            if (n5x5_setClearScreen) {  // wenn vorher Image oder Text angezeigt wurde
                n5x5_setClearScreen = false
                a5x5_xBuffer.fill(0xFF) // mit ungültigen Werten füllen, die rekursiv wieder zu 0 werden
                for (let x = 4; x >= 0; x--) {
                    zeigeBIN(0, ePlot.bin, x)
                }
                // basic.clearScreen()     // löschen und Funkgruppe in 01 ↕↕... wieder anzeigen
                zeigeFunkgruppe()       // !ruft zeigeBIN rekursiv auf!
            }
            // nur bei Änderung
            if (a5x5_xBuffer[xLed] != int) {
                a5x5_xBuffer[xLed] = int

                for (let y = 4; y >= 0; y--) {
                    if ((int % 2) == 1) { led.plot(xLed, y) } else { led.unplot(xLed, y) }
                    int = int >> 1 // bitweise Division durch 2
                }
            }
        } else {
            // bcd und hex zeigt von rechts nach links so viele Spalten an, wie die Zahl Ziffern hat
            // wenn die nächste Zahl weniger Ziffern hat, werden die links daneben nicht gelöscht
            // pro Ziffer werden mit zeigeBIN immer 5 LEDs geschaltet, die obere 2^4 ist immer aus
            while (int > 0 && between(xLed, 0, 4)) {
                if (format == ePlot.bcd) {
                    zeigeBIN(int % 10, ePlot.bin, xLed) // Ziffer 0..9
                    int = Math.idiv(int, 10) // 32 bit signed integer
                } 
                else if (format == ePlot.hex) {
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

    // group="Image" subcategory="Display 5x5" color=#54C9C9
    // block="zeige Bild %image" weight=1
    /* export function zeigeImage(image: Image) {
        image.showImage(0)
        n5x5_setClearScreen = true
    } */

} // b-dispaly5x5.ts
