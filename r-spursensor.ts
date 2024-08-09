
namespace receiver { // r-spursensor.ts

    let n_SpursensorEventsRegistered = false
    // let n_Spursensor = 0 // Buffer.create(1) // Bit 1=links 0:rechts
    let n_SpurLinksHell = false
    let n_SpurRechtsHell = false
    const c_pulseDuration = 10000

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor Ereignisse registrieren (beim Start)" weight=8
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
                    // n_Spursensor |= 0b10 // OR Nullen bleiben, nur 1 wird gesetzt
                }
            })
            pins.onPulsed(a_PinSpurlinks[n_Hardware], PulseValue.High, function () {
                // links dunkel
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurLinksHell = false
                    // n_Spursensor &= ~0b10 // AND Einsen bleiben, nur 0 wird gesetzt
                }
            })

            pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.Low, function () {
                // rechts hell
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurRechtsHell = true
                    // n_Spursensor |= 0b01 // OR Nullen bleiben, nur 1 wird gesetzt
                }
            })
            pins.onPulsed(a_PinSpurrechts[n_Hardware], PulseValue.High, function () {
                // rechts dunkel
                if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                    n_SpurRechtsHell = false
                    // n_Spursensor &= ~0b01 // AND Einsen bleiben, nur 0 wird gesetzt
                }
            })

            // danach darf kein pins.digitalReadPin() stehen, das deaktiviert die Ereignisse wieder, davor ist möglich
            n_SpursensorEventsRegistered = true
        }
    }


    export enum eDH { dunkel = 0, hell = 1 }

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
    //% block="Spursensor links %rechts rechts • dunkel %hell hell" weight=5
    //% rechts.shadow=toggleYesNo
    //% hell.shadow=toggleYesNo
    /* export function getSpursensor(rechts: boolean, hell: boolean) {
        let bm = rechts ? 0b01 : 0b10
        return (n_Spursensor & bm) == (hell ? bm : 0)
    } */

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensoren links %l und rechts %r" weight=2
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

} // r-spursensor.ts
