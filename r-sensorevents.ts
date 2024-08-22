
namespace receiver { // r-sensorevents.ts


    let n_SpursensorEventsRegistered = false
    //let n_inEvent = 0
    export let n_SpurLinksHell = false // hell=true
    export let n_SpurRechtsHell = false
    const c_pulseDuration = 60000 // µs 50 ms

    //% group="Spur Sensor (beim Start)" subcategory="Sensoren"
    //% block="Spur Sensor Pin Ereignisse registrieren (beim Start)" weight=8
    export function spursensorRegisterEvents() {
        if (!n_SpursensorEventsRegistered) {
            // n_Spursensor = (pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) << 1) | pins.digitalReadPin(a_PinSpurrechts[n_Hardware])
            n_SpurLinksHell = pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == 1
            n_SpurRechtsHell = pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == 1

            // PulseValue.Low
            // ↑high, ↓low, Event niedrig bei l->h loslassen
            // Zeit wie lange es low ↓↑ war in µs

            pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.Low, function () {
                // links hell
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurLinksHell = true
                    // raiseSpurEvent()
                    if (onSpurPinEventHandler)
                        onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    // if (onSpurStopEventHandler)
                    //     onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)

                }
            })
            pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.High, function () {
                // links dunkel
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurLinksHell = false
                    // raiseSpurEvent()
                    if (onSpurPinEventHandler)
                        onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    // if (onSpurStopEventHandler)
                    //     onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
                }
            })

            pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.Low, function () {
                // rechts hell
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurRechtsHell = true
                    // raiseSpurEvent()
                    if (onSpurPinEventHandler)
                        onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    // if (onSpurStopEventHandler)
                    //     onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
                }
            })
            pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.High, function () {
                // rechts dunkel
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurRechtsHell = false
                    // raiseSpurEvent()
                    if (onSpurPinEventHandler)
                        onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    // if (onSpurStopEventHandler)
                    //     onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
                }
            })

            // danach darf kein pins.digitalReadPin() stehen, das deaktiviert die Ereignisse wieder, davor ist möglich
            //n_inEvent = 0
            n_SpursensorEventsRegistered = true
        }
    }



    // ========== group="Spur Sensor" subcategory="Sensoren"

    let a_raiseSpurEvent_gestartet = [false, false]
    let n_SpurTimer = input.runningTime()
    let n_Spur = 0 // letzter Status

    //% group="Spur Sensor Ereignis" subcategory="Sensoren"
    //% block="Spur Sensor Ereignis auslösen %on || • Pause %ms ms" weight=6
    //% on.shadow=toggleOnOff
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseSpurEvent(on: boolean, ms = 25, index = 0) {
        if (on) {
            let t = input.runningTime() - n_SpurTimer // ms seit letztem raiseAbstandEvent
            if (t < ms)
                basic.pause(t) // restliche Zeit-Differenz warten
            n_SpurTimer = input.runningTime()

            //let spur = readInputs(i2c)[0] & 0b11
            let spur = (n_SpurLinksHell ? 0b10 : 0) + (n_SpurRechtsHell ? 0b01 : 0)

            if (n_Spur != spur || !a_raiseSpurEvent_gestartet[index]) { // bei Änderung oder beim ersten Mal - ganz am Anfang
                n_Spur = spur
                spurEventHandler()
            }
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
            onSpurEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01, n_AbstandStop)
    }

    let onSpurEventHandler: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) => void

    //% group="Spur Sensor Ereignis" subcategory="Sensoren"
    //% block="wenn Spur Sensor Ereignis" weight=4
    //% draggableParameters=reporter
    export function onSpurEvent(cb: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) => void) {
        onSpurEventHandler = cb
    }


    export enum eDH { hell = 1, dunkel = 0 }

    //% group="Spur Sensor" subcategory="Sensoren"
    //% block="Spursensor links %l" weight=6
    export function getSpurLinks(l: eDH) {
        return (l == eDH.hell) ? n_SpurLinksHell : !n_SpurLinksHell
    }

    //% group="Spur Sensor" subcategory="Sensoren"
    //% block="Spursensor rechts %r" weight=5
    export function getSpurRechts(r: eDH) {
        return (r == eDH.hell) ? n_SpurRechtsHell : !n_SpurRechtsHell
    }

    //% group="Spur Sensor" subcategory="Sensoren"
    //% block="Spursensoren links %l und rechts %r" weight=3
    export function getSpursensor(l: eDH, r: eDH) {
        return getSpurLinks(l) && getSpurRechts(r)
    }




    // ========== group="Ultraschall Sensor" subcategory="Sensoren"

    let a_raiseAbstandEvent_gestartet = [false, false]
    let n_AbstandTimer = input.runningTime()
    let n_AbstandStop = false // letzter Status
    let n_AbstandSensor = false // Sensor aktiviert (im Buffer bzw. Knopf A)

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="Abstand Sensor Ereignis auslösen %on • Stop %stop_cm cm • Start %start_cm cm || • Pause %ms ms" weight=6
    //% on.shadow=toggleOnOff
    //% stop_cm.defl=30
    //% start_cm.defl=35
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseAbstandEvent(on: boolean, stop_cm: number, start_cm: number, ms = 25, abstand_Sensor?: boolean, index = 0) {
        n_AbstandSensor = (abstand_Sensor == undefined) ? on : abstand_Sensor
        if (on) {
            let t = input.runningTime() - n_AbstandTimer // ms seit letztem raiseAbstandEvent
            if (t < ms)
                basic.pause(t) // restliche Zeit-Differenz warten
            n_AbstandTimer = input.runningTime()

            let cm = selectAbstand(true) // readUltraschallAbstand()

            if (!n_AbstandStop && cm < stop_cm)
                abstandEventHandler(true, cm) // Stop Ereignis auslösen
            else if (n_AbstandStop && cm > Math.max(start_cm, stop_cm))
                abstandEventHandler(false, cm) // Start Ereignis auslösen
            else if (!a_raiseAbstandEvent_gestartet[index])
                abstandEventHandler(false, cm) // Start Ereignis auslösen am Anfang

            a_raiseAbstandEvent_gestartet[index] = true
        }
        else if (a_raiseAbstandEvent_gestartet[index]) {
            a_raiseAbstandEvent_gestartet[index] = false
            abstandEventHandler(false, 0) // kein Stop Ereignis auslösen am Ende
        }
    }

    function abstandEventHandler(abstand_Stop: boolean, cm: number) {
        n_AbstandStop = abstand_Stop
        if (onAbstandEventHandler)
            onAbstandEventHandler(n_AbstandSensor, n_AbstandStop, cm)
        if (onSpurEventHandler)
            onSpurEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01, n_AbstandStop)
    }

    let onAbstandEventHandler: (abstand_Sensor: boolean, abstand_Stop: boolean, cm: number) => void

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="wenn Abstand Sensor Ereignis" weight=4
    //% draggableParameters=reporter
    export function onAbstandEvent(cb: (abstand_Sensor: boolean, abstand_Stop: boolean, cm: number) => void) {
        onAbstandEventHandler = cb
    }


} // r-sensorevents.ts
