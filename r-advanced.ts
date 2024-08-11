
namespace receiver { // r-advanced.ts


    // ========== group="aktuelle Werte (vom gewählten Modell)" advanced=true

    //% group="aktuelle Werte (vom gewählten Modell)" advanced=true
    //% block="Motor Speed (1 ↓ 128 ↑ 255)" weight=3
    export function selectMotorSpeed() {
        if (n_Hardware == eHardware.car4) // Fahrmotor am Qwiic Modul
            return a_QwiicMotorSpeed[eQwiicMotor.ma]
        else
            return a_DualMotorSpeed[eDualMotor.M0]
    }

    //% group="aktuelle Werte (vom gewählten Modell)" advanced=true
    //% block="Servo Winkel (1 ↖ 16 ↗ 31)" weight=2
    export function pinServoWinkel() {
        return Math.idiv(n_Servo90Winkel, 3) - 14
    }


    // ========== group="Klingelton (Calliope v3: P0)" advanced=true

    let n_ringTone = false

    //% group="Klingelton (Calliope v3: P0)" advanced=true
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



    // ========== group="Ultraschall (Calliope v1: C8)" advanced=true


    // adapted to Calliope mini V2 Core by M.Klein 17.09.2020
    /**
     * Create a new driver of Grove - Ultrasonic Sensor to measure distances in cm
     * @param pin signal pin of ultrasonic ranger module
     */
    //% group="Ultraschall (Calliope v1: C8)" advanced=true
    //% block="Abstand in cm" weight=8
    export function pinGroveUltraschall_cm(): number {
        pins.digitalWritePin(c_PinUltraschall, 0);
        control.waitMicros(2);
        pins.digitalWritePin(c_PinUltraschall, 1);
        control.waitMicros(20);
        pins.digitalWritePin(c_PinUltraschall, 0);

        return Math.round(pins.pulseIn(c_PinUltraschall, PulseValue.High, 50000) * 0.0263793)
    }



    // ========== group="Status zurück senden"
    let n_StatusString = ""

    //% group="Status zurück senden" advanced=true
    //% block="Status += any %pStatus" weight=6
    export function addStatus(pStatus: any) {
        n_StatusString += " " + convertToText(pStatus)
    }

    //% group="Status zurück senden" advanced=true
    //% block="Status += hex %pStatus" weight=5
    export function addStatusHEX(pStatus: number) {
        n_StatusString += " " + Buffer.fromArray([pStatus]).toHex()
    }

    //% group="Status zurück senden" advanced=true
    //% block="Status Änderung" weight=4
    export function chStatus(): boolean { return n_StatusString.length > 0 }

    //% group="Status zurück senden" advanced=true
    //% block="Status Text || löschen %clear" weight=3
    //% clear.shadow="toggleYesNo"
    //% clear.defl=1
    export function getStatus(clear = true) {
        let s = n_StatusString
        if (clear)
            n_StatusString = ""
        return "1" + s
    }


} // r-advanced.ts
