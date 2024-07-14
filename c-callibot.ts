//% color=#00C040 icon="\uf188" block="Calli:bot 2" weight=92
namespace cb2 { // c-callibot.ts 005F7F



    // ========== I²C ==========
    //export enum eADDR {
    //    CB2_x22 = 0x22 //, WR_MOTOR_x20 = 0x20, WR_LED_x21 = 0x21, RD_SENSOR_x21
    //}
    export enum eI2C { x21 = 0x21, x22 = 0x22 }
    //const i2cCallibot2_x22 = 0x22
    //const i2cCallibot_x21 = 0x21

    let n_Callibot2_x22Connected = true // I²C Device ist angesteckt
    let n_Callibot2_x22hasEncoder = false // 2:CB2 3:CB2E 4:CB2A=Gymnasium

    // let n_c2MotorPower = true
    //  let qFernsteuerungStop: boolean = false

    export const c_MotorStop = 128
    // export const c_Servo_geradeaus = 90 = 16

    export let n_EncoderFaktor = 31.25 // Impulse = 31.25 * Fahrstrecke in cm
    // let n_MotorPWM_0_255 = 0

    //% group="calliope-net.github.io/fernsteuerung"
    //% block="beim Start: Calli:bot 2 || Funkgruppe anzeigen %zf %modellFunkgruppe" weight=8
    //% zf.shadow="toggleYesNo" zf.defl=1
    //% modellFunkgruppe.min=160 modellFunkgruppe.max=191
    // inlineInputMode=external
    export function beimStart(zf = true, modellFunkgruppe?: number) {

        writeReset() // Reset Motoren, LEDs

        btf.setStorageBuffer(modellFunkgruppe) // prüft und speichert in a_StorageBuffer

        if (zf)
            btf.zeigeFunkgruppe()

        btf.beimStartintern() // setzt auch n_start true, muss deshalb zuletzt stehen
    }


    // group="calliope-net.github.io/fernsteuerung"
    // block="Flash speichern" weight=7
    /* export function storageBufferGet() {
        return btf.storageBufferGet()
    } */

    // aktuelle Werte // I²C nur bei Änderung
    let n_x1_128_255: number
    let n_y1_16_31: number
    let n_m1_1_128_255: number
    let n_m2_1_128_255: number


