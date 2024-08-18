
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
                    setLedColors(eRGBled.b, Colors.White, getSpurLinks(eDH.hell)) // pinSpurlinks(eDH.hell)
                    setLedColors(eRGBled.c, Colors.White, getSpurRechts(eDH.hell)) // pinSpurrechts(eDH.hell)
                }
                else { // Spur auch anzeigen, wenn Sensor nicht aktiv (dunkelweiß)
                    setLedColors(eRGBled.b, 0x404040, getSpurLinks(eDH.hell)) // pinSpurlinks(eDH.hell)
                    setLedColors(eRGBled.c, 0x404040, getSpurRechts(eDH.hell)) //pinSpurrechts(eDH.hell)
                }

                // Abstandssensor auswerten
                if (bAbstand && bRichtung_vor && (cmAbstandSensor <= btf.getAbstand(buffer)))
                    n_AbstandStop = true
                else if (!bAbstand || !bRichtung_vor)
                    n_AbstandStop = false

                // Spursensor auswerten
                if (bSpur && (getSpurLinks(eDH.dunkel) || getSpurRechts(eDH.dunkel))) //  if (bSpur && (pinSpurlinks(eDH.dunkel) || pinSpurrechts(eDH.dunkel)))
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



    // ========== group="10 Programm fernstarten" subcategory="Fernsteuerung"



    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="Sensor Ereignisse auslösen %buffer || • Start+ %start_cm cm • Pause %ms ms" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% start_cm.defl=5
    //% ms.defl=25
    //% inlineInputMode=inline expandableArgumentMode="toggle"
    export function raiseBufferEvents(buffer: Buffer, start_cm = 5, ms = 25) {
        if (buffer) {

            // Events müssen auch mit on=false aufgerufen werden, damit das Programm beendet wird (Motor Stop)
            raiseAbstandEvent( // MD-5 Hindernis ausweichen ODER // MC-4 Spur folgen und Abstand Sensor aktiviert
                hindernis_ausweichen(buffer) || (spur_folgen(buffer) && btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand)),
                btf.getAbstand(buffer),
                btf.getAbstand(buffer) + start_cm,
                ms,
                btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                1
            )

            raiseSpurEvent( // MC-4 Spur folgen
                spur_folgen(buffer),
                ms,
                1
            )
        }
    }

    function spur_folgen(buffer: Buffer) { // if (buffer) muss vor Aufruf erfolgen
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) // 10 Programm fernstarten + B
            && btf.getaktiviert(buffer, btf.e3aktiviert.mc) // MC-4 Spur folgen
    }

    function hindernis_ausweichen(buffer: Buffer) { // if (buffer) muss vor Aufruf erfolgen
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) // 10 Programm fernstarten + A
            && !btf.getaktiviert(buffer, btf.e3aktiviert.mc) // NOT ! MC-4 Spur folgen !
            && btf.getaktiviert(buffer, btf.e3aktiviert.md) // MD-5 Hindernis ausweichen
    }



    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="Spur folgen %buffer <links_hell> %links_hell <rechts_hell> %rechts_hell <abstand_Stop> %abstand_Stop" weight=6
    //% buffer.shadow=btf_receivedBuffer19
    // links_hell.shadow=toggleYesNo
    // rechts_hell.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% inlineInputMode=inline
    export function buffer_Spur_folgen(buffer: Buffer, links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) {
        if (buffer)
            event_Spur_folgen(spur_folgen(buffer), links_hell, rechts_hell,
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor), // MC vorwärts gerade = 192
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor), // MD vorwärts langsam fahren beim lenken = 160
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo), // MC lenken = 31
                abstand_Stop,
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b2_Fahrstrecke), // MD Pause nach abstand_Stop /  Zehntelsekunden 10zs=1000ms
                1
            )
    }

    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="Hindernis ausweichen %buffer <abstand_Stop> %abstand_Stop" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    // abstand_Stop.shadow="toggleYesNo"
    export function buffer_Hindernis_ausweichen(buffer: Buffer, abstand_Stop: boolean) {
        // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
        // Parameter blockSetVariable=<dauerhaft_Ausweichen> und Sensor Ereignis <abstand_Stop>
        if (buffer) {
            event_Hindernis_ausweichen(
                hindernis_ausweichen(buffer),
                abstand_Stop,
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor), // MC vorwärts gerade = 255
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo), // MC vorwärts lenken = 16
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor), // MD rückwärts lenken = 64
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b1_Servo), // MC rückwärts lenken = 0 ist Zufall
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b2_Fahrstrecke), // MD rückwärts Pause Zehntelsekunden 10zs=1000ms
                1
            )
        }
    }




    // ========== group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"

    //% group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    //% block="%buffer 10 fernstarten && Start Bit %startBit" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.mc
    //% blockSetVariable=dauerhaft_Spurfolger
  //  export function set_dauerhaft_Spurfolger(buffer: Buffer, startBit: btf.e3aktiviert) {
   //     return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) && btf.getaktiviert(buffer, startBit)
  //  }

  //  let n_spurfolgerBuffer_repeat = false

    //% group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    //% block="10 dauerhaft Spurfolger: %dauerhaft_Spurfolger (MS:CD) aus %buffer" weight=7
    //% dauerhaft_Spurfolger.shadow="toggleYesNo"
    //% buffer.shadow=btf_receivedBuffer19
  /*   export function dauerhaft_SpurfolgerBuffer(dauerhaft_Spurfolger: boolean, buffer: Buffer) {
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
