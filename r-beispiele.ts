
namespace receiver { // r-beispiele.ts

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
    export function beispielSpurfolger16(motor128: number, langsamfahren: number, servo16: number, repeat: boolean, stop: boolean, abstand: number) {
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
    }


    //% group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele
    //% block="Spurfolger (Spur-Events) | links hell %links_hell rechts hell %rechts_hell Abstandssensor %stop fahren (1↓128↑255) %motor128 langsam fahren %langsamfahren lenken (1↖16↗31) %servo16 Wiederholung %repeat" weight=2
    //% stop.shadow="toggleYesNo"
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% repeat.shadow="toggleYesNo" repeat.defl=1
    // abstand.min=10 abstand.max=50 abstand.defl=20
    // inlineInputMode=inline
    export function eventSpurfolger(links_hell: boolean, rechts_hell: boolean, stop: boolean, motor128: number, langsamfahren: number, servo16: number, repeat: boolean) {
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
    }



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
