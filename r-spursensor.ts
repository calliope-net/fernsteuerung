
namespace receiver { // r-spursensor.ts

    let n_Spursensor = 0 // Buffer.create(1) // Bit 1=links 0:rechts


    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="e spursensorRegisterEvents" weight=3
    export function spursensorRegisterEvents() {
        // PulseValue.Low
        // ↑high, ↓low, Event niedrig bei l->h loslassen
        // Zeit wie lange es low ↓↑ war in µs

        pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.Low, function () {
            // links hell
            //if (pins.pulseDuration() > 10000) { // 10ms
            n_Spursensor |= 0b10 // OR Nullen bleiben, nur 1 wird gesetzt
            //}
        })
        pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.High, function () {
            // links dunkel
            //if (pins.pulseDuration() > 10000) { // 10ms
            n_Spursensor &= ~0b10 // AND Einsen bleiben, nur 0 wird gesetzt
            //}
        })

        pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.Low, function () {
            // rechts hell
            //if (pins.pulseDuration() > 10000) { // 10ms
            n_Spursensor |= 0b01 // OR Nullen bleiben, nur 1 wird gesetzt
            //}
        })
        pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.High, function () {
            // rechts dunkel
            //if (pins.pulseDuration() > 10000) { // 10ms
            n_Spursensor &= ~0b01 // AND Einsen bleiben, nur 0 wird gesetzt
            //}
        })

     //   n_Spursensor = (pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) << 1) | pins.digitalReadPin(a_PinSpurrechts[n_Hardware])

    }


    export enum eDH { dunkel = 0, hell = 1 }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %hell" weight=6
    export function pinSpurlinks(l: eDH) {
        return (n_Spursensor & 0b10) == (l << 1)
        /*  if (a_PinSpurlinks.length > n_Hardware)
             return pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == hell // 0 ist schwarz
         else
             return false */
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor rechts %hell" weight=5
    export function pinSpurrechts(r: eDH) {
        return (n_Spursensor & 0b01) == (r)
        /*  if (a_PinSpurrechts.length > n_Hardware)
             return pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == hell // 0 ist schwarz
         else
             return false */
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %rechts rechts • dunkel %hell hell" weight=5
    //% rechts.shadow=toggleYesNo
    //% hell.shadow=toggleYesNo
    export function getSpursensor(rechts: boolean, hell: boolean) {
        let bm = rechts ? 0b01 : 0b10
        return (n_Spursensor & bm) == (hell ? bm : 0)
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="e Spursensor links %l und rechts %r" weight=2
    export function readSpursensor(l: eDH, r: eDH) {
        return (n_Spursensor & 0x03) == (l << 1 | r)
    }

    /* export enum eINPUTS {
        //% block="Spursensor rechts hell"
        spr = 0b00000001,
        //% block="Spursensor links hell"
        spl = 0b00000010
    } */

} // r-spursensor.ts
