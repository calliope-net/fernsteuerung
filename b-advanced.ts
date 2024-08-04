
namespace btf { // b-advanced.ts

    // ========== group="Funktionen" advanced=true

    //% blockId=btf_text block="%s" blockHidden=true
    export function btf_text(s: string): string { return s }

    //% group="Funktionen" advanced=true
    //% block="// %text" weight=9
    //% text.shadow="btf_text"
    export function comment(text: any): void { }

    //% group="Funktionen" advanced=true
    //% block="Simulator" weight=7
    export function simulator() {
        return "€".charCodeAt(0) == 8364
    }

    //% group="Funktionen" advanced=true
    //% block="%i0 zwischen %i1 und %i2" weight=6
    export function between(i0: number, i1: number, i2: number): boolean {
        return (i0 >= i1 && i0 <= i2)
    }


    //% group="Funktionen" advanced=true
    //% block="π" weight=5
    export function pi() { return Math.PI }


    //% blockId=btf_motorProzent
    //% group="Funktionen" advanced=true
    //% block="Fahren (1↓128↑255) %value * Prozent %prozent \\%" weight=4
    //% value.min=1 value.max=255 value.defl=128
    //% prozent.min=10 prozent.max=100 prozent.defl=100
    export function btf_motorProzent(value: number, prozent: number) {
        return Math.idiv((value - 128) * prozent, 100) + 128
    }


    //% group="Funktionen" advanced=true
    //% block="mapInt32 %value|from low %fromLow|high %fromHigh|to low %toLow|high %toHigh" weight=3
    //% fromLow.defl=1 fromHigh.defl=255 toLow.defl=-100 toHigh.defl=100
    //% inlineInputMode=inline
    export function mapInt32(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        // return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow
        return Math.idiv(Math.imul(value - fromLow, toHigh - toLow), fromHigh - fromLow) + toLow
    }



    //% blockId=btf_speedPicker
    //% group="speedPicker (-100..0..+100) → (1 ↓ 128 ↑ 255)" advanced=true
    //% block="%speed \\%" weight=4
    //% speed.shadow="speedPicker" speed.defl=0
    export function speedPicker(speed: number) {
        // -100..0..+100 umwandeln in (1 ↓ 128 ↑ 255)
        return mapInt32(speed, -100, 100, 1, 255)
    }

    //% blockId=btf_protractorPicker
    //% group="protractorPicker (0..90..180) → (1 ↖ 16 ↗ 31)" advanced=true
    //% block="%angle °" weight=8
    //% angle.shadow="protractorPicker" angle.defl=90
    export function protractorPicker(angle: number) {
        // 0..90..180 umwandeln in (1 ↖ 16 ↗ 31)
        return mapInt32(angle, 0, 180, 1, 31)
    }



    // blockId=btf_programmPicker
    // group="protractorPicker (0..90..180) → (1 ↖ 16 ↗ 31)" advanced=true
    // block="Motor %motor Servo %servo Zeit %zehntelsekunden" weight=6
    // motor.shadow="btf_speedPicker"
    // servo.shadow="btf_protractorPicker"
    // zehntelsekunden.shadow=btf_zehntelsekunden
    //export function programmPicker(motor: number, servo: number, zehntelsekunden: number) {
    //    return Buffer.fromArray([motor, servo, zehntelsekunden])
    //}


    // blockId=btf_programmSchritt
    // group="protractorPicker (0..90..180) → (1 ↖ 16 ↗ 31)" advanced=true
    // block="Motor (1↓128↑255) %motor Servo (1↖16↗31) %servo Strecke %strecke cm" weight=5
    // motor.min=1 motor.max=255 motor.defl=128
    // servo.min=1 servo.max=31 servo.defl=16
    // strecke.min=10 strecke.max=255 strecke.defl=20
    //export function programmSchritt(motor: number, servo: number, strecke: number) {
    //    return Buffer.fromArray([motor, servo, strecke])
    //}





    // ========== group="Buffer" advanced=true


    //% group="Buffer" advanced=true
    //% block="create Buffer size %size" weight=9
    export function createBuffer(size: number) {
        return Buffer.create(size)
    }

    //% group="Buffer" advanced=true
    //% block="Buffer %buffer getNumber(%format offset %offset)" weight=8
    //% format.defl=NumberFormat.UInt8LE
    //% offset.min=0 offset.max=18
    export function getNumber(buffer: Buffer, format: NumberFormat, offset: number): number {
        return buffer.getNumber(format, offset)
    }

    //% group="Buffer" advanced=true
    //% block="Buffer %buffer setNumber(%format offset %offset value %value)" weight=7
    //% format.defl=NumberFormat.UInt8LE
    //% offset.min=0 offset.max=18
    //% inlineInputMode=inline
    export function setNumber(buffer: Buffer, format: NumberFormat, offset: number, value: number) {
        buffer.setNumber(format, offset, value)
    }

    //% group="Buffer" advanced=true
    //% block="Buffer %buffer offset %offset getBit 2** %exp" weight=4
    //% offset.min=0 offset.max=18
    //% exp.min=0 exp.max=7
    export function getBit(buffer: Buffer, offset: number, exp: number): boolean {
        return (buffer[offset] & 2 ** Math.trunc(exp)) != 0
    }

    //% group="Buffer" advanced=true
    //% block="Buffer %buffer offset %offset setBit 2** %exp %pBit" weight=3
    //% offset.min=0 offset.max=18
    //% exp.min=0 exp.max=7
    //% inlineInputMode=inline
    export function setBit(buffer: Buffer, offset: number, exp: number, bit: boolean) {
        if (bit)
            buffer[offset] | 2 ** Math.trunc(exp)
        else
            buffer[offset] & ~(2 ** Math.trunc(exp))
    }

    //% group="Buffer" advanced=true
    //% block="%bytes .toHex()" weight=1
    export function toHex(bytes: number[]): string {
        return Buffer.fromArray(bytes).toHex()
    }


} // b-advanced.ts
