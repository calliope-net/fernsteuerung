
namespace receiver { // r-beispiele.ts

    // ========== group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele

    let m_lenken: number
    let m_inSpur = false

    //% group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele
    //% block="Spurfolger | fahren (1↓128↑255) %motor128 langsam fahren %langsamfahren lenken (1↖16↗31) %servo16 Wiederholung %repeat Stop %stop bei Abstand < (cm) %abstand" weight=2
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
        }

        if (stop && abstand > 0 && getQwiicUltrasonic(true) < abstand) {
         
            selectMotor(c_MotorStop)

            setLedColors(eRGBled.b, Colors.Red)
            basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden warten bis es wieder los fährt
        }
        else {

            let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

            // readInputs(i2cSpur) // liest I2C Spursensor ein, bei pins nicht relevant

            if (readSpursensor(eDH.dunkel, eDH.dunkel)) {
                selectMotor(motor128)
                pinServo16(16) // nicht lenken
                m_inSpur = true
            }
            else if (readSpursensor(eDH.dunkel, eDH.hell)) {
                selectMotor(langsamfahren) // links lenken <16 = 1
                pinServo16(16 - lenken)
                if (m_inSpur)
                    m_lenken = 16 - lenken
            }
            else if (readSpursensor(eDH.hell, eDH.dunkel)) {
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
            setLedColors(eRGBled.b, Colors.Yellow, stop) // gelb, wenn Spursensor aktiviert ist

        }
    }



} // r-beispiele.ts
