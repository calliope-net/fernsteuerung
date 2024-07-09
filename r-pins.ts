
namespace receiver { // r-pins.ts

    // PINs
    //  const c_pinRelay = DigitalPin.C9 
    //  const c_pinC12 = DigitalPin.C12 



    // ========== group="Relais" subcategory="Pins"
    // Relais auf der Leiterplatte schaltet 9V Akku für eigene Stromversorgung an VM+

    //% group="Digital Pins" subcategory="Pins"
    //% block="Stromversorgung 9V %pON" weight=8
    //% pON.shadow="toggleOnOff"
    export function pinRelay(pON: boolean) {
        if (a_PinRelay.length > n_Hardware)
            pins.digitalWritePin(a_PinRelay[n_Hardware], pON ? 1 : 0)
    }

    // GPIO für Grove (5V) Licht oder Buzzer

    //% group="Digital Pins" subcategory="Pins"
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

    //% group="Digital Pins" subcategory="Pins"
    //% block="Digital Pin %pin %pON" weight=6
    //% pON.shadow="toggleOnOff"
    export function digitalWritePin(pin: eDigitalPins, pON: boolean) {
        pins.digitalWritePin(<number>pin, pON ? 0 : 1)
    }

    /* 
    
        // ========== group="Klingelton (Calliope v3: P0)" subcategory="Pins"
    
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

    // ========== group="Spursensor" subcategory="Pins"

    //% group="Spursensor" subcategory="Pins"
    //% block="Spursensor links %n hell" weight=3
    export function pinSpurlinks(n: radio.eNOT) {
        if (a_PinSpurlinks.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == (n = radio.eNOT.t ? 1 : 0) // 0 ist schwarz
        else
            return false
    }

    //% group="Spursensor" subcategory="Pins"
    //% block="Spursensor rechts %n hell" weight=3
    export function pinSpurrechts(n: radio.eNOT) {
        if (a_PinSpurrechts.length > n_Hardware)
            return pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == (n = radio.eNOT.t ? 1 : 0) // 0 ist schwarz
        else
            return false
    }


    /*  export function pin_spursensor(n: radio.eNOT, plr: eSpursensor) {
         if (a_PinSpurlinks.length > n_Hardware) {
 
 
 
             if (plr == eSpursensor.spl)
                 return pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == 1 // 0 ist schwarz
             else
                 return pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == 1
         } else
             return false
 
     } */

    // group="Spursensor" subcategory="Pins"
    // block="Spursensor %plr %phd" weight=4
    //export function spursensor(plr: elr, phd: ehd) {
    //    switch (plr) {
    //        case elr.links: return (pins.digitalReadPin(a_PinSpurlinks[n_Modell]) == 0) !== (phd == ehd.dunkel) // !== XOR (eine Seite ist true aber nicht beide)
    //        case elr.rechts: return (pins.digitalReadPin(a_PinSpurrechts[n_Modell]) == 0) !== (phd == ehd.dunkel)
    //        default: return false
    //    }
    //}

    //% group="Spursensor" subcategory="Pins"
    //% block="Spursensor 00 01 10 11" weight=2
    /* export function pin_spursensor_2bit() {
        return (pin_spursensor(radio.eNOT.t, eSpursensor.spl) ? 2 : 0) + (pin_spursensor(radio.eNOT.t, eSpursensor.spr) ? 1 : 0)
        //return (1 - pins.digitalReadPin(a_PinSpurlinks[n_Hardware])) * 2 + (1 - pins.digitalReadPin(a_PinSpurrechts[n_Hardware]))
    } */



    // ========== group="Ultraschall (Calliope v1: C8)" subcategory="Pins"


    // adapted to Calliope mini V2 Core by M.Klein 17.09.2020
    /**
     * Create a new driver of Grove - Ultrasonic Sensor to measure distances in cm
     * @param pin signal pin of ultrasonic ranger module
     */
    // group="Ultraschall (Calliope v1: C8)" subcategory="Pins"
    // block="Ultraschall Entfernung in cm" weight=8
    /* export function groveUltraschall_cm(): number {
        pins.digitalWritePin(c_PinUltraschall, 0);
        control.waitMicros(2);
        pins.digitalWritePin(c_PinUltraschall, 1);
        control.waitMicros(20);
        pins.digitalWritePin(c_PinUltraschall, 0);

        return Math.round(pins.pulseIn(c_PinUltraschall, PulseValue.High, 50000) * 0.0263793)
    } */


    // ==========


    //% group="Ultraschall (Pin und Qwiic)" subcategory="Pins"
    //% block="Entfernung in cm" weight=6
    export function selectEntfernung() {
        if (n_Hardware == eHardware.v3)
            if (readQwiicUltrasonic()) // i2c einlesen, false wenn Modul nicht angesteckt
                return getQwiicUltrasonic()
            else
                return 0
        else if (n_Hardware == eHardware.car4)
            return pinGroveUltraschall_cm() // in r-advanced.ts
        else
            return 0
        /* 
               switch (n_Hardware) {
                   case eHardware.v3: {
                       if (readQwiicUltrasonic()) // i2c einlesen, false wenn Modul nicht angesteckt
                           return getQwiicUltrasonic()
                       else
                           return 0
                   }
                   case eHardware.car4: 
                       return pinGroveUltraschall_cm() // in r-advanced.ts
                   default:
                       return 0
               } */
    }

    export enum eVergleich {
        //% block=">="
        gt,
        //% block="<="
        lt
    }

    //% group="Ultraschall (Pin und Qwiic)" subcategory="Pins"
    //% block="Entfernung %pVergleich %cm cm" weight=5
    //% cm.shadow=receiver_getEntfernung
    export function entfernung_vergleich(pVergleich: eVergleich, cm: number) { // cm.min=5 cm.max=50 cm.defl=20
        switch (pVergleich) {
            case eVergleich.gt:
                return selectEntfernung() >= cm
            case eVergleich.lt:
                return selectEntfernung() <= cm
            default:
                return false
        }
    }

    //% blockId=receiver_getEntfernung blockHidden=true
    //% block="%buffer Entfernung in cm" weight=3
    //% buffer.shadow="radio_receivedBuffer19"
    export function receiver_getEntfernung(buffer: Buffer) {
        return radio.getEntfernung(buffer)
        //  return a_Entfernung[buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] >>> 6]
        // return (buffer[eBufferPointer.p0 + eBufferOffset.b2_Fahrstrecke] & 0b11000000)
    }

}