    //% group="Motor"
    //% block="fahren (1 ↓ 128 ↑ 255) %x1_128_255 lenken (1 ↖ 16 ↗ 31) %y1_16_31 || (10\\%..90\\%) %prozent" weight=4
    //% x1_128_255.min=1 x1_128_255.max=255 x1_128_255.defl=128 
    //% y1_16_31.min=1 y1_16_31.max=31 y1_16_31.defl=16
    //% prozent.min=10 prozent.max=90 prozent.defl=50
    export function writeMotor128Servo16(x1_128_255: number, y1_16_31: number, prozent = 50) {
        n_m1_1_128_255 = undefined
        n_m2_1_128_255 = undefined // die anderen zwischengespeicherten Werte ungültig machen

        if (n_x1_128_255 != x1_128_255 || n_y1_16_31 != y1_16_31) {
            n_x1_128_255 = x1_128_255
            n_y1_16_31 = y1_16_31 // I²C nur bei Änderung

            let setMotorBuffer = Buffer.create(6)
            setMotorBuffer[0] = eRegister.SET_MOTOR   // 2
            setMotorBuffer[1] = 3 // ec2Motor.beide     // 3

            if ((x1_128_255 & 0x80) == 0x80) {  // 128..255 vorwärts
                setMotorBuffer[2] = 0
                setMotorBuffer[3] = x1_128_255 << 1 // linkes Bit weg=0..127 * 2 // 128=00, 129=02, 130=04, 254=FC, 255=FE
                setMotorBuffer[4] = 0
                setMotorBuffer[5] = setMotorBuffer[3]
            } else {                            // 0..127 rückwärts
                setMotorBuffer[2] = 1
                setMotorBuffer[3] = ~(x1_128_255 << 1) // * 2 und bitweise NOT // 0=FF, 1=FD, 126=03, 127=01,
                setMotorBuffer[4] = 1
                setMotorBuffer[5] = setMotorBuffer[3]
            }
            //   n_MotorPWM_0_255 = setMotorBuffer[3]

            // fahren (beide Motoren gleich)
            /*    if (radio.between(x1_128_255, 129, 255)) { // vorwärts
                   setMotorBuffer[2] = 0
                   setMotorBuffer[3] = radio.mapInt32(x1_128_255, 128, 255, 0, 255)
                   setMotorBuffer[4] = 0
                   setMotorBuffer[5] = setMotorBuffer[3]
               }
               else if (radio.between(x1_128_255, 1, 127)) { // rückwärts
                   setMotorBuffer[2] = 1
                   setMotorBuffer[3] = radio.mapInt32(x1_128_255, 1, 128, 255, 0)
                   setMotorBuffer[4] = 1
                   setMotorBuffer[5] = setMotorBuffer[3]
               }
               else { // wenn x fahren 0, 128 oder mehr als 8 Bit
                   setMotorBuffer[2] = 0 // Motor 1 Richtung 0:vorwärts, 1:rückwärts
                   setMotorBuffer[3] = 0 // Motor 1 PWM (0..255)
                   setMotorBuffer[4] = 0 // Motor 2 Richtung 0:vorwärts, 1:rückwärts
                   setMotorBuffer[5] = 0 // Motor 2 PWM (0..255)
               } */

            // lenken (ein Motor wird langsamer)
            if (btf.between(y1_16_31, 1, 15)) { // links
                setMotorBuffer[3] *= Math.map(y1_16_31, 0, 16, prozent / 100, 1) // 0=linkslenken50% // 16=nichtlenken=100%
            }
            else if (btf.between(y1_16_31, 17, 31)) { // rechts
                setMotorBuffer[5] *= Math.map(y1_16_31, 16, 32, 1, prozent / 100) // 16=nichtlenken=100% // 32=rechtslenken50%
            }
            //else { // wenn y lenken 0, 16 oder mehr als 5 Bit
            //}

            i2cWriteBuffer(setMotorBuffer)
        }
    }

    //% group="Motor"
    //% block="Motoren (1 ↓ 128 ↑ 255) links %m1_1_128_255 rechts %m2_1_128_255" weight=3
    //% m1_1_128_255.min=0 m1_1_128_255.max=255 m1_1_128_255.defl=0
    //% m2_1_128_255.min=0 m2_1_128_255.max=255 m2_1_128_255.defl=0
    export function writeMotoren128(m1_1_128_255: number, m2_1_128_255: number) {
        n_x1_128_255 = undefined
        n_y1_16_31 = undefined // die anderen zwischengespeicherten Werte ungültig machen

        if (n_m1_1_128_255 != m1_1_128_255 || n_m2_1_128_255 != m2_1_128_255) {
            n_m1_1_128_255 = m1_1_128_255
            n_m2_1_128_255 = m2_1_128_255 // I²C nur bei Änderung

            let m1 = btf.between(m1_1_128_255, 1, 255)
            let m2 = btf.between(m2_1_128_255, 1, 255)
            // if (m1 || m2) {
            let setMotorBuffer: Buffer
            let offset = 0
            if (m1 && m2) {
                setMotorBuffer = Buffer.create(6)
                setMotorBuffer[offset++] = eRegister.SET_MOTOR
                setMotorBuffer[offset++] = 3
            } else if (m1) {
                setMotorBuffer = Buffer.create(4)
                setMotorBuffer[offset++] = eRegister.SET_MOTOR
                setMotorBuffer[offset++] = 1
            } else if (m2) {
                setMotorBuffer = Buffer.create(4)
                setMotorBuffer[offset++] = eRegister.SET_MOTOR
                setMotorBuffer[offset++] = 2
            }

            // M1 offset 2:Richtung, 3:PWM
            if (m1 && (m1_1_128_255 & 0x80) == 0x80) { //     if (m1 && btf.between(m1_1_128_255, 128, 255)) { // M1 vorwärts
                setMotorBuffer[offset++] = 0
                setMotorBuffer[offset++] = m1_1_128_255 << 1// btf.mapInt32(m1_1_128_255, 128, 255, 0, 255)
            } else if (m1) { // 1..127 M1 rückwärts
                setMotorBuffer[offset++] = 1
                setMotorBuffer[offset++] = ~(m1_1_128_255 << 1) // btf.mapInt32(m1_1_128_255, 1, 128, 255, 0)
            }

            // M2 wenn !m1 offset 2:Richtung, 3:PWM sonst offset 4:Richtung, 5:PWM
            if (m2 && (m2_1_128_255 & 0x80) == 0x80) { //    if (m2 && btf.between(m2_1_128_255, 128, 255)) { // M2 vorwärts
                setMotorBuffer[offset++] = 0
                setMotorBuffer[offset++] = m2_1_128_255 << 1// btf.mapInt32(m2_1_128_255, 128, 255, 0, 255)
            } else if (m2) { // 1..127 M2 rückwärts
                setMotorBuffer[offset++] = 1
                setMotorBuffer[offset++] = ~(m2_1_128_255 << 1) // btf.mapInt32(m2_1_128_255, 1, 128, 255, 0)
            }

            if (setMotorBuffer)
                i2cWriteBuffer(setMotorBuffer)
        }
    }


