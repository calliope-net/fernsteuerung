
namespace receiver { // r-fernsteuerung.ts

    // ========== group="0 Fernsteuerung oder 2 Fahrplan (Abstand Sensor Motor Stop auslösen)" subcategory="Fernsteuerung"

    enum eAbstandSensorAktiviert { aus, p0Fahren, p2Fahrplan, plFahrplan }

    let n_AbstandSensorAktiviert = eAbstandSensorAktiviert.aus // für 0 Fernsteuerung oder 2 Fahrplan

    //% group="0 Fernsteuerung oder 2 Fahrplan (in dauerhaft Schleife Motor Stop auslösen)" subcategory="Fernsteuerung"
    //% block="0 2 Abstand Sensor Stop auslösen %buffer || • 0 Joystick %on0Fahren • 2 Fahrplan %on2Fahrplan • Pause %ms ms" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% on0Fahren.shadow=toggleOnOff on0Fahren.defl=1
    //% on2Fahrplan.shadow=toggleOnOff on2Fahrplan.defl=1
    //% ms.defl=25
    //% inlineInputMode=inline 
    export function buffer_raiseAbstandMotorStop(buffer: Buffer, p0Fahren = true, p2Fahrplan = true, plFahrplan = false, stop_cm = 30, ms = 25) {
        if (plFahrplan && selectAbstandSensorConnected()) {
            n_AbstandSensorAktiviert = eAbstandSensorAktiviert.plFahrplan
            n_StreckeStop = raiseAbstandMotorStop(stop_cm, ms) // r-sensorevents.ts
        }
        else if (buffer && (p0Fahren || p2Fahrplan) && selectAbstandSensorConnected()) {

            // let motorRichtungVor = true // true Fahrtrichtung vorwärts oder Stop (128)
            // let stop_cm = 0

            if (p0Fahren
                && btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)          // Betriebsart 00 mit Joystick fernsteuern
                && btf.getaktiviert(buffer, btf.e3aktiviert.m0)                 // Motor M0+Servo M1 (Fahren und Lenken)
                && btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) // Abstand Sensor aktiviert
            ) {
                n_AbstandSensorAktiviert = eAbstandSensorAktiviert.p0Fahren
                // motorRichtungVor = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) >= c_MotorStop // Fahrtrichtung vorwärts
                stop_cm = btf.getAbstand(buffer)
            }
            else if (p2Fahrplan
                && btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)          // Betriebsart 00 mit Joystick fernsteuern
                && btf.getaktiviert(buffer, n_fahrplanStartBit)                 // Motor M0+Servo M1 (Fahren und Lenken)
                && btf.getSensor(buffer, n_fahrplanBufferPointer, btf.eSensor.b6Abstand) // Abstand Sensor aktiviert
            ) {
                n_AbstandSensorAktiviert = eAbstandSensorAktiviert.p2Fahrplan
                //  motorRichtungVor = btf.getByte(buffer, n_fahrplanBufferPointer, btf.eBufferOffset.b0_Motor) >= c_MotorStop // Fahrtrichtung vorwärts
                stop_cm = btf.getAbstand(buffer)
            }
            else {
                n_AbstandSensorAktiviert = eAbstandSensorAktiviert.aus
            }


            /*   let onFahren = btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)          // Betriebsart 00 mit Joystick fernsteuern
                  && btf.getaktiviert(buffer, btf.e3aktiviert.m0)                 // Motor M0+Servo M1 (Fahren und Lenken)
                  && btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) // Abstand Sensor aktiviert
                  && btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) >= c_MotorStop // Fahrtrichtung vorwärts
  
              let onFahrplan = btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)          // Betriebsart 00 mit Joystick fernsteuern
                  && btf.getaktiviert(buffer, n_fahrplanStartBit)                 // Motor M0+Servo M1 (Fahren und Lenken)
                  && btf.getSensor(buffer, n_fahrplanBufferPointer, btf.eSensor.b6Abstand) // Abstand Sensor aktiviert
                  && btf.getByte(buffer, n_fahrplanBufferPointer, btf.eBufferOffset.b0_Motor) >= c_MotorStop // Fahrtrichtung vorwärts
   */

            //  stop_cm = btf.getAbstand(buffer)


            if (n_AbstandSensorAktiviert != eAbstandSensorAktiviert.aus) // && motorRichtungVor
                n_AbstandStop = raiseAbstandMotorStop(stop_cm, ms) // r-sensorevents.ts
            else
                n_AbstandStop = false

            /*  if (raiseAbstandMotorStop(stop_cm, ms))
                 n_AbstandStop = true // bei true wurde Motor bereits gestoppt
             else
                 n_AbstandStop = false */
        }
        else {
            n_AbstandSensorAktiviert = eAbstandSensorAktiviert.aus
            n_AbstandStop = false
            n_StreckeStop = false // r-strecken.ts
        }
    }



    // ========== group="0 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    export let n_AbstandStop = false // außerhalb der function, damit der Wert gespeichert bleibt
    let n_SpurStop = false

    //% group="0 Fernsteuerung mit Joystick (Abstand Sensor mit Stop Block oben)" subcategory="Fernsteuerung"
    //% block="0 Fahren und Lenken mit Joystick (M:01ABCD S:0) aus %buffer " weight=5
    //% buffer.shadow="btf_receivedBuffer19"
    export function fahreJoystick(buffer: Buffer) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren)) { // Betriebsart 00 mit Joystick fernsteuern

            // Motor M0+Servo M1 (Fahren und Lenken)
            if (btf.getaktiviert(buffer, btf.e3aktiviert.m0)) {

                let ledb = Colors.Off
                let ledc = Colors.Off

                //let bAbstand = n_AbstandSensorAktiviert == eAbstandSensorAktiviert.p0Fahren //btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b6Abstand) && selectAbstandSensorConnected()
                //let bRichtung_vor = false
                //let cmAbstandSensor = 0
                // zuerst Test ob Sensor aktiv, erst danach Events registrieren
                let bSpurSensorAktiviert = btf.getSensor(buffer, btf.eBufferPointer.m0, btf.eSensor.b5Spur) // hier keine Spur-Events && spurSensorRegisterEvents()

                // nur LEDs schalten und Abstandssensor lesen
                /* if (bAbstand) {
                    // btf.setLedColors(btf.eRgbLed.b, 0x808000, bAbstand) // nicht blinken, bringt I²C Sensor durcheinender
                    // btf.setLedColors(btf.eRgbLed.c, 0x404040, bSpur)
                    //bRichtung_vor = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor) > c_MotorStop // Fahrtrichtung vorwärts
                    //cmAbstandSensor = selectAbstand_cm(true) // immer messen, auch bei Stop, damit der kleiner werdende Wert erkannt wird
                    ledb = 0x808000
                    if (bSpur)
                        ledc = 0x404040
                }
                else if (bSpur) {
                    // btf.setLedColors(btf.eRgbLed.b, getSpurLinks(eDH.hell) ? 0x404040 : Colors.White)
                    // btf.setLedColors(btf.eRgbLed.c, getSpurRechts(eDH.hell) ? 0x404040 : Colors.White)
                    // btf.setLedColors(btf.eRgbLed.b, Colors.White, getSpurLinks(eDH.hell)) // pinSpurlinks(eDH.hell)
                    // btf.setLedColors(btf.eRgbLed.c, Colors.White, getSpurRechts(eDH.hell)) // pinSpurrechts(eDH.hell)
                    ledb = getSpurLinks(eDH.hell) ? 0x404040 : Colors.White
                    ledc = getSpurRechts(eDH.hell) ? 0x404040 : Colors.White
                } */
                /* else {
                    btf.setLedColors(btf.eRgbLed.b, Colors.Off, false)
                    btf.setLedColors(btf.eRgbLed.c, Colors.Off, false)
                    // Spur auch anzeigen, wenn Sensor nicht aktiv (dunkelweiß)
                    // btf.setLedColors(btf.eRgbLed.b, 0x404040, getSpurLinks(eDH.hell)) // pinSpurlinks(eDH.hell)
                    // btf.setLedColors(btf.eRgbLed.c, 0x404040, getSpurRechts(eDH.hell)) //pinSpurrechts(eDH.hell)
                } */

                // Abstandssensor auswerten
                /* if (bAbstand && bRichtung_vor && (cmAbstandSensor <= btf.getAbstand(buffer))) {
                    n_AbstandStop = true
                    ledb = Colors.Red
                } else if (!bAbstand || !bRichtung_vor)
                    n_AbstandStop = false */


                // Spursensor auswerten
                /* if (bSpur && (getSpurLinks(eDH.dunkel) || getSpurRechts(eDH.dunkel))) { //  if (bSpur && (pinSpurlinks(eDH.dunkel) || pinSpurrechts(eDH.dunkel)))
                    n_SpurStop = true
                    ledc = Colors.White
                } else if (!bSpur)
                    n_SpurStop = false */

                if (bSpurSensorAktiviert && getSpurLinks(eDH.dunkel)) {
                    n_SpurStop = true
                    ledb = Colors.White // dunkel
                    ledc = getSpurRechts(eDH.dunkel) ? Colors.White : 0x404040
                } else if (bSpurSensorAktiviert && getSpurRechts(eDH.dunkel)) {
                    n_SpurStop = true
                    ledb = 0x404040 // hell
                    ledc = Colors.White // dunkel
                } else if (bSpurSensorAktiviert) { // hell hell
                    ledb = 0x404040
                    ledc = 0x404040
                } else              // !bSpur
                    n_SpurStop = false // erst wieder fahren, nachdem bSpur aus geschaltet wurde


                if (n_AbstandSensorAktiviert == eAbstandSensorAktiviert.p0Fahren)
                    if (n_AbstandStop) { // aus dem Ereignis
                        ledb = Colors.Red
                    } else /* if (bAbstand) */ {
                        ledb = 0x808000
                    }
                else {
                    // ledb bleibt aus oder zeigt Spur an
                }


                if (!n_AbstandStop && !n_SpurStop) {
                    // Motor M0+Servo M1 (Fahren und Lenken)
                    selectMotor(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor))
                    pinServo16(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo))
                } else {
                    selectMotor(c_MotorStop)
                }
                btf.setLedColors(btf.eRgbLed.b, ledb)
                btf.setLedColors(btf.eRgbLed.c, ledc)
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
    let n_fahrplanStartBit: btf.e3aktiviert
    let n_fahrplanBufferPointer: btf.eBufferPointer // wird in dauerhaft Schleife im anderen Thread ausgewertet

    //% group="2 Fahrplan (5 Teilstrecken) empfangen (Abstand Sensor mit Stop Block oben)" subcategory="Fernsteuerung"
    //% block="2 Fahren Strecke 1-5 (MS:1ABCD) aus %buffer • Start Bit %startBit" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.m1
    export function fahrplanBuffer5Strecken(buffer: Buffer, startBit: btf.e3aktiviert) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)) { // Betriebsart 20 Fahrplan senden

            if (!n_fahrplanBuffer5Strecken_gestartet && btf.getaktiviert(buffer, startBit)) { // m1 true
                n_fahrplanBuffer5Strecken_gestartet = true
                n_fahrplanStartBit = startBit
                btf.zeigeBIN(0, btf.ePlot.bin, 2)

                let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt in m0-Servo
                if (i == 0) // 0 wie 1 behandeln = 1 Durchlauf
                    i = 1 // 0=1x 1=1x 2=2x 3=3x ...

                for (i; i > 0; i--) {

                    for (n_fahrplanBufferPointer = btf.eBufferPointer.m1; n_fahrplanBufferPointer < 19; n_fahrplanBufferPointer += 3) { // 4, 7, 10, 13, 16

                        btf.zeigeBINx234Fahrplan5Strecken(buffer, n_fahrplanBufferPointer) // anzeigen im 5x5 Display

                        // fahreStrecke testet Gültigkeit der Parameter
                        // fahreStrecke wertet auch Encoder, Abstand- und Spur- Sensoren aus
                        fahreStrecke( // r-strecken.ts
                            btf.getByte(buffer, n_fahrplanBufferPointer, btf.eBufferOffset.b0_Motor),
                            btf.getByte(buffer, n_fahrplanBufferPointer, btf.eBufferOffset.b1_Servo),
                            btf.getByte(buffer, n_fahrplanBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                            btf.getSensor(buffer, n_fahrplanBufferPointer, btf.eSensor.b6Abstand),
                            btf.getAbstand(buffer),
                            //btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur),
                            btf.getSensor(buffer, n_fahrplanBufferPointer, btf.eSensor.b7Impulse),
                            true
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
