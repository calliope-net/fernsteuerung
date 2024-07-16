
namespace cb2 { // c-fahrstrecke.ts


    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="fahre Motor (1 ↓ 128 ↑ 255) %motor Servo (1 ↖ 16 ↗ 31) %servo %zehntelsekunden" weight=4
    //% motor.shadow=btf_speedPicker
    //% servo.shadow=btf_protractorPicker
    //% zehntelsekunden.shadow=cb2_zehntelsekunden
    export function fahreZeit(motor: number, servo: number, zehntelsekunden: number) {

        writeMotorenStop() //cb2.writeMotor128Servo16(motor, servo)
        basic.pause(zehntelsekunden * 100)
        writeMotor128Servo16(c_MotorStop, 16)
    }


    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="fahre Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Strecke (cm \\| 1/10s) %strecke" weight=3
    // motor.min=0 motor.max=255 motor.defl=128
    //% motor.shadow=btf_speedPicker
    // servo.min=1 servo.max=31 servo.defl=16
    //% servo.shadow=btf_protractorPicker
    //% strecke.min=0 strecke.max=255 strecke.defl=20
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number) { // cm oder zehntelsekunden

        writeMotorenStop() // cb2.writeMotor128Servo16(c_MotorStop, servo)

        let hasEncoder = cb2.writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

        cb2.writeMotor128Servo16(motor, servo)

        if (hasEncoder) {

            while (cb2.getEncoderMittelwert() < strecke * cb2.n_EncoderFaktor) { // 31.25
                // Pause eventuell bei hoher Geschwindigkeit motor verringern
                // oder langsamer fahren wenn Rest strecke kleiner wird
                basic.pause(100) // 200
            }
        }
        else {
            basic.pause(strecke * 100)

            //let i = Math.abs(Math.round(Math.map(motor, 1, 255, -9, 9)))
            //let a = [160, 160, 91, 73, 63, 59, 56, 53, 52, 51] // Fahrzeit ms für 1cm bei 10%, 20% .. 100%
            //if (a10)
            //    a = a10

            //basic.showNumber(i)
            //basic.pause(strecke * a[i])
        }

        writeMotorenStop() // cb2.writeMotor128Servo16(c_MotorStop, 16)

    }



} // c-fahrstrecke.ts
