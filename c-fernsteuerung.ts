
namespace cb2 { // c-fahrstrecke.ts


    // ========== group="Strecke fahren (Fernsteuerung) reagiert auf Sensoren" subcategory="Fernsteuerung"

    //% group="Strecke fahren (Fernsteuerung) reagiert auf Sensoren" subcategory="Fernsteuerung"
    //% block="fahre mit Joystick aus Datenpaket %buffer lenken %prozent \\%" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% prozent.min=10 prozent.max=90 prozent.defl=50
    export function fahreJoystick(buffer: Buffer, prozent = 50) {
        let bufferPointer = btf.eBufferPointer.m0

        if (btf.getSensor(buffer, bufferPointer, btf.eSensor.b6Abstand) // Abstandssensor aktiviert
            &&
            btf.getByte(buffer, bufferPointer, btf.eBufferOffset.b0_Motor) > 128 // Fahrtrichtung vorwärts
            &&
            readUltraschallAbstand() < btf.getAbstand(buffer)) { // Abstand messen

            writeMotorenStop()

            writeRgbLed(eRgbLed.lh, Colors.Red, true, true)
        }
        else if (btf.getSensor(buffer, bufferPointer, btf.eSensor.b5Spur) // Spursensor aktiviert
            &&
            !readSpursensor(eDH.hell, eDH.hell, eI2C.x22)) { // schwarze Linie erkannt / nicht hell, hell

            writeMotorenStop()

            writeRgbLed(eRgbLed.rh, Colors.White, true, true)
        }
        // Stoßstange noch abfragen
        else {

            writeMotor128Servo16(
                btf.getByte(buffer, bufferPointer, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, bufferPointer, btf.eBufferOffset.b1_Servo),
                prozent
            )

            writeRgbLed(eRgbLed.lh, Colors.Yellow, btf.getSensor(buffer, bufferPointer, btf.eSensor.b6Abstand))

            writeRgbLed(eRgbLed.rh, Colors.White, btf.getSensor(buffer, bufferPointer, btf.eSensor.b5Spur))
        }
    }



    // ========== group="Strecke fahren (Fernprogrammierung)" subcategory="Fernsteuerung"

    //% group="Strecke fahren (Fernprogrammierung)" subcategory="Fernsteuerung"
    //% block="fahre Strecke 1-5 aus Datenpaket %buffer" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    export function fahreBuffer19(buffer: Buffer) {
        for (let iBufferPointer: btf.eBufferPointer = btf.eBufferPointer.p1; iBufferPointer < 19; iBufferPointer += 3) { // 4, 7, 10, 13, 16
            fahreStrecke(buffer.slice(iBufferPointer, 3))
        }
    }



    // ========== group="Strecke fahren (Stop nach • ⅒s)" subcategory="Fernsteuerung"

    //% group="Strecke fahren (Stop nach • ⅒s)" subcategory="Fernsteuerung"
    //% block="Strecke %buffer ⅒s" weight=6
    // block="fahre Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Zeit %zehntelsekunden" weight=4
    // motor.min=1 motor.max=255 motor.defl=128
    // motor.shadow=btf_speedPicker
    // servo.min=1 servo.max=31 servo.defl=16
    // servo.shadow=btf_protractorPicker
    // zehntelsekunden.shadow=cb2_zehntelsekunden
    //% buffer.shadow=btf_programmPicker
    export function fahreZeit(buffer: Buffer) {
        if (buffer.length == 3) {
            writeMotor128Servo16(buffer[0], buffer[1] & 0b00011111)
            basic.pause(buffer[2] * 100)
            writeMotorenStop() //   writeMotor128Servo16(c_MotorStop, 16)
        }
    }



    // ========== group="Strecke fahren (Stop nach • cm oder • ⅒s)" subcategory="Fernsteuerung"

    //% group="Strecke fahren (Stop nach • cm oder • ⅒s)" subcategory="Fernsteuerung"
    //% block="Strecke %buffer || lenken %prozent \\%" weight=4
    //% buffer.shadow=btf_programmSchritt
    //% prozent.min=10 prozent.max=90 prozent.defl=50
    // inlineInputMode=inline
    export function fahreStrecke(buffer: Buffer, prozent = 50) { // cm oder zehntelsekunden

        writeMotorenStop()

        if (buffer.length == 3 && buffer[0] != 0 && buffer[1] != 0 && buffer[2] != 0) {
            let hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

            writeMotor128Servo16(buffer[0], buffer[1] & 0b00011111, prozent)

            if (hasEncoder) {

                while (getEncoderMittelwert() < buffer[2] * n_EncoderFaktor) { // 31.25
                    // Pause eventuell bei hoher Geschwindigkeit motor verringern
                    // oder langsamer fahren wenn Rest strecke kleiner wird
                    basic.pause(100) // 200
                }
            }
            else {
                basic.pause(buffer[2] * 100)
            }

            writeMotorenStop() // cb2.writeMotor128Servo16(c_MotorStop, 16)
        }
    }





} // c-fahrstrecke.ts
