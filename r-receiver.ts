//% color=#00A38F icon="\uf012" block="Empfänger" weight=93
namespace receiver { // r-receiver.ts
    //radio: color=#E3008C weight=96 icon="\uf012" groups='["Group", "Broadcast", "Send", "Receive"]'
    //color=#008272 

    export enum eHardware { // === NICHT DIE ZAHLENWERTE ÄNDERN, das ist der Index für die Pins ===
        //% block="Calliope v3 mit Leiterplatte"
        v3 = 0,     // Index in Arrays
        //% block="Calliope v1 (CaR 4)"
        car4 = 1   // Index in Arrays
    }

    export let n_Hardware = eHardware.v3 // Index in Arrays:// 0:_Calliope v3 Pins_
    export let n_hasServo = true
    export let n_v3_2Motoren = false // Buggy true

    // eHardware ist der Index für folgende Arrays:
  
    // Calliope v3 freie Pins: C8, C9, C12, C13, C14, C15
    export let a_PinRelay: DigitalPin[] = [109, DigitalPin.P0]     // 0:DigitalPin.C9 GPIO2
    export let a_PinServo: AnalogPin[] = [108, AnalogPin.C4]       // 0:AnalogPin.C8 GPIO1
    export let a_PinEncoderM0: DigitalPin[] = [114, DigitalPin.P2]   // 0:DigitalPin.C14 SPI
    export let a_PinEncoderM1: DigitalPin[] = [112, DigitalPin.C7]    // 0:DigitalPin.C12 GPIO4 Jacdac, CaR4 Licht
    // Spursensor in r-pins.ts
    // export let a_PinSpurRechts: DigitalPin[] = [115, DigitalPin.C9]// 0:DigitalPin.C13 SPI
    // export let a_PinSpurLinks: DigitalPin[] = [113, DigitalPin.C11]// 0:DigitalPin.C15 SPI

    // CaR 4 Pins
    //export const pinRelay = DigitalPin.P0          // 5V Grove Relay
    //export const pinFototransistor = AnalogPin.P1  // GND fischertechnik 36134 Fototransistor
    //export const pinEncoder = DigitalPin.P2        // 5V fischertechnik 186175 Encodermotor Competition
    //export const pinBuzzer = DigitalPin.P3         // 5V Grove Buzzer
    //export const pinServo = AnalogPin.C4           // 5V fischertechnik 132292 Servo
    //const pin5 = DigitalPin.C5              // Draht blau
    //const pin6 = DigitalPin.C6              // Draht gelb
    //export const pinLicht = DigitalPin.C7          // 5V Licht
    export const c_PinUltraschall = DigitalPin.C8    // 5V Grove Ultrasonic
    //export const pinSpurrechts = DigitalPin.C9     // 9V fischertechnik 128598 IR-Spursensor
    //const pin10 = DigitalPin.C10
    //export const pinSpurlinks = DigitalPin.C11     // 9V fischertechnik 128598 IR-Spursensor


    export const c_MotorStop = 128
    export enum eDualMotor { M0, M1, M0_M1 } // muss mit v3 identisch sein
   
