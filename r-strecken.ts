
namespace receiver { // r-strecken.ts


    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"

    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"
    //% block="Fahren %motor \\% Lenken %servo ° Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Encoder %checkEncoder" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandsSensor.shadow=toggleOnOff
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStreckePicker(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, checkEncoder = true) {
        fahreStrecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, abstand, spurSensor, impulse, checkEncoder)
    }



    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"


    //% group="Programmieren" subcategory="Strecken"
    //% block="fahre Motor (1 ↓ 128 ↑ 255) %motor Servo (1 ↖ 16 ↗ 31) %servo Strecke (cm) %strecke" weight=3

    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Spursensor %spurSensor Impulse %impulse Encoder %checkEncoder" weight=5
    //% motor.min=1 motor.max=255 motor.defl=230
    //% servo.min=1 servo.max=31 servo.defl=26
    //% strecke.min=10 strecke.max=255 strecke.defl=250
    //% abstandsSensor.shadow=toggleOnOff
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    //% spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline


    // motor.min=0 motor.max=255 motor.defl=128
    // motor.shadow=btf_speedPicker
    // servo.min=1 servo.max=31 servo.defl=16
    // servo.shadow=btf_protractorPicker
    // strecke.min=0 strecke.max=255 strecke.defl=20
    export function fahreStrecke(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, spurSensor = false, impulse = false, checkEncoder = true) {

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
    }

} // r-strecken.ts
