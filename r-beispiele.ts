
namespace receiver { // r-beispiele.ts


    // ========== subcategory=Beispiele

    export function writeMotor128Servo16(motor128: number, y_1_16_31: number) {
        selectMotor(motor128)
        pinServo16(y_1_16_31) 
    }
    export function writeMotorenStop() {
        selectMotorStop(true)
       // pinServo16(16) // nicht lenken
    }

    // ========== group="Abstand Sensor Ereignis" subcategory=Beispiele

    let a_AbstandAusweichen_gestartet: boolean[] = [false, false] // index 0=block, 1=buffer in c-fernsteuerung.ts


    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="Hindernis ausweichen | gestartet %hindernis_ausweichen <abstand_Stop> %abstand_Stop Fahren (1↓128↑255) %vMotor Lenken (1↖16↗31) %vServo rückwärts Fahren %rMotor rückwärts Lenken %rServo rückwärts Lenken (0) = Zufall | Pause ⅒s %pause_zs" weight=6
    //% hindernis_ausweichen.shadow=toggleOnOff
    // abstand_Stop.shadow=toggleYesNo
    //% vMotor.min=1 vMotor.max=255 vMotor.defl=255
    //% vServo.min=1 vServo.max=31 vServo.defl=16
    //% rMotor.min=1 rMotor.max=255 rMotor.defl=64
    //% rServo.min=1 rServo.max=31 rServo.defl=0
    //% pause_zs.shadow=cb2_zehntelsekunden
    export function event_Hindernis_ausweichen(hindernis_ausweichen: boolean, abstand_Stop: boolean, vMotor: number, vServo: number, rMotor: number, rServo: number, pause_zs: number, index = 0) {
        // Block steht im Abstand Sensor Ereignis, das kommt aus der dauerhaft Schleife (Pin-Ereignis nur beim Laser Abstand Sensor)
        // Parameter abstand_Knopf_A und Sensor Ereignis <abstand_Stop>
        if (hindernis_ausweichen) {

            btf.reset_timer()

            if (abstand_Stop) { // Sensor Ereignis Abstand zu klein - rückwärts
                writeMotor128Servo16(rMotor, (rServo == 0) ? zufallServo16(1, 5, 27, 31) : rServo)
            }
            else { // Sensor Ereignis Abstand wieder groß - vorwärts
                basic.pause(pause_zs * 100)
                writeMotor128Servo16(vMotor, (vServo == 0) ? 16 : vServo)
            }
            a_AbstandAusweichen_gestartet[index] = true
        }
        else if (a_AbstandAusweichen_gestartet[index]) {
            a_AbstandAusweichen_gestartet[index] = false
            writeMotorenStop() // ganz am Ende
        }
    }









    //% group="Abstand Sensor Ereignis" subcategory=Beispiele
    //% block="Zufall Lenken (1↖16↗31) links %lvon - %lbis • rechts %rvon - %rbis || • l-r %lr" weight=5
    //% lvon.min=1 lvon.max=15 lvon.defl=1
    //% lbis.min=1 lbis.max=15 lbis.defl=5
    //% rvon.min=17 rvon.max=31 rvon.defl=27
    //% rbis.min=17 rbis.max=31 rbis.defl=31
    //% lr.shadow=btf_randomBoolean
    //% inlineInputMode=inline
    export function zufallServo16(lvon = 1, lbis = 5, rvon = 27, rbis = 31, lr?: boolean) {
        if (lr == undefined)
            lr = Math.randomBoolean() // btf.btf_randomBoolean()
        if (lr)
            return randint(lvon, lbis)
        else
            return randint(rvon, rbis)
    }

    let a_eventSpurfolger_gestartet: boolean[] = [false, false] // index 0=block, 1=buffer in c-fernsteuerung.ts