    // group="calliope-net.github.io/fernsteuerung"
    // block="beim Start: Calliope v3 \\| 2 Motoren || • Encoder %encoder • Rad ⌀ mm %radDmm • Funkgruppe anzeigen %zf" weight=9
    // encoder.shadow="toggleOnOff" encoder.defl=1
    // radDmm.min=60 radDmm.max=80 radDmm.defl=65
    // zf.shadow="toggleYesNo" zf.defl=1
    /* export function beimStart2Motoren(encoder = true, radDmm = 65, zf = true) {
        // n_v3_2Motoren = true
        // spurSensorKabel(eSpurSensorKabel.vorn)

        n_Hardware = eHardware.v3 // !vor pinRelay!
        pinRelay(true) // Relais an schalten (braucht gültiges n_Hardware, um den Pin zu finden)
        btf.loadStorageBuffer4FromFlash()
        if (zf) {
            btf.zeigeFunkgruppe()
            // btf.zeigeBIN(btf.getStorageServoKorrektur(), btf.ePlot.bcd, 4)
        }
        qwiicMotorReset() // dauert länger als 2 Sekunden

        if (encoder)
            encoderOn(radDmm)

        btf.beimStartReceiver(btf.eNamespace.receiver)
    } */

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Empfänger | %modell Servo ↑ ° %servoGeradeaus Encoder %encoder Rad Durchmesser mm %radDmm Funkgruppe anzeigen %zf" weight=8
    //% servoGeradeaus.min=81 servoGeradeaus.max=99 servoGeradeaus.defl=90
    //% encoder.shadow="toggleOnOff"
    //% radDmm.min=60 radDmm.max=80 radDmm.defl=65
    //% zf.shadow="toggleYesNo" zf.defl=1
    // inlineInputMode=inline
    export function beimStart(modell: eHardware, servoGeradeaus: number, encoder: boolean, radDmm: number, zf = true/* , funkgruppe?: number */) { //  Funkgruppe %funkgruppe
        n_Hardware = modell // !vor pinRelay!
        pinRelay(true) // Relais an schalten (braucht gültiges n_Hardware, um den Pin zu finden)

        btf.loadStorageBuffer4FromFlash(0, servoGeradeaus) // lädt aus Flash; prüft und speichert in a_StorageBuffer; nicht in Flash

        n_v3_2Motoren = (n_Hardware == eHardware.v3) && (btf.getStorageFunkgruppe() == btf.eFunkgruppe.b4)
        n_hasServo = !n_v3_2Motoren
        n_SpurSensorKabel = n_v3_2Motoren ? eSpurSensorKabel.vorn : eSpurSensorKabel.hinten
        //if (zf) {
        //    btf.zeigeFunkgruppe()
        //    // btf.zeigeBIN(btf.getStorageServoKorrektur(), btf.ePlot.bcd, 4)
        //}

        if (n_hasServo) { // Modell mit Servo
            if (zf) {
                btf.zeigeFunkgruppe()
                btf.zeigeBIN(btf.getStorageServoKorrektur(), btf.ePlot.bcd, 4)
            }
            n_Servo90KorrekturFaktor = btf.getStorageServoKorrektur() / c_Servo90_geradeaus // z.B. 95/90=1.05
            n_Servo90Winkel = 0 // damit der Servo ändert und bewegt
            pinServo90(c_Servo90_geradeaus)
        }
        else {
            if (zf) {
                let ai = [14, 4, 4, 4, 14] // Buggy Image anzeigen
                for (let xLed = 0; xLed < ai.length; xLed++) {
                    btf.zeigeBIN(ai[xLed], btf.ePlot.bin, xLed)
                }
                btf.setClearScreen()
            }
        }

        qwiicMotorReset() // dauert länger als 2 Sekunden

        if (encoder)
            encoderOn(radDmm)

        btf.beimStartReceiver(btf.eNamespace.receiver,
            function (pStorageChange: btf.eStorageBuffer, buttonB: boolean) { // wird bei Button hold aufgerufen von b-fernsteuerung.ts
                if (pStorageChange == btf.eStorageBuffer.servoKorrektur) {    // und nur bei Servo Korrektur
                    let sK = btf.getStorageServoKorrektur() + (buttonB ? 1 : -1)
                    btf.setStorageServoKorrektur(sK)
                    btf.zeigeBIN(sK, btf.ePlot.bcd, 4)
                    n_Servo90KorrekturFaktor = sK / c_Servo90_geradeaus // z.B. 95/90=1.05
                    n_Servo90Winkel = 0
                    pinServo90(c_Servo90_geradeaus)
                }
            }
        ) // setzt auch n_start true, muss deshalb zuletzt stehen

    }


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Knopf A+B halten, Servo Korrektur" weight=4
    export function buttonABhold() {
        //btf.n_servoKorrekturButton = !btf.n_servoKorrekturButton
        btf.n_StorageChange = btf.eStorageBuffer.servoKorrektur
    }
  


    // ========== group="Fahren und Lenken"

    //% group="Fahren und Lenken"
    //% block="Fahren %motor \\% • Lenken %servo ° || • 2 Motoren %lenkenProzent \\%" weight=5
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function selectMotorServoPicker(motor: number, servo: number, lenkenProzent = 50) {
        selectMotor128Servo16(btf.speedPicker(motor), btf.protractorPicker(servo), lenkenProzent)
    }

    //% group="Fahren und Lenken"
    //% block="Fahren (1↓128↑255) %x_1_128_255 • Lenken (1↖16↗31) %y_1_16_31 || • 2 Motoren %lenkenProzent \\%" weight=4
    //% x_1_128_255.min=1 x_1_128_255.max=255 x_1_128_255.defl=128
    //% y_1_16_31.min=1 y_1_16_31.max=31 y_1_16_31.defl=16
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function selectMotor128Servo16(x_1_128_255: number, y_1_16_31 = 0, lenkenProzent = 50) {

        if (n_Hardware == eHardware.car4) { // Fahrmotor am Qwiic Modul
            qwiicMotor128(eQwiicMotor.ma, x_1_128_255)
            if (y_1_16_31 != 0)
                pinServo16(y_1_16_31)       // Servo
        }
        else if (n_v3_2Motoren) {        // Buggy mit 2 Motoren
            dual2MotorenLenken(x_1_128_255, y_1_16_31, lenkenProzent)
        }
        else {                              // Standard M0 Fahrmotor an Calliope v3 Pins
            dualMotor128(eDualMotor.M0, x_1_128_255)
            if (y_1_16_31 != 0)
                pinServo16(y_1_16_31)       // Servo
        }
    }