    //% group="Motor"
    //% block="Motoren Stop" weight=1
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


    // ========== group="LED"

    let a_LEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken


    //% blockId=cb2_colorPicker block="%value"
    //% blockHidden=true
    //% shim=TD_ID
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.fieldOptions.colours='["#000000","#0000ff","#00ff00","#00ffdc","#ff0000","#a300ff","#ffff00","#ffffff"]'
    //% value.fieldOptions.columns=4 value.fieldOptions.className='rgbColorPicker'  
    export function cb2_colorPicker(value: number) { return value }


    //% group="LED"
    //% block="RGB LED %color || ↖ %lv ↙ %lh ↘ %rh ↗ %rv blinken %blink" weight=7
    //% color.shadow="cb2_colorPicker"
    //% lv.shadow="toggleYesNo" lh.shadow="toggleYesNo" rh.shadow="toggleYesNo" rv.shadow="toggleYesNo"
    //% blink.shadow="toggleYesNo"
    //% inlineInputMode=inline expandableArgumentMode="toggle"
    export function writeRgbLed(color: number, lv = true, lh = true, rh = true, rv = true, blink = false) {
        //basic.showString(lv.toString())
        let buffer = Buffer.create(5)
        buffer[0] = eRegister.SET_LED
        buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
        buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
        buffer[3] = buffer[3] >>> 4
        buffer[4] = buffer[4] >>> 4

        if (lv) writeRgbLedBlink(eRgbLed.lv, buffer, blink)
        if (lh) writeRgbLedBlink(eRgbLed.lh, buffer, blink)
        if (rh) writeRgbLedBlink(eRgbLed.rh, buffer, blink)
        if (rv) writeRgbLedBlink(eRgbLed.rv, buffer, blink)
    }

    // blinken und I²C nur wenn geändert
    function writeRgbLedBlink(pRgbLed: eRgbLed, buffer: Buffer, blink: boolean) {
        if (blink && a_LEDs[pRgbLed] == buffer.getNumber(NumberFormat.UInt32BE, 1))
            buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // alle Farben aus

        if (a_LEDs[pRgbLed] != buffer.getNumber(NumberFormat.UInt32BE, 1)) {

            a_LEDs[pRgbLed] = buffer.getNumber(NumberFormat.UInt32BE, 1)

            buffer[1] = pRgbLed // Led-Index 1,2,3,4 für RGB
            i2cWriteBuffer(buffer)
            basic.pause(10) // ms
        }
    }


