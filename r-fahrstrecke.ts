
namespace receiver { // r-fahrstrecke.ts
/* 
    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="fahre Motor (1 ↓ 128 ↑ 255) %motor Servo (1 ↖ 16 ↗ 31) %servo Strecke (cm) %strecke" weight=3
    // motor.min=0 motor.max=255 motor.defl=128
    //% motor.shadow=btf_speedPicker
    // servo.min=1 servo.max=31 servo.defl=16
    //% servo.shadow=btf_protractorPicker
    //% strecke.min=0 strecke.max=255 strecke.defl=20
    export function fahreSchritt(motor: number, servo: number, strecke: number) {

        if (n_Hardware == eHardware.v3) {

            encoderStartStrecke(strecke, true)
            pinServo16(servo)
            dualMotor128(eDualMotor.M0, motor) // Fahrmotor an Calliope v3 Motor Pins

            while (n_EncoderAutoStop) {
                basic.pause(200) // Pause kann größer sein, weil Stop schon im Event erfolgt ist
            }
        }
        else if (n_Hardware == eHardware.car4) {

            encoderStartStrecke(strecke, true)
            pinServo16(servo)
            qwiicMotor128(eQwiicMotor.ma, motor) // Fahrmotor am Qwiic Modul

            while (n_EncoderAutoStop) {
                basic.pause(200) // Pause kann größer sein, weil Stop schon im Event erfolgt ist
            }
        }
    } */

} // r-fahrstrecke.ts
