
namespace receiver { // r-sensorevents.ts


    //  export enum eDH { hell = 1, dunkel = 0 }

    //% group="Spur Sensor (dauerhaft oder ReadPin)" subcategory="Sensoren"
    //% block="Spur Sensor links hell" weight=7
    export function getSpurLinksHell() {
        //if (n_SpurSensorEventsRegistered)
        //    return (l == eDH.hell) ? n_SpurLinksHell : !n_SpurLinksHell
        if (a_raiseSpurEvent_gestartet[0] || a_raiseSpurEvent_gestartet[1])
            return n_links_hell
        else
            return pinSpurLinks(eDH.hell) // DigitalPin direkt lesen
    }

    //% group="Spur Sensor (dauerhaft oder ReadPin)" subcategory="Sensoren"
    //% block="Spur Sensor rechts hell" weight=6
    export function getSpurRechtsHell() {
        //if (n_SpurSensorEventsRegistered)
        //    return (r == eDH.hell) ? n_SpurRechtsHell : !n_SpurRechtsHell
        if (a_raiseSpurEvent_gestartet[0] || a_raiseSpurEvent_gestartet[1])
            return n_rechts_hell
        else
            return pinSpurRechts(eDH.hell) // DigitalPin direkt lesen
    }

    // group="Spur Sensor (Event oder ReadPin)" subcategory="Sensoren" deprecated=1
    // block="Spur Sensoren links %l und rechts %r" weight=5
    /*  export function getSpursensor(l: eDH, r: eDH) {
         return getSpurLinks(l) && getSpurRechts(r)
     } */





    // ========== group="Spur Sensor" subcategory="Sensoren"

    let a_raiseSpurEvent_gestartet = [false, false]
    // let n_SpurTimer = input.runningTime()
    // let n_Spur2Bit = 0 // letzter Status 00 01 10 11
    let n_links_hell = false
    let n_rechts_hell = false

    //% group="Spur Sensor (dauerhaft Schleife)" subcategory="Sensoren"
    //% block="Spur Sensor Ereignis auslösen %on || • Pause %ms ms" weight=3
    //% on.shadow=toggleOnOff
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseSpurEvent(on: boolean, ms = 25, index = 0) {
        if (on /* && spurSensorRegisterEvents() */) { // nur einmalig
            //if (!a_raiseSpurEvent_gestartet[index])
            //    spurSensorRegisterEvents() 

            // let t = input.runningTime() - n_SpurTimer // ms seit letztem raiseSpurEvent
            // if (t < ms)
            //     basic.pause(t) // restliche Zeit-Differenz warten
            // n_SpurTimer = input.runningTime()

            let spurB = pinSpurBoolean()
            if (n_links_hell !== spurB[0] || n_rechts_hell !== spurB[1] || !a_raiseSpurEvent_gestartet[index]) { // bei Änderung oder beim ersten Mal - ganz am Anfang
                n_links_hell = spurB[0]
                n_rechts_hell = spurB[1]
                spurEventHandler()
            }
            /* 
                        //let spur = readInputs(i2c)[0] & 0b11
                        //let spur = pinSpur2Bit()
                        let spur = (pinSpurLinks(eDH.hell) ? 0b10 : 0) + (pinSpurRechts(eDH.hell) ? 0b01 : 0)
                        //let spur = (n_SpurLinksHell ? 0b10 : 0) + (n_SpurRechtsHell ? 0b01 : 0)
            
                        if (n_Spur2Bit != spur || !a_raiseSpurEvent_gestartet[index]) { // bei Änderung oder beim ersten Mal - ganz am Anfang
                            n_Spur2Bit = spur
                            spurEventHandler()
                        } */
            a_raiseSpurEvent_gestartet[index] = true
        }
        else if (a_raiseSpurEvent_gestartet[index]) {
            a_raiseSpurEvent_gestartet[index] = false
            spurEventHandler()
        }
    }

    function spurEventHandler() {
        if (onAbstandEventHandler)
            onAbstandEventHandler(n_AbstandSensor, n_AbstandStop, 0)
        if (onSpurEventHandler)
            onSpurEventHandler(n_links_hell, n_rechts_hell, n_AbstandStop)
        //  onSpurEventHandler((n_Spur2Bit & 0b10) == 0b10, (n_Spur2Bit & 0b01) == 0b01, n_AbstandStop)
    }

