
namespace receiver { // r-strecken.ts


    let n_RadioPacket_TimeStamp = 0
    // let n_raiseEncoderEvent_gestartet = false
    let n_BufferPointer = btf.eBufferPointer.m1 // 5 Strecken beginnen bei m1 ma mb mc md
    let n_BufferPointer_handled = 0
    let n_zehntelsekunden = 0

    //% group="2 Fahrplan (Encoder Event in dauerhaft Schleife)" subcategory="Strecken"
    //% block="2 Encoder Ereignis auslösen %buffer || • Encoder %checkEncoder" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    // start_cm.defl=5
    // ms.defl=25
    // inlineInputMode=inline 
    // expandableArgumentMode="toggle"
    export function buffer_raiseEncoderEvent(buffer: Buffer, checkEncoder = true) {
        if (buffer && onEncoderEventHandler) { // beide Objekte nicht undefined

            if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)) { // Betriebsart 2 Fahrplan senden

                if (n_RadioPacket_TimeStamp != radio.receivedPacket(RadioPacketProperty.Time)) {
                    // bei dem selben Buffer (in der dauerhaft Schleife) nur einmal am Anfang machen
                    n_RadioPacket_TimeStamp = radio.receivedPacket(RadioPacketProperty.Time)
                    n_BufferPointer = btf.eBufferPointer.m1
                    n_BufferPointer_handled = 0

                    n_EncoderCounterM0 = 0 // Impuls Zähler zurück setzen
                    n_EncoderCounterM1 = 0
                    n_zehntelsekunden = input.runningTime()
                }

                if (n_BufferPointer <= btf.eBufferPointer.md) { // nach Ende ist n_BufferPointer > md

                    let fahren = btf.getByte(buffer, n_BufferPointer, btf.eBufferOffset.b0_Motor)
                    let lenken = btf.getByte(buffer, n_BufferPointer, btf.eBufferOffset.b1_Servo)
                    let strecke_cm = btf.getByte(buffer, n_BufferPointer, btf.eBufferOffset.b2_Fahrstrecke)
                    let strecke_check = fahren > 0 && fahren != c_MotorStop && lenken > 0 && strecke_cm > 0

                    let strecke_impulse = 0     // SOLL Wert aus Buffer
                    let encoderWert_impulse = 0 // IST Wert aus EncoderCounter bzw. Zeit
                    let encoderColor_c = Colors.Off

                    // Encoder
                    if (checkEncoder && encoderRegisterEvent()) { // n_EncoderEventRegistered && n_hasEncoder

                        encoderWert_impulse = Math.abs(n_EncoderCounterM0)

                        if (encoderWert_impulse < 10 && (input.runningTime() - n_zehntelsekunden) > 2000) {
                            // kein Impuls nach 2s: kein Encoder vorhanden
                            n_hasEncoder = false // nächster Aufruf zählt dann nach Zeit; encoderRegisterEvent() ist false
                            // kein Encoder - zehntelsekunden
                            strecke_impulse = strecke_cm // SOLL cm sind zehntelsekunden
                            encoderWert_impulse = Math.idiv(input.runningTime() - n_zehntelsekunden, 100) // zehntelsekunden seit n_zehntelsekunden = input.runningTime()

                            // btf.setLedColors(btf.eRgbLed.c, Colors.Red) // timeout kein Encoder rot
                            encoderColor_c = Colors.Red
                        }
                        else {
                            if (n_zweiEncoder) {
                                let encoderWert_m1 = Math.abs(n_EncoderCounterM1)
                                encoderWert_impulse = Math.idiv(encoderWert_impulse + encoderWert_m1, 2) // Mittelwert (m0+m1)/2
                                if (encoderWert_m1 > 10) {
                                    //  btf.setLedColors(btf.eRgbLed.c, Colors.Blue) // 2 Encoder blau
                                    encoderColor_c = Colors.Blue
                                }
                                else {
                                    //  btf.setLedColors(btf.eRgbLed.c, Colors.Violet) // 2. Encoder zählt nicht Fehler lila
                                    encoderColor_c = Colors.Violet
                                }
                            }
                            else {
                                // btf.setLedColors(btf.eRgbLed.c, Colors.Green) // 1 Encoder grün
                                encoderColor_c = Colors.Green
                            }
                            if (btf.getSensor(buffer, n_BufferPointer, btf.eSensor.b7Impulse))
                                strecke_impulse = strecke_cm
                            else
                                strecke_impulse = Math.round(strecke_cm * n_EncoderFaktor)
                        }
                    }
                    else {
                        // kein Encoder - zehntelsekunden
                        strecke_impulse = strecke_cm // SOLL cm sind zehntelsekunden
                        encoderWert_impulse = Math.idiv(input.runningTime() - n_zehntelsekunden, 100) // zehntelsekunden seit n_zehntelsekunden = input.runningTime()

                        // btf.setLedColors(btf.eRgbLed.c, Colors.Yellow) // kein Encoder gelb
                        encoderColor_c = Colors.Yellow
                    }

                    let encoder_array: number[] = [Colors.Off, encoderColor_c, strecke_impulse, encoderWert_impulse, n_EncoderCounterM0, n_EncoderCounterM1, n_EncoderFaktor]

                    // Abstand Sensor
                    let abstand_cm = btf.getAbstand(buffer)
                    let abstandSensor = btf.getSensor(buffer, n_BufferPointer, btf.eSensor.b6Abstand)
                        && abstand_cm > 0
                        && fahren > c_MotorStop // nur vorwärts
                        && selectAbstandSensorConnected()

                    let abstandStop = abstandSensor
                        && (selectAbstand_cm(true) < abstand_cm)
                        && (input.runningTime() - n_zehntelsekunden) > 100 // erste 100ms Messungen selectAbstand_cm(true) ignorieren

                    if (strecke_check && !abstandStop && encoderWert_impulse < strecke_impulse) {
                        // los fahren
                        if (abstandSensor)
                            encoder_array[0] = Colors.Yellow
                        // btf.setLedColors(btf.eRgbLed.b, Colors.Yellow, abstandSensor)

                        /*    if (abstandSensor && (selectAbstand_cm(true) < abstand_cm) && (input.runningTime() - n_zehntelsekunden) > 100) {
                               // erste 100ms Messungen selectAbstand_cm(true) ignorieren
                               onEncoderEventHandler(c_MotorStop, 0, strecke_cm, n_BufferPointer, false, encoderWert_impulse / n_EncoderFaktor)
   
                           }
                           else 
                                     */
                        if (n_BufferPointer_handled != n_BufferPointer) { // nur einmal los fahren bei gleichem n_BufferPointer

                            n_BufferPointer_handled = n_BufferPointer

                            onEncoderEventHandler(fahren, lenken, n_BufferPointer, false, encoder_array)
                            // if (fahren > 0 && fahren != c_MotorStop && lenken > 0) {
                            // }
                            // else {
                            //     onEncoderEventHandler(c_MotorStop, 0, strecke_cm, n_BufferPointer, false, encoderWert_impulse / n_EncoderFaktor)
                            // }
                            //btf.zeigeBIN_BufferPointer(n_BufferPointer, 2)
                        }
                    } // los fahren
                    else {
                        // Stop
                        if (abstandStop)
                            encoder_array[0] = Colors.Red
                        // btf.setLedColors(btf.eRgbLed.b, Colors.Red, abstandStop)
                        // if (onEncoderEventHandler)
                        onEncoderEventHandler(c_MotorStop, 16, n_BufferPointer, strecke_check && !abstandStop, encoder_array)

                        //if (n_BufferPointer < btf.eBufferPointer.md) {
                        // nächste Strecke fahren
                        n_BufferPointer += 3

                        n_EncoderCounterM0 = 0 // Impuls Zähler zurück setzen
                        n_EncoderCounterM1 = 0
                        n_zehntelsekunden = input.runningTime()

                        // }
                        // else // letzte Strecke beendet
                        //    n_raiseEncoderEvent_gestartet = false

                    } // Stop
                    // } // (fahren > 0 && fahren != c_MotorStop && lenken > 0)
                } // n_BufferPointer <= btf.eBufferPointer.md




            } // Betriebsart 2 Fahrplan senden
            //else
            //    n_RadioPacket_TimeStamp = 0
            //    n_raiseEncoderEvent_gestartet = false


        } // if(buffer && onEncoderEventHandler)
    }

    // ========== EVENT HANDLER === sichtbarer Event-Block
    let onEncoderEventHandler: (fahren: number, lenken: number, bp: btf.eBufferPointer, ok: boolean, array: number[]) => void

    //% group="2 Fahrplan (Encoder Event in dauerhaft Schleife)" subcategory="Strecken"
    //% block="wenn Encoder Ereignis" weight=3
    //% draggableParameters=reporter
    export function onEncoderEvent(cb: (fahren: number, lenken: number, bp: btf.eBufferPointer, ok: boolean, array: number[]) => void) {
        onEncoderEventHandler = cb
    }

    // ========== EVENT HANDLER === sichtbarer Event-Block





    // ========== group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"

    //% group="Geschwindigkeit (-100 ↓ 0 ↑ +100), Winkel (0° ↖ 90° ↗ 180°)" subcategory="Strecken"
    //% block="Fahren %motor \\% Lenken %servo ° Länge %strecke cm\\|⅒s || Stop %abstandSensor bei Abstand < (cm) %abstand Impulse %impulse Encoder %checkEncoder" weight=7
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% strecke.min=10 strecke.max=255 strecke.defl=20
    //% abstandSensor.shadow=toggleOnOff
    //% abstand.min=10 abstand.max=50 abstand.defl=20
    // spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStreckePicker(motor: number, servo: number, strecke: number, abstandSensor = false, abstand = 20, impulse = false, checkEncoder = true) {
        fahreStrecke(btf.speedPicker(motor), btf.protractorPicker(servo), strecke, abstandSensor, abstand, impulse, checkEncoder)
    }



    // ========== group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"

    // export let n_StreckeStop = false
    // export let n_StreckeRichtungVor = true

    //% group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)" subcategory="Strecken"
    //% block="Fahren (1↓128↑255) %motor Lenken (1↖16↗31) %servo Länge %strecke cm\\|⅒s || Stop %abstandSensor bei Abstand < (cm) %abstand Impulse %impulse Encoder %checkEncoder" weight=5
    //% motor.min=1 motor.max=255 motor.defl=224
    //% servo.min=1 servo.max=31 servo.defl=29
    //% strecke.min=10 strecke.max=255 strecke.defl=160
    //% abstandSensor.shadow=toggleOnOff
    //% abstand.min=10 abstand.max=50 abstand.defl=30
    // spurSensor.shadow=toggleOnOff
    //% impulse.shadow=toggleOnOff
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number, abstandSensor = false, abstand = 20, impulse = false, checkEncoder = true) {
        // btf.zeigeBIN(0, btf.ePlot.bin, 2) // Anzeige löschen
        // btf.zeigeBIN(0, btf.ePlot.bin, 3)
        // btf.zeigeBIN(0, btf.ePlot.bin, 4)

        abstandSensor = abstandSensor && abstand > 0 && motor > c_MotorStop && selectAbstandSensorConnected()

        btf.setLedColors(btf.eRgbLed.b, Colors.Yellow, abstandSensor)


        if (motor != 0 && motor != c_MotorStop && servo != 0 && strecke != 0) {
            let ret = true
            let x = 0 // erste 100ms Messungen selectAbstand_cm(true) ignorieren

            btf.resetTimer() // langes Timeout 30s, Abschaltung verhindern

            if (checkEncoder && encoderRegisterEvent()) { // n_EncoderEventRegistered && n_hasEncoder
                // if (n_v3_2Motoren)
                //     btf.setLedColors(btf.eRgbLed.c, Colors.Blue)
                // else
                //     btf.setLedColors(btf.eRgbLed.c, Colors.Green)

                let timeout_Encoder = abstandSensor ? 80 : 10 // 2 s Timeout wenn Encoder nicht zählt
                let rgbLed_cEncoder = Colors.Off

                encoderStartStrecke(true, strecke, impulse) // stellt n_EncoderCounter auf 0

                selectMotor128Servo16(motor, servo)
                // pinServo16(servo)
                // selectMotor(motor)

                while (n_EncoderAutoStop) //
                {
                    if (timeout_Encoder-- <= 0 && Math.abs(n_EncoderCounterM0) < 10) { // kein Impuls nach 2s: kein Encoder vorhanden
                        n_hasEncoder = false // bei ersten 2s timeout false, nächster Aufruf zählt dann nach Zeit
                        btf.setLedColors(btf.eRgbLed.c, Colors.Red) // kein Encoder rot
                        ret = false
                        break
                    }
                    if (rgbLed_cEncoder == Colors.Off && Math.abs(n_EncoderCounterM0) > 10) { // nur eRgbLed
                        if (Math.abs(n_EncoderCounterM1) > 10)
                            rgbLed_cEncoder = Colors.Blue  // 2 Encoder blau
                        else
                            rgbLed_cEncoder = Colors.Green // 1 Encoder grün
                        btf.setLedColors(btf.eRgbLed.c, rgbLed_cEncoder)
                    }

                    x++
                    if (abstandSensor && (selectAbstand_cm(true) < abstand) && x > 4) { // && motor > c_MotorStop && abstand > 0 && selectAbstandSensorConnected()
                        btf.setLedColors(btf.eRgbLed.b, Colors.Red)
                        ret = false
                        break
                    }
                    //if (spurSensor && !getSpursensor(eDH.hell, eDH.hell)) { // Spursensor aktiviert und schwarze Linie erkannt
                    //    sensor_color = Colors.White
                    //    break
                    //}
                    if (abstandSensor)
                        basic.pause(25) // kurze Pause, um bei Hindernis anhalten zu können
                    else
                        basic.pause(200) // Pause kann größer sein, weil Stop schon im Encoder Event erfolgt ist
                }
                selectMotorStop() // selectMotor(c_MotorStop)

            }
            else { // kein Encoder
                btf.setLedColors(btf.eRgbLed.c, Colors.Yellow)

                let zehntelsekunden = strecke * 4 // Zehntelsekunde = 4*25 ms
                if (impulse)
                    zehntelsekunden /= n_EncoderFaktor

                selectMotor128Servo16(motor, servo)
                // pinServo16(servo)
                // selectMotor(motor)

                while (zehntelsekunden-- > 0) //
                {
                    x++
                    if (abstandSensor && (selectAbstand_cm(true) < abstand) && x > 4) { // && motor > c_MotorStop && abstand > 0 && selectAbstandSensorConnected() 
                        //x++
                        //let cm = selectAbstand_cm(true)
                        //if (x > 4 && cm < abstand) {
                        // btf.zeigeBIN(x, btf.ePlot.bcd, 4)

                        btf.setLedColors(btf.eRgbLed.b, Colors.Red)
                        ret = false
                        break
                        //}
                    }
                    //if (spurSensor && !getSpursensor(eDH.hell, eDH.hell)) { // Spursensor aktiviert und schwarze Linie erkannt
                    //    sensor_color = Colors.White
                    //    break
                    //}

                    basic.pause(25) // 1 Zehntelsekunde = 4*25 ms
                }
                selectMotorStop() // selectMotor(c_MotorStop)
            }
            return ret
        }
        else
            return false
    }



    // ========== group="Länge in Zehntelsekunden ⅒s" subcategory="Strecken"

    //% blockId=receiver_zehntelsekunden
    //% group="Länge in Zehntelsekunden ⅒s" subcategory="Strecken"
    //% block="%pause" weight=4
    export function receiver_zehntelsekunden(pause: btf.ePause): number {
        return pause
    }



    // ========== group="Encoder" subcategory="Strecken"

    export let n_hasEncoder = false
    let n_EncoderFaktor = 63.9 * (26 / 14) / (8 * Math.PI) // 63.9 Motorwelle * (26/14) Zahnräder / (8cm * PI) Rad Umfang = 4.6774502 cm
    let n_EncoderCounterM0: number = 0 // Impuls Zähler negativ wenn rückwärts
    let n_EncoderCounterM1: number = 0 // Impuls Zähler negativ wenn rückwärts
    let n_EncoderStrecke_impulse: number = 0
    let n_EncoderAutoStop = false // true während der Fahrt, false bei Stop nach Ende der Strecke
    let n_radDurchmesser_mm = 65 // radDmm: Rad Durchmesser in Millimeter
    export let n_EncoderEventRegistered = false
    let n_zweiEncoder = false

    // aufgerufen von receiver.beimStart 
    export function encoderOn(radDmm: number) {
        n_hasEncoder = true
        n_radDurchmesser_mm = radDmm
    }


    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder angeschlossen" weight=9
    export function encoderConnected() {
        return n_hasEncoder
    }

    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder Pin Ereignisse registrieren" weight=8
    export function encoderRegisterEvent() {
        if (n_hasEncoder && !n_EncoderEventRegistered /* && !n_SpurSensorEventsRegistered */) {

            n_zweiEncoder = n_v3_2Motoren
            n_EncoderFaktor = 63.9 * (26 / 14) / (n_radDurchmesser_mm / 10 * Math.PI) // 5.811429

            // btf.setLedColors(btf.eRgbLed.b, Colors.Blue)
            // ========== Event Handler registrieren
            pins.onPulsed(a_PinEncoderM0[n_Hardware], PulseValue.High, function () {//
                if (selectMotorRichtungVor()) //(selectMotorSpeed() > c_MotorStop)
                    n_EncoderCounterM0++ // vorwärts
                else
                    n_EncoderCounterM0-- // rückwärts

                encoderAutoStop(false) // M0
            })

            /* if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start

                if (n_EncoderAutoStop) {
                    selectMotorStop() // selectMotor(c_MotorStop)
                    n_EncoderAutoStop = false
                }

                if (onEncoderStopHandler)
                    onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
            } */

            // ========== Event Handler registrieren


            if (n_zweiEncoder) {
                // btf.setLedColors(btf.eRgbLed.b, Colors.White)

                // ========== Event Handler registrieren
                pins.onPulsed(a_PinEncoderM1[n_Hardware], PulseValue.High, function () {
                    if (selectMotorRichtungVor()) //(selectMotorSpeed() > c_MotorStop)
                        n_EncoderCounterM1++ // vorwärts
                    else
                        n_EncoderCounterM1-- // rückwärts

                    encoderAutoStop(true) // M1
                })
                // ========== Event Handler registrieren

                pins.setPull(a_PinEncoderM1[n_Hardware], PinPullMode.PullUp) // Encoder PIN Eingang PullUp
            }

            // ! setPull muss nach allen onPulsed stehen, das deaktiviert die Events wieder !
            pins.setPull(a_PinEncoderM0[n_Hardware], PinPullMode.PullUp)  // Encoder PIN Eingang PullUp

            n_EncoderEventRegistered = true
        }
        return n_EncoderEventRegistered && n_hasEncoder
    }

    function encoderAutoStop(m1: boolean) {
        let encoderWert_impulse = Math.abs(n_EncoderCounterM0)
        if (n_zweiEncoder)
            encoderWert_impulse = Math.idiv(encoderWert_impulse + Math.abs(n_EncoderCounterM1), 2)

        if (n_EncoderStrecke_impulse > 0 && encoderWert_impulse >= n_EncoderStrecke_impulse) { // && Math.abs(n_EncoderCounterM0) >=
            n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start

            if (n_EncoderAutoStop) {
                selectMotorStop() // selectMotor(c_MotorStop)
                n_EncoderAutoStop = false
            }

            if (onEncoderStopHandler)
                onEncoderStopHandler(encoderWert_impulse / n_EncoderFaktor)
        }
    }


    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder starten • AutoStop %autostop bei (cm) %strecke || Impulse %impulse" weight=7
    //% autostop.shadow="toggleYesNo" autostop.defl=1
    //% strecke.min=1 strecke.max=255 strecke.defl=20
    //% impulse.shadow=toggleYesNo
    export function encoderStartStrecke(autostop: boolean, strecke: number, impulse = false) {
        if (encoderRegisterEvent()) {
            n_EncoderCounterM0 = 0 // Impuls Zähler zurück setzen
            n_EncoderCounterM1 = 0

            if (strecke > 0) {
                n_EncoderStrecke_impulse = impulse ? strecke : Math.round(strecke * n_EncoderFaktor)
                n_EncoderAutoStop = autostop
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
    //% block="Encoder M0 Wert (±cm) || Impulse %impulse" weight=6
    //% impulse.shadow=toggleYesNo
    export function encoderCounterM0(impulse = false) {
        if (impulse)
            return n_EncoderCounterM0
        else
            return Math.round(n_EncoderCounterM0 / n_EncoderFaktor)
    }

    // ========== EVENT HANDLER === sichtbarer Event-Block
    let onEncoderStopHandler: (cm: number) => void

    //% group="Encoder" subcategory="Strecken"
    //% block="wenn Ziel erreicht" weight=3
    //% draggableParameters=reporter
    export function onEncoderStop(cb: (cm: number) => void) {
        onEncoderStopHandler = cb
    }
    // ========== EVENT HANDLER === sichtbarer Event-Block



    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder Faktor" weight=2
    export function encoderFaktor() {
        return n_EncoderFaktor
    }

    //% group="Encoder" subcategory="Strecken"
    //% block="Encoder Timeout" weight=1
    export function timeoutStrecke() {
        n_EncoderAutoStop = false
        selectMotorStop()
        btf.setLedColors(btf.eRgbLed.a, Colors.Green, true, true)
    }



    // ========== group="2 Encoder" subcategory="Strecken"


    //% group="2 Encoder" subcategory="Strecken"
    //% block="2 Motoren ohne Servo (Buggy)" weight=6
    export function is_v3_2Motoren() {
        return n_v3_2Motoren
    }


    //% group="2 Encoder" subcategory="Strecken"
    //% block="Encoder M1 Wert (±cm) || Impulse %impulse" weight=4
    //% impulse.shadow=toggleYesNo
    export function encoderCounterM1(impulse = false) {
        if (impulse)
            return n_EncoderCounterM1
        else
            return Math.round(n_EncoderCounterM1 / n_EncoderFaktor)
    }

    //% group="2 Encoder" subcategory="Strecken"
    //% block="Encoder Mittelwert (abs cm) || Impulse %impulse" weight=2
    //% impulse.shadow=toggleYesNo
    export function encoderMittelwert(impulse = false) {
        return Math.idiv(Math.abs(encoderCounterM0(impulse)) + Math.abs(encoderCounterM1(impulse)), 2)
    }

} // r-strecken.ts
