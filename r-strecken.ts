
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

            encoderStartStrecke(true, strecke)
            pinServo16(servo)
            dualMotor128(eDualMotor.M0, motor) // Fahrmotor an Calliope v3 Motor Pins

            while (n_EncoderAutoStop) {
                basic.pause(200) // Pause kann größer sein, weil Stop schon im Event erfolgt ist
            }
        }
        else if (n_Hardware == eHardware.car4) {

            encoderStartStrecke(true, strecke)
            pinServo16(servo)
            qwiicMotor128(eQwiicMotor.ma, motor) // Fahrmotor am Qwiic Modul

            while (n_EncoderAutoStop) {
                basic.pause(200) // Pause kann größer sein, weil Stop schon im Event erfolgt ist
            }
        }
    }



    // ========== group="Encoder" subcategory="Strecken"

    let n_EncoderCounter: number = 0 // Impuls Zähler
    let n_EncoderFaktor = 63.9 * (26 / 14) / (8 * Math.PI) // 63.9 Motorwelle * (26/14) Zahnräder / (8cm * PI) Rad Umfang = 4.6774502 cm
    let n_EncoderStrecke_impulse: number = 0
    let n_EncoderAutoStop = false // true während der Fahrt, false bei Stop nach Ende der Strecke


    // aufgerufen von receiver.beimStart
    export function encoderRegisterEvent(radDmm: number) { // radDmm: Rad Durchmesser in Millimeter
        //   if (n_Hardware == eHardware.v3) {

        // if (!radDmm)
        //     radDmm = 65
        n_EncoderFaktor = 63.9 * (26 / 14) / (radDmm / 10 * Math.PI)


        // ========== Event Handler registrieren
        pins.onPulsed(a_PinEncoder[n_Hardware], PulseValue.Low, function () {

            if (selectMotorSpeed() > c_MotorStop)
                n_EncoderCounter++ // vorwärts
            else
                n_EncoderCounter-- // rückwärts

            if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start

                if (n_EncoderAutoStop) {
                    selectMotor(c_MotorStop) // dualMotor128(eDualMotor.M0, c_MotorStop)
                    n_EncoderAutoStop = false
                }

                if (onEncoderStopHandler)
                    onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
            }
        })
        // ========== Event Handler registrieren


        // Encoder PIN Eingang PullUp
        pins.setPull(a_PinEncoder[n_Hardware], PinPullMode.PullUp)
    }




    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder starten • AutoStop %autostop bei (cm) %strecke || Impulse %impulse" weight=8
    //% autostop.shadow="toggleYesNo" autostop.defl=1
    //% strecke.min=1 strecke.max=255 strecke.defl=20
    //% impulse.shadow=toggleYesNo
    export function encoderStartStrecke(autostop: boolean, strecke: number, impulse = false) {
        n_EncoderCounter = 0 // Impuls Zähler zurück setzen

        if (strecke > 0) {
            n_EncoderStrecke_impulse = impulse ? strecke : Math.round(strecke * n_EncoderFaktor)
            n_EncoderAutoStop = autostop

            // btf.n_lastConnectedTime = input.runningTime() // Connection-Timeout Zähler zurück setzen um Abschaltung zu verhindern
        } else {
            n_EncoderStrecke_impulse = 0
        }
    }




    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder Wert (cm) || Impulse %impulse" weight=4
    //% impulse.shadow=toggleYesNo
    export function encoderCounter(impulse = false) {
        if (impulse)
            return n_EncoderCounter
        else
            return Math.round(n_EncoderCounter / n_EncoderFaktor)
    }


    // ========== EVENT HANDLER === sichtbarer Event-Block
    let onEncoderStopHandler: (cm: number) => void

    //% group="Encoder" subcategory="Strecken"
    //% block="wenn Ziel erreicht" weight=2
    //% draggableParameters=reporter
    export function onEncoderStop(cb: (cm: number) => void) {
        onEncoderStopHandler = cb
    }
    // ========== EVENT HANDLER === sichtbarer Event-Block



} // r-strecken.ts
