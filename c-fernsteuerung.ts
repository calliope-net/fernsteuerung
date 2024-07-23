
namespace cb2 { // c-fernsteuerung.ts


    // ========== group="Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="Fahren und Lenken mit Joystick aus Datenpaket %buffer lenken %lenkenProzent \\%" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function fahreJoystick(buffer: Buffer, lenkenProzent = 50) {
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



    // ========== group="Fernsteuerung 2 Motoren (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung 2 Motoren (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="2 Motoren (AB) steuern aus Datenpaket %buffer" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    export function fahre2Motoren(buffer: Buffer) {
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


    //% group="2 Motoren (1 ↓ 128 ↑ 255) mit 2 Encodern steuern (Calli:bot 2E)" subcategory="Fernsteuerung"
    //% block="2 Motoren (1↓128↑255) | links %motorA rechts %motorB 2 Encoder (cm\\|Impulse) | links %encoderA rechts %encoderB Impulse %impulse" weight=5
    //% motorA.min=1 motorA.max=255 motorA.defl=192
    //% motorB.min=1 motorB.max=255 motorB.defl=64
    //% encoderA.min=10 encoderA.max=255 encoderA.defl=25
    //% encoderB.min=10 encoderB.max=255 encoderB.defl=25
    //% impulse.shadow=toggleYesNo
    // inlineInputMode=inline
    export function fahre2MotorenEncoder(motorA: number, motorB: number, encoderA: number, encoderB: number, impulse = false) {

        if (
            !(motorA == 0 && motorB == 0) // nicht beide 0, wäre wirkungslos
            &&
            (
                motorA != c_MotorStop && encoderA != 0 // mindestens einer muss Geschwindiegkeit und Strecken Länge haben
                ||
                motorB != c_MotorStop && encoderB != 0
            )
            &&
            writeEncoderReset() // Testet ob Encoder vorhanden und setzt beide Zähler auf 0
        ) {

            let encoderImpulseA = impulse ? encoderA : encoderA * n_EncoderFaktor
            let encoderImpulseB = impulse ? encoderB : encoderB * n_EncoderFaktor
            let timeoutEncoder = 500 // 500 * pause 2 (unten) = 1 s Timeout, wenn Encoder nicht zählt
            // 200 * pause 100 (unten) = 20 s Timeout, wenn Encoder nicht zählt

            let letzteEncoderWerte: number[] = [0, 0]
            let aEncoderWerte: number[]

            writeMotoren128(motorA, motorB) // Start

            while (motorA != c_MotorStop || motorB != c_MotorStop) {

                aEncoderWerte = readEncoderValues() // rückwärts sind die Werte negativ

                if (timeoutEncoder-- <= 0) { // alle 1s

                    if (letzteEncoderWerte[0] == aEncoderWerte[0] && letzteEncoderWerte[1] == aEncoderWerte[1]) {
                        // in 500 * pause 2 (unten) = 1 s Timeout hat sich kein Wert geändert
                        writeMotorenStop()
                        writeRgbLeds(Colors.Red, true)
                        // basic.pause(1000)
                        //  writeRgbLeds(Colors.Red, false) // aus nach 1 Sekunde
                        break
                    }
                    else { // mindestens ein Wert geändert - weiter fahren
                        letzteEncoderWerte[0] = aEncoderWerte[0]
                        letzteEncoderWerte[1] = aEncoderWerte[1]
                        timeoutEncoder = 500 // 500 * pause 2 (unten) = 1 s Timeout, wenn Encoder nicht zählt
                    }
                }


                if (motorA != c_MotorStop && Math.abs(aEncoderWerte[0]) > encoderImpulseA) {
                    motorA = c_MotorStop
                    writeMotoren128(c_MotorStop, 0) // 0: keine Änderung bei dem Motor
                }
                if (motorB != c_MotorStop && Math.abs(aEncoderWerte[1]) > encoderImpulseB) {
                    motorB = c_MotorStop
                    writeMotoren128(0, c_MotorStop)
                }

                // Pause eventuell bei hoher Geschwindigkeit motor verringern
                // oder langsamer fahren wenn Rest strecke kleiner wird
                // l=255 r=1: 800 Impulse (25*32) 1.4s = 1.75ms pro Impuls

                basic.pause(2) // 2 ms müsste jeden Impuls erfassen

            } // while
            writeMotorenStop()
        }
    }


    export function fahre2MotorenZeit(motorA: number, motorB: number, zeit: number) {



    }

} // c-fernsteuerung.ts
