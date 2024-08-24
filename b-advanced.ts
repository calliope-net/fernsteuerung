/* 
,"yotta":{"config":{"microbit-dal":{"bluetooth":{"pairing_mode":1,"partial_flashing":0}}}}
*/
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

    //% blockId=btf_randomBoolean
    //% group="Funktionen" advanced=true
    //% block="randomBoolean" weight=5
    export function btf_randomBoolean() {
        return Math.randomBoolean()
    }


    //% group="Funktionen" advanced=true
    //% block="π" weight=4
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

} // b-advanced.ts
