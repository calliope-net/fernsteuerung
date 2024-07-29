
namespace receiver { // r-pins.ts

    // PINs
    //  const c_pinRelay = DigitalPin.C9 
    //  const c_pinC12 = DigitalPin.C12 



    // ========== group="Relais" subcategory="Pins, Sensoren"
    // Relais auf der Leiterplatte schaltet 9V Akku für eigene Stromversorgung an VM+

    //% group="Digital Pins" subcategory="Pins, Sensoren"
    //% block="Stromversorgung 9V %pON" weight=8
    //% pON.shadow="toggleOnOff"
    export function pinRelay(pON: boolean) {
        if (a_PinRelay.length > n_Hardware)
            pins.digitalWritePin(a_PinRelay[n_Hardware], pON ? 1 : 0)
    }

    // GPIO für Grove (5V) Licht oder Buzzer

    //% group="Digital Pins" subcategory="Pins, Sensoren"
    //% block="Licht %pON" weight=7
    //% pON.shadow="toggleOnOff"
    export function pinLicht(pON: boolean) {
        if (a_PinLicht.length > n_Hardware)
            pins.digitalWritePin(a_PinLicht[n_Hardware], pON ? 1 : 0)
    }

    export enum eDigitalPins { // Pins gültig für alle Modelle, unterscheiden sich im Enum Wert
        P0 = DigitalPin.P0,
        P1 = DigitalPin.P1,
        P2 = DigitalPin.P2,
        P3 = DigitalPin.P3,
        //% block="C16 Grove RX"
        C16 = DigitalPin.C16,
        //% block="C17 Grove TX"
        C17 = DigitalPin.C17
    }

    //% group="Digital Pins" subcategory="Pins, Sensoren"
    //% block="Digital Pin %pin %pON" weight=6
    //% pON.shadow="toggleOnOff"
    export function digitalWritePin(pin: eDigitalPins, pON: boolean) {
        pins.digitalWritePin(<number>pin, pON ? 0 : 1)
    }

    /* 
    
        // ========== group="Klingelton (Calliope v3: P0)" subcategory="Pins, Sensoren"
    
        let n_ringTone = false
    
        // group="Klingelton (Calliope v3: P0)" subcategory="Pins"
        // block="spiele Note %pON || Frequenz %frequency Hz"
        // pON.shadow="toggleOnOff"
        // frequency.defl=262
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
    
     */

    // ========== group="Spursensor" subcategory="Pins, Sensoren"

    export enum eDH { dunkel = 0, hell = 1 } // 0 ist schwarz

    //% group="Spursensor" subcategory="Pins, Sensoren"
    //% block="Spursensor links %hell" weight=3
    export function pinSpurlinks(hell: eDH) {
        if (a_PinSpurlinks.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == hell // 0 ist schwarz
        else
            return false
    }

    //% group="Spursensor" subcategory="Pins, Sensoren"
    //% block="Spursensor rechts %hell" weight=3
    export function pinSpurrechts(hell: eDH) {
        if (a_PinSpurrechts.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == hell // 0 ist schwarz
        else
            return false
    }




    // ========== group="Ultraschall (Pin und Qwiic)" subcategory="Pins, Sensoren"

    //% group="Ultraschall (Pin und Qwiic)" subcategory="Pins, Sensoren"
    //% block="Abstand cm" weight=6
    export function selectAbstand() {
        if (n_Hardware == eHardware.v3)
            if (readQwiicUltrasonic()) // i2c einlesen, false wenn Modul nicht angesteckt
                return getQwiicUltrasonic()
            else
                return 0
        else if (n_Hardware == eHardware.car4)
            return pinGroveUltraschall_cm() // in r-advanced.ts
        else
            return 0
    }

    export enum eVergleich {
        //% block=">="
        gt,
        //% block="<="
        lt
    }

    //% group="Ultraschall (Pin und Qwiic)" subcategory="Pins, Sensoren"
    //% block="Abstand %e %cm" weight=5
    //% cm.shadow=receiver_getAbstand
    export function abstand_vergleich(e: eVergleich, cm: number) { // cm.min=5 cm.max=50 cm.defl=20
        switch (e) {
            case eVergleich.gt:
                return selectAbstand() >= cm
            case eVergleich.lt:
                return selectAbstand() <= cm
            default:
                return false
        }
    }

    //% blockId=receiver_getAbstand blockHidden=true
    //% block="%buffer Abstand in cm" weight=3
    //% buffer.shadow="btf_receivedBuffer19"
    export function receiver_getAbstand(buffer: Buffer) {
        return btf.getAbstand(buffer)
        //  return a_Abstand[buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] >>> 6]
        // return (buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] & 0b11000000)
    }

}