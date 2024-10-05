
namespace receiver { // r-fernsteuerung.ts

    // ========== group="0 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="0 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="0 Abstand Motor Stop auslösen %buffer || • Pause %ms ms" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% ms.defl=25
    export function buffer_raiseAbstandMotorStop(buffer: Buffer, ms = 25) {
        if (buffer) {
            let on: boolean
            let stop_cm: number

            on = btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)          // Betriebsart 00 mit Joystick fernsteuern
                && btf.getaktiviert(buffer, btf.e3aktiviert.m0)                 // Motor M0+Servo M1 (Fahren und Lenken)
                && btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) // Abstand Sensor aktiviert
                && btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) > c_MotorStop // Fahrtrichtung vorwärts

            stop_cm = btf.getAbstand(buffer)

            if (raiseAbstandMotorStop(on, stop_cm, ms))
                n_AbstandStop = true
        }
    }



    let n_AbstandStop = false // außerhalb der function, damit der Wert gespeichert bleibt
    let n_SpurStop = false

    //% group="0 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="0 Fahren und Lenken mit Joystick (M:01ABCD S:0) aus %buffer " weight=5
    //% buffer.shadow="btf_receivedBuffer19"
    export function fahreJoystick(buffer: Buffer) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)) { // Betriebsart 00 mit Joystick fernsteuern

            // Motor M0+Servo M1 (Fahren und Lenken)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m0)) {

                let bAbstand = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) && selectAbstandSensorConnected()
                let bRichtung_vor = false
                let cmAbstandSensor = 0
                // zuerst Test ob Sensor aktiv, erst danach Events registrieren
                let bSpur = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b5Spur) // hier keine Spur-Events && spurSensorRegisterEvents()

                // nur LEDs schalten und Abstandssensor lesen
                if (bAbstand) {
                    btf.setLedColors(btf.eRgbLed.b, Colors.Yellow, bAbstand) // nicht blinken, bringt I²C Sensor durcheinender
                    btf.setLedColors(btf.eRgbLed.c, Colors.White, bSpur)
                    bRichtung_vor = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) > c_MotorStop // Fahrtrichtung vorwärts
                    cmAbstandSensor = selectAbstand_cm(true) // immer messen, auch bei Stop, damit der kleiner werdende Wert erkannt wird
                }
                else if (bSpur) {
                    btf.setLedColors(btf.eRgbLed.b, getSpurLinks(eDH.hell) ? Colors.White : Colors.Purple)
                    btf.setLedColors(btf.eRgbLed.c, getSpurRechts(eDH.hell) ? Colors.White : Colors.Purple)
                    // btf.setLedColors(btf.eRgbLed.b, Colors.White, getSpurLinks(eDH.hell)) // pinSpurlinks(eDH.hell)
                    // btf.setLedColors(btf.eRgbLed.c, Colors.White, getSpurRechts(eDH.hell)) // pinSpurrechts(eDH.hell)
                }
                else {
                    btf.setLedColors(btf.eRgbLed.b, Colors.Off, false)
                    btf.setLedColors(btf.eRgbLed.c, Colors.Off, false)
                    // Spur auch anzeigen, wenn Sensor nicht aktiv (dunkelweiß)
                    // btf.setLedColors(btf.eRgbLed.b, 0x404040, getSpurLinks(eDH.hell)) // pinSpurlinks(eDH.hell)
                    // btf.setLedColors(btf.eRgbLed.c, 0x404040, getSpurRechts(eDH.hell)) //pinSpurrechts(eDH.hell)
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
                    if (n_AbstandStop)
                        btf.setLedColors(btf.eRgbLed.b, Colors.Red)
                }
            }


            // Motor M1 (Gabelstapler)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m1)) {
                receiver.dualMotor128(receiver.eDualMotor.M1, btf.getByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor))
            }



            // +++ Qwiic Motor A B C D +++

            // Qwiic Motor A B
            /* if (btf.getaktiviert(buffer, btf.e3aktiviert.ma)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, true) // Q Power nur beim ersten mal an schalten, aber nicht aus
               // receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
            }
            if (btf.getaktiviert(buffer, btf.e3aktiviert.mb)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, true)
               // receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
            } */
            if (qwiicMotorChipConnected(eQwiicMotorChip.ab))
                if (btf.getaktiviert(buffer, btf.e3aktiviert.ma) || btf.getaktiviert(buffer, btf.e3aktiviert.mb)) {
                    receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, true)
                    receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
                    receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
                }
                else /* if (qwiicMotorChipConnected(eQwiicMotorChip.ab)) */ {
                    receiver.qwiicMotor128(receiver.eQwiicMotor.ma, 0)
                    receiver.qwiicMotor128(receiver.eQwiicMotor.mb, 0)
                    receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.ab, false)
                }
            /* if (a_QwiicMotorChipPower[receiver.eQwiicMotorChip.ab]) {
                // wenn Power irgendwann an geschaltet wurde, dann Motor Buffer immer anwenden
                receiver.qwiicMotor128(receiver.eQwiicMotor.ma, btf.getByte(buffer, btf.eBufferPointer.ma, btf.eBufferOffset.b0_Motor))
                receiver.qwiicMotor128(receiver.eQwiicMotor.mb, btf.getByte(buffer, btf.eBufferPointer.mb, btf.eBufferOffset.b0_Motor))
            } */

            // Qwiic Motor C D
            /* if (btf.getaktiviert(buffer, btf.e3aktiviert.mc)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, true) // Q Power nur beim ersten mal an schalten, aber nicht aus
               // receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
            }
            if (btf.getaktiviert(buffer, btf.e3aktiviert.md)) {
                receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, true)
                // receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))
            } */
            if (qwiicMotorChipConnected(eQwiicMotorChip.cd))
                if (btf.getaktiviert(buffer, btf.e3aktiviert.mc) || btf.getaktiviert(buffer, btf.e3aktiviert.md)) {
                    receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, true)
                    receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
                    receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))
                }
                else /* if (qwiicMotorChipConnected(eQwiicMotorChip.cd)) */ {
                    receiver.qwiicMotor128(receiver.eQwiicMotor.mc, 0)
                    receiver.qwiicMotor128(receiver.eQwiicMotor.md, 0)
                    receiver.qwiicMotorChipPower(receiver.eQwiicMotorChip.cd, false)
                }
            /*  if (a_QwiicMotorChipPower[receiver.eQwiicMotorChip.cd]) {
                 // wenn Power irgendwann an geschaltet wurde, dann Motor Buffer immer anwenden
                 receiver.qwiicMotor128(receiver.eQwiicMotor.mc, btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor))
                 receiver.qwiicMotor128(receiver.eQwiicMotor.md, btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor))
             } */
        }
    }



    // ========== group="10 Programm fernstarten: Hindernis ausweichen" subcategory="Fernsteuerung"

    //% group="1 Programm fernstarten: Hindernis ausweichen" subcategory="Fernsteuerung"
    //% block="1 Abstand Sensor Ereignis auslösen %buffer || • Start+ %start_cm cm • Pause %ms ms" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% start_cm.defl=5
    //% ms.defl=25
    // inlineInputMode=inline 
    //expandableArgumentMode="toggle"
    export function buffer_raiseAbstandEvent(buffer: Buffer, start_cm = 5, ms = 25) {
        if (buffer) {

            // Events müssen auch mit on=false aufgerufen werden, damit das Programm beendet wird (Motor Stop)
            raiseAbstandEvent( // MD-5 Hindernis ausweichen ODER // MC-4 Spur folgen und Abstand Sensor aktiviert
                hindernis_ausweichen(buffer) || (spur_folgen(buffer) && btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand)),
                btf.getAbstand(buffer),
                btf.getAbstand(buffer) + start_cm,
                ms,
                // undefined, // btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                1
            )
        }
    }

    function hindernis_ausweichen(buffer: Buffer) { // if (buffer) muss vor Aufruf erfolgen
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) // 10 Programm fernstarten + A
            && !btf.getaktiviert(buffer, btf.e3aktiviert.mc) // NOT ! MC-4 Spur folgen !
            && btf.getaktiviert(buffer, btf.e3aktiviert.md) // MD-5 Hindernis ausweichen
    }

    //% group="1 Programm fernstarten: Hindernis ausweichen" subcategory="Fernsteuerung"
    //% block="1 Hindernis ausweichen %buffer <abstand_Stop> %abstand_Stop" weight=4
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



    // ========== group="10 Programm fernstarten: Spur folgen" subcategory="Fernsteuerung"

    //% group="1 Programm fernstarten: Spur folgen" subcategory="Fernsteuerung"
    //% block="1 Spur Sensor Ereignis auslösen %buffer || • Pause %ms ms" weight=7
    //% buffer.shadow=btf_receivedBuffer19
    //% start_cm.defl=5
    //% ms.defl=25
    // inlineInputMode=inline 
    //expandableArgumentMode="toggle"
    export function buffer_raiseSpurEvent(buffer: Buffer, ms = 25) {
        if (buffer) {

            // Events müssen auch mit on=false aufgerufen werden, damit das Programm beendet wird (Motor Stop)
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

    //% group="1 Programm fernstarten: Spur folgen" subcategory="Fernsteuerung"
    //% block="1 Spur folgen %buffer <links_hell> %links_hell <rechts_hell> %rechts_hell <abstand_Stop> %abstand_Stop" weight=3
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



    // ========== group="20 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fernsteuerung"

    let n_fahrplanBuffer5Strecken_gestartet = false

    //% group="2 Fahrplan (5 Teilstrecken) empfangen" subcategory="Fernsteuerung"
    //% block="2 Fahren Strecke 1-5 (MS:1ABCD) aus %buffer • Start Bit %startBit" weight=4
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
