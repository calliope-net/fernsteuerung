
namespace receiver { // r-pins.ts

    // PINs sind in r-receiver.ts definiert

    // ========== group="Digital Pins (vom gewählten Modell)" subcategory="Pins, Sensoren"
    // Relais auf der Leiterplatte schaltet 9V Akku für eigene Stromversorgung an VM+

    //% group="Digital Pins (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Stromversorgung 9V %pON" weight=8
    //% pON.shadow="toggleOnOff"
    export function pinRelay(pON: boolean) {
        if (a_PinRelay.length > n_Hardware)
            pins.digitalWritePin(a_PinRelay[n_Hardware], pON ? 1 : 0)
    }

    //% group="Digital Pins (vom gewählten Modell)" subcategory="Pins, Sensoren"
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

    //% group="Digital Pins (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Digital Pin %pin %pON" weight=6
    //% pON.shadow="toggleOnOff"
    export function digitalWritePin(pin: eDigitalPins, pON: boolean) {
        pins.digitalWritePin(<number>pin, pON ? 0 : 1)
    }

  

    // ========== group="Spursensor" subcategory="Pins, Sensoren"
/* 
    export enum eDH { dunkel = 0, hell = 1 } // 0 ist schwarz

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %hell" weight=6
    export function pinSpurlinks(hell: eDH) {
        if (a_PinSpurlinks.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == hell // 0 ist schwarz
        else
            return false
    }

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor rechts %hell" weight=5
    export function pinSpurrechts(hell: eDH) {
        if (a_PinSpurrechts.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == hell // 0 ist schwarz
        else
            return false
    }
 */

    //% group="Spursensor (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Spursensor links %l und rechts %r" weight=4
    //export function readSpursensor(l: eDH, r: eDH) {
    //    return pinSpurlinks(l) && pinSpurrechts(r)
    //}




    // ========== group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"

    //% group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Abstand Sensor angeschlossen" weight=7
    export function selectAbstandSensorConnected() {
        if (n_Hardware == eHardware.v3)
            return n_QwiicUltrasonicConnected
        else if (n_Hardware == eHardware.car4)
            return true
        else
            return false
    }

    //% group="Ultraschall (vom gewählten Modell)" subcategory="Pins, Sensoren"
    //% block="Abstand cm • einlesen %read" weight=6
    //% read.shadow=toggleYesNo
    export function selectAbstand(read: boolean) {
        if (n_Hardware == eHardware.v3)
            return getQwiicUltrasonic(read) // i2c einlesen, false wenn Modul nicht angesteckt
        else if (n_Hardware == eHardware.car4)
            return pinGroveUltraschall_cm() // in r-advanced.ts
        else
            return 0
    }

    //% blockId=receiver_getAbstand blockHidden=true
    //% block="%buffer Abstand in cm" weight=3
    //% buffer.shadow="btf_receivedBuffer19"
    export function receiver_getAbstand(buffer: Buffer) {
        return btf.getAbstand(buffer)
    }

}