
namespace cb2 { // c-zweimotoren.ts

    // ========== group="2 Motoren"

    // aktuelle Werte // I²C nur bei Änderung
    export let n_m1_1_128_255: number
    export let n_m2_1_128_255: number


    //% group="Fahren mit 2 Motoren (-100% ↓ 0 ↑ +100%)" subcategory="2 Motoren"
    //% block="2 Motoren links %mA %motorA \\% • rechts %mB %motorB \\%" weight=4
    //% mA.shadow=toggleOnOff mA.defl=1
    //% motorA.shadow=speedPicker motorA.defl=50
    //% mB.shadow=toggleOnOff mB.defl=1
    //% motorB.shadow=speedPicker motorB.defl=-50
    //% inlineInputMode=inline
    export function writeMotorenPicker(mA: boolean, motorA: number, mB: boolean, motorB: number) {
        writeMotoren128(mA ? btf.speedPicker(motorA) : 0, mB ? btf.speedPicker(motorB) : 0)
    }

    //% group="Fahren mit 2 Motoren (0: keine Änderung)" subcategory="2 Motoren"
    //% block="2 Motoren (1↓128↑255) links %m1_1_128_255 • rechts %m2_1_128_255" weight=3
    //% m1_1_128_255.min=0 m1_1_128_255.max=255 m1_1_128_255.defl=0
    //% m2_1_128_255.min=0 m2_1_128_255.max=255 m2_1_128_255.defl=0
    export function writeMotoren128(m1_1_128_255: number, m2_1_128_255: number) {
        n_x1_128_255 = undefined
        n_y1_16_31 = undefined // die anderen zwischengespeicherten Werte ungültig machen

        // ist ein Parameter 0, wird der Motor nicht angesteuert: keine Änderung
        // ist ein Parameter gleich dem letzten Wert, wird der Motor nicht geändert (I²C)

        let m1 = btf.between(m1_1_128_255, 1, 255) && n_m1_1_128_255 != m1_1_128_255
        let m2 = btf.between(m2_1_128_255, 1, 255) && n_m2_1_128_255 != m2_1_128_255

        let motorBuffer: Buffer // undefined
        let offset = 0
        if (m1 && m2) {
            motorBuffer = Buffer.create(6)
            motorBuffer[offset++] = eRegister.SET_MOTOR
            motorBuffer[offset++] = 3 // 3 beide Motoren
        } else if (m1) {
            motorBuffer = Buffer.create(4)
            motorBuffer[offset++] = eRegister.SET_MOTOR
            motorBuffer[offset++] = 1
        } else if (m2) {
            motorBuffer = Buffer.create(4)
            motorBuffer[offset++] = eRegister.SET_MOTOR
            motorBuffer[offset++] = 2
        }

        // M1 offset 2:Richtung, 3:PWM
        if (m1 && (m1_1_128_255 & 0x80) == 0x80) { // 128..255 M1 vorwärts
            n_m1_1_128_255 = m1_1_128_255 // letzten Wert merken
            motorBuffer[offset++] = 0
            motorBuffer[offset++] = (m1_1_128_255 << 1)
        } else if (m1) { // 1..127 M1 rückwärts
            n_m1_1_128_255 = m1_1_128_255
            motorBuffer[offset++] = 1
            motorBuffer[offset++] = ~(m1_1_128_255 << 1)
        }

        // M2 wenn !m1 offset 2:Richtung, 3:PWM sonst offset 4:Richtung, 5:PWM
        if (m2 && (m2_1_128_255 & 0x80) == 0x80) { // 128..255 M2 vorwärts
            n_m2_1_128_255 = m2_1_128_255 // letzten Wert merken
            motorBuffer[offset++] = 0
            motorBuffer[offset++] = (m2_1_128_255 << 1)
        } else if (m2) { // 1..127 M2 rückwärts
            n_m2_1_128_255 = m2_1_128_255
            motorBuffer[offset++] = 1
            motorBuffer[offset++] = ~(m2_1_128_255 << 1)
        }

        if (motorBuffer) // wenn beide false, ist motorBuffer undefined
            i2cWriteBuffer(motorBuffer)
        //  }
    }


    // ========== group="2 Motoren (-100 ↓ 0 ↑ +100) nach Zeit (1.0 - 25.5 s) steuern" subcategory="2 Motoren"

    //% group="Strecke mit 2 Motoren nach Zeit (1.0 - 25.5 s) fahren" subcategory="2 Motoren"
    //% block="2 Motoren (Picker) links %motorA \\% • rechts %motorB \\% Zeit %zehntelsekunden ⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor" weight=6
    //% motorA.shadow=speedPicker motorA.defl=50
    //% motorB.shadow=speedPicker motorB.defl=-50
    //% zehntelsekunden.shadow=cb2_zehntelsekunden
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff  
    //% inlineInputMode=inline
    export function fahre2MotorenZeitPicker(motorA: number, motorB: number, zehntelsekunden: number, abstandsSensor = true, abstand = 20, spurSensor = false) {
        fahre2MotorenZeit(btf.speedPicker(motorA), btf.speedPicker(motorB), zehntelsekunden, abstandsSensor, abstand, spurSensor)
    }



    // ========== group="2 Motoren (1 ↓ 128 ↑ 255) nach Zeit (1.0 - 25.5 s) steuern" subcategory="2 Motoren"

