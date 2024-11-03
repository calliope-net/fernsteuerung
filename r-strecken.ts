
namespace receiver { // r-strecken.ts

    //    [Colors.Off, encoderColor_c, strecke_impulse, encoderWert_impulse, aSelectEncoder[eSelectEncoder.impulseLinks], aSelectEncoder[eSelectEncoder.impulseRechts], aSelectEncoder[eSelectEncoder.encoderFaktor]
    // export enum eEncoderArray { colorb, colorc, iStrecke, iEncoderWert, iLinks, iRechts, encoderFaktor }
    export enum eSelectEncoder { eCount, eFaktor, iLinks, iRechts, iMittelwert, iStrecke, bPointer, status, colorb, colorc }

    let n_encoderConnected = true
    let a_SelectEncoder: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    function selectEncoder(checkEncoder = true) {
        /*  let a = [0, 0, 0, 0, 0]
       let encoderCount = 0        // [0]
       let encoderFaktor = 0       // [1]
       let impulseLinks = 0        // [2]
       let impulseRechts = 0       // [3]
       let impulseMittelwert = 0   // [4] */
        if (checkEncoder && n_encoderConnected)
            if (btf.n_Namespace == btf.eNamespace.receiver && encoderRegisterEvent()) { // v3 MKC
                a_SelectEncoder[eSelectEncoder.eCount] = n_zweiEncoder ? 2 : 1
                a_SelectEncoder[eSelectEncoder.eFaktor] = n_EncoderFaktor
                a_SelectEncoder[eSelectEncoder.iLinks] = n_EncoderCounterM0
                a_SelectEncoder[eSelectEncoder.iRechts] = n_EncoderCounterM1
                a_SelectEncoder[eSelectEncoder.iMittelwert] = n_zweiEncoder ? encoderMittelwert(true) : Math.abs(n_EncoderCounterM0)
            }
            else if (btf.n_Namespace == btf.eNamespace.cb2) { // Calli:bot
                a_SelectEncoder[eSelectEncoder.eCount] = 2
                a_SelectEncoder[eSelectEncoder.eFaktor] = cb2.n_EncoderFaktor
                let encoderValues = cb2.readEncoderValues()
                a_SelectEncoder[eSelectEncoder.iLinks] = encoderValues[0]
                a_SelectEncoder[eSelectEncoder.iRechts] = encoderValues[1]
                a_SelectEncoder[eSelectEncoder.iMittelwert] = cb2.readEncoderMittelwert()
            }
            else {
                a_SelectEncoder[eSelectEncoder.eCount] = 0
            }
        else
            a_SelectEncoder[eSelectEncoder.eCount] = 0
        //return a
        //return [encoderCount, encoderFaktor, impulseLinks, impulseRechts, impulseMittelwert]
    }

    function selectEncoderReset_neueStrecke() {
        if (n_encoderConnected) {
            if (btf.n_Namespace == btf.eNamespace.receiver) {
                n_EncoderCounterM0 = 0 // Impuls Zähler zurück setzen
                n_EncoderCounterM1 = 0
            }
            else if (btf.n_Namespace == btf.eNamespace.cb2) {
                n_encoderConnected = cb2.writeEncoderReset()
                // wenn kein CB2E wird n_encoderConnected gleich auf false gesetzt
            }
        }
        n_zehntelsekunden = input.runningTime()
        n_StatusM0 = eStautusM.off
        n_StatusM1 = eStautusM.off
        btf.resetTimer()
    }

    enum eStautusM { off, begin, end, stop }

    let n_RadioPacket_TimeStamp = 0
    // let n_raiseEncoderEvent_gestartet = false
    let n_BufferPointer = btf.eBufferPointer.m0 // m0 ist ungültig, 5 Strecken beginnen bei m1 ma mb mc md
    // let n_BufferPointer_handled = 0
    let n_zehntelsekunden = 0
    let n_StatusM0 = eStautusM.off
    let n_StatusM1 = eStautusM.off