    //% group="LED"
    //% block="LED %led %onoff || blinken %blink Helligkeit %pwm" weight=2
    //% onoff.shadow="toggleOnOff"
    //% blink.shadow="toggleYesNo"
    //% pwm.min=1 pwm.max=16 pwm.defl=16
    //% inlineInputMode=inline 
    export function writeLed(pLed: eLed, on: boolean, blink = false, pwm?: number) {
        if (!on)
            pwm = 0 // LED aus schalten
        else if (!btf.between(pwm, 0, 16))
            pwm = 16 // bei ungültigen Werten max. Helligkeit

        if (pLed == eLed.redb) {
            writeLed(eLed.redl, on, blink, pwm) // 2 mal rekursiv aufrufen für beide rote LED
            writeLed(eLed.redr, on, blink, pwm)
        }
        else {
            // blinken und I²C nur wenn geändert
            if (blink && a_LEDs[pLed] == pwm)
                a_LEDs[pLed] = 0
            // i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, pLed, pwm]))
            // a_LEDs[pLed] = pwm

            if (a_LEDs[pLed] != pwm) {
                a_LEDs[pLed] = pwm
                i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, pLed, a_LEDs[pLed]]))
            }
        }
    }




    // ========== group="Reset"

    //% group="Reset"
    //% block="Reset Motoren, LEDs" weight=4
    export function writeReset() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
        // n_c2MotorPower = false
    }




    // ========== group="Sensoren" subcategory="Sensoren"



    // interner Speicher für Sensoren
    let n_Inputs: number



    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Digitaleingänge einlesen || I²C %i2c" weight=8
    //% i2c.defl=cb2.eI2C.x22
    export function readInputs(i2c = eI2C.x22) {
        if (i2c == eI2C.x21)
            n_Inputs = pins.i2cReadBuffer(eI2C.x21, 1)[0]
        else {
            i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUTS]))
            n_Inputs = i2cReadBuffer(1)[0]
        }
        return n_Inputs
    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="%n %e || I²C %i2c" weight=7
    export function getInputs(n: btf.eNOT, e: cb2.eINPUTS, i2c?: eI2C): boolean {
        if (i2c != undefined)
            readInputs(i2c)
        if (n == btf.eNOT.t)
            return (n_Inputs & e) == e
        else
            return (n_Inputs & e) == 0
    }

    export enum eDH { dunkel = 0, hell = 1 }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Spursensor links %l und rechts %r || I²C %i2c" weight=5
    export function readSpursensor(l: eDH, r: eDH, i2c?: eI2C) {
        if (i2c != undefined)
            readInputs(i2c)
        return (n_Inputs & 0x03) == (l << 1 | r)
        // return (n_Inputs & 0x03) == (l * 2 + r)
    }


    //  export enum eDist { cm, mm }

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="Abstand cm" weight=4
    export function readUltraschallAbstand() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]))
        return i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1) / 10 // 16 Bit (mm)
    }




    //% group="Encoder (Call:bot 2E)" subcategory="Sensoren"
    //% block="Encoder Test und Zähler löschen" weight=2
    export function writeEncoderReset() {
        n_Callibot2_x22hasEncoder = readVersionArray().get(1) == 3 // 2:CB2 3:CB2E 4:CB2A=Gymnasium
        if (n_Callibot2_x22hasEncoder)
            i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, 3])) // 3:beide
        // return pins.i2cWriteBuffer(eI2C.x22, Buffer.fromArray([eRegister.RESET_ENCODER, 3])) 
        return n_Callibot2_x22hasEncoder
    }

    //% group="Encoder (Call:bot 2E)" subcategory="Sensoren"
    //% block="Encoder Werte [l,r]" weight=1
    export function readEncoderValues() {
        if (n_Callibot2_x22hasEncoder) {
            i2cWriteBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]))
            return i2cReadBuffer(9).slice(1, 8).toArray(NumberFormat.Int32LE) // 32 Bit mit Vorzeichen
            // return pins.i2cWriteBuffer(eI2C.x22, Buffer.fromArray([eRegister.GET_ENCODER_VALUE]))
        } else
            return [0, 0]
    }

    export function getEncoderMittelwert() {
        let encoderValues = readEncoderValues()
        return Math.idiv(Math.abs(encoderValues[0]) + Math.abs(encoderValues[1]), 2)
    }



    //% group="Calli:bot Version" subcategory="Sensoren"
    //% block="Call:bot Typ & FW & SN Array[10]" weight=3
    export function readVersionArray() { // [1]=4:CB2(Gymnasium) =3:CB2E (=2:soll CB2 sein)
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]))
        return i2cReadBuffer(10).toArray(NumberFormat.UInt8LE)
    }

    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="fahre Motor (1 ↓ 128 ↑ 255) %motor Servo (1 ↖ 16 ↗ 31) %servo %zehntelsekunden" weight=4
    //% motor.shadow=btf_speedPicker
    //% servo.shadow=btf_protractorPicker
    //% zehntelsekunden.shadow=cb2_zehntelsekunden
    export function fahreZeit(motor: number, servo: number, zehntelsekunden: number) {
        cb2.writeMotor128Servo16(motor, servo)
        basic.pause(zehntelsekunden * 100)
        cb2.writeMotor128Servo16(c_MotorStop, 16)
    }


    //% group="Programmieren" subcategory="Fahrstrecke"
    //% block="fahre Motor (1 ↓ 128 ↑ 255) %motor Servo (1 ↖ 16 ↗ 31) %servo Strecke (cm) %strecke" weight=3
    // motor.min=0 motor.max=255 motor.defl=128
    //% motor.shadow=btf_speedPicker
    // servo.min=1 servo.max=31 servo.defl=16
    //% servo.shadow=btf_protractorPicker
    //% strecke.min=0 strecke.max=255 strecke.defl=20
    //% inlineInputMode=inline
    export function fahreStrecke(motor: number, servo: number, strecke: number) { // cm oder zehntelsekunden

        cb2.writeMotor128Servo16(c_MotorStop, servo)

        let hasEncoder = cb2.writeEncoderReset() // Testet ob Encoder vorhanden, Ergebnis in n_Callibot2_x22hasEncoder

        cb2.writeMotor128Servo16(motor, servo)

        if (hasEncoder) {

            while (cb2.getEncoderMittelwert() < strecke * cb2.n_EncoderFaktor) { // 31.25
                // Pause eventuell bei hoher Geschwindigkeit motor verringern
                // oder langsamer fahren wenn Rest strecke kleiner wird
                basic.pause(100) // 200
            }
        }
        else {
            basic.pause(strecke * 100)

            //let i = Math.abs(Math.round(Math.map(motor, 1, 255, -9, 9)))
            //let a = [160, 160, 91, 73, 63, 59, 56, 53, 52, 51] // Fahrzeit ms für 1cm bei 10%, 20% .. 100%
            //if (a10)
            //    a = a10

            //basic.showNumber(i)
            //basic.pause(strecke * a[i])
        }

        cb2.writeMotor128Servo16(c_MotorStop, 16)

    }




    // ========== I²C nur diese Datei Callibot

    export function i2cWriteBuffer(bu: Buffer) { // repeat funktioniert nicht bei Callibot
        if (n_Callibot2_x22Connected) {
            n_Callibot2_x22Connected = pins.i2cWriteBuffer(eI2C.x22, bu) == 0

            if (!n_Callibot2_x22Connected)
                btf.zeigeHex(eI2C.x22)
        }
        return n_Callibot2_x22Connected
    }

    export function i2cReadBuffer(size: number): Buffer { // repeat funktioniert nicht bei Callibot
        if (n_Callibot2_x22Connected)
            return pins.i2cReadBuffer(eI2C.x22, size)
        else
            return Buffer.create(size)
    }



    enum eRegister {
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

    enum eRgbLed {
        //% block="alle (4)"
        alle = 0,
        //% block="links vorne"
        lv = 1,
        //% block="links hinten"
        lh = 2,
        //% block="rechts hinten"
        rh = 3,
        //% block="rechts vorne"
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
        //reserviert = 0b01000000,
        //% block="Calli:bot2 (0x21)"
        cb2 = 0b10000000
    }
    // block="Spursensor beide hell"
    // spb = 0b00000011,


} // c-callibot.ts
