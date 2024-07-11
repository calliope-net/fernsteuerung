
namespace radio { // advanced.ts

    // ========== group="Funktionen" advanced=true

    //% blockId=radio_text block="%s" blockHidden=true
    export function radio_text(s: string): string { return s }

    //% group="Funktionen" advanced=true
    //% block="// %text" weight=9
    //% text.shadow="radio_text"
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
    //% block="Prozent (1 ↓ 128 ↑ 255) %value * %prozent \\%" weight=5
    //% value.min=1 value.max=255 value.defl=128
    //% prozent.min=10 prozent.max=100 prozent.defl=100
    export function motorProzent(value: number, prozent: number) {
        return Math.idiv((value - 128) * prozent, 100) + 128
    }


    //% group="Funktionen" advanced=true
    //% block="mapInt32 %value|from low %fromLow|high %fromHigh|to low %toLow|high %toHigh" weight=1
    //% fromLow.defl=1 fromHigh.defl=255 toLow.defl=-100 toHigh.defl=100
    //% inlineInputMode=inline
    export function mapInt32(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
        // return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow
        return Math.idiv(Math.imul(value - fromLow, toHigh - toLow), fromHigh - fromLow) + toLow
    }


    //% blockId=radio_speedPicker
    //% group="speedPicker (-100..0..+100) → (1 ↓ 128 ↑ 255)" advanced=true
    //% block="%speed \\%" weight=4
    //% speed.shadow="speedPicker" speed.defl=0
    export function speedPicker(speed: number) {
        // -100..0..+100 umwandeln in (1 ↓ 128 ↑ 255)
        return mapInt32(speed, -100, 100, 1, 255)
    }

    //% blockId=radio_protractorPicker
    //% group="protractorPicker (0..90..180) → (1 ↖ 16 ↗ 31)" advanced=true
    //% block="%angle °" weight=3
    //% angle.shadow="protractorPicker" angle.defl=90
    export function protractorPicker(angle: number) {
        // 0..90..180 umwandeln in (1 ↖ 16 ↗ 31)
        return mapInt32(angle, 0, 180, 1, 31)
    }


    // ========== group="Buffer" advanced=true

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


} // advanced.ts
