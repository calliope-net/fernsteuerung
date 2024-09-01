
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



    // ========== group="lokale Funktion" advanced=true

    export enum eFunktion {
        //% block="nicht gestartet"
        ng,
        //% block="A Hindernis ausweichen"
        hindernis_ausweichen,
        //% block="B Spur folgen"
        spur_folgen,
        //% block="A+B Strecken fahren"
        fahrplan
    }
    let n_Funktion = eFunktion.ng

    //% group="lokale Funktion" advanced=true
    //% block="lokale Funktion %pFunktion || Timeout deaktivieren %timeoutDisbled" weight=4
    //% timeoutDisbled.shadow="toggleYesNo"
    export function setFunktion(pFunktion: eFunktion, timeoutDisbled?: boolean) {
        n_Funktion = pFunktion
        if (timeoutDisbled != undefined)
            btf.set_timeoutDisbled(timeoutDisbled)

        //if (timeoutDisbled == undefined) // Automatik
        //    btf.set_timeoutDisbled(n_Funktion != eFunktion.ng) // true wenn!=0
        //else
        //    btf.set_timeoutDisbled(timeoutDisbled)

    }

    //% group="lokale Funktion" advanced=true
    //% block="%pFunktion" weight=3
    export function isFunktion(pFunktion: eFunktion) {
        return pFunktion == n_Funktion
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
