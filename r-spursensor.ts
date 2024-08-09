
namespace receiver { // r-spursensor.ts

    let n_Spursensor = 0 // Buffer.create(1) // Bit 1=links 0:rechts

    export function spursensorRegisterEvents() {

        pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.High, function () {
            // links hell
            n_Spursensor |= 0b10 // OR Nullen bleiben, nur 1 wird gesetzt

        })
        pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.Low, function () {
            // links dunkel
            n_Spursensor &= ~0b10 // AND Einsen bleiben, nur 0 wird gesetzt

        })

        pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.High, function () {
            // rechts hell
            n_Spursensor |= 0b01 // OR Nullen bleiben, nur 1 wird gesetzt

        })
        pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.Low, function () {
            // rechts dunkel
            n_Spursensor &= ~0b01 // AND Einsen bleiben, nur 0 wird gesetzt

        })

    }


    //  export enum eDH { dunkel = 0, hell = 1 }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %l und rechts %r" weight=2
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
