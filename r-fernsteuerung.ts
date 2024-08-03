
namespace receiver { // r-fernsteuerung.ts

    let n_AbstandStop = false
    let n_SpurStop = false

    //% group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="Fahren und Lenken mit Joystick aus Datenpaket %buffer M:01ABCD S:0" weight=5
    //% buffer.shadow="btf_receivedBuffer19"
    export function sendM0(buffer: Buffer) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)) {

            // readQwiicUltrasonic()

            // Motor M0+Servo M1 (Fahren und Lenken)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m0)) {

                let bAbstand = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) && selectAbstandSensorConnected()
                let bRichtung_vor = false
                let cmAbstandSensor = 0
                let bSpur = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b5Spur)

                if (bAbstand) {
                    setLedColors(eRGBled.b, Colors.Yellow, bAbstand) // nicht blinken, bringt I²C Sensor durcheinender
                    setLedColors(eRGBled.c, Colors.White, bSpur)
                    bRichtung_vor = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) > c_MotorStop // Fahrtrichtung vorwärts
                    cmAbstandSensor = selectAbstand(true) // immer messen, auch bei Stop, damit der kleiner werdende Wert erkannt wird
                } else if (bSpur) {
                    setLedColors(eRGBled.b, Colors.White, pinSpurlinks(eDH.hell))
                    setLedColors(eRGBled.c, Colors.White, pinSpurrechts(eDH.hell))
                } else { // Spur auch anzeigen, wenn Sensor nicht aktiv
                    setLedColors(eRGBled.b, 0x404040, pinSpurlinks(eDH.hell))
                    setLedColors(eRGBled.c, 0x404040, pinSpurrechts(eDH.hell))
                }


                if (bAbstand && bRichtung_vor && (cmAbstandSensor <= btf.getAbstand(buffer))) {
                    n_AbstandStop = true
                } else if (!bAbstand || !bRichtung_vor)
                    n_AbstandStop = false

                if (bSpur && (pinSpurlinks(eDH.dunkel) || pinSpurrechts(eDH.dunkel))) {
                    n_SpurStop = true
                } else if (!bSpur)
                    n_SpurStop = false

                if (!n_AbstandStop && !n_SpurStop) {
                    // Motor M0+Servo M1 (Fahren und Lenken)
                    // dualMotor128(receiver.eDualMotor.M0, btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
                    selectMotor(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
                    pinServo16(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo))

                } else {
                    // dualMotor128(eDualMotor.M0, c_DualMotorStop)
                    selectMotor(c_MotorStop)
                }




                /*  if (btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) // Abstandssensor aktiviert
                     &&
                     selectAbstandSensorConnected()
                     &&
                     btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) > c_DualMotorStop // Fahrtrichtung vorwärts
                     &&
                     selectAbstand(true) < btf.getAbstand(buffer)) { // Abstand messen
 
                     dualMotor128(eDualMotor.M0, c_DualMotorStop) //  writeMotorenStop()
 
                     setLedColors(eRGBled.b, Colors.Red, true)
                     //rgbLEDs(eRGBled.b, Colors.Red, true)
                     // writeRgbLed(eRgbLed.lh, Colors.Red, true, true)
                 }
                 else if (btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b5Spur) // Spursensor aktiviert
                     &&
                     (pinSpurlinks(eDH.dunkel) || pinSpurrechts(eDH.dunkel))) { // schwarze Linie erkannt / nicht hell, hell
 
                     dualMotor128(eDualMotor.M0, c_DualMotorStop) //  writeMotorenStop()
 
                     setLedColors(eRGBled.b, Colors.White, true)
                     //writeRgbLed(eRgbLed.rh, Colors.White, true, true)
                 }
                 else {
                     // Motor M0+Servo M1 (Fahren und Lenken)
                     receiver.dualMotor128(receiver.eDualMotor.M0, btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
                     receiver.pinServo16(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo))
 
                     setLedColors(eRGBled.b, Colors.Red, false)
                 }
                  */
            }


            // Motor M1 (Gabelstapler)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m1)) {
                receiver.dualMotor128(receiver.eDualMotor.M1, btf.getByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor))
            }
            // Qwiic Motor A B
            receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, btf.getaktiviert(buffer, btf.e3aktiviert.ma) || btf.getaktiviert(buffer, btf.e3aktiviert.mb))
            receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
            // Qwiic Motor C D
            receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, btf.getaktiviert(buffer, btf.e3aktiviert.mc) || btf.getaktiviert(buffer, btf.e3aktiviert.md))
            receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
            receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))

        }

    }



    // ========== group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fernsteuerung"

    let n_fahrplanBuffer5Strecken_gestartet = false

    //% group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fernsteuerung"
    //% block="fahre Strecke 1-5 aus Datenpaket %buffer Start Bit %startBit" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.m1
    export function fahrplanBuffer5Strecken(buffer: Buffer, startBit: btf.e3aktiviert) {

        if (!n_fahrplanBuffer5Strecken_gestartet && btf.getaktiviert(buffer, startBit)) { // m1 true
            n_fahrplanBuffer5Strecken_gestartet = true
            btf.zeigeBIN(0, btf.ePlot.bin, 2)

            if (btf.getSensor(buffer, btf.eBufferPointer.m1, btf.eSensor.b6Abstand)) {
                readQwiicUltrasonic() // einmal vorher lesen, weil der erste Wert falsch sein kann
                basic.pause(100)
            }

            let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt in m0-Servo
            if (i == 0)
                i = 1 // 0=1x 1=1x 2=2x 3=3x ...

            for (i; i > 0; i--) {

                for (let iBufferPointer = btf.eBufferPointer.m1; iBufferPointer < 19; iBufferPointer += 3) { // 4, 7, 10, 13, 16
                    //  fahreStrecke(buffer.slice(iBufferPointer, 3))

                    /*  if (btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor) != 0
                         &&
                         btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo) != 0
                         &&
                         btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke) != 0) { */




                    btf.zeigeBINx234Fahrplan5Strecken(buffer, iBufferPointer) // anzeigen im 5x5 Display

                    fahreStrecke(
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                        btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand),
                        btf.getAbstand(buffer),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur),
                        btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse)
                    )
                    // }
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

} // r-fernsteuerung.ts
