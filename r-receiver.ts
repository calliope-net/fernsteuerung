//% color=#00A38F icon="\uf012" block="Empfänger" weight=93
namespace receiver { // r-receiver.ts
    //radio: color=#E3008C weight=96 icon="\uf012" groups='["Group", "Broadcast", "Send", "Receive"]'
    //color=#008272 

    export enum eHardware { // === NICHT DIE ZAHLENWERTE ÄNDERN, das ist der Index für die Pins ===
        //% block="Maker Kit Car (Calliope v3)"
        v3 = 0,     // Index in Arrays
        //% block="CaR 4 (Calliope v1)"
        car4 = 1   // Index in Arrays
    }

    export let n_Hardware = eHardware.v3 // Index in Arrays:// 0:_Calliope v3 Pins_

    // eHardware ist der Index für folgende Arrays:
    //export let a_ModellFunkgruppe = [0xA8, 239] // v3, car4

    // Calliope v3 freie Pins: C8, C9, C12, C13, C14, C15
    export let a_PinRelay: DigitalPin[] = [109, DigitalPin.P0]     // 0:DigitalPin.C9 GPIO2
    let a_PinServo: AnalogPin[] = [108, AnalogPin.C4]       // 0:AnalogPin.C8 GPIO1
    export let a_PinLicht: DigitalPin[] = [112, DigitalPin.C7]    // 0:DigitalPin.C12 GPIO4 Jacdac
    export let a_PinEncoder: DigitalPin[] = [114, DigitalPin.P2]   // 0:DigitalPin.C14 SPI
    export let a_PinSpurrechts: DigitalPin[] = [115, DigitalPin.C9]// 0:DigitalPin.C13 SPI
    export let a_PinSpurlinks: DigitalPin[] = [113, DigitalPin.C11]// 0:DigitalPin.C15 SPI

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


    export enum eDualMotor { M0, M1, M0_M1 } // muss mit v3 identisch sein

    export const c_MotorStop = 128
    let a_DualMotorSpeed = [c_MotorStop, c_MotorStop]

