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
    //block="Calli:Bot 2 (v1 v2 v3)"
    //calli2bot = 2,

    export let n_Hardware = eHardware.v3 // Index in Arrays:// 0:_Calliope v3 Pins_

    // eHardware ist der Index für folgende Arrays:
    export let a_ModellFunkgruppe = [0xA8, 239] // v3, car4

    // Calliope v3 freie Pins: C8, C9, C12, C13, C14, C15
    export let a_PinRelay: DigitalPin[] = [109, DigitalPin.P0]     // 0:DigitalPin.C9 GPIO2
    let a_PinServo: AnalogPin[] = [108, AnalogPin.C4]       // 0:AnalogPin.C8 GPIO1
    export let a_PinLicht: DigitalPin[] = [112, DigitalPin.C7]    // 0:DigitalPin.C12 GPIO4 Jacdac
    export let a_PinEncoder: DigitalPin[] = [114, DigitalPin.P2]   // 0:DigitalPin.C14 SPI
    export let a_PinSpurrechts: DigitalPin[] = [113, DigitalPin.C9]// 0:DigitalPin.C13 SPI
    export let a_PinSpurlinks: DigitalPin[] = [115, DigitalPin.C11]// 0:DigitalPin.C15 SPI

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



    // PINs
    //const c_pinServo: AnalogPin = 108 // v3 AnalogPin.C8 GPIO1 // 5V fischertechnik 132292 Servo
    //const c_pinServo = c_pinServov3// <AnalogPin><number>DigitalPin.C8
    //const c_pinEncoder = DigitalPin.P2        // 5V fischertechnik 186175 Encodermotor Competition

    export enum eDualMotor { M0, M1, M0_M1 } // muss mit v3 identisch sein

    export const c_MotorStop = 128
    let a_DualMotorSpeed = [c_MotorStop, c_MotorStop]

    //  export let n_dualMotor0Speed = c_DualMotorStop  // aktueller Wert im Chip
    //  let n_dualMotor1Speed = c_DualMotorStop  // aktueller Wert im Chip


    const c_Servo_geradeaus = 90
    let n_ServoGeradeaus = c_Servo_geradeaus // Winkel für geradeaus wird beim Start eingestellt
    let n_ServoWinkel = c_Servo_geradeaus // aktuell eingestellter Winkel


    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Empfänger | %modell Servo ↑ ° %servoGeradeaus Encoder %encoder Rad Durchmesser mm %radDmm Funkgruppe || anzeigen %zf Funkgruppe %modellFunkgruppe" weight=8
    //% servoGeradeaus.min=81 servoGeradeaus.max=99 servoGeradeaus.defl=90
    //% encoder.shadow="toggleOnOff"
    //% radDmm.min=60 radDmm.max=80 radDmm.defl=65
    //% zf.shadow="toggleYesNo" zf.defl=1
    // modellFunkgruppe.min=160 modellFunkgruppe.max=191
    // inlineInputMode=inline
    export function beimStart(modell: eHardware, servoGeradeaus: number, encoder: boolean, radDmm: number, zf = true, modellFunkgruppe?: number) {
        n_Hardware = modell
        n_ServoGeradeaus = servoGeradeaus // Parameter

        pinRelay(true) // Relais an schalten (braucht gültiges n_Modell, um den Pin zu finden)

        btf.setStorageBuffer(modellFunkgruppe) // prüft und speichert in a_StorageBuffer
        if (zf)
            btf.zeigeFunkgruppe()

        pins.servoWritePin(a_PinServo[n_Hardware], n_ServoGeradeaus)
        // pinServo90(c_Servo_geradeaus)

        qwiicMotorReset() // dauert länger als 2 Sekunden

        if (encoder)
            encoderRegisterEvent(radDmm)

        btf.beimStartintern(btf.eNamespace.receiver) // setzt auch n_start true, muss deshalb zuletzt stehen

    }



    // ========== group="Motor 0 1 (Calliope v3)"

    //% group="Motor 0 1 (Calliope v3)"
    //% block="Motor %motor (1 ↓ 128 ↑ 255) %speed (128 ist STOP)" weight=6
    //% speed.min=0 speed.max=255 speed.defl=128
    export function dualMotor128(motor: eDualMotor, speed: number) { // sendet nur an MotorChip, wenn der Wert sich ändert
        //  if (n_MotorPower) {
        if (btf.between(speed, 1, 255)) {
            //let duty_percent = (speed == c_MotorStop ? 0 : Math.map(speed, 1, 255, -100, 100))
            //            let duty_percent = Math.round(Math.map(speed, 1, 255, -100, 100))
            let duty_percent = btf.mapInt32(speed, 1, 255, -100, 100)
            //n_StatusString = duty_percent.toString()

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
        } else { // n_MotorPower false oder speed=0
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



    // ========== group="aktueller Motor (vom gewählten Modell)"

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
            pinServo90((46 - winkel) * 3)  // 1->135 16->90 31->45
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
        if (btf.between(winkel, 45, 135) && n_ServoWinkel != winkel) {
            n_ServoWinkel = winkel
            pins.servoWritePin(a_PinServo[n_Hardware], winkel + n_ServoGeradeaus - c_Servo_geradeaus)
        }
    }



    // ========== group="RGB LEDs (v3)" subcategory="Aktoren"

    export enum eRGBled { a, b, c } // Index im Array
    let a_RgbLeds = [0, 0, 0] // speichert 3 LEDs, wenn nur eine geändert wird
    let n_RgbLedTimer = input.runningTime() // ms seit Start, zwischen zwei Aufrufen ist eine Pause erforderlich


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


    // ========== group="RGB LEDs (Calliope v3)"

    //% group="RGB LEDs (Calliope v3)"
    //% block="RGB LED %led %color || %on blinken %blinken Helligkeit %helligkeit \\%" weight=4
    //% on.shadow=toggleOnOff on.defl=1
    //% color.shadow="colorNumberPicker"
    //% blinken.shadow=toggleYesNo
    //% helligkeit.min=5 helligkeit.max=100 helligkeit.defl=20
    //% inlineInputMode=inline
    export function setLedColors(led: eRGBled, color: number, on = true, blinken = false, helligkeit = 20) {
        // rgbLEDs(led, (on ? color : 0), blinken, helligkeit)

        if (!on || (blinken && a_RgbLeds[led] == color)) // entweder aus .. oder an und blinken
            color = Colors.Off // alle Farben aus = 0

        if (a_RgbLeds[led] != color) { // nur wenn Farbe geändert

            a_RgbLeds[led] = color

            let t = input.runningTime() - n_RgbLedTimer // ms seit letztem setLedColor
            if (t < 25)
                basic.pause(t) // restliche Zeit-Differenz bis 10 ms warten
            n_RgbLedTimer = input.runningTime()

            if (onSetLedColorsHandler)
                onSetLedColorsHandler(a_RgbLeds[0], a_RgbLeds[1], a_RgbLeds[2], helligkeit) // v3 Ereignis Block auslösen, nur wenn benutzt
            else
                basic.setLedColor(a_RgbLeds[0]) // v1 v2
        }
    }




    // ========== deprecated=1
    /* 
        //% group="RGB LEDs (Calliope v3)"
        //% block="RGB- LEDs %led %color %on || Helligkeit %helligkeit \\%" weight=6 deprecated=1
        //% color.shadow="colorNumberPicker"
        //% on.shadow="toggleOnOff"
        //% helligkeit.min=5 helligkeit.max=100 helligkeit.defl=20
        //% inlineInputMode=inline 
        export function rgbLEDon(led: eRGBled, color: number, on: boolean, helligkeit = 20) {
            rgbLEDs(led, (on ? color : 0), false, helligkeit)
        }
    
        //% group="RGB LEDs (Calliope v3)"
        //% block="RGB- LEDs %led %color blinken %blinken || Helligkeit %helligkeit \\%" weight=5 deprecated=1
        //% color.shadow="colorNumberPicker"
        //% blinken.shadow="toggleYesNo"
        //% helligkeit.min=5 helligkeit.max=100 helligkeit.defl=20
        //% inlineInputMode=inline 
        export function rgbLEDs(led: eRGBled, color: number, blinken: boolean, helligkeit = 20) {
            if (blinken && a_RgbLeds[led] != 0)
                a_RgbLeds[led] = 0
            else
                a_RgbLeds[led] = color
    
            while (input.runningTime() < (n_RgbLedTimer + 1)) { // mindestens 1 ms seit letztem basic.setLedColors warten
                control.waitMicros(100)
            }
            n_RgbLedTimer = input.runningTime()  // ms seit Start
    
            //basic.setLedColors(n_rgbled[0], n_rgbled[1], n_rgbled[2])
    
            // die Variable 'onSetLedColorsHandler' ist normalerweise undefined, dann passiert nichts
            // die Variable erhält einen Wert, wenn der Ereignis Block 'onSetLedColors' einmal im Code vorkommt
            // der Wert der Variable 'onSetLedColorsHandler' ist die function, die bei true zurück gerufen wird
            // die function ruft mit den 4 Parametern die Blöcke auf, die im Ereignis-Block stehen
            if (onSetLedColorsHandler)
                onSetLedColorsHandler(a_RgbLeds[0], a_RgbLeds[1], a_RgbLeds[2], helligkeit) // v3 Ereignis Block auslösen, nur wenn benutzt
            else
                basic.setLedColor(a_RgbLeds[0]) // v1 v2
        }
     */
} // r-receiver.ts