    //% group="2 Fahrplan (Encoder Event in dauerhaft Schleife)" subcategory="Strecken"
    //% block="2 Encoder Ereignis auslösen %buffer %timeStamp || • Encoder %checkEncoder" weight=8
    //% buffer.shadow=btf_receivedBuffer19
    //% timeStamp.shadow=btf_RadioPacketTime
    //% checkEncoder.shadow=toggleYesNo checkEncoder.defl=1
    // ms.defl=25
    // inlineInputMode=inline 
    // expandableArgumentMode="toggle"
    export function buffer_raiseEncoderEvent(buffer: Buffer, timeStamp: number, checkEncoder = true) {
        if (buffer && (onEncoderEventHandler || on2EncoderEventHandler)) { // beide Objekte nicht undefined

            if (btf.isBetriebsart(buffer, btf.e0Betriebsart.p2Fahrplan)) { // Betriebsart 2 Fahrplan senden

                // 2 Motoren Buffer wenn m1 keine Daten hat, 2 Motoren hat nur Daten in ma und mc
                // fahrplan2Motoren zeigt an welche Daten im Buffer sind, nicht das Modell
                let fahrplan2Motoren = btf.getByte(buffer, btf.eBufferPointer.m1, btf.eBufferOffset.b0_Motor) == 0

                if (n_RadioPacket_TimeStamp != timeStamp) {
                    // bei dem selben Buffer (in der dauerhaft Schleife) nur einmal am Anfang machen
                    n_RadioPacket_TimeStamp = timeStamp
                    n_BufferPointer = fahrplan2Motoren ? btf.eBufferPointer.ma : btf.eBufferPointer.m1
                    // n_BufferPointer_handled = 0

                    //n_EncoderCounterM0 = 0 // Impuls Zähler zurück setzen
                    //n_EncoderCounterM1 = 0
                    selectEncoderReset_neueStrecke() // Impuls Zähler zurück setzen

                    // n_zehntelsekunden = input.runningTime()
                }

                if (n_BufferPointer >= btf.eBufferPointer.m1 && n_BufferPointer <= btf.eBufferPointer.md) { // nach Ende ist n_BufferPointer > md

                    let fahren0 = btf.getByte(buffer, n_BufferPointer, btf.eBufferOffset.b0_Motor)
                    let lenken0 = btf.getByte(buffer, n_BufferPointer, btf.eBufferOffset.b1_Servo)
                    let strecke0_cm = btf.getByte(buffer, n_BufferPointer, btf.eBufferOffset.b2_Fahrstrecke)
                    let strecke_check = fahren0 > 0 && fahren0 != c_MotorStop && lenken0 > 0 && strecke0_cm > 0

                    let fahren1 = 0
                    let strecke1_cm = 0

                    if (fahrplan2Motoren) {
                        fahren1 = btf.getByte(buffer, n_BufferPointer + 3, btf.eBufferOffset.b0_Motor)
                        strecke1_cm = btf.getByte(buffer, n_BufferPointer + 3, btf.eBufferOffset.b2_Fahrstrecke)
                        strecke_check =
                            !(fahren0 == 0 && fahren1 == 0) // nicht beide 0, wäre wirkungslos
                            &&
                            (
                                fahren0 != c_MotorStop && strecke0_cm > 0 // mindestens einer muss Geschwindigkeit und Strecken Länge haben
                                ||
                                fahren1 != c_MotorStop && strecke1_cm > 0
                            )
                    }


                    if (strecke_check) {
                        let strecke0_impulse = 0 // SOLL Wert aus Buffer
                        let strecke1_impulse = 0
                        let encoder0_impulse = 0 // IST Wert aus EncoderCounter bzw. Zeit
                        let encoder1_impulse = 0

                        selectEncoder(checkEncoder) // Aufruf schreibt in Array a_SelectEncoder

                        a_SelectEncoder[eSelectEncoder.bPointer] = n_BufferPointer
                        //a_SelectEncoder[eSelectEncoder.status] = 0
                        //a_SelectEncoder[eSelectEncoder.colorb] = Colors.Off
                        //a_SelectEncoder[eSelectEncoder.colorc] = Colors.Off
                        // let aSelectEncoder = selectEncoder(checkEncoder)

                        // Encoder
                        //if (checkEncoder && encoderRegisterEvent()) { // n_EncoderEventRegistered && n_hasEncoder
                        if (a_SelectEncoder[eSelectEncoder.eCount] == 0) {
                            // kein Encoder - zehntelsekunden
                            strecke0_impulse = strecke0_cm // SOLL cm sind zehntelsekunden
                            strecke1_impulse = strecke1_cm
                            encoder0_impulse = Math.idiv(input.runningTime() - n_zehntelsekunden, 100) // zehntelsekunden Fahrzeit der aktuellen Strecke
                            encoder1_impulse = encoder0_impulse

                            a_SelectEncoder[eSelectEncoder.colorc] = Colors.Yellow // kein Encoder gelb
                        }
                        else {
                            // immer wenn encoder vorhanden

                            // Länge der Strecke aus Buffer cm oder Impulse?
                            if (btf.getSensor(buffer, n_BufferPointer, btf.eSensor.b7Impulse)) {
                                strecke0_impulse = strecke0_cm
                                strecke1_impulse = strecke1_cm
                            }
                            else {
                                // cm in Impulse umrechnen
                                strecke0_impulse = Math.round(strecke0_cm * a_SelectEncoder[eSelectEncoder.eFaktor]) // encoderFaktor
                                strecke1_impulse = Math.round(strecke1_cm * a_SelectEncoder[eSelectEncoder.eFaktor]) // encoderFaktor
                            }


                            // aktuellen Encoder Zählerstand einlesen bzw. zehntelsekunden seit Start der Strecke
                            if (fahrplan2Motoren) {
                                // Fahrplan 2 Strecken, 2 Motoren
                                encoder0_impulse = Math.abs(a_SelectEncoder[eSelectEncoder.iLinks])  // links
                                encoder1_impulse = Math.abs(a_SelectEncoder[eSelectEncoder.iRechts]) // rechts

                            }
                            else { //  if (a_SelectEncoder[eSelectEncoder.eCount] > 0) {
                                // Fahrplan 5 Strecken Fahren und Lenken = Encoder Mittelwert bei 2 Motoren
                                encoder0_impulse = a_SelectEncoder[eSelectEncoder.iMittelwert] // links oder Mittelwert (Betrag)

                                // Test ob Encoder vorhanden nur bei fischertechnik; Callibot erkennt das vorher am Typ
                                if (encoder0_impulse < 10 && (input.runningTime() - n_zehntelsekunden) > 2000) {
                                    // kein Impuls nach 2s: kein Encoder vorhanden
                                    n_encoderConnected = false // nächster Aufruf zählt dann nach Zeit


                                    // kein Encoder - zehntelsekunden - wie oben
                                    strecke0_impulse = strecke0_cm // SOLL cm sind zehntelsekunden
                                    //strecke1_impulse = strecke1_cm
                                    encoder0_impulse = Math.idiv(input.runningTime() - n_zehntelsekunden, 100) // zehntelsekunden Fahrzeit der aktuellen Strecke
                                    //encoder1_impulse = encoder0_impulse

                                    a_SelectEncoder[eSelectEncoder.colorc] = Colors.Red // timeout kein Encoder rot
                                }
                                else {
                                    // kein timeout - nur LED Farbe ob Encoder vorhanden
                                    if (a_SelectEncoder[eSelectEncoder.colorc] == Colors.Off)
                                        if (a_SelectEncoder[eSelectEncoder.eCount] == 2) {
                                            if (Math.abs(a_SelectEncoder[eSelectEncoder.iRechts]) < 10 && (input.runningTime() - n_zehntelsekunden) > 2000) // 3 impulseRechts
                                                // kein Impuls nach 2s: kein zweiter Encoder vorhanden
                                                a_SelectEncoder[eSelectEncoder.colorc] = Colors.Violet // 2. Encoder zählt nicht Fehler lila
                                            else
                                                a_SelectEncoder[eSelectEncoder.colorc] = Colors.Blue // 2 Encoder blau
                                        }
                                        else
                                            a_SelectEncoder[eSelectEncoder.colorc] = Colors.Green // 1 Encoder grün
                                    // zwei Encoder - nur LED Farbe ^^


                                    /*   // Länge der Strecke aus Buffer cm oder Impulse?
                                      if (btf.getSensor(buffer, n_BufferPointer, btf.eSensor.b7Impulse)) {
                                          strecke0_impulse = strecke0_cm
                                          strecke1_impulse = strecke1_cm
                                      }
                                      else {
                                          // cm in Impulse umrechnen
                                          strecke0_impulse = Math.round(strecke0_cm * a_SelectEncoder[eSelectEncoder.eFaktor]) // encoderFaktor
                                          strecke1_impulse = Math.round(strecke1_cm * a_SelectEncoder[eSelectEncoder.eFaktor]) // encoderFaktor
                                      } */
                                } // else (kein) encoder timeout

                            } // else fahrplan2Motoren = Fahrplan 5 Strecken

                        } // else kein encoder = >0



                        // Abstand Sensor
                        let abstand_cm = btf.getAbstand(buffer)
                        let abstandSensor = btf.getSensor(buffer, n_BufferPointer, btf.eSensor.b6Abstand)
                            && abstand_cm > 0
                            && fahren0 > c_MotorStop // nur vorwärts
                            && selectAbstandSensorConnected()

                        let abstandStop = abstandSensor
                            && (selectAbstand_cm(true) < abstand_cm)
                            && (input.runningTime() - n_zehntelsekunden) > 100 // erste 100ms Messungen selectAbstand_cm(true) ignorieren

                        if (abstandStop)
                            a_SelectEncoder[eSelectEncoder.colorb] = Colors.Red
                        else if (abstandSensor)
                            a_SelectEncoder[eSelectEncoder.colorb] = Colors.Yellow



                        if (fahrplan2Motoren && on2EncoderEventHandler) {
                            // Fahrplan 2 Strecken, 2 Motoren

                            let m0fahren = encoder0_impulse < strecke0_impulse
                            let m1fahren = encoder1_impulse < strecke1_impulse

                            // nur Motor M0
                            if (m0fahren && n_StatusM0 == eStautusM.off) { // nur einmal los fahren bei gleicher Strecke
                                n_StatusM0 = eStautusM.begin
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0
                                on2EncoderEventHandler(fahren0, 0, a_SelectEncoder)
                            }
                            else if (!m0fahren && n_StatusM0 == eStautusM.begin) {
                                n_StatusM0 = eStautusM.end
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0
                                on2EncoderEventHandler(c_MotorStop, 0, a_SelectEncoder)
                            }

                            // nur Motor M1
                            if (m1fahren && n_StatusM1 == eStautusM.off) { // nur einmal los fahren bei gleicher Strecke
                                n_StatusM1 = eStautusM.begin
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM1
                                on2EncoderEventHandler(0, fahren1, a_SelectEncoder)
                            }
                            else if (!m1fahren && n_StatusM1 == eStautusM.begin) {
                                n_StatusM1 = eStautusM.end
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM1
                                on2EncoderEventHandler(0, c_MotorStop, a_SelectEncoder)
                            }

                            // Abstand Sensor Stop
                            if (abstandStop) {
                                // Stop 2 Motoren
                                n_StatusM0 = eStautusM.stop
                                n_StatusM1 = eStautusM.stop
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0
                                on2EncoderEventHandler(c_MotorStop, c_MotorStop, a_SelectEncoder)
                            }

                            if (n_StatusM0 >= eStautusM.end && n_StatusM1 >= eStautusM.end) {
                                // nächste Strecke fahren
                                n_BufferPointer += 6
                                selectEncoderReset_neueStrecke() // Impuls Zähler zurück setzen
                            }

                        }
                        else if (!fahrplan2Motoren && onEncoderEventHandler) {
                            // Fahrplan 5 Strecken Fahren und Lenken = Encoder Mittelwert bei 2 Motoren

                            let m0fahren = encoder0_impulse < strecke0_impulse

                            // nur Motor M0
                            if (m0fahren && n_StatusM0 == eStautusM.off) { // nur einmal los fahren bei gleicher Strecke
                                n_StatusM0 = eStautusM.begin
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0

                                a_SelectEncoder[eSelectEncoder.iMittelwert] = encoder0_impulse
                                a_SelectEncoder[eSelectEncoder.iStrecke] = strecke0_impulse

                                onEncoderEventHandler(fahren0, lenken0, a_SelectEncoder)
                            }
                            else if (!m0fahren && n_StatusM0 == eStautusM.begin) {
                                n_StatusM0 = eStautusM.end
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0
                                onEncoderEventHandler(c_MotorStop, 16, a_SelectEncoder)
                            }

                            // Abstand Sensor Stop
                            if (abstandStop) {
                                // Stop 2 Motoren
                                n_StatusM0 = eStautusM.stop
                                // n_StatusM1 = eStautusM.stop
                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0
                                onEncoderEventHandler(c_MotorStop, 16, a_SelectEncoder)
                            }

                            if (n_StatusM0 >= eStautusM.end) {
                                // nächste Strecke fahren
                                n_BufferPointer += 3
                                selectEncoderReset_neueStrecke() // Impuls Zähler zurück setzen
                            }


                            /* 
                                                        if (!abstandStop && encoder0_impulse < strecke0_impulse) {
                                                            // los Fahren und Lenken
                                                            //if (abstandSensor)
                                                            //    a_SelectEncoder[eSelectEncoder.colorb] = Colors.Yellow
                                                            // btf.setLedColors(btf.eRgbLed.b, Colors.Yellow, abstandSensor)
                                                         
                                                            //if (n_BufferPointer_handled != n_BufferPointer) { // nur einmal los fahren bei gleichem n_BufferPointer
                                                            //    n_BufferPointer_handled = n_BufferPointer
                            
                                                            if (n_StatusM0 == eStautusM.off) { // nur einmal los fahren bei gleicher Strecke
                                                                n_StatusM0 = eStautusM.begin
                                                                // btf.resetTimer()
                            
                                                                a_SelectEncoder[eSelectEncoder.iMittelwert] = encoder0_impulse
                                                                a_SelectEncoder[eSelectEncoder.iStrecke] = strecke0_impulse
                            
                                                                a_SelectEncoder[eSelectEncoder.status] = n_StatusM0
                                                                onEncoderEventHandler(fahren0, lenken0, a_SelectEncoder)
                            
                                                            }
                                                            // ende los Fahren und Lenken
                                                        }
                                                        else {
                                                            // Stop Fahren und Lenken
                            
                                                            n_StatusM0 = abstandStop ? eStautusM.stop : eStautusM.end
                            
                                                            a_SelectEncoder[eSelectEncoder.status] = n_StatusM0 // (strecke_check && !abstandStop) ? 2 : 3
                                                            onEncoderEventHandler(c_MotorStop, 16, a_SelectEncoder)
                            
                                                            // nächste Strecke fahren
                                                            n_BufferPointer += 3
                                                            selectEncoderReset_neueStrecke() // Impuls Zähler zurück setzen
                                                            // n_zehntelsekunden = input.runningTime()
                            
                                                        } // ende Stop Fahren und Lenken
                             */
                        } // else fahrplan2Motoren = Fahrplan 5 Strecken
                        else {
                            // onEncoderEventHandler oder on2EncoderEventHandler nicht registriert
                            n_BufferPointer += fahrplan2Motoren ? 6 : 3
                        }
                    } // strecke_check
                    else {
                        // strecke ungültig, fahren, lenken, länge sind 0
                        // nächste Strecke fahren
                        n_BufferPointer += fahrplan2Motoren ? 6 : 3
                        //selectEncoderReset() // Impuls Zähler zurück setzen
                        //n_zehntelsekunden = input.runningTime()
                    }

                } // n_BufferPointer <= btf.eBufferPointer.md

            } // Betriebsart 2 Fahrplan senden

        } // if(buffer && onEncoderEventHandler)
    }

