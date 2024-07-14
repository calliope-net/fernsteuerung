//% color=#007F00 icon="\uf188" block="Calli²bot" weight=92
//% groups='["beim Start","Motor (-100% .. 0 .. +100%)","LED","Reset","Kommentar"]'
namespace r_callibot { // r_callibot.ts
    /*
    // color=#008272 icon="\uf012" block="Empfänger" weight=94
    
    
    
                private readonly qSimulator: boolean = ("€".charCodeAt(0) == 8364)
                private readonly i2cADDR: eADDR
                private readonly i2cCheck: boolean // i2c-Check
                private i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)
                private readonly qLogEnabled: boolean
                private qLog: string[] // Array muss bei Verwendung initialisiert werden
                private qLEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken
        
                private qStopandGoMotoran: boolean = false // für seite4StopandGo()
                private qFernsteuerungPower: boolean = false // für Fernsteuerung
                private qFernsteuerungStop: boolean = false   // für Fernsteuerung
                // interner Speicher für Sensoren
                private input_Digital: number
                private input_Ultraschallsensor: number
                private input_Spursensoren: number[]
        
    */
    let i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)
    let qLogEnabled: boolean
    let qLog: string[] // Array muss bei Verwendung initialisiert werden
    let qLEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken
    let qFernsteuerungPower: boolean = false // für Fernsteuerung
    let qFernsteuerungStop: boolean = false   // für Fernsteuerung

    // interner Speicher für Sensoren
    let input_Digital: number
    let input_Ultraschallsensor: number
    let input_Spursensoren: number[]


    // ========== group="Motor (-100% .. 0 .. +100%)"

    //% group="Motor (-100% .. 0 .. +100%)"
    //% block="Motoren links mit %pwm1 \\% rechts mit %pwm2 \\%" weight=8
    //% pwm1.shadow="speedPicker" pwm1.defl=0
    //% pwm2.shadow="speedPicker" pwm2.defl=0
    export function setMotoren2(pwm1: number, pwm2: number) {
        if (qLogEnabled) qLog = [pwm1 + " " + pwm2, ""] // init Array 2 Elemente
        let pRichtung1 = (pwm1 < 0 ? eDirection.r : eDirection.v)
        let pRichtung2 = (pwm2 < 0 ? eDirection.r : eDirection.v)
        pwm1 = Math.trunc(Math.abs(pwm1) * 255 / 100)
        pwm2 = Math.trunc(Math.abs(pwm2) * 255 / 100)

        if (qLogEnabled) qLog[1] = pwm1 + " " + pwm2

        setMotoren(pwm1, pRichtung1, pwm2, pRichtung2)

    }

    //% group="Motor (-100% .. 0 .. +100%)"
    //% block="Motor %pMotor mit %pwm \\%" weight=7
    //% pwm.shadow="speedPicker" pwm.defl=0
    export function setMotor(pMotor: eMotor, pwm: number) {
        let pRichtung = (pwm < 0 ? eDirection.r : eDirection.v)
        pwm = Math.trunc(Math.abs(pwm) * 255 / 100)

        if (!btf.between(pwm, 0, 255)) { // falscher Parameter -> beide Stop
            pMotor = eMotor.beide
            pwm = 0
        }

        if (pMotor == eMotor.beide)
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, pRichtung, pwm, pRichtung, pwm]))
        else
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, pRichtung, pwm]))
    }




    // ========== group="LED"



    //% group="LED"
    //% block="RGB LED %color || ↖ %lv ↙ %lh ↘ %rh ↗ %rv blinken %blink" weight=7
    //% color.shadow="callibot_colorPicker"
    //% lv.shadow="toggleYesNo" lh.shadow="toggleYesNo" rh.shadow="toggleYesNo" rv.shadow="toggleYesNo"
    //% blink.shadow="toggleYesNo"
    //% inlineInputMode=inline expandableArgumentMode="toggle"
    export function setRgbLed3(color: number, lv = true, lh = true, rh = true, rv = true, blink = false) {
        //basic.showString(lv.toString())
        let buffer = Buffer.create(5)
        buffer[0] = eRegister.SET_LED
        buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
        buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
        buffer[3] = buffer[3] >>> 4
        buffer[4] = buffer[4] >>> 4

        if (lv) setRgbLed31(eRgbLed.LV, buffer, blink)
        if (lh) setRgbLed31(eRgbLed.LH, buffer, blink)
        if (rh) setRgbLed31(eRgbLed.RH, buffer, blink)
        if (rv) setRgbLed31(eRgbLed.RV, buffer, blink)
    }

    // blinken
    function setRgbLed31(pRgbLed: eRgbLed, buffer: Buffer, blink: boolean) {
        if (blink && qLEDs[pRgbLed] == buffer.getNumber(NumberFormat.UInt32BE, 1))
            buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // alle Farben aus
        qLEDs[pRgbLed] = buffer.getNumber(NumberFormat.UInt32BE, 1)
        buffer[1] = pRgbLed // Led-Index 1,2,3,4 für RGB
        i2cWriteBuffer(buffer)
        basic.pause(10) // ms
    }


    //% group="LED"
    //% block="LED %led %onoff || blinken %blink Helligkeit %pwm" weight=2
    //% onoff.shadow="toggleOnOff"
    //% blink.shadow="toggleYesNo"
    //% pwm.min=1 pwm.max=16 pwm.defl=16
    //% inlineInputMode=inline 
    export function setLed1(pLed: eLed, on: boolean, blink = false, pwm?: number) {
        if (!on)
            pwm = 0 // LED aus schalten
        else if (!btf.between(pwm, 0, 16))
            pwm = 16 // bei ungültigen Werten max. Helligkeit

        if (pLed == eLed.redb) {
            setLed1(eLed.redl, on, blink, pwm) // 2 mal rekursiv aufrufen für beide rote LED
            setLed1(eLed.redr, on, blink, pwm)
        }
        else {
            if (blink && qLEDs.get(pLed) == pwm)
                pwm = 0
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, pLed, pwm]))
            qLEDs.set(pLed, pwm)
        }
    }




    // ========== group="Reset"

    //% group="Reset"
    //% block="alles aus Motor, LEDs, Servo"
    export function i2cRESET_OUTPUTS() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
        qFernsteuerungPower = false
    }




    // ========== subcategory="Sensoren"

    // ========== group="INPUT digital" subcategory="Sensoren"

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="neu einlesen Digitaleingänge || %i2" weight=8
    //% i2.defl=0
    export function i2cReadINPUTS(i2 = 0) {
        switch (i2) {
            case 0:
                i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUTS]))
                input_Digital = i2cReadBuffer(1).getUint8(0)
            case 1:
                input_Digital = i2cReadBuffer(1).getUint8(0)
            case 2:
                input_Digital = pins.i2cReadBuffer(0x22, 1).getUint8(0)
            case 3:
                input_Digital = pins.i2cReadBuffer(0x21, 1).getUint8(0)
        }
    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Liniensensor %sensor %status" weight=7
    export function readLineSensor(sensor: eSensor, status: eSensorStatus): boolean {
        switch (sensor) {
            case eSensor.rechts:
                switch (status) {
                    case eSensorStatus.hell: return (input_Digital & 0b00000001) != 0
                    case eSensorStatus.dunkel: return (input_Digital & 0b00000001) == 0
                }
            case eSensor.links:
                switch (status) {
                    case eSensorStatus.hell: return (input_Digital & 0b00000010) != 0
                    case eSensorStatus.dunkel: return (input_Digital & 0b000000010) == 0
                }
            default:
                return false
        }


    }


    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Stoßstange %sensor %status" weight=6
    export function readBumperSensor(sensor: eSensor, status: eState): boolean {
        switch (sensor) {
            case eSensor.rechts:
                switch (status) {
                    case eState.an: return (input_Digital & 0b00000100) != 0
                    case eState.aus: return (input_Digital & 0b00000100) == 0
                }
            case eSensor.links:
                switch (status) {
                    case eState.an: return (input_Digital & 0b00001000) != 0
                    case eState.aus: return (input_Digital & 0b000001000) == 0
                }
            default:
                return false
        }

    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="%taste" weight=5
    export function switchOn(taste: eTaster): boolean {
        switch (taste) {
            case eTaster.ont: return (input_Digital & 0b00010000) == 0b00010000
            case eTaster.offt: return (input_Digital & 0b00100000) == 0b00100000
            default: return false
        }


    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="%pINPUTS" weight=3 deprecated=true
    export function bitINPUTS(pINPUTS: eINPUTS): boolean {
        switch (pINPUTS) {
            case eINPUTS.sp0: return (input_Digital & 0b00000011) == 0
            case eINPUTS.sp1r: return (input_Digital & 0b00000011) == 1
            case eINPUTS.sp2l: return (input_Digital & 0b00000011) == 2
            case eINPUTS.sp3b: return (input_Digital & 0b00000011) == 3
            case eINPUTS.sp4e: return bitINPUTS(eINPUTS.sp1r) || bitINPUTS(eINPUTS.sp2l) || bitINPUTS(eINPUTS.sp3b)
            case eINPUTS.st0: return (input_Digital & 0b00001100) == 0b00000000
            case eINPUTS.st1r: return (input_Digital & 0b00001100) == 0b00000100
            case eINPUTS.st2l: return (input_Digital & 0b00001100) == 0b00001000
            case eINPUTS.st3b: return (input_Digital & 0b00001100) == 0b00001100
            case eINPUTS.st4e: return bitINPUTS(eINPUTS.st1r) || bitINPUTS(eINPUTS.st2l) || bitINPUTS(eINPUTS.st3b)
            case eINPUTS.ont: return (input_Digital & 0b00010000) == 0b00010000
            case eINPUTS.off: return (input_Digital & 0b00100000) == 0b00100000
            default: return false
        }
    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Digitaleingänge 6 Bit" weight=2
    export function getINPUTS() { return input_Digital }





    // ========== group="INPUT Ultraschallsensor" subcategory="Sensoren"

    //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
    //% block="neu einlesen Ultraschallsensor" weight=3
    export function i2cReadINPUT_US() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]))
        input_Ultraschallsensor = i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1)
    }

    //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
    //% block="Entfernung %pVergleich %cm cm" weight=2
    //% cm.min=1 cm.max=50 cm.defl=15
    export function bitINPUT_US(pVergleich: eVergleich, cm: number) {
        switch (pVergleich) {
            case eVergleich.gt: return input_Ultraschallsensor / 10 > cm
            case eVergleich.lt: return input_Ultraschallsensor / 10 < cm
            default: return false
        }
    }

    //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
    //% block="Ultraschallsensor 16 Bit (mm)" weight=1
    export function getINPUT_US() { return input_Ultraschallsensor }



    // ========== group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"

    // ========== group="INPUT Spursensoren 2*16 Bit [r,l]"

    //% group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"
    //% block="neu einlesen Spursensoren" weight=6
    export function i2cReadLINE_SEN_VALUE() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_LINE_SEN_VALUE]))
        input_Spursensoren = i2cReadBuffer(5).slice(1, 4).toArray(NumberFormat.UInt16LE)
    }

    //% group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"
    //% block="Spursensor %pRL %pVergleich %vergleich" weight=2
    //% inlineInputMode=inline
    export function bitLINE_SEN_VALUE(pRL: eRL, pVergleich: eVergleich, vergleich: number) {
        let sensor = input_Spursensoren.get(pRL)
        switch (pVergleich) {
            case eVergleich.gt: return sensor > vergleich
            case eVergleich.lt: return sensor < vergleich
            default: return false
        }
    }

    //% group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"
    //% block="Spursensor %pRL" weight=1
    export function getLINE_SEN_VALUE(pRL: eRL) { return input_Spursensoren.get(pRL) }




    // ========== advanced=true


    // ========== group="Encoder 2*32 Bit [l,r]" advanced=true

    //% group="Encoder 2*32 Bit [l,r]" advanced=true
    //% block="Encoder Zähler löschen %encoder"
    //% encoder.defl=calli2bot.eMotor.beide
    export function resetEncoder(encoder: eMotor) {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, encoder]))
    }

    //% group="Encoder 2*32 Bit [l,r]" advanced=true
    //% block="Encoder Werte lesen"
    export function encoderValue(): number[] {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]))
        return i2cReadBuffer(9).slice(1, 8).toArray(NumberFormat.Int32LE)
    }


    // ========== group="i2c Register lesen" advanced=true

    //% group="i2c Register lesen" advanced=true
    //% block="%Calli2bot Version %pVersion HEX" weight=6
    export function i2cReadFW_VERSION(pVersion: eVersion) {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]))
        switch (pVersion) {
            case eVersion.Typ: { return i2cReadBuffer(2).slice(1, 1).toHex() }
            case eVersion.Firmware: { return i2cReadBuffer(6).slice(2, 4).toHex() }
            case eVersion.Seriennummer: { return i2cReadBuffer(10).slice(6, 4).toHex() }
            default: { return i2cReadBuffer(10).toHex() }
        }
    }

    //% group="i2c Register lesen" advanced=true
    //% block="%Calli2bot Versorgungsspannung mV" weight=4
    export function i2cReadPOWER(): number {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_POWER]))
        return i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1)
    }

    //% group="i2c Register lesen" advanced=true
    //% block="%Calli2bot readRegister %pRegister size %size" weight=2
    //% pRegister.defl=calli2bot.eRegister.GET_INPUTS
    //% size.min=1 size.max=10 size.defl=1
    export function i2cReadRegister(pRegister: eRegister, size: number): Buffer {
        i2cWriteBuffer(Buffer.fromArray([pRegister]))
        return i2cReadBuffer(size)
    }


    // ========== group="i2c Register schreiben"

    //% group="i2c Register schreiben" advanced=true
    //% block="%Calli2bot writeRegister %pRegister Bytes %bytes" weight=1
    export function i2cWriteRegister(pRegister: eRegister, bytes: number[]) {
        bytes.insertAt(0, pRegister)
        i2cWriteBuffer(Buffer.fromArray(bytes))
    }


    // ========== group="i2c Fehlercode"

    //% group="i2c Fehlercode" advanced=true
    //% block="%Calli2bot i2c Fehlercode" weight=1
    export function geti2cError() { return i2cError }




    // ==========  subcategory="Fernsteuerung"

    // ========== group="Motor (0 .. 255)" subcategory="Fernsteuerung"

    //% group="Motor (0 .. 255)" subcategory="Fernsteuerung"
    //% block="Motoren links %pPWM1 (0-255) %pRichtung1 rechts %pPWM2 %pRichtung2" weight=2
    //% pwm1.min=0 pwm1.max=255 pwm1.defl=128 pwm2.min=0 pwm2.max=255 pwm2.defl=128
    //% inlineInputMode=inline
    export function setMotoren(pwm1: number, pRichtung1: eDirection, pwm2: number, pRichtung2: eDirection) {
        if (btf.between(pwm1, 0, 255) && btf.between(pwm2, 0, 255))
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, pRichtung1, pwm1, pRichtung2, pwm2]))
        else // falscher Parameter -> beide Stop
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, 0, 0, 0, 0]))
    }


    // ========== group="Fernsteuerung Motor (0 .. 128 .. 255) fahren und lenken"

    //% group="Fernsteuerung (0 .. 128 .. 255) fahren und lenken" subcategory="Fernsteuerung"
    //% block="fahre mit Joystick receivedNumber: %pUInt32LE || blinken %blink Stoßstange %stStange Entfernung %cm cm" weight=6
    //% blink.shadow="toggleYesNo" blink.defl=1
    //% stStange.shadow="toggleYesNo"
    //% cm.min=1 cm.max=50
    //% inlineInputMode=inline
    export function fahreJoystick(pUInt32LE: number, blink = true, stStange = false, cm?: number) {
        let blinkColor = 0x0000FF
        let joyBuffer32 = Buffer.create(4)
        joyBuffer32.setNumber(NumberFormat.UInt32LE, 0, pUInt32LE)

        // Buffer[0] Register 3: Horizontal MSB 8 Bit (0 .. 128 .. 255)
        let joyHorizontal = joyBuffer32.getUint8(0)
        if (0x7C < joyHorizontal && joyHorizontal < 0x83) joyHorizontal = 0x80 // off at the outputs

        // Buffer[1] Register 5: Vertical MSB 8 Bit (0 .. 128 .. 255)
        let joyVertical = joyBuffer32.getUint8(1)
        if (0x7C < joyVertical && joyVertical < 0x83) joyVertical = 0x80 // off at the outputs

        // Buffer[2] 
        let joyProzent = joyBuffer32.getUint8(2) // (0 .. 100)

        // Buffer[3] Register 8: Button STATUS (1:war gedrückt)
        //let joyButton = joyBuffer32.getUint8(3) == 0 ? false : true
        // Motor Power ON ...
        if (joyBuffer32.getUint8(3) == 1)
            qFernsteuerungPower = true // Motor Power ON
        else if (qFernsteuerungPower)
            i2cRESET_OUTPUTS() // motorPower = false

        // fahren
        let fahren_minus255_0_255: number //= change(joyHorizontal) // (0.. 128.. 255) -> (-255 .. 0 .. +255)
        let signed_128_0_127 = sign(joyHorizontal)
        if (signed_128_0_127 < 0)
            fahren_minus255_0_255 = 2 * (128 + signed_128_0_127) // (u) 128 .. 255 -> (s) -128 .. -1  ->   0 .. 127
        else
            fahren_minus255_0_255 = -2 * (127 - signed_128_0_127) // (u)   0 .. 127 -> (s)    0 .. 127 -> 127 ..   0

        // minus ist rückwärts
        let fahren_Richtung: eDirection = (fahren_minus255_0_255 < 0 ? eDirection.r : eDirection.v)

        let fahren_0_255 = Math.abs(fahren_minus255_0_255)

        if (fahren_Richtung == eDirection.r) {
            qFernsteuerungStop = false
        }
        // wenn Stoßstange r oder l, dann nicht vorwärts fahren
        else if (fahren_Richtung == eDirection.v && stStange) {
            if (!qFernsteuerungStop) i2cReadINPUTS() // i2c Sensoren nur lesen, wenn nicht Stop
            if (bitINPUTS(eINPUTS.st4e)) {
                qFernsteuerungStop = true
                fahren_0_255 = 0
                blinkColor = 0xFFFF00
            }
        }

        // wenn Entfernung angegeben und kleiner, dann nicht vorwärts fahren
        else if (fahren_Richtung == eDirection.v && cm != undefined) {
            if (!qFernsteuerungStop) i2cReadINPUT_US() // i2c Sensoren nur lesen, wenn nicht Stop
            if (bitINPUT_US(eVergleich.lt, cm)) {
                qFernsteuerungStop = true
                fahren_0_255 = 0
                blinkColor = 0xFF00FF
            }
        }


        // max Geschwindigkeit wenn Buffer[2] (10 .. 100)
        if (btf.between(joyProzent, 1, 8)) {
            fahren_0_255 *= (joyProzent + 1) / 10 // (0,2 .. 0,9)
        }

        let fahren_links = fahren_0_255
        let fahren_rechts = fahren_0_255

        // max Geschwindigkeit wenn Buffer[2] (10 .. 100)
        //if (between(joyProzent, 10, 100)) {
        //    fahren_links *= joyProzent / 100 // (0,1 .. 1,0)
        //    fahren_rechts *= joyProzent / 100 // (0,1 .. 1,0)
        //}

        // lenken
        let lenken_255_0_255 = sign(joyVertical)
        let lenken_100_50 = Math.round(Math.map(Math.abs(lenken_255_0_255), 0, 128, 50, 100))

        // lenken Richtung
        if (lenken_255_0_255 < 0) // minus ist rechts
            fahren_rechts = Math.round(fahren_rechts * lenken_100_50 / 100)
        else
            fahren_links = Math.round(fahren_links * lenken_100_50 / 100)

        if (qFernsteuerungPower)
            setMotoren(fahren_links, fahren_Richtung, fahren_rechts, fahren_Richtung)

        if (blink) {
            setRgbLed3(blinkColor, true, true, true, true, true)
        }

        if (qLogEnabled) {
            qLog = ["", ""] // init Array 2 Elemente
            qLog[0] = format4r(joyHorizontal)
                + format4r(fahren_minus255_0_255)
                + format4r(fahren_links)
                + format4r(fahren_rechts)
            qLog[1] = format4r(joyVertical)
                + format4r(lenken_255_0_255)
                + format4r(lenken_100_50)
                + " " + fahren_Richtung.toString().substr(0, 1)
                + " " + qFernsteuerungPower.toString().substr(0, 1)
            //+ " " + format(fahren_Richtung, 1)
            //+ " " + format(motorPower, 1)
        }

    }


    //% group="Protokoll lesen" subcategory="Fernsteuerung"
    //% block="Log (Array)" weight=3
    export function getLog(): string[] { return qLog }


    //% group="Protokoll lesen" subcategory="Fernsteuerung"
    //% block="Log Zeile %index" weight=2
    //% index.min=0 index.max=1
    export function getLog2(index: number): string {
        if (qLog != undefined && index < qLog.length && index >= 0)
            return qLog.get(index)
        else
            return index.toString()
    }






    function i2cWriteBuffer(buf: Buffer) { // repeat funktioniert nicht
        pins.i2cWriteBuffer(eADDR.CB2_x22, buf)
        /* 
                if (i2cError == 0) { // vorher kein Fehler
                    i2cError = pins.i2cWriteBuffer(i2cADDR, buf)
                    // NaN im Simulator
                    if (i2cCheck && i2cError != 0)  // vorher kein Fehler, wenn (n_i2cCheck=true): beim 1. Fehler anzeigen
                        basic.showString(Buffer.fromArray([i2cADDR]).toHex()) // zeige fehlerhafte i2c-Adresse als HEX
                } else if (!i2cCheck)  // vorher Fehler, aber ignorieren (n_i2cCheck=false): i2c weiter versuchen
                    i2cError = pins.i2cWriteBuffer(i2cADDR, buf)
         */
    }

    function i2cReadBuffer(size: number): Buffer { // repeat funktioniert nicht
        return pins.i2cReadBuffer(eADDR.CB2_x22, size)
        /* 
                if (!i2cCheck || i2cError == 0)
                    return pins.i2cReadBuffer(i2cADDR, size)
                else
                    return Buffer.create(size)
         */
    }


    // ========== private

    //export function between(i0: number, i1: number, i2: number): boolean { return (i0 >= i1 && i0 <= i2) }

    export function sign(i: number, e: number = 7): number {
        if (i < 2 ** e) return i
        else return -((~i & ((2 ** e) - 1)) + 1)
    }
    export function format4r(pValue: any) {
        let pText = convertToText(pValue)
        return "    ".substr(0, 4 - pText.length) + pText
    }

} // r_callibot.ts
