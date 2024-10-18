
namespace receiver { // r-pins.ts

    let a_PinSpurLinks: DigitalPin[] = [113, DigitalPin.C11] // 0:DigitalPin.C15 SPI
    let a_PinSpurRechts: DigitalPin[] = [115, DigitalPin.C9] // 0:DigitalPin.C13 SPI

    export enum eSpurSensorKabel { hinten, vorn }
    let n_SpurSensorKabel = eSpurSensorKabel.hinten // bei true wird rechts und links getauscht

    /* 
        function spurLinksDigitalPin(): DigitalPin {
            if (!n_PinSpurTauschen)
                return a_PinSpurLinks[n_Hardware]  // Kabel am Spur Sensor hinten
            else
                return a_PinSpurRechts[n_Hardware] // Kabel vorn: rechts und links tauschen
        }
    
        function spurRechtsDigitalPin(): DigitalPin {
            if (!n_PinSpurTauschen)
                return a_PinSpurRechts[n_Hardware] // Kabel am Spur Sensor hinten
            else
                return a_PinSpurLinks[n_Hardware]  // Kabel vorn: rechts und links tauschen
        }
     */

    // ========== group="Spur Sensor Pins (vom gewählten Modell)" subcategory="Pins"


    //% group="Spur Sensor pins.digitalReadPin (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Kabel nach %tauschen" weight=7
    export function spurSensorKabel(kabel = eSpurSensorKabel.hinten) {
        n_SpurSensorKabel = kabel
    }


    export enum eDH { hell = 1, dunkel = 0 } // 0 ist schwarz, 1 ist hell

    //% group="Spur Sensor pins.digitalReadPin (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin links %hell" weight=6
    export function pinSpurLinks(hell: eDH): boolean {
        return pins.digitalReadPin(n_SpurSensorKabel == eSpurSensorKabel.hinten ? a_PinSpurLinks[n_Hardware] : a_PinSpurRechts[n_Hardware]) == hell
    }

    //% group="Spur Sensor pins.digitalReadPin (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin rechts %hell" weight=5
    export function pinSpurRechts(hell: eDH): boolean {
        return pins.digitalReadPin(n_SpurSensorKabel == eSpurSensorKabel.hinten ? a_PinSpurRechts[n_Hardware] : a_PinSpurLinks[n_Hardware]) == hell
    }

    //% group="Spur Sensor pins.digitalReadPin (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin Bits 00 01 10 11" weight=4
    export function pinSpur2Bit() {
        if (n_SpurSensorKabel == eSpurSensorKabel.hinten)
            return (pins.digitalReadPin(a_PinSpurLinks[n_Hardware]) << 1) & pins.digitalReadPin(a_PinSpurRechts[n_Hardware]) & 0b11
        else
            return (pins.digitalReadPin(a_PinSpurRechts[n_Hardware]) << 1) & pins.digitalReadPin(a_PinSpurLinks[n_Hardware]) & 0b11
        //  return pinSpurLinks(l) && pinSpurRechts(r)
    }



