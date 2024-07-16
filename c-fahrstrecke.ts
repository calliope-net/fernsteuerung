
namespace cb2 { // c-fahrstrecke.ts


    //% group="Strecke fahren (Stop nach 1/10s oder cm)" subcategory="Fahrstrecke"
    //% block="fahre Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Zeit %zehntelsekunden" weight=4
    //% motor.min=1 motor.max=255 motor.defl=128
    // motor.shadow=btf_speedPicker
    //% servo.min=1 servo.max=31 servo.defl=16
    // servo.shadow=btf_protractorPicker
    //% zehntelsekunden.shadow=cb2_zehntelsekunden
    export function fahreZeit(motor: number, servo: number, zehntelsekunden: number) {

        writeMotorenStop() //cb2.writeMotor128Servo16(motor, servo)
        basic.pause(zehntelsekunden * 100)
        writeMotor128Servo16(c_MotorStop, 16)
    }


    //% group="Strecke fahren (Stop nach 1/10s oder cm)" subcategory="Fahrstrecke"
    //% block="fahre Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Strecke (cm \\| 1/10s) %strecke" weight=3
    //% motor.min=1 motor.max=255 motor.defl=128
    // motor.shadow=btf_speedPicker
    //% servo.min=1 servo.max=31 servo.defl=16
    // servo.shadow=btf_protractorPicker
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number) { // cm oder zehntelsekunden

        writeMotorenStop() // cb2.writeMotor128Servo16(c_MotorStop, servo)

        let hasEncoder = writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

        writeMotor128Servo16(motor, servo)

        if (hasEncoder) {

            while (getEncoderMittelwert() < strecke * n_EncoderFaktor) { // 31.25
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

    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="Strecke %schritt" weight=8
    //% schritt.shadow=cb2_programmSchritt
    export function fahreBuffer(buffer: Buffer) {
        if (buffer.length == 3)
            fahreStrecke(buffer[0], buffer[1] & 0b00011111 , buffer[2])
    }


    //% blockId=cb2_programmPicker
    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="Motor %motor Servo %servo Zeit %zehntelsekunden" weight=7
    //% motor.shadow="btf_speedPicker"
    //% servo.shadow="btf_protractorPicker"
    //% strecke.min=10 strecke.max=255 strecke.defl=20
   //% zehntelsekunden.shadow=cb2_zehntelsekunden
    export function programmPicker(motor: number, servo: number, zehntelsekunden: number) {
        return Buffer.fromArray([motor, servo, zehntelsekunden])
    }


    //% blockId=cb2_programmSchritt
    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Strecke %strecke cm" weight=7
    //% motor.min=1 motor.max=255 motor.defl=128
    //% servo.min=1 servo.max=31 servo.defl=16
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    export function programmSchritt(motor: number, servo: number, strecke: number) {
        return Buffer.fromArray([motor, servo, strecke])
    }





} // c-fahrstrecke.ts
