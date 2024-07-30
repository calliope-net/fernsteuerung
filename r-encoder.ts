
namespace receiver { // r-pins.ts

    let n_EncoderCounter: number = 0 // Impuls Zähler
    let n_EncoderFaktor = 63.3 * (26 / 14) / (8 * Math.PI) // 63.3 Motorwelle * (26/14) Zahnräder / (8cm * PI) Rad Umfang = 4.6774502 cm
    let n_EncoderStrecke_impulse: number = 0
    export let n_EncoderAutoStop = false // true während der Fahrt, false bei Stop nach Ende der Strecke


    // aufgerufen von receiver.beimStart
    export function encoderRegisterEvent(radDmm: number) { // radDmm: Rad Durchmesser in Millimeter
        if (n_Hardware == eHardware.v3) {

            if (!radDmm)
                radDmm = 65
            n_EncoderFaktor = 63.9 * (26 / 14) / (radDmm / 10 * Math.PI)

            // ========== Event Handler registrieren
            pins.onPulsed(a_PinEncoder[n_Hardware], PulseValue.Low, function () {

                if (a_DualMotorSpeed[eDualMotor.M0] > c_MotorStop)
                    n_EncoderCounter++ // vorwärts
                else
                    n_EncoderCounter-- // rückwärts

                if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                    n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start

                    if (n_EncoderAutoStop) {

                        dualMotor128(eDualMotor.M0, c_MotorStop)
                        n_EncoderAutoStop = false
                    }

                    if (onEncoderStopHandler)
                        onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
                }

            })
            // ========== Event Handler

            // Encoder PIN Eingang PullUp
            pins.setPull(a_PinEncoder[n_Hardware], PinPullMode.PullUp)
        }

        else if (n_Hardware == eHardware.car4) {

            if (!radDmm)
                radDmm = 80
            n_EncoderFaktor = 63.9 * (26 / 14) / (radDmm / 10 * Math.PI)

            // ========== Event Handler registrieren
            pins.onPulsed(a_PinEncoder[n_Hardware], PulseValue.Low, function () {

                if (a_QwiicMotorSpeed[eQwiicMotor.ma] > c_MotorStop)
                    n_EncoderCounter++ // vorwärts
                else
                    n_EncoderCounter-- // rückwärts

                if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                    n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start

                    if (n_EncoderAutoStop) {

                        qwiicMotor128(eQwiicMotor.ma, c_MotorStop) // Qwiic
                        n_EncoderAutoStop = false
                    }

                    if (onEncoderStopHandler)
                        onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
                }

            })
            // ========== Event Handler