    /* 
        export let n_SpurLinksHell = false // hell=true
        export let n_SpurRechtsHell = false
    
        export let n_SpurSensorEventsRegistered = false
        const c_pulseDuration = 60000 // µs 50 ms
     */
    // group="Spur Sensor" subcategory="Sensoren"
    //% group="Spur Sensor pins.onPulsed Events (vom gewählten Modell)" subcategory="Pins"
    //% block="Spur Sensor Pin Ereignisse registrieren" weight=8
    //% tauschen.shadow=toggleYesNo
    /*    export function spurSensorRegisterEvents() {
           if (!n_SpurSensorEventsRegistered && !n_EncoderEventRegistered) { // || • l/r tauschen %tauschen
   
               //n_PinSpurTauschen = tauschen
               n_SpurLinksHell = pinSpurlinks(eDH.hell)   // pins.digitalReadPin(a_PinSpurlinks[n_Hardware]) == 1
               n_SpurRechtsHell = pinSpurrechts(eDH.hell) // pins.digitalReadPin(a_PinSpurrechts[n_Hardware]) == 1
   
               // PulseValue.Low
               // ↑high, ↓low, Event niedrig bei l->h loslassen
               // Zeit wie lange es low ↓↑ war in µs
   
               pins.onPulsed(spurLinksDigitalPin(), PulseValue.Low, function () {
                   // links hell
                   if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                       n_SpurLinksHell = true
                       if (onSpurPinEventHandler)
                           onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                   }
               })
               pins.onPulsed(spurLinksDigitalPin(), PulseValue.High, function () {
                   // links dunkel
                   if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                       n_SpurLinksHell = false
                       if (onSpurPinEventHandler)
                           onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                   }
               })
   
               pins.onPulsed(spurRechtsDigitalPin(), PulseValue.Low, function () {
                   // rechts hell
                   if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                       n_SpurRechtsHell = true
                       if (onSpurPinEventHandler)
                           onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                   }
               })
               pins.onPulsed(spurRechtsDigitalPin(), PulseValue.High, function () {
                   // rechts dunkel
                   if (pins.pulseDuration() > c_pulseDuration) { // 10ms
                       n_SpurRechtsHell = false
                       if (onSpurPinEventHandler)
                           onSpurPinEventHandler(n_SpurLinksHell, n_SpurRechtsHell)
                   }
               })
   
               // danach darf kein pins.digitalReadPin() stehen, das deaktiviert die Ereignisse wieder, davor ist möglich
               //n_inEvent = 0
               n_SpurSensorEventsRegistered = true
           }
           return n_SpurSensorEventsRegistered
       }
   
   
       // ========== EVENT HANDLER === sichtbarer Event-Block
       export let onSpurPinEventHandler: (links: boolean, rechts: boolean) => void
   
       //% group="Spur Sensor pins.onPulsed Events (vom gewählten Modell)" subcategory="Pins"
       //% block="wenn Spur Sensor Pin Ereignis" weight=2
       //% draggableParameters=reporter
       export function onSpurPinEvent(cb: (links_hell: boolean, rechts_hell: boolean) => void) {
           onSpurPinEventHandler = cb
       }
    */


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






    // ========== group="Servo (vom gewählten Modell)"

    export const c_Servo90_geradeaus = 90
    export let n_Servo90KorrekturFaktor = 1 // Winkel für geradeaus wird beim Start eingestellt
    export let n_Servo90Winkel = c_Servo90_geradeaus // aktuell eingestellter Winkel


    // group="Servo (vom gewählten Modell)" subcategory="Pins"
    // block="Servo (Picker) %servo °" weight=4
    // servo.shadow=protractorPicker servo.defl=90
    //export function pinServoPicker(servo: number) {
    //    pinServo16(btf.protractorPicker(servo))
    //}

    //% group="Servo (vom gewählten Modell)" subcategory="Pins"
    //% block="Servo (1 ↖ 16 ↗ 31) %winkel" weight=3
    //% winkel.min=1 winkel.max=31 winkel.defl=16
    export function pinServo16(winkel: number) {
        if (btf.between(winkel, 1, 31))
            // Formel: (x+14)*3
            // winkel 1..16..31 links und rechts tauschen (32-winkel) 32-1=31 32-16=16 32-31=1
            // winkel 31..16..1
            // 32+14=46 46-1=45     46-16=30    46-31=15
            //          45*3=135    30*3=90     15*3=45
            pinServo90((14 + (32 - winkel)) * 3)  // 1->135 16->90 31->45
        //pinServo90((46 - winkel) * 3)  // 1->135 16->90 31->45
        //  servo_set90((14 + winkel) * 3)  // 1->135 16->90 31->45
        else
            pinServo90(c_Servo90_geradeaus)
    }

    //% group="Servo (vom gewählten Modell)" subcategory="Pins"
    //% block="Servo (135° ↖ 90° ↗ 45°) %winkel °" weight=2
    //% winkel.min=45 winkel.max=135 winkel.defl=90
    export function pinServo90(winkel: number) {
        // Richtung ändern: 180-winkel
        // (0+14)*3=42 keine Änderung, gültige Werte im Buffer 1-31  (1+14)*3=45  (16+14)*3=90  (31+14)*3=135
        if (btf.between(winkel, 45, 135) && n_Servo90Winkel != winkel) {
            n_Servo90Winkel = winkel
            // pins.servoWritePin(a_PinServo[n_Hardware], winkel + (n_Servo90Geradeaus - c_Servo_geradeaus))
            //pins.servoWritePin(a_PinServo[n_Hardware], winkel * (n_Servo90Geradeaus / c_Servo_geradeaus))
            pins.servoWritePin(a_PinServo[n_Hardware], winkel * n_Servo90KorrekturFaktor)
        }
    }

    //% group="Servo (vom gewählten Modell)" subcategory="Pins"
    //% block="Servo geradeaus" weight=1
    export function pinServoGeradeaus() {
        pinServo90(c_Servo90_geradeaus)
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
