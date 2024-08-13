
namespace cb2 { // c-sensoren.ts



    // ========== group="INPUT digital" subcategory="Sensoren"

    // interner Speicher für digitale Sensoren (eRegister.GET_INPUTS)
    let n_Inputs = Buffer.create(1)

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Digitaleingänge einlesen || I²C %i2c" weight=8
    //% i2c.defl=cb2.eI2C.x22
    export function readInputs(i2c = eI2C.x22) {
        if (i2c == eI2C.x21)
            n_Inputs = pins.i2cReadBuffer(eI2C.x21, 1)
        else {
            i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUTS]))
            n_Inputs = i2cReadBuffer(1)
        }
        return n_Inputs
    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="%e einlesen %read || I²C %i2c" weight=7
    //% read.shadow="toggleYesNo"
    //% inlineInputMode=inline
    export function getInputs(e: cb2.eINPUTS, read: boolean, i2c = eI2C.x22): boolean {
        if (read)
            readInputs(i2c)
        //if (n == btf.eNOT.t)
        return (n_Inputs[0] & e) == e
        //else
        //    return (n_Inputs[0] & e) == 0
    }

    export enum eDH { hell = 1, dunkel = 0 }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Spursensor links %l und rechts %r einlesen %read || I²C %i2c" weight=5
    //% read.shadow="toggleYesNo"
    //% inlineInputMode=inline
    export function readSpursensor(l: eDH, r: eDH, read: boolean, i2c = eI2C.x22) {
        if (read)
            readInputs(i2c)
        return (n_Inputs[0] & 0x03) == (l << 1 | r)
        // return (n_Inputs & 0x03) == (l * 2 + r)
    }



    // ========== group="Ultraschall Sensor" subcategory="Sensoren"
    /* 
        let n_SpurLinksHell = false // hell=true
        let n_SpurRechtsHell = false
    
        let onSpurEventHandler: (links: boolean, rechts: boolean) => void
        let onSpurStopEventHandler: (links: boolean, rechts: boolean, abstand_Stop: boolean) => void
     */
    let onStopEventHandler: (abstand_Stop: boolean, cm: number) => void

    let n_AbstandTimer = input.runningTime()
    let n_AbstandStop = false

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="Abstand cm" weight=4
    export function readUltraschallAbstand() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]))
        return i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1) / 10 // 16 Bit (mm)/10 = cm mit 1 Kommastelle
    }

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="Abstand Ereignis auslösen %on • Stop %stop_cm cm • Start %start_cm cm || • Pause %ms ms" weight=2
    //% on.shadow=toggleOnOff
    //% stop_cm.defl=30
    //% start_cm.defl=35
    //% ms.defl=25
    //% inlineInputMode=inline
    export function raiseAbstandEvent(on: boolean, stop_cm: number, start_cm: number, ms = 25) {
        if (on) {
            let t = input.runningTime() - n_AbstandTimer // ms seit letztem raiseAbstandEvent
            if (t < ms)
                basic.pause(t) // restliche Zeit-Differenz warten
            n_AbstandTimer = input.runningTime()

            let cm = readUltraschallAbstand()

            if (!n_AbstandStop && cm < stop_cm) {
                n_AbstandStop = true
                if (onStopEventHandler)
                    onStopEventHandler(n_AbstandStop, cm)
                //if (onSpurStopEventHandler)
                //    onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
            }
            else if (n_AbstandStop && cm > Math.max(start_cm, stop_cm)) {
                n_AbstandStop = false
                if (onStopEventHandler)
                    onStopEventHandler(n_AbstandStop, cm)
                //if (onSpurStopEventHandler)
                //    onSpurStopEventHandler(n_SpurLinksHell, n_SpurRechtsHell, n_AbstandStop)
            }
        }
    }

    //% group="Ultraschall Sensor" subcategory="Sensoren"
    //% block="wenn Abstand Sensor Ereignis" weight=1
    //% draggableParameters=reporter
    export function onStopEvent(cb: (abstand_Stop: boolean, cm: number) => void) {
        onStopEventHandler = cb
    }



    // ========== group="Calli:bot [1]Typ, [2-5]Version, [6-9]Seriennummer" subcategory="Sensoren"

    //% group="Calli:bot [1]Typ, [2-5]Version, [6-9]Seriennummer" subcategory="Sensoren"
    //% block="Calli:bot Typ %e" weight=4
    export function readTyp(e: eTyp) {
        return readVersionArray()[1] == e
    }

    //% group="Calli:bot [1]Typ, [2-5]Version, [6-9]Seriennummer" subcategory="Sensoren"
    //% block="Calli:bot Typ & FW & SN Array[10]" weight=3
    export function readVersionArray() { // [1]=4:CB2(Gymnasium) =3:CB2E (=2:soll CB2 sein)
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]))
        return i2cReadBuffer(10).toArray(NumberFormat.UInt8LE)
    }

    export enum eTyp {
        //% block="3 Calli:bot 2E"
        cb2e = 3,
        //% block="4 Calli:bot 2A"
        cb2a = 4,
        //% block="2 Calli:bot 2"
        c2 = 2,
        //% block="5"
        c5 = 5
    }



    // ========== group="INPUT analog (ab Typ 3)" subcategory="Sensoren"

    //% group="INPUT analog (ab Typ 3)" subcategory="Sensoren"
    //% block="Batterie Spannung ⅒ Volt" weight=4
    export function readSpannung() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_POWER]))
        return Math.idiv(i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1), 100) // 16 Bit (mV)/100 3V=30 3.15V=31
    }

    //% group="INPUT analog (ab Typ 3)" subcategory="Sensoren"
    //% block="Spursensoren analog [r,l] in mV (UInt16LE)" weight=2
    export function readSpursensorAnalog() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.GET_LINE_SEN_VALUE]))
        return i2cReadBuffer(5).slice(1, 4).toArray(NumberFormat.UInt16LE) // 2 * 16 Bit
    }


} // c-sensoren.ts
