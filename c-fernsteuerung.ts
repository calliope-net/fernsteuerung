
namespace cb2 { // c-fernsteuerung.ts


    // ========== group="Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"

    //% group="00 Fernsteuerung mit Joystick (reagiert auf Sensoren)" subcategory="Fernsteuerung"
    //% block="00 Fahren und Lenken mit Joystick (MS:0) aus %buffer • lenken %lenkenProzent \\%" weight=8
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



    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="Sensor Ereignisse auslösen %buffer || • Start+ %start_cm cm • Pause %ms ms • I²C %i2c" weight=6
    //% buffer.shadow=btf_receivedBuffer19
    //% start_cm.defl=5
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseBufferEvents(buffer: Buffer, start_cm: number, ms = 25, i2c = eI2C.x22) {
        if (buffer) {

            /*  let spur_folgen =
                 btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) // 10 Programm fernstarten + B
                 && btf.getaktiviert(buffer, btf.e3aktiviert.mc) // MC-4 Spur folgen
 
             let hindernis_ausweichen =
                 !spur_folgen
                 && btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) // 10 Programm fernstarten + A
                 && btf.getaktiviert(buffer, btf.e3aktiviert.md) // MD-5 Hindernis ausweichen
  */

            // Events müssen auch mit on=false aufgerufen werden, damit das Programm beendet wird (Motor Stop)
            raiseAbstandEvent( // MD-5 Hindernis ausweichen ODER // MC-4 Spur folgen und Abstand Sensor aktiviert
                hindernis_ausweichen(buffer) || (spur_folgen(buffer) && btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand)),
                btf.getAbstand(buffer),
                btf.getAbstand(buffer) + start_cm,
                ms,
                1
            )

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

    function hindernis_ausweichen(buffer: Buffer) { // if (buffer) muss vor Aufruf erfolgen
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) // 10 Programm fernstarten + A
            && !btf.getaktiviert(buffer, btf.e3aktiviert.mc) // NOT ! MC-4 Spur folgen !
            && btf.getaktiviert(buffer, btf.e3aktiviert.md) // MD-5 Hindernis ausweichen
    }