    //% group="Fahren und Lenken"
    //% block="Fahren Stop || • Lenken ↑ %servoGeradeaus" weight=3
    //% servoGeradeaus.shadow=toggleYesNo
    export function selectMotorStop(servoGeradeaus = false) {
        selectMotor128Servo16(c_MotorStop, servoGeradeaus ? 16 : 0)
        //if (servoGeradeaus)
        //    pinServo90(90)
    }

    export function selectMotorRichtungVor() {
        if (n_Hardware == eHardware.car4) { // Fahrmotor am Qwiic Modul
            return a_QwiicMotorSpeed[eQwiicMotor.ma] >= c_MotorStop
        }
        //else if (n_v3_2Motoren) {        // Buggy mit 2 Motoren nur linker Motor
        //    return a_DualMotor_percent[eDualMotor.M0] >= 0
        //}
        else {                              // Standard M0 Fahrmotor an Calliope v3 Pins
            return a_DualMotor_percent[eDualMotor.M0] >= 0
        }

    }

    // ========== group="Motor 0 1 (Calliope v3)"

    //% group="Motor 0 1 (Calliope v3)"
    //% block="Motor %motor (1 ↓ 128 ↑ 255) %speed (128 ist STOP)" weight=6
    //% speed.min=0 speed.max=255 speed.defl=128
    export function dualMotor128(motor: eDualMotor, speed: number) { // sendet nur an MotorChip, wenn der Wert sich ändert

        if (btf.between(speed, 1, 255)) {

            // let duty_percent = btf.mapInt32(speed, 1, 255, -100, 100)
            dualMotorPower_percent(motor, btf.mapInt32(speed, 1, 255, -100, 100))

            /* if (motor == eDualMotor.M0 && speed != a_DualMotorSpeed[eDualMotor.M0]) {
                a_DualMotorSpeed[eDualMotor.M0] = speed
                dualMotorPower(motor, duty_percent)
            }
            else if (motor == eDualMotor.M1 && speed != a_DualMotorSpeed[eDualMotor.M1]) {
                a_DualMotorSpeed[eDualMotor.M1] = speed
                dualMotorPower(motor, duty_percent)
            }
            else if (motor == eDualMotor.M0_M1 && (speed != a_DualMotorSpeed[eDualMotor.M0] || speed != a_DualMotorSpeed[eDualMotor.M1])) {
                a_DualMotorSpeed[eDualMotor.M0] = speed
                a_DualMotorSpeed[eDualMotor.M1] = speed
                dualMotorPower(motor, duty_percent)
            } */
        }
        else { // speed=0 oder ungültige Werte
            dualMotor128(motor, c_MotorStop) // 128
        }
    }


    let onDualMotorPowerHandler: (motor: number, duty_percent: number) => void

    export function onDualMotorPower(cb: (motor: number, duty_percent: number) => void) {
        onDualMotorPowerHandler = cb
    }


    export let a_DualMotor_percent = [0, 0] // aktueller Status

    export function dualMotorPower_percent(motor: eDualMotor, duty_percent: number) {
        if (onDualMotorPowerHandler) { // r-calliope-v3.ts
            if (motor == eDualMotor.M0_M1 && (a_DualMotor_percent[0] != duty_percent || a_DualMotor_percent[1] != duty_percent)) {
                a_DualMotor_percent[0] = duty_percent
                a_DualMotor_percent[1] = duty_percent
                onDualMotorPowerHandler(motor, duty_percent) // v3 Ereignis Block auslösen, nur wenn benutzt
            }
            else if (motor == eDualMotor.M0 && a_DualMotor_percent[0] != duty_percent) {
                a_DualMotor_percent[0] = duty_percent
                onDualMotorPowerHandler(motor, duty_percent) // v3 Ereignis Block auslösen, nur wenn benutzt
            }
            else if (motor == eDualMotor.M1 && a_DualMotor_percent[1] != duty_percent) {
                a_DualMotor_percent[1] = duty_percent
                onDualMotorPowerHandler(motor, duty_percent) // v3 Ereignis Block auslösen, nur wenn benutzt
            }
            // if (onDualMotorPowerHandler)
            //     onDualMotorPowerHandler(motor, duty_percent) // v3 Ereignis Block auslösen, nur wenn benutzt
        }
    }
  
} // r-receiver.ts
