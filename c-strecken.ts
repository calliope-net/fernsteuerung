
namespace cb2 { // c-strecken.ts


    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"

    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"
    //% block="Fahren %motor \\% Lenken %servo ° Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Lenken %lenkenProzent \\% Encoder %checkEncoder" weight=7
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
        fahreStreckeRet(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, abstand, spurSensor, impulse, lenkenProzent, checkEncoder)
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
        fahreStreckeRet(motor, servo, strecke, abstandsSensor, abstand, spurSensor, impulse, lenkenProzent, checkEncoder)
    }

    export function fahreStreckeRet(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, lenkenProzent = 50, checkEncoder = true) {


        writeMotorenStop()

        if (motor != 0 && motor != c_MotorStop && servo != 0 && strecke != 0) {
            let ret = true
            let sensor_color = Colors.Off
            let hasEncoder = false
            if (checkEncoder)
                hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

            btf.resetTimer()

            writeMotor128Servo16(motor, servo & 0b00011111, lenkenProzent) //, prozent

            if (hasEncoder) {
                let encoderImpulse = impulse ? strecke : strecke * n_EncoderFaktor

                let timeout_Encoder = 200 // 20 s Timeout wenn Encoder nicht zählt

                while (readEncoderMittelwert() < encoderImpulse) // strecke * n_EncoderFaktor 31.25
                {
                    if (timeout_Encoder-- <= 0) {
                        sensor_color = Colors.Red
                        ret = false
                        break
                    }
                    if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                        sensor_color = Colors.Yellow
                        ret = false
                        break
                    }
                    if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                        sensor_color = Colors.White
                        ret = false
                        break
                    }
                    // Pause eventuell bei hoher Geschwindigkeit motor verringern
                    // oder langsamer fahren wenn Rest strecke kleiner wird
                    basic.pause(100) // 200
                }
            }
            else {
                let zehntelsekunden = strecke // Zehntelsekunden
                if (impulse)
                    zehntelsekunden /= n_EncoderFaktor

                while (zehntelsekunden-- > 0) //
                {
                    if (abstandsSensor && motor > c_MotorStop && abstand > 0 && readUltraschallAbstand() < abstand) {
                        sensor_color = Colors.Orange
                        ret = false
                        break
                    }
                    if (spurSensor && !readSpursensor(eDH.hell, eDH.hell, true)) { // Spursensor aktiviert und schwarze Linie erkannt
                        sensor_color = Colors.White
                        ret = false
                        break
                    }

                    basic.pause(100) // 1 Zehntelsekunde
                }
            }

            writeMotorenStop()

            if (sensor_color != Colors.Off) {
                writecb2RgbLeds(sensor_color, true)
                basic.pause(1000)
                writecb2RgbLeds(sensor_color, false)
            }
            return ret
        }
        else
            return false
    }



    // ========== group="Länge in Zehntelsekunden ⅒s" subcategory="Strecken"

    //% blockId=cb2_zehntelsekunden
    //% group="Länge in Zehntelsekunden ⅒s" subcategory="Strecken"
    //% block="%pause" weight=4
    export function cb2_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }






    // ========== group="Encoder (Calli:bot 2E)" subcategory="Strecken"

    let n_Callibot2_x22hasEncoder = false // 2:CB2 3:CB2E 4:CB2A=Gymnasium


    //% group="Encoder (Calli:bot 2E)" subcategory="Strecken"
    //% block="Encoder Test und Zähler löschen" weight=3
    export function writeEncoderReset() {
        n_Callibot2_x22hasEncoder = readVersionArray().get(1) == 3 // 2:CB2 3:CB2E 4:CB2A=Gymnasium
        if (n_Callibot2_x22hasEncoder)
            i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, 3])) // 3:beide
        return n_Callibot2_x22hasEncoder
    }

    //% group="Encoder (Calli:bot 2E)" subcategory="Strecken"
    //% block="Encoder Werte (±cm) [l,r] (Int32LE)" weight=2
    export function readEncoderValues() {
        if (n_Callibot2_x22hasEncoder) {
            i2cWriteBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]))
            return i2cReadBuffer(9).slice(1, 8).toArray(NumberFormat.Int32LE) // 32 Bit mit Vorzeichen
        } else
            return [0, 0]
    }

    //% group="Encoder (Calli:bot 2E)" subcategory="Strecken"
    //% block="Encoder Mittelwert (abs cm)" weight=1
    export function readEncoderMittelwert() {
        let encoderValues = readEncoderValues()
        return Math.idiv(Math.abs(encoderValues[0]) + Math.abs(encoderValues[1]), 2)
    }




} // c-strecken.ts
