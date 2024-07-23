
namespace cb2 { // c-fernsteuerung.ts


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
            !readSpursensor(eDH.hell, eDH.hell, true)) { // schwarze Linie erkannt / nicht hell, hell

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



} // c-fernsteuerung.ts
