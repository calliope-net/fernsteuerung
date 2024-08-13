//% color=#00C040 icon="\uf188" block="Calli:bot 2" weight=92
namespace cb2 { // c-callibot.ts 005F7F

    // ========== I²C ==========
    export enum eI2C { x22 = 0x22, x21 = 0x21 }

    let n_Callibot2_x22Connected = true // I²C Device ist angesteckt (und Calli:bot ist an geschaltet)
    // let n_Callibot2_x22hasEncoder = false // 2:CB2 3:CB2E 4:CB2A=Gymnasium

    export const c_MotorStop = 128
    //  const c_Servo_geradeaus = 16

    export let n_EncoderFaktor = 3 * 150 / (4.55 * Math.PI) //=31.48 Impulse/cm // 3 Motor*150 Getriebe/(Raddurchmesser*PI=Umfang)


    // ========== group="calliope-net.github.io/fernsteuerung"

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Calli:bot 2 || Funkgruppe anzeigen %zf %modellFunkgruppe" weight=8
    //% zf.shadow="toggleYesNo" zf.defl=1
    export function beimStart(zf = true, modellFunkgruppe?: number) {

        writeReset() // Reset Motoren, LEDs

        btf.setStorageBuffer(modellFunkgruppe) // prüft und speichert in a_StorageBuffer

        if (zf)
            btf.zeigeFunkgruppe()

        btf.beimStartintern(btf.eNamespace.cb2) // setzt auch n_start true, muss deshalb zuletzt stehen
    }

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="Reset Motoren, LEDs" weight=4
    export function writeReset() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
    }



    // ========== group="Fahren und Lenken"

    // aktuelle Werte // I²C nur bei Änderung
    export let n_x1_128_255: number
    export let n_y1_16_31: number


    //% group="Fahren und Lenken"
    //% block="Fahren %motor \\% • Lenken %servo ° || • Lenken %lenkenProzent \\%" weight=5
    //% motor.shadow=speedPicker motor.defl=50
    //% servo.shadow=protractorPicker servo.defl=90
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function writeMotorServoPicker(motor: number, servo: number, lenkenProzent = 50) {
        writeMotor128Servo16(btf.speedPicker(motor), btf.protractorPicker(servo), lenkenProzent)
    }

    // group="Geschwindigkeit (1 ↓ 128 ↑ 255), Winkel (1 ↖ 16 ↗ 31)"
    //% group="Fahren und Lenken"
    //% block="Fahren (1↓128↑255) %x_1_128_255 • Lenken (1↖16↗31) %y_1_16_31 || • Lenken %lenkenProzent \\%" weight=4
    //% x_1_128_255.min=1 x_1_128_255.max=255 x_1_128_255.defl=128
    //% y_1_16_31.min=1 y_1_16_31.max=31 y_1_16_31.defl=16
    //% lenkenProzent.min=10 lenkenProzent.max=90 lenkenProzent.defl=50
    export function writeMotor128Servo16(x_1_128_255: number, y_1_16_31: number, lenkenProzent = 50) {
        n_m1_1_128_255 = undefined
        n_m2_1_128_255 = undefined // die anderen zwischengespeicherten Werte ungültig machen

        if ((n_x1_128_255 != x_1_128_255 || n_y1_16_31 != y_1_16_31) && x_1_128_255 != 0 && y_1_16_31 != 0) {
            n_x1_128_255 = x_1_128_255
            n_y1_16_31 = y_1_16_31 // I²C nur bei Änderung

            let setMotorBuffer = Buffer.create(6)
            setMotorBuffer[0] = eRegister.SET_MOTOR   // 2
            setMotorBuffer[1] = 3 // ec2Motor.beide     // 3

            if ((x_1_128_255 & 0x80) == 0x80) {  // 128..255 vorwärts
                setMotorBuffer[2] = 0
                setMotorBuffer[3] = (x_1_128_255 << 1) // linkes Bit weg=0..127 * 2 // 128=00, 129=02, 130=04, 254=FC, 255=FE
                setMotorBuffer[4] = 0
                setMotorBuffer[5] = setMotorBuffer[3]
            }
            else {                            // 0..127 rückwärts
                setMotorBuffer[2] = 1
                setMotorBuffer[3] = ~(x_1_128_255 << 1) // * 2 und bitweise NOT // 0=FF, 1=FD, 126=03, 127=01,
                setMotorBuffer[4] = 1
                setMotorBuffer[5] = setMotorBuffer[3]
            }

            // lenken (ein Motor wird langsamer)
            if (btf.between(y_1_16_31, 1, 15)) { // links
                setMotorBuffer[3] *= Math.map(y_1_16_31, 0, 16, lenkenProzent / 100, 1) // 0=linkslenken50% // 16=nichtlenken=100%
            }
            else if (btf.between(y_1_16_31, 17, 31)) { // rechts
                setMotorBuffer[5] *= Math.map(y_1_16_31, 16, 32, 1, lenkenProzent / 100) // 16=nichtlenken=100% // 32=rechtslenken50%
            }
            //else { // wenn y lenken 0, 16 oder mehr als 5 Bit
            //}

            i2cWriteBuffer(setMotorBuffer)
        }
    }

    //% group="Fahren und Lenken"
    //% block="beide Motoren Stop" weight=1
    export function writeMotorenStop() {
        if (n_x1_128_255 != c_MotorStop || n_m1_1_128_255 != c_MotorStop || n_m2_1_128_255 != c_MotorStop) {

            n_x1_128_255 = c_MotorStop
            n_y1_16_31 = undefined // die anderen zwischengespeicherten Werte ungültig machen

            n_m1_1_128_255 = c_MotorStop
            n_m2_1_128_255 = c_MotorStop // I²C nur bei Änderung

            let setMotorBuffer = Buffer.create(6)
            setMotorBuffer[0] = eRegister.SET_MOTOR   // 2
            setMotorBuffer[1] = 3 // ec2Motor.beide     // 3
            setMotorBuffer.fill(0, 2)

            i2cWriteBuffer(setMotorBuffer)
        }
    }



    // ========== group="LEDs (Calli:bot)"

    // aktuelle Werte // I²C nur bei Änderung
    let a_LEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken

    //% blockId=cb2_colorPicker block="%value" blockHidden=true
    //% shim=TD_ID
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.fieldOptions.colours='["#0000ff","#00ff00","#00ffdc","#ff0000","#a300ff","#ffff00","#ffffff","#000000"]'
    //% value.fieldOptions.columns=4 value.fieldOptions.className='rgbColorPicker'  
    export function cb2_colorPicker(value: number) { return value }
    // von "callibot": "github:MKleinSB/pxt-callibot#v2.1.1"

    //% group="LEDs (Calli:bot)"
    //% block="RGB LEDs %color %on || ↖ %lv ↙ %lh ↘ %rh ↗ %rv blinken %blink" weight=7
    //% color.shadow="cb2_colorPicker"
    //% on.shadow=toggleOnOff on.defl=1
    //% lv.shadow="toggleYesNo" lh.shadow="toggleYesNo" rh.shadow="toggleYesNo" rv.shadow="toggleYesNo"
    //% blink.shadow="toggleYesNo"
    //% inlineInputMode=inline expandableArgumentMode="toggle"
    export function writecb2RgbLeds(color: number, on: boolean, lv = true, lh = true, rh = true, rv = true, blink = false) {

        if (lv) writecb2RgbLed(eRgbLed.lv, color, on, blink)
        if (lh) writecb2RgbLed(eRgbLed.lh, color, on, blink)
        if (rh) writecb2RgbLed(eRgbLed.rh, color, on, blink)
        if (rv) writecb2RgbLed(eRgbLed.rv, color, on, blink)
    }


    //% group="LEDs (Calli:bot)"
    //% block="RGB LED %led %color %on || blinken %blink" weight=6
    //% on.shadow=toggleOnOff on.defl=1
    //% color.shadow="cb2_colorPicker"
    //% blink.shadow=toggleYesNo
    //% inlineInputMode=inline 
 export    function writecb2RgbLed(led: eRgbLed, color: number, on: boolean, blink = false) {
        if (!on || (blink && a_LEDs[led] == color))
            color = Colors.Off // alle Farben aus = 0

        if (a_LEDs[led] != color) { // I²C nur wenn Farbe geändert

            a_LEDs[led] = color

            let buffer = Buffer.create(5)
            buffer[0] = eRegister.SET_LED // 3
            if (on && color != Colors.Off) {
                buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
                buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
                buffer[3] = buffer[3] >>> 4
                buffer[4] = buffer[4] >>> 4
            } else
                buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // 4 Byte 0 0 0 0

            buffer[1] = led // Led-Index 1,2,3,4 für RGB

            let t = input.runningTime() - rgbLedPause
            if (t < 10)
                basic.pause(t) // ms
            rgbLedPause = input.runningTime()

            i2cWriteBuffer(buffer)
        }
    }

    let rgbLedPause = input.runningTime()  // ms seit Start

    //% group="LEDs (Calli:bot)"
    //% block="LED %led %on || blinken %blink Helligkeit %pwm" weight=2
    //% on.shadow="toggleOnOff"
    //% blink.shadow="toggleYesNo"
    //% pwm.min=1 pwm.max=16 pwm.defl=16
    //% inlineInputMode=inline 
    export function writecb2Led(pLed: eLed, on: boolean, blink = false, pwm?: number) {
        if (!on)
            pwm = 0 // LED aus schalten
        else if (!btf.between(pwm, 0, 16))
            pwm = 16 // bei ungültigen Werten max. Helligkeit

        if (pLed == eLed.redb) {
            writecb2Led(eLed.redl, on, blink, pwm) // 2 mal rekursiv aufrufen für beide rote LED
            writecb2Led(eLed.redr, on, blink, pwm)
        }
        else {
            // blinken und I²C nur wenn geändert
            if (blink && a_LEDs[pLed] == pwm)
                a_LEDs[pLed] = 0

            if (a_LEDs[pLed] != pwm) {
                a_LEDs[pLed] = pwm
                i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, pLed, a_LEDs[pLed]]))
            }
        }
    }



    // ========== I²C nur diese Datei Callibot

    export function i2cWriteBuffer(buffer: Buffer) { // repeat funktioniert nicht bei Callibot
        if (n_Callibot2_x22Connected) {
            n_Callibot2_x22Connected = pins.i2cWriteBuffer(eI2C.x22, buffer) == 0

            if (!n_Callibot2_x22Connected)
                btf.zeigeHexFehler(eI2C.x22)
        }
        return n_Callibot2_x22Connected
    }

    export function i2cReadBuffer(size: number): Buffer { // repeat funktioniert nicht bei Callibot
        if (n_Callibot2_x22Connected)
            return pins.i2cReadBuffer(eI2C.x22, size)
        else
            return Buffer.create(size)
    }



    // ========== Calli:bot ENUMs

    export enum eRegister {
        // Write
        RESET_OUTPUTS = 0x01, // Alle Ausgänge abschalten (Motor, LEDs, Servo)
        SET_MOTOR = 0x02, // Bit0: 1=Motor 1 setzen;  Bit1: 1=Motor 2 setzen
        /*
    Bit0: 1=Motor 1 setzen;  Bit1: 1=Motor 2 setzen
    wenn beide auf 11, dann Motor2 Daten nachfolgend senden (also 6 Bytes) Richtung (0:vorwärts, 1:rückwärts) von Motor 1 oder 2
    PWM (0..255) Motor 1 oder 2
    wenn in [1] Motor 1 & Motor 2 aktiviert
    Richtung (0:vorwärts, 1:rückwärts) von Motor 2
    PWM rechts (0..255) von Motor 2
        */
        SET_LED = 0x03, // Write: LED´s
        RESET_ENCODER = 0x05, // 2 Byte [0]=5 [1]= 1=links, 2=rechts, 3=beide
        // Read
        GET_INPUTS = 0x80, // Digitaleingänge (1 Byte 6 Bit)
        GET_INPUT_US = 0x81, // Ultraschallsensor (3 Byte 16 Bit)
        GET_FW_VERSION = 0x82, // Typ & Firmwareversion & Seriennummer (10 Byte)
        GET_POWER = 0x83, // Versorgungsspannung [ab CalliBot2E] (3 Byte 16 Bit)
        GET_LINE_SEN_VALUE = 0x84, // Spursensoren links / rechts Werte (5 Byte 2x16 Bit)
        GET_ENCODER_VALUE = 0x91 // 9 Byte links[1-4] rechts [5-8] 2* INT32BE mit Vorzeichen
    }

    export enum eLed {
        //% block="linke rote LED"
        redl = 5,
        //% block="rechte rote LED"
        redr = 6,
        //% block="beide rote LED"
        redb = 16,
        //% block="Spursucher LED links"
        spurl = 7,
        //% block="Spursucher LED rechts"
        spurr = 8,
        //% block="Power-ON LED"
        poweron = 0
    }

    export enum eRgbLed {
        //% block="links ↖ vorne"
        lv = 1,
        //% block="links ↙ hinten"
        lh = 2,
        //% block="rechts ↘ hinten"
        rh = 3,
        //% block="rechts ↗ vorne"
        rv = 4
    }

    export enum eINPUTS {
        //% block="Spursensor rechts hell"
        spr = 0b00000001,
        //% block="Spursensor links hell"
        spl = 0b00000010,
        //% block="Stoßstange rechts"
        str = 0b00000100,
        //% block="Stoßstange links"
        stl = 0b00001000,
        //% block="ON-Taster"
        ont = 0b00010000,
        //% block="OFF-Taster"
        off = 0b00100000,
        //% block="Calli:bot2 (0x21)"
        cb2 = 0b10000000
    }

} // c-callibot.ts