    // ========== EVENT HANDLER === sichtbarer Event-Block
    let onEncoderEventHandler: (fahren: number, lenken: number, array: number[]) => void

    //% group="2 Fahrplan (Encoder Event in dauerhaft Schleife)" subcategory="Strecken"
    //% block="wenn Encoder Ereignis" weight=3
    //% draggableParameters=reporter
    export function onEncoderEvent(cb: (fahren: number, lenken: number, array: number[]) => void) {
        onEncoderEventHandler = cb
    }


    let on2EncoderEventHandler: (links: number, rechts: number, array: number[]) => void

    //% group="2 Fahrplan (Encoder Event in dauerhaft Schleife)" subcategory="Strecken"
    //% block="wenn Encoder Ereignis (2 Motoren)" weight=2
    //% draggableParameters=reporter
    export function on2EncoderEvent(cb: (links: number, rechts: number, array: number[]) => void) {
        on2EncoderEventHandler = cb
    }
    // ========== EVENT HANDLER === sichtbarer Event-Block



    //% group="2 Fahrplan (Encoder Event in dauerhaft Schleife)" subcategory="Strecken"
    //% block="<array> %array %e" weight=2
    export function encoderArray(array: any, e: eSelectEncoder): number {
        let a: number[] = array
        return a[e]
    }




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
            if (n_zweiEncoder)
                // Buggy
                n_EncoderFaktor = 63.9 * (20 / 10) / (n_radDurchmesser_mm / 10 * Math.PI) // 6.258462 mit 65mm Rad, 2 Zahnräder 10:20
            else
                n_EncoderFaktor = 63.9 * (26 / 14) / (n_radDurchmesser_mm / 10 * Math.PI) // 5.811429 mit 65mm Rad, Differenzialgetriebe 14:26

