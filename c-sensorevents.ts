
namespace cb2 { // c-sensorevents.ts


    let onSpurEventHandler: (links_hell: boolean, rechts_hell: boolean) => void
    let n_raiseSpurEvent_gestartet = false
    let n_SpurTimer = input.runningTime()
    let n_Spur = 0 // letzter Status

    //% group="Spur Sensor" subcategory="Sensoren"
    //% block="Spur Sensor Ereignis auslösen %on || • Pause %ms ms • I²C %i2c" weight=6
    //% on.shadow=toggleOnOff
    //% ms.defl=25
    export function raiseSpurEvent(on: boolean, ms = 25, i2c = eI2C.x22) {
        if (on) {
            let t = input.runningTime() - n_SpurTimer // ms seit letztem raiseAbstandEvent
            if (t < ms)
                basic.pause(t) // restliche Zeit-Differenz warten
            n_SpurTimer = input.runningTime()

            let spur = readInputs(i2c)[0] & 0b11

            if (n_Spur != spur || !n_raiseSpurEvent_gestartet) { // bei Änderung oder beim ersten Mal - ganz am Anfang
                n_Spur = spur
                spurEventHandler()
                //if (onSpurEventHandler)
                //    onSpurEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01)
            }
            n_raiseSpurEvent_gestartet = true
        }
        else if (n_raiseSpurEvent_gestartet) {
            n_raiseSpurEvent_gestartet = false
            spurEventHandler()
            //if (onSpurEventHandler)
            //    onSpurEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01) // ganz am Ende
        }
    }

    function spurEventHandler() {
        // n_Spur = spur
        if (onSpurEventHandler)
            onSpurEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01)
        if (onSensorEventHandler)
            onSensorEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01, n_AbstandStop, 0)
        //onSensorEventHandler(links_hell, rechts_hell, n_AbstandStop, 0)
    }

    //% group="Spur Sensor" subcategory="Sensoren"
    //% block="wenn Spur Sensor Ereignis" weight=4
    //% draggableParameters=reporter
    export function onSpurEvent(cb: (links_hell: boolean, rechts_hell: boolean) => void) {
        onSpurEventHandler = cb
    }





    // ========== group="Ultraschall Sensor" subcategory="Sensoren"

    let onAbstandEventHandler: (abstand_Stop: boolean, cm: number) => void
    let n_raiseAbstandEvent_gestartet = false
    let n_AbstandTimer = input.runningTime()
    let n_AbstandStop = false // letzter Status

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="Abstand Sensor Ereignis auslösen %on • Stop %stop_cm cm • Start %start_cm cm || • Pause %ms ms" weight=6
    //% on.shadow=toggleOnOff
    //% stop_cm.defl=30
    //% start_cm.defl=35
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseAbstandEvent(on: boolean, stop_cm: number, start_cm: number, ms = 25) {
        if (on) {
            let t = input.runningTime() - n_AbstandTimer // ms seit letztem raiseAbstandEvent
            if (t < ms)
                basic.pause(t) // restliche Zeit-Differenz warten
            n_AbstandTimer = input.runningTime()

            let cm = readUltraschallAbstand()

            if (!n_AbstandStop && cm < stop_cm)
                abstandEventHandler(true, cm) // Stop Ereignis auslösen
            else if (n_AbstandStop && cm > Math.max(start_cm, stop_cm))
                abstandEventHandler(false, cm) // Start Ereignis auslösen
            else if (!n_raiseAbstandEvent_gestartet)
                abstandEventHandler(false, cm) // Start Ereignis auslösen am Anfang

            n_raiseAbstandEvent_gestartet = true
        }
        else if (n_raiseAbstandEvent_gestartet) {
            n_raiseAbstandEvent_gestartet = false
            abstandEventHandler(true, 0) // Stop Ereignis auslösen am Ende
        }
    }

    function abstandEventHandler(abstand_Stop: boolean, cm: number) {
        n_AbstandStop = abstand_Stop
        if (onAbstandEventHandler)
            onAbstandEventHandler(n_AbstandStop, cm)
        if (onSensorEventHandler)
            onSensorEventHandler((n_Spur & 0b10) == 0b10, (n_Spur & 0b01) == 0b01, n_AbstandStop, cm)
    }


    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="wenn Abstand Sensor Ereignis" weight=4
    //% draggableParameters=reporter
    export function onAbstandEvent(cb: (abstand_Stop: boolean, cm: number) => void) {
        onAbstandEventHandler = cb
    }



    // ========== group="Spur Sensor und Ultraschall Sensor" subcategory="Sensoren"
  
   let onSensorEventHandler: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean, cm: number) => void

    //% group="Spur Sensor und Ultraschall Sensor" subcategory="Sensoren"
    //% block="Spur und Abstand Sensor Ereignis auslösen %on • Stop %stop_cm cm • Start %start_cm cm || • Pause %ms ms • I²C %i2c" weight=6
    //% on.shadow=toggleOnOff
    //% stop_cm.defl=30
    //% start_cm.defl=35
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseSensorEvent(on: boolean, stop_cm: number, start_cm: number, ms = 25, i2c = eI2C.x22) {
        raiseAbstandEvent(on, stop_cm, start_cm, ms)
        raiseSpurEvent(on, ms, i2c)
    }
 
    //% group="Spur Sensor und Ultraschall Sensor" subcategory="Sensoren"
    //% block="wenn Sensor Ereignis" weight=3
    //% draggableParameters=reporter
    export function onSensorEvent(cb: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean, cm: number) => void) {
        onSensorEventHandler = cb
    }


} // c-sensorevents.ts
