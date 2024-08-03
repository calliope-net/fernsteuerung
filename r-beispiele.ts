
namespace receiver { // r-beispiele.ts

    // ========== group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele

    let m_lenken: number
    let m_inSpur = false

    //% group="1 Spurfolger (1 ↓ 128 ↑ 255) (1 ↖ 16 ↗ 31)" subcategory=Beispiele
    //% block="Spurfolger | fahren (1↓128↑255) %motor128 langsam fahren %langsamfahren lenken (1↖16↗31) %servo16 Wiederholung %repeat Stop %stop bei Abstand < (cm) %abstand" weight=2
    //% motor128.min=1 motor128.max=255 motor128.defl=192
    //% servo16.min=1 servo16.max=31 servo16.defl=31
    //% langsamfahren.min=1 langsamfahren.max=255 langsamfahren.defl=160
    // lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=0
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
            //  writeRgbLeds(Colors.Off, false) // alle 4 aus
        }

        if (stop && abstand > 0 && getQwiicUltrasonic(true) < abstand) {
         
            selectMotor(c_MotorStop)

            setLedColors(eRGBled.b, Colors.Red)
            basic.pause(Math.randomRange(500, 5000)) // 0.5 .. 5 Sekunden
        }
        else {

            let lenken = Math.abs(servo16 - 16)  // 16-16=0 / 1-16=15 / 31-16=15

            // readInputs(i2cSpur) // liest Spursensor ein

            if (readSpursensor(eDH.dunkel, eDH.dunkel)) {
                selectMotor(motor128) // dualMotor128(eDualMotor.M0, motor128) //     writeMotor128Servo16(motor128, 16) // nicht lenken
                pinServo16(16)
                m_inSpur = true
            }
            else if (readSpursensor(eDH.dunkel, eDH.hell)) { // 0% Rad steht bei voller Lenkung (1 oder 31)
                selectMotor(langsamfahren) // dualMotor128(eDualMotor.M0, langsamfahren) //   writeMotor128Servo16(langsamfahren, 16 - lenken, lenkenProzent) // links lenken <16 = 1
                pinServo16(16 - lenken)
                if (m_inSpur)
                    m_lenken = 16 - lenken
            }
            else if (readSpursensor(eDH.hell, eDH.dunkel)) { // 0% Rad steht bei voller Lenkung (1 oder 31)
                selectMotor(langsamfahren) // dualMotor128(eDualMotor.M0, langsamfahren) //  writeMotor128Servo16(langsamfahren, 16 + lenken, lenkenProzent) // rechts lenken >16 = 31
                pinServo16(16 + lenken)
                if (m_inSpur)
                    m_lenken = 16 + lenken
            }
            else if (m_lenken) {
                selectMotor(langsamfahren) // dualMotor128(eDualMotor.M0, langsamfahren) //  writeMotor128Servo16(langsamfahren, m_lenken, lenkenProzent) // lenken wie zuletzt gespeichert
                pinServo16(m_lenken)
                m_inSpur = false // hell hell
            }
            else {
                selectMotor(motor128) // dualMotor128(eDualMotor.M0, motor128) // writeMotor128Servo16(motor128, 16, 0) // geradeaus fahren bis zur schwarzen Linie
                pinServo16(16)
                m_inSpur = false // hell hell
            }
            setLedColors(eRGBled.b, Colors.Yellow, stop)

        }
    }



} // r-beispiele.ts
