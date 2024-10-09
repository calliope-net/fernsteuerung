
namespace receiver { // r-strecken.ts


    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"

    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"
    //% block="Fahren %motor \\% Lenken %servo ° Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Impulse %impulse Encoder %checkEncoder" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandsSensor.shadow=toggleOnOff
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    // spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStreckePicker(motor: number, servo: number, strecke: number, abstandsSensor = true, abstand = 20, impulse = false, checkEncoder = true) {
        fahreStrecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandsSensor, abstand, impulse, checkEncoder)
    }



    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"

    // export let n_StreckeStop = false
    // export let n_StreckeRichtungVor = true

    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Stop %abstandsSensor bei Abstand < (cm) %abstand Impulse %impulse Encoder %checkEncoder" weight=5
    //% motor.min=1 motor.max=255 motor.defl=153
    //% servo.min=1 servo.max=31 servo.defl=29
    //% strecke.min=10 strecke.max=255 strecke.defl=153
    //% abstandsSensor.shadow=toggleOnOff abstandsSensor.defl=1
    //% abstand.min=10 abstand.max=50 abstand.defl=30
    // spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number, abstandsSensor = false, abstand = 20, impulse = false, checkEncoder = true) {

        // selectMotor(c_MotorStop)
        // let ledb_abstand: Colors = (n_AbstandSensorAktiviert == eAbstandSensorAktiviert.p2Fahrplan || n_AbstandSensorAktiviert == eAbstandSensorAktiviert.plFahrplan) ? 0x808000 : Colors.Off
        // let ledb_abstand: Colors = abstandsSensor ? 0x808000 : Colors.Off
        // let ledc_encoder = Colors.Off

        btf.zeigeBIN(0, btf.ePlot.bin, 2) // Anzeige löschen
        btf.zeigeBIN(0, btf.ePlot.bin, 3)
        btf.zeigeBIN(0, btf.ePlot.bin, 4)

        abstandsSensor = abstandsSensor && abstand > 0 && motor > c_MotorStop && selectAbstandSensorConnected()
        // selectAbstand_cm(true)

        /*   if (abstandsSensor) {
              selectAbstand_cm(true)
               if (selectAbstand_cm(true) < abstand) {
                   btf.setLedColors(btf.eRgbLed.b, Colors.Orange)
                   motor = 0
               }
               else
              btf.setLedColors(btf.eRgbLed.b, Colors.Yellow)
          } */

        btf.setLedColors(btf.eRgbLed.b, Colors.Yellow, abstandsSensor)


        if (motor != 0 && motor != c_MotorStop && servo != 0 && strecke != 0) {

            btf.resetTimer() // langes Timeout 30s, Abschaltung verhindern

            if (checkEncoder && encoderRegisterEvent()) { // n_EncoderEventRegistered && n_hasEncoder
                btf.setLedColors(btf.eRgbLed.c, Colors.Green)
                // ledc_encoder = 0x004000 // grün
                let timeout_Encoder = abstandsSensor ? 80 : 10 // 2 s Timeout wenn Encoder nicht zählt
                // let timeout_EncoderCounter = n_EncoderCounter // zum Test ob sich der Wet ändert

                // n_StreckeRichtungVor = motor >= c_MotorStop // Wert eintragen für Stop Event

                encoderStartStrecke(true, strecke, impulse) // stellt n_EncoderCounter auf 0
                pinServo16(servo)
                selectMotor(motor)

                while (n_EncoderAutoStop) //
                {
                    if (timeout_Encoder-- <= 0 && n_EncoderCounter < 10) { // kein Impuls nach 2s: kein Encoder vorhanden
                        n_hasEncoder = false // bei ersten 2s timeout false, nächster Aufruf zählt dann nach Zeit
                        btf.setLedColors(btf.eRgbLed.c, Colors.Red)
                        // ledc_encoder = Colors.Red
                        break
                    }
                    /*  if (n_StreckeStop) {
                         ledb_abstand = Colors.Red
                         btf.setLedColors(btf.eRgbLed.b,Colors.Red)
                         break
                     } */
                    if (abstandsSensor && selectAbstand_cm(true) < abstand) { // && motor > c_MotorStop && abstand > 0 && selectAbstandSensorConnected() 
                        btf.setLedColors(btf.eRgbLed.b, Colors.Red)
                        // ledb_abstand = Colors.Red
                        break
                    }
                    //if (spurSensor && !getSpursensor(eDH.hell, eDH.hell)) { // Spursensor aktiviert und schwarze Linie erkannt
                    //    sensor_color = Colors.White
                    //    break
                    //}
                    if (abstandsSensor)
                        basic.pause(25) // kurze Pause, um bei Hindernis anhalten zu können
                    else
                        basic.pause(200) // Pause kann größer sein, weil Stop schon im Encoder Event erfolgt ist
                }
                selectMotor(c_MotorStop)

            }
            else { // kein Encoder
                btf.setLedColors(btf.eRgbLed.c, Colors.Yellow)
                // ledc_encoder = 0x400000 // Colors.Red
                let zehntelsekunden = strecke * 4 // Zehntelsekunde = 4*25 ms
                if (impulse)
                    zehntelsekunden /= n_EncoderFaktor

                pinServo16(servo)
                selectMotor(motor)
                let x = 0
                while (zehntelsekunden-- > 0) //
                {
                    /* if (n_StreckeStop) {
                        ledb_abstand = Colors.Red
                        break
                    } */
                    x++
                    if (abstandsSensor && (selectAbstand_cm(true) < abstand) && x > 4) { // && motor > c_MotorStop && abstand > 0 && selectAbstandSensorConnected() 
                        //x++
                        //let cm = selectAbstand_cm(true)
                        //if (x > 4 && cm < abstand) {
                        btf.zeigeBIN(x, btf.ePlot.bcd, 4)

                        btf.setLedColors(btf.eRgbLed.b, Colors.Red)
                        break
                        //}


                    }
                    //if (spurSensor && !getSpursensor(eDH.hell, eDH.hell)) { // Spursensor aktiviert und schwarze Linie erkannt
                    //    sensor_color = Colors.White
                    //    break
                    //}

                    basic.pause(25) // 1 Zehntelsekunde = 4*25 ms
                }
                selectMotor(c_MotorStop)
            }



        }
        // if (ledb_abstand != Colors.Off)
        // btf.setLedColors(btf.eRgbLed.b, ledb_abstand)

        // if (ledc_encoder != Colors.Off)
        // btf.setLedColors(btf.eRgbLed.c, ledc_encoder)
    }



    // ========== group="Länge in Zehntelsekunden ⅒s" subcategory="Strecken"

    //% blockId=receiver_zehntelsekunden
    //% group="Länge in Zehntelsekunden ⅒s" subcategory="Strecken"
    //% block="%pause" weight=4
    export function receiver_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }



    // ========== group="Encoder" subcategory="Strecken"

    let n_hasEncoder = false
    let n_EncoderFaktor = 63.9 * (26 / 14) / (8 * Math.PI) // 63.9 Motorwelle * (26/14) Zahnräder / (8cm * PI) Rad Umfang = 4.6774502 cm
    let n_EncoderCounter: number = 0 // Impuls Zähler
    let n_EncoderStrecke_impulse: number = 0
    let n_EncoderAutoStop = false // true während der Fahrt, false bei Stop nach Ende der Strecke
    let n_radDurchmesser_mm = 65 // radDmm: Rad Durchmesser in Millimeter
    export let n_EncoderEventRegistered = false

    // aufgerufen von receiver.beimStart 
    export function encoderOn(radDmm: number) {
        n_hasEncoder = true
        n_radDurchmesser_mm = radDmm
    }

    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder Pin Ereignisse registrieren" weight=8
    export function encoderRegisterEvent() {
        if (n_hasEncoder && !n_EncoderEventRegistered && !n_SpurSensorEventsRegistered) {

            n_EncoderFaktor = 63.9 * (26 / 14) / (n_radDurchmesser_mm / 10 * Math.PI)

            // ========== Event Handler registrieren
            pins.onPulsed(a_PinEncoder[n_Hardware], PulseValue.Low, function () {

                if (selectMotorSpeed() > c_MotorStop)
                    n_EncoderCounter++ // vorwärts
                else
                    n_EncoderCounter-- // rückwärts

                if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                    n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start

                    if (n_EncoderAutoStop) {
                        selectMotor(c_MotorStop)
                        n_EncoderAutoStop = false
                    }

                    if (onEncoderStopHandler)
                        onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
                }
            })
            // ========== Event Handler registrieren


            // Encoder PIN Eingang PullUp
            pins.setPull(a_PinEncoder[n_Hardware], PinPullMode.PullUp)

            n_EncoderEventRegistered = true
        }
        return n_EncoderEventRegistered && n_hasEncoder
    }

    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder starten • AutoStop %autostop bei (cm) %strecke || Impulse %impulse" weight=6
    //% autostop.shadow="toggleYesNo" autostop.defl=1
    //% strecke.min=1 strecke.max=255 strecke.defl=20
    //% impulse.shadow=toggleYesNo
    export function encoderStartStrecke(autostop: boolean, strecke: number, impulse = false) {
        if (encoderRegisterEvent()) {
            n_EncoderCounter = 0 // Impuls Zähler zurück setzen

            if (strecke > 0) {
                n_EncoderStrecke_impulse = impulse ? strecke : Math.round(strecke * n_EncoderFaktor)
                n_EncoderAutoStop = autostop

                // btf.n_lastConnectedTime = input.runningTime() // Connection-Timeout Zähler zurück setzen um Abschaltung zu verhindern
            }
            else {
                n_EncoderStrecke_impulse = 0
            }
            return true
        }
        else
            return false
    }




    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder Wert (±cm) || Impulse %impulse" weight=4
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