    const c_Servo90_geradeaus = 90
    let n_Servo90KorrekturFaktor = 1 // Winkel für geradeaus wird beim Start eingestellt
    let n_Servo90Winkel = c_Servo90_geradeaus // aktuell eingestellter Winkel


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Empfänger | %modell Servo ↑ ° %servoGeradeaus Encoder %encoder Rad Durchmesser mm %radDmm Funkgruppe || anzeigen %zf Funkgruppe %funkgruppe" weight=8
    //% servoGeradeaus.min=81 servoGeradeaus.max=99 servoGeradeaus.defl=90
    //% encoder.shadow="toggleOnOff"
    //% radDmm.min=60 radDmm.max=80 radDmm.defl=65
    //% zf.shadow="toggleYesNo" zf.defl=1
    // funkgruppe.min=160 funkgruppe.max=191
    // inlineInputMode=inline
    export function beimStart(modell: eHardware, servoGeradeaus: number, encoder: boolean, radDmm: number, zf = true, funkgruppe?: number) {
        n_Hardware = modell // !vor pinRelay!

        pinRelay(true) // Relais an schalten (braucht gültiges n_Hardware, um den Pin zu finden)

        btf.setStorageBuffer(funkgruppe, servoGeradeaus) // prüft und speichert in a_StorageBuffer
        if (zf) {
            btf.zeigeFunkgruppe()
            btf.zeigeBIN(btf.getStorageServoKorrektur(), btf.ePlot.bcd, 4)
        }
        n_Servo90KorrekturFaktor = btf.getStorageServoKorrektur() / c_Servo90_geradeaus // z.B. 95/90=1.05

        n_Servo90Winkel = 0 // damit der Servo ändert und bewegt
        pinServo90(c_Servo90_geradeaus)

        qwiicMotorReset() // dauert länger als 2 Sekunden

        if (encoder)
            encoderRegisterEvent(radDmm)


        btf.beimStartintern(btf.eNamespace.receiver,
            function (pStorageChange: btf.eStorageBuffer, buttonB: boolean) { // wird bei Button hold aufgerufen von b-fernsteuerung.ts
                if (pStorageChange == btf.eStorageBuffer.servoKorrektur) {
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


    // ========== group="Motor 0 1 (Calliope v3)"

    //% group="Motor 0 1 (Calliope v3)"
    //% block="Motor %motor (1 ↓ 128 ↑ 255) %speed (128 ist STOP)" weight=6
    //% speed.min=0 speed.max=255 speed.defl=128
    export function dualMotor128(motor: eDualMotor, speed: number) { // sendet nur an MotorChip, wenn der Wert sich ändert

        if (btf.between(speed, 1, 255)) {

            let duty_percent = btf.mapInt32(speed, 1, 255, -100, 100)

            if (motor == eDualMotor.M0 && speed != a_DualMotorSpeed[eDualMotor.M0]) {
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
            }
        }
        else { // speed=0
            dualMotor128(motor, c_MotorStop) // 128
        }
    }


    let onDualMotorPowerHandler: (motor: number, duty_percent: number) => void

    export function onDualMotorPower(cb: (motor: number, duty_percent: number) => void) {
        onDualMotorPowerHandler = cb
    }

    function dualMotorPower(motor: number, duty_percent: number) {
        if (onDualMotorPowerHandler)
            onDualMotorPowerHandler(motor, duty_percent) // v3 Ereignis Block auslösen, nur wenn benutzt
    }



    // ========== group="Motor (vom gewählten Modell)"

    //% group="Motor (vom gewählten Modell)"
    //% block="Fahren (-100 ↓ 0 ↑ +100) %speed \\%" weight=5
    //% speed.shadow=speedPicker
    export function selectMotorPicker(speed: number) {
        selectMotor(btf.speedPicker(speed))
    }

    //% group="Motor (vom gewählten Modell)"
    //% block="Fahren (1 ↓ 128 ↑ 255) %speed (128 ist STOP)" weight=4
    //% speed.min=0 speed.max=255 speed.defl=128
    export function selectMotor(speed: number) {
        if (n_Hardware == eHardware.car4) // Fahrmotor am Qwiic Modul
            qwiicMotor128(eQwiicMotor.ma, speed)
        else // Standard M0 Fahrmotor an Calliope v3 Pins
            dualMotor128(eDualMotor.M0, speed)
    }

    //% group="Motor (vom gewählten Modell)"
    //% block="Motor Stop • Servo ↑ %servoGeradeaus" weight=3
    //% servoGeradeaus.shadow=toggleYesNo servoGeradeaus.defl=1
    export function selectMotorStop(servoGeradeaus: boolean) {
        selectMotor(c_MotorStop)
        if (servoGeradeaus)
            pinServo90(90)
    }

    export function selectMotorSpeed() {
        if (n_Hardware == eHardware.car4) // Fahrmotor am Qwiic Modul
            return a_QwiicMotorSpeed[eQwiicMotor.ma]
        else
            return a_DualMotorSpeed[eDualMotor.M0]
    }




    // ========== group="Servo (vom gewählten Modell)"

    //% group="Servo (vom gewählten Modell)"
    //% block="Servo %servo °" weight=4
    //% servo.shadow=protractorPicker servo.defl=90
    export function pinServoPicker(servo: number) {
        pinServo16(btf.protractorPicker(servo))
    }

    //% group="Servo (vom gewählten Modell)"
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
            pinServo90(90)
    }


    //% group="Servo (vom gewählten Modell)"
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



    // ========== group="RGB LEDs (v3)" subcategory="Aktoren"

    export enum eRGBled { a, b, c } // Index im Array
    let n_RgbLed = 0 // aktueller Wert v1 v2

    // deklariert die Variable mit dem Delegat-Typ '(color1: number, color2: number, color3: number, brightness: number) => void'
    // ein Delegat ist die Signatur einer function mit den selben Parametern
    // es wird kein Wert zurück gegeben (void)
    // die Variable ist noch undefined, also keiner konkreten Funktion zugeordnet
    let onSetLedColorsHandler: (color1: number, color2: number, color3: number, brightness: number) => void


    // sichtbarer Event-Block; deprecated=true
    // wird bei v3 automatisch im Code r-aktoren-v3.ts aufgerufen und deshalb nicht als Block angezeigt

    //% group="RGB LEDs (Calliope v3)" deprecated=true
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors(cb: (a: number, b: number, c: number, brightness: number) => void) {
        // das ist der sichtbare Ereignis Block 'SetLedColors (a, b, c, brightness)'
        // hier wird nur der Delegat-Variable eine konkrete callback function zugewiesen
        // dieser Block speichert in der Variable, dass er beim Ereignis zurückgerufen werden soll
        onSetLedColorsHandler = cb
        // aufgerufen wird in der function 'rgbLEDs' die der Variable 'onSetLedColorsHandler' zugewiesene function
        // das sind die Blöcke, die später im Ereignis Block 'SetLedColors (a, b, c, brightness)' enthalten sind
    }


    let onSetLedColorsHandler_v3: (led: eRGBled, color: number, on: boolean, blinken: boolean, helligkeit: number) => void
    //% group="RGB LEDs (Calliope v3)" deprecated=true
    //% block="SetLedColors" weight=9
    //% draggableParameters=reporter
    export function onSetLedColors_v3(cb: (led: eRGBled, color: number, on: boolean, blinken: boolean, helligkeit: number) => void) {
        onSetLedColorsHandler_v3 = cb
    }


    // ========== group="RGB LEDs (Calliope v1 v2 v3)"


    //% group="RGB LEDs (Calliope v1 v2 v3)"
    //% block="RGB LED %led %color || %on blinken %blinken Helligkeit %helligkeit \\%" weight=4
    //% on.shadow=toggleOnOff on.defl=1
    //% color.shadow="colorNumberPicker"
    //% blinken.shadow=toggleYesNo
    //% helligkeit.min=5 helligkeit.max=100 helligkeit.defl=20
    //% inlineInputMode=inline
    export function setLedColors(led: eRGBled, color: number, on = true, blinken = false, helligkeit = 20) {
        if (onSetLedColorsHandler_v3) { // v3 hat 3 RgbLeds
            onSetLedColorsHandler_v3(led, color, on, blinken, helligkeit)
        }
        else if (led == eRGBled.a) { // b und c wird ignoriert
            if (!on || (blinken && n_RgbLed == color)) // entweder aus .. oder an und blinken
                color = Colors.Off // alle Farben aus = 0

            if (n_RgbLed != color) { // nur wenn Farbe geändert
                n_RgbLed = color
                basic.setLedColor(n_RgbLed) // v1 v2
            }
        }
    }

    //% group="RGB LEDs (Calliope v1 v2 v3)"
    //% block="RGB LEDs aus" weight=3
    export function setLedColorsOff() {
        if (onSetLedColorsHandler)
            onSetLedColorsHandler(0, 0, 0, 20) // v3 Ereignis Block auslösen, nur wenn benutzt
        else
            basic.setLedColor(0) // v1 v2
    }


} // r-receiver.ts
