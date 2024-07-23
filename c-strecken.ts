
namespace cb2 { // c-strecken.ts


    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"

    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"
    //% block="Fahren %motor Lenken %servo Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Lenken %lenkenProzent \\% Encoder %checkEncoder" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStreckePicker(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, lenkenProzent = 50, checkEncoder = true) {
        fahreStrecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, abstand, spurSensor, impulse, lenkenProzent, checkEncoder)
    }



    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"

    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Lenken %lenkenProzent \\% Encoder %checkEncoder" weight=5
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, lenkenProzent = 50, checkEncoder = true) {

        writeMotorenStop()

        if (motor != 0 && servo != 0 && strecke != 0) {
            let sensor_color = Colors.Off
            let timeout_Encoder: number// = 200 // 20 s Timeout wenn Encoder nicht zählt
            let hasEncoder = false
            if (checkEncoder)
                hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

            writeMotor128Servo16(motor, servo & 0b00011111, lenkenProzent) //, prozent

            if (hasEncoder) {
                let encoderImpulse = impulse ? strecke : strecke * n_EncoderFaktor

                timeout_Encoder = 200 // 20 s Timeout wenn Encoder nicht zählt

                while (readEncoderMittelwert() < encoderImpulse) // strecke * n_EncoderFaktor 31.25
                {
                    if (timeout_Encoder-- <= 0) {
                        sensor_color = Colors.Red
                        break
                    }
                    if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                        sensor_color = Colors.Yellow
                        break
                    }
                    if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                        sensor_color = Colors.White
                        break
                    }
                    // Pause eventuell bei hoher Geschwindigkeit motor verringern
                    // oder langsamer fahren wenn Rest strecke kleiner wird
                    basic.pause(100) // 200
                }
            }
            else {
                //  basic.pause(buffer[2] * 100)
                timeout_Encoder = strecke // Zehntelsekunden
                while (timeout_Encoder-- > 0) //
                {
                    if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                        sensor_color = Colors.Orange
                        break
                    }
                    if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                        sensor_color = Colors.White
                        break
                    }

                    basic.pause(100) // 1 Zehntelsekunde
                }
            }

            writeMotorenStop()

            if (sensor_color != Colors.Off) {
                writeRgbLeds(sensor_color, true)
                basic.pause(1000)
                writeRgbLeds(sensor_color, false)
            }
        }

    }



    // ========== group="2 Motoren (-100 ↓ 0 ↑ +100) nach Zeit (1.0 - 25.5 s) steuern" subcategory="Strecken"

    //% group="2 Motoren (-100 ↓ 0 ↑ +100) nach Zeit (1.0 - 25.5 s) steuern" subcategory="Strecken"
    //% block="2 Motoren links %motorA rechts %motorB Zeit (⅒s) %zehntelsekunden || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor "
    //% motorA.shadow=speedPicker motor.defl=50
    //% motorB.shadow=speedPicker motor.defl=-50
    //% zehntelsekunden.shadow=cb2_zehntelsekunden
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff  
    //% inlineInputMode=inline
    export function fahre2MotorenZeitPicker(motorA: number, motorB: number, zehntelsekunden: number, abstandsSensor = true, abstand = 20, spurSensor = false) {
        fahre2MotorenZeit(btf.speedPicker(motorA), btf.speedPicker(motorB), zehntelsekunden, abstandsSensor, abstand, spurSensor)
    }



    // ========== group="2 Motoren (1 ↓ 128 ↑ 255) nach Zeit (1.0 - 25.5 s) steuern" subcategory="Strecken"

    //% group="2 Motoren (1 ↓ 128 ↑ 255) nach Zeit (1.0 - 25.5 s) steuern" subcategory="Strecken"
    //% block="2 Motoren (1↓128↑255) links %motorA rechts %motorB Zeit (⅒s) %zehntelsekunden || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor "
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



    // ========== group="Zehntelsekunden ⅒s" subcategory="Strecken"

    //% blockId=cb2_zehntelsekunden
    //% group="Zehntelsekunden ⅒s" subcategory="Strecken"
    //% block="%pause" weight=4
    export function cb2_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }


    // ========== nur ENCODER, ohne Sensoren

    // ========== group="2 Motoren (1 ↓ 128 ↑ 255) mit 2 Encodern steuern (Calli:bot 2E)" subcategory="Strecken"

    //% group="2 Motoren (1 ↓ 128 ↑ 255) mit 2 Encodern steuern (Calli:bot 2E)" subcategory="Strecken"
    //% block="2 Motoren (1↓128↑255) | links %motorA rechts %motorB 2 Encoder (cm\\|Impulse) | links %encoderA rechts %encoderB Impulse %impulse"
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


} // c-strecken.ts