    let onSpurEventHandler: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) => void

    // group="Spur Sensor" subcategory="Sensoren"
    //% group="Spur Sensor (dauerhaft Schleife)" subcategory="Sensoren"
    //% block="wenn Spur Sensor Ereignis" weight=2
    //% draggableParameters=reporter
    export function onSpurEvent(cb: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) => void) {
        onSpurEventHandler = cb
    }





    // ========== group="Ultraschall oder Laser Distance Sensor" subcategory="Sensoren"

    //% group="Ultraschall oder Laser Distance Sensor" subcategory="Sensoren"
    //% block="Abstand Sensor angeschlossen" weight=8
    export function selectAbstandSensorConnected() {
        if (btf.n_Namespace == btf.eNamespace.cb2)
            return true
        else
            return qwiicUltrasonicConnected() || laserSensorConnected()
        /* else if (n_Hardware == eHardware.v3) {
            return qwiicUltrasonicConnected() || laserSensorConnected()
        }
        else if (n_Hardware == eHardware.car4)
            return true
        else
            return false */
    }

    //% group="Ultraschall oder Laser Distance Sensor" subcategory="Sensoren"
    //% block="Laser Sensor Ranging %on" weight=7
    //% on.shadow=toggleOnOff
    export function selectRanging(on: boolean) {
        if (laserSensorConnected())
            if (on)
                laserRanging(eSYSTEM__MODE_START.startRanging)
            else
                laserRanging(eSYSTEM__MODE_START.stopRanging)
    }

    //% group="Ultraschall oder Laser Distance Sensor" subcategory="Sensoren"
    //% block="Abstand cm • einlesen %read" weight=6
    //% read.shadow=toggleYesNo
    export function selectAbstand_cm(read: boolean) {
        if (btf.n_Namespace == btf.eNamespace.cb2)
            return cb2.readUltraschallAbstand()
        else if (qwiicUltrasonicConnected()) // n_Hardware == eHardware.v3 && 
            return getQwiicUltrasonic(read) // in r-qwiic.ts i2c einlesen
        else if (laserSensorConnected()) // n_Hardware == eHardware.v3 && 
            return laserAbstand_cm(read, true)
        ///else if (n_Hardware == eHardware.car4)
        //    return pinGroveUltraschall_cm() // in r-advanced.ts
        else
            return 0
    }

    //% blockId=receiver_getAbstand blockHidden=true
    //% block="%buffer Abstand in cm" weight=5
    //% buffer.shadow="btf_receivedBuffer19"
    export function receiver_getAbstand(buffer: Buffer) { // blockHidden
        return btf.getAbstand(buffer)
    }


    // aufgerufen von r-fernsteuerung.ts
    export function raiseAbstandMotorStop(stop_cm: number, ms = 25) {
        //if (on && selectAbstandSensorConnected()) {
        //if (selectMotorSpeed() > c_MotorStop) { // nur vorwärts oder Stop

        let t = input.runningTime() - n_AbstandTimer // ms seit letztem raiseAbstandMotorStop
        if (t < ms)
            basic.pause(t) // restliche Zeit-Differenz warten
        n_AbstandTimer = input.runningTime()

        let cm = selectAbstand_cm(true)

        if (cm < stop_cm) {
            selectMotorStop() //    selectMotor(c_MotorStop)
            return true
        } else
            return false

        //} else
        //    return false
    }



    // ========== group="Distance Sensor (dauerhaft Schleife)" subcategory="Sensoren"

    let a_raiseAbstandEvent_gestartet = [false, false]
    let n_AbstandTimer = input.runningTime()
    let n_AbstandStop = false // letzter Status
    let n_AbstandSensor = false // Sensor aktiviert (im Buffer bzw. Knopf A)

    //% group="Distance Sensor (dauerhaft Schleife)" subcategory="Sensoren"
    //% block="Abstand Sensor Ereignis auslösen %on • Stop %stop_cm cm || • Start %start_cm cm • Pause %ms ms" weight=3
    //% on.shadow=toggleOnOff
    //% stop_cm.defl=30
    // start_cm.defl=35
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseAbstandEvent(on: boolean, stop_cm: number, start_cm?: number, ms = 25, index = 0) { //abstand_Sensor?: boolean, bei Aufruf mit buffer ist index=1 (r-fernsteuerung.ts)
        // n_AbstandSensor = (abstand_Sensor == undefined) ? on : abstand_Sensor
        n_AbstandSensor = on

        //if (on && n_QwiicUltrasonicConnected == undefined) {
        //    selectAbstand(true) // Test ob connected
        //}

        if (on && selectAbstandSensorConnected()) {

            if (start_cm == undefined)
                start_cm = stop_cm + 5

            if (!a_raiseAbstandEvent_gestartet[index])
                selectRanging(true) // nur Laser Sensor StartRanging einmal am Anfang

            let t = input.runningTime() - n_AbstandTimer // ms seit letztem raiseAbstandEvent
            if (t < ms)
                basic.pause(t) // restliche Zeit-Differenz warten
            n_AbstandTimer = input.runningTime()

            let cm = selectAbstand_cm(true)

            if (!n_AbstandStop && cm < stop_cm)
                abstandEventHandler(true, cm) // Stop Ereignis auslösen
            else if (n_AbstandStop && cm > Math.max(start_cm, stop_cm))
                abstandEventHandler(false, cm) // Start Ereignis auslösen
            else if (!a_raiseAbstandEvent_gestartet[index])
                abstandEventHandler(false, cm) // Start Ereignis auslösen am Anfang

            a_raiseAbstandEvent_gestartet[index] = true
        }
        else if (a_raiseAbstandEvent_gestartet[index]) {
            selectRanging(false) // nur Laser Sensor StopRanging
            a_raiseAbstandEvent_gestartet[index] = false
            abstandEventHandler(false, 0) // kein Stop Ereignis auslösen am Ende
        }
    }

    // wird auch von Laser aufgerufen
    export function abstandEventHandler(abstand_Stop: boolean, cm: number) {
        n_AbstandStop = abstand_Stop
        if (onAbstandEventHandler)
            onAbstandEventHandler(n_AbstandSensor, n_AbstandStop, cm)
        if (onSpurEventHandler)
            onSpurEventHandler(n_links_hell, n_rechts_hell, n_AbstandStop)
        //  onSpurEventHandler((n_Spur2Bit & 0b10) == 0b10, (n_Spur2Bit & 0b01) == 0b01, n_AbstandStop)
    }

    let onAbstandEventHandler: (abstand_Sensor: boolean, abstand_Stop: boolean, cm: number) => void

    //% group="Distance Sensor (dauerhaft Schleife)" subcategory="Sensoren"
    //% block="wenn Abstand Sensor Ereignis" weight=2
    //% draggableParameters=reporter
    export function onAbstandEvent(cb: (abstand_Sensor: boolean, abstand_Stop: boolean, cm: number) => void) {
        onAbstandEventHandler = cb
    }


} // r-sensorevents.ts
