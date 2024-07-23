
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



} // c-fernsteuerung.ts