    //% group="Spur Sensor Ereignis" subcategory=Beispiele
    //% block="Spur folgen | gestartet %spur_folgen <links_hell> %links_hell <rechts_hell> %rechts_hell Fahren (1↓128↑255) %motor128 langsam Fahren %motorLenken Lenken (1↖16↗31) %servo16 <abstand_Stop> %abstand_Stop Pause ⅒s %pause_zs" weight=6
    //% spur_folgen.shadow=toggleOnOff
    // links_hell.shadow=toggleYesNo
    // rechts_hell.shadow=toggleYesNo
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% motorLenken.min=1 motorLenken.max=255 motorLenken.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    // lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
    // abstand_Stop.shadow=toggleYesNo
    //% pause_zs.shadow=cb2_zehntelsekunden
    // abstand.min=10 abstand.max=50 abstand.defl=30
    export function event_Spur_folgen(spur_folgen: boolean, links_hell: boolean, rechts_hell: boolean, motor128: number, motorLenken: number, servo16: number,  abstand_Stop: boolean, pause_zs: number, index = 0) {
        if (spur_folgen) {

            btf.reset_timer()

            if (!a_eventSpurfolger_gestartet[index]) { // ganz am Anfang
                m_lenken = undefined // gespeicherte Werte löschen
                m_inSpur = false     // beim ersten Durchlauf der Schleife
                // writecb2RgbLeds(Colors.Off, false) // alle 4 aus
            }

            if (abstand_Stop) {
                writeMotorenStop()
                // writecb2RgbLed(eRgbLed.lh, Colors.Red, true)
                basic.pause(pause_zs * 100)
                // basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden warten bis es wieder los fährt
            }
            else {

                let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

                if (!links_hell && !rechts_hell) { // dunkel dunkel
                    writeMotor128Servo16(motor128, 16) // nicht lenken
                    m_inSpur = true
                }
                else if (!links_hell && rechts_hell) { // dunkel hell
                    writeMotor128Servo16(motorLenken, 16 - lenken) // links lenken <16 = 1
                    if (m_inSpur)
                        m_lenken = 16 - lenken
                }
                else if (links_hell && !rechts_hell) { // hell dunkel
                    writeMotor128Servo16(motorLenken, 16 + lenken) // rechts lenken >16 = 31
                    if (m_inSpur)
                        m_lenken = 16 + lenken
                }
                else if (m_lenken) { // hell hell
                    writeMotor128Servo16(motorLenken, m_lenken) // lenken wie zuletzt gespeichert
                    m_inSpur = false // hell hell
                }
                else { // hell hell
                    writeMotor128Servo16(motor128, 16) // geradeaus fahren bis zur schwarzen Linie
                    m_inSpur = false // hell hell
                }

                // writecb2RgbLed(eRgbLed.lh, Colors.Yellow, abstandSensor)
            }
            a_eventSpurfolger_gestartet[index] = true
        }
        else if (a_eventSpurfolger_gestartet[index]) {
            a_eventSpurfolger_gestartet[index] = false
            writeMotorenStop() // ganz am Ende
            // writecb2RgbLed(eRgbLed.lh, Colors.Yellow, false)
        }
    }




    // ========== group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele

    let m_lenken: number
    let m_inSpur = false

    //% group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele
    //% block="Spurfolger | fahren (1↓128↑255) %motor128 langsam fahren %langsamfahren lenken (1↖16↗31) %servo16 Wiederholung %repeat Stop %stop bei Abstand < (cm) %abstand" weight=6
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    //% repeat.shadow="toggleYesNo" repeat.defl=1
    //% stop.shadow="toggleYesNo"
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    // inlineInputMode=inline
  /*   export function beispielSpurfolger16(motor128: number, langsamfahren: number, servo16: number, repeat: boolean, stop: boolean, abstand: number) {
        // repeat ist false beim ersten Durchlauf der Schleife, true bei Wiederholungen
        if (!repeat) {
            m_lenken = undefined // gespeicherte Werte löschen
            m_inSpur = false     // beim ersten Durchlauf der Schleife
            setLedColors(eRGBled.b, Colors.Off, false)
            setLedColors(eRGBled.c, Colors.Off, false)
        }

        if (stop && abstand > 0 && getQwiicUltrasonic(true) < abstand) {

            selectMotor(c_MotorStop)

            setLedColors(eRGBled.b, Colors.Red)
            basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden warten bis es wieder los fährt
        }
        else {

            let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

            if (getSpursensor(eDH.dunkel, eDH.dunkel)) {
                selectMotor(motor128)
                pinServo16(16) // nicht lenken
                m_inSpur = true
            }
            else if (getSpursensor(eDH.dunkel, eDH.hell)) {
                selectMotor(langsamfahren) // links lenken <16 = 1
                pinServo16(16 - lenken)
                if (m_inSpur)
                    m_lenken = 16 - lenken
            }
            else if (getSpursensor(eDH.hell, eDH.dunkel)) {
                selectMotor(langsamfahren)
                pinServo16(16 + lenken) // rechts lenken >16 = 31
                if (m_inSpur)
                    m_lenken = 16 + lenken
            }
            else if (m_lenken) { // hell hell
                selectMotor(langsamfahren)
                pinServo16(m_lenken) // lenken wie zuletzt gespeichert
                m_inSpur = false
            }
            else { // hell hell
                selectMotor(motor128) // schnell geradeaus fahren bis zur schwarzen Linie
                pinServo16(16) // nicht lenken
                m_inSpur = false
            }

            if (stop) {
                setLedColors(eRGBled.b, Colors.Yellow, stop) // gelb, wenn Abstandssensor aktiviert ist
                setLedColors(eRGBled.c, Colors.Off, false)
             // setLedColors(eRGBled.c, Colors.White, getSpursensor(eDH.hell, eDH.hell))
            }
            else {
                setLedColors(eRGBled.b, Colors.White, getSpurLinks(eDH.hell))  // wenn Abstandssensor nicht aktiviert ist
                setLedColors(eRGBled.c, Colors.White, getSpurRechts(eDH.hell)) // Spursensor links und rechts anzeigen
            }
        }
    } */


