
namespace receiver { // r-qwiicmotor.ts

    // I²C Adressen Qwiic
    let a_i2cQwiicMotor = [0x5D, 0x5E] // SparkFun Qwiic Motor Driver // Index eQwiicMotorChip

    // speichert die aktuellen Werte mit Index
    let a_QwiicMotorChipConnected = [false, false] // Index eQwiicMotorChip
    let a_QwiicMotorChipReady = [false, false] // Index eQwiicMotorChip
    let a_QwiicMotorChipPower = [false, false] // Index eQwiicMotorChip
    export let a_QwiicMotorSpeed = [c_MotorStop, c_MotorStop, c_MotorStop, c_MotorStop] // Index eQwiicMotor

    export function qwiicMotorChipPowerOn(pMotorChip: eQwiicMotorChip) { // r-fernsteuerung.ts
        return a_QwiicMotorChipPower[pMotorChip]
    }

    // I²C Register Motor Chip
    enum eQwiicMotorI2CRegister {
        ID = 0x01,// Reports hard-coded ID byte of 0xA9
        MA_DRIVE = 0x20,// 0x00..0xFF Default 0x80
        MB_DRIVE = 0x21,
        DRIVER_ENABLE = 0x70, //  0x01: Enable, 0x00: Disable this driver
        FSAFE_CTRL = 0x1F, // Use to configure what happens when failsafe occurs.
        FSAFE_TIME = 0x76,// This register sets the watchdog timeout time, from 10 ms to 2.55 seconds.
        STATUS_1 = 0x77,// This register uses bits to show status. Currently, only b0 is used.
        CONTROL_1 = 0x78 // 0x01: Reset the processor now.
    }
    /*    const ID = 0x01 // Reports hard-coded ID byte of 0xA9
       const MA_DRIVE = 0x20 // 0x00..0xFF Default 0x80
       const MB_DRIVE = 0x21
       const DRIVER_ENABLE = 0x70 //  0x01: Enable, 0x00: Disable this driver
       const FSAFE_CTRL = 0x1F // Use to configure what happens when failsafe occurs.
       const FSAFE_TIME = 0x76 // This register sets the watchdog timeout time, from 10 ms to 2.55 seconds.
       const STATUS_1 = 0x77 // This register uses bits to show status. Currently, only b0 is used.
       const CONTROL_1 = 0x78 // 0x01: Reset the processor now.
    */

    export enum eQwiicMotor {
        //% block="A"
        ma,
        //% block="B"
        mb,
        //% block="C"
        mc,
        //% block="D"
        md,
    }

    export enum eQwiicMotorChip {
        //% block="A B"
        ab,
        //% block="C D"
        cd
    }

    enum eQwiicMotorRGBColor {
        off = Colors.Off,
        notconnected_red = Colors.Red,
        notready_orange = Colors.Orange, // i2cWriteBuffer!=0 Fehler
        poweroff_violet = Colors.Violet,
        poweron_blue = Colors.Blue
    }
    function qwiicMotorRGBLEDs(pMotorChip: eQwiicMotorChip, color: eQwiicMotorRGBColor) {
        btf.setLedColors(pMotorChip == eQwiicMotorChip.cd ? btf.eRgbLed.c : btf.eRgbLed.b, color, true)
    }

    export function qwiicMotorReset() { // aufgerufen beim Start

        a_QwiicMotorChipReady = [false, false]

        control.waitMicros(2000000) // 2 s lange Wartezeit nach Power on

        a_QwiicMotorChipConnected[eQwiicMotorChip.ab] = qwiicMotorChipReset(eQwiicMotorChip.ab)

        control.waitMicros(200)

        a_QwiicMotorChipConnected[eQwiicMotorChip.cd] = qwiicMotorChipReset(eQwiicMotorChip.cd)

    }

    function qwiicMotorChipReset(pMotorChip: eQwiicMotorChip) {
        // Test Start, LED rot
        qwiicMotorRGBLEDs(pMotorChip, eQwiicMotorRGBColor.notconnected_red)

        if (i2cWriteBuffer(pMotorChip, [eQwiicMotorI2CRegister.ID], true)) { // write Register Nummer ID

            if (i2cReadBuffer(pMotorChip, 1)[0] == 0xA9) { // Reports hard-coded ID byte of 0xA9

                if (i2cWriteBuffer(pMotorChip, [eQwiicMotorI2CRegister.CONTROL_1, 1])) { // Reset the processor now.
                    // true 
                    qwiicMotorRGBLEDs(pMotorChip, eQwiicMotorRGBColor.notready_orange)
                    return true
                } else {
                    // bei false bleibt LED rot
                    return false
                }
            } else {
                // bei false bleibt LED rot
                return false
            }
        } else {
            // false I²C Modul nicht vorhanden, LED aus
            qwiicMotorRGBLEDs(pMotorChip, eQwiicMotorRGBColor.off)
            return false
        }
    }