            // btf.setLedColors(btf.eRgbLed.b, Colors.Blue)
            // ========== Event Handler registrieren
            pins.onPulsed(a_PinEncoderM0[n_Hardware], PulseValue.High, function () {//
                let motorRichtungVor: boolean

                if (n_Hardware == eHardware.car4)  // Fahrmotor am Qwiic Modul
                    motorRichtungVor = a_QwiicMotorSpeed[eQwiicMotor.ma] >= c_MotorStop
                else                               // Standard M0 Fahrmotor an Calliope v3 Pins
                    motorRichtungVor = a_DualMotor_percent[eDualMotor.M0] >= 0

                if (motorRichtungVor) // nur Motor M0 (bei zwei Motoren links) oder 1 Qwiic Fahr-Motor
                    n_EncoderCounterM0++ // vorwärts
                else
                    n_EncoderCounterM0-- // rückwärts

                encoderAutoStop(false) // M0
            })


            // ========== Event Handler registrieren


            if (n_zweiEncoder) { // nur Buggy Calliope v3 mit Leiterplatte, bei Qwiic keine 2 Encoder

                // ========== Event Handler registrieren
                pins.onPulsed(a_PinEncoderM1[n_Hardware], PulseValue.High, function () {
                    if (a_DualMotor_percent[eDualMotor.M1] >= 0) // zweiter M1 Fahrmotor an Calliope v3 Pins
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

    // group="Encoder" subcategory="Strecken"
    // block="Encoder Timeout" weight=1
    /* export function timeoutStrecke() {
        n_EncoderAutoStop = false
        selectMotorStop()
        btf.setLedColors(btf.eRgbLed.a, Colors.Green, true, true)
    } */



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
