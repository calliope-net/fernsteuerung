
namespace receiver { // r-fernsteuerung.ts

    // ========== group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    let n_AbstandStop = false
    let n_SpurStop = false

    //% group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="00 Fahren und Lenken mit Joystick (M:01ABCD S:0) aus %buffer " weight=5
    //% buffer.shadow="btf_receivedBuffer19"
    export function fahreJoystick(buffer: Buffer) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)) { // Betriebsart 00 mit Joystick fernsteuern

            // Motor M0+Servo M1 (Fahren und Lenken)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m0)) {

                let bAbstand = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) && selectAbstandSensorConnected()
                let bRichtung_vor = false
                let cmAbstandSensor = 0
                let bSpur = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b5Spur)

                // nur LEDs schalten und Abstandssensor lesen
                if (bAbstand) {
                    setLedColors(eRGBled.b, Colors.Yellow, bAbstand) // nicht blinken, bringt I²C Sensor durcheinender
                    setLedColors(eRGBled.c, Colors.White, bSpur)
                    bRichtung_vor = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) > c_MotorStop // Fahrtrichtung vorwärts
                    cmAbstandSensor = selectAbstand(true) // immer messen, auch bei Stop, damit der kleiner werdende Wert erkannt wird
                }
                else if (bSpur) {
                    setLedColors(eRGBled.b, Colors.White, getSpursensor(false, true)) // pinSpurlinks(eDH.hell)
                    setLedColors(eRGBled.c, Colors.White, getSpursensor(true, true)) // pinSpurrechts(eDH.hell)
                }
                else { // Spur auch anzeigen, wenn Sensor nicht aktiv (dunkelweiß)
                    setLedColors(eRGBled.b, 0x404040, getSpursensor(false, true)) // pinSpurlinks(eDH.hell)
                    setLedColors(eRGBled.c, 0x404040, getSpursensor(true, true)) //pinSpurrechts(eDH.hell)
                }

                // Abstandssensor auswerten
                if (bAbstand && bRichtung_vor && (cmAbstandSensor <= btf.getAbstand(buffer)))
                    n_AbstandStop = true
                else if (!bAbstand || !bRichtung_vor)
                    n_AbstandStop = false

                // Spursensor auswerten
                if (bSpur && (getSpursensor(false, false) || getSpursensor(true, false))) //  if (bSpur && (pinSpurlinks(eDH.dunkel) || pinSpurrechts(eDH.dunkel)))
                    n_SpurStop = true
                else if (!bSpur)
                    n_SpurStop = false

                if (!n_AbstandStop && !n_SpurStop) {
                    // Motor M0+Servo M1 (Fahren und Lenken)
                    selectMotor(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
                    pinServo16(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo))
                }
                else {
                    selectMotor(c_MotorStop)
                }
            }


            // Motor M1 (Gabelstapler)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m1)) {
                receiver.dualMotor128(receiver.eDualMotor.M1, btf.getByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor))
            }
            // Qwiic Motor A B
            if (btf.getaktiviert(buffer, btf.e3aktiviert.ma)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, true)
                receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
            }
            if (btf.getaktiviert(buffer, btf.e3aktiviert.mb)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, true)
                receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
            }
            // Qwiic Motor C D
            if (btf.getaktiviert(buffer, btf.e3aktiviert.mc)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, true)
                receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
            }
            if (btf.getaktiviert(buffer, btf.e3aktiviert.md)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, true)
                receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))
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
    //% block="10 dauerhaft Spurfolger: %dauerhaft_Spurfolger (MS:CD) aus %buffer" weight=7
    //% dauerhaft_Spurfolger.shadow="toggleYesNo"
    //% buffer.shadow=btf_receivedBuffer19
    export function dauerhaft_SpurfolgerBuffer(dauerhaft_Spurfolger: boolean, buffer: Buffer) {
        if (dauerhaft_Spurfolger) {
            beispielSpurfolger16(
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                n_spurfolgerBuffer_repeat,
                btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                btf.getAbstand(buffer)
            )
            n_spurfolgerBuffer_repeat = true
        }
        else if (n_spurfolgerBuffer_repeat) {
            n_spurfolgerBuffer_repeat = false
            selectMotor(c_MotorStop)
        }
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

                let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt in m0-Servo
                if (i == 0) // 0 wie 1 behandeln = 1 Durchlauf
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
        } // 0x20 Fahrplan
    }

} // r-fernsteuerung.ts