    //% group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele
    //% block="Spurfolger (Pin-Events) | links hell %links_hell rechts hell %rechts_hell Abstandssensor %stop fahren (1↓128↑255) %motor128 langsam fahren %langsamfahren lenken (1↖16↗31) %servo16 Wiederholung %repeat" weight=2
    //% stop.shadow="toggleYesNo"
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% repeat.shadow="toggleYesNo" repeat.defl=1
    // abstand.min=10 abstand.max=50 abstand.defl=20
    // inlineInputMode=inline
  /*   export function eventSpurfolger(links_hell: boolean, rechts_hell: boolean, stop: boolean, motor128: number, langsamfahren: number, servo16: number, repeat: boolean) {
        // repeat ist false beim ersten Durchlauf der Schleife, true bei Wiederholungen
        if (!repeat) {
            m_lenken = undefined // gespeicherte Werte löschen
            m_inSpur = false     // beim ersten Durchlauf der Schleife
            // setLedColors(eRGBled.b, Colors.Off, false)
        }


        if (stop) {
            selectMotorStop(false) // nicht geradeaus lenken
            setLedColors(eRGBled.b, Colors.Red)
            basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden warten bis es wieder los fährt
        }
        else {
            let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

            if (!links_hell && !rechts_hell) { // dunkel dunkel
                selectMotor(motor128)
                pinServoGeradeaus() // nicht lenken
                m_inSpur = true
            }
            else if (!links_hell && rechts_hell) { // dunkel hell
                selectMotor(langsamfahren) // links lenken <16 = 1
                pinServo16(16 - lenken)
                if (m_inSpur)
                    m_lenken = 16 - lenken
            }
            else if (links_hell && !rechts_hell) { // hell dunkel
                selectMotor(langsamfahren)
                pinServo16(16 + lenken) // rechts lenken >16 = 31
                if (m_inSpur)
                    m_lenken = 16 + lenken
            }
            else if (m_lenken) { // hell hell
                selectMotor(langsamfahren)
                pinServo16(m_lenken) // lenken wie zuletzt gespeichert
                m_inSpur = false
            }
            else { // hell hell
                selectMotor(motor128) // schnell geradeaus fahren bis zur schwarzen Linie
                pinServoGeradeaus() // nicht lenken
                m_inSpur = false
            }
            setLedColors(eRGBled.b, Colors.Yellow, stop) // gelb, wenn Spursensor aktiviert ist
        }
    } */



    export function fernProgrammierung(buffer: Buffer, abstand: boolean, links_hell: boolean, rechts_hell: boolean) {
        if (btf.getaktiviert(buffer, btf.e3aktiviert.ue) && abstand) { // 2
            selectMotor(btf.getByte(buffer, btf.eBufferPointer.ue, btf.eBufferOffset.b0_Motor)) // 4
            pinServo16(btf.getByte(buffer, btf.eBufferPointer.ue, btf.eBufferOffset.b1_Servo)) // 5
        }
        else if (btf.getaktiviert(buffer, btf.e3aktiviert.s00) && !links_hell && !rechts_hell) { // 4
            selectMotor(btf.getByte(buffer, btf.eBufferPointer.s00, btf.eBufferOffset.b0_Motor)) // 7
            pinServo16(btf.getByte(buffer, btf.eBufferPointer.s00, btf.eBufferOffset.b1_Servo)) // 8
        }
        else if (btf.getaktiviert(buffer, btf.e3aktiviert.s01) && !links_hell && rechts_hell) { // 8
            selectMotor(btf.getByte(buffer, btf.eBufferPointer.s01, btf.eBufferOffset.b0_Motor)) // 10
            pinServo16(btf.getByte(buffer, btf.eBufferPointer.s01, btf.eBufferOffset.b1_Servo)) // 11
        }
        else if (btf.getaktiviert(buffer, btf.e3aktiviert.s10) && links_hell && !rechts_hell) { // 16
            selectMotor(btf.getByte(buffer, btf.eBufferPointer.s10, btf.eBufferOffset.b0_Motor)) // 13
            pinServo16(btf.getByte(buffer, btf.eBufferPointer.s10, btf.eBufferOffset.b1_Servo)) // 14
        }
        else if (btf.getaktiviert(buffer, btf.e3aktiviert.s11) && links_hell && rechts_hell) { // 32
            selectMotor(btf.getByte(buffer, btf.eBufferPointer.s11, btf.eBufferOffset.b0_Motor)) // 16
            pinServo16(btf.getByte(buffer, btf.eBufferPointer.s11, btf.eBufferOffset.b1_Servo)) // 17
        }
        else if (btf.getaktiviert(buffer, btf.e3aktiviert.m0)) { // 1
            selectMotor(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b0_Motor)) // 1
            pinServo16(btf.getByte(buffer, btf.eBufferPointer.m0, btf.eBufferOffset.b1_Servo)) // 2
        }

    }


} // r-beispiele.ts