    //% group="Strecke mit 2 Motoren nach Zeit (1.0 - 25.5 s) fahren" subcategory="2 Motoren"
    //% block="2 Motoren (1↓128↑255) links %motorA rechts %motorB Zeit %zehntelsekunden ⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor" weight=5
    //% motorA.min=1 motorA.max=255 motorA.defl=192
    //% motorB.min=1 motorB.max=255 motorB.defl=64
    //% zehntelsekunden.min=10 zehntelsekunden.max=255 zehntelsekunden.defl=25
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff   // inlineInputMode=inline
    //% inlineInputMode=inline
    export function fahre2MotorenZeit(motorA: number, motorB: number, zehntelsekunden: number, abstandsSensor = true, abstand = 20, spurSensor = false) {

        writeMotorenStop()

        if (
            !(motorA == 0 && motorB == 0) // nicht beide 0, wäre wirkungslos
            &&
            zehntelsekunden > 0
        ) {
            let sensor_color = Colors.Off

            writeMotoren128(motorA, motorB) // Start

            while (zehntelsekunden-- > 0) // -1 aller 100 ms (pause unten)
            {
                if (abstandsSensor && abstand > 0 && readUltraschallAbstand() < abstand) {
                    sensor_color = Colors.Orange
                    break
                }
                if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                    sensor_color = Colors.White
                    break
                }

                basic.pause(100) // 1 Zehntelsekunde
            } // while

            writeMotorenStop()

            if (sensor_color != Colors.Off) {
                writeRgbLeds(sensor_color, true)
                basic.pause(1000)
                writeRgbLeds(sensor_color, false)
            }
        } // if
    }



    // ========== nur ENCODER, ohne Sensoren

    // ========== group="2 Motoren (1 ↓ 128 ↑ 255) mit 2 Encodern steuern (Calli:bot 2E)" subcategory="2 Motoren"

    //% group="Strecke mit 2 Motoren (1 ↓ 128 ↑ 255) und 2 Encodern fahren (Calli:bot 2E)" subcategory="2 Motoren"
    //% block="2 Motoren (1↓128↑255) | links %motorA rechts %motorB 2 Encoder (cm\\|Impulse) ≤ 255 | links %encoderA rechts %encoderB Impulse %impulse"
    //% motorA.min=1 motorA.max=255 motorA.defl=192
    //% motorB.min=1 motorB.max=255 motorB.defl=64
    //% encoderA.min=10 encoderA.max=255 encoderA.defl=25
    //% encoderB.min=10 encoderB.max=255 encoderB.defl=25
    //% impulse.shadow=toggleYesNo
    // inlineInputMode=inline
    export function fahre2MotorenEncoder(motorA: number, motorB: number, encoderA: number, encoderB: number, impulse = false) {
        writeMotorenStop()
        if (
            !(motorA == 0 && motorB == 0) // nicht beide 0, wäre wirkungslos
            &&
            (
                motorA != c_MotorStop && encoderA != 0 // mindestens einer muss Geschwindiegkeit und Strecken Länge haben
                ||
                motorB != c_MotorStop && encoderB != 0
            )
            &&
            writeEncoderReset() // Testet ob Encoder vorhanden und setzt beide Zähler auf 0
        ) {

            let encoderImpulseA = impulse ? encoderA : encoderA * n_EncoderFaktor
            let encoderImpulseB = impulse ? encoderB : encoderB * n_EncoderFaktor
            let timeoutEncoder = 500 // 500 * pause 2 (unten) = 1 s Timeout, wenn Encoder nicht zählt
            // 200 * pause 100 (unten) = 20 s Timeout, wenn Encoder nicht zählt

            let letzteEncoderWerte: number[] = [0, 0]
            let aEncoderWerte: number[]

            writeMotoren128(motorA, motorB) // Start

            while (motorA != c_MotorStop || motorB != c_MotorStop) {

                aEncoderWerte = readEncoderValues() // rückwärts sind die Werte negativ

                if (timeoutEncoder-- <= 0) { // alle 1s

                    if (letzteEncoderWerte[0] == aEncoderWerte[0] && letzteEncoderWerte[1] == aEncoderWerte[1]) {
                        // in 500 * pause 2 (unten) = 1 s Timeout hat sich kein Wert geändert
                        writeMotorenStop()
                        writeRgbLeds(Colors.Red, true)
                        // basic.pause(1000)
                        //  writeRgbLeds(Colors.Red, false) // aus nach 1 Sekunde
                        break
                    }
                    else { // mindestens ein Wert geändert - weiter fahren
                        letzteEncoderWerte[0] = aEncoderWerte[0]
                        letzteEncoderWerte[1] = aEncoderWerte[1]
                        timeoutEncoder = 500 // 500 * pause 2 (unten) = 1 s Timeout, wenn Encoder nicht zählt
                    }
                }


                if (motorA != c_MotorStop && Math.abs(aEncoderWerte[0]) > encoderImpulseA) {
                    motorA = c_MotorStop
                    writeMotoren128(c_MotorStop, 0) // 0: keine Änderung bei dem Motor
                }
                if (motorB != c_MotorStop && Math.abs(aEncoderWerte[1]) > encoderImpulseB) {
                    motorB = c_MotorStop
                    writeMotoren128(0, c_MotorStop)
                }

                // Pause eventuell bei hoher Geschwindigkeit motor verringern
                // oder langsamer fahren wenn Rest strecke kleiner wird
                // l=255 r=1: 800 Impulse (25*32) 1.4s = 1.75ms pro Impuls

                basic.pause(2) // 2 ms müsste jeden Impuls erfassen

            } // while
            writeMotorenStop()
        }
    }


} // c-zweimotoren.ts