    // ========== group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"


    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="%buffer 10 fernstarten && Start Bit %startBit" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.mc
    //% blockSetVariable=Spur_folgen
    export function set_Spur_folgen(buffer: Buffer, startBit: btf.e3aktiviert) {
        // Block (SetVariable) steht in Bluetooth receivedData
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) && btf.getaktiviert(buffer, startBit)
    }


    //  let n_spurfolgerBuffer_repeat = false

    //% group="10 Fernstarten Spur folgen" subcategory="Fernsteuerung"
    //% block="--10 <dauerhaft_Spurfolger> %dauerhaft_Spurfolger (MS:CD) aus %buffer • I²C Spursensor %i2c" weight=7
    //% dauerhaft_Spurfolger.shadow=toggleOnOff
    //% buffer.shadow=btf_receivedBuffer19
    /* export function dauerhaft_SpurfolgerBuffer(dauerhaft_Spurfolger: boolean, buffer: Buffer, i2cSpur: eI2C) {
        // Block steht in dauerhaft Schleife
        // Parameter blockSetVariable=<dauerhaft_Spurfolger> und Spur-Sensor wird in beispielSpurfolger16 direkt abgefragt (Pins)
        if (dauerhaft_Spurfolger) {
            beispielSpurfolger16(
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke),
                n_spurfolgerBuffer_repeat,
                btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                btf.getAbstand(buffer),
                i2cSpur
            )
            n_spurfolgerBuffer_repeat = true
        }
        else if (n_spurfolgerBuffer_repeat) {
            n_spurfolgerBuffer_repeat = false
            writeMotorenStop()
            writecb2RgbLed(eRgbLed.lh, Colors.Yellow, false)
        }
    } */


    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="Spur folgen %buffer <links_hell> %links_hell <rechts_hell> %rechts_hell <abstand_Stop> %abstand_Stop" weight=4
    //% buffer.shadow=btf_receivedBuffer19
    // links_hell.shadow=toggleYesNo
    // rechts_hell.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% inlineInputMode=inline
    export function buffer_Spur_folgen(buffer: Buffer, links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) {
        if (buffer)
            event_Spur_folgen(spur_folgen(buffer), links_hell, rechts_hell, abstand_Stop,
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke),
                btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                1
            )
    }

    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="10 <Spur_folgen> %spur_folgen <links_hell> %links_hell <rechts_hell> %rechts_hell <abstand_Stop> %abstand_Stop (MS:CD) aus %buffer" weight=4
    //% dauerhaft_Spurfolger.shadow=toggleOnOff
    // links_hell.shadow=toggleYesNo
    // rechts_hell.shadow=toggleYesNo
    // abstand_Stop.shadow=toggleYesNo
    //% buffer.shadow=btf_receivedBuffer19
    //% inlineInputMode=inline
    /* export function buffer_Spur_folgen(spur_folgen: boolean, links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean, buffer: Buffer) {
        if (buffer)
            event_Spur_folgen(spur_folgen, links_hell, rechts_hell, abstand_Stop,
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke),
                btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
                1
            )
    } */


    // ========== group="10 Fernstarten Hindernis ausweichen" subcategory="Fernsteuerung"

    //% group="10 Fernstarten Hindernis ausweichen" subcategory="Fernsteuerung"
    //% block="--%buffer 10 fernstarten && Start Bit %startBit" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.md
    //% blockSetVariable=dauerhaft_Ausweichen
    /* export function set_AbstandAusweichen(buffer: Buffer, startBit: btf.e3aktiviert) {
        // Block (SetVariable) steht in Bluetooth receivedData
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) && btf.getaktiviert(buffer, startBit)
    } */

    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="%buffer 10 fernstarten && Start Bit %startBit" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% startBit.defl=btf.e3aktiviert.md
    //% blockSetVariable=Hindernis_ausweichen
    export function set_Hindernis_ausweichen(buffer: Buffer, startBit: btf.e3aktiviert) {
        // Block (SetVariable) steht in Bluetooth receivedData
        return btf.isBetriebsart(buffer, btf.e0Betriebsart.p1Lokal) && btf.getaktiviert(buffer, startBit)
    }

    //% group="10 Programm fernstarten" subcategory="Fernsteuerung"
    //% block="10 <Hindernis_ausweichen> %hindernis_ausweichen <abstand_Stop> %abstand_Stop (MS:CD) aus %buffer" weight=7
    //% hindernis_ausweichen.shadow="toggleYesNo"
    //% abstand_Stop.shadow="toggleYesNo"
    //% buffer.shadow=btf_receivedBuffer19
    export function buffer_Hindernis_ausweichen(hindernis_ausweichen: boolean, abstand_Stop: boolean, buffer: Buffer) {
        // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
        // Parameter blockSetVariable=<dauerhaft_Ausweichen> und Sensor Ereignis <abstand_Stop>
        if (buffer) {
            event_Hindernis_ausweichen(
                hindernis_ausweichen,
                abstand_Stop,
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor), // MC vorwärts gerade
                btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor), // MD rückwärts lenken
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b1_Servo),
                btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b2_Fahrstrecke), // Pause Zehntelsekunden 10zs=1000ms
                1
            )
        }
    }


    // let n_AbstandAusweichen_gestartet = false

    //% group="10 Fernstarten Hindernis ausweichen" subcategory="Fernsteuerung"
    //% block="--10 <dauerhaft_Ausweichen> %dauerhaft_Ausweichen <abstand_Stop> %abstand_Stop (MS:CD) aus %buffer" weight=7
    //% dauerhaft_Ausweichen.shadow="toggleYesNo"
    //% abstand_Stop.shadow="toggleYesNo"
    //% buffer.shadow=btf_receivedBuffer19
    /*    export function dauerhaft_AbstandAusweichen(dauerhaft_Ausweichen: boolean, abstand_Stop: boolean, buffer: Buffer) {
           // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
           // Parameter blockSetVariable=<dauerhaft_Ausweichen> und Sensor Ereignis <abstand_Stop>
           if (buffer) {
               eventAbstandAusweichen(
                   dauerhaft_Ausweichen,
                   abstand_Stop,
                   btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor), // MC vorwärts gerade
                   btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                   btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor), // MD rückwärts lenken
                   btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b1_Servo),
                   btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b2_Fahrstrecke), // Pause Zehntelsekunden 10zs=1000ms
                   1
               )
           } */
    /* 
    
            if (dauerhaft_Ausweichen && buffer) {
    
                let rServo = btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b1_Servo)
                if (rServo == 0)
                    rServo = zufallServo16(1, 5, 27, 31, btf.btf_randomBoolean())
    
                beispielAbstandAusweichen(
                    n_AbstandAusweichen_gestartet,
                    abstand_Stop,
                    btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor), // MC vorwärts gerade
                    btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
                    btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor), // MD rückwärts lenken
                    rServo,
                    btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b2_Fahrstrecke) // Pause Zehntelsekunden 10zs=1000ms
                )
                n_AbstandAusweichen_gestartet = true
            }
            else if (n_AbstandAusweichen_gestartet) {
                n_AbstandAusweichen_gestartet = false
                writeMotorenStop()
            } */

    /*   } */



    // group="10 Fernstarten Spurfolger" subcategory="Fernsteuerung"
    // block="10 Spurfolger (MS:CD) aus %buffer • Wiederholung %repeat • I²C Spursensor %i2c" weight=4
    // buffer.shadow=btf_receivedBuffer19
    // repeat.shadow="toggleYesNo" repeat.defl=1
    /* export function spurfolgerBuffer(buffer: Buffer, repeat: boolean, i2cSpur: eI2C) {
        beispielSpurfolger16(
            btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b0_Motor),
            btf.getByte(buffer, btf.eBufferPointer.md, btf.eBufferOffset.b0_Motor),
            btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b1_Servo),
            btf.getByte(buffer, btf.eBufferPointer.mc, btf.eBufferOffset.b2_Fahrstrecke),
            repeat,
            btf.getSensor(buffer, btf.eBufferPointer.mc, btf.eSensor.b6Abstand),
            btf.getAbstand(buffer),
            i2cSpur
        )
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

                let i = btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo) // Anzahl Durchläufe gesamt
                if (i == 0)
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
        }
    }


} // c-fernsteuerung.ts