            // Encoder PIN Eingang PullUp
            pins.setPull(a_PinEncoder[n_Hardware], PinPullMode.PullUp)

        }


        /* 
        
                if (n_Hardware == eHardware.v3 || n_Hardware == eHardware.car4) {
        
                    n_EncoderFaktor = 63.9 * (26 / 14) / (radDmm / 10 * Math.PI)
        
                    // ========== Event Handler registrieren
                    pins.onPulsed(a_PinEncoder[n_Hardware], PulseValue.Low, function () {
                        // soll Prellen verhindern 2000 // 2500 geht noch; 3000 geht nicht mehr
                        if (pins.pulseDuration() > 2000) { // 2 ms = 500 Hz, gemessen 174 Hz max. Drehzahl, 2 Flanken ~ 400 Hz
        
                            // Encoder 63.9 Impulse pro U/Motorwelle
                            //if (selectEncoderMotorRichtung()) // true: vorwärts > 128
                            //    n_EncoderCounter += 1 // vorwärts
                            //else
                            //    n_EncoderCounter -= 1 // rückwärts
        
                            switch (n_Hardware) {
                                case eHardware.v3: {
                                    if (n_v3Motor0Speed > c_MotorStop)
                                        n_EncoderCounter++ // vorwärts
                                    else //if (n_v3Motor0Speed < c_MotorStop)
                                        n_EncoderCounter-- // rückwärts
                                    break
                                }
                                case eHardware.car4: {
                                    if (a_qMotorSpeed[eMotor.ma] > c_MotorStop)
                                        n_EncoderCounter++ // vorwärts
                                    else //if (a_qMotorSpeed[eMotor.ma] < c_MotorStop)
                                        n_EncoderCounter-- // rückwärts
                                    break
                                }
                            }
        
        
        
                            if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                                n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start
        
                                //n_EncoderStopEvent = true
                                if (n_EncoderAutoStop) {
                                    selectEncoderMotor_v3_car4(c_MotorStop) //   motorA255(c_MotorStop)
                                    n_EncoderAutoStop = false
                                }
        
                                if (onEncoderStopHandler)
                                    onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
                            }
                        }
                    })
                    // ========== Event Handler
        
                    // Encoder PIN Eingang PullUp
                    pins.setPull(a_PinEncoder[n_Hardware], PinPullMode.PullUp)
        
                } else if (n_Hardware == eHardware.calli2bot) {
        
                } */
    }


    //% group="Encoder" subcategory="Encodermotor"
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



    export enum eEncoderEinheit { cm, Impulse }

    //% group="Encoder" subcategory="Encodermotor"
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

    //% group="Event Handler" subcategory="Encodermotor"
    //% block="wenn Ziel erreicht"
    //% draggableParameters=reporter
    export function onEncoderStop(cb: (cm: number) => void) {
        onEncoderStopHandler = cb
    }
    // ========== EVENT HANDLER === sichtbarer Event-Block



    /* 
    
        //% group="Encoder" subcategory="Encodermotor"
        //% block="Encodermotor starten (1 ↓ 128 ↑ 255) %speed" weight=7
        //% speed.min=0 speed.max=255 speed.defl=128
        export function encoderSelectMotor(speed: number) {
    
            if (n_Hardware == eHardware.v3) // Fahrmotor an Calliope v3 Pins
                dualMotor128(eDualMotor.M0, speed)
    
            else if (n_Hardware == eHardware.car4) // Fahrmotor am Qwiic Modul
                qwiicMotor128(eQwiicMotor.ma, speed)
        }
    
    
     */
    // ========== group="Encoder" subcategory="Encodermotor"


    /* 
        // Event Handler
        pins.onPulsed(a_PinEncoder[n_Modell], PulseValue.Low, function () {
            // Encoder 63.3 Impulse pro U/Motorwelle
            if (selectMotorRichtung()) // true: vorwärts > 128
                n_EncoderCounter += 1 // vorwärts
            else
                n_EncoderCounter -= 1 // rückwärts
    
            if (n_EncoderStrecke_impulse > 0 && Math.abs(n_EncoderCounter) >= n_EncoderStrecke_impulse) {
                n_EncoderStrecke_impulse = 0 // Ereignis nur einmalig auslösen, wieder aktivieren mit encoder_start
    
                //n_EncoderStopEvent = true
                if (n_EncoderAutoStop) {
                    selectMotorStop() //   motorA255(c_MotorStop)
                    n_EncoderAutoStop = false
                }
    
                if (onEncoderStopHandler)
                    onEncoderStopHandler(n_EncoderCounter / n_EncoderFaktor)
            }
        })
     */


    /* // ========== group="mehr" subcategory="Encodermotor"

    //% group="... mehr" subcategory="Encodermotor"
    //% block="Fahrstrecke %pVergleich %cm cm" weight=7
    export function encoderVergleich(e: eVergleich, cm: number) {
        switch (e) {
            case eVergleich.gt: return encoderCounter(eEncoderEinheit.cm) >= cm
            case eVergleich.lt: return encoderCounter(eEncoderEinheit.cm) <= cm
            default: return false
        }
    }

    //% group="... mehr" subcategory="Encodermotor"
    //% block="warte bis Strecke %pVergleich %cm cm || Pause %ms ms" weight=6
    //% cm.defl=15 ms.defl=20
    export function encoderPause(pVergleich: eVergleich, cm: number, ms?: number) {
        while (encoderVergleich(pVergleich, cm)) {
            basic.pause(ms)
        }
    }

 */


} // r-pins.ts
