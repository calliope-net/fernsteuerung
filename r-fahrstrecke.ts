
namespace receiver { // r-fahrstrecke.ts

    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="fahre Motor (1 ↓ 128 ↑ 255) %motor Servo (1 ↖ 16 ↗ 31) %servo Strecke (cm) %strecke" weight=3
    //% motor.min=0 motor.max=255 motor.defl=128
    //% servo.min=1 servo.max=31 servo.defl=16
    //% strecke.min=0 strecke.max=255 strecke.defl=20
    export function fahreSchritt(motor: number, servo: number, strecke: number) {

        if (n_Hardware == eHardware.v3) {

            encoder_start(strecke, true)
            servo_set16(servo)
            v3Motor255(eMotor01.M0, motor) // Fahrmotor an Calliope v3 Motor Pins

            while (n_EncoderAutoStop) {
                basic.pause(200) // Pause kann größer sein, weil Stop schon im Event erfolgt ist
            }
        }
        else if (n_Hardware == eHardware.car4) {

            encoder_start(strecke, true)
            servo_set16(servo)
            qMotor255(eMotor.ma, motor) // Fahrmotor am Qwiic Modul

            while (n_EncoderAutoStop) {
                basic.pause(200) // Pause kann größer sein, weil Stop schon im Event erfolgt ist
            }
        }
        else if (n_Hardware == eHardware.calli2bot) {

            cb2.writeMotor128Servo16(c_MotorStop, servo)
            cb2.writeEncoderReset()

            cb2.writeMotor128Servo16(motor, servo)

            while (cb2.getEncoderMittelwert() < strecke * cb2.n_EncoderFaktor) {
                // Pause eventuell bei hoher Geschwindigkeit motor verringern
                // oder langsamer fahren wenn Rest strecke kleiner wird
                basic.pause(200)
            }

            cb2.writeMotor128Servo16(c_MotorStop, 16)
        }
    }

} // r-fahrstrecke.ts
