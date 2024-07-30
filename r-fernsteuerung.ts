
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


} // r-fernsteuerung.ts
