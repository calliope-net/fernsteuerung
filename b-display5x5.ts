
namespace btf { // b-dispaly5x5.ts





    // ========== group="25 LED Display" advanced=true color=#54C9C9

    let n5x5_setClearScreen = true // wenn ein Image angezeigt wird, merken dass z.B. Funkgruppe wieder angezeigt werden muss

    export function setClearScreen() {
        n5x5_setClearScreen = true
    }

    //let n5x5_x01y0 = 0 // Bit 5-4 Betriebsart in x=0-1 y=0
    let a5x5_x01y0 = [false, false]
    let a5x5_xBuffer = Buffer.create(5)
    
    //% group="BIN" subcategory="LEDs, Display"
    //% block="zeige ↓↓... Funkgruppe" weight=8
    export function zeigeFunkgruppe() {
        let int = getStorageFunkgruppe()
        if (between(int, c_funkgruppe_min, c_funkgruppe_max)) {
            // zeigeBIN(getStorageFunkgruppe() << 4, ePlot.hex, 1) // 5x5 x=0-1 y=1-2-3-4 (y=0 ist bei hex immer aus)
            int = [0x10, 0x30, 0x70, 0xF0, 0xF1, 0xF3, 0xF7, 0xFF][getStorageFunkgruppe() & 0x07] // 3 Bit 0..7 als Index
        }
        zeigeBIN(int, ePlot.hex, 1) // 5x5 x=0-1 y=1-2-3-4 (y=0 ist bei hex immer aus)
    }


    //% group="BIN" subcategory="LEDs, Display"
    //% block="zeige ↑↑... x0 %x0y0 x1 %x1y0" weight=7
    //% x0y0.shadow=toggleOnOff
    //% x1y0.shadow=toggleOnOff
    export function zeige5x5Betriebsart(x0y0: boolean, x1y0: boolean) {
        if (a5x5_x01y0[0] !== x0y0 || a5x5_x01y0[1] !== x1y0) {
            a5x5_x01y0[0] = x0y0
            a5x5_x01y0[1] = x1y0

            if (a5x5_x01y0[0]) { led.plot(0, 0) } else { led.unplot(0, 0) }
            if (a5x5_x01y0[1]) { led.plot(1, 0) } else { led.unplot(1, 0) }
        }
    }


    //% group="BIN" subcategory="LEDs, Display"
    //% block="zeige ↑↑↕.. aktive Motoren %buffer" weight=6
    //% buffer.shadow="btf_sendBuffer19"
    export function zeige5x5Buffer(buffer: Buffer) {
        // 2 Bit oben links Betriebsart, die sind bei Funkgruppe frei
        //if (n5x5_x01y0 != (buffer[0] & 0x30)) {
        //    n5x5_x01y0 = (buffer[0] & 0x30) // Betriebsart 00 01 10 11 (x=0-1 y=0)
        //    if ((n5x5_x01y0 & 0x20) == 0x20) { led.plot(0, 0) } else { led.unplot(0, 0) }
        //    if ((n5x5_x01y0 & 0x10) == 0x10) { led.plot(1, 0) } else { led.unplot(1, 0) }
        //}
        zeige5x5Betriebsart((buffer[0] & 0x20) == 0x20, (buffer[0] & 0x10) == 0x10)

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
        }
    }


    //% group="BIN" subcategory="LEDs, Display"
    //% block="zeige ...↕↕ Joystick %buffer" weight=5
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

    export function zeigeBIN_BufferPointer(iBufferPointer: btf.eBufferPointer, xLed: number) {
        let int2 = a5x5_xBuffer[xLed]
        if (iBufferPointer == btf.eBufferPointer.m1) int2 |= 16
        if (iBufferPointer == btf.eBufferPointer.ma) int2 |= 8
        if (iBufferPointer == btf.eBufferPointer.mb) int2 |= 4
        if (iBufferPointer == btf.eBufferPointer.mc) int2 |= 2
        if (iBufferPointer == btf.eBufferPointer.md) int2 |= 1

        zeigeBIN(int2, ePlot.bin, xLed)
    }

    export function zeigeBINx34Fahrplan5Strecken(buffer: Buffer, iBufferPointer: btf.eBufferPointer) { // 4, 7, 10, 13, 16

        // zeigeBIN_BufferPointer(iBufferPointer, 2)

        zeigeBIN_map255(getByte(buffer, iBufferPointer, eBufferOffset.b0_Motor), 3) // map reduziert 8 Bit auf 5 Bit, damit es ins Display passt
        zeigeBIN(getByte(buffer, iBufferPointer, eBufferOffset.b1_Servo), ePlot.bin, 4) // Servo hat nur 5 Bit
    }

    export function zeigeBINx234Fahrplan2x2Motoren(buffer: Buffer, iBufferPointer: btf.eBufferPointer) {
        zeigeBIN_BufferPointer(iBufferPointer, 2)
        zeigeBIN_map255(getByte(buffer, iBufferPointer, eBufferOffset.b0_Motor), 3)// map reduziert 8 Bit auf 5 Bit, damit es ins Display passt
        zeigeBIN_map255(getByte(buffer, iBufferPointer + 3, eBufferOffset.b0_Motor), 4)
    }


    // zeigt Funkgruppe oder i²C Adresse im 5x5 Display binär an

    export enum ePlot {
        //% block="BIN 0..31"
        bin,
        //% block="HEX Zahl"
        hex,
        //% block="BCD Zahl"
        bcd,
        //% block="BIN 0..255"
        map
    }

    //% group="BIN" subcategory="LEDs, Display"
    //% block="zeige ↕↕↕↕↕ %int %format ←x %xLed" weight=1
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
                a5x5_x01y0 = [false, false] // n5x5_x01y0 = 0 // Betriebsart auch neu anzeigen nach clearScreen
            }
            // nur bei Änderung
            if (a5x5_xBuffer[xLed] != int) {
                a5x5_xBuffer[xLed] = int

                for (let y = 4; y >= 0; y--) {
                    if ((int % 2) == 1) { led.plot(xLed, y) } else { led.unplot(xLed, y) }
                    int = int >> 1 // bitweise Division durch 2
                }
            }
        }
        else if (format == ePlot.map) {
            if (int == 0)
                zeigeBIN(0, ePlot.bin, xLed)
            else
                zeigeBIN(mapInt32(int, 1, 255, 1, 31), ePlot.bin, xLed) // 8 Bit auf 5 Bit verteilen
        }
        else {
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

    // group="BIN" subcategory="LEDs, Display"
    // block="zeige ↕↕↕↕↕ %int255 map255 ←x %xLed" weight=2
    // int255.min=0 int255.max=255 
    // xLed.min=0 xLed.max=4 xLed.defl=4
    function zeigeBIN_map255(int255: number, xLed: number) {
        if (int255 == 0)
            zeigeBIN(0, ePlot.bin, xLed)
        else
            zeigeBIN(mapInt32(int255, 1, 255, 1, 31), ePlot.bin, xLed) // 8 Bit auf 5 Bit verteilen
    }


    let n_showString = ""

    //% group="Text" subcategory="LEDs, Display"
    //% block="zeige Text wenn geändert %text" weight=1
    //% text.shadow="btf_text"
    export function zeigeText(text: any) {
        let tx = convertToText(text)
        if (n_showString != tx) {
            n_showString = tx
            basic.showString(tx)
            setClearScreen()
        }
    }

    export function zeigeHexFehler(n: number) {
        // zeigeText(Buffer.fromArray([n]).toHex())
        zeigeBIN(n, ePlot.hex, 4)
    }


} // b-dispaly5x5.ts
