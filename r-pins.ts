
namespace receiver { // r-pins.ts

    // PINs sind in r-receiver.ts definiert


    // ========== group="Spur Sensor Pins (vom gewählten Modell)" subcategory="Pins"

    // export enum eDH { dunkel = 0, hell = 1 } // 0 ist schwarz

    //% group="Spur Sensor Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin links %hell" weight=6
    export function pinSpurlinks(hell: eDH) {
        if (a_PinSpurlinks.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == hell // 0 ist schwarz
        else
            return false
    }

    //% group="Spur Sensor Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin rechts %hell" weight=5
    export function pinSpurrechts(hell: eDH) {
        if (a_PinSpurrechts.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == hell // 0 ist schwarz
        else
            return false
    }

    //% group="Spur Sensor Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin links %l und rechts %r" weight=4
    export function readSpursensor(l: eDH, r: eDH) {
        return pinSpurlinks(l) && pinSpurrechts(r)
    }


    // ========== EVENT HANDLER === sichtbarer Event-Block
    export let onSpurPinEventHandler: (links: boolean, rechts: boolean) => void

    //% group="Spur Sensor Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="wenn Spur Sensor Pin Ereignis" weight=2
    //% draggableParameters=reporter
    export function onSpurPinEvent(cb: (links_hell: boolean, rechts_hell: boolean) => void) {
        onSpurPinEventHandler = cb
    }



    // ========== group="Digital Pins (vom gewählten Modell)" subcategory="Pins"
    // Relais auf der Leiterplatte schaltet 9V Akku für eigene Stromversorgung an VM+

    //% group="Digital Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="Stromversorgung Relais %pON" weight=8
    //% pON.shadow="toggleOnOff"
    export function pinRelay(pON: boolean) {
        if (a_PinRelay.length > n_Hardware)
            pins.digitalWritePin(a_PinRelay[n_Hardware], pON ? 1 : 0)
    }

    //% group="Digital Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="Licht %pON" weight=7
    //% pON.shadow="toggleOnOff"
    export function pinLicht(pON: boolean) {
        if (a_PinLicht.length > n_Hardware)
            pins.digitalWritePin(a_PinLicht[n_Hardware], pON ? 1 : 0)
    }

    export enum eDigitalPins { // Pins gültig für alle Modelle, unterscheiden sich bei v3 im Enum Wert
        P0 = DigitalPin.P0,
        P1 = DigitalPin.P1,
        P2 = DigitalPin.P2,
        P3 = DigitalPin.P3,
        //% block="C16 Grove RX"
        C16 = DigitalPin.C16,
        //% block="C17 Grove TX"
        C17 = DigitalPin.C17
    }

    //% group="Digital Pins (vom gewählten Modell)" subcategory="Pins"
    //% block="Digital Pin %pin %pON" weight=6
    //% pON.shadow="toggleOnOff"
    export function digitalWritePin(pin: eDigitalPins, pON: boolean) {
        pins.digitalWritePin(<number>pin, pON ? 0 : 1)
    }



    // ========== group="Klingelton (Calliope v3: P0)" advanced=true

    let n_ringTone = false

    //% group="Klingelton (Calliope v3: P0)" subcategory="Pins"
    //% block="spiele Note %pON || Frequenz %frequency Hz"
    //% pON.shadow="toggleOnOff"
    //% frequency.defl=262
    export function ringTone(pON: boolean, frequency = 262) {
        if (n_ringTone !== pON) { // XOR
            n_ringTone = pON
            if (n_ringTone)
                music.ringTone(frequency)
            else
                music.stopAllSounds()
            // pins.digitalWritePin(pinBuzzer, n_buzzer ? 1 : 0)
        }
    }



    // ========== group="Ultraschall (Calliope v1: C8)" subcategory="Pins"


    // adapted to Calliope mini V2 Core by M.Klein 17.09.2020
    /**
     * Create a new driver of Grove - Ultrasonic Sensor to measure distances in cm
     * @param pin signal pin of ultrasonic ranger module
     */
    //% group="Ultraschall Pin (Calliope v1: C8)" subcategory="Pins"
    //% block="Abstand in cm" weight=8
    export function pinGroveUltraschall_cm(): number {
        pins.digitalWritePin(c_PinUltraschall, 0);
        control.waitMicros(2);
        pins.digitalWritePin(c_PinUltraschall, 1);
        control.waitMicros(20);
        pins.digitalWritePin(c_PinUltraschall, 0);

        return Math.round(pins.pulseIn(c_PinUltraschall, PulseValue.High, 50000) * 0.0263793)
    }

}
