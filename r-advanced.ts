
namespace receiver { // r-advanced.ts


    // ========== group="aktuelles Modell" advanced=true

    //% group="aktuelles Modell" advanced=true
    //% block="%modell" weight=4
    export function is_Modell(modell: eHardware) {
        return n_Hardware == modell
    }

    // group="aktuelles Modell" advanced=true
    // block="2 Motoren ohne Servo (Buggy)" weight=3
    /* export function is_v3_2Motoren() {
        return n_v3_2Motoren
        // return n_Hardware == eHardware.v3 && btf.getStorageFunkgruppe() == btf.eFunkgruppe.b4
    } */



    // ========== group="aktuelle Werte (vom gewählten Modell)" advanced=true

    //% group="aktuelle Werte (vom gewählten Modell)" advanced=true
    //% block="Motor Speed (1 ↓ 128 ↑ 255)" weight=7
    export function selectMotorSpeed() {
        if (n_Hardware == eHardware.car4) // Fahrmotor am Qwiic Modul
            return a_QwiicMotorSpeed[eQwiicMotor.ma]
        else
            return btf.mapInt32(a_DualMotor_percent[eDualMotor.M0], -100, 100, 1, 255)
        // return a_DualMotorSpeed[eDualMotor.M0]
    }

    //% group="aktuelle Werte (vom gewählten Modell)" advanced=true
    //% block="Servo Winkel (1 ↖ 16 ↗ 31)" weight=5
    export function pinServoWinkel() {
        return Math.idiv(n_Servo90Winkel, 3) - 14
    }

    //% group="aktuelle Werte (vom gewählten Modell)" advanced=true
    //% block="Servo Korrektur (↖ 90 ↗)" weight=4
    export function pinServoKorrektur() {
        return n_Servo90KorrekturFaktor * c_Servo90_geradeaus
    }



    // group="aktuelle Werte (vom gewählten Modell)" advanced=true
    // block="Encoder angeschlossen" weight=3
    /* export function encoderConnected() {
        return n_hasEncoder
    } */



    // ========== group="lokale Funktion" advanced=true

    export enum eTimeoutDisable {
        //% block="automatisch"
        automatisch,
        //% block="nicht ändern"
        nicht
    }

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
    //% block="lokale Funktion %pFunktion" weight=4
    // timeoutAutomatik.shadow=toggleOnOff timeoutAutomatik.defl=1
    export function setFunktion(pFunktion: eFunktion) { // , timeoutAutomatik = eTimeoutDisable.automatisch || Timeout %timeoutAutomatik
        if (n_Funktion != pFunktion) {
            n_Funktion = pFunktion
            //if (timeoutAutomatik == eTimeoutDisable.automatisch)
            //    btf.set_timeoutDisbled(timeoutAutomatik)

            //if (timeoutDisbled == undefined) // Automatik
            //  btf.set_timeoutDisbled(n_Funktion != eFunktion.ng) // true wenn!=0
            //else
            //    btf.set_timeoutDisbled(timeoutDisbled)

            btf.zeige5x5Betriebsart((pFunktion & 1) == 1, (pFunktion & 2) == 2)

            /* if (pFunktion == eFunktion.hindernis_ausweichen)
                btf.zeige5x5Betriebsart(true, false) // A
            else if (pFunktion == eFunktion.spur_folgen)
                btf.zeige5x5Betriebsart(false, true) // B
            else if (pFunktion == eFunktion.fahrplan)
                btf.zeige5x5Betriebsart(true, true)  // A+B
            else
                btf.zeige5x5Betriebsart(false, false)
             */
        }
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
