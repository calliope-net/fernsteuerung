
namespace receiver { // r-spursensor.ts

    let n_SpursensorEventsRegistered = false
    //let n_inEvent = 0
    let n_SpurLinksHell = false // hell=true
    let n_SpurRechtsHell = false
    const c_pulseDuration = 60000 // 50 ms

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor Pin Ereignisse registrieren (beim Start)" weight=8
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
                    // if (onSpurEventHandler)
                    //     onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    if (onSpurStopEventHandler)
                        onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)

                }
            })
            pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.High, function () {
                // links dunkel
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurLinksHell = false
                    // raiseSpurEvent()
                    // if (onSpurEventHandler)
                    //     onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    if (onSpurStopEventHandler)
                        onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
                }
            })

            pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.Low, function () {
                // rechts hell
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurRechtsHell = true
                    // raiseSpurEvent()
                    // if (onSpurEventHandler)
                    //     onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    if (onSpurStopEventHandler)
                        onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
                }
            })
            pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.High, function () {
                // rechts dunkel
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurRechtsHell = false
                    // raiseSpurEvent()
                    // if (onSpurEventHandler)
                    //     onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    if (onSpurStopEventHandler)
                        onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
                }
            })

            // danach darf kein pins.digitalReadPin() stehen, das deaktiviert die Ereignisse wieder, davor ist möglich
            //n_inEvent = 0
            n_SpursensorEventsRegistered = true
        }
    }
    /* 
        function raiseSpurEvent() {
            if (onSpurEventHandler) {
                n_inEvent++
                //while (n_inEvent > 1) {
                //    control.waitMicros(10000) // 10 ms
                //}
                //onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                //n_inEvent--
                n_inEvent++
                if (n_inEvent == 1) {
                    onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    if (n_inEvent > 1)
                        onSpurEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                    n_inEvent = 0
                }
            }
        }
    */

    export enum eDH { hell = 1, dunkel = 0 }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %l" weight=6
    export function getSpurLinks(l: eDH) {
        return (l == eDH.hell) ? n_SpurLinksHell : !n_SpurLinksHell
        // return n_SpurLinksHell
        // return (n_Spursensor & 0b10) == (l << 1)
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor rechts %r" weight=5
    export function getSpurRechts(r: eDH) {
        return (r == eDH.hell) ? n_SpurRechtsHell : !n_SpurRechtsHell
        // return n_SpurRechtsHell
        // return (n_Spursensor & 0b01) == (r)
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %rechts rechts • dunkel %hell hell" weight=4
    //% rechts.shadow=toggleYesNo
    //% hell.shadow=toggleYesNo
    /* export function getSpursensor(rechts: boolean, hell: boolean) {
        let bm = rechts ? 0b01 : 0b10
        return (n_Spursensor & bm) == (hell ? bm : 0)
    } */

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensoren links %l und rechts %r" weight=3
    export function getSpursensor(l: eDH, r: eDH) {
        return getSpurLinks(l) && getSpurRechts(r)
        // return (n_Spursensor & 0x03) == (l << 1 | r)
    }

    /* export enum eINPUTS {
        //% block="Spursensor rechts hell"
        spr = 0b00000001,
        //% block="Spursensor links hell"
        spl = 0b00000010
    } */

    // ========== EVENT HANDLER === sichtbarer Event-Block
    let onSpurEventHandler: (links: boolean, rechts: boolean) => void
    let onSpurStopEventHandler: (links: boolean, rechts: boolean, abstand_Stop: boolean) => void

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="wenn Spur Sensor geändert" weight=2
    //% draggableParameters=reporter
    export function onSpurEvent(cb: (links_hell: boolean, rechts_hell: boolean) => void) {
        onSpurEventHandler = cb
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="wenn Sensor geändert" weight=1
    //% draggableParameters=reporter
    export function onSpurStopEvent(cb: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) => void) {
        onSpurStopEventHandler = cb
    }
    // ========== EVENT HANDLER === sichtbarer Event-Block



    // ========== group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"

    let onStopEventHandler: (abstand_Stop: boolean) => void


    let n_AbstandStop = false

    // group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" color=#5FA38F
    //% group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Abstand Ereignis auslösen Stop %stop cm Start %start cm" weight=2
    //% stop.defl=30
    //% start.defl=35
    export function raiseAbstandEvent(stop: number, start: number) {
        if (onSpurStopEventHandler && selectAbstandSensorConnected()) {
            let cm = selectAbstand(true)
            if (cm < stop) {
                n_AbstandStop = true
                // if (onSpurStopEventHandler)
                onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
            }
            else if (cm > Math.max(start, stop)) {
                n_AbstandStop = false
                // if (onSpurStopEventHandler)
                onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
            }
        }
    }

    //% group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="wenn Abstand Sensor geändert" weight=1
    //% draggableParameters=reporter
    export function onStopEvent(cb: (abstand_Stop: boolean) => void) {
        onStopEventHandler = cb
    }


} // r-spursensor.ts
