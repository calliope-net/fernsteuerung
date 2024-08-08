
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



    // ========== group="Fernsteuerung 2 Motoren (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung 2 Motoren (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="00 Fahren 2 Motoren (M:AB) aus %buffer" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    export function fahre2Motoren(buffer: Buffer) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren) // Betriebsart 00 mit Joystick fernsteuern
            &&
            btf.getaktiviert(buffer, btf.e3aktiviert.ma)
            &&
            btf.getaktiviert(buffer, btf.e3aktiviert.mb)
        ) {

            let iBufferPointerA = btf.eBufferPointer.ma

            if (btf.getSensor(buffer, iBufferPointerA, btf.eSensor.b6Abstand) // Abstandssensor aktiviert
                &&
                btf.getByte(buffer, iBufferPointerA, btf.eBufferOffset.b0_Motor) > 128 // Fahrtrichtung vorwärts
                &&
                readUltraschallAbstand() < btf.getAbstand(buffer)) { // Abstand messen

                writeMotorenStop()

                writeRgbLed(eRgbLed.lh, Colors.Red, true, true)
            }
            else if (btf.getSensor(buffer, iBufferPointerA, btf.eSensor.b5Spur) // Spursensor aktiviert
                &&
                !readSpursensor(eDH.hell, eDH.hell, true)) { // schwarze Linie erkannt / nicht hell, hell

                writeMotorenStop()

                writeRgbLed(eRgbLed.rh, Colors.White, true, true)
            }
            // Stoßstange noch abfragen
            else {

                writeMotoren128(
                    btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor),
                    btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor)
                )

                writeRgbLed(eRgbLed.lh, Colors.Yellow, btf.getSensor(buffer, iBufferPointerA, btf.eSensor.b6Abstand))

                writeRgbLed(eRgbLed.rh, Colors.White, btf.getSensor(buffer, iBufferPointerA, btf.eSensor.b5Spur))
            }
        }
    }

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
    //% block="10 Spurfolger (MS:CD) aus %buffer • dauerhaft_Spurfolger: %dauerhaft_Spurfolger • I²C Spursensor %i2c" weight=7
    //% buffer.shadow=btf_receivedBuffer19
    //% dauerhaft_Spurfolger.shadow="toggleYesNo" repeat.defl=1
    export function dauerhaft_SpurfolgerBuffer(buffer: Buffer, dauerhaft_Spurfolger: boolean, i2cSpur: eI2C) {
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
        }

    }



    //% group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    //% block="10 Spurfolger (MS:CD) aus %buffer • Wiederholung %repeat • I²C Spursensor %i2c" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% repeat.shadow="toggleYesNo" repeat.defl=1
    export function spurfolgerBuffer(buffer: Buffer, repeat: boolean, i2cSpur: eI2C) {
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
    }



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



    // ========== group="20 Fahrplan (2 Teilstrecken • 2 Motoren) empfangen" subcategory="Fernsteuerung"

    let n_fahrplanBuffer2x2Motoren_gestartet = false

    //% group="20 Fahrplan (2 Teilstrecken • 2 Motoren) empfangen" subcategory="Fernsteuerung"
    //% block="20 Fahren 2 Strecken mit 2 Motoren (MS:AB CD) aus %buffer • Start Bit %startBit || • Encoder %checkEncoder" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.ma
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahrplanBuffer2x2Motoren(buffer: Buffer, startBit: btf.e3aktiviert, checkEncoder = true) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)) { // Betriebsart 20 Fahrplan senden

            if (!n_fahrplanBuffer2x2Motoren_gestartet && btf.getaktiviert(buffer, startBit)) { // ma true
                n_fahrplanBuffer2x2Motoren_gestartet = true
                btf.zeigeBIN(0, btf.ePlot.bin, 2) // x=2 löschen

                let hasEncoder = false
                if (checkEncoder)
                    hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

                let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt
                if (i == 0)
                    i = 1 // 0=1x 1=1x 2=2x 3=3x ...

                for (i; i > 0; i--) {

                    for (let iBufferPointer = btf.eBufferPointer.ma; iBufferPointer < 19; iBufferPointer += 6) { // 7ab, 13cd

                        btf.zeigeBINx234Fahrplan2x2Motoren(buffer, iBufferPointer) // anzeigen im 5x5 Display

                        let j = btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe einzeln
                        if (j == 0)
                            j = 1

                        for (j; j > 0; j--) {

                            if (hasEncoder) {
                                fahre2MotorenEncoder(
                                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                                    btf.getByte(buffer, iBufferPointer + 3, btf.eBufferOffset.b0_Motor),
                                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                                    btf.getByte(buffer, iBufferPointer + 3, btf.eBufferOffset.b2_Fahrstrecke),
                                    btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse)
                                )
                            }
                            else {
                                let zehntelsekunden = btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke)

                                if (btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse))
                                    zehntelsekunden /= n_EncoderFaktor

                                fahre2MotorenZeit(
                                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                                    btf.getByte(buffer, iBufferPointer + 3, btf.eBufferOffset.b0_Motor),
                                    zehntelsekunden,
                                    btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand),
                                    btf.getAbstand(buffer),
                                    btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur)
                                )
                            }
                        } // for j
                    } // for iBufferPointer
                } // for i
            }
            else if (n_fahrplanBuffer2x2Motoren_gestartet && !btf.getaktiviert(buffer, startBit)) { // m1 false
                n_fahrplanBuffer2x2Motoren_gestartet = false
                btf.zeigeBIN(0, btf.ePlot.bin, 2)
                btf.zeigeBIN(0, btf.ePlot.bin, 3)
                btf.zeigeBIN(0, btf.ePlot.bin, 4)
            }
        }
    }


} // c-fernsteuerung.ts