    function qwiicMotorChipReady(pMotorChip: eQwiicMotorChip) { // fragt den I²C Status ab wenn false

        if (a_QwiicMotorChipReady[pMotorChip])
            // wenn Ready nichts weiter testen
            return true
        else if (a_QwiicMotorChipConnected[pMotorChip]) {
            // nur wenn Modul Connected Status Ready testen
            if (i2cWriteBuffer(pMotorChip, [eQwiicMotorI2CRegister.STATUS_1])) {

                if ((i2cReadBuffer(pMotorChip, 1)[0] & 0x01) == 1) {
                    a_QwiicMotorChipReady[pMotorChip] = true
                    qwiicMotorRGBLEDs(pMotorChip, eQwiicMotorRGBColor.poweroff_violet)
                } else {
                    // bei false bleibt LED Orange
                }
            } else {
                // bei false bleibt LED Orange
            }

            return a_QwiicMotorChipReady[pMotorChip]
        } else {
            // I²C Modul nicht angeschlossen
            return false
        }
        /*
        bool ready( void );
        This function checks to see if the SCMD is done booting and is ready to receive commands. Use this
        after .begin(), and don't progress to your main program until this returns true.
        SCMD_STATUS_1: Read back basic program status
            B0: 1 = Enumeration Complete
            B1: 1 = Device busy
            B2: 1 = Remote read in progress
            B3: 1 = Remote write in progress
            B4: Read state of enable pin U2.5"
        */
    }



    // ========== group="Motor A B C D (I²C: 0x5D, 0x5E)" subcategory="Qwiic" color=#5FA38F

    //% group="Motor A B C D (I²C: 0x5D, 0x5E)" subcategory="Qwiic" color=#5FA38F
    //% block="Q Motor %pMotorChip Power %pON" weight=3
    //% pON.shadow="toggleOnOff"
    export function qwiicMotorChipPower(pMotorChip: eQwiicMotorChip, pON: boolean) {
        if (qwiicMotorChipReady(pMotorChip)) {
            // true Motor ON blau, OFF Violet
            let qcolor: eQwiicMotorRGBColor = a_QwiicMotorChipPower[pMotorChip] ? eQwiicMotorRGBColor.poweron_blue : eQwiicMotorRGBColor.poweroff_violet
            // qwiicMotorRGBLEDs(pMotorChip, a_QwiicMotorChipPower[pMotorChip] ? eQwiicMotorRGBColor.poweron_blue : eQwiicMotorRGBColor.poweroff_violet)

            if (a_QwiicMotorChipPower[pMotorChip] !== pON) { // XOR
                a_QwiicMotorChipPower[pMotorChip] = pON
                if (!i2cWriteBuffer(pMotorChip, [eQwiicMotorI2CRegister.DRIVER_ENABLE, a_QwiicMotorChipPower[pMotorChip] ? 0x01 : 0x00])) {
                    // false
                    qcolor = eQwiicMotorRGBColor.notready_orange
                    // qwiicMotorRGBLEDs(pMotorChip, eQwiicMotorRGBColor.notready_orange)
                }
            }
            qwiicMotorRGBLEDs(pMotorChip, qcolor)
        }


        /* if (qwiicMotorChipReady(pMotorChip) && pON !== a_QwiicMotorChipPower[pMotorChip]) {
            a_QwiicMotorChipPower[pMotorChip] = pON
            if (i2cWriteBuffer(pMotorChip, [eQwiicMotorI2CRegister.DRIVER_ENABLE, a_QwiicMotorChipPower[pMotorChip] ? 0x01 : 0x00])) {
                // true Motor ON blau, OFF Violet
                qwiicMotorRGBLEDs(pMotorChip, a_QwiicMotorChipPower[pMotorChip] ? eQwiicMotorRGBColor.poweron_blue : eQwiicMotorRGBColor.poweroff_violet)
            } else {
                // false
                qwiicMotorRGBLEDs(pMotorChip, eQwiicMotorRGBColor.notready_orange)
            }
        } */
    }

    //% group="Motor A B C D (I²C: 0x5D, 0x5E)" subcategory="Qwiic" color=#5FA38F
    //% block="Q Motor %pMotor (1 ↓ 128 ↑ 255) %speed (128 ist STOP)" weight=2
    //% speed.min=0 speed.max=255 speed.defl=128
    export function qwiicMotor128(pMotor: eQwiicMotor, speed: number) {
        if (btf.between(speed, 1, 255)) {
            if (speed != a_QwiicMotorSpeed[pMotor]) { // sendet nur, wenn der Wert sich ändert
                a_QwiicMotorSpeed[pMotor] = speed

                let chip: eQwiicMotorChip = (pMotor == eQwiicMotor.mc || pMotor == eQwiicMotor.md) ? eQwiicMotorChip.cd : eQwiicMotorChip.ab

                if (qwiicMotorChipReady(chip) && a_QwiicMotorChipPower[chip]) {
                    let e = false

                    if (pMotor == eQwiicMotor.ma || pMotor == eQwiicMotor.mc)
                        e = i2cWriteBuffer(chip, [eQwiicMotorI2CRegister.MA_DRIVE, speed])
                    else if (pMotor == eQwiicMotor.mb || pMotor == eQwiicMotor.md)
                        e = i2cWriteBuffer(chip, [eQwiicMotorI2CRegister.MB_DRIVE, speed])

                    if (!e)
                        qwiicMotorRGBLEDs(chip, eQwiicMotorRGBColor.notready_orange)
                }
            }
        }
        else
            qwiicMotor128(pMotor, c_MotorStop)
    }



    // ========== qwiicMotor: pins.i2cWriteBuffer pins.i2cReadBuffer

    function i2cWriteBuffer(pMotorChip: eQwiicMotorChip, bytes: number[], repeat = false) {
        return pins.i2cWriteBuffer(a_i2cQwiicMotor[pMotorChip], Buffer.fromArray(bytes), repeat) == 0
    }

    function i2cReadBuffer(pMotorChip: eQwiicMotorChip, size: number): Buffer {
        return pins.i2cReadBuffer(a_i2cQwiicMotor[pMotorChip], size)
    }

} // r-qwiicmotor.ts
