
namespace cb2 { // c-fernsteuerung.ts


    // ========== group="Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="0 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="0 Fahren und Lenken mit Joystick aus %buffer || • lenken %lenkenProzent \\%" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function fahreJoystick(buffer: Buffer, lenkenProzent = 50) {

        if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p0Fahren) && btf.getaktiviert(buffer, btf.e3aktiviert.m0)) { // Betriebsart 00 mit Joystick fernsteuern

            let iBufferPointer = btf.eBufferPointer.m0

            if (btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand) // Abstandssensor aktiviert
                &&
                btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor) > 128 // Fahrtrichtung vorwärts
                &&
                readUltraschallAbstand() < btf.getAbstand(buffer)) { // Abstand messen

                writeMotorenStop()

                writecb2RgbLed(eRgbLed.lh, Colors.Red, true, true)
            }
            else if (btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur) // Spursensor aktiviert
                &&
                !readSpursensor(eDH.hell, eDH.hell, true)) { // schwarze Linie erkannt / nicht hell, hell

                writeMotorenStop()

                writecb2RgbLed(eRgbLed.rh, Colors.White, true, true)
            }
            // Stoßstange noch abfragen
            else {

                writeMotor128Servo16(
                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                    btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                    lenkenProzent
                )

                writecb2RgbLed(eRgbLed.lh, Colors.Yellow, btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand))

                writecb2RgbLed(eRgbLed.rh, Colors.White, btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur))
            }
        }
    }



    // ========== group="1 Programm fernstarten: Hindernis ausweichen" subcategory="Fernsteuerung"

    //% group="1 Programm fernstarten: Hindernis ausweichen" subcategory="Fernsteuerung"
    //% block="1 Abstand Sensor Ereignis auslösen %buffer || • Start+ %start_cm cm • Pause %ms ms" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% start_cm.defl=5
    //% ms.defl=25
    //% inlineInputMode=inline 
    //expandableArgumentMode="toggle"
    export function buffer_raiseAbstandEvent(buffer: Buffer, start_cm = 5, ms = 25) {
        if (buffer) {

            // Events müssen auch mit on=false aufgerufen werden, damit das Programm beendet wird (Motor Stop)
            raiseAbstandEvent( // MD-5 Hindernis ausweichen ODER // MC-4 Spur folgen und Abstand Sensor aktiviert
                hindernis_ausweichen(buffer) || (spur_folgen(buffer) && btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand)),
                btf.getAbstand(buffer),
                btf.getAbstand(buffer) + start_cm,
                ms,
                undefined, //  btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
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



    // ========== group="1 Programm fernstarten: Spur folgen" subcategory="Fernsteuerung"

    //% group="1 Programm fernstarten: Spur folgen" subcategory="Fernsteuerung"
    //% block="1 Spur Sensor Ereignis auslösen %buffer || • Pause %ms ms • I²C %i2c" weight=7
    //% buffer.shadow=btf_receivedBuffer19
    //% start_cm.defl=5
    //% ms.defl=25
    //% inlineInputMode=inline 
    //expandableArgumentMode="toggle"
    export function buffer_raiseSpurEvent(buffer: Buffer, ms = 25, i2c = eI2C.x22) {
        if (buffer) {

            // Events müssen auch mit on=false aufgerufen werden, damit das Programm beendet wird (Motor Stop)
            /*  receiver.raiseAbstandEvent( // MD-5 Hindernis ausweichen ODER // MC-4 Spur folgen und Abstand Sensor aktiviert
                 hindernis_ausweichen(buffer) || (spur_folgen(buffer) && btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand)),
                 btf.getAbstand(buffer),
                 btf.getAbstand(buffer) + start_cm,
                 ms,
                 btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                 1
             ) */

            raiseSpurEvent( // MC-4 Spur folgen
                spur_folgen(buffer),
                ms,
                i2c,
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
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke), // MC lenken Prozent (bei 0% steht der Motor bei Servo=31)
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
                btf.zeigeBIN(0, btf.ePlot.bin, 2) // mittlere LED Reihe x=2 löschen

                let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt
                if (i == 0)
                    i = 1 // 0=1x 1=1x 2=2x 3=3x ...

                for (i; i > 0; i--) {

                    for (let iBufferPointer = btf.eBufferPointer.m1; iBufferPointer < 19; iBufferPointer += 3) { // 4, 7, 10, 13, 16
                        let rStrecke = false
                        btf.zeigeBINx34Fahrplan5Strecken(buffer, iBufferPointer) // anzeigen im 5x5 Display

                        // fahreStrecke testet Gültigkeit der Parameter
                        // fahreStrecke wertet auch Encoder, Abstand- und Spur- Sensoren aus
                        rStrecke = fahreStreckeRet(
                            btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b0_Motor),
                            btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b1_Servo),
                            btf.getByte(buffer, iBufferPointer, btf.eBufferOffset.b2_Fahrstrecke),
                            btf.getSensor(buffer, iBufferPointer, btf.eSensor.b6Abstand),
                            btf.getAbstand(buffer),
                            btf.getSensor(buffer, iBufferPointer, btf.eSensor.b5Spur),
                            btf.getSensor(buffer, iBufferPointer, btf.eSensor.b7Impulse)
                        )
                        if (rStrecke)
                            btf.zeigeBIN_BufferPointer(iBufferPointer, 2)
                    } // for iBufferPointer
                } // for i
            }
            else if (n_fahrplanBuffer5Strecken_gestartet && !btf.getaktiviert(buffer, startBit)) { // m1 false
                n_fahrplanBuffer5Strecken_gestartet = false
                // btf.zeigeBIN(0, btf.ePlot.bin, 2)
                // btf.zeigeBIN(0, btf.ePlot.bin, 3)
                // btf.zeigeBIN(0, btf.ePlot.bin, 4)
            }
        } // 0x20 Fahrplan
        else {
            n_fahrplanBuffer5Strecken_gestartet = false // immer aus schalten wenn andere Betriebsart 
            // ! ACHTUNG passiert bei jedem Bluetooth receivedData ! wenn nicht Betriebsart 2 Fahrplan
            // weil das ständig aufgerufen wird, soll hier kein folgenschwerer Code stehen
        }
    }


} // c-fernsteuerung.ts
