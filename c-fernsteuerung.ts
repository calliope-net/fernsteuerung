
namespace cb2 { // c-fernsteuerung.ts


    // ========== group="Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="00 Fahren und Lenken mit Joystick (MS:0) aus %buffer • lenken %lenkenProzent \\%" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function fahreJoystick(buffer: Buffer, lenkenProzent = 50) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren) && btf.getaktiviert(buffer, btf.e3aktiviert.m0)) { // Betriebsart 00 mit Joystick fernsteuern

            let iBufferPointer = btf.eBufferPointer.m0

            if (btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand) // Abstandssensor aktiviert
                &&
                btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor) > 128 // Fahrtrichtung vorwärts
                &&
                readUltraschallAbstand() < btf.getAbstand(buffer)) { // Abstand messen

                writeMotorenStop()

                writeRgbLed(eRgbLed.lh, Colors.Red, true, true)
            }
            else if (btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur) // Spursensor aktiviert
                &&
                !readSpursensor(eDH.hell, eDH.hell, true)) { // schwarze Linie erkannt / nicht hell, hell

                writeMotorenStop()

                writeRgbLed(eRgbLed.rh, Colors.White, true, true)
            }
            // Stoßstange noch abfragen
            else {

                writeMotor128Servo16(
                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                    lenkenProzent
                )

                writeRgbLed(eRgbLed.lh, Colors.Yellow, btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand))

                writeRgbLed(eRgbLed.rh, Colors.White, btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur))
            }
        }
    }



    // ========== group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"

    //% group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    //% block="%buffer 10 fernstarten && Start Bit %startBit" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.mc
    //% blockSetVariable=dauerhaft_Spurfolger
    export function set_dauerhaft_Spurfolger(buffer: Buffer, startBit: btf.e3aktiviert) {
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) && btf.getaktiviert(buffer, startBit)
    }

    let n_spurfolgerBuffer_repeat = false

    //% group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    //% block="10 dauerhaft Spurfolger: %dauerhaft_Spurfolger (MS:CD) aus %buffer • I²C Spursensor %i2c" weight=7
    //% dauerhaft_Spurfolger.shadow="toggleYesNo"
    //% buffer.shadow=btf_receivedBuffer19
    export function dauerhaft_SpurfolgerBuffer(dauerhaft_Spurfolger: boolean, buffer: Buffer, i2cSpur: eI2C) {
        if (dauerhaft_Spurfolger) {
            beispielSpurfolger16(
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke),
                n_spurfolgerBuffer_repeat,
                btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                btf.getAbstand(buffer),
                i2cSpur
            )
            n_spurfolgerBuffer_repeat = true
        }
        else if (n_spurfolgerBuffer_repeat) {
            n_spurfolgerBuffer_repeat = false
            writeMotorenStop()
        }
    }



    //% group="10 Fernstarten Abstand ausweichen" subcategory="Fernsteuerung"
    //% block="%buffer 10 fernstarten && Start Bit %startBit" weight=6
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.md
    //% blockSetVariable=dauerhaft_Ausweichen
    export function set_AbstandAusweichen(buffer: Buffer, startBit: btf.e3aktiviert){
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) && btf.getaktiviert(buffer, startBit)
    }


    let n_AbstandAusweichen = false

    //% group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    //% block="10 dauerhaft Spurfolger: %dauerhaft_Spurfolger (MS:CD) aus %buffer • I²C Spursensor %i2c" weight=7
    //% dauerhaft_Spurfolger.shadow="toggleYesNo"
    //% buffer.shadow=btf_receivedBuffer19
    export function dauerhaft_AbstandAusweichen() {

    }



    // group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    // block="10 Spurfolger (MS:CD) aus %buffer • Wiederholung %repeat • I²C Spursensor %i2c" weight=4
    // buffer.shadow=btf_receivedBuffer19
    // repeat.shadow="toggleYesNo" repeat.defl=1
    /* export function spurfolgerBuffer(buffer: Buffer, repeat: boolean, i2cSpur: eI2C) {
        beispielSpurfolger16(
            btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
            btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
            btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
            btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke),
            repeat,
            btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
            btf.getAbstand(buffer),
            i2cSpur
        )
    } */



    // ========== group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fernsteuerung"

    let n_fahrplanBuffer5Strecken_gestartet = false

    //% group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fernsteuerung"
    //% block="20 Fahren Strecke 1-5 (MS:1ABCD) aus %buffer • Start Bit %startBit" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.m1
    export function fahrplanBuffer5Strecken(buffer: Buffer, startBit: btf.e3aktiviert) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)) { // Betriebsart 20 Fahrplan senden

            if (!n_fahrplanBuffer5Strecken_gestartet && btf.getaktiviert(buffer, startBit)) { // m1 true
                n_fahrplanBuffer5Strecken_gestartet = true
                btf.zeigeBIN(0, btf.ePlot.bin, 2)

                let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt
                if (i == 0)
                    i = 1 // 0=1x 1=1x 2=2x 3=3x ...

                for (i; i > 0; i--) {

                    for (let iBufferPointer = btf.eBufferPointer.m1; iBufferPointer < 19; iBufferPointer += 3) { // 4, 7, 10, 13, 16

                        btf.zeigeBINx234Fahrplan5Strecken(buffer, iBufferPointer) // anzeigen im 5x5 Display

                        // fahreStrecke testet Gültigkeit der Parameter
                        // fahreStrecke wertet auch Encoder, Abstand- und Spur- Sensoren aus
                        fahreStrecke(
                            btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                            btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                            btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                            btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand),
                            btf.getAbstand(buffer),
                            btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur),
                            btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse)
                        )
                    } // for iBufferPointer
                }
            }
            else if (n_fahrplanBuffer5Strecken_gestartet && !btf.getaktiviert(buffer, startBit)) { // m1 false
                n_fahrplanBuffer5Strecken_gestartet = false
                btf.zeigeBIN(0, btf.ePlot.bin, 2)
                btf.zeigeBIN(0, btf.ePlot.bin, 3)
                btf.zeigeBIN(0, btf.ePlot.bin, 4)
            }
        }
    }


} // c-fernsteuerung.ts
