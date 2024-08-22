
namespace receiver { // r-spursensor.ts

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

    /* export enum eINPUTS {
        //% block="Spursensor rechts hell"
        spr = 0b00000001,
        //% block="Spursensor links hell"
        spl = 0b00000010
    } */

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="wenn Sensor geändert" weight=1
    //% draggableParameters=reporter
    /*  export function onSpurStopEvent(cb: (links_hell: boolean, rechts_hell: boolean, abstand_Stop: boolean) => void) {
         onSpurStopEventHandler = cb
     } */
    // ========== EVENT HANDLER === sichtbarer Event-Block



    // ========== group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"

    // let onStopEventHandler: (abstand_Stop: boolean, cm: number) => void

    // let n_AbstandTimer = input.runningTime()
    //  let n_AbstandStop = false


    // group="Ultrasonic Distance Sensor (I²C: 0x00)" subcategory="Qwiic" color=#5FA38F
    //% group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Abstand Ereignis auslösen Stop %stop_cm cm Start %start_cm cm || Pause %ms ms" weight=2
    //% stop_cm.defl=20
    //% start_cm.defl=25
    //% ms.defl=25
    /*   export function raiseAbstandEvent(stop_cm: number, start_cm: number, ms = 25) {
          if (selectAbstandSensorConnected()) {
              let t = input.runningTime() - n_AbstandTimer // ms seit letztem raiseAbstandEvent
              if (t < ms)
                  basic.pause(t) // restliche Zeit-Differenz warten
              n_AbstandTimer = input.runningTime()
  
              let cm = selectAbstand(true)
  
              if (!n_AbstandStop && cm < stop_cm) {
                  n_AbstandStop = true
                  if (onStopEventHandler)
                      onStopEventHandler(n_AbstandStop, cm)
                  if (onSpurStopEventHandler)
                      onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
              }
              else if (n_AbstandStop && cm > Math.max(start_cm, stop_cm)) {
                  n_AbstandStop = false
                  if (onStopEventHandler)
                      onStopEventHandler(n_AbstandStop, cm)
                  if (onSpurStopEventHandler)
                      onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
              }
          }
      } */

    //% group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="wenn Abstand Sensor geändert" weight=1
    //% draggableParameters=reporter
    /*  export function onStopEvent(cb: (abstand_Stop: boolean, cm: number) => void) {
         onStopEventHandler = cb
     } */


} // r-spursensor.ts
